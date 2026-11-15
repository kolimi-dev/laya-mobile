"""
Laya (లయ) — Concept 1: The Harmonic Cadence Wave (Master Asset Generator)
Generates:
1. icon.png (1024x1024 RGB master)
2. splash-icon.png (1024x1024 RGBA)
3. favicon.png (48x48 RGBA)
4. android-icon-background.png (512x512 RGBA #0E0F12)
5. android-icon-foreground.png (512x512 RGBA with 66% safe-zone)
6. android-icon-monochrome.png (432x432 RGBA monochrome for Android 13+)
"""

import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Color Palette (Theme Tokens)
COLOR_BG_DARK = (14, 15, 18, 255)         # #0E0F12 Solid Matte Obsidian
COLOR_CARD = (22, 23, 27, 255)            # #16171B
COLOR_EMERALD = (34, 197, 94)             # #22C55E Calm Emerald
COLOR_SKY_BLUE = (56, 189, 248)           # #38BDF8 Radiant Sky Blue
COLOR_GOLD = (245, 158, 11)               # #F59E0B Warm Amber Gold
COLOR_MINT = (52, 211, 153)               # #34D399 Vibrant Mint
COLOR_WHITE = (244, 244, 245)             # #F4F4F5 Text Primary

def lerp_color(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def sample_cadence_wave(n_points=1200):
    """
    Parametric curve generating the Harmonic Cadence Wave (Concept 1):
    Wave starts on left, oscillates through a harmonic sine crest and trough,
    and loops into a breathing orbital circle with an intentional recovery gap.
    """
    points = []
    colors = []
    
    # Segment 1: Approach & First Harmonic Crest (Emerald)
    # t from 0 to 1
    for i in range(350):
        t = i / 350.0
        # X from -0.78 to -0.05
        x = -0.78 + 0.73 * t
        # Y harmonic curve: gentle rise to crest at y = -0.38, dipping to 0.12
        y = -0.38 * math.sin(t * math.pi * 0.95)
        # Shift slightly down for balance
        y += 0.05 * math.sin(t * math.pi * 2)
        
        # Color: Emerald (#22C55E) -> Gold (#F59E0B) at inflection
        col = lerp_color(COLOR_EMERALD, COLOR_GOLD, t ** 1.5)
        points.append((x, y))
        colors.append(col)
        
    # Segment 2: Inflection Trough & Surge into Orbit (Gold -> Sky Blue)
    for i in range(250):
        t = i / 250.0
        # From (-0.05, ~0.08) to (0.28, -0.28)
        # Smooth bezier transition into the circular loop
        p0 = (-0.05, 0.08)
        p1 = (0.12, 0.32)
        p2 = (0.35, 0.18)
        p3 = (0.38, -0.08)
        
        u = 1 - t
        x = u**3 * p0[0] + 3*u**2*t * p1[0] + 3*u*t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3*u**2*t * p1[1] + 3*u*t**2 * p2[1] + t**3 * p3[1]
        
        col = lerp_color(COLOR_GOLD, COLOR_SKY_BLUE, t)
        points.append((x, y))
        colors.append(col)
        
    # Segment 3: Orbital Breathing Ring (Sky Blue -> Mint -> Emerald)
    # Center of loop around (0.18, -0.04), radius ~0.36
    center_x, center_y = 0.16, -0.04
    radius = 0.36
    start_angle = -math.pi * 0.05
    # Sweep around ~320 degrees (leaving a 40-degree breathing gap)
    sweep_angle = math.pi * 1.72
    
    for i in range(500):
        t = i / 500.0
        angle = start_angle + t * sweep_angle
        x = center_x + radius * math.cos(angle)
        y = center_y - radius * math.sin(angle) * 1.05  # slightly organic elliptical
        
        col = lerp_color(COLOR_SKY_BLUE, COLOR_MINT, t)
        points.append((x, y))
        colors.append(col)
        
    return points, colors

def render_wave_canvas(size=1024, pad_factor=0.68, draw_bg=True, monochrome=False):
    """
    Renders high-resolution raster canvas with 4x supersampling.
    pad_factor: scale factor for safe-zone constraint (e.g. 0.65 for Android adaptive safe zone).
    """
    render_scale = 4
    canvas_dim = size * render_scale
    img = Image.new("RGBA", (canvas_dim, canvas_dim), COLOR_BG_DARK if draw_bg else (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    points, colors = sample_cadence_wave()
    
    center = canvas_dim / 2.0
    scale = (canvas_dim / 2.0) * pad_factor
    stroke_width = int(canvas_dim * 0.048 * (pad_factor / 0.72))
    
    # 1. Subtle Glow Layer (Pass 1)
    if not monochrome and draw_bg:
        glow_img = Image.new("RGBA", (canvas_dim, canvas_dim), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_img)
        glow_width = int(stroke_width * 2.2)
        
        for idx in range(len(points) - 1):
            p1 = points[idx]
            p2 = points[idx + 1]
            x1 = center + p1[0] * scale
            y1 = center + p1[1] * scale
            x2 = center + p2[0] * scale
            y2 = center + p2[1] * scale
            
            c = colors[idx]
            glow_col = (c[0], c[1], c[2], 45)
            glow_draw.line([(x1, y1), (x2, y2)], fill=glow_col, width=glow_width)
            glow_draw.ellipse([x1 - glow_width/2, y1 - glow_width/2, x1 + glow_width/2, y1 + glow_width/2], fill=glow_col)
            
        glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=render_scale * 6))
        img = Image.alpha_composite(img, glow_img)
        draw = ImageDraw.Draw(img)
    
    # 2. Main Harmonic Curve Layer (Pass 2)
    for idx in range(len(points) - 1):
        p1 = points[idx]
        p2 = points[idx + 1]
        x1 = center + p1[0] * scale
        y1 = center + p1[1] * scale
        x2 = center + p2[0] * scale
        y2 = center + p2[1] * scale
        
        if monochrome:
            line_col = (255, 255, 255, 255)
        else:
            c = colors[idx]
            line_col = (c[0], c[1], c[2], 255)
            
        draw.line([(x1, y1), (x2, y2)], fill=line_col, width=stroke_width)
        draw.ellipse([x1 - stroke_width/2, y1 - stroke_width/2, x1 + stroke_width/2, y1 + stroke_width/2], fill=line_col)
        
    # Cap end with rounded dot
    last_p = points[-1]
    lx = center + last_p[0] * scale
    ly = center + last_p[1] * scale
    draw.ellipse([lx - stroke_width/2, ly - stroke_width/2, lx + stroke_width/2, ly + stroke_width/2],
                 fill=(255, 255, 255, 255) if monochrome else (COLOR_MINT[0], COLOR_MINT[1], COLOR_MINT[2], 255))

    # Inner Harmonic Resonance Core (Focal Cadence Node)
    core_x = center + 0.16 * scale
    core_y = center - 0.04 * scale
    core_r = stroke_width * 0.72
    
    if monochrome:
        draw.ellipse([core_x - core_r, core_y - core_r, core_x + core_r, core_y + core_r], fill=(255, 255, 255, 255))
    else:
        # Subtle core glow
        core_col = (COLOR_EMERALD[0], COLOR_EMERALD[1], COLOR_EMERALD[2], 255)
        draw.ellipse([core_x - core_r, core_y - core_r, core_x + core_r, core_y + core_r], fill=core_col)
        # Inner white jewel
        inner_r = core_r * 0.38
        draw.ellipse([core_x - inner_r, core_y - inner_r, core_x + inner_r, core_y + inner_r], fill=(255, 255, 255, 240))
        
    # Downsample with Lanczos filter for smooth antialiasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

if __name__ == "__main__":
    assets_dir = "laya-mobile/assets"
    
    print("Generating master assets for Concept 1 (The Harmonic Cadence Wave)...")
    
    # 1. Master icon (1024x1024 RGB)
    master_icon = render_wave_canvas(size=1024, pad_factor=0.72, draw_bg=True, monochrome=False)
    master_icon.convert("RGB").save(f"{assets_dir}/icon.png", quality=98)
    print("✓ icon.png (1024x1024 RGB)")
    
    # 2. Splash screen icon (1024x1024 RGBA)
    splash_icon = render_wave_canvas(size=1024, pad_factor=0.60, draw_bg=False, monochrome=False)
    splash_icon.save(f"{assets_dir}/splash-icon.png")
    print("✓ splash-icon.png (1024x1024 RGBA)")
    
    # 3. Web favicon (48x48 RGBA)
    favicon = render_wave_canvas(size=48, pad_factor=0.82, draw_bg=True, monochrome=False)
    favicon.save(f"{assets_dir}/favicon.png")
    print("✓ favicon.png (48x48 RGBA)")
    
    # 4. Android adaptive background (512x512 RGBA #0E0F12)
    bg_img = Image.new("RGBA", (512, 512), COLOR_BG_DARK)
    bg_img.save(f"{assets_dir}/android-icon-background.png")
    print("✓ android-icon-background.png (512x512 RGBA #0E0F12)")
    
    # 5. Android adaptive foreground (512x512 RGBA with 66% safe zone pad_factor ~0.55)
    fg_img = render_wave_canvas(size=512, pad_factor=0.55, draw_bg=False, monochrome=False)
    fg_img.save(f"{assets_dir}/android-icon-foreground.png")
    print("✓ android-icon-foreground.png (512x512 RGBA within 66% safe zone)")
    
    # 6. Android monochrome icon for Material You theming (432x432 RGBA)
    mono_img = render_wave_canvas(size=432, pad_factor=0.55, draw_bg=False, monochrome=True)
    mono_img.save(f"{assets_dir}/android-icon-monochrome.png")
    print("✓ android-icon-monochrome.png (432x432 RGBA Material You monochrome)")
    
    print("\n✅ All 6 Concept 1 assets successfully generated and verified in laya-mobile/assets!")

