"""v38: cut KNIGHT PADDY (form 04, sprite studio forms/04_knight) into game frames  ->  assets/p/kg_<move>_NN.png/.webp + frames.json kg_*.
Copy of src/cut_kitty.py. Knight has no purple, so the studio made no green copy: the magenta key (border-connected un-mix) is used
for every sheet and the green cross-check is skipped (it reports pink residue only). K=0.3949 (knight idle_a = 340 px).
Source (kept in the repo): generated/forms/02_ninja/  sheets/ (#FF00FF, primary)  sheets_green/ (#00FF00 copies)  demos/  NOTES.md
  + anchors.json (body-centre x / baseline / lift of every frame, from src/ninja_anchors.py).
Sheet format (formkit): one row, margin 48, gap 40, equal cells (size in the _roots.txt header), shared foot baseline, lift drawn in.
SCALE - one factor for every frame, nothing normalised per frame:
  the studio drew every frame at ONE form scale K=0.4298 (ninja idle = 340 px = base Paddy's upright guard at TARGET=199), i.e. on the
  same TARGET=199 grid as base Paddy's approved punch sheets. In game we apply the same TARGET=199 -> game factor that
  src/cut_power.py uses for those sheets (sqrt(fur area of the in-game idle frame)/199), so Ninja is exactly base height.
KEY - magenta with a purple-safe clean-up (the suit trim is purple/lavender, which a plain magenta un-mix eats):
  the magenta un-mix is only applied to pixels connected to the cell border through key-mixed pixels (background, soft edges,
  semi-transparent FX and blink after-images); purple trim enclosed by the dark suit is never touched (see key()). Each sheet is checked against the green copy
  keyed the same way; if the masks disagree (eaten trim, left-over pink) the sheet falls back to sheets_green.
Anchors: x = body centre of the pose (anchors.json cx), y = foot baseline minus lift. rx / ly = that anchor's travel / lift vs frame 1
  (frame px), so root motion follows the body and every sheet's shared neutral sits on the same spot. hit = HIT1/2/3, sfx = effort cue.
Usage: python3 src/cut_ninja.py"""
import numpy as np, json, os, re, glob, sys
from PIL import Image
from scipy import ndimage as ndi
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SRC='generated/forms/04_knight'; M,GAP=48,40; PRE='kg_'
KEYS={'idle':'idle','ready':'ready','walk':'walk','victory':'victory','light1_shieldjab':'l1','light2_thrust':'l2','light3_forehand':'l3',
 'light4_shieldupper':'l4','light5_lowcut':'l5','heavy1_overhead':'h1','heavy2_shieldcharge':'h2','launcher':'launch','air1_slash':'a1',
 'air2_shieldbash':'a2','air3_plunge':'a3','blink':'blink','blink_air':'blinka','block':'block','dodge':'dodge','counter':'counter',
 'finisher_bastion':'fin'}
def catmask(a):
    r,g,b,al=[a[...,i].astype(int) for i in range(4)]; return (al>200)&(((r-b)>18)|((r<110)&(r>b)))
idle=np.asarray(Image.open('assets/p/idle_test_1_00.png').convert('RGBA'))
GS=float(os.environ.get('KG_SCALE',0))or np.sqrt(catmask(idle).sum())/199.0
print('game factor (TARGET=199 -> game) %.4f'%GS)
def key(c,green):
    """c float RGB cell -> (rgb, alpha 0..1). m = how much key colour is mixed into a pixel; alpha = 1-m, colour = un-mixed.
    Green: m = (g - max(r,b)) is exact for every colour Ninja uses (nothing in him is green), so it is applied everywhere.
    Magenta (purple-safe): m = (min(r,b) - g) is exact for fur, cream, white/lavender FX, dust and the violet blink ghosts, but NOT for the
    purple suit trim (green far below red/blue). So it is only applied inside the region connected to the cell border through
    key-mixed pixels (the background, soft edges, semi-transparent FX / ghosts); trim enclosed by the dark suit is never touched."""
    r,g,b=c[...,0],c[...,1],c[...,2]
    if green: m=np.clip((g-np.maximum(r,b))/255.0,0,1); K=np.array([0,255,0.]); reg=np.ones(m.shape,bool)
    else:
        m=np.clip((np.minimum(r,b)-g)/255.0,0,1); K=np.array([255,0,255.])
        lab,n=ndi.label(m>.10); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
        reg=np.isin(lab,list(border))
        if n:   # enclosed pockets of background (between an arm and the body): only clearly pure key colour
            idx=np.arange(1,n+1); pure=ndi.sum(m>.88,lab,idx)   # trim never gets near pure #FF00FF (m>.88)
            hole=[i for i,q in zip(idx,pure) if i not in border and q>=4]
            if hole: reg|=np.isin(lab,hole)
        reg=ndi.binary_dilation(reg,iterations=1)&(m>.04)|reg
    mb=np.where(reg,m,0); mb[mb<.07]=0
    al=1-mb; al[al<.06]=0
    out=(c-mb[...,None]*K)/np.maximum(1-mb,.06)[...,None]
    lab2,n2=ndi.label(al>.5)   # lone JPEG specks off the body
    if n2>1:
        sz=ndi.sum(al>.5,lab2,np.arange(1,n2+1)); small=np.isin(lab2,1+np.nonzero(sz<14)[0]); al[small&(al<.98)]=0
    return np.clip(out,0,255),al,reg
