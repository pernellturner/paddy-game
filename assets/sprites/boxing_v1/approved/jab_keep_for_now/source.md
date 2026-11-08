# Paddy jab v2 — LOCAL REVIEW ONLY, NOT GAME-READY

## Deliverables
- `frame_01_guard.png` … `frame_08_guard.png`: eight RGBA frames, 384 × 384.
- `jab_strip.png`: 3072 × 384 transparent horizontal strip; no labels or grid.
- `preview.gif`: light background, eight actual encoded frames, 920 ms loop.
- `frames.json`: durations, baseline, placement, source mapping and limitations.
- `candidate_review.jpg`, `review_contact_sheet.png`, `review_dark.png`, `gif_decoded_review.png`: review aids, not game assets.
- `candidates/`: transparent cut-outs of all plausible right-facing poses.

Source directory: `/workspace/paddy-game/uploads/zip_2026-11-08/`.
All fifteen original images, both turnarounds, the twelve-panel sheet and metadata were inspected visually. No generations, downloads, game edits, commits or pushes were made.

## Chosen frames
Panel indices are row-major in paddy_better_punch-03.png, 4 columns × 3 rows.

| Frame | Phase | Source | Duration |
|---|---|---|---:|
| 01 | Guard | 03, panel 1 (row 1 / col 1) | 280 ms |
| 02 | Load | 03, panel 10 (row 3 / col 2) | 80 ms |
| 03 | Held load, NOT a new hip-turn drawing | Same drawing as 02 | 50 ms |
| 04 | Extension | 03, panel 11 (row 3 / col 3) | 50 ms |
| 05 | Full extension / impact | 03, panel 3 (row 1 / col 3) | 110 ms |
| 06 | Recoil | 03, panel 11, reused without crossfade | 60 ms |
| 07 | Return | 03, panel 4 (row 1 / col 4) | 90 ms |
| 08 | Guard | Same drawing as 01 | 200 ms |

Five distinct source drawings. No mirroring, body rescaling, new drawing, limb warping or ghosted crossfades. Native source scale preserves head/torso proportions rather than measuring width including the arm. All frame alpha bottoms meet the exclusive baseline y=342. Front-paw centres are registered around x=244; differing paw shapes still vary by a few pixels.

## Why the 360 images were not forced into the final strip
The right-facing side view of 01 and the right-facing side / three-quarter views of 02 were extracted and are in `candidates/`. These are views of a single pose from different camera angles, not stages of a punch. Their head-to-body ratios and stance differ from 03; the 02 side jab also exposes the other arm compared with 03 panels 10/11/3. Mixing them into this near-arm sequence changed proportions or swapped the punching arm. They therefore were not selected. This is a quality choice, not a claim that the turnarounds became eight temporal drawings.

## Single-image assessment
- 04 / 05: lower guard poses can be recovered completely despite the bad slicer including another panel at the top. Extracted. Pinker body and different proportions than the chosen family.
- 06: upper full-extension pose extracted; another partial pose was excluded. More elongated body and cropped-looking tail clearance, plus motion marks.
- 07: upper load pose extracted, but larger stance/head and warmer coloration than 03.
- 08: complete extension, extracted; tail curls sharply upward compared with the other family.
- 09: extracted for comparison, rejected because of the crouch / knee dip.
- 10 / 11: camera-facing three-quarter guard/jab, rejected before extraction for the side-on sequence.
- 12 / 13: front-facing guard, rejected; effectively duplicates.
- 14 / 15: extracted extended punches; large forward lean, different tail positions and proportions. These would make an obvious body-size / tail jump in the chosen set.

## Cleanup / verification
White backgrounds removed by connected silhouette isolation, with edge alpha and white unmatting. Labels, panel borders and disconnected motion marks excluded. Internal pale fur is retained opaque. The chosen PNGs were reviewed on light and dark backgrounds; no white rectangle, visible numbering, grid lines, open paws or cut-off body parts remain. Small natural light fur outlines remain, not a white background matte. The impact canvas originally reached the right edge; it was shifted inward and rechecked, now with 14 px right margin.

Decoded all eight GIF frames and viewed the decoded contact sheet, not just the PNG source. A shared GIF palette prevents framewise palette flicker; sixteen entries explicitly preserve Paddy's tiny blue eyes (initial automatic quantisation lost them, which was corrected). GIF durations and frame count were checked. See `qa.json` for pixel bounds.

## Honest verdict
Clean technical sprite export; NOT game-ready boxing animation.

The selected sequence holds a consistent drawing family, closed near-side punching fist, fast extension and one strike only. However:
1. Guard-to-load changes the rear-foot stance by roughly 45–55 pixels while the front foot stays planted. Registration cannot remove that without redrawing or deforming a leg. This is still a visible stance pop, not genuinely smooth weight transfer.
2. The load drawing has the other paw too far behind the shoulder rather than guarding the chin.
3. There is no authentic temporal hip-turn in-between. Frame 03 deliberately holds frame 02 rather than inventing a misleading pose.
4. Extension and recoil share one drawing; return is still abrupt. Full extension lowers the head about 9–11 pixels from the lean, rather than a knee crouch, but it is not the fluid body mechanics requested.
5. Perspective changes make a definitive anatomical left/right-hand label unreliable; the visible near-side arm stays the punching arm in the selected action poses.

Do not present this as eight new excellent drawings or as an approved master sprite. It is the cleanest recoverable local assembly from a coherent subset, and should be shown for review only. Genuine intermediate poses and a stable guarded rear hand are still needed for the requested standard. Nothing was put into the game.
