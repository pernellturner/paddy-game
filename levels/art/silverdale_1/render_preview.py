#!/usr/bin/env python3
"""Reference compositor: draws levels/silverdale_1.json with the painted art exactly the way the README asks the engine to
(sky -> far -> mid -> tiles + props + lanterns + lamp glow -> near -> vignette) at VW 960 x VH 540, camera at the bottom.
python3 levels/art/silverdale_1/render_preview.py  -> preview_brawl.png, preview_traversal.png"""
import os, json, math
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); A = lambda f: Image.open(os.path.join(HERE, f)).convert('RGBA')
L = json.load(open(os.path.join(HERE, '..', '..', 'silverdale_1.json'))); M = json.load(open(os.path.join(HERE, 'manifest.json')))
TS, VW, VH = 48, 960, 540; S, D = L['layers']['solid'], L['layers']['deco']; H, W = L['height'], L['width']
T = {k: A(v['file']).resize((TS, TS), Image.LANCZOS) for k, v in M['tiles'].items()}
P = {k: A(v['file']) for k, v in M['props'].items()}
def prop(img, nm, cx, base_y, h_tiles):
    p = P[nm]; h = int(h_tiles * TS); w = int(p.width * h / p.height); img.alpha_composite(p.resize((w, h), Image.LANCZOS), (int(cx - w / 2), int(base_y - h)))
def tiled(img, layer, ox, y, h):
    s = h / layer.height; lw = int(layer.width * s); l2 = layer.resize((lw, int(h)), Image.LANCZOS); x = -(ox % lw)
    while x < VW: img.alpha_composite(l2, (int(x), int(y))) if x > -lw else None; x += lw
SOL = lambda c, r: 0 <= c < W and (r >= H or (r >= 0 and S[r][c] in '#L'))
def shade(t, c, r):
    """the edge-shading pass the engine should do per solid tile: dusk tint, lit top lip, dark exposed sides, AO at the foot"""
    ov = Image.new('RGBA', (TS, TS)); d = ImageDraw.Draw(ov, 'RGBA'); h = (c * 73856093 ^ r * 19349663) % 7
    d.rectangle([0, 0, TS, TS], fill=(40, 25, 90, 52 + 6 * h))                                  # dusk grade + slight per-tile variation
    if not SOL(c, r - 1):
        d.rectangle([0, 0, TS, 3], fill=(255, 205, 150, 150)); d.rectangle([0, 4, TS, 6], fill=(255, 205, 150, 50))
    for side, ox in ((-1, 0), (1, TS - 1)):
        if not SOL(c + side, r):
            for i in range(12): d.line([(ox - side * i, 0), (ox - side * i, TS)], fill=(20, 10, 40, int(120 * (1 - i / 12))))
    if r < 14 and r + 1 >= 14:                                                                   # ambient occlusion where a wall meets the ground
        for i in range(16): d.line([(0, TS - 1 - i), (TS, TS - 1 - i)], fill=(15, 8, 30, int(110 * (1 - i / 16))))
    if r >= 14: d.rectangle([0, 0, TS, TS], fill=(20, 12, 45, 70 + 25 * (r - 14)))              # ground darker than the walls
    t = t.copy(); t.alpha_composite(ov); return t
