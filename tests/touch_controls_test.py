import asyncio,sys,time,json,os
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
SIZES=[(1024,340),(844,390),(932,430)]
OUT='/workspace/rev18/'
fails=[]
def ok(c,msg):
  print(('PASS ' if c else 'FAIL ')+msg,flush=True)
  if not c: fails.append(msg)
async def run(pw,W,H,shots):
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':W,'height':H},device_scale_factor=2,has_touch=True,is_mobile=True);pg=await ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL+'?story&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started&&window.STORY&&STORY.mode==="title"',timeout=30000);await pg.wait_for_timeout(1800)
  cdp=await ctx.new_cdp_session(pg)
  async def touch(typ,pts): await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,x,y in pts]})
  async def tapsel(sel):
    r=await pg.evaluate("s=>{const b=document.querySelector(s);if(!b)return null;const r=b.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}",sel)
    if not r: return False
    await touch('touchStart',[(9,*r)]);await pg.wait_for_timeout(60);await touch('touchEnd',[]);await pg.wait_for_timeout(250);return True
  tag=f'{W}x{H}'
  if shots: await pg.screenshot(path=OUT+f'title_{tag}.png')
  bb=await pg.evaluate("[...document.querySelectorAll('#sbtns button')].map(b=>{const r=b.getBoundingClientRect();return [b.id,Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]})")
  ok(all(b[1]>=0 and b[2]>=0 and b[3]<=W and b[4]<=H for b in bb),f'{tag} title buttons on screen {bb}')
  await tapsel('#scombo');ok(await pg.evaluate("document.body.classList.contains('ov')"),f'{tag} title COMBO LIST opens by touch')
  await tapsel('#mclose');ok(not await pg.evaluate("document.body.classList.contains('ov')"),f'{tag} combo list closes by touch')
  await tapsel('#sprac');await pg.wait_for_timeout(1800)
  ok(await pg.evaluate("document.body.classList.contains('train')&&STORY.mode==='off'"),f'{tag} PRACTICE enters Training Room')
  ok(await pg.evaluate("document.body.classList.contains('fp')"),f'{tag} form picker opens')
  if shots: await pg.screenshot(path=OUT+f'picker_{tag}.png')
  await tapsel('#fpick [data-f="10"]');await pg.wait_for_timeout(1500)
  ok(await pg.evaluate("FORM()===10&&!document.body.classList.contains('fp')"),f'{tag} picker -> Shade by touch (FORM={await pg.evaluate("FORM()")})')
  await tapsel('#tforms');await pg.evaluate("document.querySelector('#fpick [data-f=\"14\"]').scrollIntoView()");await pg.wait_for_timeout(200)
  await tapsel('#fpick [data-f="14"]');await pg.wait_for_timeout(1500)
  ok(await pg.evaluate("FORM()===14"),f'{tag} picker -> Frost Monarch (mythic) after scrolling')
  bad=[]
  for f in [0,1,2,3,4,5,6,7,8,9,11,12,13,15,16,17,18]:
    await pg.evaluate(f"TRAIN.pick({f})");await pg.wait_for_timeout(700)
    g=await pg.evaluate("FORM()")
    if g!=f: bad.append((f,g))
  ok(not bad,f'{tag} every form selectable {bad}')
  await pg.evaluate("TRAIN.pick(10)");await pg.wait_for_timeout(1200)
  await tapsel('#tmoves');ok(await pg.evaluate("document.body.classList.contains('ov')"),f'{tag} MOVES opens list')
  if shots: await pg.screenshot(path=OUT+f'moves_{tag}.png')
  await tapsel('#mclose');await pg.wait_for_timeout(2500)
  n=await pg.evaluate("dummies.filter(d=>d.train&&!d.gone).length");ok(n==3,f'{tag} 3 training dummies ({n})')
  ok(await pg.evaluate("dummies.filter(d=>!d.cr).every(d=>d.benched)"),f'{tag} Bruno benched in training')
  R=await pg.evaluate("[...document.querySelectorAll('#ui .b')].filter(b=>b.offsetWidth&&getComputedStyle(b).display!=='none').map(b=>{const r=b.getBoundingClientRect();return [b.dataset.k||b.id,Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]})")
  ok(all(r[1]>=10 and r[2]>=0 and r[3]<=W-10 and r[4]<=H for r in R),f'{tag} all {len(R)} buttons on screen & >=10px from sides {R}')
  import math
  ovl=[(a[0],b[0]) for i,a in enumerate(R) for b in R[i+1:] if math.hypot((a[1]+a[3])/2-(b[1]+b[3])/2,(a[2]+a[4])/2-(b[2]+b[4])/2)<(a[3]-a[1]+b[3]-b[1])/2+4]
  ok(not ovl,f'{tag} no button overlap {ovl}')
  big=[r for r in R if r[0] in('left','right','jump','attack') and r[3]-r[1]<60];ok(not big,f'{tag} main buttons >=60px {big}')
  bar=await pg.evaluate("(()=>{const r=document.getElementById('trbar').getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]})()")
  ovb=[r[0] for r in R if r[1]<bar[2] and bar[0]<r[3] and r[2]<bar[3] and bar[1]<r[4]];ok(not ovb,f'{tag} training bar clear of buttons {ovb} bar={bar}')
  if shots: await pg.screenshot(path=OUT+f'controls_{tag}.png')
  await pg.evaluate("window.LOG=[];const _p=press;press=k=>{if(k==null||k==='null')window.NULLSRC=new Error().stack;LOG.push(k);_p(k)};0")
  C=await pg.evaluate("Object.fromEntries([...document.querySelectorAll('#ui .b[data-k]')].map(b=>{const r=b.getBoundingClientRect();return [b.dataset.k,[r.left+r.width/2,r.top+r.height/2,r.width/2]]}))")
  for k in ['attack','jump','special','tail','blink','hunt']:
    await pg.evaluate("LOG.length=0");x,y,r=C[k]
    await touch('touchStart',[(5,x+r*.75,y)]);await pg.wait_for_timeout(80);await touch('touchEnd',[]);await pg.wait_for_timeout(500)
    ok(k in await pg.evaluate("LOG"),f'{tag} {k} button (tap near its edge) fires')
  ok(await pg.evaluate("!Object.keys(K).some(k=>K[k])"),f'{tag} nothing held after taps {await pg.evaluate("JSON.stringify(K)")}')
  f0=await pg.evaluate("FORM()");x,y,r=C['morph'];await touch('touchStart',[(6,x,y)]);await pg.wait_for_timeout(80);await touch('touchEnd',[]);await pg.wait_for_timeout(1200)
  f1=await pg.evaluate("FORM()");ok(f1!=f0,f'{tag} morph button switches form {f0}->{f1}')
  st="({x:Math.round(p.x),y:Math.round(p.y),s:p.state,w:p.wall,L:K.left|0,R:K.right|0})"
  for form in [0,2,10]:
    await pg.evaluate(f"TRAIN.pick({form})");await pg.wait_for_timeout(1200)
    await pg.evaluate("p.x=600;p.y=GROUND;p.vx=0;p.vy=0")
    R_=C['right'];L_=C['left']
    await touch('touchStart',[(1,R_[0],R_[1])]);await pg.wait_for_timeout(2500);a=await pg.evaluate(st)
    for i in range(1,6): await touch('touchMove',[(1,R_[0]+(L_[0]-R_[0])*i/5,R_[1])]);await pg.wait_for_timeout(30)
    await pg.wait_for_timeout(1500);b=await pg.evaluate(st)
    await touch('touchEnd',[]);await pg.wait_for_timeout(300);c=await pg.evaluate(st)
    print(' form',form,'held->',a,'slid<-',b,'released',c)
    ok(b['L']==1 and b['R']==0 and b['x']<a['x']-20,f'{tag} form {form}: slide right->left thumb walks away from the wall')
    ok(c['L']==0 and c['R']==0,f'{tag} form {form}: release clears keys')
  # wall cling in the air, then push away
  for form in [0,1,5]:
    await pg.evaluate(f"TRAIN.pick({form})");await pg.wait_for_timeout(1200)
    await pg.evaluate("p.x=820;p.y=GROUND;p.vx=0;p.vy=0")
    await touch('touchStart',[(1,*C['right'][:2])]);await pg.wait_for_timeout(150)
    await touch('touchStart',[(1,*C['right'][:2]),(2,*C['jump'][:2])]);await pg.wait_for_timeout(120);await touch('touchMove',[(1,*C['right'][:2])]);await pg.wait_for_timeout(400)
    a=await pg.evaluate(st)
    for i in range(1,6):
      await touch('touchMove',[(1,C['right'][0]+(C['left'][0]-C['right'][0])*i/5,C['right'][1])]);await pg.wait_for_timeout(30)
    await pg.wait_for_timeout(1200);b=await pg.evaluate(st);await touch('touchEnd',[]);await pg.wait_for_timeout(300)
    print(' wall form',form,a,b)
    ok(b['x']<min(a['x'],880)-60,f'{tag} form {form}: on the wall/pillar then push away -> leaves ({a["x"]}->{b["x"]})')
  # left edge too
  await pg.evaluate("TRAIN.pick(2)");await pg.wait_for_timeout(1200)
  await pg.evaluate("p.x=200;p.y=GROUND;p.vx=0");await touch('touchStart',[(1,*C['left'][:2])]);await pg.wait_for_timeout(1500);a=await pg.evaluate(st)
  await touch('touchMove',[(1,*C['right'][:2])]);await pg.wait_for_timeout(800);b=await pg.evaluate(st);await touch('touchEnd',[])
  ok(b['x']>a['x']+60,f'{tag} left wall then push right -> leaves ({a["x"]}->{b["x"]})')
  await pg.wait_for_timeout(300)
  await pg.evaluate("p.x=480;p.y=GROUND;p.vx=0");await touch('touchStart',[(1,*C['right'][:2])]);await pg.wait_for_timeout(400)
  await touch('touchStart',[(1,*C['right'][:2]),(2,*C['left'][:2])]);await pg.wait_for_timeout(50);x0=await pg.evaluate("p.x");await pg.wait_for_timeout(700);x1=await pg.evaluate("p.x")
  print(' bothheld',await pg.evaluate("[Math.round(p.x),p.state,K.left|0,K.right|0,lastLR,p.ground]"))
  ok(x1<x0-40,f'{tag} right held + left pressed -> moves left ({x0:.0f}->{x1:.0f})')
  await touch('touchEnd',[]);await pg.wait_for_timeout(200)
  await pg.evaluate("p.x=300;p.y=GROUND;p.vx=0;LOG.length=0");await touch('touchStart',[(1,*C['right'][:2])]);await pg.wait_for_timeout(300)
  x=await pg.evaluate("p.x")
  await touch('touchStart',[(1,*C['right'][:2]),(2,*C['jump'][:2])]);await pg.wait_for_timeout(200);y=await pg.evaluate("p.y")
  await touch('touchMove',[(1,*C['right'][:2])]);await pg.wait_for_timeout(100)
  await touch('touchStart',[(1,*C['right'][:2]),(3,*C['attack'][:2])]);await pg.wait_for_timeout(300)
  await touch('touchMove',[(1,*C['right'][:2])]);await pg.wait_for_timeout(500);x3=await pg.evaluate("p.x");K_=await pg.evaluate("K.right|0");lg=await pg.evaluate("LOG")
  ok(y<460 and 'jump' in lg and 'attack' in lg and K_==1 and x3>x+20,f'{tag} multitouch hold right + jump + claw (y={y:.0f}, x {x:.0f}->{x3:.0f}, R held={K_}, log={lg})')
  await touch('touchEnd',[]);await pg.wait_for_timeout(200)
  await touch('touchStart',[(1,*C['left'][:2])]);await pg.wait_for_timeout(300)
  await pg.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden")
  ok(await pg.evaluate("!K.left&&!document.querySelector('#ui .b.on')"),f'{tag} backgrounding releases a held touch')
  await touch('touchEnd',[]);await pg.wait_for_timeout(200)
  await touch('touchStart',[(1,*C['right'][:2])]);await pg.wait_for_timeout(200);await pg.evaluate("dispatchEvent(new Event('blur'))")
  ok(await pg.evaluate("!K.right"),f'{tag} blur releases a held touch');await touch('touchEnd',[])
  await touch('touchStart',[(1,*C['left'][:2])]);await pg.wait_for_timeout(100)
  await pg.evaluate("CTRL.T.set(77,{k:'right'});CTRL.KC.right=(CTRL.KC.right||0)+1;K.right=1")
  await touch('touchEnd',[]);await pg.wait_for_timeout(100)
  ok(await pg.evaluate("!K.right&&!K.left"),f'{tag} ghost touch (lost touchend) reconciled')
  for i in range(2):
    await touch('touchStart',[(1,W/2,H/2)]);await pg.wait_for_timeout(40);await touch('touchEnd',[]);await pg.wait_for_timeout(60)
  await touch('touchStart',[(1,W/2,H/2)])
  for i in range(8):
    await touch('touchMove',[(1,W/2,H/2-20*i)]);await pg.wait_for_timeout(16)
  await touch('touchEnd',[]);await pg.wait_for_timeout(300)
  ok(await pg.evaluate("scrollY===0&&scrollX===0&&(!window.visualViewport||visualViewport.scale===1)"),f'{tag} no scroll/zoom after double-tap & swipe')
  await pg.evaluate("p.x=480;p.y=GROUND;p.vx=0");await pg.keyboard.down('ArrowLeft');await pg.wait_for_timeout(600);xk=await pg.evaluate("p.x");await pg.keyboard.up('ArrowLeft');await pg.wait_for_timeout(600)
  ok(xk<440 and await pg.evaluate("!K.left"),f'{tag} keyboard left moves and releases (x={xk:.0f})')
  await tapsel('#texit');await pg.wait_for_timeout(800)
  ok(await pg.evaluate("!document.body.classList.contains('train')&&STORY.mode==='title'&&!dummies.some(d=>d.train)"),f'{tag} EXIT returns to title')
  ok(not errs,f'{tag} no page errors {errs[:3]}')
  print('NULLSRC',await pg.evaluate("window.NULLSRC||''"))
  await br.close()
async def main():
  os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as pw:
    for (W,H) in SIZES: await run(pw,W,H,True)
  print('FAILS',len(fails))
  for f in fails: print(' -',f)
asyncio.run(main())
