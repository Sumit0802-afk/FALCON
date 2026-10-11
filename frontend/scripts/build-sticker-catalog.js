/**
 * Rebuilds the emoji part of the sticker library from three open emoji sets:
 *
 *   Twemoji      CC BY 4.0      github.com/jdecked/twemoji
 *   Noto Emoji   Apache 2.0     github.com/googlefonts/noto-emoji  (flat and 3D art)
 *   OpenMoji     CC BY-SA 4.0   openmoji.org
 *
 * Only files that really exist in each set are listed, so no sticker points at
 * a missing picture. Output:
 *
 *   public/data/sticker-emoji.json   the catalogue, fetched when the panel opens
 *   src/data/stickerEmojiMeta.ts     its size, for code that needs it up front
 *
 *   node scripts/build-sticker-catalog.js [path-to-saved-noto-tree.json]
 *
 * GitHub limits anonymous requests; if the Noto listing is refused, save the
 * response of the tree URL below to a file and pass its path.
 */
const fs = require("fs");
const path = require("path");

const TWEMOJI = "15.1.0";
const OPENMOJI = "15.1.0";
// A fixed commit, so the pictures a design uses never change underneath it
const NOTO = "e20cbc2bbec1926686be9f9bee7d1d2cfa1fea0e";

const OUT_JSON = path.join(__dirname, "..", "public", "data", "sticker-emoji.json");
const OUT_META = path.join(__dirname, "..", "src", "data", "stickerEmojiMeta.ts");

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "falcon-build" } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

/** One spelling for a sequence of code points, whatever a set's file naming is */
function key(text) {
  return text.toLowerCase().replace(/^emoji_u/, "").split(/[-_]/).filter((cp) => cp && cp !== "fe0f").map((cp) => cp.replace(/^0+(?=.)/, "")).join("-");
}

const GROUPS = [
  ["smileys-emotion", "Smileys"],
  ["people-body", "People"],
  ["animals-nature", "Animals & Nature"],
  ["food-drink", "Food & Drink"],
  ["travel-places", "Travel & Places"],
  ["activities", "Activities"],
  ["objects", "Objects"],
  ["symbols", "Symbols"],
  ["flags", "Flags"],
  ["extras-openmoji", "Extras"],
  ["extras-unicode", "Extras"],
];
const GROUP_LABELS = [...new Set(GROUPS.map((g) => g[1]))];
const groupIndex = (slug) => {
  const found = GROUPS.find((g) => g[0] === slug);
  return found ? GROUP_LABELS.indexOf(found[1]) : -1;
};
const UNICODE_GROUP = { "Smileys & Emotion": "smileys-emotion", "People & Body": "people-body", "Animals & Nature": "animals-nature", "Food & Drink": "food-drink", "Travel & Places": "travel-places", Activities: "activities", Objects: "objects", Symbols: "symbols", Flags: "flags" };

