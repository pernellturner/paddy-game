#!/usr/bin/env python3
"""Cuts the painted World 1-1 art (raw/*.jpg, generated paintings) into engine-ready layers, tiles and props.
Run: python3 levels/art/silverdale_1/make_art.py   (deterministic; re-run after replacing a raw painting)"""
import os, json
import numpy as np, cv2
from PIL import Image, ImageFilter
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); R = lambda f: os.path.join(HERE, 'raw', f); O = lambda f: os.path.join(HERE, f)
rgb = lambda f: np.asarray(Image.open(R(f)).convert('RGB')).astype(np.float32)
save = lambda a, f: Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(O(f), optimize=True)

def wrap_x(a, ov):
    """seamless horizontal tiling: crossfade the last `ov` columns into the first ones, drop them"""
    w = a.shape[1]; t = np.linspace(0, 1, ov)[None, :, None]
    out = a[:, :w - ov].copy(); out[:, :ov] = a[:, w - ov:] * (1 - t) + a[:, :ov] * t
    return out
def wrap_xy(a, ov):
    a = wrap_x(a, ov); return wrap_x(a.transpose(1, 0, 2), ov).transpose(1, 0, 2)
def key(a, bg, tol=70, soft=40):
    """alpha from distance to the flat key colour + despill"""
    d = np.sqrt(((a - np.array(bg, np.float32)) ** 2).sum(2))
    al = np.clip((d - tol) / soft, 0, 1)
    m = ndimage.binary_opening(al > 0.5, iterations=1); al = al * m
    a = a.copy(); sp = (a[..., 0] + a[..., 2]) / 2 - a[..., 1]                # magenta spill: R,B high vs G
    fix = (al < 1) & (sp > 40); a[fix, 0] = a[fix, 0] * .8; a[fix, 2] = a[fix, 2] * .8
    return np.dstack([a, al * 255])

man = {'tile': 48, 'layers': [], 'tiles': {}, 'props': {}}

# ---------- SKY + FAR (from far_raw: dusk sky over the Hibiscus Coast hills) ----------
f = rgb('far_raw.jpg'); H, W = f.shape[:2]
hsv = cv2.cvtColor(f.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
hill = (hsv[..., 2] < 150) & (np.arange(H)[:, None] > H * .5)                 # hills are darker than the glowing horizon sky
hill = ndimage.binary_closing(hill, iterations=3)
top = np.array([np.argmax(hill[:, x]) if hill[:, x].any() else H for x in range(W)])
top = np.minimum(ndimage.median_filter(top, 15), int(H * .83))       # keep the Gulf sea strip on the right inside the far layer
rows = np.arange(H)[:, None]
fa = np.clip((rows - top[None, :] + 3) / 6, 0, 1)                              # feathered hill alpha
far = np.dstack([f, fa * 255])
sky = f.copy()
for x in range(W):                                                             # sky: continue the horizon colour down behind the hills
    y0 = max(0, top[x] - 4); sky[y0:, x] = sky[y0 - 1 if y0 else 0, x]
mirror = lambda a: np.concatenate([a, a[:, ::-1]], 1)                   # mirror-tile: seamless, no crossfade ghosts
save(sky, 'sky.png'); save(mirror(far), 'far.png')        # sky is one painting (barely scrolls); far hills mirror-tile

# ---------- MID (Silverdale Centre: big-box precast walls, verandah shops, parking building, lanterns) ----------
m = rgb('mid_raw.jpg'); bgc = m[5, 5]
mag = np.sqrt(((m - bgc) ** 2).sum(2)) < 60
rowsband = np.where(mag.mean(1) < .5)[0]; y0, y1 = rowsband[0] + 2, rowsband[-1] - 2
band = m[y0:y1].copy(); bh, bw = band.shape[:2]
# key the painted sky above the rooflines: floating-range flood fill from the band's top row
u8 = band.astype(np.uint8).copy(); mask = np.zeros((bh + 2, bw + 2), np.uint8)
for x in range(0, bw, 6):
    if mask[1, x + 1] == 0: cv2.floodFill(u8, mask, (x, 0), (0, 0, 0), (7, 7, 7), (7, 7, 7), 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8))
