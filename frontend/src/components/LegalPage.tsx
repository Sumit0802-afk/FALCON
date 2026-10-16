import { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

/** The date the privacy policy and terms were last changed */
export const LEGAL_UPDATED = "16 October 2026";
/** Where questions about these pages, and requests about personal data, go */
export const LEGAL_CONTACT = "falconint10@gmail.com";

/** A public page of plain text, such as the privacy policy, readable without signing in. */
export default function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <>
      <Head>
        <title>{`${title} · Falcon`}</title>
        <meta name="description" content={intro} />
      </Head>

      <div className="min-h-screen bg-[#060a0e] text-white">
        <header className="mx-auto flex h-[72px] w-full max-w-[860px] items-center justify-between px-5">
          <Link href="/" className="group flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/falcon-logo-white.png" alt="" className="h-8 w-8 object-contain" />
            <span className="text-[13px] font-semibold tracking-[0.2em] text-[#f4f1eb]">FALCON</span>
          </Link>
          <nav className="flex gap-5 text-[13px] text-zinc-400">
            <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition hover:text-white">Terms</Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[860px] px-5 pb-24 pt-10">
          <h1 className="text-[32px] font-semibold tracking-tight text-[#f4f1eb] md:text-[40px]">{title}</h1>
          <p className="mt-2 text-[13px] text-zinc-500">Last updated {LEGAL_UPDATED}</p>
          <p className="mt-6 text-[15px] leading-relaxed text-zinc-300">{intro}</p>
          <div className="legal mt-10 space-y-10 text-[14.5px] leading-relaxed text-zinc-400 [&_a]:text-cyan-300 [&_a:hover]:underline [&_h2]:mb-3 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-[#f4f1eb] [&_li]:mt-1.5 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-zinc-200 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
