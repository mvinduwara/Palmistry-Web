import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const file = formData.get("palmImage") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file received." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Received file: ${file.name} (${buffer.length} bytes)`);

    return NextResponse.json({ 
      success: true, 
      message: "Image successfully received by the backend.",
      filename: file.name,
      size: buffer.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing image upload:", error);
    return NextResponse.json(
      { error: "Internal server error during upload." },
      { status: 500 }
    );
  }
}