"""Preview strip: python3 src/strip.py OUT.png sheet[:idx,idx] ...  (one row per arg, frames aligned on their anchors)"""
import json,sys,os
from PIL import Image,ImageDraw
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
F=json.load(open(os.path.join(ROOT,'assets/frames.json')))
def row(spec):
    name,_,ix=spec.partition(':'); L=F[name]; L=[L[int(i)] for i in ix.split(',')] if ix else L
    cw=max(260,max(f['w'] for f in L)+20); ch=300; im=Image.new('RGB',(cw*len(L),ch+22),(70,78,96)); d=ImageDraw.Draw(im)
    for i,f in enumerate(L):
        s=Image.open(os.path.join(ROOT,'assets',f['f']+'.png')).convert('RGBA'); x=i*cw+cw//2-f['ax']; y=ch-10-f['ay']
        im.paste(s,(x,y),s); d.line([(i*cw+5,ch-10),(i*cw+cw-5,ch-10)],fill=(150,160,180)); d.line([(i*cw,0),(i*cw,ch+22)],fill=(40,44,56),width=2)
    d.text((6,ch+6),spec,fill=(255,255,255)); return im
if __name__=='__main__':
    rows=[row(s) for s in sys.argv[2:]]; W=max(r.width for r in rows); out=Image.new('RGB',(W,sum(r.height for r in rows)),(40,44,56)); y=0
    for r in rows: out.paste(r,(0,y)); y+=r.height
    out.save(sys.argv[1]); print(sys.argv[1],out.size)
