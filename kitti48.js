// ===================== v48: KITTI PADDY QUICK TAPS, CHARGED PUNCHES, SMOOTH MOVES (base Paddy, punch combo only) =====================
// Pernell 4 Nov 2026. Refines the v47 moves; every other form is untouched. All art = the pink punch sheets (k_ps_* / k_pw_*),
// drawn at the normal size, with eased root motion, squash/stretch, lean, and afterimages on top.
//   QUICK TAPS (press + let go in under 0.15 s; holding a direction still walks / crouches as before)
//     tap back  = SLIP     quick lean-back step out of range (brief i-frames)      + Claw = SLIP JAB
//     tap down  = WEAVE    bob-and-weave under a punch (brief i-frames)           + Claw = WEAVE HOOK
//     tap fwd   = primes the next charged punch as a POWER JAB
//     mid-punch with an enemy BEHIND him a back press still turns him round straight away (the v29 mid-combo turn)
//     a 2nd quick tap turns the slip into the full DODGE and the weave into the CAT SLIDE (v47 double-taps)
//     the 1st back tap no longer turns Paddy round (that was the 1-frame flicker): a back press only turns him once it has
//     been held for 0.15 s
//   CLAW: a quick tap = the next punch of the string (jab, cross, hook, body ...) as before.
//     HOLD Claw (wind-up starts at 0.15 s, power from 0.3 s, full charge 0.6 s) and LET GO = HAYMAKER (huge looping overhand,
//     k_pw_hook + a fiery arc) or, after a forward tap / holding forward, POWER JAB (k_pw_jab + a straight streak).
//     Charged punches: wind-up pose, fist glow + charge flash, bigger lunge, screen shake, more knockback + damage, own call-out.
//   Everything chains: tap, Claw, tap, Claw ... the hit counter and the punch string number carry on.
(function(){
if(typeof p==='undefined'||!window.KD47||!window.P33)return;
const on=()=>{try{return FORM()===0&&!(window.KITTY36&&KITTY36.on)&&!p.hunt}catch(_){return false}};
// v53: the charged uppercut exists only for the Practice Room NEW uppercut. OLD and story keep the leap.
const newUp=()=>{try{return !!(window.UC49&&UC49.active&&UC49.active())}catch(_){return false}};
const rt=()=>performance.now()/1000;
const TAP=.15,CH0=.15,CHP=.3,CHF=.6,CHMAX=1.6;
const A=window.KD48={H:{},req:null,ctx:null,lastFwd:-9,combo:0,ch:null,pow:null,n:{slip:0,weave:0,slipjab:0,weavehook:0,charge:0,haymaker:0,powerjab:0,lighttap:0},log:[],faces:[],vr:0,vs:1,arcs:[]};
function log(s){A.log.push(s);if(A.log.length>50)A.log.shift()}
const LR=['left','right'];
const SUP_OK=new Set(['normal','stop','land','claw','kslip','kweave','kcharge','kdodge']);
const lateClaw=()=>p.state==='claw'&&(p.anim==='bxrec'||p.fi>=((p.anim==='bxph'||p.anim==='bxpj'||p.anim==='bxpb'||p.anim==='bxpu')?7:5));
const TAP_OK=s=>['normal','stop','land'].includes(s)||lateClaw();
// mid-punch with an enemy behind him: a back press turns him round at once, as before (kitty29 TURN); otherwise it's a slip
function foeBehind(){for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;if(g<-20&&g>-480&&Math.abs(d.y-p.y)<300)return true}return false}
function curCombo(){return p.state==='claw'?p.combo:(p.keepT>0?p.keepCombo:(['kslip','kweave','kcharge'].includes(p.state)?A.combo:0))}
// ---------- input ----------
const _press=press;press=function(k){
 const fresh=k==='up'?!K.up:!K[k];const r0=window.KD47.req;
 if(!on()||!fresh)return _press.apply(this,arguments);
 const h=A.H[k]={t:rt(),down:true,sup:false,dt:false,slide:!!window.PADSLIDE};
 if(k==='attack')for(const j of ['left','right','down']){const g=A.H[j];if(g&&g.down)g.chord=true}   // ↓ + Claw / → + Claw pressed together = the old chord, not a tap
 if(k==='attack'){h.fwd=rt()-A.lastFwd<.45||!!(p.face>0?K.right:K.left);h.cvt=false;h.ctx=p.state==='kslip'?'slip':p.state==='kweave'?'weave':A.ctx&&rt()-A.ctx.t<.4?A.ctx.k:null}
 const r=_press.apply(this,arguments);
 if(window.KD47.req&&window.KD47.req!==r0)h.dt=true;               // this press completed a v47 double-tap
 if(LR.includes(k)&&!h.slide){const d=k==='right'?1:-1;
  if(d!==p.face&&p.ground&&!p.wall&&SUP_OK.has(p.state)&&!(p.state==='claw'&&foeBehind())){
    h.sup=true;
    const launching=h.dt&&window.KD47&&KD47.req&&KD47.req.k==='back';
    if(!launching){K[k]=0;delete P[k];BUF[k]=-9}
  }}
 return r};
const _release=release;release=function(k){const h=A.H[k];const r=_release.apply(this,arguments);
 if(!h||!h.down||!on())return r;h.down=false;const dur=rt()-h.t;
 if(k==='attack'){if(p.state==='kcharge'&&A.ch)A.ch.rel=dur;return r}
 if(dur<TAP&&!h.dt&&!h.slide&&!h.chord&&!window.PADSLIDE){
  if(LR.includes(k)){const d=k==='right'?1:-1;if(d===p.face)A.lastFwd=rt();else if(h.sup||p.state==='kslip')A.req={k:'slip',t:rt()}}
  else if(k==='down')A.req={k:'weave',t:rt()}}
 return r};
// ---------- moves ----------
function keep(c){p.keepT=.5;p.keepCombo=Math.min(7,c||0)}
function holdCounter(){if(typeof C!=='undefined'&&C.n>0&&C.max)C.t=Math.max(C.t,C.max*.85)}
function ghost(l,blue){const f=(FR[p.anim]||FR.idle)[p.fi];if(f)ghosts.push({x:p.x,y:p.y,f,face:p.face,l,blue:blue?1:0})}
function slip(){A.combo=curCombo();p.state='kslip';p.t=0;acted=true;setAnim('bxpj',true);p.inv=Math.max(p.inv,.16);p.noFlick=true;p.vx=0;A.n.slip++;log('slip');
 if(typeof puffShadow==='function')puffShadow(p.x,p.y)}
function weave(){A.combo=curCombo();p.state='kweave';p.t=0;acted=true;setAnim('bxpb',true);p.inv=Math.max(p.inv,.22);p.noFlick=true;p.vx=0;A.n.weave++;log('weave')}
const PS={bxj1:1,bxj2:1,bxx:1,bxlh:1,bxrb:1,bxpj:1,bxph:1,bxpb:1,bxpu:1};
function forcePunch(a,fi){if(p.state!=='claw')return false;const pf=p.prevF,px=p.prevX,py=p.prevY,pfc=p.prevFace,pb=p.blend;setAnim(a,true);p.ft=p.fi=fi;
 p.prevF=pf;p.prevX=px;p.prevY=py;p.prevFace=pfc;p.blend=pb;
 Object.assign(P33,{a,last:a,lastFi:fi,s:fi,trav:0,q:null,early:false,hitDone:false,face:p.face,legacy:false});
 if(window.W31&&W31.names.length)W31.names[W31.names.length-1]=a;if(P33.str&&P33.str.length)P33.str[P33.str.length-1]=a;return true}
function punch(a,name,col,step){A.step=step||0;p.state='normal';p.combo=A.combo||0;p.keepT=0;p.cool=0;startClaw();if(a&&forcePunch(a,1)&&name)say(name,col||'#bfe8ff',true)}
function power(kind,lvl){A.n[kind==='hay'?'haymaker':'powerjab']++;const a=kind==='hay'?'bxph':'bxpj';p.state='normal';p.combo=A.combo||0;p.keepT=0;p.cool=0;startClaw();
 if(!forcePunch(a,3))return;A.pow={a,kind,lvl,t:rt(),hit:new Set(),lunge:0,nm0:NAMES[a]};NAMES[a]=kind==='hay'?'HAYMAKER!!':'POWER JAB!!';
 say(kind==='hay'?(lvl>=1?'MEGA HAYMAKER!!':'HAYMAKER!!'):(lvl>=1?'MEGA POWER JAB!!':'POWER JAB!!'),kind==='hay'?'#ff9a3c':'#ffe14d',true);
 shake=Math.max(shake,6+6*lvl);ghost(.22,1);log('power:'+kind+':'+lvl.toFixed(2))}
// v54: POWER UPPERCUT — same hold (0.3 s). The swing itself starts at frame 0 so the deepest crouch
// plays again before the hit (fi 4). A tap still starts at frame 2 and never shows that coil.
function powerUp(lvl,light){A.n.powerup=(A.n.powerup||0)+1;p.state='normal';p.combo=A.combo||0;p.keepT=0;p.cool=0;
 const wasUp=K.up;K.up=1;if(window.P33)P33.last='bxpu';startClaw();K.up=wasUp;
 if(!forcePunch('bxpu',light?2:0)){p.state='claw';if(typeof setAnim==='function')setAnim('bxpu',true);p.fi=light?2:0;p.ft=p.fi}
 try{if(typeof texts!=='undefined')texts.length=0}catch(e){}
 const fl=typeof floorAt==='function'?floorAt(p.x):p.y;
 if(light){p.vy=0;p.ground=true;p.y=fl;return}
 p.ft=0;p.fi=0;
 A.pow={a:'bxpu',kind:'up',lvl,t:rt(),hit:new Set(),lunge:0,nm0:NAMES.bxpu,rose:0,pop:0};A.hang=0;NAMES.bxpu='UPPERCUT!';
 shake=Math.max(shake,4+2*lvl);log('power:up:'+lvl.toFixed(2));
 if(window.UC49&&UC49.n)UC49.n.power=(UC49.n.power||0)+1}
function dashUpper(){if(p.state==='kduc')return;p.state='kduc';p.t=0;p.shot=false;p.kducHit=new Set();acted=true;p.ground=true;p.vy=0;
 p.vx=p.face*Math.max(520,Math.min(760,Math.abs(p.vx)||640));p.combo=Math.min(7,(p.combo||0)+1);
 if(typeof popNum==='function')popNum(p.combo,'#ffe14d');say('DASH UPPERCUT!','#ffe14d',true);A.n.dashup=(A.n.dashup||0)+1;log('dashup');
 if(window.W31){W31.names.push('kduc');if(W31.names.length>24)W31.names.shift()}
 if(window.KD47){KD47.post='kduc';if(KD47.lines)for(let i=0;i<8;i++)KD47.lines.push({x:p.x-p.face*(20+Math.random()*70),y:p.y-30-Math.random()*90,len:80,face:p.face,l:1,col:'#ffe14d'})}}
function groundPound(){if(p.state==='kpound')return;p.state='kpound';p.t=0;p.shot=false;acted=true;p.vx*=.25;say('GROUND POUND!','#ffe9a8',true);A.n.pound=(A.n.pound||0)+1;log('pound');
 if(window.W31){W31.names.push('kpound');if(W31.names.length>24)W31.names.shift()}}
const _ds=dashStrike;dashStrike=function(){if(newUp()&&p.ground&&!p.wall){dashUpper();return}return _ds.apply(this,arguments)};
function startCharge(kind){A.combo=curCombo();A.ch={kind,t0:A.H.attack?A.H.attack.t:rt(),lvl:0,full:false,rel:null,ctx:A.H.attack&&A.H.attack.ctx};
 p.state='kcharge';p.t=0;acted=true;p.vx=0;if(kind!=='up')say('WIND-UP…','#ffb070');setAnim(kind==='up'?'bxpu':kind==='hay'?'bxph':'bxpj',true);if(P33){P33.q=null;P33.a=null}A.n.charge++;log('charge:'+kind)}
function endPow(){if(A.pow){NAMES[A.pow.a]=A.pow.nm0;A.pow=null}}
// ---------- per frame ----------
let prevS='';
function tick(dt){
 if(!on()){A.req=null;if(p.state==='kcharge')p.state='normal';endPow();return}
 const t=rt();
 if(newUp()&&P.attack&&!p.ground&&!p.wall&&!p.hunt&&(P.down||K.down)&&!['kpound','ledge','respawn','hurt','bunny'].includes(p.state)){delete P.attack;delete P.down;groundPound()}
 // a suppressed back press held past the tap time = a real turn / walk
 for(const k of LR){const h=A.H[k];if(h&&h.sup){if(!h.down){h.sup=false;continue}
  if(t-h.t>=TAP||!p.ground||!SUP_OK.has(p.state)){h.sup=false;K[k]=1;P[k]=1;BUF[k]=now}}}
 const S=p.state;
 // quick taps
 const q=A.req;if(q){if(t-q.t>(p.state==='claw'?.35:.15))A.req=null;
  else if(q.k==='slip'&&p.ground&&!p.wall&&(TAP_OK(S)||S==='kweave')&&!window.KD47.req&&!(window.PL&&PL.back)){A.req=null;slip()}
  else if(q.k==='weave'&&p.ground&&!p.wall&&(TAP_OK(S)||S==='kslip')&&!window.KD47.req){A.req=null;weave()}}
 // charge: Claw still held 0.15 s after the punch it started (before that punch lands) = wind-up instead
 const h=A.H.attack;
 if(h&&h.down&&!h.cvt&&t-h.t>=CH0&&p.ground&&!p.wall){
  const pre=p.state==='claw'&&PS[p.anim]&&p.anim!=='bxrec'&&(p.fi<3||(p.anim==='bxpu'&&p.fi<4&&!P33.hitDone))&&!A.pow;   // v52: the ↑+Claw uppercut starts at its frame 2, so it can still turn into the power wind-up
  if(pre||['normal','stop','land','kslip','kweave'].includes(p.state)){h.cvt=true;const cvA=pre?p.anim:null;
   if(pre){p.combo=Math.max(0,p.combo-1);if(window.W31&&W31.names.length)W31.names.pop();if(P33.str&&P33.str.length)P33.str.pop()}   // that punch never landed
   startCharge((newUp()&&(K.up||cvA==='bxpu'))?'up':h.fwd?'jab':'hay');if(A.ch)A.ch.cvA=cvA}
  else if(p.state!=='claw')h.cvt=true}
 // tap + Claw
 if(P.attack&&p.ground){const c=A.ctx&&t-A.ctx.t<.35?A.ctx.k:null;
  if(p.state==='kslip'&&p.t>.04||p.state==='normal'&&c==='slip'){delete P.attack;A.ctx=null;A.n.slipjab++;punch('bxj2','SLIP JAB!','#bfe8ff',130);log('slipjab')}
  else if(p.state==='kweave'&&p.t>.05||p.state==='normal'&&c==='weave'){delete P.attack;A.ctx=null;A.n.weavehook++;punch('bxlh','WEAVE HOOK!','#9fe8ff');log('weavehook')}}
 switch(p.state){
  case 'kslip':{const T=.22,u=Math.min(1,p.t/T);p.vx=-p.face*72*3*(1-u)*(1-u)/T;holdCounter();if(t%.03<dt*1.5)ghost(.18,0);
   if(u>=1){p.state='normal';p.vx=0;p.noFlick=false;keep(A.combo);A.ctx={k:'slip',t}}break}
  case 'kweave':{const T=.3,u=Math.min(1,p.t/T);p.vx=p.face*26*Math.PI/2*Math.sin(Math.PI*u)/T;holdCounter();if(t%.04<dt*1.5)ghost(.14,0);
   if(u>=1){p.state='normal';p.vx=0;p.noFlick=false;keep(A.combo);A.ctx={k:'weave',t}}break}
  case 'kcharge':{const c=A.ch;if(!c){p.state='normal';break}
   if(!p.ground){p.ground=true;p.vy=0;p.y=typeof floorAt==='function'?floorAt(p.x):p.y}
   if(newUp()&&K.up&&c.kind==='hay'){c.kind='up';say('POWER UPPERCUT…','#ffe14d');log('charge:up')}delete P.jump;delete P.up;   // hold Claw, then ↑ = power uppercut wind-up (Practice NEW only); ↑ never jumps out of a wind-up
   p.vx*=Math.pow(.001,dt);holdCounter();
   const held=t-c.t0;c.lvl=Math.max(0,Math.min(1,(held-CHP)/(CHF-CHP)));shake=Math.max(shake,held>CHP?1+2.5*c.lvl:.5);
   if(!c.full&&c.lvl>=1){c.full=true;ghost(.22,1);say('FULL POWER!','#fff2b0');waves.push({x:p.x,y:p.y-90,r:20,l:.6,big:true});flashT=Math.max(flashT,.04);log('charged')}
   if(c.full&&t%.3<dt*1.5)ghost(.12,1);
   const gx=p.x+(c.kind==='hay'?-p.face*30:p.face*(c.kind==='up'?6:40)),gy=p.y-(c.kind==='hay'?120:c.kind==='up'?32:112);
   if(t%.03<dt*1.5)for(let i=0;i<2;i++){const an=Math.random()*6.28,r=70+Math.random()*40;sparks.push({x:gx+Math.cos(an)*r,y:gy+Math.sin(an)*r,vx:-Math.cos(an)*r*4,vy:-Math.sin(an)*r*4,l:.22,c:c.full?'#fff':(c.kind==='hay'?'#ff9a3c':'#ffe14d')})}
   if(c.rel==null&&!(A.H.attack&&A.H.attack.down))c.rel=held;
   if(held>=CHMAX&&c.rel==null)c.rel=held;
   if(c.kind==='up'&&t%.08<dt*1.5)puffs.push({x:p.x+(Math.random()-.5)*46,y:p.y,vx:(Math.random()-.5)*80,vy:-20,r:6,l:.28,dark:1});
   if(c.rel!=null){A.ch=null;p.noFlick=false;
    if(c.rel<CHP){A.n.lighttap++;if(c.kind==='up'){powerUp(0,true);break}const a=c.cvA||(c.ctx==='weave'?'bxlh':c.ctx==='slip'?'bxj2':null);punch(a,null)}else if(c.kind==='up')powerUp(c.lvl);else power(c.kind,c.lvl)}
   break}
  case 'kduc':{p.vy=0;p.ground=true;p.vx*=Math.pow(.4,dt);
   if(p.t>=.1&&p.t<.28)for(const d of dummies){if(!d.alive||d.benched||p.kducHit.has(d))continue;const g=(d.x-p.x)*p.face;if(g>-36&&g<160&&Math.abs(d.y-p.y)<190){p.kducHit.add(d);C.atk++;hitDummy(d,'bxpu',p.face);d.vy=Math.min(d.vy,-980);d.vx=p.face*180;d.fl=Math.max(d.fl||0,.6);shake=Math.max(shake,12);waves.push({x:d.x,y:d.y-90,r:18,l:.9,big:true});say('DASH UPPERCUT!','#ffe14d',true);log('dashup:hit')}}
   if(window.KD47&&t%.05<dt*1.5)KD47.lines.push({x:p.x-p.face*30,y:p.y-50-Math.random()*40,len:70,face:p.face,l:1,col:'#ffe14d'});
   if(p.t>.5){p.state='normal';p.vx=p.face*160;p.keepT=.45;p.keepCombo=Math.min(7,p.combo||0)}break}
  case 'kpound':{if(p.t<.1)p.vy=Math.min(60,Math.max(-100,p.vy));else if(!p.ground){p.vy=1750;p.vx*=Math.pow(.25,dt)}
   if(p.ground&&p.t>.06&&!p.shot){p.shot=true;p.vy=0;shake=Math.max(shake,18);flashT=Math.max(flashT,.1);waves.push({x:p.x,y:p.y,r:22,l:1,big:true});waves.push({x:p.x,y:p.y,r:8,l:.8,big:true});
    for(let i=0;i<16;i++)puffs.push({x:p.x+(Math.random()-.5)*120,y:p.y,vx:(Math.random()-.5)*260,vy:-20-Math.random()*70,r:9,l:.5,dark:1});
    C.atk++;for(const d of dummies){if(!d.alive||d.benched)continue;if(Math.abs(d.x-p.x)<175&&d.y>p.y-240&&d.y<p.y+30){hitDummy(d,'bxpb',Math.sign(d.x-p.x)||p.face);d.vx=(d.x>=p.x?1:-1)*320;d.vy=Math.min(d.vy,-480);d.fl=Math.max(d.fl||0,.4)}}
    say('GROUND POUND!','#ffe9a8',true);log('pound:hit')}
   if(p.shot&&p.t>.42)p.state='normal';break}
 }
 // slip jab: step back in (eased) so the counter reaches what he slipped
 if(A.step>0){if(p.state!=='claw'||p.fi>4)A.step=0;else{let near=false;for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;if(g>-20&&g<150&&Math.abs(d.y-p.y)<160)near=true}
  if(near)A.step=0;else{const dx=Math.min(A.step,Math.max(120,A.step*14)*dt);A.step-=dx;p.x+=p.face*dx;if(typeof clampX==='function')p.x=clampX(p.x);if(t%.04<dt*1.5)ghost(.14,0)}}}
 // charged punch in flight: lunge, lean, afterimages
 if(A.pow){const w=A.pow;if(p.state!=='claw'||(p.anim!==w.a&&p.anim!=='uc49')){
  if(w.kind==='up'&&!p.ground){if(!w.pop){w.pop=1;for(const d of dummies){if(!d||!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;if(g>-30&&g<210){d.vy=-1160;d.vx=p.face*70;d.fl=Math.max(d.fl||0,.95);if(d.sp){d.ps='air';d.pt=0;d.st='air'}}}}}
  else endPow();
 }else{if(t%.03<dt*1.5&&p.fi>=3&&p.fi<=6)ghost(.2,0);
   const max=w.kind==='up'?40:w.kind==='hay'?70:95,sp=w.kind==='hay'?560:820;
   if(p.fi>=3&&p.fi<=5&&w.lunge<max){let near=false;for(const d of dummies){if(!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;if(g>-20&&g<100&&Math.abs(d.y-p.y)<160)near=true}
    if(!near){const dx=Math.min(max-w.lunge,sp*dt);w.lunge+=dx;p.x+=p.face*dx;if(typeof clampX==='function')p.x=clampX(p.x)}}
   if(p.fi>=4&&p.fi<=6&&!w.arc){w.arc=1;A.arcs.push({x:p.x,y:p.y,face:p.face,kind:w.kind,l:1,lvl:w.lvl})}}}
 if(prevS!==p.state&&prevS==='kcharge'&&p.state!=='claw'){A.ch=null}
 // the art for every Kitti move = the pink punch sheets
 applyVis(true);
 if(p.state==='kdodge'){let n=0;for(let i=ghosts.length-1;i>=0&&n<40;i--,n++){const g=ghosts[i];if(!g.k48&&Math.abs(g.x-p.x)<200){g.k48=1;g.l=Math.min(g.l,.14)}}}   // thinner dodge trail
 if(['kslip','kweave','kcharge','kduc','kpound'].includes(p.state)){p.noFlick=true}
 if(p.ground)A.faces.push(p.face);if(A.faces.length>120)A.faces.shift();
 prevS=p.state}
A.seen=new Set();A.anims=new Set();
if(typeof window.say==='function'&&!window.say._ucQuiet){
 const _say=window.say;
 window.say=function(t,c,big){
  try{if(A.pow&&A.pow.kind==='up'&&p&&p.state==='claw')return}catch(e){}
  return _say.apply(this, arguments);
 };
 window.say._ucQuiet=1;
}
const _pre=r9Pre;r9Pre=function(dt){try{tick(dt)}catch(e){console.warn('kd48',e)}_pre(dt);A.seen.add(p.state);A.anims.add(p.state+':'+p.anim)};   // KD48.seen / anims: for tests
const _upd=update;update=function(dt){const r=_upd.apply(this,arguments);
 try{
  const w=A.pow;
  const fl=typeof floorAt==='function'?floorAt(p.x):p.y;
  function popDummy(){
   if(!w||w.pop)return;
   w.pop=1;
   for(const d of dummies){if(!d||!d.alive||d.benched)continue;const g=(d.x-p.x)*p.face;
    if(g<-20||g>200||d.y<p.y-260||d.y>p.y+50)continue;
    d.vy=-1160;d.vx=p.face*70;d.fl=Math.max(d.fl||0,.95);
    if(d.sp){d.ps='air';d.pt=0;d.st='air';d.y=Math.min(d.y,fl-6)}}
  }
  if(w&&w.kind==='up'&&p.state==='claw'&&(p.anim==='bxpu'||p.anim==='uc49')){
   if(!w.rose&&p.ft>=2.4){w.rose=1;A.hang=performance.now()/1000;p.ground=false;p.vy=-1120;p.jumps=Math.max(p.jumps||0,1)}
   if(!w.pop&&(p.fi>=4||p.ft>=3.3)) popDummy();
   if(typeof sparks!=='undefined'&&sparks.length>4)sparks.splice(0,sparks.length-4);
   if(typeof slashes!=='undefined')slashes.length=0;
  }
  if(A.hang&&!p.ground&&p.state==='normal'){p.anim='bxpu';p.fi=6}
  if(A.hang&&p.ground&&p.vy>=0)A.hang=0;
 }catch(e){}
 return r};
// ---------- the pink-sheet look for each move: [anim, frame(t), lean(t), squash(t), lift(t)] ----------
const sn=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));
const VIS={
 kslip:{a:'bxpj',fi:t=>t<.05?1:t<.16?2:1,r:t=>-.07*sn(t/.22),s:t=>1-.05*sn(t/.22),y:t=>8*sn(t/.22)},
 kdodge:{a:'bxpj',fi:t=>t<.04?1:t<.2?2:1,r:t=>-.1*sn(t/.26),s:t=>t<.04?.93:t>.22?.95:1.03,y:t=>24*sn(t/.26)},
 kweave:{a:'bxpb',fi:t=>t<.06?1:t<.22?2:1,r:t=>.07*Math.sin(2*Math.PI*Math.min(1,t/.3)),s:t=>1-.06*sn(t/.3),y:()=>0},
 dash:{a:'bxpb',fi:t=>t<.03?1:2,r:()=>.1,s:t=>t<.05?.94:.9,y:()=>0},
 dashstrike:{a:'bxpj',fi:t=>t<.05?3:t<.1?4:t<.2?5:t<.28?6:7,r:t=>t<.2?.09:.03,s:t=>t<.2?.92:1,y:()=>0},
 kslide:{a:'bxpb',fi:t=>t<.04?1:2,r:()=>.06,s:()=>.88,y:()=>0},
 ksweep:{a:'bxpb',fi:t=>t<.05?3:t<.1?4:t<.2?5:t<.3?6:t<.38?7:8,r:t=>t<.2?.06:0,s:t=>t<.2?.92:1,y:()=>0},
 kpounce:{a:'bxpj',fi:t=>t<.05?2:4,r:()=>-.35*Math.max(-1,Math.min(1,-p.vy/1000)),s:()=>1.04,y:()=>0},
 kpl:{a:'bxpu',fi:t=>t<.12?3:t<.17?4:t<.24?5:t<.34?6:t<.44?7:8,r:()=>0,s:t=>t<.12?.94:1.05,y:()=>0},
 kcounter:{a:'bxx',fi:t=>t<.06?1:t<.11?2:t<.2?3:t<.3?4:t<.38?5:6,r:t=>t<.25?.06:0,s:t=>t>.11&&t<.2?.94:1,y:()=>0},
 kcharge:{a:()=>A.ch&&A.ch.kind==='jab'?'bxpj':A.ch&&A.ch.kind==='up'?'bxpu':'bxph',fi:t=>{const c=A.ch;if(!c)return 1;if(c.kind==='up')return t<.08?1:t<.2?2:3;if(c.kind==='jab')return t<.06?1:2;if(t>=.12)c.cock=1;return c.cock?3:(t<.06?1:2)},
  r:()=>A.ch&&A.ch.kind==='up'?0:-.04*((A.ch&&A.ch.lvl)||0),s:()=>1,y:()=>0},
 kduc:{a:'bxpu',fi:t=>t<.08?3:t<.16?4:t<.28?5:6,r:()=>.08,s:()=>1,y:()=>0},
 kpound:{a:()=>p.shot?'bxpb':'bxlh',fi:t=>p.shot?3:(t<.12?1:t<.22?2:3),r:()=>.1,s:()=>1,y:()=>0}};
