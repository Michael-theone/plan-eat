"use client";

import { Oswald, IBM_Plex_Mono } from "next/font/google";
import type { WeeklyDay } from "@/lib/insights";

const display = Oswald({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function WeeklySummaryCard({
  days,
  avgCalories,
  avgProtein,
  daysHit,
}: {
  days: WeeklyDay[];
  avgCalories: number;
  avgProtein: number;
  daysHit: number;
}) {
  const dayLabel = (dateStr: string) => new Date(dateStr).toLocaleDateString([], { weekday: "short" });

  return (
    <div className="border-4 border-[#1A1A16] p-6">
      <h3 className={`${display.className} text-lg font-semibold`}>This week</h3>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((d) => (
          <div key={d.date} className="flex flex-col items-center">
            <span className={`${mono.className} text-[10px] text-[#8C8577]`}>{dayLabel(d.date)}</span>
            <div
              className={`mt-1 h-10 w-full border-2 border-[#1A1A16] ${
                d.calories === 0 ? "bg-transparent" : d.hitTarget ? "bg-[#6B8E4E]" : "bg-[#E4572E]"
              }`}
              title={`${d.calories} kcal`}
            />
          </div>
        ))}
      </div>
      <div className={`${mono.className} mt-6 grid grid-cols-3 gap-4 text-center text-sm`}>
        <div>
          <div className="text-xl font-bold">{avgCalories}</div>
          <div className="text-[10px] uppercase text-[#8C8577]">Avg kcal</div>
        </div>
        <div>
          <div className="text-xl font-bold">{avgProtein}g</div>
          <div className="text-[10px] uppercase text-[#8C8577]">Avg protein</div>
        </div>
        <div>
          <div className="text-xl font-bold">{daysHit}/7</div>
          <div className="text-[10px] uppercase text-[#8C8577]">Days on target</div>
        </div>
      </div>
    </div>
  );
}