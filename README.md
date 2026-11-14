# Paddy's Way Home — fresh start (movement only)

A clean restart of Paddy's Way Home. This branch has no history from the old game.
The live game on `main` is untouched.

Right now Paddy can run, jump, and do one front-paw swipe, on one quiet test level. No enemies or other forms.

## Play

Open `index.html` through any static file server (needed for ES modules), or use the test link from a commit on this `fresh-start` branch:

`https://raw.githack.com/pernellturner/paddy-game/<commit-sha>/index.html`

On a phone, turn it sideways. A stick is on the left; Attack and Jump are on the right, close enough for one thumb. A light push on the stick (about 15–55% of the way out) is a walk; a firm push (60% and beyond) is a run. Push the stick down to crouch. On a keyboard: arrows or WASD to run, hold Shift to walk, Down or S to crouch, Space / Up / W to jump, X / J / Z to swipe. Tap jump again in the air for a double jump. Let go early for a shorter jump. You can jump from a crouch. A second tap of Attack during the swipe recovery queues one more swipe.

## What's in this folder

- `index.html` — page, layout, iPhone landscape / safe-area / rotate hint
- `src/main.js` — Phaser 3 game setup
- `src/config.js` — every movement and layout number, in one place
- `src/scenes/BootScene.js` — loads the Paddy spritesheet
- `src/scenes/TestLevel.js` — the test level, camera, collisions
- `src/player/Paddy.js` — run, jump, double jump, coyote time, jump buffer, swipe
- `src/input/TouchControls.js` — virtual stick, jump and attack buttons, keyboard
- `src/targets/PracticeTarget.js` — stationary practice dummies that wobble when hit
- `lib/phaser.min.js` — Phaser 3.90.0, vendored so there is no CDN
- `assets/paddy/` — base Paddy art only (idle, run, jump / fall)
- `scripts/pack-sprites.py` — rebuilds the spritesheet from the individual PNGs

## Art

These are the same base Paddy frames the old game used (not Dante, Golden Fury, or any other costume). Idle, run and jump all come from the Kitti `k_` sheets so the face stays side-on:

- Idle: `k_spin_00`, with a light breathing scale (the older `idle_test_1` sheet had a different face angle)
- Walk: `kt_walk_00`, `01`, `02`, `04`, `05` (`03` is packed but skipped — it flips the tail and body angle)
- Run: `k_run_00`, `02`, `03`, `04`, `05`, `06` (`01` and `07` are packed but skipped — they bunch up and hitch against the long strides)
- Crouch: `k_jump_00` (the gather frame; there is no separate k_crouch sheet)
- Jump, apex, fall, land: `k_jump_00`–`05` (rise is 01–02, apex 03, fall 04, land 05)
- Swipe: `k_m_power_00`–`03` on the ground (planted on the foot line: coil, reach, recover) and the same poses with their original air anchors in the air. Same Kitti face and body scale as idle and jump.

They are packed into `assets/paddy/paddy.png` plus `paddy.json`, with a shared foot origin so he does not wobble when the animation changes. Each source family is rescaled at pack time (idle stays 1, walk is slightly reduced, run is slightly enlarged) so the body matches one size, measured ear-tip to eye, not including the tail. Idle breathing and the landing squash always return to scale 1.

## Engine

Phaser 3, Arcade physics, plain ES modules. No build step. Tune feel in `src/config.js`.
