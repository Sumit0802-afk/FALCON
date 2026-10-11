/**
 * Writes a contact sheet of generated templates to an HTML file, for checking
 * designs by eye while working on the generator.
 *
 *   npx ts-node --transpile-only scripts/preview-library.ts poster 1 40 out.html
 */
import fs from "fs";
import { LibraryType, buildTemplate, describe } from "../templates/library/generate";
import { renderPageSvg } from "../templates/library/thumbnail";

const type = (process.argv[2] || "poster") as LibraryType;
const start = Number(process.argv[3] || 1);
const count = Number(process.argv[4] || 24);
const out = process.argv[5] || "library-preview.html";
const step = Number(process.argv[6] || 1);
const slides = Number(process.argv[7] || 1);

let html = `<!doctype html><meta charset="utf-8"><title>${type} preview</title><style>body{margin:0;background:#15171c;font:12px Arial;color:#ccc}.g{display:flex;flex-wrap:wrap;gap:14px;padding:14px}.c{width:${type === "poster" ? 300 : 460}px}.c svg{width:100%;height:auto;display:block;background:#fff}.c p{margin:6px 0 0}</style><div class="g">`;
let elements = 0;
let serial = 1;
for (let i = 0; i < count; i++) {
  const seq = start + i * step;
  const entry = describe(type, seq);
  const pages = buildTemplate(type, seq, slides);
  for (const page of pages) {
    elements += page.elements.length;
    html += `<div class="c">${renderPageSvg(page).replace(/g1/g, `g${++serial}`)}<p>${entry.id} · ${entry.sizeName} · ${page.name}<br>${entry.title}</p></div>`;
  }
}
html += "</div>";
fs.writeFileSync(out, html);
console.log(`wrote ${out}: ${count} templates, ${elements} elements`);
