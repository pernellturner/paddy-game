# Paddy boxing v1 — local review candidates

NOT APPROVED / NOT GAME READY. No code changed; no Scenario generation or credits used.

## Deliverables
- `idle_guard/`: four-frame loop; test4 panels 1, 8, 12, 7. Best usable set, but these are near-duplicate guard drawings, not a newly animated breathing cycle.
- `right_straight_candidate/`: eight frames; test4 panels 1, 2, 3, 4, 5, 6, 7, 1. REVIEW ONLY. Fists appear closed and character faces right, but the source lacks convincing hip rotation, drops the guard on the wind-up, and has a sudden extended-arm-to-guard recovery. Not a finished hard boxing punch. The intended right hand cannot be independently confirmed from the ambiguous side-on anatomy. Do not label it a verified right-hand animation in game code.
- `source_cutouts/`: all 48 panels, including rejected poses, separated into transparent normalized cutouts for inspection only. Not animation sets.
- `contact_sheet.png`: labelled deliverable frames.
- `source_audit_contact_sheet.png`: all 48 cutouts on dark background.
- `source_manifest.json`: original sheet paths, numbered panels, crop rectangles, scale and placement.

Each animation folder contains individual RGBA PNGs, a horizontal strip, a light-background GIF and `animation.json` with timings and anchors. Canvas 576 × 352; foot baseline y=324; foot-anchor x=256; nominal silhouette height 280. Timing is suggested only.

## Rejections and quality limits
- Test1 panels 2–3: crouching; extended frames change tail/body stance. No complete sequence accepted. Guard poses were not mixed with test4 because subtle drawing/proportion differences create flicker.
- Test2 all panels: front/three-quarter camera-facing, with double-jab sequence; incompatible with side-on requirement.
- Test3 panels 3–4: obvious crouch. Panels 8–10: abrupt tail/stance changes. Panel 5 is a potentially useful isolated jab pose with the non-punching paw tucked, but later panels do not consistently preserve that anatomy. No reliable smooth LEFT jab accepted.
- Test4 panels 1–7: best available straight candidate, but lean/rotation and recovery remain below the requested boxer quality. Panels 8–12: guard duplicates; selected only for the small guard loop.
- No hook, additional wind-up set, interpolated retract or mixed-sheet action produced: available drawings do not support one cleanly. No ghosty blends, invented joints, hand swaps or mirroring used.

## Extraction and normalization
Actual four-column, three-row panel grid checked on all four sheets. Grid borders inset; largest connected subject selected to remove number glyphs and detached motion marks. Soft edge pixels retained locally and unmatted against white to reduce white fringe. This is a local chroma/connected-component extraction, not hand-painted fur restoration; tiny bright fur/whisker losses or attached motion marks remain possible. Original sources are unchanged.
All panels normalized by total silhouette height and median of bottom foot pixels. This removes gross scale/foot drift but cannot repair perspective changes or make crouches anatomically correct. Rejected frames remain visibly crouched in the audit. Set frames share one sheet to avoid mismatched character anatomy. No crossfades and no game integration.

## Source frame list

### idle_guard
- frame_01.png: `scenario/jab_test4_right/spritesheet.png`, panel 1
- frame_02.png: `scenario/jab_test4_right/spritesheet.png`, panel 8
- frame_03.png: `scenario/jab_test4_right/spritesheet.png`, panel 12
- frame_04.png: `scenario/jab_test4_right/spritesheet.png`, panel 7

### right_straight_candidate
- frame_01.png: `scenario/jab_test4_right/spritesheet.png`, panel 1
- frame_02.png: `scenario/jab_test4_right/spritesheet.png`, panel 2
- frame_03.png: `scenario/jab_test4_right/spritesheet.png`, panel 3
- frame_04.png: `scenario/jab_test4_right/spritesheet.png`, panel 4
- frame_05.png: `scenario/jab_test4_right/spritesheet.png`, panel 5
- frame_06.png: `scenario/jab_test4_right/spritesheet.png`, panel 6
- frame_07.png: `scenario/jab_test4_right/spritesheet.png`, panel 7
- frame_08.png: `scenario/jab_test4_right/spritesheet.png`, panel 1

## Repository status
Local assets only. No branch, commit or push performed: the actual owner requested sprite preparation, not a specific remote publication, and repository-content writes are delegated to an approved Cursor Cloud Agent under the source-control workflow. Request approval before launching an agent or publishing. Proposed target branch: `sprites/boxing-v1`; assets-only path: `sprites/boxing_v1/`. Never main.
