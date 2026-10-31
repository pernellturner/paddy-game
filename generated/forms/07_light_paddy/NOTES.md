# Form 07: Light Paddy (sprite set for Game Studio Bot)

Built 1 Nov 2026 (NZDT, overnight run) with the same method and `_kit/` as forms 01–06. Overnight work: Pernell asked for overnight
forms to go straight into the live game; he reviews them in the morning.

**Style: calm, flowing, graceful light monk.** `ready` is a balanced mid-height stance, side-on, knees soft, the light blade held
two-handed at the chest and angled up and back over the near shoulder. He's serene and economical, then flows into each cut with a
long smooth lunge (back foot drives, hips twist, weight goes through). Every strike ends on `recover` (blade twirled in a wheel
beside the hip) then `ready`. Unlike the other forms: one glowing blade plus open-palm pushes (blade switched off), wide sleeves and
robe that trail every move. Family friendly and original: the weapon is only ever called a "light blade"; palm pushes are just a
palm (nothing fired, no lightning); hits use the minimal kit FX only.

**Outfit** follows `raw/master_design.jpg`: cream/ivory wrap monk robe with gold trim and two gold chest clasps, gold-trimmed sash,
long wide sleeves with brown inner cuffs, cream baggy trousers, brown leg wraps with gold cross-ties, bare cream feet, fluffy
chocolate tail; light blade = lime-green blade with a white core on a brown/bronze hilt.
**Face** matches `/workspace/paddy-game/src/s4.png`: cream face, chocolate mask round the blue eyes, white blaze, small white muzzle,
chocolate ears (checked in `checks/final_face_check.jpg`). `idle_b`, `vic_1`, `vic_2`, `fin_pose` have happy/calm closed eyes.

## SIZE RULE (one size, never mixed)
* Light Paddy is **exactly base idle height, TARGET=199**: idle_a measures **340 px** (idle_b 341) at the one form scale **K = 0.3700**
  (0.36997). idle_a is drawn upright holding the switched-off hilt in both paws at the belly, so no blade inflates the measurement.
* That K is used for every frame of every sheet and demo; nothing is normalised per frame. Low poses are shorter because they're low
  (bl_dash 150 gliding flat, dodge_duck 163, h1_imp 231, fin_imp 242, ln_load 249, land 250), `ready` is 300 because it's a bent-knee
  stance; tall ones are tall because the blade is raised (vic_1 358, ln_imp 359). See `checks/all_frames_one_scale.jpg`.

