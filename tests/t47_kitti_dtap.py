# v47 KITTI PADDY: diamond D-pad (▲ / ◀ ▶ / ▼) + double-tap moves (dodge / dash / sky pounce / cat slide) and their + Claw
# follow-ups (counter slash / dash strike / pounce launcher / slide sweep), dash strike continuing the punch combo.
# iPhone landscape 844x390, touch + keyboard. Usage: python3 tests/t47_kitti_dtap.py [URL] [OUT]
import asyncio,time,os,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev47/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,info);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(URL+'?practice=launch&v='+str(time.time()));await pg.wait_for_function('window.PRACTICE&&PRACTICE.on&&window.KD47',timeout=40000);E=pg.evaluate
  await pg.wait_for_timeout(2500)
  cdp=await ctx.new_cdp_session(pg)
  async def tdown(x,y,i=1):await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':i}]})
  async def tmove(x,y,i=1):await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y,'id':i}]})
  async def tup():await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  async def ttap(x,y,hold=70):await tdown(x,y);await pg.wait_for_timeout(hold);await tup()
  # ---- 1. diamond layout ----
  R=await E("Object.fromEntries(['up','left','right','down','attack','jump'].map(k=>{const r=document.querySelector(`#ui .b[data-k=${k}]`).getBoundingClientRect();return [k,[r.left+r.width/2,r.top+r.height/2,r.width/2,r.left,r.right,r.top,r.bottom]]}))")
  u,l,r_,d=R['up'],R['left'],R['right'],R['down']
  dia=u[1]<l[1]-20 and abs(l[1]-r_[1])<2 and d[1]>l[1]+20 and abs(u[0]-d[0])<2 and l[0]<u[0]<r_[0]
  import itertools
  sep=all(((a[0]-b[0])**2+(a[1]-b[1])**2)**.5>a[2]+b[2]+2 for a,b in itertools.combinations([u,l,r_,d],2))
  inside=all(q[3]>=0 and q[5]>=0 and q[4]<=844 and q[6]<=390 for q in [u,l,r_,d])
  check('D-pad is a diamond (▲ top, ◀ ▶ middle, ▼ bottom), buttons apart and on screen',dia and sep and inside,{k:[round(v) for v in R[k][:3]] for k in R})
  txt=await E("['up','left','right','down'].map(k=>document.querySelector(`#ui .b[data-k=${k}]`).textContent)");check('arrow labels',txt==['▲','◀','▶','▼'],txt)
  async def reset(x=None):
   await E("p.state='normal';p.t=0;p.vx=0;p.vy=0;p.y=GROUND;p.ground=true;p.wall=false;p.face=1;p.combo=0;p.inv=0;p.kdCool=0;p.dashCool=0;p.kpUsed=false;KD47.req=null;KD47.fu=null;KD47.last={};C.n=0;C.t=0;KD47.seen.clear();"+
     "const d=PRACTICE.dummies()[0];d.x=d.home;d.y=GROUND;d.vx=d.vy=0;d.fl=0;d.ps='idle';d.pt=0;d.st='idle';d.i=0;d.alive=true;d.h=165;p.x=d.x-%s"%(x or 260))
   await pg.wait_for_timeout(350)
  async def key(k,hold=60):await pg.keyboard.down(k);await pg.wait_for_timeout(hold);await pg.keyboard.up(k)
  async def dkey(k,gap=90):await key(k);await pg.wait_for_timeout(gap);await key(k)
  async def seen(js,ms=900):
   import re
   m=re.fullmatch(r"p\.state==='(\w+)'",js)
   if m:
    try:await pg.wait_for_function(f"KD47.seen.has('{m.group(1)}')",timeout=ms,polling='raf');return True
    except Exception:return False
   try:await pg.wait_for_function(js,timeout=ms,polling='raf');return True
   except Exception:return False
  N=lambda: E("Object.assign({},KD47.n)")
  # ---- 2. touch: each arrow works ----
  await reset()
  for k,q in [('left',l),('right',r_),('down',d)]:
   # v48: a back press only turns / walks once held 0.15 s (a quick tap = slip), so hold 0.22 s here
   await tdown(q[0],q[1]);await pg.wait_for_timeout(220);v=await E(f"[!!K.{k},document.querySelector('#ui .b[data-k={k}]').classList.contains('on')]");await tup();await pg.wait_for_timeout(450)
   check(f'touch {k} arrow presses {k}',v==[True,True],v)
  await reset();await tdown(u[0],u[1]);await pg.wait_for_timeout(100);v=await E("[!!K.up,document.querySelector('#ui .b[data-k=up]').classList.contains('on')]");await tup();ok=await seen("!p.ground&&p.vy<0",700);check('touch ▲ = up (tap = jump, like ↑ on the keyboard)',ok and v==[True,True],v);await pg.wait_for_timeout(900)
  # slide across the pad ◀ -> ▼ -> ◀ quickly: never a double-tap
  await reset();n0=await N();await tdown(l[0],l[1]);await pg.wait_for_timeout(60);await tmove(d[0],d[1]);await pg.wait_for_timeout(60);await tmove(l[0],l[1]);await pg.wait_for_timeout(60);await tmove(d[0],d[1]);await pg.wait_for_timeout(60);await tup();await pg.wait_for_timeout(300)
  n1=await N();check('sliding the thumb ◀→▼→◀→▼ never fires a double-tap move',n1==n0,[n0,n1,await E("p.state")])
  # ---- 3. no false triggers (keyboard) ----
  await reset();await key('ArrowRight');await pg.wait_for_timeout(500);check('single tap → = no dash',(await N())['dash']==0 and await E("p.state")!='dash')
  await reset();await key('ArrowRight',600);await pg.wait_for_timeout(60);await key('ArrowRight');await pg.wait_for_timeout(400);check('hold → then tap → = no dash',(await N())['dash']==0,await N())
  await reset();await key('ArrowRight');await pg.wait_for_timeout(420);await key('ArrowRight');await pg.wait_for_timeout(400);check('two slow taps → = no dash',(await N())['dash']==0)
  await reset();await key('ArrowLeft');await pg.wait_for_timeout(500);check('single tap ← = no dodge (v48: a quick tap is the SLIP and keeps facing right)',(await N())['dodge']==0 and await E("p.face")==1)
  await reset();await key('ArrowUp');ok=await seen("!p.ground",600);await pg.wait_for_timeout(700);check('single tap ↑ = normal jump, no pounce',ok and (await N())['pounce']==0)
  await reset();await key('ArrowDown');await pg.wait_for_timeout(400);check('single tap ↓ = crouch, no slide',(await N())['slide']==0)
  await reset();await key('ArrowDown',700);await pg.wait_for_timeout(50);await key('ArrowDown');await pg.wait_for_timeout(300);check('hold ↓ then tap ↓ = no slide',(await N())['slide']==0)
  await reset();await key('ArrowLeft',600);await pg.wait_for_timeout(50);await key('ArrowLeft');await pg.wait_for_timeout(300);check('hold ← then tap ← = no dodge',(await N())['dodge']==0)
  # ---- 4. double-tap moves (keyboard) ----
  await reset();await dkey('ArrowRight');ok=await seen("p.state==='dash'");check('→ → = DASH (forward)',ok and await E("p.face")==1)
  await reset();x0=await E("p.x");await dkey('ArrowLeft');ok=await seen("p.state==='kdodge'");v=await E("[p.face,p.vx<0,p.inv>0]");check('← ← (facing right) = DODGE backstep, still facing right, invulnerable',ok and v==[1,True,True],v)
  await pg.wait_for_timeout(500);check('dodge moved him back',await E("p.x")<x0-40,[x0,await E("p.x")])
  await reset();await dkey('ArrowUp');ok=await seen("p.state==='kpounce'");check('↑ ↑ = SKY POUNCE',ok);await pg.wait_for_timeout(1500)
  await reset();await dkey('ArrowDown');ok=await seen("p.state==='kslide'");check('↓ ↓ = CAT SLIDE',ok);await pg.wait_for_timeout(700)
  await reset();await dkey('KeyD');ok=await seen("p.state==='dash'");check('D D (WASD) = dash',ok);await pg.wait_for_timeout(600)
  await reset();await dkey('KeyW');ok=await seen("p.state==='kpounce'");check('W W = pounce',ok);await pg.wait_for_timeout(1500)
  # ---- 5. + Claw follow-ups (keyboard), each must hit the dummy ----
  async def follow(keys,wantState,shot,x=200,gap=40):
   await reset(x);c0=await E("PRACTICE.s.hits");await dkey(keys);await pg.wait_for_timeout(gap);await key('x')
   ok=await seen(f"p.state==='{wantState}'",900)
   if shot:await pg.wait_for_timeout(120);await pg.screenshot(path=OUT+shot)
   await pg.wait_for_timeout(500);c1=await E("PRACTICE.s.hits");return ok,c1-c0
  ok,h=await follow('ArrowLeft','kcounter','kb_counter.png',x=200);check('← ← + Claw = COUNTER SLASH, hits',ok and h>=1,h);await pg.wait_for_timeout(600)
  ok,h=await follow('ArrowRight','dashstrike','kb_dashstrike.png',x=330,gap=60);check('→ → + Claw = DASH STRIKE, hits',ok and h>=1,h);await pg.wait_for_timeout(600)
  ok,h=await follow('ArrowUp','kpl','kb_launcher.png',x=230,gap=120);check('↑ ↑ + Claw = POUNCE LAUNCHER, hits + launches',ok and h>=1,h);await pg.wait_for_timeout(1500)
  ok,h=await follow('ArrowDown','ksweep','kb_sweep.png',x=260,gap=60);check('↓ ↓ + Claw = SLIDE SWEEP, hits',ok and h>=1,h);await pg.wait_for_timeout(900)
  # ---- 6. dash + Claw continues the punch combo ----
  await reset(175);await key('x');await pg.wait_for_timeout(330);await key('x');await pg.wait_for_timeout(330)
  a=await E("[p.state,p.combo,C.n]")
  await E("const d=PRACTICE.dummies()[0];d.x=p.x+190;d.vx=0;KD47.seen.clear()")
  await dkey('ArrowRight',70);ok=await seen("p.state==='dashstrike'",800);b=await E("[p.state,p.combo,C.n]")
  await pg.wait_for_timeout(120);await E("KD47.seen.clear()");await key('x');ok2=await seen("p.state==='claw'",900);await pg.wait_for_timeout(200);c=await E("[p.state,p.combo,C.n,p.anim]")
  await pg.screenshot(path=OUT+'kb_dash_combo.png')
  await pg.wait_for_timeout(330);await key('x');await pg.wait_for_timeout(450);d2=await E("[p.state,p.combo,C.n,p.anim]")
  check('punch, punch → dash strike (combo number +1, hit counter keeps going) → Claw = back into the punch string',ok and ok2 and b[1]==a[1]+1 and c[1]==b[1]+1 and c[3].startswith('bx') and d2[2]>b[2]>a[2]>=1,[a,b,c,d2])
  # ---- 7. touch double-taps + follow-ups ----
  async def tdbl(q,gap=90):await ttap(q[0],q[1]);await pg.wait_for_timeout(gap);await ttap(q[0],q[1])
  cl=R['attack']
  for nm,q,st,fu,x in [('▶ ▶',r_,'dash','dashstrike',330),('◀ ◀',l,'kdodge','kcounter',150),('▲ ▲',u,'kpounce','kpl',230),('▼ ▼',d,'kslide','ksweep',260)]:
   await reset(x);await tdbl(q);ok=await seen(f"p.state==='{st}'",700)
   if st=='kdodge':await pg.wait_for_timeout(40);await pg.screenshot(path=OUT+'touch_dodge.png')
   if st=='kpounce':await pg.wait_for_timeout(150);await pg.screenshot(path=OUT+'touch_pounce.png')
   await ttap(cl[0],cl[1]);ok2=await seen(f"p.state==='{fu}'",900)
   if fu=='ksweep':await pg.wait_for_timeout(40);await pg.screenshot(path=OUT+'touch_sweep.png')
   check(f'touch {nm} = {st}, + Claw = {fu}',ok and ok2,[ok,ok2,await E('KD47.log.slice(-4)'),await E('KD47.gaps.slice(-3)'),await E('[...KD47.seen]')]);await pg.wait_for_timeout(1400)
  # touch single taps: no moves
  await reset();n0=await N();await ttap(r_[0],r_[1]);await pg.wait_for_timeout(450);await ttap(r_[0],r_[1]);await pg.wait_for_timeout(450);await ttap(d[0],d[1]);await pg.wait_for_timeout(450);await ttap(l[0],l[1],350);await pg.wait_for_timeout(60);await ttap(l[0],l[1]);await pg.wait_for_timeout(400)
  check('touch: slow taps / a long press then a tap = no double-tap move',await N()==n0,[n0,await N()])
  # ---- 8. diamond screenshot (idle, steady face) + other forms untouched ----
  await reset();await pg.wait_for_timeout(1200);await pg.screenshot(path=OUT+'diamond_idle.png')
  idle=await E("[p.anim,FR.idle.map(f=>f.f)]");check('idle still uses the steady-face frames',idle[0]=='idle' and idle[1]==['p/idle_test_1_00','p/idle_test_1_01','p/idle_test_1_04','p/idle_test_1_01'],idle)
  await E("setForm(1)");await pg.wait_for_timeout(1500);await reset();n0=await N();await dkey('ArrowLeft');await pg.wait_for_timeout(300);await dkey('ArrowUp');await pg.wait_for_timeout(900)
  check('Ninja form: no Kitti double-tap moves (other forms unchanged)',await N()==n0 and FORM()==1 if False else (await N())==n0 and await E("FORM()")==1,await N())
  await E("setForm(0)");await pg.wait_for_timeout(800)
  # ---- 9. each practice station still runs ----
  for st in ['spar','turn','launch']:
   await E(f"PRACTICE.station('{st}')");await pg.wait_for_timeout(700);await key('x');await pg.wait_for_timeout(350);await key('x');await pg.wait_for_timeout(900)
   check(f'practice {st} still runs',await E("PRACTICE.on&&PRACTICE.dummies().length>0"))
  await E("PRACTICE.station('spar')");await pg.wait_for_timeout(500);await E("p.x=PRACTICE.dummies()[0].x-150;p.face=1")
  try:await pg.wait_for_function("PRACTICE.dummies()[0].ps==='wind'&&PRACTICE.dummies()[0].pt>.55",timeout=9000,polling='raf')
  except Exception:pass
  s0=await E("PRACTICE.s.dodged");await dkey('ArrowLeft',70);await pg.wait_for_timeout(1300);s1=await E("PRACTICE.s.dodged")
  check('SPAR: ← ← dodge counts as DODGED (or auto-counter)',s1>s0 or await E("PRACTICE.s.counter")>0,[s0,s1])
  check('no page errors',not errs,errs[:5])
  await br.close()
 print('FAILS:',FAILS)
asyncio.run(main())
