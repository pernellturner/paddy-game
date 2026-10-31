// ===================== v36: KITTY PADDY (the Kitty slot = base Paddy, form 0) =====================
// Art: generated/forms/01_kitty/sheets (magenta key) cut by src/cut_kitty.py -> kt_* in frames.json, 12 fps, one form scale
// (K=0.4928, kitty idle = base idle height). Same engine and cancel rules as ninja35.js (copied, own state 'kt' and own KY object).
// The Kitty slot IS base Paddy (FORM 0: kitty29.js + punch33.js). To never break base Paddy, Kitty Paddy is a STYLE of base Paddy
// that is switched on/off (🐱 KITTY STYLE button in the combo list, key 0, ?kitty=1 / ?kitty=0; remembered). Off = base Paddy exactly as before
// (approved jabs, grab finisher, all his systems). On = Kitty Paddy's own moves on base Paddy; run/jump/climb/hurt/forms/items stay base Paddy's.
// Controls (keyboard / touch), Kitty style on:
//   Claw (X / 🐾)        = next of the 1-2-3-4 string: SWAT -> BONK -> ANKLE SWIPE -> HEAD-BONK -> swat ...
//   → + Claw            = swat (a second → + Claw in a row = TAIL WHIP, the 1' of 1-1-2)
//   ↓ + Claw            = butt-wiggle POUNCE      Jump + Claw / ↑ + Claw = ROCKET LEAP launcher (ends in the air)
//   Tail (T)            = PAW SLAM               Meow (C)        = COUNTER SWIPE (parry + up-swipe)
//   Blink (N / Ctrl) / Zoomies (Z) = ZOOMIES dash-in (in the air: air zoomies to the enemy)
//   hold 🛡 / B          = block (puffed-up)      tap 🛡 / O       = dodge (startled spring back)
//   block just as a hit lands or dodge right as it lands = COUNTER; Claw while blocking = counter swipe
//   in the air: Claw = AIR SWAT -> BUNNY KICK -> DIVE SPIKE (lands); ↓ + Claw = dive spike
//   8-hit timed string: hits 1-3 any rhythm, then on the beat; hit 7 on the beat = POUNCE, an on-beat 8th press = NINE LIVES finisher.
(function(){
if(typeof SM!=='function'||typeof A==='undefined'||typeof FORM!=='function')return;
const KS=window.KITTY36={on:false};
try{const q=new URLSearchParams(location.search).get('kitty');if(q!=null)localStorage.setItem('paddyKitty36',q==='0'?'0':'1');KS.on=localStorage.getItem('paddyKitty36')==='1'}catch(_){}
const isB=()=>{try{return FORM()===0&&!p.uf&&!p.xf&&!p.ninja&&!p.sam&&!p.bunnyF}catch(_){return false}};
const isK=()=>KS.on&&isB();
const FPS=12,RS=(typeof SC!=='undefined'&&SC)||.8;
const K1='#ffe08a',K2='#fff1c9';
const MV={
 l1:['light','SWAT!','#fff1c9',0,1], l2:['light','BONK!','#ffe08a',0,1], l3:['light','ANKLE SWIPE!','#ffd9a0',0,1],
 l4:['light','HEAD-BONK!','#fff1c9',0,1], l5:['light','TAIL WHIP!','#ffffff',0,1],
 h1:['heavy','POUNCE!','#ffb36b',0,2], h2:['heavy','PAW SLAM!','#ffd34d',0,2], launch:['launch','ROCKET LEAP!','#ffe08a',0,2],
 a1:['air','AIR SWAT!','#fff1c9',1,1], a2:['air','BUNNY KICK!','#ffd9a0',1,1], a3:['spike','DIVE SPIKE!','#ffb36b',1,2],
 blink:['blink','ZOOMIES!',K1,0,0], blinka:['blink','AIR ZOOMIES!',K1,1,0], block:['block','',K2,0,0], dodge:['dodge','',K2,0,0],
 counter:['counter','COUNTER SWIPE!','#7fffd4',0,2], fin:['fin','NINE LIVES!!','#ff9ad5',0,3]};
const KY=window.KY={k:null,s:0,q:null,lastFi:0,Y0:0,n:0,beat:true,early:false,hit:{},sfx:{},trav:0,face:1,last:'',str:[],airN:0,
 blkHit:0,bT:0,cool:0,log:[],hits:{},moves:[],
 own(){return isK()&&p.state==='kt'&&!!MV[this.k]}};
const fr=k=>(F&&F['kt_'+k])||[];
const at=(k,i)=>{const L=fr(k);return L[Math.max(0,Math.min(L.length-1,i))]||{}};
const RXFIX={};
const rx=(k,i)=>(k==='a3'&&i>=6)?(at(k,5).rx||0):(RXFIX[k]&&RXFIX[k][i]!=null?RXFIX[k][i]:(at(k,i).rx||0));
const ly=(k,i)=>at(k,i).ly||0;
const hitF=k=>{const L=fr(k);for(let i=0;i<L.length;i++)if(L[i].hit===1)return i;return -1};
const lastF=k=>Math.max(0,fr(k).length-1);
// ---------- animation table ----------
const NEW={};for(const k in MV)NEW['kt_'+k]=['kt_'+k,null,FPS,0];
Object.assign(NEW,{kt_idle:['kt_idle',null,8,1],kt_ready:['kt_ready',null,FPS,0],kt_walk:['kt_walk',null,FPS,1],kt_victory:['kt_victory',null,8,0],kt_rec:['kt_ready',[2,1,0],10,0]});
for(const a in NEW)A[a]=NEW[a];
// base Paddy anims shown as Kitty while the style is on (swapped back the moment it is off or another form is picked)
const SWAP={idle:['kt_idle',null,8,1],walk:['kt_walk',null,15,1],run:['kt_walk',null,31,1],start:['kt_ready',[2,3,4],10,0],victory:['kt_victory',null,8,0]};
const frOf=v=>{const L=F&&F[v[0]];if(!L)return null;return v[1]?v[1].filter(i=>i<L.length).map(i=>L[i]):L};
const MYFR={},ORIG={};let swapped=false;
function enforce(){if(!F||!F.kt_idle)return;for(const a in NEW){if(!MYFR[a]){const f=frOf(NEW[a]);if(f&&f.length)MYFR[a]=f}if(MYFR[a]&&FR[a]!==MYFR[a])FR[a]=MYFR[a];if(A[a]!==NEW[a])A[a]=NEW[a]}
 const want=isK();
 for(const a in SWAP){if(!MYFR['sw_'+a]){const f=frOf(SWAP[a]);if(f&&f.length)MYFR['sw_'+a]=f}
  if(want){if(!(a in ORIG))ORIG[a]=[A[a],FR[a]];if(MYFR['sw_'+a]&&FR[a]!==MYFR['sw_'+a]){A[a]=SWAP[a];FR[a]=MYFR['sw_'+a]}}
  else if(a in ORIG&&FR[a]===MYFR['sw_'+a]){A[a]=ORIG[a][0];FR[a]=ORIG[a][1]}}
 if(want!==swapped){swapped=want;if(p.state==='normal'&&/^(idle|walk|run)$/.test(p.anim))setAnim(p.anim,true)}}
Object.assign(NAMES,{kt_l1:'SWAT!',kt_l2:'BONK!',kt_l3:'ANKLE SWIPE!',kt_l4:'HEAD-BONK!',kt_l5:'TAIL WHIP!',kt_h1:'POUNCE!',kt_h2:'PAW SLAM!',
 kt_launch:'ROCKET LEAP!',kt_a1:'AIR SWAT!',kt_a2:'BUNNY KICK!',kt_a3:'DIVE SPIKE!',kt_counter:'COUNTER SWIPE!',kt_fin:'NINE LIVES!!'});
Object.assign(KB,{kt_l1:[45,-60,0,.05],kt_l2:[50,-70,0,.05],kt_l3:[60,-90,0,.05],kt_l4:[60,-70,0,.05],kt_l5:[80,-90,0,.055],
 kt_h1:[150,-420,.2,.075],kt_h2:[300,-280,.08,.08],kt_launch:[50,-760,.55,.08],kt_a1:[70,-230,.4,.05],kt_a2:[110,-240,.4,.055],
 kt_a3:[160,900,0,.09],kt_counter:[380,-380,.2,.1],kt_fin:[480,-1150,.6,.15]});
const BOX={light:[185,95,95],heavy:[215,70,110],launch:[200,140,150],air:[175,80,120],spike:[165,60,150],counter:[215,95,110],fin:[200,140,190]};
const LIM={light:70,heavy:160,launch:60,air:120,spike:90,counter:120,fin:420,blink:520,block:30,dodge:90};
// ---------- helpers ----------
const snd=(k,o)=>{try{window.SND&&SND.play&&SND.play(k,o||{})}catch(_){}};
const rnd=a=>a[Math.floor(Math.random()*a.length)];let hissN=0;
function effort(cue){KY.log.push(cue);if(KY.log.length>40)KY.log.shift();
 if(cue==='hup')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.42,r:1.18+Math.random()*.1,gap:.18});
 else if(cue==='GRUNT')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.8,r:.98,gap:.2});
 else if(cue==='hiss')snd(['pvo_hiss1','pvo_hiss2','pvo_hiss3'][hissN++%3],{v:.55,r:1.1,gap:.2});
 else if(cue==='HISS')snd('pvo_hiss2',{v:.9,r:.92,gap:.2});
 else if(cue==='BIG GRUNT'){snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:1,r:.84,gap:.2});snd('pvo_growl1',{v:.5,gap:.3})}}
