"""Sparring dummy, ATTACKER ('fighter') variant (TEST). Same drawing as rig.py: raw/base.jpg pixels, deformed by the same rig.
Extra pieces, all pasted/feathered onto base.jpg in source space so the body stays the identical drawing:
  raw/fighter_noarms.jpg  edit of base.jpg -> ONLY its headband pixels and the patches where the two stubby arms were are used
  raw/face_fight.jpg      face-only edit (narrowed eyes + brows, smirk) -> only FACEBOX is used, like face_hit/face_dizzy
  raw/glove_arm.jpg       separate part: red boxing glove + white cuff + tan leather tube (pointing left)
Both arms are now separate rigid pieces attached to shoulder points that follow the body's bend/squash; the near (front)
arm is the punching arm: angle a (deg, + = fist up) and reach L (source px of tube shown; <0 = glove pulled back past the shoulder).
Draw order: far arm (behind, darkened) -> body -> near arm. Writes frames/fighter_<move>_NN.png and fighter_<move>.jpg/.gif/_roots.txt,
and merges into sheets_meta.json.   usage: python3 rig_fighter.py (after rig.py)"""
import os, json, numpy as np
from PIL import Image
from scipy import ndimage
D=os.path.dirname(os.path.abspath(__file__)); R=f'{D}/raw'; F=f'{D}/frames'; os.makedirs(F,exist_ok=True)
HEIGHT=float(os.environ.get('DUMMY_H',340)); GAP,M=40,48; BGC=(255,0,255)
PBX,PBY=513,800; HS=110; TOP=82; BOT=936; CORNER=(668,926); FACEBOX=(392,176,524,262)   # = rig.py landmarks
SC=HEIGHT/(BOT-TOP); WW=int(3000*SC); OFF=np.array([WW*0.40,WW*0.62])
SH_NEAR=(612,402); SH_FAR=(398,384)      # shoulder anchors in base.jpg (where the original stubby arms met the body)
K_NEAR,K_FAR=0.50,0.44                    # glove piece scale (piece px -> source px): near glove ~124 px tall, far ~109
def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(float)
base=load(f'{R}/base.jpg'); noarm=load(f'{R}/fighter_noarms.jpg')
bg=np.median(np.concatenate([base[0],base[-1],base[:,0],base[:,-1]]),0)
# ---- masks for the edit patches (headband; arm removal) from the diff, limited to their regions
dd=ndimage.gaussian_filter(np.sqrt(((base-noarm)**2).sum(-1)),2)
def region_mask(x0,y0,x1,y1,thr=35,grow=6,feather=2.5):
    m=np.zeros(dd.shape,bool); m[y0:y1,x0:x1]=dd[y0:y1,x0:x1]>thr
    m=ndimage.binary_fill_holes(ndimage.binary_closing(m,iterations=4)); m=ndimage.binary_dilation(m,iterations=grow)
    return ndimage.gaussian_filter(m.astype(float),feather)[...,None]
HB=region_mask(390,100,705,262,thr=30,grow=3,feather=1.5)           # headband + knot tails
ARM=np.maximum(region_mask(270,320,410,450),region_mask(462,344,640,535))  # both old arms -> plain body / background
x0,y0,x1,y1=FACEBOX; fm=np.zeros((1024,1024)); fm[y0:y1,x0:x1]=1; fm=ndimage.gaussian_filter(fm,5)[...,None]
def compose(face):
    rgb=base if face is None else base*(1-fm)+load(f'{R}/{face}.jpg')*fm
    rgb=rgb*(1-HB)+noarm*HB; return rgb*(1-ARM)+noarm*ARM
