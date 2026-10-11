import { randomUUID } from "crypto";
import { CanvasElement } from "../models/element.model";

export interface TemplatePageData {
  id: string;
  name: string;
  size: { name: string; width: number; height: number };
  background: string;
  elements: CanvasElement[];
}

export function cloneTemplatePage(page: TemplatePageData): TemplatePageData {
  const idMap = new Map<string, string>();
  for (const el of page.elements || []) {
    idMap.set(el.id, randomUUID());
  }

  const elements = (page.elements || []).map((el) => {
    const next: CanvasElement = {
      ...el,
      id: idMap.get(el.id) || randomUUID(),
    };
    if ("groupId" in next && next.groupId) {
      next.groupId = idMap.get(next.groupId) || next.groupId;
    }
    if (next.type === "group" && Array.isArray(next.childIds)) {
      next.childIds = next.childIds.map((id) => idMap.get(id) || id);
    }
    return next;
  });

  return {
    ...page,
    id: randomUUID(),
    elements,
  };
}

export function collectAssetRefs(page: TemplatePageData): string[] {
  const refs = new Set<string>();
  for (const el of page.elements || []) {
    if (el.type === "image" && el.src) refs.add(el.src);
    if (el.type === "frame" && el.imageSrc) refs.add(el.imageSrc);
  }
  return [...refs];
}
