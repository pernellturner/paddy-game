import asyncio,time,sys
from playwright.async_api import async_playwright
URL=sys.argv[1];OUT=sys.argv[2]
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},device_scale_factor=1,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);E=pg.evaluate
  await E("TRAIN.open()");await pg.wait_for_timeout(800);await E("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await E("document.body.classList.remove('fp')");await pg.wait_for_timeout(2500)
  await E("dummies.forEach(d=>{d.x=900});p.x=200;p.face=1");await pg.wait_for_timeout(600)
  seen=set()
  for i in range(40):
   seen.add(await E("FR[p.anim][p.fi].f"));await pg.wait_for_timeout(100)
  print('idle frames seen',sorted(seen),await E("[p.anim,A.idle[0],JSON.stringify(A.idle[1])]"))
  await pg.screenshot(path=OUT+'idle_1024.png')
  await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(500)
  bob=[]
  for i in range(3):
   await pg.screenshot(path=OUT+f'walk_1024_{i}.png');await pg.wait_for_timeout(110)
  for i in range(30):bob.append(await E("[p.fi,Math.round(p.wbA*100)/100,Math.round(walkBob().y*10)/10]"));await pg.wait_for_timeout(16)
  await pg.keyboard.up('ArrowRight')
  print('bob',bob[:16]);print('errs',errs);await br.close()
asyncio.run(main())