skym = mask[1:-1, 1:-1] > 0
skym = ndimage.binary_opening(skym, iterations=2)
al = 1 - cv2.GaussianBlur(skym.astype(np.float32), (5, 5), 0)
# trim the bottom dark kerb line so the layer sits on its own baseline
mid = np.dstack([band, al * 255]); save(mid, 'mid.png')
man['layers'] += [
  {'id': 'sky', 'file': 'sky.png', 'parallax': [0.012, 0.02], 'anchor': 'top', 'tileX': False, 'note': 'opaque dusk sky + moon, ONE painting, do not tile: draw first at height VH*1.15 (~621 px -> ~1104 px wide); 216 tiles x 48 x 0.012 = 124 px of scroll, so it always covers the 960 px view'},
  {'id': 'far', 'file': 'far.png', 'parallax': [0.12, 0.06], 'anchor': 'bottom', 'baselineFromBottom': 0, 'tileX': True, 'note': 'Hibiscus Coast hills + Hauraki Gulf glimpse; transparent above the ridgeline'},
  {'id': 'mid', 'file': 'mid.png', 'parallax': [0.45, 0.3], 'anchor': 'ground', 'tileX': True, 'height_px': 'scale so the parking building is ~7 tiles tall (draw height ~ 300px at VH 540)', 'note': 'Silverdale Centre buildings; its bottom edge sits on the ground line (surface row 14), behind the playfield'},
  {'id': 'near', 'file': 'near.png', 'parallax': [1.25, 1.0], 'anchor': 'bottom', 'tileX': True, 'alpha': 0.9, 'note': 'dark foreground flax / cabbage trees / bollards IN FRONT of Paddy; sparse, keep under 20% of screen'}]
man['layers'][2]['size'] = [bw, bh]

# ---------- TILES (48 px game tiles, painted @2x = 96 px) ----------
t = rgb('tiles_raw.jpg'); q = t.shape[0] // 2
def tile(a, name, ch, note):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((96, 96), Image.LANCZOS)
    im.save(O(f'tiles/{name}.png')); man['tiles'][name] = {'file': f'tiles/{name}.png', 'char': ch, 'note': note}
    return im
asphalt = t[90:q - 10, 10:q - 10]
tile(wrap_xy(asphalt[:300, :300], 40), 'ground_fill', '#', 'car-park asphalt / ground body (rows below the surface)')
kerb = t[0:q - 10, 10:q - 10]
gt = np.concatenate([kerb[8:56], asphalt[100:250]], 0)                         # kerb lip on top, asphalt under
tile(wrap_x(cv2.resize(gt, (300, 300)), 40), 'ground_top', '# (surface row)', 'paved kerb lip + asphalt: top-most solid tile of a column')
pc = t[0:q - 10, q + 2:2 * q - 10]
tile(pc[0:296, 0:296], 'precast', 'P', 'faceted precast concrete panel (Silverdale Centre walls, retaining wall, stair tower)')
iron = t[q + 6:2 * q - 6, 6:q - 6]
tile(wrap_xy(iron[:300, :300], 30), 'roof_iron', 'R / w', 'corrugated iron verandah roof')
mw = t[q:2 * q, q:2 * q]; cap = np.where(np.abs(mw[:, 250, 2] - mw[:, 250, 0]) < 60)[0]
mall = mw[120:420, 20:480]
tile(wrap_xy(mall[:300, :300], 40), 'mall_wall', 'M', 'cream mall wall / parapet')
par = np.concatenate([mw[36:70, 20:320], mall[:266, :300]], 0)
tile(wrap_x(cv2.resize(par, (300, 300)), 40), 'mall_parapet_top', 'M (surface row)', 'parapet cap on the top row of an M block')
# ledge-grab corner overlay: a bright painted lip so the grabbable edge reads
lip = np.zeros((96, 96, 4), np.uint8); lip[0:10, :, :3] = (255, 214, 120); lip[0:10, :, 3] = 230; lip[10:14, :, :3] = (90, 60, 30); lip[10:14, :, 3] = 160
Image.fromarray(lip).save(O('tiles/ledge_lip.png')); man['tiles']['ledge_lip'] = {'file': 'tiles/ledge_lip.png', 'char': 'L', 'note': 'overlay on top of the tile under an L cell'}
# atlas
names = list(man['tiles']); atlas = Image.new('RGBA', (96 * len(names), 96))
for i, n in enumerate(names):
    atlas.paste(Image.open(O(man['tiles'][n]['file'])).convert('RGBA'), (96 * i, 0)); man['tiles'][n]['atlas'] = [96 * i, 0, 96, 96]
atlas.save(O('tiles_atlas.png'))

