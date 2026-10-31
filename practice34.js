// ===================== v34: PRACTICE ROOM =====================
// Practise every combo and move with any form against sparring dummies that never break (HP refills, they always get back up).
// Stations (top bar, or U on the keyboard):
//  🥊 SPAR   - one dummy that winds up clearly (lean back, red glow, closing ring, "!") and throws a spring-glove punch every few
//              seconds: DODGE / BLOCK it (or jump, dash, Blink away) for DODGED! / BLOCKED!, hit back straight after for COUNTER!
//  ↔ TURN    - one dummy in front, one behind: turn mid-combo (tap the other way) and keep the chain going on both sides
//  🚀 LAUNCH - a dummy for launchers and juggles (JUGGLE ×n, best juggle)
// Corner panel = hints for the station + counters (hits, best combo, station stats); ↺ (or I) resets them.
// The dummy art is TEST art (generated/dummy/, cut by src/cut_dummy.py) and every sheet is looked up through DART below, so the
// artist's facing-right copies, the attacker variant and launched_fall drop in by re-running the cutter - no code change.
(function(){
if(typeof dummies==='undefined'||typeof A==='undefined'||typeof updDog!=='function')return;
const DART={idle:'sd_idle',light:'sd_hit_light',heavy:'sd_hit_heavy',launch:'sd_launched',down:'sd_knockdown',rec:'sd_recover',
 fall:'sd_launched_fall',            // apex -> ground (f4 = lands on its back); missing = tumble through launched 4-6
 fallShift:228,                      // NOTES.md: launched_fall 4 -> knockdown 5 moves the root this many sheet px toward Paddy
 // attacker ("fighter") variant: idle, wind-up (hold f4 = the tell), punch (f2-f3 = hit window), recover, hit; stays standing.
 // Missing sheets fall back to the base dummy + a drawn spring glove.
 atk:{idle:'sd_fighter_idle',wind:'sd_fighter_attack_windup',punch:'sd_fighter_attack_punch',rec:'sd_fighter_attack_recover',hit:'sd_fighter_hit_heavy',hitWin:[1,2],reach:196},
 right:'_r',                         // facing-right copies sd_<sheet>_r (cut from <sheet>_R.jpg); a sheet without one is mirrored
 fps:12,idleFps:6};
const WIND=.95,PUNCH=.42,AREC=.34,GR=118;  // wind-up, punch and recovery times (s); drawn spring-glove reach (world px, fallback only)
const PR={on:false,st:'spar',s:null,hintT:0,lastD:null,lastT:-9,hp0:3,keys:true};window.PRACTICE=PR;
const zero=()=>({hits:0,best:0,dodged:0,blocked:0,counter:0,turns:0,launches:0,jug:0});PR.s=zero();
const sheet=(k,face)=>{if(face>0&&F[k+DART.right])return [F[k+DART.right],false];return [F[k]||F[DART.idle]||[],face>0]};
const has=k=>!!(F&&F[k]&&F[k].length);
const FSC=()=>{const f=F[DART.idle]&&F[DART.idle][0];return f?f.h/342:.6244};   // sheet px -> frame px (the cutter's Paddy factor)
const snd=(k,o)=>{try{if(window.SND)SND.play(k,o||{v:.6})}catch(_){}};
// ---------- dummies ----------
const fighter=()=>has(DART.atk.punch)&&has(DART.atk.wind);
const K_=(d,k)=>{if(d.role!=='atk'||!fighter())return k;const a=DART.atk;return k===DART.idle?a.idle:(k===DART.heavy||k===DART.light)&&has(a.hit)?a.hit:k};
function mk(x,face,role){const d={sp:1,role,home:x,x,y:GROUND,vx:0,vy:0,fl:0,hp:40,max:40,hpShow:40,h:165,flash:0,sq:0,rot:0,alive:true,last:-1,calm:0,
 face,fs:face,st:'idle',t:0,ft:0,fi:0,anim:'sd',cool:99,stun:0,aggro:0,blend:0,bub:null,ps:'idle',pt:0,k:DART.idle,i:0,jug:0,nextAtk:2.2,cw:0,lean:0,ext:0};
 dummies.push(d);return d}
function clearSp(){for(let i=dummies.length-1;i>=0;i--)if(dummies[i].sp)dummies.splice(i,1)}
const live=()=>dummies.filter(d=>d.sp);
function go(d,ps,i){if(ps==='down'&&d.ps!=='down')d.downT=0;d.ps=ps;d.pt=0;d.i=i||0;d.i0=i||0;d.done=0;d.st=ps==='air'?'air':ps==='idle'?'idle':'hurt';d.t=0}
const pOK=()=>p.state!=='respawn'&&!CINE.includes(p.state)&&!document.body.classList.contains('ov')&&!document.body.classList.contains('fp')&&!document.body.classList.contains('st');
function upd(d,dt){d.t+=dt;d.pt+=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.stun-=dt;d.cw-=dt;d.hpShow+=(d.hp-d.hpShow)*Math.min(1,dt*5);if(d.bub){d.bub.l-=dt;if(d.bub.l<=0)d.bub=null}
 d.fs+=(d.face-d.fs)*Math.min(1,dt*12);
 const held=CINE.includes(p.state)&&p.grab===d,frozen=d.mfz>0||(typeof M14!=='undefined'&&M14.tstop>0);
 // same launch / float / gravity as every other target, so launchers and juggles feel identical to a real fight
 const dIdle=now-(d.lastHitT||-9);if(d.y<GROUND-25&&dIdle>.5&&d.fl>0&&!(p.state==='lkult'||CINE.includes(p.state)))d.fl=0;d.fl-=dt;
 d.vy+=(d.fl>0?420:dIdle>.9&&d.y<GROUND-25?2300:1700)*dt;if(d.fl>0)d.vx*=Math.pow(.3,dt);
 d.x+=d.vx*dt;d.y+=d.vy*dt;const lo=LW+50,hi=WALL_X-50;if(d.x<lo){d.x=lo;d.vx=Math.abs(d.vx)*.5}if(d.x>hi){d.x=hi;d.vx=-Math.abs(d.vx)*.5}if(d.y<-90000)d.y=-90000;
 let landed=false;if(d.y>=GROUND){d.y=GROUND;if(d.vy>350){landed=true;d.vy=Math.max(-300,d.vy*-.25);d.sq=.7;spark(d.x,GROUND,6,'#d9c49a',140)}else d.vy=0;d.vx*=Math.pow(.02,dt)}
 const air=d.y<GROUND-2||d.vy<-1;d.peak=Math.max(d.peak||0,GROUND-d.y);d.rot*=Math.pow(.001,dt);
 if(d.hp<=0){d.hp=d.max;d.hpShow=d.max;d.bub={t:'♥ REFILL',l:.9,c:'#7dff7a'};spark(d.x,d.y-120,10,['#7dff7a','#fff'],220)}   // never breaks
 d.alive=d.ps!=='rec';d.h=d.ps==='down'?70:165;
 if(held||frozen)return;
 const n=(k)=>sheet(k,d.face)[0].length||1,play=(k,fps,loop)=>{d.k=k;const f=Math.floor(d.pt*fps);d.i=loop?f%n(k):Math.min(n(k)-1,f);return f>=n(k)};
 const dx=p.x-d.x,adx=Math.abs(dx);
 switch(d.ps){
  case 'air':{const fallArt=has(DART.fall);
   if(landed||(!air&&d.pt>.1)){d.jug=0;const big=d.peak>70||landed;d.peak=0;d.vy=0;d.y=GROUND;
    if(!big){go(d,'heavy',2);break}
    if(fallArt){go(d,'land');d.k=DART.fall;d.i=3}else go(d,'down',3);break}
   if(d.vy<0)d.fallT=0;else d.fallT=(d.fallT||0)+dt;
   if(d.vy<-480){d.k=DART.launch;d.i=Math.min(3,2+Math.floor(d.pt*8))}else if(d.vy<0){d.k=DART.launch;d.i=Math.min(5,3+Math.floor(d.pt*6)%3)}
   else if(fallArt){d.k=DART.fall;d.i=Math.min(2,Math.floor(d.fallT*9))}      // launched_fall 1-3 down the arc (re-hit any time)
   else{d.k=DART.launch;d.i=3+Math.floor(d.pt*10)%3}break}
  case 'land':{d.k=DART.fall;d.i=3;if(d.pt>=1/DART.fps){   // launched_fall 4 (flat on its back) -> knockdown 5 with the +228px root hand-off toward Paddy
    d.x=Math.max(LW+50,Math.min(WALL_X-50,d.x+d.face*DART.fallShift*FSC()*SC));go(d,'down',4)}break}
  case 'down':{d.downT+=dt;d.k=DART.down;d.i=Math.min(5,d.i0+Math.floor(d.pt*DART.fps));if(d.pt>(6-d.i0)/DART.fps+.5){go(d,'rec');d.bub={t:'boing!',l:.7,c:'#fff'};snd('paddy_land',{v:.4,r:1.4})}break}
  case 'rec':if(play(DART.rec,DART.fps)){go(d,'idle')}break;
  case 'light':if(air&&d.vy<-250){go(d,'air');break}if(play(K_(d,DART.light),DART.fps))go(d,'idle');break;
  case 'heavy':if(air&&d.vy<-250){go(d,'air');break}if(play(K_(d,DART.heavy),DART.fps,0)&&d.pt>.5)go(d,'idle');break;
  case 'wind':{d.lean=Math.min(1,d.pt/WIND);
   if(fighter()){d.lean=0;d.k=DART.atk.wind;d.i=Math.min(n(DART.atk.wind)-1,Math.floor(d.pt*DART.fps))}   // 4 frames, then hold the cocked f4 = the tell
   else{d.k=DART.idle;d.i=0;d.ext=-.15*d.lean+Math.sin(d.pt*40)*.03*d.lean}
   if(d.pt>=WIND){go(d,'punch');snd('bruno_punch',{v:.55,r:1.25})}break}
  case 'punch':{const t=d.pt;
   if(fighter()){const a=DART.atk,nn=n(a.punch);d.k=a.punch;d.i=Math.min(nn-1,Math.floor(t*DART.fps));if(d.i>=a.hitWin[0]&&d.i<=a.hitWin[1]&&!d.done)strike(d);if(t>=nn/DART.fps){go(d,'arec')}}
   else{d.ext=t<.1?t/.1:t<.2?1:Math.max(0,1-(t-.2)/.12);d.lean=t<.1?1-t/.1*2:-1+Math.min(1,(t-.1)/.22);d.x+=d.face*(t<.1?160:-90)*dt;d.k=DART.rec;d.i=2;
    if(t>=.09&&!d.done)strike(d);if(t>=.32){go(d,'arec');d.ext=0}}break}
  case 'arec':{d.lean*=Math.pow(.001,dt);if(fighter()){if(play(DART.atk.rec,DART.fps)){go(d,'idle');d.nextAtk=2+Math.random()*1.3}}
   else{play(DART.idle,DART.idleFps,1);if(d.pt>=.5){go(d,'idle');d.nextAtk=2+Math.random()*1.3}}break}
  default:{d.lean*=Math.pow(.001,dt);d.ext=0;play(K_(d,DART.idle),DART.idleFps,1);if(adx>30&&pOK())d.face=dx>0?1:-1;
   if(Math.abs(d.vx)<40){const h=d.home-d.x;if(Math.abs(h)>4)d.x+=Math.sign(h)*Math.min(Math.abs(h),150*dt)}
   if(d.role==='atk'&&pOK()&&p.state!=='hurt'){d.nextAtk-=dt;if(d.nextAtk<=0&&adx<430){go(d,'wind');d.face=dx>0?1:-1;d.threat=adx<GR+110;d.bub={t:'!',l:WIND,c:'#ff4040'};snd('mecha_servo',{v:.45,r:1.5})}}}}
}
// ---------- the spar punch: DODGED / BLOCKED / COUNTER / BONK ----------
function strike(d){d.done=1;const rel=(p.x-d.x)*d.face,inRange=rel>-30&&rel<(fighter()?DART.atk.reach*FSC()*SC+62:GR+100),low=p.y>GROUND-110;d.countered=0;
 const b0=PR.s.blocked,c0=PR.s.counter;
 const dodging=(p.state==='kdodge'||(p.state==='nj'&&window.NJ&&NJ.k==='dodge')||(p.state==='kt'&&window.KY&&KY.k==='dodge')||(p.state==='sm'&&window.SM7&&SM7.k==='dodge')||(p.state==='kg'&&window.KN8&&KN8.k==='dodge'))&&p.t<.22&&d.threat;   // a dodge right as it lands is a COUNTER even if the dash already cleared the reach
 if(((inRange&&low)||dodging)&&dogStrike(d,0,'punch')){if(PR.s.counter>c0){d.countered=1}else if(PR.s.blocked>b0){d.cw=1.2}
  else{snd('paddy_hurt_meow',{v:.5,gap:.4})}}
 else if(d.threat){PR.s.dodged++;d.cw=1.2;_say('DODGED!','#bfe8ff',true);snd('paddy_dash',{v:.5,r:1.2});spark(p.x,p.y-80,10,['#bfe8ff','#fff'],240)}
 shake=Math.max(shake,3)}
// ---------- hooks ----------
const _upd=updDog;updDog=function(d,dt){if(d.sp)return upd(d,dt);return _upd(d,dt)};
const _dh=dogHit;dogHit=function(d,move,air){if(!d.sp)return _dh(d,move,air);d.hitT=now;d.bub=d.bub&&d.bub.t==='!'?d.bub:null;
 if(d.ps==='wind'||d.ps==='punch'){d.arm=1;return}            // armoured while attacking: you have to defend, not mash
 if(d.ps==='rec')return;
 const k=KB[move]||KB.claw1;if(d.role==='atk'&&fighter()){go(d,'heavy');return}if(air||d.vy<-250){if(d.ps!=='air')go(d,'air');return}
 if(d.ps==='down'){if(d.downT<2.2){d.pt=Math.min(d.pt,(5-d.i0)/DART.fps);d.vy=-140}return}   // OTG bounce, but it always gets up
 const heavy=k[3]>=.07||Math.abs(k[0])>=300||k[1]<-350;if(heavy&&Math.abs(d.vx)>=560)go(d,'down',0);else go(d,heavy?'heavy':'light')};
const _ko=startKO;startKO=function(d){if(d.sp){d.hp=d.max;return}return _ko(d)};
const _hd=hitDummy;hitDummy=function(d,move,dir){if(!d||!d.sp||!PR.on)return _hd.apply(this,arguments);
 const wasAir=d.y<GROUND-25,r=_hd.apply(this,arguments);
 if(d.role==='atk'&&fighter()){d.fl=0;if(d.vy<0)d.vy=Math.max(d.vy,-60);d.vx=Math.max(-260,Math.min(260,d.vx))}   // the fighter stays on its spring
 if(d.arm){d.arm=0;d.vx=0;if(d.y>=GROUND-1)d.vy=0;d.fl=0;d.flash=.12;d.bub={t:'!',l:Math.max(.3,WIND-d.pt),c:'#ff4040'}}
 if(d.role==='launch'&&d.y<GROUND-25)d.vx*=.4;   // juggle station: keep it over Paddy instead of carrying it into the wall
 const S=PR.s;S.hits++;S.best=Math.max(S.best,C.n);
 if(wasAir){d.jug++;if(d.jug>=2){S.jug=Math.max(S.jug,d.jug);d.bub={t:'JUGGLE ×'+d.jug,l:.8,c:'#7fffd4'}}}
 else if(d.vy<-450&&!d.launchT){S.launches++;d.launchT=1;d.bub={t:'LAUNCH!',l:.8,c:'#ffe14d'};setTimeout(()=>{d.launchT=0},400)}
 if(PR.lastD&&PR.lastD!==d&&C.n>=2&&now-PR.lastT<1.4&&Math.sign(d.x-p.x)!==Math.sign(PR.lastD.x-p.x)){S.turns++;d.bub={t:'TURN! ×'+S.turns,l:.8,c:'#9fe8ff'}}
 PR.lastD=d;PR.lastT=now;
 if(d.role==='atk'&&d.cw>0&&!d.countered){d.countered=1;d.cw=0;say('COUNTER!','#7fffd4',true);snd('combo_stinger_5',{v:.6,gap:.3})}
 return r};
// count BLOCKED!/COUNTER! from every form's own defence (kitty guard/dodge-counter, samurai & knight parries)
const _say=say;say=function(t){if(PR.on){if(t==='BLOCKED!')PR.s.blocked++;else if(t==='COUNTER!'){if(now-(PR.cT||-9)<.7)return _say.apply(this,arguments);PR.cT=now;PR.s.counter++;for(const d of live())if(d.role==='atk'){d.countered=1;d.cw=0}}else if(t==='DODGE!')return}return _say.apply(this,arguments)};
const _dd=drawDummies;drawDummies=function(){const all=dummies.slice();if(!all.some(d=>d.sp))return _dd();const keep=all.filter(d=>!d.sp);dummies.length=0;dummies.push(...keep);
 try{_dd()}finally{dummies.length=0;dummies.push(...all)}for(const d of all)if(d.sp)drawD(d)};
if(typeof r12Takedown==='function'){const _tk=r12Takedown;r12Takedown=function(){if(PR.on)return false;return _tk.apply(this,arguments)}}
const _hud=r12HUD;r12HUD=function(){const r=_hud.apply(this,arguments);if(PR.on)try{panel()}catch(e){console.warn('pr panel',e)}return r};
const _ud=updDummies;updDummies=function(dt){_ud(dt);if(PR.on){PR.hintT+=dt;if(p.hp<PR.hp0)p.hp=PR.hp0}};
// ---------- drawing ----------
function frame(d){const [L,mir]=sheet(d.k,d.face);let f=L[Math.min(d.i,L.length-1)];if(!f||!imgOK(IMG[f.f])){const I=sheet(DART.idle,d.face);f=I[0].find(q=>imgOK(IMG[q.f]));return f?[f,I[1]]:[null,mir]}return [f,mir]}
function glove(d,e){const bx=d.x+d.face*26,by=d.y-104,gx=bx+d.face*(8+Math.max(0,e)*GR),n=7;ctx.save();
 ctx.lineWidth=5;ctx.strokeStyle='#8a8f99';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bx,by);for(let i=1;i<=n;i++){const x=bx+(gx-bx)*i/n,y=by+(i%2?-7:7)*(i<n?1:0);ctx.lineTo(x,y)}ctx.stroke();
 ctx.lineWidth=2;ctx.strokeStyle='#d7dbe3';ctx.stroke();
 ctx.translate(gx,by);ctx.scale(d.face,1);ctx.fillStyle='#f2ead8';ctx.strokeStyle='#5a1a14';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(-4,0,7,15,0,0,6.283);ctx.fill();ctx.stroke();
 const g=ctx.createRadialGradient(10,-6,3,12,0,24);g.addColorStop(0,'#ff6a5a');g.addColorStop(1,'#b81c1c');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(14,0,20,17,0,0,6.283);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.ellipse(8,-12,9,7,-.4,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff8';ctx.beginPath();ctx.ellipse(18,-7,6,3,-.5,0,6.283);ctx.fill();ctx.restore()}
function drawD(d){const hg=Math.max(0,GROUND-d.y);ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(d.x+(d.ps==='down'?-d.face*40:0),GROUND+3,(d.ps==='down'?110:62)*Math.max(.35,1-hg/500),11,0,0,6.28);ctx.fill();
 const atkArt=fighter(),gl=!atkArt&&(d.ps==='wind'||d.ps==='punch');
 if(d.ps==='wind'){const u=Math.sin(now*22)*.5+.5,gx=d.x+d.face*40,gy=d.y-104;ctx.save();const g=ctx.createRadialGradient(gx,gy,4,gx,gy,90+u*20);
  g.addColorStop(0,`rgba(255,40,30,${.4+.3*u})`);g.addColorStop(.6,`rgba(255,60,40,${.16+.1*u})`);g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,115,0,6.283);ctx.fill();
  const r=18+80*(1-d.pt/WIND);ctx.lineWidth=4;ctx.strokeStyle=`rgba(255,255,255,${.5+.5*d.pt/WIND})`;ctx.beginPath();ctx.arc(d.x+d.face*(atkArt?DART.atk.reach*FSC()*SC*.85:26+GR*.75),gy,r,0,6.283);ctx.stroke();ctx.restore()}
 const [f,mir]=frame(d);if(f){const im=IMG[f.f];ctx.save();const air=d.ps==='air'&&d.y<GROUND-2;ctx.translate(d.x,d.y+(air?(f.lf||0)*SC:0));
  ctx.rotate(d.rot+(-d.face*d.lean*.2));const s=1+d.sq*.12+(d.ps==='wind'?d.lean*.06:0);ctx.scale((mir?-1:1)*SC/s,SC*s);ctx.drawImage(im,-f.ax,-f.ay);
  if(d.flash>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,d.flash/.12)*.5;ctx.drawImage(im,-f.ax,-f.ay)}ctx.restore()}
 if(gl)glove(d,d.ext);
 if(d.hpShow<d.max-.01&&d.ps!=='down'){const w=70,y=d.y-190;ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(d.x-w/2-2,y-2,w+4,8);ctx.fillStyle='#ffb347';ctx.fillRect(d.x-w/2,y,w*Math.max(0,d.hpShow)/d.max,4);ctx.fillStyle='#7dff7a';ctx.fillRect(d.x-w/2,y,w*Math.max(0,d.hp)/d.max,4)}
 if(d.bub){const b=d.bub,a=Math.min(1,b.l*3),big=b.t.length<=2,pop=big?1+.15*Math.sin(now*20):1;fancy(b.t,d.x+(big?d.face*30:0),d.y-(d.ps==='down'?100:big?215:225),big?46:24,0,pop,a,b.c)}}
const ST={spar:['🥊','SPAR','it hits back — defend, then punish'],turn:['↔','TURN','one in front, one behind'],launch:['🚀','LAUNCH','launch it, then juggle']};
function hints(){const nin=FORM()===1||FORM()===2||FORM()===3,base=FORM()===0||nin,kb=!document.body.classList.contains('touchy');
 if(PR.st==='spar')return [`Red glow + closing ring = punch coming!`,base?(kb?'DODGE: O · BLOCK: hold B':'DODGE: tap 🛡 · BLOCK: hold 🛡'):'Jump over it, dash or Blink away',base?(nin?'Block/dodge right as it lands = COUNTER (or Claw while blocking)':'Dodge/block right as it lands = COUNTER'):'Samurai & Knight: parry it',`Hit back straight after = COUNTER!`];
 if(PR.st==='turn')return ['Start a combo on one dummy…',kb?'…tap ← / → mid-combo to turn round':'…tap ◀ / ▶ mid-combo to turn round','Keep the chain going on both sides'];
 if(FORM()===3)return ['Launch: ↑+Claw (Shield Launcher)','then Claw ×3 in the air: air slash, shield bash, plunge','Charge Step in the air closes the gap · every air hit = JUGGLE ×n'];
 if(FORM()===2)return ['Launch: ↑+Claw (Rising Cut)','then Claw ×3 in the air: yokogiri, kiriage, kabuto-wari','Flash Step in the air closes the gap · every air hit = JUGGLE ×n'];
 if(FORM()===0&&window.KITTY36&&KITTY36.on)return ['Launch: ↑+Claw (Rocket Leap)','then Claw ×3 in the air: air swat, bunny kick, dive spike','Zoomies in the air closes the gap · every air hit = JUGGLE ×n'];
 if(nin)return ['Launch: ↑+Claw (Rising Launcher)','then Claw ×3 in the air: palm, side kick, axe spike','Blink in the air closes the gap · every air hit = JUGGLE ×n'];
 return [base?'Launch: ↑+Claw (Sky Swipe), power build':'Launch: Uppercut / launcher moves','Jump after it and keep hitting','Every air hit = JUGGLE ×n'];}
function panel(){const S=PR.s,st=ST[PR.st],full=PR.hintT<9||S.hits===0,H=hints(),x=14,y=80,w=322,lh=19;
 const stat=PR.st==='spar'?`DODGED ${S.dodged} · BLOCKED ${S.blocked} · COUNTER ${S.counter}`:PR.st==='turn'?`TURNS ${S.turns}`:`LAUNCHES ${S.launches} · BEST JUGGLE ${S.jug}`;
 const rows=(full?H.length:0)+3,h=12+rows*lh;ctx.save();ctx.globalAlpha=.9;ctx.fillStyle='rgba(12,10,34,.62)';ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,12):ctx.rect(x,y,w,h);ctx.fill();ctx.globalAlpha=1;
 ctx.textBaseline='middle';ctx.textAlign='left';ctx.font=`18px ${FONT}`;ctx.fillStyle='#ffe14d';ctx.fillText(`${st[0]} ${st[1]} — ${st[2]}`,x+10,y+6+lh/2);let yy=y+6+lh*1.5;
 ctx.font='600 14px system-ui,sans-serif';if(full)for(const l of H){ctx.fillStyle='#e8f0ff';ctx.fillText('• '+l,x+12,yy);yy+=lh}
 ctx.font=`17px ${FONT}`;ctx.fillStyle='#fff';ctx.fillText(`HITS ${S.hits}   BEST COMBO ${S.best}   NOW ×${C.n}`,x+10,yy);yy+=lh;ctx.fillStyle='#9fe8ff';ctx.fillText(stat,x+10,yy);ctx.restore()}
