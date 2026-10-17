/**
 * emailImages.ts
 *
 * Checks every picture a design refers to before it is sent.
 *
 * A mail app fetches pictures itself, from wherever the recipient is, so each
 * one has to be at a public web address. Addresses that only mean something on
 * the sender's computer (a local file, a blob, localhost, a path relative to
 * the editor) would arrive broken. Pictures are never attached to the message:
 * mail apps list every attached picture as a file, even one placed in the body.
 *
 * Pictures written into the HTML itself (data: addresses) are moved to this
 * server's picture folder when it has a public address, since Gmail and
 * Outlook do not show them otherwise.
 */

import * as cheerio from "cheerio";
import { canHostEmailPictures, hostEmailPicture } from "./emailSnapshot";
import { isPublicUrl } from "../utils/netSafety";

export interface CheckedEmail {
  html: string;
  /** Pictures recipients will not see, because their address does not work outside this computer */
  unreachable: number;
}

const DATA_IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,([a-z0-9+/=\s]+)$/i;

/** A picture address as it should be sent, or null when recipients could not load it */
function resolve(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  // Already part of the message or meant for the mail app itself
  if (/^cid:/i.test(value)) return null;
  if (value.startsWith("//")) return isPublicUrl(`https:${value}`) ? `https:${value}` : null;

  const data = DATA_IMAGE.exec(value);
  if (data) {
    if (!canHostEmailPictures()) return null;
    const ext = data[1].toLowerCase().replace("jpeg", "jpg");
    return hostEmailPicture(Buffer.from(data[2].replace(/\s+/g, ""), "base64"), ext);
  }

  return /^https?:\/\//i.test(value) && isPublicUrl(value) ? value : null;
}

export function checkEmailImages(html: string): CheckedEmail {
  let $: cheerio.CheerioAPI;
  try {
    $ = cheerio.load(html);
  } catch {
    return { html, unreachable: 0 };
  }
  let unreachable = 0;
  const fix = (raw: string): string => {
    const next = resolve(raw);
    if (next === null) {
      unreachable++;
      return raw;
    }
    return next;
  };

  $("img[src]").each((_, el) => {
    const node = $(el);
    node.attr("src", fix(node.attr("src") || ""));
    // Kept from spilling out of a narrow screen, without touching the size it was given
    const style = node.attr("style") || "";
    if (!/max-width\s*:/i.test(style)) node.attr("style", `${style}${style && !/;\s*$/.test(style) ? ";" : ""}max-width:100%`);
  });

  $("[background]").each((_, el) => {
    const node = $(el);
    const value = node.attr("background") || "";
    // The attribute also takes colours in some old markup; only addresses are checked
    if (/[/.:]/.test(value)) node.attr("background", fix(value));
  });

  const inStyle = (css: string) =>
    css.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (_match, quote: string, address: string) => `url(${quote}${fix(address)}${quote})`);

  $("[style]").each((_, el) => {
    const node = $(el);
    const style = node.attr("style") || "";
    if (/url\(/i.test(style)) node.attr("style", inStyle(style));
  });

  return { html: unreachable || $("img,[background],[style*='url(']").length ? $.html() : html, unreachable };
}
