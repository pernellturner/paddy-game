# v44d: Enemy Studio's six World 1 enemies (sewer_rat, gull_bandit, alley_cat, possum_w1, magpie_boss, ferret_zip) as NEW en.js ids
# free play: spawn, move, attack, hurt, KO, both facings, all frames load, flyers hover off the ground line;
# level runtime: World 1 levels draw them in the old slots (rat/seagull/alleytom/possum/ferret), hurt + KO frames; old ids untouched elsewhere.
import asyncio,time,os,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev_w1/te/';os.makedirs(OUT,exist_ok=True)
IDS=['sewer_rat','gull_bandit','alley_cat','possum_w1','magpie_boss','ferret_zip']
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:300],flush=True);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page(viewport={'width':1024,'height':340});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  E=pg.evaluate
  await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await pg.wait_for_timeout(1500)
  r=await E(f"{json.dumps(IDS)}.map(id=>[id,!!ENEMIES[id],['move','act','m_hurt','m_ko'].map(s=>(F['en_'+id+'_'+s]||[]).length)])")
  check('six new en.js entries, 6 frames each for move/act/hurt/ko',all(x[1] and x[2]==[6,6,6,6] for x in r),r)
  old=await E("['rat','seagull','alleytom','possum','magpie','ferret'].map(id=>[id,ENEMIES[id].nm,ENEMIES[id].h,(F['en_'+id+'_move']||[])[0].f])")
  check('old slots unchanged (rat/seagull/alleytom/possum/magpie/ferret keep their own stats + art)',old==[['rat','Rat',75,'p/en_rat_move_00'],['seagull','Seagull',120,'p/en_seagull_move_00'],['alleytom','Alley Tom',170,'p/en_alleytom_move_00'],['possum','Possum',120,'p/en_possum_move_00'],['magpie','Magpie',110,'p/en_magpie_move_00'],['ferret','Ferret',95,'p/en_ferret_move_00']],old)
  await E("p.hp=999;p.maxHp=999;window.ENM={}")
  r=await E(f"{json.dumps(IDS)}.map(id=>{{ENW.need([id]);return [id,(FR['en_'+id+'_hurt']||[]).map(f=>f.f).join(),(FR['en_'+id+'_ko']||[]).length]}})")
  check('hurt/ko anims use the new 6-frame hurt/ko sheets',all('_m_hurt_05' in x[1] and x[2]==6 for x in r),r)
  await E("""(()=>{function f(){for(const d of dummies){if(!d.cr)continue;const m=ENM[d.cr]=ENM[d.cr]||{anims:{},faces:{},bad:0,ys:[],xs:[]};const k=String(d.anim).replace('en_'+d.cr+'_','');m.anims[k]=1;m.faces[d.face>0?1:-1]=1;
   const T0=window.ENT=window.ENT||new WeakMap();if(!T0.has(d))T0.set(d,performance.now());const fr=(FR[d.anim]||[])[d.fi];if(fr&&!imgOK(IMG[fr.f])){if(performance.now()-T0.get(d)>2000)m.bad++;else m.lazy=(m.lazy||0)+1}m.ys.push(Math.round(GROUND-d.y));m.xs.push(Math.round(d.x))}requestAnimationFrame(f)}f()})()""")
  for i,id in enumerate(IDS):
   await E(f"ENW.spawn('{id}',{260+i*120})")
  await pg.wait_for_timeout(1000)
  await pg.wait_for_function("dummies.filter(d=>d.cr).every(d=>(FR[d.anim]||[]).every(f=>imgOK(IMG[f.f])))",timeout=20000)
  # let them walk / fly around and attack Paddy, moving Paddy side to side so they turn both ways
  for k in range(8):
   await E(f"p.x={300 if k%2 else 900};p.hp=999;dummies.forEach(d=>{{if(d.cr){{d.cool=Math.min(d.cool,.2);d.aggro=3}}}})");await pg.wait_for_timeout(1300)
   if k==3:await pg.screenshot(path=OUT+'w1_enemies_1024x340.png')
  # hurt each, then KO
  for id in IDS:
   await E(f"(()=>{{const d=dummies.find(q=>q.cr==='{id}'&&q.alive);if(!d)return;d.hp=Math.max(d.hp,3);p.x=d.x-120;p.face=1;hitDummy(d,'claw1',1)}})()");await pg.wait_for_timeout(500)
  await pg.screenshot(path=OUT+'w1_enemies_hurt_1024x340.png')
  for id in IDS:
   await E(f"(()=>{{const d=dummies.find(q=>q.cr==='{id}'&&q.alive);if(!d)return;d.hp=1;p.x=d.x-120;p.face=1;hitDummy(d,'claw1',1)}})()")
  await pg.wait_for_timeout(1600);await pg.screenshot(path=OUT+'w1_enemies_ko_1024x340.png');await pg.wait_for_timeout(1500)
  m=await E("ENM")
  for id in IDS:
   q=m.get(id,{});an=set(q.get('anims',{}).keys());fc=set(q.get('faces',{}).keys())
   check(f'{id}: spawned, every frame it showed was loaded',bool(q) and q.get('bad',1)==0,q.get('bad'))
   check(f'{id}: walks/flies + winds up + attacks + hurt + KO all played ({sorted(an)})',{'walk','wind','atk','hurt','ko'}<=an,sorted(an))
   check(f'{id}: faced both ways',fc=={'1','-1'},fc)
   if id in ('gull_bandit','magpie_boss'):
    ys=q['ys'];hover=sorted(ys)[len(ys)//2]
    check(f'{id}: flies (median height {hover}px above the ground line)',hover>50,hover)
  # level runtime: 1-1 draws the new art in the old slots
  await pg.goto(URL+'level.html?level=silverdale_2&nocuts&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready',timeout=30000);await pg.wait_for_timeout(800)
  r=await E("LV.enemies().map(e=>e.id+'>'+e.spr)")
  check('1-2: rat/seagull/alleytom drawn as sewer_rat/gull_bandit/alley_cat; others untouched',all((a.split('>')[0] in ('rat','seagull','alleytom'))==(a.split('>')[0]!=a.split('>')[1]) for a in r) and 'rat>sewer_rat' in r,sorted(set(r)))
  r=await E("(()=>{const e=LV.enemies().find(e=>e.spr==='sewer_rat');LV.teleport(e.x/48-2.5,Math.round(e.y/48)-1);return [e.x,e.y]})()");await pg.wait_for_timeout(500)
  await pg.screenshot(path=OUT+'level_1-2_sewer_rat.png')
  check('no page errors',not errs,errs[:3])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
