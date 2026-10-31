"""Knight demos (same cancel rule as 03_samurai / 02_ninja / 01_kitty). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)
def O(k): return (M[k],1,n(k)-1)
def E(k): return (M[k],2,n(k))
DEMOS={
 'demo_1-2':      [O('light1_shieldjab'),E('light2_thrust')],
 'demo_1-1-2':    [O('light1_shieldjab'),C('light5_lowcut'),E('light2_thrust')],
 'demo_1-2-3-4':  [O('light1_shieldjab'),C('light2_thrust'),C('light3_forehand'),E('light4_shieldupper')],
 'demo_1-2-3-4-5':[O('light1_shieldjab'),C('light2_thrust'),C('light3_forehand'),C('light4_shieldupper'),E('light5_lowcut')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,3),C('air1_slash'),C('air2_shieldbash'),E('air3_plunge')],
 'demo_8hit_finisher':[O('light1_shieldjab'),C('light5_lowcut'),C('light2_thrust'),C('light3_forehand'),C('light4_shieldupper'),C('light1_shieldjab'),C('heavy1_overhead'),
                       (M['finisher_bastion'],2,n('finisher_bastion'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_shieldjab')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
