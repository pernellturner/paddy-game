"""Power Blade Paddy (form 08) move definitions -> sheets/ (#FF00FF) + sheets_green/ (#00FF00 copy). The drawings were made on green, so
any faint green spill left on an edge would survive a green key on the green copies; Game Studio should use the magenta sheets.
Style: HEAVY, POWERFUL, MOMENTUM-DRIVEN GREATSWORD FIGHTER. `ready` is a wide low power stance side-on, greatsword resting on the near
shoulder (blade back), far cyber-gauntlet paw on the grip. Lights: overhead chop, rising upswing, horizontal spin cut, gauntlet punch
(sword held back), pommel thrust. Heavies: full-turn spinning cleave (2 hits as the blade comes round) and a leaping two-handed ground
slam. Launcher "Rising Breaker" (squat, point on the floor, ripped up). Air: chop, spin sweep, plunge (spike). Blink = low dash with
the sword trailing; block = blade held flat broadside like a shield; dodge = duck under, sword flat over the head; counter = blade
parry into a gauntlet uppercut. Finisher "Power Surge": sword planted (charge), ripped up in a giant rising cut, leap, one-knee
ground smash (KO), sword back onto the shoulder. Wind-ups are held longer than any earlier form (the sword's weight), follow-through
frames carry forward, and every strike ends on `recover` (sword heaved up and back onto the shoulder) then `ready`. Minimal kit FX.
ONE form scale K for every frame (idle_a = 340 px = base idle at TARGET=199). SFX cues on the push-off frame. Run via ./build.sh."""
import sys; sys.path.insert(0,'/workspace/paddy-sprite-studio/forms/_kit')
from formkit import *
ROOT='/workspace/paddy-sprite-studio/forms/08_power_blade'
class PBForm(Form):
    """Toe-anchor fix (copied from 07_light_paddy / 06_gunslinger; kit untouched). The kit re-finds the back toe as the left-most pixel in
    the bottom 28 px of each TRANSFORMED image. Power Blade Paddy's low chocolate tail, the long coat hem and the greatsword tip (dragged
    low behind in l2_load / h1_load / bl_push) can drop into that band on rotated/squashed frames and be taken for the 'back toe'. Here
    the back/front toe of a squashed or rotated frame is the unscaled, unrotated toe point carried through the same scale + rotation, so
    squashes stay planted and rocks pivot about the planted foot. (Unrotated, unscaled frames with a sword tip near the floor behind
    the back foot may still need an explicit dx fix after the first build: check checks/strip_*.jpg.)"""
    # 1 Nov 2026 build review: in these UNROTATED drawings the greatsword tip reaches the floor (behind the back foot, or below the feet),
    # so the kit took the blade tip for the back toe (l2_load/l4_snap/h1_load/bl_push jumped forward 70-130 px) or for the foot baseline
    # (l1_snap/h2_imp/ln_load floated 6-12 px). For these poses foot/back/front come from the cream fur only (feet), never the blade.
    BODY_ANCHOR={'l1_snap','l2_load','l4_snap','h1_load','h2_imp','ln_load','bl_push'}
    def _base(s,p):
        key=(p,1,1,0)
        if key not in s.cache:
            g=dict(Form.img(s,p,1,1,0))
            if p in s.BODY_ANCHOR:
                a=np.asarray(g['im']).astype(int); m=g['m']
                cream=m&(a[...,0]>150)&(a[...,0]>a[...,2]+40)&(a[...,1]>a[...,2]+10)
                ys,xs=np.where(cream); fy=int(ys.max()); low=cream&(np.arange(a.shape[0])[:,None]>fy-28); lx=np.where(low)[1]
                g.update(foot=fy,back=int(lx.min()),front=int(lx.max()))
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
            if p in s.BODY_ANCHOR: g['foot']=int(round(tr(g0['back'],g0['foot'])[1]))
            s.cache[key]=g
        return s.cache[key]
