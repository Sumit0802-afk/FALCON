import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Layers, LayoutTemplate, Search, X } from "lucide-react";
import { CanvasElement, DesignPage } from "@/types";
import { loadGoogleFont } from "@/services/fontService";
import { LibraryCard, LibraryType, getLibraryDesign, libraryPageUrl, listLibrary } from "@/services/libraryService";
import TemplateThumb from "@/components/EmailDesigner/TemplateThumb";

interface LibraryTemplatesPanelProps {
  /** The page open in the editor; a template replaces its content */
  page: DesignPage;
  onApply: (page: DesignPage) => void;
  theme?: "dark" | "light";
}

const TABS: { id: LibraryType; label: string }[] = [
  { id: "poster", label: "Posters" },
  { id: "presentation", label: "Presentations" },
  { id: "certificate", label: "Certificates" },
];

const PAGE_SIZE = 18;

/**
 * The editor's Templates panel. It browses the same library as the Templates
 * page and puts the chosen design on the page that is open. Decks show their
 * slides first, so any one slide can be used.
 */
export function LibraryTemplatesPanel({ page, onApply, theme = "dark" }: LibraryTemplatesPanelProps) {
  const isDark = theme === "dark";
  const [type, setType] = useState<LibraryType>("poster");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<LibraryCard[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [deck, setDeck] = useState<LibraryCard | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  const request = useRef(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = useMemo(() => ({ type, q: search || undefined, limit: PAGE_SIZE }), [type, search]);

  useEffect(() => {
    const id = ++request.current;
    setLoading(true);
    setError("");
    listLibrary(query)
      .then((result) => {
        if (id !== request.current) return;
        setItems(result.items);
        setCursor(result.nextCursor);
        scroller.current?.scrollTo({ top: 0 });
      })
      .catch(() => { if (id === request.current) { setItems([]); setCursor(null); setError("Templates could not be loaded. Check that the Falcon server is running."); } })
      .finally(() => { if (id === request.current) setLoading(false); });
  }, [query]);

  const loadMore = useCallback(() => {
    if (!cursor || loading || loadingMore) return;
    const id = request.current;
    setLoadingMore(true);
    listLibrary({ ...query, cursor })
      .then((result) => {
        if (id !== request.current) return;
        setItems((list) => {
          const known = new Set(list.map((i) => i.id));
          return [...list, ...result.items.filter((i) => !known.has(i.id))];
        });
        setCursor(result.nextCursor);
      })
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  }, [cursor, loading, loadingMore, query]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) loadMore(); }, { root: scroller.current, rootMargin: "400px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, deck]);

  /** Puts one page of a template on the open page, after a warning if that would replace work */
  const apply = async (card: LibraryCard, pageNumber: number) => {
    if (applying) return;
    if (page.elements.length > 0 && !window.confirm("Replace everything on this page with the template? You can undo this.")) return;
    setApplying(`${card.id}:${pageNumber}`);
    setError("");
    try {
      const pages = await getLibraryDesign(card.id);
      const source = pages[pageNumber - 1] ?? pages[0];
      if (!source) throw new Error("empty template");
      card.fonts.forEach((family) => { loadGoogleFont(family).catch(() => undefined); });
      // Fresh ids, so the same template can be used on several pages of one project
      const stamp = Date.now().toString(36);
      const elements = (source.elements as CanvasElement[]).map((el, index) => ({ ...el, id: `tpl-${stamp}-${index}` }));
      onApply({ ...page, size: { width: source.width, height: source.height, name: card.sizeName || "Custom" }, background: source.background, elements });
    } catch {
      setError("That template could not be opened. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const shell = isDark ? "border-white/[0.08] bg-[#0c1017] text-white" : "border-slate-200 bg-white text-slate-900";
  const bar = isDark ? "border-white/[0.07] bg-[#0f141f]" : "border-slate-200 bg-slate-50";
  const muted = isDark ? "text-zinc-500" : "text-slate-500";
  const cardBorder = isDark ? "border-white/[0.08] hover:border-cyan-400" : "border-slate-200 hover:border-cyan-500";

  return (
    <aside className={`flex h-full w-[340px] shrink-0 select-none flex-col border-r transition-colors duration-200 ${shell}`}>
      <div className={`border-b p-3.5 ${bar}`}>
        {deck ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setDeck(null)} aria-label="Back to templates" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${isDark ? "border-white/[0.08] bg-[#151b28] text-zinc-300 hover:text-white" : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"}`}>
              <ArrowLeft size={15} />
            </button>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold" title={deck.title}>{deck.subcategoryName}</div>
              <div className={`text-[11px] ${muted}`}>Choose a slide to use on this page</div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search templates..."
                aria-label="Search templates"
                className={`w-full rounded-xl border py-2 pl-9 pr-8 text-xs outline-none transition ${isDark ? "border-white/[0.08] bg-[#151b28] text-white placeholder-zinc-500 focus:border-cyan-500/70 focus:bg-[#192233]" : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-600"}`}
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>
            <div role="tablist" aria-label="Template type" className="mt-3 flex flex-wrap items-center gap-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={type === tab.id}
                  onClick={() => setType(tab.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${type === tab.id ? "bg-cyan-500 font-semibold text-black shadow-sm shadow-cyan-500/30" : isDark ? "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200" : "bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto p-3.5">
        {error && <div role="alert" className="mb-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">{error}</div>}

        {deck ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: deck.slideCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => apply(deck, n)}
                disabled={!!applying}
                aria-label={`Use slide ${n}`}
                className={`relative overflow-hidden rounded-lg border transition disabled:opacity-60 ${cardBorder}`}
                style={{ aspectRatio: `${deck.width} / ${deck.height}` }}
              >
                <TemplateThumb src={libraryPageUrl(deck.id, n)} title={`Slide ${n}`} backing="bg-[#0e1319]" />
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[9px] font-semibold text-white">{applying === `${deck.id}:${n}` ? "Opening…" : n}</span>
              </button>
            ))}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={`animate-pulse rounded-lg ${isDark ? "bg-white/[0.04]" : "bg-slate-100"} ${type === "poster" ? "h-40" : "h-24"}`} />)}
          </div>
        ) : items.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutTemplate size={28} className="text-zinc-500" />
            <p className="mt-3 text-xs font-medium text-zinc-400">No templates found</p>
            <p className="mt-1 text-[11px] text-zinc-600">Try fewer or different words</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => (card.slideCount > 1 ? setDeck(card) : apply(card, 1))}
                disabled={!!applying}
                title={card.title}
                aria-label={card.slideCount > 1 ? `Show the slides of ${card.title}` : `Use ${card.title}`}
                className={`group relative overflow-hidden rounded-lg border text-left transition disabled:opacity-60 ${cardBorder}`}
                style={{ aspectRatio: `${card.width} / ${card.height}` }}
              >
                <TemplateThumb src={libraryPageUrl(card.id)} title={card.title} backing="bg-[#0e1319]" />
                {card.slideCount > 1 && (
                  <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-semibold text-white">
                    <Layers size={9} /> {card.slideCount}
                  </span>
                )}
                {applying === `${card.id}:1` && <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] font-medium text-white">Opening…</span>}
              </button>
            ))}
          </div>
        )}

        {!deck && <div ref={sentinel} className="h-6" />}
        {loadingMore && <div className={`py-2 text-center text-[11px] ${muted}`}>Loading more…</div>}
      </div>
    </aside>
  );
}
