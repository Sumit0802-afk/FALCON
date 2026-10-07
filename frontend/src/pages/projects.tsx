import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Copy, FileImage, Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { isAuthenticated } from "@/services/authService";
import { projectService, ProjectSummary } from "@/services/projectService";
import {
  UserEmailTemplateSummary, deleteUserEmailTemplate, duplicateUserEmailTemplate, listUserEmailTemplates,
} from "@/services/emailTemplateService";
import { LayoutSelectorModal } from "@/components/Editor/LayoutSelectorModal";
import TemplateThumb from "@/components/EmailDesigner/TemplateThumb";
import { UserMenu, useCurrentUser } from "@/components/UserMenu";
import { PageSize } from "@/types";

type Kind = "poster" | "post" | "story" | "presentation" | "certificate" | "design" | "email";

const KIND_LABEL: Record<Kind, string> = {
  poster: "Poster",
  post: "Social post",
  story: "Story",
  presentation: "Presentation",
  certificate: "Certificate",
  design: "Design",
  email: "Email",
};

const FILTERS: { id: Kind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "poster", label: "Posters" },
  { id: "post", label: "Social posts" },
  { id: "story", label: "Stories" },
  { id: "presentation", label: "Presentations" },
  { id: "certificate", label: "Certificates" },
  { id: "email", label: "Emails" },
  { id: "design", label: "Other" },
];

/** One card on the page, whichever editor the work belongs to */
interface Item {
  key: string;
  id: string;
  /** "draft" is an email still only in this browser, not yet saved to the account */
  source: "design" | "email" | "draft";
  kind: Kind;
  title: string;
  detail: string;
  updatedAt: string;
  href: string;
  thumbnailUrl?: string | null;
  thumbnailSvg?: string | null;
  width?: number | null;
  height?: number | null;
  background?: string | null;
}

