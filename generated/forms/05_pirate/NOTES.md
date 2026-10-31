# Form 05: Pirate Paddy (sprite set for Game Studio Bot)

Built 1 Nov 2026 (NZDT, overnight run) with the 01_kitty / 02_ninja / 03_samurai / 04_knight method and the `_kit/`. Overnight work:
Pernell asked for overnight forms to go straight into the live game; he reviews them in the morning.

**Style: swaggering, off-balance swashbuckler on sea legs.** Pirate fights loose and side-on (`ready`): weight rocking on the bent
back leg, front foot light, cutlass forward, off-paw on the hip. The idle sways like a rolling deck. Strikes mix cutlass, boot and
hilt (flick, backhand, boot kick, hilt punch, drunken lurch), and every one throws the whole body: back foot pushes off, hips twist,
weight lurches through. Every strike ends on `recover` (a cocky wrist twirl, blade straight up) and then `ready`. It's deliberately
unlike Knight (planted, square), Samurai (draw-cuts), Ninja (darting) and Kitty (swats/pounces).

**Outfit** follows `reference/forms/05_pirate.png`: black tricorn with gold trim and a gold fish-bone badge, gold hoop earring,
navy sleeveless vest with gold trim over a cream fluffy chest, crimson sash with a flintlock tucked in (it always stays in the sash,
never fired), bare cream arms/legs, white paws, fluffy chocolate tail, curved silver cutlass with a gold basket guard. Clean blade,
no blood or gore.

**Face** matches `/workspace/paddy-game/src/s4.png`: cream face, chocolate mask round the blue eyes, white blaze, small white muzzle,
never all-brown (checked in `checks/final_face_check.jpg`). `idle_b`, `vic_1` and `vic_2` have happy closed eyes; `fin_pose` has the
hat raised and a big "yo-ho" grin.

## SIZE RULE (one size, never mixed)
* Pirate is **exactly base idle height, TARGET=199**: idle_a measures **340 px** at the one form scale **K = 0.3846**.
* That one K is used for every frame of every sheet and demo. Nothing is normalised per frame. Lower poses are shorter because the
  pose is lower (l5_snap 240, h2_imp 251, a1_snap 258, fin_imp 262), taller ones are taller because of a raised arm/blade
  (ln_imp 365, fin_pose 353, fin_coil 343). See `checks/all_frames_one_scale.jpg`.
* The sparring dummy is 340 px and not rescaled. Only single-frame squash/stretch (`sy` 0.88–1.0, `sx` ≤ 1.03) in `moves.py`.

## Format (same as 01–04)
* One row per sheet on exact **#FF00FF**, facing right, shared baseline, GAP 40, margin 48, 12 fps GIFs. No purple in this form,
  so no green copy.
* `_roots.txt`: one line per frame `frame pose root_x lift flags`. `HIT1/HIT2/HIT3` = hit-stop frames, `SFX:<cue>` = effort sound
  on the push-off frame (air lights and counter strike: on the first hit frame). Ground frames anchor on the planted back toe; air
  and dash frames use centroid + `lift`.
* Hit-stop 2 frames per strike, 3 on the finisher. Minimal kit FX only (small white burst + 3 speed lines, dust on push-offs, ghost
  trail on the heavies/dashes, tiny spark on block/parry).

