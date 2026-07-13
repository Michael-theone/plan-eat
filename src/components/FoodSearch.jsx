// components/FoodSearch.jsx
//
// Styled to match PLATE's existing look (cream cards, terracotta accent,
// pill-shaped buttons) using the same Tailwind utility classes as page.tsx.

'use client';

import { useState, useEffect, useRef } from 'react';

const PRESET_PORTIONS = [0.5, 1, 1.5, 2];

function scale(value, multiplier) {
  return Math.round(value * multiplier * 10) / 10;
}

export default function FoodSearch({ onAddFood }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portions, setPortions] = useState({}); // fdcId -> multiplier
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setResults(data.foods || []);
      } catch (err) {
        setError('Search failed — try again');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce so we're not firing a request on every keystroke

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleAdd(food) {
    const multiplier = portions[food.fdcId] || 1;
    onAddFood({
      name: food.name,
      brand: food.brand,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      portionMultiplier: multiplier,
      calories: scale(food.calories, multiplier),
      protein: scale(food.protein, multiplier),
      carbs: scale(food.carbs, multiplier),
      fat: scale(food.fat, multiplier),
      fiber: scale(food.fiber, multiplier),
      sugar: scale(food.sugar, multiplier),
      sodium: scale(food.sodium, multiplier),
    });
    setQuery('');
    setResults([]);
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a food (e.g. chicken breast)"
        className="w-full rounded-full border border-[#1C1B19]/15 bg-white px-5 py-3 text-sm outline-none focus:border-[#C1440E]"
      />

      {loading && <p className="mt-2 text-xs text-[#1C1B19]/50">Searching…</p>}
      {error && <p className="mt-2 text-xs text-[#C1440E]">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((food) => {
            const multiplier = portions[food.fdcId] || 1;
            return (
              <li
                key={food.fdcId}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#1C1B19]/10 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{food.name}</p>
                  {food.brand && <p className="truncate text-xs text-[#1C1B19]/40">{food.brand}</p>}
                  <p className="mt-1 font-mono text-xs text-[#1C1B19]/60">
                    {scale(food.calories, multiplier)} kcal · P {scale(food.protein, multiplier)}g ·{' '}
                    C {scale(food.carbs, multiplier)}g · F {scale(food.fat, multiplier)}g
                  </p>
                </div>

                <select
                  value={multiplier}
                  onChange={(e) =>
                    setPortions((p) => ({ ...p, [food.fdcId]: parseFloat(e.target.value) }))
                  }
                  className="shrink-0 rounded-full border border-[#1C1B19]/15 bg-white px-2 py-1.5 text-xs"
                >
                  {PRESET_PORTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}x ({Math.round(food.servingSize * p)}{food.servingUnit})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAdd(food)}
                  className="shrink-0 rounded-full bg-[#1C1B19] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#FAF8F4] hover:bg-[#C1440E]"
                >
                  Add
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}