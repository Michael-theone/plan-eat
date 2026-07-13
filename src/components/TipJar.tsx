"use client";

import { Oswald } from "next/font/google";

const display = Oswald({ subsets: ["latin"], weight: ["600"] });

// Swap this once you've made a free Ko-fi or Buy Me a Coffee page.
const TIP_LINK = "https://ko-fi.com/michaelboi";

export default function TipJar() {
  return (
    <div className="border-2 border-dashed border-[#1A1A16] p-6 text-center">
      <h3 className={`${display.className} text-base font-semibold`}>Like this app?</h3>
      <p className="mt-1 text-sm text-[#4A473F]">It&apos;s free to use — if it&apos;s helped you, a tip keeps it running.</p>
<a      
        href={TIP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-sm bg-[#1A1A16] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#FBF8F2] hover:bg-[#E4572E]"
      >
        Buy me a coffee ☕
      </a>
    </div>
  );
}