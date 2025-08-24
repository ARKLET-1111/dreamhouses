import { NextRequest, NextResponse } from "next/server";
import { openai, buildPromptWithFace, analyzeFacePhoto } from "@/lib/openai";

// Simplified validation - removed complex validation imports

export const runtime = "nodejs";

interface GenerateResponse {
  url?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  console.log('=== API /generate called ===');
  
  try {
    // Check environment variables first
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Failed to parse form data:', error);
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    const houseTheme = formData.get("houseTheme") as string;
    const vibe = formData.get("vibe") as string;
    const pose = formData.get("pose") as string;
    const faceImage = formData.get("faceImage") as File;

    // Basic validation
    console.log('Received data:', { 
      houseTheme, 
      vibe, 
      pose, 
      hasFaceImage: !!faceImage,
      faceImageSize: faceImage?.size || 0,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

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

    // Convert image to buffer for analysis
    const imageBuffer = Buffer.from(await faceImage.arrayBuffer());
    
    console.log('Analyzing face photo with GPT-4 Vision...');
    // Analyze face photo with GPT-4 Vision
    const faceDescription = await analyzeFacePhoto(imageBuffer);
    console.log('Face analysis completed:', faceDescription.substring(0, 100) + '...');

    // Build the prompt with face description
    const prompt = buildPromptWithFace(houseTheme, vibe, pose, faceDescription);

    console.log(`Generating image for theme: "${houseTheme}" with vibe: "${vibe}" and pose: "${pose}"`);

    // Generate image with OpenAI
    console.log('Calling OpenAI API...');
    let response;
    try {
      response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
        quality: "standard",
      });
      console.log('OpenAI API call successful');
    } catch (error: unknown) {
      console.error("OpenAI API error details:", error);
      
      let errorMessage = "Failed to generate image. Please try again.";
      let statusCode = 500;
      
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        
        // Handle specific OpenAI API errors
        if (error.message.includes('insufficient_quota')) {
          errorMessage = "OpenAI API quota exceeded. Please try again later.";
          statusCode = 429;
        } else if (error.message.includes('invalid_request')) {
          errorMessage = "Invalid request to OpenAI API.";
          statusCode = 400;
        } else if (error.message.includes('rate_limit')) {
          errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
          statusCode = 429;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
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