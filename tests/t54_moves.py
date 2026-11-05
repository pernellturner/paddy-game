# v54: power uppercut reads differently from the tap, dash uppercut, ground pound.
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
FAILS = []
def check(nm, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + nm, info)
    if not ok: FAILS.append(nm)

async def boot(pw):
    br = await pw.chromium.launch(executable_path='/usr/local/bin/google-chrome', args=['--no-sandbox'])
    pg = await (await br.new_context(viewport={'width': 1100, 'height': 640})).new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL + '?nostory&practice=launch&v=54')
    await pg.wait_for_function("typeof started!=='undefined'&&started&&PRACTICE.on&&window.UC49", timeout=30000)
    await pg.evaluate("UC49.set('new'); r11Sq()")
    await pg.wait_for_function("() => { try{r11Sq()}catch(e){} return !!(UC49.N&&UC49.N.deepc&&imgOK(IMG[UC49.N.deepc.f])) }", timeout=20000)
    return br, pg, errs

async def main():
    async with async_playwright() as pw:
        br, pg, errs = await boot(pw)
        info = await pg.evaluate("""() => {
          const ys=[]; for (const t of [0,2,2.8,3.9,6]) { const m=UC49.motion(t); ys.push([m.y,m.s]); }
          const names=a=>a.map(s=>s[0].f.split('/').pop());
          return {ys, tap:names(UC49.seqTap), pow:names(UC49.seqPow), deepc:UC49.N.deepc.f};
        }""")
        print('SEQ pow', info['pow'])
        check('no page errors', not errs, errs[:2])
        check('tap motion does not hop or resize', all(abs(y)<1e-6 and abs(s-1)<1e-6 for y,s in info['ys']), info['ys'])
        check('power swing uses the deeper coil the tap does not', 'k_uc54_deepc' in info['pow'] and 'k_uc54_deepc' not in info['tap'], info['tap'])
        # power release starts at the beginning of that coil
        await pg.evaluate("""() => {
          const d=dummies.find(d=>d.alive&&!d.benched); d.x=p.x+400; d.y=GROUND; d.vy=0;
          p.state='normal'; p.ground=true; p.y=GROUND; p.vy=0; p.face=1; KD48.pow=null; KD48.ch=null; KD48.log.length=0;
          press('up'); press('attack');
        }""")
        await pg.wait_for_timeout(650)
        await pg.evaluate("release('attack'); release('up');")
        await pg.wait_for_timeout(40)
        rel = await pg.evaluate("[p.state, KD48.pow&&KD48.pow.kind, p.ft, p.y, UC49.last]")
        print('POWER', rel)
        check('power release is on the ground at the start of the coil', rel[0]=='claw' and rel[1]=='up' and rel[2]<1.2 and abs(rel[3]-470)<3, rel)
        check('power picture is a crouch coil, not the tap load or the straight arm', rel[4] and 'k_uc51_2' not in rel[4][2] and 'k_uc52_5' not in rel[4][2], rel)
        # dash uppercut
        await pg.evaluate("""() => {
          release('up'); release('attack'); K.up=K.jump=K.attack=0;
          const d=dummies.find(d=>d.alive&&!d.benched); d.x=p.x+100; d.y=GROUND; d.vy=0; d.vx=0; d.hp=90; d.last=-1;
          p.state='dash'; p.ground=true; p.y=GROUND; p.vy=0; p.vx=700; p.face=1; p.t=.05; KD48.log.length=0;
        }""")
        await pg.evaluate("P.attack=1; dashStrike();")
        await pg.wait_for_timeout(80)
        du = await pg.evaluate("[p.state, p.y, p.ground, Math.round(p.vx), KD48.log.slice(-3)]")
        print('DASH', du)
        hit=None
        for _ in range(15):
            await pg.wait_for_timeout(30)
            st=await pg.evaluate("""() => { const d=dummies.find(x=>x&&x.alive); return [p.state,p.y,p.ground,d&&Math.round(d.vy),KD48.log.filter(x=>x==='dashup:hit').length]; }""")
            if st[4]: hit=st; break
        print('DASH HIT', hit)
        check('claw during a dash is the dash uppercut', du[0]=='kduc' and du[2] and abs(du[1]-470)<3, du)
        check('dash uppercut launches and stays on the floor', hit and hit[2] and abs(hit[1]-470)<3 and hit[3]<=-900, hit)
        # ground pound from a jump
        await pg.evaluate("""() => {
          const d=dummies.find(d=>d.alive&&!d.benched); d.x=p.x+60; d.y=GROUND; d.vy=0; d.hp=90; d.last=-1;
          p.state='normal'; p.ground=false; p.y=GROUND-180; p.vy=40; p.face=1; p.jumps=1; KD48.log.length=0;
          P.down=1; P.attack=1; K.down=1;
        }""")
        early=None
        for _ in range(12):
            await pg.wait_for_timeout(40)
            st=await pg.evaluate("[p.state, p.ground, Math.round(p.y)]")
            if st[0]=='kpound':
                early=st
                break
        print('POUND EARLY', early)
        landed=None
        for _ in range(25):
            await pg.wait_for_timeout(40)
            st=await pg.evaluate("[p.state, p.ground, Math.round(p.y), KD48.log.includes('pound:hit'), shake]")
            if st[3]: landed=st; break
        print('POUND', landed)
        check('down+claw in the air starts the ground pound', early[0]=='kpound' and not early[1], early)
        check('ground pound hits when he reaches the floor', landed and landed[1] and landed[3], landed)
        # OLD keeps the dash strike
        await pg.evaluate("""() => { UC49.set('old'); p.state='dash'; p.ground=true; p.y=GROUND; p.vy=0; p.t=.05; p.face=1; }""")
        await pg.evaluate("dashStrike()")
        old=await pg.evaluate("[p.state, UC49.mode]")
        print('OLD DASH', old)
        check('OLD dash+claw is still the dash strike', old[0]=='dashstrike' and old[1]=='old', old)
        await br.close()
    print('FAILS', FAILS)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
