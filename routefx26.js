// ===================== v26: NAMED MOVES LOOK LIKE THEIR NAMES =====================
// Every named combo route used to finish with the same rings + generic burst. Now each name picks its own picture:
// a crush grip that caves the ground in, dragons, tornadoes, tidal waves, ice walls, clocks, missiles, beams, lightning chains, claws, roars…
// The route's hit/card/slow-mo stay; only the shared ring burst is swapped for the named effect. List of names → effect: see RFX below.
(function(){
if(typeof routeFx!=='function')return;
const R=[];window.R26=R;
const tgt=()=>{try{return lkTarget()}catch(_){return null}};
const foes=r=>dummies.filter(d=>d.alive&&!d.benched&&Math.abs(d.x-p.x)<(r||700));
const add=(k,o)=>{o.k=k;o.t=0;o.L=o.L||1;R.push(o);return o};
const col=()=>{try{const f=FORM();return [LKF[f].col,LKF[f].col2]}catch(_){return ['#ffd23a','#fff']}};
// ---- name → effect (first match wins) ----
const RFX=[
 [/TREASURE/, 'coins'],
 [/FIST BARRAGE/, 'fists'],
 [/SHOCKWAVE/, 'shock'],
 [/CRUSH|CRUSHER|BUSTER SLAM|SKYFALL|ANCHORS/, 'crush'],
 [/DRAGON/, 'dragon'],
 [/DARK STORM|LIGHTNING|THUNDER|STATIC|VOLT|ZIGZAG|KIAI/, 'bolts'],
 [/TORNADO|CYCLONE|WHIRL|HURRICANE|SPIRAL|TEMPEST|PURR-NADO|HELICOPTER|GALE|MOON WHEEL/, 'twister'],
 [/CRESCENT|ECLIPSE/, 'crescent'],
 [/RIBBON/, 'dash'],
 [/TIDAL|WAVE|UNDERTOW|SEA SERPENT/, 'wave'],
 [/\bICE\b|GLACIER|BLIZZARD|AVALANCHE|WINTER|MIRROR STEP/, 'ice'],
 [/TIME STOP|REWIND|HOUR|GEAR|SKIP|ZERO/, 'clock'],
 [/MISSILE|BARREL|ROCKET|BROADSIDE/, 'missiles'],
 [/DAWN|\bWING|PHOENIX|SOLAR|FLARE|SUN|NOVA|CREST/, 'sunburst'],
 [/BEAM|LASER|CANNON|BIG IRON|POINT BLANK/, 'beam'],
 [/ROAR/, 'roar'],
 [/CLAW|PRIDE|POUNCE|HOOK/, 'claws'],
 [/CLONE|SHADOW|AFTERIMAGE|GHOST|PHANTOM|LEGION|MIRROR|ECHO|FLICKER/, 'clones'],
 [/STAR|COMET|METEOR|JUGGLE/, 'comet'],
 [/TELEPORT|LANCE|SPEAR|STINGER|THRUST|STAB|DASH|STEP|STREAK|QUICKDRAW|CHARGE|AFTERBURNER|SLIPSTREAM|UPDRAFT|ZOOM/, 'dash'],
 [/STORM|RAIN|RICOCHET|BALLET|BARRAGE|POD|SWARM|BATS?\b|SHURIKEN/, 'rain'],
 [/GRIP|PULL|SNATCH|GRAB/, 'grip'],
 [/HIGH TIME|PUSH|SHOCK|BURST|EXCEED|OVERDRIVE|SPLITTER|BREAKER|SMASH|SLAM|SHATTER/, 'shock'],
 [/SABER|BOOMERANG|SLICE|CUT|IAI|SWING|X!|TRICK|POOF/, 'xslash'],
 [/SAKURA|PARRY/, 'petals'],
];
window.RFX26=RFX;
const pick=nm=>{for(const [re,k] of RFX)if(re.test(nm))return k;return null};
function spawn(k,nm){const g=tgt(),[c1,c2]=col(),x=g?g.x:p.x+p.face*150,y=g?g.y:p.y,f=p.face;
 switch(k){
  case 'crush':{const T=(g?[g]:[]).concat(foes(380).filter(d=>d!==g)).slice(0,3);add('crush',{L:1.5,T,x,col:c1,col2:c2});for(const d of T){d.vx=0;d.cool=Math.max(d.cool||0,1.6)}break}
  case 'dragon':{const two=/TWIN|x2/.test(nm),up=/RISING|SPEAR/.test(nm);for(let i=0;i<(two?2:1);i++)add('dragon',{L:1.2,x0:p.x-f*120,y0:(up?GROUND+40:p.y-120-i*70),f,up,col:i?c2:'#ffd23a',ph:i*1.6});break}
  case 'twister':add('twister',{L:1.4,x,col:c1,col2:c2});break;
  case 'wave':add('wave',{L:1.3,x0:p.x,f,col:'#3fb8ff',col2:'#e8fbff'});break;
  case 'ice':add('ice',{L:1.6,x0:p.x+f*80,f,n:/AVALANCHE|ROW|WALL/.test(nm)?7:4});break;
  case 'clock':add('clock',{L:1.4,x,y:y-150,rev:/REWIND/.test(nm),col:c1});break;
  case 'missiles':for(let i=0;i<6;i++)add('missile',{L:.7+i*.05,x0:p.x,y0:p.y-110,x1:x+(i-2.5)*30,y1:y-60,dl:i*.06,col:c1});break;
  case 'beam':add('beam',{L:.9,x:p.x+f*70,y:p.y-100,f,col:c1,col2:c2,w:/GIGA|OVERDRIVE|RUNE/.test(nm)?44:28});break;
  case 'bolts':{const T=[g].concat(foes(700).filter(d=>d!==g)).filter(Boolean).slice(0,4);add('bolts',{L:.8,T,col:c2||'#bfe6ff',sky:/THUNDER|STATIC|KIAI/.test(nm)});break}
  case 'roar':add('roar',{L:1,x:p.x+f*60,y:p.y-110,f,col:c1});break;
  case 'claws':add('claws',{L:.6,x,y:y-90,f,col:c1});break;
  case 'sunburst':add('sun',{L:1.1,x,y:y-100,col:c1,col2:c2,wings:/WING|PHOENIX/.test(nm)});break;
  case 'crescent':add('cres',{L:.8,x0:p.x+f*60,y:p.y-100,f,col:c1});break;
  case 'clones':for(let i=1;i<=4;i++)add('clone',{L:.5+i*.08,x:x+(i%2?-1:1)*(50+i*30),y,f:(i%2?1:-1),col:c1,dl:i*.06});break;
  case 'comet':add('comet',{L:.9,x,y,col:c1});break;
  case 'dash':add('dash',{L:.5,x0:p.x-f*260,x1:x+f*60,y:p.y-95,col:c1,col2:c2});break;
  case 'rain':for(let i=0;i<14;i++)add('drop',{L:.5+Math.random()*.4,x:x+(Math.random()-.5)*360,y:y-420-Math.random()*200,dl:Math.random()*.4,col:i%2?c1:c2});break;
  case 'grip':add('grip',{L:.9,d:g,x,col:c1});break;
  case 'shock':add('shock',{L:.8,x,y:y-80,col:c1,col2:c2});break;
  case 'xslash':add('xslash',{L:.5,x,y:y-90,col:c1,col2:c2});break;
  case 'fists':for(let i=0;i<8;i++)add('fist',{L:.25,x:x-f*30+(Math.random()-.5)*60,y:y-60-Math.random()*80,f,dl:i*.05});break;
  case 'coins':for(let i=0;i<16;i++)add('coin',{L:1,x:x+(Math.random()-.5)*60,y:y-120,vx:(Math.random()-.5)*600,vy:-400-Math.random()*400});break;
  case 'petals':for(let i=0;i<22;i++)add('petal',{L:1.1,x:x+(Math.random()-.5)*300,y:y-300-Math.random()*150,ph:Math.random()*6,dl:Math.random()*.3});break;
 }}
// ---- hook the named-route finish: keep card/slow-mo/hit, swap the shared ring burst for the named effect ----
const _rf=routeFx;routeFx=function(f,r){const k=r&&!r.ult?pick(r.nm||''):null;
 if(k&&f>=5){const fl=LKF[f];texts.length=0;card(r.nm,r.k.split('').join(' '),fl.col);slowT=Math.max(slowT,.22);flashT=Math.max(flashT,.08);hitstop=Math.max(hitstop,.07);shake=Math.max(shake,12);
  const tg=tgt();if(tg&&p.lk){tg.hp=Math.max(2,tg.hp);NAMES.lkR=r.nm;hitDummy(tg,'lkR',Math.sign(tg.x-p.x)||p.face);if(k!=='crush'&&k!=='grip')tg.vy=Math.max(tg.vy,tg.y<GROUND-300?-250:-650)}
  spawn(k,r.nm);return}
 _rf(f,r);if(k)spawn(k,r.nm)};
// ---- update ----
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);for(const o of R){o.t+=dt;
  if(o.k==='crush'){for(const d of o.T){if(!d.alive)continue;d.vx=0;
    if(o.t<.55){d.vy=0;d.y+=((GROUND-60)-d.y)*Math.min(1,dt*6);d.sq=1.2+o.t*4;d.fl=.5}      // gripped & squeezed from the sides
    else if(o.t<.75){d.vy=2600;d.sq=-3}                                                  // slammed straight down
    else{if(!o.boom){o.boom=1;for(const q of o.T)if(q.alive){q.y=GROUND;q.hp=Math.max(1,q.hp);NAMES.fzcrush='FORCE CRUSH!';try{hitDummy(q,'fzcrush',Math.sign(q.x-p.x)||p.face)}catch(_){}q.vy=-300;q.sq=-3}
      shake=Math.max(shake,26);flashT=Math.max(flashT,.08);hitstop=Math.max(hitstop,.08);try{R9.cracks.push(mkCrack(o.x,FORM()))}catch(_){}try{SND.play('ground_slam',{v:1})}catch(_){}}}}}
  if(o.k==='grip'&&o.d&&o.d.alive&&o.t<.6){o.d.vx=0;o.d.vy=-60;o.d.sq=1+o.t*3}}
 for(let i=R.length-1;i>=0;i--)if(R[i].t>=R[i].L+(R[i].dl||0))R.splice(i,1)};
