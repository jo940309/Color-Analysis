import requests
import json
import time
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta

# ✅ 保留你的日期轉換函式
def parse_relative_date(relative_str):
    now = datetime.now()
    try:
        s = relative_str.lower()
        if 'just now' in s or 'today' in s:
            return now.strftime('%Y-%m-%d')
        if 'yesterday' in s:
            return (now - relativedelta(days=1)).strftime('%Y-%m-%d')

        parts = s.split()
        if len(parts) < 2:
            return relative_str

        amount = int(parts[0])
        unit = parts[1]

        if 'year' in unit:
            dt = now - relativedelta(years=amount)
        elif 'month' in unit:
            dt = now - relativedelta(months=amount)
        elif 'week' in unit:
            dt = now - relativedelta(weeks=amount)
        elif 'day' in unit:
            dt = now - relativedelta(days=amount)
        elif 'hour' in unit:
            dt = now - relativedelta(hours=amount)
        else:
            dt = now

        return dt.strftime('%Y-%m-%d')
    except:
        return relative_str


def get_color_hunt(target_count=1000):
    url = "https://colorhunt.co/php/feed.php"

    # 📁 儲存設定（同一個檔案）
    save_directory = r"Color-Analysis\Color-Hunt\data"
    file_name = "color_palettes_all.json"
    full_path = os.path.join(save_directory, file_name)

    if not os.path.exists(save_directory):
        os.makedirs(save_directory)
        print(f"📁 已建立資料夾: {save_directory}")

    headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "user-agent": "Mozilla/5.0",
        "referer": "https://colorhunt.co/",
    }

    # 🔥 多分類設定
    tags_list = [
        "", "pastel", "vintage", "dark", "light",
        "warm", "cool", "nature", "retro", "minimal", "neon"
    ]

    sort_list = ["popular", "new"]

    all_data = []
    seen = set()  # ✅ 用來去重（只記錄顏色組合）

    print(f"🚀 開始抓取所有分類色板 (目標: {target_count})")

    for tag in tags_list:
        for sort in sort_list:

            print(f"\n🔥 分類: sort={sort}, tag={tag or 'none'}")

            step = 0

            while len(all_data) < target_count:
                payload = f"step={step}&sort={sort}&tags={tag}&timeframe=365"

                try:
                    res = requests.post(url, data=payload, headers=headers)
                    data = res.json()

                    if not data:
                        print("🛑 此分類沒有更多資料")
                        break

                    for entry in data:
                        raw_date = entry.get('date', 'unknown')
                        clean_date = parse_relative_date(raw_date)

                        code = entry.get('code') or entry.get('item')
                        likes = entry.get('love') or entry.get('likes') or 0

                        if code and len(code) == 24:
                            palette = tuple(f"#{code[i:i+6]}" for i in range(0, 24, 6))

                            # ✅ 去重（只比對顏色）
                            if palette in seen:
                                continue

                            seen.add(palette)

                            item_data = {
                                "colors": list(palette),
                                "likes": int(likes),
                                "date": clean_date,
                            }

                            all_data.append(item_data)

                        if len(all_data) >= target_count:
                            break

                    print(f"✅ Step {step} 完成，目前累計: {len(all_data)}")
                    step += 1
                    time.sleep(1)

                except Exception as e:
                    print(f"❌ 發生錯誤: {e}")
                    break

    # 📦 排序 + 儲存
    if all_data:
        all_data.sort(key=lambda x: x['likes'], reverse=True)

        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=4, ensure_ascii=False)

        print(f"\n💾 完成！共 {len(all_data)} 筆")
        print(f"📍 檔案位置: {full_path}")

    return all_data


if __name__ == "__main__":
    get_color_hunt(5000)