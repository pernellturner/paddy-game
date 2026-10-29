// v20h – FORM-TRUE FINISHERS: instead of the shared white flash + light pillar, each big finisher / ultimate shows the POWER
// Paddy releases, true to the form. Paddy's own aura flares up first. Family-friendly spectacle, no scary bits.
// 4 Crimson: sky-splitting crimson sword wave · 7 Storm Titan: lightning dragon · 8 Dragon Emperor: dragon spirit roar · 9 Phoenix: giant fire-bird
// 10 Frost: the screen freezes and shatters · 11 Mecha: giant mech-arm punch · 12 Tide: tidal wave · 13 Chrono: gears freeze & rewind time
// 14 Beast King: spirit lion charge · 15 Dark Side: crushing force implosion
(function(){
if(typeof UF==='undefined')return;
const SETS=new Set([4,7,8,9,10,11,12,13,14,15]);
const FIN={sp:[],aura:{u:-1,l:0,max:1}};window.FIN=FIN;
FIN.charge=(u,l)=>{FIN.aura={u,l:l||1,max:l||1}};
FIN.go=(u,x,big)=>{if(!SETS.has(u))return false;const L={4:1.6,7:1.7,8:1.8,9:1.8,10:1.9,11:1.4,12:1.8,13:2.2,14:1.5,15:1.6}[u]||1.6;
 FIN.sp.push({u,x,t:0,L,dir:p.face,seed:Math.random()*99,big:!!big});FIN.charge(u,.9);
 try{SND.play({7:'lightning',8:'beast_roar',9:'fire_whoosh',10:'ice_crack',11:'mecha_laser',12:'water_wave',13:'time_stop',14:'beast_roar',15:'force_push',4:'blade_slash'}[u],{v:1,gap:.3})}catch(_){}
 return true};
let noPil=0;const _mp=mPillar;mPillar=function(){if(noPil)return;return _mp.apply(this,arguments)};
const _mb=mBig;mBig=function(u,x,big){if(big&&SETS.has(u)){noPil++;try{_mb(u,x,big)}finally{noPil--}FIN.go(u,x,1);return}return _mb(u,x,big)};
const _ub=uBoom;uBoom=function(x,col,col2,f){_ub.apply(this,arguments);const uf=(f|0)-4;
 if(SETS.has(uf)){cine.pillar=null;flashT=Math.min(flashT,.12);if(uf<7)FIN.go(uf,x,1)}};
// ---------- update ----------
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);const A0=FIN.aura;if(A0.l>0)A0.l-=dt;
 for(const s of FIN.sp){s.t+=dt;const X=UF[s.u]||{},c=X.col||'#fff',c2=X.col2||'#fff',k=s.t/s.L;
  if(Math.random()<.7)sparks.push({x:s.x+(Math.random()-.5)*500,y:GROUND-Math.random()*360,vx:(Math.random()-.5)*200,vy:-150-Math.random()*250,l:.5,c:Math.random()<.5?c:c2});
  if(s.u===11&&s.t>.28&&!s.hit){s.hit=1;shake=Math.max(shake,30);R9.rings.push({x:s.x,y:GROUND-140,r:30,vr:1500,l:.8,col:c,col2:'#fff',w:18,f:5,face:0})}
  if(s.u===15&&s.t>.62&&!s.hit){s.hit=1;shake=Math.max(shake,28);for(let q=0;q<4;q++)R9.rings.push({x:s.x,y:GROUND-140,r:10+q*20,vr:1500+q*200,l:.9,col:q%2?'#1a0008':c,col2:c2,w:18,f:19,face:0})}
  if(s.u===10&&s.t>.9&&!s.hit){s.hit=1;shake=Math.max(shake,22);try{SND.play('ice_crack',{v:1,gap:.2})}catch(_){}}}
 FIN.sp=FIN.sp.filter(s=>s.t<s.L)};
// ---------- drawing helpers ----------
const W2S=(x,y)=>[offX+(x+(typeof camX!=='undefined'?camX:0))*scale,offY+(y+camY)*scale];
const rnd=(s,i)=>{const v=Math.sin(s*12.9898+i*78.233)*43758.5453;return v-Math.floor(v)};
function glowLine(pts,w,c,al){for(const [lw,cc,a] of [[w*3.2,c,.25],[w,c,.9],[w*.35,'#fff',1]]){ctx.globalAlpha=al*a;ctx.strokeStyle=cc;ctx.lineWidth=lw;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}}
function gear(x,y,R,n,a,c){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();for(let i=0;i<n*2;i++){const r=i%2?R:R*1.16,a0=i/(n*2)*6.283,a1=(i+1)/(n*2)*6.283;ctx.lineTo(Math.cos(a0)*r,Math.sin(a0)*r);ctx.lineTo(Math.cos(a1)*r,Math.sin(a1)*r)}ctx.closePath();
 ctx.fillStyle=c;ctx.fill();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(0,0,R*.45,0,6.283);ctx.fill();ctx.restore()}
