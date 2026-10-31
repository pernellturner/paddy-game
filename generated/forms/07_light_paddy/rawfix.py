"""Pre-key clean-ups (writes raw/clean/<pose>.jpg; build.sh keys the clean copy when one exists). Same method as 06_gunslinger/rawfix.py,
but Light Paddy is drawn on MAGENTA (#FF00FF) because the lime-green blade would key out on green.
GROUND_LINE: poses where the generator drew a dark-magenta ground line across the frame; any magenta-dominant pixel in the band
(raw rows ~868-892) is reset to the flat background magenta so no line survives the key. The test is magenta-only (R and B both well
above G), so the lime blade, gold trim and cream robe are never touched. Fill this in after the drawings are reviewed
(empty = nothing to fix; the script then does nothing)."""
import os, numpy as np
from PIL import Image
GROUND_LINE={}   # 1 Nov 2026 review: no drawn ground line or shadow in any of the 42 drawings (row scan for magenta-dominant lines + visual check), so nothing to clean. e.g. {'fin_imp':(868,892)}
os.makedirs('raw/clean',exist_ok=True)
for n,(y0,y1) in GROUND_LINE.items():
    a=np.asarray(Image.open(f'raw/{n}.jpg').convert('RGB')).astype(int)
    bg=np.median(np.concatenate([a[0],a[:,0],a[:,-1]]),0).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    band=np.zeros(r.shape,bool); band[y0:y1]=True
    line=band&(r>g+50)&(b>g+50)
    a[line]=bg; Image.fromarray(a.astype(np.uint8)).save(f'raw/clean/{n}.jpg',quality=97); print(n,'line px cleaned:',line.sum())
print('rawfix:',len(GROUND_LINE),'pose(s) cleaned')
