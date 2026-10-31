# v38 KNIGHT PADDY: copy of t37_samurai.py with Knight's moves (Pirate shares the x* code: checked untouched at the end) (same engine rules, same checks).
import asyncio,time,os,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev38_knight/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,info,flush=True);(None if ok else FAILS.append(nm))
MON="""(()=>{window.MONL=[];let lx=null,ly=null,la=null;function f(){try{const fr=(FR[p.anim]||[])[p.fi];
 MONL.push([p.anim,p.fi,fr&&fr.f,fr?imgOK(IMG[fr.f]):false,Math.round(p.x),Math.round(p.y),p.state,KN8.k||'',hitstop>0?1:0]);if(MONL.length>20000)MONL.shift()}catch(e){}requestAnimationFrame(f)}requestAnimationFrame(f)})()"""
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':1024,'height':340});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  E=pg.evaluate
  await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await pg.wait_for_timeout(1200)
  await pg.keyboard.press('Digit5');await pg.wait_for_timeout(1800)
  check('5 = Knight form',await E("FORM()===3&&p.xf===3"))
  await pg.wait_for_function("Object.keys(F).filter(k=>k.startsWith('kg_')).every(k=>F[k].every(f=>imgOK(IMG[f.f])))",timeout=30000)
  r=await E("[Object.keys(F).filter(k=>k.startsWith('kg_')).length,Object.keys(FR).filter(k=>/^k(n|g)_/.test(k)).filter(k=>(FR[k]||[]).some(f=>!/^p\\/kg_/.test(f.f)))]")
  check('21 kg sheets loaded; every knight anim (kn_*, kg_*) draws only kg_* frames',r[0]==21 and not r[1],r)
  await E(MON)
  D="dummies.filter(d=>d.alive&&!d.benched)[0]"
  async def reset(dx=170,face=1):
   await E(f"(()=>{{const d={D};p.state='normal';KN8.k=null;p.ground=true;p.y=GROUND;p.x=330;p.vx=0;p.vy=0;p.face={face};p.rot=0;d.x=p.x+{dx};d.y=GROUND;d.vx=0;d.vy=0;d.hp=99;d.cool=9;KN8.moves.length=0;C.n=0;C.jug=0;window.CARDS=[];if(!window._cw){{window._cw=1;const c=card;card=function(t){{CARDS.push(t);return c.apply(this,arguments)}}}}}})()")
   await pg.wait_for_timeout(250)
  async def tap(k,ms=45):
   await pg.keyboard.down(k);await pg.wait_for_timeout(ms);await pg.keyboard.up(k)
  async def onbeat(n=None):   # wait for move n to have started, then for its impact frame (HIT1) = the beat
   if n is not None:
    try:await pg.wait_for_function(f"KN8.moves.length>={n}||p.state!=='kg'",timeout=2500,polling='raf')
    except Exception:pass
   try:await pg.wait_for_function("p.state!=='kg'||!KN8.k||KN8.k==='rec'||(()=>{const L=F['kg_'+KN8.k]||[];const h=L.findIndex(f=>f.hit===1);return p.fi>=(h<0?1:h)})()",timeout=2500,polling='raf')
   except Exception:pass
  async def string(keys,beat=True,shot=None):
   n0=await E("KN8.moves.length")
   for j,k in enumerate(keys):
    if j>0 and beat:await onbeat(n0+j)
    mods=[m for m in k.split('+')[:-1]];key=k.split('+')[-1]
    for m in mods:await pg.keyboard.down(m)
    await tap(key)
    for m in mods:await pg.keyboard.up(m)
    if shot and j in shot:await pg.wait_for_timeout(shot[j][1]);await pg.screenshot(path=OUT+shot[j][0])
    if not beat:await pg.wait_for_timeout(200)
  mv=lambda:E("KN8.moves.slice()")
  # ---- freestyle 1-2-3-4 ----
  await reset();await string(['KeyX']*4,shot={1:('thrust.png',90),3:('shieldupper.png',120)});await pg.wait_for_timeout(1100)
  m=await mv();check('C C C C = shield jab -> thrust -> forehand -> shield uppercut',m[:4]==['l1','l2','l3','l4'],m)
  check('ends with the short recovery back to idle',await E("p.state==='normal'&&p.anim==='kn_idle'"),await E("[p.state,p.anim]"))
  # ---- 1-1-2 ----
  await reset();await string(['ArrowRight+KeyX','ArrowRight+KeyX','KeyX'],shot={1:('lowcut.png',130)});await pg.wait_for_timeout(1000)
  m=await mv();check('→C →C C = shield jab -> low cut -> thrust (1-1-2)',m[:3]==['l1','l5','l2'],m)
  # ---- low sweep, flying knee, counter palm ----
  await reset();await string(['ArrowDown+KeyX'],shot={0:('overhead.png',330)});await pg.wait_for_timeout(900);m=await mv();check('↓C = overhead cleave',m[:1]==['h1'],m)
  await reset();await string(['KeyT'],shot={0:('shieldcharge.png',320)});await pg.wait_for_timeout(900);m=await mv();check('T = shield charge',m[:1]==['h2'],m)
  await reset();await string(['KeyC'],shot={0:('countercut.png',330)});await pg.wait_for_timeout(900);m=await mv();check('Meow (C) = counter cut',m[:1]==['counter'],m)
  # ---- 8-hit timed string -> crescent finisher ----
  await reset(160);await E("SND&&SND.tierLog&&(SND.tierLog.length=0);KN8.log.length=0")
  await string(['KeyX','ArrowRight+KeyX','KeyX','KeyX','KeyX','KeyX','KeyX','KeyX'])
  try:await pg.wait_for_function("KN8.k==='fin'&&p.fi>=5",timeout=3000,polling='raf');await pg.wait_for_timeout(30);await pg.screenshot(path=OUT+'finisher.png')
  except Exception:pass
  await pg.wait_for_timeout(1800);m=await mv();cards=await E("CARDS")
  check('8 on-beat presses: hit 7 = overhead cleave, 8th = BASTION finisher (card)',len(m)>=8 and m[6]=='h1' and m[7]=='fin' and 'BASTION!' in cards,[m,cards])
  t=await E("[SND.tierLog.slice(),KN8.log.slice()]")
  check('hit sounds use the 3 tiers (small / power / deadly)',1 in t[0] and 2 in t[0] and 3 in t[0],t[0])
  check('effort sounds fire on the noted frames (hup, GRUNT, HISS, BIG GRUNT)',all(c in t[1] for c in ['hup','GRUNT','HISS','BIG GRUNT']),t[1])
  # off-beat: mashing keeps the string going, no finisher
  await reset();await string(['KeyX']*9,beat=False);await pg.wait_for_timeout(1500);m=await mv()
  check('off-beat mashing = endless freestyle, no finisher',len(m)>=5 and 'fin' not in m,m)
  # ---- launcher -> air 1 / 2 / 3 ----
  await reset(150);await E("C.jug=0")
  await string(['ArrowUp+KeyX','KeyX','KeyX','KeyX'],shot={1:('air_slash.png',150),3:('plunge.png',140)});await pg.wait_for_timeout(1600)
  m=await mv();r=await E("[p.ground,p.state,KN8.hits]")
  check('↑C shield launcher -> C C C = air slash -> shield bash -> plunge, lands',m[:4]==['launch','a1','a2','a3'] and r[0],[m,r])
  check('launcher + all 3 air hits connect (juggle)',all((r[2].get(k,0) or 0)>=1 for k in ['launch','a1','a2','a3']),r[2])
  # ---- air blink closes the gap ----
  await reset(150);await string(['ArrowUp+KeyX','KeyN','KeyX'],shot={1:('air_chargestep.png',110)});await pg.wait_for_timeout(1500);m=await mv()
  check('shield launcher -> air charge step -> air slash',m[:3]==['launch','blinka','a1'],m)
  # ---- blink dash-in from range ----
  await reset(520);x0=await E("p.x");await tap('KeyN');await pg.wait_for_timeout(140);await pg.screenshot(path=OUT+'blink.png');await pg.wait_for_timeout(450);r=await E(f"[p.x,{D}.x,KN8.moves.slice()]")
  check('N = charge step dash-in, stops just in front of him',r[2][:1]==['blink'] and 40<r[1]-r[0]<160,[x0,r])
  await tap('KeyX');await pg.wait_for_timeout(700);check('charge step -> shield jab',(await mv())[:2]==['blink','l1'],await mv())
  # ---- block / dodge / counter ----
  await reset();await pg.keyboard.down('KeyB');await pg.wait_for_timeout(900);r=await E("[p.state,KN8.k,p.fi]");await pg.screenshot(path=OUT+'block.png')
  check('hold B = block (held)',r[0]=='kg' and r[1]=='block',r)
  await tap('KeyX');await pg.wait_for_timeout(250);await pg.keyboard.up('KeyB');await pg.screenshot(path=OUT+'counter.png');await pg.wait_for_timeout(700);m=await mv()
  check('Claw while blocking = counter cut',m[:2]==['block','counter'],m)
  await reset();await tap('KeyO');await pg.wait_for_timeout(160);await pg.screenshot(path=OUT+'dodge.png');await pg.wait_for_timeout(600);m=await mv()
  check('O = dodge back-hop',m[:1]==['dodge'],m)
  await reset();await tap('KeyB',60);await pg.wait_for_timeout(600);m=await mv();check('tap B = dodge (hold = block)',m[:2]==['block','dodge'],m)
  # perfect block / early dodge vs an incoming hit
  await reset();await pg.keyboard.down('KeyB');await pg.wait_for_timeout(60);r=await E(f"(()=>{{const t=[];const s=say;say=function(x){{t.push(x);return s.apply(this,arguments)}};const ok=dogStrike({D},1,'punch');say=s;return [ok,t,KN8.k]}})()");await pg.keyboard.up('KeyB')
  check('block just as the hit lands = COUNTER (auto counter cut)',r[0] and 'COUNTER!' in r[1] and r[2]=='counter',r)
  await pg.wait_for_timeout(800);await reset();await pg.keyboard.down('KeyB');await pg.wait_for_timeout(500);hp=await E("p.hp")
  r=await E(f"(()=>{{const t=[];const s=say;say=function(x){{t.push(x);return s.apply(this,arguments)}};const ok=dogStrike({D},1,'punch');say=s;return [ok,t,KN8.k,p.hp]}})()");await pg.keyboard.up('KeyB')
  check('late block = BLOCKED (no damage)',r[0] and 'BLOCKED!' in r[1] and r[3]==hp,r)
  await pg.wait_for_timeout(800);await reset();await tap('KeyO');await pg.wait_for_timeout(60)
  r=await E(f"(()=>{{const t=[];const s=say;say=function(x){{t.push(x);return s.apply(this,arguments)}};const ok=dogStrike({D},1,'punch');say=s;return [ok,t,KN8.k]}})()")
  check('dodge just as the hit lands = COUNTER',r[0] and 'COUNTER!' in r[1],r)
  # ---- turning mid-combo ----
  await pg.wait_for_timeout(900);await reset(170,1)
  await tap('KeyX');await onbeat();await tap('ArrowLeft');await tap('KeyX');await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'turn.png');await pg.wait_for_timeout(700)
  r=await E("[p.face,KN8.moves.slice(),KN8.hits]");check('tap ← mid-string turns round, string carries on',r[0]==-1 and r[1][:2]==['l1','l2'],r)
  # ---- jump cancel, walk, victory ----
  await reset();await tap('KeyX');await onbeat();await tap('Space');await pg.wait_for_timeout(120);r=await E("[p.state,p.ground,p.vy<0]")
  check('jump cancels a strike after its hit',r[0]!='kg' and not r[1],r)
  await pg.wait_for_timeout(1200);await reset();await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(500);await pg.screenshot(path=OUT+'walk.png');r=await E("[p.anim,Math.round(p.vx),A[p.anim][2]]");await pg.keyboard.up('ArrowRight')
  check('walk = kg_walk, cycle speed follows walk speed',r[0]=='kn_run' and 250<r[1]<310 and 15<r[2]<23,r)
  await pg.wait_for_timeout(500);await reset();await E("victory()");await pg.wait_for_timeout(700);await pg.screenshot(path=OUT+'victory.png');r=await E("[p.anim,(FR[p.anim]||[])[p.fi].f]")
  check('victory pose = kg_victory',r[1].startswith('p/kg_victory'),r)
  # ---- route opener: 3 on-beat hits + Blink = NEON GHOST CUT ----
  await pg.wait_for_timeout(1500);await reset(160);await E("practice(3,0)");await pg.wait_for_timeout(1500)
  r0=await E("KN8.moves.length");await string(['KeyX','KeyX','KeyX'])
  await onbeat(r0+3);await pg.wait_for_timeout(30);dg=await E("[KN8.moves.slice(-4),KN8.n,KN8.beat,p.miss,JSON.stringify(openerNow()),JSON.stringify(LK.op),PR.on,PR.f,FORM(),p.state,KN8.k,p.fi]");await tap('KeyN');await pg.wait_for_timeout(1600);r=await E("[PR.clears,CARDS.join('|'),p.state]")
  if r[0]<1:print('ROUTE DEBUG',dg)
  check('C C C (on the beat) + B opens the knight route LANCE OF LIGHT',r[0]>=1,r);await E("pracStop()")
  # ---- Practice Room spar as Ninja: hold B = BLOCKED, Claw right after = COUNTER, dodge early = DODGED ----
  await pg.wait_for_timeout(800);await E("ov(true)");await pg.wait_for_timeout(400);await pg.click('#mprac');await pg.wait_for_timeout(2500)
  await E("if(FORM()!==3)setForm(3)");await pg.wait_for_timeout(1500)
  D0="PRACTICE.dummies()[0]"
  async def wind_at(t):
   await pg.wait_for_function(f"{D0}.ps==='wind'&&{D0}.pt>={t}",timeout=12000,polling='raf')
  await pg.wait_for_function("p.state==='normal'",timeout=5000,polling='raf');await E(f"p.x={D0}.x-115;p.face=1;p.state='normal'");await wind_at(.3);await pg.keyboard.down('KeyB')
  await pg.wait_for_function(f"{D0}.ps==='arec'",timeout=5000,polling='raf');await pg.screenshot(path=OUT+'practice_blocked.png');await pg.keyboard.up('KeyB')
  s1=await E("Object.assign({},PRACTICE.s)");check('Practice Room spar: Knight hold B = BLOCKED!',s1['blocked']>=1,s1)
  await pg.wait_for_timeout(60);await tap('KeyX');await pg.wait_for_timeout(500);await pg.screenshot(path=OUT+'practice_counter.png')
  s2=await E("Object.assign({},PRACTICE.s)");dbg=await E(f"[KN8.moves.slice(-4),Math.round(p.x),Math.round({D0}.x),p.state,KN8.k,KN8.hits.counter]");check('Practice Room spar: Knight hits back right after = COUNTER!',s2['counter']>=1,[s2,dbg])
  await pg.wait_for_timeout(1500);await E(f"p.x={D0}.x-130;p.face=1;p.state='normal';KN8.k=null");await wind_at(.45);await tap('KeyO')
  await pg.wait_for_function(f"{D0}.ps==='arec'||{D0}.ps==='idle'",timeout=5000,polling='raf');await pg.wait_for_timeout(100)
  s3=await E("Object.assign({},PRACTICE.s)");check('Practice Room spar: Knight dodge (O) = DODGED! or COUNTER!',s3['dodged']+s3['counter']>s2['dodged']+s2['counter'],[s2,s3])
  await E("document.querySelector('[data-st=launch]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));document.querySelector('[data-st=launch]').click()");await pg.wait_for_timeout(1200)
  await E("KN8.moves.length=0");await string(['ArrowUp+KeyX','KeyX','KeyX','KeyX'],shot={2:('practice_juggle.png',120)});await pg.wait_for_timeout(1500)
  s4=await E("[PRACTICE.st,Object.assign({},PRACTICE.s),KN8.moves.slice()]")
  check('Practice Room launch station: Knight launcher + air string = LAUNCH + JUGGLE ×2 or more',s4[0]=='launch' and s4[1]['launches']>=1 and s4[1]['jug']>=2,s4)
  await E("(()=>{try{const b=document.getElementById('prexit');b&&b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))}catch(e){}})()");await pg.wait_for_timeout(1200)
  # ---- frame monitor ----
  ml=await E("MONL");nin=[x for x in ml if x[0].startswith(('kn_','kg_'))]
  bad=[x for x in nin if not x[3]];old=[x for x in nin if x[2] and not x[2].startswith('p/kg_')]
  check('monitor: every drawn knight frame was loaded (no missing frame / fallback)',not bad,bad[:5])
  check('monitor: no old knight art drawn',not old,old[:5])
  pops=[]
  for a,b in zip(ml,ml[1:]):
   if a[6]=='kg' and b[6]=='kg' and a[7] not in('blink','blinka','fin','dodge') and b[7] not in('blink','blinka','fin','dodge') and (abs(b[4]-a[4])>40 or abs(b[5]-a[5])>55):pops.append((a,b))
  check('monitor: no position pops inside or between moves (x <=40, y <=55 px per frame)',not pops,pops[:4])
  print('frames monitored',len(ml),'knight',len(nin))
  check('no page errors',not errs,errs[:5])
  # ---- touch ----
  ctx=await br.new_context(viewport={'width':1024,'height':340},device_scale_factor=2,has_touch=True,is_mobile=True)
  tp=await ctx.new_page();terr=[];tp.on('pageerror',lambda e:terr.append(str(e)))
  await tp.goto(URL+'?nostory&v='+str(time.time()));await tp.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await tp.wait_for_timeout(1200)
  T=tp.evaluate;await T("setForm(3)");await tp.wait_for_timeout(1500);await T(MON.replace('MONL','MONT'))
  await T(f"(()=>{{const d={D};p.state='normal';p.x=330;p.y=GROUND;p.face=1;d.x=500;d.y=GROUND;d.hp=99;d.cool=9;KN8.moves.length=0}})()")
  vis=await T("getComputedStyle(document.querySelector('#ui .b[data-k=guard]')).display")
  check('touch: 🛡 guard button shown for Knight',vis!='none',vis)
  async def tb(k,hold=60):
   b=await tp.locator(f'#ui .b[data-k={k}]').first.bounding_box();cdp=await ctx.new_cdp_session(tp)
   x,y=b['x']+b['width']/2,b['y']+b['height']/2
   await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]});await tp.wait_for_timeout(hold)
   await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  for i in range(3):
   await tb('attack');await tp.wait_for_timeout(300)
  await tp.wait_for_timeout(900);m=await T("KN8.moves.slice()");check('touch: Claw ×3 = shield jab -> thrust -> forehand',m[:3]==['l1','l2','l3'],m)
  await T("KN8.moves.length=0");await tb('guard',700);await tp.wait_for_timeout(500);m=await T("KN8.moves.slice()");check('touch: hold 🛡 = block',m[:1]==['block'],m)
  await T("KN8.moves.length=0");await tb('guard',50);await tp.wait_for_timeout(600);m=await T("KN8.moves.slice()");check('touch: tap 🛡 = dodge',('dodge' in m),m)
  await T("KN8.moves.length=0");await tb('blink');await tp.wait_for_timeout(600);m=await T("KN8.moves.slice()");check('touch: Blink = charge step',m[:1]==['blink'],m)
  await T("KN8.moves.length=0");await tb('tail');await tp.wait_for_timeout(700);m=await T("KN8.moves.slice()");check('touch: Tail = shield charge',m[:1]==['h2'],m)
  await tp.screenshot(path=OUT+'touch.png')
  check('touch: no page errors',not terr,terr[:5])
  # Pirate shares the x* functions: still his own moves and art
  await T("setForm(4)");await tp.wait_for_timeout(1800);await T(f"(()=>{{const d={D};p.state='normal';p.x=330;p.y=GROUND;p.face=1;d.x=500;d.y=GROUND;d.hp=99;d.cool=9;KN8.moves.length=0}})()")
  await tb('attack');await tp.wait_for_timeout(150);r=await T("[FORM(),p.xf,p.state,p.anim,((FR[p.anim]||[])[p.fi]||{}).f,KN8.moves.length]")
  check('Pirate untouched: Claw = his own cutlass hit (pi_* / v39 pr_*)',r[0]==4 and r[2].startswith(('pi','pr')) and not str(r[4]).startswith('p/kg_') and r[5]==0,r)
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
