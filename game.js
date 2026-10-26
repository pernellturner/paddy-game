// Paddy move test – plain canvas
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),lbl=document.getElementById('lbl');
const VW=960,VH=540,GROUND=470,WALL_X=880,SC=0.8; // world units
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
 Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyX:'attack',KeyJ:'attack',KeyC:'special',KeyK:'special',ShiftLeft:'run',ShiftRight:'run'};
addEventListener('keydown',e=>{const k=map[e.code];if(!k)return;e.preventDefault();if(!K[k])P[k]=1;K[k]=1});
addEventListener('keyup',e=>{const k=map[e.code];if(k)K[k]=0});
document.querySelectorAll('.b').forEach(b=>{const k=b.dataset.k;
 const on=e=>{e.preventDefault();if(!K[k])P[k]=1;K[k]=1;b.classList.add('on')},off=e=>{e.preventDefault();K[k]=0;b.classList.remove('on')};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});
// player
const p={x:300,y:GROUND,vx:0,vy:0,face:1,ground:true,state:'normal',t:0,anim:'idle',fi:0,ft:0,combo:0,queued:false,cool:0,inv:0,wall:false};
const shots=[],sparks=[];let shake=0;
function setAnim(a){if(p.anim!==a){p.anim=a;p.fi=0;p.ft=0}}
const FPS={idle:3,walk:11,run:12,jump:8,fall:6,land:10,crouch:4,claw1:1,claw2:1,claw3:12,charge:1,blast:1,hurt:1,climb:8,dash:1,roar:1,lie:1};
function startClaw(){p.combo++;p.state='claw';p.t=0;setAnim('claw'+p.combo);p.queued=false;
 p.vx=p.face*(p.combo===3?260:140);shake=p.combo===3?6:3;
 for(let i=0;i<6;i++)sparks.push({x:p.x+p.face*70,y:p.y-70,vx:p.face*(100+Math.random()*200),vy:-Math.random()*200,l:.35,c:'#bfe8ff'});}