function curVis(){const V=VIS[p.state];if(!V||!on())return null;const a=typeof V.a==='function'?V.a():V.a;return FR[a]?{V,a}:null}
const SNAP=new Set(['kslip','kdodge','kweave','dash','kslide']);   // quick moves: no crossfade (it would ghost half the move)
function applyVis(upd){const c=curVis();if(!c)return;if(SNAP.has(p.state)&&p.t<.12){p.blend=0;p.prevF=null}if(p.anim!==c.a){if(upd)setAnim(c.a,true);else p.anim=c.a}if(SNAP.has(p.state)&&p.t<.12){p.blend=0;p.prevF=null}const L=FR[c.a].length;p.fi=Math.max(0,Math.min(L-1,c.V.fi(p.t)));if(upd)p.ft=p.fi}
function powLean(){const w=A.pow;if(!w||p.state!=='claw')return{r:0,s:1};if(w.kind==='up')return{r:0,s:1};const f=p.fi,h=w.kind==='hay';
 if(f<=3)return{r:-(h?.08:.04),s:.97};if(f<=6)return{r:h?.15:.07,s:h?.92:.9};if(f===7)return{r:h?.09:.03,s:1};return{r:0,s:1}}
const NOBLINK=new Set(['kslip','kweave','kcharge','kdodge','kcounter','kpl','kslide','ksweep','kpounce','kduc','kpound']);   // set right before the player is drawn (something resets it mid-frame)
const _sq=r11Sq;r11Sq=function(){let s=_sq();try{if(on()){if(NOBLINK.has(p.state))p.noFlick=true;applyVis(false);const c=curVis();let ts=c?c.V.s(p.t):powLean().s;A.vs+=(ts-A.vs)*.45;s*=A.vs}}catch(_){}return s};
const _rb=mRunBob;mRunBob=function(){const m=_rb();try{if(on()){const c=curVis();let tr=0,ty=0;if(c){tr=c.V.r(p.t);ty=c.V.y(p.t)}else tr=powLean().r;A.vr+=(tr-A.vr)*.4;
  if(Math.abs(A.vr)>.001||ty)return{y:(m.y||0)+ty,r:(m.r||0)+A.vr*p.face}}}catch(_){}return m};
