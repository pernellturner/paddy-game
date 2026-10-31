"""Reusable form-sheet kit (Paddy's Way Home). Same layout rules as assemble6.py / assemble_chain.py
(one row, equal cells, GAP 40, margin 48, flat key bg, facing right, shared foot baseline, root motion, 12 fps GIFs on light grey,
_roots.txt per sheet), plus what new forms need:
  * ONE form scale K for every frame (no per-frame area normalisation): K = BASE_IDLE_H / height(idle frame).
    BASE_IDLE_H = 340 px = base Paddy's approved upright guard at TARGET=199 (tests/paddy_fluid/frames/p7/guard_1.png).
  * lift (px above the baseline) for air frames, rotation, ghost after-images for blinks, minimal hit FX drawn at final scale.
Frame spec (python dict or 'name' string): dict(p=name, a='b'|'f'|'c', dx=0, sx=1, sy=1, dust=0, lift=0, rot=0, fx=None, ghost=0, sfx='')
  a: b = back toe planted (carried from last b frame, like assemble6), f = front toe aligned to last b frame's front toe,
     c = body centre-x aligned to the previous frame's centre (for air/dash frames)
  fx: None | ('hit', stage, tip)  stage 1/2/3 = hit-stop frame (burst grows, trail fades); tip 'R' right-most, 'T' top-most, 'BR' down-right
      | ('trail', tip) drive-frame speed lines only | ('spark', tip) tiny block spark
"""
import os, json, random, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
BASE_IDLE_H=340.0; GAP,M=40,48
MAG=(255,0,255,255); GRN=(0,255,0,255); GIFBG=(236,236,240,255)
class Form:
    def __init__(s, root, idle='idle_a'):
        s.root=root; s.cache={}
        a=np.asarray(Image.open(f'{root}/frames/{idle}.png'))[...,3]>128; ys=np.where(a.any(1))[0]
        s.K=BASE_IDLE_H/(ys.max()-ys.min()+1)
    def img(s,p,sx=1,sy=1,rot=0):
        key=(p,sx,sy,rot)
        if key not in s.cache:
            im=Image.open(f'{s.root}/frames/{p}.png').convert('RGBA')
            if rot: im=im.rotate(rot,resample=Image.BICUBIC,expand=True)
            im=im.resize((max(1,round(im.width*s.K*sx)),max(1,round(im.height*s.K*sy))),Image.LANCZOS)
            a=np.asarray(im); m=a[...,3]>200; ys,xs=np.where(m); foot=ys.max()
            low=m&(np.arange(a.shape[0])[:,None]>foot-28); fy,fx=np.where(low)
            s.cache[key]=dict(im=im,foot=foot,back=fx.min(),front=fx.max(),cx=xs.mean(),m=m)
        return s.cache[key]
def norm(f):
    if isinstance(f,str): f=dict(p=f)
    d=dict(a='b',dx=0,sx=1,sy=1,dust=0,lift=0,rot=0,fx=None,ghost=0,sfx='',react='light',contact=None,gap=-6); d.update(f); return d
def layout(form, frames):
    """returns list of frame dicts with X (canvas x of image left edge, root-relative) like assemble6."""
    out=[]; lastb=None; prev=None
    for f in map(norm,frames):
        g=form.img(f['p'],f['sx'],f['sy'],f['rot']); f=dict(f,**g)
        if f['a']=='b': f['X']=-f['back']+f['dx']; lastb=f
        elif f['a']=='f': f['X']=((lastb['X']+lastb['front']) if lastb else 0)-f['front']+f['dx']
        else:
            ref=(prev['X']+prev['cx']) if prev else 0
            base=(lastb['X']+lastb['back']) if lastb else 0
            f['X']=ref-f['cx']+f['dx'] if f.get('rel','prev')=='prev' else base-f['cx']+f['dx']
        out.append(f); prev=f
    return out
def tip(f,mode):
    m=f['m']; ys,xs=np.where(m)
    if mode=='R': i=np.argmax(xs)
    elif mode=='T': i=np.argmin(ys)
    elif mode=='BR': i=np.argmax(xs+ys*0.8)
    elif mode=='TR': i=np.argmax(xs-ys*0.8)
    else: i=np.argmax(xs)
    return xs[i],ys[i]
