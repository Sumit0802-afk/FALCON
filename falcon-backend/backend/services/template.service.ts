import { Prisma } from "@prisma/client";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import {
  TemplateCardDTO,
  TemplateDetailDTO,
  TEMPLATE_LIST_SELECT,
  TemplateListQuery,
  TemplateSort,
} from "../models/template.model";
import { cacheGet, cacheSet, cacheInvalidate } from "../templates/cache";
import { cloneTemplatePage, collectAssetRefs, TemplatePageData } from "../templates/clone";
import { parseDesignData } from "../templates/validate";
import {
  CATEGORY_TREE,
  TEMPLATE_INDUSTRIES,
  TEMPLATE_STYLES,
  slugify,
} from "../templates/catalog";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 48;

type ListedTemplate = Prisma.DesignTemplateGetPayload<{
  select: typeof TEMPLATE_LIST_SELECT;
}>;

function encodeCursor(payload: Record<string, string | number | boolean>): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor?: string): Record<string, string | number | boolean> | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function toCard(row: ListedTemplate, favoriteIds: Set<string>): TemplateCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category.name,
    categorySlug: row.category.slug,
    subcategory: row.subcategory.name,
    subcategorySlug: row.subcategory.slug,
    tags: row.tags.map((t) => t.tag.name),
    style: row.style,
    industry: row.industry,
    audience: row.audience,
    platform: row.platform,
    orientation: row.orientation,
    width: row.width,
    height: row.height,
    colorFamily: row.colorFamily,
    theme: row.theme,
    language: row.language,
    thumbnailUrl: row.thumbnailUrl,
    previewUrl: row.previewUrl,
    featured: row.featured,
    status: row.status,
    usageCount: row.usageCount,
    favoriteCount: row.favoriteCount,
    viewCount: row.viewCount,
    isFavorite: favoriteIds.has(row.id),
    createdAt: row.createdAt.toISOString(),
  };
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

const STOP = new Set(["the", "and", "for", "with", "from", "that", "this"]);

function interpretQuery(q: string) {
  const tokens = tokenize(q).filter((t) => !STOP.has(t));
  const facets: {
    style?: string;
    industry?: string;
    categorySlug?: string;
    subcategorySlug?: string;
    platform?: string;
  } = {};
  const leftover: string[] = [];

  const styles = TEMPLATE_STYLES.map((s) => s.toLowerCase());
  const industries = TEMPLATE_INDUSTRIES.map((s) => s.toLowerCase());

  for (const token of tokens) {
    const style = TEMPLATE_STYLES.find((s) => s.toLowerCase() === token || s.toLowerCase().includes(token));
    const industry = TEMPLATE_INDUSTRIES.find(
      (s) => s.toLowerCase() === token || s.toLowerCase().includes(token)
    );
    let matched = false;
    if (style && styles.includes(style.toLowerCase()) && token.length >= 4) {
      facets.style = style;
      matched = true;
    }
    if (industry && industries.includes(industry.toLowerCase()) && token.length >= 4) {
      facets.industry = industry;
      matched = true;
    }
    for (const cat of CATEGORY_TREE) {
      if (cat.slug === token || cat.name.toLowerCase() === token) {
        facets.categorySlug = cat.slug;
        matched = true;
      }
      for (const child of cat.children) {
        if (child.slug === token || child.name.toLowerCase() === token) {
          facets.subcategorySlug = child.slug;
          matched = true;
        }
        if (
          child.platform.toLowerCase() === token ||
          (token.length >= 5 && child.platform.toLowerCase().includes(token))
        ) {
          facets.platform = child.platform;
          matched = true;
        }
      }
    }
    if (!matched) leftover.push(token);
  }

  return { facets, leftover, tokens };
}

function buildSearchDocument(input: {
  name: string;
  description: string;
  tags: string[];
  category: string;
  subcategory: string;
  style: string;
  industry: string;
  platform: string;
  audience: string;
  theme: string;
  orientation: string;
}): string {
  return [
    input.name,
    input.description,
    ...input.tags,
    input.category,
    input.subcategory,
    input.style,
    input.industry,
    input.platform,
    input.audience,
    input.theme,
    input.orientation,
  ]
    .join(" ")
    .toLowerCase();
}

