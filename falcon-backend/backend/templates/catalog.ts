export interface CategoryDefinition {
  slug: string;
  name: string;
  description: string;
  children: SubcategoryDefinition[];
}

export interface SubcategoryDefinition {
  slug: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  orientation: "Square" | "Portrait" | "Landscape";
}

export const TEMPLATE_STYLES = [
  "Minimal",
  "Modern",
  "Corporate",
  "Luxury",
  "Bold",
  "Editorial",
  "Creative",
  "Gradient",
  "Dark",
  "Light",
  "Tech",
  "Professional",
  "Elegant",
  "Playful",
  "Geometric",
] as const;

export const TEMPLATE_INDUSTRIES = [
  "Technology",
  "Fashion",
  "Food & Beverage",
  "Health & Wellness",
  "Education",
  "Finance",
  "Real Estate",
  "Entertainment",
  "Travel",
  "Retail",
  "Sports",
  "Nonprofit",
] as const;

export const TEMPLATE_AUDIENCES = [
  "Consumers",
  "Professionals",
  "Students",
  "Founders",
  "Creators",
  "Families",
  "Enterprises",
] as const;

export const LAYOUT_RECIPES = [
  "centered-hero",
  "split-media",
  "editorial-stack",
  "framed-luxury",
  "geometric-offset",
  "bottom-bar",
  "card-focus",
  "dark-spotlight",
  "minimal-left",
  "banner-grid",
] as const;

export const COLOR_PALETTES: Record<
  string,
  { family: string; bg: string; surface: string; accent: string; text: string; muted: string }
> = {
  ink: { family: "Neutral", bg: "#0b0f14", surface: "#151b22", accent: "#f4f1eb", text: "#f8fafc", muted: "#94a3b8" },
  teal: { family: "Teal", bg: "#042f2e", surface: "#134e4a", accent: "#2dd4bf", text: "#ecfeff", muted: "#5eead4" },
  gold: { family: "Gold", bg: "#1c1917", surface: "#292524", accent: "#d4af37", text: "#fefce8", muted: "#a8a29e" },
  coral: { family: "Coral", bg: "#fff1f2", surface: "#ffffff", accent: "#e11d48", text: "#1f2937", muted: "#9f1239" },
  navy: { family: "Navy", bg: "#0f172a", surface: "#1e293b", accent: "#38bdf8", text: "#f8fafc", muted: "#94a3b8" },
  cream: { family: "Cream", bg: "#faf7f2", surface: "#ffffff", accent: "#0f172a", text: "#1c1917", muted: "#78716c" },
  violet: { family: "Violet", bg: "#1e1b4b", surface: "#312e81", accent: "#c4b5fd", text: "#f5f3ff", muted: "#a78bfa" },
  forest: { family: "Green", bg: "#052e16", surface: "#14532d", accent: "#86efac", text: "#f0fdf4", muted: "#4ade80" },
  paper: { family: "Paper", bg: "#ffffff", surface: "#f8fafc", accent: "#111827", text: "#111827", muted: "#6b7280" },
  sunset: { family: "Warm", bg: "#7c2d12", surface: "#9a3412", accent: "#fb923c", text: "#fff7ed", muted: "#fdba74" },
};

