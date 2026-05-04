import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Translate the following text into Sinhala (සිංහල).
      Ensure the tone is respectful and suitable for a palmistry context.
      Return ONLY the translated string, with no additional formatting or markdown.
      
      Text to translate: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    return NextResponse.json({ success: true, translatedText }, { status: 200 });

  } catch (error: unknown) {
    console.error("Translation error:", error);
  
    const apiError = error as { status?: number; message?: string };

    if (apiError.status === 429 || apiError.message?.includes("429") || apiError.message?.includes("quota")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before translating again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to translate message." },
      { status: 500 }
    );
  }
}