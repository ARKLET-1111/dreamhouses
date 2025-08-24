"use client";

import React, { useCallback, useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileRemove: () => void;
  disabled?: boolean;
  className?: string;
}

const FileDrop: React.FC<FileDropProps> = ({
  onFileSelect,
  selectedFile,
  onFileRemove,
  disabled = false,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when selectedFile changes
  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [selectedFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));
    
    if (imageFile) {
      onFileSelect(imageFile);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileRemove]);

  if (selectedFile && preview) {
    return (
      <div className={cn("relative", className)}>
        <div className="relative w-full h-48 bg-white rounded-2xl overflow-hidden border-4 border-pink-300 shadow-lg">
          <img
            src={preview}
            alt="選択されたお顔写真"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className={cn(
              "absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg",
              "hover:bg-red-600 transition-all transform hover:scale-110",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-bold text-gray-700">📷 きれいな写真だね！</span>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mt-3 text-center border-2 border-pink-200">
          <p className="text-sm font-bold text-gray-700">
            🎉 {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
          </p>
          <p className="text-xs text-gray-600 mt-1">
            この写真でイラストを作るよ！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "w-full h-48 border-4 border-dashed rounded-2xl bg-white/70 backdrop-blur-sm",
          "flex flex-col items-center justify-center gap-4",
          "transition-all cursor-pointer transform hover:scale-105",
          isDragOver && "border-pink-400 bg-pink-100/70 shadow-xl scale-105",
          !isDragOver && "border-pink-300 hover:border-pink-400 shadow-lg",
          disabled && "opacity-50 cursor-not-allowed transform-none"
        )}
      >
        <div className={cn(
          "p-4 rounded-full transition-all",
          isDragOver ? "bg-pink-200 animate-bounce" : "bg-pink-100"
        )}>
          <Upload className={cn(
            "h-12 w-12 transition-colors",
            isDragOver ? "text-pink-600" : "text-pink-500"
          )} />
        </div>
        <div className="text-center space-y-2">
          <p className={cn(
            "text-lg font-bold",
            isDragOver ? "text-pink-600" : "text-gray-700"
          )}>
            {isDragOver ? "📷 写真をここに置いてね！" : "📸 お顔写真をアップロード"}
          </p>
          <p className="text-sm text-gray-600 font-medium">
            📁 ファイルを選ぶか、ここにドラッグしてね
          </p>
          <div className="bg-white/90 rounded-full px-4 py-2 mx-auto inline-block border-2 border-pink-200">
            <p className="text-xs text-gray-600">
              PNG, JPG, WebP (最大6MB)
            </p>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
};

export default FileDrop;