// ---------- charged hits: more knockback, damage, shake, flash ----------
const _hd=hitDummy;hitDummy=function(d,move,dir){const w=A.pow;const r=_hd.apply(this,arguments);
 try{if(w&&on()&&move===w.a&&d&&!w.hit.has(d)){w.hit.add(d);const L=w.lvl,h=w.kind==='hay',u=w.kind==='up';
  d.hp-=1+(L>=1?1:0);if(d.hp<1)d.hp=1;d.vx=dir*(h?520:440)*(1+.6*L);d.vy=Math.min(d.vy,h?-(430+260*L):-(240+140*L));d.fl=Math.max(d.fl||0,h?.5:.35);if(u){d.hp-=1+(L>=1?1:0);if(d.hp<1)d.hp=1;d.vx=dir*(120+70*L);d.vy=Math.min(d.vy,-(1100+460*L));d.fl=Math.max(d.fl,.75)}
  hitstop=Math.max(hitstop,.06+.02*L);shake=Math.max(shake,u?5:8+4*L);if(!u)flashT=Math.max(flashT,.05);
  const x=d.x-dir*30,y=d.y-(h?120:u?70:105);if(!u){waves.push({x,y,r:16,l:.7,big:true})}
  for(let i=0;i<(u?4:8);i++){const an=(dir>0?0:Math.PI)+(Math.random()-.5)*1.2,v=160+Math.random()*220;sparks.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:.28,c:i%2?'#fff':'#ffe14d'})}
  say(NAMES[w.a],h?'#ff9a3c':'#ffe14d',true);log('powhit:'+w.kind)}}catch(_){}return r};
