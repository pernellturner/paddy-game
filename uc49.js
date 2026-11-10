// ===================== v49: NEW BOXER'S UPPERCUT (A/B test, Practice Room only, base Paddy only) =====================
// Pernell 4 Nov 2026: the uppercut must look like a real boxer's: dip and drive through the legs, hips and shoulders, then the arm.
// NEW (default in the Practice Room): ↑ + Claw on the ground = the pink boxer uppercut.
// OLD: exactly as before (↑ + Claw = the old leaping uppercut). Story mode (level.html) never loads this file.
// Switch: "UPPERCUT: NEW / OLD" in the Practice Room bar, or the \ key.
//
// v53 (6 Nov 2026):
//   NO hop. The root never leaves the floor (motion y is 0, scale is 1) so he doesn't jump or change size.
//   Deeper crouch is in the art (k_uc53_deep / deepb: the approved load pose, torso dropped onto the planted feet).
//   Then a quick rise: hips → bent drive → the same straight-arm beat → bent peak. In-betweens are real halfway
//   frames where the two poses agree (k_uc53_f01/f12/ld/ldb/f34/f56). The front-to-back snap is a cut, not a
//   double-exposure blend.
//   POWER UPPERCUT: hold ↑+Claw (or hold Claw, then ↑) winds the crouch through more frames; let go = the power
//   swing (deeper coil, longer extension, higher launch). Tap ↑+Claw = the normal uppercut. See kitti48.js.
// v54: the power swing is its own move. It starts in a crouch deeper than the tap (k_uc54_deepc), hangs there,
//   then snaps up with a gold arc and afterimages. The tap stays on the floor (y = 0, scale = 1). Dash uppercut
//   reuses these rising frames while he is still sliding.
(function(){
if(typeof p==='undefined'||!window.P33||typeof uppercut!=='function'||!window.P53F)return;
const U=window.UC49={mode:(()=>{try{return localStorage.getItem('uc49')||'new'}catch(_){return 'new'}})(),n:{newUp:0,power:0},log:[]};
const act=()=>{try{return !!(window.PRACTICE&&PRACTICE.on)&&U.mode==='new'&&FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(_){return false}};
U.active=act;
let built=false;
function build(){
 const N=P53F.uc;if(!N||!N.r||!N.deep||!N.s||!N.l||!N.h||!N.d||!N.k)return false;
 if(!N.f01)N.f01=N.c;if(!N.f12)N.f12=N.l;if(!N.ld)N.ld=N.deep;if(!N.ldb)N.ldb=N.deep;if(!N.deepb)N.deepb=N.deep;if(!N.deepc)N.deepc=N.deepb||N.deep;if(!N.f34)N.f34=N.d;if(!N.f56)N.f56=N.k;
 U.N=N;
 // [frame, ft where it starts]. FPS=12. Tap playback starts at ft=2 (already in the load). Hit window is bxpu fi 4–6.
 U.seqTap=[
  [N.r,0],[N.f01,0.7],[N.c,1.2],[N.f12,1.6],
  [N.l,1.95],[N.ld,2.35],[N.deep,2.75],          // inward fist, then a deeper crouch
  [N.h,3.22],[N.f34,3.46],[N.d,3.66],[N.s,3.90], // explosive rise; straight arm is up as the hit lands
  [N.f56,5.15],[N.k,5.55],[N.r,8.7]];
 // Power playback starts at ft 0 (kitti48 powerUp). The hit is still bxpu fi 4–6, so this crouch
 // is extra time the tap never shows, then a short snap into the straight arm.
 U.seqPow=[
  [N.deep,0],[N.ldb,0.5],[N.deepb,1.05],[N.deepc,1.55],
  [N.h,2.65],[N.f34,2.82],[N.d,3.0],[N.s,3.22],
  [N.f56,6.0],[N.k,6.55],[N.r,10.4]];
 U.seq=U.seqTap;U.tapN=U.seqTap.length;U.powN=U.seqPow.length;
 const all=[...new Set(U.seqTap.map(s=>s[0]).concat(U.seqPow.map(s=>s[0])))];
 FR.uc49=all;U.idx=f=>all.indexOf(f);U.frames=all.length;
 if(typeof A!=='undefined')A.uc49=['k_uc49',null,12,0];
 try{window.queueFrames&&queueFrames(all.map(n=>n.f),true)}catch(_){}
 return true}
const isPow=()=>!!(window.KD48&&KD48.pow&&KD48.pow.kind==='up');
const isCh=()=>p.state==='kcharge'&&!!(window.KD48&&KD48.ch&&KD48.ch.kind==='up');
function vi(ft){let i=0;for(let k=0;k<U.seq.length;k++)if(ft>=U.seq[k][1])i=k;return i}
function chargeFrame(){
 const N=U.N,t=p.t,L=(KD48.ch&&KD48.ch.lvl)||0;
 if(t<.12)return N.c;if(t<.26)return N.f12;if(t<.42)return N.l;if(t<.58)return N.ld;
 if(L<.2)return N.deep;if(L<.45)return N.ldb||N.deep;if(L<.75)return N.deepb||N.deep;return N.deepc||N.deepb||N.deep}
function dashFrame(){const N=U.N,t=p.t;
 if(t<.05)return N.h;if(t<.1)return N.f34||N.d;if(t<.16)return N.d;if(t<.3)return N.s;if(t<.4)return N.f56||N.k;return N.k}
// ---- ↑ + Claw on the ground = the boxer uppercut (tap). Holding is kitti48's power wind-up. ----
const _up=uppercut;uppercut=function(){
 const fl=typeof floorAt==='function'?floorAt(p.x):GROUND;
 if(!act()||p.wall)return _up.apply(this,arguments);
 if(!p.ground&&fl-p.y>90)return;
 p.y=fl;p.ground=true;p.vy=0;p.jumps=0;
 p.state='normal';p.combo=p.keepT>0?p.keepCombo:(p.combo||0);p.keepT=0;p.cool=0;startClaw();
 if(p.state!=='claw')return;
 setAnim('bxpu',true);p.ft=p.fi=2;p.vx=0;p.vy=0;p.ground=true;p.y=fl;
 Object.assign(P33,{a:'bxpu',last:'bxpu',lastFi:2,s:2,trav:0,q:null,early:false,hitDone:false,face:p.face,legacy:false});
 if(window.W31&&W31.names.length)W31.names[W31.names.length-1]='bxpu';
 say('UPPERCUT!','#ffe14d');U.n.newUp++;U.log.push('newup')};
// y is always 0 (no hop, feet stay on the floor). s is always 1 (no squash/stretch size pop).
function motion(ft){
 if(p.state==='kduc')return{y:0,r:.08,s:1};   // dash uppercut: lean with the run, no hop, no resize
 const e=(a,b,x)=>Math.max(0,Math.min(1,(x-a)/(b-a))),sm=x=>x*x*(3-2*x),P=isPow()||isCh();
 const rise=sm(e(P?2.65:3.22,P?3.3:3.95,ft))*(1-sm(e(P?6.4:6.0,P?8.6:7.8,ft)));
 return{y:0,r:(isCh()?-.02*((KD48.ch&&KD48.ch.lvl)||0):(P?.1:.045)*rise),s:1}}
U.motion=motion;
let sw=null,smY=0,smR=0;
const on=()=>act()&&built&&((p.state==='claw'&&p.anim==='bxpu')||isCh()||p.state==='kduc');
const _sq=r11Sq;r11Sq=function(){let s=_sq();try{if(!built)built=build();if(on()){U.seq=isPow()?U.seqPow:U.seqTap;const ch=isCh(),dash=p.state==='kduc',ft=ch||dash?0:p.ft,i=ch||dash?-1:vi(ft);sw={a:p.anim,fi:p.fi};p.anim='uc49';
  const cf=dash?dashFrame():ch?chargeFrame():U.seq[i][0];p.fi=U.idx(cf);p.fB=0;
  if(isPow()&&!ch&&cf&&cf===U.N.s&&typeof ghosts!=='undefined'&&ghosts.length<8)ghosts.push({x:p.x-p.face*14,y:p.y,f:cf,face:p.face,l:.16,blue:0});
  U.last=[dash?'dash':ch?'ch':i,+((ch||dash?p.t:ft)).toFixed(2),cf&&cf.f];
  }else{}}catch(_){}return s};
const _rb=mRunBob;mRunBob=function(){const o=_rb();try{if(sw){const m=motion(isCh()?0:p.ft);smY+=(m.y-smY)*.5;smR+=(m.r-smR)*.5;return{y:(o.y||0)+smY,r:(o.r||0)+smR*p.face}}else{smY*=.5;smR*=.5}}catch(_){}return o};
const _fx=drawFx;drawFx=function(){if(sw){p.anim=sw.a;p.fi=sw.fi;sw=null}_fx()};
let stepped=0;
const _pre=r9Pre;r9Pre=function(dt){
 // ↑ is also jump. Pressed together with Claw, that must be the uppercut — not the jump-charge hop.
 try{
  const up=!!(K.up||P.jump), atk=!!(K.attack||P.attack);
  const ready=p.state==='normal'||p.state==='jcharge'||p.state==='land';
  if(act()&&!p.wall&&!p.hunt&&ready&&up&&atk&&(p.ground||(typeof floorAt==='function'&&floorAt(p.x)-p.y<90))){
   if(!U.arm&&!(window.KD48&&KD48.ch)){
    U.arm=1; p.state='normal'; delete P.jump; delete P.attack; uppercut();
   }
  }else if(!K.up||!K.attack) U.arm=0;
 }catch(e){console.warn('uc49',e)}
 _pre(dt);try{if(!on()||isCh()){if(!on())stepped=0;return}const ft=p.ft;
 const reach=isPow()?96:56,from=isPow()?2.6:3.15,to=isPow()?4.0:4.6;
 if(ft>=from&&ft<to&&stepped<reach&&p.state==='claw'){let near=false;for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;if(g>-20&&g<105&&Math.abs(d.y-p.y)<200)near=true}
  if(!near){const dx=Math.min(reach-stepped,(isPow()?420:260)*dt);stepped+=dx;p.x+=p.face*dx;if(typeof clampX==='function')p.x=clampX(p.x)}}
 if(p.state==='claw'&&ft>=(isPow()?11.2:10.0)&&!P33.q){p.state='normal';p.combo=0;p.cool=.05;P33.a=null;stepped=0}}catch(e){console.warn('uc49',e)}};
function setMode(m){U.mode=m;try{localStorage.setItem('uc49',m)}catch(_){}const b=document.getElementById('pruc');if(b){b.textContent='UPPERCUT: '+m.toUpperCase();b.classList.toggle('cur',m==='new')}
 if(window.PRACTICE&&PRACTICE.on)say('UPPERCUT: '+m.toUpperCase(),'#ffe14d')}
U.set=setMode;
function addBtn(){const bar=document.getElementById('prbar');if(!bar||document.getElementById('pruc'))return!!bar;const b=document.createElement('button');b.className='tap i';b.id='pruc';b.title='compare the old / new uppercut (\\ key)';
 b.style.fontSize='calc(clamp(11px,3.1vh,15px)*var(--prs,1))';const r=document.getElementById('prreset');bar.insertBefore(b,r||null);
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setMode(U.mode==='new'?'old':'new');b.blur()});setMode(U.mode);return true}
if(!addBtn()){const iv=setInterval(()=>{if(addBtn())clearInterval(iv)},500)}
addEventListener('keydown',e=>{if(e.code==='Backslash'&&!e.repeat&&window.PRACTICE&&PRACTICE.on){setMode(U.mode==='new'?'old':'new')}});
})();
