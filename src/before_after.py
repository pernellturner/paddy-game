"""Before/after strip: python3 src/before_after.py OUT.png 'Label|old_sheet:i,j|new_sheet:i,j' ..."""
import json,sys,os
from PIL import Image,ImageDraw,ImageFont
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
F=json.load(open(os.path.join(ROOT,'assets/frames.json')))
try: FT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',18)
except Exception: FT=None
CW,CH,S=185,170,0.5
def frames(spec):
    n,_,ix=spec.partition(':');L=F[n];return [L[int(i)] for i in ix.split(',')] if ix else L
def cell(f):
    im=Image.new('RGBA',(CW,CH),(0,0,0,0));s=Image.open(os.path.join(ROOT,'assets',f['f']+'.png')).convert('RGBA')
    s=s.resize((max(1,int(s.width*S)),max(1,int(s.height*S))));im.paste(s,(int(CW/2-f['ax']*S),int(CH-8-f['ay']*S)),s);return im
rows=[a.split('|') for a in sys.argv[2:]];LW=170;GAP=60
maxold=max(len(frames(r[1])) for r in rows);maxnew=max(len(frames(r[2])) for r in rows)
W=LW+maxold*CW+GAP+maxnew*CW;H=40+len(rows)*CH
out=Image.new('RGB',(W,H),(40,44,56));d=ImageDraw.Draw(out)
d.text((LW+6,10),'BEFORE',fill=(255,170,170),font=FT);d.text((LW+maxold*CW+GAP+6,10),'AFTER (new in-between frames)',fill=(170,255,170),font=FT)
for i,(lab,o,n) in enumerate(rows):
    y=40+i*CH;d.rectangle([0,y,W,y+CH-2],fill=(58,64,80) if i%2 else (50,56,70))
    d.text((8,y+CH//2-20),lab,fill=(255,255,255),font=FT);fo,fn=frames(o),frames(n)
    d.text((8,y+CH//2+4),f'{len(fo)} -> {len(fn)} frames',fill=(200,210,230),font=FT)
    for j,f in enumerate(fo): c=cell(f);out.paste(c,(LW+j*CW,y),c)
    d.text((LW+maxold*CW+15,y+CH//2-12),'=>',fill=(255,220,120),font=FT)
    for j,f in enumerate(fn): c=cell(f);out.paste(c,(LW+maxold*CW+GAP+j*CW,y),c)
out.save(sys.argv[1]);print(sys.argv[1],out.size)
