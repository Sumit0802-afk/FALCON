// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Searching everything at once
//
//  The category lists hold a chosen part of each open icon set. A search goes
//  further: it asks Iconify's own search, which covers every icon in every
//  set, so far more words find something. The results come back as ordinary
//  assets, so they are shown and placed like the rest.
//
//  Logos and brand marks are left out, as they are everywhere else in Falcon.
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch } from "@/services/api";
import { AssetDef } from "./types";

const ICONIFY = "https://api.iconify.design";

/** Icons are drawn in one colour, so the panel shows them light on its dark cards */
const PREVIEW_COLOR = "%23e5e7eb";

interface IconifySet {
  name: string;
  author?: { name?: string };
  license?: { title?: string; spdx?: string };
  category?: string;
  /** Drawn in its own colours, as opposed to one colour that can be changed */
  palette?: boolean;
}

interface IconifySearch {
  icons: string[];
  collections: Record<string, IconifySet>;
}

// Sets made of company marks, and names that are marks whatever set they are in
const BRAND_SETS = /^(logos|simple-icons|fa-brands|fa6-brands|fa7-brands|cib|brandico|devicon|devicon-plain|skill-icons|bxl|token|token-branded|cryptocurrency|cryptocurrency-color|vscode-icons|file-icons|unjs|material-icon-theme|catppuccin|nonicons|teenyicons-brand|fontisto|entypo-social|zocial|foundation|ion-logo|pajamas|carbon-logo)$/;
const BRAND_NAMES = /(^|-)(logo|logos|brand|google|facebook|twitter|instagram|youtube|tiktok|whatsapp|telegram|android|windows|microsoft|amazon|netflix|spotify|github|gitlab|linkedin|pinterest|snapchat|reddit|paypal|visa|mastercard|bitcoin|ethereum|tesla|nike|adidas|samsung|sony|playstation|xbox|nintendo|disney|uber|airbnb|slack|discord|skype|dropbox|adobe|figma|wechat|twitch|tumblr|vimeo|wordpress|shopify|chrome|firefox|ubuntu|intel|nvidia|docker|nodejs|python|javascript|typescript|aws|azure|firebase)(-|$)/;

function title(words: string): string {
  return words.replace(/[-_]+/g, " ").replace(/^\w/, (ch) => ch.toUpperCase());
}

export interface IconHits {
  /** One-colour icons, placed in the colour the user has chosen */
  icons: AssetDef[];
  /** Art in its own colours: emoji, illustrations, colour icon sets */
  art: AssetDef[];
}

const iconCache = new Map<string, Promise<IconHits>>();

/** Icons and colour art for a word or phrase, from every open set */
export function searchIcons(query: string): Promise<IconHits> {
  const q = query.trim().toLowerCase();
  const cached = iconCache.get(q);
  if (cached) return cached;

  const run = fetch(`${ICONIFY}/search?query=${encodeURIComponent(q)}&limit=160`)
    .then((res) => (res.ok ? (res.json() as Promise<IconifySearch>) : Promise.reject(new Error("search failed"))))
    .then((data) => {
      const hits: IconHits = { icons: [], art: [] };
      for (const id of data.icons || []) {
        const [prefix, name] = id.split(":");
        const set = data.collections?.[prefix];
        if (!prefix || !name || !set) continue;
        if (BRAND_SETS.test(prefix) || /logo|brand/i.test(set.category || "") || BRAND_NAMES.test(name)) continue;
        const url = `${ICONIFY}/${prefix}/${name}.svg`;
        const colour = !!set.palette;
        const def: AssetDef = {
          id: `live-${prefix}-${name}`,
          name: `${title(name)} – ${set.name}`,
          category: "graphics",
          subcategory: colour ? "Colour art" : "Icons",
          tags: name.split("-"),
          keywords: [set.name.toLowerCase()],
          templateId: "art",
          // One-colour icons take the colour chosen in the panel when they are placed
          params: colour ? {} : { recolor: true },
          format: "svg", width: 480, height: 480, editable: false, animated: false,
          style: "flat", colors: [],
          license: set.license?.spdx || set.license?.title || "Open source",
          source: set.name,
          author: set.author?.name || set.name,
          thumbnailUrl: colour ? url : `${url}?color=${PREVIEW_COLOR}`,
          fileUrl: colour ? `${url}?height=512` : url,
        };
        (colour ? hits.art : hits.icons).push(def);
      }
      return hits;
    })
    .catch(() => {
      iconCache.delete(q);
      return { icons: [], art: [] } as IconHits;
    });

  if (iconCache.size > 60) iconCache.clear();
  iconCache.set(q, run);
  return run;
}

export interface PhotoHit {
  url: string;
  width: number;
  height: number;
}

/** Photographs for a word or phrase. Empty when the user is not signed in or nothing is found */
export async function searchPhotos(query: string, signal?: AbortSignal): Promise<PhotoHit[]> {
  try {
    return (await apiFetch<{ photos: PhotoHit[] }>(`/ai/photos?q=${encodeURIComponent(query.trim())}`, { signal })).photos || [];
  } catch {
    return [];
  }
}