DIRS={'R':(1,0),'T':(0,-1),'BR':(0.7,0.7),'TR':(0.7,-0.7)}
def draw_fx(layer,x,y,kind,stage,mode,seed):
    """minimal FX: white core + pale lavender glow, small. Kept clear of magenta/green so keys stay clean."""
    d=ImageDraw.Draw(layer); ux,uy=DIRS.get(mode,(1,0)); nx,ny=-uy,ux; rnd=random.Random(seed)
    if kind in ('hit','trail'):
        A=[0,1.0,0.7,0.45][stage] if kind=='hit' else 0.8
        for k,(off,L) in enumerate(((-10,46),(0,64),(10,40))):
            x0=x-ux*(14+L)+nx*off; y0=y-uy*(14+L)+ny*off; x1=x-ux*14+nx*off*0.6; y1=y-uy*14+ny*off*0.6
            d.line([(x0,y0),(x1,y1)],fill=(215,205,255,int(150*A)),width=7); d.line([(x0,y0),(x1,y1)],fill=(255,255,255,int(230*A)),width=3)
    if kind=='hit':
        r=[0,16,26,34][stage]; n=8
        pts=[]
        for i in range(n*2):
            a=math.pi*i/n+rnd.uniform(-0.1,0.1); rr=r*(1 if i%2==0 else 0.42)
            pts.append((x+ux*6+rr*math.cos(a),y+uy*6+rr*math.sin(a)))
        d.polygon(pts,fill=(205,195,255,210)); 
        d.polygon([(x+ux*6+(px-x-ux*6)*0.62,y+uy*6+(py-y-uy*6)*0.62) for px,py in pts],fill=(255,255,255,255))
    if kind=='spark':
        for i in range(5):
            a=math.pi*(0.6+0.16*i); d.line([(x+4,y),(x+4+18*math.cos(a)*-1,y+18*math.sin(a))],fill=(255,255,255,230),width=3)
def puffs(c,x,y,seed):
    rnd=random.Random(seed); L=Image.new('RGBA',c.size,(0,0,0,0)); d=ImageDraw.Draw(L)
    for i in range(5):
        r=rnd.uniform(6,13); px=x-rnd.uniform(4,40); py=y-rnd.uniform(2,14)
        d.ellipse((px-r,py-r,px+r,py+r),fill=(222,212,204,215))
    c.alpha_composite(L.filter(ImageFilter.GaussianBlur(2)))
def ghosts(c,f,x,y,n,step):
    """after-images behind a blink/dash frame: same silhouette, flat pale violet, fading (minimal FX)."""
    sil=Image.new('RGBA',f['im'].size,(190,170,255,0)); a=np.asarray(f['im'])[...,3].astype(float)
    for k in range(n,0,-1):
        al=(0.38 if k==1 else 0.2)*(a/255.0); s=sil.copy(); s.putalpha(Image.fromarray((al*255).astype(np.uint8)))
        c.alpha_composite(s,(int(x-step*k),y))
def render_frames(frames, minX=None, pad=0):
    """composite each frame into an equal cell; returns cells, base, CW, H (shared by sheet and gif)."""
    if minX is None: minX=min(f['X'] for f in frames)
    maxR=max(f['X']+f['im'].width for f in frames); CW=int(maxR-minX)+pad
    ghostw=max([f['ghost'] for f in frames]+[0])
    above=max(f['foot']+f['lift'] for f in frames); below=max(f['im'].height-f['foot'] for f in frames)
    H=M*2+int(above)+below; base=M+int(above)
    cells=[]
    for i,f in enumerate(frames):
        c=Image.new('RGBA',(CW,H),(0,0,0,0)); x=int(f['X']-minX); y=int(base-f['foot']-f['lift'])
        if f['ghost']: ghosts(c,f,x,y,2,f['ghost'])
        c.alpha_composite(f['im'],(x,y))
        if f['dust'] and f['lift']<5: puffs(c,x+f['back']+6,base,i)
        if f['fx']:
            kind=f['fx'][0]; stage=f['fx'][1] if kind=='hit' else 0; mode=f['fx'][-1]
            tx,ty=tip(f,mode); L=Image.new('RGBA',c.size,(0,0,0,0)); draw_fx(L,x+tx,y+ty,kind,stage,mode,i); c.alpha_composite(L)
        f['cell_x']=x; f['cell_y']=y
        cells.append(c)
    return cells,base,CW,H