// ---------- room ----------
const css=document.createElement('style');css.textContent=`
#prbar{position:fixed;left:50%;transform:translateX(-50%);top:max(6px,env(safe-area-inset-top));z-index:3;display:none;gap:6px;align-items:center}
body.proom #prbar{display:flex}body.proom #lbl,body.proom #trbar{display:none!important}
#prbar .tap{font:calc(clamp(13px,3.9vh,19px)*var(--prs,1)) Bangers,Impact,sans-serif;letter-spacing:1px;color:#fff;border:2px solid #fff9;border-radius:999px;padding:.32em .7em;background:#2a3f78e6;white-space:nowrap;cursor:pointer;min-height:36px}
#prbar .tap.i{padding:.32em .6em}#prbar .tap.cur{background:linear-gradient(#ffcf4a,#ff8a1a);border-color:#fff;text-shadow:0 2px 0 #9a3c00}
#prbar .nm{font:clamp(13px,3.8vh,18px) Bangers,Impact,sans-serif;color:#ffe14d;text-shadow:0 2px 0 #000a;letter-spacing:1px}
@media (max-width:1000px){#prbar .nm{display:none}}
#mprac{display:block;margin:6px 0 4px;font:18px Bangers,Impact,sans-serif;letter-spacing:1px;color:#fff;background:linear-gradient(#ffcf4a,#ff8a1a);border:0;border-radius:999px;padding:8px 18px;min-height:44px;cursor:pointer;text-shadow:0 2px 0 #9a3c00}`;
document.head.appendChild(css);
const bar=document.createElement('div');bar.id='prbar';
bar.innerHTML='<span class="nm">🥊 PRACTICE ROOM</span>'+Object.keys(ST).map(k=>`<button class="tap" data-st="${k}">${ST[k][0]} ${ST[k][1]}</button>`).join('')+
 '<button class="tap i" id="prreset" title="reset counters (I)">↺</button><button class="tap i" id="prforms" title="change form">🔄</button><button class="tap i" id="prmoves" title="move list">📜</button><button class="tap i" id="prexit" title="exit">✕</button>';
