import asyncio,time
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  cdp=await ctx.new_cdp_session(pg)
  await pg.goto('http://localhost:8765/?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000)
  await pg.evaluate("TRAIN.open()");await pg.wait_for_timeout(800);await pg.evaluate("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await pg.evaluate("document.body.classList.remove('fp')");await pg.wait_for_timeout(2500)
  async def ctr(k): return await pg.evaluate(f"(()=>{{const r=document.querySelector('#ui .b[data-k={k}]').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,r.width]}})()")
  async def tdown(pts): await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
  async def tup(): await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  async def tap(k,hold=60):
   x,y,_=await ctr(k);await tdown([(1,(x,y))]);await pg.wait_for_timeout(hold);await tup()
  g=await ctr('guard');print('guard btn',g)
  await pg.evaluate("p.state='normal';p.x=dummies.filter(d=>d.alive&&!d.benched)[0].x-110;p.face=1;K29.dodges=0;K29.turns=0;K29.ups=0;window.ST=[];const u=r9Pre;r9Pre=function(dt){u(dt);if(ST[ST.length-1]!==p.state)ST.push(p.state)}")
  await tap('guard',60);await pg.wait_for_timeout(500)
  print('tap guard ->',await pg.evaluate("[K29.dodges,ST.join(',')]"))
  await pg.evaluate("ST.length=0");x,y,_=await ctr('guard');await tdown([(1,(x,y))]);await pg.wait_for_timeout(500)
  print('hold guard ->',await pg.evaluate("[p.state,ST.join(',')]"))
  await pg.evaluate("dogStrike(dummies.filter(d=>d.alive&&!d.benched)[0],2,'bite')");await pg.wait_for_timeout(100);await tup();await pg.wait_for_timeout(500)
  print('block ->',await pg.evaluate("[K29.blocks,p.hp]"))
  # combo + turn via touch: claw, then left pad tap, then claw
  await pg.evaluate("p.state='normal';p.combo=0;p.x=dummies.filter(d=>d.alive&&!d.benched)[0].x+150;p.face=1;ST.length=0;C.n=0")
  await tap('attack',50);await pg.wait_for_timeout(90);await tap('left',40)
  r=await pg.evaluate("[p.face,p.state,p.combo,C.n,K29.turns]");print('turn ->',r)
  await pg.wait_for_timeout(60);await tap('attack',50)
  try:await pg.wait_for_function("p.combo>=2||p.state!=='claw'",timeout=1500,polling='raf')   # v33: the buffered press fires at the punch's cancel point
  except Exception:pass
  await pg.wait_for_timeout(100);print('after next claw ->',await pg.evaluate("[p.face,p.anim,p.combo,C.n]"))
  # up strike: claw, claw, jump
  await pg.wait_for_timeout(800);await pg.evaluate("p.state='normal';p.combo=0;p.face=1;p.x=dummies.filter(d=>d.alive&&!d.benched)[0].x-110")
  await tap('attack',50);await pg.wait_for_timeout(150);await tap('jump',50)
  # v33: the jab is a full 12 fps punch; the buffered ↑ press throws the SKY SWIPE at its cancel point
  try:await pg.wait_for_function("p.anim==='pcup'||p.state!=='claw'",timeout=1500,polling='raf')
  except Exception:pass
  print('up ->',await pg.evaluate("[p.anim,K29.ups]"))
  await pg.evaluate("setForm(1,true)");await pg.wait_for_timeout(1500)
  print('guard hidden in ninja:',await pg.evaluate("getComputedStyle(document.querySelector('#ui .b[data-k=guard]')).display"))
  print('errs',errs);await br.close()
asyncio.run(main())
