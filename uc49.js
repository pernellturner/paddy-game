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
const N=[
 {f:'p/k_uc51_0',ax:61,ay:220,w:171,h:219,rx:22}, // ready
 {f:'p/k_uc51_1',ax:61,ay:215,w:171,h:214,rx:22}, // crouch-in
 {f:'p/k_uc51_2',ax:56,ay:215,w:170,h:214,rx:22}, // deep load inward fist
 {f:'p/k_uc51_3',ax:52,ay:220,w:171,h:219,rx:22}, // hips/legs start drive
 {f:'p/k_uc51_4',ax:50,ay:227,w:167,h:226,rx:22}, // bent-elbow drive
 {f:'p/k_uc51_5',ax:40,ay:215,w:118,h:214,rx:22}, // straight-arm vertical (same fist)
 {f:'p/k_uc51_6',ax:36,ay:279,w:157,h:278,rx:22}  // bent peak / more back
];
function build(){
 // step: [frame, ft where it starts] — stretched so jab→jab→uppercut is readable (FPS=12)
 // startup sets ft=2; hit window (bxpu) ~4-6 lands on straight-arm + peak
 U.seq=[
  [N[0],0],
  [N[1],1.6],
  [N[2],2.5],
  [N[3],3.5],
  [N[4],4.3],
  [N[5],4.9],   // straight-arm in hit window
  [N[6],5.7],   // bent peak follow-through
  [N[0],9.2]
 ];
 FR.uc49=U.seq.map(s=>s[0]);if(typeof A!=='undefined')A.uc49=['k_uc49',null,12,0];
 try{window.queueFrames&&queueFrames(N.map(n=>n.f),true)}catch(_){}return true}
let built=false;
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
const on=()=>act()&&p.state==='claw'&&p.anim==='bxpu'&&built;
function motion(ft){   // y: + = up; r: lean (+ = forward); s: squash/stretch (scale y) — more body in the throw
 const e=(a,b,x)=>Math.max(0,Math.min(1,(x-a)/(b-a))),sm=x=>x*x*(3-2*x);
 const dip=sm(e(.4,2.4,ft))*(1-sm(e(3.2,4.4,ft)));          // deeper/longer sink into the legs
 const rise=sm(e(4.0,5.4,ft))*(1-sm(e(7.2,9.4,ft)));        // hips drive up through straight+peak, settle later
 return{y:-10*dip+14*rise,r:-.045*dip+.04*sm(e(3.6,4.6,ft))*(1-sm(e(5.2,6.6,ft))),s:1-.045*dip+.05*rise*(1-sm(e(6,8.2,ft)))}}
const _sq=r11Sq;r11Sq=function(){let s=_sq();try{if(!built)built=build();if(on()){const ft=p.ft,i=vi(ft);sw={a:p.anim,fi:p.fi};p.anim='uc49';p.fi=i;
  // short motion smear on the drive: the previous step under the current one
  if(i>=3&&i<=6){p.fPrev=U.seq[i-1][0];p.fB=.05*Math.max(0,1-(ft-U.seq[i][1])/.7)*1.15}
  const m=motion(ft);smS+=(m.s-smS)*.5;s*=smS;U.last=[i,+ft.toFixed(2)]}else smS+=(1-smS)*.5}catch(_){}return s};
const _rb=mRunBob;mRunBob=function(){const o=_rb();try{if(sw){const m=motion(p.ft);smY+=(m.y-smY)*.5;smR+=(m.r-smR)*.5;return{y:(o.y||0)+smY,r:(o.r||0)+smR*p.face}}else{smY*=.5;smR*=.5}}catch(_){}return o};
const _fx=drawFx;drawFx=function(){if(sw){p.anim=sw.a;p.fi=sw.fi;sw=null}_fx()};   // restore before anything else reads them
// ---- logic extras in NEW mode: step in on the drive (a real uppercut steps under the guard), quick recovery ----
let stepped=0;
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{if(!on()){stepped=0;return}const ft=p.ft;
 if(ft>=3.2&&ft<5.4&&stepped<56){let near=false;for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;if(g>-20&&g<105&&Math.abs(d.y-p.y)<200)near=true}
  if(!near){const dx=Math.min(56-stepped,260*dt);stepped+=dx;p.x+=p.face*dx;if(typeof clampX==='function')p.x=clampX(p.x)}}
 if(ft>=10.4&&!P33.q){p.state='normal';p.combo=0;p.cool=.05;P33.a=null;stepped=0}}catch(e){console.warn('uc49',e)}};
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
