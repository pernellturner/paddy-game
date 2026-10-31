"""Ninja Paddy (form 02) move definitions -> sheets/ (#FF00FF), sheets_green/ (#00FF00 copies, spec rule for purple forms), demos/.
Every frame uses ONE form scale (idle = 340 px = base Paddy idle at TARGET=199). Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
F=Form('/workspace/paddy-sprite-studio/forms/02_ninja', idle='idle_a')
S='/workspace/paddy-sprite-studio/forms/02_ninja/sheets'; G='/workspace/paddy-sprite-studio/forms/02_ninja/sheets_green'; D='/workspace/paddy-sprite-studio/forms/02_ninja/demos'
def fr(p,**k): k['p']=p; return k
R=lambda **k: fr('ready',**k)                 # GROUND NEUTRAL: every ground move starts + ends here
AIR=230                                       # air neutral height (px above the baseline)
AR=lambda **k: fr('air_ready',a='c',lift=k.pop('lift',AIR),**k)   # AIR NEUTRAL: every air strike starts + ends here
def hit(p,tip='R',n=2,react='light',sfx='',**k):
    """hit-stop frames: n copies of the impact pose (2 normal, 3 finisher), burst grows / trail fades; react = dummy reaction."""
    return [fr(p,fx=('hit',i+1,tip),react=react,sfx=(sfx if i==0 else ''),**k) for i in range(n)]
MOVES={
# ---- stance / locomotion -----------------------------------------------------------------------------------------------
'idle':   [fr('idle_a'),fr('idle_a',sy=0.988),fr('idle_a',sy=0.978,sx=1.01),fr('idle_a',sy=0.978,sx=1.01),fr('idle_a',sy=0.988),fr('idle_a')],
'ready':  [fr('idle_a'),fr('idle_b',sy=0.97),R(sy=0.94),R(),R(sy=0.985)],
'walk':   [fr('walk_1',a='c'),fr('walk_2',a='c',dx=34,sy=0.97),fr('walk_4',a='c',dx=40,lift=22),fr('walk_3',a='c',dx=34),fr('walk_2',a='c',dx=30,sy=0.96),fr('walk_4',a='c',dx=40,lift=14)],
'victory':[R(),fr('idle_a',dx=-10),fr('vic_1',a='c'),fr('vic_1',a='c',sy=1.015),fr('vic_2',a='c'),fr('vic_2',a='c',sy=1.01)],
# ---- 5 light strikes (7 frames, hit-stop = frames 4-5, frame 1 = frame 7 = ready) ---------------------------------------
'light1_palm':  [R(),fr('l1_load',sy=0.95),fr('l1_half',dust=1,dx=8,fx=('trail','R')),*hit('l1_snap',sfx='hup',dx=14,sx=1.03),fr('l1_half',dx=10),R(dx=30)],
'light2_chop':  [R(),fr('l2_load',sy=0.97,sfx='hup'),fr('l2_half',dust=1,dx=10,fx=('trail','TR')),*hit('l2_snap',tip='R',dx=18,sx=1.03),fr('l1_half',dx=14),R(dx=36)],
'light3_snapkick':[R(),R(sy=0.92),fr('l3_load',a='c',dust=1),*hit('l3_snap',a='c',tip='R',dx=10,sfx='hup'),fr('l3_load',a='c',dx=-6),R(dx=22)],
'light4_elbow': [R(),fr('l4_load',sy=0.9),fr('l4_load',dust=1,dx=10,sy=0.97,sfx='hup'),*hit('l4_snap',tip='TR',dx=16,sy=1.05),fr('l1_half',dx=14),R(dx=34)],
'light5_twinpalm':[R(),fr('l5_load',sy=0.95),fr('l5_half',dust=1,dx=16,fx=('trail','R'),sfx='hup'),*hit('l5_snap',dx=26,sx=1.04),fr('l5_half',dx=24),R(dx=48)],
# ---- 2 heavy strikes ------------------------------------------------------------------------------------------------------
'heavy1_sweep': [R(),fr('bl_crouch',sy=0.94),fr('ln_load',dust=1,dx=10,sfx='GRUNT'),*hit('h1_imp',tip='R',dx=28,react='heavy'),fr('h1_imp',dx=28),fr('ln_load',dx=34),R(dx=60)],
'heavy2_flyknee':[R(),fr('ln_load',sy=0.95),fr('h2_drive',a='c',dust=1,lift=30,dx=30,sfx='GRUNT'),*hit('h2_imp',a='c',tip='R',lift=90,dx=40,react='heavy'),fr('walk_4',a='c',lift=40,dx=20),fr('land',a='c',dx=10,dust=1),R(dx=150)],
# ---- launcher + 3 air strikes (juggle) -------------------------------------------------------------------------------------
'launcher':     [R(),fr('ln_load',sy=0.92),fr('ln_imp',a='c',lift=30,dust=1,dx=20,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=90,dx=6,react='launch',contact='R',gap=30),
                 AR(lift=190,dx=6),AR(lift=AIR,dx=4)],
'air1_palm':    [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='R',dx=30,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-10),AR(dx=-6)],
'air2_sidekick':[AR(),fr('h2_imp',a='c',lift=AIR,dx=-6),*hit('a2_snap',a='c',tip='TR',dx=24,lift=AIR,sfx='hup',react='air'),fr('h2_imp',a='c',lift=AIR+6,dx=-14),AR(dx=-6)],
'air3_axespike':[AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),*hit('a3_snap',a='c',tip='BR',rot=-28,lift=AIR,dx=20,react='spike'),
                 AR(lift=130,dx=6),fr('land',a='c',dust=1,dx=6),R(a='c',rel='lastb',dx=0)],
# ---- movement / defence -----------------------------------------------------------------------------------------------------
'blink':        [R(),fr('bl_crouch',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=18,dx=230,ghost=90),fr('bl_dash',a='c',lift=18,dx=230,ghost=90),fr('ready',a='c',sy=0.93,dx=60,dust=1),R(a='c',dx=0)],
'blink_air':    [AR(),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90),AR(dx=40)],
'block':        [R(),fr('block',sy=0.97),fr('block',fx=('spark','R')),fr('block',dx=-14,sy=0.97),fr('block',dx=-14),R(dx=-14)],
'dodge':        [R(),R(sy=0.9),fr('dodge_back',a='c',lift=40,dx=-90),fr('land',a='c',dx=-50,dust=1),R(a='c',dx=0)],
'counter':      [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=12,sfx='hiss'),*hit('cnt_snap',tip='R',dx=30,react='heavy',sfx='hup'),fr('l1_half',dx=26),R(dx=50)],
# ---- big finisher (end of the 8-hit route), 3-frame hit-stop --------------------------------------------------------------
'finisher_crescent':[R(),fr('fin_coil',sy=0.93,sfx='HISS'),fr('bl_crouch',dust=1),fr('bl_dash',a='c',lift=18,dx=200,ghost=100),fr('fin_rise',a='c',lift=40,dx=40,dust=1,sfx='BIG GRUNT'),
                 *hit('fin_imp',a='c',tip='TR',n=3,lift=120,dx=20,react='ko'),AR(lift=150,dx=-10),fr('land',a='c',dust=1,dx=0),fr('fin_pose',a='c'),R(a='c')],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S,greendir=G)
