# Fluid moves for normal Paddy + aerial finishers (TEST: not approved, not in generated/)

Built 31 Oct 2026 (NZDT). The spec asks for 3-6 frames per move; these use 7-11 because Pernell asked for every in-between (wind-up, smear/arc, impact, follow-through, recovery).
Sheets: single row, #FF00FF (Ninja on #00FF00), facing right, same body scale within a sheet, shared foot baseline (airborne frames are lifted). No text, no shadows.
Rebuild everything: /workspace/paddy-sprite-studio/build_fluid.sh. Frame order = animation order. Each sheet has a .gif at about 12 fps (80 ms per frame).

| sheet | frames | beats |
|---|---|---|
| combo_a.jpg | 11 | ready, step back, wind-up, deep load, swing start, sword overhead, smear, contact, follow-through (3/4 back to camera), recovery, sword rising, ready |
| combo_b.jpg | 11 | ready, turn starts, pivot, BACK TO CAMERA, coming round, horizontal smear ring, wide strike, wrap-around follow-through, recovery, rise, ready |
| combo_c.jpg | 10 | ready, sink, cat crouch, spring, apex (air), overhead arc (air), vertical smear, SLAM with sparks, rise, ready |
| jab.jpg | 8 | guard, load, half, snap impact (star), extended, half back, load, guard |
| cross.jpg | 7 | guard, wind-up (back shows), drive, full cross, over-rotation + streak, recoil, guard |
| hook_l.jpg | 7 | guard, load, swing (arc), hook impact (arc), follow-through, recovery, guard |
| hook_r.jpg | 7 | guard, wide wind-up, overhand swing (arc), impact (arc), follow-through, recovery, guard |
| uppercut.jpg | 9 | guard, dip, drive, rise, full extension, peak (vertical arc), coming down, settle, guard |
| tailspin.jpg | 7 | ready crouch, coil, spin (streaks), BACK VIEW mid-spin, TAIL-WHIP CONTACT (tail lashes right, spark), spin finish, land ready |
| air_finisher_1.jpg | 9 | SKY BUNNY BARRAGE: leap, air grab, double bunny kick (star), second kick, backflip release, cannonball spin, unfurl, slam shockwave, guard |
| air_finisher_2.jpg | 9 | FALLING STAR: crouch, sky swipe (claw arcs), cartwheel claw, apex, turn over, comet dive, claw strike, skid land, guard |
| ../nk_fluid/air_finisher_1.jpg | 9 | NINJA ECLIPSE DIVE: leap, crescent charge, clone strike, X slash (clone), crescent flip kick, neon dive, crescent shockwave impact, shadow fade, ready |
| ../nk_fluid/air_finisher_2.jpg | 9 | NINJA CRESCENT DROP: crouch, rising spin, somersault ring, axe-kick raise, axe kick, dive, ground split crescent, rise, ready |

The weapon is new: normal Paddy had no sword before (his moves were claws and boxing). It's a plain steel short sword with a brown grip and brass guard.


