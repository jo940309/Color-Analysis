import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse
import time

# 嘗試載入繁簡轉換套件 (OpenCC)
try:
    import opencc
    # s2twp 代表：簡體轉繁體 (包含台灣在地化詞彙轉換，如 打印->列印)
    converter = opencc.OpenCC('s2twp') 
    USE_OPENCC = True
    print("[*] 成功載入 OpenCC 繁簡轉換引擎！")
except ImportError:
    USE_OPENCC = False
    print("[!] 未偵測到 OpenCC。將僅依賴模型 Prompt 輸出繁體。若要完美轉繁體請安裝：pip install opencc-python-reimplemented")

# ==========================================
# 1. 核心設定區
# ==========================================
BASE_URL = "https://im.nutc.edu.tw/"  # 出發網址
MAX_DEPTH = 4           # 設定爬取深度 (0=僅首頁, 1=首頁+子頁, 2=子頁的子頁...)
MAX_PAGES_TO_SCRAPE = 100 # 為了避免無底洞，設定最多爬取幾個網頁總數
all_qa_data = []

# ==========================================
# 2. 深度爬蟲邏輯 (基於廣度優先搜尋 BFS)
# ==========================================
def get_deep_links(start_url, max_depth, max_pages):
    print(f"\n🕸️ [Spider] 開始執行深度爬蟲 (目標深度: {max_depth}, 最大頁數: {max_pages})")
    visited_urls = set()
    queue = [(start_url, 0)] # 佇列存放 (網址, 目前深度)
    urls_to_scrape = []
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    domain = urlparse(start_url).netloc
    ignore_exts = ('.pdf', '.jpg', '.png', '.doc', '.docx', '.zip', '.rar', '.xls')

    while queue and len(urls_to_scrape) < max_pages:
        current_url, current_depth = queue.pop(0)

        if current_url in visited_urls:
            continue
            
        visited_urls.add(current_url)
        urls_to_scrape.append(current_url)
        print(f"  📍 鎖定目標 (深度 {current_depth}): {current_url}")

        # 如果還沒達到最大深度，繼續往下挖連結
        if current_depth < max_depth:
            try:
                response = requests.get(current_url, headers=headers, timeout=10)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                for a_tag in soup.find_all('a', href=True):
                    full_url = urljoin(current_url, a_tag['href'])
                    # 清理網址中的錨點 (如 #section1) 避免重複爬取同一頁
                    full_url = full_url.split('#')[0] 
                    
                    if (domain in full_url and 
                        full_url.startswith("http") and 
                        not full_url.lower().endswith(ignore_exts) and 
                        full_url not in visited_urls):
                        
                        queue.append((full_url, current_depth + 1))
            except Exception as e:
                pass # 忽略抓不到連結的錯誤，繼續下一個

    print(f"✅ [Spider] 深度探勘完成！共鎖定 {len(urls_to_scrape)} 個網頁準備萃取。")
    return urls_to_scrape

# ==========================================
# 3. 網頁純文字萃取器
# ==========================================
def scrape_text_from_url(url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.extract()
            
        text = soup.get_text(separator=' ', strip=True)
        if len(text) < 50:
            return ""
        return text[:2000] # 取前 2000 字
    except Exception as e:
        print(f"❌ [Scraper] 讀取失敗：{e}")
        return ""

# ==========================================
# 4. Gemma 2 生成 QA (外加 OpenCC 強制轉繁體)
# ==========================================
def generate_qa_with_ollama(context_text):
    print("🧠 [Gemma 2] 正在思考並萃取 QA...")
    
    # 強化版 Prompt：極度嚴格的繁體中文要求
    prompt = f"""
你是一個專業的資料集建構專家，負責將校園資訊轉換成高品質問答資料，用於語言模型微調。

【任務】
請閱讀以下【參考資料】，萃取出 3 筆高品質問答對（QA）。

【資料來源限制】
- 僅能使用「台中科技大學」相關資訊
- 不可使用或推測未出現在內容中的資訊

【語言規範】
- 全部使用台灣繁體中文（zh-TW）
- 禁止簡體字
- 用詞需在地化（例如：網路、軟體、資訊、課程、系所）

【QA 設計要求】
1. 問題（input）
   - 模擬學生真實會問的問題（口語自然）
   - 每題問法要不同（避免模板化）
   - 長度約 10~25 字

2. 答案（output）
   - 清楚、完整、資訊密度高
   - 使用自然敘述句
   - 長度約 30~80 字
   - 不要條列式、不使用符號列表

3. 多樣性要求
   - 問題類型需不同（例如：地點、功能、交通、特色）
   - 避免語意重複

【輸出格式（嚴格遵守）】
僅輸出 JSON 陣列，不可包含任何解釋文字：

[
  {{
    "instruction": "你是一個專業的中科大校園導覽員，請用親切的繁體中文回答以下問題。",
    "input": "...",
    "output": "..."
  }}
]

【參考資料】
{context_text}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "gemma2:2b", "prompt": prompt, "stream": False}
        )
        response.raise_for_status()
        result_text = response.json().get("response", "").strip()
        
        # 【防線二】：透過 OpenCC 從程式碼層級將所有文字強制轉為台灣繁體
        if USE_OPENCC:
            result_text = converter.convert(result_text)
        
        result_text = re.sub(r'^```json\s*', '', result_text)
        result_text = re.sub(r'\s*```$', '', result_text)
        
        return json.loads(result_text)
    except Exception as e:
        print(f"❌ [Gemma 2] 解析失敗或格式不符，跳過此筆。")
        return []

# ==========================================
# 5. 主程式執行流
# ==========================================
def main():
    target_urls = get_deep_links(BASE_URL, MAX_DEPTH, MAX_PAGES_TO_SCRAPE)
    
    for idx, url in enumerate(target_urls):
        print("\n" + "=" * 50)
        print(f"📄 正在處理 ({idx+1}/{len(target_urls)}): {url}")
        
        raw_text = scrape_text_from_url(url)
        if not raw_text:
            print("⚠️ 網頁內容為空或無效，跳過。")
            continue
            
        qa_list = generate_qa_with_ollama(raw_text)
        if qa_list:
            all_qa_data.extend(qa_list)
            print(f"✨ 成功提煉 {len(qa_list)} 筆 QA！")
            
        time.sleep(1) # 休息 1 秒，保護學校伺服器與你的顯卡

    if all_qa_data:
        output_file = "deep_campus_qa.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_qa_data, f, ensure_ascii=False, indent=2)
        print("\n" + "🌟" * 25)
        print(f"🎉 任務圓滿達成！共自動生成了 {len(all_qa_data)} 筆高品質繁體 QA。")
        print(f"📁 檔案已儲存為：{output_file}")
    else:
        print("\n[!] 任務結束，未能生成任何有效的 QA 資料。")

if __name__ == "__main__":
    main()