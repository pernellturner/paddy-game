// ===================== ENDLESS CHAINS + MOON LAUNCHER + SHADE'S SHADOW LADDER (v20) =====================
(function(){
const snd=(k,o)=>{try{window.SND&&SND.play(k,o)}catch(_){}};
// ---------- 1. ENDLESS COMBO CHAINING ----------
// After a set combo fires, the link chain keeps going: the next presses are matched against every set combo's moves
// (without its opener), so CCCM -> M M -> T T ... chains combo into combo forever. Presses that fit no combo are freestyle
// (they still hit, the matcher just restarts from them). Re-opening within 2.2s also keeps the chain count.
const CHN={n:0,t:-9,show:0,best:0};window.CHN=CHN;
function chainUp(f,r){if(now-CHN.t<2.2&&CHN.n>0)CHN.n++;else CHN.n=1;CHN.t=now;
 if(CHN.n>=2){CHN.show=1.8;CHN.best=Math.max(CHN.best,CHN.n);extend();snd(CHN.n>=5?'combo_stinger_10':'combo_stinger_5',{v:.7,gap:.1});
  for(let i=0;i<10;i++){const a=Math.random()*6.283;sparks.push({x:p.x,y:p.y-100,vx:Math.cos(a)*380,vy:Math.sin(a)*380,l:.5,c:i%2?'#ffe14d':'#fff'})}}}
window.findRoute=function(f){const R=ROUTES[f]||[],s=LK.seq;if(LK.n<=1||LK.base==null||LK.base>s.length)LK.base=0;
 const tails=b=>b?R.map(r=>[r,r.k.length>3?r.k.slice(3):r.k]):R.map(r=>[r,r.k]);
 let b=LK.base,T=tails(b),seg=s.slice(b);
 if(!T.some(([,k])=>k.startsWith(seg))){ // freestyle press: restart matching from this letter
  b=Math.max(1,s.length-1);T=tails(b);seg=s.slice(b);if(!T.some(([,k])=>k.startsWith(seg)))b=s.length;LK.base=b}
 const hit=T.find(([,k])=>k===seg),r=hit&&hit[0];if(r)chainUp(f,r);return r||null};
const _dc=drawCombo;drawCombo=function(){_dc();
 if(CHN.show>0){const a=Math.min(1,CHN.show*2),pop=1+Math.max(0,CHN.show-1.5)*1.2;fancy('x'+CHN.n+' CHAIN!',VW-125,212,40*pop,-.08,1,a,CHN.n>=5?'#ff9a2e':'#ffe14d')}
 if(MOON.hint>0&&!MOON.on){ctx.save();ctx.globalAlpha=Math.min(1,MOON.hint*3)*(.75+.25*Math.sin(now*10));fancy('▼ + MEOW = 🌙',VW-130,CHN.show>0?252:212,26,-.06,1,1,'#bfe6ff');ctx.restore()}};
// ---------- 2. MOON LAUNCHER (any form): juggle an enemy, then ▼ + MEOW ----------
const MOON={on:false,t:0,d:null,hint:0,landed:false,stars:[]};window.MOON=MOON;
for(let i=0;i<140;i++)MOON.stars.push({x:Math.random(),y:Math.random(),s:.5+Math.random()*2,tw:Math.random()*6});
Object.assign(KB,{moon:[0,-1500,.8,.12],ladder:[0,-900,.6,.05],ladtop:[0,-600,.6,.06]});Object.assign(NAMES,{moon:'MOON LAUNCHER!',ladder:'SHADOW!',ladtop:'SHADOW!'});
CINE.push('moonl');
const busy=()=>CINE.includes(p.state)||['lkult','ufin','nmorph','respawn','ledge','bunny'].includes(p.state)||MOON.on;
const juggled=r=>dummies.filter(d=>d.alive&&!d.benched&&d.y<GROUND-90&&Math.abs(d.x-p.x)<(r||430)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0]||null;
function upA(){const L=[p.uf?UF[p.uf].pre+'_launch':null,p.xf===3?'kn_launch':null,p.xf===4?'pi_launch':null,p.sam?'s_launch':null,p.ninja?'n_rise5':null,'uppercut','jump'];return L.find(a=>a&&FR[a])||'idle'}
// v26 EPIC MOON HIT: build-up (time slows, aura gathers, camera pushes in) → huge uppercut impact frame (white flash, shockwaves, the screen cracks)
// → follow-cam up through the clouds, the atmosphere and the stars (generated/bg26/skystrip.jpg) → SLAM into the moon (generated/bg26/moon.jpg): dust plume, cartoon dent, dizzy stars.
const BG26=window.BG26||(window.BG26={});for(const [k,f] of [['moon','moon'],['sky','skystrip'],['city','city']])if(!BG26[k]){const im=new Image();im.src='assets/bg26/'+f+'.webp?v=26a';BG26[k]=im}
const MT={HIT:.6,UP:.85,LAND:2.95,END:4.7};
function chargeA(){const L=[p.uf?UF[p.uf].pre+'_charge':null,p.uf?UF[p.uf].pre+'_meowc':null,p.xf===3?'kn_charge':null,p.sam?'s_stance':null,'crouch'];return L.find(a=>a&&FR[a])||upA()}
function moonStart(g){LAD.on=false;MOON.on=true;MOON.t=0;MOON.d=g;MOON.landed=false;MOON.hit=false;MOON.x0=g.x;MOON.gy=g.y;p.state='moonl';p.t=0;setAnim(chargeA(),true);p.vx=0;p.vy=0;p.inv=Math.max(p.inv,6);
 LK.on=false;LK.seq='';LK.n=0;LK.buf=null;g.hp=Math.max(2,g.hp);g.vx=0;g.vy=0;g.cool=Math.max(g.cool||0,2);
 slowT=Math.max(slowT,.5);window.XCAM={z:1.3,b:.85,d:.45};MOON.cam=1;if(window.SND&&SND.play)try{SND.play('gf_aura',{v:.7,gap:.2})}catch(_){}}
window.moonStart=moonStart;
function moonHit(g){MOON.hit=true;setAnim(upA(),true);C.atk++;hitDummy(g,'moon',p.face);g.vx=0;g.vy=-2400;
 card('🌙 MOON LAUNCHER!','to the moon and back!','#bfe6ff');flashT=Math.max(flashT,.06);shake=Math.max(shake,28);hitstop=Math.max(hitstop,.12);MOON.imp=0;
 for(let i=0;i<3;i++)R9.rings.push({x:g.x,y:g.y-70,r:20+i*30,vr:1500+i*250,l:.7,col:i%2?'#bfe6ff':'#fff',w:14-i*3,f:0,face:0});
 if(window.SND&&SND.moon)SND.moon();for(let i=0;i<30;i++)sparks.push({x:g.x+(Math.random()-.5)*50,y:g.y-40,vx:(Math.random()-.5)*300,vy:200+Math.random()*400,l:.6,c:['#ffe14d','#ff9a2e','#fff'][i%3]})}
function moonTick(dt){const g=MOON.d,t=MOON.t+=dt;for(const k in P)delete P[k];p.vx=0;
 if(t<MT.UP){p.vy=0;p.hang=.3}else if(!p.ground)p.vy=Math.min(p.vy,250);
 if(t<MT.HIT){// gather: sparks spiral into Paddy, the enemy hangs in the air
  window.XCAM={z:1.3+t*.25,b:.85,d:.45};for(let i=0;i<2;i++){const a=Math.random()*6.283,r=150+Math.random()*80;sparks.push({x:p.x+Math.cos(a)*r,y:p.y-100+Math.sin(a)*r,vx:-Math.cos(a)*480,vy:-Math.sin(a)*480,l:.3,c:Math.random()<.5?'#bfe6ff':'#fff'})}shake=Math.max(shake,2+t*6)}
 else if(!MOON.hit&&g){moonHit(g);window.XCAM={z:.9,b:.6,d:.1}}
 if(MOON.imp!=null)MOON.imp+=dt;
 if(t>MT.UP&&MOON.cam){window.XCAM=null;MOON.cam=0}
 if(g){g.vx=0;g.fl=.6;g.cool=Math.max(g.cool||0,.5);if(t<MT.HIT){g.vy=0;g.y=MOON.gy+Math.sin(t*40)*2}else if(t<MT.UP){g.y-=2600*dt;g.vy=0}else{g.y=GROUND-1450;g.vy=0}
  if(t>=MT.LAND&&!MOON.landed){MOON.landed=true;g.hp=Math.max(1,g.hp-3);NAMES.moonland='MOON LANDING!';say('MOON LANDING!','#fff',true);try{SND.play('gf_crack',{v:1,gap:.2});SND.play('gf_boom',{v:.7,gap:.2})}catch(_){}}}
 if(t>=MT.END){MOON.on=false;p.state='normal';if(MOON.cam){window.XCAM=null;MOON.cam=0}if(g&&g.alive){g.x=clampX(MOON.x0);g.y=GROUND-1300;g.vy=300;g.fl=0}MOON.d=null;say('…and he\'s back!','#bfe6ff',true)}}
function cover(im,x,y,w,h){if(im&&im.complete&&im.naturalWidth){ctx.drawImage(im,x,y,w,h);return true}return false}
function mstar(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
function enemyImg(g,ex,ey,rot,s,sx,sy){const fr=FR[g.anim]||FR.r_idle,f=fr&&fr[Math.min(g.fi||0,fr.length-1)],im=f&&IMG[f.f];ctx.save();ctx.translate(ex,ey);ctx.rotate(rot);ctx.scale(s*(sx||1),s*(sy||1));
 if(im&&imgOK(im))ctx.drawImage(im,-f.w/2,-f.h/2);else{ctx.fillStyle='#c98a4a';ctx.beginPath();ctx.arc(0,0,40,0,6.283);ctx.fill()}ctx.restore()}
function moonDraw(){const t=MOON.t,g=MOON.d;ctx.save();ctx.setTransform(scale,0,0,scale,offX,offY);ctx.beginPath();ctx.rect(0,0,VW,VH);ctx.clip();
 // build-up: dark vignette + speed lines rushing in
 if(t<MT.HIT){const k=t/MT.HIT;const gr=ctx.createRadialGradient(VW/2,VH/2,VH*.25,VW/2,VH/2,VW*.7);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,`rgba(5,10,40,${.55*k})`);ctx.fillStyle=gr;ctx.fillRect(0,0,VW,VH);
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;for(let i=0;i<26;i++){const a=i/26*6.283+i,r0=VW*.75-((now*900+i*67)%(VW*.4));ctx.globalAlpha=.5*k;ctx.beginPath();ctx.moveTo(VW/2+Math.cos(a)*r0,VH/2+Math.sin(a)*r0);ctx.lineTo(VW/2+Math.cos(a)*(r0+60),VH/2+Math.sin(a)*(r0+60));ctx.stroke()}ctx.globalAlpha=1}
 const it=MOON.imp;
 // follow-cam: up through the clouds, the atmosphere and the stars
 if(t>=MT.UP&&t<MT.LAND+.05){const u=Math.min(1,(t-MT.UP)/(MT.LAND-MT.UP-.15)),e=u*u*(3-2*u),fi=Math.min(1,(t-MT.UP)/.12);ctx.globalAlpha=fi;
  const sky=BG26.sky,sw=VW,shh=sw*1280/720,y0=-(shh-VH)*(1-e);if(!cover(sky,0,y0,sw,shh)){ctx.fillStyle=mixC('#4aa8ff','#05061a',e);ctx.fillRect(0,0,VW,VH)}
  // clouds whoosh past at the start, star streaks near the top
  if(u<.45)for(let i=0;i<5;i++){const cx=((i*233)%VW),cy=((now*1600+i*190)%(VH+300))-150;ctx.globalAlpha=fi*.85*(1-u/.45);ctx.fillStyle='#fff';for(const [dx,dy,r] of [[0,0,46],[40,10,36],[-38,12,32],[10,-20,30]]){ctx.beginPath();ctx.arc(cx+dx,cy+dy,r,0,6.283);ctx.fill()}}
  ctx.globalAlpha=fi*.7;ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=0;i<22;i++){const x=(i*97)%VW,y=((now*2200+i*131)%(VH+200))-100;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+40+u*80);ctx.stroke()}
  if(g){const ex=VW/2+Math.sin(t*5)*14,ey=VH*.5+Math.sin(t*9)*6;for(let k=0;k<7;k++){ctx.globalAlpha=fi*(.7-k*.09);ctx.fillStyle=k%2?'#ffe14d':'#ff9a2e';ctx.beginPath();ctx.arc(ex+(Math.random()-.5)*16,ey+50+k*18,13-k,0,6.283);ctx.fill()}
   ctx.globalAlpha=fi;enemyImg(g,ex,ey,t*8,.55)}
  if(u<.3){ctx.globalAlpha=fi*(1-u/.3);fancy('TO THE MOON!',VW/2,VH*.2,52,-.05,1,fi*(1-u/.3),'#ffe14d')}ctx.globalAlpha=1}
 // the moon: they slam into the surface – dent, dust plume, rocks, dizzy stars, a paw flag
 if(t>=MT.LAND-.15){const fin=t>MT.END-.4?Math.max(0,1-(t-(MT.END-.4))/.4):1,fi=Math.min(1,(t-(MT.LAND-.15))/.12)*fin,lt=t-MT.LAND;ctx.globalAlpha=fi;
  const zz=1+Math.max(0,lt)*.03,mw=VW*zz,mh=mw*720/1280,sh=lt>0&&lt<.4?(Math.random()-.5)*18*(1-lt/.4):0;ctx.translate((VW-mw)/2+sh,(VH-mh)*.8+sh*.5);
  if(!cover(BG26.moon,0,0,mw,mh)){ctx.fillStyle='#05061a';ctx.fillRect(0,0,mw,mh);ctx.fillStyle='#cfcab8';ctx.fillRect(0,mh*.55,mw,mh*.45)}
  const ix=mw*.5,iy=mh*.74;
  if(lt>=0){// the cartoon dent
   const R=Math.min(1,lt/.08);ctx.fillStyle='rgba(60,58,70,.75)';ctx.beginPath();ctx.ellipse(ix,iy+6,120*R,26*R,0,0,6.283);ctx.fill();ctx.fillStyle='rgba(30,28,40,.7)';ctx.beginPath();ctx.ellipse(ix,iy+8,86*R,16*R,0,0,6.283);ctx.fill();
   ctx.strokeStyle='#f2efe4';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(ix,iy+2,126*R,30*R,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
   ctx.strokeStyle='#3a3842';ctx.lineWidth=3;for(let i=0;i<8;i++){const a=(i/8)*Math.PI+.1,x1=ix+Math.cos(a)*130,y1=iy+6+Math.sin(a)*24*0+(i%2?10:-4);ctx.beginPath();ctx.moveTo(ix+Math.cos(a)*120*R,iy+8);ctx.lineTo(x1+(i<4?-1:1)*30*R,y1+12);ctx.stroke()}}
  if(g){let ex=ix,ey,rot=0,sx=1,sy=1;if(lt<0){const k=1+lt/.15;ey=-80+k*(iy+80);rot=t*10;for(let i=0;i<5;i++){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ex-40+i*20,ey-60);ctx.lineTo(ex-40+i*20,ey-200);ctx.stroke()}}
   else{ey=iy-30;const b=lt<.5?0:Math.max(0,1-(lt-.5)*3);ey-=Math.abs(Math.sin((lt-.5)*12))*30*b;sx=lt<.15?1.3:1;sy=lt<.15?.7:1}
   enemyImg(g,ex,ey,rot,.7,sx,sy)}
  if(lt>=0){// dust plume + rocks + shock ring
   const u=Math.min(1,lt/1.4);for(let i=0;i<14;i++){const a=Math.PI+i/13*Math.PI,r=40+u*170;ctx.globalAlpha=fi*.85*(1-u);ctx.fillStyle=i%2?'#ece6d2':'#cfc8b2';ctx.beginPath();ctx.arc(ix+Math.cos(a)*r*1.4,iy+Math.sin(a)*r*.75-u*40,20+u*30,0,6.283);ctx.fill()}
   ctx.globalAlpha=fi*Math.max(0,1-lt/.6);ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(ix,iy+4,60+lt*900,12+lt*120,0,0,6.283);ctx.stroke();
   for(let i=0;i<10;i++){const a=-Math.PI*(.1+.8*(i/9)),v=260+((i*53)%5)*60,x=ix+Math.cos(a)*v*lt,y=iy+Math.sin(a)*v*lt+260*lt*lt;if(y>iy+40)continue;ctx.globalAlpha=fi;ctx.fillStyle='#9a958a';ctx.beginPath();ctx.arc(x,y,5+i%3*3,0,6.283);ctx.fill()}
   ctx.globalAlpha=fi;if(lt>.35){for(let i=0;i<3;i++){const a=now*5+i*2.094;mstar(ix+Math.cos(a)*50,iy-110+Math.sin(a)*12,12,'#ffe14d')}}
   if(lt>.6){const k=Math.min(1,(lt-.6)/.25),fx=ix+150,fy=iy;ctx.strokeStyle='#ddd';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx,fy-90*k);ctx.stroke();
    if(k>=1){const w=Math.sin(now*8)*4;ctx.fillStyle='#ffb03a';ctx.beginPath();ctx.moveTo(fx,fy-90);ctx.quadraticCurveTo(fx+30,fy-96+w,fx+60,fy-88);ctx.lineTo(fx+60,fy-56);ctx.quadraticCurveTo(fx+30,fy-64+w,fx,fy-58);ctx.closePath();ctx.fill();
     ctx.fillStyle='#fff';ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText('🐾',fx+30,fy-64)}}
   if(lt<1.3){const pop=lt<.1?lt/.1*1.2:1.2-Math.min(.2,(lt-.1)),bx=ix-200,by=iy-150;ctx.save();ctx.globalAlpha=fi;ctx.translate(bx,by);ctx.rotate(-.12);ctx.scale(pop,pop);ctx.fillStyle='#ffe14d';ctx.strokeStyle='#3a5ad0';ctx.lineWidth=5;ctx.beginPath();
    for(let i=0;i<20;i++){const a=i/20*6.283,rr=i%2?36:58;ctx.lineTo(Math.cos(a)*rr*1.35,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.stroke();ctx.font='32px Bangers, Impact, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#3a5ad0';ctx.fillText('THUD!',0,2);ctx.restore()}}
  ctx.setTransform(scale,0,0,scale,offX,offY);ctx.globalAlpha=1}
 // impact frame on the uppercut: white flash → ink lines → shockwave rings → the screen cracks
 if(it!=null&&it<1.1){ctx.save();const cx=VW/2,cy=VH*.42;
  if(it<.07){ctx.fillStyle='#fff';ctx.fillRect(0,0,VW,VH)}else if(it<.17){ctx.globalAlpha=.92;ctx.fillStyle='#fff';ctx.fillRect(0,0,VW,VH);ctx.strokeStyle='#111';ctx.lineWidth=3;for(let i=0;i<44;i++){const a=i/44*6.283,r1=70+(i%3)*24;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.lineTo(cx+Math.cos(a)*VW,cy+Math.sin(a)*VW);ctx.stroke()}}
  const a=Math.min(1,(1.1-it)/.4);ctx.globalAlpha=a*.9;ctx.strokeStyle='#fff';for(let k=0;k<3;k++){ctx.lineWidth=10-k*3;ctx.beginPath();ctx.arc(cx,cy,it*1100+k*80,0,6.283);ctx.stroke()}
  ctx.globalAlpha=a;ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=2.5;let s=13;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
  for(let i=0;i<12;i++){let an=i/12*6.283+rnd()*.4,x=cx,y=cy;ctx.beginPath();ctx.moveTo(x,y);for(let j=0;j<5;j++){an+=(rnd()-.5)*.6;const L=30+rnd()*80;x+=Math.cos(an)*L;y+=Math.sin(an)*L;ctx.lineTo(x,y)}ctx.stroke()}
  ctx.strokeStyle='rgba(20,20,40,.5)';ctx.lineWidth=1.2;for(let k=1;k<=2;k++){ctx.beginPath();for(let i=0;i<=12;i++){const an=i/12*6.283,r=40+k*50+rnd()*20;i?ctx.lineTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r):ctx.moveTo(cx+Math.cos(an)*r,cy+Math.sin(an)*r)}ctx.stroke()}
  if(it<.6){ctx.globalAlpha=1;fancy('MOON UPPERCUT!!',VW/2,VH*.18,54,-.06,1+Math.max(0,.3-it),1,'#bfe6ff')}ctx.restore()}
 ctx.restore()}
