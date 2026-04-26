# utils.py

# 工具函式：將 HEX 色碼轉換為 Lab 格式，方便後續色彩分析使用

from colormath.color_objects import LabColor, sRGBColor
from colormath.color_conversions import convert_color

def hex_to_lab(hex_color):
    """將 HEX 色碼轉換為 Lab 格式"""
    hex_str = hex_color.strip().lower().lstrip('#')
    rgb = sRGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16), is_upscaled=True)
    return convert_color(rgb, LabColor)