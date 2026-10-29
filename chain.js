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
function moonStart(g){LAD.on=false;MOON.on=true;MOON.t=0;MOON.d=g;MOON.landed=false;MOON.x0=g.x;p.state='moonl';p.t=0;setAnim(upA(),true);p.vx=0;p.vy=-200;p.inv=Math.max(p.inv,5);
 LK.on=false;LK.seq='';LK.n=0;LK.buf=null;g.hp=Math.max(2,g.hp);C.atk++;hitDummy(g,'moon',p.face);g.vx=0;g.vy=-1800;
 card('🌙 MOON LAUNCHER!','to the moon and back!','#bfe6ff');slowT=Math.max(slowT,.15);flashT=Math.max(flashT,.12);shake=Math.max(shake,16);
 if(window.SND&&SND.moon)SND.moon();for(let i=0;i<30;i++)sparks.push({x:g.x+(Math.random()-.5)*50,y:g.y-40,vx:(Math.random()-.5)*300,vy:200+Math.random()*400,l:.6,c:['#ffe14d','#ff9a2e','#fff'][i%3]})}
window.moonStart=moonStart;
function moonTick(dt){const g=MOON.d,t=MOON.t+=dt;for(const k in P)delete P[k];p.vx=0;if(!p.ground)p.vy=Math.min(p.vy,250);
 if(g){g.vx=0;g.fl=.6;g.cool=Math.max(g.cool||0,.5);if(t<.45){g.y-=2400*dt;g.vy=0;if(Math.random()<.9)sparks.push({x:g.x+(Math.random()-.5)*30,y:g.y+10,vx:(Math.random()-.5)*80,vy:300,l:.5,c:Math.random()<.5?'#ff9a2e':'#ffe14d'})}
  else{g.y=GROUND-1450;g.vy=0}
  if(t>=2.6&&!MOON.landed){MOON.landed=true;g.hp=Math.max(1,g.hp-3);NAMES.moonland='MOON LANDING!';say('MOON LANDING!','#fff',true)}}
 if(t>=4.2){MOON.on=false;p.state='normal';if(g&&g.alive){g.x=clampX(MOON.x0);g.y=GROUND-1300;g.vy=300;g.fl=0}MOON.d=null;say('…and he\'s back!','#bfe6ff',true)}}
