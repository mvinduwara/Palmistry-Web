import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysis } = body;

    if (!analysis) {
      return NextResponse.json({ error: "No analysis data provided." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert translator specializing in palmistry. 
      Translate the values of the following JSON object into Sinhala.
      Ensure the terminology is appropriate for traditional palmistry (හස්ත රේඛා විද්‍යාව).
      
      DO NOT change the JSON keys (dominant_mounts, line_analysis, identified_yogs, reading_summary).
      ONLY translate the text strings and array items.
      
      JSON to translate:
      ${JSON.stringify(analysis)}

      Return ONLY the translated JSON object.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonString = responseText.replace(/```json\n?|```/g, "").trim();
    const translatedAnalysis = JSON.parse(jsonString);

    return NextResponse.json({ 
      success: true, 
      translatedAnalysis 
    }, { status: 200 });

  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate the reading." },
      { status: 500 }
    );
  }
}