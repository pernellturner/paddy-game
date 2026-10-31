"""Pre-key clean-ups (writes raw/clean/<pose>.jpg; build.sh keys the clean copy when one exists). Same method as 06_gunslinger/rawfix.py.
Power Blade Paddy is drawn on GREEN (#00FF00): the form has no green (navy coat, electric-blue trim, silver/blue greatsword), so the
green-dominant test (G well above R and B) never touches the coat, trim or blade.
GROUND_LINE: poses where the generator drew a dark-green ground line across the frame; any green-dominant pixel in the band
(raw rows ~868-892) is reset to the flat background green so no line survives the key. Fill this in after the drawings are reviewed
(empty = nothing to fix; the script then does nothing)."""
import os, numpy as np
from PIL import Image
GROUND_LINE={'walk_2':(904,922),'l1_snap':(872,890),'fin_imp':(794,820)}   # 1 Nov 2026 review: thin drawn ground line in walk_2 (rows ~910-915) and l1_snap (~878-884), soft floor shadow under fin_imp (~801-814); green-dominant pixels only, so feet, coat and blade are untouched
os.makedirs('raw/clean',exist_ok=True)
for n,(y0,y1) in GROUND_LINE.items():
    a=np.asarray(Image.open(f'raw/{n}.jpg').convert('RGB')).astype(int)
    bg=np.median(np.concatenate([a[0],a[:,0],a[:,-1]]),0).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    band=np.zeros(r.shape,bool); band[y0:y1]=True
    line=band&(g>r+50)&(g>b+50)
    a[line]=bg; Image.fromarray(a.astype(np.uint8)).save(f'raw/clean/{n}.jpg',quality=97); print(n,'line px cleaned:',line.sum())
print('rawfix:',len(GROUND_LINE),'pose(s) cleaned')
