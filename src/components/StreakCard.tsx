"use client";

import { Unbounded, IBM_Plex_Mono } from "next/font/google";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

interface StreakCardProps {
  current: number;
  longest: number;
}

export default function StreakCard({ current, longest }: StreakCardProps) {
  return (
    <div className="rounded-3xl border-[3px] border-[#251A14] bg-white p-6 shadow-[4px_4px_0_0_#251A14]">
      <p className={`${mono.className} text-[10px] font-bold uppercase tracking-[0.2em] text-[#251A14]/50`}>
        Streak
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`${display.className} text-5xl font-extrabold text-[#FF5A5F]`}>{current}</span>
        <span className="text-sm font-semibold text-[#251A14]/70">
          day{current === 1 ? "" : "s"} in target range
        </span>
      </div>
      <p className={`${mono.className} mt-3 text-xs font-semibold text-[#251A14]/60`}>
        Longest streak: {longest} day{longest === 1 ? "" : "s"}
      </p>
      <p className="mt-4 text-xs font-medium text-[#251A14]/50">
        Counts a day when your logged calories land within 20% of your daily target.
      </p>
    </div>
  );
}