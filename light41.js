// ===================== v41: LIGHT PADDY (rebuilds the LIGHT PADDY form slot, form 6 / p.uf===2) =====================
// Art: generated/forms/07_light_paddy/sheets (#FF00FF magenta key: the light blade is lime green, so the green copies are NOT used)
// cut by src/cut_light.py -> lt_* in frames.json, 12 fps, one form scale (K=0.3700, light idle = base idle height).
// Engine and cancel rules = gunslinger40.js / pirate39.js (own state 'lt', own LT0 object).
// Calm, flowing, graceful light monk: one glowing light blade plus open-palm pushes (blade switched off), wide sleeves trailing every
// move; every strike flows out on a long lunge and ends on a blade twirl. Family friendly: a "light blade" swing (light_swing) on the
// cuts, a soft cloth whump on the palms, minimal FX only (nothing fired, no lightning).
// The other legend forms share the uf* functions: every hook here only takes over while Light Paddy is the form.
// Controls (keyboard / touch):
//   Claw (X / 🐾)        = next of the 1-2-3-4 string: FALLING CUT -> RISING ARC -> SPIN CUT -> PALM PUSH -> ...
//   → + Claw            = falling cut (a second → + Claw in a row = TWIRL THRUST, the 1' of 1-1-2)
//   ↓ + Claw            = SPIN ARC                     ↑ / Jump + Claw = RISING LIGHT launcher (ends in the air)
//   Tail (T)            = DOUBLE PALM PUSH             Meow (C)        = BLADE PARRY (parry + step-in palm strike)
//   Blink (N / Ctrl)    = GLIDE DASH dash-in (in the air: air glide)   double-tap ← / → = glide dash that way
//   hold 🛡 / B          = block (upright blade)        tap 🛡 / O       = dodge (duck under)
//   block / dodge right as a hit lands = COUNTER; Claw while blocking = blade parry counter
//   in the air: Claw = AIR FALLING SLASH -> AIR SPIN SWEEP -> FALLING STAR spike (lands); ↓ (+ Claw) = falling star
//   8-hit timed string: hits 1-3 any rhythm, then on the beat; hit 7 on the beat = SPIN ARC, an on-beat 8th press = DAWN BLOOM finisher.
(function(){
if(typeof SM!=='function'||typeof ufMoves!=='function'||typeof A==='undefined')return;
const isL=()=>{try{return FORM()===6&&p.uf===2}catch(_){return false}};
const FPS=12,RS=(typeof SC!=='undefined'&&SC)||.8;
const V1='#fff2a8',V2='#7dff6a';
const MV={
 l1:['light','FALLING CUT!','#ffffff',0,1], l2:['light','RISING ARC!','#d8ffd0',0,1], l3:['light','SPIN CUT!','#7dff6a',0,1],
 l4:['light','PALM PUSH!','#fff2a8',0,1], l5:['light','TWIRL THRUST!','#b8ff9a',0,1],
 h1:['heavy','SPIN ARC!','#7dff6a',0,2], h2:['heavy','DOUBLE PALM PUSH!','#fff2a8',0,2], launch:['launch','RISING LIGHT!','#7dff6a',0,2],
 a1:['air','AIR FALLING SLASH!','#ffffff',1,1], a2:['air','AIR SPIN SWEEP!','#d8ffd0',1,1], a3:['spike','FALLING STAR!','#7dff6a',1,2],
 blink:['blink','GLIDE DASH!',V2,0,0], blinka:['blink','AIR GLIDE!',V2,1,0], block:['block','',V2,0,0], dodge:['dodge','',V2,0,0],
 counter:['counter','BLADE PARRY!','#7fffd4',0,2], fin:['fin','DAWN BLOOM!!','#fff2a8',0,3]};
const LT0=window.LT0={k:null,s:0,q:null,lastFi:0,Y0:0,n:0,beat:true,early:false,hit:{},sfx:{},trav:0,face:1,last:'',str:[],airN:0,
 blkHit:0,bT:0,cool:0,log:[],hits:{},moves:[],
 own(){return isL()&&p.state==='lt'&&!!MV[this.k]}};
const fr=k=>(F&&F['lt_'+k])||[];
const at=(k,i)=>{const L=fr(k);return L[Math.max(0,Math.min(L.length-1,i))]||{}};
const RXFIX={};
const a3L=()=>{const L=fr('a3');for(let i=0;i<L.length;i++)if(L[i].p==='land')return i;return 6};
const rx=(k,i)=>(k==='a3'&&i>a3L())?(at(k,a3L()).rx||0):(RXFIX[k]&&RXFIX[k][i]!=null?RXFIX[k][i]:(at(k,i).rx||0));
const ly=(k,i)=>at(k,i).ly||0;
const finI=()=>{const L=fr('fin');let j=5;for(let i=0;i<L.length;i++)if(L[i].hit===1)j=i;return j};
const hitF=k=>{const L=fr(k);for(let i=0;i<L.length;i++)if(L[i].hit===1)return i;return -1};
const WALKSTEP=15;   // walk sheet: ~91 frame px of travel per 6-frame cycle
const lastF=k=>Math.max(0,fr(k).length-1);
// ---------- animation table: the new moves + every old lp_* anim pointed at on-model light frames ----------
const NEW={};for(const k in MV)NEW['lt_'+k]=['lt_'+k,null,FPS,0];
Object.assign(NEW,{lt_idle:['lt_idle',null,8,1],lt_ready:['lt_ready',null,FPS,0],lt_walk:['lt_walk',null,FPS,1],lt_victory:['lt_victory',null,8,0],
 lt_rec:['lt_ready',[2,1,0],10,0]});
function remapOld(a){const n=a.replace(/^lp_/,'');
 if(n==='idle'||n==='calm')return NEW.lt_idle;if(n==='run')return ['lt_walk',null,16,1];
 if(/^(rise|apex|jump|fall|hurt|leap|djump)$/.test(n))return ['lt_a1',[0],1,1];
 if(n==='land')return ['lt_dodge',[4,5],12,0];if(n==='victory'||n==='m_taunt')return NEW.lt_victory;
 if(/^(meowc|meow|meow2|charge|m_charge)$/.test(n))return ['lt_fin',[1,2],8,0];if(n==='counter')return ['lt_counter',[2,3,4,5],12,0];
 if(n==='dive'||n==='m_airrain'||n==='m_stomp')return ['lt_a3',[3,4],12,0];if(n==='launch'||n==='m_juggle')return ['lt_launch',[2,3,4,5],14,0];if(n==='blink'||n==='m_rocket')return ['lt_blink',[2,3,4],14,0];
 if(/^air/.test(n)||n==='m_spinshot'||n==='m_fireworks')return ['lt_a1',[1,2,3,4],14,0];if(/^(tail|tail2|m_twosome|m_kickshot)$/.test(n))return ['lt_h2',[2,3,4,5],14,0];
 if(/^ult/.test(n)||n==='m_storm')return ['lt_fin',[3,4,5,6,7,8],10,0];if(n==='m_rapid')return ['lt_h1',[4,5,6,7],14,1];
 if(n==='rec')return ['lt_ready',[2,1,0],10,0];if(/^combo/.test(n)||n==='special')return ['lt_l1',[1,2,3,4,5],14,0];
 const H={h1:'l1',h2:'l2',h3:'l3',h4:'l4',h5:'l5',h6:'h1',h7:'h2'}[n];if(H)return ['lt_'+H,[1,2,3,4,5],14,0];
 return ['lt_l2',[1,2,3,4],14,0]}
const OLD={};for(const a of Object.keys(A))if(/^lp_/.test(a))OLD[a]=remapOld(a);
['lp_hurt','lp_dive','lp_victory','lp_rec','lp_fall','lp_rise','lp_idle','lp_run','lp_jump','lp_land'].forEach(a=>{if(!OLD[a])OLD[a]=remapOld(a)});
const ALL=Object.assign({},OLD,NEW);
for(const a in ALL)A[a]=ALL[a];
try{for(const a of Object.keys(SMOOTH.SMA))if(/^lp_/.test(a)){delete SMOOTH.SMA[a];SMOOTH.DONE.add(a)}}catch(_){}
try{if(typeof UPG!=='undefined')for(const a of Object.keys(UPG))if(/^lp_/.test(a))delete UPG[a]}catch(_){}
const frOf=v=>{const L=F&&F[v[0]];if(!L)return null;return v[1]?v[1].filter(i=>i<L.length).map(i=>L[i]):L};
const MYFR={};
function enforce(){if(!F||!F.lt_idle)return;for(const a in ALL){const want=ALL[a];if(A[a]!==want)A[a]=want;if(!MYFR[a]){const f=frOf(want);if(f&&f.length)MYFR[a]=f}if(MYFR[a]&&FR[a]!==MYFR[a]&&p.anim!==a)FR[a]=MYFR[a]}}
Object.assign(NAMES,{lt_l1:'FALLING CUT!',lt_l2:'RISING ARC!',lt_l3:'SPIN CUT!',lt_l4:'PALM PUSH!',lt_l5:'TWIRL THRUST!',lt_h1:'SPIN ARC!',lt_h2:'DOUBLE PALM PUSH!',
 lt_launch:'RISING LIGHT!',lt_a1:'AIR FALLING SLASH!',lt_a2:'AIR SPIN SWEEP!',lt_a3:'FALLING STAR!',lt_counter:'BLADE PARRY!',lt_fin:'DAWN BLOOM!!'});
Object.assign(KB,{lt_l1:[45,-60,0,.05],lt_l2:[50,-70,0,.05],lt_l3:[60,-80,0,.05],lt_l4:[90,-80,0,.05],lt_l5:[70,-80,0,.05],
 lt_h1:[110,-260,.12,.06],lt_h2:[300,-260,.08,.085],lt_launch:[50,-760,.55,.08],lt_a1:[70,-230,.4,.05],lt_a2:[110,-240,.4,.055],
 lt_a3:[160,900,0,.09],lt_counter:[380,-380,.2,.1],lt_fin:[480,-1150,.6,.16]});
const BOX={light:[195,95,95],heavy:[225,70,110],launch:[200,140,150],air:[185,80,120],spike:[175,60,150],counter:[225,95,110],fin:[210,140,190]};
const LIM={light:70,heavy:130,launch:100,air:120,spike:90,counter:120,fin:420,blink:520,block:30,dodge:90};
// ---------- helpers ----------
const snd=(k,o)=>{try{window.SND&&SND.play&&SND.play(k,o||{})}catch(_){}};
const swing=v=>snd(Math.random()<.5?'light_swing1':'light_swing2',{v:v||.45,r:.95+Math.random()*.15,gap:.05});   // the light blade's vwoom
const rnd=a=>a[Math.floor(Math.random()*a.length)];let hissN=0;
function effort(cue){LT0.log.push(cue);if(LT0.log.length>40)LT0.log.shift();
 if(cue==='hup')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.42,r:1.18+Math.random()*.1,gap:.18});
 else if(cue==='GRUNT')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.8,r:.98,gap:.2});
 else if(cue==='hiss')snd(['pvo_hiss1','pvo_hiss2','pvo_hiss3'][hissN++%3],{v:.55,r:1.1,gap:.2});
 else if(cue==='HISS')snd('pvo_hiss2',{v:.9,r:.92,gap:.2});
 else if(cue==='BIG GRUNT'){snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:1,r:.84,gap:.2});snd('pvo_growl1',{v:.5,gap:.3})}}
