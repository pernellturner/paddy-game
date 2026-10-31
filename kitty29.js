// ===================== v29: ORIGINAL PADDY POLISH =====================
// Base (Kitty) Paddy only:
//  • claw 1-2-3 are real boxing jabs: LEFT JAB, RIGHT JAB, POWER PUNCH (new drawn frames, hit lands on the fully extended paw)
//  • the air spin (blue swirl, no readable pose) is now a drawn AIR CARTWHEEL CLAW with its own claw arcs
//  • the 8th-hit finisher is a visible GRAB: latch on, the enemy is held and follows him, 6 readable bunny kicks, then a launch
//  • every hit shows an impact star at the contact point; the chain number pops only when a hit lands
//  • turn mid-combo (tap the other way) and keep the same chain; hold ↑/Jump during a combo for upward SKY SWIPES
//  • defence: DODGE (tap B, or O / tap 🛡), BLOCK (hold B / hold 🛡), COUNTER (dodge or block just as a hit lands)
(function(){
if(typeof SM!=='function'||typeof A==='undefined')return;
const base=()=>{try{return FORM()===0}catch(_){return false}};
const K29={turns:0,counters:0,blocks:0,dodges:0,ups:0,imp:[]};window.K29=K29;
// ---------- 1. frames ----------
// v33: pc1-pc8 alias the approved punch-string sheets in punch33.js (k_ps_*/k_pw_*); kguard uses the shared guard pose (k_ps_jab1_00)
const NEW={
 airspin:[13,0,'k_m_aircart',[0,1,2,3,4]],pclunge:[12,0,'k_m_grab',[0,1]],bk_leap:[10,0,'k_m_grab',[1,2]],bk_roll:[1,0,'k_m_grab',[3]],
 bk_kick:[1,0,'k_m_bkick',[0,1,2]],bk_land:[7,0,'k_m_brel',[0,1]],kguard:[1,0,'k_ps_jab1',[0]],kcounter:[22,0,'k_m_power',[1,2,2,3]],
 pcup:[18,0,'launcher',[1,2,3,3]],uppercut:[14,0,'uppercut',[0,1,2,3,4]]};
SM(0,'',NEW);for(const k in NEW){const v=NEW[k];A[k]=[v[2],v[3],v[0],v[1]];if(window.SMOOTH)SMOOTH.DONE.delete(k)}
Object.assign(CLAWS[1],{k:'thrust',nm:'LEFT JAB!',lunge:120});Object.assign(CLAWS[2],{k:'thrust',nm:'RIGHT JAB!',lunge:140});Object.assign(CLAWS[3],{k:'thrust',nm:'POWER PUNCH!',lunge:260});
Object.assign(NAMES,{pc1:'LEFT JAB!',pc2:'RIGHT JAB!',pc3:'POWER PUNCH!',pcup:'SKY SWIPE!',airspin:'CARTWHEEL CLAW!',airup:'SKY SWIPE!',kcounter:'COUNTER!',bunnygrab:'GRAB!',bunnykick:'KICK!'});
// jabs barely push (so the 3rd punch still connects); the power punch knocks back hard
Object.assign(KB,{pc1:[70,-60,0,.06],pc2:[90,-80,0,.065],pc3:[460,-300,.12,.1],pcup:[40,-700,.45,.07],airup:[60,-560,.4,.06],kcounter:[560,-560,.4,.13],bunnykick:[0,-40,.5,.06]});
Object.assign(REACH,{pc1:[150,140],pc2:[155,150],pc3:[190,170],pcup:[140,340],swat:[145,125]});
// paw is fully out on this many seconds into the move: the hit (and its hitstop) lands there, not on the wind-up frame
const EXT=window.K29EXT={pc1:.075,pc2:.075,pc3:.11,pcup:.06};
let asked=false;
// ---------- 2. hits you can SEE ----------
const _hit=hitDummy;hitDummy=function(d,move,dir){const r=_hit.apply(this,arguments);
 try{const b=base(),H=d.h||130,top=d.y-H*(d.cr?1:.9),cy=Math.max(top+H*.15,Math.min(d.y-12,p.y-(move==='pcup'||move==='airup'?150:78))),cx=d.x-dir*Math.min(46,H*.25);
  const big=/pc3|kcounter|bunnylaunch|finisher|dashstrike|pc8/.test(move),kick=move==='bunnykick';
  K29.imp.push({x:cx,y:cy,l:1,big,col:kick?'#ff9ad5':move==='kcounter'?'#7fffd4':move==='pc3'?'#ffb040':'#ffe9a8',rot:Math.random()*6.28});if(K29.imp.length>24)K29.imp.shift();
  d.flash=Math.max(d.flash,.16);
  if(b){hitstop=Math.max(hitstop,big?.1:.05);
   if(p.state==='claw'&&p.k29pop!==p.combo){p.k29pop=p.combo;const c=CLAWS[p.combo];popNum(p.combo,c?c.col:'#fff')}}}catch(_){}
 return r};
const _sc=startClaw;startClaw=function(){if(!base())return _sc();const pn=popNum;popNum=function(){};try{_sc()}finally{popNum=pn}
 if(p.combo===1)p.k29pop=0;
 // ↑ / Jump held during a combo: upward SKY SWIPE (hits birds and anything above)
 const up=p.k29fu||K.up||K.jump;p.k29fu=0;if(p.combo>=2&&up&&p.ground){setAnim('pcup',true);K29.ups++;slash('up','#bfe8ff',{lvl:4,scale:1.15,dy:120,dx:40});say('SKY SWIPE!','#bfe8ff',true);p.vx*=.4}
 else if(p.combo<=3){jabFx(p.combo)}};
function jabFx(i){const y=p.y-(i===3?95:150),x0=p.x+p.face*40;for(let k=0;k<(i===3?3:2);k++)K29.imp.push({streak:1,x:x0,y:y+(k-.5)*12,face:p.face,len:i===3?190:120,l:1,col:i===3?'#ffd27a':'#ffffff',d:.05+k*.02})}
const _mh=meleeHits;meleeHits=function(dt){if(base()&&p.state==='claw'){const e=EXT[p.anim];if(e!=null&&p.t<e)return;if(p.anim==='pcup'&&p.t>.28)return}return _mh(dt)};
// ---------- 3. the GRAB + bunny-kick finisher ----------
const _bs=bunnyState;bunnyState=function(dt){if(!base())return _bs(dt);const g=p.grab&&p.grab.alive?p.grab:null,t=p.t;p.rot=0;p.inv=Math.max(p.inv,.5);p.noFlick=true;
 const hold=(dx,dy,k)=>{if(!g)return;g.x+=(p.x+p.face*dx-g.x)*Math.min(1,dt*k);g.y+=(Math.min(GROUND,p.y-dy)-g.y)*Math.min(1,dt*k);g.vx=0;g.vy=0;g.fl=.5;g.cool=Math.max(g.cool||0,1.5)};
 if(t<.3){setAnim('pclunge');p.vx*=Math.pow(.02,dt);if(g&&Math.abs(g.x-p.x)<110)p.vx=0;if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.pclunge[p.fi],face:p.face,l:.2});
  if(t>.14&&!p.st1){p.st1=true;if(g){g.hp=Math.max(4,g.hp);hitDummy(g,'bunnygrab',p.face)}say('GRAB!','#ff9ad5',true);hitstop=.1;flashT=Math.max(flashT,.08);
   const gx=g?g.x-p.face*30:p.x+p.face*90,gy=g?g.y-90:p.y-80;for(let i=0;i<10;i++){const a=i/10*6.283;sparks.push({x:gx+Math.cos(a)*70,y:gy+Math.sin(a)*70,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.3,c:i%2?'#fff':'#ff9ad5'})}}
  if(g&&t>.14)hold(80,10,16)}
 else if(t<.55){p.vx=0;setAnim('bk_leap');hold(78,25,14);if(!p.st3){p.st3=true;say('LATCHED ON!','#ff9ad5',true)}}
 else if(t<1.75){p.vx=0;setAnim('bk_kick');const n=Math.floor((t-.55)/.2),ph=((t-.55)%.2)/.2;p.fi=ph<.5?1:(n%2?0:2);
  hold(78,25,14);if(g&&ph<.5)g.x+=p.face*(1-ph*2)*10; // the enemy flinches back with every kick
  if(n>(p.kicks|0)-1&&n<6){p.kicks=n+1;if(g){g.hp=Math.max(3,g.hp);hitDummy(g,'bunnykick',p.face);g.vx=0;g.vy=0}
   popNum(p.kicks,p.kicks%2?'#ff9ad5':'#ffe14d');shake=Math.max(shake,6);say(['KICK!','KICK!','KICK!','KICK!','KICK!!','KICK!!!'][n]+' '+p.kicks,p.kicks%2?'#ff9ad5':'#ffe14d',true)}}
 else if(t<1.95){p.vx=0;setAnim('bk_roll');hold(78,25,14);if(!p.st2){p.st2=true;hitstop=.14;flashT=.18;say('BUNNY...','#fff',true);cine.tz=1.7;
   for(let i=0;i<20;i++){const a=i/20*6.283;sparks.push({x:p.x+Math.cos(a)*150,y:p.y-70+Math.sin(a)*150,vx:-Math.cos(a)*600,vy:-Math.sin(a)*600,l:.25,c:'#ff4fa3'})}}}
 else if(!p.shot){p.shot=true;setAnim('bk_land',true);const cx=g?g.x:p.x+p.face*60;if(g){g.hp=Math.max(4,g.hp);hitDummy(g,'bunnylaunch',p.face);g.vy=-2000;g.vx=p.face*380;g.fl=.9}
  p.vx=-p.face*320;p.vy=-420;p.ground=false; // let go: flip back off him
  shake=30;slowT=.6;flashT=.38;hitstop=.1;cine.tz=1.15;for(let i=0;i<4;i++)waves.push({x:cx,y:p.y-60+i*10,r:10+i*30,l:1,big:true});burst(cx,p.y-80);burst(cx,p.y-140,1);
  for(let i=0;i<60;i++){const a=Math.random()*6.28,v=200+Math.random()*700;sparks.push({x:cx,y:p.y-80,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,l:.7,c:['#fff','#ff4fa3','#ffe14d','#ff9ad5'][i%4]})}
  cine.pillar={x:cx,l:1,col:'#ff9ad5'};card('BUNNY KICK BARRAGE!','GRAB · '+p.kicks+' KICKS · LAUNCH','#ff4fa3')}
 if(t>2.5){p.state='normal';p.rot=0;p.combo=0;p.inv=.4;p.noFlick=false}};
