import { Prisma } from "@prisma/client";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { cacheGet, cacheInvalidate, cacheSet } from "../templates/cache";
import { EMAIL_CATEGORIES } from "../templates/email/catalog";
import {
  EMAIL_SCHEMA_VERSION, EmailDocument, EmailSchemaError, cloneDocument, compactDocument, normalizeDocument,
} from "../templates/email/core/schema";
import { renderEmailHtml } from "../templates/email/core/renderHtml";
import { estimateEmailHeight, renderThumbnailSvg } from "../templates/email/core/renderThumbnail";

export type EmailTemplateSort = "recommended" | "popular" | "newest" | "trending" | "featured";

export interface EmailTemplateListQuery {
  q?: string;
  category?: string;
  subcategory?: string;
  tag?: string;
  featured?: boolean;
  premium?: boolean;
  favoritesOnly?: boolean;
  sort?: EmailTemplateSort;
  limit?: number;
  cursor?: string;
}

export interface EmailTemplateCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: { slug: string; name: string };
  subcategory: { slug: string; name: string };
  tags: string[];
  width: number;
  height: number;
  orientation: string;
  author: string;
  isFeatured: boolean;
  isPremium: boolean;
  usageCount: number;
  favoriteCount: number;
  isFavorite: boolean;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

const CARD_SELECT = {
  id: true, slug: true, title: true, description: true, categoryId: true, subcategoryId: true, tagList: true,
  width: true, height: true, orientation: true, authorName: true, isFeatured: true, isPremium: true,
  usageCount: true, favoriteCount: true, createdAt: true, updatedAt: true, shuffleKey: true, lastUsedAt: true,
} as const;

type CardRow = Prisma.EmailTemplateGetPayload<{ select: typeof CARD_SELECT }>;

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
const MAX_SEARCH_DEPTH = 2000;
const TAXONOMY_TTL = 10 * 60 * 1000;
const COUNT_TTL = 60 * 1000;
const PREVIEW_RATIO = 1.45;

// Words MySQL's InnoDB full-text index ignores; requiring one would match nothing
const STOPWORDS = new Set(
  "a about an are as at be by com de en for from how i in is it la of on or that the this to was what when where who will with und www".split(" ")
);

interface Taxonomy {
  byId: Map<string, { id: string; slug: string; name: string; parentId: string | null }>;
  bySlug: Map<string, { id: string; slug: string; name: string; parentId: string | null }>;
}

async function taxonomy(): Promise<Taxonomy> {
  const cached = cacheGet<Taxonomy>("email:taxonomy");
  if (cached) return cached;
  const rows = await prisma.emailTemplateCategory.findMany({ select: { id: true, slug: true, name: true, parentId: true } });
  const value: Taxonomy = { byId: new Map(rows.map((r) => [r.id, r])), bySlug: new Map(rows.map((r) => [r.slug, r])) };
  cacheSet("email:taxonomy", value, TAXONOMY_TTL);
  return value;
}

function encodeCursor(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeCursor(cursor?: string): Record<string, unknown> | null {
  if (!cursor) return null;
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    return value && typeof value === "object" ? value : null;
  } catch {
    throw AppError.badRequest("Invalid cursor");
  }
}

/** Turns free text into a boolean-mode query where every word must match as a prefix. */
export function buildFulltextQuery(q: string): string {
  const words = q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .slice(0, 8);
  return words.map((w) => `+${w}*`).join(" ");
}

// Keyset pagination: "sort key first, id as tie-break", both in the same direction so one index serves it
// Tiny LRU for rendered previews so scrolling the library does not re-render them
const previewCache = new Map<string, string>();
function previewGet(key: string): string | undefined {
  const hit = previewCache.get(key);
  if (hit !== undefined) {
    previewCache.delete(key);
    previewCache.set(key, hit);
  }
  return hit;
}
function previewSet(key: string, value: string): void {
  previewCache.set(key, value);
  if (previewCache.size > 600) previewCache.delete(previewCache.keys().next().value as string);
}

/** Library templates store image paths; turn them into absolute URLs for clients and exported HTML. */
export function resolveAssetUrls(json: string, baseUrl: string): string {
  return json.split('"/api/email-assets/').join(`"${baseUrl}/api/email-assets/`);
}

