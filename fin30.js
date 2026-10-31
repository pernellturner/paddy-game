// ===================== v30: FINISHER CINEMATIC + TAIL SPIN ATTACK (base Paddy) =====================
//  • BUNNY KICK BARRAGE (perfect 8th hit) is now a short movie moment: the music cuts to a low drone, the screen darkens
//    with letterbox bars and pushes in on Paddy, each of the 6 kicks lands with a big flash, shake, a comic POW and a rising
//    hit counter; the launch goes slow-mo with a burst, speed lines and a bold comic line ("WHOA, WHAT A MOVE!" ...),
//    then the music comes back. Any button after the launch skips straight back to play.
//  • TAIL SPIN reads as an attack: tail-whip comet arcs + motion streaks, a whoosh, a dust ring / air vortex,
//    enemies nearby get sucked in, then sparks and knockback on contact, and 'TAIL SPIN!' text.
//  Effects only (no new sprite sheets). Kept light for phones: no shadowBlur, capped particle lists.
(function(){
if(typeof bunnyState!=='function'||typeof drawCineHUD!=='function')return;
const base=()=>{try{return FORM()===0}catch(_){return false}};
const W30=window.W30={on:false,runs:0,kicks:0,lines:[],spins:0,pulls:0,spinHits:0,pows:[],nums:[],comic:null,flash:0,boom:null,speed:0,dark:0,dust:[],last:-1,musCut:false};
const rnow=()=>performance.now()/1000;
const LINES=[['WHOA, WHAT A MOVE!',null],['INCREDIBLE!',null],['PADDY POWER!',null],['UNSTOPPABLE!','vo_unstoppable'],['PURR-FECT!','vo_purrfect'],['AWESOME!','vo_awesome'],['KA-POW!',null],['TOTALLY PAWSOME!',null]];
const POW=['POW!','BAM!','WHAM!','BOP!','THWACK!','KA-BLAM!'];
try{NAMES.tailwhip='TAIL SPIN!';NAMES.tail3='TAIL SPIN LAUNCHER!';NAMES.spike='SPIKE!';KB.spike=[520,-900,.5,.12];REACH.spike=[200,200]}catch(_){}
const _say=say;say=function(t){if(W30.on&&p.state==='bunny'&&/^(KICK|JUGGLE)/.test(t||''))return;if(W30.comic&&rnow()-W30.comic.t0<1.7)return;return _say.apply(this,arguments)};
const snd=(k,o)=>{try{window.SND&&SND.play&&SND.play(k,o||{})}catch(_){}};
// ---------- audio: cut the music, low drone under the kicks ----------
let dr=null;
function musCut(on){W30.musCut=on;window.MUSCUT=on?1:0;try{const M=window.MUS,c=SND.ac();if(M&&M.bus&&c&&on){M.bus.gain.cancelScheduledValues(c.currentTime);M.bus.gain.setTargetAtTime(0,c.currentTime,.05)}}catch(_){}}
function drone(on){try{const c=SND.ac&&SND.ac(),o=SND.out&&SND.out();if(!c||!o)return;const t=c.currentTime;
 if(on){if(dr||c.state!=='running'||(SND.isMuted&&SND.isMuted())||!SND.on)return;const g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=320;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2,t+.3);f.connect(g);g.connect(o);
  const os=[[55,'sine',.9],[82.4,'triangle',.35],[110.6,'sawtooth',.12]].map(([fr,ty,v])=>{const x=c.createOscillator(),xg=c.createGain();x.type=ty;x.frequency.setValueAtTime(fr,t);x.frequency.linearRampToValueAtTime(fr*1.18,t+2);xg.gain.value=v;x.connect(xg);xg.connect(f);x.start(t);return x});
  dr={g,os}}
 else if(dr){const d=dr;dr=null;d.g.gain.cancelScheduledValues(t);d.g.gain.setValueAtTime(Math.max(.0001,d.g.gain.value),t);d.g.gain.exponentialRampToValueAtTime(.0001,t+.12);d.os.forEach(x=>{try{x.stop(t+.15)}catch(_){}})}}catch(_){}}
function thump(n){try{const c=SND.ac&&SND.ac(),o=SND.out&&SND.out();if(!c||!o||c.state!=='running'||(SND.isMuted&&SND.isMuted())||!SND.on)return;const t=c.currentTime,x=c.createOscillator(),g=c.createGain();
 x.type='sine';x.frequency.setValueAtTime(150+n*14,t);x.frequency.exponentialRampToValueAtTime(45,t+.18);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.5,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.24);x.connect(g);g.connect(o);x.start(t);x.stop(t+.26)}catch(_){}}
