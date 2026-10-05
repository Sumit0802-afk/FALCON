import React, { useState, useCallback, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { EmailBlock, EmailDesign, PreviewMode, BlockType, SidebarTab, EmailSettings } from "@/types/email";
import { createBlock, newEmailDesign, exportEmailHtml } from "@/utils/emailUtils";
import EditorToolbar from "@/components/EmailDesigner/EditorToolbar";
import BlockSidebar from "@/components/EmailDesigner/BlockSidebar";
import TemplateSidebar from "@/components/EmailDesigner/TemplateSidebar";
import EmailCanvas from "@/components/EmailDesigner/EmailCanvas";
import PropertiesPanel from "@/components/EmailDesigner/PropertiesPanel";
import PreviewModal from "@/components/EmailDesigner/PreviewModal";
import ExportModal from "@/components/EmailDesigner/ExportModal";
import DesignByHtmlModal from "@/components/EmailDesigner/DesignByHtmlModal";
import HtmlCodePanel from "@/components/EmailDesigner/HtmlCodePanel";
import SendEmailModal from "@/components/EmailDesigner/SendEmailModal";

const STORAGE_KEY = "falcon_email_design";
const MAX_HISTORY = 50;

// ─── Hook: History Management ─────────────────────────────────────────────────

function useHistory(initial: EmailBlock[]) {
  const [past, setPast] = useState<EmailBlock[][]>([]);
  const [present, setPresent] = useState<EmailBlock[]>(initial);
  const [future, setFuture] = useState<EmailBlock[][]>([]);

  const push = useCallback((next: EmailBlock[]) => {
    setPast((p) => [...p.slice(-MAX_HISTORY), present]);
    setPresent(next);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [present, ...f]);
    setPresent(prev);
  }, [past, present]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, present]);
    setPresent(next);
  }, [future, present]);

  const reset = useCallback((blocks: EmailBlock[]) => {
    setPast([]);
    setFuture([]);
    setPresent(blocks);
  }, []);

  return { blocks: present, push, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 };
}

// ─── Sidebar Tabs ─────────────────────────────────────────────────────────────

const SIDEBAR_TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "blocks",
    label: "Blocks",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: "templates",
    label: "Templates",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
      </svg>
    ),
  },
];

// ─── Main Email Designer Page ─────────────────────────────────────────────────