function floorY(){return typeof floorAt==='function'?floorAt(p.x):GROUND}
function target(range,airOnly){let best=null,bd=range;for(const d of dummies){if(!d.alive||d.benched)continue;if(airOnly&&d.y>GROUND-30)continue;
 const dd=Math.abs(d.x-p.x)+((d.x-p.x)*p.face<0?140:0)+(airOnly?Math.abs(d.y-p.y)*.5:0);if(dd<bd){bd=dd;best=d}}return best}
function move(dx,glide){if(!dx)return;let d=p.face*dx*LT0.mul;const K0=MV[LT0.k][0];
 if(d*p.face>0&&K0!=='blink'&&K0!=='fin'){for(const q of dummies){if(!q.alive||q.benched)continue;const g=(q.x-p.x)*p.face;if(g>-20&&g<88&&Math.abs(q.y-p.y)<150){d=0;break}}}
 const room=(LIM[K0]||80)-LT0.trav;if(room<=0)d=0;else if(Math.abs(d)>room)d=Math.sign(d)*room;LT0.trav+=Math.abs(d);
 if(glide){LT0.pend=(LT0.pend||0)+d;LT0.prate=Math.max(Math.abs(LT0.pend)*FPS,60);return}
 p.x+=d;if(typeof clampX==='function')p.x=clampX(p.x)}
