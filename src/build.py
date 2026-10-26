import numpy as np, json, os
from PIL import Image
R=lambda n: Image.open(f'raw/{n}.png')
def bbox_cat(im):
    a=np.asarray(im).astype(int); al=a[...,3]>128
    cat=al&~((a[...,2]>a[...,0]+25))  # exclude blue fx
    ys,xs=np.nonzero(cat); return ys,xs
TH=150
h=lambda n:(lambda ys,xs: ys.max()-ys.min())(*bbox_cat(R(n)))
w=lambda n:(lambda ys,xs: xs.max()-xs.min())(*bbox_cat(R(n)))
sc={'s1':TH/h('s1_05'),'s2':TH/h('s2_00'),'s3':TH/h('s3_00')}
sc['s4']=sc['s1']*w('s1_08')/w('s4_00')*0.95; sc['s5']=sc['s4']
print(sc)
FLIP={'s1_00','s1_01','s1_02','s1_03','s1_04','s1_11','s2_09','s2_10','s2_11','s3_12'}
anims={
 'idle':['s1_05','s1_05','s1_06','s1_06'],
 'walk':['s1_07','s1_08','s1_09','s1_10','s1_12','s1_13','s1_14','s1_16'],
 'run':['s1_19','s1_21','s1_22','s1_23'],
 'jump':['s4_01','s1_20'],'fall':['s4_03'],'land':['s4_02'],
 'crouch':['s4_00'],'lie':['s1_04'],
 'claw1':['s2_05'],'claw2':['s3_04'],'claw3':['s3_06','s3_07'],
 'charge':['s2_14'],'blast':['s2_15'],'hurt':['s2_11'],'roar':['s2_12'],
 'climb':['s5_00','s5_01','s5_02','s5_03'],'dash':['s3_15'],'projectile':['s3_08'],
}
os.makedirs('../assets',exist_ok=True); out={}; done={}
for an,fr in anims.items():
    out[an]=[]
    for n in fr:
        if n not in done:
            im=R(n); s=sc[n[:2]]
            im=im.resize((max(1,round(im.width*s)),max(1,round(im.height*s))),Image.LANCZOS)
            if n in FLIP: im=im.transpose(Image.FLIP_LEFT_RIGHT)
            bb=im.getbbox(); im=im.crop(bb)
            ys,xs=bbox_cat(im)
            if an=='projectile': ax,ay=im.width/2,im.height/2
            else: ax=float(np.median(xs)); ay=float(ys.max())
            im.save(f'../assets/{n}.png'); done[n]=dict(f=n,ax=round(ax),ay=round(ay),w=im.width,h=im.height)
        out[an].append(done[n])
json.dump(out,open('../assets/frames.json','w'),indent=0)
# preview strip
for an,fr in out.items():
    pass
c=Image.new('RGB',(1600,1000),(120,170,220));x=10;y=0
from PIL import ImageDraw;d=ImageDraw.Draw(c)
for n,f in done.items():
    im=Image.open(f'../assets/{n}.png')
    if x+im.width>1600: x=10;y+=240
    d.line((x,y+200,x+im.width,y+200),fill=(0,0,0)); c.paste(im,(x+0,y+200-f['ay']),im); d.line((x+f['ax'],y+60,x+f['ax'],y+205),fill=(255,0,0)); d.text((x,y+205),n,fill=0); x+=im.width+10
c.save('prev3.png')
