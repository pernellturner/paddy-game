"""Facing-RIGHT copies (suffix _R) of the BASE dummy sheets: every cell of frames/<move>_NN.png flipped left-right, re-laid out in
the same frame order (so frame 1 is still leftmost), same cell size/baseline/lift, root x mirrored (root_x_R = cell_w-1-root_x).
NOTE a plain mirror: the light now comes from the upper right and the belt buckle/cream patch swap sides. Run after rig.py."""
import os, json, re
from PIL import Image, ImageOps
D=os.path.dirname(os.path.abspath(__file__)); F=f'{D}/frames'; GAP,M=40,48
meta=json.load(open(f'{D}/sheets_meta.json'))
for move in ['idle','hit_light','hit_heavy','launched','launched_fall','knockdown','recover']:
    mt=meta[move]; CW,Hh=mt['cell']; n=mt['frames']; cells=[]
    for i in range(n):
        c=ImageOps.mirror(Image.open(f'{F}/{move}_{i+1:02d}.png')); c.save(f'{F}/{move}_R_{i+1:02d}.png'); cells.append(c)
    W=M*2+CW*n+GAP*(n-1); sheet=Image.new('RGBA',(W,Hh),(255,0,255,255))
    for i,c in enumerate(cells): sheet.alpha_composite(c,(M+i*(CW+GAP),0))
    sheet.convert('RGB').save(f'{D}/{move}_R.jpg',quality=95,subsampling=0)
    gif=[]
    for c in cells:
        g=Image.new('RGBA',(CW+40,Hh),(236,236,240,255)); g.alpha_composite(c,(20,0)); gif.append(g.convert('RGB'))
    gif[0].save(f'{D}/{move}_R.gif',save_all=True,append_images=gif[1:],duration=83,loop=0)
    rx=CW-1-mt['root_x']; txt=open(f'{D}/{move}_roots.txt').read().splitlines()
    head=re.sub(r'standing base centre x=\d+',f'standing base centre x={rx}',txt[0]).replace(f'dummy {move}:',f'dummy {move}_R (mirror of {move}, FACES RIGHT):')
    open(f'{D}/{move}_R_roots.txt','w').write('\n'.join([head]+txt[1:])+'\n')
    meta[f'{move}_R']=dict(mt,root_x=rx); print(f'{move}_R',(W,Hh),n,'frames root_x',rx)
json.dump(meta,open(f'{D}/sheets_meta.json','w'),indent=1)
