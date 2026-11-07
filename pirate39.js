// ===================== v39: PIRATE PADDY (rebuilds the PIRATE form slot, form 4 / p.xf===4) =====================
// Art: generated/forms/05_pirate/sheets (magenta key) cut by src/cut_pirate.py -> pr_* in frames.json, 12 fps, one form scale
// (K=0.3846, pirate idle = base idle height). Engine and cancel rules = knight38.js / samurai37.js (own state 'pr', own PR9 object).
// Swaggering swashbuckler on sea legs: cutlass, boot and hilt, every strike throws the whole body and ends on a cocky wrist twirl.
// Knight Paddy shares the x* functions: every hook here only takes over while Pirate is the form, Knight is untouched.
// Controls (keyboard / touch):
//   Claw (X / 🐾)        = next of the 1-2-3-4 string: FLICK -> BACKHAND -> BOOT KICK -> HILT PUNCH -> ...
//   → + Claw            = flick (a second → + Claw in a row = DRUNKEN LURCH, the 1' of 1-1-2)
//   ↓ + Claw            = CORKSCREW                    ↑ / Jump + Claw = SCOOP launcher (ends in the air)
//   Tail (T)            = FLÈCHE (flying lunge)        Meow (C)        = RIPOSTE (parry + step-in thrust)
//   Blink (N / Ctrl)    = DECK ROLL dash-in (in the air: air somersault)   double-tap ← / → = deck roll that way
//   hold 🛡 / B          = block (hanging guard)        tap 🛡 / O       = dodge (limbo lean-back)
//   block / dodge right as a hit lands = COUNTER; Claw while blocking = riposte
//   in the air: Claw = AIR SLASH -> AIR BOOT KICK -> CROW'S NEST drop spike (lands); ↓ (+ Claw) = crow's nest
//   8-hit timed string: hits 1-3 any rhythm, then on the beat; hit 7 on the beat = CORKSCREW, an on-beat 8th press = JOLLY ROGER finisher.
(function(){
if(typeof SM!=='function'||typeof xMoves!=='function'||typeof A==='undefined')return;
const isG=()=>{try{return FORM()===4&&p.xf===4}catch(_){return false}};
const FPS=12,RS=(typeof SC!=='undefined'&&SC)||.8;
const V1='#ffcf3f',V2='#2ec4d6';
const MV={
 l1:['light','FLICK!','#ffffff',0,1], l2:['light','BACKHAND!','#bff4ff',0,1], l3:['light','BOOT KICK!','#ffe48a',0,1],
 l4:['light','HILT PUNCH!','#ffcf3f',0,1], l5:['light','DRUNKEN LURCH!','#ffb38a',0,1],
 h1:['heavy','CORKSCREW!','#ffcf3f',0,2], h2:['heavy','FLÈCHE!','#2ec4d6',0,2], launch:['launch','SCOOP!','#ffcf3f',0,2],
 a1:['air','AIR SLASH!','#ffffff',1,1], a2:['air','AIR BOOT KICK!','#ffe48a',1,1], a3:['spike',"CROW'S NEST!",'#ffcf3f',1,2],
 blink:['blink','DECK ROLL!',V2,0,0], blinka:['blink','AIR ROLL!',V2,1,0], block:['block','',V2,0,0], dodge:['dodge','',V2,0,0],
 counter:['counter','RIPOSTE!','#7fffd4',0,2], fin:['fin','JOLLY ROGER!!','#ffcf3f',0,3]};
const PR9=window.PR9={k:null,s:0,q:null,lastFi:0,Y0:0,n:0,beat:true,early:false,hit:{},sfx:{},trav:0,face:1,last:'',str:[],airN:0,
 blkHit:0,bT:0,cool:0,log:[],hits:{},moves:[],
 own(){return isG()&&p.state==='pr'&&!!MV[this.k]}};
const fr=k=>(F&&F['pr_'+k])||[];
const at=(k,i)=>{const L=fr(k);return L[Math.max(0,Math.min(L.length-1,i))]||{}};
const RXFIX={};
const a3L=()=>{const L=fr('a3');for(let i=0;i<L.length;i++)if(L[i].p==='land')return i;return 6};
const rx=(k,i)=>(k==='a3'&&i>a3L())?(at(k,a3L()).rx||0):(RXFIX[k]&&RXFIX[k][i]!=null?RXFIX[k][i]:(at(k,i).rx||0));
const ly=(k,i)=>at(k,i).ly||0;
const hitF=k=>{const L=fr(k);for(let i=0;i<L.length;i++)if(L[i].hit===1)return i;return -1};
const WALKSTEP=17;   // walk sheet: ~86 frame px of travel per 6-frame cycle
const lastF=k=>Math.max(0,fr(k).length-1);
// ---------- animation table: the new moves + every old pi_* anim pointed at on-model pirate frames ----------
const NEW={};for(const k in MV)NEW['pr_'+k]=['pr_'+k,null,FPS,0];
Object.assign(NEW,{pr_idle:['pr_idle',null,8,1],pr_ready:['pr_ready',null,FPS,0],pr_walk:['pr_walk',null,FPS,1],pr_victory:['pr_victory',null,8,0],
 pr_rec:['pr_ready',[2,1,0],10,0]});
function remapOld(a){const n=a.replace(/^pi_/,'');
 if(n==='idle'||n==='calm')return NEW.pr_idle;if(n==='run')return ['pr_walk',null,16,1];
 if(/^(rise|apex|jump|fall|hurt|leap|air)$/.test(n))return ['pr_a1',[0],1,1];
 if(n==='land'||n==='rollout')return ['pr_dodge',[4,5],12,0];if(n==='victory')return NEW.pr_victory;
 if(/twirl|aim|gun|pop|cannon/.test(n))return ['pr_fin',[1,2],8,0];if(n==='counter')return ['pr_counter',[2,3,4,5],12,0];
 if(n==='dive')return ['pr_a3',[3,4],12,0];if(n==='launch')return ['pr_launch',[2,3,4,5],14,0];if(n==='roll')return ['pr_blink',[2,3,4,5],14,0];
 if(n==='swing')return ['pr_blinka',[1,2,3],12,0];if(n==='hook')return ['pr_h2',[2,3,4,5],14,0];if(/^ult/.test(n))return ['pr_fin',[4,5,6,7,8],10,0];
 if(n==='rec')return ['pr_ready',[2,1,0],10,0];if(/^combo/.test(n))return ['pr_l1',[1,2,3,4,5],14,0];
 const H={h1:'l1',h2:'l2',h3:'l3',h4:'l4',h5:'l5',h6:'h1',h7:'h2'}[n];if(H)return ['pr_'+H,[1,2,3,4,5],14,0];
 return ['pr_l2',[1,2,3,4],14,0]}
const OLD={};for(const a of Object.keys(A))if(/^pi_/.test(a))OLD[a]=remapOld(a);
['pi_hurt','pi_dive','pi_victory','pi_rec','pi_fall','pi_rise'].forEach(a=>{if(!OLD[a])OLD[a]=remapOld(a)});
const ALL=Object.assign({},OLD,NEW);
for(const a in ALL)A[a]=ALL[a];
try{for(const a of Object.keys(SMOOTH.SMA))if(/^pi_/.test(a)){delete SMOOTH.SMA[a];SMOOTH.DONE.add(a)}}catch(_){}
try{if(typeof UPG!=='undefined')for(const a of Object.keys(UPG))if(/^pi_/.test(a))delete UPG[a]}catch(_){}
const frOf=v=>{const L=F&&F[v[0]];if(!L)return null;return v[1]?v[1].filter(i=>i<L.length).map(i=>L[i]):L};
const MYFR={};
function enforce(){if(!F||!F.pr_idle)return;for(const a in ALL){const want=ALL[a];if(A[a]!==want)A[a]=want;if(!MYFR[a]){const f=frOf(want);if(f&&f.length)MYFR[a]=f}if(MYFR[a]&&FR[a]!==MYFR[a]&&p.anim!==a)FR[a]=MYFR[a]}}
Object.assign(NAMES,{pr_l1:'FLICK!',pr_l2:'BACKHAND!',pr_l3:'BOOT KICK!',pr_l4:'HILT PUNCH!',pr_l5:'DRUNKEN LURCH!',pr_h1:'CORKSCREW!',pr_h2:'FLÈCHE!',
 pr_launch:'SCOOP!',pr_a1:'AIR SLASH!',pr_a2:'AIR BOOT KICK!',pr_a3:"CROW'S NEST!",pr_counter:'RIPOSTE!',pr_fin:'JOLLY ROGER!!'});
Object.assign(KB,{pr_l1:[45,-60,0,.05],pr_l2:[50,-70,0,.05],pr_l3:[90,-80,0,.05],pr_l4:[55,-70,0,.05],pr_l5:[70,-80,0,.05],
 pr_h1:[180,-380,.2,.08],pr_h2:[300,-260,.08,.085],pr_launch:[50,-760,.55,.08],pr_a1:[70,-230,.4,.05],pr_a2:[110,-240,.4,.055],
 pr_a3:[160,900,0,.09],pr_counter:[380,-380,.2,.1],pr_fin:[480,-1150,.6,.16]});
const BOX={light:[195,95,95],heavy:[225,70,110],launch:[200,140,150],air:[185,80,120],spike:[175,60,150],counter:[225,95,110],fin:[210,140,190]};
const LIM={light:70,heavy:130,launch:100,air:120,spike:90,counter:120,fin:420,blink:520,block:30,dodge:90};
// ---------- helpers ----------
const snd=(k,o)=>{try{window.SND&&SND.play&&SND.play(k,o||{})}catch(_){}};
const rnd=a=>a[Math.floor(Math.random()*a.length)];let hissN=0;
function effort(cue){PR9.log.push(cue);if(PR9.log.length>40)PR9.log.shift();
 if(cue==='hup')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.42,r:1.18+Math.random()*.1,gap:.18});
 else if(cue==='GRUNT')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.8,r:.98,gap:.2});
 else if(cue==='hiss')snd(['pvo_hiss1','pvo_hiss2','pvo_hiss3'][hissN++%3],{v:.55,r:1.1,gap:.2});
 else if(cue==='HISS')snd('pvo_hiss2',{v:.9,r:.92,gap:.2});
 else if(cue==='BIG GRUNT'){snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:1,r:.84,gap:.2});snd('pvo_growl1',{v:.5,gap:.3})}}
