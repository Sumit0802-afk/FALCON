/**
 * Fills the design library: one row per poster, presentation and certificate template.
 *
 *   npm run library:seed                 # all 200,000 templates
 *   npm run library:seed -- --reset      # empty the library first
 *   npm run library:seed -- --type poster --count 5000
 *
 * Rows hold only what is needed to find a template. Designs are rebuilt on
 * demand from the template number, so seeding is quick and the table stays small.
 */
import "dotenv/config";
import { prisma } from "../database/prismaClient";
import { LIBRARY_COUNTS, LIBRARY_TYPES, LibraryType, describe, signature } from "../templates/library/generate";

function arg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
}

const BATCH = 2000;

async function seedType(type: LibraryType, count: number): Promise<number> {
  const seen = new Set<string>();
  let written = 0;
  for (let start = 1; start <= count; start += BATCH) {
    const rows = [];
    for (let seq = start; seq < start + BATCH && seq <= count; seq++) {
      const sig = signature(type, seq);
      if (seen.has(sig)) throw new Error(`Template ${type} ${seq} repeats the design of another template`);
      seen.add(sig);
      const { ...entry } = describe(type, seq);
      rows.push({ ...entry, updatedAt: new Date() });
    }
    const result = await prisma.libraryTemplate.createMany({ data: rows, skipDuplicates: true });
    written += result.count;
    if ((start - 1) % (BATCH * 10) === 0) console.log(`[library] ${type}: ${Math.min(count, start + BATCH - 1)} / ${count}`);
  }
  return written;
}

async function main() {
  const only = arg("--type") as LibraryType | undefined;
  const limit = Number(arg("--count")) || undefined;
  if (process.argv.includes("--reset")) {
    await prisma.libraryTemplateFavorite.deleteMany({});
    const removed = await prisma.libraryTemplate.deleteMany({ where: only ? { type: only } : {} });
    console.log(`[library] removed ${removed.count} existing templates`);
  }
  for (const type of LIBRARY_TYPES) {
    if (only && only !== type) continue;
    const count = Math.min(limit ?? LIBRARY_COUNTS[type], LIBRARY_COUNTS[type]);
    const started = Date.now();
    const written = await seedType(type, count);
    console.log(`[library] ${type}: wrote ${written} new rows in ${Math.round((Date.now() - started) / 1000)}s`);
  }
  // Bulk inserts leave the search index in many small pieces; merging them is what makes search fast
  console.log("[library] optimising the search index (about a minute)...");
  await prisma.$queryRawUnsafe("OPTIMIZE TABLE library_templates");

  const counts = await Promise.all(LIBRARY_TYPES.map((type) => prisma.libraryTemplate.count({ where: { type } })));
  console.log(`[library] database now holds ${LIBRARY_TYPES.map((type, i) => `${counts[i]} ${type}s`).join(", ")} (${counts.reduce((a, b) => a + b, 0)} templates)`);
}

main()
  .catch((err) => {
    console.error("[library] seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