// root motion of one drawn frame is spread over that frame (the big kitty lunges / pounces would otherwise jump 60-75 px in one go)
function glide(dt){if(!LT0.pend)return;const st=Math.sign(LT0.pend)*Math.min(Math.abs(LT0.pend),LT0.prate*dt);p.x+=st;LT0.pend-=st;if(Math.abs(LT0.pend)<.01)LT0.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}
function flush(){if(LT0.pend){p.x+=LT0.pend;LT0.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}}
// a direction tapped together with Claw counts even if it was let go a moment before the press is read (hit-stop holds the update)
const KTT={right:-9,left:-9,down:-9,up:-9};(function poll(){try{const t=performance.now()/1000;if(K.right)KTT.right=t;if(K.left)KTT.left=t;if(K.down)KTT.down=t;if(K.up||K.jump)KTT.up=t}catch(_){}requestAnimationFrame(poll)})();
const held=(k)=>performance.now()/1000-KTT[k]<.16;
function readInp(){const f=p.face>0?'right':'left',b=p.face>0?'left':'right',turned=performance.now()/1000-(LT0.turnT||-9)<.25;return{down:held('down'),up:held('up'),fwd:!turned&&held(f),back:held(b)}}
// ---------- which move a press throws ----------
const NEXT={'':'l1',l1:'l2',l2:'l3',l3:'l4',l4:'l1',l5:'l2',h1:'l1',h2:'l1',counter:'l2',blink:'l1',dodge:'l1',block:'counter',a3:'l1',fin:'l1',launch:'a1',a1:'a2',a2:'a3',blinka:'a1'};
function pickC(inp,air,n,beat){
 if(air){if(inp.down||LT0.airN>=2)return 'a3';return LT0.last==='a1'?'a2':LT0.last==='a2'?'a3':'a1'}
 if(n===7&&beat)return 'h1';                                   // 8-hit string: hit 7 on the beat is the low sweep
 if(LT0.k==='block')return 'counter';
 if(inp.up)return 'launch';if(inp.down)return 'h1';if(inp.fwd)return LT0.last==='l1'?'l5':'l1';
 return NEXT[LT0.last||'']||'l1'}
function pick(q,n,beat){const inAir=LT0.k?(LT0.k==='launch'||(MV[LT0.k][3]&&LT0.k!=='a3')):!p.ground;
 if(q.b==='B')return inAir?'blinka':'blink';if(q.b==='G')return inAir?null:'block';if(q.b==='O')return inAir?null:'dodge';
 if(q.b==='M')return inAir?'a2':'counter';if(q.b==='T')return inAir?'a2':'h2';
 return pickC(q.inp,inAir,n,beat)}