## Power punches v2 (Pernell style) — build with ./build_power2.sh, 12 fps GIFs
Character ref: reference/pernell_style.jpg + s4.png. Pose refs: reference/video_uppercut/key_*.jpg (Pernell's video), reference/clips/{hook_cross,heavy_cross}/ (mirrored to face right).
FX (blue curved trail + jagged starburst) are composited by fx.py so they stay identical across the hit-stop; hit-stop = impact pose x3 with the burst growing (r 70/115/160) and the trail thinning.
- power_uppercut.jpg — 9: guard, dip (fist to hip), drive (trail), mid (trail), IMPACT x3 (f5-7 hit-stop), retract (fist by ear), guard.
- power_jab.jpg — 8: guard, coiled load (twisted away, weight back, tail low), extend (trail), IMPACT x3 (f4-6), retract, guard.
- power_hook.jpg — 8: guard, cock (elbow out, fist by ear), wide swing (arc trail), IMPACT x3 (f4-6, horizontal arc), retract, guard.
- power_body.jpg — 8: guard, low load (fist at hip), drive low (trail), LOW IMPACT x3 (f4-6), retract (fist back to hip), guard.
Shared frames: guard_1 (all), retract_1 (jab+hook), u_retract_1 (uppercut retract + hook cock), u_dip_1 (uppercut dip + body retract).
Old versions: raw/power_v1/, raw/power_uppercut_rejected_jump.*, raw/power_uppercut_v2_grounded_rejected.*

## Power punches v3 (2026-10-31) — Pernell: "Yes, fix the wind-ups and uppercut"
Build: `./build_power3.sh` (raw poses raw/p3/ -> FX raw/p3fx/ -> frames frames/p3/ -> power_*.jpg/.gif). Compare: `python3 compare_power.py` (now reads frames/p3).
v2 sheets/GIFs/compares archived in raw/power_v2/ (plus compare_power_v2.py). Rejected v3 attempts kept in raw/p3/*_rejected_*.jpg.
- power_uppercut (9): crouch, dip, drive(+trail), impact x3 hit-stop (bent ~90 deg elbow, fist above head; burst 70/115/160), peak twist, retract, crouch.
- power_jab (9): guard, pre, load (arm drawn far back, weight back), fire(+trail), impact x3 (lunge), ret1, guard.
- power_hook (9): guard, pre, load (arm raised back), swing(+trail), impact x3, ret1, guard.
- power_body (9): guard, pre (sinking), load low, fire low(+trail), impact x3 (low lunge), ret1, guard.
Each move has its own retract pose; only the upright guard (frames/p2/guard_1.png) is shared as start/end for jab/hook/body.
Weak spots: see report — drive arm differs from dip arm; peak shows the back only partly; crouch moderate; j_fire nearly straight; h_pre ~ h_load; only 1 retract in-between per move; tail counter-swing is weak on pre frames.

## Power punches v4 (2026-10-31): redrawn to match in-game Paddy
Studio feedback: v3 looked like a different cat (front-on, cel outlines, grumpy raccoon mask, head ~1.5x too big).
v4: every pose edited from raw/p4/guard.jpg, which was generated from the in-game idle (idle_test_1 frame -> raw/p4/ref_idle.png) + src/s4.png.
Side profile facing right, soft painterly fur, idle head proportion, cream face / brown only round the eye / white blaze / small muzzle.
Build: ./build_power4.sh (raw/p4 -> raw/p4fx -> frames/p4 -> power_*.jpg/.gif), TARGET=199 = idle sheet fur scale (assemble.py now reads TARGET env; default 150 unchanged).
Same 9-frame layouts, trails, starburst 70/115/160, 3-frame hit-stop as v3. v3 archived in raw/power_v3/.
Compare: tests/compare/power_v4_vs_idle.png (python3 compare_v4_idle.py); video/clip compares rebuilt from frames/p4.
Rejected v4 attempts: raw/p4/*_rejected_*.jpg; h_load.jpg is a mirror of h_load_facingleft_orig.jpg.

## v5 polish pass (power punches) — 2026-10-31
Build: `./build_power5.sh` (raw poses raw/p5/, FX raw/p5fx/, cuts frames/p5/, BG= TARGET=199, 83 ms/frame). v4 archived in raw/power_v4/.
Pose guides: raw/p5/guides/ (stick figures via pose_guide.py; PIL paint-overs h_impact_paintover.jpg, h_pre_paintover.jpg — paint-overs worked far better than stick figures).
- Jab 11f: guard, pre, load, **half-out (new)**, **3/4-out (new)**, impact x3, retract, **settle (new)**, guard.
- Hook 11f: guard, **fist-lift beside head (new, paint-over)**, pre (v4), load (v4), swing (v4), **L-arm impact at head height (new)** x3, retract, **settle (new)**, guard.
- Body 11f: guard, pre, load (v4), **deep coiled load, fist at hip (new)**, **short low fire (new)**, impact x3, retract, **settle (new)**, guard.
- Uppercut 10f: **boxer crouch (new)**, dip, drive, impact x3, **follow-through showing upper back (new)**, **retract fist-at-forehead (new)**, settle (v4 retract), crouch.
Rejects kept in raw/p5/*_rej*.jpg. Compare: tests/compare/power_v5_vs_idle.png + 4 clip comparisons (compare_power.py, compare_v5_idle.py).

## v6 full-body power punches — 2026-10-31 (Pernell rejected v5: "whole body behind every movement, right down to the feet")
Build: `./build_power6.sh` -> raw/p6 (poses, rejects *_rej*, guides/ paint-overs), raw/p6fx, frames/p6, `assemble6.py` (NEW: root motion, squash/stretch, dust).
assemble6: back toe stays planted through load/drive/impact (so the body visibly travels forward as he lunges), follow-through/step frames are
anchored on the front toe (+dx) so the rear foot steps up and the root ends ~120-150 px forward. Equal-width sheet cells; per-frame root offsets in power_*_roots.txt.
Squash on loads (sy .85-.95), stretch on impacts, grey push-off dust at the back toe on drive + first impact frame. FX minimal (trail 26/18/10, burst 45/70/90).
Sequences (10-11 f): guard, load(s) with back to viewer, drive (push-off + dust), impact x3 (hit-stop), follow-through, step-up, guard.
v5 archived in raw/power_v5/. Compare: tests/compare/power_v6_vs_v5.png (compare_v6_v5.py). Impact stride vs guard 151px: jab 275, hook 259, body 287, uppercut 198 (v5: 191/210/219/146).

## v7 hook + uppercut (Tyson): 2026-10-31
`./build_power7.sh` → raw/p7, raw/p7fx, frames/p7 (assemble6). Jab and body stay v6; v6 hook and uppercut are archived in raw/power_v6/. Do NOT re-run build_power6.sh, which would overwrite the hook and uppercut.
- **Hook:** guard → peek-a-boo crouch → slip/dip → pivot and push-off (back to the viewer, elbow cocked, dust) → leaping-hook impact ×3 (low lunge, bent arm) → spin-through → peek-a-boo (rear foot stepped up 95 px) → guard.
- **Uppercut:** guard → peek-a-boo → deep dip → legs explode (dust) → impact ×3 (v6 pose) → corkscrew (back to the viewer) → peak (v5) → peek-a-boo → guard.
Compare: tests/compare/hook_upper_v7_vs_v6.png (compare_v7_v6.py). Movement bible: reference/MOVEMENT_BIBLE.md.
