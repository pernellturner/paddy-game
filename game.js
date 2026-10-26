// Paddy move test – plain canvas
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),lbl=document.getElementById('lbl');
const VW=960,VH=540,GROUND=470,WALL_X=880,WT=230,SC=0.8; // world units
let F={},IMG={};
let scale=1,offX=0,offY=0;
function resize(){const d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;
 scale=Math.min(cv.width/VW,cv.height/VH);offX=(cv.width-VW*scale)/2;offY=(cv.height-VH*scale)/2;}
addEventListener('resize',resize);resize();
['gesturestart','dblclick','contextmenu'].forEach(e=>document.addEventListener(e,ev=>ev.preventDefault()));
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
// input
const K={left:0,right:0,down:0,jump:0,attack:0,special:0,run:0},P={};
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',
 Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyX:'attack',KeyJ:'attack',KeyC:'special',KeyK:'special',KeyQ:'hunt',KeyV:'hunt',ShiftLeft:'run',ShiftRight:'run'};
addEventListener('keydown',e=>{const k=map[e.code];if(!k)return;e.preventDefault();if(!K[k]&&!e.repeat){P[k]=1;tapDir(k)}K[k]=1});
addEventListener('keyup',e=>{const k=map[e.code];if(k)K[k]=0});
document.querySelectorAll('.b').forEach(b=>{const k=b.dataset.k;
 const on=e=>{e.preventDefault();if(!K[k]){P[k]=1;tapDir(k)}K[k]=1;b.classList.add('on')},off=e=>{e.preventDefault();K[k]=0;b.classList.remove('on')};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});
// player
const p={x:300,y:GROUND,vx:0,vy:0,face:1,ground:true,state:'normal',t:0,anim:'idle',fi:0,ft:0,combo:0,queued:false,cool:0,inv:0,wall:false,jumps:0,dashCool:0,airDash:false,hunt:false,lastDash:-9,airSpin:false,airSwipe:false};
const waves=[],shots=[],sparks=[],ghosts=[],texts=[];let shake=0;
const lastTap={left:-9,right:-9};let now=0;
function tapDir(k){if(k!=='left'&&k!=='right')return;if(now-lastTap[k]<0.28){P.dash=k;lastTap[k]=-9}else lastTap[k]=now}
function say(t,c,big){texts.length=0;texts.push({t,c:c||'#fff',l:1,rot:(Math.random()-.5)*.18,big:!!big})}
function setAnim(a){if(p.anim!==a){p.anim=a;p.fi=0;p.ft=0}}
const FPS={idle:3,walk:11,run:12,jump:8,fall:6,land:10,crouch:4,claw1:1,claw2:1,claw3:12,charge:1,blast:1,hurt:1,climb:8,dash:1,roar:1,lie:1,dashstrike:1,airswipe:1,airspin:14,dive:1,diveclaw:1,stalk:4,pounce:1,wingdash:1};
const floorAt=x=>(x>WALL_X-20&&x<WALL_X+100)?WT:GROUND;
function startClaw(){p.combo++;p.state='claw';p.t=0;setAnim('claw'+p.combo);p.queued=false;
 p.vx=p.face*(p.combo===3?260:140);shake=p.combo===3?6:3;if(p.combo===3)say('TRIPLE CLAW!','#bfe8ff');
 for(let i=0;i<6;i++)sparks.push({x:p.x+p.face*70,y:p.y-70,vx:p.face*(100+Math.random()*200),vy:-Math.random()*200,l:.35,c:'#bfe8ff'});}
function dashStrike(){p.state='dashstrike';p.t=0;setAnim('dashstrike');p.vx=p.face*1150;if(!p.ground)p.vy=-120;say('DASH STRIKE!','#ff9fd0');shake=9;
 for(let i=0;i<14;i++)sparks.push({x:p.x+p.face*80,y:p.y-60+(Math.random()-.5)*60,vx:p.face*(300+Math.random()*400),vy:(Math.random()-.5)*200,l:.4,c:i%2?'#fff':'#ffb0e0'})}