function whoosh(n){try{noiseS(.28+n*.06,300,2600+n*500,.22+n*.04)}catch(_){}}
function finish(){if(!W30.on)return;W30.on=false;if(W30.air){p.rot=0;W30.air=false}drone(false);musCut(false)}
// ---------- the finisher ----------
const _bk=bunnyKick;bunnyKick=function(){_bk.apply(this,arguments);if(!base()||p.state!=='bunny')return;
 if((!p.grab||!p.grab.alive)&&window.W31&&W31.upD&&W31.upD.alive&&rnow()-W31.upT<1.2)p.grab=W31.upD;
 W30.on=true;W30.runs++;W30.kicks=0;W30.shotAt=0;W30.charged=false;W30.comic=null;W30.boom=null;W30.speed=0;W30.dark=1;W30.nums.length=0;
 W30.air=false;W30.airS=null;if(wantAir()){W30.air=true;W30.airruns=(W30.airruns||0)+1;W30.airS={spins:0};if(!p.grab||!p.grab.alive)p.grab=airTarget();p.vx=0;p.vy=0;p.ground=false;p.kicks=0;texts.length=0}
 else vox('growl',.8,true);
 cine.tz=1.18;cine.tb=1;cine.tdim=.55;musCut(true);drone(true);snd('time_stop',{v:.35,r:1.4,gap:.5})};
const _card=card;card=function(t,s,c){if(base()&&p.state==='bunny'&&/BUNNY KICK/.test(t||'')){W30.sub=s;return}return _card.apply(this,arguments)};
const _bs=bunnyState;bunnyState=function(dt){if(!base()||!W30.on)return _bs(dt);
 if(W30.air&&W30.airS){if(W30.airS.impact&&p.t-W30.airS.impact>.12&&(P.attack||P.jump||P.dash||P.tail||P.special||P.left||P.right||P.dodge||P.guard)){p.state='normal';p.rot=0;p.combo=0;p.noFlick=false;slowT=0}else{cine.tdim=.58;airState(dt)}
  if(W30.musCut&&W30.airS.impact&&rnow()-W30.shotAt>.9)musCut(false);return}
 // skip: once he's been launched, any fresh press hands control straight back
 if(p.shot&&p.t>2.06&&(P.attack||P.jump||P.dash||P.tail||P.special||P.left||P.right||P.dodge||P.guard)){p.t=2.6;slowT=0}
 const k0=p.kicks|0,sh0=!!p.shot,r0=!!p.st2;_bs(dt);const g=p.grab&&p.grab.alive?p.grab:null;
 if(!p.shot){cine.tb=1;cine.tdim=.58;if(p.t>.3)cine.tz=Math.max(cine.tz,1.16+Math.min(6,p.kicks|0)*.025)}
 if((p.kicks|0)>k0){const n=p.kicks|0,x=g?g.x-p.face*20:p.x+p.face*90,y=g?g.y-(g.h||130)*.55:p.y-90;W30.kicks=n;
  W30.flash=Math.max(W30.flash,.75);shake=Math.max(shake,9+n*2.2);hitstop=Math.max(hitstop,.055+n*.006);hitNum=null;
  W30.pows.push({x:x+(Math.random()-.5)*30,y:y-20+(Math.random()-.5)*30,t:POW[(n-1)%POW.length],l:1,rot:(Math.random()-.5)*.5,s:.8+n*.06});if(W30.pows.length>6)W30.pows.shift();
  W30.nums.push({n,x,y:y-60,l:1});if(W30.nums.length>6)W30.nums.shift();
  for(let i=0;i<10;i++){const a=i/10*6.283+Math.random()*.3,v=380+Math.random()*260;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.28,c:i%3?'#ffe14d':'#fff'})}
  waves.push({x,y:y+40,r:16,l:.7,big:true});thump(n);snd('claw_heavy',{v:.55,r:.9+n*.05,gap:.05});if(n===2||n===5)vox('grunt',1,true)}
 if(p.st2&&!r0){W30.charged=true;cine.tz=1.36;snd('ult_charge',{v:.45,r:1.3,gap:1})}
 if(p.shot&&!sh0){const cx=g?g.x:p.x+p.face*60,cy=g?g.y-80:p.y-100;W30.shotAt=rnow();drone(false);
  slowT=Math.max(slowT,.75);hitstop=Math.max(hitstop,.12);cine.tz=.92;flashT=Math.min(flashT,.2);W30.flash=1;W30.speed=1;W30.boom={x:cx,y:cy,l:1};
  let i=Math.floor(Math.random()*LINES.length);if(i===W30.last)i=(i+1)%LINES.length;W30.last=i;const L=LINES[i];
  W30.comic={t:L[0],sub:W30.sub||('GRAB · '+(p.kicks|0)+' KICKS · LAUNCH'),t0:rnow(),hue:Math.random()*360};
  texts.length=0;snd('ult_explosion',{v:.7,gap:1});vox('meow',1,true);if(L[1])setTimeout(()=>snd(L[1],{v:1,gap:1}),260)}
 if(p.shot&&W30.musCut&&rnow()-W30.shotAt>.9)musCut(false)};