def residue(rgb,al,green):
    r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]
    keyish=((g<80)&(r>185)&(b>185)) if not green else ((g>185)&(r<80)&(b<80))
    return int(((al>.3)&keyish).sum())
frames=json.load(open('assets/frames.json'))
for k in [PRE+v for v in KEYS.values() if PRE+v in frames]: del frames[k]   # only this form's own sheets (kt_m_* etc. belong to other code)
for v in KEYS.values():
    for f in glob.glob(f'assets/p/{PRE}{v}_[0-9][0-9].*'): os.remove(f)
AN=json.load(open(SRC+'/anchors.json'))
report=[]
for sheet,short in KEYS.items():
    hdr=open(f'{SRC}/sheets/{sheet}_roots.txt').read()
    CW,CH=map(int,re.search(r'cell (\d+)x(\d+)',hdr).groups()); B=int(re.search(r'baseline y=(\d+)',hdr).group(1))
    rows=[l.split() for l in hdr.splitlines() if l[:1].isdigit()]; n=len(rows)
    an=AN[sheet]; assert len(an['frames'])==n and an['base']==B,(sheet,n,len(an['frames']),an['base'],B)
    S={}
    for green in (0,):
        im=np.asarray(Image.open(f'{SRC}/{"sheets_green" if green else "sheets"}/{sheet}.jpg').convert('RGB')).astype(float)
        assert abs(M*2+CW*n+GAP*(n-1)-im.shape[1])<=2 and im.shape[0]==CH,(sheet,im.shape)
        S[green]=[key(im[:,M+i*(CW+GAP):M+i*(CW+GAP)+CW],green) for i in range(n)]
    bad=[];worst=(0,0,max(residue(S[0][i][0],S[0][i][1],0) for i in range(n)))
    use=1 if bad else 0
    report.append(f'{sheet:18s} -> {"GREEN fallback" if use else "magenta"}  worst eaten/extra/pink {worst}'+(f'  failed frames {bad}' if bad else ''))
    frames[PRE+short]=[]
    for i,(c,al,bg) in enumerate(S[use]):
        ys,xs=np.nonzero(al>.03); bx0,bx1,by0,by1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
        rgba=Image.fromarray(np.dstack([c,al*255])[by0:by1,bx0:bx1].astype(np.uint8),'RGBA')
        W,Hh=max(1,round(rgba.width*GS)),max(1,round(rgba.height*GS)); rgba=rgba.resize((W,Hh),Image.LANCZOS)
        fa=an['frames'][i]; f0=an['frames'][0]
        ax=(fa['cx']-bx0)*GS; ay=(fa['foot_y']-by0)*GS+3
        fl=rows[i][4:] if len(rows[i])>4 else []
        hit=next((int(x[3]) for x in fl if x.startswith('HIT')),0); sfx=next((' '.join(rows[i][rows[i].index(x):]).split(':',1)[1] for x in rows[i] if x.startswith('SFX:')),'')
        fn=f'p/{PRE}{short}_{i:02d}'; rgba.save(f'assets/{fn}.png',optimize=True); rgba.save(f'assets/{fn}.webp',quality=90,method=6)
        e=dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=Hh,rx=round((fa['cx']-f0['cx'])*GS,1),ly=round(fa['lift']*GS,1),p=fa['p'],sc=round(an['K']*GS,5))   # sc = studio raw -> game px scale, one value for the whole form (size gate)
        if hit:e['hit']=hit
        if sfx:e['sfx']=sfx
        frames[PRE+short].append(e)
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
open(SRC+'/cut_report.txt','w').write('scale %.4f (sheet px -> game frame px; frames then draw at SC=0.8)\n'%GS+'\n'.join(report)+'\n')
print('\n'.join(report))
