"""Power Blade Paddy demos (same cancel rule as 07_light_paddy / 06_gunslinger / 01_kitty). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_overheadchop'),E('light2_risingupswing')],
 'demo_1-1-2':    [O('light1_overheadchop'),C('light5_pommelthrust'),E('light2_risingupswing')],
 'demo_1-2-3-4':  [O('light1_overheadchop'),C('light2_risingupswing'),C('light3_spincut'),E('light4_gauntletpunch')],
 'demo_1-2-3-4-5':[O('light1_overheadchop'),C('light2_risingupswing'),C('light3_spincut'),C('light4_gauntletpunch'),E('light5_pommelthrust')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,4),C('air1_chop'),C('air2_spinsweep'),E('air3_plunge')],
 'demo_8hit_finisher':[O('light1_overheadchop'),C('light5_pommelthrust'),C('light2_risingupswing'),C('light3_spincut'),C('light4_gauntletpunch'),C('light1_overheadchop'),C('heavy1_spincleave'),
                       (M['finisher_powersurge'],2,n('finisher_powersurge'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_overheadchop')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
