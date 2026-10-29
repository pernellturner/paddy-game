// v20g – DARK SIDE goes MYTHIC: new armour frames (one red saber), a red/black aura, mythic super armour for every Mythic,
// and 7 new chainable FORCE COMBOS. Family-friendly: glowing force effects, cartoon bonks, nobody gets hurt for real.
(function(){
if(typeof UF==='undefined'||typeof nUpdate!=='function')return;
const U15=15,COL='#ff3040',COL2='#c9a0ff';
// ---------- frames: fix the odd frames, add the new force poses ----------
const NA={h2:['mds_m_h2',[0,1,2,2],16],blink:['mds_m_blink',[0,1,2,0],14],ultA:['mds_m_ult',[1,2],8,1],ultB:['mds_m_ult',[2]],ultE:['mds_m_ult',[3]],
 fzchoke:['mds_m_choke',null,8],fzslam:['mds_m_slam',null,12],fzvort:['mds_m_vortex',null,10,1],fzthrow:['mds_m_throw',null,12],fzcatch:['mds_m_catch',null,10],
 fzwall:['mds_m_wall',null,11],fzrip:['mds_m_rip',null,10],fzpj:['mds_m_push',[1,2,3],16],fzchain:['mds_m_lightning',null,14,1]};
for(const k in NA){const v=NA[k];A['mds_'+k]=[v[0],v[1]||null,v[2]||12,v[3]||0]}
let filled=0;function fill(){if(filled||typeof F==='undefined'||!F||!F.mds_m_choke)return;
 for(const k in NA){const [s,idx]=NA[k];if(F[s])FR['mds_'+k]=idx?idx.filter(i=>i<F[s].length).map(i=>F[s][i]):F[s]}filled=1}
fill();
Object.assign(KB,{fzslam:[60,-420,.45,.12],fzburst:[640,-680,.4,.1],fzwall:[-260,-640,.45,.13],fzpj:[260,-560,.3,.05],fzrip:[0,-300,.3,.05],fzpull:[-300,-200,.3,.04]});
Object.assign(NAMES,{fzslam:'CHOKE SLAM!',fzburst:'VORTEX BURST!',fzwall:'WALL CRUSH!',fzpj:'PUSH JUGGLE!',fzrip:'FORCE RIP!',fzpull:'PULLED BACK!'});
// ---------- MYTHIC SUPER ARMOUR (every Mythic form, Dark Side included) ----------
const MYT=u=>u>=7;
if(typeof dogStrike==='function'){const _ds=dogStrike;dogStrike=function(d,dmg,kind){
 if(!MYT(p.uf)||p.state==='respawn')return _ds.apply(this,arguments);
 if(p.inv>0||(typeof CINE!=='undefined'&&CINE.includes(p.state))||['nmorph','lk'].includes(p.state))return false;
 if(kind==='bark'){say('UNSHAKEN!',UF[p.uf].col||'#fff');return true}
 p.hp=Math.max(0,p.hp-dmg*.15);p.inv=.6;if(p.hp<=.01){p.hp=3;p.wall=false;loseLife();return true}
 const c=UF[p.uf].col||'#fff';spark(p.x,p.y-90,10,[c,'#fff'],260);if(typeof R9!=='undefined')R9.rings.push({x:p.x,y:p.y-90,r:30,vr:700,l:.5,col:c,col2:'#fff',w:8,f:5,face:0});
 if(Math.random()<.5)say('SUPER ARMOUR!',c);return true}}
if(typeof hurtMe==='function'){const _hm=hurtMe;hurtMe=function(){if(MYT(p.uf)){p.hp=Math.max(.05,p.hp-.15);p.inv=.6;say('SUPER ARMOUR!',UF[p.uf].col||'#fff');return}return _hm.apply(this,arguments)}}
window.MYTHIC_ARMOUR={dmg:.15,flinch:false};
// ---------- the force combos ----------
const Z={t:0,n:0,tg:null,L:[],segs:[],wallX:null,ball:null};window.FZ=Z;
const FS=['fzchoke','fzslam','fzvort','fzthrow','fzcatch','fzwall','fzrip','fzpj','fzchain'];
const NO=['lkult','ufin','nmorph','respawn','ledge','bunny','lk','umeowc','umeow','hurt','ko','moon','moonl','shadowfin','victory','stun'];
const free=()=>p.uf===U15&&!(typeof CINE!=='undefined'&&CINE.includes(p.state))&&!NO.includes(p.state)&&!(window.MOON&&MOON.on)&&(!FS.includes(p.state)||Z.t>.22);
const near=(r,f)=>dummies.filter(d=>d.alive&&!d.benched&&Math.abs(d.x-p.x)<r&&(!f||f(d))).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
const airb=d=>d.y<GROUND-60;
const ring=(x,y,big,c)=>R9.rings.push({x,y,r:18,vr:big?1250:850,l:.8,col:c||COL,col2:COL2,w:big?14:9,f:19,face:0});
const chain=()=>{if(typeof CHN==='undefined')return;CHN.n=(now-CHN.t<2.2&&CHN.n>0)?CHN.n+1:1;CHN.t=now;if(CHN.n>1){CHN.show=1.6;CHN.best=Math.max(CHN.best||0,CHN.n)}};
const snd=(k,v)=>{try{SND.play(k,{v:v||.8,gap:.1})}catch(_){}};
function go(st,nm){fill();act(st,'mds_'+st,{say:nm,c:COL2});Z.t=0;Z.n=0;C.atk=(C.atk||0)+1;extend();chain();if(typeof M14!=='undefined')M14.dark=Math.max(M14.dark||0,.7)}
function trig(){const air=!p.ground;
 if(P.tail){
  if(K.up){const g=near(700)[0];if(g){delete P.tail;delete P.jump;Z.tg=g;go('fzchoke','FORCE CHOKE SLAM!');snd('force_push');return}}
  if(K.down&&air){const L=near(760);if(L.length){delete P.tail;Z.L=L.slice(0,4);go('fzrip','FORCE RIP!');snd('force_lightning',.6);return}}
  if(K.down&&!air){delete P.tail;Z.L=near(680).slice(0,5);Z.ball={x:clampX0(p.x+p.face*210),y:GROUND-190,a:0};go('fzvort','FORCE VORTEX!');snd('force_push');return}
  if(air){const g=near(520,airb)[0];if(g){delete P.tail;Z.tg=g;go('fzpj','PUSH JUGGLE!');snd('force_push',.7);return}}}
 if(P.special&&K.up){delete P.special;delete P.jump;go('fzthrow','SABER THROW!');return}
 if(P.blink){
  if(K.up){delete P.blink;delete P.jump;go('fzchain','LIGHTNING CHAIN!');Z.L=[];Z.segs=[];snd('force_lightning');return}
  if(K.down&&!air){delete P.blink;go('fzwall','FORCE WALL CRUSH!');Z.wallX=null;return}}}
const clampX0=x=>Math.max(LW+60,Math.min(WALL_X-60,x));
function end(){p.state='normal';p.t=0;setAnim(p.ground?uA('idle'):uA('fall'),true)}
function tick(dt){const st=p.state,t=Z.t;Z.t+=dt;const f=p.face,at=T=>t<T&&Z.t>=T;
 switch(st){
 case 'fzchoke':{const d=Z.tg;p.vx*=.8;if(!p.ground)p.vy=Math.min(p.vy,20);if(!d||!d.alive){end();break}
  if(t<.7){const ty=GROUND-280;d.x+=((p.x+f*190)-d.x)*Math.min(1,dt*4);d.y+=(ty-d.y)*Math.min(1,dt*5);d.vx=0;d.vy=0;d.fl=.4;d.cool=Math.max(d.cool||0,.6);
   if(Math.random()<.5)sparks.push({x:d.x+(Math.random()-.5)*80,y:d.y-40-Math.random()*110,vx:0,vy:-70,l:.35,c:Math.random()<.5?COL:COL2})}
  if(at(.7)){setAnim('mds_fzslam',true);say('…SLAM!',COL,true)}
  if(at(.82)){d.y=GROUND-4;d.vy=0;mHit(d,'fzslam',f);ring(d.x,GROUND-30,1);shake=Math.max(shake,18);if(R9.cracks&&typeof mkCrack==='function')R9.cracks.push(mkCrack(d.x,9));snd('ground_slam')}
  if(t>1.15)end();break}
 case 'fzvort':{p.vx*=.8;const B=Z.ball;B.a+=dt*9;
  Z.L.forEach((d,i)=>{if(!d.alive)return;const a=B.a+i*(6.283/Math.max(1,Z.L.length)),r=Math.max(40,150-t*90);const tx=B.x+Math.cos(a)*r,ty=B.y+60+Math.sin(a)*r*.6;
   d.x+=(tx-d.x)*Math.min(1,dt*7);d.y+=(ty-d.y)*Math.min(1,dt*7);d.vx=0;d.vy=0;d.fl=.4;d.cool=Math.max(d.cool||0,.5)});
  Z.n+=dt;if(Z.n>.22){Z.n=0;for(const d of Z.L)if(d.alive)mHit(d,'dgrip',f,true),d.vx=0,d.vy=0}
  if(Math.random()<.8)sparks.push({x:B.x+(Math.random()-.5)*200,y:B.y+(Math.random()-.5)*140,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,l:.3,c:Math.random()<.5?COL:COL2});
  if(t>1.25){for(const d of Z.L)if(d.alive)mHit(d,'fzburst',Math.sign(d.x-B.x)||f);ring(B.x,B.y,1);ring(B.x,B.y,1,COL2);shake=Math.max(shake,16);say('VORTEX BURST!',COL,true);snd('force_push');Z.ball=null;end()}break}
 case 'fzthrow':p.vx*=.8;if(at(.18)){mP({k:'dsab',vx:f*1200,y:p.y-105,l:1.7,s:1.15,kb:'dblade',tick:0,cos:0,fzpull:1});snd('blade_boomerang')}
  if(t>.5){p.state='fzcatch';Z.t=0;setAnim('mds_fzcatch',true)}break;
 case 'fzcatch':p.vx*=.8;{let back=false;for(const o of U.proj)if(o.k==='dsab'&&o.fzpull)back=true;if(!back&&!Z.n){Z.n=1;say('…AND PULL IT BACK!',COL2)}
  if((t>1.4)||(Z.n&&t>.35))end()}break;
 case 'fzwall':p.vx*=.8;if(t>.2){if(Z.wallX===null){Z.wallX=p.x+f*90;Z.L=near(900,d=>(d.x-p.x)*f>-20);snd('force_push')}
   const lim=f>0?WALL_X-40:LW+40;Z.wallX+=f*1500*dt;if((Z.wallX-lim)*f>=0)Z.wallX=lim;
   for(const d of Z.L)if(d.alive&&(Z.wallX-d.x)*f>-50){d.x=Z.wallX+f*30;d.vx=0;d.vy=Math.min(d.vy,0);d.fl=.3}
   if(Z.wallX===lim&&!Z.n){Z.n=1;for(const d of Z.L)if(d.alive&&Math.abs(d.x-lim)<140)mHit(d,'fzwall',f);ring(lim,GROUND-120,1);shake=Math.max(shake,16);say('WALL CRUSH!',COL,true);snd('ground_slam')}}
  if(t>.95){Z.wallX=null;end()}break;
 case 'fzpj':{const d=Z.tg;p.vy=Math.min(p.vy,-40);p.vx*=.85;if(at(.08)&&d&&d.alive){mHit(d,'fzpj',Math.sign(d.x-p.x)||f);ring(d.x,d.y-100,0,COL2);for(let k=0;k<10;k++)sparks.push({x:p.x+f*90,y:p.y-110,vx:f*(400+Math.random()*400),vy:-Math.random()*300,l:.3,c:k%2?COL:COL2})}
  if(t>.36)end();break}
 case 'fzrip':{p.vy=Math.min(p.vy,10);p.vx*=.8;const cx=p.x+f*120,cy=p.y-200;
  if(t<.45)for(const d of Z.L){if(!d.alive)continue;d.x+=(cx-d.x)*Math.min(1,dt*6);d.y+=(Math.min(cy,GROUND-120)-d.y)*Math.min(1,dt*6);d.vx=0;d.vy=0;d.fl=.4}
  if(at(.3)){for(const d of Z.L)if(d.alive)mHit(d,'fzrip',f,true)}
  if(at(.5)){const L=Z.L.filter(d=>d.alive);const g=L[0];ring(cx,cy,1);shake=Math.max(shake,14);
   if(g&&typeof window.moonStart==='function'&&!(window.MOON&&MOON.on)){for(const d of L.slice(1))mHit(d,'dbig',f);say('INTO THE MOON!',COL2,true);p.state='normal';window.moonStart(g);return}
   for(const d of L)mHit(d,'dbig',f)}
  if(t>.8)end();break}
 case 'fzchain':{p.vx*=.8;Z.n-=dt;
  if(Z.n<=0&&Z.L.length<6){Z.n=.11;const from=Z.L.length?Z.L[Z.L.length-1]:null;const ox=from?from.x:p.x+f*85,oy=from?from.y-(from.h||150)*.55:p.y-118;
   const nx=dummies.filter(d=>d.alive&&!Z.L.includes(d)&&Math.hypot(d.x-ox,(d.y-(d.h||150)*.55)-oy)<(from?480:700)).sort((a,b)=>Math.abs(a.x-ox)-Math.abs(b.x-ox))[0];
   if(nx){Z.L.push(nx);Z.segs.push({x0:ox,y0:oy,x1:nx.x,y1:nx.y-(nx.h||150)*.55,l:.35});mHit(nx,'dlight',Math.sign(nx.x-ox)||f);nx.vx*=.2;if(Z.L.length>1)say('×'+Z.L.length+' CHAIN!',COL2)}
   else if(!Z.L.length){Z.segs.push({x0:ox,y0:oy,x1:ox+f*300,y1:oy+(Math.random()-.5)*80,l:.25});Z.L.push(null)}else Z.L.push(null)}
  if(t>.85)end();break}
 }}
const _nu=nUpdate;nUpdate=function(dt){if(p.uf===U15){fill();if(free())trig();if(FS.includes(p.state))tick(dt)}_nu(dt)};
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);fill();
 for(const s of Z.segs)s.l-=dt;Z.segs=Z.segs.filter(s=>s.l>0);
 // the thrown saber drags whoever it hits back to Paddy
 for(const o of U.proj){if(o.k!=='dsab'||!o.fzpull||!(o.age>.42))continue;for(const d of dummies){if(!d.alive||Math.hypot(d.x-o.x,(d.y-80)-o.y)>110)continue;d.x+=(o.x-d.x)*Math.min(1,dt*10);d.vx=0;d.vy=Math.min(d.vy,0);d.fl=.3;if(!o.pulled)o.pulled=new Set();if(!o.pulled.has(d)){o.pulled.add(d);mHit(d,'fzpull',Math.sign(p.x-d.x)||-p.face,true)}}}
 // MYTHIC AURA: dark-red embers + black wisps rising around Dark Side Paddy
 if(p.uf===U15&&Math.random()<dt*22){const r=Math.random();sparks.push({x:p.x+(Math.random()-.5)*110,y:p.y-10-Math.random()*150,vx:(Math.random()-.5)*50,vy:-70-Math.random()*90,l:.5+Math.random()*.4,c:r<.45?COL:r<.75?'#1a0008':r<.9?'#ff8090':COL2})}};