function floorY(){return typeof floorAt==='function'?floorAt(p.x):GROUND}
function target(range,airOnly){let best=null,bd=range;for(const d of dummies){if(!d.alive||d.benched)continue;if(airOnly&&d.y>GROUND-30)continue;
 const dd=Math.abs(d.x-p.x)+((d.x-p.x)*p.face<0?140:0)+(airOnly?Math.abs(d.y-p.y)*.5:0);if(dd<bd){bd=dd;best=d}}return best}
function move(dx,glide){if(!dx)return;let d=p.face*dx*PR9.mul;const K0=MV[PR9.k][0];
 if(d*p.face>0&&K0!=='blink'&&K0!=='fin'){for(const q of dummies){if(!q.alive||q.benched)continue;const g=(q.x-p.x)*p.face;if(g>-20&&g<88&&Math.abs(q.y-p.y)<150){d=0;break}}}
 const room=(LIM[K0]||80)-PR9.trav;if(room<=0)d=0;else if(Math.abs(d)>room)d=Math.sign(d)*room;PR9.trav+=Math.abs(d);
 if(glide){PR9.pend=(PR9.pend||0)+d;PR9.prate=Math.max(Math.abs(PR9.pend)*FPS,60);return}
 p.x+=d;if(typeof clampX==='function')p.x=clampX(p.x)}
