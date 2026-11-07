// ===================== v38: KNIGHT PADDY (rebuilds the KNIGHT form slot, form 3 / p.xf===3) =====================
// Art: generated/forms/04_knight/sheets (magenta key) cut by src/cut_knight.py -> kg_* in frames.json, 12 fps, one form scale
// (K=0.3949, knight idle = base idle height). Engine and cancel rules = samurai37.js / ninja35.js (own state 'kg', own KN8 object).
// Heavy sword-and-shield: lights alternate shield and blade, every strike follows through into `recover` (shield back to guard).
// Pirate Paddy shares the x* functions: every hook here only takes over while Knight is the form, Pirate is untouched.
// Controls (keyboard / touch):
//   Claw (X / 🐾)        = next of the 1-2-3-4 string: SHIELD JAB -> THRUST -> FOREHAND CUT -> SHIELD UPPERCUT -> ...
//   → + Claw            = shield jab (a second → + Claw in a row = LOW CUT, the 1' of 1-1-2)
//   ↓ + Claw            = OVERHEAD CLEAVE              ↑ / Jump + Claw = SHIELD LAUNCHER (ends in the air)
//   Tail (T)            = SHIELD CHARGE                Meow (C)        = COUNTER CUT (shield parry + step-in cut)
//   Blink (N / Ctrl)    = CHARGE STEP dash-in (in the air: air charge step)   double-tap ← / → = charge step that way
//   hold 🛡 / B          = block (shield square)        tap 🛡 / O       = dodge (hop back behind the shield)
//   block / dodge right as a hit lands = COUNTER; Claw while blocking = counter cut
//   in the air: Claw = AIR SLASH -> AIR SHIELD BASH -> PLUNGE spike (lands); ↓ (+ Claw) = plunge
//   8-hit timed string: hits 1-3 any rhythm, then on the beat; hit 7 on the beat = OVERHEAD CLEAVE, an on-beat 8th press = BASTION finisher.
(function(){
if(typeof SM!=='function'||typeof xMoves!=='function'||typeof A==='undefined')return;
const isG=()=>{try{return FORM()===3&&p.xf===3}catch(_){return false}};
const FPS=12,RS=(typeof SC!=='undefined'&&SC)||.8;
const V1='#ffd34d',V2='#9cc2ff';
const MV={
 l1:['light','SHIELD JAB!','#cfe3ff',0,1], l2:['light','THRUST!','#ffffff',0,1], l3:['light','FOREHAND CUT!','#fff3c0',0,1],
 l4:['light','SHIELD UPPERCUT!','#9cc2ff',0,1], l5:['light','LOW CUT!','#ffe48a',0,1],
 h1:['heavy','OVERHEAD CLEAVE!','#ffd34d',0,2], h2:['heavy','SHIELD CHARGE!','#9cc2ff',0,2], launch:['launch','SHIELD LAUNCHER!','#ffd34d',0,2],
 a1:['air','AIR SLASH!','#ffffff',1,1], a2:['air','AIR SHIELD BASH!','#9cc2ff',1,1], a3:['spike','PLUNGE!','#ffd34d',1,2],
 blink:['blink','CHARGE STEP!',V2,0,0], blinka:['blink','AIR CHARGE STEP!',V2,1,0], block:['block','',V2,0,0], dodge:['dodge','',V2,0,0],
 counter:['counter','COUNTER CUT!','#7fffd4',0,2], fin:['fin','BASTION!!','#ffd34d',0,3]};
const KN8=window.KN8={k:null,s:0,q:null,lastFi:0,Y0:0,n:0,beat:true,early:false,hit:{},sfx:{},trav:0,face:1,last:'',str:[],airN:0,
 blkHit:0,bT:0,cool:0,log:[],hits:{},moves:[],
 own(){return isG()&&p.state==='kg'&&!!MV[this.k]}};
const fr=k=>(F&&F['kg_'+k])||[];
const at=(k,i)=>{const L=fr(k);return L[Math.max(0,Math.min(L.length-1,i))]||{}};
const RXFIX={};
const rx=(k,i)=>(k==='a3'&&i>=6)?(at(k,5).rx||0):(RXFIX[k]&&RXFIX[k][i]!=null?RXFIX[k][i]:(at(k,i).rx||0));
const ly=(k,i)=>at(k,i).ly||0;
const hitF=k=>{const L=fr(k);for(let i=0;i<L.length;i++)if(L[i].hit===1)return i;return -1};
const WALKSTEP=16;   // walk sheet: ~80 frame px of travel per 6-frame cycle
const lastF=k=>Math.max(0,fr(k).length-1);
// ---------- animation table: the new moves + every old kn_* anim pointed at on-model knight frames ----------
const NEW={};for(const k in MV)NEW['kg_'+k]=['kg_'+k,null,FPS,0];
Object.assign(NEW,{kg_idle:['kg_idle',null,8,1],kg_ready:['kg_ready',null,FPS,0],kg_walk:['kg_walk',null,FPS,1],kg_victory:['kg_victory',null,8,0],
 kg_rec:['kg_ready',[2,1,0],10,0]});
function remapOld(a){const n=a.replace(/^kn_/,'');
 if(n==='idle'||n==='calm')return NEW.kg_idle;if(n==='run')return ['kg_walk',null,16,1];
 if(/^(rise|apex|jump|fall|hurt|leap)$/.test(n))return ['kg_a1',[0],1,1];
 if(n==='land')return ['kg_dodge',[3,4],12,0];if(n==='victory')return NEW.kg_victory;
 if(/kneel|power|shout/.test(n))return ['kg_fin',[1,2],8,0];if(n==='guard'||n==='parry')return ['kg_block',[1,2],12,0];if(n==='counter')return ['kg_counter',[2,3,4,5],12,0];
 if(n==='dive'||n==='slam'||n==='ultP')return ['kg_a3',[2,3],12,0];if(n==='launch')return ['kg_launch',[2,3,4,5],14,0];if(/^rush/.test(n))return ['kg_h2',[2,3,4,5],14,0];
 if(/^air/.test(n))return ['kg_a1',[1,2,3,4],14,0];if(/^ult/.test(n))return ['kg_fin',[4,5,6,7,8],10,0];
 if(n==='rec')return ['kg_ready',[2,1,0],10,0];if(n==='combo')return ['kg_l1',[1,2,3,4,5],14,0];
 const H={h1:'l3',h2:'l2',h3:'h1',h4:'l1',h5:'l4',h6:'l3',h7:'h2'}[n];if(H)return ['kg_'+H,[1,2,3,4,5],14,0];
 return ['kg_l2',[1,2,3,4],14,0]}
const OLD={};for(const a of Object.keys(A))if(/^kn_/.test(a))OLD[a]=remapOld(a);
['kn_hurt','kn_dive','kn_victory','kn_rec','kn_fall','kn_rise'].forEach(a=>{if(!OLD[a])OLD[a]=remapOld(a)});
const ALL=Object.assign({},OLD,NEW);
for(const a in ALL)A[a]=ALL[a];
try{for(const a of Object.keys(SMOOTH.SMA))if(/^kn_/.test(a)){delete SMOOTH.SMA[a];SMOOTH.DONE.add(a)}}catch(_){}
try{if(typeof UPG!=='undefined')for(const a of Object.keys(UPG))if(/^kn_/.test(a))delete UPG[a]}catch(_){}
const frOf=v=>{const L=F&&F[v[0]];if(!L)return null;return v[1]?v[1].filter(i=>i<L.length).map(i=>L[i]):L};
const MYFR={};
function enforce(){if(!F||!F.kg_idle)return;for(const a in ALL){const want=ALL[a];if(A[a]!==want)A[a]=want;if(!MYFR[a]){const f=frOf(want);if(f&&f.length)MYFR[a]=f}if(MYFR[a]&&FR[a]!==MYFR[a]&&p.anim!==a)FR[a]=MYFR[a]}}
Object.assign(NAMES,{kg_l1:'SHIELD JAB!',kg_l2:'THRUST!',kg_l3:'FOREHAND CUT!',kg_l4:'SHIELD UPPERCUT!',kg_l5:'LOW CUT!',kg_h1:'OVERHEAD CLEAVE!',kg_h2:'SHIELD CHARGE!',
 kg_launch:'SHIELD LAUNCHER!',kg_a1:'AIR SLASH!',kg_a2:'AIR SHIELD BASH!',kg_a3:'PLUNGE!',kg_counter:'COUNTER CUT!',kg_fin:'BASTION!!'});
Object.assign(KB,{kg_l1:[45,-60,0,.05],kg_l2:[50,-70,0,.05],kg_l3:[60,-90,0,.05],kg_l4:[60,-70,0,.05],kg_l5:[80,-90,0,.055],
 kg_h1:[150,-420,.2,.08],kg_h2:[300,-280,.08,.085],kg_launch:[50,-760,.55,.08],kg_a1:[70,-230,.4,.05],kg_a2:[110,-240,.4,.055],
 kg_a3:[160,900,0,.09],kg_counter:[380,-380,.2,.1],kg_fin:[480,-1150,.6,.16]});
const BOX={light:[195,95,95],heavy:[225,70,110],launch:[200,140,150],air:[185,80,120],spike:[175,60,150],counter:[225,95,110],fin:[210,140,190]};
const LIM={light:70,heavy:130,launch:100,air:120,spike:90,counter:120,fin:420,blink:520,block:30,dodge:90};
// ---------- helpers ----------
const snd=(k,o)=>{try{window.SND&&SND.play&&SND.play(k,o||{})}catch(_){}};
const rnd=a=>a[Math.floor(Math.random()*a.length)];let hissN=0;
function effort(cue){KN8.log.push(cue);if(KN8.log.length>40)KN8.log.shift();
 if(cue==='hup')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.42,r:1.18+Math.random()*.1,gap:.18});
 else if(cue==='GRUNT')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.8,r:.98,gap:.2});
 else if(cue==='hiss')snd(['pvo_hiss1','pvo_hiss2','pvo_hiss3'][hissN++%3],{v:.55,r:1.1,gap:.2});
 else if(cue==='HISS')snd('pvo_hiss2',{v:.9,r:.92,gap:.2});
 else if(cue==='BIG GRUNT'){snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:1,r:.84,gap:.2});snd('pvo_growl1',{v:.5,gap:.3})}}
