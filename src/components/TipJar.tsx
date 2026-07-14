"use client";

import { Space_Grotesk } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600"] });

const TIP_LINK = "https://ko-fi.com/michaelboi";

export default function TipJar() {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-[#14161A] p-6 text-center">
      <h3 className={`${display.className} text-base font-semibold text-[#F5F5F3]`}>Like this app?</h3>
      <p className="mt-1 text-sm text-[#F5F5F3]/50">It&apos;s free to use — if it&apos;s helped you, a tip keeps it running.</p>
      <a  
        href={TIP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-gradient-to-r from-[#FF5470] to-[#FF8A5B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-transform hover:scale-105"
      >
        Buy me a coffee
      </a>
    </div>
  );
}