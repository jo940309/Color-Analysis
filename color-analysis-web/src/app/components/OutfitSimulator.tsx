import { useState } from 'react';
import { AnalysisResult } from './ImageAnalyzer';
import { Shirt, ShoppingBag, Sparkles, RefreshCw } from 'lucide-react';

interface OutfitSimulatorProps {
  result: AnalysisResult;
}

interface ClothingItem {
  name: string;
  color: string;
  image: string;
  colorName: string;
}

const seasonOutfits = {
  spring: {
    tops: [
      { name: '淺粉襯衫', color: '#FFB6C1', colorName: '粉色系', image: 'https://images.unsplash.com/photo-1732708882444-4785713efd55?w=400' },
      { name: '陽光黃上衣', color: '#FFD700', colorName: '黃色系', image: 'https://images.unsplash.com/photo-1759873821337-792aa4ece229?w=400' },
      { name: '天藍襯衫', color: '#87CEEB', colorName: '藍色系', image: 'https://images.unsplash.com/photo-1627691541764-85b6e9003bec?w=400' },
      { name: '薄荷綠上衣', color: '#98FB98', colorName: '綠色系', image: 'https://images.unsplash.com/photo-1732708877464-6e0aed2b85ea?w=400' },
      { name: '珊瑚橘上衣', color: '#FF7F50', colorName: '橘色系', image: 'https://images.unsplash.com/photo-1732708879303-89304d5ac8dc?w=400' },
      { name: '奶油白襯衫', color: '#FFFACD', colorName: '白色系', image: 'https://images.unsplash.com/photo-1760552069406-cccbcf952a20?w=400' },
    ],
    bottoms: [
      { name: '米白長褲', color: '#F5F5DC', colorName: '米白', image: 'https://images.unsplash.com/photo-1721637222188-fa7bf56ceaf5?w=400' },
      { name: '淺卡其褲', color: '#F0E68C', colorName: '卡其', image: 'https://images.unsplash.com/photo-1696967648017-8a8d41bef9e8?w=400' },
      { name: '淺灰褲', color: '#D3D3D3', colorName: '灰色', image: 'https://images.unsplash.com/photo-1714729382642-59f19c74440e?w=400' },
      { name: '淺藍牛仔褲', color: '#ADD8E6', colorName: '藍色', image: 'https://images.unsplash.com/photo-1721637217881-f0ad35dd4829?w=400' },
    ],
  },
  summer: {
    tops: [
      { name: '薰衣草上衣', color: '#E6E6FA', colorName: '紫色系', image: 'https://images.unsplash.com/photo-1732708879303-89304d5ac8dc?w=400' },
      { name: '粉藍襯衫', color: '#B0C4DE', colorName: '藍色系', image: 'https://images.unsplash.com/photo-1627691541764-85b6e9003bec?w=400' },
      { name: '玫瑰粉上衣', color: '#FFB6C1', colorName: '粉色系', image: 'https://images.unsplash.com/photo-1732708882444-4785713efd55?w=400' },
      { name: '柔和白襯衫', color: '#F8F8FF', colorName: '白色系', image: 'https://images.unsplash.com/photo-1760552069406-cccbcf952a20?w=400' },
      { name: '水藍上衣', color: '#B0E0E6', colorName: '藍色系', image: 'https://images.unsplash.com/photo-1759873821337-792aa4ece229?w=400' },
      { name: '灰藍襯衫', color: '#6B8CA3', colorName: '灰藍', image: 'https://images.unsplash.com/photo-1732708877464-6e0aed2b85ea?w=400' },
    ],
    bottoms: [
      { name: '淺灰長褲', color: '#C0C0C0', colorName: '灰色', image: 'https://images.unsplash.com/photo-1714729382642-59f19c74440e?w=400' },
      { name: '海軍藍褲', color: '#6B8CA3', colorName: '海軍藍', image: 'https://images.unsplash.com/photo-1696967648017-8a8d41bef9e8?w=400' },
      { name: '銀灰褲', color: '#B8B8B8', colorName: '銀灰', image: 'https://images.unsplash.com/photo-1721637222188-fa7bf56ceaf5?w=400' },
      { name: '淺紫灰褲', color: '#C6C3D3', colorName: '紫灰', image: 'https://images.unsplash.com/photo-1721637217881-f0ad35dd4829?w=400' },
    ],
  },
  autumn: {
    tops: [
      { name: '鐵鏽紅上衣', color: '#B7410E', colorName: '紅色系', image: 'https://images.unsplash.com/photo-1767428827759-39faebb8b03d?w=400' },
      { name: '芥末黃襯衫', color: '#DAA520', colorName: '黃色系', image: 'https://images.unsplash.com/photo-1759873821337-792aa4ece229?w=400' },
      { name: '橄欖綠上衣', color: '#556B2F', colorName: '綠色系', image: 'https://images.unsplash.com/photo-1732708877464-6e0aed2b85ea?w=400' },
      { name: '焦糖色襯衫', color: '#D2691E', colorName: '棕色系', image: 'https://images.unsplash.com/photo-1732708879303-89304d5ac8dc?w=400' },
      { name: '深褐色上衣', color: '#8B4513', colorName: '褐色系', image: 'https://images.unsplash.com/photo-1732708880271-fdca396b64b5?w=400' },
      { name: '森林綠上衣', color: '#228B22', colorName: '綠色系', image: 'https://images.unsplash.com/photo-1732708885287-882e2d3bd1d8?w=400' },
    ],
    bottoms: [
      { name: '深棕褲', color: '#654321', colorName: '深棕', image: 'https://images.unsplash.com/photo-1721637222188-fa7bf56ceaf5?w=400' },
      { name: '駝色褲', color: '#C19A6B', colorName: '駝色', image: 'https://images.unsplash.com/photo-1696967648017-8a8d41bef9e8?w=400' },
      { name: '深卡其褲', color: '#BDB76B', colorName: '卡其', image: 'https://images.unsplash.com/photo-1714729382642-59f19c74440e?w=400' },
      { name: '深橄欖褲', color: '#556B2F', colorName: '橄欖', image: 'https://images.unsplash.com/photo-1721637217881-f0ad35dd4829?w=400' },
    ],
  },
  winter: {
    tops: [
      { name: '純白襯衫', color: '#FFFFFF', colorName: '白色系', image: 'https://images.unsplash.com/photo-1760552069406-cccbcf952a20?w=400' },
      { name: '寶藍上衣', color: '#4169E1', colorName: '藍色系', image: 'https://images.unsplash.com/photo-1627691541764-85b6e9003bec?w=400' },
      { name: '深紅襯衫', color: '#DC143C', colorName: '紅色系', image: 'https://images.unsplash.com/photo-1732708882444-4785713efd55?w=400' },
      { name: '洋紅上衣', color: '#FF1493', colorName: '桃紅系', image: 'https://images.unsplash.com/photo-1767428827759-39faebb8b03d?w=400' },
      { name: '鮮紫襯衫', color: '#8B008B', colorName: '紫色系', image: 'https://images.unsplash.com/photo-1732708877464-6e0aed2b85ea?w=400' },
      { name: '純黑上衣', color: '#000000', colorName: '黑色系', image: 'https://images.unsplash.com/photo-1732708879303-89304d5ac8dc?w=400' },
    ],
    bottoms: [
      { name: '純黑褲', color: '#000000', colorName: '黑色', image: 'https://images.unsplash.com/photo-1721637222188-fa7bf56ceaf5?w=400' },
      { name: '深灰褲', color: '#4A4A4A', colorName: '深灰', image: 'https://images.unsplash.com/photo-1714729382642-59f19c74440e?w=400' },
      { name: '海軍藍褲', color: '#000080', colorName: '海軍藍', image: 'https://images.unsplash.com/photo-1696967648017-8a8d41bef9e8?w=400' },
      { name: '酒紅褲', color: '#800020', colorName: '酒紅', image: 'https://images.unsplash.com/photo-1721637217881-f0ad35dd4829?w=400' },
    ],
  },
};

