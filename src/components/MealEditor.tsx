"use client";

import { IBM_Plex_Mono } from "next/font/google";
import type { ScanResult } from "@/lib/nutrition";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type Editable = Omit<ScanResult, "confidence">;

export default function MealEditor({
  value,
  onChange,
}: {
  value: Editable;
  onChange: (v: Editable) => void;
}) {
  const fields: { key: keyof Editable; label: string }[] = [
    { key: "calories", label: "Calories" },
    { key: "protein", label: "Protein" },
    { key: "carbs", label: "Carbs" },
    { key: "fiber", label: "Fiber" },
    { key: "sugar", label: "Sugar" },
    { key: "fat", label: "Fat" },
  ];

  return (
    <div className={mono.className}>
      <input
        type="text"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Meal name"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-lg font-semibold text-[#F5F5F3] outline-none focus:border-[#8B5CF6]"
      />
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {fields.map((f) => (
          <label key={f.key} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[#F5F5F3]/80">
            <span>{f.label}</span>
            <input
              type="number"
              min={0}
              value={value[f.key] as number}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => onChange({ ...value, [f.key]: Number(e.target.value) || 0 })}
              className="w-16 bg-transparent text-right text-[#F5F5F3] outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
}