"""Light Paddy (form 07) move definitions -> sheets/ (#FF00FF) + sheets_green/ (#00FF00 copy; the lime blade survives a magenta key,
and the robe has no purple, so both backgrounds are usable).
Style: calm, flowing, graceful LIGHT MONK. `ready` is a balanced mid-height stance, light blade held two-handed at the chest and
angled up and back over the near shoulder. Lights: falling diagonal cut, rising return arc, spin cut, light-palm push, twirl thrust.
Heavies: great spinning arc (2 hits as the blade comes round) and a double light-palm push (blade switched off). Every strike ends on
`recover` (blade twirled in a wheel beside the hip) then `ready`. Blink = low glide, dodge = duck under the blade, block = upright
blade, counter = blade parry into a far-paw palm strike. Finisher "Dawn Bloom": calm salute, blade wheel, leap, one-knee level sweep
(KO), switches the blade off and bows. Palm pushes are just the palm: no projectile, no lightning. Minimal kit FX.
ONE form scale K for every frame (idle_a = 340 px = base idle at TARGET=199). SFX cues on the push-off frame. Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT='/workspace/paddy-sprite-studio/forms/07_light_paddy'
class LPForm(Form):
    """Toe-anchor fix (copied from 06_gunslinger; kit untouched). The kit re-finds the back toe as the left-most pixel in the bottom 28 px of each
    TRANSFORMED image. Light Paddy's big low chocolate tail and the trailing robe hem
    can drop into that band on rotated/squashed frames and be taken for the 'back toe' (06 saw 35-45 px sideways jumps from this). Here the back/front toe of a squashed or rotated frame is the unscaled, unrotated toe point carried through
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
F=LPForm(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; G=f'{ROOT}/sheets_green'; D=f'{ROOT}/demos'
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
REC=lambda dx=0,**k: fr('recover',dx=dx,**k)   # blade-twirl flourish back to guard: follow-through of every strike
MOVES={
# serene idle: slow deep breath, content closed-eye smile on idle_b (no sway)
'idle':   [fr('idle_a'),fr('idle_a',sy=0.995),fr('idle_a',sy=0.99),fr('idle_b',sy=0.99),fr('idle_b',sy=0.985),fr('idle_b',sy=0.99),fr('idle_a',sy=0.995),fr('idle_a')],
'ready':  [fr('idle_a'),fr('idle_a',sy=0.96),R(sy=0.95),R(),R(sy=0.99)],
# calm gliding walk: 4 real drawings, legs clearly alternate (near fwd, far knee up, far fwd, near knee up), small even bob
'walk':   [W('walk_1',0),W('walk_1',22,sy=0.99),W('walk_2',26,lift=4),W('walk_3',26),W('walk_3',22,sy=0.99),W('walk_4',26,lift=4)],
'victory':[R(),fr('idle_b',dx=-6,sy=0.98),fr('vic_1',a='c'),fr('vic_1',a='c',rot=1,sy=0.99),fr('vic_1',a='c',rot=-1),fr('vic_2',a='c',dx=6),fr('vic_2',a='c',dx=6,sy=0.99),fr('vic_2',a='c',dx=6)],
# ---- 5 lights (frame 1 = last frame = ready, frame n-1 = recover blade twirl) ----
'light1_fallingcut': [R(),fr('l1_load',sy=0.97),fr('l1_load',dust=1,dx=12,sx=1.03,sfx='hup',fx=('trail','TR')),*hit('l1_snap',tip='TR',dx=34),REC(dx=60),R(dx=64)],
'light2_risingarc':  [R(),fr('l2_load',sy=0.97),fr('l2_load',dust=1,dx=10,sx=1.03,sfx='hup',fx=('trail','R')),*hit('l2_snap',tip='TR',dx=30),REC(dx=40),R(dx=44)],
'light3_spincut':    [R(),fr('l3_load',sy=0.99,rot=2),fr('l3_load',dust=1,dx=10,rot=-2,sfx='hup'),*hit('l3_snap',tip='R',dx=30),fr('l3_snap',dx=34,rot=-2),REC(dx=50),R(dx=54)],
'light4_palmpush':   [R(),fr('l4_load',sy=0.98),fr('l4_load',dust=1,dx=10,sfx='hup'),*hit('l4_snap',tip='R',dx=34),fr('l4_snap',dx=36,sy=0.99),REC(dx=50),R(dx=54)],
'light5_twirlthrust':[R(),fr('l5_load',dx=-4),fr('l5_load',dust=1,dx=8,rot=2,sfx='hup'),*hit('l5_snap',tip='R',dx=40),fr('l5_snap',dx=44,sy=0.99),REC(dx=56),R(dx=60)],
# ---- 2 heavies ----
'heavy1_spinarc':    [R(),fr('h1_load',sy=0.98),fr('h1_load',sx=0.96,rot=2),fr('h1_load',dust=1,dx=20,sy=0.95,sfx='GRUNT'),
                      *hit('h1_imp',tip='R',dx=80,react='heavy',ghost=40),fr('h1_imp',dx=84,sx=1.02,fx=('hit',1,'R'),react='heavy'),
                      fr('h1_imp',dx=86,sy=0.98,dust=1),REC(dx=90),R(dx=94)],   # back toe keeps moving forward (was 86->60 slide back)
'heavy2_palmpush':   [R(),fr('h2_load',sy=0.96),fr('h2_load',dx=-8,sx=1.03,dust=1,sfx='GRUNT'),*hit('h2_imp',tip='R',dx=70,react='heavy',ghost=50),
                      fr('h2_imp',dx=76,sy=0.98,dust=1),REC(dx=70),R(dx=74)],
# ---- launcher "Rising Light" + air ----
'launcher':          [R(),fr('ln_load',sy=0.97,dx=-40),fr('ln_load',sy=0.9,dx=-40,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=60,dx=70,dust=1,react='launch',contact='R',gap=30),
                      AR(lift=190,dx=6),AR(lift=AIR,dx=4)],
'air1_fallingslash': [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='BR',dx=30,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-10),AR(dx=-6)],
'air2_spinsweep':    [AR(),AR(rot=-8,dx=-6),*hit('a2_snap',a='c',tip='R',dx=26,lift=AIR-10,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-6,dx=-12,rot=6),AR(dx=-6)],
'air3_fallingstar':  [AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),fr('a3_wind',a='c',lift=AIR+30,rot=-6),*hit('a3_snap',a='c',tip='BR',lift=AIR-60,dx=30,react='spike'),
                      fr('a3_snap',a='c',lift=90,dx=10),fr('land',a='c',dust=1,dx=6,sy=0.95),REC(a='c'),R(a='c')],
