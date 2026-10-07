import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import {
  EmailTemplateListQuery, EmailTemplateSort, emailTemplateService,
} from "../services/emailTemplate.service";
import { userEmailTemplateService } from "../services/userEmailTemplate.service";
import { parseArtParams, renderArtCached } from "../templates/email/art";

const SORTS: EmailTemplateSort[] = ["recommended", "popular", "newest", "trending", "featured"];

/** Origin that image URLs inside templates should point at. */
function publicBaseUrl(req: Request): string {
  const configured = process.env.PUBLIC_API_URL?.trim().replace(/\/+$/, "");
  return configured || `${req.protocol}://${req.get("host")}`;
}

function flag(value: unknown): boolean {
  return value === "true" || value === "1";
}

function parseListQuery(req: Request): EmailTemplateListQuery {
  const text = (key: string) => (typeof req.query[key] === "string" && req.query[key] ? String(req.query[key]).slice(0, 160) : undefined);
  const sort = text("sort") as EmailTemplateSort | undefined;
  const limit = Number(req.query.limit);
  return {
    q: text("q"),
    category: text("category"),
    subcategory: text("subcategory"),
    tag: text("tag"),
    featured: flag(req.query.featured),
    premium: req.query.premium === undefined ? undefined : flag(req.query.premium),
    favoritesOnly: flag(req.query.favorites),
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    cursor: text("cursor"),
  };
}

function requireUser(req: Request): string {
  if (!req.userId) throw AppError.unauthorized("Authentication required. Please sign in.");
  return req.userId;
}

export const emailTemplateController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = parseListQuery(req);
    const result = await emailTemplateService.list(query, req.userId);
    // Nothing has been used yet on a fresh library, so "trending" shows the default mix instead
    if (query.sort === "trending" && !query.cursor && !query.q && result.items.length === 0) {
      const fallback = await emailTemplateService.list({ ...query, sort: "recommended" }, req.userId);
      return res.status(200).json({ ...fallback, fallback: "recommended" });
    }
    res.status(200).json(result);
  }),

  categories: asyncHandler(async (_req: Request, res: Response) => {
    const [categories, tags] = await Promise.all([emailTemplateService.listCategories(), emailTemplateService.popularTags()]);
    res.status(200).json({ categories, tags });
  }),

  recent: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ items: await emailTemplateService.recentlyUsed(requireUser(req)) });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const template = await emailTemplateService.get(req.params.id, publicBaseUrl(req), req.userId);
    res.status(200).json({ template });
  }),

  thumbnail: asyncHandler(async (req: Request, res: Response) => {
    const svg = await emailTemplateService.thumbnail(req.params.id);
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    // A static picture: it may be embedded in a frame and may load photos from the image CDN, nothing else
    res.setHeader("Content-Security-Policy", "default-src 'none'; img-src https://images.unsplash.com; style-src 'unsafe-inline'");
    res.removeHeader("X-Frame-Options");
    // Card URLs carry a version, so those responses can be cached for good
    res.setHeader("Cache-Control", req.query.v ? "public, max-age=31536000, immutable" : "public, max-age=300");
    res.status(200).send(svg);
  }),

  use: asyncHandler(async (req: Request, res: Response) => {
    const result = await emailTemplateService.use(req.params.id, requireUser(req), publicBaseUrl(req));
    res.status(201).json(result);
  }),

  favorite: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(await emailTemplateService.setFavorite(req.params.id, requireUser(req), true));
  }),

  unfavorite: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(await emailTemplateService.setFavorite(req.params.id, requireUser(req), false));
  }),

  /** Generated template artwork. Fully described by its URL, so it is cached forever. */
  art: asyncHandler(async (req: Request, res: Response) => {
    const params = parseArtParams(req.params.style, req.params.colors, req.params.seed, req.params.size);
    if (!params) throw AppError.notFound("Image not found");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(renderArtCached(params));
  }),
};

export const userEmailTemplateController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit);
    const result = await userEmailTemplateService.list(requireUser(req), {
      limit: Number.isFinite(limit) ? limit : undefined,
      cursor: typeof req.query.cursor === "string" ? req.query.cursor : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
    });
    res.status(200).json(result);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ template: await userEmailTemplateService.get(requireUser(req), req.params.id) });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ template: await userEmailTemplateService.create(requireUser(req), req.body) });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ template: await userEmailTemplateService.update(requireUser(req), req.params.id, req.body) });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(await userEmailTemplateService.remove(requireUser(req), req.params.id));
  }),

  duplicate: asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ template: await userEmailTemplateService.duplicate(requireUser(req), req.params.id) });
  }),

  send: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(await userEmailTemplateService.sendEmail(requireUser(req), req.body));
  }),

  sendTest: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json(await userEmailTemplateService.sendTest(requireUser(req), req.body));
  }),
};
