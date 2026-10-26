import numpy as np, os
from PIL import Image, ImageFilter
from scipy import ndimage as nd
def seg(f, thr, rows, cols, minarea, magenta=False, dil=3):
    im=np.asarray(Image.open(f).convert('RGB')).astype(float)
    h,w,_=im.shape
    e=np.concatenate([im[:6].reshape(-1,3),im[-6:].reshape(-1,3),im[:,:6].reshape(-1,3),im[:,-6:].reshape(-1,3)])
    bg=np.median(e,0)
    d=np.sqrt(((im-bg)**2).sum(2))
    near=d<thr
    if magenta:
        r,g,b=im[...,0],im[...,1],im[...,2]
        bgm = near | ((r-g>90)&(b-g>30)&(r>120))
    else:
        lab,_=nd.label(near); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
        bgm=np.isin(lab,list(border))
    fg=~bgm
    fg=nd.binary_opening(fg,iterations=2)
    lab,n=nd.label(nd.binary_dilation(fg,iterations=dil))
    res=[]
    for i,s in enumerate(nd.find_objects(lab)):
        m=(lab[s]==i+1)&fg[s]
        if m.sum()<minarea: continue
        cy=(s[0].start+s[0].stop)/2; cx=(s[1].start+s[1].stop)/2
        res.append((int(cy//(h/rows)), cx, s, m))
    res.sort(key=lambda r:(r[0],r[1]))
    for k,(_,_,s,m) in enumerate(res):
        crop=im[s].copy()
        # despill edges: pull edge colours toward neighbour-ish by desaturating bg tint
        a=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
        if magenta:
            g=crop[...,1]; crop[...,0]=np.minimum(crop[...,0],np.maximum(g, crop[...,2])+40) if False else crop[...,0]
            # reduce magenta spill: limit r and b relative to g where edge
            edge=(np.asarray(a)<250)
            spill=np.minimum(crop[...,0],crop[...,2])-crop[...,1]
            fix=edge&(spill>20)
            crop[fix,0]-=spill[fix]*0.6; crop[fix,2]-=spill[fix]*0.6
        rgba=Image.fromarray(np.clip(crop,0,255).astype(np.uint8)).convert('RGBA'); rgba.putalpha(a)
        rgba.save(f"raw/{f.split('.')[0]}_{k:02d}.png")
    print(f,bg,len(res))
os.makedirs('raw',exist_ok=True)
seg('s1.jpg',14,5,7,3000); seg('s2.jpg',60,3,5,3000,True); seg('s3.jpg',14,4,6,3000); seg('s4.png',60,2,2,8000,True); seg('s5.png',60,2,2,8000,True)
