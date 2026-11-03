# v48 KITTI PADDY: quick taps (slip / weave + Claw follow-ups), charged punches (haymaker / power jab), pink-sheet move art,
# no turn flicker before the dodge, tap-Claw chains keep the combo counting. iPhone landscape 844x390, touch + keyboard.
# Usage: python3 tests/t48_kitti_taps.py [URL] [OUT]
import asyncio,time,os,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev48/';os.makedirs(OUT,exist_ok=True)
FAILS=[]
def check(nm,ok,info=''):
 print(('PASS ' if ok else 'FAIL ')+nm,info);(None if ok else FAILS.append(nm))
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':844,'height':390},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(URL+'?practice=launch&v='+str(time.time()));await pg.wait_for_function('window.PRACTICE&&PRACTICE.on&&window.KD48',timeout=40000);E=pg.evaluate
  await pg.wait_for_timeout(2500)
  cdp=await ctx.new_cdp_session(pg)
  async def tdown(x,y,i=1):await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':i}]})
  async def tup():await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  async def ttap(q,hold=70):await tdown(q[0],q[1]);await pg.wait_for_timeout(hold);await tup()
  R=await E("Object.fromEntries(['up','left','right','down','attack','jump'].map(k=>{const r=document.querySelector(`#ui .b[data-k=${k}]`).getBoundingClientRect();return [k,[r.left+r.width/2,r.top+r.height/2]]}))")
  async def reset(x=260):
   await E("for(const k in K)K[k]=0;for(const k in P)delete P[k];p.state='normal';p.t=0;p.vx=0;p.vy=0;p.y=GROUND;p.ground=true;p.wall=false;p.face=1;p.combo=0;p.keepT=0;p.inv=0;p.kdCool=0;p.dashCool=0;p.cool=0;p.kpUsed=false;"
     "KD47.req=null;KD47.fu=null;KD47.last={};C.n=0;C.t=0;KD47.seen.clear();Object.assign(KD48,{H:{},req:null,ctx:null,ch:null,lastFwd:-9,faces:[]});if(KD48.pow){KD48.pow=null}KD48.seen.clear();KD48.anims.clear();for(const k in KD48.n)KD48.n[k]=0;KD48.log.length=0;"
     "const d=PRACTICE.dummies()[0];d.x=d.home;d.y=GROUND;d.vx=d.vy=0;d.fl=0;d.ps='idle';d.pt=0;d.st='idle';d.i=0;d.alive=true;d.h=165;d.hp=Math.max(d.hp||0,50);p.x=d.x-%s"%x)
   await pg.wait_for_timeout(350)
  async def key(k,hold=60):await pg.keyboard.down(k);await pg.wait_for_timeout(hold);await pg.keyboard.up(k)
  N=lambda: E("Object.assign({},KD48.n)")
  S=lambda s: E(f"KD48.seen.has('{s}')")
  AN=lambda s: E(f"KD48.anims.has('{s}')")
  hits=lambda: E("PRACTICE.s.hits")
  # ---- 1. quick tap back = SLIP, no turn ----
  await reset(200);x0=await E("p.x");await E("KD48.faces=[]");await key('ArrowLeft',60);await pg.wait_for_timeout(110);await pg.screenshot(path=OUT+'slip.png');await pg.wait_for_timeout(300)
  v=await E("[KD48.seen.has('kslip'),p.face,Math.min(...KD48.faces),KD47.n.dodge,KD48.anims.has('kslip:bxpj')]");x1=await E("p.x")
  check('tap ← = SLIP: lean-back step, never turns round, pink sheet, no dodge',v[0] and v[1]==1 and v[2]==1 and v[4] and 30<x0-x1<120,[v,round(x0-x1)])
  # hold back = turn + walk
  await reset();x0=await E("p.x");await key('ArrowLeft',600);await pg.wait_for_timeout(100);v=await E("[p.face,KD48.n.slip]");x1=await E("p.x")
  check('hold ← = turns and walks back (no slip)',v==[-1,0] and x1<x0-60,[v,round(x0-x1)])
  # double back = dodge, facing never flips (the old 1-frame turn flicker)
  await reset(150);await E("KD48.faces=[]");await key('ArrowLeft');await pg.wait_for_timeout(90);await key('ArrowLeft');await pg.wait_for_timeout(120);await pg.screenshot(path=OUT+'dodge.png');await pg.wait_for_timeout(400)
  v=await E("[KD47.seen.has('kdodge'),Math.min(...KD48.faces),Math.max(...KD48.faces),KD48.anims.has('kdodge:bxpj'),p.face]")
  check('← ← = DODGE backstep on the pink sheet, face never flips (no turn flicker)',v[0] and v[1]==1 and v[2]==1 and v[3] and v[4]==1,v)
  # ---- 2. quick tap down = WEAVE; hold = crouch; double = slide ----
  await reset(200);await key('ArrowDown',60);await pg.wait_for_timeout(120);await pg.screenshot(path=OUT+'weave.png');await pg.wait_for_timeout(300)
  check('tap ↓ = WEAVE (pink sheet), no slide',await S('kweave') and await AN('kweave:bxpb') and await E("KD47.n.slide")==0,await N())
  await reset();await pg.keyboard.down('ArrowDown');await pg.wait_for_timeout(450);a=await E("p.anim");await pg.keyboard.up('ArrowDown');await pg.wait_for_timeout(200)
  check('hold ↓ = crouch, no weave',(await N())['weave']==0 and 'crouch' in a,a)
  await reset();await key('ArrowDown');await pg.wait_for_timeout(90);await key('ArrowDown');await pg.wait_for_timeout(150);await pg.screenshot(path=OUT+'slide.png');await pg.wait_for_timeout(500)
  check('↓ ↓ = CAT SLIDE (from the weave), pink sheet',await E("KD47.seen.has('kslide')") and await AN('kslide:bxpb'))
  # ---- 3. tap + Claw ----
  await reset(200);h0=await hits();await key('ArrowDown',60);await pg.wait_for_timeout(70);await key('x',60);await pg.wait_for_timeout(150);await pg.screenshot(path=OUT+'weave_hook.png');await pg.wait_for_timeout(500)
  check('tap ↓ then Claw = WEAVE HOOK (left hook sheet), hits',await AN('claw:bxlh') and (await N())['weavehook']==1 and await hits()>h0,[await N(),await hits()-h0])
  await reset(200);h0=await hits();await key('ArrowLeft',60);await pg.wait_for_timeout(80);await key('x',60);await pg.wait_for_timeout(650)
  check('tap ← then Claw = SLIP JAB, hits',await AN('claw:bxj2') and (await N())['slipjab']==1 and await hits()>h0,[await N(),await hits()-h0])
  # ---- 4. quick Claw taps = the normal string, no charge ----
  await reset(200);await E("P33.str=[]")
  for i in range(3):await key('x',60);await pg.wait_for_timeout(260)
  await pg.wait_for_timeout(500);v=await E("[P33.str.slice(0,3),KD48.seen.has('kcharge')]")
  check('Claw tap ×3 = JAB, CROSS, LEFT HOOK (no charge)',v==[['bxj1','bxx','bxlh'],False],v)
  # normal hook knockback (for comparison)
  async def kbdist(fn):
   await reset(200);await E("window._kx=0;const d=PRACTICE.dummies()[0];window._kd=setInterval(()=>{_kx=Math.max(_kx,Math.abs(d.x-d.home))},16)");await fn();await pg.wait_for_timeout(900);v=await E("clearInterval(_kd),_kx");return v
  async def hook3():
   for i in range(3):await key('x',60);await pg.wait_for_timeout(260)
  kh=await kbdist(hook3)
  # ---- 5. hold Claw = HAYMAKER ----
  async def hay():
   await pg.keyboard.down('x');await pg.wait_for_timeout(500);await pg.screenshot(path=OUT+'charge.png');await pg.wait_for_timeout(250);await pg.keyboard.up('x');await pg.wait_for_timeout(110);await pg.screenshot(path=OUT+'haymaker.png')
  h0=await hits();khay=await kbdist(hay);v=await E("[KD48.seen.has('kcharge'),KD48.anims.has('claw:bxph'),KD48.n.haymaker,KD48.log.filter(s=>/powhit|charged/.test(s))]")
  check('hold Claw = wind-up (charge) then HAYMAKER (power hook sheet), full charge, lands',v[0] and v[1] and v[2]==1 and 'charged' in v[3] and 'powhit:hay' in v[3],v)
  check('haymaker knocks back much further than the normal hook',khay>kh*1.5 and khay>150,[round(kh),round(khay)])
  # ---- 6. tap forward + hold Claw = POWER JAB ----
  await reset(230);await key('ArrowRight',50);await pg.wait_for_timeout(60);await pg.keyboard.down('x');await pg.wait_for_timeout(700);await pg.keyboard.up('x');await pg.wait_for_timeout(100);await pg.screenshot(path=OUT+'powerjab.png');await pg.wait_for_timeout(600)
  v=await E("[KD48.n.powerjab,KD48.anims.has('claw:bxpj'),KD48.log.filter(s=>/powhit/.test(s))]")
  check('tap → then hold Claw = POWER JAB, lands',v[0]==1 and v[1] and 'powhit:jab' in v[2],v)
  # short hold (0.15-0.3 s) = just the normal punch, no power
  await reset(200);await pg.keyboard.down('x');await pg.wait_for_timeout(200);await pg.keyboard.up('x');await pg.wait_for_timeout(600);v=await N()
  check('short hold (0.2 s) = normal punch, no power punch',v['haymaker']==0 and v['powerjab']==0 and v['lighttap']==1,v)
  # ---- 7. free chain keeps the counter: Claw, ↓, Claw, ←, Claw, hold Claw ----
  await reset(200);ns=[]
  async def cn():ns.append(await E("C.n"))
  await key('x',60);await pg.wait_for_timeout(330);await cn()
  await key('ArrowDown',60);await pg.wait_for_timeout(60);await key('x',60);await pg.wait_for_timeout(330);await cn()
  await E("const d=PRACTICE.dummies()[0];p.x=d.x-200")
  await key('ArrowLeft',60);await pg.wait_for_timeout(70);await key('x',60);await pg.wait_for_timeout(330);await cn()
  await E("const d=PRACTICE.dummies()[0];p.x=d.x-200;d.y=GROUND;d.vy=0")
  await pg.keyboard.down('x');await pg.wait_for_timeout(500);await pg.keyboard.up('x');await pg.wait_for_timeout(250);await cn()
  lg=await E("KD48.log.slice()")
  check('chain Claw · ↓+Claw · ←+Claw · hold Claw: the hit counter keeps climbing',ns==sorted(ns) and len(set(ns))==4 and ns[0]>=1,[ns,lg])
  # ---- 8. no false triggers ----
  await reset();await key('ArrowRight',60);await pg.wait_for_timeout(400);v=await N();check('tap → alone = nothing extra (no slip / weave / charge)',sum(v.values())==0,v)
  await reset();x0=await E("p.x");await key('ArrowRight',500);await pg.wait_for_timeout(100);v=await N();check('hold → = walks (no tap moves)',sum(v.values())==0 and await E("p.x")>x0+60)
  await reset();await key('ArrowLeft',220);await pg.wait_for_timeout(400);v=await N();check('slow press ← (0.22 s) = no slip (just a turn)',v['slip']==0 and await E("p.face")==-1,v)
  # ---- 9. touch ----
  await reset();await ttap(R['left'],70);await pg.wait_for_timeout(350);check('touch tap ◀ = slip, still facing right',await S('kslip') and await E("p.face")==1)
  await reset(200);h0=await hits();await ttap(R['down'],70);await pg.wait_for_timeout(60);await ttap(R['attack'],70);await pg.wait_for_timeout(600)
  check('touch tap ▼ then CLAW = weave hook, hits',(await N())['weavehook']==1 and await hits()>h0,await N())
  await reset(200);await tdown(*R['attack']);await pg.wait_for_timeout(750);await tup();await pg.wait_for_timeout(120);await pg.screenshot(path=OUT+'touch_haymaker.png');await pg.wait_for_timeout(600)
  check('touch hold CLAW = haymaker',(await N())['haymaker']==1,await N())
  await reset();x0=await E("p.x");await tdown(*R['left']);await pg.wait_for_timeout(500);await tup();await pg.wait_for_timeout(100)
  check('touch hold ◀ = turns and walks',await E("p.face")==-1 and await E("p.x")<x0-50 and (await N())['slip']==0)
  await reset();await ttap(R['left'],70);await pg.wait_for_timeout(100);await ttap(R['left'],70);await pg.wait_for_timeout(400);check('touch ◀ ◀ = dodge',await E("KD47.seen.has('kdodge')"))
  # idle face unchanged
  await reset();await pg.wait_for_timeout(1200);v=await E("[p.anim,(FR[p.anim]||[]).map(f=>f.f)]");check('idle still uses the steady-face frames',v[0]=='idle' and all('idle_test_1' in f for f in v[1]),v[0])
  await pg.screenshot(path=OUT+'idle.png')
  check('no page errors',not errs,errs[:4])
  print('FAILS:',FAILS)
  await br.close()
asyncio.run(main())
