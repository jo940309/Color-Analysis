import json

def find_match_color(target_hex, json_file='color_palettes.json'):
    # 1. 讀取先前抓好的資料
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ 找不到資料檔，請先執行爬蟲抓取資料。")
        return

    # 標準化輸入色號 (轉小寫並確保有 #)
    target_hex = target_hex.lower()
    if not target_hex.startswith('#'):
        target_hex = '#' + target_hex

    # 2. 篩選包含該色號的色板
    results = []
    for item in data:
        # 將色板中的所有顏色都轉小寫進行比對
        if target_hex in [c.lower() for c in item['colors']]:
            results.append(item)

    # 3. 根據按讚數排序 (由高到低)
    results.sort(key=lambda x: x['likes'], reverse=True)

    print(f"\n🎨 搜尋色號: {target_hex}")
    print(f"🔍 找到包含此顏色的色板共 {len(results)} 個，以下為最熱門的前 10 名：")
    print("-" * 50)

    for i, item in enumerate(results, 1):
        colors_str = ", ".join(item['colors'])
        print(f"排行 {i:02d} | 按讚數: {item['likes']:,} | 顏色: [{colors_str}]")
    
    if not results:
        print("💡 找不到包含此色號的色板，建議抓取更多資料再試試看。")

    return results

# --- 使用範例 ---
# 假設你想找包含粉色系 #FF9A9E 的熱門色板
find_match_color("#fff2eb")