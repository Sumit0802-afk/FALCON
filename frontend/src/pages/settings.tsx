import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import AccountShell, { Notice, Panel, SECONDARY_BUTTON } from "@/components/AccountShell";
import { THEME_OPTIONS, useThemeChoice } from "@/components/UserMenu";
import { AccountSession, listSessions, logout, logoutOtherSessions } from "@/services/authService";

const THEME_HINTS: Record<string, string> = {
  dark: "Falcon's original look.",
  light: "A bright interface for well-lit rooms.",
  system: "Follows your device setting.",
};

/** Turns a raw user-agent string into something like "Chrome on Windows". */
function describeDevice(userAgent: string | null): { label: string; mobile: boolean } {
  if (!userAgent) return { label: "Unknown device", mobile: false };
  const browser = /Edg\//.test(userAgent) ? "Edge"
    : /OPR\//.test(userAgent) ? "Opera"
    : /Chrome\//.test(userAgent) ? "Chrome"
    : /Firefox\//.test(userAgent) ? "Firefox"
    : /Safari\//.test(userAgent) ? "Safari"
    : "Browser";
  const system = /Windows/.test(userAgent) ? "Windows"
    : /Android/.test(userAgent) ? "Android"
    : /iPhone|iPad/.test(userAgent) ? "iOS"
    : /Mac OS X/.test(userAgent) ? "macOS"
    : /Linux/.test(userAgent) ? "Linux"
    : "";
  return { label: system ? `${browser} on ${system}` : browser, mobile: /Android|iPhone|Mobile/.test(userAgent) };
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function Appearance() {
  const [theme, setTheme] = useThemeChoice();
  return (
    <>
      <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-3">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={theme === option.id}
            onClick={() => setTheme(option.id)}
            className={`rounded-xl border p-4 text-left transition ${theme === option.id ? "border-[#2F81FF]/70 bg-[#2F81FF]/[0.08]" : "border-white/[0.08] hover:border-white/20"}`}
          >
            <option.icon size={16} className={theme === option.id ? "text-[#4DA3FF]" : "text-zinc-500"} />
            <div className="mt-3 text-[13.5px] font-medium text-white">{option.label}</div>
            <div className="mt-0.5 text-[12px] text-zinc-500">{THEME_HINTS[option.id]}</div>
          </button>
        ))}
      </div>
      <p className="mt-4 text-[12px] text-zinc-500">The poster editor and email designer always stay dark, so the colours in your designs look the same as they will when exported.</p>
    </>
  );
}

function Sessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AccountSession[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    listSessions().then(setSessions).catch(() => setStatus({ kind: "error", text: "We couldn't load your devices. Please refresh the page." }));
  }, []);

  useEffect(load, [load]);

  const others = sessions ? sessions.filter((s) => !s.current).length : 0;

  const signOutOthers = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { revoked } = await logoutOtherSessions();
      setStatus({ kind: "ok", text: revoked === 0 ? "No other devices were signed in." : `Signed out of ${revoked} other device${revoked === 1 ? "" : "s"}.` });
      load();
    } catch {
      setStatus({ kind: "error", text: "We couldn't sign out your other devices. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const signOutHere = async () => {
    setBusy(true);
    await logout();
    router.push("/");
  };

  return (
    <div className="space-y-4">
      {sessions === null && !status && <div className="h-16 animate-pulse rounded-xl bg-white/[0.03]" />}
      {sessions && (
        <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06]">
          {sessions.map((session) => {
            const device = describeDevice(session.userAgent);
            const Icon = device.mobile ? Smartphone : Monitor;
            return (
              <li key={session.id} className="flex items-center gap-3 px-4 py-3">
                <Icon size={16} className="shrink-0 text-zinc-500" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-white">{device.label}</div>
                  <div className="truncate text-[11.5px] text-zinc-500">Signed in {formatDateTime(session.createdAt)}{session.ipAddress ? ` · ${session.ipAddress}` : ""}</div>
                </div>
                {session.current && <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-2.5 py-0.5 text-[11px] text-emerald-300">This device</span>}
              </li>
            );
          })}
        </ul>
      )}
      {status && <Notice kind={status.kind}>{status.text}</Notice>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={signOutOthers} disabled={busy || !sessions || others === 0} className={SECONDARY_BUTTON}>
          Sign out other devices
        </button>
        <button type="button" onClick={signOutHere} disabled={busy} className={SECONDARY_BUTTON}>
          <LogOut size={14} /> Log out
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AccountShell title="Settings" description="How Falcon looks, and where you're signed in.">
      {() => (
        <>
          <Panel title="Appearance" hint="Saved on this browser.">
            <Appearance />
          </Panel>
          <Panel title="Signed-in devices" hint="Every browser where your account is currently signed in.">
            <Sessions />
          </Panel>
        </>
      )}
    </AccountShell>
  );
}
