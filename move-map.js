// Move map for base Paddy: Pounce replaces the flashing Meow, tail spin gets a swoosh,
// and Claw / Pounce / Tail / Blink change with direction, double-tap and Claw chords.
// Holding Claw still charges. Story cutscenes and punch33.js are not edited.
(function(){
const arena=()=>{try{return typeof FORM==='function'&&typeof p!=='undefined'&&typeof dummies!=='undefined'}catch(e){return false}};
function base(){try{return !arena()||(FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt)}catch(e){return true}}
function rt(){return performance.now()/1000}
const MM=window.MM={seq:[], tier:'', api:null, spin:0, tag:null};
function say(t,c){
  try{if(typeof window.say==='function'&&arena()) window.say(t,c||'#fff',true)}catch(e){}
  try{if(MM.api&&MM.api.msg) MM.api.msg(t,c||'#fff')}catch(e){}
}
function hits(){
  if(arena()) return Math.max(p.combo||0, (p.keepT>0?p.keepCombo:0)||0, (typeof C!=='undefined'?C.n:0)||0);
  const w=MM.api&&MM.api.p; return w?Math.max((w.seq||'').replace(/[^C]/g,'').length, (w.mv&&w.mv.id)?1:0):0;
}
function tierOf(){const n=hits(); return n>=12?'ULTIMATE':n>=8?'BIG':n>=5?'POWER':''}
function push(ch){MM.seq.push(ch); if(MM.seq.length>8) MM.seq.shift()}
function seq(){return MM.seq.join('')}
function faceOf(){return (arena()?p.face:(MM.api&&MM.api.p&&MM.api.p.face))||1}
function keys(){return arena()?K:(MM.api&&MM.api.K)||{}}
function dir(){
  const K=keys(), face=faceOf();
  if(K.up&&!K.down) return 'up';
  if(K.down&&!K.up) return 'down';
  const d=(K.right?1:0)-(K.left?1:0);
  if(!d) return '';
  return d===face?'fwd':'back';
}
function doubled(){const h=window.CX&&CX.hold; return !!(h&&rt()-h.t<0.55)}
function boom(level){
  if(!arena()) return;
  const s=level==='ULTIMATE'?18:level==='BIG'?12:8;
  if(typeof shake!=='undefined') shake=Math.max(shake,s);
  if(level==='ULTIMATE'){ if(typeof slowT!=='undefined') slowT=Math.max(slowT,.22); if(typeof flashT!=='undefined') flashT=Math.max(flashT,.1)}
  else if(level==='BIG'&&typeof flashT!=='undefined') flashT=Math.max(flashT,.06);
}
function title(tier,name){MM.tier=tier+' FINISH'; MM.banner={t:rt(), text:tier+' FINISH', sub:name, tier}; say(tier+' FINISH', tier==='ULTIMATE'?'#ffe14d':tier==='BIG'?'#ffb070':'#fff'); boom(tier); MM.spin=rt()}
function keep(){
  if(!arena()) return;
  const n=Math.max(p.combo||0, p.keepCombo||0);
  p.keepCombo=n; p.keepT=0.9; if(typeof C!=='undefined'&&C.n>0) C.t=Math.max(C.t,.9);
}

function hitNow(power){
  if(arena()&&typeof areaHit==='function') areaHit(p.x+p.face*50, p.y-50, power?190:150, 'pounce');
  else if(MM.api&&MM.api.hitEnemy){
    const w=MM.api.p;
    for(const e of MM.api.enemies||[]){
      if(!e.alive) continue;
      const dx=(e.x-w.x)*w.face;
      if(dx>-50&&dx<200&&Math.abs(e.y-w.y)<180) MM.api.hitEnemy(e, w.face, {kb:power?900:520, launch:power?-700:-280, dmg:1});
    }
  }
}
function beginArena(state, anim, name, opt){
  opt=opt||{};
  if(typeof act==='function') act(state, anim, {say:name, c:opt.c||'#ffe9a8'});
  if(opt.vy){p.vy=opt.vy; p.ground=false; p.jumps=Math.max(p.jumps||0,1)}
  if(opt.vx) p.vx=p.face*opt.vx;
  MM.tag={name, t:rt(), paws:opt.paws||2, power:!!opt.power};
  MM.h1=MM.h2=false;
  keep();
}
function doPounce(kind){
  delete P.special;
  push('P');
  if(kind==='up') beginArena('pawpop','pawpop','POP POUNCE!',{vy:-680,vx:180,paws:1,power:true});
  else if(kind==='fwd') beginArena('pounce','pounce','LEAP SWIPE!',{vy:-520,vx:860,paws:2});
  else if(kind==='back') beginArena('pounce','swat','BACK SWIPE!',{vy:-300,vx:-480,paws:2});
  else if(kind==='flurry') beginArena('pounce','swat','PAW FLURRY!',{vy:-260,vx:280,paws:4});
  else beginArena('pounce','pounce','POUNCE!',{vy:-680,vx:520,paws:2});
}
function doTail(kind){
  delete P.tail;
  push('T');
  MM.spin=rt();
  if(kind==='tornado'){beginArena('tailwhip','tailwhip','TAIL TORNADO!',{vx:80,paws:3,power:true}); p.tn=3}
  else if(kind==='trip') beginArena('tailwhip','tailwhip','TAIL TRIP!',{vx:260,paws:1});
  else if(kind==='sweep') beginArena('tailwhip','tailwhip','TAIL SWEEP!',{vx:40,paws:2});
  else if(typeof tailWhip==='function'){tailWhip(MM._clawTail?1:1); MM.tag={name:'TAIL', t:rt(), paws:1}; if(MM._clawTail){MM.thenClaw=true; MM._clawTail=false}}
}
function blinkTo(mode){
  delete P.blink;
  push('B');
  const kc=Math.max(p.combo||0, p.keepCombo||0);
  if(typeof puffShadow==='function') puffShadow(p.x,p.y);
  let best=null, bd=1e9;
  for(const d of dummies){if(!d||!d.alive||d.benched) continue; const dd=Math.abs(d.x-p.x); if(dd<bd){bd=dd; best=d}}
  if(mode==='above'&&best){p.x=best.x-p.face*10; p.y=Math.max(80, best.y-160); p.vy=420; p.ground=false}
  else if(mode==='behind'&&best){p.x=best.x+(best.x>=p.x?-110:110); p.face=Math.sign(best.x-p.x)||p.face; p.y=best.y}
  else if(mode==='both'){p.x+=p.face*160; MM.both=rt()}
  else p.x+=p.face*240;
  if(typeof clampX==='function') p.x=clampX(p.x);
  if(typeof puffShadow==='function') puffShadow(p.x,p.y);
  p.combo=kc; p.keepCombo=kc; p.keepT=0.9; p.state='normal';
  if(typeof C!=='undefined'&&C.n>0) C.t=Math.max(C.t,.9);
  say(mode==='above'?'BLINK ABOVE!':mode==='behind'?'BLINK BEHIND!':mode==='both'?'BLINK FLURRY!':'BLINK!','#c9a7ff');
  if(mode==='punch'){MM.thenClaw=true; p.keepT=0.5}
  p.blinkCool=0.3;
}

function routeButton(which){
  if(!base()||!arena()) return false;
  if(which==='pounce') delete P.special;
  if(which==='tail') delete P.tail;
  if(which==='blink') delete P.blink;
  const d=dir(), dub=doubled(), chord=!!(K.attack&&which!=='claw');
  const t=tierOf();
  if(t&&dub){
    const name=which==='tail'?(d==='up'?'RUN-IN HAYMAKER':'TAIL STORM'):which==='pounce'?(d==='up'?'GRAB SLAM':'SUPER SWIPE'):which==='blink'?'POOF FINISH':'HAYMAKER';
    if(t==='ULTIMATE'||hits()>=12){beginArena('pawpop','pawpop',name,{vy:-760,vx:420,paws:3,power:true}); title('ULTIMATE', name); return true}
    if(t==='BIG'){beginArena('pounce','pounce',name,{vy:-560,vx:820,paws:2,power:true}); title('BIG', name); return true}
    beginArena('pounce','pounce',name,{vy:-420,vx:740,paws:2,power:true}); title('POWER', name); return true;
  }
  const s=seq();
  if(hits()>=8&&/JJP$/.test(s)&&d==='up'&&which==='claw'){title('ULTIMATE','SKY SLAM'); beginArena('pawpop','pawpop','SKY SLAM',{vy:-720,vx:200,paws:2,power:true}); push('U'); return true}
  if(hits()>=8&&/BT$/.test(s)&&which==='claw'&&d==='down'){title('ULTIMATE','AMBUSH SLAM'); beginArena('dive','dive','AMBUSH SLAM',{vy:1200,paws:2,power:true}); push('S'); return true}
  if(which==='pounce'){
    if(chord){MM.thenClaw=true}
    doPounce(dub?'flurry':d==='fwd'?'fwd':d==='up'?'up':d==='back'?'back':'alone');
    return true;
  }
  if(which==='tail'){
    if(chord) MM._clawTail=true;
    doTail(dub?'tornado':d==='fwd'?'trip':d==='down'?'sweep':'alone');
    return true;
  }
  if(which==='blink'){
    blinkTo(chord?'punch':dub?'both':d==='fwd'?'behind':d==='up'?'above':'alone');
    if(chord) MM.thenClaw=true;
    return true;
  }
  return false;
}

function arenaTick(){
  if(!base()) return;
  if(P.special){
    const moon=K.down&&!K.up&&!doubled()&&!tierOf();
    if(!moon){if(!routeButton('pounce')) doPounce(dir()||'alone')}
  }
  else if(P.tail&&p.state!=='tailwhip'){if(!routeButton('tail')){} }
  else if(P.blink){
    const d=dir();
    if(d||doubled()||K.attack||tierOf()) routeButton('blink');
  }
  if(P.attack&&!MM._claw){
    MM._claw=true;
    const d=dir(), s=seq();
    if(hits()>=8&&/JJP$/.test(s)&&d==='up'){delete P.attack; beginArena('pawpop','pawpop','SKY SLAM',{vy:-720,vx:220,paws:2,power:true}); title('ULTIMATE','SKY SLAM'); push('U'); return}
    if(hits()>=8&&/BT$/.test(s)&&d==='down'){delete P.attack; beginArena('dive','dive','AMBUSH SLAM',{vy:1100,paws:2,power:true}); title('ULTIMATE','AMBUSH SLAM'); push('S'); return}
    if(hits()>=8&&/PB$/.test(s)){delete P.attack; beginArena('pawpop','pawpop','GRAB SLAM',{vy:-640,vx:160,paws:2,power:true}); title('ULTIMATE','GRAB SLAM'); push('S'); return}
    if(!K.up){
      if(d==='fwd'){p._mmLunge=1; push('J')}
      else if(d==='back'){p._mmHook=1; push('J')}
      else push('J');
    } else push('U');
  }
  if(!P.attack) MM._claw=false;
  if(MM.tag&&p.state){
    const age=rt()-MM.tag.t;
    if(!MM.h1&&age>0.12){MM.h1=1; hitNow(MM.tag.power); pawFx()}
    if(!MM.h2&&MM.tag.paws>1&&age>0.26){MM.h2=1; hitNow(MM.tag.power); pawFx()}
    if(!MM.h3&&MM.tag.paws>3&&age>0.4){MM.h3=1; hitNow(true); pawFx()}
  }
  if(MM.thenClaw&&(p.state==='normal'||p.state==='land')&&rt()-(MM.tag&&MM.tag.t||0)>0.28){
    MM.thenClaw=false; if(typeof startClaw==='function') startClaw();
  }
  if(MM.both&&rt()-MM.both>0.12&&rt()-MM.both<0.18){if(typeof puffShadow==='function') puffShadow(p.x,p.y); p.x-=p.face*200; if(typeof clampX==='function') p.x=clampX(p.x); puffShadow(p.x,p.y); hitNow(false); MM.both=0}
  if(p.state==='mcharge'){doPounce('alone')}
}
function pawFx(){
  try{if(typeof spark==='function') spark(p.x+p.face*86, p.y-58, 10, ['#fff','#ffe9a8'], 220)}catch(e){}
  MM.paws=(MM.paws||0)+1; MM.pawT=rt();
}
function drawPaws(c, x, y, face){
  if(!MM.pawT||rt()-MM.pawT>0.32) return;
  const age=rt()-MM.pawT;
  c.save();
  c.translate(x+(face||1)*90, y-70);
  c.scale(face||1, 1);
  c.globalAlpha=Math.max(0, 1-age*2.6);
  for(let i=0;i<2;i++){
    c.save();
    c.translate(i?22:-6, i?-16:10);
    c.rotate(i?-0.5:0.4);
    c.fillStyle='#fff8ee';
    c.beginPath(); c.ellipse(0, 0, 26, 18, 0, 0, 6.28); c.fill();
    c.strokeStyle='#7a4a32'; c.lineWidth=3;
    c.stroke();
    c.fillStyle='#f0c2a4';
    for(const [dx,dy] of [[-10,-12],[0,-15],[10,-12]]){c.beginPath(); c.arc(dx, dy, 5, 0, 6.28); c.fill()}
    c.restore();
  }
  c.restore();
}
function drawBanner(c, x, y){
  const b=MM.banner; if(!b||rt()-b.t>1.35) return;
  if(arena()&&typeof VW!=='undefined'){x=VW/2-(typeof camX==='number'?camX:0); y=210-(typeof camY==='number'?camY:0)}
  c.save();
  c.font='900 26px sans-serif';
  c.textAlign='center'; c.textBaseline='middle';
  c.lineWidth=5; c.strokeStyle='#1a1208';
  c.strokeText(b.text, x, y-150);
  c.fillStyle=b.tier==='ULTIMATE'?'#ffe14d':b.tier==='BIG'?'#ffb070':'#fff';
  c.fillText(b.text, x, y-150);
  if(b.sub){c.font='700 16px sans-serif'; c.strokeText(b.sub, x, y-124); c.fillStyle='#fff'; c.fillText(b.sub, x, y-124)}
  c.restore();
}
function drawTail(c, x, y, face){
  const spinning=arena()&&(p.state==='tailwhip'||(MM.spin&&rt()-MM.spin<0.55));
  const lv=MM.api&&MM.api.p&&MM.api.p.mv&&/tail|tornado|sweep|trip/.test(MM.api.p.mv.id);
  if(!spinning&&!lv&&!(MM.spin&&rt()-MM.spin<0.55)) return;
  const t=arena()?p.t:(MM.api.p.mv?MM.api.p.mv.t:0);
  if(arena()&&typeof FR!=='undefined'&&FR[p.anim]&&FR[p.anim][p.fi]&&typeof IMG!=='undefined'){
    const fr=FR[p.anim][p.fi], im=IMG[fr.f];
    if(im&&im.complete){
      const sc=typeof SC==='number'?SC:0.5;
      for(let i=1;i<=4;i++){
        c.save(); c.globalAlpha=0.22-i*0.04;
        c.translate(x-face*i*22, y+i*2); c.scale((face||1)*sc, sc);
        c.drawImage(im, -fr.ax, -fr.ay); c.restore();
      }
    }
  }
  c.save();
  c.translate(x, y-48);
  c.scale(face||1, 1);
  c.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){
    c.globalAlpha=0.55-i*0.1;
    c.strokeStyle=i%2?'#ffe9a8':'#fff';
    c.lineWidth=16-i*3;
    c.beginPath();
    c.arc(8, 6, 54+i*14, t*11-1.5, t*11+1.6);
    c.stroke();
  }
  c.globalAlpha=0.35;
  c.strokeStyle='#fff6d0';
  c.lineWidth=3;
  c.beginPath(); c.ellipse(0, 8, 92, 28, t*3, 0, 6.28); c.stroke();
  c.restore();
  if(arena()&&typeof sparks!=='undefined'&&Math.floor(t*18)%2===0){
    sparks.push({x:x+(face||1)*70, y:y-40, vx:(face||1)*80, vy:-40, l:.25, c:'#fff'});
  }
}
MM.drawLevel=function(ctx2, cam){
  if(!MM.api||!MM.api.p) return;
  const w=MM.api.p;
  drawTail(ctx2, w.x-cam.x, w.y-cam.y, w.face||1);
  drawPaws(ctx2, w.x-cam.x, w.y-cam.y, w.face||1);
  drawBanner(ctx2, w.x-cam.x, w.y-cam.y);
};

if(arena()&&typeof r9Pre==='function'){
  const _pre=r9Pre;
  r9Pre=function(dt){try{arenaTick()}catch(e){if(!arenaTick.err){arenaTick.err=1;console.warn('mm',e)}} return _pre.apply(this, arguments)};
  const _up=update;
  update=function(dt){
    const r=_up.apply(this, arguments);
    try{
      if(p._mmLunge&&p.state==='claw'&&p.t<0.16){p.vx=p.face*620; if(!p._mmSaid){p._mmSaid=1; say('LUNGE JAB!','#fff')}}
      if(p._mmLunge&&p.t>=0.16){p._mmLunge=0; p._mmSaid=0}
      if(p._mmHook&&p.state==='claw'&&typeof setAnim==='function'&&FR.bxlh){setAnim('bxlh', true); if(window.P33) P33.a='bxlh'; say('COUNTER HOOK!','#bfe8ff'); p._mmHook=0}
    }catch(e){}
    return r;
  };
  const _fx=drawFx;
  drawFx=function(){try{drawTail(ctx, p.x, p.y, p.face); drawPaws(ctx, p.x, p.y, p.face); drawBanner(ctx, p.x, p.y)}catch(e){} return _fx.apply(this, arguments)};
}

MM.level=function(dt, api){MM.api=api};
MM.takeLevel=function(){
  if(!MM.api||!MM.api.P||!MM.api.startMove) return false;
  const P=MM.api.P, go=MM.api.startMove, d=dir(), dub=doubled(), chord=!!P.attack;
  const t=tierOf();
  if(P.meow){
    P.meow=0;
    if(t&&dub){title(t==='ULTIMATE'||hits()>=12?'ULTIMATE':t, 'SUPER SWIPE'); go(t==='POWER'?'pouncefar':'flurry'); MM.spin=rt(); return true}
    push('P');
    if(chord){go('meow'); MM.api.p.buf='attack'; MM.api.p.bufT=.4}
    else go(dub?'flurry':d==='fwd'?'pouncefar':d==='up'?'pounceup':'meow');
    return true;
  }
  if(P.tail){
    if(!(d||dub||chord||t)) return false;
    P.tail=0; push('T'); MM.spin=rt();
    if(t&&dub){title(t==='ULTIMATE'||hits()>=12?'ULTIMATE':t, d==='up'?'RUN-IN HAYMAKER':'TAIL STORM'); go('tornado'); return true}
    if(chord){go('tailsweep'); MM.api.p.buf='attack'; MM.api.p.bufT=.45; return true}
    go(dub?'tornado':d==='fwd'?'tailtrip':d==='down'?'tailsweep':'tail1');
    return true;
  }
  return false;
};
})();
