import Head from "next/head";
import { useRouter } from "next/router";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import { UserMenu, useCurrentUser } from "@/components/UserMenu";

export default function LibraryPage() {
  const router = useRouter();
  const { signedIn, user, signOut } = useCurrentUser();

  return (
    <>
      <Head>
        <title>Template Library — Falcon</title>
        <meta name="description" content="Browse and search Falcon's library of editable poster, presentation and certificate templates." />
      </Head>

      <div className="relative min-h-screen bg-[#060a0e] text-white">
        <header className="fixed left-4 right-4 top-4 z-[100] rounded-2xl border border-white/[0.08] bg-black/85 backdrop-blur-xl md:left-6 md:right-6 lg:left-8 lg:right-8 xl:left-[5%] xl:right-[5%]">
          <div className="mx-auto flex h-[72px] w-full max-w-[1500px] items-center justify-between gap-3 px-5 lg:px-7">
            <button type="button" onClick={() => router.push("/")} className="group flex shrink-0 cursor-pointer items-center gap-2.5">
              <img src="/falcon-logo-white.png" alt="Falcon Logo" className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
              <span className="text-[13px] font-semibold tracking-[0.2em] text-[#f4f1eb]">FALCON</span>
            </button>
            <nav className="hidden items-center gap-7 lg:flex">
              {[["Templates", "/templates"], ["Library", "/library"], ["Email Templates", "/email-templates"], ["AI Studio", "/ai-studio"], ["My Projects", "/projects"]].map(([label, href]) => (
                <button key={href} type="button" onClick={() => router.push(href)} className={`whitespace-nowrap text-[13px] transition-colors hover:text-white ${href === "/library" ? "text-white" : "text-zinc-500"}`}>{label}</button>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-3">
              {signedIn
                ? <UserMenu user={user} onSignOut={signOut} />
                : <button type="button" onClick={() => router.push("/login?redirect=%2Flibrary")} className="h-10 rounded-full border border-white/[0.12] px-5 text-[13px] text-zinc-300 transition hover:border-white/30 hover:text-white">Log in</button>}
            </div>
          </div>
        </header>


        <main className="mx-auto w-full max-w-[1500px] px-5 pb-24 pt-[124px] lg:px-8">
          <LibraryBrowser />
        </main>
      </div>
    </>
  );
}
