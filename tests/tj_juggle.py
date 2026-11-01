# v44b juggles take timing (juggle44.js): on EVERY form, 10 s of mashing air attacks never keeps the enemy up for ever
# (it lands, longest airborne stretch <= ~3 s), whiffed/mashed presses don't grow the combo counter,
# (scripted cinematics - finishers/ultimates like Golden Fury's sky punch - are exempt and not counted),
# and a well-timed juggle still works (several connected air hits, then the cap drops him with a short invulnerable landing).
import asyncio,time,os,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev_w1/tj/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300],flush=True);(None if ok else FAILS.append(nm))
D="dummies.filter(d=>d.alive&&!d.benched)[0]"
MON="""(()=>{window.JM={air:0,best:0,lands:0,t0:performance.now()};let last=performance.now();function f(){const t=performance.now(),dt=(t-last)/1000;last=t;
 try{const d=%s;const cin=CINE.includes(p.state)||p.state==='lkult'||p.state==='ufin'||/final|fin$|^ult/.test(p.state||'');if(cin){JM.cine=(JM.cine||0)+dt}else if(d){if(d.y<GROUND-25){JM.air+=dt;JM.best=Math.max(JM.best,JM.air)}else{if(JM.air>.3)JM.lands++;JM.air=0}}}catch(e){}requestAnimationFrame(f)}requestAnimationFrame(f)})()"""%D
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':1024,'height':340});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  E=pg.evaluate
  await pg.goto(URL+'?nostory&legends&mythic&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await pg.wait_for_timeout(1500)
  check('juggle44.js loaded last',await E("!!window.JUGGLE"))
  await E(MON)
  NF=await E("4+UF.length-1")
  async def reset():
   await E(f"(()=>{{const d={D};p.state='normal';p.ground=true;p.y=GROUND;p.x=330;p.vx=0;p.vy=0;p.face=1;d.x=p.x+150;d.y=GROUND;d.vx=0;d.vy=0;d.hp=999;d.max=Math.max(d.max||0,999);d.cool=99;d.aggro=0;d.jg=null;d.landInv=0;JM.air=0;JM.best=0;JM.lands=0;JM.cine=0}})()")
   await pg.wait_for_timeout(300)
  async def tap(k,ms=30):
   await pg.keyboard.down(k);await pg.wait_for_timeout(ms);await pg.keyboard.up(k)
  # --- unit rules on a launched dummy (base Paddy) ---
  await E("setForm(0)");await pg.wait_for_timeout(800);await reset()
  r=await E(f"""(()=>{{const d={D};d.vy=-900;d.y=GROUND;const n0=C.n;hitDummy(d,'up',1);const launched=!!d.jg||d.vy<-600;return [launched,d.vy|0]}})()""")
  await pg.wait_for_timeout(150)
  r2=await E(f"""(()=>{{const d={D};if(!d.jg)d.jg={{n:0,t0:now,last:now-1,miss:0,fall:false}};d.y=GROUND-300;d.vy=-200;const c0=C.n;hitDummy(d,'claw1',1);const c1=C.n;hitDummy(d,'claw1',1);const c2=C.n;return [c0,c1,c2,JUGGLE.log.slice(-2)]}})()""")
  check('mashed 2nd air hit inside the window whiffs and does NOT add to the combo counter',r2[1]>r2[0] and r2[2]==r2[1] and 'mash' in r2[3],r2)
  # timed juggle: hits every 0.22 s connect, the cap (CAP) ends it, then a short invulnerable landing
  await reset()
  await E(f"""(()=>{{const d={D};d.y=GROUND-260;d.vy=-300;d.fl=.6;d.jg={{n:0,t0:now,last:now-1,miss:0,fall:false}};window.TJ=[]}})()""")
  for i in range(12):
   await E(f"""(()=>{{const d={D};const c=C.n;if(d.y<GROUND-25){{d.vy=Math.min(d.vy,-350);hitDummy(d,'claw1',1)}};TJ.push([C.n>c?1:0,d.jg?d.jg.n:-1,d.jg?d.jg.fall:null])}})()""")
   await pg.wait_for_timeout(220)
  tj=await E("TJ");await pg.wait_for_timeout(2500)
  conn=sum(x[0] for x in tj)
  land=await E(f"(()=>{{const d={D};return [d.y>=GROUND-2,d.landInv>now,JUGGLE.log.filter(x=>/^drop|^land/.test(x)).slice(-3)]}})()")
  check('timed juggle: hits spaced 0.22 s all connect up to the cap',conn>=6 and conn<=10,[conn,tj])
  check('timed juggle: after the cap he falls and lands (brief invulnerable landing)',land[0] and any('drop:cap' in x or 'drop:time' in x for x in land[2]),land)
  r3=await E(f"(()=>{{const d={D};d.landInv=now+.4;const c=C.n;hitDummy(d,'claw1',1);return [C.n===c,JUGGLE.log.slice(-1)[0]]}})()")
  check('hit during the landing invulnerability whiffs (no combo count)',r3[0] and r3[1]=='landinv',r3)
  # --- 10 s of mashing on every form: launcher (↑X) then jump + mash every attack button ---
  res={}
  FL=[int(x) for x in os.environ['FORMS'].split(',')] if os.environ.get('FORMS') else range(0,NF+1)
  if os.environ.get('JOFF'):await E('JUGGLE.off=true');print('JUGGLE OFF (baseline)')
  for f in FL:
   await E(f"setForm({f})");await pg.wait_for_timeout(1400)
   fm=await E("FORM()")
   if fm!=f:res[f]='skip';continue
   await reset()
   await pg.keyboard.down('ArrowUp');await tap('KeyX',40);await pg.keyboard.up('ArrowUp');await pg.wait_for_timeout(120)
   t0=time.time();i=0
   while time.time()-t0<10:
    if i%9==0:await tap('Space',25)
    await tap(['KeyX','KeyX','KeyC','KeyX','KeyZ'][i%5],20);i+=1
    if i%40==0:await E(f"(()=>{{const d={D};p.x=Math.max(260,Math.min(d.x-120,900));p.face=1}})()")
   try:await pg.wait_for_function(f"(()=>{{const d={D};return d.y>=GROUND-2}})()",timeout=4000,polling='raf')
   except Exception:pass
   if os.environ.get('TRACE'):
    tr=[]
    for k in range(8):
     tr.append(await E(f"(()=>{{const d={D};return [Math.round(GROUND-d.y),Math.round(d.vy),p.state,d.st,+(d.fl||0).toFixed(2)]}})()"));await pg.wait_for_timeout(500)
    print('trace',f,tr)
   m=await E(f"(()=>{{const d={D};return {{cine:+(JM.cine||0).toFixed(1),best:+JM.best.toFixed(2),lands:JM.lands,y:Math.round(GROUND-d.y),drops:JUGGLE.log.filter(x=>/^drop/.test(x)).length,name:(UF[FORM()-4]||{{}}).nm||FORM()}}}})()")
   res[f]=m
   check(f'form {f} {m["name"]}: 10 s mash -> enemy lands within 4 s after, never airborne > 3.5 s (slow-mo/freeze forms included)',m['y']<=2 and m['best']<=3.5,m)
   await pg.screenshot(path=OUT+f'mash_{f}.png')
  print(json.dumps(res))
  check('no page errors',not errs,errs[:3])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
