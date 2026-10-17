import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def draw_wizard_chess_icon(size=512):
    # Base image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center = size / 2.0
    radius = size / 2.0

    # 1. Background radial gradient (Midnight Amethyst & Gold Glow)
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    bg_draw = ImageDraw.Draw(bg)

    for r in range(size, 0, -2):
        u = r / float(size)
        # Gradient color mapping: Outer dark midnight -> Inner amethyst/gold
        red = int(12 + (1 - u) * 45)
        green = int(10 + (1 - u) * 22)
        blue = int(28 + (1 - u) * 65)
        bg_draw.ellipse([center - r, center - r, center + r, center + r], fill=(red, green, blue, 255))

    img = Image.alpha_composite(img, bg)
    draw = ImageDraw.Draw(img)

    # 2. Isometric 3D Board Tiles in background
    board_overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(board_overlay)

    tile_size = size / 8.0
    for row in range(8):
        for col in range(8):
            if (row + col) % 2 == 1:
                x0 = col * tile_size
                y0 = row * tile_size
                x1 = x0 + tile_size
                y1 = y0 + tile_size
                b_draw.rectangle([x0, y0, x1, y1], fill=(212, 175, 55, 18)) # Subtle gold tint

    img = Image.alpha_composite(img, board_overlay)
    draw = ImageDraw.Draw(img)

    # 3. Outer Glowing Magical Ring
    glow_ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gr_draw = ImageDraw.Draw(glow_ring)
    gr_radius = size * 0.42
    gr_draw.ellipse(
        [center - gr_radius, center - gr_radius, center + gr_radius, center + gr_radius],
        outline=(56, 189, 248, 180),
        width=int(size * 0.025)
    )
    # Inner gold accent ring
    gr_draw.ellipse(
        [center - gr_radius + 6, center - gr_radius + 6, center + gr_radius - 6, center + gr_radius - 6],
        outline=(212, 175, 55, 220),
        width=int(size * 0.012)
    )
    glow_ring = glow_ring.filter(ImageFilter.GaussianBlur(radius=2))
    img = Image.alpha_composite(img, glow_ring)
    draw = ImageDraw.Draw(img)

    # 4. Sculpted 3D King Piece Silhouette & Shading (Metallic Gold & Obsidian Accent)
    king_overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    k_draw = ImageDraw.Draw(king_overlay)

    # King Base, Stem, Collar, Bulb, Head & Cross coordinates scaled
    s = size / 512.0

    # Base pedestal
    k_draw.ellipse([160 * s, 410 * s, 352 * s, 460 * s], fill=(18, 16, 28, 240), outline=(212, 175, 55, 255), width=int(4 * s))
    k_draw.rectangle([180 * s, 390 * s, 332 * s, 420 * s], fill=(212, 175, 55, 230))
    k_draw.ellipse([180 * s, 380 * s, 332 * s, 400 * s], fill=(255, 223, 115, 255))

    # Tapered Stem
    stem_poly = [
        (190 * s, 385 * s),
        (322 * s, 385 * s),
        (292 * s, 260 * s),
        (220 * s, 260 * s)
    ]
    k_draw.polygon(stem_poly, fill=(234, 179, 8, 240))

    # Stem Highlight (Specular 3D shine)
    k_draw.polygon([
        (230 * s, 385 * s),
        (265 * s, 385 * s),
        (255 * s, 260 * s),
        (240 * s, 260 * s)
    ], fill=(255, 245, 200, 220))

    # Collar / Ring
    k_draw.ellipse([200 * s, 245 * s, 312 * s, 275 * s], fill=(255, 223, 115, 255), outline=(180, 140, 20, 255), width=int(3 * s))

    # Bulb / Crown Head
    k_draw.ellipse([205 * s, 150 * s, 307 * s, 255 * s], fill=(234, 179, 8, 255))
    k_draw.ellipse([225 * s, 155 * s, 287 * s, 250 * s], fill=(255, 245, 210, 200)) # Specular highlight

    # Majestic Crown Crest & Cross on top
    # Cross vertical
    k_draw.rectangle([247 * s, 70 * s, 265 * s, 155 * s], fill=(255, 223, 115, 255))
    # Cross horizontal
    k_draw.rectangle([232 * s, 90 * s, 280 * s, 108 * s], fill=(255, 223, 115, 255))
    # Crown Orb
    k_draw.ellipse([238 * s, 135 * s, 274 * s, 165 * s], fill=(212, 175, 55, 255))

    # Add soft drop shadow & glow under King
    shadow = king_overlay.filter(ImageFilter.GaussianBlur(radius=3))
    img = Image.alpha_composite(img, shadow)
    img = Image.alpha_composite(img, king_overlay)

    # 5. Golden Corner Filigree Frame
    frame = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(frame)
    inset = int(20 * s)
    f_draw.rectangle(
        [inset, inset, size - inset, size - inset],
        outline=(212, 175, 55, 160),
        width=int(4 * s)
    )
    # Corner dots
    cd = int(12 * s)
    f_draw.ellipse([inset - cd/2, inset - cd/2, inset + cd/2, inset + cd/2], fill=(255, 223, 115, 255))
    f_draw.ellipse([size - inset - cd/2, inset - cd/2, size - inset + cd/2, inset + cd/2], fill=(255, 223, 115, 255))
    f_draw.ellipse([inset - cd/2, size - inset - cd/2, inset + cd/2, size - inset + cd/2], fill=(255, 223, 115, 255))
    f_draw.ellipse([size - inset - cd/2, size - inset - cd/2, size - inset + cd/2, size - inset + cd/2], fill=(255, 223, 115, 255))

    img = Image.alpha_composite(img, frame)
    return img

def main():
    root = "/home/milla/3d-Wizard-Chess"
    res_dir = os.path.join(root, "android/app/src/main/res")
    public_dir = os.path.join(root, "public")
    os.makedirs(public_dir, exist_ok=True)

    # Generate 512x512 master icon
    master_icon = draw_wizard_chess_icon(512)
    master_icon.save(os.path.join(public_dir, "icon.png"), "PNG")
    master_icon.save(os.path.join(root, "android/app/src/main/ic_launcher-playstore.png"), "PNG")
    print("Master 512x512 Play Store icon created!")

    # Mipmap densities mapping for Android launcher icons
    # density: (launcher_size, foreground_size)
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 108),
        "mipmap-xhdpi": (96, 108),
        "mipmap-xxhdpi": (144, 108),
        "mipmap-xxxhdpi": (192, 108)
    }

    for folder, (size, fg_size) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        # Standard launcher icon
        resized_icon = master_icon.resize((size, size), Image.Resampling.LANCZOS)
        resized_icon.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        resized_icon.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

        # Foreground adaptive icon
        fg_icon = master_icon.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        fg_icon.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

        print(f"Generated icons for {folder} ({size}x{size})")

if __name__ == "__main__":
    main()
