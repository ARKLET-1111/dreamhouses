"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  isVisible: boolean;
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ isVisible, className }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "📷 お顔写真をAIで分析中...",
    "🧠 あなたの特徴を理解中...",
    "🎨 AIがキャラクターを描いているよ...",
    "🏠 すてきなおうちを建てているよ...",
    "✨ まほうで仕上げているよ...",
    "🎉 完成！"
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    // Simulate progress with realistic timing
    let currentInterval = 0;
    let currentProgressValue = 0;

    const progressInterval = setInterval(() => {
      if (currentProgressValue >= 100) {
        clearInterval(progressInterval);
        return;
      }

      // Calculate target progress for current step
      const targetProgress = ((currentInterval + 1) / steps.length) * 100;
      
      if (currentProgressValue < targetProgress) {
        currentProgressValue = Math.min(currentProgressValue + 2, targetProgress);
        setProgress(currentProgressValue);
      } else {
        // Move to next step
        currentInterval = Math.min(currentInterval + 1, steps.length - 1);
        setCurrentStep(currentInterval);
      }
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Card className={cn("bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-white/70 rounded-3xl overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="animate-spin">
            <Loader2 className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            ✨ まほうをかけているよ ✨
          </CardTitle>
          <div className="animate-bounce">
            🎨
          </div>
        </div>
        <CardDescription className="text-lg text-gray-700 font-medium">
          🤖 AIが あなただけの すてきなイラストを
          <br />
          いっしょうけんめい 作っているよ！
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-2xl border-2 border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-lg font-bold text-gray-700">
                {steps[currentStep]}
              </p>
              <div className="bg-white px-3 py-1 rounded-full border-2 border-purple-300">
                <p className="text-sm font-bold text-purple-600">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
            <Progress value={progress} className="w-full h-4 bg-white/70 rounded-full overflow-hidden" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-100 to-cyan-100 p-6 rounded-2xl border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse" />
            <p className="text-lg font-bold text-gray-700">🔄 進み具合</p>
          </div>
          <ul className="space-y-3">
            {steps.map((step, index) => (
              <li
                key={index}
                className={`text-sm flex items-center gap-3 p-2 rounded-lg transition-all ${
                  index < currentStep
                    ? "text-green-700 bg-green-200/50 line-through"
                    : index === currentStep
                    ? "text-purple-700 bg-purple-200/70 font-bold shadow-md transform scale-105"
                    : "text-gray-500 bg-white/50"
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full transition-all ${
                    index < currentStep
                      ? "bg-green-500"
                      : index === currentStep
                      ? "bg-purple-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center bg-yellow-100/70 p-4 rounded-2xl border-2 border-yellow-200">
          <p className="text-sm text-gray-600 font-medium">
            ⏰ すてきなイラストを作るのに少し時間がかかるよ
            <br />
            📱 待っている間も楽しんでね！
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;