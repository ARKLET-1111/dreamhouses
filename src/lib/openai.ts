import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const GENERATION_PROMPT_TEMPLATE = `あなたは画像生成のプロフェッショナルです。次の要件を満たす、全年齢向けのアニメ調イラストを1枚生成してください。
- 実在のロゴ・ブランド・著作物・著名キャラクターの模倣は禁止
- 顔・指・手足の破綻を避け、自然なポーズと表情にする
- キャラクターはユーザーの顔写真を参照し、髪型・輪郭・目や眉の形・肌色の特徴を適切に反映

【目的】
ユーザーの顔写真を参照し、本人の特徴を保ったアニメ調キャラクターを描く。
舞台は「{{houseTheme}}」の世界。キャラと家が同一世界観で自然に調和する。

【スタイル/画風】
- 日本のセルルックアニメ風。鮮やかでコントラスト強め、軽いハイライト。全年齢向け。

【テーマ環境（{{houseTheme}}）】
- 家の素材・質感・装飾が一目で伝わる描写。
- 例: お菓子の家 → ビスケットの壁、チョコ屋根、キャンディ窓枠、砂糖の小道、砂糖のきらめき。
- 光源は柔らかな日差し。温かい色温度。

【キャラクター】
- 雰囲気: {{vibe}}。
- ポーズ: {{pose}}（腕や指が途切れない自然な形で、指は5本）。
- 服装: ロゴやブランドは抽象化された無地デザイン。

【画面構成】
- 解像度: 1024×1024（正方形）
- 構図: 全身＋家の全景がわかるフレーミング。前景/中景/後景で奥行きを付与。
- 文字やロゴは入れない。

【品質/禁止事項/補正】
- 顔の非対称や歯・目・手指の破綻を避ける。輪郭のにじみを抑える。
- 実在ブランド・著作物の描写は禁止。
- 仕上げに目のハイライトと髪の立体感を軽く強調。`;

export function buildPrompt(houseTheme: string, vibe: string, pose: string): string {
  return GENERATION_PROMPT_TEMPLATE
    .replace(/\{\{houseTheme\}\}/g, houseTheme)
    .replace(/\{\{vibe\}\}/g, vibe)
    .replace(/\{\{pose\}\}/g, pose);
}