# Breathing guard + guard→weave in-between (assets only, not wired into code)

Canvas 560x460, anchor/feet (210,408) — same as approved_play/animation.json.

## breath/ — 28 frames, frame_00..27.webp (lossless)
- Source: practice-skin-v2 rig loop (101 frames, 4 s), every ~3.6th frame (indices 0,4,7,...,96).
- Play in order 00→27 and loop; ~143 ms per frame (4.0 s cycle).
- Draw at the jab scale ×1.0282 (frame_00 matches jab/frame_00 to within 1px outline antialiasing).

## guard_to_weave/ — 5 frames, frame_00..04.png
- Order: breath (any frame, best frame_00) → guard_to_weave 00..04 → weave/frame_00..07.
- 40 ms per frame (200 ms total).
- Draw at ×1.0282. Weave content is pre-scaled inside the frames so the last one lands at weave scale ×1.0466; then draw weave/ at ×1.0466 as usual.
- Method: smoothstep crossfade (premultiplied) + scale ease from guard to weave/frame_00. The rig could not morph into the chunkier weave drawing.
