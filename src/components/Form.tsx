"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import FileDrop from "./FileDrop";
import { type ValidationError } from "@/lib/validation";

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
      newErrors.push({ field: "faceImage", message: "顔写真をアップロードしてください" });
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

  const handleFileSelect = (file: File) => {
    setFormData(prev => ({ ...prev, faceImage: file }));
  };

  const handleFileRemove = () => {
    setFormData(prev => ({ ...prev, faceImage: null }));
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>夢の家を建てよう</CardTitle>
          <CardDescription>
            あなたの顔写真を使って、理想の家とキャラクターのイラストを生成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* House Theme Input */}
            <div className="space-y-2">
              <label htmlFor="houseTheme" className="text-sm font-medium">
                どんな家を建てたいですか？ *
              </label>
              <Input
                id="houseTheme"
                type="text"
                placeholder="例：お菓子の家、雲の上の家、ガラスの温室の家"
                value={formData.houseTheme}
                onChange={(e) => setFormData(prev => ({ ...prev, houseTheme: e.target.value }))}
                disabled={isLoading || disabled}
                maxLength={120}
                className={getFieldError("houseTheme") ? "border-destructive" : ""}
              />
              {getFieldError("houseTheme") && (
                <p className="text-sm text-destructive">{getFieldError("houseTheme")}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.houseTheme.length}/120文字
              </p>
            </div>

            {/* Face Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                顔写真をアップロード *
              </label>
              <FileDrop
                onFileSelect={handleFileSelect}
                selectedFile={formData.faceImage}
                onFileRemove={handleFileRemove}
                disabled={isLoading || disabled}
              />
              {getFieldError("faceImage") && (
                <p className="text-sm text-destructive">{getFieldError("faceImage")}</p>
              )}
            </div>

            {/* Character Vibe Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                キャラクターの雰囲気 *
              </label>
              <Select
                value={formData.vibe}
                onValueChange={(value) => setFormData(prev => ({ ...prev, vibe: value }))}
                disabled={isLoading || disabled}
              >
                <SelectTrigger className={getFieldError("vibe") ? "border-destructive" : ""}>
                  <SelectValue placeholder="雰囲気を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="元気">元気</SelectItem>
                  <SelectItem value="上品">上品</SelectItem>
                  <SelectItem value="クール">クール</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError("vibe") && (
                <p className="text-sm text-destructive">{getFieldError("vibe")}</p>
              )}
            </div>

            {/* Pose Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                ポーズ *
              </label>
              <Select
                value={formData.pose}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pose: value }))}
                disabled={isLoading || disabled}
              >
                <SelectTrigger className={getFieldError("pose") ? "border-destructive" : ""}>
                  <SelectValue placeholder="ポーズを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="手を振る">手を振る</SelectItem>
                  <SelectItem value="ピース">ピース</SelectItem>
                  <SelectItem value="腰に手">腰に手</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError("pose") && (
                <p className="text-sm text-destructive">{getFieldError("pose")}</p>
              )}
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agreed"
                checked={formData.agreed}
                onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                disabled={isLoading || disabled}
                className="mt-1"
              />
              <label htmlFor="agreed" className="text-sm text-muted-foreground leading-5">
                顔写真を用いたイラスト生成であり、公序良俗に反しないことに同意します。
                生成された画像は個人利用のみとし、商用利用や再配布は行いません。 *
              </label>
            </div>
            {getFieldError("agreed") && (
              <p className="text-sm text-destructive">{getFieldError("agreed")}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isLoading || disabled}
              className="w-full"
              size="lg"
            >
              {isLoading ? "生成中..." : "生成する"}
            </Button>
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