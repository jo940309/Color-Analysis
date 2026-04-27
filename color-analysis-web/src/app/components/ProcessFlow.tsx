import { Check, Loader2 } from 'lucide-react';

interface ProcessFlowProps {
  currentStage: string;
}

const stages = [
  { id: 'preprocessing', label: '影像前處理', desc: '調整亮度、對比度與色彩平衡' },
  { id: 'extraction', label: '特徵擷取', desc: '分析膚色、明度與飽和度' },
  { id: 'classification', label: '色彩分類', desc: '判定個人色彩季節類型' },
  { id: 'recommendation', label: '配色推薦', desc: '生成專屬穿搭建議' },
];

export function ProcessFlow({ currentStage }: ProcessFlowProps) {
  const getCurrentStageIndex = () => {
    return stages.findIndex((stage) => stage.id === currentStage);
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="bg-gradient-to-br from-accent/30 to-background rounded-xl p-6 border border-border/50">
      <h3 className="mb-6 text-center">分析流程</h3>
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-500 ${
                isCurrent
                  ? 'bg-primary/10 border-2 border-primary/50 shadow-lg scale-105'
                  : isCompleted
                  ? 'bg-accent/50 border border-border/30'
                  : 'bg-muted/30 border border-border/20 opacity-50'
              }`}
            >
              {/* 狀態圖標 */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCurrent && <Loader2 className="w-5 h-5 animate-spin" />}
                {isCompleted && <Check className="w-5 h-5" />}
                {isPending && <span className="text-sm">{index + 1}</span>}
              </div>

              {/* 流程資訊 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`${isCurrent ? 'text-primary' : ''}`}>
                    {stage.label}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                      進行中
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{stage.desc}</p>
              </div>

              {/* 進度指示線 */}
              {index < stages.length - 1 && (
                <div className="absolute left-9 mt-14 w-0.5 h-4 bg-gradient-to-b from-border to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* 整體進度條 */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>分析進度</span>
          <span>{Math.round(((currentIndex + 1) / stages.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
