"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Download, RefreshCw, Plus, Share2 } from "lucide-react";

interface ResultCardProps {
  imageUrl: string | null; // final illustration
  characterUrl?: string | null;
  houseUrl?: string | null;
  houseTheme: string;
  vibe: string;
  pose: string;
  isVisible: boolean;
  onRegenerate: () => void;
  onNewGeneration: () => void;
  onSaveToGallery: () => void;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  imageUrl,
  characterUrl,
  houseUrl,
  houseTheme,
  vibe,
  pose,
  isVisible,
  onRegenerate,
  onNewGeneration,
  onSaveToGallery,
  className,
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;

    setIsDownloading(true);
    try {
      if (imageUrl.startsWith('data:image')) {
        // Base64 data URL
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `dreamhouse-${houseTheme.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Regular file URL
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `dreamhouse-${houseTheme.replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl) return;

    setIsSaving(true);
    try {
      await onSaveToGallery();
    } finally {
      setIsSaving(false);
    }
  };

  // const handleShare = () => {
  //   setShowShareDialog(true);
  // };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isVisible || !imageUrl) return null;

  return (
    <>
      <Card className={className}>
        <CardHeader className="text-center">
          <CardTitle>✨ 完成しました！</CardTitle>
          <CardDescription>
            テーマ「{houseTheme}」の世界で{vibe}な雰囲気の{pose}キャラクター
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Trio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Character */}
            {characterUrl && (
              <div className="bg-muted rounded-lg overflow-hidden p-2">
                <p className="text-sm font-medium text-center mb-2">👤 きゃらくたー</p>
                <img
                  src={characterUrl}
                  alt="生成されたキャラクター"
                  className="w-full h-auto max-h-80 object-contain mx-auto"
                  loading="lazy"
                />
              </div>
            )}
            {/* House */}
            {houseUrl && (
              <div className="bg-muted rounded-lg overflow-hidden p-2">
                <p className="text-sm font-medium text-center mb-2">🏠 どりーむはうす</p>
                <img
                  src={houseUrl}
                  alt="生成された家"
                  className="w-full h-auto max-h-80 object-contain mx-auto"
                  loading="lazy"
                />
              </div>
            )}
            {/* Final */}
            <div className="bg-muted rounded-lg overflow-hidden p-2 md:col-span-1">
              <p className="text-sm font-medium text-center mb-2">✨ さいしゅういらすと</p>
              <img
                src={imageUrl}
                alt={`Generated illustration: ${houseTheme} with ${vibe} character doing ${pose}`}
                className="w-full h-auto max-h-80 object-contain mx-auto"
                loading="lazy"
              />
            </div>
          </div>

          {/* Image Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/50 p-3 rounded">
              <p className="font-medium text-muted-foreground">テーマ</p>
              <p className="text-foreground">{houseTheme}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <p className="font-medium text-muted-foreground">雰囲気</p>
              <p className="text-foreground">{vibe}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded">
              <p className="font-medium text-muted-foreground">ポーズ</p>
              <p className="text-foreground">{pose}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "保存中..." : "ダウンロード"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              {isSaving ? "保存中..." : "ギャラリーに保存"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              再生成
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onNewGeneration}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新規作成
            </Button>
          </div>

          {/* Quality Info */}
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  高品質画像生成完了
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  1024×1024ピクセル、アニメ調、商用利用不可
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>作品を共有</AlertDialogTitle>
            <AlertDialogDescription>
              生成した画像の情報をコピーできます
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">設定情報</p>
              <div className="bg-muted p-3 rounded text-sm">
                <p>テーマ: {houseTheme}</p>
                <p>雰囲気: {vibe}</p>
                <p>ポーズ: {pose}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copyToClipboard(`テーマ: ${houseTheme}, 雰囲気: ${vibe}, ポーズ: ${pose}`)}
              >
                設定をコピー
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowShareDialog(false)}>
              閉じる
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ResultCard;