import requests
import json
import time
import os
from datetime import datetime
from dateutil.relativedelta import relativedelta # 處理月份推算最準確的套件

def parse_relative_date(relative_str):
    """將相對時間字串（如 '9 months'）即時轉換為 YYYY-MM-DD"""
    now = datetime.now()
    try:
        # 處理 'Just now' 或 'Yesterday' 等特殊情況
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
        return relative_str # 若解析失敗則保留原始字串

def get_color_hunt(target_count=500):
    url = "https://colorhunt.co/php/feed.php"
    
    # 1. 設定儲存路徑
    save_directory = r"Color-Analysis\Color-Hunt" 
    file_name = "color_palettes.json"
    full_path = os.path.join(save_directory, file_name)

    if not os.path.exists(save_directory):
        os.makedirs(save_directory)
        print(f"📁 已建立新資料夾: {save_directory}")

    headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "referer": "https://colorhunt.co/palettes/popular",
        "cookie": "_ga=GA1.1.1097175123.1770091298; _cc_id=8f1547fd312aa28a5e1c186530e31eac; cf_clearance=tMW1x065iqE9DCUQR5FlPbDx14496Kc2U7h.Ri0HUPY-1774368019-1.2.1.1-aNGzX.2mXxHjnj.FjaRD8q0FhgTVzXsk1BgihZEA3W3v_Kb7iVZGgFNS9B8l1xXxntSryeQ74aFsASOO7oSMLCbfdVwl56UUUSs8besJce1N6_iQumeCG1tkKCNuvcHN.RDAkY4bV2AVpt.bCu7Ui1JXJYuWDwcTmvo_LVAy_2B9c.Y9_pS0w.dejaUbosIxymDPJxNcgR6QR3mkC_TGZlE9WPjKV10gh0B.5kJbKLA;" 
    }

    all_data = []
    step = 0
    config = {"sort": "popular", "tags": "", "timeframe": "365"}

    print(f"🚀 開始抓取色板 (目標: {target_count} 筆)，日期將自動轉換為 YYYY-MM-DD...")

    while len(all_data) < target_count:
        payload = f"step={step}&sort={config['sort']}&tags={config['tags']}&timeframe={config['timeframe']}"
        
        try:
            res = requests.post(url, data=payload, headers=headers)
            data = res.json()
            
            if not data: 
                print("🛑 沒資料了，提前結束。")
                break
            
            for entry in data:
                # 直接在這裡抓取並轉換日期
                raw_date = entry.get('date', 'unknown')
                clean_date = parse_relative_date(raw_date)

                code = entry.get('code') or entry.get('item')
                likes = entry.get('love') or entry.get('likes') or 0

                if code and len(code) == 24:
                    palette = [f"#{code[i:i+6]}" for i in range(0, 24, 6)]
                    item_data = {
                        "colors": palette,
                        "likes": int(likes),
                        "date": clean_date  # 存入時已是日期格式
                    }
                    
                    # 避免重複抓取
                    if item_data not in all_data:
                        all_data.append(item_data)
                
                if len(all_data) >= target_count: break
            
            print(f"✅ Step {step} 完成，目前累計: {len(all_data)} 筆")
            step += 1
            time.sleep(1) 
            
        except Exception as e:
            print(f"❌ 發生錯誤: {e}")
            break

    # 2. 儲存結果
    if all_data:
        # 依按讚數降序排列
        all_data.sort(key=lambda x: x['likes'], reverse=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=4, ensure_ascii=False)
        print(f"\n💾 成功！檔案已儲存至：\n📍 {full_path}")

    return all_data

if __name__ == "__main__":
    get_color_hunt(1000)