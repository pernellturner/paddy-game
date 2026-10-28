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
 hiss:['o_roar',null,1,0],swat:['swat',null,14,0],zoomies:['zoomies',null,20,1],
 bk_leap:['bunnykick',[0,1],8,0],bk_roll:['bunnykick',[2],1,0],bk_kick:['bunnykick',[3,2],1,0],bk_land:['bunnykick',[4,5],6,0],barge:['blinkbarge',[2,3],8,0],pawpop:['launcher',[0,1,2,3],16,0],
 n_idle:['n_idle',[1,2,3,4,3,2],6,1],n_run:['n_run',null,15,1],n_rise:['n_jump',[2],1,0],n_fall:['n_jump',[3],1,0],n_land:['n_jump',[5],1,0],n_flip:['n_flip',[1,2,3,4],13,0],n_flip2:['n_flip',[2,3,4],13,0],
 n_a1:['n_attack',[0,1,2],22,0],n_a2:['n_attack',[2,3],18,0],n_a3:['n_dashslash',[2,3],16,0],n_a4:['n_attack',[3,4],18,0],n_a5:['n_attack',[1,2,3],20,0],n_rise5:['n_flip',[1,2],12,0],n_a6:['n_dashslash',[3,4,5],10,0],n_air1:['n_attack',[2,3],16,0],n_air2:['n_flip',[2,3],16,0],
 n_throw:['n_throw',[1,2,3,4],18,0],n_dash:['n_dashslash',[2,3],12,1],n_step:['n_dashslash',[3,4],12,0],n_dive:['n_jump',[4],1,0],n_hurt:['n_jump',[4],1,0],n_wall:['n_run',null,20,1],n_charge:['n_idle',[1,2,3,4,3,2],8,1]};
const dur=a=>FR[a]?Math.max(FR[a].length/A[a][2],a==='blast'?.5:.3):.4;
// ---------- input ----------
const K={},P={};
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',
 Space:'jump',ArrowUp:'up',KeyW:'up',KeyX:'attack',KeyJ:'attack',KeyC:'special',KeyK:'special',KeyQ:'hunt',KeyV:'hunt',
 ShiftLeft:'run',ShiftRight:'run',KeyT:'tail',KeyL:'tail',KeyZ:'zoomies',KeyE:'hiss',KeyR:'swat',KeyF:'finisher',KeyH:'hurtTest',KeyY:'victory',KeyN:'blink',KeyM:'morph',Digit3:'formN',Digit4:'formS',ControlLeft:'blink',ControlRight:'blink'};
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
 idleT:0,airHits:0,hang:0,dashStart:-9,grab:null,tair:0,lives:9,hp:3,inv:0,blinkCool:0,keepT:0,keepCombo:0,jc:0,mc:0,rot:0,fallTop:GROUND,perfect:false,miss:false,blend:0,prevF:null,holdT:0,wj:0,dj:0,startT:0,ninja:false,sam:false,ncombo:0,ncT:0,nair:0,nc:0,nsteps:0,nstepT:0,nstepCool:0,storm:null,mfrom:null,carry:false,rats:0,shot:false,lastJump:-9};
let acted=false;const BUF={};const INSTANT=['morph','formN','formS','hunt','hurtTest','victory','blink'];
const waves=[],shots=[],sparks=[],ghosts=[],texts=[];let shake=0;
const lastTap={left:-9,right:-9};let now=0;
function tapDir(k){if(k!=='left'&&k!=='right')return;if(now-lastTap[k]<0.28){P.dash=k;BUF.dash=now;lastTap[k]=-9}else lastTap[k]=now}
function say(t,c,big){if(typeof cine!=='undefined'&&cine.card&&cine.card.t<1.3&&!big)return;texts.length=0;texts.push({t,c:c||'#fff',l:1,rot:(Math.random()-.5)*.18,big:!!big})}
function setAnim(a,force){if(!FR[a])a=p.sam?'s_idle':p.ninja?'n_idle':'idle';if(p.anim!==a||force){const cf=(FR[p.anim]||[])[p.fi];if(cf&&p.anim!==a){p.prevF=cf;p.prevFace=p.face;p.prevX=p.x+(p.wall?40:0);p.prevY=p.y;p.blend=.1}p.anim=a;p.fi=0;p.ft=0}}
function act(state,anim,o){tokAct(state);p.state=state;p.t=0;p.shot=false;acted=true;setAnim(anim,true);if(o&&o.say)say(o.say,o.c||'#fff')}
const floorAt=x=>(x>WALL_X-20&&x<WALL_X+100)?WT:GROUND;
const spark=(x,y,n,c,s=300)=>{for(let i=0;i<n;i++)sparks.push({x,y,vx:(Math.random()-.5)*s*2,vy:-Math.random()*s,l:.4,c:Array.isArray(c)?c[i%c.length]:c})};
const puffs=[];
// 6-hit claw: hits 1-3 chain on any press, 4-6 need a press in the last ~0.2s of the swing (PERFECT)
const CLAWS=[null,{a:'pc1',k:'low',lunge:150,col:'#ffffff',sp:'#dff4ff',nm:'LEFT PAW!'},{a:'pc2',k:'down',lunge:170,col:'#cfefff',sp:'#9fe8ff',nm:'RIGHT PAW!'},{a:'pc3',k:'over',lunge:200,col:'#9fe8ff',sp:'#8fe0ff',nm:'TRIPLE CLAW!'},
 {a:'pc4',k:'low',lunge:240,col:'#7fffd4',sp:'#7fffd4',nm:'LOW SWEEP!'},{a:'pc5',k:'spin',lunge:210,col:'#c9a7ff',sp:'#c9a7ff',nm:'SPIN SWIPE!'},{a:'pc6',k:'rise',lunge:160,col:'#ff9ad5',sp:'#ff9ad5',nm:'RISING CLAW!'},
 {a:'pc7',k:'cross',lunge:270,col:'#ffe14d',sp:'#ffe14d',nm:'DOUBLE CLAW X!'},{a:'pc8',k:'over',lunge:290,col:'#ff9a2e',sp:'#ffb040',nm:'HAMMER PAWS!'}];
let hitNum=null,TS=1,slowT=0,flashT=0;
function popNum(n,col){hitNum={n,l:1,col:col||'#fff'}}
function startClaw(){C.atk++;p.combo=Math.min(8,p.combo+1);popNum(p.combo,CLAWS[p.combo].col);if(p.combo===1)p.qfin=false;const c=CLAWS[p.combo];act('claw',c.a);p.queued=false;p.perfect=false;p.miss=false;
 p.vx=p.face*c.lunge;if(p.combo===6&&p.ground){p.vy=-330;p.ground=false}say(c.nm,c.col,p.combo>=6);clawFx(p.combo,c.k,c.col,c.sp)}
// ---- slash trails, sound waves, audio ----
const slashes=[],meows=[];
const ARC={up:[.9,-2.2],down:[-1.1,2.2],flat:[-.6,1.2],low:[2.1,-1.9],over:[-2.5,3.3],rise:[1.3,-2.9],spin:[0,6.2],cross:[-.3,2.0],big:[-.3,2.0]};
function slash(kind,col,o){o=o||{};const lv=o.lvl||0,big=kind==='big'||kind==='cross',R0=(big?95:kind==='spin'?100:70)*(o.scale||1),x=p.x+p.face*(kind==='spin'?0:(o.dx||70)),y=p.y-(o.dy||(kind==='low'?45:kind==='spin'?60:70)),ar=ARC[kind]||ARC.cross,d=o.delay||0;
 slashes.push({x,y,face:p.face,l:1,kind,a0:ar[0],sweep:ar[1],r:R0,col:col||'#fff',fire:o.fire,lvl:lv,d,sp:kind==='spin'?2.8:4});
 if(big)slashes.push({x,y:y+10,face:p.face,l:1,kind,a0:.9,sweep:-2.2,r:R0*.95,col:o.col2||(o.fire?'#ffe14d':'#ff9ad5'),fire:o.fire,lvl:lv,d,sp:4})}
// escalating swipe effects: bigger trails, brighter colour, more particles, more shake per hit
function clawFx(i,k,col,sp){const sc=1+(i-1)*.08;slash(k,col,{lvl:i,scale:sc,delay:.04});if(i>=6)slash(k==='cross'?'over':k,'#ffffff',{lvl:i,scale:sc*.78,delay:.07});
 spark(p.x+p.face*70,p.y-70,4+i*3,[sp,'#fff'],180+i*35);shake=Math.max(shake,2+i*1.7);if(i>=4)waves.push({x:p.x+p.face*60,y:p.y-60,r:10,l:.45+i*.06,big:i>=7});if(i>=7)flashT=Math.max(flashT,.05)}
let AC=null,muted=localStorage.getItem('paddyMute')==='1';
function meowSound(power){if(muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,len=.32+power*.35;
  const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';
  o.frequency.setValueAtTime(520,t);o.frequency.linearRampToValueAtTime(820+power*120,t+len*.35);o.frequency.linearRampToValueAtTime(430,t+len);
  f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(900,t);f.frequency.linearRampToValueAtTime(1700,t+len*.4);f.frequency.linearRampToValueAtTime(700,t+len);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05+.05*power,t+.04);g.gain.linearRampToValueAtTime(0,t+len);
  o.connect(f);f.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+len+.05)}catch(e){}}
function sonicMeow(c){const big=c>.15;meows.push({x:p.x+p.face*70,y:p.y-75,face:p.face,r:20,maxR:big?180+320*c:150,power:big?.6+c:.35,hit:new Set(),l:1,big});
 bubble={t:big?'SONIC MEOW!!':'MEOW!',l:1.1,big};meowSound(big?c:0);shake=big?6+10*c:3;}
let bubble=null;
function blink(){if(p.ninja)return nStep();if(p.sam)return sIaido();if(p.blinkCool>0||['ledge','bunny','eclipse','finishhim','sfinal'].includes(p.state))return false;
 const from=p.x;puffShadow(p.x,p.y);const kc=p.state==='claw'?p.combo:0;
 let nx=p.x+p.face*330;nx=Math.max(50,Math.min(WALL_X+60,nx));if(p.y>WT+2&&from<WALL_X-60&&nx>WALL_X-60)nx=WALL_X-60;
 const barge=(p.state==='dash'||now-p.dashStart<.45);
 p.x=nx;p.wall=false;p.inv=.6;p.blinkCool=.9;p.state='normal';p.t=0;p.vx=p.face*200;if(!p.ground)p.vy=Math.min(p.vy,0);
 if(barge){puffShadow(p.x,p.y);blinkBarge();extend();acted=true;return true}
 if(kc){p.keepCombo=kc;p.keepT=.7}extend();puffShadow(p.x,p.y);say('SHADOW BLINK!','#c9a7ff');acted=true;return true}
function puffShadow(x,y){for(let i=0;i<16;i++){const a=Math.random()*6.28;puffs.push({x:x+Math.cos(a)*30,y:y-60+Math.sin(a)*40,vx:Math.cos(a)*70,vy:Math.sin(a)*50,r:12+Math.random()*12,l:.55,dark:1})}}
function loseLife(){p.lives--;say(p.lives>0?'LOST A LIFE ('+p.lives+' left)':'OUT OF LIVES!','#ffb0b0',true);act('respawn',p.sam?'s_hurt':p.ninja?'n_hurt':'hurt');p.rot=0;p.vx=0;p.vy=-200;p.ground=false}
// ---- BUNNY KICK GRAB (perfect 8th hit) ----
function bunnyKick(){C.atk++;popNum(8,'#ff4fa3');act('bunny','pclunge',{say:'GRAB!',c:'#ff9ad5'});p.vx=p.face*760;p.vy=0;p.inv=4;p.kicks=0;
 let best=null,bd=300;for(const d of dummies){const dx=(d.x-p.x)*p.face;if(d.alive&&dx>-40&&dx<bd&&Math.abs(d.y-p.y)<180){bd=dx;best=d}}p.grab=best;p.kick=0;
 cineGo(1.45,.2,'#ff4fa3');slowT=.2;flashT=.12;shake=8;for(let i=1;i<4;i++)ghosts.push({x:p.x-p.face*i*40,y:p.y,f:FR.pclunge[0],face:p.face,l:.08+i*.03,blue:1})}
// ---- BLINK BARGE (blink during a dash) ----
function blinkBarge(){act('barge','barge',{say:'BLINK BARGE!',c:'#c9a7ff'});p.vx=p.face*950;p.inv=.5;shake=8;C.atk++}
let camY=0;
function finisher(){act('finisher','finisher',{say:'FINISHER!',c:'#c9a7ff'});p.vx=0;p.combo=0;shake=8;waves.push({x:p.x,y:p.y-40,r:10,l:1,big:true})}
function dashStrike(){act('dashstrike','dashstrike',{say:'DASH STRIKE!',c:'#ff9fd0'});p.vx=p.face*1150;if(!p.ground)p.vy=-120;shake=9;
 for(let i=0;i<14;i++)sparks.push({x:p.x+p.face*80,y:p.y-60+(Math.random()-.5)*60,vx:p.face*(300+Math.random()*400),vy:(Math.random()-.5)*200,l:.4,c:i%2?'#fff':'#ffb0e0'})}
function uppercut(){act('uppercut','uppercut',{say:'UPPERCUT!',c:'#ffe08a'});p.vy=-780;p.vx=p.face*120;p.ground=false;p.jumps=2;shake=6;spark(p.x+p.face*50,p.y-40,10,['#fff','#ffe08a'])}
function impact(big){areaHit(p.x,p.y,big?190:130,big?'dive':'diveclaw');shake=big?16:10;waves.push({x:p.x,y:p.y,r:10,l:1,big});for(let i=0;i<(big?26:14);i++)sparks.push({x:p.x+(Math.random()-.5)*60,y:p.y,vx:(Math.random()-.5)*(big?700:400),vy:-Math.random()*300,l:.5,c:i%3?'#d9c49a':'#fff'})}
function doDash(dir){if(p.ninja){nDash(dir);return}if(p.sam){sDash(dir);return}p.face=dir==='right'?1:-1;p.wall=false;p.dashCool=.45;p.dashStart=now;
 if(!p.ground&&p.jumps>=2&&!p.airDash){p.airDash=true;act('wingdash','wingdash',{say:'WINGED DASH!',c:'#8fe0ff'});p.vx=p.face*1000;p.vy=-60;shake=6}
 else{act('dash','dash',{say:'DASH!'});p.vx=p.face*900;if(!p.ground)p.vy=Math.min(p.vy,0);shake=3}}
