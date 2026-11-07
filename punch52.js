// ===================== v53: REAL IN-BETWEEN FRAMES FOR THE PUNCH STRING =====================
// Pernell: smoother jab / punch-punch-punch, and Paddy stays one size.
// v52 only held the previous frame underneath the next one (a ghost). v53 draws an actual halfway
// frame — anchor-aligned, same scale as the two poses it sits between — for the second half of
// every punch step that has one (p53_frames.js). Hits, root motion and frame numbers stay punch33's:
// the swap is undone before anything else reads p.fi. Story mode never loads this file.
// Gaps that morphed into two bodies (the body-shot lunge, the hook's return to guard) are left out
// on purpose, so those cuts stay a clean pose change instead of a double Paddy.
(function(){
if(typeof p==='undefined'||!window.P33||typeof r11Sq!=='function'||!window.P53F)return;
const S=new Set(['bxj1','bxj2','bxx','bxlh','bxrb','bxpj','bxph','bxpb','bxrec']);
const W=window.PUNCH52={on:true,n:0,shown:0,prev:null,a:''};
let built=false,sw=null,ALL=[];
function build(){
 const P=P53F.punch||{},L=P53F.link||{};ALL=[];
 const add=o=>{if(!o||!o.f)return -1;let i=ALL.findIndex(q=>q.f===o.f);if(i<0){i=ALL.length;ALL.push(o)}return i};
 W.ib={};for(const a in P){W.ib[a]={};for(const k in P[a])W.ib[a][k]=add(P[a][k])}
 W.link={};for(const a in L){W.link[a]={};for(const b in L[a])W.link[a][b]=add(L[a][b])}
 FR.p53=ALL;W.frames=ALL.length;
 try{window.queueFrames&&queueFrames(ALL.map(o=>o.f),true)}catch(_){}
 return true}
function ok(i){const o=ALL[i];return !!(o&&typeof imgOK==='function'&&imgOK(IMG[o.f]))}
const _sq=r11Sq;r11Sq=function(){const s=_sq();try{
 if(!built)built=build();
 if(!(W.on&&built&&FORM()===0&&p.state==='claw'&&S.has(p.anim))){if(p.state!=='claw')W.a='';return s}
 const a=p.anim,fi=p.fi,frac=p.ft-fi;
 if(a!==W.a){W.prev=W.a;W.a=a}
 let idx=-1;
 // follow-up punch: a real frame between the retract you just saw and this punch's load
 if(P33.s>0&&fi===P33.s&&frac<0.42&&W.link[W.prev]&&W.link[W.prev][a]!=null)idx=W.link[W.prev][a];
 // inside a punch: halfway to the next key for the back half of this frame
 else if(frac>=0.45&&W.ib[a]&&W.ib[a][fi+1]!=null)idx=W.ib[a][fi+1];
 p.fB=0; // the halfway frame is the in-between; don't also ghost the previous pose
 if(idx>=0&&ok(idx)){sw={a:p.anim,fi:p.fi};p.anim='p53';p.fi=idx;W.shown++;W.n++}
}catch(e){console.warn('p53',e)}return s};
const _fx=drawFx;drawFx=function(){if(sw){p.anim=sw.a;p.fi=sw.fi;sw=null}_fx()};
})();
