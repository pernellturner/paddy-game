# Sparring dummy (TEST, not approved). Built 31 Oct 2026 (NZDT)

A friendly padded training dummy for showing Paddy's contact moves: a tan stitched-leather bag body with a cream canvas belly patch, a brown belt with a brass buckle, a red bottom band, stubby red mitt arms and a dot-eyes smile. It stands on a steel coil spring on a round wooden base. It faces LEFT (three-quarter view, toward Paddy). It's a prop, not a character, and there's no gore.

**Rebuild:** `./build_dummy.sh` runs rig.py, rig_fighter.py, make_mirrors.py, then make_demo.py, then flatten_bg.py checks on all 19 sheets (order matters: rig.py rewrites sheets_meta.json, the other two add to it). It doesn't generate images or touch the game, and it doesn't run build_power6.sh or build_power7.sh.

## How it's made
- `raw/base.jpg` is the one generated drawing (cursor GenerateImage, styled from reference/paddy_locked_ref.jpg). It was a re-turn of the first front-facing design, which is kept as `raw/design_front_rej_facing.jpg`.
- `raw/face_hit.jpg` (> < eyes with an "oof" mouth) and `raw/face_dizzy.jpg` (spiral eyes with a squiggle mouth) are face-only edits of base.jpg. rig.py pastes only the face box (feathered) onto the base, so the body pixels are identical in every frame.
- `rig.py` deforms those same pixels for each frame. The spring bends (t1), the bag gets an extra lagging bend for wobble (t2), the bag squashes and stretches while keeping its volume (sy, sx), the spring compresses (ss), and the whole body can tip on the base's bottom-right corner (knockdown/recover) or spin about its centre (launched). It also handles lift. The output is forward-splatted with 2x supersampling straight to final scale.
- **Scale:** the standing dummy is **340 px** tall, the same as Paddy's upright guard in tests/paddy_fluid/power_jab.jpg (341 px). See `scale_check.png`. The game should scale the dummy by the same factor it uses for Paddy's power sheets, not normalise it on its own to 232.
- **Sheets:** one row of equal cells on #FF00FF with 40 px gaps and a 48 px margin. There's no text, shadow or ground line. Every grounded frame's lowest pixel sits on the shared baseline. The standing root (base centre) is at the same x in every cell, and `<move>_roots.txt` gives the baseline, root x and per-frame lift. GIFs run at 83 ms per frame (12 fps; PIL stores this as 80 ms).

| sheet | frames | beats |
|---|---|---|
| idle | 4 | upright, sway right, centre, sway left (loops) |
| hit_light | 4 | snap back with a small squash (ouch face), recoil, rebound past centre, settle |
| hit_heavy | 6 | BIG squash (spring crushed, bag fat, ouch), max lean with the top lagging, whip-back stretch (dizzy), wobble, wobble, settle |
| launched | 6 | crouch-squash, stretch off the ground (lift 36), then tumbling clockwise up to the apex (centre rise 120, 195, 240, 258 px) |
| knockdown | 6 | rocked back, tipping on the base corner (28°, 62°), lands on its back with a squash, a small bounce (lift 14), lies dazed |
| recover | 4 | lying (= knockdown 6), springing up (48°), overshoot toward Paddy with a stretch, upright (about idle 1) |
| launched_fall | 4 | (added 31 Oct) from the apex keeps tumbling clockwise down the arc: 215° (centre rise 245), 295° (185), 375° = nearly upright, tilted 15° (95), then lands flat on its back with a squash (same pose as knockdown 4) |

Chaining: knockdown 6 is identical to recover 1, and recover 4 and the hit sheets end close to idle 1. Launched ends at the apex (frame 6, 138°) and **launched_fall** picks up from there (frame 1, 215°), so a juggle plays launched 1-6 → launched_fall 1-3 (re-hit it here; restart launched 3+ or hold a fall frame for a re-launch) → launched_fall 4 on the ground → knockdown 5-6 → recover. launched_fall 4 and knockdown 4 are the same pose, but launched/launched_fall spin about the body centre while knockdown tips on the base corner, so **knockdown sits 228 px further from Paddy relative to its root**. When cutting from launched_fall 4 to knockdown 5, move the dummy's root 228 px toward Paddy (left for the left-facing dummy, right for _R), or the body jumps. The game moves the root horizontally through the arc; the sheets only carry the lift.

## Demo
`dummy_demo.gif` shows the approved power_jab (its sheet cells re-keyed, read only, root motion unchanged) hitting the dummy. It runs 15 frames: dummy idle during the wind-up, hit_heavy 1 at the impact (frame 5), a 3 px shake on hit-stop frame 6, hit_heavy 2-5 through the follow-through, then hit_heavy 6 and idle while Paddy holds guard. The last frame is held for 500 ms. The contact is set so the jab burst lands on the dummy's head in the impact frame (`raw/demo_contact_check.png`).

