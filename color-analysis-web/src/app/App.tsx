import { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageAnalyzer, AnalysisResult } from './components/ImageAnalyzer';
import { ColorClassification } from './components/ColorClassification';
import { OutfitSimulator } from './components/OutfitSimulator';
import { ProcessFlow } from './components/ProcessFlow';
import { ClothingUploader } from './components/ClothingUploader';
import { ClothingAnalyzer, ClothingAnalysisResult } from './components/ClothingAnalyzer';
import { ClothingRecommendation } from './components/ClothingRecommendation';
import { Sparkles, ArrowRight, User, Shirt } from 'lucide-react';

type Mode = 'personal' | 'clothing';

export default function App() {
  // 模式切換
  const [mode, setMode] = useState<Mode>('personal');

  // 個人色彩診斷狀態
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [analysisStage, setAnalysisStage] = useState<string>('');

  // 衣服配色分析狀態
  const [clothingImageUrl, setClothingImageUrl] = useState<string | null>(null);
  const [clothingAnalysisResult, setClothingAnalysisResult] = useState<ClothingAnalysisResult | null>(null);
  const [clothingStep, setClothingStep] = useState<'upload' | 'analyzing' | 'result'>('upload');

  const handleImageUpload = (file: File, url: string) => {
    setImageUrl(url);
    setCurrentStep('analyzing');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('result');
  };

  const handleAnalysisStageChange = (stage: string) => {
    setAnalysisStage(stage);
  };

  const handleReset = () => {
    setImageUrl(null);
    setAnalysisResult(null);
    setCurrentStep('upload');
    setAnalysisStage('');
  };

  // 衣服配色分析處理函數
  const handleClothingUpload = (file: File, url: string) => {
    setClothingImageUrl(url);
  };

  const handleClothingAnalysis = () => {
    if (!clothingImageUrl) {
      alert('請先上傳衣服圖片');
      return;
    }

    // 檢查是否已完成個人色彩診斷
    if (!imageUrl) {
      alert('請先完成個人色彩診斷，系統才能分析衣服是否適合您');
      return;
    }

    setClothingStep('analyzing');
  };

  const handleClothingAnalysisComplete = (result: ClothingAnalysisResult) => {
    setClothingAnalysisResult(result);
    setClothingStep('result');
  };

  const handleClothingReset = () => {
    setClothingImageUrl(null);
    setClothingAnalysisResult(null);
    setClothingStep('upload');
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    // 切換模式時保留各自的狀態，不重置
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 標題區 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1>個人色彩診斷系統</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            透過影像分析技術，為您精準診斷個人色彩類型，並提供專業的穿搭配色建議
          </p>
        </div>

        {/* 模式切換標籤 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => switchMode('personal')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
                ${mode === 'personal'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">個人色彩診斷</span>
            </button>

            <button
              onClick={() => switchMode('clothing')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300
                ${mode === 'clothing'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Shirt className="w-5 h-5" />
              <span className="font-medium">衣服配色分析</span>
            </button>
          </div>
        </div>

        {/* 個人色彩診斷模式 */}
        {mode === 'personal' && (
          <>
            {/* 步驟指示器 */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  1
                </div>
                <span className="hidden sm:inline">圖片上傳</span>
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground" />

              <div className={`flex items-center gap-2 ${currentStep === 'analyzing' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'analyzing' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  2
                </div>
                <span className="hidden sm:inline">影像分析</span>
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground" />

              <div className={`flex items-center gap-2 ${currentStep === 'result' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'result' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  3
                </div>
                <span className="hidden sm:inline">結果與建議</span>
              </div>
            </div>

            {/* 主要內容區 */}
            <div className="bg-card rounded-2xl shadow-xl p-8 backdrop-blur-sm">
              {currentStep === 'upload' && (
            <div className="space-y-6">
              <ImageUploader onImageUpload={handleImageUpload} />
              <div className="bg-gradient-to-br from-accent/50 to-accent rounded-xl p-6 border border-border/50">
                <h3 className="mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  使用說明
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 請上傳清晰的正面照片，光線充足效果更佳</li>
                  <li>• 建議使用素顏或淡妝照片以獲得更準確的分析</li>
                  <li>• 系統將分析您的膚色特徵並判定個人色彩季節</li>
                  <li>• 根據分析結果提供專屬的穿搭配色建議</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 'analyzing' && imageUrl && (
            <div className="space-y-8">
              {/* 圖片展示 */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-xl" />
                <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-primary/20">
                  <img
                    src={imageUrl}
                    alt="上傳的照片"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* 分析流程展示 */}
              <ProcessFlow currentStage={analysisStage} />

              {/* 影像分析器 */}
              <ImageAnalyzer
                imageUrl={imageUrl}
                onAnalysisComplete={handleAnalysisComplete}
                onStageChange={handleAnalysisStageChange}
              />
            </div>
          )}

          {currentStep === 'result' && analysisResult && imageUrl && (
            <div className="space-y-10">
              {/* 上傳的圖片與分析結果展示 */}
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <h3 className="text-center">您的照片</h3>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl blur-2xl" />
                    <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30">
                      <img
                        src={imageUrl}
                        alt="分析照片"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-center">分析數據</h3>
                  <div className="bg-gradient-to-br from-accent/30 to-background rounded-xl p-6 space-y-4 border border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">膚色色調</span>
                      <span className="font-medium">{analysisResult.skinTone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">明度</span>
                      <span className="font-medium">{analysisResult.brightness}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">飽和度</span>
                      <span className="font-medium">{analysisResult.saturation}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">色溫</span>
                      <span className="font-medium">{analysisResult.temperature}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 色彩分類結果 */}
              <ColorClassification result={analysisResult} />

              {/* 裝飾性分隔線 */}
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-6 text-sm text-muted-foreground">穿搭配色建議</span>
                </div>
              </div>

              {/* 穿搭配色模擬 */}
              <OutfitSimulator result={analysisResult} />

              {/* 重新分析按鈕 */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleReset}
                  className="group relative px-10 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    重新分析
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          )}
            </div>
          </>
        )}

        {/* 衣服配色分析模式 */}
        {mode === 'clothing' && (
          <>
            {/* 步驟指示器 */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className={`flex items-center gap-2 ${clothingStep === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${clothingStep === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  1
                </div>
                <span className="hidden sm:inline">上傳衣服</span>
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground" />

              <div className={`flex items-center gap-2 ${clothingStep === 'analyzing' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${clothingStep === 'analyzing' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  2
                </div>
                <span className="hidden sm:inline">配色分析</span>
              </div>

              <ArrowRight className="w-5 h-5 text-muted-foreground" />

              <div className={`flex items-center gap-2 ${clothingStep === 'result' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${clothingStep === 'result' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  3
                </div>
                <span className="hidden sm:inline">推薦搭配</span>
              </div>
            </div>

            {/* 主要內容區 */}
            <div className="bg-card rounded-2xl shadow-xl p-8 backdrop-blur-sm">
              {clothingStep === 'upload' && (
                <div className="space-y-6">
                  <ClothingUploader onImageUpload={handleClothingUpload} />

                  {clothingImageUrl && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleClothingAnalysis}
                        className="group relative px-10 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          開始分析
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-accent/50 to-accent rounded-xl p-6 border border-border/50">
                    <h3 className="mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      功能說明
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 上傳您想要穿的衣服圖片</li>
                      <li>• 系統會分析衣服色彩與您的個人色彩類型是否匹配</li>
                      <li>• 如果適合，將推薦搭配的下著款式與顏色</li>
                      <li>• 如果不太適合，將提供穿搭建議幫助您優化造型</li>
                      <li className="pt-2 border-t border-border/50 text-primary">
                        ⚠️ 請先完成「個人色彩診斷」才能使用此功能
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {clothingStep === 'analyzing' && clothingImageUrl && imageUrl && (
                <div className="space-y-8">
                  {/* 顯示正在分析的圖片 */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-center text-sm text-muted-foreground">您的照片</h4>
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/20">
                        <img
                          src={imageUrl}
                          alt="您的照片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-center text-sm text-muted-foreground">衣服圖片</h4>
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/20">
                        <img
                          src={clothingImageUrl}
                          alt="衣服圖片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 分析器 */}
                  <ClothingAnalyzer
                    clothingImageUrl={clothingImageUrl}
                    userImageUrl={imageUrl}
                    onAnalysisComplete={handleClothingAnalysisComplete}
                  />
                </div>
              )}

              {clothingStep === 'result' && clothingAnalysisResult && clothingImageUrl && (
                <div className="space-y-6">
                  <ClothingRecommendation
                    result={clothingAnalysisResult}
                    clothingImageUrl={clothingImageUrl}
                  />

                  {/* 操作按鈕 */}
                  <div className="flex justify-center gap-4 pt-6">
                    <button
                      onClick={handleClothingReset}
                      className="group relative px-10 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Shirt className="w-5 h-5" />
                        分析其他衣服
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 頁尾說明 */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>個人色彩理論將人分為春、夏、秋、冬四種類型</p>
          <p className="mt-1">找到適合自己的色彩，讓穿搭更出色</p>
        </div>
      </div>
    </div>
  );
}
