// ===================== v35: NINJA PADDY (rebuilds the NEON NINJA form slot) =====================
// Art: generated/forms/02_ninja/sheets (magenta, purple-safe key) cut by src/cut_ninja.py -> nj_* in frames.json, 12 fps.
// One form scale for every frame (base idle height, TARGET=199). Root motion (rx) and lift (ly) come from the studio _roots.txt.
// Cancel rules (NOTES.md): input buffers from the first hit-stop frame (HIT1); at the END of frame n-1 the next move starts at
//   ITS frame 2, rooted where this move's last frame would have been. Opener plays 1..n-1, middle moves 2..n-1, the last 2..n.
// Controls (keyboard / touch):
//   Claw (X / 🐾)        = next light of the 1-2-3-4 string: palm -> chop -> snap kick -> elbow -> palm ...
//   → + Claw            = palm (a second → + Claw in a row = twin palm, the 1' of 1-1-2)
//   ↓ + Claw            = low sweep            ↑ / Jump + Claw = rising launcher (ends in the air)
//   Tail (T)            = flying knee           Meow (C)        = counter palm (parry + strike)
//   Blink (N / Ctrl)    = blink dash-in (in the air: air blink to the enemy)      double-tap ← / → = blink that way
//   hold 🛡 / B          = block                 tap 🛡 / O       = dodge (back-hop)
//   block just as a hit lands (first 0.2 s) or dodge right as it lands = COUNTER; Claw while blocking = counter palm
//   in the air: Claw = air palm -> side kick -> axe spike (lands); ↓ (+ Claw) = axe spike; Blink = air blink
//   8-hit timed string: hits 1-3 any rhythm, then press ON THE BEAT (ring green = the impact frame onwards). Hit 7 on the beat
//   becomes the low sweep, an on-beat 8th press fires the CRESCENT MOON KICK finisher.
(function(){
if(typeof SM!=='function'||typeof nMoves!=='function'||typeof A==='undefined')return;
const isN=()=>{try{return FORM()===1}catch(_){return false}};
const FPS=12,RS=(typeof SC!=='undefined'&&SC)||.8;
const V1='#c9a7ff',V2='#9fe8ff';
// move: [kind, callout, colour, air(start&end in air), tier]
const MV={
 l1:['light','PALM STRIKE!','#e8dcff',0,1], l2:['light','SHUTO CHOP!','#d9c6ff',0,1], l3:['light','SNAP KICK!','#c9e8ff',0,1],
 l4:['light','ELBOW STRIKE!','#e8dcff',0,1], l5:['light','TWIN PALM!','#ffffff',0,1],
 h1:['heavy','LOW SWEEP!','#b98cff',0,2], h2:['heavy','FLYING KNEE!','#9fe8ff',0,2], launch:['launch','RISING LAUNCHER!','#c9a7ff',0,2],
 a1:['air','AIR PALM!','#e8dcff',1,1], a2:['air','SIDE KICK!','#c9e8ff',1,1], a3:['spike','AXE SPIKE!','#b98cff',1,2],
 blink:['blink','BLINK!',V1,0,0], blinka:['blink','AIR BLINK!',V1,1,0], block:['block','',V2,0,0], dodge:['dodge','',V2,0,0],
 counter:['counter','COUNTER PALM!','#7fffd4',0,2], fin:['fin','CRESCENT MOON KICK!!','#ff9ad5',0,3]};
const NJ=window.NJ={k:null,s:0,q:null,lastFi:0,Y0:0,n:0,beat:true,early:false,hit:{},sfx:{},trav:0,face:1,last:'',str:[],airN:0,
 blkHit:0,bT:0,cool:0,log:[],hits:{},moves:[],
 own(){return isN()&&p.state==='nj'&&!!MV[this.k]}};
const fr=k=>(F&&F['nj_'+k])||[];
const at=(k,i)=>{const L=fr(k);return L[Math.max(0,Math.min(L.length-1,i))]||{}};
const RXFIX={l5:{1:-15}};   // twin palm's load frame sits 46 px back in the sheet (NOTES 'root jumps'): halve it so the lunge doesn't pop
const rx=(k,i)=>(k==='a3'&&i>=6)?(at(k,5).rx||0):(RXFIX[k]&&RXFIX[k][i]!=null?RXFIX[k][i]:(at(k,i).rx||0));   // a3's last 'ready' is re-rooted at 0 in the sheet: keep it under the landing
const ly=(k,i)=>at(k,i).ly||0;
const hitF=k=>{const L=fr(k);for(let i=0;i<L.length;i++)if(L[i].hit===1)return i;return -1};
const WALKSTEP=22;   // walk sheet: ~133 frame px of travel per 6-frame cycle
const lastF=k=>Math.max(0,fr(k).length-1);
// ---------- animation table: the new moves + every old n_/nk_ anim pointed at on-model ninja frames ----------
const NEW={};for(const k in MV)NEW['nj_'+k]=['nj_'+k,null,FPS,0];
Object.assign(NEW,{nj_idle:['nj_idle',null,8,1],nj_ready:['nj_ready',null,FPS,0],nj_walk:['nj_walk',null,FPS,1],nj_victory:['nj_victory',null,8,0],
 nj_rec:['nj_ready',[2,1,0],10,0]});
function remapOld(a){const n=a.replace(/^n[kx]?_/,'');
 if(/^nk_/.test(a)){if(/ult/.test(n))return ['nj_fin',[3,4,5,6,7],10,0];if(/run/.test(n))return ['nj_walk',null,16,1];if(/jump|rise|fall|apex/.test(n))return ['nj_a1',[0],1,1];
  if(/spin/.test(n))return ['nj_h2',[1,2,3,4,5],14,0];if(/meow|shout/.test(n))return ['nj_counter',[1,2,3,4],12,0];if(/blink|dash/.test(n))return ['nj_blink',[1,2,3,4],14,0];return ['nj_l5',[1,2,3,4,5],14,0]}
 if(n==='idle')return NEW.nj_idle;if(/^(run|wall)$/.test(n))return ['nj_walk',null,18,1];
 if(/^(rise|apex|fall|jump|flip|flip2|leap)$/.test(n))return ['nj_a1',[0],1,1];
 if(n==='land')return ['nj_dodge',[3,4],12,0];if(n==='hurt')return ['nj_dodge',[2,2,3,4],4,0];if(n==='victory'||n==='v2')return NEW.nj_victory;
 if(/guard|block|parry/.test(n))return ['nj_block',[1,2],12,0];if(/counter/.test(n))return ['nj_counter',null,12,0];
 if(/dive|slam/.test(n))return ['nj_a3',[2,3],12,0];if(/dash|step|rush/.test(n))return ['nj_blink',[2,3],14,0];
 if(/ult/.test(n))return ['nj_fin',[3,4,5,6,7],10,0];if(/^(er|es)$/.test(n))return n==='er'?['nj_fin',[1],1,0]:['nj_fin',[5],1,0];
 if(/calm|kneel|power|shout|charge|rec/.test(n))return ['nj_ready',[2,3,4],8,0];
 if(/air/.test(n))return ['nj_a1',[1,2,3,4],14,0];if(/launch|rise5/.test(n))return ['nj_launch',[1,2,3,4],14,0];
 if(/throw/.test(n))return ['nj_l5',[1,2,3,4],14,0];if(/a3|a4|spin|h6|h7/.test(n))return ['nj_h2',[1,2,3,4],14,0];
 return ['nj_l2',[1,2,3,4],14,0]}
const OLD={};for(const a of Object.keys(A))if(/^n[kx]?_/.test(a))OLD[a]=remapOld(a);
['n_hurt','n_dive','n_victory','n_rec'].forEach(a=>{if(!OLD[a])OLD[a]=remapOld(a)});
const ALL=Object.assign({},OLD,NEW);
for(const a in ALL)A[a]=ALL[a];
// lazy upgrade layers must never swap the old cyborg art back in
try{for(const a of Object.keys(SMOOTH.SMA))if(/^n[kx]?_/.test(a)){delete SMOOTH.SMA[a];SMOOTH.DONE.add(a)}}catch(_){}
try{if(typeof UPG!=='undefined')for(const a of Object.keys(UPG))if(/^n[kx]?_/.test(a))delete UPG[a]}catch(_){}
const frOf=v=>{const L=F&&F[v[0]];if(!L)return null;return v[1]?v[1].filter(i=>i<L.length).map(i=>L[i]):L};
const MYFR={};let enfT=0;
function enforce(){if(!F||!F.nj_idle)return;for(const a in ALL){const want=ALL[a];if(A[a]!==want)A[a]=want;if(!MYFR[a]){const f=frOf(want);if(f&&f.length)MYFR[a]=f}if(MYFR[a]&&FR[a]!==MYFR[a]&&p.anim!==a)FR[a]=MYFR[a]}}
Object.assign(NAMES,{nj_l1:'PALM STRIKE!',nj_l2:'SHUTO CHOP!',nj_l3:'SNAP KICK!',nj_l4:'ELBOW STRIKE!',nj_l5:'TWIN PALM!',nj_h1:'LOW SWEEP!',nj_h2:'FLYING KNEE!',
 nj_launch:'RISING LAUNCHER!',nj_a1:'AIR PALM!',nj_a2:'SIDE KICK!',nj_a3:'AXE SPIKE!',nj_counter:'COUNTER PALM!',nj_fin:'CRESCENT MOON KICK!!'});
// knockback [vx, vy, float, game hitstop] - lights barely push so the string keeps connecting
Object.assign(KB,{nj_l1:[45,-60,0,.05],nj_l2:[50,-70,0,.05],nj_l3:[60,-90,0,.05],nj_l4:[60,-70,0,.05],nj_l5:[80,-90,0,.055],
 nj_h1:[150,-420,.2,.075],nj_h2:[300,-280,.08,.08],nj_launch:[50,-760,.55,.08],nj_a1:[70,-230,.4,.05],nj_a2:[110,-240,.4,.055],
 nj_a3:[160,900,0,.09],nj_counter:[380,-380,.2,.1],nj_fin:[480,-1150,.6,.15]});
// strike box: [forward reach, body height of the strike point, half height]
const BOX={light:[185,95,95],heavy:[215,70,110],launch:[165,140,150],air:[175,80,120],spike:[165,60,150],counter:[215,95,110],fin:[200,140,190]};
const LIM={light:70,heavy:110,launch:60,air:120,spike:90,counter:120,fin:420,blink:520,block:30,dodge:90};
// ---------- helpers ----------
const snd=(k,o)=>{try{window.SND&&SND.play&&SND.play(k,o||{})}catch(_){}};
const rnd=a=>a[Math.floor(Math.random()*a.length)];let hissN=0;
function effort(cue){NJ.log.push(cue);if(NJ.log.length>40)NJ.log.shift();
 if(cue==='hup')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.42,r:1.18+Math.random()*.1,gap:.18});
 else if(cue==='GRUNT')snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:.8,r:.98,gap:.2});
 else if(cue==='hiss')snd(['pvo_hiss1','pvo_hiss2','pvo_hiss3'][hissN++%3],{v:.55,r:1.1,gap:.2});
 else if(cue==='HISS')snd('pvo_hiss2',{v:.9,r:.92,gap:.2});
 else if(cue==='BIG GRUNT'){snd(rnd(['pvo_grunt1','pvo_grunt3']),{v:1,r:.84,gap:.2});snd('pvo_growl1',{v:.5,gap:.3})}}
