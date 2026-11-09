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
  if(typeof shake!=='undefined') shake=Math.max(shake, level==='ULTIMATE'?4:2);
}
function title(tier,name){
  MM.tier=tier+' FINISH'; MM.banner={t:rt(), text:tier+' FINISH', sub:name, tier}; boom(tier);
  if(/TAIL/.test(name)) MM.spin=rt();
  try{ if(typeof texts!=='undefined') texts.length=0 }catch(e){}
}
function keep(){
  if(!arena()) return;
  const n=Math.max(p.combo||0, p.keepCombo||0);
  p.keepCombo=n; p.keepT=0.9; if(typeof C!=='undefined'&&C.n>0) C.t=Math.max(C.t,.9);
}

function hitNow(power, move){
  const boost=MM.boost||0;
  if(arena()&&typeof areaHit==='function') areaHit(p.x+p.face*50, p.y-50, power?190:150, move||'pounce');
  if(arena()&&boost&&typeof dummies!=='undefined'){
    for(const d of dummies){
      if(!d||!d.alive) continue;
      if(Math.abs(d.x-p.x)<200){d.vx+=p.face*boost*480; d.vy-=boost*220}
    }
  }
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
  if(typeof act==='function') act(state, anim, opt.quiet?null:{say:name, c:opt.c||'#ffe9a8'});
  if(opt.vy){p.vy=opt.vy; p.ground=false; p.jumps=Math.max(p.jumps||0,1)}
  if(opt.vx) p.vx=p.face*opt.vx;
  MM.tag={name, t:rt(), paws:opt.paws||2, power:!!opt.power};
  MM.h1=MM.h2=false;
  keep();
}
function firePounce(k, opt){
  opt=opt||{};
  const tap=k<0.12;
  const u=Math.min(1, k/0.8);
  try{ if(typeof P!=='undefined'&&P) delete P.special }catch(e){}
  push('P');
  if(opt.level&&MM.api&&MM.api.startMove){
    const w=MM.api.p, go=MM.api.startMove;
    go(opt.dub?'flurry':opt.dir==='fwd'?'pouncefar':opt.dir==='up'?'pounceup':'meow');
    if(w.mv&&w.mv.d){
      const src=w.mv.d;
      const d=Object.assign({}, src, {
        vx:180+u*680,
        vy:-240-u*500,
        kb:320+Math.round(u*560),
        launch:-160-u*380,
        say:tap?'POUNCE!':'BIG POUNCE!'
      });
      w.mv.d=d; w.vy=d.vy; w.vx=(w.face||1)*d.vx; w.ground=false;
    }
    if(opt.chord){w.buf='attack'; w.bufT=.4}
    MM.glow=0; MM.boost=u;
    return;
  }
  const kind=opt.dub?'flurry':opt.dir;
  const big=0.75+u*0.9;
  if(kind==='up') beginArena('pawpop','pawpop',tap?'POP POUNCE!':'BIG POP!',{vy:-420-u*360,vx:120+u*160,paws:1,power:u>0.45});
  else if(kind==='fwd') beginArena('pounce','pounce',tap?'LEAP SWIPE!':'BIG LEAP!',{vy:-280-u*320,vx:(240+u*620)*big,paws:tap?1:2,power:u>0.45});
  else if(kind==='back') beginArena('pounce','pounce',tap?'BACK SWIPE!':'BIG BACK SWIPE!',{vy:-180-u*180,vx:-(160+u*420),paws:tap?1:2,power:u>0.4});
  else if(kind==='flurry') beginArena('pounce','pounce',tap?'PAW FLURRY!':'BIG FLURRY!',{vy:-200-u*220,vx:160+u*280,paws:tap?2:4,power:true});
  else beginArena('pounce','pounce',tap?'POUNCE!':'BIG POUNCE!',{vy:-260-u*460,vx:200+u*640,paws:tap?1:2,power:u>0.45});
  MM.boost=u;
  if(opt.chord) MM.thenClaw=true;
}
function chargePounce(keys){
  if(!MM.pcharge) return false;
  try{ if(typeof P!=='undefined'&&P&&P.special) delete P.special }catch(e){}
  if(MM.api&&MM.api.P) MM.api.P.meow=0;
  const age=rt()-MM.pcharge.t;
  const u=Math.min(1, age/0.8);
  MM.glow=u;
  const held=!!(keys&&keys.special||keys&&keys.meow);
  if(held){
    if(arena()){
      if(p.state==='normal'||p.state==='mcharge'||p.state==='land'){
        if(typeof setAnim==='function') setAnim('crouch');
        p.vx*=0.4;
      }
      p.rot=Math.sin(rt()*30)*0.06*Math.max(0.25,u);
    }
    return true;
  }
  const raw=age;
  const spec=MM.pcharge;
  MM.pcharge=null; MM.glow=0;
  if(arena()) p.rot=0;
  firePounce(raw, spec);
  return true;
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
  const kc=Math.max(p.combo||0, p.keepCombo||0, (typeof C!=='undefined'?C.n:0)||0);
  if(typeof puffShadow==='function') puffShadow(p.x,p.y);
  let best=null, bd=1e9;
  for(const d of dummies){
    if(!d||d.benched) continue;
    if(!d.alive&&!(d.sp&&d.ps&&d.ps!=='rec'&&d.ps!=='down')) continue;
    const dd=Math.abs(d.x-p.x); if(dd<bd){bd=dd; best=d}
  }
  if(mode==='barge'){
    if(best) p.face=Math.sign(best.x-p.x)||p.face;
    if(typeof blinkBarge==='function') blinkBarge();
    else { p.vx=p.face*900; p.state='barge'; }
    if(best&&typeof hitDummy==='function') hitDummy(best, 'claw2', p.face);
  } else if(mode==='above'&&best){
    p.face=Math.sign(best.x-p.x)||p.face;
    p.x=best.x-p.face*8; p.y=Math.max(70, best.y-150); p.vy=360; p.ground=false;
    if(typeof hitDummy==='function') hitDummy(best, 'claw1', p.face);
  } else if(mode==='behind'&&best){
    const side=best.x>=p.x?1:-1;
    p.x=best.x+side*86; p.face=-side; p.y=best.y; p.vx=0;
    if(typeof hitDummy==='function') hitDummy(best, 'claw2', p.face);
    MM.thenClaw=true; MM.tag={t:rt(), paws:0};
  } else if(mode==='both'){
    const side=best?(best.x>=p.x?1:-1):p.face;
    const ax=best?best.x-side*78:p.x+p.face*90;
    const bx=best?best.x+side*78:p.x-p.face*90;
    p.x=ax; p.face=side; MM.both={t:rt(), x:bx, face:-side};
    if(best&&typeof hitDummy==='function') hitDummy(best, 'claw1', p.face);
  } else {
    p.x+=p.face*220;
    if(best&&Math.abs(best.x-p.x)<160&&typeof hitDummy==='function') hitDummy(best, 'claw1', p.face);
  }
  if(typeof clampX==='function') p.x=clampX(p.x);
  if(typeof puffShadow==='function') puffShadow(p.x,p.y);
  if(mode!=='barge') p.state='normal';
  p.combo=kc; p.keepCombo=kc; p.keepT=0.9;
  if(typeof C!=='undefined'&&C.n>0) C.t=Math.max(C.t,.9);
  if(window.PL) PL.rest=p.face;
  const label=mode==='above'?'BLINK ABOVE!':mode==='behind'?'BLINK BEHIND!':mode==='both'?'BLINK FLURRY!':mode==='barge'?'BLINK BARGE!':'BLINK!';
  say(label,'#c9a7ff');
  p.blinkCool=0.28;
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
    if(t==='ULTIMATE'||hits()>=12){beginArena('pawpop','pawpop',name,{vy:-760,vx:420,paws:3,power:true,quiet:true}); title('ULTIMATE', name); return true}
    if(t==='BIG'){beginArena('pounce','pounce',name,{vy:-560,vx:820,paws:2,power:true,quiet:true}); title('BIG', name); return true}
    beginArena('pounce','pounce',name,{vy:-420,vx:740,paws:2,power:true,quiet:true}); title('POWER', name); return true;
  }
  const s=seq();
  if(hits()>=8&&/JJP$/.test(s)&&d==='up'&&which==='claw'){title('ULTIMATE','SKY SLAM'); beginArena('pawpop','pawpop','SKY SLAM',{vy:-720,vx:200,paws:2,power:true,quiet:true}); push('U'); return true}
  if(hits()>=8&&/BT$/.test(s)&&which==='claw'&&d==='down'){title('ULTIMATE','AMBUSH SLAM'); beginArena('dive','dive','AMBUSH SLAM',{vy:1200,paws:2,power:true,quiet:true}); push('S'); return true}
  if(which==='pounce'){
    firePounce(0.2, {dir:d, dub:dub, chord:chord});
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
    if(!moon&&!MM.pcharge){
      if(tierOf()&&doubled()) routeButton('pounce');
      else MM.pcharge={t:rt(), face:p.face, dir:dir(), dub:doubled(), chord:!!K.attack};
    }
    delete P.special;
  }
  if(MM.pcharge&&!MM.pcharge.level) chargePounce(K);
  else if(P.tail&&p.state!=='tailwhip'){if(!routeButton('tail')){} }
  else if(P.blink){
    const d=dir();
    const dbl=!!(MM._bAt&&rt()-MM._bAt<0.34);
    MM._bAt=rt();
    const dashing=p.state==='dash'||p.state==='dashstrike'||(window.OD&&OD.move&&/dash_forward|back_step/.test(OD.move()||''))||(p.dashStart&&rt()-p.dashStart<0.45);
    const chained=(p.combo||0)>0||(p.keepT>0&&(p.keepCombo||0)>0)||(typeof C!=='undefined'&&C.n>0&&C.t>0);
    const plain=!dbl&&!dashing&&d!=='up'&&d!=='fwd'&&d!=='back'&&!chained&&!K.attack;
    if(plain){MM.blinkWait={t:rt()}; delete P.blink}
    else {MM.blinkWait=null; blinkTo(dbl?'both':dashing?'barge':d==='up'?'above':(d==='fwd'||d==='back'||chained||K.attack)?'behind':'alone')}
  }
  if(P.attack&&!MM._claw){
    MM._claw=true;
    const d=dir(), s=seq();
    if(hits()>=8&&/JJP$/.test(s)&&d==='up'){delete P.attack; beginArena('pawpop','pawpop','SKY SLAM',{vy:-720,vx:220,paws:2,power:true,quiet:true}); title('ULTIMATE','SKY SLAM'); push('U'); return}
    if(hits()>=8&&/BT$/.test(s)&&d==='down'){delete P.attack; beginArena('dive','dive','AMBUSH SLAM',{vy:1100,paws:2,power:true,quiet:true}); title('ULTIMATE','AMBUSH SLAM'); push('S'); return}
    if(hits()>=8&&/PB$/.test(s)){delete P.attack; beginArena('pawpop','pawpop','GRAB SLAM',{vy:-640,vx:160,paws:2,power:true,quiet:true}); title('ULTIMATE','GRAB SLAM'); push('S'); return}
    if(!K.up){
      if(d==='fwd'){p._mmLunge=1; push('J')}
      else if(d==='back'){p._mmHook=1; push('J')}
      else push('J');
    } else push('U');
  }
  if(!P.attack) MM._claw=false;
  if(MM.tag&&p.state){
    const age=rt()-MM.tag.t;
    if(!MM.h1&&age>0.12){MM.h1=1; hitNow(MM.tag.power||MM.boost>0.4)}
    if(!MM.h2&&MM.tag.paws>1&&age>0.26){MM.h2=1; hitNow(MM.tag.power||MM.boost>0.4)}
    if(!MM.h3&&MM.tag.paws>3&&age>0.4){MM.h3=1; hitNow(true)}
  }
  if(MM.thenClaw&&(p.state==='normal'||p.state==='land')&&rt()-(MM.tag&&MM.tag.t||0)>0.28){
    MM.thenClaw=false; if(typeof startClaw==='function') startClaw();
  }
  if(MM.blinkWait&&rt()-MM.blinkWait.t>0.22){MM.blinkWait=null; blinkTo('alone')}
  if(MM.both&&MM.both.t&&rt()-MM.both.t>0.11){
    if(typeof puffShadow==='function') puffShadow(p.x,p.y);
    p.x=MM.both.x; p.face=MM.both.face||p.face;
    if(typeof clampX==='function') p.x=clampX(p.x);
    if(window.PL) PL.rest=p.face;
    if(typeof puffShadow==='function') puffShadow(p.x,p.y);
    hitNow(false, 'claw1'); MM.both=0;
  }
  if(p.state==='mcharge'&&!MM.pcharge){p.state='normal'; MM.pcharge={t:rt(), face:p.face, dir:dir(), dub:false, chord:false}}
}
function drawCharge(c, x, y){
  const g=MM.glow||0;
  if(g<0.04) return;
  c.save();
  c.globalCompositeOperation='lighter';
  const R=28+34*g;
  const grd=c.createRadialGradient(x, y-46, 2, x, y-46, R);
  grd.addColorStop(0, 'rgba(255,226,140,'+(0.2+0.5*g)+')');
  grd.addColorStop(1, 'rgba(255,170,40,0)');
  c.fillStyle=grd;
  c.beginPath(); c.arc(x, y-46, R, 0, 6.28); c.fill();
  c.restore();
}
function drawBanner(c, x, y){
  const b=MM.banner; if(!b||rt()-b.t>1.35) return;
  if(arena()&&typeof VW!=='undefined'){x=VW/2-(typeof camX==='number'?camX:0); y=186-(typeof camY==='number'?camY:0)}
  c.save();
  c.font='700 18px sans-serif';
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
  drawCharge(ctx2, w.x-cam.x, w.y-cam.y);
  drawBanner(ctx2, w.x-cam.x, w.y-cam.y);
};

