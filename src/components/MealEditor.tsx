"use client";

import type { ScanResult } from "@/lib/nutrition";

interface MealEditorProps {
  value: Omit<ScanResult, "confidence">;
  onChange: (v: Omit<ScanResult, "confidence">) => void;
}

const FIELDS: { key: keyof Omit<ScanResult, "confidence" | "name">; label: string; suffix: string }[] = [
  { key: "calories", label: "Calories", suffix: "kcal" },
  { key: "protein", label: "Protein", suffix: "g" },
  { key: "carbs", label: "Carbs", suffix: "g" },
  { key: "fiber", label: "Fiber", suffix: "g" },
  { key: "sugar", label: "Sugar", suffix: "g" },
  { key: "fat", label: "Fat", suffix: "g" },
];

export default function MealEditor({ value, onChange }: MealEditorProps) {
  function set<K extends keyof Omit<ScanResult, "confidence">>(key: K, v: Omit<ScanResult, "confidence">[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#251A14]/60">Meal name</span>
        <input
          type="text"
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Grilled chicken bowl"
          className="mt-1 w-full rounded-2xl border-[3px] border-[#251A14] bg-white px-3 py-2 text-sm font-bold text-[#251A14] outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#251A14]/60">{f.label}</span>
            <div className="mt-1 flex items-center rounded-2xl border-[3px] border-[#251A14] bg-white px-3 py-2">
              <input
                type="number"
                min={0}
                value={value[f.key]}
                onFocus={(e) => e.target.select()}
                onChange={(e) => set(f.key, Number(e.target.value) || 0)}
                className="w-full text-sm font-bold text-[#251A14] outline-none"
              />
              <span className="text-[10px] font-bold uppercase text-[#251A14]/40">{f.suffix}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}