# 衣服配色分析功能 - 後端 API 對接說明

## 📋 概述

這個前端模板已經完整實現了衣服配色分析的 UI 和流程，所有需要對接後端 API 的地方都已用清楚的中文註解標註。

**主要文件位置：**
- 衣服上傳組件：`src/app/components/ClothingUploader.tsx`
- 衣服分析組件：`src/app/components/ClothingAnalyzer.tsx` ⭐ **所有 API 對接點都在這裡**
- 推薦展示組件：`src/app/components/ClothingRecommendation.tsx`
- 主應用程式：`src/app/App.tsx`

---

## 🔌 後端 API 對接點

### 【對接點 1】分析衣服圖片的顏色

**文件位置：** `src/app/components/ClothingAnalyzer.tsx` (約第 60 行)

**建議 API 端點：** `POST /api/analyze-clothing-colors`

**請求參數：**
```typescript
{
  clothingImage: File | string  // 衣服圖片文件或 base64 編碼
}
```

**返回格式：**
```typescript
{
  dominant: string,      // 主色的 hex code，例如 "#FF5733"
  secondary: string,     // 次要色的 hex code
  accent: string,        // 強調色的 hex code
  colorFamily: string    // 色系名稱，例如 "暖色系"、"冷色系"
}
```

**替換方法：**
在 `ClothingAnalyzer.tsx` 中找到 `mockAnalyzeClothingColors` 函數調用的地方，替換為：

```typescript
const response = await fetch('/api/analyze-clothing-colors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clothingImage: clothingImageUrl, // 或轉換為 base64
  }),
});
const clothingColors = await response.json();
```

---

### 【對接點 2】獲取用戶的個人色彩類型

**文件位置：** `src/app/components/ClothingAnalyzer.tsx` (約第 74 行)

**建議 API 端點：** 
- 已分析過：`GET /api/user-color-type?userId={userId}`
- 重新分析：`POST /api/get-user-color-type`

**請求參數（重新分析）：**
```typescript
{
  userImage: File | string  // 用戶照片文件或 base64 編碼
}
```

**返回格式：**
```typescript
{
  colorType: "春季型" | "夏季型" | "秋季型" | "冬季型",
  skinTone: string,        // 膚色描述
  temperature: "暖色調" | "冷色調"
}
```

**替換方法：**
```typescript
const response = await fetch(`/api/user-color-type?userId=${userId}`);
const userColorType = await response.json();
// 或者
const response = await fetch('/api/get-user-color-type', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userImage: userImageUrl,
  }),
});
const data = await response.json();
const userColorType = data.colorType;
```

---

### 【對接點 3】配對分析（衣服 vs 用戶色彩）

**文件位置：** `src/app/components/ClothingAnalyzer.tsx` (約第 88 行)

**建議 API 端點：** `POST /api/match-analysis`

**請求參數：**
```typescript
{
  clothingColors: {
    dominant: string,
    secondary: string,
    accent: string
  },
  userColorType: string  // "春季型"、"夏季型"、"秋季型"、"冬季型"
}
```

**返回格式：**
```typescript
{
  isCompatible: boolean,        // 是否適合
  compatibilityScore: number,   // 適配度分數 (0-100)
  reason: string                // 適合/不適合的原因說明
}
```

**替換方法：**
```typescript
const response = await fetch('/api/match-analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clothingColors,
    userColorType,
  }),
});
const matchResult = await response.json();
```

---

### 【對接點 4】生成下著推薦（如果適合）

**文件位置：** `src/app/components/ClothingAnalyzer.tsx` (約第 110 行)

**建議 API 端點：** `POST /api/recommend-bottom-wear`

**請求參數：**
```typescript
{
  clothingColors: {
    dominant: string,
    secondary: string,
    accent: string
  },
  userColorType: string
}
```

**返回格式：**
```typescript
{
  recommendations: [
    {
      type: string,      // 下著類型："長褲"、"短褲"、"長裙"、"短裙"等
      color: string,     // 顏色名稱："深藍色"、"卡其色"等
      hexCode: string,   // 顏色代碼："#2C3E50"
      reason: string     // 推薦理由："深藍色能與上衣形成優雅對比"
    },
    // ... 更多推薦（建議 3-5 個）
  ]
}
```

