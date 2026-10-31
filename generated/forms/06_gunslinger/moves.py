"""Gunslinger Paddy (form 06) move definitions -> sheets/ (#FF00FF; no green copy: black/maroon/brown/orange, no purple).
Style: cool, low, WIDE-STANCE GUNFIGHTER. `ready` is a planted wide crouch with both revolvers low at the hips, chin down under the
brim. Lights: quick-draw hip shot (wide step, arm snapped out), cross-draw (far gun fired past the face), pistol-whip lean-in,
spur side-kick, coat-swing (the duster whips forward like a sail). Heavies: fan-the-hammer lunge (3 rapid hits) and a knee-slide
with both guns. Every strike ends on `recover` (gun twirled upright on the trigger finger) then `ready`. Blink = low lightning dash,
dodge = duck under the brim, block = coat shield, counter = barrel parry into a gun-butt hook. Finisher "High Noon": showdown stare,
lightning hip draw, leap, X-cross double shot on one knee, then blows the smoke off the barrel.
Unlike Ninja/Kitty/Samurai/Knight/Pirate: still and economical until a sudden explosive step, every hit lands from a WIDE stance,
the off-paw always has a second revolver. Family friendly: no muzzle flashes or bullets drawn, hits are minimal kit FX.
ONE form scale K for every frame (idle_a = 340 px = base idle at TARGET=199). SFX cues on the push-off frame. Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT='/workspace/paddy-sprite-studio/forms/06_gunslinger'
class GSForm(Form):
    """Toe-anchor fix (Gunslinger only, kit untouched). The kit re-finds the back toe as the left-most pixel in the bottom 28 px of each
    TRANSFORMED image. When the sea-legs sway rotates a frame, or an `sy` squash shortens it, the tip of Gunslinger's long low chocolate
    tail drops into that band and is taken for the 'back toe', so the body jumped 35-45 px sideways on those frames (idle, ready,
    walk/strike wobbles). Here the back/front toe of a squashed or rotated frame is the unscaled, unrotated toe point carried through
    the same scale + rotation, so squashes stay planted and rocks pivot about the planted foot."""
    def img(s,p,sx=1,sy=1,rot=0):
        key=(p,sx,sy,rot)
        if (rot or sx!=1 or sy!=1) and key not in s.cache:
            import math
            g0=Form.img(s,p,1,1,0); g=dict(Form.img(s,p,sx,sy,rot))
            w0,h0=g0['im'].size
            ws,hs=max(1,round(w0*sx)),max(1,round(h0*sy))           # size after the scale, before the rotation
            w1,h1=g['im'].size; t=math.radians(rot)
            def tr(x,y):   # scale, then PIL rotate(rot): counter-clockwise about the centre with expand=True
                x,y=x*ws/w0,y*hs/h0; dx,dy=x-ws/2,y-hs/2
                return w1/2+dx*math.cos(t)+dy*math.sin(t), h1/2-dx*math.sin(t)+dy*math.cos(t)
            g['back']=int(round(tr(g0['back'],g0['foot'])[0])); g['front']=int(round(tr(g0['front'],g0['foot'])[0]))
            s.cache[key]=g
        return Form.img(s,p,sx,sy,rot)
F=GSForm(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; D=f'{ROOT}/demos'
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
W=lambda p,dx,**k: fr(p,a='c',dx=dx,**k)
REC=lambda dx=0,**k: fr('recover',dx=dx,**k)   # wrist-twirl flourish back to guard: follow-through of every strike
MOVES={
# still, steely idle: tiny breath only (no deck sway), happy closed-eye blink on idle_b
'idle':   [fr('idle_a'),fr('idle_a',sy=0.995),fr('idle_a',sy=0.99),fr('idle_b',sy=0.99),fr('idle_b',sy=0.985),fr('idle_b',sy=0.99),fr('idle_a',sy=0.995),fr('idle_a')],
'ready':  [fr('idle_a'),fr('idle_a',sy=0.95),R(sy=0.94),R(),R(sy=0.985)],
# bow-legged swagger: 4 real drawings, legs clearly alternate (near fwd, far knee up, far fwd, near knee up)
'walk':   [W('walk_1',0,rot=-1),W('walk_1',22,sy=0.985),W('walk_2',28,lift=6,rot=1),W('walk_3',28,rot=1),W('walk_3',22,sy=0.985),W('walk_4',28,lift=6,rot=-1)],
'victory':[R(),fr('idle_b',dx=-6,sy=0.98),fr('vic_1',a='c'),fr('vic_1',a='c',rot=1.5,sy=0.99),fr('vic_1',a='c',rot=-1.5),fr('vic_2',a='c',dx=6),fr('vic_2',a='c',dx=6,sy=0.99),fr('vic_2',a='c',dx=6)],
# ---- 5 lights (frame 1 = last frame = ready, frame n-1 = recover gun-spin) ----
'light1_quickdraw':  [R(),fr('l1_load',sy=0.97),fr('l1_load',dust=1,dx=12,sx=1.03,sfx='hup'),*hit('l1_snap',tip='R',dx=34),REC(dx=60),R(dx=64)],
'light2_crossdraw':  [R(),fr('l2_load',sy=0.97),fr('l2_load',dust=1,dx=10,sx=1.03,sfx='hup',fx=('trail','TR')),*hit('l2_snap',tip='R',dx=30),REC(dx=40),R(dx=44)],
'light3_pistolwhip': [R(),fr('l3_load',sy=0.99,rot=2),fr('l3_load',dust=1,dx=14,sfx='hup'),*hit('l3_snap',tip='R',dx=36),fr('l3_snap',dx=40,rot=-2),REC(dx=56),R(dx=60)],
'light4_spurkick':   [R(),fr('l4_load',sy=0.99),fr('l4_load',dx=4,rot=3,sfx='hup'),*hit('l4_snap',tip='R',dx=12,gap=10),fr('l4_snap',dx=8,rot=-3),REC(dx=-10),R(dx=-8)],
'light5_coatswing':  [R(),fr('l5_load',rot=2,dx=-6),fr('l5_load',dust=1,dx=16,rot=1,sfx='hup',fx=('trail','R')),*hit('l5_snap',tip='R',dx=24),fr('l5_snap',dx=28,rot=-2),REC(dx=40),R(dx=44)],
# ---- 2 heavies ----
'heavy1_fanhammer':  [R(),fr('h1_load',sy=0.98),fr('h1_load',sx=0.96),fr('h1_load',dust=1,dx=24,sy=0.95,sfx='GRUNT'),
                      *hit('h1_imp',tip='R',dx=90,react='heavy',ghost=40),fr('h1_imp',dx=90,sx=1.02,fx=('hit',1,'R'),react='light'),fr('h1_imp',dx=90,fx=('hit',2,'R'),react='heavy'),
                      fr('h1_imp',dx=92,sy=0.98,dust=1),REC(dx=60),R(dx=64)],
'heavy2_kneeslide':  [R(),fr('h2_load',sy=0.96),fr('h2_load',dx=-8,sx=1.03,dust=1,sfx='GRUNT'),*hit('h2_imp',a='f',tip='R',dx=110,react='heavy',ghost=70),
                      fr('h2_imp',a='f',dx=130,sy=0.98,dust=1),REC(dx=140),R(dx=144)],
# ---- launcher "High Noon uppercut" + air ----
'launcher':          [R(),fr('ln_load',sy=0.97,dx=-40),fr('ln_load',sy=0.9,dx=-40,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=60,dx=70,dust=1,react='launch',contact='R',gap=30),
                      AR(lift=190,dx=6),AR(lift=AIR,dx=4)],
'air1_doubleshot':   [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='BR',dx=30,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-10),AR(dx=-6)],
'air2_heelkick':     [AR(),AR(rot=-8,dx=-6),*hit('a2_snap',a='c',tip='R',dx=26,lift=AIR-10,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-6,dx=-12,rot=6),AR(dx=-6)],
'air3_deadeye':      [AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),fr('a3_wind',a='c',lift=AIR+30,rot=-6),*hit('a3_snap',a='c',tip='BR',lift=AIR-60,dx=30,react='spike'),
                      fr('a3_snap',a='c',lift=90,dx=10),fr('land',a='c',dust=1,dx=6,sy=0.95),REC(a='c'),R(a='c')],
# ---- movement / defence ----
'blink':             [R(),fr('bl_push',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=140,ghost=90),fr('bl_dash',a='c',lift=20,dx=150,ghost=90),
                      fr('bl_dash',a='c',lift=16,dx=130,ghost=60),fr('land',a='c',dx=30,dust=1),R(a='c')],
'blink_air':         [AR(),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90),fr('bl_dash',a='c',lift=AIR,dx=120,ghost=60),AR(dx=40)],
'block':             [R(),fr('block',sy=0.97),fr('block',fx=('spark','R')),fr('block',dx=-12,sy=0.97,rot=2),fr('block',dx=-12),R(dx=-12)],
'dodge':             [R(),R(sy=0.94),fr('dodge_duck',dx=-50,dust=1),fr('dodge_duck',dx=-60,sy=0.98),REC(dx=-80),R(dx=-60)],
'counter':           [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=6,sfx='hiss',fx=('spark','T')),*hit('cnt_snap',tip='R',dx=38,react='heavy',sfx='hup'),REC(dx=62),R(dx=66)],
# ---- finisher "High Noon": showdown stare, lightning hip draw (hit), leap, X-cross double shot on one knee (3-frame hit-stop, KO), blow the smoke ----
'finisher_highnoon': [R(),fr('fin_coil',sfx='HISS'),fr('fin_coil',sy=0.99),*hit('fin_draw',tip='R',dx=10,react='heavy'),fr('a3_wind',a='c',lift=90,dx=40,dust=1,sfx='BIG GRUNT'),
                      *hit('fin_imp',a='c',tip='R',n=3,dx=60,react='ko'),fr('fin_imp',a='c',dx=60,sy=0.98,dust=1),REC(a='c',dx=50),fr('fin_pose',a='c',dx=50),fr('fin_pose',a='c',dx=50,sy=0.99),R(a='c',dx=50)],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S)