function hurtMe(){comboEnd(true);p.hp--;if(p.hp<=0){p.hp=3;p.wall=false;loseLife();return}p.wall=false;p.rot=0;act('hurt',p.sam?'s_hurt':p.ninja?'n_hurt':'hurt',{say:'OUCH!',c:'#ff8080'});p.vy=-400;p.vx=-p.face*200;p.ground=false}
function victory(){act('victory',p.sam?'s_victory':p.ninja?'n_flip':'victory',{say:'VICTORY!',c:'#ffe14d'});p.vx=0;spark(p.x,p.y-80,24,['#ffe14d','#fff','#ff9ad5'],400)}
function shoot(fire){shots.push({x:p.x+p.face*110,y:p.y-60,vx:p.face*(fire?700:620),l:1.6,a:0,hit:new Set(),fire});shake=8}
const MANNER=['groom','stretch','sitflick','sniff','loaf'];
const anyInput=()=>Object.keys(P).length>0||K.left||K.right||K.down||K.jump;
const huntBtn=document.querySelector('[data-k=hunt]');
function update(dt){
 now+=dt;p.t+=dt;p.cool-=dt;p.dashCool-=dt;p.wj-=dt;p.dj-=dt;p.startT-=dt;
 const dir=(K.right?1:0)-(K.left?1:0);p.holdT=dir?p.holdT+dt:0;
 if(P.morph)cycleForm();if(P.formN)setForm(1);if(P.formS)setForm(2);nUpdate(dt);r6Update(dt);r8Update(dt);
 p.blend-=dt;
 for(const f of puffs){f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*30;f.l-=dt}for(let i=puffs.length-1;i>=0;i--)if(puffs[i].l<=0)puffs.splice(i,1);
 p.inv-=dt;p.blinkCool-=dt;p.keepT-=dt;p.hang-=dt;if(hitNum){hitNum.l-=dt*1.4;if(hitNum.l<=0)hitNum=null}flashT-=dt;
 if(P.blink)blink();
 if(P.hurtTest&&p.inv<=0&&p.state!=='respawn')hurtMe();
 if(P.victory&&p.ground&&p.state==='normal')victory();
 if(P.hunt&&!p.ninja&&!p.sam){p.hunt=!p.hunt;say(p.hunt?'HUNT MODE':'hunt off','#ffe08a');huntBtn.classList.toggle('lit',p.hunt)}
 if(P.dash&&p.dashCool<=0&&['normal','land','zoomies'].includes(p.state)&&!(p.hunt&&p.ground))doDash(P.dash)
 // cancel windows: after a short commit time these moves can flow straight into the next one
 const CANCEL={nflip:99,pawpop:.15,barge:.25,meow:.2,claw:.12,airswipe:.12,swat:.12,tailwhip:.15,dashstrike:.2,uppercut:.16,land:0,hardland:.12,stop:0,blast:.42,hiss:.3,finisher:.6,airspin:.15,slide:.15};
 if(CANCEL[p.state]!=null&&p.t>CANCEL[p.state]){
  if(P.dash&&p.dashCool<=0){if(['claw','swat','tailwhip'].includes(p.state)){p.face=P.dash==='right'?1:-1;dashStrike()}else doDash(P.dash)}
  else if((P.jump&&p.ground)||(P.down&&!p.ground)||(P.attack&&(K.up||!p.ground)&&p.state!=='claw'&&p.state!=='airspin')||(P.attack&&K.up&&p.ground)||((P.special||(P.tail&&p.state!=='tailwhip'))&&!['meow','hiss','finisher'].includes(p.state))){p.state='normal';p.combo=0}
 }
 const MAXT={eclipse:4.5,finishhim:3.5,nmorph:1,ncharge:3,nstorm:3,wallrun:2.2,nflip:2,nbflip:2,ndive:2,bunny:4.5,barge:1,sfinal:4.5,sparry:1.5,scharge:3.5,ssuper:2,siaido:1.2,sdraw:1,zoomies:3,manner:5,hurt:3,respawn:4,mcharge:3.5,jcharge:4.5,superleap:2,ledge:1.5,victory:2.5,finisher:2.5};
 if(p.state!=='normal'&&p.t>(MAXT[p.state]||2.5)){console.warn('safety net: reset from',p.state);p.state='normal';p.wall=false;p.vx=0;p.combo=0;p.jc=0;p.mc=0;if(!p.ninja&&p.anim.startsWith('n_'))setAnim('idle');if(!p.sam&&p.anim.startsWith('s_'))setAnim('idle');p.rot=0}
 const S=p.state,end=p.t>dur(p.anim);
 switch(S){
 case 'claw': {const H=p.combo>=3?.4:.26; p.vx*=Math.pow(.02,dt);
  if(P.attack){ if(p.combo<3)p.queued=true; else if(p.combo<8){ if(p.t>=H-.2&&!p.miss){p.perfect=true;p.queued=true} else if(!p.perfect)p.miss=true } }
  if(P.finisher&&p.combo>=2)p.qfin=true;
  if(p.qfin&&p.t>.15){p.qfin=false;finisher();break}
  if(p.queued&&(p.combo>=3?p.perfect:p.t>.18)){ if(p.perfect){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false});hitstop=Math.max(hitstop,.05)} if(p.combo===7&&p.perfect){bunnyKick()}else startClaw() }
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
 case 'tailwhip': p.vx*=.85;{const ph=Math.floor(p.t/.11);p.face=p.tw0*(ph%2?-1:1);}if(p.t%.02<dt)sparks.push({x:p.x+Math.cos(p.t*30)*95,y:p.y-35+Math.sin(p.t*30)*22,vx:0,vy:-20,l:.3,c:'#fff7e0'});if(P.tail&&!p.tqT)p.tq=Math.min(2,(p.tq|0)+1);p.tqT=P.tail?1:0;if(p.tq>0&&p.t>.2){const q=p.tq-1;p.face=p.tw0;tailWhip((p.tn||1)<3?(p.tn||1)+1:1);p.tq=q;break}if(P.attack&&p.t>.16){p.face=p.tw0;p.combo=0;if(p.ground)startClaw();else{p.state='normal';p.airSwipe=false}break}if(p.t>.46){p.face=p.tw0;p.state='normal';p.tn=0}break;
 case 'swat': p.vx=0;if(end)p.state='normal';break;
 case 'hiss': p.vx=0;if(p.t>.25&&!p.shot){p.shot=true;areaHit(p.x,p.y,230,'hiss');waves.push({x:p.x+p.face*60,y:p.y-60,r:10,l:.8,big:false})} if(end)p.state='normal';break;
 case 'zoomies': p.vx=p.face*720;if(p.x<70||p.x>WALL_X-80){p.face*=-1;p.x=Math.max(71,Math.min(WALL_X-81,p.x))}
  if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.zoomies[p.fi],face:p.face,l:.25});if(p.t>2.4||P.jump||P.attack||P.down){p.state='normal';p.vx=p.face*300}break;
 case 'manner': if(anyInput()){p.state='normal';p.idleT=0}else if(p.t>(p.anim==='loaf'?4:p.anim==='groom'||p.anim==='sitflick'?2.5:dur(p.anim)+.3)){p.state='normal';p.idleT=0}break;
 case 'victory': p.vx=0;if((end&&p.t>1)||(p.t>.12&&(P.attack||P.tail||P.jump||P.special||P.dash||dir))){p.state='normal'}break;
 case 'ledge': {p.vx=0;p.vy=0;const L=.75,u=Math.min(1,p.t/L),e=x=>x*x*(3-2*x);
  const uy=e(Math.min(1,u/.6)),ux=e(Math.max(0,(u-.35)/.65));
  p.y=p.ly0+(WT-p.ly0)*uy;p.x=p.lx0+(WALL_X+30-p.lx0)*ux;p.fi=Math.min(FR.ledge.length-1,Math.floor(u*FR.ledge.length));p.ft=p.fi;
  if(u>=1){p.state='normal';p.y=WT;p.x=WALL_X+30;p.ground=true;p.vy=0}}break;
 case 'jcharge': {p.vx*=Math.pow(.05,dt);const JB=1;
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
 case 'pawpop': if(p.t>.45||(p.ground&&p.t>.12))p.state='normal';break;
 case 'barge': p.vx*=Math.pow(.15,dt);if(p.t%.025<dt){ghosts.push({x:p.x,y:p.y,f:FR.barge[p.fi],face:p.face,l:.3});puffs.push({x:p.x-p.face*40,y:p.y-50,vx:-p.face*60,vy:0,r:10,l:.4,dark:1})}if(p.t>.4)p.state='normal';break;
 case 'bunny': bunnyState(dt);break;
 default: if(NST.includes(S))nState(S,dt,end,dir);else if(SST.includes(S))sState(S,dt,end,dir);else if(S==='stun'){p.vx*=Math.pow(.05,dt);if(p.t>.45)p.state='normal'}break;
 }
 if(p.state==='normal'){
  const T=false,N=p.ninja||p.sam,running=K.run||(touchMode&&p.holdT>.6)||N,spd=p.hunt?110:p.ninja?470:p.sam?430:260*(running?1.6:1),JB=1;
  if(K.down&&p.ground&&!p.hunt&&Math.abs(p.vx)>300&&P.down&&!T&&!N){act('slide','slide',{say:'SLIDE!'});}
  else if(K.down&&p.ground&&!p.hunt&&!T&&!N){p.vx*=.7;setAnim('crouch');}
  else{p.vx+=(dir*spd-p.vx)*Math.min(1,dt*(N?(p.ground?(dir?8:10):5):T?(p.ground?(dir?4.5:6):2.5):(p.ground?(dir?7:9):4)));if(dir&&!p.wall)p.face=dir;}
  if(p.state==='normal'){
  if(p.ground&&!dir&&Math.abs(p.vx)>330&&!p.hunt&&!N){act('stop','stop')}
  if(p.ground&&dir&&running&&Math.abs(p.vx)<40&&!p.hunt&&!N)p.startT=.18;
  // wall climb: hold → to climb, release to cling, ← / jump to leap off, ↓ to drop
  if(!N&&!p.wall&&p.y>WT+10&&p.x>=WALL_X-62&&K.right&&!K.down&&!p.hunt){p.wall=true;p.jumps=0;p.airDash=false;say('CLIMB!','#ffe08a')}
  if(p.wall){p.face=1;p.vx=0;
   if(K.down){p.wall=false}
   else if(P.jump||K.left){p.wall=false;p.vy=-650;p.vx=-340;p.face=-1;p.jumps=1;p.wj=.45;setAnim('walljump');say('WALL JUMP!');extend('WALL JUMP!')}
   else{p.vy=K.right?-190:35;
    const cf=FR.climb[p.fi]||FR.climb[0];if(p.y-cf.ay*SC<WT-20&&K.right){p.lx0=p.x+40;p.ly0=p.y;p.wall=false;act('ledge','ledge',{say:'LEDGE GRAB!',c:'#ffe08a'});p.x=p.lx0}}}
  else if(N){}
  else if(P.jump&&p.ground){act('jcharge','crouch');p.jc=0}
  else if(P.jump&&!p.ground&&p.jumps<2){acted=true;p.vy=-650*JB;p.jumps=2;p.dj=.45;setAnim('djump');p.anim='djump';p.ft=0;say('DOUBLE JUMP!');extend();spark(p.x,p.y,10,'#fff',150)}
  if(p.state!=='normal'){}
  else if(p.sam){sMoves(dir)}
  else if(N){nMoves(dir)}
  else if(!p.ground&&!p.wall&&P.down){ if(K.left||K.right){p.face=K.left?-1:1;act('diveclaw','diveclaw',{say:'DIVE CLAW!',c:'#ffb070'})} else act('dive','dive',{say:'DIVE BOMB!',c:'#ffd070'}) }
  else if(P.attack&&!p.wall&&(K.up||K.jump)&&(p.ground||(p.vy<0&&now-p.lastJump<.35))&&!p.hunt)uppercut();
  else if(P.attack&&!p.wall&&p.ground&&now-p.lastDash<.2&&!p.hunt)dashStrike();
  else if(P.attack&&!p.ground&&!p.wall){ if(p.jumps>=2&&!p.airSpin){p.airSpin=true;act('airspin','airspin',{say:'AIR SPIN!',c:'#8fe0ff'});p.vy=-200;shake=5}
   else if(!p.airSwipe||p.airHits>0){p.airHits=0;p.airSwipe=true;act('airswipe','airswipe',{say:'AIR SWIPE!',c:'#bfe8ff'});p.vy=Math.min(p.vy,-120);p.vx=p.face*Math.max(Math.abs(p.vx),280);spark(p.x+p.face*70,p.y-60,8,'#bfe8ff')} }
  else if(P.attack&&p.cool<=0&&!p.wall&&p.ground){
   if(p.hunt){act('wiggle','wiggle',{say:'wiggle wiggle...',c:'#ffe08a'})}
   else if(K.down){act('pawpop','pawpop',{say:'PAW POP!',c:'#7fffd4'});p.vy=-420;p.ground=false;p.jumps=1;slash('up','#7fffd4')}
   else {p.combo=p.keepT>0?p.keepCombo:0;p.keepT=0;startClaw()} }
  else if(P.swat&&p.ground&&!p.wall)act('swat','swat',{say:'SWAT!',c:'#bfe8ff'});
  else if(P.finisher&&p.ground&&!p.wall)finisher();
  else if((P.special&&K.down||P.hiss)&&p.ground&&!p.wall)act('hiss','hiss',{say:'HISSS!',c:'#ffb0b0'});
  else if(P.special&&p.cool<=0&&!p.wall){act('mcharge','breath');p.mc=0}
  else if(P.tail&&!p.wall){tailWhip(1)}
  else if(P.zoomies&&p.ground&&!p.wall){act('zoomies','zoomies',{say:'ZOOMIES!!',c:'#ff9ad5'})}
  }
  if(p.state==='normal'){
   if(p.sam){ if(!p.ground)setAnim(p.vy<0?'s_rise':'s_fall');else setAnim(Math.abs(p.vx)>25?'s_run':'s_idle') }
   else if(N){ if(!p.ground)setAnim(p.vy<0?'n_rise':'n_fall');else setAnim(Math.abs(p.vx)>25?'n_run':'n_idle') }
   else if(p.wall)setAnim('climb');
   else if(!p.ground)setAnim(p.wj>0?'walljump':p.dj>0?'djump':p.vy<0?'jump':'fall');
   else if(p.hunt)setAnim('stalk');
   else if(!K.down){const v=Math.abs(p.vx);
    setAnim(p.startT>0?'start':v>300?'run':v>25?'walk':'idle')}
   // idle mannerisms after ~4s of doing nothing
   if(p.ground&&!N&&!p.hunt&&p.anim==='idle'&&!anyInput()){p.idleT+=dt;if(p.idleT>4){p.idleT=0;const m=MANNER[Math.floor(Math.random()*MANNER.length)];act('manner',m)}}else p.idleT=0;
  }
 }
 // physics
 if(!p.wall&&!['wingdash','dive','diveclaw','ledge','wallrun','nstorm','eclipse','finishhim'].includes(p.state))p.vy+=(p.state==='airspin'?600:p.hang>0?700:1900)*dt;
 if(p.state!=='ledge'){p.x+=p.vx*dt;p.y+=p.vy*dt;}
 if(p.state!=='ledge'&&p.y>WT+2&&p.x>WALL_X-60&&p.x<WALL_X+60){p.x=WALL_X-60;if(p.state==='zoomies')p.face=-1} // wall side
 if(p.vy>2200)p.vy=2200;
 const fl=floorAt(p.x);
 if(p.state!=='ledge'){
 if(p.ground||p.vy<0||p.wall||p.state==='ledge')p.fallTop=p.y;
 // long fall: acrobatic flip just before touching down
 if(!CINE.includes(p.state)){const h=floorAt(p.x)-p.y;const tr=p.state==='wallrun'?-1.5708:(!p.ground&&p.state==='normal'&&p.vy>300&&floorAt(p.x)-p.fallTop>300&&h<170)?(1-h/170)*6.283*p.face:0;
  if(p.ninja||p.sam){let df=((tr-p.rot+Math.PI)%6.2832+6.2832)%6.2832-Math.PI;p.rot=Math.abs(df)<.01?tr:p.rot+df*Math.min(1,dt*(p.state==='wallrun'?16:12));if(Math.abs(p.rot)<.01&&!tr)p.rot=0}else p.rot=tr}
 if(p.y>=fl&&p.vy>=0){p.y=fl;if(!p.ground&&p.state==='normal'){
   if(fl-p.fallTop>300&&!p.sam&&!p.ninja){act('land','land',{say:'LANDS ON HIS FEET!',c:'#ffe08a'});spark(p.x,fl,14,['#fff','#d9c49a'],200);shake=4}
   else if(p.vy>300){act('land',p.sam?'s_land':p.ninja?'n_land':'land');spark(p.x,fl,8,'#d9c49a',120)}}
  p.vy=0;p.ground=true;p.jumps=0;p.airDash=false;p.airSpin=false;p.airSwipe=false;p.tair=0;p.nair=0;p.sair=0;p.airIai=false;p.airHits=0;p.wj=0;p.dj=0}else p.ground=false;}
 if(p.x<50)p.x=50;if(p.x>WALL_X+60)p.x=WALL_X+60;
 // anim frames
 const fr=FR[p.anim]||FR.idle,a=A[p.anim]||A.idle;
 let fps=a[2];if(p.anim==='stalk')fps*=Math.min(1,Math.abs(p.vx)/80);if(p.anim==='climb'&&p.vy>=0)fps=0;
 if(p.state!=='ledge')p.ft+=dt*fps;p.fi=a[3]?Math.floor(p.ft)%fr.length:Math.min(fr.length-1,Math.floor(p.ft));
 if(p.anim==='jump'&&p.vy>-200)p.fi=fr.length-1;
 if(p.anim==='pounce')p.fi=p.vy<0?0:1;
 for(const w of waves){w.r+=dt*(w.big?900:600);w.l-=dt*2.2}for(let i=waves.length-1;i>=0;i--)if(waves[i].l<=0)waves.splice(i,1);
 for(const g of ghosts)g.l-=dt;for(let i=ghosts.length-1;i>=0;i--)if(ghosts[i].l<=0)ghosts.splice(i,1);
 for(const t of texts)t.l-=dt*.8;for(let i=texts.length-1;i>=0;i--)if(texts[i].l<=0)texts.splice(i,1);
 for(const s of shots){for(const d of dummies)if(d.alive&&!s.hit.has(d)&&Math.abs(d.x-s.x)<50&&s.y>d.y-130&&s.y<d.y+10){s.hit.add(d);hitDummy(d,s.fire?'fireball':'blast',Math.sign(s.vx))}s.x+=s.vx*dt;s.l-=dt;s.a+=dt*14;if(s.x>WALL_X-20&&s.vx>0&&s.y>WT){s.l=0;burst(s.x,s.y,s.fire)}if(s.x<20){s.l=0;burst(s.x,s.y,s.fire)}if(Math.random()<.8)sparks.push({x:s.x,y:s.y+(Math.random()-.5)*30,vx:-s.vx*.1,vy:(Math.random()-.5)*60,l:.3,c:s.fire?'#ffb040':'#7fd4ff'})}
 for(let i=shots.length-1;i>=0;i--)if(shots[i].l<=0)shots.splice(i,1);
 for(const w of meows){w.r+=dt*(w.big?700:520);if(w.r>w.maxR)w.l-=dt*4;
  for(const d of dummies){const dx=d.x-w.x;if(d.alive&&!w.hit.has(d)&&Math.abs(dx)<w.r&&Math.abs(dx)>w.r-90&&Math.sign(dx)!==-w.face&&Math.abs(d.y-60-w.y)<160){w.hit.add(d);hitDummy(d,w.big?'sonicmeow':'meow',w.face);d.vx*=w.power*1.4;d.vy*=Math.min(1.6,.6+w.power)}}}
 for(let i=meows.length-1;i>=0;i--)if(meows[i].l<=0)meows.splice(i,1);
 if(bubble){bubble.l-=dt;if(bubble.l<=0)bubble=null}
 for(const sl of slashes){if(sl.d>0){sl.d-=dt;continue}sl.l-=dt*(sl.sp||4)}for(let i=slashes.length-1;i>=0;i--)if(slashes[i].l<=0)slashes.splice(i,1);
 for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=400*dt;s.l-=dt}
 for(let i=sparks.length-1;i>=0;i--)if(sparks[i].l<=0)sparks.splice(i,1);
 meleeHits(dt);updDummies(dt);
 shake*=.85; // input buffer: an unused press stays live for ~0.15s so moves chain; any new action consumes it
 for(const k in P)if(acted||INSTANT.includes(k)||now-(BUF[k]??-9)>.15)delete P[k];acted=false;
 const nm={manner:p.anim,claw:p.anim.replace(/^claw(\d)/,'claw $1/3')}[p.state]||(p.state==='normal'?p.anim:p.state);
 if(now-errShown>3)lbl.textContent=(p.ninja?'🥷 NEON NINJA · ':p.sam?'⚔️ SAMURAI · ':'')+nm.replace(/^[nsr]_/,'')+(p.wall?' (wall)':'')+(p.hunt?' · HUNT':'');
}
function burst(x,y,fire){shake=10;for(let i=0;i<24;i++){const a=Math.random()*6.28,v=100+Math.random()*300;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5,c:i%2?'#fff':fire?'#ff9a2e':'#5cc8ff'})}}
function drawFrame(f,x,y,face,alpha){const im=f&&IMG[f.f];if(!im)return;ctx.save();if(alpha!=null)ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(face*SC,SC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#87c6f0';ctx.fillRect(0,0,cv.width,cv.height);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
 // camera follows Paddy upward (juggles, super leaps), eased
 const camT=Math.max(0,170-p.y+(p.y<GROUND-300?Math.max(0,Math.min(260,-p.vy*.2)):0));camY+=(camT-camY)*Math.min(1,(1/60)*(Math.abs(camT-camY)>150?16:7));if(!isFinite(camY))camY=0;
 ctx.setTransform(scale,0,0,scale,offX+sx*scale,offY+(sy+camY)*scale);
 drawAltSky(sx,sy);cineXform();
 ctx.fillStyle='#6dbb4a';ctx.fillRect(-500,GROUND,VW+1000,14);ctx.fillStyle='#b98a55';ctx.fillRect(-500,GROUND+14,VW+1000,200);
 // wall
 ctx.fillStyle='#8a7a6a';ctx.fillRect(WALL_X,WT,80,GROUND-WT);ctx.strokeStyle='#6c5e50';ctx.lineWidth=2;
 for(let y=WT;y<GROUND;y+=28){ctx.beginPath();ctx.moveTo(WALL_X,y);ctx.lineTo(WALL_X+80,y);ctx.stroke();const o=(y/28)%2?20:50;ctx.beginPath();ctx.moveTo(WALL_X+o,y);ctx.lineTo(WALL_X+o,y+28);ctx.stroke()}
 ctx.fillStyle='#fff8';ctx.font='14px system-ui';ctx.fillText('climb wall →',WALL_X-60,WT-140);
 if(cine.dim>.01){ctx.fillStyle=`rgba(22,8,48,${cine.dim})`;ctx.fillRect(-2000,-camY-500,VW+4000,VH+1000)}
 drawDummies();
 // shadow
 const hgt=floorAt(p.x)-p.y;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(p.x,floorAt(p.x)+3,60*Math.max(.4,1-hgt/400),9,0,0,6.28);ctx.fill();
 for(const g of ghosts){const im=g.f&&IMG[g.f.f];if(!im)continue;ctx.save();ctx.globalAlpha=Math.min(1,g.l*(g.blue?2:1.6));if(g.blue)ctx.globalCompositeOperation='lighter';ctx.translate(g.x,g.y);ctx.scale(g.face*SC,SC);ctx.drawImage(im,-g.f.ax,-g.f.ay);ctx.restore()}
 // player (a short crossfade from the previous animation)
 if(p.blend>0&&p.prevF)drawFrame(p.prevF,p.prevX,p.prevY,p.prevFace,(p.hunt?.55:1)*p.blend/.1);
 const mu=p.state==='nmorph'?Math.min(1,p.t/(p.mquick?.28:.5)):1;if(mu<1&&p.mfrom)drawFrame(p.mfrom,p.x,p.y,p.face,1-mu*mu*(3-2*mu));
 const sq=1;
 ctx.save();ctx.translate(p.x,p.y-(p.rot?60:0));ctx.rotate(p.rot||0);ctx.scale(2-sq,sq);ctx.translate(-p.x,-p.y+(p.rot?60:0));if(p.inv>0&&Math.floor(now*20)%2)ctx.globalAlpha=.45;
 drawFrame((FR[p.anim]||FR.idle)[p.fi],p.x+(p.wall?40:p.state==='wallrun'?14:0),p.y,p.face,mu<1?mu*mu*(3-2*mu):p.hunt?.55:(p.blend>0?1-.5*p.blend/.1:null));ctx.restore();
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
 drawFx();
 drawHUD()}
function drawHUD(){const sx=0;ctx.setTransform(scale,0,0,scale,offX,offY);
 if(hitNum){const a=1-hitNum.l,pop=a<.15?.4+a/.15*.9:1.3-Math.min(.3,(a-.15));fancy(String(hitNum.n),zX(p.x+p.face*40),zY(p.y-150)+camY-a*30,74,-.1*p.face,pop,Math.min(1,hitNum.l*2),hitNum.col)}
 if(flashT>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(.7,flashT*2.5)})`;ctx.fillRect(-500,-500,VW+1000,VH+1000)}
 drawCineHUD();drawKanji();drawTexts();drawCombo();drawLives();
 ctx.globalAlpha=1;ctx.textAlign='left';
}
function drawFx(){nDrawFx();r8DrawFx();
 // claw slash trails: bright curved crescents
 for(const sl of slashes){if(sl.d>0)continue;ctx.save();ctx.translate(sl.x,sl.y);ctx.scale(sl.face,1);ctx.globalCompositeOperation='lighter';
  const prog=1-sl.l,lv=sl.lvl||0,a1=sl.a0,a2=sl.a0+sl.sweep*Math.min(1,prog*2.2+.3),lo=Math.min(a1,a2),hi=Math.max(a1,a2);ctx.lineCap='round';
  if(lv>=4){ctx.globalAlpha=Math.max(0,sl.l)*.28;ctx.strokeStyle=sl.col;ctx.lineWidth=(16+lv*3.5)*sl.l+2;ctx.beginPath();ctx.arc(0,0,sl.r+5,lo,hi);ctx.stroke()}
  for(let k=0;k<3;k++){ctx.globalAlpha=Math.max(0,sl.l)*(1-k*.3);ctx.strokeStyle=k?sl.col:(sl.fire?'#fff3c0':'#fff');ctx.lineWidth=(sl.kind==='big'?16:11)*(1+lv*.08)*(1-k*.3)*sl.l+1;
   ctx.beginPath();ctx.arc(0,0,Math.max(4,sl.r-k*9),lo,hi);ctx.stroke()}
  if(lv>=6){ctx.fillStyle='#fff';for(let j=0;j<=7;j++){const a=lo+(hi-lo)*j/7,rr=sl.r+((j*37)%13-6);ctx.globalAlpha=Math.max(0,sl.l)*.9;ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,2+lv*.45,0,6.283);ctx.fill()}}
  ctx.restore()}
 // tail-whip swoosh ring
 if(p.state==='tailwhip'){ctx.save();ctx.globalCompositeOperation='lighter';const a=p.t*28;
  for(let k=0;k<4;k++){ctx.globalAlpha=.5-k*.1;ctx.strokeStyle=k?'#ffe7c2':'#fff';ctx.lineWidth=10-k*2;ctx.beginPath();ctx.ellipse(p.x,p.y-38,100,26,0,a-1.6-k*.35,a-k*.35);ctx.stroke()}ctx.restore()}
 // timing cue for the combo extension
 {const cu=cueInfo();if(cu){const H=cu.H,w=p.t>=H-.2;ctx.save();ctx.globalAlpha=w?.9:.35;ctx.strokeStyle=w?'#7fffd4':'#fff';ctx.lineWidth=w?5:2;
  ctx.beginPath();ctx.arc(p.x,p.y-70,w?52:52+(H-.2-p.t)*200,0,6.283);ctx.stroke();ctx.restore()}}
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
 for(let i=0;i<3;i++){ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(24+i*14-6,78,10,4);ctx.fillStyle='#fff';ctx.fillRect(24+i*14-6,78,10*Math.max(0,Math.min(1,p.hp-i)),4)}}
// game loop: never dies — an error is caught, reported once on screen, and Paddy is reset to idle
let last=0,errShown=0;
function loop(t){requestAnimationFrame(loop);let dt=(t-last)/1000;last=t;if(!(dt>0))dt=0;dt=Math.min(.033,dt);hitstop=Math.min(Math.max(hitstop,0),.3);
 slowT-=dt;TS=slowT>0?.3:1;try{if(hitstop>0){hitstop-=dt;shake*=.9}else{update(dt*TS);updCombo(dt*TS)}draw()}
 catch(e){console.error(e);try{localStorage.setItem('paddyLastError',String(e&&e.stack||e))}catch(_){}
  camY=0;slowT=0;Object.assign(p,{rot:0,grab:null,state:'normal',wall:false,vx:0,vy:0,combo:0,blend:0,jc:0,mc:0});if(!isFinite(p.x))p.x=300;if(!isFinite(p.y))p.y=GROUND;shake=0;
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
const NAMES={pawpop:'PAW POP!',barge:'BLINK BARGE!',bunnykick:'KICK!',bunnylaunch:'BUNNY KICK GRAB!',superleap:'SUPER LEAP!',meow:'MEOW!',sonicmeow:'SONIC MEOW!!',claw1:'SCRATCH!',claw2:'SWIPE!',claw3:'TRIPLE CLAW!',dashstrike:'DASH STRIKE!',airswipe:'AIR SWIPE!',airspin:'AIR SPIN!',dive:'DIVE BOMB!',diveclaw:'DIVE CLAW!',pounce:'POUNCE!',blast:'ENERGY BLAST!',finisher:'FINISHER!',uppercut:'UPPERCUT!',tailwhip:'TAIL WHIP!',swat:'SWAT!',hiss:'HISS!',roar:'ROAR!',fireball:'FIREBALL!'};
// knockback: [vx, vy, float seconds, hitstop]
const KB={pawpop:[100,-950,.55,.06],swat:[120,-900,.5,.06],barge:[700,-300,.15,.08],bunnykick:[0,0,0,.025],bunnylaunch:[500,-1500,.8,.2],launcher:[120,-900,.5,.06],superleap:[160,-700,.35,.06],meow:[260,-200,.05,.04],sonicmeow:[520,-420,.25,.09],claw1:[220,-180,0,.04],claw2:[260,-220,0,.04],claw3:[420,-720,.3,.08],dashstrike:[750,-380,.2,.09],airswipe:[200,-480,.45,.05],airspin:[120,-330,.5,.035],
 dive:[0,-850,.25,.11],diveclaw:[520,-360,.2,.08],pounce:[380,-520,.2,.07],blast:[620,-420,.2,.08],
 finisher:[700,-900,.4,.12],uppercut:[120,-950,.4,.07],tailwhip:[380,-300,.1,.05],swat:[120,-900,.5,.06],hiss:[300,-120,0,.03],roar:[650,-500,.25,.09],fireball:[700,-460,.2,.09]};
const REACH={pawpop:[130,190],barge:[170,150],superleap:[120,220],claw1:[115,130],claw2:[125,130],claw3:[140,150],dashstrike:[160,130],airswipe:[140,150],airspin:[130,170],diveclaw:[110,120],pounce:[120,120],finisher:[170,170],uppercut:[120,190],tailwhip:[130,120],swat:[110,90],};
const C={n:0,t:0,max:1.2,pop:0,best:0,fin:null,lastState:'',atk:0,spinT:0};
const dummies=[{home:660}].map(d=>({...d,x:d.home,y:GROUND,vx:0,vy:0,fl:0,hp:40,max:40,hpShow:40,h:190,flash:0,sq:0,rot:0,alive:true,last:-1,calm:0,face:-1,fs:-1,st:'idle',t:0,ft:0,fi:0,anim:'r_idle',cool:2,stun:0,aggro:0,blend:0,bub:null}));
function tierCol(n){return n>=50?`hsl(${(performance.now()/4)%360},100%,65%)`:n>=25?'#ff6fcf':n>=10?'#ff9a2e':n>=5?'#ffe14d':'#fff'}
function extend(name){if(C.n>0){C.t=C.max;if(name)say(name,'#fff',false)}}
function comboEnd(silent){if(C.n>=2&&!silent){C.fin={n:C.n,l:2.2};if(C.n>=10&&p.state==='normal'&&p.ground)victory()}C.n=0;C.t=0}
function updCombo(dt){if(C.n>0){C.t-=dt;if(C.t<=0)comboEnd()}C.pop*=Math.pow(.002,dt);if(C.fin){C.fin.l-=dt;if(C.fin.l<=0)C.fin=null}}
function addHit(move){C.n++;C.t=C.max;C.pop=1;C.best=Math.max(C.best,C.n);C.fin=null;
 const rank={10:'NICE!',25:'AWESOME!',50:'PURRFECT!',100:'LEGENDARY!'}[C.n];
 if(rank)say(rank,tierCol(C.n),true);else say(NAMES[move]||move,'#fff',false)}
function hitDummy(d,move,dir){const k=KB[move]||KB.claw1;
 d.vx=dir*k[0]*(0.85+Math.random()*.3);d.vy=Math.min(d.vy,0)+k[1];if(d.y>=GROUND-1&&k[1]>-200)d.vy=k[1];d.fl=k[2];d.flash=.12;d.sq=1;const air=d.y<GROUND-25;d.hp-=1;if(air||k[1]<-600){d.fl=Math.max(d.fl,.55)}if(air&&!['bunnykick'].includes(move)){C.jug=(C.jug||0)+1;if(C.jug%3===1)setTimeout(()=>say('JUGGLE!','#7fffd4'),0)}else C.jug=0;
 if(!p.ground){p.lastAirHitT=now;const lift=air&&LIFT.includes(move);p.hang=.3;const L=Math.min(1400,440+(C.jug||0)*30);p.vy=Math.min(p.vy,lift?-L:-60);if(lift){d.vy=d.y<p.y-90?-(L-120):-(L+60);d.vx*=.2;d.fl=Math.max(d.fl,.5)}p.airHits++;p.airSpin=p.airSpin&&p.airHits<2}d.calm=0;dogHit(d,move,air);
 hitstop=Math.max(hitstop,k[3]);shake=Math.max(shake,4+k[3]*60);addHit(move);
 const hx=d.x-dir*20,hy=d.y-70;
 for(let i=0;i<12;i++){const a=Math.random()*6.28,v=150+Math.random()*350;sparks.push({x:hx,y:hy,vx:Math.cos(a)*v+dir*120,vy:Math.sin(a)*v,l:.35,c:['#fff','#ffe14d','#ff9ad5','#8fe0ff'][i%4]})}
 waves.push({x:hx,y:hy,r:8,l:.6,big:false});
 if(d.hp<=0)d.hp=0}
function r_reach(st){return (REACH[st]||[0])[0]}
function meleeHits(dt){const st=p.state==='claw'?p.anim:p.state==='tailwhip'&&p.tn===3?'tail3':p.state;if(['bunny','eclipse','finishhim','sfinal'].includes(p.state))return;
 if(st!==C.lastState){C.lastState=st;C.atk++}
 if(st==='airspin'||st==='finisher'||st==='superleap'||(st==='n8'&&p.t<.42)||(st==='s5'&&p.t<.22)){C.spinT+=dt;if(C.spinT>(st==='n8'?.07:st==='s5'?.1:.12)){C.spinT=0;C.atk++}}
 const r=REACH[st];if(!r)return;
 if(/^pc\d$/.test(st)&&(p.t<.04||p.t>.26))return;if((st.startsWith('claw')||st==='swat')&&p.t>.22)return;if(/^n[1-7]$|^nrise$|^nair$|^nstep$/.test(st)&&(p.t>.22||p.t<.03))return;if(st==='n8'&&p.t>.42)return;if(/^s[1-7]$|^slaunch$|^sair$/.test(st)&&(p.t>.22||p.t<.03))return;if(st==='finisher'&&p.t<.25)return;
 for(const d of dummies){if(!d.alive||d.last===C.atk)continue;
  const dx=(d.x-p.x)*p.face,within=(st==='airspin'||st==='tailwhip'||st==='tail3'||st==='superleap'||st==='pc5'||st==='n4'||st==='s5')?Math.abs(d.x-p.x)<r[0]:(dx>-35&&dx<r[0]);
  if(within&&d.y-(d.h||130)<p.y+10&&d.y>p.y-r[1]){d.last=C.atk;hitDummy(d,st,(st==='airspin'||st==='tailwhip'||st==='tail3'||st==='superleap'||st==='pc5'||st==='n4'||st==='s5')?Math.sign(d.x-p.x)||p.face:p.face)}}}
function areaHit(x,y,rad,move){for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<rad&&Math.abs(d.y-y)<140)hitDummy(d,move,Math.sign(d.x-x)||p.face)}
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
// ===================== NEON NINJA (cyborg form) =====================
// acrobatic: flips, wall-run, shadow-step teleport strikes, air flurry, throwing stars, hold-charge Shadow Storm
const NST=['eclipse','finishhim','nrise','nmorph','n1','n2','n3','n4','n5','n6','n7','n8','nstep','nstorm','ncharge','nthrow','nair','ndive','nflip','nbflip','wallrun','ndash'];
const NV='#b98cff',NC='#7fe8ff';
const NCH=[null,{s:'n1',a:'n_c1',k:'low',lunge:220,nm:'NEON SLASH!',c:'#d9c6ff'},{s:'n2',a:'n_c2',k:'down',lunge:240,nm:'TWIN FANG!',c:'#9fe8ff'},{s:'n3',a:'n_c3',k:'over',lunge:280,nm:'SPIRAL CUT!',c:'#b98cff'},
 {s:'n4',a:'n_c4',k:'spin',lunge:260,nm:'SHADOW SPIN!',c:'#7fe8ff'},{s:'n5',a:'n_c5',k:'flat',lunge:420,nm:'FLYING FANG!',c:'#d07bff'},{s:'n6',a:'n_a5',k:'cross',lunge:320,nm:'VIOLET STORM!',c:'#5ff0ff'},
 {s:'n7',a:'n_c7',k:'rise',lunge:200,nm:'CRESCENT RISE!',c:'#ff7ce0'},{s:'n8',a:'n_a6',k:'cross',lunge:430,nm:'THOUSAND CUTS!',c:'#ffffff'},{s:'nrise',a:'n_rise5',k:'up',lunge:120,nm:'RISING CRESCENT!',c:NV}];
Object.assign(NAMES,{n1:'NEON SLASH!',n2:'TWIN FANG!',n3:'SPIRAL CUT!',n4:'SHADOW SPIN!',n5:'FLYING FANG!',n6:'VIOLET STORM!',n7:'CRESCENT RISE!',nrise:'RISING CRESCENT!',n8:'THOUSAND CUTS!',n8fin:'THOUSAND CUTS!!',nair:'AIR FLURRY!',nstar:'THROWING STAR!',nstep:'SHADOW STEP!',nstorm:'SHADOW STORM!',ndive:'FALLING STAR!',ndash:'SHADOW DASH!'});
Object.assign(KB,{n1:[200,-190,0,.035],n2:[220,-230,0,.04],n3:[260,-300,.05,.05],n4:[260,-300,.1,.055],n5:[380,-300,.1,.06],n6:[330,-360,.15,.07],n7:[120,-700,.4,.08],nrise:[70,-880,.55,.07],n8:[120,-240,.3,.025],n8fin:[650,-720,.35,.12],
 nair:[150,-300,.45,.04],nstar:[120,-150,.25,.03],nstep:[280,-650,.4,.07],nstorm:[160,-780,.5,.06],ndive:[350,-520,.2,.08],ndash:[560,-340,.15,.06]});
Object.assign(REACH,{n1:[135,140],n2:[140,150],n3:[150,170],n4:[150,160],n5:[185,150],n6:[170,160],n7:[150,215],nrise:[145,215],n8:[175,170],nair:[155,175],nstep:[160,180],ndash:[165,140],ndive:[130,140]});
let stars=[];
const ninjaBtn=document.querySelector('[data-k=morph]');
const clampX=x=>Math.max(55,Math.min(p.y>WT+2?WALL_X-62:WALL_X+60,x));
function toggleNinja(){cycleForm()}
function nTarget(range){let best=null,bd=range;for(const d of dummies){if(!d.alive||false)continue;const dd=Math.abs(d.x-p.x)+((d.x-p.x)*p.face<0?120:0);if(dd<bd){bd=dd;best=d}}return best}
function nHit(i){const c=NCH[i];p.ncombo=i===9?0:i;p.ncT=.6;C.atk++;act(c.s,c.a,{say:c.nm,c:c.c});p.queued=false;p.perfect=false;p.miss=false;p.vx=p.face*c.lunge;
 if(i===9){slash(c.k,NV,{scale:1.15,lvl:3});spark(p.x+p.face*80,p.y-70,12,[NV,NC,'#fff'],320);shake=6;p.vy=-660;p.ground=false;p.jumps=1;p.nair=0;return}
 popNum(i,c.c);if(i<8)clawFx(i,c.k,c.c,i%2?NV:NC);else{slash('cross',NV,{scale:1.5,lvl:8});shake=10}}
function nJump(){if(p.ground){if(K.down){act('nbflip','n_flip',{say:'BACKFLIP!',c:NV});p.vy=-760;p.vx=-p.face*380;p.inv=.4;p.ground=false;p.jumps=1;return true}
  p.state='normal';p.vy=-730;p.ground=false;p.jumps=1;p.lastJump=now;setAnim('n_rise');spark(p.x,p.y,8,[NV,'#fff'],150);acted=true;return true}
 if(p.jumps<3){p.jumps=Math.max(2,p.jumps+1);act('nflip','n_flip2',{say:p.jumps>=3?'TRIPLE FLIP!':'FLIP!',c:NV});p.vy=-640;spark(p.x,p.y-30,10,[NV,NC],180);extend();return true}return false}
function nStep(){if(p.nstepCool>0||['nmorph','nstorm','hurt','respawn','wallrun'].includes(p.state))return false;
 p.nsteps=(p.nstepT>0?p.nsteps:0)+1;p.nstepT=1;if(p.nsteps>=3)p.nstepCool=.7;
 const d=nTarget(600),fx=p.x,fy=p.y;puffShadow(p.x,p.y);
 if(d){const side=d.x>p.x?1:-1;p.x=clampX(d.x+side*80);p.face=d.x>p.x?1:-1;if(d.y<GROUND-40){p.y=d.y;p.ground=false;p.vy=-150}}
 else p.x=clampX(p.x+p.face*280);
 for(let k=1;k<=6;k++)ghosts.push({x:fx+(p.x-fx)*k/7,y:fy+(p.y-fy)*k/7,f:FR.n_step[0],face:p.face,l:.12+k*.03,blue:1});
 act('nstep','n_step',{say:'SHADOW STEP!',c:NV});p.vx=p.face*160;p.inv=.3;C.atk++;slash('cross',NV,{scale:1.1});puffShadow(p.x,p.y);extend();return true}
function nStorm(c){const list=dummies.filter(d=>d.alive&&Math.abs(d.x-p.x)<700).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
 const n=3+Math.round(c*3),seq=[];for(let i=0;i<n&&list.length;i++)seq.push(list[i%list.length]);
 act('nstorm','n_a3',{say:'SHADOW STORM!',c:NV});p.storm={seq,i:0,t:.12,x0:p.x};p.inv=1.5;p.vx=0;p.vy=0;shake=10;flashT=.12;
 for(let i=0;i<3;i++)waves.push({x:p.x,y:p.y-40*i,r:10+i*20,l:1,big:true})}
function nThrow(){act('nthrow','n_throw',{say:'THROWING STARS!',c:NC});if(!p.ground)p.vy=Math.min(p.vy,-90);p.vx*=.4}
function nAir(){const hot=now-(p.lastAirHitT||-9)<.6;if(p.nair>=6&&!hot)return false;p.nair++;C.atk++;popNum(p.nair,p.nair%2?NV:NC);
 if(p.nair>=6&&!hot){act('ndive','n_dive',{say:'FALLING STAR!',c:NC});p.vy=1150;p.vx=p.face*520;return true}
 act('nair',p.nair%2?'n_air1':'n_air2',{say:p.nair>=4?'AIR FLURRY x'+p.nair+'!':'AIR FLURRY!',c:NV});p.vy=Math.min(p.vy,-190);p.vx=p.face*240;
 slash(['down','up','flat','rise','cross','over'][(p.nair-1)%6],p.nair%2?NV:NC,{scale:1.2,lvl:Math.min(8,p.nair)});spark(p.x+p.face*70,p.y-70,8,[NV,NC]);return true}
function nDash(dir){p.face=dir==='right'?1:-1;p.dashCool=.4;p.dashStart=now;if(!p.ground){if(p.airDash)return;p.airDash=true}
 act('ndash','n_dash',{say:'SHADOW DASH!',c:NV});p.vx=p.face*1100;if(!p.ground)p.vy=-40;p.inv=.2;shake=4}
function nCancel(){if(P.special){act('ncharge','n_charge');p.nc=0;return true}if(P.tail||P.swat||P.hiss){nThrow();return true}
 if(P.jump&&nJump())return true;if(P.dash&&p.dashCool<=0&&!(p.airDash&&!p.ground)){nDash(P.dash);return true}return false}
function nMoves(dir){
 if(!p.wall&&p.y>WT+10&&p.x>=WALL_X-64&&K.right&&!K.down){act('wallrun','n_wall',{say:'WALL RUN!',c:NV});p.face=1;p.vx=0;p.jumps=1;p.airDash=false;return}
 if(P.jump&&nJump())return;
 if(!p.ground&&P.down&&!P.attack){act('ndive','n_dive',{say:'FALLING STAR!',c:NC});p.vy=1150;p.vx=p.face*(dir?520:150);return}
 if(P.attack){if(!p.ground){if(K.down){act('ndive','n_dive',{say:'FALLING STAR!',c:NC});p.vy=1150;p.vx=p.face*520}else nAir();return}
  if(K.up||K.down){nHit(9);return}nHit(p.ncT>0&&p.ncombo<3?p.ncombo+1:1);return}
 if(P.special){act('ncharge','n_charge');p.nc=0;return}
 if(P.tail||P.swat||P.hiss){nThrow();return}}
function nState(S,dt,end,dir){switch(S){
 case 'eclipse': eclipseState(dt);break;
 case 'finishhim': finishState(dt);break;
 case 'nmorph': p.vx*=Math.pow(.05,dt);if(p.morphQ&&p.t>=.18){const q=p.morphQ;p.morphQ=false;setForm(q-1);break}if(p.t%.04<dt)spark(p.x+(Math.random()-.5)*90,p.y-Math.random()*120,2,[NV,NC,'#fff'],200);if(P.attack&&p.t>.1){p.mquick=false;if(p.sam){if(p.ground)sHit(1);else sAir()}else if(p.ninja){if(p.ground)nHit(1);else nAir()}else if(p.ground){p.combo=0;startClaw()}else{p.airHits=0;p.airSwipe=true;act('airswipe','airswipe',{say:'AIR SWIPE!',c:'#bfe8ff'});p.vy=Math.min(p.vy,-120)}break}
  if(p.t>(p.mquick?.28:.5)){p.state='normal';p.mquick=false}break;
 case 'n1':case 'n2':case 'n3':case 'n4':case 'n5':case 'n6':case 'n7':case 'nrise':{p.vx*=Math.pow(.02,dt);if(S==='nrise'&&!p.ground)p.vx=0;const H=.36,i=p.ncombo,timed=S!=='nrise'&&i>=3;
  if(P.attack){if(!timed)p.queued=true;else if(!p.miss){if(p.t>=H-.2){p.perfect=true;p.queued=true}else if(!p.perfect)p.miss=true}}
  if(p.t>.1&&nCancel())break;
  if(p.queued&&(timed?p.perfect:p.t>.13)){p.queued=false;if(!p.ground){nAir()}else if(S==='nrise')nHit(1);else{
    if(timed){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false});hitstop=Math.max(hitstop,.05)}
    if(i===7)neonEclipse();else nHit(i+1)}}
  else if(p.t>(S==='nrise'?.42:timed?H+.06:.34)||(S==='nrise'&&p.ground&&p.t>.15)){p.state='normal';if(timed)p.ncombo=0}}break;
 case 'n8': p.vx*=Math.pow(.05,dt);if(p.t%.05<dt)ghosts.push({x:p.x,y:p.y,f:FR.n_a6[p.fi],face:p.face,l:.2,blue:1});
  if(p.t%.07<dt)slash(['down','up','flat'][Math.floor(p.t/.07)%3],Math.floor(p.t/.07)%2?NV:NC,{scale:1.2});
  if(p.t>.42&&!p.shot){p.shot=true;for(const d of dummies)if(d.alive){const dx=(d.x-p.x)*p.face;if(dx>-40&&dx<200&&Math.abs(d.y-p.y)<170)hitDummy(d,'n8fin',p.face)}
   shake=16;slowT=.18;flashT=.15;say('THOUSAND CUTS!!',NV,true);waves.push({x:p.x+p.face*80,y:p.y-60,r:10,l:1,big:true})}
  if(p.t>.3&&nCancel())break;if(p.t>.62){p.state='normal';p.ncombo=0}break;
 case 'nstep': p.vx*=Math.pow(.05,dt);if(!p.ground)p.vy=Math.min(p.vy,120);if(P.attack)p.queued=true;
  if(p.t>.12){if(P.special){if(nStep())break}if(p.queued){p.queued=false;if(p.ground)nHit(p.ncombo<3?p.ncombo+1:1);else nAir();break}if(nCancel())break}
  if(p.t>.34)p.state='normal';break;
 case 'ncharge': p.vx*=Math.pow(.03,dt);if(!p.ground)p.vy=Math.min(p.vy,60);p.nc=Math.max(0,Math.min(1,(p.t-.3)/.8));
  if(p.t>.3&&p.t%.04<dt){const a=Math.random()*6.28;sparks.push({x:p.x+Math.cos(a)*80,y:p.y-60+Math.sin(a)*60,vx:-Math.cos(a)*160,vy:-Math.sin(a)*160,l:.4,c:Math.random()<.5?NV:NC})}
  if(!K.special||p.t>2.4){if(p.t<.3){if(!nStep())p.state='normal'}else nStorm(p.nc)}break;
 case 'nstorm':{const s=p.storm;p.vx=0;p.vy=0;s.t-=dt;
  if(s.t<=0){if(s.i<s.seq.length){const d=s.seq[s.i],side=s.i%2?-1:1,fx=p.x,fy=p.y;
    p.x=clampX(d.x+side*85);p.face=d.x>p.x?1:-1;p.y=Math.min(GROUND,d.y);
    for(let k=1;k<=4;k++)ghosts.push({x:fx+(p.x-fx)*k/5,y:fy+(p.y-fy)*k/5,f:FR.n_a3[0],face:p.face,l:.1+k*.04,blue:1});
    puffShadow(p.x,p.y);setAnim(s.i%2?'n_a4':'n_a3',true);slash(s.i%2?'up':'down',s.i%2?NC:NV,{scale:1.3});if(d.alive){d.hp=Math.max(2,d.hp);hitDummy(d,'nstorm',p.face)}s.i++;s.t=.15}
   else{p.state='normal';p.vy=-320;p.ground=false;p.inv=.5;shake=18;slowT=.25;flashT=.25;say('SHADOW STORM!!',NV,true);burst(p.x,p.y-60);p.storm=null}}}break;
 case 'nthrow': p.vx*=Math.pow(.05,dt);if(!p.ground)p.vy=Math.min(p.vy,100);
  if(p.t>.1&&!p.shot){p.shot=true;for(const a of [-.13,0,.13])stars.push({x:p.x+p.face*60,y:p.y-85,vx:p.face*950*Math.cos(a),vy:950*Math.sin(a),r:0,l:.85,hit:new Set()});shake=3}
  if(p.t>.1&&(P.tail||P.swat)){nThrow();break}if(p.t>.16&&nCancel())break;if(P.attack&&p.t>.14){if(p.ground)nHit(1);else nAir();break}if(p.t>.3)p.state='normal';break;
 case 'nair': p.vy=Math.min(p.vy,140);if(p.t>.08&&P.attack){if(K.down){act('ndive','n_dive',{say:'FALLING STAR!',c:NC});p.vy=1150;p.vx=p.face*520}else nAir();break}
  if(p.t>.1&&nCancel())break;if(p.t>.28||p.ground)p.state='normal';break;
 case 'ndive': p.vy=1150;if(p.t%.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.n_dive[0],face:p.face,l:.22,blue:1});
  if(p.ground){areaHit(p.x,p.y,160,'ndive');shake=12;waves.push({x:p.x,y:p.y,r:10,l:1,big:true});spark(p.x,p.y,18,[NV,NC,'#fff'],380);act('land','n_land');p.vx=p.face*160}break;
 case 'nflip':case 'nbflip': p.vx+=(dir*470-p.vx)*Math.min(1,dt*5);if(p.t%.04<dt)ghosts.push({x:p.x,y:p.y,f:FR[p.anim][p.fi],face:p.face,l:.16,blue:1});
  if(P.attack){nAir();break}if(p.t>.08&&nCancel())break;if(P.down){act('ndive','n_dive',{say:'FALLING STAR!',c:NC});p.vy=1150;p.vx=p.face*520;break}
  if(p.ground&&p.t>.1){act('land','n_land');break}if(end){p.state='normal'}break;
 case 'wallrun': p.x=WALL_X-60;p.vx=0;p.vy=-640;p.face=1;if(p.t%.03<dt)sparks.push({x:WALL_X-2,y:p.y-20,vx:-60-Math.random()*80,vy:120,l:.3,c:Math.random()<.5?NV:NC});
  if(P.jump){p.rotHold=0;act('nflip','n_flip2',{say:'WALL KICK!',c:NV});p.vy=-700;p.vx=-430;p.face=-1;p.jumps=1;extend('WALL KICK!');break}
  if(!K.right||K.down){p.state='normal';p.vy=-100;break}
  if(p.y<WT+24){act('nflip','n_flip2',{say:'FLIP OVER!',c:NV});p.x=WALL_X+15;p.y=WT-24;p.vy=-430;p.vx=200;p.jumps=1;break}break;
 case 'ndash': if(p.ground)p.vy=0;else p.vy=Math.min(p.vy,60);if(p.t%.025<dt)ghosts.push({x:p.x,y:p.y,f:FR.n_dash[p.fi],face:p.face,l:.28,blue:1});
  if(P.attack&&p.t>.04){if(p.ground)nHit(3);else nAir();break}if(p.t>.08&&(P.special||P.tail||P.jump)&&nCancel())break;
  if(p.t>.24){p.state='normal';p.vx=p.face*380}break;
 }}
function nUpdate(dt){p.ncT-=dt;if(p.ncT<=0&&!NST.includes(p.state))p.ncombo=0;p.nstepT-=dt;p.nstepCool-=dt;
 
 for(const s of stars){s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=dt*26;s.l-=dt;
  for(const d of dummies)if(d.alive&&!s.hit.has(d)&&Math.abs(d.x-s.x)<42&&s.y>d.y-(d.h||155)&&s.y<d.y+5){s.hit.add(d);hitDummy(d,'nstar',Math.sign(s.vx));s.l=Math.min(s.l,.05);spark(s.x,s.y,8,[NC,'#fff'])}
  
  if((s.x>WALL_X-20&&s.y>WT&&s.vx>0)||s.x<10||s.x>VW+40){s.l=0;spark(s.x,s.y,6,[NC,'#fff'])}}
 for(let i=stars.length-1;i>=0;i--)if(stars[i].l<=0)stars.splice(i,1)}
function nDrawFx(){r6DrawFx();
 for(const s of stars){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.r);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,s.l*4);
  const g=ctx.createRadialGradient(0,0,2,0,0,26);g.addColorStop(0,'rgba(200,250,255,.9)');g.addColorStop(1,'rgba(120,80,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,26,0,6.283);ctx.fill();
  ctx.globalCompositeOperation='source-over';ctx.fillStyle='#e8fbff';ctx.strokeStyle='#5a3fb0';ctx.lineWidth=2;ctx.beginPath();
  for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?5:16;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
 if(p.state==='ncharge'&&p.t>.3){const ch=p.nc;ctx.save();ctx.globalCompositeOperation='lighter';const R2=40+70*ch+Math.sin(now*30)*4;
  const g=ctx.createRadialGradient(p.x,p.y-60,6,p.x,p.y-60,R2);g.addColorStop(0,'rgba(200,160,255,.85)');g.addColorStop(1,'rgba(90,40,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y-60,R2,0,6.283);ctx.fill();
  ctx.strokeStyle=NC;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y-60,30+50*ch,now*6,now*6+4.5);ctx.stroke();ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(p.x-50,p.y-185,100,9);ctx.fillStyle=ch>=1?'#fff':NV;ctx.fillRect(p.x-50,p.y-185,100*ch,9)}
 if(p.state==='nmorph'){const u=Math.min(1,p.t/.5);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.sin(u*Math.PI)*.8;
  const g=ctx.createRadialGradient(p.x,p.y-60,10,p.x,p.y-60,150);g.addColorStop(0,p.sam?'rgba(255,160,170,.9)':p.ninja?'rgba(220,190,255,.9)':'rgba(255,236,190,.9)');g.addColorStop(1,p.sam?'rgba(255,40,60,0)':p.ninja?'rgba(100,60,255,0)':'rgba(255,200,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y-60,150,0,6.283);ctx.fill();ctx.restore()}}

// ===================== ROUND 6: flowing claw chains, cinematic finishers, rising juggles, combo strings =====================
Object.assign(A,{pc1:['clawsa',[0,1],15,0],pc2:['clawsa',[2,3],15,0],pc3:['clawsa',[4,5],13,0],pc4:['clawsb',[0,1],15,0],pc5:['clawsb',[2,3],12,0],pc6:['clawsb',[4,5,6],16,0],
 pc7:['clawsc',[0,1],15,0],pc8:['clawsc',[4,5],12,0],pclunge:['clawsc',[2,3],12,0],
 n_c1:['n_clawsa',[0,1],16,0],n_c2:['n_clawsa',[2,3],16,0],n_c3:['n_clawsa',[4,5],14,0],n_c4:['n_clawsb',[0,1,2],18,0],n_c5:['n_clawsb',[3,4],14,0],n_c7:['n_clawsb',[6,7],14,0],
 n_er:['n_clawsa',[4],1,0],n_es:['n_clawsa',[5],1,0]});
Object.assign(NAMES,{pc1:'LEFT PAW!',pc2:'RIGHT PAW!',pc3:'TRIPLE CLAW!',pc4:'LOW SWEEP!',pc5:'SPIN SWIPE!',pc6:'RISING CLAW!',pc7:'DOUBLE CLAW X!',pc8:'HAMMER PAWS!',bunnygrab:'GRAB!',
 eclipsehit:'SHADOW STRIKE!',eclipsefin:'NEON ECLIPSE!!',finishhim:'FINISHED!!',tail3:'TAIL LAUNCHER!',morphstrike:'TRANSFORM STRIKE!',cyclone:'CLAW CYCLONE!',cyclonefin:'CLAW CYCLONE!!',
 tornado:'NINJA TORNADO!',tornadofin:'NINJA TORNADO!!',twister:'TAIL TWISTER!',tailslam:'TAIL SPIN SLAM!',parade:'PHANTOM PARADE!'});
Object.assign(KB,{pc1:[200,-170,0,.035],pc2:[220,-200,0,.04],pc3:[260,-300,.05,.05],pc4:[240,-280,.05,.055],pc5:[300,-320,.1,.06],pc6:[140,-720,.35,.07],pc7:[380,-380,.2,.085],pc8:[520,-600,.3,.11],
 bunnygrab:[0,-120,.5,.05],eclipsehit:[0,0,0,.03],eclipsefin:[300,-2300,1,.2],finishhim:[200,-2600,1,.2],tail3:[60,-820,.5,.09],morphstrike:[140,-620,.5,.08],
 cyclone:[30,-280,.4,.02],cyclonefin:[380,-950,.5,.1],tornado:[40,-330,.45,.02],tornadofin:[450,-1100,.55,.12],twister:[200,-700,.45,.07],tailslam:[420,-800,.4,.1],parade:[500,-700,.35,.09]});
Object.assign(REACH,{pc1:[120,130],pc2:[125,140],pc3:[135,170],pc4:[140,110],pc5:[140,150],pc6:[130,220],pc7:[145,150],pc8:[165,170],tail3:[140,140]});
const CINE=['bunny','eclipse','finishhim'];
const LIFT=['airswipe','airspin','nair','nstep','tailwhip','tail3','morphstrike','pc7','pc8'];
const HYPE=[[500,'HIGHER!'],[1200,'SKY HIGH!'],[2200,'ABOVE THE CLOUDS!'],[3500,'SUNSET SOARING!'],[5200,'STRATOSPHERE!'],[7500,'OUTER SPACE!!'],[10500,'TO THE MOON!!!'],[15000,'INTERGALACTIC!!!!']];
const cine={z:1,tz:1,fx:0,fy:0,bars:0,tb:0,dim:0,tdim:0,card:null,pillar:null,hype:null,altA:0,on:false,tx:0,ty:0};
function cineGo(z,dim){cine.tz=z;cine.tb=1;cine.tdim=dim}
function card(title,sub,col){cine.card={t:0,title,sub,col}}
function zX(x){return cine.on?cine.tx+(x-cine.fx)*cine.z:x}
function zY(y){return cine.on?cine.ty+(y-cine.fy)*cine.z:y}
function cineXform(){cine.on=cine.z>1.002;if(!cine.on)return;const a=Math.min(1,(cine.z-1)*2.2);cine.tx=cine.fx+(VW/2-cine.fx)*a;cine.ty=cine.fy+(VH*.55-camY-cine.fy)*a;
 ctx.translate(cine.tx,cine.ty);ctx.scale(cine.z,cine.z);ctx.translate(-cine.fx,-cine.fy)}
// altitude sky: blue -> sunset -> dusk -> deep blue -> space
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function mix(a,b,u){const A1=hx(a),B1=hx(b);return `rgb(${A1.map((v,i)=>Math.round(v+(B1[i]-v)*u)).join(',')})`}
function skyAt(h){const base=formBase();
 const st=[[0,base[0],base[1]],[1400,'#ffb37a','#ffe0b0'],[3200,'#7a4fa8','#ff8f7a'],[5500,'#1a2368','#4b3f9a'],[8500,'#03040c','#0e1236']];
 for(let i=0;i<st.length-1;i++){if(h<st[i+1][0]){const u=(h-st[i][0])/(st[i+1][0]-st[i][0]),e=u*u*(3-2*u);return [mix(st[i][1],st[i+1][1],e),mix(st[i][2],st[i+1][2],e)]}}return [st[4][1],st[4][2]]}
function drawAltSky(){const h=Math.max(0,camY);ctx.save();ctx.setTransform(scale,0,0,scale,offX,offY);const c=skyAt(h),g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);
 ctx.fillStyle=g;ctx.fillRect(-500,-500,VW+1000,VH+1000);
 const sa=Math.max(0,Math.min(1,(h-2800)/2500));if(sa>0){ctx.fillStyle='#fff';for(let i=0;i<90;i++){const x=(i*97.31)%VW,y=((i*61.7+h*.04)%VH+VH)%VH,tw=.6+.4*Math.sin(now*3+i);ctx.globalAlpha=sa*tw;ctx.fillRect(x,y,1+i%3,1+i%3)}}
 if(h>6500){const ma=Math.min(1,(h-6500)/2000);ctx.globalAlpha=ma;ctx.fillStyle='#f4f1e0';ctx.beginPath();ctx.arc(VW*.78,130,58,0,6.283);ctx.fill();ctx.fillStyle='#d8d2bb';
  for(const [dx,dy,r] of [[-18,-12,11],[16,8,14],[-6,22,7],[24,-20,6]]){ctx.beginPath();ctx.arc(VW*.78+dx,130+dy,r,0,6.283);ctx.fill()}}
 const ca=Math.min(1,h/300)*Math.max(0,Math.min(1,(5200-h)/1500));if(ca>0){ctx.fillStyle='#fff';for(let i=0;i<7;i++){const cx=((i*331+i*i*57)%(VW+300))-150,cy=((i*190+h*.55)%(VH+300))-150;ctx.globalAlpha=ca*.75;
  for(const [dx,dy,r] of [[0,0,38],[34,6,30],[-32,8,28],[12,-16,26]]){ctx.beginPath();ctx.arc(cx+dx,cy+dy,r,0,6.283);ctx.fill()}}}
 ctx.restore()}
function cueInfo(){if(/^s[3-7]$/.test(p.state)&&p.scombo>=3&&p.scombo<8&&!p.miss)return{H:.38};if(p.state==='claw'&&p.combo>=3&&p.combo<8&&!p.miss)return{H:.4};if(/^n[3-7]$/.test(p.state)&&p.ncombo>=3&&p.ncombo<8&&!p.miss)return{H:.36};return null}
// tail whip: timed chain, 3rd one launches
function tailWhip(n){p.tw0=p.face;act('tailwhip','tailwhip',{say:['TAIL WHIP!','DOUBLE WHIP!','TAIL LAUNCHER!'][n-1],c:['#ffd0a0','#ffb870','#ff9a2e'][n-1]});p.tn=n;p.tq=0;p.tqT=0;C.atk++;p.vx=p.face*(120+n*40);
 spark(p.x-p.face*60,p.y-40,6+n*5,['#fff','#ffd0a0'],160+n*60);shake=Math.max(shake,2+n*3);
 if(n===3){if(p.ground){p.vy=-720;p.ground=false;p.jumps=1}else p.vy=Math.min(p.vy,-420);waves.push({x:p.x,y:p.y-30,r:20,l:1,big:true})}else if(!p.ground)p.vy=Math.min(p.vy,-220)}
// morphing mid-combo / mid-air = flashy transform strike that keeps the combo alive
function morphStrike(){if(!(C.n>0||!p.ground))return;p.mquick=true;C.atk++;areaHit(p.x,p.y-10,230,'morphstrike');extend();say(p.sam?'SAMURAI TRANSFORM STRIKE!':p.ninja?'NINJA TRANSFORM STRIKE!':'PADDY TRANSFORM STRIKE!',p.sam?SR:p.ninja?NV:'#ffe08a',true);
 slash('spin',p.sam?SR:p.ninja?NV:'#ffe08a',{lvl:6,scale:1.3});flashT=Math.max(flashT,.1);hitstop=Math.max(hitstop,.06);if(!p.ground){p.vy=-460;p.hang=.3}}
// ---- PERFECT-8 cinematic: BUNNY KICK BARRAGE (Paddy) ----
function bunnyState(dt){const g=p.grab&&p.grab.alive?p.grab:null,t=p.t;p.rot=0;p.inv=Math.max(p.inv,.5);
 if(t<.3){setAnim('pclunge');p.vx*=Math.pow(.02,dt);if(g&&Math.abs(g.x-p.x)<105)p.vx=0;if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.pclunge[p.fi],face:p.face,l:.2,blue:1});
  if(t>.14&&!p.st1){p.st1=true;if(g){g.hp=Math.max(4,g.hp);hitDummy(g,'bunnygrab',p.face)}say('GRAB!','#ff9ad5',true);spark(p.x+p.face*90,p.y-70,16,['#ff9ad5','#fff'],260)}}
 else if(t<.6){p.vx=0;setAnim(t<.45?'bk_leap':'bk_roll')}
 else if(t<1.75){p.vx=0;setAnim('bk_kick');const fast=t>1.3;p.fi=Math.floor(t*(fast?30:22))%2;
  if(g&&t-p.kick>(fast?.055:.085)){p.kick=t;p.kicks++;g.hp=Math.max(3,g.hp);hitDummy(g,'bunnykick',p.face);g.vx=0;g.vy=0;popNum(p.kicks,p.kicks%2?'#ff9ad5':'#ffe14d');
   const kx=p.x+p.face*(40+Math.random()*40),ky=p.y-60-Math.random()*60;for(let i=0;i<6;i++){const a=Math.random()*6.28;sparks.push({x:kx,y:ky,vx:Math.cos(a)*300,vy:Math.sin(a)*300,l:.3,c:i%2?'#fff':'#ff9ad5'})}
   waves.push({x:kx,y:ky,r:6,l:.35,big:false});shake=Math.max(shake,fast?7:4);if(p.kicks%5===0)say(p.kicks+' KICKS!','#ff9ad5',true)}}
 else if(t<1.95){setAnim('bk_roll');if(!p.st2){p.st2=true;hitstop=.14;flashT=.18;say('BUNNY...','#fff',true);cine.tz=1.7;
   for(let i=0;i<20;i++){const a=i/20*6.283;sparks.push({x:p.x+Math.cos(a)*150,y:p.y-70+Math.sin(a)*150,vx:-Math.cos(a)*600,vy:-Math.sin(a)*600,l:.25,c:'#ff4fa3'})}}}
 else if(!p.shot){p.shot=true;setAnim('bk_land');const cx=g?g.x:p.x+p.face*60;if(g){g.hp=Math.max(4,g.hp);hitDummy(g,'bunnylaunch',p.face);g.vy=-2000;g.vx=p.face*380;g.fl=.9}
  shake=30;slowT=.6;flashT=.38;hitstop=.1;cine.tz=1.15;for(let i=0;i<4;i++)waves.push({x:p.x+p.face*50,y:p.y-60+i*10,r:10+i*30,l:1,big:true});burst(p.x+p.face*60,p.y-80);burst(p.x+p.face*60,p.y-140,1);
  for(let i=0;i<60;i++){const a=Math.random()*6.28,v=200+Math.random()*700;sparks.push({x:p.x+p.face*60,y:p.y-80,vx:Math.cos(a)*v,vy:Math.sin(a)*v-200,l:.7,c:['#fff','#ff4fa3','#ffe14d','#ff9ad5'][i%4]})}
  cine.pillar={x:cx,l:1,col:'#ff9ad5'};card('BUNNY KICK BARRAGE!',p.kicks+' KICKS · PERFECT 8','#ff4fa3')}
 if(g&&t>.14&&t<1.95){const ty=p.y-(t<.6?40+Math.max(0,t-.3)*200:100)+Math.sin(t*40)*5;g.x+=(p.x+p.face*(t<.6?50:75)-g.x)*Math.min(1,dt*14);g.y+=(ty-g.y)*Math.min(1,dt*14);g.vx=0;g.vy=0;g.fl=.5}
 if(t>2.7){p.state='normal';p.rot=0;p.combo=0;p.inv=.4}}
// ---- PERFECT-8 cinematic: NEON ECLIPSE (Ninja) ----
function neonEclipse(){C.atk++;popNum(8,'#ffffff');act('eclipse','n_dash',{say:'NEON ECLIPSE...',c:NV});p.inv=5;p.vx=p.face*1100;p.vy=0;p.ek=0;p.en=0;p.st1=p.st2=false;
 p.grab=nTarget(420);cineGo(1.4,.55);slowT=.2;flashT=.15;shake=10}
const ECL=['n_c1','n_c2','n_c3','n_c4','n_c5','n_c7'];
function eclipseState(dt){const g=p.grab&&p.grab.alive?p.grab:null,t=p.t;p.rot=0;
 if(t<.22){if(t%.025<dt)ghosts.push({x:p.x,y:p.y,f:FR.n_dash[p.fi],face:p.face,l:.3,blue:1});if(g&&Math.abs(g.x-p.x)<110)p.vx*=.5;p.vx*=Math.pow(.1,dt);if(g)g.vx*=.5}
 else if(t<1.35){p.vx=0;p.vy=0;
  if(g){g.vx=0;g.vy=0;g.fl=.6;g.y+=((GROUND-170)-g.y)*Math.min(1,dt*6)}
  if(t-p.ek>.11){p.ek=t;const i=p.en++,cx=g?g.x:p.x+p.face*100,cy=g?g.y:GROUND-170,ang=i*2.39+.4,fx=p.x,fy=p.y,an=ECL[i%6];
   p.x=clampX(cx+Math.cos(ang)*125);p.y=Math.min(GROUND,cy+60+Math.sin(ang)*95);p.face=cx>p.x?1:-1;p.ground=p.y>=GROUND;
   for(let k=1;k<=4;k++)ghosts.push({x:fx+(p.x-fx)*k/5,y:fy+(p.y-fy)*k/5,f:FR.n_c2[0],face:p.face,l:.08+k*.03,blue:1});
   setAnim(an,true);ghosts.push({x:p.x,y:p.y,f:FR[an][FR[an].length-1],face:p.face,l:.5,blue:1});puffShadow(p.x,p.y);
   slash(['down','up','over','rise','flat','cross'][i%6],i%2?NV:NC,{scale:1.25+i*.04,lvl:Math.min(8,3+i)});
   if(g){g.hp=Math.max(4,g.hp);hitDummy(g,'eclipsehit',p.face);g.vx=0;g.vy=0}popNum(i+1,i%2?NV:NC);shake=Math.max(shake,5+i*.6)}}
 else if(t<1.6){if(!p.st1){p.st1=true;const cx=g?g.x:p.x;p.x=clampX(cx-p.face*150);p.y=GROUND;p.ground=true;p.face=cx>=p.x?1:-1;setAnim('n_er',true);hitstop=.16;flashT=.2;say('ECLIPSE...','#fff',true);cine.tz=1.75;cine.tdim=.75;
   for(let i=0;i<24;i++){const a=i/24*6.283;sparks.push({x:cx+Math.cos(a)*180,y:(g?g.y:p.y-80)+Math.sin(a)*180,vx:-Math.cos(a)*700,vy:-Math.sin(a)*700,l:.26,c:i%2?NV:NC})}}
  if(g){g.vx=0;g.vy=0}}
 else if(!p.shot){p.shot=true;setAnim('n_es',true);const cx=g?g.x:p.x+p.face*150,cy=g?g.y:p.y-90;
  if(g){g.hp=Math.max(5,g.hp);hitDummy(g,'eclipsefin',p.face);g.vy=-2300;g.vx=p.face*300;g.fl=1}
  p.vx=p.face*500;slash('cross',NV,{scale:3,lvl:8,col2:NC,dx:150,dy:90});slash('spin','#ffffff',{scale:2.2,lvl:8,dy:90});
  shake=34;slowT=.7;flashT=.45;hitstop=.1;cine.tz=1.15;cine.tdim=.35;cine.pillar={x:cx,l:1.2,col:NV};
  for(let i=0;i<5;i++)waves.push({x:cx,y:cy+i*12,r:10+i*28,l:1,big:true});burst(cx,cy);burst(cx,cy-60);
  for(let i=0;i<80;i++){const a=Math.random()*6.28,v=250+Math.random()*800;sparks.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-250,l:.8,c:[NV,NC,'#fff','#ff7ce0'][i%4]})}
  card('NEON ECLIPSE!',p.en+' SHADOW STRIKES · PERFECT 8',NV)}
 else p.vx*=Math.pow(.05,dt);
 if(t>2.6){p.state='normal';p.ncombo=0;p.inv=.4;p.vx=0}}
// ---- FINISH HIM (string finisher, either form) ----
function finishHim(){const g=nTarget(800);p.grab=g;act('finishhim',p.sam?'s_stance':p.ninja?'n_er':'pc3',{say:'FINISH HIM!!',c:'#ff3355'});p.inv=4;p.vx=0;p.vy=0;p.st1=false;cineGo(1.5,.65);slowT=.3;card('FINISH HIM!!','TAIL ×3 · TAIL ×3 · MORPH · MORPH','#ff3355')}
function finishState(dt){const g=p.grab&&p.grab.alive?p.grab:null,t=p.t;p.vx=0;p.vy=0;
 if(g&&!p.shot){g.vx=0;g.vy=0;g.fl=.6;g.y+=((GROUND-140)-g.y)*Math.min(1,dt*5)}
 if(t>.45&&!p.st1){p.st1=true;const fx=p.x,fy=p.y;if(g){p.x=clampX(g.x-p.face*120);p.face=g.x>=p.x?1:-1}p.y=GROUND;p.ground=true;
  for(let k=1;k<=6;k++)ghosts.push({x:fx+(p.x-fx)*k/7,y:fy+(p.y-fy)*k/7,f:(FR[p.anim]||FR.idle)[0],face:p.face,l:.1+k*.04,blue:1});puffShadow(p.x,p.y);setAnim(p.sam?'s_stance':p.ninja?'n_er':'pc3',true)}
 if(t>.45&&t<1&&t%.03<dt){const a=Math.random()*6.28;sparks.push({x:p.x+Math.cos(a)*120,y:p.y-70+Math.sin(a)*120,vx:-Math.cos(a)*400,vy:-Math.sin(a)*400,l:.3,c:Math.random()<.5?'#ff3355':'#ffe14d'})}
 if(t>1&&!p.shot){p.shot=true;setAnim(p.sam?'s_calm':p.ninja?'n_es':'pc8',true);const cx=g?g.x:p.x+p.face*120,cy=g?g.y:p.y-80;
  if(g){g.hp=Math.max(3,g.hp);hitDummy(g,'finishhim',p.face);g.vy=-2600;g.vx=p.face*200;g.fl=1}
  slash('cross','#ff3355',{scale:3.2,lvl:8,col2:'#ffe14d',dx:120,dy:80});shake=38;slowT=.8;flashT=.5;hitstop=.12;cine.tz=1.2;cine.tdim=.3;cine.pillar={x:cx,l:1.3,col:'#ff3355'};
  for(let i=0;i<5;i++)waves.push({x:cx,y:cy+i*12,r:10+i*30,l:1,big:true});burst(cx,cy,1);burst(cx,cy-80);
  for(let i=0;i<90;i++){const a=Math.random()*6.28,v=250+Math.random()*900;sparks.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-250,l:.85,c:['#ff3355','#ffe14d','#fff','#ff9a2e'][i%4]})}
  card('FINISHED!!','FLAWLESS · STRING MASTER','#ff3355')}
 if(t>2.1){p.state='normal';p.inv=.4;p.combo=0;p.ncombo=0}}
// ---- COMBO STRINGS: Claw (C) / Tail (T) / Morph (M) inputs within ~0.75s of each other ----
const TOK=[];let lastTokT=-9;
const CST=new Set(['claw','airswipe','airspin','n1','n2','n3','n4','n5','n6','n7','n8','nrise','nair','uppercut','dashstrike']),TST=new Set(['tailwhip','nthrow']);
const STR=[{k:'TTTTTTMM',nm:'FINISH HIM!!',fx:'finish',col:'#ff3355'},{k:'CCCCMTT',nm:'SHAPESHIFT STAR STORM!',fx:'starstorm',col:'#b98cff'},
 {k:'TTTCCC',nm:'CLAW CYCLONE!',nn:'NINJA TORNADO!',fx:'cyclone',nfx:'tornado',col:'#7fffd4'},{k:'CCMCC',nm:'PHANTOM PARADE!',fx:'parade',col:'#c9a7ff'},
 {k:'CCCTT',nm:'TAIL SPIN SLAM!',nn:'SHADOW CLONE BARRAGE!',fx:'slam',nfx:'clones',col:'#ffd0a0'},{k:'TTT',nm:'TAIL TWISTER!',nn:'STAR VOLLEY!',fx:'twister',nfx:'volley',col:'#ffe14d'}];
function tokAct(state){if(state==='airswipe'||state==='airspin')C.atk++;if(CINE.includes(state)||CINE.includes(p.state))return;const k=CST.has(state)?'C':TST.has(state)?'T':state==='nmorph'?'M':null;if(!k)return;
 if(now-lastTokT>.75)TOK.length=0;TOK.push({c:k,t:now});if(TOK.length>10)TOK.shift();lastTokT=now;const str=TOK.map(o=>o.c).join('');
 for(const s of STR)if(str.endsWith(s.k)&&(!s.only||p[s.only])){p.pendStr=s;if(s.k.length>=5){TOK.forEach(o=>o.hit=1)}break}}
function strFire(s){const nin=p.ninja,sam=p.sam,nm=sam&&s.sn?s.sn:nin&&s.nn?s.nn:s.nm,fx=sam&&s.sfx?s.sfx:nin&&s.nfx?s.nfx:s.fx;
 if(fx==='finish'){finishHim();return}
 card(nm,s.k.split('').join(' '),sam?SR:nin?NV:s.col);slowT=Math.max(slowT,.22);flashT=Math.max(flashT,.12);shake=Math.max(shake,14);extend();C.atk++;if(sStrFx(fx))return;
 if(fx==='twister'){areaHit(p.x,p.y,250,'twister');p.cyc={t:.45,k:0,col:'#ffd27a',kb:'cyclone',fin:'twister'}}
 else if(fx==='volley'){for(let i=0;i<16;i++){const a=i/16*6.283;stars.push({x:p.x,y:p.y-70,vx:Math.cos(a)*850,vy:Math.sin(a)*850,r:0,l:.7,hit:new Set()})}}
 else if(fx==='cyclone')p.cyc={t:1,k:0,col:'#7fffd4',kb:'cyclone',fin:'cyclonefin'};
 else if(fx==='tornado')p.cyc={t:1.3,k:0,col:NV,kb:'tornado',fin:'tornadofin',ninja:1};
 else if(fx==='starstorm')p.sst={n:0,k:.2};
 else if(fx==='parade'){const tg=nTarget(900);if(!p.ground&&tg){const fx0=p.x,fy0=p.y;p.face=tg.x>=p.x?1:-1;p.x=clampX(tg.x-p.face*80);p.y=Math.min(GROUND,tg.y);p.vy=-380;p.hang=.3;for(let k=1;k<=7;k++)ghosts.push({x:fx0+(p.x-fx0)*k/8,y:fy0+(p.y-fy0)*k/8,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.15+k*.05,blue:1});puffShadow(p.x,p.y);areaHit(tg.x,tg.y,220,'parade')}else if(nin)nStorm(1);else{const fx0=p.x;p.x=clampX(p.x+p.face*300);for(let k=1;k<=7;k++)ghosts.push({x:fx0+(p.x-fx0)*k/8,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.15+k*.05,blue:1});areaHit((fx0+p.x)/2,p.y,240,'parade')}}
 else if(fx==='slam'){areaHit(p.x,p.y,300,'tailslam');for(let i=0;i<3;i++)waves.push({x:p.x,y:GROUND,r:20+i*40,l:1,big:true});burst(p.x,p.y-30)}
 else if(fx==='clones'){p.clones={t:0,k:0,n:0,pos:[[-150,-10],[150,-10],[0,-180]]};for(const q of p.clones.pos){ghosts.push({x:p.x+q[0],y:p.y+q[1],f:FR.n_throw[1],face:p.face,l:1.4,blue:1});puffShadow(p.x+q[0],p.y+q[1])}}}
function r6Update(dt){
 if(!CINE.includes(p.state)){cine.tz=1;cine.tb=0;cine.tdim=0}
 cine.z+=(cine.tz-cine.z)*Math.min(1,dt*5);cine.bars+=(cine.tb-cine.bars)*Math.min(1,dt*7);cine.dim+=(cine.tdim-cine.dim)*Math.min(1,dt*5);
 const g=CINE.includes(p.state)&&p.grab&&p.grab.alive?p.grab:null,fx=g?(p.x+g.x)/2:p.x,fy=g?(p.y+g.y)/2-60:p.y-60;
 if(cine.z<1.01&&cine.tz===1){cine.fx=fx;cine.fy=fy}else{cine.fx+=(fx-cine.fx)*Math.min(1,dt*6);cine.fy+=(fy-cine.fy)*Math.min(1,dt*6)}
 if(cine.card){cine.card.t+=dt;if(cine.card.t>2.4)cine.card=null}
 if(cine.pillar){cine.pillar.l-=dt;if(cine.pillar.l<=0)cine.pillar=null}
 if(cine.hype){cine.hype.l-=dt;if(cine.hype.l<=0)cine.hype=null}
 const alt=Math.max(0,GROUND-p.y);cine.altA+=((alt>220?1:0)-cine.altA)*Math.min(1,dt*4);
 if(p.ground)p.hypeI=0;else if(C.n>0&&HYPE[p.hypeI||0]&&alt>HYPE[p.hypeI||0][0]){cine.hype={t:HYPE[p.hypeI||0][1],l:1.6};p.hypeI=(p.hypeI||0)+1;flashT=Math.max(flashT,.05)}
 if(!p.ground&&['nair','sair','airswipe','airspin','tailwhip'].includes(p.state)&&p.t<.15){let best=null,bd=330;for(const d of dummies){if(!d.alive||d.y>GROUND-30)continue;const dd=Math.hypot(d.x-p.x,(d.y-p.y)*.6);if(dd<bd){bd=dd;best=d}}
  if(best){if(p.t<.03&&p.state!=='tailwhip'&&Math.abs(best.x-p.x)>25)p.face=best.x>p.x?1:-1;const want=Math.max(-450,Math.min(450,(best.x-p.face*70-p.x)*7));p.vx+=(want-p.vx)*Math.min(1,dt*14)}}
 if(p.pendStr&&!CINE.includes(p.state)&&(p.state!=='nmorph'||p.t>.2)){const s=p.pendStr;p.pendStr=null;strFire(s)}
 if(p.cyc){const c=p.cyc;c.t-=dt;c.k+=dt;if(c.k>.1){c.k=0;C.atk++;for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<260&&Math.abs(d.y-p.y)<320){d.x+=(p.x+p.face*40-d.x)*.25;hitDummy(d,c.kb,Math.sign(d.x-p.x)||p.face)}}
  if(c.t<=0){p.cyc=null;C.atk++;areaHit(p.x,p.y,290,c.fin);shake=16;flashT=Math.max(flashT,.12);waves.push({x:p.x,y:p.y-40,r:20,l:1,big:true})}}
 if(p.sst){const c=p.sst;c.k+=dt;if(c.k>.14){c.k=0;for(let i=0;i<10;i++){const a=i/10*6.283+c.n*.31;stars.push({x:p.x,y:p.y-70,vx:Math.cos(a)*820,vy:Math.sin(a)*820,r:0,l:.75,hit:new Set()})}shake=Math.max(shake,6);if(++c.n>=3)p.sst=null}}
 if(p.clones){const c=p.clones;c.t+=dt;c.k+=dt;if(c.k>.16&&c.n<6){c.k=0;c.n++;const tg=nTarget(900);for(const q of c.pos){const x=p.x+q[0],y=p.y+q[1]-85,ax=tg?tg.x-x:p.face,ay=tg?(tg.y-70)-y:0,L=Math.hypot(ax,ay)||1;
   stars.push({x,y,vx:ax/L*1000,vy:ay/L*1000,r:0,l:.9,hit:new Set()})}shake=Math.max(shake,4)}if(c.t>1.4)p.clones=null}}
function r6DrawFx(){
 if(cine.pillar){const q=cine.pillar,a=Math.min(1,q.l),w=70+(1-a)*90;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(q.x-w/2,0,q.x+w/2,0);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,q.col);g.addColorStop(1,'rgba(255,255,255,0)');ctx.globalAlpha=a*.85;ctx.fillStyle=g;ctx.fillRect(q.x-w/2,-camY-3000,w,GROUND+camY+3000);
  ctx.fillStyle='#fff';ctx.globalAlpha=a*.7;ctx.fillRect(q.x-w*.08,-camY-3000,w*.16,GROUND+camY+3000);ctx.restore()}
 if(p.cyc){const c=p.cyc;ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<6;k++){const a=now*14+k*1.1,r=55+k*28;ctx.globalAlpha=.55-k*.06;ctx.strokeStyle=k%2?'#fff':c.col;ctx.lineWidth=8-k;
   ctx.beginPath();ctx.ellipse(p.x,p.y-20-k*34,r,r*.28,0,a,a+3.6);ctx.stroke()}ctx.restore()}}
function drawCineHUD(){
 if(cine.bars>.01){const h=64*cine.bars;ctx.fillStyle='#000';ctx.fillRect(-500,-500,VW+1000,500+h);ctx.fillRect(-500,VH-h,VW+1000,h+500)}
 const alt=Math.max(0,GROUND-p.y);
 if(cine.altA>.01){const x=VW-46,y0=130,y1=420,f=Math.min(1,Math.log(1+alt/400)/Math.log(1+15000/400)),yy=y1-(y1-y0)*f;ctx.save();ctx.globalAlpha=cine.altA;ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x-7,y0,14,y1-y0);
  const gr=ctx.createLinearGradient(0,y1,0,y0);gr.addColorStop(0,'#9fd6f7');gr.addColorStop(.4,'#ffb37a');gr.addColorStop(.65,'#7a4fa8');gr.addColorStop(1,'#03040c');ctx.fillStyle=gr;ctx.fillRect(x-5,yy,10,y1-yy);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,yy,8,0,6.283);ctx.fill();ctx.font=`20px ${FONT}`;ctx.textAlign='right';ctx.fillText(Math.round(alt/10)+' m',x-14,yy+7);ctx.textAlign='center';ctx.font=`14px ${FONT}`;ctx.fillText('ALT',x,y1+18);ctx.restore()}
 if(cine.hype){const h=cine.hype,u=1-h.l/1.6;fancy(h.t,VW/2,175-u*20,44,-.05,u<.1?.5+u/.1*.7:1.2-Math.min(.2,u),Math.min(1,h.l*2),`hsl(${(now*300)%360},100%,70%)`)}
 if(cine.card){const c=cine.card,t=c.t,e=1-Math.pow(1-Math.min(1,t/.22),3),out=t>2?Math.max(0,1-(t-2)/.4):1,y=VH*.36,ox=(1-e)*-VW;
  ctx.save();ctx.translate(VW/2+ox,y);ctx.transform(1,0,-.35,1,0,0);const gr=ctx.createLinearGradient(-VW/2,0,VW/2,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.15,c.col);gr.addColorStop(.85,c.col);gr.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=out*.85;ctx.fillStyle=gr;ctx.fillRect(-VW/2,-46,VW,92);ctx.fillStyle='#fff';ctx.globalAlpha=out*.9;ctx.fillRect(-VW*.4,-52,VW*.8,4);ctx.fillRect(-VW*.4,48,VW*.8,4);
  for(let i=0;i<6;i++){const s2=((i*173+t*900)%(VW+200))-VW/2-100;ctx.globalAlpha=out*.35;ctx.fillRect(s2,-40+i*14,120,3)}ctx.restore();
  fancy(c.title,VW/2+ox,y+4,58,-.04,t<.3?.6+t/.3*.6:1.2-Math.min(.2,(t-.3)*.5),out,'#fff');
  ctx.save();ctx.globalAlpha=out;ctx.font=`22px ${FONT}`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(c.sub,VW/2+ox,y+78);ctx.restore()}
 if(TOK.length&&now-lastTokT<1.5){const a=Math.min(1,(1.5-(now-lastTokT))*2),n=TOK.length,x0=VW/2-(n-1)*20;ctx.save();ctx.globalAlpha=a;ctx.font=`20px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<n;i++){const k=TOK[i].c,x=x0+i*40,y=VH-38,pp=Math.min(1,(now-TOK[i].t)*8);ctx.fillStyle=k==='C'?'#ff6fb5':k==='T'?'#ffb340':'#9a6cff';ctx.beginPath();ctx.arc(x,y,15*(.6+pp*.4),0,6.283);ctx.fill();
   ctx.strokeStyle=TOK[i].hit?'#ffe14d':'#fff';ctx.lineWidth=TOK[i].hit?4:2;ctx.stroke();ctx.fillStyle='#fff';ctx.fillText(k,x,y+1)}ctx.restore()}}