// overlay: the camera "follows" him up through the sky into space, then the moon landing with a flag + star twinkles
function moonDraw(){const t=MOON.t;if(t<.4)return;const g=MOON.d;ctx.save();ctx.setTransform(scale,0,0,scale,offX,offY);ctx.beginPath();ctx.rect(0,0,VW,VH);ctx.clip();
 const fin=t>3.8?Math.max(0,1-(t-3.8)/.4):1,fi=Math.min(1,(t-.4)/.15)*fin;ctx.globalAlpha=fi;
 const u=Math.min(1,(t-.4)/1.8),top=mixC('#2a3f8f','#03040c',u),bot=mixC('#7a6ad8','#0e1236',u);const gr=ctx.createLinearGradient(0,0,0,VH);gr.addColorStop(0,top);gr.addColorStop(1,bot);ctx.fillStyle=gr;ctx.fillRect(-10,-10,VW+20,VH+20);
 const sp=t<2.4?(t-.4)*(t-.4)*900:0;ctx.fillStyle='#fff';for(const s of MOON.stars){const y=((s.y*VH+sp*s.s*.5)%VH+VH)%VH;ctx.globalAlpha=fi*Math.min(1,u*1.6+.2)*(.6+.4*Math.sin(now*4+s.tw));
  if(t<2.4&&s.s>1.6){ctx.fillRect(s.x*VW,y-s.s*6,s.s,s.s*12)}else ctx.fillRect(s.x*VW,y,s.s,s.s)}
 ctx.globalAlpha=fi;
 if(t<1.1){const k=(t-.4)/.7;ctx.fillStyle='#1a1530';ctx.beginPath();ctx.moveTo(0,VH);for(let i=0;i<=12;i++){const x=i/12*VW,h=40+((i*53)%5)*18;ctx.lineTo(x,VH-h+k*VH*1.2);ctx.lineTo(x+VW/12,VH-h+k*VH*1.2)}ctx.lineTo(VW,VH);ctx.fill()}
 if(t<2.4){ctx.save();ctx.translate(VW*.84,VH*.16);ctx.globalAlpha=fi*.9;ctx.fillStyle='#f4f1e0';ctx.beginPath();ctx.arc(0,0,26+u*40,0,6.283);ctx.fill();ctx.restore()}
 // moon surface rises in
 const mr=t<2.2?0:Math.min(1,(t-2.2)/.35),my=VH+200-mr*330;if(mr>0){ctx.fillStyle='#d9d4c0';ctx.beginPath();ctx.ellipse(VW/2,my+520,VW*.9,560,0,0,6.283);ctx.fill();ctx.fillStyle='#bdb6a0';
  for(const [dx,dy,r] of [[-.3,40,40],[.12,22,26],[.32,60,34],[-.08,90,22],[.42,20,16],[-.42,70,18]]){ctx.beginPath();ctx.ellipse(VW/2+dx*VW,my+dy,r*1.6,r*.5,0,0,6.283);ctx.fill()}
  ctx.fillStyle='#4b6cff';ctx.beginPath();ctx.arc(VW*.15,VH*.2,30,0,6.283);ctx.fill();ctx.fillStyle='#3fd38a';ctx.beginPath();ctx.arc(VW*.15-8,VH*.2-6,13,0,6.283);ctx.arc(VW*.15+10,VH*.2+8,9,0,6.283);ctx.fill()}
 // the enemy: flies up the middle spinning, then drops onto the moon
 if(g){let ex=VW/2,ey,rot;if(t<2.4){ey=VH*.95-Math.min(1,(t-.4)/.6)*VH*.45+Math.sin(t*6)*8;rot=t*7}else{const k=Math.min(1,(t-2.4)/.2);ey=VH*.3+k*(my-VH*.3-6);rot=(1-k)*t*7}
  if(t>=2.6){const b=Math.max(0,1-(t-2.6)*4);ey-=Math.abs(Math.sin((t-2.6)*14))*20*b;rot=0}
  if(t<2.4)for(let k=0;k<6;k++){ctx.globalAlpha=fi*(.6-k*.09);ctx.fillStyle=k%2?'#ffe14d':'#ff9a2e';ctx.beginPath();ctx.arc(ex+(Math.random()-.5)*14,ey+20+k*16,10-k,0,6.283);ctx.fill()}
  ctx.globalAlpha=fi;const fr=FR[g.anim]||FR.r_idle,f=fr&&fr[Math.min(g.fi||0,fr.length-1)],im=f&&IMG[f.f];
  ctx.save();ctx.translate(ex,ey);ctx.rotate(rot);const s=Math.min(.55,120/Math.max(80,(f&&f.h)||150));if(im&&imgOK(im)){ctx.scale(s,s);ctx.drawImage(im,-f.w/2,-f.h)}else{ctx.fillStyle='#c98a4a';ctx.beginPath();ctx.arc(0,-40,40,0,6.283);ctx.fill()}ctx.restore();
  if(t>=2.6){const k=Math.min(1,(t-2.6)/.25);// puff + flag + twinkles
   for(let i=0;i<8;i++){ctx.globalAlpha=fi*Math.max(0,.6-(t-2.6));ctx.fillStyle='#eee8d0';ctx.beginPath();ctx.arc(ex+(i-3.5)*22*(1+(t-2.6)*2),my-4,14,0,6.283);ctx.fill()}
   ctx.globalAlpha=fi;const fx=ex+95,fy=my-6;ctx.strokeStyle='#ddd';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx,fy-90*k);ctx.stroke();
   if(k>=1){const w=Math.sin(now*8)*4;ctx.fillStyle='#ffb03a';ctx.beginPath();ctx.moveTo(fx,fy-90);ctx.quadraticCurveTo(fx+30,fy-96+w,fx+60,fy-88);ctx.lineTo(fx+60,fy-56);ctx.quadraticCurveTo(fx+30,fy-64+w,fx,fy-58);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText('🐾',fx+30,fy-64)}
   for(let i=0;i<6;i++){const tt=(t-2.7-i*.12);if(tt<0)continue;const a=Math.max(0,1-tt*1.4),sx=ex+[-120,140,-60,90,-160,40][i],sy=my-[120,150,190,90,60,210][i],R=(8+i%3*5)*(.5+Math.sin(tt*9)*.5+.5);
    ctx.globalAlpha=fi*a;ctx.fillStyle=i%2?'#ffe14d':'#fff';ctx.beginPath();ctx.moveTo(sx,sy-R*2);ctx.lineTo(sx+R*.4,sy-R*.4);ctx.lineTo(sx+R*2,sy);ctx.lineTo(sx+R*.4,sy+R*.4);ctx.lineTo(sx,sy+R*2);ctx.lineTo(sx-R*.4,sy+R*.4);ctx.lineTo(sx-R*2,sy);ctx.lineTo(sx-R*.4,sy-R*.4);ctx.closePath();ctx.fill()}
   ctx.globalAlpha=fi;fancy('TO THE MOON!',VW/2,VH*.2,46,-.05,1,fi,'#ffe14d')}}
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
 if(MOON.on&&MOON.d){const g=MOON.d;if(MOON.t>=.45){g.y=GROUND-1450;g.vy=0}}
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
