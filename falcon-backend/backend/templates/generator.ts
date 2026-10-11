import {
  CATEGORY_TREE,
  COLOR_PALETTES,
  INDUSTRY_PHOTO,
  LAYOUT_RECIPES,
  TEMPLATE_AUDIENCES,
  TEMPLATE_INDUSTRIES,
  TEMPLATE_STYLES,
  allSubcategories,
  slugify,
} from "./catalog";
import { TemplatePageData } from "./clone";

export interface GeneratedTemplateDefinition {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  tags: string[];
  style: string;
  industry: string;
  audience: string;
  platform: string;
  orientation: string;
  width: number;
  height: number;
  colorFamily: string;
  theme: string;
  language: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  featured?: boolean;
  status?: "draft" | "published" | "archived";
  designData: TemplatePageData;
}

const TYPOGRAPHY: Record<string, { display: string; body: string; weight: number }> = {
  Minimal: { display: "Inter", body: "Inter", weight: 500 },
  Modern: { display: "Montserrat", body: "Inter", weight: 700 },
  Corporate: { display: "Arial", body: "Arial", weight: 700 },
  Luxury: { display: "Georgia", body: "Georgia", weight: 600 },
  Bold: { display: "Impact", body: "Arial", weight: 800 },
  Editorial: { display: "Georgia", body: "Georgia", weight: 700 },
  Creative: { display: "Trebuchet MS", body: "Arial", weight: 700 },
  Gradient: { display: "Montserrat", body: "Inter", weight: 700 },
  Dark: { display: "Inter", body: "Inter", weight: 700 },
  Light: { display: "Inter", body: "Inter", weight: 600 },
  Tech: { display: "Arial", body: "Arial", weight: 700 },
  Professional: { display: "Arial", body: "Arial", weight: 600 },
  Elegant: { display: "Georgia", body: "Georgia", weight: 500 },
  Playful: { display: "Trebuchet MS", body: "Arial", weight: 700 },
  Geometric: { display: "Montserrat", body: "Inter", weight: 800 },
};

const COPY: Record<string, { headline: string; sub: string; cta: string; kicker: string }> = {};

function fillCopy() {
  for (const industry of TEMPLATE_INDUSTRIES) {
    COPY[industry] = {
      headline: `${industry} that moves`,
      sub: `A refined ${industry.toLowerCase()} story built for campaigns, launches, and everyday brand moments.`,
      cta: "Get started",
      kicker: industry.toUpperCase(),
    };
  }
}
fillCopy();

const SUB_COPY: Record<string, string> = {
  "instagram-post": "Share the moment",
  "instagram-story": "Tap through the story",
  "instagram-reel-cover": "Watch the reel",
  "facebook-post": "Join the conversation",
  "facebook-cover": "Welcome to the page",
  "linkedin-post": "Lead the industry",
  "linkedin-banner": "Build in public",
  "youtube-thumbnail": "Watch now",
  "youtube-banner": "Subscribe for more",
  "pinterest-pin": "Save this look",
  "twitter-post": "Join the thread",
  advertisement: "Make it unforgettable",
  "product-promotion": "New drop, now live",
  sale: "Limited-time offer",
  campaign: "This season's campaign",
  "promotional-banner": "Explore the offer",
  "digital-ad": "Click through",
  "marketing-creative": "Launch louder",
  "business-card": "Let's connect",
  presentation: "Q4 narrative",
  proposal: "Partnership proposal",
  resume: "Product designer",
  "company-profile": "Who we are",
  letterhead: "Official correspondence",
  invoice: "Invoice #4821",
  certificate: "Award of excellence",
  invitation: "You're invited",
  wedding: "Together at last",
  birthday: "Celebrate another year",
  party: "Tonight only",
  "event-poster": "Live this weekend",
  announcement: "Big news",
  poster: "See it large",
  flyer: "This weekend only",
  brochure: "Inside the brand",
  menu: "Seasonal tasting",
  magazine: "Cover story",
  postcard: "Wish you were here",
  "education-presentation": "Lesson 01",
  worksheet: "Practice set",
  "study-notes": "Key concepts",
  "educational-poster": "How it works",
  "education-certificate": "Course complete",
};

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length];
}

