"""Ninja demos (same cancel rule as tests/punch_strings: opener plays 1..n-1, each follow-up plays 2..n-1 (its frame 1 = the shared
neutral replaces the previous move's last frame), the last move plays out to its final neutral). Plain + vs-dummy versions."""
from moves import *
M=MOVES; n=lambda k: len(M[k])
def C(k): return (M[k],2,n(k)-1)          # cancelled follow-up
def O(k): return (M[k],1,n(k)-1)          # opener
def E(k): return (M[k],2,n(k))            # last move, played to its neutral
DEMOS={
 'demo_1-2':      [O('light1_palm'),E('light2_chop')],
 'demo_1-1-2':    [O('light1_palm'),C('light5_twinpalm'),E('light2_chop')],          # 1' = twin palm (the palm variant), like jab1/jab2
 'demo_1-2-3-4':  [O('light1_palm'),C('light2_chop'),C('light3_snapkick'),E('light4_elbow')],
 'demo_1-2-3-4-5':[O('light1_palm'),C('light2_chop'),C('light3_snapkick'),C('light4_elbow'),E('light5_twinpalm')],
 'demo_juggle':   [O('launcher'),(M['blink_air'],2,3),C('air1_palm'),C('air2_sidekick'),E('air3_axespike')],
 'demo_8hit_finisher':[O('light1_palm'),C('light5_twinpalm'),C('light2_chop'),C('light3_snapkick'),C('light4_elbow'),C('light1_palm'),C('heavy1_sweep'),
                       (M['finisher_crescent'],2,n('finisher_crescent'))],
 'demo_block_counter':[O('block'),E('counter')],
 'demo_blink_in':[O('blink'),E('light1_palm')],
}
if __name__=='__main__':
    import sys; only=sys.argv[1:]
    for k,g in DEMOS.items():
        if only and k not in only: continue
        write_demo(F,f'{D}/{k}.gif',g)
        if k in ('demo_1-2','demo_1-1-2','demo_1-2-3-4','demo_juggle','demo_8hit_finisher','demo_block_counter'):
            write_demo(F,f'{D}/vsdummy_{k[5:]}.gif',g,dummy=Dummy(),hold=700)
