import OpenAI from "openai";

// Create OpenAI client with better error handling for Vercel
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "fallback-key-will-fail-gracefully",
});

// Function to check if OpenAI is properly configured
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export const GENERATION_PROMPT_TEMPLATE = `Create a charming Studio Ghibli style illustration featuring a whimsical character in front of a {{houseTheme}}. The character should have a {{vibe}} personality and be doing {{pose}}.

Style requirements:
- Studio Ghibli art style with soft, watercolor-like textures and natural lighting
- Hayao Miyazaki's signature aesthetic with attention to environmental details
- Hand-drawn feel with organic, flowing lines
- Warm, earthy color palette with subtle gradients
- Family-friendly, all-ages appropriate
- High quality illustration with painterly details

Character details:
- Personality: {{vibe}}
- Pose: {{pose}} (with natural, fluid movement)
- Clothing: Simple, flowing design with attention to fabric movement and texture
- Facial features: Gentle, realistic proportions with Ghibli-style eyes and warm expression
- Hair: Natural, flowing movement with subtle highlights

Setting ({{houseTheme}}):
- Detailed architectural elements with Ghibli's signature attention to detail
- Rich environmental storytelling with small details and magical elements
- For candy house: whimsical gingerbread architecture with steam rising from chimneys, soft glowing windows
- For cloud house: ethereal cloud formations with floating elements, gentle wisps of vapor
- For glass greenhouse: intricate botanical details, magical plants, dancing light through glass
- Natural lighting with emphasis on atmospheric perspective
- Integration of nature elements: windswept grass, floating leaves, detailed foliage
- Small magical details in the environment (floating lights, tiny creatures)

Composition:
- 1792x1024 landscape format (4:3 aspect ratio)
- Dynamic composition with strong sense of depth and scale
- Character integrated naturally into the environment
- Multiple layers of depth with atmospheric perspective
- Attention to environmental movement (wind effects, floating elements)
- Strong emphasis on the relationship between character and environment
- No text or logos
- Avoid any real brands or copyrighted characters
- Include small background details that tell a story

Quality:
- High detail with Ghibli's signature painterly style
- Soft, watercolor-like textures and color transitions
- Attention to light and shadow with natural gradients
- Hand-drawn feel with organic line quality
- Environmental storytelling through small details
- Magical and whimsical atmosphere typical of Studio Ghibli films`;

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

export const GENERATION_PROMPT_WITH_FACE_TEMPLATE = `Create a charming Studio Ghibli style illustration featuring a whimsical character in front of a {{houseTheme}}. The character should have a {{vibe}} personality and be doing {{pose}}.

Character appearance inspired by the reference:
{{faceDescription}}

Style requirements:
- Studio Ghibli art style with soft, watercolor-like textures and natural lighting
- Hayao Miyazaki's signature aesthetic with attention to environmental details
- Hand-drawn feel with organic, flowing lines
- Warm, earthy color palette with subtle gradients
- Family-friendly, all-ages appropriate
- Character should be inspired by the described features but rendered in Ghibli's realistic yet magical style

Character details:
- Personality: {{vibe}}
- Action: {{pose}} (with natural, fluid movement typical of Ghibli animation)
- Clothing: Simple, flowing design with attention to fabric movement and texture
- Facial features: Gentle, realistic proportions with Ghibli-style eyes and warm expression, incorporating elements from the description
- Hair: Natural, flowing movement with subtle highlights
- Overall appearance: Charming, approachable Ghibli-style character inspired by the provided features

Setting ({{houseTheme}}):
- Detailed architectural elements with Ghibli's signature attention to detail
- Rich environmental storytelling with small details and magical elements
- For candy house: whimsical gingerbread architecture with steam rising from chimneys, soft glowing windows
- For cloud house: ethereal cloud formations with floating elements, gentle wisps of vapor
- For flower house: intricate botanical details, magical plants, dancing light through petals
- Natural lighting with emphasis on atmospheric perspective
- Integration of nature elements: windswept grass, floating leaves, detailed foliage
- Small magical details in the environment (floating lights, tiny creatures)

Composition:
- 1792x1024 landscape format (4:3 aspect ratio)
- Dynamic composition with strong sense of depth and scale
- Character integrated naturally into the environment
- Multiple layers of depth with atmospheric perspective
- Attention to environmental movement (wind effects, floating elements)
- Strong emphasis on the relationship between character and environment
- Ghibli-style perspective and scene composition
- No text, logos, or brand elements
- Child-friendly and wholesome content
- Include small background details that tell a story

Art quality:
- High detail with Ghibli's signature painterly style
- Soft, watercolor-like textures and color transitions
- Attention to light and shadow with natural gradients
- Hand-drawn feel with organic line quality
- Environmental storytelling through small details
- Magical and whimsical atmosphere typical of Studio Ghibli films`;

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