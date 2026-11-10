# Paddy jab, pass 8 (rig-to-2d-test-v5): candidate for Pernell. NOT handed to Game Studio.

The layout and naming are the same as v4 final and jab_keep_for_now: a 384 canvas with feet at y=341 (baseline 342), the front paw anchored at x≈230–264, and files frame_01_guard … frame_10_guard. frames.json and jab_strip.png are included.

Pipeline: lock3 → cleanup → colourmatch (pass-8 shading) → shape (new) → footpivot → stance → assemble8.
GenerateImage this pass: 0.

## Pass 8 changes

### Body shape (scripts/shape.py)
- The torso is slimmed about its centreline, k=0.88–0.90, fading out into the thighs.
- The body is stretched upward, so the head (the old pasted head, unchanged) no longer drops.
- A forward lean shear makes "lean in" real and keeps the head path close to the old frames.

Torso widths at 50/60/70% of body height:

| Frame | Widths (px) |
|---|---|
| old guard | 91 / 96 / 98 |
| new load | 100 / 98 / 113 (v4 was 110 / 106 / 116) |
| new launch | 94 / 104 / 118 |
| new extension | 88 / 86 / 115 |
| new impact | 91 / 98 / 127 |

The old approved frames' hips are 116–140 in their wide stance. Shin and leg thickness were already within 1–5 px, so the legs were left unscaled.

Head top across the loop, guard→guard: 55, 57, 59, 60, 60, 63, 60, 60, 57, 55. In v4 the load dropped to 71–75.

Back-of-head x: old guard 181, then new 172, 167, 167, 177, 172. The old set itself goes 181 → 168 → 182 → 201.

### Shading (scripts/colourmatch.py)
- The image is split into a smooth base layer (bilateral filter) and a detail layer.
- The base layer's cream and fawn mean and spread are matched to the old guard, and strand detail is turned down to 0.65×.
- The old art's dark edge outline is kept.

### Tail
- Impact now shows the full old tail (no clipping), so it matches the length in the other frames.
- The stance in-between's tail layer was redone, which removes the gap, the stray hairs and the knob on the back.
- The tail root on extension was tidied.

### Rear-foot pivot
- Launch is now 18° (was 12°), extension 24° and impact 30°, so it increases steadily.

### Motion
Unchanged from Pernell's direction:
- The left paw leads and the right paw stays at the chin.
- The hips turn, then the shoulders.
- The chest is about 65° toward the viewer at impact.
- The rear foot pivots on the ball.

The punching arm is the anatomical LEFT paw (rig *.L bones).

## Honest remaining tells
- **Fawn patch layout differs:** the new frames have the fawn on the shoulder and arm, while the old guard has it down the front belly. This is the main giveaway when the old and new frames are compared side by side.
- **New fur is a touch softer:** texture energy is about 0.7× the old guard, and cream shading is a little flatter.
- **The stance widens from guard into load:** this is the same as in the old approved set, and the new stance in-between eases it.
