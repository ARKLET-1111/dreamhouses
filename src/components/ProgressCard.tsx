"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ProgressCardProps {
  isVisible: boolean;
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ isVisible, className }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "画像を解析中...",
    "AIがキャラクターを生成中...",
    "家の世界観を構築中...",
    "最終調整中...",
    "完成！"
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
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <CardTitle>イラストを生成中</CardTitle>
        </div>
        <CardDescription>
          AIがあなた専用のアニメ調イラストを作成しています
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-muted-foreground">
              {steps[currentStep]}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <p className="text-sm font-medium">処理中のステップ</p>
          </div>
          <ul className="space-y-1">
            {steps.map((step, index) => (
              <li
                key={index}
                className={`text-xs flex items-center gap-2 ${
                  index < currentStep
                    ? "text-green-600 line-through"
                    : index === currentStep
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    index < currentStep
                      ? "bg-green-600"
                      : index === currentStep
                      ? "bg-primary animate-pulse"
                      : "bg-muted-foreground"
                  }`}
                />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            高品質な画像生成のため、30秒から1分程度かかることがあります
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;