async function main() {
  const base = (name) => name.split("/").pop().replace(/\.(svg|png)$/, "");

  const openmojiFiles = (await getJson(`https://data.jsdelivr.com/v1/package/npm/openmoji@${OPENMOJI}/flat`)).files
    .map((f) => f.name).filter((n) => /^\/color\/svg\/[0-9A-F-]+\.svg$/.test(n)).map(base);
  const twemojiFiles = (await getJson(`https://data.jsdelivr.com/v1/package/gh/jdecked/twemoji@${TWEMOJI}/flat`)).files
    .map((f) => f.name).filter((n) => /^\/assets\/svg\/[0-9a-f-]+\.svg$/.test(n)).map(base);

  const saved = process.argv[2];
  const notoTree = saved
    ? JSON.parse(fs.readFileSync(saved, "utf8"))
    : await getJson(`https://api.github.com/repos/googlefonts/noto-emoji/git/trees/${NOTO}?recursive=1`);
  if (!Array.isArray(notoTree.tree)) throw new Error("The Noto listing was refused; pass a saved copy as the first argument");
  const notoPaths = notoTree.tree.map((t) => t.path);
  const notoFlat = new Set(notoPaths.filter((p) => /^2D\/svg\/emoji_u[0-9a-f_]+\.svg$/.test(p)).map(base));
  const noto3d = new Set(notoPaths.filter((p) => /^3D\/png\/512\/emoji_u[0-9a-f_]+\.png$/.test(p)).map(base));

  // Names and groups: OpenMoji describes every emoji it draws, Unicode's own list fills the gaps
  const openmojiInfo = await getJson(`https://cdn.jsdelivr.net/npm/openmoji@${OPENMOJI}/data/openmoji.json`);
  const unicodeInfo = await getJson("https://cdn.jsdelivr.net/npm/unicode-emoji-json@0.6.0/data-by-emoji.json");
  const info = new Map();
  for (const [emoji, data] of Object.entries(unicodeInfo)) {
    const cps = [...emoji].map((ch) => ch.codePointAt(0).toString(16)).join("-");
    info.set(key(cps), { name: data.name, group: groupIndex(UNICODE_GROUP[data.group]) });
  }
  for (const item of openmojiInfo) {
    if (item.group === "component") continue;
    info.set(key(item.hexcode), { name: item.annotation, group: groupIndex(item.group) });
  }

  const rows = new Map();
  const row = (k) => {
    if (!rows.has(k)) rows.set(k, { tw: 0, noto: 0, flat: false, deep: false, om: 0 });
    return rows.get(k);
  };
  for (const file of twemojiFiles) row(key(file)).tw = file;
  for (const file of openmojiFiles) row(key(file)).om = file;
  for (const file of notoFlat) { const r = row(key(file)); r.noto = file; r.flat = true; }
  for (const file of noto3d) { const r = row(key(file)); r.noto = file; r.deep = true; }

  const items = [];
  let stickers = 0;
  for (const [k, r] of rows) {
    const known = info.get(k);
    // Pieces that are not pictures on their own (skin tone swatches, hair parts) have no group
    if (!known || known.group < 0) continue;
    const flags = (r.flat ? 1 : 0) | (r.deep ? 2 : 0);
    items.push([known.name, known.group, r.tw, r.noto, flags, r.om]);
    stickers += (r.tw ? 1 : 0) + (r.flat ? 1 : 0) + (r.deep ? 1 : 0) + (r.om ? 1 : 0);
  }
  items.sort((a, b) => a[1] - b[1] || String(a[0]).localeCompare(String(b[0])));

  const catalogue = {
    sets: {
      twemoji: { name: "Twemoji", license: "CC BY 4.0", base: `https://cdn.jsdelivr.net/gh/jdecked/twemoji@${TWEMOJI}/assets/svg/`, ext: ".svg" },
      notoFlat: { name: "Noto Emoji", license: "Apache 2.0", base: `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@${NOTO}/2D/svg/`, ext: ".svg" },
      noto3d: { name: "Noto Emoji 3D", license: "Apache 2.0", base: `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@${NOTO}/3D/png/`, ext: ".png" },
      openmoji: { name: "OpenMoji", license: "CC BY-SA 4.0", base: `https://cdn.jsdelivr.net/npm/openmoji@${OPENMOJI}/color/svg/`, ext: ".svg" },
    },
    groups: GROUP_LABELS,
    // name, group, Twemoji file, Noto file, Noto art (1 flat, 2 3D, 3 both), OpenMoji file
    items,
  };
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(catalogue));
  fs.writeFileSync(OUT_META, `/** GENERATED by scripts/build-sticker-catalog.js. Do not edit by hand. */\n\n/** How many emoji stickers public/data/sticker-emoji.json holds */\nexport const EMOJI_STICKER_COUNT = ${stickers};\n`);
  console.log(`wrote ${items.length} emoji as ${stickers} stickers (${Math.round(fs.statSync(OUT_JSON).size / 1024)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