// ===================== ROUND 8: SAMURAI PADDY + ARMOURED ROTTWEILER =====================
Object.assign(A,{
 s_idle:['s_idle',[0,1,2,3,4,5],5,1],s_run:['s_run',null,14,1],s_rise:['s_jump',[1,2],9,0],s_fall:['s_jump',[4],1,0],s_land:['s_jump',[5],1,0],s_flip:['s_jump',[2,3,4],13,0],
 s_draw:['s_draw',[0,1,2,3,4],11,0],s_hurt:['s_jump',[4],1,0],s_victory:['s_combo_c',[4,5],3,0],
 s_h1:['s_combo_a',[0,1],16,0],s_h2:['s_combo_a',[2,3],16,0],s_h3:['s_combo_a',[4,5],14,0],s_h4:['s_combo_b',[0,1],16,0],s_h5:['s_combo_b',[2,3],13,0],s_h6:['s_combo_b',[4,5],16,0],
 s_h7:['s_combo_c',[0,1],15,0],s_h8:['s_combo_c',[2,3],10,0],
 s_airA:['s_air',[0,1],16,0],s_airB:['s_air',[2],1,0],s_airC:['s_air',[3],1,0],s_airD:['s_air',[4],1,0],s_dive:['s_air',[5],1,0],
 s_launch:['s_launch_iaido',[0,1,2],14,0],s_stance:['s_launch_iaido',[3],1,0],s_dash:['s_launch_iaido',[4],1,0],s_after:['s_launch_iaido',[5],1,0],
 s_block:['s_parry_charge',[0],1,0],s_parry:['s_parry_charge',[1],1,0],s_riposte:['s_parry_charge',[2],1,0],s_kneel:['s_parry_charge',[3],1,0],s_power:['s_parry_charge',[4],1,0],s_super:['s_parry_charge',[5],1,0],
 s_calm:['s_combo_c',[5],1,0],
 r_idle:['r_idle_walk',[0,1,2,1],4,1],r_walk:['r_idle_walk',[3,4,5,4],6,1],r_wind:['r_punch',[0,1],2.5,0],r_punch:['r_punch',[2,3],10,0],r_follow:['r_punch',[4],1,0],
 r_inhale:['r_bark_bite',[0],1,0],r_bark:['r_bark_bite',[1,2],9,1],r_lick:['r_bark_bite',[5],1,0],r_bite:['r_bark_bite',[3,4],9,0],
 r_hurt:['r_hurt_air',[0,1],7,0],r_up:['r_hurt_air',[2],1,0],r_tumble:['r_hurt_air',[3,4],8,1],r_down:['r_hurt_air',[5],1,0],
 r_ko:['r_ko',[0,1],1.5,1],r_sit:['r_ko',[2,3],1.6,1],r_wag:['r_ko',[4,5],7,1],
 r_sniff:['r_silly1',[1,0,1,1],2.5,1],r_scratch:['r_silly1',[3,4],9,1],r_chase:['r_silly2',[0,1,2],7,1],r_howl:['r_silly2',[3,4],1.5,0]});
