import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { LayoutTemplate, Plus, SlidersHorizontal } from "lucide-react";
import {
  EmailBlock, EmailDesign, EmailDocument, EmailSection, EmailSettings, LegacyEmailBlock, PaletteItem, PreviewMode,
  SaveStatus, Selection, SidebarTab,
} from "@/types/email";
import {
  SECTION_PRESETS, createBlock, designToDocument, exportEmailHtml, legacyBlocksToSections, newEmailDesign,
  readDesignData, wrapInSection,
} from "@/utils/emailUtils";
import {
  BlockTarget, addColumn, countAllBlocks, duplicateBlock, duplicateSection, findBlock, insertBlock, insertSections,
  moveBlock, moveSection, pruneEmptySections, removeBlock, removeColumn, removeSection, setColumnWidths, shiftBlock,
  updateBlock, updateColumn, updateSectionSettings,
} from "@/utils/emailOps";
import { createSection, isFullHtmlDocument } from "@/lib/emailCore/schema";
import { onHtmlPick } from "@/utils/htmlPick";
import { isAuthenticated } from "@/services/authService";
import { ApiError } from "@/services/api";
import {
  EmailTemplateCard, cloneEmailTemplate, createUserEmailTemplate, getEmailTemplate, getUserEmailTemplate,
  sendEmailDesignTest, updateUserEmailTemplate,
} from "@/services/emailTemplateService";
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
const DRAFT_PREFIX = "falcon_email_draft:";
const MAX_HISTORY = 50;
const LOCAL_SAVE_DELAY = 500;
const SERVER_SAVE_DELAY = 2000;

// ─── Hook: History Management ─────────────────────────────────────────────────

