# v47 story (level.html, World 1-1) Paddy = the practice Paddy: punch string (k_ps_* / k_pw_* sheets), diamond D-pad, Kitti
# double-taps + CLAW follow-ups, dash strike chaining back into the punch string. iPhone landscape 844x390, touch + keyboard.
import asyncio,json,sys,os,time,itertools
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev47s/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:400]);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto(URL+f'level.html?level=silverdale_1&nocuts&touch&v={time.time()}');await pg.wait_for_function('window.LV&&LV.ready',timeout=30000);await pg.wait_for_timeout(1500)
  cdp=await ctx.new_cdp_session(pg)
  async def tdown(x,y):await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]})
  async def tup():await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  async def ttap(q,hold=70):await tdown(q[0],q[1]);await pg.wait_for_timeout(hold);await tup()
  R=await E("Object.fromEntries(['tu','tl','tr','td','tj','ta','tt','tm','tR'].map(i=>{const r=document.getElementById(i).getBoundingClientRect();return [i,[r.left+r.width/2,r.top+r.height/2,r.width/2,r.left,r.right,r.top,r.bottom]]}))")
  u,l,r_,d=R['tu'],R['tl'],R['tr'],R['td']
  dia=u[1]<l[1]-20 and abs(l[1]-r_[1])<2 and d[1]>l[1]+20 and abs(u[0]-d[0])<2 and l[0]<u[0]<r_[0]
  sep=all(((a[0]-b[0])**2+(a[1]-b[1])**2)**.5>=a[2]+b[2] for a,b in itertools.combinations(list(R.values()),2))
  ins=all(q[3]>=0 and q[5]>=0 and q[4]<=844 and q[6]<=390 for q in R.values())
  check('story D-pad is a diamond, no buttons overlap, all on screen',dia and sep and ins,{k:[round(v) for v in R[k][:3]] for k in R})
  async def reset(col=30,enemy=None):
   await E("LV.calm();LV.teleport(%d,8);const p=LV.p;p.face=1;p.inv=0;p.mv=null;p.seq='';p.kpUsed=false;p.dtEnd=null;LV.dt.last={};LV.dt.req=null;LV.dt.log.length=0;LV.log.length=0;"%col+
     ("LV.enemies().length=0;" if enemy else ""))
   await pg.wait_for_timeout(500)
   if enemy:
    await E("dx=>{const p=LV.p;const e=LV.mkEnemy('rat',p.x+dx,p.y,{});e.vx=0;e.x0=e.x-1;e.x1=e.x+1;e.hp=99;LV.enemies().push(e);window._E=e}",enemy);await pg.wait_for_timeout(100)
  async def key(k,hold=60):await pg.keyboard.down(k);await pg.wait_for_timeout(hold);await pg.keyboard.up(k)
  async def dkey(k,gap=90):await key(k);await pg.wait_for_timeout(gap);await key(k)
  mv=lambda: E("LV.log.filter(s=>s.startsWith('move:')).map(s=>s.slice(5))")
  dl=lambda: E("LV.dt.log.slice()")
  # ---- punch string = practice ----
  await reset();fr=set()
  for i in range(5):
   await key('KeyX');
   for j in range(4):fr.add((await E('LV.pFrame')).split(':')[0]);await pg.wait_for_timeout(45)
   await pg.wait_for_timeout(60)
  await pg.wait_for_timeout(400);m=await mv()
  check('CLAW x5 = JAB · CROSS · LEFT HOOK · BODY SHOT · UPPERCUT on the practice punch sheets',m==['claw1','claw2','claw3','claw4','claw5'] and {'k_ps_jab1','k_ps_cross'}<=fr,[m,sorted(fr)])
  await reset();await pg.keyboard.down('ArrowDown');await key('KeyX');await pg.keyboard.up('ArrowDown');await pg.wait_for_timeout(400);m=await mv();check('↓ + CLAW = BODY SHOT',m==['body'],m)
  await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'story_idle_diamond.png')
  # ---- no false triggers ----
  await reset();await key('ArrowRight');await pg.wait_for_timeout(450);await key('ArrowRight');await pg.wait_for_timeout(300);await key('ArrowRight',500);await pg.wait_for_timeout(40);await key('ArrowRight');await pg.wait_for_timeout(300)
  await key('ArrowUp');await pg.wait_for_timeout(900);await key('ArrowDown');await pg.wait_for_timeout(500)
  check('single taps / slow taps / hold-then-tap = no double-tap moves',await dl()==[],await dl())
  # ---- each double-tap + follow-up ----
  for nm,k,want,fu,dx in [('◀◀ (away)','ArrowLeft','dodge','counter',130),('▶▶','ArrowRight','dash','dstrike',320),('▲▲','ArrowUp','pounce','plaunch',260),('▼▼','ArrowDown','slide','sweep',280)]:
   await reset(enemy=dx);hp0=await E("_E.hp");f0=await E("LV.p.face")
   await dkey(k);await pg.wait_for_timeout(30 if k!='ArrowUp' else 120);st=await dl();face=await E("LV.p.face")
   await key('KeyX');await pg.wait_for_timeout(120);await pg.screenshot(path=OUT+f'story_{fu}.png');await pg.wait_for_timeout(500)
   m=await mv();hp1=await E("_E.hp")
   check(f'story {nm} = {want}, + CLAW = {fu} (hits)',want in m and fu in m and hp1<hp0 and (k!='ArrowLeft' or face==f0),[st,m,hp0,hp1,face])
   await pg.wait_for_timeout(800)
  # ---- dash strike carries the punch string on ----
  await reset(enemy=150);await key('KeyX');await pg.wait_for_timeout(220);await key('KeyX');await pg.wait_for_timeout(220);await dkey('ArrowRight');await pg.wait_for_timeout(40);await key('KeyX');await pg.wait_for_timeout(330);await key('KeyX');await pg.wait_for_timeout(500)
  m=await mv();check('JAB, CROSS, ▶▶ + CLAW (dash strike), CLAW = BODY SHOT (string number carries on)',m==['claw1','claw2','dash','dstrike','claw4'],m)
  # ---- touch ----
  for nm,q,want,fu in [('▶▶',r_,'dash','dstrike'),('◀◀',l,'dodge','counter'),('▲▲',u,'pounce','plaunch'),('▼▼',d,'slide','sweep')]:
   await reset(enemy=200);await ttap(q);await pg.wait_for_timeout(90);await ttap(q);await pg.wait_for_timeout(60 if nm!='▲▲' else 140)
   if nm=='▲▲':await pg.screenshot(path=OUT+'story_touch_pounce.png')
   await ttap(R['ta']);await pg.wait_for_timeout(500);m=await mv()
   check(f'story touch {nm} = {want} + CLAW = {fu}',want in m and fu in m,[m,await dl()])
   await pg.wait_for_timeout(700)
  await reset();await ttap(u);await pg.wait_for_timeout(120);j=await E("!LV.p.ground");await pg.wait_for_timeout(900);check('story touch ▲ single tap = jump, no pounce',j and await dl()==[],await dl())
  # ---- sizes: punch frames drawn at the same scale as in practice (SC) ----
  check('no page errors',not errs,errs[:5])
  await br.close()
 print('FAILS:',FAILS)
asyncio.run(main())
