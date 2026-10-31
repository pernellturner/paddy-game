"""Gunslinger demos (same cancel rule as 04_knight / 03_samurai / 02_ninja / 01_kitty). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_quickdraw'),E('light2_crossdraw')],
 'demo_1-1-2':    [O('light1_quickdraw'),C('light5_coatswing'),E('light2_crossdraw')],
 'demo_1-2-3-4':  [O('light1_quickdraw'),C('light2_crossdraw'),C('light3_pistolwhip'),E('light4_spurkick')],
 'demo_1-2-3-4-5':[O('light1_quickdraw'),C('light2_crossdraw'),C('light3_pistolwhip'),C('light4_spurkick'),E('light5_coatswing')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,4),C('air1_doubleshot'),C('air2_heelkick'),E('air3_deadeye')],
 'demo_8hit_finisher':[O('light1_quickdraw'),C('light5_coatswing'),C('light2_crossdraw'),C('light3_pistolwhip'),C('light4_spurkick'),C('light1_quickdraw'),C('heavy1_fanhammer'),
                       (M['finisher_highnoon'],2,n('finisher_highnoon'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_quickdraw')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