## Facing-RIGHT copies (`*_R`, added 31 Oct)
`make_mirrors.py` flips every cell of the 7 base sheets (idle, hit_light, hit_heavy, launched, launched_fall, knockdown, recover) left to right and lays them out again in the same frame order, so frame 1 is still on the left. Cell size, baseline and lift are unchanged. The root x is mirrored (`root_x_R = cell_w - 1 - root_x`) and is in `<move>_R_roots.txt` and sheets_meta.json. Frames are `frames/<move>_R_NN.png`. Use these for the dummy standing **behind** Paddy (to his left, facing right toward him). Knockdown_R/recover_R fall away to the left, so the 228 px chain shift goes to the right.
Weak spot: it's a plain mirror. The light comes from the upper right on the _R copies and from the upper left on everything else, and the belt buckle and cream belly patch swap sides. At game size and with two dummies on screen this is noticeable if you look for it. A properly lit right-facing drawing would need a new generation.

## ATTACKER variant (`fighter_*`, added 31 Oct): the dummy that hits back, for dodge practice
It's the same drawing, which makes it the "fighter" dummy: a **red headband** with knot tails, and **red boxing gloves** with white cuffs in place of the stubby mitts. It faces LEFT. There's no gore, and every hit face is the same > < "oof" or spiral-eyes face.
- **How it's made (`rig_fighter.py`):** the body is raw/base.jpg deformed by the same maths as rig.py (and hit_heavy uses rig.py's hit_heavy body numbers exactly). Three new raw files:
  - `raw/fighter_noarms.jpg` is an edit of base.jpg. Only two parts of it are used, feathered onto base.jpg: the headband pixels and the patches where the two old arms were (now plain body or background). Everything else is still base.jpg's pixels.
  - `raw/face_fight.jpg` is a face-only edit (narrowed eyes with slanted brows and a smirk). Like face_hit and face_dizzy, only FACEBOX is used, and the headband sits above it.
  - `raw/glove_arm.jpg` is a separate generated part: a glove, a cuff and a tan stitched-leather tube.
- **The arms are separate rigid pieces now.** Each one hangs from a shoulder point that follows the body's bend and squash and turns with the local body tilt, plus its own angle. The far glove is drawn behind the body and darkened to 80%, and the near (front) glove is the **punching arm**, drawn in front. Its reach comes from showing more of the leather tube, with the tube's middle tiled and its shading flattened so the repeats don't band. The far arm moves too, but only by angle, as a guard.
- **Scale and format:** 340 px standing, the same as the base dummy. The sheet layout, #FF00FF, baseline, root, 12 fps GIFs, frames/ and _roots.txt all match. Every frame is grounded (lift 0).

| sheet | frames | beats |
|---|---|---|
| fighter_idle | 4 | same sway as idle, gloves up in guard bobbing against the sway, smiling (so the narrowing in the windup reads as a change) |
| fighter_attack_windup | 4 | **telegraph:** eyes narrow (fight face from f1), leans back on the spring (spring compresses), front glove pulled back and cocked fist-up beside the chest/shoulder; f3-f4 are the held coil (nearly the same, slightly more compressed) |
| fighter_attack_punch | 5 | springs forward (lean toward Paddy + stretch) and the front arm shoots out: reach 105, 157, **196**, 134, 108 px from the root toward Paddy. **f3 is the full-reach active frame** (f2-f3 = the hit window), f4-f5 pull back |
| fighter_attack_recover | 4 | arm retracts, body wobbles back past upright, face relaxes to the smile; f4 ≈ fighter_idle 1 |
| fighter_hit_heavy | 6 | the same body beats as hit_heavy (squash, max lean, whip-back stretch with the dizzy face, wobble, settle) with both gloves flung and lagging |

Chaining: fighter_idle → windup 1-4 (hold f4 for 1-3 extra frames to give the player a clear tell, as in the demo) → punch 1-5 → recover 1-4 → fighter_idle. fighter_hit_heavy can interrupt anywhere and ends close to fighter_idle 1. `fighter_attack_demo.gif` plays the full attack loop on one root (windup f4 held two extra frames).
For the hit box: the glove tip is at most 196 px left of the root (punch f3), at about chest/upper-body height. Compare the base dummy's front edge, about 100 px left of the root. The punch reaches about 95 px past its own body, so the attacker has to stand a bit closer to Paddy than the base dummy does to connect.
Not built: no fighter knockdown, launch or _R copies (the fighter is meant to stay standing, and `make_mirrors.py` could flip the fighter sheets too if wanted). No whoosh or impact FX, which Paddy's FX layer can add.

**Weak spots (honest):**
- Arm pieces: the glove, cuff and tube are a separately generated part matched to the style. At game size they read as the same dummy, but the glove's red is a touch brighter and cleaner than the bag's leather. At full reach the tube's flat inner end shows as a plain rounded cap on the chest, with no shoulder joint drawn. The tube's stitch dashes are faintly orange after the shading flatten, which only shows when zoomed.
- The windup glove is cocked fist-up beside the shoulder, not high beside the head, because the shoulder pivot is at chest height. The tell comes from the lean back, the spring squash and the narrowed eyes together. If testers miss it, hold windup f4 longer rather than redrawing.
- The punch is a stretchy, toy-like arm (glove-to-shoulder grows to about 3x the resting arm length). That's deliberate and cartoony, but it isn't a "real" punch.
- The headband and arm-removal patches come from a whole-image edit. They line up (median diff elsewhere is about 10/255, which is JPEG noise), but the patched body under the old near arm is generated paint, not original base pixels.
- launched_fall spins about 78° per frame, about twice the rise's ~38°/frame. That's needed to finish the flip onto its back in 4 frames, so the fall reads faster than the rise. Frame 3 to 4 goes from nearly upright to flat (a "slam").
