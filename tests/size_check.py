"""Size-consistency check (Pernell's standing rule, v34).
Within each form every animation must be drawn at the same scale as that form's idle (no size pops between moves);
base + normal forms must match base idle; Legendary / Awakened (god) forms may be bigger by ONE fixed per-form factor.
How: the game's FR table (anim -> frames) is dumped from a running page; for every frame the body size is
sqrt(area of solid pixels, alpha>=200) - pose-independent enough to compare a crouch with a stand, unlike bbox height.
Per anim: median over its frames. Flags: anim median vs its form's idle median off by more than TOL (default 4%),
and a normal form's idle vs base idle off by more than TOL. FX-heavy frames (trails/flashes baked in) can raise a false
flag; the report lists the numbers so a human can tell. Usage: python3 tests/size_check.py [URL] [OUT] [TOL]
Writes OUT/size_report.txt; exit code 1 if anything is flagged."""
import asyncio,time,json,sys,os,statistics as st
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
OUT=sys.argv[2] if len(sys.argv)>2 else '/workspace/rev34/';TOL=float(sys.argv[3]) if len(sys.argv)>3 else .04
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
async def dump():
 async with async_playwright() as pw:
  br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  pg=await br.new_page();await pg.goto(URL+'?nostory&v='+str(time.time()));await pg.wait_for_function('typeof started!=="undefined"&&started',timeout=30000);await pg.wait_for_timeout(2500)
  d=await pg.evaluate("({UF:UF.map(u=>u&&{pre:u.pre,nm:u.nm,legend:!!u.legend,god:!!u.god}),FR:Object.fromEntries(Object.keys(FR).map(k=>[k,(FR[k]||[]).map(f=>f.f)]))})")
  await br.close();return d
D=asyncio.run(dump())
# the Practice Room dummy draws straight from frames.json (sd_* sheets), not through FR
for k,v in json.load(open(os.path.join(ROOT,'assets/frames.json'))).items():
  if k.startswith('sd_'): D['FR'][k]=[f['f'] for f in v]
forms=[('base','',0),('NINJA','n_',0),('SAMURAI','s_',0),('KNIGHT','kn_',0),('PIRATE','pi_',0)]+[(u['nm'],u['pre']+'_',1 if (u['legend'] or u['god']) else 0) for u in D['UF'] if u]+[('SPARRING DUMMY','sd_',2)]
NOT=('r_','en_')
cache={}
def size(f):
  if f not in cache:
    p=os.path.join(ROOT,'assets',f+'.png')
    if not os.path.exists(p): cache[f]=None
    else: a=np.asarray(Image.open(p).convert('RGBA'))[...,3]; cache[f]=float(np.sqrt((a>=200).sum()))
  return cache[f]
def owner(k):
  if k.startswith(NOT): return None
  if k.startswith(('nj_','nk_','nx_')): return 'NINJA'   # v35: Ninja Paddy's own anims + the old route anims remapped onto its frames
  best=None
  for nm,pre,_ in forms[1:]:
    if k.startswith(pre) and (best is None or len(pre)>len(best[1])): best=(nm,pre)
  return best[0] if best else 'base'
groups={}
for k,fl in D['FR'].items():
  o=owner(k)
  if o is None or not fl: continue
  v=[s for s in (size(f) for f in fl) if s]
  if v: groups.setdefault(o,{})[k]=(st.median(v),len(v),fl[0])
lines=[];flags=[]
idle_of=lambda nm,pre: groups.get(nm,{}).get(pre+'idle')
b=idle_of('base','')
lines.append(f'size check  tol {TOL:.0%}  (body size = sqrt(solid px); ratio vs the form\'s own idle)')
for nm,pre,big in forms:
  g=groups.get(nm);i=idle_of(nm,pre)
  if not g or not i: lines.append(f'\n== {nm}: no idle anim found ({len(g or {})} anims) - skipped');continue
  rf=i[0]/b[0]
  tag='prop (not a form)' if big==2 else 'LEGEND/AWAKENED (own fixed scale)' if big else ('form idle vs base idle %.2f'%rf)
  if not big and nm!='base' and abs(rf-1)>TOL: flags.append(f'{nm}: idle is {rf:.2f}x base idle')
  lines.append(f'\n== {nm}  [{tag}]  idle {i[0]:.0f}')
  for k,(m,n,f0) in sorted(g.items(),key=lambda x:x[1][0]/i[0]):
    r=m/i[0];bad=abs(r-1)>TOL
    if bad: flags.append(f'{nm}: {k} {r:.2f}x idle ({n} frames, e.g. {f0})')
    lines.append(f'  {"!!" if bad else "  "} {k:<22} {r:5.2f}  n={n}')
lines.insert(1,f'FLAGGED {len(flags)} (anims off their form idle by >{TOL:.0%}, or normal-form idle off base idle)')
os.makedirs(OUT,exist_ok=True);open(os.path.join(OUT,'size_report.txt'),'w').write('\n'.join(lines+['','FLAGS:']+flags)+'\n')
print('\n'.join(lines[:2]));print('per form flagged:',{nm:sum(1 for f in flags if f.startswith(nm+':')) for nm,_,_ in forms})
sys.exit(1 if flags else 0)