function floorY(){return typeof floorAt==='function'?floorAt(p.x):GROUND}
function target(range,airOnly){let best=null,bd=range;for(const d of dummies){if(!d.alive||d.benched)continue;if(airOnly&&d.y>GROUND-30)continue;
 const dd=Math.abs(d.x-p.x)+((d.x-p.x)*p.face<0?140:0)+(airOnly?Math.abs(d.y-p.y)*.5:0);if(dd<bd){bd=dd;best=d}}return best}
function move(dx){if(!dx)return;let d=p.face*dx*NJ.mul;const K0=MV[NJ.k][0];
 if(d*p.face>0&&K0!=='blink'&&K0!=='fin'){for(const q of dummies){if(!q.alive||q.benched)continue;const g=(q.x-p.x)*p.face;if(g>-20&&g<88&&Math.abs(q.y-p.y)<150){d=0;break}}}
 const room=(LIM[K0]||80)-NJ.trav;if(room<=0)d=0;else if(Math.abs(d)>room)d=Math.sign(d)*room;NJ.trav+=Math.abs(d);
 p.x+=d;if(typeof clampX==='function')p.x=clampX(p.x)}
// a direction tapped together with Claw counts even if it was let go a moment before the press is read (hit-stop holds the update)
const KT={right:-9,left:-9,down:-9,up:-9};(function poll(){try{const t=performance.now()/1000;if(K.right)KT.right=t;if(K.left)KT.left=t;if(K.down)KT.down=t;if(K.up||K.jump)KT.up=t}catch(_){}requestAnimationFrame(poll)})();
const held=(k)=>performance.now()/1000-KT[k]<.16;
function readInp(){const f=p.face>0?'right':'left',b=p.face>0?'left':'right',turned=performance.now()/1000-(NJ.turnT||-9)<.25;return{down:held('down'),up:held('up'),fwd:!turned&&held(f),back:held(b)}}
// ---------- which move a press throws ----------
const NEXT={'':'l1',l1:'l2',l2:'l3',l3:'l4',l4:'l1',l5:'l2',h1:'l1',h2:'l1',counter:'l2',blink:'l1',dodge:'l1',block:'counter',a3:'l1',fin:'l1',launch:'a1',a1:'a2',a2:'a3',blinka:'a1'};
function pickC(inp,air,n,beat){
 if(air){if(inp.down||NJ.airN>=2)return 'a3';return NJ.last==='a1'?'a2':NJ.last==='a2'?'a3':'a1'}
 if(n===7&&beat)return 'h1';                                   // 8-hit string: hit 7 on the beat is the low sweep
 if(NJ.k==='block')return 'counter';
 if(inp.up)return 'launch';if(inp.down)return 'h1';if(inp.fwd)return NJ.last==='l1'?'l5':'l1';
 return NEXT[NJ.last||'']||'l1'}
