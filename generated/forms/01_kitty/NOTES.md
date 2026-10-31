# Form 01: Kitty Paddy (sprite set for Game Studio Bot)

Built 31 Oct 2026 (NZDT) using the 02_ninja method and the `_kit/`. This is a TEST set and is not wired into the game.

**Style:** a playful, scrappy alley cat. Kitty is the base form, plain Ragdoll fur with no outfit (`reference/forms/01_kitty.png`). It fights
in a hunched half-rear on its hind legs with hooked, swatting paws (not boxing fists, not ninja palms). It drops to all fours to walk,
stalk, pounce, dash and puff up. The moves are paw swats, a whack-a-mole bonk, a low ankle swipe, a head-bonk, a spinning tail whip,
a butt-wiggle pounce, a rear-up double-paw slam, bunny kicks and a dive pounce. Everything is family-friendly: soft paws with tiny claws,
no weapons and no gore.

**Face** matches `/workspace/paddy-game/src/s4.png`: a cream face, chocolate only in the mask around the blue eyes, a white blaze and
a small white muzzle. It is never an all-brown face. See `checks/final_face_check.jpg`.

## SIZE RULE (one size, never mixed)
* Kitty is **exactly base idle height, TARGET=199**. Base Paddy's upright guard is 340 px.
* One form scale **K = 0.4928** (= 340 / height of the keyed `idle_a` cut) is used for **every frame of every sheet and demo**.
  Measured idle_a = 339 px after the alpha>200 crop. Nothing is normalised per frame. Lower poses (the all-fours walk is 266 px, the
  ready crouch is 313 px) are shorter because the pose is lower, not because the sprite was shrunk.
* The sparring dummy is also 340 px tall and is not rescaled.
* The only extra scaling is Movement Bible squash/stretch on single frames (`sy` 0.88–1.06, `sx` ≤ 1.04; search `moves.py`).

## Format (same as 02_ninja)
* One row per sheet on exact **#FF00FF**, facing right, on a shared baseline, GAP 40, margin 48. 12 fps GIFs. Kitty has no purple, so
  there is no green copy (SHEET_SPEC: green only for purple forms).
* Each `_roots.txt` has one line per frame: `frame pose root_x lift flags`. `HIT1/HIT2/HIT3` are hit-stop frames and
  `SFX:<cue>` is an **effort sound**. Ground frames are anchored on the planted back toe. Air and dash frames use a centroid anchor plus `lift`.
* Hit-stop is 2 frames on every strike and 3 on the finisher. FX are minimal: a small white burst with 3 speed lines at the strike
  tip, a ghost trail on dashes and dust puffs on push-offs.

## Sheets (`sheets/`)
`*` = hit-stop, `[cue]` = effort sound.

| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a breathing, then idle_b (head tilt, smug half-wink, tail swish low), then back. There are 2 real drawings. |
| ready | 5 | idle_a, idle_a dip, then a ready crouch with both hooked paws up. Every ground move starts and ends on `ready`. |
| walk | 6 | All-fours strut, and **every frame has a different paw in the air**: stride contact → near hind toe-off → near front lifted high → gathered contact → far hind lifted → far front lifted. Root +22..30 px/frame. |
| victory | 8 | ready, idle_b, vic_2 (sits up like a meerkat, waves a paw, winks) ×3, vic_1 (proud strut, chin up, tail high) ×3 |
| light1_swat (button 1) | 7 | ready l1_load (paw cocked by the ear) l1_load-drive l1_snap*[hup] l1_snap* l1_snap ready. Forehand swat at head height, back leg straight. |
| light2_bonk (2) | 7 | ready l2_load[hup] (rear paw high behind the head) drive l2_snap* l2_snap* l2_snap ready. Over-the-top smack down. |
| light3_ankleswipe (3) | 7 | ready l3_load (drops to a low stalk) l3_load[hup] l3_snap* l3_snap* l3_load ready. Long low lunge, paw skims the floor. |
| light4_headbonk (4) | 7 | ready l4_load (rocks back, chin in) l4_load[hup] l4_snap* l4_snap* l4_snap ready. Whole-body head-butt lunge. |
| light5_tailwhip (5 / the 1' in 1-1-2) | 7 | ready l5_load (mid-spin) l5_load[hup] l5_snap* l5_snap* l5_load ready. Spins its back to the target and lashes the tail. |
| heavy1_pounce | 9 | ready h1_load (butt wiggle) ×3[GRUNT on the 3rd] h1_imp* h1_imp* (airborne, both paws out, +150 px) h1_imp land ready |
| heavy2_slam | 8 | ready h2_load (rears up on its toes, both paws overhead) h2_load[GRUNT] h2_imp* h2_imp* h2_imp l3_load ready |
| launcher | 7 | ready ln_load ln_load[GRUNT] ln_imp* ln_imp* (rocket leap, both paws scoop up) air_ready air_ready. Ends airborne, lift 230. |
| air1_swat | 6 | air_ready air_ready a1_snap*[hup] a1_snap* a1_snap air_ready |
| air2_bunnykick | 6 | air_ready air_ready(lean back) a2_snap*[hup] a2_snap* (both hind feet thrust forward) a2_snap air_ready |
| air3_divespike | 7 | air_ready a3_wind[GRUNT] a3_snap* a3_snap* (head-first dive, both paws down-right) a3_snap land ready. This is the air ender. |
| blink ("zoomies") | 6 | ready bl_crouch[hiss] bl_dash bl_dash (ghost trail, about 500 px travel) land ready |
| blink_air | 4 | air_ready bl_dash[hiss] bl_dash air_ready |
| block | 6 | ready, then block ×4 (puffed-up arched Halloween-cat, bottle-brush tail, small spark), then ready |
| dodge | 5 | ready ready dodge_back (startled spring back, about -140 px) land ready |
| counter | 7 | ready block cnt_parry[hiss] (bats the attack down) cnt_snap*[hup] cnt_snap* (rising up-swipe) cnt_snap ready |
| finisher_ninelives | 13 | ready h1_load[HISS] bl_crouch bl_dash fin_rise[BIG GRUNT] (corkscrew leap, tail whirl) fin_imp*×3 (huge two-paw scissor swipe) air_ready land fin_pose (sits, licks a paw, smug) fin_pose ready |

Effort-sound cues: `hup` = light chirp/grunt, `GRUNT` = heavy, `hiss` = dash/parry, `HISS` + `BIG GRUNT` = finisher.

## Cancel windows / demos
These match 02_ninja exactly. The buffer opens on HIT1. A cancel at the end of frame n-1 starts the next move at its frame 2. Every
ground move starts and ends on `ready`, and every air move starts and ends on `air_ready`. Block cancels into counter.

| demo (`demos/`, plus `vsdummy_*` vs `tests/sparring_dummy/`) | route |
|---|---|
| 1-2 | swat → bonk |
| 1-1-2 | swat → tail whip (1') → bonk |
| 1-2-3-4 | swat → bonk → ankle swipe → head-bonk |
| 1-2-3-4-5 | + tail whip |
| juggle | launcher → blink_air → air swat → bunny kick → dive spike (dummy spiked down) |
| 8hit_finisher | L1 swat, L5 tail whip, L2 bonk, L3 ankle swipe, L4 head-bonk, L1 swat, H1 pounce, then the Nine Lives finisher (dummy KO) |
| block_counter | block → parry → counter up-swipe |
| blink_in | zoomies dash-in → swat |

Review strips are in `checks/strip_vsdummy_*.jpg` and `checks/strip_walk.jpg`. All sheets are in `checks/sheets_a/b/c.jpg`.

## Files
* `raw/*.jpg`: generated poses (cursor GenerateImage). `raw/master_design.jpg` is the design anchor and is also `idle_a`.
  `raw/guides/` + `poses.json` (`make_poses.py`, `guide_kitty.py` = the kit guide without the ninja headband) are the stick guides used
  for some poses. `raw/rej/` holds the rejects.
* `leglift.py` cuts one leg out of `walk_1` and lifts it to make `walk_nh/walk_hl/walk_fl`, because the generator kept redrawing the
  same stride (see the rejects).
* `frames/*.png`: keyed RGBA frames. `moves.py` = MOVES, `demos.py` = DEMOS. `./build.sh` rebuilds everything. It only touches
  this folder, never runs build_power6/7 and never touches game code or `/workspace/paddy-game/assets/`.
* Spare art (unused): `walk_2`, `walk_3` (the reference walk redrawn on green; its head is drawn larger, so I dropped it).

## Known weak spots (honest)
* **Walk:** the alternation now reads (a different paw is up in every frame), but 3 of the 6 frames are procedural leg-lifts of one
  drawing (`walk_1`). Those legs are rotated cut-outs, so up close the knee bend is stiff and the cut is softened with a 12 px feather.
  The tail drops between frames 2→3 and 4→5 because walk_4 and land are different drawings with a lower tail.
* **ready ≈ idle:** the generator would not draw a much lower reared crouch, so `ready` is only a little lower (313 vs 339 px) than idle.
* **light2_bonk:** the impact paw lands forward at waist height, not a strong downward smack. It reads as a short forward pat-smack.
  The burst is set to tip=BR to sit on the paw rather than the face.
* **cnt_parry** is mild: the paw is low and forward rather than clearly batting down. **ln_load** is an all-fours crouch looking up,
  not a deep squat. **land** is a fairly upright four-paw stand (squashed with sy 0.94–0.95).
* **Facing:** h2_load and vic_2 are front or three-quarter facing. l5_snap is turned away on purpose (tail whip), and l5_load is a
  twisted mid-spin that reads a little oddly as a still.
* **fin_rise** has the generator's own fawn "tail whirl" smear strokes baked into the drawing. That is the only drawn FX; the rest are the kit's minimal FX.
* **Generator drift:** fur shade and head size vary slightly frame to frame (one K, no per-frame fix). Tiny claws show on fin_imp and
  a few swats (soft and cartoonish, no weapons).
* **Root jumps:** switching between reared and all-fours drawings moves the back-toe anchor, so there are small root shifts, for example
  light1 frame 2 at -26 px and launcher frame 2 at -63 px (the crouch is longer). In the 8-hit demo, the pounce and dash overlap the dummy for 1–2 frames.
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as Ninja).
