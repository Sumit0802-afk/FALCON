import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowRight, Copy, Heart, Menu, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { UserMenu, useCurrentUser } from "@/components/UserMenu";
import {
  EmailTemplateCard, EmailTemplateCategory, EmailTemplateDetail, EmailTemplateQuery, UserEmailTemplateSummary,
  apiAssetUrl, cloneEmailTemplate, createUserEmailTemplate, deleteUserEmailTemplate, duplicateUserEmailTemplate,
  getEmailTemplate, listEmailTemplateCategories, listEmailTemplates, listRecentEmailTemplates,
  listUserEmailTemplates, setEmailTemplateFavorite, updateUserEmailTemplate,
} from "@/services/emailTemplateService";
import TemplateThumb from "@/components/EmailDesigner/TemplateThumb";

const NAV_LINKS = ["Product", "AI Studio", "Templates", "Email Templates"];
const PAGE_SIZE = 24;

type View = "all" | "featured" | "trending" | "popular" | "new" | "premium" | "free" | "favorites" | "recent" | "mine";

const VIEWS: { id: View; label: string; auth?: boolean }[] = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
  { id: "premium", label: "Premium" },
  { id: "free", label: "Free" },
  { id: "favorites", label: "Favorites", auth: true },
  { id: "recent", label: "Recently used", auth: true },
  { id: "mine", label: "My Templates", auth: true },
];