function zz(x0,y0,x1,y1,w){const n=8,pts=[[x0,y0]];for(let k=1;k<n;k++){const t=k/n;pts.push([x0+(x1-x0)*t+(Math.random()-.5)*26*w,y0+(y1-y0)*t+(Math.random()-.5)*30*w])}pts.push([x1,y1]);
 for(const [lw,c,al] of [[15*w,'#8a5cff',.3],[6*w,COL2,.85],[2.4*w,'#fff',1]]){ctx.globalAlpha=al;ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}}
// aura behind Paddy (drawn right after the dummies, before Paddy)
const _dd=drawDummies;drawDummies=function(){_dd();if(p.uf!==U15||p.dead)return;const x=p.x,y=p.y-95,pu=.75+.25*Math.sin(now*5);ctx.save();
 const g=ctx.createRadialGradient(x,y,20,x,y,150*pu);g.addColorStop(0,'rgba(255,40,64,.38)');g.addColorStop(.55,'rgba(120,0,24,.22)');g.addColorStop(1,'rgba(10,0,4,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,120*pu,150*pu,0,0,6.283);ctx.fill();
 ctx.globalCompositeOperation='lighter';ctx.strokeStyle=COL;ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.globalAlpha=.25-k*.06;ctx.beginPath();ctx.ellipse(x,p.y-6,70+k*18+Math.sin(now*4+k)*6,12+k*3,0,0,6.283);ctx.stroke()}ctx.restore()};