def write_sheet(form,name,frames,outdir,bg=MAG,greendir=None):
    fr=layout(form,frames); cells,base,CW,H=render_frames(fr)
    W=M*2+CW*len(fr)+GAP*(len(fr)-1)
    for B,od in ((bg,outdir),)+(((GRN,greendir),) if greendir else ()):
        sheet=Image.new('RGBA',(W,H),B)
        for i,c in enumerate(cells): sheet.alpha_composite(c,(M+i*(CW+GAP),0))
        os.makedirs(od,exist_ok=True); sheet.convert('RGB').save(f'{od}/{name}.jpg',quality=95,subsampling=0)
    gif=[]
    for c in cells:
        g=Image.new('RGBA',(CW+40,H),GIFBG); g.alpha_composite(c,(20,0)); gif.append(g.convert('RGB'))
    gif[0].save(f'{outdir}/{name}.gif',save_all=True,append_images=gif[1:],duration=83,loop=0)
    hdr=(f'# {name}: cell {CW}x{H}px, baseline y={base} (cell coords), form scale K={form.K:.4f} (idle = {BASE_IDLE_H:.0f}px = base Paddy idle at TARGET=199)\n'
         '# frame  pose  root_x(px, vs frame 1)  lift(px above baseline)  flags (HIT1/2/3 = hit-stop frame, SFX:<cue> = effort sound)\n')
    lines=[]
    for i,f in enumerate(fr):
        fl=[]
        if f['fx'] and f['fx'][0]=='hit': fl.append(f'HIT{f["fx"][1]}')
        if f['sfx']: fl.append('SFX:'+f['sfx'])
        lines.append(f"{i+1} {f['p']} {int(f['X']-fr[0]['X'])} {int(f['lift'])} {' '.join(fl)}".rstrip())
    open(f'{outdir}/{name}_roots.txt','w').write(hdr+'\n'.join(lines)+'\n')
    print(f'{outdir}/{name}.jpg',(W,H),len(fr),'frames | root',[int(f['X']-fr[0]['X']) for f in fr])
    return fr
def chain(form, groups, align_last=True):
    """groups: list of (frames, a, b): play frames[a-1:b]; the next group's frame 1 sits where this group's LAST frame would be
    (its shared neutral), even when the last frame is skipped - exactly the punch_strings cancel rule."""
    out=[]; off=0; nxt=None
    for gi,(frames,a,b) in enumerate(groups):
        fr=layout(form,frames)
        if gi>0: off=nxt-fr[0]['X']
        for k,f in enumerate(fr[a-1:b]): f=dict(f); f['X']+=off; f['tag']=f'g{gi+1}f{a+k}'; out.append(f)
        nxt=fr[-1]['X']+off
    return out
def write_demo(form,path,groups,dummy=None,hold=500):
    fr=chain(form,groups)
    extra=0
    if dummy: extra=dummy.width_needed(fr)
    cells,base,CW,H=render_frames(fr,pad=extra)
    if dummy: cells=dummy.composite(fr,cells,base,CW,H)
    gif=[]
    for c in cells:
        g=Image.new('RGBA',(c.width+40,c.height),GIFBG); g.alpha_composite(c,(20,0)); gif.append(g.convert('RGB'))
    dur=[83]*len(gif); dur[-1]=hold
    gif[0].save(path,save_all=True,append_images=gif[1:],duration=dur,loop=0)
    hdr=f'# {os.path.basename(path)}: canvas {CW+40}x{H}; root x vs frame 1 (px), lift; gNfM = move N frame M; flags as in the sheets\n'
    L=[]
    for i,f in enumerate(fr):
        fl=[]
        if f['fx'] and f['fx'][0]=='hit': fl.append(f'HIT{f["fx"][1]}')
        if f['sfx']: fl.append('SFX:'+f['sfx'])
        L.append(f"{i+1} {f['tag']} {f['p']} {int(f['X']-fr[0]['X'])} {int(f['lift'])} {' '.join(fl)}".rstrip())
    open(path.replace('.gif','_roots.txt'),'w').write(hdr+'\n'.join(L)+'\n')
    print(path,len(fr),'frames, travel',int(fr[-1]['X']-fr[0]['X']),'px')
    return fr

