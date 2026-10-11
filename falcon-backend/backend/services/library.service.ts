import { Prisma } from "@prisma/client";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { ID_PREFIX, LibraryType, buildTemplate, parseTemplateId } from "../templates/library/generate";
import { renderPageSvg } from "../templates/library/thumbnail";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 48;
/** Search results are paged by position; this is as deep as paging goes */
const MAX_SEARCH_OFFSET = 960;

const CARD_SELECT = {
  id: true, type: true, title: true, description: true, category: true, categoryName: true, subcategory: true,
  subcategoryName: true, style: true, styleName: true, industry: true, colorFamily: true, mode: true, orientation: true,
  width: true, height: true, sizeId: true, sizeName: true, slideCount: true, aspect: true, palette: true, fonts: true,
  isFeatured: true, usageCount: true, favoriteCount: true, author: true, createdAt: true, updatedAt: true,
} as const;

type CardRow = Prisma.LibraryTemplateGetPayload<{ select: typeof CARD_SELECT }>;

export interface LibraryQuery {
  type: LibraryType;
  q?: string;
  category?: string;
  subcategory?: string;
  style?: string;
  industry?: string;
  color?: string;
  size?: string;
  orientation?: string;
  aspect?: string;
  /** A slide count, or "25+" */
  slides?: string;
  featured?: boolean;
  favorites?: boolean;
  sort?: "recommended" | "popular" | "newest";
  cursor?: string;
  limit?: number;
}

// ─── Small caches: the library changes only when it is re-seeded ─────────────

const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await load();
  if (cache.size > 500) cache.clear();
  cache.set(key, { at: Date.now(), value });
  return value;
}

const svgCache = new Map<string, string>();

// ─── Search ───────────────────────────────────────────────────────────────────

/** Words MySQL's full-text index ignores; requiring one of them would match nothing */
const STOPWORDS = new Set(["a", "about", "an", "and", "are", "as", "at", "be", "by", "com", "de", "en", "for", "from", "how", "i", "in", "is", "it", "la", "of", "on", "or", "that", "the", "this", "to", "was", "what", "when", "where", "who", "will", "with", "und", "www", "template", "templates", "design",
  // The kind of template is chosen with the tabs, so these words narrow nothing
  "poster", "posters", "presentation", "presentations", "deck", "decks", "slide", "slides", "ppt", "pptx", "certificate", "certificates"]);

/** Counting stops here: beyond it the exact number adds nothing for the user */
const COUNT_CAP = 1000;

/** Short or informal terms, rewritten to words the index does hold */
const SYNONYMS: Record<string, string[]> = {
  ai: ["artificial", "intelligence"], ml: ["machine", "learning"], insta: ["instagram"],
  ig: ["instagram"], yt: ["youtube"], uni: ["university"], hiring: ["hiring"], cyber: ["cybersecurity"],
  tech: ["technology"], dev: ["developer"], fest: ["fest"], coding: ["coding"],
};

function searchTerms(q: string): string[] {
  const words = q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, 8);
  const terms: string[] = [];
  for (const word of words) {
    for (const term of SYNONYMS[word] ?? [word]) {
      if (term.length >= 3 && !STOPWORDS.has(term) && !terms.includes(term)) terms.push(term);
    }
  }
  return terms;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

function whereFor(query: LibraryQuery): Prisma.LibraryTemplateWhereInput {
  const where: Prisma.LibraryTemplateWhereInput = { type: query.type };
  if (query.category) where.category = query.category;
  if (query.subcategory) where.subcategory = query.subcategory;
  if (query.style) where.style = query.style;
  if (query.industry) where.industry = query.industry;
  if (query.color) where.colorFamily = query.color;
  if (query.size) where.sizeId = query.size;
  if (query.orientation) where.orientation = query.orientation;
  if (query.aspect) where.aspect = query.aspect;
  if (query.featured) where.isFeatured = true;
  if (query.slides) {
    if (query.slides.endsWith("+")) where.slideCount = { gte: Number(query.slides.slice(0, -1)) || 25 };
    else if (Number(query.slides) > 0) where.slideCount = Number(query.slides);
  }
  return where;
}

