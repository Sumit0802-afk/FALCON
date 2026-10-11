/**
 * The larger part of the QR design library: designs grouped by what the code
 * is for. Every one is a dark code on a light background with the standard
 * clear margin, so none of them starts out with a scanning warning.
 *
 * A row is: name, pattern, code colour, gradient end ("" for one colour),
 * background, border, border colour ("" for the code colour) and the text
 * shown with the code ("" for none).
 */

import type { QrSpec } from "@/utils/qrCode";

type Pattern = "square" | "rounded" | "dots" | "circular";
type Frame = "none" | "solid" | "rounded" | "decorative";
type Row = [name: string, pattern: Pattern, foreground: string, foreground2: string, background: string, frame: Frame, frameColor: string, caption: string];

const GROUPS: { name: string; rows: Row[] }[] = [
  {
    name: "Business",
    rows: [
      ["Executive", "square", "#0f172a", "", "#ffffff", "solid", "", ""],
      ["Boardroom", "rounded", "#1e293b", "", "#f8fafc", "rounded", "#94a3b8", ""],
      ["Corporate", "rounded", "#1e3a8a", "", "#ffffff", "rounded", "", "Scan to connect"],
      ["Consultant", "dots", "#334155", "", "#f1f5f9", "none", "", ""],
      ["Letterhead", "square", "#292524", "", "#fafaf9", "decorative", "#44403c", ""],
      ["Finance", "rounded", "#064e3b", "", "#ecfdf5", "solid", "#047857", ""],
      ["Legal", "square", "#7f1d1d", "", "#ffffff", "decorative", "", ""],
      ["Agency", "rounded", "#312e81", "#6d28d9", "#ffffff", "none", "", ""],
      ["Startup", "dots", "#0369a1", "#4338ca", "#f0f9ff", "rounded", "", "Get in touch"],
      ["Portfolio", "circular", "#171717", "", "#f5f5f4", "none", "", ""],
    ],
  },
  {
    name: "Events",
    rows: [
      ["Gala", "rounded", "#581c87", "#be185d", "#faf5ff", "decorative", "#7e22ce", "Scan for your invite"],
      ["Concert", "dots", "#86198f", "#4338ca", "#ffffff", "none", "", "Get tickets"],
      ["Festival", "rounded", "#c2410c", "#be123c", "#fff7ed", "rounded", "", "Scan for line-up"],
      ["Conference", "square", "#1e40af", "", "#eff6ff", "solid", "", "Scan for agenda"],
      ["Workshop", "rounded", "#0f766e", "", "#f0fdfa", "rounded", "", "Reserve a seat"],
      ["Meetup", "dots", "#4338ca", "", "#eef2ff", "none", "", "Join the meetup"],
      ["Premiere", "square", "#171717", "", "#fefce8", "decorative", "#854d0e", ""],
      ["Expo", "rounded", "#155e75", "#1e40af", "#ecfeff", "solid", "", "Visit our stand"],
      ["Ticket", "square", "#991b1b", "", "#fef2f2", "rounded", "", "Admit one"],
      ["Afterparty", "circular", "#701a75", "#4c1d95", "#fdf4ff", "none", "", ""],
    ],
  },
  {
    name: "Food",
    rows: [
      ["Menu", "rounded", "#7c2d12", "", "#fffbeb", "rounded", "#92400e", "Scan for menu"],
      ["Espresso", "dots", "#44403c", "", "#fafaf9", "none", "", "Order here"],
      ["Bakery", "rounded", "#92400e", "", "#fef3c7", "decorative", "", ""],
      ["Bistro", "square", "#14532d", "", "#f0fdf4", "solid", "", "View the menu"],
      ["Spice", "dots", "#b91c1c", "#c2410c", "#fff7ed", "none", "", ""],
      ["Matcha", "circular", "#3f6212", "", "#f7fee7", "none", "", ""],
      ["Vineyard", "rounded", "#881337", "", "#fff1f2", "decorative", "", "Wine list"],
      ["Diner", "square", "#b91c1c", "", "#ffffff", "rounded", "", "Scan to order"],
      ["Juice Bar", "dots", "#15803d", "#0f766e", "#ffffff", "rounded", "", ""],
      ["Chocolate", "rounded", "#78350f", "#7c2d12", "#fff7ed", "none", "", ""],
    ],
  },
  {
    name: "Social",
    rows: [
      ["Follow", "dots", "#a21caf", "#6d28d9", "#ffffff", "rounded", "", "Follow us"],
      ["Channel", "rounded", "#b91c1c", "", "#ffffff", "rounded", "", "Subscribe"],
      ["Profile", "circular", "#1d4ed8", "", "#eff6ff", "none", "", ""],
      ["Stories", "dots", "#be185d", "#c2410c", "#fdf2f8", "none", "", "See our stories"],
      ["Community", "rounded", "#4338ca", "#0369a1", "#eef2ff", "rounded", "", "Join the community"],
      ["Podcast", "rounded", "#6d28d9", "", "#f5f3ff", "solid", "", "Listen now"],
      ["Playlist", "dots", "#166534", "", "#f0fdf4", "none", "", "Play the playlist"],
      ["Creator", "rounded", "#be123c", "#7e22ce", "#ffffff", "none", "", ""],
      ["Review", "square", "#92400e", "", "#fffbeb", "rounded", "#b45309", "Leave a review"],
      ["Share", "circular", "#0e7490", "#1d4ed8", "#ecfeff", "none", "", ""],
    ],
  },
  {
    name: "Shop",
    rows: [
      ["Sale", "square", "#b91c1c", "", "#ffffff", "solid", "", "Scan for the offer"],
      ["Coupon", "rounded", "#9a3412", "", "#ffedd5", "decorative", "", "Your coupon"],
      ["Boutique", "rounded", "#831843", "", "#fdf2f8", "rounded", "#be185d", ""],
      ["Checkout", "square", "#166534", "", "#ffffff", "rounded", "", "Pay here"],
      ["Loyalty", "dots", "#6d28d9", "#a21caf", "#faf5ff", "rounded", "", "Collect points"],
      ["New Arrival", "rounded", "#0f172a", "#334155", "#f8fafc", "none", "", "Shop the drop"],
      ["Price Tag", "square", "#27272a", "", "#fefce8", "solid", "", ""],
      ["Market", "dots", "#3f6212", "", "#f7fee7", "rounded", "", ""],
      ["Gift Card", "rounded", "#be123c", "#be185d", "#fff1f2", "decorative", "", ""],
      ["Catalogue", "rounded", "#075985", "", "#f0f9ff", "solid", "", "Browse the catalogue"],
    ],
  },
  {
    name: "Celebrations",
    rows: [
      ["Wedding", "rounded", "#713f12", "", "#fffbeb", "decorative", "#b45309", ""],
      ["Save the Date", "dots", "#831843", "", "#fff1f2", "decorative", "#be185d", "Save the date"],
      ["Birthday", "dots", "#7e22ce", "#be185d", "#fdf4ff", "rounded", "", "You're invited"],
      ["Anniversary", "rounded", "#881337", "#701a75", "#ffffff", "decorative", "", ""],
      ["Baby Shower", "circular", "#075985", "", "#e0f2fe", "none", "", ""],
      ["Garden Party", "rounded", "#166534", "", "#f0fdf4", "decorative", "#15803d", "RSVP"],
      ["Festive", "square", "#991b1b", "#14532d", "#ffffff", "decorative", "", ""],
      ["Graduation", "square", "#1e1b4b", "", "#fefce8", "rounded", "#854d0e", ""],
      ["Housewarming", "rounded", "#9a3412", "", "#fff7ed", "rounded", "", ""],
      ["Thank You", "dots", "#0f766e", "", "#f0fdfa", "none", "", "Thank you"],
    ],
  },
  {
    name: "Tech",
    rows: [
      ["Terminal", "square", "#166534", "", "#f7fee7", "none", "", ""],
      ["Circuit", "square", "#0e7490", "#1d4ed8", "#ffffff", "none", "", ""],
      ["App Download", "rounded", "#1d4ed8", "", "#ffffff", "rounded", "", "Get the app"],
      ["Neon", "dots", "#a21caf", "#1d4ed8", "#ffffff", "none", "", ""],
      ["Cloud", "rounded", "#0369a1", "", "#f0f9ff", "rounded", "", ""],
      ["Developer", "square", "#27272a", "", "#f5f5f4", "rounded", "", "View the docs"],
      ["Gaming", "rounded", "#6d28d9", "#be123c", "#f5f3ff", "solid", "", "Join the game"],
      ["Smart Home", "circular", "#115e59", "", "#f0fdfa", "none", "", ""],
      ["Beta", "dots", "#c2410c", "", "#ffffff", "rounded", "", "Try the beta"],
      ["Wi-Fi Pass", "rounded", "#1e293b", "", "#f1f5f9", "rounded", "#334155", "Connect to Wi-Fi"],
    ],
  },
  {
    name: "Learning",
    rows: [
      ["Classroom", "rounded", "#1e40af", "", "#eff6ff", "rounded", "", "Scan to learn"],
      ["Library", "square", "#78350f", "", "#fffbeb", "decorative", "", ""],
      ["Notebook", "square", "#1e3a8a", "", "#ffffff", "solid", "#b91c1c", ""],
      ["Chalkboard", "dots", "#14532d", "", "#ecfdf5", "solid", "", ""],
      ["Campus", "rounded", "#7f1d1d", "", "#ffffff", "rounded", "", ""],
      ["Course", "rounded", "#4338ca", "#7e22ce", "#ffffff", "rounded", "", "Enrol now"],
      ["Quiz", "dots", "#c2410c", "#b91c1c", "#fff7ed", "none", "", "Take the quiz"],
      ["Science Lab", "circular", "#0f766e", "#0369a1", "#ecfeff", "none", "", ""],
      ["Certificate", "square", "#713f12", "", "#fefce8", "decorative", "#854d0e", "Verify certificate"],
      ["Study Group", "dots", "#6d28d9", "", "#f5f3ff", "rounded", "", ""],
    ],
  },
  {
    name: "Travel",
    rows: [
      ["Boarding Pass", "square", "#1e3a8a", "", "#ffffff", "rounded", "", "Boarding pass"],
      ["Seaside", "dots", "#0369a1", "#0f766e", "#f0f9ff", "none", "", ""],
      ["Mountain", "rounded", "#334155", "#115e59", "#f8fafc", "solid", "", ""],
      ["Safari", "rounded", "#854d0e", "", "#fefce8", "decorative", "", ""],
      ["City Guide", "square", "#27272a", "", "#ffffff", "solid", "#c2410c", "Scan for the guide"],
      ["Hotel", "rounded", "#713f12", "", "#fffbeb", "rounded", "#92400e", "Check in"],
      ["Road Trip", "dots", "#9a3412", "#854d0e", "#fff7ed", "rounded", "", ""],
      ["Tropical", "circular", "#047857", "", "#ecfdf5", "none", "", ""],
      ["Museum", "square", "#44403c", "", "#f5f5f4", "decorative", "", "Audio guide"],
      ["Map Pin", "rounded", "#b91c1c", "", "#fef2f2", "none", "", "Find us"],
    ],
  },
  {
    name: "Wellness",
    rows: [
      ["Clinic", "rounded", "#0369a1", "", "#ffffff", "rounded", "", "Book an appointment"],
      ["Pharmacy", "square", "#15803d", "", "#ffffff", "solid", "", ""],
      ["Yoga", "circular", "#6d28d9", "", "#f5f3ff", "none", "", ""],
      ["Spa", "dots", "#0f766e", "", "#f0fdfa", "decorative", "", ""],
      ["Fitness", "square", "#171717", "", "#ffffff", "solid", "#b91c1c", "Join the class"],
      ["Nutrition", "dots", "#3f6212", "#15803d", "#f7fee7", "none", "", ""],
      ["Meditation", "rounded", "#4c1d95", "#1e40af", "#eef2ff", "none", "", ""],
      ["Dental", "rounded", "#0e7490", "", "#ecfeff", "rounded", "", ""],
      ["Charity", "rounded", "#be123c", "", "#fff1f2", "rounded", "", "Donate"],
      ["Salon", "dots", "#831843", "#86198f", "#fdf2f8", "decorative", "#be185d", "Book now"],
    ],
  },
];

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export interface QrLibraryDesign {
  id: string;
  name: string;
  group: string;
  look: Partial<QrSpec>;
}

export const QR_LIBRARY: QrLibraryDesign[] = GROUPS.flatMap((group) =>
  group.rows.map(([name, pattern, foreground, foreground2, background, frame, frameColor, caption]) => ({
    id: `${slug(group.name)}-${slug(name)}`,
    name,
    group: group.name,
    look: {
      pattern, foreground, foreground2, background, frame,
      frameColor: frameColor || foreground,
      quietZone: 4,
      caption,
      captionPosition: "below",
      captionColor: foreground,
    },
  }))
);
