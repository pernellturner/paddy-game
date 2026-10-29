"""Cut enemy sheets generated/en/<id>/{move,act}.jpg -> assets/p/en_<id>_<sheet>_NN.png + frames.json.
Background = magenta connected to the border (inner pink ears stay). Usage: python3 src/cut_en.py id[:height] ..."""
import numpy as np, json, os, sys
from PIL import Image, ImageFilter
from scipy import ndimage as nd
sys.path.insert(0,os.path.dirname(__file__))
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
import importlib.util
spec=importlib.util.spec_from_file_location('cm','src/cut_mf.py')
src=open('src/cut_mf.py').read().split("FORMS=['mst'")[0]
cm={'__file__':os.path.abspath('src/cut_mf.py')};exec(src,cm)
def load(path):
    im=np.asarray(Image.open(path).convert('RGB')).astype(float)
    r,g,b=im[...,0],im[...,1],im[...,2]
    e=np.concatenate([im[:8].reshape(-1,3),im[-8:].reshape(-1,3)]); bg=np.median(e,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    mag=((r-g>60)&(b-g>15)&(r>110)&(r>b))|(d<45)
    pinkfx=(r>180)&(b-g>25)&(r-g>40)
    lab,n=nd.label(mag); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    sizes=nd.sum(mag,lab,range(1,n+1))
    keep=[i+1 for i in range(n) if (i+1) in border or sizes[i]>4000]
    bgm=np.isin(lab,keep)
    fg=nd.binary_opening(~bgm&~pinkfx,iterations=2)
    # thin speed lines / effect wisps: drop tiny far blobs later in components()
    return im,fg
cm['load']=load
def parts_of(path,it=3):
    im,fg=load(path)
    parts=[(x0,x1,y0,y1,m[y0:y1,x0:x1],im[y0:y1,x0:x1]) for x0,x1,y0,y1,m in cm['split6'](cm['components'](fg,it))]
    return parts
frames=json.load(open('assets/frames.json'))
for arg in sys.argv[1:]:
    eid,Hs=(arg.split(':')+['150'])[:2]; H=float(Hs)
    mv=parts_of(f'generated/en/{eid}/move.jpg'); sc=H/np.median([p[3]-p[2] for p in mv[:2]])
    for sh in ('move','act'):
        path=f'generated/en/{eid}/{sh}.jpg'
        if not os.path.exists(path): continue
        parts=mv if sh=='move' else parts_of(path); name=f'en_{eid}_{sh}'; frames[name]=[]
        ground=int(np.median([p[3] for p in parts]))
        for kk,(x0,x1,y0,y1,m,c) in enumerate(parts):
            a=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
            c=c.copy(); edge=np.asarray(a)<250
            spill=np.minimum(c[...,0],c[...,2])-c[...,1]; fix=edge&(spill>15)
            c[fix,0]-=spill[fix]*.7; c[fix,2]-=spill[fix]*.7
            rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(a)
            W,Hh=max(1,round(rgba.width*sc)),max(1,round(rgba.height*sc))
            rgba=rgba.resize((W,Hh),Image.LANCZOS)
            xs=np.nonzero(m)[1]; ax=float((xs.min()+xs.max())/2)*sc if len(xs) else W/2
            ay=Hh+3 if (ground-y1)*sc<15 else (ground-y0)*sc+3
            fn=f'p/{name}_{kk:02d}'; rgba.save(f'assets/{fn}.png',optimize=True)
            frames[name].append(dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=Hh))
        print(name,len(parts),'scale %.3f'%sc,[(f['w'],f['h']) for f in frames[name]])
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
