import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    // Grab today's actual date (e.g., "Monday, July 12, 2026")
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Tell Gemini to generate a meal specifically for today
    const prompt = `
      Suggest a healthy, high-protein daily meal recommendation for today (${today}).
      Make it a real, delicious meal.
      Return ONLY a valid JSON object in this exact format, with no markdown formatting:
      {
        "name": "Name of the meal",
        "calories": 450,
        "protein": 35,
        "description": "A short, appetizing 1-sentence description of why this is a good choice."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJsonString = responseText.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(cleanJsonString);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Daily Meal Error:", error);
    return NextResponse.json({ error: "Failed to fetch daily meal" }, { status: 500 });
  }
}