const _fx=drawFx;drawFx=function(){_fx();if(!Z.segs.length&&!Z.ball&&Z.wallX===null&&p.state!=='fzchoke')return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
 for(const s of Z.segs)zz(s.x0,s.y0,s.x1,s.y1,1.1);
 if(Z.ball){const B=Z.ball;for(let k=0;k<4;k++){ctx.globalAlpha=.5-k*.08;ctx.strokeStyle=k%2?COL2:COL;ctx.lineWidth=8-k;ctx.beginPath();ctx.ellipse(B.x,B.y+60,150-k*24,90-k*14,0,B.a+k,B.a+k+4.4);ctx.stroke()}
  const g=ctx.createRadialGradient(B.x,B.y+60,4,B.x,B.y+60,90);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(160,60,255,0)');ctx.globalAlpha=.7;ctx.fillStyle=g;ctx.beginPath();ctx.arc(B.x,B.y+60,90,0,6.283);ctx.fill()}
 if(Z.wallX!==null){const x=Z.wallX,gr=ctx.createLinearGradient(x-30,0,x+30,0);gr.addColorStop(0,'rgba(255,48,64,0)');gr.addColorStop(.5,'rgba(255,90,120,.75)');gr.addColorStop(1,'rgba(201,160,255,0)');ctx.globalAlpha=1;ctx.fillStyle=gr;ctx.fillRect(x-30,GROUND-300,60,300);ctx.strokeStyle='#fff';ctx.globalAlpha=.6;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,GROUND-300);ctx.lineTo(x,GROUND);ctx.stroke()}
 if(p.state==='fzchoke'&&Z.tg&&Z.tg.alive&&Z.t<.75){const d=Z.tg,cy=d.y-(d.h||150)*.55,a=now*5;for(let k=0;k<3;k++){ctx.globalAlpha=.55-k*.12;ctx.strokeStyle=k%2?COL2:COL;ctx.lineWidth=7-k*1.5;ctx.beginPath();ctx.ellipse(d.x,cy,70+k*16,(d.h||150)*.5+k*10,0,a+k*2,a+k*2+4.2);ctx.stroke()}}
 ctx.restore()};
