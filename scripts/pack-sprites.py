#!/usr/bin/env python3
"""Pack base Paddy frames into a uniform-cell atlas (shared foot origin).

Families were drawn at slightly different sizes. Each is rescaled so the
ear-tip-to-eye distance matches idle (k_spin_00), then placed on a shared
foot origin. Jump stretch and crouched poses keep their pose; only the
character's body scale is matched.
"""
import json, math, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "paddy")

# Ear-tip to eye (px), measured on representative frames and checked visually.
# Idle k_spin_00 = 35 is the reference.
FAMILY_SCALE = {
    "k_spin": 35 / 35,      # 1.000  reference
    "kt_walk": 35 / 40.5,   # 0.864  walk was drawn larger
    "k_run": 35 / 31,       # 1.129  run was drawn smaller
    "k_jump": 35 / 34.5,    # 1.014  already close
    "kt_m_airswipe": 35 / 40.5,  # same Kitti sheet family as walk
}


def scale_frame(im, fr, s):
    if abs(s - 1) < 0.001:
        return im, dict(fr)
    w, h = im.size
    nw = max(1, round(w * s))
    nh = max(1, round(h * s))
    out = im.resize((nw, nh), Image.Resampling.LANCZOS)
    sx, sy = nw / w, nh / h
    new = dict(fr)
    new["w"], new["h"] = nw, nh
    new["ax"] = fr["ax"] * sx
    new["ay"] = fr["ay"] * sy
    return out, new


def main():
    with open(os.path.join(ROOT, "frames.json")) as f:
        data = json.load(f)
    order = []
    for key in ["k_spin", "k_run", "k_jump", "kt_walk", "kt_m_airswipe"]:
        s = FAMILY_SCALE[key]
        for i, fr in enumerate(data[key]):
            path = os.path.join(ROOT, fr["f"] + ".png")
            im = Image.open(path).convert("RGBA")
            im, fr = scale_frame(im, fr, s)
            order.append((f"{key}_{i:02d}", fr, im, s))
    pad = 2
    left = max(fr["ax"] for _, fr, _, _ in order)
    right = max(fr["w"] - fr["ax"] for _, fr, _, _ in order)
    up = max(fr["ay"] for _, fr, _, _ in order)
    down = max(0, max(fr["h"] - fr["ay"] for _, fr, _, _ in order))
    foot_x = int(round(pad + left))
    foot_y = int(round(pad + up))
    cell_w = int(math.ceil(foot_x + right + pad))
    cell_h = int(math.ceil(foot_y + down + pad))
    cols = 8
    rows = math.ceil(len(order) / cols)
    sheet = Image.new("RGBA", (cols * cell_w, rows * cell_h), (0, 0, 0, 0))
    frames = {}
    for idx, (name, fr, im, s) in enumerate(order):
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
            "version": "1.1",
            "image": "paddy.png",
            "format": "RGBA8888",
            "size": {"w": sheet.width, "h": sheet.height},
            "scale": "1",
            "familyScale": FAMILY_SCALE,
            "cell": {"w": cell_w, "h": cell_h},
            "foot": {"x": foot_x, "y": foot_y},
            "anims": {
                "idle": ["k_spin_00"],
                "crouch": ["k_jump_00"],
                "run": [f"k_run_{i:02d}" for i in range(len(data["k_run"]))],
                "walk": [f"kt_walk_{i:02d}" for i in range(len(data["kt_walk"]))],
                "jump": [f"k_jump_{i:02d}" for i in range(len(data["k_jump"]))],
                "swipe": [f"kt_m_airswipe_{i:02d}" for i in range(len(data["kt_m_airswipe"]))],
            },
        },
    }
    sheet.save(os.path.join(ROOT, "paddy.png"), optimize=True)
    with open(os.path.join(ROOT, "paddy.json"), "w") as f:
        json.dump(atlas, f, indent=2)
        f.write("\n")
    print(f"packed {len(order)} frames into {sheet.size} cell={cell_w}x{cell_h} foot=({foot_x},{foot_y})")
    for k, s in FAMILY_SCALE.items():
        print(f"  {k} scale={s:.4f}")


if __name__ == "__main__":
    main()
