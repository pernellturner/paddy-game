"""Cut generated/ sprite sheets (single row, magenta/pink bg) into consistently
scaled frames with a shared ground line. Writes assets/p/*.png + assets/frames.json"""
import numpy as np, json, os, glob, sys
from PIL import Image, ImageFilter
from scipy import ndimage as nd
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
PADDY='idle_test_1 run jump doublejump dash divebomb stalk walk startstop hardland wingeddash wallclimb walljump ledge wiggle slide clawcombo dashstrike uppercut airswipe airspin diveclaw pounce tailwhip energyblast finisher hurt victory groom stretch sitflick sniff loaf hiss swat zoomies catchrat carryrat'.split()
TIGER='idle run jump claw pounce roar fireball hurt victory morph'.split()
AIR={'jump','doublejump','airspin','airswipe','divebomb','diveclaw','wingeddash','wallclimb','walljump','ledge','pounce','t_jump','t_pounce'}
FIX={'t_jump':1.3,'t_claw':1.2,'t_run':1.15}  # flame-heavy sheets fool the area metric; matched to t_run by eye
SKIP=set(sys.argv[1:])
ref=np.asarray(Image.open('assets/s1_05.png'))[...,3]>128
TARGET=np.sqrt(ref.sum())   # match the size of the original idle Paddy
def load(path):
    im=np.asarray(Image.open(path).convert('RGB')).astype(float)
    r,g,b=im[...,0],im[...,1],im[...,2]
    e=np.concatenate([im[:8].reshape(-1,3),im[-8:].reshape(-1,3)]); bg=np.median(e,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    mag=((r-g>60)&(b-g>15)&(r>110)&(r>b))|(d<45)
    fg=nd.binary_opening(~mag,iterations=2)
    return im,fg
def components(fg):
    """connected components; small bits (fx, flames, rats' tails) join the nearest big one"""
    lab,n=nd.label(nd.binary_dilation(fg,iterations=2))
    objs=nd.find_objects(lab); areas=nd.sum(fg,lab,range(1,n+1))
    big=[i for i in range(n) if areas[i]>0.25*areas.max()]
    groups={i:[i] for i in big}
    for i in range(n):
        if i in groups or areas[i]<30: continue
        sy,sx=objs[i]
        def dist(j):
            ty,tx=objs[j]
            dx=max(0,tx.start-sx.stop,sx.start-tx.stop); dy=max(0,ty.start-sy.stop,sy.start-ty.stop)
            return dx*dx+dy*dy
        groups[min(big,key=dist)].append(i)
    out=[]
    for g in groups.values():
        m=np.isin(lab,[i+1 for i in g])&fg
        ys,xs=np.nonzero(m); out.append((xs.min(),xs.max()+1,ys.min(),ys.max()+1,m))
    return sorted(out,key=lambda o:(o[0]+o[1]))
def body(im,m):
    r,g,b=im[...,0],im[...,1],im[...,2]
    fx=(b>r+20)|((r>200)&(g>200)&(b>200)&False)
    return m&~fx
os.makedirs('assets/p',exist_ok=True)
for f in glob.glob('assets/p/*.png'): os.remove(f)
frames={}; report=[]
jobs=[(n,f'generated/{n}.png' if os.path.exists(f'generated/{n}.png') else f'generated/{n}.jpg',1.0) for n in PADDY]+[('t_'+n,f'generated/tiger/{n}.jpg',1.35) for n in TIGER]
for name,path,mul in jobs:
    if name in SKIP: continue
    im,fg=load(path)
    parts=[(x0,x1,y0,y1,m[y0:y1,x0:x1],im[y0:y1,x0:x1]) for x0,x1,y0,y1,m in components(fg)]
    mw=np.median([p[1]-p[0] for p in parts]); n0=len(parts)
    # drop frames cut by the sheet edge or two overlapping frames fused together
    parts=[p for p in parts if p[0]>2 and p[1]<fg.shape[1]-2 and p[1]-p[0]<1.45*mw]
    dropped=n0-len(parts)
    areas=[np.sqrt(body(c,m).sum()) for *_,m,c in parts]
    sc=TARGET*mul/np.median(areas)
    sc=FIX.get(name,sc)
    ground=int(np.median([p[3] for p in parts]))
    frames[name]=[]
    for k,(s0,s1,y0,y1,m,c) in enumerate(parts):
        a=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
        c=c.copy(); edge=np.asarray(a)<250
        spill=np.minimum(c[...,0],c[...,2])-c[...,1]; fix=edge&(spill>15)
        c[fix,0]-=spill[fix]*.7; c[fix,2]-=spill[fix]*.7
        rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(a)
        W,H=max(1,round(rgba.width*sc)),max(1,round(rgba.height*sc))
        rgba=rgba.resize((W,H),Image.LANCZOS)
        bm=body(c,m); ys,xs=np.nonzero(bm)
        ax=float(np.median(xs))*sc if len(xs) else W/2
        ay=H if name in AIR else (ground-y0)*sc
        fn=f'p/{name}_{k:02d}'; rgba.save(f'assets/{fn}.png',optimize=True)
        frames[name].append(dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=H))
    report.append(f'{name}: {len(parts)} frames scale {sc:.3f}'+(f' (dropped {dropped} fused/cut-off)' if dropped else ''))
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
print('\n'.join(report))
