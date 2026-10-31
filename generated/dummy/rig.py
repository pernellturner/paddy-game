"""Sparring dummy rig (TEST). Turns ONE generated dummy (raw/base.jpg) + two face-only edits (raw/face_hit.jpg, raw/face_dizzy.jpg)
into animation frames by deforming the same pixels (spring bend, bag squash/stretch + lagging wobble, whole-body tip/spin, lift).
So every frame is the identical drawing: no redraw drift. Writes frames/<move>_NN.png (RGBA, final scale) and, per move,
<move>.jpg (one row, equal cells, #FF00FF, shared ground baseline, no shadows/text) + <move>.gif (83 ms = 12 fps) + <move>_roots.txt.
usage: python3 rig.py   (run from anywhere; paths are relative to this file)"""
import os, json, numpy as np
from PIL import Image
from scipy import ndimage
D=os.path.dirname(os.path.abspath(__file__)); R=f'{D}/raw'; F=f'{D}/frames'; os.makedirs(F,exist_ok=True)
HEIGHT=float(os.environ.get('DUMMY_H',340))   # final standing height px (= Paddy's upright guard in power_jab.jpg: 341 px)
GAP,M=40,48; BGC=(255,0,255)
# ---- landmarks in raw/base.jpg (1024 px): measured from the keyed alpha
PBX,PBY=513,800      # spring bottom / top of the wooden base (bend pivot)
HS=110               # spring height (base top 800 -> bag bottom 690)
TOP=82; BOT=936
CORNER=(668,926)     # base bottom-right corner (tipping pivot for knockdown/recover)
FACEBOX=(392,176,524,262)  # face-only patch taken from the face edits
def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(float)
base=load(f'{R}/base.jpg')
bg=np.median(np.concatenate([base[0],base[-1],base[:,0],base[:,-1]]),0)
d=np.sqrt(((base-bg)**2).sum(-1))
fg=ndimage.binary_opening(d>70,iterations=1); fg=ndimage.binary_fill_holes(fg)
lab,n=ndimage.label(fg); sz=ndimage.sum(fg,lab,range(1,n+1)); fg=lab==(np.argmax(sz)+1)
alpha=np.clip((d-45)/45,0,1); alpha[~ndimage.binary_dilation(fg,iterations=1)]=0
al=np.maximum(alpha,1e-3)[...,None]
def unmix(rgb): return np.clip((rgb-(1-al)*bg)/al,0,255)
x0,y0,x1,y1=FACEBOX; yy,xx=np.mgrid[0:1024,0:1024]
fm=np.zeros((1024,1024)); fm[y0:y1,x0:x1]=1; fm=ndimage.gaussian_filter(fm,5)[...,None]
SRC={}
for k,p in (('n','base'),('hit','face_hit'),('dizzy','face_dizzy')):
    rgb=base if k=='n' else base*(1-fm)+load(f'{R}/{p}.jpg')*fm
    SRC[k]=np.dstack([unmix(rgb),alpha*255])
SS=2  # supersample factor for forward splatting
ys,xs=np.where(ndimage.binary_dilation(alpha>0,iterations=2))
oy,ox=np.meshgrid(np.arange(SS)/SS+0.5/SS-0.5,np.arange(SS)/SS+0.5/SS-0.5,indexing='ij')
PX=(xs[:,None]+ox.ravel()[None]).ravel(); PY=(ys[:,None]+oy.ravel()[None]).ravel()
PIX=np.repeat(np.arange(len(xs)),SS*SS)
def deform(t1=0,t2=0,sy=1,sx=None,ss=1,rot=0,pivot='corner'):
    """t1 spring bend (deg, + = top leans RIGHT/away from Paddy), t2 extra bag bend (lag/wobble), sy/sx bag squash, ss spring squash,
    rot whole-body rotation (deg clockwise) about the base corner ('corner') or the body centre ('com')."""
    sx=sx if sx is not None else 1/np.sqrt(sy)
    v=PBY-PY; u=PX-PBX
    X=PX.copy(); Y=PY.copy()
    up=v>0
    vs=np.where(v<=HS,v*ss,HS*ss+(v-HS)*sy)            # squashed height along the body axis
    us=np.where(v<=HS,u,u*sx)
    # centreline: angle grows linearly over the spring (0->t1) then over the bag (t1->t1+t2)
    Hb=(PBY-TOP-HS)*sy; Hs=HS*ss
    grid=np.linspace(0,Hs+Hb+5,1200); ang=np.where(grid<=Hs,np.radians(t1)*grid/max(Hs,1e-6),np.radians(t1)+np.radians(t2)*(grid-Hs)/Hb)
    dv=np.diff(grid,prepend=0); cr=np.cumsum(np.sin(ang)*dv); cu=np.cumsum(np.cos(ang)*dv)
    a=np.interp(vs,grid,ang); r=np.interp(vs,grid,cr); uu=np.interp(vs,grid,cu)
    X=np.where(up,PBX+r+us*np.cos(a),X); Y=np.where(up,PBY-uu+us*np.sin(a),Y)
    if rot:
        px,py=CORNER if pivot=='corner' else (PBX,(TOP+BOT)/2)
        c,s=np.cos(np.radians(rot)),np.sin(np.radians(rot)); dx,dy=X-px,Y-py
        X=px+dx*c-dy*s; Y=py+dx*s+dy*c
    return X,Y
