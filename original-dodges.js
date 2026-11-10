// Approved dodges and uppercuts added on top of the original game.
// Base Paddy only: the rooftop practice arena, the Practice Room, and the story levels.
// Does not replace run, the claw combo, story cutscenes, or the old tap uppercut.
// punch33.js is not edited. Sprites: assets/sprites/boxing_v1/approved_play/
(function(){
const BOX=0.5;
const PUNCH={
  // New left jab (10 frames). The opening guard is already on screen, so the
  // punch starts on the stance. Each step uses the approved duration. A press
  // after the hit skips the recovery, the same way a claw string does.
  jab:{steps:[[1,60],[2,100],[3,50],[4,40],[5,130],[6,60],[7,70],[8,60],[9,200]], hit:5, stop:0.03, fly:1},
  uppercut_left:{steps:[[0,40],[1,32],[2,32],[3,32],[4,36],[5,44],[6,80],[7,44],[8,36],[9,32],[10,32],[11,36]], hit:6, stop:0.05, fly:1},
  uppercut_right:{steps:[[0,40],[1,32],[2,32],[3,32],[4,36],[5,40],[6,44],[7,80],[8,44],[9,36],[10,32],[11,36]], hit:7, stop:0.05, fly:1},
  upper_quick_l:{steps:[[2,32],[3,32],[4,36],[5,40],[6,72],[7,40],[8,36],[9,32]], hit:6, stop:0.04, fly:1},
  upper_quick_r:{steps:[[3,32],[4,32],[5,36],[6,40],[7,72],[8,40],[9,36],[10,32]], hit:7, stop:0.04, fly:1}
};
const FAST={
  dash_forward:[1,2,3,4,5,6],
  back_step:[1,2,3,4,5,6],
  weave:[1,2,3,4,5],
  slip:[1,2,3,4]
};
const LABEL={jab:'BIG JAB!',uppercut_left:'LEFT UPPERCUT!',uppercut_right:'RIGHT UPPERCUT!',dash_forward:'DASH!',back_step:'BACK DASH!',weave:'WEAVE!',slip:'SLIP!'};
let loaded=false, moves=null, foot=[210,408], bootErr=null;
let act=null, follow=null, wait=null, feint=null, upN=0, flyN=0, oldUpper=false, link=false, chainUpper=false, upWait=false, backWait=null;
const notes=[];
function note(s){notes.push(s); if(notes.length>24) notes.shift()}
let lvl=null;
const arena=()=>{try{return typeof FORM==='function'&&typeof p!=='undefined'&&typeof dummies!=='undefined'}catch(e){return false}};
function base(){
  try{return FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(e){return false}
}
function now(){return performance.now()/1000}
function loadImage(src){
  return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error(src));im.src=src});
}
(async function boot(){
  try{
    const r=await fetch('assets/sprites/boxing_v1/approved_play/animation.json?v=9');
    if(!r.ok) throw new Error('animation.json '+r.status);
    const pack=await r.json();
    foot=pack.foot||foot;
    moves={};
    const baseUrl='assets/sprites/boxing_v1/approved_play/';
    for(const name in pack.moves){
      const m=pack.moves[name];
      const imgs=[];
      for(const rel of m.frames) imgs.push(await loadImage(baseUrl+rel+'?v=9'));
      moves[name]={imgs};
    }
    loaded=true;
  }catch(err){
    bootErr=err&&err.message?err.message:String(err);
    console.error('approved dodge sprites failed to load', err);
  }
})();

