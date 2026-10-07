import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ChevronDown, FolderOpen, LifeBuoy, LogOut, Monitor, Moon, Palette, Settings, Sun, UserRound } from "lucide-react";
import { apiFetch, ApiError } from "@/services/api";
import { AuthUser, clearToken, isAuthenticated, logout } from "@/services/authService";
import { ThemeChoice, getThemeChoice, onThemeChange, setThemeChoice } from "@/lib/theme";

/**
 * The signed-in user for navbars. `signedIn` is known straight away from the
 * stored session; `user` fills in once the profile has loaded from the server.
 */
export function useCurrentUser() {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  // True once the server has said the stored session is no longer valid
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;
    setSignedIn(true);
    let cancelled = false;
    apiFetch<{ user: AuthUser }>("/auth/me")
      .then((res) => { if (!cancelled) setUser(res.user); })
      .catch((err) => {
        // Only an expired or revoked session signs the user out; a network blip does not
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          if (!cancelled) { setSignedIn(false); setExpired(true); }
        }
      });
    return () => { cancelled = true; };
  }, []);

  const signOut = async () => {
    await logout();
    setUser(null);
    setSignedIn(false);
  };

  return { signedIn, user, expired, setUser, signOut };
}

/** The saved theme choice, kept in sync with changes made anywhere on the page. */
export function useThemeChoice(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>("dark");
  useEffect(() => {
    setChoice(getThemeChoice());
    return onThemeChange(() => setChoice(getThemeChoice()));
  }, []);
  return [choice, setThemeChoice];
}

export const THEME_OPTIONS: { id: ThemeChoice; label: string; icon: typeof Moon }[] = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "system", label: "System", icon: Monitor },
];

function initials(user: AuthUser | null): string {
  const source = (user?.name || user?.email || "").trim();
  if (!source) return "";
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2)).toUpperCase();
}

export function Avatar({ user, size }: { user: AuthUser | null; size: number }) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size };
  if (user?.profileImage && !broken) {
    return <img src={user.profileImage} alt="" onError={() => setBroken(true)} style={style} className="shrink-0 rounded-full object-cover" />;
  }
  return (
    <span style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.36)) }} className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F81FF] to-[#22D3EE] font-semibold text-white">
      {initials(user)}
    </span>
  );
}

interface UserMenuProps {
  user: AuthUser | null;
  onSignOut: () => Promise<void> | void;
}

const ITEM = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-zinc-300 transition hover:bg-white/[0.06] hover:text-white";

/** Avatar button with a dropdown showing who is signed in. */
export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useThemeChoice();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (path: string) => { setOpen(false); router.push(path); };
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Account";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] pl-1.5 pr-3 text-[12.5px] text-zinc-300 transition hover:border-white/25 hover:text-white"
      >
        <Avatar user={user} size={28} />
        <span className="hidden max-w-[110px] truncate sm:inline">{firstName}</span>
        <ChevronDown size={13} className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[272px] overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0b0f14] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3 border-b border-white/[0.07] p-4">
            <Avatar user={user} size={40} />
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-medium text-white">{user?.name || "Your account"}</div>
              <div className="truncate text-[12px] text-zinc-500">{user?.email || "Loading…"}</div>
            </div>
          </div>

          <div className="p-1.5">
            <button type="button" role="menuitem" onClick={() => go("/projects")} className={ITEM}>
              <FolderOpen size={14} className="text-zinc-500" /> My projects
            </button>

            <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5">
              <span className="flex items-center gap-2.5 text-[13px] text-zinc-300">
                <Palette size={14} className="text-zinc-500" /> Theme
              </span>
              <div role="radiogroup" aria-label="Theme" className="flex rounded-full border border-white/[0.10] bg-white/[0.03] p-0.5">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={theme === option.id}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => setTheme(option.id)}
                    className={`flex h-6 w-7 items-center justify-center rounded-full transition ${theme === option.id ? "bg-white/[0.14] text-white" : "text-zinc-500 hover:text-white"}`}
                  >
                    <option.icon size={13} />
                  </button>
                ))}
              </div>
            </div>

            <button type="button" role="menuitem" onClick={() => go("/account")} className={ITEM}>
              <UserRound size={14} className="text-zinc-500" /> My account
            </button>
            <button type="button" role="menuitem" onClick={() => go("/settings")} className={ITEM}>
              <Settings size={14} className="text-zinc-500" /> Settings
            </button>
            <button type="button" role="menuitem" onClick={() => go("/help")} className={ITEM}>
              <LifeBuoy size={14} className="text-zinc-500" /> Help &amp; support
            </button>
          </div>

          <div className="border-t border-white/[0.07] p-1.5">
            <button type="button" role="menuitem" onClick={async () => { setOpen(false); await onSignOut(); }} className={ITEM}>
              <LogOut size={14} className="text-zinc-500" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