function impact(big){areaHit(p.x,p.y,big?190:130,big?'dive':'diveclaw');shake=big?16:10;waves.push({x:p.x,y:p.y,r:10,l:1,big});for(let i=0;i<(big?26:14);i++)sparks.push({x:p.x+(Math.random()-.5)*60,y:p.y,vx:(Math.random()-.5)*(big?700:400),vy:-Math.random()*300,l:.5,c:i%3?'#d9c49a':'#fff'})}
function doDash(dir){p.face=dir==='right'?1:-1;p.wall=false;p.t=0;p.dashCool=.45;
 if(!p.ground&&p.jumps>=2&&!p.airDash){p.airDash=true;p.state='wingdash';setAnim('wingdash');p.vx=p.face*1000;p.vy=-60;say('WINGED DASH!','#8fe0ff');shake=6}
 else{p.state='dash';setAnim(p.ground?'run':'dash');p.vx=p.face*900;if(!p.ground)p.vy=Math.min(p.vy,0);say('DASH!');shake=3}}
function update(dt){
 now+=dt;p.t+=dt;p.cool-=dt;p.inv-=dt;p.dashCool-=dt;
 if(P.hunt){p.hunt=!p.hunt;say(p.hunt?'HUNT MODE':'hunt off','#ffe08a');document.querySelector('[data-k=hunt]').classList.toggle('lit',p.hunt)}
 if(P.dash&&p.dashCool<=0&&['normal','land'].includes(p.state)&&!(p.hunt&&p.ground))doDash(P.dash);
 switch(p.state){
 case 'claw': if(P.attack&&p.combo<3)p.queued=true; p.vx*=0.88;
  if(p.t>(p.combo===3?.42:.26)){ if(p.queued)startClaw(); else{p.state='normal';p.combo=0;} } break;
 case 'charge': p.vx=0;if(p.t>.45){p.state='blast';p.t=0;setAnim('blast');shots.push({x:p.x+p.face*120,y:p.y-62,vx:p.face*620,l:1.6,a:0,hit:new Set()});shake=8;} break;
 case 'blast': p.vx=-p.face*40; if(p.t>.4){p.state='normal';p.cool=.3}break;
 case 'hurt': if(p.t>.6&&p.ground)p.state='normal';break;
 case 'land': p.vx*=.8;if(p.t>.12)p.state='normal';break;
 case 'dash': if(p.ground){p.vy=0}else p.vy=Math.min(p.vy,120);
  if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:(F[p.anim]||F.idle)[p.fi],face:p.face,l:.25,c:'rgba(255,255,255,'});
  if(P.attack){dashStrike();break}
  if(p.t>.22){p.state='normal';p.vx=p.face*300;p.lastDash=now} break;
 case 'wingdash': p.vy=-30;
  if(p.t%0.025<dt){ghosts.push({x:p.x,y:p.y,f:F.wingdash[0],face:p.face,l:.3,blue:1});for(let i=0;i<3;i++)sparks.push({x:p.x-p.face*60,y:p.y-60+(Math.random()-.5)*50,vx:-p.face*200,vy:(Math.random()-.5)*80,l:.4,c:i?'#5cc8ff':'#fff'})}
  if(p.t>.38){p.state='normal';p.vx=p.face*350} break;
 case 'dashstrike': p.vx*=Math.pow(.06,dt); if(!p.ground)p.vy=Math.min(p.vy,200);
  if(p.t%0.025<dt)ghosts.push({x:p.x,y:p.y,f:F.dashstrike[0],face:p.face,l:.28,blue:1});
  if(p.t>.38){p.state='normal'} break;
 case 'airswipe': p.vy=Math.min(p.vy,150); if(p.t>.3)p.state='normal'; if(p.ground&&p.t>.05)p.state='normal'; break;
 case 'airspin': p.vy=p.t<.45?-30:p.vy; p.vx*=.97; if(p.t%0.04<dt)ghosts.push({x:p.x,y:p.y,f:F.airspin[p.fi],face:p.face,l:.2,blue:1});
  if(p.t%0.06<dt)sparks.push({x:p.x+Math.cos(p.t*20)*70,y:p.y-60+Math.sin(p.t*20)*50,vx:0,vy:0,l:.3,c:'#5cc8ff'});
  if(p.t>.6||p.ground)p.state='normal'; break;
 case 'dive': p.vx=0;p.vy=1400; if(P.attack||K.left||K.right){p.state='diveclaw';p.t=0;setAnim('diveclaw');p.face=K.left?-1:K.right?1:p.face;p.vx=p.face*650;p.vy=950;say('DIVE CLAW!','#ffb070')}
  else if(p.ground){impact(true);p.state='land';p.t=0;setAnim('land')} if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:F.dive[0],face:p.face,l:.2}); break;
 case 'diveclaw': p.vx=p.face*650;p.vy=950; if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:F.diveclaw[0],face:p.face,l:.25,blue:1});
  if(p.ground){impact(false);burst(p.x+p.face*50,p.y-20);p.state='land';p.t=0;setAnim('land');p.vx=p.face*200} break;
 case 'pounce': p.fi=p.vy<0?0:1; if(p.ground&&p.t>.1){p.state='land';p.t=0;setAnim('land');shake=7;burst(p.x+p.face*60,p.y-10)} break;
 }
 if(p.state==='normal'){
  const run=K.run?1.6:1,dir=(K.right?1:0)-(K.left?1:0),spd=p.hunt?110:260*run;
  if(K.down&&p.ground&&!p.hunt){p.vx*=.7;setAnim('crouch');}
  else{p.vx+=(dir*spd-p.vx)*Math.min(1,dt*10);if(dir&&!p.wall)p.face=dir;}
  // wall climb: hold → to climb, release to cling, ← / jump to leap off, ↓ to drop
  if(!p.wall&&p.y>WT+10&&p.x>=WALL_X-62&&K.right&&!K.down&&!p.hunt){p.wall=true;p.jumps=0;p.airDash=false;say('CLIMB!','#ffe08a')}
  if(p.wall){p.face=1;p.vx=0;
   if(K.down){p.wall=false}
   else if(P.jump||K.left){p.wall=false;p.vy=-650;p.vx=-340;p.face=-1;p.jumps=1;say('WALL JUMP!');extend('WALL JUMP!')}
   else{p.vy=K.right?-190:35;
    if(p.y<WT+18){p.wall=false;p.y=WT;p.vy=-250;p.x=WALL_X+10;p.vx=120;say('MADE IT!','#ffe08a')}}}
  else if(P.jump&&p.ground){p.vy=p.hunt?-560:-720;p.ground=false;p.jumps=1;}
  else if(P.jump&&!p.ground&&p.jumps<2){p.vy=-650;p.jumps=2;say('DOUBLE JUMP!');extend();for(let i=0;i<10;i++)sparks.push({x:p.x+(Math.random()-.5)*50,y:p.y,vx:(Math.random()-.5)*200,vy:Math.random()*150,l:.4,c:'#fff'})}
  if(!p.ground&&!p.wall&&P.down){ if(K.left||K.right){p.face=K.left?-1:1;p.state='diveclaw';p.t=0;setAnim('diveclaw');say('DIVE CLAW!','#ffb070')} else {p.state='dive';p.t=0;setAnim('dive');p.face=p.face;say('DIVE BOMB!','#ffd070')} }
  else if(P.attack&&!p.wall&&p.ground&&now-p.lastDash<.2&&!p.hunt)dashStrike();
  else if(P.attack&&!p.ground&&!p.wall&&p.state==='normal'){ if(p.jumps>=2&&!p.airSpin){p.airSpin=true;p.state='airspin';p.t=0;setAnim('airspin');p.vy=-200;say('AIR SPIN!','#8fe0ff');shake=5}
   else if(!p.airSwipe){p.airSwipe=true;p.state='airswipe';p.t=0;setAnim('airswipe');p.vy=Math.min(p.vy,-120);p.vx=p.face*Math.max(Math.abs(p.vx),280);say('AIR SWIPE!','#bfe8ff');for(let i=0;i<8;i++)sparks.push({x:p.x+p.face*70,y:p.y-60,vx:p.face*(150+Math.random()*250),vy:(Math.random()-.5)*200,l:.35,c:'#bfe8ff'})} }
  else if(P.attack&&p.cool<=0&&!p.wall){ if(p.hunt&&p.ground){p.state='pounce';p.t=0;setAnim('pounce');p.vy=-520;p.vx=p.face*560;p.ground=false;say('POUNCE!','#ffb070')} else {p.combo=0;startClaw()} }
  else if(P.special&&p.cool<=0&&!p.wall){p.state='charge';p.t=0;setAnim('charge');p.vx=0}
  if(p.state==='normal'){
   if(p.wall)setAnim('climb');
   else if(!p.ground)setAnim(p.vy<0?'jump':'fall');
   else if(p.hunt)setAnim('stalk');
   else if(!K.down)setAnim(Math.abs(p.vx)>300?'run':Math.abs(p.vx)>25?'walk':'idle');
  }
 }
 if(P.hurtTest){comboEnd(true);p.state='hurt';p.t=0;setAnim('hurt');p.vy=-400;p.vx=-p.face*200;p.ground=false;p.wall=false}
 // physics
 if(!p.wall&&!['wingdash','dive','diveclaw'].includes(p.state))p.vy+=(p.state==='airspin'?600:1900)*dt; p.x+=p.vx*dt;p.y+=p.vy*dt;
 if(p.y>WT+2&&p.x>WALL_X-60&&p.x<WALL_X+60)p.x=WALL_X-60; // wall side
 const fl=floorAt(p.x);
 if(p.y>=fl&&p.vy>=0){p.y=fl;if(!p.ground&&p.vy>300&&p.state==='normal'){p.state='land';p.t=0;setAnim('land');for(let i=0;i<8;i++)sparks.push({x:p.x+(Math.random()-.5)*80,y:fl,vx:(Math.random()-.5)*200,vy:-Math.random()*120,l:.4,c:'#d9c49a'})}p.vy=0;p.ground=true;p.jumps=0;p.airDash=false;p.airSpin=false;p.airSwipe=false;}else p.ground=false;
 if(p.x<50)p.x=50;if(p.x>WALL_X+60)p.x=WALL_X+60;
 // anim frames
 const fr=F[p.anim]||F.idle;
 if(p.anim!=='pounce'){p.ft+=dt*(FPS[p.anim]||8)*(p.anim==='stalk'?Math.min(1,Math.abs(p.vx)/80):1);
 if(p.anim==='climb'&&p.vy>=0)p.ft-=dt*FPS.climb;
 const loop=['idle','walk','run','climb','fall','jump','claw3','stalk','airspin'].includes(p.anim);
 p.fi=loop?Math.floor(p.ft)%fr.length:Math.min(fr.length-1,Math.floor(p.ft));}
 for(const w of waves){w.r+=dt*(w.big?900:600);w.l-=dt*2.2}for(let i=waves.length-1;i>=0;i--)if(waves[i].l<=0)waves.splice(i,1);
 for(const g of ghosts)g.l-=dt;for(let i=ghosts.length-1;i>=0;i--)if(ghosts[i].l<=0)ghosts.splice(i,1);
 for(const t of texts)t.l-=dt*.8;for(let i=texts.length-1;i>=0;i--)if(texts[i].l<=0)texts.splice(i,1);
 for(const s of shots){for(const d of dummies)if(d.alive&&!s.hit.has(d)&&Math.abs(d.x-s.x)<50&&s.y>d.y-130&&s.y<d.y+10){s.hit.add(d);hitDummy(d,'blast',Math.sign(s.vx))}s.x+=s.vx*dt;s.l-=dt;s.a+=dt*14;if(s.x>WALL_X-20&&s.vx>0&&s.y>WT){s.l=0;burst(s.x,s.y)}if(s.x<20){s.l=0;burst(s.x,s.y)}if(Math.random()<.8)sparks.push({x:s.x,y:s.y+(Math.random()-.5)*30,vx:-s.vx*.1,vy:(Math.random()-.5)*60,l:.3,c:'#7fd4ff'})}
 for(let i=shots.length-1;i>=0;i--)if(shots[i].l<=0)shots.splice(i,1);
 for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=400*dt;s.l-=dt}
 for(let i=sparks.length-1;i>=0;i--)if(sparks[i].l<=0)sparks.splice(i,1);
 meleeHits(dt);updDummies(dt);
 shake*=.85; for(const k in P)delete P[k];
 lbl.textContent=p.anim.replace(/^claw(\d)/,'claw $1/3')+(p.wall?' (wall)':'')+(p.hunt?' · HUNT':'');
}
function burst(x,y){shake=10;for(let i=0;i<24;i++){const a=Math.random()*6.28,v=100+Math.random()*300;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5,c:i%2?'#fff':'#5cc8ff'})}}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#87c6f0';ctx.fillRect(0,0,cv.width,cv.height);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
 ctx.setTransform(scale,0,0,scale,offX+sx*scale,offY+sy*scale);
 const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#9fd6f7');g.addColorStop(1,'#d8f0ff');ctx.fillStyle=g;ctx.fillRect(-500,0,VW+1000,VH);
 ctx.fillStyle='#6dbb4a';ctx.fillRect(-500,GROUND,VW+1000,14);ctx.fillStyle='#b98a55';ctx.fillRect(-500,GROUND+14,VW+1000,200);
 // wall
 ctx.fillStyle='#8a7a6a';ctx.fillRect(WALL_X,WT,80,GROUND-WT);ctx.strokeStyle='#6c5e50';ctx.lineWidth=2;
 for(let y=WT;y<GROUND;y+=28){ctx.beginPath();ctx.moveTo(WALL_X,y);ctx.lineTo(WALL_X+80,y);ctx.stroke();const o=(y/28)%2?20:50;ctx.beginPath();ctx.moveTo(WALL_X+o,y);ctx.lineTo(WALL_X+o,y+28);ctx.stroke()}
 ctx.fillStyle='#fff8';ctx.font='14px system-ui';ctx.fillText('climb wall →',WALL_X-60,WT-140);
 drawDummies();
 // shadow
 const hgt=GROUND-p.y;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(p.x,GROUND+3,60*Math.max(.4,1-hgt/400),9,0,0,6.28);ctx.fill();
 for(const g of ghosts){const im=g.f&&IMG[g.f.f];if(!im)continue;ctx.save();ctx.globalAlpha=g.l*(g.blue?2:1.6);if(g.blue)ctx.globalCompositeOperation='lighter';ctx.translate(g.x,g.y);ctx.scale(g.face*SC,SC);ctx.drawImage(im,-g.f.ax,-g.f.ay);ctx.restore()}
 // player
 const f=(F[p.anim]||F.idle)[p.fi];if(f&&IMG[f.f]){const im=IMG[f.f];
  ctx.save();if(p.hunt)ctx.globalAlpha=.55;ctx.translate(p.x+(p.wall?40:0),p.y+(p.hunt&&p.ground&&p.anim==='stalk'?0:0));ctx.scale(p.face*SC,SC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore();}
 // shots
 for(const s of shots){ctx.save();ctx.translate(s.x,s.y);ctx.globalCompositeOperation='lighter';
  const r=26+Math.sin(s.a)*4;const gg=ctx.createRadialGradient(0,0,2,0,0,r*1.8);gg.addColorStop(0,'#fff');gg.addColorStop(.35,'#7fdcff');gg.addColorStop(1,'rgba(40,120,255,0)');
  ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,r*1.8,0,6.28);ctx.fill();ctx.restore();}
 ctx.globalCompositeOperation='lighter';
 for(const s of sparks){ctx.globalAlpha=Math.max(0,s.l*2.5);ctx.fillStyle=s.c;ctx.fillRect(s.x-3,s.y-3,6,6)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 for(const w of waves){ctx.globalAlpha=Math.max(0,w.l);ctx.strokeStyle=w.big?'#fff':'#ffe0b0';ctx.lineWidth=8*w.l;ctx.beginPath();ctx.ellipse(w.x,w.y,w.r,w.r*.22,0,0,6.28);ctx.stroke()}ctx.globalAlpha=1;
 if(p.hunt){ctx.fillStyle='rgba(20,10,40,.18)';ctx.fillRect(-500,0,VW+1000,VH)}
 drawTexts();drawCombo();
 ctx.globalAlpha=1;ctx.textAlign='left';
}
let last=0;function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;if(hitstop>0){hitstop-=dt;shake*=.9}else{update(dt);updCombo(dt)}draw();requestAnimationFrame(loop)}
fetch('assets/frames.json').then(r=>r.json()).then(j=>{F=j;const names=new Set();Object.values(j).forEach(a=>a.forEach(f=>names.add(f.f)));
 let n=0;names.forEach(nm=>{const im=new Image();im.onload=()=>{if(++n===names.size)requestAnimationFrame(loop)};im.src='assets/'+nm+'.png';IMG[nm]=im})});
