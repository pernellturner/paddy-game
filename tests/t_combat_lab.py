# Combat Lab: branching punches, jump-cancel, air juggle, and the main game left unchanged.
# Usage: python3 tests/t_combat_lab.py [BASE_URL]
import asyncio, sys
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765'
FAILS = []

def check(nm, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + nm, info)
    if not ok:
        FAILS.append(nm)

async def boot(pw, path, w=1100, h=640, touch=False):
    br = await pw.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = await br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch)
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL + path)
    await pg.wait_for_function(
        """() => typeof started!=='undefined' && started && window.PRACTICE && PRACTICE.on
            && F && F.k_ps_jab1 && F.k_ps_jab1[0] && imgOK(IMG[F.k_ps_jab1[0].f])""",
        timeout=45000)
    await pg.wait_for_timeout(400)
    return br, pg, errs

RESET = """() => {
  window.STORYPAUSE = true;
  for (const k in K) K[k] = 0;
  for (const k in P) delete P[k];
  if (window.KD48) KD48.H = {};
  if (window.KD47) KD47.req = null;
  if (window.CLAB) { CLAB.holdJump = 0; CLAB.want = false; CLAB.route.length = 0; CLAB.airN = 0; CLAB.log.length = 0; }
  p.state = 'normal'; p.t = 0; p.vx = 0; p.vy = 0; p.y = GROUND; p.ground = true; p.wall = false;
  p.face = 1; p.combo = 0; p.keepT = 0; p.cool = 0; p.jumps = 0; p.anim = 'idle'; p.hunt = false;
  if (window.P33) { P33.q = null; P33.a = null; P33.last = ''; P33.str = []; P33.beat = true; P33.on = false; P33.legacy = false; }
  const d = dummies.find(x => x.sp) || dummies.find(x => x.alive) || dummies[0];
  d.alive = true; d.benched = false; d.x = 720; d.y = GROUND; d.vx = 0; d.vy = 0; d.fl = 0; d.hp = 80;
  p.x = 300;
  return d.x;
}"""

async def step(pg, n):
    await pg.evaluate("(n) => { for (let i = 0; i < n; i++) { update(1/60); updCombo(1/60); } }", n)

async def tap(pg, k):
    await pg.evaluate("(k) => { press(k); release(k); }", k)

async def until(pg, expr, n=120):
    return await pg.evaluate("""(arg) => {
      const {expr, n} = arg;
      for (let i = 0; i < n; i++) {
        if (eval(expr)) return {ok:true, i, state:p.state, anim:p.anim, fi:p.fi, ground:p.ground, y:Math.round(p.y), vy:Math.round(p.vy)};
        update(1/60); updCombo(1/60);
      }
      return {ok:false, state:p.state, anim:p.anim, fi:p.fi, ground:p.ground, y:Math.round(p.y), vy:Math.round(p.vy)};
    }""", {'expr': expr, 'n': n})

async def logic(pg, lab):
    await pg.evaluate(RESET)
    await tap(pg, 'attack')
    got = await until(pg, "p.state==='claw' && p.anim==='bxj1'")
    check('opener with no direction is a jab', got['ok'], got)

    # on the impact frames the next punch is still the cross
    await pg.evaluate(RESET)
    await tap(pg, 'attack')
    await until(pg, "p.state==='claw' && p.anim==='bxj1' && p.fi>=3 && p.fi<5")
    await tap(pg, 'attack')
    got = await until(pg, "p.state==='claw' && p.anim!=='bxj1'")
    check('press on the hit stays CROSS' if lab else 'main game press on the hit stays CROSS',
          got['ok'] and got['anim'] == 'bxx', got)

    # early mash, before the hit, also stays on the classic cross
    await pg.evaluate(RESET)
    await tap(pg, 'attack')
    await until(pg, "p.state==='claw' && p.anim==='bxj1' && p.fi>=1")
    # fi may already be past 1; only tap if still before the impact
    early = await pg.evaluate("p.fi < 3")
    if early:
        await tap(pg, 'attack')
        got = await until(pg, "p.state==='claw' && p.anim!=='bxj1'")
        check('early mash stays CROSS', got['ok'] and got['anim'] == 'bxx', got)
    else:
        check('early mash stays CROSS', False, 'jab reached the hit before the early tap')

    # late press, during the retract
    await pg.evaluate(RESET)
    await tap(pg, 'attack')
    await until(pg, "p.state==='claw' && p.anim==='bxj1' && p.fi>=5")
    await tap(pg, 'attack')
    got = await until(pg, "p.state==='claw' && p.anim!=='bxj1'")
    if lab:
        check('late press after a jab is a HOOK', got['ok'] and got['anim'] == 'bxlh', got)
    else:
        check('main game late press is still the CROSS', got['ok'] and got['anim'] == 'bxx', got)

    # hold forward: jab, then slipping jab
    await pg.evaluate(RESET)
    await pg.evaluate("press('right')")
    await tap(pg, 'attack')
    got = await until(pg, "p.state==='claw' && (p.anim==='bxj1' || p.anim==='bxj2')")
    check('hold forward opener is a jab', got['ok'] and got['anim'] == 'bxj1', got)
    await until(pg, "p.anim==='bxj1' && p.fi>=3")
    await tap(pg, 'attack')
    got = await until(pg, "p.state==='claw' && p.anim!=='bxj1'")
    check('second forward press is the slipping jab', got['ok'] and got['anim'] == 'bxj2', got)
    await pg.evaluate("release('right')")

    # back + claw is a hook, and he has not turned around
    await pg.evaluate(RESET)
    await pg.evaluate("press('left'); press('attack'); release('attack');")
    got = await until(pg, "p.state==='claw'")
    face = await pg.evaluate("p.face")
    if lab:
        check('back + Claw is a hook and he stays facing the dummy', got['ok'] and got['anim'] == 'bxlh' and face == 1, [got, face])
    else:
        check('main game back + Claw does not become the lab hook', not (got['ok'] and got['anim'] == 'bxlh' and face == 1), [got, face])
    await pg.evaluate("release('left')")