// ---------- fx: charge glow, haymaker arc, power-jab streak ----------
const _fx=drawFx;drawFx=function(){try{if(on())drawMine()}catch(e){if(!A.fxErr){A.fxErr=String(e);console.warn('kd48fx',e)}}_fx()};
function drawMine(){ctx.save();ctx.globalCompositeOperation='lighter';
 const c=A.ch;if(p.state==='kcharge'&&c){const up=c.kind==='up',gx=p.x+(c.kind==='hay'?-p.face*30:p.face*(up?8:40)),gy=p.y-(c.kind==='hay'?120:up?26:112),pl=.5+.5*Math.sin(now*(c.full?30:14));
  const R=(up?22:12)+(up?34:20)*c.lvl+4*pl,col=c.kind==='hay'?'255,150,60':'255,225,80';const g=ctx.createRadialGradient(gx,gy,2,gx,gy,R*1.6);
  g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.18,`rgba(${col},${.5+.35*c.lvl})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,R*1.6,0,6.283);ctx.fill();
  if(c.full){ctx.strokeStyle=`rgba(255,255,255,${.5+.4*pl})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(gx,gy,R*1.9+8*pl,0,6.283);ctx.stroke()}}
 for(const a of A.arcs){a.l-=1/60*3.2;if(a.l<=0)continue;ctx.save();ctx.translate(a.x,a.y);ctx.scale(a.face,1);const al=Math.max(0,a.l);
  if(a.kind==='hay'){// big looping overhand: from high behind his head, over the top, down through the target
   for(let i=0;i<4;i++){ctx.strokeStyle=i===0?`rgba(255,240,200,${al*.7})`:`rgba(255,${160-i*25},40,${al*.55})`;ctx.lineWidth=(20-i*4)*(1+.3*a.lvl)*al;ctx.beginPath();ctx.arc(10,-100,92+i*7+12*a.lvl,-2.6,.45);ctx.stroke()}}
  else if(a.kind==='up'){for(let i=0;i<5;i++){ctx.strokeStyle=i===0?`rgba(255,255,230,${al*.85})`:`rgba(255,${210-i*18},60,${al*.6})`;ctx.lineWidth=(22-i*3)*(1+.45*a.lvl)*al;ctx.beginPath();ctx.arc(36,-20,78+i*10+16*a.lvl,-2.55,-.35);ctx.stroke()}
   ctx.fillStyle=`rgba(255,236,140,${al*.45})`;ctx.beginPath();ctx.moveTo(28,-150);ctx.lineTo(70+30*a.lvl,-230);ctx.lineTo(8,-168);ctx.closePath();ctx.fill()}
  else{for(let i=0;i<4;i++){ctx.strokeStyle=i===0?`rgba(255,250,220,${al*.75})`:`rgba(255,225,80,${al*.55})`;ctx.lineWidth=(14-i*3)*(1+.3*a.lvl)*al;ctx.beginPath();ctx.moveTo(-60,-112+i*3);ctx.lineTo(230+60*a.lvl,-112);ctx.stroke()}
   ctx.fillStyle=`rgba(255,240,170,${al*.5})`;ctx.beginPath();ctx.moveTo(170,-112);ctx.lineTo(260+60*a.lvl,-150);ctx.lineTo(260+60*a.lvl,-74);ctx.closePath();ctx.fill()}
  ctx.restore()}
 A.arcs=A.arcs.filter(a=>a.l>0);ctx.restore()}
