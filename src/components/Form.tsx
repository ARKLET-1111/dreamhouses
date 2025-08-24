"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { type ValidationError } from "@/lib/validation";
import FileDrop from "./FileDrop";

export interface FormData {
  houseTheme: string;
  vibe: string;
  pose: string;
  faceImage: File | null;
  agreed: boolean;
}

interface FormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const Form: React.FC<FormProps> = ({ onSubmit, isLoading, disabled = false }) => {
  const [formData, setFormData] = useState<FormData>({
    houseTheme: "",
    vibe: "",
    pose: "",
    faceImage: null,
    agreed: false,
  });
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors([]);

    // Basic client-side validation
    const newErrors: ValidationError[] = [];
    
    if (!formData.houseTheme.trim()) {
      newErrors.push({ field: "houseTheme", message: "家のテーマを入力してください" });
    }
    
    if (!formData.vibe) {
      newErrors.push({ field: "vibe", message: "キャラクターの雰囲気を選択してください" });
    }
    
    if (!formData.pose) {
      newErrors.push({ field: "pose", message: "ポーズを選択してください" });
    }
    
    if (!formData.faceImage) {
      newErrors.push({ field: "faceImage", message: "お顔写真をアップロードしてください" });
    }
    
    if (!formData.agreed) {
      newErrors.push({ field: "agreed", message: "規約に同意してください" });
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setShowErrorDialog(true);
      return;
    }