def render(camx, out):
    camy = H * TS - VH; img = Image.new('RGBA', (VW, VH)); gy = 14 * TS - camy
    sky = A('sky.png'); sh = VH * 1.15; sw = int(sky.width * sh / sky.height); img.alpha_composite(sky.resize((sw, int(sh))), (int(-camx * .012), int(-camy * .02 - 40)))
    tiled(img, A('far.png'), camx * .12, gy + 60 - 520, 520)
    tiled(img, A('mid.png'), camx * .45, gy + 14 - 300, 300)
    # lanterns over brawl zones (background, no collision)
    d = ImageDraw.Draw(img); cols = M['lighting']['lanterns']['colours']
    for a in L['arenas']:
        x0, x1 = a['x0'] * TS - camx, (a['x1'] + 1) * TS - camx
        if x1 < 0 or x0 > VW: continue
        for k, yb in enumerate((gy - 360,)):
            pts = [(x0 + (x1 - x0) * i / 60, yb + 38 * (1 - (2 * ((i / 15) % 1) - 1) ** 2)) for i in range(61)]   # sags between 4 posts
            d.line(pts, fill=(30, 20, 40, 255), width=2)
            for i in range(3, 60, 6):
                lx, ly = pts[i]; c = cols[(i // 6 + k) % 4]; rgb = tuple(int(c[j:j + 2], 16) for j in (1, 3, 5))
                g = A('light_glow.png').resize((70, 70)); img.alpha_composite(g, (int(lx - 35), int(ly - 25)))
                d.ellipse([lx - 9, ly, lx + 9, ly + 22], fill=rgb + (255,), outline=(60, 30, 20, 255))
    # tiles
    for r in range(H):
        for c in range(W):
            x, y = c * TS - camx, r * TS - camy
            if x < -TS or x > VW or y < -TS or y > VH: continue
            ch, dk = S[r][c], D[r][c]; top = r == 0 or S[r - 1][c] not in '#L'
            if ch in '#L':
                k = {'P': 'precast', 't': 'precast', 'M': 'mall_parapet_top' if top else 'mall_wall', 'w': 'mall_wall', 'R': 'roof_iron'}.get(dk, 'ground_top' if top else 'ground_fill')
                if dk == 'w' and top: k = 'roof_iron'
                img.alpha_composite(shade(T[k], c, r), (x, y))
                if ch == 'L': img.alpha_composite(T['ledge_lip'], (x, y))
    # trunks / pipes / deco props
    for tr in L['trees']:
        t = tr['trunk']; nm = 'pohutukawa' if 'ohutukawa' in tr['name'] else 'puriri'
        prop(img, nm, (t['x'] + .5) * TS - camx, (t['base'] + 1) * TS - camy + 6, t['base'] - t['top'] + 4)
    for cl in L['climbables']:
        p = P['drainpipe']; h = (cl['base'] - cl['top'] + 1) * TS; img.alpha_composite(p.resize((22, h)), (int((cl['x'] + .5) * TS - camx - 11), cl['top'] * TS - camy))
    for r in range(H):
        for c in range(W):
            dk = D[r][c]; x = (c + .5) * TS - camx; by = (r + 1) * TS - camy + 4
            if not -200 < x < VW + 200: continue
            if dk == 'l':
                prop(img, 'lamp_post', x, by, 4.2); g = A('light_glow.png').resize((260, 260)); img.alpha_composite(g, (int(x - 130), int(by - 4.0 * TS - 110)))
            elif dk == 'n': prop(img, 'flax', x, by, 1.6)
            elif dk == 'o': prop(img, 'bollard', x, by, 1.1)
            elif dk == 't' and (r == 0 or D[r - 1][c] != 't'): prop(img, 'trolley', x, (r) * TS - camy + 4, 1.3)
    # ground haze, near layer, vignette
    hz = Image.new('RGBA', (VW, 60)); hd = ImageDraw.Draw(hz)
    for i in range(60): hd.line([(0, i), (VW, i)], fill=(150, 120, 200, int(46 * (1 - abs(i - 30) / 30))))
    img.alpha_composite(hz, (0, gy - 40))
    near = A('near.png'); nh = VH * .42; nw = int(near.width * nh / near.height); n2 = near.resize((nw, int(nh))); x = -((camx * 1.25) % nw)
    while x < VW: img.alpha_composite(n2, (int(x), int(VH - nh + 30))); x += nw
    img.alpha_composite(A('light_vignette.png'))
    img.convert('RGB').save(os.path.join(HERE, out)); print('wrote', out)
render(16 * TS, 'preview_brawl.png')
render(84 * TS, 'preview_traversal.png')