// ---------- move list ----------
(function(){const tb0=document.querySelector('#moves table');if(!tb0||document.getElementById('kd48row'))return;const tb=tb0.tBodies[0]||tb0;const at=document.getElementById('kd47row');
 const R=[['🥊 KITTI PADDY QUICK TAPS + POWER PUNCHES — a quick tap (let go fast) · holding still walks / crouches','',''],
  ['SLIP: quick lean-back step · then Claw = SLIP JAB','tap ← (away)','tap ◀'],
  ['WEAVE: bob-and-weave under a punch · then Claw = WEAVE HOOK','tap ↓','tap ▼'],
  ['HAYMAKER: HOLD Claw to wind up (glows), let go = huge overhand · tap toward first = POWER JAB','hold X','hold CLAW'],
  ['POWER UPPERCUT (Practice Room, UPPERCUT NEW): HOLD ↑ + Claw — he coils deeper, then a big gold uppercut. Tap ↑ + Claw = the quicker uppercut, feet stay down','hold ↑+X','hold ▲+CLAW'],
  ['DASH UPPERCUT: dash, then Claw — he slides in and uppercuts them into the air','→ → then X','▶ ▶ then CLAW'],
  ['GROUND POUND: in the air (jump, pounce, or after a launcher), ↓ + Claw — he hammers straight down','in air: ↓+X','in air: ▼+CLAW'],
  ['Chain freely: tap, Claw, tap, Claw … the combo keeps counting','','']];
 let ref=at;R.forEach((r,i)=>{const tr=document.createElement('tr');if(!i){tr.id='kd48row';tr.innerHTML=`<th colspan="3" style="color:#ffb070">${r[0]}</th>`}else tr.innerHTML=`<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`;
  tb.insertBefore(tr,ref?ref:tb.rows[Math.min(tb.rows.length,1+i)]||null)})})();
})();