function floorY(){return typeof floorAt==='function'?floorAt(p.x):GROUND}
function target(range,airOnly){let best=null,bd=range;for(const d of dummies){if(!d.alive||d.benched)continue;if(airOnly&&d.y>GROUND-30)continue;
 const dd=Math.abs(d.x-p.x)+((d.x-p.x)*p.face<0?140:0)+(airOnly?Math.abs(d.y-p.y)*.5:0);if(dd<bd){bd=dd;best=d}}return best}
function move(dx,glide){if(!dx)return;let d=p.face*dx*KY.mul;const K0=MV[KY.k][0];
 if(d*p.face>0&&K0!=='blink'&&K0!=='fin'){for(const q of dummies){if(!q.alive||q.benched)continue;const g=(q.x-p.x)*p.face;if(g>-20&&g<88&&Math.abs(q.y-p.y)<150){d=0;break}}}
 const room=(LIM[K0]||80)-KY.trav;if(room<=0)d=0;else if(Math.abs(d)>room)d=Math.sign(d)*room;KY.trav+=Math.abs(d);
 if(glide){KY.pend=(KY.pend||0)+d;KY.prate=Math.max(Math.abs(KY.pend)*FPS*1.25,60);return}
 p.x+=d;if(typeof clampX==='function')p.x=clampX(p.x)}
