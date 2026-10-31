"""Crimson Blade Paddy (form 09) move definitions -> sheets/ (#FF00FF) + sheets_green/ (#00FF00 copy). The drawings are made on green,
so any faint green spill left on an edge would survive a green key on the green copies; Game Studio should use the magenta sheets.
Style: DANTE-LIKE SWAGGER (cocky, stylish, flowing; family friendly). `ready` is a relaxed mid-height side-on stance, the huge crimson
greatsword held ONE-HANDED in the near paw with the blade angled up and forward at the foe, far gloved paw on the hip.
Lights: forehand level slash, rising backhand, boot push-kick (sword held back), pirouette spin cut, two-handed diagonal cleave.
Heavies: "Stinger" rocket-thrust lunge (biggest root motion in the form) and "Crimson Drive" batter-style two-handed cleave.
Launcher "High Time" (one-handed scoop straight up). Air: one-handed slash, spin slash, "Helm Breaker" plunge (spike) + landing.
Blink = low dash with the sword on the shoulder; block = diagonal high guard (blade broadside); dodge = cocky limbo lean back;
counter = one-handed flick parry into a quick straight stab. Finisher "Crimson Showtime": windmill sword twirl (charge), rising
two-handed cut, leap, helm-breaker cleave into the floor (KO), wrist twirl back to guard, cocky taunt pose (beckon + wink).
Compared with Power Blade (08), wind-ups are SHORTER and snappier, follow-throughs flow straight into the next move, and every strike
ends on `recover` (one-handed wrist twirl back into the guard) then `ready`. Minimal kit FX.
ONE form scale K for every frame (idle_a = 340 px = base idle at TARGET=199; idle_a height = ear tip to boot sole, the planted sword's
tip stays above the boot soles). SFX cues on the push-off frame. dx values are first guesses: retune after the first real build
(check checks/strip_*.jpg). Run via ./build.sh."""
import sys, os; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT=os.environ.get('CB_ROOT','/workspace/paddy-sprite-studio/forms/09_crimson_blade')   # CB_ROOT only for dry-runs on stand-in frames
class CBForm(Form):
    """Boot-anchor fix (same idea as 08_power_blade's BODY_ANCHOR; kit untouched). The kit takes the back/front toe as the left/right-most
    pixel in the bottom 28 px of each image and the baseline as the lowest pixel, so the planted sword tip (idle_a/b, land, fin_imp) was
    taken as the front toe and the low tail tip (idle_a/b, vic_1, vic_2, walk_4, l3_snap, l4_load) as the back toe. For EVERY pose
    foot/back/front now come from boot-leather pixels only: dark brown with G 0.42-0.8 of R (excludes the crimson coat, its dark folds and
    the dark-red blade, whose G is under 0.35 R), then, in the bottom 28 px of that mask, connected blobs smaller than 200 px or flat-
    coloured (<450 px and no leather highlights, R std < 8) are dropped as tail fluff. Falls back to the kit when no boot is found (a3_snap).
    Squashed / rotated frames carry the unscaled boot points through the same scale + rotation, so squashes stay planted."""
    BOOT_MIN=150
    def _base(s,p):
        key=(p,1,1,0)
        if key not in s.cache:
            from scipy import ndimage
            g=dict(Form.img(s,p,1,1,0))
            a=np.asarray(g['im']).astype(int); m=g['m']; r,gg,b=a[...,0],a[...,1],a[...,2]
            # boot leather: dark brown, G 0.42-0.8 of R (excludes the crimson coat/shadows and the dark-red blade, whose G is <0.35 R)
            boot=m&(r<130)&(gg>=0.42*r)&(gg<=0.8*r)&(b<=gg+8)&(r>=b)
            if boot.sum()>=s.BOOT_MIN:
                ys,xs=np.where(boot); fy0=int(ys.max())
                band=boot&(np.arange(a.shape[0])[:,None]>fy0-28); lab,n=ndimage.label(band); keep=np.zeros_like(band)
                for i in range(1,n+1):
                    c=lab==i; k=int(c.sum())
                    # tail tip / fluff: small or flat-coloured (no leather highlights) -> not a boot
                    if k<200 or (k<450 and a[c][:,0].std()<8): continue
                    keep|=c
                if keep.sum():
                    yy,_=np.where(keep); fy=int(yy.max()); low=keep&(np.arange(a.shape[0])[:,None]>fy-28); lx=np.where(low)[1]
                    g.update(foot=fy,back=int(lx.min()),front=int(lx.max()),boot=True)
            s.cache[key]=g
        return s.cache[key]
    def img(s,p,sx=1,sy=1,rot=0):
        key=(p,sx,sy,rot)
        if not (rot or sx!=1 or sy!=1): return s._base(p)
        if key not in s.cache:
            import math
            g0=s._base(p); g=dict(Form.img(s,p,sx,sy,rot))
            w0,h0=g0['im'].size
            ws,hs=max(1,round(w0*sx)),max(1,round(h0*sy))
            w1,h1=g['im'].size; t=math.radians(rot)
            def tr(x,y):
                x,y=x*ws/w0,y*hs/h0; dx,dy=x-ws/2,y-hs/2
                return w1/2+dx*math.cos(t)+dy*math.sin(t), h1/2-dx*math.sin(t)+dy*math.cos(t)
            g['back']=int(round(tr(g0['back'],g0['foot'])[0])); g['front']=int(round(tr(g0['front'],g0['foot'])[0]))
            if g0.get('boot'): g['foot']=int(round(tr(g0['back'],g0['foot'])[1]))
            s.cache[key]=g
        return s.cache[key]
