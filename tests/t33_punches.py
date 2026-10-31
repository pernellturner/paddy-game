# v33 punch strings: free strings (1-2, 1-1-2, 1-2-3-4), mashing, the 8-hit timed build -> power uppercut -> finisher, turning, recovery.
import asyncio,time,os,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev33/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,info);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);E=pg.evaluate
  await E("TRAIN.open()");await pg.wait_for_timeout(800);await E("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await E("document.body.classList.remove('fp')");await pg.wait_for_timeout(3500)
  ld=await E("[!!window.BOX33,!window.BOX31,['bxj1','bxx','bxlh','bxrb','bxpu','bxpj','bxph','bxpb','bxrec'].every(a=>FR[a]&&FR[a].every(q=>imgOK(IMG[q.f]))),Object.keys(F).filter(k=>k.startsWith('k_bx')).length]")
  check('punch frames loaded, old k_bx gone',ld[0] and ld[1] and ld[2] and ld[3]==0,ld)
  await E("(()=>{window.TR=[];const f=()=>{if(p.state==='claw'||p.state==='bunny'){const l=TR[TR.length-1];const k=p.anim+':'+p.fi;if(!l||l.k!==k)TR.push({k,x:Math.round(p.x),t:Math.round(performance.now())})}requestAnimationFrame(f)};f();window.SAYS=[];const s=say;say=function(t){SAYS.push(t);return s.apply(this,arguments)}})()")
  setup="(()=>{const ds=dummies.filter(d=>d.alive&&!d.benched);ds.forEach((q,i)=>{if(i){q.x=60+i*30;q.vx=0}});const d=ds[0];d.x=560;p.state='normal';p.ground=true;p.y=GROUND;p.x=d.x-170;p.face=1;p.vx=0;p.combo=0;p.miss=false;p.cool=0;d.hp=Math.max(d.hp,80);d.y=GROUND;d.vx=0;d.vy=0;W31.names.length=0;W31.hits={};SND.tierLog.length=0;SAYS.length=0;TR.length=0;P33.log.length=0;P33.last=''})()"
  async def tap(k='KeyX',hold=None):
   if hold:await pg.keyboard.down(hold)
   await pg.keyboard.down(k);await pg.wait_for_timeout(25);await pg.keyboard.up(k)
   if hold:await pg.wait_for_timeout(15);await pg.keyboard.up(hold)
  async def at(cond,tmo=3000):
   await pg.wait_for_function(cond,timeout=tmo,polling='raf')
  async def string(seq,beat=True,shots=None):
   """seq: list of '' / 'fwd' / 'down'. beat=True: press on the beat (retract frame), False: mash right after the hit"""
   await E(setup);await pg.wait_for_timeout(250)
   for i,s in enumerate(seq):
    if i>0:
     await at(f"p.state!=='claw'||W31.names.length>={i}")
     if beat=='mash': await tap();await pg.wait_for_timeout(40)
     elif beat: await at("p.state!=='claw'||!P33.a||(PD33(p.anim)&&p.fi>=PD33(p.anim)[5])")
     else: await at("p.state!=='claw'||!P33.a||(PD33(p.anim)&&p.fi>=PD33(p.anim)[4])")
    await tap('KeyX',{'fwd':'ArrowRight','down':'ArrowDown'}.get(s))
    if shots:
     try:
      await at(f"p.state!=='claw'||(W31.names.length>={i+1}&&PD33(p.anim)&&p.fi>=PD33(p.anim)[3]&&p.fi<=PD33(p.anim)[5])",2500);await pg.screenshot(path=OUT+f'{shots}_{i+1}.png')
     except Exception as e: print('shot skip',i+1)
   await at("p.state!=='claw'",6000);await pg.wait_for_timeout(200)
   return await E("[W31.names.join(','),JSON.stringify(W31.hits),p.state,SAYS.join('|'),SND.tierLog.join(''),P33.log.join(','),TR.map(o=>o.k).join(' ')]")
  await E("window.PD33=a=>({bxj1:[0,0,0,3,3,4],bxj2:[0,0,0,3,3,4],bxx:[0,0,0,3,3,4],bxlh:[0,0,0,3,3,4],bxrb:[0,0,0,3,3,4],bxpj:[0,0,0,4,4,6],bxph:[0,0,0,4,4,6],bxpb:[0,0,0,4,4,6],bxpu:[0,0,0,4,4,6]})[a]")
  r=await string(['',''],True,'s12');print('1-2',r)
  check('1-2 = jab, cross, recovery',r[0]=='bxj1,bxx' and r[2]=='normal' and 'bxrec' in r[6],r[0])
  check('1-2 frames: opener 1-6, cross from frame 2, no doubled neutral',r[6].startswith('bxj1:0 bxj1:1 bxj1:2 bxj1:3 bxj1:4 bxj1:5 bxx:1'),r[6][:120])
  r=await string(['fwd','fwd',''],True,'s112');print('1-1-2',r)
  check('1-1-2 = jab, slipping jab, cross',r[0]=='bxj1,bxj2,bxx',r[0])
  r=await string(['','','',''],'mash');print('1-2-3-4',r)
  check('1-2-3-4 off the beat = jab, cross, hook, body shot',r[0]=='bxj1,bxx,bxlh,bxrb',r[0])
  check('every punch lands',all(json.loads(r[1]).get(k) for k in ['bxj1','bxx','bxlh','bxrb']),r[1])
  check('body shot is a power-tier hit',r[4].endswith('2'),r[4])
  r2=await string(['','','',''],True,'s1234');check('1-2-3-4 on the beat = jab, cross, hook, POWER BODY',r2[0]=='bxj1,bxx,bxlh,bxpb',r2[0])
  r=await string(['','down'],True);check('down + claw mid-string = body shot',r[0]=='bxj1,bxrb',r[0])
  # the 8-hit timed build: on the beat every time
  r=await string(['']*8,True,'s8');print('8hit',r)
  names=r[0].split(',')
  check('8-hit: 1-2-3 normal, 4-6 power (body, jab, hook), 7 power uppercut',names[:6]==['bxj1','bxx','bxlh','bxpb','bxpj','bxph'] and len(names)>=7 and names[6]=='bxpu',r[0])
  check('8th on-beat press = finisher (bunny or air)',('bunny' in r[6]) or 'GRAB' in r[3] or 'AIR GRAB' in r[3],r[3][-120:])
  check('uppercut landed',json.loads(r[1]).get('bxpu',0)>=1,r[1])
  check('effort vocals on big hits, not every hit',0<len([x for x in r[5].split(',') if x])<len(names),r[5])
  await pg.wait_for_timeout(3500)
  # mashing: never power, string keeps going
  r=await string(['']*6,'mash');print('mash',r)
  check('mash = normal string, no power punches',r[0] and not any(n.startswith('bxp') for n in r[0].split(',')),r[0])
  # turn mid-string
  await E(setup);await pg.wait_for_timeout(200);await tap();await pg.wait_for_timeout(120);await pg.keyboard.press('ArrowLeft');await pg.wait_for_timeout(80)
  t=await E("[p.face,p.state,p.anim,K29.turns]");check('turn mid-punch keeps the punch',t[0]==-1 and t[1]=='claw' and t[2]=='bxj1',t)
  await pg.wait_for_timeout(1200)
  # travel clamp: a long string can't skate
  await E(setup);await E("dummies.forEach(d=>{d.x=60})");await pg.wait_for_timeout(200);x0=await E("p.x")
  for i in range(6):
   if i: await at(f"p.state!=='claw'||W31.names.length>={i}");await at("p.state!=='claw'||(PD33(p.anim)&&p.fi>=PD33(p.anim)[4])")
   await tap()
  await at("p.state!=='claw'",6000);x1=await E("p.x");check('travel per 6-punch string stays sane',0<x1-x0<6*80 and len((await E("W31.names")))==6,[x1-x0,await E("W31.names.join()")])
  print("xs",await E("TR.map(o=>o.k+'@'+o.x).join(' ')"))
  # touch: Claw button taps chain the same way; hold ▼ + tap Claw mid-string = body shot
  cdp=await ctx.new_cdp_session(pg)
  async def bxy(k):return await E(f"(()=>{{const r=document.querySelector('#ui .b[data-k={k}]').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}})()")
  ax,ay=await bxy('attack');dx,dy=await bxy('down')
  async def ttap(hold=False):
   pts=[{'x':ax,'y':ay,'id':1}]
   if hold:await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':dx,'y':dy,'id':2}]});await pg.wait_for_timeout(40);pts=[{'x':dx,'y':dy,'id':2},{'x':ax,'y':ay,'id':1}]
   await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':pts});await pg.wait_for_timeout(50)
   await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':([{'x':dx,'y':dy,'id':2}] if hold else [])});await pg.wait_for_timeout(20)
   if hold:await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  await E(setup);await pg.wait_for_timeout(250)
  await ttap();await at("W31.names.length>=1&&p.fi>=4");await ttap();await at("p.state!=='claw'||W31.names.length>=2");await at("p.state!=='claw'||p.fi>=4");await ttap(True)
  await at("p.state!=='claw'",6000);await pg.wait_for_timeout(200);r=await E("W31.names.join()")
  check('touch: tap, tap, hold ▼ + tap = jab, cross, body shot',r=='bxj1,bxx,bxrb',r)
  check('no page errors',not errs,errs)
  print('FAILS',len(FAILS),FAILS);await br.close()
asyncio.run(main())