# ---------- PROPS (cut from the painted sheet by connected components, reading order) ----------
p = rgb('props_raw.jpg'); pk = key(p, p[4, 4], tol=60, soft=35)
lab, n = ndimage.label(ndimage.binary_dilation(pk[..., 3] > 128, iterations=6))
objs = [(s, i + 1) for i, s in enumerate(ndimage.find_objects(lab)) if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > 4000]
objs.sort(key=lambda o: (round(((o[0][0].start + o[0][0].stop) / 2) / 340), (o[0][1].start + o[0][1].stop) / 2))
PN = [('pohutukawa', 'T trunk at the planting island (x44) + canopy deco h/k', 6.5), ('cabbage_tree', 'background / near-layer accent', 5.5),
      ('puriri', 'T trunk by the exit (x195) + canopy deco k', 6.5), ('flax', 'deco n', 1.6), ('lamp_post', 'deco l (warm light source)', 4.2),
      ('bollard', 'deco o', 1.1), ('trolley', 'deco t / trolley-crate stack', 1.4), ('drainpipe', 'skin on T climbables (tile vertically)', 2.0), ('bench', 'deco, street dressing', 1.2)]
patlas, px = [], 0
for (sl, li), (nm, use, tiles_h) in zip(objs, PN):
    a = pk[sl].copy(); a[..., 3] *= (lab[sl] == li)
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); bb = im.getbbox(); im = im.crop(bb)
    im.save(O(f'props/{nm}.png')); man['props'][nm] = {'file': f'props/{nm}.png', 'size': list(im.size), 'drawHeightTiles': tiles_h, 'anchor': 'bottom-centre on the ground surface', 'use': use}
    patlas.append(im)
print('props found', len(objs))
# props atlas (one row)
aw = sum(i.width for i in patlas) + 4 * len(patlas); ah = max(i.height for i in patlas); pa = Image.new('RGBA', (aw, ah)); x = 0
for (nm, *_), im in zip(PN, patlas): pa.paste(im, (x, ah - im.height)); man['props'][nm]['atlas'] = [x, ah - im.height, im.width, im.height]; x += im.width + 4
pa.save(O('props_atlas.png'))

# ---------- NEAR (foreground dressing built from the painted props, darkened + softened) ----------
NW, NH = 2560, 720; near = Image.new('RGBA', (NW, NH))
def place(nm, x, h, dark=.38, blur=2.5):
    im = Image.open(O(f'props/{nm}.png')); s = h / im.height; im = im.resize((max(1, int(im.width * s)), int(h)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32); a[..., :3] *= dark; a[..., 2] *= 1.15                  # cool, dark silhouette
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
    near.alpha_composite(im, (int(x - im.width / 2), NH - im.height + 12))
for x, nm, h in [(140, 'flax', 230), (620, 'bollard', 150), (1240, 'cabbage_tree', 520), (1700, 'flax', 260), (2050, 'flax', 210), (2380, 'bollard', 140)]:
    place(nm, x, h)
near.save(O('near.png'))

# ---------- LIGHT / ATMOSPHERE overlay (multiply-ish dusk grade + vignette), drawn last over the playfield ----------
LW, LH = 960, 540; yy, xx = np.mgrid[0:LH, 0:LW]
vig = np.clip(((xx - LW / 2) / (LW * .62)) ** 2 + ((yy - LH * .55) / (LH * .75)) ** 2, 0, 1)
lt = np.zeros((LH, LW, 4), np.float32); lt[..., 0] = 40; lt[..., 1] = 20; lt[..., 2] = 90
lt[..., 3] = 255 * (0.10 + 0.42 * vig ** 1.6)
save(lt, 'light_vignette.png')
glow = np.zeros((256, 256, 4), np.float32); r = np.sqrt((np.mgrid[0:256, 0:256] - 127.5) ** 2).sum(0) if False else np.hypot(*(np.mgrid[0:256, 0:256] - 127.5))
glow[..., 0] = 255; glow[..., 1] = 196; glow[..., 2] = 120; glow[..., 3] = 255 * np.clip(1 - r / 128, 0, 1) ** 2.2
save(glow, 'light_glow.png')
man['lighting'] = {
  'vignette': {'file': 'light_vignette.png', 'blend': 'source-over', 'note': 'screen-space dusk grade + purple vignette, drawn after sprites, before UI'},
  'glow': {'file': 'light_glow.png', 'blend': 'lighter', 'note': "additive warm pool: draw at every deco 'l' lamp (radius ~3 tiles) and along the lantern strings; pulse 3% on big hits"},
  'lanterns': {'note': 'string of paper lanterns (Training Arena look) across each brawl zone at ~row 3-4, BACKGROUND only, no collision', 'colours': ['#ff8a3d', '#ffd166', '#3fd1a8', '#ff5e7a']},
  'fog': {'note': 'thin ground haze: 40 px tall gradient rgba(150,120,200,.18) along the ground line, parallax 0.9'}}
man['zones_art'] = {'brawl': 'open sky above, lanterns + lamps at the edges, mid layer fully visible', 'trav': 'painted solid blocks (precast / iron / mall tiles) carry the climbable shapes'}
json.dump(man, open(O('manifest.json'), 'w'), indent=1)
print(list(man["tiles"]), list(man["props"]))