async function favoriteSet(userId: string | undefined, ids: string[]): Promise<Set<string>> {
  if (!userId || ids.length === 0) return new Set();
  const rows = await prisma.templateFavorite.findMany({
    where: { userId, templateId: { in: ids } },
    select: { templateId: true },
  });
  return new Set(rows.map((r) => r.templateId));
}

function sortOrder(sort: TemplateSort): Prisma.DesignTemplateOrderByWithRelationInput[] {
  switch (sort) {
    case "popular":
    case "most-used":
      return [{ usageCount: "desc" }, { id: "desc" }];
    case "trending":
      return [{ viewCount: "desc" }, { usageCount: "desc" }, { id: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }, { id: "desc" }];
    case "featured":
      return [{ featured: "desc" }, { createdAt: "desc" }, { id: "desc" }];
    default:
      return [{ featured: "desc" }, { usageCount: "desc" }, { createdAt: "desc" }, { id: "desc" }];
  }
}

function cursorWhere(sort: TemplateSort, cursor: Record<string, string | number | boolean> | null) {
  if (!cursor?.id) return {};
  const id = String(cursor.id);
  if (sort === "newest") {
    const createdAt = new Date(String(cursor.v));
    return {
      OR: [
        { createdAt: { lt: createdAt } },
        { AND: [{ createdAt }, { id: { lt: id } }] },
      ],
    };
  }
  if (sort === "popular" || sort === "most-used") {
    const usageCount = Number(cursor.v);
    return {
      OR: [
        { usageCount: { lt: usageCount } },
        { AND: [{ usageCount }, { id: { lt: id } }] },
      ],
    };
  }
  if (sort === "trending") {
    const viewCount = Number(cursor.v);
    return {
      OR: [
        { viewCount: { lt: viewCount } },
        { AND: [{ viewCount }, { id: { lt: id } }] },
      ],
    };
  }
  return { id: { lt: id } };
}

function nextCursor(sort: TemplateSort, row: ListedTemplate): string {
  if (sort === "newest") return encodeCursor({ v: row.createdAt.toISOString(), id: row.id });
  if (sort === "popular" || sort === "most-used") return encodeCursor({ v: row.usageCount, id: row.id });
  if (sort === "trending") return encodeCursor({ v: row.viewCount, id: row.id });
  return encodeCursor({ id: row.id });
}

