import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("palmImage") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert palmist trained specifically in Dr. Narayan Dutt Shrimali's "Practical Palmistry".
      Analyze the provided image of a palm and provide a structured reading.
      
      Look for the following specific Yogs (combinations) if visible:
      - Indra Yog: Naturally developed mount of Mars, full length, straight, clear Head and Fate lines.
      - Shubh Yog: Developed mount of Saturn and clear Fate line on the right hand.
      - Budh Yog: Developed mount of Mercury, bow-marked line from Moon to Mercury.
      - Marut Yog: Fully developed Venus (no obstructing lines), clear Jupiter mount with a cross, straight Moon line.

      Provide the response in the following JSON format ONLY:
      {
        "dominant_mounts": ["list of developed mounts"],
        "line_analysis": "brief description of heart, head, and life lines",
        "identified_yogs": ["list any yogs found from the rules above"],
        "reading_summary": "A 2-sentence summary of the person's traits based on the image."
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
    ]);

    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json\n?|```/g, "").trim();
    const analysisData = JSON.parse(jsonString);

    return NextResponse.json({ 
      success: true, 
      analysis: analysisData 
    }, { status: 200 });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze the palm image." },
      { status: 500 }
    );
  }
}