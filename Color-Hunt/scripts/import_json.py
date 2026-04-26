import json
import os
from pymongo import MongoClient
from src.config import DB_URI

def import_json_to_mongo(json_file_name='color_palettes_all.json'):
    # 取得當前腳本所在的目錄，然後向上層找到 data 資料夾
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # 假設 data 資料夾在 Color-Hunt 資料夾內
    # 根據你的結構，我們需要從 scripts 往上一層到 Color-Hunt，再進入 data
    data_path = os.path.join(script_dir, '..', 'data', json_file_name)
    
    # 為了除錯，印出路徑看看是否正確
    print(f"正在嘗試讀取檔案：{data_path}")

    client = MongoClient(DB_URI)
    db = client["ColorDB"]
    collection = db["palettes"]
    
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, list):
            collection.insert_many(data)
        else:
            collection.insert_one(data)
        print("✅ 資料匯入完成！")
    except FileNotFoundError:
        print(f"❌ 錯誤：找不到檔案，請檢查路徑：{data_path}")

if __name__ == "__main__":
    import_json_to_mongo()