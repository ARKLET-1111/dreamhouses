"use client";

import React, { useState, useCallback } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Form, { type FormData } from "@/components/Form";
import ProgressCard from "@/components/ProgressCard";
import ResultCard from "@/components/ResultCard";
import Gallery from "@/components/Gallery";
import { saveToGallery } from "@/lib/idb";
import { Home, Sparkles } from "lucide-react";

interface GenerationState {
  isGenerating: boolean;
  result: {
    imageUrl: string;
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

      const response = await fetch("/api/generate", {
        method: "POST",
        body: apiFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.log('API Error:', result);
        throw new Error(result.error || "Failed to generate image");
      }

      if (!result.url) {
        throw new Error("No image URL received");
      }

      setGenerationState({
        isGenerating: false,
        result: {
          imageUrl: result.url,
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

  const handleRegenerate = useCallback(() => {
    if (!generationState.result) return;
    
    // For regeneration, we'll just reset to form since we don't store the original image
    handleNewGeneration();
  }, [generationState.result]);

  const handleNewGeneration = useCallback(() => {
    setGenerationState({
      isGenerating: false,
      result: null,
      error: null,
    });
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Home className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dream House
            </h1>
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            あなたの顔写真を使って、理想の家とキャラクターが織りなす
            <br />
            <span className="text-primary font-semibold">夢のアニメ調イラスト</span>
            を生成します
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mt-6">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              AI画像生成
            </span>
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              アニメ調スタイル
            </span>
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              1024×1024高解像度
            </span>
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
        <footer className="text-center py-8 border-t border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Dream House - AI-Powered Character & House Illustration Generator
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Powered by OpenAI</span>
              <span>•</span>
              <span>Built with Next.js 14</span>
              <span>•</span>
              <span>For Personal Use Only</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>生成エラー</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <div>
                  {generationState.error || "画像の生成中にエラーが発生しました。"}
                </div>
                <div className="mt-4">
                  以下の点を確認してから、もう一度お試しください：
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>インターネット接続が安定していること</li>
                  <li>アップロードした画像が6MB以下であること</li>
                  <li>画像が顔写真であること</li>
                  <li>しばらく時間をおいてから再試行すること</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleErrorDialogClose}>
              閉じる
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