function floorY(){return typeof floorAt==='function'?floorAt(p.x):GROUND}
function target(range,airOnly){let best=null,bd=range;for(const d of dummies){if(!d.alive||d.benched)continue;if(airOnly&&d.y>GROUND-30)continue;
 const dd=Math.abs(d.x-p.x)+((d.x-p.x)*p.face<0?140:0)+(airOnly?Math.abs(d.y-p.y)*.5:0);if(dd<bd){bd=dd;best=d}}return best}
function move(dx,glide){if(!dx)return;let d=p.face*dx*KN8.mul;const K0=MV[KN8.k][0];
 if(d*p.face>0&&K0!=='blink'&&K0!=='fin'){for(const q of dummies){if(!q.alive||q.benched)continue;const g=(q.x-p.x)*p.face;if(g>-20&&g<88&&Math.abs(q.y-p.y)<150){d=0;break}}}
 const room=(LIM[K0]||80)-KN8.trav;if(room<=0)d=0;else if(Math.abs(d)>room)d=Math.sign(d)*room;KN8.trav+=Math.abs(d);
 if(glide){KN8.pend=(KN8.pend||0)+d;KN8.prate=Math.max(Math.abs(KN8.pend)*FPS,60);return}
 p.x+=d;if(typeof clampX==='function')p.x=clampX(p.x)}
