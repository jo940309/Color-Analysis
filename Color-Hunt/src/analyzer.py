# analyzer.py
import json
from colormath.color_objects import LabColor
from colormath.color_diff import delta_e_cie1976

# 引入拆分出來的模組
from src.constants import SEASON_CENTERS
from src.utils import hex_to_lab

class ColorAnalysisSystem:
    def __init__(self, json_file='Color-Analysis\\Color-Hunt\\data\\color_palettes_all.json'):
        self.pca_centers = SEASON_CENTERS
        self.palette_data = self._load_data(json_file)

    def _load_data(self, json_file):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"警告：找不到色板資料庫 ({json_file})")
            return []
        except json.JSONDecodeError:
            print("警告：JSON 格式錯誤")
            return []

    def predict_season(self, garment_hex):
        target_lab = hex_to_lab(garment_hex) # 使用 utils 的函式
        results = []

        for season, coords in self.pca_centers.items():
            center_lab = LabColor(lab_l=coords['L'], lab_a=coords['a'], lab_b=coords['b'])
            diff = delta_e_cie1976(target_lab, center_lab)
            results.append({"season": season, "diff": diff})

        results.sort(key=lambda x: x['diff'])
        return results[0]

    def check_suitability(self, garment_hex, user_season):
        target_lab = hex_to_lab(garment_hex)
        s_coords = self.pca_centers.get(user_season)
        
        if not s_coords: return "未知季型"

        center_lab = LabColor(lab_l=s_coords['L'], lab_a=s_coords['a'], lab_b=s_coords['b'])
        diff = delta_e_cie1976(target_lab, center_lab)

        if diff <= 10: return f"極致適合，完美襯托氣色 (ΔE: {diff:.2f})"
        if diff <= 18: return f"適合，中規中矩 (ΔE: {diff:.2f})"
        return f"不太建議，可能顯得臉色暗沉 (ΔE: {diff:.2f})"

    def find_palettes_by_season(self, season_name, threshold=5):
        s_coords = self.pca_centers.get(season_name)
        if not s_coords: return []

        center_lab = LabColor(lab_l=s_coords['L'], lab_a=s_coords['a'], lab_b=s_coords['b'])
        matched_palettes = []

        for item in self.palette_data:
            colors = item.get('colors', [])
            for color_hex in colors:
                try:
                    c_lab = hex_to_lab(color_hex)
                    diff = delta_e_cie1976(center_lab, c_lab)

                    if diff <= threshold:
                        other_colors = [c for c in colors if c != color_hex]
                        if len(other_colors) == 3:
                            matched_palettes.append({
                                "main_match": color_hex,
                                "color_1": other_colors[0],
                                "color_2": other_colors[1],
                                "color_3": other_colors[2],
                                "delta_e": round(diff, 2),
                                "likes": item.get('likes', 0),
                                "date": item.get('date')
                            })
                        break
                except Exception:
                    continue

        matched_palettes.sort(key=lambda x: (x['delta_e'], -x['likes']))
        return matched_palettes
    
    def compute_weighted_colors(self, user_input_color, matched_palettes):
        target_lab = hex_to_lab(user_input_color)

        # --- 全域 likes 正規化 ---
        likes_values = [p.get('likes', 0) for p in self.palette_data]
        likes_max = max(likes_values) if likes_values else 1
        likes_min = min(likes_values) if likes_values else 0

        results = []

        for item in matched_palettes:
            for c in [item.get('color_1'), item.get('color_2'), item.get('color_3')]:
                
                # 避免 None
                if not c:
                    continue

                try:
                    c_lab = hex_to_lab(c)

                    # --- W_pop ---
                    likes = item.get('likes', 0)
                    if likes_max == likes_min:
                        w_pop = 0
                    else:
                        w_pop = (likes - likes_min) / (likes_max - likes_min)

                    # --- W_harmony ---
                    delta = delta_e_cie1976(target_lab, c_lab)
                    w_harmony = 1 / (1 + delta)

                    # --- Score ---
                    score = (w_pop * 0.5) + (w_harmony * 0.5)

                    results.append({
                        "color": c,
                        "likes": round(w_pop, 4),
                        "harmony": round(w_harmony, 4),
                        "score": round(score, 4)
                    })

                except:
                    continue

        # 去重複的顏色（以顏色為基準）
        seen = set()
        unique_results = []

        for r in results:
            if r['color'] not in seen:
                seen.add(r['color'])
                unique_results.append(r)

        results = unique_results

        # 排序，依照綜合分數從高到低
        results.sort(key=lambda x: x["score"], reverse=True)

        # return results[:5]    # 只取前5筆
        return results