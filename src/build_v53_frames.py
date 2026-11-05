"""v53 practice-combat frames.

Real in-betweens for the base punch string, plus a deeper uppercut crouch and
clean (non-ghost) uppercut in-betweens. Optical-flow halfway morphs are kept
only when the silhouette stays one body (area near the larger parent, head
height near the blend of the two parents). The front-to-back uppercut snap is
NOT morphed — that blend double-exposes Paddy.

Writes assets/p/k_p53_*.png/webp, assets/p/k_uc53_*.png/webp and p53_frames.js.
"""
import json, os
import numpy as np, cv2
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
BASE = os.path.join(ROOT, 'assets', 'p')
FRAMES = json.load(open(os.path.join(ROOT, 'assets', 'frames.json')))

def load_name(name):
    return Image.open(os.path.join(BASE, name + '.png')).convert('RGBA')

def align(imA, axA, ayA, imB, axB, ayB, pad=24):
    AX = pad + int(max(axA, axB))
    AY = pad + int(max(ayA, ayB))
    W = int(AX + pad + max(imA.width - axA, imB.width - axB) + 8)
    H = int(AY + pad + max(imA.height - ayA, imB.height - ayB) + 8)
    cA = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cB = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cA.paste(imA, (int(AX - axA), int(AY - ayA)), imA)
    cB.paste(imB, (int(AX - axB), int(AY - ayB)), imB)
    return np.array(cA), np.array(cB), AX, AY

def fill_rgb(arr):
    rgb = arr[:, :, :3].copy()
    mask = (arr[:, :, 3] > 20).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    for _ in range(16):
        dil = cv2.dilate(mask, k)
        edge = (dil > 0) & (mask == 0)
        if not edge.any():
            break
        blurred = cv2.blur(rgb * mask[:, :, None], (5, 5))
        w = np.maximum(cv2.blur(mask.astype(np.float32), (5, 5)), 1e-3)
        rgb[edge] = (blurred / w[:, :, None]).astype(np.uint8)[edge]
        mask = dil
    return rgb

def morph(imA, axA, ayA, imB, axB, ayB, t=0.5):
    A, B, AX, AY = align(imA, axA, ayA, imB, axB, ayB)
    gA = cv2.cvtColor(fill_rgb(A), cv2.COLOR_RGB2GRAY)
    gB = cv2.cvtColor(fill_rgb(B), cv2.COLOR_RGB2GRAY)
    flowAB = cv2.calcOpticalFlowFarneback(gA, gB, None, 0.5, 5, 21, 3, 7, 1.5, 0)
    flowBA = cv2.calcOpticalFlowFarneback(gB, gA, None, 0.5, 5, 21, 3, 7, 1.5, 0)
    h, w = gA.shape
    xs, ys = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    wA = cv2.remap(A, xs + flowBA[:, :, 0] * t, ys + flowBA[:, :, 1] * t, cv2.INTER_LINEAR,
                   borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    wB = cv2.remap(B, xs + flowAB[:, :, 0] * (1 - t), ys + flowAB[:, :, 1] * (1 - t), cv2.INTER_LINEAR,
                   borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    a1 = wA[:, :, 3:4].astype(np.float32) / 255.0
    a2 = wB[:, :, 3:4].astype(np.float32) / 255.0
    c1 = wA[:, :, :3].astype(np.float32) * a1
    c2 = wB[:, :, :3].astype(np.float32) * a2
    oa = (1 - t) * a1 + t * a2
    oc = (1 - t) * c1 + t * c2
    rgb = np.zeros_like(oc)
    m = oa[:, :, 0] > 0.02
    rgb[m] = oc[m] / np.maximum(oa[m], 1e-3)
    ah = np.clip((oa[:, :, 0] - 0.08) / 0.55, 0, 1)
    out = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), np.clip(ah * 255, 0, 255).astype(np.uint8)])
    ys2, xs2 = np.nonzero(out[:, :, 3] > 16)
    x0, x1 = int(xs2.min()), int(xs2.max() + 1)
    y0, y1 = int(ys2.min()), int(ys2.max() + 1)
    return Image.fromarray(out[y0:y1, x0:x1]), int(AX - x0), int(AY - y0)