// H key = test hurt
addEventListener('keydown',e=>{if(e.code==='KeyH')P.hurtTest=1});
// ===== COMBO SYSTEM =====
let hitstop=0;
const FONT="'Bangers','Luckiest Guy',Impact,'Arial Black',sans-serif";
const NAMES={claw1:'SCRATCH!',claw2:'SWIPE!',claw3:'TRIPLE CLAW!',dashstrike:'DASH STRIKE!',airswipe:'AIR SWIPE!',airspin:'AIR SPIN!',dive:'DIVE BOMB!',diveclaw:'DIVE CLAW!',pounce:'POUNCE!',blast:'ENERGY BLAST!'};
// knockback: [vx, vy, float seconds, hitstop]
const KB={claw1:[220,-180,0,.04],claw2:[260,-220,0,.04],claw3:[420,-720,.3,.08],dashstrike:[750,-380,.2,.09],airswipe:[200,-480,.45,.05],airspin:[120,-330,.5,.035],
 dive:[0,-850,.25,.11],diveclaw:[520,-360,.2,.08],pounce:[380,-520,.2,.07],blast:[620,-420,.2,.08]};
const REACH={claw1:[115,130],claw2:[125,130],claw3:[140,150],dashstrike:[160,130],airswipe:[140,150],airspin:[130,170],diveclaw:[110,120],pounce:[120,120]};
const C={n:0,t:0,max:1.2,pop:0,best:0,fin:null,lastState:'',atk:0,spinT:0};
const dummies=[{home:430},{home:600},{home:740}].map(d=>({...d,x:d.home,y:GROUND,vx:0,vy:0,fl:0,hp:12,flash:0,sq:0,rot:0,alive:true,resp:0,last:-1,calm:0}));
function tierCol(n){return n>=50?`hsl(${(performance.now()/4)%360},100%,65%)`:n>=25?'#ff6fcf':n>=10?'#ff9a2e':n>=5?'#ffe14d':'#fff'}
function extend(name){if(C.n>0){C.t=C.max;if(name)say(name,'#fff',false)}}
function comboEnd(silent){if(C.n>=2&&!silent){C.fin={n:C.n,l:2.2};}C.n=0;C.t=0}
function updCombo(dt){if(C.n>0){C.t-=dt;if(C.t<=0)comboEnd()}C.pop*=Math.pow(.002,dt);if(C.fin){C.fin.l-=dt;if(C.fin.l<=0)C.fin=null}}
function addHit(move){C.n++;C.t=C.max;C.pop=1;C.best=Math.max(C.best,C.n);C.fin=null;
 const rank={10:'NICE!',25:'AWESOME!',50:'PURRFECT!',100:'LEGENDARY!'}[C.n];
 if(rank)say(rank,tierCol(C.n),true);else say(NAMES[move]||move,'#fff',false)}
