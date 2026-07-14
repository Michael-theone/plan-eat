"use client";

import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function StreakCard({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#14161A] p-6">
      <h3 className={`${mono.className} text-xs font-semibold uppercase tracking-[0.2em] text-[#F5F5F3]/45`}>
        Streak
      </h3>
      <div className="mt-3 flex items-end gap-3">
        <span
          className={`${display.className} bg-gradient-to-r from-[#FF5470] to-[#FF8A5B] bg-clip-text text-5xl font-bold text-transparent`}
        >
          {current}
        </span>
        <span className="mb-1 text-sm text-[#F5F5F3]/60">day{current === 1 ? "" : "s"} in target range</span>
      </div>
      <p className={`${mono.className} mt-2 text-xs text-[#F5F5F3]/40`}>
        Longest streak: {longest} day{longest === 1 ? "" : "s"}
      </p>
      <p className="mt-3 text-[11px] text-[#F5F5F3]/35">
        Counts a day when your logged calories land within 20% of your daily target.
      </p>
    </div>
  );
}