function useHistory(initial: EmailSection[]) {
  const [past, setPast] = useState<EmailSection[][]>([]);
  const [present, setPresent] = useState<EmailSection[]>(initial);
  const [future, setFuture] = useState<EmailSection[][]>([]);

  const push = useCallback((next: EmailSection[]) => {
    if (next === present) return;
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

  const reset = useCallback((sections: EmailSection[]) => {
    setPast([]);
    setFuture([]);
    setPresent(sections);
  }, []);

  return { sections: present, push, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 };
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

interface StoredDraft {
  name: string;
  document: EmailDocument;
  savedAt: string;
}

function readDraft(key: string): StoredDraft | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Please sign in to continue.";
    if (err.code === "EMAIL_DELIVERY_FAILED") return "We couldn't send the test email. Please try again in a moment.";
    if (err.status === 429) return "Too many requests. Please wait a few minutes and try again.";
    if (err.status === 404) return "That design could not be found.";
    if (err.status === 400) return err.message;
  }
  return fallback;
}

// ─── Main Email Designer Page ─────────────────────────────────────────────────

export default function EmailDesignerPage() {
  const router = useRouter();
  const [design, setDesign] = useState<EmailDesign>(newEmailDesign);
  const { sections, push, undo, redo, reset, canUndo, canRedo } = useHistory(design.sections);

  const [selection, setSelection] = useState<Selection>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("blocks");
  // Below the lg breakpoint only one of the three panels fits, chosen from the bottom bar
  const [panel, setPanel] = useState<"left" | "canvas" | "right">("canvas");
  const [paletteDrag, setPaletteDrag] = useState<PaletteItem | null>(null);

  // Workflow modes & modals
  const [activeView, setActiveView] = useState<"visual" | "html">("visual");
  const [showDesignByHtmlModal, setShowDesignByHtmlModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Persistence
  const [serverId, setServerId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [openingTemplate, setOpeningTemplate] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "info" | "error" } | null>(null);
  // Set while loading a design so that the load itself is not treated as an edit
  const skipNextSave = useRef(true);
  const serverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRun = useRef(0);

  const flash = useCallback((text: string, tone: "info" | "error" = "info") => {
    setNotice({ text, tone });
    window.setTimeout(() => setNotice((current) => (current?.text === text ? null : current)), 4500);
  }, []);

  // ── Sync sections to design ──────────────────────────────────────────────
  const currentDesign: EmailDesign = useMemo(() => ({ ...design, sections }), [design, sections]);
  const currentDocument = useMemo(() => designToDocument(currentDesign), [currentDesign]);
  const currentHtml = useMemo(() => exportEmailHtml(currentDesign), [currentDesign]);
  const draftKey = serverId ? `${DRAFT_PREFIX}${serverId}` : STORAGE_KEY;

  const loadDesign = useCallback((data: { sections: EmailSection[]; settings: EmailSettings }, name: string, id: string | null) => {
    skipNextSave.current = true;
    setDesign((prev) => ({ ...prev, name, settings: data.settings, sections: data.sections, updatedAt: new Date().toISOString() }));
    reset(data.sections);
    setServerId(id);
    setSelection(null);
    setActiveView("visual");
    setSaveStatus(id ? "saved" : "idle");
  }, [reset]);

  // ── Load: a saved design, a library template, or the last local draft ────
  useEffect(() => {
    if (!router.isReady || loaded) return;
    const authed = isAuthenticated();
    setSignedIn(authed);
    const designId = typeof router.query.design === "string" ? router.query.design : null;
    const templateId = typeof router.query.template === "string" ? router.query.template : null;
    let cancelled = false;

    const loadLocal = () => {
      const stored = readDraft(STORAGE_KEY);
      try {
        if (stored?.document) {
          loadDesign(readDesignData(stored.document), stored.name || "Untitled Email", null);
        } else {
          // Designs saved before sections existed are a bare { name, blocks, settings } object
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const legacy = JSON.parse(raw);
            loadDesign(readDesignData(legacy), legacy.name || "Untitled Email", null);
          }
        }
      } catch {
        // An unreadable draft is ignored; the editor opens with a blank email
      }
    };

    (async () => {
      try {
        if (designId && authed) {
          const saved = await getUserEmailTemplate(designId);
          if (cancelled) return;
          // If the browser closed before the last edit reached the server, the local draft is newer
          const draft = readDraft(`${DRAFT_PREFIX}${designId}`);
          if (draft && new Date(draft.savedAt).getTime() > new Date(saved.updatedAt).getTime() + 1000) {
            loadDesign(readDesignData(draft.document), draft.name || saved.name, designId);
            skipNextSave.current = false;
            setSaveStatus("unsaved");
            flash("Recovered unsaved changes from your last session.");
          } else {
            loadDesign(readDesignData(saved.templateData), saved.name, designId);
          }
        } else if (templateId) {
          const template = await getEmailTemplate(templateId);
          if (cancelled) return;
          loadDesign(readDesignData(template.templateData), template.title.split(":")[0], null);
          skipNextSave.current = false;
        } else {
          if (designId && !authed) flash("Sign in to open your saved designs.", "error");
          loadLocal();
        }
      } catch (err) {
        if (cancelled) return;
        flash(friendlyError(err, "We couldn't open that design."), "error");
        loadLocal();
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => { cancelled = true; };
  }, [router.isReady, router.query.design, router.query.template, loaded, loadDesign, flash]);

  // ── Autosave: local draft quickly, server copy on a longer debounce ──────
  const saveToServer = useCallback(async (id: string, name: string, document: EmailDocument) => {
    const run = ++saveRun.current;
    setSaveStatus("saving");
    try {
      await updateUserEmailTemplate(id, { name, templateData: document });
      // A newer edit may have started while this request was in flight
      if (run === saveRun.current) setSaveStatus("saved");
    } catch {
      if (run === saveRun.current) setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setSaveStatus("unsaved");

    const localTimer = setTimeout(() => {
      try {
        const draft: StoredDraft = { name: design.name, document: currentDocument, savedAt: new Date().toISOString() };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        if (!serverId) setSaveStatus("saved");
      } catch {
        if (!serverId) setSaveStatus("error");
      }
    }, LOCAL_SAVE_DELAY);

    if (serverId && signedIn) {
      if (serverTimer.current) clearTimeout(serverTimer.current);
      serverTimer.current = setTimeout(() => {
        serverTimer.current = null;
        saveToServer(serverId, design.name, currentDocument);
      }, SERVER_SAVE_DELAY);
    }
    return () => clearTimeout(localTimer);
  }, [currentDocument, design.name, loaded, serverId, signedIn, draftKey, saveToServer]);

  // Warn before leaving while an edit has not reached the server yet
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (serverId && (saveStatus === "unsaved" || saveStatus === "saving")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [serverId, saveStatus]);

  const requireSignIn = useCallback((message: string) => {
    flash(message, "error");
    router.push(`/login?redirect=${encodeURIComponent("/email-designer")}`);
  }, [flash, router]);

  const handleSave = useCallback(async () => {
    try {
      const draft: StoredDraft = { name: design.name, document: currentDocument, savedAt: new Date().toISOString() };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // Local storage can be full or disabled; the server copy below still applies
    }
    if (!signedIn) {
      setSaveStatus("saved");
      return;
    }
    if (serverTimer.current) {
      clearTimeout(serverTimer.current);
      serverTimer.current = null;
    }
    if (serverId) {
      await saveToServer(serverId, design.name, currentDocument);
      return;
    }
    // First save of a new design: create it in My Templates and keep editing that copy
    setSaveStatus("saving");
    try {
      const created = await createUserEmailTemplate({ name: design.name, templateData: currentDocument });
      skipNextSave.current = true;
      setServerId(created.id);
      setSaveStatus("saved");
      router.replace({ pathname: "/email-designer", query: { design: created.id } }, undefined, { shallow: true });
      flash("Saved to My Templates.");
    } catch (err) {
      setSaveStatus("error");
      flash(friendlyError(err, "We couldn't save your design. Please try again."), "error");
    }
  }, [design.name, currentDocument, draftKey, signedIn, serverId, saveToServer, router, flash]);

  const handleSaveAsTemplate = useCallback(async () => {
    if (!signedIn) return requireSignIn("Sign in to save templates.");
    try {
      await createUserEmailTemplate({ name: `${design.name} (template)`.slice(0, 120), templateData: currentDocument });
      flash("A copy was saved to My Templates.");
    } catch (err) {
      flash(friendlyError(err, "We couldn't save the template. Please try again."), "error");
    }
  }, [signedIn, requireSignIn, design.name, currentDocument, flash]);

  const handleSendTest = useCallback(async () => {
    if (!signedIn) return requireSignIn("Sign in to send yourself a test email.");
    flash("Sending test email…");
    try {
      const result = await sendEmailDesignTest(currentDocument, design.settings.subject);
      flash(`Test email sent to ${result.sentTo}.`);
    } catch (err) {
      flash(friendlyError(err, "We couldn't send the test email. Please try again."), "error");
    }
  }, [signedIn, requireSignIn, currentDocument, design.settings.subject, flash]);

  // ── Templates ────────────────────────────────────────────────────────────
  const handleUseTemplate = useCallback(async (template: EmailTemplateCard) => {
    setOpeningTemplate(template.id);
    try {
      if (signedIn) {
        // The library original is never edited: the server clones it into a design the user owns
        const copy = await cloneEmailTemplate(template.id);
        loadDesign(readDesignData(copy.templateData), copy.name, copy.designId);
        router.replace({ pathname: "/email-designer", query: { design: copy.designId } }, undefined, { shallow: true });
      } else {
        const detail = await getEmailTemplate(template.id);
        loadDesign(readDesignData(detail.templateData), detail.title.split(":")[0], null);
        skipNextSave.current = false;
        router.replace("/email-designer", undefined, { shallow: true });
      }
      setSidebarTab("blocks");
    } catch (err) {
      flash(friendlyError(err, "We couldn't open that template."), "error");
    } finally {
      setOpeningTemplate(null);
    }
  }, [signedIn, loadDesign, router, flash]);

  const handleStartBlank = useCallback(() => {
    const blank = newEmailDesign();
    loadDesign({ sections: blank.sections, settings: blank.settings }, blank.name, null);
    skipNextSave.current = false;
    router.replace("/email-designer", undefined, { shallow: true });
    setSidebarTab("blocks");
  }, [loadDesign, router]);

  // ── Block operations ─────────────────────────────────────────────────────

  const sectionsFor = useCallback((item: PaletteItem): EmailSection[] => {
    if (item.kind === "layout") return [createSection(item.widths)];
    if (item.kind === "preset") return SECTION_PRESETS[item.preset]?.build() ?? [];
    return [wrapInSection([createBlock(item.type)])];
  }, []);

  const selectFirstBlock = (added: EmailSection[]) => {
    const section = added[0];
    const first = section?.columns.find((c) => c.blocks.length)?.blocks[0];
    if (!section) return;
    setSelection(first && added.length === 1 && section.columns.length === 1
      ? { kind: "block", sectionId: section.id, blockId: first.id }
      : { kind: "section", sectionId: section.id });
  };

  const handleDropPaletteAtGap = useCallback((item: PaletteItem, index: number) => {
    const added = sectionsFor(item);
    if (!added.length) return;
    push(insertSections(sections, index, added));
    selectFirstBlock(added);
    setPaletteDrag(null);
  }, [sections, push, sectionsFor]);

  const handleDropPaletteInColumn = useCallback((item: PaletteItem, target: BlockTarget) => {
    if (item.kind !== "block") return;
    const block = createBlock(item.type);
    push(insertBlock(sections, target, block));
    setSelection({ kind: "block", sectionId: target.sectionId, blockId: block.id });
    setPaletteDrag(null);
  }, [sections, push]);

  const handleUpdateBlock = useCallback((updated: EmailBlock) => {
    push(updateBlock(sections, updated));
  }, [sections, push]);

  const handleMoveBlock = useCallback((blockId: string, target: BlockTarget) => {
    const from = findBlock(sections, blockId);
    if (!from) return;
    let next = moveBlock(sections, blockId, target);
    // A row left with nothing in it after its last block was dragged away is removed
    if (from.section.id !== target.sectionId && from.section.columns.every((c) => c.blocks.every((b) => b.id === blockId))) {
      next = removeSection(next, from.section.id);
    }
    push(next);
    setSelection({ kind: "block", sectionId: target.sectionId, blockId });
  }, [sections, push]);

  const handleMoveBlockToGap = useCallback((blockId: string, index: number) => {
    const from = findBlock(sections, blockId);
    if (!from) return;
    const row = wrapInSection([from.block]);
    const emptied = from.section.columns.every((c) => c.blocks.every((b) => b.id === blockId));
    let next = insertSections(removeBlock(sections, blockId), index, [row]);
    if (emptied) next = removeSection(next, from.section.id);
    push(next);
    setSelection({ kind: "block", sectionId: row.id, blockId });
  }, [sections, push]);

  const handleMoveSection = useCallback((from: number, to: number) => {
    push(moveSection(sections, from, to));
  }, [sections, push]);

  const handleShiftBlock = useCallback((blockId: string, delta: -1 | 1) => {
    push(shiftBlock(sections, blockId, delta));
  }, [sections, push]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    const at = findBlock(sections, blockId);
    const result = duplicateBlock(sections, blockId);
    push(result.sections);
    if (result.copy && at) setSelection({ kind: "block", sectionId: at.section.id, blockId: result.copy.id });
  }, [sections, push]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    push(removeBlock(sections, blockId));
    setSelection(null);
  }, [sections, push]);

  const handleDuplicateSection = useCallback((sectionId: string) => {
    const result = duplicateSection(sections, sectionId);
    push(result.sections);
    if (result.copy) setSelection({ kind: "section", sectionId: result.copy.id });
  }, [sections, push]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    push(removeSection(sections, sectionId));
    setSelection(null);
  }, [sections, push]);

  const handleAddAtEnd = useCallback((item: PaletteItem) => {
    handleDropPaletteAtGap(item, sections.length);
  }, [handleDropPaletteAtGap, sections.length]);

  // ── HTML Import & Two-Way Sync ───────────────────────────────────────────
  const handleHtmlImport = useCallback((importedBlocks: LegacyEmailBlock[], importedSettings?: Partial<EmailSettings>) => {
    push(pruneEmptySections(legacyBlocksToSections(importedBlocks)));
    if (importedSettings) {
      setDesign((prev) => ({ ...prev, settings: { ...prev.settings, ...importedSettings } }));
    }
    setSelection(null);
    setActiveView("visual");
  }, [push]);

  /** An email imported as is: one HTML block holding the original document */
  const handleExactImport = useCallback((imported: EmailSection[], importedSettings?: Partial<EmailSettings>) => {
    push(imported);
    if (importedSettings) {
      setDesign((prev) => ({ ...prev, settings: { ...prev.settings, ...importedSettings } }));
    }
    setSelection(null);
    setActiveView("visual");
  }, [push]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const selectedBlock = selection?.kind === "block" ? findBlock(sections, selection.blockId)?.block ?? null : null;
  const selectedSection = selection?.kind === "section" ? sections.find((s) => s.id === selection.sectionId) ?? null : null;

  // An imported email is edited as code, which needs a wider panel than block settings do
  const editingHtmlDocument = selectedBlock?.type === "html" && isFullHtmlDocument(selectedBlock.html);

  // On phones and tablets, clicking a part of an imported email opens its code
  useEffect(() => onHtmlPick(() => setPanel("right")), []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const isEditing = active && (
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable
      );
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); handleSave(); return; }
      if (isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d" && selection) {
        e.preventDefault();
        if (selection.kind === "block") handleDuplicateBlock(selection.blockId);
        else handleDuplicateSection(selection.sectionId);
      }
      if (e.key === "Escape") setSelection(null);
      if ((e.key === "Delete" || e.key === "Backspace") && selection) {
        e.preventDefault();
        if (selection.kind === "block") handleDeleteBlock(selection.blockId);
        else handleDeleteSection(selection.sectionId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selection, handleSave, handleDeleteBlock, handleDeleteSection, handleDuplicateBlock, handleDuplicateSection]);

  const blockCount = countAllBlocks(sections);
  const viewportLabel = previewMode === "mobile" ? "375px mobile" : previewMode === "tablet" ? "768px tablet" : `${design.settings.emailWidth}px desktop`;

  return (
    <>
      <Head>
        <title>Email Designer — Falcon</title>
        <meta name="description" content="Falcon Email Designer: drag and drop email builder with live preview, HTML import/export, and direct sending." />
        <meta name="robots" content="noindex" />
      </Head>

      {/* Full-screen layout */}
      <div className="flex h-screen h-[100dvh] w-screen flex-col overflow-hidden bg-[#050505] text-white" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", Arial, sans-serif' }}>
        {/* Unified Top Toolbar */}
        <EditorToolbar
          emailName={design.name}
          previewMode={previewMode}
          activeView={activeView}
          canUndo={canUndo}
          canRedo={canRedo}
          saveStatus={saveStatus}
          localOnly={!serverId}
          onNameChange={(name) => setDesign((d) => ({ ...d, name }))}
          onUndo={undo}
          onRedo={redo}
          onPreviewModeChange={setPreviewMode}
          onActiveViewChange={setActiveView}
          onDesignByHtml={() => setShowDesignByHtmlModal(true)}
          onPreview={() => setShowPreview(true)}
          onSave={handleSave}
          onSaveAsTemplate={handleSaveAsTemplate}
          onOpenTemplates={() => router.push("/email-templates")}
          onExportHtml={() => setShowExport(true)}
          onSendTest={handleSendTest}
          onSendEmail={() => setShowSendModal(true)}
          onBack={() => router.push("/")}
        />

        {/* ─── WORKSPACE (Switch between Visual Canvas and HTML Code Editor) ─── */}
        {activeView === "html" ? (
          <HtmlCodePanel
            initialHtml={currentHtml}
            onApplyHtmlToCanvas={handleHtmlImport}
            onApplyExact={handleExactImport}
            onExportHtml={() => setShowExport(true)}
            onSwitchToVisual={() => setActiveView("visual")}
          />
        ) : (
          /* Three-panel visual workspace */
          <div className="flex flex-1 overflow-hidden">
            {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
            <div className={`${panel === "left" ? "flex" : "hidden"} w-full shrink-0 flex-col border-r border-white/[0.06] bg-[#070707] lg:flex lg:w-[230px]`}>
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
                    onAdd={(item) => { handleAddAtEnd(item); setPanel("canvas"); }}
                    onDragItem={setPaletteDrag}
                    onDesignByHtml={() => setShowDesignByHtmlModal(true)}
                  />
                )}
                {sidebarTab === "templates" && (
                  <TemplateSidebar
                    onUseTemplate={(template) => { setPanel("canvas"); handleUseTemplate(template); }}
                    onStartBlank={handleStartBlank}
                    onOpenLibrary={() => router.push("/email-templates")}
                    busyId={openingTemplate}
                  />
                )}
                {sidebarTab === "settings" && (
                  <div className="h-full overflow-y-auto px-4 py-3">
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
            <div className={`${panel === "canvas" ? "flex" : "hidden"} min-w-0 flex-1 flex-col overflow-hidden lg:flex`}>
              {/* Block count & preview status bar */}
              <div className="flex h-7 shrink-0 items-center justify-between border-b border-white/[0.04] bg-black/30 px-4">
                <span className="text-[10px] text-zinc-600">
                  {sections.length} row{sections.length !== 1 ? "s" : ""} · {blockCount} block{blockCount !== 1 ? "s" : ""}
                  {selectedBlock ? ` · Selected: ${selectedBlock.type.replace("_block", "")}` : selectedSection ? " · Selected: row" : ""}
                </span>
                <span className="text-[10px] text-zinc-600">{viewportLabel}</span>
              </div>

              <EmailCanvas
                sections={sections}
                selection={selection}
                previewMode={previewMode}
                settings={design.settings}
                paletteDrag={paletteDrag}
                onSelect={setSelection}
                onUpdateBlock={handleUpdateBlock}
                onDropPaletteAtGap={handleDropPaletteAtGap}
                onDropPaletteInColumn={handleDropPaletteInColumn}
                onMoveBlock={handleMoveBlock}
                onMoveBlockToGap={handleMoveBlockToGap}
                onMoveSection={handleMoveSection}
                onShiftBlock={handleShiftBlock}
                onDuplicateBlock={handleDuplicateBlock}
                onDeleteBlock={handleDeleteBlock}
                onDuplicateSection={handleDuplicateSection}
                onDeleteSection={handleDeleteSection}
              />
            </div>

            {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
            <div className={`${panel === "right" ? "flex" : "hidden"} w-full shrink-0 flex-col border-l border-white/[0.06] bg-[#070707] lg:flex ${editingHtmlDocument ? "lg:w-[380px] xl:w-[460px]" : "lg:w-[260px]"}`}>
              <PropertiesPanel
                block={selectedBlock}
                section={selectedSection}
                emailSettings={design.settings}
                onBlockChange={handleUpdateBlock}
                onSettingsChange={(s) => setDesign((d) => ({ ...d, settings: s }))}
                onSelectRow={selection?.kind === "block" ? () => setSelection({ kind: "section", sectionId: selection.sectionId }) : undefined}
                onSectionSettings={(patch) => selectedSection && push(updateSectionSettings(sections, selectedSection.id, patch))}
                onColumnChange={(columnId, patch) => selectedSection && push(updateColumn(sections, selectedSection.id, columnId, patch))}
                onColumnWidths={(widths) => selectedSection && push(setColumnWidths(sections, selectedSection.id, widths))}
                onAddColumn={() => selectedSection && push(addColumn(sections, selectedSection.id))}
                onRemoveColumn={(columnId) => selectedSection && push(removeColumn(sections, selectedSection.id, columnId))}
              />
            </div>
          </div>
        )}

        {/* Panel switcher for phones and tablets */}
        {activeView === "visual" && (
          <nav aria-label="Editor panels" className="flex shrink-0 border-t border-white/[0.08] bg-[#070709] lg:hidden">
            {([
              { id: "left", label: "Add", icon: <Plus size={16} /> },
              { id: "canvas", label: "Canvas", icon: <LayoutTemplate size={16} /> },
              { id: "right", label: selectedBlock || selectedSection ? "Edit" : "Settings", icon: <SlidersHorizontal size={16} /> },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={panel === tab.id}
                onClick={() => setPanel(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  panel === tab.id ? "text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Status messages (save, recovery, test email) */}
      {notice && (
        <div
          role="status"
          className={`fixed bottom-20 left-1/2 z-[200] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border px-4 py-2 text-[12px] font-medium shadow-2xl lg:bottom-6 ${
            notice.tone === "error"
              ? "border-[#FF4D4D]/40 bg-[#1a0b0b] text-[#ff9c9c]"
              : "border-[#00D084]/40 bg-[#07130f] text-[#7ff0c4]"
          }`}
        >
          {notice.text}
        </div>
      )}

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
          onImportExact={handleExactImport}
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