function pick(q,n,beat){const inAir=NJ.k?(NJ.k==='launch'||(MV[NJ.k][3]&&NJ.k!=='a3')):!p.ground;
 if(q.b==='B')return inAir?'blinka':'blink';if(q.b==='G')return inAir?null:'block';if(q.b==='O')return inAir?null:'dodge';
 if(q.b==='M')return inAir?'a2':'counter';if(q.b==='T')return inAir?'a2':'h2';
 return pickC(q.inp,inAir,n,beat)}
// ---------- start a move ----------
function start(k,s,o){o=o||{};const prev=NJ.k,M=MV[k];if(!fr(k).length)return false;
 const fromAir=prev?(prev==='launch'||(MV[prev][3]&&prev!=='a3')):!p.ground;
 p.state='nj';p.t=0;p.vx=0;p.vy=0;p.wall=false;acted=true;p.shot=false;p.queued=false;
 if(typeof tokAct==='function'&&(M[0]==='light'||M[0]==='heavy'&&k!=='h2'||M[0]==='air'||M[0]==='spike'||M[0]==='launch'))tokAct('n1');
 if(k==='h2'&&typeof tokAct==='function')tokAct('nthrow');
 setAnim('nj_'+k,true);p.ft=s;p.fi=s;if(s>0||o.cut){p.blend=0;p.prevF=null}
 NJ.k=k;NJ.s=s;NJ.q=null;NJ.early=false;NJ.hit={};NJ.sfx={};NJ.lastFi=s;NJ.trav=0;NJ.face=p.face;NJ.mul=1;NJ.fall=false;NJ.t0=now;
 if(M[3]){   // air move: keep the current baseline, or set it so frame s sits where Paddy is now
  if(!(prev&&fromAir))NJ.Y0=p.y+ly(k,s)*RS;
  NJ.Yt=NJ.Y0;const d=target(420,true);if(d&&M[0]!=='blink'){const want=d.y+ly(k,s)*RS+10;NJ.Yt=NJ.Y0+Math.max(-150,Math.min(150,want-NJ.Y0))}
 }else{NJ.Y0=o.fromAir?Math.min(floorY(),p.y+ly(k,s)*RS):floorY();NJ.Yt=NJ.Y0}
 // blinks and the finisher's dash close the real gap to the enemy (scale the drawn travel to land just in front of him)
 if(M[0]==='blink'||k==='fin'){const d=target(k==='blinka'?520:620,k==='blinka');const tr=k==='fin'?rx(k,5)-rx(k,s):rx(k,lastF(k))-rx(k,s);
  if(d&&tr>0){if(Math.abs(d.x-p.x)>25)p.face=d.x>=p.x?1:-1;NJ.face=p.face;const gap=Math.abs(d.x-p.x)-(k==='fin'?95:80);NJ.mul=Math.max(.15,Math.min(1.6,gap/(tr*RS)));
   if(k==='blinka'&&d.y<GROUND-30){NJ.Yt=NJ.Y0+Math.max(-160,Math.min(160,(d.y+ly(k,0)*RS+10)-NJ.Y0))}}
  else NJ.mul=k==='fin'?.25:1;
  if(M[0]==='blink'){p.inv=Math.max(p.inv,.3);puffShadow(p.x,p.y)}}
 if(k==='counter'){const d=target(300);const tr=rx(k,3)-rx(k,s);if(d&&tr>0){const gap=Math.abs(d.x-p.x)-110;NJ.mul=Math.max(.6,Math.min(1.6,gap/(tr*RS)))}}   // the counter palm steps in to reach him
 p.y=NJ.Y0-ly(k,s)*RS;p.ground=p.y>=floorY()-1;
 if(M[0]!=='blink'&&M[0]!=='block'&&M[0]!=='dodge'){C.atk++;if(M[1]&&!o.quiet)say(M[1],M[2],M[4]>=3)}
 if(k==='dodge'){p.inv=Math.max(p.inv,.36);say('DODGE!','#bfe8ff')}
 if(k==='block'){NJ.bT=0;NJ.blkHit=0}
 if(M[3])NJ.airN+=(M[0]==='air'||M[0]==='spike')?1:0;
 NJ.last=k;NJ.str.push(k);if(NJ.str.length>16)NJ.str.shift();NJ.moves.push(k);if(NJ.moves.length>40)NJ.moves.shift();
 frameEvents(s);return true}
