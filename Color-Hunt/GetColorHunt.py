import requests
import json
import time
import os  # 引入 os 模組處理路徑

def get_color_hunt(target_count=500):
    url = "https://colorhunt.co/php/feed.php"
    
    # 1. 設定指定儲存路徑
    # 建議使用絕對路徑，例如 "D:/Color Analysis/Color-Analysis/Color-Hunt/"
    save_directory = r"D:\Color Analysis\Color-Analysis\Color-Hunt" 
    file_name = "color_palettes.json"
    full_path = os.path.join(save_directory, file_name)

    # 如果資料夾不存在，就自動建立它
    if not os.path.exists(save_directory):
        os.makedirs(save_directory)
        print(f"📁 已建立新資料夾: {save_directory}")

    headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
        "referer": "https://colorhunt.co/palettes/popular",
        "cookie": "_ga=GA1.1.1097175123.1770091298; _cc_id=8f1547fd312aa28a5e1c186530e31eac; cf_clearance=tMW1x065iqE9DCUQR5FlPbDx14496Kc2U7h.Ri0HUPY-1774368019-1.2.1.1-aNGzX.2mXxHjnj.FjaRD8q0FhgTVzXsk1BgihZEA3W3v_Kb7iVZGgFNS9B8l1xXxntSryeQ74aFsASOO7oSMLCbfdVwl56UUUSs8besJce1N6_iQumeCG1tkKCNuvcHN.RDAkY4bV2AVpt.bCu7Ui1JXJYuWDwcTmvo_LVAy_2B9c.Y9_pS0w.dejaUbosIxymDPJxNcgR6QR3mkC_TGZlE9WPjKV10gh0B.5kJbKLA; _iiq_fdata=%7B%22pcid%22%3A%22411b7701-6e8f-bc77-2d96-4fa21f19ccc8%22%2C%22pcidDate%22%3A1770091301412%7D; _lr_retry_request=true; _lr_env_src_ats=false; _pubcid=6050e7d5-0e92-4452-b9e0-e514c434b20d; panoramaId_expiry=1774972822396; panoramaId=8f3b65d1f91d5c95d42d07ac5f96185ca02c804ca7a50565229b10c5d028f521; panoramaIdType=panoDevice; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%2264090998-f0d7-4db8-9cd2-93fa7f4af798%5C%22%2C%5B1770091303%2C374000000%5D%5D%22%5D%5D%5D; FCNEC=%5B%5B%22AKsRol-4xLiuJ_gH5l_vjNmo5cH8DAbbd0mmMH1sRne8Qn2kJxS8pcYzinC14wUeXO4AeKAbaS7jf5GKMA80_6tI4oz3cO2Iig4ALSMdYUdytJfcegxAgr4XVKq8b7k8SJkMz5eIcLijL-qaice5Se3E_ibsRR6Zxg%3D%3D%22%5D%5D; cto_bundle=52eNzl9ja1FpTmxEZ2VZQ2tPMiUyQkhzMTRVJTJCZWVkOXFnZWZIQWVRMjNQT2tZNlZJeXF3bURZdSUyRjZPJTJGbHJBcWZEaVVsSHFTQkklMkJyTWMycGk3bU1vWWI0SXFBcXh2TzklMkZiS2s3VkRRMXRpUndSckJ3UVAxNXhNTWVnVGZlS1N3M2RNYkRmUjBBTzU1bjF3RDJ6RjY4S085N1FLMnclM0QlM0Q; __gads=ID=729af7fc702ab6ef:T=1770091306:RT=1774370149:S=ALNI_MZoCWN_jH7iT-NT2_GaVFztWjGdkw; __gpi=UID=000011f1634ae9e1:T=1770091306:RT=1774370149:S=ALNI_MY9-z3d4XVLD9KfFyf-Z8CV-1Sxog; __eoi=ID=06da0c8d9ff7d345:T=1770091306:RT=1774370149:S=AA-AfjbuVWkQZcx5b4hxv_rYHvk7; _ga_P464R9CGC0=GS2.1.s1774368019$o7$g1$t1774370742$j60$l0$h0; _ga_9Q8PVMEW55=GS2.1.s1774368024$o7$g1$t1774370742$j60$l0$h0" 
    }

    all_data = []
    step = 0
    config = {"sort": "popular", "tags": "", "timeframe": "365"}

    print(f"🚀 開始抓取色板與按讚數 (目標: {target_count} 筆)...")

    while len(all_data) < target_count:
        payload = f"step={step}&sort={config['sort']}&tags={config['tags']}&timeframe={config['timeframe']}"
        
        try:
            res = requests.post(url, data=payload, headers=headers)
            data = res.json()
            
            if not data: 
                print("🛑 沒資料了，提前結束。")
                break
            
            for entry in data:
                code = entry.get('code') or entry.get('item')
                likes = entry.get('love') or entry.get('likes') or 0
                date = entry.get('date', 'unknown')

                if code and len(code) == 24:
                    palette = [f"#{code[i:i+6]}" for i in range(0, 24, 6)]
                    item_data = {
                        "colors": palette,
                        "likes": int(likes),
                        "date": date
                    }
                    if item_data not in all_data:
                        all_data.append(item_data)
                
                if len(all_data) >= target_count: break
            
            print(f"✅ Step {step} 完成，目前累計: {len(all_data)} 筆")
            step += 1
            time.sleep(1) # 2026 年 Cloudflare 變嚴格了，建議保留延遲
            
        except Exception as e:
            print(f"❌ 發生錯誤: {e}")
            break

    # 2. 儲存結果到指定路徑
    if all_data:
        all_data.sort(key=lambda x: x['likes'], reverse=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, indent=4, ensure_ascii=False)
        print(f"\n💾 成功！檔案已儲存至：\n📍 {full_path}")

    return all_data

if __name__ == "__main__":
    get_color_hunt(500)