const _bk=bunnyKick;bunnyKick=function(){_bk();if(base()){p.st1=p.st2=p.st3=false;p.shot=false;p.kicks=0}};
// ---------- 4. turning mid-combo + defence ----------
const TURN=new Set(['claw','airswipe','airspin','swat','pawpop','uppercut','dashstrike','kcounter']);
const OKDEF=new Set(['normal','claw','land','stop','swat','tailwhip','airswipe','airspin','dash','hardland','pawpop','slide','meow','manner','jcharge','kguard']);
let chip=0;
function startDodge(dir){p.state='kdodge';p.t=0;acted=true;setAnim('dash',true);p.dd=dir;p.vx=dir*820;p.inv=Math.max(p.inv,.34);p.noFlick=true;p.wall=false;
 if(!p.ground)p.vy=Math.min(p.vy,-60);p.kdCool=.42;K29.dodges++;say('DODGE!','#bfe8ff');puffShadow(p.x,p.y)}
function startGuard(){p.state='kguard';p.t=0;acted=true;setAnim('kguard',true);p.vx*=.3;p.kgHit=false}
function counter(d){K29.counters++;p.state='kcounter';p.t=0;p.shot=false;p.ctg=d;acted=true;p.face=d.x>=p.x?1:-1;setAnim('kcounter',true);p.inv=Math.max(p.inv,1);p.noFlick=true;
 slowT=Math.max(slowT,.5);flashT=Math.max(flashT,.18);hitstop=Math.max(hitstop,.08);shake=Math.max(shake,8);say('COUNTER!','#7fffd4',true);
 d.cool=Math.max(d.cool||0,2.2);d.stun=Math.max(d.stun||0,.8);for(let i=0;i<16;i++){const a=i/16*6.283;sparks.push({x:p.x+Math.cos(a)*110,y:p.y-80+Math.sin(a)*110,vx:-Math.cos(a)*500,vy:-Math.sin(a)*500,l:.25,c:i%2?'#7fffd4':'#fff'})}}
