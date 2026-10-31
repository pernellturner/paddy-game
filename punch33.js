// ===================== v33: BASE PADDY PUNCH STRINGS (approved on-model set) =====================
// Art: generated/paddy_strings/string_*.jpg + generated/paddy_power/power_*.jpg, cut by src/cut_power.py (k_ps_* / k_pw_*), 12 fps.
// String punches share one guard (peek-a-boo) as frame 1 and 7, so any punch can follow any other (COMBO_NOTES.md):
//   press buffered from the impact frame (4) on; cancel at the END of frame 6; the next punch starts at ITS frame 2 (frame 7 is
//   never played twice); its frame 1 sits where this punch's frame 7 would have been (root motion from the _roots.txt).
//   Last punch: play frame 7, then string_recover frames 2-3 back to the upright guard.
// What a tap throws (player-built strings):   Claw = the next number of the 1-2-3-4 string (1 jab -> 2 cross -> 3 hook -> 4 body -> 1 ...)
//   → (toward the enemy) + Claw = JAB (a second jab in a row is the slipping jab 1')     ↓ + Claw = BODY SHOT     ↑/Jump + Claw = SKY SWIPE
//   so 1-2 = C C · 1-1-2 = →C →C C · 1-2-3-4 = C C C C ...
// The 8-hit timed combo stays: hits 1-3 any rhythm; from the 3rd hit on, press ON THE BEAT (the ring goes green = the impact frame
//   onwards: one press on or after the hit, not a mash before it) and hits 4-6 become POWER punches (power jab / hook / body), hit 7 is the POWER UPPERCUT (pops him up) and an on-beat
//   8th press is the finisher (ground Bunny Kick barrage, or the aerial finisher when it ends in the air).
//   Off the beat the string just carries on as normal punches (up to 8) and ends with the recovery.
(function(){
if(typeof SM!=='function'||typeof CLAWS==='undefined'||!window.K29EXT)return;
const base=()=>{try{return FORM()===0}catch(_){return false}};
const rnow=()=>performance.now()/1000;
const W31=window.W31=window.W31||{upT:0,upD:null,hits:{},names:[]};W31.hits=W31.hits||{};W31.names=W31.names||[];
// anim: [sheet, kind, name, colour, impact first, impact last, cancel (last frame before the neutral), neutral, power?]
const PD={
 bxj1:['k_ps_jab1','jab','JAB!','#ffffff',3,4,5,6,0], bxj2:['k_ps_jab2','jab','JAB!','#ffffff',3,4,5,6,0],
 bxx:['k_ps_cross','cross','CROSS!','#bfe8ff',3,4,5,6,0], bxlh:['k_ps_lhook','hook','LEFT HOOK!','#bfe8ff',3,4,5,6,0],
 bxrb:['k_ps_rbody','body','BODY SHOT!','#ffb040',3,4,5,6,0],
 bxpj:['k_pw_jab','jab','POWER JAB!','#ffe9a8',4,6,7,8,1], bxph:['k_pw_hook','hook','POWER HOOK!','#9fe8ff',4,6,7,8,1],
 bxpb:['k_pw_body','body','POWER BODY!','#ffb040',4,6,7,8,1], bxpu:['k_pw_upper','upper','UPPERCUT!','#ffe14d',4,6,8,9,1],
 bxrec:['k_ps_rec','rec','','#fff',-1,-1,9,9,0]};
const FPS=12,RS=(typeof SC!=='undefined'&&SC)||.8;   // root offsets are frame px; frames draw at SC
const NEW={};for(const a in PD)NEW[a]=[FPS,0,PD[a][0]];
// leftover users of the old claw anim names (finish-him pose, route moves) get on-model frames too
Object.assign(NEW,{pc1:[FPS,0,'k_ps_jab1'],pc2:[FPS,0,'k_ps_cross'],pc3:[FPS,0,'k_ps_cross'],pc4:[FPS,0,'k_ps_jab2'],pc5:[FPS,0,'k_ps_lhook'],pc6:[FPS,0,'k_ps_rbody'],pc7:[FPS,0,'k_pw_upper'],pc8:[FPS,0,'k_pw_body']});
SM(0,'',NEW);for(const k in NEW){const v=NEW[k];A[k]=[v[2],null,v[0],0];if(window.SMOOTH)SMOOTH.DONE.delete(k)}
for(const a in PD)delete window.K29EXT[a];
Object.assign(NAMES,{bxj1:'JAB!',bxj2:'JAB!',bxx:'CROSS!',bxlh:'LEFT HOOK!',bxrb:'BODY SHOT!',bxpj:'POWER JAB!',bxph:'POWER HOOK!',bxpb:'POWER BODY!',bxpu:'UPPERCUT!'});
// knockback [x, y, ...]: jabs barely push so strings keep connecting; body shots and power punches drive him back; the uppercut pops him up
Object.assign(KB,{bxj1:[60,-50,0,.05],bxj2:[60,-50,0,.05],bxx:[110,-80,0,.06],bxlh:[120,-100,0,.065],bxrb:[240,-160,.08,.09],
 bxpj:[220,-170,.06,.08],bxph:[240,-220,.08,.09],bxpb:[320,-220,.1,.1],bxpu:[60,-640,.45,.11]});
Object.assign(REACH,{bxj1:[195,165],bxj2:[195,170],bxx:[200,165],bxlh:[185,160],bxrb:[195,130],bxpj:[215,165],bxph:[195,160],bxpb:[210,130],bxpu:[150,300]});
const FX={jab:[2,.03,4],cross:[4,.045,6],hook:[5,.05,7],body:[7,.07,10],upper:[13,.1,14]};   // shake, game hitstop, sparks
const P33=window.P33={on:false,a:null,last:'',q:null,beat:true,rec:false,str:[],hits:{},vox:0,log:[],
 own(){return base()&&p.state==='claw'&&!!PD[p.anim]&&!this.legacy}};
const fr=a=>(F&&F[PD[a][0]])||[];
const rx=(a,i)=>{const L=fr(a);const f=L[Math.max(0,Math.min(L.length-1,i))];return f&&f.rx||0};
// ---- which punch a tap throws ----
const POWER={jab:'bxpj',cross:'bxph',hook:'bxph',body:'bxpb'};   // the cross has no power sheet: it becomes the power hook
const NEXT={'':'bxj1',jab:'bxx',cross:'bxlh',hook:'bxrb',body:'bxj1',upper:'bxj1',rec:'bxj1'};
function pick(inp,n,beat){const lastK=P33.last?PD[P33.last][1]:'';let a;
 if(inp.down)a='bxrb';else if(inp.fwd)a=(lastK==='jab'&&P33.last==='bxj1')?'bxj2':'bxj1';else a=NEXT[lastK]||'bxj1';
 if(n===7&&beat)return 'bxpu';                         // hit 7 on the beat: the power uppercut
 if(n>=4&&n<=6&&beat)return POWER[PD[a][1]]||a;        // hits 4-6 on the beat: the power version of the punch you threw
 return a}
function readInp(){const f=p.face>0?K.right:K.left;return{down:!!K.down,fwd:!!f}}
// ---- start a punch (wraps startClaw so the game's own opener goes through here too) ----
let pend=null;   // {a, s} set by our continuation; null = the game opened a fresh string
const _sc=startClaw;startClaw=function(){if(!base())return _sc.apply(this,arguments);
 const n=Math.min(8,p.combo+1),fresh=!pend||p.combo===0;
 let a,s;if(pend&&!fresh){a=pend.a;s=pend.s}else{P33.last='';P33.beat=true;P33.str=[];a=pick(readInp(),1,false);s=0;P33.rec=false}
 pend=null;const c=CLAWS[n];Object.assign(c,{a,nm:PD[a][2],col:PD[a][3],sp:PD[a][3],lunge:0,k:'flat'});
 const n0=(window.K29&&K29.imp.length)||0;const prevF=(FR[p.anim]||[])[p.fi],px=p.x;
 _sc.apply(this,arguments);
 if(window.K29&&K29.imp.length>n0)K29.imp.splice(n0).forEach(o=>{if(!o.streak)K29.imp.push(o)});   // no straight claw streaks: the sheets carry their own trails
 if(p.state!=='claw')return;
 p.vy=p.ground?0:p.vy;p.vx=0;
 if(p.anim==='pcup'){P33.legacy=true;P33.last='';P33.a=null;return}    // ↑ + Claw: kitty29's sky swipe, old timing
 P33.legacy=false;
 if(p.anim!==a)setAnim(a,true);
 p.ft=s;p.fi=s;if(s>0){p.blend=0;p.prevF=null}   // cancels never crossfade (that would double the pose)
 P33.a=a;P33.s=s;P33.q=null;P33.early=false;P33.hitDone=false;P33.lastFi=s;P33.trav=0;P33.face=p.face;P33.last=a;P33.str.push(a);if(P33.str.length>12)P33.str.shift();
 W31.names.push(a);if(W31.names.length>24)W31.names.shift()};
// root jump for a cancel: the next punch's frame 1 sits where this punch's neutral would have been
function rootJump(prevA,fromFi,nextA,s){const d=(rx(prevA,PD[prevA][7])-rx(prevA,fromFi))+rx(nextA,s)-rx(nextA,0);move(d*RS)}
const LIM=a=>PD[a][8]?80:60;   // max travel (world px) per punch, so a long string can't skate across the arena
function move(dx){if(!dx)return;let d=p.face*dx;
 if(d*p.face>0){for(const q of dummies){if(!q.alive||q.benched)continue;const g=(q.x-p.x)*p.face;if(g>-20&&g<92&&Math.abs(q.y-p.y)<160){d=0;break}}}  // don't walk through the enemy
 if(P33.a&&d*p.face>0){const room=LIM(P33.a)-P33.trav;if(room<=0)d=0;else if(Math.abs(d)>room)d=p.face*room;P33.trav+=Math.abs(d)}
 p.x+=d;if(typeof clampX==='function')p.x=clampX(p.x)}
// ---- per frame: input, root motion, cancels, recovery ----
function tick(dt){if(!base()){P33.on=false;return}
 if(p.state!=='claw'){P33.a=null;P33.legacy=false;return}
 if(P33.legacy){if(p.anim!=='pcup'){P33.legacy=false}else return}
 const a=p.anim,D=PD[a];if(!D)return;P33.on=true;
 if(p.face!==P33.face){P33.face=p.face;P33.lastFi=p.fi;P33.trav=0}       // turned round mid-punch (kitty29 restarts the punch)
 if(p.fi!==P33.lastFi){if(p.fi>P33.lastFi)move((rx(a,p.fi)-rx(a,P33.lastFi))*RS);P33.lastFi=p.fi}
 p.vx=0;
 const fi=p.fi,ft=p.ft+dt*FPS,L=fr(a).length||D[7]+1;   // ft = where this update's animation step will land, so a cancel replaces the neutral instead of flashing it
 // finisher button mid-string still works
 if(P.finisher&&p.combo>=2){delete P.finisher;finisher();return}
 if(P.attack){delete P.attack;acted=true;
  if(a==='bxrec'){P33.q={t:now,inp:readInp(),beat:false,fresh:true}}
  else{const on=fi>=D[4]&&!P33.early;if(fi<D[4])P33.early=true;   // on the beat = one press, on or after the impact frame; mashing before the hit doesn't count
   P33.q={t:now,inp:readInp(),beat:on}}}
 if(a==='bxrec'){if(P33.q){P33.q=null;p.combo=0;pend=null;startClaw();return}
  if(ft>=3){p.state='normal';p.combo=0;p.cool=.04;P33.a=null}return}
 const q=P33.q;
 if(q&&ft>=D[6]+1){   // cancel point reached: throw the next punch from its frame 2
  P33.q=null;const n=p.combo+1;
  if(p.combo>=3)P33.beat=P33.beat&&q.beat;
  if(a==='bxpu'){if(P33.beat&&q.beat){say('PERFECT!','#7fffd4',true);bunnyKick();return}}
  if(n>8){toRecover(a,fi);return}
  const na=pick(q.inp,n,P33.beat&&p.combo>=3&&q.beat);
  if(P33.beat&&q.beat&&p.combo>=3){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false})}
  else if(p.combo>=3&&!q.beat)p.miss=true;   // off the beat: no route opener / power build, the string carries on
  rootJump(a,fi,na,1);pend={a:na,s:1};startClaw();return}
 // the uppercut's on-beat 8th press fires the finisher as soon as the punch is through its impact
 if(q&&a==='bxpu'&&q.beat&&P33.beat&&fi>=D[5]+1){P33.q=null;say('PERFECT!','#7fffd4',true);bunnyKick();return}
 if(!q&&ft>=L){   // no input: last punch played to its neutral -> recovery (power punches already end upright)
  if(D[8]){p.state='normal';p.combo=0;p.cool=.04;P33.a=null}else toRecover(a,L-1)}}
