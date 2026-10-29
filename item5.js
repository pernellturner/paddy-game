// ===================== v20e: Bruno + Prowler frames, Lance Rush / Barrel Roll fixes, airborne air slashes =====================
// New 4-frame sheets replace the old 1-2 frame poses. Same move timing: fps is scaled so each move lasts as long as before.
(function(){
const SMA=SMOOTH.SMA;
// RE(form, prefix, {move:[sheet, idx, fps?, loop?]}) - keeps the old duration/loop unless given
function RE(f,pre,m){const o={};for(const k in m){const a=pre+'_'+k,[sh,idx,fps,loop]=m[k],old=SMA[a]||A[a];const n=idx?idx.length:4;
  let fr=fps,lp=loop;if(old){const on=old[1]?old[1].length:(SMA[a]?4:n);if(fr==null)fr=old[2]*(n/Math.max(1,on));if(lp==null)lp=old[3]}
  o[k]=[fr||14,lp||0,sh,idx||null]}SM(f,pre,o)}
// ---- Ninja: every 2-frame move now has 4 drawn frames, and each chain hit is its own move ----
RE(1,'n',{c1:['n_m_palm'],c2:['n_m_twin'],c3:['n_m_spiral'],c5:['n_m_flyfang'],c7:['n_m_crescent'],rise5:['n_m_crescent'],
 a2:['n_m_twin'],a3:['n_m_dashcut'],a4:['n_m_spiral'],air1:['n_m_aclaw'],air2:['n_m_aflip'],dash:['n_m_dashcut'],step:['n_m_dashcut',[2,3,3]]});
const sn=(i,o)=>{if(NCH[i])Object.assign(NCH[i],o)};
sn(1,{nm:'NEON PALM STRIKE!',k:'thrust'});sn(2,{nm:'TWIN FANG X!',k:'cross'});sn(3,{nm:'SPIRAL CARTWHEEL!',k:'spin'});
sn(5,{nm:'FLYING FANG!',k:'flat'});sn(7,{nm:'CRESCENT KICK!',k:'rise'});
Object.assign(NAMES,{n1:'NEON PALM STRIKE!',n2:'TWIN FANG X!',n3:'SPIRAL CARTWHEEL!',n7:'CRESCENT KICK!'});
// ---- Samurai: the 2-frame combo hits ----
RE(2,'s',{h2:['s_m_diag'],cut:['s_m_diag'],h4:['s_m_risemoon'],h5:['s_m_whirl'],h7:['s_m_cross'],h8:['s_m_cross',[1,2,3]],airA:['s_m_airslash',[0,1,2]]});
// ---- Knight: Lance Rush (sword AND shield in every frame) + airborne air slashes ----
RE(3,'kn',{rushA:['kn_m_rushwind',[1,2,3]],rush:['kn_m_lance',null,12,1],airA:['kn_m_nairA'],airB:['kn_m_nairB'],airC:['kn_m_nairC'],airD:['kn_m_nairD']});
// ---- Pirate: Barrel Roll (hat in every frame) + airborne air slashes ----
RE(4,'pi',{roll:['pi_m_nroll',null,16,1],rollout:['pi_m_nrollout'],airA:['pi_m_nairA'],airB:['pi_m_nairB'],airC:['pi_m_nairC'],airD:['pi_m_nairD']});
// ---- Big Bruno: 4-frame KO / sit / wag, punch wind-up + hit, gags and stealth ----
const BR={r_wind:['b_m_wind',null,4.8,0],r_punch:['b_m_hit',[0,1],10,0],r_follow:['b_m_hit',[2,3,3],6.6,0],
 r_ko:['b_m_ko',null,5,0],r_sit:['b_m_sit',null,2.9,0],r_wag:['b_m_wag',null,8,1],
 r_sniff:['b_m_sniff',null,4,1],r_scratch:['b_m_scratch',null,8,1],r_chase:['b_m_chase',null,8,1],r_howl:['b_m_howl',null,3,1],r_yawn:['b_m_yawn',null,2.2,0],
 r_doze:['b_m_doze',null,2,1],r_look:['b_m_look',null,3,1],r_startle:['b_m_startle',null,8,0]};
let asked=false,bdone=new Set(),T=0;
const frOf=v=>{const L=F&&F[v[0]];if(!L)return null;return v[1]?v[1].filter(i=>i<L.length).map(i=>L[i]):L};
function btick(dt){if(!window.queueFrames||!F||!started)return;T-=dt;if(T>0)return;T=.3;
 if(!asked){asked=true;const n=[];for(const a in BR)(frOf(BR[a])||[]).forEach(q=>n.push(q.f));queueFrames([...new Set(n)],false)}
 for(const a in BR){if(bdone.has(a))continue;const fr=frOf(BR[a]);if(!fr||!fr.length){bdone.add(a);continue}
  if(!fr.every(q=>imgOK(IMG[q.f])))continue;if(dummies.some(d=>d.anim===a))continue;A[a]=BR[a];FR[a]=fr;bdone.add(a)}}
const _pre=r9Pre;r9Pre=function(dt){btick(dt);_pre(dt)};
window.ITEM5={BR,bdone};
})();
