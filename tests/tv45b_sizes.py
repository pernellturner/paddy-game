# v45b: one consistent Paddy size, steady idle face, enemies >= Paddy. Phone-size (844x390) screenshots.
import asyncio,sys,os,time,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/paddy_shots/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300]);(None if ok else FAILS.append(nm))
GROUPS=[['rat','seagull','magpie','alleytom','possum','ferret'],['chihuahua','pukeko','sausage','tabby','crab','goose'],['hedgehog','persian','weta','wasp','rooster','bulldog'],['poodle','eel','labrador','husky','siamese','magpie_boss']]
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':844,'height':390},has_touch=True,is_mobile=True);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  E=pg.evaluate
  await pg.goto(URL+f'level.html?level=silverdale_1&nocuts&touch&v={time.time()}');await pg.wait_for_function('window.LV&&LV.ready',timeout=30000)
  await E('LV.calm()');await E('(()=>{const p=LV.p;LV.teleport(Math.floor(p.x/48)+6,Math.round(p.y/48)-1)})()');await pg.wait_for_timeout(6000)
  fr=set()
  for i in range(8):
   fr.add(await E('LV.pFrame'));
   if i%2==0:await pg.screenshot(path=OUT+f'idle_{i//2}.png')
   await pg.wait_for_timeout(700)
  for i in range(40):fr.add(await E('LV.pFrame'));await pg.wait_for_timeout(60)
  check('idle only shows the consistent-face frames 0/1/4',fr<= {'idle_test_1:0','idle_test_1:1','idle_test_1:4'} and len(fr)>1,sorted(fr))
  for g,ids in enumerate(GROUPS):
   r=await E('''ids=>{LV.calm();const p=LV.p;p.inv=99;const out=[];LV.enemies().length=0;ids.forEach((id,i)=>{const e=LV.mkEnemy(id,p.x+95+i*100,p.y,{});e.vx=0;e.x0=e.x1=e.x;LV.enemies().push(e);out.push([id,e.spr,e.sc,e.w,e.h])});return out}''',ids)
   await pg.wait_for_timeout(350);await E('LV.p.inv=0');await pg.screenshot(path=OUT+f'paddy_vs_enemies_{g+1}.png')
   bad=[x for x in r if x[4]<122]
   check(f'group {g+1}: every enemy hitbox/art height >= Paddy (122px)',not bad,r)
  await pg.goto(URL+f'level.html?level=silverdale_7&nocuts&touch&v={time.time()}');await pg.wait_for_function('window.LV&&LV.ready',timeout=30000)
  await E('LV.calm()');await E('LV.teleport(201,9)');await pg.wait_for_timeout(900);await pg.screenshot(path=OUT+'paddy_vs_bruno.png')
  b=await E('LV.boss()');check('Big Bruno stays far bigger than Paddy',b and b['hPx']>=122,b and b['hPx'])
  check('no page errors',not errs,errs);await br.close()
 print('FAILS',FAILS)
asyncio.run(main())
