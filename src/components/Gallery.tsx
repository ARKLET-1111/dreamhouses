"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Download, ImageIcon } from "lucide-react";
import { loadGallery, clearGallery, type GalleryItem } from "@/lib/idb";

interface GalleryProps {
  className?: string;
  onRefresh?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ className, onRefresh }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const galleryItems = await loadGallery();
      setItems(galleryItems);
    } catch (error) {
      console.error("Failed to load gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      loadItems();
    }
  }, [onRefresh]);

  const handleClearAll = async () => {
    try {
      await clearGallery();
      setItems([]);
      setShowClearDialog(false);
    } catch (error) {
      console.error("Failed to clear gallery:", error);
    }
  };

  const handleDownload = async (item: GalleryItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `dreamhouse-${item.houseTheme.replace(/[^a-zA-Z0-9]/g, "_")}-${item.createdAt}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            ギャラリー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">読み込み中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                ギャラリー
              </CardTitle>
              <CardDescription>
                最近作成した作品（最大6件）
              </CardDescription>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                すべて削除
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">まだ作品がありません</p>
              <p className="text-sm text-muted-foreground mt-1">
                最初の作品を作成してみましょう！
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-muted rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-square">
                    <img
                      src={item.url}
                      alt={`${item.houseTheme} - ${item.vibe} - ${item.pose}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        保存
                      </Button>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {item.houseTheme}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/80 mt-1">
                      <span>{item.vibe} • {item.pose}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Details Dialog */}
      <AlertDialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>作品詳細</AlertDialogTitle>
            {selectedItem && (
              <AlertDialogDescription>
                {formatDate(selectedItem.createdAt)} に作成
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedItem.url}
                  alt={`${selectedItem.houseTheme} - ${selectedItem.vibe} - ${selectedItem.pose}`}
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/50 p-3 rounded">
                  <p className="font-medium text-muted-foreground">テーマ</p>
                  <p className="text-foreground">{selectedItem.houseTheme}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="font-medium text-muted-foreground">雰囲気</p>
                  <p className="text-foreground">{selectedItem.vibe}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="font-medium text-muted-foreground">ポーズ</p>
                  <p className="text-foreground">{selectedItem.pose}</p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            {selectedItem && (
              <Button
                variant="secondary"
                onClick={() => handleDownload(selectedItem)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                ダウンロード
              </Button>
            )}
            <AlertDialogAction onClick={() => setSelectedItem(null)}>
              閉じる
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>すべての作品を削除</AlertDialogTitle>
            <AlertDialogDescription>
              ギャラリーに保存されているすべての作品を削除します。
              この操作は取り消せません。続行しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Gallery;