    onSubmit(formData);
  };


  const isFormValid = formData.houseTheme.trim() && 
                     formData.vibe && 
                     formData.pose && 
                     formData.faceImage &&
                     formData.agreed;

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-white/70 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 text-center py-8">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            🏗️ まほうの家づくり 🏗️
          </CardTitle>
          <CardDescription className="text-lg text-gray-700 font-medium mt-4">
            📷 あなたのお顔写真で、
            <br />
            🏰 すてきなおうちと可愛いキャラクターを作っちゃおう！
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* House Theme Input */}
            <div className="space-y-3 bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl border-2 border-yellow-200">
              <label htmlFor="houseTheme" className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🏠 どんなおうちを建てたい？ ✨
              </label>
              <Input
                id="houseTheme"
                type="text"
                placeholder="🍭 お菓子の家、☁️ 雲の上の家、🌿 お花の家..."
                value={formData.houseTheme}
                onChange={(e) => setFormData(prev => ({ ...prev, houseTheme: e.target.value }))}
                disabled={isLoading || disabled}
                maxLength={120}
                className={`text-lg rounded-xl border-3 ${getFieldError("houseTheme") ? "border-red-400 bg-red-50" : "border-yellow-300 bg-white"} shadow-lg`}
              />
              {getFieldError("houseTheme") && (
                <p className="text-sm text-red-500 font-bold">😅 {getFieldError("houseTheme")}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  💭 自由に想像してみてね！
                </p>
                <p className="text-sm text-gray-500 bg-white px-2 py-1 rounded-lg">
                  {formData.houseTheme.length}/120文字
                </p>
              </div>
            </div>

            {/* Face Photo Upload */}
            <div className="space-y-3 bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-2xl border-2 border-pink-200">
              <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                📷 あなたのお顔写真をアップロード！
              </label>
              <FileDrop
                onFileSelect={(file) => setFormData(prev => ({ ...prev, faceImage: file }))}
                selectedFile={formData.faceImage}
                onFileRemove={() => setFormData(prev => ({ ...prev, faceImage: null }))}
                disabled={isLoading || disabled}
                className="w-full"
              />
              {getFieldError("faceImage") && (
                <p className="text-sm text-red-500 font-bold">😅 {getFieldError("faceImage")}</p>
              )}
              <div className="bg-yellow-100/70 p-3 rounded-xl border border-yellow-200">
                <p className="text-sm text-gray-600 font-medium text-center">
                  🤖 GPT-4があなたの写真を分析して、そっくりなアニメキャラクターを作るよ！
                </p>
              </div>
            </div>

            {/* Character Description */}
            <div className="space-y-3 bg-gradient-to-r from-cyan-100 to-teal-100 p-6 rounded-2xl border-2 border-cyan-200">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">
                  🎨 AIがあなただけの可愛いキャラクターを作ります！
                </p>
                <p className="text-sm text-gray-600 font-medium mt-2">
                  写真の特徴と選んだ雰囲気・ポーズで、オリジナルキャラクターが完成するよ！
                </p>
              </div>
            </div>

            {/* Character Vibe Selection */}
            <div className="space-y-3 bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-2xl border-2 border-blue-200">
              <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                😄 どんなキャラクターにする？
              </label>
              <Select
                value={formData.vibe}
                onValueChange={(value) => setFormData(prev => ({ ...prev, vibe: value }))}
                disabled={isLoading || disabled}
              >
                <SelectTrigger className={`text-lg rounded-xl ${getFieldError("vibe") ? "border-red-400 bg-red-50" : "border-blue-300 bg-white"} shadow-lg`}>
                  <SelectValue placeholder="🌟 雰囲気を選んでね" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="元気" className="text-lg cursor-pointer hover:bg-yellow-100">😊 元気いっぱい</SelectItem>
                  <SelectItem value="上品" className="text-lg cursor-pointer hover:bg-pink-100">🌸 上品でやさしい</SelectItem>
                  <SelectItem value="クール" className="text-lg cursor-pointer hover:bg-blue-100">😎 かっこいい</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError("vibe") && (
                <p className="text-sm text-red-500 font-bold">😅 {getFieldError("vibe")}</p>
              )}
            </div>

            {/* Pose Selection */}
            <div className="space-y-3 bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-2xl border-2 border-green-200">
              <label className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🙌 どんなポーズにする？
              </label>
              <Select
                value={formData.pose}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pose: value }))}
                disabled={isLoading || disabled}
              >
                <SelectTrigger className={`text-lg rounded-xl ${getFieldError("pose") ? "border-red-400 bg-red-50" : "border-green-300 bg-white"} shadow-lg`}>
                  <SelectValue placeholder="✋ ポーズを選んでね" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="手を振る" className="text-lg cursor-pointer hover:bg-yellow-100">👋 手を振る</SelectItem>
                  <SelectItem value="ピース" className="text-lg cursor-pointer hover:bg-pink-100">✌️ ピース</SelectItem>
                  <SelectItem value="腰に手" className="text-lg cursor-pointer hover:bg-blue-100">🤜 腰に手をあてる</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError("pose") && (
                <p className="text-sm text-red-500 font-bold">😅 {getFieldError("pose")}</p>
              )}
            </div>

            {/* Agreement Checkbox */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-200">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  id="agreed"
                  checked={formData.agreed}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                  disabled={isLoading || disabled}
                  className="mt-2 w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="agreed" className="text-gray-700 font-medium leading-6 cursor-pointer">
                  ✅ <span className="font-bold text-purple-700">おやくそく</span>
                  <br />
                  📷 お顔写真を使ってイラストを作ること、
                  <br />
                  🏠 作った絵は自分だけで楽しむこと、
                  <br />
                  👨‍👩‍👧‍👦 みんなで仲良く使うことに同意します！
                </label>
              </div>
              {getFieldError("agreed") && (
                <p className="text-sm text-red-500 font-bold mt-2">😅 {getFieldError("agreed")}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isLoading || disabled}
                className={`text-2xl font-bold py-4 px-12 rounded-full shadow-xl transform transition-all duration-200 ${
                  !isFormValid || isLoading || disabled 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:scale-110 active:scale-95 animate-pulse"
                }`}
                size="lg"
              >
                {isLoading ? "✨ まほうをかけているよ... ✨" : "🎨 まほうのイラストを作る！ 🌟"}
              </Button>
              {!isFormValid && !isLoading && (
                <p className="text-sm text-gray-500 mt-3">
                  👆 上の項目をすべて入力してね！
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>入力エラー</AlertDialogTitle>
            <AlertDialogDescription>
              以下の項目を確認してください：
              <ul className="mt-2 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    • {error.message}
                  </li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              確認
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Form;