"""Knight Paddy (form 04) move definitions -> sheets/ (#FF00FF; green copy only if the form has purple, Knight is silver/blue/gold).
Style: heavy, armoured sword-and-shield. The neutral `ready` is a planted, square guard: shield up in front on the near arm, sword
cocked over the rear shoulder. Lights alternate shield and blade (bash, thrust, forehand cut, shield uppercut, low cut); heavies are a
committed two-hand overhead cleave and a full-body shield charge. Every strike ends on `recover` (shield pulled back to guard) then
`ready`. Unlike Ninja (darting), Kitty (swats/pounces) and Samurai (iaido draw-cuts): no hops, no sheathing, the shield is always
part of the move. ONE form scale K for every frame (idle_a = 340 px = base idle at TARGET=199). SFX cues on the push-off frame.
Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT='/workspace/paddy-sprite-studio/forms/04_knight'
F=Form(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; D=f'{ROOT}/demos'
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
REC=lambda dx=0,**k: fr('recover',dx=dx,**k)   # shield back to guard: follow-through of every strike
MOVES={
'idle':   [fr('idle_a'),fr('idle_a',sy=0.99),fr('idle_a',sy=0.982,sx=1.01),fr('idle_b',sy=0.98),fr('idle_b',sy=0.972,sx=1.01),fr('idle_b',sy=0.98),fr('idle_a',sy=0.988),fr('idle_a')],
'ready':  [fr('idle_a'),fr('idle_a',sy=0.95),R(sy=0.94),R(),R(sy=0.985)],
'walk':   [W('walk_a',0),W('walk_a',22,sy=0.985),W('walk_b',28,lift=5),W('walk_c',28),W('walk_c',22,sy=0.985),W('walk_d',28,lift=5)],
'victory':[R(),fr('idle_b',dx=-6,sy=0.98),fr('vic_1',a='c'),fr('vic_1',a='c',sy=0.985),fr('vic_1',a='c'),fr('vic_2',a='c',dx=6),fr('vic_2',a='c',dx=6,sy=1.01),fr('vic_2',a='c',dx=6)],
# ---- 5 lights (7 frames, hit-stop 4-5, frame 1 = frame 7 = ready) ----
'light1_shieldjab':  [R(),fr('l1_load',sy=0.96),fr('l1_load',dust=1,dx=12,sx=1.03,sfx='hup'),*hit('l1_snap',dx=26),REC(dx=30),R(dx=34)],
'light2_thrust':     [R(),fr('l2_load',sy=0.96),fr('l2_load',dust=1,dx=10,sx=1.03,sfx='hup',fx=('trail','R')),*hit('l2_snap',dx=30),REC(dx=34),R(dx=38)],
'light3_forehand':   [R(),fr('l3_load',sy=0.97),fr('l3_load',dust=1,dx=12,sx=1.03,sfx='hup'),*hit('l3_snap',dx=28),REC(dx=32),R(dx=36)],
'light4_shieldupper':[R(),fr('l4_load',sy=0.96),fr('l4_load',dust=1,dx=8,sy=0.93,sfx='hup',fx=('trail','TR')),*hit('l4_snap',tip='TR',dx=22,gap=60),REC(dx=26),R(dx=30)],
'light5_lowcut':     [R(),fr('l5_load',sy=0.96),fr('l5_load',dust=1,dx=14,sx=1.04,sfx='hup'),*hit('l5_snap',tip='BR',dx=34),REC(dx=40),R(dx=44)],
# ---- 2 heavies ----
'heavy1_overhead':   [R(),fr('h1_load',sy=1.02),fr('h1_load',sy=1.0),fr('h1_load',dust=1,dx=10,sy=0.95,sfx='GRUNT',fx=('trail','TR')),
                      *hit('h1_imp',tip='BR',dx=46,react='heavy'),fr('h1_imp',dx=46,sy=0.98,dust=1),REC(dx=50),R(dx=56)],
'heavy2_shieldcharge':[R(),fr('h2_load',sy=0.96),fr('h2_load',dx=-8,sx=1.03,dust=1,sfx='GRUNT'),*hit('h2_imp',tip='R',dx=90,react='heavy',ghost=60),
                      fr('h2_imp',dx=96,sy=0.98,dust=1),REC(dx=100),R(dx=104)],
# ---- launcher + air ----
'launcher':          [R(),fr('ln_load',sy=0.95),fr('ln_load',sy=0.88,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=60,dx=90,dust=1,react='launch',contact='R',gap=30),
                      AR(lift=190,dx=6),AR(lift=AIR,dx=4)],
'air1_slash':        [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='R',dx=30,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-10),AR(dx=-6)],
'air2_shieldbash':   [AR(),AR(rot=-6,dx=-6),*hit('a2_snap',a='c',tip='R',dx=28,lift=AIR-10,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-6,dx=-12),AR(dx=-6)],
'air3_plunge':       [AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),*hit('a3_snap',a='c',tip='BR',lift=AIR-60,dx=30,react='spike'),
                      fr('a3_snap',a='c',lift=90,dx=10),fr('land',a='c',dust=1,dx=6,sy=0.95),REC(a='c'),R(a='c')],
# ---- movement / defence ----
'blink':             [R(),fr('h2_load',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=240,ghost=90),fr('bl_dash',a='c',lift=20,dx=240,ghost=90),R(a='c',sy=0.94,dx=40,dust=1),R(a='c')],
'blink_air':         [AR(),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90),AR(dx=40)],
'block':             [R(),fr('block',sy=0.97),fr('block',fx=('spark','R')),fr('block',dx=-12,sy=0.97),fr('block',dx=-12),R(dx=-12)],
'dodge':             [R(),R(sy=0.92),fr('dodge_back',a='c',lift=30,dx=-100),fr('block',a='c',dx=-30,dust=1,sy=0.97),R(a='c')],
'counter':           [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=6,sfx='hiss'),*hit('cnt_snap',tip='R',dx=34,react='heavy',sfx='hup'),REC(dx=38),R(dx=44)],
# ---- finisher "Bastion": raise, shield charge, leap, two-hand ground smash (3-frame hit-stop), plant the sword, salute ----
'finisher_bastion':  [R(),fr('fin_coil',sfx='HISS'),fr('fin_coil',sy=0.97),fr('h2_imp',dx=150,ghost=100),fr('a3_wind',a='c',lift=90,dx=30,dust=1,sfx='BIG GRUNT'),
                      *hit('fin_imp',a='c',tip='BR',n=3,dx=40,react='ko'),fr('fin_imp',a='c',sy=0.98,dust=1),REC(a='c',dx=-10),fr('fin_pose',a='c'),fr('fin_pose',a='c',sy=0.99),R(a='c')],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S)
