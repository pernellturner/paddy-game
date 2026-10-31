# Form 08: Power Blade Paddy (sprite set for Game Studio Bot)

Built 1 Nov 2026 (NZDT, overnight run) with the same method and `_kit/` as forms 01–07. Overnight work: Pernell asked for overnight
forms to go straight into the live game; he reviews them in the morning.

**Style: heavy, powerful, momentum-driven greatsword fighter.** `ready` is a wide low power stance, side-on, knees deeply bent and
weight sunk, the huge greatsword resting on the near shoulder (blade pointing back and up), paws on the long grip. Every swing is
carried by the sword's weight: wind-ups are held longer than any earlier form, the back foot drives, hips and back twist through and
the follow-through frame carries forward. Every strike ends on `recover` (sword heaved up overhead and dropped back onto the shoulder)
then `ready`. Family friendly and original: the weapon is only ever a "greatsword" / "power blade"; the gauntlet punch is just a punch
(nothing fired); hits use the minimal kit FX only.

**Outfit** follows `raw/master_design.jpg`: long open dark-navy hooded coat with electric-blue trim, black utility belt with blue-lit
pouches, an armoured cyber gauntlet (dark-grey plates with blue light bands), cream chest and legs, bare cream feet, fluffy chocolate
tail; greatsword = wide silver-steel blade with flat electric-blue circuit lines, chunky black mechanical hilt, long black grip with a
red/blue gem (the small red gem seen in l2_load, l3_load and recover is part of the design, not a guide mark).
**Face** matches `/workspace/paddy-game/src/s4.png`: cream face, chocolate mask round the blue eyes, white blaze, small white muzzle,
chocolate ears (checked in `checks/final_face_check.jpg`). `idle_b` has happy closed eyes.

## SIZE RULE (one size, never mixed)
* Power Blade Paddy is **exactly base idle height, TARGET=199**: idle_a measures **340 px** (idle_b 342) at the one form scale
  **K = 0.3967** (0.39673). idle_a stands upright with the greatsword planted point-down beside him (paw on the pommel, sword top below
  the shoulder), so the blade doesn't inflate the measurement.
* That K is used for every frame of every sheet and demo; nothing is normalised per frame. Low poses are shorter because they're low
  (fin_imp 200 one-knee smash, h1_imp 226, l4_load 235, l3_snap 238, bl_push 241, h2_imp 252, land 256, bl_dash 257), `ready` is 313
  because it's a deep bent-knee stance; tall ones are tall because the sword is raised (vic_1 383, ln_imp 373, h2_load 369, l2_snap 357,
  recover 350). See `checks/all_frames_one_scale.jpg`.

