// Paddy move test – plain canvas, no libraries
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),lbl=document.getElementById('lbl');
const VW=960,VH=540,GROUND=470,WALL_X=880,WT=230,SC=0.8; // world units
let F={},IMG={},FR={};
let scale=1,offX=0,offY=0;
function resize(){const d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;
 scale=Math.min(cv.width/VW,cv.height/VH);offX=(cv.width-VW*scale)/2;offY=(cv.height-VH*scale)/2;}
addEventListener('resize',resize);resize();
['gesturestart','dblclick','contextmenu'].forEach(e=>document.addEventListener(e,ev=>ev.preventDefault()));
document.addEventListener('touchmove',e=>{if(!e.target.closest('#moves'))e.preventDefault()},{passive:false});
// ---------- animations: name:[sheet, frame indices (null = all), fps, loop] ----------
const A={ // name:[sheet, frames (null=all), fps, loop]. o_* = original first-version sprites
 idle:['o_idle',null,3,1],walk:['o_walk',null,11,1],run:['o_run',null,12,1],
 start:['startstop',[0,1,2],16,0],stop:['startstop',[3,4,5],9,0],
 jump:['o_jump',null,8,0],fall:['o_fall',null,6,0],land:['o_land',null,10,0],djump:['doublejump',null,14,0],
 hardland:['hardland',[0,1,2],9,0],crouch:['o_crouch',null,1,0],slide:['slide',null,10,1],
 climb:['o_climb',null,8,1],walljump:['walljump',null,10,0],ledge:['ledge',null,7,0],
 dash:['o_dash',null,1,1],wingdash:['o_wingdash',null,1,1],
 stalk:['o_stalk',null,4,1],wiggle:['wiggle',null,14,1],pounce:['o_pounce',null,1,0],
 claw1:['o_claw1',null,1,0],claw2:['o_claw2',null,1,0],claw3:['o_claw3',null,12,0],
 finisher:['finisher',null,11,0],dashstrike:['o_dashstrike',null,1,0],uppercut:['uppercut',[0,2,4],9,0],
 airswipe:['o_airswipe',null,1,0],airspin:['o_airspin',null,14,1],dive:['o_dive',null,1,1],diveclaw:['o_diveclaw',null,1,0],
 tailwhip:['tailwhip',null,13,0],breath:['hiss',[0,1],3,0],meow:['o_roar',null,1,0],meowbig:['o_roar',null,1,0],jcharge:['wiggle',null,10,1],leapspin:['o_airspin',null,16,1],hurt:['o_hurt',null,1,0],victory:['victory',null,7,0],
 groom:['groom',null,7,1],stretch:['stretch',null,5,0],sitflick:['sitflick',null,7,1],sniff:['sniff',null,7,0],loaf:['loaf',null,3,1],
 hiss:['o_roar',null,1,0],swat:['swat',null,14,0],zoomies:['zoomies',null,20,1],catch:['catchrat',null,8,0],
 carry:['carryrat',null,11,1],carryidle:['carryrat',[0],1,0],chomp:['carryrat',[0],1,0],
 t_idle:['t_idle',null,8,1],t_run:['t_run',null,14,1],t_jump:['t_jump',[3,4,5],9,0],t_fall:['t_jump',[6,7],6,0],t_land:['t_jump',[8,9],12,0],
 t_claw:['t_claw',null,14,0],t_pounce:['t_pounce',null,12,1],t_roar:['t_roar',null,10,0],t_fire:['t_fireball',null,14,0],
 t_hurt:['t_hurt',null,12,0],t_victory:['t_victory',null,8,0],morph:['t_morph',null,8,0],unmorph:['t_morph',[7,6,5,4,3,2,1,0],10,0]};
const dur=a=>FR[a]?Math.max(FR[a].length/A[a][2],a==='blast'?.5:.3):.4;
// ---------- input ----------
const K={},P={};
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',
 Space:'jump',ArrowUp:'up',KeyW:'up',KeyX:'attack',KeyJ:'attack',KeyC:'special',KeyK:'special',KeyQ:'hunt',KeyV:'hunt',
 ShiftLeft:'run',ShiftRight:'run',KeyT:'tail',KeyL:'tail',KeyG:'tiger',KeyZ:'zoomies',KeyE:'hiss',KeyR:'swat',KeyF:'finisher',KeyH:'hurtTest',KeyY:'victory',KeyB:'eat',KeyN:'blink',ControlLeft:'blink',ControlRight:'blink'};
let touchMode=false;
function press(k){if(k==='up'){press('jump');K.up=1;return}if(!K[k]){P[k]=1;BUF[k]=now;tapDir(k)}K[k]=1}
function release(k){if(k==='up'){K.up=0;K.jump=0;return}K[k]=0}
addEventListener('keydown',e=>{const k=map[e.code];if(!k||document.body.classList.contains('ov'))return;e.preventDefault();if(e.repeat)return;touchMode=false;press(k)});
addEventListener('keyup',e=>{const k=map[e.code];if(k)release(k)});
document.querySelectorAll('.b[data-k]').forEach(b=>{const k=b.dataset.k;
 const on=e=>{e.preventDefault();touchMode=e.pointerType!=='mouse';press(k);b.classList.add('on')},off=e=>{e.preventDefault();release(k);b.classList.remove('on')};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});
// ---------- player ----------
const p={x:300,y:GROUND,vx:0,vy:0,face:1,ground:true,state:'normal',t:0,anim:'idle',fi:0,ft:0,combo:0,queued:false,cool:0,wall:false,jumps:0,dashCool:0,airDash:false,hunt:false,lastDash:-9,airSpin:false,airSwipe:false,
 idleT:0,rush:0,lives:9,hp:3,inv:0,blinkCool:0,keepT:0,keepCombo:0,jc:0,mc:0,rot:0,fallTop:GROUND,perfect:false,miss:false,blend:0,prevF:null,holdT:0,wj:0,dj:0,startT:0,tiger:0,carry:false,rats:0,shot:false,lastJump:-9};
let acted=false;const BUF={};const INSTANT=['hunt','tiger','hurtTest','victory','blink'];
const waves=[],shots=[],sparks=[],ghosts=[],texts=[];let shake=0;
const lastTap={left:-9,right:-9};let now=0;
function tapDir(k){if(k!=='left'&&k!=='right')return;if(now-lastTap[k]<0.28){P.dash=k;BUF.dash=now;lastTap[k]=-9}else lastTap[k]=now}
function say(t,c,big){if(p.rush>0)c='#ffd84d';texts.length=0;texts.push({t,c:c||'#fff',l:1,rot:(Math.random()-.5)*.18,big:!!big})}
function setAnim(a,force){if(!FR[a])a=p.tiger?'t_idle':'idle';if(p.anim!==a||force){const cf=(FR[p.anim]||[])[p.fi];if(cf&&p.anim!==a){p.prevF=cf;p.prevFace=p.face;p.prevX=p.x+(p.wall?40:0);p.prevY=p.y;p.blend=.1}p.anim=a;p.fi=0;p.ft=0}}
function act(state,anim,o){p.state=state;p.t=0;p.shot=false;acted=true;setAnim(anim,true);if(o&&o.say)say(o.say,o.c||'#fff')}
const floorAt=x=>(x>WALL_X-20&&x<WALL_X+100)?WT:GROUND;
const spark=(x,y,n,c,s=300)=>{for(let i=0;i<n;i++)sparks.push({x,y,vx:(Math.random()-.5)*s*2,vy:-Math.random()*s,l:.4,c:Array.isArray(c)?c[i%c.length]:c})};
function eat(){act('eat','chomp',{say:'CHOMP!',c:'#ffe14d'});p.vx=0}
const puffs=[];
function dropRat(){if(!p.carry)return;p.carry=false;const r=rats.find(r=>r.gone);if(r){Object.assign(r,{gone:0,x:p.x+p.face*40,y:GROUND,dir:p.face,scare:1.5})}say('Rat escaped!','#ddd')}
// 6-hit claw: hits 1-3 chain on any press, 4-6 need a press in the last ~0.2s of the swing (PERFECT)
const CLAWS=[null,{a:'claw1',k:'down',lunge:150},{a:'claw1',k:'up',lunge:170},{a:'claw2',k:'down',lunge:220},{a:'claw2',k:'up',lunge:200},{a:'claw3',k:'down',lunge:240},{a:'claw3',k:'big',lunge:320}];
function startClaw(){C.atk++;p.combo=Math.min(6,p.combo+1);if(p.combo===1)p.qfin=false;const c=CLAWS[p.combo];act('claw',c.a);p.queued=false;p.perfect=false;p.miss=false;
 p.vx=p.face*c.lunge;shake=p.combo>=3?4+p.combo:3;slash(c.k);
 if(p.combo===3)say('TRIPLE CLAW!','#bfe8ff');if(p.combo===6)say('DOUBLE PAW SLASH!','#ffe14d',true);spark(p.x+p.face*70,p.y-70,6+p.combo*2,c.k==='big'?['#ffe14d','#fff']:'#bfe8ff')}