# ---------------- sparring dummy (tests/sparring_dummy, read-only; 340 px tall = base idle = this form's idle, so NO scaling) ----------------
DUMMY='/workspace/paddy-sprite-studio/tests/sparring_dummy'
REACT={'light':[('hit_light',k) for k in (1,1,2,3,4)],
       'heavy':[('hit_heavy',k) for k in (1,1,2,3,4,5,6)],
       'ko':[('hit_heavy',1)]*3+[('knockdown',k) for k in (1,2,3,4,5,6,6,6)],
       'launch':[('launched',k) for k in (1,2,3,4,5,6)],
       'air':[('launched',6)]*3,
       'spike':[('launched',6),('launched',6),('knockdown',4),('knockdown',5),('knockdown',6),('knockdown',6),('recover',1),('recover',2),('recover',3),('recover',4)]}
class Dummy:
    def __init__(s, gap=-6):
        s.meta=json.load(open(f'{DUMMY}/sheets_meta.json')); s.gap=gap
    def im(s,mv,k): return Image.open(f'{DUMMY}/frames/{mv}_{k:02d}.png').convert('RGBA')
    def width_needed(s,fr): return 520
    def composite(s,fr,cells,base,CW,H):
        """Dummy reaction track. At every HIT1 frame the dummy root is placed so its front edge touches the strike point (contact tip =
        frame 'contact' or the FX tip, overlap 'gap'); between hits the root is interpolated (the dummy is knocked back / carried up and
        away, so blinks and dashes close a real distance). Dummy is drawn UNDER Paddy so the burst reads."""
        ev=[]; state='ground'; air_extra=0; seq=[]; track=[]; idle_k=0
        for i,(f,c) in enumerate(zip(fr,cells)):
            hit = bool(f['fx'] and f['fx'][0]=='hit' and f['fx'][1]==1)
            if hit:
                r=f.get('react','light'); seq=list(REACT[r])
                if r in ('air','launch'): state='air'
                if r=='air': air_extra=max(0,f['lift']-200)
                mv,k=seq[0]; d=s.im(mv,k); mt=s.meta[mv]; a=np.asarray(d)[...,3]>128
                tx,ty=tip(f,f.get('contact') or f['fx'][-1]); tx+=f['cell_x']; ty+=f['cell_y']
                yoff=base-mt['baseline']-(air_extra if (mv=='launched' and k==6) else 0)
                row=int(np.clip(ty-yoff,0,a.shape[0]-1)); band=a[max(0,row-14):row+14]
                cols=np.where(band.any(0))[0]; lx=cols.min() if len(cols) else np.where(a.any(0))[0].min()
                ev.append((i, tx-f.get('gap',-6)-(lx-mt['root_x'])))
            if seq: mv,k=seq.pop(0)
            elif state=='air': mv,k='launched',6
            elif track and track[-1][0] in ('knockdown',) : mv,k='knockdown',6
            else: mv,k='idle',idle_k%4+1; idle_k+=1
            if mv=='knockdown' or mv=='recover': air_extra=0; state='ground'
            track.append((mv,k,air_extra if (mv=='launched' and k==6) else 0,hit))
        if not ev: ev=[(0,CW-150)]
        def root_at(i):
            if i<=ev[0][0]: return ev[0][1]
            for (i0,r0),(i1,r1) in zip(ev,ev[1:]):
                if i0<=i<=i1: return r0+(r1-r0)*(i-i0)/(i1-i0)
            return ev[-1][1]+min(i-ev[-1][0],4)*10      # small slide after the last hit
        res=[]
        for i,((mv,k,ex,hit),c) in enumerate(zip(track,cells)):
            mt=s.meta[mv]; d=s.im(mv,k); L=Image.new('RGBA',c.size,(0,0,0,0)); sh=3 if hit else 0
            L.alpha_composite(d,(int(root_at(i)-mt['root_x']+sh),int(base-mt['baseline']-ex)))
            L.alpha_composite(c); res.append(L)
        return res