function hitDummy(d,move,dir){const k=KB[move]||KB.claw1;
 d.vx=dir*k[0]*(0.85+Math.random()*.3);d.vy=Math.min(d.vy,0)+k[1];if(d.y>=GROUND-1&&k[1]>-200)d.vy=k[1];d.fl=k[2];d.flash=.12;d.sq=1;d.hp--;d.calm=0;
 hitstop=Math.max(hitstop,k[3]);shake=Math.max(shake,4+k[3]*60);addHit(move);
 const hx=d.x-dir*20,hy=d.y-70;
 for(let i=0;i<12;i++){const a=Math.random()*6.28,v=150+Math.random()*350;sparks.push({x:hx,y:hy,vx:Math.cos(a)*v+dir*120,vy:Math.sin(a)*v,l:.35,c:['#fff','#ffe14d','#ff9ad5','#8fe0ff'][i%4]})}
 waves.push({x:hx,y:hy,r:8,l:.6,big:false});
 if(d.hp<=0){d.alive=false;d.resp=1.4;burst(d.x,d.y-60)}}
function meleeHits(dt){const st=p.state==='claw'?p.anim:p.state;
 if(st!==C.lastState){C.lastState=st;C.atk++}
 if(st==='airspin'){C.spinT+=dt;if(C.spinT>.12){C.spinT=0;C.atk++}}
 const r=REACH[st];if(!r)return;
 if(st.startsWith('claw')&&p.t>.18)return;
 for(const d of dummies){if(!d.alive||d.last===C.atk)continue;
  const dx=(d.x-p.x)*p.face,within=st==='airspin'?Math.abs(d.x-p.x)<r[0]:(dx>-35&&dx<r[0]);
  if(within&&d.y-130<p.y+10&&d.y>p.y-r[1]){d.last=C.atk;hitDummy(d,st,st==='airspin'?Math.sign(d.x-p.x)||p.face:p.face)}}}
