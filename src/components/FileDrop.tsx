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
  const [isConverting, setIsConverting] = useState(false);
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

  // Function to convert HEIC to JPEG
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      setIsConverting(true);
      console.log('Starting HEIC conversion for file:', file.name, 'size:', file.size);
      
      // Dynamic import to avoid SSR issues
      const heic2any = await import('heic2any');
      console.log('heic2any loaded successfully');
      
      // Check if the conversion function exists
      if (!heic2any.default) {
        throw new Error('heic2any library not properly loaded');
      }
      
      console.log('Starting conversion...');
      const convertedBlob = await heic2any.default({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8
      }) as Blob;
      
      console.log('Conversion completed, blob size:', convertedBlob.size);
      
      const convertedFile = new File([convertedBlob], 
        file.name.replace(/\.heic$/i, '.jpg'), 
        { type: "image/jpeg" }
      );
      
      console.log('Converted file created:', convertedFile.name, convertedFile.type);
      return convertedFile;
    } catch (error) {
      console.error('HEIC conversion failed with details:', error);
      throw new Error(`HEICへんかんにしっぱいしました: ${(error as Error).message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileProcess = useCallback(async (file: File) => {
    try {
      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });

      let processedFile = file;

      // Helper: compress image with canvas
      const compressImage = async (
        srcFile: File,
        maxDimension: number = 1600,
        targetMaxBytes: number = 3 * 1024 * 1024,
        initialQuality: number = 0.85
      ): Promise<File> => {
        try {
          const imageBitmap = await createImageBitmap(srcFile);
          const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
          const width = Math.max(1, Math.round(imageBitmap.width * scale));
          const height = Math.max(1, Math.round(imageBitmap.height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return srcFile;
          ctx.drawImage(imageBitmap, 0, 0, width, height);

          let quality = initialQuality;
          let blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
          // Decrease quality until under target or min quality reached
          while (blob && blob.size > targetMaxBytes && quality > 0.55) {
            quality -= 0.1;
            blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
          }
          if (!blob) return srcFile;
          return new File([blob], srcFile.name.replace(/\.(png|webp|jpeg|jpg|heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
        } catch (e) {
          console.warn('Image compression skipped due to error:', e);
          return srcFile;
        }
      };
      
      // More comprehensive HEIC detection
      const isHeicFile = file.type === 'image/heic' || 
                         file.type === 'image/heif' ||
                         file.name.toLowerCase().endsWith('.heic') ||
                         file.name.toLowerCase().endsWith('.heif');
      
      console.log('Is HEIC file?', isHeicFile);
      
      if (isHeicFile) {
        console.log('HEIC file detected, showing user guidance...');
        
        // Show user-friendly guidance for HEIC files
        const userChoice = confirm(
          'HEICふぁいるがせんたくされました。\n\n' +
          '📱 あいふぉんのかたへ：\n' +
          '1. あいふぉんのせってい > かめら > ふぉーまっと を「ごかんせいゆうせん」にへんこう\n' +
          '2. または しゃしんあぷりで「JPEGとしてほぞん」をせんたく\n\n' +
          '🖥️ このままHEICふぁいるをしようすることもできます（すいしょうしません）\n\n' +
          '「OK」でそのまましよう、「キャンセル」でほかのがぞうをせんたく'
        );
        
        if (userChoice) {
          // Try to convert first, if fails use original
          try {
            console.log('Attempting HEIC conversion...');
            processedFile = await convertHeicToJpeg(file);
            console.log('HEIC conversion successful');
          } catch (conversionError) {
            console.log('HEIC conversion failed, using original file:', conversionError);
            processedFile = file; // Use original HEIC file as fallback
            alert('HEICへんかんにしっぱいしましたが、もとのふぁいるをしようします。\nがぞうせいせいで もんだいがはっせいするばあいは、JPEGけいしきのがぞうをおためしください。');
          }
        } else {
          alert('べつのがぞうふぁいる（JPEG、PNG、WebP）をせんたくしてください。');
          return; // Exit without processing
        }
      }
      
      // Compress large files to avoid 413
      if (processedFile.size > 3 * 1024 * 1024) {
        console.log('Compressing large image. Original size (bytes):', processedFile.size);
        processedFile = await compressImage(processedFile);
        console.log('Compressed image size (bytes):', processedFile.size);
      }

      onFileSelect(processedFile);
    } catch (error) {
      console.error('File processing failed:', error);
      alert('ふぁいるのしょりに しっぱいしました: ' + (error as Error).message);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    const imageFile = files.find(file => 
      file.type.startsWith("image/") || 
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif')
    );
    
    if (imageFile) {
      handleFileProcess(imageFile);
    }
  }, [disabled, handleFileProcess]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File input selected:', file ? { name: file.name, type: file.type, size: file.size } : 'No file');
    
    if (file && (file.type.startsWith("image/") || 
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.name.toLowerCase().endsWith('.heif'))) {
      handleFileProcess(file);
    } else if (file) {
      alert('サポートされていないファイル形式です。PNG, JPG, WebP, またはHEICファイルを選択してください。');
    }
  }, [handleFileProcess]);

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
            alt="せんたくされた おかおしゃしん"
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
            <span className="text-sm font-bold text-gray-700">📷 きれいなしゃしんだね！</span>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mt-3 text-center border-2 border-pink-200">
          <p className="text-sm font-bold text-gray-700">
            🎉 {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
          </p>
          <p className="text-xs text-gray-600 mt-1">
            このしゃしんで いらすとをつくるよ！
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
            isConverting ? "text-purple-600" : isDragOver ? "text-pink-600" : "text-gray-700"
          )}>
            {isConverting ? "🔄 HEICけいしきを へんかんちゅう..." : isDragOver ? "📷 しゃしんを ここにおいてね！" : "📸 おかおしゃしんを あっぷろーど"}
          </p>
          <p className="text-sm text-gray-600 font-medium">
            📁 ふぁいるを えらぶか、ここに どらっぐしてね
          </p>
          <div className="bg-white/90 rounded-full px-4 py-2 mx-auto inline-block border-2 border-pink-200">
            <p className="text-xs text-gray-600">
              📱 すいしょう: PNG, JPG, WebP (さいだい3MB)
            </p>
          </div>
          <div className="bg-yellow-100/80 rounded-lg px-3 py-2 mx-auto inline-block border border-yellow-300 mt-2">
            <p className="text-xs text-orange-700 font-medium">
              ⚠️ あいふぉんの HEICけいしきは へんかんが ひつようです
            </p>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.HEIC,.heif,.HEIF"
        onChange={handleFileInput}
        disabled={disabled || isConverting}
        className="hidden"
      />
    </div>
  );
};

export default FileDrop;