// ---- slash trails, sound waves, audio ----
const slashes=[],meows=[];
function slash(kind){const big=kind==='big';slashes.push({x:p.x+p.face*70,y:p.y-70,face:p.face,l:1,kind,
  a0:kind==='up'?.9:kind==='down'?-1.1:-.3,sweep:kind==='up'?-2.2:kind==='down'?2.2:2.0,r:big?95:70,col:big?'#ffe14d':kind==='down'?'#9fe8ff':'#ffffff'});
 if(big)slashes.push({x:p.x+p.face*70,y:p.y-60,face:p.face,l:1,kind,a0:.9,sweep:-2.2,r:90,col:'#ff9ad5'})}
let AC=null,muted=localStorage.getItem('paddyMute')==='1';
function meowSound(power){if(muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,len=.32+power*.35;
  const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';
  o.frequency.setValueAtTime(520,t);o.frequency.linearRampToValueAtTime(820+power*120,t+len*.35);o.frequency.linearRampToValueAtTime(430,t+len);
  f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(900,t);f.frequency.linearRampToValueAtTime(1700,t+len*.4);f.frequency.linearRampToValueAtTime(700,t+len);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05+.05*power,t+.04);g.gain.linearRampToValueAtTime(0,t+len);
  o.connect(f);f.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+len+.05)}catch(e){}}
function sonicMeow(c){const big=c>.15;meows.push({x:p.x+p.face*70,y:p.y-75,face:p.face,r:20,maxR:big?180+320*c:150,power:big?.6+c:.35,hit:new Set(),l:1,big});
 bubble={t:big?'SONIC MEOW!!':'MEOW!',l:1.1,big};meowSound(big?c:0);shake=big?6+10*c:3;
 for(const r of rats)if(!r.gone&&Math.abs(r.x-p.x)<(big?180+320*c:150)){r.scare=2.5;r.dir=Math.sign(r.x-p.x)||1}}
let bubble=null;
function blink(){if(p.blinkCool>0||['morph','unmorph','ledge','eat','catch'].includes(p.state))return false;
 const from=p.x;puffShadow(p.x,p.y);const kc=p.state==='claw'?p.combo:0;
 let nx=p.x+p.face*330;nx=Math.max(50,Math.min(WALL_X+60,nx));if(p.y>WT+2&&from<WALL_X-60&&nx>WALL_X-60)nx=WALL_X-60;
 p.x=nx;p.wall=false;p.inv=.6;p.blinkCool=.9;p.state='normal';p.t=0;p.vx=p.face*200;if(!p.ground)p.vy=Math.min(p.vy,0);
 if(kc){p.keepCombo=kc;p.keepT=.7}extend();puffShadow(p.x,p.y);say('SHADOW BLINK!','#c9a7ff');acted=true;return true}
function puffShadow(x,y){for(let i=0;i<16;i++){const a=Math.random()*6.28;puffs.push({x:x+Math.cos(a)*30,y:y-60+Math.sin(a)*40,vx:Math.cos(a)*70,vy:Math.sin(a)*50,r:12+Math.random()*12,l:.55,dark:1})}}
function loseLife(){p.lives--;say(p.lives>0?'LOST A LIFE ('+p.lives+' left)':'OUT OF LIVES!','#ffb0b0',true);act('respawn','hurt');p.vx=0;p.vy=-200;p.ground=false}
function finisher(){act('finisher','finisher',{say:'FINISHER!',c:'#c9a7ff'});p.vx=0;p.combo=0;shake=8;waves.push({x:p.x,y:p.y-40,r:10,l:1,big:true})}
function dashStrike(){act('dashstrike','dashstrike',{say:'DASH STRIKE!',c:'#ff9fd0'});p.vx=p.face*1150;if(!p.ground)p.vy=-120;shake=9;
 for(let i=0;i<14;i++)sparks.push({x:p.x+p.face*80,y:p.y-60+(Math.random()-.5)*60,vx:p.face*(300+Math.random()*400),vy:(Math.random()-.5)*200,l:.4,c:i%2?'#fff':'#ffb0e0'})}
function uppercut(){act('uppercut','uppercut',{say:'UPPERCUT!',c:'#ffe08a'});p.vy=-780;p.vx=p.face*120;p.ground=false;p.jumps=2;shake=6;spark(p.x+p.face*50,p.y-40,10,['#fff','#ffe08a'])}
function impact(big){areaHit(p.x,p.y,big?190:130,big?'dive':'diveclaw');shake=big?16:10;waves.push({x:p.x,y:p.y,r:10,l:1,big});for(let i=0;i<(big?26:14);i++)sparks.push({x:p.x+(Math.random()-.5)*60,y:p.y,vx:(Math.random()-.5)*(big?700:400),vy:-Math.random()*300,l:.5,c:i%3?'#d9c49a':'#fff'})}
function doDash(dir){p.face=dir==='right'?1:-1;p.wall=false;p.dashCool=.45;
 if(p.tiger){act('t_pounce','t_pounce',{say:'TIGER POUNCE!',c:'#ffb040'});p.vy=-420;p.vx=p.face*720;p.ground=false;return}
 if(!p.ground&&p.jumps>=2&&!p.airDash){p.airDash=true;act('wingdash','wingdash',{say:'WINGED DASH!',c:'#8fe0ff'});p.vx=p.face*1000;p.vy=-60;shake=6}
 else{act('dash','dash',{say:'DASH!'});p.vx=p.face*900;if(!p.ground)p.vy=Math.min(p.vy,0);shake=3}}