// ---------- tail spin ----------
const _tw=tailWhip;tailWhip=function(n){_tw.apply(this,arguments);if(!base()||p.state!=='tailwhip')return;W30.spins++;
 W30.spin={n:p.tn||n||1,dir:p.face,gr:p.ground,x:p.x,y:p.y,t0:now};whoosh(p.tn||1);vox((p.tn||1)===3?'growl':'meow',(p.tn||1)===3?.8:.3);
 say(['TAIL SPIN!','DOUBLE TAIL SPIN!','TAIL SPIN LAUNCHER!'][(p.tn||1)-1]||'TAIL SPIN!',['#ffd27a','#ffb870','#ff9a2e'][(p.tn||1)-1],true);
 const y0=p.ground?floorAt(p.x):p.y;for(let i=0;i<14;i++){const a=i/14*6.283;W30.dust.push({x:p.x+Math.cos(a)*40,y:y0+Math.sin(a)*8,vx:Math.cos(a)*(220+Math.random()*80),vy:Math.sin(a)*30-(p.ground?20:-60),r:9+Math.random()*7,l:.55,air:!p.ground})}
 if(W30.dust.length>60)W30.dust.splice(0,W30.dust.length-60)};
const _hd=hitDummy;hitDummy=function(d,move,dir){const r=_hd.apply(this,arguments);
 try{if(base()&&(move==='tailwhip'||move==='tail3')&&d){W30.spinHits++;const x=d.x-(dir||1)*30,y=d.y-(d.h||130)*.55;
  for(let i=0;i<9;i++){const a=Math.random()*6.283,v=260+Math.random()*320;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,l:.3,c:i%3?'#ffb840':'#fff'})}
  W30.pows.push({x,y:y-30,t:move==='tail3'?'WHOOSH!':'WHAP!',l:.8,rot:(Math.random()-.5)*.4,s:.55});if(W30.pows.length>6)W30.pows.shift();
  shake=Math.max(shake,move==='tail3'?10:6);hitstop=Math.max(hitstop,.045)}}catch(_){}return r};
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{
 if(W30.on&&p.state!=='bunny')finish();
 W30.flash=Math.max(0,W30.flash-dt*5);W30.speed=Math.max(0,W30.speed-dt*1.7);
 if(W30.boom){W30.boom.l-=dt*1.6;if(W30.boom.l<=0)W30.boom=null}
 for(const o of W30.pows)o.l-=dt*1.7;W30.pows=W30.pows.filter(o=>o.l>0);
 for(const o of W30.nums){o.l-=dt*1.25;o.y-=dt*90}W30.nums=W30.nums.filter(o=>o.l>0);
 for(const o of W30.dust){o.x+=o.vx*dt;o.y+=o.vy*dt;o.vx*=Math.pow(.12,dt);o.r+=dt*26;o.l-=dt}W30.dust=W30.dust.filter(o=>o.l>0);
 if(base()&&p.state==='tailwhip'){const s=W30.spin||{};
  if(p.t%.035<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:-p.face,l:.16});
  // vortex pull: nearby enemies get sucked toward the spinning tail, then the hit knocks them away
  if(p.t<.24){let pulled=false;for(const d of dummies){if(!d.alive||d.benched||d.gone)continue;const dx=p.x-d.x,ady=Math.abs((d.y-(d.h||130)*.4)-(p.y-50));if(Math.abs(dx)<320&&Math.abs(dx)>85&&ady<220){d.x+=Math.sign(dx)*Math.min(Math.abs(dx)-85,dt*(520+(s.n||1)*120));pulled=true;
    if(Math.random()<.35)sparks.push({x:d.x+Math.sign(dx)*30,y:d.y-(d.h||130)*.5,vx:Math.sign(dx)*300,vy:-30,l:.2,c:'#ffe7c2'})}}if(pulled&&!s.pulled){s.pulled=true;W30.pulls++}}}
 }catch(e){console.warn('w30',e)}};
