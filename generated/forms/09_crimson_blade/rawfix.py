"""Pre-key clean-ups (writes raw/clean/<pose>.jpg; build.sh keys the clean copy when one exists). Same method as 08_power_blade/rawfix.py.
Crimson Blade Paddy is drawn on GREEN (the generator's green is slightly off pure, ~#4AB845; _kit/key.py measures the real border
colour): the form has no green (crimson coat, gold trim, brown leather, dark-red blade), so the green-dominant test (G well above R and
B) never touches the coat, trim, boots or blade.
GROUND_LINE: poses where the generator drew a dark-green ground line / floor shadow across the frame; any green-dominant pixel in the
band (raw rows y0..y1) is reset to the flat background green so no line survives the key. Fill this in after the drawings are reviewed
(empty = nothing to fix; the script then does nothing)."""
import os, numpy as np
from PIL import Image
GROUND_LINE={}   # e.g. {'walk_2':(904,922)} after the drawing review
os.makedirs('raw/clean',exist_ok=True)
for n,(y0,y1) in GROUND_LINE.items():
    a=np.asarray(Image.open(f'raw/{n}.jpg').convert('RGB')).astype(int)
    bg=np.median(np.concatenate([a[0],a[:,0],a[:,-1]]),0).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    band=np.zeros(r.shape,bool); band[y0:y1]=True
    line=band&(g>r+50)&(g>b+50)
    a[line]=bg; Image.fromarray(a.astype(np.uint8)).save(f'raw/clean/{n}.jpg',quality=97); print(n,'line px cleaned:',line.sum())
print('rawfix:',len(GROUND_LINE),'pose(s) cleaned')