function hurtMe(){comboEnd(true);p.hp--;if(p.hp<=0){p.hp=3;dropRat();p.wall=false;loseLife();return}dropRat();p.wall=false;act('hurt',p.tiger?'t_hurt':'hurt',{say:'OUCH!',c:'#ff8080'});p.vy=-400;p.vx=-p.face*200;p.ground=false}
function victory(){act('victory',p.tiger?'t_victory':'victory',{say:'VICTORY!',c:'#ffe14d'});p.vx=0;spark(p.x,p.y-80,24,['#ffe14d','#fff','#ff9ad5'],400)}
function morph(){p.wall=false;p.hunt=false;dropRat();huntBtn&&huntBtn.classList.remove('lit');act('morph','morph',{say:'FIRE TIGER!',c:'#ff9a2e'});p.vx=0;shake=10;waves.push({x:p.x,y:p.y,r:10,l:1,big:true})}
function shoot(fire){shots.push({x:p.x+p.face*110,y:p.y-60,vx:p.face*(fire?700:620),l:1.6,a:0,hit:new Set(),fire});shake=8}
const MANNER=['groom','stretch','sitflick','sniff','loaf'];
const anyInput=()=>Object.keys(P).length>0||K.left||K.right||K.down||K.jump;
const huntBtn=document.querySelector('[data-k=hunt]'),tigerBtn=document.querySelector('[data-k=tiger]');
function update(dt){
 now+=dt;p.t+=dt;p.cool-=dt;p.dashCool-=dt;p.wj-=dt;p.dj-=dt;p.startT-=dt;
 const dir=(K.right?1:0)-(K.left?1:0);p.holdT=dir?p.holdT+dt:0;
 // tiger timer
 if(p.tiger>0&&p.state!=='morph'){p.tiger-=dt;if(p.tiger<=0||P.tiger){p.tiger=0;act('unmorph','unmorph',{say:'back to Paddy',c:'#ffe08a'});p.vx=0}}
 else if(P.tiger&&!p.tiger&&!['morph','unmorph','hurt'].includes(p.state))morph();
 tigerBtn&&tigerBtn.classList.toggle('lit',p.tiger>0);
 if(p.rush>0){p.rush-=dt;if(Math.random()<dt*30)sparks.push({x:p.x+(Math.random()-.5)*120,y:p.y-Math.random()*130,vx:(Math.random()-.5)*40,vy:-60-Math.random()*60,l:.5,c:Math.random()<.5?'#ffd84d':'#fff'});if(p.rush<=0)say('rush over','#fff')}
 p.blend-=dt;
 for(const f of puffs){f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*30;f.l-=dt}for(let i=puffs.length-1;i>=0;i--)if(puffs[i].l<=0)puffs.splice(i,1);
 p.inv-=dt;p.blinkCool-=dt;p.keepT-=dt;
 if(P.blink)blink();
 if(P.hurtTest&&p.inv<=0&&p.state!=='respawn')hurtMe();
 if(P.victory&&p.ground&&p.state==='normal')victory();
 if(P.hunt&&!p.tiger){p.hunt=!p.hunt;say(p.hunt?'HUNT MODE':'hunt off','#ffe08a');huntBtn.classList.toggle('lit',p.hunt)}
 if(P.dash&&p.dashCool<=0&&['normal','land','zoomies'].includes(p.state)&&!(p.hunt&&p.ground)){if(p.carry)dropRat();doDash(P.dash)}
 // cancel windows: after a short commit time these moves can flow straight into the next one
 const CANCEL={meow:.2,claw:.12,airswipe:.12,swat:.12,tailwhip:.15,dashstrike:.2,uppercut:.16,land:0,hardland:.12,stop:0,blast:.42,hiss:.3,t_claw:.15,finisher:.6,airspin:.15,slide:.15};
 if(CANCEL[p.state]!=null&&p.t>CANCEL[p.state]){
  if(P.dash&&p.dashCool<=0){if(['claw','swat','tailwhip'].includes(p.state)&&!p.tiger){p.face=P.dash==='right'?1:-1;dashStrike()}else doDash(P.dash)}
  else if((P.jump&&p.ground)||(P.down&&!p.ground)||(P.attack&&(K.up||!p.ground)&&p.state!=='claw'&&p.state!=='airspin')||(P.attack&&K.up&&p.ground)||((P.special||P.tail)&&!['meow','hiss','finisher'].includes(p.state))){p.state='normal';p.combo=0}
 }
 const MAXT={zoomies:3,manner:5,hurt:3,respawn:4,mcharge:3.5,jcharge:4.5,superleap:2,morph:2,unmorph:2,ledge:1.5,victory:2.5,eat:2,catch:2,finisher:2.5};
 if(p.state!=='normal'&&p.t>(MAXT[p.state]||2.5)){console.warn('safety net: reset from',p.state);p.state='normal';p.wall=false;p.vx=0;p.combo=0;p.jc=0;p.mc=0;if(p.tiger<=0&&p.anim.startsWith('t_'))setAnim('idle')}
 const S=p.state,end=p.t>dur(p.anim);
 switch(S){
 case 'claw': {const H=p.combo>=3?.4:.26; p.vx*=Math.pow(.02,dt);
  if(P.attack){ if(p.combo<3)p.queued=true; else if(p.combo<6){ if(p.t>=H-.2&&!p.miss){p.perfect=true;p.queued=true} else if(!p.perfect)p.miss=true } }
  if(P.finisher&&p.combo>=2)p.qfin=true;
  if(p.qfin&&p.t>.15){p.qfin=false;finisher();break}
  if(p.queued&&(p.combo>=3?p.perfect:p.t>.18)){ if(p.perfect){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false});hitstop=Math.max(hitstop,.05)} startClaw() }
  else if(p.t>H+.06){p.state='normal';p.combo=0;p.cool=.08} } break;
 case 'finisher': p.vx=0;if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.finisher[p.fi],face:p.face,l:.2,blue:1});if(end){p.state='normal';p.cool=.2;areaHit(p.x+p.face*60,p.y,200,'finisher');shake=14;burst(p.x+p.face*80,p.y-60)} break;
 case 'mcharge': p.vx*=.8;p.mc=Math.min(1,p.t/1.2);if(p.t>.25&&p.t%.05<dt)sparks.push({x:p.x+p.face*70+(Math.random()-.5)*60,y:p.y-75+(Math.random()-.5)*60,vx:0,vy:0,l:.3,c:'#bfe8ff'});
  if(!K.special||p.t>3){const c=p.t<.25?0:p.mc;act('meow',c>0?'meowbig':'meow');p.mpow=c;sonicMeow(c);p.mc=0}break;
 case 'meow': p.vx=0;if(p.t>(p.mpow>0?.55:.3)){p.state='normal';p.cool=.15}break;
 case 'hurt': if(p.t>.6&&p.ground&&end)p.state='normal';break;
 case 'land': p.vx*=.8;if(p.t>.12)p.state='normal';break;
 case 'hardland': p.vx*=.7;if(end)p.state='normal';break;
 case 'stop': p.vx*=Math.pow(.02,dt);if(end||dir)p.state='normal';break;
 case 'slide': p.vx*=Math.pow(.35,dt);if(p.t%0.05<dt)sparks.push({x:p.x-p.face*30,y:p.y,vx:-p.face*80,vy:-60,l:.3,c:'#d9c49a'});if(P.jump){p.state='normal';p.vy=-650;p.ground=false;p.jumps=1}else if(p.t>.55||Math.abs(p.vx)<60)p.state='normal';break;
 case 'dash': if(p.ground){p.vy=0}else p.vy=Math.min(p.vy,120);
  if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.dash[p.fi],face:p.face,l:.25});
  if(P.attack){dashStrike();break}
  if(p.t>.22){p.state='normal';p.vx=p.face*300;p.lastDash=now} break;
 case 'wingdash': p.vy=-30;
  if(p.t%0.025<dt){ghosts.push({x:p.x,y:p.y,f:FR.wingdash[p.fi],face:p.face,l:.3,blue:1});for(let i=0;i<3;i++)sparks.push({x:p.x-p.face*60,y:p.y-60+(Math.random()-.5)*50,vx:-p.face*200,vy:(Math.random()-.5)*80,l:.4,c:i?'#5cc8ff':'#fff'})}
  if(p.t>.38){p.state='normal';p.vx=p.face*350} break;
 case 'dashstrike': p.vx*=Math.pow(.06,dt); if(!p.ground)p.vy=Math.min(p.vy,200);
  if(p.t%0.025<dt)ghosts.push({x:p.x,y:p.y,f:FR.dashstrike[p.fi],face:p.face,l:.28,blue:1});
  if(p.t>.38){p.state='normal'} break;
 case 'uppercut': if(p.t>.5||(p.ground&&p.t>.1))p.state='normal';break;
 case 'airswipe': p.vy=Math.min(p.vy,150); if(p.t>.3)p.state='normal'; if(p.ground&&p.t>.05)p.state='normal'; break;
 case 'airspin': p.vy=p.t<.45?-30:p.vy; p.vx*=.97; if(p.t%0.04<dt)ghosts.push({x:p.x,y:p.y,f:FR.airspin[p.fi],face:p.face,l:.2,blue:1});
  if(p.t%0.06<dt)sparks.push({x:p.x+Math.cos(p.t*20)*70,y:p.y-60+Math.sin(p.t*20)*50,vx:0,vy:0,l:.3,c:'#5cc8ff'});
  if(p.t>.6||p.ground)p.state='normal'; break;
 case 'dive': p.vx=0;p.vy=1400; if(P.attack||K.left||K.right){act('diveclaw','diveclaw',{say:'DIVE CLAW!',c:'#ffb070'});p.face=K.left?-1:K.right?1:p.face;p.vx=p.face*650;p.vy=950}
  else if(p.ground){impact(true);act('hardland','hardland')} if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.dive[p.fi],face:p.face,l:.2}); break;
 case 'diveclaw': p.vx=p.face*650;p.vy=950; if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.diveclaw[p.fi],face:p.face,l:.25,blue:1});
  if(p.ground){impact(false);burst(p.x+p.face*50,p.y-20);act('land','land');p.vx=p.face*200} break;
 case 'wiggle': p.vx=0;if(p.t>.55){act('pounce','pounce',{say:'POUNCE!',c:'#ffb070'});p.vy=-560;p.vx=p.face*600;p.ground=false} break;
 case 'pounce': if(p.ground&&p.t>.1){act('land','land');shake=7;burst(p.x+p.face*60,p.y-10)} break;
 case 'tailwhip': p.vx*=.85;{const ph=Math.floor(p.t/.11);p.face=p.tw0*(ph%2?-1:1);}if(p.t%.02<dt)sparks.push({x:p.x+Math.cos(p.t*30)*95,y:p.y-35+Math.sin(p.t*30)*22,vx:0,vy:-20,l:.3,c:'#fff7e0'});if(p.t>.46){p.face=p.tw0;p.state='normal'}break;
 case 'swat': p.vx=0;if(end)p.state='normal';break;
 case 'hiss': p.vx=0;if(p.t>.25&&!p.shot){p.shot=true;areaHit(p.x,p.y,230,'hiss');for(const r of rats)if(!r.gone&&Math.abs(r.x-p.x)<300){r.scare=2.5;r.dir=Math.sign(r.x-p.x)||1}waves.push({x:p.x+p.face*60,y:p.y-60,r:10,l:.8,big:false})} if(end)p.state='normal';break;
 case 'zoomies': p.vx=p.face*720;if(p.x<70||p.x>WALL_X-80){p.face*=-1;p.x=Math.max(71,Math.min(WALL_X-81,p.x))}
  if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.zoomies[p.fi],face:p.face,l:.25});if(p.t>2.4||P.jump||P.attack||P.down){p.state='normal';p.vx=p.face*300}break;
 case 'catch': p.vx*=.8;if(P.eat||P.attack)p.wantEat=true;if(end){p.state='normal';p.carry=true;say('GOT ONE!','#ffe14d',true);if(p.wantEat){p.wantEat=false;eat()}}break;
 case 'eat': p.vx=0;if(p.t>.35&&!p.shot){p.shot=true;p.carry=false;setAnim('groom');
   for(let i=0;i<14;i++){const a=Math.random()*6.28;puffs.push({x:p.x+p.face*60,y:p.y-60,vx:Math.cos(a)*90,vy:Math.sin(a)*60-30,r:10+Math.random()*10,l:.7})}
   spark(p.x+p.face*50,p.y-80,22,['#ffe14d','#fff','#ffb0e0'],350);say('YUM!','#ffd84d',true);shake=5}
  if(p.t>1.25){p.state='normal';p.rush=15;say('SNACK RUSH!','#ffd84d',true);waves.push({x:p.x,y:p.y,r:10,l:1,big:true});spark(p.x,p.y-60,30,['#ffd84d','#fff'],450)}break;
 case 'manner': if(anyInput()){p.state='normal';p.idleT=0}else if(p.t>(p.anim==='loaf'?4:p.anim==='groom'||p.anim==='sitflick'?2.5:dur(p.anim)+.3)){p.state='normal';p.idleT=0}break;
 case 'victory': p.vx=0;if(end&&p.t>1)p.state='normal';break;
 case 'ledge': {p.vx=0;p.vy=0;const L=.75,u=Math.min(1,p.t/L),e=x=>x*x*(3-2*x);
  const uy=e(Math.min(1,u/.6)),ux=e(Math.max(0,(u-.35)/.65));
  p.y=p.ly0+(WT-p.ly0)*uy;p.x=p.lx0+(WALL_X+30-p.lx0)*ux;p.fi=Math.min(FR.ledge.length-1,Math.floor(u*FR.ledge.length));p.ft=p.fi;
  if(u>=1){p.state='normal';p.y=WT;p.x=WALL_X+30;p.ground=true;p.vy=0}}break;
 case 'jcharge': {p.vx*=Math.pow(.05,dt);const JB=p.rush>0?1.14:1;
  if(P.attack&&!p.hunt){uppercut();break}
  if(p.t>.25){if(p.anim!=='jcharge')setAnim('jcharge');p.jc=Math.min(1,(p.t-.25)/1);if(p.t%.04<dt)sparks.push({x:p.x+(Math.random()-.5)*90,y:p.y-Math.random()*20,vx:(Math.random()-.5)*60,vy:-120-Math.random()*120,l:.4,c:p.jc>=1?'#ffe14d':'#bfe8ff'})}
  if(!K.jump||p.t>4){ if(p.t<.25){p.state='normal';p.vy=(p.hunt?-560:-720)*JB;p.ground=false;p.jumps=1;p.lastJump=now;setAnim('jump')}
   else{const c=p.jc;act('superleap','leapspin');p.vy=-(880+300*c)*JB;p.vx=p.face*Math.abs(p.vx);p.ground=false;p.jumps=1;p.lastJump=now;p.leapC=c;shake=6+8*c;
    waves.push({x:p.x,y:p.y,r:10,l:1,big:true});spark(p.x,p.y,20,['#fff','#bfe8ff','#ffe14d'],400);say('SUPER LEAP!','#bfe8ff',true);}
   p.jc=0} } break;
 case 'superleap': p.vx+=((K.right?1:0)-(K.left?1:0))*900*dt;p.vx*=Math.pow(.5,dt);if(p.t%.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.leapspin[p.fi],face:p.face,l:.25,blue:1});
  if(p.vy>0||p.t>1.4){p.state='normal'}break;
 case 'respawn': p.vx*=.9;if(p.t>.9&&p.t-dt<=.9){p.x=300;p.y=GROUND-260;p.vy=0;p.inv=2;if(p.lives<=0){p.lives=9;say('9 MORE LIVES!','#ffe14d',true)}puffShadow(p.x,p.y);spark(p.x,p.y-60,24,['#fff','#ffe14d'],300)}
  if(p.t>.9&&p.ground){p.state='normal';setAnim('idle')}break;
 case 'morph': p.vx=0;if(p.t%0.05<dt)spark(p.x+(Math.random()-.5)*80,p.y-40,2,['#ff9a2e','#ffe14d'],250);if(end){p.state='normal';p.tiger=20}break;
 case 'unmorph': p.vx=0;if(end)p.state='normal';break;
 case 't_claw': p.vx*=.85;if(P.attack)p.queued=true;if(p.t>.3&&p.queued){act('t_claw','t_claw');p.queued=false;C.atk++;spark(p.x+p.face*90,p.y-70,8,['#ff9a2e','#ffe14d'])}else if(end)p.state='normal';break;
 case 't_pounce': if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.t_pounce[p.fi],face:p.face,l:.25,blue:1});if(p.ground&&p.t>.1){act('land','t_land');shake=9;burst(p.x+p.face*60,p.y-10,1)}break;
 case 't_roar': p.vx=0;if(p.t>.3&&!p.shot){p.shot=true;areaHit(p.x,p.y,280,'roar');shake=14;waves.push({x:p.x+p.face*80,y:p.y-60,r:10,l:1,big:true});for(const r of rats)if(!r.gone&&Math.abs(r.x-p.x)<350){r.scare=3;r.dir=Math.sign(r.x-p.x)||1}}if(end)p.state='normal';break;
 case 't_fire': p.vx=0;if(p.t>.4&&!p.shot){p.shot=true;shoot(true)}if(end){p.state='normal';p.cool=.2}break;
 }
 if(p.state==='normal'){
  const T=p.tiger>0,running=K.run||(touchMode&&p.holdT>.6)||T,spd=(p.hunt?110:(T?420:260*(running?1.6:1)))*(p.rush>0?1.4:1),JB=p.rush>0?1.14:1;
  if(p.carry&&P.down&&p.ground)dropRat();
  if(K.down&&p.ground&&!p.hunt&&Math.abs(p.vx)>300&&P.down&&!T){act('slide','slide',{say:'SLIDE!'});}
  else if(K.down&&p.ground&&!p.hunt&&!T){p.vx*=.7;setAnim('crouch');}
  else{p.vx+=(dir*spd-p.vx)*Math.min(1,dt*(p.ground?(dir?7:9):4));if(dir&&!p.wall)p.face=dir;}
  if(p.state==='normal'){
  if(p.ground&&!dir&&Math.abs(p.vx)>330&&!p.hunt&&!T&&!p.carry){act('stop','stop')}
  if(p.ground&&dir&&running&&Math.abs(p.vx)<40&&!p.hunt&&!T&&!p.carry)p.startT=.18;
  // wall climb: hold → to climb, release to cling, ← / jump to leap off, ↓ to drop
  if(!T&&!p.wall&&p.y>WT+10&&p.x>=WALL_X-62&&K.right&&!K.down&&!p.hunt){p.wall=true;dropRat();p.jumps=0;p.airDash=false;say('CLIMB!','#ffe08a')}
  if(p.wall){p.face=1;p.vx=0;
   if(K.down){p.wall=false}
   else if(P.jump||K.left){p.wall=false;p.vy=-650;p.vx=-340;p.face=-1;p.jumps=1;p.wj=.45;setAnim('walljump');say('WALL JUMP!');extend('WALL JUMP!')}
   else{p.vy=K.right?-190:35;
    const cf=FR.climb[p.fi]||FR.climb[0];if(p.y-cf.ay*SC<WT-20&&K.right){p.lx0=p.x+40;p.ly0=p.y;p.wall=false;act('ledge','ledge',{say:'LEDGE GRAB!',c:'#ffe08a'});p.x=p.lx0}}}
  else if(P.jump&&p.ground){act('jcharge','crouch');p.jc=0}
  else if(P.jump&&!p.ground&&p.jumps<2){acted=true;p.vy=-650*JB;p.jumps=2;p.dj=.45;setAnim(T?'t_jump':'djump');p.anim=T?'t_jump':'djump';p.ft=0;say('DOUBLE JUMP!');extend();spark(p.x,p.y,10,'#fff',150)}
  if(p.state!=='normal'){}
  else if(T){ // ---- fire tiger moves ----
   if(P.attack&&(p.hunt||K.down)&&p.ground){act('t_pounce','t_pounce',{say:'TIGER POUNCE!',c:'#ffb040'});p.vy=-480;p.vx=p.face*650;p.ground=false}
   else if(P.attack)act('t_claw','t_claw',{say:'FLAME CLAW!',c:'#ff9a2e'});
   else if(P.special&&p.cool<=0)act('t_fire','t_fire',{say:'FIREBALL!',c:'#ff7a2e'});
   else if((P.tail||P.hiss||P.swat)&&p.ground)act('t_roar','t_roar',{say:'ROAR!',c:'#ffcf40'});
  }
  else if(!p.ground&&!p.wall&&P.down){ if(K.left||K.right){p.face=K.left?-1:1;act('diveclaw','diveclaw',{say:'DIVE CLAW!',c:'#ffb070'})} else act('dive','dive',{say:'DIVE BOMB!',c:'#ffd070'}) }
  else if(P.attack&&!p.wall&&(K.up||K.jump)&&(p.ground||(p.vy<0&&now-p.lastJump<.35))&&!p.hunt)uppercut();
  else if(P.attack&&!p.wall&&p.ground&&now-p.lastDash<.2&&!p.hunt)dashStrike();
  else if(P.attack&&!p.ground&&!p.wall){ if(p.jumps>=2&&!p.airSpin){p.airSpin=true;act('airspin','airspin',{say:'AIR SPIN!',c:'#8fe0ff'});p.vy=-200;shake=5}
   else if(!p.airSwipe){p.airSwipe=true;act('airswipe','airswipe',{say:'AIR SWIPE!',c:'#bfe8ff'});p.vy=Math.min(p.vy,-120);p.vx=p.face*Math.max(Math.abs(p.vx),280);spark(p.x+p.face*70,p.y-60,8,'#bfe8ff')} }
  else if((P.eat||P.attack)&&p.carry&&p.ground&&!p.wall)eat();
  else if(P.attack&&p.cool<=0&&!p.wall&&p.ground){
   if(p.hunt){act('wiggle','wiggle',{say:'wiggle wiggle...',c:'#ffe08a'})}
   else if(K.down){act('swat','swat',{say:'SWAT!',c:'#bfe8ff'})}
   else {p.combo=p.keepT>0?p.keepCombo:0;p.keepT=0;startClaw()} }
  else if(P.swat&&p.ground&&!p.wall)act('swat','swat',{say:'SWAT!',c:'#bfe8ff'});
  else if(P.finisher&&p.ground&&!p.wall)finisher();
  else if((P.special&&K.down||P.hiss)&&p.ground&&!p.wall)act('hiss','hiss',{say:'HISSS!',c:'#ffb0b0'});
  else if(P.special&&p.cool<=0&&!p.wall){if(p.carry)dropRat();act('mcharge','breath');p.mc=0}
  else if(P.tail&&!p.wall){p.tw0=p.face;act('tailwhip','tailwhip',{say:'TAIL WHIP!',c:'#ffd0a0'});p.vx=p.face*120;spark(p.x-p.face*60,p.y-40,8,'#fff')}
  else if(P.zoomies&&p.ground&&!p.wall){if(p.carry)dropRat();act('zoomies','zoomies',{say:'ZOOMIES!!',c:'#ff9ad5'})}
  }
  if(p.state==='normal'){
   if(T){ if(!p.ground)setAnim(p.vy<0?'t_jump':'t_fall');else setAnim(Math.abs(p.vx)>25?'t_run':'t_idle') }
   else if(p.wall)setAnim('climb');
   else if(!p.ground)setAnim(p.wj>0?'walljump':p.dj>0?'djump':p.vy<0?'jump':'fall');
   else if(p.hunt)setAnim('stalk');
   else if(!K.down){const v=Math.abs(p.vx);
    setAnim(p.carry?(v>25?'carry':'carryidle'):p.startT>0?'start':v>300?'run':v>25?'walk':'idle')}
   // idle mannerisms after ~4s of doing nothing
   if(p.ground&&!T&&!p.hunt&&!p.carry&&p.anim==='idle'&&!anyInput()){p.idleT+=dt;if(p.idleT>4){p.idleT=0;const m=MANNER[Math.floor(Math.random()*MANNER.length)];act('manner',m)}}else p.idleT=0;
  }
 }
 // physics
 if(!p.wall&&!['wingdash','dive','diveclaw','ledge'].includes(p.state))p.vy+=(p.state==='airspin'?600:1900)*dt;
 if(p.state!=='ledge'){p.x+=p.vx*dt;p.y+=p.vy*dt;}
 if(p.state!=='ledge'&&p.y>WT+2&&p.x>WALL_X-60&&p.x<WALL_X+60){p.x=WALL_X-60;if(p.state==='zoomies')p.face=-1} // wall side
 const fl=floorAt(p.x);
 if(p.state!=='ledge'){
 if(p.ground||p.vy<0||p.wall||p.state==='ledge')p.fallTop=p.y;
 // long fall: acrobatic flip just before touching down
 {const h=floorAt(p.x)-p.y;p.rot=(!p.ground&&p.state==='normal'&&!p.tiger&&p.vy>300&&floorAt(p.x)-p.fallTop>300&&h<170)?(1-h/170)*6.283*p.face:0}
 if(p.y>=fl&&p.vy>=0){p.y=fl;if(!p.ground&&p.state==='normal'){
   if(fl-p.fallTop>300&&!p.tiger){act('land','land',{say:'LANDS ON HIS FEET!',c:'#ffe08a'});spark(p.x,fl,14,['#fff','#d9c49a'],200);shake=4}
   else if(p.vy>300){act('land',p.tiger?'t_land':'land');spark(p.x,fl,8,'#d9c49a',120)}}
  p.vy=0;p.ground=true;p.jumps=0;p.airDash=false;p.airSpin=false;p.airSwipe=false;p.wj=0;p.dj=0}else p.ground=false;}
 if(p.x<50)p.x=50;if(p.x>WALL_X+60)p.x=WALL_X+60;
 // anim frames
 const fr=FR[p.anim]||FR.idle,a=A[p.anim]||A.idle;
 let fps=a[2];if(p.anim==='stalk')fps*=Math.min(1,Math.abs(p.vx)/80);if(p.anim==='climb'&&p.vy>=0)fps=0;
 if(p.state!=='ledge')p.ft+=dt*fps;p.fi=a[3]?Math.floor(p.ft)%fr.length:Math.min(fr.length-1,Math.floor(p.ft));
 if((p.anim==='jump'||p.anim==='t_jump')&&p.vy>-200)p.fi=fr.length-1;
 if(p.anim==='pounce')p.fi=p.vy<0?0:1;
 updRats(dt);
 for(const w of waves){w.r+=dt*(w.big?900:600);w.l-=dt*2.2}for(let i=waves.length-1;i>=0;i--)if(waves[i].l<=0)waves.splice(i,1);
 for(const g of ghosts)g.l-=dt;for(let i=ghosts.length-1;i>=0;i--)if(ghosts[i].l<=0)ghosts.splice(i,1);
 for(const t of texts)t.l-=dt*.8;for(let i=texts.length-1;i>=0;i--)if(texts[i].l<=0)texts.splice(i,1);
 for(const s of shots){for(const d of dummies)if(d.alive&&!s.hit.has(d)&&Math.abs(d.x-s.x)<50&&s.y>d.y-130&&s.y<d.y+10){s.hit.add(d);hitDummy(d,s.fire?'fireball':'blast',Math.sign(s.vx))}s.x+=s.vx*dt;s.l-=dt;s.a+=dt*14;if(s.x>WALL_X-20&&s.vx>0&&s.y>WT){s.l=0;burst(s.x,s.y,s.fire)}if(s.x<20){s.l=0;burst(s.x,s.y,s.fire)}if(Math.random()<.8)sparks.push({x:s.x,y:s.y+(Math.random()-.5)*30,vx:-s.vx*.1,vy:(Math.random()-.5)*60,l:.3,c:s.fire?'#ffb040':'#7fd4ff'})}
 for(let i=shots.length-1;i>=0;i--)if(shots[i].l<=0)shots.splice(i,1);
 for(const w of meows){w.r+=dt*(w.big?700:520);if(w.r>w.maxR)w.l-=dt*4;
  for(const d of dummies){const dx=d.x-w.x;if(d.alive&&!w.hit.has(d)&&Math.abs(dx)<w.r&&Math.abs(dx)>w.r-90&&Math.sign(dx)!==-w.face&&Math.abs(d.y-60-w.y)<160){w.hit.add(d);hitDummy(d,w.big?'sonicmeow':'meow',w.face);d.vx*=w.power*1.4;d.vy*=Math.min(1.6,.6+w.power)}}}
 for(let i=meows.length-1;i>=0;i--)if(meows[i].l<=0)meows.splice(i,1);
 if(bubble){bubble.l-=dt;if(bubble.l<=0)bubble=null}
 for(const sl of slashes)sl.l-=dt*4;for(let i=slashes.length-1;i>=0;i--)if(slashes[i].l<=0)slashes.splice(i,1);
 for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=400*dt;s.l-=dt}
 for(let i=sparks.length-1;i>=0;i--)if(sparks[i].l<=0)sparks.splice(i,1);
 meleeHits(dt);updDummies(dt);
 shake*=.85; // input buffer: an unused press stays live for ~0.15s so moves chain; any new action consumes it
 for(const k in P)if(acted||INSTANT.includes(k)||now-(BUF[k]??-9)>.15)delete P[k];acted=false;
 const nm={manner:p.anim,claw:p.anim.replace(/^claw(\d)/,'claw $1/3')}[p.state]||(p.state==='normal'?p.anim:p.state);
 if(now-errShown>3)lbl.textContent=(p.rush>0?'✨ SNACK RUSH '+Math.ceil(p.rush)+'s · ':'')+(p.tiger?'🔥 TIGER '+Math.ceil(p.tiger)+'s · ':'')+nm.replace(/^t_/,'')+(p.wall?' (wall)':'')+(p.hunt?' · HUNT':'')+(p.carry?' · carrying rat':'')+(p.rats?' · rats '+p.rats:'');
}
// ---------- rats ----------
const rats=[{x:150,dir:1},{x:520,dir:-1},{x:700,dir:1}].map(r=>({...r,y:GROUND,spd:70+Math.random()*40,t:Math.random()*5,scare:0,gone:0,hop:0}));
function updRats(dt){
 const catching=['claw','pounce','swat','diveclaw','wiggle','land'].includes(p.state)&&!p.tiger&&!p.carry;
 for(const r of rats){
  if(r.gone){if(!p.carry&&p.state!=='catch'){r.gone-=dt;if(r.gone<=0){r.gone=0;r.spd=70+Math.random()*40;r.x=Math.random()<.5?40:WALL_X-60;r.dir=r.x<100?1:-1;r.scare=0}}continue}
  r.t+=dt;r.scare-=dt;const near=Math.abs(r.x-p.x)<170&&p.y>GROUND-120;
  if(near&&r.scare<=0&&!p.hunt){r.scare=.8;r.dir=Math.sign(r.x-p.x)||1}
  if(r.scare<=0&&Math.random()<dt*.4)r.dir*=-1;
  const sp=r.scare>0?(p.hunt?150:260):r.spd*(Math.sin(r.t*1.3)>-.3?1:0);
  r.x+=r.dir*sp*dt;if(r.x<40){r.x=40;r.dir=1}if(r.x>WALL_X-30){r.x=WALL_X-30;r.dir=-1}
  r.hop=sp>0?Math.abs(Math.sin(r.t*18))*3:0;
  // catch: claw / pounce / swat close in front of Paddy
  const fx=p.x+p.face*55;
  if(catching&&p.state!=='land'&&Math.abs(r.x-fx)<60&&p.y>GROUND-70){r.gone=4;p.rats++;act('catch','catch',{say:'CAUGHT A RAT!',c:'#ffe14d'});p.vx=0;spark(r.x,GROUND-20,12,['#fff','#ffe14d']);break}
  if(p.tiger&&['t_claw','t_pounce'].includes(p.state)&&Math.abs(r.x-fx)<70){r.scare=3;r.dir=p.face;r.x+=p.face*30;spark(r.x,GROUND-20,6,'#ffb040')}
 }}