// root motion of one drawn frame is spread over that frame (the big kitty lunges / pounces would otherwise jump 60-75 px in one go)
function glide(dt){if(!PR9.pend)return;const st=Math.sign(PR9.pend)*Math.min(Math.abs(PR9.pend),PR9.prate*dt);p.x+=st;PR9.pend-=st;if(Math.abs(PR9.pend)<.01)PR9.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}
function flush(){if(PR9.pend){p.x+=PR9.pend;PR9.pend=0;if(typeof clampX==='function')p.x=clampX(p.x)}}
// a direction tapped together with Claw counts even if it was let go a moment before the press is read (hit-stop holds the update)
const KTT={right:-9,left:-9,down:-9,up:-9};(function poll(){try{const t=performance.now()/1000;if(K.right)KTT.right=t;if(K.left)KTT.left=t;if(K.down)KTT.down=t;if(K.up||K.jump)KTT.up=t}catch(_){}requestAnimationFrame(poll)})();
const held=(k)=>performance.now()/1000-KTT[k]<.16;
function readInp(){const f=p.face>0?'right':'left',b=p.face>0?'left':'right',turned=performance.now()/1000-(PR9.turnT||-9)<.25;return{down:held('down'),up:held('up'),fwd:!turned&&held(f),back:held(b)}}
// ---------- which move a press throws ----------
const NEXT={'':'l1',l1:'l2',l2:'l3',l3:'l4',l4:'l1',l5:'l2',h1:'l1',h2:'l1',counter:'l2',blink:'l1',dodge:'l1',block:'counter',a3:'l1',fin:'l1',launch:'a1',a1:'a2',a2:'a3',blinka:'a1'};
function pickC(inp,air,n,beat){
 if(air){if(inp.down||PR9.airN>=2)return 'a3';return PR9.last==='a1'?'a2':PR9.last==='a2'?'a3':'a1'}
 if(n===7&&beat)return 'h1';                                   // 8-hit string: hit 7 on the beat is the low sweep
 if(PR9.k==='block')return 'counter';
 if(inp.up)return 'launch';if(inp.down)return 'h1';if(inp.fwd)return PR9.last==='l1'?'l5':'l1';
 return NEXT[PR9.last||'']||'l1'}
function pick(q,n,beat){const inAir=PR9.k?(PR9.k==='launch'||(MV[PR9.k][3]&&PR9.k!=='a3')):!p.ground;
 if(q.b==='B')return inAir?'blinka':'blink';if(q.b==='G')return inAir?null:'block';if(q.b==='O')return inAir?null:'dodge';
 if(q.b==='M')return inAir?'a2':'counter';if(q.b==='T')return inAir?'a2':'h2';
 return pickC(q.inp,inAir,n,beat)}
