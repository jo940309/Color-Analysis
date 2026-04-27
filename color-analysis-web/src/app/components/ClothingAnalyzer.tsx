import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

// 定義分析結果的數據結構
export interface ClothingAnalysisResult {
  isCompatible: boolean; // 是否適合
  compatibilityScore: number; // 適配度分數 (0-100)
  clothingColors: {
    dominant: string; // 主色
    secondary: string; // 次要色
    accent: string; // 強調色
  };
  userColorType: string; // 用戶色彩類型（春、夏、秋、冬）
  reason: string; // 適合/不適合的原因
  recommendations?: {
    // 如果適合，推薦的下著
    bottomWear: Array<{
      type: string; // 類型（長褲、短褲、裙子等）
      color: string; // 推薦顏色
      hexCode: string; // 顏色代碼
      reason: string; // 推薦理由
    }>;
  };
  warnings?: string[]; // 如果不適合，提供警告建議
}

interface ClothingAnalyzerProps {
  clothingImageUrl: string;
  userImageUrl: string; // 用戶的個人照片（用於色彩分析）
  onAnalysisComplete: (result: ClothingAnalysisResult) => void;
}

export function ClothingAnalyzer({
  clothingImageUrl,
  userImageUrl,
  onAnalysisComplete,
}: ClothingAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');

  useEffect(() => {
    analyzeClothing();
  }, []);

  const analyzeClothing = async () => {
    setIsAnalyzing(true);
    setProgress(0);

    // 階段 1: 分析衣服顏色
    setCurrentStage('正在分析衣服色彩...');
    setProgress(20);
    await sleep(1000);

    // ========================================
    // 【後端對接點 1】分析衣服圖片的顏色
    // ========================================
    // API 端點建議: POST /api/analyze-clothing-colors
    // 請求參數: { clothingImage: File 或 base64 string }
    // 返回格式: {
    //   dominant: string,      // 主色的 hex code，例如 "#FF5733"
    //   secondary: string,     // 次要色
    //   accent: string,        // 強調色
    //   colorFamily: string    // 色系名稱，例如 "暖色系"、"冷色系"
    // }
    const clothingColors = await mockAnalyzeClothingColors(clothingImageUrl);

    // 階段 2: 獲取用戶色彩類型
    setCurrentStage('正在獲取您的色彩類型...');
    setProgress(40);
    await sleep(1000);

    // ========================================
    // 【後端對接點 2】獲取用戶的個人色彩類型
    // ========================================
    // API 端點建議: POST /api/get-user-color-type
    // 請求參數: { userImage: File 或 base64 string }
    // 或者如果已經分析過: GET /api/user-color-type?userId=xxx
    // 返回格式: {
    //   colorType: "春季型" | "夏季型" | "秋季型" | "冬季型",
    //   skinTone: string,
    //   temperature: "暖色調" | "冷色調"
    // }
    const userColorType = await mockGetUserColorType(userImageUrl);

    // 階段 3: 配對分析
    setCurrentStage('正在進行配對分析...');
    setProgress(60);
    await sleep(1000);

    // ========================================
    // 【後端對接點 3】配對分析（衣服 vs 用戶色彩）
    // ========================================
    // API 端點建議: POST /api/match-analysis
    // 請求參數: {
    //   clothingColors: { dominant, secondary, accent },
    //   userColorType: string
    // }
    // 返回格式: {
    //   isCompatible: boolean,
    //   compatibilityScore: number,  // 0-100
    //   reason: string
    // }
    const matchResult = await mockMatchAnalysis(clothingColors, userColorType);

    // 階段 4: 生成推薦（如果適合）或警告（如果不適合）
    setCurrentStage('正在生成建議...');
    setProgress(80);
    await sleep(1000);

    let finalResult: ClothingAnalysisResult;

    if (matchResult.isCompatible) {
      // ========================================
      // 【後端對接點 4】生成下著推薦
      // ========================================
      // API 端點建議: POST /api/recommend-bottom-wear
      // 請求參數: {
      //   clothingColors: { dominant, secondary, accent },
      //   userColorType: string
      // }
      // 返回格式: {
      //   recommendations: [
      //     {
      //       type: string,      // "長褲"、"短褲"、"長裙"等
      //       color: string,     // "深藍色"、"卡其色"等
      //       hexCode: string,   // "#2C3E50"
      //       reason: string     // "深藍色能與上衣形成優雅對比"
      //     }
      //   ]
      // }
      const recommendations = await mockGenerateRecommendations(
        clothingColors,
        userColorType
      );

      finalResult = {
        isCompatible: true,
        compatibilityScore: matchResult.compatibilityScore,
        clothingColors,
        userColorType,
        reason: matchResult.reason,
        recommendations: {
          bottomWear: recommendations,
        },
      };
    } else {
      // ========================================
      // 【後端對接點 5】生成不適合的建議
      // ========================================
      // API 端點建議: POST /api/generate-warnings
      // 請求參數: {
      //   clothingColors: { dominant, secondary, accent },
      //   userColorType: string,
      //   reason: string
      // }
      // 返回格式: {
      //   warnings: string[]  // 建議列表
      // }
      const warnings = await mockGenerateWarnings(clothingColors, userColorType);

      finalResult = {
        isCompatible: false,
        compatibilityScore: matchResult.compatibilityScore,
        clothingColors,
        userColorType,
        reason: matchResult.reason,
        warnings,
      };
    }

    // 完成
    setProgress(100);
    setCurrentStage('分析完成！');
    await sleep(500);

    setIsAnalyzing(false);
    onAnalysisComplete(finalResult);
  };

  return (
    <div className="space-y-6">
      {/* 進度條 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{currentStage}</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 分析階段指示 */}
      {isAnalyzing && (
        <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg border border-border/50">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">系統正在分析中，請稍候...</span>
        </div>
      )}
    </div>
  );
}