// ---------- start a move ----------
function start(k,s,o){o=o||{};const prev=LT0.k,M=MV[k];if(!fr(k).length)return false;flush();
 const fromAir=prev?(prev==='launch'||(MV[prev][3]&&prev!=='a3')):!p.ground;
 p.state='lt';p.t=0;p.vx=0;p.vy=0;p.wall=false;acted=true;p.shot=false;p.queued=false;
 if(typeof tokAct==='function'&&(M[0]==='light'||M[0]==='heavy'&&k!=='h2'||M[0]==='air'||M[0]==='spike'||M[0]==='launch'))tokAct('claw');
 if(k==='h2'&&typeof tokAct==='function')tokAct('tailwhip');
 setAnim('lt_'+k,true);p.ft=s;p.fi=s;if(s>0||o.cut){p.blend=0;p.prevF=null}
 LT0.k=k;LT0.s=s;LT0.q=null;LT0.early=false;LT0.hit={};LT0.sfx={};LT0.lastFi=s;LT0.trav=0;LT0.face=p.face;LT0.mul=1;LT0.fall=false;LT0.t0=now;
 if(M[3]){   // air move: keep the current baseline, or set it so frame s sits where Paddy is now
  if(!(prev&&fromAir))LT0.Y0=p.y+ly(k,s)*RS;
  LT0.Yt=LT0.Y0;const d=target(420,true);if(d&&M[0]!=='blink'){const want=d.y+ly(k,s)*RS+10;LT0.Yt=LT0.Y0+Math.max(-150,Math.min(150,want-LT0.Y0))}
 }else{LT0.Y0=o.fromAir?Math.min(floorY(),p.y+ly(k,s)*RS):floorY();LT0.Yt=LT0.Y0}
 // blinks and the finisher's dash close the real gap to the enemy (scale the drawn travel to land just in front of him)
 if(M[0]==='blink'||k==='fin'){const d=target(k==='blinka'?520:620,k==='blinka');const tr=k==='fin'?rx(k,finI())-rx(k,s):rx(k,lastF(k))-rx(k,s);
  if(d&&tr>0){if(Math.abs(d.x-p.x)>25)p.face=d.x>=p.x?1:-1;LT0.face=p.face;const gap=Math.abs(d.x-p.x)-(k==='fin'?95:80);LT0.mul=Math.max(.15,Math.min(1.6,gap/(tr*RS)));
   if(k==='blinka'&&d.y<GROUND-30){LT0.Yt=LT0.Y0+Math.max(-160,Math.min(160,(d.y+ly(k,0)*RS+10)-LT0.Y0))}}
  else LT0.mul=k==='fin'?.25:1;
  if(M[0]==='blink'){p.inv=Math.max(p.inv,.3);puffShadow(p.x,p.y)}}
 if(k==='counter'){const d=target(300);const tr=rx(k,3)-rx(k,s);if(d&&tr>0){const gap=Math.abs(d.x-p.x)-110;LT0.mul=Math.max(.6,Math.min(4,gap/(tr*RS)))}}   // the counter palm steps in to reach him
 LT0.lyS=ly(k,s);LT0.lyT=LT0.lyS;LT0.lyK=k;LT0.lyR=60;p.y=LT0.Y0-ly(k,s)*RS;p.ground=p.y>=floorY()-1;
 if(M[0]!=='blink'&&M[0]!=='block'&&M[0]!=='dodge'){C.atk++;if(M[1]&&!o.quiet)say(M[1],M[2],M[4]>=3)}
 if(k==='dodge'){p.inv=Math.max(p.inv,.36);say('DODGE!','#bfe8ff')}
 if(k==='block'){LT0.bT=0;LT0.blkHit=0}
 if(M[3])LT0.airN+=(M[0]==='air'||M[0]==='spike')?1:0;
 LT0.last=k;LT0.str.push(k);if(LT0.str.length>16)LT0.str.shift();LT0.moves.push(k);if(LT0.moves.length>40)LT0.moves.shift();
 frameEvents(s);return true}
// root jump for a cancel: the next move's frame 1 sits where this move's last frame would have been
function rootJump(a,fromFi,b,s){flush();const d=(rx(a,lastF(a))-rx(a,fromFi))+rx(b,s)-rx(b,0);LT0.mul=1;LT0.trav=0;LT0.k=a;move(d*RS)}
function chain(b,s){const a=LT0.k,fi=p.fi;rootJump(a,fi,b,s);return start(b,s)}
// ---------- per-frame events: effort sounds, hits ----------
function frameEvents(fi){const k=LT0.k,f=at(k,fi);if(f.sfx&&!LT0.sfx[fi]){LT0.sfx[fi]=1;effort(f.sfx)}
 if(f.hit===1&&!LT0.hit[fi]){LT0.hit[fi]=1;strike(k,fi)}
 if(k==='fin'&&f.hit>=2){hitstop=Math.max(hitstop,.06)}       // 3-frame hold on the finisher
 const K0=MV[k][0];if((K0==='blink')&&(fi===2||fi===1&&k==='blinka')){for(let i=1;i<=4;i++)ghosts.push({x:p.x-p.face*i*38,y:p.y,f:(FR['lt_'+k]||[])[fi],face:p.face,l:.12+i*.04,blue:1})}
 if(fi===lastF(k)&&K0!=='blink'&&!MV[k][3]&&ly(k,fi-1)>20)spark(p.x,floorY(),6,'#d9c49a',110)}