// root motion of one drawn frame is spread over that frame (the big kitty lunges / pounces would otherwise jump 60-75 px in one go)
function glide(dt){if(!KN8.pend)return;const st=Math.sign(KN8.pend)*Math.min(Math.abs(KN8.pend),KN8.prate*dt);p.x+=st;KN8.pend-=st;if(Math.abs(KN8.pend)<.01)KN8.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}
function flush(){if(KN8.pend){p.x+=KN8.pend;KN8.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}}
// a direction tapped together with Claw counts even if it was let go a moment before the press is read (hit-stop holds the update)
const KTT={right:-9,left:-9,down:-9,up:-9};(function poll(){try{const t=performance.now()/1000;if(K.right)KTT.right=t;if(K.left)KTT.left=t;if(K.down)KTT.down=t;if(K.up||K.jump)KTT.up=t}catch(_){}requestAnimationFrame(poll)})();
const held=(k)=>performance.now()/1000-KTT[k]<.16;
function readInp(){const f=p.face>0?'right':'left',b=p.face>0?'left':'right',turned=performance.now()/1000-(KN8.turnT||-9)<.25;return{down:held('down'),up:held('up'),fwd:!turned&&held(f),back:held(b)}}
// ---------- which move a press throws ----------
const NEXT={'':'l1',l1:'l2',l2:'l3',l3:'l4',l4:'l1',l5:'l2',h1:'l1',h2:'l1',counter:'l2',blink:'l1',dodge:'l1',block:'counter',a3:'l1',fin:'l1',launch:'a1',a1:'a2',a2:'a3',blinka:'a1'};
function pickC(inp,air,n,beat){
 if(air){if(inp.down||KN8.airN>=2)return 'a3';return KN8.last==='a1'?'a2':KN8.last==='a2'?'a3':'a1'}
 if(n===7&&beat)return 'h1';                                   // 8-hit string: hit 7 on the beat is the low sweep
 if(KN8.k==='block')return 'counter';
 if(inp.up)return 'launch';if(inp.down)return 'h1';if(inp.fwd)return KN8.last==='l1'?'l5':'l1';
 return NEXT[KN8.last||'']||'l1'}
function pick(q,n,beat){const inAir=KN8.k?(KN8.k==='launch'||(MV[KN8.k][3]&&KN8.k!=='a3')):!p.ground;
 if(q.b==='B')return inAir?'blinka':'blink';if(q.b==='G')return inAir?null:'block';if(q.b==='O')return inAir?null:'dodge';
 if(q.b==='M')return inAir?'a2':'counter';if(q.b==='T')return inAir?'a2':'h2';
 return pickC(q.inp,inAir,n,beat)}
