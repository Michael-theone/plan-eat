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
        className="w-full border-b-2 border-[#1A1A16] bg-transparent pb-1 text-lg font-semibold text-[#1A1A16] outline-none focus-visible:border-[#E4572E]"
      />
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {fields.map((f) => (
          <label key={f.key} className="flex items-center justify-between border-b border-[#1A1A16] py-1">
            <span>{f.label}</span>
            <input
              type="number"
              min={0}
              value={value[f.key] as number}
              onChange={(e) => onChange({ ...value, [f.key]: Number(e.target.value) || 0 })}
              className="w-16 bg-transparent text-right outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
}