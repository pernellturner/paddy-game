"""Pirate Paddy (form 05) move definitions -> sheets/ (#FF00FF; no green copy: Pirate is navy/crimson/black/gold, no purple).
Style: swaggering, off-balance SWASHBUCKLER. The neutral `ready` is a loose side-on guard: cutlass leading in the near paw, point
up-forward, off-paw fist on the hip, weight rocking on a bent back leg (sea legs). Lights are a wrist-flick lunge, a rising backhand,
a leaning-back boot push-kick, a basket-hilt punch and a drunken lurching low cut. Heavies are a full-spin corkscrew cut and a flying
fleche lunge. Every strike ends on `recover` (wrist-twirl flourish, cocky shrug) then `ready`; the kick, lurch and corkscrew add an
off-balance wobble (rot) before the flourish. Idle/ready/walk sway with small rotations like a rolling deck. The blink is a forward
deck-roll (rotated frames), the dodge a limbo lean-back, the block a hanging guard, the counter a bind-and-riposte.
Unlike Ninja (darting palms/kicks), Kitty (swats/pounces), Samurai (iaido draw-cuts) and Knight (planted sword-and-shield): never
planted or square, no sheathing, no shield, the off-paw is free (hip, hat, balance) and the flintlock stays in the sash.
ONE form scale K for every frame (idle_a = 340 px = base idle at TARGET=199). SFX cues on the push-off frame. Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT='/workspace/paddy-sprite-studio/forms/05_pirate'
class PirateForm(Form):
    """Toe-anchor fix (Pirate only, kit untouched). The kit re-finds the back toe as the left-most pixel in the bottom 28 px of each
    TRANSFORMED image. When the sea-legs sway rotates a frame, or an `sy` squash shortens it, the tip of Pirate's long low chocolate
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
F=PirateForm(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; D=f'{ROOT}/demos'
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
# sea-legs sway: the whole body rocks a couple of degrees like a rolling deck
'idle':   [fr('idle_a'),fr('idle_a',rot=1.5,dx=-3,sy=0.99),fr('idle_a',rot=2.5,dx=-5,sy=0.982,sx=1.01),fr('idle_b',rot=1.5,dx=-3,sy=0.98),
           fr('idle_b',sy=0.975),fr('idle_b',rot=-1.5,dx=3,sy=0.98),fr('idle_a',rot=-2.5,dx=5,sy=0.988),fr('idle_a',rot=-1,dx=2)],
'ready':  [fr('idle_a'),fr('idle_a',sy=0.95),R(sy=0.94,rot=1.5),R(rot=-1),R(sy=0.985)],
'walk':   [W('walk_a',0,rot=-2),W('walk_a',22,sy=0.985,rot=-1),W('walk_b',28,lift=6,rot=1),W('walk_c',28,rot=2),W('walk_c',22,sy=0.985,rot=1),W('walk_d',28,lift=6,rot=-1)],
'victory':[R(),fr('idle_b',dx=-6,sy=0.98),fr('vic_1',a='c'),fr('vic_1',a='c',sy=0.985),fr('vic_1',a='c'),fr('vic_2',a='c',dx=6),fr('vic_2',a='c',dx=6,rot=1.5),fr('vic_2',a='c',dx=6,rot=-1.5)],
# ---- 5 lights (frame 1 = last frame = ready, frame n-1 = recover flourish) ----
'light1_flick':      [R(),fr('l1_load',sy=0.97),fr('l1_load',dust=1,dx=12,sx=1.03,sfx='hup'),*hit('l1_snap',tip='BR',dx=30),REC(dx=54),R(dx=58)],
'light2_backhand':   [R(),fr('l2_load',sy=0.97),fr('l2_load',dust=1,dx=10,sx=1.03,sfx='hup',fx=('trail','TR')),*hit('l2_snap',tip='TR',dx=26),REC(dx=30),R(dx=34)],
'light3_bootkick':   [R(),fr('l3_load',sy=0.99),fr('l3_load',dx=4,rot=3,sfx='hup'),*hit('l3_snap',tip='R',dx=12,gap=10),fr('l3_snap',dx=8,rot=-4),REC(dx=-14,rot=-2),R(dx=-12)],
'light4_hiltpunch':  [R(),fr('l4_load',sy=0.96),fr('l4_load',dust=1,dx=8,sx=1.03,sfx='hup'),*hit('l4_snap',tip='R',dx=28),REC(dx=52),R(dx=56)],
'light5_lurch':      [R(),fr('l5_load',rot=3,dx=-6),fr('l5_load',dust=1,dx=24,rot=1,sfx='hup'),*hit('l5_snap',tip='BR',dx=0),fr('l5_snap',dx=4,rot=-3),REC(dx=28,rot=-2),R(dx=30)],
# ---- 2 heavies ----
'heavy1_corkscrew':  [R(),fr('h1_load',sy=0.98),fr('h1_load',sx=0.95,rot=2),fr('h1_load',dust=1,dx=30,sy=0.95,sfx='GRUNT',fx=('trail','R')),
                      *hit('h1_imp',tip='R',dx=100,react='heavy',ghost=40),fr('h1_imp',dx=102,sy=0.98,dust=1),fr('h1_imp',dx=102,rot=-3),REC(dx=54),R(dx=58)],
'heavy2_fleche':     [R(),fr('h2_load',sy=0.96),fr('h2_load',dx=-8,sx=1.03,dust=1,sfx='GRUNT'),*hit('h2_imp',a='f',tip='R',dx=110,react='heavy',ghost=70),
                      fr('h2_imp',a='f',dx=116,sy=0.98,dust=1),REC(dx=124),R(dx=128)],
# ---- launcher + air ----
'launcher':          [R(),fr('ln_load',sy=0.95,dx=-60),fr('ln_load',sy=0.88,dx=-60,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=60,dx=80,dust=1,react='launch',contact='R',gap=30),
                      AR(lift=190,dx=6),AR(lift=AIR,dx=4)],
'air1_slash':        [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='BR',dx=30,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-10),AR(dx=-6)],
'air2_bootkick':     [AR(),AR(rot=-6,dx=-6),*hit('a2_snap',a='c',tip='R',dx=26,lift=AIR-10,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-6,dx=-12),AR(dx=-6)],
'air3_crowsnest':    [AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),fr('a3_wind',a='c',lift=AIR+30,rot=-12),*hit('a3_snap',a='c',tip='BR',lift=AIR-60,dx=30,react='spike'),
                      fr('a3_snap',a='c',lift=90,dx=10),fr('land',a='c',dust=1,dx=6,sy=0.95),REC(a='c'),R(a='c')],