// root motion of one drawn frame is spread over that frame (the big kitty lunges / pounces would otherwise jump 60-75 px in one go)
function glide(dt){if(!KY.pend)return;const st=Math.sign(KY.pend)*Math.min(Math.abs(KY.pend),KY.prate*dt);p.x+=st;KY.pend-=st;if(Math.abs(KY.pend)<.01)KY.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}
function flush(){if(KY.pend){p.x+=KY.pend;KY.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}}
// a direction tapped together with Claw counts even if it was let go a moment before the press is read (hit-stop holds the update)
const KTT={right:-9,left:-9,down:-9,up:-9};(function poll(){try{const t=performance.now()/1000;if(K.right)KTT.right=t;if(K.left)KTT.left=t;if(K.down)KTT.down=t;if(K.up||K.jump)KTT.up=t}catch(_){}requestAnimationFrame(poll)})();
const held=(k)=>performance.now()/1000-KTT[k]<.16;
function readInp(){const f=p.face>0?'right':'left',b=p.face>0?'left':'right',turned=performance.now()/1000-(KY.turnT||-9)<.25;return{down:held('down'),up:held('up'),fwd:!turned&&held(f),back:held(b)}}
// ---------- which move a press throws ----------
const NEXT={'':'l1',l1:'l2',l2:'l3',l3:'l4',l4:'l1',l5:'l2',h1:'l1',h2:'l1',counter:'l2',blink:'l1',dodge:'l1',block:'counter',a3:'l1',fin:'l1',launch:'a1',a1:'a2',a2:'a3',blinka:'a1'};
function pickC(inp,air,n,beat){
 if(air){if(inp.down||KY.airN>=2)return 'a3';return KY.last==='a1'?'a2':KY.last==='a2'?'a3':'a1'}
 if(n===7&&beat)return 'h1';                                   // 8-hit string: hit 7 on the beat is the low sweep
 if(KY.k==='block')return 'counter';
 if(inp.up)return 'launch';if(inp.down)return 'h1';if(inp.fwd)return KY.last==='l1'?'l5':'l1';
 return NEXT[KY.last||'']||'l1'}
function pick(q,n,beat){const inAir=KY.k?(KY.k==='launch'||(MV[KY.k][3]&&KY.k!=='a3')):!p.ground;
 if(q.b==='B')return inAir?'blinka':'blink';if(q.b==='G')return inAir?null:'block';if(q.b==='O')return inAir?null:'dodge';
 if(q.b==='M')return inAir?'a2':'counter';if(q.b==='T')return inAir?'a2':'h2';
 return pickC(q.inp,inAir,n,beat)}
