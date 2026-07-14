"use client";

import { IBM_Plex_Mono } from "next/font/google";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

interface DayHit {
  label: string;
  hit: boolean;
}

interface WeeklySummaryCardProps {
  days: DayHit[];
  avgCalories: number;
  avgProtein: number;
  daysHit: number;
}

export default function WeeklySummaryCard({ days, avgCalories, avgProtein, daysHit }: WeeklySummaryCardProps) {
  return (
    <div className="rounded-3xl border-[3px] border-[#251A14] bg-white p-6 shadow-[4px_4px_0_0_#251A14]">
      <p className={`${mono.className} text-[10px] font-bold uppercase tracking-[0.2em] text-[#251A14]/50`}>
        This week
      </p>

      <div className="mt-4 flex justify-between">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-[#251A14]/50">{d.label}</span>
            <span
              className={`h-3.5 w-3.5 rounded-full border-2 border-[#251A14] ${
                d.hit ? "bg-[#8BC34A]" : "bg-white"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xl font-extrabold text-[#251A14]">{avgCalories}</p>
          <p className="text-[10px] font-bold uppercase text-[#251A14]/50">Avg kcal</p>
        </div>
        <div>
          <p className="text-xl font-extrabold text-[#251A14]">{avgProtein}g</p>
          <p className="text-[10px] font-bold uppercase text-[#251A14]/50">Avg protein</p>
        </div>
        <div>
          <p className="text-xl font-extrabold text-[#251A14]">{daysHit}/7</p>
          <p className="text-[10px] font-bold uppercase text-[#251A14]/50">Days on target</p>
        </div>
      </div>
    </div>
  );
}