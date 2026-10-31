"""v33: cut base Paddy's APPROVED on-model punch set into game frames.
Sources (copied from the sprite studio, kept permanently in the repo):
  generated/paddy_strings/string_{jab1,jab2,cross,lhook,rbody,recover}.jpg  (7/3 frames; frame 1 & 7 = shared peek-a-boo guard)
  generated/paddy_power/power_{jab,hook,body,uppercut}.jpg                    (10/11 frames; upright guard first and last)
Sheet format (assemble6.py): one row on #FF00FF, facing right, margin 48, equal cells (width in the _roots.txt header), gap 40,
shared foot baseline, character drawn at its root position inside the cell; _roots.txt = root x of each frame vs frame 1.
Scale: the studio drew every pose at TARGET=199 (sqrt of fur area) = the idle sheet's scale, so one factor = sqrt(fur area of the
in-game idle frame)/199 puts them at idle size. No recolour: the art is already on-model.
Writes assets/p/k_ps_*/k_pw_*_NN.png+.webp and frames.json keys (each frame also gets rx = root offset in frame px).
Usage: python3 src/cut_power.py"""
import numpy as np, json, os, re
from PIL import Image, ImageFilter
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SHEETS={'k_ps_jab1':'generated/paddy_strings/string_jab1','k_ps_jab2':'generated/paddy_strings/string_jab2','k_ps_cross':'generated/paddy_strings/string_cross',
 'k_ps_lhook':'generated/paddy_strings/string_lhook','k_ps_rbody':'generated/paddy_strings/string_rbody','k_ps_rec':'generated/paddy_strings/string_recover',
 'k_pw_jab':'generated/paddy_power/power_jab','k_pw_hook':'generated/paddy_power/power_hook','k_pw_body':'generated/paddy_power/power_body','k_pw_upper':'generated/paddy_power/power_uppercut'}
M,GAP=48,40
def catmask(a):
    r,g,b,al=[a[...,i].astype(int) for i in range(4)]; return (al>200)&(((r-b)>18)|((r<110)&(r>b)))
idle=np.asarray(Image.open('assets/p/idle_test_1_00.png').convert('RGBA'))
SC=np.sqrt(catmask(idle).sum())/199.0
print('game scale %.4f'%SC)
frames=json.load(open('assets/frames.json'))
for k in [k for k in frames if k.startswith('k_bx_')]: del frames[k]
for f in os.listdir('assets/p'):
    if f.startswith('k_bx_'): os.remove('assets/p/'+f)
def key_alpha(c):
    """Un-mix the #FF00FF background. Every colour Paddy and his FX use has green >= min(red, blue); magenta has green 0.
    So m = (min(r,b)-g)/255 is how much magenta is mixed into a pixel: alpha = 1-m, colour = (pixel - m*magenta)/(1-m).
    That keeps soft fur edges, the blue trails and the grey push-off dust clean instead of pink."""
    r,g,b=c[...,0],c[...,1],c[...,2]
    m=np.clip((np.minimum(r,b)-g)/255.0,0,1); m[m<.06]=0
    al=1-m; al[al<.1]=0
    # JPEG noise: lone specks off the body
    al=np.asarray(Image.fromarray((al*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))).astype(float)/255
    mg=np.array([255,0,255.]); out=(c-m[...,None]*mg)/np.maximum(1-m,.08)[...,None]
    return np.clip(out,0,255),al*255
for key,src in SHEETS.items():
    roots=[int(l.split()[-1]) for l in open(src+'_roots.txt') if l[0].isdigit()]
    CW=int(re.search(r'cell width (\d+)',open(src+'_roots.txt').read()).group(1))
    im=np.asarray(Image.open(src+'.jpg').convert('RGB')).astype(float); H=im.shape[0]; n=len(roots)
    assert abs(M*2+CW*n+GAP*(n-1)-im.shape[1])<=2,(key,im.shape,CW,n)
    cells=[]
    for i in range(n):
        x0=M+i*(CW+GAP); c,a=key_alpha(im[:,x0:x0+CW]); cells.append((c,a))
    # reference = frame 1: body centre (median x of the fur in the bottom 28%) and the foot baseline
    c0,a0=cells[0]; rgba0=np.dstack([c0,a0]); m0=catmask(rgba0); ys,xs=np.nonzero(m0); base=ys.max()
    low=m0[int(ys.min()+(base-ys.min())*.72):base+1]; R0=float(np.median(np.nonzero(low)[1]))
    frames[key]=[]
    for i,(c,a) in enumerate(cells):
        al=a.copy(); ys,xs=np.nonzero(al>8); bx0,bx1,by0,by1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
        rgba=Image.fromarray(np.dstack([c,al])[by0:by1,bx0:bx1].astype(np.uint8),'RGBA')
        W,Hh=max(1,round(rgba.width*SC)),max(1,round(rgba.height*SC)); rgba=rgba.resize((W,Hh),Image.LANCZOS)
        ax=(R0+roots[i]-bx0)*SC; ay=(base-by0)*SC+3
        fn=f'p/{key}_{i:02d}'; rgba.save(f'assets/{fn}.png',optimize=True); rgba.save(f'assets/{fn}.webp',quality=88,method=6)
        frames[key].append(dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=Hh,rx=round(roots[i]*SC,1)))
    print(key,n,[(f['w'],f['h'],f['ax'],f['ay'],f['rx']) for f in frames[key]])
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