export function OutfitSimulator({ result }: OutfitSimulatorProps) {
  const outfits = seasonOutfits[result.season];
  const [selectedTop, setSelectedTop] = useState<ClothingItem>(outfits.tops[0]);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem>(outfits.bottoms[0]);
  const [viewMode, setViewMode] = useState<'realistic' | 'abstract'>('realistic');

  const getRandomOutfit = () => {
    const randomTop = outfits.tops[Math.floor(Math.random() * outfits.tops.length)];
    const randomBottom = outfits.bottoms[Math.floor(Math.random() * outfits.bottoms.length)];
    setSelectedTop(randomTop);
    setSelectedBottom(randomBottom);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          穿搭配色推薦
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('realistic')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'realistic'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            實物展示
          </button>
          <button
            onClick={() => setViewMode('abstract')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'abstract'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            色彩模擬
          </button>
        </div>
      </div>

      {/* 穿搭預覽區 */}
      <div className="bg-gradient-to-br from-accent/20 to-background rounded-2xl p-8 border border-border/50">
        <div className="flex flex-col items-center gap-6">
          <h3 className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            當前搭配預覽
          </h3>

          {viewMode === 'realistic' ? (
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl">
              {/* 上衣實物 */}
              <div className="space-y-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30">
                  <img
                    src={selectedTop.image}
                    alt={selectedTop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">{selectedTop.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: selectedTop.color }}
                      />
                      <span className="text-white/80 text-xs">{selectedTop.colorName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 下裝實物 */}
              <div className="space-y-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30">
                  <img
                    src={selectedBottom.image}
                    alt={selectedBottom.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm">{selectedBottom.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: selectedBottom.color }}
                      />
                      <span className="text-white/80 text-xs">{selectedBottom.colorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex flex-col items-center gap-2">
                  {/* 頭部 */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br shadow-2xl border-4 border-white/30" />

                  {/* 上衣 */}
                  <div
                    className="w-48 h-40 rounded-t-[3rem] shadow-2xl flex items-center justify-center border-4 border-white/20 relative overflow-hidden"
                    style={{ backgroundColor: selectedTop.color }}
                  >
                    <Shirt className="w-16 h-16 text-white/20" />
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <p className="text-xs text-white/90 font-medium bg-black/20 px-2 py-1 rounded">
                        {selectedTop.colorName}
                      </p>
                    </div>
                  </div>

                  {/* 下裝 */}
                  <div
                    className="w-44 h-48 rounded-b-2xl shadow-2xl border-4 border-white/20 relative overflow-hidden"
                    style={{ backgroundColor: selectedBottom.color }}
                  >
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <p className="text-xs text-white/90 font-medium bg-black/20 px-2 py-1 rounded">
                        {selectedBottom.colorName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={getRandomOutfit}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/80 to-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            隨機搭配
          </button>
        </div>
      </div>

      {/* 上衣選擇區 */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          選擇上衣
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {outfits.tops.map((top, index) => (
            <button
              key={index}
              onClick={() => setSelectedTop(top)}
              className={`group relative aspect-[3/4] rounded-lg overflow-hidden shadow-md transition-all hover:scale-105 hover:shadow-xl ${
                selectedTop.name === top.name
                  ? 'ring-4 ring-primary ring-offset-2 scale-105'
                  : ''
              }`}
            >
              <img
                src={top.image}
                alt={top.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs text-center">{top.name}</p>
                </div>
              </div>
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: top.color }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 下裝選擇區 */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          選擇下裝
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {outfits.bottoms.map((bottom, index) => (
            <button
              key={index}
              onClick={() => setSelectedBottom(bottom)}
              className={`group relative aspect-[3/4] rounded-lg overflow-hidden shadow-md transition-all hover:scale-105 hover:shadow-xl ${
                selectedBottom.name === bottom.name
                  ? 'ring-4 ring-primary ring-offset-2 scale-105'
                  : ''
              }`}
            >
              <img
                src={bottom.image}
                alt={bottom.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs text-center">{bottom.name}</p>
                </div>
              </div>
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: bottom.color }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 配色建議 */}
      <div className="bg-gradient-to-br from-accent/30 to-background rounded-xl p-6 border border-border/50">
        <h3 className="mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          搭配小建議
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>相近色調搭配能營造和諧統一感</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>對比色搭配展現個性與活力</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>全身配色建議不超過3種主色</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>中性色是百搭的基礎選擇</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
