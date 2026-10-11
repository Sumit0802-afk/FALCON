import { importMany } from "../services/templateImport.service";
import { generateTemplateBatch, combinationCapacity } from "../templates/generator";
import { templateService } from "../services/template.service";
import { prisma } from "../database/prismaClient";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const count = Number(argValue("--count") || "168");
  const offset = Number(argValue("--offset") || "0");
  const batchSize = Number(argValue("--batch-size") || "250");
  const publish = !process.argv.includes("--draft");
  const max = combinationCapacity();

  console.log(`[templates] combination capacity: ${max}`);
  console.log(`[templates] generating ${count} unique templates from offset ${offset}`);

  await templateService.ensureTaxonomy();
  const templates = generateTemplateBatch(count, offset, publish);
  const result = await importMany(templates, {
    sourceType: "generator",
    publish,
    batchSize,
  });

  const total = await prisma.designTemplate.count();
  const published = await prisma.designTemplate.count({ where: { status: "published" } });

  console.log(`[templates] imported=${result.imported} skipped=${result.skipped} failed=${result.failed}`);
  console.log(`[templates] database totals: ${total} (${published} published)`);
  if (result.errors.length) {
    console.log("[templates] sample errors:", result.errors.slice(0, 5));
  }
}

main()
  .catch((err) => {
    console.error("[templates] generate failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
