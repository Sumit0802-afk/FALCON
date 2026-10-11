import { BrandKit, BrandColor, BrandFont, BrandLogo } from "@/types/asset";
import { DEFAULT_BRAND_KIT } from "@/data/seedBrandKit";
import { storageService } from "./storageService";

const BRAND_KIT_KEY = "brand_kit";

/** A fresh copy, so editing the kit never changes the defaults it started from */
function defaults(): BrandKit {
  return JSON.parse(JSON.stringify(DEFAULT_BRAND_KIT));
}

/** "#abc", "abc" or "#aabbcc" as "#aabbcc"; an empty string when it is not a colour */
export function normalizeHex(value: string): string {
  const hex = (value || "").trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(hex)) return `#${hex.replace(/./g, (ch) => ch + ch)}`;
  return /^[0-9a-f]{6}$/.test(hex) ? `#${hex}` : "";
}

export const brandKitService = {
  getBrandKit(): BrandKit {
    const saved = storageService.get<BrandKit>(BRAND_KIT_KEY);
    if (saved && saved.colors && saved.fonts && saved.logos) {
      return saved;
    }
    const kit = defaults();
    this.saveBrandKit(kit);
    return kit;
  },

  saveBrandKit(kit: BrandKit): void {
    storageService.set(BRAND_KIT_KEY, {
      ...kit,
      updatedAt: new Date().toISOString(),
    });
  },

  rename(name: string): void {
    const kit = this.getBrandKit();
    kit.name = name.trim().slice(0, 40) || kit.name;
    this.saveBrandKit(kit);
  },

  /** Puts the kit back to the colours, fonts and logos it came with */
  reset(): BrandKit {
    const kit = defaults();
    this.saveBrandKit(kit);
    return kit;
  },

  addColor(color: Omit<BrandColor, "id">): BrandColor {
    const kit = this.getBrandKit();
    const newColor: BrandColor = {
      ...color,
      id: `bc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    // A kit has one primary, one secondary and one accent colour
    if (color.type !== "custom") kit.colors.forEach((c) => { if (c.type === color.type) c.type = "custom"; });
    kit.colors.push(newColor);
    this.saveBrandKit(kit);
    return newColor;
  },

  updateColor(id: string, value: string, label?: string, type?: BrandColor["type"]): boolean {
    const kit = this.getBrandKit();
    const color = kit.colors.find((c) => c.id === id);
    if (!color) return false;
    color.value = value;
    if (label) color.label = label;
    if (type) {
      if (type !== "custom") kit.colors.forEach((c) => { if (c.type === type && c.id !== id) c.type = "custom"; });
      color.type = type;
    }
    this.saveBrandKit(kit);
    return true;
  },

  removeColor(id: string): boolean {
    const kit = this.getBrandKit();
    const len = kit.colors.length;
    kit.colors = kit.colors.filter((c) => c.id !== id);
    if (kit.colors.length !== len) {
      this.saveBrandKit(kit);
      return true;
    }
    return false;
  },

  updateFont(type: "heading" | "body", fontFamily: string, fontWeight?: number): void {
    const kit = this.getBrandKit();
    const fontIndex = kit.fonts.findIndex((f) => f.type === type);
    if (fontIndex >= 0) {
      kit.fonts[fontIndex].fontFamily = fontFamily;
      kit.fonts[fontIndex].label = `${type === "heading" ? "Heading" : "Body"} Font (${fontFamily})`;
      if (fontWeight) kit.fonts[fontIndex].fontWeight = fontWeight;
    } else {
      kit.fonts.push({
        id: `bf-${Date.now()}`,
        label: `${type === "heading" ? "Heading" : "Body"} Font`,
        fontFamily,
        type,
        fontWeight,
      } as BrandFont);
    }
    this.saveBrandKit(kit);
  },

  addLogo(logo: Omit<BrandLogo, "id">): BrandLogo {
    const kit = this.getBrandKit();
    const newLogo: BrandLogo = {
      ...logo,
      id: `bl-${Date.now()}`,
    };
    kit.logos = kit.logos.filter((l) => l.type !== logo.type);
    kit.logos.push(newLogo);
    this.saveBrandKit(kit);
    return newLogo;
  },

  removeLogo(id: string): boolean {
    const kit = this.getBrandKit();
    const len = kit.logos.length;
    kit.logos = kit.logos.filter((l) => l.id !== id);
    if (kit.logos.length !== len) {
      this.saveBrandKit(kit);
      return true;
    }
    return false;
  },
};
