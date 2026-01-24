#!/usr/bin/env python3
"""Generate app icons for Word Search by AprilMay"""

from PIL import Image, ImageDraw, ImageFont
import os

# Ocean theme colors
SKY_BLUE = (135, 206, 235)      # #87CEEB
TURQUOISE = (64, 224, 208)      # #40E0D0
WHITE = (255, 255, 255)
POWDER_BLUE = (176, 224, 230)   # #B0E0E6 - bubble border
DEEP_OCEAN = (30, 58, 95)       # #1E3A5F - text color

def create_gradient(size, color1, color2):
    """Create a diagonal gradient background"""
    img = Image.new('RGB', (size, size))
    for y in range(size):
        for x in range(size):
            # Diagonal gradient
            ratio = (x + y) / (2 * size)
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            img.putpixel((x, y), (r, g, b))
    return img

def create_icon(size=1024):
    """Create the WS bubble icon"""
    # Create gradient background
    img = create_gradient(size, SKY_BLUE, TURQUOISE)
    draw = ImageDraw.Draw(img)

    # Bubble sizes and positions
    bubble_radius = int(size * 0.28)
    bubble_y = size // 2

    # Left bubble (W) - slightly left of center
    left_x = int(size * 0.32)
    # Right bubble (S) - slightly right of center
    right_x = int(size * 0.68)

    # Draw bubble shadows (subtle)
    shadow_offset = int(size * 0.015)
    shadow_color = (100, 180, 190, 80)

    # Draw bubbles (white circles with border)
    for bx in [left_x, right_x]:
        # Outer border
        draw.ellipse(
            [bx - bubble_radius - 4, bubble_y - bubble_radius - 4,
             bx + bubble_radius + 4, bubble_y + bubble_radius + 4],
            fill=POWDER_BLUE
        )
        # White bubble
        draw.ellipse(
            [bx - bubble_radius, bubble_y - bubble_radius,
             bx + bubble_radius, bubble_y + bubble_radius],
            fill=WHITE
        )
        # Inner highlight (top-left shine)
        highlight_radius = int(bubble_radius * 0.2)
        highlight_x = bx - int(bubble_radius * 0.4)
        highlight_y = bubble_y - int(bubble_radius * 0.4)
        draw.ellipse(
            [highlight_x - highlight_radius, highlight_y - highlight_radius,
             highlight_x + highlight_radius, highlight_y + highlight_radius],
            fill=(255, 255, 255, 200)
        )

    # Try to use a nice font, fall back to default
    font_size = int(size * 0.32)
    try:
        # Try common system fonts
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
        font = None
        for fp in font_paths:
            if os.path.exists(fp):
                font = ImageFont.truetype(fp, font_size)
                break
        if font is None:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Draw letters
    for letter, bx in [("W", left_x), ("S", right_x)]:
        # Get text bounding box for centering
        bbox = draw.textbbox((0, 0), letter, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        text_x = bx - text_width // 2
        text_y = bubble_y - text_height // 2 - int(size * 0.02)  # Slight adjustment for visual center

        draw.text((text_x, text_y), letter, fill=DEEP_OCEAN, font=font)

    return img

def create_splash(size=2048):
    """Create splash screen with centered icon"""
    # Create gradient background
    img = create_gradient(size, SKY_BLUE, TURQUOISE)

    # Create smaller icon and paste in center
    icon_size = size // 2
    icon = create_icon(icon_size)

    paste_x = (size - icon_size) // 2
    paste_y = (size - icon_size) // 2
    img.paste(icon, (paste_x, paste_y))

    return img

def main():
    assets_dir = "assets"

    # Generate main icon (1024x1024)
    print("Generating icon.png (1024x1024)...")
    icon = create_icon(1024)
    icon.save(os.path.join(assets_dir, "icon.png"))

    # Generate adaptive icon for Android (1024x1024)
    print("Generating adaptive-icon.png (1024x1024)...")
    icon.save(os.path.join(assets_dir, "adaptive-icon.png"))

    # Generate favicon (48x48)
    print("Generating favicon.png (48x48)...")
    favicon = create_icon(192)  # Generate larger, then resize for quality
    favicon = favicon.resize((48, 48), Image.Resampling.LANCZOS)
    favicon.save(os.path.join(assets_dir, "favicon.png"))

    # Generate splash icon (512x512 centered element)
    print("Generating splash-icon.png (512x512)...")
    splash_icon = create_icon(512)
    splash_icon.save(os.path.join(assets_dir, "splash-icon.png"))

    print("Done! All icons generated in assets/")

if __name__ == "__main__":
    main()