function paletteFor(style: string, index: number) {
  const keys = Object.keys(COLOR_PALETTES);
  if (style === "Dark" || style === "Tech") return COLOR_PALETTES.ink;
  if (style === "Luxury" || style === "Elegant") return COLOR_PALETTES.gold;
  if (style === "Light" || style === "Minimal") return COLOR_PALETTES.paper;
  if (style === "Playful") return COLOR_PALETTES.coral;
  if (style === "Gradient") return COLOR_PALETTES.sunset;
  if (style === "Corporate" || style === "Professional") return COLOR_PALETTES.navy;
  return COLOR_PALETTES[pick(keys, index)];
}

function baseEl() {
  return {
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
  };
}

function buildLayout(opts: {
  recipe: string;
  width: number;
  height: number;
  palette: (typeof COLOR_PALETTES)[string];
  fonts: { display: string; body: string; weight: number };
  headline: string;
  sub: string;
  cta: string;
  kicker: string;
  photo: string;
  seed: string;
}): TemplatePageData {
  const { recipe, width, height, palette, fonts, headline, sub, cta, kicker, photo, seed } = opts;
  const m = Math.round(Math.min(width, height) * 0.06);
  const elements: TemplatePageData["elements"] = [];
  let z = 0;

  const rect = (id: string, x: number, y: number, w: number, h: number, fill: string, extra: Record<string, unknown> = {}) => {
    elements.push({
      id,
      type: "rectangle",
      zIndex: z++,
      x, y, width: w, height: h,
      fill, stroke: "transparent", strokeWidth: 0, cornerRadius: Number(extra.r || 0),
      ...baseEl(),
    } as TemplatePageData["elements"][number]);
  };
  const ellipse = (id: string, x: number, y: number, w: number, h: number, fill: string) => {
    elements.push({
      id, type: "ellipse", zIndex: z++, x, y, width: w, height: h,
      fill, stroke: "transparent", strokeWidth: 0, ...baseEl(),
    } as TemplatePageData["elements"][number]);
  };
  const line = (id: string, x: number, y: number, w: number, color: string) => {
    elements.push({
      id, type: "line", zIndex: z++, x, y, width: w, height: 0,
      fill: "transparent", stroke: color, strokeWidth: 3, ...baseEl(),
    } as TemplatePageData["elements"][number]);
  };
  const text = (
    id: string, x: number, y: number, w: number, h: number, value: string,
    size: number, color: string, family: string, weight: number, align: "left" | "center" | "right"
  ) => {
    elements.push({
      id, type: "text", zIndex: z++, x, y, width: w, height: h, text: value,
      fontFamily: family, fontSize: size, fontWeight: weight, color, align, lineHeight: 1.15, ...baseEl(),
    } as TemplatePageData["elements"][number]);
  };
  const image = (id: string, x: number, y: number, w: number, h: number) => {
    elements.push({
      id, type: "image", zIndex: z++, x, y, width: w, height: h,
      src: photo, naturalWidth: 1200, naturalHeight: 800, ...baseEl(),
    } as TemplatePageData["elements"][number]);
  };
  const frame = (id: string, x: number, y: number, w: number, h: number) => {
    elements.push({
      id, type: "frame", zIndex: z++, x, y, width: w, height: h,
      frameShape: "rect", imageSrc: photo, cornerRadius: 24, ...baseEl(),
    } as TemplatePageData["elements"][number]);
  };

  const titleSize = Math.max(28, Math.round(Math.min(width, height) * 0.07));
  const bodySize = Math.max(16, Math.round(titleSize * 0.32));

  if (recipe === "split-media") {
    image("img", 0, 0, Math.round(width * 0.48), height);
    rect("panel", Math.round(width * 0.48), 0, Math.round(width * 0.52), height, palette.surface);
    text("kicker", Math.round(width * 0.52), m, Math.round(width * 0.42), 36, kicker, 14, palette.accent, fonts.body, 600, "left");
    text("title", Math.round(width * 0.52), m + 50, Math.round(width * 0.42), titleSize * 2.4, headline, titleSize, palette.text, fonts.display, fonts.weight, "left");
    text("sub", Math.round(width * 0.52), m + 50 + titleSize * 2.5, Math.round(width * 0.4), 90, sub, bodySize, palette.muted, fonts.body, 400, "left");
    rect("cta", Math.round(width * 0.52), height - m - 64, 180, 48, palette.accent, { r: 24 });
    text("cta-label", Math.round(width * 0.52), height - m - 58, 180, 36, cta, 16, palette.bg, fonts.body, 700, "center");
  } else if (recipe === "editorial-stack") {
    text("kicker", m, m, width - m * 2, 32, kicker, 13, palette.accent, fonts.body, 600, "left");
    text("title", m, m + 40, width - m * 2, titleSize * 2.2, headline, titleSize, palette.text, fonts.display, fonts.weight, "left");
    line("rule", m, m + 50 + titleSize * 2.2, Math.round(width * 0.28), palette.accent);
    image("img", m, m + 80 + titleSize * 2.2, width - m * 2, Math.round(height * 0.42));
    text("sub", m, height - m - 120, width - m * 2, 90, sub, bodySize, palette.muted, fonts.body, 400, "left");
  } else if (recipe === "framed-luxury") {
    rect("outer", m * 0.6, m * 0.6, width - m * 1.2, height - m * 1.2, "transparent");
    elements[elements.length - 1] = {
      ...elements[elements.length - 1],
      fill: palette.surface,
      stroke: palette.accent,
      strokeWidth: 2,
      cornerRadius: 8,
    } as TemplatePageData["elements"][number];
    text("kicker", m * 2, m * 2, width - m * 4, 30, kicker, 12, palette.accent, fonts.body, 600, "center");
    text("title", m * 2, height * 0.28, width - m * 4, titleSize * 2.4, headline, titleSize, palette.text, fonts.display, fonts.weight, "center");
    line("rule", width * 0.35, height * 0.52, width * 0.3, palette.accent);
    text("sub", m * 2, height * 0.56, width - m * 4, 80, sub, bodySize, palette.muted, fonts.body, 400, "center");
    ellipse("orb", width - m * 3, m * 1.4, 48, 48, palette.accent);
  } else if (recipe === "geometric-offset") {
    rect("geo-a", -40, -40, width * 0.45, height * 0.45, palette.accent);
    rect("geo-b", width * 0.62, height * 0.58, width * 0.5, height * 0.5, palette.surface);
    text("title", m, height * 0.32, width * 0.7, titleSize * 2.6, headline, titleSize, palette.text, fonts.display, fonts.weight, "left");
    text("sub", m, height * 0.32 + titleSize * 2.7, width * 0.55, 80, sub, bodySize, palette.muted, fonts.body, 400, "left");
  } else if (recipe === "bottom-bar") {
    image("img", 0, 0, width, height);
    rect("bar", 0, height * 0.72, width, height * 0.28, palette.bg);
    text("title", m, height * 0.75, width - m * 2, titleSize * 1.4, headline, Math.round(titleSize * 0.72), palette.text, fonts.display, fonts.weight, "left");
    text("sub", m, height * 0.75 + titleSize * 1.4, width * 0.7, 50, sub, bodySize, palette.muted, fonts.body, 400, "left");
    rect("cta", width - m - 160, height - m - 48, 160, 40, palette.accent, { r: 20 });
    text("cta-label", width - m - 160, height - m - 44, 160, 32, cta, 14, palette.bg, fonts.body, 700, "center");
  } else if (recipe === "card-focus") {
    rect("card", m, m, width - m * 2, height - m * 2, palette.surface, { r: 32 });
    frame("hero", m * 1.6, m * 1.6, width - m * 3.2, height * 0.42);
    text("kicker", m * 1.8, height * 0.52, width - m * 3.6, 28, kicker, 13, palette.accent, fonts.body, 600, "left");
    text("title", m * 1.8, height * 0.56, width - m * 3.6, titleSize * 2, headline, Math.round(titleSize * 0.78), palette.text, fonts.display, fonts.weight, "left");
    text("sub", m * 1.8, height * 0.56 + titleSize * 2.1, width - m * 3.6, 70, sub, bodySize, palette.muted, fonts.body, 400, "left");
  } else if (recipe === "dark-spotlight") {
    ellipse("glow", width * 0.25, height * 0.18, width * 0.5, width * 0.5, palette.accent);
    elements[elements.length - 1] = { ...elements[elements.length - 1], opacity: 0.18 } as TemplatePageData["elements"][number];
    text("kicker", m, height * 0.28, width - m * 2, 28, kicker, 14, palette.accent, fonts.body, 600, "center");
    text("title", m, height * 0.34, width - m * 2, titleSize * 2.4, headline, titleSize, palette.text, fonts.display, fonts.weight, "center");
    text("sub", width * 0.15, height * 0.34 + titleSize * 2.6, width * 0.7, 80, sub, bodySize, palette.muted, fonts.body, 400, "center");
    rect("cta", width * 0.5 - 90, height * 0.78, 180, 48, palette.accent, { r: 24 });
    text("cta-label", width * 0.5 - 90, height * 0.785, 180, 36, cta, 16, palette.bg, fonts.body, 700, "center");
  } else if (recipe === "minimal-left") {
    text("kicker", m, m * 1.4, width * 0.6, 28, kicker, 12, palette.muted, fonts.body, 500, "left");
    text("title", m, m * 2.2, width * 0.72, titleSize * 2.6, headline, titleSize, palette.text, fonts.display, fonts.weight, "left");
    line("rule", m, m * 2.4 + titleSize * 2.6, 72, palette.accent);
    text("sub", m, m * 2.8 + titleSize * 2.6, width * 0.5, 90, sub, bodySize, palette.muted, fonts.body, 400, "left");
    ellipse("mark", width - m * 3, m * 1.5, 36, 36, palette.accent);
  } else if (recipe === "banner-grid") {
    rect("a", 0, 0, width * 0.5, height * 0.5, palette.surface);
    rect("b", width * 0.5, 0, width * 0.5, height * 0.5, palette.accent);
    image("img", 0, height * 0.5, width * 0.5, height * 0.5);
    rect("d", width * 0.5, height * 0.5, width * 0.5, height * 0.5, palette.bg);
    text("title", m * 0.8, m, width * 0.42, titleSize * 2, headline, Math.round(titleSize * 0.7), palette.text, fonts.display, fonts.weight, "left");
    text("cta", width * 0.54, height * 0.7, width * 0.4, 40, cta, 18, palette.text, fonts.body, 700, "left");
  } else {
    text("kicker", m, height * 0.22, width - m * 2, 32, kicker, 14, palette.accent, fonts.body, 600, "center");
    text("title", m, height * 0.28, width - m * 2, titleSize * 2.4, headline, titleSize, palette.text, fonts.display, fonts.weight, "center");
    text("sub", width * 0.12, height * 0.28 + titleSize * 2.5, width * 0.76, 80, sub, bodySize, palette.muted, fonts.body, 400, "center");
    rect("cta", width * 0.5 - 90, height * 0.72, 180, 48, palette.accent, { r: 24 });
    text("cta-label", width * 0.5 - 90, height * 0.725, 180, 36, cta, 16, palette.bg, fonts.body, 700, "center");
    ellipse("dot", width * 0.5 - 6, height * 0.18, 12, 12, palette.accent);
  }

  const groupId = `grp-${seed}`;
  const childIds = elements.slice(0, 2).map((el) => el.id);
  elements.push({
    id: groupId,
    type: "group",
    zIndex: z++,
    x: 0,
    y: 0,
    width,
    height,
    childIds,
    ...baseEl(),
  } as TemplatePageData["elements"][number]);

  return {
    id: `page-${seed}`,
    name: "Page 1",
    size: { name: kicker, width, height },
    background: palette.bg,
    elements,
  };
}

