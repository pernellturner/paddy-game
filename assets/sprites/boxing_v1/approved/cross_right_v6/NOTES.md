# Paddy RIGHT CROSS (the "2"), v6 — rig-to-2d-test-v6-cross

Same layout as jab_left_v5_approved: a 384 canvas, feet at y=341 (baseline 342), front paw anchored at x≈230–265, frames.json and cross_strip.png. The punching arm is the anatomical RIGHT (rear) front paw. It is the near arm to the camera: the rig bones are *.R, aimed by cross_phase in poses2.py, and the left paw is tucked with tuck_guard('L').

## Frames (950 ms loop)
| # | file | ms | notes |
|---|---|---|---|
| 01 | frame_01_guard | 280 | old approved guard (= jab frame_01) |
| 02 | frame_02_turn | 60 | both paws at the chin, hips starting to turn (new painted in-between) |
| 03 | frame_03_launch | 50 | right paw leaves the chin with no pull-back; left paw at the chin; rear heel up 22° |
| 04 | frame_04_extension | 40 | right arm nearly straight; rear-foot pivot 32° |
| 05 | frame_05_impact | 130 | right arm straight; shoulders turned past side-on; head behind the shoulder; weight on the front leg; rear heel turned out on the ball |
| 06 | frame_06_recoil | 60 | = extension |
| 07 | frame_07_return | 70 | = launch |
| 08 | frame_08_turn_out | 60 | = turn |
| 09 | frame_09_guard | 200 | old approved guard |

## 1-2 combo (chain from the jab)
Jab frame_01–frame_07 (recoil), then combo_turn_from_jab_recoil.png (50 ms), then cross frame_03–frame_09. The combo turn is frame_02_turn with the rear paw slid back toward the jab-recoil stance. The left paw snaps back to the chin there, so there is no full guard between the punches. Files: combo_1_2.gif and combo_1_2_strip.png; frames.json → combo_1_2 has the durations.

## Pipeline
poses2.py cross_phase (rig v3, camera AZ 25 / EL 5) → GenerateImage (guide first, then identity refs) → lock3 (old head and old tail pasted, tail at a fixed -24°) → armfit.py (the reach was rendered shifted 45 px left, then the arm was squeezed to fit, x≤374) → cleanup_c → colourmatch → shape (torso widened k=1.15–1.18 to match the jab body) → footpivot → legswap (impact rear shin/paw) → legshift (launch rear paw +12) → polish.py (fur-scribble lines removed, magenta edge despill, tail-root pin-holes filled) → assemble_cross.py.

## Honest tells
- The camera sits on Paddy's right, so the full Tyson turn shows his fawn shoulder and back at impact, not his cream chest. Physically that is what a rear-hand cross does from this side. If Pernell meant "chest open to the camera", the impact needs a re-pose.
- In extension and impact the left paw is hidden behind the head and the near arm. Only turn and launch show it at the chin.
- The hip edge against the tail root is a thin, ragged 2–3 px line, at the same level as the approved jab's launch.
- The upper arm is horizontally compressed (armfit) near the shoulder to keep the reach on the canvas.
