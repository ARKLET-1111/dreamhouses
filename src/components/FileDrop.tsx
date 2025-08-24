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
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Selected face"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className={cn(
              "absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full",
              "hover:bg-destructive/90 transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
        </p>
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
          "w-full h-48 border-2 border-dashed rounded-lg",
          "flex flex-col items-center justify-center gap-4",
          "transition-colors cursor-pointer",
          isDragOver && "border-primary bg-primary/5",
          !isDragOver && "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Upload className={cn(
          "h-12 w-12",
          isDragOver ? "text-primary" : "text-muted-foreground"
        )} />
        <div className="text-center">
          <p className={cn(
            "text-sm font-medium",
            isDragOver ? "text-primary" : "text-foreground"
          )}>
            {isDragOver ? "ファイルをドロップ" : "顔写真をアップロード"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WebP (最大6MB)
          </p>
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