/** The same filters as SQL, for the full-text query */
function sqlFilters(query: LibraryQuery): Prisma.Sql[] {
  const parts: Prisma.Sql[] = [Prisma.sql`t.type = ${query.type}`];
  if (query.category) parts.push(Prisma.sql`t.category = ${query.category}`);
  if (query.subcategory) parts.push(Prisma.sql`t.subcategory = ${query.subcategory}`);
  if (query.style) parts.push(Prisma.sql`t.style = ${query.style}`);
  if (query.industry) parts.push(Prisma.sql`t.industry = ${query.industry}`);
  if (query.color) parts.push(Prisma.sql`t.colorFamily = ${query.color}`);
  if (query.size) parts.push(Prisma.sql`t.sizeId = ${query.size}`);
  if (query.orientation) parts.push(Prisma.sql`t.orientation = ${query.orientation}`);
  if (query.aspect) parts.push(Prisma.sql`t.aspect = ${query.aspect}`);
  if (query.featured) parts.push(Prisma.sql`t.isFeatured = 1`);
  if (query.slides) {
    if (query.slides.endsWith("+")) parts.push(Prisma.sql`t.slideCount >= ${Number(query.slides.slice(0, -1)) || 25}`);
    else if (Number(query.slides) > 0) parts.push(Prisma.sql`t.slideCount = ${Number(query.slides)}`);
  }
  return parts;
}

/** A search word as a required term; plurals also match their singular, and the word being typed matches by prefix */
function termExpression(term: string, last: boolean): string {
  const forms = [last ? `${term}*` : term];
  if (term.length > 4 && term.endsWith("s") && !term.endsWith("ss")) forms.push(term.slice(0, -1));
  return forms.length > 1 ? `+(${forms.join(" ")})` : `+${forms[0]}`;
}

