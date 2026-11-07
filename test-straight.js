// Isolated straight-punch practice. This page does not load game.js, punch33.js,
// punch52.js, level.js, or practice34.js, and it does not change those files.
// The live cross (k_ps_cross) is drawn read-only from assets/frames.json.
// punch33.js only runs inside the full game, so it cannot be called from here.
'use strict';
(function(){
const cv=document.getElementById('c');
const ctx=cv.getContext('2d');
const VW=960,VH=540,GROUND=470,SC=0.8;
const LIVE_GUARD_H=183; // k_ps_cross frame 0 height, the live foot-anchored guard
const NEW_SIL_H=280;    // boxing_v1 silhouette height (animation.json)
const NEW_SC=(LIVE_GUARD_H*SC)/NEW_SIL_H;
let scale=1,offX=0,offY=0,shake=0;

function vpSize(){
  const vv=window.visualViewport,de=document.documentElement;
  let w=innerWidth||de.clientWidth,h=innerHeight||de.clientHeight;
  if(vv&&vv.scale<1.05&&vv.width>50&&vv.height>50){w=Math.min(w,vv.width)||vv.width;h=vv.height}
  return [Math.round(w),Math.round(h)];
}
function resize(){
  const d=Math.min(devicePixelRatio||1,2),[w,h]=vpSize();
  cv.style.width=w+'px';cv.style.height=h+'px';
  const W=Math.round(w*d),H=Math.round(h*d);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  scale=Math.min(cv.width/VW,cv.height/VH);
  offX=(cv.width-VW*scale)/2;offY=(cv.height-VH*scale)/2;
}
addEventListener('resize',resize);
addEventListener('orientationchange',()=>{resize();setTimeout(resize,400)});
if(window.visualViewport)visualViewport.addEventListener('resize',resize);
resize();

const keys={left:false,right:false,punch:false};
let lastLR=1;
const btn=id=>document.getElementById(id);
function bindHold(el,key){
  const down=e=>{
    e.preventDefault();
    try{el.setPointerCapture(e.pointerId)}catch(_){}
    el.classList.add('on');keys[key]=true;
    if(key==='left'||key==='right')lastLR=key==='left'?-1:1;
    if(key==='punch')tryPunch();
  };
  const up=()=>{el.classList.remove('on');keys[key]=false};
  el.addEventListener('pointerdown',down);
  el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',up);
}
bindHold(btn('left'),'left');
bindHold(btn('right'),'right');
bindHold(btn('punch'),'punch');

let mode='new';
try{if(localStorage.getItem('paddyTestStraight')==='current')mode='current'}catch(_){}
function paintToggle(){
  const b=btn('toggle');
  const cur=mode==='current';
  b.textContent=cur?'PUNCH: CURRENT CROSS':'PUNCH: NEW STRAIGHT';
  b.classList.toggle('cur',cur);
}
function toggle(){
  mode=mode==='new'?'current':'new';
  try{localStorage.setItem('paddyTestStraight',mode)}catch(_){}
  cancelPunch();
  paintToggle();
}
btn('toggle').addEventListener('pointerdown',e=>{e.preventDefault();toggle()});
paintToggle();

addEventListener('keydown',e=>{
  if(e.repeat)return;
  if(e.code==='ArrowLeft'||e.code==='KeyA'){keys.left=true;lastLR=-1;e.preventDefault()}
  else if(e.code==='ArrowRight'||e.code==='KeyD'){keys.right=true;lastLR=1;e.preventDefault()}
  else if(e.code==='KeyX'||e.code==='KeyJ'){keys.punch=true;tryPunch();e.preventDefault()}
  else if(e.code==='Backslash'){toggle();e.preventDefault()}
});
addEventListener('keyup',e=>{
  if(e.code==='ArrowLeft'||e.code==='KeyA')keys.left=false;
  else if(e.code==='ArrowRight'||e.code==='KeyD')keys.right=false;
  else if(e.code==='KeyX'||e.code==='KeyJ')keys.punch=false;
});
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
['gesturestart','contextmenu'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault()));

const arena=new Image();
arena.src='assets/arena.webp';
const p={x:420,face:1,phase:'idle',fi:0,ft:0,ease:0,idleT:0};
const d={x:640,home:640,face:-1,phase:'idle',fi:0,ft:0,ox:0,react:0,bub:0};
let hits=0,nudge=0,nudgeFrom=0,nudgeOut=0,freeze=0,didHit=false,floats=[];
const AIY=GROUND-.84*VH;

let idle=[],straight=[],cross=[],dumL=[],dumR=[],hitL=[],hitR=[];
let anchor=[256,324];
let straightDur=[];
let idleStep=0.15;
const FIST_X=543; // rightmost opaque pixel of frame_05, the full extension
const IMPACT=new Set([3,4]); // frame_04 and frame_05, the extended straight
const EASE=0.2;
const HOLD_IMPACT=0.145;

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const im=new Image();
    im.onload=()=>resolve(im);
    im.onerror=()=>reject(new Error('image failed: '+src));
    im.src=src;
  });
}
async function loadJSON(url){
  const r=await fetch(url);
  if(!r.ok)throw new Error(url+' '+r.status);
  return r.json();
}
async function loadSheet(metaUrl,dir){
  const meta=await loadJSON(metaUrl);
  const frames=[];
  for(const fr of meta.frames){
    frames.push({img:await loadImage(dir+fr.file),ax:meta.anchor[0],ay:meta.anchor[1]});
  }
  return {meta,frames};
}
async function loadLive(frames,key){
  const list=frames[key];
  if(!list)throw new Error('missing '+key+' in frames.json');
  const out=[];
  for(const f of list){
    out.push({img:await loadImage('assets/'+f.f+'.png'),ax:f.ax,ay:f.ay,w:f.w,h:f.h,rx:f.rx||0});
  }
  return out;
}