## Sheets (`sheets/`, each = .jpg + .gif + _roots.txt)
| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a / idle_b (smug closed eyes) with a sea-legs sway, rotating ±2.5° like a rolling deck |
| ready | 5 | idle_a, dip, `ready` (loose side-on guard). Every ground move starts and ends on `ready`. |
| walk | 6 | swaggering walk: walk_a stride, dip, walk_b passing (far knee high), walk_c stride (far leg fwd), dip, walk_d passing; far leg shaded (`walklegs.py`), hips roll ±2° |
| victory | 8 | ready, idle_b, vic_1 (sweeping hat-off bow) ×3, vic_2 (hearty laugh, cutlass on shoulder) ×3 |
| light1_flick (1) | 7 | ready l1_load l1_load-drive[hup] l1_snap* ×2 (stamping lunge, cutlass flicked down-forward) recover ready |
| light2_backhand (2) | 7 | ready l2_load (twisted away) drive[hup] l2_snap* ×2 (rising backhand, blade high) recover ready |
| light3_bootkick (3) | 8 | ready l3_load (knee chambered) drive[hup] l3_snap* ×2 (flat push kick at chest height) l3_snap recover ready |
| light4_hiltpunch (4) | 7 | ready l4_load drive[hup] l4_snap* ×2 (gold basket guard punched at face height) recover ready |
| light5_lurch (5 / the 1' in 1-1-2) | 8 | ready l5_load (stagger back) drive[hup] l5_snap* ×2 (drunken low lunge at knee height) l5_snap recover ready |
| heavy1_corkscrew | 10 | ready h1_load ×3 (coiled, [GRUNT]) h1_imp* ×2 (full spin into a big chest-height arc, ~100 px travel, ghost) h1_imp ×2 recover ready |
| heavy2_fleche | 8 | ready h2_load h2_load[GRUNT] h2_imp* ×2 (flying horizontal lunge, ~110 px, ghost) h2_imp recover ready |
| launcher | 7 | ready ln_load ln_load[GRUNT] (deep crouch) ln_imp* ×2 (rising underhand scoop, dummy launched) air_ready air_ready. Ends airborne, lift 230. |
| air1_slash | 6 | air_ready ×2, a1_snap*[hup] ×2 (diagonal down slash), a1_snap, air_ready |
| air2_bootkick | 6 | air_ready ×2, a2_snap*[hup] ×2 (air push kick), a2_snap, air_ready |
| air3_crowsnest | 9 | air_ready a3_wind[GRUNT] a3_wind a3_snap* ×2 (head-first dive chop, dummy spiked) a3_snap land recover ready. Air ender. |
| blink ("deck roll") | 8 | ready ln_load[hiss] bl_dash ×4 (tucked forward somersault, rotated 0/90/180/270, ~500 px, ghost) land ready |
| blink_air | 5 | air_ready bl_dash[hiss] ×3 (air somersault) air_ready |
| block | 6 | ready, block ×4 (hanging guard, spark, slides back 12 px), ready |
| dodge | 6 | ready dip dodge_back ×2 (limbo lean-back, ~-60 px) recover ready |
| counter | 7 | ready block cnt_parry[hiss] (beats the blow aside) cnt_snap*[hup] ×2 (step-in riposte thrust) recover ready |
| finisher_jollyroger | 13 | ready fin_coil[HISS] ×2 (overhead twirl) h2_imp (fleche dash, ghost) a3_wind[BIG GRUNT] (leap) fin_imp* ×3 (crashing down-slash to the deck, dummy KO) fin_imp recover fin_pose ×2 (blade to the sky, hat aloft) ready |

Effort cues: `hup` = light grunt/exhale, `GRUNT` = heavy cat grunt, `hiss` = blink/parry hiss, `HISS` + `BIG GRUNT` = finisher.
Suggested extra one-shots: a steel *shing* on cutlass hits, a wooden *thump* on boot kicks and the hilt punch, and a "yo-ho!" /
pleased meow on `fin_pose`.

## Cancel windows / demos (`demos/`, each = demo_*.gif + vsdummy_*.gif + _roots.txt)
Same rule as 01–04: buffer opens on HIT1; a cancel at the end of frame n-1 starts the next move at its frame 2. Ground moves start/end
on `ready`, air moves on `air_ready`. Block cancels into counter.

| demo | route |
|---|---|
| 1-2 | flick → backhand |
| 1-1-2 | flick → lurch (1') → backhand |
| 1-2-3-4 | flick → backhand → boot kick → hilt punch |
| 1-2-3-4-5 | + lurch |
| juggle | launcher → blink_air → air slash → air boot kick → crow's nest drop (spike) |
| 8hit_finisher | L1, L5, L2, L3, L4, L1, H1 corkscrew, then the Jolly Roger finisher (dummy KO) |
| block_counter | block → parry → riposte |
| blink_in | deck roll in → flick |

Review strips: `checks/strip_vsdummy_*.jpg`, `checks/strip_walk.jpg`; all sheets: `checks/sheets_a/b/c.jpg`.

## Files
* `raw/*.jpg` generated poses (`raw/DRAW_LIST.md` has every prompt); `raw/master_design.jpg` = design anchor, `raw/idle_a.jpg` a copy.
  Stick guides in `raw/guides/` (`make_poses.py` → `poses.json` → `guide_pirate.py`), preview `checks/guides_contact.jpg`.
  Rejects in `raw/rej/` (`h1_imp_rej_guideblob`, `h2_load_rej_guideblob`: the generator painted the guide shapes in).
* `rawfix.py` (nothing needed this form), `walklegs.py`, `contacts.py`, `moves.py` (MOVES), `demos.py` (DEMOS). `./build.sh`
  rebuilds everything and touches only this folder.

## Known weak spots (honest)
* **Facing:** most drawings are three-quarter view rather than strict profile, like the master design.
* **ready** (319 px) is noticeably lower than idle (340) because it's a bent-knee sea-legs guard; that's intentional, but the
  idle→ready step reads as a small drop.
* **Walk:** only 2 real walk drawings; legs alternate by which foot is forward plus far-leg shading, so frames 1↔4 and 3↔6 are the
  same drawing apart from shading.
* **Blink** reuses `ln_load` as its push-off and `land` as its landing; **finisher** reuses `h2_imp` and `a3_wind` as in-betweens.
* **Generator drift:** hat size, vest trim and sash length vary a little frame to frame; one K, nothing fixed per frame.
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as every form so far).
