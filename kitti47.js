// ===================== v47: KITTI PADDY DOUBLE-TAP MOVES (base Paddy with the 1-2-3 punch combo only) =====================
// Pernell 4 Nov 2026. Only base Paddy (FORM 0, Kitty Style off = the punch strings from punch33.js); every other form is untouched.
// Double-tap = two short presses of the same direction (each press let go within 0.25 s, the 2nd within 0.28 s of the 1st),
// on the keyboard (← → ↑ ↓ / A D W S) or the touch D-pad (a thumb sliding across the pad never counts as a tap).
// "Back" / "forward" = away from / toward the way Paddy faced when the first tap went in.
//   back  back   = DODGE      backstep, ~0.34 s invulnerable (kitty29's kdodge: a punch landing in it still auto-counters)
//                  + Claw    = COUNTER SLASH  (darts at the nearest enemy in front and slashes, kitty29's counter art)
//   fwd   fwd    = DASH       (the old double-tap dash)
//                  + Claw    = DASH STRIKE    counts as a combo hit: the string number carries on and the next Claw goes
//                              straight back into the punch combo (jab, cross, hook, body ... power punches on the beat)
//   up    up     = SKY POUNCE big forward leap (1st tap is the normal jump, the 2nd turns it into the pounce)
//                  + Claw    = POUNCE LAUNCHER swoops onto the nearest enemy below / in front and swipes him high into the air
//   down  down   = CAT SLIDE  low fast slide along the ground, ducks under attacks (brief invulnerability)
//                  + Claw    = SLIDE SWEEP    low spinning sweep that pops the enemy up off his feet
// Every follow-up keeps the combo counter running and the next Claw continues the punch string.
// v48: kitti48.js draws all of these with the pink punch sheets (eased motion, squash/stretch, afterimages) and adds
// quick taps (slip / weave) + charged punches. v47 art: only existing Paddy frames (dash, dashstrike, slide, pounce, launcher, tailwhip, k_m_power) with afterimages and speed lines.
(function(){
if(typeof p==='undefined'||typeof press!=='function'||typeof release!=='function'||typeof tapDir!=='function')return;
const on=()=>{try{return FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(_){return false}};
const rt=()=>performance.now()/1000;
const KD=window.KD47={win:.3,hold:.25,last:{},req:null,log:[],n:{dodge:0,dash:0,pounce:0,slide:0,counter:0,dashstrike:0,launcher:0,sweep:0},fu:null,lines:[],gaps:[]};
const DIRS=['left','right','up','down'];
const BLOCK=new Set(['respawn','bunny','finisher','finishhim','eclipse','lk','lkult','ledge','hurt','victory','manner']);
function log(s){KD.log.push(s);if(KD.log.length>40)KD.log.shift()}
// ---- double-tap detection ----
function detect(k){const t=rt(),L=KD.last[k];
 if(window.PADSLIDE){KD.last[k]=null;return false}          // a thumb sliding onto this arrow is not a tap
 const dbl=!!(L&&L.up&&t-L.t<KD.win&&L.up-L.t<KD.hold);
 if(L)KD.gaps.push([k,+(t-L.t).toFixed(3),L.up?+(L.up-L.t).toFixed(3):-1]);if(KD.gaps.length>20)KD.gaps.shift();
 if(!dbl){KD.last[k]={t,up:0,face:p.face,st:p.state,ground:!!p.ground};return false}
 KD.last[k]=null;
 if(k==='left'||k==='right'){const d=k==='right'?1:-1;KD.req={k:d===L.face?'fwd':'back',face:L.face,dir:k,t,ground:!!L.ground}}
 else KD.req={k,face:L.face,t,ground:!!L.ground};
 log('dtap:'+KD.req.k);return true}
const _press=press;press=function(k){
 if(DIRS.includes(k)&&on()){const fresh=k==='up'?!K.up:!K[k];
  if(fresh&&detect(k)){
   if(k==='up'&&KD.req&&KD.req.ground){K.up=1;return}       // two quick ups from the ground: the air punch, not a double jump
   const r=_press.apply(this,arguments);
   if(KD.req&&KD.req.k==='fwd'){P.dash=k;BUF.dash=now}         // forward: the normal dash (and dash strike out of a combo)
   return r}}
 return _press.apply(this,arguments)};
const _release=release;release=function(k){if(DIRS.includes(k)){const L=KD.last[k];if(L&&!L.up)L.up=rt()}return _release.apply(this,arguments)};
const _tapDir=tapDir;tapDir=function(k){if(on())return;return _tapDir.apply(this,arguments)};   // base Paddy: detection above
// ---- moves ----
Object.assign(NAMES,{kcounter:'COUNTER CROSS!',kpl:'POUNCE UPPERCUT!',ksweep:'SLIDE BODY BLOW!',dashstrike:'DASH STRIKE!'});
Object.assign(KB,{kpl:[70,-1150,.55,.1],ksweep:[160,-620,.35,.08]});
if(typeof LIFT!=='undefined'&&!LIFT.includes('kpl'))LIFT.push('kpl');
function keep(){p.keepT=.45;p.keepCombo=Math.min(7,p.combo||0)}
function nearFront(maxDx,maxUp,maxDown){let best=null,bd=1e9;for(const d of dummies){if(!d.alive||d.benched)continue;const dx=(d.x-p.x)*p.face,dy=d.y-p.y;
  if(dx>-40&&dx<maxDx&&dy>-maxUp&&dy<maxDown&&dx<bd){bd=dx;best=d}}return best}
function ghost(l,blue){const f=(FR[p.anim]||FR.idle)[p.fi];if(f)ghosts.push({x:p.x,y:p.y,f,face:p.face,l,blue:blue?1:0})}
function lines(n,col){for(let i=0;i<n;i++)KD.lines.push({x:p.x-p.face*(30+Math.random()*80),y:p.y-20-Math.random()*130,len:60+Math.random()*90,face:p.face,l:1,col:col||'#ffffff'})}
function dodge(face){p.face=face;p.state='kdodge';p.t=0;acted=true;setAnim('dash',true);p.dd=-face;p.vx=-face*820;p.inv=Math.max(p.inv,.34);p.noFlick=true;p.wall=false;
 if(!p.ground)p.vy=Math.min(p.vy,-60);p.kdCool=.42;if(window.K29)K29.dodges++;say('DODGE!','#bfe8ff');if(typeof puffShadow==='function')puffShadow(p.x,p.y);
 KD.fu={k:'dodge',t:rt()};KD.n.dodge++;log('dodge')}
function counterSlash(){const d=nearFront(520,200,200);p.state='kcounter';p.t=0;p.shot=false;p.ctg=d;acted=true;setAnim('kcounter',true);p.inv=Math.max(p.inv,.5);p.noFlick=true;
 hitstop=Math.max(hitstop,.04);shake=Math.max(shake,6);say('COUNTER CROSS!','#7fffd4',true);lines(6,'#7fffd4');KD.n.counter++;KD.fu=null;KD.post='kcounter';log('counter')}
function pounce(){p.state='kpounce';p.t=0;acted=true;setAnim('pounce',true);p.vy=-980;p.vx=p.face*520;p.ground=false;p.jumps=2;p.wall=false;p.kpUsed=true;
 shake=Math.max(shake,4);spark(p.x,p.y,12,['#fff','#ffe08a'],220);say('SKY POUNCE!','#ffe08a');KD.fu={k:'up',t:rt()};KD.n.pounce++;log('pounce')}
function launcher(){const d=nearFront(300,140,420);p.state='kpl';p.t=0;p.shot=false;p.ctg=d;acted=true;setAnim('pawpop',true);p.vx=0;p.vy=0;p.inv=Math.max(p.inv,.25);
 say('POUNCE UPPERCUT!','#ffd070',true);KD.n.launcher++;KD.fu=null;log('launcher')}
function slide(){p.state='kslide';p.t=0;acted=true;setAnim('slide',true);p.vx=p.face*860;p.inv=Math.max(p.inv,.3);p.noFlick=true;
 shake=Math.max(shake,3);say('CAT SLIDE!','#ffe08a');KD.fu={k:'down',t:rt()};KD.n.slide++;log('slide')}
function sweep(){p.state='ksweep';p.t=0;p.shot=false;p.kswHit=new Set();acted=true;setAnim('tailwhip',true);p.vx=p.face*Math.max(420,Math.min(620,Math.abs(p.vx)));
 say('SLIDE BODY BLOW!','#ffb070',true);KD.n.sweep++;KD.fu=null;log('sweep')}
// dash strike = a combo hit: string number carries on, the next Claw goes back into the punch string
const _dst=dashStrike;dashStrike=function(){const r=_dst.apply(this,arguments);if(on()&&p.state==='dashstrike'){p.combo=Math.min(7,(p.combo||0)+1);if(typeof popNum==='function')popNum(p.combo,'#ff9fd0');lines(8,'#ffb0e0');KD.n.dashstrike++;KD.post='dashstrike';log('dashstrike:'+p.combo)}return r};
const DODGE_OK=new Set(['kslip','kweave','kcharge','normal','claw','land','stop','dash','hardland','slide','jcharge','dashstrike','kslide','tailwhip','swat','pawpop','airswipe','meow','kguard']);
const UP_OK=new Set(['normal','jcharge','land','stop','dash']);
const DOWN_OK=new Set(['kweave','kslip','normal','land','stop','slide','dash','hardland']);
let prevS='';
function tick(dt){if(!on()){KD.req=null;KD.fu=null;return}
 const t=rt(),S=p.state;
 if(p.ground&&S!=='kpounce')p.kpUsed=false;
 // follow-up finished -> the punch string carries on
 if(prevS!==S&&['dashstrike','kcounter','kpl','ksweep'].includes(prevS)&&!['claw','hurt','respawn'].includes(S))keep();
 // ---- start a double-tap move ----
 const q=KD.req;if(q){if(t-q.t>.2||BLOCK.has(S)||(typeof CINE!=='undefined'&&CINE.includes(S)))KD.req=null;
  else if(q.k==='back'){if(DODGE_OK.has(S)&&!p.wall&&(p.kdCool||0)<=0){KD.req=null;dodge(q.face)}}
  else if(q.k==='fwd'){KD.req=null;KD.n.dash++;KD.fu={k:'fwd',t}}
  else if(q.k==='up'){if(UP_OK.has(S)&&!p.wall&&!p.kpUsed){KD.req=null;pounce()}else if(S==='claw'||p.kpUsed)KD.req=null}
  else if(q.k==='down'){if(DOWN_OK.has(S)&&p.ground&&!p.wall){KD.req=null;slide()}else if(!p.ground)KD.req=null}}
 // ---- + Claw follow-ups ----
 const S2=p.state,fu=KD.fu;
 if(P.attack&&fu){
  if(fu.k==='dodge'&&(S2==='kdodge'||(S2==='normal'&&t-fu.t<.65))){delete P.attack;counterSlash()}
  else if(fu.k==='up'&&(S2==='kpounce'||(S2==='normal'&&!p.ground&&t-fu.t<1))){delete P.attack;launcher()}
  else if(fu.k==='down'&&(S2==='kslide'||(['normal','stop'].includes(S2)&&p.ground&&t-fu.t<.75))){
   const chord=window.PRACTICE&&PRACTICE.on&&(P.attack||(window.P33&&P33.aim&&performance.now()/1000-P33.aim.t<.22&&P33.aim.inp.down));
   if(!chord){delete P.attack;sweep()}}}
 if(fu&&t-fu.t>1.2)KD.fu=null;
 // dash strike -> Claw = straight back into the punch string (counter keeps going)
 if(p.state==='dashstrike'&&P.attack&&p.t>.16){delete P.attack;p.state='normal';startClaw()}
 else if(['kcounter','kpl','ksweep'].includes(p.state)&&P.attack&&p.t>.3){delete P.attack;if(p.ground){p.state='normal';startClaw()}}
 // ---- states ----
 switch(p.state){
  case 'kpounce':if(t%0.03<dt*1.5)ghost(.22,0);if(p.t>.05&&p.ground){p.state='normal';break}if(p.vy>80||p.t>.7)p.state='normal';break;
  case 'kpl':{const d=p.ctg&&p.ctg.alive?p.ctg:null;
   if(p.t<.12){if(d){const tx=d.x-p.face*95;p.x+=(tx-p.x)*Math.min(1,dt*16);const ty=Math.max(Math.min(p.y,d.y),Math.min(GROUND,d.y));p.y+=(ty-p.y)*Math.min(1,dt*14)}p.vy=0;p.vx=0;if(t%0.02<dt*1.5)ghost(.25,1)}
   else if(!p.shot){p.shot=true;C.atk++;slash('rise','#ffd070',{lvl:7,scale:1.5,dx:70,dy:90});spark(p.x+p.face*70,p.y-90,14,['#fff','#ffd070'],320);
    if(d&&Math.abs(d.x-p.x)<220&&Math.abs(d.y-p.y)<260){d.hp=Math.max(2,d.hp);hitDummy(d,'kpl',p.face)}else areaHit(p.x+p.face*80,p.y-40,150,'kpl');
    p.vy=-720;p.ground=false;shake=Math.max(shake,12);waves.push({x:p.x+p.face*70,y:p.y-90,r:10,l:1,big:true})}
   else if(p.t>.55||(p.ground&&p.t>.2))p.state='normal';break}
  case 'kslide':p.vx*=Math.pow(.25,dt);if(p.t%0.04<dt*1.5){sparks.push({x:p.x-p.face*30,y:p.y,vx:-p.face*120,vy:-70,l:.3,c:'#d9c49a'});ghost(.18,0)}if(t%0.06<dt*1.5)lines(1);
   if(P.jump){delete P.jump;p.state='normal';p.vy=-650;p.ground=false;p.jumps=1;break}if(p.t>.42||Math.abs(p.vx)<90){p.state='normal';p.noFlick=false}break;
  case 'ksweep':p.vx*=Math.pow(p.t<.18?.4:.02,dt);
   if(p.t>=.05&&!p.shot){p.shot=true;C.atk++;slash('low','#ffb070',{lvl:6,scale:1.35,dx:60});slash('spin','#ffe9a8',{lvl:4,scale:1.1});shake=Math.max(shake,8);spark(p.x+p.face*60,p.y-10,14,['#d9c49a','#fff'],260)}
   if(p.t>=.05&&p.t<.24)for(const d of dummies){if(!d.alive||d.benched||p.kswHit.has(d))continue;const dx=(d.x-p.x)*p.face;if(dx>-60&&dx<200&&Math.abs(d.y-p.y)<120){p.kswHit.add(d);hitDummy(d,'ksweep',p.face)}}
   if(p.t>.42){p.state='normal';p.noFlick=false}break;
  case 'dash':case 'dashstrike':if(t%0.05<dt*1.5)lines(1,p.state==='dash'?'#ffffff':'#ffb0e0');break;
 }
 // invulnerable moves never blink (the flicker would hide the art); the game's i-frame blink comes back afterwards
 if(['kdodge','kcounter','kpl','kslide','ksweep','kpounce','kslip','kweave','kcharge'].includes(p.state)){p.noFlick=true;p.kdNF=true}else if(p.kdNF){p.kdNF=false;if(!(typeof CINE!=='undefined'&&CINE.includes(p.state)))p.noFlick=false}
 prevS=p.state}
KD.seen=new Set();
const _pre=r9Pre;r9Pre=function(dt){try{tick(dt)}catch(e){console.warn('kd47',e)}_pre(dt);KD.seen.add(p.state)};   // KD47.seen: every state visited (tests)
// my states run their own timers; the game's safety net only kicks in after 2.5 s
// ---- speed lines (drawn behind the effects, world space) ----
const _fx=drawFx;drawFx=function(){try{const dt=1/60;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const s of KD.lines){s.l-=dt*3.2;if(s.l<=0)continue;ctx.globalAlpha=Math.max(0,s.l)*.7;ctx.strokeStyle=s.col;ctx.lineWidth=3*s.l+.5;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.face*s.len*s.l,s.y);ctx.stroke()}
  ctx.restore();KD.lines=KD.lines.filter(s=>s.l>0)}catch(_){}_fx()};
// ---- move list rows ----
(function(){const t=document.querySelector('#moves table');if(!t||document.getElementById('kd47row'))return;const tb=t.tBodies[0]||t;
 const R=[['🐱 KITTI PADDY DOUBLE-TAPS (base Paddy, punch combo) — tap a direction twice quickly','',''],
  ['DODGE: backstep, can\'t be hit for a moment · then Claw = COUNTER CROSS','← ← (away from where he faces)','◀ ◀'],
  ['DASH · then Claw = DASH STRIKE (keeps the combo going: Claw again = back into the punch combo)','→ → (the way he faces)','▶ ▶'],
  ['SKY POUNCE: big forward leap · then Claw = POUNCE UPPERCUT (knocks him high into the air)','↑ ↑ (or W W)','▲ ▲'],
  ['CAT SLIDE: low slide under attacks · then Claw = SLIDE BODY BLOW (pops him off his feet)','↓ ↓ (or S S)','▼ ▼']];
 R.forEach((r,i)=>{const tr=document.createElement('tr');if(!i){tr.id='kd47row';tr.innerHTML=`<th colspan="3" style="color:#ffe08a">${r[0]}</th>`}else tr.innerHTML=`<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`;tb.insertBefore(tr,tb.rows[Math.min(tb.rows.length,1+i)]||null)})})();
})();