function sayMove(name, fly){
  const t=(fly?'FLYING ':'')+(LABEL[name]||name);
  try{if(typeof say==='function') say(t, fly?'#ffe14d':'#fff')}catch(e){}
  try{if(lvl&&lvl.msg) lvl.msg(t, fly?'#ffe14d':'#fff')}catch(e){}
}
function seqOf(name, ms){
  const frames=FAST[name];
  if(frames&&frames.length) return frames.map(fi=>[fi, ms||0.036]);
  const spec=PUNCH[name];
  if(!spec||!spec.steps||!spec.steps.length) return [[0,0.05]];
  return spec.steps.map(([fi,t])=>[fi, t/1000]);
}
function begin(kind, name, face, opt){
  if(!moves||!moves[name]) return;
  opt=opt||{};
  const seq=seqOf(name, kind==='dodge'?0.055:0.036);
  const spec=PUNCH[name];
  act={kind, name, imgs:moves[name].imgs, seq, si:0, fi:seq[0][0], ft:0, t:0,
    face:face||1, hitFi:spec?spec.hit:-1, stop:spec?spec.stop:0, fly:!!(spec&&spec.fly&&opt.fly),
    didHit:false, buf:false, level:!!opt.level, y0:opt.y0, vx:opt.vx||0, dir:opt.dir||face||1};
  follow=null;
  const who=opt.level&&lvl?lvl.p:p;
  who.face=act.face; who.vx=act.vx; who.vy=0;
  if(opt.level){who.state='od'; who.mv=null}
  else{who.state='od'; who.t=0; who.ground=true}
  sayMove(name, act.fly);
}
function stepBack(){
  if(!backWait) return;
  const keys=backWait.level&&lvl?lvl.K:(typeof K!=='undefined'?K:{});
  const who=backWait.level&&lvl?lvl.p:p;
  const held=!!(backWait.key&&keys&&keys[backWait.key]);
  const age=now()-backWait.t;
  if(held&&age>=0.14){
    const f=backWait.face, lv=backWait.level;
    backWait=null;
    startDash(false, f, lv);
    try{if(lv&&lvl.msg) lvl.msg('BACK DASH!','#fff'); else if(typeof say==='function') say('BACK DASH!','#fff')}catch(e){}
  }else if(!held){
    const f=backWait.face, lv=backWait.level;
    backWait=null;
    if(who){who.face=-(f||1); if(window.PL) PL.rest=who.face}
    try{if(lv&&lvl.msg) lvl.msg('TURN!','#fff'); else if(typeof say==='function') say('TURN!','#fff')}catch(e){}
  }
}
function startDash(fwd, face, level){
  const dir=fwd?face:-face;
  const speed=fwd?900:-820;
  begin('dash', fwd?'dash_forward':'back_step', face, {level, vx:dir>0?Math.abs(speed):-Math.abs(speed), dir, y0:level&&lvl?lvl.p.y:undefined, fwd});
  if(!act) return;
  act.fwd=!!fwd;
  if(!level){ p.dashStart=(typeof now==='number'?now:performance.now()/1000); }
  if(!level&&typeof sparks!=='undefined'){
    for(let i=0;i<6;i++) sparks.push({x:p.x-dir*20, y:p.y-40-Math.random()*80, vx:-dir*(200+Math.random()*200), vy:(Math.random()-.5)*40, l:.25, c:'#fff'});
  }
}
function startDodge(which, face, level){
  begin('dodge', which, face, {level, vx:which==='slip'?-face*280:face*40, dir:face, y0:level&&lvl?lvl.p.y:undefined});
  const who=level&&lvl?lvl.p:p;
  who.inv=Math.max(who.inv||0, 0.2);
  if(!level) who.noFlick=true;
}
function nextUpper(){const name=upN%2?'uppercut_right':'uppercut_left'; upN++; return name}
function nextFly(){const name=flyN%2?nextUpper():'jab'; flyN++; return name}
function startPunch(name, opt){
  opt=opt||{};
  const face=(opt.level&&lvl?lvl.p.face:p.face);
  begin('punch', name, face, {level:!!opt.level, fly:opt.fly!==false&&!!PUNCH[name].fly, vx:face*(opt.fly?420:80), y0:opt.level&&lvl?lvl.p.y:undefined, dir:face});
  if(act) act.fly=opt.fly===true?'room':(opt.fly||false);
}
function showWind(face, level){
  if(act&&act.kind==='wind'){act.face=face||act.face; return}
  begin('wind','uppercut_left', face||1, {level:!!level, vx:0, fly:false, y0:level&&lvl?lvl.p.y:undefined});
  if(!act) return;
  act.kind='wind'; act.seq=[[0,0.08],[1,0.08],[2,2.4]]; act.si=0; act.fi=0; act.hitFi=-1; act.vx=0;
}
function throwUpper(face, charged, level){
  const name=nextUpper();
  if(level&&lvl) lvl.p.face=face||lvl.p.face;
  startPunch(name, {fly:false, level:!!level});
  if(!act) return;
  act.face=face||act.face;
  const right=name==='uppercut_right';
  const seq=charged
    ?(right?[[2,0.05],[3,0.05],[4,0.045],[5,0.05],[6,0.05],[7,0.12],[8,0.1],[9,0.06],[10,0.05]]:[[2,0.05],[3,0.05],[4,0.05],[5,0.05],[6,0.13],[7,0.1],[8,0.06],[9,0.05]])
    :(right?[[3,0.04],[4,0.04],[5,0.04],[6,0.05],[7,0.1],[8,0.05],[9,0.04],[10,0.04]]:[[2,0.04],[3,0.04],[4,0.04],[5,0.05],[6,0.1],[7,0.05],[8,0.04],[9,0.04]]);
  act.seq=seq; act.si=0; act.fi=seq[0][0]; act.hitFi=right?7:6; act.riseFi=charged?(right?5:4):-1; act.ft=0; act.didHit=false;
  if(charged){act.launch=true; try{ if(typeof texts!=='undefined') texts.length=0 }catch(e){} }
}
function stepAct(dt){
  if(!act) return;
  // Left jab only: remember a press, then drop the recovery once the hit has shown.
  if(act.kind==='punch'&&act.name==='jab'&&!act.level){
    if(typeof P!=='undefined'&&P.attack){act.buf=true; delete P.attack}
    if(act.buf&&act.didHit&&act.fi!==act.hitFi){
      finishAct();
      if(typeof P!=='undefined') P.attack=1;
      return;
    }
  }
  act.t+=dt; act.ft+=dt;
  const step=act.seq[act.si];
  const dur=step?step[1]:0.05;
    if(act.ft>=dur){
    act.ft=0; act.si++;
    if(act.si>=act.seq.length){
      if(act.kind==='wind'){act.si=act.seq.length-1; act.fi=act.seq[act.si][0]; return}
      if(act.launch&&p&&!p.ground){act.si=act.seq.length-1; act.fi=act.seq[act.si][0]; act.hold=1; return}
      finishAct(); return;
    }
    act.fi=act.seq[act.si][0];
    if(act.fi===act.hitFi) landHit();
  }
  if(act.kind==='dash') act.vx=act.dir*(act.fwd?900:820);
  else if(act.kind==='dodge') act.vx=act.name==='slip'?-act.face*280:(act.name==='weave'?act.face*140:act.face*80);
  else if(act.kind==='punch') act.vx=act.face*(act.t<0.12?380:60);
}
function finishAct(){
  const done=act; act=null;
  const who=done.level&&lvl?lvl.p:p;
  if(done.kind==='dash'||done.kind==='dodge') follow={kind:done.kind, t:now(), fwd:!!done.fwd};
  if(done.kind==='punch'&&/^upper/.test(done.name)) chainUpper=false;
  if(done.level){who.state='normal'; who.vx=0; who.vy=0}
  else{who.state='normal'; who.t=0; who.vx=who.face*160; who.noFlick=false}
  if(done.buf&&done.kind==='punch'&&!done.level){who.keepCombo=who.combo||0; who.keepT=0.35}
}
function landHit(){
  if(!act||act.didHit||act.kind!=='punch') return;
  act.didHit=true;
  const fly=act.fly===true?'room':act.fly;
  if(act.level) hitLevel(fly);
  else hitArena(fly);
  if(!act.level&&typeof hitstop!=='undefined') hitstop=act.stop||0.04;
}
function hitArena(fly){
  if(typeof hitDummy!=='function'||typeof dummies==='undefined') return;
  const room=fly==='room', counter=fly==='counter';
  const move=room?'odfly':'odup';
  for(const d of dummies){
    if(!d||!d.alive||d.benched) continue;
    const dx=(d.x-p.x)*p.face;
    const popSoon=!!(act&&act.launch);
    // Practice only: a punch that faces the other way must not connect, and a grounded swing
    // cannot reach a dummy floating over his head.
    if(window.PRACTICE&&PRACTICE.on&&typeof FORM==='function'&&FORM()===0){
      if(dx<-12) continue;
      if(p.ground&&!popSoon&&(dx>155||d.y<p.y-80)) continue;
    }
    if(dx<-50||dx>(room?220:popSoon?260:180)) continue;
    if(!popSoon&&Math.abs((d.y||0)-(p.y||0))>220) continue;
    if(popSoon&&(d.y||0)<p.y-260) continue;
    hitDummy(d, move, p.face);
    const pop=!!(act&&act.launch);
    d.vx=p.face*(room?1600:pop?80:counter?700:180);
    d.vy=pop?-1160:room?-360:counter?-180:-420;
    d.fl=pop?1:room?0.55:0.3;
    if(pop&&d.sp){d.ps='air'; d.pt=0; d.st='air'; d.y=Math.min(d.y, (typeof GROUND==='number'?GROUND:d.y)-4)}
    if(typeof shake!=='undefined') shake=Math.max(shake, pop?4:room?3:2);
    break;
  }
}
function hitLevel(fly){
  if(!lvl||!lvl.p) return;
  const room=fly==='room', counter=fly==='counter';
  const p0=lvl.p, dir=p0.face, reach=room?220:180;
  const list=lvl.enemies||[];
  for(const e of list){
    if(!e||!e.alive) continue;
    const dx=(e.x-p0.x)*dir;
    if(dx<-40||dx>reach+((e.w||40)/2)||Math.abs(e.y-p0.y)>(e.h||80)+30) continue;
    try{lvl.hitEnemy(e, dir, {kb:room?1800:counter?1000:700, launch:room?-220:-120, dmg:1})}catch(err){}
    e.vx=dir*(room?1800:counter?1000:700);
    e.vy=(act&&act.launch)?-920:room?-220:counter?-160:-120;
    e.hurt=room?0.45:0.32;
    if(e.fly) e.sw={st:'stun', t:0.75};
  }
  const b=lvl.boss;
  if(b&&b.alive){
    const dx=(b.x-p0.x)*dir;
    if(dx>-50&&dx<reach+80&&Math.abs(b.y-p0.y)<(b.h||200)){
      try{lvl.bossHit(1)}catch(err){}
      b.x+=dir*(fly?160:80);
    }
  }
}