export function parseStoredDocument(templateData: string, baseUrl?: string): EmailDocument {
  try {
    return normalizeDocument(baseUrl ? resolveAssetUrls(templateData, baseUrl) : templateData);
  } catch (err) {
    if (err instanceof EmailSchemaError) throw AppError.internalError("Stored template is not readable");
    throw err;
  }
}

async function toCards(rows: CardRow[], userId?: string): Promise<EmailTemplateCard[]> {
  if (!rows.length) return [];
  const tax = await taxonomy();
  let favorites = new Set<string>();
  if (userId) {
    const favs = await prisma.emailTemplateFavorite.findMany({
      where: { userId, templateId: { in: rows.map((r) => r.id) } },
      select: { templateId: true },
    });
    favorites = new Set(favs.map((f) => f.templateId));
  }
  return rows.map((row) => {
    const category = tax.byId.get(row.categoryId);
    const subcategory = tax.byId.get(row.subcategoryId);
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      category: { slug: category?.slug || "", name: category?.name || "" },
      subcategory: { slug: subcategory?.slug || "", name: subcategory?.name || "" },
      tags: row.tagList ? row.tagList.split(",") : [],
      width: row.width,
      height: row.height,
      orientation: row.orientation,
      author: row.authorName,
      isFeatured: row.isFeatured,
      isPremium: row.isPremium,
      usageCount: row.usageCount,
      favoriteCount: row.favoriteCount,
      isFavorite: favorites.has(row.id),
      thumbnailUrl: `/api/email-templates/${row.id}/thumbnail.svg?v=${row.createdAt.getTime()}`,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

async function buildWhere(query: EmailTemplateListQuery, userId?: string): Promise<Prisma.EmailTemplateWhereInput | null> {
  const tax = await taxonomy();
  const where: Prisma.EmailTemplateWhereInput = { status: "published" };

  if (query.category) {
    const category = tax.bySlug.get(query.category);
    if (!category) return null;
    where.categoryId = category.id;
  }
  if (query.subcategory) {
    const subcategory = tax.bySlug.get(query.subcategory);
    if (!subcategory) return null;
    where.subcategoryId = subcategory.id;
  }
  if (query.featured) where.isFeatured = true;
  if (query.premium !== undefined) where.isPremium = query.premium;
  if (query.tag) {
    const tag = await prisma.emailTemplateTag.findUnique({ where: { slug: query.tag }, select: { id: true } });
    if (!tag) return null;
    where.tags = { some: { tagId: tag.id } };
  }
  if (query.favoritesOnly) {
    if (!userId) throw AppError.unauthorized("Sign in to see your favorites");
    where.favorites = { some: { userId } };
  }
  return where;
}

async function cachedCount(where: Prisma.EmailTemplateWhereInput, cacheable: boolean): Promise<number> {
  const key = `email:count:${JSON.stringify(where)}`;
  if (cacheable) {
    const hit = cacheGet<number>(key);
    if (hit !== null) return hit;
  }
  const total = await prisma.emailTemplate.count({ where });
  if (cacheable) cacheSet(key, total, COUNT_TTL);
  return total;
}

export const emailTemplateService = {
  /** Creates or updates the category tree from the catalogue. Safe to run repeatedly. */
  async ensureTaxonomy(): Promise<void> {
    const seen = new Set<string>();
    for (const [c, category] of EMAIL_CATEGORIES.entries()) {
      for (const slug of [category.slug, ...category.subs.map((s) => s.slug)]) {
        if (seen.has(slug)) throw new Error(`Duplicate email category slug: ${slug}`);
        seen.add(slug);
      }
      const root = await prisma.emailTemplateCategory.upsert({
        where: { slug: category.slug },
        update: { name: category.name, description: category.description, sortOrder: c, parentId: null },
        create: { slug: category.slug, name: category.name, description: category.description, sortOrder: c },
      });
      for (const [s, sub] of category.subs.entries()) {
        await prisma.emailTemplateCategory.upsert({
          where: { slug: sub.slug },
          update: { name: sub.name, sortOrder: s, parentId: root.id },
          create: { slug: sub.slug, name: sub.name, sortOrder: s, parentId: root.id },
        });
      }
    }
    cacheInvalidate("email:");
  },

  async listCategories() {
    const cached = cacheGet<unknown>("email:categories");
    if (cached) return cached;

    const [rows, counts] = await Promise.all([
      prisma.emailTemplateCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.emailTemplate.groupBy({ by: ["subcategoryId"], where: { status: "published" }, _count: { _all: true } }),
    ]);
    const countBySub = new Map(counts.map((c) => [c.subcategoryId, c._count._all]));
    const tree = rows
      .filter((r) => !r.parentId)
      .map((root) => {
        const children = rows
          .filter((r) => r.parentId === root.id)
          .map((child) => ({ slug: child.slug, name: child.name, count: countBySub.get(child.id) || 0 }));
        return {
          slug: root.slug,
          name: root.name,
          description: root.description,
          count: children.reduce((sum, child) => sum + child.count, 0),
          children,
        };
      });
    cacheSet("email:categories", tree, TAXONOMY_TTL);
    return tree;
  },

  /** Refreshes each tag's stored template count. Run after templates are added or removed. */
  async refreshTagCounts(): Promise<void> {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE email_template_tags g
      LEFT JOIN (SELECT tagId, COUNT(*) AS uses FROM email_template_tag_links GROUP BY tagId) c ON c.tagId = g.id
      SET g.templateCount = COALESCE(c.uses, 0)`);
    cacheInvalidate("email:");
  },

  /** Most-used tags, for the library's tag filter. */
  async popularTags(limit = 40) {
    const cached = cacheGet<unknown>("email:tags");
    if (cached) return cached;
    const rows = await prisma.emailTemplateTag.findMany({
      where: { templateCount: { gt: 0 } },
      orderBy: { templateCount: "desc" },
      take: limit,
      select: { slug: true, name: true, templateCount: true },
    });
    const tags = rows.map((r) => ({ slug: r.slug, name: r.name, count: r.templateCount }));
    cacheSet("email:tags", tags, TAXONOMY_TTL);
    return tags;
  },

  async list(query: EmailTemplateListQuery, userId?: string) {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(query.limit || DEFAULT_LIMIT)));
    const where = await buildWhere(query, userId);
    if (!where) return { items: [], nextCursor: null, total: 0 };

    const q = (query.q || "").trim().slice(0, 120);
    if (q) return this.search(q, query, where, limit, userId);

    const sort: EmailTemplateSort = query.sort || "recommended";
    const cursor = decodeCursor(query.cursor);
    const paged: Prisma.EmailTemplateWhereInput = { ...where };
    let orderBy: Prisma.EmailTemplateOrderByWithRelationInput[];

    // Keyset pagination: each sort walks an index, so page 2,000 costs the same as page 1
    if (sort === "popular") {
      orderBy = [{ usageCount: "desc" }, { id: "desc" }];
      if (cursor) paged.OR = [{ usageCount: { lt: Number(cursor.k) } }, { usageCount: Number(cursor.k), id: { lt: String(cursor.id) } }];
    } else if (sort === "newest") {
      orderBy = [{ createdAt: "desc" }, { id: "desc" }];
      if (cursor) {
        const at = new Date(String(cursor.k));
        paged.OR = [{ createdAt: { lt: at } }, { createdAt: at, id: { lt: String(cursor.id) } }];
      }
    } else if (sort === "trending") {
      paged.lastUsedAt = { not: null };
      orderBy = [{ lastUsedAt: "desc" }, { id: "desc" }];
      if (cursor) {
        const at = new Date(String(cursor.k));
        paged.OR = [{ lastUsedAt: { lt: at } }, { lastUsedAt: at, id: { lt: String(cursor.id) } }];
      }
    } else {
      if (sort === "featured") paged.isFeatured = true;
      orderBy = [{ shuffleKey: "asc" }, { id: "asc" }];
      if (cursor) paged.OR = [{ shuffleKey: { gt: Number(cursor.k) } }, { shuffleKey: Number(cursor.k), id: { gt: String(cursor.id) } }];
    }

    const countWhere = { ...paged };
    delete countWhere.OR;
    const [rows, total] = await Promise.all([
      prisma.emailTemplate.findMany({ where: paged, orderBy, take: limit + 1, select: CARD_SELECT }),
      cachedCount(countWhere, !query.favoritesOnly),
    ]);

    const page = rows.slice(0, limit);
    const last = page[page.length - 1];
    let nextCursor: string | null = null;
    if (rows.length > limit && last) {
      const key =
        sort === "popular" ? last.usageCount
        : sort === "newest" ? last.createdAt.toISOString()
        : sort === "trending" ? last.lastUsedAt!.toISOString()
        : last.shuffleKey;
      nextCursor = encodeCursor({ k: key, id: last.id });
    }
    return { items: await toCards(page, userId), nextCursor, total };
  },

  /** Relevance-ranked full-text search over title, description, category, tags and keywords. */
  async search(
    q: string,
    query: EmailTemplateListQuery,
    where: Prisma.EmailTemplateWhereInput,
    limit: number,
    userId?: string
  ) {
    const fulltext = buildFulltextQuery(q);
    if (!fulltext) return { items: [], nextCursor: null, total: 0 };

    const offset = Math.max(0, Math.floor(Number(decodeCursor(query.cursor)?.o) || 0));
    if (offset >= MAX_SEARCH_DEPTH) return { items: [], nextCursor: null, total: 0 };

    const filters: Prisma.Sql[] = [Prisma.sql`t.status = 'published'`];
    if (typeof where.categoryId === "string") filters.push(Prisma.sql`t.categoryId = ${where.categoryId}`);
    if (typeof where.subcategoryId === "string") filters.push(Prisma.sql`t.subcategoryId = ${where.subcategoryId}`);
    if (where.isFeatured === true) filters.push(Prisma.sql`t.isFeatured = 1`);
    if (typeof where.isPremium === "boolean") filters.push(Prisma.sql`t.isPremium = ${where.isPremium ? 1 : 0}`);
    if (query.tag) {
      filters.push(Prisma.sql`EXISTS (SELECT 1 FROM email_template_tag_links l JOIN email_template_tags g ON g.id = l.tagId WHERE l.templateId = t.id AND g.slug = ${query.tag})`);
    }
    if (query.favoritesOnly && userId) {
      filters.push(Prisma.sql`EXISTS (SELECT 1 FROM email_template_favorites f WHERE f.templateId = t.id AND f.userId = ${userId})`);
    }
    const match = Prisma.sql`MATCH(t.title, t.description, t.keywords) AGAINST (${fulltext} IN BOOLEAN MODE)`;
    const condition = Prisma.sql`${match} AND ${Prisma.join(filters, " AND ")}`;

    const [hits, counted] = await Promise.all([
      prisma.$queryRaw<{ id: string }[]>(
        Prisma.sql`SELECT t.id FROM email_templates t WHERE ${condition} ORDER BY ${match} DESC, t.usageCount DESC, t.shuffleKey ASC LIMIT ${limit + 1} OFFSET ${offset}`
      ),
      prisma.$queryRaw<{ total: bigint }[]>(Prisma.sql`SELECT COUNT(*) AS total FROM email_templates t WHERE ${condition}`),
    ]);

    const ids = hits.slice(0, limit).map((h) => h.id);
    const rows = ids.length ? await prisma.emailTemplate.findMany({ where: { id: { in: ids } }, select: CARD_SELECT }) : [];
    const order = new Map(ids.map((id, i) => [id, i]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return {
      items: await toCards(rows, userId),
      nextCursor: hits.length > limit ? encodeCursor({ o: offset + limit }) : null,
      total: Number(counted[0]?.total || 0),
    };
  },

  /** Library templates the user has opened most recently. */
  async recentlyUsed(userId: string, limit = 12) {
    const used = await prisma.userEmailTemplate.findMany({
      where: { userId, sourceTemplateId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { sourceTemplateId: true },
      take: 100,
    });
    const ids = [...new Set(used.map((u) => u.sourceTemplateId as string))].slice(0, limit);
    if (!ids.length) return [];
    const rows = await prisma.emailTemplate.findMany({ where: { id: { in: ids }, status: "published" }, select: CARD_SELECT });
    const order = new Map(ids.map((id, i) => [id, i]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return toCards(rows, userId);
  },

  async get(idOrSlug: string, baseUrl: string, userId?: string) {
    const row = await prisma.emailTemplate.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: "published" },
      select: { ...CARD_SELECT, schemaVersion: true, content: { select: { templateData: true } } },
    });
    if (!row || !row.content) throw AppError.notFound("Template not found");

    prisma.emailTemplate.update({ where: { id: row.id }, data: { viewCount: { increment: 1 } }, select: { id: true } }).catch(() => undefined);

    const document = parseStoredDocument(row.content.templateData, baseUrl);
    const [card] = await toCards([row], userId);
    return { ...card, schemaVersion: row.schemaVersion, templateData: document, html: renderEmailHtml(document, { title: row.title }) };
  },

  /** SVG preview drawn from the template's own data. */
  async thumbnail(id: string): Promise<string> {
    // A library template's document never changes after it is published, so the id alone identifies its preview
    const hit = previewGet(id);
    if (hit) return hit;
    const row = await prisma.emailTemplateContent.findUnique({ where: { templateId: id }, select: { templateData: true } });
    if (!row) throw AppError.notFound("Template not found");
    const key = id;
    const svg = renderThumbnailSvg(parseStoredDocument(row.templateData), { maxRatio: PREVIEW_RATIO });
    previewSet(key, svg);
    return svg;
  },

  /**
   * "Use this template": the library original is never touched. Its document
   * is cloned (with fresh ids) into a design owned by the user.
   */
  async use(id: string, userId: string, baseUrl: string) {
    const source = await prisma.emailTemplate.findFirst({
      where: { id, status: "published" },
      select: { id: true, title: true, width: true, content: { select: { templateData: true } } },
    });
    if (!source || !source.content) throw AppError.notFound("Template not found");

    const document = cloneDocument(parseStoredDocument(source.content.templateData, baseUrl));
    const [created] = await prisma.$transaction([
      prisma.userEmailTemplate.create({
        data: {
          userId,
          name: source.title.split(":")[0].slice(0, 120),
          sourceTemplateId: source.id,
          templateData: JSON.stringify(compactDocument(document)),
          html: renderEmailHtml(document, { title: source.title }),
          thumbnailSvg: renderThumbnailSvg(document, { maxRatio: PREVIEW_RATIO }),
          schemaVersion: EMAIL_SCHEMA_VERSION,
          width: source.width,
          height: estimateEmailHeight(document),
        },
        select: { id: true, name: true },
      }),
      prisma.emailTemplate.update({
        where: { id: source.id },
        data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
        select: { id: true },
      }),
    ]);
    return { designId: created.id, name: created.name, sourceTemplateId: source.id, templateData: document };
  },

  async setFavorite(id: string, userId: string, favorite: boolean) {
    const template = await prisma.emailTemplate.findFirst({ where: { id, status: "published" }, select: { id: true } });
    if (!template) throw AppError.notFound("Template not found");

    const existing = await prisma.emailTemplateFavorite.findUnique({
      where: { userId_templateId: { userId, templateId: id } },
      select: { userId: true },
    });

    if (favorite && !existing) {
      await prisma.$transaction([
        prisma.emailTemplateFavorite.create({ data: { userId, templateId: id } }),
        prisma.emailTemplate.update({ where: { id }, data: { favoriteCount: { increment: 1 } }, select: { id: true } }),
      ]);
    } else if (!favorite && existing) {
      await prisma.$transaction([
        prisma.emailTemplateFavorite.delete({ where: { userId_templateId: { userId, templateId: id } } }),
        prisma.emailTemplate.updateMany({ where: { id, favoriteCount: { gt: 0 } }, data: { favoriteCount: { decrement: 1 } } }),
      ]);
    }
    const current = await prisma.emailTemplate.findUnique({ where: { id }, select: { favoriteCount: true } });
    return { id, isFavorite: favorite, favoriteCount: current?.favoriteCount || 0 };
  },
};