function strike(k,fi){const px0=p.x;p.x+=LT0.pend||0;try{strike0(k,fi)}finally{p.x=px0}}   // reach is measured from where this frame's glide ends
function strike0(k,fi){const M=MV[k],B=BOX[M[0]];if(!B)return;let n=0;const palm=/^(l4|h2|counter)$/.test(k);   // blade cuts = light_swing + light_hit, palm pushes = a soft cloth whump (blade off)
 const tx=p.x+p.face*B[0]*.55,ty=p.y-B[1];
 for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face,h=d.h||165;
  if(g<-40||g>B[0]+(d.w||0)*.3)continue;if(d.y-h>ty+B[2]||d.y<ty-B[2])continue;
  if(k==='a1'||k==='a2'||k==='blinka'){d.x+=(p.x+p.face*110-d.x)*.35}
  hitDummy(d,(k==='fin'&&fi<finI())?'lt_l2':'lt_'+k,p.face);if(k==='fin'&&fi<finI()){d.vx=0;d.x+=(p.x+p.face*120-d.x)*.5}n++;   // the blade-wheel hit holds him for the level sweep
  if(M[3]&&k!=='a3'){d.vy=-300;d.fl=Math.max(d.fl||0,.5)}           // air hits keep him floating in reach instead of rocketing him away
  if(k==='launch'&&d.y<GROUND+1){d.vy=Math.max(d.vy,-560);d.fl=Math.max(d.fl||0,.6)}
  if(k==='fin'&&fi>=finI()){d.hp=Math.min(d.hp,0);finFx(d)}else if(k==='fin')d.hp=Math.max(1,d.hp)}
 LT0.hits[k]=(LT0.hits[k]||0)+n;if(palm)snd('claw_swipe_2',{v:.35,r:.7,gap:.08});else swing(M[4]>=2?.55:.42);
 if(n){if(palm)snd('light_hit',{v:.4,r:.8,gap:.08});else snd(M[4]>=2?'light_heavy':'light_hit',{v:M[4]>=2?.55:.45,gap:.08})}
 if(k==='h1'&&fi===hitF(k))setTimeout(()=>swing(.4),110);   // the great spinning arc whooshes twice
 // minimal FX from the sheets: small white/lavender burst + 3 speed lines at the strike tip (also on a whiff, smaller)
 const big=M[4]>=2;for(let i=0;i<(n?(big?14:8):3);i++){const a=(p.face>0?0:Math.PI)+(Math.random()-.5)*2.4,v=160+Math.random()*(big?420:260);sparks.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.22,c:i%2?'#fff':M[2]})}
 if(n&&window.K29)for(let i=0;i<3;i++)K29.imp.push({streak:1,x:tx-p.face*(70+i*14),y:ty-14+i*14,face:p.face,len:60+i*10,col:i===1?V2:V1,l:1,d:0});
 if(n){shake=Math.max(shake,M[4]>=3?18:big?8:4);if(M[4]>=2)waves.push({x:tx,y:ty,r:12,l:.6,big:M[4]>=3})}}
function finFx(d){slowT=Math.max(slowT,.55);flashT=Math.max(flashT,.3);hitstop=Math.max(hitstop,.14);cine.tz=1.15;
 for(let i=0;i<3;i++)waves.push({x:d.x,y:d.y-80+i*12,r:10+i*30,l:1,big:true});if(typeof burst==='function'){burst(d.x,d.y-90);burst(d.x,d.y-150,1)}
 for(let i=0;i<46;i++){const a=Math.random()*6.28,v=200+Math.random()*650;sparks.push({x:d.x,y:d.y-90,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,l:.7,c:['#fff','#fff2a8','#7dff6a','#d8ffd0'][i%4]})}
 cine.pillar={x:d.x,l:1,col:'#fff2a8'};card('DAWN BLOOM!','LIGHT PADDY FINISHER · 8 HITS','#fff2a8');swing(.7);snd('light_finisher',{v:.7,gap:.5})}
// ---------- the move state (runs before the game's own state code, like punch33) ----------
function endTo(normal){const k=LT0.k;LT0.k=null;p.state='normal';p.vx=0;p.vy=0;p.cool=.04;
 if(normal==='air'){p.ground=false;setAnim('lp_fall')}else{p.y=Math.min(p.y,floorY());if(k&&!MV[k][3]&&k!=='block'&&k!=='dodge'){p.state='lt';LT0.k='rec';p.t=0;setAnim('lt_rec',true);p.blend=0;p.prevF=null;p.ft=0;p.fi=0}}
 if(normal!=='air'){LT0.n=0;LT0.beat=true;LT0.last='';LT0.airN=0;p.ncombo=0}}
