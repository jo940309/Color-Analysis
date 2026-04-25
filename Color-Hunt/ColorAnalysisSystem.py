import json
import numpy as np
from colormath.color_objects import LabColor, sRGBColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie1976

class ColorAnalysisSystem:
    def __init__(self, json_file='Color-Analysis\\Color-Hunt\\color_palettes.json'):
        # 1. 初始化 12 季型中心座標 (Lab)
        self.pca_centers = {
            "Light Spring":  {"L": 90, "a": 5,  "b": 20},
            "True Spring":   {"L": 70, "a": 25, "b": 45},
            "Bright Spring": {"L": 65, "a": 35, "b": 30},
            "Light Summer":  {"L": 90, "a": -2, "b": -5},
            "True Summer":   {"L": 68, "a": -5, "b": -12},
            "Soft Summer":   {"L": 62, "a": 2,  "b": 2},
            "Soft Autumn":   {"L": 58, "a": 10, "b": 15},
            "True Autumn":   {"L": 50, "a": 20, "b": 40},
            "Dark Autumn":   {"L": 35, "a": 18, "b": 25},
            "Dark Winter":   {"L": 30, "a": 12, "b": -8},
            "True Winter":   {"L": 42, "a": 18, "b": -25},
            "Bright Winter": {"L": 55, "a": 35, "b": -2}
        }
        self.palette_data = self._load_data(json_file)

    def _load_data(self, json_file):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            print("⚠️ 警告：找不到色板資料庫")
            return []

    # --- 核心轉換工具 --- 將 HEX 轉為 Lab 格式
    def hex_to_lab(self, hex_color):
        hex_str = hex_color.strip().lower().lstrip('#')
        rgb = sRGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16), is_upscaled=True)
        return convert_color(rgb, LabColor)

    # --- 功能 1：反向推算（從衣服顏色推季型） ---
    def predict_season(self, garment_hex):    # 衣服顏色 garment_hex
        target_lab = self.hex_to_lab(garment_hex)
        results = []

        for season, coords in self.pca_centers.items():
            center_lab = LabColor(lab_l=coords['L'], lab_a=coords['a'], lab_b=coords['b'])
            # 計算衣服與季節中心點的距離
            diff = delta_e_cie1976(target_lab, center_lab)
            results.append({"season": season, "diff": diff})

        # 按距離排序，最近的代表最符合該季型
        results.sort(key=lambda x: x['diff'])
        return results[0] # 回傳最接近的季型

    # --- 功能 2：判定適不適合（這件衣服適不適合我） ---
    def check_suitability(self, garment_hex, user_season):
        target_lab = self.hex_to_lab(garment_hex)
        s_coords = self.pca_centers.get(user_season)
        
        if not s_coords: return "未知季型"

        center_lab = LabColor(lab_l=s_coords['L'], lab_a=s_coords['a'], lab_b=s_coords['b'])
        # 計算衣服與使用者季型中心點的距離
        diff = delta_e_cie1976(target_lab, center_lab)

        # 設定門檻：E=10 內極佳，E=18 內尚可，以上不建議
        if diff <= 10: return f"🌟 極致適合，完美襯托氣色 (ΔE: {diff:.2f})"
        if diff <= 18: return f"✅ 適合，中規中矩 (ΔE: {diff:.2f})"
        return f"❌ 不太建議，可能顯得臉色暗沉 (ΔE: {diff:.2f})"

    # --- 功能 3：進階搜尋（根據衣服本身屬於的季型找配色） ---
    def find_palettes_by_season(self, season_name, threshold=15, limit=5):
        # 1. 取得季節中心點 (Lab)
        s_coords = self.pca_centers.get(season_name)
        center_lab = LabColor(lab_l=s_coords['L'], lab_a=s_coords['a'], lab_b=s_coords['b'])
        
        matched_palettes = []
        
        # 2. 直接比對，不需要產生相似色集合，速度極快！
        for item in self.palette_data:
            # 檢查色板中是否至少有一個顏色落在 threshold 範圍內
            for color_hex in item['colors']:
                try:
                    c_lab = self.hex_to_lab(color_hex)
                    # 這是你原本邏輯的精髓：只要距離小於 threshold
                    if delta_e_cie1976(center_lab, c_lab) <= threshold:
                        matched_palettes.append({
                            "palette": item,
                            "match_color": color_hex,
                            "delta_e": round(delta_e_cie1976(center_lab, c_lab), 2)
                        })
                        break # 一個色板只需命中一次
                except: continue

        # 3. 排序：先按距離 (delta_e) 由近到遠，再按讚數 (likes)
        # 這樣推薦出來的配色，是「最符合該季節」且「最受歡迎」的
        matched_palettes.sort(key=lambda x: (x['delta_e'], -x['palette']['likes']))
        
        return matched_palettes[:limit]

# ---------- 實際測試執行 ----------
analyzer = ColorAnalysisSystem()

# 情境：使用者拿一件淺奶油色上衣 (#fffbde)
my_shirt = "#fffbde"
my_season = "True Winter"  # 假設使用者已知自己是冬季型

# 1. 系統自動分析這件衣服屬於哪一季
prediction = analyzer.predict_season(my_shirt)
print(f"👕 衣服分析：這件衣服最接近 [{prediction['season']}] (誤差值: {prediction['diff']:.2f})")

# 2. 如果使用者是「冬季型」，這件衣服適合他嗎？
suitability = analyzer.check_suitability(my_shirt, my_season)
print(f"👤 對於 {my_season} 的使用者：{suitability}")

# 3. 推薦配色方案
# # --- A. 如果你想找「跟衣服顏色匹配」的靈感 ---
# print(f"\n✨ 為您推薦「跟這件衣服風格匹配」的配色方案：")
# recom_by_shirt = analyzer.find_palettes_by_season(prediction['season'])

# --- B. 如果你想找「我適合的」購物清單 ---
print(f"\n✨ 為您推薦「適合 {my_season} 季型」的配色方案：")
recom_by_user = analyzer.find_palettes_by_season(my_season)

for i, p in enumerate(recom_by_user, 1):
    palette = p['palette']
    colors_str = ", ".join(palette['colors'])
    print(f"方案 {i} (誤差 {p['delta_e']}): {colors_str} (👍 {palette['likes']:,})")