// ---------- start a move ----------
function start(k,s,o){o=o||{};const prev=KN8.k,M=MV[k];if(!fr(k).length)return false;flush();
 const fromAir=prev?(prev==='launch'||(MV[prev][3]&&prev!=='a3')):!p.ground;
 p.state='kg';p.t=0;p.vx=0;p.vy=0;p.wall=false;acted=true;p.shot=false;p.queued=false;
 if(typeof tokAct==='function'&&(M[0]==='light'||M[0]==='heavy'&&k!=='h2'||M[0]==='air'||M[0]==='spike'||M[0]==='launch'))tokAct('claw');
 if(k==='h2'&&typeof tokAct==='function')tokAct('tailwhip');
 setAnim('kg_'+k,true);p.ft=s;p.fi=s;if(s>0||o.cut){p.blend=0;p.prevF=null}
 KN8.k=k;KN8.s=s;KN8.q=null;KN8.early=false;KN8.hit={};KN8.sfx={};KN8.lastFi=s;KN8.trav=0;KN8.face=p.face;KN8.mul=1;KN8.fall=false;KN8.t0=now;
 if(M[3]){   // air move: keep the current baseline, or set it so frame s sits where Paddy is now
  if(!(prev&&fromAir))KN8.Y0=p.y+ly(k,s)*RS;
  KN8.Yt=KN8.Y0;const d=target(420,true);if(d&&M[0]!=='blink'){const want=d.y+ly(k,s)*RS+10;KN8.Yt=KN8.Y0+Math.max(-150,Math.min(150,want-KN8.Y0))}
 }else{KN8.Y0=o.fromAir?Math.min(floorY(),p.y+ly(k,s)*RS):floorY();KN8.Yt=KN8.Y0}
 // blinks and the finisher's dash close the real gap to the enemy (scale the drawn travel to land just in front of him)
 if(M[0]==='blink'||k==='fin'){const d=target(k==='blinka'?520:620,k==='blinka');const tr=k==='fin'?rx(k,5)-rx(k,s):rx(k,lastF(k))-rx(k,s);
  if(d&&tr>0){if(Math.abs(d.x-p.x)>25)p.face=d.x>=p.x?1:-1;KN8.face=p.face;const gap=Math.abs(d.x-p.x)-(k==='fin'?95:80);KN8.mul=Math.max(.15,Math.min(1.6,gap/(tr*RS)));
   if(k==='blinka'&&d.y<GROUND-30){KN8.Yt=KN8.Y0+Math.max(-160,Math.min(160,(d.y+ly(k,0)*RS+10)-KN8.Y0))}}
  else KN8.mul=k==='fin'?.25:1;
  if(M[0]==='blink'){p.inv=Math.max(p.inv,.3);puffShadow(p.x,p.y)}}
 if(k==='counter'){const d=target(300);const tr=rx(k,3)-rx(k,s);if(d&&tr>0){const gap=Math.abs(d.x-p.x)-110;KN8.mul=Math.max(.6,Math.min(4,gap/(tr*RS)))}}   // the counter palm steps in to reach him
 KN8.lyS=ly(k,s);KN8.lyT=KN8.lyS;KN8.lyK=k;KN8.lyR=60;p.y=KN8.Y0-ly(k,s)*RS;p.ground=p.y>=floorY()-1;
 if(M[0]!=='blink'&&M[0]!=='block'&&M[0]!=='dodge'){C.atk++;if(M[1]&&!o.quiet)say(M[1],M[2],M[4]>=3)}
 if(k==='dodge'){p.inv=Math.max(p.inv,.36);say('DODGE!','#bfe8ff')}
 if(k==='block'){KN8.bT=0;KN8.blkHit=0}
 if(M[3])KN8.airN+=(M[0]==='air'||M[0]==='spike')?1:0;
 KN8.last=k;KN8.str.push(k);if(KN8.str.length>16)KN8.str.shift();KN8.moves.push(k);if(KN8.moves.length>40)KN8.moves.shift();
 frameEvents(s);return true}
// root jump for a cancel: the next move's frame 1 sits where this move's last frame would have been
function rootJump(a,fromFi,b,s){flush();const d=(rx(a,lastF(a))-rx(a,fromFi))+rx(b,s)-rx(b,0);KN8.mul=1;KN8.trav=0;KN8.k=a;move(d*RS)}
function chain(b,s){const a=KN8.k,fi=p.fi;rootJump(a,fi,b,s);return start(b,s)}
// ---------- per-frame events: effort sounds, hits ----------
function frameEvents(fi){const k=KN8.k,f=at(k,fi);if(f.sfx&&!KN8.sfx[fi]){KN8.sfx[fi]=1;effort(f.sfx)}
 if(f.hit===1&&!KN8.hit[fi]){KN8.hit[fi]=1;strike(k,fi)}
 if(k==='fin'&&f.hit>=2){hitstop=Math.max(hitstop,.06)}       // 3-frame hold on the finisher
 const K0=MV[k][0];if((K0==='blink')&&(fi===2||fi===1&&k==='blinka')){for(let i=1;i<=4;i++)ghosts.push({x:p.x-p.face*i*38,y:p.y,f:(FR['kg_'+k]||[])[fi],face:p.face,l:.12+i*.04,blue:1})}
 if(fi===lastF(k)&&K0!=='blink'&&!MV[k][3]&&ly(k,fi-1)>20)spark(p.x,floorY(),6,'#d9c49a',110)}
