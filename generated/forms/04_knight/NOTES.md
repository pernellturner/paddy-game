# Form 04: Knight Paddy (sprite set for Game Studio Bot)

Built 1 Nov 2026 (NZDT) with the 01_kitty / 02_ninja / 03_samurai method and the `_kit/`. This is a TEST set and is not wired into the game.

**Style: heavy, armoured sword-and-shield.** Knight fights from a planted, square guard (`ready`): shield up in front on the near
arm, sword cocked over the rear shoulder. The lights alternate shield and blade (shield jab, thrust, forehand cut, shield uppercut,
low cut). The heavies are a committed overhead cleave and a full-body shield charge. Every strike follows through into `recover`
(shield pulled back to guard) and then `ready`. It is deliberately unlike Ninja (darting), Kitty (swats and pounces) and Samurai
(iaido draw-cuts): there's no sheathing and no hopping, the feet stay planted, the weight is heavy, and the shield is part of
every move.

**Outfit and weapon** follow `reference/forms/04_knight.png` (copied to `raw/refs/knight_ref.png`): silver plate armour, a visored
helmet with a blue plume, a blue cape, a blue kite shield with a gold paw, and a silver sword with a gold guard and pommel. He has a
fluffy chocolate tail and an upright two-legged body, like the other sword forms. The blade is clean silver, with no blood or gore.

**Face** matches `/workspace/paddy-game/src/s4.png`: a cream face, chocolate only in the mask around the blue eyes, a white
blaze and a small white muzzle. It is never all-brown. The helmet visor covers most of the forehead, so the blaze shows only
between the eyes. I checked every frame (`checks/final_face_check.jpg` plus a zoomed head crop of every frame), and none has a
brown muzzle or an all-brown face. `vic_2` and `idle_b` have happy closed eyes.

## SIZE RULE (one size, never mixed)
* Knight is **exactly base idle height, TARGET=199**. Base Paddy's upright guard is 340 px.
* One form scale **K = 0.3949** (= 340 / height of the keyed `idle_a` cut, 861 px at alpha>200) is used for **every frame of every
  sheet and demo**. Measured idle_a at K = **339 px** after the alpha>200 crop (the same as Kitty and Samurai). Nothing is
  normalised per frame. Lower poses are shorter because the pose is lower (h2_imp 290, l5_snap 292, fin_imp 294, block 296).
  Taller poses are taller because of the pose: the plume or a raised arm (fin_coil 357, ln_imp 367 with the shield thrust overhead,
  idle_b 349, vic_1/vic_2 345/346). This isn't a rescale. See `checks/all_frames_one_scale.jpg` (white line = 340 px above the baseline).
* The sparring dummy is also 340 px tall and is not rescaled.
* The only extra scaling is Movement Bible squash/stretch on single frames (`sy` 0.88–1.02, `sx` ≤ 1.04; search `moves.py`).

## Format (same as 01_kitty / 02_ninja / 03_samurai)
* One row per sheet on exact **#FF00FF**, facing right, on a shared baseline, GAP 40, margin 48. 12 fps GIFs. Knight has no purple
  (silver, blue, gold), so there is no green copy (SHEET_SPEC: green only for purple forms).
* Each `_roots.txt` has one line per frame: `frame pose root_x lift flags`. `HIT1/HIT2/HIT3` are hit-stop frames and
  `SFX:<cue>` is an **effort sound**. The cue sits on the **push-off / effort frame** (the drive frame before the hit), except
  for the air lights and the counter strike, where it sits on the first hit frame. Ground frames are anchored on the planted back
  toe. Air and dash frames use a centroid anchor plus `lift`.
* Hit-stop is 2 frames on every strike and 3 on the finisher. FX are minimal (kit FX): a small white burst with 3 speed lines at the
  striking edge, speed lines on some drive frames, a ghost trail on the charge and dashes, dust puffs on push-offs, and a tiny
  spark on block.

## Sheets (`sheets/`, each = .jpg + .gif + _roots.txt)
`*` = hit-stop, `[cue]` = effort sound.

| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a breathing (sword point up, shield in front), then idle_b (eyes closed, calm breath), then back. 2 real drawings. |
| ready | 5 | idle_a, dip, then `ready` (planted square guard, shield up, sword over the rear shoulder). Every ground move starts and ends on `ready`. |
| walk | 6 | walk_a stride (near leg forward) → dip → walk_b passing (**far** knee high) → walk_c stride (**far** leg forward) → dip → walk_d passing (**near** knee high). The far leg is shaded in each frame (`walklegs.py`). Root +21..39 px/frame. |
| victory | 8 | ready, idle_b, vic_1 (sword raised point-up in salute) ×3, vic_2 (sword planted point-down, paws on the pommel, eyes closed smile) ×3 |
| light1_shieldjab (button 1) | 7 | ready l1_load l1_load-drive[hup] l1_snap* l1_snap* (shield punched straight out, rear foot drives) recover ready |
| light2_thrust (2) | 7 | ready l2_load l2_load-drive[hup] l2_snap* l2_snap* (straight thrust under the shield) recover ready |
| light3_forehand (3) | 7 | ready l3_load (blade wound back) drive[hup] l3_snap* l3_snap* (forehand cut, blade carried level and far forward) recover ready |
| light4_shieldupper (4) | 7 | ready l4_load l4_load-drive[hup] l4_snap* l4_snap* (shield driven up and forward like an uppercut) recover ready |
| light5_lowcut (5 / the 1' in 1-1-2) | 7 | ready l5_load drive[hup] l5_snap* l5_snap* (low cut toward the shins) recover ready |
| heavy1_overhead | 9 | ready h1_load (sword high over the head, tall) h1_load h1_load-drive[GRUNT] h1_imp* h1_imp* (two-hand overhead cleave into a deep lunge, blade down-forward) h1_imp recover ready |
| heavy2_shieldcharge | 8 | ready h2_load (coils behind the shield) h2_load-push[GRUNT] h2_imp* h2_imp* (full-body shield charge, ghost trail, ~90 px step) h2_imp recover ready |
| launcher | 7 | ready ln_load ln_load[GRUNT] (squat) ln_imp* ln_imp* (springs up, shield heaved straight overhead, dummy launched) air_ready air_ready. Ends airborne, lift 230. |
| air1_slash | 6 | air_ready air_ready a1_snap*[hup] a1_snap* (air horizontal slash) a1_snap air_ready |
| air2_shieldbash | 6 | air_ready air_ready a2_snap*[hup] a2_snap* (air shield bash) a2_snap air_ready |
| air3_plunge | 8 | air_ready a3_wind[GRUNT] (sword overhead) a3_snap* a3_snap* (diving, point-down plunge, dummy spiked) a3_snap land recover ready. This is the air ender. |
| blink (charge-step) | 6 | ready h2_load[hiss] bl_dash bl_dash (low armoured charge-step, ghost trail, ~480 px travel) ready-land ready |
| blink_air | 4 | air_ready bl_dash[hiss] bl_dash air_ready |
| block | 6 | ready, then block ×4 (braced low, shield square in front, small spark, slides back 12 px), then ready |
| dodge | 5 | ready dip dodge_back (lean-back hop behind the shield, about -100 px) block (braced landing) ready |
| counter | 7 | ready block cnt_parry[hiss] (shield catches the blow) cnt_snap*[hup] cnt_snap* (step-in cut) recover ready |
| finisher_bastion | 13 | ready fin_coil[HISS] (sword raised high, gathering) fin_coil h2_imp (shield charge, ghost) a3_wind[BIG GRUNT] (leaps, sword overhead) fin_imp*×3 (one-knee ground smash, sword driven down) fin_imp recover fin_pose (stands tall, sword salute) fin_pose ready |

Effort-sound cues: `hup` = light effort grunt/exhale, `GRUNT` = heavy effort (cat grunt), `hiss` = charge-step/parry (cat hiss),
`HISS` + `BIG GRUNT` = finisher. Suggested extra one-shots (not marked as effort frames): a metal *clang* on every shield hit
(light1, light4, heavy2, air2, block spark, cnt_parry) and an armour *clank* on `land` and the finisher impact.

## Cancel windows / demos (`demos/`, each = demo_*.gif + vsdummy_*.gif + _roots.txt)
These match 03_samurai, 02_ninja and 01_kitty exactly. The buffer opens on HIT1. A cancel at the end of frame n-1 starts the next
move at its frame 2. Every ground move starts and ends on `ready`, and every air move starts and ends on `air_ready`. Block cancels
into counter. Frame n-1 of every strike is `recover`, so a chained string always pulls the shield back to guard before the next
load. That is the knight's rhythm.

| demo | route |
|---|---|
| 1-2 | shield jab → thrust |
| 1-1-2 | shield jab → low cut (1') → thrust |
| 1-2-3-4 | shield jab → thrust → forehand → shield uppercut |
| 1-2-3-4-5 | + low cut |
| juggle | launcher → blink_air → air slash → air shield bash → plunge spike (dummy spiked down) |
| 8hit_finisher | L1 shield jab, L5 low cut, L2 thrust, L3 forehand, L4 shield uppercut, L1 shield jab, H1 overhead, then the Bastion finisher (dummy KO) |
| block_counter | block → shield parry → counter cut |
| blink_in | charge-step dash-in → shield jab |

Review strips are in `checks/strip_vsdummy_*.jpg` and `checks/strip_walk.jpg`. All sheets are in `checks/sheets_a/b/c.jpg`.

## Files
* `raw/*.jpg`: generated poses. `raw/master_design.jpg` is the design anchor and `raw/idle_a.jpg` is an exact copy of it. Stick
  guides (`make_poses.py` → `poses.json` → `guide_knight.py`, the kit guide with silver armour, helmet and plume, a blue kite shield
  and a gold-guard sword, red = striking part) are in `raw/guides/` (preview `checks/guides_contact.jpg`). `raw/rej/` holds the
  rejects (`a1_snap_rej_1`, `ln_load_rej_shovel`).
* `rawfix.py` writes `raw/clean/fin_imp.jpg`: the generator drew a thin dark-green ground line across `fin_imp` (raw rows
  ~877–884). It's reset to the flat key green before keying, and `build.sh` keys the clean copy. The small green breath puff
  in `recover` is close to the key colour and keys out cleanly, so nothing needs doing (checked zoomed).
* `walklegs.py` makes `walk_a/b/c/d` from two real drawings (`walk_3` stride, `walk_2` high-knee passing) by shading the far leg.
* `contacts.py` makes `checks/all_frames_one_scale.jpg` and `checks/sheets_a/b/c.jpg`.
* `frames/*.png`: keyed RGBA frames. `moves.py` = MOVES, `demos.py` = DEMOS. `./build.sh` rebuilds everything. It only touches
  this folder, never runs build_power6/7 and never touches game code or `/workspace/paddy-game/`.

## Known weak spots (honest)
* **Facing:** most drawings are **three-quarter view** rather than strict right-facing profile (the same as the master design).
  **vic_2** is front-facing.
* **Loads too close to ready:** `l1_load`, `l4_load`, `ln_load` and `land` are nearly identical to `ready` (keyed heights 337,
  337, 325 and 335 vs ready 335). The generator wouldn't crouch or coil more. So the wind-ups of light1, light4 and the launcher
  read mostly through the `sy` squash, dust and root step, not through a real coil, and `land` hardly reads as a landing crouch.
  `ready` itself is only slightly lower than idle (335 vs 339 px), although it's a wider guard.
* **a2_snap** (air shield bash) looks almost the same as `air_ready`. The bash reads mainly through the hit FX and the forward
  root push.
* **l5_snap** has the sword angled **down-back** rather than swept forward, so the low cut reads more like a drag than a forward
  sweep.
* **ln_imp** shows an **extra scabbard at the hip** (the other frames have none).
* **Light2 vs light3:** `l3_snap` (forehand cut) ends with the blade level and far forward, so it looks quite like the `l2_snap`
  thrust. The `l3_load` wind-up (blade wound back) is the main difference.
* **Walk:** there are only 2 real walk drawings. The legs alternate by which foot is forward or lifted, plus a shaded far leg.
  The shading shows clearly on the silver greaves, but frames 1↔4 and 3↔6 are the same drawing apart from the shading.
* **Dodge** lands on `block` (braced) rather than a separate landing drawing. **Blink** reuses `h2_load` as its push-off.
  **Finisher** reuses `h2_imp` (charge) and `a3_wind` (leap) as in-betweens.
* **Contact overlap:** in the 8-hit and 1-2-3-4(-5) demos, the shield uppercut (`l4_snap`, contact gap 60) overlaps the front of
  the dummy for 2 frames. The launcher steps in 90 px on the hit frame so the shield reaches the dummy.
* **Generator drift:** the cape length, plume size and armour detail vary a little frame to frame, and the head size varies by a few
  percent. One K is used and nothing is fixed per frame.
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as Ninja, Kitty and Samurai).