F=CBForm(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; G=f'{ROOT}/sheets_green'; D=f'{ROOT}/demos'
def fr(p,**k): k['p']=p; return k
R=lambda **k: fr('ready',**k)
AIR=230
AR=lambda **k: fr('air_ready',a='c',lift=k.pop('lift',AIR),**k)
def hit(p,tip='R',n=2,react='light',sfx='',**k):
    out=[]
    for i in range(n):
        kk=dict(k)
        if i and kk.get('a')=='c': kk['dx']=0
        out.append(fr(p,fx=('hit',i+1,tip),react=react,sfx=(sfx if i==0 else ''),**kk))
    return out
LAND_DX=50; AIR3_REC=-22; BLINK_LAND=470   # blink: final ready planted on land's back boot (world x)
W=lambda p,dx,**k: fr(p,a='c',dx=dx,**k)
REC=lambda dx=0,**k: fr('recover',dx=dx,**k)   # one-handed wrist twirl back into the guard: follow-through of every strike
MOVES={
# idle: easy breath, weight shifting, idle_b content closed-eye smile; sword planted point-down in front, near paw on the pommel
'idle':   [fr('idle_a'),fr('idle_a',sy=0.995),fr('idle_a',sy=0.99),fr('idle_b',sy=0.99),fr('idle_b',sy=0.985),fr('idle_b',sy=0.99),fr('idle_a',sy=0.995),fr('idle_a')],
# idle -> ready: flick the sword up out of the floor with a twirl, settle into the cocky guard
'ready':  [fr('idle_a'),fr('idle_a',sy=0.97),REC(),R(sy=0.97),R()],
# cocky swagger stroll: 4 real drawings, legs clearly alternate (near fwd, far knee up, far fwd, near knee up), small bounce
'walk':   [W('walk_1',0,sy=0.985),W('walk_1',18),W('walk_2',22,lift=8),W('walk_3',22,sy=0.985),W('walk_3',18),W('walk_4',22,lift=8)],
'victory':[R(),REC(),fr('vic_1',a='c'),fr('vic_1',a='c',rot=1,sy=0.99),fr('vic_1',a='c',rot=-1),fr('vic_2',a='c'),fr('vic_2',a='c',sy=0.99),fr('vic_2',a='c')],
# ---- 5 lights (frame 1 = last frame = ready, frame n-1 = recover). Each: quick wind-up (1-2 frames), drive (push-off, dust, cue),
#      2 hit-stop frames, a flowing follow-through frame, recover (twirl), ready ----
'light1_forehandslash':  [R(),fr('l1_load',sy=0.98),fr('l1_load',dust=1,dx=12,sx=1.03,sfx='hup',fx=('trail','R')),
                          *hit('l1_snap',tip='R',dx=36),fr('l1_snap',dx=42,rot=-2),REC(dx=42),R(dx=42)],
'light2_risingslash':    [R(),fr('l2_load',sy=0.97),fr('l2_load',dust=1,dx=10,sx=1.03,sfx='hup',fx=('trail','TR')),
                          *hit('l2_snap',tip='TR',dx=32),fr('l2_snap',dx=38,rot=-2),REC(dx=38),R(dx=38)],
'light3_bootkick':       [R(),fr('l3_load',sy=0.99),fr('l3_load',dx=6,sfx='hup'),*hit('l3_snap',tip='R',dx=18,react='light'),
                          fr('l3_snap',dx=20,rot=2),fr('l3_load',dx=24),REC(dx=24),R(dx=24)],
'light4_spincut':        [R(),fr('l4_load',sy=0.99,rot=2),fr('l4_load',dust=1,dx=8,rot=-2,sfx='hup'),
                          *hit('l4_snap',tip='R',dx=30),fr('l4_snap',dx=36,rot=-2),REC(dx=36),R(dx=36)],
'light5_cleave':         [R(),fr('l5_load',sy=0.98),fr('l5_load',dx=-4,rot=-2),fr('l5_load',dust=1,dx=14,sx=1.03,sfx='hup',fx=('trail','BR')),
                          *hit('l5_snap',tip='BR',dx=40),fr('l5_snap',dx=46,sy=0.98,dust=1),REC(dx=46),R(dx=46)],
# ---- 2 heavies ----
# Stinger: low sprinter crouch (held), explosive push-off (GRUNT), rocket lunge with ghosts, long slide, twirl back up
'heavy1_stinger':        [R(),fr('h1_load',sy=0.98),fr('h1_load',sx=0.97,sy=0.96),fr('h1_load',dust=1,dx=20,sy=0.95,sfx='GRUNT'),
                          fr('h1_imp',dx=95,ghost=55,fx=('trail','R')),*hit('h1_imp',tip='R',dx=160,react='heavy',ghost=40),
                          fr('h1_imp',dx=176,sy=0.98,dust=1),fr('h1_imp',dx=182,sy=0.97),REC(dx=182),R(dx=182)],
# Crimson Drive: batter coil (held), step through, massive two-handed diagonal cleave (3-frame hit-stop), carry, twirl back up
'heavy2_crimsondrive':   [R(),fr('h2_load',sy=0.98),fr('h2_load',sx=0.96,rot=2),fr('h2_load',dust=1,dx=16,sy=0.96,sfx='GRUNT'),
                          *hit('h2_imp',tip='BR',n=3,dx=70,react='heavy',ghost=30),fr('h2_imp',dx=76,sy=0.98,dust=1),REC(dx=76),R(dx=76)],
# ---- launcher "High Time" + air ----
'launcher':              [R(),fr('ln_load',sy=0.98,dx=-10),fr('ln_load',sy=0.94,dx=-10,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=40,dx=10,dust=1,react='launch',contact='R',gap=30),
                          AR(lift=170,dx=4),AR(lift=AIR,dx=2)],
'air1_slash':            [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='BR',dx=20,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-4),AR(dx=-20)],
'air2_spinslash':        [AR(),AR(rot=-8,dx=-6),*hit('a2_snap',a='c',tip='R',dx=26,lift=AIR-10,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-6,dx=-12,rot=6),AR(dx=-6)],
# Helm Breaker: hoist (GRUNT), dive with the blade chopping down (spike), crouched landing with the point in the floor, twirl back up
'air3_helmbreaker':      [AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),fr('a3_wind',a='c',lift=AIR+30,rot=-6),*hit('a3_snap',a='c',tip='BR',lift=AIR-70,dx=24,react='spike'),
                          fr('a3_snap',a='c',lift=110,dx=8),fr('land',a='c',dust=1,dx=LAND_DX,sy=0.94),fr('land',a='c',sy=0.97),REC(dx=AIR3_REC),R(dx=AIR3_REC)],