function drawRats(){for(const r of rats){if(r.gone)continue;ctx.save();ctx.translate(r.x,r.y-r.hop);ctx.scale(r.dir,1);
 ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(0,r.hop+2,20,4,0,0,6.28);ctx.fill();
 ctx.strokeStyle='#c98a8a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-16,-8);ctx.quadraticCurveTo(-34,-8+Math.sin(r.t*10)*8,-42,-16);ctx.stroke();
 ctx.fillStyle='#8b8580';ctx.beginPath();ctx.ellipse(0,-10,18,10,0,0,6.28);ctx.fill();ctx.beginPath();ctx.ellipse(16,-12,9,7,.3,0,6.28);ctx.fill();
 ctx.fillStyle='#e7a3a8';ctx.beginPath();ctx.arc(12,-19,4.5,0,6.28);ctx.fill();ctx.beginPath();ctx.arc(25,-10,2,0,6.28);ctx.fill();
 ctx.fillStyle='#222';ctx.beginPath();ctx.arc(19,-14,1.8,0,6.28);ctx.fill();
 ctx.strokeStyle='#6f6a66';ctx.lineWidth=2;const l=Math.sin(r.t*18)*4;ctx.beginPath();ctx.moveTo(-8,-2);ctx.lineTo(-8+l,1);ctx.moveTo(8,-2);ctx.lineTo(8-l,1);ctx.stroke();ctx.restore()}}
