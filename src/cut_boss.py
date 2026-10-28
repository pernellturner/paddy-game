"""Cut the Big Bruno boss sheets (generated/boss) + arena props into assets/p/b_*.png / prop_*.png and merge into frames.json.
Usage: python3 src/cut_boss.py [sheet ...]"""
import numpy as np, json, os, sys
from PIL import Image, ImageFilter
from scipy import ndimage as nd
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def load(path):
    im=np.asarray(Image.open(path).convert('RGB')).astype(float)
    r,g,b=im[...,0],im[...,1],im[...,2]
    e=np.concatenate([im[:8].reshape(-1,3),im[-8:].reshape(-1,3)]); bg=np.median(e,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    mag=((r-g>60)&(b-g>15)&(r>110)&(r>b))|(d<45)
    pinkfx=(r>g+25)&(b>g+8)&(g>110)          # light pink swoosh lines drawn by the generator
    fg=nd.binary_opening(~(mag|pinkfx),iterations=2)
    return im,fg
def components(fg,it=3):
    lab,n=nd.label(nd.binary_dilation(fg,iterations=it))
    objs=nd.find_objects(lab); areas=nd.sum(fg,lab,range(1,n+1))
    big=[i for i in range(n) if areas[i]>0.25*areas.max()]
    groups={i:[i] for i in big}
    for i in range(n):
        if i in groups or areas[i]<40: continue
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
def parts_of(path,it=3):
    im,fg=load(path)
    parts=[(x0,x1,y0,y1,m[y0:y1,x0:x1],im[y0:y1,x0:x1]) for x0,x1,y0,y1,m in components(fg,it)]
    return [p for p in parts if p[0]>2 and p[1]<fg.shape[1]-2]

FIX={}
AIR={'hurt'}
frames=json.load(open('assets/frames.json'))
idle=parts_of('generated/boss/idle.jpg'); A0=np.median([np.sqrt(p[4].sum()) for p in idle])
def cut(path,name,sc_mode=True,anchor_air=False,it=3):
    parts=parts_of(path,it)
    sc=(A0/np.median([np.sqrt(p[4].sum()) for p in parts]) if sc_mode else 1)*FIX.get(name,1)
    ground=int(np.median([p[3] for p in parts])); frames[name]=[]
    for kk,(x0,x1,y0,y1,m,c) in enumerate(parts):
        a=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
        c=c.copy(); edge=np.asarray(a)<250
        spill=np.minimum(c[...,0],c[...,2])-c[...,1]; fix=edge&(spill>15)
        c[fix,0]-=spill[fix]*.7; c[fix,2]-=spill[fix]*.7
        rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(a)
        W,Hh=max(1,round(rgba.width*sc)),max(1,round(rgba.height*sc))
        if sc!=1: rgba=rgba.resize((W,Hh),Image.LANCZOS)
        mm=m[int(m.shape[0]*.35):]; xs=np.nonzero(mm)[1]
        ax=float(np.median(xs))*sc if len(xs) else W/2
        rows=np.nonzero((np.asarray(rgba)[...,3]>128).sum(1)>2)[0]; low=(rows.max()+1) if len(rows) else Hh
        air_in_sheet=(ground-y1)*sc>15
        ay=(low+3 if anchor_air or not air_in_sheet else (ground-y0)*sc+3)
        fn=f'p/{name}_{kk:02d}'; rgba.save(f'assets/{fn}.png',optimize=True)
        frames[name].append(dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=Hh))
    print(name,len(parts),'scale %.3f'%sc,[(f['w'],f['h']) for f in frames[name]])
for sh in (sys.argv[1:] or 'idle walk punch punch2 bite bark hurt ko gag stealth'.split()):
    cut(f'generated/boss/{sh}.jpg','b_'+sh,anchor_air=sh in AIR)
if not sys.argv[1:]:
    cut('generated/props.jpg','prop',sc_mode=False)
    cut('generated/boss/portrait.jpg','b_portrait',sc_mode=False)
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
