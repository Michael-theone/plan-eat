// app/api/food-search/route.js
//
// Next.js App Router API route — proxies food search to USDA FoodData Central
// so your API key never reaches the browser, and caches repeat queries.
//
// SETUP:
// 1. Get a free key (instant, no approval wait): https://fdc.nal.usda.gov/api-key-signup.html
// 2. Add to .env.local:      USDA_API_KEY=your_key_here
// 3. Add the same var to your Vercel project's Environment Variables (Settings > Environment Variables)
//
// If your project uses the Pages Router instead of App Router, put this logic in
// pages/api/food-search.js as:
//   export default async function handler(req, res) {
//     const query = req.query.q;
//     ...same logic...
//     res.status(200).json({ foods });
//   }

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

// Simple in-memory cache — resets on cold start, but cuts down on repeat
// calls for common searches (e.g. multiple users searching "chicken breast").
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Standard USDA nutrient IDs. These are stable across USDA's data types
// (Foundation, SR Legacy, Branded) via the /foods/search endpoint, but worth
// double-checking against a live response for your query set since Branded
// Foods entries occasionally omit fields that manufacturers didn't submit.
const NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein: 1003,  // Protein (g)
  fat: 1004,      // Total lipid/fat (g)
  carbs: 1005,    // Carbohydrate, by difference (g)
  sugar: 2000,    // Sugars, total (g)
  fiber: 1079,    // Fiber, total dietary (g)
  sodium: 1093,   // Sodium (mg)
};

function pickNutrient(nutrients, id) {
  const match = nutrients.find((n) => n.nutrientId === id);
  return match ? match.value : 0;
}

function simplifyFood(food) {
  const nutrients = food.foodNutrients || [];
  return {
    fdcId: food.fdcId,
    name: food.description,
    brand: food.brandOwner || food.brandName || null,
    dataType: food.dataType,
    servingSize: food.servingSize || 100,
    servingUnit: food.servingSizeUnit || 'g',
    calories: pickNutrient(nutrients, NUTRIENT_IDS.calories),
    protein: pickNutrient(nutrients, NUTRIENT_IDS.protein),
    carbs: pickNutrient(nutrients, NUTRIENT_IDS.carbs),
    fat: pickNutrient(nutrients, NUTRIENT_IDS.fat),
    fiber: pickNutrient(nutrients, NUTRIENT_IDS.fiber),
    sugar: pickNutrient(nutrients, NUTRIENT_IDS.sugar),
    sodium: pickNutrient(nutrients, NUTRIENT_IDS.sodium),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return Response.json({ foods: [] });
  }

  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return Response.json({ foods: cached.foods });
  }

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'USDA_API_KEY is not configured on the server' },
      { status: 500 }
    );
  }

  const url = new URL(`${USDA_BASE}/foods/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('pageSize', '15');
  url.searchParams.set('dataType', 'Foundation,SR Legacy,Branded');
  url.searchParams.set('api_key', apiKey);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      return Response.json({ error: `USDA API returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const foods = (data.foods || []).map(simplifyFood);

    cache.set(cacheKey, { foods, time: Date.now() });

    return Response.json({ foods });
  } catch (err) {
    return Response.json({ error: 'Food search failed' }, { status: 500 });
  }
}