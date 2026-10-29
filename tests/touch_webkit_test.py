import asyncio,time
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as pw:
    br=await pw.webkit.launch()
    for W,H in [(1024,340),(844,390),(932,430)]:
      ctx=await br.new_context(viewport={'width':W,'height':H},device_scale_factor=2,has_touch=True,is_mobile=True);pg=await ctx.new_page();errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto('http://localhost:8765/?story&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started&&window.STORY&&STORY.mode==="title"',timeout=30000);await pg.wait_for_timeout(1500)
      async def tap(sel):
        r=await pg.evaluate("s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}",sel);await pg.touchscreen.tap(*r);await pg.wait_for_timeout(400)
      await tap('#sprac');await pg.wait_for_timeout(1600);a=await pg.evaluate("[document.body.classList.contains('train'),document.body.classList.contains('fp')]")
      await tap('#fpick [data-f="9"]');await pg.wait_for_timeout(1200);f=await pg.evaluate("FORM()")
      await pg.screenshot(path=f'/workspace/rev18/wk_controls_{W}x{H}.png')
      await pg.evaluate("window.LOG=[];const _p=press;press=k=>{LOG.push(k);_p(k)};0")
      for k in ['attack','jump','special','tail','blink','hunt','left','right','down']: await tap(f'#ui .b[data-k={k}]')
      lg=await pg.evaluate("LOG");held=await pg.evaluate("Object.keys(K).filter(k=>K[k])")
      await tap('#tmoves');m=await pg.evaluate("document.body.classList.contains('ov')")
      print(W,H,'train/picker',a,'form',f,'pressed',lg,'held',held,'moves',m,'scroll',await pg.evaluate("[scrollX,scrollY]"),'errs',errs)
      await ctx.close()
    await br.close()
asyncio.run(main())