## Format (same as 01–07, except the background note)
One row per sheet on exact **#FF00FF**, facing right, shared baseline, GAP 40, margin 48, 12 fps GIFs. **The drawings were made on
green (#00FF00)** (the form has no green: navy coat, blue trim, silver/blue blade); `_kit/key.py` auto-detected green and the keyed
frames have no green fringe (checked: zero green-dominant pixels in all 42 frames). Green copies of every sheet are in
**`sheets_green/`** (#00FF00), but **Game Studio should use the magenta sheets**: any faint green spill left on an edge from the green
drawing background would vanish into a green key on the copies, whereas on magenta it can't be keyed away by accident.
`_roots.txt`: `frame pose root_x lift flags`; `HIT1/2/3` = hit-stop, `SFX:<cue>` = effort sound on the push-off frame. Hit-stop 2 frames,
3 on the finisher.

## Sheets (`sheets/`, each = .jpg + .gif + _roots.txt; green .jpg copy in `sheets_green/`)
| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a slow heavy breath, idle_b (content closed-eye smile), back. Sword planted point-down beside him, no sway. |
| ready | 5 | idle_a, dip, `ready` (wide low power stance, sword on the shoulder; settles with a small squash). Every ground move starts and ends on `ready`. |
| walk | 6 | heavy confident stride from **4 real drawings**: walk_1 (near leg fwd), walk_1, walk_2 (far knee up), walk_3 (far leg fwd), walk_3, walk_4 (near knee up); sword on the shoulder |
| victory | 8 | ready, idle_b, vic_1 (greatsword thrust overhead) ×3, vic_2 (sword back on the shoulder, proud stance) ×3 |
| light1_overheadchop (1) | 9 | ready l1_load ×2 (sword heaved overhead) drive[hup] l1_snap* ×2 (huge lunge, vertical chop, tip near the floor) l1_snap recover ready |
| light2_risingupswing (2) | 9 | ready l2_load ×2 (twisted away, sword dragged low behind) drive[hup] l2_snap* ×2 (rising arc, tip high in front) l2_snap recover ready |
| light3_spincut (3) | 9 | ready l3_load ×2 (turned away, sword level behind) drive[hup] l3_snap* ×2 (full spin into a level cut) l3_snap recover ready |
| light4_gauntletpunch (4) | 8 | ready l4_load (fist cocked, sword low behind) drive[hup] l4_snap* ×2 (gauntlet fist driven out, sword trailing) l4_snap recover ready |
| light5_pommelthrust (5 / 1' in 1-1-2) | 8 | ready l5_load drive[hup] l5_snap* ×2 (pommel driven forward) l5_snap recover ready |
| heavy1_spincleave | 11 | ready h1_load ×3 (longest wind-up) drive[GRUNT] h1_imp* ×2 + 1 more hit frame (full-turn spinning cleave, 2 hits as the blade comes round, ~110 px lunge, ghost) h1_imp recover ready |
| heavy2_groundslam | 11 | ready, squat ×2 [GRUNT], h2_load ×3 (leap, sword overhead, lift 70/120/90) h2_imp* ×2 (two-handed ground slam, ghost, dust) h2_imp recover ready |
| launcher | 7 | ready ln_load ln_load[GRUNT] (squat, point on the floor) ln_imp* ×2 ("Rising Breaker", sword ripped straight up, dummy launched) air_ready ×2. Ends airborne, lift 230. |
| air1_chop | 6 | air_ready ×2, a1_snap*[hup] ×2 (air chop down-forward), a1_snap, air_ready |
| air2_spinsweep | 6 | air_ready ×2, a2_snap*[hup] ×2 (air spin sweep, blade level), a2_snap, air_ready |
| air3_plunge | 10 | air_ready a3_wind[GRUNT] ×2 a3_snap* ×2 (point-down plunge, dummy spiked) a3_snap (blade tip meets the floor) land ×2 recover ready |
| blink | 7 | ready bl_push[hiss] bl_dash ×3 (low dash, sword trailing, ~450 px, ghost) land ready |
| blink_air | 5 | air_ready bl_dash[hiss] ×3 air_ready |
| block | 6 | ready, block ×4 (blade held up broadside like a shield, spark, slides back 14 px), ready |
| dodge | 6 | ready dip dodge_duck ×2 (ducks low, sword flat over the head, slides back) recover ready |
| counter | 7 | ready block cnt_parry[hiss] (blade knocks the blow up) cnt_snap*[hup] ×2 (gauntlet punch) recover ready |
| finisher_powersurge | 15 | ready fin_coil[HISS] ×3 (sword planted, charge) fin_draw* ×2 (sword ripped up in a giant rising cut) a3_wind[BIG GRUNT] (leap) fin_imp* ×3 (one-knee ground smash, dummy KO) fin_imp recover fin_pose ×2 ready |

Effort cues: `hup` light, `GRUNT` heavy cat grunt, `hiss` blink/parry, `HISS` + `BIG GRUNT` finisher. Suggested one-shots (not effort
frames): a deep heavy *whoosh* on every greatsword swing (lower and slower than Light Paddy's), a metallic *clang* on block/parry, a
heavy *thud + rumble* on the ground slam, plunge landing and Power Surge smash, an electric *hum-crackle* while the sword charges in
fin_coil, a mechanical *clunk* of the gauntlet on the punches, and a *shk* as the sword drops back onto the shoulder in `recover`.

## Cancel windows / demos (`demos/`, demo_*.gif + vsdummy_*.gif + _roots.txt)
Same rule as 01–07 (buffer opens on HIT1; cancel at end of frame n-1 into frame 2 of the next move; ground moves on `ready`, air on
`air_ready`; block cancels into counter).
| demo | route |
|---|---|
| 1-2 | overhead chop → rising upswing |
| 1-1-2 | overhead chop → pommel thrust (1') → rising upswing |
| 1-2-3-4 | overhead chop → rising upswing → spin cut → gauntlet punch |
| 1-2-3-4-5 | + pommel thrust |
| juggle | Rising Breaker launcher → blink_air → air chop → air spin sweep → plunge (spike) |
| 8hit_finisher | L1, L5, L2, L3, L4, L1, H1 spin cleave, then Power Surge (dummy KO) |
| block_counter | broadside block → blade parry → gauntlet punch |
| blink_in | low dash → overhead chop |

## Files
`raw/*.jpg` drawings on green (see `raw/DRAW_LIST.md`; 6 rejects in `raw/rej/`), guides in `raw/guides/` (`make_poses.py` →
`poses.json` → `guide_power.py`), `moves.py`, `demos.py`, `contacts.py`, `morning_preview.py`, `rawfix.py`, `./build.sh` rebuilds
everything and touches only this folder.
Build fixes this run:
* `rawfix.py` GROUND_LINE: removed the thin drawn ground line in walk_2 and l1_snap and the floor shadow under fin_imp (green-dominant
  pixels only, so feet, coat and blade are untouched).
* Sword-tip anchors: in l2_load, l4_snap, h1_load and bl_push the greatsword tip on the floor behind him was being taken for the back
  toe (those frames jumped 70–130 px forward and snapped back); in l1_snap, h2_imp and ln_load the blade tip below the feet was taken
  for the foot baseline (he floated 6–12 px). `moves.py` now anchors those 7 poses on the feet (cream fur) only, never the blade.
* heavy2: recover/ready were centre-aligned after the slam and slid the feet ~34 px; now planted on h2_imp's back toe.
* air3: land was centre-aligned on the plunge (whose long blade pulls the centre down/forward), so he landed ~40 px behind the dive and
  recover then jumped ~46 px forward; land is now carried forward of the dive and recover/ready stay planted on land's back toe. The
  last plunge frame is raised so the blade tip meets the floor instead of sinking 52 px below it.
* air1: the chop threw the body ~35 px backwards (the blade pulls the centroid forward); dx retuned so the body stays in place.
* victory: vic_2 no longer drifts +6 px per frame.

## Known weak spots (honest)
* **l5_load** is very close to `ready`: the pommel strike is thrown from the shoulder carry, so the wind-up barely reads.
* **l3_load / h1_load** aren't back-turned: the spin cut and spinning cleave wind-ups read as a side-on coil rather than a turn away.
* **cnt_snap** is a straight gauntlet punch rather than a true uppercut.
* **ln_imp** has the feet flat rather than up on the toes, so the launcher looks less explosive.
* **vic_1** is three-quarter view rather than true profile.
* **Gauntlet arm:** in these drawings the cyber gauntlet sits on the visible (near) arm rather than the far arm (consistent across the
  set, including idle/victory, so it was accepted rather than redrawn).
* Generator drift: coat length, hood size and the sword's exact size vary a little frame to frame; one K, nothing fixed per frame.
* A handful of isolated 1–2 px keyed specks remain around some frames (invisible at sheet scale).
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as every form).