function mixC(a,b,u){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16),c=k=>Math.round(((pa>>k)&255)*(1-u)+((pb>>k)&255)*u);return `rgb(${c(16)},${c(8)},${c(0)})`}
// ---------- 3. SHADOW LADDER (Shade): launch him, then BLINK in time again and again ----------
const LAD={on:false,n:0,g:null,t:0,buf:false,side:1};window.LAD=LAD;
function ladStep(g){const X=UF[6],x0=p.x,y0=p.y;LAD.on=true;LAD.g=g;LAD.n++;LAD.t=0;LAD.buf=false;LAD.side=-LAD.side;p.state='shadowfin';p.t=0;
 const above=LAD.n%3===0;p.x=clampX(above?g.x-p.face*20:g.x+LAD.side*115);p.y=Math.min(GROUND,above?g.y-190:g.y-10);p.ground=false;p.vy=0;p.vx=0;p.face=g.x>=p.x?1:-1;if(above)p.face=LAD.side>0?-1:1;p.inv=Math.max(p.inv,.5);
 for(let k=1;k<=7;k++)ghosts.push({x:x0+(p.x-x0)*k/8,y:y0+(p.y-y0)*k/8,f:uFr('blink'),face:p.face,l:.12+k*.05,blue:1});
 for(let k=1;k<=3;k++)ghosts.push({x:p.x,y:p.y,f:uFr('h'+(1+k)),face:p.face,l:.5+k*.1,blue:1});
 if(typeof batPuff==='function')batPuff(p.x,p.y-80,8);puffShadow(x0,y0);puffShadow(p.x,p.y);
 setAnim(uA(above?'dive':['h1','h3','h5','h2','h6','h4'][LAD.n%6]),true);slash(above?'down':LAD.n%2?'rise':'cross',LAD.n%2?X.col:X.col2,{lvl:Math.min(9,4+LAD.n),scale:1.2+Math.min(.6,LAD.n*.05),col2:X.col2,dx:70});
 g.hp=Math.max(2,g.hp);C.atk++;hitDummy(g,above?'ladtop':'ladder',p.face);g.vx=0;g.vy=-(640+Math.min(12,LAD.n)*30);g.fl=.5;
 say(['SHADOW!','SHADOW!!','SHADOW!!!'][Math.min(2,(LAD.n-1)%3)]+'  x'+LAD.n,LAD.n%2?X.col:X.col2,true);snd('paddy_dash',{v:.6,r:1+Math.min(.5,LAD.n*.04)});snd('juggle_hit_'+(1+LAD.n%2),{v:.7});shake=Math.max(shake,6+Math.min(10,LAD.n))}
