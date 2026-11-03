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
