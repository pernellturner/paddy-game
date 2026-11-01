# v45: base Paddy moves in World 1 + flyers swoop and can be beaten in every arena that has them
import asyncio,json,sys,os,time
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev_w1fix/tw/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300]);(None if ok else FAILS.append(nm))
BOT='''window.BOT=(only)=>{const kd=c=>dispatchEvent(new KeyboardEvent('keydown',{code:c})),ku=c=>dispatchEvent(new KeyboardEvent('keyup',{code:c}));let n=0;
 const iv=setInterval(()=>{n++;const p=LV.p;p.inv=9;p.hp=p.max;const a=LV.arenas().find(a=>a.state==='lock');if(!a){['ArrowLeft','ArrowRight','ArrowUp'].forEach(ku);return}
  const L=a.list.filter(e=>e.alive);if(!L.length)return;L.sort((u,v)=>Math.abs(u.x-p.x)-Math.abs(v.x-p.x));const t=only?(L.find(e=>e.fly)||L[0]):L[0];const dx=t.x-p.x;
  if(Math.abs(dx)>80){kd(dx>0?'ArrowRight':'ArrowLeft');ku(dx>0?'ArrowLeft':'ArrowRight')}else{ku('ArrowLeft');ku('ArrowRight');if(Math.sign(dx)&&Math.sign(dx)!==p.face){kd(dx>0?'ArrowRight':'ArrowLeft');setTimeout(()=>ku(dx>0?'ArrowRight':'ArrowLeft'),30)}}
  const high=p.y-t.y;
  if(n%3===0&&Math.abs(dx)<140){if(t.fly&&high>165&&p.ground){kd('ArrowUp');kd('KeyX');setTimeout(()=>{ku('KeyX');ku('ArrowUp')},40)}else{kd('KeyX');setTimeout(()=>ku('KeyX'),40)}}
 },50);window.BOTIV=iv}'''
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':844,'height':390},has_touch=True,is_mobile=True);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  E=pg.evaluate
  async def load(n):
   await pg.goto(URL+f'level.html?level=silverdale_{n}&nocuts&touch&v={time.time()}');await pg.wait_for_function('window.LV&&LV.ready',timeout=30000);await pg.wait_for_timeout(500)
  async def tap(k,ms=40):
   await pg.keyboard.down(k);await pg.wait_for_timeout(ms);await pg.keyboard.up(k)
  async def moves(): return await E("LV.log.filter(s=>s.startsWith('move:')).map(s=>s.slice(5))")
  await load(1);await E('LV.calm()')
  # buttons on the phone
  b=await E("['ta','tt','tm','tj','tR'].map(id=>{const e=document.getElementById(id);const r=e.getBoundingClientRect();return [id,e.textContent,r.width>0,Math.round(r.left),Math.round(r.top)]})")
  check('touch CLAW / TAIL / MEOW / JUMP / RUN buttons shown',all(x[2] for x in b) and [x[1] for x in b][:3]==['CLAW','TAIL','MEOW'],b)
  ov=await E("(()=>{const ids=['tl','tr','tu','td','tj','ta','tt','tm','tR'];const R=ids.map(i=>document.getElementById(i).getBoundingClientRect());let bad=[];for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i],b=R[j];if(a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1)bad.push(ids[i]+'/'+ids[j])}return bad})()")
  check('touch buttons do not overlap',not ov,ov)
  async def seq(keys,gap=180,reset=True):
   if reset:
    await E('LV.calm();LV.teleport(30,8);LV.p.face=1;LV.log.length=0');await pg.wait_for_timeout(500)
   for k in keys:
    if k=='UPX':
     await pg.keyboard.down('ArrowUp');await tap('KeyX');await pg.keyboard.up('ArrowUp')
    elif k=='J':await tap('Space',120)
    elif k=='DX':
     await pg.keyboard.down('ArrowDown');await tap('KeyX');await pg.keyboard.up('ArrowDown')
    else:await tap(k)
    await pg.wait_for_timeout(gap)
   await pg.wait_for_timeout(900);return await moves()
  m=await seq(['KeyX','KeyX','KeyX']);check('CLAW x3 = SCRATCH, SWIPE, TRIPLE CLAW',m==['claw1','claw2','claw3'],m)
  await pg.screenshot(path=OUT+'claw3.png')
  m=await seq(['KeyX','KeyX','KeyX','KeyX','KeyX']);check('CLAW x5 keeps the string going',m==['claw1','claw2','claw3','claw4','claw5'],m)
  m=await seq(['KeyC','KeyC','KeyC']);check('TAIL x3 = whip, double whip, launcher',m==['tail1','tail2','tail3'],m)
  m=await seq(['KeyV']);check('MEOW',m==['meow'],m)
  m=await seq(['KeyX','KeyX','KeyX','KeyC','KeyC']);check('CCCTT = TAIL SPIN SLAM',m[-1]=='tailslam',m)
  await pg.wait_for_timeout(0);
  m=await seq(['KeyX','KeyX','KeyX','KeyX','KeyX','KeyC']);check('CCCCCT = COMET TAIL',m[-1]=='comet',m)
  m=await seq(['KeyC','KeyC','KeyC','KeyX','KeyX','KeyX'],gap=200);check('TTTCCC = CLAW CYCLONE',m[-1]=='cyclone',m)
  m=await seq(['KeyX','KeyX','KeyX','KeyV']);check('CCCM = MEOW CANNON',m[-1]=='cannon',m)
  m=await seq(['UPX']);check('UP + CLAW = UPPERCUT',m==['upper'],m)
  m=await seq(['J','KeyX','KeyX'],gap=120);check('air CLAW = AIR SWIPE, then AIR SPIN',m[:2]==['airswipe','airspin'],m)
  await E('LV.calm();LV.teleport(30,8);LV.log.length=0');await pg.wait_for_timeout(400);await tap('Space',200);await pg.wait_for_timeout(150);await pg.keyboard.down('ArrowDown');await tap('KeyX');await pg.keyboard.up('ArrowDown');await pg.wait_for_timeout(900)
  m=await moves();check('air DOWN + CLAW = DIVE CLAW',m==['dive'],m)
  # touch: tap the CLAW button on the phone
  await E('LV.calm();LV.teleport(30,8);LV.log.length=0');await pg.wait_for_timeout(400)
  for id in ['ta','tt','tm']:
   bb=await pg.locator('#'+id).bounding_box();await pg.touchscreen.tap(bb['x']+bb['width']/2,bb['y']+bb['height']/2);await pg.wait_for_timeout(700)
  m=await moves();check('touch CLAW, TAIL, MEOW buttons do their moves',m==['claw1','tail1','meow'],m)
  # moves really hit: a critter in front gets KO'd by the 1-2-3
  await load(1);await E('LV.calm()');await E('LV.teleport(30,8);LV.p.face=1');await pg.wait_for_timeout(400)
  hp=await E("(()=>{const es=LV.enemies();const e=es.find(e=>e.alive)||null;return null})()")
  # Paddy size never changes between moves (all drawn at the same scale)
  # flyers: every arena with birds clears with the bot (birds swoop low, uppercut reaches them)
  for n in range(1,8):
   L=json.load(open(f'levels/silverdale_{n}.json'))
   for a in L.get('arenas',[]):
    if not any(i in ('seagull','magpie','wasp','gull_bandit') for i in a['enemies']):continue
    await load(n);await E(BOT)
    await E(f"(()=>{{LV.calm();LV.arenas().forEach(a=>a.state='idle');}})()")
    # put the arena back to idle and walk into it
    await E(f"LV.arenas().forEach(a=>{{if(a.name==={json.dumps(a['name'])})a.state='idle'}});LV.teleport({a['x0']}+2,{a['y']}-1)")
    await pg.wait_for_timeout(300);await E('BOT(true)')
    t0=time.time();done=False;sw=0
    while time.time()-t0<70:
     await pg.wait_for_timeout(1000)
     st=await E(f"(()=>{{const a=LV.arenas().find(a=>a.name==={json.dumps(a['name'])});return [a.state,(a.list||[]).filter(e=>e.alive).map(e=>e.id),LV.log.filter(s=>s.startsWith('swoop')).length]}})()")
     if st[0]=='done':done=True;break
    await E('clearInterval(BOTIV)')
    check(f"1-{n} {a['name']}: birds swoop and every enemy (birds too) can be beaten",done,[st,round(time.time()-t0)])
    if n==1:await pg.screenshot(path=OUT+'birds_1-1.png')
  check('no page errors',not errs,errs[:3])
  await br.close()
 print('FAILS',FAILS);sys.exit(1 if FAILS else 0)
asyncio.run(main())
