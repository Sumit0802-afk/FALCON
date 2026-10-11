import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { templateService } from "../services/template.service";
import {
  importMany,
  importOne,
  parseCsvMetadata,
  rowsToImportInput,
} from "../services/templateImport.service";
import { ImportTemplateInput } from "../models/template.model";
import { prisma } from "../database/prismaClient";

export const adminTemplateController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    await templateService.ensureTaxonomy();
    const result = await importOne(req.body as ImportTemplateInput, true);
    if (result.status === "duplicate") {
      throw AppError.conflict("An equivalent template already exists");
    }
    res.status(201).json(result);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const template = await templateService.adminUpdate(req.params.id, req.body);
    res.status(200).json({ template });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await templateService.adminDelete(req.params.id);
    res.status(204).send();
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const template = await templateService.adminGet(req.params.id);
    res.status(200).json({ template });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status ? String(req.query.status) : undefined;
    const result = await templateService.list(
      {
        q: req.query.q ? String(req.query.q) : undefined,
        category: req.query.category ? String(req.query.category) : undefined,
        subcategory: req.query.subcategory ? String(req.query.subcategory) : undefined,
        status: (status as "draft" | "published" | "archived" | "all") || "all",
        sort: (req.query.sort as "newest") || "newest",
        limit: req.query.limit ? Number(req.query.limit) : 40,
        cursor: req.query.cursor ? String(req.query.cursor) : undefined,
      },
      req.userId
    );
    res.status(200).json(result);
  }),

  importJson: asyncHandler(async (req: Request, res: Response) => {
    const templates = (req.body.templates || req.body.items || req.body) as ImportTemplateInput[];
    if (!Array.isArray(templates)) {
      throw AppError.badRequest("Body must include a templates array");
    }
    const result = await importMany(templates, {
      createdById: req.userId,
      sourceType: "json",
      publish: Boolean(req.body.publish),
      batchSize: req.body.batchSize,
    });
    res.status(200).json(result);
  }),

  bulkImport: asyncHandler(async (req: Request, res: Response) => {
    const format = String(req.body.format || "json");
    let templates: ImportTemplateInput[] = [];

    if (format === "csv") {
      const rows = parseCsvMetadata(String(req.body.csv || ""));
      templates = rowsToImportInput(rows, req.body.designs || {});
    } else if (format === "package") {
      templates = (req.body.templates || []) as ImportTemplateInput[];
    } else {
      templates = (req.body.templates || []) as ImportTemplateInput[];
    }

    if (!Array.isArray(templates) || templates.length === 0) {
      throw AppError.badRequest("No templates found in import payload");
    }

    const result = await importMany(templates, {
      createdById: req.userId,
      sourceType: format,
      publish: Boolean(req.body.publish),
      batchSize: req.body.batchSize,
    });
    res.status(200).json(result);
  }),

  bulk: asyncHandler(async (req: Request, res: Response) => {
    const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids : [];
    const action = String(req.body.action || "");
    const result = await templateService.bulk(ids, action, req.body);
    res.status(200).json(result);
  }),

  jobs: asyncHandler(async (req: Request, res: Response) => {
    const jobs = await prisma.templateImportJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.status(200).json({ jobs });
  }),
};