// ---------- drawing (world space) ----------
const _fx=drawFx;drawFx=function(){_fx();try{
 const tw=base()&&p.state==='tailwhip',hasDust=W30.dust.length,hasPow=W30.pows.length;if(!tw&&!hasDust&&!hasPow&&!W30.boom)return;
 ctx.save();
 for(const o of W30.dust){ctx.globalAlpha=Math.max(0,o.l)*(o.air?.45:.6);ctx.fillStyle=o.air?'#fff3d8':'#e8d6b8';ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,6.283);ctx.fill()}
 if(tw){const s=W30.spin||{n:1},n=s.n||1,t=p.t,dir=s.dir||1,a0=t*26*dir,cx=p.x,cy=p.y-52,R=112+n*14,ry=30+n*4,u=Math.min(1,t/.08),fade=t>.36?Math.max(0,1-(t-.36)/.12):1;
  ctx.globalCompositeOperation='lighter';
  // two comet tail-whip arcs on a tilted ellipse round his waist, + one higher faint one
  for(const [off,tilt,yo,sc,al] of [[0,-.12,0,1,1],[Math.PI,-.12,0,1,.85],[Math.PI*.5,.18,-34,.78,.5]]){
   const SEG=9;for(let i=0;i<SEG;i++){const k=i/SEG,a=a0+off-dir*k*2.1,a2=a-dir*.26;ctx.globalAlpha=fade*u*al*(1-k)*.95;ctx.strokeStyle=i<2?'#ffffff':i<5?'#ffe08a':'#ff9a2e';ctx.lineWidth=(18-i*1.7)*sc;
    ctx.beginPath();ctx.ellipse(cx,cy+yo,R*sc,ry*sc,tilt,Math.min(a,a2),Math.max(a,a2));ctx.stroke()}}
  // motion streaks flung off the spin
  ctx.strokeStyle='#fff7e0';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<10;i++){const a=a0*.8+i*.628,rr=R+22+(i%3)*14,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.32-(i%2)*18,tx=-Math.sin(a)*dir,ty=Math.cos(a)*dir*.32;
   ctx.moveTo(x,y);ctx.lineTo(x+tx*46,y+ty*46)}ctx.globalAlpha=fade*.6;ctx.stroke();
  // ground dust ring or air vortex under him
  const gy=s.gr?floorAt(p.x)-4:p.y+6,rr=50+t*330;ctx.globalAlpha=fade*Math.max(0,.75-t*1.2);ctx.strokeStyle=s.gr?'#ffe7c2':'#bfe8ff';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(p.x,gy,rr,rr*.16,0,0,6.283);ctx.stroke();
  if(!s.gr){for(let k=0;k<3;k++){const r2=40+k*26,a=-a0*1.3+k;ctx.globalAlpha=fade*(.5-k*.12);ctx.lineWidth=5-k;ctx.beginPath();ctx.ellipse(p.x,p.y+14+k*16,r2,r2*.25,0,a,a+3.8);ctx.stroke()}}
  ctx.globalCompositeOperation='source-over'}
 if(W30.boom){const b=W30.boom,u=1-b.l;ctx.globalCompositeOperation='lighter';for(let k=0;k<3;k++){ctx.globalAlpha=Math.max(0,b.l-k*.15);ctx.strokeStyle=k?'#ff9ad5':'#fff';ctx.lineWidth=(14-k*4)*b.l+2;ctx.beginPath();ctx.arc(b.x,b.y,40+u*(260+k*90),0,6.283);ctx.stroke()}
  ctx.globalAlpha=Math.max(0,b.l*.8);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,70*(1-u)+10,0,6.283);ctx.fill();ctx.globalCompositeOperation='source-over'}
 // comic POW bursts at the contact point
 for(const o of W30.pows){const u=1-o.l,sc=o.s*(u<.12?.5+u/.12*.7:1.2-Math.min(.2,u*.4)),R=58*sc;ctx.save();ctx.globalAlpha=Math.min(1,o.l*2.2);ctx.translate(o.x,o.y);ctx.rotate(o.rot);
  ctx.beginPath();for(let i=0;i<14;i++){const a=i/14*6.283,r=i%2?R*.62:R;ctx.lineTo(Math.cos(a)*r*1.25,Math.sin(a)*r)}ctx.closePath();ctx.fillStyle='#ffe14d';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#2a1030';ctx.stroke();
  ctx.font=`${Math.round(26*sc)}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=5;ctx.strokeStyle='#2a1030';ctx.strokeText(o.t,0,2);ctx.fillStyle='#ff3d7f';ctx.fillText(o.t,0,2);ctx.restore()}
 ctx.restore()}catch(e){}};
// ---------- drawing (screen space, over the letterbox) ----------
let VG=null,VGs=0;
const _ch=drawCineHUD;drawCineHUD=function(){
 try{const inB=base()&&p.state==='bunny'&&W30.on;W30.dark+=((inB?1:0)-W30.dark)*.12;
  if(W30.dark>.02){if(!VG||VGs!==scale){VGs=scale;VG=ctx.createRadialGradient(VW/2,VH*.52,VH*.22,VW/2,VH*.52,VW*.62);VG.addColorStop(0,'rgba(10,0,25,0)');VG.addColorStop(1,'rgba(10,0,25,.85)')}
   ctx.save();ctx.globalAlpha=W30.dark;ctx.fillStyle=VG;ctx.fillRect(-500,-500,VW+1000,VH+1000);ctx.restore()}}catch(_){}
 _ch();
 try{
  if(W30.flash>.01){ctx.save();ctx.globalAlpha=Math.min(.42,W30.flash*.5);ctx.fillStyle=W30.speed>.5?'#fff':'#ffe0f0';ctx.fillRect(-500,-500,VW+1000,VH+1000);ctx.restore()}
  // anime speed lines out from the launch
  if(W30.speed>.02){const b=W30.boom,cx=b?zX(b.x)+camX:VW/2,cy=b?zY(b.y)+camY:VH/2;ctx.save();ctx.globalAlpha=Math.min(.8,W30.speed*1.2);ctx.fillStyle='#fff';ctx.beginPath();
   for(let i=0;i<28;i++){const a=i/28*6.283+Math.random()*.12,r0=170+Math.random()*120,r1=900,w=.012+Math.random()*.014;ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a-w)*r1,cy+Math.sin(a-w)*r1);ctx.lineTo(cx+Math.cos(a+w)*r1,cy+Math.sin(a+w)*r1)}
   ctx.fill();ctx.restore()}
  // rising hit counter at each kick
  for(const o of W30.nums){const u=1-o.l,pop=u<.12?.5+u/.12*.8:1.3-Math.min(.3,u*.6),x=zX(o.x)+camX,y=zY(o.y)+camY;ctx.save();ctx.globalAlpha=Math.min(1,o.l*2);ctx.translate(x,y);ctx.scale(pop,pop);ctx.rotate(-.08);
   ctx.font=`${48+o.n*4}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='#2a1030';const s=o.n+(o.n>1?' HITS':' HIT');ctx.strokeText(s,0,0);ctx.fillStyle=o.n%2?'#ff9ad5':'#ffe14d';ctx.fillText(s,0,0);ctx.restore()}
  // the big comic line
  const c=W30.comic;if(c){const t=rnow()-c.t0,D=1.9;if(t>D){W30.comic=null}else{const out=t>D-.3?Math.max(0,(D-t)/.3):1,y=VH*.27;ctx.save();ctx.globalAlpha=out;
   // starburst behind
   const bs=(t<.16?t/.16*1.15:1.15-Math.min(.15,(t-.16)*.5))*1;ctx.translate(VW/2,y);ctx.save();ctx.rotate(-.06+t*.12);ctx.scale(bs,bs*.62);ctx.beginPath();for(let i=0;i<22;i++){const a=i/22*6.283,r=i%2?165:225+((i*37)%5)*10;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();
   ctx.fillStyle=`hsl(${c.hue},95%,58%)`;ctx.fill();ctx.lineWidth=8;ctx.strokeStyle='#2a1030';ctx.stroke();ctx.beginPath();for(let i=0;i<22;i++){const a=i/22*6.283+.14,r=i%2?125:175;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fillStyle='#ffe14d';ctx.fill();ctx.restore();
   // letters bounce in one by one
   ctx.rotate(-.07);let size=62;ctx.font=`${size}px ${FONT}`;const full=ctx.measureText(c.t).width;if(full>VW*.84){size=Math.floor(size*VW*.84/full);ctx.font=`${size}px ${FONT}`}
   const tw=ctx.measureText(c.t).width;let x=-tw/2;ctx.textAlign='left';ctx.textBaseline='middle';ctx.lineJoin='round';
   for(let i=0;i<c.t.length;i++){const ch=c.t[i],w=ctx.measureText(ch).width,lt=t-i*.035;if(lt>0){const sc=lt<.1?.3+lt/.1*1.1:lt<.2?1.4-(lt-.1)*4:1,wob=Math.sin(t*9+i)*3;
     ctx.save();ctx.translate(x+w/2,wob);ctx.scale(sc,sc);ctx.lineWidth=14;ctx.strokeStyle='#2a1030';ctx.strokeText(ch,-w/2,0);ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(ch,-w/2,0);
     const g=ctx.createLinearGradient(0,-size*.45,0,size*.45);g.addColorStop(0,'#fff6a0');g.addColorStop(.5,'#ffc21a');g.addColorStop(1,'#ff5a2a');ctx.fillStyle=g;ctx.fillText(ch,-w/2,0);ctx.restore()}x+=w}
   if(c.sub&&t>.35){ctx.globalAlpha=out*Math.min(1,(t-.35)*4);ctx.font=`20px ${FONT}`;ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='#2a1030';ctx.strokeText(c.sub,0,size*.62+18);ctx.fillStyle='#fff';ctx.fillText(c.sub,0,size*.62+18)}
   ctx.restore()}}
 }catch(e){}};

