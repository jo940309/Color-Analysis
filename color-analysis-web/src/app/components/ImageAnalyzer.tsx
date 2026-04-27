import { useEffect, useRef, useState } from 'react';

export interface AnalysisResult {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  skinTone: string;
  brightness: string;
  saturation: string;
  temperature: string;
  recommendedColors: string[];
  avoidColors: string[];
}

interface ImageAnalyzerProps {
  imageUrl: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onStageChange?: (stage: string) => void;
}

export function ImageAnalyzer({ imageUrl, onAnalysisComplete, onStageChange }: ImageAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (imageUrl && !isProcessing) {
      analyzeImage();
    }
  }, [imageUrl]);

  const analyzeImage = async () => {
    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 階段 1: 影像前處理
      onStageChange?.('preprocessing');
      await sleep(1500);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 階段 2: 特徵擷取
      onStageChange?.('extraction');
      await sleep(1500);
      const skinColor = extractSkinColor(imageData);

      // 階段 3: 色彩分類
      onStageChange?.('classification');
      await sleep(1500);
      const result = classifyPersonalColor(skinColor);

      // 階段 4: 配色推薦
      onStageChange?.('recommendation');
      await sleep(1000);

      onAnalysisComplete(result);
    };

    img.src = imageUrl;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const extractSkinColor = (imageData: ImageData): { r: number; g: number; b: number } => {
    const data = imageData.data;
    const centerX = Math.floor(imageData.width / 2);
    const centerY = Math.floor(imageData.height / 3);
    const sampleSize = 50;

    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;

    for (let y = centerY - sampleSize; y < centerY + sampleSize; y++) {
      for (let x = centerX - sampleSize; x < centerX + sampleSize; x++) {
        if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
          const i = (y * imageData.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r > 50 && g > 40 && b > 20 && r > b && Math.abs(r - g) < 50) {
            totalR += r;
            totalG += g;
            totalB += b;
            count++;
          }
        }
      }
    }

    return {
      r: Math.round(totalR / count) || 200,
      g: Math.round(totalG / count) || 170,
      b: Math.round(totalB / count) || 150,
    };
  };

  const classifyPersonalColor = (skinColor: { r: number; g: number; b: number }): AnalysisResult => {
    const { r, g, b } = skinColor;

    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    const warmth = (r - b) / 255;

    let season: 'spring' | 'summer' | 'autumn' | 'winter';
    let skinTone: string;
    let brightnessLevel: string;
    let saturationLevel: string;
    let temperature: string;
    let recommendedColors: string[];
    let avoidColors: string[];

    if (warmth > 0.1 && brightness > 150) {
      season = 'spring';
      skinTone = '偏暖色調';
      temperature = '溫暖';
      recommendedColors = ['#FFE5B4', '#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#FF7F50'];
      avoidColors = ['#000000', '#8B4513', '#2F4F4F'];
    } else if (warmth < -0.05 && brightness > 140) {
      season = 'summer';
      skinTone = '偏冷色調';
      temperature = '冷色';
      recommendedColors = ['#E6E6FA', '#B0C4DE', '#FFB6C1', '#DDA0DD', '#87CEEB', '#F0E68C'];
      avoidColors = ['#000000', '#FF4500', '#8B4513'];
    } else if (warmth > 0.05 && brightness <= 150) {
      season = 'autumn';
      skinTone = '偏暖色調';
      temperature = '溫暖深邃';
      recommendedColors = ['#8B4513', '#D2691E', '#CD853F', '#DAA520', '#556B2F', '#A0522D'];
      avoidColors = ['#000000', '#FF1493', '#00CED1'];
    } else {
      season = 'winter';
      skinTone = '偏冷色調';
      temperature = '冷色鮮明';
      recommendedColors = ['#000000', '#FFFFFF', '#DC143C', '#4169E1', '#8B008B', '#FF1493'];
      avoidColors = ['#D2691E', '#DAA520', '#F0E68C'];
    }

    brightnessLevel = brightness > 150 ? '明亮' : '深沉';
    saturationLevel = saturation > 80 ? '高飽和' : '低飽和';

    return {
      season,
      skinTone,
      brightness: brightnessLevel,
      saturation: saturationLevel,
      temperature,
      recommendedColors,
      avoidColors,
    };
  };

  return <canvas ref={canvasRef} className="hidden" />;
}
