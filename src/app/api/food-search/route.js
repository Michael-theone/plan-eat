// components/FoodSearch.jsx
//
// Styled to match PLATE's dark dashboard look. All search/debounce/API
// logic is unchanged from the original — only className values changed.

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
  const [portions, setPortions] = useState({});
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
    }, 400);

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
        className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-[#F5F5F3] outline-none focus:border-[#8B5CF6]"
      />

      {loading && <p className="mt-2 text-xs text-[#F5F5F3]/45">Searching…</p>}
      {error && <p className="mt-2 text-xs text-[#FF5470]">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((food) => {
            const multiplier = portions[food.fdcId] || 1;
            return (
              <li
                key={food.fdcId}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#14161A] p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#F5F5F3]">{food.name}</p>
                  {food.brand && <p className="truncate text-xs text-[#F5F5F3]/40">{food.brand}</p>}
                  <p className="mt-1 font-mono text-xs text-[#F5F5F3]/55">
                    {scale(food.calories, multiplier)} kcal · P {scale(food.protein, multiplier)}g ·{' '}
                    C {scale(food.carbs, multiplier)}g · F {scale(food.fat, multiplier)}g
                  </p>
                </div>

                <select
                  value={multiplier}
                  onChange={(e) =>
                    setPortions((p) => ({ ...p, [food.fdcId]: parseFloat(e.target.value) }))
                  }
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-[#F5F5F3]"
                >
                  {PRESET_PORTIONS.map((p) => (
                    <option className="bg-[#15171B]" key={p} value={p}>
                      {p}x ({Math.round(food.servingSize * p)}{food.servingUnit})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAdd(food)}
                  className="shrink-0 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF5470] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90"
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