if(arena()&&typeof r9Pre==='function'){
  if(typeof window.say==='function'&&!window.say._mmQuiet){
    const _say=window.say;
    window.say=function(t,c,big){
      try{
        const quietFin=MM.banner&&rt()-MM.banner.t<1.35;
        const quietUp=typeof p!=='undefined'&&p&&p.state==='od'&&!p.ground&&window.OD&&/upper/.test(OD.move()||'');
        if(quietFin||quietUp) return;
      }catch(e){}
      return _say.apply(this, arguments);
    };
    window.say._mmQuiet=1;
  }
  const _pre=r9Pre;
  r9Pre=function(dt){try{arenaTick()}catch(e){if(!arenaTick.err){arenaTick.err=1;console.warn('mm',e)}} return _pre.apply(this, arguments)};
  const _up=update;
  update=function(dt){
    const r=_up.apply(this, arguments);
    try{
      if(MM.pcharge&&!MM.pcharge.level&&K.special){if(typeof setAnim==='function') setAnim('crouch'); p.rot=Math.sin(rt()*30)*0.06*Math.max(0.25, MM.glow||0)}
      else if(p.rot&&!(MM.pcharge)) p.rot=0;
      if(p._mmLunge&&p.t>=0.16){p._mmLunge=0; p._mmSaid=0}
      if(p._mmHook&&p.state==='claw'&&typeof setAnim==='function'&&FR.bxlh){setAnim('bxlh', true); if(window.P33) P33.a='bxlh'; say('COUNTER HOOK!','#bfe8ff'); p._mmHook=0}
    }catch(e){}
    return r;
  };
  const _fx=drawFx;
  drawFx=function(){try{drawTail(ctx, p.x, p.y, p.face); drawCharge(ctx, p.x, p.y); drawBanner(ctx, p.x, p.y)}catch(e){} return _fx.apply(this, arguments)};
}

MM.level=function(dt, api){
  MM.api=api;
  if(MM.pcharge&&MM.pcharge.level) chargePounce(api.K||{});
};
MM.takeLevel=function(){
  if(!MM.api||!MM.api.P||!MM.api.startMove) return false;
  const P=MM.api.P, go=MM.api.startMove, d=dir(), dub=doubled(), chord=!!P.attack;
  const t=tierOf();
  if(P.meow){
    P.meow=0;
    if(t&&dub){title(t==='ULTIMATE'||hits()>=12?'ULTIMATE':t, 'SUPER SWIPE'); go(t==='POWER'?'pouncefar':'flurry'); return true}
    MM.pcharge={t:rt(), face:MM.api.p.face, dir:d, dub:dub, chord:chord, level:true};
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