RGB={k:compose(f) for k,f in (('n',None),('fight','face_fight'),('hit','face_hit'),('dizzy','face_dizzy'))}
# alpha exactly as rig.py, but from the armless+headband composite
d=np.sqrt(((RGB['n']-bg)**2).sum(-1))
fg=ndimage.binary_opening(d>70,iterations=1); fg=ndimage.binary_fill_holes(fg)
lab,n=ndimage.label(fg); sz=ndimage.sum(fg,lab,range(1,n+1)); fg=lab==(np.argmax(sz)+1)
alpha=np.clip((d-45)/45,0,1); alpha[~ndimage.binary_dilation(fg,iterations=1)]=0
al=np.maximum(alpha,1e-3)[...,None]
SRC={k:np.dstack([np.clip((v-(1-al)*bg)/al,0,255),alpha*255]) for k,v in RGB.items()}
SS=2; ys,xs=np.where(ndimage.binary_dilation(alpha>0,iterations=2))
oy,ox=np.meshgrid(np.arange(SS)/SS+0.5/SS-0.5,np.arange(SS)/SS+0.5/SS-0.5,indexing='ij')
PX=(xs[:,None]+ox.ravel()[None]).ravel(); PY=(ys[:,None]+oy.ravel()[None]).ravel(); PIX=np.repeat(np.arange(len(xs)),SS*SS)
def deform(PX,PY,t1=0,t2=0,sy=1,sx=None,ss=1):
    """identical maths to rig.py deform() (no whole-body rot: the fighter never tips over), for any point set"""
    sx=sx if sx is not None else 1/np.sqrt(sy)
    PX=np.asarray(PX,float); PY=np.asarray(PY,float); v=PBY-PY; u=PX-PBX; X=PX.copy(); Y=PY.copy(); up=v>0
    vs=np.where(v<=HS,v*ss,HS*ss+(v-HS)*sy); us=np.where(v<=HS,u,u*sx)
    Hb=(PBY-TOP-HS)*sy; Hs=HS*ss
    grid=np.linspace(0,Hs+Hb+5,1200); ang=np.where(grid<=Hs,np.radians(t1)*grid/max(Hs,1e-6),np.radians(t1)+np.radians(t2)*(grid-Hs)/Hb)
    dv=np.diff(grid,prepend=0); cr=np.cumsum(np.sin(ang)*dv); cu=np.cumsum(np.cos(ang)*dv)
    a=np.interp(vs,grid,ang); r=np.interp(vs,grid,cr); uu=np.interp(vs,grid,cu)
    X=np.where(up,PBX+r+us*np.cos(a),X); Y=np.where(up,PBY-uu+us*np.sin(a),Y); return X,Y
def splat_body(face,**kw):
    X,Y=deform(PX,PY,**kw); src=SRC[face][ys,xs][PIX]
    xi=np.round(X*SC+OFF[0]).astype(int); yi=np.round(Y*SC+OFF[1]).astype(int)
    acc=np.zeros((WW,WW,5)); pre=np.concatenate([src[:,:3]*src[:,3:4]/255,src[:,3:4],np.ones((len(src),1))],1)
    np.add.at(acc,(yi,xi),pre); ok=acc[...,4]>0
    A=np.zeros((WW,WW)); A[ok]=acc[ok,3]/acc[ok,4]; C=np.zeros((WW,WW,3)); C[ok]=acc[ok,:3]/np.maximum(acc[ok,3:4],1e-6)*255
    return Image.fromarray(np.dstack([np.clip(C,0,255),np.clip(A,0,255)]).astype(np.uint8),'RGBA')
