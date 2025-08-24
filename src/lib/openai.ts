import OpenAI from "openai";

// Create OpenAI client with better error handling for Vercel
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "fallback-key-will-fail-gracefully",
});

// Function to check if OpenAI is properly configured
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// OpenAI Images API の最小限のレスポンス型
type ImageResult = { b64_json?: string; url?: string };

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
export async function generateCharacter(imageBuffer: Buffer, mimeType: string = "image/jpeg"): Promise<string> {
  try {
    console.log('Converting image buffer to base64...');
    const base64Image = imageBuffer.toString('base64');
    console.log('Base64 conversion completed, length:', base64Image.length);
    
    // Determine the correct MIME type
    let imageMimeType = mimeType;
    if (mimeType.includes('heic') || mimeType.includes('heif')) {
      imageMimeType = 'image/jpeg'; // GPT-4 Vision doesn't support HEIC, so we treat as JPEG
    }
    
    // 解析は行わず、写真をそのままアニメ風にスタイライズ
    const imageBlob = new Blob([imageBuffer], { type: imageMimeType });

    console.log('Generating character with gpt-image-1 (edit)...');
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: [imageBlob],
      prompt: `入力された写真の人物を参考に、やさしい手描きアニメ風の魅力的なキャラクターイラストに変換してください。

スタイル要件：
- やわらかい線と水彩タッチの陰影
- 温かみのある色合いで親しみやすい雰囲気
- 顔立ちと雰囲気は写真を尊重しつつ、アニメ調に自然変換
- 全身がわかる構図（服装はシンプルで清潔感のあるデザイン）`,
      size: "1024x1024",
      response_format: "b64_json"
    });

    if (!response.data || !response.data[0]) {
      throw new Error("No data returned from OpenAI API");
    }

    const first = response.data[0] as ImageResult;
    const b64 = first.b64_json;
    const url = first.url;
    if (b64) return `data:image/png;base64,${b64}`;
    if (url) return url;
    throw new Error("No image payload in response");
  } catch (error: unknown) {
    const errorObj = error as Record<string, unknown>;
    console.error("Character generation failed with detailed error:", {
      message: errorObj.message,
      code: errorObj.code,
      type: errorObj.type,
      status: errorObj.status,
      stack: errorObj.stack
    });
    
    // Re-throw the error with more details
    throw new Error(`Character generation failed: ${errorObj.message || String(error)}`);
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

export async function generateHouse(theme: string): Promise<string> {
  try {
    console.log('Generating dream house...');
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `スタジオジブリ風の魔法のような${theme}を作成してください。温かみがあり、招き入れたくなるような雰囲気を持つ家にしてください。

スタイル要件：
- ジブリ作品らしい建築様式で細部まで丁寧に描写
- 魔法のような要素を自然に取り入れる
- 水彩画のような柔らかなテクスチャと自然な光の表現
- 小さな物語を感じさせる環境の細部描写
- 建物全体がはっきりと見える構図`,
      size: "1024x1024",
      response_format: "b64_json"
    });

    if (!response.data || !response.data[0]) {
      throw new Error("No data returned from OpenAI API");
    }
    const first = response.data[0] as ImageResult;
    const b64 = first.b64_json;
    const url = first.url;
    if (b64) return `data:image/png;base64,${b64}`;
    if (url) return url;
    throw new Error("No image payload in response");
  } catch (error: unknown) {
    console.error("House generation failed:", error);
    throw new Error(`House generation failed: ${error}`);
  }
}

export async function generateFinalIllustration(
  characterUrl: string,
  houseUrl: string,
  vibe: string,
  pose: string
): Promise<string> {
  try {
    console.log('Generating final illustration...');
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `キャラクターとドリームハウスを組み合わせた、スタジオジブリ風のイラストを作成してください。キャラクターは${vibe}な性格で、${pose}のポーズをとっています。

スタイル要件：
- キャラクターと家のデザインを自然に調和させる
- ジブリ作品特有の美的センスを維持
- 遠近感のある自然な光の表現`,
      size: "1024x1024",
      response_format: "b64_json"
    });

    if (!response.data || !response.data[0]) {
      throw new Error("No data returned from OpenAI API");
    }
    const first = response.data[0] as ImageResult;
    const b64 = first.b64_json;
    const url = first.url;
    if (b64) return `data:image/png;base64,${b64}`;
    if (url) return url;
    throw new Error("No image payload in response");
  } catch (error: unknown) {
    console.error("Final illustration generation failed:", error);
    throw new Error(`Final illustration generation failed: ${error}`);
  }
}