document.body.appendChild(bar);
// shrink the bar until it clears the gear (left) and the sound / form / help buttons (right) on small phones
function fit(){if(!document.body.classList.contains('proom'))return;let s=1;bar.style.setProperty('--prs',1);
 const others=()=>[...document.querySelectorAll('#ui .b.t,#gear,#mute,#qbtn,#ui .b.s')].map(e=>e.getBoundingClientRect()).filter(q=>q.width>0&&q.top<60);
 for(let k=0;k<8;k++){const b=bar.getBoundingClientRect();if(!others().some(q=>q.left<b.right+2&&q.right>b.left-2&&q.top<b.bottom))break;s-=.07;bar.style.setProperty('--prs',s);bar.style.gap=Math.round(6*s)+'px'}}
addEventListener('resize',()=>setTimeout(fit,60));
const tap=(el,fn)=>el.addEventListener('click',e=>{e.preventDefault();el.blur();fn()});
bar.querySelectorAll('[data-st]').forEach(b=>tap(b,()=>station(b.dataset.st)));
tap(bar.querySelector('#prreset'),resetStats);tap(bar.querySelector('#prforms'),()=>window.TRAIN&&TRAIN.picker());tap(bar.querySelector('#prmoves'),()=>window.TRAIN&&TRAIN.moves());tap(bar.querySelector('#prexit'),close);
function bench(on){const b=dummies.find(d=>!d.cr&&!d.sp);if(!b)return;if(on){b.benched=true;b.alive=false;b.bub=null}else if(b.benched){b.benched=false;b.alive=true;b.hp=b.max;b.hpShow=b.max;b.x=b.home;b.y=GROUND;b.vx=b.vy=0;dSet(b,'idle','r_idle');b.cool=2}}
function preload(){if(!window.queueFrames||!F)return;const L=[];for(const k in F)if(k.startsWith('sd_'))F[k].forEach(f=>L.push(f.f));queueFrames(L,true)}
function station(st){if(!ST[st])st='spar';PR.st=st;PR.hintT=0;PR.lastD=null;clearSp();
 if(!CINE.includes(p.state)){p.state='normal';p.t=0;p.combo=0;p.vx=p.vy=0;p.y=GROUND;p.ground=true}
 p.x=st==='turn'?VW/2:VW/2-110;p.face=1;
 if(st==='spar')mk(p.x+140,-1,'atk');else if(st==='turn'){mk(p.x-175,1,'back');mk(p.x+175,-1,'front')}else mk(p.x+165,-1,'launch');
 bar.querySelectorAll('[data-st]').forEach(b=>b.classList.toggle('cur',b.dataset.st===st));snd('ui_tap',{v:.5})}
