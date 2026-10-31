# Form 06: Gunslinger Paddy (sprite set for Game Studio Bot)

Built 1 Nov 2026 (NZDT, overnight run) with the same method and `_kit/` as forms 01–05. Overnight work: Pernell asked for overnight
forms to go straight into the live game; he reviews them in the morning.

**Style: cool, low, wide-stance gunfighter.** `ready` is a planted wide crouch, both revolvers low at the hips, chin down under the
brim. He's still and economical, then explodes into a wide step for every hit (back foot drives, hips twist, weight lunges through).
Every strike ends on `recover` (a revolver twirled upright on the trigger finger) then `ready`. Deliberately unlike the other forms:
no blades, wide stance on every hit, and the off-paw always holds a second revolver. Family friendly: no muzzle flashes, bullets or
smoke drawn; hits use the minimal kit FX only.

**Outfit** follows `reference/forms/06_gunslinger.png`: black wide-brim cowboy hat, dark-red bandana, long black duster with maroon
lining over a cream chest, brown belt + holster, brown boots with silver spurs, chocolate tail, two orange-barrelled revolvers.
**Face** matches `/workspace/paddy-game/src/s4.png`: cream face, chocolate mask round the blue eyes, white blaze, small white muzzle
(checked in `checks/final_face_check.jpg`). `idle_b`, `vic_1`, `vic_2` have happy closed eyes; `fin_pose` half-closed, cool.

## SIZE RULE (one size, never mixed)
* Gunslinger is **exactly base idle height, TARGET=199**: idle_a measures **339 px** (idle_b 340) at the one form scale **K = 0.3782**.
* That K is used for every frame of every sheet and demo; nothing is normalised per frame. Low poses are shorter because they're low
  (a3_snap 193 diving, dodge_duck 233, land 241, a1_snap 243), `ready` is 301 because it's a wide crouch. See `checks/all_frames_one_scale.jpg`.

## Format (same as 01–05)
One row per sheet on exact **#FF00FF**, facing right, shared baseline, GAP 40, margin 48, 12 fps GIFs. No purple, so no green copy.
`_roots.txt`: `frame pose root_x lift flags`; `HIT1/2/3` = hit-stop, `SFX:<cue>` = effort sound on the push-off frame. Hit-stop 2 frames,
3 on the finisher.

