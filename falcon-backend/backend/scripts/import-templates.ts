import fs from "fs";
import path from "path";
import { importMany, parseCsvMetadata, rowsToImportInput } from "../services/templateImport.service";
import { templateService } from "../services/template.service";
import { ImportTemplateInput } from "../models/template.model";
import { prisma } from "../database/prismaClient";

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const file = argValue("--file");
  const dir = argValue("--dir");
  const csv = argValue("--csv");
  const designsFile = argValue("--designs");
  const publish = process.argv.includes("--publish");
  const batchSize = Number(argValue("--batch-size") || "500");

  await templateService.ensureTaxonomy();
  let templates: ImportTemplateInput[] = [];
  let sourceType = "json";

  if (file) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
    templates = Array.isArray(raw) ? raw : raw.templates || raw.items;
    sourceType = "json";
  } else if (csv) {
    const csvText = fs.readFileSync(path.resolve(csv), "utf8");
    const rows = parseCsvMetadata(csvText);
    const designs = designsFile
      ? JSON.parse(fs.readFileSync(path.resolve(designsFile), "utf8"))
      : {};
    templates = rowsToImportInput(rows, designs);
    sourceType = "csv";
  } else if (dir) {
    const folder = path.resolve(dir);
    const files = fs.readdirSync(folder).filter((name) => name.endsWith(".json"));
    for (const name of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(folder, name), "utf8"));
      if (Array.isArray(raw)) templates.push(...raw);
      else if (raw.templates) templates.push(...raw.templates);
      else templates.push(raw);
    }
    sourceType = "package";
  } else {
    throw new Error("Provide --file, --csv, or --dir");
  }

  const result = await importMany(templates, { sourceType, publish, batchSize });
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((err) => {
    console.error("[templates] import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