function strike(k,fi){const px0=p.x;p.x+=KN8.pend||0;try{strike0(k,fi)}finally{p.x=px0}}   // reach is measured from where this frame's glide ends
function strike0(k,fi){const M=MV[k],B=BOX[M[0]];if(!B)return;let n=0;const shield=/^(l1|l4|h2|a2)$/.test(k);
 const tx=p.x+p.face*B[0]*.55,ty=p.y-B[1];
 for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face,h=d.h||165;
  if(g<-40||g>B[0]+(d.w||0)*.3)continue;if(d.y-h>ty+B[2]||d.y<ty-B[2])continue;
  if(k==='a1'||k==='a2'||k==='blinka'){d.x+=(p.x+p.face*110-d.x)*.35}
  hitDummy(d,'kg_'+k,p.face);n++;
  if(M[3]&&k!=='a3'){d.vy=-300;d.fl=Math.max(d.fl||0,.5)}           // air hits keep him floating in reach instead of rocketing him away
  if(k==='launch'&&d.y<GROUND+1){d.vy=Math.max(d.vy,-560);d.fl=Math.max(d.fl||0,.6)}
  if(k==='fin'){d.hp=Math.min(d.hp,0);finFx(d)}}
 KN8.hits[k]=(KN8.hits[k]||0)+n;if(n&&shield){try{clang()}catch(_){}}
 // minimal FX from the sheets: small white/lavender burst + 3 speed lines at the strike tip (also on a whiff, smaller)
 const big=M[4]>=2;for(let i=0;i<(n?(big?14:8):3);i++){const a=(p.face>0?0:Math.PI)+(Math.random()-.5)*2.4,v=160+Math.random()*(big?420:260);sparks.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.22,c:i%2?'#fff':M[2]})}
 if(n&&window.K29)for(let i=0;i<3;i++)K29.imp.push({streak:1,x:tx-p.face*(70+i*14),y:ty-14+i*14,face:p.face,len:60+i*10,col:i===1?V2:V1,l:1,d:0});
 if(n){shake=Math.max(shake,M[4]>=3?18:big?8:4);if(M[4]>=2)waves.push({x:tx,y:ty,r:12,l:.6,big:M[4]>=3})}}
function finFx(d){slowT=Math.max(slowT,.55);flashT=Math.max(flashT,.3);hitstop=Math.max(hitstop,.14);cine.tz=1.15;
 for(let i=0;i<3;i++)waves.push({x:d.x,y:d.y-80+i*12,r:10+i*30,l:1,big:true});if(typeof burst==='function'){burst(d.x,d.y-90);burst(d.x,d.y-150,1)}
 for(let i=0;i<46;i++){const a=Math.random()*6.28,v=200+Math.random()*650;sparks.push({x:d.x,y:d.y-90,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,l:.7,c:['#fff','#ffd34d','#9cc2ff','#e8e8ff'][i%4]})}
 cine.pillar={x:d.x,l:1,col:'#ffd34d'};card('BASTION!','KNIGHT FINISHER · 8 HITS','#ffd34d');try{crest(d.x,d.y-150,1.3,{l:1.5});clang()}catch(_){}}
// ---------- the move state (runs before the game's own state code, like punch33) ----------
function endTo(normal){const k=KN8.k;KN8.k=null;p.state='normal';p.vx=0;p.vy=0;p.cool=.04;
 if(normal==='air'){p.ground=false;setAnim('kn_fall')}else{p.y=Math.min(p.y,floorY());if(k&&!MV[k][3]&&k!=='block'&&k!=='dodge'){p.state='kg';KN8.k='rec';p.t=0;setAnim('kg_rec',true);p.blend=0;p.prevF=null;p.ft=0;p.fi=0}}
 if(normal!=='air'){KN8.n=0;KN8.beat=true;KN8.last='';KN8.airN=0;p.ncombo=0}}