function ladEnd(){if(!LAD.on)return;LAD.on=false;if(p.state==='shadowfin')p.state='normal';if(LAD.n>=3)card('SHADOW LADDER x'+LAD.n+'!','BLINK · BLINK · BLINK …',UF[6].col);LAD.n=0;LAD.g=null}
function ladTick(dt){const g=LAD.g;LAD.t+=dt;p.vy=0;p.vx=0;p.hang=Math.max(p.hang||0,.1);
 if(!g||!g.alive){ladEnd();return}
 if(g.y>GROUND-60&&LAD.t>.2){ladEnd();return}
 const go=P.blink||P.attack||P.tail;if(P.special){for(const k in P)delete P[k];moonStart(g);return}
 if(go){for(const k in P)delete P[k];acted=true;if(LAD.t<.1)LAD.buf=true;else{ladStep(g);return}}
 if(LAD.buf&&LAD.t>=.1){ladStep(g);return}
 if(LAD.t>.72)ladEnd()}
// ---------- per-frame hook (runs before the form state machines) ----------
const _pre=r9Pre;r9Pre=function(dt){
 if(CHN.show>0)CHN.show-=dt;if(now-CHN.t>2.2&&!LK.on)CHN.n=0;
 const jg=!busy()?juggled():null;MOON.hint=jg&&jg.y<GROUND-140?.4:Math.max(0,MOON.hint-dt);
 if(MOON.on){moonTick(dt);_pre(dt);return}
 if(LAD.on&&p.state==='shadowfin'){ladTick(dt);if(MOON.on){_pre(dt);return}}else if(LAD.on)ladEnd();
 _pre(dt);
 if(MOON.on&&MOON.d){const g=MOON.d;if(MOON.t>=MT.UP){g.y=GROUND-1450;g.vy=0}}
 if(LAD.on&&p.state==='shadowfin'){p.vy=0}};
