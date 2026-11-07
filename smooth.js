// ===================== SMOOTH FRAMES (v19) =====================
// Every move gets 3-6 drawn frames. New in-between sheets are cut to assets/p/<pre>_m_<move>_NN and listed in frames.json.
// They load lazily: only for the form you are playing, after its costume is in, and swap in between plays of a move
// (never mid-animation), so start-up and form switches stay as fast as before.
(function(){
const SMA={},SMF={};
// SM(form index, anim prefix, {move:[fps, loop, sheet, frame indices]}) — sheet defaults to <pre>_m_<move>
function SM(f,pre,m){for(const k in m){const v=m[k],a=pre?pre+'_'+k:k;SMA[a]=[v[2]||((pre||'k')+'_m_'+k),v[3]||null,v[0]||12,v[1]||0];SMF[a]=f}}
window.SM=SM;window.SMA=SMA;
const DONE=new Set(),ASKED=new Set();let T=0,lastF=-1;
function frOf(v){const L=F&&F[v[0]];if(!L)return null;return v[1]?v[1].filter(i=>i<L.length).map(i=>L[i]):L}
function tick(dt){if(!window.queueFrames||!F)return;T-=dt;if(T>0)return;T=.25;const f=FORM();
 for(const a in SMA){if(DONE.has(a))continue;const v=SMA[a],fr=frOf(v);if(!fr||!fr.length){DONE.add(a);continue}
  if(!fr.every(q=>imgOK(IMG[q.f]))){if(SMF[a]===f&&!ASKED.has(a)&&(f===0||formReady(f))){ASKED.add(a);queueFrames(fr.map(q=>q.f),false)}continue}
  if(p.anim===a)continue;A[a]=v;FR[a]=fr;DONE.add(a)}}
const _pre=r9Pre;r9Pre=function(dt){tick(dt);_pre(dt)};
window.SMOOTH={SMA,SMF,DONE,tick};
// ---------- Kitty: the long-cut sheets that were never wired in ----------
SM(0,'',{idle:[4,1,'idle_test_1',[0,1,4,1]],hurt:[5,0,'hurt',[0,1,2,3,5]],dash:[14,1,'dash'],wingdash:[16,1,'wingeddash'],dashstrike:[14,0,'dashstrike'],
 airswipe:[14,0,'kt_m_airswipe'],airspin:[16,1,'airspin'],leapspin:[18,1,'airspin'],dive:[8,1,'divebomb',[0,1]],diveclaw:[12,0,'kt_m_diveclaw'],pounce:[12,0,'pounce'],stalk:[6,1,'stalk']});
// ---------- Legends ----------
const LEG=(o)=>Object.assign({h1:[16],h2:[16],h3:[15],h4:[15],h5:[15],h6:[15],h7:[13],launch:[13],air1:[16],air2:[15],dive:[12],
 tail:[15],tail2:[15],meowc:[8,1],meow:[12],meow2:[12],blink:[14],hurt:[4],victory:[5]},o||{});
SM(10,'sh',LEG({h4:[12,0,0,[0,1,2]],launch:[12,0,0,[0,1,2]]}));
SM(9,'sr',LEG());
// ---------- hurt (4 frames over 1s = same hit-stun as before) + victory for every other form ----------
SM(1,'n',{hurt:[4],dive:[14,0,'n_m_ndive',[0,1,2]]});
SM(2,'s',{hurt:[4],victory:[5]});
SM(3,'kn',{hurt:[4],victory:[4,0,0,[1,2,3]]});
SM(4,'pi',{hurt:[4],victory:[4,0,0,[1,2,3]]});
[['mst',[1,2,3]],['mde',[1,2,3]],['mph'],['mfm'],['mmc'],['mtc'],['mch'],['mbk']].forEach(([q,vi],i)=>SM(11+i,q,{hurt:[4],victory:vi?[4,0,0,vi]:[5]}));
// ---------- Prowlers: their single-frame moves now have 3-4 drawn frames (hold poses end on the held frame) ----------
SM(2,'s',{airB:[14,0,0,[0,1,2]],airC:[14],airD:[14,0,0,[0,1,2]],dive:[12,0,0,[0,1,2]],stance:[10],dash:[14],after:[8],calm:[6],
 block:[12],parry:[14],riposte:[14],kneel:[8],power:[10],super:[14]});
SM(3,'kn',{airA:[14],airB:[14],airC:[14],airD:[14,0,0,[0,1,2]],dive:[12,0,0,[0,1,2]],leap:[12,0,0,[0,1,3]],slam:[12],guard:[12],parry:[14],counter:[14],
 kneel:[8],power:[10],shout:[12],rushA:[12,0,'kn_m_rush',[0,1,2]],rush:[12,1,'kn_m_rush',[1,2,3,2]],calm:[6,0,'kn_m_kneel',[0,1,2]]});
SM(4,'pi',{h2:[14,0,0,[0,1,2]],h3:[14],h4:[13],h6:[14],twirl:[14],launch:[13],airA:[14],airB:[14],airC:[14],airD:[14],dive:[12,0,0,[0,1,2]],
 aim:[10],cannon:[12],roll:[16,1,'pi_m_rollx'],rollout:[12],calm:[6],swing:[8]});
SM(5,'gs',LEG({launch:[12,0,0,[0,1,2]]}));
SM(6,'lp',LEG({h1:[15,0,0,[0,1,2]],h6:[13],launch:[12,0,0,[0,1,2]],air2:[14,0,0,[1,2,3]],blink:[14]}));
SM(7,'pb',LEG({h1:[15,0,0,[0,1,2]],h7:[12,0,0,[0,1,2]],spin:[16,1]}));
SM(8,'cb',LEG({h1:[15,0,0,[0,1,2]],h2:[15,0,0,[0,1,2]],stinger:[16],throw:[14,0,0,[0,1,2]],catch:[14]}));

})();