function burst(x,y,fire){shake=10;for(let i=0;i<24;i++){const a=Math.random()*6.28,v=100+Math.random()*300;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5,c:i%2?'#fff':fire?'#ff9a2e':'#5cc8ff'})}}
function drawFrame(f,x,y,face,alpha){const im=f&&IMG[f.f];if(!im)return;ctx.save();if(alpha!=null)ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(face*SC,SC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#87c6f0';ctx.fillRect(0,0,cv.width,cv.height);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
 ctx.setTransform(scale,0,0,scale,offX+sx*scale,offY+sy*scale);
 const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,p.tiger?'#ffc89a':'#9fd6f7');g.addColorStop(1,p.tiger?'#ffe8c8':'#d8f0ff');ctx.fillStyle=g;ctx.fillRect(-500,0,VW+1000,VH);
 ctx.fillStyle='#6dbb4a';ctx.fillRect(-500,GROUND,VW+1000,14);ctx.fillStyle='#b98a55';ctx.fillRect(-500,GROUND+14,VW+1000,200);
 // wall
 ctx.fillStyle='#8a7a6a';ctx.fillRect(WALL_X,WT,80,GROUND-WT);ctx.strokeStyle='#6c5e50';ctx.lineWidth=2;
 for(let y=WT;y<GROUND;y+=28){ctx.beginPath();ctx.moveTo(WALL_X,y);ctx.lineTo(WALL_X+80,y);ctx.stroke();const o=(y/28)%2?20:50;ctx.beginPath();ctx.moveTo(WALL_X+o,y);ctx.lineTo(WALL_X+o,y+28);ctx.stroke()}
 ctx.fillStyle='#fff8';ctx.font='14px system-ui';ctx.fillText('climb wall →',WALL_X-60,WT-140);
 drawDummies();drawRats();
 // shadow
 const hgt=floorAt(p.x)-p.y;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(p.x,floorAt(p.x)+3,60*Math.max(.4,1-hgt/400),9,0,0,6.28);ctx.fill();
 for(const g of ghosts){const im=g.f&&IMG[g.f.f];if(!im)continue;ctx.save();ctx.globalAlpha=Math.min(1,g.l*(g.blue?2:1.6));if(g.blue)ctx.globalCompositeOperation='lighter';ctx.translate(g.x,g.y);ctx.scale(g.face*SC,SC);ctx.drawImage(im,-g.f.ax,-g.f.ay);ctx.restore()}
 // player (snack-rush aura, then a short crossfade from the previous animation)
 if(p.rush>0){const pul=1+Math.sin(now*10)*.08,a=Math.min(1,p.rush/2);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*a;
  const gg=ctx.createRadialGradient(p.x,p.y-60,10,p.x,p.y-60,110*pul);gg.addColorStop(0,'rgba(255,220,90,.9)');gg.addColorStop(1,'rgba(255,180,0,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(p.x,p.y-60,110*pul,0,6.28);ctx.fill();ctx.restore()}
 if(p.blend>0&&p.prevF)drawFrame(p.prevF,p.prevX,p.prevY,p.prevFace,(p.hunt?.55:1)*p.blend/.1);
 const sq=p.state==='eat'&&p.t<.35?1+Math.sin(p.t*40)*.06:1;
 ctx.save();ctx.translate(p.x,p.y-(p.rot?60:0));ctx.rotate(p.rot||0);ctx.scale(2-sq,sq);ctx.translate(-p.x,-p.y+(p.rot?60:0));if(p.inv>0&&Math.floor(now*20)%2)ctx.globalAlpha=.45;
 drawFrame((FR[p.anim]||FR.idle)[p.fi],p.x+(p.wall?40:0),p.y,p.face,p.hunt?.55:(p.blend>0?1-.5*p.blend/.1:null));ctx.restore();
 for(const f of puffs){ctx.globalAlpha=Math.max(0,f.l)*(f.dark?.8:1);ctx.fillStyle=f.dark?'#3a2d4f':'#fff';ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.28);ctx.fill()}ctx.globalAlpha=1;
 // shots
 for(const s of shots){ctx.save();ctx.translate(s.x,s.y);ctx.globalCompositeOperation='lighter';
  const r=26+Math.sin(s.a)*4;const gg=ctx.createRadialGradient(0,0,2,0,0,r*1.8);gg.addColorStop(0,'#fff');gg.addColorStop(.35,s.fire?'#ffb040':'#7fdcff');gg.addColorStop(1,s.fire?'rgba(255,60,0,0)':'rgba(40,120,255,0)');
  ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,r*1.8,0,6.28);ctx.fill();ctx.restore();}
 ctx.globalCompositeOperation='lighter';
 for(const s of sparks){ctx.globalAlpha=Math.max(0,Math.min(1,s.l*2.5));ctx.fillStyle=s.c;ctx.fillRect(s.x-3,s.y-3,6,6)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 for(const w of waves){ctx.globalAlpha=Math.max(0,w.l);ctx.strokeStyle=w.big?'#fff':'#ffe0b0';ctx.lineWidth=8*w.l;ctx.beginPath();ctx.ellipse(w.x,w.y,w.r,w.r*.22,0,0,6.28);ctx.stroke()}ctx.globalAlpha=1;
 if(p.hunt){ctx.fillStyle='rgba(20,10,40,.18)';ctx.fillRect(-500,0,VW+1000,VH)}
 if(p.rush>0){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(VW/2-110,34,220,10);ctx.fillStyle='#ffd84d';ctx.fillRect(VW/2-110,34,220*p.rush/15,10)}
 if(p.tiger>0){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(VW/2-110,18,220,10);ctx.fillStyle='#ff8a2e';ctx.fillRect(VW/2-110,18,220*p.tiger/20,10)}
 drawFx();
 drawTexts();drawCombo();drawLives();
 ctx.globalAlpha=1;ctx.textAlign='left';
}
function drawFx(){
 // claw slash trails: bright curved crescents
 for(const sl of slashes){ctx.save();ctx.translate(sl.x,sl.y);ctx.scale(sl.face,1);ctx.globalCompositeOperation='lighter';
  const prog=1-sl.l,a1=sl.a0,a2=sl.a0+sl.sweep*Math.min(1,prog*2.2+.3);
  for(let k=0;k<3;k++){ctx.globalAlpha=Math.max(0,sl.l)*(1-k*.3);ctx.strokeStyle=k?sl.col:'#fff';ctx.lineWidth=(sl.kind==='big'?16:11)*(1-k*.3)*sl.l+1;ctx.lineCap='round';
   ctx.beginPath();ctx.arc(0,0,sl.r-k*9,Math.min(a1,a2),Math.max(a1,a2));ctx.stroke()}ctx.restore()}
 // tail-whip swoosh ring
 if(p.state==='tailwhip'){ctx.save();ctx.globalCompositeOperation='lighter';const a=p.t*28;
  for(let k=0;k<4;k++){ctx.globalAlpha=.5-k*.1;ctx.strokeStyle=k?'#ffe7c2':'#fff';ctx.lineWidth=10-k*2;ctx.beginPath();ctx.ellipse(p.x,p.y-38,100,26,0,a-1.6-k*.35,a-k*.35);ctx.stroke()}ctx.restore()}
 // timing cue for the combo extension
 if(p.state==='claw'&&p.combo>=3&&p.combo<6&&!p.miss){const H=.4,w=p.t>=H-.2;ctx.save();ctx.globalAlpha=w?.9:.35;ctx.strokeStyle=w?'#7fffd4':'#fff';ctx.lineWidth=w?5:2;
  ctx.beginPath();ctx.arc(p.x,p.y-70,w?52:52+(H-.2-p.t)*200,0,6.283);ctx.stroke();ctx.restore()}
 // charge glows + meters (super leap / sonic meow)
 const ch=p.state==='jcharge'?p.jc:p.state==='mcharge'?p.mc:0;
 if(ch>0){const meow=p.state==='mcharge';ctx.save();ctx.globalCompositeOperation='lighter';const cx=meow?p.x+p.face*70:p.x,cy=meow?p.y-75:p.y-40,R2=30+70*ch+Math.sin(now*30)*4;
  const g=ctx.createRadialGradient(cx,cy,4,cx,cy,R2);g.addColorStop(0,meow?'rgba(190,232,255,.9)':'rgba(255,240,150,.9)');g.addColorStop(1,'rgba(120,180,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R2,0,6.283);ctx.fill();
  if(meow){ctx.strokeStyle='#dff4ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,20+60*ch,0,6.283);ctx.stroke()}ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(p.x-50,p.y-185,100,9);ctx.fillStyle=ch>=1?'#ffe14d':meow?'#9fe8ff':'#fff';ctx.fillRect(p.x-50,p.y-185,100*ch,9)}
 // sonic meow rings + arcs
 for(const w of meows){ctx.save();ctx.translate(w.x,w.y);ctx.scale(w.face,1);ctx.globalAlpha=Math.max(0,w.l);
  for(let k=0;k<(w.big?4:2);k++){const r=w.r-k*34;if(r<8)continue;ctx.strokeStyle=k%2?'#bfe8ff':'#fff';ctx.lineWidth=(w.big?9:5)-k;ctx.beginPath();ctx.arc(0,0,r,-1.1,1.1);ctx.stroke()}
  ctx.globalAlpha=Math.max(0,w.l)*.35;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,w.r,0,6.283);ctx.stroke();
  ctx.globalAlpha=Math.max(0,w.l)*.8;ctx.strokeStyle='#e9d5ff';ctx.lineWidth=3;for(let k=0;k<3;k++){const a=-.6+k*.6,r=w.r*.7;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.6,Math.sin(a)*r*.6);
   for(let j=1;j<5;j++){const rr=r*(.6+j*.1);ctx.lineTo(Math.cos(a+(j%2?.08:-.08))*rr,Math.sin(a+(j%2?.08:-.08))*rr)}ctx.stroke()}ctx.restore()}
 // speech bubble
 if(bubble){const bx=p.x+p.face*60,by=p.y-200-(1.1-bubble.l)*20,fs=bubble.big?34:24;ctx.save();ctx.globalAlpha=Math.min(1,bubble.l*3);ctx.font=`${fs}px ${FONT}`;const w=ctx.measureText(bubble.t).width+24;
  ctx.fillStyle='#fff';ctx.strokeStyle='#1a0f3a';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect?ctx.roundRect(bx-w/2,by-fs,w,fs*1.5,14):ctx.rect(bx-w/2,by-fs,w,fs*1.5);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx-8,by+fs*.5-1);ctx.lineTo(bx-p.face*14,by+fs*.5+16);ctx.lineTo(bx+8,by+fs*.5-1);ctx.fill();
  ctx.fillStyle='#ff4fa3';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(bubble.t,bx,by-fs*.25);ctx.restore()}}
function drawLives(){for(let i=0;i<9;i++){const x=24+i*26,y=62,on=i<p.lives;ctx.fillStyle=on?'#ff8fb1':'rgba(0,0,0,.25)';
 ctx.beginPath();ctx.ellipse(x,y+4,7,6,0,0,6.283);ctx.fill();for(const [dx,dy] of [[-7,-5],[-2,-9],[3,-9],[8,-5]]){ctx.beginPath();ctx.arc(x+dx*.9,y+dy,2.8,0,6.283);ctx.fill()}}
 for(let i=0;i<3;i++){ctx.fillStyle=i<p.hp?'#fff':'rgba(255,255,255,.25)';ctx.fillRect(24+i*14-6,78,10,4)}}
// game loop: never dies — an error is caught, reported once on screen, and Paddy is reset to idle
let last=0,errShown=0;
function loop(t){requestAnimationFrame(loop);let dt=(t-last)/1000;last=t;if(!(dt>0))dt=0;dt=Math.min(.033,dt);hitstop=Math.min(Math.max(hitstop,0),.3);
 try{if(hitstop>0){hitstop-=dt;shake*=.9}else{update(dt);updCombo(dt)}draw()}
 catch(e){console.error(e);try{localStorage.setItem('paddyLastError',String(e&&e.stack||e))}catch(_){}
  Object.assign(p,{state:'normal',wall:false,vx:0,vy:0,combo:0,blend:0,jc:0,mc:0});if(!isFinite(p.x))p.x=300;if(!isFinite(p.y))p.y=GROUND;shake=0;
  if(now-errShown>3){errShown=now;lbl.textContent='glitch caught – recovered'}}}
let started=false;addEventListener('pageshow',()=>{last=performance.now()});document.addEventListener('visibilitychange',()=>{last=performance.now();for(const k in K)K[k]=0});
fetch('assets/frames.json').then(r=>r.json()).then(j=>{F=j;for(const a in A){const [s,idx]=A[a];if(F[s])FR[a]=idx?idx.filter(i=>i<F[s].length).map(i=>F[s][i]):F[s]}
 const names=new Set();Object.values(FR).forEach(a=>a.forEach(f=>names.add(f.f)));
 let n=0;window.SPRITES={total:names.size,loaded:0,failed:[]};
 names.forEach(nm=>{const im=new Image();im.onload=()=>{SPRITES.loaded++;done()};im.onerror=()=>{SPRITES.failed.push(nm);done()};im.src='assets/'+nm+'.png';IMG[nm]=im});
 function done(){if(++n===names.size&&!started){started=true;requestAnimationFrame(loop)}}});
// ===== COMBO SYSTEM =====
let hitstop=0;
const FONT="'Bangers','Luckiest Guy',Impact,'Arial Black',sans-serif";
const NAMES={superleap:'SUPER LEAP!',meow:'MEOW!',sonicmeow:'SONIC MEOW!!',claw1:'SCRATCH!',claw2:'SWIPE!',claw3:'TRIPLE CLAW!',dashstrike:'DASH STRIKE!',airswipe:'AIR SWIPE!',airspin:'AIR SPIN!',dive:'DIVE BOMB!',diveclaw:'DIVE CLAW!',pounce:'POUNCE!',blast:'ENERGY BLAST!',finisher:'FINISHER!',uppercut:'UPPERCUT!',tailwhip:'TAIL WHIP!',swat:'SWAT!',hiss:'HISS!',t_claw:'FLAME CLAW!',t_pounce:'TIGER POUNCE!',roar:'ROAR!',fireball:'FIREBALL!'};
// knockback: [vx, vy, float seconds, hitstop]
const KB={superleap:[160,-700,.35,.06],meow:[260,-200,.05,.04],sonicmeow:[520,-420,.25,.09],claw1:[220,-180,0,.04],claw2:[260,-220,0,.04],claw3:[420,-720,.3,.08],dashstrike:[750,-380,.2,.09],airswipe:[200,-480,.45,.05],airspin:[120,-330,.5,.035],
 dive:[0,-850,.25,.11],diveclaw:[520,-360,.2,.08],pounce:[380,-520,.2,.07],blast:[620,-420,.2,.08],
 finisher:[700,-900,.4,.12],uppercut:[120,-950,.4,.07],tailwhip:[380,-300,.1,.05],swat:[260,-160,0,.04],hiss:[300,-120,0,.03],t_claw:[480,-420,.15,.07],t_pounce:[600,-520,.2,.08],roar:[650,-500,.25,.09],fireball:[700,-460,.2,.09]};
const REACH={superleap:[120,220],claw1:[115,130],claw2:[125,130],claw3:[140,150],dashstrike:[160,130],airswipe:[140,150],airspin:[130,170],diveclaw:[110,120],pounce:[120,120],finisher:[170,170],uppercut:[120,190],tailwhip:[130,120],swat:[110,90],t_claw:[160,150],t_pounce:[150,140]};
const C={n:0,t:0,max:1.2,pop:0,best:0,fin:null,lastState:'',atk:0,spinT:0};
const dummies=[{home:430},{home:600},{home:740}].map(d=>({...d,x:d.home,y:GROUND,vx:0,vy:0,fl:0,hp:12,flash:0,sq:0,rot:0,alive:true,resp:0,last:-1,calm:0}));
function tierCol(n){return n>=50?`hsl(${(performance.now()/4)%360},100%,65%)`:n>=25?'#ff6fcf':n>=10?'#ff9a2e':n>=5?'#ffe14d':'#fff'}
function extend(name){if(C.n>0){C.t=C.max;if(name)say(name,'#fff',false)}}
function comboEnd(silent){if(C.n>=2&&!silent){C.fin={n:C.n,l:2.2};if(C.n>=10&&p.state==='normal'&&p.ground)victory()}C.n=0;C.t=0}
function updCombo(dt){if(C.n>0){C.t-=dt;if(C.t<=0)comboEnd()}C.pop*=Math.pow(.002,dt);if(C.fin){C.fin.l-=dt;if(C.fin.l<=0)C.fin=null}}
function addHit(move){C.n++;C.t=C.max;C.pop=1;C.best=Math.max(C.best,C.n);C.fin=null;
 const rank={10:'NICE!',25:'AWESOME!',50:'PURRFECT!',100:'LEGENDARY!'}[C.n];
 if(rank)say(rank,tierCol(C.n),true);else say(NAMES[move]||move,'#fff',false)}
function hitDummy(d,move,dir){const k=KB[move]||KB.claw1;
 d.vx=dir*k[0]*(0.85+Math.random()*.3);d.vy=Math.min(d.vy,0)+k[1];if(d.y>=GROUND-1&&k[1]>-200)d.vy=k[1];d.fl=k[2];d.flash=.12;d.sq=1;d.hp-=p.rush>0?2:1;if(p.rush>0){d.vx*=1.2;d.vy*=1.15}d.calm=0;
 hitstop=Math.max(hitstop,k[3]*(p.rush>0?1.7:1));shake=Math.max(shake,4+k[3]*60);addHit(move);
 const hx=d.x-dir*20,hy=d.y-70;
 for(let i=0;i<12;i++){const a=Math.random()*6.28,v=150+Math.random()*350;sparks.push({x:hx,y:hy,vx:Math.cos(a)*v+dir*120,vy:Math.sin(a)*v,l:.35,c:['#fff','#ffe14d','#ff9ad5','#8fe0ff'][i%4]})}
 waves.push({x:hx,y:hy,r:8,l:.6,big:false});
 if(d.hp<=0){d.alive=false;d.resp=1.4;burst(d.x,d.y-60)}}
function meleeHits(dt){const st=p.state==='claw'?p.anim:p.state;
 if(st!==C.lastState){C.lastState=st;C.atk++}
 if(st==='airspin'||st==='finisher'||st==='superleap'){C.spinT+=dt;if(C.spinT>.12){C.spinT=0;C.atk++}}
 const r=REACH[st];if(!r)return;
 if((st.startsWith('claw')||st==='swat'||st==='t_claw')&&p.t>.22)return;if(st==='finisher'&&p.t<.25)return;
 for(const d of dummies){if(!d.alive||d.last===C.atk)continue;
  const dx=(d.x-p.x)*p.face,within=(st==='airspin'||st==='tailwhip'||st==='superleap')?Math.abs(d.x-p.x)<r[0]:(dx>-35&&dx<r[0]);
  if(within&&d.y-130<p.y+10&&d.y>p.y-r[1]){d.last=C.atk;hitDummy(d,st,(st==='airspin'||st==='tailwhip'||st==='superleap')?Math.sign(d.x-p.x)||p.face:p.face)}}}
function areaHit(x,y,rad,move){for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<rad&&Math.abs(d.y-y)<140)hitDummy(d,move,Math.sign(d.x-x)||p.face)}
function updDummies(dt){for(const d of dummies){
 if(!d.alive){d.resp-=dt;if(d.resp<=0){Object.assign(d,{x:d.home,y:GROUND-200,vx:0,vy:0,hp:12,alive:true,sq:1,fl:0});for(let i=0;i<10;i++)sparks.push({x:d.x,y:GROUND-200,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,l:.4,c:'#ffe14d'})}continue}
 d.fl-=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.calm+=dt;
 d.vy+=(d.fl>0?420:1700)*dt;if(d.fl>0)d.vx*=Math.pow(.3,dt);
 d.x+=d.vx*dt;d.y+=d.vy*dt;
 if(d.x<40){d.x=40;d.vx=Math.abs(d.vx)*.5}if(d.x>WALL_X-30){d.x=WALL_X-30;d.vx=-Math.abs(d.vx)*.5}
 if(d.y<-300)d.y=-300;
 if(d.y>=GROUND){d.y=GROUND;if(d.vy>350){d.vy*=-.35;d.sq=.6}else d.vy=0;d.vx*=Math.pow(.02,dt);
  if(d.calm>1.2)d.x+=(d.home-d.x)*Math.min(1,dt*1.5)}
 d.rot=Math.max(-.6,Math.min(.6,d.vx/900))+(d.y<GROUND?Math.sin(performance.now()/90)*.25*Math.min(1,(GROUND-d.y)/100):0);}}
