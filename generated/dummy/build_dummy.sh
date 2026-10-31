#!/bin/bash
# Sparring dummy (TEST, not approved). Rebuilds every sheet/GIF + the demos from raw/ (no image generation, no game files touched,
# does NOT run build_power6.sh / build_power7.sh; reads tests/paddy_fluid/power_jab.jpg read-only).
# Order matters: rig.py rewrites sheets_meta.json; rig_fighter.py and make_mirrors.py add their entries to it.
set -e; cd "$(dirname "$0")"
python3 rig.py            # base sheets + launched_fall
python3 rig_fighter.py    # ATTACKER variant: fighter_* sheets + fighter_attack_demo.gif
python3 make_mirrors.py   # facing-RIGHT copies of the base sheets (*_R)
python3 make_demo.py
for m in idle hit_light hit_heavy launched launched_fall knockdown recover \
         idle_R hit_light_R hit_heavy_R launched_R launched_fall_R knockdown_R recover_R \
         fighter_idle fighter_attack_windup fighter_attack_punch fighter_attack_recover fighter_hit_heavy; do
  python3 ../../flatten_bg.py $m.jpg /tmp/_dummy_chk_$m.jpg; done