let enfT=0;
function tick(dt){
 KN8.cool-=dt;KN8.dt=dt;
 enfT-=dt;if(enfT<=0||isG()){enfT=.5;enforce()}
 if(!isG()){if(KN8.k){KN8.k=null}if(p.state==='kg')p.state='normal';return}
 if(A.kn_run===ALL.kn_run)A.kn_run[2]=Math.max(7,Math.min(22,Math.abs(p.vx)/(WALKSTEP*RS)));
 // walk cycle speed follows the run speed so the feet don't skate
  if(p.state!=='kg'){if(KN8.k)KN8.k=null;if(p.ground&&p.state==='normal')KN8.airN=0;return}
 const k=KN8.k;
 if(k==='rec'){   // short recovery back to the upright idle; any press or move goes straight on
  const b=P.attack||P.tail||P.special||P.guard||P.dodge||P.jump||P.blink;
  if(b||K.left||K.right||!p.ground||p.ft+dt*10>=3){KN8.k=null;p.state='normal';p.vx=0;
   if(P.blink){delete P.blink;blink()}else if(P.guard||P.dodge)defence();else if(P.attack||P.tail||P.special)moves(0)}return}
 if(!k||!MV[k]){p.state='normal';return}const M=MV[k],L=fr(k).length;glide(dt);
 if(p.t>1.2)p.t=1.2;    // long holds (block) stay under the game's safety net
 // turning round mid-combo (also when the game's own input code already flipped him)
 if(p.face!==KN8.face&&M[0]!=='blink'){KN8.face=p.face;KN8.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1}
 const want=P.left?-1:P.right?1:0;
 if(want&&want!==p.face&&M[0]!=='blink'&&k!=='dodge'){p.face=want;KN8.face=want;KN8.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1;if(C.n>0)C.t=Math.max(C.t,C.max);
  for(let i=0;i<6;i++)sparks.push({x:p.x,y:p.y-60-Math.random()*60,vx:want*(120+Math.random()*200),vy:(Math.random()-.5)*120,l:.25,c:'#fff'})}
 const fi=p.fi,ft=p.ft+dt*FPS,nfi=Math.min(L-1,Math.floor(ft)),hf=hitF(k),buf=hf>=0?hf:1;
 // ---- input ----
 const isAir=k==='launch'||(M[3]&&k!=='a3');
 let b=null;if(P.attack){delete P.attack;b='C'}else if(P.tail){delete P.tail;b='T'}else if(P.special){delete P.special;b='M'}else if(P.blink){delete P.blink;b='B'}
 else if(P.dodge){delete P.dodge;b='O'}else if(P.guard&&k!=='block'){delete P.guard;b='G'}
 if(isAir&&P.down&&!b){delete P.down;b='C';KN8.forceSpike=1}
 if(P.jump&&fi>=buf&&k!=='fin'&&M[0]!=='block'){KN8.k=null;p.state='normal';p.vy=0;p.cool=0;if(!isAir){p.ground=true;p.y=floorY()}else setAnim('kn_fall');return}   // jump cancel: xMoves -> xJump takes the press
 if(b){acted=true;
  if(k==='block'){if(b==='C'||b==='M'){counterFrom(KN8.blkHit&&now-KN8.blkHit<.7?2:1);return}if(b==='O'){KN8.q={b:'O',inp:readInp(),beat:false}}}
  else if(k==='fin'){}
  else{const inp=readInp();if(KN8.forceSpike){inp.down=true;KN8.forceSpike=0}
   const on=fi>=buf&&!KN8.early;if(fi<buf&&b==='C')KN8.early=true;
   if(!KN8.q||fi>=buf)KN8.q={b,inp,beat:on}}}
 // ---- block: hold ----
 if(k==='block'){KN8.bT+=dt;const held=K.guard;
  if(held&&ft>=4.9){p.ft=Math.min(p.ft,3.9);applyFrame(3);p.t=Math.min(p.t,.6);return}
  if(!held&&KN8.bT<.16&&!KN8.blkHit&&fi<=1){rootJump('block',fi,'dodge',1);start('dodge',1);return}
  if(!held&&fi<4){p.ft=Math.max(p.ft,4);}
  if(KN8.q&&KN8.q.b==='O'){KN8.q=null;rootJump('block',fi,'dodge',1);start('dodge',1);return}}
 // ---- cancel point: end of frame n-1 -> the next move from its frame 2 ----
 const q=KN8.q,cut=L-1;
 if(q&&k!=='fin'&&ft>=cut&&fi>=buf){KN8.q=null;const n=KN8.n+1,strikeNext=q.b==='C';
  if(KN8.n>=3&&strikeNext)KN8.beat=KN8.beat&&q.beat;
  if(strikeNext&&KN8.n>=3&&!q.beat)p.miss=true;
  // an on-beat 8th press = the crescent finisher
  if(strikeNext&&!isAir&&KN8.n===7&&KN8.beat&&q.beat){say('PERFECT!','#7fffd4',true);KN8.n=8;rootJump(k,fi,'fin',1);start('fin',1);return}
  let nb=pick(q,n,KN8.beat&&q.beat&&KN8.n>=3);if(!nb){KN8.q=null}
  else{if(strikeNext&&KN8.n>=3&&KN8.beat&&q.beat&&!isAir){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false})}
   if(MV[nb][0]!=='blink'&&MV[nb][0]!=='block'&&MV[nb][0]!=='dodge'&&!MV[nb][3])KN8.n=n;else if(MV[nb][3]&&MV[nb][0]!=='blink')KN8.n=n;
   p.ncombo=Math.min(8,KN8.n);chain(nb,1);return}}
 // ---- a3: hold the dive pose until the ground is reached ----
 if(k==='a3'&&nfi>=5&&!KN8.landed){const fl=floorY();if(p.y<fl-4){KN8.fall=true;p.ft=Math.min(p.ft,4.95);KN8.vy=(KN8.vy||300)+2600*dt;p.y=Math.min(fl,p.y+KN8.vy*dt);applyFrameX(4);return}
  KN8.landed=true;KN8.Y0=fl;KN8.Yt=fl;KN8.vy=0;shake=Math.max(shake,8);spark(p.x,fl,10,['#fff','#d9c49a'],200);waves.push({x:p.x,y:fl,r:10,l:.6,big:false})}
 if(k!=='a3')KN8.landed=false;
 // ---- end of the move with nothing queued ----
 if(ft>=L){if(isAir&&k!=='launch'||k==='launch'){endTo('air');return}
  if(k==='fin'){KN8.n=0}endTo('ground');return}
 applyFrame(nfi)}
