// Practice Room moves from the Sprite Studio handoff.
// Story mode never loads this file. Existing buttons stay as they are.
(function(){
if(typeof drawFrame!=='function'||typeof update!=='function'||typeof r9Pre!=='function') return;
const SM=window.STUDIO={move:null, fade:null, air:null, ready:false, pack:null};
function room(){
  try{return !!(window.PRACTICE&&PRACTICE.on)&&typeof FORM==='function'&&FORM()===0&&!(window.KITTY36&&KITTY36.on)}catch(e){return false}
}
function spar(){return room()&&window.PRACTICE&&PRACTICE.st==='spar'}
fetch('assets/sprites/studio_v1/moves.json?v=2').then(r=>r.json()).then(pack=>{
  for(const name in pack.moves){
    const mv=pack.moves[name];
    mv.imgs=mv.frames.map(fr=>{const im=new Image();im.src='assets/sprites/studio_v1/'+name+'/'+fr.f+'?v=2';return im});
  }
  SM.pack=pack; SM.ready=true;
}).catch(e=>console.warn('studio', e));

function plainClaw(){
  return !(K.up||K.down||K.left||K.right||K.jump);
}
function faceKey(){return (p.face||1)>0?'right':'left'}
function fwdAge(){
  const fu=window.KD47&&KD47.fu;
  if(!fu||fu.k!=='fwd') return -1;
  const age=performance.now()/1000-fu.t;
  return age>=0&&age<0.45?age:-1;
}
let lastClaw=0, downAt=0;
const downTaps=[];
if(typeof press==='function'){
  const _pr=press;
  press=function(k){
    const r=_pr.apply(this, arguments);
    try{
      if(room()&&k==='down') downAt=performance.now();
      if(room()&&typeof C!=='undefined'&&C.n>=3&&plainClaw()&&(k==='attack'||k==='tail')){
        const now=performance.now();
        if(k==='attack') SM.finAtk=now; else SM.finTail=now;
        if(SM.finAtk&&SM.finTail&&Math.abs(SM.finAtk-SM.finTail)<160){
          delete P.attack; delete P.tail; SM.link=null; startFinish();
        }
      }
      if(room()&&SM.move&&!SM.finish&&['attack','tail','special'].includes(k)) SM.link={k, t:performance.now()};
      if(room()&&SM.ready&&p.ground&&!SM.move){
        const age=fwdAge();
        if(k==='down'&&age>=0&&age<0.35&&!K[faceKey()]){delete P.down; begin('roll')}
        else if(k==='up'&&age>=0&&age<0.35&&!K[faceKey()]){delete P.jump; delete P.up; begin('frontflip')}
        else if(k==='tail'&&K.down&&K[faceKey()]){delete P.tail; begin('capoeira')}
      }
      if(k==='attack'&&room()&&SM.ready&&p.ground&&plainClaw()&&!SM.move){
        const now=performance.now();
        if(now-lastClaw<200&&now-lastClaw>40&&(p.combo||0)<=1) begin('roundhouse');
        lastClaw=now;
      }
    }catch(e){}
    return r;
  };
}
if(typeof release==='function'){
  const _rel=release;
  release=function(k){
    try{
      if(room()&&k==='down'&&downAt&&performance.now()-downAt<250){
        downTaps.push(performance.now());
        if(downTaps.length>4) downTaps.shift();
      }
    }catch(e){}
    return _rel.apply(this, arguments);
  };
}
function twoDowns(){
  const now=performance.now();
  const taps=downTaps.filter(t=>now-t<500);
  if(taps.length<2) return false;
  const a=taps[taps.length-2], b=taps[taps.length-1];
  return b-a<340&&now-b<450;
}
function begin(name){
  if(!SM.ready||!room()) return false;
  const spec=SM.pack.moves[name];
  if(!spec) return false;
  const keep=typeof C!=='undefined'?C.n:0;
  SM.move={name, spec, i:0, acc:0, hit:false, hold:false, held:0, face:p.face||1, cid:''};
  SM.fade=null;
  p.vx=0; p.vy=0; p.rot=0; p.ground=true; p.noFlick=true;
  p.y=typeof GROUND==='number'?GROUND:p.y;
  p.state='s'+name;
  if(typeof setAnim==='function') setAnim('idle', true);
  if(window.P33){P33.a=null; P33.q=null; P33.legacy=false}
  if(window.CX) CX.pose=null;
  delete P.attack;
  const said={
    roundhouse:['ROUNDHOUSE!','#ffe14d','rkick'],
    backflip:['BACKFLIP!','#bfe8ff','sflip'],
    knockdown:['DOWN!','#ff9a9a',''],
    roll:['ROLL!','#bfe8ff','roll'],
    frontflip:['FRONT FLIP!','#ffe9a8','fflip'],
    slide:['SLIDE!','#ffb070','slide'],
    capoeira:['CAPOEIRA!','#ff9ad5','capkick']
  };
  const row=said[name];
  if(row){
    SM.move.cid=row[2];
    if(name==='backflip'||name==='roll') p.inv=Math.max(p.inv||0, name==='roll'?0.55:0.9);
    if(!SM.finish){try{if(typeof say==='function') say(row[0], row[1], true)}catch(e){}}
    if(row[2]&&window.CSTR&&CSTR.push) CSTR.push(row[2]);
  }
  if(keep>0&&typeof C!=='undefined'){C.n=keep; C.t=Math.max(C.t||0, 1.8)}
  p.keepCombo=Math.max(p.keepCombo||0, keep); p.keepT=Math.max(p.keepT||0, 1.6);
  return true;
}
function startFinish(){
  if(!room()||!SM.ready) return;
  const n=typeof C!=='undefined'?C.n:0;
  if(n<3) return;
  const tier=n>=8?'ultimate':n>=5?'big':'power';
  SM.finish={tier, boom:false};
  SM.link=null;
  begin(tier==='ultimate'?'roll':tier==='big'?'frontflip':'capoeira');
  const look=TIER[tier];
  SM.banner={t:performance.now(), text:look.label, col:look.col};
  try{if(typeof say==='function') say(look.label, look.col, true)}catch(e){}
}
const TIER={
  power:{label:'POWER', col:'#ffe14d', stop:0.14, shake:12, slow:0.18, zoom:1.08, vy:-780, vx:520, fl:0.5},
  big:{label:'BIG FINISH', col:'#ff9a2e', stop:0.2, shake:18, slow:0.32, zoom:1.12, vy:-1200, vx:680, fl:0.75},
  ultimate:{label:'ULTIMATE', col:'#ff6fcf', stop:0.28, shake:24, slow:0.45, zoom:1.16, vy:-1500, vx:820, fl:0.95}
};
SM.begin=begin;
function tapped(){return !!(P.attack||P.jump||P.special||P.tail||P.blink||P.dash||P.up||P.down||P.left||P.right)}
function endMove(){
  const m=SM.move; if(!m) return;
  const sc=SM.pack.scale;
  if(m.spec.end_x){
    p.x+=(m.face||1)*m.spec.end_x*sc;
    if(typeof clampX==='function') p.x=clampX(p.x);
  }
  if(m.cid&&window.CSTR&&CSTR.buf&&CSTR.buf[CSTR.buf.length-1]===m.cid) CSTR.lastT=performance.now();
  const im=m.spec.imgs[Math.min(m.i, m.spec.imgs.length-1)];
  SM.fade={t:0, im, spec:m.spec, i:m.i, face:m.face};
  SM.move=null;
  p.state='normal'; p.vx=0; p.vy=0; p.rot=0; p.noFlick=false; p.ground=true;
  p.y=typeof GROUND==='number'?GROUND:p.y;
  if(typeof setAnim==='function') setAnim('idle', true);
  if(window.P33){P33.a=null; P33.q=null}
}
function kick(face, reach){
  let got=false;
  for(const d of (typeof dummies!=='undefined'?dummies:[])){
    if(!d||d.alive===false||d.benched) continue;
    const g=(d.x-p.x)*face;
    if(g>-36&&g<(reach||140)&&Math.abs((d.y||0)-p.y)<180){
      try{hitDummy(d,'claw2', face)}catch(e){}
      if(typeof C!=='undefined') C.t=Math.max(C.t||0, 1.8);
      p.keepCombo=Math.max(p.keepCombo||0, typeof C!=='undefined'?C.n:0);
      p.keepT=Math.max(p.keepT||0, 1.6);
      if(SM.finish) launch(d, face);
      got=true; break;
    }
  }
  if(got&&typeof shake!=='undefined') shake=Math.max(shake||0, 8);
  return got;
}
function launch(d, face){
  const tier=SM.finish&&TIER[SM.finish.tier];
  if(!tier||SM.finish.boom) return;
  SM.finish.boom=true;
  d.vy=tier.vy; d.vx=face*tier.vx; d.fl=tier.fl;
  SM.lob=d;
  if(typeof hitstop!=='undefined') hitstop=Math.max(hitstop, tier.stop);
  if(typeof shake!=='undefined') shake=Math.max(shake, tier.shake);
  if(typeof slowT!=='undefined') slowT=Math.max(slowT, tier.slow);
  window.XCAM={z:tier.zoom, b:0.2, d:0};
  SM.camUntil=performance.now()+520;
  SM.banner={t:performance.now(), text:tier.label, col:tier.col};
  try{if(typeof say==='function') say(tier.label, tier.col, true)}catch(e){}
}
function step(dt){
  const m=SM.move; if(!m) return;
  const frames=m.spec.frames;
  if(m.name==='powerland'&&tapped()){endMove(); return}
  if(m.name==='knockdown'&&tapped()&&(m.hold||m.i>3)){endMove(); return}
  if(!SM.finish&&SM.link&&(m.hit||m.i>=Math.max(1, frames.length-3))) fireLink();
  if(!SM.move) return;
  if(m.hold){
    m.held+=dt;
    if(m.held>0.55) endMove();
    return;
  }
  m.acc+=dt*1000;
  while(m.i<frames.length-1&&m.acc>=frames[m.i].ms){
    m.acc-=frames[m.i].ms;
    m.i++;
    const fr=frames[m.i];
    if(fr.hit&&!m.hit&&(m.name==='roundhouse'||m.name==='slide'||m.name==='capoeira')) m.hit=kick(m.face, m.name==='slide'?200:150);
    if(SM.finish&&!SM.finish.boom&&/tuck|roll|kick|impact/.test(fr.phase||'')) kick(m.face, 230);
    if(fr.hold){m.hold=true; m.held=0; return}
  }
  if(m.i>=frames.length-1&&m.acc>=frames[m.i].ms&&!frames[m.i].hold) endMove();
}
function fireLink(){
  const link=SM.link;
  if(!link||performance.now()-link.t>900){SM.link=null; return}
  SM.link=null;
  const keep=typeof C!=='undefined'?C.n:0;
  endMove();
  if(typeof C!=='undefined'&&keep>0){C.n=keep; C.t=Math.max(C.t||0, 1.8)}
  p.keepCombo=keep; p.keepT=1.6;
  if(link.k==='attack'&&typeof startClaw==='function'){p.combo=Math.max(0, Math.min(7, keep)); startClaw()}
  else if(link.k==='tail'&&typeof tailWhip==='function') tailWhip(1);
  else if(link.k==='special') P.special=1;
}
function paint(im, spec, i, face, alpha){
  if(!im||!im.naturalWidth||typeof ctx==='undefined'||!SM.pack) return false;
  const sc=SM.pack.scale, fr=spec.frames[i]||spec.frames[0];
  ctx.save();
  ctx.globalAlpha=alpha==null?1:alpha;
  ctx.globalCompositeOperation='source-over';
  ctx.translate(p.x+(spec.ox||0)*sc*face, p.y-(fr.trim||0)*sc);
  ctx.scale(face*sc*2, sc*2);
  const foot=(spec.foot_x||SM.pack.foot_x)/2;
  ctx.drawImage(im, -foot, -SM.pack.baseline_y/2);
  ctx.restore();
  return true;
}
const _df=drawFrame;
drawFrame=function(f,x,y,face,alpha){
  if(room()&&SM.move&&Math.abs((x||0)-p.x)<70&&Math.abs((y||0)-p.y)<90){
    const m=SM.move;
    if(paint(m.spec.imgs[m.i], m.spec, m.i, m.face, 1)) return;
  }
  return _df.apply(this, arguments);
};
if(typeof drawFx==='function'){
  const _fx=drawFx;
  drawFx=function(){
    const r=_fx.apply(this, arguments);
    try{
      if(room()&&SM.fade){
        SM.fade.t+=0.016;
        const u=Math.min(1, SM.fade.t/0.2);
        paint(SM.fade.im, SM.fade.spec, SM.fade.i, SM.fade.face, 1-u);
        if(u>=1) SM.fade=null;
      }
    }catch(e){}
    return r;
  };
}
const _up=update;
update=function(dt){
  const r=_up.apply(this, arguments);
  try{after(dt||0)}catch(e){if(!after.err){after.err=1;console.warn('studio',e)}}
  return r;
};
const _pre=r9Pre;
r9Pre=function(dt){
  const r=_pre.apply(this, arguments);
  try{stealFlip(); holdSlide()}catch(e){}
  return r;
};
function holdSlide(){
  if(!room()||!SM.ready||SM.move||!p.ground) return;
  const age=fwdAge();
  if(age<0.16||age>0.4) return;
  if(!K[faceKey()]) return;
  begin('slide');
}
function stealFlip(){
  if(!room()||!SM.ready||!p.ground) return;
  if(!(P.jump||P.up)||(SM.move&&SM.move.name==='backflip')) return;
  if(!twoDowns()) return;
  delete P.jump; delete P.up;
  downTaps.length=0;
  begin('backflip');
}
function after(dt){
  if(!room()){SM.move=null; SM.air=null; return}
  if(!p.ground){
    if(p.anim==='djump') SM.air='djump';
    else if(p.state==='dive'||p.state==='diveclaw'||p.state==='kpound') SM.air='slam';
  }else if(SM.air&&!SM.move){
    const kind=SM.air; SM.air=null;
    if(SM.ready&&(kind==='djump'||kind==='slam')) begin('powerland');
  }
  if(!SM.move) return;
  const m=SM.move;
  const fr=m.spec.frames[m.i];
  if(fr&&fr.air&&(m.name==='backflip'||m.name==='roll'||m.name==='frontflip')){p.inv=Math.max(p.inv||0, 0.16); p.noFlick=true}
  if(SM.camUntil&&performance.now()>SM.camUntil){if(window.XCAM&&XCAM.z&&XCAM.z<1.25) window.XCAM=null; SM.camUntil=0}
  if(SM.lob&&!SM.lobbed&&SM.lob.y>=(typeof GROUND==='number'?GROUND:470)-6&&SM.lob.vy>40){SM.lob.vy=-480; SM.lob.fl=0.4; SM.lobbed=true}
  if(window.CX) CX.pose=null;
  step(dt||0);
  if(!SM.move) return;
  p.face=SM.move.face||p.face||1;
  p.vx=0; p.vy=0; p.rot=0; p.ground=true; p.noFlick=true;
  p.y=typeof GROUND==='number'?GROUND:p.y;
  p.state='s'+SM.move.name;
  if(typeof setAnim==='function'&&p.anim!=='idle') setAnim('idle', true);
}
if(typeof drawHUD==='function'){
  const _hud=drawHUD;
  drawHUD=function(){
    const r=_hud.apply(this, arguments);
    try{
      const b=SM.banner;
      if(b&&typeof fancy==='function'){
        const u=(performance.now()-b.t)/1100;
        if(u<1) fancy(b.text, 480, 78, 26, 0, 1, 0.9*(1-Math.max(0,u-0.7)/0.3), b.col);
        else SM.banner=null;
      }
    }catch(e){}
    return r;
  };
}
if(typeof dogStrike==='function'){
  const _ds=dogStrike;
  dogStrike=function(){
    const r=_ds.apply(this, arguments);
    try{if(spar()&&p.state==='hurt'&&SM.ready){p.vy=0; p.ground=true; begin('knockdown')}}catch(e){}
    return r;
  };
}
})();