// ---------- the set-pieces ----------
function drawSP(s){const X=UF[s.u]||{},c=X.col||'#fff',c2=X.col2||'#fff',t=s.t,k=t/s.L,fade=Math.min(1,(s.L-t)*2.5),d=s.dir||1,top=-camY-260,x=s.x;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation='lighter';
 switch(s.u){
 case 4:{// a crimson sword-energy wave that splits the sky in two
  const g=Math.min(1,t/.22),pts=[];for(let i=0;i<=18;i++){const q=i/18;pts.push([x+(rnd(s.seed,i)-.5)*40*(1-q*.3),top+(GROUND-top)*q*g])}glowLine(pts,22,c,fade);
  ctx.globalAlpha=.35*fade;const gr=ctx.createLinearGradient(x-260,0,x+260,0);gr.addColorStop(0,'rgba(255,40,60,0)');gr.addColorStop(.5,'rgba(255,60,80,.9)');gr.addColorStop(1,'rgba(255,40,60,0)');ctx.fillStyle=gr;ctx.fillRect(x-260*g,top,520*g,GROUND-top);
  const wx=x+d*Math.max(0,t-.15)*1500,R=330;ctx.save();ctx.translate(wx,GROUND-200);ctx.scale(d,1);ctx.globalAlpha=fade*.9;ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,R,-1.3,1.3);ctx.arc(-R*.5,0,R*.95,1.15,-1.15,true);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=10;ctx.beginPath();ctx.arc(0,0,R,-1.25,1.25);ctx.stroke();ctx.restore();
  for(let i=0;i<3;i++){const ph=s.seed+i*2,pr=[];for(let j=0;j<=14;j++){const q=j/14;pr.push([x-d*80+d*q*600*Math.min(1,t*2),GROUND-140-i*70+Math.sin(q*8+ph+t*10)*30])}glowLine(pr,6,i%2?c:'#ff8090',fade*.8)}
  break}
 case 7:{// a lightning dragon dives out of the storm
  const g=Math.min(1,t/.55),n=26,pts=[];for(let i=0;i<=n*g;i++){const q=i/n;pts.push([x+Math.sin(q*9+s.seed)*170*(1-q)+(rnd(s.seed+t,i)-.5)*18,top+(GROUND-120-top)*q])}
  glowLine(pts,30,c,fade);glowLine(pts,12,c2,fade);const h=pts[pts.length-1],h0=pts[Math.max(0,pts.length-3)];if(h){const a=Math.atan2(h[1]-h0[1],h[0]-h0[0]);ctx.save();ctx.translate(h[0],h[1]);ctx.rotate(a);ctx.globalAlpha=fade;
   ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(70,0);ctx.lineTo(-20,-42);ctx.lineTo(-10,0);ctx.lineTo(-20,42);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-10,-30);ctx.lineTo(-70,-70);ctx.moveTo(-10,30);ctx.lineTo(-70,70);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(18,-12,8,0,6.283);ctx.fill();ctx.restore()}
  if(g>=1){ctx.globalAlpha=fade*.5;ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,GROUND-20,320,40,0,0,6.283);ctx.fill()}break}
 case 8:{// a jade dragon spirit rises behind Paddy and ROARS
  const hx=p.x-d*40,hy=GROUND-250-Math.min(1,t*3)*30,sc=1.3;ctx.save();ctx.translate(hx,hy);ctx.scale(d*sc,sc);ctx.globalAlpha=.55*fade;
  ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(-120,20);ctx.quadraticCurveTo(-60,-70,40,-50);ctx.quadraticCurveTo(110,-40,140,-10);ctx.lineTo(150,10);ctx.quadraticCurveTo(90,20,60,18);ctx.lineTo(140,40+Math.sin(t*20)*10);ctx.quadraticCurveTo(40,70,-60,60);ctx.closePath();ctx.fill();
  ctx.strokeStyle=c;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-30,-55);ctx.quadraticCurveTo(-80,-130,-150,-140);ctx.moveTo(0,-58);ctx.quadraticCurveTo(-30,-150,-90,-180);ctx.stroke();
  ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(120,20);ctx.quadraticCurveTo(180,60,230,40+Math.sin(t*6)*20);ctx.moveTo(110,0);ctx.quadraticCurveTo(170,-40,230,-30+Math.sin(t*6)*20);ctx.stroke();
  ctx.globalAlpha=fade;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(50,-28,12,7,0,0,6.283);ctx.fill();ctx.restore();
  for(let i=0;i<5;i++){const r=((t*1.6+i*.2)%1)*620;ctx.globalAlpha=fade*(1-r/620)*.8;ctx.strokeStyle=i%2?c:c2;ctx.lineWidth=12;ctx.beginPath();ctx.arc(hx+d*200,hy+40,r,d>0?-.7:Math.PI-.7,d>0?.7:Math.PI+.7);ctx.stroke()}break}
 case 9:{// Paddy erupts into a giant fire-bird that soars up
  const by=GROUND-160-t*260,flap=Math.sin(t*9)*.35,sc=1.5+t*.4;ctx.save();ctx.translate(x,by);ctx.scale(sc,sc);ctx.globalAlpha=fade*.85;
  for(const sd of [1,-1]){const gr=ctx.createLinearGradient(0,0,sd*300,-100);gr.addColorStop(0,'#fff6c0');gr.addColorStop(.4,c2);gr.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,0);
   for(let f=0;f<6;f++){const a=-.2-f*.22+flap;ctx.quadraticCurveTo(sd*140*Math.cos(a),-160*Math.sin(-a)-20,sd*(260-f*25)*Math.cos(a+flap*.3),-(200-f*20)*Math.sin(-a+.3))}ctx.lineTo(0,10);ctx.fill()}
  const tg=ctx.createLinearGradient(0,0,0,240);tg.addColorStop(0,c2);tg.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=tg;for(let f=-2;f<=2;f++){ctx.beginPath();ctx.moveTo(-14,10);ctx.quadraticCurveTo(f*50,140,f*80,230+Math.sin(t*12+f)*20);ctx.lineTo(14,10);ctx.fill()}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,-20,26,46,0,0,6.283);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-74,22,0,6.283);ctx.fill();ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(18,-78);ctx.lineTo(44,-70);ctx.lineTo(18,-64);ctx.fill();ctx.restore();break}
 case 11:{// a GIANT mech arm punches in from behind Paddy
  const out=t<.28?t/.28:t<.9?1:Math.max(0,1-(t-.9)/.5),fx=x-d*40+d*0,sx=fx-d*(1-out)*1100,y=GROUND-150;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=fade;
  ctx.save();ctx.translate(sx,y);ctx.scale(d,1);ctx.fillStyle='#5b6470';ctx.fillRect(-1200,-50,1080,100);ctx.fillStyle=c;for(let i=0;i<5;i++)ctx.fillRect(-1150+i*220,-56,40,112);
  ctx.fillStyle='#8a94a2';ctx.fillRect(-160,-80,170,160);ctx.fillStyle='#3a4048';for(let i=0;i<4;i++)ctx.fillRect(10,-78+i*40,60,36);ctx.fillStyle=c2;ctx.beginPath();ctx.arc(-80,0,22,0,6.283);ctx.fill();
  ctx.fillStyle='#fff';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-1100+i*190,-34,6,0,6.283);ctx.fill()}ctx.restore();
  if(t>.28&&t<.6){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(.6-t)*2;ctx.fillStyle=c2;ctx.beginPath();ctx.arc(sx+d*90,y,160,0,6.283);ctx.fill()}break}
 case 12:{// a tidal wave rolls across the arena
  const wx=x-d*500+d*t*900,H=360*Math.min(1,t*3);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.78*fade;const gr=ctx.createLinearGradient(0,GROUND-H,0,GROUND);gr.addColorStop(0,'#e8ffff');gr.addColorStop(.25,c);gr.addColorStop(1,'#0a4a8a');ctx.fillStyle=gr;
  ctx.beginPath();ctx.moveTo(wx-d*1400,GROUND);ctx.lineTo(wx-d*1400,GROUND-H*.6);ctx.quadraticCurveTo(wx-d*300,GROUND-H*.75,wx-d*60,GROUND-H);ctx.quadraticCurveTo(wx+d*90,GROUND-H*1.02,wx+d*110,GROUND-H*.8);ctx.quadraticCurveTo(wx+d*40,GROUND-H*.78,wx+d*30,GROUND-H*.55);ctx.quadraticCurveTo(wx+d*140,GROUND-H*.3,wx+d*200,GROUND);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';for(let i=0;i<14;i++){ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.arc(wx-d*(i*40)+Math.sin(t*9+i)*8,GROUND-H*(.95-i*.02)+rnd(s.seed,i)*20,6+rnd(s.seed,i+9)*8,0,6.283);ctx.fill()}break}
 case 13:{// gears lock time, spin it backwards, release
  const rev=t>.8?-1:1,sp=t<.8?t*3:(.8*3-(t-.8)*5);ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=.55*fade;gear(x,GROUND-220,170,14,sp,c);gear(x-d*230,GROUND-80,95,10,-sp*1.6,c2);gear(x+d*200,GROUND-380,80,9,-sp*1.9,c2);
  ctx.globalAlpha=fade;ctx.strokeStyle='#fff';ctx.lineWidth=10;ctx.beginPath();ctx.arc(x,GROUND-220,60,0,6.283);ctx.stroke();ctx.lineWidth=8;const ha=sp*2*rev;ctx.beginPath();ctx.moveTo(x,GROUND-220);ctx.lineTo(x+Math.cos(ha)*50,GROUND-220+Math.sin(ha)*50);ctx.moveTo(x,GROUND-220);ctx.lineTo(x+Math.cos(ha*4)*36,GROUND-220+Math.sin(ha*4)*36);ctx.stroke();break}
 case 14:{// a golden spirit lion charges through
  const lx=x-d*520+d*t*1300,ly=GROUND-120,run=Math.sin(t*26);ctx.save();ctx.translate(lx,ly);ctx.scale(d*1.7,1.7);ctx.globalAlpha=.6*fade;ctx.fillStyle=c;
  ctx.beginPath();ctx.ellipse(-30,0,95,48,0,0,6.283);ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(30,30);ctx.lineTo(45+run*25,95);ctx.moveTo(-90,30);ctx.lineTo(-100-run*25,95);ctx.moveTo(10,30);ctx.lineTo(0-run*20,95);ctx.moveTo(-70,30);ctx.lineTo(-60+run*20,95);ctx.stroke();
  ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-120,-10);ctx.quadraticCurveTo(-180,-60,-200,-20+run*10);ctx.stroke();
  ctx.fillStyle=c2;ctx.beginPath();for(let i=0;i<18;i++){const a=i/18*6.283,r=i%2?62:44;ctx.lineTo(70+Math.cos(a)*r,-40+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(78,-40,32,0,6.283);ctx.fill();
  ctx.globalAlpha=fade;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(92,-48,6,0,6.283);ctx.fill();ctx.restore();
  for(let i=0;i<6;i++){ctx.globalAlpha=fade*.5;ctx.strokeStyle=c2;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(lx-d*200,ly-80+i*30);ctx.lineTo(lx-d*(400+i*30),ly-80+i*30);ctx.stroke()}break}
 case 15:{// the force crushes inward to one point… then bursts
  if(t<.62){const q=t/.62;for(let i=0;i<5;i++){const r=(1-((q+i*.2)%1))*560;ctx.globalAlpha=.7*(1-r/560)+.1;ctx.strokeStyle=i%2?c:c2;ctx.lineWidth=10;ctx.beginPath();ctx.ellipse(x,GROUND-140,r,r*.75,0,0,6.283);ctx.stroke()}
   for(let i=0;i<14;i++){const a=i/14*6.283+t*3,r=(1-q)*420+20;ctx.globalAlpha=.8;ctx.fillStyle=i%2?c:'#ffb0c0';ctx.beginPath();ctx.arc(x+Math.cos(a)*r,GROUND-140+Math.sin(a)*r*.7,7,0,6.283);ctx.fill()}
   ctx.globalAlpha=q;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,GROUND-140,10+q*16,0,6.283);ctx.fill()}
  else{const q=(t-.62)/(s.L-.62);ctx.globalAlpha=(1-q)*.8;const gr=ctx.createRadialGradient(x,GROUND-140,10,x,GROUND-140,600*q+60);gr.addColorStop(0,'#fff');gr.addColorStop(.3,c);gr.addColorStop(1,'rgba(20,0,10,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,GROUND-140,600*q+60,0,6.283);ctx.fill()}break}
 }
 ctx.restore()}
// screen-space overlays (frost freeze, chrono tint, dark-side dimming, crimson flash)
function drawOverlay(s){const t=s.t,X=UF[s.u]||{},c=X.col||'#fff';const W=cv.width,H=cv.height,[sx,sy]=W2S(s.x,GROUND-160);ctx.save();ctx.setTransform(1,0,0,1,0,0);
 if(s.u===10){if(t<.9){const a=Math.min(1,t*3)*.45;ctx.globalAlpha=a;ctx.fillStyle='#bfefff';ctx.fillRect(0,0,W,H);ctx.globalAlpha=Math.min(1,t*2.5);ctx.strokeStyle='#fff';ctx.lineWidth=3*(W/1000);
   for(let i=0;i<16;i++){let px=sx,py=sy;const a=i/16*6.283;ctx.beginPath();ctx.moveTo(px,py);for(let j=1;j<7;j++){px+=Math.cos(a+(rnd(s.seed,i*9+j)-.5))*W*.05*Math.min(1,t*2.2);py+=Math.sin(a+(rnd(s.seed,i*7+j)-.5))*W*.05*Math.min(1,t*2.2);ctx.lineTo(px,py)}ctx.stroke()}}
  else{const q=(t-.9)/(s.L-.9);for(let i=0;i<40;i++){const a=rnd(s.seed,i)*6.283,dd=q*W*(.4+rnd(s.seed,i+50)*.8),x=sx+Math.cos(a)*dd,y=sy+Math.sin(a)*dd+q*q*H*.4,r=W*.03*(1-q*.5);ctx.save();ctx.translate(x,y);ctx.rotate(q*8*(rnd(s.seed,i+3)-.5));ctx.globalAlpha=(1-q)*.85;ctx.fillStyle=i%3?'#dff6ff':'#9fdcff';ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.8,r*.6);ctx.lineTo(-r*.7,r*.4);ctx.closePath();ctx.fill();ctx.restore()}}}
 if(s.u===13){ctx.globalAlpha=.22*Math.min(1,(s.L-t)*2);ctx.fillStyle=t>.8?'#3fd0c0':'#ffd04d';ctx.fillRect(0,0,W,H)}
 if(s.u===15&&t<.62){ctx.globalAlpha=t/.62*.45;ctx.fillStyle='#14000a';ctx.fillRect(0,0,W,H)}
 if(s.u===4&&t<.18){ctx.globalAlpha=(.18-t)*3;ctx.fillStyle='#ff2a3a';ctx.fillRect(0,0,W,H)}
 ctx.restore()}
const _fx=drawFx;drawFx=function(){_fx();for(const s of FIN.sp)drawSP(s)};
const _dr=draw;draw=function(){_dr.apply(this,arguments);if(FIN.sp.length){ctx.save();for(const s of FIN.sp)drawOverlay(s);ctx.restore()}};
// Paddy's own aura powers up (behind him)
const _dd=drawDummies;drawDummies=function(){_dd();const A0=FIN.aura;if(A0.l<=0||p.uf!==A0.u)return;const X=UF[A0.u]||{},c=X.col||'#fff',c2=X.col2||'#fff',k=Math.min(1,A0.l/A0.max*1.5),x=p.x,y=p.y-100;
 ctx.save();ctx.globalCompositeOperation='lighter';const R=150+Math.sin(now*14)*12;const g=ctx.createRadialGradient(x,y,10,x,y,R);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.35,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=.55*k;ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,R*.8,R*1.2,0,0,6.283);ctx.fill();
 ctx.lineCap='round';for(let i=0;i<9;i++){const ox=(rnd(i,1)-.5)*150,ph=(now*2.2+rnd(i,2))%1;ctx.globalAlpha=k*(1-ph)*.8;ctx.strokeStyle=i%2?c:c2;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+ox,p.y-ph*220);ctx.lineTo(x+ox,p.y-ph*220-50);ctx.stroke()}ctx.restore()};
// power up the aura when a finisher / ultimate starts
if(typeof ufFinal==='function'){const _f=ufFinal;ufFinal=function(){const r=_f.apply(this,arguments);FIN.charge(p.uf,1.4);return r}}
if(typeof ufUltStart==='function'){const _u=ufUltStart;ufUltStart=function(){const r=_u.apply(this,arguments);FIN.charge(p.uf,2.2);return r}}
window.FINISHERS20H=true;})();
