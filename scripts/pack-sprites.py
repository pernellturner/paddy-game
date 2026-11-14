#!/usr/bin/env python3
"""Pack base Paddy frames into a uniform-cell atlas (shared foot origin)."""
import json, math, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "paddy")

def main():
    with open(os.path.join(ROOT, "frames.json")) as f:
        data = json.load(f)
    order = []
    for key in ["idle_test_1", "k_run", "k_jump"]:
        for i, fr in enumerate(data[key]):
            path = os.path.join(ROOT, fr["f"] + ".png")
            im = Image.open(path).convert("RGBA")
            order.append((f"{key}_{i:02d}", fr, im))
    pad = 2
    left = max(fr["ax"] for _, fr, _ in order)
    right = max(fr["w"] - fr["ax"] for _, fr, _ in order)
    up = max(fr["ay"] for _, fr, _ in order)
    down = max(0, max(fr["h"] - fr["ay"] for _, fr, _ in order))
    cell_w = int(math.ceil(left + right + 2 * pad))
    cell_h = int(math.ceil(up + down + 2 * pad))
    foot_x = pad + left
    foot_y = pad + up
    cols = 8
    rows = math.ceil(len(order) / cols)
    sheet = Image.new("RGBA", (cols * cell_w, rows * cell_h), (0, 0, 0, 0))
    frames = {}
    for idx, (name, fr, im) in enumerate(order):
        r, c = divmod(idx, cols)
        cx, cy = c * cell_w, r * cell_h
        sheet.paste(im, (round(cx + foot_x - fr["ax"]), round(cy + foot_y - fr["ay"])), im)
        frames[name] = {
            "frame": {"x": cx, "y": cy, "w": cell_w, "h": cell_h},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": cell_w, "h": cell_h},
            "sourceSize": {"w": cell_w, "h": cell_h},
            "anchor": {"x": foot_x / cell_w, "y": foot_y / cell_h},
        }
    atlas = {
        "frames": frames,
        "meta": {
            "app": "Paddy fresh-start packer",
            "version": "1.0",
            "image": "paddy.png",
            "format": "RGBA8888",
            "size": {"w": sheet.width, "h": sheet.height},
            "scale": "1",
            "cell": {"w": cell_w, "h": cell_h},
            "foot": {"x": foot_x, "y": foot_y},
            "anims": {
                "idle": [f"idle_test_1_{i:02d}" for i in range(len(data["idle_test_1"]))],
                "run": [f"k_run_{i:02d}" for i in range(len(data["k_run"]))],
                "jump": [f"k_jump_{i:02d}" for i in range(len(data["k_jump"]))],
            },
        },
    }
    sheet.save(os.path.join(ROOT, "paddy.png"), optimize=True)
    with open(os.path.join(ROOT, "paddy.json"), "w") as f:
        json.dump(atlas, f, indent=2)
        f.write("\n")
    print(f"packed {len(order)} frames into {sheet.size} cell={cell_w}x{cell_h} foot=({foot_x},{foot_y})")

if __name__ == "__main__":
    main()
