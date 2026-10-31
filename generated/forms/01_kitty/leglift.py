"""Procedural leg-lift variants for the walk (the generator would not draw a lifted hind/far leg; it kept copying walk_1).
Cuts one leg out of a keyed frame below a cut line, rotates it about its top (hip/shoulder) and lifts it, so the step clearly alternates.
usage: python3 leglift.py   (writes frames/walk_hl.png and frames/walk_fl.png from frames/walk_1.png). Run after key.py, before moves.py."""
import numpy as np
from PIL import Image
def lift(src,dst,box,pivot,ang,up,dx=0):
    im=Image.open(src).convert('RGBA'); a=np.asarray(im).copy()
    x0,y0,x1,y1=box; leg=np.zeros_like(a); leg[y0:y1,x0:x1]=a[y0:y1,x0:x1]
    # feather the cut line so the rotated leg blends into the belly
    for k in range(12): leg[y0+k,x0:x1,3]=(leg[y0+k,x0:x1,3]*(k/12)).astype(np.uint8)
    a[y0+12:y1,x0:x1]=0
    L=Image.fromarray(leg).rotate(ang,resample=Image.BICUBIC,center=pivot,translate=(dx,-up))
    base=Image.fromarray(a); base.alpha_composite(L); base.save(dst); print(dst)
lift("frames/walk_1.png","frames/walk_hl.png",(335,400,480,543),(405,405),45,48,12)   # far hind paw up + forward
lift("frames/walk_1.png","frames/walk_fl.png",(505,415,615,543),(560,420),45,50,16)   # far front paw up + forward
lift("frames/walk_1.png","frames/walk_nh.png",(120,380,250,543),(225,385),-28,30,-6)   # near hind toe-off: paw peels up off the ground behind
