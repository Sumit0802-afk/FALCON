import { useState, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Play,
  ArrowRight,
  Heart,
  ExternalLink,
  X,
  Menu,
  LayoutGrid,
} from "lucide-react";

import { FALCON_TEMPLATES, FalconTemplate } from "@/data/templates";
import { projectService } from "@/services/projectService";
import { LayoutSelectorModal } from "@/components/Editor/LayoutSelectorModal";
import { PageSize } from "@/types";
import { UserMenu, useCurrentUser } from "@/components/UserMenu";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import { TemplateCollection, TemplateCollections } from "@/components/TemplateCollections";

/* ================================================================
   SEARCH-KEYWORD → CONTEXTUAL UNSPLASH IMAGES
   For each keyword, we map to a set of Unsplash photo IDs that
   visually represent the topic.
   ================================================================ */

type SearchResult = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  tag: string;
};

const SEARCH_IMAGE_BANK: Record<string, SearchResult[]> = {
  holi: [
    { id: "sr-holi-1", title: "Holi Festival of Colors", category: "Festivals", tag: "Holi", imageUrl: "https://images.unsplash.com/photo-1615459105094-7e89a57d58e6?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-holi-2", title: "Happy Holi Celebration Burst", category: "Festivals", tag: "Holi", imageUrl: "https://images.unsplash.com/photo-1576367869726-4c5a9e7c8e9e?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-holi-3", title: "Holi Color Splash Art", category: "Festivals", tag: "Holi", imageUrl: "https://images.unsplash.com/photo-1582580826854-36f6ff8e7b7b?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-holi-4", title: "Rang Panchami Festival Poster", category: "Festivals", tag: "Holi", imageUrl: "https://images.unsplash.com/photo-1606216794074-735e91b0e897?w=600&auto=format&fit=crop&q=80" },
  ],
  diwali: [
    { id: "sr-diwali-1", title: "Grand Diwali Lights Celebration", category: "Festivals", tag: "Diwali", imageUrl: "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-diwali-2", title: "Festival of Lights Deepavali", category: "Festivals", tag: "Diwali", imageUrl: "https://images.unsplash.com/photo-1603816245457-74c5521b1ef8?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-diwali-3", title: "Sacred Diwali Diyas & Rangoli", category: "Festivals", tag: "Diwali", imageUrl: "https://images.unsplash.com/photo-1605217613423-0dd9c5f7c2a4?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-diwali-4", title: "Deepavali Golden Lanterns", category: "Festivals", tag: "Diwali", imageUrl: "https://images.unsplash.com/photo-1508010603204-2b9f2fec2b98?w=600&auto=format&fit=crop&q=80" },
  ],
  football: [
    { id: "sr-football-1", title: "Football Championship Match Night", category: "Sports", tag: "Football", imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-football-2", title: "Soccer Stadium Under Lights", category: "Sports", tag: "Football", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-football-3", title: "Victory Goal Celebration", category: "Sports", tag: "Football", imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-football-4", title: "Pro Match Day Poster", category: "Sports", tag: "Football", imageUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&auto=format&fit=crop&q=80" },
  ],
  party: [
    { id: "sr-party-1", title: "Neon Club Party Celebration", category: "Invitations", tag: "Party", imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-party-2", title: "Weekend Birthday Bash", category: "Invitations", tag: "Party", imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-party-3", title: "Late Night Music Party", category: "Invitations", tag: "Party", imageUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-party-4", title: "Golden Confetti Event", category: "Invitations", tag: "Party", imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80" },
  ],
  wedding: [
    { id: "sr-wedding-1", title: "Elegant Wedding Invitation", category: "Invitations", tag: "Wedding", imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-wedding-2", title: "Floral Romance Wedding", category: "Invitations", tag: "Wedding", imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-wedding-3", title: "Luxury Royal Wedding", category: "Invitations", tag: "Wedding", imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-wedding-4", title: "Enchanted Garden Wedding", category: "Invitations", tag: "Wedding", imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=80" },
  ],
  concert: [
    { id: "sr-concert-1", title: "Live Music Concert Tour", category: "Posters", tag: "Concert", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-concert-2", title: "Arena Stage Lights Show", category: "Posters", tag: "Concert", imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b4e0ad0?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-concert-3", title: "Acoustic Live Music Festival", category: "Posters", tag: "Concert", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-concert-4", title: "Electronic DJ Night Showcase", category: "Posters", tag: "Concert", imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&auto=format&fit=crop&q=80" },
  ],
  tech: [
    { id: "sr-tech-1", title: "Global Tech Summit 2026", category: "Tech", tag: "Tech", imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-tech-2", title: "AI & Hackathon Marathon", category: "Tech", tag: "Tech", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-tech-3", title: "Startup Pitch & Launch", category: "Tech", tag: "Tech", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-tech-4", title: "Developer Code Workshop", category: "Tech", tag: "Tech", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
  ],
  christmas: [
    { id: "sr-xmas-1", title: "Merry Christmas Holiday Magic", category: "Festivals", tag: "Christmas", imageUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-xmas-2", title: "Winter Christmas Wonderland", category: "Festivals", tag: "Christmas", imageUrl: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-xmas-3", title: "Warm Holiday Greetings", category: "Festivals", tag: "Christmas", imageUrl: "https://images.unsplash.com/photo-1503775795708-be7b6f965265?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-xmas-4", title: "Christmas Eve Special Gala", category: "Festivals", tag: "Christmas", imageUrl: "https://images.unsplash.com/photo-1481908881098-93e82d6cf046?w=600&auto=format&fit=crop&q=80" },
  ],
  birthday: [
    { id: "sr-bday-1", title: "Birthday Bash Invitation", category: "Invitations", tag: "Birthday", imageUrl: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-bday-2", title: "Sweet Celebrations Birthday Cake", category: "Invitations", tag: "Birthday", imageUrl: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-bday-3", title: "Birthday Confetti & Balloons", category: "Invitations", tag: "Birthday", imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-bday-4", title: "Milestone Birthday Gala", category: "Invitations", tag: "Birthday", imageUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&auto=format&fit=crop&q=80" },
  ],
  food: [
    { id: "sr-food-1", title: "Artisan Restaurant Menu", category: "Posters", tag: "Food", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-food-2", title: "Street Food & Taco Fiesta", category: "Festivals", tag: "Food", imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-food-3", title: "Fresh Burger & Grill Poster", category: "Posters", tag: "Food", imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-food-4", title: "Gourmet Dining Experience", category: "Posters", tag: "Food", imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=600&auto=format&fit=crop&q=80" },
  ],
  sports: [
    { id: "sr-sports-1", title: "Championship Tournament Final", category: "Sports", tag: "Sports", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-sports-2", title: "City Marathon & Run Event", category: "Sports", tag: "Sports", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-sports-3", title: "Cricket Premier League Poster", category: "Sports", tag: "Sports", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-sports-4", title: "Basketball Showdown Night", category: "Sports", tag: "Sports", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80" },
  ],
  fashion: [
    { id: "sr-fashion-1", title: "Spring Fashion Week Runway", category: "Posters", tag: "Fashion", imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-fashion-2", title: "Haute Couture Editorial Lookbook", category: "Posters", tag: "Fashion", imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-fashion-3", title: "Urban Streetwear Collection", category: "Posters", tag: "Fashion", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-fashion-4", title: "Minimalist Style Lookbook", category: "Posters", tag: "Fashion", imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop&q=80" },
  ],
  fitness: [
    { id: "sr-fitness-1", title: "Power Gym Workout Challenge", category: "Sports", tag: "Fitness", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-fitness-2", title: "CrossFit Bootcamp Intensive", category: "Sports", tag: "Fitness", imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-fitness-3", title: "Morning Yoga & Meditation", category: "Sports", tag: "Fitness", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-fitness-4", title: "Personal Training Session", category: "Sports", tag: "Fitness", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },
  ],
  travel: [
    { id: "sr-travel-1", title: "Tropical Island Getaway", category: "Posters", tag: "Travel", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-travel-2", title: "Alpine Mountain Expedition", category: "Posters", tag: "Travel", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-travel-3", title: "Historic European City Tour", category: "Posters", tag: "Travel", imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-travel-4", title: "Wanderlust Road Trip Poster", category: "Posters", tag: "Travel", imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80" },
  ],
  business: [
    { id: "sr-biz-1", title: "Annual Corporate Leadership Summit", category: "Tech", tag: "Business", imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-biz-2", title: "Mega Annual Clearance Sale 50% Off", category: "Posters", tag: "Sale", imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-biz-3", title: "Modern Architecture & Real Estate", category: "Posters", tag: "Business", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80" },
    { id: "sr-biz-4", title: "Specialty Coffee Roasters Menu", category: "Posters", tag: "Cafe", imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80" },
  ],
};

function getContextualResults(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  const results: SearchResult[] = [];

  for (const [keyword, items] of Object.entries(SEARCH_IMAGE_BANK)) {
    const isDirectMatch = q.includes(keyword) || keyword.includes(q);
    const isWordMatch = words.some((w) => keyword.includes(w) || w.includes(keyword));
    if (isDirectMatch || isWordMatch) {
      results.push(...items);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  }).slice(0, 8);
}


const NAV_LINKS = ["Product", "AI Studio", "Templates", "Resources"];

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [preset, setPreset] = useState<{ type: TemplateCollection["type"]; filters: TemplateCollection["filters"] } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { signedIn, user, signOut } = useCurrentUser();

  // Contextual search results (Canva-like)
  const contextualResults = getContextualResults(searchQuery);
  const showContextualResults = searchQuery.trim().length > 0 && contextualResults.length > 0;

  // Shows one collection in the library further down the page
  function openCollection(collection: TemplateCollection) {
    setSearchQuery("");
    setPreset({ type: collection.type, filters: collection.filters });
    document.getElementById("template-gallery-section")?.scrollIntoView({ behavior: "smooth" });
  }

  // Layout selector modal state
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<FalconTemplate | null>(null);
  const [pendingContextualItem, setPendingContextualItem] = useState<SearchResult | null>(null);

  // Show layout selector before creating a blank design
  function createBlankDesign() {
    setPendingTemplate(null);
    setPendingContextualItem(null);
    setLayoutModalOpen(true);
  }

  // Show layout selector before starting with a theme-related search item
  function startWithContextualItem(item: SearchResult) {
    setPendingTemplate(null);
    setPendingContextualItem(item);
    setLayoutModalOpen(true);
  }

  // Called when user confirms layout in the modal
  async function handleLayoutConfirm(size: PageSize) {
    setLayoutModalOpen(false);
    const templateToUse = pendingTemplate;
    const contextualToUse = pendingContextualItem;
    setPendingTemplate(null);
    setPendingContextualItem(null);

    const timestamp = Date.now();

    try {
      if (contextualToUse) {
        // Create project with selected layout and contextual theme elements
        const project = await projectService.create(contextualToUse.title, "local-user", size);
        const pageId = project.pages[0]?.id || `page-${timestamp}`;

        const themePage = {
          id: pageId,
          name: "Page 1",
          size,
          background: "#080b0f",
          elements: [
            // Background image layer
            {
              id: `bg-img-${timestamp}`,
              type: "image",
              x: 0,
              y: 0,
              width: size.width,
              height: size.height,
              src: contextualToUse.imageUrl,
              originalSrc: contextualToUse.imageUrl,
              naturalWidth: size.width,
              naturalHeight: size.height,
              cropX: 0,
              cropY: 0,
              cropWidth: size.width,
              cropHeight: size.height,
              rotation: 0,
              opacity: 0.88,
              locked: false,
              hidden: false,
              zIndex: 0,
            },
            // Dark gradient/scrim overlay at bottom
            {
              id: `scrim-${timestamp}`,
              type: "rectangle",
              x: 0,
              y: Math.round(size.height * 0.48),
              width: size.width,
              height: Math.round(size.height * 0.52),
              fill: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.88) 100%)",
              rotation: 0,
              opacity: 0.95,
              locked: false,
              hidden: false,
              zIndex: 1,
            },
            // Tag badge
            {
              id: `tag-${timestamp}`,
              type: "text",
              x: Math.round(size.width * 0.08),
              y: Math.round(size.height * 0.72),
              width: Math.round(size.width * 0.84),
              height: 36,
              content: contextualToUse.tag.toUpperCase(),
              fontFamily: "Inter, sans-serif",
              fontSize: Math.max(16, Math.round(size.width * 0.022)),
              fontWeight: "700",
              fontStyle: "normal",
              color: "#38bdf8",
              textAlign: "left",
              lineHeight: 1.2,
              letterSpacing: 3,
              rotation: 0,
              opacity: 1,
              locked: false,
              hidden: false,
              zIndex: 2,
            },
            // Title text element
            {
              id: `title-${timestamp}`,
              type: "text",
              x: Math.round(size.width * 0.08),
              y: Math.round(size.height * 0.78),
              width: Math.round(size.width * 0.84),
              height: Math.round(size.height * 0.16),
              content: contextualToUse.title,
              fontFamily: "Playfair Display, serif",
              fontSize: Math.max(28, Math.round(size.width * 0.052)),
              fontWeight: "bold",
              fontStyle: "normal",
              color: "#ffffff",
              textAlign: "left",
              lineHeight: 1.15,
              letterSpacing: 0,
              rotation: 0,
              opacity: 1,
              locked: false,
              hidden: false,
              zIndex: 3,
            },
          ],
        };

        const updated = { ...project, title: contextualToUse.title, pages: [themePage] };
        await projectService.save(updated as any);
        router.push(`/editor/${project.id}`);
        return;
      }

      if (templateToUse) {
        // Create project with selected layout and proportionally scaled template elements
        const project = await projectService.create(templateToUse.name, "local-user", size);
        const scaleX = size.width / templateToUse.width;
        const scaleY = size.height / templateToUse.height;

        const templatePage = {
          ...templateToUse.page,
          id: project.pages[0]?.id || `page-${timestamp}`,
          name: "Page 1",
          size,
          elements: templateToUse.page.elements.map((el) => {
            const scaledEl: any = {
              ...el,
              id: `${el.id}-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
              x: Math.round(el.x * scaleX),
              y: Math.round(el.y * scaleY),
              width: Math.round(el.width * scaleX),
              height: Math.round(el.height * scaleY),
            };
            if ("fontSize" in el && typeof (el as any).fontSize === "number") {
              scaledEl.fontSize = Math.max(12, Math.round((el as any).fontSize * Math.min(scaleX, scaleY)));
            }
            return scaledEl;
          }),
        };

        const updated = { ...project, title: templateToUse.name, pages: [templatePage] };
        await projectService.save(updated as any);
        router.push(`/editor/${updated.id}`);
        return;
      }

      // Blank canvas with chosen layout
      const project = await projectService.create("Untitled Design", "local-user", size);
      router.push(`/editor/${project.id}`);
    } catch (error) {
      console.error("Failed to create design:", error);
      alert("Unable to create design. Please try again.");
    }
  }

  return (
    <>
      <Head>
        <title>Templates — Falcon</title>
        <meta
          name="description"
          content="Choose from professionally crafted Falcon templates for festivals, invitations, events, and more."
        />
        <meta name="theme-color" content="#060a0e" />
      </Head>

      {/* =============================================
          GLOBAL STYLES: Deep Water Background + Animations
          ============================================= */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,600;1,700&display=swap');

        /* Deep water blob animation */
        @keyframes falconWaterDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.04); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes falconWaterDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-35px, 25px) scale(1.06); }
          70% { transform: translate(20px, -30px) scale(0.95); }
        }
        @keyframes falconWaterDrift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(20px, 40px) scale(1.03); }
          65% { transform: translate(-25px, -15px) scale(0.98); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .falcon-water-blob-1 { animation: falconWaterDrift  22s ease-in-out infinite; }
        .falcon-water-blob-2 { animation: falconWaterDrift2 28s ease-in-out infinite; }
        .falcon-water-blob-3 { animation: falconWaterDrift3 18s ease-in-out infinite; }

        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-delay { animation: fadeUp 0.7s ease 0.15s both; }
        .fade-up-delay2 { animation: fadeUp 0.7s ease 0.3s both; }

        /* Hide scrollbar for carousel */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Selection color */
        ::selection { background: rgba(255,255,255,0.15); color: #fff; }
      `}</style>

      {/* =============================================
          ROOT: DEEP DARK OCEAN BACKGROUND
          ============================================= */}
      <div
        className="relative min-h-screen overflow-x-hidden text-[#f4f1eb]"
        style={{ backgroundColor: "#060a0e" }}
      >
        {/* =============================================
            WATER TEXTURE BACKGROUND LAYERS
            ============================================= */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Primary deep teal water blob — top left */}
          <div
            className="falcon-water-blob-1 absolute -left-[200px] -top-[100px] h-[700px] w-[700px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(8,42,60,0.90) 0%, rgba(4,22,35,0.70) 40%, transparent 75%)",
              filter: "blur(40px)",
            }}
          />

          {/* Secondary teal blob — right center */}
          <div
            className="falcon-water-blob-2 absolute -right-[180px] top-[20%] h-[600px] w-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(5,48,68,0.85) 0%, rgba(3,28,45,0.65) 45%, transparent 75%)",
              filter: "blur(50px)",
            }}
          />

          {/* Third blob — bottom center */}
          <div
            className="falcon-water-blob-3 absolute -bottom-[150px] left-[30%] h-[650px] w-[650px] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(6,38,54,0.80) 0%, rgba(4,20,32,0.60) 50%, transparent 75%)",
              filter: "blur(55px)",
            }}
          />

          {/* Deep teal shimmer highlight — center top */}
          <div
            className="absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse at center top, rgba(0,80,100,0.22) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />

          {/* Very subtle cyan ripple at mid-page */}
          <div
            className="absolute left-[20%] top-[45%] h-[300px] w-[500px]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,100,120,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Surface gloss: lighter streak simulating water surface light refraction */}
          <div
            className="absolute left-[-10%] top-[30%] h-[2px] w-[140%] opacity-10"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(80,200,220,0.8) 30%, rgba(140,220,240,0.9) 50%, rgba(80,200,220,0.8) 70%, transparent 100%)",
              transform: "rotate(-8deg)",
              filter: "blur(6px)",
            }}
          />
          <div
            className="absolute left-[-10%] top-[55%] h-[1px] w-[160%] opacity-[0.06]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(100,220,230,0.8) 40%, rgba(160,240,255,0.9) 55%, rgba(100,220,230,0.8) 70%, transparent 100%)",
              transform: "rotate(4deg)",
              filter: "blur(4px)",
            }}
          />

          {/* Overall dark gradient overlay to maintain depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(6,10,14,0.50) 80%, rgba(6,10,14,0.80) 100%)",
            }}
          />
        </div>

        {/* =============================================
            FLOATING NAVBAR (EXACT HOMEPAGE STYLE)
            ============================================= */}
        <header
          className="fixed left-4 right-4 top-4 z-[100] rounded-2xl border border-white/[0.08] bg-black/85 backdrop-blur-xl md:left-6 md:right-6 lg:left-8 lg:right-8 xl:left-[5%] xl:right-[5%]"
        >
          <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between gap-3 px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-7">

            {/* Logo */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="group flex shrink-0 items-center gap-2.5 justify-self-start cursor-pointer"
            >
              <img
                src="/falcon-logo-white.png"
                alt="Falcon Logo"
                className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]"
              />
              <span className="text-[13px] font-semibold tracking-[0.2em] text-[#f4f1eb]">
                FALCON
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden items-center justify-self-center gap-8 lg:flex">
              {NAV_LINKS.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => link === "Templates" ? undefined : link === "AI Studio" ? router.push("/ai-studio") : router.push("/")}
                  className={`whitespace-nowrap text-[13px] transition-colors hover:text-white ${
                    link === "Templates" ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {link}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex shrink-0 items-center gap-3 justify-self-end">
              {signedIn ? (
                <UserMenu user={user} onSignOut={signOut} />
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="hidden text-[13px] text-zinc-400 transition-colors hover:text-white lg:block"
                >
                  Log in
                </button>
              )}

              <button
                type="button"
                className="hidden h-10 items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.04] px-5 text-[13px] text-white backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.08] lg:flex"
              >
                <Play size={12} fill="currentColor" />
                <span>Watch demo</span>
              </button>

              <button
                type="button"
                onClick={createBlankDesign}
                className={`h-10 items-center gap-2 rounded-full bg-[#f4f1eb] px-5 text-[13px] font-medium text-black transition hover:bg-white ${signedIn ? "hidden sm:flex" : "flex"}`}
              >
                Get started
                <ArrowRight size={14} />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 lg:hidden"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="border-t border-white/[0.07] bg-black/90 px-6 py-6 lg:hidden">
              <div className="flex flex-col gap-5">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (link === "AI Studio") router.push("/ai-studio");
                      else if (link !== "Templates") router.push("/");
                    }}
                    className="text-left text-sm text-zinc-400 hover:text-white"
                  >
                    {link}
                  </button>
                ))}
                {signedIn ? (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="text-left text-sm text-zinc-400 hover:text-white"
                  >
                    Log out{user?.name ? ` (${user.name})` : ""}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); router.push("/login"); }}
                    className="text-left text-sm text-zinc-400 hover:text-white"
                  >
                    Log in
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); createBlankDesign(); }}
                  className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-[#f4f1eb] text-sm font-medium text-black"
                >
                  Get started <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* =============================================
            HERO: "Templates for absolutely anything"
            (Homepage-style enormous serif typography)
            ============================================= */}
        <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center pt-[88px] text-center">
          {/* Corner annotations (matches homepage aesthetic) */}
          <div className="pointer-events-none absolute left-[7%] top-[28%] hidden lg:block">
            <div className="font-mono text-[11px] font-medium uppercase leading-[2] tracking-[0.32em] text-white/40">
              <div>DESIGN</div>
              <div>LIBRARY</div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-8 bg-white/25" />
              <span className="font-mono text-[10px] tracking-[0.22em] text-zinc-700">001</span>
            </div>
          </div>

          <div className="pointer-events-none absolute right-[7%] top-[28%] hidden text-right lg:block">
            <div className="font-mono text-[11px] font-medium uppercase leading-[2] tracking-[0.32em] text-white/40">
              <div>CURATED</div>
              <div>TEMPLATES</div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <span className="font-mono text-[10px] tracking-[0.22em] text-zinc-700">FALCON</span>
              <span className="h-px w-8 bg-white/25" />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[22%] left-[7%] hidden items-center gap-3 lg:flex">
            <span className="h-1.5 w-1.5 rotate-45 border border-white/25" />
            <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-700">FULLY EDITABLE</span>
          </div>
          <div className="pointer-events-none absolute bottom-[22%] right-[7%] hidden items-center gap-3 lg:flex">
            <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-700">ONE-CLICK OPEN</span>
            <span className="h-1.5 w-1.5 rotate-45 border border-white/25" />
          </div>

          {/* Main hero content */}
          <div className="relative z-10 mx-auto max-w-[1200px] px-6 lg:px-12">
            {/* Badge */}
            <div className="fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/40 px-5 py-2.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-400">
                FALCON DESIGN LIBRARY
              </span>
            </div>

            {/* The big serif headline (identical font treatment to homepage) */}
            <h1
              className="fade-up-delay font-serif text-[clamp(3.5rem,8vw,8.5rem)] leading-[0.87] tracking-[-0.04em] text-[#f4f1eb]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Templates for
              <span className="block italic text-zinc-400"> absolutely</span>
              <span className="block">anything.</span>
            </h1>

            <p className="fade-up-delay2 mx-auto mt-10 max-w-[620px] text-[15px] leading-7 text-zinc-500 md:text-[17px]">
              Start with a professionally crafted Falcon design — then make it yours with the full editor, AI remix, and campaign tools.
            </p>

            {/* CTA Buttons (homepage-style) */}
            <div className="fade-up-delay2 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={createBlankDesign}
                className="group flex h-14 items-center gap-4 rounded-full bg-[#f4f1eb] px-8 text-[13px] font-medium text-black transition-all duration-300 hover:gap-5 hover:bg-white"
              >
                Start designing for free
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("template-gallery-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex h-14 items-center gap-3 rounded-full border border-white/[0.14] bg-black/30 px-8 text-[13px] text-[#f4f1eb] backdrop-blur-md transition hover:border-white/30 hover:bg-white/[0.06]"
              >
                Browse all templates
              </button>
            </div>

            {/* The full searchable library is further down this page */}
            <button
              type="button"
              onClick={() => document.getElementById("template-gallery-section")?.scrollIntoView({ behavior: "smooth" })}
              className="fade-up-delay2 mt-5 inline-flex items-center gap-2 text-[13px] text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
            >
              Search posters, presentations and certificates
              <ArrowRight size={13} />
            </button>

            {/* Search bar */}
            <div className="mt-12 w-full max-w-2xl mx-auto">
              <div className="relative flex items-center rounded-full border border-white/[0.12] bg-black/40 px-5 py-4 backdrop-blur-md transition focus-within:border-teal-400/40 focus-within:shadow-[0_0_30px_rgba(45,212,191,0.08)]">
                <Search size={18} className="shrink-0 text-zinc-600 mr-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("template-gallery-section")?.scrollIntoView({ behavior: "smooth" }); }}
                  placeholder="Search templates — Hackathon, Diwali, Pitch deck, Workshop..."
                  className="flex-1 bg-transparent text-sm text-[#f4f1eb] outline-none placeholder:text-zinc-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="shrink-0 text-xs text-zinc-500 hover:text-white ml-3"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom ticker */}
          <div className="absolute bottom-8 left-6 right-6 flex items-center justify-between font-mono text-[8px] tracking-[0.15em] text-zinc-700 lg:left-12 lg:right-12">
            <span>FALCON / TEMPLATES</span>
            <div className="hidden items-center gap-3 sm:flex">
              <span>01</span>
              <span className="h-px w-20 bg-zinc-800" />
              <span>POSTERS · PRESENTATIONS · CERTIFICATES</span>
            </div>
          </div>
        </section>

        {/* =============================================
            COLLECTIONS: themed slices of the library
            ============================================= */}
        <section className="relative z-10 border-t border-white/[0.06] px-6 py-16 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.25em] text-zinc-700 uppercase mb-2">
                  Collections
                </p>
                <h2
                  className="font-serif text-3xl text-[#f4f1eb]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Find your starting point
                </h2>
              </div>
              <p className="max-w-[360px] text-[13px] leading-relaxed text-zinc-500">
                Pick a collection to see every matching template, ready to open in the editor.
              </p>
            </div>

            <TemplateCollections onOpen={openCollection} />
          </div>
        </section>

        {/* =============================================
            FULL GALLERY: Category Filters + Grid
            ============================================= */}
        <section
          id="template-gallery-section"
          className="relative z-10 border-t border-white/[0.06] px-6 py-16 pb-32 lg:px-12"
        >
          <div className="mx-auto max-w-[1400px]">
            {/* Section header */}
            <div className="mb-10">
              <p className="font-mono text-[9px] tracking-[0.25em] text-zinc-700 uppercase mb-3">
                All templates
              </p>
              <h2
                className="font-serif text-3xl text-[#f4f1eb]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Posters, presentations and certificates
              </h2>
            </div>

            {/* ─── CONTEXTUAL SEARCH RESULTS (Canva-style) ─── */}
            {showContextualResults && (
              <div className="mb-10">
                <div className="mb-5 flex items-center gap-3">
                  <Search size={14} className="text-teal-400" />
                  <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-teal-600">
                    Theme-Related Designs for "{searchQuery}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {contextualResults.map((result) => (
                    <div
                      key={result.id}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0f14] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
                      onClick={() => startWithContextualItem(result)}
                      title={`Use ${result.title} as template`}
                    >
                      <div data-theme-keep="" className="relative h-[200px] w-full overflow-hidden">
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

                        {/* Tag */}
                        <span className="absolute left-3 top-3 z-10 rounded-full border border-teal-500/30 bg-teal-500/20 px-2.5 py-0.5 font-mono text-[8px] font-medium text-teal-300 backdrop-blur-sm">
                          {result.tag}
                        </span>

                        {/* Title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
                          <p className="text-xs font-semibold leading-tight text-white">{result.title}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{result.category}</p>
                        </div>

                        {/* Hover CTA */}
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                          <span className="rounded-full bg-[#f4f1eb] px-4 py-2 text-xs font-semibold text-black shadow">
                            Select Layout & Start
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-px bg-white/[0.05]" />
              </div>
            )}

            {/* The full library: search, filters, preview and "Use template" */}
            <LibraryBrowser
              basePath="/templates"
              heading={false}
              externalSearch={searchQuery}
              onSearchChange={setSearchQuery}
              preset={preset}
            />
          </div>
        </section>

        {/* =============================================
            FOOTER (Homepage-matched dark style)
            ============================================= */}
        <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10 text-center lg:px-12">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="group flex items-center gap-2.5 transition hover:opacity-90 cursor-pointer"
            >
              <img
                src="/falcon-logo-white.png"
                alt="Falcon Logo"
                className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              />
              <span className="text-[12px] font-semibold tracking-[0.2em] text-[#f4f1eb]">
                FALCON
              </span>
            </button>
            <p className="font-mono text-[10px] tracking-[0.12em] text-zinc-700">
              © 2026 FALCON INC. ALL TEMPLATES ARE FULLY EDITABLE.
            </p>
            <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.15em] text-zinc-700">
              <button type="button" onClick={createBlankDesign} className="hover:text-zinc-400 transition">
                BLANK CANVAS
              </button>
              <button type="button" onClick={() => router.push("/ai-studio")} className="hover:text-zinc-400 transition">
                AI STUDIO
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* =============================================
          LAYOUT SELECTOR MODAL
          ============================================= */}
      {layoutModalOpen && (
        <LayoutSelectorModal
          title={
            pendingTemplate
              ? `Select layout for "${pendingTemplate.name}"`
              : pendingContextualItem
              ? `Select layout for "${pendingContextualItem.title}"`
              : "Choose your poster layout"
          }
          currentLayoutName={
            pendingTemplate
              ? pendingTemplate.width === 1080 && pendingTemplate.height === 1080
                ? "Instagram Post (Square)"
                : pendingTemplate.width === 1080 && pendingTemplate.height === 1920
                ? "Story / Vertical Poster"
                : pendingTemplate.width === 1920 && pendingTemplate.height === 1080
                ? "Presentation / Banner (16:9)"
                : "Portrait Poster"
              : undefined
          }
          onSelect={handleLayoutConfirm}
          onClose={() => {
            setLayoutModalOpen(false);
            setPendingTemplate(null);
            setPendingContextualItem(null);
          }}
        />
      )}
    </>
  );
}
