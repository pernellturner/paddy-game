// ===================== DARK SIDE PADDY (v20) – Mythic form u=15 (FORM 19) =====================
// Force moves: Tail = FORCE PUSH -> FORCE PULL -> FORCE GRIP & LIFT, Meow = SABER BOOMERANG / FORCE LIGHTNING / DARK STORM,
// Blink = SHADOW STEP, chain = red saber, finisher + ultimate = the dark force. Family-friendly cartoon zaps (no scary bits).
(function(){
const U15=15,PRE='mds',COL='#ff3040',COL2='#c9a0ff';
UF.push({pre:PRE,nm:'DARK SIDE',ico:'🌑',el:'force',col:COL,col2:COL2,spd:460,H:.38,H0:.34,minT:.14,W:.19,E:.46,tier:'MYTHIC FORM',
 CH:[null,MC('h1','flat',240,.07,'RED SWEEP!'),MC('h2','rise',200,.07,'RISING ARC!'),MC('h3','spin',190,.08,'SABER CYCLONE!'),MC('h4','over',220,.09,'DARK CLEAVE!'),
  MC('h5','thrust',320,.07,'SITH THRUST!'),MC('h6','low',280,.08,'SHADOW SWEEP!'),MC('h7','big',240,.1,'IMPERIAL X!')]});
UPRE.push(PRE);
UA(PRE,{idle:['m_idle',[0,1,2,3,2,1],6,1],run:['m_run',null,12,1],rise:['m_jump',[0,1],9],apex:['m_jump',[2]],fall:['m_jump',[3]],land:['m_jump',[0]],
 hurt:['m_hurt',null,6],victory:['m_victory',null,5],
 h1:['m_h1',null,16],h2:['m_h2',null,16],h3:['m_h3',null,16],h4:['m_h4',null,15],h5:['m_h5',null,16],h6:['m_h6',null,15],h7:['m_h7',null,13],
 launch:['m_launch',null,13],air1:['m_air',null,16],air2:['m_air',[2,3,1],14],dive:['m_dive',[0,1],10],
 tail:['m_push',null,15],tail2:['m_grip',null,11],pull:['m_pull',null,14],grip:['m_grip',null,10],push:['m_push',null,15],light:['m_lightning',null,12],throw:['m_throw',null,14],
 meowc:['m_lightning',[0]],meow:['m_throw',null,14],meow2:['m_lightning',null,12],blink:['m_blink',null,14],
 ultA:['m_ult',[0,1],8,1],ultB:['m_ult',[2]],ultC:['m_launch',[3]],ultD:['m_dive',[1]],ultE:['m_ult',[3]],ultF:['m_victory',[3]]});
// frames.json may already be in (the fetch is async) -> fill FR for our anims ourselves
let filled=false;function fill(){if(filled||!F||!F[PRE+'_m_idle'])return;for(const a in A)if(a.startsWith(PRE+'_')&&!FR[a]){const [s,idx]=A[a];if(F[s])FR[a]=idx?idx.filter(i=>i<F[s].length).map(i=>F[s][i]):F[s]}filled=true}
fill();
Object.assign(KB,{dpush:[900,-320,.25,.08],dpull:[-520,-180,.35,.05],dgrip:[0,-260,.6,.04],dlight:[90,-150,.45,.03],dblade:[240,-260,.25,.04],dbig:[480,-1050,.4,.1]});
Object.assign(NAMES,{dpush:'FORCE PUSH!',dpull:'PULL!',dgrip:'LIFT!',dlight:'ZZZAP!',dblade:'WHIRR!',dbig:''});
UTN.push(['FORCE PUSH!','FORCE PULL!','FORCE GRIP!']);
MTK[U15]='dforce';MMK[U15]='dmeow';MMN.dmeow=['SABER BOOMERANG!','FORCE LIGHTNING!','DARK STORM!!'];
MBN[U15]='SHADOW STEP!';MLN[U15]='FORCE LAUNCH!';MDN[U15]='SITH PLUNGE!';MFIN[U15]='DARK SIDE RISING!!';MULT[U15]=['FEEL THE DARK SIDE…','ZZZAP!'];
LKF.push(MLK(COL,COL2,'RED SWEEP!','DARK CLEAVE!','FORCE PULL!','FORCE GRIP!','FORCE LIGHTNING!','DARK STORM!','SHADOW STEP!','DOUBLE SHADOW!'));
LKT.push({C:'slash',T:'mT',M:'mM',B:'tele'});
ROUTES.push([MR('CCCM','FORCE LIGHTNING!','saber chain, then crackling violet force lightning'),MR('CCCMM','DARK STORM!','force lightning, then a whole storm of it'),
 MR('CCCTT','FORCE GRIP!','force pull, then grip and LIFT him into the air'),MR('TTTM','SABER BOOMERANG!','push, pull, grip – then throw the red saber and catch it'),
 MR('CCCCCT','FORCE CRUSH!','5 timed saber hits into a force pull'),
 MR('CCCTMMB','POWER OF THE DARK SIDE','ULTIMATE: a dark aura, a lightning storm, saber strikes from every side and a red shockwave slam',1)]);
UNLK.push({k:'ult',n:30,txt:'Land 30 ULTIMATES'});
FCOL.push(COL);FNAME.push('DARK SIDE PADDY');
for(const k in TKA)TKA[k].push(PRE+'_'+({leap:'rise',bonk:'dive',drop:'dive',trip:'tail'}[k]||'rise'));
window.UFTABS.push(['🌑 DARK SIDE',COL]);
Object.assign(map,{Numpad9:'uf15'});INSTANT.push('uf15');
// ---------- state ----------
const DS={grip:[],zap:null,rings:[],aura:0};window.DS=DS;
const paw=()=>({x:p.x+p.face*85,y:p.y-118});
const front=(r,back)=>dummies.filter(d=>d.alive&&(d.x-p.x)*p.face>-(back||40)&&Math.abs(d.x-p.x)<r);
function shock(x,y,big){for(let k=0;k<(big?4:2);k++)R9.rings.push({x,y,r:20+k*26,vr:(big?1300:950)+k*160,l:.8,col:k%2?COL2:COL,w:big?14:10,f:19,face:0});waves.push({x,y,r:10,l:.6,big:!!big})}
function dForce(lv,keep){const f=p.face,X=UF[U15];extend();
 if(lv===0){setAnim(uA('push'),true);const P0=paw();shock(P0.x,P0.y+20,0);for(const d of front(430))mHit(d,'dpush',f,keep);for(let k=0;k<14;k++)sparks.push({x:P0.x,y:P0.y+20+(Math.random()-.5)*60,vx:f*(500+Math.random()*500),vy:(Math.random()-.5)*160,l:.35,c:k%2?COL2:'#fff'});shake=Math.max(shake,12);return}
 if(lv===1){setAnim(uA('pull'),true);const g=uNear(720);const P0=paw();if(g){g.vx=0;U.pull={d:g,t:.3,x:p.x+f*120};mHit(g,'utail',f,keep);DS.rings.push({x:g.x,y:g.y-110,l:.45,r:90,col:COL})}
  for(let k=0;k<16;k++){const x0=g?g.x:P0.x+f*300;sparks.push({x:x0+(Math.random()-.5)*80,y:P0.y+(Math.random()-.5)*80,vx:-f*(500+Math.random()*400),vy:(Math.random()-.5)*80,l:.4,c:k%2?COL:COL2})}say('FORCE PULL!',COL2,true);return}
 // lv2: GRIP + LIFT every foe in front (up to 3)
 setAnim(uA('grip'),true);const T=front(780,60).slice(0,3);if(!T.length){shock(p.x+f*200,p.y-100,1);return}
 for(const d of T){DS.grip.push({d,t:0,l:1.15,keep,tk:.25,x:d.x});d.vx=0;d.vy=-200}say('FORCE GRIP!',COL2,true);M14.dark=Math.max(M14.dark,.8)}
function dMeow(lv,keep){const f=p.face;extend();
 if(lv===0){setAnim(uA('throw'),true);mP({k:'dsab',vx:f*1150,y:p.y-105,l:1.7,s:1.15,kb:'dblade',keep,tick:0,cos:0});return}
 setAnim(uA('light'),true);DS.zap={t:0,l:lv===2?1.5:.85,big:lv===2,keep,tk:0};if(lv===2){M14.dark=Math.max(M14.dark,1.6);card('DARK STORM!!','MEOW · fully charged',COL)}}
const _mMove=mMove;mMove=function(kind,lv,keep){if(kind==='dforce')return dForce(lv,keep);if(kind==='dmeow')return dMeow(lv,keep);return _mMove(kind,lv,keep)};
// ---------- chain, blink, launcher, dive, finisher, ultimate ----------
const _mChainX=mChainX;mChainX=function(X,i,c){if(p.uf!==U15)return _mChainX(X,i,c);const f=p.face,g=uNear(340),hx=g&&(g.x-p.x)*f>-40?g.x:p.x+f*150;
 for(let k=0;k<5+i;k++)sparks.push({x:p.x+f*(60+Math.random()*90),y:p.y-60-Math.random()*90,vx:f*(150+Math.random()*250),vy:(Math.random()-.5)*200,l:.3,c:k%3?COL:'#fff'});
 if(i>=4&&g)DS.rings.push({x:g.x,y:g.y-110,l:.35,r:70+i*6,col:i%2?COL:COL2});
 if(i===5)sLine(p.x+f*40,p.y-95,p.x+f*300,p.y-95,COL,.25,12);
 if(i===7){shock(hx,p.y-90,1);mP({k:'dsab',vx:f*1250,y:p.y-100,l:1.2,s:1.3,kb:'dblade',tick:0});shake=Math.max(shake,14)}};
const _ufBlink=ufBlink;ufBlink=function(){const x0=p.x,y0=p.y,r=_ufBlink();if(r&&p.uf===U15){puffShadow(x0,y0);puffShadow(p.x,p.y);sLine(x0,y0-90,p.x,p.y-90,COL,.3,8);for(let k=0;k<12;k++)sparks.push({x:p.x+(Math.random()-.5)*70,y:p.y-40-Math.random()*120,vx:(Math.random()-.5)*120,vy:-60-Math.random()*120,l:.5,c:k%2?'#3a1030':COL})}return r};
const _ufLaunch=ufLaunch;ufLaunch=function(){_ufLaunch();if(p.uf===U15){const x=p.x+p.face*110;DS.rings.push({x,y:GROUND-30,l:.5,r:80,col:COL2});for(let k=0;k<12;k++)sparks.push({x:x+(Math.random()-.5)*60,y:GROUND-10,vx:(Math.random()-.5)*80,vy:-500-Math.random()*400,l:.45,c:k%2?COL2:COL})}};
const _mDiveLand=mDiveLand;mDiveLand=function(){if(p.uf!==U15)return _mDiveLand();shock(p.x,GROUND-20,1);for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<260)mHit(d,'dpush',Math.sign(d.x-p.x)||p.face);R9.cracks.push(mkCrack(p.x,9))};
const _mBig=mBig;mBig=function(u,x,big){if(u!==U15)return _mBig(u,x,big);M14.dark=Math.max(M14.dark,big?2.2:1.2);
 mBolt(x,{w:big?2.8:1.6,hit:false,col:'#d8c0ff'});if(big)for(let k=1;k<=3;k++)setTimeout(()=>{mBolt(x-k*140,{hit:false,w:1.3,col:'#d8c0ff'});mBolt(x+k*140,{hit:false,w:1.3,col:'#ff6070'})},k*80);
 shock(x,GROUND-120,1);if(big){for(let k=0;k<3;k++)setTimeout(()=>shock(x,GROUND-120,1),120+k*120);mPillar(x,COL,200,1.1)}};
const _ufUltState=ufUltState;ufUltState=function(dt){const u=p.ult,h0=u?u.hits:0;_ufUltState(dt);if(u&&u.u===U15&&u.hits>h0&&u.tg&&u.tg.alive){const g=u.tg;DS.zap2={x0:p.x+p.face*60,y0:p.y-100,x1:g.x,y1:g.y-120,l:.12};if(u.hits%3===0)DS.rings.push({x:g.x,y:g.y-120,l:.3,r:80,col:COL})}};
// ---------- per-frame upkeep ----------
const _pre=r9Pre;r9Pre=function(dt){fill();_pre(dt);
 if(p.uf===U15){DS.aura+=dt;if(Math.random()<dt*7)sparks.push({x:p.x+(Math.random()-.5)*80,y:p.y-30-Math.random()*130,vx:(Math.random()-.5)*40,vy:-50,l:.45,c:Math.random()<.6?COL:'#5a2050'})}
 for(const G of DS.grip){const d=G.d;G.t+=dt;if(!d.alive){G.l=0;continue}
  if(G.t<G.l){const ty=GROUND-150-Math.min(1,G.t/.5)*130;d.y+=(ty-d.y)*Math.min(1,dt*6);d.x+=(G.x-d.x)*Math.min(1,dt*4);d.vx=0;d.vy=0;d.fl=.4;d.cool=Math.max(d.cool||0,.4);
   G.tk-=dt;if(G.tk<=0){G.tk=.3;C.atk++;if(G.keep)d.hp=Math.max(2,d.hp);hitDummy(d,'dgrip',p.face);d.vx=0;d.vy=0}if(Math.random()<.6)sparks.push({x:d.x+(Math.random()-.5)*90,y:d.y-40-Math.random()*120,vx:0,vy:-80,l:.35,c:Math.random()<.5?COL:COL2})}
  else if(!G.done){G.done=1;if(G.keep)d.hp=Math.max(2,d.hp);mHit(d,'dpush',Math.sign(d.x-p.x)||p.face,G.keep);shock(d.x,d.y-100,0)}}
 DS.grip=DS.grip.filter(G=>G.t<G.l+.05);
 const Z=DS.zap;if(Z){Z.t+=dt;Z.tk-=dt;const P0=paw();Z.tg=front(Z.big?820:620).slice(0,Z.big?4:3);
  if(Z.tk<=0){Z.tk=Z.big?.1:.13;for(const d of Z.tg){if(Z.keep)d.hp=Math.max(2,d.hp);mHit(d,'dlight',p.face,Z.keep);d.vx*=.2;if(d.y>GROUND-10&&Z.big)d.vy=Math.min(d.vy,-260)}noiseS&&noiseS(.06,4200,900,.04)}
  if(Z.big&&Math.random()<dt*10)mBolt(clampX(p.x+p.face*(150+Math.random()*500)),{hit:false,col:'#d8c0ff'});
  if(Z.t>=Z.l){if(Z.big)for(const d of Z.tg)mHit(d,'dbig',p.face,Z.keep);DS.zap=null}}
 if(DS.zap2){DS.zap2.l-=dt;if(DS.zap2.l<=0)DS.zap2=null}
 for(const r of DS.rings)r.l-=dt;DS.rings=DS.rings.filter(r=>r.l>0);
 for(const o of U.proj){if(o.k!=='dsab')continue;o.tick-=dt;if(o.tick<=0){o.tick=.15;o.hit.clear()}
  if(o.age>.42){const dx=p.x-o.x,dy=(p.y-105)-o.y,dd=Math.hypot(dx,dy)||1;o.vx+=(dx/dd*1500-o.vx)*Math.min(1,dt*4.5);o.vy+=(dy/dd*1500-o.vy)*Math.min(1,dt*4.5);if(dd<70&&o.age>.65){o.l=0;spark(p.x+p.face*40,p.y-105,8,[COL,'#fff'],200)}}}};
// ---------- drawing ----------
function bolt(x0,y0,x1,y1,w,seg){const pts=[[x0,y0]],n=seg||9;for(let k=1;k<n;k++){const t=k/n;pts.push([x0+(x1-x0)*t+(Math.random()-.5)*26*w,y0+(y1-y0)*t+(Math.random()-.5)*34*w])}pts.push([x1,y1]);
 for(const [lw,c,al] of [[16*w,'#8a5cff',.3],[7*w,COL2,.85],[2.6*w,'#fff',1]]){ctx.globalAlpha=al;ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}}
function saber(s,a){ctx.save();ctx.rotate(a);const L=62*s;for(const [lw,c,al] of [[22*s,COL,.28],[10*s,'#ff4a5a',.9],[3.5*s,'#fff',1]]){ctx.globalAlpha=al;ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(12*s,0);ctx.lineTo(12*s+L*1.5,0);ctx.stroke()}
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#222';ctx.fillRect(-16*s,-4.5*s,30*s,9*s);ctx.fillStyle='#c9a0ff';ctx.fillRect(-4*s,-5*s,4*s,10*s);ctx.restore()} // ONE blade, one hilt (v20g)
const _draw=drawFx;drawFx=function(){_draw();ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
 for(const r of DS.rings){ctx.globalAlpha=Math.min(1,r.l*3)*.7;ctx.strokeStyle=r.col;ctx.lineWidth=6;const R=r.r*(1.3-r.l);ctx.beginPath();ctx.ellipse(r.x,r.y,R,R*.8,0,0,6.283);ctx.stroke()}
 const P0=paw();
 for(const G of DS.grip){if(G.t>=G.l||!G.d.alive)continue;const d=G.d,cy=d.y-(d.h||150)*.55,a=now*5;
  for(let k=0;k<3;k++){ctx.globalAlpha=.55-k*.12;ctx.strokeStyle=k%2?COL2:COL;ctx.lineWidth=7-k*1.5;ctx.beginPath();ctx.ellipse(d.x,cy,70+k*16,(d.h||150)*.5+k*10,0,a+k*2,a+k*2+4.2);ctx.stroke()}
  ctx.globalAlpha=.35;ctx.strokeStyle=COL;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(P0.x,P0.y);for(let k=1;k<=10;k++){const t=k/10;ctx.lineTo(P0.x+(d.x-P0.x)*t,P0.y+(cy-P0.y)*t+Math.sin(now*14+k)*10)}ctx.stroke()}
 const Z=DS.zap;if(Z&&p.uf===U15){const T=Z.tg&&Z.tg.length?Z.tg:null;if(T)for(const d of T)bolt(P0.x,P0.y,d.x,d.y-(d.h||150)*.55,Z.big?1.4:1);else for(let k=0;k<2;k++)bolt(P0.x,P0.y,P0.x+p.face*(260+Math.random()*120),P0.y+(Math.random()-.5)*140,1,7);
  ctx.globalAlpha=.6;const g=ctx.createRadialGradient(P0.x,P0.y,2,P0.x,P0.y,40);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(160,110,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(P0.x,P0.y,40,0,6.283);ctx.fill()}
 if(DS.zap2){const z=DS.zap2;bolt(z.x0,z.y0,z.x1,z.y1,1,7)}
 for(const o of U.proj){if(o.k!=='dsab')continue;ctx.save();ctx.translate(o.x,o.y);ctx.globalAlpha=Math.min(1,o.l*4);
  for(let k=1;k<=3;k++){ctx.save();ctx.globalAlpha=.18/k;saber(o.s,o.age*26-k*.35);ctx.restore()}saber(o.s,o.age*26);ctx.restore()}
 ctx.restore()};
buildList();
})();