export const CATEGORY_TREE: CategoryDefinition[] = [
  {
    slug: "social-media",
    name: "Social Media",
    description: "Posts, stories, covers, and platform-native creatives",
    children: [
      { slug: "instagram-post", name: "Instagram Post", platform: "Instagram", width: 1080, height: 1080, orientation: "Square" },
      { slug: "instagram-story", name: "Instagram Story", platform: "Instagram", width: 1080, height: 1920, orientation: "Portrait" },
      { slug: "instagram-reel-cover", name: "Instagram Reel Cover", platform: "Instagram", width: 1080, height: 1920, orientation: "Portrait" },
      { slug: "facebook-post", name: "Facebook Post", platform: "Facebook", width: 1200, height: 630, orientation: "Landscape" },
      { slug: "facebook-cover", name: "Facebook Cover", platform: "Facebook", width: 1640, height: 859, orientation: "Landscape" },
      { slug: "linkedin-post", name: "LinkedIn Post", platform: "LinkedIn", width: 1200, height: 627, orientation: "Landscape" },
      { slug: "linkedin-banner", name: "LinkedIn Banner", platform: "LinkedIn", width: 1584, height: 396, orientation: "Landscape" },
      { slug: "youtube-thumbnail", name: "YouTube Thumbnail", platform: "YouTube", width: 1280, height: 720, orientation: "Landscape" },
      { slug: "youtube-banner", name: "YouTube Banner", platform: "YouTube", width: 2560, height: 1440, orientation: "Landscape" },
      { slug: "pinterest-pin", name: "Pinterest Pin", platform: "Pinterest", width: 1000, height: 1500, orientation: "Portrait" },
      { slug: "twitter-post", name: "X/Twitter Post", platform: "X", width: 1600, height: 900, orientation: "Landscape" },
    ],
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Campaigns, promotions, and paid creative",
    children: [
      { slug: "advertisement", name: "Advertisement", platform: "Digital", width: 1080, height: 1080, orientation: "Square" },
      { slug: "product-promotion", name: "Product Promotion", platform: "Digital", width: 1080, height: 1350, orientation: "Portrait" },
      { slug: "sale", name: "Sale", platform: "Digital", width: 1080, height: 1080, orientation: "Square" },
      { slug: "campaign", name: "Campaign", platform: "Digital", width: 1920, height: 1080, orientation: "Landscape" },
      { slug: "promotional-banner", name: "Promotional Banner", platform: "Web", width: 1920, height: 600, orientation: "Landscape" },
      { slug: "digital-ad", name: "Digital Ad", platform: "Display", width: 1200, height: 1200, orientation: "Square" },
      { slug: "marketing-creative", name: "Marketing Creative", platform: "Digital", width: 1080, height: 1080, orientation: "Square" },
    ],
  },
  {
    slug: "business",
    name: "Business",
    description: "Professional documents and brand collateral",
    children: [
      { slug: "business-card", name: "Business Card", platform: "Print", width: 1050, height: 600, orientation: "Landscape" },
      { slug: "presentation", name: "Presentation", platform: "Slides", width: 1920, height: 1080, orientation: "Landscape" },
      { slug: "proposal", name: "Proposal", platform: "Document", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "resume", name: "Resume", platform: "Document", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "company-profile", name: "Company Profile", platform: "Document", width: 1920, height: 1080, orientation: "Landscape" },
      { slug: "letterhead", name: "Letterhead", platform: "Print", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "invoice", name: "Invoice", platform: "Document", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "certificate", name: "Certificate", platform: "Print", width: 1754, height: 1240, orientation: "Landscape" },
    ],
  },
  {
    slug: "events",
    name: "Events",
    description: "Invitations, posters, and announcements",
    children: [
      { slug: "invitation", name: "Invitation", platform: "Print", width: 1080, height: 1440, orientation: "Portrait" },
      { slug: "wedding", name: "Wedding", platform: "Print", width: 1080, height: 1440, orientation: "Portrait" },
      { slug: "birthday", name: "Birthday", platform: "Social", width: 1080, height: 1350, orientation: "Portrait" },
      { slug: "party", name: "Party", platform: "Social", width: 1080, height: 1350, orientation: "Portrait" },
      { slug: "event-poster", name: "Event Poster", platform: "Print", width: 1080, height: 1620, orientation: "Portrait" },
      { slug: "announcement", name: "Announcement", platform: "Social", width: 1080, height: 1080, orientation: "Square" },
    ],
  },
  {
    slug: "print",
    name: "Print",
    description: "Physical marketing and editorial layouts",
    children: [
      { slug: "poster", name: "Poster", platform: "Print", width: 1080, height: 1620, orientation: "Portrait" },
      { slug: "flyer", name: "Flyer", platform: "Print", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "brochure", name: "Brochure", platform: "Print", width: 1920, height: 1080, orientation: "Landscape" },
      { slug: "menu", name: "Menu", platform: "Print", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "magazine", name: "Magazine", platform: "Print", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "postcard", name: "Postcard", platform: "Print", width: 1500, height: 1050, orientation: "Landscape" },
    ],
  },
  {
    slug: "education",
    name: "Education",
    description: "Classroom, study, and learning materials",
    children: [
      { slug: "education-presentation", name: "Presentation", platform: "Slides", width: 1920, height: 1080, orientation: "Landscape" },
      { slug: "worksheet", name: "Worksheet", platform: "Document", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "study-notes", name: "Study Notes", platform: "Document", width: 1240, height: 1754, orientation: "Portrait" },
      { slug: "educational-poster", name: "Educational Poster", platform: "Print", width: 1080, height: 1620, orientation: "Portrait" },
      { slug: "education-certificate", name: "Certificate", platform: "Print", width: 1754, height: 1240, orientation: "Landscape" },
    ],
  },
];

export const INDUSTRY_PHOTO: Record<string, string> = {
  Technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=70",
  Fashion: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=70",
  "Food & Beverage": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=70",
  "Health & Wellness": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=70",
  Education: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&auto=format&fit=crop&q=70",
  Finance: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=70",
  "Real Estate": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=70",
  Entertainment: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=70",
  Travel: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=70",
  Retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=70",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=70",
  Nonprofit: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=70",
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function allSubcategories() {
  return CATEGORY_TREE.flatMap((category) =>
    category.children.map((child) => ({ category, child }))
  );
}
