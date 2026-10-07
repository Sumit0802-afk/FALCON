/**
 * Adds Iconify's multicolour icon sets to the sticker library.
 *
 * Iconify (iconify.design) gathers open-source icon sets. This lists every
 * set it marks as multicolour, except:
 *
 *   - brand and product logo sets, whose artwork is other companies' trademarks
 *   - the three emoji sets the library already carries from their own sources
 *
 * Icons inside the remaining sets that are filed under a logo or brand
 * category, or named after a well-known brand, are left out too.
 *
 * Output:
 *   public/data/sticker-iconify.json   the catalogue, fetched when the panel opens
 *   src/data/stickerIconifyMeta.ts     its size
 *
 *   node scripts/build-sticker-iconify.js
 */
const fs = require("fs");
const path = require("path");

const API = "https://api.iconify.design";
const OUT_JSON = path.join(__dirname, "..", "public", "data", "sticker-iconify.json");
const OUT_META = path.join(__dirname, "..", "src", "data", "stickerIconifyMeta.ts");

const SKIP_CATEGORIES = new Set(["Logos", "Programming"]);
const ALREADY_CARRIED = new Set(["openmoji", "twemoji", "noto"]);

/** Which chip in the Stickers view a set belongs under */
function groupOf(prefix, info) {
  if (info.category === "Emoji" || /emoji/.test(prefix)) return "Emoji";
  if (info.category === "Flags / Maps") return "Flags";
  if (prefix === "meteocons") return "Weather";
  return "Illustrations";
}

const BRANDS = /(^|-)(google|facebook|meta|twitter|instagram|youtube|tiktok|whatsapp|telegram|apple|android|windows|microsoft|amazon|netflix|spotify|github|gitlab|linkedin|pinterest|snapchat|reddit|paypal|visa|mastercard|bitcoin|ethereum|tesla|nike|adidas|samsung|sony|playstation|xbox|nintendo|disney|uber|airbnb|slack|discord|skype|zoom|dropbox|adobe|figma|wechat|alipay|weibo|baidu|tencent|xiaomi|huawei|bytedance|douyin|twitch|tumblr|vimeo|behance|dribbble|medium|wordpress|shopify|stripe|chrome|firefox|safari|edge|opera|ios|macos|linux|ubuntu|intel|amd|nvidia|ibm|oracle|salesforce|mcdonalds|starbucks|cocacola|pepsi|ferrari|bmw|audi|mercedes|toyota|honda|ford|pokemon|mario|marvel|logo|brand)(-|$)/;

/**
 * The public API allows only a few requests in a row. Answers are kept in a
 * temporary folder, so a run that is cut short picks up where it stopped.
 */
const CACHE = path.join(require("os").tmpdir(), "falcon-iconify-cache");

async function getJson(url) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, url.replace(/[^a-z0-9]+/gi, "_") + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  for (let attempt = 0; attempt < 10; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync(file, JSON.stringify(data));
      return data;
    }
    if (attempt === 9 || res.status === 403 || res.status === 404) throw new Error(`${url} answered ${res.status}`);
    await new Promise((r) => setTimeout(r, res.status === 429 ? 40000 : 3000));
  }
}

/** One file of an icon set's npm package, from whichever mirror will serve it (the largest sets are refused by one of them) */
async function getPackageFile(prefix, file) {
  try {
    return await getJson(`https://cdn.jsdelivr.net/npm/@iconify-json/${prefix}/${file}`);
  } catch {
    return getJson(`https://unpkg.com/@iconify-json/${prefix}/${file}`);
  }
}

async function main() {
  const collections = await getJson(`${API}/collections`);
  const chosen = Object.entries(collections)
    .filter(([prefix, info]) => info.palette && !SKIP_CATEGORIES.has(info.category) && !ALREADY_CARRIED.has(prefix))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const sets = [];
  let total = 0;
  let dropped = 0;
  for (const [prefix, info] of chosen) {
    // The icon set packages list every icon; the API itself refuses more than a few requests in a row
    const pack = await getPackageFile(prefix, "icons.json");
    const meta = await getPackageFile(prefix, "metadata.json").catch(() => ({}));
    const names = new Set(Object.keys(pack.icons || {}));
    const skipped = new Set(Object.entries(pack.icons || {}).filter(([, icon]) => icon.hidden).map(([name]) => name));
    for (const [category, list] of Object.entries(meta.categories || {})) {
      const brandish = /logo|brand|social/i.test(category);
      for (const name of list) (brandish ? skipped : names).add(name);
    }
    const icons = [...names].filter((name) => {
      if (skipped.has(name) || BRANDS.test(name)) { dropped++; return false; }
      return true;
    }).sort();
    if (!icons.length) continue;
    sets.push({
      prefix,
      name: info.name,
      author: (info.author && info.author.name) || info.name,
      license: (info.license && (info.license.spdx || info.license.title)) || "Open source",
      group: groupOf(prefix, info),
      icons,
    });
    total += icons.length;
    console.log(`${prefix.padEnd(28)} ${String(icons.length).padStart(5)}  ${sets[sets.length - 1].license}`);
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({ base: `${API}/`, sets }));
  fs.writeFileSync(OUT_META, `/** GENERATED by scripts/build-sticker-iconify.js. Do not edit by hand. */\n\n/** How many stickers public/data/sticker-iconify.json holds */\nexport const ICONIFY_STICKER_COUNT = ${total};\n`);
  console.log(`wrote ${total} stickers from ${sets.length} sets (${dropped} brand or hidden icons left out, ${Math.round(fs.statSync(OUT_JSON).size / 1024)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
