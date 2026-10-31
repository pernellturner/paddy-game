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
    await E(f"(()=>{{const d=dummies.filter(d=>d.alive&&!d.benched)[0];d.x=560;d.y=GROUND;d.hp=60;p.state='normal';p.ground=true;p.y=GROUND;p.x=420;p.face=1;p.combo=0;practice(0,{i});W31.names.length=0;window.CARDS=[];if(!window._cw){{window._cw=1;const c=card;card=function(t){{CARDS.push(t);return c.apply(this,arguments)}}}}}})()")
    await pg.wait_for_timeout(900)
    nc=0
    for j,ch in enumerate(k):
     # v33: base Paddy's punches are full 12 fps moves; a player keeps a C-string going by pressing on the beat (ring green = the hit),
     # so while a punch string is running the next press waits for the current punch's impact frame instead of a fixed gap
     if j>0 and await E("!!(window.P33&&P33.own()&&p.anim!=='bxrec')"):
      try:
       await pg.wait_for_function(f"!(window.P33&&P33.own())||W31.names.length>={nc}",timeout=2500,polling='raf')
       await pg.wait_for_function("!(window.P33&&P33.own())||(({bxj1:3,bxj2:3,bxx:3,bxlh:3,bxrb:3,bxpj:4,bxph:4,bxpb:4,bxpu:4})[p.anim]!=null&&p.fi>=({bxj1:3,bxj2:3,bxx:3,bxlh:3,bxrb:3,bxpj:4,bxph:4,bxpb:4,bxpu:4})[p.anim])",timeout=2500,polling='raf')
      except Exception:pass
     # inside a link chain the player presses when the ring goes green (LKW)
     if j>0 and await E("p.state==='lk'"):
      try:await pg.wait_for_function("p.state!=='lk'||p.t>=LKW+.01",timeout=1500,polling='raf')
      except Exception:pass
     await pg.keyboard.down(KEY[ch]);await pg.wait_for_timeout(40);await pg.keyboard.up(KEY[ch])
     if ch=='C':nc+=1
     if ch!='C' or not await E("!!(window.P33&&P33.own())"):await pg.wait_for_timeout(min(gap,120) if await E("p.state==='lk'") else gap)
    await pg.wait_for_timeout(1200)
    r=await E("[PR.clears,CARDS.join('|'),p.state]")
    if r[0]>0: ok=1;break
    await pg.wait_for_timeout(2500)
   print(('OK  ' if ok else 'FAIL'),k,nm,'gap',gap,r,flush=True)
   await E("pracStop()");await pg.wait_for_timeout(3500)
  print('errs',errs);await br.close()
asyncio.run(main())
