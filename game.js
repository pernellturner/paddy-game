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
 carry:['carryrat',null,11,1],bk_leap:['bunnykick',[0,1],8,0],bk_roll:['bunnykick',[2],1,0],bk_kick:['bunnykick',[3,2],1,0],bk_land:['bunnykick',[4,5],6,0],barge:['blinkbarge',[2,3],8,0],pawpop:['launcher',[0,1,2,3],16,0],
 t_swipe:['t_combo',[1,2,3],12,0],t_smash:['t_combo',[4,5,6],10,0],t_spin:['t_air',[0,1],12,1],t_lunge:['t_air',[2,3],10,0],t_dive:['t_air',[4,5],8,1],carryidle:['carryrat',[0],1,0],chomp:['carryrat',[0],1,0],
 n_idle:['n_idle',[1,2,3,4,3,2],6,1],n_run:['n_run',null,15,1],n_rise:['n_jump',[2],1,0],n_fall:['n_jump',[3],1,0],n_land:['n_jump',[5],1,0],n_flip:['n_flip',[1,2,3,4],13,0],n_flip2:['n_flip',[2,3,4],13,0],
 n_a1:['n_attack',[0,1,2],22,0],n_a2:['n_attack',[2,3],18,0],n_a3:['n_dashslash',[2,3],16,0],n_a4:['n_attack',[3,4],18,0],n_a5:['n_attack',[1,2,3],20,0],n_rise5:['n_flip',[1,2],12,0],n_a6:['n_dashslash',[3,4,5],10,0],n_air1:['n_attack',[2,3],16,0],n_air2:['n_flip',[2,3],16,0],
 n_throw:['n_throw',[1,2,3,4],18,0],n_dash:['n_dashslash',[2,3],12,1],n_step:['n_dashslash',[3,4],12,0],n_dive:['n_jump',[4],1,0],n_hurt:['n_jump',[4],1,0],n_wall:['n_run',null,20,1],n_charge:['n_idle',[1,2,3,4,3,2],8,1],
 t_idle:['t_idle',null,8,1],t_run:['t_run',null,14,1],t_jump:['t_jump',[3,4,5],9,0],t_fall:['t_jump',[6,7],6,0],t_land:['t_jump',[8,9],12,0],
 t_claw:['t_claw',null,14,0],t_pounce:['t_pounce',null,12,1],t_roar:['t_roar',null,10,0],t_fire:['t_fireball',null,14,0],
 t_hurt:['t_hurt',null,12,0],t_victory:['t_victory',null,8,0],morph:['t_morph',null,8,0],unmorph:['t_morph',[7,6,5,4,3,2,1,0],10,0]};
const dur=a=>FR[a]?Math.max(FR[a].length/A[a][2],a==='blast'?.5:.3):.4;
// ---------- input ----------
const K={},P={};
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',
 Space:'jump',ArrowUp:'up',KeyW:'up',KeyX:'attack',KeyJ:'attack',KeyC:'special',KeyK:'special',KeyQ:'hunt',KeyV:'hunt',
 ShiftLeft:'run',ShiftRight:'run',KeyT:'tail',KeyL:'tail',KeyG:'tiger',KeyZ:'zoomies',KeyE:'hiss',KeyR:'swat',KeyF:'finisher',KeyH:'hurtTest',KeyY:'victory',KeyB:'eat',KeyN:'blink',KeyM:'morph',Digit3:'morph',ControlLeft:'blink',ControlRight:'blink'};
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
 idleT:0,rush:0,tcombo:0,tcT:0,tpow:0,tpowUsed:false,airHits:0,hang:0,dashStart:-9,grab:null,tair:0,lives:9,hp:3,inv:0,blinkCool:0,keepT:0,keepCombo:0,jc:0,mc:0,rot:0,fallTop:GROUND,perfect:false,miss:false,blend:0,prevF:null,holdT:0,wj:0,dj:0,startT:0,tiger:0,ninja:false,ncombo:0,ncT:0,nair:0,nc:0,nsteps:0,nstepT:0,nstepCool:0,storm:null,mfrom:null,carry:false,rats:0,shot:false,lastJump:-9};
let acted=false;const BUF={};const INSTANT=['morph','hunt','tiger','hurtTest','victory','blink'];
const waves=[],shots=[],sparks=[],ghosts=[],texts=[];let shake=0;
const lastTap={left:-9,right:-9};let now=0;
function tapDir(k){if(k!=='left'&&k!=='right')return;if(now-lastTap[k]<0.28){P.dash=k;BUF.dash=now;lastTap[k]=-9}else lastTap[k]=now}
function say(t,c,big){if(typeof cine!=='undefined'&&cine.card&&cine.card.t<1.3&&!big)return;if(p.rush>0)c='#ffd84d';texts.length=0;texts.push({t,c:c||'#fff',l:1,rot:(Math.random()-.5)*.18,big:!!big})}
function setAnim(a,force){if(!FR[a])a=p.tiger?'t_idle':p.ninja?'n_idle':'idle';if(p.anim!==a||force){const cf=(FR[p.anim]||[])[p.fi];if(cf&&p.anim!==a){p.prevF=cf;p.prevFace=p.face;p.prevX=p.x+(p.wall?40:0);p.prevY=p.y;p.blend=.1}p.anim=a;p.fi=0;p.ft=0}}
function act(state,anim,o){tokAct(state);p.state=state;p.t=0;p.shot=false;acted=true;setAnim(anim,true);if(o&&o.say)say(o.say,o.c||'#fff')}
const floorAt=x=>(x>WALL_X-20&&x<WALL_X+100)?WT:GROUND;
const spark=(x,y,n,c,s=300)=>{for(let i=0;i<n;i++)sparks.push({x,y,vx:(Math.random()-.5)*s*2,vy:-Math.random()*s,l:.4,c:Array.isArray(c)?c[i%c.length]:c})};
function eat(){act('eat','chomp',{say:'CHOMP!',c:'#ffe14d'});p.vx=0}
const puffs=[];
function dropRat(){if(!p.carry)return;p.carry=false;const r=rats.find(r=>r.gone);if(r){Object.assign(r,{gone:0,x:p.x+p.face*40,y:GROUND,dir:p.face,scare:1.5})}say('Rat escaped!','#ddd')}
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
 bubble={t:big?'SONIC MEOW!!':'MEOW!',l:1.1,big};meowSound(big?c:0);shake=big?6+10*c:3;
 for(const r of rats)if(!r.gone&&Math.abs(r.x-p.x)<(big?180+320*c:150)){r.scare=2.5;r.dir=Math.sign(r.x-p.x)||1}}
let bubble=null;
function blink(){if(p.ninja)return nStep();if(sky||p.blinkCool>0||['morph','unmorph','ledge','eat','catch','bunny','skyrise','skyslam','t_launch'].includes(p.state))return false;
 const from=p.x;puffShadow(p.x,p.y);const kc=p.state==='claw'?p.combo:0;
 let nx=p.x+p.face*330;nx=Math.max(50,Math.min(WALL_X+60,nx));if(p.y>WT+2&&from<WALL_X-60&&nx>WALL_X-60)nx=WALL_X-60;
 const barge=(p.state==='dash'||now-p.dashStart<.45)&&!p.tiger;
 p.x=nx;p.wall=false;p.inv=.6;p.blinkCool=.9;p.state='normal';p.t=0;p.vx=p.face*200;if(!p.ground)p.vy=Math.min(p.vy,0);
 if(barge){puffShadow(p.x,p.y);blinkBarge();extend();acted=true;return true}
 if(kc){p.keepCombo=kc;p.keepT=.7}extend();puffShadow(p.x,p.y);say('SHADOW BLINK!','#c9a7ff');acted=true;return true}
function puffShadow(x,y){for(let i=0;i<16;i++){const a=Math.random()*6.28;puffs.push({x:x+Math.cos(a)*30,y:y-60+Math.sin(a)*40,vx:Math.cos(a)*70,vy:Math.sin(a)*50,r:12+Math.random()*12,l:.55,dark:1})}}
function loseLife(){p.lives--;say(p.lives>0?'LOST A LIFE ('+p.lives+' left)':'OUT OF LIVES!','#ffb0b0',true);act('respawn',p.ninja?'n_hurt':'hurt');p.rot=0;p.vx=0;p.vy=-200;p.ground=false}
// ---- BUNNY KICK GRAB (perfect 8th hit) ----
function bunnyKick(){C.atk++;popNum(8,'#ff4fa3');act('bunny','pclunge',{say:'GRAB!',c:'#ff9ad5'});p.vx=p.face*760;p.vy=0;p.inv=4;p.kicks=0;
 let best=null,bd=300;for(const d of dummies){const dx=(d.x-p.x)*p.face;if(d.alive&&dx>-40&&dx<bd&&Math.abs(d.y-p.y)<180){bd=dx;best=d}}p.grab=best;p.kick=0;
 cineGo(1.45,.2,'#ff4fa3');slowT=.2;flashT=.12;shake=8;for(let i=1;i<4;i++)ghosts.push({x:p.x-p.face*i*40,y:p.y,f:FR.pclunge[0],face:p.face,l:.08+i*.03,blue:1})}