function update(dt){
 p.t+=dt;p.cool-=dt;p.inv-=dt;const onG=p.ground;
 const nearWall=(p.x>WALL_X-70&&K.right)||(p.wall&&!K.down);
 switch(p.state){
 case 'claw':
  if(P.attack&&p.combo<3)p.queued=true;
  p.vx*=0.88;
  if(p.t>(p.combo===3?.42:.26)){ if(p.queued)startClaw(); else{p.state='normal';p.combo=0;} }
  break;
 case 'charge':
  p.vx=0;if(p.t>.45){p.state='blast';p.t=0;setAnim('blast');
   shots.push({x:p.x+p.face*120,y:p.y-62,vx:p.face*620,l:1.6,a:0});shake=8;}
  break;
 case 'blast': p.vx=-p.face*40; if(p.t>.4){p.state='normal';p.cool=.3}break;
 case 'hurt': if(p.t>.6&&p.ground)p.state='normal';break;
 case 'land': p.vx*=.8;if(p.t>.12)p.state='normal';break;
 }
 if(p.state==='normal'){
  const run=K.run?1.6:1,dir=(K.right?1:0)-(K.left?1:0);
  if(K.down&&p.ground){p.vx*=.7;setAnim('crouch');}
  else{p.vx+=(dir*260*run-p.vx)*Math.min(1,dt*10);if(dir)p.face=dir;}
  // wall climb
  if(p.x>=WALL_X-62&&K.right&&!K.down){p.wall=true}
  if(p.wall){ if(!K.right||K.down){p.wall=false} else {p.vy=K.jump?-170:-110; p.face=1; if(p.y<160){p.vy=-420;p.vx=-260;p.wall=false;p.face=-1}}}
  if(P.jump&&p.ground&&!p.wall){p.vy=-720;p.ground=false;}
  if(P.jump&&p.wall){p.wall=false;p.vy=-620;p.vx=-300;p.face=-1}
  if(P.attack&&p.cool<=0){p.combo=0;startClaw()}
  else if(P.special&&p.cool<=0){p.state='charge';p.t=0;setAnim('charge');p.vx=0}
  else if(P.hurt){}
  if(p.state==='normal'){
   if(p.wall)setAnim('climb');
   else if(!p.ground)setAnim(p.vy<0?'jump':'fall');
   else if(!(K.down))setAnim(Math.abs(p.vx)>300?'run':Math.abs(p.vx)>25?'walk':'idle');
  }
 }
 if(P.hurtTest){p.state='hurt';p.t=0;setAnim('hurt');p.vy=-400;p.vx=-p.face*200;p.ground=false}
 // physics
 if(!p.wall)p.vy+=1900*dt; p.x+=p.vx*dt;p.y+=p.vy*dt;
 if(p.y>=GROUND){p.y=GROUND;if(!p.ground&&p.vy>300&&p.state==='normal'){p.state='land';p.t=0;setAnim('land');for(let i=0;i<8;i++)sparks.push({x:p.x+(Math.random()-.5)*80,y:GROUND,vx:(Math.random()-.5)*200,vy:-Math.random()*120,l:.4,c:'#d9c49a'})}p.vy=0;p.ground=true;}else p.ground=false;
 if(p.x<50)p.x=50;if(p.x>WALL_X-60)p.x=WALL_X-60;
 // anim frames
 const fr=F[p.anim]||F.idle;p.ft+=dt*(FPS[p.anim]||8);
 if(p.anim==='walk'||p.anim==='run'){p.ft=p.ft;}
 if(p.anim==='climb'&&Math.abs(p.vy)<1)p.ft-=dt*FPS.climb;
 const loop=['idle','walk','run','climb','fall','jump','claw3'].includes(p.anim);
 p.fi=loop?Math.floor(p.ft)%fr.length:Math.min(fr.length-1,Math.floor(p.ft));
 // shots
 for(const s of shots){s.x+=s.vx*dt;s.l-=dt;s.a+=dt*14;if(s.x>WALL_X-20&&s.vx>0){s.l=0;burst(s.x,s.y)}if(s.x<20){s.l=0;burst(s.x,s.y)}if(Math.random()<.8)sparks.push({x:s.x,y:s.y+(Math.random()-.5)*30,vx:-s.vx*.1,vy:(Math.random()-.5)*60,l:.3,c:'#7fd4ff'})}
 for(let i=shots.length-1;i>=0;i--)if(shots[i].l<=0)shots.splice(i,1);
 for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=400*dt;s.l-=dt}
 for(let i=sparks.length-1;i>=0;i--)if(sparks[i].l<=0)sparks.splice(i,1);
 shake*=.85; for(const k in P)delete P[k];
 lbl.textContent=p.anim.replace(/^claw(\d)/,'claw $1/3')+(p.wall?' (wall)':'');
}
function burst(x,y){shake=10;for(let i=0;i<24;i++){const a=Math.random()*6.28,v=100+Math.random()*300;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5,c:i%2?'#fff':'#5cc8ff'})}}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#87c6f0';ctx.fillRect(0,0,cv.width,cv.height);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
 ctx.setTransform(scale,0,0,scale,offX+sx*scale,offY+sy*scale);
 const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#9fd6f7');g.addColorStop(1,'#d8f0ff');ctx.fillStyle=g;ctx.fillRect(-500,0,VW+1000,VH);
 ctx.fillStyle='#6dbb4a';ctx.fillRect(-500,GROUND,VW+1000,14);ctx.fillStyle='#b98a55';ctx.fillRect(-500,GROUND+14,VW+1000,200);
 // wall
 ctx.fillStyle='#8a7a6a';ctx.fillRect(WALL_X,60,80,GROUND-60);ctx.strokeStyle='#6c5e50';ctx.lineWidth=2;
 for(let y=60;y<GROUND;y+=28){ctx.beginPath();ctx.moveTo(WALL_X,y);ctx.lineTo(WALL_X+80,y);ctx.stroke();const o=(y/28)%2?20:50;ctx.beginPath();ctx.moveTo(WALL_X+o,y);ctx.lineTo(WALL_X+o,y+28);ctx.stroke()}
 ctx.fillStyle='#fff8';ctx.font='14px system-ui';ctx.fillText('climb wall →',WALL_X-100,50);
 // shadow
 const hgt=GROUND-p.y;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(p.x,GROUND+3,60*Math.max(.4,1-hgt/400),9,0,0,6.28);ctx.fill();
 // player
 const f=(F[p.anim]||F.idle)[p.fi];if(f&&IMG[f.f]){const im=IMG[f.f];
  ctx.save();ctx.translate(p.x+(p.wall?40:0),p.y);ctx.scale(p.face*SC,SC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore();}
 // shots
 for(const s of shots){ctx.save();ctx.translate(s.x,s.y);ctx.globalCompositeOperation='lighter';
  const r=26+Math.sin(s.a)*4;const gg=ctx.createRadialGradient(0,0,2,0,0,r*1.8);gg.addColorStop(0,'#fff');gg.addColorStop(.35,'#7fdcff');gg.addColorStop(1,'rgba(40,120,255,0)');
  ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,r*1.8,0,6.28);ctx.fill();ctx.restore();}
 ctx.globalCompositeOperation='lighter';
 for(const s of sparks){ctx.globalAlpha=Math.max(0,s.l*2.5);ctx.fillStyle=s.c;ctx.fillRect(s.x-3,s.y-3,6,6)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
let last=0;function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)}
fetch('assets/frames.json').then(r=>r.json()).then(j=>{F=j;const names=new Set();Object.values(j).forEach(a=>a.forEach(f=>names.add(f.f)));
 let n=0;names.forEach(nm=>{const im=new Image();im.onload=()=>{if(++n===names.size)requestAnimationFrame(loop)};im.src='assets/'+nm+'.png';IMG[nm]=im})});
// H key = test hurt
addEventListener('keydown',e=>{if(e.code==='KeyH')P.hurtTest=1});