// ========================================
// 以下是模擬函數，實際使用時請替換為真實 API 調用
// ========================================

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 模擬：分析衣服顏色
async function mockAnalyzeClothingColors(imageUrl: string) {
  // 這裡應該調用後端 API 或圖像分析服務
  // 實際應該使用 AI 視覺模型提取圖片中的主要顏色
  await sleep(500);

  // 模擬返回數據
  const mockColors = [
    { dominant: '#FF6B6B', secondary: '#FFE66D', accent: '#4ECDC4' },
    { dominant: '#2C3E50', secondary: '#34495E', accent: '#95A5A6' },
    { dominant: '#E74C3C', secondary: '#C0392B', accent: '#ECF0F1' },
    { dominant: '#8B4513', secondary: '#D2691E', accent: '#F4A460' },
  ];

  return mockColors[Math.floor(Math.random() * mockColors.length)];
}

// 模擬：獲取用戶色彩類型
async function mockGetUserColorType(imageUrl: string) {
  // 這裡應該從數據庫獲取用戶已分析的色彩類型
  // 或者重新分析用戶照片
  await sleep(500);

  const types = ['春季型', '夏季型', '秋季型', '冬季型'];
  return types[Math.floor(Math.random() * types.length)];
}

// 模擬：配對分析
async function mockMatchAnalysis(
  clothingColors: { dominant: string; secondary: string; accent: string },
  userColorType: string
) {
  // 這裡應該使用配色理論算法判斷適配度
  await sleep(500);

  const isCompatible = Math.random() > 0.4; // 60% 機率適合
  const compatibilityScore = isCompatible
    ? Math.floor(Math.random() * 30) + 70 // 70-100
    : Math.floor(Math.random() * 40) + 30; // 30-70

  const compatibleReasons = [
    '這件衣服的色調與您的膚色非常和諧，能提升整體氣色',
    '色彩溫度與您的個人色彩類型完美匹配',
    '主色調能夠襯托出您的自然美感',
    '這個色系能讓您看起來更加明亮有精神',
  ];

  const incompatibleReasons = [
    '這件衣服的色調與您的膚色有些衝突，可能讓氣色顯得暗沉',
    '色彩溫度與您的個人色彩類型不太協調',
    '主色調可能無法充分展現您的自然美感',
    '這個色系可能讓您看起來較為疲憊',
  ];

  return {
    isCompatible,
    compatibilityScore,
    reason: isCompatible
      ? compatibleReasons[Math.floor(Math.random() * compatibleReasons.length)]
      : incompatibleReasons[
          Math.floor(Math.random() * incompatibleReasons.length)
        ],
  };
}

// 模擬：生成下著推薦
async function mockGenerateRecommendations(
  clothingColors: { dominant: string; secondary: string; accent: string },
  userColorType: string
) {
  // 這裡應該使用配色算法生成推薦
  await sleep(500);

  const recommendations = [
    {
      type: '九分西裝褲',
      color: '深藍色',
      hexCode: '#2C3E50',
      reason: '深藍色能與上衣形成優雅對比，展現專業氣質',
    },
    {
      type: 'A字中長裙',
      color: '米白色',
      hexCode: '#F5F5DC',
      reason: '米白色能中和上衣色彩，營造柔和溫暖的整體感',
    },
    {
      type: '高腰牛仔褲',
      color: '淺藍色',
      hexCode: '#87CEEB',
      reason: '淺藍色與上衣色調協調，打造清新休閒風格',
    },
    {
      type: '鉛筆裙',
      color: '卡其色',
      hexCode: '#C3B091',
      reason: '卡其色能襯托上衣亮點，展現知性優雅',
    },
  ];

  // 隨機返回 3 個推薦
  return recommendations
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
}

// 模擬：生成不適合的警告建議
async function mockGenerateWarnings(
  clothingColors: { dominant: string; secondary: string; accent: string },
  userColorType: string
) {
  // 這裡應該基於配色理論生成建議
  await sleep(500);

  return [
    '建議選擇色調更柔和的衣服，能更好地襯托您的膚色',
    '可以嘗試冷色調的上衣，會更適合您的個人色彩類型',
    '如果一定要穿這件，建議搭配中性色的下著來平衡整體造型',
    '配件可以選擇與您色彩類型相符的顏色來提升整體協調度',
  ];
}
