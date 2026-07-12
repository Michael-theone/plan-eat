import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: image,
            mimeType: mediaType,
          },
        },
        `Identify the food in this photo and estimate its nutrition. Respond with ONLY raw JSON, no markdown, no code fences, in exactly this shape:
{"name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number, "sugar": number, "confidence": "high" | "medium" | "low"}
All values besides name/confidence are grams, except calories which is kcal. These are rough estimates for a home nutrition app, not medical advice. If the image isn't food, set "name" to "Not food".`,
      ],
    });

    const raw = response.text ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Could not analyze that image" }, { status: 500 });
  }
}