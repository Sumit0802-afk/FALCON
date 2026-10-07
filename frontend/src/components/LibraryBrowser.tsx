import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Layers, Search, SlidersHorizontal, X } from "lucide-react";
import { isAuthenticated } from "@/services/authService";
import { ApiError } from "@/services/api";
import { loadGoogleFont } from "@/services/fontService";
import {
  LibraryCard, LibraryFacets, LibraryQuery, LibraryType, getLibraryFacets, libraryPageUrl, listLibrary, setLibraryFavorite,
  copyLibraryTemplate, getRelatedTemplates,
} from "@/services/libraryService";
import TemplateThumb from "@/components/EmailDesigner/TemplateThumb";

const PAGE_SIZE = 24;

const TYPES: { id: LibraryType; label: string; noun: string }[] = [
  { id: "poster", label: "Posters", noun: "poster" },
  { id: "presentation", label: "Presentations", noun: "presentation" },
  { id: "certificate", label: "Certificates", noun: "certificate" },
];

const SEARCH_HINT: Record<LibraryType, string> = {
  poster: "Search e.g. dark tech hackathon, modern recruitment",
  presentation: "Search e.g. AI startup pitch, minimal business",
  certificate: "Search e.g. gold achievement, internship, employee of the month",
};

const SUBCATEGORY_LABEL: Record<LibraryType, string> = {
  poster: "Event type",
  presentation: "Presentation type",
  certificate: "Certificate type",
};

const SORTS: { id: NonNullable<LibraryQuery["sort"]>; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "popular", label: "Most used" },
  { id: "newest", label: "Newest" },
];

type Filters = Pick<LibraryQuery, "category" | "subcategory" | "style" | "industry" | "color" | "size" | "orientation" | "aspect" | "slides">;

const EMPTY: Filters = {};

/** Swatch shown next to each colour family in the filter */
const COLOR_DOT: Record<string, string> = {
  black: "#111111", white: "#FFFFFF", grey: "#8B8F98", blue: "#3B82F6", purple: "#8B5CF6", pink: "#EC4899", red: "#EF4444",
  orange: "#F97316", yellow: "#EAB308", green: "#22C55E", teal: "#14B8A6", brown: "#B45309",
  multicolor: "linear-gradient(135deg,#F43F5E,#F59E0B,#22C55E,#3B82F6)",
};

// ─── Small parts ──────────────────────────────────────────────────────────────

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-zinc-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full min-w-0 rounded-lg border bg-white/[0.04] px-2.5 text-[12.5px] outline-none transition focus:border-white/30 [&>option]:bg-[#0b0f14] [&>option]:text-white ${value ? "border-[#2F81FF]/60 text-white" : "border-white/[0.10] text-zinc-300"}`}
      >
        {children}
      </select>
    </label>
  );
}

