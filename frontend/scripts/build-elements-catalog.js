/**
 * Builds the catalogues of real artwork behind the Elements panel:
 *
 *   public/data/elements-icons.json       icons for Graphics, from open icon sets (via Iconify)
 *   public/data/elements-animations.json  animated art for Animations
 *
 * Only names that really exist in each set are listed. Icons named after
 * brands are left out. Run again to pick up new icons:
 *
 *   node scripts/build-elements-catalog.js
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const OUT = path.join(__dirname, "..", "public", "data");
const CACHE = path.join(os.tmpdir(), "falcon-iconify-cache");

async function getJson(url) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, url.replace(/[^a-z0-9]+/gi, "_") + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  const data = await res.json();
  fs.writeFileSync(file, JSON.stringify(data));
  return data;
}

/** One file of an icon set's npm package, from whichever mirror will serve it */
async function getPackageFile(prefix, file) {
  try {
    return await getJson(`https://cdn.jsdelivr.net/npm/@iconify-json/${prefix}/${file}`);
  } catch {
    return getJson(`https://unpkg.com/@iconify-json/${prefix}/${file}`);
  }
}

// prefix, the chip it appears under, and the look of the set
const ICON_SETS = [
  ["lucide", "Line icons"], ["tabler", "Line icons"], ["iconoir", "Line icons"], ["heroicons", "Line icons"],
  ["ph", "Line icons"], ["ri", "Solid icons"], ["mdi", "Solid icons"], ["bi", "Solid icons"],
  ["solar", "Duotone icons"], ["hugeicons", "Line icons"],
  ["game-icons", "Illustrated"], ["healthicons", "Health"], ["maki", "Map & travel"], ["wi", "Weather"],
];

const ANIMATED_SETS = [["line-md", "Animated icons"], ["svg-spinners", "Loaders"]];

// Words that are also ordinary icon names (line, edge, apple, zoom…) are deliberately not in this list
const BRANDS = /(^|-)(brand|logo|logos|google|facebook|twitter|instagram|youtube|tiktok|whatsapp|telegram|android|windows|microsoft|amazon|netflix|spotify|github|gitlab|linkedin|pinterest|snapchat|reddit|paypal|visa|mastercard|bitcoin|ethereum|tesla|nike|adidas|samsung|sony|playstation|xbox|nintendo|disney|uber|airbnb|slack|discord|skype|dropbox|adobe|figma|wechat|alipay|weibo|baidu|tencent|xiaomi|huawei|twitch|tumblr|vimeo|behance|dribbble|wordpress|shopify|chrome|firefox|ubuntu|intel|amd|nvidia|ibm|oracle|salesforce|bluetooth|dolby|nfc|npm|docker|vue|nodejs|python|javascript|typescript|php|laravel|kotlin|golang|html5|css3|tailwind|vercel|netlify|aws|azure|gcp|firebase|mongodb|mysql|postgresql|redis|graphql|jira|trello|notion|asana|zapier|mailchimp|hubspot|wikipedia|yahoo|bing|duckduckgo|ebay|etsy|aliexpress|soundcloud|deezer|imdb|kickstarter|patreon|onlyfans|mastodon|viber|kakao|vk|yandex|qq)(-|$)/;

async function listSet(prefix) {
  const info = await getPackageFile(prefix, "info.json");
  const pack = await getPackageFile(prefix, "icons.json");
  const names = Object.entries(pack.icons || {}).filter(([name, icon]) => !icon.hidden && !BRANDS.test(name)).map(([name]) => name).sort();
  return {
    prefix,
    name: info.name,
    author: (info.author && info.author.name) || info.name,
    license: (info.license && (info.license.spdx || info.license.title)) || "Open source",
    icons: names,
  };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  // ── Icons ──────────────────────────────────────────────────────────────────
  const iconSets = [];
  let iconTotal = 0;
  for (const [prefix, group] of ICON_SETS) {
    const set = await listSet(prefix);
    iconSets.push({ ...set, group });
    iconTotal += set.icons.length;
    console.log(`icons      ${prefix.padEnd(14)} ${String(set.icons.length).padStart(6)}  ${set.license}`);
  }
  fs.writeFileSync(path.join(OUT, "elements-icons.json"), JSON.stringify({ base: "https://api.iconify.design/", sets: iconSets }));

  // ── Animations ─────────────────────────────────────────────────────────────
  const animatedSets = [];
  let animatedTotal = 0;
  for (const [prefix, group] of ANIMATED_SETS) {
    const set = await listSet(prefix);
    animatedSets.push({ ...set, group });
    animatedTotal += set.icons.length;
    console.log(`animations ${prefix.padEnd(14)} ${String(set.icons.length).padStart(6)}  ${set.license}`);
  }
  // Google's animated emoji: every one is a real hand-made animation
  const noto = await getJson("https://googlefonts.github.io/noto-emoji-animation/data/api.json");
  const emoji = (noto.icons || []).map((icon) => [
    icon.codepoint,
    String(icon.name || "").replace(/-/g, " ").trim(),
    (icon.categories && icon.categories[0]) || "Emoji",
    (icon.tags || []).map((t) => String(t).replace(/:/g, "")).slice(0, 4).join(" "),
  ]);
  animatedTotal += emoji.length;
  console.log(`animations ${"noto-animated".padEnd(14)} ${String(emoji.length).padStart(6)}  CC-BY-4.0`);
  fs.writeFileSync(path.join(OUT, "elements-animations.json"), JSON.stringify({
    iconBase: "https://api.iconify.design/",
    sets: animatedSets,
    emoji: { name: "Noto Animated Emoji", license: "CC BY 4.0", base: "https://fonts.gstatic.com/s/e/notoemoji/latest/", items: emoji },
  }));

  for (const file of ["elements-icons.json", "elements-animations.json"]) {
    console.log(`${file}: ${Math.round(fs.statSync(path.join(OUT, file)).size / 1024)} KB`);
  }
  console.log(`wrote ${iconTotal} icons and ${animatedTotal} animations`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
