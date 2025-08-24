"use client";

import React, { useState, useCallback } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Form, { type FormData } from "@/components/Form";
import ProgressCard from "@/components/ProgressCard";
import ResultCard from "@/components/ResultCard";
import Gallery from "@/components/Gallery";
import { saveToGallery } from "@/lib/idb";
import { Home, Sparkles } from "lucide-react";

// APIレスポンスの型
interface ApiGenerateResponse {
  url: string;
  characterUrl?: string;
  houseUrl?: string;
  error?: string;
}

function isApiGenerateResponse(value: unknown): value is ApiGenerateResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  // 最低限、url か error のどちらかが文字列なら受け付ける
  const hasUrl = typeof v.url === 'string';
  const hasError = typeof v.error === 'string';
  return hasUrl || hasError;
}

interface GenerationState {
  isGenerating: boolean;
  result: {
    imageUrl: string; // final
    characterUrl?: string;
    houseUrl?: string;
    houseTheme: string;
    vibe: string;
    pose: string;
  } | null;
  error: string | null;
}

export default function HomePage() {
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    result: null,
    error: null,
  });
  
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const handleFormSubmit = useCallback(async (formData: FormData) => {
    if (!formData.faceImage) return;

    setGenerationState({
      isGenerating: true,
      result: null,
      error: null,
    });

    try {
      const apiFormData = new FormData();
      apiFormData.append("houseTheme", formData.houseTheme);
      apiFormData.append("vibe", formData.vibe);
      apiFormData.append("pose", formData.pose);
      apiFormData.append("faceImage", formData.faceImage);
      // 初回生成では両方さいせいせい（A方式）
      apiFormData.append("regenerateCharacter", "true");
      apiFormData.append("regenerateHouse", "true");

      const response = await fetch("/api/generate", {
        method: "POST",
        body: apiFormData,
      });

      // Safely parse response (handle 413 and non-JSON bodies)
      const contentType = response.headers.get('content-type') || '';
      let result: ApiGenerateResponse | null = null;
      if (contentType.includes('application/json')) {
        result = (await response.json()) as ApiGenerateResponse;
      } else {
        const text = await response.text();
        if (!response.ok) {
          if (response.status === 413) {
            throw new Error('がぞうのサイズが大きすぎます (413)。3MB以下に圧縮してからもういちどためしてください。');
          }
          throw new Error(`サーバーエラー: ${response.status} ${text.slice(0, 200)}`);
        }
        try {
          const parsed = JSON.parse(text) as unknown;
          if (!isApiGenerateResponse(parsed)) {
            throw new Error('unexpected response shape');
          }
          result = parsed;
        } catch {
          throw new Error('サーバーから予期しない応答が返りました。しばらくしてからお試しください。');
        }
      }

      if (!response.ok) {
        console.log('API Error:', result);
        throw new Error(result?.error || "Failed to generate image");
      }

      if (!result.url) {
        throw new Error("No image URL received");
      }

      setGenerationState({
        isGenerating: false,
        result: {
          imageUrl: result.url,
          characterUrl: result.characterUrl,
          houseUrl: result.houseUrl,
          houseTheme: formData.houseTheme,
          vibe: formData.vibe,
          pose: formData.pose,
        },
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "生成に失敗しました";
      console.error("Generation failed:", error);
      setGenerationState({
        isGenerating: false,
        result: null,
        error: errorMessage,
      });
      setShowErrorDialog(true);
    }
  }, []);

  const handleNewGeneration = useCallback(() => {
    setGenerationState({
      isGenerating: false,
      result: null,
      error: null,
    });
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!generationState.result) return;
    
    // For regeneration, we'll just reset to form since we don't store the original image
    handleNewGeneration();
  }, [generationState.result, handleNewGeneration]);

  const handleSaveToGallery = useCallback(async () => {
    if (!generationState.result) return;

    try {
      await saveToGallery({
        url: generationState.result.imageUrl,
        houseTheme: generationState.result.houseTheme,
        vibe: generationState.result.vibe,
        pose: generationState.result.pose,
      });
      
      // Trigger gallery refresh
      setGalleryRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Failed to save to gallery:", error);
    }
  }, [generationState.result]);

  const handleErrorDialogClose = useCallback(() => {
    setShowErrorDialog(false);
    setGenerationState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <div className="min-h-screen cute-gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="animate-bounce-cute">
              <Home className="h-16 w-16 text-primary drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg animate-float">
              🏠 どりーむはうす 🌟
            </h1>
            <div className="animate-bounce-cute" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="h-16 w-16 text-yellow-300 drop-shadow-lg" />
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mx-auto max-w-3xl border-4 border-white/50">
            <p className="text-2xl text-gray-700 leading-relaxed font-medium">
              📸 あなたの
              <span className="text-pink-500 font-bold animate-wiggle inline-block">おかおしゃしん</span>
              をつかって、
              <br />
              🏰 りそうのおうちと
              <span className="text-purple-500 font-bold">かわいいきゃらくたー</span>
              の
              <br />
              ✨<span className="text-blue-500 font-bold text-3xl">まほうのいらすと</span>✨
              をつくっちゃおう！
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-3 bg-pink-100 px-4 py-2 rounded-full shadow-lg">
                <div className="h-4 w-4 bg-pink-400 rounded-full animate-pulse" />
                <span className="text-pink-700 font-bold">🤖 えーあいがぞうせいせい</span>
              </div>
              <div className="flex items-center gap-3 bg-blue-100 px-4 py-2 rounded-full shadow-lg">
                <div className="h-4 w-4 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-blue-700 font-bold">🎨 あにめちょう</span>
              </div>
              <div className="flex items-center gap-3 bg-purple-100 px-4 py-2 rounded-full shadow-lg">
                <div className="h-4 w-4 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-purple-700 font-bold">🖼️ こうがしつ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Form Section */}
          {!generationState.result && (
            <Form
              onSubmit={handleFormSubmit}
              isLoading={generationState.isGenerating}
            />
          )}

          {/* Progress Section */}
          <ProgressCard 
            isVisible={generationState.isGenerating}
            className="max-w-2xl mx-auto"
          />

          {/* Result Section */}
          <ResultCard
            imageUrl={generationState.result?.imageUrl || null}
            characterUrl={generationState.result?.characterUrl || null}
            houseUrl={generationState.result?.houseUrl || null}
            houseTheme={generationState.result?.houseTheme || ""}
            vibe={generationState.result?.vibe || ""}
            pose={generationState.result?.pose || ""}
            isVisible={!!generationState.result}
            onRegenerate={handleRegenerate}
            onNewGeneration={handleNewGeneration}
            onSaveToGallery={handleSaveToGallery}
            className="max-w-2xl mx-auto"
          />

          {/* Gallery Section */}
          <Gallery
            className="max-w-6xl mx-auto"
            onRefresh={galleryRefreshKey > 0 ? () => {} : undefined}
            key={galleryRefreshKey}
          />
        </div>

        {/* Footer */}
        <footer className="text-center py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl mx-auto max-w-2xl border-4 border-white/50">
            <div className="space-y-4">
              <p className="text-lg font-bold text-gray-700">
                🌈 どりーむはうす - みんなのまほうのいらすとこうぼう 🎨
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
                <span className="bg-pink-100 px-3 py-1 rounded-full">🤖 OpenAI</span>
                <span className="bg-blue-100 px-3 py-1 rounded-full">⚡ Next.js</span>
                <span className="bg-purple-100 px-3 py-1 rounded-full">👨‍👩‍👧‍👦 おうちでたのしもう</span>
              </div>
              <p className="text-xs text-gray-500">
                つくったえはたいせつにほかんしてね！みんなでたのしくつかおう 💝
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>せいせいえらー</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <div>
                  {generationState.error || "がぞうのせいせいちゅうにえらーがはっせいしました。"}
                </div>
                <div className="mt-4">
                  つぎのところをかくにんしてから、もういちどおためしください：
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>いんたーねっとせつぞくがあんていしていること</li>
                  <li>あっぷろーどしたがぞうが6MBいかであること</li>
                  <li>がぞうがおかおしゃしんであること</li>
                  <li>しばらくじかんをおいてからさいしこうすること</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose}>
              とじる
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