// ---------- start a move ----------
function start(k,s,o){o=o||{};const prev=PR9.k,M=MV[k];if(!fr(k).length)return false;flush();
 const fromAir=prev?(prev==='launch'||(MV[prev][3]&&prev!=='a3')):!p.ground;
 p.state='pr';p.t=0;p.vx=0;p.vy=0;p.wall=false;acted=true;p.shot=false;p.queued=false;
 if(typeof tokAct==='function'&&(M[0]==='light'||M[0]==='heavy'&&k!=='h2'||M[0]==='air'||M[0]==='spike'||M[0]==='launch'))tokAct('claw');
 if(k==='h2'&&typeof tokAct==='function')tokAct('tailwhip');
 setAnim('pr_'+k,true);p.ft=s;p.fi=s;if(s>0||o.cut){p.blend=0;p.prevF=null}
 PR9.k=k;PR9.s=s;PR9.q=null;PR9.early=false;PR9.hit={};PR9.sfx={};PR9.lastFi=s;PR9.trav=0;PR9.face=p.face;PR9.mul=1;PR9.fall=false;PR9.t0=now;
 if(M[3]){   // air move: keep the current baseline, or set it so frame s sits where Paddy is now
  if(!(prev&&fromAir))PR9.Y0=p.y+ly(k,s)*RS;
  PR9.Yt=PR9.Y0;const d=target(420,true);if(d&&M[0]!=='blink'){const want=d.y+ly(k,s)*RS+10;PR9.Yt=PR9.Y0+Math.max(-150,Math.min(150,want-PR9.Y0))}
 }else{PR9.Y0=o.fromAir?Math.min(floorY(),p.y+ly(k,s)*RS):floorY();PR9.Yt=PR9.Y0}
 // blinks and the finisher's dash close the real gap to the enemy (scale the drawn travel to land just in front of him)
 if(M[0]==='blink'||k==='fin'){const d=target(k==='blinka'?520:620,k==='blinka');const tr=k==='fin'?rx(k,5)-rx(k,s):rx(k,lastF(k))-rx(k,s);
  if(d&&tr>0){if(Math.abs(d.x-p.x)>25)p.face=d.x>=p.x?1:-1;PR9.face=p.face;const gap=Math.abs(d.x-p.x)-(k==='fin'?95:80);PR9.mul=Math.max(.15,Math.min(1.6,gap/(tr*RS)));
   if(k==='blinka'&&d.y<GROUND-30){PR9.Yt=PR9.Y0+Math.max(-160,Math.min(160,(d.y+ly(k,0)*RS+10)-PR9.Y0))}}
  else PR9.mul=k==='fin'?.25:1;
  if(M[0]==='blink'){p.inv=Math.max(p.inv,.3);puffShadow(p.x,p.y)}}
 if(k==='counter'){const d=target(300);const tr=rx(k,3)-rx(k,s);if(d&&tr>0){const gap=Math.abs(d.x-p.x)-110;PR9.mul=Math.max(.6,Math.min(4,gap/(tr*RS)))}}   // the counter palm steps in to reach him
 PR9.lyS=ly(k,s);PR9.lyT=PR9.lyS;PR9.lyK=k;PR9.lyR=60;p.y=PR9.Y0-ly(k,s)*RS;p.ground=p.y>=floorY()-1;
 if(M[0]!=='blink'&&M[0]!=='block'&&M[0]!=='dodge'){C.atk++;if(M[1]&&!o.quiet)say(M[1],M[2],M[4]>=3)}
 if(k==='dodge'){p.inv=Math.max(p.inv,.36);say('DODGE!','#bfe8ff')}
 if(k==='block'){PR9.bT=0;PR9.blkHit=0}
 if(M[3])PR9.airN+=(M[0]==='air'||M[0]==='spike')?1:0;
 PR9.last=k;PR9.str.push(k);if(PR9.str.length>16)PR9.str.shift();PR9.moves.push(k);if(PR9.moves.length>40)PR9.moves.shift();
 frameEvents(s);return true}
// root jump for a cancel: the next move's frame 1 sits where this move's last frame would have been
function rootJump(a,fromFi,b,s){flush();const d=(rx(a,lastF(a))-rx(a,fromFi))+rx(b,s)-rx(b,0);PR9.mul=1;PR9.trav=0;PR9.k=a;move(d*RS)}
function chain(b,s){const a=PR9.k,fi=p.fi;rootJump(a,fi,b,s);return start(b,s)}
// ---------- per-frame events: effort sounds, hits ----------
function frameEvents(fi){const k=PR9.k,f=at(k,fi);if(f.sfx&&!PR9.sfx[fi]){PR9.sfx[fi]=1;effort(f.sfx)}
 if(f.hit===1&&!PR9.hit[fi]){PR9.hit[fi]=1;strike(k,fi)}
 if(k==='fin'&&f.hit>=2){hitstop=Math.max(hitstop,.06)}       // 3-frame hold on the finisher
 const K0=MV[k][0];if((K0==='blink')&&(fi===2||fi===1&&k==='blinka')){for(let i=1;i<=4;i++)ghosts.push({x:p.x-p.face*i*38,y:p.y,f:(FR['pr_'+k]||[])[fi],face:p.face,l:.12+i*.04,blue:1})}
 if(fi===lastF(k)&&K0!=='blink'&&!MV[k][3]&&ly(k,fi-1)>20)spark(p.x,floorY(),6,'#d9c49a',110)}