const SR='#ff3b3b',SG='#ffd34d',SP='#ffb7d5',SW='#ffffff',SWIND='#8ff5e0';
CINE.push('sfinal');
// ---- the 8-hit katana chain: hits 1-3 on any press, 4-8 on the timing ring; each one a different cut ----
const SCH=[null,
 {a:'s_h1',k:'flat',lunge:210,nm:'HORIZONTAL CUT!',c:'#ffffff'},
 {a:'s_h2',k:'down',lunge:230,nm:'DIAGONAL CUT!',c:'#ffd6e6'},
 {a:'s_h3',k:'over',lunge:250,nm:'OVERHEAD CHOP!',c:SP},
 {a:'s_h4',k:'rise',lunge:170,nm:'RISING MOON!',c:'#ff8fb8'},
 {a:'s_h5',k:'spin',lunge:210,nm:'WHIRLWIND SPIN!',c:'#ff6a6a'},
 {a:'s_h6',k:'thrust',lunge:470,nm:'PIERCING THRUST!',c:SR},
 {a:'s_h7',k:'cross',lunge:280,nm:'CROSS SLASH!',c:SG,kanji:['斬','CROSS SLASH']}];
const SST=['s1','s2','s3','s4','s5','s6','s7','slaunch','sair','sdive','siaido','sparry','sriposte','scharge','swind','ssuper','sfinal','sflip'];
Object.assign(NAMES,{s1:'HORIZONTAL CUT!',s2:'DIAGONAL CUT!',s3:'OVERHEAD CHOP!',s4:'RISING MOON!',s5:'WHIRLWIND SPIN!',s6:'PIERCING THRUST!',s7:'CROSS SLASH!',sh8:'JUMPING CLEAVE!',
 slaunch:'RISING DRAGON!',sair:'AIR SLASH!',sdive:'FALLING CLEAVE!',siaido:'QUICK DRAW!',siaidocut:'SINGLE FLASH!',sriposte:'COUNTER!',swind:'WIND SLASH!',sgale:'GALE SLASH!',
 sakura:'SAKURA STORM!',sakurafin:'SAKURA STORM!!',sfcut:'ONE FLASH!',sfinal:'ISSEN!!',bladedance:'BLADE DANCE!',bladefin:'BLADE DANCE!!',petals:'HUNDRED PETALS!',petalsfin:'HUNDRED PETALS!!',breaker:'PARRY BREAKER!'});
