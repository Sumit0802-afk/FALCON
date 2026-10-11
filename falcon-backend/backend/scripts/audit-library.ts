/**
 * Quality check for the design library. It looks for templates that are
 * duplicated, broken or out of step with the database, and writes what it
 * finds to a report. It never deletes or changes a template: the report is
 * for a person to review before anything is archived or fixed.
 *
 *   npm run library:audit                 every recipe and database row, designs sampled
 *   npm run library:audit -- --full       also builds every design (slow)
 *   npm run library:audit -- --type poster --every 10 --out report.json
 */
import "dotenv/config";
import fs from "fs";
import { prisma } from "../database/prismaClient";
import { LIBRARY_COUNTS, LIBRARY_TYPES, LibraryType, buildTemplate, describe, signature, templateId } from "../templates/library/generate";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

interface Flag {
  id: string;
  problem: string;
  detail: string;
}

const MAX_LISTED = 500;

/** Problems in one built design, or an empty list when it is sound */
function inspect(type: LibraryType, seq: number): Omit<Flag, "id">[] {
  const problems: Omit<Flag, "id">[] = [];
  let pages;
  try {
    pages = buildTemplate(type, seq);
  } catch (err) {
    return [{ problem: "invalid-design", detail: `Could not be built: ${(err as Error).message}` }];
  }
  const entry = describe(type, seq);
  if (!pages.length) problems.push({ problem: "empty-template", detail: "No pages" });
  if (pages.length !== entry.slideCount) problems.push({ problem: "corrupt-metadata", detail: `Lists ${entry.slideCount} pages but has ${pages.length}` });
  pages.forEach((page, index) => {
    const where = pages.length > 1 ? ` (page ${index + 1})` : "";
    if (!page.elements.length) problems.push({ problem: "empty-template", detail: `Page has no elements${where}` });
    if (new Set(page.elements.map((e) => e.id)).size !== page.elements.length) problems.push({ problem: "invalid-design", detail: `Two elements share an id${where}` });
    for (const el of page.elements) {
      if (![el.x, el.y, el.width, el.height].every(Number.isFinite) || el.width <= 0 || el.height <= 0) {
        problems.push({ problem: "invalid-design", detail: `Element ${el.id} has no usable size${where}` });
      }
      if (el.type === "text") {
        if (!String(el.text ?? "").trim()) problems.push({ problem: "empty-text", detail: `Text ${el.id} is blank${where}` });
        if (el.x < -2 || el.y < -2 || el.x + el.width > page.width + 2 || el.y + el.height > page.height + 2) {
          problems.push({ problem: "clipped-text", detail: `Text "${String(el.text).slice(0, 30)}" runs off the page${where}` });
        }
      }
      if (el.type === "image" || el.type === "frame") {
        const src = String((el.type === "image" ? el.src : el.imageSrc) ?? "");
        if (!/^https:\/\//.test(src)) problems.push({ problem: "missing-asset", detail: `Picture ${el.id} has no source${where}` });
      }
    }
  });
  return problems;
}

async function main() {
  const only = arg("--type") as LibraryType | undefined;
  const full = process.argv.includes("--full");
  const every = full ? 1 : Math.max(1, Number(arg("--every")) || 25);
  const out = arg("--out") || "library-audit.json";

  const flags: Flag[] = [];
  const totals: Record<string, number> = {};
  const flag = (id: string, problem: string, detail: string) => {
    totals[problem] = (totals[problem] || 0) + 1;
    if (flags.length < MAX_LISTED) flags.push({ id, problem, detail });
  };
  const summary: Record<string, unknown> = {};

  for (const type of LIBRARY_TYPES) {
    if (only && only !== type) continue;
    const count = LIBRARY_COUNTS[type];
    const started = Date.now();

    // Exact duplicates: two numbers that would produce the same design
    const seen = new Map<string, number>();
    for (let seq = 1; seq <= count; seq++) {
      const key = signature(type, seq);
      const first = seen.get(key);
      if (first) flag(templateId(type, seq), "duplicate", `Same design recipe as ${templateId(type, first)}`);
      else seen.set(key, seq);
    }

    // Broken designs
    let built = 0;
    for (let seq = 1; seq <= count; seq += every) {
      built++;
      for (const problem of inspect(type, seq)) flag(templateId(type, seq), problem.problem, problem.detail);
    }

    // Database rows that are missing, or no longer describe the design they point to
    let rows = 0;
    const present = new Set<number>();
    for (let from = 1; from <= count; from += 5000) {
      const batch = await prisma.libraryTemplate.findMany({
        where: { type, seq: { gte: from, lt: from + 5000 } },
        select: { id: true, seq: true, title: true, subcategory: true, style: true, width: true, height: true, slideCount: true },
      });
      for (const row of batch) {
        rows++;
        present.add(row.seq);
        const expected = describe(type, row.seq);
        if (row.id !== expected.id || row.title !== expected.title || row.subcategory !== expected.subcategory || row.style !== expected.style
          || row.width !== expected.width || row.height !== expected.height || row.slideCount !== expected.slideCount) {
          flag(row.id, "corrupt-metadata", "The catalogue entry no longer matches the design; re-run the seed for this type");
        }
      }
    }
    for (let seq = 1; seq <= count; seq++) if (!present.has(seq)) flag(templateId(type, seq), "missing-row", "Not in the database");

    summary[type] = { templates: count, databaseRows: rows, designsBuilt: built, seconds: Math.round((Date.now() - started) / 1000) };
    console.log(`[audit] ${type}: ${count} recipes, ${rows} rows, ${built} designs built in ${Math.round((Date.now() - started) / 1000)}s`);
  }

  const flagged = Object.values(totals).reduce((a, b) => a + b, 0);
  const report = {
    generatedAt: new Date().toISOString(),
    designsSampledEvery: every,
    summary,
    flagged,
    byProblem: totals,
    // Review these before archiving or fixing anything; the audit itself changes nothing
    flags,
    truncated: flagged > flags.length,
  };
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`[audit] ${flagged} problem${flagged === 1 ? "" : "s"} flagged${flagged ? `: ${JSON.stringify(totals)}` : ""}`);
  console.log(`[audit] report written to ${out}`);
}

main()
  .catch((err) => {
    console.error("[audit] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
