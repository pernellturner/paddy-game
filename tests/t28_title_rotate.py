# Simulates iOS rotation: portrait -> landscape where innerWidth/innerHeight are still stale when 'resize'
# and the orientationchange+250ms callback run (iOS reports the new size a little later, visualViewport is right).
import asyncio,sys,time,os
from playwright.async_api import async_playwright
URL=sys.argv[1];OUT=sys.argv[2];os.makedirs(OUT,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  res=[]
  for a,b in [((390,844),(844,390)),((844,390),(390,844)),((844,390),(844,340))]:
   ctx=await br.new_context(viewport={'width':a[0],'height':a[1]},device_scale_factor=2,has_touch=True,is_mobile=True);pg=await ctx.new_page();errs=[]
   pg.on('pageerror',lambda e:errs.append(str(e)))
   await pg.goto(URL+'?story&v='+str(time.time()));await pg.wait_for_function('window.STORY&&STORY.mode==="title"',timeout=30000);await pg.wait_for_timeout(1500)
   await pg.evaluate(f"""(()=>{{window.__st={{w:{a[0]},h:{a[1]}}};Object.defineProperty(window,'innerWidth',{{configurable:true,get:()=>__st?__st.w:document.documentElement.clientWidth}});
    Object.defineProperty(window,'innerHeight',{{configurable:true,get:()=>__st?__st.h:document.documentElement.clientHeight}});}})()""")
   await pg.set_viewport_size({'width':b[0],'height':b[1]})
   await pg.evaluate("dispatchEvent(new Event('orientationchange'))")
   await pg.wait_for_timeout(450)
   await pg.evaluate("window.__st=null")  # iOS now reports the real size, but no further resize event
   await pg.wait_for_timeout(2000)
   tag=f'{a[0]}x{a[1]}_to_{b[0]}x{b[1]}'
   await pg.screenshot(path=OUT+f'rotsim_{tag}.png')
   r=await pg.evaluate("(()=>{const c=document.querySelector('#story canvas');return {canvas:[c.width,c.height],want:[innerWidth*2,innerHeight*2],game:[document.getElementById('c').width,document.getElementById('c').height]}})()")
   print(tag,r,'errs',errs);await ctx.close()
  await br.close()
asyncio.run(main())
