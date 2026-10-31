# v44 audit fixes (Level Builder's playability audit): no embedding in solid ground (1-1 x127.6 repro + a stand-cell sweep on all 7),
# below-the-map = straight back to dry ground, arena enemies spawn on the arena floor and are not counted twice,
# touch ↺ CHECKPOINT pill, unknown deco characters draw without errors.
import asyncio,json,sys,os,random,time
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev_w1/ta/';os.makedirs(OUT,exist_ok=True)
SIM=os.environ.get('SIMDIR','/workspace/rev_w1/sim')
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300]);(None if ok else FAILS.append(nm))
EMB='(()=>{const p=LV.p;for(let c=Math.floor((p.x-36)/48);c<=Math.floor((p.x+35)/48);c++)for(let r=Math.floor((p.y-166)/48);r<=Math.floor((p.y-3)/48);r++)if("#B?LJ".includes(LV.tile(c,r)))return [c,r];return null})()'
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':960,'height':540});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  E=pg.evaluate
  async def load(n,extra=''):
   await pg.goto(URL+f'level.html?level=silverdale_{n}&nocuts{extra}&v={time.time()}');await pg.wait_for_function('window.LV&&LV.ready',timeout=30000);await pg.wait_for_timeout(400)
  # 1) the live repro: 1-1 at x126.75 used to push him into the ground and out the bottom of the map
  await load(1);await E('LV.calm()');await E('LV.teleport(126.75,8);LV.p.inv=5');await pg.wait_for_timeout(1200)
  st=await E('LV.state()');emb=await E(EMB)
  check('1-1 x127.6 repro: not embedded, still on the map',emb is None and st['y']<=24,[st['x'],st['y'],emb])
  bad=[]
  for k in ['ArrowRight','ArrowLeft','Space','ArrowRight','ArrowLeft']:
   await pg.keyboard.down(k);await pg.wait_for_timeout(500);await pg.keyboard.up(k);await pg.wait_for_timeout(300)
   e=await E(EMB);s=await E('LV.state()')
   if e:bad.append((k,s['x'],s['y'],e))
  check('1-1 repro: walking/jumping around there never embeds',not bad,bad)
  # 2) sweep: reachable stand cells from the sim, walk/jump both ways, sample for embeds every 50 ms
  random.seed(44)
  for n in range(1,8):
   await load(n);await E('LV.calm()')
   # exact standing spots the simulator reached (x in tiles, feet row) -- not cell centres, which can sit under a low overhang
   try:cells=[(d[1],d[2]) for d in json.load(open(f'{SIM}/Q{n}.json'))['dump'] if d[2] is not None and not d[5]]
   except Exception as ex:cells=[];print('no sim cells',n,ex)
   pick=random.sample(cells,min(24,len(cells)));bad=[];below=[]
   for cell in pick:
    c,r=cell
    for keys in (['ArrowRight'],['ArrowLeft'],['ArrowRight','Space'],['ArrowLeft','Space']):
     await E(f'LV.teleport({c}-.5,{r-1});LV.p.inv=5;LV.p.hp=LV.p.max')
     for k in keys:await pg.keyboard.down(k)
     for i in range(6):
      await pg.wait_for_timeout(50);e=await E(EMB)
      if e:bad.append((cell,keys,e));break
     for k in keys:await pg.keyboard.up(k)
   check(f'1-{n} sweep: {len(pick)} stand cells x4 moves, never embedded',not bad,bad[:4])
  # 3) below the map: straight back to dry ground the frame he passes H*TS
  await load(1);await E('LV.calm()');H=json.load(open('levels/silverdale_1.json'))['height']
  await E(f'(()=>{{const p=LV.p;p.x=40.5*48;p.y={H}*48+20;p.vy=200;p.state="normal";LV.events.length=0}})()');await pg.wait_for_timeout(60)
  s=await E('LV.state()');check('fell below the map -> back on dry ground at once',s['y']<20 and any('SPLASH' in m for m in await E('LV.events.slice(-5)')),[s['x'],s['y']])
  # 4) arenas: an arena's own enemies are not placed twice, and spawn on its floor
  for n in (1,4,7):
   await load(n)
   lv=json.load(open(f'levels/silverdale_{n}.json'))
   ents=[e for e in lv['entities'] if e['type']=='enemy']
   start=await E('LV.enemies().length')
   claimed=0
   for a in lv['arenas']:
    want=list(a['enemies'])
    for e in ents:
     if a['x0']<=e['x']<=a['x1'] and e['id'] in want:want.remove(e['id']);claimed+=1
   check(f'1-{n}: arena enemies not pre-placed (start {start} = {len(ents)} entities - {claimed} arena-owned)',start==len(ents)-claimed,start)
   a=lv['arenas'][0];await E(f'LV.teleport({a["x0"]+3},{a["y"]})');await pg.wait_for_timeout(1500)
   ar=await E('(()=>{const a=LV.arenas().find(q=>q.state==="lock");if(!a)return null;return {n:a.list.length,ys:a.list.filter(e=>!e.fly).map(e=>Math.round(e.y)),fl:(a.y+1)*48,alive:a.list.filter(e=>e.alive).length}})()')
   ok=ar and ar['n']==len(a['enemies']) and all(abs(y-ar['fl'])<=48*3 for y in ar['ys'])
   check(f'1-{n} arena "{a["name"]}": {len(a["enemies"])} enemies once, standing near its floor',ok,ar)
  # 5) the touch ↺ CHECKPOINT pill
  await load(1,'&touch');vis=await E("(()=>{const b=document.getElementById('trestart');if(!b)return null;const r=b.getBoundingClientRect();return [r.width>0&&r.height>0,b.textContent]})()")
  check('touch ↺ CHECKPOINT pill shows',vis and vis[0],vis)
  await E('LV.calm();LV.teleport(60,8)');await pg.wait_for_timeout(300);await pg.click('#trestart',force=True);await pg.wait_for_timeout(300)
  s=await E('LV.state()');check('tap ↺ = back to the last checkpoint',('restart:cp' in s['log']) and abs(s['x']-60.5)>2,[s['x'],s['log'][-3:]])
  await pg.screenshot(path=OUT+'restart_pill.png')
  # 6) deco: draw every level once at a few camera spots, no errors
  for n in range(1,8):
   await load(n)
   for x in (10,60,120,180):
    await E(f'LV.teleport({x},2)');await pg.wait_for_timeout(120)
   await pg.screenshot(path=OUT+f'deco_{n}.png')
  check('no page errors',not errs,errs[:3])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
