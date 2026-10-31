# Form 02 — Ninja Paddy (sprite set for Game Studio Bot)

Quick, sneaky and low, with darting steps and whole-body strikes. Family-friendly: empty paws, no weapons, no gore. The face matches
`/workspace/paddy-game/src/s4.png`: cream face, brown mask only around the blue eyes, white blaze, small muzzle. The outfit
matches `reference/forms/02_ninja.png`: black/purple suit, purple headband, glowing lavender/blue trim.

## SIZE RULE (one size, never mixed)
* Ninja is **exactly base idle height, TARGET=199**. Base Paddy's upright guard at TARGET=199 (`tests/paddy_fluid/frames/p7/guard_1.png`)
  is **340 px tall**.
* One form scale **K = 0.4298** (= 340 / height of the keyed `idle_a` cut) is applied to **every frame of every sheet and demo**.
  Nothing is normalised per frame. Crouches look shorter because the pose is lower, not because the sprite was shrunk.
* The sparring dummy is also 340 px tall and is not rescaled.
* Only the squash/stretch from the Movement Bible is applied on top: one-frame anticipation `sy` 0.90–0.99 and `sx` ≤ 1.04. Search
  `moves.py` for `sx=`/`sy=`. Set them to 1 to get pure, constant-size frames.
* Only **Legendary and Awakened** forms grow, by a small fixed step. Ninja does not.

## Format
* One row per sheet on exact **#FF00FF**, facing right, shared baseline. Cell size and baseline are in each `_roots.txt` header.
* GAP 40, margin 48. GIFs run at 12 fps (83 ms).
* `sheets_green/` holds the same sheets on #00FF00, because SHEET_SPEC lists green for Ninja (the purple suit fights magenta).
  **The brief asked for #FF00FF, so `sheets/` is the primary set.** Pick one and tell the engine.
* Each `_roots.txt` has one line per frame: `frame pose root_x(px vs frame 1) lift(px above baseline) flags`.
  * `HIT1/HIT2/HIT3` mark hit-stop frames. `SFX:<cue>` marks an effort sound.
  * Ground frames are anchored on the planted back toe. Air frames use a centroid anchor plus `lift`.
* Hit-stop is **2 frames on every strike and 3 on the finisher**. FX are minimal: a small white/lavender burst plus 3 speed lines at
  the strike tip, ghost after-images on blinks, and dust puffs on push-offs.

## Sheets (`sheets/`), frame counts, hit-stop and effort sounds
`*` = hit-stop frame, `[cue]` = effort sound on that frame.