function areaHit(x,y,rad,move){for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<rad&&Math.abs(d.y-y)<140)hitDummy(d,move,Math.sign(d.x-x)||p.face)}
function updDummies(dt){for(const d of dummies){
 if(!d.alive){d.resp-=dt;if(d.resp<=0){Object.assign(d,{x:d.home,y:GROUND-200,vx:0,vy:0,hp:12,alive:true,sq:1,fl:0});for(let i=0;i<10;i++)sparks.push({x:d.x,y:GROUND-200,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,l:.4,c:'#ffe14d'})}continue}
 d.fl-=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.calm+=dt;
 d.vy+=(d.fl>0?420:1700)*dt;if(d.fl>0)d.vx*=Math.pow(.3,dt);
 d.x+=d.vx*dt;d.y+=d.vy*dt;
 if(d.x<40){d.x=40;d.vx=Math.abs(d.vx)*.5}if(d.x>WALL_X-30){d.x=WALL_X-30;d.vx=-Math.abs(d.vx)*.5}
 if(d.y<-300)d.y=-300;
 if(d.y>=GROUND){d.y=GROUND;if(d.vy>350){d.vy*=-.35;d.sq=.6}else d.vy=0;d.vx*=Math.pow(.02,dt);
  if(d.calm>1.2)d.x+=(d.home-d.x)*Math.min(1,dt*1.5)}
 d.rot=Math.max(-.6,Math.min(.6,d.vx/900))+(d.y<GROUND?Math.sin(performance.now()/90)*.25*Math.min(1,(GROUND-d.y)/100):0);}}