function resetStats(){PR.s=zero();PR.hintT=0;if(typeof C!=='undefined'){C.n=0;C.t=0;C.best=0}for(const d of live()){d.hp=d.max;d.hpShow=d.max;d.x=d.home;d.y=GROUND;d.vx=d.vy=0;go(d,'idle');d.nextAtk=2.2}snd('ui_select',{v:.5});_say('RESET!','#ffe14d')}
function open(st){if(window.TRAIN&&TRAIN.TR.on){TRAIN.TR.on=false;document.body.classList.remove('train');for(let i=dummies.length-1;i>=0;i--)if(dummies[i].train)dummies.splice(i,1)}
 if(window.ENW){if(ENW.W.on)ENW.W.on=false;for(let i=dummies.length-1;i>=0;i--)if(dummies[i].cr)dummies.splice(i,1);ENW.shots.length=0;ENW.kids.length=0}
 if(window.STORY&&STORY.mode&&STORY.mode!=='off'){window.STORYPAUSE=false;STORY.mode='off';document.body.classList.remove('story');try{last=performance.now()}catch(_){}}
 if(window.UNLx){UNLx.d.tryAll=true;UNLx.d.tryMyth=true}
 bench(true);PR.on=true;PR.hp0=Math.max(3,p.hp||3);p.hp=PR.hp0;document.body.classList.add('proom');setTimeout(fit,30);preload();PR.s=zero();station(st||PR.st);
 card('🥊 PRACTICE ROOM','dummies never break — pick a station up top','#ffe14d')}