// ---------- start a move ----------
function start(k,s,o){o=o||{};const prev=KY.k,M=MV[k];if(!fr(k).length)return false;flush();
 const fromAir=prev?(prev==='launch'||(MV[prev][3]&&prev!=='a3')):!p.ground;
 p.state='kt';p.t=0;p.vx=0;p.vy=0;p.wall=false;acted=true;p.shot=false;p.queued=false;
 if(typeof tokAct==='function'&&(M[0]==='light'||M[0]==='heavy'&&k!=='h2'||M[0]==='air'||M[0]==='spike'||M[0]==='launch'))tokAct('claw');
 if(k==='h2'&&typeof tokAct==='function')tokAct('tailwhip');
 setAnim('kt_'+k,true);p.ft=s;p.fi=s;if(s>0||o.cut){p.blend=0;p.prevF=null}
 KY.k=k;KY.s=s;KY.q=null;KY.early=false;KY.hit={};KY.sfx={};KY.lastFi=s;KY.trav=0;KY.face=p.face;KY.mul=1;KY.fall=false;KY.t0=now;
 if(M[3]){   // air move: keep the current baseline, or set it so frame s sits where Paddy is now
  if(!(prev&&fromAir))KY.Y0=p.y+ly(k,s)*RS;
  KY.Yt=KY.Y0;const d=target(420,true);if(d&&M[0]!=='blink'){const want=d.y+ly(k,s)*RS+10;KY.Yt=KY.Y0+Math.max(-150,Math.min(150,want-KY.Y0))}
 }else{KY.Y0=o.fromAir?Math.min(floorY(),p.y+ly(k,s)*RS):floorY();KY.Yt=KY.Y0}
 // blinks and the finisher's dash close the real gap to the enemy (scale the drawn travel to land just in front of him)
 if(M[0]==='blink'||k==='fin'){const d=target(k==='blinka'?520:620,k==='blinka');const tr=k==='fin'?rx(k,5)-rx(k,s):rx(k,lastF(k))-rx(k,s);
  if(d&&tr>0){if(Math.abs(d.x-p.x)>25)p.face=d.x>=p.x?1:-1;KY.face=p.face;const gap=Math.abs(d.x-p.x)-(k==='fin'?95:80);KY.mul=Math.max(.15,Math.min(1.6,gap/(tr*RS)));
   if(k==='blinka'&&d.y<GROUND-30){KY.Yt=KY.Y0+Math.max(-160,Math.min(160,(d.y+ly(k,0)*RS+10)-KY.Y0))}}
  else KY.mul=k==='fin'?.25:1;
  if(M[0]==='blink'){p.inv=Math.max(p.inv,.3);puffShadow(p.x,p.y)}}
 if(k==='counter'){const d=target(300);const tr=rx(k,3)-rx(k,s);if(d&&tr>0){const gap=Math.abs(d.x-p.x)-110;KY.mul=Math.max(.6,Math.min(8,gap/(tr*RS)))}}   // the counter palm steps in to reach him
 KY.lyS=ly(k,s);KY.lyT=KY.lyS;KY.lyK=k;KY.lyR=60;p.y=KY.Y0-ly(k,s)*RS;p.ground=p.y>=floorY()-1;
 if(M[0]!=='blink'&&M[0]!=='block'&&M[0]!=='dodge'){C.atk++;if(M[1]&&!o.quiet)say(M[1],M[2],M[4]>=3)}
 if(k==='dodge'){p.inv=Math.max(p.inv,.36);say('DODGE!','#bfe8ff')}
 if(k==='block'){KY.bT=0;KY.blkHit=0}
 if(M[3])KY.airN+=(M[0]==='air'||M[0]==='spike')?1:0;
 KY.last=k;KY.str.push(k);if(KY.str.length>16)KY.str.shift();KY.moves.push(k);if(KY.moves.length>40)KY.moves.shift();
 frameEvents(s);return true}
// root jump for a cancel: the next move's frame 1 sits where this move's last frame would have been
function rootJump(a,fromFi,b,s){flush();const d=(rx(a,lastF(a))-rx(a,fromFi))+rx(b,s)-rx(b,0);KY.mul=1;KY.trav=0;KY.k=a;move(d*RS)}
function chain(b,s){const a=KY.k,fi=p.fi;rootJump(a,fi,b,s);return start(b,s)}
// ---------- per-frame events: effort sounds, hits ----------
function frameEvents(fi){const k=KY.k,f=at(k,fi);if(f.sfx&&!KY.sfx[fi]){KY.sfx[fi]=1;effort(f.sfx)}
 if(f.hit===1&&!KY.hit[fi]){KY.hit[fi]=1;strike(k,fi)}
 if(k==='fin'&&f.hit>=2){hitstop=Math.max(hitstop,.06)}       // 3-frame hold on the finisher
 const K0=MV[k][0];if((K0==='blink')&&(fi===2||fi===1&&k==='blinka')){for(let i=1;i<=4;i++)ghosts.push({x:p.x-p.face*i*38,y:p.y,f:(FR['kt_'+k]||[])[fi],face:p.face,l:.12+i*.04,blue:1})}
 if(fi===lastF(k)&&K0!=='blink'&&!MV[k][3]&&ly(k,fi-1)>20)spark(p.x,floorY(),6,'#d9c49a',110)}
