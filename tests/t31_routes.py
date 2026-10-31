import asyncio,time,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
KEY={'C':'KeyX','T':'KeyT','M':'KeyC','B':'KeyN'}
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':1024,'height':340});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000)
  await E("TRAIN.open()");await pg.wait_for_timeout(800);await E("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await E("document.body.classList.remove('fp')");await pg.wait_for_timeout(3000)
  R=await E("ROUTES[0].map(r=>[r.k,r.nm])")
  for i,(k,nm) in enumerate(R):
   ok=0
   for gap in [230,300,180]:
    await E(f"(()=>{{const d=dummies.filter(d=>d.alive&&!d.benched)[0];d.x=560;d.y=GROUND;d.hp=60;p.state='normal';p.ground=true;p.y=GROUND;p.x=420;p.face=1;p.combo=0;practice(0,{i});window.CARDS=[];if(!window._cw){{window._cw=1;const c=card;card=function(t){{CARDS.push(t);return c.apply(this,arguments)}}}}}})()")
    await pg.wait_for_timeout(900)
    for ch in k:
     await pg.keyboard.down(KEY[ch]);await pg.wait_for_timeout(40);await pg.keyboard.up(KEY[ch]);await pg.wait_for_timeout(gap)
    await pg.wait_for_timeout(1200)
    r=await E("[PR.clears,CARDS.join('|'),p.state]")
    if r[0]>0: ok=1;break
    await pg.wait_for_timeout(2500)
   print(('OK  ' if ok else 'FAIL'),k,nm,'gap',gap,r,flush=True)
   await E("pracStop()");await pg.wait_for_timeout(3500)
  print('errs',errs);await br.close()
asyncio.run(main())
