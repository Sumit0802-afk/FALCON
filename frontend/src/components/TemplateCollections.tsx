import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Layers } from "lucide-react";
import { LibraryCard, LibraryQuery, LibraryType, libraryPageUrl, listLibrary } from "@/services/libraryService";
import { loadGoogleFont } from "@/services/fontService";
import TemplateThumb from "@/components/EmailDesigner/TemplateThumb";

type CollectionFilters = Pick<LibraryQuery, "category" | "subcategory" | "style">;

export interface TemplateCollection {
  id: string;
  title: string;
  tagline: string;
  type: LibraryType;
  filters: CollectionFilters;
  /** Colour of the card's glow and label */
  accent: string;
}

/** Each of these is a real slice of the library, so the previews are live */
export const TEMPLATE_COLLECTIONS: TemplateCollection[] = [
  { id: "hackathon", title: "Hackathons", tagline: "Build nights, code sprints and demo days", type: "poster", filters: { subcategory: "hackathon" }, accent: "#22d3ee" },
  { id: "pitch", title: "Startup pitch decks", tagline: "Problem, traction and the ask, slide by slide", type: "presentation", filters: { subcategory: "startup-pitch-deck" }, accent: "#a78bfa" },
  { id: "hiring", title: "We're hiring", tagline: "Open roles that get noticed and shared", type: "poster", filters: { subcategory: "hiring" }, accent: "#34d399" },
  { id: "neon", title: "Neon nights", tagline: "Glowing type on deep, dark backgrounds", type: "poster", filters: { style: "neon" }, accent: "#f472b6" },
  { id: "fest", title: "College fests", tagline: "Line-ups, dates and passes for campus events", type: "poster", filters: { subcategory: "college-fest" }, accent: "#fbbf24" },
  { id: "ai", title: "AI & data decks", tagline: "Models, charts and results explained clearly", type: "presentation", filters: { subcategory: "ai" }, accent: "#60a5fa" },
  { id: "luxury", title: "Luxury & premium", tagline: "Gold accents, serif type and quiet space", type: "poster", filters: { style: "luxury" }, accent: "#eab308" },
  { id: "portfolio", title: "Portfolios", tagline: "Show your work, one project per slide", type: "presentation", filters: { subcategory: "portfolio" }, accent: "#fb7185" },
];

const TYPE_LABEL: Record<LibraryType, string> = { poster: "Posters", presentation: "Presentations", certificate: "Certificates" };

function CollectionCard({ collection, index, onOpen }: { collection: TemplateCollection; index: number; onOpen: () => void }) {
  const [cards, setCards] = useState<LibraryCard[] | null>(null);
  const deck = collection.type !== "poster";

  useEffect(() => {
    let cancelled = false;
    listLibrary({ type: collection.type, ...collection.filters, orientation: collection.type === "poster" ? "portrait" : collection.type === "certificate" ? "landscape" : undefined, limit: 3 })
      .then((page) => {
        if (cancelled) return;
        setCards(page.items.slice(0, 3));
        page.items.slice(0, 3).forEach((card) => card.fonts.forEach((family) => { loadGoogleFont(family).catch(() => undefined); }));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [collection, deck]);

  const slots = cards?.length ? cards : [null, null, null];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Browse ${collection.title} templates`}
      className="falcon-col-card group relative flex w-[78vw] max-w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0f14] text-left sm:w-auto sm:max-w-none"
      style={{ "--col": collection.accent, "--col-i": index } as React.CSSProperties}
    >
      <span className="falcon-col-glow" aria-hidden="true" />

      {/* Three real templates from this collection, fanned out */}
      <span className="relative block h-[210px] w-full">
        {slots.map((card, i) => (
          <span
            key={card?.id ?? i}
            className="falcon-col-thumb"
            data-pos={slots.length === 1 ? 1 : i}
            style={{
              width: deck ? 176 : 112,
              aspectRatio: card ? `${card.width} / ${card.height}` : deck ? "16 / 9" : "4 / 5",
            }}
          >
            {card
              ? <TemplateThumb src={libraryPageUrl(card.id)} title={card.title} backing="bg-[#11161d]" />
              : <span className="block h-full w-full animate-pulse bg-white/[0.05]" />}
          </span>
        ))}
      </span>

      <span className="relative flex flex-1 flex-col px-5 pb-5 pt-1">
        <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: collection.accent }}>
          {collection.type === "presentation" && <Layers size={10} />}
          {TYPE_LABEL[collection.type]}
        </span>
        <span className="mt-2 flex items-start justify-between gap-3">
          <span className="text-[17px] font-semibold leading-snug text-[#f4f1eb]">{collection.title}</span>
          <span className="falcon-col-arrow flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-zinc-400">
            <ArrowUpRight size={15} />
          </span>
        </span>
        <span className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-500">{collection.tagline}</span>
      </span>
    </button>
  );
}

/** A grid of themed slices of the template library; choosing one opens it in the browser below */
export function TemplateCollections({ onOpen }: { onOpen: (collection: TemplateCollection) => void }) {
  const holder = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  // The cards rise into place the first time the section scrolls into view
  useEffect(() => {
    const node = holder.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      setShown(true);
      observer.disconnect();
    }, { rootMargin: "-80px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={holder}
      data-shown={shown}
      className="falcon-col-grid no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
    >
      {TEMPLATE_COLLECTIONS.map((collection, index) => (
        <CollectionCard key={collection.id} collection={collection} index={index} onOpen={() => onOpen(collection)} />
      ))}
    </div>
  );
}
