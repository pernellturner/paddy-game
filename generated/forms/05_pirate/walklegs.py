"""Walk alternation (Pirate), same approach as 04_knight / 03_samurai. Two real walk drawings: walk_3 (long swagger stride, near leg
forward) and walk_2 (passing, near leg planted, far knee lifted). Each output darkens exactly one leg (the FAR one, in shadow), so
the cycle reads near-fwd -> far-knee-up -> far-fwd -> near-knee-up.
Boxes are in keyed-frame pixels (frames/walk_2.png, frames/walk_3.png). Set them by eye once the drawings exist; while a box is
None it is estimated from the alpha (lower 30% of the figure, back half or front half split at the leg-region centre)."""
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
OUT={  # name: (source, box of the FAR leg = the shaded one, or None, fallback side 'back'|'front')
 # boxes set by eye on frames/walk_3.png (620x871) and frames/walk_2.png (567x834); two boxes per back leg so the tail
 # (which overlaps the back thigh) is NOT shaded
 'walk_a':('walk_3',[(200,640,305,760),(140,750,305,871)],'back'),   # stride, near leg forward, far leg back
 'walk_b':('walk_2',[(360,570,535,765)],'front'),                    # passing, far knee lifted (forward of the planted leg)
 'walk_c':('walk_3',[(340,690,570,871)],'front'),                    # stride, far leg forward, near leg back
 'walk_d':('walk_2',[(210,600,305,715),(140,700,305,834)],'back'),   # passing, near knee lifted, far leg planted
}
def est(a,side):
    m=a[...,3]>128; ys,xs=np.where(m); top,bot=ys.min(),ys.max(); y0=int(bot-0.30*(bot-top))
    lx=xs[ys>=y0]; cx=int(np.median(lx))
    return (lx.min(),y0,cx,bot) if side=='back' else (cx,y0,lx.max(),bot)
for n,(src,box,side) in OUT.items():
    im=Image.open(f'frames/{src}.png').convert('RGBA'); a=np.asarray(im).astype(float)
    boxes=box or [est(a,side)]
    m=Image.new('L',im.size,0)
    for bx in boxes: ImageDraw.Draw(m).rounded_rectangle(bx,radius=30,fill=255)
    m=np.asarray(m.filter(ImageFilter.GaussianBlur(16)))/255.0
    k=1-0.58*m; a[...,0]*=k; a[...,1]*=k; a[...,2]*=(1-0.48*m)          # shade (slightly cool) = far side
    Image.fromarray(a.clip(0,255).astype(np.uint8),'RGBA').save(f'frames/{n}.png'); print(n,boxes)
