# v46: a bot plays the brawler World 1-1 start to finish at phone size 844x390 (keyboard input): every wave of all 4 brawl zones cleared,
# every set-piece passed (climb pohutukawa / stair-tower step + lightwell + ledge / drainpipe + verandah + parapet ledge / puriri),
# no getting stuck (watchdog), no page errors; screenshots along the way. python3 tests/tl46_bot11.py [URL] [OUT]
import asyncio,sys,os,time,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8766/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev_bot11/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,str(info)[:400],flush=True);(None if ok else FAILS.append(nm))
BOT=r'''(()=>{const KC={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',jump:'Space',claw:'KeyX',tail:'KeyC'};const held={};
 const set=(k,on)=>{if(!!held[k]===!!on)return;held[k]=!!on;dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:KC[k]}))};
 const tap=k=>{set(k,false);set(k,true)};
 const B=window.BOT={t0:performance.now(),lastX:0,lastT:performance.now(),stuck:0,maxStall:0,phase:'',tick:0,log:[]};
 B.iv=setInterval(()=>{const p=LV.p,T=48,now=performance.now();B.tick++;if(!LV.ready||LV.pause)return;if(p.done){for(const k in KC)set(k,false);clearInterval(B.iv);B.fin=now;return}
  const st=LV.state(),ar=LV.arenas().find(a=>a.state==='lock');
  // progress watchdog (only counts outside arenas)
  if(ar||p.x>B.lastX+T*.5){B.lastX=Math.max(B.lastX,p.x);B.lastT=now}B.maxStall=Math.max(B.maxStall,now-B.lastT);
  const foes=LV.enemies().filter(e=>e.alive&&(ar?e.inArena:Math.abs(e.x-p.x)<T*3.2&&Math.abs(e.y-p.y)<T*2.5));
  ['claw','tail','jump','up'].forEach(k=>{if(held[k]&&B.tick%2)set(k,false)});
  if(p.state==='climb'){B.phase='climb';set('left',false);set('up',true);set('right',B.tick%2===0);return}
  if(p.state==='ledge'){B.phase='ledge';set('up',true);return}
  if(foes.length){B.phase='fight';let e=foes.sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];const dx=e.x-p.x,ad=Math.abs(dx);
   if(ad>95){set(dx>0?'right':'left',true);set(dx>0?'left':'right',false)}else{set('left',false);set('right',false);if(Math.sign(dx)!==p.face&&ad>20){set(dx>0?'right':'left',true)}}
   if(ad<150&&B.tick%2===0){const bird=e.fly&&e.y<p.y-p.h0;if(e.fly&&e.y<p.y-110){if(p.ground){set('up',true)}else tap('claw')}else tap(B.tick%14<10?'claw':'tail')}
   return}
  // traversal: head right; blocked -> climb a trunk, else jump (+ double jump / wall jump near the apex, ledge grab holding right)
  set('left',false);set('right',true);const c=Math.floor(p.x/T),trunk=[0,1,2,3].some(i=>LV.tile(c,Math.floor((p.y-4)/T)-i)==='T');
  const blocked=LV.tile(Math.floor((p.x+46)/T),Math.floor((p.y-10)/T))!=='.'&&LV.tile(Math.floor((p.x+46)/T),Math.floor((p.y-10)/T))!=='T';
  if(p.ground&&blocked){if(trunk){B.phase='to-climb';set('up',true)}else{B.phase='jump';tap('jump')}}
  else if(!p.ground&&p.vy>-120&&p.vy<200&&B.phase==='jump'&&!B.dj){B.dj=1;tap('jump')}
  if(p.ground)B.dj=0;
 },33)})()'''
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'Failed to load resource' not in m.text and errs.append(m.text))
  E=pg.evaluate
  await pg.goto(URL+'level.html?level=silverdale_1&nocuts&v='+str(time.time()));await pg.wait_for_function('window.LV&&LV.ready',timeout=20000)
  await pg.wait_for_function('LV.art',timeout=20000);await pg.wait_for_timeout(800)
  check('1-1 painted art loaded (LV.art)',await E('!!LV.art'))
  await E(BOT);t0=time.time();shots=set();waves={}
  while time.time()-t0<480:
   await pg.wait_for_timeout(400);s=await E("({x:LV.p.x/48,y:LV.p.y/48,st:LV.p.state,done:LV.p.done,hp:LV.p.hp,ar:(LV.arenas().find(a=>a.state==='lock')||{}).name,wi:(LV.arenas().find(a=>a.state==='lock')||{}).wi,n:LV.enemies().filter(e=>e.alive&&e.inArena).length,stall:BOT.maxStall,ph:BOT.phase})")
   if s['ar']:waves.setdefault(s['ar'],set()).add(s['wi'])
   for nm,cond in (('bot_brawl1_wave2',s['ar']=='Trolley-bay brawl' and s['wi']==1 and s['n']>=3),('bot_deck_wave3',s['ar']=='Car-park deck rumble' and s['wi']==2 and s['n']>=3),
                   ('bot_lightwell',89<s['x']<97 and s['y']<13.5),('bot_tower_top',96<s['x']<104 and s['y']<6.5),('bot_drainpipe',s['st']=='climb' and 140<s['x']<142.5),('bot_parapet',s['st']=='ledge' or (150<s['x']<156 and s['y']<6.5)),
                   ('bot_square_wave4',s['ar']=='Seagull square' and s['wi']==3),('bot_puriri',s['st']=='climb' and 194<s['x']<196.5)):
    if cond and nm not in shots:shots.add(nm);await pg.screenshot(path=OUT+nm+'.png')
   if s['done'] or s['stall']>15000:break
  s=await E("LV.state()");b=await E("({stall:BOT.maxStall,secs:((BOT.fin||performance.now())-BOT.t0)/1000,arenas:LV.arenas().map(a=>[a.name,a.state,a.wi,(a.waves||[]).length]),deaths:LV.p.deaths})")
  await pg.screenshot(path=OUT+'bot_goal.png')
  check('bot reaches the 1-1 goal',s['done'],[s,b])
  check('all 4 brawl zones cleared, every wave spawned',len(b['arenas'])==4 and all(a[1]=='done' and a[2]==a[3]-1 for a in b['arenas']),b['arenas'])
  check('every wave of every zone was fought',all(len(waves.get(a[0],()))==a[3] for a in b['arenas']),{k:sorted(v) for k,v in waves.items()})
  check('never stuck (no >15 s without progress outside a brawl)',b['stall']<15000,b)
  lg=await E("LV.log.join(' ')");check('used climb, ledge grab + pull-up on the way',all(k in lg for k in ('climb','stepoff','ledge','pullup')),lg[-600:])
  print('bot run: %.0f s, deaths %d, shots %s'%(b['secs'],b['deaths'],sorted(shots)))
  check('no page errors',not errs,errs[:5])
  await br.close()
 print('FAILS',len(FAILS),FAILS)
asyncio.run(main())