export default function EmailDesignerPage() {
  const router = useRouter();
  const [design, setDesign] = useState<EmailDesign>(newEmailDesign);
  const { blocks, push, undo, redo, reset, canUndo, canRedo } = useHistory(design.blocks);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("blocks");
  const [draggingBlockType, setDraggingBlockType] = useState<BlockType | null>(null);

  // Workflow modes & modals
  const [activeView, setActiveView] = useState<"visual" | "html">("visual");
  const [showDesignByHtmlModal, setShowDesignByHtmlModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ── Sync blocks to design ────────────────────────────────────────────────
  const currentDesign: EmailDesign = { ...design, blocks };
  const currentHtml = exportEmailHtml(currentDesign);

  // ── Load from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: EmailDesign = JSON.parse(raw);
        setDesign(saved);
        reset(saved.blocks);
      }
    } catch {
      // ignore
    }
  }, [reset]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isEditing = active && (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        (active as HTMLElement).contentEditable === "true"
      );
      if (isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
      if (e.key === "Escape") { setSelectedId(null); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const idx = blocks.findIndex(b => b.id === selectedId);
        if (idx !== -1) handleDeleteBlock(idx);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedId, blocks]);

  // ── Block operations ─────────────────────────────────────────────────────

  const handleUpdateBlock = useCallback((updated: EmailBlock) => {
    const next = blocks.map((b) => (b.id === updated.id ? updated : b));
    push(next);
  }, [blocks, push]);

  const handleDropNewBlock = useCallback((type: BlockType, atIndex: number) => {
    const nb = createBlock(type);
    const next = [...blocks];
    next.splice(atIndex, 0, nb);
    push(next);
    setSelectedId(nb.id);
  }, [blocks, push]);

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    push(next);
  }, [blocks, push]);

  const handleDuplicateBlock = useCallback((index: number) => {
    const src = blocks[index];
    const dup: EmailBlock = { ...src, id: `${src.id}_dup_${Date.now()}` };
    const next = [...blocks];
    next.splice(index + 1, 0, dup);
    push(next);
    setSelectedId(dup.id);
  }, [blocks, push]);

  const handleDeleteBlock = useCallback((index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    push(next);
    setSelectedId(null);
  }, [blocks, push]);

  const handleLoadTemplate = useCallback((templateBlocks: EmailBlock[]) => {
    reset(templateBlocks);
    setSelectedId(null);
    setSidebarTab("blocks");
    setActiveView("visual");
  }, [reset]);

  // ── HTML Import & Two-Way Sync ───────────────────────────────────────────
  const handleHtmlImport = useCallback((importedBlocks: EmailBlock[], importedSettings?: Partial<EmailSettings>) => {
    reset(importedBlocks);
    if (importedSettings) {
      setDesign((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...importedSettings,
        },
      }));
    }
    setSelectedId(null);
    setActiveView("visual");
  }, [reset]);

  const handleSave = useCallback(() => {
    const toSave: EmailDesign = { ...design, blocks, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      alert("Failed to save: " + e);
    }
  }, [design, blocks]);

  // ── Selected block ────────────────────────────────────────────────────────
  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <>
      <Head>
        <title>Email Designer — Falcon</title>
        <meta name="description" content="Falcon Email Designer: drag and drop email builder with live preview, HTML import/export, and direct sending." />
        <meta name="robots" content="noindex" />
      </Head>

      {/* Full-screen layout */}
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#050505] text-white" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", Arial, sans-serif' }}>
        {/* Unified Top Toolbar */}
        <EditorToolbar
          emailName={design.name}
          previewMode={previewMode}
          activeView={activeView}
          canUndo={canUndo}
          canRedo={canRedo}
          isSaved={isSaved}
          onNameChange={(name) => setDesign((d) => ({ ...d, name }))}
          onUndo={undo}
          onRedo={redo}
          onPreviewModeChange={setPreviewMode}
          onActiveViewChange={setActiveView}
          onDesignByHtml={() => setShowDesignByHtmlModal(true)}
          onPreview={() => setShowPreview(true)}
          onSave={handleSave}
          onExportHtml={() => setShowExport(true)}
          onSendEmail={() => setShowSendModal(true)}
          onBack={() => router.push("/")}
        />

        {/* ─── WORKSPACE (Switch between Visual Canvas and HTML Code Editor) ─── */}
        {activeView === "html" ? (
          <HtmlCodePanel
            initialHtml={currentHtml}
            onApplyHtmlToCanvas={handleHtmlImport}
            onExportHtml={() => setShowExport(true)}
            onSwitchToVisual={() => setActiveView("visual")}
          />
        ) : (
          /* Three-panel visual workspace */
          <div className="flex flex-1 overflow-hidden">
            {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
            <div className="flex w-[230px] shrink-0 flex-col border-r border-white/[0.06] bg-[#070707]">
              {/* Tabs */}
              <div className="flex shrink-0 border-b border-white/[0.06]">
                {SIDEBAR_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSidebarTab(tab.id)}
                    title={tab.label}
                    className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                      sidebarTab === tab.id
                        ? "border-b-2 border-[#00D084] text-[#00D084]"
                        : "text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-hidden">
                {sidebarTab === "blocks" && (
                  <BlockSidebar
                    onBlockAdd={(block, idx) => {
                      const at = idx ?? blocks.length;
                      const next = [...blocks];
                      next.splice(at, 0, block);
                      push(next);
                      setSelectedId(block.id);
                    }}
                    onDragBlockType={setDraggingBlockType}
                    onDesignByHtml={() => setShowDesignByHtmlModal(true)}
                  />
                )}
                {sidebarTab === "templates" && (
                  <TemplateSidebar onLoadTemplate={handleLoadTemplate} />
                )}
                {sidebarTab === "settings" && (
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-600">Email Settings</div>
                    <PropertiesPanel
                      block={null}
                      emailSettings={design.settings}
                      onBlockChange={handleUpdateBlock}
                      onSettingsChange={(s) => setDesign((d) => ({ ...d, settings: s }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── CENTER CANVAS ─────────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Block count & preview status bar */}
              <div className="flex h-7 shrink-0 items-center justify-between border-b border-white/[0.04] bg-black/30 px-4">
                <span className="text-[10px] text-zinc-600">
                  {blocks.length} block{blocks.length !== 1 ? "s" : ""}
                  {selectedId && selectedBlock ? ` · Selected: ${selectedBlock.type}` : ""}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {previewMode === "mobile" ? "375px mobile" : `${design.settings.emailWidth}px desktop`}
                </span>
              </div>

              <EmailCanvas
                blocks={blocks}
                selectedId={selectedId}
                previewMode={previewMode}
                emailWidth={design.settings.emailWidth}
                contentBackground={design.settings.contentBackground}
                outerBackground={design.settings.backgroundColor}
                draggingBlockType={draggingBlockType}
                onSelectBlock={setSelectedId}
                onUpdateBlock={handleUpdateBlock}
                onMoveBlock={handleMoveBlock}
                onDuplicateBlock={handleDuplicateBlock}
                onDeleteBlock={handleDeleteBlock}
                onDropNewBlock={handleDropNewBlock}
              />
            </div>

            {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
            <div className="flex w-[240px] shrink-0 flex-col border-l border-white/[0.06] bg-[#070707]">
              <PropertiesPanel
                block={selectedBlock}
                emailSettings={design.settings}
                onBlockChange={handleUpdateBlock}
                onSettingsChange={(s) => setDesign((d) => ({ ...d, settings: s }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      {showPreview && (
        <PreviewModal
          design={currentDesign}
          initialMode={previewMode}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showExport && (
        <ExportModal
          design={currentDesign}
          onClose={() => setShowExport(false)}
        />
      )}

      {showDesignByHtmlModal && (
        <DesignByHtmlModal
          currentHtml={currentHtml}
          onImport={handleHtmlImport}
          onClose={() => setShowDesignByHtmlModal(false)}
        />
      )}

      {showSendModal && (
        <SendEmailModal
          design={currentDesign}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </>
  );
}