// ---------- Paddy's voice: meows, growls, effort grunts (varied, not on every hit) ----------
const VOX={meow:['pvo_meow1','pvo_meow2','pvo_meow3'],growl:['pvo_growl1','pvo_growl2'],grunt:['pvo_grunt1','pvo_grunt3']};let voxT=0,voxLast='';
function vox(kind,prob,force){const t=rnow();if(!force&&(t-voxT<.75||Math.random()>(prob==null?1:prob)))return false;const L=VOX[kind]||VOX.grunt;let k=L[Math.floor(Math.random()*L.length)];if(k===voxLast&&L.length>1)k=L[(L.indexOf(k)+1)%L.length];
 voxT=t;voxLast=k;W30.vox=(W30.vox||0)+1;snd(k,{v:kind==='grunt'?.75:.8,r:.94+Math.random()*.14,gap:.2});return true}
W30.voxFn=vox;
const _sc30=startClaw;startClaw=function(){const r=_sc30.apply(this,arguments);try{if(base()&&p.state==='claw'){const c=p.combo|0;
 if(c===3)vox(Math.random()<.5?'meow':'grunt',.55);else if(c>=6)vox(Math.random()<.4?'growl':'grunt',.35);else vox('grunt',.2)}}catch(_){}return r};
const _act30=act;act=function(state){const r=_act30.apply(this,arguments);try{if(base()){if(state==='uppercut'||state==='dashstrike'||state==='kcounter')vox(state==='kcounter'?'growl':'grunt',.45);else if(state==='airspin')vox('meow',.35)}}catch(_){}return r};
// ---------- AERIAL FINISHER: the 8th hit lands in the air / mid-juggle -> mid-air grab, spin, SPIKE into the ground ----------
// Frame hook: swap these anim names for the artist's sheets later (register them with SM()/A like kitty29.js does), and set rot:false
// if the new spin frames already rotate. Every value is a key of FR/A.
window.AIRFIN_FRAMES=window.AIRFIN_FRAMES||{grab:'pclunge',spin:'airspin',windup:'bk_roll',spike:'diveclaw',land:'bk_land',rot:true};
const AF=k=>{const a=(window.AIRFIN_FRAMES||{})[k];return a&&FR[a]?a:({grab:'pclunge',spin:'airspin',windup:'bk_roll',spike:'diveclaw',land:'bk_land'})[k]};
function wantAir(){const g=p.grab&&p.grab.alive?p.grab:null;if(p.ground&&p.y>=GROUND-40&&window.W31&&W31.upT&&rnow()-W31.upT<1.2)return false; // v31: our own ground UPPERCUT pop-up -> catch him: ground Bunny Kick
if(!p.ground||p.y<GROUND-40)return true;if(g&&g.y<GROUND-70)return true;
 if(!g){for(const d of dummies)if(d.alive&&!d.benched&&d.y<GROUND-90&&Math.abs(d.x-p.x)<260&&d.y>p.y-420)return true}return false}