let enfT=0;
function tick(dt){
 LT0.cool-=dt;LT0.dt=dt;
 enfT-=dt;if(enfT<=0||isL()){enfT=.5;enforce()}
 if(!isL()){if(LT0.k){LT0.k=null}if(p.state==='lt')p.state='normal';return}
 if(A.lp_run===ALL.lp_run)A.lp_run[2]=Math.max(7,Math.min(22,Math.abs(p.vx)/(WALKSTEP*RS)));
 // walk cycle speed follows the run speed so the feet don't skate
  if(p.state!=='lt'){if(LT0.k)LT0.k=null;if(p.ground&&p.state==='normal')LT0.airN=0;return}
 const k=LT0.k;
 if(k==='rec'){   // short recovery back to the upright idle; any press or move goes straight on
  const b=P.attack||P.tail||P.special||P.guard||P.dodge||P.jump||P.blink;
  if(b||K.left||K.right||!p.ground||p.ft+dt*10>=3){LT0.k=null;p.state='normal';p.vx=0;
   if(P.blink){delete P.blink;blink()}else if(P.guard||P.dodge)defence();else if(P.attack||P.tail||P.special)moves(0)}return}
 if(!k||!MV[k]){p.state='normal';return}const M=MV[k],L=fr(k).length;glide(dt);
 if(p.t>1.2)p.t=1.2;    // long holds (block) stay under the game's safety net
 // turning round mid-combo (also when the game's own input code already flipped him)
 if(p.face!==LT0.face&&M[0]!=='blink'){LT0.face=p.face;LT0.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1}
 const want=P.left?-1:P.right?1:0;
 if(want&&want!==p.face&&M[0]!=='blink'&&k!=='dodge'){p.face=want;LT0.face=want;LT0.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1;if(C.n>0)C.t=Math.max(C.t,C.max);
  for(let i=0;i<6;i++)sparks.push({x:p.x,y:p.y-60-Math.random()*60,vx:want*(120+Math.random()*200),vy:(Math.random()-.5)*120,l:.25,c:'#fff'})}
 const fi=p.fi,ft=p.ft+dt*FPS,nfi=Math.min(L-1,Math.floor(ft)),hf=hitF(k),buf=hf>=0?hf:1;
 // ---- input ----
 const isAir=k==='launch'||(M[3]&&k!=='a3');
 let b=null;if(P.attack){delete P.attack;b='C'}else if(P.tail){delete P.tail;b='T'}else if(P.special){delete P.special;b='M'}else if(P.blink){delete P.blink;b='B'}
 else if(P.dodge){delete P.dodge;b='O'}else if(P.guard&&k!=='block'){delete P.guard;b='G'}
 if(isAir&&P.down&&!b){delete P.down;b='C';LT0.forceSpike=1}
 if(P.jump&&fi>=buf&&k!=='fin'&&M[0]!=='block'){LT0.k=null;p.state='normal';p.vy=0;p.cool=0;if(!isAir){p.ground=true;p.y=floorY()}else setAnim('lp_fall');return}   // jump cancel: ufMoves -> ufJump takes the press
 if(b){acted=true;
  if(k==='block'){if(b==='C'||b==='M'){counterFrom(LT0.blkHit&&now-LT0.blkHit<.7?2:1);return}if(b==='O'){LT0.q={b:'O',inp:readInp(),beat:false}}}
  else if(k==='fin'){}
  else{const inp=readInp();if(LT0.forceSpike){inp.down=true;LT0.forceSpike=0}
   const on=fi>=buf&&!LT0.early;if(fi<buf&&b==='C')LT0.early=true;
   if(!LT0.q||fi>=buf)LT0.q={b,inp,beat:on}}}
 // ---- block: hold ----
 if(k==='block'){LT0.bT+=dt;const held=K.guard;
  if(held&&ft>=4.9){p.ft=Math.min(p.ft,3.9);applyFrame(3);p.t=Math.min(p.t,.6);return}
  if(!held&&LT0.bT<.16&&!LT0.blkHit&&fi<=1){rootJump('block',fi,'dodge',1);start('dodge',1);return}
  if(!held&&fi<4){p.ft=Math.max(p.ft,4);}
  if(LT0.q&&LT0.q.b==='O'){LT0.q=null;rootJump('block',fi,'dodge',1);start('dodge',1);return}}
 // ---- cancel point: end of frame n-1 -> the next move from its frame 2 ----
 const q=LT0.q,cut=L-1;
 if(q&&k!=='fin'&&ft>=cut&&fi>=buf){LT0.q=null;const n=LT0.n+1,strikeNext=q.b==='C';
  if(LT0.n>=3&&strikeNext)LT0.beat=LT0.beat&&q.beat;
  if(strikeNext&&LT0.n>=3&&!q.beat)p.miss=true;
  // an on-beat 8th press = the crescent finisher
  if(strikeNext&&!isAir&&LT0.n===7&&LT0.beat&&q.beat){say('PERFECT!','#7fffd4',true);LT0.n=8;rootJump(k,fi,'fin',1);start('fin',1);return}
  let nb=pick(q,n,LT0.beat&&q.beat&&LT0.n>=3);if(!nb){LT0.q=null}
  else{if(strikeNext&&LT0.n>=3&&LT0.beat&&q.beat&&!isAir){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false})}
   if(MV[nb][0]!=='blink'&&MV[nb][0]!=='block'&&MV[nb][0]!=='dodge'&&!MV[nb][3])LT0.n=n;else if(MV[nb][3]&&MV[nb][0]!=='blink')LT0.n=n;
   p.ncombo=Math.min(8,LT0.n);chain(nb,1);return}}
 // ---- a3: hold the dive pose until the ground is reached ----
 if(k==='a3'&&nfi>=a3L()&&!LT0.landed){const fl=floorY(),hl=a3L()-1;if(p.y<fl-4){LT0.fall=true;p.ft=Math.min(p.ft,hl+.95);LT0.vy=(LT0.vy||300)+2600*dt;p.y=Math.min(fl,p.y+LT0.vy*dt);applyFrameX(hl);return}
  LT0.landed=true;LT0.Y0=fl;LT0.Yt=fl;LT0.vy=0;shake=Math.max(shake,8);spark(p.x,fl,10,['#fff','#d9c49a'],200);waves.push({x:p.x,y:fl,r:10,l:.6,big:false})}
 if(k!=='a3')LT0.landed=false;
 // ---- end of the move with nothing queued ----
 if(ft>=L){if(isAir&&k!=='launch'||k==='launch'){endTo('air');return}
  if(k==='fin'){LT0.n=0}endTo('ground');return}
 applyFrame(nfi)}
