// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Real artwork from open sets
//
//  Graphics   icons from open icon sets (Lucide, Tabler, Phosphor, Material
//             Design, Solar and others), which can be placed in any colour
//  Animations Google's animated emoji and animated icon sets
//  3D         Noto and Fluent 3D emoji that picture objects, food, animals…
//
//  The lists are built by scripts/build-elements-catalog.js and fetched the
//  first time a category is opened.
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef } from "./types";

interface IconSet { prefix: string; name: string; author: string; license: string; group: string; icons: string[] }
interface IconCatalogue { base: string; sets: IconSet[] }
interface AnimationCatalogue {
  iconBase: string;
  sets: IconSet[];
  emoji: { name: string; license: string; base: string; items: [string, string, string, string][] };
}
interface EmojiCatalogue {
  sets: { noto3d: { name: string; license: string; base: string } };
  groups: string[];
  items: [string, number, string | 0, string | 0, number, string | 0][];
}

/** Icons are drawn in one colour, so the panel shows them light on its dark cards */
const PREVIEW_COLOR = "%23e5e7eb";

function fetchJson<T>(path: string): Promise<T> {
  return fetch(path).then((res) => (res.ok ? (res.json() as Promise<T>) : Promise.reject(new Error(`${path} missing`))));
}

function title(words: string): string {
  return words.replace(/[-_]+/g, " ").replace(/^\w/, (ch) => ch.toUpperCase());
}

/** Visits every position once in a scattered order, so neighbours come from different sets */
function scatter<T>(list: T[], stride: number): T[] {
  const n = list.length;
  if (n < 3) return list;
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  let step = stride % n || 1;
  while (gcd(step, n) !== 1) step++;
  return list.map((_, i) => list[(i * step) % n]);
}

function base(category: AssetDef["category"], id: string, name: string, subcategory: string, tags: string[], set: { name: string; license: string; author?: string }): AssetDef {
  return {
    id, name, category, subcategory, tags, keywords: [subcategory.toLowerCase(), set.name.toLowerCase()],
    templateId: "art", params: {}, format: "svg", width: 480, height: 480, editable: false, animated: false,
    style: "flat", colors: [], license: set.license, source: set.name, author: set.author || set.name,
  };
}

// ── Graphics: icons ──────────────────────────────────────────────────────────

let icons: Promise<AssetDef[]> | null = null;

export function loadIconAssets(): Promise<AssetDef[]> {
  if (icons) return icons;
  icons = fetchJson<IconCatalogue>("/data/elements-icons.json")
    .then((data) => {
      const list: AssetDef[] = [];
      for (const set of data.sets) {
        for (const icon of set.icons) {
          const url = `${data.base}${set.prefix}/${icon}.svg`;
          list.push({
            ...base("graphics", `icon-${set.prefix}-${icon}`, `${title(icon)} – ${set.name}`, set.group, ["icon", ...icon.split("-")], set),
            thumbnailUrl: `${url}?color=${PREVIEW_COLOR}`,
            fileUrl: url,
            // Placed in the colour the user has chosen in the panel
            params: { recolor: true },
          });
        }
      }
      return scatter(list, 7919);
    })
    .catch(() => {
      icons = null;
      return [];
    });
  return icons;
}

/** The address of an icon in a given colour (a hex value such as "#111827") */
export function iconInColor(def: AssetDef, color: string): string {
  // Asked for large, because these files otherwise describe themselves as one letter high
  return `${def.fileUrl}?color=${encodeURIComponent(color)}&height=512`;
}

// ── Animations ───────────────────────────────────────────────────────────────

let animations: Promise<AssetDef[]> | null = null;

export function loadAnimationAssets(): Promise<AssetDef[]> {
  if (animations) return animations;
  animations = fetchJson<AnimationCatalogue>("/data/elements-animations.json")
    .then((data) => {
      const list: AssetDef[] = [];
      const emojiSet = { name: data.emoji.name, license: data.emoji.license };
      for (const [code, , group, tag] of data.emoji.items) {
        const folder = `${data.emoji.base}${code}/`;
        list.push({
          ...base("animations", `anim-emoji-${code}`, `${title(tag || "Emoji")} – ${data.emoji.name}`, group || "Emoji", ["animated", "emoji", ...(tag || "").split("-")], emojiSet),
          // A still picture in the list; the animation itself plays on hover and on the canvas
          thumbnailUrl: `${folder}emoji.svg`,
          fileUrl: `${folder}512.webp`,
          params: { animatedUrl: `${folder}512.webp` },
          format: "webp", animated: true,
        });
      }
      for (const set of data.sets) {
        for (const icon of set.icons) {
          const url = `${data.iconBase}${set.prefix}/${icon}.svg`;
          list.push({
            ...base("animations", `anim-${set.prefix}-${icon}`, `${title(icon)} – ${set.name}`, set.group, ["animated", "icon", ...icon.split("-")], set),
            thumbnailUrl: `${url}?color=${PREVIEW_COLOR}`,
            fileUrl: url,
            params: { recolor: true },
            animated: true,
          });
        }
      }
      return list;
    })
    .catch(() => {
      animations = null;
      return [];
    });
  return animations;
}

// ── 3D ───────────────────────────────────────────────────────────────────────

const OBJECT_GROUPS = new Set(["Animals & Nature", "Food & Drink", "Travel & Places", "Activities", "Objects"]);

let threeD: Promise<AssetDef[]> | null = null;

export function load3DArtAssets(): Promise<AssetDef[]> {
  if (threeD) return threeD;
  threeD = Promise.all([
    fetchJson<EmojiCatalogue>("/data/sticker-emoji.json").catch(() => null),
    fetchJson<IconCatalogue>("/data/sticker-iconify.json").catch(() => null),
  ])
    .then(([emoji, iconify]) => {
      const list: AssetDef[] = [];
      if (emoji) {
        const set = emoji.sets.noto3d;
        for (const [name, g, , noto, art] of emoji.items) {
          const group = emoji.groups[g];
          if (!noto || !(art & 2) || !OBJECT_GROUPS.has(group)) continue;
          list.push({
            ...base("3d", `3d-noto-${noto}`, `${title(name)} – ${set.name}`, group, ["3d", ...name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)], set),
            thumbnailUrl: `${set.base}128/${noto}.png`, fileUrl: `${set.base}512/${noto}.png`, format: "png", style: "3d",
          });
        }
      }
      const fluent = iconify?.sets.find((s) => s.prefix === "fluent-emoji");
      if (fluent && iconify) {
        // Faces, people and hands are left to the Stickers section; these are the objects
        const person = /(face|person|man|woman|boy|girl|people|hand|finger|skin|baby|couple|family|kiss|adult|child|grinning|smil|cry|angry|ear|nose|eye|mouth|tongue|flag)/;
        for (const icon of fluent.icons) {
          if (person.test(icon)) continue;
          const url = `${iconify.base}${fluent.prefix}/${icon}.svg`;
          list.push({
            ...base("3d", `3d-fluent-${icon}`, `${title(icon)} – ${fluent.name}`, "Fluent 3D", ["3d", ...icon.split("-")], fluent),
            thumbnailUrl: url, fileUrl: `${url}?height=512`, style: "3d",
          });
        }
      }
      return scatter(list, 4099);
    })
    .catch(() => {
      threeD = null;
      return [];
    });
  return threeD;
}
