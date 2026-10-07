/**
 * emailSnapshot.ts
 *
 * Sends a design exactly as it was drawn.
 *
 * Mail clients such as Gmail cannot show glow, outlined text, 3D transforms or
 * layered positioning, however the HTML is written. To deliver those designs
 * unchanged, the email is drawn here by a real browser and sent as pictures.
 * The picture is cut around every link, so buttons and links still work.
 *
 * Needs Chrome, Edge or Chromium on the server (CHROME_PATH can point to it).
 * When none is found the caller falls back to ordinary HTML.
 */

import fs from "fs";
import net from "net";
import type { Browser, Page } from "puppeteer-core";
import { stripActiveHtml } from "../templates/email/core/renderHtml";

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
const MAX_HEIGHT = 14000;
/** Tall plain areas are cut into pieces so no single picture is enormous */
const MAX_SLICE = 1400;
const MAX_LINKS = 60;

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

interface Box { x: number; y: number; w: number; h: number }
interface LinkBox extends Box { href: string; label: string }
interface Cell extends Box { href?: string; label?: string }

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Cuts the page into rows of cells so that each link gets a picture of its own */
function layout(links: LinkBox[], height: number): Cell[][] {
  // Links that share a horizontal strip are kept in one row
  const bands: { top: number; bottom: number; links: LinkBox[] }[] = [];
  for (const link of [...links].sort((a, b) => a.y - b.y)) {
    const band = bands[bands.length - 1];
    if (band && link.y < band.bottom) {
      band.bottom = Math.max(band.bottom, link.y + link.h);
      band.links.push(link);
    } else {
      bands.push({ top: link.y, bottom: link.y + link.h, links: [link] });
    }
  }

  const rows: Cell[][] = [];
  const plain = (from: number, to: number) => {
    for (let y = from; y < to; y += MAX_SLICE) rows.push([{ x: 0, y, w: WIDTH, h: Math.min(MAX_SLICE, to - y) }]);
  };

  let cursor = 0;
  for (const band of bands) {
    if (band.top > cursor) plain(cursor, band.top);
    const row: Cell[] = [];
    let x = 0;
    for (const link of band.links.sort((a, b) => a.x - b.x)) {
      // Links lying over one another cannot each have their own cell; the first keeps it
      if (link.x < x) continue;
      if (link.x > x) row.push({ x, y: band.top, w: link.x - x, h: band.bottom - band.top });
      row.push({ x: link.x, y: band.top, w: link.w, h: band.bottom - band.top, href: link.href, label: link.label });
      x = link.x + link.w;
    }
    if (x < WIDTH) row.push({ x, y: band.top, w: WIDTH - x, h: band.bottom - band.top });
    rows.push(row);
    cursor = band.bottom;
  }
  if (cursor < height) plain(cursor, height);
  return rows;
}

/**
 * Draws the email in a browser and returns it as a picture-based message.
 * Throws when no browser is available or the design cannot be drawn.
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
    await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;caret-color:transparent!important}html,body{overflow-x:hidden!important}" });

    const measured = await page.evaluate((maxLinks: number) => {
      const doc = document.documentElement;
      const height = Math.ceil(Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0));
      const links: { x: number; y: number; w: number; h: number; href: string; label: string }[] = [];
      for (const a of Array.from(document.querySelectorAll("a[href]")).slice(0, maxLinks) as any[]) {
        const href = a.getAttribute("href") || "";
        if (!/^(https?:|mailto:|tel:)/i.test(href.trim())) continue;
        const r = a.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        links.push({ x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height, href: href.trim(), label: (a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120) });
      }
      const background = getComputedStyle(document.body).backgroundColor;
      const rootBackground = getComputedStyle(doc).backgroundColor;
      const text = (document.body ? document.body.innerText : "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 20000);
      return { height, links, background: /rgba?\(0, 0, 0, 0\)|transparent/.test(background) ? rootBackground : background, text };
    }, MAX_LINKS);

    const height = Math.min(Math.max(measured.height, 50), MAX_HEIGHT);
    const links: LinkBox[] = measured.links
      .map((l) => {
        const x = Math.max(0, Math.floor(l.x));
        const y = Math.max(0, Math.floor(l.y));
        return { ...l, x, y, w: Math.min(WIDTH, Math.ceil(l.x + l.w)) - x, h: Math.min(height, Math.ceil(l.y + l.h)) - y };
      })
      .filter((l) => l.w > 3 && l.h > 3);
    const rows = layout(links, height);

    const attachments: EmailAttachment[] = [];
    const stamp = Date.now().toString(36);
    const picture = async (cell: Cell, alt: string): Promise<string> => {
      const shot = await page.screenshot({ type: "jpeg", quality: 90, clip: { x: cell.x, y: cell.y, width: cell.w, height: cell.h }, captureBeyondViewport: true });
      const cid = `falcon-${stamp}-${attachments.length}@falcon`;
      attachments.push({ filename: `design-${attachments.length + 1}.jpg`, content: Buffer.from(shot), cid, contentType: "image/jpeg" });
      const img = `<img src="cid:${cid}" width="${cell.w}" alt="${escapeAttr(alt)}" style="display:block;width:100%;max-width:${cell.w}px;height:auto;border:0;outline:none;text-decoration:none;">`;
      return cell.href ? `<a href="${escapeAttr(cell.href)}" target="_blank" style="display:block;text-decoration:none;">${img}</a>` : img;
    };

    const summary = measured.text.replace(/\s+/g, " ").slice(0, 300);
    const TABLE = `role="presentation" cellpadding="0" cellspacing="0" border="0"`;
    let body = "";
    let first = true;
    for (const row of rows) {
      let cells = "";
      for (const cell of row) {
        // The first picture carries the email's words, for readers who have pictures turned off
        const alt = cell.href ? cell.label || "Link" : first ? summary : "";
        first = false;
        const pct = Math.round((cell.w / WIDTH) * 10000) / 100;
        cells += `<td width="${pct}%" valign="top" style="padding:0;font-size:0;line-height:0;width:${pct}%;">${await picture(cell, alt)}</td>`;
      }
      body += `<tr><td style="padding:0;font-size:0;line-height:0;"><table ${TABLE} width="100%" style="width:100%;border-collapse:collapse;"><tr>${cells}</tr></table></td></tr>`;
    }

    const background = /^rgba?\(/.test(measured.background) && !/rgba?\(0, 0, 0, 0\)/.test(measured.background) ? measured.background : "#ffffff";
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeAttr(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${background};">
<table ${TABLE} width="100%" style="width:100%;background-color:${background};border-collapse:collapse;">
<tr><td align="center" style="padding:0;">
<table ${TABLE} width="${WIDTH}" style="width:100%;max-width:${WIDTH}px;border-collapse:collapse;">
${body}
</table>
</td></tr>
</table>
</body>
</html>`;

    const linkList = [...new Set(links.map((l) => (l.label ? `${l.label}: ${l.href}` : l.href)))].join("\n");
    const text = [measured.text, linkList].filter(Boolean).join("\n\n") || title;
    return { html, text, attachments };
  } finally {
    await page.close().catch(() => undefined);
  }
}
