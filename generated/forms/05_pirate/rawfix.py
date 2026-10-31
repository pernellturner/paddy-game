"""Pre-key clean-ups (writes raw/clean/<pose>.jpg; build.sh keys the clean copy when one exists). Same method as 04_knight/rawfix.py.
GROUND_LINE: poses where the generator drew a dark-green ground line across the frame; any green-dominant pixel in the band
(raw rows ~868-892) is reset to the flat background green so no line survives the key. Fill this in after the drawings are reviewed
(empty = nothing to fix; the script then does nothing)."""
import os, numpy as np
from PIL import Image
GROUND_LINE={}   # e.g. {'fin_imp':(868,892)}
os.makedirs('raw/clean',exist_ok=True)
for n,(y0,y1) in GROUND_LINE.items():
    a=np.asarray(Image.open(f'raw/{n}.jpg').convert('RGB')).astype(int)
    bg=np.median(np.concatenate([a[0],a[:,0],a[:,-1]]),0).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    band=np.zeros(r.shape,bool); band[y0:y1]=True
    line=band&(g>r+50)&(g>b+50)
    a[line]=bg; Image.fromarray(a.astype(np.uint8)).save(f'raw/clean/{n}.jpg',quality=97); print(n,'line px cleaned:',line.sum())
print('rawfix:',len(GROUND_LINE),'pose(s) cleaned')
