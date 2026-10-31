"""dummy_demo.gif: Paddy's approved power_jab (tests/paddy_fluid/power_jab.jpg, read-only, cells re-keyed; root motion as in the sheet)
hitting the sparring dummy (frames/ from rig.py). 12 fps (83 ms), last frame held 500 ms. Paddy is drawn over the dummy so the burst shows.
Timeline: P1-4 dummy idle 1-4 | P5-7 hit-stop: hit_heavy 1, 1 (3 px shake), 2 | P8-10 hit_heavy 3-5 | guard hold: hit_heavy 6, idle 1-4."""
import os, json, numpy as np
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__)); S='/workspace/paddy-sprite-studio/tests/paddy_fluid/power_jab.jpg'
meta=json.load(open(f'{D}/sheets_meta.json'))
CW,CG,M,PBASE=602,40,48,401        # power_jab sheet layout (assemble6: cell 602, gap 40, margin 48), foot baseline y=401
FIST=(567,191)                      # burst centre on the fist in impact cell 5 (cell coords)
sheet=np.asarray(Image.open(S).convert('RGB')).astype(float)
def paddy(i):
    c=sheet[:,M+i*(CW+CG):M+i*(CW+CG)+CW]; d=np.sqrt(((c-[255,0,255])**2).sum(-1))
    a=np.clip((d-50)/60,0,1); al=np.maximum(a,1e-3)[...,None]
    rgb=np.clip((c-(1-al)*np.array([255,0,255]))/al,0,255)
    # magenta-tinted mixes (pink edge fringe, the sheet's semi-transparent grey dust): re-estimate alpha from green (magenta has g=0)
    mix=(d>50)&((c[...,0]-c[...,1])>20)&((c[...,2]-c[...,1])>20)
    g=np.clip(c[...,1]/212,0.02,1); a=np.where(mix,np.minimum(a,g),a); al=np.maximum(a,1e-3)[...,None]
    rgb=np.where(mix[...,None],np.array([222,212,204.]),rgb)   # dust/fringe colour (assemble6 puff grey)
    return Image.fromarray(np.dstack([rgb,a*255]).astype(np.uint8),'RGBA')
P=[paddy(i) for i in range(10)]
def dummy(move,k): return Image.open(f'{D}/frames/{move}_{k:02d}.png'), meta[move]
# contact: dummy hit_heavy_01 (the impact frame) leftmost solid pixel at fist height
im,mt=dummy('hit_heavy',1); a=np.asarray(im)[...,3]>128
row=mt['baseline']-(PBASE-FIST[1]); lx=np.where(a[row-4:row+5].any(0))[0].min()
ROOT=FIST[0]-4+(mt['root_x']-lx)    # world x of the dummy's standing root (Paddy cell coords); 6 px overlap under the burst
seq=[(0,'idle',1,0),(1,'idle',2,0),(2,'idle',3,0),(3,'idle',4,0),(4,'hit_heavy',1,0),(5,'hit_heavy',1,3),(6,'hit_heavy',2,0),
     (7,'hit_heavy',3,0),(8,'hit_heavy',4,0),(9,'hit_heavy',5,0),(9,'hit_heavy',6,0),(9,'idle',1,0),(9,'idle',2,0),(9,'idle',3,0),(9,'idle',4,0)]
TOPPAD=20; base=max(PBASE,max(meta[m]['baseline'] for m in ('idle','hit_heavy')))+TOPPAD
W=ROOT+max(meta[m]['cell'][0]-meta[m]['root_x'] for m in ('idle','hit_heavy'))+30; H=base+40
frames=[]
for pi,mv,k,sh in seq:
    c=Image.new('RGBA',(W,H),(236,236,240,255)); im,mt=dummy(mv,k)
    c.alpha_composite(im,(ROOT-mt['root_x']+sh,base-mt['baseline']))
    c.alpha_composite(P[pi],(0,base-PBASE)); frames.append(c.convert('RGB'))
dur=[83]*len(frames); dur[-1]=500
frames[0].save(f'{D}/dummy_demo.gif',save_all=True,append_images=frames[1:],duration=dur,loop=0)
frames[4].save(f'{D}/raw/demo_contact_check.png'); frames[6].save(f'{D}/raw/demo_contact_check2.png')
print('dummy_demo.gif',(W,H),len(frames),'frames; dummy root x',ROOT,'contact row',row,'lx',lx)