let ready=false,bootErr=null;
(async function boot(){
  try{
    const [idlePack,stPack,frames]=await Promise.all([
      loadSheet('assets/sprites/boxing_v1/idle_guard/animation.json','assets/sprites/boxing_v1/idle_guard/'),
      loadSheet('assets/sprites/boxing_v1/right_straight_candidate/animation.json','assets/sprites/boxing_v1/right_straight_candidate/'),
      loadJSON('assets/frames.json')
    ]);
    idle=idlePack.frames;
    straight=stPack.frames;
    anchor=stPack.meta.anchor;
    idleStep=(idlePack.meta.suggested_ms_per_frame[0]||150)/1000;
    const ms=stPack.meta.suggested_ms_per_frame.slice();
    ms[0]=Math.min(ms[0]||140,80);
    ms[4]=Math.max(ms[4]||65,HOLD_IMPACT*1000);
    ms[5]=Math.max(ms[5]||80,150);
    straightDur=ms.map(v=>v/1000);
    [cross,dumL,dumR,hitL,hitR]=await Promise.all([
      loadLive(frames,'k_ps_cross'),
      loadLive(frames,'sd_idle'),
      loadLive(frames,'sd_idle_r'),
      loadLive(frames,'sd_hit_light'),
      loadLive(frames,'sd_hit_light_r')
    ]);
    ready=true;
    window.TS.ready=true;
  }catch(err){
    bootErr=err&&err.message?err.message:String(err);
    console.error('straight test failed to load',err);
    const tag=btn('tag');
    if(tag)tag.textContent=bootErr;
  }
})();

function dir(){
  if(keys.left&&keys.right)return lastLR;
  if(keys.right)return 1;
  if(keys.left)return -1;
  return 0;
}
function cancelPunch(){
  p.phase='idle';p.fi=0;p.ft=0;p.ease=0;nudge=0;nudgeOut=0;didHit=false;freeze=0;
}
function tryPunch(){
  if(!ready||p.phase!=='idle')return;
  didHit=false;nudge=0;nudgeOut=0;p.ease=0;p.fi=0;p.ft=0;p.phase='punch';
}
function liveFrame(){return cross[Math.max(0,Math.min(cross.length-1,p.fi))]||cross[0]}
function reachPx(){
  if(mode==='new'){
    const full=(p.phase==='punch'&&IMPACT.has(p.fi))||p.phase==='ease';
    return (full?FIST_X-anchor[0]:70)*NEW_SC;
  }
  const f=p.phase==='idle'?cross[0]:liveFrame();
  return f?(f.w-f.ax)*SC:0;
}
function fistX(){return p.x+nudge+p.face*reachPx()}
function dummySpan(){
  const sheet=d.face<0?dumL:dumR;
  const f=sheet[Math.min(d.fi,sheet.length-1)]||sheet[0];
  if(!f)return {l:d.x-40,r:d.x+40};
  return {l:d.x+d.ox-f.ax*SC-16,r:d.x+d.ox+(f.w-f.ax)*SC+16};
}
function connect(){
  if(didHit)return;
  didHit=true;
  hits++;
  btn('hits').textContent='HITS '+hits;
  if(mode==='new'){nudge=p.face*24;nudgeFrom=nudge;nudgeOut=0;freeze=0.055}
  shake=Math.max(shake,5);
  d.phase='hit';d.fi=0;d.ft=0;d.react=0;d.ox=-p.face*18;d.bub=0.85;
  floats.push({t:'HIT!',x:p.x+p.face*20,y:GROUND-188,l:0.7,c:'#ffe14d'});
}
function clampP(){
  const gap=86,side=Math.sign(p.x-d.x)||-1;
  if(Math.abs(p.x-d.x)<gap)p.x=d.x+side*gap;
  p.x=Math.max(130,Math.min(830,p.x));
}
// The new straight's body step is part of the hit, so a punch that lands
// once the shoulder comes forward still counts. The step is applied only
// after it connects, which keeps a whiff from shoving him onto the bag.
function tryHit(){
  if(didHit)return false;
  const span=dummySpan();
  const preview=mode==='new'?p.face*24:0;
  const fx=p.x+preview+p.face*reachPx();
  const near=p.x+preview+p.face*36;
  const lo=Math.min(near,fx),hi=Math.max(near,fx);
  const facingDummy=p.face===Math.sign(d.x-p.x)||Math.abs(d.x-p.x)<90;
  if(facingDummy&&hi>=span.l&&lo<=span.r){connect();return true}
  return false;
}