function inCombo(){
  if(!arena()||!base()) return false;
  if(p.state==='claw'&&(p.combo||0)>0) return true;
  if((p.keepT||0)>0&&(p.keepCombo||0)>0) return true;
  if(p.state==='ofeint') return true;
  return false;
}
function startFeint(){
  delete P.special;
  feint={t:0, combo:p.state==='claw'?p.combo:(p.keepCombo||p.combo||0), buf:false, up:!!(K.up)};
  p.state='ofeint'; p.t=0; p.vx=p.face*240; p.vy=0; p.ground=true;
  if(typeof setAnim==='function') setAnim(typeof FR!=='undefined'&&FR.k_meow?'k_meow':'meow', true);
  if(typeof say==='function') say('FEINT!','#ffe9a8');
}
function stepFeint(){
  if(!feint) return;
  if(P.attack){feint.buf=true; feint.up=!!(K.up||K.jump); delete P.attack}
  if(P.special) delete P.special;
  p.state='ofeint'; p.vx=p.face*180; p.vy=0;
  if(p.t>=(feint.buf?0.1:0.14)){
    const f=feint; feint=null;
    p.state='normal'; p.combo=f.combo; p.keepCombo=f.combo; p.keepT=0.45; p.vx=p.face*60;
    if(f.buf){P.attack=1; link=true}
  }
}