function toRecover(a,fi){const prev=a;rootJump(prev,Math.min(fi,PD[prev][7]),'bxrec',1);setAnim('bxrec',true);p.ft=1;p.fi=1;p.blend=0;p.prevF=null;P33.a='bxrec';P33.lastFi=1;P33.trav=0;P33.q=null}
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{tick(dt)}catch(e){console.warn('p33',e)}};
// ---- hits land on the impact frames only ----
const _mh=meleeHits;meleeHits=function(dt){if(base()&&p.state==='claw'&&PD[p.anim]){const D=PD[p.anim];if(D[4]<0||p.fi<D[4]||p.fi>D[5]+(D[8]?0:1))return}return _mh(dt)};
// the old claw slash arcs don't belong on punches
const _cf=clawFx;clawFx=function(){if(base()&&p.state==='claw'&&PD[p.anim])return;return _cf.apply(this,arguments)};
// ---- impact: tier-sized shake / sparks, uppercut pop-up remembered for the finisher grab, effort grunt or hiss on big hits ----
const HISS=['pvo_hiss1','pvo_hiss2','pvo_hiss3'];let hissN=0;
const snd=(k,o)=>{try{window.SND&&SND.play&&SND.play(k,o||{})}catch(_){}};
function effort(kind,pow){const t=rnow();if(t-P33.vox<(pow?.55:.9))return;const pr=kind==='upper'?1:pow?.7:kind==='jab'?0:.45;if(Math.random()>pr)return;P33.vox=t;
 if(kind==='upper'&&window.W30&&W30.voxFn&&Math.random()<.6){W30.voxFn('grunt',1,true);P33.log.push('grunt');return}
 if(Math.random()<.55){const k=HISS[hissN++%HISS.length];snd(k,{v:.7,r:.95+Math.random()*.12,gap:.2});P33.log.push(k)}
 else if(window.W30&&W30.voxFn){W30.voxFn('grunt',1,true);P33.log.push('grunt')}if(P33.log.length>30)P33.log.shift()}