function drawDummies(){for(const d of dummies){if(!d.alive)continue;
 ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(d.x,GROUND+3,34,7,0,0,6.28);ctx.fill();
 ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);const s=1+d.sq*.18;ctx.scale(1/s,s);
 ctx.fillStyle='#7a5235';ctx.fillRect(-34,-14,68,14);
 ctx.fillStyle='#d8b98a';ctx.fillRect(-13,-100,26,88);ctx.strokeStyle='#b08f5f';ctx.lineWidth=3;
 for(let y=-96;y<-14;y+=9){ctx.beginPath();ctx.moveTo(-13,y);ctx.lineTo(13,y+5);ctx.stroke()}
 ctx.fillStyle=d.flash>0?'#fff':'#ff8fb1';ctx.beginPath();ctx.arc(0,-120,26,0,6.28);ctx.fill();
 ctx.fillStyle=d.flash>0?'#ffd':'#fff';ctx.beginPath();ctx.arc(0,-120,17,0,6.28);ctx.fill();
 ctx.fillStyle='#333';const hurt=d.flash>-.25;
 if(hurt){ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('> <',0,-118)}else{ctx.beginPath();ctx.arc(-6,-123,2.5,0,6.28);ctx.arc(6,-123,2.5,0,6.28);ctx.fill()}
 ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.beginPath();hurt?ctx.arc(0,-108,4,0,6.28):ctx.arc(0,-116,5,.2,2.9);ctx.stroke();
 ctx.fillStyle='#4c4';ctx.fillRect(-20,-158,40*d.hp/12,4);ctx.restore()}}