function applyFrameX(nfi){const k=KN8.k;if(nfi!==KN8.lastFi){move((rx(k,nfi)-rx(k,KN8.lastFi))*RS,MV[k][0]!=='blink'&&k!=='fin');KN8.lastFi=nfi;frameEvents(nfi)}}
function applyFrame(nfi){const k=KN8.k;applyFrameX(nfi);if(!KN8.k)return;
 if(KN8.Yt!=null&&KN8.Yt!==KN8.Y0){const st=(MV[k][0]==='blink'?1400:650)*(KN8.dt||.016),dy=KN8.Yt-KN8.Y0;KN8.Y0+=Math.abs(dy)<=st?dy:Math.sign(dy)*st}   // glide to the juggle height, never snap
 const lt=ly(k,nfi);if(KN8.lyS==null||KN8.lyK!==k)KN8.lyS=lt;if(KN8.lyT!==lt){KN8.lyR=Math.max(Math.abs(lt-KN8.lyS)*FPS*1.25,30);KN8.lyT=lt}
 KN8.lyK=k;const ls=(KN8.lyR||60)*(KN8.dt||.016);if(!isFinite(KN8.lyS))KN8.lyS=lt;KN8.lyS+=Math.abs(lt-KN8.lyS)<=ls?lt-KN8.lyS:Math.sign(lt-KN8.lyS)*ls;
 p.y=KN8.Y0-KN8.lyS*RS;p.vx=0;p.vy=0;
 if(p.y>floorY())p.y=floorY();
 if(k==='dodge'&&nfi>=4)p.inv=Math.min(p.inv,.05)}
function counterFrom(s){const a=KN8.k;rootJump(a,p.fi,'counter',s);start('counter',s);KN8.n=Math.max(KN8.n,1)}
// ---------- entry points the game calls for the ninja form ----------
function moves(dir){
 if(P.jump&&P.attack&&p.ground){delete P.jump;delete P.attack;KN8.k=null;KN8.n=1;KN8.beat=true;p.miss=false;KN8.last='';start('launch',0);p.ncombo=1;return true}   // Jump + Claw together = launcher
 if(P.jump&&xJump())return true;
 const inp=readInp();KN8.k=null;
 if(!p.ground&&P.attack&&(K.up||K.jump||held('up'))&&p.vy<0&&now-(p.lastJump||-9)<.35&&KN8.airN===0){delete P.attack;KN8.n=1;KN8.beat=true;p.miss=false;KN8.last='';start('launch',0,{fromAir:1});p.ncombo=1;return true}   // ↑/Jump + Claw = launcher (the jump key fires first)
 if(!p.ground){if(P.attack){if(K.down||held('down'))inp.down=true;delete P.attack;KN8.last=KN8.airN>0?KN8.last:'';start(pickC(inp,true,1,false),0);return true}
  if(P.tail){delete P.tail;start('a2',0);return true}return false}
 if(P.attack){delete P.attack;KN8.n=1;KN8.beat=true;KN8.early=false;p.miss=false;KN8.last='';if(KN8.blkHit&&now-KN8.blkHit<.7){KN8.blkHit=0;start('counter',1)}else start(pickC(inp,false,1,false),0);p.ncombo=1;return true}   // Claw straight after a block = counter palm
 if(P.tail){delete P.tail;KN8.n=1;KN8.beat=true;p.miss=false;start('h2',0);p.ncombo=1;return true}
 if(P.special){delete P.special;KN8.n=1;KN8.beat=true;p.miss=false;start('counter',0);return true}
 return false}
function defence(){if(!isG())return;
 if(!['normal','land','knflip'].includes(p.state))return;
 if(P.dodge&&p.ground){delete P.dodge;KN8.k=null;start('dodge',0);return}
 if(P.guard&&p.ground){delete P.guard;KN8.k=null;start('block',0);return}}
function blink(){if(KN8.cool>0)return false;if(['nmorph','hurt','respawn','wallrun','lk','lkult','eclipse','finishhim'].includes(p.state))return false;
 if(p.state==='kg'&&KN8.k!=='rec'){if(KN8.k&&KN8.k!=='fin')KN8.q={b:'B',inp:readInp(),beat:false};return true}
 if(p.state==='kg')p.state='normal';
 KN8.cool=.3;const air=!p.ground;KN8.k=null;return start(air?'blinka':'blink',0)}