function close(){PR.on=false;clearSp();document.body.classList.remove('proom');bench(false);if(window.STORY&&STORY.title)STORY.title()}
Object.assign(PR,{open,close,station,reset:resetStats,DART,dummies:live,sheet,hints});
addEventListener('keydown',e=>{if(!PR.on||e.repeat||document.body.classList.contains('ov')||document.body.classList.contains('fp')||document.body.classList.contains('st'))return;
 if(e.code==='KeyU'){e.preventDefault();const k=Object.keys(ST);station(k[(k.indexOf(PR.st)+1)%k.length])}else if(e.code==='KeyI'){e.preventDefault();resetStats()}});
// combo list menu entry (next to the old Training Room button)
(function(){const h=document.querySelector('#moves .box h2');if(!h||document.getElementById('mprac'))return;const b=document.createElement('button');b.id='mprac';b.textContent='🥊 PRACTICE ROOM — spar, turn & juggle with any form';
 b.addEventListener('click',e=>{e.preventDefault();if(typeof ov==='function')ov(false);open()});h.after(b)})();
// title screen: one extra button (PLAY, PRACTICE/Training Room and the levels are unchanged)
(function(){const bt=document.getElementById('sbtns');if(!bt||document.getElementById('sproom'))return;const row=document.createElement('div');row.className='row';
 row.innerHTML='<button class="sbtn alt" id="sproom" style="background:linear-gradient(#ffcf4a,#ff8a1a);box-shadow:0 .18em 0 #9a3c00,0 .4em .9em #0006;text-shadow:0 2px 0 #9a3c00">🥊 PRACTICE ROOM</button>';
 const tip=document.getElementById('stip');tip?bt.insertBefore(row,tip):bt.appendChild(row);
 row.querySelector('button').addEventListener('click',e=>{e.preventDefault();const sr=document.getElementById('story');if(sr)sr.classList.remove('intro');open()})})();
// deep link: ?practice or ?practice=turn|launch|spar
const q=new URLSearchParams(location.search);if(q.has('practice')){const go2=()=>{if(typeof started!=='undefined'&&started&&F&&F.sd_idle)open(q.get('practice')||'spar');else setTimeout(go2,300)};go2()}
})();
