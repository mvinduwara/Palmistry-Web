import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface HistoryMessage {
  sender: 'user' | 'ai';
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, analysis } = await req.json();

    if (!message || !analysis) {
      return NextResponse.json({ error: "Missing required data." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are an expert, empathetic palmist based on Dr. Narayan Dutt Shrimali's "Practical Palmistry".
      You are having a conversation with a user about their specific palm reading.
      
      Here is the data from their recent palm analysis:
      ${JSON.stringify(analysis)}

      Answer their question concisely (2-3 sentences max). 
      You can respond in English or Sinhala depending on the user's language.
      Be encouraging but mysterious. Do not break character.
    `;

    const formattedHistory = history.map((msg: HistoryMessage) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready to read their future." }] },
        ...formattedHistory
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText }, { status: 200 });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "The spirits are quiet right now. Try again." },
      { status: 500 }
    );
  }
}