function strike(k,fi){const px0=p.x;p.x+=KY.pend||0;try{strike0(k,fi)}finally{p.x=px0}}   // reach is measured from where this frame's glide ends
function strike0(k,fi){const M=MV[k],B=BOX[M[0]];if(!B)return;let n=0;
 const tx=p.x+p.face*B[0]*.55,ty=p.y-B[1];
 for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face,h=d.h||165;
  if(g<-40||g>B[0]+(d.w||0)*.3)continue;if(d.y-h>ty+B[2]||d.y<ty-B[2])continue;
  if(k==='a1'||k==='a2'||k==='blinka'){d.x+=(p.x+p.face*110-d.x)*.35}
  hitDummy(d,'kt_'+k,p.face);n++;
  if(M[3]&&k!=='a3'){d.vy=-300;d.fl=Math.max(d.fl||0,.5)}           // air hits keep him floating in reach instead of rocketing him away
  if(k==='launch'&&d.y<GROUND+1){d.vy=Math.max(d.vy,-560);d.fl=Math.max(d.fl||0,.6)}
  if(k==='fin'){d.hp=Math.min(d.hp,0);finFx(d)}}
 KY.hits[k]=(KY.hits[k]||0)+n;
 // minimal FX from the sheets: small white/lavender burst + 3 speed lines at the strike tip (also on a whiff, smaller)
 const big=M[4]>=2;for(let i=0;i<(n?(big?14:8):3);i++){const a=(p.face>0?0:Math.PI)+(Math.random()-.5)*2.4,v=160+Math.random()*(big?420:260);sparks.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.22,c:i%2?'#fff':M[2]})}
 if(n&&window.K29)for(let i=0;i<3;i++)K29.imp.push({streak:1,x:tx-p.face*(70+i*14),y:ty-14+i*14,face:p.face,len:60+i*10,col:i===1?K2:K1,l:1,d:0});
 if(n){shake=Math.max(shake,M[4]>=3?18:big?8:4);if(M[4]>=2)waves.push({x:tx,y:ty,r:12,l:.6,big:M[4]>=3})}}
function finFx(d){slowT=Math.max(slowT,.55);flashT=Math.max(flashT,.3);hitstop=Math.max(hitstop,.14);cine.tz=1.15;
 for(let i=0;i<3;i++)waves.push({x:d.x,y:d.y-80+i*12,r:10+i*30,l:1,big:true});if(typeof burst==='function'){burst(d.x,d.y-90);burst(d.x,d.y-150,1)}
 for(let i=0;i<46;i++){const a=Math.random()*6.28,v=200+Math.random()*650;sparks.push({x:d.x,y:d.y-90,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,l:.7,c:['#fff','#ffe08a','#ffd0a0','#ff9ad5'][i%4]})}
 cine.pillar={x:d.x,l:1,col:'#ffe08a'};card('NINE LIVES!','KITTY FINISHER · 8 HITS','#ffe08a')}
// ---------- the move state (runs before the game's own state code, like punch33) ----------
function endTo(normal){const k=KY.k;KY.k=null;p.state='normal';p.vx=0;p.vy=0;p.cool=.04;
 if(normal==='air'){p.ground=false;setAnim('fall')}else{p.y=Math.min(p.y,floorY());if(k&&!MV[k][3]&&k!=='block'&&k!=='dodge'){p.state='kt';KY.k='rec';p.t=0;setAnim('kt_rec',true);p.blend=0;p.prevF=null;p.ft=0;p.fi=0}}
 if(normal!=='air'){KY.n=0;KY.beat=true;KY.last='';KY.airN=0;p.ncombo=0}}