function applyFrameX(nfi){const k=LT0.k;if(nfi!==LT0.lastFi){move((rx(k,nfi)-rx(k,LT0.lastFi))*RS,MV[k][0]!=='blink'&&k!=='fin');LT0.lastFi=nfi;frameEvents(nfi)}}
function applyFrame(nfi){const k=LT0.k;applyFrameX(nfi);if(!LT0.k)return;
 if(LT0.Yt!=null&&LT0.Yt!==LT0.Y0){const st=(MV[k][0]==='blink'?1400:650)*(LT0.dt||.016),dy=LT0.Yt-LT0.Y0;LT0.Y0+=Math.abs(dy)<=st?dy:Math.sign(dy)*st}   // glide to the juggle height, never snap
 const lt=ly(k,nfi);if(LT0.lyS==null||LT0.lyK!==k)LT0.lyS=lt;if(LT0.lyT!==lt){LT0.lyR=Math.max(Math.abs(lt-LT0.lyS)*FPS*1.25,30);LT0.lyT=lt}
 LT0.lyK=k;const ls=(LT0.lyR||60)*(LT0.dt||.016);if(!isFinite(LT0.lyS))LT0.lyS=lt;LT0.lyS+=Math.abs(lt-LT0.lyS)<=ls?lt-LT0.lyS:Math.sign(lt-LT0.lyS)*ls;
 p.y=LT0.Y0-LT0.lyS*RS;p.vx=0;p.vy=0;
 if(p.y>floorY())p.y=floorY();
 if(k==='dodge'&&nfi>=4)p.inv=Math.min(p.inv,.05)}
function counterFrom(s){const a=LT0.k;rootJump(a,p.fi,'counter',s);start('counter',s);LT0.n=Math.max(LT0.n,1)}
// ---------- entry points the game calls for the ninja form ----------
function moves(dir){
 if(P.jump&&P.attack&&p.ground){delete P.jump;delete P.attack;LT0.k=null;LT0.n=1;LT0.beat=true;p.miss=false;LT0.last='';start('launch',0);p.ncombo=1;return true}   // Jump + Claw together = launcher
 if(P.jump&&ufJump())return true;
 const inp=readInp();LT0.k=null;
 if(!p.ground&&P.attack&&(K.up||K.jump||held('up'))&&p.vy<0&&now-(p.lastJump||-9)<.35&&LT0.airN===0){delete P.attack;LT0.n=1;LT0.beat=true;p.miss=false;LT0.last='';start('launch',0,{fromAir:1});p.ncombo=1;return true}   // ↑/Jump + Claw = launcher (the jump key fires first)
 if(!p.ground){if(P.attack){if(K.down||held('down'))inp.down=true;delete P.attack;LT0.last=LT0.airN>0?LT0.last:'';start(pickC(inp,true,1,false),0);return true}
  if(P.tail){delete P.tail;start('a2',0);return true}return false}
 if(P.attack){delete P.attack;LT0.n=1;LT0.beat=true;LT0.early=false;p.miss=false;LT0.last='';if(LT0.blkHit&&now-LT0.blkHit<.7){LT0.blkHit=0;start('counter',1)}else start(pickC(inp,false,1,false),0);p.ncombo=1;return true}   // Claw straight after a block = counter palm
 if(P.tail){delete P.tail;LT0.n=1;LT0.beat=true;p.miss=false;start('h2',0);p.ncombo=1;return true}
 if(P.special){delete P.special;LT0.n=1;LT0.beat=true;p.miss=false;start('counter',0);return true}
 return false}
function defence(){if(!isL())return;
 if(!['normal','land','knflip'].includes(p.state))return;
 if(P.dodge&&p.ground){delete P.dodge;LT0.k=null;start('dodge',0);return}
 if(P.guard&&p.ground){delete P.guard;LT0.k=null;start('block',0);return}}
function blink(){if(LT0.cool>0)return false;if(['nmorph','hurt','respawn','wallrun','lk','lkult','eclipse','finishhim'].includes(p.state))return false;
 if(p.state==='lt'&&LT0.k!=='rec'){if(LT0.k&&LT0.k!=='fin')LT0.q={b:'B',inp:readInp(),beat:false};return true}
 if(p.state==='lt')p.state='normal';
 LT0.cool=.3;const air=!p.ground;LT0.k=null;return start(air?'blinka':'blink',0)}
