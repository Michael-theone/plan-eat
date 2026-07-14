// components/FoodSearch.jsx
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
      <style jsx>{`
        .food-search-input::placeholder {
          color: rgba(37, 26, 20, 0.4);
          font-weight: 600;
        }
      `}</style>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a food (e.g. chicken breast)"
        className="food-search-input w-full rounded-full outline-none"
        style={{
          backgroundColor: '#FFFFFF',
          border: '3px solid #251A14',
          color: '#251A14',
          fontWeight: 700,
          padding: '0.75rem 1.25rem',
          fontSize: '0.9rem',
        }}
      />

      {loading && <p className="mt-2 text-xs font-semibold text-[#251A14]/50">Searching…</p>}
      {error && <p className="mt-2 text-xs font-semibold text-[#FF5A5F]">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((food) => {
            const multiplier = portions[food.fdcId] || 1;
            return (
              <li
                key={food.fdcId}
                className="flex items-center justify-between gap-3 rounded-2xl border-[3px] border-[#251A14] bg-white p-4 shadow-[3px_3px_0_0_#251A14]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold" style={{ color: '#251A14' }}>
                    {food.name}
                  </p>
                  {food.brand && (
                    <p className="truncate text-xs font-semibold" style={{ color: 'rgba(37,26,20,0.45)' }}>
                      {food.brand}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-xs font-semibold" style={{ color: 'rgba(37,26,20,0.65)' }}>
                    {scale(food.calories, multiplier)} kcal · P {scale(food.protein, multiplier)}g ·{' '}
                    C {scale(food.carbs, multiplier)}g · F {scale(food.fat, multiplier)}g
                  </p>
                </div>

                <select
                  value={multiplier}
                  onChange={(e) =>
                    setPortions((p) => ({ ...p, [food.fdcId]: parseFloat(e.target.value) }))
                  }
                  className="shrink-0 rounded-full border-2 border-[#251A14]"
                  style={{ backgroundColor: '#FFF6E9', color: '#251A14', fontWeight: 700, padding: '0.375rem 0.5rem', fontSize: '0.75rem' }}
                >
                  {PRESET_PORTIONS.map((p) => (
                    <option style={{ backgroundColor: '#FFFFFF', color: '#251A14' }} key={p} value={p}>
                      {p}x ({Math.round(food.servingSize * p)}{food.servingUnit})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAdd(food)}
                  className="shrink-0 rounded-full border-[3px] border-[#251A14] bg-[#FF5A5F] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#251A14] shadow-[3px_3px_0_0_#251A14] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#251A14]"
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