function strike(k,fi){const px0=p.x;p.x+=PR9.pend||0;try{strike0(k,fi)}finally{p.x=px0}}   // reach is measured from where this frame's glide ends
function strike0(k,fi){const M=MV[k],B=BOX[M[0]];if(!B)return;let n=0;const blunt=/^(l3|l4|a2)$/.test(k);   // boot kicks + the hilt punch thump, the cutlass rings
 const tx=p.x+p.face*B[0]*.55,ty=p.y-B[1];
 for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face,h=d.h||165;
  if(g<-40||g>B[0]+(d.w||0)*.3)continue;if(d.y-h>ty+B[2]||d.y<ty-B[2])continue;
  if(k==='a1'||k==='a2'||k==='blinka'){d.x+=(p.x+p.face*110-d.x)*.35}
  hitDummy(d,'pr_'+k,p.face);n++;
  if(M[3]&&k!=='a3'){d.vy=-300;d.fl=Math.max(d.fl||0,.5)}           // air hits keep him floating in reach instead of rocketing him away
  if(k==='launch'&&d.y<GROUND+1){d.vy=Math.max(d.vy,-560);d.fl=Math.max(d.fl||0,.6)}
  if(k==='fin'){d.hp=Math.min(d.hp,0);finFx(d)}}
 PR9.hits[k]=(PR9.hits[k]||0)+n;if(n){if(blunt)snd('pirate_hit',{v:.55,r:.8,gap:.08});else snd('sword_clang',{v:.32,r:1.25+Math.random()*.1,gap:.08})}
 // minimal FX from the sheets: small white/lavender burst + 3 speed lines at the strike tip (also on a whiff, smaller)
 const big=M[4]>=2;for(let i=0;i<(n?(big?14:8):3);i++){const a=(p.face>0?0:Math.PI)+(Math.random()-.5)*2.4,v=160+Math.random()*(big?420:260);sparks.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.22,c:i%2?'#fff':M[2]})}
 if(n&&window.K29)for(let i=0;i<3;i++)K29.imp.push({streak:1,x:tx-p.face*(70+i*14),y:ty-14+i*14,face:p.face,len:60+i*10,col:i===1?V2:V1,l:1,d:0});
 if(n){shake=Math.max(shake,M[4]>=3?18:big?8:4);if(M[4]>=2)waves.push({x:tx,y:ty,r:12,l:.6,big:M[4]>=3})}}
function finFx(d){slowT=Math.max(slowT,.55);flashT=Math.max(flashT,.3);hitstop=Math.max(hitstop,.14);cine.tz=1.15;
 for(let i=0;i<3;i++)waves.push({x:d.x,y:d.y-80+i*12,r:10+i*30,l:1,big:true});if(typeof burst==='function'){burst(d.x,d.y-90);burst(d.x,d.y-150,1)}
 for(let i=0;i<46;i++){const a=Math.random()*6.28,v=200+Math.random()*650;sparks.push({x:d.x,y:d.y-90,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,l:.7,c:['#fff','#ffcf3f','#2ec4d6','#e8413c'][i%4]})}
 cine.pillar={x:d.x,l:1,col:'#2ec4d6'};card('JOLLY ROGER!','PIRATE FINISHER · 8 HITS','#ffcf3f');snd('pirate_finisher',{v:.8,gap:.5});
 try{splash(d.x,floorY(),26,true);coinBurst(d.x,d.y-120,18);parrot('YO-HO!')}catch(_){}}
// ---------- the move state (runs before the game's own state code, like punch33) ----------
function endTo(normal){const k=PR9.k;PR9.k=null;p.state='normal';p.vx=0;p.vy=0;p.cool=.04;
 if(normal==='air'){p.ground=false;setAnim('pi_fall')}else{p.y=Math.min(p.y,floorY());if(k&&!MV[k][3]&&k!=='block'&&k!=='dodge'){p.state='pr';PR9.k='rec';p.t=0;setAnim('pr_rec',true);p.blend=0;p.prevF=null;p.ft=0;p.fi=0}}
 if(normal!=='air'){PR9.n=0;PR9.beat=true;PR9.last='';PR9.airN=0;p.ncombo=0}}
