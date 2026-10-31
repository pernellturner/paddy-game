"""Pre-key clean-ups (writes raw/clean/<pose>.jpg; build.sh keys the clean copy when one exists).
* fin_imp: the generator drew a thin dark-green ground line across the frame (raw rows ~876-885). Any dark/green-dominant pixel in
  that band is reset to the flat background green, so no line or dark rim can survive the key under the feet.
* recover: the small green breath puff in front of the face is close to the key colour and already keys out (nothing to do)."""
import os, numpy as np
from PIL import Image
os.makedirs('raw/clean',exist_ok=True)
a=np.asarray(Image.open('raw/fin_imp.jpg').convert('RGB')).astype(int)
bg=np.median(np.concatenate([a[0],a[:,0],a[:,-1]]),0).astype(int)
r,g,b=a[...,0],a[...,1],a[...,2]
band=np.zeros(r.shape,bool); band[868:892]=True
line=band&(g>r+50)&(g>b+50)
a[line]=bg; Image.fromarray(a.astype(np.uint8)).save('raw/clean/fin_imp.jpg',quality=97); print('fin_imp line px cleaned:',line.sum())