# ---- movement / defence ----
'blink':                 [R(),fr('bl_push',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=140,ghost=90),fr('bl_dash',a='c',lift=20,dx=150,ghost=90),
                          fr('bl_dash',a='c',lift=16,dx=130,ghost=60),fr('land',a='c',dx=30,dust=1),R(dx=BLINK_LAND)],
'blink_air':             [AR(),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90),fr('bl_dash',a='c',lift=AIR,dx=120,ghost=60),AR(dx=40)],
'block':                 [R(),fr('block',sy=0.97),fr('block',fx=('spark','T')),fr('block',dx=-12,sy=0.97,rot=2),fr('block',dx=-12),R(dx=-12)],
'dodge':                 [R(),R(sy=0.95),fr('dodge_duck',dx=-30,dust=1),fr('dodge_duck',dx=-40,sy=0.98),REC(dx=-44),R(dx=-44)],
'counter':               [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=6,sfx='hiss',fx=('spark','T')),*hit('cnt_snap',tip='R',dx=44,react='heavy',sfx='hup'),
                          fr('cnt_snap',dx=48,sy=0.99),REC(dx=48),R(dx=48)],
# ---- finisher "Crimson Showtime": windmill twirl (charge, HISS), rising two-handed cut (hit), leap (BIG GRUNT), helm-breaker cleave into
#      the floor (3-frame hit-stop, KO), twirl back up, cocky taunt pose (beckon + wink), guard ----
'finisher_showtime':     [R(),fr('fin_coil',sfx='HISS'),fr('fin_coil',rot=-4),fr('fin_coil',rot=4,sy=0.99),*hit('fin_draw',tip='T',dx=14,react='heavy'),
                          fr('a3_wind',a='c',lift=100,dx=40,dust=1,sfx='BIG GRUNT'),*hit('fin_imp',a='c',tip='BR',n=3,dx=60,react='ko'),
                          fr('fin_imp',a='c',sy=0.98,dust=1),REC(dx=96),fr('fin_pose',dx=100),fr('fin_pose',dx=100,sy=0.99),fr('fin_pose',dx=100),R(dx=100)],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S,greendir=G)