/** Names the kind of design from the shape of its first page */
function kindOf(width?: number | null, height?: number | null, pages = 1): Kind {
  if (!width || !height) return "design";
  const ratio = width / height;
  // Several landscape pages are a deck, whether widescreen or 4:3
  if (pages > 1 && ratio >= 1.2) return "presentation";
  // A single page at paper proportions (A4 or US Letter on its side) is a certificate
  if (pages === 1 && ratio > 1.25 && ratio < 1.45) return "certificate";
  if (Math.abs(ratio - 1) < 0.04) return "post";
  if (ratio <= 0.62) return "story";
  if (ratio >= 1.5) return "presentation";
  if (ratio < 1) return "poster";
  return "design";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function fromProject(project: ProjectSummary): Item {
  const size = project.width && project.height ? `${project.width} × ${project.height}` : "";
  const pages = `${project.pageCount} page${project.pageCount === 1 ? "" : "s"}`;
  return {
    key: `design-${project.id}`,
    id: project.id,
    source: "design",
    kind: kindOf(project.width, project.height, project.pageCount),
    title: project.title,
    detail: [size, pages].filter(Boolean).join(" · "),
    updatedAt: project.updatedAt,
    href: `/editor/${project.id}`,
    thumbnailUrl: project.thumbnailUrl,
    width: project.width,
    height: project.height,
    background: project.background,
  };
}

function fromEmail(email: UserEmailTemplateSummary): Item {
  return {
    key: `email-${email.id}`,
    id: email.id,
    source: "email",
    kind: "email",
    title: email.name,
    detail: `${email.width}px wide`,
    updatedAt: email.updatedAt,
    href: `/email-designer?design=${encodeURIComponent(email.id)}`,
    thumbnailSvg: email.thumbnailSvg,
  };
}

const EMAIL_DRAFT_KEY = "falcon_email_design";

/** The email being worked on in this browser that has not been saved to the account yet */
function readEmailDraft(): Item | null {
  try {
    const raw = localStorage.getItem(EMAIL_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as { name?: string; savedAt?: string; document?: { blocks?: unknown[] }; blocks?: unknown[] };
    const rows = draft.document?.blocks ?? draft.blocks;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return {
      key: "email-draft",
      id: "draft",
      source: "draft",
      kind: "email",
      title: draft.name || "Untitled Email",
      detail: "Draft on this device, not saved yet",
      updatedAt: draft.savedAt || new Date().toISOString(),
      href: "/email-designer",
    };
  } catch {
    return null;
  }
}

/** Every saved email, following the list's pages to the end */
async function loadAllEmails(): Promise<UserEmailTemplateSummary[]> {
  const all: UserEmailTemplateSummary[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const result = await listUserEmailTemplates({ cursor, limit: 60 });
    all.push(...result.items);
    cursor = result.nextCursor;
    if (!cursor) break;
  }
  return all;
}

/** A small picture of the work: its saved preview, or a blank page in its own shape and colour */
function Preview({ item }: { item: Item }) {
  if (item.source !== "design") {
    return item.thumbnailSvg
      ? <div className="h-full w-full overflow-hidden bg-white"><TemplateThumb svg={item.thumbnailSvg} title={item.title} /></div>
      : <Mail size={28} className="text-zinc-700" />;
  }
  if (item.thumbnailUrl) return <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />;
  if (item.width && item.height) {
    const plain = item.background && /^(#|rgb|hsl|[a-z]+$)/i.test(item.background.trim()) ? item.background : "#ffffff";
    return (
      <div
        data-theme-keep=""
        className="rounded-[3px] shadow-[0_6px_24px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
        style={{ aspectRatio: `${item.width} / ${item.height}`, height: item.width >= item.height ? undefined : "78%", width: item.width >= item.height ? "70%" : undefined, background: plain }}
      />
    );
  }
  return <FileImage size={28} className="text-zinc-700" />;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { signedIn, user, signOut } = useCurrentUser();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    // Each list loads on its own, so one failing does not hide the other
    const [designs, emails] = await Promise.allSettled([projectService.list(), loadAllEmails()]);
    const next: Item[] = [
      ...(designs.status === "fulfilled" ? designs.value.map(fromProject) : []),
      ...(emails.status === "fulfilled" ? emails.value.map(fromEmail) : []),
    ];
    const draft = readEmailDraft();
    if (draft) next.push(draft);
    next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setItems(next);
    setError(emails.status === "rejected" ? "We couldn't load your saved emails. Your other projects are shown below." : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=${encodeURIComponent("/projects")}`);
      return;
    }
    load();
  }, [load, router]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const item of items) map[item.kind] = (map[item.kind] || 0) + 1;
    return map;
  }, [items]);

  const visible = filter === "all" ? items : items.filter((item) => item.kind === filter);

  const createProject = async (size: PageSize) => {
    setLayoutModalOpen(false);
    setError("");
    try {
      const project = await projectService.create("Untitled design", user?.id || "", size);
      router.push(`/editor/${project.id}`);
    } catch {
      setError("We couldn't create a new project. Please try again.");
    }
  };

  const duplicate = async (item: Item) => {
    setBusyKey(item.key);
    setError("");
    try {
      if (item.source === "email") await duplicateUserEmailTemplate(item.id);
      else if (!(await projectService.duplicate(item.id))) throw new Error("not copied");
      await load();
    } catch {
      setError(`We couldn't duplicate "${item.title}". Please try again.`);
    } finally {
      setBusyKey(null);
    }
  };

  const remove = async (item: Item) => {
    setBusyKey(item.key);
    setConfirmKey(null);
    setError("");
    try {
      if (item.source === "email") await deleteUserEmailTemplate(item.id);
      else if (item.source === "draft") localStorage.removeItem(EMAIL_DRAFT_KEY);
      else await projectService.remove(item.id);
      setItems((list) => list.filter((entry) => entry.key !== item.key));
    } catch {
      setError(`We couldn't delete "${item.title}". Please try again.`);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <>
      <Head>
        <title>My Projects · Falcon</title>
      </Head>

      <div className="min-h-screen bg-[#060a0e] text-white">
        <header className="fixed left-4 right-4 top-4 z-[100] rounded-2xl border border-white/[0.08] bg-black/85 backdrop-blur-xl md:left-6 md:right-6 lg:left-8 lg:right-8 xl:left-[5%] xl:right-[5%]">
          <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-5 lg:px-7">
            <button type="button" onClick={() => router.push("/")} className="group flex shrink-0 cursor-pointer items-center gap-2.5">
              <img src="/falcon-logo-white.png" alt="Falcon Logo" className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
              <span className="text-[13px] font-semibold tracking-[0.2em] text-[#f4f1eb]">FALCON</span>
            </button>
            <div className="flex shrink-0 items-center gap-3">
              <button type="button" onClick={() => setLayoutModalOpen(true)} className="flex h-10 items-center gap-2 rounded-full bg-[#f4f1eb] px-5 text-[13px] font-medium text-black transition hover:bg-white">
                <Plus size={14} /> <span className="hidden sm:inline">New project</span>
              </button>
              {signedIn && <UserMenu user={user} onSignOut={async () => { await signOut(); router.push("/"); }} />}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-5 pb-24 pt-[124px] lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold tracking-tight text-[#f4f1eb] md:text-[38px]">My Projects</h1>
              <p className="mt-2 text-[14px] text-zinc-400">Everything you have made in Falcon: posters, posts, stories, presentations and emails.</p>
            </div>
            <button type="button" onClick={() => router.push("/email-designer")} className="flex h-9 items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] px-4 text-[12.5px] text-zinc-300 transition hover:border-white/25 hover:text-white">
              <Mail size={13} /> New email
            </button>
          </div>

          {/* Kind filter */}
          {!loading && items.length > 0 && (
            <div className="mt-7 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FILTERS.filter((f) => f.id === "all" || counts[f.id]).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] transition ${
                    filter === f.id ? "border-white/30 bg-white/[0.10] text-white" : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {f.label}
                  <span className="text-[11px] text-zinc-500">{counts[f.id] || 0}</span>
                </button>
              ))}
            </div>
          )}

          {error && <div role="alert" className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[13px] text-red-300">{error}</div>}

          {loading ? (
            <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[260px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-white/[0.12] px-6 py-16 text-center">
              <FileImage size={28} className="mx-auto text-zinc-600" />
              <div className="mt-4 text-[15px] text-white">No projects yet</div>
              <p className="mt-1.5 text-[13px] text-zinc-500">Start a new design or email, or pick a template to begin from.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => setLayoutModalOpen(true)} className="flex h-10 items-center gap-2 rounded-full bg-[#f4f1eb] px-5 text-[13px] font-medium text-black transition hover:bg-white">
                  <Plus size={14} /> New project
                </button>
                <button type="button" onClick={() => router.push("/email-designer")} className="flex h-10 items-center gap-2 rounded-full border border-white/[0.12] px-5 text-[13px] text-zinc-300 transition hover:border-white/30 hover:text-white">
                  <Mail size={14} /> New email
                </button>
                <button type="button" onClick={() => router.push("/templates")} className="h-10 rounded-full border border-white/[0.12] px-5 text-[13px] text-zinc-300 transition hover:border-white/30 hover:text-white">
                  Browse templates
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => (
                <div key={item.key} className={`group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f14] transition hover:border-white/20 ${busyKey === item.key ? "pointer-events-none opacity-50" : ""}`}>
                  <button type="button" onClick={() => router.push(item.href)} className="relative flex h-[170px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#101823] to-[#0a0e13]" aria-label={`Open ${item.title}`}>
                    <Preview item={item} />
                    <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-black/65 px-2.5 py-0.5 text-[10.5px] font-medium text-zinc-200 backdrop-blur">
                      {KIND_LABEL[item.kind]}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[12.5px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                      <Pencil size={13} className="mr-2" /> Open
                    </span>
                  </button>
                  <div className="p-3.5">
                    <div className="truncate text-[13.5px] font-medium text-white" title={item.title}>{item.title}</div>
                    <div className="mt-1 truncate text-[11.5px] text-zinc-500">
                      {[item.detail, `Edited ${formatDate(item.updatedAt)}`].filter(Boolean).join(" · ")}
                    </div>
                    {confirmKey === item.key ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                        <span className="text-zinc-400">Delete this {item.source === "design" ? "project" : "email"}?</span>
                        <button type="button" onClick={() => remove(item)} className="rounded-md bg-red-500/15 px-2.5 py-1 text-red-300 hover:bg-red-500/25">Delete</button>
                        <button type="button" onClick={() => setConfirmKey(null)} className="rounded-md px-2 py-1 text-zinc-400 hover:text-white">Cancel</button>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center gap-1.5">
                        {item.source !== "draft" && (
                          <button type="button" onClick={() => duplicate(item)} className="flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 py-1 text-[11.5px] text-zinc-400 transition hover:border-white/20 hover:text-white">
                            <Copy size={12} /> Duplicate
                          </button>
                        )}
                        <button type="button" onClick={() => setConfirmKey(item.key)} className="flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 py-1 text-[11.5px] text-zinc-400 transition hover:border-red-500/30 hover:text-red-300">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {layoutModalOpen && (
        <LayoutSelectorModal
          title="Choose your poster layout"
          onSelect={createProject}
          onClose={() => setLayoutModalOpen(false)}
        />
      )}
    </>
  );
}