export function combinationCapacity(): number {
  const subs = allSubcategories().length;
  return (
    subs *
    TEMPLATE_STYLES.length *
    TEMPLATE_INDUSTRIES.length *
    LAYOUT_RECIPES.length *
    Object.keys(COLOR_PALETTES).length
  );
}

export function generateTemplateAt(index: number, publish = true): GeneratedTemplateDefinition {
  const pairs = allSubcategories();
  const palettes = Object.keys(COLOR_PALETTES);
  const subCount = pairs.length;
  const styleCount = TEMPLATE_STYLES.length;
  const industryCount = TEMPLATE_INDUSTRIES.length;
  const layoutCount = LAYOUT_RECIPES.length;
  const paletteCount = palettes.length;

  let n = Math.abs(index);
  const subIdx = n % subCount;
  n = Math.floor(n / subCount);
  const styleIdx = n % styleCount;
  n = Math.floor(n / styleCount);
  const industryIdx = n % industryCount;
  n = Math.floor(n / industryCount);
  const layoutIdx = n % layoutCount;
  n = Math.floor(n / layoutCount);
  const paletteIdx = n % paletteCount;

  const { category, child } = pairs[subIdx];
  const style = TEMPLATE_STYLES[styleIdx];
  const industry = TEMPLATE_INDUSTRIES[industryIdx];
  const recipe = LAYOUT_RECIPES[layoutIdx];
  const palette = paletteFor(style, paletteIdx + index);
  const fonts = TYPOGRAPHY[style];
  const copy = COPY[industry];
  const headline = `${child.name}: ${copy.headline}`;
  const sub = SUB_COPY[child.slug] || copy.sub;
  const audience = pick(TEMPLATE_AUDIENCES, index);
  const theme = `${style} ${industry}`;
  const seed = `${child.slug}-${styleIdx}-${industryIdx}-${layoutIdx}-${paletteIdx}`;
  const name = `${style} ${industry} ${child.name}`;
  const slug = slugify(`${seed}-${name}`);

  const designData = buildLayout({
    recipe,
    width: child.width,
    height: child.height,
    palette,
    fonts,
    headline,
    sub,
    cta: copy.cta,
    kicker: child.name.toUpperCase(),
    photo: INDUSTRY_PHOTO[industry],
    seed,
  });

  const tags = [
    slugify(style),
    slugify(industry),
    slugify(child.platform),
    slugify(category.name),
    recipe,
    child.orientation.toLowerCase(),
  ];

  return {
    slug,
    name,
    description: `${style} ${child.name.toLowerCase()} for ${industry.toLowerCase()}. ${copy.sub}`,
    categorySlug: category.slug,
    subcategorySlug: child.slug,
    tags,
    style,
    industry,
    audience,
    platform: child.platform,
    orientation: child.orientation,
    width: child.width,
    height: child.height,
    colorFamily: palette.family,
    theme,
    language: "en",
    thumbnailUrl: INDUSTRY_PHOTO[industry],
    previewUrl: INDUSTRY_PHOTO[industry],
    featured: index % 37 === 0,
    status: publish ? "published" : "draft",
    designData,
  };
}

export function generateTemplateBatch(count: number, offset = 0, publish = true): GeneratedTemplateDefinition[] {
  const max = combinationCapacity();
  const size = Math.min(count, max - offset);
  const out: GeneratedTemplateDefinition[] = [];
  for (let i = 0; i < size; i++) {
    out.push(generateTemplateAt(offset + i, publish));
  }
  return out;
}

export { CATEGORY_TREE };
