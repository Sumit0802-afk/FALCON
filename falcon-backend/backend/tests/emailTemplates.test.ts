import "dotenv/config";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createApp } from "../app";
import { connectDatabase, disconnectDatabase, prisma } from "../database/prismaClient";
import { tokenService } from "../services/token.service";
import { emailService } from "../services/email.service";
import { buildFulltextQuery } from "../services/emailTemplate.service";
import { CORE_TARGET, coreFiles, expectedContent } from "../scripts/sync-email-core";
import { allEmailSubcategories } from "../templates/email/catalog";
import { generateEmailTemplates } from "../templates/email/generateTemplates";
import { parseArtParams, renderArt } from "../templates/email/art";
import {
  cloneDocument, compactDocument, createBlock, createDocument, createSection, normalizeDocument,
} from "../templates/email/core/schema";
import { renderEmailHtml } from "../templates/email/core/renderHtml";
import { estimateEmailHeight, renderThumbnailSvg } from "../templates/email/core/renderThumbnail";

// Routes mail into the in-memory test inbox instead of SMTP
process.env.NODE_ENV = "test";

let server: http.Server;
let baseUrl: string;
let passed = 0;
let failed = 0;

function assert(condition: unknown, desc: string) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passed++;
  } else {
    console.error(`[FAIL] ${desc}`);
    failed++;
  }
}