// root jump for a cancel: the next move's frame 1 sits where this move's last frame would have been
function rootJump(a,fromFi,b,s){const d=(rx(a,lastF(a))-rx(a,fromFi))+rx(b,s)-rx(b,0);NJ.mul=1;NJ.trav=0;NJ.k=a;move(d*RS)}
function chain(b,s){const a=NJ.k,fi=p.fi;rootJump(a,fi,b,s);return start(b,s)}
// ---------- per-frame events: effort sounds, hits ----------
function frameEvents(fi){const k=NJ.k,f=at(k,fi);if(f.sfx&&!NJ.sfx[fi]){NJ.sfx[fi]=1;effort(f.sfx)}
 if(f.hit===1&&!NJ.hit[fi]){NJ.hit[fi]=1;strike(k,fi)}
 if(k==='fin'&&f.hit>=2){hitstop=Math.max(hitstop,.06)}       // 3-frame hold on the finisher
 const K0=MV[k][0];if((K0==='blink')&&(fi===2||fi===1&&k==='blinka')){for(let i=1;i<=4;i++)ghosts.push({x:p.x-p.face*i*38,y:p.y,f:(FR['nj_'+k]||[])[fi],face:p.face,l:.12+i*.04,blue:1})}
 if(fi===lastF(k)&&K0!=='blink'&&!MV[k][3]&&ly(k,fi-1)>20)spark(p.x,floorY(),6,'#d9c49a',110)}