# ---- movement / defence ----
'blink':             [R(),fr('ln_load',dx=-60,dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=130,ghost=90),fr('bl_dash',a='c',lift=30,dx=130,rot=-90,ghost=90),
                      fr('bl_dash',a='c',lift=30,dx=130,rot=-180,ghost=90),fr('bl_dash',a='c',lift=20,dx=120,rot=-270,ghost=60),fr('land',a='c',dx=30,dust=1),R(a='c')],
'blink_air':         [AR(),fr('bl_dash',a='c',lift=AIR+30,dx=140,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR+30,dx=140,rot=-120,ghost=90),
                      fr('bl_dash',a='c',lift=AIR+30,dx=120,rot=-240,ghost=60),AR(dx=40)],
'block':             [R(),fr('block',sy=0.97),fr('block',fx=('spark','R')),fr('block',dx=-12,sy=0.97,rot=2),fr('block',dx=-12),R(dx=-12)],
'dodge':             [R(),R(sy=0.94,rot=3),fr('dodge_back',dx=-50,dust=1),fr('dodge_back',dx=-60,sy=0.98),REC(dx=-80,rot=-2),R(dx=-60)],
'counter':           [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=6,sfx='hiss',fx=('spark','T')),*hit('cnt_snap',tip='R',dx=38,react='heavy',sfx='hup'),REC(dx=62),R(dx=66)],
# ---- finisher "Jolly Roger": overhead twirl, fleche dash, leap, crashing down-slash to the deck (3-frame hit-stop), hat raised + blade to the sky ----
'finisher_jollyroger':[R(),fr('fin_coil',sfx='HISS'),fr('fin_coil',rot=3,sy=0.99),fr('h2_imp',a='f',dx=150,ghost=100),fr('a3_wind',a='c',lift=90,dx=30,dust=1,sfx='BIG GRUNT'),
                      *hit('fin_imp',a='c',tip='BR',n=3,dx=40,react='ko'),fr('fin_imp',a='c',sy=0.98,dust=1),REC(a='c',dx=-10),fr('fin_pose',a='c'),fr('fin_pose',a='c',sy=0.99,rot=1.5),R(a='c')],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S)