function viewQuery(view: View): EmailTemplateQuery {
  switch (view) {
    case "featured": return { sort: "featured" };
    case "trending": return { sort: "trending" };
    case "popular": return { sort: "popular" };
    case "new": return { sort: "newest" };
    case "premium": return { premium: true };
    case "free": return { premium: false };
    case "favorites": return { favorites: true };
    default: return {};
  }
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function TemplateCard({ template, busy, onPreview, onUse, onFavorite }: {
  template: EmailTemplateCard;
  busy: boolean;
  onPreview: () => void;
  onUse: () => void;
  onFavorite: () => void;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f14] shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl">
      <button type="button" onClick={onPreview} className="relative block aspect-[4/5] w-full overflow-hidden bg-white" aria-label={`Preview ${template.title}`}>
        <TemplateThumb src={apiAssetUrl(template.thumbnailUrl)} title={template.title} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
          <span className="rounded-full bg-white/95 px-4 py-2 text-[12px] font-medium text-black">Preview</span>
        </div>
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {template.isFeatured && <span className="rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-medium text-[#22D3EE]">Featured</span>}
          {template.isPremium && <span className="rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-medium text-[#f5c451]">Premium</span>}
        </div>
      </button>

      <button
        type="button"
        onClick={onFavorite}
        aria-label={template.isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black"
      >
        <Heart size={14} fill={template.isFavorite ? "#ff5a79" : "none"} color={template.isFavorite ? "#ff5a79" : "currentColor"} />
      </button>

      <div className="flex flex-1 flex-col border-t border-white/[0.06] px-4 py-3">
        <div className="truncate text-[13px] font-medium text-[#f4f1eb]" title={template.title}>{template.title}</div>
        <div className="mt-0.5 truncate text-[11px] text-zinc-500">
          {template.category.name} · {template.subcategory.name} · {template.width}×{template.height}
        </div>
        <button
          type="button"
          onClick={onUse}
          disabled={busy}
          className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#f4f1eb] text-[12px] font-medium text-black transition hover:bg-white disabled:opacity-60"
        >
          {busy ? "Opening…" : <>Use Template <ArrowRight size={13} /></>}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0f14]">
      <div className="aspect-[4/5] w-full animate-pulse bg-white/[0.04]" />
      <div className="space-y-2 px-4 py-3">
        <div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-white/[0.04]" />
        <div className="h-9 animate-pulse rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ card, busy, onClose, onUse, onFavorite }: {
  card: EmailTemplateCard;
  busy: boolean;
  onClose: () => void;
  onUse: () => void;
  onFavorite: () => void;
}) {
  const [detail, setDetail] = useState<EmailTemplateDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getEmailTemplate(card.id).then((d) => { if (!cancelled) setDetail(d); }).catch(() => { if (!cancelled) setFailed(true); });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelled = true; window.removeEventListener("keydown", onKey); };
  }, [card.id, onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#060a0e] shadow-2xl md:flex-row" onClick={(e) => e.stopPropagation()}>
        <div className="flex min-h-[320px] flex-1 flex-col bg-[#0b0f14]">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
            {[false, true].map((m) => (
              <button key={String(m)} type="button" onClick={() => setMobile(m)} className={`rounded-full px-3 py-1 text-[11px] transition ${mobile === m ? "bg-white/[0.12] text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                {m ? "Mobile" : "Desktop"}
              </button>
            ))}
          </div>
          <div className="flex flex-1 justify-center overflow-auto p-4">
            {detail ? (
              // The real exported HTML. Scripts stay disabled; same-origin is only so its images can load
              <iframe title="Template preview" sandbox="allow-same-origin" srcDoc={detail.html} className="h-[68vh] rounded-lg bg-white" style={{ width: mobile ? 375 : 680, maxWidth: "100%", border: "none" }} />
            ) : (
              <div className="flex h-[40vh] items-center text-[13px] text-zinc-500">{failed ? "This preview could not be loaded." : "Loading preview…"}</div>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 border-t border-white/[0.06] p-6 md:w-[320px] md:border-l md:border-t-0">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-zinc-300 hover:text-white"><X size={16} /></button>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">{card.category.name} · {card.subcategory.name}</div>
            <h2 className="mt-2 text-[18px] font-semibold leading-snug text-[#f4f1eb]">{card.title}</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-400">{card.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
            <div className="rounded-lg border border-white/[0.06] p-2.5"><div className="text-zinc-600">Size</div><div className="text-zinc-300">{card.width} × {card.height}px</div></div>
            <div className="rounded-lg border border-white/[0.06] p-2.5"><div className="text-zinc-600">Used</div><div className="text-zinc-300">{card.usageCount.toLocaleString()} times</div></div>
            <div className="rounded-lg border border-white/[0.06] p-2.5"><div className="text-zinc-600">By</div><div className="text-zinc-300">{card.author}</div></div>
            <div className="rounded-lg border border-white/[0.06] p-2.5"><div className="text-zinc-600">Type</div><div className="text-zinc-300">{card.isPremium ? "Premium" : "Free"}</div></div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {card.tags.slice(0, 10).map((tag) => (
              <span key={tag} className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10.5px] text-zinc-400">{tag}</span>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button type="button" onClick={onUse} disabled={busy} className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#f4f1eb] text-[13px] font-medium text-black transition hover:bg-white disabled:opacity-60">
              {busy ? "Opening…" : <>Use this template <ArrowRight size={14} /></>}
            </button>
            <button type="button" onClick={onFavorite} className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.04] text-[12.5px] text-white transition hover:bg-white/[0.08]">
              <Heart size={13} fill={card.isFavorite ? "#ff5a79" : "none"} color={card.isFavorite ? "#ff5a79" : "currentColor"} />
              {card.isFavorite ? "Saved to favorites" : "Add to favorites"}
            </button>
            <p className="text-center text-[10.5px] text-zinc-600">Opens an editable copy. The original stays unchanged.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { signedIn, user, signOut } = useCurrentUser();

  const [view, setView] = useState<View>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [tags, setTags] = useState<{ slug: string; name: string; count: number }[]>([]);
  const [items, setItems] = useState<EmailTemplateCard[]>([]);
  const [mine, setMine] = useState<UserEmailTemplateSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<EmailTemplateCard | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const requestRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEmailTemplateCategories()
      .then((data) => { setCategories(data.categories); setTags(data.tags); })
      .catch(() => undefined);
  }, []);

  // The profile menu links here with ?view=mine
  useEffect(() => {
    if (router.isReady && router.query.view === "mine" && signedIn) setView("mine");
  }, [router.isReady, router.query.view, signedIn]);

  // Debounce typing so search runs once the user pauses
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeCategory = categories.find((c) => c.slug === category) || null;

  const query = useMemo<EmailTemplateQuery>(() => ({
    ...viewQuery(view),
    q: search || undefined,
    category: category || undefined,
    subcategory: subcategory || undefined,
    tag: tag || undefined,
    limit: PAGE_SIZE,
  }), [view, search, category, subcategory, tag]);

  const requireSignIn = useCallback(() => {
    router.push(`/login?redirect=${encodeURIComponent("/email-templates")}`);
  }, [router]);

  // First page: runs whenever a filter, the search or the view changes
  useEffect(() => {
    const request = ++requestRef.current;
    setLoading(true);
    setError("");
    setNote("");
    setItems([]);
    setCursor(null);

    const done = () => { if (request === requestRef.current) setLoading(false); };
    const fail = () => { if (request === requestRef.current) setError("We couldn't load templates. Please try again."); };

    if (view === "mine") {
      listUserEmailTemplates({ limit: PAGE_SIZE, q: search || undefined })
        .then((page) => { if (request === requestRef.current) { setMine(page.items); setCursor(page.nextCursor); setTotal(page.total); } })
        .catch(fail).finally(done);
    } else if (view === "recent") {
      listRecentEmailTemplates()
        .then((list) => { if (request === requestRef.current) { setItems(list); setTotal(list.length); } })
        .catch(fail).finally(done);
    } else {
      listEmailTemplates(query)
        .then((page) => {
          if (request !== requestRef.current) return;
          setItems(page.items);
          setCursor(page.nextCursor);
          setTotal(page.total);
          if (page.fallback) setNote("Nothing is trending yet, so here is a mix from the library.");
        })
        .catch(fail).finally(done);
    }
  }, [query, view, search]);

  const loadMore = useCallback(() => {
    if (!cursor || loading) return;
    const request = requestRef.current;
    setLoading(true);
    const next = view === "mine"
      ? listUserEmailTemplates({ limit: PAGE_SIZE, cursor, q: search || undefined }).then((page) => {
          if (request !== requestRef.current) return;
          setMine((prev) => [...prev, ...page.items]);
          setCursor(page.nextCursor);
        })
      : listEmailTemplates({ ...query, cursor }).then((page) => {
          if (request !== requestRef.current) return;
          setItems((prev) => [...prev, ...page.items]);
          setCursor(page.nextCursor);
        });
    next.catch(() => undefined).finally(() => { if (request === requestRef.current) setLoading(false); });
  }, [cursor, loading, view, query, search]);

  // Infinite scroll: fetch the next page when the sentinel nears the viewport
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) loadMore(); }, { rootMargin: "600px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const selectView = (next: View) => {
    const def = VIEWS.find((v) => v.id === next);
    if (def?.auth && !signedIn) return requireSignIn();
    setView(next);
  };

  const handleUse = async (template: EmailTemplateCard) => {
    setBusyId(template.id);
    try {
      if (signedIn) {
        const copy = await cloneEmailTemplate(template.id);
        await router.push(`/email-designer?design=${copy.designId}`);
      } else {
        // Without an account the copy lives in this browser
        await router.push(`/email-designer?template=${template.id}`);
      }
    } catch {
      setError("We couldn't open that template. Please try again.");
      setBusyId(null);
    }
  };

  const handleFavorite = async (template: EmailTemplateCard) => {
    if (!signedIn) return requireSignIn();
    const next = !template.isFavorite;
    const apply = (value: boolean) => {
      setItems((prev) => prev.map((t) => (t.id === template.id ? { ...t, isFavorite: value } : t)));
      setPreview((prev) => (prev && prev.id === template.id ? { ...prev, isFavorite: value } : prev));
    };
    apply(next);
    try {
      await setEmailTemplateFavorite(template.id, next);
      if (!next && view === "favorites") setItems((prev) => prev.filter((t) => t.id !== template.id));
    } catch {
      apply(!next);
    }
  };

  // ── My Templates actions ────────────────────────────────────────────────
  const createBlank = async () => {
    if (!signedIn) return router.push("/email-designer");
    try {
      const created = await createUserEmailTemplate({});
      router.push(`/email-designer?design=${created.id}`);
    } catch {
      setError("We couldn't create a new email. Please try again.");
    }
  };

  const renameMine = async (template: UserEmailTemplateSummary) => {
    const name = window.prompt("Rename template", template.name)?.trim();
    if (!name || name === template.name) return;
    try {
      const updated = await updateUserEmailTemplate(template.id, { name });
      setMine((prev) => prev.map((t) => (t.id === template.id ? { ...t, name: updated.name } : t)));
    } catch {
      setError("We couldn't rename that template.");
    }
  };

  const duplicateMine = async (template: UserEmailTemplateSummary) => {
    try {
      const copy = await duplicateUserEmailTemplate(template.id);
      setMine((prev) => [copy, ...prev]);
      setTotal((t) => t + 1);
    } catch {
      setError("We couldn't duplicate that template.");
    }
  };

  const deleteMine = async (template: UserEmailTemplateSummary) => {
    if (!window.confirm(`Delete "${template.name}"? This cannot be undone.`)) return;
    try {
      await deleteUserEmailTemplate(template.id);
      setMine((prev) => prev.filter((t) => t.id !== template.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      setError("We couldn't delete that template.");
    }
  };

  const clearFilters = () => { setCategory(null); setSubcategory(null); setTag(null); setSearchInput(""); };
  const hasFilters = !!(category || subcategory || tag || search);
  const navigate = (link: string) => {
    if (link === "AI Studio") router.push("/ai-studio");
    else if (link === "Templates") router.push("/templates");
    else if (link !== "Email Templates") router.push("/");
  };

  const isMine = view === "mine";
  const empty = !loading && !error && (isMine ? mine.length === 0 : items.length === 0);

  return (
    <>
      <Head>
        <title>Email Templates — Falcon</title>
        <meta name="description" content="Browse Falcon's library of editable email templates: newsletters, promotions, invitations, order emails and more." />
      </Head>

      <div className="relative min-h-screen bg-[#060a0e] text-white" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", Arial, sans-serif' }}>
        <div className="pointer-events-none fixed inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2" style={{ background: "radial-gradient(ellipse at center top, rgba(0,80,100,0.22) 0%, transparent 70%)", filter: "blur(30px)" }} />
        </div>

        {/* Floating navbar (homepage style) */}
        <header className="fixed left-4 right-4 top-4 z-[100] rounded-2xl border border-white/[0.08] bg-black/85 backdrop-blur-xl md:left-6 md:right-6 lg:left-8 lg:right-8 xl:left-[5%] xl:right-[5%]">
          <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between gap-3 px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-7">
            <button type="button" onClick={() => router.push("/")} className="group flex shrink-0 cursor-pointer items-center gap-2.5 justify-self-start">
              <img src="/falcon-logo-white.png" alt="Falcon Logo" className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
              <span className="text-[13px] font-semibold tracking-[0.2em] text-[#f4f1eb]">FALCON</span>
            </button>
            <nav className="hidden items-center justify-self-center gap-8 lg:flex">
              {NAV_LINKS.map((link) => (
                <button key={link} type="button" onClick={() => navigate(link)} className={`whitespace-nowrap text-[13px] transition-colors hover:text-white ${link === "Email Templates" ? "text-white" : "text-zinc-500"}`}>
                  {link}
                </button>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-3 justify-self-end">
              {signedIn ? (
                <UserMenu user={user} onSignOut={async () => { await signOut(); setView("all"); }} />
              ) : (
                <button type="button" onClick={requireSignIn} className="hidden text-[13px] text-zinc-400 transition-colors hover:text-white lg:block">Log in</button>
              )}
              <button type="button" onClick={createBlank} className="flex h-10 items-center gap-2 rounded-full bg-[#f4f1eb] px-5 text-[13px] font-medium text-black transition hover:bg-white">
                <Plus size={14} /> <span className="hidden sm:inline">New email</span>
              </button>
              <button type="button" onClick={() => setMenuOpen((v) => !v)} className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 lg:hidden" aria-label="Toggle menu">
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="border-t border-white/[0.07] bg-black/90 px-6 py-6 lg:hidden">
              <div className="flex flex-col gap-5">
                {NAV_LINKS.map((link) => (
                  <button key={link} type="button" onClick={() => { setMenuOpen(false); navigate(link); }} className="text-left text-sm text-zinc-400 hover:text-white">{link}</button>
                ))}
              </div>
            </div>
          )}
        </header>

        <main className="relative mx-auto w-full max-w-[1400px] px-5 pb-24 pt-[124px] lg:px-8">
          {/* Hero + search */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-400">
              <Sparkles size={12} className="text-[#22D3EE]" />
              Editable email templates
            </div>
            <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-tight text-[#f4f1eb] md:text-[44px]">Email templates, ready to edit</h1>
            <p className="mt-3 text-[14px] text-zinc-400">Pick a starting point, change anything, and export clean HTML or send a test in minutes.</p>
            <div className="relative mx-auto mt-6 max-w-xl">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isMine ? "Search my templates…" : "Search e.g. Diwali, newsletter, restaurant promotion"}
                className="h-12 w-full rounded-full border border-white/[0.12] bg-white/[0.04] pl-11 pr-10 text-[14px] text-white placeholder-zinc-600 outline-none backdrop-blur transition focus:border-white/30"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"><X size={16} /></button>
              )}
            </div>
          </div>

          {/* View tabs */}
          <div className="mt-8 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => selectView(v.id)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[12.5px] transition ${
                  view === v.id ? "border-white/30 bg-white/[0.10] text-white" : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row">
            {/* Category sidebar */}
            {!isMine && view !== "recent" && (
              <aside className="w-full shrink-0 lg:w-[230px]">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f14]/80 p-3 lg:sticky lg:top-[108px] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto lg:[scrollbar-width:thin] lg:[scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                  <div className="px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Categories</div>
                  <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:space-y-0.5">
                    <button type="button" onClick={() => { setCategory(null); setSubcategory(null); }} className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] transition lg:w-full ${!category ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"}`}>
                      <span>All categories</span>
                    </button>
                    {categories.map((c) => (
                      <div key={c.slug} className="shrink-0">
                        <button type="button" onClick={() => { setCategory(c.slug === category ? null : c.slug); setSubcategory(null); }} className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] transition ${category === c.slug ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"}`}>
                          <span className="whitespace-nowrap">{c.name}</span>
                        </button>
                        {category === c.slug && (
                          <div className="hidden lg:block lg:pb-1 lg:pl-2.5">
                            {c.children.map((child) => (
                              <button key={child.slug} type="button" onClick={() => setSubcategory(child.slug === subcategory ? null : child.slug)} className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1 text-left text-[11.5px] transition ${subcategory === child.slug ? "text-[#22D3EE]" : "text-zinc-500 hover:text-white"}`}>
                                <span>{child.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-4 hidden border-t border-white/[0.06] pt-3 lg:block">
                      <div className="px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Tags</div>
                      <div className="flex flex-wrap gap-1.5 px-1">
                        {tags.slice(0, 24).map((t) => (
                          <button key={t.slug} type="button" onClick={() => setTag(t.slug === tag ? null : t.slug)} className={`rounded-full border px-2 py-0.5 text-[10.5px] transition ${tag === t.slug ? "border-[#22D3EE]/60 text-[#22D3EE]" : "border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-white"}`}>
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            )}

            {/* Results */}
            <section className="min-w-0 flex-1">
              {/* Subcategories on small screens */}
              {activeCategory && !isMine && (
                <div className="mb-4 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
                  {activeCategory.children.map((child) => (
                    <button key={child.slug} type="button" onClick={() => setSubcategory(child.slug === subcategory ? null : child.slug)} className={`shrink-0 rounded-full border px-3 py-1 text-[11.5px] ${subcategory === child.slug ? "border-[#22D3EE]/60 text-[#22D3EE]" : "border-white/[0.08] text-zinc-400"}`}>
                      {child.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[12.5px] text-zinc-500">
                  {loading && !items.length && !mine.length
                    ? "Loading…"
                    : search ? `Results for “${search}”` : isMine ? "Your saved designs" : ""}
                </div>
                {hasFilters && !isMine && (
                  <button type="button" onClick={clearFilters} className="text-[12px] text-zinc-400 underline-offset-2 hover:text-white hover:underline">Clear filters</button>
                )}
              </div>

              {note && <div className="mb-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[12.5px] text-zinc-400">{note}</div>}
              {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[12.5px] text-red-300">{error}</div>}

              {isMine ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  <button type="button" onClick={createBlank} className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.02] text-zinc-400 transition hover:border-white/30 hover:text-white">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.15]"><Plus size={18} /></span>
                    <span className="text-[13px]">Create from scratch</span>
                  </button>
                  {mine.map((template) => (
                    <div key={template.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f14] shadow-lg transition-all hover:border-white/20">
                      <button type="button" onClick={() => router.push(`/email-designer?design=${template.id}`)} className="relative block aspect-[4/5] w-full overflow-hidden bg-white" aria-label={`Edit ${template.name}`}>
                        {template.thumbnailSvg && <TemplateThumb svg={template.thumbnailSvg} title={template.name} />}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
                          <span className="rounded-full bg-white/95 px-4 py-2 text-[12px] font-medium text-black">Edit</span>
                        </div>
                      </button>
                      <div className="border-t border-white/[0.06] px-4 py-3">
                        <div className="truncate text-[13px] font-medium text-[#f4f1eb]" title={template.name}>{template.name}</div>
                        <div className="mt-0.5 text-[11px] text-zinc-500">Edited {new Date(template.updatedAt).toLocaleDateString()}</div>
                        <div className="mt-2.5 flex items-center gap-1 text-zinc-400">
                          <button type="button" onClick={() => renameMine(template)} title="Rename" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/[0.08] hover:text-white"><Pencil size={13} /></button>
                          <button type="button" onClick={() => duplicateMine(template)} title="Duplicate" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/[0.08] hover:text-white"><Copy size={13} /></button>
                          <button type="button" onClick={() => deleteMine(template)} title="Delete" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-500/15 hover:text-red-300"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {items.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      busy={busyId === template.id}
                      onPreview={() => setPreview(template)}
                      onUse={() => handleUse(template)}
                      onFavorite={() => handleFavorite(template)}
                    />
                  ))}
                  {loading && Array.from({ length: items.length ? 4 : 8 }).map((_, i) => <SkeletonCard key={`s${i}`} />)}
                </div>
              )}

              {empty && !isMine && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
                  <div className="text-[15px] text-zinc-300">
                    {view === "favorites" ? "You haven't saved any favorites yet." : view === "recent" ? "Templates you use will appear here." : "No templates match your filters."}
                  </div>
                  {hasFilters && <button type="button" onClick={clearFilters} className="mt-3 text-[13px] text-[#22D3EE] hover:text-white">Clear filters</button>}
                </div>
              )}

              <div ref={sentinelRef} className="h-px" />
              {!loading && cursor && (
                <div className="mt-8 flex justify-center">
                  <button type="button" onClick={loadMore} className="rounded-full border border-white/[0.15] bg-white/[0.04] px-6 py-2.5 text-[13px] text-white transition hover:bg-white/[0.08]">Load more</button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {preview && (
        <PreviewModal
          card={preview}
          busy={busyId === preview.id}
          onClose={() => setPreview(null)}
          onUse={() => handleUse(preview)}
          onFavorite={() => handleFavorite(preview)}
        />
      )}
    </>
  );
}
