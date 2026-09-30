import { DesignProject, PAGE_PRESETS } from "@/types";
import { apiFetch } from "./api";

interface ProjectSummary {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BackendPage {
  id: string;
  name: string;
  width: number;
  height: number;
  presetName: string;
  background: string;
  elements: DesignProject["pages"][number]["elements"];
  order: number;
}

interface BackendProject {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  ownerId: string;
  pages?: BackendPage[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectResponse {
  project: BackendProject;
}

interface ProjectsResponse {
  projects: ProjectSummary[];
}

interface PageResponse {
  page: BackendPage;
}

/* =========================================================
   LOCAL STORAGE RESILIENCE HELPERS
   ========================================================= */

const LOCAL_STORAGE_KEY = "falcon_local_projects";

function getLocalProjects(): Record<string, DesignProject> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalProject(project: DesignProject): void {
  if (typeof window === "undefined") return;
  try {
    const all = getLocalProjects();
    all[project.id] = project;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn("Failed to cache project to localStorage:", err);
  }
}

function removeLocalProject(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getLocalProjects();
    delete all[id];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

/* =========================================================
   TRANSFORM HELPERS
   ========================================================= */

function toDesignProject(project: BackendProject): DesignProject {
  const pages = Array.isArray(project.pages) ? project.pages : [];

  return {
    id: project.id,
    title: project.title,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    pages: pages.map((page) => ({
      id: page.id,
      name: page.name,
      size: {
        width: page.width,
        height: page.height,
        name: page.presetName,
      },
      background: page.background,
      elements: Array.isArray(page.elements) ? page.elements : [],
    })),
  };
}

/* =========================================================
   PROJECT SERVICE
   ========================================================= */

export const projectService = {
  async list(): Promise<ProjectSummary[]> {
    const locals = Object.values(getLocalProjects());
    const localSummaries: ProjectSummary[] = locals.map((lp) => ({
      id: lp.id,
      title: lp.title,
      thumbnailUrl: null,
      pageCount: lp.pages.length,
      createdAt: lp.createdAt,
      updatedAt: lp.updatedAt,
    }));

    try {
      const response = await apiFetch<ProjectsResponse>("/projects");
      const backendSummaries = response.projects || [];
      const localOnly = localSummaries.filter(
        (ls) => !backendSummaries.some((bs) => bs.id === ls.id)
      );
      return [...backendSummaries, ...localOnly];
    } catch (err) {
      console.warn("Backend list unavailable, serving from localStorage:", err);
      return localSummaries;
    }
  },

  async get(id: string): Promise<DesignProject | undefined> {
    if (id.startsWith("local-")) {
      const locals = getLocalProjects();
      return locals[id];
    }

    try {
      const response = await apiFetch<ProjectResponse>(`/projects/${id}`);
      const project = toDesignProject(response.project);
      saveLocalProject(project);
      return project;
    } catch (error) {
      console.warn("Backend get unavailable, checking localStorage fallback:", error);
      const locals = getLocalProjects();
      return locals[id];
    }
  },

  async create(
    title: string,
    ownerId: string,
    size?: { name: string; width: number; height: number }
  ): Promise<DesignProject> {
    const preset = size || PAGE_PRESETS[0];

    try {
      const response = await apiFetch<ProjectResponse>("/projects", {
        method: "POST",
        body: JSON.stringify({
          title,
          ownerId,
          presetName: preset.name,
          width: preset.width,
          height: preset.height,
        }),
      });

      const project = toDesignProject(response.project);
      saveLocalProject(project);
      return project;
    } catch (err) {
      console.warn("Backend unavailable, creating local project with localStorage fallback:", err);
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const localProject: DesignProject = {
        id: localId,
        title,
        ownerId: ownerId || "local-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages: [
          {
            id: `page-${Date.now()}`,
            name: "Page 1",
            size: preset,
            background: "#ffffff",
            elements: [],
          },
        ],
      };
      saveLocalProject(localProject);
      return localProject;
    }
  },

  async save(project: DesignProject): Promise<DesignProject> {
    // Always persist to local cache first
    saveLocalProject(project);

    if (project.id.startsWith("local-")) {
      return project;
    }

    try {
      const updateResponse = await apiFetch<ProjectResponse>(
        `/projects/${project.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: project.title,
          }),
        }
      );

      const existingPages = updateResponse.project?.pages ?? [];

      for (const [index, page] of project.pages.entries()) {
        let pageIdToUpdate = page.id;
        const existsOnBackend = existingPages.some((p) => p.id === page.id);

        if (!existsOnBackend && existingPages[index]) {
          pageIdToUpdate = existingPages[index].id;
        }

        await apiFetch<PageResponse>(
          `/projects/${project.id}/pages/${pageIdToUpdate}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: page.name,
              background: page.background,
              elements: page.elements,
            }),
          }
        );
      }

      const saved = toDesignProject({
        ...updateResponse.project,
        pages: project.pages.map((currentPage, index) => ({
          id: currentPage.id,
          name: currentPage.name,
          width: currentPage.size.width,
          height: currentPage.size.height,
          presetName: currentPage.size.name,
          background: currentPage.background,
          elements: currentPage.elements,
          order: index,
        })),
      });

      saveLocalProject(saved);
      return saved;
    } catch (err) {
      console.warn("Backend save failed, saved to localStorage fallback:", err);
      return project;
    }
  },

  async duplicate(id: string): Promise<DesignProject | undefined> {
    if (id.startsWith("local-")) {
      const locals = getLocalProjects();
      const existing = locals[id];
      if (!existing) return undefined;
      const dup: DesignProject = {
        ...existing,
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: `${existing.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveLocalProject(dup);
      return dup;
    }

    try {
      const response = await apiFetch<ProjectResponse>(
        `/projects/${id}/duplicate`,
        {
          method: "POST",
        }
      );

      const project = toDesignProject(response.project);
      saveLocalProject(project);
      return project;
    } catch (error) {
      console.error("Failed to duplicate project:", error);
      const locals = getLocalProjects();
      const existing = locals[id];
      if (!existing) return undefined;
      const dup: DesignProject = {
        ...existing,
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: `${existing.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveLocalProject(dup);
      return dup;
    }
  },

  async remove(id: string): Promise<void> {
    removeLocalProject(id);
    if (!id.startsWith("local-")) {
      try {
        await apiFetch<void>(`/projects/${id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Failed to delete project on backend:", err);
      }
    }
  },
};