Object.assign(KB,{s1:[200,-190,0,.035],s2:[230,-230,0,.04],s3:[200,-340,.05,.05],s4:[110,-430,.15,.055],s5:[220,-300,.1,.06],s6:[400,-240,.05,.07],s7:[300,-420,.15,.09],sh8:[120,-700,.6,.1],
 slaunch:[60,-920,.55,.07],sair:[150,-320,.45,.045],sdive:[380,-520,.2,.08],siaido:[120,-260,.35,.05],siaidocut:[420,-650,.35,.1],sriposte:[420,-620,.35,.1],swind:[420,-300,.15,.06],sgale:[560,-560,.3,.09],
 sakura:[30,-300,.4,.02],sakurafin:[420,-1150,.6,.12],sfcut:[0,0,0,.03],sfinal:[300,-2400,1,.2],bladedance:[0,-200,.4,.03],bladefin:[500,-900,.4,.1],petals:[40,-260,.45,.025],petalsfin:[380,-1000,.5,.12],breaker:[600,-900,.4,.12]});
Object.assign(REACH,{s1:[165,140],s2:[170,150],s3:[160,190],s4:[150,225],s5:[170,165],s6:[235,130],s7:[180,170],slaunch:[160,235],sair:[165,185],sdive:[135,140]});
LIFT.push('sair');['s1','s2','s3','s4','s5','s6','s7','sair','slaunch','sriposte'].forEach(s=>CST.add(s));TST.add('sparry');
for(const s of STR){if(s.k==='TTT')Object.assign(s,{sn:'TRIPLE WIND!',sfx:'triplewind'});if(s.k==='CCCTT')Object.assign(s,{sn:'PARRY BREAKER!',sfx:'breaker'});
 if(s.k==='TTTCCC')Object.assign(s,{sn:'SAKURA CYCLONE!',sfx:'sakuracyc'});if(s.k==='CCMCC')Object.assign(s,{sn:'PHANTOM IAIDO!',sfx:'phantom'})}
