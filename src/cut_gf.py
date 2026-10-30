"""Cut the Golden Fury Paddy sheets (generated/gf/*.jpg, six poses each on magenta) into assets/p/<pre>_<sheet>_NN.png/.webp and merge into frames.json.
Sets: gf (Fury 1 base: idle run jump combo_a combo_b combo_c special ult) · gf3 (l3_idle l3_combo) · gf4 (l4_idle l4_combo) · gfg (l5_idle l5_combo).  Usage: python3 src/cut_gf.py"""
import os,json
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
src=open('src/cut_mf.py').read().split("FORMS=['mst'")[0];ns={'__file__':os.path.abspath('src/cut_mf.py')};exec(src,ns)
parts_of=ns['parts_of'];np=ns['np'];Image=ns['Image'];ImageFilter=ns['ImageFilter']
H=232;AIR={'jump','ult','idle_g','combo_g'}
SETS={'gf':({s:s for s in 'idle run jump combo_a combo_b combo_c special ult'.split()},1.0),
      'gf3':({'idle':'l3_idle','combo':'l3_combo'},1.04),'gf4':({'idle':'l4_idle','combo':'l4_combo'},1.06),'gfg':({'idle':'l5_idle','combo':'l5_combo'},1.22)}
frames=json.load(open('assets/frames.json'))
for pre,(sheets,fix) in SETS.items():
    idle=parts_of(f'generated/gf/{sheets["idle"]}.jpg');sc=H/np.median([p[3]-p[2] for p in idle])*fix
    for sh,fn0 in sheets.items():
        parts=parts_of(f'generated/gf/{fn0}.jpg',2 if sh=='run' else 3);name=f'{pre}_{sh}'
        ground=int(np.median([p[3] for p in parts]));frames[name]=[];air=sh in AIR or pre=='gfg'
        for kk,(x0,x1,y0,y1,m,c) in enumerate(parts):
            a=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
            c=c.copy();edge=np.asarray(a)<250;spill=np.minimum(c[...,0],c[...,2])-c[...,1];fix_=edge&(spill>15)
            c[fix_,0]-=spill[fix_]*.7;c[fix_,2]-=spill[fix_]*.7
            rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA');rgba.putalpha(a)
            W,Hh=max(1,round(rgba.width*sc)),max(1,round(rgba.height*sc));rgba=rgba.resize((W,Hh),Image.LANCZOS)
            mm=m[int(m.shape[0]*.35):];xs=np.nonzero(mm)[1];ax=float(np.median(xs))*sc if len(xs) else W/2
            rows=np.nonzero((np.asarray(rgba)[...,3]>128).sum(1)>2)[0];low=(rows.max()+1) if len(rows) else Hh
            ay=low+3 if (air or (ground-y1)*sc<=15) else (ground-y0)*sc+3
            if pre=='gfg':ay=low-20   # the God floats: his wispy tail hangs below the ground line
            f=f'p/{name}_{kk:02d}';rgba.save(f'assets/{f}.png',optimize=True);rgba.save(f'assets/{f}.webp',quality=88,method=6)
            frames[name].append(dict(f=f,ax=round(ax),ay=round(ay),w=W,h=Hh))
        print(name,len(parts),'scale %.3f'%sc,[(f['w'],f['h']) for f in frames[name]])
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