| sheet | frames | sequence | hit-stop |
|---|---|---|---|
| idle | 6 | idle_a breathing loop | – |
| ready | 5 | idle_a idle_b ready ready ready (drop from idle into the low guard; `ready` is the neutral every attack starts and ends on) | – |
| walk | 6 | walk_1 2 4 3 2 4, low darting creep | – |
| victory | 6 | ready idle_a vic_1 vic_1 vic_2 vic_2 (index finger "number one", wink) | – |
| light1_palm (button 1) | 7 | ready l1_load l1_half l1_snap*[hup] l1_snap* l1_half ready | 4-5 |
| light2_chop (2) | 7 | ready l2_load[hup] l2_half l2_snap* l2_snap* l1_half ready | 4-5 |
| light3_snapkick (3) | 7 | ready ready l3_load l3_snap*[hup] l3_snap* l3_load ready | 4-5 |
| light4_elbow (4) | 7 | ready l4_load l4_load[hup] l4_snap* l4_snap* l1_half ready | 4-5 |
| light5_twinpalm (5 / the 1' in 1-1-2) | 7 | ready l5_load l5_half[hup] l5_snap* l5_snap* l5_half ready | 4-5 |
| heavy1_sweep | 8 | ready bl_crouch ln_load[GRUNT] h1_imp* h1_imp* h1_imp ln_load ready | 4-5 |
| heavy2_flyknee | 8 | ready ln_load h2_drive[GRUNT] h2_imp* h2_imp* walk_4 land ready | 4-5 |
| launcher | 7 | ready ln_load ln_imp[GRUNT] ln_imp* ln_imp* air_ready air_ready (ends airborne, lift 230) | 4-5 |
| air1_palm | 6 | air_ready air_ready a1_snap*[hup] a1_snap* a1_snap air_ready | 3-4 |
| air2_sidekick | 6 | air_ready h2_imp a2_snap*[hup] a2_snap* h2_imp air_ready | 3-4 |
| air3_axespike | 7 | air_ready a3_wind[GRUNT] a3_snap* a3_snap* air_ready land ready (spike, lands back on ready) | 3-4 |
| blink (ground dash-in) | 6 | ready bl_crouch[hiss] bl_dash bl_dash ready ready (~560 px travel, ghost trail) | – |
| blink_air | 4 | air_ready bl_dash[hiss] bl_dash air_ready | – |
| block | 6 | ready block×4 ready (crossed forearms, small spark) | – |
| dodge | 5 | ready ready dodge_back land ready (back-hop) | – |
| counter | 7 | ready block cnt_parry[hiss] cnt_snap*[hup] cnt_snap* l1_half ready | 4-5 |
| finisher_crescent | 12 | ready fin_coil[HISS] bl_crouch bl_dash fin_rise[BIG GRUNT] fin_imp* fin_imp* fin_imp* air_ready land fin_pose(bow) ready | 6-8 (3 frames) |

Effort-sound cues: `hup` = light grunt/exhale, `GRUNT` = heavy, `hiss` = blink/parry sneak, `HISS` + `BIG GRUNT` = finisher.

## Cancel windows (endless freestyle chaining)
* **Buffer:** input is buffered from the first hit-stop frame (HIT1).
* **Cancel:** at the end of frame n-1, the next move starts at **its frame 2**. Its frame 1 (`ready`) is the shared neutral and is
  skipped, and its root sits where the previous move's last frame would have been.
  * The opener plays 1..n-1, middle moves play 2..n-1, and the last move plays 2..n.
  * Any light, heavy, blink or counter can follow any other, because they all start and end on `ready`.
* **Air:** the launcher ends on `air_ready` (lift 230). air1, air2, air3 and blink_air start and end on `air_ready`, so they chain the
  same way in the air. air3 is the air ender: it lands and returns to `ready`. Blink_air closes the gap after the launch.
* **Block → counter:** counter starts from block (frame 2), so a successful block can cancel straight into frame 3 (parry).

## Strings / demos (`demos/`; `vsdummy_*` = same string hitting `tests/sparring_dummy/`)
| demo | route |
|---|---|
| demo_1-2 / vsdummy_1-2 | palm → chop |
| demo_1-1-2 / vsdummy_1-1-2 | palm → twin palm (1') → chop |
| demo_1-2-3-4 / vsdummy_1-2-3-4 | palm → chop → snap kick → elbow |
| demo_1-2-3-4-5 | + twin palm |
| demo_juggle / vsdummy_juggle | launcher → blink_air → air1 palm → air2 side kick → air3 axe spike (dummy knocked down) |
| demo_8hit_finisher / vsdummy_8hit_finisher | L1 palm, L5 twin palm, L2 chop, L3 snap kick, L4 elbow, L1 palm, H1 low sweep, then the crescent finisher (8 hits, then the big finish; dummy KO) |
| demo_block_counter / vsdummy_block_counter | block → parry → counter palm |
| demo_blink_in | blink dash-in → palm |

Dummy logic (`_kit/formkit.py: Dummy.composite`): at each HIT1, the dummy's front edge is placed at the strike tip. Between hits,
its root is interpolated, so it is pushed back or carried up and away, and blinks close a real gap. Reactions are light / heavy /
launch / air / spike / ko. The dummy is drawn behind Paddy so the burst reads. Review strips: `checks/strip_vsdummy_*.jpg`.

## Files
* `raw/*.jpg`: generated poses (cursor GenerateImage, paint-over stick guides in `raw/guides/`, `master_design.jpg` = design anchor).
* `raw/rej/`: rejects. Two had real knives ("knife-hand" wording), one drew the guide limb, one block was not crossed, one sweep
  duplicated the L3 kick, one finish pose was an ambiguous single raised finger, plus a ready pose that was too high and two wrong
  extensions.
* `frames/*.png`: keyed RGBA poses. `poses.json` holds the skeleton guide definitions.
* `moves.py` holds MOVES (sheet definitions) and `demos.py` holds DEMOS. `./build.sh` rebuilds everything, touches only this folder,
  never runs build_power6/7 and never touches game code or assets.
* `checks/final_face_check.jpg`: every frame at K beside the s4 head crop and the 02_ninja ref. `checks/all_frames_one_scale.jpg`,
  `checks/sheets_*.jpg`.

## Known weak spots (honest)
* **victory:** vic_1/vic_2 are front or three-quarter facing, not a strict right-facing profile.
* **idle:** only one drawing (idle_a) breathing via squash. **walk:** 4 drawings, and walk_2 and walk_3 are similar, so the leg
  alternation reads weakly.
* **Thin strike variety:** l3_snap kick is mid-height rather than low. l4_load is not very low (squash fakes the dip). Retract frames
  reuse l1_half across several strikes. fin_coil looks a lot like l5_load. air2 uses h2_imp as its wind-up.
* **Generator drift:** boots and legs drift towards human proportions on some frames. Fur shade and trim glow vary slightly
  frame to frame. The ready guard is only moderately low.
* **Spare art:** h1_load was generated but is unused.
* **Background:** SHEET_SPEC says #00FF00 for Ninja but the brief says #FF00FF. Both are delivered; the magenta set needs a good
  despill in the engine around the purple trim.
* **Root jumps:** small jumps remain, e.g. light5 frame 2 at -46 px and heavy1 at -4 px during the sweep. In the 8-hit finisher, the
  blink dash passes over the dummy for ~2 frames before fin_rise.
* **Air layering:** the air hits in vsdummy_juggle line up at lift ~230, but the dummy uses its single "launched" tumble frame for the
  whole air phase.