async def lab_only(pg):
    # jump cancel on the retract
    await pg.evaluate(RESET)
    await tap(pg, 'attack')
    await until(pg, "p.state==='claw' && p.fi>=5")
    combo = await pg.evaluate("p.combo")
    await tap(pg, 'jump')
    got = await until(pg, "!p.ground && p.vy<0", 20)
    check('Jump during the retract hops out of the punch', got['ok'] and got['state'] != 'claw', got)
    kept = await pg.evaluate("p.keepCombo||p.combo")
    check('the combo count survives the hop', kept >= combo and combo >= 1, [combo, kept])

    # air chain launches the dummy
    await pg.evaluate(RESET)
    await pg.evaluate("""() => {
      const d = dummies.find(x => x.sp) || dummies[0];
      d.x = p.x + 90; d.y = GROUND; d.vy = 0; d.vx = 0; d.alive = true; d.hp = 80;
      p.ground = false; p.y = GROUND - 150; p.vy = 0; p.state = 'normal'; p.jumps = 1;
    }""")
    await tap(pg, 'attack')
    got = await until(pg, "p.state==='labair'", 8)
    check('Claw in the air starts the air chain', got['ok'] and got['anim'] == 'bxj1', got)
    hit = await until(pg, "dummies.some(d => d.sp && d.vy < -400)", 30)
    check('the air jab pops the dummy up', hit['ok'], hit)
    await tap(pg, 'attack')
    nxt = await until(pg, "p.state==='labair' && p.anim==='bxx'", 25)
    check('the next air Claw is a cross', nxt['ok'], nxt)

    # ground pound still belongs to down + claw
    await pg.evaluate(RESET)
    await pg.evaluate("""() => {
      p.ground = false; p.y = GROUND - 180; p.vy = 20; p.state = 'normal'; p.jumps = 1;
      press('down'); press('attack');
    }""")
    got = await until(pg, "p.state==='kpound'", 8)
    check('down + Claw in the air is still the ground pound', got['ok'], got)
    await pg.evaluate("release('down'); release('attack');")

    # dash uppercut still belongs to dash + claw
    await pg.evaluate(RESET)
    await pg.evaluate("""() => {
      p.state = 'dash'; p.ground = true; p.y = GROUND; p.vy = 0; p.vx = 700; p.face = 1; p.t = 0.05;
      press('attack');
    }""")
    got = await until(pg, "p.state==='kduc'", 8)
    check('Claw during a dash is still the dash uppercut', got['ok'] and got['ground'], got)
    await pg.evaluate("release('attack');")

async def touch(pw):
    br, pg, errs = await boot(pw, '/combat-lab.html?nostory&practice=launch', 844, 390, True)
    boxes = await pg.evaluate("""() => {
      const keys = ['left','right','up','down','attack','jump'];
      const out = {};
      for (const k of keys) {
        const e = document.querySelector('#ui .b[data-k="'+k+'"]');
        const r = e.getBoundingClientRect();
        out[k] = {x:r.left, y:r.top, r:r.right, b:r.bottom, w:r.width, h:r.height};
      }
      return {out, w:innerWidth, h:innerHeight, lab:!!window.CLAB, hud:document.body.classList.contains('clab')};
    }""")
    W, H = boxes['w'], boxes['h']
    ok = True
    for k, r in boxes['out'].items():
        inside = r['x'] >= -1 and r['y'] >= -1 and r['r'] <= W + 1 and r['b'] <= H + 1 and r['w'] >= 40
        if not inside:
            ok = False
        print(' button', k, {kk: round(r[kk]) for kk in r})
    check('iPhone landscape buttons are on screen', ok, [W, H])
    atk, jump = boxes['out']['attack'], boxes['out']['jump']
    overlap = not (atk['r'] < jump['x'] or jump['r'] < atk['x'] or atk['b'] < jump['y'] or jump['b'] < atk['y'])
    check('Claw and Jump do not sit on top of each other', not overlap)
    check('Combat Lab flag is on', boxes['lab'] and boxes['hud'])
    check('no page errors on the lab', not errs, errs[:3])
    await br.close()

async def main():
    async with async_playwright() as pw:
        br, pg, errs = await boot(pw, '/combat-lab.html?nostory&practice=launch')
        check('lab booted with no page errors', not errs, errs[:3])
        check('lab runtime is present', await pg.evaluate("!!(window.CLAB && CLAB.ready && window.PADDY_MOVESET)"))
        await logic(pg, True)
        await lab_only(pg)
        await br.close()

        br, pg, errs = await boot(pw, '/index.html?nostory&practice=launch')
        check('main game booted with no page errors', not errs, errs[:3])
        check('main game does not load the lab', await pg.evaluate("typeof CLAB === 'undefined'"))
        await logic(pg, False)
        await br.close()

        await touch(pw)
    print('FAILS', len(FAILS))
    if FAILS:
        print('\n'.join(FAILS))
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