let enfT=0;
function tick(dt){
 KY.cool-=dt;KY.dt=dt;
 enfT-=dt;if(enfT<=0||isK()||swapped){enfT=.5;enforce()}
 if(!isK()){if(KY.k){KY.k=null}if(p.state==='kt'){p.state='normal';setAnim(fa('idle'),true)}return}
 // walk cycle speed follows the run speed so the feet don't skate
  if(p.state!=='kt'){if(KY.k)KY.k=null;if(p.ground&&p.state==='normal')KY.airN=0;return}
 const k=KY.k;
 if(k==='rec'){   // short recovery back to the upright idle; any press or move goes straight on
  const b=P.attack||P.tail||P.special||P.guard||P.dodge||P.jump||P.blink;
  if(b||K.left||K.right||!p.ground||p.ft+dt*10>=3){KY.k=null;p.state='normal';p.vx=0;
   if(P.blink){delete P.blink;blink()}else if(P.guard||P.dodge)defence();else if(P.attack||P.tail||P.special)moves(0)}return}
 if(!k||!MV[k]){p.state='normal';return}const M=MV[k],L=fr(k).length;glide(dt);
 if(p.t>1.2)p.t=1.2;    // long holds (block) stay under the game's safety net
 // turning round mid-combo (also when the game's own input code already flipped him)
 if(p.face!==KY.face&&M[0]!=='blink'){KY.face=p.face;KY.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1}
 const want=P.left?-1:P.right?1:0;
 if(want&&want!==p.face&&M[0]!=='blink'&&k!=='dodge'){p.face=want;KY.face=want;KY.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1;if(C.n>0)C.t=Math.max(C.t,C.max);
  for(let i=0;i<6;i++)sparks.push({x:p.x,y:p.y-60-Math.random()*60,vx:want*(120+Math.random()*200),vy:(Math.random()-.5)*120,l:.25,c:'#fff'})}
 const fi=p.fi,ft=p.ft+dt*FPS,nfi=Math.min(L-1,Math.floor(ft)),hf=hitF(k),buf=hf>=0?hf:1;
 // ---- input ----
 const isAir=k==='launch'||(M[3]&&k!=='a3');
 let b=null;if(P.attack){delete P.attack;b='C'}else if(P.tail){delete P.tail;b='T'}else if(P.special){delete P.special;b='M'}else if(P.blink){delete P.blink;b='B'}
 else if(P.dodge){delete P.dodge;b='O'}else if(P.guard&&k!=='block'){delete P.guard;b='G'}
 if(isAir&&P.down&&!b){delete P.down;b='C';KY.forceSpike=1}
 if(P.jump&&fi>=buf&&k!=='fin'&&M[0]!=='block'){KY.k=null;p.state='normal';p.vy=0;p.cool=0;if(!isAir){p.ground=true;p.y=floorY()}else setAnim('fall');return}   // jump cancel: the game's own jump takes the press
 if(b){acted=true;
  if(k==='block'){if(b==='C'||b==='M'){counterFrom(KY.blkHit&&now-KY.blkHit<.7?2:1);return}if(b==='O'){KY.q={b:'O',inp:readInp(),beat:false}}}
  else if(k==='fin'){}
  else{const inp=readInp();if(KY.forceSpike){inp.down=true;KY.forceSpike=0}
   const on=fi>=buf&&!KY.early;if(fi<buf&&b==='C')KY.early=true;
   if(!KY.q||fi>=buf)KY.q={b,inp,beat:on}}}
 // ---- block: hold ----
 if(k==='block'){KY.bT+=dt;const held=K.guard;
  if(held&&ft>=4.9){p.ft=Math.min(p.ft,3.9);applyFrame(3);p.t=Math.min(p.t,.6);return}
  if(!held&&KY.bT<.16&&!KY.blkHit&&fi<=1){rootJump('block',fi,'dodge',1);start('dodge',1);return}
  if(!held&&fi<4){p.ft=Math.max(p.ft,4);}
  if(KY.q&&KY.q.b==='O'){KY.q=null;rootJump('block',fi,'dodge',1);start('dodge',1);return}}
 // ---- cancel point: end of frame n-1 -> the next move from its frame 2 ----
 const q=KY.q,cut=L-1;
 if(q&&k!=='fin'&&ft>=cut&&fi>=buf){KY.q=null;const n=KY.n+1,strikeNext=q.b==='C';
  if(KY.n>=3&&strikeNext)KY.beat=KY.beat&&q.beat;
  if(strikeNext&&KY.n>=3&&!q.beat)p.miss=true;
  // an on-beat 8th press = the crescent finisher
  if(strikeNext&&!isAir&&KY.n===7&&KY.beat&&q.beat){say('PERFECT!','#7fffd4',true);KY.n=8;rootJump(k,fi,'fin',1);start('fin',1);return}
  let nb=pick(q,n,KY.beat&&q.beat&&KY.n>=3);if(!nb){KY.q=null}
  else{if(strikeNext&&KY.n>=3&&KY.beat&&q.beat&&!isAir){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false})}
   if(MV[nb][0]!=='blink'&&MV[nb][0]!=='block'&&MV[nb][0]!=='dodge'&&!MV[nb][3])KY.n=n;else if(MV[nb][3]&&MV[nb][0]!=='blink')KY.n=n;
   p.ncombo=Math.min(8,KY.n);chain(nb,1);return}}
 // ---- a3: hold the dive pose until the ground is reached ----
 if(k==='a3'&&nfi>=5&&!KY.landed){const fl=floorY();if(p.y<fl-4){KY.fall=true;p.ft=Math.min(p.ft,4.95);KY.vy=(KY.vy||300)+2600*dt;p.y=Math.min(fl,p.y+KY.vy*dt);applyFrameX(4);return}
  KY.landed=true;KY.Y0=fl;KY.Yt=fl;KY.vy=0;shake=Math.max(shake,8);spark(p.x,fl,10,['#fff','#d9c49a'],200);waves.push({x:p.x,y:fl,r:10,l:.6,big:false})}
 if(k!=='a3')KY.landed=false;
 // ---- end of the move with nothing queued ----
 if(ft>=L){if(isAir&&k!=='launch'||k==='launch'){endTo('air');return}
  if(k==='fin'){KY.n=0}endTo('ground');return}
 applyFrame(nfi)}
function applyFrameX(nfi){const k=KY.k;if(nfi!==KY.lastFi){move((rx(k,nfi)-rx(k,KY.lastFi))*RS,MV[k][0]!=='blink'&&k!=='fin');KY.lastFi=nfi;frameEvents(nfi)}}
function applyFrame(nfi){const k=KY.k;applyFrameX(nfi);if(!KY.k)return;
 if(KY.Yt!=null&&KY.Yt!==KY.Y0){const st=(MV[k][0]==='blink'?1400:650)*(KY.dt||.016),dy=KY.Yt-KY.Y0;KY.Y0+=Math.abs(dy)<=st?dy:Math.sign(dy)*st}   // glide to the juggle height, never snap
 const lt=ly(k,nfi);if(KY.lyS==null||KY.lyK!==k)KY.lyS=lt;if(KY.lyT!==lt){KY.lyR=Math.max(Math.abs(lt-KY.lyS)*FPS*1.25,30);KY.lyT=lt}
 KY.lyK=k;const ls=(KY.lyR||60)*(KY.dt||.016);if(!isFinite(KY.lyS))KY.lyS=lt;KY.lyS+=Math.abs(lt-KY.lyS)<=ls?lt-KY.lyS:Math.sign(lt-KY.lyS)*ls;
 p.y=KY.Y0-KY.lyS*RS;p.vx=0;p.vy=0;
 if(p.y>floorY())p.y=floorY();
 if(k==='dodge'&&nfi>=4)p.inv=Math.min(p.inv,.05)}