function toCard(row: CardRow, favorites: Set<string>) {
  return {
    ...row,
    palette: row.palette.split(","),
    fonts: row.fonts.split(","),
    editable: true,
    isFavorite: favorites.has(row.id),
    thumbnailUrl: `/api/library/${row.id}/thumbnail.svg`,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function favoriteIds(userId: string | undefined, ids: string[]): Promise<Set<string>> {
  if (!userId || !ids.length) return new Set();
  const rows = await prisma.libraryTemplateFavorite.findMany({ where: { userId, templateId: { in: ids } }, select: { templateId: true } });
  return new Set(rows.map((r) => r.templateId));
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode<T>(cursor?: string): T | null {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function requireId(id: string) {
  const parsed = parseTemplateId(id);
  if (!parsed) throw AppError.notFound("Template not found");
  return parsed;
}

export const libraryService = {
  async list(query: LibraryQuery, userId?: string) {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(query.limit || DEFAULT_LIMIT)));
    const terms = query.q ? searchTerms(query.q) : [];
    if (query.q && terms.length) return this.search(query, terms, limit, userId);

    const where = whereFor(query);
    if (query.favorites) {
      if (!userId) return { items: [], nextCursor: null, total: 0, totalCapped: false };
      where.favorites = { some: { userId } };
    }

    const sort = query.sort || "recommended";
    const cursor = decode<{ k: number; id: string }>(query.cursor);
    let orderBy: Prisma.LibraryTemplateOrderByWithRelationInput[];
    let after: Prisma.LibraryTemplateWhereInput | undefined;
    if (sort === "popular") {
      // Both keys run the same way so the (type, usageCount, id) index can be read backwards without sorting
      orderBy = [{ usageCount: "desc" }, { id: "desc" }];
      if (cursor) after = { OR: [{ usageCount: { lt: cursor.k } }, { usageCount: cursor.k, id: { lt: cursor.id } }] };
    } else if (sort === "newest") {
      // Ids are numbered in order of creation, so the primary key gives "newest first" directly.
      // The bounds keep the scan inside this type's block of ids.
      const prefix = `${ID_PREFIX[query.type]}-`;
      orderBy = [{ id: "desc" }];
      // "Z" sorts after every digit, so this is just past the last id of the type
      after = { id: { gte: prefix, lt: cursor ? cursor.id : `${prefix}Z` } };
    } else {
      orderBy = [{ shuffleKey: "asc" }, { id: "asc" }];
      if (cursor) after = { OR: [{ shuffleKey: { gt: cursor.k } }, { shuffleKey: cursor.k, id: { gt: cursor.id } }] };
    }

    const rows = await prisma.libraryTemplate.findMany({
      where: after ? { AND: [where, after] } : where,
      orderBy,
      take: limit + 1,
      select: { ...CARD_SELECT, shuffleKey: true, seq: true },
    });
    const page = rows.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = rows.length > limit && last
      ? encode({ k: sort === "popular" ? last.usageCount : sort === "newest" ? last.seq : last.shuffleKey, id: last.id })
      : null;

    const total = query.favorites
      ? await prisma.libraryTemplate.count({ where })
      : await cached(`count:${JSON.stringify(where)}`, 10 * 60 * 1000, () => prisma.libraryTemplate.count({ where }));
    const favorites = await favoriteIds(userId, page.map((r) => r.id));
    return { items: page.map((row) => toCard(row, favorites)), nextCursor, total, totalCapped: false };
  },

  /**
   * Full-text search. Templates must contain every word; when none do, the
   * search is retried with one word left out at a time, then with single words.
   */
  async search(query: LibraryQuery, terms: string[], limit: number, userId?: string) {
    const cursor = decode<{ o: number; e?: string }>(query.cursor);
    const offset = Math.min(MAX_SEARCH_OFFSET, Math.max(0, cursor?.o ?? 0));
    if (query.favorites && !userId) return { items: [], nextCursor: null, total: 0, totalCapped: false };
    const filters = sqlFilters(query);
    if (query.favorites) {
      filters.push(Prisma.sql`EXISTS (SELECT 1 FROM library_template_favorites f WHERE f.templateId = t.id AND f.userId = ${userId})`);
    }
    const where = Prisma.join(filters, " AND ");

    // No ORDER BY: every hit already contains all the words, and without sorting
    // MySQL can stop as soon as it has a page of results
    const run = async (expression: string) => {
      const rows = await prisma.$queryRaw<{ id: string }[]>(
        Prisma.sql`SELECT t.id FROM library_templates t WHERE ${where} AND MATCH(t.title, t.keywords) AGAINST (${expression} IN BOOLEAN MODE) LIMIT ${limit + 1} OFFSET ${offset}`
      );
      return rows.map((r) => r.id);
    };
    const expressionFor = (list: string[]) => list.map((t, i) => termExpression(t, i === list.length - 1)).join(" ");

    let expression = cursor?.e && cursor.e.length < 300 ? cursor.e : expressionFor(terms);
    let ids = await run(expression);
    if (!ids.length && offset === 0 && !cursor?.e && terms.length > 1) {
      const attempts = [
        ...terms.map((_, drop) => terms.filter((__, i) => i !== terms.length - 1 - drop)),
        ...terms.map((t) => [t]),
      ];
      for (const attempt of attempts) {
        const candidate = expressionFor(attempt);
        const found = await run(candidate);
        if (found.length) {
          ids = found;
          expression = candidate;
          break;
        }
      }
    }

    const pageIds = ids.slice(0, limit);
    const rows = pageIds.length ? await prisma.libraryTemplate.findMany({ where: { id: { in: pageIds } }, select: CARD_SELECT }) : [];
    const byId = new Map(rows.map((r) => [r.id, r]));
    const counted = pageIds.length
      ? await cached(`search:${JSON.stringify([query, expression, query.favorites ? userId : ""])}`, 5 * 60 * 1000, async () => {
          const result = await prisma.$queryRaw<{ n: bigint }[]>(
            Prisma.sql`SELECT COUNT(*) AS n FROM (SELECT 1 FROM library_templates t WHERE ${where} AND MATCH(t.title, t.keywords) AGAINST (${expression} IN BOOLEAN MODE) LIMIT ${COUNT_CAP + 1}) AS hits`
          );
          return Number(result[0]?.n ?? 0);
        })
      : 0;
    const favorites = await favoriteIds(userId, pageIds);
    const more = ids.length > limit && offset + limit <= MAX_SEARCH_OFFSET;
    return {
      items: pageIds.map((id) => byId.get(id)).filter((r): r is CardRow => !!r).map((row) => toCard(row, favorites)),
      nextCursor: more ? encode({ o: offset + limit, e: expression }) : null,
      total: Math.min(counted, COUNT_CAP),
      totalCapped: counted > COUNT_CAP,
    };
  },

  /** Counts per filter value, for building the filter menus */
  async facets(type: LibraryType) {
    return cached(`facets:${type}`, 30 * 60 * 1000, async () => {
      const group = async <K extends "category" | "subcategory" | "style" | "industry" | "colorFamily" | "sizeId" | "slideCount" | "orientation" | "aspect">(by: K) =>
        prisma.libraryTemplate.groupBy({ by: [by], where: { type }, _count: { _all: true } });
      const [total, subs, styles, industries, colors, sizes, slides, orientations, aspects] = await Promise.all([
        prisma.libraryTemplate.count({ where: { type } }),
        prisma.libraryTemplate.groupBy({ by: ["category", "categoryName", "subcategory", "subcategoryName"], where: { type }, _count: { _all: true } }),
        prisma.libraryTemplate.groupBy({ by: ["style", "styleName"], where: { type }, _count: { _all: true } }),
        group("industry"), group("colorFamily"),
        prisma.libraryTemplate.groupBy({ by: ["sizeId", "sizeName", "width", "height"], where: { type }, _count: { _all: true } }),
        group("slideCount"), group("orientation"), group("aspect"),
      ]);
      const categories = new Map<string, { slug: string; name: string; count: number; children: { slug: string; name: string; count: number }[] }>();
      for (const row of subs) {
        const entry = categories.get(row.category) ?? { slug: row.category, name: row.categoryName, count: 0, children: [] };
        entry.count += row._count._all;
        entry.children.push({ slug: row.subcategory, name: row.subcategoryName, count: row._count._all });
        categories.set(row.category, entry);
      }
      const byName = <T extends { name: string }>(list: T[]) => list.sort((a, b) => a.name.localeCompare(b.name));
      return {
        type,
        total,
        categories: [...categories.values()].map((c) => ({ ...c, children: byName(c.children) })),
        styles: byName(styles.map((s) => ({ slug: s.style, name: s.styleName, count: s._count._all }))),
        industries: byName(industries.map((r) => ({ slug: r.industry, name: r.industry.replace(/^\w/, (c) => c.toUpperCase()), count: r._count._all }))),
        colors: byName(colors.map((r) => ({ slug: r.colorFamily, name: r.colorFamily.replace(/^\w/, (c) => c.toUpperCase()), count: r._count._all }))),
        sizes: sizes.map((s) => ({ slug: s.sizeId, name: s.sizeName, width: s.width, height: s.height, count: s._count._all })).sort((a, b) => a.width * a.height - b.width * b.height),
        slideCounts: slides.map((r) => ({ value: r.slideCount, count: r._count._all })).sort((a, b) => a.value - b.value),
        orientations: orientations.map((r) => ({ slug: r.orientation, count: r._count._all })),
        aspects: aspects.map((r) => ({ slug: r.aspect, count: r._count._all })).sort((a, b) => b.count - a.count),
      };
    });
  },

  async get(id: string, userId?: string) {
    requireId(id);
    const row = await prisma.libraryTemplate.findUnique({ where: { id }, select: CARD_SELECT });
    if (!row) throw AppError.notFound("Template not found");
    const favorites = await favoriteIds(userId, [id]);
    return toCard(row, favorites);
  },

  /**
   * Templates like this one: the same subject first, in the same style where
   * there are enough, then the same style on other subjects.
   */
  async related(id: string, userId?: string, limit = 8) {
    const { type } = requireId(id);
    const row = await prisma.libraryTemplate.findUnique({ where: { id }, select: { subcategory: true, style: true, shuffleKey: true } });
    if (!row) throw AppError.notFound("Template not found");
    const take = Math.min(12, Math.max(1, limit));
    // Starting from this template's own place in the shuffle gives each template its own neighbours
    const pickFrom = async (where: Prisma.LibraryTemplateWhereInput, count: number, skip: string[]) => {
      if (count <= 0) return [];
      const base = { type, id: { notIn: [id, ...skip] }, ...where };
      const after = await prisma.libraryTemplate.findMany({ where: { ...base, shuffleKey: { gt: row.shuffleKey } }, orderBy: [{ shuffleKey: "asc" }, { id: "asc" }], take: count, select: CARD_SELECT });
      if (after.length >= count) return after;
      const wrap = await prisma.libraryTemplate.findMany({ where: { ...base, id: { notIn: [id, ...skip, ...after.map((r) => r.id)] } }, orderBy: [{ shuffleKey: "asc" }, { id: "asc" }], take: count - after.length, select: CARD_SELECT });
      return [...after, ...wrap];
    };
    const sameBoth = await pickFrom({ subcategory: row.subcategory, style: row.style }, Math.ceil(take / 2), []);
    const sameSubject = await pickFrom({ subcategory: row.subcategory }, take - sameBoth.length, sameBoth.map((r) => r.id));
    const found = [...sameBoth, ...sameSubject];
    const sameStyle = await pickFrom({ style: row.style }, take - found.length, found.map((r) => r.id));
    const rows = [...found, ...sameStyle];
    const favorites = await favoriteIds(userId, rows.map((r) => r.id));
    return rows.map((r) => toCard(r, favorites));
  },

  /** The design itself: every page with its elements, ready for the editor */
  design(id: string) {
    const { type, seq } = requireId(id);
    return buildTemplate(type, seq).map(({ backgroundSpec: _spec, ...page }) => page);
  },

  /** SVG preview of one page (1-based). Needs no database, so previews stay fast. */
  pageSvg(id: string, pageNumber = 1): string {
    const { type, seq } = requireId(id);
    const key = `${id}:${pageNumber}`;
    const hit = svgCache.get(key);
    if (hit) return hit;
    const pages = buildTemplate(type, seq, pageNumber);
    const page = pages[pageNumber - 1];
    if (!page) throw AppError.notFound("That page does not exist");
    const svg = renderPageSvg(page);
    if (svgCache.size > 1500) svgCache.clear();
    svgCache.set(key, svg);
    return svg;
  },

  /** Copies the template into a new project the user owns */
  async use(id: string, userId: string) {
    const { type, seq } = requireId(id);
    const row = await prisma.libraryTemplate.findUnique({ where: { id }, select: { title: true, sizeName: true } });
    if (!row) throw AppError.notFound("Template not found");
    const pages = buildTemplate(type, seq);
    const project = await prisma.project.create({
      data: {
        title: row.title.split(":")[0].slice(0, 190),
        ownerId: userId,
        pages: {
          create: pages.map((page, order) => ({
            name: page.name.slice(0, 190),
            width: page.width,
            height: page.height,
            presetName: row.sizeName,
            background: page.background,
            elements: JSON.stringify(page.elements),
            order,
          })),
        },
      },
      select: { id: true },
    });
    await prisma.libraryTemplate.update({ where: { id }, data: { usageCount: { increment: 1 } } }).catch(() => undefined);
    return { projectId: project.id, pageCount: pages.length };
  },

  async setFavorite(id: string, userId: string, favorite: boolean) {
    requireId(id);
    const exists = await prisma.libraryTemplate.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw AppError.notFound("Template not found");
    const key = { userId_templateId: { userId, templateId: id } };
    const current = await prisma.libraryTemplateFavorite.findUnique({ where: key });
    if (favorite && !current) {
      await prisma.$transaction([
        prisma.libraryTemplateFavorite.create({ data: { userId, templateId: id } }),
        prisma.libraryTemplate.update({ where: { id }, data: { favoriteCount: { increment: 1 } } }),
      ]);
    } else if (!favorite && current) {
      await prisma.$transaction([
        prisma.libraryTemplateFavorite.delete({ where: key }),
        prisma.libraryTemplate.updateMany({ where: { id, favoriteCount: { gt: 0 } }, data: { favoriteCount: { decrement: 1 } } }),
      ]);
    }
    return { id, isFavorite: favorite };
  },

  clearCaches() {
    cache.clear();
    svgCache.clear();
  },
};
