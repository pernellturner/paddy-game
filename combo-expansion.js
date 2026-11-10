// Visible tap poses for the original game. Holding Claw still charges.
// Approved sheets: assets/sprites/boxing_v1/approved_play/
(function(){
const arena=()=>{try{return typeof FORM==='function'&&typeof p!=='undefined'&&typeof dummies!=='undefined'}catch(e){return false}};
function base(){try{return !arena()||(FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt)}catch(e){return !arena()}}
function rt(){return performance.now()/1000}
const CX=window.CX={plan:null, recent:null, air:null, grab:null, pose:null,
  n:{feint:0,lean:0,step:0,bob:0,slam:0,fly:0,grab:0,blink:0,tail:0,diag:0}};
const BOX=0.55, FOOT=[210,408];
let moves=null, loaded=false;
const POSE={
  feint:{spr:'weave', frames:[2,3,4,5,4], dx:8, dy:0, sq:1, rot:0, say:'CROUCH!'},
  lean:{spr:'back_step', frames:[1,2,3,4,5,6], dx:-120, dy:0, sq:1, rot:0, say:'SLIDE BACK!'},
  step:{spr:'dash_forward', frames:[1,2,3,4,5,6], dx:130, dy:0, sq:1, rot:0, say:'STEP IN!'},
  low:{spr:'weave', frames:[3,4,5,6,5,4], dx:6, dy:0, sq:1, rot:0, say:'DEEP CROUCH!'},
  deep:{spr:'back_step', frames:[2,3,4,5,6,5], dx:-170, dy:0, sq:1, rot:0, say:'LONG SLIDE!'},
  long:{spr:'dash_forward', frames:[1,2,3,4,5,6], dx:190, dy:0, sq:1, rot:0, say:'LONG STEP!'},
  heldw:{spr:'weave', frames:[4,5,6,5], dx:0, dy:0, sq:1, rot:0, hold:1, say:'CROUCH!'},
  heldl:{spr:'back_step', frames:[3,4,5,6], dx:-140, dy:0, sq:1, rot:0, hold:1, say:'SLIDE BACK!'},
  helds:{spr:'dash_forward', frames:[2,3,4,5], dx:150, dy:0, sq:1, rot:0, hold:1, say:'STEP IN!'},
  diagf:{spr:'dash_forward', frames:[2,3,4,5,6], dx:110, dy:0, sq:1, rot:0, say:'SLIP STEP!'},
  diagb:{spr:'back_step', frames:[2,3,4,5,6], dx:-130, dy:0, sq:1, rot:0, say:'FADE STEP!'}
};
function loadImage(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error(src));im.src=src})}
(async function(){
  try{
    const r=await fetch('assets/sprites/boxing_v1/approved_play/animation.json');
    if(!r.ok) throw new Error('animation '+r.status);
    const pack=await r.json();
    if(pack.foot) FOOT[0]=pack.foot[0], FOOT[1]=pack.foot[1];
    moves={};
    for(const name in pack.moves){
      const imgs=[];
      for(const rel of pack.moves[name].frames) imgs.push(await loadImage('assets/sprites/boxing_v1/approved_play/'+rel));
      moves[name]={imgs};
    }
    loaded=true;
  }catch(err){console.error('tap sprites failed', err)}
})();
function sayTo(t,c){
  try{if(typeof window.say==='function'&&arena()) window.say(t,c||'#fff')}catch(e){}
  try{if(CX.msg) CX.msg(t,c||'#fff')}catch(e){}
}
function who(){return arena()?p:(CX.p||null)}
function show(id, face){
  const spec=POSE[id]; if(!spec) return;
  const w=who(); if(!w) return;
  if(arena()&&(id==='feint'||id==='heldw'||id==='low')&&(w.state==='land'||(CX.landAt&&rt()-CX.landAt<0.28))) return;
  if(arena()&&window.OD&&OD.move&&OD.move()) return;
  const imgs=moves&&moves[spec.spr]&&moves[spec.spr].imgs;
  CX.pose={id, spec, face:face||w.face||1, t:0, x0:w.x, y0:w.y, imgs:imgs||null, trail:[], hold:!!spec.hold, key:CX._key||null};
  CX.recent={k:id, t:rt(), face:CX.pose.face};
  w.face=CX.pose.face; w.vx=0; w.vy=0;
  if(arena()){w.state='ctap'; w.t=0; w.ground=true; w.noFlick=true}
  else {w.state='od'; w.vy=0}
  sayTo(spec.say, '#fff');
  const nmap={feint:'feint',lean:'lean',step:'step',low:'feint',deep:'lean',long:'step',heldw:'feint',heldl:'lean',helds:'step',diagf:'diag',diagb:'diag'};
  const nk=nmap[id]; if(nk) CX.n[nk]=(CX.n[nk]||0)+1;
}
function ease(u){u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u)}
function stepPose(dt){
  const pose=CX.pose; if(!pose) return;
  const w=who(); if(!w){CX.pose=null; return}
  pose.t+=dt;
  const dur=pose.hold?0.7:0.5;
  let u=pose.t/dur;
  if(pose.hold){
    const down=pose.key&&(arena()?K[pose.key]:CX.held&&CX.held.has(pose.key));
    if(down&&pose.t<0.55) u=Math.min(0.62, pose.t/0.34);
    else if(!down&&pose.t<0.5) pose.t=Math.max(pose.t, 0.5);
  }
  if(u>=1||pose.t>0.7){
    const buf=pose.buf; CX.pose=null;
    if(arena()){w.state='normal'; w.t=0; w.noFlick=false; w.vx=w.face*40}
    else {w.state='normal'; w.vx=0}
    if(buf&&arena()) P.attack=1;
    return;
  }
  const spec=pose.spec;
  const peak=pose.hold?Math.min(1,u/0.55):Math.sin(Math.min(1,u)*Math.PI);
  const slide=pose.hold?ease(Math.min(1,u/0.45)):ease(Math.min(1,u/0.7));
  pose.dx=spec.dx*slide*(spec.dx<0||idForward(pose.id)?1:1);
  pose.dy=spec.dy*peak;
  pose.sq=1+(spec.sq-1)*peak;
  pose.rot=spec.rot*peak;
  const fr=spec.frames;
  pose.fi=fr[Math.min(fr.length-1, Math.floor(Math.min(0.999,u)*fr.length))];
  w.face=pose.face;
  w.vx=0; w.vy=0;
  if(arena()){w.state='ctap'; w.ground=true; if(typeof floorAt==='function') w.y=floorAt(w.x)}
  else {w.state='od'; w.y=pose.y0}
  const nx=pose.x0+pose.dx*(pose.face>0||spec.dx<0?1:1);
  const travel=spec.dx*(pose.face||1);
  w.x=pose.x0+travel*slide;
  if(arena()&&typeof clampX==='function') w.x=clampX(w.x);
  if(pose.t- (pose.trailT||0)>0.045){pose.trailT=pose.t; pose.trail.push({x:w.x,y:w.y,dy:pose.dy,fi:pose.fi,a:0.45}); if(pose.trail.length>4) pose.trail.shift()}
  if(arena()&&P.attack){pose.buf=true; if(pose.t>0.16) pose.t=Math.max(pose.t, dur-0.08)}
}
function idForward(id){return id==='step'||id==='long'||id==='helds'||id==='diagf'}
function paintPose(c, x, y){
  const pose=CX.pose; if(!pose||!c) return false;
  const imgs=pose.imgs;
  const drawOne=(fi, px, py, alpha, sq)=>{
    if(!imgs) return;
    const img=imgs[Math.max(0, Math.min(imgs.length-1, fi||0))];
    if(!img||!img.naturalWidth) return;
    c.save();
    c.globalAlpha=alpha==null?1:alpha;
    c.translate(px, py+(pose.dy||0));
    c.rotate((pose.rot||0)*(pose.face||1));
    c.scale((pose.face||1)*BOX, BOX);
    c.drawImage(img, -FOOT[0], -FOOT[1]);
    c.restore();
  };
  for(const g of pose.trail){g.a*=0.82; drawOne(g.fi, g.x, g.y, g.a*0.55)}
  if(imgs) drawOne(pose.fi, x, y, 1);
  else {
    c.save(); c.translate(x, y+(pose.dy||0)); c.rotate((pose.rot||0)*(pose.face||1));
    c.fillStyle='#ffe9a8'; c.fillRect(-18, -90*(pose.sq||1), 36, 90*(pose.sq||1)); c.restore();
  }
  return true;
}
CX.paintLevel=function(ctx2, cam){
  if(!CX.pose||!CX.p) return false;
  return paintPose(ctx2, CX.p.x-cam.x, CX.p.y-cam.y);
};

