export type ThemeChoice = "dark" | "light" | "system";

export const THEME_KEY = "falcon_theme";
const THEME_EVENT = "falcon-theme-change";

/**
 * The design editors always stay dark: the light theme is produced by a colour
 * filter, and a filter there would change how the user's own design colours look.
 */
export function isThemeLockedPath(pathname: string): boolean {
  return pathname.startsWith("/editor") || pathname.startsWith("/email-designer");
}

export function getThemeChoice(): ThemeChoice {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "system" || stored === "dark") return stored;
  } catch {
    // Storage can be unavailable (private mode); fall back to the default
  }
  return "dark";
}

export function resolveTheme(choice: ThemeChoice): "dark" | "light" {
  if (choice !== "system") return choice;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Applies the saved theme to the page that is currently open. */
export function applyTheme(pathname?: string): void {
  if (typeof document === "undefined") return;
  const path = pathname ?? window.location.pathname;
  const theme = isThemeLockedPath(path) ? "dark" : resolveTheme(getThemeChoice());
  document.documentElement.dataset.theme = theme;
}

export function setThemeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Still apply for this page view even if it can't be remembered
  }
  applyTheme();
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Calls back whenever the theme choice changes, in this tab or another. */
export function onThemeChange(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const onStorage = (e: StorageEvent) => { if (e.key === THEME_KEY) callback(); };
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", callback);
  };
}

/** Runs before first paint (see _document) so a light-theme page never flashes dark. */
export const THEME_BOOT_SCRIPT = `(function(){try{var p=location.pathname;var c=localStorage.getItem("${THEME_KEY}")||"dark";var t=c==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):c;if(p.indexOf("/editor")===0||p.indexOf("/email-designer")===0)t="dark";document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){}})();`;