export const templateService = {
  buildSearchDocument,

  async ensureTaxonomy() {
    const cached = cacheGet<boolean>("taxonomy:ready");
    if (cached) return;

    for (const [catIndex, category] of CATEGORY_TREE.entries()) {
      const parent = await prisma.templateCategory.upsert({
        where: { slug: category.slug },
        update: { name: category.name, description: category.description, sortOrder: catIndex },
        create: {
          slug: category.slug,
          name: category.name,
          description: category.description,
          sortOrder: catIndex,
        },
      });
      for (const [childIndex, child] of category.children.entries()) {
        await prisma.templateCategory.upsert({
          where: { slug: child.slug },
          update: { name: child.name, parentId: parent.id, sortOrder: childIndex },
          create: {
            slug: child.slug,
            name: child.name,
            parentId: parent.id,
            sortOrder: childIndex,
          },
        });
      }
    }
    cacheSet("taxonomy:ready", true, 10 * 60 * 1000);
  },

  async listCategories() {
    const cached = cacheGet<unknown>("categories:tree");
    if (cached) return cached;
    await this.ensureTaxonomy();
    const roots = await prisma.templateCategory.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
      },
    });
    const counts = await prisma.designTemplate.groupBy({
      by: ["categoryId", "subcategoryId"],
      where: { status: "published" },
      _count: { _all: true },
    });
    const countByCat = new Map<string, number>();
    const countBySub = new Map<string, number>();
    for (const row of counts) {
      countByCat.set(row.categoryId, (countByCat.get(row.categoryId) || 0) + row._count._all);
      countBySub.set(row.subcategoryId, (countBySub.get(row.subcategoryId) || 0) + row._count._all);
    }
    const tree = roots.map((root) => ({
      id: root.id,
      slug: root.slug,
      name: root.name,
      description: root.description,
      count: countByCat.get(root.id) || 0,
      children: root.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        name: child.name,
        count: countBySub.get(child.id) || 0,
      })),
    }));
    cacheSet("categories:tree", tree, 60 * 1000);
    return tree;
  },

  async list(query: TemplateListQuery, userId?: string) {
    const sort: TemplateSort = query.sort || "recommended";
    const limit = Math.min(Math.max(query.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const cursor = decodeCursor(query.cursor);
    const interpreted = query.q ? interpretQuery(query.q) : null;

    const where: Prisma.DesignTemplateWhereInput = {};
    if (query.status && query.status !== "all") {
      where.status = query.status;
    } else if (query.status !== "all") {
      where.status = "published";
    }

    const categorySlug = query.category || interpreted?.facets.categorySlug;
    const subcategorySlug = query.subcategory || interpreted?.facets.subcategorySlug;
    const style = query.style || interpreted?.facets.style;
    const industry = query.industry || interpreted?.facets.industry;
    const platform = query.platform || interpreted?.facets.platform;

    if (categorySlug) where.category = { slug: categorySlug };
    if (subcategorySlug) where.subcategory = { slug: subcategorySlug };
    if (style) where.style = style;
    if (industry) where.industry = industry;
    if (platform) where.platform = platform;
    if (query.orientation) where.orientation = query.orientation;
    if (query.audience) where.audience = query.audience;
    if (query.colorFamily) where.colorFamily = query.colorFamily;
    if (query.theme) where.theme = { contains: query.theme };
    if (query.language) where.language = query.language;
    if (query.featured) where.featured = true;
    if (query.tag) {
      where.tags = { some: { tag: { slug: slugify(query.tag) } } };
    }
    if (query.favoritesOnly && userId) {
      where.favorites = { some: { userId } };
    }

    const leftover = interpreted?.leftover || [];
    if (leftover.length) {
      where.AND = leftover.map((token) => ({
        searchDocument: { contains: token },
      }));
    } else if (query.q && !interpreted?.facets.style && !interpreted?.facets.industry && !interpreted?.facets.subcategorySlug) {
      where.searchDocument = { contains: query.q.toLowerCase() };
    }

    const cursorFilter = cursorWhere(sort, cursor);
    const pagedWhere: Prisma.DesignTemplateWhereInput = {
      AND: [where, cursorFilter].filter((part) => Object.keys(part).length > 0),
    };

    const [rows, total] = await Promise.all([
      prisma.designTemplate.findMany({
        where: pagedWhere,
        select: TEMPLATE_LIST_SELECT,
        orderBy: sortOrder(sort),
        take: limit + 1,
      }),
      prisma.designTemplate.count({ where }),
    ]);

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const favs = await favoriteSet(userId, page.map((r) => r.id));
    const items = page.map((row) => toCard(row, favs));

    return {
      items,
      nextCursor: hasMore ? nextCursor(sort, page[page.length - 1]) : null,
      total,
      limit,
    };
  },

  async get(idOrSlug: string, userId?: string, includeDesign = false): Promise<TemplateDetailDTO> {
    const row = await prisma.designTemplate.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      select: {
        ...TEMPLATE_LIST_SELECT,
        design: includeDesign ? { select: { designData: true } } : false,
      },
    });
    if (!row) throw AppError.notFound("Template not found");
    if (row.status !== "published") {
      throw AppError.notFound("Template not found");
    }

    const favs = await favoriteSet(userId, [row.id]);
    const card = toCard(row as ListedTemplate, favs);
    const related = await this.related(row.id, userId);

    if (includeDesign) {
      void prisma.designTemplate
        .update({ where: { id: row.id }, data: { viewCount: { increment: 1 } } })
        .catch(() => undefined);
    }

    const designData =
      includeDesign && "design" in row && row.design
        ? parseDesignData(row.design.designData)
        : undefined;

    return { ...card, designData, related };
  },

  async related(templateId: string, userId?: string): Promise<TemplateCardDTO[]> {
    const source = await prisma.designTemplate.findUnique({
      where: { id: templateId },
      include: { tags: { include: { tag: true } } },
    });
    if (!source) return [];
    const tagIds = source.tags.map((t) => t.tagId);
    const rows = await prisma.designTemplate.findMany({
      where: {
        status: "published",
        id: { not: templateId },
        OR: [
          { subcategoryId: source.subcategoryId },
          { categoryId: source.categoryId, style: source.style },
          { industry: source.industry, style: source.style },
          tagIds.length ? { tags: { some: { tagId: { in: tagIds } } } } : undefined,
          { width: source.width, height: source.height, categoryId: source.categoryId },
        ].filter(Boolean) as Prisma.DesignTemplateWhereInput[],
      },
      select: TEMPLATE_LIST_SELECT,
      take: 8,
      orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
    });
    const favs = await favoriteSet(userId, rows.map((r) => r.id));
    return rows.map((row) => toCard(row, favs));
  },

  async use(templateId: string, userId: string) {
    if (!userId) throw AppError.unauthorized();
    const template = await prisma.designTemplate.findFirst({
      where: {
        OR: [{ id: templateId }, { slug: templateId }],
        status: "published",
      },
      include: { design: true, category: true, subcategory: true },
    });
    if (!template?.design) throw AppError.notFound("Template not found");

    const page = cloneTemplatePage(parseDesignData(template.design.designData));
    const project = await prisma.project.create({
      data: {
        title: template.name,
        ownerId: userId,
        thumbnailUrl: template.thumbnailUrl,
        pages: {
          create: [
            {
              name: page.name,
              width: page.size.width,
              height: page.size.height,
              presetName: page.size.name || template.subcategory.name,
              background: page.background,
              elements: JSON.stringify(page.elements),
              order: 0,
            },
          ],
        },
      },
      include: { pages: true },
    });

    void prisma.designTemplate
      .update({
        where: { id: template.id },
        data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
      })
      .catch(() => undefined);

    return { project, templateId: template.id };
  },

  async toggleFavorite(templateId: string, userId: string, favorite: boolean) {
    const template = await prisma.designTemplate.findFirst({
      where: { OR: [{ id: templateId }, { slug: templateId }], status: "published" },
      select: { id: true },
    });
    if (!template) throw AppError.notFound("Template not found");

    if (favorite) {
      await prisma.templateFavorite.upsert({
        where: { userId_templateId: { userId, templateId: template.id } },
        update: {},
        create: { userId, templateId: template.id },
      });
    } else {
      await prisma.templateFavorite.deleteMany({
        where: { userId, templateId: template.id },
      });
    }

    const count = await prisma.templateFavorite.count({ where: { templateId: template.id } });
    await prisma.designTemplate.update({
      where: { id: template.id },
      data: { favoriteCount: count },
    });
    return { templateId: template.id, favorite };
  },

  async adminGet(id: string) {
    const row = await prisma.designTemplate.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        tags: { include: { tag: true } },
        design: true,
      },
    });
    if (!row) throw AppError.notFound("Template not found");
    return row;
  },

  async adminUpdate(id: string, input: Record<string, unknown>) {
    const existing = await prisma.designTemplate.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Template not found");

    const data: Prisma.DesignTemplateUpdateInput = {};
    const scalarKeys = [
      "name",
      "description",
      "style",
      "industry",
      "audience",
      "platform",
      "orientation",
      "colorFamily",
      "theme",
      "language",
      "thumbnailUrl",
      "previewUrl",
    ] as const;
    for (const key of scalarKeys) {
      if (input[key] !== undefined) (data as Record<string, unknown>)[key] = input[key];
    }
    if (typeof input.featured === "boolean") data.featured = input.featured;
    if (typeof input.width === "number") data.width = input.width;
    if (typeof input.height === "number") data.height = input.height;
    if (input.status === "published" || input.status === "draft" || input.status === "archived") {
      data.status = input.status;
      data.publishedAt = input.status === "published" ? new Date() : existing.publishedAt;
    }
    if (typeof input.categorySlug === "string") {
      const category = await prisma.templateCategory.findUnique({ where: { slug: input.categorySlug } });
      if (!category) throw AppError.badRequest("Unknown category");
      data.category = { connect: { id: category.id } };
    }
    if (typeof input.subcategorySlug === "string") {
      const subcategory = await prisma.templateCategory.findUnique({ where: { slug: input.subcategorySlug } });
      if (!subcategory) throw AppError.badRequest("Unknown subcategory");
      data.subcategory = { connect: { id: subcategory.id } };
    }

    if (input.designData) {
      const page = parseDesignData(input.designData);
      await prisma.templateDesign.update({
        where: { templateId: id },
        data: {
          designData: JSON.stringify(page),
          assetRefs: JSON.stringify(collectAssetRefs(page)),
        },
      });
      data.width = page.size.width;
      data.height = page.size.height;
    }

    const updated = await prisma.designTemplate.update({
      where: { id },
      data,
      include: { category: true, subcategory: true, tags: { include: { tag: true } } },
    });

    const searchDocument = buildSearchDocument({
      name: updated.name,
      description: updated.description,
      tags: updated.tags.map((t) => t.tag.name),
      category: updated.category.name,
      subcategory: updated.subcategory.name,
      style: updated.style,
      industry: updated.industry,
      platform: updated.platform,
      audience: updated.audience,
      theme: updated.theme,
      orientation: updated.orientation,
    });
    await prisma.designTemplate.update({ where: { id }, data: { searchDocument } });
    cacheInvalidate("categories");
    return updated;
  },

  async adminDelete(id: string) {
    await prisma.designTemplate.delete({ where: { id } });
    cacheInvalidate("categories");
  },

  async bulk(ids: string[], action: string, extra: Record<string, unknown> = {}) {
    if (!ids.length) throw AppError.badRequest("ids are required");
    if (ids.length > 2000) throw AppError.badRequest("Bulk operations are limited to 2000 templates");

    if (action === "delete") {
      const result = await prisma.designTemplate.deleteMany({ where: { id: { in: ids } } });
      cacheInvalidate("categories");
      return { updated: result.count };
    }
    if (action === "publish") {
      const result = await prisma.designTemplate.updateMany({
        where: { id: { in: ids } },
        data: { status: "published", publishedAt: new Date() },
      });
      cacheInvalidate("categories");
      return { updated: result.count };
    }
    if (action === "unpublish") {
      const result = await prisma.designTemplate.updateMany({
        where: { id: { in: ids } },
        data: { status: "draft" },
      });
      cacheInvalidate("categories");
      return { updated: result.count };
    }
    if (action === "feature" || action === "unfeature") {
      const result = await prisma.designTemplate.updateMany({
        where: { id: { in: ids } },
        data: { featured: action === "feature" },
      });
      return { updated: result.count };
    }
    if (action === "categorize") {
      const slug = String(extra.categorySlug || "");
      const sub = String(extra.subcategorySlug || "");
      const category = await prisma.templateCategory.findUnique({ where: { slug } });
      const subcategory = await prisma.templateCategory.findUnique({ where: { slug: sub } });
      if (!category || !subcategory) throw AppError.badRequest("Valid categorySlug and subcategorySlug are required");
      const result = await prisma.designTemplate.updateMany({
        where: { id: { in: ids } },
        data: { categoryId: category.id, subcategoryId: subcategory.id },
      });
      cacheInvalidate("categories");
      return { updated: result.count };
    }
    if (action === "tag") {
      const names = Array.isArray(extra.tags) ? extra.tags.map(String) : [];
      for (const name of names) {
        const tag = await prisma.templateTag.upsert({
          where: { slug: slugify(name) },
          update: { name },
          create: { slug: slugify(name), name },
        });
        for (const templateId of ids) {
          await prisma.templateTagOnTemplate.upsert({
            where: { templateId_tagId: { templateId, tagId: tag.id } },
            update: {},
            create: { templateId, tagId: tag.id },
          });
        }
      }
      return { updated: ids.length };
    }
    throw AppError.badRequest("Unknown bulk action");
  },
};
