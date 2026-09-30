import { BrandKit, BrandColor, BrandFont, BrandLogo } from "@/types/asset";
import { DEFAULT_BRAND_KIT } from "@/data/seedBrandKit";
import { storageService } from "./storageService";

const BRAND_KIT_KEY = "brand_kit";

export const brandKitService = {
  getBrandKit(): BrandKit {
    const saved = storageService.get<BrandKit>(BRAND_KIT_KEY);
    if (saved && saved.colors && saved.fonts && saved.logos) {
      return saved;
    }
    this.saveBrandKit(DEFAULT_BRAND_KIT);
    return DEFAULT_BRAND_KIT;
  },

  saveBrandKit(kit: BrandKit): void {
    storageService.set(BRAND_KIT_KEY, {
      ...kit,
      updatedAt: new Date().toISOString(),
    });
  },

  addColor(color: Omit<BrandColor, "id">): BrandColor {
    const kit = this.getBrandKit();
    const newColor: BrandColor = {
      ...color,
      id: `bc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    kit.colors.push(newColor);
    this.saveBrandKit(kit);
    return newColor;
  },

  updateColor(id: string, value: string, label?: string): boolean {
    const kit = this.getBrandKit();
    const color = kit.colors.find((c) => c.id === id);
    if (!color) return false;
    color.value = value;
    if (label) color.label = label;
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
      if (fontWeight) kit.fonts[fontIndex].fontWeight = fontWeight;
    } else {
      kit.fonts.push({
        id: `bf-${Date.now()}`,
        label: `${type === "heading" ? "Heading" : "Body"} Font`,
        fontFamily,
        type,
        fontWeight,
      });
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
