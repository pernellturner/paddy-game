import json,os
from PIL import Image,ImageDraw
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
F=json.load(open('assets/frames.json'));names=list(F)
import sys; sel=sys.argv[1:] or names
rows=[]
for n in sel:
    rows.append(n)
W=1900;RH=230;c=Image.new('RGB',(W,RH*len(rows)),(150,190,230));d=ImageDraw.Draw(c)
for r,n in enumerate(rows):
    y=r*RH+190;d.line((0,y,W,y),fill=(60,60,60));d.text((4,r*RH+4),n,fill=0);x=10
    for f in F[n]:
        im=Image.open(f"assets/{f['f']}.png");im=im.resize((int(im.width*.8),int(im.height*.8)))
        c.paste(im,(x+60-int(f['ax']*.8),y-int(f['ay']*.8)),im);x+=170
c.save(('/workspace/rev/'+os.environ.get('O','prev')+'.jpg'),quality=80)
