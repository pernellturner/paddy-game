"""QA contact sheets: checks/all_frames_one_scale.jpg (every keyed frame at the ONE form scale K, shared baseline, labelled) and
checks/sheets_a/b/c.jpg (every sheets/*.jpg stacked, labelled, thirds)."""
import sys, glob, os
sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import Form
from PIL import Image, ImageDraw
import numpy as np
F=Form('.'); K=F.K
names=sorted(os.path.basename(p)[:-4] for p in glob.glob('frames/*.png'))
ims=[]
for n in names:
    i=Image.open(f'frames/{n}.png'); i=i.resize((round(i.width*K),round(i.height*K)),Image.LANCZOS); ims.append((n,i))
cols=10; cw=max(i.width for _,i in ims)+16; ch=max(i.height for _,i in ims)+30; rows=(len(ims)+cols-1)//cols
S=Image.new('RGBA',(cols*cw,rows*ch+30),(255,0,255,255)); d=ImageDraw.Draw(S)
ia=np.asarray(dict(ims)['idle_a'])[...,3]; ys=np.where(ia.max(1)>200)[0]
d.text((8,8),f'Knight: every frame at ONE scale K={K:.4f}; idle_a = {ys.max()-ys.min()+1}px (alpha>200); white line = idle_a top',fill='white')
for j,(n,i) in enumerate(ims):
    X=(j%cols)*cw+8; Y=30+(j//cols)*ch; base=Y+ch-6
    S.alpha_composite(i,(X,base-i.height)); d.text((X,Y+2),f'{n} {i.height}',fill='white')
    d.line((X,base-340,X+cw-16,base-340),fill=(255,255,255)); d.line((X,base,X+cw-16,base),fill=(60,60,60))
S.convert('RGB').save('checks/all_frames_one_scale.jpg',quality=90); print('all_frames_one_scale',S.size)
sh=sorted(glob.glob('sheets/*.jpg')); sh=[s for s in sh if not s.endswith('_green.jpg')]
W=2400; parts=[sh[i::1] for i in range(1)][0]; n3=(len(parts)+2)//3
for k,grp in zip('abc',[parts[:n3],parts[n3:2*n3],parts[2*n3:]]):
    rows=[]
    for s in grp:
        im=Image.open(s).convert('RGB'); sc=min(1,W/im.width,260/im.height); im=im.resize((round(im.width*sc),round(im.height*sc)))
        c=Image.new('RGB',(W,im.height+22),(40,40,40)); c.paste(im,(0,22)); ImageDraw.Draw(c).text((6,4),os.path.basename(s),fill='white'); rows.append(c)
    T=Image.new('RGB',(W,sum(r.height for r in rows)),(40,40,40)); y=0
    for r in rows: T.paste(r,(0,y)); y+=r.height
    T.save(f'checks/sheets_{k}.jpg',quality=88); print('sheets',k,len(grp))