function airTarget(){let best=null,bd=420;for(const d of dummies){if(!d.alive||d.benched||d.gone)continue;const dd=Math.hypot(d.x-p.x,(d.y-p.y)*.8);if(dd<bd){bd=dd;best=d}}return best}
function airState(dt){const A=W30.airS,t=p.t,g=p.grab&&p.grab.alive?p.grab:null;p.inv=Math.max(p.inv,.5);p.noFlick=true;cine.tb=1;
 const hold=(x,y,k)=>{if(!g)return;g.x+=(x-g.x)*Math.min(1,dt*k);g.y+=(y-g.y)*Math.min(1,dt*k);g.vx=0;g.vy=0;g.fl=.5;g.cool=Math.max(g.cool||0,1.5)};
 if(!A.impact){p.vx=0;
  if(t<.22){setAnim(AF('grab'));p.rot=0;const tx=g?g.x-p.face*70:p.x,ty=g?Math.min(GROUND-60,g.y+20):Math.min(p.y,GROUND-200);p.x+=(tx-p.x)*Math.min(1,dt*14);p.y+=(ty-p.y)*Math.min(1,dt*14);p.vy=0;
   if(t>.1&&!A.g1){A.g1=1;if(g){g.hp=Math.max(6,g.hp);hitDummy(g,'bunnygrab',p.face)}say('AIR GRAB!','#ff9ad5',true);hitstop=.08;vox('growl',1,true);
    for(let i=0;i<12;i++){const a=i/12*6.283;sparks.push({x:p.x+p.face*60+Math.cos(a)*70,y:p.y-70+Math.sin(a)*70,vx:-Math.cos(a)*320,vy:-Math.sin(a)*320,l:.3,c:i%2?'#fff':'#ff9ad5'})}}
   if(t>.1)hold(p.x+p.face*70,p.y-20,16);A.y0=p.y}
  else if(t<1.02){setAnim(AF('spin'));const u=(t-.22)/.8;p.y=A.y0-Math.sin(Math.min(1,u)*1.57)*90;p.vy=0;if(AIRFIN_FRAMES.rot!==false)p.rot=-p.face*u*6.283*2;
   const a=u*6.283*2;hold(p.x+Math.cos(a)*p.face*78,p.y-40+Math.sin(a)*46,22);cine.tz=Math.max(cine.tz,1.2);
   const n=Math.floor(u*4);if(n>(A.spins|0)-1&&n<4){A.spins=n+1;if(g){g.hp=Math.max(4,g.hp);hitDummy(g,'bunnykick',p.face);g.vx=0;g.vy=0}W30.kicks=A.spins;const hx=g?g.x:p.x,hy=g?g.y-60:p.y-60;
    if(n%2)W30.pows.push({x:hx,y:hy,t:['SPIN!','WHIRL!','SPIN!!','WHOOSH!'][n],l:1,rot:(Math.random()-.5)*.5,s:.8+n*.08});W30.nums.push({n:A.spins,x:hx,y:hy-50,l:1});W30.flash=Math.max(W30.flash,.6);shake=Math.max(shake,8+n*2);thump(n+1);if(n===1)vox('grunt',1,true)}
   if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.18,blue:1})}
  else if(t<1.16){setAnim(AF('windup'));p.rot=0;p.vy=0;hold(p.x+p.face*40,p.y+40,18);if(!A.w){A.w=1;hitstop=.12;cine.tz=1.34;say('SPIKE...','#fff',true);snd('ult_charge',{v:.4,r:1.5,gap:1})}}
  else{setAnim(AF('spike'));p.rot=0;p.vy=2600;hold(p.x+p.face*30,p.y+60,30);if(t%.02<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.22,blue:1});
   if(p.ground||p.y>=floorAt(p.x)-2||t>1.7)airImpact(g)}}
 else{p.vx*=Math.pow(.02,dt);p.rot=0;if(t-A.impact>.7||t>2.6){p.state='normal';p.rot=0;p.combo=0;p.inv=.4;p.noFlick=false}}}
