import { NextRequest, NextResponse } from "next/server";

const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
};

function getNutrient(foodNutrients: any[], id: number) {
  const match = foodNutrients?.find((n) => n.nutrientId === id);
  return match ? Math.round(match.value * 10) / 10 : 0;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ foods: [] });
  }

  const apiKey = process.env.FDC_API_KEY || "IvUiJreDybKdTt6MegzqEgkmybZGrTJM7h6ZKTyb";

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      query
    )}&pageSize=10&dataType=Foundation,SR%20Legacy,Branded&api_key=${apiKey}`;

    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text();
      console.error("FDC search failed", res.status, body);
      return NextResponse.json({ error: "Search failed" }, { status: 502 });
    }

    const data = await res.json();

    const foods = (data.foods || []).map((f: any) => ({
      fdcId: f.fdcId,
      name: f.description,
      brand: f.brandOwner || null,
      servingSize: f.servingSize || 100,
      servingUnit: f.servingSizeUnit || "g",
      calories: getNutrient(f.foodNutrients, NUTRIENT_IDS.calories),
      protein: getNutrient(f.foodNutrients, NUTRIENT_IDS.protein),
      carbs: getNutrient(f.foodNutrients, NUTRIENT_IDS.carbs),
      fat: getNutrient(f.foodNutrients, NUTRIENT_IDS.fat),
      fiber: getNutrient(f.foodNutrients, NUTRIENT_IDS.fiber),
      sugar: getNutrient(f.foodNutrients, NUTRIENT_IDS.sugar),
      sodium: getNutrient(f.foodNutrients, NUTRIENT_IDS.sodium),
    }));

    return NextResponse.json({ foods });
  } catch (err) {
    console.error("FDC search error", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}