function drawDummies(){for(const d of dummies){if(!d.alive)continue;
 ctx.fillStyle='rgba(0,0,0,.15)';ctx.beginPath();ctx.ellipse(d.x,GROUND+3,34,7,0,0,6.28);ctx.fill();
 ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);const s=1+d.sq*.18;ctx.scale(1/s,s);
 ctx.fillStyle='#7a5235';ctx.fillRect(-34,-14,68,14);
 ctx.fillStyle='#d8b98a';ctx.fillRect(-13,-100,26,88);ctx.strokeStyle='#b08f5f';ctx.lineWidth=3;
 for(let y=-96;y<-14;y+=9){ctx.beginPath();ctx.moveTo(-13,y);ctx.lineTo(13,y+5);ctx.stroke()}
 ctx.fillStyle=d.flash>0?'#fff':'#ff8fb1';ctx.beginPath();ctx.arc(0,-120,26,0,6.28);ctx.fill();
 ctx.fillStyle=d.flash>0?'#ffd':'#fff';ctx.beginPath();ctx.arc(0,-120,17,0,6.28);ctx.fill();
 ctx.fillStyle='#333';const hurt=d.flash>-.25;
 if(hurt){ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('> <',0,-118)}else{ctx.beginPath();ctx.arc(-6,-123,2.5,0,6.28);ctx.arc(6,-123,2.5,0,6.28);ctx.fill()}
 ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.beginPath();hurt?ctx.arc(0,-108,4,0,6.28):ctx.arc(0,-116,5,.2,2.9);ctx.stroke();
 ctx.fillStyle='#4c4';ctx.fillRect(-20,-158,40*d.hp/12,4);ctx.restore()}}
