/**
 * Seeds the email template library.
 *
 *   npm run email:seed                     # 50,000 templates
 *   npm run email:seed -- --count 100000   # grow the library
 *   npm run email:seed -- --reset          # delete generated templates first
 *
 * Templates are generated lazily and written in batches. Re-running is safe:
 * slugs are deterministic, so existing templates are skipped, not duplicated.
 */
import "dotenv/config";
import { randomUUID } from "crypto";
import { prisma } from "../database/prismaClient";
import { emailTemplateService } from "../services/emailTemplate.service";
import { allEmailSubcategories } from "../templates/email/catalog";
import { GeneratedEmailTemplate, generateEmailTemplates, totalLayoutCapacity } from "../templates/email/generateTemplates";

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

function tagSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

async function main() {
  const count = Number(argValue("--count") || "50000");
  const batchSize = Number(argValue("--batch-size") || "500");
  const reset = process.argv.includes("--reset");
  const subs = allEmailSubcategories();

  console.log(`[email:seed] target: ${count} templates across ${subs.length} subcategories`);
  console.log(`[email:seed] distinct layouts available: ${totalLayoutCapacity().toLocaleString()}`);

  if (reset) {
    const removed = await prisma.emailTemplate.deleteMany({ where: { authorId: null } });
    console.log(`[email:seed] --reset removed ${removed.count} generated templates`);
  }

  await emailTemplateService.ensureTaxonomy();
  const categories = await prisma.emailTemplateCategory.findMany({ select: { id: true, slug: true } });
  const categoryId = new Map(categories.map((c) => [c.slug, c.id]));
  const tagId = new Map((await prisma.emailTemplateTag.findMany({ select: { id: true, slug: true } })).map((t) => [t.slug, t.id]));

  const started = Date.now();
  let generated = 0;
  let inserted = 0;
  let batch: GeneratedEmailTemplate[] = [];

  const flush = async () => {
    if (!batch.length) return;

    // Create any tags this batch introduces
    const newTags = new Map<string, string>();
    for (const template of batch) {
      for (const name of template.tags) {
        const slug = tagSlug(name);
        if (slug && !tagId.has(slug)) newTags.set(slug, name);
      }
    }
    if (newTags.size) {
      await prisma.emailTemplateTag.createMany({
        data: [...newTags].map(([slug, name]) => ({ slug, name })),
        skipDuplicates: true,
      });
      const rows = await prisma.emailTemplateTag.findMany({ where: { slug: { in: [...newTags.keys()] } }, select: { id: true, slug: true } });
      for (const row of rows) tagId.set(row.slug, row.id);
    }

    // Skip templates that are already in the library (same slug or same design)
    const existing = await prisma.emailTemplate.findMany({
      where: { OR: [{ slug: { in: batch.map((t) => t.slug) } }, { fingerprint: { in: batch.map((t) => t.fingerprint) } }] },
      select: { slug: true, fingerprint: true },
    });
    const knownSlugs = new Set(existing.map((e) => e.slug));
    const knownPrints = new Set(existing.map((e) => e.fingerprint));
    const fresh = batch.filter((t) => !knownSlugs.has(t.slug) && !knownPrints.has(t.fingerprint));

    if (fresh.length) {
      const rows = fresh.map((t) => ({ id: randomUUID(), template: t }));
      await prisma.$transaction([
        prisma.emailTemplate.createMany({
          data: rows.map(({ id, template: t }) => ({
            id,
            slug: t.slug,
            title: t.title,
            description: t.description,
            categoryId: categoryId.get(t.categorySlug)!,
            subcategoryId: categoryId.get(t.subcategorySlug)!,
            tagList: t.tags.join(","),
            keywords: t.keywords,
            width: t.width,
            height: t.height,
            orientation: t.height >= t.width ? "portrait" : "landscape",
            layoutKey: t.layoutKey,
            paletteKey: t.paletteKey,
            fontKey: t.fontKey,
            isFeatured: t.isFeatured,
            isPremium: t.isPremium,
            shuffleKey: t.shuffleKey,
            fingerprint: t.fingerprint,
            status: "published",
          })),
        }),
        prisma.emailTemplateContent.createMany({
          data: rows.map(({ id, template: t }) => ({ templateId: id, templateData: t.templateData })),
        }),
        prisma.emailTemplateTagLink.createMany({
          data: rows.flatMap(({ id, template: t }) =>
            [...new Set(t.tags.map(tagSlug).filter((slug) => tagId.has(slug)))].map((slug) => ({ templateId: id, tagId: tagId.get(slug)! }))
          ),
          skipDuplicates: true,
        }),
      ]);
      inserted += fresh.length;
    }
    batch = [];
  };

  for (const template of generateEmailTemplates(count)) {
    batch.push(template);
    generated++;
    if (batch.length >= batchSize) {
      await flush();
      if (generated % (batchSize * 10) === 0) {
        const rate = Math.round(generated / ((Date.now() - started) / 1000));
        console.log(`[email:seed] ${generated.toLocaleString()} / ${count.toLocaleString()} generated, ${inserted.toLocaleString()} inserted (${rate}/s)`);
      }
    }
  }
  await flush();
  await emailTemplateService.refreshTagCounts();

  const [total, layouts, featured, premium] = await Promise.all([
    prisma.emailTemplate.count({ where: { status: "published" } }),
    prisma.emailTemplate.groupBy({ by: ["layoutKey"], _count: { _all: true } }).then((g) => g.length),
    prisma.emailTemplate.count({ where: { isFeatured: true } }),
    prisma.emailTemplate.count({ where: { isPremium: true } }),
  ]);
  console.log(`[email:seed] done in ${Math.round((Date.now() - started) / 1000)}s: generated ${generated.toLocaleString()}, inserted ${inserted.toLocaleString()}, skipped ${(generated - inserted).toLocaleString()} already present`);
  console.log(`[email:seed] library now holds ${total.toLocaleString()} published templates, ${layouts.toLocaleString()} distinct layouts, ${featured.toLocaleString()} featured, ${premium.toLocaleString()} premium`);
}

main()
  .catch((err) => {
    console.error("[email:seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
