"""Walk alternation (Knight), same approach as 03_samurai. Two real walk drawings: walk_3 (long stride) and walk_2 (high-knee passing).
Each output darkens exactly one leg (the FAR one, in shadow), so the cycle reads near-fwd -> far-knee-up -> far-fwd -> near-knee-up.
Boxes are in keyed-frame pixels (frames/walk_2.png 616x870, frames/walk_3.png 611x855). The silver greaves take the shading well."""
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
OUT={  # name: (source, box of the FAR leg = the shaded one)
 'walk_a':('walk_3',(150,650,305,855)),   # stride, near leg forward, far leg back
 'walk_b':('walk_2',(440,615,616,775)),   # passing, far knee lifted
 'walk_c':('walk_3',(445,650,611,855)),   # stride, far leg forward, near leg back
 'walk_d':('walk_2',(200,640,315,870)),   # passing, near knee lifted, far leg planted
}
for n,(src,(x0,y0,x1,y1)) in OUT.items():
    im=Image.open(f'frames/{src}.png').convert('RGBA'); a=np.asarray(im).astype(float)
    m=Image.new('L',im.size,0); ImageDraw.Draw(m).rounded_rectangle((x0,y0,x1,y1),radius=30,fill=255)
    m=np.asarray(m.filter(ImageFilter.GaussianBlur(10)))/255.0
    k=1-0.58*m; a[...,0]*=k; a[...,1]*=k; a[...,2]*=(1-0.48*m)          # shade (slightly cool) = far side
    Image.fromarray(a.clip(0,255).astype(np.uint8),'RGBA').save(f'frames/{n}.png'); print(n)
