// Practice Room only. Approved boxing sprites for base Paddy.
// Does not edit punch33.js, story mode, the old uppercut, or Combat Lab.
// Outside Practice (and in every other form) this file does nothing.
(function(){
if(typeof FORM!=='function'||typeof drawFrame!=='function'||typeof update!=='function'||typeof drawHUD!=='function')return;
const BOX=0.5;
const CHAIN=['jab','uppercut_left','uppercut_right'];
// Original Practice punches (punch33) run at 12 fps: a fresh jab reaches its hit
// on the 4th drawing (~1/4 s), a combo punch skips the guard and hits ~1/6 s
// later, the hit frame is not frozen again on top of hit-stop, and a buffered
// press cancels the recovery. These schedules use the same approved drawings,
// with the duplicate guards and extra crouches skipped so the snap matches.
const PUNCH={
  jab:{steps:[[1,70],[3,50],[4,85],[6,55]], hit:4, stop:0.03},
  uppercut_left:{steps:[[2,70],[4,45],[6,90],[8,55]], hit:6, stop:0.045},
  uppercut_right:{steps:[[3,70],[5,45],[7,90],[10,55]], hit:7, stop:0.045}
};
const DIRS=['left','right','up','down'];
const LABEL={jab:'JAB!',uppercut_left:'LEFT UPPERCUT!',uppercut_right:'RIGHT UPPERCUT!',dash_forward:'DASH!',back_step:'BACK STEP!',slip:'SLIP!',weave:'WEAVE!'};
let loaded=false, moves=null, foot=[210,408], guard=null;
let breathImgs=null, g2wImgs=null, breathT=0, intro=null, wasWeave=false;
let act=null, mode='guard', blend=null, queue=null, comboN=0;
let charge=0, punchAt=0, punchHeld=false;
const own={left:false,right:false,up:false,down:false};
const tapMem={};
let pending=null, lastLR=1, bootErr=null;

// The original practice room keeps its own punches. The approved moves are added
// by original-dodges.js, on the original inputs, in both the practice room and the levels.
function on(){return false}
function smooth(u){u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)}
function loadImage(src){
  return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error(src));im.src=src});
}
(async function boot(){
  try{
    const r=await fetch('assets/sprites/boxing_v1/approved_play/animation.json');
    if(!r.ok) throw new Error('animation.json '+r.status);
    const pack=await r.json();
    foot=pack.foot||foot;
    moves={};
    const base='assets/sprites/boxing_v1/approved_play/';
    for(const name in pack.moves){
      const m=pack.moves[name];
      const imgs=[];
      for(const rel of m.frames) imgs.push(await loadImage(base+rel));
      moves[name]={imgs, ms:m.durations_ms.map(v=>v/1000), impact:new Set(m.impact||[]), reach:m.reach_px||[]};
    }
    guard=moves.jab.imgs[0];
    loaded=true;
    const pad=i=>String(i).padStart(2,'0');
    const breath=[], lead=[];
    for(let i=0;i<28;i++) breath.push(await loadImage(base+'breath/frame_'+pad(i)+'.webp'));
    for(let i=0;i<5;i++) lead.push(await loadImage(base+'guard_to_weave/frame_'+pad(i)+'.png'));
    breathImgs=breath; g2wImgs=lead;
  }catch(err){
    bootErr=err&&err.message?err.message:String(err);
    console.error('practice boxing sprites failed to load', err);
  }
})();

