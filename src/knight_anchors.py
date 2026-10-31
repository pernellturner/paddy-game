"""v38 helper (Knight copy of src/ninja_anchors.py) (run once, needs the sprite studio): writes generated/forms/04_knight/anchors.json = for every sheet frame the
body-centre x of the pose image in CELL coords (formkit's cx: mean x of alpha>200 of the pose at K, with that frame's sx/sy/rot),
the foot baseline and the lift. src/cut_ninja.py anchors each game frame there, so root motion follows the body centre and the
shared neutrals (ready / air_ready) sit on exactly the same spot in every sheet (cancels never jump).
The repo copy (generated/forms/04_knight/) keeps moves.py + formkit_ref.py for reference; the cutter itself only needs anchors.json.
Usage: python3 src/ninja_anchors.py [/workspace/paddy-sprite-studio/forms/04_knight]"""
import sys, os, json
ST=sys.argv[1] if len(sys.argv)>1 else '/workspace/paddy-sprite-studio/forms/04_knight'
sys.path.insert(0,ST); sys.path.insert(0,os.path.join(ST,'..','_kit'))
import moves, formkit
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','generated','forms','04_knight','anchors.json')
res={}
for name,frames in moves.MOVES.items():
    fr=formkit.layout(moves.F,frames)
    minX=min(f['X'] for f in fr); above=max(f['foot']+f['lift'] for f in fr); base=formkit.M+int(above)
    res[name]=dict(base=base,K=moves.F.K,frames=[dict(p=f['p'],cx=round(int(f['X']-minX)+f['cx'],1),lift=int(f['lift']),
        foot_y=int(base-f['lift']),root_x=int(f['X']-fr[0]['X'])) for f in fr])
json.dump(res,open(OUT,'w'),indent=1)
print('wrote',OUT,len(res),'sheets, K=%.4f'%moves.F.K)