const _hd=hitDummy;hitDummy=function(d,move,dir){const r=_hd.apply(this,arguments);
 try{const D=PD[move];if(base()&&D&&d){const k=D[1],pw=D[8]||k==='body'||k==='upper',fx=FX[k]||FX.jab;W31.hits[move]=(W31.hits[move]||0)+1;
  shake=Math.max(shake,fx[0]+(D[8]?3:0));hitstop=Math.max(hitstop,fx[1]+(D[8]?.02:0));
  const x=d.x-p.face*Math.min(40,(d.h||130)*.22),y=Math.max(d.y-(d.h||130)*.9,Math.min(d.y-15,p.y-(k==='upper'?190:k==='body'?60:115)));
  for(let i=0;i<fx[2];i++){const an=(p.face>0?0:Math.PI)+(Math.random()-.5)*2.2+(k==='upper'?-1.3*p.face:0),v=200+Math.random()*(pw?420:240);sparks.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:.25,c:i%2?'#fff':D[3]})}
  if(pw)waves.push({x,y,r:14,l:.6,big:k==='upper'});
  if(k==='upper'){W31.upT=rnow();W31.upD=d;flashT=Math.max(flashT,.06)}
  if(k!=='jab'||D[8])effort(k,D[8])}}catch(_){}return r};
