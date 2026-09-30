/**
 * Thin wrapper around localStorage so the rest of the app never touches
 * `window` directly.
 *
 * Includes quota protection so the app does not crash when localStorage
 * becomes full.
 */

const NAMESPACE = "falcon";

function key(k: string): string {
  return `${NAMESPACE}:${k}`;
}

function isQuotaError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return (
      error.name === "QuotaExceededError" ||
      error.code === 22 ||
      error.code === 1014
    );
  }

  return false;
}

function removeOldProjects(): void {
  if (typeof window === "undefined") return;

  const projectsKey = key("projects");
  const raw = window.localStorage.getItem(projectsKey);

  if (!raw) return;

  try {
    const projects = JSON.parse(raw);

    if (!Array.isArray(projects) || projects.length === 0) {
      window.localStorage.removeItem(projectsKey);
      return;
    }

    /*
     * Remove the oldest project first.
     * This gives the current project the best chance of being saved.
     */
    projects.sort((a, b) => {
      const dateA = new Date(a?.updatedAt ?? 0).getTime();
      const dateB = new Date(b?.updatedAt ?? 0).getTime();

      return dateA - dateB;
    });

    projects.shift();

    window.localStorage.setItem(
      projectsKey,
      JSON.stringify(projects)
    );
  } catch {
    /*
     * If the stored project data itself is corrupted,
     * remove it so the application can recover.
     */
    try {
      window.localStorage.removeItem(projectsKey);
    } catch {
      // Ignore storage errors.
    }
  }
}

export const storageService = {
  get<T>(k: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(key(k));

      if (!raw) return null;

      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  },

  set<T>(k: string, value: T): void {
    if (typeof window === "undefined") return;

    const storageKey = key(k);
    const serialized = JSON.stringify(value);

    try {
      window.localStorage.setItem(storageKey, serialized);
      return;
    } catch (error) {
      if (!isQuotaError(error)) {
        console.error(
          `Falcon storage error while saving "${storageKey}"`,
          error
        );
        return;
      }
    }

    /*
     * Storage is full.
     * Try removing old projects and save again.
     */
    if (k === "projects") {
      let attempts = 0;

      while (attempts < 10) {
        attempts += 1;

        try {
          removeOldProjects();

          window.localStorage.setItem(
            storageKey,
            serialized
          );

          return;
        } catch (error) {
          if (!isQuotaError(error)) {
            console.error(
              `Falcon storage error while saving "${storageKey}"`,
              error
            );
            return;
          }

          /*
           * If there is still not enough space, continue
           * removing the oldest project.
           */
        }
      }

      /*
       * Last recovery attempt:
       * remove the projects storage completely instead
       * of crashing the application.
       */
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage errors.
      }

      console.warn(
        "Falcon: localStorage quota exceeded. " +
          "Project could not be persisted because the stored data is too large."
      );

      return;
    }

    console.warn(
      `Falcon: localStorage quota exceeded while saving "${storageKey}".`
    );
  },

  remove(k: string): void {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(key(k));
    } catch {
      // Ignore storage errors.
    }
  },

  keysWithPrefix(prefix: string): string[] {
    if (typeof window === "undefined") return [];

    try {
      const full = key(prefix);
      const out: string[] = [];

      for (
        let i = 0;
        i < window.localStorage.length;
        i++
      ) {
        const k = window.localStorage.key(i);

        if (k && k.startsWith(full)) {
          out.push(
            k.slice(NAMESPACE.length + 1)
          );
        }
      }

      return out;
    } catch {
      return [];
    }
  },
};