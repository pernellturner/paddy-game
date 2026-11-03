# Paddy – move test
Ragdoll cat hero test page. Play: open index.html via any static server.
Sprites cut from source sheets in src/ via src/extract.py + src/build.py.

## All-moves build (Oct 2026)
- `python3 src/cut_sheets.py` cuts every sheet in `generated/` and `generated/tiger/` (single-row, magenta bg)
  into `assets/p/*.png` + `assets/frames.json`, frames found by connected components, scaled to Paddy's
  original size, anchored on a shared ground line. `python3 src/preview.py <anims>` makes a check strip.
- Press **?** in game (or tap the ? button) for the full move list.

## v47 Kitti Paddy controls (Nov 2026)
- Touch D-pad is a diamond: ▲ top, ◀ ▶ middle, ▼ bottom (practice / free play in `controls.js`, story in `level.js`). ▲ = keyboard ↑.
- Base Paddy (punch combo) double-taps, `kitti47.js` (practice / free play) and `level.js` (story): ◀◀ away = DODGE (+Claw COUNTER SLASH),
  ▶▶ toward = DASH (+Claw DASH STRIKE, carries the punch string on), ▲▲ SKY POUNCE (+Claw POUNCE LAUNCHER), ▼▼ CAT SLIDE (+Claw SLIDE SWEEP).
- Story CLAW now throws the practice punch string (JAB · CROSS · LEFT HOOK · BODY SHOT · UPPERCUT, ▼+CLAW = BODY SHOT).
- Story Paddy uses the practice room's base sheets too: run `k_run`, jump/apex/fall/land `k_jump`, hurt `hurt`, air swipe `kt_m_airswipe`, air spin `k_m_aircart`, dive `kt_m_diveclaw` (idle unchanged).
- Tests: `tests/t47_kitti_dtap.py` (practice, 844x390 touch + keyboard), `tests/t47_story.py` (World 1-1).

## v48 Kitti Paddy quick taps + power punches (Nov 2026, practice / free play, base Paddy only)
- `kitti48.js`: quick tap (press + let go under 0.15 s) back = SLIP (+Claw = SLIP JAB, steps back in), tap down = WEAVE (+Claw = WEAVE HOOK),
  a 2nd quick tap upgrades slip -> DODGE and weave -> CAT SLIDE. Holding a direction still walks / crouches; a back press only turns him once held
  0.15 s (no more 1-frame turn flicker before the dodge). Mid-punch with an enemy behind, back still turns him at once (v29 turn).
- Hold Claw: wind-up from 0.15 s, power from 0.3 s, full charge 0.6 s (glow, flash, shake) -> let go = HAYMAKER (k_pw_hook + fiery overhand arc,
  lunge, big knockback / damage) or POWER JAB after a forward tap (k_pw_jab + straight streak). A short hold (<0.3 s) is just the normal punch.
- All Kitti move art now uses the pink punch sheets (dodge/slip = lean-back, weave/dash/slide = low guard, dash strike / pounce = power jab,
  pounce launcher = power uppercut, counter = cross, slide sweep = power body) with eased motion, squash/stretch, lean and afterimages; no crossfade
  or i-frame blink on the quick moves.
- Test: `tests/t48_kitti_taps.py` (844x390 touch + keyboard).