function Card({ card, busy, onPreview, onUse, onFavorite }: { card: LibraryCard; busy: boolean; onPreview: () => void; onUse: () => void; onFavorite: () => void }) {
  // Previews name the template's own fonts; loading them makes the preview match the editor
  useEffect(() => {
    card.fonts.forEach((family) => { loadGoogleFont(family).catch(() => undefined); });
  }, [card.fonts]);

  const deck = card.type === "presentation";
  const landscape = card.type !== "poster";
  return (
    <div className="falcon-lib-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f14] transition-colors duration-200 hover:border-white/20">
      <button type="button" onClick={onPreview} aria-label={`Preview ${card.title}`} className={`relative block w-full overflow-hidden bg-[#0e1319] ${landscape ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
        <div className="absolute inset-3">
          <TemplateThumb src={libraryPageUrl(card.id)} title={card.title} backing="bg-transparent" />
        </div>
        <span className="absolute left-2.5 top-2.5 rounded-full border border-emerald-400/25 bg-black/70 px-2 py-0.5 text-[10px] font-medium text-emerald-300 backdrop-blur">Editable</span>
        {deck && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full border border-white/15 bg-black/70 px-2 py-0.5 text-[10px] font-medium text-zinc-200 backdrop-blur">
            <Layers size={10} /> {card.slideCount} slides
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
          <span className="rounded-full bg-white/95 px-4 py-2 text-[12px] font-medium text-black">Preview</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onFavorite}
        aria-label={card.isFavorite ? "Remove from favourites" : "Add to favourites"}
        aria-pressed={card.isFavorite}
        className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition ${card.isFavorite ? "border-rose-400/50 bg-rose-500/20 text-rose-300" : "border-white/15 bg-black/60 text-zinc-300 hover:text-white"}`}
      >
        <Heart size={14} fill={card.isFavorite ? "currentColor" : "none"} />
      </button>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="line-clamp-2 text-[13px] font-medium leading-snug text-white" title={card.title}>{card.title}</div>
        <div className="mt-1.5 truncate text-[11.5px] text-zinc-500">{card.subcategoryName} · {card.styleName}</div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-zinc-600">
          <span className="truncate">{card.width} × {card.height}{deck ? ` · ${card.aspect}` : ""}</span>
          <span className="flex shrink-0 gap-1">
            {card.palette.slice(0, 4).map((color, i) => <span key={i} className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ background: color }} />)}
          </span>
        </div>
        <button type="button" onClick={onUse} disabled={busy} className="mt-3 flex h-9 items-center justify-center gap-2 rounded-full bg-[#f4f1eb] text-[12.5px] font-medium text-black transition hover:bg-white disabled:opacity-50">
          {busy ? "Opening…" : <>Use template <ArrowRight size={13} /></>}
        </button>
      </div>
    </div>
  );
}

