# v44b DEV TEST mode (dev44.js, DEV_MODE=true): free play / Practice / Practice Room have every form, the title says
# "🛠 DEV TEST (all forms)", nothing is saved for it, and the 🌳 PLAY WORLD 1 story save still starts with every form locked.
import asyncio,time,os,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300],flush=True);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},has_touch=True,is_mobile=True);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  E=pg.evaluate
  await pg.goto(URL+'index.html?story&v='+str(time.time()));await pg.wait_for_timeout(4500)
  r=await E("[window.DEV_MODE,(document.getElementById('sdev')||{}).textContent,[...Array(UF.length).keys()].slice(1).filter(u=>!UNL.ok(u)),localStorage.getItem('paddyLegends')]")
  check('title shows 🛠 DEV TEST (all forms)',r[0] is True and r[1]=='🛠 DEV TEST (all forms)',r[:2])
  check('free play: every Legend/Mythic/Golden Fury form available',r[2]==[],r[2])
  check('dev mode writes nothing to the free-play save',r[3] is None or 'tryAll' not in (r[3] or ''),r[3])
  # cycle through every form in free play
  await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await pg.wait_for_timeout(1200)
  seen={await E("FORM()")}
  for i in range(30):
   await E("cycleForm()");await pg.wait_for_timeout(250);seen.add(await E("p.morphWait?p.morphWait.f:FORM()"))
  n=await E("4+UF.length-1")
  check(f'🔄 cycles through all {n+1} forms in free play',len(seen)>=n+1,sorted(seen))
  # story save: still fully locked
  await pg.goto(URL+'level.html?level=silverdale_1&new=1&nocuts&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready',timeout=30000);await pg.wait_for_timeout(500)
  s=await E("JSON.parse(localStorage.getItem('paddyStory'))")
  check('🌳 PLAY WORLD 1 new game: every form locked, separate save',s and s.get('forms')==[] and s.get('exp')==0,s and {k:s.get(k) for k in ('forms','exp')})
  check('no page errors',not errs,errs[:3])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