function preArena(){
  link=false;
  if(!arena()||!loaded||!base()){if(arena()&&act&&!act.level) act=null; return}
  if(p.state==='hurt'||p.state==='respawn'){act=null; feint=null; wait=null; return}
  if(window.KD47&&KD47.req&&!act&&!feint){
    const q=KD47.req;
    if(q.k==='fwd'||q.k==='down'){
      const claw=!!(K.attack||P.attack);
      const room=!!(window.PRACTICE&&PRACTICE.on);
      if(room&&claw){KD47.req=null; delete P.dash}
      else{
        KD47.req=null; delete P.dash;
        if(q.k==='down'||claw) startDodge(q.k==='down'?'weave':'slip', q.face, false);
        else startDash(true, q.face, false);
      }
    }
  }
  if(P.attack) note('atk '+p.state+' a='+(act?act.kind:'-')+' f='+(follow?follow.kind:'-')+' age='+(follow?(now()-follow.t).toFixed(2):'-'));
  if(act&&!act.level&&P.attack&&(act.kind==='dash'||act.kind==='dodge')){
    delete P.attack; note('chain '+act.kind);
    startPunch(act.kind==='dash'?nextFly():'jab', {fly:act.kind==='dash'?'room':'counter'});
  }else if(!act&&follow&&P.attack&&now()-follow.t<0.4&&base()){
    delete P.attack; note('follow '+follow.kind);
    startPunch(follow.kind==='dash'?nextFly():'jab', {fly:follow.kind==='dash'?'room':'counter'});
    follow=null;
  }
  if(feint) stepFeint();
  else if(!act&&inCombo()&&P.special) startFeint();
  if(!act&&chainUpper) chainUpper=false;
  const upClaw=!(window.PL&&PL.owns)&&K.up&&K.attack&&p.ground&&!p.wall&&!act&&!feint&&!link;
  const roomUp=!!(window.PRACTICE&&PRACTICE.on);
  const heldUp=(()=>{const h=window.KD48&&KD48.H&&KD48.H.attack;return h&&h.down?now()-h.t:0})();
  const inString=p.state==='claw'||!!(window.P33&&P33.a);
  // Practice Room: a quick Up+Claw stays in the string as a grounded uppercut.
  // A real hold from a standstill still becomes the rising launcher below.
  if(upClaw&&!(roomUp&&(heldUp<0.32||inString))){
    delete P.attack; delete P.jump; upWait=true;
    const h=window.KD48&&KD48.H&&KD48.H.attack;
    const held=h&&h.down?now()-h.t:0.02;
    if(held>=0.09){
      upWait=false;
      if(window.KD48) KD48.ch=null;
      if(p.state==='kcharge') p.state='normal';
      note('upper '+held.toFixed(2));
      startPunch(nextUpper(), {fly:false});
    }
  }else if(upWait&&!K.attack){
    upWait=false;
    if(p.ground&&!act&&typeof uppercut==='function'){note('old upper'); uppercut()}
  }
  if(act&&!act.level){p.state='od'; if(!act.launch){p.vx=act.vx; p.vy=0}}
}
function postArena(dt){
  if(!arena()||!loaded||!base()) return;
  if(p.state==='hurt'||p.state==='respawn'){act=null; feint=null; return}
  if(feint){p.state='ofeint'; p.vy=0; const want=typeof FR!=='undefined'&&FR.k_meow?'k_meow':'meow'; if(p.anim!==want&&typeof setAnim==='function') setAnim(want, true)}
  if(!act||act.level) return;
  stepAct(dt);
  if(!act) return;
  if(act.launch){
    p.state='od';
    if(act.fi>=(act.riseFi==null?0:act.riseFi)){
      if(!act.jumped){act.jumped=1; p.ground=false; p.vy=-1120; p.vx=p.face*120; p.jumps=Math.max(p.jumps||0,1)}
    }else{p.vy=0; p.ground=true; p.vx=act.face*30}
    if(act.hold&&p.ground){finishAct(); return}
    if(act.fi===act.hitFi) landHit();
    return;
  }
  p.state='od'; p.vx=act.vx; p.vy=0; p.ground=true;
  if(act.name==='back_step') p.face=act.face;
  if(act.fi===act.hitFi) landHit();
}