function green(){
  try{
    if(arena()){
      const n=(p.combo||0)+(p.keepT>0?p.keepCombo||0:0);
      if(n>=3) return true;
      if(typeof C!=='undefined'&&C.n>=3&&C.t>0) return true;
      if(typeof cueInfo==='function'&&cueInfo()) return true;
    }else if(CX.p){
      return ((CX.p.chainT||0)>0&&/C{2,}/.test(CX.p.seq||''))||(CX.p.seq||'').length>=3;
    }
  }catch(e){}
  return false;
}
function keepCombo(){
  if(!arena()) return;
  const n=Math.max(p.combo||0, p.keepT>0?p.keepCombo||0:0);
  p.keepCombo=n; p.keepT=0.85; p.combo=n;
  if(typeof C!=='undefined'&&C.n>0) C.t=Math.max(C.t,0.9);
}
const TAP={};
const heldKeys=CX.held=new Set();
function kindOf(k, face){
  if(k==='down') return 'down';
  if(k==='up') return 'up';
  const dir=k==='right'?1:k==='left'?-1:0;
  return dir===face?'fwd':'back';
}
function playKind(kind, n, hold){
  const face=(who()&&who().face)||1;
  if(kind==='up') return;
  const recentDown=CX._downAt&&rt()-CX._downAt<0.22;
  if(kind==='fwd'&&recentDown){show('diagf', face); CX._key=null; return}
  if(kind==='back'&&recentDown){show('diagb', face); CX._key=null; return}
  if(kind==='down') CX._downAt=rt();
  if(hold){
    show(kind==='down'?'heldw':kind==='back'?'heldl':'helds', face);
    return;
  }
  if(n>=3){
    show(kind==='down'?'low':kind==='back'?'deep':'long', face);
    return;
  }
  show(kind==='down'?'feint':kind==='back'?'lean':'step', face);
}
function noteTap(k, face){
  const n=(TAP[k]=(TAP[k]||0)+1);
  clearTimeout(TAP['z'+k]); clearTimeout(TAP['s'+k]);
  TAP['z'+k]=setTimeout(()=>{TAP[k]=0}, 480);
  const kind=kindOf(k, face);
  if(n>=2){CX.hold={k, t:rt(), face, used:false}; CX._key=k; return n}
  CX._key=k;
  TAP['s'+k]=setTimeout(()=>{if((TAP[k]||0)===1&&!(arena()?K[k]:heldKeys.has(k))) playKind(kind, 1, false)}, 190);
  return n;
}
function onTapRelease(k){
  if(!base()) return;
  if(window.KD48&&KD48.H&&KD48.H[k]&&KD48.H[k].dt) return;
  if(window.KD47&&KD47.req) return;
  if(window.KD48) KD48.req=null;
  const face=(who()&&who().face)||1;
  const n=noteTap(k, face);
  if(n>=3){clearTimeout(TAP['z'+k]); TAP[k]=0; playKind(kindOf(k, face), 3, false)}
}

