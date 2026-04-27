import { AnalysisResult } from './ImageAnalyzer';
import { Sparkles, Palette } from 'lucide-react';

interface ColorClassificationProps {
  result: AnalysisResult;
}

const seasonInfo = {
  spring: {
    name: '春季型 Spring',
    icon: '🌸',
    description: '明亮溫暖的色彩最適合您',
    characteristics: ['膚色偏黃調或蜜桃色', '眼睛明亮清澈', '髮色偏淺或帶金色調', '整體印象溫暖明亮'],
    style: 'bg-gradient-to-br from-pink-100 via-yellow-50 to-green-50',
    borderColor: 'border-yellow-300',
  },
  summer: {
    name: '夏季型 Summer',
    icon: '🌊',
    description: '柔和優雅的冷色調最襯您',
    characteristics: ['膚色偏粉調或玫瑰色', '眼睛柔和溫潤', '髮色偏冷棕或灰調', '整體印象優雅柔和'],
    style: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
    borderColor: 'border-blue-300',
  },
  autumn: {
    name: '秋季型 Autumn',
    icon: '🍂',
    description: '濃郁溫暖的大地色系最適合',
    characteristics: ['膚色偏金黃或橄欖色', '眼睛深邃溫暖', '髮色偏深棕或紅調', '整體印象成熟穩重'],
    style: 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50',
    borderColor: 'border-orange-400',
  },
  winter: {
    name: '冬季型 Winter',
    icon: '❄️',
    description: '鮮明對比的冷色調最顯氣質',
    characteristics: ['膚色偏白皙或冷調', '眼睛深邃銳利', '髮色偏深黑或冷棕', '整體印象鮮明俐落'],
    style: 'bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50',
    borderColor: 'border-slate-400',
  },
};

export function ColorClassification({ result }: ColorClassificationProps) {
  const info = seasonInfo[result.season];

  return (
    <div className="space-y-6">
      {/* 季節類型卡片 */}
      <div className={`${info.style} ${info.borderColor} border-2 rounded-2xl p-8 shadow-xl`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">{info.icon}</div>
          <div>
            <h2 className="mb-2">{info.name}</h2>
            <p className="text-lg text-muted-foreground">{info.description}</p>
          </div>
        </div>
      </div>

      {/* 特徵分析 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 您的特徵 */}
        <div className="bg-gradient-to-br from-accent/30 to-background rounded-xl p-6 border border-border/50">
          <h3 className="mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            您的特徵
          </h3>
          <ul className="space-y-3">
            {info.characteristics.map((char, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">{char}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 適合色彩 */}
        <div className="bg-gradient-to-br from-accent/30 to-background rounded-xl p-6 border border-border/50">
          <h3 className="mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            適合色彩
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {result.recommendedColors.map((color, index) => (
              <div key={index} className="space-y-2">
                <div
                  className="aspect-square rounded-lg shadow-md border-2 border-white/50 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            這些色彩能襯托您的自然美
          </p>
        </div>
      </div>

      {/* 避免色彩 */}
      <div className="bg-gradient-to-br from-muted/50 to-background rounded-xl p-6 border border-border/30">
        <h3 className="mb-4">建議避免的色彩</h3>
        <div className="flex gap-4 justify-center">
          {result.avoidColors.map((color, index) => (
            <div key={index} className="space-y-2">
              <div
                className="w-16 h-16 rounded-lg shadow-md border-2 border-red-200/50 opacity-60"
                style={{ backgroundColor: color }}
                title={color}
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          這些色彩可能會讓您看起來疲憊或黯淡
        </p>
      </div>
    </div>
  );
}
