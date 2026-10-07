import { Request, Response, Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware";
import { LibraryQuery, libraryService } from "../services/library.service";
import { LibraryType } from "../templates/library/generate";

// ─── Design library: /api/library ─────────────────────────────────────────────

const router = Router();

function text(value: unknown, max = 80): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;
}

function typeOf(value: unknown): LibraryType {
  if (value === "poster" || value === "presentation" || value === "certificate") return value;
  throw AppError.badRequest("type must be 'poster', 'presentation' or 'certificate'");
}

function readQuery(req: Request): LibraryQuery {
  const q = req.query;
  const sort = text(q.sort);
  return {
    type: typeOf(q.type),
    q: text(q.q, 120),
    category: text(q.category),
    subcategory: text(q.subcategory),
    style: text(q.style),
    industry: text(q.industry),
    color: text(q.color),
    size: text(q.size),
    orientation: text(q.orientation),
    aspect: text(q.aspect),
    slides: text(q.slides, 6),
    featured: q.featured === "true" || q.featured === "1",
    favorites: q.favorites === "true" || q.favorites === "1",
    sort: sort === "popular" || sort === "newest" ? sort : "recommended",
    cursor: text(q.cursor, 400),
    limit: Number(q.limit) || undefined,
  };
}

function sendSvg(res: Response, svg: string) {
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  // A template's design never changes for a given id, so previews can be cached for a long time
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.send(svg);
}

router.get("/", optionalAuth, asyncHandler(async (req, res) => {
  res.json(await libraryService.list(readQuery(req), req.userId));
}));

router.get("/facets", asyncHandler(async (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json(await libraryService.facets(typeOf(req.query.type)));
}));

router.get("/:id/thumbnail.svg", asyncHandler(async (req, res) => {
  sendSvg(res, libraryService.pageSvg(req.params.id, 1));
}));

router.get("/:id/pages/:page.svg", asyncHandler(async (req, res) => {
  const page = Number(req.params.page);
  if (!Number.isInteger(page) || page < 1 || page > 40) throw AppError.notFound("That page does not exist");
  sendSvg(res, libraryService.pageSvg(req.params.id, page));
}));

router.get("/:id/design", asyncHandler(async (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.json({ id: req.params.id, pages: libraryService.design(req.params.id) });
}));

router.get("/:id/related", optionalAuth, asyncHandler(async (req, res) => {
  res.json({ items: await libraryService.related(req.params.id, req.userId, Number(req.query.limit) || undefined) });
}));

router.get("/:id", optionalAuth, asyncHandler(async (req, res) => {
  res.json({ template: await libraryService.get(req.params.id, req.userId) });
}));

router.post("/:id/use", requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json(await libraryService.use(req.params.id, req.userId as string));
}));

router.post("/:id/favorite", requireAuth, asyncHandler(async (req, res) => {
  res.json(await libraryService.setFavorite(req.params.id, req.userId as string, true));
}));

router.delete("/:id/favorite", requireAuth, asyncHandler(async (req, res) => {
  res.json(await libraryService.setFavorite(req.params.id, req.userId as string, false));
}));

export default router;