F=PBForm(ROOT, idle='idle_a'); S=f'{ROOT}/sheets'; G=f'{ROOT}/sheets_green'; D=f'{ROOT}/demos'
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
LAND_DX=61; AIR3_REC=-38
W=lambda p,dx,**k: fr(p,a='c',dx=dx,**k)
REC=lambda dx=0,**k: fr('recover',dx=dx,**k)   # sword heaved up and back onto the shoulder: follow-through of every strike
MOVES={
# steady idle: slow heavy breath, idle_b content closed-eye smile; sword planted point-down beside him (no sway)
'idle':   [fr('idle_a'),fr('idle_a',sy=0.995),fr('idle_a',sy=0.99),fr('idle_b',sy=0.99),fr('idle_b',sy=0.985),fr('idle_b',sy=0.99),fr('idle_a',sy=0.995),fr('idle_a')],
# idle -> ready: dip, the sword comes up onto the shoulder, sink into the wide low stance (settles with a small squash = weight)
'ready':  [fr('idle_a'),fr('idle_a',sy=0.95),R(sy=0.93),R(sy=0.97),R()],
# heavy confident stride: 4 real drawings, legs clearly alternate (near fwd, far knee up, far fwd, near knee up); heel-strike squash
'walk':   [W('walk_1',0,sy=0.98),W('walk_1',20),W('walk_2',24,lift=6),W('walk_3',24,sy=0.98),W('walk_3',20),W('walk_4',24,lift=6)],
'victory':[R(),fr('idle_b',dx=-6,sy=0.98),fr('vic_1',a='c'),fr('vic_1',a='c',rot=1,sy=0.99),fr('vic_1',a='c',rot=-1),fr('vic_2',a='c',dx=6),fr('vic_2',a='c',sy=0.99),fr('vic_2',a='c')],   # vic_2 held in place (was +6 px per frame)
# ---- 5 lights (frame 1 = last frame = ready, frame n-1 = recover). Each: visible wind-up (2 frames), drive (push-off, dust, cue),
#      2 hit-stop frames, a carried follow-through frame, recover, ready ----
'light1_overheadchop':   [R(),fr('l1_load',sy=0.98),fr('l1_load',dx=-4,rot=-2),fr('l1_load',dust=1,dx=14,sx=1.03,sfx='hup',fx=('trail','BR')),
                          *hit('l1_snap',tip='BR',dx=40),fr('l1_snap',dx=46,sy=0.98,dust=1),REC(dx=66),R(dx=70)],
'light2_risingupswing':  [R(),fr('l2_load',sy=0.98),fr('l2_load',dx=-4,sy=0.96),fr('l2_load',dust=1,dx=12,sx=1.03,sfx='hup',fx=('trail','R')),
                          *hit('l2_snap',tip='TR',dx=34),fr('l2_snap',dx=40,rot=-2),REC(dx=48),R(dx=52)],
'light3_spincut':        [R(),fr('l3_load',sy=0.99,rot=2),fr('l3_load',dx=-4,rot=3),fr('l3_load',dust=1,dx=10,rot=-2,sfx='hup'),
                          *hit('l3_snap',tip='R',dx=30),fr('l3_snap',dx=36,rot=-2),REC(dx=50),R(dx=54)],
'light4_gauntletpunch':  [R(),fr('l4_load',sy=0.98),fr('l4_load',dust=1,dx=10,sfx='hup'),*hit('l4_snap',tip='R',dx=40),fr('l4_snap',dx=44,sy=0.99),REC(dx=56),R(dx=60)],
'light5_pommelthrust':   [R(),fr('l5_load',dx=-6),fr('l5_load',dust=1,dx=8,sx=1.02,sfx='hup'),*hit('l5_snap',tip='R',dx=44),fr('l5_snap',dx=48,sy=0.99),REC(dx=60),R(dx=64)],
# ---- 2 heavies (longest wind-ups in the game so far: the sword's weight) ----
'heavy1_spincleave':     [R(),fr('h1_load',sy=0.98),fr('h1_load',sx=0.96,rot=2),fr('h1_load',sx=0.95,rot=3),fr('h1_load',dust=1,dx=22,sy=0.95,sfx='GRUNT'),
                          *hit('h1_imp',tip='R',dx=86,react='heavy',ghost=40),fr('h1_imp',dx=90,sx=1.02,fx=('hit',1,'R'),react='heavy'),
                          fr('h1_imp',dx=92,sy=0.98,dust=1),REC(dx=96),R(dx=100)],
'heavy2_groundslam':     [R(),R(sy=0.92),R(sy=0.88,dust=1,sfx='GRUNT'),fr('h2_load',a='c',lift=70,dx=24),fr('h2_load',a='c',lift=120,dx=26),
                          fr('h2_load',a='c',lift=90,dx=26,rot=-4),*hit('h2_imp',a='c',tip='BR',dx=40,react='heavy',ghost=40,dust=1),
                          fr('h2_imp',a='c',sy=0.97,dust=1),REC(dx=88),R(dx=90)],   # recover/ready planted on h2_imp's back toe (was centre-aligned: +34 px slide)
# ---- launcher "Rising Breaker" + air ----
'launcher':              [R(),fr('ln_load',sy=0.98,dx=-20),fr('ln_load',sy=0.92,dx=-20,dust=1,sfx='GRUNT'),*hit('ln_imp',a='c',tip='T',lift=50,dx=70,dust=1,react='launch',contact='R',gap=30),
                          AR(lift=180,dx=6),AR(lift=AIR,dx=4)],
'air1_chop':             [AR(),AR(rot=6,dx=-4),*hit('a1_snap',a='c',tip='BR',dx=62,lift=AIR,sfx='hup',react='air'),fr('a1_snap',a='c',lift=AIR+4,dx=-4),AR(dx=-36)],   # dx retuned: the blade pulls the centroid forward, so dx=30 threw the body 35 px backwards on the chop
'air2_spinsweep':        [AR(),AR(rot=-8,dx=-6),*hit('a2_snap',a='c',tip='R',dx=26,lift=AIR-10,sfx='hup',react='air'),fr('a2_snap',a='c',lift=AIR-6,dx=-12,rot=6),AR(dx=-6)],
'air3_plunge':           [AR(),fr('a3_wind',a='c',lift=AIR+20,sfx='GRUNT'),fr('a3_wind',a='c',lift=AIR+30,rot=-6),*hit('a3_snap',a='c',tip='BR',lift=AIR-70,dx=24,react='spike'),
                          fr('a3_snap',a='c',lift=132,dx=8),   # lift 132 = blade tip meets the floor (was 80: tip sank 52 px below)
                          fr('land',a='c',dust=1,dx=LAND_DX,sy=0.94),fr('land',a='c',sy=0.97),REC(dx=AIR3_REC),R(dx=AIR3_REC+2)],   # land carried forward of the dive, recover/ready planted on land's back toe
# ---- movement / defence ----
'blink':                 [R(),fr('bl_push',dust=1,sfx='hiss'),fr('bl_dash',a='c',lift=20,dx=140,ghost=90),fr('bl_dash',a='c',lift=20,dx=150,ghost=90),
                          fr('bl_dash',a='c',lift=16,dx=130,ghost=60),fr('land',a='c',dx=30,dust=1),R(a='c')],
'blink_air':             [AR(),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90,sfx='hiss'),fr('bl_dash',a='c',lift=AIR,dx=140,ghost=90),fr('bl_dash',a='c',lift=AIR,dx=120,ghost=60),AR(dx=40)],
'block':                 [R(),fr('block',sy=0.97),fr('block',fx=('spark','R')),fr('block',dx=-14,sy=0.97,rot=2),fr('block',dx=-14),R(dx=-14)],
'dodge':                 [R(),R(sy=0.94),fr('dodge_duck',dx=-50,dust=1),fr('dodge_duck',dx=-60,sy=0.98),REC(dx=-64),R(dx=-64)],
'counter':               [R(),fr('block',sy=0.97),fr('cnt_parry',dust=1,dx=6,sfx='hiss',fx=('spark','T')),*hit('cnt_snap',tip='TR',dx=40,react='heavy',sfx='hup'),REC(dx=62),R(dx=66)],
# ---- finisher "Power Surge": sword planted (charge, HISS), ripped up in a giant rising cut (hit), leap (BIG GRUNT), one-knee ground smash
#      (3-frame hit-stop, KO), sword back onto the shoulder, proud stance ----
'finisher_powersurge':   [R(),fr('fin_coil',sfx='HISS'),fr('fin_coil',sy=0.99),fr('fin_coil',sy=0.98),*hit('fin_draw',tip='T',dx=14,react='heavy'),
                          fr('a3_wind',a='c',lift=100,dx=40,dust=1,sfx='BIG GRUNT'),*hit('fin_imp',a='c',tip='R',n=3,dx=60,react='ko'),
                          fr('fin_imp',a='c',sy=0.98,dust=1),REC(dx=96),fr('fin_pose',dx=100),fr('fin_pose',dx=100,sy=0.99),R(dx=104)],
}
if __name__=='__main__':
    only=sys.argv[1:]
    for k,v in MOVES.items():
        if only and k not in only: continue
        write_sheet(F,k,v,S,greendir=G)
