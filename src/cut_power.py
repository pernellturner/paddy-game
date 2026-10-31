"""Cut the approved base-Paddy boxing sheets (generated/paddy_power/power_<move>.jpg: one row of 9 frames on #FF00FF,
facing right, shared foot baseline) into assets/p/k_bx_<move>_NN.png/.webp and merge them into assets/frames.json as k_bx_<move>.
Frames: 0 pre, 1 load, 2-3 fire, 4-6 impact (built-in hit-stop), 7 retract, 8 guard.
Scale: per sheet, so the guard pose matches the in-game k_m_jabL guard frame.  Usage: python3 src/cut_power.py"""
import numpy as np, json, os
from PIL import Image, ImageFilter
from scipy import ndimage as nd
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
src=open('src/cut_new.py').read(); exec(compile(src[:src.index('NEW=sys.argv')],'cut_new','exec'))   # load(), components(), body()
MOVES=['jab','hook','body','uppercut']
import importlib.util,sys
sys.path.insert(0,'src');import paddy_palette as PP
SHRINK=.8   # v32: the boxing sheets draw a bigger head than idle Paddy; 0.8 brings the head close to idle's while keeping a believable standing height
frames=json.load(open('assets/frames.json'))
def parts(path):
    im,fg=load(path)
    P=[(x0,x1,y0,y1,m[y0:y1,x0:x1],im[y0:y1,x0:x1]) for x0,x1,y0,y1,m in components(fg)]
    P=[p for p in P if (p[4].sum()>2000)]
    return P
cut={m:parts(f'generated/paddy_power/power_{m}.jpg') for m in MOVES}
for m,P in cut.items(): assert len(P)==9,(m,len(P),[(p[0],p[1]) for p in P])
ref=frames['k_m_jabL'][0]['h']                                   # in-game guard height
for m,P in cut.items():
    sc=SHRINK*ref/(P[8][3]-P[8][2]); print(m,'scale %.3f'%sc)   # per sheet: the guard frame (9th) matches the in-game guard height
    ground=int(np.median([p[3] for p in P])); key='k_bx_'+m; frames[key]=[]
    # horizontal anchor = the planted back foot / hips: median x of the bottom 12% of the body, measured in sheet px from each frame's left
    for k,(x0,x1,y0,y1,msk,c) in enumerate(P):
        a=Image.fromarray((msk*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
        c=c.copy(); edge=np.asarray(a)<250; spill=np.minimum(c[...,0],c[...,2])-c[...,1]; fix=edge&(spill>15)
        c[fix,0]-=spill[fix]*.7; c[fix,2]-=spill[fix]*.7
        rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(a)
        rgba=Image.fromarray(PP.grade(np.asarray(rgba).astype(float)))   # v32: idle palette + softer outline
        W,H=max(1,round(rgba.width*sc)),max(1,round(rgba.height*sc)); rgba=rgba.resize((W,H),Image.LANCZOS)
        bm=body(c,msk); ys,xs=np.nonzero(bm); h=msk.shape[0]
        low=bm[int(h*.72):]; lx=np.nonzero(low)[1]
        ax=float(np.median(lx) if len(lx) else np.median(xs))*sc
        ay=(ground-y0)*sc+3
        fn=f'p/{key}_{k:02d}'; rgba.save(f'assets/{fn}.png',optimize=True); rgba.save(f'assets/{fn}.webp',quality=88,method=6)
        frames[key].append(dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=H))
    print(key,[(f['w'],f['h'],f['ax'],f['ay']) for f in frames[key]])
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
