/**
 * emailSnapshot.ts
 *
 * Gets a design into real inboxes looking the way it was made.
 *
 * Mail apps such as Gmail cannot show glow, outlined text or 3D transforms,
 * however the HTML is written. So the design is opened in a real browser, the
 * few parts that depend on those effects are drawn as pictures with a clear
 * background, and they are put back into the live HTML in place of the
 * originals. Everything else stays real: text can be selected and buttons are
 * ordinary links.
 *
 * Needs Chrome, Edge or Chromium on the server (CHROME_PATH can point to it).
 * When none is found the caller falls back to HTML without the pictures.
 *
 * Pictures travel inside the message unless EMAIL_ASSET_BASE_URL gives this
 * server's public address for them; mail apps list embedded pictures as
 * attachments, and fetched ones not.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import net from "net";
import type { Browser, Page } from "puppeteer-core";
import { stripActiveHtml } from "../templates/email/core/renderHtml";
import { inlineEmailStyles } from "./emailInliner";

// The measuring function below runs inside the page, where these exist
declare const document: any;
declare const window: any;
declare function getComputedStyle(element: any): any;

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  cid: string;
  contentType: string;
}

export interface EmailSnapshot {
  html: string;
  text: string;
  attachments: EmailAttachment[];
}

/** Width the design is drawn at, in CSS pixels */
const WIDTH = 720;
/** Pictures are drawn at twice the size so they stay sharp on dense screens */
const SCALE = 2;
/** More pictures than this and the email stops being mostly text */
const MAX_PICTURES = 6;
/** Where pictures are kept when they are served from this server */
export const EMAIL_ASSET_DIR = path.join(__dirname, "..", "storage", "email-assets");

function findBrowser(): string | null {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function canSnapshotEmails(): boolean {
  return findBrowser() !== null;
}

let browser: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser) {
    const running = await browser.catch(() => null);
    if (running && running.connected) return running;
    browser = null;
  }
  const executablePath = findBrowser();
  if (!executablePath) throw new Error("No browser available");
  const puppeteer = (await import("puppeteer-core")).default;
  browser = puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--disable-extensions", "--force-color-profile=srgb"],
  });
  browser.catch(() => { browser = null; });
  return browser;
}

/** The design may load pictures and fonts from the web, but nothing on this machine or its network */
function isPublicUrl(raw: string): boolean {
  if (raw.startsWith("data:") || raw === "about:blank") return true;
  let url: URL;
  try { url = new URL(raw); } catch { return false; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (net.isIPv4(host)) {
    const [a, b] = host.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)) return false;
  }
  if (net.isIPv6(host) && (host === "::1" || host === "::" || /^f[cde]/.test(host) || host.startsWith("::ffff:"))) return false;
  return true;
}

interface Effect {
  id: number;
  /** The area to draw, in page pixels: the element plus room for its glow */
  x: number; y: number; w: number; h: number;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Runs in the page. Finds the parts of the design a mail app cannot draw and
 * marks each with data-fx-id: 3D objects, and headline text that is outlined,
 * gradient-filled or glowing. Text inside links is left alone so buttons stay real.
 */
function markEffects(pageWidth: number, maxPictures: number): Effect[] {
  const all: any[] = Array.from(document.body.querySelectorAll("*"));
  const seen = (el: any) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 2 && r.height > 2 && cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.02;
  };
  const words = (el: any) => String(el.innerText || "").replace(/\s+/g, " ").trim();
  const ownText = (el: any) => Array.from(el.childNodes as any[]).some((n: any) => n.nodeType === 3 && String(n.textContent).trim());

  for (const el of all) {
    if (getComputedStyle(el).transformStyle !== "preserve-3d" || !seen(el) || el.closest("[data-fx]")) continue;
    // The stage a 3D object stands on goes with it, as long as it holds nothing else
    let target = el;
    const tall = el.getBoundingClientRect().height;
    while (
      target.parentElement && target.parentElement !== document.body &&
      words(target.parentElement) === words(target) &&
      !target.parentElement.querySelector("img,a") &&
      target.parentElement.getBoundingClientRect().height <= Math.max(tall * 2.5, tall + 120)
    ) target = target.parentElement;
    target.setAttribute("data-fx", "3d");
  }

  for (const el of all) {
    if (el.closest("[data-fx]") || el.closest("a") || !ownText(el) || !seen(el)) continue;
    const cs = getComputedStyle(el);
    const outlined = parseFloat(cs.webkitTextStrokeWidth) > 0;
    const filled = (cs.webkitBackgroundClip || cs.backgroundClip) === "text";
    // A faint shadow on small text is not worth turning words into a picture
    const glowing = cs.textShadow !== "none" && parseFloat(cs.fontSize) >= 28;
    if (outlined || filled || glowing) el.setAttribute("data-fx", "text");
  }

