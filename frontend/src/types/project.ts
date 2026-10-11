import { CanvasElement } from "./element";

export interface PageSize {
  width: number;
  height: number;
  name: string;
}

export interface DesignPage {
  id: string;
  name: string;
  size: PageSize;
  background: string;
  elements: CanvasElement[];
}

export interface DesignProject {
  id: string;
  title: string;
  thumbnailUrl?: string;
  ownerId: string;
  pages: DesignPage[];
  createdAt: string;
  updatedAt: string;
}

export const PAGE_PRESETS: PageSize[] = [
  {
    name: "Portrait Poster",
    width: 1080,
    height: 1440,
  },
  {
    name: "Instagram Post (Square)",
    width: 1080,
    height: 1080,
  },
  {
    name: "Story / Vertical Poster",
    width: 1080,
    height: 1920,
  },
  {
    name: "Marketing Flyer (4:5)",
    width: 1080,
    height: 1350,
  },
  {
    name: "Presentation / Banner (16:9)",
    width: 1920,
    height: 1080,
  },
  {
    name: "A4 Document / Print",
    width: 1240,
    height: 1754,
  },
  {
    name: "YouTube Thumbnail",
    width: 1280,
    height: 720,
  },
];