function update(dt){
  if(!ready)return;
  shake*=Math.pow(0.04,dt);
  for(const f of floats)f.l-=dt;
  floats=floats.filter(f=>f.l>0);
  if(d.bub>0)d.bub-=dt;
  if(freeze>0){freeze=Math.max(0,freeze-dt);if(freeze>0)return}
  if(!freeze)p.idleT+=dt;
  const moving=p.phase==='idle';
  if(moving){
    const v=dir();
    if(v)p.face=v;
    p.x+=v*260*dt;
    clampP();
  }
  if(p.phase==='punch'){
    if(mode==='new'){
      const dur=straightDur[p.fi]||0.08;
      const before=p.fi;
      p.ft+=dt;
      if(p.ft>=dur){
        p.ft-=dur;p.fi++;
        if(p.fi>=6){
          if(!didHit&&nudge===0)nudge=p.face*8;
          p.phase='ease';p.ease=0;nudgeOut=1;nudgeFrom=nudge;
        }else if(IMPACT.has(p.fi)&&!didHit){
          if(tryHit()&&before<4){p.fi=4;p.ft=0}
          else if(!didHit&&p.fi===4)nudge=p.face*8;
        }
      }
    }else{
      const step=1/12;
      p.ft+=dt;
      if(p.ft>=step){
        p.ft-=step;
        const prev=cross[p.fi];
        p.fi++;
        if(p.fi>=cross.length){p.phase='idle';p.fi=0;p.ft=0;nudge=0}
        else{
          const nowF=cross[p.fi];
          p.x+=((nowF.rx||0)-(prev.rx||0))*SC*p.face;
          clampP();
          if(p.fi===3||p.fi===4)tryHit();
        }
      }
    }
  }else if(p.phase==='ease'){
    p.ease+=dt;
    const u=Math.min(1,p.ease/EASE),s=u*u*(3-2*u);
    nudge=nudgeFrom*(1-s);
    if(u>=1){p.phase='idle';p.fi=0;p.ft=0;nudge=0;nudgeOut=0}
  }
  if(freeze>0)return;
  d.face=p.x<d.x?-1:1;
  if(d.phase==='hit'){
    d.react+=dt;d.ft+=dt;
    const step=1/12;
    if(d.ft>=step){d.ft-=step;d.fi++}
    const sheet=d.face<0?hitL:hitR;
    if(d.fi>=sheet.length){d.phase='idle';d.fi=0;d.ft=0}
    if(d.react>0.12)d.ox+=(0-d.ox)*Math.min(1,dt*7);
  }else{
    d.ft+=dt;
    const n=(d.face<0?dumL:dumR).length||1;
    d.fi=Math.floor(d.ft*12)%n;
    d.ox+=(0-d.ox)*Math.min(1,dt*8);
    d.x+=(d.home-d.x)*Math.min(1,dt*3);
  }
}

