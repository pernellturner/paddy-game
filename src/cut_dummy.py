"""v34: cut the PRACTICE ROOM sparring dummy (TEST art, not approved yet) into game frames.
Source art lives in generated/dummy/ (copied from paddy-sprite-studio/tests/sparring_dummy; see its NOTES.md).
Sheet format: one row of equal cells on #FF00FF, margin 48, gap 40, header of <sheet>_roots.txt gives
  'cell WxHpx, baseline y=B (cell coords), standing base centre x=R'.  Every grounded frame sits on the baseline and the
  standing root (base centre) is at the same x in every cell; lift is already drawn into each cell.
Clean RGBA cells in generated/dummy/frames/<sheet>_NN.png (1-based) are used when present, otherwise the .jpg sheet is
keyed (magenta un-mix, same as src/cut_power.py).
Scale = Paddy's factor: the same sqrt(fur area of the in-game idle frame)/199 that src/cut_power.py uses for his approved
punch sheets, so the 340px dummy stands exactly as tall as his 341px guard (NOTES.md: don't normalise it on its own).

EASY SWAP — drop new sheets into generated/dummy/ and re-run `python3 src/cut_dummy.py`; practice34.js picks them up by key:
  <sheet>_R.jpg            -> sd_<sheet>_r  facing-RIGHT copies (the dummy behind Paddy); a sheet without one is mirrored
  fighter_<move>.jpg       -> sd_fighter_<move>  attacker variant (idle, attack_windup, attack_punch, attack_recover, hit_heavy)
  launched_fall.jpg        -> sd_launched_fall   fall from the apex (lands on its back; knockdown 5 follows, +228px root shift)
  Every <sheet>_roots.txt in generated/dummy/ is cut, so a replacement sheet with the same name just drops in.
Usage: python3 src/cut_dummy.py"""
import numpy as np, json, os, re, glob
from PIL import Image, ImageFilter
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SRC='generated/dummy'; M,GAP=48,40
def catmask(a):
    r,g,b,al=[a[...,i].astype(int) for i in range(4)]; return (al>200)&(((r-b)>18)|((r<110)&(r>b)))
idle=np.asarray(Image.open('assets/p/idle_test_1_00.png').convert('RGBA'))
SC=np.sqrt(catmask(idle).sum())/199.0
print('Paddy factor %.4f'%SC)
def key_alpha(c):
    r,g,b=c[...,0],c[...,1],c[...,2]
    m=np.clip((np.minimum(r,b)-g)/255.0,0,1); m[m<.06]=0
    al=1-m; al[al<.1]=0
    al=np.asarray(Image.fromarray((al*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))).astype(float)/255
    mg=np.array([255,0,255.]); out=(c-m[...,None]*mg)/np.maximum(1-m,.08)[...,None]
    return np.dstack([np.clip(out,0,255),al*255]).astype(np.uint8)
frames=json.load(open('assets/frames.json'))
for k in [k for k in frames if k.startswith('sd_')]: del frames[k]
for f in glob.glob('assets/p/sd_*'): os.remove(f)
sheets=sorted(os.path.basename(f)[:-len('_roots.txt')] for f in glob.glob(SRC+'/*_roots.txt'))
for s in sheets:
    hdr=open(f'{SRC}/{s}_roots.txt').read()
    CW,CH=map(int,re.search(r'cell (\d+)x(\d+)',hdr).groups()); B=int(re.search(r'baseline y=(\d+)',hdr).group(1)); R=int(re.search(r'base centre x=(\d+)',hdr).group(1))
    lifts=[int(l.split()[-1]) for l in hdr.splitlines() if l[:1].isdigit()]; n=len(lifts)
    pngs=[f'{SRC}/frames/{s}_{i+1:02d}.png' for i in range(n)]
    if all(os.path.exists(p) for p in pngs): cells=[Image.open(p).convert('RGBA') for p in pngs]; how='png'
    else:
        im=np.asarray(Image.open(f'{SRC}/{s}.jpg').convert('RGB')).astype(float)
        assert abs(M*2+CW*n+GAP*(n-1)-im.shape[1])<=2,(s,im.shape,CW,n)
        cells=[Image.fromarray(key_alpha(im[:CH,M+i*(CW+GAP):M+i*(CW+GAP)+CW])) for i in range(n)]; how='jpg'
    key='sd_'+(s[:-2]+'_r' if s.endswith('_R') else s); frames[key]=[]
    for i,c in enumerate(cells):
        a=np.asarray(c); ys,xs=np.nonzero(a[...,3]>8); bx0,bx1,by0,by1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
        crop=c.crop((bx0,by0,bx1,by1)); W,H=max(1,round(crop.width*SC)),max(1,round(crop.height*SC)); crop=crop.resize((W,H),Image.LANCZOS)
        fn=f'p/{key}_{i:02d}'; crop.save(f'assets/{fn}.png',optimize=True); crop.save(f'assets/{fn}.webp',quality=88,method=6)
        frames[key].append(dict(f=fn,ax=round((R-bx0)*SC),ay=round((B-by0)*SC)+2,w=W,h=H,lf=round(lifts[i]*SC)))  # lf = drawn lift; the game removes it while its own physics has the dummy airborne
    print(key,how,n,[(f['w'],f['h'],f['ax'],f['ay']) for f in frames[key]])
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
