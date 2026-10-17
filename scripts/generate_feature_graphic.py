import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def generate_feature_graphic(w=1024, h=500):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background linear & radial gradient (Gothic Cathedral Midnight & Gold)
    for y in range(h):
        v = y / float(h)
        # Deep dark midnight purple to dark amber floor
        r = int(10 + v * 28)
        g = int(8 + v * 18)
        b = int(24 + (1 - v) * 35)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Radial ambient spotlight in center
    spotlight = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(spotlight)
    cx, cy = w / 2.0, h / 2.0
    for r in range(450, 0, -5):
        alpha = int((1 - (r / 450.0)) * 140)
        s_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(212, 175, 55, alpha))
    spotlight = spotlight.filter(ImageFilter.GaussianBlur(radius=30))
    img = Image.alpha_composite(img, spotlight)
    draw = ImageDraw.Draw(img)

    # 2. Isometric 3D Board Surface Overlay on Bottom Half
    board_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(board_overlay)

    # Draw isometric floor grid
    tile_w = 64
    tile_h = 24
    start_y = 260
    for row in range(12):
        for col in range(24):
            x0 = col * tile_w - (row % 2) * (tile_w / 2) - 100
            y0 = start_y + row * (tile_h / 2)
            if (row + col) % 2 == 1:
                b_draw.polygon([
                    (x0, y0 + tile_h / 2),
                    (x0 + tile_w / 2, y0),
                    (x0 + tile_w, y0 + tile_h / 2),
                    (x0 + tile_w / 2, y0 + tile_h)
                ], fill=(212, 175, 55, 18), outline=(212, 175, 55, 35))

    img = Image.alpha_composite(img, board_overlay)
    draw = ImageDraw.Draw(img)

    # 3. Left & Right Decorative 3D Chess Piece Silhouettes
    # Left: White 24K Gold King Piece Silhouette
    king_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    k_draw = ImageDraw.Draw(king_overlay)

    # King Base
    k_draw.ellipse([120, 320, 260, 380], fill=(18, 16, 28, 240), outline=(212, 175, 55, 255), width=3)
    k_draw.polygon([(140, 330), (240, 330), (220, 210), (160, 210)], fill=(234, 179, 8, 240))
    k_draw.polygon([(180, 330), (210, 330), (200, 210), (190, 210)], fill=(255, 245, 200, 220)) # Highlight
    k_draw.ellipse([150, 195, 230, 225], fill=(255, 223, 115, 255)) # Ring
    k_draw.ellipse([155, 120, 225, 205], fill=(234, 179, 8, 255)) # Head
    k_draw.ellipse([170, 125, 210, 200], fill=(255, 245, 210, 200)) # Head Specular
    # Crown Cross
    k_draw.rectangle([183, 60, 197, 125], fill=(255, 223, 115, 255))
    k_draw.rectangle([170, 75, 210, 89], fill=(255, 223, 115, 255))

    # Right: Black Obsidian Queen Silhouette
    q_draw = ImageDraw.Draw(king_overlay)
    q_draw.ellipse([760, 320, 900, 380], fill=(10, 12, 16, 240), outline=(56, 189, 248, 255), width=3)
    q_draw.polygon([(780, 330), (880, 330), (850, 200), (810, 200)], fill=(15, 23, 42, 250))
    q_draw.polygon([(820, 330), (840, 330), (835, 200), (825, 200)], fill=(56, 189, 248, 180)) # Cyan highlight
    q_draw.ellipse([790, 185, 870, 215], fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=2)
    q_draw.ellipse([795, 115, 865, 195], fill=(15, 23, 42, 255))
    # Queen Crown Points
    q_draw.polygon([(795, 125), (810, 90), (825, 125), (830, 80), (835, 125), (850, 90), (865, 125)], fill=(56, 189, 248, 255))

    king_shadow = king_overlay.filter(ImageFilter.GaussianBlur(radius=4))
    img = Image.alpha_composite(img, king_shadow)
    img = Image.alpha_composite(img, king_overlay)
    draw = ImageDraw.Draw(img)

    # 4. Central Title Text & Subtitle
    # Try loading a system truetype font, or fallback to default font drawing
    font_large = None
    font_small = None
    font_badge = None
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf"
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font_large = ImageFont.truetype(fp, 56)
                font_small = ImageFont.truetype(fp, 22)
                font_badge = ImageFont.truetype(fp, 16)
                break
            except Exception:
                pass

    if not font_large:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Title: 3D WIZARD CHESS
    title_text = "3D WIZARD CHESS"
    sub_text = "GOTHIC CATHEDRAL  •  SINGLE PLAYER AI  •  3D ARMORY"
    badge_text = "✦ ANDROID 3D EDITION ✦"

    # Render glowing text outline/shadow
    text_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(text_overlay)

    # Title glow
    t_draw.text((w/2 + 2, 172), title_text, fill=(0, 0, 0, 220), font=font_large, anchor="mm")
    t_draw.text((w/2 - 2, 168), title_text, fill=(255, 215, 0, 180), font=font_large, anchor="mm")
    t_draw.text((w/2, 170), title_text, fill=(255, 245, 210, 255), font=font_large, anchor="mm")

    # Subtitle
    t_draw.text((w/2, 230), sub_text, fill=(226, 232, 240, 240), font=font_small, anchor="mm")

    # Top Badge Banner
    badge_w = 260
    badge_h = 32
    bx0, by0 = w/2 - badge_w/2, 80
    t_draw.rectangle([bx0, by0, bx0 + badge_w, by0 + badge_h], fill=(212, 175, 55, 40), outline=(212, 175, 55, 200), width=2)
    t_draw.text((w/2, by0 + 16), badge_text, fill=(255, 215, 0, 255), font=font_badge, anchor="mm")

    # Ornate Border
    inset = 14
    t_draw.rectangle([inset, inset, w - inset, h - inset], outline=(212, 175, 55, 180), width=3)

    img = Image.alpha_composite(img, text_overlay)

    # Save outputs
    out_path = "/home/milla/3d-Wizard-Chess/android/app/src/main/feature_graphic.png"
    pub_path = "/home/milla/3d-Wizard-Chess/public/feature_graphic.png"
    img.convert("RGB").save(out_path, "PNG")
    img.convert("RGB").save(pub_path, "PNG")
    print(f"Feature Graphic (1024x500) created successfully at:\n  - {out_path}\n  - {pub_path}")

if __name__ == "__main__":
    generate_feature_graphic()
