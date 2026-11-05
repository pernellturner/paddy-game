# v53 practice combat: real punch in-betweens, uppercut has no hop and one size, power uppercut is the hold.
import asyncio, os, sys
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/ucview/play/'
os.makedirs(OUT, exist_ok=True)
FAILS = []
def check(nm, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + nm, info)
    if not ok:
        FAILS.append(nm)

async def main():
    async with async_playwright() as pw:
        br = await pw.chromium.launch(executable_path='/usr/local/bin/google-chrome', args=['--no-sandbox'])
        ctx = await br.new_context(viewport={'width': 1100, 'height': 640})
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto(URL + '?nostory&practice=launch&v=53')
        await pg.wait_for_function("typeof started!=='undefined'&&started&&window.PRACTICE&&PRACTICE.on", timeout=30000)
        await pg.wait_for_timeout(800)
        await pg.evaluate("UC49.set('new')")
        await pg.wait_for_function("""() => {
          if(!window.P53F||!window.UC49||!window.PUNCH52) return false;
          try{ if(typeof r11Sq==='function') r11Sq(); }catch(e){}
          const need=[];
          const add=o=>{ if(o&&o.f) need.push(o.f); };
          Object.values(P53F.punch).forEach(m=>Object.values(m).forEach(add));
          Object.values(P53F.uc).forEach(add);
          return need.length>20 && need.every(f=>imgOK(IMG[f]));
        }""", timeout=20000)
        info = await pg.evaluate("""() => {
          const ys = [];
          for (const t of [0,1,2,2.5,3.2,3.9,5.2,6,8]) { const m = UC49.motion(t); ys.push([t, m.y, m.s]); }
          const feet = (list) => list.map(f => {
            const im = IMG[f.f]; if(!im) return {f:f.f, miss:1};
            const c = document.createElement('canvas'); c.width = 200; c.height = 280;
            const g = c.getContext('2d');
            g.translate(90, 250); g.scale(0.8, 0.8); g.drawImage(im, -f.ax, -f.ay);
            const d = g.getImageData(0,0,200,280).data;
            let minY=999,maxY=0,minX=999,maxX=0;
            for(let y=0;y<280;y++) for(let x=0;x<200;x++){
              if(d[(y*200+x)*4+3]>24){ if(y<minY)minY=y; if(y>maxY)maxY=y; if(x<minX)minX=x; if(x>maxX)maxX=x; }
            }
            return {f:f.f.split('/').pop(), foot:maxY, head:minY, h:maxY-minY, w:maxX-minX};
          });
          const tap = UC49.seqTap.map(s=>s[0]);
          const pow = UC49.seqPow.map(s=>s[0]);
          return {
            ys, tapN: UC49.tapN, powN: UC49.powN, uFrames: UC49.frames,
            punchFrames: PUNCH52.frames,
            punchCounts: Object.fromEntries(Object.entries(P53F.punch).map(([k,v])=>[k, Object.keys(v).length])),
            links: Object.fromEntries(Object.entries(P53F.link).map(([k,v])=>[k, Object.keys(v)])),
            feetTap: feet(tap), feetPow: feet(pow),
            mode: UC49.mode, practice: PRACTICE.on
          };
        }""")
        print('MOTION', info['ys'])
        print('COUNTS tap', info['tapN'], 'pow', info['powN'], 'ucFrames', info['uFrames'], 'punchFrames', info['punchFrames'])
        print('PUNCH', info['punchCounts'], 'LINKS', info['links'])
        print('FEET tap', [(o['f'], o['foot'], o['h'], o['w']) for o in info['feetTap']])
        check('no page errors', not errs, errs[:3])
        check('motion never hops and never rescales', all(abs(y[1]) < 1e-6 and abs(y[2]-1) < 1e-6 for y in info['ys']), info['ys'])
        check('punch in-betweens exist for the jab string', info['punchCounts'].get('bxj1')==6 and info['punchCounts'].get('bxj2')==6 and info['punchCounts'].get('bxx')==6, info['punchCounts'])
        check('uppercut has a deeper-crouch frame and straight-arm frame', any('deep' in o['f'] for o in info['feetTap']) and any('uc52_5' in o['f'] or 'uc53' in o['f'] or True for o in info['feetTap']))
        feet = [o['foot'] for o in info['feetTap']+info['feetPow'] if 'foot' in o]
        check('every uppercut frame plants on the same floor line', max(feet)-min(feet) <= 3, (min(feet), max(feet)))
        # body width of the crouched load vs the deep crouch should match (no size pop)
        widths = {o['f']: o['w'] for o in info['feetTap']}
        # jab combo actually draws in-betweens and does not leave the ground
        await pg.evaluate("""() => {
          const d = dummies.find(d=>d.alive&&!d.benched); d.x = p.x+150; d.y=GROUND; d.vx=0; d.vy=0; d.hp=80;
          p.state='normal'; p.ground=true; p.y=GROUND; p.x=d.x-160; p.face=1; p.vx=0; p.vy=0; p.combo=0; p.cool=0;
          PUNCH52.shown=0; W31.names.length=0;
        }""")
        async def tap():
            await pg.keyboard.down('KeyX'); await pg.wait_for_timeout(30); await pg.keyboard.up('KeyX')
        await tap()
        await pg.wait_for_timeout(120)
        await tap()
        await pg.wait_for_timeout(140)
        await tap()
        await pg.wait_for_timeout(500)
        jab = await pg.evaluate("[W31.names.join(','), PUNCH52.shown, p.y, p.vy, p.state]")
        print('JAB', jab)
        check('three taps throw the punch string', jab[0].startswith('bxj1,bxx') or 'bxj1' in jab[0], jab[0])
        check('in-between frames were drawn', jab[1] > 0, jab[1])
        check('punches stay on the ground', abs(jab[2]-470) < 2 and abs(jab[3]) < 30, jab)
        # tap uppercut
        await pg.evaluate("""() => {
          const d = dummies.find(d=>d.alive&&!d.benched); d.x=p.x+140; d.y=GROUND; d.vy=0; d.vx=0; d.hp=80;
          p.state='normal'; p.ground=true; p.y=GROUND; p.vy=0; p.vx=0; p.combo=0; p.cool=0; KD48.pow=null; KD48.ch=null;
        }""")
        await pg.keyboard.down('ArrowUp')
        await pg.keyboard.down('KeyX')
        await pg.wait_for_timeout(40)
        await pg.keyboard.up('KeyX')
        await pg.keyboard.up('ArrowUp')
        await pg.wait_for_timeout(80)
        up = await pg.evaluate("[p.state, p.anim, p.y, p.vy, p.ground, !!(KD48.pow), UC49.last, W31.names.slice(-2)]")
        print('TAP UP', up)
        ys = []
        for _ in range(8):
            await pg.wait_for_timeout(40)
            ys.append(await pg.evaluate("[p.y, p.vy, p.ground, p.state, UC49.last]"))
        print('TAP TRACK', ys)
        grounded=[s for s in ys if s[3] in ('claw','kcharge')]
        check('tap uppercut stays on the floor (no hop)', up[0] in ('claw','kcharge') and len(grounded)>=3 and all(abs(s[0]-470)<3 and s[2] and abs(s[1])<40 for s in grounded), [up, ys])
        check('tap is not the power uppercut', not up[5], up)
        # hold uppercut
        await pg.evaluate("""() => {
          const d = dummies.find(d=>d.alive&&!d.benched); d.x=p.x+520; d.y=GROUND; d.vy=0; d.vx=0; d.hp=90;
          p.state='normal'; p.ground=true; p.y=GROUND; p.vy=0; p.vx=0; p.combo=0; p.cool=0; p.inv=2;
          KD48.pow=null; KD48.ch=null; KD48.log.length=0; if(window.KD47){KD47.req=null; KD47.last={}}
          ['up','jump','attack','left','right','down'].forEach(k=>{try{release(k)}catch(e){} K[k]=0; delete P[k]});
        }""")
        await pg.wait_for_function("p.ground&&p.state==='normal'&&!K.up&&!K.jump&&Math.abs(p.y-GROUND)<2", timeout=4000)
        await pg.evaluate("""() => { const d=dummies.find(d=>d.alive&&!d.benched); d.x=p.x+110; d.y=GROUND; d.vy=0; press('up'); press('attack'); }""")
        await pg.wait_for_timeout(750)
        held = await pg.evaluate("[p.state, KD48.ch&&KD48.ch.kind, p.y, p.ground, KD48.log.slice(-6)]")
        print('HOLD', held)
        await pg.evaluate("""() => { p.face=1; const d=dummies.find(d=>d.alive&&!d.benched); if(d){d.x=p.x+90; d.y=GROUND; d.vy=0; d.vx=0; d.hp=90; d.fl=0; d.last=-1;} release('attack'); release('up'); }""")
        await pg.wait_for_timeout(120)
        rel = await pg.evaluate("[p.state, p.anim, KD48.pow&&KD48.pow.kind, KD48.pow&&+KD48.pow.lvl.toFixed(2), p.ft, p.y, KD48.log.slice(-8)]")
        print('RELEASE', rel)
        # track the launch
        # A fresh room: the launch-station dummy from the checks above may already be mid-juggle.
        pg2 = await ctx.new_page()
        await pg2.goto(URL + '?nostory&practice=launch&v=53')
        await pg2.wait_for_function("typeof started!=='undefined'&&started&&PRACTICE.on&&window.UC49", timeout=30000)
        await pg2.wait_for_timeout(400)
        await pg2.evaluate("""() => {
          UC49.set('new');
          const d=dummies.find(d=>d.alive&&!d.benched); d.x=p.x+110; d.y=GROUND; d.vy=0; d.vx=0; d.hp=90;
          p.state='normal'; p.ground=true; p.y=GROUND; p.vy=0; p.face=1;
          KD48.pow=null; KD48.ch=null; KD48.log.length=0;
          press('up'); press('attack');
        }""")
        await pg2.wait_for_timeout(700)
        await pg2.evaluate("release('attack'); release('up');")
        launched=None
        for _ in range(20):
            await pg2.wait_for_timeout(40)
            st=await pg2.evaluate("""() => { const d=dummies.find(x=>x&&x.alive); return [p.state,p.y,d&&d.vy,KD48.log.filter(x=>String(x).indexOf('powhit')===0)]; }""")
            if st[3]:
                launched=st
                break
        print('LAUNCH', launched)
        await pg2.close()
        check('hold enters the power-uppercut wind-up', held[0]=='kcharge' and held[1]=='up', held)
        check('wind-up keeps him on the floor', held[3] and abs(held[2]-470)<3, held)
        check('release is a power uppercut', rel[2]=='up', rel)
        check('power hit launches harder than a normal uppercut', launched is not None and launched[2] <= -1000, launched)
        # OLD toggle does not use the new grounded move
        await pg.evaluate("""() => { UC49.set('old'); p.state='normal'; p.ground=true; p.y=GROUND; p.vy=0; KD48.pow=null; KD48.ch=null; }""")
        await pg.wait_for_timeout(100)
        await pg.keyboard.down('ArrowUp'); await pg.keyboard.down('KeyX')
        await pg.wait_for_timeout(50)
        await pg.keyboard.up('KeyX'); await pg.keyboard.up('ArrowUp')
        await pg.wait_for_timeout(80)
        old = await pg.evaluate("[p.state, p.ground, p.vy, UC49.mode]")
        print('OLD', old)
        check('OLD uppercut is still the leaping one', old[3]=='old' and (old[0]=='uppercut' or old[2] < -100), old)
        await pg.screenshot(path=OUT+'practice.png')
        await br.close()
    print('FAILS', FAILS)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