## Format (same as 01–06, except the background note)
One row per sheet on exact **#FF00FF**, facing right, shared baseline, GAP 40, margin 48, 12 fps GIFs. **Drawings were made on
magenta (#FF00FF), not green, because the blade is lime green** and would key out on green; `_kit/key.py` auto-detects magenta and the
blade survives intact. Green copies of every sheet are in **`sheets_green/`** (#00FF00) because the robe has no purple; if Game Studio
keys the green copies, use a tight green key (the blade is lime, not pure green) or simply use the magenta sheets.
`_roots.txt`: `frame pose root_x lift flags`; `HIT1/2/3` = hit-stop, `SFX:<cue>` = effort sound on the push-off frame. Hit-stop 2 frames,
3 on the finisher.

## Sheets (`sheets/`, each = .jpg + .gif + _roots.txt; green .jpg copy in `sheets_green/`)
| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a slow deep breath, idle_b (content closed-eye smile), back. Serene, no sway. |
| ready | 5 | idle_a, dip, `ready` (balanced monk stance, blade up over the shoulder). Every ground move starts and ends on `ready`. |
| walk | 6 | calm glide from **4 real drawings**: walk_1 (near leg fwd), dip, walk_2 (passing), walk_3 (far leg fwd), dip, walk_4 (passing); blade carried over the shoulder |
| victory | 8 | ready, idle_b, vic_1 (blade twirled overhead, big closed-eye grin) ×3, vic_2 (blade off, upright before the chest, calm bow) ×3 |
| light1_fallingcut (1) | 7 | ready l1_load (blade high behind) drive[hup] l1_snap* ×2 (long lunge, blade swept out) recover ready |
| light2_risingarc (2) | 7 | ready l2_load (blade low by the back hip) drive[hup] l2_snap* ×2 (rising arc, tip high in front) recover ready |
| light3_spincut (3) | 8 | ready l3_load (half-turned away) drive[hup] l3_snap* ×2 (spin cut, blade level) l3_snap recover ready |
| light4_palmpush (4) | 8 | ready l4_load drive[hup] l4_snap* ×2 (open far palm pushed forward) l4_snap recover ready |
| light5_twirlthrust (5 / 1' in 1-1-2) | 8 | ready l5_load (blade wheeled overhead) drive[hup] l5_snap* ×2 (level thrust) l5_snap recover ready |
| heavy1_spinarc | 10 | ready h1_load ×3 [GRUNT] h1_imp* ×2 + 1 more hit frame (great spinning arc, ~80 px lunge, ghost) h1_imp recover ready |
| heavy2_palmpush | 8 | ready h2_load ×2 [GRUNT] h2_imp* ×2 (double light-palm push, blade off, ~70 px, ghost) h2_imp recover ready |
| launcher | 7 | ready ln_load ln_load[GRUNT] ln_imp* ×2 ("Rising Light", blade straight up, dummy launched) air_ready ×2. Ends airborne, lift 230. |
| air1_fallingslash | 6 | air_ready ×2, a1_snap*[hup] ×2 (blade cut down-forward), a1_snap, air_ready |
| air2_spinsweep | 6 | air_ready ×2, a2_snap*[hup] ×2 (air spin sweep, blade level), a2_snap, air_ready |
| air3_fallingstar | 9 | air_ready a3_wind[GRUNT] ×2 a3_snap* ×2 (diving cut, dummy spiked) a3_snap land recover ready |
| blink | 7 | ready bl_push[hiss] bl_dash ×3 (low flat glide, ~420 px, ghost) land ready |
| blink_air | 5 | air_ready bl_dash[hiss] ×3 air_ready |
| block | 6 | ready, block ×4 (upright blade, spark, slides back 12 px), ready |
| dodge | 6 | ready dip dodge_duck ×2 (ducks low under the blade, slides back) recover ready |
| counter | 7 | ready block cnt_parry[hiss] (blade knocks the blow up) cnt_snap*[hup] ×2 (step-in far-paw palm strike) recover ready |
| finisher_dawnbloom | 14 | ready fin_coil[HISS] ×2 (calm salute) fin_draw* ×2 (blade wheel) a3_wind[BIG GRUNT] (leap) fin_imp* ×3 (level sweep, dummy KO) fin_imp recover fin_pose ×2 (blade off, calm bow) ready |

Effort cues: `hup` light, `GRUNT` heavy cat grunt, `hiss` blink/parry, `HISS` + `BIG GRUNT` finisher. Suggested one-shots (not effort
frames): a soft hum while the blade is out, a *vwoom* swing on each blade cut, a *zzt-click* when the blade switches off (h2, fin_pose,
vic_2), a soft *whump* of cloth on the palm pushes.

## Cancel windows / demos (`demos/`, demo_*.gif + vsdummy_*.gif + _roots.txt)
Same rule as 01–06 (buffer opens on HIT1; cancel at end of frame n-1 into frame 2 of the next move; ground moves on `ready`, air on
`air_ready`; block cancels into counter).
| demo | route |
|---|---|
| 1-2 | falling cut → rising arc |
| 1-1-2 | falling cut → twirl thrust (1') → rising arc |
| 1-2-3-4 | falling cut → rising arc → spin cut → palm push |
| 1-2-3-4-5 | + twirl thrust |
| juggle | Rising Light launcher → blink_air → air falling slash → air spin sweep → Falling Star (spike) |
| 8hit_finisher | L1, L5, L2, L3, L4, L1, H1 spin arc, then Dawn Bloom (dummy KO) |
| block_counter | blade block → blade parry → palm strike |
| blink_in | glide dash → falling cut |

## Files
`raw/*.jpg` drawings on magenta (see `raw/DRAW_LIST.md`, which also lists the 2 rejects in `raw/rej/`), guides in `raw/guides/`
(`make_poses.py` → `poses.json` → `guide_light.py`), `moves.py`, `demos.py`, `contacts.py`, `rawfix.py` (nothing needed: no drawn
ground lines or shadows), `./build.sh` rebuilds everything and touches only this folder.
Build fixes this run: finisher post-landing frames no longer drift +50 px per frame (now planted on the back toe); heavy1 recover no
longer slides the back foot backwards 26 px; dodge recover jitter (-60/-80/-60) removed; light1 hit FX now sits on the blade tip
(it was landing on the front foot because l1_snap's blade points up, not down).

## Known weak spots (honest)
* **Walk:** all four walk drawings look alike: walk_1/walk_3 are nearly the same stride, and the passing poses (walk_2/walk_4) don't
  show a clear knee lift under the robe, so the walk reads as a glide (root motion does most of the work).
* **l1_snap** ("falling cut"): the blade sweeps UP and forward rather than down on a diagonal, so 1 and 2 (rising arc) hit alike.
* **land** is a deep lunge rather than a one-knee landing; **fin_imp** is a low near-kneel lunge, closer to the plan but not a full kneel.
* **h2_load:** the switched-off hilt isn't visible (both paws drawn back empty-looking).
* **recover:** the paws look like cartoon circles (simplified mitts) compared with the other frames.
* **Facing:** most drawings are three-quarter view, like the master design.
* **idle_a** holds the switched-off hilt in both paws at the belly rather than loosely at the side (fine, still upright, full height).
* Generator drift: hood/sleeve size and robe length vary a little frame to frame; one K, nothing fixed per frame.
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as every form).
