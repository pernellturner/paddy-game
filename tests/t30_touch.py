import asyncio,time
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));cdp=await ctx.new_cdp_session(pg);E=pg.evaluate
  await pg.goto('http://localhost:8765/?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000)
  await E("TRAIN.open()");await pg.wait_for_timeout(800);await E("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await E("document.body.classList.remove('fp')");await pg.wait_for_timeout(2500)
  async def tap(k):
   x,y=await E(f"(()=>{{const r=document.querySelector('#ui .b[data-k={k}]').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}})()")
   await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]});await pg.wait_for_timeout(60);await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  await tap('jump');await pg.wait_for_timeout(500)
  await E("(()=>{const d=dummies.filter(d=>d.alive&&!d.benched)[0];p.state='normal';p.ground=true;p.y=GROUND;p.x=d.x-150;p.face=1})()");await pg.wait_for_timeout(300)
  await E("bunnyKick()");await pg.wait_for_function("p.state!=='bunny'||(p.shot&&p.t>2.1)",timeout=8000,polling='raf')
  await tap('attack');await pg.wait_for_timeout(150);print('touch skip ->',await E("[p.state,W30.on,!!window.MUSCUT]"))
  await pg.wait_for_timeout(1500);await E("(()=>{const d=dummies.filter(d=>d.alive&&!d.benched)[0];p.state='normal';p.ground=true;p.y=GROUND;p.x=d.x-200;p.face=1;W30.spins=0})()")
  await tap('tail');await pg.wait_for_timeout(100);print('touch tail ->',await E("[p.state,W30.spins]"))
  print('sfx',await E("Promise.all(['pvo_meow1','pvo_growl1','pvo_grunt1','hit_small','hit_power','hit_deadly'].map(k=>Promise.resolve(SND.load(k)).then(b=>k+':'+(b?b.duration.toFixed(2):'none'))))"))
  print('errs',errs);await br.close()
asyncio.run(main())