**替換方法：**
```typescript
const response = await fetch('/api/recommend-bottom-wear', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clothingColors,
    userColorType,
  }),
});
const data = await response.json();
const recommendations = data.recommendations;
```

---

### 【對接點 5】生成不適合的建議（如果不適合）

**文件位置：** `src/app/components/ClothingAnalyzer.tsx` (約第 133 行)

**建議 API 端點：** `POST /api/generate-warnings`

**請求參數：**
```typescript
{
  clothingColors: {
    dominant: string,
    secondary: string,
    accent: string
  },
  userColorType: string,
  reason: string  // 不適合的原因（從對接點 3 獲得）
}
```

**返回格式：**
```typescript
{
  warnings: string[]  // 建議列表，例如：
  // [
  //   "建議選擇色調更柔和的衣服，能更好地襯托您的膚色",
  //   "可以嘗試冷色調的上衣，會更適合您的個人色彩類型"
  // ]
}
```

**替換方法：**
```typescript
const response = await fetch('/api/generate-warnings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clothingColors,
    userColorType,
    reason: matchResult.reason,
  }),
});
const data = await response.json();
const warnings = data.warnings;
```

---

## 🚀 快速開始

### 步驟 1：找到對接點
所有對接點都在 `src/app/components/ClothingAnalyzer.tsx` 文件中，搜索 `【後端對接點` 即可找到。

### 步驟 2：替換模擬函數
將 `mockAnalyzeClothingColors`、`mockGetUserColorType` 等模擬函數替換為真實的 API 調用。

### 步驟 3：處理錯誤
建議添加錯誤處理：

```typescript
try {
  const response = await fetch('/api/your-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API 錯誤: ${response.status}`);
  }
  
  const result = await response.json();
  // 使用結果...
} catch (error) {
  console.error('API 調用失敗:', error);
  // 顯示錯誤訊息給用戶
  alert('分析失敗，請稍後再試');
}
```

---

## 💡 實作建議

### 1. 圖片處理
- **前端轉 Base64：** 可以在前端將圖片轉換為 base64 字符串再傳給後端
- **直接上傳文件：** 使用 `FormData` 直接上傳圖片文件

Base64 轉換範例：
```typescript
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### 2. 色彩分析技術
後端可以使用以下技術：
- **圖像處理庫：** OpenCV、Pillow (Python)
- **AI 視覺模型：** OpenAI Vision API、Google Cloud Vision API
- **色彩提取：** K-means 聚類算法提取主要顏色

### 3. 配色理論算法
- 實作四季色彩理論（春、夏、秋、冬）
- 色相、明度、飽和度分析
- 色溫判斷（暖色調 vs 冷色調）
- 互補色、類似色計算

---

## 📝 注意事項

1. **CORS 設定：** 確保後端 API 允許前端域名的跨域請求
2. **圖片大小限制：** 前端已限制 10MB，後端也需相應限制
3. **響應時間：** AI 分析可能需要時間，建議設定合理的超時時間
4. **緩存機制：** 用戶的色彩類型分析結果可以緩存，避免重複分析
5. **隱私保護：** 圖片數據應該妥善處理，不應永久儲存用戶照片

---

## 🎨 自定義與擴展

### 添加更多推薦類型
在 `ClothingAnalysisResult` 接口中添加更多字段（在 `ClothingAnalyzer.tsx`）：

```typescript
export interface ClothingAnalysisResult {
  // ... 現有字段
  recommendations?: {
    bottomWear: Array<...>,
    accessories?: Array<...>,  // 新增：配件推薦
    shoes?: Array<...>,        // 新增：鞋子推薦
  };
}
```

### 自定義 UI 樣式
所有組件都使用 Tailwind CSS，可以直接修改類名來調整樣式。

---

## 📧 技術支援

如有任何問題，請查看代碼中的註解或參考此文檔。

**祝您開發順利！** 🎉