if(arena()&&typeof press==='function'){
  const _press=press;
  press=function(k){
    const before=window.KD47&&KD47.req;
    const r=_press.apply(this, arguments);
    try{if(base()&&window.KD47&&KD47.req&&KD47.req!==before){clearTimeout(TAP['s'+k]); TAP[k]=2; CX.hold={k, t:rt(), face:p.face, used:!!(KD47.req.k==='back')}; CX._key=k}}catch(e){}
    return r;
  };
  const _rel=release;
  release=function(k){
    const was=K[k];
    const r=_rel.apply(this, arguments);
    try{if(base()&&was&&['left','right','up','down'].includes(k)) onTapRelease(k)}catch(e){if(!onTapRelease.err){onTapRelease.err=1;console.warn('cx tap',e)}}
    return r;
  };
}
const KEYS={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
document.addEventListener('keydown', e=>{
  const k=KEYS[e.code]; if(!k||e.repeat||arena()) return;
  heldKeys.add(k); CX._key=k;
  const face=(CX.p&&CX.p.face)||1;
  const n=noteTap(k, face);
  if(n>=3){clearTimeout(TAP['z'+k]); TAP[k]=0; playKind(kindOf(k, face), 3, false)}
}, true);
document.addEventListener('keyup', e=>{
  const k=KEYS[e.code]; if(!k) return;
  heldKeys.delete(k);
}, true);

function clawPlan(){
  if(!CX.recent||rt()-CX.recent.t>0.55) return;
  const k=CX.recent.k;
  if(k==='step'||k==='long'||k==='helds'||k==='diagf') CX.plan={n:2, say:'JAB JAB!', hook:false};
  else if(k==='lean'||k==='deep'||k==='heldl'||k==='diagb') CX.plan={n:2, say:'LEFT RIGHT!', hook:false};
  else if(k==='feint'||k==='low'||k==='heldw') CX.plan={n:2, say:'BODY!', hook:false};
  if(CX.plan) sayTo(CX.plan.say,'#ffe14d');
  CX.recent=null;
}
function blinkBehind(){
  const kc=Math.max(p.combo||0, p.keepCombo||0);
  let best=null, bd=1e9;
  for(const d of dummies){if(!d.alive||d.benched) continue; const dd=Math.abs(d.x-p.x); if(dd<bd){bd=dd; best=d}}
  if(typeof puffShadow==='function') puffShadow(p.x,p.y);
  if(best){p.x=best.x+(best.x>=p.x?-100:100); p.face=Math.sign(best.x-p.x)||p.face}
  else p.x+=p.face*220;
  if(typeof clampX==='function') p.x=clampX(p.x);
  if(typeof puffShadow==='function') puffShadow(p.x,p.y);
  p.combo=kc; p.keepCombo=kc; p.keepT=0.9; p.state='normal'; p.vx=0;
  if(typeof C!=='undefined'&&C.n>0) C.t=Math.max(C.t,0.9);
  sayTo('BLINK BEHIND!','#c9a7ff'); CX.n.blink++;
  p.blinkCool=0.35;
}
function tailFinisher(){
  const kc=Math.max(p.combo||0, p.keepCombo||0);
  if(typeof tailWhip==='function') tailWhip(3);
  p.keepCombo=kc; p.keepT=1; CX.n.tail++;
  sayTo('TAIL SPIN!','#ff9a2e');
}
let prev='';
function arenaTick(dt){
  if(!base()) return;
  if(p.ground&&CX._air) CX.landAt=rt();
  CX._air=!p.ground;
  if(CX.hold&&!CX.hold.used&&K[CX.hold.k]&&rt()-CX.hold.t>0.16&&rt()-CX.hold.t<0.75){
    if(!(window.OD&&OD.move&&OD.move())){CX.hold.used=true; CX._key=CX.hold.k; playKind(kindOf(CX.hold.k, CX.hold.face), 2, true)}
  }
  stepPose(dt||0);
  const g=green();
  if(g&&P.blink&&!CX.pose){delete P.blink; blinkBehind()}
  else if(g&&P.tail&&p.state!=='tailwhip'&&!CX.pose){delete P.tail; tailFinisher()}
  else if(g&&(P.special||P.dash||P.attack)){keepCombo()}
  if(P.attack&&!CX._ate&&!CX.pose){clawPlan(); CX._ate=true}
  if(!P.attack) CX._ate=false;
  const q=window.KD47&&KD47.req;
  if(q&&q.k==='down'&&!p.ground){KD47.req=null; startSlam()}
  if(q&&q.k==='up'&&q.ground){KD47.req=null; delete P.jump; startFly()}
  else if(q&&q.k==='up'){KD47.req=null}
  if(CX.air==='fly'&&P.attack&&p.t>.12&&p.t<.5){delete P.attack; tryGrab()}
  if(CX.air==='slam'){
    p.vy=Math.max(p.vy,1500); p.vx*=.92;
    if(p.ground&&p.t>.08){landSlam(); CX.air=null}
  }
  if(CX.air==='fly'&&p.ground&&p.t>.35){CX.air=null; p.state='normal'}
  if(prev==='claw'&&p.state!=='claw'&&CX.plan&&CX.plan.n>1){
    CX.plan.n--;
    p.keepT=0.4; p.keepCombo=p.combo;
    if(typeof startClaw==='function') startClaw();
    if(CX.plan.hook&&p.state==='claw'&&typeof setAnim==='function'&&FR.bxlh){setAnim('bxlh', true); if(window.P33) P33.a='bxlh'}
  }
  prev=p.state;
}
function startSlam(){
  CX.air='slam'; CX.n.slam++; p.state='dive'; p.t=0; p.vy=1500; p.ground=false;
  if(typeof setAnim==='function') setAnim('dive', true);
  sayTo('GROUND SLAM!','#ffe9a8');
}
function landSlam(){
  if(typeof impact==='function') impact(true);
  sayTo('HAMMER!','#ffe14d');
  for(const d of dummies){if(!d.alive||d.benched) continue; if(Math.abs(d.x-p.x)<200){d.vy=Math.min(d.vy||0,-200); d.vx=(d.x>=p.x?1:-1)*700; d.fl=Math.max(d.fl||0,.3)}}
}
function startFly(){
  CX.air='fly'; CX.n.fly++; p.state='normal'; p.ground=false; p.vy=-860; p.vx=p.face*260; p.jumps=2; p.t=0;
  if(typeof setAnim==='function') setAnim('jump', true);
  sayTo('FLYING PUNCH!','#fff');
}
function tryGrab(){
  let best=null;
  for(const d of dummies){
    if(!d.alive||d.benched) continue;
    if(d.y<GROUND-30&&Math.abs(d.x-p.x)<170&&Math.abs(d.y-p.y)<200) best=d;
  }
  if(!best) return;
  CX.n.grab++; CX.grab=best; CX.grabT=rt();
  best.vx=0; best.vy=40; best.fl=0.05; best.x=p.x+p.face*78; best.y=Math.min(GROUND-8, p.y+10);
  sayTo('GOTCHA!','#7fffd4');
  p.vy=Math.min(p.vy,80); p.vx=0;
}

if(arena()&&typeof r9Pre==='function'){
  const _pre=r9Pre;
  r9Pre=function(dt){try{arenaTick(dt)}catch(e){if(!arenaTick.err){arenaTick.err=1;console.warn('cx',e)}} return _pre.apply(this, arguments)};
  const _up=update;
  update=function(dt){
    const r=_up.apply(this, arguments);
    try{if(CX.pose){p.vy=0; p.ground=true; p.state='ctap'; if(typeof floorAt==='function') p.y=floorAt(p.x)}}catch(e){}
    return r;
  };
  const _df=drawFrame;
  drawFrame=function(f,x,y,face,alpha){
    if(CX.pose&&Math.abs((x||0)-p.x)<80&&Math.abs((y||0)-(p.y||0))<80) return;
    return _df.apply(this, arguments);
  };
  const _fx=drawFx;
  drawFx=function(){try{if(CX.pose) paintPose(ctx, p.x, p.y)}catch(e){if(!paintPose.err){paintPose.err=1;console.warn('cx draw',e)}} return _fx.apply(this, arguments)};
}

CX.claimLevel=function(q){
  if(!CX.p) return false;
  const who=CX.p;
  if(q.k==='up'&&q.ground){CX.want='fly'; return true}
  if(q.k==='down'&&!who.ground){CX.want='slam'; return true}
  return false;
};
CX.level=function(dt, api){
  CX.p=api.p; CX.msg=api.msg; CX.enemies=api.enemies;
  const P=api.P, w=api.p;
  if(CX.hold&&!CX.hold.used&&heldKeys.has(CX.hold.k)&&rt()-CX.hold.t>0.16&&rt()-CX.hold.t<0.7){
    CX.hold.used=true; CX._key=CX.hold.k; playKind(kindOf(CX.hold.k, CX.hold.face), 2, true);
  }
  stepPose(dt);
  if(CX.pose){w.state='od'; w.vy=0; w.face=CX.pose.face}
  if(CX.want==='fly'&&api.startMove&&!CX.pose){CX.want=null; api.startMove('flypunch'); CX.n.fly++; CX.air='fly'}
  if(CX.want==='slam'&&api.startMove&&!CX.pose){CX.want=null; api.startMove('slam'); CX.n.slam++; CX.air='slam'}
  if(CX.air==='fly'&&P.attack&&w.mv&&w.mv.id==='flypunch'&&w.mv.t>.12&&w.mv.t<.42){
    P.attack=0;
    for(const e of api.enemies||[]){
      if(!e.alive) continue;
      if(e.y<w.y-10&&Math.abs(e.x-w.x)<190){
        e.vy=1100; e.vx=w.face*120; e.hurt=0.55; CX.grab=e; CX.n.grab++;
        if(api.msg) api.msg('GOTCHA!','#7fffd4');
      }
    }
  }
};
CX.green=green;
CX.poseName=function(){return CX.pose?CX.pose.id:''};
CX.sprites=function(){return loaded};
})();