// triggers run first thing in the frame, before any form reads the Meow / Blink press
const _nu=nUpdate;nUpdate=function(dt){
 if(!MOON.on&&!busy()){const jg=juggled();
  if(P.special&&K.down&&jg&&!LAD.on){delete P.special;acted=true;moonStart(jg)}
  else if(p.uf===6&&P.blink&&!LAD.on&&p.state!=='lk'){const g=juggled(560);if(g){delete P.blink;acted=true;ladStep(g)}}}
 _nu(dt)};
const _draw=draw;draw=function(){_draw();if(MOON.on)moonDraw()};
// ---------- moves list ----------
const _bl=buildList;buildList=function(){_bl();const el=document.getElementById('clist');if(!el)return;const h3=el.querySelector('h3');if(!h3)return;
 h3.insertAdjacentHTML('afterend',`<div id="specials" style="background:linear-gradient(135deg,#1a2350,#2a1550);border:2px solid #bfe6ff;border-radius:12px;padding:6px 10px;margin:6px 0 10px">
 <h3 style="color:#bfe6ff;margin:2px 0">🌙 SPECIAL FINISHERS</h3>
 <p class="tip" style="margin:3px 0"><b>🌙 MOON LAUNCHER</b> (every form) – juggle an enemy up in the air, then hold <b>▼</b> and press <b>MEOW</b>. He rockets into space… and lands on the moon! 🚩✨</p>
 <p class="tip" style="margin:3px 0"><b>🪜 SHADOW LADDER</b> (Shade) – launch him (▼ + Claw), then tap <b>BLINK</b> (or Claw) on the beat: shadow… shadow… SHADOW! Each step teleports beside or above him and knocks him higher. Wait too long and it ends. Finish with <b>MEOW</b> for a Moon Launcher!</p>
 <p class="tip" style="margin:3px 0"><b>🔗 ENDLESS CHAINS</b> – after a set combo lands, keep pressing on the beat: the next combo's moves (without its opener) chain straight in – e.g. C C C M, then M M, then T T… Every combo in a row adds to the <b>x2 · x3 CHAIN!</b> counter. Freestyle presses in between are fine.</p></div>`)};
buildList();
})();