function strike(k,fi){const M=MV[k],B=BOX[M[0]];if(!B)return;let n=0;
 const tx=p.x+p.face*B[0]*.55,ty=p.y-B[1];
 for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face,h=d.h||165;
  if(g<-40||g>B[0]+(d.w||0)*.3)continue;if(d.y-h>ty+B[2]||d.y<ty-B[2])continue;
  if(k==='a1'||k==='a2'||k==='blinka'){d.x+=(p.x+p.face*110-d.x)*.35}
  hitDummy(d,'nj_'+k,p.face);n++;
  if(M[3]&&k!=='a3'){d.vy=-300;d.fl=Math.max(d.fl||0,.5)}           // air hits keep him floating in reach instead of rocketing him away
  if(k==='launch'&&d.y<GROUND+1){d.vy=Math.max(d.vy,-560);d.fl=Math.max(d.fl||0,.6)}
  if(k==='fin'){d.hp=Math.min(d.hp,0);finFx(d)}}
 NJ.hits[k]=(NJ.hits[k]||0)+n;
 // minimal FX from the sheets: small white/lavender burst + 3 speed lines at the strike tip (also on a whiff, smaller)
 const big=M[4]>=2;for(let i=0;i<(n?(big?14:8):3);i++){const a=(p.face>0?0:Math.PI)+(Math.random()-.5)*2.4,v=160+Math.random()*(big?420:260);sparks.push({x:tx,y:ty,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.22,c:i%2?'#fff':M[2]})}
 if(n&&window.K29)for(let i=0;i<3;i++)K29.imp.push({streak:1,x:tx-p.face*(70+i*14),y:ty-14+i*14,face:p.face,len:60+i*10,col:i===1?V2:V1,l:1,d:0});
 if(n){shake=Math.max(shake,M[4]>=3?18:big?8:4);if(M[4]>=2)waves.push({x:tx,y:ty,r:12,l:.6,big:M[4]>=3})}}
function finFx(d){slowT=Math.max(slowT,.55);flashT=Math.max(flashT,.3);hitstop=Math.max(hitstop,.14);cine.tz=1.15;
 for(let i=0;i<3;i++)waves.push({x:d.x,y:d.y-80+i*12,r:10+i*30,l:1,big:true});if(typeof burst==='function'){burst(d.x,d.y-90);burst(d.x,d.y-150,1)}
 for(let i=0;i<46;i++){const a=Math.random()*6.28,v=200+Math.random()*650;sparks.push({x:d.x,y:d.y-90,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,l:.7,c:['#fff','#c9a7ff','#9fe8ff','#ff9ad5'][i%4]})}
 cine.pillar={x:d.x,l:1,col:'#c9a7ff'};card('CRESCENT MOON KICK!','NINJA FINISHER · 8 HITS','#c9a7ff')}
// ---------- the move state (runs before the game's own state code, like punch33) ----------
function endTo(normal){const k=NJ.k;NJ.k=null;p.state='normal';p.vx=0;p.vy=0;p.cool=.04;
 if(normal==='air'){p.ground=false;setAnim('n_fall')}else{p.y=Math.min(p.y,floorY());if(k&&!MV[k][3]&&k!=='block'&&k!=='dodge'){p.state='nj';NJ.k='rec';p.t=0;setAnim('nj_rec',true);p.blend=0;p.prevF=null;p.ft=0;p.fi=0}}
 if(normal!=='air'){NJ.n=0;NJ.beat=true;NJ.last='';NJ.airN=0;p.ncombo=0}}
