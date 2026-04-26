# main.py
from src.analyzer import ColorAnalysisSystem

def main():
    analyzer = ColorAnalysisSystem()

    # 情境：使用者拿一件淺奶油色上衣 (#fffbde)
    my_shirt = "#fffbde"
    my_season = "True Winter" 
    
    print("=== 色彩分析系統啟動 ===\n")

    # 1. 系統自動分析這件衣服屬於哪一季
    prediction = analyzer.predict_season(my_shirt)
    print(f"衣服分析：這件衣服最接近 [{prediction['season']}] (誤差值: {prediction['diff']:.2f})")

    # 2. 判定適不適合
    suitability = analyzer.check_suitability(my_shirt, my_season)
    print(f"對於 {my_season} 的使用者：{suitability}")

    # 3. A - 跟衣服顏色匹配的靈感
    print(f"\n為您推薦「跟這件衣服風格匹配」的配色方案：")
    recom_by_shirt = analyzer.find_palettes_by_season(prediction['season'], threshold=5)[:3] # 加上 [:3] 限制輸出筆數，版面更整潔
    for i, p in enumerate(recom_by_shirt, 1):
        colors_str = ", ".join([p['main_match'], p['color_1'], p['color_2'], p['color_3']])
        print(f"方案 {i} (誤差 {p['delta_e']}): {colors_str} (👍 {p['likes']:,})")

    # 3. B - 適合使用者的購物清單
    print(f"\n為您推薦「適合 {my_season} 季型」的配色方案：")
    recom_by_user = analyzer.find_palettes_by_season(my_season, threshold=5)[:3]
    for i, p in enumerate(recom_by_user, 1):
        colors_str = ", ".join([p['main_match'], p['color_1'], p['color_2'], p['color_3']])
        print(f"方案 {i} (誤差 {p['delta_e']}): {colors_str} (👍 {p['likes']:,})")

    print("\n=== 分析完成 === ")
    weighted_results = analyzer.compute_weighted_colors(my_shirt, recom_by_user)
    print(weighted_results)
    for i, wc in enumerate(weighted_results, 1):
        print(f"\n方案 {i}:")
        print(f"  顏色: {wc['color']}, 喜好度: {wc['likes']}, 和諧度: {wc['harmony']}, 綜合分數: {wc['score']}")

if __name__ == "__main__":
    main()