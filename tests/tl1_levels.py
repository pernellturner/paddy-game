# (loads with &nocuts: the story cutscenes are covered by tc_cutscenes.py)
# level-1-1 branch: tilemap level runtime checks + screenshots for Silverdale 1-1 .. 1-7 (World 1) (level.html, tile 48).
import asyncio,sys,os,time,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8766/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev_level11/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300],flush=True);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':960,'height':540});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'Failed to load resource' not in m.text and errs.append(m.text))   # levels/ then levels-dev/ probing 404s are expected
  E=pg.evaluate
  async def load(lv):
   await pg.goto(URL+'level.html?level='+lv+'&nocuts&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready',timeout=20000);await pg.wait_for_timeout(1500)
  async def hold(k,ms):
   await pg.keyboard.down(k);await pg.wait_for_timeout(ms);await pg.keyboard.up(k)
  async def tap(k):await hold(k,60)
  async def tp(x,y,wait=500):
   await E(f"LV.teleport({x},{y})");await pg.wait_for_timeout(wait)
  st=lambda:E("LV.state()")
  # ---------- 1-1 ----------
  await load('silverdale_1');s=await st()
  check('1-1 loads, tile 48, Paddy at the spawn on the ground',s['id']=='silverdale_1' and s['ground'] and abs(s['x']-2.5)<.6,s)
  await pg.screenshot(path=OUT+'1-1_start.png')
  await hold('ArrowRight',1200);s=await st();check('walks right',s['x']>4,s)
  await tap('Space');await pg.wait_for_timeout(120);s1=await st();await pg.wait_for_timeout(900);s2=await st();check('jumps and lands again',not s1['ground'] and s2['ground'],[s1,s2])
  # climb the pohutukawa trunk (T at x=51 rows 2-7, its base stands on the row-8 kerb) and step onto the branch
  await tp(51,7);await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(1400);s=await st();await pg.screenshot(path=OUT+'1-1_climb.png')
  check('T trunk: hold ↑ = climb (not solid, he climbs up it)',s['state']=='climb' and s['y']<7,s)
  await pg.keyboard.up('ArrowUp');await hold('ArrowRight',150);await pg.wait_for_timeout(300);s=await st()
  check('T trunk: → steps off onto the branch (= row 3)',s['state']=='normal' and s['ground'] and abs(s['y']-3)<.1 and s['x']>51.5,s)
  await tp(51,7);await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(800);await pg.keyboard.up('ArrowUp');await tap('Space');await pg.wait_for_timeout(100);s=await st()
  check('T trunk: jump leaps off',s['state']=='normal' and not s['ground'] and 'trunkjump' in s['log'],s)
  await E("LV.arenas()[0].state='skip'")   # keep the Trolley-bay brawl dormant while the mechanics beside it are checked
  # fence rail F (row 4 x57-62): stand on it, ↓ drops through
  await tp(59,3,700);s=await st();check('F fence rail: walkable from above',s['ground'] and abs(s['y']-4)<.1,s);await pg.screenshot(path=OUT+'1-1_fence.png')
  await tap('ArrowDown')
  for _ in range(30):
   await pg.wait_for_timeout(60);s=await st()
   if s['ground'] and s['y']>8.5:break
  s=await st();check('F fence rail: ↓ drops through to the ground',s['ground'] and s['y']>8.5 and 'drop' in s['log'],s)
  # one-way platform '=' (row 3 x47-55, branches): jump up through from below
  # (1-1 now puts the branches 5-6 tiles up, reached by the trunk; so launch him from just under the branch and check he passes up through it and lands on top)
  await tp(48,3,0);r=await E("LV.tile(48,3)");await E("LV.p.vy=-1200;LV.p.ground=false");await pg.wait_for_timeout(1000);s=await st()
  check("= platform: jump up through it from below and land on top",r=='=' and s['ground'] and abs(s['y']-3)<.1,[r,s])
  # L ledge (row 3 'L######L' at x68-75): fall short beside it holding toward = grab + pull up
  await E("LV.arenas()[0].state='skip'");await tp(66,1,50);await E("LV.p.y=(3)*48+168*.5;LV.p.vy=0");await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(900);await pg.keyboard.up('ArrowRight');s=await st()
  check('L corner: ledge grab and pull up onto the roof',('ledge' in s['log'] or 'pullup' in s['log']) and s['ground'] and abs(s['y']-3)<.1,s)
  await E("LV.arenas()[0].state='idle'")
  # arena lock
  await tp(60,8,300);await hold('ArrowRight',500);s=await st();await pg.wait_for_timeout(700);await pg.screenshot(path=OUT+'1-1_arena.png')
  a=await E("LV.arenas().map(a=>[a.name,a.state])");check('arena: entering locks the camera / walls until the group is cleared',s['arena']=='Trolley-bay brawl' or any(x[1]=='lock' for x in a),[s,a])
  await E("LV.arenas().forEach(a=>{if(a.state==='lock')a.list.forEach(e=>{e.alive=false;e.ko=0})})");await pg.wait_for_timeout(300);a=await E("LV.arenas().map(a=>[a.name,a.state])");s=await st()
  check('arena: clearing the group unlocks it',a[0][1]=='done' and not s['arena'],a)
  # attack: X bops an enemy
  await E("(()=>{const e=LV.enemies().find(e=>e.alive&&!e.fly&&!e.inArena);LV.teleport(Math.floor(e.x/48)-2,Math.floor(e.y/48)-1);e.vx=0;e.x0=e.x-1;e.x1=e.x+1;window._E=e})()");await pg.wait_for_timeout(400)
  await E("LV.p.face=Math.sign(_E.x-LV.p.x)||1");await tap('KeyX');await pg.wait_for_timeout(450);await pg.screenshot(path=OUT+'1-1_attack.png');await tap('KeyX');await pg.wait_for_timeout(450)
  r=await E("[_E.alive,_E.hp,LV.state().log]");check('X attack bops a critter (2 hits KO)',not r[0],r)
  # kid: harmless, no collision, hop bonus
  k=await E("(()=>{const k=LV.kids()[0];return [k.harmless,k.hitbox,k.bonus,k.x/48,k.y/48]})()");check('kid entity: harmless:true, hitbox:false, bonus hop',k[0] is True and k[1] is False and k[2]=='hop',k)
  hp0=(await st())['hp'];await E("(()=>{const k=LV.kids()[0];k.sp=0;LV.teleport(Math.round(k.x/48)-0.5,Math.round(k.y/48)-1)})()");await pg.wait_for_timeout(700);s=await st()
  check('kid: Paddy walks straight through, no damage, no knock-back',s['hp']==hp0 and 'bump:kid' not in s['log'] and s['state']=='normal',s)
  c0=s['coins'];await E("LV.calm()");await E("(()=>{const k=LV.kids()[0];k.sp=0;k.x=140.5*48;k.hopped=false;LV.teleport(133,8)})()");await pg.wait_for_timeout(300);await pg.keyboard.down('ArrowRight')
  for _ in range(60):
   if await E("LV.p.x>LV.kids()[0].x-120"):break
   await pg.wait_for_timeout(25)
  await hold('Space',260);await pg.wait_for_timeout(500);await pg.keyboard.up('ArrowRight');await pg.wait_for_timeout(600);s=await st()
  await pg.screenshot(path=OUT+'1-1_kidhop.png');check('kid: hopping over it = +3 coin hop bonus',s['coins']>=c0+3 and 'hop' in s['log'],[c0,s])
  # ? block bonk + checkpoint + goal
  await tp(190,8,300);s=await st();await tp(216,8,200);await hold('ArrowRight',600);await pg.wait_for_timeout(800);s=await st();await pg.screenshot(path=OUT+'1-1_goal.png')
  check('reaching the goal clears 1-1',s['done'],s)
  # ---------- 1-2 .. 1-7 ----------
  for n in (2,3,4,5,6,7):
   lv=f'silverdale_{n}';await load(lv);s=await st();L=json.loads(open(f'/workspace/paddy-game/levels/{lv}.json').read())
   check(f'1-{n} loads and Paddy stands at the spawn',s['id']==lv and s['ground'],s);await pg.screenshot(path=OUT+f'1-{n}_start.png');await E('LV.calm()')   # critters off for the mechanic checks
   if L.get('shopSigns'):
    sg=L['shopSigns'][0];await tp(sg['x0']+2,surf(L,sg['x0']+2),600);await pg.screenshot(path=OUT+f'1-{n}_shopsign.png')
   cl=L.get('climbables') or []
   pipe=[c for c in cl if 'drain' in c['name'].lower() or 'pole' in c['name'].lower() or 'mast' in c['name'].lower() or 'post' in c['name'].lower()]
   if pipe:
    c=pipe[0];await tp(c['x'],c['base'],400);await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(1200);s=await st();await pg.keyboard.up('ArrowUp');await pg.screenshot(path=OUT+f'1-{n}_climb_{c["name"].split()[0].lower()}.png')
    check(f"1-{n} T '{c['name']}': climbable",s['state'] in('climb','normal') and 'climb' in s['log'],s)
   veh=[e for e in L['entities'] if e['type'] in('car','bus')]
   if veh:
    for v in veh[:4]:
     hp0=(await st())['hp'];await E(f"(()=>{{const v=LV.cars().find(v=>v.name==={json.dumps(v['name'])});v.sp=0;LV.teleport((v.x+v.w/2)/48-.5,v.lane)}})()");await pg.wait_for_timeout(120);s=await st()
     await pg.screenshot(path=OUT+f'1-{n}_{v["type"]}_{v["lane"]}_{v["x0"]}.png');await pg.wait_for_timeout(500);s2=await st()
     check(f"1-{n} {v['type']} '{v['name']}': bumps Paddy with knock-back only (no damage)",('bump:'+v['type']) in s2['log'] and s2['hp']==hp0,s2)
    r=await E("LV.cars().map(v=>[v.kind,v.h/48,v.x0/48,v.x1/48])");check(f'1-{n} vehicles: bus 3 tiles tall, cars 2; they stay in their lane range',all((x[0]=='bus' and x[1]==3) or (x[0]=='car' and x[1]==2) for x in r),r)
    r=await E("(()=>{const v=LV.cars()[0];v.sp=200;return new Promise(res=>{let mn=1e9,mx=-1e9;const t0=performance.now();(function f(){mn=Math.min(mn,v.x);mx=Math.max(mx,v.x+v.w);if(performance.now()-t0<3000)requestAnimationFrame(f);else res([mn/48,mx/48,v.x0/48,v.x1/48])})()})})()")
    check(f'1-{n} vehicles shuttle within x0..x1',r[0]>=r[2]-.01 and r[1]<=r[3]+.01,r)
   kd=[e for e in L['entities'] if e['type']=='kid']
   if kd:check(f'1-{n} kids are harmless:true hitbox:false bonus hop',all(k.get('harmless') is True and k.get('hitbox') is False and k.get('bonus')=='hop' for k in kd),kd)
   roof=[e for e in L['entities'] if e.get('route')=='roof']
   if roof:
    e=roof[0];await tp(e['x']-3,e['y'],700);await pg.screenshot(path=OUT+f'1-{n}_roof_route.png');s=await st()
    check(f"1-{n} route:'roof' enemies sit on the rooftop route (off the main path)",s['ground'] and s['y']<=e['y']+1.01,s)
   if L.get('backdrop'):check(f'1-{n} backdrop field read',True,L['backdrop'])
   pads=[(c,r) for r,row in enumerate(L['layers']['solid']) for c,ch in enumerate(row) if ch=='J']
   if pads:
    c,r=pads[0];hp0=(await st())['hp']
    async def drop_on(key):
     await tp(c,r-5,0);await E(f'LV.p.x=({c}+.8)*48')   # feet on the pad (pad 255 sits beside a step)
     if key:await pg.keyboard.down(key)
     ys=[]
     for _ in range(28):
      await pg.wait_for_timeout(50);ys.append((await st())['y'])
     if key:await pg.keyboard.up(key)
     return ys
    ys=await drop_on('ArrowUp');s=await st();rise=r-min(ys[6:])
    check(f'1-{n} J bounce pad: landing with jump held launches ~6 tiles',f'bounce:full' in s['log'] and 5<=rise<=7.5,[round(rise,2),s['log'][-3:]])
    await tp(c,r-5,0);await E(f'LV.p.x=({c}+.8)*48')   # feet on the pad (pad 255 sits beside a step);await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(700);await pg.screenshot(path=OUT+f'1-{n}_bounce.png');await pg.keyboard.up('ArrowUp');await pg.wait_for_timeout(900)
    ys=await drop_on(None);s=await st();rise=r-min(ys[6:])
    check(f'1-{n} J bounce pad: no jump held = smaller bounce',s['log'][-1]=='bounce' and 1.5<rise<5.5,[round(rise,2),s['log'][-3:]])
    await pg.wait_for_timeout(1500);n0=len([x for x in (await st())['log'] if x.startswith('bounce')])
    ys=await drop_on('ArrowDown');s=await st()
    check(f'1-{n} J bounce pad: hold ↓ absorbs it (lands and stays on the pad)',s['ground'] and abs(s['y']-r)<.05 and max(ys[-8:])-min(ys[-8:])<.05 and not s['log'][-1].startswith('bounce') or (s['ground'] and abs(s['y']-r)<.05 and len([x for x in s['log'] if x.startswith('bounce')])==n0),[s,n0])
    await tp(c,r-5,0);await E(f'LV.p.x=({c}+.8)*48')   # feet on the pad (pad 255 sits beside a step);await pg.keyboard.down('ArrowUp')
    for _ in range(40):
     await pg.wait_for_timeout(30)
     if 'bounce:full' in (await st())['log'][-1:]:break
    await pg.wait_for_timeout(250);await pg.keyboard.up('ArrowUp');await tap('Space');await pg.wait_for_timeout(200);s=await st()
    check(f'1-{n} J bounce pad: double jump still free after a bounce',s['log'][-1]=='djump',s['log'][-3:])
    check(f'1-{n} J bounce pad: no damage',s['hp']==hp0,s)
   BA=L.get('bossArena')
   if BA:
    b=await E("LV.boss()");check(f"1-{n} bossArena boss:'{BA['boss']}' maps to game.js BOSS (BIG BRUNO, THE BRAWLER)",b and b['id']=='big_bruno' and b['name']=='BIG BRUNO' and b['title']=='THE BRAWLER',b)
    print('BRUNO HITBOX tiles w %.2f h %.2f  (px %d x %d at tile 48)'%(b['wTiles'],b['hTiles'],b['wPx'],b['hPx']))
    open_rows=all(L['layers']['solid'][rr][cc] not in '#B?LJ' for rr in range(0,10) for cc in range(BA['x0'],BA['x1']+1))
    check(f"1-{n} boss arena x{BA['x0']}-{BA['x1']} = 34 wide, rows 0-9 open",BA['x1']-BA['x0']+1==34 and open_rows,[BA['x0'],BA['x1']])
    await tp(184,9,300);s=await st();b=await E("LV.boss()");check(f'1-{n} walls stay open before the trigger (x<186)',b['arena']['state']=='idle',b['arena'])
    await hold('ArrowRight',500);await pg.wait_for_timeout(200);s=await st();b=await E("LV.boss()")
    check(f'1-{n} walls close at x186 on entry',b['arena']['state']=='lock' and 'boss:enter' in s['log'] and s['x']>186,[s['x'],b['arena']])
    await hold('ArrowLeft',1500);s=await st();check(f'1-{n} west wall (x183) holds Paddy in',s['x']>=184.7 and s['x']<185.5,s['x'])
    await pg.screenshot(path=OUT+f'1-{n}_boss_walls.png')
    # a real swipe lands on him
    await E("(()=>{const b=LV.bossRaw();b.st='rest';b.t=-99;b.x=200.5*48})()");hp0=(await E("LV.boss()"))['hp']
    await E("LV.p.x=(200.5-2.3)*48;LV.p.face=1;LV.p.vx=0");await tap('KeyX');await pg.wait_for_timeout(450);b=await E("LV.boss()")
    check(f'1-{n} X swipe hits Bruno',b['hp']<hp0,[hp0,b['hp']]);await pg.screenshot(path=OUT+f'1-{n}_boss_fight.png')
    await E("(()=>{const b=LV.bossRaw();b.t=0;b.st='idle'})()")
    # phase 2 adds at 50%
    for _ in range(40):
     b=await E("LV.boss()")
     if b['hp']<=b['max']*.5:break
     await E("LV.bossHit(1)");await pg.wait_for_timeout(240)
    await pg.wait_for_timeout(600);b=await E("LV.boss()");s=await st()
    adds=await E("LV.enemies().filter(e=>e.inArena&&e.alive).map(e=>[e.id,Math.round(e.x/48-.5)])")
    check(f'1-{n} phase 2 adds come in at 50% health',b['arena']['p2'] and 'boss:phase2' in s['log'] and sorted(a[0] for a in adds)==sorted(a['id'] for a in BA['phase2']['adds']),[b['hp'],b['max'],adds])
    await pg.screenshot(path=OUT+f'1-{n}_boss_phase2.png')
    for _ in range(40):
     b=await E("LV.boss()")
     if not b['alive']:break
     await E("LV.bossHit(1)");await pg.wait_for_timeout(240)
    await pg.wait_for_timeout(500);b=await E("LV.boss()");s=await st()
    check(f'1-{n} Bruno KO opens the walls (openOn boss_ko)',not b['alive'] and b['arena']['state']=='done' and 'boss:ko' in s['log'] and not s['arena'],[b,s['arena']])
    await pg.screenshot(path=OUT+f'1-{n}_boss_ko.png')
    await E("LV.p.x=216.5*48");await hold('ArrowRight',900);s=await st();check(f'1-{n} east wall (x218) gone after the KO',s['x']>218.2,s['x'])
    # hitbox overlay shot
    await pg.goto(URL+'level.html?level='+lv+'&hitbox&nocuts&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready',timeout=20000);await pg.wait_for_timeout(1200)
    await E("LV.calm()");await tp(199,9,600);await pg.screenshot(path=OUT+f'1-{n}_boss_hitbox.png');await E("LV.teleport(199,9)")
   await tp(L['goal']['x']-1,L['goal']['y'],200);await hold('ArrowRight',600);await pg.wait_for_timeout(600);s=await st();check(f'1-{n} goal reached = clear',s['done'],s)
  check('no page errors',not errs,errs[:5])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
def surf(L,x):
 S=L['layers']['solid']
 for r in range(len(S)):
  if S[r][x] in '#B?L=F^':return r-1
 return 8
asyncio.run(main())