// ---- BLINK BARGE (blink during a dash) ----
function blinkBarge(){act('barge','barge',{say:'BLINK BARGE!',c:'#c9a7ff'});p.vx=p.face*950;p.inv=.5;shake=8;C.atk++}
// ---- juggling rats ----
function hitRat(r,move,dir){const launch=['uppercut','superleap','pawpop','t_launch','launcher','nrise'].includes(move),air=r.y<GROUND-5;
 if(!launch&&!air)return false;r.vy=launch?-900:-520;r.vx=dir*(launch?120:220);r.fl=.5;r.scare=3;spark(r.x,r.y-15,8,['#fff','#ffe14d']);
 addHit(move);if(air)say('JUGGLE!','#7fffd4');return true}
// ---- tiger chain ----
const TCH=[null,{k:'down',lunge:260},{k:'up',lunge:280},{k:'flat',lunge:300},{k:'down',lunge:320},{k:'cross',lunge:360},{k:'big',lunge:420}];
function tigerClaw(){C.atk++;p.tcombo=p.tcombo%6+1;p.tcT=.9;const c=TCH[p.tcombo];act('t_claw',p.tcombo===6?'t_smash':p.tcombo%2===0?'t_swipe':'t_claw');p.vx=p.face*c.lunge*(p.tpow>0?1.2:1);
 slash(c.k,p.tcombo%2?'#ff9a2e':'#ffe14d',{fire:1,scale:1.45*(p.tpow>0?1.25:1),dx:110,dy:85});popNum(p.tcombo,'#ff9a2e');shake=6+p.tcombo;
 spark(p.x+p.face*110,p.y-85,12+p.tcombo*2,['#ff9a2e','#ffe14d','#fff'],350);if(p.tcombo===6)say('INFERNO SLASH!','#ff7a2e',true)}
function tigerPowerUp(){p.tpow=8;if(p.ground){act('t_claw','t_smash');p.vx=0}p.tpowUsed=true;say('TIGER POWER UP!','#ff7a2e',true);shake=18;slowT=.25;flashT=.25;
 for(let i=0;i<3;i++)waves.push({x:p.x,y:p.y-40*i,r:10+i*20,l:1,big:true});spark(p.x,p.y-80,50,['#ff9a2e','#ffe14d','#fff','#ff4a1a'],600)}
// ---- SKY BATTLE (tiger launcher) ----
let sky=null,camY=0;
function skyLaunch(){act('t_launch','t_lunge',{say:'SKY LAUNCHER!',c:'#ff9a2e'});p.vy=-300;p.vx=p.face*120;p.ground=false;slash('up','#ffe14d',{fire:1,scale:1.6,dx:100,dy:90});shake=10;
 let best=null,bd=240;for(const d of dummies){const dx=(d.x-p.x)*p.face;if(d.alive&&dx>-40&&dx<bd&&Math.abs(d.y-p.y)<200){bd=dx;best=d}}
 if(best){hitDummy(best,'t_launch',p.face);best.vy=-2600;best.vx=0;best.fl=0;best.skyT=best;sky={phase:'rise',t:0,d:best,hits:0};act('skyrise','t_lunge');p.vy=-1500;p.vx=0;p.inv=99}}
function exitSky(slam){const s0=sky;sky=null;camY=Math.min(camY,600);p.inv=.8;
 if(s0&&s0.d){const d=s0.d;d.inSky=false;if(slam){d.x=Math.max(60,Math.min(WALL_X-40,p.x+p.face*90));d.y=-200;d.vy=1800;d.vx=0;d.fl=0;d.slam=true}else{d.x=d.home;d.y=GROUND;d.vy=0;d.vx=0}}
 if(slam){p.y=-260;p.vy=1700;p.vx=0;act('skyslam','t_dive',{say:'METEOR SLAM!',c:'#ff7a2e'})}else{p.y=GROUND;p.vy=0;p.state='normal';p.ground=true}}
function finisher(){act('finisher','finisher',{say:'FINISHER!',c:'#c9a7ff'});p.vx=0;p.combo=0;shake=8;waves.push({x:p.x,y:p.y-40,r:10,l:1,big:true})}
function dashStrike(){act('dashstrike','dashstrike',{say:'DASH STRIKE!',c:'#ff9fd0'});p.vx=p.face*1150;if(!p.ground)p.vy=-120;shake=9;
 for(let i=0;i<14;i++)sparks.push({x:p.x+p.face*80,y:p.y-60+(Math.random()-.5)*60,vx:p.face*(300+Math.random()*400),vy:(Math.random()-.5)*200,l:.4,c:i%2?'#fff':'#ffb0e0'})}
function uppercut(){act('uppercut','uppercut',{say:'UPPERCUT!',c:'#ffe08a'});p.vy=-780;p.vx=p.face*120;p.ground=false;p.jumps=2;shake=6;spark(p.x+p.face*50,p.y-40,10,['#fff','#ffe08a'])}
function impact(big){areaHit(p.x,p.y,big?190:130,big?'dive':'diveclaw');shake=big?16:10;waves.push({x:p.x,y:p.y,r:10,l:1,big});for(let i=0;i<(big?26:14);i++)sparks.push({x:p.x+(Math.random()-.5)*60,y:p.y,vx:(Math.random()-.5)*(big?700:400),vy:-Math.random()*300,l:.5,c:i%3?'#d9c49a':'#fff'})}
function doDash(dir){if(p.ninja){nDash(dir);return}p.face=dir==='right'?1:-1;p.wall=false;p.dashCool=.45;p.dashStart=now;
 if(p.tiger){act('t_pounce','t_pounce',{say:'TIGER POUNCE!',c:'#ffb040'});p.vy=-420;p.vx=p.face*720;p.ground=false;return}
 if(!p.ground&&p.jumps>=2&&!p.airDash){p.airDash=true;act('wingdash','wingdash',{say:'WINGED DASH!',c:'#8fe0ff'});p.vx=p.face*1000;p.vy=-60;shake=6}
 else{act('dash','dash',{say:'DASH!'});p.vx=p.face*900;if(!p.ground)p.vy=Math.min(p.vy,0);shake=3}}
