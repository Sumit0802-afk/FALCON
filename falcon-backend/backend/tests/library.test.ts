import "dotenv/config";
import http from "http";
import bcrypt from "bcryptjs";
import { createApp } from "../app";
import { connectDatabase, disconnectDatabase, prisma } from "../database/prismaClient";
import { emailService } from "../services/email.service";
import { LIBRARY_COUNTS, LIBRARY_TYPES, LibraryType, buildTemplate, describe, parseTemplateId, signature, templateId } from "../templates/library/generate";
import { renderPageSvg } from "../templates/library/thumbnail";
import { contrastRatio } from "../templates/library/core";

process.env.NODE_ENV = "test";

let baseUrl = "";

async function api(path: string, options: { method?: string; token?: string; body?: unknown } = {}) {
  const started = Date.now();
  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const type = res.headers.get("content-type") || "";
  const body: any = type.includes("json") ? await res.json() : await res.text();
  return { status: res.status, body, type, ms: Date.now() - started, cache: res.headers.get("cache-control") || "" };
}

async function run() {
  console.log("=================================================");
  console.log("        FALCON DESIGN LIBRARY TESTS              ");
  console.log("=================================================");
  let passed = 0;
  let failed = 0;
  const assert = (ok: boolean, text: string) => {
    if (ok) { passed++; console.log(`[PASS] ${text}`); } else { failed++; console.error(`[FAIL] ${text}`); }
  };

  console.log("\n--- Generator: every template is distinct and well formed ---");
  for (const type of LIBRARY_TYPES) {
    const signatures = new Set<string>();
    for (let seq = 1; seq <= LIBRARY_COUNTS[type]; seq++) signatures.add(signature(type, seq));
    assert(signatures.size === LIBRARY_COUNTS[type] && LIBRARY_COUNTS[type] >= (type === "certificate" ? 20000 : 100000), `${LIBRARY_COUNTS[type]} ${type} templates, no two with the same design recipe`);
  }
  assert(templateId("poster", 1) === "POSTER-000001" && templateId("presentation", 100000) === "PRESENTATION-100000", "Ids follow POSTER-000001 / PRESENTATION-100000");
  assert(templateId("certificate", 20000) === "CERTIFICATE-020000" && parseTemplateId("CERTIFICATE-020001") === null && parseTemplateId("CERTIFICATE-000007")?.type === "certificate", "Certificates are numbered CERTIFICATE-000001 to CERTIFICATE-020000");
  assert(parseTemplateId("POSTER-100001") === null && parseTemplateId("poster-000001") === null && parseTemplateId("POSTER-000000") === null, "Ids outside the library are rejected");

  let offPage = 0;
  let lowContrast = 0;
  let emptyText = 0;
  let badIds = 0;
  let elementTotal = 0;
  let checked = 0;
  const lengths = new Set<number>();
  for (const type of LIBRARY_TYPES) {
    for (let seq = 1; seq <= LIBRARY_COUNTS[type]; seq += 211) {
      const pages = buildTemplate(type, seq);
      const entry = describe(type, seq);
      if (pages.length !== entry.slideCount) offPage++;
      lengths.add(pages.length);
      checked++;
      for (const page of pages) {
        const ids = new Set(page.elements.map((e) => e.id));
        if (ids.size !== page.elements.length) badIds++;
        elementTotal += page.elements.length;
        for (const el of page.elements) {
          if (el.type !== "text") continue;
          if (!String(el.text).trim()) emptyText++;
          if (el.x < -2 || el.y < -2 || el.x + el.width > page.width + 2 || el.y + el.height > page.height + 2) offPage++;
        }
      }
      // The headline must be readable against the page it sits on
      const palette = entry.palette.split(",");
      if (contrastRatio(palette[0], palette[3]) < 4.5) lowContrast++;
    }
  }
  assert(checked > 900 && offPage === 0, `No text runs off its page in ${checked} sampled templates (${elementTotal} elements)`);
  assert(emptyText === 0 && badIds === 0, "Every text element has content and every element id is unique on its page");
  assert(lowContrast === 0, "Every palette keeps body text at accessible contrast against its background");
  assert([5, 8, 10, 12, 15, 20, 25, 30].every((n) => lengths.has(n)), "Decks come in 5, 8, 10, 12, 15, 20, 25 and 30 slides");
  const again = JSON.stringify(buildTemplate("presentation", 4242));
  assert(again === JSON.stringify(buildTemplate("presentation", 4242)), "A template rebuilds to exactly the same design every time");
  const deck = buildTemplate("presentation", 4242);
  const families = new Set(deck.flatMap((p) => p.elements.filter((e) => e.type === "text").map((e) => e.fontFamily)));
  assert(new Set(deck.map((p) => p.background)).size === 1 && families.size <= 2, "All slides of a deck share one background and at most two typefaces");
  const svg = renderPageSvg(buildTemplate("poster", 77)[0]);
  assert(svg.startsWith("<svg") && svg.includes("<text") && !/<script/i.test(svg), "A page renders to an SVG preview with no script");

  console.log("\n--- API ---");
  await connectDatabase();
  const server: http.Server = createApp().listen(4995);
  baseUrl = "http://localhost:4995/api";
  const userIds: string[] = [];
  try {
    const counts = await Promise.all(LIBRARY_TYPES.map((type) => prisma.libraryTemplate.count({ where: { type } })));
    assert(counts[0] >= 100000 && counts[1] >= 100000 && counts[2] >= 20000, `Database holds ${counts[0]} posters, ${counts[1]} presentations and ${counts[2]} certificates`);

    const certs = await api("/library?type=certificate&subcategory=internship&orientation=landscape&limit=12");
    assert(certs.status === 200 && certs.body.items.length === 12 && certs.body.items.every((c: any) => /^CERTIFICATE-\d{6}$/.test(c.id) && c.subcategory === "internship" && c.width > c.height), "Certificates list and filter by occasion and orientation");
    const related = await api("/library/POSTER-000031/related?limit=6");
    const source = describe("poster", 31);
    assert(related.status === 200 && related.body.items.length === 6 && related.body.items.every((c: any) => c.id !== "POSTER-000031" && c.type === "poster" && (c.subcategory === source.subcategory || c.style === source.style)) && new Set(related.body.items.map((c: any) => c.id)).size === 6, "Related templates share the subject or style, without repeats");
    const framed = buildTemplate("presentation", 10)[0].elements.find((e) => e.type === "frame");
    assert(!!framed && framed.frameShape === "circle" && /^https:/.test(String(framed.imageSrc)), "Shaped photos are editor frames with a real picture");
    const certFacets = await api("/library/facets?type=certificate");
    assert(certFacets.body.categories.length === 4 && certFacets.body.sizes.length === 3, "Certificate facets list 4 categories and 3 paper sizes");
    const certThumb = await api(`/library/${certs.body.items[0].id}/thumbnail.svg`);
    assert(certThumb.status === 200 && String(certThumb.body).startsWith("<svg"), "A certificate preview is served as SVG");
    const gold = await api("/library?type=certificate&q=" + encodeURIComponent("gold achievement"));
    assert(gold.status === 200 && gold.body.items.length > 0, "Certificates can be searched by words");

    const first = await api("/library?type=poster&limit=24");
    assert(first.status === 200 && first.body.items.length === 24 && !!first.body.nextCursor, "Listing returns one page, not the library");
    assert(first.body.total >= 100000, `Total reports the whole poster library (${first.body.total})`);
    const card = first.body.items[0];
    assert(/^POSTER-\d{6}$/.test(card.id) && card.editable === true && card.width > 0 && Array.isArray(card.palette) && !("keywords" in card), "Cards carry id, size, palette and an editable flag, without search text");
    const second = await api(`/library?type=poster&limit=24&cursor=${encodeURIComponent(first.body.nextCursor)}`);
    const seen = new Set([...first.body.items, ...second.body.items].map((i: any) => i.id));
    assert(second.status === 200 && seen.size === 48, "The next page continues without repeating a template");
    assert((await api("/library?type=poster&limit=5000")).body.items.length <= 48, "A page is capped at 48 however many are asked for");
    assert((await api("/library")).status === 400 && (await api("/library?type=video")).status === 400, "A missing or unknown type is refused");

    const filtered = await api("/library?type=poster&subcategory=hackathon&style=neon&size=story");
    assert(filtered.body.items.length > 0 && filtered.body.items.every((i: any) => i.subcategory === "hackathon" && i.style === "neon" && i.sizeId === "story"), "Category, style and size filters combine");
    const slides = await api("/library?type=presentation&slides=10&aspect=16:9&color=blue");
    assert(slides.body.items.length > 0 && slides.body.items.every((i: any) => i.slideCount === 10 && i.aspect === "16:9" && i.colorFamily === "blue"), "Presentations filter by slide count, aspect ratio and colour");
    const long = await api("/library?type=presentation&slides=25%2B");
    assert(long.body.items.length > 0 && long.body.items.every((i: any) => i.slideCount >= 25), "\"25+\" returns decks of 25 slides or more");

    const searches: [LibraryType, string, RegExp][] = [
      ["poster", "dark tech hackathon poster", /hackathon/i],
      ["presentation", "minimal business presentation", /minimal/i],
      ["poster", "college coding event", /coding|college/i],
      ["presentation", "AI startup pitch deck", /startup|artificial|pitch/i],
      ["poster", "modern recruitment poster", /recruitment/i],
      ["presentation", "cybersecurity presentation", /cybersecurity/i],
    ];
    for (const [type, q, expect] of searches) {
      const res = await api(`/library?type=${type}&q=${encodeURIComponent(q)}`);
      const hits = res.body.items || [];
      assert(res.status === 200 && hits.length > 0 && hits.every((i: any) => i.type === type) && expect.test(hits[0].title + " " + hits[0].description), `Search "${q}" finds matching ${type}s (${res.body.total} results, ${res.ms} ms)`);
    }
    assert((await api("/library?type=poster&q=zzzqqqxyz")).body.items.length === 0, "A search with no matches returns an empty page");
    assert((await api(`/library?type=poster&q=${encodeURIComponent("'; DROP TABLE users; --")}`)).status === 200, "Search input is treated as text, never as SQL");

    const facets = await api("/library/facets?type=poster");
    const facetSum = facets.body.categories.reduce((n: number, c: any) => n + c.count, 0);
    assert(facets.status === 200 && facetSum === facets.body.total && facets.body.styles.length === 25 && facets.body.sizes.length >= 8, "Facets list categories, 25 styles and sizes, with counts that add up");
    const deckFacets = await api("/library/facets?type=presentation");
    assert(deckFacets.body.categories.length === 5 && deckFacets.body.slideCounts.length === 8, "Presentation facets list 5 categories and 8 deck lengths");

    const thumb = await api(`/library/${card.id}/thumbnail.svg`);
    assert(thumb.status === 200 && thumb.type.includes("image/svg+xml") && String(thumb.body).startsWith("<svg") && /max-age/.test(thumb.cache), "A thumbnail is served as a cacheable SVG");
    const slide3 = await api("/library/PRESENTATION-000123/pages/3.svg");
    assert(slide3.status === 200 && String(slide3.body).startsWith("<svg"), "Any slide of a deck can be previewed");
    assert((await api("/library/PRESENTATION-000123/pages/99.svg")).status === 404 && (await api("/library/POSTER-999999/thumbnail.svg")).status === 404, "Missing pages and unknown templates return 404");
    const design = await api("/library/PRESENTATION-000123/design");
    const entry = describe("presentation", 123);
    assert(design.status === 200 && design.body.pages.length === entry.slideCount && design.body.pages[0].elements.length > 3, `A deck's design returns all ${entry.slideCount} slides with their elements`);

    console.log("\n--- Using and favouriting templates ---");
    assert((await api("/library/POSTER-000010/use", { method: "POST" })).status === 401 && (await api("/library/POSTER-000010/favorite", { method: "POST" })).status === 401, "Using or favouriting a template needs a signed-in user");
    const signIn = async (label: string) => {
      const email = `lib_${label}_${Date.now()}@falcon.app`;
      const user = await prisma.user.create({ data: { name: `Library ${label}`, email, passwordHash: await bcrypt.hash("Password123!", 12) } });
      userIds.push(user.id);
      await api("/auth/login", { method: "POST", body: { email, password: "Password123!" } });
      const verified = await api("/auth/verify-otp", { method: "POST", body: { email, otp: emailService.getDevLatestOtp(email) } });
      return { id: user.id, token: verified.body.token as string };
    };
    const alice = await signIn("alice");
    const bob = await signIn("bob");

    const used = await api("/library/PRESENTATION-000123/use", { method: "POST", token: alice.token });
    assert(used.status === 201 && !!used.body.projectId && used.body.pageCount === entry.slideCount, "Using a deck creates a project with every slide");
    const project = await api(`/projects/${used.body.projectId}`, { token: alice.token });
    const pages = project.body.project?.pages || [];
    assert(project.status === 200 && pages.length === entry.slideCount && pages[0].width === entry.width && Array.isArray(pages[0].elements) && pages[0].elements.length > 3, "The new project opens with the template's slides and editable elements");
    assert((await api(`/projects/${used.body.projectId}`, { token: bob.token })).status !== 200, "Another user cannot open that project");
    const poster = await api("/library/POSTER-000010/use", { method: "POST", token: alice.token });
    assert(poster.status === 201 && poster.body.pageCount === 1, "Using a poster creates a one-page project");
    const usage = await prisma.libraryTemplate.findUnique({ where: { id: "POSTER-000010" }, select: { usageCount: true } });
    assert((usage?.usageCount ?? 0) >= 1, "Usage is counted");

    const fav = await api("/library/POSTER-000010/favorite", { method: "POST", token: alice.token });
    await api("/library/POSTER-000010/favorite", { method: "POST", token: alice.token });
    const favList = await api("/library?type=poster&favorites=true", { token: alice.token });
    assert(fav.status === 200 && favList.body.items.length === 1 && favList.body.items[0].id === "POSTER-000010" && favList.body.items[0].isFavorite === true, "A favourite is saved once and listed for its owner");
    assert((await api("/library?type=poster&favorites=true", { token: bob.token })).body.items.length === 0, "Favourites are private to each user");
    await api("/library/POSTER-000010/favorite", { method: "DELETE", token: alice.token });
    assert((await api("/library?type=poster&favorites=true", { token: alice.token })).body.items.length === 0, "A favourite can be removed");

    console.log("\n--- Speed ---");
    const timings: number[] = [];
    for (const path of ["/library?type=poster", "/library?type=presentation&category=technology", "/library?type=poster&style=minimal&color=white", "/library?type=presentation&sort=newest", "/library?type=poster&q=hackathon"]) {
      await api(path);
      timings.push((await api(path)).ms);
    }
    assert(Math.max(...timings) < 1500, `Listing and searching 200,000 templates stays quick (slowest ${Math.max(...timings)} ms)`);
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    for (const id of userIds) await prisma.user.delete({ where: { id } }).catch(() => null);
    await prisma.libraryTemplate.updateMany({ where: { id: { in: ["POSTER-000010", "PRESENTATION-000123"] } }, data: { usageCount: 0, favoriteCount: 0 } }).catch(() => null);
    server.close();
    await disconnectDatabase();
  }

  console.log("\n=================================================");
  console.log(` COMPLETE: ${passed} PASSED, ${failed} FAILED `);
  console.log("=================================================");
  process.exit(failed > 0 ? 1 : 0);
}

run();
