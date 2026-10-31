"""Kitty demos (same cancel rule as 02_ninja / tests/punch_strings: opener plays 1..n-1, each follow-up plays 2..n-1, the last move
plays out to its final neutral). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_swat'),E('light2_bonk')],
 'demo_1-1-2':    [O('light1_swat'),C('light5_tailwhip'),E('light2_bonk')],          # 1' = tail whip (spin variant)
 'demo_1-2-3-4':  [O('light1_swat'),C('light2_bonk'),C('light3_ankleswipe'),E('light4_headbonk')],
 'demo_1-2-3-4-5':[O('light1_swat'),C('light2_bonk'),C('light3_ankleswipe'),C('light4_headbonk'),E('light5_tailwhip')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,3),C('air1_swat'),C('air2_bunnykick'),E('air3_divespike')],
 'demo_8hit_finisher':[O('light1_swat'),C('light5_tailwhip'),C('light2_bonk'),C('light3_ankleswipe'),C('light4_headbonk'),C('light1_swat'),C('heavy1_pounce'),
                       (M['finisher_ninelives'],2,n('finisher_ninelives'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_swat')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        if k in ('demo_1-2','demo_1-1-2','demo_1-2-3-4','demo_1-2-3-4-5','demo_juggle','demo_8hit_finisher','demo_block_counter','demo_blink_in'):
            write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