# ---- glove/arm piece (raw/glove_arm.jpg, 1280x720): glove+cuff x 393..716, tube 716..~894, tube centre y 345
P=load(f'{R}/glove_arm.jpg'); pbg=np.median(np.concatenate([P[0],P[-1],P[:,0],P[:,-1]]),0)
pd=np.sqrt(((P-pbg)**2).sum(-1)); pf=ndimage.binary_fill_holes(ndimage.binary_opening(pd>70,iterations=1))
pa=np.clip((pd-45)/45,0,1); pa[~ndimage.binary_dilation(pf,iterations=1)]=0; pal=np.maximum(pa,1e-3)[...,None]
prgb=np.clip((P-(1-pal)*pbg)/pal,0,255)
# bleed colour into transparent pixels so bicubic resampling has no dark/pink fringe
# edge pixels of the JPEG keep a magenta tint even after un-mixing: take every pixel's colour from the nearest solid (alpha>=0.98) one
idx=ndimage.distance_transform_edt(pa<0.98,return_distances=False,return_indices=True); prgb=prgb[idx[0],idx[1]]
prgb[...,2]=np.minimum(prgb[...,2],prgb[...,1]+6)   # kill the magenta cast on the dark outline (piece colours all have b<=g)
pa=ndimage.grey_erosion(pa,size=(2,2))   # pull the soft edge in ~1 px (removes the last pink halo)
PIECE=np.dstack([prgb,pa*255]).astype(np.uint8)
CUFF=716; AY=345; GL=PIECE[200:476,380:CUFF]      # glove+cuff crop (local y0=200)
TUBE=PIECE[200:476,CUFF:900]; TMID=TUBE[:,40:150].astype(float)  # tube; its middle tiles for long reaches
# flatten the lengthwise shading of the tile (per-row column profile) so repeats don't show as bands
prof=TMID[...,:3].mean(1,keepdims=True); col=TMID[...,:3]; m_=col.mean(1,keepdims=True)
lum=col.mean(2,keepdims=True); lp=lum/np.maximum(lum.mean(1,keepdims=True),1); TMID[...,:3]=np.clip(col/np.maximum(lp,0.3),0,255)
TMID=TMID.astype(np.uint8)
def arm_strip(Lp):
    """RGBA strip: glove+cuff then Lp piece-px of tube (tiled middle, original right cap). Returns (img, anchor_x in strip)."""
    if Lp<=0: return Image.fromarray(GL),GL.shape[1]+Lp
    Lp=int(round(Lp)); cap=TUBE[:,150:]; body=Lp-cap.shape[1]
    if body<=0: tube=TUBE[:,TUBE.shape[1]-Lp:]
    else:
        reps=int(np.ceil(max(body-40,0)/TMID.shape[1])); tube=np.concatenate([TUBE[:,:40]]+[TMID]*reps,1)[:,:body]; tube=np.concatenate([tube,cap],1)
    strip=np.concatenate([GL,tube],1); return Image.fromarray(strip),GL.shape[1]+Lp
def arm_layer(shoulder,body,a,L,k,dark=1.0,follow=1.0):
    """place the arm: its shoulder point follows the deformed body; it rotates with the local body tilt (x follow) + a."""
    sx,sy=shoulder; X,Y=deform([sx,sx],[sy,sy-25],**body)
    phi=np.degrees(np.arctan2(X[1]-X[0],-(Y[1]-Y[0])))      # clockwise body tilt at the shoulder
    th=-np.radians(a+follow*phi)   # PIL inverse-map convention below: th<0 = fist up; so a>0 = fist UP, body leaning back (clockwise) lifts it too
    img,ax=arm_strip(L/k); s=k*SC
    Sx,Sy=X[0]*SC+OFF[0],Y[0]*SC+OFF[1]; ay=AY-200
    # forward: out = S + R(th) * (local-anchor)*s with R(th)=[[c,-s],[s,c]] applied to (x,-y)-flip-free screen ccw:
    c,sn=np.cos(th),np.sin(th)   # screen ccw rotation: x' = x c + y s ; y' = -x s + y c
    # inverse: local = anchor + (1/s) * R^-1 (out-S);  R^-1: x = x' c - y' s ; y = x' s + y' c
    A_=(c/s,-sn/s,ax-(c*Sx-sn*Sy)/s, sn/s,c/s,ay-(sn*Sx+c*Sy)/s)
    out=img.transform((WW,WW),Image.AFFINE,A_,resample=Image.BICUBIC)
    if dark!=1.0:
        o=np.asarray(out).astype(float); o[...,:3]*=dark; out=Image.fromarray(o.astype(np.uint8),'RGBA')
    return out
