#!/usr/bin/env python3
"""
Letter Tile Generator for Word Puzzle Application
Following the Ludic Precision design philosophy
Refined version with enhanced dimensionality and polish
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

# Configuration
TILE_SIZE = 512
FONT_PATH = "/home/hsik/.claude/plugins/cache/anthropic-agent-skills/document-skills/69c0b1a06741/skills/canvas-design/canvas-fonts/BigShoulders-Bold.ttf"
OUTPUT_DIR = "/home/hsik/Desktop/Projects/WordPuzzle/assets"

# Refined color palette - sophisticated warmth
COLORS = {
    'tile_face': (250, 245, 235),       # Warm cream face
    'tile_top': (255, 252, 247),        # Bright top edge (light hits here)
    'tile_right': (238, 232, 220),      # Subtle right shadow
    'tile_bottom': (228, 220, 205),     # Bottom edge shadow
    'tile_left': (245, 240, 230),       # Left edge slightly lit
    'inner_shadow': (235, 228, 215),    # Inner edge shadow
    'letter': (52, 48, 42),             # Deep warm charcoal
    'letter_shadow': (200, 192, 180),   # Very subtle emboss shadow
    'outer_shadow': (180, 170, 155),    # Drop shadow color
}


def create_refined_tile(letter: str, size: int = TILE_SIZE) -> Image.Image:
    """Create a meticulously crafted letter tile with dimensional quality."""

    # Canvas with padding for shadow
    padding = int(size * 0.06)
    canvas_size = size + padding * 2
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))

    # Tile dimensions
    tile_margin = padding
    tile_size = size
    corner_radius = int(size * 0.10)

    # Create the layered tile effect
    img = draw_dimensional_tile(img, tile_margin, tile_size, corner_radius)

    # Add the letter with subtle depth
    img = draw_letter(img, letter, tile_margin, tile_size)

    # Add refined drop shadow
    img = add_refined_shadow(img, tile_margin, tile_size, corner_radius)

    return img


def draw_dimensional_tile(img: Image.Image, margin: int, size: int, radius: int) -> Image.Image:
    """Draw a tile with subtle 3D beveled edges."""
    draw = ImageDraw.Draw(img)

    # Main tile face
    face_rect = (margin, margin, margin + size, margin + size)
    draw_rounded_rect(draw, face_rect, radius, COLORS['tile_face'])

    # Top highlight edge (1-2px bright line along top)
    for i in range(2):
        alpha = 180 - i * 60
        highlight = (*COLORS['tile_top'][:3], alpha)
        y = margin + i + 2
        # Draw arc for top-left corner
        draw.arc([margin + 2, margin + 2, margin + radius * 2 + 2, margin + radius * 2 + 2],
                 180, 270, fill=highlight, width=1)
        # Top edge line
        draw.line([(margin + radius, y), (margin + size - radius, y)],
                  fill=COLORS['tile_top'], width=1)
        # Draw arc for top-right corner
        draw.arc([margin + size - radius * 2 - 2, margin + 2,
                  margin + size - 2, margin + radius * 2 + 2],
                 270, 360, fill=highlight, width=1)

    # Left edge subtle highlight
    for i in range(2):
        x = margin + i + 2
        draw.line([(x, margin + radius), (x, margin + size - radius)],
                  fill=COLORS['tile_left'], width=1)

    # Bottom shadow edge
    for i in range(3):
        y = margin + size - i - 2
        intensity = 40 - i * 12
        shadow = (*COLORS['tile_bottom'][:3], intensity + 100)
        draw.line([(margin + radius, y), (margin + size - radius, y)],
                  fill=COLORS['tile_bottom'], width=1)

    # Right shadow edge
    for i in range(3):
        x = margin + size - i - 2
        draw.line([(x, margin + radius), (x, margin + size - radius)],
                  fill=COLORS['tile_right'], width=1)

    # Inner subtle shadow (creates depth impression)
    inner_margin = 6
    for i in range(4):
        alpha = 25 - i * 5
        if alpha > 0:
            inner_rect = (margin + inner_margin + i, margin + inner_margin + i,
                         margin + size - inner_margin - i, margin + size - inner_margin - i)
            inner_color = (*COLORS['inner_shadow'][:3], alpha)
            draw_rounded_rect_outline(draw, inner_rect, radius - inner_margin, inner_color)

    return img


def draw_rounded_rect(draw: ImageDraw.Draw, rect: tuple, radius: int, fill: tuple):
    """Draw a filled rounded rectangle."""
    x1, y1, x2, y2 = rect

    # Main body
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)

    # Corners
    draw.ellipse([x1, y1, x1 + radius * 2, y1 + radius * 2], fill=fill)
    draw.ellipse([x2 - radius * 2, y1, x2, y1 + radius * 2], fill=fill)
    draw.ellipse([x1, y2 - radius * 2, x1 + radius * 2, y2], fill=fill)
    draw.ellipse([x2 - radius * 2, y2 - radius * 2, x2, y2], fill=fill)


def draw_rounded_rect_outline(draw: ImageDraw.Draw, rect: tuple, radius: int, color: tuple):
    """Draw a rounded rectangle outline."""
    x1, y1, x2, y2 = rect

    # Edges
    draw.line([(x1 + radius, y1), (x2 - radius, y1)], fill=color, width=1)
    draw.line([(x1 + radius, y2), (x2 - radius, y2)], fill=color, width=1)
    draw.line([(x1, y1 + radius), (x1, y2 - radius)], fill=color, width=1)
    draw.line([(x2, y1 + radius), (x2, y2 - radius)], fill=color, width=1)

    # Corner arcs
    draw.arc([x1, y1, x1 + radius * 2, y1 + radius * 2], 180, 270, fill=color, width=1)
    draw.arc([x2 - radius * 2, y1, x2, y1 + radius * 2], 270, 360, fill=color, width=1)
    draw.arc([x1, y2 - radius * 2, x1 + radius * 2, y2], 90, 180, fill=color, width=1)
    draw.arc([x2 - radius * 2, y2 - radius * 2, x2, y2], 0, 90, fill=color, width=1)


def draw_letter(img: Image.Image, letter: str, margin: int, size: int) -> Image.Image:
    """Draw the letter with subtle embossed effect."""
    draw = ImageDraw.Draw(img)

    # Font sizing for optical balance
    font_size = int(size * 0.55)
    try:
        font = ImageFont.truetype(FONT_PATH, font_size)
    except:
        font = ImageFont.load_default()

    # Calculate precise centering
    bbox = draw.textbbox((0, 0), letter, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center within tile with optical adjustment
    center_x = margin + size // 2
    center_y = margin + size // 2
    x = center_x - text_width // 2 - bbox[0]
    y = center_y - text_height // 2 - bbox[1] - int(size * 0.015)

    # Subtle emboss: light above, shadow below
    # Light edge (top-left) - very subtle
    draw.text((x - 1, y - 1), letter, font=font, fill=(255, 252, 247, 40))

    # Shadow edge (bottom-right) - creates depth
    shadow_offset = 2
    draw.text((x + shadow_offset, y + shadow_offset), letter,
              font=font, fill=COLORS['letter_shadow'])

    # Main letter
    draw.text((x, y), letter, font=font, fill=COLORS['letter'])

    return img


def add_refined_shadow(img: Image.Image, margin: int, size: int, radius: int) -> Image.Image:
    """Add a soft, realistic drop shadow."""
    canvas_size = img.size[0]

    # Create shadow on separate layer
    shadow_layer = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)

    # Shadow offset (light from top-left)
    shadow_offset_x = 4
    shadow_offset_y = 6

    # Draw shadow shape
    shadow_rect = (margin + shadow_offset_x, margin + shadow_offset_y,
                   margin + size + shadow_offset_x, margin + size + shadow_offset_y)
    draw_rounded_rect(shadow_draw, shadow_rect, radius, (0, 0, 0, 35))

    # Blur the shadow
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=8))

    # Composite: shadow behind tile
    result = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    result = Image.alpha_composite(result, shadow_layer)
    result = Image.alpha_composite(result, img)

    return result


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    letter = "A"
    tile = create_refined_tile(letter)

    # Save PNG
    png_path = os.path.join(OUTPUT_DIR, f"letter_{letter}.png")
    tile.save(png_path, "PNG", optimize=True)
    print(f"Saved PNG: {png_path}")

    # Save JPEG with white background
    jpeg_img = Image.new('RGB', tile.size, (255, 255, 255))
    jpeg_img.paste(tile, (0, 0), tile)

    jpeg_path = os.path.join(OUTPUT_DIR, f"letter_{letter}.jpg")
    jpeg_img.save(jpeg_path, "JPEG", quality=95, optimize=True)
    print(f"Saved JPEG: {jpeg_path}")

    print(f"\nTile size: {tile.size[0]}x{tile.size[1]} pixels")


if __name__ == "__main__":
    main()
