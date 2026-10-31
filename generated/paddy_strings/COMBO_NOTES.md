# Paddy punch strings: chainable quick punches (TEST, not approved yet)

Built 31 Oct 2026 (NZDT). Rebuild: `/workspace/paddy-sprite-studio/build_strings.sh` (runs only the new pipeline; it does not run build_power6/7.sh and doesn't write into tests/paddy_fluid/ or the game repo).
Pipeline is the same as v6/v7: raw poses `raw/ps/` (paint-over guides in `raw/ps/guides/`, rejects `*_rej_*`), FX `raw/psfx/` (fx.py), cuts `frames/ps/` (cutpose.py), sheets made with the unchanged `assemble6.py` (TARGET=199, #FF00FF, one row, facing right, shared baseline, root motion, squash/stretch, push-off dust). Demos come from `assemble_chain.py` (the same maths, chained).
GIFs run at 12 fps (83 ms per frame; PIL stores it as 80 ms). Each sheet has a `_roots.txt` with the per-frame root x offset (px at final scale, relative to frame 1).

## Shared guard ("neutral")
**Neutral = the approved v7 peek-a-boo guard** (`tests/paddy_fluid/frames/p7/peekaboo_1.png`): low crouch, paws high on the cheeks, eyes peeking over them, elbows tight.
Every punch sheet has this exact frame as **frame 1 and frame 7**, so any punch can follow any other.
**Recovery to idle:** `string_recover` (3 frames) goes neutral → rising (`recover_mid`, new) → upright guard (`frames/p7/guard_1.png`, the start/end frame of the approved power punches). Play it when no further input comes in.

## Sheets (7 frames each, 2-frame hit-stop on frames 4-5)

| sheet | punch | frames | hit-stop | net root travel |
|---|---|---|---|---|
| string_jab1 | quick left jab (1) | 1 neutral, 2 sink (squash), 3 drive + trail + dust, **4-5 impact (burst 45 → 70)**, 6 retract (half-extended), 7 neutral | 4-5 | +40 px |
| string_jab2 | jab variant (1') | 1 neutral, 2 bob/slip (v7 slip), 3 rising drive + trail + dust, **4-5 impact (higher, more upright, tail curled up)**, 6 retract, 7 neutral | 4-5 | +40 px |
| string_cross | right cross (2) | 1 neutral, 2 coil (squash), 3 drive (near/rear arm across the chest, back heel up, dust), **4-5 impact**, 6 retract, 7 neutral | 4-5 | +50 px |
| string_lhook | left hook (3) | 1 neutral, 2 slip (loads the lead leg), 3 pivot/push-off (approved v7 h_pivot, dust), **4-5 impact (approved v7 h_imp1/h_imp2)**, 6 spin-through (v7 h_follow), 7 neutral | 4-5 | +60 px |
| string_rbody | right body shot (4) | 1 neutral, 2 deep coil (v6 b_load), 3 low drive (v6 b_drive, dust), **4-5 low impact (v6 b_imp1/b_imp2)**, 6 follow-through/rear foot steps up (v6 b_follow), 7 neutral | 4-5 | +96 px |
| string_recover | back to idle | 1 neutral, 2 rising, 3 upright guard (idle) | – | -18 px |

## Cancel windows (how strings flow)
- **Buffer input** from frame 4 (first hit-stop frame) onward.
- **Cancel point = the end of frame 6.** The next punch starts at **its frame 2**, which replaces frame 7 (the neutral) of the current punch. Never play the neutral twice.
- **Root:** place the next punch's frame 1 where the current punch's frame 7 would have been, using the `_roots.txt` value of frame 7, even when frame 7 is skipped. So each cancelled punch shows 5 frames (2-6), and the opener shows 6 (1-6).
- **Last punch in a string:** play it to frame 7, then `string_recover` frames 2-3 (or stay in neutral if the player keeps guard up).
- If no input has come by the end of frame 7, go to recovery.
- **Hit timing:** the hit is on frame 4 (drive on 3). At 12 fps that's 250 ms from the press for an opener and about 167 ms for a cancelled follow-up.
- **Not recommended:** cancelling straight out of hit-stop (after frame 5, skipping the retract), because the arm snaps from full extension to the next load. If the game wants an even faster jab-jab, allow it for jab1 → jab2 only.

## Demo GIFs (built with exactly the rule above)
| file | string | frames | travel |
|---|---|---|---|
| demo_1-2.gif | jab1 → cross → recover | 14 | 72 px |
| demo_1-1-2.gif | jab1 → jab2 → cross → recover | 19 | 112 px |
| demo_1-2-3-4.gif | jab1 → cross → lhook → rbody → recover | 24 | 228 px |
| demo_8hit_finisher.gif | jab1 → jab2 → cross → lhook → rbody → lhook → cross → **approved v7 power_uppercut** | 46 | 436 px |

The finisher uppercut is the approved v7 sheet with frames, offsets, squash and its 3-frame hit-stop unchanged (from build_power7.sh). It's joined on its frame 2 (peek-a-boo = our neutral), so it plays frames 2-11: dip, legs explode, impact ×3, corkscrew, peak, peek-a-boo, guard. It ends in the upright guard/idle, so no extra recovery is needed.
Each demo has a `demo_*_roots.txt` (gNfM = punch N, frame M).

## Art provenance
- **New poses (this pass):** jab1_half, jab1_snap, jab2_half, jab2_snap, cross_half, cross_snap, recover_mid. All were edited from the approved v7 peek-a-boo and checked against src/s4.png: cream face, brown only round the blue eyes, white blaze and muzzle, no sword. cross_snap/cross_half were drawn through paint-over guides, because the generator kept turning the cross back into a far-arm jab (rejects kept).
- **Reused approved frames (read-only):** v7 peekaboo, guard, slip, h_pivot, h_imp1/2, h_follow, the whole uppercut; v6 b_load, b_drive, b_imp1/2, b_follow.