function tick(dt){
 NJ.cool-=dt;NJ.dt=dt;
 enfT-=dt;if(enfT<=0||isN()){enfT=.5;enforce()}
 if(!isN()){if(NJ.k){NJ.k=null}if(p.state==='nj')p.state='normal';return}
 // walk cycle speed follows the run speed so the feet don't skate
 if(A.n_run===ALL.n_run)A.n_run[2]=Math.max(7,Math.min(22,Math.abs(p.vx)/(WALKSTEP*RS)));
 if(p.state!=='nj'){if(NJ.k)NJ.k=null;if(p.ground&&p.state==='normal')NJ.airN=0;return}
 const k=NJ.k;
 if(k==='rec'){   // short recovery back to the upright idle; any press or move goes straight on
  const b=P.attack||P.tail||P.special||P.guard||P.dodge||P.jump;
  if(b||K.left||K.right||!p.ground||p.ft+dt*10>=3){NJ.k=null;p.state='normal';p.vx=0}return}
 if(!k||!MV[k]){p.state='normal';return}const M=MV[k],L=fr(k).length;
 if(p.t>1.2)p.t=1.2;    // long holds (block) stay under the game's safety net
 // turning round mid-combo (also when the game's own input code already flipped him)
 if(p.face!==NJ.face&&M[0]!=='blink'){NJ.face=p.face;NJ.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1}
 const want=P.left?-1:P.right?1:0;
 if(want&&want!==p.face&&M[0]!=='blink'&&k!=='dodge'){p.face=want;NJ.face=want;NJ.turnT=performance.now()/1000;C.atk++;if(window.K29)K29.turns=(K29.turns||0)+1;if(C.n>0)C.t=Math.max(C.t,C.max);
  for(let i=0;i<6;i++)sparks.push({x:p.x,y:p.y-60-Math.random()*60,vx:want*(120+Math.random()*200),vy:(Math.random()-.5)*120,l:.25,c:'#fff'})}
 const fi=p.fi,ft=p.ft+dt*FPS,nfi=Math.min(L-1,Math.floor(ft)),hf=hitF(k),buf=hf>=0?hf:1;
 // ---- input ----
 const isAir=k==='launch'||(M[3]&&k!=='a3');
 let b=null;if(P.attack){delete P.attack;b='C'}else if(P.tail){delete P.tail;b='T'}else if(P.special){delete P.special;b='M'}else if(P.blink){delete P.blink;b='B'}
 else if(P.dodge){delete P.dodge;b='O'}else if(P.guard&&k!=='block'){delete P.guard;b='G'}
 if(isAir&&P.down&&!b){delete P.down;b='C';NJ.forceSpike=1}
 if(P.jump&&fi>=buf&&k!=='fin'&&M[0]!=='block'){delete P.jump;NJ.k=null;p.state='normal';p.vy=0;if(!isAir){p.ground=true;p.y=floorY()}if(typeof nJump==='function')nJump();if(p.state==='normal'&&!p.ground)setAnim('n_rise');return}
 if(b){acted=true;
  if(k==='block'){if(b==='C'||b==='M'){counterFrom(NJ.blkHit&&now-NJ.blkHit<.7?2:1);return}if(b==='O'){NJ.q={b:'O',inp:readInp(),beat:false}}}
  else if(k==='fin'){}
  else{const inp=readInp();if(NJ.forceSpike){inp.down=true;NJ.forceSpike=0}
   const on=fi>=buf&&!NJ.early;if(fi<buf&&b==='C')NJ.early=true;
   if(!NJ.q||fi>=buf)NJ.q={b,inp,beat:on}}}
 // ---- block: hold ----
 if(k==='block'){NJ.bT+=dt;const held=K.guard;
  if(held&&ft>=4.9){p.ft=Math.min(p.ft,3.9);applyFrame(3);p.t=Math.min(p.t,.6);return}
  if(!held&&NJ.bT<.16&&!NJ.blkHit&&fi<=1){rootJump('block',fi,'dodge',1);start('dodge',1);return}
  if(!held&&fi<4){p.ft=Math.max(p.ft,4);}
  if(NJ.q&&NJ.q.b==='O'){NJ.q=null;rootJump('block',fi,'dodge',1);start('dodge',1);return}}
 // ---- cancel point: end of frame n-1 -> the next move from its frame 2 ----
 const q=NJ.q,cut=L-1;
 if(q&&k!=='fin'&&ft>=cut&&fi>=buf){NJ.q=null;const n=NJ.n+1,strikeNext=q.b==='C';
  if(NJ.n>=3&&strikeNext)NJ.beat=NJ.beat&&q.beat;
  if(strikeNext&&NJ.n>=3&&!q.beat)p.miss=true;
  // an on-beat 8th press = the crescent finisher
  if(strikeNext&&!isAir&&NJ.n===7&&NJ.beat&&q.beat){say('PERFECT!','#7fffd4',true);NJ.n=8;rootJump(k,fi,'fin',1);start('fin',1);return}
  let nb=pick(q,n,NJ.beat&&q.beat&&NJ.n>=3);if(!nb){NJ.q=null}
  else{if(strikeNext&&NJ.n>=3&&NJ.beat&&q.beat&&!isAir){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false})}
   if(MV[nb][0]!=='blink'&&MV[nb][0]!=='block'&&MV[nb][0]!=='dodge'&&!MV[nb][3])NJ.n=n;else if(MV[nb][3]&&MV[nb][0]!=='blink')NJ.n=n;
   p.ncombo=Math.min(8,NJ.n);chain(nb,1);return}}
 // ---- a3: hold the dive pose until the ground is reached ----
 if(k==='a3'&&nfi>=5&&!NJ.landed){const fl=floorY();if(p.y<fl-4){NJ.fall=true;p.ft=Math.min(p.ft,4.95);NJ.vy=(NJ.vy||300)+2600*dt;p.y=Math.min(fl,p.y+NJ.vy*dt);applyFrameX(4);return}
  NJ.landed=true;NJ.Y0=fl;NJ.Yt=fl;NJ.vy=0;shake=Math.max(shake,8);spark(p.x,fl,10,['#fff','#d9c49a'],200);waves.push({x:p.x,y:fl,r:10,l:.6,big:false})}
 if(k!=='a3')NJ.landed=false;
 // ---- end of the move with nothing queued ----
 if(ft>=L){if(isAir&&k!=='launch'||k==='launch'){endTo('air');return}
  if(k==='fin'){NJ.n=0}endTo('ground');return}
 applyFrame(nfi)}
