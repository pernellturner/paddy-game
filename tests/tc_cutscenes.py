# level-1-1 branch: Story Studio W1 cutscene player (cutscene.js) + level triggers, boss reward, secret_paw / mission_gift entities.
# Screenshots (default /workspace/rev_cuts/): the player at 1024x340 (phone landscape), 960x540 and 390x844, plus a map hop.
import asyncio,sys,os,time
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8766/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev_cuts/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300],flush=True);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},has_touch=True);pg=await ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'Failed to load resource' not in m.text and errs.append(m.text))
  E=pg.evaluate
  async def load(q):
   await pg.goto(URL+'level.html?'+q+'&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready&&window.CUT',timeout=20000);await pg.wait_for_timeout(600)
  # every panel file is there and loads
  await load('level=silverdale_1&nocuts')
  r=await E("Promise.all(Object.values(CUT_SCENES).flatMap(s=>s.panels).filter(p=>p.img).map(p=>new Promise(res=>{const i=new Image();i.onload=()=>res([p.img,i.naturalWidth,i.naturalHeight]);i.onerror=()=>res([p.img,0,0]);i.src='assets/story/'+p.img+'.webp'})))")
  check('13 W1 panels, all 1280x720 webp',len(r)==13 and all(x[1]==1280 and x[2]==720 for x in r),r)
  r=await E("Object.entries(CUT_TRIGGERS).map(([k,v])=>k+'='+v.join('+'))");check('11 play-order steps on 9 triggers',sum(len(x.split('=')[1].split('+')) for x in r)==11 and len(r)==9,r)
  order=await E("['silverdale_1:goal','silverdale_2:goal','silverdale_3:goal','silverdale_4:goal','silverdale_5:goal','silverdale_6:goal','silverdale_7:boss_enter','silverdale_7:boss_ko','silverdale_7:goal'].flatMap(k=>CUT_TRIGGERS[k]||[])")
  check('play order C1, U01, C2, C3, C4, U02, C6, B1, A1, U03, X (no map hops left)',order==['w1c1','w1u01','w1c2','w1c3','w1c4','w1u02','w1c6','w1b1','w1a1','w1u03','w1x'],order)
  # preview + screenshots at 1024x340 (side layout), each panel
  await E("localStorage.removeItem('paddyStory')")
  await load('level=silverdale_1&cut=w1c1,w1u01,w1c2,w1c3,w1c4,w1u02,w1c6,w1b1,w1a1,w1u03,w1x');await pg.wait_for_function('CUT.playing');await pg.wait_for_timeout(1200)
  shots=[];i=0
  while True:
   s=await E("CUT.state()")
   if not s['playing']:break
   fn=OUT+f"1024x340_{i+1:02d}_{s['scene']}_{s['panel']}.png";await pg.screenshot(path=fn);shots.append(fn)
   await pg.touchscreen.tap(400,170);await pg.wait_for_timeout(900);i+=1
   if i>20:break
  check('tap advances through all 13 panels in play order, then closes',i==13 and 'preview:done' in await E("CUT.log"),[i,shots[-1:]])
  r=await E("JSON.parse(localStorage.getItem('paddyStory')).story");check('scenes seen + unlock flags saved (Kitty gloves, Ninja)','kitty_boxing_gloves' in r['flags'] and 'form_ninja' in r['flags'] and 'kitty_champ_sweatband' in r['flags'] and len(r['seen'])==11,r)
  # keyboard + skip
  await load('level=silverdale_1&cut=w1c3,w1b1');await pg.wait_for_function('CUT.playing');await pg.wait_for_timeout(500)
  await pg.keyboard.press('Space');await pg.wait_for_timeout(500);s=await E("CUT.state()");check('Space = next panel',s['idx']==1,s)
  await pg.keyboard.press('Enter');await pg.wait_for_timeout(500);s=await E("CUT.state()");check('Enter = next panel',s['idx']==2 and s['scene']=='w1b1',s)
  await pg.keyboard.press('Escape');await pg.wait_for_timeout(300);s=await E("CUT.state()");check('Esc skips the rest',not s['playing'],s)
  await load('level=silverdale_1&cut=w1b1');await pg.wait_for_function('CUT.playing');await pg.wait_for_timeout(500)
  await pg.tap('#cutskip');await pg.wait_for_timeout(300);s=await E("[CUT.state().playing,CUT.log.slice(-2)]");check('SKIP button (touch) skips',s[0]==False and 'skip' in s[1],s)
  # other sizes
  for (w,h) in [(960,540),(390,844),(1024,340)]:
   await pg.set_viewport_size({'width':w,'height':h});await load('level=silverdale_1&cut=w1u02');await pg.wait_for_timeout(1300);fn=OUT+f'{w}x{h}_w1u02_card.png';await pg.screenshot(path=fn);shots.append(fn)
  for k in ('w1c2','w1c4','w1c6'):
   await load('level=silverdale_1&cut='+k);await pg.wait_for_timeout(2600);fn=OUT+f'1024x340_{k}_end.png';await pg.screenshot(path=fn);shots.append(fn)
  # level triggers: goal of 1-1 plays W1-C1 then W1-U01, the level is paused and keys don't move Paddy; mission fires after
  await load('level=silverdale_1')
  await E("(()=>{LV.calm();LV.level.mission='w2-stray';const g=LV.level.goal;LV.teleport(g.x+1,g.y)})()");await pg.wait_for_timeout(700)
  s=await E("[CUT.state(),LV.pause,LV.log.slice(-3),!!LV.mission]");check('1-1 goal plays W1-C1, level paused, mission waits',s[0]['playing'] and s[0]['scene']=='w1c1' and s[1] and 'cut:goal' in s[2] and not s[3],s)
  x0=await E("LV.p.x");await pg.keyboard.down('ArrowLeft');await pg.wait_for_timeout(400);await pg.keyboard.up('ArrowLeft');s=await E("[LV.p.x,CUT.state().idx]");check('game keys are swallowed while it plays (Paddy does not move)',s==[x0,0],[x0,s])
  await pg.keyboard.press('Space');await pg.wait_for_timeout(400);s=await E("CUT.state()");check('then W1-U01 (Kitty · Boxing Gloves)',s['scene']=='w1u01',s)
  await pg.keyboard.press('Space');await pg.wait_for_timeout(500);s=await E("[CUT.state().playing,LV.pause,LV.mission&&LV.mission.ok,LV.mission&&LV.mission.formKey,!!document.getElementById('giftpop')]")
  check('after the last panel: resumes, then the mission gift fires (Light Paddy pending)',s==[False,False,True,'lp',True],s);await pg.wait_for_timeout(4200)
  # 1-7: boss enter -> W1-B1, KO -> W1-A1 + W1-U03 with the Ninja reward
  await load('level=silverdale_7');await E("LV.calm()");await E("LV.teleport(184,9)");await pg.wait_for_timeout(300)
  await pg.keyboard.down('ArrowRight');await pg.wait_for_timeout(500);await pg.keyboard.up('ArrowRight');await pg.wait_for_timeout(400)
  s=await E("[CUT.state(),LV.boss().arena.state]");check('1-7 boss arena entry plays W1-B1 (walls closed)',s[0]['playing'] and s[0]['scene']=='w1b1' and s[1]=='lock',s)
  await E("CUT.skip()");await pg.wait_for_timeout(300)
  await E("(()=>{for(let i=0;i<20;i++){LV.bossRaw().inv=0;LV.bossHit(1)}})()");await pg.wait_for_timeout(500)
  s=await E("[CUT.state(),LV.reward,JSON.parse(localStorage.getItem('paddyStory')).baseGot,MISSION.baseUnlocked('ninja'),!!document.getElementById('rewardpop')]")
  check('Big Bruno K.O.: W1-A1 plays, Ninja reward saved (no extra popup, the cutscene shows the card)',s[0].get('scene')=='w1a1' and s[1]['form']=='ninja' and s[1]['first'] and s[2]==['ninja'] and s[3] and not s[4],s)
  await pg.keyboard.press('Space');await pg.wait_for_timeout(1000);s=await E("CUT.state()");fn=OUT+'1024x340_trigger_w1u03_ninja.png';await pg.screenshot(path=fn);shots.append(fn)
  check('…then W1-U03 NEW FORM! Ninja',s['scene']=='w1u03',s);await pg.keyboard.press('Space');await pg.wait_for_timeout(300)
  r=await E("[MISSION.bossReward('big_bruno').first,(()=>{const d=JSON.parse(localStorage.getItem('paddyStory'));d.baseGot=[];d.forms=[];d.exp=2500;localStorage.setItem('paddyStory',JSON.stringify(d));return MISSION.baseUnlocked('ninja')})(),(()=>{const d=JSON.parse(localStorage.getItem('paddyStory'));d.forms=[];d.exp=2499;localStorage.setItem('paddyStory',JSON.stringify(d));return MISSION.baseUnlocked('ninja')})()]")
  check('reward only once; EXP route (2,500) also unlocks Ninja',r==[False,True,False],r)
  await E("(()=>{const g=LV.level.goal;LV.teleport(g.x+1,g.y)})()");await pg.wait_for_timeout(600);s=await E("CUT.state()");check('1-7 goal plays W1-X',s.get('scene')=='w1x',s);await E("CUT.skip()")
  # secret_paw + mission_gift entities (injected into a level JSON at runtime)
  await E("localStorage.removeItem('paddyStory')")
  await load('level=silverdale_1&nocuts')
  inj="(()=>{const L=JSON.parse(JSON.stringify(LV.level));L.entities=L.entities.concat([{type:'secret_paw',id:'w1-1',x:20,y:8},{type:'mission_gift',mission:'w3-ducklings',x:30,y:8}]);return L})()"
  await E(f"window._L={inj}")
  # reload the level from the patched JSON via the runtime's go(): stub fetch for this one level
  await E("(()=>{const f0=window.fetch;window.fetch=(u,...a)=>String(u).includes('silverdale_1.json')?Promise.resolve(new Response(JSON.stringify(_L))):f0(u,...a)})()")
  await E("LV.go('silverdale_1')");await pg.wait_for_timeout(500);await E("LV.calm()")
  await E("LV.teleport(20,8)");await pg.wait_for_timeout(500)
  s=await E("[LV.log.slice(-3),JSON.parse(localStorage.getItem('paddyStory')).paws,MISSION.pawCount(1),LV.events.slice(-2)]")
  check('secret_paw: collected, saved, counted 1/10 for World 1','paw:w1-1' in s[0] and 'w1-1' in s[1] and s[2]==1,s)
  await E("LV.teleport(30,8)");await pg.wait_for_timeout(500)
  s=await E("[LV.log.slice(-3),LV.mission,MISSION.done('w3-ducklings'),JSON.parse(localStorage.getItem('paddyStory')).forms]")
  check('mission_gift: completes w3-ducklings -> Skybreaker (skb) in the story save','gift:w3-ducklings' in s[0] and s[1]['ok'] and s[2] and 'skb' in s[3],s)
  await pg.wait_for_timeout(4200);await E("LV.go('silverdale_1')");await pg.wait_for_timeout(500)
  r=await E("(()=>{const e=LV.level.entities;return [MISSION.pawHas('w1-1'),e.some(x=>x.type==='secret_paw'),e.some(x=>x.type==='mission_gift')]})()")
  n0=await E("LV.log.length");await E("LV.teleport(20,8)");await pg.wait_for_timeout(500);await E("LV.teleport(30,8)");await pg.wait_for_timeout(500);r2=await E(f"[LV.log.slice({n0}).filter(x=>x.startsWith('paw:')||x.startsWith('gift:')).length]")
  check('collected paw + finished gift do not come back on reload',r==[True,True,True] and r2==[0],[r,r2])
  r=await E("(()=>{for(let k=1;k<=10;k++)var x=MISSION.pawCollect('w1-'+k);return [x.count,x.set,JSON.parse(localStorage.getItem('paddyStory')).pawSets]})()")
  check('10 paws in a world = full set saved (pawSets)',r==[10,True,[1]],r)
  # Level Builder's real secret paws (w1-1 .. w1-10 across silverdale_1..7): each one is reachable, collected, saved, and stays collected
  await E("localStorage.removeItem('paddyStory')");got=[]
  for n in range(1,8):
   await load(f'level=silverdale_{n}&nocuts');await E("LV.calm()")
   paws=await E("LV.level.entities.filter(e=>e.type==='secret_paw')")
   for e in paws:
    cell=await E(f"LV.tile({e['x']},{e['y']})")
    if cell=='T':   # on a trunk / pipe / pole: climb up from its base
     base=await E(f"(()=>{{let b={e['y']};while(LV.tile({e['x']},b+1)==='T')b++;return b}})()")
     await E(f"LV.teleport({e['x']},{base})");await pg.wait_for_timeout(150);await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(4000);await pg.keyboard.up('ArrowUp')
    else:
     await E(f"LV.teleport({e['x']},{e['y']})");await pg.wait_for_timeout(400)
    ok=await E(f"MISSION.pawHas('{e['id']}')");got.append([n,e['id'],cell,ok])
   await pg.screenshot(path=OUT+f'paws_1-{n}.png')
  check('all 10 Level Builder secret paws collected in 1-1..1-7 (trunk ones by climbing)',len(got)==10 and all(g[3] for g in got),got)
  r=await E("[MISSION.pawCount(1),JSON.parse(localStorage.getItem('paddyStory')).pawSets]");check('saved across levels: 10/10 World 1, full set recorded',r==[10,[1]],r)
  left=[]
  for n in range(1,8):
   await load(f'level=silverdale_{n}&nocuts');r=await E("[LV.level.entities.filter(e=>e.type==='secret_paw').length,LV.ents().filter(e=>e.type==='secret_paw').length]");left.append(r)
  check('after a reload the JSON still lists the paws, but collected ones are not spawned again',sum(x[0] for x in left)==10 and sum(x[1] for x in left)==0,left)
  check('no page errors',not errs,errs[:5])
  print('SHOTS',shots)
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
