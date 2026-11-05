// ===================== v49: NEW BOXER'S UPPERCUT (A/B test, Practice Room only, base Paddy only) =====================
// Pernell 4 Nov 2026: the uppercut must look like a real boxer's: dip and drive through the legs, hips and shoulders, then the arm.
// NEW (default in the Practice Room): ↑ + Claw on the ground = the pink boxer uppercut (k_pw_upper, punch33's bxpu: same hit /
//   knockback / combo rules as the 7th-punch power uppercut), started from the dip so the startup is short (~0.17 s to the hit).
//   Both it and the 7th-punch uppercut play a re-timed 13-step sequence: guard, dip, deep dip, hips loaded, two NEW drive frames
//   (k_uc49_n0/n1: Paddy's own loaded frame rotated upright about his planted rear foot = legs + hips driving up, fist tight at
//   the chin), the explosion through contact, follow-through and a quick recovery; plus a body dip / rise on the toes, squash /
//   stretch (<=4%) and a short motion smear on the drive.
// OLD: exactly as before (↑ + Claw = the old leaping uppercut sheet, 7th punch = the old 11-frame timing).
// Switch: the "UPPERCUT: NEW / OLD" button in the Practice Room bar, or the \ (backslash) key. Story mode (level.html) never loads this file.
(function(){
if(typeof p==='undefined'||!window.P33||typeof uppercut!=='function')return;
const U=window.UC49={mode:(()=>{try{return localStorage.getItem('uc49')||'new'}catch(_){return 'new'}})(),n:{newUp:0},log:[]};
const act=()=>{try{return !!(window.PRACTICE&&PRACTICE.on)&&U.mode==='new'&&FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(_){return false}};
U.active=act;
// ---- frames: v51 size-normalized 7-frame boxer uppercut (Practice Room NEW only) ----
// v51 (6 Nov 2026): Pernell playtest — size-normalized 7-frame boxer uppercut (ready → crouch → load → hips →
//   bent drive → straight-arm vertical → bent peak/back). Slower timings so jab→jab→uppercut reads. Same fist
//   orientation; more body dip/rise in motion(). OLD + story unchanged.
// v52 (6 Nov 2026): Pernell - no little hop, deeper crouch, quick explosive rise; 5 in-between frames (k_uc52_12/23/34/45/56 =
//   anchor-aligned half blends of the neighbouring approved frames) and the straight-arm / peak frames re-scaled (k_uc52_5 x1.25,
//   k_uc52_6 x0.82) so Paddy stays one size through the move. Same inward fist + straight-arm beat.
//   POWER UPPERCUT (kitti48 kind 'up'): hold up+Claw (or hold Claw then up) = crouch wind-up, let go = the power sequence.
// N: r ready, c crouch-in, l deep load (inward fist), h hips drive, d bent-elbow drive, s straight-arm, k bent peak; c2/l3/h4/d5/s6 = in-betweens
const N={
 r:{f:'p/k_uc51_0',ax:61,ay:220,w:171,h:219,rx:22},
 c:{f:'p/k_uc51_1',ax:61,ay:215,w:171,h:214,rx:22},
 c2:{f:'p/k_uc52_12',ax:61,ay:215,w:175,h:216,rx:22},
 l:{f:'p/k_uc51_2',ax:56,ay:215,w:170,h:214,rx:22},
 l3:{f:'p/k_uc52_23',ax:56,ay:220,w:175,h:221,rx:22},
 h:{f:'p/k_uc51_3',ax:52,ay:220,w:171,h:219,rx:22},
 h4:{f:'p/k_uc52_34',ax:52,ay:227,w:171,h:228,rx:22},
 d:{f:'p/k_uc51_4',ax:50,ay:227,w:167,h:226,rx:22},
 d5:{f:'p/k_uc52_45',ax:50,ay:269,w:167,h:270,rx:22},
 s:{f:'p/k_uc52_5',ax:50,ay:269,w:148,h:268,rx:22},
 s6:{f:'p/k_uc52_56',ax:50,ay:269,w:149,h:270,rx:22},
 k:{f:'p/k_uc52_6',ax:30,ay:229,w:129,h:228,rx:22}
};
function build(){
 // [frame, ft where it starts] (FPS=12). startup sets ft=2; bxpu hit window = fi 4-6. Long crouch, then a very fast rise.
 U.seqTap=[[N.r,0],[N.c,1.2],[N.c2,1.7],[N.l,2.1],[N.l3,3.25],[N.h,3.45],[N.h4,3.65],[N.d,3.85],[N.d5,4.1],[N.s,4.3],[N.s6,5.1],[N.k,5.4],[N.r,9.0]];
 // power: starts from the held deep load (ft 2), longer hang at the top
 U.seqPow=[[N.r,0],[N.l,1.0],[N.l3,3.2],[N.h,3.4],[N.h4,3.6],[N.d,3.8],[N.d5,4.05],[N.s,4.25],[N.s6,5.6],[N.k,5.9],[N.r,9.6]];
 U.seq=U.seqTap;const all=[...new Set(Object.values(N))];
 FR.uc49=all;U.idx=f=>all.indexOf(f);if(typeof A!=='undefined')A.uc49=['k_uc49',null,12,0];
 try{window.queueFrames&&queueFrames(all.map(n=>n.f),true)}catch(_){}return true}
let built=false;
const isPow=()=>!!(window.KD48&&KD48.pow&&KD48.pow.kind==='up');
const isCh=()=>p.state==='kcharge'&&!!(window.KD48&&KD48.ch&&KD48.ch.kind==='up');
function vi(ft){let i=0;for(let k=0;k<U.seq.length;k++)if(ft>=U.seq[k][1])i=k;return i}
// ---- ↑ + Claw on the ground = the boxer uppercut ----
const _up=uppercut;uppercut=function(){
 const fl=typeof floorAt==='function'?floorAt(p.x):GROUND,justJ=!p.ground&&p.vy<0&&now-(p.lastJump||-9)<.25&&fl-p.y<110;
 if(!act()||!(p.ground||justJ)||p.wall)return _up.apply(this,arguments);
 if(justJ){p.y=fl;p.ground=true;p.jumps=0;p.vy=0}   // ↑ is also jump: an ↑ + Claw that just left the ground stays a ground uppercut
 p.state='normal';p.combo=p.keepT>0?p.keepCombo:(p.combo||0);p.keepT=0;p.cool=0;startClaw();
 if(p.state!=='claw')return;
 setAnim('bxpu',true);p.ft=p.fi=2;p.vx=0;p.vy=0;
 Object.assign(P33,{a:'bxpu',last:'bxpu',lastFi:2,s:2,trav:0,q:null,early:false,hitDone:false,face:p.face,legacy:false});
 if(window.W31&&W31.names.length)W31.names[W31.names.length-1]='bxpu';
 say('UPPERCUT!','#ffe14d');U.n.newUp++;U.log.push('newup')};
// ---- draw: swap in the new sequence + body motion (logic, hits and timing stay punch33's) ----
let sw=null,smY=0,smR=0,smS=1;
const on=()=>act()&&built&&((p.state==='claw'&&p.anim==='bxpu')||isCh());
function motion(ft){   // y: + = up; r: lean (+ = forward); s: squash/stretch. v52: NO hop (y never goes above 0) - deep crouch, explosive rise
 const e=(a,b,x)=>Math.max(0,Math.min(1,(x-a)/(b-a))),sm=x=>x*x*(3-2*x),P=isPow();
 if(isCh()){const L=(KD48.ch&&KD48.ch.lvl)||0,t=Math.min(1,p.t/.25);return{y:-(16+8*L)*sm(t),r:-.05-.03*L,s:1-.06*sm(t)-.02*L}}
 const D=P?24:18,r0=P?3.2:3.25;
 const dip=(P?1:sm(e(.3,2.1,ft)))*(1-sm(e(r0,r0+.75,ft)));      // sink into the legs, then snap out of it in ~60 ms
 const st=sm(e(r0+.3,r0+1.1,ft))*(1-sm(e(6.4,8.6,ft)));          // stretch tall on the drive (legs/hips), no lift
 return{y:-D*dip,r:-.05*dip+.05*sm(e(r0,r0+.6,ft))*(1-sm(e(5,6.6,ft))),s:1-.06*dip+(P?.05:.035)*st}}
const _sq=r11Sq;r11Sq=function(){let s=_sq();try{if(!built)built=build();if(on()){U.seq=isPow()?U.seqPow:U.seqTap;const ch=isCh(),ft=ch?0:p.ft,i=ch?-1:vi(ft);sw={a:p.anim,fi:p.fi};p.anim='uc49';
  const cf=ch?(p.t<.08?N.c:p.t<.16?N.c2:N.l):U.seq[i][0];p.fi=U.idx(cf);if(ch){p.fB=0;const m=motion(0);smS+=(m.s-smS)*.5;s*=smS;U.last=['ch',+p.t.toFixed(2)];return s}
  // short motion smear on the drive: the previous step under the current one
  if(i>=4&&i<=U.seq.length-3){p.fPrev=U.seq[i-1][0];p.fB=.03*Math.max(0,1-(ft-U.seq[i][1])/.35)}   // short smear on the fast rise only
  const m=motion(ft);smS+=(m.s-smS)*.5;s*=smS;U.last=[i,+ft.toFixed(2)]}else smS+=(1-smS)*.5}catch(_){}return s};
const _rb=mRunBob;mRunBob=function(){const o=_rb();try{if(sw){const m=motion(p.ft);smY+=(m.y-smY)*.5;smR+=(m.r-smR)*.5;return{y:(o.y||0)+smY,r:(o.r||0)+smR*p.face}}else{smY*=.5;smR*=.5}}catch(_){}return o};
const _fx=drawFx;drawFx=function(){if(sw){p.anim=sw.a;p.fi=sw.fi;sw=null}_fx()};   // restore before anything else reads them
// ---- logic extras in NEW mode: step in on the drive (a real uppercut steps under the guard), quick recovery ----
let stepped=0;
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{if(!on()){stepped=0;return}const ft=p.ft;
 if(ft>=3.2&&ft<5.4&&stepped<56&&p.state==='claw'){let near=false;for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;if(g>-20&&g<105&&Math.abs(d.y-p.y)<200)near=true}
  if(!near){const dx=Math.min(56-stepped,260*dt);stepped+=dx;p.x+=p.face*dx;if(typeof clampX==='function')p.x=clampX(p.x)}}
 if(ft>=(isPow()?11:10.4)&&!P33.q){p.state='normal';p.combo=0;p.cool=.05;P33.a=null;stepped=0}}catch(e){console.warn('uc49',e)}};
// ---- the A/B switch ----
function setMode(m){U.mode=m;try{localStorage.setItem('uc49',m)}catch(_){}const b=document.getElementById('pruc');if(b){b.textContent='UPPERCUT: '+m.toUpperCase();b.classList.toggle('cur',m==='new')}
 if(window.PRACTICE&&PRACTICE.on)say('UPPERCUT: '+m.toUpperCase(),'#ffe14d')}
U.set=setMode;
function addBtn(){const bar=document.getElementById('prbar');if(!bar||document.getElementById('pruc'))return!!bar;const b=document.createElement('button');b.className='tap i';b.id='pruc';b.title='compare the old / new uppercut (\\ key)';
 b.style.fontSize='calc(clamp(11px,3.1vh,15px)*var(--prs,1))';const r=document.getElementById('prreset');bar.insertBefore(b,r||null);
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setMode(U.mode==='new'?'old':'new');b.blur()});setMode(U.mode);return true}
if(!addBtn()){const iv=setInterval(()=>{if(addBtn())clearInterval(iv)},500)}
addEventListener('keydown',e=>{if(e.code==='Backslash'&&!e.repeat&&window.PRACTICE&&PRACTICE.on){setMode(U.mode==='new'?'old':'new')}});
})();