let enfT=0;
function tick(dt){
 PR9.cool-=dt;PR9.dt=dt;
 enfT-=dt;if(enfT<=0||isG()){enfT=.5;enforce()}
 if(!isG()){if(PR9.k){PR9.k=null}if(p.state==='pr')p.state='normal';return}
 if(A.pi_run===ALL.pi_run)A.pi_run[2]=Math.max(7,Math.min(22,Math.abs(p.vx)/(WALKSTEP*RS)));
 // walk cycle speed follows the run speed so the feet don't skate
  if(p.state!=='pr'){if(PR9.k)PR9.k=null;if(p.ground&&p.state==='normal')PR9.airN=0;return}
 const k=PR9.k;
 if(k==='rec'){   // short recovery back to the upright idle; any press or move goes straight on
  const b=P.attack||P.tail||P.special||P.guard||P.dodge||P.jump||P.blink;
  if(b||K.left||K.right||!p.ground||p.ft+dt*10>=3){PR9.k=null;p.state='normal';p.vx=0;
   if(P.blink){delete P.blink;blink()}else if(P.guard||P.dodge)defence();else if(P.attack||P.tail||P.special)moves(0)}return}
 if(!k||!MV[k]){p.state='normal';return}const M=MV[k],L=fr(k).length;glide(dt);
 if(p.t>1.2)p.t=1.2;    // long holds (block) stay under the game's safety net
 // turning round mid-combo (also when the game's own input code already flipped him)
 if(p.face!==PR9.face&&M[0]!=='blink'){PR9.face=p.face;PR9.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1}
 const want=P.left?-1:P.right?1:0;
 if(want&&want!==p.face&&M[0]!=='blink'&&k!=='dodge'){p.face=want;PR9.face=want;PR9.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1;if(C.n>0)C.t=Math.max(C.t,C.max);
  for(let i=0;i<6;i++)sparks.push({x:p.x,y:p.y-60-Math.random()*60,vx:want*(120+Math.random()*200),vy:(Math.random()-.5)*120,l:.25,c:'#fff'})}
 const fi=p.fi,ft=p.ft+dt*FPS,nfi=Math.min(L-1,Math.floor(ft)),hf=hitF(k),buf=hf>=0?hf:1;
 // ---- input ----
 const isAir=k==='launch'||(M[3]&&k!=='a3');
 let b=null;if(P.attack){delete P.attack;b='C'}else if(P.tail){delete P.tail;b='T'}else if(P.special){delete P.special;b='M'}else if(P.blink){delete P.blink;b='B'}
 else if(P.dodge){delete P.dodge;b='O'}else if(P.guard&&k!=='block'){delete P.guard;b='G'}
 if(isAir&&P.down&&!b){delete P.down;b='C';PR9.forceSpike=1}
 if(P.jump&&fi>=buf&&k!=='fin'&&M[0]!=='block'){PR9.k=null;p.state='normal';p.vy=0;p.cool=0;if(!isAir){p.ground=true;p.y=floorY()}else setAnim('pi_fall');return}   // jump cancel: xMoves -> xJump takes the press
 if(b){acted=true;
  if(k==='block'){if(b==='C'||b==='M'){counterFrom(PR9.blkHit&&now-PR9.blkHit<.7?2:1);return}if(b==='O'){PR9.q={b:'O',inp:readInp(),beat:false}}}
  else if(k==='fin'){}
  else{const inp=readInp();if(PR9.forceSpike){inp.down=true;PR9.forceSpike=0}
   const on=fi>=buf&&!PR9.early;if(fi<buf&&b==='C')PR9.early=true;
   if(!PR9.q||fi>=buf)PR9.q={b,inp,beat:on}}}
 // ---- block: hold ----
 if(k==='block'){PR9.bT+=dt;const held=K.guard;
  if(held&&ft>=4.9){p.ft=Math.min(p.ft,3.9);applyFrame(3);p.t=Math.min(p.t,.6);return}
  if(!held&&PR9.bT<.16&&!PR9.blkHit&&fi<=1){rootJump('block',fi,'dodge',1);start('dodge',1);return}
  if(!held&&fi<4){p.ft=Math.max(p.ft,4);}
  if(PR9.q&&PR9.q.b==='O'){PR9.q=null;rootJump('block',fi,'dodge',1);start('dodge',1);return}}
 // ---- cancel point: end of frame n-1 -> the next move from its frame 2 ----
 const q=PR9.q,cut=L-1;
 if(q&&k!=='fin'&&ft>=cut&&fi>=buf){PR9.q=null;const n=PR9.n+1,strikeNext=q.b==='C';
  if(PR9.n>=3&&strikeNext)PR9.beat=PR9.beat&&q.beat;
  if(strikeNext&&PR9.n>=3&&!q.beat)p.miss=true;
  // an on-beat 8th press = the crescent finisher
  if(strikeNext&&!isAir&&PR9.n===7&&PR9.beat&&q.beat){say('PERFECT!','#7fffd4',true);PR9.n=8;rootJump(k,fi,'fin',1);start('fin',1);return}
  let nb=pick(q,n,PR9.beat&&q.beat&&PR9.n>=3);if(!nb){PR9.q=null}
  else{if(strikeNext&&PR9.n>=3&&PR9.beat&&q.beat&&!isAir){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false})}
   if(MV[nb][0]!=='blink'&&MV[nb][0]!=='block'&&MV[nb][0]!=='dodge'&&!MV[nb][3])PR9.n=n;else if(MV[nb][3]&&MV[nb][0]!=='blink')PR9.n=n;
   p.ncombo=Math.min(8,PR9.n);chain(nb,1);return}}
 // ---- a3: hold the dive pose until the ground is reached ----
 if(k==='a3'&&nfi>=a3L()&&!PR9.landed){const fl=floorY(),hl=a3L()-1;if(p.y<fl-4){PR9.fall=true;p.ft=Math.min(p.ft,hl+.95);PR9.vy=(PR9.vy||300)+2600*dt;p.y=Math.min(fl,p.y+PR9.vy*dt);applyFrameX(hl);return}
  PR9.landed=true;PR9.Y0=fl;PR9.Yt=fl;PR9.vy=0;shake=Math.max(shake,8);spark(p.x,fl,10,['#fff','#d9c49a'],200);waves.push({x:p.x,y:fl,r:10,l:.6,big:false})}
 if(k!=='a3')PR9.landed=false;
 // ---- end of the move with nothing queued ----
 if(ft>=L){if(isAir&&k!=='launch'||k==='launch'){endTo('air');return}
  if(k==='fin'){PR9.n=0}endTo('ground');return}
 applyFrame(nfi)}
