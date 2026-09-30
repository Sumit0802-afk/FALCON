import { CanvasElement } from "./element.model";

export interface PageDTO {
  id: string;
  name: string;
  width: number;
  height: number;
  presetName: string;
  background: string;
  elements: CanvasElement[];
  order: number;
}

export interface ProjectDTO {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  ownerId: string;
  pages: PageDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummaryDTO {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  presetName?: string;
  width?: number;
  height?: number;
}

export interface UpdateProjectInput {
  title?: string;
  thumbnailUrl?: string | null;
}

export interface UpdatePageInput {
  name?: string;
  background?: string;
  elements?: CanvasElement[];
}

export const PAGE_PRESETS: Record<string, { width: number; height: number }> = {
  "Instagram Post": { width: 1080, height: 1080 },
  "Instagram Story": { width: 1080, height: 1920 },
  "Presentation (16:9)": { width: 1920, height: 1080 },
  "A4 Document": { width: 2480, height: 3508 },
  "YouTube Thumbnail": { width: 1280, height: 720 },
};