if(arena()&&typeof r9Pre==='function'){
  if(typeof KB!=='undefined'){
    KB.odfly=[2400,-460,.7,.04];
    KB.odup=[160,-520,.32,.045];
  }
  const _pre=r9Pre;
  r9Pre=function(dt){try{preArena()}catch(e){if(!preArena.err){preArena.err=1;console.warn('od',e)}}
    const r=_pre.apply(this, arguments);
    try{postArena(dt)}catch(e){if(!postArena.err){postArena.err=1;console.warn('od',e)}}
    return r};
  const _up=update;
  update=function(dt){const r=_up.apply(this, arguments);
    try{if(act&&!act.level&&p.state==='od'&&(!act.launch||!act.jumped)){p.vy=0; p.ground=true; if(typeof floorAt==='function') p.y=floorAt(p.x)}}catch(e){}
    return r};
  const _df=drawFrame;
  drawFrame=function(f,x,y,face,alpha){
    if(window.__odCover&&act&&act.imgs){
      const img=act.imgs[Math.min(act.fi||0, act.imgs.length-1)];
      if(img&&img.naturalWidth&&Math.abs((x||0)-p.x)<8&&Math.abs((y||0)-p.y)<14) return;
    }
    return _df.apply(this, arguments);
  };
  const _draw=draw;
  draw=function(){window.__odCover=!!(act&&!act.level&&loaded); const r=_draw.apply(this, arguments); window.__odCover=false; return r};
  const _fx=drawFx;
  drawFx=function(){try{if(act&&!act.level&&!window.__pbLead) paint(p.x, p.y, ctx)}catch(e){if(!paint.err){paint.err=1;console.warn('od draw',e)}} _fx.apply(this, arguments)};
}
function paint(x, y, c){
  if(!c||!act||!act.imgs) return;
  const img=act.imgs[Math.min(act.fi, act.imgs.length-1)];
  if(!img||!img.naturalWidth) return;
  c.save();
  c.globalAlpha=1;
  c.globalCompositeOperation='source-over';
  c.translate(x, y);
  c.scale((act.face||1)*BOX, BOX);
  c.drawImage(img, -foot[0], -foot[1]);
  c.restore();
}