def frame(face='n',near=(10,0),far=(0,0),**body):
    far=(far[0],far[1]-22)   # far glove's cuff tucked behind the body edge
    w=Image.new('RGBA',(WW,WW),(0,0,0,0))
    w.alpha_composite(arm_layer(SH_FAR,body,far[0],far[1],K_FAR,dark=0.80))
    w.alpha_composite(splat_body(face,**body))
    w.alpha_composite(arm_layer(SH_NEAR,body,near[0],near[1],K_NEAR))
    return np.asarray(w)
REST=(-10,0)
MOVES={
 # idle: same sway as rig.py idle, gloves held up in guard and bobbing a little against the sway
 'fighter_idle':[dict(near=REST),dict(t1=2.2,t2=-0.8,sy=0.99,near=(-13,0),far=(-3,0)),dict(t1=0,t2=0.3,near=(-10,0)),dict(t1=-2.2,t2=0.8,sy=0.99,near=(-7,0),far=(3,0))],
 # windup (telegraph): leans back on the spring, punching glove cocked back + up beside the head, eyes narrow; f3-f4 = held coil
 'fighter_attack_windup':[dict(face='fight',t1=4,t2=1.5,near=(8,-18),far=(-2,0)),dict(face='fight',t1=9,t2=3.5,ss=0.9,sy=0.98,near=(26,-46),far=(-5,0)),
     dict(face='fight',t1=13,t2=5.5,ss=0.84,sy=0.96,near=(40,-66),far=(-8,0)),dict(face='fight',t1=14,t2=6.5,ss=0.82,sy=0.95,near=(43,-70),far=(-9,0))],
 # punch: springs forward (lean toward Paddy + stretch) and the near arm shoots out; f3 = full reach (the active/contact frame)
 'fighter_attack_punch':[dict(face='fight',t1=-4,t2=-3,sy=1.05,ss=1.12,near=(8,70),far=(0,0)),dict(face='fight',t1=-12,t2=-6,sy=1.08,ss=1.2,near=(16,240),far=(6,0)),
     dict(face='fight',t1=-15,t2=-6,sy=1.06,ss=1.18,near=(18,320),far=(8,0)),dict(face='fight',t1=-11,t2=-2,sy=1.02,ss=1.08,near=(12,200),far=(4,0)),
     dict(face='fight',t1=-6,t2=1,near=(2,80),far=(0,0))],
 # recover: arm springs home, the body wobbles back upright, face relaxes; f4 ~ fighter_idle 1
 'fighter_attack_recover':[dict(face='fight',t1=1,t2=2.5,sy=0.98,near=(-4,15)),dict(t1=5,t2=-1.5,sy=0.98,near=(-14,0),far=(-4,0)),
     dict(t1=-2,t2=1,sy=1.01,near=(-8,0),far=(2,0)),dict(t1=0.8,t2=-0.5,near=(-10,0))],
 # hit_heavy: exactly rig.py hit_heavy body specs, gloves flung by the impact and lagging the body
 'fighter_hit_heavy':[dict(face='hit',t1=16,t2=-9,sy=0.76,ss=0.62,near=(10,-10),far=(12,0)),dict(face='hit',t1=25,t2=5,sy=0.88,ss=0.8,near=(20,0),far=(18,0)),
     dict(face='dizzy',t1=-13,t2=7,sy=1.1,ss=1.15,near=(-32,0),far=(-25,0)),dict(face='dizzy',t1=9,t2=-5,sy=0.95,ss=0.95,near=(-2,0),far=(6,0)),
     dict(t1=-4,t2=2.5,sy=1.02,near=(-16,0),far=(-5,0)),dict(t1=1.2,t2=-0.6,near=(-9,0))],
}
meta=json.load(open(f'{D}/sheets_meta.json')) if os.path.exists(f'{D}/sheets_meta.json') else {}
for move,specs in MOVES.items():
    imgs=[]
    for s in specs:
        img=frame(**s); a=img[...,3]>40; yy_,xx_=np.where(a)
        imgs.append(dict(img=img,bottom=yy_.max(),top=yy_.min(),l=xx_.min(),r=xx_.max()))
    L=min(f['l'] for f in imgs)-6; Rr=max(f['r'] for f in imgs)+6; CW=Rr-L
    above=max(f['bottom']-f['top'] for f in imgs)+4; Hh=M*2+above; bl=M+above
    cells=[]
    for i,f in enumerate(imgs):
        c=Image.new('RGBA',(CW,Hh),(0,0,0,0)); c.alpha_composite(Image.fromarray(f['img']),(-L,bl-f['bottom']))
        c.save(f'{F}/{move}_{i+1:02d}.png'); cells.append(c)
    W=M*2+CW*len(cells)+GAP*(len(cells)-1); sheet=Image.new('RGBA',(W,Hh),BGC+(255,))
    for i,c in enumerate(cells): sheet.alpha_composite(c,(M+i*(CW+GAP),0))
    sheet.convert('RGB').save(f'{D}/{move}.jpg',quality=95,subsampling=0)
    gif=[]
    for c in cells:
        g=Image.new('RGBA',(CW+40,Hh),(236,236,240,255)); g.alpha_composite(c,(20,0)); gif.append(g.convert('RGB'))
    gif[0].save(f'{D}/{move}.gif',save_all=True,append_images=gif[1:],duration=83,loop=0)
    rootx=int(round(PBX*SC+WW*0.40-L))
    open(f'{D}/{move}_roots.txt','w').write(f'# sparring dummy {move}: 12 fps (83 ms), cell {CW}x{Hh}px, baseline y={bl} (cell coords), standing base centre x={rootx} in every cell.\n# frame lift(px: lowest pixel above baseline)\n'+'\n'.join(f"{i+1} 0" for i in range(len(imgs)))+'\n')
    meta[move]=dict(cell=[int(CW),int(Hh)],baseline=int(bl),root_x=int(rootx),frames=len(imgs))
    print(move,(W,Hh),len(imgs),'frames, cell',CW,'x',Hh,'reach(left of root px)',[int(rootx-(f['l']-L)) for f in imgs])
