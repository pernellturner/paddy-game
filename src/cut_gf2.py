"""v26 Golden Fury (saiyan-style suit) sheets: generated/gf2/*.jpg -> assets/p/<pre>_<sheet>_NN.png/.webp + frames.json.
Sets (each body ~+8% bigger per level): gf (Fury 1: idle run combo_a combo_b combo_c ult fly) · gf2/gf3/gf4/gfg (idle combo fly).
Fury 4 sheets are on green, the rest on magenta. Usage: python3 src/cut_gf2.py"""
import os,json,glob
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
src=open('src/cut_mf.py').read().split("FORMS=['mst'")[0];ns={'__file__':os.path.abspath('src/cut_mf.py')};exec(src,ns)
parts_of=ns['parts_of'];np=ns['np'];Image=ns['Image'];ImageFilter=ns['ImageFilter']
H=232
SETS={'gf':({s:s for s in 'idle run combo_a combo_b combo_c ult fly'.split()},1.0,None),
      'gf2':({'idle':'l2_idle','combo':'l2_combo','fly':'l2_fly'},1.08,[0,1,2]),
      'gf3':({'idle':'l3_idle','combo':'l3_combo','fly':'l3_fly'},1.16,[0,1,2]),
      'gf4':({'idle':'l4_idle','combo':'l4_combo','fly':'l4_fly'},1.25,[0,1,2]),
      'gfg':({'idle':'l5_idle','combo':'l5_combo','fly':'l5_fly'},1.35,[0,1,2])}
frames=json.load(open('assets/frames.json'))
for k in [k for k in frames if k.split('_')[0] in ('gf','gf2','gf3','gf4','gfg')]:del frames[k]
for f in glob.glob('assets/p/gf*_*'):
    if os.path.basename(f).split('_')[0] in ('gf','gf2','gf3','gf4','gfg'):os.remove(f)
def bgcol(path):
    im=np.asarray(Image.open(path).convert('RGB')).astype(float);e=np.concatenate([im[:8].reshape(-1,3),im[-8:].reshape(-1,3)]);return np.median(e,0)
for pre,(sheets,fix,ref) in SETS.items():
    idle=parts_of(f'generated/gf2/{sheets["idle"]}.jpg');hs=[p[3]-p[2] for p in idle];hs=[hs[i] for i in ref] if ref else hs
    sc=H/np.median(hs)*fix
    for sh,fn0 in sheets.items():
        path=f'generated/gf2/{fn0}.jpg';bg=bgcol(path);green=bg[1]>bg[0]+40
        parts=parts_of(path,2 if sh=='run' else 3);name=f'{pre}_{sh}'
        ground=int(np.median([p[3] for p in parts]));frames[name]=[]
        for kk,(x0,x1,y0,y1,m,c) in enumerate(parts):
            a=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8))
            c=c.copy();edge=np.asarray(a)<250
            if green:
                spill=c[...,1]-np.maximum(c[...,0],c[...,2]);fx=edge&(spill>10);c[fx,1]-=spill[fx]*.8
            else:
                spill=np.minimum(c[...,0],c[...,2])-c[...,1];fx=edge&(spill>15);c[fx,0]-=spill[fx]*.7;c[fx,2]-=spill[fx]*.7
            rgba=Image.fromarray(np.clip(c,0,255).astype(np.uint8)).convert('RGBA');rgba.putalpha(a)
            W,Hh=max(1,round(rgba.width*sc)),max(1,round(rgba.height*sc));rgba=rgba.resize((W,Hh),Image.LANCZOS)
            mm=m[int(m.shape[0]*.35):];xs=np.nonzero(mm)[1];ax=float(np.median(xs))*sc if len(xs) else W/2
            if sh=='fly':ax=float(np.median(np.nonzero(m)[1]))*sc
            rows=np.nonzero((np.asarray(rgba)[...,3]>128).sum(1)>2)[0];low=(rows.max()+1) if len(rows) else Hh
            if sh=='fly':ay=Hh*.5+60          # flight frames hang around the body centre (p.y is ~60px under it)
            elif pre=='gfg':ay=low-20          # the God floats: wispy tail below the ground line
            else:ay=low+3 if (ground-y1)*sc<=15 else (ground-y0)*sc+3
            f=f'p/{name}_{kk:02d}';rgba.save(f'assets/{f}.png',optimize=True);rgba.save(f'assets/{f}.webp',quality=88,method=6)
            frames[name].append(dict(f=f,ax=round(ax),ay=round(ay),w=W,h=Hh))
        print(name,len(parts),'green' if green else '','scale %.3f'%sc,[(f['w'],f['h']) for f in frames[name]])
json.dump(frames,open('assets/frames.json','w'),separators=(',',':'))