function airImpact(g){const A=W30.airS;A.impact=p.t;p.shot=true;p.y=floorAt(p.x);p.vy=0;p.ground=true;setAnim(AF('land'),true);const cx=p.x+p.face*30,cy=p.y;
 if(g){g.x=cx;g.y=cy;g.hp=Math.max(4,g.hp);hitDummy(g,'spike',p.face);g.vy=-900;g.vx=p.face*520;g.fl=.9}areaHit(cx,cy-40,260,'spike');
 W30.shotAt=rnow();drone(false);shake=36;slowT=Math.max(slowT,.7);flashT=.18;hitstop=.12;cine.tz=.9;W30.flash=1;W30.speed=1;W30.boom={x:cx,y:cy-30,l:1};
 for(let i=0;i<5;i++)waves.push({x:cx,y:cy-4,r:20+i*45,l:1,big:true});burst(cx,cy-40);burst(cx,cy-90,1);
 for(let i=0;i<26;i++){const a=i/26*6.283;W30.dust.push({x:cx+Math.cos(a)*50,y:cy+Math.sin(a)*8,vx:Math.cos(a)*(380+Math.random()*160),vy:-20-Math.random()*60,r:12+Math.random()*10,l:.7})}if(W30.dust.length>60)W30.dust.splice(0,W30.dust.length-60);
 for(let i=0;i<40;i++){const a=-Math.PI*Math.random(),v=300+Math.random()*700;sparks.push({x:cx,y:cy-10,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.6,c:['#fff','#ffe14d','#ff9ad5','#e8d6b8'][i%4]})}
 cine.pillar={x:cx,l:1,col:'#ffd27a'};vox('meow',1,true);snd('ult_explosion',{v:.7,gap:1});
 let i=Math.floor(Math.random()*LINES.length);if(i===W30.last)i=(i+1)%LINES.length;W30.last=i;const L=LINES[i];
 W30.comic={t:L[0],sub:'AIR GRAB · '+(A.spins|0)+' SPINS · SPIKE',t0:rnow(),hue:Math.random()*360};texts.length=0;if(L[1])setTimeout(()=>snd(L[1],{v:1,gap:1}),260)}
window.FIN30=true;
})();
