import React, { useEffect, useRef, useState } from "react";
import {
  EmailTemplateCard, apiAssetUrl, listEmailTemplates,
} from "@/services/emailTemplateService";
import TemplateThumb from "./TemplateThumb";

interface TemplateSidebarProps {
  /** Opens a copy of the template in the editor */
  onUseTemplate: (template: EmailTemplateCard) => void;
  onStartBlank: () => void;
  onOpenLibrary: () => void;
  /** Id of the template currently being opened, to show progress on its card */
  busyId?: string | null;
}

const PAGE_SIZE = 12;

export default function TemplateSidebar({ onUseTemplate, onStartBlank, onOpenLibrary, busyId }: TemplateSidebarProps) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<EmailTemplateCard[]>([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  // Debounced so typing does not fire a request per keystroke
  useEffect(() => {
    const request = ++requestRef.current;
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      const q = search.trim();
      listEmailTemplates(q ? { q, limit: PAGE_SIZE } : { sort: "featured", limit: PAGE_SIZE })
        .then((page) => {
          if (request !== requestRef.current) return;
          setItems(page.items);
          setTotal(page.total);
          setCursor(page.nextCursor);
        })
        .catch(() => {
          if (request === requestRef.current) setError("Templates are unavailable right now.");
        })
        .finally(() => {
          if (request === requestRef.current) setLoading(false);
        });
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const loadMore = () => {
    if (!cursor || loading) return;
    const request = requestRef.current;
    const q = search.trim();
    setLoading(true);
    listEmailTemplates(q ? { q, limit: PAGE_SIZE, cursor } : { sort: "featured", limit: PAGE_SIZE, cursor })
      .then((page) => {
        if (request !== requestRef.current) return;
        setItems((prev) => [...prev, ...page.items]);
        setCursor(page.nextCursor);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-[12px] font-semibold text-zinc-300">Email Templates</h3>
        <p className="text-[10px] text-zinc-600">Opens an editable copy in the editor</p>
      </div>

      <div className="shrink-0 space-y-2 px-3 pt-3">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-600 outline-none focus:border-[#00D084]/40 focus:bg-white/[0.06]"
        />
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onStartBlank}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Blank email
          </button>
          <button
            type="button"
            onClick={onOpenLibrary}
            className="rounded-lg border border-[#00D084]/40 bg-[#00D084]/10 px-2 py-1.5 text-[11px] font-medium text-[#00D084] transition-colors hover:bg-[#00D084]/20"
          >
            Full library →
          </button>
        </div>
        <div className="px-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
          {search.trim() ? "Results" : "Featured"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {error && <div className="py-6 text-center text-[11px] text-zinc-500">{error}</div>}
        {!error && !loading && items.length === 0 && (
          <div className="py-6 text-center text-[11px] text-zinc-600">No templates match "{search}"</div>
        )}

        <div className="space-y-2">
          {items.map((template) => (
            <button
              key={template.id}
              type="button"
              disabled={busyId === template.id}
              onClick={() => onUseTemplate(template)}
              className="group w-full rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-left transition-all hover:border-[#00D084]/30 hover:bg-[#00D084]/[0.05] disabled:opacity-60"
            >
              <div className="relative mb-2 h-28 w-full overflow-hidden rounded bg-white">
                <TemplateThumb src={apiAssetUrl(template.thumbnailUrl)} title={template.title} />
                {busyId === template.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] font-medium text-white">Opening…</div>
                )}
              </div>
              <div className="truncate text-[12px] font-medium text-zinc-200 group-hover:text-white">{template.title.split(":")[0]}</div>
              <div className="truncate text-[10px] text-zinc-600 group-hover:text-zinc-500">
                {template.category.name} · {template.subcategory.name}
              </div>
            </button>
          ))}
        </div>

        {loading && <div className="py-4 text-center text-[11px] text-zinc-600">Loading templates…</div>}
        {!loading && cursor && (
          <button
            type="button"
            onClick={loadMore}
            className="mt-3 w-full rounded-lg border border-white/[0.08] py-1.5 text-[11px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
