# Paddy – move test
Ragdoll cat hero test page. Play: open index.html via any static server.
Sprites cut from source sheets in src/ via src/extract.py + src/build.py.

## All-moves build (Oct 2026)
- `python3 src/cut_sheets.py` cuts every sheet in `generated/` and `generated/tiger/` (single-row, magenta bg)
  into `assets/p/*.png` + `assets/frames.json`, frames found by connected components, scaled to Paddy's
  original size, anchored on a shared ground line. `python3 src/preview.py <anims>` makes a check strip.
- Press **?** in game (or tap the ? button) for the full move list.