const _ds=dogStrike;dogStrike=function(d,dmg,kind){if(base()){const dir=Math.sign(p.x-d.x)||-1;
  if(p.state==='kdodge'&&p.t<.22){counter(d);return true}
  if(p.state==='kguard'){if(p.t<.2){counter(d);return true}
   K29.blocks++;p.kgHit=true;say('BLOCKED!','#cfe3ff',true);p.vx=dir*170;d.vx=-dir*420;d.vy=Math.min(d.vy||0,-220);d.cool=Math.max(d.cool||0,1.4);if(typeof dSet==='function'&&!d.cr)dSet(d,'hurt','r_hurt');
   d.flash=.16;shake=Math.max(shake,6);hitstop=Math.max(hitstop,.05);K29.imp.push({x:p.x+p.face*55,y:p.y-95,l:1,big:false,col:'#cfe3ff',rot:0});
   chip+=(dmg||1)*.34;if(chip>=1&&p.hp>1){chip-=1;p.hp-=1}return true}}
 return _ds.apply(this,arguments)};
map.KeyB='guard';map.KeyO='dodge';
const _pre=r9Pre;r9Pre=function(dt){
 try{if(!asked&&window.queueFrames&&F){asked=true;const L=[];for(const k in NEW){const v=NEW[k],s=F[v[2]];if(s)(v[3]||s.map((_,i)=>i)).forEach(i=>s[i]&&L.push(s[i].f))}
   for(const a of ['claw1','pc4','pc5','pc6','pc7','airswipe','diveclaw','dashstrike','swat','tailwhip','pawpop','finisher','dash'])(FR[a]||[]).forEach(q=>L.push(q.f));queueFrames([...new Set(L)],true)}
  K29.imp=K29.imp.filter(o=>(o.l-=dt*(o.streak?5:5.5))>0);
  const gb=document.querySelector('#ui .b[data-k=guard]');if(gb){const want=(base()||FORM()===1||FORM()===2||FORM()===3)?'':'none';if(gb.style.display!==want){gb.style.display=want;dispatchEvent(new Event('resize'))}}
  if(base()){p.kdCool=(p.kdCool||0)-dt;
   if(p.state!=='claw')p.k29fu=0;
   // ↑ / Jump pressed during a claw combo = the next combo hit goes UP (instead of cancelling into a jump)
   if(p.state==='claw'&&P.jump&&p.combo>=1&&p.combo<7){P.jump=0;BUF.jump=-9;P.attack=1;BUF.attack=now;p.k29fu=1}
   // turn round mid-combo: same chain, same next hit, onto the enemy behind
   const want=P.left?-1:P.right?1:0;
   if(want&&want!==p.face&&TURN.has(p.state)){p.face=want;p.vx=want*Math.abs(p.vx)*.6;C.atk++;K29.turns++;if(C.n>0)C.t=Math.max(C.t,C.max);
    if(p.state==='claw'){setAnim(p.anim,true);p.t=Math.min(p.t,.02)}for(let i=0;i<6;i++)sparks.push({x:p.x,y:p.y-60-Math.random()*60,vx:want*(120+Math.random()*200),vy:(Math.random()-.5)*120,l:.25,c:'#fff'})}
   else if(want&&want!==p.tw0&&p.state==='tailwhip'){p.tw0=want;C.atk++;K29.turns++}
   // air SKY SWIPE: up + claw in the air hits what is above
   if(p.state==='airswipe'&&(K.up)&&p.t>.05&&!p.k29up){p.k29up=true;slash('up','#bfe8ff',{lvl:4,scale:1.1,dy:120,dx:30});for(const d of dummies)if(d.alive&&!d.benched&&d.y<p.y-40&&d.y>p.y-360&&Math.abs(d.x-p.x)<150)hitDummy(d,'airup',Math.sign(d.x-p.x)||p.face)}
   if(p.state!=='airswipe')p.k29up=false;
   // cartwheel claw arcs instead of the old blue swirl
   if(p.state==='airspin'){p.vy=p.t<.4?Math.min(p.vy,-20):p.vy;if((p.t>=.08&&p.t-dt<.08)||(p.t>=.24&&p.t-dt<.24)||(p.t>=.4&&p.t-dt<.4)){slash(p.t<.2?'over':p.t<.3?'flat':'low','#ffe9a8',{lvl:5,scale:1.25,dx:60});spark(p.x+p.face*80,p.y-80,8,['#fff','#ffe9a8'],220)}
    for(let i=ghosts.length-1;i>=0&&i>ghosts.length-4;i--)if(ghosts[i].blue&&ghosts[i].f&&FR.airspin&&FR.airspin.includes(ghosts[i].f))ghosts[i].blue=0}
   // defence input
   const dirH=K.right&&!K.left?1:K.left&&!K.right?-1:0;
   if(OKDEF.has(p.state)&&p.state!=='kguard'&&p.state!=='respawn'){
    if(P.dodge&&p.kdCool<=0)startDodge(dirH||-p.face);
    else if(P.guard&&p.ground)startGuard()}
   if(p.state==='kguard'){if(p.t>2)p.t=1;p.vx*=Math.pow(.01,dt);if(!K.guard){if(p.t<.16&&!p.kgHit&&p.kdCool<=0)startDodge(dirH||-p.face);else{p.state='normal'}}
    else if(P.attack&&p.t>.05){p.state='normal';p.combo=0;startClaw()}}
   else if(p.state==='kdodge'){p.vx*=Math.pow(.03,dt);if(p.t%.02<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.3});if(p.t>.26){p.state='normal';p.noFlick=false}}
   else if(p.state==='kcounter'){const d=p.ctg&&p.ctg.alive?p.ctg:null;
    if(p.t<.12&&d){const tx=d.x-p.face*100;p.x+=(tx-p.x)*Math.min(1,dt*18);if(p.t%.02<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.25,blue:1})}
    if(p.t>=.12&&!p.shot){p.shot=true;C.atk++;slash('cross','#7fffd4',{lvl:7,scale:1.6,col2:'#ffffff',dx:90});if(d){d.hp=Math.max(2,d.hp);hitDummy(d,'kcounter',p.face)}
     else areaHit(p.x+p.face*90,p.y,160,'kcounter');waves.push({x:p.x+p.face*90,y:p.y-80,r:10,l:1,big:true});shake=Math.max(shake,16)}
    p.vx*=Math.pow(.05,dt);if(p.t>.5){p.state='normal';p.noFlick=false}}}
 }catch(e){console.warn('k29',e)}
 _pre(dt)};
