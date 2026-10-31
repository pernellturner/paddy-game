import asyncio,time
from playwright.async_api import async_playwright
OUT='/workspace/rev30/'
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},device_scale_factor=1,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:('w30' in m.text or 'safety' in m.text) and errs.append(m.text))
  await pg.goto('http://localhost:8765/?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000)
  E=pg.evaluate
  await E("TRAIN.open()");await pg.wait_for_timeout(800);await E("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await E("document.body.classList.remove('fp')");await pg.wait_for_timeout(2500)
  await pg.mouse.click(500,200);await pg.wait_for_timeout(300)
  print('routes0',await E("ROUTES[0].map(r=>r.k+' '+r.nm+' :: '+(r.tip||''))"))
  for run in range(2):
   await E("(()=>{const d=dummies.filter(d=>d.alive&&!d.benched)[0];p.state='normal';p.x=d.x-120;p.face=1;p.y=GROUND-170;p.ground=false;p.vy=0;d.y=GROUND-180;d.vy=-50;d.hp=Math.max(d.hp,40)})()")
   await E("bunnyKick()")
   print('air?',await E("[W30.air,p.state,!!p.grab]"))
   for tt,nm in [(.15,'grab'),(.5,'spin'),(.85,'spin2'),(1.1,'windup'),(1.22,'spike')]:
    await pg.wait_for_function(f"p.state!=='bunny'||p.t>={tt}",timeout=8000,polling='raf')
    print(nm,await E("[p.state,+p.t.toFixed(2),W30.airS&&W30.airS.spins,Math.round(p.y),+p.rot.toFixed(1),p.anim]"))
    if run==0: await pg.screenshot(path=OUT+f'air_{nm}.png')
   await pg.wait_for_function("p.state!=='bunny'||(W30.airS&&W30.airS.impact)",timeout=8000,polling='raf')
   await pg.wait_for_timeout(60)
   if run==0: await pg.screenshot(path=OUT+'air_impact.png')
   await pg.wait_for_timeout(350)
   if run==0: await pg.screenshot(path=OUT+'air_comic.png')
   await pg.wait_for_timeout(1800);print('after',await E("[p.state,p.rot,W30.on,!!window.MUSCUT,W30.kicks]"))
  # ground one still ground
  await E("(()=>{const d=dummies.filter(d=>d.alive&&!d.benched)[0];d.y=GROUND;p.state='normal';p.ground=true;p.y=GROUND;p.x=d.x-150;p.face=1})()");await pg.wait_for_timeout(700)
  await E("bunnyKick()");print('ground air?',await E("W30.air"));await pg.wait_for_timeout(3500)
  print('tiers',await E("[SND.tier('pc1'),SND.tier('pc3'),SND.tier('bunnylaunch'),SND.tier('spike'),SND.tierLog.join('')]"),'vox',await E("W30.vox"))
  print('snd',await E("SND.dbg()"))
  print('errs',errs);await br.close()
asyncio.run(main())