function dirHeld(){
  if(own.left&&own.right) return lastLR;
  if(own.right) return 1;
  if(own.left) return -1;
  return 0;
}
function dirDown(k){
  if(!on()||act) return;
  const prev=tapMem[k];
  const t=performance.now()/1000;
  const dbl=!!(prev&&prev.up&&t-prev.t<0.30&&prev.up-prev.t<0.25);
  if(dbl){
    pending=null; tapMem[k]=null;
    const face=prev.face, claw=punchHeld||!!(typeof K!=='undefined'&&K.attack);
    const d=k==='right'?1:k==='left'?-1:0;
    if(d){ if(d===face) startMove('dash_forward',{travel:150,claw,face}); else startMove('back_step',{travel:-100,claw,face}); }
    else if(k==='down') startMove('weave',{claw,face});
    return;
  }
  tapMem[k]={t, up:0, face:p.face};
}
function dirUp(k){
  const L=tapMem[k]; if(!L||L.up) return;
  L.up=performance.now()/1000;
  if(L.up-L.t<0.15&&k!=='up') pending={k, at:L.up+0.16, face:L.face};
}
function fireQuick(q){
  if(!on()) return;
  const d=q.k==='right'?1:q.k==='left'?-1:0;
  const claw=punchHeld;
  if(q.k==='down'){if(!act) startMove('weave',{claw,face:q.face}); return}
  if(d&&d!==q.face){
    if(act&&act.name==='slip') startMove('back_step',{travel:-100,claw,face:q.face});
    else if(!act) startMove('slip',{travel:-48,claw,face:q.face});
  }
}
function punchDown(){
  if(!on()||punchHeld) return;
  punchHeld=true; punchAt=performance.now()/1000;
}
function punchUp(){
  if(!punchHeld) return;
  punchHeld=false;
  const held=performance.now()/1000-punchAt;
  charge=0;
  requestPunch(held>=0.3, own.up?'uppercut_right':null);
}
function startMove(name, opt){
  if(!moves||!moves[name]) return;
  opt=opt||{};
  const from=snapshot();
  const m=moves[name];
  const face=opt.face||p.face;
  const spec=PUNCH[name];
  let seq=spec?spec.steps.map(([fi,ms])=>[fi, ms/1000]):m.ms.slice(0,-1).map((s,i)=>[i, i===0?Math.min(s,0.06):s]);
  let stop=spec?spec.stop:0;
  if(spec&&opt.charged){seq=seq.map(([fi,s])=>[fi, fi===spec.hit?s+0.035:s]); stop=0.05}
  act={name, imgs:m.imgs, seq, si:0, fi:seq[0][0], ft:0, t:0, reach:m.reach,
    hitFi:spec?spec.hit:-1, stop, charged:!!opt.charged, travel:opt.travel||0, origin:p.x, face,
    claw:!!opt.claw, didHit:false, didChain:false, hop:name.indexOf('uppercut')===0};
  act.total=seq.reduce((s,st)=>s+st[1],0);
  // Combo punches cut in. A crossfade here is the mushy startup the old room skips.
  blend=spec?null:{from, t:0, dur:0.08};
  p.face=face; p.vx=0; p.vy=0;
  if(typeof say==='function') say((opt.charged?'CHARGED ':'')+ (LABEL[name]||name), opt.charged?'#ffe14d':'#fff');
}
function requestPunch(charged, force){
  if(!on()) return;
  if(act){queue={charged, force}; act.claw=true; return}
  launchPunch({charged, force});
}
function launchPunch(spec){
  let name=spec.force;
  if(!name){name=CHAIN[comboN%3]; comboN++}
  else if(name==='uppercut_right') comboN=0;
  queue=null;
  startMove(name, {charged:spec.charged, travel:spec.charged?30:18, face:p.face});
}
function finishAct(){
  const follow=queue;
  const chain=act&&act.claw&&!act.didChain&&!follow;
  queue=null;
  if(follow){launchPunch(follow); return}
  if(chain){act.didChain=true; launchPunch({charged:false}); return}
  const from=snapshot();
  act=null;
  blend={from, t:0, dur:0.14};
  mode=dirHeld()?'run':'guard';
}
function snapshot(){
  if(act) return {kind:'box', img:act.imgs[Math.min(act.fi, act.imgs.length-1)], face:act.face};
  if(mode==='run'&&typeof FR!=='undefined'&&FR.run) return {kind:'run', fr:FR.run[p.fi]||FR.run[0], face:p.face};
  return {kind:'box', img:guard, face:p.face};
}
function rootAt(u){
  if(!act) return 0;
  if(act.name==='dash_forward'||act.name==='back_step'||act.name==='slip') return act.travel*smooth(Math.min(1, u/0.72));
  if(!act.travel) return 0;
  const hitU=0.45;
  if(u<hitU) return act.travel*smooth(u/hitU);
  return act.travel*(1-smooth((u-hitU)/Math.max(0.2, 1-hitU)));
}
function tryHit(){
  if(!act||act.didHit||act.fi!==act.hitFi||typeof hitDummy!=='function') return;
  const reach=(act.reach[act.fi]||90)*BOX+(act.charged?28:18);
  const fist=p.x+p.face*reach;
  for(const d of dummies){
    if(!d||!d.alive||d.benched) continue;
    const facing=p.face===Math.sign(d.x-p.x)||Math.abs(d.x-p.x)<100;
    if(!facing||fist<d.x-110||p.x+p.face*30>d.x+70) continue;
    act.didHit=true;
    const move=act.hop?'bxpu':(act.charged?'bxx':'bxj1');
    hitDummy(d, move, p.face);
    if(act.hop) d.vy=Math.min(d.vy, act.charged?-640:-480);
    // punch33 adds a long freeze for its own power uppercut. This punch uses the short jab/cross stop instead.
    if(typeof hitstop!=='undefined') hitstop=act.stop||0.03;
    break;
  }
}
function steal(){
  if(window.KD47) KD47.req=null;
  if(window.KD48){KD48.req=null; if(KD48.H&&KD48.H.attack) KD48.H.attack.down=false}
  if(typeof P!=='undefined'){delete P.attack; delete P.dash}
}
function sync(dt, x0){
  if(pending&&performance.now()/1000>=pending.at){const q=pending; pending=null; fireQuick(q)}
  if(punchHeld){
    const held=performance.now()/1000-punchAt;
    charge=held<=0.15?0:Math.max(0, Math.min(1,(held-0.15)/0.45));
  }
  if(blend){blend.t+=dt; if(blend.t>=blend.dur) blend=null}
  if(act){
    act.t+=dt; act.ft+=dt;
    const step=act.seq[act.si];
    const dur=step?step[1]:0.08;
    if(act.ft>=dur){
      const wasHit=step&&step[0]===act.hitFi;
      act.ft=0; act.si++;
      if(wasHit&&queue){const q=queue; queue=null; launchPunch(q); return}
      if(act.si>=act.seq.length){finishAct(); return}
      act.fi=act.seq[act.si][0];
      tryHit();
    }else if(act.fi===act.hitFi) tryHit();
    const u=Math.min(1, act.t/Math.max(0.05, act.total));
    p.face=act.face;
    p.state='normal'; p.vx=0; p.vy=0; p.ground=true; p.y=GROUND;
    p.x=typeof clampX==='function'?clampX(act.origin+p.face*rootAt(u)):act.origin+p.face*rootAt(u);
    if(act.claw&&!act.didChain&&!queue&&u>0.55&&(act.name==='dash_forward'||act.name==='back_step'||act.name==='slip'||act.name==='weave')){
      act.didChain=true; launchPunch({charged:false});
    }
    return;
  }
  const v=dirHeld();
  if(v){
    p.face=v;
    if(Math.abs(p.x-x0)<1) p.x=(typeof clampX==='function'?clampX(p.x+v*420*dt):p.x+v*420*dt);
    if(p.anim!=='run') setAnim('run', true);
    p.vx=v*420; p.ground=true; p.y=Math.min(p.y, GROUND);
    mode='run';
  }else{
    if(mode==='run'){blend={from:snapshot(), t:0, dur:0.16}; }
    mode='guard';
    if(p.ground) p.vx=0;
  }
  if(!act){
    for(const d of dummies){
      if(!d||!d.alive||d.benched) continue;
      const gap=mode==='run'?108:86;
      if(Math.abs(p.x-d.x)<gap){
        const side=Math.sign(p.x-d.x)||-p.face||-1;
        p.x=d.x+side*gap;
      }
    }
    if(typeof clampX==='function') p.x=clampX(p.x);
  }
}
function hiding(){return on()&&(!!act||mode!=='run'||!!blend)}
// Practice Room only. The breathing loop replaces the static guard while he is idle.
// Any key drops it the same frame, so the breath never adds input lag.
const BREATH_DT=0.143, LEAD_DT=0.04, JAB=0.5*1.0282;
function inRoom(){
  try{return !!(window.PRACTICE&&PRACTICE.on)&&typeof FORM==='function'&&FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(e){return false}
}
function guardIdle(){
  if(!p.ground) return false;
  if(p.state&&p.state!=='normal'&&p.state!=='land'&&p.state!=='stop') return false;
  if(window.CX&&CX.pose) return false;
  if(window.OD&&OD.move&&OD.move()) return false;
  if(Math.abs(p.vx||0)>30) return false;
  if(typeof K!=='undefined'&&(K.left||K.right||K.up||K.down||K.attack||K.jump||K.special||K.tail||K.blink)) return false;
  return true;
}
function tickBreath(dt){
  if(!inRoom()||!breathImgs){intro=null; wasWeave=false; return}
  const weaving=!!(window.OD&&OD.move&&OD.move()==='weave');
  if(weaving&&!wasWeave&&g2wImgs) intro={t:0};
  wasWeave=weaving;
  if(intro){
    intro.t+=dt;
    const other=typeof K!=='undefined'&&(K.attack||K.jump||K.special||K.tail||K.blink||K.up||K.left||K.right);
    if(other||intro.t>=g2wImgs.length*LEAD_DT) intro=null;
  }
  if(!intro&&guardIdle()) breathT+=dt;
  window.__pbLead=!!intro;
}
function covering(){return inRoom()&&breathImgs&&(!!intro||guardIdle())}
function drawApproved(img, scale){
  if(!img||!img.naturalWidth) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale((p.face||1)*scale, scale);
  ctx.drawImage(img, -foot[0], -foot[1]);
  ctx.restore();
}
function paintBreath(){
  if(!covering()) return;
  if(intro&&g2wImgs){
    const i=Math.min(g2wImgs.length-1, Math.floor(intro.t/LEAD_DT));
    drawApproved(g2wImgs[i], JAB);
    return;
  }
  const i=Math.floor(breathT/BREATH_DT)%breathImgs.length;
  drawApproved(breathImgs[i], JAB);
}

const _drawFrame=drawFrame;
drawFrame=function(f,x,y,face,alpha){
  if(hiding()&&Math.abs(x-p.x)<4&&Math.abs(y-p.y)<8) return;
  if(hiding()&&Math.abs(x-(p.prevX||p.x))<4&&Math.abs(y-(p.prevY||p.y))<8) return;
  if(covering()&&Math.abs(x-p.x)<30&&Math.abs(y-p.y)<30) return;
  return _drawFrame.apply(this, arguments);
};
const _hud=drawHUD;
drawHUD=function(){
  if(hiding()){try{paint()}catch(e){if(!paint.err){paint.err=1;console.error('practice boxing draw', e)}}}
  else if(covering()){try{paintBreath()}catch(e){if(!paintBreath.err){paintBreath.err=1;console.error('breath', e)}}}
  return _hud.apply(this, arguments);
};
const _update=update;
update=function(dt){
  const x0=p.x;
  if(on()) steal();
  const r=_update.apply(this, arguments);
  if(on()){try{sync(dt, x0)}catch(e){if(!sync.err){sync.err=1;console.error('practice boxing', e)}}}
  else {try{tickBreath(dt)}catch(e){if(!tickBreath.err){tickBreath.err=1;console.error('breath', e)}}}
  return r;
};
const _start=startClaw;
startClaw=function(){
  if(on()){if(!act) launchPunch({charged:charge>=0.85, force:own.up?'uppercut_right':null}); return}
  return _start.apply(this, arguments);
};

function drawBox(img, x, face, alpha){
  if(!img||!img.naturalWidth) return;
  ctx.save();
  if(alpha!=null) ctx.globalAlpha=alpha;
  ctx.translate(x, p.y||GROUND);
  ctx.scale(face*BOX, BOX);
  ctx.drawImage(img, -foot[0], -foot[1]);
  ctx.restore();
}
function drawRunFr(fr, x, face, alpha){
  const im=fr&&window.IMG&&IMG[fr.f];
  if(!im||!im.naturalWidth) return;
  ctx.save();
  if(alpha!=null) ctx.globalAlpha=alpha;
  ctx.translate(x, p.y||GROUND);
  ctx.scale(face*(typeof SC!=='undefined'?SC:0.8), (typeof SC!=='undefined'?SC:0.8));
  ctx.drawImage(im, -fr.ax, -fr.ay);
  ctx.restore();
}
function drawSnap(s, alpha){
  if(!s) return;
  if(s.kind==='run') drawRunFr(s.fr, p.x, s.face, alpha);
  else drawBox(s.img, p.x, s.face, alpha);
}
function paint(){
  const u=blend?smooth(Math.min(1, blend.t/blend.dur)):1;
  if(blend&&u<1) drawSnap(blend.from, 1-u);
  if(act) drawBox(act.imgs[Math.min(act.fi, act.imgs.length-1)], p.x, act.face, blend?u:1);
  else drawBox(guard, p.x, p.face, blend?u:1);
  if(charge>0.05&&!act){
    ctx.save(); ctx.globalCompositeOperation='lighter';
    const R=40+30*charge, g=ctx.createRadialGradient(p.x, p.y-80, 4, p.x, p.y-80, R);
    g.addColorStop(0, `rgba(255,230,120,${0.2+0.45*charge})`);
    g.addColorStop(1,'rgba(255,200,40,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x, p.y-80, R, 0, 6.28); ctx.fill(); ctx.restore();
  }
}

document.addEventListener('keydown', e=>{
  if(e.repeat||!on()) return;
  const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
  const k=map[e.code];
  if(k){if(!own[k]) dirDown(k); own[k]=true; if(k==='left'||k==='right') lastLR=k==='left'?-1:1}
  else if(e.code==='KeyX'||e.code==='KeyJ') punchDown();
}, true);
document.addEventListener('keyup', e=>{
  const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
  const k=map[e.code];
  if(k){if(own[k]) dirUp(k); own[k]=false}
  else if(e.code==='KeyX'||e.code==='KeyJ') punchUp();
}, true);
document.addEventListener('pointerdown', e=>{
  if(!on()) return;
  const b=e.target&&e.target.closest&&e.target.closest('#ui .b[data-k]');
  if(!b) return;
  const k=b.dataset.k;
  if(k==='attack') punchDown();
  else if(DIRS.includes(k)){if(!own[k]) dirDown(k); own[k]=true; if(k==='left'||k==='right') lastLR=k==='left'?-1:1}
}, true);
document.addEventListener('pointerup', e=>{
  const b=e.target&&e.target.closest&&e.target.closest('#ui .b[data-k]');
  const k=b&&b.dataset.k;
  if(k==='attack'||(!b&&punchHeld&&e.target&&e.target.closest&&!e.target.closest('#ui .b[data-k]'))) punchUp();
  if(k&&DIRS.includes(k)){if(own[k]) dirUp(k); own[k]=false}
}, true);
document.addEventListener('pointercancel', ()=>{if(punchHeld) punchUp(); DIRS.forEach(k=>{own[k]=false})}, true);

window.PB={
  get ready(){return loaded},
  get err(){return bootErr},
  get breath(){return !!(breathImgs&&breathImgs.length===28&&g2wImgs&&g2wImgs.length===5)},
  on, move:()=>act?act.name:'',
  frame:()=>act?act.fi:-1,
  phase:()=>act?'act':mode,
  hitsNote:()=>act&&act.didHit
};
})();
