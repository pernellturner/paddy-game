# Crimson Blade Paddy (form 09): sheets for Game Studio

**Paths** (all under `/workspace/paddy-sprite-studio/forms/09_crimson_blade/`):
* `sheets/<move>.jpg` (**#FF00FF, primary**) + `sheets/<move>.gif` (12 fps preview on light grey) + `sheets/<move>_roots.txt`: 21 moves
* `sheets_green/<move>.jpg`: #00FF00 copies of the same 21 sheets (backup only, see Format)
* `demos/demo_*.gif` + `demos/vsdummy_*.gif` (+ `_roots.txt` each): 8 string demos, plain and vs the sparring dummy (16 GIFs)
* `frames/<pose>.png`: the 42 keyed RGBA frames at drawing resolution (unscaled; sheets apply K)
* QA: `checks/final_face_check.jpg`, `checks/all_frames_one_scale.jpg`, `checks/sheets_a/b/c.jpg`, `checks/strip_*.jpg`,
  `checks/morning_preview.jpg`

**Style: DANTE-LIKE SWAGGER** (cocky, stylish, flowing; family friendly). `ready` is a relaxed mid-height side-on stance, the huge
crimson greatsword held ONE-HANDED in the near paw with the blade angled up and forward at the foe, far gloved paw on the hip. Compared
with Power Blade (08) the wind-ups are shorter and snappier, follow-throughs flow straight into the next move, and every strike ends
on `recover` (a one-handed wrist twirl, blade caught pointing straight up) then `ready`. Whole body in every strike: back foot pushes
off, legs drive, hips and back twist, weight lunges through. Original and family friendly: the weapon is only ever a "greatsword" /
"crimson blade"; hits use the minimal kit FX only.

**Outfit** follows `raw/master_design.jpg`: long open crimson trench coat with gold trim and a high collar, brown leather chest
harness crossing the chest, brown belt with a silver buckle, fingerless dark-brown gloves on both paws (no gauntlet on this form),
tall dark-brown boots, cream chest and legs, fluffy chocolate tail; greatsword = long dark-red blade with flat bright-red vein lines,
swept dark-iron crossguard, long dark-brown wrapped grip, iron pommel.
**Face** matches `/workspace/paddy-game/src/s4.png`: cream face, chocolate mask round the blue eyes, white blaze, small white muzzle,
chocolate ears (checked in `checks/final_face_check.jpg`). `idle_b` has happy closed eyes.

## SIZE RULE (one size, never mixed)
* Crimson Blade Paddy is **exactly base idle height, TARGET=199**: idle_a measures **340 px** (idle_b 341) at the one form scale
  **K = 0.4024** (0.40237 = 340/845). idle_a stands upright with the greatsword planted point-down in front of him (paw on the pommel,
  pommel below the ears, blade tip above the boot soles), so the sword doesn't inflate the measurement.
* That K is used for every frame of every sheet and demo; nothing is normalised per frame. Low poses are shorter because they're low
  (a1_snap 236 air tuck, bl_dash 237, bl_push 247, l1_snap 259 deep lunge, dodge_duck 262, h1_load 262, h1_imp 265, land 265);
  `ready` is 344 (upright cocky stance); tall ones are tall because the sword is raised (vic_1 387, ln_imp 374, recover 372, fin_draw
  371, vic_2 368, l2_snap 362). See `checks/all_frames_one_scale.jpg`.

## Format (same as 01–08)
One row per sheet on exact **#FF00FF**, facing right, shared baseline, GAP 40, margin 48, 12 fps GIFs. **The drawings were made on
green (#00FF00)** (the form has no green: crimson coat, gold trim, brown leather, dark-red blade); `_kit/key.py` auto-detected green
and the keyed frames have no green fringe (checked: zero green-dominant pixels in all 42 frames). Green copies of every sheet are in
**`sheets_green/`** (#00FF00), but **Game Studio should use the magenta sheets**: any faint green spill left on an edge from the green
drawing background would vanish into a green key on the copies, whereas on magenta it can't be keyed away by accident.
Frame size: every cell in a sheet is the same size, given on line 1 of that sheet's `_roots.txt` with the baseline y (e.g.
light1_forehandslash cell 506×480, baseline y=418; idle 233×440, baseline 387). Naming: `sheets/<move>.jpg|.gif|_roots.txt`,
frames left to right = frame 1..n.
`_roots.txt`: `frame pose root_x lift flags`; root_x = px vs frame 1 (positive = forward), lift = px above the baseline;
`HIT1/2/3` = hit-stop, `SFX:<cue>` = effort sound on the push-off frame. Hit-stop 2 frames, 3 on Crimson Drive and the finisher smash.

## Sheets (`sheets/`, each = .jpg + .gif + _roots.txt; green .jpg copy in `sheets_green/`)
| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a easy breath, idle_b (content closed-eye smile), back. Sword planted point-down in front, near paw on the pommel, no drift. |
| ready | 5 | idle_a, dip, `recover` (sword flicked up out of the floor in a twirl), `ready` ×2 (settles with a small squash). Every ground move starts and ends on `ready`. |
| walk | 6 | cocky swagger stroll from **4 real drawings**: walk_1 (near leg fwd), walk_1, walk_2 (far knee up), walk_3 (far leg fwd), walk_3, walk_4 (near knee up); sword on the shoulder, 8 px bounce on the passing frames |
| victory | 8 | ready, recover, vic_1 (greatsword thrust overhead) ×3, vic_2 (sword on the shoulder, proud stance) ×3 |
| light1_forehandslash (1) | 8 | ready l1_load ×2 (sword drawn back) [hup] l1_snap* ×2 (deep lunge, level forehand slash) l1_snap recover ready |
| light2_risingslash (2) | 8 | ready l2_load ×2 (sword low behind) [hup] l2_snap* ×2 (rising backhand, tip high in front) l2_snap recover ready |
| light3_bootkick (3 / 1' in 1-1-2) | 9 | ready l3_load ×2 (front knee chambered, sword held back) [hup] l3_snap* ×2 (boot push-kick) l3_snap l3_load (retract) recover ready |
| light4_spincut (4) | 8 | ready l4_load ×2 (turned away, sword level behind) [hup] l4_snap* ×2 (pirouette into a level cut) l4_snap recover ready |
| light5_cleave (5) | 9 | ready l5_load ×3 (both paws, sword high) [hup] l5_snap* ×2 (two-handed diagonal cleave, tip low in front) l5_snap recover ready |
| heavy1_stinger | 11 | ready h1_load ×3 (crouch, longest wind-up) [GRUNT] h1_imp (rocket launch, ghost) h1_imp* ×2 (Stinger thrust) h1_imp ×2 (slide to a stop) recover ready; ~180 px total travel, biggest ground root motion apart from blink |
| heavy2_crimsondrive | 10 | ready h2_load ×3 (batter coil, both paws) [GRUNT] h2_imp* ×3 (massive two-handed diagonal cleave, ghost) h2_imp recover ready |
| launcher ("High Time") | 7 | ready ln_load ×2 [GRUNT] (squat, point near the floor) ln_imp* ×2 (one-handed scoop straight up, dummy launched, hop lift 40) air_ready ×2. Ends airborne, lift 230. |
| air1_slash | 6 | air_ready ×2, a1_snap*[hup] ×2 (one-handed air slash), a1_snap, air_ready |
| air2_spinslash | 6 | air_ready ×2, a2_snap*[hup] ×2 (air spin slash, blade level), a2_snap, air_ready |
| air3_helmbreaker | 10 | air_ready a3_wind[GRUNT] ×2 (sword hoisted overhead) a3_snap* ×2 (Helm Breaker plunge, dummy spiked) a3_snap (diving to the floor) land ×2 (crouched landing) recover ready |
| blink | 7 | ready bl_push[hiss] bl_dash ×3 (low dash, sword on the shoulder, ~430 px, ghost) land ready |
| blink_air | 5 | air_ready bl_dash[hiss] ×3 air_ready |
| block | 6 | ready, block ×4 (diagonal high guard, blade broadside, spark, slides back 12 px), ready |
| dodge | 6 | ready dip dodge_duck ×2 (cocky limbo lean back, slides back) recover ready |
| counter | 8 | ready block cnt_parry[hiss] (one-handed flick parry, spark) cnt_snap*[hup] ×2 (quick straight stab) cnt_snap recover ready |
| finisher_showtime ("Crimson Showtime") | 16 | ready fin_coil[HISS] ×3 (sword twirl, charge) fin_draw* ×2 (rising two-handed cut) a3_wind[BIG GRUNT] (leap, lift 100) fin_imp* ×3 + 1 (helm-breaker cleave into the floor, dummy KO) recover fin_pose ×3 (taunt: beckon) ready |

Effort cues: `hup` light, `GRUNT` heavy cat grunt, `hiss` blink/parry, `HISS` + `BIG GRUNT` finisher. Suggested one-shots (not effort
frames): a sharp *whoosh* on every greatsword swing (quicker and lighter than Power Blade's), a *shing* as the sword twirls in
`recover`, a metallic *clang* on block/parry, a boot *thwack* on the kick, a jet *whoom* on the Stinger launch, a heavy *thud* on the
Helm Breaker landing and the Showtime smash, and a cocky little cat *mrrp* on the taunt.

## Cancel windows / demos (`demos/`, demo_*.gif + vsdummy_*.gif + _roots.txt)
Same rule as 01–08 (buffer opens on HIT1; cancel at end of frame n-1 into frame 2 of the next move; ground moves on `ready`, air on
`air_ready`; block cancels into counter). Every move starts and ends in the shared `ready` (air: `air_ready`), so any move can chain
into any other.
| demo | route |
|---|---|
| 1-2 | forehand slash → rising slash |
| 1-1-2 | forehand slash → boot kick (1') → rising slash |
| 1-2-3-4 | forehand slash → rising slash → boot kick → spin cut |
| 1-2-3-4-5 | + two-handed cleave |
| juggle | High Time launcher → blink_air → air slash → air spin slash → Helm Breaker (spike) |
| 8hit_finisher | L1, L2, L3, L4, L5, H1 Stinger, H2 Crimson Drive, then Crimson Showtime (dummy KO) |
| block_counter | broadside block → flick parry → stab |
| blink_in | low dash → forehand slash |

## Files
`raw/*.jpg` drawings on green (see `raw/DRAW_LIST.md`; 1 reject in `raw/rej/`), guides in `raw/guides/` (`make_poses.py` →
`poses.json` → `guide_crimson.py`), `moves.py`, `demos.py`, `contacts.py`, `morning_preview.py`, `rawfix.py`; `./build.sh` rebuilds
everything and touches only this folder.
Build fixes this run:
* `rawfix.py` GROUND_LINE: left empty. No drawn ground lines or floor shadows in any of the 42 drawings (checked the bottom of every
  raw drawing and the keyed frames: zero green-dominant pixels).
* **Boot anchors** (`moves.py` CBForm): the prepared boot-colour test also matched the tail, the face mask and coat shadows, so in
  practice every frame was still anchored by the kit's raw left/right-most pixel. Result: in idle_a/idle_b the planted sword tip was
  the "front toe" and the tail tip the "back toe" (idle → ready jumped ~65 px), and the low tail tip also stood in for the back toe in
  vic_1, vic_2, walk_4, l3_snap and l4_load (land and fin_imp had the sword tip as the front toe). The test now keeps only boot leather
  (dark brown with G 0.42–0.8 of R, which excludes the crimson coat and the dark-red blade) and drops small or flat-coloured blobs (tail
  fluff) at the sole line, so every pose anchors on the boots only. The baseline was already right (no frame floats or sinks).
* **Recover/ready planted:** in all 5 lights, Crimson Drive, the Stinger, counter and the finisher, `recover` and `ready` slid the back
  boot forward another 4–18 px after the follow-through; they now stay on the follow-through's back boot.
* **Stinger** retuned: launch 95 → hit 160 (hit-stop) → slide 176 → 182, then recover/ready planted at 182 (was 110/170/190/196 then
  drifting on to 214), so the rocket accelerates through the ghost frames and stops, no sliding afterwards.
* **air3 Helm Breaker:** recover/ready now planted on the landing's back boot (was 8 px back then 2 px forward).
* **blink:** the final `ready` was centre-aligned after the landing and slid 35 px forward; now planted on land's back boot.
* **launcher:** the High Time hop jumped 76 px forward on the scoop frame; now ~46 px.

## Known weak spots (honest)
* **vic_1** is front-facing and **vic_2** is 3/4 view (mirrored to face right), not true profile.
* **l4_snap** looks close to **l1_snap** (both are level slashes in a lunge), so L4 reads mostly through its turned-away wind-up.
* **h1_load** isn't a deep sprinter crouch, so the Stinger wind-up is less coiled than intended.
* **h2_load** isn't back-turned: the Crimson Drive batter coil reads side-on.
* **land**: the sword tip is low in front but not stuck in the floor.
* **cnt_parry** is almost the same as `ready`, so the parry reads weakly (the spark FX carries it).
* **fin_pose** beckons but there's no wink.
* **fin_coil** isn't a clear windmill twirl: the sword sits low in front (the small rotation wobble suggests the twirl).
* **fin_imp**: the blade tip is planted near the front foot rather than far ahead.
* **walk** uses the same 6-frame convention and speed as 01–08 (body glide with alternating legs). The drawn stride is long, so the
  feet aren't truly planted frame to frame; matching them would need ~250 px per cycle.
* Generator drift: coat length, collar size and the sword's exact size vary a little frame to frame; one K, nothing fixed per frame.
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as every form).
