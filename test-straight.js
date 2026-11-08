// Isolated boxing practice. Does not load or edit game.js, punch33.js, level.js,
// or the story / uppercut / Combat Lab files. Run art is the live k_run sheet, read only.
'use strict';
(function(){
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const VW=960, VH=540, GROUND=470, RUN_SC=1, BOX=0.5;
const AIY=GROUND-.84*VH;
let scale=1, offX=0, offY=0, shake=0;

function vpSize(){
  const vv=window.visualViewport, de=document.documentElement;
  let w=innerWidth||de.clientWidth, h=innerHeight||de.clientHeight;
  if(vv&&vv.scale<1.05&&vv.width>50&&vv.height>50){w=Math.min(w,vv.width)||vv.width;h=vv.height}
  return [Math.round(w), Math.round(h)];
}
function resize(){
  const d=Math.min(devicePixelRatio||1,2), [w,h]=vpSize();
  cv.style.width=w+'px'; cv.style.height=h+'px';
  const W=Math.round(w*d), H=Math.round(h*d);
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  scale=Math.min(cv.width/VW, cv.height/VH);
  offX=(cv.width-VW*scale)/2; offY=(cv.height-VH*scale)/2;
}
addEventListener('resize', resize);
addEventListener('orientationchange', ()=>{resize();setTimeout(resize,400)});
if(window.visualViewport) visualViewport.addEventListener('resize', resize);
resize();

const keys={left:false,right:false,up:false,down:false,punch:false};
let lastLR=1, nowT=0;
const btn=id=>document.getElementById(id);
const DIRS=['left','right','up','down'];

const CHAIN=['jab','uppercut_left','uppercut_right'];
const LABEL={
  jab:'JAB', uppercut_left:'LEFT UPPERCUT', uppercut_right:'RIGHT UPPERCUT',
  dash_forward:'DASH', back_step:'BACK STEP', slip:'SLIP', weave:'WEAVE',
  idle:'GUARD', run:'RUN'
};
let combo=0, hits=0, floats=[];
const p={x:470, face:1};
const dummy={x:690, home:690, face:-1, phase:'idle', fi:0, ft:0, ox:0, oy:0, bub:0, hop:0};

let meta=null, moves={}, guard=null, runFrames=[], runFi=0, runFt=0;
let phase='idle', act=null, blend=null, queue=null;
let punchAt=0, charge=0;
const tapMem={};
let pendingQuick=null;
let ready=false, bootErr=null;
const arena=new Image(); arena.src='assets/arena.webp';

function loadImage(src){
  return new Promise((res,rej)=>{
    const im=new Image();
    im.onload=()=>res(im);
    im.onerror=()=>rej(new Error('image failed: '+src));
    im.src=src;
  });
}
async function loadJSON(url){
  const r=await fetch(url);
  if(!r.ok) throw new Error(url+' '+r.status);
  return r.json();
}

(async function boot(){
  try{
    const [pack, frames]=await Promise.all([
      loadJSON('assets/sprites/boxing_v1/approved_play/animation.json'),
      loadJSON('assets/frames.json')
    ]);
    meta=pack;
    const base='assets/sprites/boxing_v1/approved_play/';
    for(const name in pack.moves){
      const m=pack.moves[name];
      const imgs=[];
      for(const rel of m.frames) imgs.push(await loadImage(base+rel));
      moves[name]={imgs, ms:m.durations_ms.map(v=>v/1000), impact:new Set(m.impact||[]), reach:m.reach_px||[]};
    }
    guard=moves.jab.imgs[0];
    const list=frames.k_run;
    if(!list) throw new Error('missing k_run');
    for(const f of list){
      runFrames.push({img:await loadImage('assets/'+f.f+'.png'), ax:f.ax, ay:f.ay});
    }
    const sheets={};
    for(const key of ['sd_idle','sd_idle_r','sd_hit_light','sd_hit_light_r','sd_hit_heavy','sd_hit_heavy_r']){
      sheets[key]=[];
      for(const f of frames[key]) sheets[key].push({img:await loadImage('assets/'+f.f+'.png'), ax:f.ax, ay:f.ay, w:f.w});
    }
    dummy.sheets=sheets;
    ready=true;
    window.TS.ready=true;
  }catch(err){
    bootErr=err&&err.message?err.message:String(err);
    console.error('boxing test failed to load', err);
    const tag=btn('tag'); if(tag) tag.textContent=bootErr;
  }
})();

function dirDown(k){
  const prev=tapMem[k];
  const dbl=!!(prev&&prev.up&&nowT-prev.t<0.30&&prev.up-prev.t<0.25);
  if(dbl){
    pendingQuick=null;
    const face=prev.face;
    tapMem[k]=null;
    const d=k==='right'?1:k==='left'?-1:0;
    const claw=keys.punch;
    if(d){
      if(d===face) startMove('dash_forward', {travel:150, claw});
      else startMove('back_step', {travel:-100, claw});
    }else if(k==='down') startMove('weave', {claw});
    return;
  }
  tapMem[k]={t:nowT, up:0, face:p.face};
}
function dirUp(k){
  const L=tapMem[k];
  if(!L||L.up) return;
  L.up=nowT;
  const held=L.up-L.t;
  if(held<0.15&&k!=='up'){
    pendingQuick={k, at:nowT+0.16, face:L.face};
  }
}
function fireQuick(q){
  const d=q.k==='right'?1:q.k==='left'?-1:0;
  const claw=keys.punch;
  if(q.k==='down'){startMove('weave', {claw});return}
  if(d && d!==q.face){
    if(act&&act.name==='slip') startMove('back_step', {travel:-100, claw});
    else startMove('slip', {travel:-48, claw});
  }
}
function bindDir(el, key){
  const down=e=>{
    e.preventDefault();
    try{el.setPointerCapture(e.pointerId)}catch(_){}
    el.classList.add('on');
    if(!keys[key]) dirDown(key);
    keys[key]=true;
    if(key==='left'||key==='right') lastLR=key==='left'?-1:1;
  };
  const up=()=>{
    if(keys[key]) dirUp(key);
    el.classList.remove('on');
    keys[key]=false;
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}
DIRS.forEach(k=>bindDir(btn(k), k));
const punchEl=btn('punch');
function punchDown(e){
  if(e) e.preventDefault();
  if(keys.punch) return;
  try{if(e) punchEl.setPointerCapture(e.pointerId)}catch(_){}
  keys.punch=true; punchAt=nowT; punchEl.classList.add('on');
}
function punchUp(){
  if(!keys.punch) return;
  keys.punch=false; punchEl.classList.remove('on'); punchEl.classList.remove('charge');
  const held=nowT-punchAt;
  requestPunch(held>=0.3, keys.up?'uppercut_right':null);
  charge=0;
}
punchEl.addEventListener('pointerdown', punchDown);
punchEl.addEventListener('pointerup', punchUp);
punchEl.addEventListener('pointercancel', punchUp);
const keyDir={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
addEventListener('keydown', e=>{
  if(e.repeat) return;
  const k=keyDir[e.code];
  if(k){if(!keys[k]) dirDown(k); keys[k]=true; if(k==='left'||k==='right') lastLR=k==='left'?-1:1; e.preventDefault()}
  else if(e.code==='KeyX'||e.code==='KeyJ'){punchDown(); e.preventDefault()}
});
addEventListener('keyup', e=>{
  const k=keyDir[e.code];
  if(k){if(keys[k]) dirUp(k); keys[k]=false}
  else if(e.code==='KeyX'||e.code==='KeyJ') punchUp();
});
document.addEventListener('touchmove', e=>e.preventDefault(), {passive:false});
['gesturestart','contextmenu'].forEach(ev=>document.addEventListener(ev, e=>e.preventDefault()));

function moveDir(){
  if(keys.left&&keys.right) return lastLR;
  if(keys.right) return 1;
  if(keys.left) return -1;
  return 0;
}
function clampX(){
  const gap=118, side=Math.sign(p.x-dummy.x)||-1;
  if(Math.abs(p.x-dummy.x)<gap) p.x=dummy.x+side*gap;
  p.x=Math.max(140, Math.min(820, p.x));
}
function capture(){
  if(phase==='run'&&runFrames.length) return {kind:'run', f:runFrames[runFi%runFrames.length], face:p.face};
  const img=phase==='act'&&act?act.imgs[Math.min(act.fi, act.imgs.length-1)]:guard;
  return {kind:'box', img, face:p.face};
}
function startMove(name, opt){
  if(!ready||!moves[name]) return;
  opt=opt||{};
  const from=capture();
  const m=moves[name];
  act={
    name, imgs:m.imgs, ms:m.ms.slice(), impact:m.impact, reach:m.reach,
    fi:0, ft:0, t:0, charged:!!opt.charged, travel:opt.travel||0, origin:p.x,
    claw:!!opt.claw, didHit:false, hop:name.indexOf('uppercut')===0
  };
  if(name==='jab'||name.indexOf('uppercut')===0){
    act.ms[0]=Math.min(act.ms[0], 0.05);
    if(opt.charged){
      const hitAt=[...m.impact][0];
      if(hitAt!=null) act.ms[hitAt]=(act.ms[hitAt]||0.08)+0.09;
    }
  }else act.ms[0]=Math.min(act.ms[0], 0.06);
  act.total=act.ms.reduce((s,v)=>s+v,0);
  phase='act';
  blend={from, t:0, dur:0.1};
  const nice=LABEL[name]||name;
  btn('move').textContent=(opt.charged?'CHARGED ':'')+(opt.claw?nice+' + PUNCH':nice);
}
function requestPunch(charged, force){
  const spec={charged, force};
  if(phase==='act'){
    queue=spec;
    if(act&&!act.claw) act.claw=true;
    return;
  }
  launchPunch(spec);
}
function launchPunch(spec){
  let name=spec.force;
  if(!name){name=CHAIN[combo%3]; combo++}
  else if(name==='uppercut_right') combo=0;
  else if(name==='uppercut_left') combo=2;
  queue=null;
  startMove(name, {charged:spec.charged, travel:spec.charged?30:18});
}
function finishAct(){
  const follow=queue;
  const chain=act&&act.claw&&!act.didChain&&!follow;
  queue=null;
  if(follow){launchPunch(follow); return}
  if(chain){act.didChain=true; launchPunch({charged:false}); return}
  const from=capture();
  act=null;
  phase=moveDir()?'run':'idle';
  blend={from, t:0, dur:0.14};
  btn('move').textContent=phase==='run'?'RUN':'GUARD';
}

function dummySpan(){
  const sheet=dummy.face<0?dummy.sheets.sd_idle:dummy.sheets.sd_idle_r;
  const f=sheet[0];
  return {l:dummy.x+dummy.ox-f.ax*RUN_SC-10, r:dummy.x+dummy.ox+(f.w-f.ax)*RUN_SC+14};
}
function connect(heavy){
  if(!act||act.didHit) return;
  act.didHit=true;
  hits++;
  btn('hits').textContent='HITS '+hits;
  shake=Math.max(shake, heavy?7:4);
  const away=-p.face;
  dummy.phase='hit'; dummy.heavy=heavy; dummy.fi=0; dummy.ft=0; dummy.ox=away*(heavy?26:16); dummy.bub=0.8;
  dummy.hop=heavy?78:act&&act.hop?46:0;
  floats.push({t:(act.charged?'CHARGED ':'')+(LABEL[act.name]||'HIT')+'!', x:p.x+p.face*30, y:GROUND-200, l:0.7, c:act.charged?'#ffe14d':'#fff'});
  act.freeze=heavy?0.07:0.05;
}
function tryHit(){
  if(!act||act.didHit||!act.impact.has(act.fi)) return;
  const reach=(act.reach[act.fi]||90)*BOX+(act.charged?28:18);
  const fist=p.x+p.face*reach;
  const span=dummySpan();
  const facing=p.face===Math.sign(dummy.x-p.x)||Math.abs(dummy.x-p.x)<100;
  if(facing&&fist>=span.l-24&&p.x+p.face*30<=span.r) connect(!!act.charged||!!act.hop);
}

function smooth(u){u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u)}
function rootAt(u){
  if(!act) return 0;
  if(act.name==='dash_forward'||act.name==='back_step'||act.name==='slip') return act.travel*smooth(Math.min(1,u/0.72));
  if(act.travel){
    const hit=Math.max(0.28, ([...act.impact][0]||2)/act.ms.length);
    if(u<hit) return act.travel*smooth(u/hit);
    return act.travel*(1-smooth((u-hit)/Math.max(0.2,1-hit)));
  }
  return 0;
}

function update(dt){
  if(!ready) return;
  shake*=Math.pow(0.05, dt);
  for(const f of floats) f.l-=dt;
  floats=floats.filter(f=>f.l>0);
  if(dummy.bub>0) dummy.bub-=dt;
  if(pendingQuick&&nowT>=pendingQuick.at){
    const q=pendingQuick; pendingQuick=null; fireQuick(q);
  }
  if(keys.punch){
    const held=nowT-punchAt;
    charge=held<=0.15?0:Math.max(0, Math.min(1,(held-0.15)/0.45));
    punchEl.classList.toggle('charge', charge>0.2);
  }
  if(blend){blend.t+=dt; if(blend.t>=blend.dur) blend=null}
  if(act&&act.freeze>0){
    act.freeze-=dt;
    stepDummy(0);
    return;
  }
  if(phase==='act'&&act){
    const u0=act.t/act.total;
    act.t+=dt; act.ft+=dt;
    const dur=act.ms[act.fi]||0.08;
    if(act.ft>=dur){
      act.ft-=dur; act.fi++;
      if(act.fi>=act.imgs.length-1){finishAct(); return}
      tryHit();
    }else if(act.impact.has(act.fi)) tryHit();
    const u=Math.min(1, act.t/act.total);
    p.x=act.origin+p.face*rootAt(u);
    clampX();
    if(queue&&u>0.58){const q=queue; queue=null; launchPunch(q); return}
    if(act.claw&&!act.didChain&&u>0.62&&(act.name==='dash_forward'||act.name==='back_step'||act.name==='slip'||act.name==='weave')){
      act.didChain=true; launchPunch({charged:false});
      return;
    }
  }else{
    const v=moveDir();
    if(v){p.face=v; if(phase!=='run'){blend={from:capture(), t:0, dur:0.12}; phase='run'; btn('move').textContent='RUN'} p.x+=v*400*dt; clampX(); runFt+=dt; if(runFt>=1/14){runFt=0; runFi=(runFi+1)%runFrames.length}}
    else if(phase==='run'){phase='idle'; blend={from:capture(), t:0, dur:0.16}; btn('move').textContent='GUARD'}
  }
  stepDummy(dt);
}
function stepDummy(dt){
  dummy.face=p.x<dummy.x?-1:1;
  dummy.hop=Math.max(0, dummy.hop-dt*dummy.hop*3.2-dt*40);
  if(dummy.phase==='hit'){
    dummy.ft+=dt;
    if(dummy.ft>=1/12){dummy.ft=0; dummy.fi++}
    const sheet=dummy.heavy?(dummy.face<0?dummy.sheets.sd_hit_heavy:dummy.sheets.sd_hit_heavy_r):(dummy.face<0?dummy.sheets.sd_hit_light:dummy.sheets.sd_hit_light_r);
    if(dummy.fi>=sheet.length){dummy.phase='idle'; dummy.fi=0; dummy.heavy=false}
    dummy.ox+=(0-dummy.ox)*Math.min(1, dt*6);
  }else{
    dummy.ft+=dt;
    const n=(dummy.face<0?dummy.sheets.sd_idle:dummy.sheets.sd_idle_r).length;
    dummy.fi=Math.floor(dummy.ft*12)%n;
    dummy.ox+=(0-dummy.ox)*Math.min(1, dt*8);
  }
  dummy.oy=dummy.hop>1?-dummy.hop:0;
}

function drawBox(img, x, face, alpha){
  if(!img) return;
  ctx.save();
  ctx.globalAlpha=alpha==null?1:alpha;
  ctx.translate(x, GROUND);
  ctx.scale(face*BOX, BOX);
  ctx.drawImage(img, -meta.foot[0], -meta.foot[1]);
  ctx.restore();
}
function drawRun(f, x, face, alpha){
  if(!f) return;
  ctx.save();
  ctx.globalAlpha=alpha==null?1:alpha;
  ctx.translate(x, GROUND);
  ctx.scale(face*RUN_SC, RUN_SC);
  ctx.drawImage(f.img, -f.ax, -f.ay);
  ctx.restore();
}
function drawSnap(s, x, alpha){
  if(!s) return;
  if(s.kind==='run') drawRun(s.f, x, s.face, alpha);
  else drawBox(s.img, x, s.face, alpha);
}
function drawPaddy(){
  const x=p.x;
  let curKind, curImg, curRun;
  if(phase==='act'&&act){curKind='box'; curImg=act.imgs[Math.min(act.fi, act.imgs.length-1)]}
  else if(phase==='run'){curKind='run'; curRun=runFrames[runFi%runFrames.length]}
  else {curKind='box'; curImg=guard}
  const u=blend?smooth(blend.t/blend.dur):1;
  if(blend&&u<1) drawSnap(blend.from, x, 1-u);
  if(curKind==='run') drawRun(curRun, x, p.face, blend?u:1);
  else drawBox(curImg, x, p.face, blend?u:1);
  if(charge>0.05&&phase!=='act'){
    ctx.save(); ctx.globalCompositeOperation='lighter';
    const R=36+28*charge, g=ctx.createRadialGradient(x, GROUND-70, 4, x, GROUND-70, R);
    g.addColorStop(0, `rgba(255,230,120,${0.15+0.45*charge})`);
    g.addColorStop(1, 'rgba(255,200,40,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x, GROUND-70, R, 0, 6.283); ctx.fill();
    ctx.restore();
  }
}
function drawDummy(){
  const sheets=dummy.sheets;
  const key=dummy.phase==='hit'
    ?(dummy.heavy?(dummy.face<0?'sd_hit_heavy':'sd_hit_heavy_r'):(dummy.face<0?'sd_hit_light':'sd_hit_light_r'))
    :(dummy.face<0?'sd_idle':'sd_idle_r');
  const sheet=sheets[key];
  const f=sheet[Math.max(0, Math.min(sheet.length-1, dummy.fi))];
  ctx.fillStyle='rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(dummy.x, GROUND+4, 52, 10, 0, 0, 6.28); ctx.fill();
  ctx.save(); ctx.translate(dummy.x+dummy.ox, GROUND+dummy.oy); ctx.scale(RUN_SC, RUN_SC); ctx.drawImage(f.img, -f.ax, -f.ay); ctx.restore();
  if(dummy.bub>0){
    ctx.save(); ctx.globalAlpha=Math.min(1, dummy.bub*3);
    ctx.font='bold 22px system-ui';
    const w=ctx.measureText('oof!').width+18, x=dummy.x-w/2, y=GROUND-210+dummy.oy;
    ctx.fillStyle='#fff'; ctx.strokeStyle='#1a0f3a'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(x,y,w,32,10):ctx.rect(x,y,w,32); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#3a2400'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('oof!', dummy.x, y+16); ctx.restore();
  }
}
function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#0d1226'; ctx.fillRect(0,0,cv.width,cv.height);
  const sx=(Math.random()-.5)*shake, sy=(Math.random()-.5)*shake;
  ctx.setTransform(scale,0,0,scale, offX+sx*scale, offY+sy*scale);
  ctx.imageSmoothingEnabled=true;
  const sky=ctx.createLinearGradient(0,0,0,VH);
  sky.addColorStop(0,'#030a2a'); sky.addColorStop(1,'#041140');
  ctx.fillStyle=sky; ctx.fillRect(-40,-40,VW+80,VH+80);
  if(arena.naturalWidth) ctx.drawImage(arena, 0, AIY, VW, VH);
  if(ready){
    ctx.fillStyle='rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(p.x, GROUND+4, 34, 8, 0, 0, 6.28); ctx.fill();
    drawDummy(); drawPaddy();
  }
  for(const f of floats){
    ctx.globalAlpha=Math.min(1, f.l*2);
    ctx.fillStyle=f.c; ctx.font='26px Bangers,Impact,sans-serif'; ctx.textAlign='center';
    ctx.fillText(f.t, f.x, f.y-(0.7-f.l)*30);
  }
  ctx.globalAlpha=1;
  if(!ready){
    ctx.fillStyle='#fff'; ctx.font='20px system-ui'; ctx.textAlign='center';
    ctx.fillText(bootErr||'Loading boxing test…', VW/2, VH/2);
  }
}

let last=0;
function loop(t){
  requestAnimationFrame(loop);
  let dt=(t-last)/1000; last=t;
  if(!(dt>0)) dt=0;
  dt=Math.min(0.033, dt);
  nowT+=dt;
  try{update(dt); draw()}catch(err){console.error('boxing test', err)}
}
requestAnimationFrame(loop);

window.TS={
  ready:false,
  hits:()=>hits,
  phase:()=>phase,
  move:()=>act?act.name:'',
  frame:()=>act?act.fi:-1,
  combo:()=>combo,
  charge:()=>charge,
  pos:()=>({x:p.x, face:p.face, dx:dummy.x}),
  dummy:()=>dummy.phase,
  hold(k, on){if(on&&!keys[k]) dirDown(k); if(!on&&keys[k]) dirUp(k); keys[k]=!!on; if(k==='left') lastLR=-1; if(k==='right') lastLR=1},
  tap(k){dirDown(k); keys[k]=true; dirUp(k); keys[k]=false},
  punch(hold){punchDown(); if(!hold) punchUp()},
  releasePunch:punchUp
};
})();
