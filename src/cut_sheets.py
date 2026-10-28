"""Cut generated/ sprite sheets (single row, magenta/pink bg) into consistently
scaled frames with a shared ground line. Writes assets/p/*.png + assets/frames.json"""
import numpy as np, json, os, glob, sys
from PIL import Image, ImageFilter
from scipy import ndimage as nd
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
PADDY='idle_test_1 run jump doublejump dash divebomb stalk walk startstop hardland wingeddash wallclimb walljump ledge wiggle slide clawcombo dashstrike uppercut airswipe airspin diveclaw pounce tailwhip energyblast finisher hurt victory groom stretch sitflick sniff loaf hiss swat zoomies bunnykick blinkbarge launcher clawsa clawsb clawsc'.split()
SAM='idle run draw jump combo_a combo_b combo_c air launch_iaido parry_charge'.split()
ROT='idle_walk punch bark_bite hurt_air ko silly1 silly2'.split()
NINJA='idle run jump attack flip throw dashslash clawsa clawsb'.split()
AIR={'s_jump','s_air','r_hurt_air','n_jump','n_flip','jump','doublejump','airspin','airswipe','divebomb','diveclaw','wingeddash','wallclimb','walljump','ledge','pounce','t_jump','t_pounce','t_air'}
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
def head(c,m):
    """size of the dark face mask: rightmost big dark blob (Paddy faces right)"""
    lum=c.mean(2); dark=m&(lum<95)&~(c[...,2]>c[...,0]+20)
    lab,n=nd.label(dark)
    if n==0: return None
    ar=nd.sum(dark,lab,range(1,n+1)); ok=[i for i in range(n) if ar[i]>0.01*m.sum()]
    if not ok: return None
    cx=nd.center_of_mass(dark,lab,[i+1 for i in ok]); j=ok[int(np.argmax([x for _,x in cx]))]
    ys,xs=np.nonzero(lab==j+1); return max(np.ptp(ys),np.ptp(xs))+1
R=np.asarray(Image.open('assets/s1_05.png').convert('RGBA')).astype(float)
REFHEAD=head(R[...,:3],R[...,3]>128)
refpx=R[...,:3][R[...,3]>200]; RM,RS=refpx.mean(0),refpx.std(0)
def grade(c,m,strength=.75):
    """pull a new sheet's colours toward the original Paddy palette"""
    px=c[m&~(c[...,2]>c[...,0]+20)]; M,S=px.mean(0),px.std(0)+1e-3
    g=(c-M)/S*RS+RM; fx=(c[...,2]>c[...,0]+20)[...,None]
    return np.where(fx,c,c*(1-strength)+g*strength)
jobs=[(n,f'generated/{n}.png' if os.path.exists(f'generated/{n}.png') else f'generated/{n}.jpg') for n in PADDY]+[('s_'+n,f'generated/samurai/{n}.jpg') for n in SAM]+[('r_'+n,f'generated/rottweiler/{n}.jpg') for n in ROT]+[('n_'+n,f'generated/cyborg/c_ninja/{n}.jpg') for n in NINJA]
OLD_T={'t_idle':1.117,'t_run':1.38,'t_jump':1.45,'t_claw':1.42,'t_pounce':.88,'t_roar':1.169,'t_fireball':1.256,'t_hurt':1.163,'t_victory':.738,'t_morph':.967,'t_combo':1.3,'t_air':1.0}
cut={}
for name,path in jobs:
    if name in SKIP: continue
    im,fg=load(path)
    parts=[(x0,x1,y0,y1,m[y0:y1,x0:x1],im[y0:y1,x0:x1]) for x0,x1,y0,y1,m in components(fg)]
    mw=np.median([p[1]-p[0] for p in parts]); n0=len(parts)
    parts=[p for p in parts if p[0]>2 and p[1]<fg.shape[1]-2 and p[1]-p[0]<1.45*mw]
    cut[name]=(parts,n0-len(parts),fg)
# ---- scales: Paddy sheets by face-mask size vs the original idle sprite ----
SC={}
for name,(parts,_,_) in cut.items():
    if name.startswith(('t_','n_','s_','r_')): continue
    hs=[h for h in (head(c,m) for *_,m,c in parts) if h]
    SC[name]=REFHEAD/np.median(hs)
# sheets where the face-mask metric misjudges (big close-up faces) - matched to the original idle by eye
for n,m in {'bunnykick':.8,'blinkbarge':.68,'launcher':.85}.items():
    if n in SC: SC[n]*=m
# neon ninja: one scale for the whole family so the body width of idle matches the original idle Paddy (223px)
NK=223/np.median([p[1]-p[0] for p in cut['n_idle'][0]])
for n in NINJA: SC['n_'+n]=NK*{'clawsb':1.25,'flip':1.0,'throw':1.0,'dashslash':1.0,'jump':1.0,'attack':1.0,'run':1.0}.get(n,1)
# samurai: one scale for the family so idle body width matches the original idle Paddy
SK=223/np.median([p[1]-p[0] for p in cut['s_idle'][0]])
for n in SAM: SC['s_'+n]=SK*{'combo_c':.88}.get(n,1)
# rottweiler enemy: idle height ~235px (a big lug next to Paddy)
RK=235/np.median([p[3]-p[2] for p in cut['r_idle_walk'][0]])
for n in ROT: SC['r_'+n]=RK
for name,(parts,dropped,fg) in cut.items():
    sc=SC[name]
    ground=int(np.median([p[3] for p in parts]))
    frames[name]=[]
    for kk,(s0,s1,y0,y1,m,c) in enumerate(parts):
        a=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
        c=c.copy(); edge=np.asarray(a)<250
        spill=np.minimum(c[...,0],c[...,2])-c[...,1]; fix=edge&(spill>15)
        c[fix,0]-=spill[fix]*.7; c[fix,2]-=spill[fix]*.7
        if not name.startswith(('t_','n_','s_','r_')): c=grade(c,m)
        rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(a)
        W,H=max(1,round(rgba.width*sc)),max(1,round(rgba.height*sc))
        rgba=rgba.resize((W,H),Image.LANCZOS)
        bm=body(c,m); ys,xs=np.nonzero(bm)
        ax=float(np.median(xs))*sc if len(xs) else W/2
        # anchor on the lowest solid pixel (sunk 3px like the original sprites) so nothing hovers;
        # frames that are genuinely airborne in the sheet keep the sheet's shared ground line
        rows=np.nonzero((np.asarray(rgba)[...,3]>128).sum(1)>2)[0]; low=(rows.max()+1) if len(rows) else H
        air_in_sheet=(ground-y1)*sc>15
        ay=(low+3 if name in AIR or not air_in_sheet else (ground-y0)*sc+3)
        fn=f'p/{name}_{kk:02d}'; rgba.save(f'assets/{fn}.png',optimize=True)
        frames[name].append(dict(f=fn,ax=round(ax),ay=round(ay),w=W,h=H))
    report.append(f'{name}: {len(parts)} frames scale {sc:.3f}'+(f' (dropped {dropped} fused/cut-off)' if dropped else ''))
# original first-version sprites (src/s1-s5 cut-outs) stay available as o_<anim>
for k_,v in json.load(open('assets/frames_orig.json')).items(): frames['o_'+k_]=v
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
print('ref head',REFHEAD); print('\n'.join(report))