// ---------- impact stars + jab streaks + guard shield (drawn on top) ----------
const _fx=drawFx;drawFx=function(){_fx();try{ctx.save();ctx.globalCompositeOperation='lighter';
 for(const o of K29.imp){if(o.streak){if(o.d>0){o.d-=1/60;continue}const a=Math.max(0,o.l),x1=o.x+o.face*o.len*(1-a*.3);const gr=ctx.createLinearGradient(o.x,0,x1,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,o.col);
   ctx.globalAlpha=a;ctx.strokeStyle=gr;ctx.lineWidth=5*a+1;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(x1,o.y);ctx.stroke();continue}
  const u=1-o.l,R=(o.big?70:44)*(.45+u*.9);ctx.globalAlpha=Math.min(1,o.l*1.6);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(o.x,o.y,R*.32*(1-u*.5),0,6.283);ctx.fill();
  ctx.strokeStyle=o.col;ctx.lineWidth=(o.big?7:5)*o.l;ctx.beginPath();for(let i=0;i<8;i++){const a=o.rot+i*.785,r0=R*.3,r1=R*(i%2?.7:1.15);ctx.moveTo(o.x+Math.cos(a)*r0,o.y+Math.sin(a)*r0);ctx.lineTo(o.x+Math.cos(a)*r1,o.y+Math.sin(a)*r1)}ctx.stroke();
  ctx.lineWidth=3*o.l;ctx.beginPath();ctx.arc(o.x,o.y,R*.85,0,6.283);ctx.stroke()}
 if(base()&&p.state==='kguard'){const fl=p.kgHit?1:.55+.15*Math.sin(now*12),cx=p.x+p.face*48,cy=p.y-95;ctx.globalAlpha=fl*.5;const g=ctx.createRadialGradient(cx,cy,10,cx,cy,90);g.addColorStop(0,'rgba(190,230,255,.0)');g.addColorStop(.75,'rgba(190,230,255,.35)');g.addColorStop(1,'rgba(190,230,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,90,0,6.283);ctx.fill();ctx.globalAlpha=fl;ctx.strokeStyle=p.t<.2?'#7fffd4':'#cfe3ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x+p.face*10,cy,92,p.face>0?-1.1:Math.PI-1.1,p.face>0?1.1:Math.PI+1.1);ctx.stroke()}
 ctx.restore()}catch(_){}};
const _say=say;say=function(t){if(base()&&t==='AIR SPIN!')arguments[0]='CARTWHEEL CLAW!';return _say.apply(this,arguments)};
window.KITTY29=true;
})();
