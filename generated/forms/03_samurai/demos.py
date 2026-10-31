"""Samurai demos (same cancel rule as 02_ninja / 01_kitty / tests/punch_strings: the opener plays 1..n-1, each follow-up plays
2..n-1, the last move plays out to its final neutral). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_nukitsuke'),E('light2_kiriage')],
 'demo_1-1-2':    [O('light1_nukitsuke'),C('light5_tsukaate'),E('light2_kiriage')],          # 1' = hilt strike
 'demo_1-2-3-4':  [O('light1_nukitsuke'),C('light2_kiriage'),C('light3_shingiri'),E('light4_tsuki')],
 'demo_1-2-3-4-5':[O('light1_nukitsuke'),C('light2_kiriage'),C('light3_shingiri'),C('light4_tsuki'),E('light5_tsukaate')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,3),C('air1_yokogiri'),C('air2_kiriage'),E('air3_kabutowari')],
 'demo_8hit_finisher':[O('light1_nukitsuke'),C('light5_tsukaate'),C('light2_kiriage'),C('light3_shingiri'),C('light4_tsuki'),C('light1_nukitsuke'),C('heavy1_kesagiri'),
                       (M['finisher_issen'],2,n('finisher_issen'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_nukitsuke')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
