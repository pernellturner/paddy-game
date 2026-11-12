// Practice Room fixes for base Paddy. Story mode never loads this file.
// Landing uses a crouch instead of the belly-flop frame, punches only connect
// when the fist can reach, a tap in the air hops over, and a hold is the shadow pounce.
(function(root){
const HOLD=0.18;
const LAUNCH=/^(bxpu|uppercut|odup|odfly|launcher|tail3|spike|dive|diveclaw)$/;
const SPIN=/^(cyclone|cyclonefin|tornado|tornadofin|twister|tailwhip|tail3|airspin)$/;
function reachOK(face, px, py, dx, dy, grounded, move){
  const f=face||1, g=(dx-px)*f, launch=LAUNCH.test(move||''), spin=SPIN.test(move||'');
  if(spin){
    if(Math.abs(dx-px)>(grounded?150:180)) return false;
    if(grounded&&dy<py-90) return false;
    if(!grounded&&Math.abs(dy-py)>170) return false;
    return true;
  }
  if(g<-12) return false;
  if(!grounded) return Math.abs(dx-px)<=170&&Math.abs(dy-py)<=160;
  if(g>(launch?180:150)) return false;
  if(dy<py-(launch?220:(move==='bxph'?110:74))) return false;
  return true;
}
function hopPlan(face, px, targets){
  const f=face||1;
  let span=130;
  for(const d of targets||[]){
    if(!d||d.alive===false||d.benched) continue;
    const g=(d.x-px)*f;
    if(g>24&&g<240) span=Math.max(span, Math.min(280, g+100));
  }
  return {vy:-430, vx:f*Math.max(240, Math.min(520, span/0.42))};
}
root.PRFIX={reachOK, hopPlan, HOLD};
if(typeof hitDummy!=='function'||typeof update!=='function'||typeof drawFx!=='function') return;

const G={wasAir:false, peak:0, settle:0, pin:0, hayX:null, air:null, frames:null};
function room(){
  try{return !!(window.PRACTICE&&PRACTICE.on)&&typeof FORM==='function'&&FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(e){return false}
}
function attackFace(){
  let face=p.face||1;
  if(window.P33&&p.state==='claw'&&P33.face) face=P33.face;
  const rest=window.PL&&PL.rest;
  const dir=(typeof K!=='undefined')?((K.right?1:0)-(K.left?1:0)):0;
  if(rest&&dir&&dir!==rest) face=rest;
  return face||1;
}
function sayTo(t,c){try{if(typeof say==='function') say(t,c||'#fff',true)}catch(e){}}
function poseFix(){
  if(typeof F==='undefined'||!F.k_jump||!F.k_jump[0]||typeof FR==='undefined') return;
  if(!G.frames) G.frames={land:FR.land, hard:FR.hardland, bk:FR.bk_land};
  if(room()){
    const c=[F.k_jump[0]];
    FR.land=c; FR.hardland=c; FR.bk_land=c;
    if(typeof A!=='undefined'&&A.land) A.land[2]=12;
  }else if(G.frames.land){
    FR.land=G.frames.land; FR.hardland=G.frames.hard; FR.bk_land=G.frames.bk;
  }
}
function finitePos(d){return !!(d&&isFinite(d.x)&&isFinite(d.y))}
function shadowPounce(){
  const face=G.air?G.air.face:attackFace();
  let best=null, bd=1e9;
  for(const d of dummies){
    if(!d||d.benched||!d.alive||!finitePos(d)) continue;
    const dd=Math.abs(d.x-p.x);
    if(dd<bd){bd=dd; best=d}
  }
  if(typeof puffShadow==='function') puffShadow(p.x, p.y);
  if(best){
    const side=best.x>=p.x?1:-1;
    p.x=typeof clampX==='function'?clampX(best.x+side*78):best.x+side*78;
    p.face=-side;
    const fl=typeof floorAt==='function'?floorAt(p.x):p.y;
    p.y=Math.min(fl, best.y);
    if(!isFinite(p.x)||!isFinite(p.y)){p.x=370; p.y=fl}
    p.ground=p.y>=fl-2;
    p.vy=best.y<fl-40?-40:0;
    p.vx=0;
    if(Math.abs(best.x-p.x)<130) hitDummy(best, 'claw2', p.face);
  }else{
    p.face=face;
    p.x=typeof clampX==='function'?clampX(p.x+face*140):p.x+face*140;
  }
  if(typeof puffShadow==='function') puffShadow(p.x, p.y);
  if(window.PL) PL.rest=p.face;
  p.state='normal'; p.rot=0;
  sayTo('SHADOW POUNCE!','#ff9ad5');
}
function hopOver(){
  const plan=hopPlan(G.air?G.air.face:attackFace(), p.x, dummies);
  p.face=G.air?G.air.face:(p.face||1);
  p.ground=false; p.vy=plan.vy; p.vx=plan.vx;
  p.jumps=Math.max(p.jumps||0, 2); p.state='normal'; p.rot=0; p.t=0;
  if(typeof setAnim==='function') setAnim('jump', true);
  sayTo('POUNCE!','#ffe9a8');
}
function armAir(){
  if(!room()||p.ground||p.wall) return;
  if(['bunny','lkult','hurt','respawn','ledge'].includes(p.state)) return;
  if(G.air){delete P.blink; delete P.special; return}
  if(!(P.blink||P.special)) return;
  G.air={which:P.blink?'blink':'special', t:performance.now()/1000, face:attackFace(), fired:false};
  delete P.blink; delete P.special;
}
function stepAir(){
  if(!G.air) return;
  const age=performance.now()/1000-G.air.t, held=!!(typeof K!=='undefined'&&K[G.air.which]);
  if(!G.air.fired&&held&&age>=HOLD&&!p.ground){G.air.fired=true; shadowPounce()}
  if(!held||p.ground){
    if(!G.air.fired&&!p.ground) hopOver();
    G.air=null;
  }
}
function onScreen(){
  if(typeof scale!=='number'||typeof cv==='undefined'||!cv) return true;
  let x=p.x, y=p.y;
  if(typeof cine!=='undefined'&&cine&&cine.on&&isFinite(cine.z)&&cine.z>0.2){
    x=cine.tx+(p.x-cine.fx)*cine.z;
    y=cine.ty+(p.y-cine.fy)*cine.z;
  }
  const ax=(typeof offX==='number'?offX:0)+(x+(typeof camX==='number'?camX:0))*scale;
  const ay=(typeof offY==='number'?offY:0)+(y+(typeof camY==='number'?camY:0))*scale;
  const top=ay-160*scale, bot=ay+16*scale;
  return ax>-70&&ax<cv.width+70&&bot>0&&top<cv.height;
}
function wake(){
  const face=(p.face===1||p.face===-1)?p.face:1;
  p.x=370; p.y=typeof GROUND==='number'?GROUND:470;
  p.vx=0; p.vy=0; p.ground=true; p.rot=0; p.wall=false; p.blend=0; p.face=face;
  p.state='normal'; p.t=0;
  if(typeof setAnim==='function') setAnim('idle', true);
  if(typeof camX!=='undefined') camX=0;
  if(typeof camY!=='undefined') camY=0;
  if(typeof cine!=='undefined'&&cine){cine.z=1; cine.tz=1; cine.fx=p.x; cine.fy=p.y-105; cine.on=false}
  if(window.CX) CX.pose=null;
  if(window.P33){P33.a=null; P33.legacy=false}
  G.lost=0;
}
function rescue(){
  if(!room()){G.lost=0; return}
  const lostPos=!isFinite(p.x)||!isFinite(p.y)||!isFinite(p.vx)||!isFinite(p.vy)||!isFinite(p.face)||!p.face
    ||p.x<(typeof LW==='number'?LW:40)-120||p.x>(typeof WALL_X==='number'?WALL_X:880)+120
    ||p.y<(typeof GROUND==='number'?GROUND:470)-2400||p.y>(typeof GROUND==='number'?GROUND:470)+80;
  const fr=(typeof FR!=='undefined'&&FR[p.anim]||[])[p.fi];
  if(fr&&/kidscoot|kidskate/.test(fr.f||'')){wake(); return}
  if(lostPos){wake(); return}
  if(typeof cine!=='undefined'&&cine&&(!isFinite(cine.z)||cine.z<0.25||cine.z>2.4)){cine.z=1; cine.tz=1; cine.fx=p.x; cine.fy=p.y-105}
  if(!onScreen()){
    G.lost=(G.lost||0)+1;
    if(G.lost>10){
      if(typeof camX!=='undefined') camX=0;
      if(typeof camY!=='undefined') camY=Math.max(0, 200-p.y);
      if(typeof cine!=='undefined'&&cine){cine.z=1; cine.tz=1; cine.fx=p.x; cine.fy=p.y-105; cine.on=false}
      if(!onScreen()) wake();
      G.lost=0;
    }
  }else G.lost=0;
}
function drivePounce(dt){
  const plan=window.MM&&MM.plan;
  if(!plan) return;
  if(p.state!=='pounce'){
    if(plan.chain&&(p.state==='land'||p.state==='normal'||p.state==='claw')){
      if(p.state!=='claw'){p.state='normal'; p.ground=true; if(typeof startClaw==='function') startClaw()}
    }
    p.noFlick=false; MM.plan=null; return;
  }
  const face=plan.face||p.face||1;
  const travelled=(p.x-plan.x0)*face;
  if(travelled>plan.gap) p.x=plan.x0+face*plan.gap;
  else if(travelled<plan.gap-6) p.vx=face*Math.min(plan.shadow?640:460, (plan.gap-travelled)/Math.max(0.04, dt||0.016));
  else p.vx*=0.2;
  const t=p.t||0;
  const frames=(F&&F.pounce)||[];
  const n=frames.length||1;
  if(t<0.1) p.fi=0;
  else if(t<0.36) p.fi=1+Math.floor((t-0.1)/0.09)%Math.max(1, n-2);
  else p.fi=n-1;
  p.anim='pounce';
  if(window.KD47&&KD47.lines) KD47.lines.length=0;
  p.noFlick=true;
  if(P.attack){plan.chain=true; delete P.attack}
  if(!plan.hit&&t>0.14){
    plan.hit=1;
    let got=false;
    for(const d of dummies){
      if(!d||d.benched||d.alive===false) continue;
      const g=(d.x-p.x)*face;
      if(g>-50&&g<150&&Math.abs((d.y||0)-p.y)<200){hitDummy(d, plan.shadow?'pounce':'claw2', face); got=true; break}
    }
    if(!got&&typeof areaHit==='function') areaHit(p.x+face*60, p.y-40, plan.shadow?170:140, plan.shadow?'pounce':'claw2');
    if(typeof shake!=='undefined') shake=Math.max(shake, plan.shadow?8:4);
  }
  if(p.ground&&t>0.2){
    const chain=plan.chain;
    MM.plan=null;
    p.vx*=0.3; p.noFlick=false;
    if(chain){p.state='normal'; p.ground=true; if(typeof startClaw==='function') startClaw()}
  }
}
function after(dt){
  poseFix();
  try{drivePounce(dt)}catch(e){if(!drivePounce.err){drivePounce.err=1; console.warn('pounce', e)}}
  rescue();
  if(room()&&p.state==='claw'&&p.anim==='bxph'&&window.KD48&&KD48.pow&&KD48.pow.kind==='hay'){
    if(G.hayX==null) G.hayX=p.x;
    const f=attackFace(), travelled=(p.x-G.hayX)*f;
    if(travelled>16) p.x=G.hayX+f*16;
    if(typeof clampX==='function') p.x=clampX(p.x);
  }else G.hayX=null;
  if(!room()){G.settle=0; G.pin=0; G.wasAir=!p.ground; G.peak=0; return}
  p.idleT=0;
  if(p.state==='manner'){p.state='normal'; p.rot=0; if(typeof setAnim==='function') setAnim('idle', true)}
  if(p.ground&&!['airspin','tailwhip','bunny','lk'].includes(p.state)) p.rot=0;
  const fl=typeof floorAt==='function'?floorAt(p.x):p.y;
  if(!p.ground) G.peak=Math.max(G.peak||0, fl-p.y);
  if(G.wasAir&&p.ground&&(G.peak||0)>70&&!['claw','tailwhip','bunny','kcharge','dash','kpounce'].includes(p.state)){
    G.settle=0.2; G.pin=0.24; p.rot=0; p.vy=0; p.vx*=0.45;
  }
  if(p.ground) G.peak=0;
  G.wasAir=!p.ground;
  if(G.pin>0){
    G.pin-=dt;
    if(p.vy<0&&(p.jumps||0)>0&&(P.jump||K.jump||K.up)) G.pin=0;
    else if(['normal','land','hardland','manner','od'].includes(p.state)){
      p.vy=0; p.rot=0; p.ground=true; p.y=fl;
      if(p.vx*(p.face||1)<0) p.vx*=0.35;
    }
  }
  if(G.settle>0){
    if(['claw','tailwhip','kcharge','dash','kpounce','bunny','airspin','airswipe'].includes(p.state)) G.settle=0;
    else if(['normal','land','hardland','manner','od'].includes(p.state)){
      G.settle-=dt;
      if(G.settle<=0||P.attack||P.jump||P.tail||P.blink||P.special||P.dash){
        G.settle=0;
        if(p.state==='land'||p.state==='hardland'||p.state==='manner'){p.state='normal'; p.t=0}
      }else{
        p.state='land'; p.anim='land'; p.fi=0; p.ft=0; p.rot=0; p.ground=true; p.vy=0; p.y=fl;
      }
    }
  }
}
function paintSpin(){
  if(!p.cyc) return;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  const col=p.cyc.col||'#7fffd4';
  for(let k=0;k<5;k++){
    const a=(typeof now==='number'?now:0)*14+k*1.1, r=46+k*20;
    ctx.globalAlpha=0.62-k*0.09;
    ctx.strokeStyle=k%2?'#fff':col;
    ctx.lineWidth=8-k;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y-24-k*26, r, r*0.36, 0, a, a+3.3);
    ctx.stroke();
  }
  ctx.restore();
}

const _hd=hitDummy;
hitDummy=function(d, move, dir){
  if(room()&&d&&typeof p!=='undefined'){
    const face=attackFace();
    if(!reachOK(face, p.x, p.y, d.x, d.y, !!p.ground, move)) return;
  }
  const r=_hd.apply(this, arguments);
  try{
    // A grounded jab must not restart the slow float. A haymaker can still hop;
    // only a real launcher keeps him up.
    if(room()&&d&&p.ground&&!LAUNCH.test(move||'')&&!SPIN.test(move||'')){
      const k=(typeof KB!=='undefined'&&KB[move])||[0,0];
      if(k[1]>-400) d.fl=Math.min(d.fl||0, 0.12);
    }
  }catch(e){}
  return r;
};
const _pre=r9Pre;
r9Pre=function(dt){
  try{armAir(); stepAir()}catch(e){if(!armAir.err){armAir.err=1; console.warn('practice air', e)}}
  return _pre.apply(this, arguments);
};
const _up=update;
update=function(dt){
  const r=_up.apply(this, arguments);
  try{after(dt||0)}catch(e){if(!after.err){after.err=1; console.warn('practice fix', e)}}
  return r;
};
const _fx=drawFx;
drawFx=function(){
  const r=_fx.apply(this, arguments);
  try{if(room()) paintSpin()}catch(e){}
  return r;
};
function badCat(){
  const fr=(typeof FR!=='undefined'&&FR[p.anim]||[])[p.fi]||(typeof FR!=='undefined'&&FR[p.anim]||[])[0];
  if(!fr||!fr.f) return true;
  if(/kidscoot|kidskate|^en_/.test(fr.f)) return true;
  const im=typeof IMG!=='undefined'&&IMG[fr.f];
  if(!im||!im.naturalWidth) return true;
  if((fr.ay||0)>(fr.h||0)+70) return true;
  return false;
}
function paintCat(){
  const idle=typeof FR!=='undefined'&&FR.idle&&FR.idle[0];
  const im=idle&&typeof IMG!=='undefined'&&IMG[idle.f];
  if(!idle||!im||!im.naturalWidth||typeof ctx==='undefined') return;
  ctx.save();
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';
  ctx.translate(p.x, p.y);
  ctx.scale((p.face||1)*(typeof SC==='number'?SC:0.8), typeof SC==='number'?SC:0.8);
  ctx.drawImage(im, -idle.ax, -idle.ay);
  ctx.restore();
}
if(typeof r11Sq==='function'){
  const _sq=r11Sq;
  r11Sq=function(){
    let s=1;
    try{s=_sq()}catch(e){s=1}
    if(!isFinite(s)||s<0.45||s>1.75) s=1;
    if(room()) return 1;
    return s;
  };
}
const _hudCat=drawHUD;
drawHUD=function(){
  try{
    if(room()&&badCat()){
      if(/kidscoot|kidskate/.test(p.anim||'')||/kidscoot|kidskate/.test(((FR[p.anim]||[])[p.fi]||{}).f||'')){
        p.state='normal'; if(typeof setAnim==='function') setAnim('idle', true);
      }
      paintCat();
    }
  }catch(e){}
  return _hudCat.apply(this, arguments);
};
})(typeof window!=='undefined'?window:globalThis);
