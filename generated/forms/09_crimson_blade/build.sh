#!/bin/bash
# Rebuild every Crimson Blade Paddy output from raw/*.jpg. Touches ONLY this folder (never game code, never /workspace/paddy-game/assets/).
# Same pipeline as forms/08_power_blade/build.sh; 4 real walk drawings, no walklegs needed.
# Drawings are on GREEN (~#4AB845, the form has no green); _kit/key.py auto-detects green vs magenta.
# Refuses to run until every drawing in raw/DRAW_LIST.md exists (38 guided poses from poses.json + idle_a, idle_b, vic_1, vic_2 = 42).
set -e
cd "$(dirname "$0")"; KIT=../_kit
miss=0
for p in $(python3 -c "import json;print(' '.join(list(json.load(open('poses.json')))+['idle_a','idle_b','vic_1','vic_2']))"); do
  [ -f raw/$p.jpg ] || { echo "missing drawing raw/$p.jpg (see raw/DRAW_LIST.md)"; miss=1; }
done
[ $miss = 0 ] || { echo "build.sh: not all 42 drawings exist yet; nothing built"; exit 1; }
mkdir -p frames sheets sheets_green demos checks
python3 rawfix.py          # raw/clean/<pose>.jpg: removes drawn ground lines listed in GROUND_LINE before keying
for f in raw/*.jpg; do n=$(basename "$f" .jpg); [ "$n" = master_design ] && continue; [ -f raw/clean/$n.jpg ] && f=raw/clean/$n.jpg; python3 $KIT/key.py "$f" frames/$n.png; done   # green key -> RGBA
K=$(python3 -c "import sys;sys.path.insert(0,'$KIT');from formkit import Form;print(round(Form('.').K,4))")
python3 moves.py            # sheets/ (#FF00FF) .jpg + .gif + _roots.txt per move, plus sheets_green/ (#00FF00) .jpg copy
python3 demos.py            # demos/ string GIFs, plain + vs sparring dummy
python3 $KIT/check.py . $K checks/final_face_check.jpg            # every frame at the one form scale beside s4 + 09_crimson_blade ref
for g in demos/vsdummy_*.gif; do python3 $KIT/strip.py $g checks/strip_$(basename $g .gif).jpg 8 300; done
python3 $KIT/strip.py sheets/walk.gif checks/strip_walk.jpg 6 400
python3 contacts.py         # checks/all_frames_one_scale.jpg + checks/sheets_a/b/c.jpg
echo "done (K=$K)"