STR.push({k:'CCTTCC',nm:'HUNDRED PETALS!',fx:'hundred',col:'#ff6fae',only:'sam'},{k:'CTCTC',nm:'BLADE DANCE!',fx:'bladedance',col:SR,only:'sam'});
// ---- effects: ink lines, sakura petals, wind crescents, kanji ----
const SFX=[],sProj=[],dWaves=[];let kanji=null;
function sLine(x0,y0,x1,y1,col,l,w){SFX.push({t:'line',x0,y0,x1,y1,col,l,l0:l,w})}
function petals(x,y,n,boom){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(boom?160:60)+Math.random()*(boom?420:140);SFX.push({t:'petal',x:x+(Math.random()-.5)*30,y:y+(Math.random()-.5)*30,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,r:Math.random()*6,vr:(Math.random()-.5)*12,l:1+Math.random()*.8,s:.7+Math.random()*.6,c:Math.random()<.25?'#ffffff':Math.random()<.5?'#ffc1dc':'#ff8fbf'})}}
function kanjiFx(k,en,col,o){const busy=cine.card&&cine.card.t<2;kanji={k,en,col:col||'#c8102e',t:0,x:(o&&o.x)||VW*.2,y:(o&&o.y)||(busy?VH*.13:VH*.34),size:(o&&o.size)||(k.length>1?96:124)}}
document.fonts&&document.fonts.load(`80px Kanji`,'斬侍風桜必殺一閃返し').catch(()=>{});
function sFx(i,c){const sc=1.05+(i-1)*.09;
 if(c.k==='thrust'){sLine(p.x+p.face*30,p.y-80,p.x+p.face*330,p.y-80,SR,.32,16);sLine(p.x+p.face*60,p.y-80,p.x+p.face*300,p.y-80,SW,.28,6);slash('flat',SW,{lvl:i,scale:.8,dx:150});for(let k=1;k<=4;k++)ghosts.push({x:p.x-p.face*k*34,y:p.y,f:(FR[c.a]||FR.s_idle)[1]||(FR[c.a]||FR.s_idle)[0],face:p.face,l:.08+k*.03,blue:1})}
 else slash(c.k,c.c,{lvl:i,scale:sc,delay:.03,dx:88,col2:SR});
 if(i>=3&&c.k!=='thrust')slash(c.k,SW,{lvl:i,scale:sc*.8,delay:.07,dx:88});
 if(i===3)waves.push({x:p.x+p.face*110,y:p.y,r:10,l:.6,big:false});
 if(i===5){for(let k=0;k<3;k++)ghosts.push({x:p.x,y:p.y,f:(FR.s_h5||FR.s_idle)[0],face:-p.face,l:.08+k*.04,blue:1})}
 petals(p.x+p.face*90,p.y-80,2+i*2,i>=5);spark(p.x+p.face*85,p.y-75,3+i*2,[c.c,SW],180+i*30);shake=Math.max(shake,2+i*1.6);
 if(i>=4)waves.push({x:p.x+p.face*70,y:p.y-60,r:10,l:.4+i*.06,big:i>=7});if(i>=6)flashT=Math.max(flashT,.05);
 if(c.kanji)kanjiFx(c.kanji[0],c.kanji[1],'#c8102e')}
// ---- samurai moves ----
function sHit(i){const c=SCH[i];p.scombo=i;p.scT=.6;C.atk++;act('s'+i,c.a,{say:c.nm,c:c.c});p.queued=false;p.perfect=false;p.miss=false;p.vx=p.face*c.lunge;popNum(i,c.c);sFx(i,c)}
function sJump(){if(p.ground){p.state='normal';p.vy=-760;p.ground=false;p.jumps=1;p.lastJump=now;setAnim('s_rise');spark(p.x,p.y,8,[SP,'#fff'],150);acted=true;return true}
 if(p.jumps<2){p.jumps=2;act('sflip','s_flip',{say:'FLIP!',c:SP});p.vy=-660;petals(p.x,p.y-40,6,0);extend();return true}return false}
const SAIR=[['s_airA','flat'],['s_airC','rise'],['s_airB','down'],['s_airD','spin']];
function sAir(){const hot=now-(p.lastAirHitT||-9)<.6;if((p.sair||0)>=5&&!hot)return false;p.sair=(p.sair||0)+1;C.atk++;const q=SAIR[(p.sair-1)%4],col=p.sair%2?SP:SR;popNum(p.sair,col);
 act('sair',q[0],{say:p.sair>=4?'AIR SLASH x'+p.sair+'!':'AIR SLASH!',c:col});p.vy=Math.min(p.vy,-200);p.vx=p.face*230;
 slash(q[1],col,{scale:1.25,lvl:Math.min(8,p.sair+1),dx:85});petals(p.x+p.face*80,p.y-80,4,0);spark(p.x+p.face*80,p.y-75,8,[col,SW]);
 if(p.sair%6===0){kanjiFx('風','WIND SPIRAL','#1f9e8f');slash('spin',SWIND,{scale:1.7,lvl:8});petals(p.x,p.y-70,16,1)}return true}
function sDive(){act('sdive','s_dive',{say:'FALLING CLEAVE!',c:SR});p.vy=1200;p.vx=p.face*480;slash('down',SR,{scale:1.3,lvl:5,dx:80})}
function sLaunch(){act('slaunch','s_launch',{say:'RISING DRAGON!',c:SP});p.vy=-700;p.ground=false;p.jumps=1;p.sair=0;p.vx=p.face*60;
 slash('rise',SP,{scale:1.35,lvl:5,dx:80});slash('up',SW,{scale:1.1,lvl:5,delay:.05,dx:80});petals(p.x+p.face*70,p.y-60,10,1);shake=Math.max(shake,7)}
function sDash(dir){p.face=dir==='right'?1:dir==='left'?-1:p.face;if(p.dashCool>0&&p.state!=='normal')return false;if(!p.ground){if(p.airIai)return false;p.airIai=true}p.dashCool=.45;p.dashStart=now;
 act('siaido','s_stance',{say:'QUICK DRAW…',c:'#cfd8ff'});p.vx=0;if(!p.ground)p.vy=Math.min(p.vy,-60);p.iai={x0:p.x,hit:null};p.inv=Math.max(p.inv,.35);return true}
function sIaido(){return sDash(p.face>0?'right':'left')!==false}
function sParry(){act('sparry','s_block',{say:'GUARD!',c:'#cfe3ff'});p.vx*=.2;if(!p.ground)p.vy=Math.min(p.vy,-80)}
function sRiposte(perf,d){act('sriposte','s_parry',{say:perf?'PERFECT PARRY!':'COUNTER!',c:perf?'#7fffd4':'#ffd6e6'});p.vx=p.face*260;p.rip={perf};
 if(perf){slowT=Math.max(slowT,.28);flashT=Math.max(flashT,.15);hitstop=Math.max(hitstop,.08);kanjiFx('返し','PARRY COUNTER','#c8102e');waves.push({x:p.x+p.face*50,y:p.y-80,r:10,l:1,big:true});spark(p.x+p.face*60,p.y-90,22,[SG,SW],380)}}
function sWind(c){act('swind','s_h1',{say:c>.3?'GALE SLASH!':'WIND SLASH!',c:SWIND});const big=c>.3;
 sProj.push({x:p.x+p.face*90,y:p.y-78,vx:p.face*(820+c*320),l:.85+c*.35,s:1+c*1.1,hit:new Set(),kb:big?'sgale':'swind',face:p.face});
 slash('flat',SWIND,{scale:1.2+c,lvl:big?6:3,dx:85});kanjiFx('風',big?'GALE SLASH':'WIND SLASH','#1f9e8f');shake=Math.max(shake,big?10:5);if(!p.ground)p.vy=Math.min(p.vy,-120)}
function sSakura(){act('ssuper','s_super',{say:'SAKURA STORM!!',c:'#ff6fae'});kanjiFx('桜','SAKURA STORM','#ff3d8e');p.scyc={t:.9,k:0,fin:'sakurafin',kb:'sakura'};
 slowT=Math.max(slowT,.2);flashT=.2;shake=16;petals(p.x,p.y-80,60,1);slash('big',SP,{scale:2.2,lvl:8,col2:SR,dx:60});for(let i=0;i<3;i++)waves.push({x:p.x,y:p.y-30*i,r:10+i*20,l:1,big:true})}
