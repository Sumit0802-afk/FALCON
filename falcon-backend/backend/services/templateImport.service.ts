import { randomUUID } from "crypto";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { ImportTemplateInput } from "../models/template.model";
import { templateService } from "./template.service";
import { fingerprintDesign } from "../templates/fingerprint";
import { collectAssetRefs } from "../templates/clone";
import { parseDesignData } from "../templates/validate";
import { slugify } from "../templates/catalog";
import { cacheInvalidate } from "../templates/cache";

export interface ImportResult {
  jobId: string;
  imported: number;
  skipped: number;
  failed: number;
  processed: number;
  errors: Array<{ index: number; slug?: string; reason: string }>;
  duplicates: Array<{ index: number; slug?: string; fingerprint: string }>;
}

const DEFAULT_BATCH = 500;

async function resolveCategory(categorySlug: string, subcategorySlug: string) {
  const category = await prisma.templateCategory.findUnique({ where: { slug: categorySlug } });
  const subcategory = await prisma.templateCategory.findUnique({ where: { slug: subcategorySlug } });
  if (!category || category.parentId) {
    throw AppError.badRequest(`Unknown category: ${categorySlug}`);
  }
  if (!subcategory || subcategory.parentId !== category.id) {
    throw AppError.badRequest(`Unknown subcategory: ${subcategorySlug}`);
  }
  return { category, subcategory };
}

