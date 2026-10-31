"""Crimson Blade Paddy demos (same cancel rule as 08_power_blade / 07_light_paddy / 01_kitty). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_forehandslash'),E('light2_risingslash')],
 'demo_1-1-2':    [O('light1_forehandslash'),C('light3_bootkick'),E('light2_risingslash')],
 'demo_1-2-3-4':  [O('light1_forehandslash'),C('light2_risingslash'),C('light3_bootkick'),E('light4_spincut')],
 'demo_1-2-3-4-5':[O('light1_forehandslash'),C('light2_risingslash'),C('light3_bootkick'),C('light4_spincut'),E('light5_cleave')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,4),C('air1_slash'),C('air2_spinslash'),E('air3_helmbreaker')],
 'demo_8hit_finisher':[O('light1_forehandslash'),C('light2_risingslash'),C('light3_bootkick'),C('light4_spincut'),C('light5_cleave'),C('heavy1_stinger'),C('heavy2_crimsondrive'),
                       (M['finisher_showtime'],2,n('finisher_showtime'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_forehandslash')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