function dash(dir){p.face=dir==='right'?1:-1;p.dashCool=.4;p.dashStart=now;if(p.state==='kg'&&KN8.k!=='rec')return;KN8.k=null;start(p.ground?'blink':'blinka',0)}
// ---------- hook the game (Knight only: Pirate shares the x* functions and keeps them) ----------
const _xm=xMoves;xMoves=function(dir){if(!isG())return _xm.apply(this,arguments);try{moves(dir)}catch(e){console.warn('kg',e)}};
const _xb=xBlink;xBlink=function(){if(!isG())return _xb.apply(this,arguments);return blink()};
const _xd=xDash;xDash=function(dir){if(!isG())return _xd.apply(this,arguments);dash(dir)};
const _xh=xHit;xHit=function(i){if(!isG())return _xh.apply(this,arguments);KN8.k=null;KN8.n=1;start(p.ground?(K.up?'launch':'l1'):'a1',0)};
const _xa=xAir;xAir=function(){if(!isG())return _xa.apply(this,arguments);KN8.k=null;start('a1',0);return true};
const _xl=xLaunch;xLaunch=function(){if(!isG())return _xl.apply(this,arguments);KN8.k=null;start('launch',0)};
const _xv=xDive;xDive=function(){if(!isG())return _xv.apply(this,arguments);KN8.k=null;start('a3',0)};
const _xt=xTail;xTail=function(){if(!isG())return _xt.apply(this,arguments);KN8.k=null;start(p.ground?'block':'a2',0)};
const _xc=xCancel;xCancel=function(){if(!isG())return _xc.apply(this,arguments);if(P.jump&&xJump())return true;if(P.blink){delete P.blink;return blink()}return false};
if(typeof XST!=='undefined')XST.add('kg');
if(typeof UNG!=='undefined')UNG.add('kg');
const _xs=xState;xState=function(S,dt,end,dir){if(S==='kg')return;return _xs.apply(this,arguments)};
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{tick(dt);defence()}catch(e){console.warn('kg',e)}};
// the old claw slash arcs and generic hit sparks don't belong on the drawn strikes
const _cf=clawFx;clawFx=function(){if(isG()&&p.state==='kg')return;return _cf.apply(this,arguments)};
// defence vs the practice spar / any incoming hit: block, perfect block = counter, early dodge = counter
const _ds=dogStrike;dogStrike=function(d,dmg,kind){if(isG()&&p.state==='kg'&&KN8.k){const dir=Math.sign(p.x-d.x)||-1;
  if(KN8.k==='block'||(KN8.k==='counter'&&p.fi<=2)){
   if(KN8.k==='block'&&KN8.bT<.2){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);flashT=Math.max(flashT,.15);hitstop=Math.max(hitstop,.08);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}
   KN8.blkHit=now;say('BLOCKED!','#cfe3ff',true);p.x+=dir*10;d.vx=-dir*160;d.vy=Math.min(d.vy||0,-220);d.cool=Math.max(d.cool||0,1.4);if(typeof dSet==='function'&&!d.cr)dSet(d,'hurt','r_hurt');
   d.flash=.16;shake=Math.max(shake,6);hitstop=Math.max(hitstop,.05);if(window.K29)K29.imp.push({x:p.x+p.face*55,y:p.y-95,l:1,big:false,col:'#cfe3ff',rot:0});try{clang()}catch(_){};return true}
  if(KN8.k==='dodge'&&p.t<.22){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}}
 return _ds.apply(this,arguments)};
// beat ring: green from the impact frame of the current move (hits 3-7 of a clean string)
const _cue=cueInfo;cueInfo=function(){if(KN8.own()&&KN8.n>=3&&KN8.n<8&&KN8.beat&&!p.miss&&!MV[KN8.k][3]){const h=hitF(KN8.k);if(h>=0)return{H:(h-(KN8.s||0))/FPS+.2}}return _cue()};
// link routes: 3+ clean hits open ROUTES[3] (Tail / Meow / Blink), TTT open the T routes
const _op=openerNow;openerNow=function(){if(KN8.own()){const n=KN8.n+(KN8.q&&KN8.q.b==='C'?1:0);
  if(KN8.k==='h2'&&now-lastTokT<.75){let t=0;for(let i=TOK.length-1;i>=0&&TOK[i].c==='T';i--)t++;if(t>=3)return{run:'TTT',W:.16,E:.5}}
  if(n>=3&&!p.miss&&!MV[KN8.k][3]&&KN8.k!=='fin')return{run:'C'.repeat(Math.min(n,8)),W:.07,E:.7}}return _op()};
const _ls=liveSeq;liveSeq=function(){if(KN8.own()&&!LK.on)return 'C'.repeat(Math.min(8,KN8.n));return _ls()};
// the knight victory pose
const _fa=fa;fa=function(k){if(isG()&&!p.uf){if(k==='rec')return 'kg_rec'}return _fa(k)};
// ---------- preload: every knight frame first once Knight is picked (and quietly in the background before that) ----------
let asked=0;const _pre2=r9Pre;r9Pre=function(dt){try{if(asked<2&&window.queueFrames&&F&&F.kg_idle){const hi=isG();if(hi||asked===0){const L=[];for(const a in ALL)(frOf(ALL[a])||[]).forEach(q=>L.push(q.f));queueFrames([...new Set(L)],hi);asked=hi?2:1}}}catch(_){}_pre2(dt)};
(function early(){if(F&&F.kg_idle){enforce();return}setTimeout(early,30)})();
window.KNIGHT38={MV,KN8,ALL,BOX,enforce};
})();
