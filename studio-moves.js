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
      if(room()&&SM.ready&&p.ground&&!SM.move){
        const age=fwdAge();
        if(k==='down'&&age>=0&&age<0.35&&!K[faceKey()]){delete P.down; begin('roll')}
        else if(k==='up'&&age>=0&&age<0.35&&!K[faceKey()]){delete P.jump; delete P.up; begin('frontflip')}
        else if(k==='tail'&&K.down&&K[faceKey()]){delete P.tail; begin('capoeira')}
      }
      if(k==='attack'&&room()&&SM.ready&&p.ground&&plainClaw()&&!(SM.move&&SM.move.name==='roundhouse')){
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
  SM.move={name, spec, i:0, acc:0, hit:false, hold:false, held:0, face:p.face||1};
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
    if(name==='backflip'||name==='roll') p.inv=Math.max(p.inv||0, name==='roll'?0.55:0.9);
    try{if(typeof say==='function') say(row[0], row[1], true)}catch(e){}
    if(row[2]&&window.TC&&TC.on&&!TC.demo&&TC.note) TC.note(row[2]);
  }
  return true;
}
SM.begin=begin;
function tapped(){return !!(P.attack||P.jump||P.special||P.tail||P.blink||P.dash||P.up||P.down||P.left||P.right)}
function endMove(){
  const m=SM.move; if(!m) return;
  const sc=SM.pack.scale;
  if(m.spec.end_x){
    p.x+=(m.face||1)*m.spec.end_x*sc;
    if(typeof clampX==='function') p.x=clampX(p.x);
  }
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
      got=true; break;
    }
  }
  if(got&&typeof shake!=='undefined') shake=Math.max(shake||0, 8);
  return got;
}
function step(dt){
  const m=SM.move; if(!m) return;
  const frames=m.spec.frames;
  if(m.name==='powerland'&&tapped()){endMove(); return}
  if(m.name==='knockdown'&&tapped()&&(m.hold||m.i>3)){endMove(); return}
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
    if(fr.hold){m.hold=true; m.held=0; return}
  }
  if(m.i>=frames.length-1&&m.acc>=frames[m.i].ms&&!frames[m.i].hold) endMove();
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
  if(window.CX) CX.pose=null;
  step(dt||0);
  if(!SM.move) return;
  p.face=SM.move.face||p.face||1;
  p.vx=0; p.vy=0; p.rot=0; p.ground=true; p.noFlick=true;
  p.y=typeof GROUND==='number'?GROUND:p.y;
  p.state='s'+SM.move.name;
  if(typeof setAnim==='function'&&p.anim!=='idle') setAnim('idle', true);
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
