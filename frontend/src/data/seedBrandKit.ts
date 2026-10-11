import { BrandKit } from "@/types/asset";

export const DEFAULT_BRAND_KIT: BrandKit = {
  id: "default-brand-kit",
  name: "Falcon Studio Brand",
  colors: [
    {
      id: "color-primary",
      label: "Primary Cyan",
      value: "#06b6d4",
      type: "primary",
    },
    {
      id: "color-secondary",
      label: "Deep Navy",
      value: "#0c1017",
      type: "secondary",
    },
    {
      id: "color-accent",
      label: "Electric Purple",
      value: "#8b5cf6",
      type: "accent",
    },
    {
      id: "color-custom-1",
      label: "Emerald Mint",
      value: "#10b981",
      type: "custom",
    },
    {
      id: "color-custom-2",
      label: "Amber Gold",
      value: "#f59e0b",
      type: "custom",
    },
    {
      id: "color-custom-3",
      label: "Rose Quartz",
      value: "#f43f5e",
      type: "custom",
    },
  ],
  fonts: [
    {
      id: "font-heading",
      label: "Header Font (Outfit)",
      fontFamily: "Outfit",
      type: "heading",
      fontWeight: 700,
    },
    {
      id: "font-body",
      label: "Body Font (Inter)",
      fontFamily: "Inter",
      type: "body",
      fontWeight: 400,
    },
  ],
  logos: [
    {
      id: "logo-primary",
      label: "Primary Emblem",
      type: "primary",
      fileUrl: "https://api.iconify.design/lucide:feather.svg?color=%2306b6d4",
      width: 180,
      height: 60,
    },
    {
      id: "logo-secondary",
      label: "Monochrome Icon",
      type: "secondary",
      fileUrl: "https://api.iconify.design/lucide:sparkles.svg?color=%23ffffff",
      width: 120,
      height: 40,
    },
    {
      id: "logo-icon",
      label: "Favicon / Mark",
      type: "icon",
      fileUrl: "https://api.iconify.design/lucide:zap.svg?color=%2306b6d4",
      width: 64,
      height: 64,
    },
  ],
  updatedAt: "2026-01-28T12:00:00Z",
};
