"""Light Paddy demos (same cancel rule as 06_gunslinger / 05_pirate / 04_knight / 01_kitty). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_fallingcut'),E('light2_risingarc')],
 'demo_1-1-2':    [O('light1_fallingcut'),C('light5_twirlthrust'),E('light2_risingarc')],
 'demo_1-2-3-4':  [O('light1_fallingcut'),C('light2_risingarc'),C('light3_spincut'),E('light4_palmpush')],
 'demo_1-2-3-4-5':[O('light1_fallingcut'),C('light2_risingarc'),C('light3_spincut'),C('light4_palmpush'),E('light5_twirlthrust')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,4),C('air1_fallingslash'),C('air2_spinsweep'),E('air3_fallingstar')],
 'demo_8hit_finisher':[O('light1_fallingcut'),C('light5_twirlthrust'),C('light2_risingarc'),C('light3_spincut'),C('light4_palmpush'),C('light1_fallingcut'),C('heavy1_spinarc'),
                       (M['finisher_dawnbloom'],2,n('finisher_dawnbloom'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_fallingcut')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