async function upsertTags(names: string[]) {
  const ids: string[] = [];
  for (const raw of names) {
    const name = String(raw).trim();
    if (!name) continue;
    const slug = slugify(name);
    const tag = await prisma.templateTag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function importOne(input: ImportTemplateInput, publishDefault = false) {
  const page = parseDesignData(input.designData);
  const width = input.width || page.size.width;
  const height = input.height || page.size.height;
  const { category, subcategory } = await resolveCategory(input.categorySlug, input.subcategorySlug);
  const fingerprint = fingerprintDesign({
    width,
    height,
    background: page.background,
    elements: page.elements as unknown as Array<Record<string, unknown>>,
    categorySlug: category.slug,
    subcategorySlug: subcategory.slug,
  });

  const existing = await prisma.designTemplate.findUnique({ where: { fingerprint } });
  if (existing) {
    return { status: "duplicate" as const, fingerprint, id: existing.id };
  }

  const slugBase = slugify(input.slug || input.name);
  let slug = slugBase || `template-${randomUUID().slice(0, 8)}`;
  const slugHit = await prisma.designTemplate.findUnique({ where: { slug } });
  if (slugHit) slug = `${slug}-${randomUUID().slice(0, 6)}`;

  const tags = await upsertTags(input.tags || []);
  const status = input.status || (publishDefault ? "published" : "draft");
  const searchDocument = templateService.buildSearchDocument({
    name: input.name,
    description: input.description || "",
    tags: input.tags || [],
    category: category.name,
    subcategory: subcategory.name,
    style: input.style || "Modern",
    industry: input.industry || "Technology",
    platform: input.platform || subcategory.name,
    audience: input.audience || "Consumers",
    theme: input.theme || input.style || "Modern",
    orientation: input.orientation || (width === height ? "Square" : width > height ? "Landscape" : "Portrait"),
  });

  const created = await prisma.$transaction(async (tx) => {
    const template = await tx.designTemplate.create({
      data: {
        slug,
        name: input.name,
        description: input.description || "",
        status,
        featured: Boolean(input.featured),
        categoryId: category.id,
        subcategoryId: subcategory.id,
        style: input.style || "Modern",
        industry: input.industry || "Technology",
        audience: input.audience || "Consumers",
        platform: input.platform || subcategory.name,
        orientation:
          input.orientation || (width === height ? "Square" : width > height ? "Landscape" : "Portrait"),
        width,
        height,
        colorFamily: input.colorFamily || "Neutral",
        theme: input.theme || input.style || "Modern",
        language: input.language || "en",
        thumbnailUrl: input.thumbnailUrl,
        previewUrl: input.previewUrl,
        fingerprint,
        searchDocument,
        publishedAt: status === "published" ? new Date() : null,
      },
    });
    await tx.templateDesign.create({
      data: {
        templateId: template.id,
        designData: JSON.stringify(page),
        assetRefs: JSON.stringify(collectAssetRefs(page)),
      },
    });
    if (tags.length) {
      await tx.templateTagOnTemplate.createMany({
        data: tags.map((tagId) => ({ templateId: template.id, tagId })),
      });
    }
    return template;
  });

  return { status: "imported" as const, id: created.id, slug: created.slug, fingerprint };
}

export async function importMany(
  items: ImportTemplateInput[],
  options: { createdById?: string; sourceType?: string; publish?: boolean; batchSize?: number } = {}
): Promise<ImportResult> {
  await templateService.ensureTaxonomy();
  const batchSize = Math.min(Math.max(options.batchSize || DEFAULT_BATCH, 50), 1000);
  const job = await prisma.templateImportJob.create({
    data: {
      status: "running",
      sourceType: options.sourceType || "json",
      total: items.length,
      createdById: options.createdById,
      errorLog: "[]",
    },
  });

  const errors: ImportResult["errors"] = [];
  const duplicates: ImportResult["duplicates"] = [];
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  let processed = 0;

  for (let start = 0; start < items.length; start += batchSize) {
    const batch = items.slice(start, start + batchSize);
    for (let i = 0; i < batch.length; i++) {
      const index = start + i;
      const item = batch[i];
      try {
        const result = await importOne(item, Boolean(options.publish));
        if (result.status === "duplicate") {
          skipped += 1;
          duplicates.push({ index, slug: item.slug, fingerprint: result.fingerprint });
        } else {
          imported += 1;
        }
      } catch (error) {
        failed += 1;
        errors.push({
          index,
          slug: item.slug,
          reason: error instanceof Error ? error.message : "Unknown import error",
        });
      }
      processed += 1;
    }

    await prisma.templateImportJob.update({
      where: { id: job.id },
      data: {
        processed,
        imported,
        skipped,
        failed,
        errorLog: JSON.stringify(errors.slice(-200)),
      },
    });
  }

  await prisma.templateImportJob.update({
    where: { id: job.id },
    data: {
      status: failed && !imported ? "failed" : "completed",
      processed,
      imported,
      skipped,
      failed,
      errorLog: JSON.stringify(errors.slice(-500)),
      completedAt: new Date(),
    },
  });
  cacheInvalidate("categories");

  return {
    jobId: job.id,
    imported,
    skipped,
    failed,
    processed,
    errors,
    duplicates,
  };
}

export function parseCsvMetadata(csv: string): Array<Record<string, string>> {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] || "";
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === "," && !quoted) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

export function rowsToImportInput(
  rows: Array<Record<string, string>>,
  designs: Record<string, unknown>
): ImportTemplateInput[] {
  return rows.map((row) => {
    const key = row.slug || row.name;
    const designData = designs[key] || designs[row.slug];
    if (!designData) {
      throw AppError.badRequest(`Missing design JSON for ${key}`);
    }
    return {
      slug: row.slug,
      name: row.name,
      description: row.description,
      categorySlug: row.category || row.categorySlug,
      subcategorySlug: row.subcategory || row.subcategorySlug,
      tags: (row.tags || "").split("|").map((t) => t.trim()).filter(Boolean),
      style: row.style,
      industry: row.industry,
      audience: row.audience,
      platform: row.platform,
      orientation: row.orientation,
      width: row.width ? Number(row.width) : undefined,
      height: row.height ? Number(row.height) : undefined,
      colorFamily: row.colorFamily || row.color_family,
      theme: row.theme,
      language: row.language || "en",
      thumbnailUrl: row.thumbnailUrl || row.thumbnail,
      previewUrl: row.previewUrl || row.preview,
      featured: row.featured === "true" || row.featured === "1",
      status: (row.status as ImportTemplateInput["status"]) || undefined,
      designData: designData as ImportTemplateInput["designData"],
    };
  });
}