json.dump(meta,open(f'{D}/sheets_meta.json','w'),indent=1)
# ---- fighter_attack_demo.gif: idle 1-4 | windup 1-4 (+ f4 held 2 extra frames = the readable telegraph) | punch 1-5 | recover 1-4 | idle 1-4
seq=[('fighter_idle',k) for k in (1,2,3,4)]+[('fighter_attack_windup',k) for k in (1,2,3,4,4,4)]+[('fighter_attack_punch',k) for k in (1,2,3,4,5)]+\
    [('fighter_attack_recover',k) for k in (1,2,3,4)]+[('fighter_idle',k) for k in (1,2,3,4)]
used={m for m,_ in seq}; rl=max(meta[m]['root_x'] for m in used); rr=max(meta[m]['cell'][0]-meta[m]['root_x'] for m in used)
bl=max(meta[m]['baseline'] for m in used); W=rl+rr+40; H=bl+30; out=[]
for m,k in seq:
    c=Image.new('RGBA',(W,H),(236,236,240,255)); im=Image.open(f'{F}/{m}_{k:02d}.png')
    c.alpha_composite(im,(20+rl-meta[m]['root_x'],bl-meta[m]['baseline'])); out.append(c.convert('RGB'))
dur=[83]*len(out); dur[-1]=500
out[0].save(f'{D}/fighter_attack_demo.gif',save_all=True,append_images=out[1:],duration=dur,loop=0)
print('fighter_attack_demo.gif',(W,H),len(out),'frames')