function sCancel(){if(P.special){act('scharge','s_kneel');p.sc=0;return true}if(P.tail||P.swat||P.hiss){sParry();return true}
 if(P.attack&&(K.up||K.down)&&p.ground&&p.state!=='slaunch'){sLaunch();return true}
 if(P.jump&&sJump())return true;if(P.dash&&(p.dashCool<=0||p.state!=='siaido')&&sDash(P.dash))return true;if(P.blink&&sIaido())return true;return false}
function sMoves(dir){
 if(P.jump&&sJump())return;
 if(!p.ground&&P.down&&!P.attack){sDive();return}
 if(P.attack){if(!p.ground){if(K.down)sDive();else sAir();return}
  if(K.up||K.down){sLaunch();return}sHit(p.scT>0&&p.scombo<3?p.scombo+1:1);return}
 if(P.special){act('scharge','s_kneel');p.sc=0;return}
 if(P.tail||P.swat||P.hiss){sParry();return}}
function sState(S,dt,end,dir){switch(S){
 case 's1':case 's2':case 's3':case 's4':case 's5':case 's6':case 's7':{p.vx*=Math.pow(.02,dt);const H=.38,i=p.scombo,timed=i>=3;
  if(p.t>.1&&sCancel())break;
  if(P.attack){if(!timed)p.queued=true;else if(!p.miss){if(p.t>=H-.2){p.perfect=true;p.queued=true}else if(!p.perfect)p.miss=true}}
  if(p.queued&&(timed?p.perfect:p.t>.14)){p.queued=false;if(!p.ground)sAir();else{
    if(timed){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false});hitstop=Math.max(hitstop,.05)}
    if(i>=7)sFinal();else sHit(i+1)}}
  else if(p.t>(timed?H+.06:.34)){p.state='normal';if(timed)p.scombo=0}}break;
 case 'slaunch': p.vx*=Math.pow(.05,dt);if(P.attack&&p.t>.12){if(!p.ground)sAir();else sHit(1);break}if(p.t>.12&&sCancel())break;if(p.t>.42||(p.ground&&p.t>.15))p.state='normal';break;
 case 'sair': p.vy=Math.min(p.vy,140);if(p.t>.08&&P.attack){if(K.down)sDive();else if(!sAir())p.state='normal';break}if(p.t>.1&&sCancel())break;if(p.t>.28||p.ground)p.state='normal';break;
 case 'sdive': p.vy=1200;if(p.t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR.s_dive||FR.s_idle)[0],face:p.face,l:.22,blue:1});
  if(p.ground){areaHit(p.x,p.y,170,'sdive');shake=12;waves.push({x:p.x,y:p.y,r:10,l:1,big:true});petals(p.x,p.y-20,14,1);spark(p.x,p.y,16,[SR,SW],360);act('land','s_land');p.vx=p.face*160}break;
 case 'sflip': p.vx+=(dir*430-p.vx)*Math.min(1,dt*5);if(p.t%.04<dt)ghosts.push({x:p.x,y:p.y,f:FR[p.anim][p.fi],face:p.face,l:.14,blue:1});
  if(P.attack){if(K.down)sDive();else sAir();break}if(p.t>.08&&sCancel())break;if(P.down){sDive();break}if(p.ground&&p.t>.1){act('land','s_land');break}if(end)p.state='normal';break;
 case 'siaido': iaidoState(dt);break;
 case 'sparry': p.vx*=Math.pow(.01,dt);if(!p.ground)p.vy=Math.min(p.vy,120);
  if(p.t>.07&&P.attack){sRiposte(false);break}if(p.t>.15&&(P.tail||P.swat||P.hiss)){sParry();break}if(p.t>.12&&(P.jump||P.dash||P.special||P.blink)&&sCancel())break;
  if(p.t>(K.tail&&p.t<1.2?1.2:.45))p.state='normal';break;
 case 'sriposte': p.vx*=Math.pow(.03,dt);
  if(p.t>.09&&!p.shot){p.shot=true;C.atk++;setAnim('s_riposte',true);slash('flat',SR,{scale:1.4,lvl:6,dx:95});sLine(p.x+p.face*30,p.y-82,p.x+p.face*240,p.y-82,SW,.3,10);
   for(const d of dummies)if(d.alive){const dx=(d.x-p.x)*p.face;if(dx>-40&&dx<250&&Math.abs(d.y-p.y)<200){hitDummy(d,'sriposte',p.face);if(p.rip&&p.rip.perf)d.stun=1.2}}}
  if(p.t>.2){if(P.attack){if(p.ground)sHit(p.rip&&p.rip.perf?4:1);else sAir();break}if(sCancel())break}if(p.t>.42)p.state='normal';break;
 case 'scharge': p.vx*=Math.pow(.03,dt);if(!p.ground)p.vy=Math.min(p.vy,60);p.sc=Math.max(0,Math.min(1,(p.t-.3)/1));
  if(p.t>.5&&p.anim!=='s_power')setAnim('s_power');
  if(p.t>.3&&p.t%.05<dt){const a=Math.random()*6.283,R=120;SFX.push({t:'petal',x:p.x+Math.cos(a)*R,y:p.y-70+Math.sin(a)*R*.7,vx:-Math.cos(a)*220,vy:-Math.sin(a)*160,r:0,vr:8,l:.55,s:.8,c:Math.random()<.5?'#ffc1dc':'#ff8fbf',pull:1})}
  if(p.sc>=1&&!p.scFull){p.scFull=true;flashT=Math.max(flashT,.08);say('FULLY CHARGED!','#ff6fae',true);waves.push({x:p.x,y:p.y-60,r:20,l:.8,big:true})}
  if(!K.special||p.t>2.6){p.scFull=false;if(p.t<.3)sWind(0);else if(p.sc>=1)sSakura();else sWind(p.sc)}break;
 case 'swind': p.vx*=Math.pow(.05,dt);if(p.t>.12&&sCancel())break;if(P.attack&&p.t>.14){if(p.ground)sHit(1);else sAir();break}if(p.t>.32)p.state='normal';break;
 case 'ssuper': p.vx*=Math.pow(.05,dt);if(!p.ground)p.vy=Math.min(p.vy,40);if(p.t>.95)p.state='normal';break;
 case 'sfinal': sFinalState(dt);break;
}}
function iaidoState(dt){const q=p.iai,t=p.t;if(!q){p.state='normal';return}
 if(t<.1){p.vx=0;if(!p.ground)p.vy=Math.min(p.vy,30);if(t%.03<dt)spark(p.x+p.face*30,p.y-70,2,['#cfd8ff',SW],120)}
 else if(t<.17){if(!q.go){q.go=true;setAnim('s_dash',true);q.x0=p.x;shake=Math.max(shake,6)}p.vx=p.face*5200;if(!p.ground)p.vy=0;
  ghosts.push({x:p.x,y:p.y,f:(FR.s_dash||FR.s_idle)[0],face:p.face,l:.2,blue:1});
  if(!q.hit)for(const d of dummies){if(!d.alive)continue;const lo=Math.min(q.x0,p.x)-70,hi=Math.max(q.x0,p.x)+70;if(d.x>lo&&d.x<hi&&Math.abs(d.y-p.y)<190){q.hit=d;hitDummy(d,'siaido',p.face);d.vx=0;break}}}
 else{if(!q.end){q.end=true;p.vx=p.face*240;setAnim('s_after',true);sLine(q.x0,p.y-72,p.x,p.y-72,SW,.5,12);sLine(q.x0,p.y-72,p.x,p.y-72,'#9fb4ff',.6,26);if(!p.ground)p.vy=-120}
  p.vx*=Math.pow(.01,dt);
  if(t>.3&&q.hit&&!q.cut){q.cut=true;const d=q.hit;if(d.alive){hitDummy(d,'siaidocut',p.face);const fx=p.face;p.face=d.x>=p.x?1:-1;slash('cross',SW,{scale:1.4,lvl:7,dx:Math.abs(d.x-p.x),dy:p.y-d.y+90});p.face=fx}
   kanjiFx('一閃','SINGLE FLASH','#3b4bd8');flashT=Math.max(flashT,.1);hitstop=Math.max(hitstop,.08);petals(d.x,d.y-90,14,1)}
  if(t>.24){if(P.attack){if(p.ground)sHit(1);else sAir();return}if(sCancel())return}
  if(t>(q.hit?.5:.38))p.state='normal'}}
// ---- PERFECT-8 cinematic: ISSEN — ONE FLASH (Samurai) ----
function sFinal(){C.atk++;popNum(8,SG);act('sfinal','s_h8',{say:'JUMPING CLEAVE!',c:SG});p.inv=5;p.grab=nTarget(460);p.vx=p.face*300;p.vy=-420;p.ground=false;p.st1=p.st2=p.st3=false;p.fcut=0;p.fcutT=0;
 cineGo(1.35,.35);slowT=.15;flashT=.1;shake=10}
function sFinalState(dt){const g=p.grab&&p.grab.alive?p.grab:null,t=p.t;p.rot=0;
 if(g&&!p.st1){g.vx*=.5;g.vy=Math.min(Math.max(g.vy,-200),200);g.fl=.6;g.y+=((GROUND-150)-g.y)*Math.min(1,dt*8);g.x+=(p.x+p.face*120-g.x)*Math.min(1,dt*4)}
 if(t<.42){if(t>.18&&!p.st1){p.st1=true;if(g){g.hp=Math.max(6,g.hp);hitDummy(g,'sh8',p.face);g.vx=0;g.vy=-300;g.fl=1}slash('big',SG,{scale:2,lvl:8,col2:SR,dx:90});kanjiFx('斬','JUMPING CLEAVE','#c8102e');shake=14;hitstop=Math.max(hitstop,.06);petals(p.x+p.face*90,p.y-80,20,1)}
  if(g&&p.st1){g.vx=0;g.vy=0;g.fl=.6;g.y+=((GROUND-170)-g.y)*Math.min(1,dt*6)}if(p.ground)p.vx*=Math.pow(.01,dt)}
 else if(t<.95){if(!p.st2){p.st2=true;setAnim('s_stance',true);cine.tz=1.7;cine.tdim=.7;say('…','#fff',true)}p.vx*=Math.pow(.001,dt);
  if(g){g.vx=0;g.vy=0;g.fl=.6;g.y+=((GROUND-170)-g.y)*Math.min(1,dt*5)}
  if(t%.04<dt){const a=Math.random()*6.283;SFX.push({t:'petal',x:p.x+Math.cos(a)*160,y:p.y-80+Math.sin(a)*110,vx:-Math.sin(a)*120,vy:Math.cos(a)*80,r:0,vr:6,l:.8,s:.9,c:'#ffc1dc'})}}
 else if(t<1.05){if(!p.st3){p.st3=true;const cx=g?g.x:p.x+p.face*200,x0=p.x,y0=p.y;p.x=clampX(cx+p.face*170);p.y=Math.min(p.y,GROUND);
   for(let k=1;k<=7;k++)ghosts.push({x:x0+(p.x-x0)*k/8,y:y0+(p.y-y0)*k/8,f:(FR.s_dash||FR.s_idle)[0],face:p.face,l:.1+k*.05,blue:1});
   sLine(x0,y0-72,p.x,p.y-72,SW,.9,16);sLine(x0,y0-72,p.x,p.y-72,'#9fb4ff',1,34);setAnim('s_after',true);flashT=.35;hitstop=.1;shake=20;kanjiFx('一閃','SINGLE FLASH','#3b4bd8');cine.tz=1.3;
   if(g){hitDummy(g,'sfcut',p.face);g.vx=0;g.vy=0}}p.vx=0}
 else if(t<1.75){p.vx=0;if(g){g.vx=0;g.vy=0;g.fl=.6}
  if(t-p.fcutT>.09&&p.fcut<6){p.fcutT=t;p.fcut++;const cx=g?g.x:p.x-p.face*170,cy=(g?g.y:p.y)-95,a=p.fcut*1.05+.3,L=95;
   sLine(cx-Math.cos(a)*L,cy-Math.sin(a)*L,cx+Math.cos(a)*L,cy+Math.sin(a)*L,p.fcut%2?SW:SP,.45,7);
   if(g){g.hp=Math.max(4,g.hp);hitDummy(g,'sfcut',p.face);g.vx=0;g.vy=0}popNum(8+p.fcut,p.fcut%2?SP:SG);petals(cx,cy,6,1);shake=Math.max(shake,5)}}
 else if(!p.shot){p.shot=true;setAnim('s_calm',true);const cx=g?g.x:p.x-p.face*170,cy=(g?g.y:p.y)-90;
  if(g){g.hp=Math.max(5,g.hp);hitDummy(g,'sfinal',Math.sign(g.x-p.x)||-p.face);g.vy=-2400;g.vx=(Math.sign(g.x-p.x)||-p.face)*260;g.fl=1}
  shake=34;slowT=.7;flashT=.45;hitstop=.1;cine.tz=1.15;cine.tdim=.3;cine.pillar={x:cx,l:1.2,col:SP};
  for(let i=0;i<5;i++)waves.push({x:cx,y:cy+i*12,r:10+i*28,l:1,big:true});burst(cx,cy);petals(cx,cy,90,1);
  for(let i=0;i<70;i++){const a=Math.random()*6.28,v=250+Math.random()*800;sparks.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-250,l:.8,c:[SR,SG,SW,SP][i%4]})}
  kanjiFx('必殺','FINISHER','#d4202a',{x:VW/2,y:VH*.7,size:130});card('ISSEN — ONE FLASH!',(8+p.fcut)+' CUTS · PERFECT 8','#c8102e')}
 if(t>2.7){p.state='normal';p.scombo=0;p.inv=.4;p.vx=0}}
// ---- samurai combo-string effects ----
function sStrFx(fx){
 if(fx==='triplewind'){for(let i=0;i<3;i++)sProj.push({x:p.x+p.face*90,y:p.y-40-i*45,vx:p.face*(880+i*90),l:1,s:1.3,hit:new Set(),kb:'sgale',face:p.face});kanjiFx('風','TRIPLE WIND','#1f9e8f');return true}
 if(fx==='breaker'){areaHit(p.x+p.face*90,p.y,230,'breaker');slash('big',SR,{scale:2.1,lvl:8,col2:SG,dx:90});kanjiFx('返し','PARRY BREAKER','#c8102e');setAnim('s_riposte',true);return true}
 if(fx==='sakuracyc'){p.scyc={t:1,k:0,fin:'sakurafin',kb:'sakura'};petals(p.x,p.y-70,40,1);kanjiFx('桜','SAKURA CYCLONE','#ff3d8e');return true}
 if(fx==='phantom'){p.phant={n:0,k:.05,tg:nTarget(900)};kanjiFx('一閃','PHANTOM IAIDO','#3b4bd8');return true}
 if(fx==='bladedance'){p.bdance={n:0,k:0,tg:nTarget(700)};kanjiFx('斬','BLADE DANCE','#c8102e');return true}
 if(fx==='hundred'){p.hund={t:1.1,k:0,tg:nTarget(800)};kanjiFx('桜','HUNDRED PETALS','#ff3d8e');petals(p.x,p.y-90,50,1);return true}
 return false}
// ---- forms: Paddy -> Neon Ninja -> Samurai ----
function setForm(f){if(p.state==='nmorph'&&p.t<.18){p.morphQ=f+1;return}if(['eclipse','finishhim','sfinal','respawn','bunny','ledge'].includes(p.state))return;
 const cur=p.sam?2:p.ninja?1:0;if(f===cur)f=0;if(f===cur)return;
 const from=(FR[p.anim]||FR.idle)[p.fi];p.ninja=f===1;p.sam=f===2;p.hunt=false;huntBtn&&huntBtn.classList.remove('lit');p.wall=false;p.combo=0;p.ncombo=0;p.scombo=0;p.rot=0;p.scyc=null;
 const L=[['idle','back to Paddy','#ffe08a',['#ffe08a','#fff']],['n_idle','NEON NINJA!',NV,[NV,NC,'#fff']],['s_draw','SAMURAI PADDY!',SR,[SR,SG,SP,'#fff']]][f];
 act('nmorph',L[0],{say:L[1],c:L[2]});p.mfrom=from;p.blend=0;p.vx*=.3;
 waves.push({x:p.x,y:p.y,r:10,l:1,big:true});puffShadow(p.x,p.y);spark(p.x,p.y-70,26,L[3],380);shake=8;
 if(f===2){kanjiFx('侍','SAMURAI','#c8102e');petals(p.x,p.y-80,24,1)}morphStrike()}
function cycleForm(){setForm(((p.sam?2:p.ninja?1:0)+1)%3)}
// ---- stun (bark) ----
function stunMe(dir){p.state='stun';p.t=0;acted=true;setAnim(p.sam?'s_hurt':p.ninja?'n_hurt':'hurt',true);p.vx=dir*170;say('WOOF! (dizzy)','#ffe0a0')}
// ===================== THE ARMOURED ROTTWEILER =====================
// weak, slow, juggle-friendly. Moves: big telegraphed punch, bite, bark (tiny stun). Goofs off when you're not fighting him.
function dAnim(d,a){if(d.anim!==a){const cf=(FR[d.anim]||[])[d.fi];if(cf){d.prevF=cf;d.prevFs=d.fs;d.blend=.12}d.anim=a;d.ft=0;d.fi=0}}
function dSet(d,st,a){if(d.st!==st){d.st=st;d.t=0}if(a)dAnim(d,a)}
function dogHit(d,move,air){d.aggro=7;d.hitT=now;d.bub=null;if(!d.alive)return;d.st=air||d.vy<-200?'air':'hurt';d.t=0;d.cool=Math.max(d.cool,1.5)}
function dogStrike(d,dmg,kind){if(p.inv>0||CINE.includes(p.state)||['respawn','nmorph','stun'].includes(p.state))return false;const dir=Math.sign(p.x-d.x)||-1;
 if(p.state==='sparry'){p.face=d.x>p.x?1:-1;if(p.t<.25){d.stun=1.3;dSet(d,'hurt','r_hurt');d.vx=-dir*260;d.cool=2.6;sRiposte(true,d)}else{say('BLOCKED!','#cfe3ff');p.vx=dir*220;spark(p.x-dir*40,p.y-80,12,['#cfe3ff','#fff'],260);shake=Math.max(shake,5)}return true}
 if(kind==='bark'){stunMe(dir);return true}
 comboEnd(true);p.hp=Math.max(0,p.hp-dmg);if(p.hp<=.01){p.hp=3;p.wall=false;loseLife();return true}
 p.wall=false;p.rot=0;act('hurt',p.sam?'s_hurt':p.ninja?'n_hurt':'hurt',{say:kind==='bite'?'NIBBLED!':'BONK!',c:'#ff9a9a'});p.vy=-300;p.vx=dir*240;p.ground=false;p.inv=1.1;shake=Math.max(shake,6);return true}
function startKO(d){d.alive=false;dSet(d,'ko','r_ko');d.vx=0;d.bub={t:'K.O.!',l:1.3,c:'#ffe14d'};say('K.O.!! (he\'ll be back)','#ffe14d',true);spark(d.x,d.y-60,18,['#ffe14d','#fff'],300)}
function updKO(d,dt){const t=d.t;
 if(d.st==='ko'){dAnim(d,'r_ko');if(t>2)  {dSet(d,'sit','r_sit');d.bub={t:'?',l:1.4,c:'#fff'}}}
 else if(d.st==='sit'){if(t>1.4){dSet(d,'wag','r_wag');d.bub={t:'♥',l:1.2,c:'#ff6f9f'}}}
 else if(d.st==='wag'){d.hp=Math.min(d.max,d.hp+d.max*dt/1.2);if(t>1.3){d.hp=d.max;d.alive=true;dSet(d,'idle','r_idle');d.cool=1.6;d.aggro=0;spark(d.x,d.y-120,12,['#ffe14d','#fff'],250)}}
 else dSet(d,'ko','r_ko')}
