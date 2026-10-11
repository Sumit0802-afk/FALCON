import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import { DesignPage, DesignProject } from "@/types";
import { projectService } from "@/services/projectService";
import { EditorLayout } from "@/components/Editor/EditorLayout";

export default function EditorPage() {
  const router = useRouter();

  const { projectId } = router.query as {
    projectId?: string;
  };

  const [project, setProject] = useState<
    DesignProject | null | undefined
  >(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [working, setWorking] = useState(false);

  // The open page as the editor currently has it, including edits not yet saved
  const livePage = useRef<DesignPage | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    const loadProject = async () => {
      try {
        const loadedProject =
          await projectService.get(projectId);

        if (cancelled) return;

        setProject(loadedProject ?? null);
        setPageIndex(0);
        livePage.current = null;
      } catch (error) {
        console.error(
          "Failed to load project:",
          error
        );

        if (!cancelled) {
          setProject(null);
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handlePageChange = useCallback((page: DesignPage) => {
    livePage.current = page;
  }, []);

  /**
   * Folds the open page's latest content back into the project and saves it,
   * so nothing is lost when the editor moves to another page.
   */
  const commitOpenPage = useCallback(async (current: DesignProject): Promise<DesignProject> => {
    const page = livePage.current;
    if (!page) return current;
    const stored = current.pages.find((p) => p.id === page.id);
    if (!stored || stored === page) return current;
    const next = { ...current, pages: current.pages.map((p) => (p.id === page.id ? page : p)) };
    await projectService.savePage(current.id, page).catch((err) => console.warn("Page save failed:", err));
    return next;
  }, []);

  const selectPage = useCallback(async (index: number) => {
    if (!project || working) return;
    setWorking(true);
    try {
      const next = await commitOpenPage(project);
      livePage.current = null;
      setProject(next);
      setPageIndex(Math.max(0, Math.min(next.pages.length - 1, index)));
    } finally {
      setWorking(false);
    }
  }, [project, working, commitOpenPage]);

  const addPage = useCallback(async (copy: boolean) => {
    if (!project || working) return;
    setWorking(true);
    try {
      const current = await commitOpenPage(project);
      const after = current.pages[pageIndex];
      const created = await projectService.addPage(current.id, after, copy);
      const pages = [...current.pages];
      pages.splice(pageIndex + 1, 0, created);
      livePage.current = null;
      setProject({ ...current, pages });
      setPageIndex(pageIndex + 1);
    } catch (error) {
      console.error("Failed to add page:", error);
      alert("Could not add a page. Please try again.");
    } finally {
      setWorking(false);
    }
  }, [project, working, pageIndex, commitOpenPage]);

  const deletePage = useCallback(async () => {
    if (!project || working || project.pages.length <= 1) return;
    const target = project.pages[pageIndex];
    if (!window.confirm(`Delete page ${pageIndex + 1}? This cannot be undone.`)) return;
    setWorking(true);
    try {
      await projectService.deletePage(project.id, target.id);
      const pages = project.pages.filter((p) => p.id !== target.id);
      livePage.current = null;
      setProject({ ...project, pages });
      setPageIndex(Math.min(pageIndex, pages.length - 1));
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("Could not delete the page. Please try again.");
    } finally {
      setWorking(false);
    }
  }, [project, working, pageIndex]);

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Loading…
      </div>
    );
  }

  if (project === null || project.pages.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-zinc-950 text-zinc-400">
        <p>Design not found.</p>

        <button
          onClick={() => router.push("/")}
          className="text-indigo-400 hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const page = project.pages[Math.min(pageIndex, project.pages.length - 1)];

  return (
    <>
      <Head>
        <title>{`${project.title} — Falcon`}</title>
      </Head>

      {/* The editor holds one page at a time; changing page gives it a fresh start on that page */}
      <EditorLayout
        key={page.id}
        projectId={project.id}
        projectTitle={project.title}
        initialPage={page}
        pages={project.pages}
        pageIndex={pageIndex}
        onSelectPage={selectPage}
        onAddPage={() => addPage(false)}
        onDuplicatePage={() => addPage(true)}
        onDeletePage={deletePage}
        onPageChange={handlePageChange}
        onTitleChange={(title) => setProject((current) => (current ? { ...current, title } : current))}
        onBack={() => router.push("/")}
      />
    </>
  );
}