function applyFrameX(nfi){const k=PR9.k;if(nfi!==PR9.lastFi){move((rx(k,nfi)-rx(k,PR9.lastFi))*RS,MV[k][0]!=='blink'&&k!=='fin');PR9.lastFi=nfi;frameEvents(nfi)}}
function applyFrame(nfi){const k=PR9.k;applyFrameX(nfi);if(!PR9.k)return;
 if(PR9.Yt!=null&&PR9.Yt!==PR9.Y0){const st=(MV[k][0]==='blink'?1400:650)*(PR9.dt||.016),dy=PR9.Yt-PR9.Y0;PR9.Y0+=Math.abs(dy)<=st?dy:Math.sign(dy)*st}   // glide to the juggle height, never snap
 const lt=ly(k,nfi);if(PR9.lyS==null||PR9.lyK!==k)PR9.lyS=lt;if(PR9.lyT!==lt){PR9.lyR=Math.max(Math.abs(lt-PR9.lyS)*FPS*1.25,30);PR9.lyT=lt}
 PR9.lyK=k;const ls=(PR9.lyR||60)*(PR9.dt||.016);if(!isFinite(PR9.lyS))PR9.lyS=lt;PR9.lyS+=Math.abs(lt-PR9.lyS)<=ls?lt-PR9.lyS:Math.sign(lt-PR9.lyS)*ls;
 p.y=PR9.Y0-PR9.lyS*RS;p.vx=0;p.vy=0;
 if(p.y>floorY())p.y=floorY();
 if(k==='dodge'&&nfi>=4)p.inv=Math.min(p.inv,.05)}
function counterFrom(s){const a=PR9.k;rootJump(a,p.fi,'counter',s);start('counter',s);PR9.n=Math.max(PR9.n,1)}
// ---------- entry points the game calls for the ninja form ----------
function moves(dir){
 if(P.jump&&P.attack&&p.ground){delete P.jump;delete P.attack;PR9.k=null;PR9.n=1;PR9.beat=true;p.miss=false;PR9.last='';start('launch',0);p.ncombo=1;return true}   // Jump + Claw together = launcher
 if(P.jump&&xJump())return true;
 const inp=readInp();PR9.k=null;
 if(!p.ground&&P.attack&&(K.up||K.jump||held('up'))&&p.vy<0&&now-(p.lastJump||-9)<.35&&PR9.airN===0){delete P.attack;PR9.n=1;PR9.beat=true;p.miss=false;PR9.last='';start('launch',0,{fromAir:1});p.ncombo=1;return true}   // ↑/Jump + Claw = launcher (the jump key fires first)
 if(!p.ground){if(P.attack){if(K.down||held('down'))inp.down=true;delete P.attack;PR9.last=PR9.airN>0?PR9.last:'';start(pickC(inp,true,1,false),0);return true}
  if(P.tail){delete P.tail;start('a2',0);return true}return false}
 if(P.attack){delete P.attack;PR9.n=1;PR9.beat=true;PR9.early=false;p.miss=false;PR9.last='';if(PR9.blkHit&&now-PR9.blkHit<.7){PR9.blkHit=0;start('counter',1)}else start(pickC(inp,false,1,false),0);p.ncombo=1;return true}   // Claw straight after a block = counter palm
 if(P.tail){delete P.tail;PR9.n=1;PR9.beat=true;p.miss=false;start('h2',0);p.ncombo=1;return true}
 if(P.special){delete P.special;PR9.n=1;PR9.beat=true;p.miss=false;start('counter',0);return true}
 return false}
function defence(){if(!isG())return;
 if(!['normal','land','knflip'].includes(p.state))return;
 if(P.dodge&&p.ground){delete P.dodge;PR9.k=null;start('dodge',0);return}
 if(P.guard&&p.ground){delete P.guard;PR9.k=null;start('block',0);return}}
function blink(){if(PR9.cool>0)return false;if(['nmorph','hurt','respawn','wallrun','lk','lkult','eclipse','finishhim'].includes(p.state))return false;
 if(p.state==='pr'&&PR9.k!=='rec'){if(PR9.k&&PR9.k!=='fin')PR9.q={b:'B',inp:readInp(),beat:false};return true}
 if(p.state==='pr')p.state='normal';
 PR9.cool=.3;const air=!p.ground;PR9.k=null;return start(air?'blinka':'blink',0)}