function fancy(txt,x,y,size,rot,scale,alpha,col){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);
 ctx.font=`${size}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';
 const g=ctx.createLinearGradient(0,-size/2,0,size/2);g.addColorStop(0,'#fff');g.addColorStop(.5,col);g.addColorStop(1,col==='#fff'?'#9fd8ff':col);
 ctx.lineJoin='round';ctx.lineWidth=size*.22;ctx.strokeStyle='rgba(20,10,60,.85)';ctx.strokeText(txt,0,size*.06);
 ctx.lineWidth=size*.1;ctx.strokeStyle='#1a0f3a';ctx.strokeText(txt,0,0);ctx.fillStyle=g;ctx.fillText(txt,0,0);ctx.restore()}
function drawTexts(){for(const t of texts){const age=1-t.l,pop=age<.12?.4+age/.12*.85:age<.22?1.25-(age-.12)*2.5:1;
 fancy(t.t,VW/2,(t.big?175:140)-age*25,t.big?78:54,t.rot,pop,Math.min(1,t.l*2.2),t.c)}
 if(C.fin){const a=C.fin.l,age=2.2-a,pop=age<.15?.3+age/.15*1:1+Math.sin(age*8)*.03;
  fancy(`COMBO ${C.fin.n}!`,VW/2,250,90,-.06,pop,Math.min(1,a*1.5),tierCol(C.fin.n))}}
function drawCombo(){if(C.n<1)return;const col=tierCol(C.n),sh=C.pop*8;
 const x=VW-120+(Math.random()-.5)*sh,y=110+(Math.random()-.5)*sh;
 fancy('x'+C.n,x-10,y,64+C.pop*22,-.08,1,1,col);fancy('HITS',x+5,y+44,28,-.08,1,1,col);
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(VW-200,y+66,170,10);ctx.fillStyle=col;ctx.fillRect(VW-200,y+66,170*Math.max(0,C.t/C.max),10)}
document.fonts&&document.fonts.load(`40px Bangers`).catch(()=>{});
// help: auto-hide after 10s, toggle with ? / or tapping the label
const helpEl=document.getElementById('help');setTimeout(()=>helpEl.style.display='none',10000);
const tgl=()=>{helpEl.style.display=helpEl.style.display==='none'?'block':'none'};
addEventListener('keydown',e=>{if(e.key==='?'||e.key==='/')tgl()});lbl.style.pointerEvents='auto';lbl.addEventListener('pointerdown',tgl);
