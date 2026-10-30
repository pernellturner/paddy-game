// ===================== v22: DEADLY SWORD FORMS + SITH-LORD DARK SIDE =====================
// Sword forms (Samurai, Knight, Pirate, Power Blade, Crimson Blade, Dark Side): every swing leaves a big smooth
// lingering blade arc, afterimages, heavy hit-stop, screen shake and an impact shockwave. Family friendly: light, sparks, no gore.
// Dark Side: slow, crushing saber strikes with slow-mo on heavy hits, force-crush impacts, a dark aura that pulses
// with every hit, and a cape flourish on his big moves.
(function(){
const SW={2:{c:'#eaf6ff',c2:'#6fc3ff',r:120,d:.13,ln:.32},3:{c:'#fff1b8',c2:'#ffb020',r:134,d:.16,ln:.36},4:{c:'#f4f4f4',c2:'#ff9a3c',r:112,d:.12,ln:.3},
 7:{c:'#8ff8ff',c2:'#2a9dff',r:132,d:.14,ln:.36},8:{c:'#ff3a52',c2:'#ffd060',r:128,d:.11,ln:.34},19:{c:'#ff1e2e',c2:'#ff8a8a',r:142,d:.2,ln:.55,dark:1}};
const fNow=()=>{try{return Math.min(19,FORM()|0)}catch(_){return 0}};
const NOSW=new Set(['normal','land','hurt','jump','djump','dash','ndash','wallrun','ledge','slide','victory','stop','zoomies','wiggle','superleap','hardland','stun','ko','respawn','sit','hiss','meow','idle','fall','lk','grab','tkd','story','jcharge']);
const TR=[],IMP=[],CAPE=[];let sig='',alt=0,DSP=0,ghT=0;
const curF=()=>{const fr=FR[p.anim]||FR.idle;return fr&&fr[Math.min(p.fi|0,fr.length-1)]};
function kindOf(n){n=n.toLowerCase();if(/launch|upper|hightime|rise|xup|_up/.test(n))return'up';if(/dive|helm|slam|smash|drop|down|stomp|breaker/.test(n))return'down';
 if(/stab|sting|thrust|lunge|drive|pierce/.test(n))return'thrust';if(/spin|prop|round|dance|whirl|vortex|rave|tail/.test(n))return'spin';return (alt++%2)?'back':'diag'}
const ANG={diag:[-2.3,.75],back:[.55,-2.05],up:[1.0,-2.4],down:[-2.2,1.15],spin:[-3.1,3.3]};
function spawn(f){const X=SW[f],k=kindOf(p.anim+' '+p.state),heavy=/h7|h6|launch|helm|slam|fin|ult|impact|smpower|xslam/.test(p.anim+p.state);
 const r=X.r*(heavy?1.18:1)*(k==='spin'?.9:1);TR.push({x:p.x,y:p.y-88,face:p.face,k,a:ANG[k]||ANG.diag,r,t:0,d:X.d*(heavy?1.25:1),L:X.d+X.ln*(heavy?1.4:1),c:X.c,c2:X.c2,dark:X.dark,w:heavy?1.35:1});
 if(f===19&&Math.random()<.3)try{SND.formPlay('hum',{v:.45,gap:1.2})}catch(_){}}
// ---------- update ----------
function upd(dt){const f=fNow(),X=SW[f];
 if(typeof p!=='undefined'){const s=p.state+'|'+p.anim+'|'+p.combo;if(s!==sig){const prevSt=sig.split('|')[0];sig=s;
   if(X&&!NOSW.has(p.state))spawn(f);
   if(f===19&&p.state!==prevSt&&/^(victory|ublink|ufin|umeowc|fzchoke|fzrip|fzvortex|utail)$/.test(p.state))CAPE.push({t:0,L:.7,face:p.face})}
  const sweeping=TR.some(t=>t.t<t.d);if(X&&sweeping){ghT-=dt;if(ghT<=0){ghT=f===19?.045:.03;const cf=curF();if(cf)ghosts.push({x:p.x,y:p.y,f:cf,face:p.face,l:f===19?.26:.18,blue:1})}}}
 for(const t of TR){if(t.t<t.d){t.x=p.x;t.y=p.y-88;t.face=p.face}t.t+=dt}for(let i=TR.length-1;i>=0;i--)if(TR[i].t>=TR[i].L)TR.splice(i,1);
 for(const m of IMP)m.t+=dt;for(let i=IMP.length-1;i>=0;i--)if(IMP[i].t>=IMP[i].L)IMP.splice(i,1);
 for(const c of CAPE)c.t+=dt;for(let i=CAPE.length-1;i>=0;i--)if(CAPE[i].t>=CAPE[i].L)CAPE.splice(i,1);
 DSP=Math.max(0,DSP-dt*2.2)}
// ---------- hits ----------
const FORCE=/^(fz|dforce|dpush|dgrip|dbig|dlight|upush)/;
function onHit(d,move){const f=fNow(),X=SW[f];if(!X||!d)return;const k=(typeof KB!=='undefined'&&KB[move])||[0,0,0,.05],mv=String(move||'');
 const force=f===19&&FORCE.test(mv),heavy=force||k[3]>=.08||(C.n%4===0)||/fin|ult|big|slam|impact|helm/.test(mv);
 hitstop=Math.max(hitstop,(heavy?.12:.075)+(f===19?.03:0));shake=Math.max(shake,heavy?(f===19?20:16):10);
 IMP.push({x:d.x,y:d.y-70,t:0,L:heavy?.42:.3,c:X.c,c2:X.c2,heavy,ang:(Math.random()-.5)*1.2,dark:X.dark,force});
 waves.push({x:d.x,y:d.y-60,r:24,l:heavy?.6:.4,big:heavy});
 for(let i=0;i<(heavy?14:7);i++){const a=Math.random()*6.283,v=300+Math.random()*500;sparks.push({x:d.x,y:d.y-70,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,l:.35,c:Math.random()<.5?X.c:X.c2})}
 if(f===19){DSP=Math.min(1.4,DSP+(heavy?.9:.5));if(heavy)slowT=Math.max(slowT,.08);
  if(force){d.sq=1.7;for(let i=0;i<10;i++)sparks.push({x:d.x+(Math.random()-.5)*120,y:(d.y||GROUND)-4,vx:(Math.random()-.5)*260,vy:-60-Math.random()*160,l:.5,c:i%2?'#3a0a12':'#9a8a80'})}}}
function hook(){if(typeof hitDummy!=='function'||typeof r9Pre!=='function'||typeof drawFx!=='function'||typeof drawDummies!=='function'){setTimeout(hook,200);return}
 const _hd=hitDummy;hitDummy=function(d,move,dir){const r=_hd.apply(this,arguments);try{onHit(d,move)}catch(_){}return r};
 const _pre=r9Pre;r9Pre=function(dt){_pre(dt);try{upd(dt)}catch(_){}};
 const _dd=drawDummies;drawDummies=function(){_dd.apply(this,arguments);try{if(fNow()===19&&typeof p!=='undefined')aura();for(const c of CAPE)cape(c)}catch(_){}};
 const _fx=drawFx;drawFx=function(){_fx.apply(this,arguments);try{drawAll()}catch(_){}}}
// ---------- drawing ----------
function arcRibbon(t){const prog=Math.min(1,t.t/t.d),fade=t.t<t.d?1:Math.max(0,1-(t.t-t.d)/(t.L-t.d)),[a0,a1]=t.a,aE=a0+(a1-a0)*(1-Math.pow(1-prog,3)),N=26,R=t.r,F=t.face;
 const pt=(a,rr)=>[t.x+Math.cos(a)*rr*F,t.y+Math.sin(a)*rr];ctx.save();ctx.globalCompositeOperation='lighter';
 for(const [w0,col,al] of [[1.0,t.c2,.35],[.62,t.c,.8],[.22,'#fff',.95]]){ctx.beginPath();
  for(let i=0;i<=N;i++){const u=i/N,a=a0+(aE-a0)*u,th=(.06+.94*u)*34*t.w*w0;const q=pt(a,R+th*.5);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}
  for(let i=N;i>=0;i--){const u=i/N,a=a0+(aE-a0)*u,th=(.06+.94*u)*34*t.w*w0;const q=pt(a,R-th*(t.dark?1.6:1.2));ctx.lineTo(q[0],q[1])}
  ctx.closePath();ctx.globalAlpha=al*fade;ctx.fillStyle=col;ctx.fill()}
 if(t.dark){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.25*fade;ctx.strokeStyle='#14000a';ctx.lineWidth=10;ctx.beginPath();for(let i=0;i<=N;i++){const a=a0+(aE-a0)*i/N,q=pt(a,R*.62);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke()}
 ctx.restore()}
function thrust(t){const prog=Math.min(1,t.t/t.d),fade=t.t<t.d?1:Math.max(0,1-(t.t-t.d)/(t.L-t.d)),L=260*prog*t.w,F=t.face;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const [h,col,al] of [[30,t.c2,.35],[16,t.c,.8],[5,'#fff',1]]){ctx.globalAlpha=al*fade;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(t.x+F*20,t.y-h*.5+8);ctx.lineTo(t.x+F*(40+L),t.y+8);ctx.lineTo(t.x+F*20,t.y+h*.5+8);ctx.closePath();ctx.fill()}
 for(let i=0;i<4;i++){ctx.globalAlpha=.5*fade;ctx.strokeStyle=t.c;ctx.lineWidth=2;const yy=t.y+8+(i-1.5)*14;ctx.beginPath();ctx.moveTo(t.x-F*30,yy);ctx.lineTo(t.x+F*(L*.6),yy);ctx.stroke()}ctx.restore()}
function impact(m){const k=m.t/m.L,R=(m.heavy?170:110)*(1-Math.pow(1-k,2.5)),al=1-k;ctx.save();ctx.globalCompositeOperation='lighter';
 if(m.force){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.55*al;ctx.strokeStyle='#1a0008';ctx.lineWidth=16*(1-k)+3;ctx.beginPath();ctx.arc(m.x,m.y,140*(1-k)+20,0,6.283);ctx.stroke();ctx.globalCompositeOperation='lighter'}
 ctx.globalAlpha=.85*al;ctx.strokeStyle=m.c;ctx.lineWidth=(m.heavy?14:9)*(1-k)+2;ctx.beginPath();ctx.arc(m.x,m.y,R,0,6.283);ctx.stroke();
 ctx.globalAlpha=.6*al;ctx.strokeStyle=m.c2;ctx.lineWidth=4;ctx.beginPath();ctx.arc(m.x,m.y,R*.62,0,6.283);ctx.stroke();
 for(let i=0;i<12;i++){const a=i/12*6.283+m.ang,r0=R*.35,r1=R*(1.05+(i%3)*.12);ctx.globalAlpha=.8*al;ctx.strokeStyle=i%2?m.c:'#fff';ctx.lineWidth=i%2?3:2;ctx.beginPath();ctx.moveTo(m.x+Math.cos(a)*r0,m.y+Math.sin(a)*r0);ctx.lineTo(m.x+Math.cos(a)*r1,m.y+Math.sin(a)*r1);ctx.stroke()}
 if(k<.45){const g=1-k/.45,L=(m.heavy?190:130);ctx.translate(m.x,m.y);for(const a of [m.ang+.7,m.ang-.7]){ctx.save();ctx.rotate(a);ctx.globalAlpha=g;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(0,-7*g-2);ctx.lineTo(L,0);ctx.lineTo(0,7*g+2);ctx.closePath();ctx.fill();ctx.globalAlpha=g*.6;ctx.fillStyle=m.c;ctx.fillRect(-L*.8,-14*g,L*1.6,28*g);ctx.restore()}}
 ctx.restore()}
function aura(){const br=.5+.5*Math.sin(performance.now()/260),k=Math.min(1,DSP),R=95+k*90+br*10,x=p.x,y=p.y-90;ctx.save();
 const g=ctx.createRadialGradient(x,y,20,x,y,R);g.addColorStop(0,'rgba(255,30,50,0)');g.addColorStop(.55,`rgba(140,0,20,${.16+k*.3})`);g.addColorStop(.85,`rgba(20,0,8,${.22+k*.35})`);g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,6.283);ctx.fill();if(k>.05){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=k*.7;ctx.strokeStyle='#ff2038';ctx.lineWidth=4+k*6;ctx.beginPath();ctx.arc(x,y,R*.82,0,6.283);ctx.stroke()}ctx.restore()}
function cape(c){const k=c.t/c.L,al=k<.75?1:1-(k-.75)/.25,sw=Math.sin(k*Math.PI),x=p.x,y=p.y-120,F=c.face,N=22,a0=Math.PI*(1.05-.9*k),span=2.6*sw+.6;ctx.save();
 const pts=(rr,off)=>{const o=[];for(let i=0;i<=N;i++){const u=i/N,a=a0+span*u,r=rr+u*60+Math.sin(u*9+k*12)*8;o.push([x+Math.cos(a)*r*F*1.25,y+Math.sin(a)*r*.75+u*70+off])}return o};
 const out=pts(78,0),inn=pts(40,10);ctx.globalAlpha=.92*al;ctx.fillStyle='#120208';ctx.beginPath();out.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=inn.length-1;i>=0;i--)ctx.lineTo(inn[i][0],inn[i][1]);ctx.closePath();ctx.fill();
 ctx.globalAlpha=.9*al;ctx.strokeStyle='#b0001a';ctx.lineWidth=4;ctx.beginPath();out.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.restore()}
function drawAll(){for(const t of TR)t.k==='thrust'?thrust(t):arcRibbon(t);for(const m of IMP)impact(m)}
hook();window.SWORDS22={TR,IMP,CAPE,SW};
})();
