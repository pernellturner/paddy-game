"""Form review sheet: python3 src/overview_form.py <prefix e.g. kt_> <out dir> <title>
Top: base Paddy's idle beside the middle frame of every <prefix> anim, at frame px on one baseline; orange line = base standing height
(340 px at TARGET=199 x game factor). Bottom: the in-game screenshots in <out dir> (*.png) as a grid."""
import sys,os,json,glob,numpy as np
from PIL import Image,ImageDraw
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
PRE,OUT,TITLE=sys.argv[1],sys.argv[2],sys.argv[3]
F=json.load(open('assets/frames.json'))
def cat(a):r,g,b,al=[a[...,i].astype(int) for i in range(4)];return (al>200)&(((r-b)>18)|((r<110)&(r>b)))
GS=np.sqrt(cat(np.asarray(Image.open('assets/p/idle_test_1_00.png').convert('RGBA'))).sum())/199;BH=340*GS
items=[('base idle','p/idle_test_1_00',None)]
for k in [k for k in F if k.startswith(PRE)]:
  L=F[k];e=next((x for x in L if x.get('hit')==1),L[len(L)//2]);items.append((k[len(PRE):],e['f'],e))
ims=[Image.open('assets/'+f+'.png').convert('RGBA') for _,f,_ in items]
W=sum(i.width+16 for i in ims)+40;H=max(i.height for i in ims)+120;base=H-50
top=Image.new('RGB',(W,H),(36,40,56));d=ImageDraw.Draw(top);x=20
for (nm,f,e),im in zip(items,ims):
  ay=e['ay'] if e else im.height;top.paste(im,(x,int(base-ay)),im);d.text((x,base+12),nm,fill=(255,255,255));x+=im.width+16
d.line([(0,base),(W,base)],fill=(200,200,200));d.line([(0,base-BH),(W,base-BH)],fill=(255,150,40),width=2)
d.text((10,8),f'{TITLE}: base idle + every move (impact frame), frame px, one baseline. Orange = base standing height {BH:.0f} px',fill=(255,224,138))
shots=[s for s in sorted(glob.glob(OUT+'/*.png')) if 'overview' not in s][:24]
cw=W//6 if W>=1800 else 300;tiles=[]
for s in shots:
  im=Image.open(s).convert('RGB');im.thumbnail((cw-6,10**4));tiles.append((os.path.basename(s),im))
th=max([t[1].height for t in tiles]+[1])+18;rows=(len(tiles)+5)//6
bot=Image.new('RGB',(max(W,cw*6),rows*th),(20,22,30));db=ImageDraw.Draw(bot)
for i,(nm,im) in enumerate(tiles):
  bx,by=(i%6)*cw,(i//6)*th;bot.paste(im,(bx+3,by+16));db.text((bx+4,by+2),nm,fill=(255,255,255))
out=Image.new('RGB',(max(W,bot.width),H+bot.height),(20,22,30));out.paste(top,(0,0));out.paste(bot,(0,H))
if out.width>3000:out=out.resize((3000,int(out.height*3000/out.width)))
out.save(OUT+'/overview.jpg',quality=85);print(OUT+'/overview.jpg',out.size)
