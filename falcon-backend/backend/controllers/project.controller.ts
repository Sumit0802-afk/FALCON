import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { projectService } from "../services/project.service";

function userId(req: Request): string {
  if (!req.userId) throw AppError.unauthorized();
  return req.userId;
}

export const projectController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const projects = await projectService.list(userId(req));
    res.status(200).json({ projects });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.get(req.params.projectId, userId(req));
    res.status(200).json({ project });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.create(userId(req), req.body);
    res.status(201).json({ project });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.update(req.params.projectId, userId(req), req.body);
    res.status(200).json({ project });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await projectService.remove(req.params.projectId, userId(req));
    res.status(204).send();
  }),

  duplicate: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.duplicate(req.params.projectId, userId(req));
    res.status(201).json({ project });
  }),

  addPage: asyncHandler(async (req: Request, res: Response) => {
    const page = await projectService.addPage(req.params.projectId, userId(req));
    res.status(201).json({ page });
  }),

  updatePage: asyncHandler(async (req: Request, res: Response) => {
    const page = await projectService.updatePage(
      req.params.projectId,
      req.params.pageId,
      userId(req),
      req.body
    );
    res.status(200).json({ page });
  }),

  removePage: asyncHandler(async (req: Request, res: Response) => {
    await projectService.removePage(req.params.projectId, req.params.pageId, userId(req));
    res.status(204).send();
  }),
};