function PreviewModal({ card, busy, onClose, onUse, onFavorite, onOpen }: { card: LibraryCard; busy: boolean; onClose: () => void; onUse: () => void; onFavorite: () => void; onOpen: (card: LibraryCard) => void }) {
  const [page, setPage] = useState(1);
  const [related, setRelated] = useState<LibraryCard[]>([]);

  // Moving to another template starts again from its first page
  useEffect(() => {
    setPage(1);
    setRelated([]);
    const controller = new AbortController();
    getRelatedTemplates(card.id, 6, controller.signal).then(setRelated).catch(() => undefined);
    return () => controller.abort();
  }, [card.id]);
  const strip = useRef<HTMLDivElement>(null);
  const pages = card.slideCount;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setPage((p) => Math.min(pages, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pages]);

  useEffect(() => {
    strip.current?.querySelector(`[data-page="${page}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [page]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#060a0e] shadow-2xl lg:flex-row">
        <button type="button" onClick={onClose} aria-label="Close preview" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-zinc-300 hover:text-white"><X size={16} /></button>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#0b0f14]">
          <div className="relative flex min-h-[260px] flex-1 items-center justify-center p-4 sm:p-6">
            <div className="h-[46vh] w-full sm:h-[62vh]">
              <TemplateThumb key={`${card.id}-${page}`} src={libraryPageUrl(card.id, page)} title={`${card.title}, page ${page}`} backing="bg-transparent" />
            </div>
            {pages > 1 && (
              <>
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous slide" className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} aria-label="Next slide" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white disabled:opacity-30"><ChevronRight size={16} /></button>
              </>
            )}
          </div>
          {pages > 1 && (
            <div ref={strip} className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/[0.06] p-3 [scrollbar-width:thin]">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" data-page={n} onClick={() => setPage(n)} aria-label={`Slide ${n}`} aria-current={n === page} className={`relative h-[58px] w-[98px] shrink-0 overflow-hidden rounded-md border transition ${n === page ? "border-[#2F81FF]" : "border-white/10 opacity-70 hover:opacity-100"}`}>
                  <TemplateThumb src={libraryPageUrl(card.id, n)} title={`Slide ${n}`} backing="bg-[#0e1319]" />
                  <span className="absolute bottom-0.5 right-1 rounded bg-black/70 px-1 text-[9px] text-white">{n}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto p-5 lg:w-[320px]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{card.id}</div>
            <h2 className="mt-1.5 text-[17px] font-semibold leading-snug text-white">{card.title}</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-400">{card.description}</p>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-[11.5px]">
            {[
              ["Category", card.subcategoryName], ["Style", card.styleName], ["Size", `${card.width} × ${card.height}`],
              [card.type === "presentation" ? "Slides" : "Format", card.type === "presentation" ? `${card.slideCount} · ${card.aspect}` : card.sizeName],
              ["Fonts", card.fonts.join(", ")], ["Editable", "Text, colours, images"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/[0.06] p-2.5">
                <dt className="text-zinc-600">{label}</dt>
                <dd className="mt-0.5 truncate text-zinc-300" title={value}>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center gap-2">
            {card.palette.map((color, i) => <span key={i} className="h-6 w-6 rounded-full border border-white/20" style={{ background: color }} title={color} />)}
            <span className="ml-1 text-[11px] text-zinc-500">Every colour is editable</span>
          </div>
          {related.length > 0 && (
            <div>
              <div className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-zinc-600">More like this</div>
              <div className="grid grid-cols-3 gap-2">
                {related.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpen(item)}
                    title={item.title}
                    aria-label={`Preview ${item.title}`}
                    className="overflow-hidden rounded-md border border-white/10 bg-[#0e1319] transition hover:border-white/40"
                    style={{ aspectRatio: item.type === "poster" ? "4 / 5" : "4 / 3" }}
                  >
                    <TemplateThumb src={libraryPageUrl(item.id)} title={item.title} backing="bg-transparent" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-auto flex flex-col gap-2 pt-2">
            <button type="button" onClick={onUse} disabled={busy} className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#f4f1eb] text-[13px] font-medium text-black transition hover:bg-white disabled:opacity-50">
              {busy ? "Opening the editor…" : <>Use this template <ArrowRight size={14} /></>}
            </button>
            <button type="button" onClick={onFavorite} className={`flex h-10 items-center justify-center gap-2 rounded-full border text-[12.5px] transition ${card.isFavorite ? "border-rose-400/40 text-rose-300" : "border-white/[0.12] text-zinc-300 hover:border-white/30 hover:text-white"}`}>
              <Heart size={14} fill={card.isFavorite ? "currentColor" : "none"} /> {card.isFavorite ? "Saved to favourites" : "Add to favourites"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface LibraryBrowserProps {
  /** The page showing the browser, so signing in returns to it */
  basePath?: string;
  /** Shows the title and description above the search box */
  heading?: boolean;
  /** A search typed elsewhere on the page; the browser follows it */
  externalSearch?: string;
  /** Reports what is typed into the browser's own search box */
  onSearchChange?: (value: string) => void;
  /** Opens one slice of the library. Pass a new object each time, even for the same slice */
  preset?: { type: LibraryType; filters: Filters } | null;
}

/** Search, filters, cards and preview for the poster and presentation library */
export function LibraryBrowser({ basePath = "/library", heading = true, externalSearch, onSearchChange, preset }: LibraryBrowserProps) {
  const router = useRouter();

  const [type, setType] = useState<LibraryType>("poster");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<NonNullable<LibraryQuery["sort"]>>("recommended");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [facets, setFacets] = useState<LibraryFacets | null>(null);
  const [items, setItems] = useState<LibraryCard[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<LibraryCard | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const requestRef = useRef(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const ready = useRef(false);

  // Start from the address bar, so searches and tabs can be linked to
  useEffect(() => {
    if (!router.isReady || ready.current) return;
    ready.current = true;
    const q = router.query;
    if (q.type === "presentation" || q.type === "certificate") setType(q.type);
    if (typeof q.q === "string") { setSearchInput(q.q); setSearch(q.q); }
    if (typeof q.category === "string") setFilters((f) => ({ ...f, category: q.category as string }));
    if (typeof q.style === "string") setFilters((f) => ({ ...f, style: q.style as string }));
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (externalSearch !== undefined) setSearchInput(externalSearch);
  }, [externalSearch]);

  useEffect(() => {
    if (!preset) return;
    setType(preset.type);
    setFilters(preset.filters);
    setSort("recommended");
    setFavoritesOnly(false);
    setSearchInput("");
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const typeSearch = (value: string) => {
    setSearchInput(value);
    onSearchChange?.(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setFacets(null);
    getLibraryFacets(type).then(setFacets).catch(() => undefined);
  }, [type]);

  const query: LibraryQuery = useMemo(
    () => ({ type, q: search || undefined, ...filters, sort, favorites: favoritesOnly || undefined, limit: PAGE_SIZE }),
    [type, search, filters, sort, favoritesOnly]
  );

  // First page, whenever the search or a filter changes
  useEffect(() => {
    if (!router.isReady) return;
    const request = ++requestRef.current;
    setLoading(true);
    setError("");
    listLibrary(query)
      .then((page) => {
        if (request !== requestRef.current) return;
        setItems(page.items);
        setCursor(page.nextCursor);
      })
      .catch(() => { if (request === requestRef.current) { setItems([]); setCursor(null); setError("We couldn't load templates. Check that the Falcon server is running and try again."); } })
      .finally(() => { if (request === requestRef.current) setLoading(false); });
  }, [query, router.isReady]);

  const loadMore = useCallback(() => {
    if (!cursor || loadingMore || loading) return;
    const request = requestRef.current;
    setLoadingMore(true);
    listLibrary({ ...query, cursor })
      .then((page) => {
        if (request !== requestRef.current) return;
        setItems((list) => {
          const known = new Set(list.map((i) => i.id));
          return [...list, ...page.items.filter((i) => !known.has(i.id))];
        });
        setCursor(page.nextCursor);
      })
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  }, [cursor, loading, loadingMore, query]);

  // Fetch the next page as the end of the grid comes into view
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) loadMore(); }, { rootMargin: "900px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const signInFirst = useCallback(() => {
    const back = `${basePath}?type=${type}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
    router.push(`/login?redirect=${encodeURIComponent(back)}`);
  }, [router, basePath, type, search]);

  const useTemplate = async (card: LibraryCard) => {
    if (!isAuthenticated()) return signInFirst();
    setBusyId(card.id);
    setError("");
    try {
      const { projectId } = await copyLibraryTemplate(card.id);
      router.push(`/editor/${projectId}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return signInFirst();
      setError("We couldn't open that template. Please try again.");
      setBusyId(null);
    }
  };

  const toggleFavorite = async (card: LibraryCard) => {
    if (!isAuthenticated()) return signInFirst();
    const next = !card.isFavorite;
    const apply = (value: boolean) => {
      setItems((list) => list.map((i) => (i.id === card.id ? { ...i, isFavorite: value } : i)));
      setPreview((p) => (p && p.id === card.id ? { ...p, isFavorite: value } : p));
    };
    apply(next);
    try {
      await setLibraryFavorite(card.id, next);
    } catch {
      apply(!next);
    }
  };

  const changeType = (next: LibraryType) => {
    if (next === type) return;
    setType(next);
    setFilters(EMPTY);
    setSort("recommended");
  };

  const setFilter = (patch: Filters) => setFilters((f) => ({ ...f, ...patch }));
  const activeFilters = Object.values(filters).filter(Boolean).length + (favoritesOnly ? 1 : 0);
  const category = facets?.categories.find((c) => c.slug === filters.category);

  return (
    <>
      <div className="text-white">
      <div className="mx-auto max-w-3xl text-center">
        {heading && <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-[#f4f1eb] md:text-[42px]">Templates you can make your own</h1>}
        <p className={`text-[14px] text-zinc-400 ${heading ? "mt-3" : ""}`}>
          Every template opens in the editor with all of its text, colours, shapes and images editable.
        </p>
        <div className="relative mx-auto mt-6 max-w-xl">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => typeSearch(e.target.value)}
            placeholder={SEARCH_HINT[type]}
            aria-label="Search templates"
            className="h-12 w-full rounded-full border border-white/[0.12] bg-white/[0.04] pl-11 pr-10 text-[14px] text-white placeholder-zinc-600 outline-none transition focus:border-white/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchInput && <button type="button" onClick={() => typeSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"><X size={16} /></button>}
        </div>
      </div>

      {/* Type tabs and view options */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Template type" className="flex rounded-full border border-white/[0.10] bg-white/[0.03] p-1">
          {TYPES.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={type === t.id} onClick={() => changeType(t.id)} className={`rounded-full px-5 py-1.5 text-[13px] transition ${type === t.id ? "bg-[#f4f1eb] font-medium text-black" : "text-zinc-400 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-pressed={favoritesOnly} onClick={() => (isAuthenticated() ? setFavoritesOnly((v) => !v) : signInFirst())} className={`flex h-9 items-center gap-2 rounded-full border px-4 text-[12.5px] transition ${favoritesOnly ? "border-rose-400/50 bg-rose-500/10 text-rose-300" : "border-white/[0.10] text-zinc-300 hover:border-white/25 hover:text-white"}`}>
            <Heart size={13} fill={favoritesOnly ? "currentColor" : "none"} /> Favourites
          </button>
          <button type="button" aria-expanded={showFilters} onClick={() => setShowFilters((v) => !v)} className="flex h-9 items-center gap-2 rounded-full border border-white/[0.10] px-4 text-[12.5px] text-zinc-300 transition hover:border-white/25 hover:text-white lg:hidden">
            <SlidersHorizontal size={13} /> Filters{activeFilters ? ` (${activeFilters})` : ""}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort by" className="h-9 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 text-[12.5px] text-zinc-300 outline-none [&>option]:bg-[#0b0f14]">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className={`${showFilters ? "grid" : "hidden"} mt-4 grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] bg-[#0b0f14]/80 p-4 sm:grid-cols-3 lg:grid lg:grid-cols-7`}>
        <Select label="Category" value={filters.category || ""} onChange={(v) => setFilter({ category: v || undefined, subcategory: undefined })}>
          <option value="">All categories</option>
          {facets?.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
        <Select label={SUBCATEGORY_LABEL[type]} value={filters.subcategory || ""} onChange={(v) => setFilter({ subcategory: v || undefined })}>
          <option value="">{category ? `All ${category.name.toLowerCase()}` : "All types"}</option>
          {(category ? category.children : facets?.categories.flatMap((c) => c.children).sort((a, b) => a.name.localeCompare(b.name)) || []).map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </Select>
        <Select label="Style" value={filters.style || ""} onChange={(v) => setFilter({ style: v || undefined })}>
          <option value="">All styles</option>
          {facets?.styles.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </Select>
        <Select label="Colour" value={filters.color || ""} onChange={(v) => setFilter({ color: v || undefined })}>
          <option value="">All colours</option>
          {facets?.colors.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
        <Select label="Industry" value={filters.industry || ""} onChange={(v) => setFilter({ industry: v || undefined })}>
          <option value="">All industries</option>
          {facets?.industries.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}
        </Select>
        {type !== "presentation" ? (
          <>
            <Select label="Size" value={filters.size || ""} onChange={(v) => setFilter({ size: v || undefined })}>
              <option value="">All sizes</option>
              {facets?.sizes.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </Select>
            <Select label="Orientation" value={filters.orientation || ""} onChange={(v) => setFilter({ orientation: v || undefined })}>
              <option value="">Any orientation</option>
              {(type === "certificate" ? ["landscape", "portrait"] : ["portrait", "square", "landscape"]).map((o) => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
            </Select>
          </>
        ) : (
          <>
            <Select label="Slides" value={filters.slides || ""} onChange={(v) => setFilter({ slides: v || undefined })}>
              <option value="">Any length</option>
              {facets?.slideCounts.filter((s) => s.value < 25).map((s) => <option key={s.value} value={String(s.value)}>{s.value} slides</option>)}
              <option value="25+">25+ slides</option>
            </Select>
            <Select label="Aspect ratio" value={filters.aspect || ""} onChange={(v) => setFilter({ aspect: v || undefined })}>
              <option value="">Any ratio</option>
              {facets?.aspects.map((a) => <option key={a.slug} value={a.slug}>{a.slug}</option>)}
            </Select>
          </>
        )}
      </div>

      {/* Colour shortcuts */}
      {facets && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Colour</span>
          {facets.colors.map((c) => (
            <button key={c.slug} type="button" title={c.name} aria-label={`${c.name} templates`} aria-pressed={filters.color === c.slug} onClick={() => setFilter({ color: filters.color === c.slug ? undefined : c.slug })} className={`h-6 w-6 shrink-0 rounded-full border-2 transition ${filters.color === c.slug ? "scale-110 border-white" : "border-white/20 hover:border-white/60"}`} style={{ background: COLOR_DOT[c.slug] || "#888" }} />
          ))}
          {activeFilters > 0 && (
            <button type="button" onClick={() => { setFilters(EMPTY); setFavoritesOnly(false); }} className="ml-2 shrink-0 rounded-full border border-white/[0.10] px-3 py-1 text-[11.5px] text-zinc-400 hover:text-white">Clear filters</button>
          )}
        </div>
      )}

      <div className="mt-6 text-[12.5px] text-zinc-500" aria-live="polite">
        {loading ? "Loading…" : search ? `Results for “${search}”` : ""}
      </div>

      {error && <div role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[13px] text-red-300">{error}</div>}

      {loading ? (
        <div className={`mt-4 grid gap-5 ${type === "poster" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className={`animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03] ${type === "poster" ? "h-[380px]" : "h-[300px]"}`} />)}
        </div>
      ) : items.length === 0 && !error ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/[0.12] px-6 py-16 text-center">
          <div className="text-[15px] text-white">{favoritesOnly ? "No favourites yet" : "No templates match"}</div>
          <p className="mt-1.5 text-[13px] text-zinc-500">{favoritesOnly ? "Tap the heart on any template to keep it here." : "Try fewer words or clear a filter."}</p>
          <button type="button" onClick={() => { setFilters(EMPTY); setFavoritesOnly(false); typeSearch(""); }} className="mt-5 h-10 rounded-full border border-white/[0.12] px-5 text-[13px] text-zinc-300 hover:border-white/30 hover:text-white">Show everything</button>
        </div>
      ) : (
        <div className={`mt-4 grid gap-5 ${type === "poster" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
          {items.map((card) => (
            <Card key={card.id} card={card} busy={busyId === card.id} onPreview={() => setPreview(card)} onUse={() => useTemplate(card)} onFavorite={() => toggleFavorite(card)} />
          ))}
        </div>
      )}

      <div ref={sentinel} className="h-10" />
      {loadingMore && <div className="py-4 text-center text-[12.5px] text-zinc-500">Loading more…</div>}
      {!loading && !cursor && items.length > PAGE_SIZE && <div className="py-4 text-center text-[12.5px] text-zinc-600">That's everything for this search.</div>}
      </div>

      {preview && (
        <PreviewModal card={preview} busy={busyId === preview.id} onClose={() => setPreview(null)} onUse={() => useTemplate(preview)} onFavorite={() => toggleFavorite(preview)} onOpen={setPreview} />
      )}
    </>
  );
}
