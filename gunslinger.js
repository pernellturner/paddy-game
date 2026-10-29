// v20g – GUNSLINGER STYLE: a stylish two-pistol moveset for Gunslinger Paddy (form 5, UF 1).
// Original moves, family-friendly cartoon blasters (bright light-bolts, no gore).
(function(){
if(typeof UF==='undefined'||typeof nUpdate!=='function')return;
SM(5,'gs',{rapid:[16,1,'gs_m_rapid'],kickshot:[14,0,'gs_m_kickshot'],spinshot:[18,1,'gs_m_spinshot'],airrain:[14,1,'gs_m_airrain'],
 juggle:[14,1,'gs_m_juggle'],storm:[16,1,'gs_m_storm'],fireworks:[14,1,'gs_m_fireworks'],twosome:[12,1,'gs_m_twosome'],
 stomp:[12,0,'gs_m_stomp'],taunt:[7,0,'gs_m_taunt'],charge:[12,0,'gs_m_charge'],rocket:[14,1,'gs_m_rocket']});
Object.assign(KB,{ushotr:[70,-70,.08,.012],ushotj:[30,-560,.35,.03],ushotk:[560,-420,.2,.09],ushots:[180,-260,.12,.025],ushotd:[50,-160,.1,.02],
 ushotw:[720,-460,.25,.11],ushotf:[160,-380,.2,.03],ushott:[200,-200,.12,.025],ucannonr:[640,-760,.4,.12]});
Object.assign(NAMES,{ushotr:'TWIN PAW RAPID-FIRE!',ushotj:'GUN JUGGLE!',ushotk:'POINT-BLANK KICK SHOT!',ushots:'SPIN SHOT!',ushotd:'AIR RAIN!',
 ushotw:'WILD STOMP!',ushotf:'FIREWORKS!',ushott:'TWOSOME TIME!',ucannonr:'CANNON ROCKET!'});
const G={hold:0,t:0,fire:0,tg:null,n:0};window.GSTYLE=G;
const GS=['gsrapid','gsrain','gsjug','gsspin','gsstorm','gsfire','gstwo','gskick','gsstomp','gsrocket','gsoff','gstaunt'];
const NO=['lkult','ufin','nmorph','respawn','ledge','bunny','lk','umeowc','umeow','hurt','ko','moon','moonl','shadowfin','victory'];
const free=()=>p.uf===1&&!p.dead&&!(typeof CINE!=='undefined'&&CINE.includes(p.state))&&!NO.includes(p.state)&&!(window.MOON&&MOON.on)&&(!GS.includes(p.state)||G.t>.2);
const pop=v=>{try{SND.play('gun_pop',{v:v||.55,r:.9+Math.random()*.25,gap:.035})}catch(_){bang&&bang()}};
const cann=()=>{try{SND.play('cannon',{v:.85,gap:.15})}catch(_){boom()}};
const juggledT=r=>dummies.filter(d=>d.alive&&!d.benched&&d.y<GROUND-90&&Math.abs(d.x-p.x)<(r||520)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0]||null;
const chain=()=>{if(typeof CHN==='undefined')return;const t=now;CHN.n=(t-CHN.t<2.2&&CHN.n>0)?CHN.n+1:1;CHN.t=t;if(CHN.n>1){CHN.show=1.6;CHN.best=Math.max(CHN.best||0,CHN.n)}};
function go(st,anim,nm,col){act(st,'gs_'+anim,{say:nm,c:col||'#ffd27a'});G.t=0;G.fire=0;G.n=0;C.atk=(C.atk||0)+1;extend();chain()}
const gx=s=>p.x+s*95, gy=()=>p.y-92;
function shot(dir,ang,kb,o){const sp=1500,a=ang||0;const vx=Math.cos(a)*sp*dir,vy=Math.sin(a)*sp;
 uShot(Object.assign({x:p.x+dir*90,y:gy()+Math.sin(a)*40,vx,vy,face:dir,kb,l:.5},o||{}));muzzle(p.x+dir*100,gy()+Math.sin(a)*40,.7)}
function aimAt(d){const dx=d.x-p.x,dy=(d.y-(d.h||150)*.5)-gy();return {dir:Math.sign(dx)||p.face,ang:Math.atan2(dy,Math.abs(dx)||1)}}
// ---------- triggers (run before the form reads presses) ----------
function trig(){
 const air=!p.ground,UP=K.up||(K.jump&&(p.ground||p.state==='jcharge')); // ▲ – or hold JUMP on touch screens
 // GUN JUGGLE: claw with a juggled enemy in range
 if(P.attack){const jg=juggledT(560);if(jg&&!UP&&!K.down&&(air?jg.y<p.y+40:(jg.y<p.y-170&&Math.abs(jg.x-p.x)>190))){delete P.attack;G.tg=jg;go('gsjug','juggle','GUN JUGGLE!','#ffe08a');return true}}
 if(P.tail){
  if(UP){delete P.tail;delete P.jump;go('gsfire','fireworks','FIREWORKS!','#ff9bd0');return true}
  if(air&&K.down){delete P.tail;p.vy=-260;go('gsstorm','storm','RAIN STORM!','#9fe8ff');return true}
  if(air){delete P.tail;p.vy=Math.min(p.vy,-220);go('gsspin','spinshot','SPIN SHOT!');return true}
  if(K.down){delete P.tail;go('gstwo','twosome','TWOSOME TIME!','#ffd27a');return true}}
 if(P.blink){
  if(UP){delete P.blink;delete P.jump;go('gstaunt','taunt',['YEE-PAW!','TOO SLOW, PARTNER!','PURR-FECT AIM!'][Math.floor(Math.random()*3)],'#fff3a0');return true}
  const d=nTarget(200);if(d&&Math.abs(d.x-p.x)<200){delete P.blink;p.face=Math.sign(d.x-p.x)||p.face;go('gskick','kickshot','POINT-BLANK KICK SHOT!','#ffb35a');return true}}
 if(P.special){
  if(UP){delete P.special;go('gsrocket','rocket','CANNON ROCKET RIDE!','#ff8a3a');try{SND.play('moon_rocket_launch',{v:.7,gap:.4})}catch(_){};return true}
  if(K.down&&!air&&!juggledT(430)){delete P.special;go('gsstomp','stomp','WILD STOMP!','#ffcf6a');return true}}
 // hold claw: rapid-fire on the ground, air rain in the air
 if(K.attack&&G.hold>.32&&!GS.includes(p.state)){G.hold=-9;if(air){go('gsrain','airrain','AIR RAIN!','#9fe8ff')}else go('gsrapid','rapid','TWIN PAW RAPID-FIRE!');return true}
 return false}
// ---------- per-state ticks ----------
function tick(dt){const st=p.state,t=G.t;G.t+=dt;G.fire-=dt;const f=p.face;
 const end=(a)=>{p.state='normal';p.t=0;setAnim(a||(p.ground?'idle':'jump'),true)};
 switch(st){
 case 'gsrapid':p.vx*=.8;if(G.fire<=0){G.fire=.065;G.n++;const s=G.n%2?1:-1;shot(f,(Math.random()-.5)*.12,'ushotr',{y:gy()+(s>0?-8:10)});pop(.45)}
  if((!K.attack&&t>.35)||t>2.4)end();break;
 case 'gsrain':p.vy=Math.min(p.vy,40);if(G.fire<=0){G.fire=.08;G.n++;const a=.9+Math.random()*.5;shot(f,a,'ushotd',{l:.4});p.vy-=60;pop(.4)}
  if((!K.attack&&t>.3)||t>1.8||p.ground)end();break;
 case 'gsjug':{const d=G.tg;p.vx*=.85;if(!p.ground)p.vy=Math.min(p.vy,30);
  if(d&&d.alive&&G.fire<=0){G.fire=.11;G.n++;const q=aimAt(d);p.face=q.dir;shot(q.dir,q.ang,'ushotj');pop(.55);if(d.y<GROUND-60&&d.vy>-200)d.vy=-260}
  if(t>.62||!d||!d.alive)end();break}
 case 'gsspin':p.vy=Math.min(p.vy,60);if(G.fire<=0){G.fire=.06;G.n++;p.face=G.n%4<2?1:-1;shot(p.face,(G.n%2?.25:-.1),'ushots');pop(.4)}
  if(t>.6)end();break;
 case 'gsstorm':p.vy=Math.max(Math.min(p.vy+600*dt,140),-400);p.vx*=.9;if(G.fire<=0){G.fire=.05;G.n++;const s=G.n%2?1:-1;shot(s,.55+Math.random()*.7,'ushotd',{l:.45});pop(.35)}
  if(t>1.1||(p.ground&&t>.2)){spark(p.x,p.y,12,['#9fe8ff','#fff'],300);end()}break;
 case 'gsfire':p.vx*=.8;if(G.fire<=0){G.fire=.055;G.n++;const a=G.n*.7;const dir=Math.cos(a)>=0?1:-1;shot(dir,-Math.abs(Math.sin(a))*1.2,'ushotf',{l:.45,col:['#ff6ad5','#6ad5ff','#ffe36a','#7dff8a'][G.n%4]});
   spark(p.x+Math.cos(a)*120,gy()-Math.abs(Math.sin(a))*90,5,['#ff6ad5','#6ad5ff','#ffe36a','#fff'],260);pop(.4)}
  if(t>1)end();break;
 case 'gstwo':p.vx*=.8;if(G.fire<=0){G.fire=.09;G.n++;
   let L=null,R=null;for(const d of dummies){if(!d.alive||Math.abs(d.x-p.x)>800)continue;if(d.x<p.x){if(!L||d.x>L.x)L=d}else if(!R||d.x<R.x)R=d}
   const qa=R?aimAt(R).ang:0,qb=L?aimAt(L).ang:0;shot(1,qa,'ushott');shot(-1,qb,'ushott');pop(.5)}
  if(t>.75)end();break;
 case 'gskick':p.vx=t<.15?f*260:p.vx*.8;if(t>.12&&!G.n){G.n=1;uStrike('ushotk',170,190,false,'POINT-BLANK KICK SHOT!');shake=Math.max(shake,6)}
  if(t>.24&&G.n===1){G.n=2;shot(f,0,'ubig',{s:1.8,l:.35});muzzle(p.x+f*120,gy(),2);cann();shake=Math.max(shake,10);p.vx=-f*300}
  if(t>.5)end();break;
 case 'gsstomp':p.vx*=.8;if(t>.2&&!G.n){G.n=1;shake=Math.max(shake,14);uStrike('ushotw',240,200,false,'WILD STOMP!');
   for(let i=0;i<7;i++)shot(f,-.45+i*.15,'ushotw',{l:.22,s:1.3});muzzle(p.x+f*130,gy(),2.4);cann();spark(p.x,p.y,14,['#ffcf6a','#fff'],360);p.vx=-f*380}
  if(t>.6)end();break;
 case 'gsrocket':if(t<1){p.vx=f*900;p.vy=Math.min(p.vy,0)-(p.ground?0:20);p.inv=Math.max(p.inv||0,.2);
   if(G.fire<=0){G.fire=.05;spark(p.x-f*90,p.y-30,4,['#ff8a3a','#ffe36a','#fff'],220);uStrike('ucannonr',150,200,true)}}
  else{G.n=1;cann();uRing(p.x+f*120,p.y-60,'#ff8a3a','#fff',true);for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<260)uHitD(d,'ucannonr',f);shake=Math.max(shake,16);
   p.vy=-720;p.vx=-f*160;p.ground=false;p.state='gsoff';G.t=0;setAnim('jump',true);say('…AND LEAP OFF!','#ffd27a')}break;
 case 'gsoff':if(t>.35||p.ground)end();break;
 case 'gstaunt':p.vx*=.8;if(t>.45&&!G.n){G.n=1;spark(p.x,p.y-150,14,['#fff3a0','#ffd27a','#fff'],260);if(C.n>0)C.t=C.max}
  if(t>1)end();break;
 }}
const _nu=nUpdate;nUpdate=function(dt){
 if(p.uf===1){if(K.attack&&G.hold>=0)G.hold+=dt;else if(!K.attack)G.hold=0;
  if(free())trig();if(GS.includes(p.state))tick(dt)}
 _nu(dt)};
// rename the charge-shot levels and use the charge frames
if(typeof ufMeow==='function'){const _um=ufMeow;ufMeow=function(L){const r=_um.apply(this,arguments);if(p.uf===1){say(['CHARGE SHOT LV1!','CHARGE SHOT LV2!','CHARGE SHOT LV3!!'][Math.min(2,L|0)],'#ffd27a');if(FR.gs_charge&&L<2)setAnim('gs_charge',true);chain()}return r}}
// ---------- moves list ----------
const _bl=buildList;buildList=function(){_bl();const el=document.getElementById('clist');if(!el)return;const h3=el.querySelector('h3');if(!h3)return;
 h3.insertAdjacentHTML('afterend',`<div id="gstyle" style="background:linear-gradient(135deg,#3a2310,#4a1e10);border:2px solid #ffd27a;border-radius:12px;padding:6px 10px;margin:6px 0 10px">
 <h3 style="color:#ffd27a;margin:2px 0">🤠 GUNSLINGER STYLE (Gunslinger Paddy)</h3>
 <p class="tip" style="margin:3px 0"><b>TWIN PAW RAPID-FIRE</b> – hold <b>CLAW</b> · <b>AIR RAIN</b> – hold <b>CLAW</b> in the air (floats!) · <b>GUN JUGGLE</b> – <b>CLAW</b> near a launched enemy keeps him up</p>
 <p class="tip" style="margin:3px 0"><b>SPIN SHOT</b> – <b>TAIL</b> in the air · <b>RAIN STORM</b> – <b>▼+TAIL</b> in the air · <b>FIREWORKS</b> – <b>▲(or hold JUMP)+TAIL</b> · <b>TWOSOME TIME</b> – <b>▼+TAIL</b> (both ways at once)</p>
 <p class="tip" style="margin:3px 0"><b>POINT-BLANK KICK SHOT</b> – <b>BLINK</b> right next to an enemy · <b>STYLISH TAUNT</b> – <b>▲(or hold JUMP)+BLINK</b> · <b>WILD STOMP</b> – <b>▼+MEOW</b> · <b>CANNON ROCKET RIDE</b> – <b>▲(or hold JUMP)+MEOW</b> · <b>CHARGE SHOT LV1-3</b> – hold <b>MEOW</b></p>
 <p class="tip" style="margin:3px 0">Every style move adds to the <b>x2 · x3 CHAIN!</b> counter – mix them up!</p></div>`)};
buildList();
window.GUNSLINGER20G=true;})();
