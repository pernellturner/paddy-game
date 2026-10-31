#!/bin/bash
# Rebuild every Ninja Paddy output from raw/*.jpg. Touches ONLY this folder (never game code, never /workspace/paddy-game/assets/,
# never build_power6.sh / build_power7.sh). Reuse for another form: copy moves.py/demos.py/poses.json, change FORM below.
set -e
cd "$(dirname "$0")"; KIT=../_kit; K=0.4298
mkdir -p frames
for f in raw/*.jpg; do n=$(basename "$f" .jpg); [ "$n" = master_design ] && continue; python3 $KIT/key.py "$f" frames/$n.png; done   # green-screen key -> RGBA
python3 moves.py            # sheets/ (#FF00FF) + sheets_green/ (#00FF00) + .gif + _roots.txt per move
python3 demos.py            # demos/ string GIFs, plain + vs sparring dummy
python3 $KIT/check.py . $K checks/final_face_check.jpg            # every frame at the one form scale beside s4 + 02_ninja refs
for g in demos/vsdummy_juggle demos/vsdummy_8hit_finisher; do python3 $KIT/strip.py $g.gif checks/strip_$(basename $g).jpg 8 300; done
echo done
