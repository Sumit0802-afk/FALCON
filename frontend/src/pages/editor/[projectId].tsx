import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import { DesignProject } from "@/types";
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

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    const loadProject = async () => {
      try {
        const loadedProject =
          await projectService.get(projectId);

        if (cancelled) return;

        setProject(loadedProject ?? null);
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

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        Loading…
      </div>
    );
  }

  if (project === null) {
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

  return (
    <>
      <Head>
        <title>{project.title} — Falcon</title>
      </Head>

      <EditorLayout
        projectId={project.id}
        projectTitle={project.title}
        initialPage={project.pages[0]}
        onBack={() => router.push("/")}
      />
    </>
  );
}