## Sheets (`sheets/`, each = .jpg + .gif + _roots.txt)
| sheet | frames | sequence |
|---|---|---|
| idle | 8 | idle_a breathing, idle_b (closed-eye content smile), back. Still and steely, no sway. |
| ready | 5 | idle_a, dip, `ready` (wide low gunfighter crouch). Every ground move starts and ends on `ready`. |
| walk | 6 | bow-legged swagger from **4 real drawings**: walk_1 (near leg fwd), dip, walk_2 (far knee up), walk_3 (far leg fwd), dip, walk_4 (near knee up) |
| victory | 8 | ready, idle_b, vic_1 (twirling both revolvers, big grin) ×3, vic_2 (guns holstered, hat-tip salute) ×3 |
| light1_quickdraw (1) | 7 | ready l1_load (slap leather, front foot up) drive[hup] l1_snap* ×2 (wide step, arm snapped straight out) recover ready |
| light2_crossdraw (2) | 7 | ready l2_load (wound away, far gun by the shoulder) drive[hup] l2_snap* ×2 (far arm fires past the face) recover ready |
| light3_pistolwhip (3) | 8 | ready l3_load (gun raised high behind the head) drive[hup] l3_snap* ×2 (lean-in strike) l3_snap recover ready |
| light4_spurkick (4) | 8 | ready l4_load (knee chambered) drive[hup] l4_snap* ×2 (heel-and-spur side kick at waist height) l4_snap recover ready |
| light5_coatswing (5 / 1' in 1-1-2) | 8 | ready l5_load (coat wrapped) drive[hup] l5_snap* ×2 (duster whips forward like a sail) l5_snap recover ready |
| heavy1_fanhammer | 11 | ready h1_load ×3 [GRUNT] h1_imp* ×2 + 2 more hit frames (fan the hammer: 3 rapid hits from a planted ultra-wide lunge) h1_imp recover ready |
| heavy2_kneeslide | 8 | ready h2_load (guns crossed) h2_load[GRUNT] h2_imp* ×2 (knee-slide, both guns forward, ~110 px, ghost) h2_imp recover ready |
| launcher | 7 | ready ln_load ln_load[GRUNT] ln_imp* ×2 ("High Noon uppercut", dummy launched) air_ready ×2. Ends airborne, lift 230. |
| air1_doubleshot | 6 | air_ready ×2, a1_snap*[hup] ×2 (both guns punched down-forward), a1_snap, air_ready |
| air2_heelkick | 6 | air_ready ×2, a2_snap*[hup] ×2 (air spur kick), a2_snap, air_ready |
| air3_deadeye | 9 | air_ready a3_wind[GRUNT] (guns crossed overhead) a3_wind a3_snap* ×2 (head-first dive, dummy spiked) a3_snap land recover ready |
| blink | 7 | ready bl_push[hiss] bl_dash ×3 (low lightning dash, ~420 px, ghost) land ready |
| blink_air | 5 | air_ready bl_dash[hiss] ×3 air_ready |
| block | 6 | ready, block ×4 (coat shield, spark, slides back 12 px), ready |
| dodge | 6 | ready dip dodge_duck ×2 (duck under the brim, slides back) recover ready |
| counter | 7 | ready block cnt_parry[hiss] (barrel knocks the blow up) cnt_snap*[hup] ×2 (step-in gun-butt hook) recover ready |
| finisher_highnoon | 14 | ready fin_coil[HISS] ×2 (showdown stare) fin_draw* ×2 (lightning hip draw) a3_wind[BIG GRUNT] (leap) fin_imp* ×3 (X-cross double shot, dummy KO) fin_imp recover fin_pose ×2 (blows the smoke off the barrel, tips the hat) ready |

Effort cues: `hup` light, `GRUNT` heavy cat grunt, `hiss` blink/parry, `HISS` + `BIG GRUNT` finisher. Suggested one-shots (not effort
frames): a cartoon *bang* (pop-gun style, family friendly) on each gun hit, three rapid ones on heavy1, *ching* of spurs on the walk
and spur kick, a *whoosh* on the coat swing.

## Cancel windows / demos (`demos/`, demo_*.gif + vsdummy_*.gif + _roots.txt)
Same rule as 01–05 (buffer opens on HIT1; cancel at end of frame n-1 into frame 2 of the next move; ground moves on `ready`, air on
`air_ready`; block cancels into counter).
| demo | route |
|---|---|
| 1-2 | quick-draw → cross-draw |
| 1-1-2 | quick-draw → coat-swing (1') → cross-draw |
| 1-2-3-4 | quick-draw → cross-draw → pistol-whip → spur kick |
| 1-2-3-4-5 | + coat-swing |
| juggle | launcher → blink_air → air double shot → air heel kick → Deadeye Drop (spike) |
| 8hit_finisher | L1, L5, L2, L3, L4, L1, H1 fan-the-hammer, then High Noon (dummy KO) |
| block_counter | coat block → barrel parry → gun-butt hook |
| blink_in | lightning dash → quick-draw |

## Files
`raw/*.jpg` drawings (see `raw/DRAW_LIST.md`), guides in `raw/guides/` (`make_poses.py` → `poses.json` → `guide_gunslinger.py`),
`moves.py`, `demos.py`, `contacts.py`, `rawfix.py` (nothing needed), `./build.sh` rebuilds everything and touches only this folder.

## Known weak spots (honest)
* **Facing:** most drawings are three-quarter view, like the master design.
* **l1_snap and l2_snap** look alike (both an arm straight out at head height); the wind-ups differ more than the hits.
* **l3_snap** reads as a lean-in with both guns forward rather than a clear downward pistol-whip chop.
* **l5_load** isn't back-turned as planned; the coat-swing reads mostly through `l5_snap` (coat flared wide).
* **h1_load** shows the revolver pointed at the viewer; **ln_imp** has the feet still on the ground (the kit lifts it 60 px).
* **bl_dash** is a low lunge rather than a near-flat dash; the dash reads through the ghost trail and travel.
* **fin_imp** is a deep lunge with both guns forward rather than a one-knee X-cross.
* **vic_1** has two small brownish spin-blur arcs drawn by the generator beside the twirling revolvers.
* **fin_pose** has a tiny green smoke wisp above the barrel that keys out (almost nothing remains).
* Generator drift: hat size and coat length vary a little frame to frame; one K, nothing fixed per frame.
* The dummy uses its single "launched" tumble frame for the whole air phase (kit limitation, same as every form).