function dash(dir){p.face=dir==='right'?1:-1;p.dashCool=.4;p.dashStart=now;if(p.state==='lt'&&LT0.k!=='rec')return;LT0.k=null;start(p.ground?'blink':'blinka',0)}
// ---------- hook the game (Light Paddy only: the other legend forms share the uf* functions and keep them) ----------
const _um=ufMoves;ufMoves=function(dir){if(!isL())return _um.apply(this,arguments);try{moves(dir)}catch(e){console.warn('lt',e)}};
const _ub=ufBlink;ufBlink=function(){if(!isL())return _ub.apply(this,arguments);return blink()};
const _ud=ufDash;ufDash=function(dir){if(!isL())return _ud.apply(this,arguments);dash(dir)};
const _uh=ufHit;ufHit=function(i){if(!isL())return _uh.apply(this,arguments);LT0.k=null;LT0.n=1;start(p.ground?(K.up?'launch':'l1'):'a1',0)};
const _ua=ufAir;ufAir=function(){if(!isL())return _ua.apply(this,arguments);LT0.k=null;start('a1',0);return true};
const _ul=ufLaunch;ufLaunch=function(){if(!isL())return _ul.apply(this,arguments);LT0.k=null;start('launch',0)};
const _uv=ufDive;ufDive=function(){if(!isL())return _uv.apply(this,arguments);LT0.k=null;start('a3',0)};
const _ut=ufTail;ufTail=function(){if(!isL())return _ut.apply(this,arguments);LT0.k=null;start(p.ground?'h2':'a2',0)};
const _uc=ufCancel;ufCancel=function(){if(!isL())return _uc.apply(this,arguments);if(P.jump&&ufJump())return true;if(P.blink){delete P.blink;return blink()}return false};
if(typeof UST!=='undefined')UST.add('lt');
if(typeof UNG!=='undefined')UNG.add('lt');
const _us=ufState;ufState=function(S,dt,end,dir){if(S==='lt')return;return _us.apply(this,arguments)};
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{tick(dt);defence()}catch(e){console.warn('lt',e)}};
// the old claw slash arcs and generic hit sparks don't belong on the drawn strikes
const _cf=clawFx;clawFx=function(){if(isL()&&p.state==='lt')return;return _cf.apply(this,arguments)};
// defence vs the practice spar / any incoming hit: block, perfect block = counter, early dodge = counter
const _ds=dogStrike;dogStrike=function(d,dmg,kind){if(isL()&&p.state==='lt'&&LT0.k){const dir=Math.sign(p.x-d.x)||-1;
  if(LT0.k==='block'||(LT0.k==='counter'&&p.fi<=2)){
   if(LT0.k==='block'&&LT0.bT<.2){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);flashT=Math.max(flashT,.15);hitstop=Math.max(hitstop,.08);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}
   LT0.blkHit=now;say('BLOCKED!','#ffe0a0',true);p.x+=dir*10;d.vx=-dir*160;d.vy=Math.min(d.vy||0,-220);d.cool=Math.max(d.cool||0,1.4);if(typeof dSet==='function'&&!d.cr)dSet(d,'hurt','r_hurt');
   d.flash=.16;shake=Math.max(shake,6);hitstop=Math.max(hitstop,.05);if(window.K29)K29.imp.push({x:p.x+p.face*55,y:p.y-95,l:1,big:false,col:'#cfe3ff',rot:0});try{clang()}catch(_){};return true}
  if(LT0.k==='dodge'&&p.t<.22){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}}
 return _ds.apply(this,arguments)};
// beat ring: green from the impact frame of the current move (hits 3-7 of a clean string)
const _cue=cueInfo;cueInfo=function(){if(LT0.own()&&LT0.n>=3&&LT0.n<8&&LT0.beat&&!p.miss&&!MV[LT0.k][3]){const h=hitF(LT0.k);if(h>=0)return{H:(h-(LT0.s||0))/FPS+.2}}return _cue()};
// link routes: 3+ clean hits open ROUTES[3] (Tail / Meow / Blink), TTT open the T routes
const _op=openerNow;openerNow=function(){if(LT0.own()){const n=LT0.n+(LT0.q&&LT0.q.b==='C'?1:0);
  if(LT0.k==='h2'&&now-lastTokT<.75){let t=0;for(let i=TOK.length-1;i>=0&&TOK[i].c==='T';i--)t++;if(t>=3)return{run:'TTT',W:.16,E:.5}}
  if(n>=3&&!p.miss&&!MV[LT0.k][3]&&LT0.k!=='fin')return{run:'C'.repeat(Math.min(n,8)),W:.07,E:.7}}return _op()};
const _ls=liveSeq;liveSeq=function(){if(LT0.own()&&!LK.on)return 'C'.repeat(Math.min(8,LT0.n));return _ls()};
// the light recovery pose
const _fa=fa;fa=function(k){if(isL()){if(k==='rec')return 'lt_rec'}return _fa(k)};
// ---------- preload: every light frame first once Light Paddy is picked (and quietly in the background before that) ----------
let asked=0;const _pre2=r9Pre;r9Pre=function(dt){try{if(asked<2&&window.queueFrames&&F&&F.lt_idle){const hi=isL();if(hi||asked===0){const L=[];for(const a in ALL)(frOf(ALL[a])||[]).forEach(q=>L.push(q.f));queueFrames([...new Set(L)],hi);asked=hi?2:1}}}catch(_){}_pre2(dt)};
(function early(){if(F&&F.lt_idle){enforce();return}setTimeout(early,30)})();
window.LIGHT41={MV,LT0,ALL,BOX,enforce};
})();