def deeper(im, ax, ay, drop):
    """Drop the torso toward the planted feet so the crouch gets deeper. Feet rows stay put (no hop, no rescale)."""
    arr = np.array(im)
    h, w = arr.shape[:2]
    foot = min(h - 1, int(ay))
    ys = np.arange(h)
    t = np.clip(ys / max(1, foot), 0, 1)
    shift = drop * np.clip(1 - ((t - 0.32) / 0.52) ** 2, 0, 1) * (t < 0.90)
    mapy = (ys - shift).astype(np.float32)
    mx, my = np.meshgrid(np.arange(w, dtype=np.float32), mapy)
    warped = cv2.remap(arr, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    foot0 = int(foot * 0.88)
    warped[foot0:] = arr[foot0:]
    return Image.fromarray(warped), int(ax), int(ay)

def area(im, thr=40):
    return int((np.array(im)[:, :, 3] > thr).sum())

def head_h(im, ay):
    ys = np.nonzero(np.array(im)[:, :, 3] > 30)[0]
    if len(ys) == 0:
        return 0
    return int(ay) - int(ys.min())

def chest_w(im, ay):
    a = np.array(im)[:, :, 3]
    ys = np.nonzero(a > 30)[0]
    if len(ys) == 0:
        return 0
    y = int(np.percentile(ys, 42))
    return int((a[y] > 30).sum())

def save(im, name):
    im.save(os.path.join(BASE, name + '.png'))
    im.save(os.path.join(BASE, name + '.webp'), 'WEBP', quality=92, method=6)

def rec(name, im, ax, ay, rx=0):
    return {'f': 'p/' + name, 'ax': int(ax), 'ay': int(ay), 'w': im.size[0], 'h': im.size[1], 'rx': rx}

KEPT = []
SKIPPED = []

def try_morph(name, imA, axA, ayA, imB, axB, ayB, rx=0):
    im, ax, ay = morph(imA, axA, ayA, imB, axB, ayB)
    ar = area(im) / max(1, max(area(imA), area(imB)))
    ha, hb, hi = head_h(imA, ayA), head_h(imB, ayB), head_h(im, ay)
    expect = 0.5 * (ha + hb)
    herr = abs(hi - expect) / max(1, expect)
    # one body, and the head stays between the two parents (no size pop)
    ok = 0.80 <= ar <= 1.18 and herr <= 0.14
    tag = 'KEEP' if ok else 'SKIP'
    print(f'{tag:4} {name:22} area={ar:.2f} head={hi} expect={expect:.0f} err={herr:.2f} {im.size}')
    if not ok:
        SKIPPED.append(name)
        return None
    save(im, name)
    o = rec(name, im, ax, ay, rx)
    KEPT.append(name)
    return o

def main():
    sheets = {
        'bxj1': 'k_ps_jab1', 'bxj2': 'k_ps_jab2', 'bxx': 'k_ps_cross',
        'bxlh': 'k_ps_lhook', 'bxrb': 'k_ps_rbody',
    }
    punch = {}
    loaded = {}
    for anim, sheet in sheets.items():
        L = FRAMES[sheet]
        loaded[anim] = [(load_name(f['f'].split('/')[-1]), f) for f in L]
        punch[anim] = {}
        for i in range(len(L) - 1):
            a_im, a = loaded[anim][i]
            b_im, b = loaded[anim][i + 1]
            o = try_morph(f'k_p53_{anim}_{i+1}', a_im, a['ax'], a['ay'], b_im, b['ax'], b['ay'], b.get('rx', 0))
            if o:
                punch[anim][str(i + 1)] = o
    links_spec = [
        ('bxj1', 'bxj2'), ('bxj1', 'bxx'), ('bxj2', 'bxx'),
        ('bxx', 'bxlh'), ('bxlh', 'bxrb'), ('bxrb', 'bxj1'),
    ]
    link = {}
    for a, b in links_spec:
        # cancel shows the retract (frame 5) then the next punch's frame 1
        a_im, af = loaded[a][5]
        b_im, bf = loaded[b][1]
        o = try_morph(f'k_p53_link_{a}_{b}', a_im, af['ax'], af['ay'], b_im, bf['ax'], bf['ay'])
        if o:
            link.setdefault(a, {})[b] = o

    # uppercut keys (v51 art + the v52 size-fixed straight arm and peak)
    uc_keys = {
        'r': ('k_uc51_0', 61, 220, 22),
        'c': ('k_uc51_1', 61, 215, 22),
        'l': ('k_uc51_2', 56, 215, 22),
        'h': ('k_uc51_3', 52, 220, 22),
        'd': ('k_uc51_4', 50, 227, 22),
        's': ('k_uc52_5', 50, 269, 22),
        'k': ('k_uc52_6', 30, 229, 22),
    }
    uc = {}
    ims = {}
    for key, (nm, ax, ay, rx) in uc_keys.items():
        im = load_name(nm)
        ims[key] = im
        uc[key] = rec(nm, im, ax, ay, rx)
        print(f'KEY  {key:4} {nm:12} chest={chest_w(im, ay):3} head={head_h(im, ay):3}')

    dim, ax, ay = deeper(ims['l'], 56, 215, 20)
    print(f'DEEP deep chest={chest_w(dim, ay):3} head={head_h(dim, ay):3} (load chest={chest_w(ims["l"], 215)})')
    save(dim, 'k_uc53_deep')
    uc['deep'] = rec('k_uc53_deep', dim, ax, ay, 22)
    ims['deep'] = dim

    # second, slightly deeper coil — power wind-up only. Reject if the body width changes (that would be a size pop).
    dim2, ax2, ay2 = deeper(ims['l'], 56, 215, 30)
    cw0, cw2 = chest_w(ims['l'], 215), chest_w(dim2, ay2)
    print(f'DEEP deepb chest={cw2} vs load {cw0} head={head_h(dim2, ay2)}')
    if abs(cw2 - cw0) <= max(6, 0.12 * cw0):
        save(dim2, 'k_uc53_deepb')
        uc['deepb'] = rec('k_uc53_deepb', dim2, ax2, ay2, 22)
        ims['deepb'] = dim2
    else:
        print('SKIP deepb chest width')
        SKIPPED.append('deepb')

    pairs = [
        ('f01', 'r', 'c'),
        ('f12', 'c', 'l'),
        ('ld', 'l', 'deep'),
        ('f34', 'h', 'd'),
        ('f56', 's', 'k'),
    ]
    if 'deepb' in ims:
        pairs.append(('ldb', 'deep', 'deepb'))
    for name, ka, kb in pairs:
        A, B = uc[ka], uc[kb]
        o = try_morph('k_uc53_' + name, ims[ka], A['ax'], A['ay'], ims[kb], B['ax'], B['ay'], 22)
        if o:
            uc[name] = o

    out = {'punch': punch, 'link': link, 'uc': uc, 'kept': KEPT, 'skipped': SKIPPED}
    js_path = os.path.join(ROOT, 'p53_frames.js')
    js = '// generated by src/build_v53_frames.py — do not hand-edit anchors\nwindow.P53F=' + json.dumps(out, separators=(',', ':')) + ';\n'
    open(js_path, 'w').write(js)
    print('WROTE', js_path, 'kept', len(KEPT), 'skipped', SKIPPED)

if __name__ == '__main__':
    main()
