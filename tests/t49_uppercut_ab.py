# v49 NEW BOXER'S UPPERCUT A/B (Practice Room, base Paddy): toggle button + \ key, NEW = ↑+Claw boxer uppercut with the new drive frames,
# OLD = unchanged. iPhone landscape 844x390, touch + keyboard. Usage: python3 tests/t49_uppercut_ab.py [URL] [OUT]
import asyncio,time,os,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev49/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,info);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(URL+'?practice=launch&v='+str(time.time()));await pg.wait_for_function('window.PRACTICE&&PRACTICE.on&&window.UC49&&document.getElementById("pruc")',timeout=40000);E=pg.evaluate
  await pg.wait_for_timeout(2500);cdp=await ctx.new_cdp_session(pg)
  async def td(x,y,i):await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':i}]})
  async def tu():await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  R=await E("Object.fromEntries(['up','attack','pruc'].map(k=>{const e=k==='pruc'?document.getElementById('pruc'):document.querySelector(`#ui .b[data-k=${k}]`);const r=e.getBoundingClientRect();return [k,[r.left+r.width/2,r.top+r.height/2,r.left,r.right,r.top,r.bottom]]}))")
  b=R['pruc'];check('UPPERCUT: NEW/OLD button in the Practice Room bar, on screen, defaults to NEW',b[2]>=0 and b[3]<=844 and b[4]>=0 and await E("document.getElementById('pruc').textContent")=='UPPERCUT: NEW' and await E("UC49.mode")=='new',[round(v) for v in b])
  over=await E("(()=>{const a=document.getElementById('pruc').getBoundingClientRect();return [...document.querySelectorAll('#prbar button')].filter(x=>x.id!=='pruc').some(x=>{const r=x.getBoundingClientRect();return r.left<a.right-1&&r.right>a.left+1&&r.top<a.bottom-1&&r.bottom>a.top+1})})()")
  check('button does not overlap the other bar buttons',not over)
  await pg.screenshot(path=OUT+'bar.png')
  async def reset():
   await E("for(const k in K)K[k]=0;p.state='normal';p.t=0;p.vx=0;p.vy=0;p.y=GROUND;p.ground=true;p.wall=false;p.face=1;p.combo=0;p.keepT=0;p.inv=0;p.cool=0;p.idleT=0;C.n=0;"
     "const d=PRACTICE.dummies()[0];d.x=d.home;d.y=GROUND;d.vx=d.vy=0;d.fl=0;d.alive=true;d.hp=Math.max(d.hp||0,50);p.x=d.x-170;window._T=[];window._I=new Set();"
     "if(!window._hook){window._hook=1;(function g(){const s=p.state+':'+p.anim;if(_T[_T.length-1]!==s)_T.push(s);if(UC49.last)_I.add(UC49.last[0]);UC49.last=null;requestAnimationFrame(g)})()}")
   await pg.wait_for_timeout(300)
  async def upkb():
   await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(35);await pg.keyboard.press('x');await pg.keyboard.up('ArrowUp')   # hold ↑, tap Claw (same-frame ↑+X loses the Claw in both versions: existing input rule)
  # ---- NEW, keyboard ----
  await reset();h0=await E("PRACTICE.s.hits");t0=await E("performance.now()");await upkb()
  try:await pg.wait_for_function("p.state==='claw'&&p.anim==='bxpu'&&p.fi>=4",timeout=2000,polling='raf');dt=await E("performance.now()")-t0
  except Exception:dt=9999;print('DBG',await E("[_T.slice(),p.state,p.anim,p.fi]"))
  await pg.wait_for_timeout(60);await pg.screenshot(path=OUT+'new_contact.png');await pg.wait_for_timeout(900)
  v=await E("[_T.slice(),[..._I].sort((a,b)=>a-b),PRACTICE.s.hits,UC49.n.newUp]")
  check('NEW ↑+Claw = boxer uppercut (bxpu), stays on the ground (not the old leap)','claw:bxpu' in v[0] and 'uppercut:uppercut' not in v[0],v[0])
  check('NEW plays the new drive frames (steps 4,5 = N0,N1) and the full sequence',all(i in v[1] for i in [3,4,5,6,9,12]),v[1])
  check('NEW uppercut lands on the dummy (steps in on the drive)',v[2]-h0>=1,v[2]-h0)
  check('NEW startup is short (press -> impact frame under ~0.3 s)',dt<300,round(dt))
  check('NEW ends back in normal, quickly',(await E("p.state"))=='normal')
  # ---- NEW, touch: hold ▲ + tap CLAW ----
  await reset();h0=await E("PRACTICE.s.hits");await td(R['up'][0],R['up'][1],1);await pg.wait_for_timeout(30)
  await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':R['up'][0],'y':R['up'][1],'id':1},{'x':R['attack'][0],'y':R['attack'][1],'id':2}]});await pg.wait_for_timeout(60);await tu();await pg.wait_for_timeout(900)
  v=await E("[_T.slice(),PRACTICE.s.hits]");check('touch ▲ + CLAW = new boxer uppercut, lands','claw:bxpu' in v[0] and v[1]-h0>=1,v)
  # ---- toggle to OLD with the button (touch tap) ----
  await td(b[0],b[1],3);await pg.wait_for_timeout(60);await tu();await pg.wait_for_timeout(300)
  check('tap the button = UPPERCUT: OLD',await E("UC49.mode")=='old' and await E("document.getElementById('pruc').textContent")=='UPPERCUT: OLD')
  await reset();await upkb();await pg.wait_for_timeout(250);await pg.screenshot(path=OUT+'old_up.png');await pg.wait_for_timeout(900);v=await E("[_T.slice(),[..._I]]")
  check('OLD ↑+Claw = the old uppercut, unchanged (no new frames)','uppercut:uppercut' in v[0] and 'claw:bxpu' not in v[0] and not v[1],v)
  # 7th-punch path in OLD: bxpu draws its own sheet (no remap)
  await reset();await E("p.combo=6;P33.last='bxpb';startClaw();setAnim('bxpu',true);p.ft=p.fi=1");await pg.wait_for_timeout(700);v=await E("[..._I]")
  check('OLD: the 7th-punch uppercut is not remapped',not v,v)
  # back to NEW with the \ key
  await pg.keyboard.press('Backslash');await pg.wait_for_timeout(200);check('\\ key = back to NEW',await E("UC49.mode")=='new')
  await reset();await E("p.combo=6;P33.last='bxpb';startClaw();setAnim('bxpu',true);p.ft=p.fi=1");await pg.wait_for_timeout(700);v=await E("[..._I]")
  check('NEW: the 7th-punch uppercut uses the new sequence too',4 in v and 5 in v,v)
  # other moves untouched
  await reset();await E("P33.str=[]")
  for i in range(3):await pg.keyboard.press('x');await pg.wait_for_timeout(280)
  await pg.wait_for_timeout(500);check('Claw ×3 still = JAB, CROSS, LEFT HOOK',(await E("P33.str.slice(0,3)"))==['bxj1','bxx','bxlh'])
  await reset();await pg.keyboard.press('ArrowUp');await pg.wait_for_timeout(120);check('↑ alone still jumps',not await E("p.ground"));await pg.wait_for_timeout(900)
  # idle unchanged
  await reset();await pg.wait_for_timeout(1200);v=await E("[p.anim,(FR[p.anim]||[]).map(f=>f.f)]");check('idle still the steady-face frames',v[0]=='idle' and all('idle_test_1' in f for f in v[1]))
  check('no page errors',not errs,errs[:4])
  print('FAILS:',FAILS);await br.close()
asyncio.run(main())
