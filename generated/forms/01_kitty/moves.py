"""Kitty Paddy (form 01) move definitions -> sheets/ (#FF00FF primary) + demos/. Scrappy alley-cat style: paw swats, a low ankle
swipe, a head-bonk, a spinning tail whip, a butt-wiggle pounce, a rear-up double-paw slam, bunny kicks and a dive pounce.
Every frame uses ONE form scale K (idle_a = 340 px = base Paddy idle at TARGET=199). Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT='/workspace/paddy-sprite-studio/forms/01_kitty'
F=Form(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; D=f'{ROOT}/demos'
def fr(p,**k): k['p']=p; return k
R=lambda **k: fr('ready',**k)                 # GROUND NEUTRAL: every ground move starts + ends here
AIR=230
AR=lambda **k: fr('air_ready',a='c',lift=k.pop('lift',AIR),**k)   # AIR NEUTRAL
def hit(p,tip='R',n=2,react='light',sfx='',**k):
    return [fr(p,fx=('hit',i+1,tip),react=react,sfx=(sfx if i==0 else ''),**k) for i in range(n)]
W=lambda p,dx,**k: fr(p,a='c',dx=dx,**k)
MOVES={
# ---- stance / locomotion ------------------------------------------------------------------------------------------------
'idle':   [fr('idle_a'),fr('idle_a',sy=0.988),fr('idle_b',sy=0.99),fr('idle_b',sy=0.98,sx=1.01),fr('idle_b',sy=0.99),fr('idle_a',sy=0.985),fr('idle_a',sy=0.978,sx=1.01),fr('idle_a')],
'ready':  [fr('idle_a'),fr('idle_a',sy=0.96),R(sy=0.93),R(),R(sy=0.985)],
# walk: an all-fours alley-cat strut. Each frame has a DIFFERENT paw in the air: near hind toe-off -> near front lifted ->
# gathered contact -> far hind lifted -> far front lifted -> back to stride contact. (walk_nh/hl/fl = leglift.py edits of walk_1)
'walk':   [W('walk_1',0),W('walk_nh',22,sy=0.99),W('walk_4',30,lift=6),W('land',30,sy=0.97),W('walk_hl',26,lift=2),W('walk_fl',28,lift=6)],
'victory':[R(),fr('idle_b',dx=-6),fr('vic_2',a='c',sy=0.97),fr('vic_2',a='c',sy=1.015),fr('vic_2',a='c'),fr('vic_1',a='c',dx=10),fr('vic_1',a='c',dx=16,sy=1.01),fr('vic_1',a='c',dx=16)],
# ---- 5 light strikes (7 frames, hit-stop = frames 4-5, frame 1 = frame 7 = ready) ----------------------------------------
'light1_swat':   [R(),fr('l1_load',sy=0.94),fr('l1_load',dust=1,dx=12,sx=1.03,fx=('trail','R')),*hit('l1_snap',sfx='hup',dx=22,sx=1.03),fr('l1_snap',dx=18,sy=0.98),R(dx=34)],
'light2_bonk':   [R(),fr('l2_load',sy=1.03,sfx='hup'),fr('l2_load',dust=1,dx=12,sy=0.96,fx=('trail','TR')),*hit('l2_snap',tip='BR',dx=24,sy=0.97),fr('l2_snap',dx=22),R(dx=40)],
'light3_ankleswipe':[R(),fr('l3_load',sy=0.94),fr('l3_load',dust=1,dx=16,sx=1.04,sfx='hup'),*hit('l3_snap',tip='R',dx=30),fr('l3_load',dx=26),R(dx=44)],
'light4_headbonk':[R(),fr('l4_load',sy=0.95),fr('l4_load',dust=1,dx=8,sy=0.92,sfx='hup'),*hit('l4_snap',tip='R',dx=30,sx=1.04),fr('l4_snap',dx=26,sy=0.98),R(dx=46)],
'light5_tailwhip':[R(),fr('l5_load',a='c',sy=0.97),fr('l5_load',a='c',dust=1,dx=10,sfx='hup',fx=('trail','R')),*hit('l5_snap',a='c',tip='R',dx=34),fr('l5_load',a='c',dx=-30),R(a='c',dx=-10)],
# ---- 2 heavy strikes -------------------------------------------------------------------------------------------------------
'heavy1_pounce': [R(),fr('h1_load',sy=0.96),fr('h1_load',dx=-6,sx=1.02),fr('h1_load',sy=0.92,dust=1,sfx='GRUNT'),
                  *hit('h1_imp',a='c',tip='R',lift=60,dx=150,react='heavy'),fr('h1_imp',a='c',lift=34,dx=30),fr('land',a='c',dust=1,dx=10,sy=0.95),R(a='c',dx=-20)],
'heavy2_slam':   [R(),fr('h2_load',sy=0.97),fr('h2_load',sy=1.05,dust=1,sfx='GRUNT'),*hit('h2_imp',tip='R',dx=36,sy=0.97,react='heavy'),fr('h2_imp',dx=36,sy=0.95,dust=1),fr('l3_load',dx=40),R(dx=60)],
# ---- launcher + 3 air strikes (juggle) --------------------------------------------------------------------------------------
'launcher':      [R(),fr('ln_load',sy=0.94),fr('ln_load',sy=0.88,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=60,dx=30,react='launch',contact='R',gap=30),
                  AR(lift=190,dx=6),AR(lift=AIR,dx=4)],
'air1_swat':     [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='R',dx=30,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-10),AR(dx=-6)],
'air2_bunnykick':[AR(),AR(rot=-10,dx=-6),*hit('a2_snap',a='c',tip='R',dx=30,lift=AIR-20,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-14,dx=-14,rot=6),AR(dx=-6)],
'air3_divespike':[AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),*hit('a3_snap',a='c',tip='BR',lift=AIR-60,dx=30,react='spike'),
                  fr('a3_snap',a='c',lift=90,dx=10),fr('land',a='c',dust=1,dx=6,sy=0.94),R(a='c',dx=0)],
# ---- movement / defence -------------------------------------------------------------------------------------------------------
'blink':         [R(),fr('bl_crouch',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=230,ghost=90),fr('bl_dash',a='c',lift=20,dx=230,ghost=90),fr('land',a='c',sy=0.94,dx=40,dust=1),R(a='c',dx=0)],
'blink_air':     [AR(),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90),AR(dx=40)],
'block':         [R(),fr('block',sy=0.97),fr('block',fx=('spark','R')),fr('block',dx=-14,sy=0.97),fr('block',dx=-14),R(dx=-14)],
'dodge':         [R(),R(sy=0.9),fr('dodge_back',a='c',lift=50,dx=-100),fr('land',a='c',dx=-40,dust=1,sy=0.95),R(a='c',dx=0)],
'counter':       [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=12,sfx='hiss'),*hit('cnt_snap',tip='TR',dx=30,react='heavy',sfx='hup'),fr('cnt_snap',dx=26,sy=0.98),R(dx=50)],
# ---- big finisher "Nine Lives" (end of the 8-hit route), 3-frame hit-stop -----------------------------------------------------
'finisher_ninelives':[R(),fr('h1_load',sy=0.9,sfx='HISS'),fr('bl_crouch',dust=1),fr('bl_dash',a='c',lift=18,dx=200,ghost=100),fr('fin_rise',a='c',lift=50,dx=40,dust=1,sfx='BIG GRUNT'),
                  *hit('fin_imp',a='c',tip='TR',n=3,lift=120,dx=30,react='ko'),AR(lift=150,dx=-10),fr('land',a='c',dust=1,dx=0,sy=0.95),fr('fin_pose',a='c'),fr('fin_pose',a='c',sy=0.99),R(a='c')],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S)
