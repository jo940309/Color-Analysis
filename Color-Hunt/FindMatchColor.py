import json
import numpy as np
from colormath.color_objects import LabColor, sRGBColor
from colormath.color_conversions import convert_color
from colormath.color_diff import delta_e_cie1976


# ---------- 工具區 ----------

def clean_hex(hex_color):
    hex_color = hex_color.strip().lower()
    if not hex_color.startswith('#'):
        hex_color = '#' + hex_color
    return hex_color


def hex_to_lab(hex_color):
    hex_color = clean_hex(hex_color).lstrip('#')

    if len(hex_color) != 6:
        raise ValueError("Invalid HEX")

    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)

    rgb = sRGBColor(r, g, b, is_upscaled=True)
    lab = convert_color(rgb, LabColor)
    return lab


def lab_to_hex(lab):
    rgb = convert_color(lab, sRGBColor)

    r = min(max(int(rgb.rgb_r * 255), 0), 255)
    g = min(max(int(rgb.rgb_g * 255), 0), 255)
    b = min(max(int(rgb.rgb_b * 255), 0), 255)

    return "#{:02x}{:02x}{:02x}".format(r, g, b)


# ---------- 核心：產生相似色集合 ----------

def generate_similar_colors(target_hex, threshold=3, step=1):
    target_lab = hex_to_lab(target_hex)

    similar_colors = set()

    for dL in np.arange(-threshold, threshold + step, step):
        for da in np.arange(-threshold, threshold + step, step):
            for db in np.arange(-threshold, threshold + step, step):

                new_lab = LabColor(
                    lab_l=target_lab.lab_l + dL,
                    lab_a=target_lab.lab_a + da,
                    lab_b=target_lab.lab_b + db
                )

                delta_e = delta_e_cie1976(target_lab, new_lab)

                # 只保留球體內
                if delta_e <= threshold:
                    try:
                        hex_color = lab_to_hex(new_lab)
                        similar_colors.add(hex_color)
                    except:
                        continue

    print(f"🎯 產生相似色數量: {len(similar_colors)}")
    return similar_colors


# ---------- 主功能 ----------

def find_match_color(target_hex, threshold=3, step=1,
                     json_file='Color-Analysis\\Color-Hunt\\color_palettes.json'):

    # 讀取資料
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ 找不到資料檔")
        return

    target_hex = clean_hex(target_hex)

    # 🔥 1️⃣ 先生成相似色集合
    similar_set = generate_similar_colors(target_hex, threshold, step)
    similar_set.add(target_hex)

    results = []

    # 🔍 2️⃣ 用集合比對色板
    for item in data:
        for color in item['colors']:
            try:
                color_clean = clean_hex(color)

                if color_clean in similar_set:
                    results.append({
                        "palette": item,
                        "match_color": color_clean
                    })
                    break
            except:
                continue

    # 📊 排序（按讚數）
    results.sort(key=lambda x: x['palette']['likes'], reverse=True)

    # 🖨 輸出
    print(f"\n🎨 搜尋色號: {target_hex}")
    print(f"🔍 相似色數量: {len(similar_set)} (ΔE ≤ {threshold})")
    print(f"相似色: {similar_set}")
    print(f"📏 ΔE 閾值: {threshold} | step: {step}")
    print(f"🔍 找到相似色板 {len(results)} 個")
    print("-" * 60)

    for i, item in enumerate(results[:10], 1):
        colors_str = ", ".join(item['palette']['colors'])
        print(f"排行 {i:02d} | 👍 {item['palette']['likes']:,}")
        print(f"        命中顏色: {item['match_color']}")
        print(f"        色板: [{colors_str}]")

    if not results:
        print("💡 找不到相似色（可以調高 threshold 或 step）")

    return results


# ---------- 測試 ----------

find_match_color("#fffbde", threshold=4, step=1)