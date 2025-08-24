import OpenAI from "openai";

// Create OpenAI client with better error handling for Vercel
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "fallback-key-will-fail-gracefully",
});

// Function to check if OpenAI is properly configured
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export const GENERATION_PROMPT_TEMPLATE = `Create a charming anime-style illustration featuring a cute character in front of a {{houseTheme}}. The character should have a {{vibe}} personality and be doing {{pose}}.

Style requirements:
- Japanese anime/manga art style with vibrant colors and soft highlights
- Family-friendly, all-ages appropriate
- High quality digital illustration

Character details:
- Personality: {{vibe}}
- Pose: {{pose}} (with natural hand positions and proper finger count)
- Clothing: Simple, logo-free design  
- Facial features: Large expressive anime eyes, friendly smile

Setting ({{houseTheme}}):
- Detailed architectural elements that clearly represent the theme
- For candy house: gingerbread walls, chocolate roof, candy decorations
- For cloud house: fluffy cloud materials, sky-like elements
- For glass greenhouse: transparent walls, botanical elements
- Warm, soft lighting with gentle shadows

Composition:
- 1792x1024 landscape format (4:3 aspect ratio)
- Full body character with complete house visible
- Character and house positioned to utilize horizontal space
- Foreground, midground, background depth
- No text or logos
- Avoid any real brands or copyrighted characters

Quality: High detail, clean lines, professional anime art quality`;

// Function to analyze face photo using GPT-4 Vision
export async function analyzeFacePhoto(imageBuffer: Buffer, mimeType: string = "image/jpeg"): Promise<string> {
  try {
    console.log('Converting image buffer to base64...');
    const base64Image = imageBuffer.toString('base64');
    console.log('Base64 conversion completed, length:', base64Image.length);
    
    // Determine the correct MIME type
    let imageMimeType = mimeType;
    if (mimeType.includes('heic') || mimeType.includes('heif')) {
      imageMimeType = 'image/jpeg'; // GPT-4 Vision doesn't support HEIC, so we treat as JPEG
    }
    
    console.log('Calling GPT-4o for face analysis with MIME type:', imageMimeType);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この写真の人の特徴を分析して、アニメキャラクター作成のための詳細な説明を日本語で提供してください。髪型、髪色、目の色、肌の色調、顔の形、表情などの特徴を含めて、優しい子供向けのアニメスタイルに適した表現で説明してください。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMimeType};base64,${base64Image}`,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    console.log('GPT-4o response received');
    const result = response.choices[0]?.message?.content || "可愛らしい特徴を持った人";
    console.log('Face analysis result:', result.substring(0, 100) + '...');
    
    return result;
  } catch (error: unknown) {
    const errorObj = error as Record<string, unknown>;
    console.error("Face analysis failed with detailed error:", {
      message: errorObj.message,
      code: errorObj.code,
      type: errorObj.type,
      status: errorObj.status,
      stack: errorObj.stack
    });
    
    // Re-throw the error with more details
    throw new Error(`Face analysis failed: ${errorObj.message || String(error)}`);
  }
}

export const GENERATION_PROMPT_WITH_FACE_TEMPLATE = `Create a charming anime-style illustration featuring a cute character in front of a {{houseTheme}}. The character should have a {{vibe}} personality and be doing {{pose}}.

Character appearance inspired by the reference:
{{faceDescription}}

Style requirements:
- Japanese anime/manga art style with vibrant colors and soft highlights
- Family-friendly, all-ages appropriate content
- High quality digital illustration
- Character should be inspired by the described features but rendered in cute anime style

Character details:
- Personality: {{vibe}}
- Action: {{pose}} (with natural hand positions)
- Clothing: Simple, colorful, logo-free design appropriate for children
- Facial features: Large expressive anime eyes, friendly smile, incorporating elements from the description
- Overall appearance: Cute, approachable anime character inspired by the provided features

Setting ({{houseTheme}}):
- Clear architectural elements representing the theme
- For candy house: gingerbread walls, chocolate roof, candy decorations
- For cloud house: fluffy cloud materials, sky-like elements  
- For flower house: colorful flowers, garden elements
- Warm, inviting lighting with gentle shadows

Composition:
- 1792x1024 landscape format (4:3 aspect ratio)
- Full body character positioned prominently in the scene
- House structure clearly visible and integrated into the background
- Character positioned to utilize the horizontal space effectively
- Bright, cheerful atmosphere with good use of landscape composition
- No text, logos, or brand elements
- Child-friendly and wholesome content

Art quality: Professional anime illustration with clean lines and vibrant colors`;

export function buildPrompt(houseTheme: string, vibe: string, pose: string): string {
  return GENERATION_PROMPT_TEMPLATE
    .replace(/\{\{houseTheme\}\}/g, houseTheme)
    .replace(/\{\{vibe\}\}/g, vibe)
    .replace(/\{\{pose\}\}/g, pose);
}

export function buildPromptWithFace(houseTheme: string, vibe: string, pose: string, faceDescription: string): string {
  return GENERATION_PROMPT_WITH_FACE_TEMPLATE
    .replace(/\{\{houseTheme\}\}/g, houseTheme)
    .replace(/\{\{vibe\}\}/g, vibe)
    .replace(/\{\{pose\}\}/g, pose)
    .replace(/\{\{faceDescription\}\}/g, faceDescription);
}