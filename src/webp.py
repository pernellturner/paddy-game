# make a small .webp next to every sprite .png (the game loads webp first, png as fallback)
import glob,os
from PIL import Image
from concurrent.futures import ProcessPoolExecutor
def one(f):
    w=f[:-4]+'.webp'
    if os.path.exists(w) and os.path.getmtime(w)>=os.path.getmtime(f): return 0
    Image.open(f).save(w,'WEBP',quality=90,method=4);return 1
if __name__=='__main__':
    fs=sorted(glob.glob('assets/p/*.png')+glob.glob('assets/*.png'))
    with ProcessPoolExecutor() as ex: n=sum(ex.map(one,fs,chunksize=8))
    print('converted',n,'of',len(fs))