if(!KB.fzcrush)KB.fzcrush=[60,-520,.5,.1];
// ---- drawing (world space, after the normal fx) ----
function star(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
function glowLine(pts,w,c,a){ctx.globalAlpha=a;ctx.strokeStyle=c;ctx.lineWidth=w*2.4;ctx.globalCompositeOperation='lighter';ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
 ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#fff';ctx.lineWidth=w*.6;ctx.stroke()}
function draw1(o){const t=o.t-(o.dl||0);if(t<0)return;const u=Math.min(1,t/o.L),a=Math.max(0,1-u);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 switch(o.k){
 case 'crush':{for(const d of o.T){const cx=d.x,cy=d.y-70,cl=Math.min(1,o.t/.35);
   if(o.t<.75){// the dark force grip: five curved force fingers close around them, a dark haze squeezes in
    const R0=150-90*cl;const g=ctx.createRadialGradient(cx,cy,10,cx,cy,R0+40);g.addColorStop(0,'rgba(40,0,40,0)');g.addColorStop(.7,'rgba(60,0,60,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R0+40,0,6.283);ctx.fill();
    for(let i=0;i<5;i++){const an=i/5*6.283+o.t*1.5,x1=cx+Math.cos(an)*(R0+50),y1=cy+Math.sin(an)*(R0+50)*.9,x2=cx+Math.cos(an+.5)*R0*.55,y2=cy+Math.sin(an+.5)*R0*.5;
     const pts=[];for(let k=0;k<=10;k++){const s=k/10;pts.push([x1+(x2-x1)*s+Math.cos(an+1.57)*Math.sin(s*3.14)*30,y1+(y2-y1)*s+Math.sin(an+1.57)*Math.sin(s*3.14)*30])}
     ctx.globalAlpha=.9;ctx.strokeStyle='#2a0a2a';ctx.lineWidth=14;ctx.beginPath();pts.forEach((q,k)=>k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.strokeStyle=o.col;ctx.lineWidth=4;ctx.stroke()}
    ctx.globalAlpha=.8;ctx.strokeStyle=o.col2;ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.lineDashOffset=-o.t*80;ctx.beginPath();ctx.ellipse(cx,cy,R0*.8,R0*.9,0,0,6.283);ctx.stroke();ctx.setLineDash([])}
   if(o.t>=.75){// the ground caves in: a sunken crater, cracked rim, rubble falling in, dust
    const k=Math.min(1,(o.t-.75)/.12),fade=Math.min(1,(o.L-o.t)/.35),w=110*k;ctx.globalAlpha=fade;ctx.fillStyle='#1c1410';ctx.beginPath();ctx.ellipse(d.x,GROUND+6,w,22*k,0,0,6.283);ctx.fill();
    ctx.fillStyle='#3a2a1e';ctx.beginPath();ctx.ellipse(d.x,GROUND+2,w*.75,12*k,0,Math.PI,6.283);ctx.fill();ctx.strokeStyle='#c8a878';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(d.x,GROUND+2,w+6,24*k,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
    ctx.strokeStyle='#2a1a10';ctx.lineWidth=3;for(let i=0;i<8;i++){const s=i<4?-1:1,x1=d.x+s*(w*.9),x2=x1+s*(30+i%4*14);ctx.beginPath();ctx.moveTo(x1,GROUND+4);ctx.lineTo((x1+x2)/2,GROUND-6+i%3*6);ctx.lineTo(x2,GROUND+2);ctx.stroke()}
    const tt=o.t-.75;for(let i=0;i<10;i++){const s=i%2?1:-1,x=d.x+s*(w*1.1-tt*120*(1+i%3)),y=GROUND-30-i%4*12+tt*tt*500;if(Math.abs(x-d.x)<w*.2||y>GROUND+10)continue;ctx.fillStyle=i%3?'#6e5c46':'#8a7458';ctx.fillRect(x-5,y-5,10,10)}
    for(let i=0;i<9;i++){const an=Math.PI+i/8*Math.PI,r=30+tt*160;ctx.globalAlpha=fade*.6*Math.max(0,1-tt/.7);ctx.fillStyle='#d8c8a8';ctx.beginPath();ctx.arc(d.x+Math.cos(an)*r*1.4,GROUND+Math.sin(an)*r*.5,14+tt*30,0,6.283);ctx.fill()}}}
  break}
 case 'dragon':{const len=26,hx=o.up?o.x0+o.f*120+Math.sin(t*6)*30:o.x0+o.f*u*1100,hy=o.up?o.y0-u*700:o.y0+Math.sin(t*7+o.ph)*30;const pts=[];
  for(let i=0;i<len;i++){const s=i*.035;pts.push(o.up?[hx+Math.sin((t-s)*8+o.ph)*40,hy+i*22]:[hx-o.f*i*24,hy+Math.sin((t-s)*9+o.ph)*34])}
  ctx.globalAlpha=Math.min(1,a*2);for(let i=len-1;i>=0;i--){const q=pts[i],r=Math.max(4,18-i*.5);ctx.fillStyle=i%2?o.col:'#fff2a8';ctx.beginPath();ctx.arc(q[0],q[1],r,0,6.283);ctx.fill();if(i%3===0){ctx.fillStyle='#ff9a2e';ctx.beginPath();ctx.moveTo(q[0],q[1]-r);ctx.lineTo(q[0]-o.f*8,q[1]-r-12);ctx.lineTo(q[0]+o.f*6,q[1]-r);ctx.fill()}}
  const h=pts[0];ctx.fillStyle=o.col;ctx.beginPath();ctx.ellipse(h[0],h[1],30,22,o.up?-1.57:0,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(h[0]+(o.up?0:o.f*10),h[1]-(o.up?12:8),6,0,6.283);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(h[0]+(o.up?0:o.f*12),h[1]-(o.up?13:8),3,0,6.283);ctx.fill();
  ctx.strokeStyle='#ff9a2e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(h[0],h[1]-14);ctx.quadraticCurveTo(h[0]-o.f*30,h[1]-50,h[0]-o.f*60,h[1]-40);ctx.stroke();break}
 case 'twister':{for(let i=0;i<14;i++){const yy=GROUND-i*30,w=20+i*9,ph=t*14+i*.5;ctx.globalAlpha=a*.8;ctx.strokeStyle=i%2?o.col:o.col2;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(o.x+Math.sin(t*3+i*.3)*12,yy,w,8+i*.6,0,ph%6.283,ph%6.283+4);ctx.stroke()}
  for(let i=0;i<8;i++){const an=t*9+i,r=40+(i*17)%120;ctx.fillStyle='#8a7458';ctx.globalAlpha=a;ctx.fillRect(o.x+Math.cos(an)*r,GROUND-60-(t*300+i*40)%380,7,7)}break}
 case 'wave':{const x=o.x0+o.f*u*900,h=170*Math.sin(Math.min(1,u*1.4)*Math.PI);ctx.globalAlpha=Math.min(1,a*2);const g=ctx.createLinearGradient(0,GROUND-h,0,GROUND);g.addColorStop(0,o.col2);g.addColorStop(.3,o.col);g.addColorStop(1,'#1b5fa8');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(x-o.f*420,GROUND);ctx.quadraticCurveTo(x-o.f*200,GROUND-h*.3,x-o.f*40,GROUND-h);ctx.quadraticCurveTo(x+o.f*50,GROUND-h*1.1,x+o.f*40,GROUND-h*.6);ctx.quadraticCurveTo(x+o.f*10,GROUND-h*.75,x+o.f*60,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(x-o.f*(i*24)+Math.sin(t*20+i)*4,GROUND-h+i*8+((i*7)%10),6+i%3*3,0,6.283);ctx.fill()}break}
 case 'ice':{for(let i=0;i<o.n;i++){const x=o.x0+o.f*i*70,d=i*.07,k=Math.max(0,Math.min(1,(t-d)/.15)),h=(90+(i%3)*40)*k,fade=Math.min(1,(o.L-t)/.3);if(k<=0)continue;ctx.globalAlpha=fade;
  ctx.fillStyle='#bfe9ff';ctx.strokeStyle='#4aa8ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-26,GROUND);ctx.lineTo(x-8,GROUND-h);ctx.lineTo(x+4,GROUND-h-14);ctx.lineTo(x+26,GROUND);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.moveTo(x-10,GROUND-10);ctx.lineTo(x-4,GROUND-h+10);ctx.lineTo(x+2,GROUND-10);ctx.fill()}break}
 case 'clock':{const r=90*Math.min(1,t/.15);ctx.globalAlpha=a;ctx.fillStyle='rgba(255,250,230,.85)';ctx.strokeStyle='#8a6a2a';ctx.lineWidth=6;ctx.beginPath();ctx.arc(o.x,o.y,r,0,6.283);ctx.fill();ctx.stroke();
  for(let i=0;i<12;i++){const an=i/12*6.283;ctx.lineWidth=i%3?2:5;ctx.beginPath();ctx.moveTo(o.x+Math.cos(an)*r*.8,o.y+Math.sin(an)*r*.8);ctx.lineTo(o.x+Math.cos(an)*r*.92,o.y+Math.sin(an)*r*.92);ctx.stroke()}
  const s=(o.rev?-1:1)*t*14;ctx.strokeStyle='#222';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+Math.cos(s/12-1.57)*r*.5,o.y+Math.sin(s/12-1.57)*r*.5);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+Math.cos(s-1.57)*r*.75,o.y+Math.sin(s-1.57)*r*.75);ctx.stroke();
  if(o.rev){ctx.strokeStyle=o.col;ctx.lineWidth=5;ctx.beginPath();ctx.arc(o.x,o.y,r+16,-.5,-2.6,true);ctx.stroke()}break}
 case 'missile':{const x=o.x0+(o.x1-o.x0)*u,y=o.y0+(o.y1-o.y0)*u-Math.sin(u*Math.PI)*160,an=Math.atan2((o.y1-o.y0)-Math.cos(u*Math.PI)*160*Math.PI,(o.x1-o.x0));
  if(u<1){ctx.save();ctx.translate(x,y);ctx.rotate(an);ctx.fillStyle='#e8e8f0';ctx.fillRect(-14,-5,24,10);ctx.fillStyle='#ff4a3a';ctx.beginPath();ctx.moveTo(10,-5);ctx.lineTo(18,0);ctx.lineTo(10,5);ctx.fill();ctx.fillStyle='#ffb020';ctx.beginPath();ctx.moveTo(-14,-4);ctx.lineTo(-26-Math.random()*8,0);ctx.lineTo(-14,4);ctx.fill();ctx.restore()}
  if(u>.85){ctx.globalAlpha=(1-u)*6;star(o.x1,o.y1,26,'#ffe14d')}break}
 case 'beam':{const g=Math.min(1,t/.1),w=o.w*g*(1+.1*Math.sin(t*60));ctx.globalCompositeOperation='lighter';for(const [k,c,al] of [[1.8,o.col,.35],[1,o.col,.8],[.4,'#fff',1]]){ctx.globalAlpha=a*al;ctx.fillStyle=c;ctx.fillRect(Math.min(o.x,o.x+o.f*1400),o.y-w*k/2,1400,w*k)}break}
 case 'bolts':{const T=o.T.filter(d=>d&&d.alive);let px=p.x+p.face*60,py=p.y-110;for(const d of T){const qx=d.x,qy=d.y-90,src=o.sky?[qx+(Math.random()-.5)*60,qy-500]:[px,py];const pts=[src];for(let i=1;i<8;i++){const s=i/8;pts.push([src[0]+(qx-src[0])*s+(Math.random()-.5)*36,src[1]+(qy-src[1])*s+(Math.random()-.5)*36])}pts.push([qx,qy]);
   if(Math.floor(t*30)%3!==2)glowLine(pts,5,o.col,a);ctx.globalAlpha=a;star(qx,qy,14+Math.random()*8,'#fff');px=qx;py=qy}break}
 case 'roar':{for(let i=0;i<4;i++){const r=40+((t*420+i*70)%300);ctx.globalAlpha=a*(1-r/360);ctx.strokeStyle=i%2?o.col:'#fff';ctx.lineWidth=8;ctx.beginPath();ctx.arc(o.x,o.y,r,o.f>0?-.7:Math.PI-.7,o.f>0?.7:Math.PI+.7);ctx.stroke()}
  ctx.globalAlpha=a;ctx.font='bold 34px Bangers, Impact, sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=5;ctx.strokeText('ROAAR!',o.x+o.f*40,o.y-80);ctx.fillText('ROAAR!',o.x+o.f*40,o.y-80);break}
 case 'claws':{const k=Math.min(1,t/.12);for(let i=-1;i<=1;i++){const x=o.x+i*26,y0=o.y-90,y1=o.y+70;ctx.globalAlpha=a;ctx.strokeStyle=o.col;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(x-o.f*40,y0);ctx.quadraticCurveTo(x+o.f*20,(y0+y1)/2,x+o.f*(-10+60*k),y0+(y1-y0)*k);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.stroke()}break}
 case 'sun':{const r=40+u*220;ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(o.x,o.y,5,o.x,o.y,r);g.addColorStop(0,'#fff');g.addColorStop(.4,o.col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(o.x,o.y,r,0,6.283);ctx.fill();
  for(let i=0;i<16;i++){const an=i/16*6.283+t;ctx.strokeStyle=o.col2;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(o.x+Math.cos(an)*r*.5,o.y+Math.sin(an)*r*.5);ctx.lineTo(o.x+Math.cos(an)*r*1.1,o.y+Math.sin(an)*r*1.1);ctx.stroke()}
  if(o.wings){ctx.globalCompositeOperation='source-over';for(const s of [-1,1]){ctx.fillStyle='rgba(255,140,40,.75)';ctx.beginPath();ctx.moveTo(p.x,p.y-120);for(let i=0;i<=5;i++){const an=-1.3+i*.32;ctx.lineTo(p.x+s*Math.cos(an)*(150+u*60),p.y-120+Math.sin(an)*(110+u*40)-(i%2?0:20))}ctx.closePath();ctx.globalAlpha=a;ctx.fill()}}break}
 case 'cres':{const x=o.x0+o.f*u*800;ctx.globalAlpha=a;ctx.fillStyle=o.col;ctx.beginPath();if(o.f>0){ctx.arc(x,o.y,70,-1.4,1.4);ctx.arc(x-24,o.y,58,1.3,-1.3,true)}else{ctx.arc(x,o.y,70,Math.PI-1.4,Math.PI+1.4);ctx.arc(x+24,o.y,58,Math.PI+1.3,Math.PI-1.3,true)}ctx.closePath();ctx.fill();break}
 case 'clone':{const f=(FR[p.anim]||[])[0];if(f&&IMG[f.f]&&imgOK(IMG[f.f])){ctx.globalAlpha=a*.6;ctx.globalCompositeOperation='lighter';ctx.translate(o.x,o.y);ctx.scale(o.f*SC,SC);ctx.drawImage(IMG[f.f],-f.ax,-f.ay)}break}
 case 'comet':{const y=o.y-600+u*560;ctx.globalCompositeOperation='lighter';for(let i=0;i<10;i++){ctx.globalAlpha=a*(1-i/10);ctx.fillStyle=i%2?o.col:'#fff';ctx.beginPath();ctx.arc(o.x-i*10,y-i*26,22-i*1.6,0,6.283);ctx.fill()}if(u>.9){ctx.globalAlpha=1;star(o.x,o.y-40,40,'#ffe14d')}break}
 case 'dash':{ctx.globalAlpha=a;for(let i=-3;i<=3;i++){ctx.strokeStyle=i%2?o.col2:o.col;ctx.lineWidth=i?3:8;ctx.beginPath();ctx.moveTo(o.x0+(o.x1-o.x0)*u*.6,o.y+i*12);ctx.lineTo(o.x1,o.y+i*5);ctx.stroke()}break}
 case 'drop':{const y=o.y+u*(GROUND-o.y);ctx.globalAlpha=1;ctx.strokeStyle=o.col;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(o.x,y-30);ctx.lineTo(o.x,y);ctx.stroke();if(u>.9){star(o.x,GROUND-6,12,'#fff')}break}
 case 'grip':{const d=o.d;if(!d)break;const cx=d.x,cy=d.y-80;ctx.globalAlpha=a;ctx.strokeStyle=o.col;ctx.lineWidth=5;for(let i=0;i<4;i++){const an=i/4*6.283+t*3;ctx.beginPath();ctx.arc(cx,cy,60-20*Math.min(1,t*3),an,an+1);ctx.stroke()}
  ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(p.x+p.face*70,p.y-115);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);break}
 case 'shock':{for(let i=0;i<3;i++){const r=20+u*260-i*40;if(r<0)continue;ctx.globalAlpha=a;ctx.strokeStyle=i%2?o.col2:o.col;ctx.lineWidth=12-i*3;ctx.beginPath();ctx.arc(o.x,o.y,r,0,6.283);ctx.stroke()}ctx.globalAlpha=a;star(o.x,o.y,30*(1-u)+10,'#fff');break}
 case 'xslash':{const k=Math.min(1,t/.08);ctx.globalAlpha=a;for(const s of [-1,1]){ctx.strokeStyle=o.col;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(o.x-80*k,o.y-80*k*s);ctx.lineTo(o.x+80*k,o.y+80*k*s);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke()}break}
 case 'fist':{ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.strokeStyle='#3a2a1a';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(o.x,o.y,16,13,0,0,6.283);ctx.fill();ctx.stroke();ctx.strokeStyle='#ffd23a';ctx.lineWidth=3;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(o.x-o.f*80,o.y+k*8);ctx.lineTo(o.x-o.f*20,o.y+k*8);ctx.stroke()}star(o.x+o.f*14,o.y,18*(1-u)+6,'#ffe14d');break}
 case 'coin':{const x=o.x+o.vx*t,y=o.y+o.vy*t+900*t*t;if(y>GROUND)break;ctx.globalAlpha=1;ctx.fillStyle='#ffd23a';ctx.strokeStyle='#a87a10';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,9*Math.abs(Math.cos(t*12)),9,0,0,6.283);ctx.fill();ctx.stroke();break}
 case 'petal':{const x=o.x+Math.sin(t*4+o.ph)*30,y=o.y+u*340;ctx.globalAlpha=a;ctx.fillStyle='#ffb6d9';ctx.beginPath();ctx.ellipse(x,y,7,4,t*5+o.ph,0,6.283);ctx.fill();break}
 }
 ctx.restore()}
const _fx=drawFx;drawFx=function(){_fx();for(const o of R)draw1(o)};
window.ROUTEFX26=true;
})();
