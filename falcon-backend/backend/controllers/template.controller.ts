import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { templateService } from "../services/template.service";
import { TemplateListQuery, TemplateSort } from "../models/template.model";

function parseListQuery(req: Request): TemplateListQuery {
  const sort = String(req.query.sort || "recommended") as TemplateSort;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  return {
    q: req.query.q ? String(req.query.q) : undefined,
    category: req.query.category ? String(req.query.category) : undefined,
    subcategory: req.query.subcategory ? String(req.query.subcategory) : undefined,
    style: req.query.style ? String(req.query.style) : undefined,
    industry: req.query.industry ? String(req.query.industry) : undefined,
    platform: req.query.platform ? String(req.query.platform) : undefined,
    orientation: req.query.orientation ? String(req.query.orientation) : undefined,
    tag: req.query.tag ? String(req.query.tag) : undefined,
    audience: req.query.audience ? String(req.query.audience) : undefined,
    colorFamily: req.query.colorFamily ? String(req.query.colorFamily) : undefined,
    theme: req.query.theme ? String(req.query.theme) : undefined,
    language: req.query.language ? String(req.query.language) : undefined,
    featured: req.query.featured === "true" || req.query.featured === "1",
    favoritesOnly: req.query.favorites === "true" || req.query.favorites === "1",
    sort,
    limit: Number.isFinite(limit) ? limit : undefined,
    cursor: req.query.cursor ? String(req.query.cursor) : undefined,
  };
}

export const templateController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await templateService.list(parseListQuery(req), req.userId);
    res.status(200).json(result);
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const result = await templateService.list(parseListQuery(req), req.userId);
    res.status(200).json(result);
  }),

  categories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await templateService.listCategories();
    res.status(200).json({ categories });
  }),

  featured: asyncHandler(async (req: Request, res: Response) => {
    const result = await templateService.list(
      { ...parseListQuery(req), featured: true, sort: "featured" },
      req.userId
    );
    res.status(200).json(result);
  }),

  popular: asyncHandler(async (req: Request, res: Response) => {
    const result = await templateService.list(
      { ...parseListQuery(req), sort: "popular" },
      req.userId
    );
    res.status(200).json(result);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const includeDesign =
      req.query.includeDesign === "true" ||
      req.query.includeDesign === "1" ||
      req.query.preview === "true";
    const template = await templateService.get(req.params.id, req.userId, includeDesign);
    res.status(200).json({ template });
  }),

  related: asyncHandler(async (req: Request, res: Response) => {
    const related = await templateService.related(req.params.id, req.userId);
    res.status(200).json({ related });
  }),

  use: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Sign in to use a template");
    const result = await templateService.use(req.params.id, req.userId);
    res.status(201).json(result);
  }),

  favorite: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Sign in to favorite templates");
    const result = await templateService.toggleFavorite(req.params.id, req.userId, true);
    res.status(200).json(result);
  }),

  unfavorite: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Sign in to favorite templates");
    const result = await templateService.toggleFavorite(req.params.id, req.userId, false);
    res.status(200).json(result);
  }),
};
