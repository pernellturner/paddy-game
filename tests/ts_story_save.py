# Story save (World 1 levels): a NEW GAME from the title's 🌳 PLAY WORLD 1 starts with EVERY form locked (plain Paddy), in its own save
# 'paddyStory'. Forms unlock only through that save's EXP, mission gifts and boss rewards; old / free-play / practice unlocks
# ('paddyLegends', ?legends tryAll) are never read and never written. Free play keeps working as before.
import asyncio,sys,time,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300],flush=True);(None if ok else FAILS.append(nm))
OLD={'exp':99999,'ko':50,'ult':80,'tkd':20,'got':list(range(1,19)),'tryAll':True,'tryMyth':True,'missions':{'w2-stray':{'t':1}},'baseGot':['ninja'],'world1':{'cleared':['silverdale_1'],'next':'silverdale_2'},'paws':{'w1-1':1}}
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},has_touch=True,is_mobile=True,device_scale_factor=2);pg=await ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));E=pg.evaluate
  await pg.goto(URL+'index.html?story&v='+str(time.time()));await E(f"localStorage.clear();localStorage.setItem('paddyLegends',JSON.stringify({json.dumps(OLD)}))")
  await pg.goto(URL+'index.html?story&v='+str(time.time()));await pg.wait_for_selector('#sw1',state='visible',timeout=30000);await pg.wait_for_timeout(1500)
  old=await E("localStorage.getItem('paddyLegends')")
  await pg.locator('#sw1').tap(force=True);await pg.wait_for_function('window.LV&&LV.ready',timeout=30000);await pg.wait_for_timeout(800)
  st=await E("JSON.parse(localStorage.getItem('paddyStory'))")
  check('NEW GAME opens 1-1 (old free-play save has every form + World 1 progress)',(await E("LV.level.id"))=='silverdale_1' and 'newgame' in await E("LV.log"),pg.url)
  check('new story save: every form locked, 0 EXP, no missions / rewards / paws carried over',st['forms']==[] and st['exp']==0 and st['missions']=={} and st['baseGot']==[] and st['paws']=={} and st['world1']['cleared']==[],st)
  r=await E("[MISSION.forms(),MISSION.baseUnlocked('ninja'),MISSION.done('w2-stray'),MISSION.pawHas('w1-1')]");check('story mode reads only the story save (plain Paddy only)',r==[[],False,False,False],r)
  # earn: EXP (hits / K.O.s), a mission gift, a boss reward
  await E("LV.calm()");await E("LV.exp(2499)");r=await E("MISSION.forms()");check('2,499 EXP: still nothing',r==[],r)
  await E("LV.exp(1)");r=await E("[MISSION.forms(),LV.log.slice(-2)]");check('2,500 EXP unlocks Ninja (EXP route)',r[0]==['ninja'] and 'expform:Ninja' in r[1],r)
  await E("missionComplete('w2-stray')");await pg.wait_for_timeout(300);r=await E("MISSION.forms()");check('W2 mission gift unlocks Light Paddy (lp) in the story save',r==['ninja','lp'],r)
  await E("MISSION.bossReward('big_bruno',{quiet:true})");await E("LV.exp(1100)");r=await E("[MISSION.forms(),JSON.parse(localStorage.getItem('paddyStory')).exp]");check('boss reward recorded; 3,600 EXP adds Samurai',r[0]==['ninja','lp','samurai'] and r[1]==3600,r)
  r=await E("JSON.parse(localStorage.getItem('paddyStory')).forms.some(f=>['gf','golden fury'].includes(f))");check('Golden Fury never unlocks by EXP (finale only)',not r)
  check('free-play save untouched by story mode',await E("localStorage.getItem('paddyLegends')")==old)
  # clear 1-1 -> resume at 1-2 (no reset); a reload keeps the story save
  await E("(()=>{const g=LV.level.goal;LV.teleport(g.x+1,g.y)})()");await pg.wait_for_timeout(700);await E("CUT.skip()");await pg.wait_for_timeout(300);await E("CUT.skip()");await pg.wait_for_timeout(300)
  await pg.goto(URL+'index.html?story&v='+str(time.time()));await pg.wait_for_selector('#sw1',state='visible',timeout=30000);await pg.wait_for_timeout(800)
  await pg.locator('#sw1').tap(force=True);await pg.wait_for_function('window.LV&&LV.ready',timeout=30000);await pg.wait_for_timeout(600)
  r=await E("[LV.level.id,MISSION.forms(),LV.log.includes('newgame'),JSON.parse(localStorage.getItem('paddyStory')).world1.cleared]")
  check('PLAY WORLD 1 again resumes at 1-2 with the earned forms (no reset)',r[0]=='silverdale_2' and r[1]==['ninja','lp','samurai'] and not r[2] and r[3]==['silverdale_1'],r)
  # free play still has its own unlocks
  await pg.goto(URL+'index.html?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await pg.wait_for_timeout(600)
  r=await E("[UNL.d.got.length,UNL.has(18),UNL.d.exp]");check('free play keeps its own unlocks as before',r==[18,True,99999],r)
  # World 1 complete -> the next PLAY WORLD 1 is a NEW GAME again
  await E("(()=>{const d=JSON.parse(localStorage.getItem('paddyStory'));d.world1.next=null;d.world1.complete=1;localStorage.setItem('paddyStory',JSON.stringify(d))})()")
  r=await E("W1START()");check('after World 1 is complete, PLAY WORLD 1 starts a new game',r=='silverdale_1&new=1',r)
  check('no page errors',not errs,errs[:5])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
