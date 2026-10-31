# Form 03: Samurai Paddy (sprite set for Game Studio Bot)

Built 31 Oct 2026 (NZDT) with the 01_kitty / 02_ninja method and the `_kit/`. This is a TEST set and is not wired into the game.

**Style: grounded, disciplined iaido / battojutsu.** Samurai fights from a deep, wide iai crouch (`ready`) with the katana
**sheathed** and the paw on the hilt. Every light is a **draw-cut** straight out of the scabbard, and every sword move ends on
`noto` (sliding the blade home), so a string reads sheath → draw → cut → sheath. Heavies are two-handed, committed cuts. It is
deliberately unlike Ninja (darting, palms and kicks) and Kitty (hunched swats and pounces): no hopping, no spins, few air-time
gimmicks, feet planted wide, weight dropped, and a calm eyes-closed coil before the finisher.

**Outfit and weapon** follow `reference/forms/03_samurai.png`: black lacquered armour with red lacing, a navy headband, a gold-horned
crest, a black katana with a gold collar, chocolate ears and a fluffy chocolate tail. Upright two-legged body, like the Ninja set. One
deliberate change: the reference carries the katana on the **back**, but iaido needs it at the **left hip in a red sash**, so it
is worn there. Dark hakama and red-laced shin guards were added to finish the samurai look. The blade is clean silver, with no blood
or gore. (The Movement Bible checklist says "no sword", but the brief allows one because this form's reference has one.)

**Face** matches `/workspace/paddy-game/src/s4.png`: a cream face, chocolate only in the mask around the blue eyes, a white blaze and
a small white muzzle. It is never all-brown. One walk frame came back with a brown muzzle and was rejected (`raw/rej/`).
See `checks/final_face_check.jpg`.

## SIZE RULE (one size, never mixed)
* Samurai is **exactly base idle height, TARGET=199**. Base Paddy's upright guard is 340 px.
* One form scale **K = 0.4521** (= 340 / height of the keyed `idle_a` cut, 753 px) is used for **every frame of every sheet and
  demo**. Measured idle_a in the sheet = 339 px after the alpha>200 crop (the same as Kitty). Nothing is normalised per frame.
  Lower poses are shorter because the pose is lower (ready 306, l3_snap ~177). Upright poses are taller (fin_pose 383, walk 356–364,
  vic_2 with the raised sword ~402) because idle itself is a wide, bent-knee stance. None of this is a rescale.
* The sparring dummy is also 340 px tall and is not rescaled.
* The only extra scaling is Movement Bible squash/stretch on single frames (`sy` 0.88–1.02, `sx` ≤ 1.04; search `moves.py`).

## Format (same as 01_kitty / 02_ninja)
* One row per sheet on exact **#FF00FF**, facing right, on a shared baseline, GAP 40, margin 48. 12 fps GIFs. Samurai has no purple,
  so there is no green copy (SHEET_SPEC: green only for purple forms). The red lacing stays clear of the magenta key.
* Each `_roots.txt` has one line per frame: `frame pose root_x lift flags`. `HIT1/HIT2/HIT3` are hit-stop frames and
  `SFX:<cue>` is an **effort sound**. In this set the cue sits on the **push-off / effort frame** (the drive frame before the hit),
  except air lights and the counter, where it sits on the first hit frame. Ground frames are anchored on the planted back toe. Air
  and dash frames use a centroid anchor plus `lift`.
* Hit-stop is 2 frames on every strike and 3 on the finisher. FX are minimal (kit FX): a small white burst with 3 speed lines at the
  blade tip, speed lines on some drive frames, a ghost trail on dashes, dust puffs on push-offs, and a tiny spark on block.

## Sheets (`sheets/`)
`*` = hit-stop, `[cue]` = effort sound.

| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a breathing, then idle_b (eyes closed, meditative breath, tail flick), then back. 2 real drawings. |
| ready | 5 | idle_a, dip, then `ready` (deep, wide iai crouch, sheathed, paw on hilt). Every ground move starts and ends on `ready`. |
| walk | 6 | walk_a stride (near leg forward) → dip → walk_b passing (**far** knee high) → walk_c stride (**far** leg forward) → dip → walk_d passing (**near** knee high). The far leg is shaded in each frame. Root +24..30 px/frame. |
| victory | 8 | ready, idle_b, vic_1 (formal bow) ×3, vic_2 (sheathed katana raised like a trophy, wink) ×3 |
| light1_nukitsuke (button 1) | 7 | ready l1_load (coil, hips turned away, blade an inch out) l1_load-drive[hup] l1_snap* l1_snap* (one-hand horizontal draw-cut, lunge, back leg straight) noto ready |
| light2_kiriage (2) | 7 | ready l2_load (sinks very low, scabbard tilted down) drive[hup] l2_snap* l2_snap* (rising two-hand diagonal cut, legs drive up) noto ready |
| light3_shingiri (3) | 7 | ready l3_load (drops toward the back knee) drive[hup] l3_snap* l3_snap* (huge low lunge, blade at ankle height) noto ready |
| light4_tsuki (4) | 7 | ready l1_load (draw) l4_load (blade chambered level at the hip)[hup] l4_snap* l4_snap* (straight two-hand thrust, one line heel→tip) noto ready |
| light5_tsukaate (5 / the 1' in 1-1-2) | 7 | ready l5_load (coil) drive[hup] l5_snap* l5_snap* (blade stays sheathed; rams the hilt end forward with the shoulder) ready-dip ready |
| heavy1_kesagiri | 9 | ready l1_load h1_load (rises to jodan, sword high behind the head, back heel up) h1_load-drive[GRUNT] h1_imp* h1_imp* (huge diagonal downward cut into a deep lunge) h1_imp noto ready |
| heavy2_ichimonji | 8 | ready h2_load (wakigamae: blade wound far back, hips coiled) h2_load-drive[GRUNT] h2_imp* h2_imp* (full-turn two-hand horizontal sweep, blade level in front) h2_imp noto ready |
| launcher | 7 | ready ln_load ln_load[GRUNT] (deepest squat, blade low) ln_imp* ln_imp* (steps in and springs straight up, blade carved overhead) air_ready air_ready. Ends airborne, lift 230. |
| air1_yokogiri | 6 | air_ready air_ready a1_snap*[hup] a1_snap* (air horizontal slash) a1_snap air_ready |
| air2_kiriage | 6 | air_ready air_ready a2_snap*[hup] a2_snap* (air rising two-hand cut) a2_snap air_ready |
| air3_kabutowari | 8 | air_ready a3_wind[GRUNT] (sword overhead, back arched) a3_snap* a3_snap* (plunging downward cleave) a3_snap land noto ready. This is the air ender. |
| blink (iai flash-step) | 6 | ready l3_load[hiss] bl_dash bl_dash (long, low, sheathed, ghost trail, ~520 px travel) ready-land ready |
| blink_air | 4 | air_ready bl_dash[hiss] bl_dash air_ready |
| block | 6 | ready, then block ×4 (braced wide stance, blade held vertical like a wall, left paw on the back of the blade, small spark), then ready |
| dodge | 5 | ready dip dodge_back (lean-back hop, about -110 px) l3_load (low landing) ready |
| counter | 7 | ready block cnt_parry[hiss] (catches the blow high) cnt_snap*[hup] cnt_snap* (step-in downward head cut) noto ready |
| finisher_issen | 13 | ready fin_coil[HISS] (lowest crouch, eyes closed, thumb pops the blade) fin_coil bl_dash (flash-step, ghost) a3_wind[BIG GRUNT] (leaps, sword overhead) fin_imp*×3 (huge downward cleave to the floor) fin_imp noto fin_pose (stands tall, eyes closed, *click*) fin_pose ready |

Effort-sound cues: `hup` = light kiai/exhale, `GRUNT` = heavy kiai, `hiss` = flash-step/parry, `HISS` + `BIG GRUNT` = finisher.
Suggested extra one-shot (not marked as an effort frame): a soft sheath *click* on every `noto` frame and on the first `fin_pose`.

## Cancel windows / demos
These match 02_ninja and 01_kitty exactly. The buffer opens on HIT1. A cancel at the end of frame n-1 starts the next move at its
frame 2. Every ground move starts and ends on `ready`, and every air move starts and ends on `air_ready`. Block cancels into
counter. Because frame n-1 of every sword move is `noto` and frame 2 of the next is a hand-on-hilt load, chained strings always
resheathe and redraw. That is the iaido rhythm.

| demo (`demos/`, plus `vsdummy_*` vs `tests/sparring_dummy/`) | route |
|---|---|
| 1-2 | nukitsuke → kiriage |
| 1-1-2 | nukitsuke → hilt strike (1') → kiriage |
| 1-2-3-4 | nukitsuke → kiriage → shin cut → thrust |
| 1-2-3-4-5 | + hilt strike |
| juggle | launcher → blink_air → air slash → air rising cut → kabuto-wari spike (dummy spiked down) |
| 8hit_finisher | L1 nukitsuke, L5 hilt strike, L2 kiriage, L3 shin cut, L4 thrust, L1 nukitsuke, H1 kesa-giri, then the Issen finisher (dummy KO) |
| block_counter | block → parry → counter head cut |
| blink_in | iai flash-step dash-in → nukitsuke |

Review strips are in `checks/strip_vsdummy_*.jpg` and `checks/strip_walk.jpg`. All sheets are in `checks/sheets_a/b/c.jpg`.

## Files
* `raw/*.jpg`: generated poses (cursor GenerateImage). `raw/master_design.jpg` is the design anchor and is also `idle_a`. Most poses
  were generated from `raw/ready.jpg` as the character reference. Stick guides (`make_poses.py` → `poses.json` → `guide_samurai.py` =
  the kit guide with a navy headband, gold crest and a drawn katana/scabbard) are in `raw/guides/` and were used for ready, l2_snap,
  l3_snap, l4_snap, h1_imp, h2_imp, ln_imp, bl_dash and fin_imp. `raw/refs/` holds the reference copies passed to the generator.
  `raw/rej/` holds the rejects.
* `walklegs.py` makes `walk_a/b/c/d` from two real drawings (`walk_3` stride, `walk_2` high-knee passing) by shading the far leg.
* `frames/*.png`: keyed RGBA frames. `moves.py` = MOVES, `demos.py` = DEMOS. `./build.sh` rebuilds everything. It only touches
  this folder, never runs build_power6/7 and never touches game code or `/workspace/paddy-game/assets/`.
* Spare art (unused): `walk_1` (stance-like contact), `seigan` (a drawn-sword guard, the first try at `ready`).

## Known weak spots (honest)
* **Walk:** there are only 2 real walk drawings. The legs alternate by which foot is forward or lifted, plus a shaded far leg, but the
  shading mostly shows on the cream feet (the shin guards are already black). So the near/far switch is a light cue, and frames 1↔4
  and 3↔6 are the same drawing apart from the shading. A real far-leg-lifted drawing failed (brown muzzle, see rejects).
* **Finisher impact:** `fin_imp` was meant to be a one-knee kneeling cleave. After 3 tries the generator would not kneel, so it is a
  very low lunge-cleave that looks a lot like `h1_imp`. The finisher still reads differently because of the coil → flash-step → leap → click.
* **heavy2 vs light4:** the end of the horizontal sweep (`h2_imp`, blade level in front, face turned a little toward the camera)
  looks quite like the thrust (`l4_snap`). The wind-up (blade far back) and the bigger root step (~130 px) make the difference.
* **cnt_parry** is a high overhead catch, close to the `h1_load` jodan, not the slanted "roof" deflection I asked for.
  **l5_load** is only mildly coiled (it looks a lot like `ready`). **dodge_back** has its feet drawn planted; it reads as a hop only
  through `lift`. **ready** is only moderately lower than idle (306 vs 339 px), although its stance is wider and leans forward.
* **Draw/sheath pops:** the move from `ready` (sheathed) to `block` and `l4_load` (drawn), and `bl_dash` (sheathed) in `blink_air`
  between drawn air frames, are 1-frame swaps. At 12 fps this reads as an instant iai draw, but there is no in-between.
* **l5_snap:** the hilt and the scabbard are drawn with a small gap, so it can look like the sword is half-drawn and held backwards.
* **Facing:** vic_2 is front-facing (a happy cheer). h2_imp and a few others are slightly three-quarter.
* **Generator drift:** the hakama length and armour detail vary a little frame to frame, and the head size varies by a few percent.
  One K is used and nothing is fixed per frame. An air frame that lost the hakama was rejected.
* **Root jumps:** heavy2 jumps ~130 px from load to impact (a step-in), and the launcher steps in 110 px on the hit frame so the
  rising cut reaches the dummy. light1 frame 2 sits at -20 px. In `vsdummy_juggle` frames 1–3, the dummy stands touching Paddy's
  front before the launch. In the 8-hit demo, the flash-step passes close to the dummy for about 1 frame.
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as Ninja and Kitty).