function fancy(txt,x,y,size,rot,scale,alpha,col){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);
 ctx.font=`${size}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';
 const g=ctx.createLinearGradient(0,-size/2,0,size/2);g.addColorStop(0,'#fff');g.addColorStop(.5,col);g.addColorStop(1,col==='#fff'?'#9fd8ff':col);
 ctx.lineJoin='round';ctx.lineWidth=size*.22;ctx.strokeStyle='rgba(20,10,60,.85)';ctx.strokeText(txt,0,size*.06);
 ctx.lineWidth=size*.1;ctx.strokeStyle='#1a0f3a';ctx.strokeText(txt,0,0);ctx.fillStyle=g;ctx.fillText(txt,0,0);ctx.restore()}
function drawTexts(){for(const t of texts){const age=1-t.l,pop=age<.12?.4+age/.12*.85:age<.22?1.25-(age-.12)*2.5:1;
 fancy(t.t,VW/2,(t.big?175:140)-age*25,t.big?78:54,t.rot,pop,Math.min(1,t.l*2.2),t.c)}
 if(C.fin){const a=C.fin.l,age=2.2-a,pop=age<.15?.3+age/.15*1:1+Math.sin(age*8)*.03;
  fancy(`COMBO ${C.fin.n}!`,VW/2,250,90,-.06,pop,Math.min(1,a*1.5),tierCol(C.fin.n))}}
function drawCombo(){if(C.n<1)return;const col=tierCol(C.n),sh=C.pop*8;
 const x=VW-120+(Math.random()-.5)*sh,y=110+(Math.random()-.5)*sh;
 fancy('x'+C.n,x-10,y,64+C.pop*22,-.08,1,1,col);fancy('HITS',x+5,y+44,28,-.08,1,1,col);
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(VW-200,y+66,170,10);ctx.fillStyle=col;ctx.fillRect(VW-200,y+66,170*Math.max(0,C.t/C.max),10)}
document.fonts&&document.fonts.load(`40px Bangers`).catch(()=>{});
