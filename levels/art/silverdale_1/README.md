# World 1-1 painted art: Silverdale Centre Car Park (brawler version)

This is the painted art for `levels/silverdale_1.json` v3, the hack-and-slash rebuild. Every file here was cut from four
generated paintings in `raw/` by `make_art.py`. That script is deterministic, so if you swap a painting for a better one
you can just run it again.
`render_preview.py` is the **reference compositor**. It draws the real level JSON with this art in the order the engine
should use, and it writes `preview_brawl.png` (Trolley-bay brawl) and `preview_traversal.png` (stair-tower wall jump).
**The game does not load any of this yet.** It needs the engine work below.

## Files
| file | what | engine use |
|---|---|---|
| `sky.webp/png` 1280×720 | dusk sky, moon and first stars over the Hibiscus Coast | layer 0, opaque, **one painting, not tiled** |
| `far.webp/png` 2560×720 | rolling Hibiscus Coast farm hills, pine and bush ridges, house lights, a strip of the Hauraki Gulf. Transparent above the ridge and mirror-tiled | layer 1 |
| `mid.webp/png` 1280×297 | Silverdale Centre: precast big-box walls, the verandah shops, the parking building and stair tower, the pōhutukawa island, parked cars, the trolley bay and lantern strings. Transparent sky | layer 2 |
| `near.webp/png` 2560×720 | dark, soft foreground harakeke, a tī kōuka and bollards drawn **in front of** Paddy | layer 4 |
| `tiles/*.png`, `tiles_atlas.*` (7 × 96 px, drawn at 48) | ground_top, ground_fill, precast, roof_iron, mall_wall, mall_parapet_top, ledge_lip | replace the flat `fillRect` tiles |
| `props/*.png`, `props_atlas.*` | pohutukawa, cabbage_tree, puriri, flax, lamp_post, bollard, trolley, drainpipe, bench | replace the drawn trees, lamps, flax and bollards |
| `light_vignette.*` 960×540, `light_glow.*` 256² | screen-space dusk grade and vignette, plus an additive warm glow | the lighting pass |
| `manifest.json` | all of the above: parallax factors, anchors, the tile→legend-char map, prop draw heights and atlas rects | load this one file |

## Draw order (per frame, canvas 960×540, camera `cam.x / cam.y`)
1. **sky**: `drawImage(sky, -cam.x*0.012, -cam.y*0.02 - 40, w, VH*1.15)`. Don't tile it; there's only 124 px of scroll across the whole level.
2. **far**: height 520, bottom at `groundY+60`, x = `-(cam.x*0.12 % w)`, repeated across the screen.
3. **mid**: height 300, bottom at `groundY+14`, x = `-(cam.x*0.45 % w)`, repeated. `groundY = 14*48 - cam.y` (surface row 14).
4. **lantern strings** across each `arenas[]` x0..x1 (background only, colours in the manifest, sagging between 4 posts), plus a `light_glow` behind each lantern.
5. **tiles**. The `#`/`L` cells get their texture from the deco char in the same cell:
   `P`/`t` → precast · `M` → mall_wall (mall_parapet_top on the top row) · `w` → mall_wall (roof_iron on the top row) · `R` → roof_iron ·
   anything else → ground_top on the top row of a column, ground_fill below. `L` also gets `ledge_lip` so a grabbable edge is easy to see.
   **Edge-shading pass per tile.** This is what stops it looking like flat blocks: a dusk tint (rgba 40,25,90,.2-.25 with a little per-tile
   variation), a lit warm lip on any exposed top, a 12 px dark gradient on exposed left/right sides, ambient occlusion where a wall meets
   the ground, and the ground drawn a bit darker than the walls. See `shade()` in `render_preview.py`, which is about 10 lines and maps 1:1 to canvas.
6. **props**, anchored bottom-centre on the surface: the tree for each `trees[]` trunk (pōhutukawa or puriri by name, height
   `base-top+4` tiles); `drainpipe` stretched from top to base for each `climbables[]` pipe; deco `l` lamp (4.2 tiles, plus an additive `light_glow`
   260 px at the lamp head), `n` flax 1.6, `o` bollard 1.1, `t` trolley on the crate stack.
7. Pickups, enemies, kids, Paddy and FX, as now.
8. A **ground haze** band (60 px, rgba(150,120,200,≤.18)) along groundY.
9. **near**: height `VH*0.42`, bottom at `VH+30`, x = `-(cam.x*1.25 % w)`, at about 90% alpha. Keep it sparse so it never hides a fight.
10. **light_vignette** over everything, then the UI.

Pre-scale every layer once into an offscreen canvas at load (don't call `drawImage` with scaling every frame). Use the `.webp`
files (about 450 KB in total instead of about 4.5 MB of PNG). Load them in the background like `assets/arena.webp`. If an image is missing,
fall back to the current flat drawing so nothing ever blocks the level.

## Engine changes 1-1 needs (level.js)
- **Hook point**: `level.js` already has a World-1 backdrop branch (`isW1()`, `farStrip / midStrip`, around lines 405-420). Add a
  `L.art` branch in front of it: `if (L.art) { drawArtLayers(); } else { …existing… }`. Do the same in the tile loop (around line 428) for textures.
- **Waves**: each `arenas[]` entry now has `waves:[{enemies:[{id, from:'left'|'right'|'sky'}]}…]` and `waveGap` (0.8 s). On lock, spawn
  wave 1; when the whole wave is down, wait `waveGap` and spawn the next. `left`/`right` enemies run in from just outside x0/x1 on feet
  row `y`, and `sky` flyers swoop in from the top. Show **CLEAR!** only after the last wave. `enemies[]` is still wave 1, so the current engine
  (`updArenas`) plays wave 1 as-is until this is added. That's about 15 lines in `updArenas()`: keep `a.wi` (the wave index) and refill `a.list`.
- **Wall bounce**: `wallBounce:true` means the camera-lock walls at x0/x1 count as bounce walls for wall-bounce combos.
- **Height and headroom**: the level is now **16 rows** (was 12), with the ground surface on row 14. The camera already clamps to
  `H*TS-VH`, so it sits low and still follows a launched Paddy up into the 14 open rows above every brawl floor (no ceilings and no
  one-way slabs anywhere in a brawl zone). Legendary and Awakened forms (4 tiles tall) fit with about 10 rows to spare.
- **Traversal moves on the critical path**: climb (`T`: pōhutukawa, shop drainpipe, puriri), wall jump in the 3-wide stair-tower lightwell,
  ledge grab (`L` parapet and tower corner), and drop-downs. No double jump is needed. `validate_level.py` checks this with `style:'brawler'`.

## Real place
Silverdale Centre (Silverdale St / Hibiscus Coast Hwy, Wēiti, north Auckland). From left to right: the centre entry and pylon, the trolley bay,
the pōhutukawa planting island and the precast retaining wall, the car-park deck, the parking-building stair tower, the shops under their
corrugated verandahs, Seagull square, and the puriri by the exit towards The Shops (1-2). Everything is at dusk, in the same palette as the Training Arena.

## Known art limits (worth a second pass)
- The big solid blocks (stair tower, retaining wall) are still tiled precast. Even with the shading pass, an 8-tile-high wall looks
  repetitive. The next step would be one painted facade sprite per set-piece: the stair tower with its glazed stair, and the shop parapet.
- The magenta keying leaves a faint fringe in a few spots on the props, so check them at 2× zoom.
- The mid layer is a single 1280 px painting that repeats about every 27 tiles. A second variant would break up the repeat.
