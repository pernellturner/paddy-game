# Sprite handover for Paddy Sprite Studio

Repo: github.com/pernellturner/paddy-game. Working copy: /workspace/paddy-game. Paddy Game Studio is the builder: hand finished sheets to me and I wire them in. Don't edit game code or assets/. Pernell approves each batch before it comes to me.

## Reference art
- The true look of Paddy: src/s4.png. Cream face with brown only around the eyes, a white blaze, muzzle, chest and mitts, a fawn body, chocolate ears and tail. NEVER an all-brown face.
- Pernell's original photos and art: references/ (IMG_0596 to IMG_0644).
- Gallery of all 27 forms: /workspace/paddy-gallery/ (01_kitty to 27_fury_god, gallery_all.jpg).
- Concepts:
  - concepts/awakened/: 10 awakened Mythics, including Crimson Blade, plus the new Void Emperor, Thunder Shogun, Celestial Lion Paladin and Abyss Kraken Lord.
  - concepts/ascended/: the 14 second-awakening forms.
  - /workspace/rev22/speedy (speedy forms), /workspace/rev24/fury and /workspace/rev24/fury2 (Golden Fury).
- Raw generated sheets already in the game: generated/ (subfolders per form, e.g. generated/gf2/). Cut frames: assets/p/.

## Sheet spec, so it drops straight in
- Deliver one sheet per move as a .jpg into a new folder, generated/<prefix>/<move>.jpg. For example, generated/vem/idle.jpg for Void Emperor.
- Frames sit in ONE horizontal row, 3-6 poses per move (idle loop, run 6, attacks 4-6, fly 3), evenly spaced with clear gaps. No overlapping, no text, no shadows, no ground line.
- Background: flat magenta #FF00FF. Use green #00FF00 only if the character has magenta or purple in it. The cutter keys out the background.
- Paddy faces RIGHT, full body, the same scale in every frame. Feet sit on the same baseline (except fly).
- Standard move set per form: idle, run, jump, combo_a, combo_b, combo_c, ult (finisher), fly (if it flies), hurt. Each pose must clearly show what the move is.
- Bigger tiers can be drawn bigger. In-game the idle body height is normalised to about 232px, so say if a form should be bigger (e.g. +10%).
- Enemies (birds etc.): the same rules, one folder per enemy: generated/en/<id>/move.jpg (walk/fly loop) and act.jpg (attack), optional hurt.jpg and ko.jpg, facing RIGHT, same scale on every sheet (cut by src/cut_en.py).
- Then send me the paths and a list of prefixes and moves. I cut them with src/cut_*.py into assets/p/<prefix>_<move>_NN.png/.webp, register them in assets/frames.json, and test.
