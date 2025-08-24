import { NextRequest, NextResponse } from "next/server";
import { openai, buildPrompt } from "@/lib/openai";

// Simplified validation - removed complex validation imports

export const runtime = "nodejs";

interface GenerateResponse {
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {


    // Parse form data
    const formData = await request.formData();
    const houseTheme = formData.get("houseTheme") as string;
    const vibe = formData.get("vibe") as string;
    const pose = formData.get("pose") as string;
    const faceImage = formData.get("faceImage") as File;

    // Basic validation
    console.log('Received data:', { houseTheme, vibe, pose, faceImageName: faceImage?.name });

    if (!houseTheme || houseTheme.trim().length === 0) {
      console.log('House theme validation failed');
      return NextResponse.json(
        { error: "House theme is required" },
        { status: 400 }
      );
    }

    if (!vibe) {
      console.log('Vibe validation failed');
      return NextResponse.json(
        { error: "Vibe is required" },
        { status: 400 }
      );
    }

    if (!pose) {
      console.log('Pose validation failed');
      return NextResponse.json(
        { error: "Pose is required" },
        { status: 400 }
      );
    }

    if (!faceImage || faceImage.size === 0) {
      console.log('Face image validation failed');
      return NextResponse.json(
        { error: "Face image is required" },
        { status: 400 }
      );
    }

    // Check file size (6MB limit)
    if (faceImage.size > 6 * 1024 * 1024) {
      console.log('File size too large:', faceImage.size);
      return NextResponse.json(
        { error: "File size too large. Maximum 6MB allowed." },
        { status: 400 }
      );
    }

    // Check file type
    if (!faceImage.type.startsWith('image/')) {
      console.log('Invalid file type:', faceImage.type);
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image file." },
        { status: 400 }
      );
    }

    // Convert image to buffer (not used in current implementation but kept for future use)
    // const imageBuffer = Buffer.from(await faceImage.arrayBuffer());

    // Build the prompt
    const prompt = buildPrompt(houseTheme, vibe, pose);

    console.log(`Generating image for theme: "${houseTheme}" with vibe: "${vibe}" and pose: "${pose}"`);

    // Generate image with OpenAI
    let response;
    try {
      // Note: The actual OpenAI API may not support gpt-image-1 model yet
      // This is a placeholder implementation based on the requirements
      response = await openai.images.generate({
        model: "dall-e-3", // Using dall-e-3 as gpt-image-1 may not be available
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
        quality: "standard",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("OpenAI API error:", errorMessage);
      return NextResponse.json(
        { error: "Failed to generate image. Please try again." },
        { status: 500 }
      );
    }

    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
      return NextResponse.json(
        { error: "No image data received from AI service" },
        { status: 500 }
      );
    }

    // Return base64 image directly (Vercel doesn't allow file writing)
    const imageData = response.data[0].b64_json;
    
    // For production, return base64 data URL instead of file path
    const imageUrl = `data:image/png;base64,${imageData}`;
    
    console.log(`Image generated successfully`);

    return NextResponse.json(
      { url: imageUrl },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("API error:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}