// ---------- moves list ----------
const _bl=buildList;buildList=function(){_bl();const el=document.getElementById('clist');if(!el)return;const h3=el.querySelector('h3');if(!h3)return;
 h3.insertAdjacentHTML('afterend',`<div id="fzlist" style="background:linear-gradient(135deg,#2a0610,#14061e);border:2px solid #ff3040;border-radius:12px;padding:6px 10px;margin:6px 0 10px;box-shadow:0 0 16px #ff304055">
 <h3 style="color:#ff6070;margin:2px 0">🌑 DARK SIDE · FORCE COMBOS</h3>
 <p class="tip" style="margin:3px 0"><b>FORCE CHOKE SLAM</b> – <b>▲+TAIL</b>: lift him up… and slam! · <b>FORCE VORTEX</b> – <b>▼+TAIL</b>: pull the crowd into a spinning ball, then burst</p>
 <p class="tip" style="margin:3px 0"><b>SABER THROW → PULL BACK</b> – <b>▲+MEOW</b>: the saber drags enemies back to you · <b>FORCE WALL CRUSH</b> – <b>▼+BLINK</b>: an invisible wall shoves them into the side wall</p>
 <p class="tip" style="margin:3px 0"><b>PUSH JUGGLE</b> – <b>TAIL</b> in the air near a launched enemy (keep tapping!) · <b>LIGHTNING CHAIN</b> – <b>▲+BLINK</b>: lightning jumps enemy to enemy · <b>FORCE RIP</b> – <b>▼+TAIL</b> in the air: rip them out of the sky and fling one to the MOON 🌙</p>
 <p class="tip" style="margin:3px 0">Every force combo chains – mix them with saber hits for a big <b>CHAIN</b>. Mythic forms wear <b>SUPER ARMOUR</b>: hits barely scratch them and never knock them over.</p></div>`)};
buildList();
window.FORCE20G=true;})();
