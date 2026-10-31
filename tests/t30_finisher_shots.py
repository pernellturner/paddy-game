import asyncio,time,sys
from playwright.async_api import async_playwright
OUT='/workspace/rev30/'
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},device_scale_factor=1,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='warning' and 'w30' in m.text and errs.append(m.text))
  await pg.goto('http://localhost:8765/?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000)
  E=pg.evaluate
  await E("TRAIN.open()");await pg.wait_for_timeout(800);await E("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await E("document.body.classList.remove('fp')");await pg.wait_for_timeout(2500)
  print('FIN30',await E("!!window.FIN30"))
  setup="(()=>{const d=dummies.filter(d=>d.alive&&!d.benched)[0];p.state='normal';p.ground=true;p.y=GROUND;p.x=d.x-150;p.face=1;p.vx=0;p.vy=0;d.hp=Math.max(d.hp,40);return d.x})()"
  for run in range(2):
   await E(setup);await pg.wait_for_timeout(400)
   await E("window.MCUT=[];bunnyKick()")
   marks=[(.2,'grab'),(.9,'kick3'),(1.5,'kick6'),(1.85,'windup'),(1.99,'launch'),(2.2,'comic'),(2.45,'comic2')]
   for tt,nm in marks:
    try: await pg.wait_for_function(f"p.state!=='bunny'||p.t>={tt}",timeout=8000,polling='raf')
    except Exception as e: print('wait fail',nm)
    info=await E("[p.state,+p.t.toFixed(2),p.kicks,!!window.MUSCUT,+cine.bars.toFixed(2),+cine.z.toFixed(2),W30.comic&&W30.comic.t]")
    print(run,nm,info)
    await pg.screenshot(path=OUT+f'fin{run}_{nm}.png')
   await pg.wait_for_timeout(1400);print(run,'after',await E("[p.state,!!window.MUSCUT,W30.on,+cine.bars.toFixed(2)]"));await pg.screenshot(path=OUT+f'fin{run}_after.png')
   await pg.wait_for_timeout(1500)
  # skip test: press attack right after launch
  await E(setup);await pg.wait_for_timeout(400);await E("bunnyKick()")
  await pg.wait_for_function("p.state!=='bunny'||(p.shot&&p.t>2.1)",timeout=8000,polling='raf')
  await pg.keyboard.down('KeyX');await pg.wait_for_timeout(60);await pg.keyboard.up('KeyX');await pg.wait_for_timeout(120)
  print('skip ->',await E("[p.state,p.anim,W30.on,!!window.MUSCUT]"))
  await pg.wait_for_timeout(2500)
  # tail spin ground
  for n,(gr,nm) in enumerate([(True,'ground'),(False,'air')]):
   await E(setup);await E("(()=>{const d=dummies.filter(d=>d.alive&&!d.benched)[0];p.x=d.x-230})()")
   if not gr: await E("p.y=GROUND-160;p.ground=false;p.vy=-100")
   await pg.wait_for_timeout(300)
   x0=await E("dummies.filter(d=>d.alive&&!d.benched)[0].x")
   await E("W30.pulls=0;W30.spinHits=0;tailWhip(1)")
   for tt in [.08,.18,.3]:
    await pg.wait_for_function(f"p.state!=='tailwhip'||p.t>={tt}",timeout=4000,polling='raf')
    await pg.screenshot(path=OUT+f'spin_{nm}_{int(tt*100):02d}.png')
   await pg.wait_for_timeout(400)
   print('spin',nm,await E(f"[W30.pulls,W30.spinHits,Math.round(dummies.filter(d=>d.alive&&!d.benched)[0].x-{x0}),texts[0]&&texts[0].t]"))
   await pg.wait_for_timeout(1200)
  # keyboard tail spin x3 (T)
  await E(setup);await pg.wait_for_timeout(300);await E("W30.spins=0")
  for i in range(3):
   await pg.keyboard.down('KeyT');await pg.wait_for_timeout(50);await pg.keyboard.up('KeyT');await pg.wait_for_timeout(200)
   if i==2: await pg.screenshot(path=OUT+'spin_kbd_3.png')
  print('kbd spins',await E("[W30.spins,p.tn]"))
  # fps-ish: time 120 frames during finisher
  await pg.wait_for_timeout(1500);await E(setup);await pg.wait_for_timeout(300)
  fps=await E("new Promise(r=>{bunnyKick();let n=0,t0=performance.now();const f=()=>{if(++n<120)requestAnimationFrame(f);else r(120000/(performance.now()-t0))};requestAnimationFrame(f)})")
  print('fps during finisher (headless)',round(fps,1))
  print('errs',errs);await br.close()
asyncio.run(main())