function applyFrameX(nfi){const k=NJ.k;if(nfi!==NJ.lastFi){move((rx(k,nfi)-rx(k,NJ.lastFi))*RS);NJ.lastFi=nfi;frameEvents(nfi)}}
function applyFrame(nfi){const k=NJ.k;applyFrameX(nfi);if(!NJ.k)return;
 if(NJ.Yt!=null&&NJ.Yt!==NJ.Y0){const st=(MV[k][0]==='blink'?1400:650)*(NJ.dt||.016),dy=NJ.Yt-NJ.Y0;NJ.Y0+=Math.abs(dy)<=st?dy:Math.sign(dy)*st}   // glide to the juggle height, never snap
 p.y=NJ.Y0-ly(k,nfi)*RS;p.vx=0;p.vy=0;
 if(p.y>floorY())p.y=floorY();
 if(k==='dodge'&&nfi>=4)p.inv=Math.min(p.inv,.05)}
function counterFrom(s){const a=NJ.k;rootJump(a,p.fi,'counter',s);start('counter',s);NJ.n=Math.max(NJ.n,1)}
// ---------- entry points the game calls for the ninja form ----------
function moves(dir){
 if(!p.wall&&p.y>WT+10&&((p.x>=WALL_X-64&&K.right)||(p.x<=LW+64&&K.left))&&!K.down){act('wallrun','n_wall',{say:'WALL RUN!',c:V1});p.face=p.x<VW/2?-1:1;p.vx=0;p.jumps=1;p.airDash=false;return}
 if(P.jump&&P.attack&&p.ground){delete P.jump;delete P.attack;NJ.k=null;NJ.n=1;NJ.beat=true;p.miss=false;NJ.last='';start('launch',0);p.ncombo=1;return}   // Jump + Claw together = launcher
 if(P.jump&&nJump())return;
 const inp=readInp();NJ.k=null;
 if(!p.ground&&P.attack&&(K.up||K.jump||held('up'))&&p.vy<0&&now-(p.lastJump||-9)<.35&&NJ.airN===0){delete P.attack;NJ.n=1;NJ.beat=true;p.miss=false;NJ.last='';start('launch',0,{fromAir:1});p.ncombo=1;return}   // ↑/Jump + Claw = launcher (the jump key fires first)
 if(!p.ground){if(P.attack||P.down){if(P.down)inp.down=true;delete P.attack;delete P.down;NJ.last=NJ.airN>0?NJ.last:'';start(pickC(inp,true,1,false),0);return}
  if(P.tail){delete P.tail;start('a2',0);return}return}
 if(P.attack){delete P.attack;NJ.n=1;NJ.beat=true;NJ.early=false;p.miss=false;NJ.last='';if(NJ.blkHit&&now-NJ.blkHit<.7){NJ.blkHit=0;start('counter',1)}else start(pickC(inp,false,1,false),0);p.ncombo=1;return}   // Claw straight after a block = counter palm
 if(P.tail){delete P.tail;NJ.n=1;NJ.beat=true;p.miss=false;start('h2',0);p.ncombo=1;return}
 if(P.special){delete P.special;NJ.n=1;NJ.beat=true;p.miss=false;start('counter',0);return}}
function defence(){if(!isN())return;
 if(!['normal','land','nflip','nbflip'].includes(p.state))return;
 if(P.dodge&&p.ground){delete P.dodge;NJ.k=null;start('dodge',0);return}
 if(P.guard&&p.ground){delete P.guard;NJ.k=null;start('block',0);return}}
function blink(){if(NJ.cool>0)return false;if(['nmorph','hurt','respawn','wallrun','lk','lkult','eclipse','finishhim'].includes(p.state))return false;
 if(p.state==='nj'&&NJ.k!=='rec'){if(NJ.k&&NJ.k!=='fin')NJ.q={b:'B',inp:readInp(),beat:false};return true}
 if(p.state==='nj')p.state='normal';
 NJ.cool=.3;const air=!p.ground;NJ.k=null;return start(air?'blinka':'blink',0)}