function counterFrom(s){const a=KY.k;rootJump(a,p.fi,'counter',s);start('counter',s);KY.n=Math.max(KY.n,1)}
// ---------- entry points the game calls for the ninja form ----------
function moves(dir){
 if(P.jump&&P.attack&&p.ground){delete P.jump;delete P.attack;KY.k=null;KY.n=1;KY.beat=true;p.miss=false;KY.last='';start('launch',0);p.ncombo=1;return true}   // Jump + Claw together = launcher
 if(P.jump)return false;   // a plain jump is the game's
 const inp=readInp();KY.k=null;
 if(!p.ground&&P.attack&&(K.up||K.jump||held('up'))&&p.vy<0&&now-(p.lastJump||-9)<.35&&KY.airN===0){delete P.attack;KY.n=1;KY.beat=true;p.miss=false;KY.last='';start('launch',0,{fromAir:1});p.ncombo=1;return true}   // ↑/Jump + Claw = launcher (the jump key fires first)
 if(!p.ground){if(P.attack){if(K.down||held('down'))inp.down=true;delete P.attack;KY.last=KY.airN>0?KY.last:'';start(pickC(inp,true,1,false),0);return true}
  if(P.tail){delete P.tail;start('a2',0);return true}return false}
 if(P.attack){delete P.attack;KY.n=1;KY.beat=true;KY.early=false;p.miss=false;KY.last='';if(KY.blkHit&&now-KY.blkHit<.7){KY.blkHit=0;start('counter',1)}else start(pickC(inp,false,1,false),0);p.ncombo=1;return true}   // Claw straight after a block = counter palm
 if(P.tail){delete P.tail;KY.n=1;KY.beat=true;p.miss=false;start('h2',0);p.ncombo=1;return true}
 if(P.special){delete P.special;KY.n=1;KY.beat=true;p.miss=false;start('counter',0);return true}
 return false}
function defence(){if(!isK())return;
 if(!['normal','land','crouch','stop','hardland'].includes(p.state))return;
 if(P.dodge&&p.ground){delete P.dodge;KY.k=null;start('dodge',0);return}
 if(P.guard&&p.ground){delete P.guard;KY.k=null;start('block',0);return}}
function blink(){if(KY.cool>0)return false;if(['nmorph','hurt','respawn','wallrun','lk','lkult','eclipse','finishhim'].includes(p.state))return false;
 if(p.state==='kt'&&KY.k!=='rec'){if(KY.k&&KY.k!=='fin')KY.q={b:'B',inp:readInp(),beat:false};return true}
 if(p.state==='kt')p.state='normal';
 KY.cool=.3;const air=!p.ground;KY.k=null;return start(air?'blinka':'blink',0)}
function dash(dir){p.face=dir==='right'?1:-1;p.dashCool=.4;p.dashStart=now;if(p.state==='kt'&&KY.k!=='rec')return;KY.k=null;start(p.ground?'blink':'blinka',0)}
// ---------- hook the game ----------
if(typeof NST!=='undefined'&&!NST.includes('kt'))NST.push('kt');
if(typeof UNG!=='undefined')UNG.add('kt');
if(typeof MAXT!=='undefined')MAXT.kt=3;
const _ns=nState;nState=function(S,dt,end,dir){if(S==='kt')return;return _ns.apply(this,arguments)};
const FREE=['normal','land','crouch','stop','hardland','zoomies','jcharge'];
function entry(){if(!isK())return;
 if(P.zoomies){delete P.zoomies;P.blink=1}
 if(P.swat){delete P.swat;P.attack=1}
 if(P.blink&&FREE.includes(p.state)){delete P.blink;blink();return}
 if(P.dash&&p.dashCool<=0&&FREE.includes(p.state)){const d=P.dash;delete P.dash;dash(d);return}
 if(p.state==='jcharge'&&P.attack){delete P.attack;p.state='normal';KY.k=null;KY.n=1;KY.beat=true;p.miss=false;KY.last='';start('launch',0);p.ncombo=1;return}   // Jump held + Claw = launcher (base would uppercut)
 if(!FREE.includes(p.state)||p.cool>0&&p.state!=='normal')return;
 if(P.guard||P.dodge){defence();if(p.state==='kt')return}
 if(P.attack||P.tail||P.special){acted=true;moves(0)}}
