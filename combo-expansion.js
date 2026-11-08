// Combo expansion for the original game (practice arena + story levels).
// Layers on the dashes, Blink, tail spin and claw strings. Does not edit punch33.js.
(function(){
const arena=()=>{try{return typeof FORM==='function'&&typeof p!=='undefined'&&typeof dummies!=='undefined'}catch(e){return false}};
function base(){try{return !arena()||(FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt)}catch(e){return !arena()}}
function rt(){return performance.now()/1000}
const CX=window.CX={armed:false, plan:null, recent:null, taps:{}, air:null, grab:null, n:{arm:0,feint:0,lean:0,step:0,bob:0,slam:0,fly:0,grab:0,blink:0,tail:0}};
function say(t,c){try{if(typeof say==='function'&&arena()) window.say(t,c||'#fff')}catch(e){}
  try{if(CX.msg) CX.msg(t,c||'#fff')}catch(e){}}
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
function arm(){
  CX.armed=true; CX.n.arm++;
  say('100 POWER!','#ffe14d');
  if(arena()&&typeof flashT!=='undefined') flashT=Math.max(flashT,.08);
}
function spend(){
  if(!CX.armed) return false;
  CX.armed=false;
  if(arena()&&typeof hitstop!=='undefined') hitstop=Math.max(hitstop,.05);
  if(arena()&&typeof shake!=='undefined') shake=Math.max(shake,8);
  return true;
}

// ---------- 100 button ----------
function addButton(){
  const ui=document.getElementById('ui');
  if(!ui||document.getElementById('b100')) return;
  const b=document.createElement('div');
  b.className='b s'; b.id='b100'; b.dataset.k='hundred'; b.textContent='100';
  b.title='Charge the next punch';
  b.style.cssText='right:calc(300px + env(safe-area-inset-right));bottom:108px;background:#ffe14d;color:#3a2400;font-weight:800';
  ui.appendChild(b);
  if(window.CTRL&&CTRL.layout) CTRL.layout();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', addButton);
else addButton();
document.addEventListener('keydown', e=>{
  if(e.repeat) return;
  if(e.code==='Digit1'||e.code==='KeyU'){
    if(typeof press==='function') press('hundred');
    else arm();
  }
}, true);
document.addEventListener('keyup', e=>{
  if((e.code==='Digit1'||e.code==='KeyU')&&typeof release==='function') release('hundred');
}, true);

if(arena()&&typeof press==='function'){
  const _press=press;
  press=function(k){
    if(k==='hundred'){arm(); return}
    return _press.apply(this, arguments);
  };
  const _hd=hitDummy;
  hitDummy=function(d,move,dir){
    const r=_hd.apply(this, arguments);
    try{if(spend()&&d){d.vx=(d.vx||0)*1.8; d.vy=Math.min(d.vy||0,-520); d.fl=Math.max(d.fl||0,.45);
      say('CHARGED!','#ffe14d');}}catch(e){}
    return r;
  };
  const _rel=release;
  release=function(k){
    const t0=rt();
    const was=K[k];
    const r=_rel.apply(this, arguments);
    try{if(base()&&was&&['left','right','up','down'].includes(k)) onTapRelease(k, t0)}catch(e){if(!onTapRelease.err){onTapRelease.err=1;console.warn('cx tap',e)}}
    return r;
  };
}

const TAP={left:0,right:0,up:0,down:0};
function onTapRelease(k, tPress){
  const dur=rt()-((window.KD48&&KD48.H&&KD48.H[k]&&KD48.H[k].t)||tPress);
  if(dur>0.18) return;
  if(window.KD48&&KD48.H&&KD48.H[k]&&KD48.H[k].dt) return;
  if(window.KD47&&KD47.req) return;
  if(window.KD48) KD48.req=null;
  const face=p.face||1;
  const dir=k==='right'?1:k==='left'?-1:0;
  const kind=k==='down'?'down':k==='up'?'up':dir===face?'fwd':'back';
  const n=(TAP[k]=(TAP[k]||0)+1);
  clearTimeout(TAP['t'+k]);
  TAP['t'+k]=setTimeout(()=>{TAP[k]=0}, 450);
  if(n>=3){triple(kind, face); return}
  single(kind, face);
}
function single(kind, face){
  CX.recent={k:kind, t:rt(), face};
  if(kind==='down'){CX.n.feint++; if(typeof startFeint==='undefined'){p.vx=0; if(typeof setAnim==='function') setAnim('crouch', true); say('FEINT!','#ffe9a8')} }
  else if(kind==='back'){CX.n.lean++; p.vx=-face*160; if(typeof setAnim==='function') setAnim('bxpj' in (FR||{})?'bxpj':'crouch', true); say('LEAN BACK!','#bfe8ff')}
  else if(kind==='fwd'){CX.n.step++; p.vx=face*280; p.face=face; say('STEP IN!','#fff')}
  else if(kind==='up'&&p.ground){CX.n.bob++; if(p.state==='jcharge'||(p.state==='normal'&&p.t<.12)){p.vy=0; p.ground=true} say('BOB!','#fff'); p.vx*=.4}
}
function triple(kind, face){
  CX.recent={k:'3'+kind, t:rt(), face};
  if(kind==='down'){say('LOW WEAVE!','#ffe08a'); p.vx=face*60; p.inv=Math.max(p.inv||0,.2)}
  else if(kind==='back'){say('DEEP LEAN!','#bfe8ff'); p.vx=-face*240}
  else if(kind==='fwd'){say('LONG STEP!','#fff'); p.vx=face*420}
  else {say('HIGH BOB!','#fff'); if(p.ground){p.vy=-360; p.ground=false; p.jumps=1}}
}

function clawPlan(){
  if(!CX.recent||rt()-CX.recent.t>0.45) return;
  const k=CX.recent.k;
  if(k==='fwd') CX.plan={n:2, say:'JAB JAB!', hook:false};
  else if(k==='back'||k==='3back') CX.plan={n:2, say:'LEFT RIGHT!', hook:false};
  else if(k==='down'||k==='3down') CX.plan={n:3, say:'HOOKS!', hook:true};
  else if(k==='up') CX.plan={n:1, say:'BOB PUNCH!', hook:false};
  if(CX.plan) say(CX.plan.say,'#ffe14d');
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
  say('BLINK BEHIND!','#c9a7ff'); CX.n.blink++;
  p.blinkCool=0.35;
}
function tailFinisher(){
  const kc=Math.max(p.combo||0, p.keepCombo||0);
  if(typeof tailWhip==='function') tailWhip(3);
  p.keepCombo=kc; p.keepT=1; CX.n.tail++;
  say('TAIL SPIN!','#ff9a2e');
}

let prev='';
function arenaTick(){
  if(!base()) return;
  if(P.hundred){delete P.hundred; arm()}
  const g=green();
  if(g&&P.blink){delete P.blink; blinkBehind()}
  else if(g&&P.tail&&p.state!=='tailwhip'){delete P.tail; tailFinisher()}
  else if(g&&(P.special||P.dash||P.attack)){keepCombo()}
  if(P.attack&&!CX._ate){clawPlan(); CX._ate=true}
  if(!P.attack) CX._ate=false;
  // airborne double-tap down = ground slam; double-tap up = flying punch
  const q=window.KD47&&KD47.req;
  if(q&&q.k==='down'&&!p.ground){KD47.req=null; startSlam()}
  if(q&&q.k==='up'){KD47.req=null; delete P.jump; startFly()}
  if(CX.air==='fly'&&P.attack&&p.t>.12&&p.t<.5){delete P.attack; tryGrab()}
  if(CX.air==='slam'){
    p.vy=Math.max(p.vy,1500); p.vx*=.92;
    if(p.ground&&p.t>.08){landSlam(); CX.air=null}
  }
  if(CX.air==='fly'&&p.ground&&p.t>.35){CX.air=null; p.state='normal'}
  if(prev==='claw'&&p.state!=='claw'&&CX.plan&&CX.plan.n>1){
    CX.plan.n--;
    p.combo=Math.max(0,(p.combo||1)-0); p.keepT=0.4; p.keepCombo=p.combo;
    if(typeof startClaw==='function') startClaw();
    if(CX.plan.hook&&p.state==='claw'&&typeof setAnim==='function'&&FR.bxlh){setAnim('bxlh', true); if(window.P33) P33.a='bxlh'}
  }
  if(CX.armed&&p.state==='normal'){/* gold hint stays until the hit */}
  prev=p.state;
}
function startSlam(){
  CX.air='slam'; CX.n.slam++; p.state='dive'; p.t=0; p.vy=1500; p.ground=false;
  if(typeof setAnim==='function') setAnim('dive', true);
  say('GROUND SLAM!','#ffe9a8');
}
function landSlam(){
  if(typeof impact==='function') impact(true);
  say('HAMMER!','#ffe14d');
  if(CX.armed) spend();
  for(const d of dummies){if(!d.alive||d.benched) continue; if(Math.abs(d.x-p.x)<200){d.vy=Math.min(d.vy||0,-200); d.vx=(d.x>=p.x?1:-1)*700; d.fl=Math.max(d.fl||0,.3)}}
}
function startFly(){
  CX.air='fly'; CX.n.fly++; p.state='normal'; p.ground=false; p.vy=-860; p.vx=p.face*260; p.jumps=2; p.t=0;
  if(typeof setAnim==='function') setAnim('jump', true);
  say('FLYING PUNCH!','#fff');
}
function tryGrab(){
  let best=null;
  for(const d of dummies){
    if(!d.alive||d.benched) continue;
    if(d.y<GROUND-30&&Math.abs(d.x-p.x)<170&&Math.abs(d.y-p.y)<200) best=d;
  }
  if(!best) return;
  CX.n.grab++; CX.grab=best;
  best.vy=980; best.vx=p.face*80; best.fl=0.15; best.y=Math.min(best.y+20, GROUND);
  say('GOTCHA!','#7fffd4');
  p.vy=Math.min(p.vy,200);
}

if(arena()&&typeof r9Pre==='function'){
  const _pre=r9Pre;
  r9Pre=function(dt){try{arenaTick()}catch(e){if(!arenaTick.err){arenaTick.err=1;console.warn('cx',e)}} return _pre.apply(this, arguments)};
  const _fx=drawFx;
  drawFx=function(){
    try{if(CX.armed){ctx.save(); ctx.globalCompositeOperation='lighter';
      const g=ctx.createRadialGradient(p.x,p.y-80,6,p.x,p.y-80,50);
      g.addColorStop(0,'rgba(255,225,80,.8)'); g.addColorStop(1,'rgba(255,200,40,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y-80,50,0,6.28); ctx.fill(); ctx.restore()}}catch(e){}
    return _fx.apply(this, arguments);
  };
}

// ---------- story levels ----------
CX.claimLevel=function(q){
  if(!CX.p) return false;
  const who=CX.p;
  if(q.k==='up'){CX.want='fly'; return true}
  if(q.k==='down'&&!who.ground){CX.want='slam'; return true}
  return false;
};
CX.level=function(dt, api){
  CX.p=api.p; CX.msg=api.msg; CX.enemies=api.enemies; CX.hitEnemy=api.hitEnemy;
  const K=api.K, P=api.P, who=api.p;
  if(P.hundred){P.hundred=0; arm()}
  if(CX.want==='fly'&&api.startMove){CX.want=null; api.startMove('flypunch'); CX.n.fly++; CX.air='fly'}
  if(CX.want==='slam'&&api.startMove){CX.want=null; api.startMove('slam'); CX.n.slam++; CX.air='slam'}
  if(CX.air==='fly'&&P.attack&&who.mv&&who.mv.id==='flypunch'&&who.mv.t>.12&&who.mv.t<.42){
    P.attack=0;
    for(const e of api.enemies||[]){
      if(!e.alive) continue;
      if(e.y<who.y-10&&Math.abs(e.x-who.x)<190){
        e.vy=1100; e.vx=who.face*120; e.hurt=0.55; CX.grab=e; CX.n.grab++;
        if(api.msg) api.msg('GOTCHA!','#7fffd4');
      }
    }
  }
  if(CX.armed){
    for(const e of api.enemies||[]){
      if(e.alive&&e.hurt>0.2&&!e._cx){e._cx=1; e.vx=(e.vx||0)*1.7; e.vy=Math.min(e.vy||0,-180); if(api.msg) api.msg('CHARGED!','#ffe14d')}
      if(e.hurt<=0) e._cx=0;
    }
    if(!who.mv) {/* stays armed until a hit */}
  }
};
CX.green=green;
})();
