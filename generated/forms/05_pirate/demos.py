"""Pirate demos (same cancel rule as 04_knight / 03_samurai / 02_ninja / 01_kitty). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_flick'),E('light2_backhand')],
 'demo_1-1-2':    [O('light1_flick'),C('light5_lurch'),E('light2_backhand')],
 'demo_1-2-3-4':  [O('light1_flick'),C('light2_backhand'),C('light3_bootkick'),E('light4_hiltpunch')],
 'demo_1-2-3-4-5':[O('light1_flick'),C('light2_backhand'),C('light3_bootkick'),C('light4_hiltpunch'),E('light5_lurch')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,4),C('air1_slash'),C('air2_bootkick'),E('air3_crowsnest')],
 'demo_8hit_finisher':[O('light1_flick'),C('light5_lurch'),C('light2_backhand'),C('light3_bootkick'),C('light4_hiltpunch'),C('light1_flick'),C('heavy1_corkscrew'),
                       (M['finisher_jollyroger'],2,n('finisher_jollyroger'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_flick')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