const _pre=r9Pre;r9Pre=function(dt){try{entry()}catch(e){console.warn('kt',e)}_pre(dt);try{tick(dt);defence()}catch(e){console.warn('kt',e)}};
const _cf=clawFx;clawFx=function(){if(isK()&&p.state==='kt')return;return _cf.apply(this,arguments)};
// defence vs the practice spar / any incoming hit
const _ds=dogStrike;dogStrike=function(d,dmg,kind){if(isK()&&p.state==='kt'&&KY.k){const dir=Math.sign(p.x-d.x)||-1;
  if(KY.k==='block'||(KY.k==='counter'&&p.fi<=2)){
   if(KY.k==='block'&&KY.bT<.2){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);flashT=Math.max(flashT,.15);hitstop=Math.max(hitstop,.08);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}
   KY.blkHit=now;say('BLOCKED!','#fff1c9',true);p.x+=dir*10;d.vx=-dir*160;d.vy=Math.min(d.vy||0,-220);d.cool=Math.max(d.cool||0,1.4);if(typeof dSet==='function'&&!d.cr)dSet(d,'hurt','r_hurt');
   d.flash=.16;shake=Math.max(shake,6);hitstop=Math.max(hitstop,.05);if(window.K29)K29.imp.push({x:p.x+p.face*55,y:p.y-95,l:1,big:false,col:'#fff1c9',rot:0});snd('pvo_hiss1',{v:.4,r:1.2,gap:.1});return true}
  if(KY.k==='dodge'&&p.t<.22){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}}
 return _ds.apply(this,arguments)};
const _cue=cueInfo;cueInfo=function(){if(KY.own()&&KY.n>=3&&KY.n<8&&KY.beat&&!p.miss&&!MV[KY.k][3]){const h=hitF(KY.k);if(h>=0)return{H:(h-(KY.s||0))/FPS+.2}}return _cue()};
const _op=openerNow;openerNow=function(){if(KY.own()){const n=KY.n+(KY.q&&KY.q.b==='C'?1:0);
  if(KY.k==='h2'&&now-lastTokT<.75){let t=0;for(let i=TOK.length-1;i>=0&&TOK[i].c==='T';i--)t++;if(t>=3)return{run:'TTT',W:.16,E:.5}}
  if(n>=3&&!p.miss&&!MV[KY.k][3]&&KY.k!=='fin')return{run:'C'.repeat(Math.min(n,8)),W:.07,E:.7}}return _op()};
const _ls=liveSeq;liveSeq=function(){if(KY.own()&&!LK.on)return 'C'.repeat(Math.min(8,KY.n));return _ls()};
const _fa=fa;fa=function(k){if(isK()&&k==='rec')return 'kt_rec';return _fa(k)};
// the base manners (groom / stretch ...) are old-art one-offs: skip them while the Kitty style is on
const _act=act;act=function(st,an,o){if(isK()&&st==='manner')return;return _act.apply(this,arguments)};
// ---------- the switch ----------
function setOn(v,quiet){KS.on=!!v;try{localStorage.setItem('paddyKitty36',KS.on?'1':'0')}catch(_){}
 if(!KS.on&&p.state==='kt'){KY.k=null;p.state='normal';setAnim('idle',true)}enforce();
 if(!quiet)say(KS.on?'KITTY PADDY STYLE!':'CLASSIC PADDY','#ffe08a',true);paintBtn()}
KS.set=setOn;
map.Digit0='kitty36';if(typeof INSTANT!=='undefined')INSTANT.push('kitty36');
function paintBtn(){const b=document.getElementById('kt36btn');if(b)b.textContent=KS.on?'🐱 KITTY STYLE: ON (base Paddy fights as Kitty Paddy)':'🐱 KITTY STYLE: OFF (classic base Paddy)'}
function addBtn(){const el=document.getElementById('clist');if(!el||document.getElementById('kt36btn'))return;const b=document.createElement('button');b.id='kt36btn';
 b.style.cssText='display:block;margin:6px auto;padding:8px 14px;border-radius:10px;border:2px solid #ffe08a;background:#3a2c10;color:#ffe08a;font:bold 14px sans-serif;cursor:pointer';
 b.onclick=e=>{e.stopPropagation();setOn(!KS.on)};b.ontouchend=e=>{e.preventDefault();e.stopPropagation();setOn(!KS.on)};el.prepend(b);paintBtn()}
// ---------- preload ----------
let asked=0;const _pre2=r9Pre;r9Pre=function(dt){try{if(P.kitty36){delete P.kitty36;setOn(!KS.on)}addBtn();
 if(asked<2&&window.queueFrames&&F&&F.kt_idle){const hi=isK();if(hi||asked===0){const L=[];for(const a in NEW)(frOf(NEW[a])||[]).forEach(q=>L.push(q.f));queueFrames([...new Set(L)],hi);asked=hi?2:1}}}catch(_){}_pre2(dt)};
(function early(){if(F&&F.kt_idle){enforce();return}setTimeout(early,30)})();
window.KITTY36.MV=MV;window.KITTY36.KY=KY;window.KITTY36.enforce=enforce;
})();