async function request(route: string, options: { method?: string; body?: unknown; token?: string; ip?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
  if (options.ip) headers["X-Forwarded-For"] = options.ip;
  const res = await fetch(`${baseUrl}${route}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const type = res.headers.get("content-type") || "";
  const body: any = type.includes("application/json") ? await res.json() : Buffer.from(await res.arrayBuffer());
  return { status: res.status, body, type, cache: res.headers.get("cache-control") || "" };
}

/** Creates a user with a live session, the same way a completed OTP login does. */
async function createSignedInUser(label: string) {
  const user = await prisma.user.create({
    data: { name: `Email Test ${label}`, email: `email_test_${label}_${Date.now()}@falcon.app`, passwordHash: "not-used", isVerified: true },
  });
  const token = tokenService.sign({ userId: user.id, role: user.role, sessionId: crypto.randomUUID() });
  await prisma.session.create({
    data: {
      userId: user.id,
      sessionTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return { user, token };
}

function unitTests() {
  console.log(`\n--- Shared email core is in sync with the frontend ---`);
  for (const file of coreFiles()) {
    const target = path.join(CORE_TARGET, file);
    assert(fs.existsSync(target) && fs.readFileSync(target, "utf8") === expectedContent(file), `core/${file} matches frontend/src/lib/emailCore/${file}`);
  }

  console.log(`\n--- Schema: normalisation, legacy migration, cloning ---`);
  const legacy = normalizeDocument({
    name: "Old design",
    settings: { emailWidth: 640 },
    blocks: [
      { id: "a", type: "heading", content: "Hello", paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 24, backgroundColor: "transparent" },
      { id: "b", type: "columns2", gap: 20, paddingTop: 8, paddingBottom: 8, paddingLeft: 24, paddingRight: 24, backgroundColor: "#fafafa", columns: [{ id: "c1", content: "Left" }, { id: "c2", content: "Right" }] },
    ],
  });
  assert(legacy.version === 1 && legacy.blocks.length === 2, "Legacy flat blocks become version-1 sections");
  assert(legacy.blocks[1].columns.length === 2 && legacy.blocks[1].columns[0].blocks[0].type === "text", "Legacy columns2 becomes a two-column row of text blocks");
  assert(legacy.document.settings.emailWidth === 640, "Settings survive migration");
  assert(legacy.blocks[0].columns[0].blocks[0].borderWidth === 0, "Fields added later are filled with defaults");

  // A long HTML import produces one flat block per element, far more than the row limit
  const longImport = normalizeDocument({
    blocks: Array.from({ length: 300 }, (_, i) => ({ type: "text", content: `Paragraph ${i}` })),
  });
  const importedTexts = longImport.blocks.flatMap((s) => s.columns.flatMap((c) => c.blocks.map((b: any) => b.content)));
  assert(longImport.blocks.length <= 80, `A 300-block import fits the row limit (${longImport.blocks.length} rows)`);
  assert(importedTexts.length === 300, "No imported block is dropped");
  assert(importedTexts.every((text, i) => text === `Paragraph ${i}`), "Imported blocks keep their order");
  assert(longImport.blocks.every((s) => s.columns.length === 1 && s.columns[0].blocks.length <= 40), "Stacked rows stay within the per-column limit");
  const shortImport = normalizeDocument({ blocks: Array.from({ length: 50 }, () => ({ type: "text", content: "x" })) });
  assert(shortImport.blocks.length === 50, "A short import still gets one row per block");
  const mixedImport = normalizeDocument({
    blocks: [
      ...Array.from({ length: 120 }, () => ({ type: "text", content: "a" })),
      { type: "columns2", columns: [{ content: "L" }, { content: "R" }] },
      ...Array.from({ length: 120 }, () => ({ type: "text", content: "b" })),
    ],
  });
  assert(mixedImport.blocks.length <= 80 && mixedImport.blocks.some((s) => s.columns.length === 2), "Multi-column rows are kept as they are when stacking");
  let tooLong = "";
  try { normalizeDocument({ blocks: Array.from({ length: 3300 }, () => ({ type: "text", content: "x" })) }); } catch (err: any) { tooLong = err.message; }
  assert(/too long/.test(tooLong), "An import beyond what an email can hold is refused with a clear message");

  console.log(`\n--- Exact HTML import: the original document is kept and exported unchanged ---`);
  const original = `<!DOCTYPE html>
<html><head><title>Algo</title><style>.wrap{max-width:600px;margin:0 auto;background:#050505}h1{font-size:64px}</style></head>
<body style="background:#0a0a0a"><div class="wrap"><h1>ALGO</h1><a href="https://example.com" onclick="steal()">Enter</a>
<script>alert(1)</script><a href="javascript:alert(2)">x</a>${"<p>filler paragraph</p>".repeat(4000)}</div></body></html>`;
  const exactDoc = normalizeDocument({
    blocks: [{ type: "section", columns: [{ width: 100, blocks: [{ type: "html", html: original, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }] }] }],
  });
  const exactOut = renderEmailHtml(exactDoc);
  assert(original.length > 60000 && exactOut.includes("filler paragraph</p></div></body></html>"), "A large document is stored whole, not cut off");
  assert(exactOut.includes(".wrap{max-width:600px;margin:0 auto;background:#050505}") && exactOut.includes("h1{font-size:64px}"), "The email's own stylesheet is exported untouched");
  assert(exactOut.startsWith("<!DOCTYPE html>") && !exactOut.includes("fc-container"), "It is not rebuilt inside Falcon's block layout");
  assert(!/<script/i.test(exactOut) && !exactOut.includes("onclick") && !exactOut.includes("javascript:"), "Scripts, event handlers and javascript: links are removed");
  assert(exactOut.includes('<a href="https://example.com">Enter</a>'), "Ordinary links survive");
  const fragmentDoc = normalizeDocument({
    blocks: [{ type: "section", columns: [{ width: 100, blocks: [{ type: "html", html: "<p>Just a snippet</p>" }] }] }],
  });
  assert(renderEmailHtml(fragmentDoc).includes("fc-container"), "An HTML snippet block still exports inside the normal layout");
  const mixedDoc = normalizeDocument({
    blocks: [{ type: "section", columns: [{ width: 100, blocks: [{ type: "html", html: original }, { type: "text", content: "After" }] }] }],
  });
  assert(renderEmailHtml(mixedDoc).includes("fc-container"), "A document mixed with other blocks is not treated as an exact import");

  let rejectedFuture = false;
  try { normalizeDocument({ version: 99, blocks: [] }); } catch { rejectedFuture = true; }
  assert(rejectedFuture, "A document from a newer schema version is rejected, not misread");

  const dirty = normalizeDocument({ version: 1, blocks: [{ type: "section", columns: [{ width: 70, blocks: [{ type: "bogus" }, { type: "text", content: "ok", evil: "<script>" }] }, { width: 70, blocks: [] }] }] });
  assert(dirty.blocks[0].columns[0].blocks.length === 1, "Unknown block types are dropped");
  assert(!("evil" in dirty.blocks[0].columns[0].blocks[0]), "Unknown fields are dropped");
  assert(Math.abs(dirty.blocks[0].columns[0].width + dirty.blocks[0].columns[1].width - 100) < 0.01, "Column widths are rebalanced to total 100");

  const doc = createDocument([
    createSection([50, 50], [[createBlock("image", { src: "https://example.com/a.png", width: 240 })], [createBlock("heading", { content: "Title" }), createBlock("button", { text: "Go", linkUrl: "https://example.com" })]]),
    createSection([100], [[createBlock("text", { content: 'Hi <script>alert(1)</script><b onclick="x()">there</b>' }), createBlock("social"), createBlock("footer_block")]]),
  ], { subject: "Subject <1>", preheader: "Peek" });
  const round = normalizeDocument(JSON.stringify(compactDocument(doc)));
  assert(JSON.stringify(round) === JSON.stringify(normalizeDocument(doc)), "Compact storage restores to an identical document");
  const copy = cloneDocument(doc);
  assert(copy.blocks[0].id !== doc.blocks[0].id && copy.blocks[0].columns[0].blocks[0].id !== doc.blocks[0].columns[0].blocks[0].id, "Cloning assigns fresh ids");

  console.log(`\n--- HTML export is email-safe ---`);
  const html = renderEmailHtml(doc);
  assert(html.startsWith("<!DOCTYPE html>") && html.includes('role="presentation"'), "Output is a full document built from presentation tables");
  assert(!/<div[^>]*display:\s*flex/i.test(html) && !html.includes("<svg"), "No flexbox or inline SVG, which mail clients drop");
  assert(html.includes("@media only screen and (max-width:620px)") && html.includes("fc-stack"), "Includes a mobile media query that stacks columns");
  assert(!html.includes("<script") && !html.includes("onclick"), "Scripts and event handlers are stripped from content");
  assert(html.includes("<b>there</b>") || html.includes("<b >there</b>"), "Harmless inline formatting is kept");
  assert(html.includes("&lt;1&gt;"), "Settings text is escaped");
  assert(html.includes('width="240"') && html.includes("max-width:240px"), "Images carry explicit pixel widths for Outlook");
  assert(/<td[^>]*bgcolor="#000000"[^>]*>\s*<a href="https:\/\/example\.com"/.test(html), "Buttons are table cells with a background, not CSS-only");
  assert(html.includes("Arial, Helvetica, sans-serif"), "Fonts fall back to a generic family");
  assert(html.includes("display:none") && html.includes("Peek"), "Preheader text is included but hidden");
  const svg = renderThumbnailSvg(doc, { maxRatio: 1.4 });
  assert(svg.startsWith("<svg") && svg.includes("Title") && !svg.includes("<script"), "Thumbnail SVG is drawn from the document's own content");
  assert(estimateEmailHeight(doc) > 200, "Height is estimated from the layout");

  console.log(`\n--- Generator: deterministic, structurally unique, covers the catalogue ---`);
  const subs = allEmailSubcategories();
  const first = [...generateEmailTemplates(subs.length * 12)];
  const again = [...generateEmailTemplates(subs.length * 12)];
  assert(first.length === subs.length * 12, `Generates the requested number (${first.length})`);
  assert(first.every((t, i) => t.slug === again[i].slug && t.templateData === again[i].templateData), "Same input always yields the same templates");
  assert(new Set(first.map((t) => t.slug)).size === first.length, "Slugs are unique");
  assert(new Set(first.map((t) => t.fingerprint)).size === first.length, "Fingerprints are unique");
  const bySub = new Map<string, Set<string>>();
  for (const t of first) bySub.set(t.subcategorySlug, (bySub.get(t.subcategorySlug) || new Set()).add(t.layoutKey));
  assert([...bySub.values()].every((layouts) => layouts.size === 12), "Within a subcategory every template has a different layout");
  assert(bySub.size === subs.length, `Every subcategory is covered (${bySub.size})`);
  assert(first.every((t) => normalizeDocument(t.templateData).blocks.length >= 4 && t.blockCount >= 6), "Every template is a multi-section, multi-block document");
  assert(first.every((t) => t.height > 400 && t.tags.length >= 6), "Every template has dimensions and tags");
  assert(new Set(first.map((t) => t.paletteKey)).size >= 15 && new Set(first.map((t) => t.fontKey)).size >= 10, "Palettes and typography vary across the set");
  assert(first.some((t) => t.title.startsWith("Diwali")) && first.some((t) => t.tags.includes("diwali")), "Occasion themes such as Diwali are generated and tagged");
  const withPhotos = first.filter((t) => t.templateData.includes("images.unsplash.com/photo-"));
  assert(withPhotos.length > first.length * 0.4 && withPhotos.length < first.length * 0.8, `A share of templates use real photos (${withPhotos.length} of ${first.length}); the rest use generated artwork`);
  assert(withPhotos.every((t) => t.tags.includes("photo")) && withPhotos.every((t) => !t.templateData.includes("/email-assets/art/")), "A template uses one kind of imagery throughout and is tagged for it");
  const photoSvg = renderThumbnailSvg(withPhotos[0].document);
  assert(photoSvg.includes("<image href=\"https://images.unsplash.com/photo-"), "Previews of photo templates draw the real photos");

  console.log(`\n--- Artwork and search helpers ---`);
  const art = renderArt(parseArtParams("orbs", "2451e6-6d8cf5-c9d6fd", "7", "120x80.png")!);
  assert(art.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) && art.readUInt32BE(16) === 120 && art.readUInt32BE(20) === 80, "Artwork is a valid PNG of the requested size");
  assert(parseArtParams("orbs", "2451e6-6d8cf5", "7", "9000x9000.png") === null && parseArtParams("nope", "2451e6-6d8cf5", "7", "10x10.png") === null, "Oversized or unknown artwork requests are refused");
  assert(buildFulltextQuery("Restaurant promotion for the weekend!") === "+restaurant* +promotion* +weekend*", "Search drops stopwords and short words, and requires every remaining term");
}

async function apiTests() {
  const total = await prisma.emailTemplate.count({ where: { status: "published" } });
  console.log(`\n(library currently holds ${total.toLocaleString()} published templates)`);
  if (total === 0) {
    assert(false, "Library is empty: run `npm run email:seed` before the API tests");
    return;
  }
  const alice = await createSignedInUser("alice");
  const bob = await createSignedInUser("bob");
  let touched: { id: string; usageCount: number; lastUsedAt: Date | null } | null = null;

  try {
    console.log(`\n--- Browsing: pagination never returns the whole library ---`);
    const page1 = await request("/email-templates?limit=12");
    assert(page1.status === 200 && page1.body.items.length === Math.min(12, total), "First page returns the requested page size");
    assert(page1.body.total === total, "Total reflects the whole library");
    assert(!("templateData" in page1.body.items[0]) && !("html" in page1.body.items[0]), "List items carry metadata only, not documents");
    const capped = await request("/email-templates?limit=5000");
    assert(capped.body.items.length <= 60, "Page size is capped server-side");
    if (page1.body.nextCursor) {
      const page2 = await request(`/email-templates?limit=12&cursor=${encodeURIComponent(page1.body.nextCursor)}`);
      const ids = new Set(page1.body.items.map((t: any) => t.id));
      assert(page2.status === 200 && page2.body.items.length > 0 && page2.body.items.every((t: any) => !ids.has(t.id)), "Cursor returns the next page with no repeats");
    }
    for (const sort of ["popular", "newest", "featured", "trending"]) {
      const res = await request(`/email-templates?limit=6&sort=${sort}`);
      assert(res.status === 200 && res.body.items.length > 0, `sort=${sort} responds with templates`);
    }
    assert((await request("/email-templates?cursor=garbage")).status === 400, "A malformed cursor is a 400, not a crash");

    console.log(`\n--- Categories, filters and search ---`);
    const cats = await request("/email-templates/categories");
    const tree = cats.body.categories as any[];
    assert(cats.status === 200 && tree.length >= 10 && tree.every((c) => c.children.length > 0), "Category tree with subcategories");
    assert(tree.reduce((sum, c) => sum + c.count, 0) === total, "Category counts add up to the library total");
    assert(Array.isArray(cats.body.tags) && cats.body.tags.length > 0 && cats.body.tags[0].count >= cats.body.tags[cats.body.tags.length - 1].count, "Popular tags come back ordered by use");
    const restaurant = await request("/email-templates?category=restaurant&limit=12");
    assert(restaurant.body.items.length > 0 && restaurant.body.items.every((t: any) => t.category.slug === "restaurant"), "Category filter only returns that category");
    const flash = await request("/email-templates?subcategory=flash-sale&limit=12");
    assert(flash.body.items.length > 0 && flash.body.items.every((t: any) => t.subcategory.slug === "flash-sale"), "Subcategory filter only returns that subcategory");
    assert((await request("/email-templates?category=does-not-exist")).body.total === 0, "Unknown category returns nothing");
    const premium = await request("/email-templates?premium=true&limit=6");
    const free = await request("/email-templates?premium=false&limit=6");
    assert(premium.body.items.every((t: any) => t.isPremium) && free.body.items.every((t: any) => !t.isPremium), "Premium and free filters are exclusive");

    const diwali = await request("/email-templates/search?q=Diwali&limit=12");
    assert(diwali.body.total > 0 && diwali.body.items.every((t: any) => /diwali/i.test(`${t.title} ${t.tags.join(" ")}`)), `"Diwali" finds festival templates (${diwali.body.total})`);
    const food = await request(`/email-templates/search?q=${encodeURIComponent("restaurant promotion")}&limit=12`);
    assert(food.body.total > 0 && food.body.items.every((t: any) => t.category.slug === "restaurant"), `"restaurant promotion" finds restaurant marketing templates (${food.body.total})`);
    const news = await request("/email-templates/search?q=newsletter&limit=12");
    assert(news.body.total > 0 && news.body.items.every((t: any) => /newsletter/i.test(`${t.title} ${t.subcategory.name} ${t.tags.join(" ")}`)), `"newsletter" finds newsletter templates (${news.body.total})`);
    const tagged = await request("/email-templates?tag=dark&limit=6");
    assert(tagged.body.items.length > 0 && tagged.body.items.every((t: any) => t.tags.includes("dark")), "Tag filter only returns templates with that tag");
    assert((await request(`/email-templates/search?q=${encodeURIComponent("zzqqxxnotaword")}`)).body.total === 0, "A search with no matches returns an empty page");
    assert((await request(`/email-templates/search?q=${encodeURIComponent("'; DROP TABLE users; --")}`)).status === 200, "Search input is parameterised");

    console.log(`\n--- Template detail, preview and artwork ---`);
    const card = page1.body.items[0];
    const detail = await request(`/email-templates/${card.id}`);
    const template = detail.body.template;
    assert(detail.status === 200 && template.templateData.version === 1 && template.templateData.blocks.length > 0, "Detail returns the editable document");
    assert(template.html.startsWith("<!DOCTYPE html>"), "Detail returns exported HTML");
    assert(!template.html.includes('src="/api/') && /(src|background)="https?:\/\/(localhost:\d+\/api\/email-assets\/art\/|images\.unsplash\.com\/photo-)/.test(template.html), "Images are absolute URLs (generated artwork or real photos)");
    assert((await request(`/email-templates/${card.slug}`)).body.template?.id === card.id, "Detail also resolves by slug");
    assert((await request("/email-templates/not-a-real-id")).status === 404, "Unknown template is a 404");
    const thumb = await request(card.thumbnailUrl.replace("/api", ""));
    assert(thumb.status === 200 && thumb.type.includes("image/svg+xml") && thumb.body.toString().startsWith("<svg"), "Thumbnail endpoint serves an SVG preview");
    assert(thumb.cache.includes("immutable"), "Versioned thumbnails are cached long-term");
    const artUrl = /http:\/\/localhost:\d+\/api(\/email-assets\/art\/[^"')]+\.png)/.exec(template.html);
    if (artUrl) {
      const img = await request(artUrl[1]);
      assert(img.status === 200 && img.type === "image/png" && img.body.length > 500, "Template artwork is served as PNG");
    }
    assert((await request("/email-assets/art/orbs/2451e6-6d8cf5/1/9999x9999.png")).status === 404, "Oversized artwork requests are rejected");

    console.log(`\n--- Use this template: clones, never edits the original ---`);
    assert((await request(`/email-templates/${card.id}/use`, { method: "POST" })).status === 401, "Using a template requires sign-in");
    touched = await prisma.emailTemplate.findUnique({ where: { id: card.id }, select: { id: true, usageCount: true, lastUsedAt: true } });
    const before = await prisma.emailTemplateContent.findUnique({ where: { templateId: card.id } });
    const used = await request(`/email-templates/${card.id}/use`, { method: "POST", token: alice.token });
    assert(used.status === 201 && typeof used.body.designId === "string", "Returns a new design owned by the user");
    const mineAfterUse = await request(`/user/email-templates/${used.body.designId}`, { token: alice.token });
    assert(mineAfterUse.body.template.sourceTemplateId === card.id, "The copy remembers which template it came from");
    assert(mineAfterUse.body.template.templateData.blocks.length === template.templateData.blocks.length, "The copy has the same structure");

    const edited = mineAfterUse.body.template.templateData;
    const firstBlock = edited.blocks.flatMap((s: any) => s.columns.flatMap((c: any) => c.blocks)).find((b: any) => b.type === "heading" || b.type === "text" || b.type === "logo");
    if (firstBlock.type === "logo") firstBlock.text = "EDITED BY TEST"; else firstBlock.content = "EDITED BY TEST";
    const saved = await request(`/user/email-templates/${used.body.designId}`, { method: "PUT", token: alice.token, body: { name: "My edited copy", templateData: edited } });
    assert(saved.status === 200 && saved.body.template.name === "My edited copy", "The copy can be edited and renamed");
    const reread = await request(`/user/email-templates/${used.body.designId}`, { token: alice.token });
    assert(JSON.stringify(reread.body.template.templateData).includes("EDITED BY TEST") && reread.body.template.html.includes("EDITED BY TEST"), "Edits are stored and the HTML is re-exported on save");
    const after = await prisma.emailTemplateContent.findUnique({ where: { templateId: card.id } });
    assert(before!.templateData === after!.templateData && !after!.templateData.includes("EDITED BY TEST"), "The library original is byte-for-byte unchanged");
    const usage = await prisma.emailTemplate.findUnique({ where: { id: card.id }, select: { usageCount: true, lastUsedAt: true } });
    assert(usage!.usageCount >= 1 && usage!.lastUsedAt !== null, "Usage is counted from real use");
    const recent = await request("/email-templates/recent", { token: alice.token });
    assert(recent.body.items[0]?.id === card.id, "Recently used lists the template");

    console.log(`\n--- Favorites ---`);
    assert((await request(`/email-templates/${card.id}/favorite`, { method: "POST" })).status === 401, "Favoriting requires sign-in");
    const fav = await request(`/email-templates/${card.id}/favorite`, { method: "POST", token: alice.token });
    await request(`/email-templates/${card.id}/favorite`, { method: "POST", token: alice.token });
    const counted = await prisma.emailTemplate.findUnique({ where: { id: card.id }, select: { favoriteCount: true } });
    assert(fav.body.isFavorite === true && counted!.favoriteCount === fav.body.favoriteCount, "Favoriting twice counts once");
    const favList = await request("/email-templates?favorites=true", { token: alice.token });
    assert(favList.body.items.length === 1 && favList.body.items[0].id === card.id && favList.body.items[0].isFavorite, "Favorites view lists it");
    assert((await request("/email-templates?favorites=true", { token: bob.token })).body.items.length === 0, "Favorites are per user");
    const unfav = await request(`/email-templates/${card.id}/favorite`, { method: "DELETE", token: alice.token });
    assert(unfav.body.isFavorite === false && unfav.body.favoriteCount === fav.body.favoriteCount - 1, "Unfavoriting restores the count");

    console.log(`\n--- My Templates: create, list, rename, duplicate, delete ---`);
    assert((await request("/user/email-templates")).status === 401, "My Templates requires sign-in");
    const blank = await request("/user/email-templates", { method: "POST", token: alice.token, body: { name: "From scratch" } });
    assert(blank.status === 201 && blank.body.template.templateData.blocks.length > 0, "Creates a design from scratch");
    const dup = await request(`/user/email-templates/${blank.body.template.id}/duplicate`, { method: "POST", token: alice.token });
    assert(dup.status === 201 && dup.body.template.name === "From scratch (copy)" && dup.body.template.id !== blank.body.template.id, "Duplicates a design");
    const list = await request("/user/email-templates?limit=2", { token: alice.token });
    assert(list.body.total === 3 && list.body.items.length === 2 && !!list.body.nextCursor && list.body.items[0].thumbnailSvg.startsWith("<svg"), "Lists designs page by page with previews");
    const rest = await request(`/user/email-templates?limit=2&cursor=${list.body.nextCursor}`, { token: alice.token });
    assert(rest.body.items.length === 1 && rest.body.nextCursor === null, "Second page returns the remainder");
    const bad = await request("/user/email-templates", { method: "POST", token: alice.token, body: { templateData: { version: 42, blocks: [] } } });
    assert(bad.status === 400, "An unreadable document is rejected with 400");
    assert((await request(`/user/email-templates/${blank.body.template.id}`, { method: "PUT", token: alice.token, body: {} })).status === 400, "An empty update is rejected");

    console.log(`\n--- Ownership: one user cannot touch another's designs ---`);
    const id = used.body.designId;
    assert((await request(`/user/email-templates/${id}`, { token: bob.token })).status === 404, "Cannot read");
    assert((await request(`/user/email-templates/${id}`, { method: "PUT", token: bob.token, body: { name: "hijacked" } })).status === 404, "Cannot edit");
    assert((await request(`/user/email-templates/${id}/duplicate`, { method: "POST", token: bob.token })).status === 404, "Cannot duplicate");
    assert((await request(`/user/email-templates/${id}`, { method: "DELETE", token: bob.token })).status === 404, "Cannot delete");
    assert((await request(`/user/email-templates/${id}`, { token: alice.token })).body.template.name === "My edited copy", "The owner's design is untouched");
    assert((await request("/user/email-templates", { token: bob.token })).body.total === 0, "Lists never include other users' designs");
    const del = await request(`/user/email-templates/${dup.body.template.id}`, { method: "DELETE", token: alice.token });
    assert(del.status === 200 && (await request(`/user/email-templates/${dup.body.template.id}`, { token: alice.token })).status === 404, "The owner can delete their own design");

    console.log(`\n--- Send test email ---`);
    assert((await request("/user/email-templates/send-test", { method: "POST", body: { templateData: edited } })).status === 401, "Sending a test requires sign-in");
    const sent = await request("/user/email-templates/send-test", { method: "POST", token: alice.token, ip: "10.1.0.1", body: { templateData: edited, subject: "Launch day" } });
    const inbox = emailService.getDevLatestDesignTest(alice.user.email);
    assert(sent.status === 200 && sent.body.sentTo === alice.user.email, "The test goes to the signed-in user's own address");
    assert(inbox.subject === "[Test] Launch day" && !!inbox.html?.includes("EDITED BY TEST"), "The email carries the design's exported HTML");
    emailService.failNextSendForTest();
    const failedSend = await request("/user/email-templates/send-test", { method: "POST", token: alice.token, ip: "10.1.0.1", body: { templateData: edited } });
    assert(failedSend.status === 502 && failedSend.body.code === "EMAIL_DELIVERY_FAILED", "A delivery failure is reported without internal detail");
    console.log(`
--- Send email to chosen recipients ---`);
    const html = "<html><body><p>Hello from the send test</p></body></html>";
    assert((await request("/user/email-templates/send", { method: "POST", body: { to: ["a@example.com"], subject: "Hi", html } })).status === 401, "Sending requires sign-in");
    const delivered = await request("/user/email-templates/send", { method: "POST", token: alice.token, ip: "10.1.0.3", body: { to: ["First.Person@Example.com", "second@example.com"], cc: ["copy@example.com"], subject: "Spring sale", html, fromName: "Alice Shop" } });
    assert(delivered.status === 200 && delivered.body.success === true && delivered.body.recipients === 3, "Sends to every recipient and reports the count");
    assert(emailService.getDevLatestDesignTest("first.person@example.com").subject === "Spring sale" && !!emailService.getDevLatestDesignTest("second@example.com").html?.includes("Hello from the send test"), "Each recipient gets the subject and HTML that were sent");
    assert((await request("/user/email-templates/send", { method: "POST", token: alice.token, ip: "10.1.0.3", body: { to: ["not-an-email"], subject: "Hi", html } })).status === 400, "An invalid address is rejected");
    assert((await request("/user/email-templates/send", { method: "POST", token: alice.token, ip: "10.1.0.3", body: { to: [], subject: "Hi", html } })).status === 400, "At least one recipient is required");
    assert((await request("/user/email-templates/send", { method: "POST", token: alice.token, ip: "10.1.0.3", body: { to: Array.from({ length: 20 }, (_v, i) => `p${i}@example.com`), bcc: Array.from({ length: 10 }, (_v, i) => `b${i}@example.com`), subject: "Hi", html } })).status === 400, "More than 25 recipients in one send is refused");
    emailService.failNextSendForTest();
    const undelivered = await request("/user/email-templates/send", { method: "POST", token: alice.token, ip: "10.1.0.3", body: { to: ["a@example.com"], subject: "Hi", html } });
    assert(undelivered.status === 502 && undelivered.body.code === "EMAIL_DELIVERY_FAILED", "A delivery failure is reported, not shown as success");

    let limited = false;
    for (let i = 0; i < 6; i++) limited = (await request("/user/email-templates/send-test", { method: "POST", token: alice.token, ip: "10.1.0.2", body: { templateData: edited } })).status === 429;
    assert(limited, "Test sends are rate limited");
  } finally {
    // Undo the counters this run added to the shared library, then remove the test users
    if (touched) {
      await prisma.emailTemplate.update({ where: { id: touched.id }, data: { usageCount: touched.usageCount, lastUsedAt: touched.lastUsedAt } }).catch(() => null);
    }
    await prisma.user.deleteMany({ where: { id: { in: [alice.user.id, bob.user.id] } } }).catch(() => null);
  }
}

async function run() {
  console.log("=================================================");
  console.log("        FALCON EMAIL TEMPLATE TEST SUITE         ");
  console.log("=================================================");
  try {
    unitTests();
    await connectDatabase();
    server = createApp().listen(4998);
    baseUrl = "http://localhost:4998/api";
    await apiTests();
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    console.log("\n=================================================");
    console.log(` COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log("=================================================");
    server?.close();
    await disconnectDatabase();
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
