# level-1-1 branch: mission reward = form unlock hook (mission.js). MISSION_GIFTS ships empty (Story Studio sends the list), so the
# test injects one test-only gift. Checks: empty table, missionComplete records + unlocks + popup + save, no repeat popup, survives a
# reload, the standalone level runtime saves the unlock as pending and the game turns it into the form, and a level JSON 'mission' fires at the goal.
import asyncio,sys,time
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8766/'
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300],flush=True);(None if ok else FAILS.append(nm))
GIFT="window.MISSION_GIFTS={test_kitten:{gift:'a tiny bell',formKey:'cb',animal:'stray kitten',world:2},test_duck:{gift:'a feather',formKey:'SHADOW REAPER',animal:'duckling',world:3}}"
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':400});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  E=pg.evaluate
  async def game(init=None):
   await pg.goto(URL+'index.html?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await pg.wait_for_timeout(800)
  await game();await E("localStorage.removeItem('paddyLegends')");await game()
  r=await E("[typeof missionComplete,Object.keys(MISSION_GIFTS).sort(),UNL.has(4)]")
  check('missionComplete() exists, gift table has the 6 Story Studio missions, Crimson Blade locked',r==['function',['w2-stray','w3-ducklings','w4-penguin','w5-puppy','w6-olddog','w7-ruru'],False],r)
  r=await E("Object.entries(MISSION_GIFTS).map(([k,g])=>[k,g.formKey,MISSION.formIndex(g.formKey),UF[MISSION.formIndex(g.formKey)]&&UF[MISSION.formIndex(g.formKey)].nm])")
  want={'w2-stray':'LIGHT PADDY','w3-ducklings':'SKYBREAKER','w4-penguin':'POWER BLADE','w5-puppy':'NEON WRAITH','w6-olddog':'TIDECALLER','w7-ruru':'PHOENIX'}
  check('every gift formKey maps to a real game form',all(x[2]>0 and x[3]==want[x[0]] for x in r) and len(r)==6,r)
  r=await E("[UNLK[2].txt,UNLK[16].txt,UNLK[9].txt]");check('locked-form text names the real missions next to the EXP unlock','Pip' in r[0] and 'duck' in r[1] and 'ruru' in r[2],r)
  r=await E("[missionComplete('w2_kitten'),UNL.d.got.slice(),!!document.getElementById('giftpop'),MISSION.done('w2_kitten')]")
  check('mission with no gift entry (w2_kitten): recorded, but no form and no popup',r[0]['ok']==False and r[1]==[] and not r[2] and r[3],r)
  await E(GIFT.replace('window.MISSION_GIFTS=','Object.assign(MISSION_GIFTS,')+')');await E("MISSION.sync()")
  r=await E("UNLK[4].txt");check('locked-form text names the mission next to the EXP unlock',"stray kitten" in r,r)
  r=await E("(()=>{const i=missionComplete('test_kitten');return [i,UNL.has(4),!!document.getElementById('giftpop'),(document.getElementById('giftpop')||{}).innerText,JSON.parse(localStorage.getItem('paddyLegends')).got,JSON.parse(localStorage.getItem('paddyLegends')).missions.test_kitten]})()")
  check('missionComplete(test_kitten): Crimson Blade unlocked, gift popup shown, save updated',r[0]['ok'] and r[0]['u']==4 and r[0]['first'] and r[1] and r[2] and 'GIFT RECEIVED' in r[3] and 'CRIMSON BLADE' in r[3] and 4 in r[4] and r[5]['gift']=='a tiny bell',r)
  await pg.click('#giftpop');await pg.wait_for_timeout(200)
  r=await E("[missionComplete('test_kitten').first,!!document.getElementById('giftpop')]");check('second completion: no repeat popup',r==[False,False],r)
  await game();r=await E("[UNL.has(4),MISSION.done('test_kitten'),UNL.ok(4)]");check('unlock + mission survive a reload',r==[True,True,True],r)
  # standalone level runtime (no game.js): saved as pending, the game unlocks it on load
  await pg.add_init_script(GIFT)
  await pg.goto(URL+'level.html?level=silverdale_1&nocuts&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready',timeout=20000)
  r=await E("(()=>{const i=missionComplete('test_duck');return [i.ok,i.u,JSON.parse(localStorage.getItem('paddyLegends')).mformsPending,!!document.getElementById('giftpop')]})()")
  check('level runtime: gift popup + form saved as pending',r[0] and r[1]==0 and r[2]==['SHADOW REAPER'] and r[3],r)
  await game();r=await E("[UNL.has(MISSION.formIndex('SHADOW REAPER')),(UNL.d.mformsPending||[]).length,MISSION.formIndex('SHADOW REAPER')]");check('game load turns the pending gift into the Shadow Reaper unlock',r==[True,0,5],r)
  # a level JSON 'mission' field fires at the goal
  await pg.goto(URL+'level.html?level=silverdale_1&nocuts&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready',timeout=20000);await pg.wait_for_timeout(500)
  await E("(()=>{MISSION_GIFTS.test_goal={gift:'a shell',formKey:'gs',animal:'crab'};LV.level.mission='test_goal';const g=LV.level.goal;LV.teleport(g.x+1,g.y)})()");await pg.wait_for_timeout(800)
  r=await E("[LV.log.includes('mission:test_goal'),LV.mission&&LV.mission.ok,JSON.parse(localStorage.getItem('paddyLegends')).mformsPending]")
  check("level JSON 'mission' completes at the goal",r[0] and r[1] and 'gs' in r[2],r)
  await E("localStorage.removeItem('paddyLegends')")
  check('no page errors',not errs,errs[:5])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