function hurtMe(){comboEnd(true);p.hp--;if(p.hp<=0){p.hp=3;dropRat();p.wall=false;loseLife();return}dropRat();p.wall=false;p.rot=0;act('hurt',p.tiger?'t_hurt':p.ninja?'n_hurt':'hurt',{say:'OUCH!',c:'#ff8080'});p.vy=-400;p.vx=-p.face*200;p.ground=false}
function victory(){act('victory',p.tiger?'t_victory':p.ninja?'n_flip':'victory',{say:'VICTORY!',c:'#ffe14d'});p.vx=0;spark(p.x,p.y-80,24,['#ffe14d','#fff','#ff9ad5'],400)}
function morph(){p.ninja=false;p.rot=0;p.wall=false;p.hunt=false;dropRat();huntBtn&&huntBtn.classList.remove('lit');act('morph','morph',{say:'FIRE TIGER!',c:'#ff9a2e'});p.vx=0;shake=10;waves.push({x:p.x,y:p.y,r:10,l:1,big:true})}
function shoot(fire){shots.push({x:p.x+p.face*110,y:p.y-60,vx:p.face*(fire?700:620),l:1.6,a:0,hit:new Set(),fire});shake=8}
const MANNER=['groom','stretch','sitflick','sniff','loaf'];
const anyInput=()=>Object.keys(P).length>0||K.left||K.right||K.down||K.jump;
const huntBtn=document.querySelector('[data-k=hunt]'),tigerBtn=document.querySelector('[data-k=tiger]');
function update(dt){
 now+=dt;p.t+=dt;p.cool-=dt;p.dashCool-=dt;p.wj-=dt;p.dj-=dt;p.startT-=dt;
 const dir=(K.right?1:0)-(K.left?1:0);p.holdT=dir?p.holdT+dt:0;
 if(P.morph)toggleNinja();nUpdate(dt);r6Update(dt);
 // tiger timer
 if(sky){sky.t+=dt;if(sky.phase==='fight'){p.tiger=Math.max(p.tiger,3);
   if(sky.t>14||P.tiger){exitSky(true)}
   else if(!sky.d.alive){sky.d.alive=true;sky.d.hp=12}}
   if(sky&&sky.phase==='rise'&&sky.t>2.5)exitSky(false)}
 if(p.tiger>0&&p.state!=='morph'&&!sky){p.tiger-=dt;if(p.tiger<=0||P.tiger){p.tiger=0;act('unmorph','unmorph',{say:'back to Paddy',c:'#ffe08a'});p.vx=0}}
 else if(P.tiger&&!p.tiger&&!['morph','unmorph','hurt'].includes(p.state))morph();
 tigerBtn&&tigerBtn.classList.toggle('lit',p.tiger>0);
 if(p.rush>0){p.rush-=dt;if(Math.random()<dt*30)sparks.push({x:p.x+(Math.random()-.5)*120,y:p.y-Math.random()*130,vx:(Math.random()-.5)*40,vy:-60-Math.random()*60,l:.5,c:Math.random()<.5?'#ffd84d':'#fff'});if(p.rush<=0)say('rush over','#fff')}
 p.blend-=dt;
 for(const f of puffs){f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*30;f.l-=dt}for(let i=puffs.length-1;i>=0;i--)if(puffs[i].l<=0)puffs.splice(i,1);
 p.inv-=dt;p.blinkCool-=dt;p.keepT-=dt;p.tcT-=dt;if(p.tcT<=0)p.tcombo=0;p.tpow-=dt;p.hang-=dt;if(hitNum){hitNum.l-=dt*1.4;if(hitNum.l<=0)hitNum=null}flashT-=dt;
 if(p.tiger>0&&C.n>=10&&!p.tpowUsed&&p.state!=='morph')tigerPowerUp();if(!p.tiger)p.tpowUsed=false;
 if(P.blink)blink();
 if(P.hurtTest&&p.inv<=0&&p.state!=='respawn')hurtMe();
 if(P.victory&&p.ground&&p.state==='normal')victory();
 if(P.hunt&&!p.tiger&&!p.ninja){p.hunt=!p.hunt;say(p.hunt?'HUNT MODE':'hunt off','#ffe08a');huntBtn.classList.toggle('lit',p.hunt)}
 if(P.dash&&p.dashCool<=0&&['normal','land','zoomies'].includes(p.state)&&!(p.hunt&&p.ground)){if(p.carry)dropRat();doDash(P.dash)}
 // cancel windows: after a short commit time these moves can flow straight into the next one
 const CANCEL={nflip:99,pawpop:.15,barge:.25,t_air:.15,meow:.2,claw:.12,airswipe:.12,swat:.12,tailwhip:.15,dashstrike:.2,uppercut:.16,land:0,hardland:.12,stop:0,blast:.42,hiss:.3,t_claw:.15,finisher:.6,airspin:.15,slide:.15};
 if(CANCEL[p.state]!=null&&p.t>CANCEL[p.state]){
  if(P.dash&&p.dashCool<=0){if(['claw','swat','tailwhip'].includes(p.state)&&!p.tiger){p.face=P.dash==='right'?1:-1;dashStrike()}else doDash(P.dash)}
  else if((P.jump&&p.ground)||(P.down&&!p.ground)||(P.attack&&(K.up||!p.ground)&&p.state!=='claw'&&p.state!=='airspin')||(P.attack&&K.up&&p.ground)||((P.special||(P.tail&&p.state!=='tailwhip'))&&!['meow','hiss','finisher'].includes(p.state))){p.state='normal';p.combo=0}
 }
 const MAXT={eclipse:4.5,finishhim:3.5,nmorph:1,ncharge:3,nstorm:3,wallrun:2.2,nflip:2,nbflip:2,ndive:2,bunny:4.5,barge:1,t_launch:1.5,t_air:1,skyrise:2,skyslam:2.5,zoomies:3,manner:5,hurt:3,respawn:4,mcharge:3.5,jcharge:4.5,superleap:2,morph:2,unmorph:2,ledge:1.5,victory:2.5,eat:2,catch:2,finisher:2.5};
 if(p.state!=='normal'&&p.t>(MAXT[p.state]||2.5)){console.warn('safety net: reset from',p.state);p.state='normal';p.wall=false;p.vx=0;p.combo=0;p.jc=0;p.mc=0;if(p.tiger<=0&&p.anim.startsWith('t_'))setAnim('idle');if(!p.ninja&&p.anim.startsWith('n_'))setAnim('idle');p.rot=0}
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
 case 'hiss': p.vx=0;if(p.t>.25&&!p.shot){p.shot=true;areaHit(p.x,p.y,230,'hiss');for(const r of rats)if(!r.gone&&Math.abs(r.x-p.x)<300){r.scare=2.5;r.dir=Math.sign(r.x-p.x)||1}waves.push({x:p.x+p.face*60,y:p.y-60,r:10,l:.8,big:false})} if(end)p.state='normal';break;
 case 'zoomies': p.vx=p.face*720;if(p.x<70||p.x>WALL_X-80){p.face*=-1;p.x=Math.max(71,Math.min(WALL_X-81,p.x))}
  if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.zoomies[p.fi],face:p.face,l:.25});if(p.t>2.4||P.jump||P.attack||P.down){p.state='normal';p.vx=p.face*300}break;
 case 'catch': p.vx*=.8;if(P.eat||P.attack)p.wantEat=true;if(end){p.state='normal';p.carry=true;say('GOT ONE!','#ffe14d',true);if(p.wantEat){p.wantEat=false;eat()}}break;
 case 'eat': p.vx=0;if(p.t>.35&&!p.shot){p.shot=true;p.carry=false;setAnim('groom');
   for(let i=0;i<14;i++){const a=Math.random()*6.28;puffs.push({x:p.x+p.face*60,y:p.y-60,vx:Math.cos(a)*90,vy:Math.sin(a)*60-30,r:10+Math.random()*10,l:.7})}
   spark(p.x+p.face*50,p.y-80,22,['#ffe14d','#fff','#ffb0e0'],350);say('YUM!','#ffd84d',true);shake=5}
  if(p.t>1.25){p.state='normal';p.rush=15;say('SNACK RUSH!','#ffd84d',true);waves.push({x:p.x,y:p.y,r:10,l:1,big:true});spark(p.x,p.y-60,30,['#ffd84d','#fff'],450)}break;
 case 'manner': if(anyInput()){p.state='normal';p.idleT=0}else if(p.t>(p.anim==='loaf'?4:p.anim==='groom'||p.anim==='sitflick'?2.5:dur(p.anim)+.3)){p.state='normal';p.idleT=0}break;
 case 'victory': p.vx=0;if((end&&p.t>1)||(p.t>.12&&(P.attack||P.tail||P.jump||P.special||P.dash||dir))){p.state='normal'}break;
 case 'ledge': {p.vx=0;p.vy=0;const L=.75,u=Math.min(1,p.t/L),e=x=>x*x*(3-2*x);
  const uy=e(Math.min(1,u/.6)),ux=e(Math.max(0,(u-.35)/.65));
  p.y=p.ly0+(WT-p.ly0)*uy;p.x=p.lx0+(WALL_X+30-p.lx0)*ux;p.fi=Math.min(FR.ledge.length-1,Math.floor(u*FR.ledge.length));p.ft=p.fi;
  if(u>=1){p.state='normal';p.y=WT;p.x=WALL_X+30;p.ground=true;p.vy=0}}break;
 case 'jcharge': {p.vx*=Math.pow(.05,dt);const JB=p.rush>0?1.14:1;
  if(P.attack&&!p.hunt){if(p.tiger>0)skyLaunch();else uppercut();break}
  if(p.t>.25){if(p.anim!=='jcharge')setAnim('jcharge');p.jc=Math.min(1,(p.t-.25)/1);if(p.t%.04<dt)sparks.push({x:p.x+(Math.random()-.5)*90,y:p.y-Math.random()*20,vx:(Math.random()-.5)*60,vy:-120-Math.random()*120,l:.4,c:p.jc>=1?'#ffe14d':'#bfe8ff'})}
  if(!K.jump||p.t>4){ if(p.t<.25){p.state='normal';p.vy=(p.tiger>0?-640:p.hunt?-560:-720)*JB;p.ground=false;p.jumps=1;p.lastJump=now;setAnim('jump')}
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
 case 't_launch': if(p.t>.5||(p.ground&&p.t>.15))p.state='normal';break;
 case 't_air': p.vy=Math.min(p.vy,p.tair<3?60:400);if(p.t>.3)p.state='normal';break;
 case 'skyrise': p.vy=-1500;p.vx=0;if(p.y<-700||p.t>1.2){sky.phase='fight';sky.t=0;p.y=360;p.x=Math.max(200,Math.min(760,p.x));p.vy=-200;p.inv=0;
   const d=sky.d;d.inSky=true;d.x=p.x+p.face*170;d.y=230;d.vy=-120;d.vx=0;camY=0;p.state='normal';say('SKY BATTLE!','#9fe8ff',true)}break;
 case 'skyslam': p.vx=0;p.vy=1700;if(p.ground){act('hardland','t_land');impact(true);shake=26;slowT=.2;flashT=.2;waves.push({x:p.x,y:p.y,r:30,l:1,big:true});burst(p.x,p.y-40,1);p.inv=.5}break;
 case 'morph': p.vx=0;if(p.t%0.05<dt)spark(p.x+(Math.random()-.5)*80,p.y-40,2,['#ff9a2e','#ffe14d'],250);if(end){p.state='normal';p.tiger=20}break;
 case 'unmorph': p.vx=0;if(end)p.state='normal';break;
 default: if(NST.includes(S))nState(S,dt,end,dir);break;
 case 't_claw': p.vx*=Math.pow(.03,dt);if(P.attack)p.queued=true;
  if(p.t>.14){ if(P.special){act('t_fire','t_fire',{say:'FIREBALL!',c:'#ff7a2e'});p.tcT=1.2;break} if(P.tail){act('t_roar','t_roar',{say:'ROAR WAVE!',c:'#ffcf40'});p.tcT=1.4;break}
   if(P.dash||(p.queued&&K.down)){act('t_pounce','t_pounce',{say:'FLAME POUNCE!',c:'#ffb040'});p.vy=-380;p.vx=p.face*760;p.ground=false;p.tcT=1.2;p.queued=false;break}
   if(p.queued&&K.up){p.queued=false;skyLaunch();break} }
  if(p.t>.24&&p.queued){p.queued=false;tigerClaw()}else if(p.t>(p.anim==='t_smash'?.6:.42))p.state='normal';break;
 case 't_pounce': if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.t_pounce[p.fi],face:p.face,l:.25,blue:1});if(p.ground&&p.t>.1){act('land','t_land');shake=9;burst(p.x+p.face*60,p.y-10,1)}break;
 case 't_roar': p.vx=0;if(p.t>.3&&!p.shot){p.shot=true;areaHit(p.x,p.y,280,'roar');shake=14;waves.push({x:p.x+p.face*80,y:p.y-60,r:10,l:1,big:true});for(const r of rats)if(!r.gone&&Math.abs(r.x-p.x)<350){r.scare=3;r.dir=Math.sign(r.x-p.x)||1}}if(end)p.state='normal';break;
 case 't_fire': p.vx=0;if(p.t>.4&&!p.shot){p.shot=true;shoot(true)}if(end){p.state='normal';p.cool=.2}break;
 }
 if(p.state==='normal'){
  const T=p.tiger>0,N=p.ninja,running=K.run||(touchMode&&p.holdT>.6)||T||N,spd=(p.hunt?110:(T?420:N?470:260*(running?1.6:1)))*(p.rush>0?1.4:1),JB=p.rush>0?1.14:1;
  if(p.carry&&P.down&&p.ground)dropRat();
  if(K.down&&p.ground&&!p.hunt&&Math.abs(p.vx)>300&&P.down&&!T&&!N){act('slide','slide',{say:'SLIDE!'});}
  else if(K.down&&p.ground&&!p.hunt&&!T&&!N){p.vx*=.7;setAnim('crouch');}
  else{p.vx+=(dir*spd-p.vx)*Math.min(1,dt*(N?(p.ground?(dir?8:10):5):T?(p.ground?(dir?4.5:6):2.5):(p.ground?(dir?7:9):4)));if(dir&&!p.wall)p.face=dir;}
  if(p.state==='normal'){
  if(p.ground&&!dir&&Math.abs(p.vx)>330&&!p.hunt&&!T&&!N&&!p.carry){act('stop','stop')}
  if(p.ground&&dir&&running&&Math.abs(p.vx)<40&&!p.hunt&&!T&&!N&&!p.carry)p.startT=.18;
  // wall climb: hold → to climb, release to cling, ← / jump to leap off, ↓ to drop
  if(!T&&!N&&!p.wall&&p.y>WT+10&&p.x>=WALL_X-62&&K.right&&!K.down&&!p.hunt){p.wall=true;dropRat();p.jumps=0;p.airDash=false;say('CLIMB!','#ffe08a')}
  if(p.wall){p.face=1;p.vx=0;
   if(K.down){p.wall=false}
   else if(P.jump||K.left){p.wall=false;p.vy=-650;p.vx=-340;p.face=-1;p.jumps=1;p.wj=.45;setAnim('walljump');say('WALL JUMP!');extend('WALL JUMP!')}
   else{p.vy=K.right?-190:35;
    const cf=FR.climb[p.fi]||FR.climb[0];if(p.y-cf.ay*SC<WT-20&&K.right){p.lx0=p.x+40;p.ly0=p.y;p.wall=false;act('ledge','ledge',{say:'LEDGE GRAB!',c:'#ffe08a'});p.x=p.lx0}}}
  else if(N){}
  else if(P.jump&&p.ground){act('jcharge','crouch');p.jc=0}
  else if(P.jump&&!p.ground&&(p.jumps<2||sky)){acted=true;p.vy=(sky?-520:T?-560:-650)*JB;p.jumps=2;p.dj=.45;setAnim(T?'t_jump':'djump');p.anim=T?'t_jump':'djump';p.ft=0;say('DOUBLE JUMP!');extend();spark(p.x,p.y,10,'#fff',150)}
  if(p.state!=='normal'){}
  else if(N){nMoves(dir)}
  else if(T){ // ---- fire tiger moves ----
   if(sky&&P.attack&&K.down){exitSky(true)}
   else if(P.attack&&(p.hunt||K.down)&&p.ground){act('t_pounce','t_pounce',{say:'FLAME POUNCE!',c:'#ffb040'});p.vy=-380;p.vx=p.face*700;p.ground=false;p.tcT=1.2}
   else if(P.attack&&K.up&&p.ground&&!sky)skyLaunch();
   else if(P.attack&&!p.ground){if(p.tair<(sky?99:4)){p.tair++;C.atk++;act('t_air',p.tair%2?'t_spin':'t_lunge');p.vy=Math.min(p.vy,sky?-260:-140);p.vx=p.face*220;slash(p.tair%2?'down':'up','#ffb040',{fire:1,scale:1.4,dx:100,dy:80});popNum(p.tair,'#ffb040')}}
   else if(P.attack){p.tcombo=p.tcT>0?p.tcombo:0;tigerClaw()}
   else if(P.special&&p.cool<=0){act('t_fire','t_fire',{say:'FIREBALL!',c:'#ff7a2e'});if(!p.ground)p.vy=Math.min(p.vy,-100)}
   else if((P.tail||P.hiss||P.swat)&&(p.ground||sky))act('t_roar','t_roar',{say:'ROAR WAVE!',c:'#ffcf40'});
  }
  else if(!p.ground&&!p.wall&&P.down){ if(K.left||K.right){p.face=K.left?-1:1;act('diveclaw','diveclaw',{say:'DIVE CLAW!',c:'#ffb070'})} else act('dive','dive',{say:'DIVE BOMB!',c:'#ffd070'}) }
  else if(P.attack&&!p.wall&&(K.up||K.jump)&&(p.ground||(p.vy<0&&now-p.lastJump<.35))&&!p.hunt)uppercut();
  else if(P.attack&&!p.wall&&p.ground&&now-p.lastDash<.2&&!p.hunt)dashStrike();
  else if(P.attack&&!p.ground&&!p.wall){ if(p.jumps>=2&&!p.airSpin){p.airSpin=true;act('airspin','airspin',{say:'AIR SPIN!',c:'#8fe0ff'});p.vy=-200;shake=5}
   else if(!p.airSwipe||p.airHits>0){p.airHits=0;p.airSwipe=true;act('airswipe','airswipe',{say:'AIR SWIPE!',c:'#bfe8ff'});p.vy=Math.min(p.vy,-120);p.vx=p.face*Math.max(Math.abs(p.vx),280);spark(p.x+p.face*70,p.y-60,8,'#bfe8ff')} }
  else if((P.eat||P.attack)&&p.carry&&p.ground&&!p.wall)eat();
  else if(P.attack&&p.cool<=0&&!p.wall&&p.ground){
   if(p.hunt){act('wiggle','wiggle',{say:'wiggle wiggle...',c:'#ffe08a'})}
   else if(K.down){act('pawpop','pawpop',{say:'PAW POP!',c:'#7fffd4'});p.vy=-420;p.ground=false;p.jumps=1;slash('up','#7fffd4')}
   else {p.combo=p.keepT>0?p.keepCombo:0;p.keepT=0;startClaw()} }
  else if(P.swat&&p.ground&&!p.wall)act('swat','swat',{say:'SWAT!',c:'#bfe8ff'});
  else if(P.finisher&&p.ground&&!p.wall)finisher();
  else if((P.special&&K.down||P.hiss)&&p.ground&&!p.wall)act('hiss','hiss',{say:'HISSS!',c:'#ffb0b0'});
  else if(P.special&&p.cool<=0&&!p.wall){if(p.carry)dropRat();act('mcharge','breath');p.mc=0}
  else if(P.tail&&!p.wall){tailWhip(1)}
  else if(P.zoomies&&p.ground&&!p.wall){if(p.carry)dropRat();act('zoomies','zoomies',{say:'ZOOMIES!!',c:'#ff9ad5'})}
  }
  if(p.state==='normal'){
   if(T){ if(!p.ground)setAnim(p.vy<0?'t_jump':'t_fall');else setAnim(Math.abs(p.vx)>25?'t_run':'t_idle') }
   else if(N){ if(!p.ground)setAnim(p.vy<0?'n_rise':'n_fall');else setAnim(Math.abs(p.vx)>25?'n_run':'n_idle') }
   else if(p.wall)setAnim('climb');
   else if(!p.ground)setAnim(p.wj>0?'walljump':p.dj>0?'djump':p.vy<0?'jump':'fall');
   else if(p.hunt)setAnim('stalk');
   else if(!K.down){const v=Math.abs(p.vx);
    setAnim(p.carry?(v>25?'carry':'carryidle'):p.startT>0?'start':v>300?'run':v>25?'walk':'idle')}
   // idle mannerisms after ~4s of doing nothing
   if(p.ground&&!T&&!N&&!p.hunt&&!p.carry&&p.anim==='idle'&&!anyInput()){p.idleT+=dt;if(p.idleT>4){p.idleT=0;const m=MANNER[Math.floor(Math.random()*MANNER.length)];act('manner',m)}}else p.idleT=0;
  }
 }
 // physics
 if(!p.wall&&!['wingdash','dive','diveclaw','ledge','wallrun','nstorm','eclipse','finishhim'].includes(p.state))p.vy+=(sky?520:p.state==='airspin'?600:p.hang>0?700:p.tiger>0?2000:1900)*dt;
 if(p.state!=='ledge'){p.x+=p.vx*dt;p.y+=p.vy*dt;}
 if(!sky&&p.state!=='ledge'&&p.state!=='skyslam'&&p.y>WT+2&&p.x>WALL_X-60&&p.x<WALL_X+60){p.x=WALL_X-60;if(p.state==='zoomies')p.face=-1} // wall side
 if(sky&&sky.phase==='fight'){if(p.y>440){p.y=440;p.vy=Math.min(p.vy,-380)}if(p.y<70){p.y=70;p.vy=Math.max(p.vy,0)}p.ground=false;p.x=Math.max(60,Math.min(900,p.x))}
 if(p.vy>2200)p.vy=2200;
 const fl=sky?99999:floorAt(p.x);
 if(p.state!=='ledge'){
 if(p.ground||p.vy<0||p.wall||p.state==='ledge')p.fallTop=p.y;
 // long fall: acrobatic flip just before touching down
 if(!CINE.includes(p.state)){const h=floorAt(p.x)-p.y;const tr=p.state==='wallrun'?-1.5708:(!p.ground&&p.state==='normal'&&!p.tiger&&p.vy>300&&floorAt(p.x)-p.fallTop>300&&h<170)?(1-h/170)*6.283*p.face:0;
  if(p.ninja){let df=((tr-p.rot+Math.PI)%6.2832+6.2832)%6.2832-Math.PI;p.rot=Math.abs(df)<.01?tr:p.rot+df*Math.min(1,dt*(p.state==='wallrun'?16:12));if(Math.abs(p.rot)<.01&&!tr)p.rot=0}else p.rot=tr}
 if(p.y>=fl&&p.vy>=0){p.y=fl;if(!p.ground&&p.state==='normal'){
   if(fl-p.fallTop>300&&!p.tiger){act('land','land',{say:'LANDS ON HIS FEET!',c:'#ffe08a'});spark(p.x,fl,14,['#fff','#d9c49a'],200);shake=4}
   else if(p.vy>300){act('land',p.tiger?'t_land':p.ninja?'n_land':'land');spark(p.x,fl,8,'#d9c49a',120)}}
  p.vy=0;p.ground=true;p.jumps=0;p.airDash=false;p.airSpin=false;p.airSwipe=false;p.tair=0;p.nair=0;p.airHits=0;p.wj=0;p.dj=0}else p.ground=false;}
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
 for(const sl of slashes){if(sl.d>0){sl.d-=dt;continue}sl.l-=dt*(sl.sp||4)}for(let i=slashes.length-1;i>=0;i--)if(slashes[i].l<=0)slashes.splice(i,1);
 for(const s of sparks){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=400*dt;s.l-=dt}
 for(let i=sparks.length-1;i>=0;i--)if(sparks[i].l<=0)sparks.splice(i,1);
 meleeHits(dt);updDummies(dt);
 shake*=.85; // input buffer: an unused press stays live for ~0.15s so moves chain; any new action consumes it
 for(const k in P)if(acted||INSTANT.includes(k)||now-(BUF[k]??-9)>.15)delete P[k];acted=false;
 const nm={manner:p.anim,claw:p.anim.replace(/^claw(\d)/,'claw $1/3')}[p.state]||(p.state==='normal'?p.anim:p.state);
 if(now-errShown>3)lbl.textContent=(p.rush>0?'✨ SNACK RUSH '+Math.ceil(p.rush)+'s · ':'')+(p.tiger?'🔥 TIGER '+Math.ceil(p.tiger)+'s · ':'')+(p.ninja?'🥷 NEON NINJA · ':'')+nm.replace(/^[tn]_/,'')+(p.wall?' (wall)':'')+(p.hunt?' · HUNT':'')+(p.carry?' · carrying rat':'')+(p.rats?' · rats '+p.rats:'');
}
// ---------- rats ----------
const rats=[{x:150,dir:1},{x:520,dir:-1},{x:700,dir:1}].map(r=>({...r,y:GROUND,spd:70+Math.random()*40,t:Math.random()*5,scare:0,gone:0,hop:0}));
function updRats(dt){
 const catching=['claw','pounce','diveclaw','wiggle'].includes(p.state)&&!sky&&!p.tiger&&!p.ninja&&!p.carry;
 for(const r of rats){
  if(r.gone){if(!p.carry&&p.state!=='catch'){r.gone-=dt;if(r.gone<=0){r.gone=0;r.spd=70+Math.random()*40;r.x=Math.random()<.5?40:WALL_X-60;r.dir=r.x<100?1:-1;r.scare=0}}continue}
  if(r.vy||r.y<GROUND){r.fl=(r.fl||0)-dt;r.vy=(r.vy||0)+(r.fl>0?500:1500)*dt;r.y+=r.vy*dt;r.x+=(r.vx||0)*dt;if(r.y>=GROUND){r.y=GROUND;r.vy=0;r.vx=0;r.scare=2}r.x=Math.max(40,Math.min(WALL_X-30,r.x));r.t+=dt;continue}
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
function drawRats(){if(sky&&sky.phase==='fight')return;for(const r of rats){if(r.gone)continue;ctx.save();ctx.translate(r.x,r.y-r.hop);ctx.scale(r.dir,1);
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
 // camera follows Paddy/tiger upward (sky launcher, meteor slam), eased
 const camT=sky&&sky.phase==='fight'?0:Math.max(0,170-p.y+(p.y<GROUND-300?Math.max(0,Math.min(260,-p.vy*.2)):0));camY+=(camT-camY)*Math.min(1,(1/60)*(sky?12:Math.abs(camT-camY)>150?16:7));if(!isFinite(camY))camY=0;
 ctx.setTransform(scale,0,0,scale,offX+sx*scale,offY+(sy+camY)*scale);
 if(sky&&sky.phase==='fight'){drawSky();return}
 drawAltSky(sx,sy);cineXform();
 ctx.fillStyle='#6dbb4a';ctx.fillRect(-500,GROUND,VW+1000,14);ctx.fillStyle='#b98a55';ctx.fillRect(-500,GROUND+14,VW+1000,200);
 // wall
 ctx.fillStyle='#8a7a6a';ctx.fillRect(WALL_X,WT,80,GROUND-WT);ctx.strokeStyle='#6c5e50';ctx.lineWidth=2;
 for(let y=WT;y<GROUND;y+=28){ctx.beginPath();ctx.moveTo(WALL_X,y);ctx.lineTo(WALL_X+80,y);ctx.stroke();const o=(y/28)%2?20:50;ctx.beginPath();ctx.moveTo(WALL_X+o,y);ctx.lineTo(WALL_X+o,y+28);ctx.stroke()}
 ctx.fillStyle='#fff8';ctx.font='14px system-ui';ctx.fillText('climb wall →',WALL_X-60,WT-140);
 if(cine.dim>.01){ctx.fillStyle=`rgba(22,8,48,${cine.dim})`;ctx.fillRect(-2000,-camY-500,VW+4000,VH+1000)}
 drawDummies();drawRats();
 // shadow
 const hgt=floorAt(p.x)-p.y;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(p.x,floorAt(p.x)+3,60*Math.max(.4,1-hgt/400),9,0,0,6.28);ctx.fill();
 for(const g of ghosts){const im=g.f&&IMG[g.f.f];if(!im)continue;ctx.save();ctx.globalAlpha=Math.min(1,g.l*(g.blue?2:1.6));if(g.blue)ctx.globalCompositeOperation='lighter';ctx.translate(g.x,g.y);ctx.scale(g.face*SC,SC);ctx.drawImage(im,-g.f.ax,-g.f.ay);ctx.restore()}
 // player (snack-rush aura, then a short crossfade from the previous animation)
 if(p.rush>0){const pul=1+Math.sin(now*10)*.08,a=Math.min(1,p.rush/2);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*a;
  const gg=ctx.createRadialGradient(p.x,p.y-60,10,p.x,p.y-60,110*pul);gg.addColorStop(0,'rgba(255,220,90,.9)');gg.addColorStop(1,'rgba(255,180,0,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(p.x,p.y-60,110*pul,0,6.28);ctx.fill();ctx.restore()}
 if(p.blend>0&&p.prevF)drawFrame(p.prevF,p.prevX,p.prevY,p.prevFace,(p.hunt?.55:1)*p.blend/.1);
 const mu=p.state==='nmorph'?Math.min(1,p.t/(p.mquick?.28:.5)):1;if(mu<1&&p.mfrom)drawFrame(p.mfrom,p.x,p.y,p.face,1-mu*mu*(3-2*mu));
 const sq=p.state==='eat'&&p.t<.35?1+Math.sin(p.t*40)*.06:1;
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
 if(p.rush>0){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(VW/2-110,34,220,10);ctx.fillStyle='#ffd84d';ctx.fillRect(VW/2-110,34,220*p.rush/15,10)}
 if(p.tiger>0){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(VW/2-110,18,220,10);ctx.fillStyle='#ff8a2e';ctx.fillRect(VW/2-110,18,220*p.tiger/20,10)}
 drawFx();
 drawHUD()}
function drawHUD(){const sx=0;ctx.setTransform(scale,0,0,scale,offX,offY);
 if(hitNum){const a=1-hitNum.l,pop=a<.15?.4+a/.15*.9:1.3-Math.min(.3,(a-.15));fancy(String(hitNum.n),zX(p.x+p.face*40),zY(p.y-150)+camY-a*30,74,-.1*p.face,pop,Math.min(1,hitNum.l*2),hitNum.col)}
 if(flashT>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(.7,flashT*2.5)})`;ctx.fillRect(-500,-500,VW+1000,VH+1000)}
 if(p.tpow>0&&p.tiger>0){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(VW/2-110,50,220,8);ctx.fillStyle='#ff4a1a';ctx.fillRect(VW/2-110,50,220*p.tpow/8,8)}
 if(sky&&sky.phase==='fight'){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(VW/2-110,62,220,6);ctx.fillStyle='#9fe8ff';ctx.fillRect(VW/2-110,62,220*Math.max(0,1-sky.t/14),6)}
 drawCineHUD();drawTexts();drawCombo();drawLives();
 ctx.globalAlpha=1;ctx.textAlign='left';
}
function drawFx(){nDrawFx();
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
function drawSky(){const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#2b4fa8');g.addColorStop(1,'#8fc8ff');ctx.fillStyle=g;ctx.fillRect(-500,-200,VW+1000,VH+400);
 const T0=now;ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<9;i++){const y=((i*137+T0*260)%(VH+200))-100,x=(i*263)%VW;ctx.beginPath();ctx.ellipse(x,y,70+i%3*30,22,0,0,6.283);ctx.ellipse(x+40,y-10,45,20,0,0,6.283);ctx.fill()}
 ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;for(let i=0;i<24;i++){const x=(i*97)%VW,y=((i*53+T0*900)%(VH+300))-150;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+60+i%4*20);ctx.stroke()}
 drawDummies();
 for(const g2 of ghosts){const im=g2.f&&IMG[g2.f.f];if(!im)continue;ctx.save();ctx.globalAlpha=Math.min(1,g2.l*2);ctx.globalCompositeOperation='lighter';ctx.translate(g2.x,g2.y);ctx.scale(g2.face*SC,SC);ctx.drawImage(im,-g2.f.ax,-g2.f.ay);ctx.restore()}
 ctx.save();ctx.globalCompositeOperation='lighter';const gg=ctx.createRadialGradient(p.x,p.y-70,10,p.x,p.y-70,130);gg.addColorStop(0,'rgba(255,150,40,.6)');gg.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=gg;ctx.beginPath();ctx.arc(p.x,p.y-70,130,0,6.283);ctx.fill();ctx.restore();
 drawFrame((FR[p.anim]||FR.t_idle)[p.fi],p.x,p.y,p.face,null);
 for(const s of shots){ctx.save();ctx.translate(s.x,s.y);ctx.globalCompositeOperation='lighter';const gg2=ctx.createRadialGradient(0,0,2,0,0,48);gg2.addColorStop(0,'#fff');gg2.addColorStop(.35,'#ffb040');gg2.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=gg2;ctx.beginPath();ctx.arc(0,0,48,0,6.283);ctx.fill();ctx.restore()}
 ctx.globalCompositeOperation='lighter';for(const s of sparks){ctx.globalAlpha=Math.max(0,Math.min(1,s.l*2.5));ctx.fillStyle=s.c;ctx.fillRect(s.x-3,s.y-3,6,6)}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 for(const w of waves){ctx.globalAlpha=Math.max(0,w.l);ctx.strokeStyle='#fff';ctx.lineWidth=8*Math.max(0,w.l);ctx.beginPath();ctx.ellipse(w.x,w.y,w.r,w.r*.5,0,0,6.283);ctx.stroke()}ctx.globalAlpha=1;
 drawFx();drawHUD();
 fancy('SKY BATTLE',VW/2,90,30,0,1,.5,'#9fe8ff')}
function drawLives(){for(let i=0;i<9;i++){const x=24+i*26,y=62,on=i<p.lives;ctx.fillStyle=on?'#ff8fb1':'rgba(0,0,0,.25)';
 ctx.beginPath();ctx.ellipse(x,y+4,7,6,0,0,6.283);ctx.fill();for(const [dx,dy] of [[-7,-5],[-2,-9],[3,-9],[8,-5]]){ctx.beginPath();ctx.arc(x+dx*.9,y+dy,2.8,0,6.283);ctx.fill()}}
 for(let i=0;i<3;i++){ctx.fillStyle=i<p.hp?'#fff':'rgba(255,255,255,.25)';ctx.fillRect(24+i*14-6,78,10,4)}}
// game loop: never dies — an error is caught, reported once on screen, and Paddy is reset to idle
let last=0,errShown=0;
function loop(t){requestAnimationFrame(loop);let dt=(t-last)/1000;last=t;if(!(dt>0))dt=0;dt=Math.min(.033,dt);hitstop=Math.min(Math.max(hitstop,0),.3);
 slowT-=dt;TS=slowT>0?.3:1;try{if(hitstop>0){hitstop-=dt;shake*=.9}else{update(dt*TS);updCombo(dt*TS)}draw()}
 catch(e){console.error(e);try{localStorage.setItem('paddyLastError',String(e&&e.stack||e))}catch(_){}
  if(sky)try{exitSky(false)}catch(_){sky=null}camY=0;slowT=0;Object.assign(p,{rot:0,grab:null,state:'normal',wall:false,vx:0,vy:0,combo:0,blend:0,jc:0,mc:0});if(!isFinite(p.x))p.x=300;if(!isFinite(p.y))p.y=GROUND;shake=0;
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
const NAMES={pawpop:'PAW POP!',barge:'BLINK BARGE!',bunnykick:'KICK!',bunnylaunch:'BUNNY KICK GRAB!',t_launch:'SKY LAUNCHER!',t_air:'FLAME AIR CLAW!',superleap:'SUPER LEAP!',meow:'MEOW!',sonicmeow:'SONIC MEOW!!',claw1:'SCRATCH!',claw2:'SWIPE!',claw3:'TRIPLE CLAW!',dashstrike:'DASH STRIKE!',airswipe:'AIR SWIPE!',airspin:'AIR SPIN!',dive:'DIVE BOMB!',diveclaw:'DIVE CLAW!',pounce:'POUNCE!',blast:'ENERGY BLAST!',finisher:'FINISHER!',uppercut:'UPPERCUT!',tailwhip:'TAIL WHIP!',swat:'SWAT!',hiss:'HISS!',t_claw:'FLAME CLAW!',t_pounce:'TIGER POUNCE!',roar:'ROAR!',fireball:'FIREBALL!'};
// knockback: [vx, vy, float seconds, hitstop]
const KB={pawpop:[100,-950,.55,.06],swat:[120,-900,.5,.06],barge:[700,-300,.15,.08],bunnykick:[0,0,0,.025],bunnylaunch:[500,-1500,.8,.2],t_launch:[60,-2600,0,.12],t_air:[300,-520,.45,.07],launcher:[120,-900,.5,.06],superleap:[160,-700,.35,.06],meow:[260,-200,.05,.04],sonicmeow:[520,-420,.25,.09],claw1:[220,-180,0,.04],claw2:[260,-220,0,.04],claw3:[420,-720,.3,.08],dashstrike:[750,-380,.2,.09],airswipe:[200,-480,.45,.05],airspin:[120,-330,.5,.035],
 dive:[0,-850,.25,.11],diveclaw:[520,-360,.2,.08],pounce:[380,-520,.2,.07],blast:[620,-420,.2,.08],
 finisher:[700,-900,.4,.12],uppercut:[120,-950,.4,.07],tailwhip:[380,-300,.1,.05],swat:[120,-900,.5,.06],hiss:[300,-120,0,.03],t_claw:[480,-420,.15,.07],t_pounce:[600,-520,.2,.08],roar:[650,-500,.25,.09],fireball:[700,-460,.2,.09]};
const REACH={pawpop:[130,190],barge:[170,150],t_air:[200,190],t_claw:[210,190],superleap:[120,220],claw1:[115,130],claw2:[125,130],claw3:[140,150],dashstrike:[160,130],airswipe:[140,150],airspin:[130,170],diveclaw:[110,120],pounce:[120,120],finisher:[170,170],uppercut:[120,190],tailwhip:[130,120],swat:[110,90],t_claw:[210,190],t_pounce:[150,140]};
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
 d.vx=dir*k[0]*(0.85+Math.random()*.3);d.vy=Math.min(d.vy,0)+k[1];if(d.y>=GROUND-1&&k[1]>-200)d.vy=k[1];d.fl=k[2];d.flash=.12;d.sq=1;const air=d.y<GROUND-25||d.inSky;d.hp-=(p.rush>0?2:1)*(p.tpow>0&&p.tiger>0?2:1);if(air||k[1]<-600){d.fl=Math.max(d.fl,d.inSky?.9:.55)}if(air&&!['bunnykick'].includes(move)){C.jug=(C.jug||0)+1;if(C.jug%3===1)setTimeout(()=>say('JUGGLE!','#7fffd4'),0)}else C.jug=0;
 if(!p.ground&&!sky){p.lastAirHitT=now;const lift=air&&LIFT.includes(move);p.hang=.3;const L=Math.min(1400,440+(C.jug||0)*30);p.vy=Math.min(p.vy,lift?-L:-60);if(lift){d.vy=d.y<p.y-90?-(L-120):-(L+60);d.vx*=.2;d.fl=Math.max(d.fl,.5)}p.airHits++;p.airSpin=p.airSpin&&p.airHits<2}if(p.tiger>0&&p.tpow>0){d.vx*=1.3;d.vy*=1.2}if(p.rush>0){d.vx*=1.2;d.vy*=1.15}d.calm=0;
 hitstop=Math.max(hitstop,k[3]*(p.rush>0?1.7:1)*(p.tiger>0?1.3:1));if(d.inSky){d.vx*=.35;d.vy=Math.min(d.vy*.5,-250);sky.hits++}shake=Math.max(shake,4+k[3]*60);addHit(move);
 const hx=d.x-dir*20,hy=d.y-70;
 for(let i=0;i<12;i++){const a=Math.random()*6.28,v=150+Math.random()*350;sparks.push({x:hx,y:hy,vx:Math.cos(a)*v+dir*120,vy:Math.sin(a)*v,l:.35,c:['#fff','#ffe14d','#ff9ad5','#8fe0ff'][i%4]})}
 waves.push({x:hx,y:hy,r:8,l:.6,big:false});
 if(d.hp<=0){d.alive=false;d.resp=1.4;burst(d.x,d.y-60)}}
function r_reach(st){return (REACH[st]||[0])[0]}
function meleeHits(dt){if(sky&&sky.phase!=='fight')return;const st=p.state==='claw'?p.anim:p.state==='tailwhip'&&p.tn===3?'tail3':p.state;if(['bunny','eclipse','finishhim'].includes(p.state))return;
 if(st!==C.lastState){C.lastState=st;C.atk++}
 if(st==='airspin'||st==='finisher'||st==='superleap'||(st==='n8'&&p.t<.42)){C.spinT+=dt;if(C.spinT>(st==='n8'?.07:.12)){C.spinT=0;C.atk++}}
 const r=REACH[st];if(!r)return;
 if(/^pc\d$/.test(st)&&(p.t<.04||p.t>.26))return;if((st.startsWith('claw')||st==='swat'||st==='t_claw'||st==='t_air')&&p.t>.22)return;if(/^n[1-7]$|^nrise$|^nair$|^nstep$/.test(st)&&(p.t>.22||p.t<.03))return;if(st==='n8'&&p.t>.42)return;if(st==='finisher'&&p.t<.25)return;
 // rats can be popped up and juggled too
 for(const r of rats){if(r.gone||r.last===C.atk)continue;const dx=(r.x-p.x)*p.face;if(dx>-35&&dx<r_reach(st)&&Math.abs(r.y-p.y)<140){r.last=C.atk;hitRat(r,st,p.face)}}
 for(const d of dummies){if(!d.alive||d.last===C.atk||(sky&&!d.inSky)||(!sky&&d.inSky))continue;
  const dx=(d.x-p.x)*p.face,within=(st==='airspin'||st==='tailwhip'||st==='tail3'||st==='superleap'||st==='pc5'||st==='n4')?Math.abs(d.x-p.x)<r[0]:(dx>-35&&dx<r[0]);
  if(within&&d.y-130<p.y+10&&d.y>p.y-r[1]){d.last=C.atk;hitDummy(d,st,(st==='airspin'||st==='tailwhip'||st==='tail3'||st==='superleap'||st==='pc5'||st==='n4')?Math.sign(d.x-p.x)||p.face:p.face)}}}
function areaHit(x,y,rad,move){for(const d of dummies)if(d.alive&&(!!d.inSky===!!sky)&&Math.abs(d.x-x)<rad&&Math.abs(d.y-y)<140)hitDummy(d,move,Math.sign(d.x-x)||p.face)}
function updDummies(dt){for(const d of dummies){
 if(d.inSky){d.fl-=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.vy+=(d.fl>0?120:380)*dt;d.vx*=Math.pow(.2,dt);d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.y>420){d.y=420;d.vy=-320}if(d.y<90){d.y=90;d.vy=Math.abs(d.vy)*.3}d.x=Math.max(60,Math.min(900,d.x));d.rot=Math.sin(now*6)*.3;continue}
 if(sky&&sky.phase==='fight')continue;
 if(d.slam&&d.y>=GROUND-2){d.slam=false;d.hp-=3;d.vy=-500;d.sq=1;waves.push({x:d.x,y:GROUND,r:20,l:1,big:true})}
 if(!d.alive){d.resp-=dt;if(d.resp<=0){Object.assign(d,{x:d.home,y:GROUND-200,vx:0,vy:0,hp:12,alive:true,sq:1,fl:0});for(let i=0;i<10;i++)sparks.push({x:d.x,y:GROUND-200,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,l:.4,c:'#ffe14d'})}continue}
 d.fl-=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.calm+=dt;
 d.vy+=(d.fl>0?420:1700)*dt;if(d.fl>0)d.vx*=Math.pow(.3,dt);
 d.x+=d.vx*dt;d.y+=d.vy*dt;
 if(d.x<40){d.x=40;d.vx=Math.abs(d.vx)*.5}if(d.x>WALL_X-30){d.x=WALL_X-30;d.vx=-Math.abs(d.vx)*.5}
 if(d.y<-90000)d.y=-90000;
 if(d.y>=GROUND){d.y=GROUND;if(d.vy>350){d.vy=Math.max(-560,d.vy*-.35);d.sq=.6}else d.vy=0;d.vx*=Math.pow(.02,dt);
  if(d.calm>1.2)d.x+=(d.home-d.x)*Math.min(1,dt*1.5)}
 d.rot=Math.max(-.6,Math.min(.6,d.vx/900))+(d.y<GROUND?Math.sin(performance.now()/90)*.25*Math.min(1,(GROUND-d.y)/100):0);}}
function drawDummies(){for(const d of dummies){if(!d.alive||(!!sky&&sky.phase==='fight')!==!!d.inSky)continue;
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
function toggleNinja(){if(p.state==='nmorph'&&p.t<.18){p.morphQ=true;return}if(sky||['eclipse','finishhim','morph','unmorph','respawn','bunny','skyrise','skyslam','t_launch','ledge','eat','catch'].includes(p.state))return;
 const from=(FR[p.anim]||FR.idle)[p.fi];p.tiger=0;p.ninja=!p.ninja;p.hunt=false;huntBtn&&huntBtn.classList.remove('lit');dropRat();p.wall=false;p.combo=0;p.ncombo=0;p.rot=0;
 act('nmorph',p.ninja?'n_idle':'idle',{say:p.ninja?'NEON NINJA!':'back to Paddy',c:p.ninja?NV:'#ffe08a'});p.mfrom=from;p.blend=0;p.vx*=.3;
 waves.push({x:p.x,y:p.y,r:10,l:1,big:true});puffShadow(p.x,p.y);spark(p.x,p.y-70,26,[NV,NC,'#fff'],380);shake=8;morphStrike()}
function nTarget(range){let best=null,bd=range;for(const d of dummies){if(!d.alive||(!!d.inSky!==!!sky))continue;const dd=Math.abs(d.x-p.x)+((d.x-p.x)*p.face<0?120:0);if(dd<bd){bd=dd;best=d}}return best}
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
function nStorm(c){const list=dummies.filter(d=>d.alive&&!!d.inSky===!!sky&&Math.abs(d.x-p.x)<700).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
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
 case 'nmorph': p.vx*=Math.pow(.05,dt);if(p.morphQ&&p.t>=.18){p.morphQ=false;toggleNinja();break}if(p.t%.04<dt)spark(p.x+(Math.random()-.5)*90,p.y-Math.random()*120,2,[NV,NC,'#fff'],200);if(P.attack&&p.t>.1){p.mquick=false;if(p.ninja){if(p.ground)nHit(1);else nAir()}else if(p.ground){p.combo=0;startClaw()}else{p.airHits=0;p.airSwipe=true;act('airswipe','airswipe',{say:'AIR SWIPE!',c:'#bfe8ff'});p.vy=Math.min(p.vy,-120)}break}
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
  if(p.t>.42&&!p.shot){p.shot=true;for(const d of dummies)if(d.alive&&!!d.inSky===!!sky){const dx=(d.x-p.x)*p.face;if(dx>-40&&dx<200&&Math.abs(d.y-p.y)<170)hitDummy(d,'n8fin',p.face)}
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
 ninjaBtn&&ninjaBtn.classList.toggle('lit',!!p.ninja);
 for(const s of stars){s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=dt*26;s.l-=dt;
  for(const d of dummies)if(d.alive&&!!d.inSky===!!sky&&!s.hit.has(d)&&Math.abs(d.x-s.x)<42&&s.y>d.y-155&&s.y<d.y+5){s.hit.add(d);hitDummy(d,'nstar',Math.sign(s.vx));s.l=Math.min(s.l,.05);spark(s.x,s.y,8,[NC,'#fff'])}
  for(const r of rats)if(!r.gone&&Math.abs(r.x-s.x)<30&&Math.abs(r.y-12-s.y)<30){r.scare=2.5;r.dir=Math.sign(s.vx);r.vy=-420;r.fl=.3;s.l=.05}
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
  const g=ctx.createRadialGradient(p.x,p.y-60,10,p.x,p.y-60,150);g.addColorStop(0,'rgba(220,190,255,.9)');g.addColorStop(1,'rgba(100,60,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y-60,150,0,6.283);ctx.fill();ctx.restore()}}

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
const LIFT=['airswipe','airspin','nair','nstep','tailwhip','tail3','t_air','morphstrike','pc7','pc8'];
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
function skyAt(h){const base=p.tiger?['#ffc89a','#ffe8c8']:p.ninja?['#b4a4ea','#ebe3ff']:['#9fd6f7','#d8f0ff'];
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
function cueInfo(){if(p.state==='claw'&&p.combo>=3&&p.combo<8&&!p.miss)return{H:.4};if(/^n[3-7]$/.test(p.state)&&p.ncombo>=3&&p.ncombo<8&&!p.miss)return{H:.36};return null}
// tail whip: timed chain, 3rd one launches
function tailWhip(n){p.tw0=p.face;act('tailwhip','tailwhip',{say:['TAIL WHIP!','DOUBLE WHIP!','TAIL LAUNCHER!'][n-1],c:['#ffd0a0','#ffb870','#ff9a2e'][n-1]});p.tn=n;p.tq=0;p.tqT=0;C.atk++;p.vx=p.face*(120+n*40);
 spark(p.x-p.face*60,p.y-40,6+n*5,['#fff','#ffd0a0'],160+n*60);shake=Math.max(shake,2+n*3);
 if(n===3){if(p.ground){p.vy=-720;p.ground=false;p.jumps=1}else p.vy=Math.min(p.vy,-420);waves.push({x:p.x,y:p.y-30,r:20,l:1,big:true})}else if(!p.ground)p.vy=Math.min(p.vy,-220)}
// morphing mid-combo / mid-air = flashy transform strike that keeps the combo alive
function morphStrike(){if(!(C.n>0||!p.ground))return;p.mquick=true;C.atk++;areaHit(p.x,p.y-10,230,'morphstrike');extend();say(p.ninja?'NINJA TRANSFORM STRIKE!':'PADDY TRANSFORM STRIKE!',p.ninja?NV:'#ffe08a',true);
 slash('spin',p.ninja?NV:'#ffe08a',{lvl:6,scale:1.3});flashT=Math.max(flashT,.1);hitstop=Math.max(hitstop,.06);if(!p.ground){p.vy=-460;p.hang=.3}}
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
function finishHim(){const g=nTarget(800);p.grab=g;act('finishhim',p.ninja?'n_er':'pc3',{say:'FINISH HIM!!',c:'#ff3355'});p.inv=4;p.vx=0;p.vy=0;p.st1=false;cineGo(1.5,.65);slowT=.3;card('FINISH HIM!!','TAIL ×3 · TAIL ×3 · MORPH · MORPH','#ff3355')}
function finishState(dt){const g=p.grab&&p.grab.alive?p.grab:null,t=p.t;p.vx=0;p.vy=0;
 if(g&&!p.shot){g.vx=0;g.vy=0;g.fl=.6;g.y+=((GROUND-140)-g.y)*Math.min(1,dt*5)}
 if(t>.45&&!p.st1){p.st1=true;const fx=p.x,fy=p.y;if(g){p.x=clampX(g.x-p.face*120);p.face=g.x>=p.x?1:-1}p.y=GROUND;p.ground=true;
  for(let k=1;k<=6;k++)ghosts.push({x:fx+(p.x-fx)*k/7,y:fy+(p.y-fy)*k/7,f:(FR[p.anim]||FR.idle)[0],face:p.face,l:.1+k*.04,blue:1});puffShadow(p.x,p.y);setAnim(p.ninja?'n_er':'pc3',true)}
 if(t>.45&&t<1&&t%.03<dt){const a=Math.random()*6.28;sparks.push({x:p.x+Math.cos(a)*120,y:p.y-70+Math.sin(a)*120,vx:-Math.cos(a)*400,vy:-Math.sin(a)*400,l:.3,c:Math.random()<.5?'#ff3355':'#ffe14d'})}
 if(t>1&&!p.shot){p.shot=true;setAnim(p.ninja?'n_es':'pc8',true);const cx=g?g.x:p.x+p.face*120,cy=g?g.y:p.y-80;
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
 for(const s of STR)if(str.endsWith(s.k)){p.pendStr=s;if(s.k.length>=5){TOK.forEach(o=>o.hit=1)}break}}
function strFire(s){const nin=p.ninja,nm=nin&&s.nn?s.nn:s.nm,fx=nin&&s.nfx?s.nfx:s.fx;
 if(fx==='finish'){finishHim();return}
 card(nm,s.k.split('').join(' '),nin?NV:s.col);slowT=Math.max(slowT,.22);flashT=Math.max(flashT,.12);shake=Math.max(shake,14);extend();C.atk++;
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
 const alt=Math.max(0,GROUND-p.y);cine.altA+=((alt>220&&!sky?1:0)-cine.altA)*Math.min(1,dt*4);
 if(p.ground)p.hypeI=0;else if(!sky&&C.n>0&&HYPE[p.hypeI||0]&&alt>HYPE[p.hypeI||0][0]){cine.hype={t:HYPE[p.hypeI||0][1],l:1.6};p.hypeI=(p.hypeI||0)+1;flashT=Math.max(flashT,.05)}
 if(!p.ground&&!sky&&['nair','airswipe','airspin','tailwhip'].includes(p.state)&&p.t<.15){let best=null,bd=330;for(const d of dummies){if(!d.alive||d.inSky||d.y>GROUND-30)continue;const dd=Math.hypot(d.x-p.x,(d.y-p.y)*.6);if(dd<bd){bd=dd;best=d}}
  if(best){if(p.t<.03&&p.state!=='tailwhip'&&Math.abs(best.x-p.x)>25)p.face=best.x>p.x?1:-1;const want=Math.max(-450,Math.min(450,(best.x-p.face*70-p.x)*7));p.vx+=(want-p.vx)*Math.min(1,dt*14)}}
 if(p.pendStr&&!CINE.includes(p.state)&&(p.state!=='nmorph'||p.t>.2)){const s=p.pendStr;p.pendStr=null;strFire(s)}
 if(p.cyc){const c=p.cyc;c.t-=dt;c.k+=dt;if(c.k>.1){c.k=0;C.atk++;for(const d of dummies)if(d.alive&&!d.inSky&&Math.abs(d.x-p.x)<260&&Math.abs(d.y-p.y)<320){d.x+=(p.x+p.face*40-d.x)*.25;hitDummy(d,c.kb,Math.sign(d.x-p.x)||p.face)}}
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
