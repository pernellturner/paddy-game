import json
from PIL import Image,ImageDraw,ImageFont
F=json.load(open('assets/frames.json'))
fb=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22);fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
def img(k,i):f=F[k][i];return Image.open('assets/'+f['f']+'.png').convert('RGBA'),f
def row(title,items,base,gap=14):
  ims=[(*img(k,i),l) for k,i,l in items];W=sum(max(im.width,100)+gap for im,_,_ in ims)+gap
  S=Image.new('RGB',(W,base+70),(58,58,78));d=ImageDraw.Draw(S);d.text((10,6),title,font=fb,fill='white');x=gap;gy=base+36
  for im,f,l in ims:S.paste(im,(x,gy-f['ay']),im);d.text((x,gy+6),l,font=fs,fill='white');x+=max(im.width,100)+gap
  d.line([(0,gy),(W,gy)],fill=(120,120,150));return S
R1=row('1. Idle Paddy vs the new approved punches (same in-game scale, no recolour)',[('idle_test_1',0,'idle'),('k_ps_jab1',0,'guard'),('k_ps_jab1',3,'1 jab'),('k_ps_jab2',3,"1' jab"),('k_ps_cross',3,'2 cross'),('k_ps_lhook',3,'3 left hook'),('k_ps_rbody',3,'4 body shot')],300)
R2=row('   8-hit power build: power body / jab / hook, power uppercut, and the recovery to upright',[('idle_test_1',0,'idle'),('k_pw_body',4,'power body'),('k_pw_jab',4,'power jab'),('k_pw_hook',4,'power hook'),('k_pw_upper',4,'uppercut'),('k_ps_rec',2,'recover (upright)')],300)
seq=[('k_ps_jab1',i) for i in range(6)]+[('k_ps_cross',i) for i in range(1,6)]+[('k_ps_lhook',i) for i in range(1,6)]+[('k_ps_rbody',i) for i in range(1,7)]+[('k_ps_rec',i) for i in (1,2)]
N=len(seq);sc=.5;cw=150;W=cw*N+20;H=200;S=Image.new('RGB',(W,H+60),(58,58,78));d=ImageDraw.Draw(S);d.text((10,6),'2. Sample string 1-2-3-4 as played (12 fps, every frame; cancels skip the shared guard, ends with the recovery; gold = impact frames)',font=fb,fill='white')
gy=H+20
for n,(k,i) in enumerate(seq):
  im,f=img(k,i);im=im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS);x=10+n*cw+40
  S.paste(im,(x-int(f['ax']*sc),gy-int(f['ay']*sc)),im);d.text((x-30,gy+8),k.split('_')[-1]+f' f{i+1}',font=fs,fill=(255,210,90) if i in (3,4) and 'rec' not in k else 'white')
d.line([(0,gy),(W,gy)],fill=(120,120,150))
shots=['s1234_1.png','s1234_2.png','s1234_3.png','s1234_4.png']
G=[Image.open('/workspace/rev33/'+s).convert('RGB') for s in shots];G=[g.resize((g.width//2,g.height//2)) for g in G]
gw=sum(g.width for g in G)+10*len(G);R4=Image.new('RGB',(gw,G[0].height+36),(58,58,78));d=ImageDraw.Draw(R4);d.text((10,6),'3. In game (1024x340, iPhone touch layout): 1-2-3-4 on the beat = jab, cross, left hook, POWER BODY',font=fb,fill='white');x=0
for g in G:R4.paste(g,(x,34));x+=g.width+10
rows=[R1,R2,S,R4];Wm=max(r.width for r in rows)
O=Image.new('RGB',(Wm,sum(r.height for r in rows)),(58,58,78));y=0
for r in rows:O.paste(r,(0,y));y+=r.height
O.save('/workspace/rev33/compare.jpg',quality=88);print(O.size)