function drawSprite(f,x,y,face,sc,alpha){
  if(!f||!f.img||!f.img.naturalWidth)return;
  ctx.save();
  if(alpha!=null)ctx.globalAlpha=alpha;
  ctx.translate(x,y);
  ctx.scale(face*sc,sc);
  ctx.drawImage(f.img,-f.ax,-f.ay);
  ctx.restore();
}
function drawPaddy(){
  const x=p.x+nudge,y=GROUND;
  if(mode==='current'){
    const f=p.phase==='idle'?cross[0]:liveFrame();
    drawSprite(f,x,y,p.face,SC,1);
    return;
  }
  if(p.phase==='ease'){
    // Back in the guard pose while the body step eases home. A pose crossfade
    // painted a second cat, because the lean and the upright guard don't share a torso.
    const idleF=idle[Math.floor(p.idleT/idleStep)%idle.length]||idle[0];
    drawSprite(idleF,x,y,p.face,NEW_SC,1);
    return;
  }
  if(p.phase==='punch'){
    drawSprite(straight[Math.min(p.fi,straight.length-1)],x,y,p.face,NEW_SC,1);
    return;
  }
  const fr=idle[Math.floor(p.idleT/idleStep)%idle.length]||idle[0];
  drawSprite(fr,x,y,p.face,NEW_SC,1);
}
function drawDummy(){
  const sheet=d.phase==='hit'?(d.face<0?hitL:hitR):(d.face<0?dumL:dumR);
  const f=sheet[Math.max(0,Math.min(sheet.length-1,d.fi))];
  ctx.fillStyle='rgba(0,0,0,.22)';
  ctx.beginPath();ctx.ellipse(d.x,GROUND+4,52,10,0,0,6.28);ctx.fill();
  drawSprite(f,d.x+d.ox,GROUND,1,SC,1);
  if(d.bub>0){
    ctx.save();ctx.globalAlpha=Math.min(1,d.bub*3);
    ctx.fillStyle='#fff';ctx.strokeStyle='#1a0f3a';ctx.lineWidth=3;
    ctx.font='bold 22px system-ui';
    const w=ctx.measureText('oof!').width+18,x=d.x-w/2,y=GROUND-196;
    ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,32,10):ctx.rect(x,y,w,32);ctx.fill();ctx.stroke();
    ctx.fillStyle='#3a2400';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('oof!',d.x,y+16);ctx.restore();
  }
}
function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#0d1226';ctx.fillRect(0,0,cv.width,cv.height);
  const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
  ctx.setTransform(scale,0,0,scale,offX+sx*scale,offY+sy*scale);
  ctx.imageSmoothingEnabled=true;
  const sky=ctx.createLinearGradient(0,0,0,VH);
  sky.addColorStop(0,'#030a2a');sky.addColorStop(1,'#041140');
  ctx.fillStyle=sky;ctx.fillRect(-40,-40,VW+80,VH+80);
  if(arena.naturalWidth)ctx.drawImage(arena,0,AIY,VW,VH);
  else{ctx.fillStyle='#2a2438';ctx.fillRect(0,GROUND,VW,VH-GROUND)}
  ctx.fillStyle='rgba(0,0,0,.2)';
  ctx.beginPath();ctx.ellipse(p.x,GROUND+4,36,9,0,0,6.28);ctx.fill();
  if(ready){drawDummy();drawPaddy()}
  for(const f of floats){
    ctx.globalAlpha=Math.min(1,f.l*2);
    ctx.fillStyle=f.c;ctx.font='28px Bangers,Impact,sans-serif';ctx.textAlign='center';
    ctx.fillText(f.t,f.x,f.y-(0.7-f.l)*36);
  }
  ctx.globalAlpha=1;
  if(!ready){
    ctx.fillStyle='#fff';ctx.font='20px system-ui';ctx.textAlign='center';
    ctx.fillText(bootErr?bootErr:'Loading straight punch test…',VW/2,VH/2);
  }
}

let last=0;
function loop(t){
  requestAnimationFrame(loop);
  let dt=(t-last)/1000;last=t;
  if(!(dt>0))dt=0;
  dt=Math.min(0.033,dt);
  try{update(dt);draw()}catch(err){console.error('straight test',err)}
}
requestAnimationFrame(loop);

window.TS={
  ready:false,
  hits:()=>hits,
  mode:()=>mode,
  phase:()=>p.phase,
  frame:()=>p.fi,
  nudge:()=>nudge,
  freeze:()=>freeze,
  dummy:()=>d.phase,
  pos:()=>({x:p.x,dx:d.x,face:p.face}),
  punch:tryPunch,
  toggle,
  setMode(m){if(m!==mode)toggle()},
  hold(key,on){keys[key]=!!on;if(key==='left')lastLR=-1;if(key==='right')lastLR=1},
  place(x){if(p.phase==='idle')p.x=x}
};
})();