function dash(dir){p.face=dir==='right'?1:-1;p.dashCool=.4;p.dashStart=now;if(p.state==='pr'&&PR9.k!=='rec')return;PR9.k=null;start(p.ground?'blink':'blinka',0)}
// ---------- hook the game (Pirate only: Knight shares the x* functions and keeps his own hooks) ----------
const _xm=xMoves;xMoves=function(dir){if(!isG())return _xm.apply(this,arguments);try{moves(dir)}catch(e){console.warn('pr',e)}};
const _xb=xBlink;xBlink=function(){if(!isG())return _xb.apply(this,arguments);return blink()};
const _xd=xDash;xDash=function(dir){if(!isG())return _xd.apply(this,arguments);dash(dir)};
const _xh=xHit;xHit=function(i){if(!isG())return _xh.apply(this,arguments);PR9.k=null;PR9.n=1;start(p.ground?(K.up?'launch':'l1'):'a1',0)};
const _xa=xAir;xAir=function(){if(!isG())return _xa.apply(this,arguments);PR9.k=null;start('a1',0);return true};
const _xl=xLaunch;xLaunch=function(){if(!isG())return _xl.apply(this,arguments);PR9.k=null;start('launch',0)};
const _xv=xDive;xDive=function(){if(!isG())return _xv.apply(this,arguments);PR9.k=null;start('a3',0)};
const _xt=xTail;xTail=function(){if(!isG())return _xt.apply(this,arguments);PR9.k=null;start(p.ground?'block':'a2',0)};
const _xc=xCancel;xCancel=function(){if(!isG())return _xc.apply(this,arguments);if(P.jump&&xJump())return true;if(P.blink){delete P.blink;return blink()}return false};
if(typeof XST!=='undefined')XST.add('pr');
if(typeof UNG!=='undefined')UNG.add('pr');
const _xs=xState;xState=function(S,dt,end,dir){if(S==='pr')return;return _xs.apply(this,arguments)};
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{tick(dt);defence()}catch(e){console.warn('pr',e)}};
// the old claw slash arcs and generic hit sparks don't belong on the drawn strikes
const _cf=clawFx;clawFx=function(){if(isG()&&p.state==='pr')return;return _cf.apply(this,arguments)};
// defence vs the practice spar / any incoming hit: block, perfect block = counter, early dodge = counter
const _ds=dogStrike;dogStrike=function(d,dmg,kind){if(isG()&&p.state==='pr'&&PR9.k){const dir=Math.sign(p.x-d.x)||-1;
  if(PR9.k==='block'||(PR9.k==='counter'&&p.fi<=2)){
   if(PR9.k==='block'&&PR9.bT<.2){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);flashT=Math.max(flashT,.15);hitstop=Math.max(hitstop,.08);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}
   PR9.blkHit=now;say('BLOCKED!','#bff4ff',true);p.x+=dir*10;d.vx=-dir*160;d.vy=Math.min(d.vy||0,-220);d.cool=Math.max(d.cool||0,1.4);if(typeof dSet==='function'&&!d.cr)dSet(d,'hurt','r_hurt');
   d.flash=.16;shake=Math.max(shake,6);hitstop=Math.max(hitstop,.05);if(window.K29)K29.imp.push({x:p.x+p.face*55,y:p.y-95,l:1,big:false,col:'#cfe3ff',rot:0});try{clang()}catch(_){};return true}
  if(PR9.k==='dodge'&&p.t<.22){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}}
 return _ds.apply(this,arguments)};
// beat ring: green from the impact frame of the current move (hits 3-7 of a clean string)
const _cue=cueInfo;cueInfo=function(){if(PR9.own()&&PR9.n>=3&&PR9.n<8&&PR9.beat&&!p.miss&&!MV[PR9.k][3]){const h=hitF(PR9.k);if(h>=0)return{H:(h-(PR9.s||0))/FPS+.2}}return _cue()};
// link routes: 3+ clean hits open ROUTES[3] (Tail / Meow / Blink), TTT open the T routes
const _op=openerNow;openerNow=function(){if(PR9.own()){const n=PR9.n+(PR9.q&&PR9.q.b==='C'?1:0);
  if(PR9.k==='h2'&&now-lastTokT<.75){let t=0;for(let i=TOK.length-1;i>=0&&TOK[i].c==='T';i--)t++;if(t>=3)return{run:'TTT',W:.16,E:.5}}
  if(n>=3&&!p.miss&&!MV[PR9.k][3]&&PR9.k!=='fin')return{run:'C'.repeat(Math.min(n,8)),W:.07,E:.7}}return _op()};
const _ls=liveSeq;liveSeq=function(){if(PR9.own()&&!LK.on)return 'C'.repeat(Math.min(8,PR9.n));return _ls()};
// the pirate recovery pose
const _fa=fa;fa=function(k){if(isG()&&!p.uf){if(k==='rec')return 'pr_rec'}return _fa(k)};
// ---------- preload: every pirate frame first once Pirate is picked (and quietly in the background before that) ----------
let asked=0;const _pre2=r9Pre;r9Pre=function(dt){try{if(asked<2&&window.queueFrames&&F&&F.pr_idle){const hi=isG();if(hi||asked===0){const L=[];for(const a in ALL)(frOf(ALL[a])||[]).forEach(q=>L.push(q.f));queueFrames([...new Set(L)],hi);asked=hi?2:1}}}catch(_){}_pre2(dt)};
(function early(){if(F&&F.pr_idle){enforce();return}setTimeout(early,30)})();
window.PIRATE39={MV,PR9,ALL,BOX,enforce};
})();