# ---- movement / defence ----
'blink':             [R(),fr('bl_push',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=140,ghost=90),fr('bl_dash',a='c',lift=20,dx=150,ghost=90),
                      fr('bl_dash',a='c',lift=16,dx=130,ghost=60),fr('land',a='c',dx=30,dust=1),R(a='c')],
'blink_air':         [AR(),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90),fr('bl_dash',a='c',lift=AIR,dx=120,ghost=60),AR(dx=40)],
'block':             [R(),fr('block',sy=0.97),fr('block',fx=('spark','R')),fr('block',dx=-12,sy=0.97,rot=2),fr('block',dx=-12),R(dx=-12)],
'dodge':             [R(),R(sy=0.94),fr('dodge_duck',dx=-50,dust=1),fr('dodge_duck',dx=-60,sy=0.98),REC(dx=-64),R(dx=-64)],   # was -60,-80,-60 back-foot jitter
'counter':           [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=6,sfx='hiss',fx=('spark','T')),*hit('cnt_snap',tip='R',dx=38,react='heavy',sfx='hup'),REC(dx=62),R(dx=66)],
# ---- finisher "Dawn Bloom": calm salute, blade wheel (hit), leap, one-knee level sweep (3-frame hit-stop, KO), blade off + bow ----
'finisher_dawnbloom':[R(),fr('fin_coil',sfx='HISS'),fr('fin_coil',sy=0.99),*hit('fin_draw',tip='R',dx=10,react='heavy'),fr('a3_wind',a='c',lift=90,dx=40,dust=1,sfx='BIG GRUNT'),
                      *hit('fin_imp',a='c',tip='R',n=3,dx=60,react='ko'),fr('fin_imp',a='c',sy=0.98,dust=1),REC(dx=96),fr('fin_pose',dx=100),fr('fin_pose',dx=100,sy=0.99),R(dx=104)],   # after the landing: back toe planted at ~91 and creeping forward (was +50 px/frame a='c' drift)
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S,greendir=G)
