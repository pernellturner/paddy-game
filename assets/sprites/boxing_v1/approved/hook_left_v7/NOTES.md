# Paddy LEFT HOOK (the "3"), v7 — rig-to-2d-test-v7-hook

Same layout as the jab and the cross: a 384 canvas, feet at y=341 (baseline 342), front paw anchored at x≈230–264, frames.json and hook_strip.png. The punching arm is the anatomical LEFT (lead) paw, the FAR arm. It comes from behind the cheek, the same arm as the jab. The rig is hook_phase in poses2.py with bones *.L. The rig projection check (work/check_hook.py) puts the left shoulder screen-right of the right shoulder. The right paw stays tucked at the chin throughout.

## Frames (880 ms loop)
| # | file | ms | notes |
|---|---|---|---|
| 01 | frame_01_guard | 280 | old approved guard |
| 02 | frame_02_load | 80 | = cross frame_02_turn: small dip, hips cocked toward the cross side, both paws at the chin |
| 03 | frame_03_launch | 60 | left paw swings up and round beside the cheek; right paw at the chin |
| 04 | frame_04_impact | 130 | left arm level at chin height, bent, paw turned over in front of the muzzle; chest squared to the camera (rig: 13° off camera); weight on the back leg; front foot pivots on the ball, heel out 22° |
| 05 | frame_05_recoil | 60 | = launch |
| 06 | frame_06_return | 70 | = load |
| 07 | frame_07_guard | 200 | old approved guard |

## 1-2-3 combo
Jab frame_01–07, then the cross combo turn, then cross frame_03–06 (to recoil), then hook frame_03–07. A third press during the cross recoil chains into hook frame_03, and the body whips from the cross's turned-away back to the hook's squared chest. Files: combo_1_2_3.gif and combo_1_2_3_strip.png.

## Pipeline
hook_phase guides → GenerateImage → lock3 (old head/tail) → cleanup_c → colourmatch → shape → footpivot (SIDE=front) → polish → assemble_hook.py. GenerateImage: 6 calls, 4 of them rejected (wrong arm, straight jab arm ×2, pointing arm).

## Honest tells
- From this side camera the hook's horizontal arc happens in depth. The impact therefore reads as a short, level, bent punch with the paw turned over, not a wide swinging hook. Most of the "hook" read comes from the motion: the paw comes up beside the cheek, then out level, with the body whipping square. The image model would not paint a clearly bent horizontal arm.
- The launch's elbow sits lower than a textbook hook chamber.
- Load and return reuse the cross turn frame.