def render(face,lift=0,**kw):
    X,Y=deform(**kw); src=SRC[face][ys,xs]; src=src[PIX]
    sc=HEIGHT/(BOT-TOP)
    X=X*sc; Y=Y*sc
    W=H=int(3000*sc); OFF=np.array([W*0.40,H*0.62])   # world canvas; base corner lands near the middle
    xi=np.round(X+OFF[0]).astype(int); yi=np.round(Y+OFF[1]).astype(int)
    acc=np.zeros((H,W,5)); pre=np.concatenate([src[:,:3]*src[:,3:4]/255,src[:,3:4],np.ones((len(src),1))],1)
    np.add.at(acc,(yi,xi),pre)
    cnt=acc[...,4:5]; ok=cnt[...,0]>0
    A=np.zeros((H,W)); A[ok]=acc[ok,3]/cnt[ok,0]
    C=np.zeros((H,W,3)); C[ok]=acc[ok,:3]/np.maximum(acc[ok,3:4],1e-6)*255
    # we splatted at final scale from a 1024 source x SS: density >> 1, no holes; light blur of alpha edge only
    img=np.dstack([np.clip(C,0,255),np.clip(A,0,255)]).astype(np.uint8)
    return img,lift
MOVES={
 # idle: gentle sway on the spring, tiny bob; loops 4 -> 1
 'idle':[dict(face='n'),dict(face='n',t1=2.2,t2=-0.8,sy=0.99),dict(face='n',t1=0,t2=0.3),dict(face='n',t1=-2.2,t2=0.8,sy=0.99)],
 # hit_light: snap back on the spring, small squash, rebound past centre, settle (ends near idle frame 1)
 'hit_light':[dict(face='hit',t1=9,t2=-3,sy=0.94,ss=0.92),dict(face='hit',t1=6,t2=2,sy=0.98),dict(face='n',t1=-3,t2=1.5,sy=1.02),dict(face='n',t1=0.8,t2=-0.5)],
 # hit_heavy: big squash (spring crushes, bag fattens), lagging top, whip-back stretch, decaying wobble
 'hit_heavy':[dict(face='hit',t1=16,t2=-9,sy=0.76,ss=0.62),dict(face='hit',t1=25,t2=5,sy=0.88,ss=0.8),dict(face='dizzy',t1=-13,t2=7,sy=1.1,ss=1.15),
              dict(face='dizzy',t1=9,t2=-5,sy=0.95,ss=0.95),dict(face='n',t1=-4,t2=2.5,sy=1.02),dict(face='n',t1=1.2,t2=-0.6)],
 # launched: crouch-squash, stretch off the ground, tumble backwards (clockwise) up to the apex. f2 lift = bottom clearance; f3-6 clift = body-centre rise
 'launched':[dict(face='hit',t1=12,t2=-6,sy=0.8,ss=0.6),dict(face='hit',t1=-5,t2=3,sy=1.14,ss=1.25,rot=6,pivot='com',lift=36),
             dict(face='dizzy',t1=-3,t2=4,sy=1.08,ss=1.12,rot=28,pivot='com',clift=120),dict(face='dizzy',t2=3,sy=1.03,rot=62,pivot='com',clift=195),
             dict(face='dizzy',t2=-2,rot=100,pivot='com',clift=240),dict(face='dizzy',t2=-3,sy=0.98,rot=138,pivot='com',clift=258)],
 # launched_fall (added 31 Oct): from the apex (launched 6, rot 138) keeps tumbling clockwise (~78 deg/frame, about twice the rise's spin) down the arc and lands flat on its back
 # f4 = landing squash about the body centre (same pose family as knockdown 4); to continue use knockdown 5-6 (see NOTES for the root shift)
 'launched_fall':[dict(face='dizzy',t2=-3,rot=215,pivot='com',clift=245),dict(face='dizzy',t2=2,sy=1.02,rot=295,pivot='com',clift=185),
                  dict(face='dizzy',t2=4,sy=1.04,rot=375,pivot='com',clift=95),dict(face='dizzy',t2=4,sx=0.84,sy=1.05,rot=450,pivot='com')],
 # knockdown: rocked back, tips over on the base corner, lands flat on its back (squash), small bounce, rests dazed
 'knockdown':[dict(face='hit',t1=14,t2=-6,sy=0.9,ss=0.8),dict(face='hit',t1=6,t2=-6,rot=28),dict(face='dizzy',t2=-8,sy=1.04,rot=62),
              dict(face='dizzy',t2=4,sx=0.84,sy=1.05,rot=90),dict(face='dizzy',t2=-3,sx=1.04,sy=0.98,rot=82,lift=14),dict(face='dizzy',rot=90)],
 # recover: from lying (knockdown 6) springs back up, overshoots toward Paddy, settles into idle frame 1
 'recover':[dict(face='dizzy',rot=90),dict(face='dizzy',t2=9,sy=0.96,rot=48),dict(face='n',t1=-5,t2=-4,sy=1.06,ss=1.1,rot=-5),dict(face='n',t1=1,t2=0.5)],
}
GROUNDED_FIX={}  # lowest pixel of every frame goes on the shared baseline (+lift)
meta={}
for move,specs in MOVES.items():
    imgs=[]
    for k,s in enumerate(specs):
        s=dict(s); face=s.pop('face'); lift=s.pop('lift',0); clift=s.pop('clift',None)
        img,_=render(face,**s); a=img[...,3]>40
        yy_,xx_=np.where(a); imgs.append(dict(img=img,bottom=yy_.max(),lift=lift,clift=clift,top=yy_.min(),l=xx_.min(),r=xx_.max(),spec=specs[k]))
    # shift each frame vertically so its lowest pixel sits on the shared ground (minus lift); x stays in world coords (root fixed)
    for f in imgs:
        f['dy']=-(f['bottom'])-f['lift']
        if f['clift'] is not None:   # airborne tumble: lift measured at the body centre (standing centre = HEIGHT/2) so the arc is smooth
            f['dy']=int(-(HEIGHT/2+f['clift'])-(f['top']+f['bottom'])/2); f['lift']=int(-f['dy']-f['bottom'])
    L=min(f['l'] for f in imgs)-6; Rr=max(f['r'] for f in imgs)+6; CW=Rr-L
    above=max(f['bottom']-f['top']+f['lift'] for f in imgs)+4; Hh=M*2+above; base=M+above
    cells=[]
    for i,f in enumerate(imgs):
        c=Image.new('RGBA',(CW,Hh),(0,0,0,0)); im=Image.fromarray(f['img'])
        c.alpha_composite(im,(-L,base+f['dy']))
        c.save(f'{F}/{move}_{i+1:02d}.png'); cells.append(c)
    W=M*2+CW*len(cells)+GAP*(len(cells)-1); sheet=Image.new('RGBA',(W,Hh),BGC+(255,))
    for i,c in enumerate(cells): sheet.alpha_composite(c,(M+i*(CW+GAP),0))
    sheet.convert('RGB').save(f'{D}/{move}.jpg',quality=95,subsampling=0)
    gif=[]
    for c in cells:
        g=Image.new('RGBA',(CW+40,Hh),(236,236,240,255)); g.alpha_composite(c,(20,0)); gif.append(g.convert('RGB'))
    gif[0].save(f'{D}/{move}.gif',save_all=True,append_images=gif[1:],duration=83,loop=0)
    # root = where the standing base centre sits in the cell (constant: the game moves the root); lift per frame
    rootx=int(round((PBX*HEIGHT/(BOT-TOP))+int(3000*HEIGHT/(BOT-TOP))*0.40-L))
    open(f'{D}/{move}_roots.txt','w').write(f'# sparring dummy {move}: 12 fps (83 ms), cell {CW}x{Hh}px, baseline y={base} (cell coords), standing base centre x={rootx} in every cell.\n# frame lift(px: lowest pixel above baseline)\n'+'\n'.join(f"{i+1} {f['lift']}" for i,f in enumerate(imgs))+'\n')
    meta[move]=dict(cell=[int(CW),int(Hh)],baseline=int(base),root_x=int(rootx),frames=len(imgs))
    print(move,(W,Hh),len(imgs),'frames, cell',CW,'x',Hh,'heights',[int(f['bottom']-f['top']) for f in imgs])
json.dump(meta,open(f'{D}/sheets_meta.json','w'),indent=1)
