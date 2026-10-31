"""v34: /workspace/rev34/overview.jpg - the Practice Room at a glance: dummy art (base, _R copies, fighter) next to Paddy's
guard for scale, then the in-game screenshots of every station. Usage: python3 src/overview_practice34.py [OUTDIR]"""
import json,os,sys
from PIL import Image,ImageDraw,ImageFont
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
OUT=sys.argv[1] if len(sys.argv)>1 else '/workspace/rev34/'
F=json.load(open('assets/frames.json'))
try: FT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26);FS=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',20)
except Exception: FT=FS=ImageFont.load_default()
W=4096;rows=[]
def strip(title,items,H=420):
    c=Image.new('RGB',(W,H+50),(42,36,78));d=ImageDraw.Draw(c);d.text((16,10),title,fill=(255,225,77),font=FT);x=20;base=H+30
    d.line([(0,base),(W,base)],fill=(90,80,130),width=2)
    for lab,key,idxs in items:
        for i in idxs:
            f=F[key][i];im=Image.open('assets/'+f['f']+'.png').convert('RGBA');c.paste(im,(x+60-f['ax'] if f['ax']<60 else x,base-f['ay']),im)
            x+=max(im.width,90)+14
        d.text((x-60,base+2),'',fill=(200,200,255),font=FS);x+=30
        if x>W-200: break
    return c
rows.append(strip('Sparring dummy (TEST art) at Paddy\'s factor 0.624 - Paddy guard / idle for scale, then idle, hit_light, hit_heavy, launched, launched_fall, knockdown, recover (faces LEFT)',
 [('paddy','k_ps_jab1',[0]),('idle','idle_test_1',[0]),('idle','sd_idle',[0,1]),('light','sd_hit_light',[0,1]),('heavy','sd_hit_heavy',[0,2]),('launch','sd_launched',[1,3,5]),('fall','sd_launched_fall',[0,1,2,3]),('down','sd_knockdown',[4,5]),('rec','sd_recover',[1,2,3])]))
rows.append(strip('Facing-RIGHT _R copies (the dummy BEHIND Paddy)  +  FIGHTER attacker: idle, wind-up (f4 = held tell), punch f1-f5 (f2-f3 hit window), recover, hit',
 [('r','sd_idle_r',[0]),('r','sd_hit_heavy_r',[0]),('r','sd_launched_fall_r',[1]),('r','sd_knockdown_r',[5]),('r','sd_recover_r',[2]),('fi','sd_fighter_idle',[0]),('fw','sd_fighter_attack_windup',[0,3]),('fp','sd_fighter_attack_punch',[0,1,2,3,4]),('fr','sd_fighter_attack_recover',[1]),('fh','sd_fighter_hit_heavy',[0])]))
shots=[('spar_wind','SPAR: wind-up tell (lean back, red glow, closing ring, !)'),('spar_punch','SPAR: punch lands = BONK (no hearts lost)'),('spar_blocked','SPAR: hold B = BLOCKED!'),('spar_counter','SPAR: hit back right after = COUNTER!'),
 ('spar_dodged','SPAR: dodge = DODGED!'),('turn_1','TURN: one in front, one behind (_R art)'),('turn_2','TURN: combo turned onto the dummy behind'),('launch_air','LAUNCH: launcher sends it flying'),
 ('launch_juggle','LAUNCH: air hits = JUGGLE xn'),('knockdown','LAUNCH: launched_fall 4 -> knockdown (+228px hand-off)'),('recover','LAUNCH: gets back up (never breaks)'),('title','Title: extra PRACTICE ROOM button (PLAY / PRACTICE unchanged)'),
 ('menu','Combo list: PRACTICE ROOM entry'),('iphone_844','iPhone 844x390 (TURN)'),('iphone_667','iPhone SE 667x375: bar shrinks to fit')]
cw,ch=1024,340
g=Image.new('RGB',(W,((len(shots)+3)//4)*(ch+40)),(20,16,40));d=ImageDraw.Draw(g)
for i,(n,lab) in enumerate(shots):
    p=OUT+n+'.png'
    if not os.path.exists(p): continue
    im=Image.open(p).convert('RGB');im=im.resize((cw,round(im.height*cw/im.width)));im=im.crop((0,0,cw,min(ch,im.height)))
    x,y=(i%4)*cw,(i//4)*(ch+40);g.paste(im,(x,y+40));d.text((x+10,y+8),lab,fill=(255,255,255),font=FS)
rows.append(g)
H=sum(r.height for r in rows);o=Image.new('RGB',(W,H));y=0
for r in rows:o.paste(r,(0,y));y+=r.height
o.save(OUT+'overview.jpg',quality=88);print(OUT+'overview.jpg',o.size)
