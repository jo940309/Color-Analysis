import { CheckCircle, XCircle, TrendingUp, AlertTriangle, Shirt, Circle } from 'lucide-react';
import { ClothingAnalysisResult } from './ClothingAnalyzer';

interface ClothingRecommendationProps {
  result: ClothingAnalysisResult;
  clothingImageUrl: string;
}

export function ClothingRecommendation({
  result,
  clothingImageUrl,
}: ClothingRecommendationProps) {
  return (
    <div className="space-y-8">
      {/* 適配度總覽 */}
      <div className="bg-gradient-to-br from-accent/30 to-background rounded-2xl p-8 border border-border/50 shadow-lg">
        <div className="flex items-start gap-6">
          {/* 左側：圖片 */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-primary/30 shadow-md">
              <img
                src={clothingImageUrl}
                alt="分析的衣服"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 右側：分析結果 */}
          <div className="flex-1 space-y-4">
            {/* 適配狀態 */}
            <div className="flex items-center gap-3">
              {result.isCompatible ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="text-green-600 dark:text-green-400">適合您穿著</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      這件衣服與您的個人色彩類型相配
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-orange-500" />
                  <div>
                    <h3 className="text-orange-600 dark:text-orange-400">不太適合</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      這件衣服可能無法充分展現您的魅力
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 適配度分數 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">適配度</span>
                <span className="font-semibold">{result.compatibilityScore}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    result.isCompatible
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : 'bg-gradient-to-r from-orange-500 to-orange-400'
                  }`}
                  style={{ width: `${result.compatibilityScore}%` }}
                />
              </div>
            </div>

            {/* 分析原因 */}
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <p className="text-sm">{result.reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 色彩分析詳情 */}
      <div className="bg-card rounded-xl p-6 border border-border/50 shadow-md">
        <h3 className="mb-4 flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          色彩分析
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 衣服色彩 */}
          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground">衣服色彩組成</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: result.clothingColors.dominant }}
                />
                <div>
                  <p className="text-sm font-medium">主色</p>
                  <p className="text-xs text-muted-foreground">
                    {result.clothingColors.dominant}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: result.clothingColors.secondary }}
                />
                <div>
                  <p className="text-sm font-medium">次要色</p>
                  <p className="text-xs text-muted-foreground">
                    {result.clothingColors.secondary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: result.clothingColors.accent }}
                />
                <div>
                  <p className="text-sm font-medium">強調色</p>
                  <p className="text-xs text-muted-foreground">
                    {result.clothingColors.accent}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 個人色彩類型 */}
          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground">您的色彩類型</h4>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">{result.userColorType}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                根據您的膚色、髮色和眼睛顏色分析得出
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 推薦或警告 */}
      {result.isCompatible && result.recommendations ? (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            推薦下著搭配
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.recommendations.bottomWear.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-card to-accent/20 rounded-xl p-6 border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                {/* 顏色預覽 */}
                <div className="mb-4 flex justify-center">
                  <div
                    className="w-20 h-20 rounded-full border-4 border-background shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: item.hexCode }}
                  />
                </div>

                {/* 推薦信息 */}
                <div className="text-center space-y-2">
                  <h4 className="font-semibold">{item.type}</h4>
                  <p className="text-sm text-muted-foreground">{item.color}</p>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </div>

                {/* Hex Code */}
                <div className="mt-4 text-center">
                  <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-mono">
                    {item.hexCode}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              💡 提示：以上推薦基於色彩理論和您的個人色彩類型，實際搭配效果可能因材質、款式而有所不同
            </p>
          </div>
        </div>
      ) : result.warnings ? (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-6 h-6" />
            穿搭建議
          </h3>

          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 space-y-3">
            {result.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-3">
                <Circle className="w-2 h-2 text-orange-500 mt-2 flex-shrink-0" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  {warning}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-accent/30 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              ℹ️ 雖然這件衣服不是最佳選擇，但透過適當的配件和搭配技巧，仍然可以打造出不錯的造型
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