function dash(dir){p.face=dir==='right'?1:-1;p.dashCool=.4;p.dashStart=now;if(p.state==='nj'&&NJ.k!=='rec')return;NJ.k=null;start(p.ground?'blink':'blinka',0)}
// ---------- hook the game ----------
nMoves=function(dir){if(!isN())return;try{moves(dir)}catch(e){console.warn('nj',e)}};
nStep=function(){return blink()};
nDash=function(dir){dash(dir)};
nHit=function(){NJ.k=null;NJ.n=1;start(p.ground?(K.up?'launch':'l1'):'a1',0)};
nAir=function(){NJ.k=null;start('a1',0);return true};
nCancel=function(){if(P.jump&&nJump())return true;if(P.blink){delete P.blink;return blink()}return false};
nThrow=function(){NJ.k=null;start(p.ground?'h2':'a2',0)};
if(typeof NST!=='undefined'&&!NST.includes('nj'))NST.push('nj');
if(typeof UNG!=='undefined')UNG.add('nj');
const _ns=nState;nState=function(S,dt,end,dir){if(S==='nj')return;return _ns.apply(this,arguments)};
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{tick(dt);defence()}catch(e){console.warn('nj',e)}};
// the old claw slash arcs and generic hit sparks don't belong on the drawn strikes
const _cf=clawFx;clawFx=function(){if(isN()&&p.state==='nj')return;return _cf.apply(this,arguments)};
// defence vs the practice spar / any incoming hit: block, perfect block = counter, early dodge = counter
const _ds=dogStrike;dogStrike=function(d,dmg,kind){if(isN()&&p.state==='nj'&&NJ.k){const dir=Math.sign(p.x-d.x)||-1;
  if(NJ.k==='block'||(NJ.k==='counter'&&p.fi<=2)){
   if(NJ.k==='block'&&NJ.bT<.2){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);flashT=Math.max(flashT,.15);hitstop=Math.max(hitstop,.08);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}
   NJ.blkHit=now;say('BLOCKED!','#cfe3ff',true);p.x+=dir*10;d.vx=-dir*160;d.vy=Math.min(d.vy||0,-220);d.cool=Math.max(d.cool||0,1.4);if(typeof dSet==='function'&&!d.cr)dSet(d,'hurt','r_hurt');
   d.flash=.16;shake=Math.max(shake,6);hitstop=Math.max(hitstop,.05);if(window.K29)K29.imp.push({x:p.x+p.face*55,y:p.y-95,l:1,big:false,col:'#cfe3ff',rot:0});snd('ninja_hit',{v:.4,r:1.3,gap:.1});return true}
  if(NJ.k==='dodge'&&p.t<.22){say('COUNTER!','#7fffd4',true);d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);p.face=d.x>=p.x?1:-1;slowT=Math.max(slowT,.4);counterFrom(2);p.inv=Math.max(p.inv,.6);return true}}
 return _ds.apply(this,arguments)};
// beat ring: green from the impact frame of the current move (hits 3-7 of a clean string)
const _cue=cueInfo;cueInfo=function(){if(NJ.own()&&NJ.n>=3&&NJ.n<8&&NJ.beat&&!p.miss&&!MV[NJ.k][3]){const h=hitF(NJ.k);if(h>=0)return{H:(h-(NJ.s||0))/FPS+.2}}return _cue()};
// link routes: 3+ clean hits open ROUTES[1] (Tail / Meow / Blink), TTT knees open the T routes
const _op=openerNow;openerNow=function(){if(NJ.own()){const n=NJ.n+(NJ.q&&NJ.q.b==='C'?1:0);
  if(NJ.k==='h2'&&now-lastTokT<.75){let t=0;for(let i=TOK.length-1;i>=0&&TOK[i].c==='T';i--)t++;if(t>=3)return{run:'TTT',W:.16,E:.5}}
  if(n>=3&&!p.miss&&!MV[NJ.k][3]&&NJ.k!=='fin')return{run:'C'.repeat(Math.min(n,8)),W:.07,E:.7}}return _op()};
const _ls=liveSeq;liveSeq=function(){if(NJ.own()&&!LK.on)return 'C'.repeat(Math.min(8,NJ.n));return _ls()};
// the ninja victory pose
const _fa=fa;fa=function(k){if(isN()&&!p.uf&&!p.xf&&!p.sam){if(k==='victory')return 'n_victory';if(k==='rec')return 'nj_rec'}return _fa(k)};
// ---------- preload: every ninja frame first once Ninja is picked (and quietly in the background before that) ----------
let asked=0;const _pre2=r9Pre;r9Pre=function(dt){try{if(asked<2&&window.queueFrames&&F&&F.nj_idle){const hi=isN();if(hi||asked===0){const L=[];for(const a in ALL)(frOf(ALL[a])||[]).forEach(q=>L.push(q.f));queueFrames([...new Set(L)],hi);asked=hi?2:1}}}catch(_){}_pre2(dt)};
(function early(){if(F&&F.nj_idle){enforce();return}setTimeout(early,30)})();
window.NINJA35={MV,NJ,ALL,BOX,enforce};
})();
