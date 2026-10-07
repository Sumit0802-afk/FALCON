import { ReactNode, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FolderOpen, LifeBuoy, Settings, UserRound } from "lucide-react";
import { AuthUser, isAuthenticated } from "@/services/authService";
import { UserMenu, useCurrentUser } from "@/components/UserMenu";

const SECTIONS = [
  { path: "/projects", label: "My projects", icon: FolderOpen },
  { path: "/account", label: "My account", icon: UserRound },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/help", label: "Help & support", icon: LifeBuoy },
];

interface AccountShellProps {
  title: string;
  description: string;
  children: (ctx: { user: AuthUser | null; setUser: (user: AuthUser | null) => void }) => ReactNode;
}

/** Shared frame for the signed-in account pages: navbar, section tabs and heading. */
export default function AccountShell({ title, description, children }: AccountShellProps) {
  const router = useRouter();
  const { signedIn, user, expired, setUser, signOut } = useCurrentUser();

  // Signed out, or the session ended on the server: go to login and come back here after
  useEffect(() => {
    if (expired || !isAuthenticated()) router.replace(`/login?redirect=${encodeURIComponent(router.pathname)}`);
  }, [router, expired]);

  return (
    <>
      <Head>
        <title>{`${title} · Falcon`}</title>
      </Head>

      <div className="min-h-screen bg-[#060a0e] text-white">
        <header className="fixed left-4 right-4 top-4 z-[100] rounded-2xl border border-white/[0.08] bg-black/85 backdrop-blur-xl md:left-6 md:right-6 lg:left-8 lg:right-8 xl:left-[5%] xl:right-[5%]">
          <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-5 lg:px-7">
            <button type="button" onClick={() => router.push("/")} className="group flex shrink-0 cursor-pointer items-center gap-2.5">
              <img src="/falcon-logo-white.png" alt="Falcon Logo" className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
              <span className="text-[13px] font-semibold tracking-[0.2em] text-[#f4f1eb]">FALCON</span>
            </button>
            {signedIn && <UserMenu user={user} onSignOut={async () => { await signOut(); router.push("/"); }} />}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[900px] px-5 pb-24 pt-[124px]">
          <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((section) => (
              <button
                key={section.path}
                type="button"
                onClick={() => router.push(section.path)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] transition ${
                  router.pathname === section.path ? "border-white/30 bg-white/[0.10] text-white" : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <section.icon size={13} /> {section.label}
              </button>
            ))}
          </nav>

          <h1 className="mt-8 text-[30px] font-semibold tracking-tight text-[#f4f1eb] md:text-[36px]">{title}</h1>
          <p className="mt-2 text-[14px] text-zinc-400">{description}</p>

          <div className="mt-8 space-y-6">{children({ user, setUser })}</div>
        </main>
      </div>
    </>
  );
}

/** A titled card used for each group of settings. */
export function Panel({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0b0f14] p-5 md:p-6">
      <h2 className="text-[15px] font-medium text-white">{title}</h2>
      {hint && <p className="mt-1 text-[12.5px] text-zinc-500">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Inline success or error line shown under a form. */
export function Notice({ kind, children }: { kind: "ok" | "error"; children: ReactNode }) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-lg border px-3.5 py-2.5 text-[12.5px] ${kind === "ok" ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300" : "border-red-500/20 bg-red-500/[0.06] text-red-300"}`}>
      {children}
    </div>
  );
}

export const FIELD = "h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 text-[13.5px] text-white placeholder-zinc-600 outline-none transition focus:border-white/30 disabled:opacity-60";
export const LABEL = "mb-1.5 block text-[12px] text-zinc-400";
export const PRIMARY_BUTTON = "flex h-10 items-center justify-center gap-2 rounded-full bg-[#f4f1eb] px-5 text-[13px] font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";
export const SECONDARY_BUTTON = "flex h-10 items-center justify-center gap-2 rounded-full border border-white/[0.12] px-5 text-[13px] text-zinc-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50";