  // Neighbouring lines of one headline become a single picture, which keeps their spacing
  for (const el of Array.from(document.body.querySelectorAll('[data-fx="text"]')) as any[]) {
    if (!el.parentElement || el.parentElement.hasAttribute("data-fx-run")) continue;
    const run: any[] = [el];
    while (run[run.length - 1].nextElementSibling && run[run.length - 1].nextElementSibling.getAttribute("data-fx") === "text") run.push(run[run.length - 1].nextElementSibling);
    if (run.length < 2) continue;
    const group = document.createElement("div");
    group.setAttribute("data-fx-run", "1");
    el.parentElement.insertBefore(group, el);
    for (const member of run) {
      member.removeAttribute("data-fx");
      group.appendChild(member);
    }
    group.setAttribute("data-fx", "text");
  }

  // Lines of one headline are drawn together
  for (const el of Array.from(document.body.querySelectorAll('[data-fx="text"]')) as any[]) {
    const parent = el.parentElement;
    if (!parent || parent === document.body || parent.hasAttribute("data-fx") || ownText(parent)) continue;
    const children: any[] = Array.from(parent.children);
    if (children.length > 1 && children.every((c: any) => c.getAttribute("data-fx") === "text")) {
      for (const c of children) c.removeAttribute("data-fx");
      parent.setAttribute("data-fx", "text");
    }
  }

  const effects: Effect[] = [];
  const marked: any[] = Array.from(document.body.querySelectorAll("[data-fx]"));
  marked.slice(maxPictures).forEach((el: any) => el.removeAttribute("data-fx"));
  marked.slice(0, maxPictures).forEach((el: any, index: number) => {
    const kind = el.getAttribute("data-fx");
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity, glow = kind === "3d" ? 8 : 4;
    for (const node of [el, ...Array.from(el.querySelectorAll("*") as any[])]) {
      const r = node.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) continue;
      left = Math.min(left, r.left); top = Math.min(top, r.top); right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
      const shadow = getComputedStyle(node).textShadow;
      if (shadow && shadow !== "none") {
        for (const px of shadow.match(/-?[\d.]+px/g) || []) glow = Math.max(glow, Math.abs(parseFloat(px)));
      }
    }
    glow = Math.min(glow, 32);
    const x = Math.max(0, Math.floor(left + window.scrollX - glow));
    const y = Math.max(0, Math.floor(top + window.scrollY - glow));
    const w = Math.min(pageWidth, Math.ceil(right + window.scrollX + glow)) - x;
    const h = Math.ceil(bottom + window.scrollY + glow) - y;
    if (w < 4 || h < 4) { el.removeAttribute("data-fx"); return; }

    // What the picture needs to take the element's place is worked out now, while the element is still laid out
    const box = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const holder = el.parentElement.getBoundingClientRect();
    const above = Math.max(0, Math.round((parseFloat(cs.marginTop) || 0) - (box.top + window.scrollY - y)));
    const below = Math.max(0, Math.round((parseFloat(cs.marginBottom) || 0) - (y + h - (box.bottom + window.scrollY))));
    const centre = x + w / 2 - window.scrollX;
    const align = Math.abs(centre - (holder.left + holder.width / 2)) < 8 ? "center" : centre < holder.left + holder.width / 2 ? "left" : "right";
    el.setAttribute("data-fx-id", String(index));
    el.setAttribute("data-fx-place", JSON.stringify({ w, above, below, align, alt: words(el).slice(0, 200) }));
    effects.push({ id: index, x, y, w, h });
  });
  return effects;
}

/** Runs in the page. Shows one marked element alone on a clear background, or puts everything back */
function isolate(id: number | null): void {
  const old = document.getElementById("falcon-fx-style");
  if (old) old.remove();
  for (const el of Array.from(document.querySelectorAll("[data-fx-shot]")) as any[]) el.removeAttribute("data-fx-shot");
  if (id === null) return;
  const target = document.querySelector(`[data-fx-id="${id}"]`);
  if (!target) return;
  target.setAttribute("data-fx-shot", "1");
  const style = document.createElement("style");
  style.id = "falcon-fx-style";
  style.textContent =
    "html,body{background:transparent!important}" +
    "*,*::before,*::after{visibility:hidden!important}" +
    "[data-fx-shot],[data-fx-shot] *,[data-fx-shot]::before,[data-fx-shot]::after,[data-fx-shot] *::before,[data-fx-shot] *::after{visibility:visible!important}";
  document.head.appendChild(style);
}

