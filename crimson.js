// v20h – CRIMSON BLADE, the game's master swordsman: 8-frame swings with smear frames, quicker cancels, a faster run,
// and a SWORDMASTER moveset (original names, family-friendly): Stinger, High Time, Million Stab, Round Trip, Helm Breaker,
// Aerial Rave, Prop Shredder, Drive, Real Impact and the Dance Macabre string – with a sky-splitting crimson finale.
(function(){
if(typeof UF==='undefined'||!UF[4])return;
const U4=4,F8=8,COL='#ff2a3a',COL2='#ffd060',X=UF[U4];
const I7=[1,2,3,4,5,6,7];
SM(F8,'cb',{h1:[28,0,'cb_m_s1',I7],h3:[28,0,'cb_m_s3',I7],h4:[28,0,'cb_m_s4',I7],h6:[26,0,'cb_m_s6',[1,2,3,4,5,6]],h7:[24,0,'cb_m_s7',[1,2,3,4,5]],
 launch:[18,0,'cb_m_hightime'],dive:[14,0,'cb_m_helm'],air1:[20,0,'cb_m_rave',[0,1]],air2:[20,0,'cb_m_rave',[2,3]],
 smstab:[26,1,'cb_m_mstab',[0,1,2]],smstabF:[14,0,'cb_m_mstab',[3]],smsting:[18,0,'cb_m_stinger8'],smprop:[16,1,'cb_m_prop',[1,2]],smpropE:[12,0,'cb_m_prop',[3]],
 smdrive:[16,0,'cb_m_drive'],smimpact:[12,0,'cb_m_impact'],smdance:[16,0,'cb_m_dance'],smpower:[7,0,'cb_m_power'],smrt:[16,0,'cb_m_throw'],smcatch:[12,0,'cb_m_catch']});
// snappier, more fluid chain: hits land on the smear frame, earlier cancel windows, a faster run
for(const i of [1,3,4,6,7])if(X.CH[i])X.CH[i].ht=.1;X.minT=.1;X.H=.4;X.H0=.36;X.spd=560;
if(A.cb_run)A.cb_run[2]=Math.max(A.cb_run[2]||12,17);
Object.assign(KB,{smstab:[40,-60,.12,.012],smstabF:[560,-320,.3,.1],smsting:[520,-240,.22,.08],smrt:[50,-140,.16,.02],smprop:[30,-300,.22,.02],
 smdrive:[420,-260,.22,.06],smimpact:[920,-520,.4,.18],smdance:[150,-170,.28,.03],smdanceF:[820,-1000,.5,.18]});
Object.assign(NAMES,{smstab:'MILLION STAB!',smstabF:'…AND STAB!',smsting:'STINGER!',smrt:'ROUND TRIP!',smprop:'PROP SHREDDER!',smdrive:'DRIVE!',smimpact:'REAL IMPACT!',smdance:'DANCE MACABRE!',smdanceF:'CURTAIN CALL!'});
const S={t:0,n:0,hold:0,seg:-1,rib:[]};window.CBSM=S;
const ST=['smstab','smsting','smrt','smprop','smdrive','smimpact','smdance'];
const NO=['lkult','ufin','nmorph','respawn','ledge','bunny','lk','umeowc','umeow','hurt','ko','moon','moonl','victory','stun'];
const free=()=>p.uf===U4&&!(typeof CINE!=='undefined'&&CINE.includes(p.state))&&!NO.includes(p.state)&&!(window.MOON&&MOON.on)&&(!ST.includes(p.state)||S.t>.2);
const snd=(k,v,g)=>{try{SND.play(k,{v:v||.8,gap:g||.05,r:.95+Math.random()*.1})}catch(_){}};
const chain=()=>{if(typeof CHN==='undefined')return;CHN.n=(now-CHN.t<2.2&&CHN.n>0)?CHN.n+1:1;CHN.t=now;if(CHN.n>1){CHN.show=1.6;CHN.best=Math.max(CHN.best||0,CHN.n)}};
function go(st,anim,nm,c){act(st,'cb_'+anim,{say:nm,c:c||COL2});S.t=0;S.n=0;S.seg=-1;C.atk=(C.atk||0)+1;extend();chain()}
const gh=l=>{const fr=(FR[p.anim]||[])[p.fi];if(fr)ghosts.push({x:p.x,y:p.y,f:fr,face:p.face,l,blue:0})};
const ribbon=(x,y,dir,len)=>S.rib.push({x,y,dir,len:len||260,l:.7,ph:Math.random()*6});
function trig(){const air=!p.ground,UP=K.up||(K.jump&&(p.ground||p.state==='jcharge')),fwd=(p.face>0&&K.right)||(p.face<0&&K.left);
 if(P.blink&&!air&&fwd&&!UP&&!K.down){delete P.blink;go('smsting','smsting','STINGER!');S.hit=new Set();snd('paddy_dash');return}
 if(P.tail&&UP){delete P.tail;delete P.jump;go('smrt','smrt','ROUND TRIP!');return}
 if(P.tail&&K.down&&!air){delete P.tail;go('smprop','smprop','PROP SHREDDER!');return}
 if(P.special&&UP){delete P.special;delete P.jump;go('smdance','smdance','DANCE MACABRE!','#ff6070');snd('ult_charge',.7,.5);return}
 if(K.attack&&S.hold>.34&&!air&&!ST.includes(p.state)){S.hold=-9;go('smstab','smstab','MILLION STAB!');return}}
function strike(kb,reach,h,all){const n=uStrike(kb,reach,h,all);if(n){snd('blade_slash',.7);spark(p.x+p.face*reach*.7,p.y-100,6,[COL,'#fff',COL2],260)}return n}
function end(){p.state='normal';p.t=0;setAnim(p.ground?uA('idle'):uA('fall'),true)}
const SEQ=[['h1',0],['h3',1],['h4',2],['smdance',3],['smstab',4],['h6',5],['h7',6],['smdance',7]];
function tick(dt){const st=p.state,t=S.t,f=p.face,at=T=>t<T&&S.t>=T;S.t+=dt;
 switch(st){
 case 'smstab':p.vx*=.7;S.n-=dt;if(S.n<=0&&t<1.6){S.n=.055;strike('smstab',230,200,false);if(Math.random()<.5)gh(.12)}
  if((!K.attack&&t>.45)||t>1.6){p.state='smstabF';S.t=0;setAnim('cb_smstabF',true);say('…AND STAB!',COL2);p.vx=f*240}break;
 case 'smstabF':p.vx*=.85;if(at(.06)){strike('smstabF',250,210,false);slash('thrust',COL,{lvl:6,scale:1.5,col2:COL2});shake=Math.max(shake,10)}if(t>.32)end();break;
 case 'smsting':if(t<.26){p.vx=f*1350;if(Math.random()<.6)gh(.15);for(const d of dummies)if(d.alive&&!S.hit.has(d)&&Math.abs(d.x-(p.x+f*90))<120&&d.y>p.y-200&&d.y<p.y+40){S.hit.add(d);hitDummy(d,'smsting',f);snd('blade_slash')}}
  else p.vx*=.82;if(at(.26)){slash('thrust',COL,{lvl:6,scale:1.6,col2:COL2});ribbon(p.x-f*40,p.y-90,-f,320)}if(t>.5)end();break;
 case 'smrt':p.vx*=.8;if(at(.16)){U.proj.push({k:'cbsword',x:p.x+f*90,y:p.y-100,vx:f*1100,vy:0,l:2.2,s:1.25,face:f,hit:new Set(),kb:'smrt',col:COL,age:0,tick:0,ox:p.x});snd('blade_boomerang')}
  if(t>.45){p.state='smcatchW';S.t=0}break;
 case 'smcatchW':{let out=false;for(const o of U.proj)if(o.k==='cbsword')out=true;p.vx*=.8;if(!out||t>1.8){setAnim('cb_smcatch',true);p.state='smcatchE';S.t=0;if(!out)say('…CAUGHT!',COL2)}break}
 case 'smcatchE':if(t>.3)end();break;
 case 'smprop':p.vx*=.85;S.n-=dt;if(S.n<=0){S.n=.08;strike('smprop',180,250,true);for(let k=0;k<4;k++)sparks.push({x:p.x+Math.cos(now*30+k)*110,y:p.y-190,vx:Math.cos(now*30+k)*300,vy:-80,l:.25,c:k%2?COL:COL2})}
  if(t>.85){p.state='smpropE';S.t=0;setAnim('cb_smpropE',true)}break;
 case 'smpropE':if(t>.25)end();break;
 case 'smdrive':p.vx*=.8;if(at(.2)){crescent({col:COL,kb:'smdrive',s:1.5,vx:f*1100,y:p.y-80,l:1});slash('rise',COL,{lvl:5,scale:1.3,col2:COL2});snd('blade_slash',.9)}if(t>.5)end();break;
 case 'smimpact':p.vx*=.8;if(at(.12)){M14&&(M14.dark=Math.max(M14.dark||0,.5))}if(at(.3)){p.vx=f*260;strike('smimpact',250,230,false);slash('big',COL,{lvl:8,scale:1.8,col2:COL2});shake=Math.max(shake,20);hitstop=Math.max(hitstop||0,.08);
   R9.rings.push({x:p.x+f*180,y:p.y-100,r:20,vr:1300,l:.7,col:COL,col2:'#fff',w:14,f:5,face:0});ribbon(p.x,p.y-100,f,300);snd('ult_explosion',.6,.3)}if(t>.65)end();break;
 case 'smdance':{p.vx*=.8;const k=Math.floor(t/.24);
  if(k<SEQ.length&&k!==S.seg){S.seg=k;const [a,ix]=SEQ[k];setAnim(a==='smdance'?'cb_smdance':'cb_'+a,true);p.vx=f*(150+(k%3)*60);p.face=k%4===3?-f:f;
   strike('smdance',220,220,true);ribbon(p.x,p.y-60-(k%3)*40,p.face,240);gh(.2);if(k===4)p.face=f}
  if(at(SEQ.length*.24)){p.face=f;setAnim('cb_smpower',true);say('CURTAIN CALL…',COL,true);p.inv=Math.max(p.inv||0,1.2);if(window.FIN)FIN.charge(U4,.9)}
  if(at(SEQ.length*.24+.42)){const tg=uNear(700),x=tg?tg.x:p.x+f*260;for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<720)hitDummy(d,'smdanceF',Math.sign(d.x-p.x)||f);
   if(window.FIN)FIN.go(U4,x,1);shake=Math.max(shake,26);snd('ult_explosion',.9,.5)}
  if(t>SEQ.length*.24+.95)end();break}
 }}
const _nu=nUpdate;nUpdate=function(dt){if(p.uf===U4){if(K.attack&&S.hold>=0)S.hold+=dt;else if(!K.attack)S.hold=0;if(free())trig();if(ST.includes(p.state)||/^sm/.test(p.state)){p.t=Math.min(p.t,1);tick(dt)}}_nu(dt)};
// Meow: tap = DRIVE, level 2 = REAL IMPACT, full charge keeps the old big move
if(typeof ufMeow==='function'){const _um=ufMeow;ufMeow=function(L){if(p.uf===U4&&L<2){if(L===0)go('smdrive','smdrive','DRIVE!');else go('smimpact','smimpact','REAL IMPACT!','#ff6070');return}return _um.apply(this,arguments)}}
// the thrown sword: out, hover & shred, then home back
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);
 for(const r of S.rib)r.l-=dt;S.rib=S.rib.filter(r=>r.l>0);
 for(const o of U.proj){if(o.k!=='cbsword')continue;o.tick-=dt;if(o.tick<=0){o.tick=.11;o.hit.clear()}
  if(o.age>.32&&o.age<1.05){o.vx*=Math.pow(.002,dt)}else if(o.age>=1.05){const dx=p.x-o.x,dy=(p.y-100)-o.y,dd=Math.hypot(dx,dy)||1;o.vx+=(dx/dd*1500-o.vx)*Math.min(1,dt*5);o.vy+=(dy/dd*1500-o.vy)*Math.min(1,dt*5);if(dd<70){o.l=0;spark(p.x+p.face*40,p.y-100,8,[COL,'#fff'],200)}}
  if(Math.random()<.5)sparks.push({x:o.x,y:o.y,vx:(Math.random()-.5)*200,vy:(Math.random()-.5)*200,l:.25,c:Math.random()<.5?COL:COL2})}};
