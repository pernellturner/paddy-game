# v34 PRACTICE ROOM: entry (title / combo list / deep link / touch), SPAR (wind-up, punch, DODGED / BLOCKED / COUNTER, armour),
# TURN (front + back dummy, turning combos), LAUNCH (launch, juggle counter, knockdown -> recover), never-dies, counters + reset,
# facing-right mirroring + swap hook, any form, keyboard + touch, exit. Screenshots (1024x340) -> OUT.
import asyncio,time,os,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev34/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,info);(None if ok else FAILS.append(nm))
D0="PRACTICE.dummies()[0]"
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},device_scale_factor=2,has_touch=True,is_mobile=True)
  # ---- title -> PRACTICE (touch tap) ----
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(URL+'?story&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started&&window.STORY&&STORY.mode==="title"',timeout=30000);E=pg.evaluate
  await pg.wait_for_timeout(1500);await pg.screenshot(path=OUT+'title.png')
  lab=await E("[document.getElementById('sprac').textContent,document.getElementById('sproom').textContent]");b=await pg.locator('#sproom').bounding_box()
  await pg.touchscreen.tap(b['x']+b['width']/2,b['y']+b['height']/2);await pg.wait_for_timeout(2500)
  r=await E("[PRACTICE.on,document.body.classList.contains('proom'),PRACTICE.st,PRACTICE.dummies().length,STORY.mode]")
  check('title PRACTICE ROOM button (touch) opens the Practice Room (PLAY / PRACTICE unchanged)',r[0] and r[1] and r[3]==1,[lab,r])
  # ---- exit -> title, then combo list entry ----
  b=await pg.locator('#prexit').bounding_box();await pg.touchscreen.tap(b['x']+b['width']/2,b['y']+b['height']/2);await pg.wait_for_timeout(800)
  r=await E("[PRACTICE.on,PRACTICE.dummies().length,STORY.mode,dummies.find(d=>!d.cr&&!d.sp).benched]");check('✕ exits to the title, dummies cleared, Bruno back',not r[0] and r[1]==0 and r[2]=='title' and not r[3],r)
  await pg.close()
  pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started&&F&&F.sd_idle',timeout=30000);E=pg.evaluate
  await pg.wait_for_timeout(1500)
  await E("ov(true)");await pg.wait_for_timeout(500);await pg.screenshot(path=OUT+'menu.png')
  await pg.click('#mprac');await pg.wait_for_timeout(2500)
  check('combo list has the PRACTICE ROOM button and it opens the room',await E("PRACTICE.on&&!document.body.classList.contains('ov')&&PRACTICE.st==='spar'"))
  await pg.wait_for_timeout(1500)
  ld=await E("Object.keys(F).filter(k=>k.startsWith('sd_')).map(k=>[k,F[k].length,F[k].every(f=>imgOK(IMG[f.f]))])")
  want=['sd_idle','sd_hit_light','sd_hit_heavy','sd_launched','sd_launched_fall','sd_knockdown','sd_recover','sd_fighter_idle','sd_fighter_attack_windup','sd_fighter_attack_punch','sd_fighter_attack_recover','sd_fighter_hit_heavy']
  have={k:(n,ok) for k,n,ok in ld}
  check('all dummy sheets present + preloaded (base, _R copies, fighter, launched_fall) - no missing frames',all(k in have and have[k][1] for k in want) and all(k[:-2] in have for k in have if k.endswith('_r')) and all(ok for _,_,ok in ld) and sum(1 for k in have if k.endswith('_r'))==7,ld)
  # ---- SPAR ----
  async def wind_at(t):
   await pg.wait_for_function(f"{D0}.ps==='wind'&&{D0}.pt>={t}",timeout=9000,polling='raf')
  async def after_strike():
   await pg.wait_for_function(f"{D0}.ps==='arec'||{D0}.ps==='idle'",timeout=4000,polling='raf');await pg.wait_for_timeout(100)
  S=lambda: E("Object.assign({},PRACTICE.s)")
  await E("p.x="+D0+".x-130;p.face=1")
  await wind_at(.12)
  # armour: claw during the wind-up does not stop it
  await pg.keyboard.press('x')
  try:await pg.wait_for_function("PRACTICE.s.hits>=1",timeout=700,polling='raf')
  except Exception:pass
  r=await E(f"[{D0}.ps,PRACTICE.s.hits]");check('wind-up is armoured (hit lands, attack still comes)',r[0] in('wind','punch') and r[1]>=1,r)
  await pg.wait_for_timeout(1800);await E("p.x="+D0+".x-130;p.face=1;p.state='normal'");await wind_at(.7);await pg.screenshot(path=OUT+'spar_wind.png')
  r=await E(f"[{D0}.ps,!!{D0}.bub&&{D0}.bub.t,{D0}.k,{D0}.i]");check('fighter winds up (windup sheet, held f4) with a "!" telegraph',r==['wind','!','sd_fighter_attack_windup',3],r)
  await pg.wait_for_function(f"{D0}.ps==='punch'&&{D0}.i==2",timeout=3000,polling='raf');await pg.screenshot(path=OUT+'spar_punch.png')
  hp0=await E("p.hp");await after_strike();r=await E("[p.state,p.hp,PRACTICE.s.dodged,PRACTICE.s.blocked]")
  check('standing still = BONK (hurt) but no hearts or lives lost',r[0]=='hurt' and r[1]>=hp0,[hp0,r])
  # BLOCK (base form): hold B from early in the wind-up, then hit back = COUNTER
  await pg.wait_for_timeout(1300);await E("p.x="+D0+".x-130;p.face=1")
  await wind_at(.3);await pg.keyboard.down('b');await pg.wait_for_function(f"{D0}.ps==='arec'",timeout=4000,polling='raf');await pg.screenshot(path=OUT+'spar_blocked.png')
  await pg.keyboard.up('b');s=await S();check('hold B through the punch = BLOCKED!',s['blocked']==1,s)
  await pg.wait_for_timeout(60);await E(f"p.x={D0}.x-120;p.face=1");await pg.keyboard.press('x');await pg.wait_for_timeout(450);await pg.screenshot(path=OUT+'spar_counter.png')
  s=await S();check('hit back right after a block = COUNTER!',s['counter']==1,s)
  # DODGE early (moves out of reach) = DODGED!
  await pg.wait_for_timeout(1500);await E("p.x="+D0+".x-130;p.face=1;p.state='normal'")
  await wind_at(.45);s0=await S();await pg.keyboard.press('o');await after_strike();await pg.wait_for_timeout(30);await pg.screenshot(path=OUT+'spar_dodged.png')
  s=await S();check('dodge (O) = DODGED!',s['dodged']==s0['dodged']+1,[s0,s])
  # dodge right as it lands = kitty COUNTER
  await pg.wait_for_timeout(1500);await E("p.x="+D0+".x-130;p.face=1;p.state='normal'")
  await wind_at(.86);s0=await S();await pg.keyboard.press('o');await after_strike();s=await S();check('dodge just as it lands = COUNTER!',s['counter']==s0['counter']+1,[s0,s])
  # other form: Neon Ninja jumps over it = DODGED!
  await E("TRAIN.pick(1)");await pg.wait_for_timeout(2500);await E("document.body.classList.remove('fp')")
  r=await E("[FORM(),PRACTICE.on,PRACTICE.dummies().length]");check('changing form keeps the Practice Room',r[0]==1 and r[1] and r[2]==1,r)
  await E(f"p.x={D0}.x-130;p.face=1");await wind_at(.75);s0=await S();await pg.keyboard.press('Space');await after_strike();s=await S()
  check('another form: jump over the punch = DODGED!',s['dodged']==s0['dodged']+1,[s0,s])
  await E("TRAIN.pick(0)");await pg.wait_for_timeout(2500);await E("document.body.classList.remove('fp')")
  # never dies
  await E(f"{D0}.hp=1");await E(f"p.x={D0}.x-110;p.face=1");await pg.wait_for_function(f"{D0}.ps==='idle'",timeout=5000,polling='raf');await E(f"hitDummy({D0},'claw1',1)");await pg.wait_for_timeout(300)
  r=await E(f"[{D0}.hp,{D0}.max,{D0}.alive,dummies.includes({D0})]");check('dummy never breaks: HP refills',r[0]>=r[1]-2 and r[2] and r[3],r)
  # ---- TURN (touch station button) ----
  b=await pg.locator('#prbar [data-st=turn]').bounding_box();await pg.touchscreen.tap(b['x']+b['width']/2,b['y']+b['height']/2);await pg.wait_for_timeout(1200)
  r=await E("PRACTICE.dummies().map(d=>[d.role,Math.round(d.x-p.x),d.face,PRACTICE.sheet(d.k,d.face)[1]])");r2=await E("PRACTICE.dummies().map(d=>PRACTICE.sheet('sd_idle',d.face)[0][0].f)")
  check('TURN: one dummy in front, one behind; the back one uses the facing-right _R art (no mirroring)',len(r)==2 and r[0][1]<0 and r[0][2]==1 and not r[0][3] and r[1][1]>0 and r[1][2]==-1 and not r[1][3] and r2==['p/sd_idle_r_00','p/sd_idle_00'],[r,r2])
  await pg.screenshot(path=OUT+'turn_1.png')
  await E("p.x=VW/2;p.face=1;PRACTICE.reset()")
  for k in ['x','x']:
   await pg.keyboard.press(k);await pg.wait_for_timeout(330)
  await pg.keyboard.press('ArrowLeft');await pg.wait_for_timeout(60);await pg.keyboard.press('x');await pg.wait_for_timeout(700);await pg.screenshot(path=OUT+'turn_2.png')
  await pg.keyboard.press('x');await pg.wait_for_timeout(700)
  r=await E("[PRACTICE.s.turns,PRACTICE.s.hits,p.face,PRACTICE.dummies().map(d=>d.hpShow<d.max)]");check('turn mid-combo and the chain lands on the dummy behind (TURN! counted)',r[0]>=1 and all(r[3]),r)
  # ---- LAUNCH ----
  await pg.keyboard.press('u');await pg.wait_for_timeout(1200);r=await E("[PRACTICE.st,PRACTICE.dummies().length]");check('U cycles to the LAUNCH station',r==['launch',1],r)
  await E("PRACTICE.reset()");await pg.wait_for_timeout(300)
  await E(f"p.x={D0}.x-110;p.face=1;hitDummy({D0},'uppercut',1)");await pg.wait_for_timeout(260);await pg.screenshot(path=OUT+'launch_air.png')
  r=await E(f"[{D0}.ps,Math.round(GROUND-{D0}.y),PRACTICE.s.launches]");check('launcher sends it flying (LAUNCH! counted)',r[0]=='air' and r[1]>60 and r[2]==1,r)
  for i in range(3):   # Paddy jumps up beside it and swipes as it comes down
   await pg.wait_for_function(f"{D0}.vy>0",timeout=3000,polling='raf')
   await E(f"p.x={D0}.x-70;p.face=1;p.y=Math.min(GROUND,{D0}.y+30);p.ground=false;p.vy=-150;p.state='normal';hitDummy({D0},'airswipe',1)");await pg.wait_for_timeout(120)
  await pg.screenshot(path=OUT+'launch_juggle.png');r=await E("PRACTICE.s.jug");check('air hits count as JUGGLE ×n',r>=3,r)
  await pg.wait_for_function(f"{D0}.ps==='air'&&{D0}.k==='sd_launched_fall'",timeout=5000,polling='raf');await pg.screenshot(path=OUT+'launch_fall.png')
  await pg.wait_for_function(f"{D0}.ps==='land'",timeout=5000,polling='raf');x0=await E(f"{D0}.x")
  await pg.wait_for_function(f"{D0}.ps==='down'",timeout=5000,polling='raf');x1=await E(f"{D0}.x");await pg.wait_for_timeout(40);r=await E(f"[{D0}.k,{D0}.i]")
  check('launched_fall 4 -> knockdown 5 with the +228px root shift toward Paddy',r==['sd_knockdown',4] and -125<x1-x0<-100,[x0,x1,r])
  await pg.wait_for_timeout(250);await pg.screenshot(path=OUT+'knockdown.png')
  await pg.wait_for_function(f"{D0}.ps==='rec'",timeout=4000,polling='raf');await pg.wait_for_timeout(120);await pg.screenshot(path=OUT+'recover.png')
  await pg.wait_for_function(f"{D0}.ps==='idle'",timeout=3000,polling='raf');check('lands -> knockdown -> gets back up',True)
  # real inputs: claw, claw, up = sky swipe launch, then jump + claws in the air
  await E(f"PRACTICE.reset();p.x={D0}.x-120;p.face=1");await pg.wait_for_timeout(300)
  await pg.keyboard.press('x');await pg.wait_for_timeout(150);await pg.keyboard.press('x');await pg.wait_for_timeout(150);await pg.keyboard.press('ArrowUp')
  try:await pg.wait_for_function(f"{D0}.ps==='air'",timeout=2500,polling='raf')
  except Exception:pass
  await pg.keyboard.press('Space');await pg.wait_for_timeout(120)
  for i in range(4):
   await pg.keyboard.press('x');await pg.wait_for_timeout(170)
  r=await E(f"[PRACTICE.s.launches,PRACTICE.s.jug,PRACTICE.s.hits,{D0}.ps]");print(' real-input launch+juggle',r);check('real input: Sky Swipe launches it',r[0]>=1,r)
  await pg.wait_for_function(f"{D0}.ps==='idle'",timeout=6000,polling='raf')
  # ---- reset + touch reset ----
  b=await pg.locator('#prreset').bounding_box();await pg.touchscreen.tap(b['x']+b['width']/2,b['y']+b['height']/2);await pg.wait_for_timeout(300)
  s=await S();check('↺ (touch) resets the counters',sum(s.values())==0,s)
  await pg.keyboard.press('x');await pg.wait_for_timeout(500);await pg.keyboard.press('i');await pg.wait_for_timeout(200);s=await S();check('I resets the counters',sum(s.values())==0,s)
  # ---- swap hook: facing-right copy is used (not mirrored) once sd_idle_r exists ----
  r=await E("(()=>{const a=PRACTICE.sheet('sd_hit_light',1),k=F.sd_hit_light_r;delete F.sd_hit_light_r;const b=PRACTICE.sheet('sd_hit_light',1);F.sd_hit_light_r=k;return [a[0]===k,a[1],b[0]===F.sd_hit_light,b[1],PRACTICE.sheet('sd_fighter_idle',1)[1]]})()")
  check('facing-right sheets are used by key (sd_<sheet>_r); a sheet without one (e.g. the fighter) is mirrored',r==[True,False,True,True,True],r)
  # ---- touch controls still drive Paddy in the room ----
  await E("PRACTICE.station('launch')");await pg.wait_for_timeout(600);x0=await E("p.x")
  rb=await pg.locator('#ui .b[data-k=right]').bounding_box()
  cdp=await ctx.new_cdp_session(pg);await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':rb['x']+rb['width']/2,'y':rb['y']+rb['height']/2,'id':1}]});await pg.wait_for_timeout(400)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});x1=await E("p.x");check('touch ▶ walks Paddy in the room',x1>x0+20,[x0,x1])
  cb=await pg.locator('#ui .b[data-k=attack]').bounding_box();await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':cb['x']+cb['width']/2,'y':cb['y']+cb['height']/2,'id':2}]});await pg.wait_for_timeout(60)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await pg.wait_for_timeout(600);check('touch Claw hits the dummy',(await E("PRACTICE.s.hits"))>=1,await S())
  check('no page errors',not errs,errs)
  print('FAILS',len(FAILS),FAILS);await br.close()
asyncio.run(main())
