"""Samurai Paddy (form 03) move definitions -> sheets/ (#FF00FF; no purple in this form, so no green copy).
Style: grounded and disciplined (battojutsu / iaido). The neutral `ready` is a deep, wide iai crouch with the katana SHEATHED and the
paw on the hilt. Every light is a draw-cut out of the scabbard and every sword move ends with `noto` (sliding the blade home), so the
cancel rule (next move starts on its frame 2) always flows sheath -> draw -> cut -> sheath. Heavies are two-handed committed cuts
(jodan kesa-giri, wakigamae full-turn sweep). Every frame uses ONE form scale K (idle_a = 340 px = base Paddy idle at TARGET=199).
SFX cues sit on the push-off / effort frame. Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT='/workspace/paddy-sprite-studio/forms/03_samurai'
F=Form(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; D=f'{ROOT}/demos'
def fr(p,**k): k['p']=p; return k
R=lambda **k: fr('ready',**k)                 # GROUND NEUTRAL (sheathed iai crouch): every ground move starts + ends here
AIR=230
AR=lambda **k: fr('air_ready',a='c',lift=k.pop('lift',AIR),**k)   # AIR NEUTRAL (blade drawn)
def hit(p,tip='R',n=2,react='light',sfx='',**k):
    # centroid-anchored ('c') frames are placed relative to the previous frame, so only the FIRST hit-stop frame carries the dx
    out=[]
    for i in range(n):
        kk=dict(k)
        if i and kk.get('a')=='c': kk['dx']=0
        out.append(fr(p,fx=('hit',i+1,tip),react=react,sfx=(sfx if i==0 else ''),**kk))
    return out
W=lambda p,dx,**k: fr(p,a='c',dx=dx,**k)
NOTO=lambda dx=0,**k: fr('noto',dx=dx,**k)    # resheath: the follow-through of every sword cut
MOVES={
# ---- stance / locomotion ------------------------------------------------------------------------------------------------
'idle':   [fr('idle_a'),fr('idle_a',sy=0.99),fr('idle_a',sy=0.982,sx=1.01),fr('idle_b',sy=0.97),fr('idle_b',sy=0.962,sx=1.01),fr('idle_b',sy=0.97),fr('idle_a',sy=0.988),fr('idle_a')],
'ready':  [fr('idle_a'),fr('idle_a',sy=0.95),R(sy=0.93),R(),R(sy=0.985)],
# walk: steady samurai march. walk_a stride (near leg fwd) -> walk_b passing (FAR knee up) -> walk_c stride (far leg fwd) ->
# walk_d passing (NEAR knee up). The far leg is the shaded one (walklegs.py). Root +24..32 px/frame.
'walk':   [W('walk_a',0),W('walk_a',24,sy=0.985),W('walk_b',30,lift=6),W('walk_c',30),W('walk_c',24,sy=0.985),W('walk_d',30,lift=6)],
'victory':[R(),fr('idle_b',dx=-6,sy=0.97),fr('vic_1',a='c'),fr('vic_1',a='c',sy=0.985),fr('vic_1',a='c'),fr('vic_2',a='c',dx=6),fr('vic_2',a='c',dx=6,sy=1.01),fr('vic_2',a='c',dx=6)],
# ---- 5 light draw-cuts (7 frames, hit-stop = frames 4-5, frame 1 = frame 7 = ready) -------------------------------------------
# L1 nukitsuke: horizontal one-hand draw-cut at chest height out of the scabbard, lunge, back leg straight.
'light1_nukitsuke':[R(),fr('l1_load',sy=0.95),fr('l1_load',dust=1,dx=14,sx=1.03,sfx='hup',fx=('trail','R')),*hit('l1_snap',dx=26),NOTO(dx=30),R(dx=34)],
# L2 kiriage: drops low, then a rising two-hand diagonal cut, legs and hips drive UP.
'light2_kiriage':  [R(),fr('l2_load',sy=0.95),fr('l2_load',dust=1,dx=10,sy=0.92,sfx='hup',fx=('trail','TR')),*hit('l2_snap',tip='TR',dx=24,gap=70),NOTO(dx=28),R(dx=32)],
# L3 sune-gari: sinks to the back knee, then a huge low lunge, blade skims at ankle height.
'light3_shingiri': [R(),fr('l3_load',sy=0.97),fr('l3_load',dust=1,dx=16,sx=1.04,sfx='hup'),*hit('l3_snap',tip='R',dx=34),NOTO(dx=40),R(dx=44)],
# L4 tsuki: draws to the hip chamber, then a straight two-hand thrust, one line from back heel to blade tip.
'light4_tsuki':    [R(),fr('l1_load',sy=0.96),fr('l4_load',dust=1,dx=8,sx=1.03,sfx='hup'),*hit('l4_snap',tip='R',dx=30),NOTO(dx=34),R(dx=40)],
# L5 tsuka-ate: blade stays sheathed; coils and rams the hilt end forward with the shoulder (the 1' in 1-1-2).
'light5_tsukaate': [R(),fr('l5_load',sy=0.95,dx=-8),fr('l5_load',dust=1,dx=6,sx=1.04,sfx='hup'),*hit('l5_snap',tip='R',dx=28),R(dx=26,sy=0.97),R(dx=30)],
# ---- 2 heavy cuts --------------------------------------------------------------------------------------------------------
# H1 kesa-giri: grips, rises to jodan on the ball of the back foot, then a huge diagonal downward cut into a deep lunge.
'heavy1_kesagiri': [R(),fr('l1_load',sy=0.96),fr('h1_load',sy=1.02),fr('h1_load',dust=1,dx=10,sy=0.95,sfx='GRUNT',fx=('trail','TR')),
                    *hit('h1_imp',tip='BR',dx=44,react='heavy'),fr('h1_imp',dx=44,sy=0.98,dust=1),NOTO(dx=48),R(dx=54)],
# H2 yoko-ichimonji: winds the blade far back (wakigamae), hips coiled, then a full-turn horizontal two-hand sweep.
'heavy2_ichimonji':[R(),fr('h2_load',sy=0.96),fr('h2_load',dx=-8,sx=1.03,dust=1,sfx='GRUNT'),*hit('h2_imp',tip='R',dx=52,react='heavy'),
                    fr('h2_imp',dx=52,sy=0.98),NOTO(dx=56),R(dx=60)],
# ---- launcher + 3 air cuts (juggle) -----------------------------------------------------------------------------------------
'launcher':        [R(),fr('ln_load',sy=0.95),fr('ln_load',sy=0.88,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=60,dx=110,dust=1,react='launch',contact='R',gap=30),
                    AR(lift=190,dx=6),AR(lift=AIR,dx=4)],
'air1_yokogiri':   [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='R',dx=30,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-10),AR(dx=-6)],
'air2_kiriage':    [AR(),AR(rot=-8,dx=-6),*hit('a2_snap',a='c',tip='TR',dx=26,lift=AIR-20,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-14,dx=-14),AR(dx=-6)],
'air3_kabutowari': [AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),*hit('a3_snap',a='c',tip='BR',lift=AIR-60,dx=30,react='spike'),
                    fr('a3_snap',a='c',lift=90,dx=10),fr('land',a='c',dust=1,dx=6,sy=0.95),NOTO(a='c'),R(a='c')],
# ---- movement / defence -------------------------------------------------------------------------------------------------------
'blink':           [R(),fr('l3_load',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=240,ghost=90),fr('bl_dash',a='c',lift=20,dx=240,ghost=90),R(a='c',sy=0.94,dx=40,dust=1),R(a='c')],
'blink_air':       [AR(),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR+30,dx=200,ghost=90),AR(dx=40)],
'block':           [R(),fr('block',sy=0.97),fr('block',fx=('spark','T')),fr('block',dx=-14,sy=0.97),fr('block',dx=-14),R(dx=-14)],
'dodge':           [R(),R(sy=0.9),fr('dodge_back',a='c',lift=50,dx=-110),fr('l3_load',a='c',dx=-40,dust=1,sy=0.97),R(a='c')],
'counter':         [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=6,sfx='hiss'),*hit('cnt_snap',tip='R',dx=34,react='heavy',sfx='hup'),NOTO(dx=38),R(dx=44)],
# ---- finisher "Issen" (end of the 8-hit route), 3-frame hit-stop: still coil, flash-step, leap, kabuto-wari cleave, click ------
'finisher_issen':  [R(),fr('fin_coil',sfx='HISS'),fr('fin_coil',sy=0.96),fr('bl_dash',a='c',lift=18,dx=210,ghost=100),fr('a3_wind',a='c',lift=90,dx=30,dust=1,sfx='BIG GRUNT'),
                    *hit('fin_imp',a='c',tip='BR',n=3,dx=40,react='ko'),fr('fin_imp',a='c',sy=0.98,dust=1),NOTO(a='c',dx=-10),fr('fin_pose',a='c'),fr('fin_pose',a='c',sy=0.99),R(a='c')],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S)
