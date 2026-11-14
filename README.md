# Paddy's Way Home — fresh start (movement only)

A clean restart of Paddy's Way Home. This branch has no history from the old game.
The live game on `main` is untouched.

Right now Paddy can only run and jump, on one quiet test level. No attacks, no enemies, no other forms.

## Play

Open `index.html` through any static file server (needed for ES modules), or use the test link from a commit on this `fresh-start` branch:

`https://raw.githack.com/pernellturner/paddy-game/<commit-sha>/index.html`

On a phone, turn it sideways. A stick is on the left, a Jump button on the right. A light push on the stick (about 15–55% of the way out) is a walk; a firm push (60% and beyond) is a run. Push the stick down to crouch. On a keyboard: arrows or WASD to run, hold Shift to walk, Down or S to crouch, Space / Up / W to jump. Tap jump again in the air for a double jump. Let go early for a shorter jump. You can jump from a crouch.

## What's in this folder

- `index.html` — page, layout, iPhone landscape / safe-area / rotate hint
- `src/main.js` — Phaser 3 game setup
- `src/config.js` — every movement and layout number, in one place
- `src/scenes/BootScene.js` — loads the Paddy spritesheet
- `src/scenes/TestLevel.js` — the test level, camera, collisions
- `src/player/Paddy.js` — run, jump, double jump, coyote time, jump buffer
- `src/input/TouchControls.js` — virtual stick, jump button, keyboard
- `lib/phaser.min.js` — Phaser 3.90.0, vendored so there is no CDN
- `assets/paddy/` — base Paddy art only (idle, run, jump / fall)
- `scripts/pack-sprites.py` — rebuilds the spritesheet from the individual PNGs

## Art

These are the same base Paddy frames the old game used (not Dante, Golden Fury, or any other costume). Idle, run and jump all come from the Kitti `k_` sheets so the face stays side-on:

- Idle: `k_spin_00`, with a light breathing scale (the older `idle_test_1` sheet had a different face angle)
- Walk: `kt_walk_00`–`05` (same Kitti side-on face as the run)
- Run: `k_run_00`–`07`
- Crouch: `k_jump_00` (the gather frame; there is no separate k_crouch sheet)
- Jump, apex, fall, land: `k_jump_00`–`05` (rise is 01–02, apex 03, fall 04, land 05)
- Double-jump flip: `k_spin_01`–`05`

They are packed into `assets/paddy/paddy.png` plus `paddy.json`, with a shared foot origin so he does not wobble when the animation changes.

## Engine

Phaser 3, Arcade physics, plain ES modules. No build step. Tune feel in `src/config.js`.