window.OD={
  get ready(){return loaded},
  get err(){return bootErr},
  move(){return act?act.name:(feint?'feint':'')},
  backDash(face, level){startDash(false, face||1, !!level)},
  backPending(){return !!backWait},
  trace(){return notes.slice()},
  claimLevel(q){
    if(!loaded||!lvl||!q) return false;
    if(q.k!=='fwd'&&q.k!=='back'&&q.k!=='down') return false;
    if(q.k==='back'){backWait={t:now(), face:q.face||1, key:q.key||(q.face>0?'left':'right'), level:true}; return true}
    const claw=!!(lvl.K&&lvl.K.attack);
    if(q.k==='down'||claw) startDodge(q.k==='down'?'weave':'slip', q.face, true);
    else startDash(true, q.face, true);
    if(lvl.P){delete lvl.P.down; delete lvl.P.attack}
    return true;
  },
  levelTick(dt, api){
    lvl=api;
    if(!loaded||!lvl||!lvl.p) return;
    const K=lvl.K, P=lvl.P, who=lvl.p;
    if(who.state==='hurt'||who.state==='climb'||who.state==='ledge'){if(act&&act.level) act=null; backWait=null; return}
    stepBack();
    if(act&&act.level){
      if(P.attack&&(act.kind==='dash'||act.kind==='dodge')){P.attack=0; startPunch(act.kind==='dash'?nextFly():'jab', {fly:act.kind==='dash'?'room':'counter', level:true})}
      stepAct(dt);
      if(act&&act.level){who.state='od'; if(act.launch){if(!act.jumped){act.jumped=1; who.ground=false; who.vy=-860; who.vx=who.face*180; who.jumps=2} } else {who.vx=act.vx; who.vy=0} if(act.name==='back_step') who.face=act.face; if(act.fi===act.hitFi) landHit()}
      return;
    }
    if(follow&&P.attack&&now()-follow.t<0.4){P.attack=0; startPunch(follow.kind==='dash'?nextFly():'jab', {fly:follow.kind==='dash'?'room':'counter', level:true}); follow=null; return}
    if(!act&&chainUpper) chainUpper=false;
    if(act&&act.level&&act.kind==='wind'){
      if(K.up&&K.attack){stepAct(dt); who.state='od'; who.vx=0; who.vy=0; who.face=act.face; return}
      const face=act.face, held=now()-(act.windT||now()); act=null;
      who.face=face; throwUpper(face, held>=0.2, true); return;
    }
    if(who.ground&&K.up&&K.attack&&!act&&(who.state==='normal'||who.state==='od')&&!(who.mv&&who.mv.id==='upper')){
      if(P.attack) P.attack=0;
      showWind(who.face, true); if(act) act.windT=now();
      return;
    }
  },
  levelAttack(){
    if(!lvl) return false;
    if(act&&act.level){if(lvl.P&&lvl.P.attack&&act.kind==='punch'){act.buf=true; lvl.P.attack=0} return true}
    return false;
  },
  wind:showWind,
  cast:throwUpper,
  holdUpper(){return wait&&loaded?'wait':null},
  takeOldUpper(){if(!oldUpper) return false; oldUpper=false; return true},
  driveLevel(){if(act&&act.level&&lvl){lvl.p.vx=act.vx; lvl.p.vy=0}},
  pinLevel(){if(act&&act.level&&lvl){if(act.y0!=null) lvl.p.y=act.y0; lvl.p.vy=0; lvl.p.ground=true}},
  paintLevel(ctx2, cam){
    if(!act||!act.level||!lvl) return false;
    paint(lvl.p.x-cam.x, lvl.p.y-cam.y, ctx2);
    return true;
  }
};
})();
