"""Cut a generated in-between sheet (R rows x C poses on magenta) into frames and merge into assets/frames.json.
Sheet file name: generated/smooth2/<pre>__<anim1>__<anim2>[...].jpg  (one anim per row, left->right = frame order)
Each row becomes sheet '<pre>_m_<anim>' -> assets/p/<pre>_m_<anim>_NN.png (+webp).
Usage: python3 src/cut_grid.py FILE [FILE...]   (env COLS=4)"""
import numpy as np, json, os, sys
from PIL import Image, ImageFilter
from scipy import ndimage as nd
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
def load(path):
    im=np.asarray(Image.open(path).convert('RGB')).astype(float)
    r,g,b=im[...,0],im[...,1],im[...,2]
    e=np.concatenate([im[:6].reshape(-1,3),im[-6:].reshape(-1,3),im[:,:6].reshape(-1,3),im[:,-6:].reshape(-1,3)]); bg=np.median(e,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    mag=((r-g>60)&(b-g>15)&(r>110)&(r>b+0))|(d<48)
    pinkfx=(r>g+25)&(b>g+8)&(g>110)&(r>b)
    if os.environ.get('NOMAG'):
        gr=(g>r+40)&(g>b+20)   # green-screen sheets (red/pink effects allowed)
        mag=(d<60)|gr; pinkfx=np.zeros_like(mag)
    fg=nd.binary_opening(~(mag|pinkfx),iterations=2)
    return im,fg
def rows_of(fg,R):
    prof=fg.sum(1)>3; H=len(prof)
    if R==1: return [(0,H)]
    # find R bands: cut at the emptiest rows between bands
    cuts=[]
    for k in range(1,R):
        lo,hi=int(H*(k/R-.18)),int(H*(k/R+.18)); seg=fg[lo:hi].sum(1)
        # longest run of zero rows near the middle
        z=np.nonzero(seg==seg.min())[0]; cuts.append(lo+int(np.median(z)))
    b=[0]+cuts+[H]; return [(b[i],b[i+1]) for i in range(R)]
def comps(fg,n,it=3):
    lab,k=nd.label(nd.binary_dilation(fg,iterations=it))
    if k==0: return []
    objs=nd.find_objects(lab); areas=nd.sum(fg,lab,range(1,k+1))
    big=[i for i in range(k) if areas[i]>0.2*areas.max()]
    groups={i:[i] for i in big}
    for i in range(k):
        if i in groups or areas[i]<40: continue
        sy,sx=objs[i]
        def dist(j):
            ty,tx=objs[j]; dx=max(0,tx.start-sx.stop,sx.start-tx.stop); dy=max(0,ty.start-sy.stop,sy.start-ty.stop); return dx*dx+dy*dy
        groups[min(big,key=dist)].append(i)
    out=[]
    for g in groups.values():
        m=np.isin(lab,[i+1 for i in g])&fg; ys,xs=np.nonzero(m); out.append([xs.min(),xs.max()+1,ys.min(),ys.max()+1,m])
    out.sort(key=lambda o:o[0]+o[1])
    while len(out)<n:
        i=max(range(len(out)),key=lambda q:out[q][1]-out[q][0]); x0,x1,y0,y1,m=out[i]
        col=m[:,x0:x1].sum(0); w=x1-x0; lo,hi=int(w*.3),int(w*.7)
        if hi-lo<4: break
        cx=x0+lo+int(np.argmin(col[lo:hi])); new=[]
        for a,b in ((x0,cx),(cx,x1)):
            mm=np.zeros_like(m); mm[:,a:b]=m[:,a:b]; ys,xs=np.nonzero(mm)
            if len(xs): new.append([xs.min(),xs.max()+1,ys.min(),ys.max()+1,mm])
        out[i:i+1]=new; out.sort(key=lambda o:o[0]+o[1])
    while len(out)>n:
        i=min(range(len(out)),key=lambda q:out[q][4].sum()); cx=(out[i][0]+out[i][1])/2
        j=min((q for q in range(len(out)) if q!=i),key=lambda q:abs((out[q][0]+out[q][1])/2-cx))
        m=out[i][4]|out[j][4]; ys,xs=np.nonzero(m); out[j]=[xs.min(),xs.max()+1,ys.min(),ys.max()+1,m]; del out[i]; out.sort(key=lambda o:o[0]+o[1])
    return out
def target_h(frames,pre):
    for k in (f'{pre}_idle',f'{pre}_combo_a',pre):
        if k in frames: return float(np.median([f['h'] for f in frames[k]]))
    return 230.
def cut(path,frames,cols=4,scale=None,th=None,flip=False):
    base=os.path.basename(path).rsplit('.',1)[0]; parts=base.split('__'); pre,anims=parts[0],parts[1:]
    im,fg=load(path); R=len(anims); bands=rows_of(fg,R); allp=[]
    for (r0,r1),an in zip(bands,anims):
        sub=fg[r0:r1].copy(); sub[:4]=0; sub[-4:]=0
        cs=comps(sub,cols)
        allp.append((an,r0,cs))
    hs=[c[3]-c[2] for _,_,cs in allp for c in cs]
    s=scale or (th or target_h(frames,pre))/float(np.median(hs))
    res={}
    for an,r0,cs in allp:
        ground=max(c[3] for c in cs); name=f'{pre}_m_{an}'; frames[name]=[]
        for kk,(x0,x1,y0,y1,m) in enumerate(cs):
            mm=m[y0:y1,x0:x1]; c=im[r0+y0:r0+y1,x0:x1].copy()
            a=Image.fromarray((mm*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
            edge=np.asarray(a)<250; spill=np.minimum(c[...,0],c[...,2])-c[...,1]; fix=edge&(spill>15)
            c[fix,0]-=spill[fix]*.7; c[fix,2]-=spill[fix]*.7
            rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(a)
            if flip: rgba=rgba.transpose(Image.FLIP_LEFT_RIGHT); mm=mm[:,::-1]
            W,Hh=max(1,round(rgba.width*s)),max(1,round(rgba.height*s)); rgba=rgba.resize((W,Hh),Image.LANCZOS)
            low=mm[int(mm.shape[0]*.55):]; xs=np.nonzero(low)[1]; ax=float(np.median(xs))*s if len(xs) else W/2
            ay=(ground-y0)*s+3
            fn=f'p/{name}_{kk:02d}'; rgba.save(os.path.join(ROOT,'assets',fn+'.png'),optimize=True)
            rgba.save(os.path.join(ROOT,'assets',fn+'.webp'),'WEBP',quality=88,method=4)
            frames[name].append(dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=Hh))
        res[name]=len(cs)
    return res,s
def sheet_h(path,cols=4):
    base=os.path.basename(path).rsplit('.',1)[0]; R=len(base.split('__'))-1
    im,fg=load(path); hs=[]
    for (r0,r1) in rows_of(fg,R):
        sub=fg[r0:r1].copy(); sub[:4]=0; sub[-4:]=0; hs+=[c[3]-c[2] for c in comps(sub,cols)]
    return R,float(np.median(hs))
if __name__=='__main__':
    # usage: cut_grid.py PRE [file ...]  -> one scale per (form, rows-per-sheet), from the upright-ish sheets (80th pct of sheet medians)
    import glob
    fp=os.path.join(ROOT,'assets/frames.json'); frames=json.load(open(fp)); cols=int(os.environ.get('COLS',4))
    pre=sys.argv[1]; files=sys.argv[2:] or sorted(glob.glob(os.path.join(ROOT,f'generated/smooth2/{pre}__*.jpg')))
    allf=sorted(glob.glob(os.path.join(ROOT,f'generated/smooth2/{pre}__*.jpg')))
    meas={f:sheet_h(f,cols) for f in allf}; th=float(os.environ.get('TH',0)) or target_h(frames,pre)
    lay={}
    for f,(R,h) in meas.items(): lay.setdefault(min(R,2),[]).append(h)
    S={R:th/float(np.percentile(v,80)) for R,v in lay.items()}
    if 1 in S and 2 not in S: S[2]=S[1]*1.3
    if 2 in S and 1 not in S: S[1]=S[2]/1.3
    for p in files:
        R=meas[p][0] if p in meas else 2
        r,s=cut(p,frames,cols,scale=S[min(R,2)]); print(os.path.basename(p),r,'scale %.3f'%s)
    json.dump(frames,open(fp,'w'),separators=(',',':'))
