import asyncio,time,os
from playwright.async_api import async_playwright
OUT='/workspace/rev31/';os.makedirs(OUT,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  ctx=await br.new_context(viewport={'width':1024,'height':340},device_scale_factor=2,has_touch=True,is_mobile=True)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type in('warning','error') and errs.append(m.text))
  await pg.goto('http://localhost:8765/?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);E=pg.evaluate
  await E("TRAIN.open()");await pg.wait_for_timeout(800);await E("TRAIN.pick(0)");await pg.wait_for_timeout(2000);await E("document.body.classList.remove('fp')");await pg.wait_for_timeout(3500)
  print('loaded',await E("[!!window.BOX31,FR.pc1&&FR.pc1[0].f,FR.pc7&&FR.pc7[0].f,FR.kguard&&FR.kguard[0].f,['k_bx_jab','k_bx_hook','k_bx_body','k_bx_uppercut'].map(s=>F[s].every(q=>imgOK(IMG[q.f])))]"))
  setup="(()=>{const ds=dummies.filter(d=>d.alive&&!d.benched);ds.forEach((q,i)=>{if(i){q.x=120+i*40;q.vx=0}});const d=ds[0];d.x=600;p.state='normal';p.ground=true;p.y=GROUND;p.x=d.x-150;p.face=1;p.vx=0;p.combo=0;d.hp=Math.max(d.hp,60);d.y=GROUND;d.vx=0;d.vy=0;W31.names.length=0;W31.hits={};SND.tierLog.length=0;window.SAYS=[];if(!window._sw){window._sw=1;const s=say;say=function(t){SAYS.push(t);return s.apply(this,arguments)}}})()"
  async def chain(shots=None,n=8):
   await E(setup);await pg.wait_for_timeout(300)
   for i in range(n):
    if i>0:
     c=await E("p.combo")
     need=.21 if c>=3 else .19
     await pg.wait_for_function(f"p.state!=='claw'||p.t>={need}",timeout=3000,polling='raf')
    await pg.keyboard.down('KeyX');await pg.wait_for_timeout(30);await pg.keyboard.up('KeyX')
    if shots and i<7:
     ex=await E("K29EXT[p.anim]||.08")
     await pg.wait_for_function(f"p.state!=='claw'||p.t>={ex-.025}",timeout=2000,polling='raf');await pg.screenshot(path=OUT+f'{shots}_{i+1}a_swing.png',clip={'x':360,'y':60,'width':400,'height':270})
     await pg.wait_for_function(f"p.state!=='claw'||p.t>={ex+.03}",timeout=2000,polling='raf');await pg.screenshot(path=OUT+f'{shots}_{i+1}b_impact.png',clip={'x':360,'y':60,'width':400,'height':270})
   await pg.wait_for_timeout(150)
   r=await E("[W31.names.join(','),JSON.stringify(W31.hits),p.state,W30.air,SAYS.filter(s=>/JAB|HOOK|BODY|UPPER|JUGGLE|GRAB/.test(s)).join('|'),SND.tierLog.join('')]")
   if shots: await pg.screenshot(path=OUT+f'{shots}_8_grab.png')
   await pg.wait_for_timeout(3500);return r
  print('chain1',await chain('box'))
  print('chain2',await chain(None))
  # 3-hit basic + turn mid-combo
  await E(setup);await pg.wait_for_timeout(200)
  await pg.keyboard.press('KeyX');await pg.wait_for_timeout(200);await pg.keyboard.press('ArrowLeft');await pg.wait_for_timeout(60)
  print('turn',await E("[p.face,p.state,p.anim,K29.turns]"));await pg.wait_for_timeout(1000)
  print('errs',errs);await br.close()
asyncio.run(main())