const SILLY={sniff:['r_sniff',2.4,'sniff sniff…'],scratch:['r_scratch',2,'scritch scritch'],chase:['r_chase',2.6,'tail!! TAIL!!'],howl:['r_howl',2.2,'AWOOOOO~ ♪']};
function goSilly(d,k){const s=SILLY[k||['sniff','scratch','chase','howl'][Math.floor(Math.random()*4)]];dSet(d,k||Object.keys(SILLY).find(q=>SILLY[q]===s),s[0]);d.bub={t:s[2],l:1.6,c:'#fff'}}
function dogAttackHit(d,reach,dmg,kind){const rel=(p.x-d.x)*d.face;if(rel>-40&&rel<reach&&p.y>d.y-240&&p.y<d.y+30)dogStrike(d,dmg,kind)}
function updDog(d,dt){
 d.t+=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.cool-=dt;d.stun-=dt;d.aggro-=dt;d.blend-=dt;d.hpShow+=(d.hp-d.hpShow)*Math.min(1,dt*5);if(d.bub){d.bub.l-=dt;if(d.bub.l<=0)d.bub=null}
 d.fs+=(d.face-d.fs)*Math.min(1,dt*12);
 const held=CINE.includes(p.state)&&p.grab===d;
 d.fl-=dt;d.vy+=(d.fl>0?420:1700)*dt;if(d.fl>0)d.vx*=Math.pow(.3,dt);d.x+=d.vx*dt;d.y+=d.vy*dt;
 if(d.x<50){d.x=50;d.vx=Math.abs(d.vx)*.5}if(d.x>WALL_X-40){d.x=WALL_X-40;d.vx=-Math.abs(d.vx)*.5}if(d.y<-90000)d.y=-90000;
 if(d.y>=GROUND){d.y=GROUND;if(d.vy>350){d.vy=Math.max(-480,d.vy*-.3);d.sq=.7;spark(d.x,GROUND,8,'#d9c49a',160)}else d.vy=0;d.vx*=Math.pow(.02,dt)}
 const air=d.y<GROUND-2||d.vy<-1;d.rot+=((air?Math.max(-.45,Math.min(.45,d.vx/1200)):0)-d.rot)*Math.min(1,dt*10);
 const step=()=>{const a=A[d.anim],fr=FR[d.anim];if(!a||!fr)return;d.ft+=dt*a[2];d.fi=a[3]?Math.floor(d.ft)%fr.length:Math.min(fr.length-1,Math.floor(d.ft))};
 if(!d.alive){updKO(d,dt);step();return}
 if(d.hp<=0&&!air&&!held){startKO(d);step();return}
 if(air){d.st='air';dAnim(d,d.vy<-250?'r_up':d.vy>350?'r_down':'r_tumble');step();return}
 if(d.st==='air'){dSet(d,'hurt','r_hurt');d.t=.15}
 if(held||d.st==='hurt'){if(!held&&d.t>.5)dSet(d,'idle','r_idle');else{step();return}}
 if(d.stun>0){dAnim(d,'r_hurt');step();return}
 const dx=p.x-d.x,adx=Math.abs(dx),pOK=p.state!=='respawn'&&!CINE.includes(p.state);
 if(adx<300&&pOK&&typeof anyInput==='function'&&anyInput())d.aggro=Math.max(d.aggro,2.5);
 const t=d.t;
 switch(d.st){
  case 'punch': if(t<.85)dAnim(d,'r_wind');else if(t<1.05){dAnim(d,'r_punch');d.x+=d.face*200*dt;if(t>.95&&!d.done){d.done=true;dogAttackHit(d,180,.5,'punch');shake=Math.max(shake,4)}}
   else if(t<1.5)dAnim(d,'r_follow');else{dSet(d,'idle','r_idle');d.cool=2.3+Math.random()*1.3;if(Math.random()<.2)goSilly(d,Math.random()<.5?'sniff':'scratch')}break;
  case 'bite': if(t<.55)dAnim(d,'r_lick');else if(t<.8){dAnim(d,'r_bite');d.x+=d.face*300*dt;if(t>.65&&!d.done){d.done=true;dogAttackHit(d,140,.34,'bite');d.bub={t:'CHOMP!',l:.7,c:'#fff'}}}
   else if(t>1.15){dSet(d,'idle','r_idle');d.cool=2.2+Math.random()*1.2}break;
  case 'bark': if(t<.6)dAnim(d,'r_inhale');else{dAnim(d,'r_bark');if(!d.done){d.done=true;d.bub={t:'WOOF!',l:.8,c:'#fff'};dWaves.push({x:d.x+d.face*70,y:d.y-150,r:20,l:1,dir:d.face,d,hit:false});shake=Math.max(shake,3)}}
   if(t>1.25){dSet(d,'idle','r_idle');d.cool=2.4+Math.random()*1.2}break;
  case 'sniff':case 'scratch':case 'chase':case 'howl':{const s=SILLY[d.st];if(d.st==='chase'){if(t%.3<dt)d.face*=-1;d.x+=Math.sin(t*7)*60*dt}
   if(t>s[1]||(d.aggro>1&&t>.4)){dSet(d,'idle','r_idle');d.cool=Math.max(d.cool,1)}}break;
  default:{const engaged=pOK&&adx<560&&d.aggro>0;
   if(engaged){if(adx>30)d.face=dx>0?1:-1;
    if(adx>150){dSet(d,'walk','r_walk');d.x+=Math.sign(dx)*68*dt}else dSet(d,'idle','r_idle');
    if(d.cool<=0&&adx<330&&p.y>GROUND-260){const r=Math.random();d.done=false;
     if(adx<180&&r<.45){dSet(d,'punch','r_wind');d.bub={t:'!',l:.85,c:'#ff4040'}}else if(adx<150&&r<.75){dSet(d,'bite','r_lick');d.bub={t:'!',l:.55,c:'#ff4040'}}else{dSet(d,'bark','r_inhale');d.bub={t:'!',l:.6,c:'#ff4040'}}}}
   else{dSet(d,'idle','r_idle');if(t>2.5+(d.idleR||0)){d.idleR=Math.random()*2;goSilly(d)}}}}
 step()}
function updDummies(dt){for(const d of dummies)updDog(d,dt);
 for(const w of dWaves){w.r+=dt*650;w.l=1-w.r/330;if(!w.hit){const rx=(p.x-w.x)*w.dir;if(rx>-30&&Math.abs(Math.abs(p.x-w.x)-w.r)<45&&p.y>GROUND-80){w.hit=true;dogStrike(w.d,0,'bark')}}}
 for(let i=dWaves.length-1;i>=0;i--)if(dWaves[i].l<=0)dWaves.splice(i,1)}
function drawDogFrame(f,fs,alpha){const im=f&&IMG[f.f];if(!im)return;ctx.save();if(alpha!=null)ctx.globalAlpha*=alpha;ctx.scale(-fs*SC,SC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}
function drawDummies(){for(const d of dummies){const fr=FR[d.anim]||FR.r_idle;if(!fr)continue;const f=fr[Math.min(d.fi,fr.length-1)],lying=['ko','sit','wag'].includes(d.st),H=lying?110:d.h;
 const hg=Math.max(0,GROUND-d.y);ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(d.x,GROUND+3,62*Math.max(.35,1-hg/500),9,0,0,6.28);ctx.fill();
 const tele=(d.st==='punch'&&d.t<.85)||(d.st==='bite'&&d.t<.55)||(d.st==='bark'&&d.t<.6);
 if(tele){const u=Math.sin(now*22)*.5+.5;ctx.save();const gx=d.x+d.face*(d.st==='punch'?50:60),gy=d.y-(d.st==='punch'?150:170),g=ctx.createRadialGradient(gx,gy,4,gx,gy,70+u*20);
  g.addColorStop(0,`rgba(255,40,30,${.45+.3*u})`);g.addColorStop(.6,`rgba(255,60,40,${.18+.1*u})`);g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,90,0,6.283);ctx.fill();ctx.restore()}
 ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);const s=1+d.sq*.12;ctx.scale(1/s,s);
 if(d.blend>0&&d.prevF){drawDogFrame(d.prevF,d.prevFs||d.fs,d.blend/.12);drawDogFrame(f,d.fs,1-.5*d.blend/.12)}else drawDogFrame(f,d.fs);
 if(d.flash>0){ctx.globalCompositeOperation='lighter';drawDogFrame(f,d.fs,Math.min(1,d.flash/.12)*.55);ctx.globalCompositeOperation='source-over'}
 ctx.restore();
 // dizzy stars (KO / stunned)
 if(d.st==='ko'||(d.stun>0&&d.alive)){ctx.save();for(let i=0;i<3;i++){const a=now*5+i*2.09,x=d.x+Math.cos(a)*42,y=d.y-H-10+Math.sin(a)*10;ctx.fillStyle=i%2?'#ffe14d':'#fff';ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?4:10,b=k*Math.PI/5+now*3;ctx.lineTo(x+Math.cos(b)*r,y+Math.sin(b)*r)}ctx.closePath();ctx.fill()}ctx.restore()}
 // health bar
 const bw=96,bx=d.x-bw/2,by=d.y-H-34;ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(bx-2,by-2,bw+4,11);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(bx,by,bw*Math.max(0,d.hpShow)/d.max,7);
 const fr2=Math.max(0,d.hp)/d.max;ctx.fillStyle=fr2>.5?'#5fd35f':fr2>.25?'#ffd34d':'#ff5a4a';ctx.fillRect(bx,by,bw*fr2,7);
 // speech bubble
 if(d.bub){const b=d.bub,a=Math.min(1,b.l*3),big=b.t.length<=2;fancy(b.t,d.x+(big?0:d.face*10),by-(big?26:20),big?40:22,0,1,a,b.c)}}}
// ---- update + draw hooks ----
let formW=[1,0,0];
const hx2=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),toHex=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
function formBase(){const B=[['#9fd6f7','#d8f0ff'],['#b4a4ea','#ebe3ff'],['#f3c7cf','#fff0f2']];return [0,1].map(j=>toHex([0,1,2].map(c=>B[0][j]&&(hx2(B[0][j])[c]*formW[0]+hx2(B[1][j])[c]*formW[1]+hx2(B[2][j])[c]*formW[2]))))}
function r8Update(dt){
 p.scT=(p.scT||0)-dt;if(p.scT<=0&&!SST.includes(p.state))p.scombo=0;
 const tw=[!p.ninja&&!p.sam?1:0,p.ninja?1:0,p.sam?1:0];for(let i=0;i<3;i++)formW[i]+=(tw[i]-formW[i])*Math.min(1,dt*3);
 if(kanji){kanji.t+=dt;if(kanji.t>1.45)kanji=null}
 if(ninjaBtn){const ic=p.sam?'🐱':p.ninja?'⚔️':'🥷';if(ninjaBtn.textContent!==ic)ninjaBtn.textContent=ic;ninjaBtn.classList.toggle('lit',!!(p.ninja||p.sam))}
 for(const e of SFX){e.l-=dt;if(e.t==='petal'){if(e.pull){e.x+=e.vx*dt;e.y+=e.vy*dt}else{e.vx*=Math.pow(.25,dt);e.vy=e.vy*Math.pow(.3,dt)+60*dt;e.x+=(e.vx+Math.sin(now*4+e.r)*30)*dt;e.y+=e.vy*dt}e.r+=e.vr*dt}}
 for(let i=SFX.length-1;i>=0;i--)if(SFX[i].l<=0)SFX.splice(i,1);if(SFX.length>500)SFX.splice(0,SFX.length-500);
 for(const s of sProj){s.x+=s.vx*dt;s.l-=dt;if(Math.random()<.5)SFX.push({t:'petal',x:s.x-s.face*20,y:s.y+(Math.random()-.5)*60*s.s,vx:-s.vx*.1,vy:(Math.random()-.5)*40,r:0,vr:8,l:.5,s:.7,c:Math.random()<.5?'#ffc1dc':'#dffcf6'});
  for(const d of dummies)if(d.alive&&!s.hit.has(d)&&Math.abs(d.x-s.x)<55*s.s&&s.y>d.y-d.h-20&&s.y<d.y+10){s.hit.add(d);C.atk++;hitDummy(d,s.kb,Math.sign(s.vx))}
  if((s.x>WALL_X-20&&s.y>WT&&s.vx>0)||s.x<10||s.x>VW+60)s.l=0}
 for(let i=sProj.length-1;i>=0;i--)if(sProj[i].l<=0)sProj.splice(i,1);
 if(p.scyc){const c=p.scyc;c.t-=dt;c.k+=dt;if(Math.random()<dt*40)petals(p.x+(Math.random()-.5)*200,p.y-40-Math.random()*150,1,1);
  if(c.k>.09){c.k=0;C.atk++;for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<330&&Math.abs(d.y-p.y)<340){d.x+=(p.x+p.face*90-d.x)*.25;hitDummy(d,c.kb,Math.sign(d.x-p.x)||p.face)}}
  if(c.t<=0){p.scyc=null;C.atk++;areaHit(p.x,p.y,340,c.fin);slash('big',SR,{scale:2.6,lvl:8,col2:SP,dx:60});shake=18;flashT=Math.max(flashT,.15);petals(p.x,p.y-90,50,1);waves.push({x:p.x,y:p.y-40,r:20,l:1,big:true})}}
 if(p.phant){const c=p.phant;c.k-=dt;if(c.k<=0){c.k=.15;const tg=c.tg&&c.tg.alive?c.tg:nTarget(900);const x0=p.x,y0=p.y;
   if(tg){p.face=c.n%2?-1:1;if(tg.x<p.x&&c.n===0)p.face=-1;p.x=clampX(tg.x+p.face*170);sLine(x0,y0-72,p.x,p.y-72,SW,.5,10);C.atk++;hitDummy(tg,c.n<2?'siaido':'siaidocut',p.face);petals(tg.x,tg.y-90,8,1)}
   for(let k=1;k<=5;k++)ghosts.push({x:x0+(p.x-x0)*k/6,y:y0,f:(FR.s_dash||FR.s_idle)[0],face:p.face,l:.1+k*.04,blue:1});setAnim('s_after',true);if(++c.n>=3)p.phant=null}}
 if(p.bdance){const c=p.bdance;c.k-=dt;if(c.k<=0){c.k=.075;const tg=c.tg&&c.tg.alive?c.tg:null,cx=tg?tg.x:p.x+p.face*120,cy=(tg?tg.y:p.y)-95,a=c.n*2.4,L=110;
   sLine(cx-Math.cos(a)*L,cy-Math.sin(a)*L,cx+Math.cos(a)*L,cy+Math.sin(a)*L,c.n%2?SR:SW,.4,9);C.atk++;if(tg){tg.hp=Math.max(2,tg.hp);hitDummy(tg,c.n<7?'bladedance':'bladefin',p.face)}setAnim(['s_h1','s_h2','s_h3','s_h5','s_h7'][c.n%5],true);if(++c.n>=8)p.bdance=null}}
 if(p.hund){const c=p.hund;c.t-=dt;c.k-=dt;const tg=c.tg&&c.tg.alive?c.tg:null;if(tg&&Math.random()<dt*60)SFX.push({t:'petal',x:tg.x+(Math.random()-.5)*180,y:tg.y-260-Math.random()*60,vx:(Math.random()-.5)*60,vy:300+Math.random()*200,r:0,vr:9,l:.7,s:1,c:Math.random()<.5?'#ffc1dc':'#ff8fbf',pull:1});
  if(c.k<=0){c.k=.08;C.atk++;if(tg){tg.hp=Math.max(2,tg.hp);hitDummy(tg,'petals',p.face)}}if(c.t<=0){p.hund=null;C.atk++;if(tg)hitDummy(tg,'petalsfin',p.face);if(tg)petals(tg.x,tg.y-90,60,1);shake=16;flashT=Math.max(flashT,.12)}}}
function r8DrawFx(){
 for(const e of SFX){if(e.t==='line'){const a=Math.max(0,e.l/e.l0);ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.globalAlpha=a;ctx.strokeStyle=e.col;ctx.lineWidth=e.w*(.4+.6*a);ctx.beginPath();ctx.moveTo(e.x0,e.y0);ctx.lineTo(e.x1,e.y1);ctx.stroke();ctx.restore()}
  else{ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.r);ctx.globalAlpha=Math.max(0,Math.min(1,e.l*2));ctx.fillStyle=e.c;ctx.beginPath();ctx.ellipse(0,0,7*e.s,3.6*e.s,0,0,6.283);ctx.fill();ctx.restore()}}
 for(const s of sProj){ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.face,1);ctx.globalCompositeOperation='lighter';const R=60*s.s;ctx.globalAlpha=Math.min(1,s.l*3);
  for(let k=0;k<3;k++){ctx.strokeStyle=k?SWIND:'#fff';ctx.lineWidth=(12-k*3)*s.s;ctx.beginPath();ctx.arc(-R*.6-k*14,0,R-k*6,-1.15,1.15);ctx.stroke()}ctx.restore()}
 for(const w of dWaves){ctx.save();ctx.globalAlpha=Math.max(0,w.l)*.8;ctx.strokeStyle='#fff3c0';ctx.lineWidth=7*Math.max(.2,w.l);ctx.beginPath();const st=w.dir>0?-1.3:Math.PI-1.3;ctx.ellipse(w.x,w.y+60,w.r,w.r*.8,0,w.dir>0?-1.2:Math.PI-1.2+0,w.dir>0?1.2:Math.PI+1.2);ctx.stroke();
  ctx.globalAlpha*=.6;ctx.beginPath();ctx.ellipse(w.x,w.y+60,w.r*.8,w.r*.64,0,w.dir>0?-1.1:Math.PI-1.1,w.dir>0?1.1:Math.PI+1.1);ctx.stroke();ctx.restore()}
 if(p.state==='stun'){ctx.save();for(let i=0;i<3;i++){const a=now*6+i*2.09,x=p.x+Math.cos(a)*34,y=p.y-150+Math.sin(a)*8;ctx.fillStyle=i%2?'#ffe14d':'#fff';ctx.beginPath();ctx.arc(x,y,6,0,6.283);ctx.fill()}ctx.restore()}
 if(p.state==='scharge'&&p.t>.3){const ch=p.sc;ctx.save();ctx.globalCompositeOperation='lighter';const R2=40+80*ch+Math.sin(now*30)*4,g=ctx.createRadialGradient(p.x,p.y-60,6,p.x,p.y-60,R2);
  g.addColorStop(0,'rgba(255,190,215,.85)');g.addColorStop(1,'rgba(255,60,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y-60,R2,0,6.283);ctx.fill();ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(p.x-50,p.y-200,100,9);ctx.fillStyle=ch>=1?'#fff':'#ff6fae';ctx.fillRect(p.x-50,p.y-200,100*ch,9)}
 if(p.state==='sparry'&&p.t<.25){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(.25-p.t)*3;ctx.strokeStyle='#bfe8ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x+p.face*40,p.y-80,70,-1.3,1.3);ctx.stroke();ctx.restore()}}
function drawKanji(){if(!kanji)return;const k=kanji,t=k.t,inn=1-Math.pow(1-Math.min(1,t/.16),3),out=t>1.05?Math.max(0,1-(t-1.05)/.4):1;if(out<=0)return;
 const S=k.size,w=S*k.k.length*1.15+60;ctx.save();ctx.translate(k.x,k.y);
 ctx.save();ctx.globalAlpha=out*.88;ctx.rotate(-.06);ctx.fillStyle=k.col;ctx.beginPath();const x0=-w/2,x1=x0+w*inn,h=S*.62;
 ctx.moveTo(x0,-h*.7);for(let i=0;i<=10;i++){const x=x0+(x1-x0)*i/10;ctx.lineTo(x,-h*(.75+((i*37)%7)/40))}ctx.lineTo(x1+18,0);for(let i=10;i>=0;i--){const x=x0+(x1-x0)*i/10;ctx.lineTo(x,h*(.62+((i*53)%5)/30))}ctx.closePath();ctx.fill();
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x0,h*.35,(x1-x0),5);ctx.restore();
 const sc=1.6-.6*inn;ctx.globalAlpha=out*Math.min(1,t/.08);ctx.scale(sc,sc);ctx.font=`${S}px Kanji,'Noto Serif CJK JP','Hiragino Mincho ProN','Yu Mincho',serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.lineJoin='round';ctx.lineWidth=S*.12;ctx.strokeStyle='#fff';ctx.strokeText(k.k,0,-S*.04);ctx.fillStyle='#160606';ctx.fillText(k.k,0,-S*.04);ctx.restore();
 fancy(k.en,k.x,k.y+S*.62,26,-.04,1,out*Math.min(1,Math.max(0,(t-.08)/.12)),'#fff')}