// ---- the beat ring: green from the frame where an on-beat press counts ----
const _cue=cueInfo;cueInfo=function(){if(P33.own()&&p.combo>=3&&p.combo<8&&P33.beat&&!p.miss){const D=PD[p.anim];if(D[4]<0)return null;return{H:(D[4]-(P33.s||0))/FPS+.2}}return _cue()};
// routes (CCCB, CCCM, CCCTT, CCCCCT ...): a press already buffered for the next punch counts, so a quick C-C-C-B still opens the route
// even though each punch is a full 12 fps move; the special button is never 'too early' once the 3rd Claw is in
const _op=openerNow;openerNow=function(){if(P33.own()&&p.anim!=='bxrec'){const n=p.combo+(P33.q?1:0);if(n>=3&&!p.miss)return{run:'C'.repeat(Math.min(n,8)),W:.07,E:.7}}return _op()};
// 'JUGGLE!' used to land a tick after the move name and replace it: keep the move name; rank words wait for the punch name
let lastSay=0,lastTxt='';const _say=say;say=function(t){if(t==='JUGGLE!'&&base()&&((rnow()-lastSay<.6&&lastTxt!=='JUGGLE!')||p.state==='claw'||p.state==='bunny'))return;
 if(/^(NICE|AWESOME|PURRFECT|LEGENDARY)!$/.test(t||'')&&base()&&p.state==='claw'&&rnow()-lastSay<.5){const a=arguments;setTimeout(()=>{if(p.state!=='bunny')_say.apply(null,a)},450);return}
 lastSay=rnow();lastTxt=t;return _say.apply(this,arguments)};
// ---- preload every punch frame first for base Paddy ----
let asked=false;const _pre2=r9Pre;r9Pre=function(dt){try{if(!asked&&window.queueFrames&&F&&F.k_ps_jab1){asked=true;const L=[];for(const a in PD)fr(a).forEach(q=>L.push(q.f));queueFrames([...new Set(L)],true)}}catch(_){}_pre2(dt)};
window.BOX33=true;
})();
