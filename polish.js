// Polish for base Paddy: face stays forward on a back tap, the dummy stays in view,
// the pounce uses the real leap frames, a grab shows two paws, and holding an
// uppercut charges one big punch instead of firing over and over.
(function(){
const PL=window.PL={owns:true, rest:1, holdT:0, holdDir:0, charge:null, nextUp:0, grabT:0};
function arena(){try{return typeof FORM==='function'&&typeof p!=='undefined'&&typeof dummies!=='undefined'}catch(e){return false}}
function base(){try{return arena()&&FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(e){return false}}
function now(){return performance.now()/1000}
function say(t,c){try{if(typeof window.say==='function') window.say(t,c||'#fff',true)}catch(e){}}

function faceFix(){
  if(!base()) return;
  if(!PL.rest) PL.rest=p.face||1;
  const dir=(K.right?1:0)-(K.left?1:0);
  const mv=window.OD&&OD.move&&OD.move();
  if(mv==='back_step'){p.face=PL.rest; return}
  if(dir && dir!==PL.rest) p.face=PL.rest;
  else if(!dir) PL.rest=p.face||PL.rest;
}
function backGate(){
  if(!base()||!window.KD47||!window.OD||!OD.backDash) return;
  const q=KD47.req;
  if(q&&q.k==='back'&&!PL.back){
    KD47.req=null;
    PL.back={t:now(), face:q.face||p.face||1, key:q.dir};
  }
  if(!PL.back) return;
  const b=PL.back, age=now()-b.t, held=b.key&&K[b.key];
  if(held&&age>=0.14){PL.back=null; OD.backDash(b.face); say('BACK DASH!','#fff')}
  else if(!held){
    PL.back=null;
    p.face=-(b.face||1); PL.rest=p.face; PL.turn=now();
    say('TURN!','#fff');
  }
}

function pounceFrames(){
  if(!base()||typeof F==='undefined'||!F.pounce) return;
  if(p.state!=='pounce'&&p.anim!=='pounce') return;
  FR.pounce=F.pounce;
  if(typeof A!=='undefined') A.pounce=['pounce',null,14,0];
  const n=F.pounce.length||1;
  const u=Math.min(0.999, 0.42+Math.min(0.55,(p.t||0)/0.36));
  p.anim='pounce';
  p.fi=Math.min(n-1, Math.floor(u*n));
}

function keepDummy(){
  if(!arena()) return;
  const room=window.PRACTICE&&PRACTICE.on;
  const train=window.TRAIN&&TRAIN.TR&&TRAIN.TR.on;
  const floor=typeof GROUND==='number'?GROUND:470;
  for(const d of dummies){
    if(!d||d.sp||d.cr||d.train) continue;
    if(d.y<floor-560){d.y=floor-560; if(d.vy<0) d.vy=0}
    if(d.vy<-820) d.vy=-820;
  }
  if(room||train||(p.hunt)) return;
  const d=dummies.find(q=>q&&!q.sp&&!q.cr&&!q.train);
  if(!d) return;
  const off=d.y<floor-400;
  if(d.benched||(off&&(!d.alive||d.t>0.8))){
    d.benched=false; d.alive=true; d.hp=d.max||d.hp||60; d.hpShow=d.hp;
    d.x=Math.max((typeof LW==='number'?LW:40)+140, Math.min((typeof WALL_X==='number'?WALL_X:900)-140, p.x+p.face*200));
    d.y=floor; d.vx=0; d.vy=0; d.fl=0;
    try{if(typeof dSet==='function') dSet(d,'idle','r_idle')}catch(e){}
  }
}

function highPunch(){
  delete P.attack; delete P.jump;
  if(typeof startClaw==='function') startClaw();
  if(p.state==='claw'&&typeof setAnim==='function'&&typeof FR!=='undefined'&&FR.bxlh){
    setAnim('bxlh', true);
    if(window.P33){P33.a='bxlh'; P33.last='bxlh'}
  }
  say('HIGH!','#fff');
  PL.nextUp=now();
}
function upper(){
  if(!base()||!(window.OD&&OD.wind&&OD.cast)) return;
  // Practice Room "UPPERCUT: NEW" owns Up+Claw (the boxer sheets). Stealing it here
  // swapped in a short hop and the punch never played.
  if(window.UC49&&UC49.active&&UC49.active()) return;
  if(P.attack&&K.up&&p.ground&&!p.wall&&!(OD.move&&OD.move()&&OD.move()!=='wind')){
    delete P.attack; delete P.jump;
    if(!PL.charge) PL.charge={t:now(), face:p.face};
  }
  if(PL.charge&&K.up&&K.attack&&now()-PL.charge.t>=0.12){
    delete P.attack; delete P.jump;
    OD.wind(PL.charge.face, false);
  }
  if(PL.charge&&!K.attack){
    const held=now()-PL.charge.t, face=PL.charge.face;
    PL.charge=null;
    if(held>=0.16){OD.cast(face, true, false); PL.nextUp=now()}
    else if(now()-PL.nextUp<0.7){OD.cast(face, false, false); PL.nextUp=now()}
    else highPunch();
  }
}

function drawGrab(c){
  const g=window.CX&&CX.grab;
  if(!g||!arena()||!CX.grabT||now()-CX.grabT>0.7) return;
  const age=now()-CX.grabT;
  const x=g.x, y=Math.min(g.y, p.y)-40;
  c.save();
  c.globalAlpha=Math.max(0, 1-age);
  c.strokeStyle='#fff6ea'; c.lineWidth=8; c.lineCap='round';
  c.beginPath(); c.moveTo(p.x, p.y-70); c.lineTo(x, y); c.stroke();
  for(let i=0;i<2;i++){
    c.save();
    c.translate(x+(i?18:-18), y+(i?6:-8));
    c.rotate(i?0.4:-0.3);
    c.fillStyle='#fff8ee';
    c.beginPath(); c.ellipse(0,0,22,16,0,0,6.28); c.fill();
    c.fillStyle='#e7b898';
    [[-8,-10],[0,-12],[8,-9]].forEach(([dx,dy])=>{c.beginPath(); c.arc(dx,dy,4,0,6.28); c.fill()});
    c.restore();
  }
  c.restore();
}

if(arena()&&typeof r9Pre==='function'){
  const _hd=typeof hitDummy==='function'?hitDummy:null;
  if(_hd) hitDummy=function(d,move,dir){
    try{if(window.PRACTICE&&PRACTICE.on&&typeof FORM==='function'&&FORM()===0&&d&&typeof p!=='undefined'){
      const g=(d.x-p.x)*(p.face||1);
      if(g<-40) return;
    }}catch(e){}
    const n0=typeof sparks!=='undefined'?sparks.length:0;
    const r=_hd.apply(this,arguments);
    if(d&&d.vy<-1100) d.vy=-1100;
    if(window.PRACTICE&&PRACTICE.on&&typeof sparks!=='undefined'&&sparks.length>n0+4) sparks.length=n0+4;
    return r;
  };
  const _pre=r9Pre;
  r9Pre=function(dt){try{upper(); backGate()}catch(e){if(!upper.err){upper.err=1;console.warn('pl',e)}} return _pre.apply(this, arguments)};
  const _up=update;
  update=function(dt){
    const r=_up.apply(this, arguments);
    try{faceFix(); pounceFrames(); keepDummy()}catch(e){if(!faceFix.err){faceFix.err=1;console.warn('pl up',e)}}
    return r;
  };
  const _fx=drawFx;
  drawFx=function(){try{drawGrab(ctx)}catch(e){} return _fx.apply(this, arguments)};
  if(typeof r11Sq==='function'){
    const _sq=r11Sq;
    r11Sq=function(){const s=_sq();try{if(window.PRACTICE&&PRACTICE.on&&base())return 1}catch(e){}return s};
  }
  if(typeof drawFrame==='function'){
    const _df=drawFrame;
    drawFrame=function(f,x,y,face,alpha){
      const mine=Math.abs((x||0)-(p.x||0))<16&&Math.abs((y||0)-(p.y||0))<24;
      const air=mine&&window.PRACTICE&&PRACTICE.on&&base()&&/^(jump|fall|apex|djump|airswipe)$/.test(p.anim||'');
      const spin=!!(PL.turn&&now()-PL.turn<0.12&&mine);
      if(!spin&&!air) return _df.apply(this, arguments);
      const scx=(spin?Math.max(0.08,Math.abs(Math.cos(((now()-PL.turn)/0.12)*Math.PI))):1)*(air?.78:1);
      const scy=air?.78:1;
      ctx.save(); ctx.translate(x,y); ctx.scale(scx,scy); ctx.translate(-x,-y);
      const r=_df.apply(this, arguments); ctx.restore(); return r;
    };
  }
}
})();
