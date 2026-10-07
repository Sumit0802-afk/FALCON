import { Page, Project } from "@prisma/client";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { CanvasElement } from "../models/element.model";
import {
  CreateProjectInput,
  PAGE_PRESETS,
  PageDTO,
  ProjectDTO,
  ProjectSummaryDTO,
  UpdatePageInput,
  UpdateProjectInput,
} from "../models/project.model";

type ProjectWithPages = Project & {
  pages: Page[];
};

function parseElements(value: string): CanvasElement[] {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? (parsed as CanvasElement[])
      : [];
  } catch {
    return [];
  }
}

function toPageDTO(page: Page): PageDTO {
  return {
    id: page.id,
    name: page.name,
    width: page.width,
    height: page.height,
    presetName: page.presetName,
    background: page.background,
    elements: parseElements(page.elements),
    order: page.order,
  };
}

function toProjectDTO(
  project: ProjectWithPages
): ProjectDTO {
  return {
    id: project.id,
    title: project.title,
    thumbnailUrl: project.thumbnailUrl,
    ownerId: project.ownerId,

    pages: [...project.pages]
      .sort((a, b) => a.order - b.order)
      .map(toPageDTO),

    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

function firstPageSummary(pages: Page[]) {
  const first = [...pages].sort((a, b) => a.order - b.order)[0];
  // A stored background can be a long gradient or image URL; a list only needs a plain colour
  const background = first && first.background.length <= 64 ? first.background : null;
  return { width: first?.width ?? null, height: first?.height ?? null, background };
}

function toSummaryDTO(
  project: ProjectWithPages
): ProjectSummaryDTO {
  return {
    id: project.id,
    title: project.title,
    thumbnailUrl: project.thumbnailUrl,
    pageCount: project.pages.length,
    ...firstPageSummary(project.pages),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

async function requireOwnedProject(
  projectId: string,
  userId: string
): Promise<ProjectWithPages> {
  const project =
    await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      include: {
        pages: { orderBy: { order: "asc" } },
      },
    });

  if (
    !project ||
    project.ownerId !== userId
  ) {
    throw AppError.notFound(
      "Project not found"
    );
  }

  return project;
}

const MAX_PAGES_PER_PROJECT = 100;

export const projectService = {
  async list(
    userId: string
  ): Promise<ProjectSummaryDTO[]> {
    const projects =
      await prisma.project.findMany({
        where: {
          ownerId: userId,
        },

        include: {
          pages: true,
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    return projects.map((project) =>
      toSummaryDTO(
        project as ProjectWithPages
      )
    );
  },

  async get(
    projectId: string,
    userId: string
  ): Promise<ProjectDTO> {
    const project =
      await requireOwnedProject(
        projectId,
        userId
      );

    return toProjectDTO(project);
  },

  async create(
    userId: string,
    input: CreateProjectInput
  ): Promise<ProjectDTO> {
    const preset =
      PAGE_PRESETS[
        input.presetName ??
          "Instagram Post"
      ] ??
      PAGE_PRESETS["Instagram Post"];

    const project =
      await prisma.project.create({
        data: {
          title:
            input.title ||
            "Untitled design",

          ownerId: userId,

          pages: {
            create: [
              {
                name: "Page 1",

                width:
                  input.width ??
                  preset.width,

                height:
                  input.height ??
                  preset.height,

                presetName:
                  input.presetName ??
                  "Instagram Post",

                background: "#FFFFFF",

                elements: "[]",

                order: 0,
              },
            ],
          },
        },

        include: {
          pages: true,
        },
      });

    return toProjectDTO(
      project as ProjectWithPages
    );
  },

  async update(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
  ): Promise<ProjectDTO> {
    await requireOwnedProject(
      projectId,
      userId
    );

    const project =
      await prisma.project.update({
        where: {
          id: projectId,
        },

        data: input,

        include: {
          pages: true,
        },
      });

    return toProjectDTO(
      project as ProjectWithPages
    );
  },

  async remove(
    projectId: string,
    userId: string
  ): Promise<void> {
    await requireOwnedProject(
      projectId,
      userId
    );

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  },

  async duplicate(
    projectId: string,
    userId: string
  ): Promise<ProjectDTO> {
    const source =
      await requireOwnedProject(
        projectId,
        userId
      );

    const copy =
      await prisma.project.create({
        data: {
          title: `${source.title} (copy)`,

          ownerId: userId,

          pages: {
            create: source.pages.map(
              (page) => ({
                name: page.name,
                width: page.width,
                height: page.height,
                presetName:
                  page.presetName,
                background:
                  page.background,
                elements:
                  page.elements,
                order: page.order,
              })
            ),
          },
        },

        include: {
          pages: true,
        },
      });

    return toProjectDTO(
      copy as ProjectWithPages
    );
  },

  async updatePage(
    projectId: string,
    pageId: string,
    userId: string,
    input: UpdatePageInput
  ): Promise<PageDTO> {
    const project =
      await requireOwnedProject(
        projectId,
        userId
      );

    let page =
      project.pages.find(
        (p) => p.id === pageId
      );

    if (!page && project.pages.length === 1) {
      page = project.pages[0];
    }

    if (!page) {
      throw AppError.notFound(
        "Page not found"
      );
    }

    const updated =
      await prisma.page.update({
        where: {
          id: page.id,
        },

        data: {
          name: input.name,

          background:
            input.background,

          elements:
            input.elements !== undefined
              ? JSON.stringify(
                  input.elements
                )
              : undefined,
        },
      });

    return toPageDTO(updated);
  },

  /**
   * Adds a page. By default it is blank, matches the size of the page it
   * follows, and goes after `afterPageId` (or at the end). Passing elements
   * and a background makes it a copy, which is how a page is duplicated.
   */
  async addPage(
    projectId: string,
    userId: string,
    input: {
      afterPageId?: string;
      name?: string;
      background?: string;
      elements?: unknown[];
    } = {}
  ): Promise<PageDTO> {
    const project =
      await requireOwnedProject(
        projectId,
        userId
      );

    if (project.pages.length >= MAX_PAGES_PER_PROJECT) {
      throw AppError.badRequest(
        `A project can have at most ${MAX_PAGES_PER_PROJECT} pages`
      );
    }

    const after =
      project.pages.find((p) => p.id === input.afterPageId) ??
      project.pages[project.pages.length - 1];
    const preset = PAGE_PRESETS["Instagram Post"];
    const order = after ? after.order + 1 : 0;

    const [, page] = await prisma.$transaction([
      // Make room: every page after the insertion point moves down one
      prisma.page.updateMany({
        where: { projectId, order: { gte: order } },
        data: { order: { increment: 1 } },
      }),
      prisma.page.create({
        data: {
          projectId,
          name: (input.name || `Page ${project.pages.length + 1}`).slice(0, 100),
          width: after?.width ?? preset.width,
          height: after?.height ?? preset.height,
          presetName: after?.presetName ?? "Instagram Post",
          background: (input.background ?? after?.background ?? "#FFFFFF").slice(0, 190),
          elements: JSON.stringify(input.elements ?? []),
          order,
        },
      }),
    ]);

    return toPageDTO(page);
  },

  async removePage(
    projectId: string,
    pageId: string,
    userId: string
  ): Promise<void> {
    const project =
      await requireOwnedProject(
        projectId,
        userId
      );

    if (project.pages.length <= 1) {
      throw AppError.badRequest(
        "A project needs at least one page"
      );
    }

    const page =
      project.pages.find(
        (p) => p.id === pageId
      );

    if (!page) {
      throw AppError.notFound(
        "Page not found"
      );
    }

    await prisma.page.delete({
      where: {
        id: pageId,
      },
    });
  },
};