/** Runs in the page. Swaps each marked element for its picture and returns the document */
function placePictures(): string {
  for (const el of Array.from(document.querySelectorAll("[data-fx-id]")) as any[]) {
    const place = JSON.parse(el.getAttribute("data-fx-place") || "{}");
    const img = document.createElement("img");
    img.setAttribute("src", `falcon-fx:${el.getAttribute("data-fx-id")}`);
    img.setAttribute("width", String(place.w));
    img.setAttribute("alt", place.alt || "");
    const side = place.align === "center" ? "margin:0 auto;" : place.align === "right" ? "margin:0 0 0 auto;" : "margin:0;";
    img.setAttribute("style", `display:block;width:${place.w}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;${side}`);
    const holder = document.createElement("div");
    holder.setAttribute("style", `margin:${place.above}px 0 ${place.below}px;padding:0;font-size:0;line-height:0;text-align:${place.align};`);
    holder.appendChild(img);
    el.replaceWith(holder);
  }
  for (const el of Array.from(document.querySelectorAll("[data-fx]")) as any[]) el.removeAttribute("data-fx");
  return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
}

/**
 * Where a picture can be fetched from by mail apps, when this server has a
 * public address (EMAIL_ASSET_BASE_URL). Without one the picture travels
 * inside the message instead.
 */
function hostPicture(content: Buffer): string | null {
  const base = (process.env.EMAIL_ASSET_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(base) || !isPublicUrl(base)) return null;
  try {
    fs.mkdirSync(EMAIL_ASSET_DIR, { recursive: true });
    const name = `${crypto.randomBytes(16).toString("hex")}.png`;
    fs.writeFileSync(path.join(EMAIL_ASSET_DIR, name), content);
    return `${base}/${name}`;
  } catch {
    return null;
  }
}

/**
 * Turns a design into an email that keeps its look in real inboxes: live HTML
 * with styles on the elements, plus pictures for the few parts that could not
 * be shown otherwise. Throws when no browser is available.
 */
export async function snapshotEmail(sourceHtml: string, title: string): Promise<EmailSnapshot> {
  const instance = await getBrowser();
  const page: Page = await instance.newPage();
  try {
    // Nothing in the design is allowed to run, or to reach private addresses
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (isPublicUrl(request.url())) request.continue().catch(() => undefined);
      else request.abort().catch(() => undefined);
    });
    await page.setViewport({ width: WIDTH, height: 900, deviceScaleFactor: SCALE });
    await page.setContent(stripActiveHtml(sourceHtml), { waitUntil: "load", timeout: 20000 }).catch(() => undefined);
    // Pictures and fonts from the web get a chance to arrive
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => undefined);

    // A picture is one moment. Animations that play once are shown finished, and
    // ones that loop are shown at their starting point, which is the resting look
    await page.evaluate(() => {
      for (const animation of document.getAnimations() as any[]) {
        try {
          const timing = animation.effect ? animation.effect.getComputedTiming() : null;
          if (timing && timing.iterations === Infinity) {
            animation.currentTime = Number(timing.delay) || 0;
            animation.pause();
          } else {
            animation.finish();
          }
        } catch {
          animation.pause();
        }
      }
    }).catch(() => undefined);

    const text = String(await page.evaluate(() => (document.body ? document.body.innerText : ""))).replace(/\n{3,}/g, "\n\n").trim().slice(0, 20000);
    const effects = (await page.evaluate(markEffects, WIDTH, MAX_PICTURES)) as Effect[];

    const attachments: EmailAttachment[] = [];
    const sources = new Map<number, string>();
    const stamp = crypto.randomBytes(6).toString("hex");
    for (const effect of effects) {
      await page.evaluate(isolate, effect.id);
      const shot = Buffer.from(await page.screenshot({
        type: "png", omitBackground: true, captureBeyondViewport: true,
        clip: { x: effect.x, y: effect.y, width: effect.w, height: effect.h },
      }));
      const hosted = hostPicture(shot);
      if (hosted) {
        sources.set(effect.id, hosted);
      } else {
        const cid = `art-${stamp}-${effect.id}@falcon`;
        attachments.push({ filename: `artwork-${attachments.length + 1}.png`, content: shot, cid, contentType: "image/png" });
        sources.set(effect.id, `cid:${cid}`);
      }
    }
    await page.evaluate(isolate, null);

    const rebuilt = String(await page.evaluate(placePictures));
    const html = inlineEmailStyles(rebuilt).replace(/falcon-fx:(\d+)/g, (_match, id: string) => escapeAttr(sources.get(Number(id)) || ""));
    return { html, text: text || title, attachments };
  } finally {
    await page.close().catch(() => undefined);
  }
}