const _fx=drawFx;drawFx=function(){_fx();if(!S.rib.length&&!U.proj.some(o=>o.k==='cbsword'))return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 for(const r of S.rib){const a=Math.min(1,r.l*2);ctx.globalAlpha=a*.8;for(const [w,c] of [[14,COL],[5,'#ffd0d0']]){ctx.strokeStyle=c;ctx.lineWidth=w*a;ctx.beginPath();for(let k=0;k<=16;k++){const q=k/16,x=r.x+r.dir*r.len*q*(1.2-r.l*.3),y=r.y+Math.sin(q*7+r.ph+now*8)*26*(1-q*.4);k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}}
 for(const o of U.proj){if(o.k!=='cbsword')continue;ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.age*24*o.face);const L=80*o.s;
  ctx.globalAlpha=.35;ctx.strokeStyle=COL;ctx.lineWidth=10;ctx.beginPath();ctx.arc(0,0,L,0,6.283);ctx.stroke();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#9aa2ad';ctx.beginPath();ctx.moveTo(-6,-8*o.s);ctx.lineTo(L,0);ctx.lineTo(-6,8*o.s);ctx.closePath();ctx.fill();ctx.strokeStyle=COL;ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#4a2a1a';ctx.fillRect(-28*o.s,-5*o.s,24*o.s,10*o.s);ctx.fillStyle='#c0a060';ctx.fillRect(-8*o.s,-16*o.s,6*o.s,32*o.s);ctx.restore()}
 ctx.restore()};
const _bl=buildList;buildList=function(){_bl();const el=document.getElementById('clist');if(!el)return;const h3=el.querySelector('h3');if(!h3)return;
 h3.insertAdjacentHTML('afterend',`<div id="cbsm" style="background:linear-gradient(135deg,#3a0a10,#1a0608);border:2px solid #ff2a3a;border-radius:12px;padding:6px 10px;margin:6px 0 10px;box-shadow:0 0 16px #ff2a3a55">
 <h3 style="color:#ff6070;margin:2px 0">🗡️ CRIMSON BLADE · SWORDMASTER STYLE</h3>
 <p class="tip" style="margin:3px 0"><b>STINGER</b> – hold <b>◀/▶ forward + BLINK</b>: dash-thrust through everyone · <b>HIGH TIME</b> – <b>▼+CLAW</b> launcher · <b>MILLION STAB</b> – hold <b>CLAW</b></p>
 <p class="tip" style="margin:3px 0"><b>ROUND TRIP</b> – <b>▲(or hold JUMP)+TAIL</b>: the spinning sword shreds, then flies home · <b>PROP SHREDDER</b> – <b>▼+TAIL</b> · <b>HELM BREAKER</b> – <b>▼+CLAW</b> in the air · <b>AERIAL RAVE</b> – <b>CLAW</b> in the air</p>
 <p class="tip" style="margin:3px 0"><b>DRIVE</b> – tap <b>MEOW</b>: a crimson sword wave · <b>REAL IMPACT</b> – <b>MEOW</b> charged once · <b>DANCE MACABRE</b> – <b>▲(or hold JUMP)+MEOW</b>: a long flowing string ending in a sky-splitting crimson slash!</p></div>`)};
buildList();
window.CRIMSON20H=true;})();
