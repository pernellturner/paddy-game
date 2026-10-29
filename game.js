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
 ShiftLeft:'run',ShiftRight:'run',KeyT:'tail',KeyL:'tail',KeyZ:'zoomies',KeyE:'hiss',KeyR:'swat',KeyF:'finisher',KeyH:'hurtTest',KeyY:'victory',KeyN:'blink',KeyM:'morph',Digit3:'formN',Digit4:'formS',Digit5:'formK',Digit6:'formP',ControlLeft:'blink',ControlRight:'blink'};
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
 idleT:0,airHits:0,hang:0,dashStart:-9,grab:null,tair:0,lives:9,hp:3,inv:0,blinkCool:0,keepT:0,keepCombo:0,jc:0,mc:0,rot:0,fallTop:GROUND,perfect:false,miss:false,blend:0,prevF:null,holdT:0,wj:0,dj:0,startT:0,ninja:false,sam:false,xf:0,xcombo:0,xcT:0,xair:0,ncombo:0,ncT:0,nair:0,nc:0,nsteps:0,nstepT:0,nstepCool:0,storm:null,mfrom:null,carry:false,rats:0,shot:false,lastJump:-9};
let acted=false;const BUF={};const INSTANT=['morph','formN','formS','formK','formP','hunt','hurtTest','victory','blink'];
const waves=[],shots=[],sparks=[],ghosts=[],texts=[];let shake=0;
const lastTap={left:-9,right:-9};let now=0;
function tapDir(k){if(k!=='left'&&k!=='right')return;if(now-lastTap[k]<0.28){P.dash=k;BUF.dash=now;lastTap[k]=-9}else lastTap[k]=now}
function say(t,c,big){if(typeof cine!=='undefined'&&cine.card&&cine.card.t<1.3&&!big)return;texts.length=0;texts.push({t,c:c||'#fff',l:1,rot:(Math.random()-.5)*.18,big:!!big})}
function setAnim(a,force){if(!FR[a])a=fa('idle');if(p.anim!==a||force){const cf=(FR[p.anim]||[])[p.fi];if(cf&&p.anim!==a){p.prevF=cf;p.prevFace=p.face;p.prevX=p.x+(p.wall?40*p.wall:0);p.prevY=p.y;p.blend=.1}p.anim=a;p.fi=0;p.ft=0}}
function act(state,anim,o){tokAct(state);p.state=state;p.t=0;p.shot=false;acted=true;setAnim(anim,true);if(o&&o.say)say(o.say,o.c||'#fff')}
const LW=VW-WALL_X; // left wall face (arena has a climbable wall on both sides)
const floorAt=x=>(x>WALL_X-20&&x<WALL_X+100)||(x<LW+20&&x>LW-100)?WT:GROUND;
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
function blink(){if(p.uf)return ufBlink();if(p.xf)return xBlink();if(p.ninja)return nStep();if(p.sam)return sIaido();if(p.blinkCool>0||['ledge','bunny','eclipse','finishhim','sfinal'].includes(p.state))return false;
 const from=p.x;puffShadow(p.x,p.y);const kc=p.state==='claw'?p.combo:0;
 let nx=p.x+p.face*330;nx=Math.max(LW-35,Math.min(WALL_X+45,nx));if(p.y>WT+2&&from<WALL_X-60&&nx>WALL_X-60)nx=WALL_X-60;if(p.y>WT+2&&from>LW+60&&nx<LW+60)nx=LW+60;
 const barge=(p.state==='dash'||now-p.dashStart<.45);
 p.x=nx;p.wall=false;p.inv=.6;p.blinkCool=.9;p.state='normal';p.t=0;p.vx=p.face*200;if(!p.ground)p.vy=Math.min(p.vy,0);
 if(barge){puffShadow(p.x,p.y);blinkBarge();extend();acted=true;return true}
 if(kc){p.keepCombo=kc;p.keepT=.7}extend();puffShadow(p.x,p.y);say('SHADOW BLINK!','#c9a7ff');acted=true;return true}
function puffShadow(x,y){for(let i=0;i<16;i++){const a=Math.random()*6.28;puffs.push({x:x+Math.cos(a)*30,y:y-60+Math.sin(a)*40,vx:Math.cos(a)*70,vy:Math.sin(a)*50,r:12+Math.random()*12,l:.55,dark:1})}}
function loseLife(){p.lives--;say(p.lives>0?'LOST A LIFE ('+p.lives+' left)':'OUT OF LIVES!','#ffb0b0',true);act('respawn',fa('hurt'));p.rot=0;p.vx=0;p.vy=-200;p.ground=false}
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
function doDash(dir){if(p.uf){ufDash(dir);return}if(p.xf){xDash(dir);return}if(p.ninja){nDash(dir);return}if(p.sam){sDash(dir);return}p.face=dir==='right'?1:-1;p.wall=false;p.dashCool=.45;p.dashStart=now;
 if(!p.ground&&p.jumps>=2&&!p.airDash){p.airDash=true;act('wingdash','wingdash',{say:'WINGED DASH!',c:'#8fe0ff'});p.vx=p.face*1000;p.vy=-60;shake=6}
 else{act('dash','dash',{say:'DASH!'});p.vx=p.face*900;if(!p.ground)p.vy=Math.min(p.vy,0);shake=3}}
function hurtMe(){comboEnd(true);p.hp--;if(p.hp<=0){p.hp=3;p.wall=false;loseLife();return}p.wall=false;p.rot=0;act('hurt',fa('hurt'),{say:'OUCH!',c:'#ff8080'});p.vy=-400;p.vx=-p.face*200;p.ground=false}
function victory(){act('victory',fa('victory'),{say:'VICTORY!',c:'#ffe14d'});p.vx=0;spark(p.x,p.y-80,24,['#ffe14d','#fff','#ff9ad5'],400)}
function shoot(fire){shots.push({x:p.x+p.face*110,y:p.y-60,vx:p.face*(fire?700:620),l:1.6,a:0,hit:new Set(),fire});shake=8}
const MANNER=['groom','stretch','sitflick','sniff','loaf'];
const anyInput=()=>Object.keys(P).length>0||K.left||K.right||K.down||K.jump;
const huntBtn=document.querySelector('[data-k=hunt]');
function update(dt){
 now+=dt;p.t+=dt;p.cool-=dt;p.dashCool-=dt;p.wj-=dt;p.dj-=dt;p.startT-=dt;
 const dir=(K.right?1:0)-(K.left?1:0);p.holdT=dir?p.holdT+dt:0;
 if(P.morph)cycleForm();if(P.formN)setForm(1);if(P.formS)setForm(2);if(P.formK)setForm(3);if(P.formP)setForm(4);nUpdate(dt);r6Update(dt);r8Update(dt);r9Pre(dt);
 p.blend-=dt;
 for(const f of puffs){f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*30;f.l-=dt}for(let i=puffs.length-1;i>=0;i--)if(puffs[i].l<=0)puffs.splice(i,1);
 p.inv-=dt;p.blinkCool-=dt;p.keepT-=dt;p.hang-=dt;if(hitNum){hitNum.l-=dt*1.4;if(hitNum.l<=0)hitNum=null}flashT-=dt;
 if(P.blink)blink();
 if(P.hurtTest&&p.inv<=0&&p.state!=='respawn')hurtMe();
 if(P.victory&&p.ground&&p.state==='normal')victory();
 if(P.hunt){p.hunt=!p.hunt;say(p.hunt?'HUNT MODE':'hunt off','#ffe08a');huntBtn.classList.toggle('lit',p.hunt)}
 if(P.dash&&p.dashCool<=0&&['normal','land','zoomies'].includes(p.state)&&!(p.hunt&&p.ground))doDash(P.dash)
 // cancel windows: after a short commit time these moves can flow straight into the next one
 const CANCEL={nflip:99,pawpop:.15,barge:.25,meow:.2,claw:.12,airswipe:.12,swat:.12,tailwhip:.15,dashstrike:.2,uppercut:.16,land:0,hardland:.12,stop:0,blast:.42,hiss:.3,finisher:.6,airspin:.15,slide:.15};
 if(CANCEL[p.state]!=null&&p.t>CANCEL[p.state]){
  if(P.dash&&p.dashCool<=0){if(['claw','swat','tailwhip'].includes(p.state)){p.face=P.dash==='right'?1:-1;dashStrike()}else doDash(P.dash)}
  else if((P.jump&&p.ground)||(P.down&&!p.ground)||(P.attack&&(K.up||!p.ground)&&p.state!=='claw'&&p.state!=='airspin')||(P.attack&&K.up&&p.ground)||((P.special||(P.tail&&p.state!=='tailwhip'))&&!['meow','hiss','finisher'].includes(p.state))){p.state='normal';p.combo=0}
 }
 const MAXT={tkd:3.2,ufin:2.6,umeowc:3.4,umeow:1.6,ublink:1.2,utail:1.2,knfinal:3,pifinal:3,kncharge:3.5,picharge:3.5,kntail:1.5,piswing:1.2,kncrest:1.5,pibroad:1.2,lk:1.3,lkult:4.2,eclipse:4.5,finishhim:3.5,nmorph:1,ncharge:3,nstorm:3,wallrun:2.2,nflip:2,nbflip:2,ndive:2,bunny:4.5,barge:1,sfinal:4.5,sparry:1.5,scharge:3.5,ssuper:2,siaido:1.2,sdraw:1,zoomies:3,manner:5,hurt:3,respawn:4,mcharge:3.5,jcharge:4.5,superleap:2,ledge:1.5,victory:2.5,finisher:2.5};
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
 case 'land': p.vx*=.8;if(p.t>.12||dir||P.attack||P.jump||P.tail||P.special||P.blink||P.swat||P.hiss||P.dash)p.state='normal';break;
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
 case 'zoomies': p.vx=p.face*720;if(p.x<LW+70||p.x>WALL_X-80){p.face*=-1;p.x=Math.max(LW+71,Math.min(WALL_X-81,p.x))}
  if(p.t%0.03<dt)ghosts.push({x:p.x,y:p.y,f:FR.zoomies[p.fi],face:p.face,l:.25});if(p.t>2.4||P.jump||P.attack||P.down){p.state='normal';p.vx=p.face*300}break;
 case 'manner': if(anyInput()){p.state='normal';p.idleT=0}else if(p.t>(p.anim==='loaf'?4:p.anim==='groom'||p.anim==='sitflick'?2.5:dur(p.anim)+.3)){p.state='normal';p.idleT=0}break;
 case 'victory': p.vx=0;if((end&&p.t>1)||(p.t>.12&&(P.attack||P.tail||P.jump||P.special||P.dash||dir))){p.state='normal'}break;
 case 'ledge': {p.vx=0;p.vy=0;const L=.75,u=Math.min(1,p.t/L),e=x=>x*x*(3-2*x);
  const uy=e(Math.min(1,u/.6)),ux=e(Math.max(0,(u-.35)/.65));
  p.y=p.ly0+(WT-p.ly0)*uy;p.x=p.lx0+((p.lside<0?LW-30:WALL_X+30)-p.lx0)*ux;p.fi=Math.min(FR.ledge.length-1,Math.floor(u*FR.ledge.length));p.ft=p.fi;
  if(u>=1){p.state='normal';p.y=WT;p.x=p.lside<0?LW-30:WALL_X+30;p.ground=true;p.vy=0}}break;
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
 default: if(S==='lk')lkState(dt);else if(S==='lkult')ultState(dt);else if(NST.includes(S))nState(S,dt,end,dir);else if(SST.includes(S))sState(S,dt,end,dir);else if(UST.has(S))ufState(S,dt,end,dir);else if(XST.has(S))xState(S,dt,end,dir);else if(S==='stun'){p.vx*=Math.pow(.05,dt);if(p.t>.45)p.state='normal'}break;
 }
 if(p.state==='normal'){
  const T=false,N=p.ninja||p.sam||!!p.xf||!!p.uf,running=K.run||(touchMode&&p.holdT>.6)||N,spd=p.hunt?110:p.uf?UF[p.uf].spd:p.xf?XF[p.xf].spd:p.ninja?470:p.sam?430:260*(running?1.6:1),JB=1;
  if(K.down&&p.ground&&!p.hunt&&Math.abs(p.vx)>300&&P.down&&!T&&!N){act('slide','slide',{say:'SLIDE!'});}
  else if(K.down&&p.ground&&!p.hunt&&!T&&!N){p.vx*=.7;setAnim('crouch');}
  else{p.vx+=(dir*spd-p.vx)*Math.min(1,dt*(p.xf===3?(p.ground?(dir?5.5:6.5):4):N?(p.ground?(dir?8:10):5):T?(p.ground?(dir?4.5:6):2.5):(p.ground?(dir?7:9):4)));if(dir&&!p.wall)p.face=dir;}
  if(p.state==='normal'){
  if(p.ground&&!dir&&Math.abs(p.vx)>330&&!p.hunt&&!N){act('stop','stop')}
  if(p.ground&&dir&&running&&Math.abs(p.vx)<40&&!p.hunt&&!N)p.startT=.18;
  // wall climb: hold → to climb, release to cling, ← / jump to leap off, ↓ to drop
  if(!N&&!p.wall&&p.y>WT+10&&!K.down&&!p.hunt){if(p.x>=WALL_X-62&&K.right)p.wall=1;else if(p.x<=LW+62&&K.left)p.wall=-1;if(p.wall){p.jumps=0;p.airDash=false;say('CLIMB!','#ffe08a')}}
  if(p.wall){const ws=p.wall,into=ws>0?K.right:K.left,away=ws>0?K.left:K.right;p.face=ws;p.vx=0;
   if(K.down){p.wall=false}
   else if(P.jump||away){p.wall=false;p.vy=-650;p.vx=-340*ws;p.face=-ws;p.jumps=1;p.wj=.45;setAnim('walljump');say('WALL JUMP!');extend('WALL JUMP!')}
   else{p.vy=into?-190:35;
    const cf=FR.climb[p.fi]||FR.climb[0];if(p.y-cf.ay*SC<WT-20&&into){p.lx0=p.x+40*ws;p.lside=ws;p.ly0=p.y;p.wall=false;act('ledge','ledge',{say:'LEDGE GRAB!',c:'#ffe08a'});p.x=p.lx0}}}
  else if(N){}
  else if(P.jump&&p.ground&&(dir||Math.abs(p.vx)>120)){p.vy=(p.hunt?-560:-720);p.ground=false;p.jumps=1;p.lastJump=now;setAnim('jump',true);acted=true;delete P.jump} // running jump leaves at once (no momentum loss)
  else if(P.jump&&p.ground){act('jcharge','crouch');p.jc=0}
  else if(P.jump&&!p.ground&&p.jumps<2){acted=true;p.vy=-650*JB;p.jumps=2;p.dj=.45;setAnim('djump');p.anim='djump';p.ft=0;say('DOUBLE JUMP!');extend();spark(p.x,p.y,10,'#fff',150)}
  if(p.state!=='normal'){}
  else if(p.uf){ufMoves(dir)}
  else if(p.xf){xMoves(dir)}
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
   if(p.xf||p.uf){const q=p.uf?UF[p.uf].pre:XF[p.xf].pre; if(!p.ground)setAnim(p.vy<-260?q+'_rise':p.vy<200?q+'_apex':q+'_fall');else setAnim(Math.abs(p.vx)>25?q+'_run':q+'_idle') }
   else if(p.sam){ if(!p.ground)setAnim(p.vy<-220?'s_rise':p.vy<200&&FR.s_apex?'s_apex':'s_fall');else setAnim(Math.abs(p.vx)>25?'s_run':'s_idle') }
   else if(N){ if(!p.ground)setAnim(p.vy<-260?'n_rise':p.vy<200?'n_apex':'n_fall');else setAnim(Math.abs(p.vx)>25?'n_run':'n_idle') }
   else if(p.wall)setAnim('climb');
   else if(!p.ground)setAnim(p.wj>0?'walljump':p.dj>0?'djump':p.vy<-260?'jump':p.vy<200?'apex':'fall');
   else if(p.hunt)setAnim('stalk');
   else if(!K.down){const v=Math.abs(p.vx);
    setAnim(p.startT>0?'start':v>300?'run':v>25?'walk':'idle')}
   // idle mannerisms after ~4s of doing nothing
   if(p.ground&&!N&&!p.hunt&&p.anim==='idle'&&!anyInput()){p.idleT+=dt;if(p.idleT>4){p.idleT=0;const m=MANNER[Math.floor(Math.random()*MANNER.length)];act('manner',m)}}else p.idleT=0;
  }
 }
 // physics
 if(!p.wall&&!['wingdash','dive','diveclaw','ledge','wallrun','nstorm','eclipse','finishhim','lkult','piswing','knfinal','pifinal'].includes(p.state)&&!UNG.has(p.state))p.vy+=(p.state==='airspin'?600:p.hang>0?700:1900)*dt;
 if(p.state!=='ledge'){p.x+=p.vx*dt;p.y+=p.vy*dt;}
 if(p.state!=='ledge'&&p.y>WT+2&&p.y-p.vy*dt>WT+2&&p.x>WALL_X-60&&p.x<WALL_X+60){p.x=WALL_X-60;if(p.state==='zoomies')p.face=-1} // wall side
 if(p.state!=='ledge'&&p.y>WT+2&&p.y-p.vy*dt>WT+2&&p.x<LW+60&&p.x>LW-60){p.x=LW+60;if(p.state==='zoomies')p.face=1} // left wall side
 if(p.vy>2200)p.vy=2200;
 const fl=floorAt(p.x);
 if(p.state!=='ledge'){
 if(p.ground||p.vy<0||p.wall||p.state==='ledge')p.fallTop=p.y;
 // long fall: acrobatic flip just before touching down
 if(!CINE.includes(p.state)){const h=floorAt(p.x)-p.y;const tr=p.state==='wallrun'?-1.5708:(!p.ground&&p.state==='normal'&&p.vy>300&&floorAt(p.x)-p.fallTop>300&&h<170)?(1-h/170)*6.283*p.face:0;
  if(p.ninja||p.sam||p.xf||p.uf){let df=((tr-p.rot+Math.PI)%6.2832+6.2832)%6.2832-Math.PI;p.rot=Math.abs(df)<.01?tr:p.rot+df*Math.min(1,dt*(p.state==='wallrun'?16:12));if(Math.abs(p.rot)<.01&&!tr)p.rot=0}else p.rot=tr}
 if(p.y>=fl&&p.vy>=0){p.y=fl;if(!p.ground&&p.state==='normal'){
   if(fl-p.fallTop>300&&!p.sam&&!p.ninja&&!p.xf&&!p.uf){act('land','land',{say:'LANDS ON HIS FEET!',c:'#ffe08a'});spark(p.x,fl,14,['#fff','#d9c49a'],200);shake=4}
   else if(p.vy>300&&Math.abs(p.vx)<150&&!K.left&&!K.right){act('land',fa('land'));spark(p.x,fl,8,'#d9c49a',120)}
   else if(p.vy>300)spark(p.x,fl,6,'#d9c49a',100)}
  if(!p.ground&&p.vy>250)p.lsq=.16;
  p.vy=0;p.ground=true;p.jumps=0;p.airDash=false;p.airSpin=false;p.airSwipe=false;p.tair=0;p.nair=0;p.sair=0;p.xair=0;p.airIai=false;p.airHits=0;p.wj=0;p.dj=0}else p.ground=false;}
 if(p.x<LW-35)p.x=LW-35;if(p.x>WALL_X+45)p.x=WALL_X+45; // stay fully on screen on either wall top
 // anim frames
 const fr=FR[p.anim]||FR.idle,a=A[p.anim]||A.idle;
 let fps=a[2];if(p.anim==='stalk')fps*=Math.min(1,Math.abs(p.vx)/80);if(p.anim==='climb'&&p.vy>=0)fps=0;
 if(p.state!=='ledge')p.ft+=dt*fps;p.fi=a[3]?Math.floor(p.ft)%fr.length:Math.min(fr.length-1,Math.floor(p.ft));
 {const nf=fr[p.fi];if(p.lastF&&nf!==p.lastF&&p.lastA===p.anim&&!(p.blend>0)){p.fPrev=p.lastF;p.fB=p.uf>=7&&/_run$/.test(p.anim)?.07:.045}p.lastF=nf;p.lastA=p.anim;p.fB=(p.fB||0)-dt}
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
 for(let i=sparks.length-1;i>=0;i--)if(sparks[i].l<=0)sparks.splice(i,1);if(sparks.length>380)sparks.splice(0,sparks.length-380);if(ghosts.length>36)ghosts.splice(0,ghosts.length-36);if(puffs.length>140)puffs.splice(0,puffs.length-140); // phone budget during big ultimates

 meleeHits(dt);updDummies(dt);
 shake*=.85; // input buffer: an unused press stays live for ~0.15s so moves chain; any new action consumes it
 for(const k in P)if(acted||INSTANT.includes(k)||now-(BUF[k]??-9)>.15)delete P[k];acted=false;
 const nm={manner:p.anim,claw:p.anim.replace(/^claw(\d)/,'claw $1/3')}[p.state]||(p.state==='normal'?p.anim:p.state);
 if(now-errShown>3)lbl.textContent=(p.uf?UF[p.uf].ico+' '+UF[p.uf].nm+' · ':p.xf===3?'🛡️ KNIGHT · ':p.xf===4?'⚓ PIRATE · ':p.ninja?'🥷 NEON NINJA · ':p.sam?'⚔️ SAMURAI · ':'')+nm.replace(/^([nsr]|kn|pi|gs|lp|pb|cb|sr|sh|mst|mde|mph|mfm|mmc|mtc|mch|mbk)_/,'')+(p.wall?' (wall)':'')+(p.hunt?' · HUNT':'');
}
function burst(x,y,fire){shake=10;for(let i=0;i<24;i++){const a=Math.random()*6.28,v=100+Math.random()*300;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5,c:i%2?'#fff':fire?'#ff9a2e':'#5cc8ff'})}}
function readyFrame(f,dog){if(f&&imgOK(IMG[f.f]))return f;const fb=FR[dog?'r_idle':fa('idle')];let g=fb&&fb.find(q=>imgOK(IMG[q.f]));if(!g&&!dog){const b=FR.idle;g=b&&b.find(q=>imgOK(IMG[q.f]))}return g||null}
function drawFrame(f,x,y,face,alpha){f=readyFrame(f);const im=f&&IMG[f.f];if(!im)return;ctx.save();if(alpha!=null)ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(face*SC,SC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}
// Mythic runs: a soft step bounce + forward lean on top of the run frames (eases in/out, so no snap)
function mRunBob(){const on=p.uf>=7&&p.ground&&!p.hunt&&/_run$/.test(p.anim||'');const dt=Math.min(.05,Math.max(0,now-(p.rbT||now)));p.rbT=now;p.rbA=(p.rbA||0)+((on?1:0)-(p.rbA||0))*Math.min(1,dt*12);p.rbPh=(p.rbPh||0)+dt*12.6;const a=p.rbA;if(a<.01)return{y:0,r:0};return{y:a*Math.abs(Math.sin(p.rbPh))*8,r:a*p.face*(.045+.015*Math.sin(p.rbPh*2))}}
function draw(){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#87c6f0';ctx.fillRect(0,0,cv.width,cv.height);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
 // camera follows Paddy upward (juggles, super leaps), eased
 const jd=!p.ground&&dummies.find(d=>d.alive&&d.y<GROUND-120&&Math.abs(d.x-p.x)<520),fy=jd?Math.max(p.y-270,Math.min(p.y,jd.y-140)):p.y; // Big Bruno is tall: keep his whole body in shot during juggles
 const camT=Math.max(0,(p.xf||p.uf||p.sam?300:225)-fy+(fy<GROUND-250?Math.max(0,Math.min(300,-p.vy*.26)):0));camY+=(camT-camY)*Math.min(1,(1/60)*(Math.abs(camT-camY)>150?18:camT>camY?11:7));if(!isFinite(camY))camY=0;
 ctx.setTransform(scale,0,0,scale,offX+sx*scale,offY+(sy+camY)*scale);
 r12Sky();cineXform();
 r12Arena();
 if(cine.dim>.01){ctx.fillStyle=`rgba(22,8,48,${cine.dim})`;ctx.fillRect(-2000,-camY-500,VW+4000,VH+1000)}
 drawDummies();
 // shadow
 const hgt=floorAt(p.x)-p.y;ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(p.x,floorAt(p.x)+3,60*Math.max(.4,1-hgt/400),9,0,0,6.28);ctx.fill();
 for(const g of ghosts){const im=g.f&&IMG[g.f.f];if(!imgOK(im))continue;ctx.save();ctx.globalAlpha=Math.min(1,g.l*(g.blue?2:1.6));if(g.blue)ctx.globalCompositeOperation='lighter';ctx.translate(g.x,g.y);ctx.scale(g.face*SC,SC);ctx.drawImage(im,-g.f.ax,-g.f.ay);ctx.restore()}
 // player (a short crossfade from the previous animation)
 if(p.blend>0&&p.prevF)drawFrame(p.prevF,p.prevX,p.prevY,p.prevFace,(p.hunt?.55:1)*p.blend/.1);
 const mu=p.state==='nmorph'?Math.min(1,p.t/(p.mquick?.28:.5)):1;if(mu<1&&p.mfrom)drawFrame(p.mfrom,p.x,p.y,p.face,1-mu*mu*(3-2*mu));
 const sq=r11Sq();
 const rbo=mRunBob();ctx.save();ctx.translate(p.x,p.y-(p.rot?60:0)-rbo.y);ctx.rotate((p.rot||0)+rbo.r);ctx.scale(2-sq,sq);ctx.translate(-p.x,-p.y+(p.rot?60:0));if(p.inv>0&&p.inv<2.5&&!p.grab&&!CINE.includes(p.state)&&!/fin|ult|storm|blink|roll|iai|morph/.test(p.state||'')&&Math.floor(now*20)%2)ctx.globalAlpha=.45;
 if(p.fB>0&&p.fPrev&&mu>=1&&!p.hunt)drawFrame(p.fPrev,p.x+(p.wall?40*p.wall:p.state==='wallrun'?14*p.face:0),p.y,p.face,.32*p.fB/.045);
 drawFrame((FR[p.anim]||FR.idle)[p.fi],p.x+(p.wall?40*p.wall:p.state==='wallrun'?14*p.face:0),p.y,p.face,mu<1?mu*mu*(3-2*mu):p.hunt?.55:(p.blend>0?1-.5*p.blend/.1:null));ctx.restore();
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
 if(flashT>0){ctx.fillStyle=`rgba(255,250,236,${Math.min(.36,flashT*1.8)})`;ctx.fillRect(-500,-500,VW+1000,VH+1000)}
 r12HUD();drawCineHUD();drawKanji();drawTexts();drawCombo();drawLives();r12Over();
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
// ---- sprite loading: robust on slow phones ----
// small .webp first (falls back to .png), a few at a time, most important first; the game starts as soon as the
// basics are in (or after a few seconds) and keeps loading the rest in the background. A missing/broken image never blocks anything.
const VER='14b',ESSENTIAL=['idle','walk','run','jump','fall','land','djump','crouch','r_idle','r_walk','n_idle','s_idle','s_draw'];
const LAZY=a=>/^(kn|pi|gs|lp|pb|cb|sr|sh|mst|mde|mph|mfm|mmc|mtc|mch|mbk)_/.test(String((A[a]||[''])[0]));
const imgOK=im=>!!(im&&im.complete&&im.naturalWidth>0);
function startGame(){if(started)return;started=true;last=performance.now();requestAnimationFrame(loop)}
function drawLoading(){if(started)return;requestAnimationFrame(drawLoading);const S=window.SPRITES,u=S&&S.total?(S.loaded+S.failed.length)/S.total:0;
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#87c6f0';ctx.fillRect(0,0,cv.width,cv.height);const w=cv.width*.4,x=(cv.width-w)/2,y=cv.height*.55,h=Math.max(8,cv.height*.025);
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x,y,w,h);ctx.fillStyle='#ff8fb1';ctx.fillRect(x,y,w*u,h);ctx.fillStyle='#fff';ctx.font=`${Math.round(h*2.4)}px ${FONT}`;ctx.textAlign='center';
 ctx.fillText('Loading Paddy… '+Math.round(u*100)+'%',cv.width/2,y-h*1.2)}
function loadSprites(tries){fetch('assets/frames.json?v='+VER).then(r=>{if(!r.ok)throw new Error('frames.json '+r.status);return r.json()}).then(j=>{F=j;for(const a in A){const [s,idx]=A[a];if(F[s])FR[a]=idx?idx.filter(i=>i<F[s].length).map(i=>F[s][i]):F[s]}
 const first=[],rest=[],seen=new Set();const add=(a,list)=>(FR[a]||[]).forEach(f=>{if(!seen.has(f.f)){seen.add(f.f);list.push(f.f)}});
 ESSENTIAL.forEach(a=>add(a,first));Object.keys(FR).filter(a=>!LAZY(a)).forEach(a=>add(a,rest));
 const queue=first.concat(rest),need=new Set(first);let active=0,needLeft=need.size;window.SPRITES={total:queue.length,loaded:0,failed:[]};
 const finish=(nm,ok)=>{if(ok)SPRITES.loaded++;else SPRITES.failed.push(nm);if(need.has(nm)&&--needLeft<=0)startGame();active--;pump()};
 function loadOne(nm){const im=new Image();IMG[nm]=im;let stage=0,done=false,timer;
  const go=()=>{clearTimeout(timer);timer=setTimeout(fail,stage?15000:12000);im.src='assets/'+nm+(stage?'.png':'.webp')+'?v='+VER};
  function fail(){if(done)return;if(stage===0){stage=1;go();return}done=true;clearTimeout(timer);console.warn('sprite failed',nm);finish(nm,false)}
  im.onload=()=>{if(done)return;done=true;clearTimeout(timer);if(im.decode)im.decode().catch(()=>{});finish(nm,true)};im.onerror=fail;go()}
 function pump(){while(active<6&&queue.length){active++;loadOne(queue.shift())}}
 // Knight / Pirate sprites load on demand (or quietly in the background once everything else is in)
 window.loadForm=function(pre,hi){const list=[];[pre+'_idle',pre+'_run',pre+'_rise',pre+'_apex',pre+'_fall',pre+'_land',pre+'_h1',pre+'_power',pre+'_victory'].concat(Object.keys(FR).filter(a=>String(A[a][0]).startsWith(pre+'_'))).forEach(a=>add(a,list));
  if(list.length){SPRITES.total+=list.length;queue.push(...list)}if(hi){const mine=queue.filter(n=>n.startsWith('p/'+pre+'_')),rest2=queue.filter(n=>!n.startsWith('p/'+pre+'_'));queue.length=0;queue.push(...mine,...rest2)}pump()};
 window.queueFrames=function(names,hi){const list=names.filter(n=>!seen.has(n));list.forEach(n=>seen.add(n));if(!list.length)return;SPRITES.total+=list.length;if(hi)queue.unshift(...list);else queue.push(...list);pump()};
 pump();setTimeout(startGame,6000)}).catch(e=>{console.error(e);if((tries||0)<4)setTimeout(()=>loadSprites((tries||0)+1),1500);else{lbl.textContent='could not load – please refresh';startGame()}})}
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
const dummies=[{home:640}].map(d=>({...d,x:d.home,y:GROUND,vx:0,vy:0,fl:0,hp:60,max:60,hpShow:60,h:420,flash:0,sq:0,rot:0,alive:true,last:-1,calm:0,face:-1,fs:-1,st:'idle',t:0,ft:0,fi:0,anim:'r_idle',cool:2,stun:0,aggro:0,blend:0,bub:null}));
function tierCol(n){return n>=50?`hsl(${(performance.now()/4)%360},100%,65%)`:n>=25?'#ff6fcf':n>=10?'#ff9a2e':n>=5?'#ffe14d':'#fff'}
function extend(name){if(C.n>0){C.t=C.max;if(name)say(name,'#fff',false)}}
function comboEnd(silent){if(C.n>=2&&!silent){C.fin={n:C.n,l:2.2};if(C.n>=10&&p.state==='normal'&&p.ground)victory()}C.n=0;C.t=0}
function updCombo(dt){if(C.n>0){C.t-=dt;if(C.t<=0)comboEnd()}C.pop*=Math.pow(.002,dt);if(C.fin&&!(cine.card&&cine.card.t<2.4)){C.fin.l-=dt;if(C.fin.l<=0)C.fin=null}}
function addHit(move){C.n++;C.t=C.max;C.pop=1;C.best=Math.max(C.best,C.n);C.fin=null;
 const rank={10:'NICE!',25:'AWESOME!',50:'PURRFECT!',100:'LEGENDARY!'}[C.n];
 if(rank)say(rank,tierCol(C.n),true);else say(NAMES[move]||move,'#fff',false)}
function hitDummy(d,move,dir){const k=KB[move]||KB.claw1;
 d.lastHitT=now;d.vx=dir*k[0]*(0.85+Math.random()*.3);d.vy=Math.min(d.vy,0)+k[1];if(d.y>=GROUND-1&&k[1]>-200)d.vy=k[1];d.fl=k[2];d.flash=.12;d.sq=1;const air=d.y<GROUND-25;d.hp-=1;if(air||k[1]<-600){d.fl=Math.max(d.fl,.55)}if(air&&!['bunnykick'].includes(move)){C.jug=(C.jug||0)+1;if(C.jug%3===1)setTimeout(()=>say('JUGGLE!','#7fffd4'),0)}else C.jug=0;
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
function drawTexts(){const cb=cine.card&&cine.card.t<2.4,ct=cb?cine.card.title.replace(/[^A-Z]/g,''):'';for(const t of texts){const age=1-t.l,pop=age<.12?.4+age/.12*.85:age<.22?1.25-(age-.12)*2.5:1;
 if(cb){const tt=t.t.replace(/[^A-Z]/g,'');if(tt&&(ct.includes(tt)||tt.includes(ct)))continue}
 fancy(t.t,VW/2,(cb?88:t.big?175:140)-age*25,cb?44:t.big?78:54,t.rot,pop,Math.min(1,t.l*2.2),t.c)}
 if(C.fin&&!cb){const a=C.fin.l,age=2.2-a,pop=age<.15?.3+age/.15*1:1+Math.sin(age*8)*.03;
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
const clampX=x=>Math.max(p.y>WT+2?LW+62:LW-35,Math.min(p.y>WT+2?WALL_X-62:WALL_X+45,x));
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
 if(!p.wall&&p.y>WT+10&&((p.x>=WALL_X-64&&K.right)||(p.x<=LW+64&&K.left))&&!K.down){act('wallrun','n_wall',{say:'WALL RUN!',c:NV});p.face=p.x<VW/2?-1:1;p.vx=0;p.jumps=1;p.airDash=false;return}
 if(P.jump&&nJump())return;
 if(!p.ground&&P.down&&!P.attack){act('ndive','n_dive',{say:'FALLING STAR!',c:NC});p.vy=1150;p.vx=p.face*(dir?520:150);return}
 if(P.attack){if(!p.ground){if(K.down){act('ndive','n_dive',{say:'FALLING STAR!',c:NC});p.vy=1150;p.vx=p.face*520}else nAir();return}
  if(K.up||K.down){nHit(9);return}nHit(p.ncT>0&&p.ncombo<3?p.ncombo+1:1);return}
 if(P.special){act('ncharge','n_charge');p.nc=0;return}
 if(P.tail||P.swat||P.hiss){nThrow();return}}
function nState(S,dt,end,dir){switch(S){
 case 'eclipse': eclipseState(dt);break;
 case 'finishhim': finishState(dt);break;
 case 'nmorph': p.vx*=Math.pow(.05,dt);if(p.morphQ&&p.t>=.18){const q=p.morphQ;p.morphQ=false;setForm(q-1);break}if(p.t%.04<dt)spark(p.x+(Math.random()-.5)*90,p.y-Math.random()*120,2,[NV,NC,'#fff'],200);if(P.attack&&p.t>.1){p.mquick=false;if(p.uf){p.state='normal';ufMoves(0);break}if(p.xf){if(p.ground)xHit(1);else xAir()}else if(p.sam){if(p.ground)sHit(1);else sAir()}else if(p.ninja){if(p.ground)nHit(1);else nAir()}else if(p.ground){p.combo=0;startClaw()}else{p.airHits=0;p.airSwipe=true;act('airswipe','airswipe',{say:'AIR SWIPE!',c:'#bfe8ff'});p.vy=Math.min(p.vy,-120)}break}
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
 case 'wallrun': {const ws=p.face=p.x<VW/2?-1:1;p.x=ws>0?WALL_X-60:LW+60;p.vx=0;p.vy=-640;if(p.t%.03<dt)sparks.push({x:ws>0?WALL_X-2:LW+2,y:p.y-20,vx:(-60-Math.random()*80)*ws,vy:120,l:.3,c:Math.random()<.5?NV:NC});
  if(P.jump){p.rotHold=0;act('nflip','n_flip2',{say:'WALL KICK!',c:NV});p.vy=-700;p.vx=-430*ws;p.face=-ws;p.jumps=1;extend('WALL KICK!');break}
  if(!(ws>0?K.right:K.left)||K.down){p.state='normal';p.vy=-100;break}
  if(p.y<WT+24){act('nflip','n_flip2',{say:'FLIP OVER!',c:NV});p.x=ws>0?WALL_X+15:LW-15;p.y=WT-24;p.vy=-430;p.vx=200*ws;p.jumps=1;break}break;}
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
function morphStrike(){if(!(C.n>0||!p.ground))return;p.mquick=true;C.atk++;areaHit(p.x,p.y-10,230,'morphstrike');extend();const mc=p.uf?UF[p.uf].col:['#ffe08a',NV,SR,KG,PT][FORM()];say((p.uf?UF[p.uf].nm:['PADDY','NINJA','SAMURAI','KNIGHT','PIRATE'][FORM()])+' TRANSFORM STRIKE!',mc,true);
 slash('spin',mc,{lvl:6,scale:1.3});flashT=Math.max(flashT,.1);hitstop=Math.max(hitstop,.06);if(!p.ground){p.vy=-460;p.hang=.3}}
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
 for(const s of STR)if(!p.xf&&!p.uf&&str.endsWith(s.k)&&(!s.only||p[s.only])){p.pendStr=s;if(s.k.length>=5){TOK.forEach(o=>o.hit=1)}break}}
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
 const g=CINE.includes(p.state)&&p.grab&&p.grab.alive?p.grab:null,fx=g?(p.x+g.x)/2:p.x,fy=g?(p.y+g.y)/2-90:p.y-105;
 if(cine.z<1.01&&cine.tz===1){cine.fx=fx;cine.fy=fy}else{cine.fx+=(fx-cine.fx)*Math.min(1,dt*6);cine.fy+=(fy-cine.fy)*Math.min(1,dt*6)}
 if(cine.card){cine.card.t+=dt;if(cine.card.t>2.4)cine.card=null}
 if(cine.pillar){cine.pillar.l-=dt;if(cine.pillar.l<=0)cine.pillar=null}
 if(cine.hype){cine.hype.l-=dt;if(cine.hype.l<=0)cine.hype=null}
 const alt=Math.max(0,GROUND-p.y);cine.altA+=((alt>220?1:0)-cine.altA)*Math.min(1,dt*4);
 if(p.ground)p.hypeI=0;else if(C.n>0&&HYPE[p.hypeI||0]&&alt>HYPE[p.hypeI||0][0]){cine.hype={t:HYPE[p.hypeI||0][1],l:1.6};p.hypeI=(p.hypeI||0)+1;flashT=Math.max(flashT,.05)}
 if(!p.ground&&['nair','sair','knair','piair','airswipe','airspin','tailwhip'].includes(p.state)&&p.t<.15){let best=null,bd=330;for(const d of dummies){if(!d.alive||d.y>GROUND-30)continue;const dd=Math.hypot(d.x-p.x,(d.y-p.y)*.6);if(dd<bd){bd=dd;best=d}}
  if(best){if(p.t<.03&&p.state!=='tailwhip'&&Math.abs(best.x-p.x)>25)p.face=best.x>p.x?1:-1;const want=Math.max(-450,Math.min(450,(best.x-p.face*70-p.x)*7));p.vx+=(want-p.vx)*Math.min(1,dt*14)}}
 if(p.pendStr&&!CINE.includes(p.state)&&(p.state!=='nmorph'||p.t>.2)){const s=p.pendStr;p.pendStr=null;strFire(s)}
 if(p.cyc){const c=p.cyc;c.t-=dt;c.k+=dt;if(c.k>.1){c.k=0;C.atk++;for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<260&&Math.abs(d.y-p.y)<320){d.x+=(p.x+p.face*40-d.x)*.25;hitDummy(d,c.kb,Math.sign(d.x-p.x)||p.face)}}
  if(c.t<=0){p.cyc=null;C.atk++;areaHit(p.x,p.y,290,c.fin);shake=16;flashT=Math.max(flashT,.12);waves.push({x:p.x,y:p.y-40,r:20,l:1,big:true})}}
 if(p.sst){const c=p.sst;c.k+=dt;if(c.k>.14){c.k=0;for(let i=0;i<10;i++){const a=i/10*6.283+c.n*.31;stars.push({x:p.x,y:p.y-70,vx:Math.cos(a)*820,vy:Math.sin(a)*820,r:0,l:.75,hit:new Set()})}shake=Math.max(shake,6);if(++c.n>=3)p.sst=null}}
 if(p.clones){const c=p.clones;c.t+=dt;c.k+=dt;if(c.k>.16&&c.n<6){c.k=0;c.n++;const tg=nTarget(900);for(const q of c.pos){const x=p.x+q[0],y=p.y+q[1]-85,ax=tg?tg.x-x:p.face,ay=tg?(tg.y-70)-y:0,L=Math.hypot(ax,ay)||1;
   stars.push({x,y,vx:ax/L*1000,vy:ay/L*1000,r:0,l:.9,hit:new Set()})}shake=Math.max(shake,4)}if(c.t>1.4)p.clones=null}}
function r6DrawFx(){
 if(cine.pillar){const q=cine.pillar,a=Math.min(1,q.l),w=70+(1-a)*90;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(q.x-w/2,0,q.x+w/2,0);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,q.col);g.addColorStop(1,'rgba(255,255,255,0)');ctx.globalAlpha=a*.6;ctx.fillStyle=g;ctx.fillRect(q.x-w/2,-camY-3000,w,GROUND+camY+3000);
  ctx.fillStyle='#fff';ctx.globalAlpha=a*.42;ctx.fillRect(q.x-w*.08,-camY-3000,w*.16,GROUND+camY+3000);ctx.restore()}
 if(p.cyc){const c=p.cyc;ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<6;k++){const a=now*14+k*1.1,r=55+k*28;ctx.globalAlpha=.55-k*.06;ctx.strokeStyle=k%2?'#fff':c.col;ctx.lineWidth=8-k;
   ctx.beginPath();ctx.ellipse(p.x,p.y-20-k*34,r,r*.28,0,a,a+3.6);ctx.stroke()}ctx.restore()}}
function drawCineHUD(){
 if(cine.bars>.01){const h=64*cine.bars;ctx.fillStyle='#000';ctx.fillRect(-500,-500,VW+1000,500+h);ctx.fillRect(-500,VH-h,VW+1000,h+500)}
 const alt=Math.max(0,GROUND-p.y);
 if(cine.altA>.01){const x=VW-46,y0=130,y1=420,f=Math.min(1,Math.log(1+alt/400)/Math.log(1+15000/400)),yy=y1-(y1-y0)*f;ctx.save();ctx.globalAlpha=cine.altA;ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x-7,y0,14,y1-y0);
  const gr=ctx.createLinearGradient(0,y1,0,y0);gr.addColorStop(0,'#9fd6f7');gr.addColorStop(.4,'#ffb37a');gr.addColorStop(.65,'#7a4fa8');gr.addColorStop(1,'#03040c');ctx.fillStyle=gr;ctx.fillRect(x-5,yy,10,y1-yy);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,yy,8,0,6.283);ctx.fill();ctx.font=`20px ${FONT}`;ctx.textAlign='right';ctx.fillText(Math.round(alt/10)+' m',x-14,yy+7);ctx.textAlign='center';ctx.font=`14px ${FONT}`;ctx.fillText('ALT',x,y1+18);ctx.restore()}
 if(cine.hype){const h=cine.hype,u=1-h.l/1.6;fancy(h.t,VW/2,(cine.card&&cine.card.t<2.4?96:175)-u*20,44,-.05,u<.1?.5+u/.1*.7:1.2-Math.min(.2,u),Math.min(1,h.l*2),`hsl(${(now*300)%360},100%,70%)`)}
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
 r_idle:['b_idle',[0,1,2,3,4,3,2,1],5,1],r_walk:['b_walk',null,7,1],r_wind:['b_punch',[0,1,2],3.6,0],r_punch:['b_punch',[3,4],10,0],r_follow:['b_punch2',null,11,0],
 r_inhale:['b_bark',[0,1],3.5,0],r_bark:['b_bark',[2,3,3,4],7,0],r_lick:['b_bite',[0,1],3.8,0],r_bite:['b_bite',[2,3,4],11,0],
 r_hurt:['b_hurt',[0,1],7,0],r_up:['b_hurt',[2],1,0],r_tumble:['b_hurt',[3,4],6,1],r_down:['b_hurt',[4],1,0],
 r_ko:['b_ko',[0],1,1],r_sit:['b_ko',[1,2],1.5,1],r_wag:['b_ko',[3,4],1.6,0],
 r_sniff:['b_gag',[0],1,0],r_scratch:['b_gag',[1],1,0],r_chase:['b_gag',[2],1,0],r_howl:['b_gag',[3],1,0],r_yawn:['b_gag',[4],1,0],
 r_doze:['b_stealth',[0,1,0],1.1,1],r_look:['b_stealth',[2],1,0],r_startle:['b_stealth',[3],1,0],r_flat:['b_stealth',[4],1,0],b_portrait:['b_portrait',[0],1,0],
 prop_bush:['prop',[0],1,0],prop_crates:['prop',[1],1,0],prop_barrels:['prop',[2],1,0]});
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
document.fonts&&document.fonts.load(`80px Kanji`,'斬侍風桜必殺一閃返し気月').catch(()=>{});
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
function setForm(f,force){if(p.state==='nmorph'&&p.t<.18){p.morphQ=f+1;return}if(['eclipse','finishhim','sfinal','knfinal','pifinal','respawn','bunny','ledge','lkult'].includes(p.state))return;
 const cur=FORM();if(f===cur)f=0;if(f===cur){p.morphWait=null;return}
 if(f>=3&&force&&!formReady(f)&&typeof loadForm==='function')loadForm(['','','','kn','pi'][f],true);
 if(f>=3&&!force&&!formReady(f)){requestForm(f);return}if(f<3)p.morphWait=null;
 formReset();const from=(FR[p.anim]||FR.idle)[p.fi];p.ninja=f===1;p.sam=f===2;p.xf=f>=3?f:0;p.xcombo=0;p.xair=0;p.rot=0;p.hunt=false;huntBtn&&huntBtn.classList.remove('lit');p.wall=false;p.combo=0;p.ncombo=0;p.scombo=0;p.rot=0;p.scyc=null;
 const L=[['idle','back to Paddy','#ffe08a',['#ffe08a','#fff']],['n_idle','NEON NINJA!',NV,[NV,NC,'#fff']],['s_draw','SAMURAI PADDY!',SR,[SR,SG,SP,'#fff']],['kn_power','KNIGHT PADDY!',KG,[KG,KBL,'#fff']],['pi_victory','PIRATE PADDY!',PT,[PT,PG,'#fff']]][f];
 act('nmorph',L[0],{say:L[1],c:L[2]});p.mfrom=from;p.blend=0;p.vx*=.3;
 waves.push({x:p.x,y:p.y,r:10,l:1,big:true});puffShadow(p.x,p.y);spark(p.x,p.y-70,26,L[3],380);shake=8;
 if(f===2){kanjiFx('侍','SAMURAI','#c8102e');petals(p.x,p.y-80,24,1)}if(f===3){crest(p.x,p.y-150,.9);clang()}if(f===4){splash(p.x,GROUND,30,1);parrot('AHOY!');coinBurst(p.x,p.y-100,8);splashS()}morphStrike()}
// a form switch starts every chain fresh: no half-finished link, tail count or buffered token carries over
function formReset(){p.utn=0;p.utT=0;p.ut=null;p.ucT=0;p.lk=null;p.lunged=false;LK.on=false;LK.seq='';LK.n=0;LK.buf=null;LK.dead=false;LK.op=null;LK.beat=false;if(typeof lastTokT!=='undefined')lastTokT=-9}
function cycleForm(){setForm(p.morphWait?(p.morphWait.f+1)%5:(FORM()+1)%5)}
// ---- stun (bark) ----
function stunMe(dir){p.state='stun';p.t=0;acted=true;setAnim(fa('hurt'),true);p.vx=dir*170;say('WOOF! (dizzy)','#ffe0a0')}
// ===================== THE ARMOURED ROTTWEILER =====================
// weak, slow, juggle-friendly. Moves: big telegraphed punch, bite, bark (tiny stun). Goofs off when you're not fighting him.
function dAnim(d,a){if(d.anim!==a){const cf=(FR[d.anim]||[])[d.fi];if(cf){d.prevF=cf;d.prevFs=d.fs;d.blend=.12}d.anim=a;d.ft=0;d.fi=0}}
function dSet(d,st,a){if(d.st!==st){d.st=st;d.t=0}if(a)dAnim(d,a)}
function dogHit(d,move,air){d.aggro=7;d.hitT=now;d.bub=null;if(!d.alive)return;d.st=air||d.vy<-200?'air':'hurt';d.t=0;d.cool=Math.max(d.cool,1.5)}
function dogStrike(d,dmg,kind){if(p.inv>0||CINE.includes(p.state)||['respawn','nmorph','stun','lk'].includes(p.state))return false;const dir=Math.sign(p.x-d.x)||-1;
 if(p.state==='sparry'||p.state==='kntail'){const kn=p.state==='kntail';p.face=d.x>p.x?1:-1;if(p.t<.25){d.stun=1.3;dSet(d,'hurt','r_hurt');d.vx=-dir*260;d.cool=2.6;kn?knRiposte(true):sRiposte(true,d)}else{say('BLOCKED!','#cfe3ff');if(kn)clang();p.vx=dir*220;spark(p.x-dir*40,p.y-80,12,['#cfe3ff','#fff'],260);shake=Math.max(shake,5)}return true}
 if(kind==='bark'){stunMe(dir);return true}
 comboEnd(true);p.hp=Math.max(0,p.hp-dmg);if(p.hp<=.01){p.hp=3;p.wall=false;loseLife();return true}
 p.wall=false;p.rot=0;act('hurt',fa('hurt'),{say:kind==='bite'?'NIBBLED!':'BONK!',c:'#ff9a9a'});p.vy=-300;p.vx=dir*240;p.ground=false;p.inv=1.1;shake=Math.max(shake,6);return true}
function startKO(d){d.alive=false;dSet(d,'ko','r_ko');d.vx=0;d.bub={t:'K.O.!',l:1.3,c:'#ffe14d'};say('K.O.!! (he\'ll be back)','#ffe14d',true);spark(d.x,d.y-60,18,['#ffe14d','#fff'],300)}
function updKO(d,dt){const t=d.t;
 if(d.st==='ko'){dAnim(d,'r_ko');if(t>2)  {dSet(d,'sit','r_sit');d.bub={t:'?',l:1.4,c:'#fff'}}}
 else if(d.st==='sit'){if(t>1.4){dSet(d,'wag','r_wag');d.bub={t:'♥',l:1.2,c:'#ff6f9f'}}}
 else if(d.st==='wag'){d.hp=Math.min(d.max,d.hp+d.max*dt/1.2);if(t>1.3){d.hp=d.max;d.alive=true;dSet(d,'idle','r_idle');d.cool=1.6;d.aggro=0;spark(d.x,d.y-120,12,['#ffe14d','#fff'],250)}}
 else dSet(d,'ko','r_ko')}
const SILLY={sniff:['r_sniff',2.4,'sniff sniff…'],scratch:['r_scratch',2,'scritch scritch'],chase:['r_chase',2.6,'tail!! TAIL!!'],howl:['r_howl',2.2,'AWOOOOO~ ♪'],yawn:['r_yawn',2,'*BIG YAWN*']};
function goSilly(d,k){const ks=Object.keys(SILLY),s=SILLY[k||ks[Math.floor(Math.random()*ks.length)]];dSet(d,k||Object.keys(SILLY).find(q=>SILLY[q]===s),s[0]);d.bub={t:s[2],l:1.6,c:'#fff'}}
function dogAttackHit(d,reach,dmg,kind){const rel=(p.x-d.x)*d.face;if(rel>-60&&rel<reach&&p.y>d.y-400&&p.y<d.y+30)dogStrike(d,dmg,kind)}
function updDog(d,dt){
 d.t+=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.cool-=dt;d.stun-=dt;d.aggro-=dt;d.blend-=dt;d.hpShow+=(d.hp-d.hpShow)*Math.min(1,dt*5);if(d.bub){d.bub.l-=dt;if(d.bub.l<=0)d.bub=null}
 d.fs+=(d.face-d.fs)*Math.min(1,dt*12);
 const held=CINE.includes(p.state)&&p.grab===d;
 const dIdle=now-(d.lastHitT||-9);if(d.y<GROUND-25&&dIdle>.5&&d.fl>0&&!(p.state==='lkult'||CINE.includes(p.state)))d.fl=0;d.fl-=dt;d.vy+=(d.fl>0?420:dIdle>.9&&d.y<GROUND-25?2300:1700)*dt;if(d.fl>0)d.vx*=Math.pow(.3,dt);d.x+=d.vx*dt;d.y+=d.vy*dt;
 if(d.x<LW+110){d.x=LW+110;d.vx=Math.abs(d.vx)*.5}if(d.x>WALL_X-110){d.x=WALL_X-110;d.vx=-Math.abs(d.vx)*.5}if(d.y<-90000)d.y=-90000;
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
  case 'punch': if(t<.85)dAnim(d,'r_wind');else if(t<1.05){dAnim(d,'r_punch');d.x+=d.face*200*dt;if(t>.95&&!d.done){d.done=true;dogAttackHit(d,265,.5,'punch');shake=Math.max(shake,4)}}
   else if(t<1.5)dAnim(d,'r_follow');else{dSet(d,'idle','r_idle');d.cool=2.3+Math.random()*1.3;if(Math.random()<.2)goSilly(d,Math.random()<.5?'sniff':'scratch')}break;
  case 'bite': if(t<.55)dAnim(d,'r_lick');else if(t<.8){dAnim(d,'r_bite');d.x+=d.face*300*dt;if(t>.65&&!d.done){d.done=true;dogAttackHit(d,215,.34,'bite');d.bub={t:'CHOMP!',l:.7,c:'#fff'}}}
   else if(t>1.15){dSet(d,'idle','r_idle');d.cool=2.2+Math.random()*1.2}break;
  case 'bark': if(t<.6)dAnim(d,'r_inhale');else{dAnim(d,'r_bark');if(!d.done){d.done=true;d.bub={t:'WOOF!',l:.8,c:'#fff'};dWaves.push({x:d.x+d.face*130,y:d.y-250,r:20,l:1,dir:d.face,d,hit:false});shake=Math.max(shake,3)}}
   if(t>1.25){dSet(d,'idle','r_idle');d.cool=2.4+Math.random()*1.2}break;
  case 'sniff':case 'scratch':case 'chase':case 'howl':case 'yawn':{const s=SILLY[d.st];if(d.st==='chase'){if(t%.3<dt)d.face*=-1;d.x+=Math.sin(t*7)*60*dt}
   if(t>s[1]||(d.aggro>1&&t>.4)){dSet(d,'idle','r_idle');d.cool=Math.max(d.cool,1)}}break;
  default:{const engaged=pOK&&adx<560&&d.aggro>0;
   if(engaged){if(adx>30)d.face=dx>0?1:-1;
    if(adx>215){dSet(d,'walk','r_walk');d.x+=Math.sign(dx)*80*dt}else dSet(d,'idle','r_idle');
    if(d.cool<=0&&adx<400&&p.y>GROUND-300){const r=Math.random();d.done=false;
     if(adx<255&&r<.45){dSet(d,'punch','r_wind');d.bub={t:'!',l:.85,c:'#ff4040'}}else if(adx<215&&r<.75){dSet(d,'bite','r_lick');d.bub={t:'!',l:.55,c:'#ff4040'}}else{dSet(d,'bark','r_inhale');d.bub={t:'!',l:.6,c:'#ff4040'}}}}
   else{dSet(d,'idle','r_idle');if(t>2.5+(d.idleR||0)){d.idleR=Math.random()*2;goSilly(d)}}}}
 step()}
function updDummies(dt){for(const d of dummies)updDog(d,dt);
 for(const w of dWaves){w.r+=dt*650;w.l=1-w.r/330;if(!w.hit){const rx=(p.x-w.x)*w.dir;if(rx>-30&&Math.abs(Math.abs(p.x-w.x)-w.r)<45&&p.y>GROUND-80){w.hit=true;dogStrike(w.d,0,'bark')}}}
 for(let i=dWaves.length-1;i>=0;i--)if(dWaves[i].l<=0)dWaves.splice(i,1)}
function drawDogFrame(f,fs,alpha){f=readyFrame(f,1);const im=f&&IMG[f.f];if(!im)return;ctx.save();if(alpha!=null)ctx.globalAlpha*=alpha;ctx.scale(-fs*DSC,DSC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}
function drawDummies(){for(const d of dummies){const fr=FR[d.anim]||FR.r_idle;if(!fr)continue;const f=fr[Math.min(d.fi,fr.length-1)],lying=['ko','sit','wag','flat'].includes(d.st),H=lying?210:d.h;
 const hg=Math.max(0,GROUND-d.y);ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(d.x,GROUND+3,115*Math.max(.35,1-hg/500),13,0,0,6.28);ctx.fill();
 const tele=(d.st==='punch'&&d.t<.85)||(d.st==='bite'&&d.t<.55)||(d.st==='bark'&&d.t<.6);
 if(tele){const u=Math.sin(now*22)*.5+.5;ctx.save();const gx=d.x+d.face*(d.st==='punch'?90:105),gy=d.y-(d.st==='punch'?260:300),g=ctx.createRadialGradient(gx,gy,4,gx,gy,105+u*25);
  g.addColorStop(0,`rgba(255,40,30,${.45+.3*u})`);g.addColorStop(.6,`rgba(255,60,40,${.18+.1*u})`);g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,130,0,6.283);ctx.fill();ctx.restore()}
 ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);const s=1+d.sq*.12;ctx.scale(1/s,s);
 if(d.blend>0&&d.prevF){drawDogFrame(d.prevF,d.prevFs||d.fs,d.blend/.12);drawDogFrame(f,d.fs,1-.5*d.blend/.12)}else drawDogFrame(f,d.fs);
 if(d.flash>0){ctx.globalCompositeOperation='lighter';drawDogFrame(f,d.fs,Math.min(1,d.flash/.12)*.55);ctx.globalCompositeOperation='source-over'}
 ctx.restore();
 // dizzy stars (KO / stunned)
 if(d.st==='ko'||(d.stun>0&&d.alive)){ctx.save();for(let i=0;i<3;i++){const a=now*5+i*2.09,x=d.x+Math.cos(a)*62,y=d.y-H-10+Math.sin(a)*10;ctx.fillStyle=i%2?'#ffe14d':'#fff';ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?4:10,b=k*Math.PI/5+now*3;ctx.lineTo(x+Math.cos(b)*r,y+Math.sin(b)*r)}ctx.closePath();ctx.fill()}ctx.restore()}
 // health bar
 const by=d.y-H-24; // (his big health bar lives in the HUD now)
 r12DogMarks(d,H);
 // speech bubble
 if(d.bub){const b=d.bub,a=Math.min(1,b.l*3),big=b.t.length<=2;fancy(b.t,d.x+d.face*(big?120:150),d.y-H+(big?40:20)+(d.alive?0:-20),big?48:24,0,1,a,b.c)}}}
// ---- update + draw hooks ----
let formW=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const hx2=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),toHex=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
function formBase(){const B=[['#9fd6f7','#d8f0ff'],['#b4a4ea','#ebe3ff'],['#f3c7cf','#fff0f2'],['#a9c4ef','#fff3d6'],['#7fd3e6','#e6fbff'],['#e8a08a','#fff0e0'],['#c8f0b0','#fffbe0'],['#8fd0f0','#e8faff'],['#f0a0a0','#fff0e0'],['#b8a0f0','#efe6ff'],['#a090e0','#e6e0ff'],['#8fb0e8','#e6f0ff'],['#e8d080','#fff8e0'],['#f0a070','#fff0d8'],['#b0e4f8','#f4fcff'],['#f0b890','#e8fbff'],['#80d8d0','#e6fffb'],['#d8c080','#f0fff8'],['#e8b070','#fff2dc']];return [0,1].map(j=>toHex([0,1,2].map(c=>B.reduce((s,b,i)=>s+hx2(b[j])[c]*formW[i],0))))}
function r8Update(dt){
 p.scT=(p.scT||0)-dt;if(p.scT<=0&&!SST.includes(p.state))p.scombo=0;
 const tw=formW.map((_,i)=>FORM()===i?1:0);for(let i=0;i<formW.length;i++)formW[i]+=(tw[i]-formW[i])*Math.min(1,dt*3);
 if(kanji){kanji.t+=dt;if(kanji.t>1.45)kanji=null}
 if(ninjaBtn){const ic=FORM()>=4&&window.UNLx?(()=>{const L=[4];for(let u=1;u<UF.length;u++)if(UNLx.ok(u))L.push(4+u);const n=L[(L.indexOf(FORM())+1)%L.length];return n>4?UF[n-4].ico:'🐱'})():['🥷','⚔️','🛡️','⚓','🐱'][FORM()];if(ninjaBtn.textContent!==ic)ninjaBtn.textContent=ic;ninjaBtn.classList.toggle('lit',FORM()>0)}
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

// ===================== ROUND 9: OPENER COMBOS · LINKS ON THE BEAT · ULTIMATES · PRACTICE · SMOOTHER KITTY + NINJA =====================
// smoother locomotion: new 8-frame runs, 6-frame jump arcs (rise -> apex -> fall -> land) for Kitty and Ninja
Object.assign(A,{run:['k_run',null,15,1],jump:['k_jump',[1,2],9,0],apex:['k_jump',[3],1,0],fall:['k_jump',[4],1,0],land:['k_jump',[5],1,0],
 n_run:['nk_run',null,16,1],n_rise:['nk_jump',[1,2],9,0],n_apex:['nk_jump',[3],1,0],n_fall:['nk_jump',[4],1,0],n_land:['nk_jump',[5],1,0],
 k_spin:['k_spin',null,17,0],k_meow:['k_meow',[1,2,3,4],11,0],k_lunge:['k_blink',[1,2,3,4],15,0],k_blink:['k_blink',[2,3,4,5],15,0],
 k_ultA:['k_ult',[0],1,0],k_ultB:['k_ult',[1,2],7,0],k_ultC:['k_ult',[3],1,0],k_ultD:['k_ult',[4],1,0],k_ultE:['k_ult',[5],1,0],
 nk_spin:['nk_spin',null,17,0],nk_meow:['nk_meow',[1,2,3,4],11,0],nk_lunge:['nk_blink',[1,2,3,4],15,0],nk_blink:['nk_blink',[2,3,4,5],15,0],
 nk_ultA:['nk_ult',[0],1,0],nk_ultB:['nk_ult',[1,2],7,0],nk_ultC:['nk_ult',[3],1,0],nk_ultD:['nk_ult',[4],1,0],nk_ultE:['nk_ult',[5],1,0],
 s_spin:['s_combo_b',[2,3,4],14,0],s_kiai:['s_parry_charge',[4,5],8,0],s_cut:['s_combo_a',[2,3],14,0]});
ESSENTIAL.push('apex','n_rise','n_fall','n_run');
const LKW=.24,LKD=.62; // link window opens at LKW (ring goes green, beat chime) and the move lets go at LKD
// per form: what each button does as a LINK, and its upgraded version when you press the same button twice in a row
const LKF=[
 {col:'#ff9ad5',col2:'#ffe14d',C:{nm:'POUNCE CLAW!',a:'k_lunge'},CC:{nm:'SKY SCRATCH!',a:'k_lunge'},T:{nm:'TAIL SPIN!',a:'k_spin'},TT:{nm:'TAIL TORNADO!',a:'k_spin'},
  M:{nm:'MEOW BLAST!',a:'k_meow'},MM:{nm:'MEGA MEOW!',a:'k_meow'},B:{nm:'BLINK SLASH!',a:'k_blink'},BB:{nm:'DOUBLE BLINK!',a:'k_blink'}},
 {col:NV,col2:NC,C:{nm:'VOLT FANG!',a:'nk_lunge'},CC:{nm:'CRESCENT FANG!',a:'nk_lunge'},T:{nm:'SHURIKEN SPIN!',a:'nk_spin'},TT:{nm:'CYCLONE KICK!',a:'nk_spin'},
  M:{nm:'NEON SCREECH!',a:'nk_meow'},MM:{nm:'SONIC SCREECH!',a:'nk_meow'},B:{nm:'NEON BLINK CUT!',a:'nk_blink'},BB:{nm:'PHANTOM CROSS!',a:'nk_blink'}},
 {col:SR,col2:SP,C:{nm:'RISING CUT!',a:'s_h4'},CC:{nm:'HEAVEN CUT!',a:'s_h4'},T:{nm:'SHEATH SPIN!',a:'s_spin'},TT:{nm:'TORNADO SHEATH!',a:'s_spin'},
  M:{nm:'KIAI SHOUT!',a:'s_kiai'},MM:{nm:'THUNDER KIAI!',a:'s_kiai'},B:{nm:'FLASH STEP!',a:'s_dash'},BB:{nm:'TWIN FLASH!',a:'s_dash'}}];
// named strings (full button sequence, opener included). fold = an older combo string folded into the new system. ult = the form's ULTIMATE
const ROUTES=[
 [{k:'CCCB',nm:'SHADOW POUNCE!',tip:'blinks behind him and X-slashes'},{k:'CCCM',nm:'MEOW CANNON!',tip:'point-blank sound blast'},
  {k:'CCCTT',nm:'TAIL SPIN SLAM!',fold:'CCCTT',tip:'spin, then a rising tornado and slam'},{k:'TTTMB',nm:'BOOM & ZOOM!',tip:'meow him up, blink up after him'},
  {k:'CCCCCT',nm:'COMET TAIL!',tip:'5 timed claws, then a blazing tail spin'},{k:'TTTCCC',nm:'CLAW CYCLONE!',fold:'TTTCCC',tip:'tail launch into a claw whirlwind'},
  {k:'CCCMBBTT',nm:'PURR-NADO!',tip:'blast, zig-zag blinks, tail tornado juggle'},{k:'CCCTMTMC',nm:'PURRFECT CATACLYSM',ult:1,tip:'ULTIMATE: leap, mega dive, giant paw quake'}],
 [{k:'CCCB',nm:'NEON GHOST CUT!',tip:'teleports through him with a neon cut'},{k:'CCCM',nm:'NEON SHOCKWAVE!',tip:'neon sound-ring blast'},
  {k:'CCCTT',nm:'SHADOW CLONE BARRAGE!',fold:'CCCTT',tip:'shuriken spin, then clones throw stars'},{k:'TTTBB',nm:'STARFALL STEP!',tip:'star volley, then two blink cuts'},
  {k:'CCCCCB',nm:'LIGHTNING ZIGZAG!',tip:'5 timed slashes, then a blink cut'},{k:'TTTCCC',nm:'NINJA TORNADO!',fold:'TTTCCC',tip:'stars into a neon tornado'},
  {k:'CCCMBBTT',nm:'PHANTOM CYCLONE!',tip:'screech, phantom cross, cyclone kick juggle'},{k:'TTTCBMCM',nm:'NEON MOONFALL',ult:1,tip:'ULTIMATE: moonlit flip, neon zig-zags, crater dive'}],
 [{k:'CCCB',nm:'PHANTOM IAI!',kj:'一閃',tip:'flash-step straight through him'},{k:'CCCM',nm:'KIAI THUNDER!',kj:'気',tip:'battle-shout shockwave'},
  {k:'CCCTT',nm:'PARRY BREAKER!',fold:'CCCTT',tip:'sheath spin into a guard-breaking slam'},{k:'CCCCCB',nm:'CRESCENT FLASH!',kj:'月',tip:'5 timed cuts, then a moonlit flash-step'},
  {k:'TTTCCC',nm:'SAKURA CYCLONE!',fold:'TTTCCC',tip:'three guards into a petal whirlwind'},{k:'CCCMBBTT',nm:'SAKURA TEMPEST!',kj:'桜',tip:'kiai, twin flash, tornado sheath juggle'},
  {k:'CCCCCMTM',nm:'HEAVEN SPLITTER',ult:1,kj:'必殺',tip:'ULTIMATE: still world, one flash, a cut from the sky'}]];
const LK={on:false,seq:'',n:0,buf:null,dead:false,beat:false,op:null,miss:0,lastSeq:'',lastT:-9,fail:0,flash:null};
const R9={rings:[],cracks:[],paws:[],moon:null,beam:null,confetti:[]};
const FORM=()=>p.uf?4+p.uf:p.xf?p.xf:p.sam?2:p.ninja?1:0;
Object.assign(NAMES,{lkC:'',lkC2:'',lkT:'',lkT2:'',lkM:'',lkM2:'',lkB:'',lkB2:'',lkR:'',lkU:'',lkUfin:''});
Object.assign(KB,{lkC:[170,-480,.4,.05],lkC2:[110,-620,.5,.06],lkT:[40,-300,.4,.025],lkT2:[30,-560,.5,.04],lkM:[380,-400,.3,.08],lkM2:[200,-700,.55,.1],
 lkB:[-40,-480,.4,.06],lkB2:[40,-640,.45,.07],lkR:[260,-900,.5,.12],lkU:[0,-120,.6,.02],lkUfin:[260,-2500,1,.22]});
CINE.push('lkult');
function beat(f,v){if(muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.05,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.12);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.14)}catch(e){}}
function boom(){if(muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';
 o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(38,t+.6);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.8);
 o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.85)}catch(e){}}
// ---- where are we in an opener? (3+ timed Claws, or 3 Tails in rhythm) ----
function openerNow(){const S=p.state;
 if(S==='claw'&&p.combo>=3&&!p.miss)return{run:'C'.repeat(Math.min(p.combo,8)),W:.2,E:.46};
 if(/^n[1-7]$/.test(S)&&p.ncombo>=3&&!p.miss)return{run:'C'.repeat(p.ncombo),W:.16,E:.42};
 if(/^s[1-7]$/.test(S)&&p.scombo>=3&&!p.miss)return{run:'C'.repeat(p.scombo),W:.18,E:.44};
 if(p.xf&&/^(kn|pi)[1-7]$/.test(S)&&p.xcombo>=3&&!p.miss&&p.xhit){const X=XF[p.xf];return{run:'C'.repeat(p.xcombo),W:X.W,E:X.E}}
 if(TST.has(S)&&now-lastTokT<.75){let n=0;for(let i=TOK.length-1;i>=0&&TOK[i].c==='T';i--)n++;
  if(n>=3)return{run:'TTT',W:S==='nthrow'?.12:.16,E:S==='nthrow'?.3:S==='kntail'?.48:S==='pitail'?.42:.45}}return null}
function lkTarget(){const d=nTarget(900);return d&&d.alive?d:null}
function lkHit(kb,dir){const g=p.lk&&p.lk.tg&&p.lk.tg.alive?p.lk.tg:null;if(!g)return false;if(Math.abs(g.x-p.x)>300||Math.abs(g.y-p.y)>330)return false;
 g.hp=Math.max(2,g.hp);NAMES[kb]=p.lk.nm||'LINK!';hitDummy(g,kb,dir||p.face);g.vy=Math.max(g.vy,KB[kb][1]);if(g.y<GROUND-420)g.vy=Math.max(g.vy,-200);return true}
function lkSay(t,c){say(t,c,true)}
// ---- one LINK move ----
function lkStart(L){if(FORM()>=3)return xLkStart(L);const f=FORM(),fl=LKF[f],rep=LK.n>0&&LK.seq.slice(-1)===L;
 LK.seq+=L;LK.n++;LK.buf=null;LK.beat=false;LK.on=true;lastTokT=-9;LK.lastSeq=LK.seq;LK.lastT=now;
 const route=ROUTES[f].find(r=>r.k===LK.seq);pracCheck(LK.seq);
 if(route&&route.ult){ultStart(f,route);return}
 const mv=fl[rep?L+L:L],tg=lkTarget();
 act('lk',mv.a);p.lk={L,rep,route,tg,nm:mv.nm};p.rot=0;p.vx=0;C.atk++;extend();
 if(!route)lkSay(mv.nm,L==='C'?fl.col2:fl.col);popNum(LK.seq.length,fl.col);beat(520+LK.n*70,.04);
 if(L==='B')lkBlink(tg,f,false);
 if(L==='M'){const big=rep;R9.rings.push({x:p.x+p.face*60,y:p.y-75,r:20,vr:big?1100:800,l:1,col:fl.col,col2:fl.col2,w:big?16:10,f,face:p.face});
  if(f===0){meowSound(big?1:.5);bubble={t:big?'MEGA MEOW!!':'MEOW!',l:1,big}}else meowSound(big?.8:.3);
  if(f===2)petals(p.x+p.face*60,p.y-80,big?30:14,1);shake=Math.max(shake,big?10:6)}
 if(L==='T'&&rep){p.vy=-480;p.ground=false;p.jumps=Math.max(p.jumps,1)}
 if(route)routeFx(f,route)}
function lkBlink(tg,f,back){const fx0=p.x,fy0=p.y;puffShadow(p.x,p.y);
 if(tg){const side=back?-p.face:p.face;p.x=clampX(tg.x+side*90);p.face=tg.x>p.x?1:-1;if(tg.y<GROUND-60){p.y=Math.min(floorAt(p.x),tg.y+40);p.ground=false;p.vy=-120}}
 else p.x=clampX(p.x+p.face*260);
 const col=LKF[f].col;for(let k=1;k<=6;k++)ghosts.push({x:fx0+(p.x-fx0)*k/7,y:fy0+(p.y-fy0)*k/7,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.1+k*.035,blue:1});
 if(f===2)sLine(fx0,fy0-72,p.x,p.y-72,SW,.45,10);else if(f===1)sLine(fx0,fy0-70,p.x,p.y-70,NC,.4,8);
 puffShadow(p.x,p.y);shake=Math.max(shake,5)}
function lkState(dt){if(FORM()>=3)return xLkState(dt);const q=p.lk;if(!q){p.state='normal';return}const t=p.t,f=FORM(),fl=LKF[f],tg=q.tg&&q.tg.alive?q.tg:null,at=T=>t>=T&&t-dt<T;
 p.hang=Math.max(p.hang,.1);if(!p.ground&&!(q.L==='T'&&q.rep&&t<.3))p.vy=Math.min(p.vy,160);
 if(tg&&q.L!=='B'&&t<.12){const want=tg.x-p.face*(q.L==='M'?150:q.L==='T'?70:95);if(Math.abs(tg.x-p.x)>30)p.face=tg.x>p.x?1:-1;p.x+=(want-p.x)*Math.min(1,dt*16);p.vx=0;
  if(tg.y<GROUND-70&&q.L!=='M'){const wy=Math.min(floorAt(p.x),tg.y+45);p.y+=(wy-p.y)*Math.min(1,dt*14);p.ground=false;p.vy=Math.min(p.vy,0)}
  if(Math.abs(want-p.x)>40&&t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.2,blue:1})}
 else p.vx*=Math.pow(.02,dt);
 const dir=tg?Math.sign(tg.x-p.x)||p.face:p.face;
 switch(q.L){
  case 'C': if(at(.04)){slash(q.rep?'rise':'cross',fl.col2,{lvl:6,scale:1.25,col2:fl.col,dx:80});spark(p.x+p.face*80,p.y-70,14,[fl.col,fl.col2,'#fff'],320);if(f===2)petals(p.x+p.face*80,p.y-80,8,1)}
   if(at(.08))lkHit(q.rep?'lkC2':'lkC',dir);if(q.rep&&at(.1)){p.vy=-450;p.ground=false}if(q.rep&&at(.17)){slash('up',fl.col,{lvl:7,scale:1.3,dx:70});lkHit('lkC2',dir)}break;
  case 'T': if(at(.05)||at(.13)||at(.21)||(q.rep&&at(.29))){lkHit(q.rep?'lkT2':'lkT',dir);spark(p.x+Math.cos(t*30)*90,p.y-40,8,[fl.col,fl.col2,'#fff'],260);if(f===1&&at(.13)){for(let i=0;i<8;i++){const a=i/8*6.283;stars.push({x:p.x,y:p.y-60,vx:Math.cos(a)*700,vy:Math.sin(a)*700,r:0,l:.45,hit:new Set()})}}if(f===2)petals(p.x,p.y-50,5,1)}break;
  case 'M': if(at(.1)){lkHit(q.rep?'lkM2':'lkM',p.face);if(f===2&&!q.route)kanjiFx('気','KIAI','#c8102e')}break;
  case 'B': if(at(.06)){slash('cross',fl.col,{lvl:7,scale:1.35,col2:fl.col2,dx:60});lkHit(q.rep?'lkB2':'lkB',dir)}
   if(q.rep&&at(.15)){lkBlink(tg,f,true);slash('cross',fl.col2,{lvl:7,scale:1.4,col2:'#fff',dx:60})}if(q.rep&&at(.19))lkHit('lkB2',tg?Math.sign(tg.x-p.x)||p.face:p.face);break;}
 if(!LK.beat&&t>=LKW){LK.beat=true;if(!LK.dead)beat(880+LK.n*60,.035)}
 if(LK.buf&&t>=LKW){const b=LK.buf;lkStart(b);return}
 if(t>LKD)lkEnd()}
function lkEnd(){if(p.state==='lk'){p.state='normal';p.lk=null}if(LK.n>=2&&!LK.dead)say(LK.n+'-LINK CHAIN!',LKF[FORM()].col2);
 LK.on=false;LK.seq='';LK.n=0;LK.buf=null;LK.dead=false;LK.op=null}
function lkDrop(why){LK.dead=true;LK.flash={t:why,l:1};lkSay(why,'#d8d8e8');beat(220,.03);if(PR.on&&PR.prog>0&&!PR.done)PR.fail=1}
// ---- named strings: a burst of extra flair + a title card ----
function routeFx(f,r){const fl=LKF[f];texts.length=0;
 if(r.fold){const s=STR.find(x=>x.k===r.fold);if(s){strFire(s);p.pendStr=null}}else card(r.nm,r.k.split('').join(' '),fl.col);
 slowT=Math.max(slowT,.22);flashT=Math.max(flashT,.12);hitstop=Math.max(hitstop,.07);shake=Math.max(shake,14);
 const tg=lkTarget(),x=tg?tg.x:p.x+p.face*100,y=tg?tg.y-80:p.y-80;
 for(let i=0;i<3;i++)R9.rings.push({x,y,r:10+i*24,vr:700,l:1,col:i%2?fl.col2:fl.col,w:9,f,face:0});
 if(f===0)for(let i=0;i<14;i++){const a=i/14*6.283;R9.confetti.push({x,y,vx:Math.cos(a)*380,vy:Math.sin(a)*380-120,l:1.1,c:i%3?'#ff9ad5':'#ffe14d',heart:i%2})}
 if(f===1)R9.beam={x,l:.6,col:NC};
 if(f===2){petals(x,y,36,1);if(r.kj)kanjiFx(r.kj,r.nm.replace('!',''),'#c8102e')}
 if(f>=3)xRouteFx(f,r,x,y);
 if(tg&&p.lk&&!r.fold){tg.hp=Math.max(2,tg.hp);NAMES.lkR=r.nm;hitDummy(tg,'lkR',Math.sign(tg.x-p.x)||p.face);tg.vy=Math.max(tg.vy,tg.y<GROUND-300?-250:-650)}}
// ---- ULTIMATES (one per form) ----
function ultStart(f,r){if(f>=3)return xUltStart(f,r);const tg=lkTarget();act('lkult',['k_ultA','nk_ultA','s_stance'][f]);p.ult={f,r,tg,boom:false,hits:0,k:0,x0:p.x};p.vx=0;p.vy=0;p.rot=0;NAMES.lkU=['PURR!','NEON!','SLASH!'][f];NAMES.lkUfin=f===2?'ZAN!!':'KA-BOOM!!';
 LK.on=false;LK.seq='';LK.n=0;LK.buf=null;cineGo(1.32,f===1?.62:.45);slowT=.12;flashT=.15;shake=10;beat(1320,.06);
 lkSay(f===2?'必殺…':f===1?'NEON…':'PURRR…',LKF[f].col2);if(f===2)kanjiFx('必殺','HISSATSU · FINISHING SECRET','#c8102e');if(f===1)R9.moon={l:0,on:1};
 for(let i=0;i<4;i++)waves.push({x:p.x,y:p.y-30*i,r:10+i*20,l:1,big:true})}
function ultState(dt){const u=p.ult;if(!u){p.state='normal';return}if(u.f>=3)return xUltState(dt);const t=p.t,f=u.f,fl=LKF[f],g=u.tg&&u.tg.alive?u.tg:null,at=T=>t>=T&&t-dt<T;p.rot=0;p.vx=0;p.vy=0;
 const gx=g?g.x:clampX(p.x+p.face*160),A3=['k_ult','nk_ult',null][f];
 if(g&&!u.boom){g.vx=0;g.vy=0;g.fl=.6;g.hp=Math.max(3,g.hp);const gy=t<1?GROUND-150-Math.min(1,t/1)*90:GROUND-40;g.y+=(gy-g.y)*Math.min(1,dt*(t<1?5:16));g.x+=(gx-g.x)*.1}
 const ease=x=>x*x*(3-2*x);
 if(t<.55){ // wind-up: power gathers in (and he glides down to the ground first)
  p.y+=(GROUND-p.y)*Math.min(1,dt*9);p.ground=p.y>GROUND-2;
  if(t%.03<dt){const a=Math.random()*6.283,R=150;sparks.push({x:p.x+Math.cos(a)*R,y:p.y-70+Math.sin(a)*R,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.45,c:Math.random()<.5?fl.col:fl.col2})}
  if(f===2&&t%.05<dt)SFX.push({t:'petal',x:p.x+(Math.random()-.5)*400,y:p.y-200-Math.random()*100,vx:0,vy:30,r:0,vr:2,l:1,s:.9,c:'#ffc1dc',pull:1})}
 else if(t<1.05){const u2=ease((t-.55)/.5);
  if(f<2){setAnim(f?'nk_ultB':'k_ultB');p.y+=((GROUND-u2*330)-p.y)*Math.min(1,dt*14);p.x+=((gx-p.face*60)-p.x)*Math.min(1,dt*6);if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.25,blue:1});
   u.k-=dt;if(g&&u.k<=0){u.k=.09;C.atk++;g.hp=Math.max(3,g.hp);hitDummy(g,'lkU',p.face);g.vx=0;g.vy=0;
    if(f===1){const fx0=p.x,fy0=p.y;const a=u.hits*2.3;p.x=clampX(gx+Math.cos(a)*120);p.y=Math.min(GROUND,GROUND-u2*330+Math.sin(a)*60);p.face=gx>p.x?1:-1;sLine(fx0,fy0-70,p.x,p.y-70,u.hits%2?NC:NV,.35,8);puffShadow(p.x,p.y)}
    else spark(gx,g.y-80,10,['#ff9ad5','#ffe14d','#fff'],300);u.hits++}}
  else{ // samurai: one flash straight through, then he rises for the cut from heaven
   if(at(.56)){setAnim('s_dash',true);const x0=p.x;p.x=clampX(gx+p.face*150);sLine(x0,p.y-72,p.x,p.y-72,SW,.6,14);sLine(x0,p.y-72,p.x,p.y-72,SR,.5,5);for(let k=1;k<=6;k++)ghosts.push({x:x0+(p.x-x0)*k/7,y:p.y,f:(FR.s_dash||FR.s_idle)[0],face:p.face,l:.1+k*.04,blue:1});
    if(g){hitDummy(g,'lkU',p.face);g.vx=0;g.vy=0}kanjiFx('一閃','ONE FLASH','#c8102e');shake=12;flashT=.12}
   if(t>.75){if(p.anim!=='s_rise')setAnim('s_rise',true);p.face=gx>p.x?1:-1;const u3=ease(Math.min(1,(t-.75)/.3));p.y+=((GROUND-u3*360)-p.y)*Math.min(1,dt*14);p.x+=((gx-p.face*40)-p.x)*Math.min(1,dt*6)}}}
 else if(t<1.28){const u4=ease((t-1.05)/.23);setAnim(f===2?'s_h3':f?'nk_ultC':'k_ultC');p.y=Math.min(GROUND,p.y+((GROUND-330+u4*330)-p.y)*Math.min(1,dt*20));if(t>1.25)p.y=GROUND;p.x+=((gx-p.face*70)-p.x)*Math.min(1,dt*10);
  ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.3,blue:1});if(f===2&&at(1.06)){R9.beam={x:gx,l:1,col:SR,cut:1}}}
 else{p.y=GROUND;p.ground=true;
  if(!u.boom){u.boom=true;setAnim(f===2?'s_h3':f?'nk_ultD':'k_ultD',true);boom();const x=gx;
   if(g){g.hp=Math.min(g.hp,1);hitDummy(g,'lkUfin',p.face);g.vy=-2500;g.vx=p.face*260;g.fl=1}
   shake=42;slowT=.9;flashT=.4;hitstop=.12;cine.tz=1.12;cine.tdim=.25;cine.pillar={x,l:1.4,col:fl.col};
   R9.cracks.push(mkCrack(x,f));for(let i=0;i<6;i++)waves.push({x,y:GROUND-4+i*3,r:10+i*35,l:1,big:true});
   for(let i=0;i<4;i++)R9.rings.push({x,y:GROUND-60,r:20+i*40,vr:1400-i*150,l:1.2,col:i%2?fl.col2:fl.col,w:18-i*3,f,face:0,flat:1});
   burst(x,GROUND-60,1);burst(x,GROUND-140);
   for(let i=0;i<110;i++){const a=Math.random()*6.283,v=250+Math.random()*900;sparks.push({x,y:GROUND-60,vx:Math.cos(a)*v,vy:Math.sin(a)*v-300,l:.9,c:[fl.col,fl.col2,'#fff','#ffe14d'][i%4]})}
   for(let i=0;i<26;i++)sparks.push({x:x+(Math.random()-.5)*300,y:GROUND,vx:(Math.random()-.5)*500,vy:-300-Math.random()*700,l:.9,c:'#b98a55'});
   if(f===0){R9.paws.push({x,l:1.6});for(let i=0;i<40;i++){const a=Math.random()*6.283,v=200+Math.random()*500;R9.confetti.push({x,y:GROUND-80,vx:Math.cos(a)*v,vy:Math.sin(a)*v-300,l:1.8,c:i%3?'#ff9ad5':'#ffe14d',heart:i%2})}}
   if(f===1){R9.beam={x,l:1.3,col:NC};if(R9.moon)R9.moon.flash=1}
   if(f===2){petals(x,GROUND-100,140,1);kanjiFx('必殺','HEAVEN SPLITTER','#c8102e',{size:150})}
   card(f===2?'HEAVEN SPLITTER!!':u.r.nm+'!!',(f===2?'必殺 · ':'ULTIMATE · ')+u.r.k.split('').join(' '),fl.col)}
  if(t>1.75&&f<2&&p.anim!==(f?'nk_ultE':'k_ultE'))setAnim(f?'nk_ultE':'k_ultE');if(t>1.9&&f===2&&p.anim!=='s_calm')setAnim('s_calm');
  if(t>2.9){p.state='normal';p.ult=null;if(R9.moon)R9.moon.on=0;LK.lastT=now}}}
function mkCrack(x,f){const segs=[];for(let b=0;b<9;b++){const dir=b%2?1:-1,pts=[[x,GROUND]];let cx=x,cy=GROUND,a=(b<4?0:.25)+Math.random()*.25;
  for(let s=0;s<6;s++){cx+=dir*(18+Math.random()*28);cy+=(Math.random()-.25)*10*a+1.5;pts.push([cx,Math.min(GROUND+60,Math.max(GROUND,cy))])}segs.push(pts)}
 return {x,segs,l:3,col:LKF[f].col}}
// ---- per-frame: route inputs into links (runs before the normal move handling, so a link press never also fires its normal move) ----
const LKKEY=[['attack','C'],['tail','T'],['special','M'],['blink','B']];
function r9Pre(dt){
 for(const r of R9.rings){r.r+=r.vr*dt;r.vr*=Math.pow(.15,dt);r.l-=dt*1.6}R9.rings=R9.rings.filter(r=>r.l>0);
 for(const c of R9.cracks)c.l-=dt;R9.cracks=R9.cracks.filter(c=>c.l>0);for(const w of R9.paws)w.l-=dt;R9.paws=R9.paws.filter(w=>w.l>0);
 for(const c of R9.confetti){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=500*dt;c.vx*=Math.pow(.4,dt);c.l-=dt}R9.confetti=R9.confetti.filter(c=>c.l>0);
 if(R9.beam){R9.beam.l-=dt;if(R9.beam.l<=0)R9.beam=null}if(R9.moon){R9.moon.l+=((R9.moon.on?1:0)-R9.moon.l)*Math.min(1,dt*3);if(R9.moon.flash)R9.moon.flash=Math.max(0,R9.moon.flash-dt);if(!R9.moon.on&&R9.moon.l<.02)R9.moon=null}
 if(LK.flash){LK.flash.l-=dt;if(LK.flash.l<=0)LK.flash=null}
 pracUpdate(dt);
 if(p.state==='lkult')return;
 // the chain only lives inside its own moves (and the opener's grace window)
 if(LK.on&&p.state!=='lk')lkEnd();
 const op=openerNow();if(op){LK.op={run:op.run,W:op.W,until:now+Math.max(0,op.E-p.t)+.1,t0:now-p.t,st:p.state,miss:LK.op&&LK.op.st===p.state&&Math.abs(LK.op.t0-(now-p.t))<.01?LK.op.miss:false}}
 else if(LK.op&&(now>LK.op.until||(p.state!=='normal'&&p.state!==LK.op.st)))LK.op=null;
 let L=null,key=null;for(const [k,l] of LKKEY)if(P[k]){L=l;key=k;break}
 if(p.state==='lk'){
  if(P.jump||P.dash||P.down){lkEnd();return} // escape hatch: jump / dash / down drop the chain cleanly
  if(!L)return;delete P[key];acted=true;
  if(LK.dead)return;const t=p.t;
  if(t<LKW-.07){lkDrop('TOO EARLY!')}else if(t<LKW){LK.buf=L}else lkStart(L);return}
 if(!L||!LK.op)return;const o=LK.op;if(L===o.run[0])return; // same button = the normal chain carries on (C4, C5... / tail chain)
 if(o.miss){delete P[key];return}
 const tt=now-o.t0;delete P[key];acted=true;
 if(p.state===o.st&&tt<o.W-.07){o.miss=true;lkDrop('TOO EARLY!');return}
 LK.on=true;LK.seq=o.run;LK.n=0;LK.dead=false;LK.op=null;p.combo=0;p.ncombo=0;p.scombo=0;p.xcombo=0;p.miss=false;p.queued=false;p.pendStr=null;lkStart(L)}
// ring + beat cue for links and tail openers
const _cue0=cueInfo;cueInfo=function(){if(p.state==='lk'&&!LK.dead)return{H:LKW+.2};const o=openerNow();if(o&&o.run[0]==='T'&&!(LK.op&&LK.op.miss))return{H:o.W+.2};return _cue0()};
// ---- PRACTICE MODE (from the ? menu) ----
const PR={on:false,f:0,i:0,prog:0,done:0,fail:0,idle:0,best:0,clears:0};
function practice(f,i){PR.on=true;PR.f=f;PR.i=i;PR.prog=0;PR.done=0;PR.fail=0;PR.clears=0;if(FORM()!==f)setForm(f);document.body.classList.add('prac');
 say('PRACTICE: '+ROUTES[f][i].nm.replace(/!+$/,''),'#ffe14d',true)}
function pracStop(){PR.on=false;document.body.classList.remove('prac')}
function liveSeq(){if(LK.on)return LK.seq;const S=p.state;if(S==='claw')return 'C'.repeat(p.combo);if(/^n[1-8]$/.test(S))return 'C'.repeat(p.ncombo);if(/^s[1-7]$/.test(S))return 'C'.repeat(p.scombo);if(/^(kn|pi)[1-7]$/.test(S))return 'C'.repeat(p.xcombo);
 if(TST.has(S)&&now-lastTokT<.75){let n=0;for(let i=TOK.length-1;i>=0&&TOK[i].c==='T';i--)n++;return 'T'.repeat(Math.min(3,n))}return ''}
function pracCheck(seq){if(!PR.on)return;const k=ROUTES[PR.f][PR.i].k;if(seq===k){PR.done=1.8;PR.prog=k.length;PR.clears++;beat(1568,.06);setTimeout(()=>beat(2093,.06),90);
 for(let i=0;i<30;i++){const a=Math.random()*6.283,v=200+Math.random()*300;R9.confetti.push({x:VW/2+(Math.random()-.5)*300,y:-camY+120,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1.6,c:['#7fffd4','#ffe14d','#ff9ad5'][i%3],heart:0,hud:1})}}}
function pracUpdate(dt){if(!PR.on)return;for(const d of dummies)if(d.alive&&!['punch','bite','bark'].includes(d.st))d.cool=Math.max(d.cool,1);
 if(FORM()!==PR.f&&p.state!=='nmorph'&&!(p.morphWait&&p.morphWait.f===PR.f))pracStop();
 if(PR.done>0){PR.done-=dt;if(PR.done<=0){PR.prog=0}return}if(PR.fail>0){PR.fail-=dt*1.6;if(PR.fail<=0)PR.prog=0;return}
 const k=ROUTES[PR.f][PR.i].k,s=liveSeq();
 if(s){PR.idle=0;if(k.startsWith(s))PR.prog=Math.max(PR.prog,s.length);else if(PR.prog>0&&s.length>=PR.prog){PR.fail=1}}
 else if(p.state!=='lkult'){PR.idle+=dt;if(PR.idle>.5&&PR.prog>0&&!PR.done){PR.fail=1;PR.idle=0}}}
// ---- drawing ----
const KEYCOL={C:'#ff6fb5',T:'#ffb340',M:'#5cc8ff',B:'#a77bff'};
function chip(k,x,y,r,st){ctx.save();ctx.fillStyle=st==='off'?'rgba(0,0,0,.35)':KEYCOL[k];ctx.globalAlpha=st==='off'?.8:1;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
 ctx.lineWidth=st==='hit'?4:st==='next'?3:2;ctx.strokeStyle=st==='hit'?'#7fffd4':st==='next'?'#fff':'rgba(255,255,255,.7)';ctx.stroke();
 ctx.fillStyle='#fff';ctx.font=`${Math.round(r*1.15)}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(k,x,y+1);ctx.restore()}
function r9DrawWorld(){
 if(R9.moon&&R9.moon.l>.01){const m=R9.moon,x=VW*.5,y=-camY+120;ctx.save();ctx.globalAlpha=m.l*.9;const g=ctx.createRadialGradient(x,y,10,x,y,170);g.addColorStop(0,'rgba(230,240,255,1)');g.addColorStop(.45,'rgba(190,170,255,.65)');g.addColorStop(1,'rgba(120,90,255,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,170,0,6.283);ctx.fill();ctx.fillStyle='#eef3ff';ctx.beginPath();ctx.arc(x,y,72,0,6.283);ctx.fill();ctx.fillStyle='rgba(185,140,255,.35)';
  for(const [dx,dy,r] of [[-20,-14,13],[18,10,16],[-4,24,8]]){ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,6.283);ctx.fill()}ctx.restore()}
 for(const c of R9.cracks){const a=Math.min(1,c.l/1.2);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(const s of c.segs){ctx.globalAlpha=a;ctx.strokeStyle='#3b2412';ctx.lineWidth=7;ctx.beginPath();s.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
   ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.8;ctx.strokeStyle=c.col;ctx.lineWidth=3;ctx.stroke();ctx.globalCompositeOperation='source-over'}
  ctx.globalAlpha=a*.6;ctx.fillStyle='#3b2412';ctx.beginPath();ctx.ellipse(c.x,GROUND+6,70,12,0,0,6.283);ctx.fill();ctx.restore()}
 for(const w of R9.paws){const u=1-w.l/1.6,s=60+u*260,a=Math.min(1,w.l);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.55;ctx.fillStyle='#ff9ad5';ctx.translate(w.x,GROUND-10);ctx.scale(1,.32);
  ctx.beginPath();ctx.ellipse(0,s*.25,s*.55,s*.45,0,0,6.283);ctx.fill();for(const [dx,dy] of [[-.62,-.38],[-.22,-.7],[.22,-.7],[.62,-.38]]){ctx.beginPath();ctx.ellipse(dx*s,dy*s,s*.2,s*.24,0,0,6.283);ctx.fill()}ctx.restore()}
 if(R9.beam){const b=R9.beam,a=Math.min(1,b.l*1.5);ctx.save();ctx.globalCompositeOperation='lighter';
  if(b.cut){ctx.globalAlpha=a;ctx.strokeStyle=SR;ctx.lineWidth=26*a;ctx.beginPath();ctx.moveTo(b.x+40,-camY-200);ctx.lineTo(b.x-20,GROUND);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=9*a;ctx.stroke()}
  else{const w=60+(1-a)*80,g=ctx.createLinearGradient(b.x-w/2,0,b.x+w/2,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,b.col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a*.8;ctx.fillStyle=g;ctx.fillRect(b.x-w/2,-camY-3000,w,GROUND+camY+3000)}ctx.restore()}
 for(const r of R9.rings){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,Math.min(1,r.l));ctx.translate(r.x,r.y);
  if(r.flat){ctx.strokeStyle=r.col;ctx.lineWidth=r.w;ctx.beginPath();ctx.ellipse(0,0,r.r,r.r*.24,0,0,6.283);ctx.stroke()}
  else if(r.face){ctx.scale(r.face,1);for(let k=0;k<3;k++){const rr=r.r-k*30;if(rr<8)continue;ctx.strokeStyle=k%2?r.col2:k?r.col:'#fff';ctx.lineWidth=r.w-k*2;ctx.beginPath();ctx.arc(0,0,rr,-1.15,1.15);ctx.stroke()}
   if(r.f===0){ctx.fillStyle='#ff9ad5';for(let k=0;k<3;k++){const a=-.7+k*.7,rr=r.r*.85;heart(Math.cos(a)*rr,Math.sin(a)*rr,7)}}
   if(r.f===1){ctx.strokeStyle=r.col2;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r.r*1.08,-1.3,1.3);ctx.stroke()}}
  else{ctx.strokeStyle=r.col;ctx.lineWidth=r.w;ctx.beginPath();ctx.arc(0,0,r.r,0,6.283);ctx.stroke()}ctx.restore()}
 for(const c of R9.confetti){if(c.hud)continue;ctx.save();ctx.globalAlpha=Math.min(1,c.l*1.5);ctx.fillStyle=c.c;if(c.heart)heart(c.x,c.y,6);else{ctx.translate(c.x,c.y);ctx.rotate(c.l*9);ctx.fillRect(-4,-2,8,4)}ctx.restore()}
 // tail-spin swirl for the T links
 if(p.state==='lk'&&p.lk&&p.lk.L==='T'&&!(FORM()>=3&&!p.lk.rep)){const fl=LKF[FORM()],a0=p.t*30;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let k=0;k<5;k++){ctx.globalAlpha=(.55-k*.09)*Math.min(1,(LKD-p.t)*4);ctx.strokeStyle=k%2?fl.col:k?fl.col2:'#fff';ctx.lineWidth=12-k*2;ctx.beginPath();ctx.ellipse(p.x,p.y-40-k*(p.lk.rep?22:6),110+k*8,30,0,a0-1.8-k*.3,a0-k*.3);ctx.stroke()}ctx.restore()}}
function heart(x,y,s){ctx.beginPath();ctx.moveTo(x,y+s*.9);ctx.bezierCurveTo(x-s*1.6,y-s*.2,x-s*.7,y-s*1.5,x,y-s*.5);ctx.bezierCurveTo(x+s*.7,y-s*1.5,x+s*1.6,y-s*.2,x,y+s*.9);ctx.fill()}
function r9DrawHUD(){
 // the chain so far, bottom centre: chips light up as each link lands
 const seq=LK.on?LK.seq:(now-LK.lastT<1.2?LK.lastSeq:'');
 if(seq){const n=seq.length,x0=VW/2-(n-1)*21,a=LK.on?1:Math.max(0,1.2-(now-LK.lastT))/1.2;ctx.save();ctx.globalAlpha=a;for(let i=0;i<n;i++)chip(seq[i],x0+i*42,VH-38,16,LK.dead&&i===n-1?'off':'hit');ctx.restore();
  if(p.state==='lk'&&!LK.dead){const u=Math.min(1,p.t/LKW),x=x0+n*42;ctx.save();ctx.globalAlpha=.5+.5*u;ctx.strokeStyle=u>=1?'#7fffd4':'#fff';ctx.lineWidth=u>=1?4:2;ctx.beginPath();ctx.arc(x,VH-38,16+(1-u)*14,0,6.283);ctx.stroke();
   if(u>=1){ctx.fillStyle='#7fffd4';ctx.font=`18px ${FONT}`;ctx.textAlign='center';ctx.fillText('NOW!',x,VH-62)}ctx.restore()}}
 if(LK.flash){ctx.save();ctx.globalAlpha=Math.min(1,LK.flash.l*2);ctx.font=`22px ${FONT}`;ctx.textAlign='center';ctx.fillStyle='#ffb0b0';ctx.fillText(LK.flash.t+' combo dropped',VW/2,VH-70);ctx.restore()}
 // practice target, top centre
 if(PR.on){const r=ROUTES[PR.f][PR.i],k=r.k,n=k.length,x0=VW/2-(n-1)*22,y=118;ctx.save();ctx.fillStyle='rgba(20,16,50,.55)';ctx.beginPath();ctx.roundRect?ctx.roundRect(VW/2-n*22-110,y-48,n*44+220,86,14):ctx.rect(VW/2-n*22-110,y-48,n*44+220,86);ctx.fill();
  ctx.font=`22px ${FONT}`;ctx.textAlign='center';ctx.fillStyle=r.ult?'#ffe14d':'#fff';ctx.fillText('PRACTICE · '+r.nm.replace(/!+$/,'')+(PR.clears?'  ✓×'+PR.clears:''),VW/2,y-22);
  for(let i=0;i<n;i++){const st=PR.fail>0&&i>=PR.prog-1&&i<PR.prog?'off':i<PR.prog?'hit':i===PR.prog?'next':'todo';const pulse=st==='next'?1+.12*Math.sin(now*10):1;chip(k[i],x0+i*44,y+14,15*pulse,st==='todo'?'todo':st)}
  ctx.font=`15px ${FONT}`;ctx.fillStyle=PR.done>0?'#7fffd4':PR.fail>0?'#ffb0b0':'#cfd8ff';
  ctx.fillText(PR.done>0?'CLEARED! again?':PR.fail>0?'dropped – start again from the first button':'first 3 = opener · then press on the green ring / chime',VW/2,y+56);ctx.restore()}
 for(const c of R9.confetti){if(!c.hud)continue;ctx.save();ctx.globalAlpha=Math.min(1,c.l*1.5);ctx.fillStyle=c.c;ctx.translate(c.x,c.y+camY);ctx.rotate(c.l*9);ctx.fillRect(-5,-2.5,10,5);ctx.restore()}}
const _drawFx9=drawFx;drawFx=function(){_drawFx9();r9DrawWorld()};
const _drawCombo9=drawCombo;drawCombo=function(){_drawCombo9();r9DrawHUD()};
// ---- the COMBO LIST / practice panel in the ? menu (built from ROUTES so it always matches the game) ----
function buildList(){const el=document.getElementById('clist');if(!el)return;const F=[['🐱 KITTY','#ffe08a'],['🥷 NINJA','#c9a7ff'],['⚔️ SAMURAI','#ff6b6b'],['🛡️ KNIGHT','#ffd34d'],['⚓ PIRATE','#2ec4d6']].concat(window.UFTABS||[]);
 const ch=k=>`<span class="ck" style="background:${KEYCOL[k]}">${k}</span>`;
 let h='<h3>🎯 COMBO LIST &amp; PRACTICE</h3><p class="tip"><b>How it works:</b> land 3 timed hits of <b>Claw</b> (C C C) or <b>Tail</b> (T T T) to <b>open</b> a combo. Then press <b>Claw</b>, <b>Tail</b>, <b>Meow</b> or <b>Blink</b> on the beat – when the ring around Paddy turns green and you hear the chime – to chain a new move. Too early and the combo drops. Each button does something different (Blink = teleport slash, Meow = shockwave, Tail = spin, Claw = pounce) and pressing the same one twice gives a bigger version. Keep Claw going to 4 and 5 first, then add the others. Knight: Tail = Shield Bash, Meow = Holy Shout, Blink = Lance Rush. Pirate: Tail = Anchor Hook, Meow = Flintlock / Cannon, Blink = Barrel Roll / Rope Swing. Keys: C = Claw (X/J) · T = Tail (T/L) · M = Meow (C/K) · B = Blink (N/Ctrl). Tap ▶ to practise one – the buttons light up as you get them.</p><div class="tabs">';
 F.forEach((f,i)=>h+=`<button class="tab" data-tab="${i}" style="border-bottom:3px solid ${f[1]}">${f[0]}</button>`);h+='</div>';
 F.forEach((f,i)=>{h+=`<table class="ctab" data-f="${i}" style="${i?'display:none':''}">`;ROUTES[i].forEach((r,j)=>{h+=`<tr${r.ult?' class="ult"':''}><td class="seq">${r.k.split('').map(ch).join('')}</td><td><b>${r.ult?'⚡ ULTIMATE · ':''}${r.nm.replace(/!+$/,'')}</b>${r.kj?' '+r.kj:''}<br><span class="tip">${r.tip}</span></td><td><button data-prac="${i}:${j}">▶ Practise</button></td></tr>`});h+='</table>'});
 el.innerHTML=h;
 el.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();el.querySelectorAll('.ctab').forEach(t=>t.style.display=t.dataset.f===b.dataset.tab?'':'none')}));
 el.querySelectorAll('[data-prac]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();const [f,j]=b.dataset.prac.split(':').map(Number);if(typeof ov==='function')ov(false);else document.body.classList.remove('ov');practice(f,j)}));
 const pc=document.getElementById('pclose');if(pc&&!pc.dataset.on){pc.dataset.on=1;pc.addEventListener('pointerdown',e=>{e.preventDefault();pracStop()})}}

// ===================== ROUND 10: KNIGHT PADDY + PIRATE PADDY (their sprites lazy-load, so start-up stays fast) =====================
// Knight = heavy and weighty but smooth: wind-up -> strike -> follow-through on every swing, shield guard/parry, lance rush, holy light, heraldic crests.
// Pirate = quick and acrobatic: cutlass flurries, rope swing, barrel roll, flintlock / mini cannon (cartoon puffs), anchor hook, parrot, treasure, ocean splashes.
Object.assign(A,{
 kn_idle:['kn_idle',[0,1,2,3,4,5,4,3,2,1],6,1],kn_run:['kn_run',null,13,1],kn_rise:['kn_jump',[1,2],8,0],kn_apex:['kn_jump',[3],1,0],kn_fall:['kn_jump',[3],1,0],kn_land:['kn_jump',[5],1,0],
 kn_hurt:['kn_jump',[0],1,0],kn_victory:['kn_combo_c',[4],1,0],kn_calm:['kn_combo_c',[5],1,0],
 kn_h1:['kn_combo_a',[0,1],11,0],kn_h2:['kn_combo_a',[2,3],11,0],kn_h3:['kn_combo_a',[4,5],10,0],kn_h4:['kn_combo_b',[0,1],12,0],kn_h5:['kn_combo_b',[2,3],11,0],kn_h6:['kn_combo_b',[4,5],12,0],kn_h7:['kn_combo_c',[0,1],9,0],
 kn_leap:['kn_combo_c',[2],1,0],kn_slam:['kn_combo_c',[3],1,0],kn_launch:['kn_combo_b',[2,3],11,0],
 kn_airA:['kn_air',[0],1,0],kn_airB:['kn_air',[1],1,0],kn_airC:['kn_air',[2],1,0],kn_airD:['kn_air',[3],1,0],kn_dive:['kn_air',[4],1,0],
 kn_guard:['kn_guard',[0],1,0],kn_parry:['kn_guard',[1],1,0],kn_counter:['kn_guard',[2],1,0],kn_kneel:['kn_guard',[3],1,0],kn_power:['kn_guard',[4],1,0],kn_shout:['kn_guard',[5],1,0],
 kn_rushA:['kn_combo_c',[0],1,0],kn_rush:['kn_combo_c',[1],1,0],
 kn_ultA:['kn_ult',[0],1,0],kn_ultB:['kn_ult',[1],1,0],kn_ultC:['kn_ult',[2],1,0],kn_ultD:['kn_ult',[3],1,0],kn_ultE:['kn_ult',[4],1,0],kn_ultF:['kn_ult',[5],1,0],
 pi_idle:['pi_idle',[1,2,3,4,5,4,3,2],6,1],pi_run:['pi_run',null,16,1],pi_rise:['pi_jump',[1,2],9,0],pi_apex:['pi_jump',[3],1,0],pi_fall:['pi_air',[5],1,0],pi_land:['pi_jump',[0],1,0],
 pi_hurt:['pi_air',[5],1,0],pi_victory:['pi_combo_c',[4],1,0],pi_calm:['pi_combo_c',[5],1,0],
 pi_h1:['pi_combo_a',[5,0],14,0],pi_h2:['pi_combo_a',[1],1,0],pi_h3:['pi_combo_a',[2],1,0],pi_h4:['pi_combo_a',[3],1,0],pi_h5:['pi_combo_b',[0,1],13,0],pi_h6:['pi_combo_b',[2],1,0],pi_h7:['pi_combo_b',[4,5],9,0],
 pi_twirl:['pi_combo_a',[4],1,0],pi_launch:['pi_combo_b',[3],1,0],
 pi_airA:['pi_air',[0],1,0],pi_airB:['pi_air',[1],1,0],pi_airC:['pi_air',[2],1,0],pi_airD:['pi_air',[3],1,0],pi_dive:['pi_air',[4],1,0],
 pi_pop:['pi_gun',[0,1],13,0],pi_hook:['pi_gun',[2,3],9,0],pi_aim:['pi_gun',[4],1,0],pi_cannon:['pi_gun',[5],1,0],
 pi_roll:['pi_combo_c',[0],1,0],pi_rollout:['pi_combo_c',[1],1,0],pi_swing:['pi_combo_c',[2,3],4,0],
 pi_ultA:['pi_ult',[0],1,0],pi_ultB:['pi_ult',[1],1,0],pi_ultC:['pi_ult',[3],1,0],pi_ultE:['pi_ult',[4],1,0],pi_ultF:['pi_ult',[5],1,0]});
const KG='#ffd34d',KBL='#4f8dff',KW='#fff6d8',PT='#2ec4d6',PG='#ffcf3f',PRD='#e8413c';
// ---- the two new forms' data: 8-hit chains (hits 1-3 any press, 4-7 on the timing ring, perfect 8th = cinematic) ----
const XF=[null,null,null,
 {pre:'kn',nm:'KNIGHT',col:KG,col2:KBL,H:.46,H0:.46,minT:.2,cancelT:.18,W:.26,E:.52,spd:400,airNm:'AIR CLEAVE',
  CH:[null,{a:'kn_h1',k:'flat',lunge:250,ht:.09,nm:'GREATSWORD CLEAVE!',c:'#fff3c0'},{a:'kn_h2',k:'down',lunge:260,ht:.09,nm:'DIAGONAL CLEAVE!',c:'#ffe48a'},
   {a:'kn_h3',k:'over',lunge:230,ht:.1,nm:'OVERHEAD CRUSH!',c:KG},{a:'kn_h4',k:'flat',lunge:330,ht:.085,nm:'SHIELD BASH!',c:'#9cc2ff'},
   {a:'kn_h5',k:'rise',lunge:160,ht:.09,nm:'RISING CLEAVE!',c:'#ffd34d'},{a:'kn_h6',k:'spin',lunge:220,ht:.085,nm:'CYCLONE CLEAVE!',c:'#ffb340'},
   {a:'kn_h7',k:'thrust',lunge:620,ht:.11,nm:'LANCE CHARGE!',c:'#fff'}]},
 {pre:'pi',nm:'PIRATE',col:PT,col2:PG,H:.36,H0:.32,minT:.12,cancelT:.1,W:.16,E:.4,spd:480,airNm:'AIR SLASH',
  CH:[null,{a:'pi_h1',k:'thrust',lunge:330,ht:.07,nm:'LUNGE THRUST!',c:'#dffcff'},{a:'pi_h2',k:'down',lunge:220,ht:.035,nm:'FOREHAND SLASH!',c:'#9ff3ff'},
   {a:'pi_h3',k:'up',lunge:220,ht:.035,nm:'BACKHAND SLASH!',c:PT},{a:'pi_h4',k:'over',lunge:260,ht:.05,nm:'LEAPING CUT!',c:PG},
   {a:'pi_h5',k:'spin',lunge:200,ht:.06,nm:'WHIRLPOOL SPIN!',c:'#5fe0ff'},{a:'pi_h6',k:'low',lunge:420,ht:.04,nm:'LOW TIDE SWEEP!',c:'#ffe27a'},
   {a:'pi_h7',k:'rise',lunge:150,ht:.1,nm:'CARTWHEEL KICK!',c:'#ffffff'}]}];
const XFm=()=>XF[p.xf]||null;
const XST=new Set();['kn','pi'].forEach(q=>{for(let i=1;i<=7;i++)XST.add(q+i);['launch','air','dive','charge','final','rush','tail','riposte','shout','wave','crest','pop','cannon','broad','roll','swing','flip'].forEach(s=>XST.add(q+s))});
CINE.push('knfinal','pifinal');LIFT.push('knair','piair','piswing');
['kn1','kn2','kn3','kn4','kn5','kn6','kn7','knlaunch','knair','pi1','pi2','pi3','pi4','pi5','pi6','pi7','pilaunch','piair'].forEach(s=>CST.add(s));TST.add('kntail');TST.add('pitail');
Object.assign(NAMES,{kn1:'GREATSWORD CLEAVE!',kn2:'DIAGONAL CLEAVE!',kn3:'OVERHEAD CRUSH!',kn4:'SHIELD BASH!',kn5:'RISING CLEAVE!',kn6:'CYCLONE CLEAVE!',kn7:'LANCE CHARGE!',
 knlaunch:'RISING CLEAVE!',knair:'AIR CLEAVE!',kndive:'SKYFALL PLUNGE!',knriposte:'COUNTER BASH!',knshout:'HOLY SHOUT!',knwave:'HOLY WAVE!',knwave2:'RADIANT WAVE!',kncrest:'CRUSADER CREST!',kncrestfin:'CRUSADER CREST!!',
 knrush:'LANCE RUSH!',knfhit:'VALOUR!',knfinal:'SMASH!!',
 pi1:'LUNGE THRUST!',pi2:'FOREHAND SLASH!',pi3:'BACKHAND SLASH!',pi4:'LEAPING CUT!',pi5:'WHIRLPOOL SPIN!',pi6:'LOW TIDE SWEEP!',pi7:'CARTWHEEL KICK!',
 pilaunch:'SKY SLASH!',piair:'AIR SLASH!',pidive:'ANCHOR DROP!',pihook:'ANCHOR HOOK!',pihook3:'ANCHOR LAUNCHER!',pipop:'FLINTLOCK POP!',piball:'CANNONBALL!',piball2:'BIG CANNONBALL!',pibroad:'BROADSIDE!',
 piroll:'BARREL ROLL!',piswing:'ROPE SWING!',pifhit:'SWASH!',pifinal:'KA-BOOM!!',piwave:'TIDAL SPLASH!'});
Object.assign(KB,{kn1:[230,-200,0,.05],kn2:[250,-240,0,.055],kn3:[180,-380,.1,.07],kn4:[440,-260,.05,.085],kn5:[100,-560,.3,.07],kn6:[300,-340,.15,.07],kn7:[520,-430,.2,.1],
 knlaunch:[60,-930,.55,.08],knair:[160,-320,.45,.055],kndive:[200,-640,.3,.1],knriposte:[460,-620,.35,.1],knshout:[380,-240,.1,.05],knwave:[420,-300,.15,.06],knwave2:[560,-560,.3,.09],
 kncrest:[20,-300,.4,.03],kncrestfin:[300,-1200,.6,.13],knrush:[520,-360,.2,.08],knfhit:[0,0,0,.04],knfinal:[260,-2400,1,.2],
 pi1:[200,-170,0,.035],pi2:[220,-210,0,.035],pi3:[240,-280,.05,.045],pi4:[180,-360,.1,.05],pi5:[260,-300,.1,.05],pi6:[320,-420,.15,.06],pi7:[110,-760,.45,.08],
 pilaunch:[60,-900,.55,.07],piair:[150,-300,.45,.04],pidive:[300,-520,.2,.08],pihook:[-260,-160,.25,.05],pihook3:[0,-900,.55,.08],pipop:[300,-200,.05,.04],piball:[480,-380,.2,.08],piball2:[620,-640,.3,.1],
 pibroad:[200,-700,.4,.1],piroll:[300,-420,.15,.06],piswing:[380,-480,.25,.07],pifhit:[0,0,0,.03],pifinal:[300,-2300,1,.2],piwave:[420,-520,.3,.08]});
const R10={crests:[],drops:[],tides:[],coins:[],parrot:null,proj:[],whirl:null,holy:null,sea:null,blade:null,pre:0};
// ---- little helpers ----
function fa(k){if(p.uf)return UF[p.uf].pre+'_'+k;if(p.xf)return (p.xf===3?'kn_':'pi_')+k;if(p.sam)return {idle:'s_idle',hurt:'s_hurt',victory:'s_victory',land:'s_land',rec:'s_rec'}[k]||'s_idle';if(p.ninja)return {idle:'n_idle',hurt:'n_hurt',victory:'n_flip',land:'n_land'}[k]||'n_idle';return k}
function xStrike(kb,reach,h,all){let n=0;for(const d of dummies){if(!d.alive)continue;const dx=(d.x-p.x)*p.face;if((all?Math.abs(d.x-p.x)<reach:dx>-45&&dx<reach)&&d.y>p.y-(h||170)&&d.y-(d.h||150)<p.y+30){hitDummy(d,kb,all?(Math.sign(d.x-p.x)||p.face):p.face);n++}}return n}
function crest(x,y,s,o){R10.crests.push({x,y,s,t:0,l:(o&&o.l)||1.3,slow:o&&o.slow,big:s>1})}
function splash(x,y,n,big){for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=(big?300:160)+Math.random()*(big?600:300);R10.drops.push({x:x+(Math.random()-.5)*40,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.6+Math.random()*.5,r:3+Math.random()*(big?6:4)})}}
function tide(x,dir,big){R10.tides.push({x,dir,t:0,l:big?1.6:1.1,big,hit:new Set()})}
function coinBurst(x,y,n){for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=250+Math.random()*450;R10.coins.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1.4+Math.random()*.6,ph:Math.random()*6})}}
function parrot(txt){R10.parrot={x:-80,y:-camY+150,t:0,txt,dir:1}}
function noiseS(len,f0,f1,v){if(muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,n=Math.floor(AC.sampleRate*len),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+len);g.gain.value=v;s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t)}catch(e){}}
function clang(){if(muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;[740,1110,1660].forEach((fq,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=fq;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05/(i+1),t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.35);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.37)})}catch(e){}}
const splashS=()=>noiseS(.5,1600,380,.12),popS=()=>noiseS(.14,2600,700,.1);
// ---- chain hits ----
function xHit(i){const X=XFm(),c=X.CH[i];p.xcombo=i;p.xcT=.7;C.atk++;act(X.pre+i,c.a,{say:c.nm,c:c.c});p.xhit=false;p.lunged=false;p.queued=false;p.perfect=false;p.miss=false;p.vx=-p.face*(X.pre==='kn'?60:0);popNum(i,c.c)}
function xFx(i,c){const kn=p.xf===3,sc=1.1+(i-1)*.1;
 if(c.k==='thrust'){const L=kn?360:300;sLine(p.x+p.face*30,p.y-78,p.x+p.face*L,p.y-78,kn?KG:PT,.32,kn?18:12);sLine(p.x+p.face*50,p.y-78,p.x+p.face*(L-30),p.y-78,'#fff',.28,6);slash('flat','#fff',{lvl:i,scale:.8,dx:150});
  for(let k=1;k<=4;k++)ghosts.push({x:p.x-p.face*k*34,y:p.y,f:(FR[c.a]||FR[fa('idle')])[0],face:p.face,l:.08+k*.03,blue:1})}
 else slash(c.k,c.c,{lvl:i+(kn?1:0),scale:sc*(kn?1.12:1),dx:kn?100:85,col2:kn?KBL:PT});
 if(i>=3&&c.k!=='thrust')slash(c.k,'#fff',{lvl:i,scale:sc*.8,delay:.05,dx:kn?100:85});
 spark(p.x+p.face*90,p.y-75,4+i*2,kn?[KG,'#fff',KBL]:[PT,'#fff',PG],180+i*35);shake=Math.max(shake,(kn?3.5:2)+i*(kn?1.9:1.4));
 if(kn){if(i===3){waves.push({x:p.x+p.face*110,y:GROUND,r:10,l:1,big:true});for(let k=0;k<14;k++)sparks.push({x:p.x+p.face*110+(Math.random()-.5)*60,y:GROUND,vx:(Math.random()-.5)*400,vy:-150-Math.random()*350,l:.6,c:k%2?'#b98a55':'#d9c49a'})}
  if(i===4){clang();R9.rings.push({x:p.x+p.face*70,y:p.y-80,r:20,vr:700,l:.9,col:KBL,col2:KG,w:10,f:3,face:p.face})}
  if(i===7)crest(p.x+p.face*170,p.y-110,.55);if(i>=5)flashT=Math.max(flashT,.04)}
 else{splash(p.x+p.face*90,p.y-70,3+i*2,i>=5);if(i===5)R10.whirl={x:p.x+p.face*60,l:.5,r:90};if(i===7){coinBurst(p.x+p.face*60,p.y-80,6);popS()}}
 if(i>=4)waves.push({x:p.x+p.face*70,y:p.y-60,r:10,l:.4+i*.06,big:i>=7})}
function xJump(){const kn=p.xf===3;
 if(p.ground){p.state='normal';p.vy=kn?-760:-790;p.ground=false;p.jumps=1;p.lastJump=now;setAnim(fa('rise'),true);spark(p.x,p.y,10,kn?[KG,'#fff']:[PT,'#fff'],160);if(kn)waves.push({x:p.x,y:p.y,r:10,l:.6,big:false});acted=true;return true}
 if(kn){if(p.jumps<2){p.jumps=2;p.vy=-640;setAnim('kn_rise',true);say('SHIELD VAULT!',KBL);R9.rings.push({x:p.x,y:p.y+4,r:16,vr:500,l:.8,col:KG,col2:KBL,w:8,f:3,face:0,flat:1});clang();extend();acted=true;return true}return false}
 if(p.jumps<2){p.jumps=2;piSwing();return true}
 if(p.jumps<3){p.jumps=3;act('piflip','pi_apex',{say:'SOMERSAULT!',c:PG});p.vy=-600;extend();return true}return false}
function piSwing(){const L=280,th0=-.8;act('piswing','pi_swing',{say:'ROPE SWING!',c:PG});p.sw={L,th0,ax:p.x+p.face*L*Math.sin(-th0),ay:p.y-150-L*Math.cos(th0),face:p.face,hit:new Set()};p.vx=0;p.vy=0;extend()}
function xAir(){const X=XFm(),kn=X.pre==='kn',hot=now-(p.lastAirHitT||-9)<.6,max=kn?4:6;if((p.xair||0)>=max&&!hot)return false;p.xair=(p.xair||0)+1;C.atk++;
 const n=p.xair,q=[['airA','flat'],['airB','rise'],['airC','down'],['airD','spin']][(n-1)%4],col=n%2?X.col:X.col2;popNum(n,col);
 act(X.pre+'air',X.pre+'_'+q[0],{say:n>=4?X.airNm+' x'+n+'!':X.airNm+'!',c:col});p.vy=Math.min(p.vy,kn?-170:-210);p.vx=p.face*(kn?200:250);p.xq=q[1];return true}
function xDive(){const kn=p.xf===3;act(kn?'kndive':'pidive',kn?'kn_dive':'pi_dive',{say:kn?'SKYFALL PLUNGE!':'ANCHOR DROP!',c:kn?KG:PT});p.vy=kn?1300:1150;p.vx=p.face*(kn?160:420)}
function xLaunch(){const kn=p.xf===3;act(kn?'knlaunch':'pilaunch',kn?'kn_launch':'pi_launch',{say:kn?'RISING CLEAVE!':'SKY SLASH!',c:kn?KG:PG});p.vx=p.face*60;p.xair=0;if(!kn){p.vy=-760;p.ground=false;p.jumps=1}}
function xTail(){if(p.xf===3){act('kntail','kn_guard',{say:'SHIELD UP!',c:'#cfe3ff'});p.vx*=.2;if(!p.ground)p.vy=Math.min(p.vy,-80);return}
 const n=p.hookT>0?Math.min(3,(p.hookN||0)+1):1;p.hookN=n;p.hookT=.9;act('pitail','pi_hook',{say:['ANCHOR HOOK!','HOOK & PULL!','ANCHOR LAUNCHER!'][n-1],c:['#bfe9ff','#8fdcff',PG][n-1]});p.vx*=.3;p.hk={n,hit:null,tip:0};if(!p.ground)p.vy=Math.min(p.vy,-120)}
function knRiposte(perf){act('knriposte','kn_parry',{say:perf?'PERFECT PARRY!':'COUNTER BASH!',c:perf?'#7fffd4':'#cfe3ff'});p.vx=p.face*200;p.rip={perf};clang();
 if(perf){slowT=Math.max(slowT,.28);flashT=Math.max(flashT,.15);hitstop=Math.max(hitstop,.08);crest(p.x+p.face*60,p.y-110,.8);waves.push({x:p.x+p.face*50,y:p.y-80,r:10,l:1,big:true});spark(p.x+p.face*60,p.y-90,22,[KG,'#fff'],380)}}
function xBlink(){if(p.blinkCool>0||CINE.includes(p.state)||['lk','lkult','nmorph','respawn'].includes(p.state))return false;p.blinkCool=.45;
 if(p.xf===3){act('knrush','kn_rushA',{say:'LANCE RUSH!',c:KG});p.rush={x0:p.x,hit:new Set()};p.vx=-p.face*80;p.inv=Math.max(p.inv,.35)}
 else{act('piroll','pi_roll',{say:'BARREL ROLL!',c:PG});p.rush={x0:p.x,hit:new Set()};p.inv=Math.max(p.inv,.45);p.vx=p.face*950}extend();return true}
function xDash(dir){p.face=dir==='right'?1:-1;if(p.dashCool>0)return;p.dashCool=.45;p.dashStart=now;p.blinkCool=0;xBlink()}
function xCharge(){act(p.xf===3?'kncharge':'picharge',p.xf===3?'kn_kneel':'pi_aim');p.xc=0;p.xcFull=false}
function xCancel(){if(P.special){xCharge();return true}if(P.tail||P.swat||P.hiss){xTail();return true}
 if(P.attack&&(K.up||K.down)&&p.ground&&!/launch$/.test(p.state)){xLaunch();return true}
 if(P.jump&&xJump())return true;if(P.dash&&p.dashCool<=0){xDash(P.dash);return true}if(P.blink&&xBlink())return true;return false}
function xMoves(dir){
 if(P.jump&&xJump())return;
 if(!p.ground&&P.down&&!P.attack){xDive();return}
 if(P.attack){if(!p.ground){if(K.down)xDive();else xAir();return}if(K.up||K.down){xLaunch();return}xHit(p.xcT>0&&p.xcombo<3?p.xcombo+1:1);return}
 if(P.special){xCharge();return}
 if(P.tail||P.swat||P.hiss){xTail();return}}
// ---- Meow moves ----
function knShout(big){act('knshout','kn_shout',{say:'HOLY SHOUT!',c:KG});bubble={t:'MEOW!',l:1,big:false};meowSound(.45);R9.rings.push({x:p.x+p.face*60,y:p.y-80,r:20,vr:900,l:1,col:KG,col2:'#fff',w:12,f:3,face:p.face});shake=Math.max(shake,6)}
function knWave(c){act('knwave','kn_h1',{say:c>.3?'RADIANT WAVE!':'HOLY WAVE!',c:KG});setAnim('kn_h1',true);p.ft=1;R10.proj.push({k:'wave',x:p.x+p.face*90,y:GROUND,vx:p.face*(760+c*300),l:.9+c*.4,s:1+c*.9,face:p.face,hit:new Set(),kb:c>.3?'knwave2':'knwave'});
 slash('flat',KG,{scale:1.3+c,lvl:c>.3?7:4,dx:90,col2:'#fff'});crest(p.x+p.face*40,p.y-130,.45);shake=Math.max(shake,c>.3?10:6)}
function knCrest(){act('kncrest','kn_power',{say:'CRUSADER CREST!!',c:KG});p.xcr={t:.9,k:0};crest(p.x,p.y-150,1.5,{l:1.8});cine.pillar={x:p.x,l:1.1,col:KG};slowT=Math.max(slowT,.2);flashT=.2;shake=16;clang();
 for(let i=0;i<3;i++)waves.push({x:p.x,y:p.y-30*i,r:10+i*20,l:1,big:true})}
function piPop(){act('pipop','pi_pop',{say:'FLINTLOCK POP!',c:PG});p.vx=-p.face*60}
function piCannon(c){act('picannon','pi_cannon',{say:c>.3?'BIG CANNONBALL!':'CANNONBALL!',c:PG});p.vx=-p.face*(160+c*120);popS();boom();
 R10.proj.push({k:'ball',x:p.x+p.face*110,y:p.y-95,vx:p.face*(900+c*300),vy:-60,g:120,l:1.2,s:1+c*.6,face:p.face,hit:new Set(),kb:c>.3?'piball2':'piball'});
 for(let i=0;i<10;i++)puffs.push({x:p.x+p.face*(115+Math.random()*30),y:p.y-95+(Math.random()-.5)*30,vx:p.face*(40+Math.random()*80),vy:-20-Math.random()*40,r:14+Math.random()*12,l:.7});shake=Math.max(shake,8+c*6)}
function piBroadside(){act('pibroad','pi_cannon',{say:'BROADSIDE!!',c:PG});parrot('FIRE!');popS();boom();const tg=nTarget(900);for(let i=0;i<3;i++){const tx=tg?tg.x:p.x+p.face*(250+i*60);
 R10.proj.push({k:'arc',x:p.x-p.face*(500+i*90),y:-camY-60-i*40,tx,ty:tg?tg.y-60:GROUND-60,t:0,d:.55+i*.12,l:3,s:1.3,face:p.face,hit:new Set(),kb:'pibroad'})}
 slowT=Math.max(slowT,.15);flashT=.15;shake=12;for(let i=0;i<12;i++)puffs.push({x:p.x+p.face*120,y:p.y-95,vx:p.face*(60+Math.random()*120),vy:-30-Math.random()*60,r:16+Math.random()*14,l:.8})}
// ---- perfect-8 cinematics ----
function knFinal(){C.atk++;popNum(8,KG);act('knfinal','kn_leap',{say:'VALIANT…',c:KG});p.inv=5;p.grab=nTarget(460);p.vx=0;p.vy=0;p.st1=p.st2=p.st3=false;p.fx0=p.x;p.fy0=p.y;p.fh=0;p.fhn=0;
 cineGo(1.35,.4);slowT=.12;flashT=.1;shake=8;crest(p.x,p.y-140,.7)}
function piFinal(){C.atk++;popNum(8,PT);act('pifinal','pi_roll',{say:'BROADSIDE…',c:PT});p.inv=5;p.grab=nTarget(460);p.vx=0;p.vy=0;p.st1=p.st2=p.st3=false;p.fx0=p.x;p.fh=0;p.fhT=0;
 cineGo(1.35,.35);slowT=.12;flashT=.1;shake=8}
function knFinalState(dt){const g=p.grab&&p.grab.alive?p.grab:null,t=p.t,e=x=>x*x*(3-2*x),gx=g?g.x:p.fx0+p.face*200;p.vx=0;p.vy=0;p.rot=0;
 if(g&&!p.st3){g.vx=0;g.vy=0;g.fl=.6;g.y+=((GROUND-150)-g.y)*Math.min(1,dt*6);g.hp=Math.max(4,g.hp)}
 if(t<.45){const u=e(t/.45);p.y+=((GROUND-260*u)-p.y)*Math.min(1,dt*14);p.x+=((gx-p.face*90)-p.x)*Math.min(1,dt*5);p.ground=false;if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR.kn_leap||FR[fa('idle')])[0],face:p.face,l:.2,blue:1})}
 else if(t<.74){if(!p.st1){p.st1=true;cine.tz=1.7;cine.tdim=.7;say('…SMASH!!','#fff',true);crest(gx,GROUND-260,1.1,{l:1.4})}
  if(t-p.fh>.08&&p.fh<.66){p.fh=t;p.fhn++;popNum(8+p.fhn,p.fhn%2?KG:'#fff');C.atk++;if(g){hitDummy(g,'knfhit',p.face);g.vx=0;g.vy=0}const a=Math.random()*6.28;slash(['over','cross','rise'][Math.floor(t*30)%3],t*10%2<1?KG:'#fff',{lvl:8,scale:1.2,dx:90,dy:60});shake=Math.max(shake,5)}
  if(t%.03<dt){const a=Math.random()*6.283;sparks.push({x:p.x+Math.cos(a)*160,y:p.y-80+Math.sin(a)*160,vx:-Math.cos(a)*420,vy:-Math.sin(a)*420,l:.38,c:Math.random()<.5?KG:'#fff'})}}
 else if(t<.86){const u=e((t-.74)/.12);setAnim('kn_dive');p.y=Math.min(GROUND,p.y+((GROUND)-p.y)*Math.min(1,u+.2));ghosts.push({x:p.x,y:p.y,f:(FR.kn_dive||FR[fa('idle')])[0],face:p.face,l:.3,blue:1})}
 else if(!p.st3){p.st3=true;p.y=GROUND;p.ground=true;setAnim('kn_slam',true);boom();clang();const x=g?g.x:p.x+p.face*80;
  if(g){g.hp=Math.max(5,g.hp);hitDummy(g,'knfinal',p.face);g.vy=-2400;g.vx=p.face*260;g.fl=1}
  shake=34;slowT=.7;flashT=.45;hitstop=.1;cine.tz=1.15;cine.tdim=.3;cine.pillar={x,l:1.2,col:KG};R9.cracks.push(mkCrack(p.x+p.face*60,3));crest(x,GROUND-170,1.6,{l:1.6});
  for(let i=0;i<5;i++)waves.push({x:p.x+p.face*60,y:GROUND-4+i*3,r:10+i*30,l:1,big:true});burst(x,GROUND-90);for(let i=0;i<70;i++){const a=Math.random()*6.28,v=250+Math.random()*800;sparks.push({x,y:GROUND-80,vx:Math.cos(a)*v,vy:Math.sin(a)*v-250,l:.8,c:[KG,KBL,'#fff','#ffe14d'][i%4]})}
  card('VALIANT SMASH!',(8+p.fhn)+' HITS · PERFECT 8',KG)}
 if(t>1.7&&p.anim!=='kn_calm')setAnim('kn_calm');if(t>2.5){p.state='normal';p.xcombo=0;p.inv=.4}}
function piFinalState(dt){const g=p.grab&&p.grab.alive?p.grab:null,t=p.t,e=x=>x*x*(3-2*x),gx=g?g.x:p.fx0+p.face*220;p.vy=0;p.vx=0;
 if(g&&!p.st3){g.vx=0;g.vy=0;g.fl=.6;g.y+=((GROUND-140)-g.y)*Math.min(1,dt*6);g.hp=Math.max(4,g.hp)}
 if(t<.28){p.rot=p.face*t*24;p.x+=((gx-p.face*90)-p.x)*Math.min(1,dt*9);if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR.pi_roll||FR[fa('idle')])[0],face:p.face,l:.2,blue:1})}
 else if(t<1.12){p.rot=0;if(t-p.fhT>.1){p.fhT=t;p.fh++;const side=p.fh%2?1:-1;p.face=side;const tx=gx-side*95;p.x+=(tx-p.x)*.85;p.y=Math.min(GROUND,(g?g.y+130:GROUND)-(p.fh%3)*30);p.ground=p.y>=GROUND-1;
   setAnim(['pi_h2','pi_h3','pi_h4','pi_twirl'][p.fh%4],true);slash(['down','up','cross','flat'][p.fh%4],p.fh%2?PT:PG,{lvl:8,scale:1.25,dx:80,dy:60});splash(gx,(g?g.y:GROUND)-80,6);
   C.atk++;if(g){hitDummy(g,'pifhit',p.face);g.vx=0;g.vy=0}popNum(p.fh,p.fh%2?PT:PG);shake=Math.max(shake,5)}}
 else if(t<1.4){if(!p.st1){p.st1=true;setAnim('pi_launch',true);parrot('FIRE!!');cine.tz=1.6;cine.tdim=.6;p.face=gx>=p.x?1:-1}
  const u=e((t-1.12)/.28);p.x+=((gx-p.face*270)-p.x)*Math.min(1,dt*10);p.y+=(GROUND-p.y)*Math.min(1,dt*12);if(t>1.28&&p.anim!=='pi_aim')setAnim('pi_aim',true)}
 else if(!p.st2){p.st2=true;p.y=GROUND;p.ground=true;setAnim('pi_cannon',true);boom();popS();p.vx=-p.face*200;
  for(let i=0;i<14;i++)puffs.push({x:p.x+p.face*110,y:p.y-95,vx:p.face*(60+Math.random()*140),vy:-30-Math.random()*60,r:16+Math.random()*16,l:.9});
  p.fball={k:'ball',x:p.x+p.face*110,y:p.y-95,vx:p.face*1600,vy:0,g:0,l:.6,s:1.7,face:p.face,hit:new Set(),kb:'pifinal',fin:1};R10.proj.push(p.fball)}
 if(p.st2&&!p.st3&&(!g||t>1.62||(p.fball&&Math.abs(p.fball.x-gx)<70))){p.st3=true;const x=gx;
  if(g){g.hp=Math.max(5,g.hp);hitDummy(g,'pifinal',p.face);g.vy=-2300;g.vx=p.face*300;g.fl=1}R10.proj=R10.proj.filter(q=>!q.fin);
  shake=34;slowT=.7;flashT=.4;hitstop=.1;cine.tz=1.15;cine.tdim=.3;cine.pillar={x,l:1.1,col:PT};tide(x-p.face*200,p.face,true);splash(x,GROUND-60,60,true);coinBurst(x,GROUND-120,24);splashS();
  for(let i=0;i<5;i++)waves.push({x,y:GROUND-60+i*10,r:10+i*28,l:1,big:true});burst(x,GROUND-100);card('BROADSIDE BARRAGE!',p.fh+' SLASHES + CANNON · PERFECT 8',PT)}
 if(t>2.1&&p.anim!=='pi_victory')setAnim('pi_victory');if(t>2.6){p.state='normal';p.xcombo=0;p.inv=.4;p.rot=0}}
// ---- the state machine for both forms ----
function xState(S,dt,end,dir){const X=XFm();if(!X){p.state='normal';return}const kn=X.pre==='kn',t=p.t,at=T=>t>=T&&t-dt<T;
 if(/^(kn|pi)[1-7]$/.test(S)){const i=p.xcombo,c=X.CH[i],timed=i>=3,H=timed?X.H:X.H0;
  if(t<c.ht-.02)p.vx*=Math.pow(.05,dt);else{if(at(c.ht-.02)||(t>=c.ht-.02&&!p.lunged)){p.lunged=true;p.vx=p.face*c.lunge;if(kn&&i===7)p.inv=Math.max(p.inv,.25)}p.vx*=Math.pow(kn?.03:.02,dt)}
  if(t>=c.ht&&!p.xhit){p.xhit=true;p.lunged=false;xFx(i,c);const all=c.k==='spin';xStrike(S,c.k==='thrust'?(kn?260:220):kn?190:165,kn?200:180,all);
   if(i===7&&!kn){p.vy=-420;p.ground=false}if(i===4&&!kn){p.vy=-260;p.ground=false}}
  if(c.k==='spin'&&at(c.ht+.12)){C.atk++;xStrike(S,kn?200:170,190,true);slash('spin','#fff',{lvl:i,scale:1.1})}
  if(kn&&i===7&&t>c.ht&&t<c.ht+.2&&t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR.kn_h7||FR.kn_idle)[1]||(FR.kn_h7||FR.kn_idle)[0],face:p.face,l:.18,blue:1});
  if(t>X.cancelT&&xCancel())return;
  if(P.attack){if(!timed)p.queued=true;else if(!p.miss){if(t>=H-.2){p.perfect=true;p.queued=true}else if(!p.perfect)p.miss=true}}
  if(p.queued&&(timed?p.perfect:t>X.minT)&&p.xhit){p.queued=false;if(!p.ground&&i!==7&&i!==4){xAir()}else{
    if(timed){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false});hitstop=Math.max(hitstop,.05)}
    if(i>=7){kn?knFinal():piFinal()}else xHit(i+1)}}
  else if(t>(timed?H+.06:H)&&(p.ground||t>H+.3)){p.state='normal';if(timed)p.xcombo=0}return}
 switch(S){
 case 'knlaunch':case 'pilaunch':p.vx*=Math.pow(.05,dt);
  if(kn&&at(.09)){p.vy=-720;p.ground=false;p.jumps=1}
  if(at(kn?.1:.04)){xStrike(S,kn?175:160,240);slash('rise',X.col,{scale:1.4,lvl:6,dx:80,col2:X.col2});slash('up','#fff',{scale:1.1,lvl:5,delay:.05,dx:80});if(kn)crest(p.x+p.face*60,p.y-170,.45);else splash(p.x+p.face*70,p.y-60,14,1);shake=Math.max(shake,8)}
  if(P.attack&&t>.14){if(!p.ground)xAir();else xHit(1);break}if(t>.14&&xCancel())break;if(t>.45||(p.ground&&t>.18))p.state='normal';break;
 case 'knair':case 'piair':p.vy=Math.min(p.vy,140);
  if(at(.04)){const col=p.xair%2?X.col:X.col2;slash(p.xq||'flat',col,{scale:kn?1.4:1.25,lvl:Math.min(8,p.xair+2),dx:85,col2:X.col2});xStrike(S,kn?175:160,200);if(kn)spark(p.x+p.face*80,p.y-75,10,[KG,'#fff']);else splash(p.x+p.face*80,p.y-75,6)}
  if(t>.08&&P.attack){if(K.down)xDive();else if(!xAir())p.state='normal';break}if(t>.1&&xCancel())break;if(t>.3||p.ground)p.state='normal';break;
 case 'kndive':case 'pidive':p.vy=kn?1300:1150;if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR[fa('idle')])[0],face:p.face,l:.22,blue:1});
  if(p.ground){areaHit(p.x,p.y,kn?200:170,S);shake=kn?16:12;waves.push({x:p.x,y:p.y,r:10,l:1,big:true});
   if(kn){R9.cracks.push(mkCrack(p.x,3));crest(p.x,p.y-150,.6);clang();for(let k=0;k<16;k++)sparks.push({x:p.x+(Math.random()-.5)*80,y:GROUND,vx:(Math.random()-.5)*500,vy:-200-Math.random()*400,l:.6,c:k%2?'#b98a55':KG})}
   else{splash(p.x,GROUND,30,1);tide(p.x,p.face,false);splashS()}act('land',fa('land'));p.vx=p.face*120}break;
 case 'kntail':p.vx*=Math.pow(.01,dt);if(!p.ground)p.vy=Math.min(p.vy,120);
  if(t>.07&&P.attack){knRiposte(false);break}if(t>.15&&(P.tail||P.swat||P.hiss)){xTail();break}if(t>.12&&(P.jump||P.dash||P.special||P.blink)&&xCancel())break;
  if(t>(K.tail&&t<1.2?1.2:.48))p.state='normal';break;
 case 'knriposte':p.vx*=Math.pow(.03,dt);
  if(t>.08&&!p.shot){p.shot=true;C.atk++;setAnim('kn_counter',true);slash('rise',KG,{scale:1.5,lvl:7,dx:95,col2:KBL});sLine(p.x+p.face*30,p.y-90,p.x+p.face*230,p.y-60,'#fff',.3,10);
   for(const d of dummies)if(d.alive){const dx=(d.x-p.x)*p.face;if(dx>-40&&dx<250&&Math.abs(d.y-p.y)<200){hitDummy(d,'knriposte',p.face);if(p.rip&&p.rip.perf)d.stun=1.2}}}
  if(t>.22){if(P.attack){if(p.ground)xHit(p.rip&&p.rip.perf?4:1);else xAir();break}if(xCancel())break}if(t>.46)p.state='normal';break;
 case 'pitail':{p.vx*=Math.pow(.05,dt);if(!p.ground)p.vy=Math.min(p.vy,100);const q=p.hk,R=330;
  q.tip=t<.06?0:t<.17?(t-.06)/.11*R:Math.max(0,R*(1-(t-.17)/.15));
  if(t>.06&&t<.2&&!q.hit){for(const d of dummies){if(!d.alive)continue;const dx=(d.x-p.x)*p.face;if(dx>0&&Math.abs(dx-q.tip)<70&&d.y>p.y-200&&d.y-150<p.y+20){q.hit=d;C.atk++;hitDummy(d,q.n===3?'pihook3':'pihook',p.face);clang();splash(d.x,d.y-80,8);if(q.n===3){d.vy=-900;d.fl=.55}break}}}
  if(q.hit&&q.hit.alive&&t>.17&&t<.34&&q.n<3){const d=q.hit;d.x+=((p.x+p.face*120)-d.x)*Math.min(1,dt*10);d.vx=0}
  if(t>.16&&(P.tail||P.swat||P.hiss)&&!p.tq){p.tq=1}if(p.tq&&t>.22){p.tq=0;xTail();break}
  if(t>.2&&P.attack){if(p.ground)xHit(1);else xAir();break}if(t>.22&&(P.jump||P.dash||P.special||P.blink)&&xCancel())break;if(t>.42){p.state='normal';p.tq=0}break}
 case 'kncharge':case 'picharge':p.vx*=Math.pow(.03,dt);if(!p.ground)p.vy=Math.min(p.vy,60);p.xc=Math.max(0,Math.min(1,(t-.3)/1));
  if(kn&&t>.5&&p.anim!=='kn_power')setAnim('kn_power');
  if(t>.3&&t%.045<dt){const a=Math.random()*6.283,R=130;sparks.push({x:p.x+Math.cos(a)*R,y:p.y-80+Math.sin(a)*R*.8,vx:-Math.cos(a)*300,vy:-Math.sin(a)*240,l:.4,c:kn?(Math.random()<.5?KG:'#fff'):(Math.random()<.5?PT:'#fff')})}
  if(p.xc>=1&&!p.xcFull){p.xcFull=true;flashT=Math.max(flashT,.08);say('FULLY CHARGED!',kn?KG:PT,true);waves.push({x:p.x,y:p.y-60,r:20,l:.8,big:true});if(kn)crest(p.x,p.y-170,.5);else parrot('SQUAWK!')}
  if(!K.special||t>2.6){p.xcFull=false;if(t<.3){kn?knShout():piPop()}else if(p.xc>=1){kn?knCrest():piBroadside()}else{kn?knWave(p.xc):piCannon(p.xc)}}break;
 case 'knshout':p.vx*=Math.pow(.05,dt);if(at(.08)){for(const d of dummies)if(d.alive){const dx=(d.x-p.x)*p.face;if(dx>-30&&dx<280&&Math.abs(d.y-p.y)<220)hitDummy(d,'knshout',p.face)}}
  if(t>.16&&xCancel())break;if(P.attack&&t>.16){if(p.ground)xHit(1);else xAir();break}if(t>.4)p.state='normal';break;
 case 'pipop':p.vx*=Math.pow(.05,dt);if(at(.08)){popS();R10.proj.push({k:'pop',x:p.x+p.face*95,y:p.y-100,vx:p.face*1300,vy:0,g:0,l:.6,s:1,face:p.face,hit:new Set(),kb:'pipop'});
   for(let i=0;i<6;i++)puffs.push({x:p.x+p.face*(100+Math.random()*20),y:p.y-100+(Math.random()-.5)*16,vx:p.face*(30+Math.random()*60),vy:-10-Math.random()*30,r:9+Math.random()*7,l:.6});shake=Math.max(shake,4)}
  if(t>.14&&xCancel())break;if(P.attack&&t>.14){if(p.ground)xHit(1);else xAir();break}if(t>.36)p.state='normal';break;
 case 'knwave':case 'picannon':p.vx*=Math.pow(.05,dt);if(t>.16&&xCancel())break;if(P.attack&&t>.18){if(p.ground)xHit(1);else xAir();break}if(t>.42)p.state='normal';break;
 case 'kncrest':p.vx*=Math.pow(.05,dt);if(!p.ground)p.vy=Math.min(p.vy,40);if(t>1)p.state='normal';break;
 case 'pibroad':p.vx*=Math.pow(.05,dt);if(t>.5&&xCancel())break;if(t>.8)p.state='normal';break;
 case 'knrush':{const q=p.rush;if(t<.1){p.vx*=Math.pow(.02,dt)}else{if(p.anim!=='kn_rush')setAnim('kn_rush',true);p.vx=t<.32?p.face*1500:p.vx*Math.pow(.004,dt);if(!p.ground)p.vy=Math.min(p.vy,40);
   if(t<.32&&t%.025<dt){ghosts.push({x:p.x,y:p.y,f:(FR.kn_rush||FR.kn_idle)[0],face:p.face,l:.25,blue:1});sparks.push({x:p.x-p.face*40,y:p.y-60+(Math.random()-.5)*60,vx:-p.face*300,vy:(Math.random()-.5)*80,l:.35,c:Math.random()<.5?KG:'#fff'})}
   if(t<.34)for(const d of dummies){if(!d.alive||q.hit.has(d))continue;if(Math.abs(d.x-p.x)<110&&d.y>p.y-200&&d.y-150<p.y+20){q.hit.add(d);C.atk++;hitDummy(d,'knrush',p.face);crest(d.x,d.y-140,.5);clang()}}}
  if(at(.33))sLine(q.x0,p.y-72,p.x,p.y-72,KG,.5,14);
  if(t>.36){if(P.attack){if(p.ground)xHit(q.hit.size?3:1);else xAir();break}if(xCancel())break}if(t>.55)p.state='normal';break}
 case 'piroll':{const q=p.rush;if(t<.3){p.rot=p.face*t*22;p.vx=p.face*950;if(t%.04<dt)puffs.push({x:p.x-p.face*30,y:p.y-15,vx:-p.face*60,vy:-20,r:10,l:.4})}
  else{if(!q.out){q.out=true;p.rot=0;setAnim('pi_rollout',true);slash('flat',PG,{scale:1.3,lvl:6,dx:90,col2:PT});xStrike('piroll',190,190);splash(p.x+p.face*90,p.y-70,8)}p.vx*=Math.pow(.01,dt)}
  if(t<.3)for(const d of dummies){if(!d.alive||q.hit.has(d))continue;if(Math.abs(d.x-p.x)<70&&Math.abs(d.y-p.y)<150){q.hit.add(d);C.atk++;hitDummy(d,'piroll',p.face)}}
  if(t>.34){if(P.attack){if(p.ground)xHit(3);else xAir();break}if(xCancel())break}if(t>.55){p.state='normal';p.rot=0}break}
 case 'piswing':{const s=p.sw,u=Math.min(1,t/.55),e=u*u*(3-2*u),th=s.th0+(1.75)*e;p.face=s.face;p.vx=0;p.vy=0;
  p.x=clampX(s.ax+s.face*s.L*Math.sin(th));p.y=Math.min(floorAt(p.x)-4,s.ay+s.L*Math.cos(th)+150);p.ground=false;
  if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.pi_idle)[p.fi],face:p.face,l:.18,blue:1});
  for(const d of dummies){if(!d.alive||s.hit.has(d))continue;if(Math.abs(d.x-p.x)<120&&d.y>p.y-160&&d.y-170<p.y+40){s.hit.add(d);C.atk++;hitDummy(d,'piswing',p.face);splash(d.x,d.y-80,10)}}
  if(P.attack&&t>.2){p.vx=p.face*500;p.vy=-300;xAir();break}
  if(u>=1){p.state='normal';p.vx=p.face*560;p.vy=-480;setAnim('pi_apex',true)}break}
 case 'piflip':p.rot=p.face*Math.min(1,t/.45)*6.283;p.vx+=(dir*480-p.vx)*Math.min(1,dt*5);if(P.attack&&t>.1){p.rot=0;xAir();break}if(P.down){p.rot=0;xDive();break}if(t>.45||p.ground){p.rot=0;p.state='normal'}break;
 case 'knfinal':knFinalState(dt);break;
 case 'pifinal':piFinalState(dt);break;
 default:p.state='normal'}}
// ---- forms 3 & 4 load only when they're needed ----
const XPRE=[null,null,null,'kn','pi'];
function formReady(f){if(f>=5)return ufReady(f-4);const q=XPRE[f];if(!q)return true;return formFramesIn(q)}
function requestForm(f){if(typeof loadForm==='function')loadForm(XPRE[f],true);if(!p.morphWait||p.morphWait.f!==f){p.morphWait={f,t:now};say(f===3?'SUITING UP…':'HOISTING THE SAILS…',f===3?KG:PT)}}
// ---- the LINK moves (after a C C C / T T T opener) for Knight and Pirate ----
function xLkStart(L){const f=FORM(),fl=LKF[f],rep=LK.n>0&&LK.seq.slice(-1)===L;
 LK.seq+=L;LK.n++;LK.buf=null;LK.beat=false;LK.on=true;lastTokT=-9;LK.lastSeq=LK.seq;LK.lastT=now;p.xcombo=0;
 const route=ROUTES[f].find(r=>r.k===LK.seq);pracCheck(LK.seq);
 if(route&&route.ult){xUltStart(f,route);return}
 const mv=fl[rep?L+L:L],tg=lkTarget();act('lk',mv.a);p.lk={L,rep,route,tg,nm:mv.nm,x0:p.x,y0:p.y,ex:null};p.rot=0;p.vx=0;C.atk++;extend();
 if(!route)lkSay(mv.nm,L==='C'?fl.col2:fl.col);popNum(LK.seq.length,fl.col);beat(520+LK.n*70,.04);
 if(L==='C'&&rep){p.vy=-430;p.ground=false;p.jumps=Math.max(p.jumps,1)}
 if(L==='T'&&rep&&f===3){p.vy=-380;p.ground=false;p.jumps=Math.max(p.jumps,1)}
 if(L==='B'){if(tg&&Math.abs(tg.x-p.x)>20)p.face=tg.x>p.x?1:-1;p.lk.ex=tg?clampX(tg.x+p.face*110):clampX(p.x+p.face*280)}
 if(route)routeFx(f,route)}
function xLkState(dt){const q=p.lk;if(!q){p.state='normal';return}const t=p.t,f=FORM(),kn=f===3,fl=LKF[f],tg=q.tg&&q.tg.alive?q.tg:null,at=T=>t>=T&&t-dt<T;
 p.hang=Math.max(p.hang,.1);if(!p.ground&&!(q.rep&&(q.L==='C'||q.L==='T')&&t<.3))p.vy=Math.min(p.vy,160);
 if(tg&&q.L!=='B'&&t<.12){const want=tg.x-p.face*(q.L==='M'?160:q.L==='T'&&!kn?200:95);if(Math.abs(tg.x-p.x)>30)p.face=tg.x>p.x?1:-1;p.x+=(want-p.x)*Math.min(1,dt*16);p.vx=0;
  if(tg.y<GROUND-70&&q.L!=='M'&&!(q.L==='T'&&!kn)){const wy=Math.min(floorAt(p.x),tg.y+45);p.y+=(wy-p.y)*Math.min(1,dt*14);p.ground=false;p.vy=Math.min(p.vy,0)}}
 else if(q.L!=='B')p.vx*=Math.pow(.02,dt);
 const dir=tg?Math.sign(tg.x-p.x)||p.face:p.face;
 switch(q.L){
  case 'C': if(kn){if(!q.rep){if(at(.1)){slash('over',KG,{lvl:7,scale:1.4,col2:KBL,dx:95});lkHit('lkC',dir);waves.push({x:p.x+p.face*100,y:GROUND,r:10,l:.8,big:true});shake=Math.max(shake,10)}}
    else{if(at(.09)){slash('rise',KG,{lvl:7,scale:1.4,col2:KBL,dx:85});lkHit('lkC2',dir)}if(at(.2)){slash('up','#fff',{lvl:7,scale:1.3,dx:70});lkHit('lkC2',dir);crest(p.x+p.face*70,p.y-180,.45)}}}
   else{if(!q.rep){for(const T of [.03,.09,.15])if(at(T)){setAnim(T===.09?'pi_h3':'pi_h2',true);slash(T===.09?'up':'down',T===.09?PG:PT,{lvl:6,scale:1.2,dx:80});lkHit(T<.15?'lkT':'lkC',dir);splash(p.x+p.face*80,p.y-70,5)}}
    else{if(at(.05)){slash('rise',PT,{lvl:7,scale:1.4,col2:PG,dx:80});lkHit('lkC2',dir);splash(p.x+p.face*70,p.y-70,12,1)}if(at(.16)){slash('up','#fff',{lvl:7,scale:1.3,dx:70});lkHit('lkC2',dir)}}}break;
  case 'T': if(kn){if(!q.rep){if(at(.08)){clang();lkHit('lkT',dir);if(tg)tg.vx=dir*420;R9.rings.push({x:p.x+p.face*70,y:p.y-80,r:20,vr:800,l:.9,col:KBL,col2:KG,w:12,f:3,face:p.face});spark(p.x+p.face*80,p.y-80,16,[KBL,KG,'#fff'],320);shake=Math.max(shake,9)}}
    else if(at(.05)||at(.13)||at(.21)||at(.29)){lkHit('lkT2',dir);slash('spin',t<.2?KG:KBL,{lvl:6,scale:1.2});if(at(.21))clang()}}
   else{if(!q.rep){q.tip=t<.04?0:t<.12?(t-.04)/.08:1;if(at(.12)){lkHit('lkT',dir);clang();splash(tg?tg.x:p.x+p.face*200,(tg?tg.y:p.y)-80,8)}if(tg&&t>.12&&t<.3){tg.x+=((p.x+p.face*120)-tg.x)*Math.min(1,dt*9);tg.vx=0}}
    else if(at(.06)||at(.14)||at(.22)||at(.3)){lkHit('lkT2',dir);splash(p.x+Math.cos(t*30)*120,p.y-60,5)}}break;
  case 'M': if(kn){if(at(.07)){R9.rings.push({x:p.x+p.face*60,y:p.y-80,r:20,vr:q.rep?1150:850,l:1,col:KG,col2:'#fff',w:q.rep?16:11,f:3,face:p.face});meowSound(q.rep?.9:.4);bubble={t:q.rep?'DIVINE MEOW!!':'MEOW!',l:1,big:q.rep};lkHit(q.rep?'lkM2':'lkM',p.face);if(q.rep)crest(p.x+p.face*120,p.y-140,.8);shake=Math.max(shake,q.rep?11:6)}}
   else{if(at(.07)){popS();if(q.rep)boom();lkHit(q.rep?'lkM2':'lkM',p.face);const n=q.rep?14:6;for(let i=0;i<n;i++)puffs.push({x:p.x+p.face*(105+Math.random()*25),y:p.y-(q.rep?95:100)+(Math.random()-.5)*20,vx:p.face*(40+Math.random()*90),vy:-15-Math.random()*40,r:(q.rep?14:9)+Math.random()*10,l:.7});
    if(q.rep){splash(tg?tg.x:p.x+p.face*200,(tg?tg.y:p.y)-80,22,1);R9.rings.push({x:tg?tg.x:p.x+p.face*200,y:(tg?tg.y:p.y)-80,r:20,vr:900,l:.9,col:PT,col2:'#fff',w:12,f:4,face:0})}else sLine(p.x+p.face*95,p.y-100,tg?tg.x:p.x+p.face*300,(tg?tg.y:p.y)-90,'#fff',.2,4);shake=Math.max(shake,q.rep?10:5)}}break;
  case 'B': {const x1=q.ex;
   if(kn){if(t<.06){p.vx=0}else if(t<.18){if(p.anim!=='kn_rush')setAnim('kn_rush',true);const u=(t-.06)/.12;p.x+=(x1-p.x)*Math.min(1,dt*22);if(t%.02<dt){ghosts.push({x:p.x,y:p.y,f:(FR.kn_rush||FR.kn_idle)[0],face:p.face,l:.25,blue:1})}}
    if(at(.13)){lkHit(q.rep?'lkB2':'lkB',p.face);sLine(q.x0,p.y-72,x1,p.y-72,KG,.45,14);crest(tg?tg.x:x1,(tg?tg.y:p.y)-130,.5)}
    if(t>.2&&tg&&Math.abs(tg.x-p.x)>30)p.face=tg.x>p.x?1:-1}
   else{if(t<.16){p.rot=p.face*t*30;p.x+=(x1-p.x)*Math.min(1,dt*(q.rep?10:18));if(q.rep){const u=t/.16;p.y=Math.min(floorAt(p.x),q.y0-Math.sin(u*Math.PI)*170);p.ground=false}if(t%.03<dt)puffs.push({x:p.x,y:p.y-20,vx:0,vy:-20,r:10,l:.35})}
    else{p.rot=0;if(at(.16)){setAnim(q.rep?'pi_h7':'pi_rollout',true);if(tg)p.face=tg.x>p.x?1:-1;slash('flat',PG,{lvl:7,scale:1.3,col2:PT,dx:90});lkHit(q.rep?'lkB2':'lkB',p.face);splash(p.x+p.face*90,p.y-70,10)}}}}break;}
 if(!LK.beat&&t>=LKW){LK.beat=true;if(!LK.dead)beat(880+LK.n*60,.035)}
 if(LK.buf&&t>=LKW){p.rot=0;const b=LK.buf;lkStart(b);return}
 if(t>LKD){p.rot=0;lkEnd()}}
// ---- named-string flair for Knight / Pirate ----
function xRouteFx(f,r,x,y){if(f===3){crest(x,y-60,r.ult?1.5:1,{l:1.4});clang();for(let i=0;i<10;i++){const a=i/10*6.283;sparks.push({x,y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,l:.5,c:i%2?KG:'#fff'})}
  if(r.fx==='nova'){for(let i=0;i<3;i++)R9.rings.push({x,y,r:20+i*30,vr:1000,l:1.1,col:i%2?'#fff':KG,w:12,f:3,face:0})}
  if(r.fx==='breaker'||r.fx==='castle'){R9.cracks.push(mkCrack(x,3));boom()}if(r.fx==='crest'){cine.pillar={x,l:1,col:KG}}if(r.fx==='royal'){cine.pillar={x,l:1,col:KG};for(let i=0;i<20;i++)R9.confetti.push({x,y,vx:(Math.random()-.5)*700,vy:-200-Math.random()*400,l:1.4,c:i%2?KG:KBL,heart:0})}}
 else{splash(x,y,26,1);coinBurst(x,y,r.fx==='treasure'?40:10);splashS();if(r.fx==='broadside'){parrot('BROADSIDE!');for(let i=0;i<3;i++)R10.proj.push({k:'arc',x:p.x-p.face*(520+i*90),y:-camY-60-i*40,tx:x,ty:y,t:0,d:.4+i*.12,l:3,s:1.2,face:p.face,hit:new Set(),kb:'pifhit'})}
  if(r.fx==='whirl')R10.whirl={x,l:1.2,r:140,hit:1};if(r.fx==='treasure'||r.fx==='swash')parrot(r.fx==='treasure'?'PIECES OF EIGHT!':'YO HO!');if(r.fx==='aweigh'||r.fx==='blitz')tide(x-p.face*150,p.face,false)}}
// ---- ULTIMATES: ROYAL JUDGEMENT (Knight) and CAPTAIN'S TIDAL WAVE (Pirate) ----
function xUltStart(f,r){const tg=lkTarget(),kn=f===3;act('lkult',kn?'kn_ultA':'pi_ultA');p.ult={f,r,tg,boom:false,hits:0,k:0,x0:p.x};p.vx=0;p.vy=0;p.rot=0;
 NAMES.lkU=kn?'SMITE!':'SWASH!';NAMES.lkUfin=kn?'JUDGEMENT!!':'SPLASHDOWN!!';LK.on=false;LK.seq='';LK.n=0;LK.buf=null;cineGo(1.32,.45);slowT=.12;flashT=.15;shake=10;beat(1320,.06);
 lkSay(kn?'BY THE CROWN…':'ALL HANDS ON DECK…',LKF[f].col2);if(kn){R10.holy={l:0,on:1};crest(p.x,p.y-150,1.3,{l:1.2});clang()}else{R10.sea={l:0,on:1};parrot('AHOY!!')}
 for(let i=0;i<4;i++)waves.push({x:p.x,y:p.y-30*i,r:10+i*20,l:1,big:true})}
function xUltState(dt){const u=p.ult,t=p.t,f=u.f,kn=f===3,fl=LKF[f],g=u.tg&&u.tg.alive?u.tg:null,at=T=>t>=T&&t-dt<T,ease=x=>x*x*(3-2*x),gx=g?g.x:clampX(u.x0+p.face*180);p.vx=0;p.vy=0;
 if(!kn&&t<1.45)p.rot=0;
 if(g&&!u.boom){g.vx=0;g.vy=0;g.fl=.6;g.hp=Math.max(3,g.hp);const gy=t<1?GROUND-150-Math.min(1,t)*120:GROUND-40;g.y+=(gy-g.y)*Math.min(1,dt*(t<1?5:16));g.x+=(gx-g.x)*.1}
 const TOP=GROUND-(kn?380:350);
 if(t<.6){p.y+=(GROUND-p.y)*Math.min(1,dt*9);p.ground=p.y>GROUND-2;
  if(t%.03<dt){const a=Math.random()*6.283,R=160;sparks.push({x:p.x+Math.cos(a)*R,y:p.y-80+Math.sin(a)*R,vx:-Math.cos(a)*320,vy:-Math.sin(a)*320,l:.45,c:Math.random()<.5?fl.col:fl.col2})}
  if(!kn&&t%.06<dt)splash(p.x+(Math.random()-.5)*500,GROUND,2)}
 else if(t<.72){setAnim(kn?'kn_ultB':'pi_ultB')}
 else if(t<1.12){const u2=ease((t-.72)/.4);setAnim(kn?'kn_ultC':'pi_ultC');p.y+=((GROUND-u2*(GROUND-TOP))-p.y)*Math.min(1,dt*14);p.x+=((gx-p.face*70)-p.x)*Math.min(1,dt*6);p.ground=false;
  if(!kn)p.rot=p.face*u2*6.283*2;if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR[fa('idle')])[p.fi],face:p.face,l:.25,blue:1});
  u.k-=dt;if(g&&u.k<=0){u.k=.09;C.atk++;hitDummy(g,'lkU',p.face);g.vx=0;g.vy=0;u.hits++;if(kn){slash(['over','rise','cross'][u.hits%3],u.hits%2?KG:'#fff',{lvl:8,scale:1.2,dx:70})}else{splash(gx,g.y-80,8);slash(['down','up','flat'][u.hits%3],u.hits%2?PT:PG,{lvl:8,scale:1.2,dx:70})}}}
 else if(t<1.42){p.rot=0;setAnim(kn?'kn_ultD':'pi_ultC');p.y+=(TOP-p.y)*Math.min(1,dt*10);
  if(kn){if(!R10.blade)R10.blade={l:0};R10.blade.l=Math.min(1,R10.blade.l+dt*4);if(at(1.13)){flashT=.15;say('JUDGEMENT…','#fff',true);cine.tz=1.6;cine.tdim=.6}}
  else{if(at(1.13)){parrot('FIRE!!');for(let i=0;i<3;i++)R10.proj.push({k:'arc',x:p.x-p.face*(560+i*80),y:TOP-120-i*40,tx:gx,ty:(g?g.y:GROUND-150)-40,t:0,d:.14+i*.07,l:2,s:1.2,face:p.face,hit:new Set(),kb:'lkU'});say('BROADSIDE…','#fff',true);cine.tz=1.6;cine.tdim=.55}}}
 else if(t<1.6){const u4=ease((t-1.42)/.18);setAnim(kn?(FR.kn_ultP?'kn_ultP':'kn_dive'):'pi_dive');p.y=Math.min(GROUND,TOP+(GROUND-TOP)*u4);if(t>1.58)p.y=GROUND;p.x+=((gx-p.face*80)-p.x)*Math.min(1,dt*10);ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR[fa('idle')])[0],face:p.face,l:.3,blue:1})}
 else{p.y=GROUND;p.ground=true;p.rot=0;
  if(!u.boom){u.boom=true;setAnim(kn?'kn_ultE':'pi_ultE',true);boom();const x=gx;if(kn)clang();else splashS();
   if(g){g.hp=Math.min(g.hp,1);hitDummy(g,'lkUfin',p.face);g.vy=-2500;g.vx=p.face*260;g.fl=1}
   shake=42;slowT=.9;flashT=.4;hitstop=.12;cine.tz=1.12;cine.tdim=.25;cine.pillar={x,l:1.4,col:fl.col};
   R9.cracks.push(mkCrack(x,f));for(let i=0;i<6;i++)waves.push({x,y:GROUND-4+i*3,r:10+i*35,l:1,big:true});
   for(let i=0;i<4;i++)R9.rings.push({x,y:GROUND-60,r:20+i*40,vr:1400-i*150,l:1.2,col:i%2?fl.col2:fl.col,w:18-i*3,f,face:0,flat:1});burst(x,GROUND-60,1);burst(x,GROUND-140);
   for(let i=0;i<110;i++){const a=Math.random()*6.283,v=250+Math.random()*900;sparks.push({x,y:GROUND-60,vx:Math.cos(a)*v,vy:Math.sin(a)*v-300,l:.9,c:[fl.col,fl.col2,'#fff','#ffe14d'][i%4]})}
   for(let i=0;i<26;i++)sparks.push({x:x+(Math.random()-.5)*300,y:GROUND,vx:(Math.random()-.5)*500,vy:-300-Math.random()*700,l:.9,c:'#b98a55'});
   if(kn){crest(x,GROUND-200,2.1,{l:2});R10.blade=null;for(let i=0;i<30;i++)R9.confetti.push({x,y:GROUND-120,vx:(Math.random()-.5)*900,vy:-300-Math.random()*600,l:1.8,c:i%2?KG:KBL,heart:0})}
   else{tide(x-p.face*420,p.face,true);tide(x+p.face*420,-p.face,true);splash(x,GROUND-40,90,true);coinBurst(x,GROUND-150,50)}
   card(u.r.nm+'!!','ULTIMATE · '+u.r.k.split('').join(' '),fl.col)}
  if(t>2.2&&p.anim!==(kn?'kn_ultF':'pi_ultF'))setAnim(kn?'kn_ultF':'pi_ultF');
  if(t>3){p.state='normal';p.ult=null;if(R10.holy)R10.holy.on=0;if(R10.sea)R10.sea.on=0;LK.lastT=now}}}
// ---- link + route tables for forms 3 and 4 ----
LKF.push({col:KG,col2:KBL,C:{nm:'CRUSHING CLEAVE!',a:'kn_h3'},CC:{nm:'MOUNTAIN CLEAVE!',a:'kn_launch'},T:{nm:'SHIELD BASH!',a:'kn_h4'},TT:{nm:'SHIELD STORM!',a:'kn_h6'},
  M:{nm:'HOLY SHOUT!',a:'kn_shout'},MM:{nm:'DIVINE ROAR!',a:'kn_shout'},B:{nm:'LANCE RUSH!',a:'kn_rushA'},BB:{nm:'TWIN LANCE!',a:'kn_rushA'}},
 {col:PT,col2:PG,C:{nm:'CUTLASS FLURRY!',a:'pi_h2'},CC:{nm:'SEVEN SEAS SLASH!',a:'pi_launch'},T:{nm:'ANCHOR HOOK!',a:'pi_hook'},TT:{nm:'ANCHOR SPIN!',a:'pi_h5'},
  M:{nm:'FLINTLOCK POP!',a:'pi_pop'},MM:{nm:'CANNON BLAST!',a:'pi_cannon'},B:{nm:'BARREL ROLL!',a:'pi_roll'},BB:{nm:'ROPE SWING!',a:'pi_swing'}});
ROUTES.push(
 [{k:'CCCB',nm:'LANCE OF LIGHT!',fx:'lance',tip:'a blazing lance rush straight through him'},{k:'CCCM',nm:'HOLY NOVA!',fx:'nova',tip:'a battle-meow that bursts into rings of holy light'},
  {k:'CCCTT',nm:'SHIELD BREAKER!',fx:'breaker',tip:'shield bash, then a spinning shield storm that cracks the ground'},{k:'TTTMM',nm:'CREST OF VALOUR!',fx:'crest',tip:'three guards, then a giant glowing crest and a pillar of light'},
  {k:'CCCCCT',nm:'CASTLE CRUSHER!',fx:'castle',tip:'5 heavy timed cleaves, then a ground-cracking shield bash'},{k:'TTTCCC',nm:'GREATSWORD GALE!',fx:'gale',tip:'guard x3 into a rising whirlwind of cleaves'},
  {k:'CCCMBBTT',nm:'ROYAL CHARGE!',fx:'royal',tip:'holy shout, twin lance rush, shield storm juggle'},{k:'TTTMCTMC',nm:'ROYAL JUDGEMENT',ult:1,tip:'ULTIMATE: crest in the sky, a giant sword of light, a quake that splits the ground'}],
 [{k:'CCCB',nm:'BARREL BLITZ!',fx:'blitz',tip:'barrel-roll right through him and slash out'},{k:'CCCM',nm:'POINT BLANK POP!',fx:'pointblank',tip:'flintlock pop in a big cartoon puff'},
  {k:'CCCTT',nm:'ANCHORS AWEIGH!',fx:'aweigh',tip:'hook him in, then whirl the anchor round'},{k:'TTTMM',nm:'BROADSIDE!',fx:'broadside',tip:'three anchor hooks, then cannonballs rain in from the ship'},
  {k:'CCCCCB',nm:'SWASHBUCKLE SWING!',fx:'swash',tip:'5 timed cutlass cuts, then a barrel-roll finish'},{k:'TTTCCC',nm:'WHIRLPOOL!',fx:'whirl',tip:'anchor hooks into a spinning ocean whirlpool juggle'},
  {k:'CCCMBBTT',nm:'TREASURE STORM!',fx:'treasure',tip:'pop, roll, rope swing, anchor spin – showered in gold'},{k:'CCCTCBMM',nm:"CAPTAIN'S TIDAL WAVE",ult:1,tip:'ULTIMATE: corkscrew leap, the ship fires a broadside, a giant wave crashes down'}]);
// ---- per-frame update ----
function r10Update(dt){
 p.xcT=(p.xcT||0)-dt;if(p.xcT<=0&&!XST.has(p.state))p.xcombo=0;p.hookT=(p.hookT||0)-dt;if(p.hookT<=0)p.hookN=0;
 if(p.morphWait){const w=p.morphWait;if(now-w.t>6||formReady(w.f)){p.morphWait=null;setForm(w.f,true)}else if(Math.random()<dt*20)spark(p.x+(Math.random()-.5)*120,p.y-Math.random()*150,1,w.f===3?[KG,'#fff']:[PT,'#fff'],120)}
 if(!R10.pre&&started&&now>14&&window.SPRITES&&SPRITES.loaded+SPRITES.failed.length>=SPRITES.total&&typeof loadForm==='function'){R10.pre=1;loadForm('kn');loadForm('pi')}
 for(const c of R10.crests){c.t+=dt}R10.crests=R10.crests.filter(c=>c.t<c.l);
 for(const d of R10.drops){d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=1300*dt;d.l-=dt;if(d.y>GROUND+6){d.l=0}}R10.drops=R10.drops.filter(d=>d.l>0);if(R10.drops.length>400)R10.drops.splice(0,R10.drops.length-400);
 for(const c of R10.coins){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=1100*dt;c.ph+=dt*12;c.l-=dt;if(c.y>GROUND-4&&c.vy>0){c.y=GROUND-4;c.vy*=-.45;c.vx*=.7}}R10.coins=R10.coins.filter(c=>c.l>0);
 for(const w of R10.tides){w.t+=dt;w.x+=w.dir*(w.big?720:520)*dt;for(const d of dummies)if(d.alive&&!w.hit.has(d)&&Math.abs(d.x-w.x)<90&&d.y>GROUND-(w.big?260:160)&&!(p.state==='lkult'||CINE.includes(p.state))){w.hit.add(d);C.atk++;hitDummy(d,'piwave',w.dir)}
  if(Math.random()<dt*30)splash(w.x+w.dir*30,GROUND-(w.big?150:90)*Math.min(1,w.t*4),2)}R10.tides=R10.tides.filter(w=>w.t<w.l);
 if(R10.whirl){const w=R10.whirl;w.l-=dt;if(w.hit&&(w.k=(w.k||0)-dt)<=0){w.k=.1;C.atk++;for(const d of dummies)if(d.alive&&Math.abs(d.x-w.x)<200&&Math.abs(d.y-GROUND)<420){d.x+=(w.x-d.x)*.2;hitDummy(d,'pifhit',Math.sign(d.x-w.x)||1)}}if(w.l<=0){if(w.hit){C.atk++;for(const d of dummies)if(d.alive&&Math.abs(d.x-w.x)<240)hitDummy(d,'piwave',p.face);splash(w.x,GROUND-80,30,1)}R10.whirl=null}}
 if(R10.parrot){const q=R10.parrot;q.t+=dt;q.x+=420*dt;q.y=-camY+140+Math.sin(q.t*6)*14;if(q.x>VW+120)R10.parrot=null}
 if(R10.holy){R10.holy.l+=((R10.holy.on?1:0)-R10.holy.l)*Math.min(1,dt*3);if(!R10.holy.on&&R10.holy.l<.02)R10.holy=null}
 if(R10.sea){R10.sea.l+=((R10.sea.on?1:0)-R10.sea.l)*Math.min(1,dt*2.5);if(!R10.sea.on&&R10.sea.l<.02)R10.sea=null}
 if(R10.blade&&p.state!=='lkult')R10.blade=null;
 if(p.xcr){const c=p.xcr;c.t-=dt;c.k-=dt;if(c.k<=0){c.k=.09;C.atk++;for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<320&&Math.abs(d.y-p.y)<360){d.x+=(p.x+p.face*90-d.x)*.2;hitDummy(d,'kncrest',Math.sign(d.x-p.x)||p.face)}}
  if(c.t<=0){p.xcr=null;C.atk++;areaHit(p.x,p.y,340,'kncrestfin');crest(p.x,p.y-160,1.4);shake=18;flashT=Math.max(flashT,.15);boom();waves.push({x:p.x,y:p.y-40,r:20,l:1,big:true})}}
 for(const s of R10.proj){s.l-=dt;
  if(s.k==='arc'){s.t+=dt;const u=Math.min(1,s.t/s.d);if(!s.sx){s.sx=s.x;s.sy=s.y}s.x=s.sx+(s.tx-s.sx)*u;s.y=s.sy+(s.ty-s.sy)*u-Math.sin(u*Math.PI)*120;if(Math.random()<.6)puffs.push({x:s.x,y:s.y,vx:0,vy:-10,r:6+Math.random()*5,l:.4});
   if(u>=1){s.l=0;splash(s.x,s.y,14,1);boom();shake=Math.max(shake,12);for(const d of dummies)if(d.alive&&Math.abs(d.x-s.x)<140&&Math.abs(d.y-60-s.y)<200){C.atk++;hitDummy(d,s.kb,s.face);if(s.kb==='lkU'){d.vx=0;d.vy=0}}waves.push({x:s.x,y:s.y,r:10,l:.8,big:true})}continue}
  s.x+=s.vx*dt;s.y+=(s.vy||0)*dt;if(s.g)s.vy+=s.g*dt;
  if(s.k==='ball'||s.k==='pop'){if(Math.random()<.7)puffs.push({x:s.x-s.face*10,y:s.y,vx:-s.face*20,vy:-10,r:(s.k==='ball'?7:4)+Math.random()*5,l:.35})}
  if(s.k==='wave'&&Math.random()<.8)sparks.push({x:s.x-s.face*20,y:GROUND-Math.random()*90*s.s,vx:-s.face*120,vy:-60,l:.35,c:Math.random()<.5?KG:'#fff'});
  for(const d of dummies){if(!d.alive||s.hit.has(d))continue;const R=s.k==='wave'?60*s.s:s.k==='ball'?50*s.s:34;if(Math.abs(d.x-s.x)<R&&s.y>d.y-(d.h||150)-20&&s.y<d.y+20){s.hit.add(d);C.atk++;if(!s.fin)hitDummy(d,s.kb,s.face);
    if(s.k!=='wave'){if(!s.fin)s.l=0;splash(s.x,s.y,s.k==='ball'?18:6,s.k==='ball');if(s.k==='ball')boom()}else crest(d.x,d.y-140,.4)}}
  if((s.x>WALL_X-20&&s.y>WT&&s.vx>0)||s.x<10||s.x>VW+60){s.l=0;if(s.k!=='wave')splash(s.x,s.y,6)}}
 R10.proj=R10.proj.filter(s=>s.l>0)}
const _r9Pre10=r9Pre;r9Pre=function(dt){r10Update(dt);_r9Pre10(dt)};
// ---- drawing ----
function drawCrest(x,y,s,a,rot){ctx.save();ctx.translate(x,y);ctx.globalAlpha=a;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.rotate(rot);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);const g=ctx.createLinearGradient(0,0,0,-170*s);g.addColorStop(0,'rgba(255,230,140,.55)');g.addColorStop(1,'rgba(255,230,140,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-10*s,0);ctx.lineTo(0,-170*s);ctx.lineTo(10*s,0);ctx.fill()}ctx.restore();
 ctx.scale(s,s);const sh=()=>{ctx.beginPath();ctx.moveTo(-46,-50);ctx.lineTo(46,-50);ctx.lineTo(46,0);ctx.quadraticCurveTo(44,40,0,62);ctx.quadraticCurveTo(-44,40,-46,0);ctx.closePath()};
 sh();ctx.fillStyle='#e8b830';ctx.fill();ctx.save();ctx.scale(.84,.84);sh();ctx.fillStyle='#2554b8';ctx.fill();ctx.restore();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,12,15,12,0,0,6.283);ctx.fill();for(const [dx,dy] of [[-17,-8],[-6,-17],[6,-17],[17,-8]]){ctx.beginPath();ctx.ellipse(dx,dy,5.5,7,0,0,6.283);ctx.fill()}
 ctx.strokeStyle='#fff6c0';ctx.lineWidth=3;sh();ctx.stroke();ctx.restore()}
function drawParrot(x,y,t){ctx.save();ctx.translate(x,y);const flap=Math.sin(t*22);
 ctx.fillStyle='#e8413c';ctx.beginPath();ctx.ellipse(0,0,22,13,-.15,0,6.283);ctx.fill();ctx.fillStyle='#2bb34a';ctx.beginPath();ctx.moveTo(-20,2);ctx.lineTo(-48,10);ctx.lineTo(-44,0);ctx.lineTo(-50,-4);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ffcf3f';ctx.beginPath();ctx.moveTo(-6,-4);ctx.quadraticCurveTo(-2,-34*flap,14,-6);ctx.closePath();ctx.fill();ctx.fillStyle='#2f7fe0';ctx.beginPath();ctx.moveTo(-4,-2);ctx.quadraticCurveTo(0,-24*flap,10,-4);ctx.closePath();ctx.fill();
 ctx.fillStyle='#e8413c';ctx.beginPath();ctx.arc(20,-8,10,0,6.283);ctx.fill();ctx.fillStyle='#f4e7c8';ctx.beginPath();ctx.moveTo(28,-10);ctx.quadraticCurveTo(38,-6,30,2);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(22,-11,3.5,0,6.283);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(23,-11,1.8,0,6.283);ctx.fill();ctx.restore()}
function drawAnchor(x,y,s,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);ctx.strokeStyle='#5d6670';ctx.lineWidth=6;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,18);ctx.stroke();ctx.beginPath();ctx.moveTo(-10,-12);ctx.lineTo(10,-12);ctx.stroke();ctx.beginPath();ctx.arc(0,4,16,.2,Math.PI-.2);ctx.stroke();
 ctx.beginPath();ctx.arc(0,-27,5,0,6.283);ctx.stroke();ctx.restore()}
function r10DrawWorld(){
 if(R10.holy&&R10.holy.l>.01){const a=R10.holy.l;ctx.save();ctx.globalCompositeOperation='lighter';const x=VW/2,y=-camY-40,g=ctx.createRadialGradient(x,y,20,x,y,700);g.addColorStop(0,`rgba(255,230,150,${.38*a})`);g.addColorStop(1,'rgba(255,200,80,0)');ctx.fillStyle=g;ctx.fillRect(-500,-camY-600,VW+1000,VH+800);
  ctx.translate(x,y);ctx.rotate(now*.2);for(let i=0;i<14;i++){ctx.rotate(Math.PI/7);ctx.fillStyle=`rgba(255,240,180,${.12*a})`;ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(0,900);ctx.lineTo(30,0);ctx.fill()}ctx.restore()}
 if(R10.sea&&R10.sea.l>.01){const a=R10.sea.l,top=GROUND+14-a*34;ctx.save();ctx.globalAlpha=.85;const g=ctx.createLinearGradient(0,top,0,GROUND+80);g.addColorStop(0,'#3fb9d6');g.addColorStop(1,'#145f8a');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-500,GROUND+200);
  for(let x=-500;x<=VW+500;x+=20)ctx.lineTo(x,top+Math.sin(x*.03+now*4)*6);ctx.lineTo(VW+500,GROUND+200);ctx.fill();ctx.strokeStyle='#e9fbff';ctx.lineWidth=3;ctx.beginPath();for(let x=-500;x<=VW+500;x+=20){const yy=top+Math.sin(x*.03+now*4)*6;x===-500?ctx.moveTo(x,yy):ctx.lineTo(x,yy)}ctx.stroke();ctx.restore()}
 for(const c of R10.crests){const u=c.t/c.l,pop=Math.min(1,c.t/(c.slow?.4:.16)),e=1+2.7*Math.pow(pop-1,3)+1.7*Math.pow(pop-1,2),a=Math.min(1,(1-u)*2.5)*(c.slow?Math.min(1,c.t*3):1)*(Math.abs(c.x-p.x)<170&&Math.abs(c.y-(p.y-110))<220?.42:.8);drawCrest(c.x,c.y,c.s*e,a,now*.6)}
 if(R10.blade&&p.ult){const b=R10.blade,x=p.x+p.face*10,y=p.y-200;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=b.l;const H=520*b.l,g=ctx.createLinearGradient(0,y,0,y-H);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.6,'rgba(255,220,120,.8)');g.addColorStop(1,'rgba(255,200,80,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-26,y);ctx.lineTo(x-14,y-H);ctx.lineTo(x,y-H-40);ctx.lineTo(x+14,y-H);ctx.lineTo(x+26,y);ctx.fill();ctx.restore()}
 if(R10.whirl){const w=R10.whirl,a=Math.min(1,w.l*2);ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<6;k++){const ang=now*10+k*1.1,r=w.r*(.4+k*.13);ctx.globalAlpha=a*(.6-k*.07);ctx.strokeStyle=k%2?'#bff6ff':PT;ctx.lineWidth=9-k;ctx.beginPath();ctx.ellipse(w.x,GROUND-20-k*30,r,r*.3,0,ang,ang+3.8);ctx.stroke()}ctx.restore()}
 for(const w of R10.tides){const u=w.t/w.l,a=Math.min(1,(1-u)*3),H=(w.big?230:120)*Math.min(1,w.t*4)*(1-u*.4),x=w.x;ctx.save();ctx.globalAlpha=a*.92;ctx.translate(x,GROUND+4);ctx.scale(w.dir,1);
  const g=ctx.createLinearGradient(0,-H,0,0);g.addColorStop(0,'#bff6ff');g.addColorStop(.35,'#3fc4e0');g.addColorStop(1,'#1572a6');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-260,0);ctx.quadraticCurveTo(-120,-H*.35,-20,-H*.9);ctx.quadraticCurveTo(40,-H*1.08,70,-H*.72);ctx.quadraticCurveTo(40,-H*.82,30,-H*.5);ctx.quadraticCurveTo(50,-H*.2,90,0);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-40,-H*.85);ctx.quadraticCurveTo(40,-H*1.08,70,-H*.72);ctx.stroke();ctx.restore()}
 for(const d of R10.drops){ctx.globalAlpha=Math.min(1,d.l*2);ctx.fillStyle=d.r>5?'#e6fbff':'#7fd8ee';ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,6.283);ctx.fill()}ctx.globalAlpha=1;
 for(const c of R10.coins){const w=Math.abs(Math.cos(c.ph));ctx.save();ctx.globalAlpha=Math.min(1,c.l*2);ctx.translate(c.x,c.y);ctx.fillStyle='#e8a91c';ctx.beginPath();ctx.ellipse(0,0,9*w+1.5,9,0,0,6.283);ctx.fill();ctx.fillStyle='#ffe066';ctx.beginPath();ctx.ellipse(0,0,6*w+1,6,0,0,6.283);ctx.fill();
  if(w>.8){ctx.fillStyle='#fff';ctx.fillRect(-1,-12,2,6)}ctx.restore()}
 for(const s of R10.proj){ctx.save();ctx.translate(s.x,s.y);
  if(s.k==='wave'){ctx.translate(0,GROUND-s.y);ctx.scale(s.face,1);ctx.globalCompositeOperation='lighter';const a=Math.min(1,s.l*3),H=110*s.s;ctx.globalAlpha=a;const g=ctx.createLinearGradient(-60,0,20,0);g.addColorStop(0,'rgba(255,220,120,0)');g.addColorStop(1,'rgba(255,240,190,.9)');ctx.fillStyle=g;
   ctx.beginPath();ctx.moveTo(-70*s.s,0);ctx.quadraticCurveTo(10,-H*.2,18*s.s,-H);ctx.quadraticCurveTo(30*s.s,-H*.4,26*s.s,0);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(18*s.s,-H);ctx.quadraticCurveTo(30*s.s,-H*.4,26*s.s,0);ctx.stroke()}
  else{const r=s.k==='pop'?7:s.k==='arc'?16*s.s:14*s.s;ctx.fillStyle='#2d2f36';ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.fill();ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(-r*.35,-r*.35,r*.3,0,6.283);ctx.fill()}ctx.restore()}
 // anchor + chain for the hook moves
 const hk=(p.state==='pitail'&&p.hk)?{tip:p.hk.tip}:(p.state==='lk'&&p.lk&&FORM()===4&&p.lk.L==='T')?(p.lk.rep?{spin:1}:{tip:(p.lk.tip||0)*Math.min(330,Math.abs((p.lk.tg?p.lk.tg.x:p.x+p.face*250)-p.x))}):null;
 if(hk){const hx=p.x+p.face*40,hy=p.y-110;let tx,ty,rot;if(hk.spin){const a=p.t*28;tx=p.x+Math.cos(a)*140;ty=p.y-80+Math.sin(a)*40;rot=a}else{tx=hx+p.face*hk.tip;ty=hy+10;rot=p.face*-1.57}
  if(hk.spin||hk.tip>4){ctx.save();ctx.strokeStyle='#8a939c';ctx.lineWidth=3;const n=Math.max(3,Math.floor(Math.hypot(tx-hx,ty-hy)/14));for(let i=0;i<n;i++){const u=i/n,x=hx+(tx-hx)*u,y=hy+(ty-hy)*u;ctx.beginPath();ctx.ellipse(x,y,5,3,i%2?0:1.57,0,6.283);ctx.stroke()}ctx.restore();drawAnchor(tx,ty,1.2,rot)}}
 // rope swing
 if(p.state==='piswing'&&p.sw){const s=p.sw;ctx.save();ctx.strokeStyle='#a0763c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(s.ax,s.ay-400);ctx.lineTo(s.ax,s.ay);ctx.lineTo(p.x+p.face*10,p.y-155);ctx.stroke();ctx.strokeStyle='#d8b06a';ctx.lineWidth=2;ctx.stroke();ctx.restore()}
 if(p.state==='lk'&&p.lk&&FORM()===4&&p.lk.L==='B'&&p.lk.rep&&p.t<.2){const q=p.lk;ctx.save();ctx.strokeStyle='#a0763c';ctx.lineWidth=5;const ax=(q.x0+q.ex)/2;ctx.beginPath();ctx.moveTo(ax,q.y0-560);ctx.lineTo(p.x,p.y-150);ctx.stroke();ctx.restore()}
 // shield guard shimmer + charge glows/meters
 if(p.state==='kntail'&&p.t<.3){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(.3-p.t)*3;ctx.strokeStyle=KG;ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x+p.face*40,p.y-90,80,-1.3,1.3);ctx.stroke();ctx.strokeStyle=KBL;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x+p.face*40,p.y-90,92,-1.2,1.2);ctx.stroke();ctx.restore()}
 if((p.state==='kncharge'||p.state==='picharge')&&p.t>.3){const ch=p.xc,kn=p.state==='kncharge',cx=kn?p.x:p.x+p.face*110,cy=kn?p.y-90:p.y-95;ctx.save();ctx.globalCompositeOperation='lighter';const R2=40+80*ch+Math.sin(now*30)*4,g=ctx.createRadialGradient(cx,cy,6,cx,cy,R2);
  g.addColorStop(0,kn?'rgba(255,240,170,.85)':'rgba(190,250,255,.8)');g.addColorStop(1,kn?'rgba(255,190,60,0)':'rgba(40,180,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R2,0,6.283);ctx.fill();ctx.restore();
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(p.x-50,p.y-215,100,9);ctx.fillStyle=ch>=1?'#fff':kn?KG:PT;ctx.fillRect(p.x-50,p.y-215,100*ch,9)}
 if(p.morphWait){const w=p.morphWait,a=.5+.3*Math.sin(now*10);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.strokeStyle=w.f===3?KG:PT;ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y-80,70+Math.sin(now*6)*8,now*5,now*5+4.4);ctx.stroke();ctx.restore()}
 if(R10.parrot){const q=R10.parrot;drawParrot(q.x,q.y,q.t);if(q.txt&&q.t<1.4){ctx.save();ctx.globalAlpha=Math.min(1,(1.4-q.t)*3);ctx.font=`22px ${FONT}`;ctx.fillStyle='#fff';ctx.strokeStyle='#1a0f3a';ctx.lineWidth=4;ctx.textAlign='center';ctx.strokeText(q.txt,q.x+20,q.y-28);ctx.fillText(q.txt,q.x+20,q.y-28);ctx.restore()}}}
const _drawFx10=drawFx;drawFx=function(){_drawFx10();r10DrawWorld()};
// timing ring for the Knight / Pirate 8-hit chains
const _cue10=cueInfo;cueInfo=function(){const X=XFm();if(X&&/^(kn|pi)[3-7]$/.test(p.state)&&p.xcombo>=3&&p.xcombo<8&&!p.miss&&p.xhit)return{H:X.H};return _cue10()};
buildList();

// ===================== ROUND 11: SMOOTHER FRAMES + CLUNK FIXES =====================
// New in-between / jump-arc / spin / ultimate frames live in their own sheets (sx_ samurai, kx_ knight, px_ pirate, nx_ ninja).
// They load quietly after start-up (the current form first) and each animation swaps to its smoother version only once all of its frames are in,
// so nothing ever pops in half-loaded and iPhone start-up is unchanged.
const UPG={
 s_run:['sx_run',null,16,1],s_rise:['sx_jump',[1,2],10,0],s_apex:['sx_jump',[3],1,0],s_fall:['sx_jump',[4],1,0],s_land:['sx_jump',[5],1,0],
 s_h1:[[['sx_trans',1],['s_combo_a',0],['s_combo_a',1]],null,20,0],s_h6:['sx_spin',null,24,0],
 s_stance:['sx_ult',[1],1,0],s_dash:['sx_ult',[2],1,0],s_after:['sx_ult',[3],1,0],s_calm:['sx_ult',[4],1,0],s_victory:['sx_ult',[4,5],4,0],s_kneel:['sx_ult',[0],1,0],
 s_rec:[[['sx_trans',4],['sx_trans',5],['sx_jump',0]],null,11,0],
 nk_spin:['nx_spin',null,17,0],
 kn_rise:['kx_jump',[1,2],9,0],kn_apex:['kx_jump',[3],1,0],kn_fall:['kx_jump',[4],1,0],kn_land:['kx_jump',[5],1,0],
 kn_h1:[[['kx_trans',1],['kn_combo_a',0],['kn_combo_a',1]],null,14,0],kn_h3:[[['kx_trans',1],['kn_combo_a',4],['kn_combo_a',5],['kx_trans',3]],null,12,0],
 kn_h6:['kx_spin',null,20,0],kn_rec:['kx_trans',[4,5],9,0],
 kn_ultA:['kx_ult',[0,1],3,0],kn_ultB:['kx_ult',[1],1,0],kn_ultC:['kx_ult',[2],1,0],kn_ultP:['kx_ult',[3],1,0],kn_ultE:['kx_ult',[4],1,0],kn_ultF:['kx_ult',[5],1,0],
 pi_rise:['px_jump',[1,2],9,0],pi_apex:['px_jump',[3],1,0],pi_fall:['px_jump',[2],1,0],pi_land:['px_jump',[5],1,0],
 pi_h2:[[['px_trans',1],['pi_combo_a',1]],null,18,0],pi_h3:[[['px_trans',2],['pi_combo_a',2]],null,18,0],pi_h4:[[['px_trans',1],['pi_combo_a',3]],null,16,0],
 pi_h5:['px_spin',null,22,0],pi_h6:[[['px_trans',0],['pi_combo_b',2]],null,16,0],pi_rec:['px_trans',[4,5],11,0],pi_aim:['px_ult',[3],1,0],
 pi_ultA:['px_ult',[0],1,0],pi_ultB:['px_ult',[1],1,0],pi_ultC:['px_ult',[2],1,0],pi_ultE:['px_ult',[4],1,0],pi_ultF:['px_ult',[5],1,0]};
const UPGPRE=['@','nx_','sx_','kx_','px_'],UPGDONE=new Set();let upgPend=null,upgT=0,upgBg=false,upgForm=-1,r11Prev='normal';
function upgSheets(e){return Array.isArray(e[0])?e[0].map(q=>q[0]):[e[0]]}
function upgFrames(e){if(!F)return[];const [s,idx]=e;if(Array.isArray(s))return s.map(([q,i])=>F[q]&&F[q][i]).filter(Boolean);const L=F[s];if(!L)return[];return idx?idx.filter(i=>i<L.length).map(i=>L[i]):L}
function upgLoad(f,hi){if(!window.queueFrames||!F)return;const names=[];
 for(const a in UPG){if(UPGDONE.has(a))continue;const sh=upgSheets(UPG[a]);if(f!=null&&!sh.some(s=>s.startsWith(UPGPRE[f])))continue;
  upgFrames(UPG[a]).forEach(q=>{if(!IMG[q.f]&&!names.includes(q.f))names.push(q.f)})}
 if(names.length)queueFrames(names,hi)}
function r11Update(dt){
 if(p.lsq>0)p.lsq-=dt;if(p.recT>0)p.recT-=dt;
 // a short settle pose when a ground attack finishes, instead of snapping straight back to idle
 const S=p.state;if(S==='normal'&&r11Prev!=='normal'&&(p.sam||p.xf||p.uf)&&p.ground&&!/^(land|hurt|respawn|victory|nmorph|ledge|wallrun|bunny|lkult)$/.test(r11Prev))p.recT=.24;r11Prev=S;
 if(!window.queueFrames||!F)return;
 const f=FORM();if(f!==upgForm){upgForm=f;if(f>0)upgLoad(f,true)}
 if(!upgBg&&now>6&&SPRITES.loaded+SPRITES.failed.length>=SPRITES.total){upgBg=true;[2,1,3,4].forEach(k=>upgLoad(k,false))}
 upgT-=dt;if(upgT>0)return;upgT=.2;if(!upgPend)upgPend=Object.keys(UPG);
 upgPend=upgPend.filter(a=>{const fr=upgFrames(UPG[a]);if(!fr.length)return false;if(p.anim===a||!fr.every(q=>imgOK(IMG[q.f])))return true;A[a]=UPG[a];FR[a]=fr;UPGDONE.add(a);return false})}
const _r9Pre11=r9Pre;r9Pre=function(dt){r11Update(dt);_r9Pre11(dt)};
const _setAnim11=setAnim;setAnim=function(a,force){if(p.recT>0&&a===fa('idle')&&p.ground){const r=fa('rec');if(r!==a&&FR[r])a=r}return _setAnim11(a,force)};
// idle breathing + landing squash (scale about the feet)
function r11Sq(){let s=1;if(p.ground&&p.state==='normal'&&/(^|_)idle$/.test(p.anim))s+=Math.sin(now*3.3)*.013;if(p.lsq>0){const k=1-p.lsq/.16;s-=.07*Math.sin(Math.PI*k)}return s}

// ===================== ROUND 12: BIG BRUNO THE BRAWLER · VS card · rooftop arena · stealth hunt =====================
// Big Bruno is drawn from his own 5-frame sheets (b_*) at DSC — ~420 world units tall, about 2.2x the old dog.
// He stays weak: big telegraphed punch, bite, bark, silly gags. Everything here hooks in by wrapping, like rounds 9-11.
const DSC=1.05;
const BOSS={name:'BIG BRUNO',title:'THE BRAWLER',full:'Big Bruno the Brawler'};
ESSENTIAL.push('b_portrait','b_stealth');CINE.push('tkd');
Object.assign(KB,{tkdBonk:[0,0,0,.05],tkdFin:[0,0,0,.14],tkdTrip:[0,0,0,.12],tkdDrop:[150,-260,.1,.12]});
Object.assign(NAMES,{tkdBonk:'BONK!',tkdFin:'TAKEDOWN!',tkdTrip:'TAIL TRIP!',tkdDrop:'DROP ATTACK!'});
const R12={vs:-1,vsDone:false,round:1,rb:0,hype:0,lastN:0,flashes:[],wasAlive:true};
// ---------- arena: night rooftop, cat crowd, lanterns, a climbable brick wall each side ----------
const ARENA=new Image();ARENA.src='assets/arena.webp?v='+VER;
const AIY=GROUND-.84*VH; // image top in world space (its deck sits on GROUND)
const LANT=[[126,127,0],[187,152,0],[245,175,0],[308,191,1],[367,207,0],[424,218,1],[482,220,0],[537,211,1],[592,200,0],[646,185,1],[704,166,1],[764,151,0],[825,124,0],[170,266,0],[208,268,0],[249,266,0],[290,262,1],[331,254,0],[374,246,0],[577,251,0],[620,262,1],[661,268,0],[700,272,1],[743,273,0]];
const PROPS=[{x:225,k:'prop_bush',s:.37,hw:52},{x:775,k:'prop_crates',s:.4,hw:56}];
function r12Sky(){const h=Math.max(0,camY),u=Math.min(1,h/2600);ctx.save();ctx.setTransform(scale,0,0,scale,offX,offY);
 const g=ctx.createLinearGradient(0,0,0,VH);const mix=(a,b)=>toHex(hx2(a).map((v,i)=>v+(hx2(b)[i]-v)*u));g.addColorStop(0,mix('#030a2a','#020108'));g.addColorStop(1,mix('#041140','#05031a'));
 ctx.fillStyle=g;ctx.fillRect(-500,-500,VW+1000,VH+1000);
 ctx.fillStyle='#fff';for(let i=0;i<70;i++){const x=(i*97.31)%VW,y=((i*61.7+h*.05)%VH+VH)%VH,tw=.5+.5*Math.sin(now*2.5+i);ctx.globalAlpha=(.25+.6*u)*tw;ctx.fillRect(x,y,1+i%2,1+i%2)}
 ctx.restore()}
function r12Arena(){
 ctx.fillStyle='#120c1c';ctx.fillRect(-700,AIY-40,700,VH+700);ctx.fillRect(VW,AIY-40,700,VH+700);ctx.fillStyle='#17111d';ctx.fillRect(-700,AIY+VH-2,VW+1400,600);
 {const g=ctx.createLinearGradient(0,AIY-4200,0,AIY+2);g.addColorStop(0,'rgba(1,1,8,0)');g.addColorStop(.55,'#030a2a');g.addColorStop(1,'#041140');ctx.fillStyle=g;ctx.fillRect(-700,AIY-4200,VW+1400,4204)} // night sky continues above the backdrop, fading into space
 if(imgOK(ARENA)){ctx.drawImage(ARENA,0,AIY,VW,VH);const k=VW/ARENA.naturalWidth;{const g=ctx.createLinearGradient(0,AIY,0,AIY+40);g.addColorStop(0,'#041140');g.addColorStop(1,'rgba(4,17,64,0)');ctx.fillStyle=g;ctx.fillRect(0,AIY,VW,40)}
  {const g=ctx.createLinearGradient(0,AIY-260,0,AIY+30);g.addColorStop(0,'rgba(22,14,26,0)');g.addColorStop(1,'#22161f');ctx.fillStyle=g;ctx.fillRect(0,AIY-260,96,290);ctx.fillRect(858,AIY-260,102,290)} // buildings keep going up
  // the cat crowd bobs (harder when you land big hits), then the ledge in front hides their feet
  const sy0=430,sy1=512,x0=150,x1=1118,n=12,w=(x1-x0)/n,amp=1.2+R12.hype*7,sp=5+R12.hype*5;
  for(let i=0;i<n;i++){const dy=-amp*Math.max(0,Math.sin(now*sp+i*1.3))-(R12.hype>.6&&i%2?amp*.4:0);ctx.drawImage(ARENA,x0+i*w,sy0,w+1,sy1-sy0,(x0+i*w)*k,AIY+sy0*k+dy,(w+1)*k,(sy1-sy0)*k)}
  ctx.drawImage(ARENA,x0,505,x1-x0,52,x0*k,AIY+505*k,(x1-x0)*k,52*k);
  for(const f of R12.flashes){ctx.globalAlpha=Math.max(0,f.l)*.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(f.x,f.y,3+6*f.l,0,6.283);ctx.fill()}ctx.globalAlpha=1;
  // lanterns + neon signs glow
  ctx.save();ctx.globalCompositeOperation='lighter';
  LANT.forEach((l,i)=>{const x=l[0],y=AIY+l[1],a=.13+.07*Math.sin(now*2.2+i*1.7)+R12.hype*.08,g=ctx.createRadialGradient(x,y,2,x,y,30);g.addColorStop(0,l[2]?`rgba(98,255,216,${a})`:`rgba(255,179,71,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-30,y-30,60,60)});
  const nf=(Math.sin(now*13)>.97?.2:1)*(.16+.05*Math.sin(now*3)),sg=(x,y,c)=>{const g=ctx.createRadialGradient(x,y,4,x,y,58);g.addColorStop(0,c.replace('A',nf));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-58,y-58,116,116)};
  sg(129,AIY+298,'rgba(90,170,255,A)');sg(821,AIY+300,'rgba(255,90,220,A)');ctx.restore()}
 else{ctx.fillStyle='#3a2c3a';ctx.fillRect(-500,GROUND,VW+1000,200)}
 // climbable brick pillars (both sides) with a stone cap you can stand on
 for(const s of [-1,1]){const x=s<0?0:WALL_X,w=VW-WALL_X;ctx.fillStyle='rgba(58,30,40,.92)';ctx.fillRect(x,WT,w,GROUND-WT);ctx.strokeStyle='rgba(20,8,16,.75)';ctx.lineWidth=2;
  for(let y=WT;y<GROUND;y+=26){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();const o=(y/26)%2?18:48;ctx.beginPath();ctx.moveTo(x+o,y);ctx.lineTo(x+o,y+26);ctx.stroke()}
  const ex=s<0?x+w-3:x;ctx.fillStyle='rgba(255,190,120,.25)';ctx.fillRect(ex,WT,3,GROUND-WT);
  ctx.fillStyle='#8d7f95';ctx.fillRect(x-(s<0?20:6),WT-8,w+26,12);ctx.fillStyle='#b9aac2';ctx.fillRect(x-(s<0?20:6),WT-8,w+26,3);
  ctx.globalAlpha=.55;ctx.fillStyle='#ffe9b0';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText('▲ climb',x+w/2,WT+40);ctx.globalAlpha=1;ctx.textAlign='left'}}
function r12Props(){for(const o of PROPS){const f=(FR[o.k]||[])[0],im=f&&IMG[f.f];if(!imgOK(im))continue;
  const near=Math.abs(p.x-o.x)<o.hw+40&&p.y>GROUND-200,dn=dummies.some(d=>Math.abs(d.x-o.x)<o.hw+90&&d.y>GROUND-250);
  ctx.save();ctx.globalAlpha=p.hidden&&near?.72:dn?.6:near?.86:1;ctx.translate(o.x,GROUND+8);ctx.scale(o.s,o.s);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}
 if(p.hidden){fancy('hidden',p.x,p.y-150,18,0,1,.65+.2*Math.sin(now*4),'#9fffb0')}}
// ---------- the big boss health bar (HUD) ----------
function r12HUD(){const d=dummies[0];if(!d||(R12.vs>=0&&R12.vs<2.3))return;const W=400,x0=VW/2-W/2+24,y0=12,fr=Math.max(0,d.hp)/d.max,ch=Math.max(0,d.hpShow)/d.max;
 ctx.save();ctx.fillStyle='rgba(10,4,20,.72)';ctx.beginPath();ctx.roundRect?ctx.roundRect(x0-4,y0-4,W+8,26,6):ctx.rect(x0-4,y0-4,W+8,26);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(x0,y0,W*ch,18);const g=ctx.createLinearGradient(x0,0,x0+W,0);g.addColorStop(0,'#ff3b2f');g.addColorStop(.6,'#ff9a2e');g.addColorStop(1,'#ffe14d');ctx.fillStyle=d.alive?g:'#777';ctx.fillRect(x0,y0,W*fr,18);
 ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(x0,y0,W*fr,4);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(x0+W*i/6,y0);ctx.lineTo(x0+W*i/6,y0+18);ctx.stroke()}
 // portrait medallion
 const pf=(FR.b_portrait||[])[0],pim=pf&&IMG[pf.f],cx=x0-30,cy=y0+14;ctx.fillStyle='#2a1030';ctx.beginPath();ctx.arc(cx,cy,27,0,6.283);ctx.fill();ctx.strokeStyle='#ffd34d';ctx.lineWidth=3;ctx.stroke();
 if(imgOK(pim)){ctx.save();ctx.beginPath();ctx.arc(cx,cy,24,0,6.283);ctx.clip();const s=58/pim.width;ctx.drawImage(pim,cx-29,cy-22,pim.width*s,pim.height*s);ctx.restore()}
 ctx.restore();fancy(d.alive?BOSS.name+' THE BRAWLER':'K.O. — '+BOSS.name+' is having a little sit',x0+W/2,y0+9,15,0,1,1,'#fff')}
function r12DogMarks(d,H){if(!d.alive||d.aware==null)return;const y=d.y-H+70;d={x:d.x-d.face*165,face:d.face,st:d.st,det:d.det,aware:d.aware};
 if(!d.aware){if(d.st==='doze'){for(let i=0;i<3;i++){const u=(now*.6+i/3)%1;fancy(i%2?'Z':'z',d.x+20+u*40+i*6,y-u*40,16+u*14,.2,1,Math.sin(u*Math.PI),'#cfe3ff')}}
  else fancy('?',d.x,y-6+Math.sin(now*4)*4,40,Math.sin(now*3)*.15,1,.95,'#fff');
  const w=110,x=d.x-w/2,yy=y+26,c=d.det<.5?'#ffe14d':d.det<.8?'#ff9a2e':'#ff3b3b';ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-2,yy-2,w+4,10);ctx.fillStyle=c;ctx.fillRect(x,yy,w*Math.min(1,d.det),6);
  // little eye icon
  ctx.save();ctx.translate(x-14,yy+3);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,0,9,5,0,0,6.283);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,3,0,6.283);ctx.fill();ctx.restore()}
 else if(p.hunt&&['idle','walk','punch','bite','bark'].includes(d.st)){ctx.save();ctx.globalAlpha=.8;ctx.translate(d.x,y+30);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,0,12,7,0,0,6.283);ctx.fill();ctx.fillStyle='#ff3b3b';ctx.beginPath();ctx.arc(0,0,4.5,0,6.283);ctx.fill();ctx.restore();fancy('sees you',d.x,y+48,13,0,1,.7,'#ffb0b0')}}
// ---------- VS intro + round banners (overlay; any button skips) ----------
const FCOL=['#ffe08a',NV,SR,KG,PT],FNAME=['PADDY','NEON NINJA PADDY','SAMURAI PADDY','KNIGHT PADDY','PIRATE PADDY'];
function r12Over(){const t=R12.vs;
 if(t>=0&&t<3.1){ctx.save();const ein=Math.min(1,t/.35),e=1-Math.pow(1-ein,3),out=t>2.2?Math.min(1,(t-2.2)/.3):0,o=out*out;
  ctx.globalAlpha=t<2.2?.78:.78*(1-o);ctx.fillStyle='#0a0418';ctx.fillRect(-500,-500,VW+1000,VH+1000);ctx.globalAlpha=1;
  // left (Paddy) and right (boss) slanted panels
  const sl=(-1+e)*VW*.6-o*VW*.6,sr=(1-e)*VW*.6+o*VW*.6,fc=FCOL[FORM()];
  ctx.save();ctx.translate(sl,0);ctx.fillStyle=fc;ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(-200,70);ctx.lineTo(VW/2+40,70);ctx.lineTo(VW/2-40,470);ctx.lineTo(-200,470);ctx.fill();
  ctx.globalAlpha=.35;ctx.fillStyle='#fff';ctx.fillRect(-200,70,VW,6);ctx.globalAlpha=1;
  const pf=readyFrame((FR[fa('idle')]||FR.idle)[0]),pim=pf&&IMG[pf.f];if(pim){ctx.save();ctx.translate(250,455);const s=SC*2.15;ctx.scale(s,s);ctx.drawImage(pim,-pf.ax,-pf.ay);ctx.restore()}
  fancy(FNAME[FORM()],250,105,FORM()?30:40,-.04,1,1,'#fff');ctx.restore();
  ctx.save();ctx.translate(sr,0);ctx.fillStyle='#7a1020';ctx.globalAlpha=.92;ctx.beginPath();ctx.moveTo(VW/2+40,70);ctx.lineTo(VW+200,70);ctx.lineTo(VW+200,470);ctx.lineTo(VW/2-40,470);ctx.fill();ctx.globalAlpha=1;
  const bf=(FR.b_portrait||[])[0],bim=bf&&IMG[bf.f];if(imgOK(bim)){const s=400/bim.height;ctx.drawImage(bim,VW-40-bim.width*s,470-bim.height*s,bim.width*s,bim.height*s)}
  fancy(BOSS.name,720,105,44,.04,1,1,'#ffd34d');fancy(BOSS.title,730,145,24,.04,1,1,'#fff');ctx.restore();
  if(t>.4&&t<2.3){const u=t-.4,pop=u<.12?2.2-u/.12*1.2:1+Math.sin(u*9)*.03;fancy('VS',VW/2,270,110,-.08,pop,Math.min(1,u*8)*(1-o),'#ff3b3b');if(u<.15){ctx.globalAlpha=(.15-u)/.15*.6;ctx.fillStyle='#fff';ctx.fillRect(-500,-500,VW+1000,VH+1000);ctx.globalAlpha=1}}
  if(t>.6&&t<2.2)fancy('tap any button',VW/2,500,16,0,1,.5+.3*Math.sin(t*6),'#fff');
  if(t>2.2){const u=t-2.2;fancy('FIGHT!',VW/2,250,120,-.06,u<.12?2-u/.12:1,Math.min(1,(3.1-t)*3),'#ffe14d')}
  ctx.restore()}
 if(R12.rb>0){const u=1.7-R12.rb;fancy(u<.8?'ROUND '+R12.round:'FIGHT!',VW/2,230,u<.8?70:96,-.05,(u%.8)<.1?1.6-(u%.8)*6:1,Math.min(1,R12.rb*3),u<.8?'#fff':'#ffe14d')}}
// ---------- stealth ----------
const DOZE_ST=['doze','look','patrol'];
function r12Base(d,dt){d.t+=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.cool-=dt;d.stun-=dt;d.blend-=dt;d.hpShow+=(d.hp-d.hpShow)*Math.min(1,dt*5);if(d.bub){d.bub.l-=dt;if(d.bub.l<=0)d.bub=null}
 d.fs+=(d.face-d.fs)*Math.min(1,dt*12);d.vx*=Math.pow(.02,dt);d.x+=d.vx*dt;d.x=Math.max(LW+110,Math.min(WALL_X-110,d.x));d.y=GROUND;d.vy=0;d.rot*=Math.pow(.01,dt)}
function r12Step(d,dt){const a=A[d.anim],fr=FR[d.anim];if(!a||!fr)return;d.ft+=dt*a[2];d.fi=a[3]?Math.floor(d.ft)%fr.length:Math.min(fr.length-1,Math.floor(d.ft))}
function loseTrack(d){d.aware=false;d.det=0;d.aggro=0;d.lost=0;dSet(d,'look','r_look');d.dur=1.4;d.bub={t:"huh? where'd he go?",l:1.6,c:'#fff'};say('UNSEEN','#9fe8ff')}
function notice(d){d.aware=true;d.det=0;d.aggro=6;d.cool=Math.max(d.cool,.9);dSet(d,'alert','r_startle');d.face=p.x>d.x?1:-1;d.bub={t:'!',l:1,c:'#ff3b3b'};d.sq=1.4;shake=Math.max(shake,4);say('SPOTTED!','#ff8a8a')}
function r12Unaware(d,dt){r12Base(d,dt);d.aggro=0;const t=d.t;
 switch(d.st){
  case 'doze':dAnim(d,'r_doze');if(t>d.dur){dSet(d,'look','r_look');d.dur=1.2}break;
  case 'look':dAnim(d,'r_look');if(t>d.dur){if(Math.random()<.5)d.face*=-1;dSet(d,'patrol','r_walk');d.dur=2+Math.random()*2.5;d.tx=LW+170+Math.random()*(WALL_X-LW-340)}break;
  case 'patrol':{dAnim(d,'r_walk');const dx=d.tx-d.x;if(Math.abs(dx)>8){d.face=dx>0?1:-1;d.x+=Math.sign(dx)*48*dt}
   if(Math.abs(dx)<=8||t>d.dur){const r=Math.random();if(r<.42){dSet(d,'doze','r_doze');d.dur=3+Math.random()*2;d.bub={t:'zzz…',l:1.2,c:'#cfe3ff'}}else if(r<.72){dSet(d,'look','r_look');d.dur=1.3}else goSilly(d)}break}
  default:{const s=SILLY[d.st];if(s){if(d.st==='chase'){if(t%.3<dt)d.face*=-1;d.x+=Math.sin(t*7)*60*dt}if(t>s[1]){dSet(d,'look','r_look');d.dur=1}}else{dSet(d,'look','r_look');d.dur=1}}}
 r12Step(d,dt)}
function r12Aware(d,dt){if(!d.alive||(R12.vs>=0&&R12.vs<2.4)){d.det=0;return}
 const dx=p.x-d.x,dist=Math.abs(dx),behind=dx*d.face<0,onTop=p.ground&&p.y<GROUND-200,cine=CINE.includes(p.state);
 if(d.aware==null)d.aware=true;
 if(d.aware){if(p.hunt&&!cine&&['idle','walk'].includes(d.st)&&(p.hidden||onTop||dist>420||(behind&&dist>150))){d.lost=(d.lost||0)+dt;if(d.lost>.9)loseTrack(d)}else d.lost=0;return}
 let r;if(cine||p.state==='tkd')r=0;else if(p.hidden||onTop)r=-.6;else if(!p.hunt)r=dist<620?1.7:.5;else if(!behind)r=dist<520?.35+1.4*(1-dist/520):-.3;else r=dist<110?.3:-.35;
 if(r>0){if(d.st==='doze')r*=.4;if(Math.abs(p.vx)>200)r*=1.6}
 d.det=Math.max(0,Math.min(1,(d.det||0)+r*dt));if(d.det>=1)notice(d)}
const _updDog12=updDog;
updDog=function(d,dt){r12Aware(d,dt);const air=d.y<GROUND-2||d.vy<-1,held=CINE.includes(p.state)&&p.grab===d;
 if(d.alive&&!air&&!held){
  if(!d.aware&&(DOZE_ST.includes(d.st)||SILLY[d.st]||d.st==='idle'||d.st==='walk')){r12Unaware(d,dt);return}
  if(d.st==='alert'){r12Base(d,dt);dAnim(d,'r_startle');if(d.t>.7){dSet(d,'idle','r_idle');d.aggro=6}r12Step(d,dt);return}
  if(d.st==='flat'){r12Base(d,dt);dAnim(d,'r_flat');d.stun=Math.max(d.stun,.1);if(d.hp<=0){startKO(d);return}if(d.t>d.dur){d.aware=true;d.aggro=6;d.stun=0;dSet(d,'hurt','r_hurt');d.bub={t:'grr… ow',l:1,c:'#fff'}}r12Step(d,dt);return}}
 if(d.st==='alert'||d.st==='flat'||DOZE_ST.includes(d.st))if(air||held)d.st='hurt';
 _updDog12(d,dt)};
const _dogHit12=dogHit;
dogHit=function(d,move,air){if(d.alive&&d.aware===false&&!/^tkd/.test(move)){say('SURPRISE HIT!','#9fe8ff');R12.hype=Math.min(1,R12.hype+.3)}d.aware=true;d.det=0;d.lost=0;_dogHit12(d,move,air)};
// ---------- takedowns ----------
const pickA=l=>l.find(a=>FR[a]&&A[a])||fa('idle');
const TKA={leap:['pounce','n_flip','s_flip','kn_leap','pi_rise'],bonk:['diveclaw','n_dive','s_dive','kn_dive','pi_dive'],drop:['dive','n_dive','s_dive','kn_dive','pi_dive'],trip:['tailwhip','n_air2','s_h6','kn_h6','pi_h6']};
const AIRA=k=>pickA([{fall:['fall','n_fall','s_fall','kn_fall','pi_fall'],rise:['jump','n_rise','s_rise','kn_rise','pi_rise']}[k][FORM()]||fa(k),'jump']);
const tkA=k=>pickA([TKA[k][FORM()]||fa(k),'jump']);
function tkd(kind,d){const un=!d.aware,dir=d.x>p.x?1:-1;p.face=dir;p.wall=false;p.grab=d;p.vx=0;p.vy=0;p.inv=Math.max(p.inv,.5);p.combo=0;
 const nm={pounce:'SNEAK POUNCE!',ambush:'AMBUSH POUNCE!',trip:'SILENT TAIL TRIP!',drop:un?'SKY DROP TAKEDOWN!':'DROP ATTACK!'}[kind];
 act('tkd',tkA(kind==='trip'?'trip':kind==='drop'?'drop':'leap'),{say:nm,c:un?'#9fe8ff':'#fff'});
 p.tk={kind,d,un,x0:p.x,y0:p.y,dir,n:0,side:-d.face};d.aware=true;d.det=0;d.cool=Math.max(d.cool,2.5);d.bub=null;
 if(un){cineGo(1.12,.2);R12.hype=Math.min(1,R12.hype+.4)}p.hunt=false;huntBtn.classList.remove('lit')}
function tkHit(d,move,extra,dir){hitDummy(d,move,dir);d.hp=Math.max(0,d.hp-extra);for(let i=0;i<3;i++)R12.flashes.push({x:160+Math.random()*640,y:AIY+330+Math.random()*30,l:1})}
function flatten(d,dur){dSet(d,'flat','r_flat');d.dur=dur;d.stun=dur;d.vx=0;d.vy=0;d.y=GROUND;d.sq=1.6;shake=Math.max(shake,10);spark(d.x,GROUND-20,16,['#d9c49a','#fff'],260)}
function tkUpdate(dt){const q=p.tk,d=q&&q.d;if(!q||!d){p.state='normal';return}const t=p.t,e=x=>x*x*(3-2*x);p.vx=0;p.vy=0;
 const end=(vy,vx)=>{p.state='normal';p.grab=null;p.tk=null;p.vy=vy;p.vx=vx;p.ground=false;p.jumps=1;p.inv=Math.max(p.inv,.4);setAnim(AIRA('fall'),true)};
 if(q.kind==='pounce'||q.kind==='ambush'){const L=q.kind==='ambush'?.5:.34,arc=q.kind==='ambush'?230:150,tx=d.x+q.side*40,ty=d.y-330;
  if(t<L){const u=e(t/L);p.x=q.x0+(tx-q.x0)*u;p.y=q.y0+(ty-q.y0)*u-arc*Math.sin(Math.PI*u);if(!q.ok&&t>L*.6){q.ok=1;dAnim(d,'r_startle');d.bub={t:'!?',l:.8,c:'#ff3b3b'};d.sq=1.2}return}
  p.x=tx;p.y=ty+Math.sin((t-L)*30)*3;p.face=-q.side;const nb=q.kind==='ambush'?4:3,bt=L+.08+q.n*.15;
  if(q.n<nb&&t>bt){q.n++;setAnim(tkA('bonk'),true);tkHit(d,'tkdBonk',0,-q.side);d.bub={t:['BONK!','BOP!','BONK!','DOINK!'][q.n-1],l:.5,c:'#fff'};dAnim(d,'r_startle');spark(d.x,d.y-380,10,['#ffe14d','#fff'],260);shake=Math.max(shake,6)}
  if(q.n>=nb&&!q.fin&&t>bt+.12){q.fin=1;tkHit(d,'tkdFin',q.kind==='ambush'?10:8,-q.side);flatten(d,2.4);d.bub={t:'@_@',l:1.5,c:'#ffe14d'};card(q.kind==='ambush'?'AMBUSH POUNCE!':'SNEAK POUNCE!','stealth takedown','#9fe8ff');flashT=.18;end(-620,q.side*240)}return}
 if(q.kind==='trip'){if(t<.15){p.x+=(d.x-q.dir*110-p.x)*Math.min(1,dt*10);return}
  if(!q.ok){q.ok=1;dAnim(d,'r_startle');d.bub={t:'WHOA!',l:.8,c:'#fff'};d.rot=.25*q.dir;spark(d.x,GROUND-30,10,['#fff','#cfe3ff'],200)}
  if(t>.38&&!q.fin){q.fin=1;tkHit(d,'tkdTrip',5,q.dir);flatten(d,2.7);d.bub={t:'*thud*',l:1.2,c:'#fff'};card('SILENT TAIL TRIP!','free hits while he\'s flat!','#9fe8ff');p.state='normal';p.grab=null;p.tk=null}return}
 if(q.kind==='drop'){const tx=d.x-q.dir*30,ty=d.y-300;
  if(t<.16){p.y=q.y0-70*e(t/.16);p.x+=(tx-p.x)*dt*2;return}
  const u=Math.min(1,(t-.16)/.2);p.x=p.x+(tx-p.x)*Math.min(1,dt*14);p.y=(q.y0-70)+(ty-(q.y0-70))*u*u;if(t%.03<dt)ghosts.push({x:p.x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.2,blue:1});
  if(u>=1&&!q.fin){q.fin=1;waves.push({x:d.x,y:d.y-300,r:10,l:1,big:true});
   if(q.un){tkHit(d,'tkdFin',11,q.dir);flatten(d,2.4);d.bub={t:'@_@',l:1.5,c:'#ffe14d'};card('SKY DROP TAKEDOWN!','stealth takedown','#9fe8ff');flashT=.2}
   else{p.grab=null;tkHit(d,'tkdDrop',2,q.dir);d.stun=1}
   end(-650,-q.dir*200)}}}
function r12Takedown(){if(!['normal','land','walljump','wiggle','climb'].includes(p.state)||p.state==='tkd')return false;
 const d=dummies.find(x=>x.alive&&x.y>=GROUND-2&&!['ko','sit','wag'].includes(x.st));if(!d)return false;
 const dx=d.x-p.x,adx=Math.abs(dx),behind=(p.x-d.x)*d.face<0,un=d.aware===false,high=p.wall||(p.ground&&p.y<GROUND-200);
 if(P.attack&&high&&adx<360&&p.y<GROUND-150){tkd('drop',d);return true}
 if(!p.ground&&!p.wall&&p.y<d.y-250&&adx<200&&(P.down||(P.attack&&(un||K.down)))){tkd('drop',d);return true}
 if(!un||!p.ground||!p.hunt)return false;
 if(P.attack&&p.hidden&&adx<560){tkd('ambush',d);return true}
 if(P.attack&&(behind||d.st==='doze')&&adx<270){tkd('pounce',d);return true}
 if(P.tail&&adx<250){tkd('trip',d);return true}
 return false}
// ---------- every form can wall-kick (Kitty climbs, Ninja wall-runs) and mantle onto the wall tops ----------
function r12Walls(dt){if((p.state!=='normal'&&p.state!=='piswing')||p.ground||p.wall||p.ninja||!FORM())return;
 const ws=p.x>=WALL_X-66?1:p.x<=LW+66?-1:0;if(!ws||p.y<WT-4)return;
 if(P.jump&&p.state==='normal'){p.vy=-820;p.vx=-ws*400;p.face=-ws;p.jumps=1;delete P.jump;acted=true;setAnim(AIRA('rise'),true);say('WALL KICK!','#fff');extend('WALL KICK!');spark(ws>0?WALL_X:LW,p.y-60,10,['#fff','#ffe14d'],240);return}
 if(p.y<WT+115&&p.vy>-420&&(ws>0?K.right&&p.x<WALL_X-40:K.left&&p.x>LW+40)){p.x=ws>0?WALL_X+30:LW-30;p.y=WT-2;p.vy=-180;p.state='normal';setAnim(AIRA('rise'),true);say('MANTLE!','#fff')}}
// ---------- per-frame hook (runs before every form's own input handling) ----------
function r12Pre(dt){
 if(!R12.vsDone){R12.vsDone=true;R12.vs=0}
 if(R12.vs>=0){R12.vs+=dt;if(R12.vs>.5&&R12.vs<2.2&&anyInput())R12.vs=2.2;if(R12.vs<2.3)for(const d of dummies){d.cool=Math.max(d.cool,1);d.aggro=0}if(R12.vs>3.1)R12.vs=-1}
 R12.rb=Math.max(0,R12.rb-dt);R12.hype=Math.max(0,R12.hype-dt*.25);if(C.n>R12.lastN&&C.n%5===0)R12.hype=Math.min(1,R12.hype+.25);R12.lastN=C.n;
 for(const f of R12.flashes)f.l-=dt*3;R12.flashes=R12.flashes.filter(f=>f.l>0);if(R12.hype>.5&&Math.random()<R12.hype*.15)R12.flashes.push({x:160+Math.random()*640,y:AIY+330+Math.random()*30,l:1});
 const d0=dummies[0];if(d0){if(d0.alive&&!R12.wasAlive){R12.round++;R12.rb=1.7;if(p.hunt&&Math.abs(p.x-d0.x)>300){d0.aware=false;dSet(d0,'doze','r_doze');d0.dur=4}}R12.wasAlive=d0.alive}
 p.hidden=p.hunt&&p.ground&&p.y>GROUND-5&&p.state==='normal'&&PROPS.some(o=>Math.abs(p.x-o.x)<o.hw);
 if(p.state==='tkd'){tkUpdate(dt);for(const k of ['attack','tail','jump','down','special','dash'])delete P[k];return}
 if(r12Takedown()){for(const k of ['attack','tail','down'])delete P[k];acted=true;return}
 r12Walls(dt)}
const _nUpd12=nUpdate;nUpdate=function(dt){r12Pre(dt);_nUpd12(dt)};
const _sq12=r11Sq;r11Sq=function(){let s=_sq12();if(p.hunt&&FORM()&&p.ground&&p.state==='normal')s*=.9;return s};
const _fx12=drawFx;drawFx=function(){r12Props();_fx12()};
// ---------- survival mode: planned, not switched on yet ----------
// MODES/WAVES/spawnDog are the seams for an endless "fight to the death" mode: each wave spawns N dogs
// from the same factory with more hp, quicker cooldowns and less goofing off. Practice mode = today's arena.
const MODES={practice:{name:'Training Arena'},survival:{name:'Survival',waves:true}};
const WAVES=n=>({count:1+Math.floor((n-1)/3),hp:60+(n-1)*12,cool:Math.max(.45,1-(n-1)*.06),silly:Math.max(.2,1-(n-1)*.1)});
function spawnDog(cfg){cfg=cfg||{};const d={home:cfg.x||640,x:cfg.x||640,y:GROUND,vx:0,vy:0,fl:0,hp:cfg.hp||60,max:cfg.hp||60,hpShow:cfg.hp||60,h:420,flash:0,sq:0,rot:0,alive:true,last:-1,calm:0,face:-1,fs:-1,st:'idle',t:0,ft:0,fi:0,anim:'r_idle',cool:2,stun:0,aggro:0,blend:0,bub:null,aware:true,det:0,cfg};dummies.push(d);return d}
const ARENA_MGR={mode:'practice',wave:0,start(m){this.mode=m;this.wave=0},update(){/* survival: when every dog is down, wave++ and spawnDog() x WAVES(wave).count */}};
for(const d of dummies){d.aware=true;d.det=0}
window.r12={R12,BOSS,PROPS,tkd,spawnDog,MODES,WAVES,ARENA_MGR,dog:()=>dummies[0]};
// ===================== ROUND 13: SIX LEGENDARY (LATE-GAME, UNLOCKABLE) FORMS =====================
// Gunslinger · Light Paddy · Power Blade · Crimson Blade · Shadow Reaper · Shade. Each one has: an 8-hit timed chain
// (hits 4-7 on the ring, a perfect 8th = cinematic finisher), Tail / Meow (hold to charge) / Blink specials, air moves,
// its own LINK moves after a C C C / T T T opener, named routes and an earth-shattering ULTIMATE. Sprites lazy-load.
const UA=(pre,m)=>{for(const k in m){const v=m[k];A[pre+'_'+k]=[pre+'_'+v[0],v[1],v[2]||1,v[3]||0]}};
UA('gs',{idle:['idle',[0,1,4,5,4,1],6,1],run:['run',[0,1,2,3,4],12,1],rise:['jump',[1,2],8],apex:['jump',[3]],fall:['jump',[4]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[5]],
 h1:['combo_a',[0,1],14],h2:['combo_a',[2,3],14],h3:['combo_a',[4,5],12],h4:['special',[0,1],12],h5:['special',[2,3],12],h6:['combo_b',[0,1],12],h7:['special',[4]],
 launch:['combo_b',[1]],air1:['jump',[3]],air2:['combo_b',[4]],dive:['jump',[4]],tail:['ult',[1]],tail2:['combo_b',[4,5],10],meowc:['special',[0]],meow:['special',[2,3],12],meow2:['special',[4]],
 blink:['combo_b',[3]],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[3]],ultD:['ult',[4]],ultE:['special',[4]],ultF:['ult',[5]]});
UA('lp',{idle:['idle',[0,1,2,3,4,5,4,3,2,1],7,1],run:['run',null,12,1],rise:['jump',[1,2],8],apex:['jump',[3]],fall:['jump',[3]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[5]],
 h1:['combo_a',[0,1],14],h2:['combo_a',[2,3],13],h3:['combo_a',[4,5],12],h4:['combo_b',[0,1],13],h5:['combo_b',[2,3],13],h6:['combo_b',[4]],h7:['ult',[3]],
 launch:['combo_b',[4,5],12],air1:['combo_a',[3]],air2:['combo_b',[2]],dive:['ult',[4]],tail:['special',[0,1],10],tail2:['special',[1]],meowc:['special',[5]],meow:['special',[2,3],12],meow2:['special',[4]],
 blink:['combo_b',[1]],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[2]],ultD:['ult',[3]],ultE:['ult',[4]],ultF:['ult',[5]]});
UA('pb',{idle:['idle',[0,1,2,3,4,3,2,1],6,1],run:['run',null,11,1],rise:['jump',[1,2],8],apex:['jump',[3]],fall:['jump',[4]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[5]],
 h1:['combo_a',[0,1],13],h2:['combo_a',[2,3],13],h3:['combo_b',[0]],h4:['combo_b',[1]],h5:['combo_b',[2]],h6:['combo_b',[3]],h7:['combo_a',[4,5],10],
 launch:['combo_b',[2]],air1:['combo_b',[1]],air2:['combo_b',[3]],dive:['ult',[2]],tail:['special',[0,1],10],tail2:['special',[2,3],8],meowc:['combo_a',[4]],meow:['ult',[1]],meow2:['combo_a',[5]],
 blink:['combo_b',[0]],spin:['special',[4]],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[2]],ultD:['ult',[2]],ultE:['combo_a',[5]],ultF:['ult',[5]]});
UA('cb',{idle:['idle',[0,1,2,3,4,3,2,1],6,1],run:['run',null,12,1],rise:['jump',[1,2],8],apex:['jump',[3]],fall:['jump',[4]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[5]],
 h1:['combo_a',[0,1],14],h2:['combo_a',[2,3],13],h3:['combo_a',[4,5],12],h4:['combo_b',[0]],h5:['combo_b',[1]],h6:['combo_b',[2]],h7:['combo_b',[3]],
 launch:['special',[4,5],12],air1:['combo_b',[1]],air2:['combo_b',[2]],dive:['combo_b',[2]],tail:['special',[0,1],14,1],tail2:['special',[0,1],18,1],meowc:['special',[4]],meow:['special',[5]],meow2:['special',[2]],
 stinger:['special',[3]],throw:['combo_b',[4]],catch:['combo_b',[5]],blink:['special',[3]],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[2]],ultD:['ult',[3]],ultE:['ult',[4]],ultF:['ult',[5]]});
UA('sr',{idle:['idle',null,6,1],run:['run',null,11,1],rise:['jump',[1,2],8],apex:['jump',[3]],fall:['jump',[2]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[0]],
 h1:['combo_a',[0,1],13],h2:['combo_a',[2]],h3:['combo_a',[3]],h4:['combo_a',[4]],h5:['combo_b',[0]],h6:['combo_b',[1]],h7:['combo_b',[3]],
 launch:['combo_a',[3]],air1:['combo_a',[2]],air2:['combo_b',[5]],dive:['ult',[4]],tail:['combo_b',[0]],tail2:['combo_b',[1]],meowc:['ult',[2]],meow:['combo_b',[4]],meow2:['combo_b',[5]],
 blink:['ult',[1]],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[2]],ultD:['ult',[3]],ultE:['ult',[4]],ultF:['idle',[0]]});
UA('sh',{idle:['idle',[1,3,4,3],5,1],run:['run',null,13,1],rise:['jump',[1,2],8],apex:['jump',[2]],fall:['jump',[2]],land:['jump',[5]],hurt:['jump',[0]],victory:['combo_b',[6]],
 h1:['combo_a',[0]],h2:['combo_a',[1]],h3:['combo_a',[2]],h4:['combo_a',[3]],h5:['combo_a',[4]],h6:['combo_b',[0]],h7:['combo_a',[5]],
 launch:['combo_b',[1]],air1:['combo_a',[4]],air2:['combo_b',[1]],dive:['combo_a',[5]],tail:['special',[4]],tail2:['special',[5]],meowc:['special',[0]],meow:['special',[1]],meow2:['special',[5]],
 blink:['special',[2,3],10],ultA:['ult',[0]],ultB:['ult',[2]],ultC:['ult',[3]],ultD:['ult',[4]],ultE:['ult',[5]],ultF:['combo_b',[6]]});
const UPRE=[null,'gs','lp','pb','cb','sr','sh'];
// ---- the six forms ----
const UF=[null,
 {pre:'gs',nm:'GUNSLINGER',ico:'🤠',col:'#ff4a3a',col2:'#ffc04d',spd:470,H:.34,H0:.3,minT:.12,W:.16,E:.42,
  CH:[null,{a:'h1',k:'shot',lunge:0,ht:.06,nm:'RUNE SHOT!'},{a:'h2',k:'shot',lunge:0,ht:.06,nm:'TWIN SHOT!'},{a:'h3',k:'shot',lunge:60,ht:.07,nm:'HIP FIRE!'},
   {a:'h4',k:'big',lunge:-80,ht:.08,nm:'BIG IRON!'},{a:'h5',k:'big',lunge:-80,ht:.08,nm:'BIGGER IRON!'},{a:'h6',k:'flat',lunge:300,ht:.07,nm:'SPUR KICK!'},{a:'h7',k:'shell',lunge:-120,ht:.12,nm:'SHOULDER CANNON!'}]},
 {pre:'lp',nm:'LIGHT PADDY',ico:'✨',col:'#7dff6a',col2:'#fff2a8',spd:450,H:.38,H0:.34,minT:.14,W:.18,E:.46,
  CH:[null,{a:'h1',k:'flat',lunge:240,ht:.07,nm:'SABER SWEEP!'},{a:'h2',k:'rise',lunge:220,ht:.07,nm:'RISING SABER!'},{a:'h3',k:'over',lunge:220,ht:.08,nm:'SUN CRESCENT!'},
   {a:'h4',k:'spin',lunge:200,ht:.07,nm:'SPIN SABER!'},{a:'h5',k:'cross',lunge:240,ht:.07,nm:'STAR CROSS!'},{a:'h6',k:'down',lunge:260,ht:.07,nm:'FALLING STAR!'},{a:'h7',k:'big',lunge:300,ht:.1,nm:'DAWN CLEAVER!'}]},
 {pre:'pb',nm:'POWER BLADE',ico:'⚡',col:'#3cc8ff',col2:'#c9f6ff',spd:420,H:.42,H0:.4,minT:.17,W:.22,E:.5,
  CH:[null,{a:'h1',k:'flat',lunge:220,ht:.09,nm:'REV SLASH!'},{a:'h2',k:'rise',lunge:200,ht:.09,nm:'REV SLASH II!'},{a:'h3',k:'spin',lunge:200,ht:.08,nm:'REV SPIN!'},
   {a:'h4',k:'over',lunge:300,ht:.09,nm:'HIGH ROLLER!'},{a:'h5',k:'rise',lunge:120,ht:.09,nm:'SPLIT RISE!'},{a:'h6',k:'cross',lunge:260,ht:.08,nm:'DOUBLE DOWN!'},{a:'h7',k:'over',lunge:180,ht:.13,nm:'MAX REV!'}]},
 {pre:'cb',nm:'CRIMSON BLADE',ico:'🗡️',col:'#ff2a3a',col2:'#ffd060',spd:460,H:.36,H0:.32,minT:.13,W:.17,E:.44,
  CH:[null,{a:'h1',k:'flat',lunge:260,ht:.06,nm:'CRIMSON CUT!'},{a:'h2',k:'low',lunge:220,ht:.06,nm:'LOW CUT!'},{a:'h3',k:'rise',lunge:220,ht:.07,nm:'RISING CUT!'},
   {a:'h4',k:'spin',lunge:200,ht:.06,nm:'WHIRL!'},{a:'h5',k:'rise',lunge:120,ht:.07,nm:'BACKFLIP KICK!'},{a:'h6',k:'over',lunge:320,ht:.07,nm:'HELM SPLITTER!'},{a:'h7',k:'low',lunge:360,ht:.08,nm:'SLIDE CUT!'}]},
 {pre:'sr',nm:'SHADOW REAPER',ico:'🌙',col:'#a66bff',col2:'#e2d6ff',spd:440,H:.4,H0:.36,minT:.15,W:.2,E:.48,
  CH:[null,{a:'h1',k:'flat',lunge:220,ht:.08,nm:'MOON REAP!'},{a:'h2',k:'spin',lunge:180,ht:.08,nm:'MOON WHEEL!'},{a:'h3',k:'rise',lunge:200,ht:.08,nm:'RISING REAP!'},
   {a:'h4',k:'over',lunge:240,ht:.09,nm:'CRESCENT DROP!'},{a:'h5',k:'spin',lunge:180,ht:.08,nm:'SCYTHE WHEEL!'},{a:'h6',k:'low',lunge:240,ht:.08,nm:'HOOK REAP!'},{a:'h7',k:'big',lunge:200,ht:.11,nm:'POLE VAULT KICK!'}]},
 {pre:'sh',nm:'SHADE',ico:'🦇',col:'#8a5cff',col2:'#45e0ff',spd:520,H:.3,H0:.26,minT:.1,W:.14,E:.38,
  CH:[null,{a:'h1',k:'thrust',lunge:300,ht:.04,nm:'SHADOW JAB!'},{a:'h2',k:'thrust',lunge:260,ht:.04,nm:'SHADOW JAB II!'},{a:'h3',k:'spin',lunge:220,ht:.05,nm:'SPIN BLADE!'},
   {a:'h4',k:'rise',lunge:160,ht:.05,nm:'RISING KNEE!'},{a:'h5',k:'flat',lunge:380,ht:.05,nm:'FLYING KICK!'},{a:'h6',k:'low',lunge:320,ht:.05,nm:'SHADOW SWEEP!'},{a:'h7',k:'cross',lunge:260,ht:.06,nm:'NIGHT CROSS!'}]}];
const UFm=()=>UF[p.uf]||null;
const UST=new Set(['u1','u2','u3','u4','u5','u6','u7','ulaunch','uair','udive','utail','umeowc','umeow','ublink','ufin']);
const UNG=new Set(['ufin']);
CINE.push('ufin');LIFT.push('uair','ulaunch');['u1','u2','u3','u4','u5','u6','u7','ulaunch','uair'].forEach(s=>CST.add(s));TST.add('utail');
Object.assign(KB,{u1:[200,-180,0,.035],u2:[220,-220,0,.04],u3:[240,-300,.1,.05],u4:[280,-260,.05,.05],u5:[160,-520,.3,.06],u6:[300,-340,.15,.06],u7:[480,-420,.2,.09],
 ulaunch:[60,-920,.55,.08],uair:[150,-320,.45,.045],udive:[260,-560,.25,.09],utail:[60,-260,.3,.03],ushot:[120,-110,.1,.02],ubig:[420,-380,.2,.08],ucannon:[700,-900,.5,.14],
 uwave:[380,-320,.2,.06],ublink:[100,-500,.4,.06],ufhit:[0,-90,.5,.03],ufinal:[300,-2300,1,.2],uclone:[50,-140,.25,.02],upush:[720,-260,.2,.08],upull:[-420,-160,.35,.05],
 ubuster:[0,-1100,.6,.12],uslam:[120,-300,.4,.12],ustab:[20,-70,.35,.015],uupper:[60,-1250,.6,.12],uheli:[30,-200,.45,.02],ubat:[60,-220,.35,.02],uquake:[160,-700,.4,.08]});
Object.assign(NAMES,{u1:'',u2:'',u3:'',u4:'',u5:'',u6:'',u7:'',ulaunch:'LAUNCH!',uair:'AIR STRIKE!',udive:'DIVE!',utail:'',ushot:'BANG!',ubig:'BIG IRON!',ucannon:'KA-BOOM!',uwave:'WAVE!',ublink:'',ufhit:'',ufinal:'',
 uclone:'ECHO!',upush:'FORCE PUSH!',upull:'PULL!',ubuster:'BUSTER!',uslam:'SLAM!',ustab:'STAB!',uupper:'UPPERCUT!',uheli:'WHIRL!',ubat:'BATS!',uquake:'QUAKE!'});
const U={proj:[],beams:[],bats:[],pillars:[],props:[],echo:[],moonT:0};
// ---- helpers ----
const uA=k=>UF[p.uf].pre+'_'+k;
const uFr=k=>(FR[uA(k)]||FR[fa('idle')]||FR.idle)[0];
function uGhost(k,l,x,y){ghosts.push({x:x??p.x,y:y??p.y,f:uFr(k||'idle'),face:p.face,l:l||.22,blue:1})}
function uStrike(kb,reach,h,all,nm){if(nm)NAMES[kb]=nm;const n=xStrike(kb,reach,h,all);if(n&&p.uf===6&&U.clone>0)uEcho(2);if(n&&p.uf===3&&p.pbEx>0){spark(p.x+p.face*120,p.y-80,10,['#3cc8ff','#fff'],420);shake=Math.max(shake,8)}return n}
function uEcho(n){for(let k=0;k<n;k++)U.echo.push({t:.07+k*.07,side:k%2?-1:1})}
function uNear(r){const d=nTarget(r||700);return d&&d.alive?d:null}
function uHitD(d,kb,dir,keep){if(!d||!d.alive)return;if(keep)d.hp=Math.max(2,d.hp);hitDummy(d,kb,dir??(Math.sign(d.x-p.x)||p.face))}
function uShot(o){U.proj.push(Object.assign({k:'bullet',x:p.x+p.face*95,y:p.y-92,vx:p.face*1500,vy:0,l:.6,s:1,face:p.face,hit:new Set(),kb:'ushot',col:UF[p.uf].col2},o))}
function muzzle(x,y,s,col){spark(x,y,6+Math.round(6*s),[col||'#ffc04d','#fff','#ff6a3a'],260*s);waves.push({x,y,r:6,l:.35,big:false})}
function bang(v){noiseS(.12,3200,600,v||.08)}
function uRing(x,y,col,col2,big){R9.rings.push({x,y,r:16,vr:big?1200:800,l:1,col,col2:col2||'#fff',w:big?16:10,f:5,face:0})}
function uBoom(x,col,col2,f){shake=42;slowT=.9;flashT=.4;hitstop=.12;cine.tz=1.12;cine.tdim=.25;cine.pillar={x,l:1.4,col};boom();
 R9.cracks.push(mkCrack(x,f));for(let i=0;i<6;i++)waves.push({x,y:GROUND-4+i*3,r:10+i*35,l:1,big:true});
 for(let i=0;i<4;i++)R9.rings.push({x,y:GROUND-60,r:20+i*40,vr:1400-i*150,l:1.2,col:i%2?col2:col,w:18-i*3,f,face:0,flat:1});
 for(let i=0;i<100;i++){const a=Math.random()*6.283,v=250+Math.random()*900;sparks.push({x,y:GROUND-60,vx:Math.cos(a)*v,vy:Math.sin(a)*v-300,l:.9,c:[col,col2,'#fff'][i%3]})}
 for(let i=0;i<26;i++)sparks.push({x:x+(Math.random()-.5)*300,y:GROUND,vx:(Math.random()-.5)*500,vy:-300-Math.random()*700,l:.9,c:'#7a6a5a'})}
function batPuff(x,y,n,col){for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.6,v=180+Math.random()*420;U.bats.push({x:x+(Math.random()-.5)*50,y:y+(Math.random()-.5)*60,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.7+Math.random()*.5,ph:Math.random()*6,s:.7+Math.random()*.6,col:col||'#2a1f3d'})}puffShadow(x,y+60)}
function crescent(o){U.proj.push(Object.assign({k:'moon',x:p.x+p.face*90,y:p.y-80,vx:p.face*900,vy:0,l:.8,s:1,face:p.face,hit:new Set(),kb:'uwave',col:'#a66bff'},o))}
// ---- the 8-hit chain ----
function ufHit(i){const X=UFm(),c=X.CH[i];p.ucombo=i;p.ucT=.7;C.atk++;act('u'+i,uA(c.a),{say:c.nm,c:i%2?X.col:X.col2});p.uhit=false;p.lunged=false;p.queued=false;p.perfect=false;p.miss=false;popNum(i,X.col);
 if(p.uf===3){p.pbPow=i;if(i>=4)spark(p.x+p.face*60,p.y-120,4+i*2,['#3cc8ff','#fff'],200+i*40)}}
function ufChainFx(X,i,c){const S='u'+i,col=i%2?X.col:X.col2,sc=1.05+(i-1)*.09;NAMES[S]=c.nm;
 if(c.k==='shot'||c.k==='big'&&p.uf===1){const big=c.k==='big';uShot({s:big?1.7:1,kb:big?'ubig':S,vx:p.face*(big?1700:1500),y:p.y-(big?100:92)});if(i===2)setTimeout(()=>{if(p.uf===1)uShot({y:p.y-80,kb:'ushot'})},70);
  muzzle(p.x+p.face*110,p.y-95,big?1.6:1);bang(big?.12:.07);shake=Math.max(shake,big?9:3);if(big){p.vx=-p.face*220;R9.rings.push({x:p.x+p.face*130,y:p.y-95,r:10,vr:600,l:.6,col:X.col2,col2:'#fff',w:8,f:5,face:p.face})}return}
 if(c.k==='shell'){U.proj.push({k:'shell',x:p.x+p.face*120,y:p.y-110,vx:p.face*1100,vy:-60,l:1.2,s:2.2,face:p.face,hit:new Set(),kb:'u7',col:X.col});muzzle(p.x+p.face*130,p.y-110,2.6);boom();shake=16;p.vx=-p.face*420;flashT=Math.max(flashT,.08);return}
 const kk=c.k==='big'?'cross':c.k==='low'?'flat':c.k==='thrust'?'flat':c.k;
 slash(kk,col,{lvl:i+1,scale:sc*(p.uf===3?1.18:1),dx:p.uf===6?75:95,col2:X.col2});if(i>=3)slash(kk,'#fff',{lvl:i,scale:sc*.8,delay:.05,dx:90});
 const reach=c.k==='thrust'?230:p.uf===5?210:p.uf===3?200:180;uStrike(S,reach,210,c.k==='spin');
 spark(p.x+p.face*95,p.y-80,5+i*2,[X.col,X.col2,'#fff'],200+i*35);shake=Math.max(shake,3+i*1.4);
 if(p.uf===2){sLine(p.x+p.face*20,p.y-110,p.x+p.face*190,p.y-50,X.col,.25,9);if(i===7){U.pillars.push({x:p.x+p.face*150,l:.8,col:X.col,w:70})}}
 if(p.uf===3){if(i>=5)flashT=Math.max(flashT,.04);if(i===7){R9.cracks.push(mkCrack(p.x+p.face*120,7));waves.push({x:p.x+p.face*120,y:GROUND,r:10,l:1,big:true});for(let k=0;k<14;k++)sparks.push({x:p.x+p.face*120,y:GROUND,vx:(Math.random()-.5)*500,vy:-200-Math.random()*400,l:.6,c:k%2?'#7a6a5a':'#3cc8ff'})}}
 if(p.uf===4&&c.k==='low'){for(let k=1;k<=3;k++)uGhost(c.a,.08+k*.04,p.x-p.face*k*30)}
 if(p.uf===5){crescent({vx:p.face*620,l:.35,s:.7+i*.08,kb:S,fx:1});if(i===7)U.moonT=.6}
 if(p.uf===6){for(let k=1;k<=3;k++)uGhost(c.a,.08+k*.04,p.x-p.face*k*28);if(U.clone>0)uEcho(2)}
 if(i>=4)waves.push({x:p.x+p.face*70,y:p.y-60,r:10,l:.4+i*.06,big:i>=7})}
function ufAir(){const X=UFm(),hot=now-(p.lastAirHitT||-9)<.6;if((p.uair||0)>=5&&!hot)return false;p.uair=(p.uair||0)+1;C.atk++;const n=p.uair,col=n%2?X.col:X.col2;popNum(n,col);
 act('uair',uA(n%2?'air1':'air2'),{say:(p.uf===1?'AIR SHOT':'AIR STRIKE')+(n>=3?' x'+n:'')+'!',c:col});p.vy=Math.min(p.vy,-190);p.vx=p.face*220;p.uq=['flat','rise','down','spin'][(n-1)%4];return true}
function ufLaunch(){const X=UFm();act('ulaunch',uA('launch'),{say:['','HIGH NOON KICK!','ASCENSION!','HIGH ROLLER!','HIGH TIME!','RISING MOON!','SHADOW RISE!'][p.uf],c:X.col2});p.vx=p.face*60;p.uair=0}
function ufDive(){const X=UFm();act('udive',uA('dive'),{say:['','LEAD RAIN!','STARFALL!','SPLIT SLAM!','HELM BREAKER!','LUNAR DROP!','SHADOW DROP!'][p.uf],c:X.col});p.vy=1300;p.vx=p.face*180}
function ufJump(){const X=UFm();
 if(p.ground){p.state='normal';p.vy=-780;p.ground=false;p.jumps=1;p.lastJump=now;setAnim(uA('rise'),true);spark(p.x,p.y,10,[X.col,'#fff'],160);acted=true;return true}
 if(p.jumps<2){p.jumps=2;p.vy=-680;setAnim(uA('rise'),true);acted=true;extend();
  if(p.uf===6){batPuff(p.x,p.y-60,10);say('BAT HOP!',X.col)}else if(p.uf===5){crescent({vx:0,vy:400,y:p.y,l:.35,fx:1,s:.8});say('MOON HOP!',X.col)}
  else{R9.rings.push({x:p.x,y:p.y+4,r:16,vr:500,l:.8,col:X.col,col2:X.col2,w:8,f:5,face:0,flat:1});say(p.uf===1?'SKY SHOT!':p.uf===2?'LIGHT LEAP!':'AIR HIKE!',X.col2);if(p.uf===1){uShot({vx:p.face*700,vy:900,y:p.y-40});bang()}}
  return true}return false}
// ---- Tail: each form's own tail move (3 in rhythm = a TTT opener) ----
const UTN=[null,['RICOCHET SPIN!','RICOCHET x2!','BULLET BALLET!'],['FORCE PUSH!','FORCE PULL!','FORCE LIFT!'],['SNATCH!','SNATCH x2!','BUSTER SLAM!'],['HELICOPTER SWORD!','HELICOPTER x2!','RISING HELICOPTER!'],
 ['REAPER HOOK!','HOOK & REAP!','MOON WHEEL!'],['SHURIKEN!','SHURIKEN x2!','SHURIKEN STORM!']];
function ufTail(){const X=UFm(),n=p.utT>0?Math.min(3,(p.utn||0)+1):1;p.utn=n;p.utT=.9;act('utail',uA(n===3&&p.uf!==4?'tail2':'tail'),{say:UTN[p.uf][n-1],c:n===3?X.col2:X.col});p.vx*=.3;p.ut={n,tg:uNear(600)};if(!p.ground)p.vy=Math.min(p.vy,-120)}
function ufTailFx(t,at){const X=UFm(),q=p.ut,n=q.n,g=q.tg&&q.tg.alive?q.tg:null;
 switch(p.uf){
 case 1:if(at(.05)||at(.17)){for(const f of [1,-1])uShot({x:p.x+f*90,vx:f*1500,face:f,y:p.y-90});muzzle(p.x+p.face*90,p.y-90,1);muzzle(p.x-p.face*90,p.y-90,1);bang()}
  if(n===3&&at(.26)){uStrike('utail',170,230,true,'BULLET BALLET!');for(let k=0;k<8;k++){const a=k/8*6.283;uShot({x:p.x,y:p.y-90,vx:Math.cos(a)*1300,vy:Math.sin(a)*1300,face:Math.cos(a)>0?1:-1})}shake=10}break;
 case 2:if(at(.08)){if(n===2&&g){g.vx=0;U.pull={d:g,t:.3,x:p.x+p.face*120}}else{uRing(p.x+p.face*80,p.y-80,X.col,X.col2,n===3);for(const d of dummies)if(d.alive&&(d.x-p.x)*p.face>-40&&Math.abs(d.x-p.x)<360)uHitD(d,n===3?'ulaunch':'upush',p.face)}
   sLine(p.x+p.face*60,p.y-90,p.x+p.face*300,p.y-90,X.col,.3,14);shake=Math.max(shake,7)}if(n===2&&at(.3)&&g)uHitD(g,'utail',p.face);break;
 case 3:if(at(.06)){const d=g&&Math.abs(g.x-p.x)<620?g:null;U.arm={l:.35,x1:d?d.x:p.x+p.face*420,y1:d?d.y-150:p.y-90};if(d){d.vx=0;U.pull={d,t:.22,x:p.x+p.face*130};say('GOTCHA!',X.col2)}}
  if(at(.3)&&g&&Math.abs(g.x-p.x)<260){if(n===3){uHitD(g,'ubuster',p.face);U.slamQ={d:g,t:.32};flashT=Math.max(flashT,.1);hitstop=.08}else uHitD(g,'utail',p.face)}break;
 case 4:if(at(.05)||at(.13)||at(.21)||at(.29)||(n===3&&at(.37))){uStrike('utail',190,260,true,'HELICOPTER!');spark(p.x,p.y-170,8,[X.col,X.col2,'#fff'],320)}if(n===3&&at(.1)){p.vy=-620;p.ground=false}if(!p.ground&&n<3)p.vy=Math.min(p.vy,60);break;
 case 5:if(at(.07)){if(n<3&&g&&Math.abs(g.x-p.x)<380){U.pull={d:g,t:.2,x:p.x+p.face*120};uHitD(g,'upull',p.face)}else uStrike('utail',230,260,true,'MOON WHEEL!');slash(n===3?'spin':'low',X.col,{lvl:6,scale:1.4,dx:90,col2:X.col2})}
  if(n===3&&at(.2))uStrike('utail',230,260,true);break;
 case 6:if(at(.08)){const a0=n===3?16:3;for(let k=0;k<a0;k++){const a=n===3?k/a0*6.283:(k-1)*.12;stars.push({x:p.x+p.face*60,y:p.y-85,vx:(n===3?Math.cos(a):p.face*Math.cos(a))*950,vy:950*Math.sin(a),r:0,l:.8,hit:new Set()})}shake=3}break}}
// ---- Meow: hold to charge (Gunslinger: the gun grows, then becomes a CANNON) ----
function ufCharge(){act('umeowc',uA('meowc'));p.uc=0;p.ucl=0}
function ufMeow(L){const X=UFm(),nm=[null,['RUNE SHOT!','BIG IRON!','RUNE CANNON!!'],['LIGHT ORB!','FORCE WAVE!','SABER BOOMERANG!'],['EXCEED!','MAX-ACT!','SHOCK SPLITTER!'],['STINGER!','RISING DRAGON!','MILLION STAB!'],
  ['CRESCENT WAVE!','TWIN CRESCENTS!','LUNAR TIDE!'],['AFTERIMAGE!','BAT SWARM!','SHADOW LEGION!']][p.uf][L];
 act('umeow',uA(L===2&&p.uf!==3?'meow2':'meow'),{say:nm,c:L?X.col2:X.col});p.um={L,n:0,k:0};C.atk++;extend();if(L===2){card(nm.replace(/!+$/,'!!'),'MEOW · fully charged',X.col);slowT=Math.max(slowT,.2)}
 if(p.uf===4&&L===0){p.inv=Math.max(p.inv,.3)}if(p.uf===4&&L===2)setAnim(uA('meow2'),true)}
function ufMeowFx(t,at,dt){const X=UFm(),q=p.um,L=q.L;
 switch(p.uf){
 case 1:if(at(.04)){if(L<2){uShot({s:L?2.2:1.4,kb:L?'ubig':'ushot',vx:p.face*1800});if(L)setTimeout(()=>{if(p.uf===1){uShot({s:2.2,kb:'ubig',y:p.y-70});uShot({s:2.2,kb:'ubig',y:p.y-120})}},90);muzzle(p.x+p.face*130,p.y-100,L?2.2:1.3);bang(.12);p.vx=-p.face*(L?360:160);shake=L?14:6}
   else{U.beams.push({x:p.x+p.face*120,y:p.y-105,face:p.face,l:.9,w:90,col:X.col,col2:X.col2,hit:new Set(),kb:'ucannon'});boom();shake=30;flashT=.25;hitstop=.06;p.vx=-p.face*520;for(let i=0;i<40;i++)sparks.push({x:p.x+p.face*140,y:p.y-105,vx:p.face*(300+Math.random()*900),vy:(Math.random()-.5)*600,l:.7,c:[X.col,X.col2,'#fff'][i%3]})}}break;
 case 2:if(at(.1)){if(L===0)U.proj.push({k:'orb',x:p.x+p.face*90,y:p.y-110,vx:p.face*700,vy:0,l:1.3,s:1,face:p.face,hit:new Set(),kb:'uwave',col:X.col});
   else if(L===1){for(let i=0;i<3;i++)R9.rings.push({x:p.x,y:p.y-80,r:20+i*30,vr:1000,l:1,col:i%2?X.col2:X.col,w:12,f:6,face:0});for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<420)uHitD(d,'upush',Math.sign(d.x-p.x)||p.face);shake=14}
   else U.proj.push({k:'saber',x:p.x+p.face*90,y:p.y-100,vx:p.face*1000,vy:0,l:1.6,s:1.3,face:p.face,hit:new Set(),ret:1,kb:'uwave',col:X.col,tick:0})}break;
 case 3:if(at(.06)){if(L<2){p.pbEx=Math.min(3,(p.pbEx||0)+(L?3:1));p.pbExT=6;for(let i=0;i<20;i++)sparks.push({x:p.x+p.face*60+(Math.random()-.5)*90,y:p.y-120+(Math.random()-.5)*80,vx:(Math.random()-.5)*300,vy:-100-Math.random()*300,l:.5,c:i%2?X.col:'#fff'});uRing(p.x,p.y-90,X.col,X.col2,L);say('EXCEED '+p.pbEx+'!',X.col2,true);beat(660+p.pbEx*160,.06);shake=6+p.pbEx*3}
   else{U.proj.push({k:'quake',x:p.x+p.face*80,y:GROUND,vx:p.face*900,vy:0,l:.9,s:1.4,face:p.face,hit:new Set(),kb:'uquake',col:X.col});R9.cracks.push(mkCrack(p.x+p.face*60,7));boom();shake=22}}break;
 case 4:if(L===0){if(t<.3){p.vx=p.face*1150;if(t%.025<dt)uGhost('stinger',.25)}else p.vx*=Math.pow(.01,dt);if(at(.12)||at(.24))uStrike('umeow',200,220,false,'STINGER!')}
  else if(L===1){if(at(.08)){p.vy=-900;p.ground=false;uStrike('uupper',190,240,false,'RISING DRAGON!');slash('rise',X.col,{lvl:8,scale:1.8,dx:70,col2:X.col2});for(let i=0;i<24;i++)sparks.push({x:p.x+p.face*60,y:p.y-60,vx:(Math.random()-.5)*200,vy:-200-Math.random()*600,l:.6,c:i%2?'#ff8a3a':X.col2});shake=14}}
  else{p.vx*=Math.pow(.02,dt);q.k-=dt;if(t>.1&&t<.85&&q.k<=0){q.k=.05;q.n++;uStrike('ustab',230,220,false,'MILLION STAB!');sLine(p.x+p.face*40,p.y-90+(Math.random()-.5)*60,p.x+p.face*(200+Math.random()*80),p.y-90+(Math.random()-.5)*80,q.n%2?'#fff':X.col,.15,6);setAnim(uA(q.n%2?'meow2':'stinger'),true)}
   if(at(.9)){setAnim(uA('meow'),true);uStrike('uupper',220,240,false,'…AND UP!');slash('rise',X.col2,{lvl:8,scale:1.7,dx:70,col2:X.col});shake=16}}break;
 case 5:if(at(.1)){const n=L===0?1:L===1?2:5;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.22;crescent({vx:p.face*950*Math.cos(a),vy:950*Math.sin(a),s:L===2?1.5:1.15,l:1})}if(L===2){U.moonT=1.2;shake=14}}break;
 case 6:if(at(.06)){if(L!==1){U.clone=L===2?9:6;batPuff(p.x-80,p.y-80,8);batPuff(p.x+80,p.y-80,8);say(L===2?'SHADOW LEGION!':'AFTERIMAGE ×2!',X.col2,true)}
   if(L>=1){for(let i=0;i<(L===2?10:7);i++)U.proj.push({k:'bat',x:p.x+p.face*60,y:p.y-100+(Math.random()-.5)*60,vx:p.face*(600+Math.random()*400),vy:(Math.random()-.5)*300,l:1.1,s:1,face:p.face,hit:new Set(),kb:'ubat',col:'#2a1f3d',ph:Math.random()*6})}}break}}
// ---- Blink: each form's dodge-teleport ----
function ufBlink(){if(!p.uf||p.blinkCool>0||CINE.includes(p.state)||['lk','lkult','nmorph','respawn','ledge'].includes(p.state))return false;p.blinkCool=.42;const X=UFm(),g=uNear(700);
 const nm=['','QUICKDRAW ROLL!','LIGHT STEP!','STREAK!','AIR TRICK!','MOON PHASE!','BAT POOF!'][p.uf];act('ublink',uA('blink'),{say:nm,c:X.col2});p.ub={g,x0:p.x,y0:p.y,hit:new Set(),done:false};p.inv=Math.max(p.inv,.35);p.rot=0;extend();
 if(p.uf===2||p.uf===5||p.uf===6){const fx0=p.x,fy0=p.y;if(p.uf===6)batPuff(p.x,p.y-80,14);else puffShadow(p.x,p.y);
  if(g){const side=Math.abs(g.x-p.x)<160?-p.face:p.face;p.x=clampX(g.x+side*110);p.face=g.x>p.x?1:-1}else p.x=clampX(p.x+p.face*280);
  for(let k=1;k<=6;k++)ghosts.push({x:fx0+(p.x-fx0)*k/7,y:fy0,f:uFr('blink'),face:p.face,l:.1+k*.035,blue:1});if(p.uf===2)sLine(fx0,fy0-90,p.x,p.y-90,X.col,.4,12);if(p.uf===5)sLine(fx0,fy0-90,p.x,p.y-90,X.col,.4,8);
  if(p.uf===6)batPuff(p.x,p.y-80,10);else puffShadow(p.x,p.y);shake=Math.max(shake,5)}
 else if(p.uf===4){const fx0=p.x;puffShadow(p.x,p.y);if(g){p.x=clampX(g.x-p.face*30);p.y=Math.min(GROUND,g.y-260)}else p.y=Math.min(p.y,GROUND)-220;p.ground=false;p.vy=-150;sLine(fx0,p.ub.y0-90,p.x,p.y-90,X.col,.35,8);puffShadow(p.x,p.y)}
 return true}
function ufDash(dir){p.face=dir==='right'?1:-1;if(p.dashCool>0)return;p.dashCool=.45;p.dashStart=now;p.blinkCool=0;ufBlink()}
function ufCancel(){if(P.special){ufCharge();return true}if(P.tail||P.swat||P.hiss){ufTail();return true}if(P.attack&&(K.up||K.down)&&p.ground&&p.state!=='ulaunch'){ufLaunch();return true}
 if(P.jump&&ufJump())return true;if(P.dash&&p.dashCool<=0){ufDash(P.dash);return true}if(P.blink&&ufBlink())return true;return false}
function ufMoves(dir){if(P.jump&&ufJump())return;if(!p.ground&&P.down&&!P.attack){ufDive();return}
 if(P.attack){if(!p.ground){if(K.down)ufDive();else ufAir();return}if(K.up||K.down){ufLaunch();return}ufHit(p.ucT>0&&p.ucombo<3?p.ucombo+1:1);return}
 if(P.special){ufCharge();return}if(P.tail||P.swat||P.hiss){ufTail();return}}
// ---- per-frame state machine for the legend forms ----
function ufState(S,dt,end,dir){const X=UFm();if(!X){p.state='normal';return}const t=p.t,at=T=>t>=T&&t-dt<T;
 if(/^u[1-7]$/.test(S)){const i=p.ucombo,c=X.CH[i];if(!c){p.state='normal';return}const timed=i>=3,H=timed?X.H:X.H0;
  if(t<c.ht-.02)p.vx*=Math.pow(.05,dt);else{if(!p.lunged){p.lunged=true;p.vx=p.face*c.lunge}p.vx*=Math.pow(.03,dt)}
  if(t>=c.ht&&!p.uhit){p.uhit=true;ufChainFx(X,i,c);if(p.uf===4&&i===5){p.vy=-380;p.ground=false}if(p.uf===6&&i===4){p.vy=-300;p.ground=false}}
  if(c.k==='spin'&&at(c.ht+.12)){C.atk++;uStrike(S,190,210,true);slash('spin','#fff',{lvl:i,scale:1.1})}
  if(p.uf===4&&i===7&&t>c.ht&&t<c.ht+.18&&t%.03<dt)uGhost(c.a,.18);
  if(t>Math.max(.1,X.minT-.02)&&ufCancel())return;
  if(P.attack){if(!timed)p.queued=true;else if(!p.miss){if(t>=H-.2){p.perfect=true;p.queued=true}else if(!p.perfect)p.miss=true}}
  if(p.queued&&(timed?p.perfect:t>X.minT)&&p.uhit){p.queued=false;if(!p.ground&&i<4){ufAir()}else{
    if(timed){say('PERFECT!','#7fffd4',true);waves.push({x:p.x,y:p.y-60,r:30,l:.7,big:false});hitstop=Math.max(hitstop,.05)}
    if(i>=7)ufFinal();else ufHit(i+1)}}
  else if(t>(timed?H+.06:H)&&(p.ground||t>H+.3)){p.state='normal';if(timed)p.ucombo=0}return}
 switch(S){
 case 'ulaunch':p.vx*=Math.pow(.05,dt);if(at(.07)){p.vy=-780;p.ground=false;p.jumps=1;uStrike('ulaunch',180,250,false,NAMES.ulaunch);slash('rise',X.col,{scale:1.4,lvl:6,dx:80,col2:X.col2});
   if(p.uf===1){uShot({vx:p.face*600,vy:-1300,y:p.y-60});bang()}shake=Math.max(shake,8)}
  if(P.attack&&t>.14){if(!p.ground)ufAir();else ufHit(1);break}if(t>.14&&ufCancel())break;if(t>.45||(p.ground&&t>.2))p.state='normal';break;
 case 'uair':p.vy=Math.min(p.vy,140);if(at(.04)){const col=p.uair%2?X.col:X.col2;if(p.uf===1){uShot({vx:p.face*1300,vy:500,y:p.y-80});muzzle(p.x+p.face*90,p.y-80,1);bang();uStrike('uair',150,200,false,'AIR SHOT!')}
   else{slash(p.uq||'flat',col,{scale:1.3,lvl:Math.min(8,p.uair+2),dx:85,col2:X.col2});uStrike('uair',175,210,p.uq==='spin');spark(p.x+p.face*80,p.y-75,8,[col,'#fff'])}if(p.uf===6)uGhost('air1',.2,p.x-p.face*40)}
  if(t>.08&&P.attack){if(K.down)ufDive();else if(!ufAir())p.state='normal';break}if(t>.1&&ufCancel())break;if(t>.3||p.ground)p.state='normal';break;
 case 'udive':p.vy=1300;if(t%.03<dt)uGhost('dive',.22);if(p.uf===1&&t%.07<dt){uShot({vx:p.face*300,vy:1500,y:p.y-40});bang(.04)}
  if(p.ground){uStrike('udive',200,220,true,NAMES.udive);areaHit(p.x,p.y,200,'udive');shake=16;waves.push({x:p.x,y:p.y,r:10,l:1,big:true});
   if(p.uf===3||p.uf===4){R9.cracks.push(mkCrack(p.x,4+p.uf));boom()}if(p.uf===2)U.pillars.push({x:p.x,l:.7,col:X.col,w:60});if(p.uf===5)crescent({vx:0,y:GROUND-20,l:.4,s:1.6,fx:1});if(p.uf===6)batPuff(p.x,p.y-40,12);
   for(let k=0;k<12;k++)sparks.push({x:p.x+(Math.random()-.5)*80,y:GROUND,vx:(Math.random()-.5)*500,vy:-200-Math.random()*400,l:.6,c:k%2?'#7a6a5a':X.col});act('land',uA('land'));p.vx=p.face*120}break;
 case 'utail':p.vx*=Math.pow(.02,dt);ufTailFx(t,at);if(t>.16&&(P.tail||P.swat||P.hiss)&&p.utn<3){ufTail();break}if(t>.14&&P.attack&&p.ground){ufHit(1);break}if(t>.14&&(P.jump||P.dash||P.special||P.blink)&&ufCancel())break;
  if(t>(p.uf===4&&p.ut.n===3?.6:.46))p.state='normal';break;
 case 'umeowc':{p.vx*=Math.pow(.02,dt);if(!p.ground)p.vy=Math.min(p.vy,80);p.uc=t;const L=t<.35?0:t<1.1?1:2;
  if(L!==p.ucl){p.ucl=L;beat(520+L*260,.05);uRing(p.x+p.face*40,p.y-90,X.col,X.col2,L===2);if(p.uf===1)say(L===1?'BIG IRON…':'CANNON!!',X.col2,true);if(p.uf===1||p.uf===2)setAnim(uA(L===2?'meow2':L?'meow':'meowc'),true);shake=Math.max(shake,3+L*4)}
  if(t%.04<dt){const a=Math.random()*6.283,R=110+L*30;sparks.push({x:p.x+Math.cos(a)*R,y:p.y-90+Math.sin(a)*R,vx:-Math.cos(a)*260,vy:-Math.sin(a)*260,l:.4,c:Math.random()<.5?X.col:X.col2})}
  if(!K.special||t>3)ufMeow(L);break}
 case 'umeow':ufMeowFx(t,at,dt);if(!p.ground&&p.uf!==4)p.vy=Math.min(p.vy,100);if(p.uf!==4||p.um.L!==0)p.vx*=Math.pow(.05,dt);
  {const D=p.um.L===2?(p.uf===4?1.15:.8):.42;if(t>.2&&t<D&&P.attack&&p.um.L<2){if(p.ground)ufHit(1);else ufAir();break}if(t>D)p.state='normal'}break;
 case 'ublink':{const q=p.ub;
  if(p.uf===1){p.vx=t<.28?p.face*820:p.vx*Math.pow(.01,dt);if(t%.03<dt&&t<.28)uGhost('blink',.22);if(at(.3)){const g=uNear(700);if(g){p.face=g.x>p.x?1:-1}uShot({s:1.3});muzzle(p.x+p.face*100,p.y-90,1.2);bang()}if(t>.45)p.state='normal'}
  else if(p.uf===3){p.vx=t<.24?p.face*1100:p.vx*Math.pow(.01,dt);if(t<.24){if(t%.025<dt)uGhost('blink',.25);for(const d of dummies)if(d.alive&&!q.hit.has(d)&&Math.abs(d.x-p.x)<120&&d.y-d.h<p.y){q.hit.add(d);uHitD(d,'ublink',p.face);slash('flat',X.col,{lvl:7,scale:1.4,dx:40,col2:X.col2})}}if(t>.4)p.state='normal'}
  else if(p.uf===4){p.vy=t<.12?-60:p.vy;if(at(.12)){act('udive',uA('dive'),{say:'TRICK… HELM BREAKER!',c:X.col});p.vy=1400}}
  else{p.vx*=Math.pow(.02,dt);if(at(.06)){const g=q.g&&q.g.alive?q.g:null;slash('cross',X.col,{lvl:7,scale:1.35,dx:60,col2:X.col2});if(g&&Math.abs(g.x-p.x)<260)uHitD(g,'ublink',Math.sign(g.x-p.x)||p.face)}if(t>.34)p.state='normal'}
  if(t>.12&&P.attack&&p.state==='ublink'){if(p.ground)ufHit(1);else ufAir()}break}
 case 'ufin':ufFinalState(dt,t,at);break}}
// ---- the perfect 8th hit: each form's cinematic finisher ----
const UFIN=[null,'HIGH NOON CANNON!!','JUDGEMENT OF LIGHT!!','EARTH SHATTER!!','HIGH TIME!!','FULL MOON REAP!!','SHADOW EXECUTION!!'];
function ufFinal(){const X=UFm();C.atk++;popNum(8,X.col);act('ufin',uA(p.uf===1?'meow2':p.uf===3?'meowc':'ultA'),{say:UFIN[p.uf].replace(/!+$/,'…'),c:X.col2});p.inv=5;p.grab=uNear(520);p.vx=0;p.vy=0;p.fz={st:0,k:0,n:0};cineGo(1.3,.45);slowT=Math.max(slowT,.12)}
function ufFinalState(dt,t,at){const X=UFm(),g=p.grab&&p.grab.alive?p.grab:null,z=p.fz,gx=g?g.x:clampX(p.x+p.face*180),e=x=>x*x*(3-2*x);p.rot=0;
 const land=()=>{p.y+=(GROUND-p.y)*Math.min(1,dt*12);if(p.y>GROUND-3){p.y=GROUND;p.ground=true}};
 const fin=(x)=>{if(z.boom)return;z.boom=true;uBoom(x,X.col,X.col2,4+p.uf);if(g){g.hp=Math.max(1,g.hp);hitDummy(g,'ufinal',p.face);g.vy=-2300}card(UFIN[p.uf],'PERFECT 8TH HIT',X.col)};
 const hold=()=>{if(g&&!z.boom){g.vx=0;g.vy=0;g.fl=.6}};
 switch(p.uf){
 case 1:land();hold();if(t<.5){if(t%.05<dt){const a=Math.random()*6.283;sparks.push({x:p.x+p.face*140+Math.cos(a)*90,y:p.y-110+Math.sin(a)*90,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.35,c:X.col2})}}
  if(at(.5)){setAnim(uA('meow2'),true);U.beams.push({x:p.x+p.face*130,y:p.y-110,face:p.face,l:1.1,w:130,col:X.col,col2:X.col2,hit:new Set(),kb:'ufhit'});p.vx=-p.face*500;fin(gx)}
  if(t>.5)p.vx*=Math.pow(.05,dt);if(t>1.6)ufFinEnd();break;
 case 2:land();hold();if(at(.05)&&g){U.pull={d:g,t:.3,x:p.x+p.face*120}}if(at(.4)){setAnim(uA('ultC'),true);p.vy=0}
  if(at(.62)){setAnim(uA('ultD'),true);slash('big',X.col,{lvl:8,scale:2.6,dx:110,col2:X.col2});U.pillars.push({x:gx,l:1.2,col:X.col,w:120});fin(gx)}if(t>1.5)ufFinEnd();break;
 case 3:if(t<.4){const u=e(t/.4);setAnim(uA('ultC'));p.y+=((GROUND-280*u)-p.y)*Math.min(1,dt*14);p.x+=((gx-p.face*80)-p.x)*Math.min(1,dt*5);p.ground=false;hold();if(t%.03<dt)uGhost('ultC',.2)}
  else if(t<.55){setAnim(uA('dive'));p.y=Math.min(GROUND,p.y+2600*dt);hold()}
  else{land();if(!z.boom){setAnim(uA('meow2'),true);fin(p.x+p.face*70);U.props.push({k:'pb_ult',i:4,x:p.x+p.face*70,l:1.4});for(let i=1;i<=4;i++)U.pillars.push({x:p.x+p.face*70+(i%2?1:-1)*i*80,l:.7+i*.12,col:X.col,w:50,d:i*.08});p.pbEx=0}if(t>1.7)ufFinEnd()}break;
 case 4:land();hold();z.k-=dt;if(t>.1&&t<.9&&z.k<=0){z.k=.055;z.n++;setAnim(uA(z.n%2?'meow2':'stinger'),true);if(g)uHitD(g,'ustab',p.face,1);sLine(p.x+p.face*40,p.y-90+(Math.random()-.5)*70,p.x+p.face*(220+Math.random()*80),p.y-90+(Math.random()-.5)*90,z.n%2?'#fff':X.col,.15,7);shake=Math.max(shake,5)}
  if(at(.95)){setAnim(uA('meow'),true);slash('rise',X.col,{lvl:8,scale:2.2,dx:80,col2:X.col2});p.vy=-700;p.ground=false;fin(gx)}if(t>.95){p.vy+=1600*dt;p.y+=p.vy*dt;if(p.y>=GROUND){p.y=GROUND;p.ground=true;p.vy=0}}if(t>1.8)ufFinEnd();break;
 case 5:land();hold();if(at(.05))U.moonT=1.6;if(at(.25)||at(.45)||at(.65)){setAnim(uA(['ultB','ultC','ultD'][Math.round((t-.25)/.2)]),true);if(g)uHitD(g,'ufhit',p.face,1);slash('spin',X.col,{lvl:8,scale:1.8,col2:X.col2})}
  if(at(.85)){setAnim(uA('ultE'),true);for(let i=0;i<5;i++)crescent({vx:p.face*1000*Math.cos((i-2)*.2),vy:1000*Math.sin((i-2)*.2),s:1.6,l:.9,fx:1});fin(gx)}if(t>1.7)ufFinEnd();break;
 case 6:hold();if(t<.9){z.k-=dt;if(z.k<=0&&g){z.k=.11;z.n++;const fx0=p.x,fy0=p.y,a=z.n*2.4;p.x=clampX(gx+Math.cos(a)*130);p.y=Math.min(GROUND,(g?g.y:GROUND)-20+Math.sin(a)*60);p.face=gx>p.x?1:-1;
   setAnim(uA(['h1','h3','h5','h7'][z.n%4]),true);sLine(fx0,fy0-80,p.x,p.y-80,z.n%2?X.col:X.col2,.3,8);batPuff(p.x,p.y-80,3);uHitD(g,'uclone',p.face,1);for(let k=0;k<2;k++)ghosts.push({x:gx+(k?1:-1)*110,y:p.y,f:uFr('h7'),face:k?-1:1,l:.3,blue:1})}}
  else{land();if(!z.boom){setAnim(uA('ultE'),true);slash('cross',X.col,{lvl:8,scale:3,dx:0,col2:X.col2});fin(gx)}}if(t>1.8)ufFinEnd();break}}
function ufFinEnd(){p.state='normal';p.ucombo=0;p.inv=.4;p.grab=null;if(p.y<GROUND-2)p.ground=false}
// ---- LINK moves (after a C C C / T T T opener) ----
LKF.push(
 {col:'#ff4a3a',col2:'#ffc04d',C:{nm:'TRICK SHOT!',a:'h3'},CC:{nm:'FAN THE HAMMER!',a:'h2'},T:{nm:'RICOCHET!',a:'tail'},TT:{nm:'BULLET BALLET!',a:'tail2'},M:{nm:'BIG IRON!',a:'meow'},MM:{nm:'RUNE CANNON!!',a:'meow2'},B:{nm:'QUICKDRAW!',a:'blink'},BB:{nm:'DOUBLE QUICKDRAW!',a:'blink'}},
 {col:'#7dff6a',col2:'#fff2a8',C:{nm:'SABER ARC!',a:'h5'},CC:{nm:'ASCENDING SABER!',a:'launch'},T:{nm:'FORCE PUSH!',a:'tail'},TT:{nm:'FORCE PULL!',a:'tail2'},M:{nm:'LIGHT ORB!',a:'meowc'},MM:{nm:'SABER BOOMERANG!',a:'meow'},B:{nm:'LIGHT STEP!',a:'blink'},BB:{nm:'SUNSTEP CROSS!',a:'h5'}},
 {col:'#3cc8ff',col2:'#c9f6ff',C:{nm:'REV SLASH!',a:'h6'},CC:{nm:'CALIBUR!',a:'h4'},T:{nm:'SNATCH!',a:'tail'},TT:{nm:'BUSTER SLAM!',a:'tail2'},M:{nm:'EXCEED!',a:'meowc'},MM:{nm:'SHOCK SPLITTER!',a:'meow2'},B:{nm:'STREAK!',a:'blink'},BB:{nm:'DOUBLE STREAK!',a:'spin'}},
 {col:'#ff2a3a',col2:'#ffd060',C:{nm:'HIGH TIME!',a:'launch'},CC:{nm:'ROUND TRIP!',a:'throw'},T:{nm:'HELICOPTER!',a:'tail'},TT:{nm:'HELICOPTER STORM!',a:'tail2'},M:{nm:'MILLION STAB!',a:'meow2'},MM:{nm:'STINGER!',a:'stinger'},B:{nm:'AIR TRICK!',a:'h6'},BB:{nm:'TRICK X!',a:'h6'}},
 {col:'#a66bff',col2:'#e2d6ff',C:{nm:'REAP!',a:'h1'},CC:{nm:'HARVEST HOOK!',a:'h6'},T:{nm:'SCYTHE WHEEL!',a:'tail'},TT:{nm:'MOON WHEEL!',a:'h2'},M:{nm:'CRESCENT WAVE!',a:'meow'},MM:{nm:'TWIN CRESCENTS!',a:'meow'},B:{nm:'MOON PHASE!',a:'blink'},BB:{nm:'ECLIPSE STEP!',a:'blink'}},
 {col:'#8a5cff',col2:'#45e0ff',C:{nm:'SHADOW JAB!',a:'h2'},CC:{nm:'PHANTOM X!',a:'h7'},T:{nm:'SHURIKEN!',a:'tail'},TT:{nm:'SHURIKEN STORM!',a:'tail2'},M:{nm:'AFTERIMAGE!',a:'meow'},MM:{nm:'SHADOW LEGION!',a:'meow'},B:{nm:'BAT POOF!',a:'blink'},BB:{nm:'BAT SWARM!',a:'blink'}});
ROUTES.push(
 [{k:'CCCM',nm:'BIG IRON!',tip:'3 quick shots, then the revolver grows into a BIG IRON'},{k:'CCCMM',nm:'RUNE CANNON!',tip:'BIG IRON… then it transforms AGAIN into a giant screen-clearing cannon'},
  {k:'CCCTT',nm:'BULLET BALLET!',tip:'twin-gun spins that spray both ways'},{k:'TTTB',nm:'QUICKDRAW!',tip:'ricochet spins, then a sliding quickdraw'},
  {k:'CCCCCB',nm:'DEADEYE DASH!',tip:'5 timed shots, then a rolling quickdraw'},{k:'TTTCCM',nm:'RICOCHET RAIN!',tip:'ricochets, trick shots, then BIG IRON'},
  {k:'CCCMBMM',nm:'DEADEYE JUDGEMENT',ult:1,tip:'ULTIMATE: time slows, twin guns blaze, BIG IRON, then the giant RUNE CANNON'}],
 [{k:'CCCT',nm:'FORCE PUSH!',tip:'saber swings, then blast him away with light'},{k:'CCCTT',nm:'PULL & SLICE!',tip:'push him away, then pull him right back'},
  {k:'TTTMM',nm:'SABER BOOMERANG!',tip:'force moves, a light orb, then the spinning blade throw'},{k:'CCCBB',nm:'SUNSTEP CROSS!',tip:'two light-steps through him, X-slash each time'},
  {k:'CCCCCM',nm:'DAWN ORB!',tip:'5 timed saber swings, then a light orb'},{k:'CCCTMBC',nm:'SUNBURST SABER',ult:1,tip:'ULTIMATE: kneel, golden aura, a sky-high saber cuts the ground in two'}],
 [{k:'CCCT',nm:'SNATCH!',tip:'the robot gauntlet shoots out and yanks him in'},{k:'CCCTT',nm:'BUSTER SLAM!',tip:'snatch him, lift him and SLAM him into the floor'},
  {k:'CCCMM',nm:'SHOCK SPLITTER!',tip:'rev the sword, then split the ground in a line'},{k:'TTTB',nm:'GRAB & STREAK!',tip:'gauntlet grabs into a rocket-sword dash'},
  {k:'CCCCCM',nm:'EXCEED BURST!',tip:'5 powered strikes, then rev to MAX'},{k:'CCCCCTTM',nm:'EARTHSHATTER MAX',ult:1,tip:'ULTIMATE: rev ×3, leap high and shatter the whole earth'}],
 [{k:'CCCM',nm:'MILLION STAB!',tip:'a blur of a thousand stabs'},{k:'CCCMM',nm:'STINGER!',tip:'stabs, then a rocket-dash thrust'},
  {k:'TTTC',nm:'HIGH TIME!',tip:'helicopter sword, then launch him sky-high'},{k:'CCCTT',nm:'HELICOPTER STORM!',tip:'spin the sword like a helicopter, twice'},
  {k:'CCCBB',nm:'TRICK X!',tip:'teleport above him twice and chop down'},{k:'CCCMMTB',nm:'CRIMSON STORM',ult:1,tip:'ULTIMATE: crimson aura, a storm of afterimage slashes, a giant X'}],
 [{k:'CCCM',nm:'CRESCENT WAVE!',tip:'reap, then throw a crescent moon'},{k:'TTTMM',nm:'TWIN CRESCENTS!',tip:'scythe wheels into two moon waves'},
  {k:'CCCBB',nm:'ECLIPSE STEP!',tip:'phase behind him twice with moon slashes'},{k:'CCCTT',nm:'MOON WHEEL!',tip:'the scythe spins like a wheel'},
  {k:'TTTCC',nm:'HARVEST HOOK!',tip:'hook him in and reap upward'},{k:'TTTMCMB',nm:'ECLIPSE HARVEST',ult:1,tip:'ULTIMATE: the moon rises, crescents everywhere, one giant reap'}],
 [{k:'CCCM',nm:'AFTERIMAGE!',tip:'shadow clones jump out and slash with you'},{k:'CCCB',nm:'BAT POOF!',tip:'burst into cute bats, reappear behind him'},
  {k:'CCCTT',nm:'SHURIKEN STORM!',tip:'stars, then a star burst in every direction'},{k:'TTTBB',nm:'BAT SWARM!',tip:'shurikens, then two bat poofs'},
  {k:'CCCCCMM',nm:'SHADOW LEGION!',tip:'5 timed strikes, then a whole team of shadow clones'},{k:'CCCBMBM',nm:'THOUSAND SHADOWS',ult:1,tip:'ULTIMATE: split into clones, a whirlwind of shadow slashes, a giant X'}]);
const LKT=[null,{C:'shots',T:'spinshot',M:'iron',B:'roll'},{C:'slash',T:'force',M:'orb',B:'tele'},{C:'slash',T:'snatch',M:'exceed',B:'tele'},{C:'slash',T:'heli',M:'stab',B:'trick'},{C:'slash',T:'heli',M:'moon',B:'tele'},{C:'slash',T:'stars',M:'clones',B:'bats'}];
function ulkHit(kb,dir,range){const g=p.lk&&p.lk.tg&&p.lk.tg.alive?p.lk.tg:null;if(!g)return false;if(Math.abs(g.x-p.x)>(range||300)||Math.abs(g.y-p.y)>380)return false;
 g.hp=Math.max(2,g.hp);NAMES[kb]=p.lk.nm||'LINK!';hitDummy(g,kb,dir||p.face);if(KB[kb])g.vy=Math.max(g.vy,KB[kb][1]);if(g.y<GROUND-420)g.vy=Math.max(g.vy,-200);return true}
function ufLkStart(L){const f=FORM(),fl=LKF[f],rep=LK.n>0&&LK.seq.slice(-1)===L;
 LK.seq+=L;LK.n++;LK.buf=null;LK.beat=false;LK.on=true;lastTokT=-9;LK.lastSeq=LK.seq;LK.lastT=now;
 const route=ROUTES[f].find(r=>r.k===LK.seq);pracCheck(LK.seq);if(route&&route.ult){ultStart(f,route);return}
 const mv=fl[rep?L+L:L],tg=lkTarget();act('lk',uA(mv.a));p.lk={L,rep,route,tg,nm:mv.nm,ty:LKT[p.uf][L]};p.rot=0;p.vx=0;C.atk++;extend();
 if(!route)lkSay(mv.nm,L==='C'?fl.col2:fl.col);popNum(LK.seq.length,fl.col);beat(520+LK.n*70,.04);
 const ty=p.lk.ty;if(ty==='tele'){lkBlink(tg,f,false);if(p.uf===6)batPuff(p.x,p.y-80,10)}
 if(ty==='bats'){batPuff(p.x,p.y-80,14);lkBlink(tg,f,true);batPuff(p.x,p.y-80,10)}
 if(ty==='trick'){const fx0=p.x;puffShadow(p.x,p.y);if(tg){p.x=clampX(tg.x-p.face*40);p.y=Math.min(GROUND,tg.y-230)}else p.y-=200;p.ground=false;sLine(fx0,p.y+130,p.x,p.y-90,fl.col,.3,8);puffShadow(p.x,p.y)}
 if(route)routeFx(f,route)}
function ufLkState(dt){const q=p.lk;if(!q){p.state='normal';return}const t=p.t,f=FORM(),fl=LKF[f],X=UFm(),tg=q.tg&&q.tg.alive?q.tg:null,at=T=>t>=T&&t-dt<T;
 p.hang=Math.max(p.hang,.1);if(!p.ground&&q.ty!=='trick')p.vy=Math.min(p.vy,160);
 const ranged=['shots','spinshot','iron','orb','moon','stars'].includes(q.ty);
 if(tg&&!['tele','bats','trick','roll'].includes(q.ty)&&t<.12&&!ranged){const want=tg.x-p.face*(q.L==='M'?150:q.L==='T'?80:100);if(Math.abs(tg.x-p.x)>30)p.face=tg.x>p.x?1:-1;p.x+=(want-p.x)*Math.min(1,dt*16);p.vx=0;
  if(tg.y<GROUND-70){const wy=Math.min(floorAt(p.x),tg.y+45);p.y+=(wy-p.y)*Math.min(1,dt*14);p.ground=false;p.vy=Math.min(p.vy,0)}if(Math.abs(want-p.x)>40&&t%.03<dt)uGhost(null,.2)}
 else{p.vx*=Math.pow(.02,dt);if(tg&&ranged&&Math.abs(tg.x-p.x)>20)p.face=tg.x>p.x?1:-1}
 const dir=tg?Math.sign(tg.x-p.x)||p.face:p.face,rep=q.rep,aim=()=>tg?{y:tg.y-150}:{y:p.y-92};
 switch(q.ty){
  case 'shots':for(const T of rep?[.03,.07,.11,.15,.19,.23]:[.04,.12,.2])if(at(T)){const a=rep?(Math.random()-.5)*.25:0;uShot({vx:p.face*1600*Math.cos(a),vy:1600*Math.sin(a)+(tg?(tg.y-150-(p.y-92))*2:0),kb:'ushot',fx:1});muzzle(p.x+p.face*100,p.y-92,1);bang(.06);ulkHit(rep?'lkC2':'lkC',dir,700)}break;
  case 'spinshot':for(const T of [.05,.15,rep?.25:9])if(at(T)){for(const s of [1,-1])uShot({x:p.x+s*90,vx:s*1500,face:s,fx:1});muzzle(p.x+90,p.y-92,1);muzzle(p.x-90,p.y-92,1);bang();ulkHit(rep?'lkT2':'lkT',dir,600)}break;
  case 'iron':if(at(.06)){if(!rep){uShot({s:2.3,fx:1,vx:p.face*1800});muzzle(p.x+p.face*130,p.y-100,2.2);bang(.13);p.vx=-p.face*300;shake=12;ulkHit('lkM',dir,800)}
   else{U.beams.push({x:p.x+p.face*120,y:p.y-105,face:p.face,l:.8,w:100,col:X.col,col2:X.col2,hit:new Set(),kb:'lkM2',keep:1});boom();shake=26;flashT=.2;p.vx=-p.face*480}}break;
  case 'roll':if(t<.2){const x1=tg?clampX(tg.x+p.face*120):clampX(p.x+p.face*300);p.x+=(x1-p.x)*Math.min(1,dt*14);if(t%.03<dt)uGhost('blink',.22)}if(at(.22)){if(tg)p.face=tg.x>p.x?1:-1;uShot({s:1.4,fx:1});muzzle(p.x+p.face*100,p.y-92,1.3);bang();ulkHit(rep?'lkB2':'lkB',p.face,500)}
   if(rep&&at(.34)){uShot({s:1.4,fx:1});bang();ulkHit('lkB2',p.face,500)}break;
  case 'slash':if(at(.04)){slash(rep?'rise':'cross',fl.col2,{lvl:6,scale:1.3,col2:fl.col,dx:85});spark(p.x+p.face*80,p.y-70,14,[fl.col,fl.col2,'#fff'],320);if(p.uf===6)for(let k=1;k<=3;k++)uGhost(fl[rep?'CC':'C'].a,.1+k*.04,p.x-p.face*k*30)}
   if(at(.08))ulkHit(rep?'lkC2':'lkC',dir);if(rep&&at(.1)&&p.uf!==5){p.vy=-450;p.ground=false}if(rep&&p.uf===5&&at(.1)&&tg)U.pull={d:tg,t:.2,x:p.x+p.face*110};
   if(rep&&p.uf===4&&at(.06))U.proj.push({k:'saber',x:p.x+p.face*90,y:p.y-100,vx:p.face*1000,vy:0,l:1,s:1.3,face:p.face,hit:new Set(),ret:1,kb:'lkC2',col:X.col,tick:0,keep:1});
   if(rep&&at(.17)){slash('up',fl.col,{lvl:7,scale:1.3,dx:70});ulkHit('lkC2',dir)}if(p.uf===6&&at(.14))ulkHit('lkC',dir);break;
  case 'force':if(at(.08)){if(!rep){uRing(p.x+p.face*80,p.y-80,X.col,X.col2,0);sLine(p.x+p.face*60,p.y-90,p.x+p.face*320,p.y-90,X.col,.3,16);ulkHit('lkM',p.face,500)}
   else if(tg){U.pull={d:tg,t:.25,x:p.x+p.face*110};sLine(p.x+p.face*40,p.y-90,tg.x,tg.y-150,X.col,.3,10)}shake=Math.max(shake,8)}if(rep&&at(.3))ulkHit('lkT2',p.face,320);break;
  case 'orb':if(at(.08)){if(!rep){U.proj.push({k:'orb',x:p.x+p.face*90,y:p.y-110,vx:p.face*900,vy:0,l:.7,s:1,face:p.face,hit:new Set(),kb:'lkM',col:X.col,fx:1});ulkHit('lkM',dir,800)}
   else U.proj.push({k:'saber',x:p.x+p.face*90,y:p.y-100,vx:p.face*1050,vy:0,l:1.2,s:1.3,face:p.face,hit:new Set(),ret:1,kb:'lkM2',col:X.col,tick:0,keep:1})}break;
  case 'tele':if(at(.06)){slash('cross',fl.col,{lvl:7,scale:1.35,col2:fl.col2,dx:60});ulkHit(rep?'lkB2':'lkB',dir);if(p.uf===5)crescent({vx:0,s:1.3,l:.3,fx:1})}
   if(rep&&at(.15)){lkBlink(tg,f,true);slash('cross',fl.col2,{lvl:7,scale:1.4,col2:'#fff',dx:60})}if(rep&&at(.19))ulkHit('lkB2',tg?Math.sign(tg.x-p.x)||p.face:p.face);break;
  case 'bats':if(at(.06)){slash('cross',fl.col,{lvl:7,scale:1.35,col2:fl.col2,dx:60});ulkHit(rep?'lkB2':'lkB',dir)}
   if(rep&&at(.12))for(let i=0;i<8;i++)U.proj.push({k:'bat',x:p.x,y:p.y-100+(Math.random()-.5)*60,vx:dir*(600+Math.random()*400),vy:(Math.random()-.5)*300,l:.9,s:1,face:dir,hit:new Set(),kb:'ubat',col:'#2a1f3d',ph:Math.random()*6,fx:1});if(rep&&at(.2))ulkHit('lkB2',dir,500);break;
  case 'snatch':if(at(.05)){U.arm={l:.3,x1:tg?tg.x:p.x+p.face*420,y1:tg?tg.y-150:p.y-90};if(tg&&Math.abs(tg.x-p.x)<650){U.pull={d:tg,t:.18,x:p.x+p.face*120}}}
   if(at(.2))ulkHit(rep?'lkT2':'lkT',p.face,330);if(rep&&at(.2)&&tg)U.slamQ={d:tg,t:.3};break;
  case 'exceed':if(at(.06)){if(!rep){p.pbEx=Math.min(3,(p.pbEx||0)+1);p.pbExT=6;uRing(p.x,p.y-90,X.col,X.col2,1);for(let i=0;i<20;i++)sparks.push({x:p.x+(Math.random()-.5)*120,y:p.y-100+(Math.random()-.5)*90,vx:(Math.random()-.5)*400,vy:-200-Math.random()*300,l:.5,c:i%2?X.col:'#fff'});ulkHit('lkM',p.face,300)}
   else{U.proj.push({k:'quake',x:p.x+p.face*80,y:GROUND,vx:p.face*1000,vy:0,l:.7,s:1.4,face:p.face,hit:new Set(),kb:'lkM2',col:X.col,keep:1});R9.cracks.push(mkCrack(p.x+p.face*60,7));boom()}shake=Math.max(shake,12)}break;
  case 'heli':for(const T of [.05,.13,.21,rep?.29:9])if(at(T)){ulkHit(rep?'lkT2':'lkT',dir);spark(p.x+Math.cos(t*30)*90,p.y-(p.uf===4?170:60),8,[fl.col,fl.col2,'#fff'],260)}if(rep&&at(.06)){p.vy=-480;p.ground=false}break;
  case 'stab':if(!rep){if(t>.03&&t<.3&&t%.04<dt){ulkHit('ustab',dir);sLine(p.x+p.face*40,p.y-90+(Math.random()-.5)*60,p.x+p.face*(210+Math.random()*80),p.y-90+(Math.random()-.5)*80,Math.random()<.5?'#fff':X.col,.15,6);setAnim(uA(Math.random()<.5?'meow2':'stinger'),true)}if(at(.32))ulkHit('lkM',dir)}
   else{if(t<.22){p.vx=p.face*1300;if(t%.025<dt)uGhost('stinger',.25)}else p.vx*=Math.pow(.01,dt);if(at(.16))ulkHit('lkM2',p.face,260)}break;
  case 'trick':if(t<.1)p.vy=-40;else{p.vy=1500;if(t%.03<dt)uGhost(null,.2)}if(p.ground&&!q.landed){q.landed=1;ulkHit(rep?'lkB2':'lkB',dir,260);slash('down',fl.col,{lvl:7,scale:1.5,dx:60,col2:fl.col2});R9.cracks.push(mkCrack(p.x,f));shake=14;boom()}break;
  case 'moon':if(at(.08)){const n=rep?2:1;for(let i=0;i<n;i++)crescent({vx:p.face*1000,vy:rep?(i?-160:160):0,s:1.3,kb:'lkM',fx:1});ulkHit(rep?'lkM2':'lkM',dir,800)}break;
  case 'stars':if(at(.06)||at(.14)){const n=rep?12:3;for(let k=0;k<n;k++){const a=rep?k/n*6.283:(k-1)*.12;stars.push({x:p.x+p.face*60,y:p.y-85,vx:(rep?Math.cos(a):p.face*Math.cos(a))*950,vy:950*Math.sin(a),r:0,l:.6,hit:new Set([...dummies])})}ulkHit(rep?'lkT2':'lkT',dir,650)}break;
  case 'clones':if(at(.04)){U.clone=Math.max(U.clone||0,rep?6:4);for(const s of rep?[-1,1,-2,2]:[-1,1]){ghosts.push({x:(tg?tg.x:p.x+p.face*100)+s*95,y:p.y,f:uFr('h7'),face:s>0?-1:1,l:.45,blue:1});batPuff((tg?tg.x:p.x)+s*95,p.y-80,3)}}
   if(at(.1)||at(.2)||(rep&&at(.3)))ulkHit(rep?'lkM2':'lkM',dir,400);break}
 if(!LK.beat&&t>=LKW){LK.beat=true;if(!LK.dead)beat(880+LK.n*60,.035)}
 if(LK.buf&&t>=LKW){const b=LK.buf;lkStart(b);return}
 if(t>LKD)lkEnd()}
function ufRouteFx(f,r){const fl=LKF[f],X=UFm();texts.length=0;card(r.nm,r.k.split('').join(' '),fl.col);
 slowT=Math.max(slowT,.22);flashT=Math.max(flashT,.12);hitstop=Math.max(hitstop,.07);shake=Math.max(shake,14);
 const tg=lkTarget(),x=tg?tg.x:p.x+p.face*100,y=tg?tg.y-80:p.y-80;for(let i=0;i<3;i++)R9.rings.push({x,y,r:10+i*24,vr:700,l:1,col:i%2?fl.col2:fl.col,w:9,f,face:0});
 if(p.uf===1)for(let i=0;i<10;i++){const a=i/10*6.283;uShot({x,y,vx:Math.cos(a)*1200,vy:Math.sin(a)*1200,face:1,fx:1})}
 if(p.uf===2)U.pillars.push({x,l:.8,col:X.col,w:80});if(p.uf===3){R9.cracks.push(mkCrack(x,f));boom()}if(p.uf===4)slash('cross',X.col,{lvl:8,scale:2,dx:0,col2:X.col2});if(p.uf===5)U.moonT=Math.max(U.moonT,.8);if(p.uf===6)batPuff(x,y,16);
 if(tg&&p.lk){tg.hp=Math.max(2,tg.hp);NAMES.lkR=r.nm;hitDummy(tg,'lkR',Math.sign(tg.x-p.x)||p.face);tg.vy=Math.max(tg.vy,tg.y<GROUND-300?-250:-650)}}
// ---- ULTIMATES ----
function ufUltStart(f,r){const u=f-4,X=UF[u],tg=lkTarget();act('lkult',uA('ultA'));p.ult={f,r,tg,boom:false,hits:0,k:0,x0:p.x,u};p.vx=0;p.vy=0;p.rot=0;
 NAMES.lkU=['','BANG!','SLASH!','REV!','SLASH!','REAP!','SHADOW!'][u];NAMES.lkUfin='KA-BOOM!!';
 LK.on=false;LK.seq='';LK.n=0;LK.buf=null;cineGo(1.32,.5);slowT=.12;flashT=.15;shake=10;beat(1320,.06);
 lkSay(['','DEADEYE…','THE LIGHT…','REV IT UP…','JACKPOT…','THE MOON RISES…','…'][u],X.col2);if(u===5)R9.moon={l:0,on:1};
 for(let i=0;i<4;i++)waves.push({x:p.x,y:p.y-30*i,r:10+i*20,l:1,big:true})}
function ufUltState(dt){const u=p.ult,t=p.t,X=UF[u.u],g=u.tg&&u.tg.alive?u.tg:null,at=T=>t>=T&&t-dt<T,e=x=>x*x*(3-2*x);p.rot=0;p.vx=0;p.vy=0;
 const gx=g?g.x:clampX(p.x+p.face*170),K5=u.u;
 if(g&&!u.boom){g.vx=0;g.vy=0;g.fl=.6;g.hp=Math.max(3,g.hp);const gy=t<1?GROUND-150-Math.min(1,t)*90:GROUND-120;g.y+=(gy-g.y)*Math.min(1,dt*(t<1?5:10));g.x+=(gx-g.x)*.1}
 if(t<.65){p.y+=(GROUND-p.y)*Math.min(1,dt*9);p.ground=p.y>GROUND-2;if(at(.32))setAnim(uA('ultB'),true);
  if(t%.03<dt){const a=Math.random()*6.283,R=150;sparks.push({x:p.x+Math.cos(a)*R,y:p.y-80+Math.sin(a)*R,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.45,c:Math.random()<.5?X.col:X.col2})}
  if(K5===6&&at(.35))for(const s of [-1,1]){ghosts.push({x:p.x+s*90,y:p.y,f:uFr('ultB'),face:p.face,l:1.4,blue:1});batPuff(p.x+s*90,p.y-80,6)}
  if(K5===2&&at(.35))U.pillars.push({x:p.x,l:.5,col:X.col2,w:110});if(K5===4&&t%.04<dt)for(let i=0;i<3;i++)sparks.push({x:p.x+(Math.random()-.5)*120,y:GROUND-10,vx:0,vy:-300-Math.random()*400,l:.5,c:i%2?'#ff8a3a':X.col})}
 else if(t<1.5){u.k-=dt;if(g&&u.k<=0){u.k=.085;u.hits++;C.atk++;hitDummy(g,'lkU',p.face);g.vx=0;g.vy=0;const fx0=p.x,fy0=p.y;
   if(K5===1){setAnim(uA(u.hits%2?'ultB':'ultC'),true);uShot({vx:(gx>p.x?1:-1)*1600,vy:((g.y-150)-(p.y-92))*3,fx:1,s:u.hits%3?1:1.8});muzzle(p.x+p.face*100,p.y-92,1);bang(.05)}
   else if(K5===3){setAnim(uA(['h1','h3','h5','h6'][u.hits%4]),true);p.x+=((gx-p.face*110)-p.x)*.5;slash(['flat','rise','spin','cross'][u.hits%4],u.hits%2?X.col:X.col2,{lvl:7,scale:1.4,dx:90});if(p.pbEx<3&&u.hits%3===0)p.pbEx=(p.pbEx||0)+1}
   else{const a=u.hits*2.3;p.x=clampX(gx+Math.cos(a)*125);p.y=Math.min(GROUND,GROUND-60+Math.sin(a)*70);p.face=gx>p.x?1:-1;setAnim(uA(['h1','h3','h5','h7'][u.hits%4]),true);
    sLine(fx0,fy0-80,p.x,p.y-80,u.hits%2?X.col:X.col2,.35,K5===4?10:8);if(K5===5&&u.hits%2)crescent({x:gx,y:g.y-150,vx:0,s:1.2,l:.3,fx:1});if(K5===6){batPuff(p.x,p.y-80,3);ghosts.push({x:gx-(p.x-gx),y:p.y,f:uFr('h7'),face:-p.face,l:.3,blue:1})}if(K5===4)for(let k=1;k<=3;k++)ghosts.push({x:fx0+(p.x-fx0)*k/4,y:fy0+(p.y-fy0)*k/4,f:uFr('h3'),face:p.face,l:.12+k*.05,blue:1})}}}
 else if(t<1.85){p.face=gx>=p.x?1:-1;
  if(K5===1){p.y=GROUND;setAnim(uA('ultE'));if(at(1.5)){say('…CANNON!!','#fff',true);cine.tz=1.6;cine.tdim=.6}if(t%.03<dt){const a=Math.random()*6.283;sparks.push({x:p.x+p.face*150+Math.cos(a)*120,y:p.y-110+Math.sin(a)*120,vx:-Math.cos(a)*400,vy:-Math.sin(a)*400,l:.3,c:X.col2})}}
  else if(K5===4||K5===6){p.x+=((gx-p.face*150)-p.x)*Math.min(1,dt*8);p.y+=(GROUND-p.y)*Math.min(1,dt*14);setAnim(uA(K5===4?'ultC':'ultC'));if(at(1.5)){cine.tz=1.6;cine.tdim=.6}}
  else{const up=t<1.72,u3=up?e((t-1.5)/.22):e((t-1.72)/.13);setAnim(uA(up?'ultC':'ultD'));p.x+=((gx-p.face*90)-p.x)*Math.min(1,dt*8);p.y=up?GROUND-330*u3:Math.min(GROUND,GROUND-330+330*u3);p.ground=false;
   if(t%.03<dt)uGhost(up?'ultC':'ultD',.25);if(at(1.5)){cine.tz=1.6;cine.tdim=.6;if(K5===2)U.pillars.push({x:p.x,l:.6,col:X.col,w:90,d:0})}}}
 else{p.y=GROUND;p.ground=true;
  if(!u.boom){u.boom=true;setAnim(uA(K5===1?'ultE':K5===3?'ultE':'ultE'),true);const x=gx;uBoom(x,X.col,X.col2,u.f);
   if(g){g.hp=Math.min(g.hp,1);hitDummy(g,'lkUfin',p.face);g.vy=-2500;g.vx=p.face*260;g.fl=1}
   if(K5===1)U.beams.push({x:p.x+p.face*140,y:p.y-110,face:p.face,l:1.4,w:220,col:X.col,col2:X.col2,hit:new Set(),kb:'ufhit',fx:1});
   if(K5===2){U.pillars.push({x,l:1.6,col:X.col,w:220});R9.beam={x,l:1.3,col:X.col}}
   if(K5===3){U.props.push({k:'pb_ult',i:4,x:p.x+p.face*60,l:1.8});for(let i=1;i<=6;i++)U.pillars.push({x:x+(i%2?1:-1)*Math.ceil(i/2)*110,l:.7+i*.1,col:X.col,w:60,d:i*.07});p.pbEx=0}
   if(K5===4){slash('cross',X.col,{lvl:8,scale:4,dx:0,col2:X.col2});for(let i=0;i<5;i++)U.pillars.push({x:x+(i-2)*120,l:.9,col:i%2?'#ff8a3a':X.col,w:50,d:Math.abs(i-2)*.08})}
   if(K5===5){if(R9.moon)R9.moon.flash=1;for(let i=0;i<10;i++){const a=i/10*6.283;crescent({x,y:GROUND-120,vx:Math.cos(a)*900,vy:Math.sin(a)*900,s:1.8,l:.8,fx:1})}}
   if(K5===6){slash('cross',X.col,{lvl:8,scale:3.6,dx:0,col2:X.col2});batPuff(x,GROUND-150,40)}
   card(u.r.nm+'!!','ULTIMATE · '+u.r.k.split('').join(' '),X.col)}
  if(t>2.3&&p.anim!==uA('ultF'))setAnim(uA('ultF'));if(t>3){p.state='normal';p.ult=null;if(R9.moon)R9.moon.on=0;LK.lastT=now}}}
// ---- UNLOCKS (saved on this device) ----
const UNLK=[null,{k:'ko',n:1,txt:'Knock out Big Bruno once'},{k:'exp',n:300,txt:'Earn 300 EXP (1 EXP per hit, +25 per K.O.)'},{k:'ult',n:1,txt:'Land any ULTIMATE (combo list ⚡ rows)'},
 {k:'ko',n:3,txt:'Knock out Big Bruno 3 times'},{k:'tkd',n:3,txt:'Do 3 stealth takedowns in Hunt mode'},{k:'exp',n:1500,txt:'Earn 1500 EXP'}];
const UNL={d:null,saveT:0,
 load(){try{this.d=JSON.parse(localStorage.getItem('paddyLegends')||'{}')||{}}catch(e){this.d={}}const d=this.d;['exp','ko','ult','tkd'].forEach(k=>d[k]=d[k]||0);d.got=d.got||[];
  if(/[?&]legends/.test(location.search))d.tryAll=true},
 save(){try{localStorage.setItem('paddyLegends',JSON.stringify(this.d))}catch(e){}},
 has(u){return this.d.got.includes(u)},ok(u){return this.has(u)||!!this.d.tryAll},
 prog(u){const c=UNLK[u];return Math.min(1,this.d[c.k]/c.n)},
 bump(k,n){this.d[k]+=n||1;if(k==='ko')this.d.exp+=25;this.check();if(!(this.saveT>0))this.saveT=1},
 check(){for(let u=1;u<=6;u++)if(!this.has(u)&&this.d[UNLK[u].k]>=UNLK[u].n){this.d.got.push(u);this.save();const X=UF[u];
  let _tr=0;const _show=()=>{if(_tr++<16&&((Array.isArray(CINE)?CINE.includes(p.state):CINE.has(p.state))||p.state==='lkult'||(p.ult&&p.state==='lkult'))){setTimeout(_show,500);return}card('LEGEND UNLOCKED!',X.ico+' '+X.nm+' · press the 🔄 form button or open ? → LEGENDS',X.col);for(let i=0;i<40;i++){const a=Math.random()*6.283,v=200+Math.random()*400;R9.confetti.push({x:VW/2,y:-camY+150,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:2,c:[X.col,X.col2,'#fff'][i%3],heart:0})}beat(1568,.06);setTimeout(()=>beat(2093,.06),120)};setTimeout(_show,400);
  if(typeof buildList==='function')buildList()}}};
UNL.load();
const _addHit13=addHit;addHit=function(m){_addHit13(m);UNL.d.exp++;if(UNL.d.exp%50===0)UNL.check();if(!(UNL.saveT>0))UNL.saveT=1};
const _startKO13=startKO;startKO=function(d){_startKO13(d);UNL.bump('ko')};
const _ultStart13=ultStart;ultStart=function(f,r){UNL.bump('ult');if(f>=5)return ufUltStart(f,r);return _ultStart13(f,r)};
const _ultState13=ultState;ultState=function(dt){if(p.ult&&p.ult.f>=5)return ufUltState(dt);return _ultState13(dt)};
const _tkd13=tkd;tkd=function(kind,d){UNL.bump('tkd');return _tkd13(kind,d)};
const _lkStart13=lkStart;lkStart=function(L){if(p.uf)return ufLkStart(L);return _lkStart13(L)};
const _lkState13=lkState;lkState=function(dt){if(p.uf)return ufLkState(dt);return _lkState13(dt)};
const _routeFx13=routeFx;routeFx=function(f,r){if(f>=5)return ufRouteFx(f,r);return _routeFx13(f,r)};
const _opener13=openerNow;openerNow=function(){if(p.uf){const S=p.state,X=UFm();if(/^u[1-7]$/.test(S)&&p.ucombo>=3&&!p.miss&&p.uhit)return{run:'C'.repeat(p.ucombo),W:X.W,E:X.E}}return _opener13()};
const _liveSeq13=liveSeq;liveSeq=function(){if(!LK.on&&p.uf&&/^u[1-7]$/.test(p.state))return 'C'.repeat(p.ucombo);return _liveSeq13()};
const _cue13=cueInfo;cueInfo=function(){if(p.uf&&/^u[3-7]$/.test(p.state)&&p.ucombo>=3&&!p.miss&&p.state!=='lk')return{H:UFm().H};return _cue13()};
// ---- switching into / out of a legend form ----
// a form is ready only when ALL its frames are in, so the first combo after a switch never shows stand-in frames
function formFramesIn(q){const ks=Object.keys(FR).filter(a=>a.startsWith(q+'_'));return ks.length>0&&ks.every(a=>FR[a].every(fr=>imgOK(IMG[fr.f])))}
function ufReady(u){return formFramesIn(UPRE[u])}
function ufSet(u,force){const X=UF[u];if(!X)return;if(!force&&!UNL.ok(u)){say('🔒 '+X.nm+': '+UNLK[u].txt,'#ffe08a',true);return}
 if(['eclipse','finishhim','sfinal','knfinal','pifinal','respawn','bunny','ledge','lkult','ufin'].includes(p.state))return;
 if(!ufReady(u)&&typeof loadForm==='function')loadForm(X.pre,true); // forced switches (practice, try-all) still fetch the costume
 if(force!==true&&!ufReady(u)){if(!p.morphWait||p.morphWait.f!==4+u){p.morphWait={f:4+u,t:now};say('SUMMONING '+X.nm+'…',X.col)}return}
 p.morphWait=null;formReset();const from=(FR[p.anim]||FR.idle)[p.fi];p.uf=u;p.xf=0;p.ninja=false;p.sam=false;p.ucombo=0;p.uair=0;p.xcombo=0;p.combo=0;p.ncombo=0;p.scombo=0;p.rot=0;p.wall=false;p.hunt=false;huntBtn&&huntBtn.classList.remove('lit');p.pbEx=0;U.clone=0;
 act('nmorph',uA('victory'),{say:X.nm+'!',c:X.col});p.mfrom=from;p.blend=0;p.vx*=.3;waves.push({x:p.x,y:p.y,r:10,l:1,big:true});puffShadow(p.x,p.y);spark(p.x,p.y-70,30,[X.col,X.col2,'#fff'],420);shake=10;
 for(let i=0;i<3;i++)R9.rings.push({x:p.x,y:p.y-90,r:20+i*30,vr:900,l:1,col:i%2?X.col2:X.col,w:10,f:4+u,face:0});
 if(u===6)batPuff(p.x,p.y-80,20);if(u===5)U.moonT=1;if(u===2||u===3)U.pillars.push({x:p.x,l:.6,col:X.col,w:90});if(u===1){muzzle(p.x+60,p.y-90,1.4);bang()}
 card(X.ico+' '+X.nm,X.tier||'LEGEND FORM',X.col)}
const _setForm13=setForm;setForm=function(f,force){if(f>=5)return ufSet(f-4,force||(PR.on?'pr':false));
 if(p.uf){if(['respawn','bunny','ledge','lkult','ufin'].includes(p.state))return;const from=(FR[p.anim]||FR.idle)[p.fi];p.uf=0;U.clone=0;
  if(f===0){act('nmorph','idle',{say:'back to Paddy',c:'#ffe08a'});p.mfrom=from;p.blend=0;waves.push({x:p.x,y:p.y,r:10,l:1,big:true});puffShadow(p.x,p.y);spark(p.x,p.y-70,20,['#ffe08a','#fff'],320);return}}
 return _setForm13(f,force)};
const _cycle13=cycleForm;cycleForm=function(){if(p.morphWait&&p.morphWait.f<5)return _cycle13();const L=[0,1,2,3,4];for(let u=1;u<=6;u++)if(UNL.ok(u))L.push(4+u);
 const cur=p.morphWait?p.morphWait.f:FORM(),i=L.indexOf(cur),nx=L[(i+1)%L.length];if(nx===0&&FORM()!==0)setForm(0);else if(nx!==FORM())setForm(nx)};
Object.assign(map,{Digit7:'uf1',Digit8:'uf2',Digit9:'uf3',Digit0:'uf4',Minus:'uf5',Equal:'uf6'});INSTANT.push('uf1','uf2','uf3','uf4','uf5','uf6');
FCOL.push(...UF.slice(1).map(x=>x.col));FNAME.push(...UF.slice(1).map(x=>x.nm+' PADDY'));
for(const k in TKA)TKA[k].push(...UPRE.slice(1).map(q=>q+'_'+({leap:'rise',bonk:'dive',drop:'dive',trip:'tail'}[k]||'rise')));
// ---- per-frame upkeep (runs before the link router) ----
function r13Pre(dt){
 if(UNL.saveT>0){UNL.saveT-=dt;if(UNL.saveT<=0)UNL.save()}
 for(let u=1;u<=6;u++)if(P['uf'+u])setForm(4+u);
 p.ucT=(p.ucT||0)-dt;if(p.ucT<=0&&!UST.has(p.state))p.ucombo=0;p.utT=(p.utT||0)-dt;if(p.utT<=0)p.utn=0;
 if(p.pbEx>0){p.pbExT-=dt;if(p.pbExT<=0)p.pbEx=0}if(U.clone>0)U.clone-=dt;
 if(U.pull){const q=U.pull,d=q.d;q.t-=dt;if(d&&d.alive){d.x+=(q.x-d.x)*Math.min(1,dt*16);d.vx=0;if(d.y<GROUND-2)d.vy=Math.min(d.vy,0);if(Math.random()<dt*40)sparks.push({x:d.x,y:d.y-150,vx:(p.x-d.x)*.5,vy:0,l:.25,c:UFm()?UFm().col:'#fff'})}if(q.t<=0)U.pull=null}
 if(U.slamQ){const q=U.slamQ,d=q.d;q.t-=dt;if(q.t<=0&&!q.down&&d&&d.alive){q.down=1;d.vy=1900;d.fl=0;flashT=Math.max(flashT,.08)}if(q.down&&d&&d.y>=GROUND-4){U.slamQ=null;R9.cracks.push(mkCrack(d.x,7));boom();shake=Math.max(shake,20);waves.push({x:d.x,y:GROUND,r:10,l:1,big:true});
   for(let k=0;k<20;k++)sparks.push({x:d.x+(Math.random()-.5)*120,y:GROUND,vx:(Math.random()-.5)*600,vy:-200-Math.random()*500,l:.7,c:k%2?'#7a6a5a':'#3cc8ff'});say('BUSTER SLAM!!','#c9f6ff',true)}if(q.t<-1.5)U.slamQ=null}
 if(U.arm){U.arm.l-=dt;if(U.arm.l<=0)U.arm=null}
 for(const e of U.echo){e.t-=dt;if(e.t<=0&&!e.done){e.done=1;const g=uNear(340);const x=p.x+e.side*70;ghosts.push({x,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.3,blue:1});batPuff(x,p.y-80,2);if(g){C.atk++;hitDummy(g,'uclone',Math.sign(g.x-x)||p.face)}}}U.echo=U.echo.filter(e=>!e.done);
 if(p.uf===6&&(Math.abs(p.vx)>260||U.clone>0)&&now%.05<dt){ghosts.push({x:p.x-p.face*30,y:p.y,f:(FR[p.anim]||FR.idle)[p.fi],face:p.face,l:.22,blue:1});if(U.clone>0)for(const s of [-1,1])ghosts.push({x:p.x+s*62,y:p.y-4,f:(FR[p.anim]||FR.idle)[Math.max(0,p.fi-1)],face:p.face,l:.12,blue:1})}
 if(p.uf===3&&p.pbEx>0&&Math.random()<dt*14*p.pbEx)sparks.push({x:p.x+p.face*(40+Math.random()*90),y:p.y-140-Math.random()*60,vx:(Math.random()-.5)*120,vy:-60-Math.random()*120,l:.35,c:Math.random()<.5?'#3cc8ff':'#fff'});
 if(U.moonT>0){U.moonT-=dt;if(!R9.moon){R9.moon={l:0,on:1};U.myMoon=1}else R9.moon.on=1}else if(U.myMoon&&R9.moon&&p.state!=='lkult'){R9.moon.on=0;U.myMoon=0}
 for(const o of U.proj){o.x+=o.vx*dt;o.y+=o.vy*dt;o.l-=dt;o.age=(o.age||0)+dt;
  if(o.k==='saber'){if(o.ret&&o.age>.42){const dx=p.x-o.x,dy=(p.y-100)-o.y,dd=Math.hypot(dx,dy)||1;o.vx+=(dx/dd*2600-o.vx)*Math.min(1,dt*5);o.vy+=(dy/dd*2600-o.vy)*Math.min(1,dt*5);if(dd<70){o.l=0;spark(p.x,p.y-100,8,[o.col,'#fff'],200)}}o.tick-=dt;if(o.tick<=0){o.tick=.12;o.hit.clear()}if(Math.random()<.6)sparks.push({x:o.x,y:o.y,vx:0,vy:0,l:.2,c:o.col})}
  if(o.k==='bat'){o.ph+=dt*18;o.vy+=Math.sin(o.ph)*300*dt}
  if(o.k==='quake'){o.y=GROUND;if(Math.random()<.7)sparks.push({x:o.x,y:GROUND,vx:(Math.random()-.5)*200,vy:-200-Math.random()*400,l:.5,c:Math.random()<.5?'#7a6a5a':o.col})}
  if(o.k==='shell'){o.vy+=300*dt;if(Math.random()<.8)sparks.push({x:o.x-o.vx*.02,y:o.y,vx:-o.vx*.1,vy:(Math.random()-.5)*80,l:.3,c:Math.random()<.5?'#ffb340':'#fff'})}
  if(o.k==='bullet'&&o.s>1.3&&Math.random()<.5)sparks.push({x:o.x,y:o.y,vx:-o.vx*.05,vy:(Math.random()-.5)*60,l:.2,c:o.col});
  if(!o.fx)for(const d of dummies){if(!d.alive||o.hit.has(d))continue;const r=(o.k==='quake'?70:o.k==='moon'?70:o.k==='shell'?60:40)*o.s;
   if(Math.abs(d.x-o.x)<r+40&&o.y>d.y-d.h*.8-r&&o.y<d.y+20+r){o.hit.add(d);C.atk++;if(o.keep)d.hp=Math.max(2,d.hp);hitDummy(d,o.kb,Math.sign(o.vx)||o.face);
    if(o.k==='bullet'||o.k==='orb'){o.l=0;spark(o.x,o.y,10,[o.col,'#fff'],260)}if(o.k==='shell'){o.l=0}}}
  if(o.k!=='saber'&&o.k!=='quake'&&((o.x>WALL_X-30&&o.vx>0&&o.y>WT)||(o.x<LW+30&&o.vx<0&&o.y>WT)||o.x<-200||o.x>VW+200))o.l=0;
  if(o.k==='shell'&&o.l<=0&&!o.ex){o.ex=1;burst(o.x,o.y,1);areaHit(o.x,o.y,190,'ubig');waves.push({x:o.x,y:o.y,r:10,l:1,big:true});shake=Math.max(shake,14);boom()}}
 U.proj=U.proj.filter(o=>o.l>0);if(U.proj.length>160)U.proj.splice(0,U.proj.length-160);
 for(const b of U.beams){b.l-=dt;b.tk=(b.tk||0)-dt;if(!b.fx&&b.tk<=0){b.tk=.16;b.hit.clear();b.n=(b.n||0)+1}
  if(!b.fx&&b.n<=4)for(const d of dummies){if(!d.alive||b.hit.has(d))continue;if((d.x-b.x)*b.face>-60&&Math.abs((d.y-150)-b.y)<b.w+120){b.hit.add(d);C.atk++;if(b.keep)d.hp=Math.max(2,d.hp);hitDummy(d,b.kb,b.face)}}
  if(Math.random()<.9)sparks.push({x:b.x+b.face*Math.random()*900,y:b.y+(Math.random()-.5)*b.w,vx:b.face*600,vy:(Math.random()-.5)*200,l:.3,c:Math.random()<.5?b.col2:'#fff'})}U.beams=U.beams.filter(b=>b.l>0);
 for(const b of U.bats){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy-=60*dt;b.vx*=Math.pow(.3,dt);b.ph+=dt*20;b.l-=dt}U.bats=U.bats.filter(b=>b.l>0);if(U.bats.length>200)U.bats.splice(0,U.bats.length-200);
 for(const c of U.pillars){if(c.d>0){c.d-=dt;continue}c.l-=dt;c.t=(c.t||0)+dt;if(!c.boomed){c.boomed=1;for(let i=0;i<10;i++)sparks.push({x:c.x+(Math.random()-.5)*c.w,y:GROUND,vx:(Math.random()-.5)*200,vy:-400-Math.random()*600,l:.6,c:i%2?'#7a6a5a':c.col});
   for(const d of dummies)if(d.alive&&Math.abs(d.x-c.x)<c.w*.6+40&&p.state!=='lkult'&&p.state!=='ufin'){d.hp=Math.max(1,d.hp);hitDummy(d,'uquake',Math.sign(d.x-p.x)||p.face)}}}U.pillars=U.pillars.filter(c=>c.l>0);
 for(const o of U.props)o.l-=dt;U.props=U.props.filter(o=>o.l>0);
 if(p.uf&&(p.anim||'').startsWith('n_'))setAnim(uA('idle'))}
const _r9Pre13=r9Pre;r9Pre=function(dt){r13Pre(dt);_r9Pre13(dt)};
// ---- drawing ----
function drawBat(x,y,s,ph,col,a){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=a;const w=Math.sin(ph)*.6;ctx.fillStyle=col||'#2a1f3d';
 ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-10,-14-w*10,-24,-6-w*14);ctx.quadraticCurveTo(-16,-2,-12,4);ctx.quadraticCurveTo(-6,0,0,6);ctx.quadraticCurveTo(6,0,12,4);ctx.quadraticCurveTo(16,-2,24,-6-w*14);ctx.quadraticCurveTo(10,-14-w*10,0,0);ctx.fill();
 ctx.beginPath();ctx.arc(0,0,6,0,6.283);ctx.fill();ctx.fillStyle='#c9a7ff';ctx.fillRect(-3,-2,2,2);ctx.fillRect(1,-2,2,2);ctx.restore()}
function r13Draw(){
 for(const c of U.pillars){if(c.d>0)continue;const a=Math.min(1,c.l*2),w=c.w*(1+(c.t||0)*.6);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(c.x-w/2,0,c.x+w/2,0);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,c.col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a*.85;ctx.fillStyle=g;ctx.fillRect(c.x-w/2,-camY-400,w,GROUND+camY+400);ctx.globalAlpha=a*.7;ctx.fillStyle='#fff';ctx.fillRect(c.x-w*.08,-camY-400,w*.16,GROUND+camY+400);ctx.restore()}
 for(const o of U.props){const fr=(FR[o.k+'_p']||F[o.k]||[])[o.i];if(fr&&imgOK(IMG[fr.f]))drawFrame(fr,o.x,GROUND+8,p.face,Math.min(1,o.l*2))}
 for(const b of U.beams){const a=Math.min(1,b.l*2.2),w=b.w*(.6+.4*a)*(1+Math.sin(now*60)*.06),L=1600;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(b.x,b.y);ctx.scale(b.face,1);
  const g=ctx.createLinearGradient(0,-w,0,w);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.3,b.col);g.addColorStop(.5,'#fff');g.addColorStop(.7,b.col);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(0,-w,L,w*2);ctx.fillStyle=b.col2;ctx.globalAlpha=a*.8;ctx.beginPath();ctx.arc(0,0,w*.9,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,w*.5,0,6.283);ctx.fill();ctx.restore()}
 if(U.arm&&p.uf===3){const a=U.arm,x0=p.x+p.face*60,y0=p.y-110,al=Math.min(1,a.l*4);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al;ctx.strokeStyle='#3cc8ff';ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(a.x1,a.y1);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle='#3cc8ff';ctx.beginPath();ctx.arc(a.x1,a.y1,34,0,6.283);ctx.fill();ctx.fillStyle='#c9f6ff';for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(a.x1+Math.cos(-1.2+k*.8)*34,a.y1+Math.sin(-1.2+k*.8)*34,9,15,-1.2+k*.8,0,6.283);ctx.fill()}ctx.restore()}
 for(const o of U.proj){const a=Math.min(1,o.l*4);ctx.save();ctx.translate(o.x,o.y);
  if(o.k==='bullet'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;const ang=Math.atan2(o.vy,o.vx);ctx.rotate(ang);ctx.strokeStyle=o.col;ctx.lineWidth=7*o.s;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-60*o.s,0);ctx.lineTo(0,0);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=3*o.s;ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,5*o.s,0,6.283);ctx.fill()}
  else if(o.k==='shell'){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,0,4,0,0,40*o.s/2+20);g.addColorStop(0,'#fff');g.addColorStop(.4,'#ffc04d');g.addColorStop(1,'rgba(255,74,58,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,40*o.s/2+20,0,6.283);ctx.fill()}
  else if(o.k==='orb'){ctx.globalCompositeOperation='lighter';const R=34*o.s,g=ctx.createRadialGradient(0,0,3,0,0,R);g.addColorStop(0,'#fff');g.addColorStop(.35,'#d9ffcf');g.addColorStop(1,'rgba(125,255,106,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R,0,6.283);ctx.fill()}
  else if(o.k==='saber'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.rotate(o.age*28*o.face);ctx.strokeStyle=o.col;ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-70*o.s,0);ctx.lineTo(70*o.s,0);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.stroke();ctx.globalAlpha=a*.3;ctx.strokeStyle=o.col;ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,70*o.s,0,6.283);ctx.stroke()}
  else if(o.k==='moon'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.scale(o.face||1,1);ctx.rotate(Math.atan2(o.vy,Math.abs(o.vx)||1));const R=70*o.s;ctx.fillStyle=o.col;ctx.beginPath();ctx.arc(0,0,R,-1.25,1.25);ctx.arc(-R*.45,0,R*.92,1.1,-1.1,true);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,R,-1.2,1.2);ctx.stroke()}
  else if(o.k==='quake'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.fillStyle=o.col;for(let k=0;k<3;k++){const h=(60+k*30)*o.s*(1+Math.sin(o.age*30+k)*.2);ctx.beginPath();ctx.moveTo(-30+k*25-12,0);ctx.lineTo(-30+k*25,-h);ctx.lineTo(-30+k*25+12,0);ctx.fill()}}
  else if(o.k==='bat'){ctx.restore();drawBat(o.x,o.y,1.1*o.s,o.ph,o.col,a);continue}
  ctx.restore()}
 for(const b of U.bats)drawBat(b.x,b.y,b.s,b.ph,b.col,Math.min(1,b.l*2))}
const _drawFx13=drawFx;drawFx=function(){_drawFx13();r13Draw()};
function r13HUD(){if(!p.uf)return;const X=UFm();ctx.save();ctx.font=`20px ${FONT}`;ctx.textAlign='right';ctx.fillStyle=X.col;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=4;const tx=X.ico+' '+X.nm+(p.uf===3&&p.pbEx?'  ⚡EXCEED '+p.pbEx:'')+(p.uf===6&&U.clone>0?'  👥 CLONES':'');ctx.strokeText(tx,VW-16,96);ctx.fillText(tx,VW-16,96);ctx.restore()}
const _drawCombo13=drawCombo;drawCombo=function(){_drawCombo13();r13HUD()};
// ---- the LEGENDS panel in the ? menu (+ tabs for each legend's combo list) ----
const UFTABS=UF.slice(1).map(x=>[x.ico+' '+({'LIGHT PADDY':'LIGHT','POWER BLADE':'POWER','CRIMSON BLADE':'CRIMSON','SHADOW REAPER':'REAPER'}[x.nm]||x.nm),x.col]);
(function(){const st=document.createElement('style');st.textContent=`#legends{background:#1e2440;border:2px solid #ffe14d;border-radius:12px;padding:8px 10px;margin:6px 0 10px}#legends h3{color:#ffe14d!important}
#legends .lg{display:flex;align-items:center;gap:8px;padding:5px 4px;border-bottom:1px solid #ffffff22}#legends .lg .ic{font-size:26px;width:34px;text-align:center}#legends .lg.lock{opacity:.6}#legends .lg .nm{font:20px Bangers,Impact,sans-serif;letter-spacing:1px}
#legends .bar{height:7px;background:#ffffff22;border-radius:4px;overflow:hidden;margin-top:3px}#legends .bar i{display:block;height:100%;background:#7fffd4}#legends .lg button{margin-left:auto;white-space:nowrap}#legends .stat{font-size:13px;color:#cfd8ff}
#clist .tabs{flex-wrap:wrap}#clist .tab{flex:1 1 18%!important}`;document.head.appendChild(st)})();
function legendsHTML(){const d=UNL.d;let h=`<div id="legends"><h3>🏆 LEGENDS · late-game forms</h3><div class="stat">EXP ${d.exp} · Big Bruno K.O.s ${d.ko} · Ultimates ${d.ult} · Stealth takedowns ${d.tkd}</div>`;
 for(let u=1;u<=6;u++){const X=UF[u],own=UNL.has(u),c=UNLK[u],pr=Math.round(UNL.prog(u)*100);
  h+=`<div class="lg${own?'':' lock'}"><span class="ic">${own?X.ico:'🔒'}</span><div><span class="nm" style="color:${X.col}">${X.nm}</span> ${own?'<b style="color:#7fffd4">UNLOCKED</b>':''}<br><span class="tip">${own?'Ultimate: '+ROUTES[4+u].find(r=>r.ult).k.split('').join(' '):'🔒 '+c.txt+' ('+Math.min(d[c.k],c.n)+'/'+c.n+')'}</span>${own?'':`<div class="bar"><i style="width:${pr}%"></i></div>`}</div>
  <button data-uf="${u}">${UNL.ok(u)?'▶ Play':'🔒'}</button></div>`}
 h+=`<p class="tip" style="margin:6px 0 0"><button id="tryall">${d.tryAll?'✅ Try-all ON (tap to turn off)':'🔓 Try them all now'}</button> lets you play every legend before unlocking it (practice). Keys: 7 8 9 0 - = pick a legend · M / 🔄 cycles through unlocked ones.</p></div>`;return h}
const _buildList13=buildList;buildList=function(){_buildList13();const el=document.getElementById('clist');if(!el)return;el.insertAdjacentHTML('afterbegin',legendsHTML());
 el.querySelectorAll('[data-uf]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();const u=+b.dataset.uf;if(!UNL.ok(u)){say('🔒 '+UNLK[u].txt,'#ffe08a',true);return}if(typeof ov==='function')ov(false);else document.body.classList.remove('ov');setForm(4+u)}));
 const ta=document.getElementById('tryall');if(ta)ta.addEventListener('click',e=>{e.preventDefault();UNL.d.tryAll=!UNL.d.tryAll;UNL.save();buildList()})};
buildList();

window.UFTABS=UFTABS;window.UNLx=UNL;buildList();
{let _wasOv=false;new MutationObserver(()=>{const o=document.body.classList.contains('ov');if(o&&!_wasOv)try{buildList()}catch(e){}_wasOv=o}).observe(document.body,{attributes:true,attributeFilter:['class']})}
// ===================== ROUND 14: THE MYTHIC TIER (8 forms, unlock after the Legends) =====================
// Tiers: ALLEY CAT (Kitty, Ninja) · PROWLER (Samurai, Knight, Pirate) · LEGEND (6) · MYTHIC (8, below) · ASCENDED (1, locked: beat the Survival Tower – coming later).
// Storm Titan · Dragon Emperor · Phoenix · Frost Monarch · Mecha · Tidecaller · Chrono · Beast King. They run on the legend engine (8-hit timed chain,
// Tail / Meow (hold) / Blink, links after a C C C / T T T opener, routes, a cinematic perfect-8th-hit and an ULTIMATE), each with its own element FX.
const MBAD={mst:{jump:[4]},mph:{jump:[4],combo_b:[4],ult:[3]},mtc:{jump:[0,4],ult:[3]},mbk:{jump:[4],combo_b:[5]},mch:{combo_b:[5]},mde:{combo_c:[3],ult:[3,4]},mfm:{combo_c:[3],ult:[3]}};
function MA(pre){const bad=MBAD[pre]||{},ok=(sh,ix)=>ix.filter(i=>!(bad[sh]||[]).includes(i)),
 pick=(sh,ix,...alt)=>{let r=ok(sh,ix);if(r.length)return [sh,r];for(const [s2,i2] of alt){r=ok(s2,i2);if(r.length)return [s2,r]}return ['idle',[0]]};
 const m={},S=(k,v,fps,loop)=>m[k]=[v[0],v[1],fps||1,loop||0];
 S('idle',['idle',[0,1,2,3,4,5,4,3,2,1]],7,1);S('run',[({mst:1,mde:1,mfm:1,mmc:1,mch:1})[pre]?'run_v2':'run',null],12,1);
 S('rise',pick('jump',[1,2],['jump',[3]]),9);S('apex',pick('jump',[3],['jump',[2]]));S('fall',pick('jump',[3],['jump',[2]]));S('land',pick('jump',[5]));S('hurt',pick('jump',[0],['jump',[1]]));S('victory',pick('ult',[5]));
 S('h1',pick('combo_a',[0,1,2]),18);S('h2',pick('combo_a',[3,4,5]),18);S('h3',pick('combo_b',[0,1,2]),18);S('h4',pick('combo_b',[3,4,5]),16);
 S('h5',pick('combo_c',[0,1,2]),18);S('h6',pick('combo_c',[3,4,5]),16);S('h7',pick('special',[2,3,4,5]),16);
 S('launch',pick('ult',[1,2]),12);S('air1',pick('combo_a',[2,3]),14);S('air2',pick('combo_c',[4,5],['combo_c',[1,2]]),14);S('dive',({mde:1,mph:1,mtc:1,mfm:1})[pre]?['dive',[2,3]]:pick('ult',[3],['ult',[2]]));
 S('tail',pick('special',[0,1,2]),16);S('tail2',pick('special',[2,3,4,5]),16);S('meowc',pick('ult',[0]));S('meow',pick('special',[3,4,5]),14);S('meow2',pick('combo_c',[4,5]),12);
 S('blink',pick('combo_c',[0,1]),14);
 S('ultA',pick('ult',[0]));S('ultB',pick('ult',[1]));S('ultC',pick('ult',[2]));S('ultD',({mde:1,mph:1,mtc:1,mfm:1})[pre]?['dive',[3,4]]:pick('ult',[3],['ult',[2]]));S('ultE',pick('ult',[4],['combo_b',[4]],['special',[5]]));S('ultF',pick('ult',[5]));
 UA(pre,m)}
const MPRE=['mst','mde','mph','mfm','mmc','mtc','mch','mbk'];MPRE.forEach(MA);UPRE.push(...MPRE);
const MC=(a,k,lunge,ht,nm)=>({a,k,lunge,ht,nm});
UF.push(
 {pre:'mst',nm:'STORM TITAN',ico:'🌩️',el:'storm',col:'#4aa8ff',col2:'#e8f6ff',spd:430,H:.42,H0:.38,minT:.16,W:.21,E:.5,tier:'MYTHIC FORM',
  CH:[null,MC('h1','flat',220,.08,'THUNDER TAP!'),MC('h2','over',200,.09,'HAMMER DROP!'),MC('h3','rise',200,.09,'SKY HOOK!'),MC('h4','spin',180,.09,'VOLT SPIN!'),MC('h5','flat',260,.09,'STORM SWING!'),MC('h6','over',240,.1,'THUNDERCLAP!'),MC('h7','big',200,.12,'TITAN HAMMER!')]},
 {pre:'mde',nm:'DRAGON EMPEROR',ico:'🐉',el:'dragon',col:'#ffc83a',col2:'#3fd38a',spd:470,H:.36,H0:.32,minT:.13,W:.17,E:.44,tier:'MYTHIC FORM',
  CH:[null,MC('h1','thrust',300,.06,'JADE THRUST!'),MC('h2','flat',260,.06,'DRAGON TAIL SWEEP!'),MC('h3','rise',220,.07,'RISING JADE!'),MC('h4','spin',200,.07,'SPEAR WHIRL!'),MC('h5','thrust',320,.06,'HUNDRED THRUSTS!'),MC('h6','rise',200,.08,'SKY PIERCER!'),MC('h7','big',260,.1,"EMPEROR'S DECREE!")]},
 {pre:'mph',nm:'PHOENIX',ico:'🔥',el:'fire',col:'#ff7a1a',col2:'#ffe14d',spd:500,H:.34,H0:.3,minT:.12,W:.16,E:.42,tier:'MYTHIC FORM',
  CH:[null,MC('h1','flat',260,.06,'EMBER SLASH!'),MC('h2','cross',240,.06,'TWIN FLARE!'),MC('h3','spin',200,.07,'WING BEAT!'),MC('h4','rise',200,.07,'FLAME RISE!'),MC('h5','cross',260,.07,'INFERNO X!'),MC('h6','flat',300,.07,'SOLAR FLARE!'),MC('h7','big',240,.1,'BLAZE NOVA!')]},
 {pre:'mfm',nm:'FROST MONARCH',ico:'❄️',el:'ice',col:'#7fdcff',col2:'#ffffff',spd:440,H:.4,H0:.36,minT:.15,W:.2,E:.48,tier:'MYTHIC FORM',
  CH:[null,MC('h1','flat',240,.08,'FROST CUT!'),MC('h2','low',240,.08,'GLACIER SWEEP!'),MC('h3','over',220,.09,'ICE CROWN!'),MC('h4','spin',180,.08,'SNOW WALTZ!'),MC('h5','cross',240,.08,'FROZEN CROSS!'),MC('h6','down',260,.09,'AVALANCHE!'),MC('h7','big',220,.11,'ABSOLUTE ZERO!')]},
 {pre:'mmc',nm:'MECHA PADDY',ico:'🤖',el:'mech',col:'#ff8a2a',col2:'#4ff0ff',spd:450,H:.4,H0:.36,minT:.15,W:.2,E:.48,tier:'MYTHIC FORM',
  CH:[null,MC('h1','flat',240,.07,'BLADE CUT!'),MC('h2','cross',260,.07,'BOOST SLASH!'),MC('h3','thrust',320,.07,'PISTON PUNCH!'),MC('h4','spin',200,.08,'SPIN CUTTER!'),MC('h5','rise',160,.08,'ROCKET UPPER!'),MC('h6','cross',300,.08,'THRUSTER CROSS!'),MC('h7','big',240,.11,'OVERDRIVE CLEAVE!')]},
 {pre:'mtc',nm:'TIDECALLER',ico:'🌊',el:'water',col:'#2fd8e8',col2:'#ffa060',spd:460,H:.37,H0:.33,minT:.13,W:.18,E:.45,tier:'MYTHIC FORM',
  CH:[null,MC('h1','thrust',280,.07,'TIDE THRUST!'),MC('h2','flat',240,.07,'RIPTIDE!'),MC('h3','spin',200,.07,'WHIRLPOOL SPIN!'),MC('h4','rise',200,.08,'GEYSER!'),MC('h5','cross',240,.07,'TRIDENT CROSS!'),MC('h6','low',300,.08,'UNDERTOW!'),MC('h7','big',240,.1,'TSUNAMI STRIKE!')]},
 {pre:'mch',nm:'CHRONO PADDY',ico:'⏱️',el:'time',col:'#ffd04d',col2:'#3fd0c0',spd:510,H:.32,H0:.28,minT:.11,W:.15,E:.4,tier:'MYTHIC FORM',
  CH:[null,MC('h1','flat',260,.05,'TICK!'),MC('h2','cross',240,.05,'TOCK!'),MC('h3','spin',200,.06,'SECOND HAND!'),MC('h4','rise',220,.06,'MINUTE CUT!'),MC('h5','cross',260,.06,'HOUR CROSS!'),MC('h6','flat',300,.06,'REWIND STRIKE!'),MC('h7','big',240,.09,'MIDNIGHT!')]},
 {pre:'mbk',nm:'BEAST KING',ico:'🦁',el:'beast',col:'#ffb020',col2:'#ff5a2a',spd:490,H:.36,H0:.32,minT:.13,W:.17,E:.44,tier:'MYTHIC FORM',
  CH:[null,MC('h1','flat',260,.06,"KING'S SWIPE!"),MC('h2','cross',240,.06,'DOUBLE CLAW!'),MC('h3','thrust',360,.07,'POUNCE!'),MC('h4','spin',200,.07,'LION SPIN!'),MC('h5','rise',200,.07,'RISING CLAW!'),MC('h6','low',300,.07,'SAVANNA SWEEP!'),MC('h7','big',260,.1,'PRIDE STRIKE!')]});
const MY=u=>u>=7;
Object.assign(KB,{mbolt:[160,-420,.35,.05],mfire:[220,-320,.2,.04],mice:[60,-220,.6,.04],mrocket:[260,-460,.3,.05],mwater:[320,-380,.3,.04],mtime:[40,-160,.5,.03],
 mclaw:[260,-320,.2,.05],mroar:[720,-460,.25,.08],mdragon:[200,-760,.45,.06],mbig:[420,-950,.4,.1],mresume:[300,-1000,.5,.08]});
Object.assign(NAMES,{mbolt:'ZAP!',mfire:'FWOOSH!',mice:'FREEZE!',mrocket:'BOOM!',mwater:'SPLASH!',mtime:'TICK!',mclaw:'CLAW!',mroar:'ROAR!',mdragon:'DRAGON!',mbig:'',mresume:'…TOCK!'});
UTN.push(['HAMMER THROW!','TWIN HAMMERS!','CHAIN LIGHTNING!'],['SPEAR VAULT!','DOUBLE VAULT!','DRAGON WHIRLWIND!'],['FIRE FEATHERS!','FEATHER STORM!','PHOENIX SPIRAL!'],
 ['ICE SPIKES!','SPIKE ROW!','ICE WALL!'],['MISSILE POD!','DOUBLE POD!','MISSILE BARRAGE!'],['WATER WHIP!','UNDERTOW PULL!','WHIRLPOOL!'],['CLOCK RING!','TWIN RINGS!','GEAR STORM!'],
 ['SPIRIT CLAW!','TWIN CLAWS!','SPIRIT PRIDE!']);
const MTK={7:'hammer',8:'whirl',9:'feathers',10:'spikes',11:'missiles',12:'whip',13:'gears',14:'claws'},MMK={7:'storm',8:'dragon',9:'fireball',10:'blizzard',11:'laser',12:'wave',13:'timestop',14:'roar'};
const MMN={storm:['STATIC BOLT!','THUNDERSTORM!','SKYFALL HAMMER!!'],dragon:['JADE WAVE!','GOLDEN DRAGON!','TWIN DRAGONS!!'],fireball:['FIREBALL!','WING BURST!','PHOENIX DIVE!!'],
 blizzard:['ICE SHARDS!','BLIZZARD!','GLACIER CRASH!!'],laser:['ARM CANNON!','TWIN LASER!','GIGA BEAM!!'],wave:['BUBBLE BURST!','TIDAL WAVE!','SEA SERPENT!!'],
 timestop:['SLOW FIELD!','TIME STOP!','REWIND!!'],roar:['GROWL!',"KING'S ROAR!",'SPIRIT LION!!']};
const M14={bolts:[],spikes:[],claws:[],clocks:[],echo:[],tstop:0,tsT:0,slow:0,dark:0,bliz:null,pool:null,hitTS:new Set()};
// ---- element FX helpers ----
const mX=()=>UF[p.uf];
function mHit(d,kb,dir,keep){if(!d||!d.alive)return;C.atk++;if(keep)d.hp=Math.max(2,d.hp);hitDummy(d,kb,dir??(Math.sign(d.x-p.x)||p.face));if(d.vy<-1400)d.vy=-1400;if(d.y<GROUND-380)d.vy=Math.max(d.vy,-150);if(M14.tstop>0)M14.hitTS.add(d)}
function mBolt(x,o){o=o||{};const pts=[],top=-camY-120;let cx=x;for(let y=top;y<GROUND;y+=34){pts.push([cx,y]);cx+=(Math.random()-.5)*46}pts.push([x,GROUND]);
 M14.bolts.push({pts,l:.32,w:o.w||1,col:o.col||'#9fd8ff'});flashT=Math.max(flashT,o.w>1.5?.18:.06);shake=Math.max(shake,o.w>1.5?18:7);noiseS(.1,5200,900,.07);
 for(let i=0;i<14;i++)sparks.push({x,y:GROUND-10,vx:(Math.random()-.5)*600,vy:-150-Math.random()*450,l:.45,c:i%2?'#fff':o.col||'#9fd8ff'});waves.push({x,y:GROUND-6,r:8,l:.5,big:o.w>1.5});
 if(o.hit!==false)for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<70*(o.w||1)+30)mHit(d,o.kb||'mbolt',Math.sign(d.x-p.x)||p.face,o.keep)}
function mSpike(x,o){o=o||{};M14.spikes.push({x,h:o.h||120,l:o.l||.8,t:0,d:o.d||0,col:o.col||'#bfefff',kb:o.kb||'mice',keep:o.keep,hit:o.hit!==false,done:0,frz:o.frz||.5})}
function mClaw(x,y,face,s,col){M14.claws.push({x,y,face,s:s||1,l:.4,col:col||'#ffcf4a'});spark(x,y,10,[col||'#ffcf4a','#fff'],320)}
function mClock(x,y,R,l,col){M14.clocks.push({x,y,R,l,l0:l,col:col||'#ffd04d',a:Math.random()*6})}
function mP(o){const X=mX()||UF[7];U.proj.push(Object.assign({x:p.x+p.face*90,y:p.y-95,vx:p.face*900,vy:0,l:1,s:1,face:p.face,hit:new Set(),kb:'mfire',col:X.col,col2:X.col2,fx:1,my:1,age:0,tick:0,tr:[]},o))}
function mTgt(r){return uNear(r||800)}
function mFreeze(d,t){if(d&&d.alive){d.mfz=Math.max(d.mfz||0,t||.5)}}
function mFireBurst(x,y,n,s){for(let i=0;i<(n||16);i++){const a=Math.random()*6.283,v=(120+Math.random()*380)*(s||1);sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,l:.5,c:['#ff7a1a','#ffe14d','#fff','#ff4a1a'][i%4]})}}
function mWater(x,y,n){for(let i=0;i<(n||16);i++)sparks.push({x:x+(Math.random()-.5)*60,y,vx:(Math.random()-.5)*400,vy:-200-Math.random()*500,l:.6,c:i%3?'#7ff0ff':'#fff'})}
function mSnow(x,y,n){for(let i=0;i<(n||14);i++){const a=Math.random()*6.283,v=80+Math.random()*300;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.6,c:i%2?'#fff':'#bfefff'})}}
function mPillar(x,col,w,l,d){U.pillars.push({x,l:l||.8,col,w:w||80,d:d||0})}
// one element move at power 0 / 1 / 2 (Tail uses n-1, Meow uses the charge level, links use 1 / 2). keep = a link (never K.O.s mid-link)
function mMove(kind,lv,keep){const X=mX(),f=p.face,g=mTgt(900),gx=g?g.x:clampX(p.x+f*260);extend();
 switch(kind){
 case 'hammer':if(lv<2){for(let k=0;k<=lv;k++)mP({k:'mham',vx:f*1100,vy:k?-260:0,y:p.y-110,l:1.5,s:1.2,ret:1,kb:'mbolt',keep,tick:0});noiseS(.1,900,300,.06)}
  else{const T=dummies.filter(d=>d.alive&&Math.abs(d.x-p.x)<900);for(const d of T){sLine(p.x+f*60,p.y-110,d.x,d.y-140,'#bfe6ff',.35,10);mBolt(d.x,{hit:false});mHit(d,'mbolt',Math.sign(d.x-p.x)||f,keep)}if(!T.length)mBolt(p.x+f*260,{keep});M14.dark=Math.max(M14.dark,.6)}break;
 case 'storm':if(lv===0)mBolt(gx,{keep});else if(lv===1){M14.dark=Math.max(M14.dark,1);for(let k=0;k<5;k++)setTimeout(()=>{if(p.uf===7)mBolt(clampX(p.x+f*(140+k*110)),{keep})},k*90)}
  else{M14.dark=1.6;for(let k=0;k<6;k++)setTimeout(()=>{if(p.uf===7)mBolt(clampX(gx+(Math.random()-.5)*600),{keep})},k*70);setTimeout(()=>{if(p.uf===7){mBolt(gx,{w:2.6,kb:'mbig',keep});R9.cracks.push(mkCrack(gx,11));boom()}},480)}break;
 case 'whirl':if(lv<2){uStrike('utail',210,240,true,UTN[8][lv]);slash('spin',X.col,{lvl:6,scale:1.5,col2:X.col2});uRing(p.x,p.y-90,X.col,X.col2,0);if(lv){p.vy=-520;p.ground=false}}
  else mP({k:'mtor',vx:f*420,y:GROUND,l:1.6,s:1.6,kb:'mdragon',keep,col:X.col,tick:0});break;
 case 'dragon':if(lv===0)crescent({vx:f*1000,s:1.3,col:X.col,kb:'mdragon',keep});
  else for(let k=0;k<lv;k++)mP({k:'mrib',vx:f*(820-k*120),y:p.y-100-k*30,l:1.5,s:1.4,ph:k*3.1,amp:lv>1?90:40,kb:'mdragon',keep,tick:0,col:k?X.col2:X.col});
  if(lv)say(lv>1?'TWIN DRAGONS!!':'GOLDEN DRAGON!',X.col,true);break;
 case 'feathers':if(lv<2){const n=lv?5:3;for(let k=0;k<n;k++){const a=(k-(n-1)/2)*.16;mP({k:'mfeather',vx:f*1200*Math.cos(a),vy:1200*Math.sin(a),l:.7,s:1,kb:'mfire',keep})}}
  else{mP({k:'mtor',vx:0,x:p.x,y:GROUND,l:1.2,s:1.5,kb:'mfire',keep,col:'#ff7a1a',col2:'#ffe14d',tick:0,fire:1});p.vy=-700;p.ground=false;mFireBurst(p.x,p.y-60,30)}break;
 case 'fireball':if(lv===0){mP({k:'mball',vx:f*1100,s:1.3,l:1,kb:'mfire',keep,boom:1});mFireBurst(p.x+f*100,p.y-95,10)}
  else if(lv===1){for(let k=0;k<10;k++){const a=k/10*6.283;mP({k:'mball',x:p.x,y:p.y-90,vx:Math.cos(a)*900,vy:Math.sin(a)*900,s:.9,l:.6,kb:'mfire',keep})}uRing(p.x,p.y-90,X.col,X.col2,1);shake=Math.max(shake,12)}
  else{mP({k:'mbird',vx:f*1300,y:p.y-110,l:1.1,s:1.8,kb:'mbig',keep,tick:0});mFireBurst(p.x,p.y-90,40,1.4);flashT=Math.max(flashT,.12);shake=Math.max(shake,16)}break;
 case 'spikes':{const n=lv===2?8:lv?5:3;for(let k=0;k<n;k++)mSpike(clampX(p.x+f*(110+k*85)),{h:lv===2?200:120+k*10,d:k*.06,keep,frz:lv===2?1.2:.5});mSnow(p.x+f*100,GROUND-40,16);break}
 case 'blizzard':if(lv===0){for(let k=0;k<3;k++)mP({k:'mshard',vx:f*1300,vy:(k-1)*160,s:1,l:.7,kb:'mice',keep,frz:1})}
  else if(lv===1){M14.bliz={x:gx,l:2.2,tk:0,keep};say('BLIZZARD!','#e8faff',true)}
  else{mP({k:'mglac',x:gx,y:-camY-200,vx:0,vy:600,l:3,s:1.6,kb:'mbig',keep,tx:gx});say('GLACIER CRASH!!','#e8faff',true)}break;
 case 'missiles':{const n=lv===2?12:lv?6:3;for(let k=0;k<n;k++)setTimeout(()=>{if(p.uf===11)mP({k:'mrock',x:p.x-f*20,y:p.y-150,vx:(Math.random()-.5)*300-f*200,vy:-700-Math.random()*300,l:2,s:1,kb:'mrocket',keep,boom:1,home:.25})},k*45);noiseS(.2,700,300,.07);break}
 case 'laser':if(lv===0){mP({k:'mplasma',vx:f*1500,s:1.3,l:.8,kb:'mrocket',keep,boom:1})}
  else{const w=lv===2?140:34;for(let k=0;k<(lv===2?1:2);k++)U.beams.push({x:p.x+f*110,y:p.y-(lv===2?110:90+k*40),face:f,l:lv===2?1:.45,w,col:X.col2,col2:'#ffffff',hit:new Set(),kb:lv===2?'mbig':'mrocket',keep});p.vx=-f*(lv===2?520:200);if(lv===2){boom();shake=26;flashT=.2}}break;
 case 'whip':if(lv===0){sLine(p.x+f*40,p.y-90,p.x+f*360,p.y-70,X.col,.3,14);mWater(p.x+f*300,p.y-70,12);for(const d of dummies)if(d.alive&&(d.x-p.x)*f>-30&&Math.abs(d.x-p.x)<380)mHit(d,'mwater',f,keep)}
  else if(lv===1){if(g){U.pull={d:g,t:.25,x:p.x+f*120};sLine(p.x+f*40,p.y-90,g.x,g.y-140,X.col,.35,12);mHit(g,'utail',f,keep)}mWater(p.x+f*120,p.y-80,14)}
  else{M14.pool={x:clampX(p.x+f*240),l:1.8,tk:0,keep};say('WHIRLPOOL!','#bff8ff',true)}break;
 case 'wave':if(lv===0){for(let k=0;k<5;k++)mP({k:'mbub',vx:f*(500+k*120),vy:-60+k*30,s:.8+Math.random()*.5,l:1.2,kb:'mwater',keep})}
  else if(lv===1){mP({k:'mwave',vx:f*800,x:p.x+f*60,y:GROUND,l:1.3,s:1.4,kb:'mwater',keep,tick:0});mWater(p.x+f*60,GROUND-20,20)}
  else{mP({k:'mrib',vx:f*760,y:p.y-110,l:1.8,s:1.8,ph:0,amp:110,kb:'mbig',keep,tick:0,col:'#2fd8e8',col2:'#e6ffff',water:1});mPillar(p.x+f*80,'#2fd8e8',90,.6);mWater(p.x+f*80,GROUND,30)}break;
 case 'gears':{const n=lv===2?8:lv?2:1;for(let k=0;k<n;k++){const a=lv===2?k/n*6.283:0;mP({k:'mgear',vx:lv===2?Math.cos(a)*900:f*900,vy:lv===2?Math.sin(a)*900:(k?-140:0),s:1.2,l:.9,kb:'mtime',keep,tick:0})}break}
 case 'timestop':if(lv===0){M14.slow=3;mClock(p.x,p.y-100,220,.9);say('SLOW FIELD!','#ffe9a0',true)}
  else if(lv===1){M14.tstop=Math.max(M14.tstop,1.7);M14.hitTS.clear();mClock(VW/2,-camY+300,340,1.7,'#ffd04d');noiseS(.4,300,90,.08);if(keep)say('TIME STOP!',X.col,true);else card('TIME STOP!','…the world holds its breath',X.col)}
  else{for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<620){for(let k=0;k<3;k++)M14.echo.push({t:.12+k*.12,d,keep});}for(let k=1;k<=5;k++)ghosts.push({x:p.x-f*k*40,y:p.y,f:uFr('h5'),face:f,l:.2+k*.08,blue:1});mClock(p.x,p.y-100,200,.8,'#3fd0c0')}break;
 case 'claws':{const tg=g&&Math.abs(g.x-p.x)<420?g:null;if(lv<2){const sides=lv?[1,-1]:[1];for(const s of sides){const x=tg&&s===1?tg.x:p.x+f*s*150;mClaw(x,p.y-100,f*s,1.2,X.col);for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<130)mHit(d,'mclaw',f*s,keep)}}
  else for(let k=0;k<3;k++)mP({k:'mlion',vx:f*(1000+k*150),x:p.x-f*k*40,y:GROUND,l:.9,s:.9+k*.1,kb:'mclaw',keep,tick:0});break}
 case 'roar':{const R=lv===2?0:lv?620:300;if(lv<2){for(let k=0;k<(lv?4:2);k++)R9.rings.push({x:p.x+f*60,y:p.y-110,r:20+k*30,vr:900+k*200,l:.9,col:k%2?X.col2:X.col,w:12,f:18,face:0});
   for(const d of dummies)if(d.alive&&Math.abs(d.x-p.x)<R)mHit(d,lv?'mroar':'mclaw',Math.sign(d.x-p.x)||f,keep);shake=Math.max(shake,lv?22:10);say(lv?"KING'S ROAR!":'GROWL!',X.col,true);noiseS(.35,200,80,.1)}
  else{mP({k:'mlion',vx:f*900,x:p.x,y:GROUND,l:1.3,s:2,kb:'mbig',keep,tick:0});shake=Math.max(shake,16);noiseS(.35,200,80,.1)}break}}}
// ---- chain extras (on top of the shared legend chain) ----
function mChainX(X,i,c){const f=p.face,g=uNear(340),hx=g&&(g.x-p.x)*f>-40?g.x:p.x+f*150;
 switch(p.uf){
 case 7:if(i>=3)mBolt(hx,{hit:i>=4,w:i===7?2:1});if(i===7){setTimeout(()=>{if(p.uf===7){mBolt(hx-120,{});mBolt(hx+120,{})}},90);R9.cracks.push(mkCrack(hx,11))}spark(p.x+f*90,p.y-110,6,['#9fd8ff','#fff'],300);break;
 case 8:sLine(p.x-f*20,p.y-100,p.x+f*240,p.y-90+(i%2?-30:30),X.col,.3,9);if(i>=4)mP({k:'mrib',vx:f*900,y:p.y-100,l:.45,s:.8,ph:i,amp:30,kb:'mdragon',col:X.col,tick:0,cos:i<7});if(i===7)mPillar(hx,X.col,90,.7);break;
 case 9:mFireBurst(p.x+f*100,p.y-90,8+i*2);if(i%2)mP({k:'mfeather',vx:f*1100,vy:-80,l:.5,s:.9,kb:'mfire'});if(i===7){mPillar(hx,'#ff7a1a',110,.8);mFireBurst(hx,GROUND-60,40,1.5)}break;
 case 10:if(g&&Math.abs(g.x-p.x)<260)mFreeze(g,.25+i*.04);mSnow(p.x+f*100,p.y-90,6+i);if(i>=4)mSpike(hx,{h:90+i*12,hit:i>=6});if(i===7)for(let k=-1;k<=1;k+=2)mSpike(hx+k*110,{h:150,d:.08});break;
 case 11:for(let k=0;k<6;k++)sparks.push({x:p.x-f*50,y:p.y-60+Math.random()*30,vx:-f*(300+Math.random()*300),vy:(Math.random()-.5)*100,l:.3,c:k%2?'#ff8a2a':'#ffe14d'});if(i>=5)mP({k:'mrock',vx:f*900,vy:-200,y:p.y-150,l:1.2,s:.8,kb:'mrocket',boom:1,home:.3});
  if(i===7)U.beams.push({x:p.x+f*110,y:p.y-95,face:f,l:.35,w:50,col:'#4ff0ff',col2:'#fff',hit:new Set(),kb:'mrocket'});break;
 case 12:mWater(p.x+f*110,p.y-70,8+i);if(i===4||i===6)mPillar(hx,'#2fd8e8',60,.5);if(i===7)mP({k:'mwave',vx:f*800,x:p.x+f*60,y:GROUND,l:1,s:1.2,kb:'mwater',tick:0});break;
 case 13:mClock(hx,p.y-110,60+i*6,.35,i%2?'#ffd04d':'#3fd0c0');if(i===6){for(let k=0;k<3;k++)M14.echo.push({t:.08+k*.08,d:g,ghost:1})}if(i===7){mClock(hx,p.y-110,220,.8);M14.tstop=Math.max(M14.tstop,.35)}break;
 case 14:mClaw(hx,p.y-100,f,.8+i*.06,i%2?X.col:X.col2);if(i===7){mClaw(hx,p.y-100,f,2,X.col);for(let k=0;k<3;k++)R9.rings.push({x:hx,y:p.y-100,r:20+k*30,vr:900,l:.8,col:X.col,w:10,f:18,face:0})}break}}
const _ufChainFx14=ufChainFx;ufChainFx=function(X,i,c){_ufChainFx14(X,i,c);if(MY(p.uf))mChainX(X,i,c)};
// ---- Tail / Meow / Blink / launcher / dive ----
const _ufTailFx14=ufTailFx;ufTailFx=function(t,at){if(!MY(p.uf))return _ufTailFx14(t,at);const n=p.ut.n;if(at(.06))mMove(MTK[p.uf],n-1);if(!p.ground&&n<3&&p.uf!==8)p.vy=Math.min(p.vy,60)};
const _ufMeow14=ufMeow;ufMeow=function(L){if(!MY(p.uf))return _ufMeow14(L);const X=mX(),nm=MMN[MMK[p.uf]][L];
 act('umeow',uA(L===2?'meow2':'meow'),{say:nm,c:L?X.col2:X.col});p.um={L,n:0,k:0};C.atk++;extend();if(L===2){card(nm.replace(/!+$/,'!!'),'MEOW · fully charged',X.col);slowT=Math.max(slowT,.2)}};
const _ufMeowFx14=ufMeowFx;ufMeowFx=function(t,at,dt){if(!MY(p.uf))return _ufMeowFx14(t,at,dt);if(at(.06))mMove(MMK[p.uf],p.um.L)};
const MBN={7:'LIGHTNING STEP!',8:'DRAGON DASH!',9:'FLAME FLICKER!',10:'MIRROR STEP!',11:'BOOST DASH!',12:'SPLASH STEP!',13:'TIME SKIP!',14:'PREDATOR POUNCE!'};
const _ufBlink14=ufBlink;ufBlink=function(){if(!MY(p.uf))return _ufBlink14();if(p.blinkCool>0||CINE.includes(p.state)||['lk','lkult','nmorph','respawn','ledge'].includes(p.state))return false;
 p.blinkCool=.42;const X=mX(),g=uNear(700),u=p.uf,f0=p.face;act('ublink',uA('blink'),{say:MBN[u],c:X.col2});p.ub={g,x0:p.x,y0:p.y,hit:new Set(),done:false};p.inv=Math.max(p.inv,.35);p.rot=0;extend();
 const fx0=p.x,fy0=p.y;
 if(u===8||u===11){p.x=clampX(g&&Math.abs(g.x-p.x)<500?g.x+f0*120:p.x+f0*300);for(const d of dummies)if(d.alive&&(d.x-fx0)*f0>-20&&(p.x-d.x)*f0>-40)mHit(d,u===8?'mdragon':'mrocket',f0);
  if(u===11)for(let k=0;k<24;k++)sparks.push({x:fx0+(p.x-fx0)*k/24,y:p.y-60,vx:-f0*200,vy:(Math.random()-.5)*80,l:.4,c:k%2?'#ff8a2a':'#ffe14d'})}
 else if(u===14&&g){p.x=clampX(g.x-f0*40);p.y=Math.min(p.y,GROUND)-200;p.ground=false;p.vy=-100;act('udive',uA('dive'),{say:'PREDATOR POUNCE!',c:X.col});p.vy=1400}
 else{if(g){const side=Math.abs(g.x-p.x)<160?-p.face:p.face;p.x=clampX(g.x+side*110);p.face=g.x>p.x?1:-1}else p.x=clampX(p.x+p.face*280)}
 for(let k=1;k<=6;k++)ghosts.push({x:fx0+(p.x-fx0)*k/7,y:fy0+(p.y-fy0)*k/7,f:uFr('blink'),face:p.face,l:.1+k*.035,blue:1});
 if(u===7){sLine(fx0,fy0-90,p.x,p.y-90,'#bfe6ff',.35,10);mBolt(p.x,{hit:false})}
 if(u===8)sLine(fx0,fy0-100,p.x,p.y-100,X.col,.4,12);if(u===9){mFireBurst(fx0,fy0-80,24);mFireBurst(p.x,p.y-80,24)}
 if(u===10){ghosts.push({x:fx0,y:fy0,f:uFr('idle'),face:f0,l:1.2,blue:1});mSnow(fx0,fy0-80,20);mSnow(p.x,p.y-80,12)}
 if(u===12){mWater(fx0,GROUND,20);mWater(p.x,GROUND,20)}if(u===13){mClock(fx0,fy0-100,110,.4);mClock(p.x,p.y-100,110,.4,'#3fd0c0')}
 shake=Math.max(shake,5);return true};
const MLN={7:'THUNDER UPPER!',8:'ASCENDING DRAGON!',9:'RISING PHOENIX!',10:'FROST LIFT!',11:'ROCKET LAUNCH!',12:'GEYSER LAUNCH!',13:'TIME LIFT!',14:'LION LEAP!'},
 MDN={7:'STORM DROP!',8:'DRAGON FALL!',9:'METEOR DIVE!',10:'AVALANCHE DROP!',11:'ORBITAL DROP!',12:'TIDAL DROP!',13:'CLOCK DROP!',14:'KING POUNCE!'};
const _ufLaunch14=ufLaunch;ufLaunch=function(){if(!MY(p.uf))return _ufLaunch14();const X=mX();act('ulaunch',uA('launch'),{say:MLN[p.uf],c:X.col2});p.vx=p.face*60;p.uair=0;
 const x=p.x+p.face*100;if(p.uf===7)mBolt(x,{hit:false});if(p.uf===9)mFireBurst(x,GROUND-40,20);if(p.uf===10)mSpike(x,{h:150});if(p.uf===12)mPillar(x,'#2fd8e8',70,.5);if(p.uf===8)mP({k:'mrib',vx:0,vy:-900,x,y:GROUND-40,l:.6,s:.9,ph:0,amp:20,kb:'mdragon',tick:0,cos:1})};
const _ufDive14=ufDive;ufDive=function(){if(!MY(p.uf))return _ufDive14();const X=mX();act('udive',uA('dive'),{say:MDN[p.uf],c:X.col});p.vy=1300;p.vx=p.face*180};
function mDiveLand(){const X=mX(),x=p.x;
 switch(p.uf){case 7:mBolt(x,{w:1.6});break;case 8:mPillar(x,X.col,80,.6);break;case 9:mPillar(x,'#ff7a1a',90,.6);mFireBurst(x,GROUND-30,30);break;case 10:for(let k=-2;k<=2;k++)if(k)mSpike(x+k*80,{h:110,d:Math.abs(k)*.05});break;
  case 11:for(let k=0;k<4;k++)mP({k:'mrock',x,y:GROUND-40,vx:(k-1.5)*300,vy:-600,l:1.5,s:.8,kb:'mrocket',boom:1,home:.3});break;case 12:mP({k:'mwave',vx:p.face*700,x,y:GROUND,l:.9,s:1.1,kb:'mwater',tick:0});mP({k:'mwave',vx:-p.face*700,x,y:GROUND,l:.9,s:1.1,kb:'mwater',tick:0,face:-p.face});break;
  case 13:mClock(x,GROUND-40,180,.6);M14.tstop=Math.max(M14.tstop,.3);break;case 14:mClaw(x,GROUND-60,p.face,1.6,X.col);break}}
const _ufState14=ufState;ufState=function(S,dt,end,dir){const dv=S==='udive'&&MY(p.uf);_ufState14(S,dt,end,dir);if(dv&&p.state!=='udive'&&p.ground)mDiveLand()};
// ---- the perfect 8th hit ----
const MFIN={7:'THUNDERGOD HAMMER!!',8:'IMPERIAL DRAGON!!',9:'SUN PHOENIX!!',10:'DIAMOND DUST!!',11:'FULL BURST!!',12:'MAELSTROM!!',13:'TIME BREAK!!',14:'LION HEART!!'};
const _ufFinal14=ufFinal;ufFinal=function(){if(!MY(p.uf))return _ufFinal14();const X=mX();C.atk++;popNum(8,X.col);act('ufin',uA('ultA'),{say:MFIN[p.uf].replace(/!+$/,'…'),c:X.col2});p.inv=5;p.grab=uNear(520);p.vx=0;p.vy=0;p.fz={st:0,k:0,n:0};cineGo(1.3,.45);slowT=Math.max(slowT,.12)};
const _ufFinalState14=ufFinalState;ufFinalState=function(dt,t,at){if(!MY(p.uf))return _ufFinalState14(dt,t,at);const X=mX(),g=p.grab&&p.grab.alive?p.grab:null,z=p.fz,gx=g?g.x:clampX(p.x+p.face*180),e=x=>x*x*(3-2*x);p.rot=0;
 if(g&&!z.boom){g.vx=0;g.vy=0;g.fl=.6}
 if(t<.35){p.y+=(GROUND-p.y)*Math.min(1,dt*12);setAnim(uA('ultA'));if(t%.04<dt){const a=Math.random()*6.283;sparks.push({x:p.x+Math.cos(a)*120,y:p.y-90+Math.sin(a)*120,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.35,c:Math.random()<.5?X.col:X.col2})}}
 else if(t<.75){const u=e((t-.35)/.4);setAnim(uA(u<.5?'ultB':'ultC'));p.x+=((gx-p.face*90)-p.x)*Math.min(1,dt*6);p.y=GROUND-260*Math.sin(u*Math.PI*.5);p.ground=false;if(t%.03<dt)uGhost('ultC',.2);
  if(at(.5))mBig(p.uf,gx,0)}
 else if(t<.9){setAnim(uA('ultD'));p.y=Math.min(GROUND,p.y+3000*dt);if(t%.03<dt)uGhost('ultD',.2)}
 else{p.y=GROUND;p.ground=true;if(!z.boom){z.boom=true;setAnim(uA('ultE'),true);uBoom(gx,X.col,X.col2,4+p.uf);mBig(p.uf,gx,1);if(g){g.hp=Math.max(1,g.hp);hitDummy(g,'ufinal',p.face);g.vy=-2300}card(MFIN[p.uf],'PERFECT 8TH HIT',X.col)}if(t>1.75)ufFinEnd()}};
// each form's signature giant effect (finisher + ultimate). big = the earth-shattering version
function mBig(u,x,big){const X=UF[u],s=big?1:.6;
 switch(u){
 case 7:M14.dark=Math.max(M14.dark,big?2:1);if(big){mBolt(x,{w:3,hit:false});for(let k=1;k<=3;k++)setTimeout(()=>{mBolt(x-k*150,{hit:false,w:1.4});mBolt(x+k*150,{hit:false,w:1.4})},k*80)}else mBolt(x,{w:1.8,hit:false});break;
 case 8:for(let k=0;k<(big?3:1);k++)mP({k:'mrib',x:x-200+k*200,y:GROUND-20,vx:0,vy:-900-k*100,l:1.4,s:1.6+k*.2,ph:k*2,amp:120,kb:'mdragon',col:k%2?X.col2:X.col,tick:0,cos:1,spiral:x});mPillar(x,X.col,big?220:100,1.2);break;
 case 9:mPillar(x,'#ff7a1a',big?240:110,1.2);mFireBurst(x,GROUND-120,big?120:40,big?2:1.2);if(big){mP({k:'mbird',x:x-400,y:GROUND-300,vx:1400,vy:0,l:.8,s:3,kb:'mfire',cos:1,face:1});slash('cross','#ff7a1a',{lvl:8,scale:4,dx:0,col2:'#ffe14d'})}break;
 case 10:for(let k=-(big?5:2);k<=(big?5:2);k++)mSpike(x+k*90,{h:(big?260:160)-Math.abs(k)*18,d:Math.abs(k)*.05,hit:false,l:big?1.6:1});mSnow(x,GROUND-150,big?80:30);break;
 case 11:for(let k=0;k<(big?14:6);k++)mP({k:'mrock',x:x+(Math.random()-.5)*700,y:-camY-100-k*30,vx:0,vy:900,l:2,s:1,kb:'mrocket',boom:1,cos:1,fall:1});mPillar(x,'#4ff0ff',big?200:90,1);break;
 case 12:mPillar(x,'#2fd8e8',big?240:110,1.3);mWater(x,GROUND,big?80:30);if(big)for(const f of [1,-1])mP({k:'mwave',vx:f*900,x,y:GROUND,l:1.2,s:2,kb:'mwater',tick:0,face:f,cos:1});break;
 case 13:mClock(x,GROUND-170,big?380:200,big?1.4:.8);for(let k=0;k<12;k++){const a=k/12*6.283;sLine(x,GROUND-170,x+Math.cos(a)*(big?420:240),GROUND-170+Math.sin(a)*(big?420:240),k%2?'#ffd04d':'#3fd0c0',.5,8)}break;
 case 14:for(let k=-1;k<=1;k++)mClaw(x+k*70,GROUND-150+k*20,p.face,big?3:1.6,k?X.col2:X.col);if(big)mP({k:'mlion',x:x-p.face*500,y:GROUND,vx:p.face*1400,l:.8,s:2.6,cos:1,tick:0});for(let k=0;k<(big?5:2);k++)R9.rings.push({x,y:GROUND-120,r:20+k*40,vr:1100,l:1,col:k%2?X.col2:X.col,w:14,f:18,face:0});break}}
// ---- LINKS + ROUTES (forms 11-18) ----
const MLK=(col,col2,C,CC,T,TT,M,MM,B,BB)=>({col,col2,C:{nm:C,a:'h3'},CC:{nm:CC,a:'h6'},T:{nm:T,a:'tail'},TT:{nm:TT,a:'tail2'},M:{nm:M,a:'meow'},MM:{nm:MM,a:'meow2'},B:{nm:B,a:'blink'},BB:{nm:BB,a:'h7'}});
LKF.push(
 MLK('#4aa8ff','#e8f6ff','THUNDER STRIKE!','SKY HOOK!','TWIN HAMMERS!','CHAIN LIGHTNING!','THUNDERSTORM!','SKYFALL HAMMER!','LIGHTNING STEP!','DOUBLE STRIKE STEP!'),
 MLK('#ffc83a','#3fd38a','JADE THRUST!','RISING DRAGON SPEAR!','DOUBLE VAULT!','DRAGON WHIRLWIND!','GOLDEN DRAGON!','TWIN DRAGONS!','DRAGON DASH!','DRAGON DASH x2!'),
 MLK('#ff7a1a','#ffe14d','EMBER SLASH!','FLAME RISE!','FEATHER STORM!','PHOENIX SPIRAL!','WING BURST!','PHOENIX DIVE!','FLAME FLICKER!','FLICKER X!'),
 MLK('#7fdcff','#ffffff','FROST CUT!','ICE CROWN!','SPIKE ROW!','ICE WALL!','BLIZZARD!','GLACIER CRASH!','MIRROR STEP!','MIRROR CROSS!'),
 MLK('#ff8a2a','#4ff0ff','BOOST SLASH!','ROCKET UPPER!','DOUBLE POD!','MISSILE BARRAGE!','TWIN LASER!','GIGA BEAM!','BOOST DASH!','AFTERBURNER!'),
 MLK('#2fd8e8','#ffa060','TIDE THRUST!','GEYSER!','UNDERTOW PULL!','WHIRLPOOL!','TIDAL WAVE!','SEA SERPENT!','SPLASH STEP!','DOUBLE SPLASH!'),
 MLK('#ffd04d','#3fd0c0','TICK!','TOCK!','TWIN RINGS!','GEAR STORM!','TIME STOP!','REWIND!','TIME SKIP!','DOUBLE SKIP!'),
 MLK('#ffb020','#ff5a2a',"KING'S SWIPE!",'RISING CLAW!','TWIN CLAWS!','SPIRIT PRIDE!',"KING'S ROAR!",'SPIRIT LION!','PREDATOR POUNCE!','POUNCE X!'));
const MR=(k,nm,tip,ult)=>ult?{k,nm,tip,ult:1}:{k,nm,tip};
ROUTES.push(
 [MR('CCCM','STATIC STORM!','hammer hits call lightning, then a whole THUNDERSTORM'),MR('CCCMM','SKYFALL HAMMER!','thunderstorm, then one GIANT bolt splits the ground'),MR('CCCTT','CHAIN LIGHTNING!','twin hammers fly, then lightning jumps to everyone'),
  MR('TTTB','THUNDER STEP!','hammer throws, then ride a lightning bolt behind him'),MR('CCCCCM','VOLT BREAKER!','5 timed hammer blows (lightning from hit 4) into a thunderstorm'),
  MR('CCCTMBM','WRATH OF THE STORM','ULTIMATE: the sky goes dark, lightning rains, a leap into the clouds and a hammer slam that splits the earth',1)],
 [MR('CCCM','GOLDEN DRAGON!','spear chain, then a golden spirit dragon flies out'),MR('CCCMM','TWIN DRAGONS!','one spirit dragon… then TWO'),MR('CCCTT','DRAGON WHIRLWIND!','spear vault into a golden tornado'),
  MR('TTTC','RISING DRAGON SPEAR!','vaults, then a spear launcher'),MR('CCCBB','DRAGON DASH x2!','two spear-first dashes straight through him'),
  MR('CCCMMBT','HEAVENLY DRAGON EMPEROR','ULTIMATE: golden aura, a storm of spear thrusts, spirit dragons spiral up, a dive and a giant jade pillar',1)],
 [MR('CCCM','WING BURST!','flame chain, then a ring of fireballs'),MR('CCCMM','PHOENIX DIVE!','wing burst, then you fly through him as a fire bird'),MR('CCCTT','PHOENIX SPIRAL!','fire feathers, then a rising fire tornado'),
  MR('TTTBB','FLICKER X!','feathers, then two flame-flicker teleports'),MR('CCCCCM','SOLAR FLARE!','5 timed flame slashes into a wing burst'),
  MR('CCCTTMB','REBIRTH SUPERNOVA','ULTIMATE: fire wings blaze, you swoop through him again and again, then a giant fire X and a sun-bright pillar',1)],
 [MR('CCCM','BLIZZARD!','frozen chain, then a blizzard that keeps hitting'),MR('CCCMM','GLACIER CRASH!','blizzard, then a giant ice crystal falls from the sky'),MR('CCCTT','ICE WALL!','a row of ice spikes, then a whole wall'),
  MR('TTTB','MIRROR STEP!','ice spikes, then leave an ice mirror behind'),MR('CCCCCT','AVALANCHE ROW!','5 timed frost cuts into ice spikes'),
  MR('CCCMTBM','ETERNAL WINTER','ULTIMATE: a blizzard freezes him in ice, slashes from every side, then the greatsword shatters everything',1)],
 [MR('CCCT','MISSILE POD!','blade combo, then homing rockets'),MR('CCCTT','MISSILE BARRAGE!','12 rockets at once'),MR('CCCMM','GIGA BEAM!','twin lasers, then the GIGA BEAM'),
  MR('TTTB','AFTERBURNER!','rockets, then a thruster dash through him'),MR('CCCCCM','OVERDRIVE LASER!','5 timed blade hits into twin lasers'),
  MR('CCCTTMM','FINAL OVERDRIVE','ULTIMATE: missile storm, rocket flurry, a boosted leap and a giant energy-blade slam',1)],
 [MR('CCCM','TIDAL WAVE!','trident chain, then a wave rolls over him'),MR('CCCMM','SEA SERPENT!','tidal wave, then a giant water serpent'),MR('CCCTT','WHIRLPOOL!','water whip, then a whirlpool pulls him in'),
  MR('TTTB','SPLASH STEP!','water whips, then dive into a puddle and pop out behind'),MR('CCCCCT','UNDERTOW!','5 timed thrusts into an undertow pull'),
  MR('TTTMMBC',"OCEAN'S WRATH",'ULTIMATE: geysers lift him, the sea crashes in from both sides, then a trident slam with a giant water pillar',1)],
 [MR('CCCM','TIME STOP!','tick-tock chain, then freeze time and keep hitting'),MR('CCCMM','REWIND!','time stop, then rewind: every hit happens again'),MR('CCCTT','GEAR STORM!','clock rings fly in every direction'),
  MR('CCCBB','DOUBLE SKIP!','skip through time twice'),MR('CCCCCM','HOUR HAND!','5 timed strikes into a time stop'),
  MR('CCCMBMB','ZERO HOUR','ULTIMATE: time stops, a giant clock appears, you strike from all twelve hours, then time restarts all at once',1)],
 [MR('CCCM',"KING'S ROAR!",'claw chain, then a roar that blows everyone back'),MR('CCCMM','SPIRIT LION!','roar, then a giant golden spirit lion charges'),MR('CCCTT','SPIRIT PRIDE!','twin claws, then three spirit lions'),
  MR('TTTB','PREDATOR POUNCE!','spirit claws, then pounce from above'),MR('CCCCCT','PRIDE CLAWS!','5 timed claws into spirit claws'),
  MR('CCCTMMB','KING OF BEASTS','ULTIMATE: a mighty roar, spirit claws from every side, a pounce from the sky and a giant golden claw strike',1)]);
LKT.push(...[7,8,9,10,11,12,13,14].map(()=>({C:'slash',T:'mT',M:'mM',B:'tele'})));
function mLkFx(dt){const q=p.lk;if(!q)return;const t=p.t,at=T=>t>=T&&t-dt<T,X=mX(),rep=q.rep,tg=q.tg&&q.tg.alive?q.tg:null,dir=tg?Math.sign(tg.x-p.x)||p.face:p.face;
 if(q.ty==='mT'&&at(.07)){mMove(MTK[p.uf],rep?2:1,true);ulkHit(rep?'lkT2':'lkT',dir,420)}
 if(q.ty==='mM'&&at(.08)){mMove(MMK[p.uf],rep?2:1,true);ulkHit(rep?'lkM2':'lkM',dir,700)}
 if(q.ty==='slash'&&at(.06))mChainX(X,rep?6:4,{});
 if(q.ty==='tele'&&at(.04)){if(p.uf===7)mBolt(p.x,{hit:false});if(p.uf===9)mFireBurst(p.x,p.y-80,20);if(p.uf===10)mSnow(p.x,p.y-80,20);if(p.uf===12)mWater(p.x,GROUND,16);if(p.uf===13)mClock(p.x,p.y-100,110,.4);if(p.uf===14)mClaw(tg?tg.x:p.x+p.face*100,p.y-100,p.face,1.3,X.col);if(p.uf===11||p.uf===8)sLine(p.x-p.face*200,p.y-90,p.x,p.y-90,X.col,.3,12)}}
const _ufLkState14=ufLkState;ufLkState=function(dt){if(MY(p.uf))mLkFx(dt);return _ufLkState14(dt)};
const _ufRouteFx14=ufRouteFx;ufRouteFx=function(f,r){_ufRouteFx14(f,r);if(f>=11){const tg=lkTarget();mBig(f-4,tg?tg.x:p.x+p.face*120,0)}};
// ---- ULTIMATES ----
const MULT={7:['THE SKY DARKENS…','ZAP!'],8:['THE DRAGON AWAKENS…','JADE!'],9:['RISE FROM THE FLAMES…','FWOOSH!'],10:['WINTER IS HERE…','FREEZE!'],11:['OVERDRIVE ENGAGED…','BOOM!'],12:['THE TIDE TURNS…','SPLASH!'],13:['ZERO HOUR…','TICK!'],14:['THE KING ROARS…','CLAW!']};
const _ufUltStart14=ufUltStart;ufUltStart=function(f,r){const u=f-4;if(!MY(u))return _ufUltStart14(f,r);const X=UF[u],tg=lkTarget();act('lkult',uA('ultA'));p.ult={f,r,tg,boom:false,hits:0,k:0,x0:p.x,u};p.vx=0;p.vy=0;p.rot=0;
 NAMES.lkU=MULT[u][1];NAMES.lkUfin='KA-BOOM!!';LK.on=false;LK.seq='';LK.n=0;LK.buf=null;cineGo(1.32,.5);slowT=.12;flashT=.15;shake=10;beat(1320,.06);lkSay(MULT[u][0],X.col2);
 if(u===7||u===13)M14.dark=3;if(u===10)M14.bliz={x:tg?tg.x:p.x+p.face*170,l:1.5,tk:0,keep:1,cos:1};if(u===13){M14.tstop=1.85;M14.hitTS.clear();mClock(VW/2,-camY+300,360,1.9)}if(u===14){for(let k=0;k<4;k++)R9.rings.push({x:p.x,y:p.y-110,r:20+k*30,vr:1100,l:1,col:k%2?X.col2:X.col,w:14,f:18,face:0});noiseS(.4,200,80,.1)}
 for(let i=0;i<4;i++)waves.push({x:p.x,y:p.y-30*i,r:10+i*20,l:1,big:true})};
const _ufUltState14=ufUltState;ufUltState=function(dt){const u=p.ult;if(!u||!MY(u.u))return _ufUltState14(dt);const t=p.t,K=u.u,X=UF[K],g=u.tg&&u.tg.alive?u.tg:null,at=T=>t>=T&&t-dt<T,e=x=>x*x*(3-2*x);p.rot=0;p.vx=0;p.vy=0;
 const gx=g?g.x:clampX(p.x+p.face*170);
 if(g&&!u.boom){g.vx=0;g.vy=0;g.fl=.6;g.hp=Math.max(3,g.hp);const gy=t<1?GROUND-150-Math.min(1,t)*90:GROUND-120;g.y+=(gy-g.y)*Math.min(1,dt*(t<1?5:10));g.x+=(gx-g.x)*.1;if(K===10)mFreeze(g,.3)}
 if(t<.65){p.y+=(GROUND-p.y)*Math.min(1,dt*9);p.ground=p.y>GROUND-2;if(at(.32))setAnim(uA('ultB'),true);
  if(t%.03<dt){const a=Math.random()*6.283,R=150;sparks.push({x:p.x+Math.cos(a)*R,y:p.y-80+Math.sin(a)*R,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.45,c:Math.random()<.5?X.col:X.col2})}
  if(at(.3)){if(K===7)mBolt(p.x,{hit:false,w:1.4});if(K===9)mFireBurst(p.x,p.y-90,50,1.4);if(K===11)mMove('missiles',2,true);if(K===12){mPillar(gx,'#2fd8e8',90,.7);mWater(gx,GROUND,30)}if(K===8)mBig(8,p.x,0)}}
 else if(t<1.5){u.k-=dt;if(g&&u.k<=0){u.k=.085;u.hits++;C.atk++;hitDummy(g,'lkU',p.face);if(M14.tstop>0)M14.hitTS.add(g);g.vx=0;g.vy=0;const fx0=p.x,fy0=p.y,n=u.hits;
   const a=K===13?n/12*6.283-Math.PI/2:n*2.3;p.x=clampX(gx+Math.cos(a)*(K===13?150:125));p.y=Math.min(GROUND,(K===13?GROUND-130:GROUND-60)+Math.sin(a)*(K===13?120:70));p.face=gx>p.x?1:-1;
   setAnim(uA(['h1','h3','h5','h7','h2','h4','h6'][n%7]),true);sLine(fx0,fy0-80,p.x,p.y-80,n%2?X.col:X.col2,.35,9);
   switch(K){case 7:if(n%2)mBolt(gx+(Math.random()-.5)*80,{hit:false});break;case 8:sLine(p.x,p.y-90,gx,g.y-120,X.col,.25,12);break;case 9:mFireBurst(p.x,p.y-80,10);break;case 10:if(n%2)mSpike(gx+(n%4-1.5)*90,{h:140,hit:false,l:.6});mSnow(gx,g.y-140,8);break;
    case 11:if(n%3===0)mP({k:'mrock',x:p.x,y:p.y-120,vx:(Math.random()-.5)*400,vy:-500,l:1.5,s:.8,kb:'mrocket',boom:1,home:.4,cos:1});break;case 12:if(n%3===0)mPillar(gx+(Math.random()-.5)*160,'#2fd8e8',50,.4);mWater(gx,g.y-100,6);break;
    case 13:mClock(p.x,p.y-90,50,.3,n%2?'#ffd04d':'#3fd0c0');ghosts.push({x:p.x,y:p.y,f:uFr('h5'),face:p.face,l:1.2,blue:1});break;case 14:mClaw(gx,g.y-140+(Math.random()-.5)*60,p.face,1.2,n%2?X.col:X.col2);break}}}
 else if(t<1.85){p.face=gx>=p.x?1:-1;const up=t<1.72,u3=up?e((t-1.5)/.22):e((t-1.72)/.13);setAnim(uA(up?'ultC':'ultD'));p.x+=((gx-p.face*90)-p.x)*Math.min(1,dt*8);p.y=up?GROUND-340*u3:Math.min(GROUND,GROUND-340+340*u3);p.ground=false;
  if(t%.03<dt)uGhost(up?'ultC':'ultD',.25);if(at(1.5)){cine.tz=1.6;cine.tdim=.6;if(K===13){M14.tstop=0}}}
 else{p.y=GROUND;p.ground=true;
  if(!u.boom){u.boom=true;setAnim(uA('ultE'),true);uBoom(gx,X.col,X.col2,u.f);mBig(K,gx,1);if(g){g.hp=Math.min(g.hp,1);hitDummy(g,'lkUfin',p.face);g.vy=-2500;g.vx=p.face*260;g.fl=1}card(u.r.nm+'!!','ULTIMATE · '+u.r.k.split('').join(' '),X.col)}
  if(t>2.3&&p.anim!==uA('ultF'))setAnim(uA('ultF'));if(t>3){p.state='normal';p.ult=null;LK.lastT=now;M14.bliz=null}}};
// ---- MYTHIC UNLOCKS (later than the legends: big EXP and Big Bruno milestones) ----
UNLK.push({k:'ko',n:5,txt:'Knock out Big Bruno 5 times'},{k:'exp',n:3000,txt:'Earn 3000 EXP'},{k:'ult',n:10,txt:'Land 10 ULTIMATES'},{k:'ko',n:8,txt:'Knock out Big Bruno 8 times'},
 {k:'exp',n:5000,txt:'Earn 5000 EXP'},{k:'tkd',n:8,txt:'Do 8 stealth takedowns in Hunt mode'},{k:'ult',n:25,txt:'Land 25 ULTIMATES'},{k:'ko',n:12,txt:'Knock out Big Bruno 12 times'});
if(/[?&](mythic|legends)/.test(location.search))UNL.d.tryMyth=true;
UNL.ok=function(u){return this.has(u)||(u>6?!!this.d.tryMyth:!!this.d.tryAll)};
const _chk14=UNL.check;UNL.check=function(){_chk14.call(this);for(let u=7;u<UF.length;u++)if(!this.has(u)&&this.d[UNLK[u].k]>=UNLK[u].n){this.d.got.push(u);this.save();const X=UF[u];
 let _tr=0;const _show=()=>{if(_tr++<16&&(CINE.includes(p.state)||p.state==='lkult')){setTimeout(_show,500);return}card('MYTHIC UNLOCKED!',X.ico+' '+X.nm+' · press 🔄 or open ? → MYTHIC',X.col);
  for(let i=0;i<60;i++){const a=Math.random()*6.283,v=200+Math.random()*500;R9.confetti.push({x:VW/2,y:-camY+150,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:2.2,c:[X.col,X.col2,'#fff'][i%3],heart:0})}beat(1568,.06);setTimeout(()=>beat(2093,.06),120);setTimeout(()=>beat(2637,.06),240)};setTimeout(_show,900);
 if(typeof buildList==='function')buildList()}};
// ---- switching / cycling / keys ----
const _cycle14=cycleForm;cycleForm=function(){if(p.morphWait&&p.morphWait.f<5)return _cycle14();const L=[0,1,2,3,4];for(let u=1;u<UF.length;u++)if(UNL.ok(u))L.push(4+u);
 const cur=p.morphWait?p.morphWait.f:FORM(),i=L.indexOf(cur),nx=L[(i+1)%L.length];if(nx===0&&FORM()!==0)setForm(0);else if(nx!==FORM())setForm(nx)};
function mythCycle(){const L=[];for(let u=7;u<UF.length;u++)if(UNL.ok(u))L.push(4+u);if(!L.length){say('🔒 No Mythic forms yet – open ? → MYTHIC','#ffe08a',true);return}const i=L.indexOf(FORM());setForm(L[(i+1)%L.length])}
Object.assign(map,{Numpad1:'uf7',Numpad2:'uf8',Numpad3:'uf9',Numpad4:'uf10',Numpad5:'uf11',Numpad6:'uf12',Numpad7:'uf13',Numpad8:'uf14',KeyP:'mcyc'});INSTANT.push('uf7','uf8','uf9','uf10','uf11','uf12','uf13','uf14','mcyc');
FCOL.push(...UF.slice(7).map(x=>x.col));FNAME.push(...UF.slice(7).map(x=>x.nm.replace(/ PADDY$/,'')+' PADDY'));
for(const k in TKA)TKA[k].push(...MPRE.map(q=>q+'_'+({leap:'rise',bonk:'dive',drop:'dive',trip:'tail'}[k]||'rise')));
// ---- per-frame upkeep ----
function r14Pre(dt){
 for(let u=7;u<UF.length;u++)if(P['uf'+u])setForm(4+u);if(P.mcyc)mythCycle();
 M14.dark=Math.max(0,M14.dark-dt);
 if(M14.slow>0){M14.slow-=dt;for(const d of dummies)if(d.alive){d.vx*=Math.pow(.2,dt);d.cool=Math.max(d.cool||0,.4)}}
 const wasTS=M14.tstop>0;if(M14.tstop>0){M14.tstop-=dt;for(const d of dummies)if(d.alive){d.vx=0;d.vy=0;d.cool=Math.max(d.cool||0,.3)}}
 if(wasTS&&M14.tstop<=0){const L=[...M14.hitTS].filter(d=>d.alive);M14.hitTS.clear();if(L.length&&p.state!=='lkult'){say('…AND TIME RESUMES!','#ffe9a0',true);for(const d of L){d.hp=Math.max(2,d.hp);hitDummy(d,'mresume',Math.sign(d.x-p.x)||p.face);d.vy=-1000;spark(d.x,d.y-100,20,['#ffd04d','#3fd0c0','#fff'],420)}shake=Math.max(shake,16)}}
 {const cin=CINE.includes(p.state)||/ult|fin/.test(p.state||'');for(const d of dummies){if(d.y<GROUND-1500)d.vy=Math.max(d.vy,200);else if(!cin&&d.y<GROUND-800){if(d.vy<0)d.vy*=Math.pow(.0005,dt);if(d.y<GROUND-950){d.y+=(GROUND-950-d.y)*Math.min(1,dt*5);d.vy=Math.max(d.vy,0)}}}
  // soft ceiling for Paddy too (endless air-mash climbing), never during ultimates/finishers
  if(!cin&&p.y<GROUND-1100){p.y+=(GROUND-1100-p.y)*Math.min(1,dt*5);p.vy=Math.max(p.vy,40)}}
 if(MY(p.uf)){if(p.y<GROUND-1600&&p.state!=='lkult'&&p.state!=='ufin')p.vy=Math.max(p.vy,300)}
 for(const d of dummies){if(d.mfz>0){d.mfz-=dt;d.vx*=Math.pow(.001,dt);if(d.y<GROUND-4)d.vy=Math.min(d.vy,120)}}
 for(const e of M14.echo){e.t-=dt;if(e.t<=0&&!e.done){e.done=1;const d=e.d&&e.d.alive?e.d:uNear(340);if(d){ghosts.push({x:d.x-p.face*90,y:p.y,f:uFr('h'+(1+Math.floor(Math.random()*7))),face:p.face,l:.35,blue:1});mHit(d,'mtime',Math.sign(d.x-p.x)||p.face,e.keep);mClock(d.x,d.y-120,50,.3)}}}M14.echo=M14.echo.filter(e=>!e.done);
 if(M14.bliz){const b=M14.bliz;b.l-=dt;b.tk-=dt;for(let k=0;k<4;k++)sparks.push({x:b.x+(Math.random()-.5)*520,y:GROUND-300+Math.random()*280,vx:-300-Math.random()*200,vy:80+Math.random()*120,l:.5,c:Math.random()<.6?'#fff':'#bfefff'});
  if(b.tk<=0&&!b.cos){b.tk=.2;for(const d of dummies)if(d.alive&&Math.abs(d.x-b.x)<280){if(b.keep)d.hp=Math.max(2,d.hp);mHit(d,'mice',Math.sign(d.x-b.x)||p.face);mFreeze(d,.4)}}if(b.l<=0)M14.bliz=null}
 if(M14.pool){const w=M14.pool;w.l-=dt;w.tk-=dt;for(const d of dummies)if(d.alive&&Math.abs(d.x-w.x)<420){d.x+=(w.x-d.x)*Math.min(1,dt*4);if(w.tk<=0){if(w.keep)d.hp=Math.max(2,d.hp);mHit(d,'mwater',Math.sign(w.x-d.x)||p.face)}}if(w.tk<=0)w.tk=.22;
  if(Math.random()<.8)mWater(w.x+(Math.random()-.5)*160,GROUND-10,2);if(w.l<=0)M14.pool=null}
 for(const s of M14.spikes){if(s.d>0){s.d-=dt;continue}s.t+=dt;s.l-=dt;if(!s.done){s.done=1;mSnow(s.x,GROUND-40,6);if(s.hit)for(const d of dummies)if(d.alive&&Math.abs(d.x-s.x)<70){if(s.keep)d.hp=Math.max(2,d.hp);mHit(d,s.kb,Math.sign(d.x-p.x)||p.face);if(d.y>GROUND-200)d.vy=Math.min(d.vy,-700);mFreeze(d,s.frz)}}}M14.spikes=M14.spikes.filter(s=>s.l>0);
 for(const b of M14.bolts)b.l-=dt;M14.bolts=M14.bolts.filter(b=>b.l>0);for(const c of M14.claws)c.l-=dt;M14.claws=M14.claws.filter(c=>c.l>0);for(const c of M14.clocks){c.l-=dt;c.a+=dt*6}M14.clocks=M14.clocks.filter(c=>c.l>0);
 // my projectiles (fx:1 so the legend code only moves them; hits + special motion here)
 for(const o of U.proj){if(!o.my)continue;o.age+=dt;o.tr.push([o.x,o.y]);if(o.tr.length>16)o.tr.shift();
  if(o.k==='mham'&&o.ret&&o.age>.4){const dx=p.x-o.x,dy=(p.y-110)-o.y,dd=Math.hypot(dx,dy)||1;o.vx+=(dx/dd*2200-o.vx)*Math.min(1,dt*5);o.vy+=(dy/dd*2200-o.vy)*Math.min(1,dt*5);if(dd<70&&o.age>.6)o.l=0;if(Math.random()<.5)sparks.push({x:o.x,y:o.y,vx:0,vy:0,l:.25,c:'#9fd8ff'})}
  if(o.k==='mrib'){if(o.spiral!=null){o.vx=Math.cos(o.age*7+o.ph)*500;o.vy=Math.min(o.vy+0,-700)}else o.vy=Math.cos(o.age*9+o.ph)*o.amp*9;if(Math.random()<.6)sparks.push({x:o.x,y:o.y,vx:0,vy:0,l:.3,c:o.water?'#bff8ff':'#fff2a8'})}
  if(o.k==='mtor'){o.y=GROUND;if(o.fire){o.x=p.x}for(let k=0;k<2;k++)sparks.push({x:o.x+(Math.random()-.5)*80,y:GROUND-Math.random()*260,vx:(Math.random()-.5)*300,vy:-200-Math.random()*200,l:.4,c:o.fire?(k?'#ff7a1a':'#ffe14d'):(k?o.col:'#fff')})}
  if(o.k==='mrock'){if(o.fall){o.vy+=1200*dt}else if(o.age>o.home){const g=uNear(1200);if(g){const dx=g.x-o.x,dy=(g.y-120)-o.y,dd=Math.hypot(dx,dy)||1;o.vx+=(dx/dd*1500-o.vx)*Math.min(1,dt*6);o.vy+=(dy/dd*1500-o.vy)*Math.min(1,dt*6)}}else o.vy+=900*dt;
   sparks.push({x:o.x,y:o.y,vx:-o.vx*.1,vy:-o.vy*.1,l:.35,c:Math.random()<.5?'#ffb050':'#ddd'});if(o.fall&&o.y>=GROUND-20){o.l=0;mExplode(o)}}
  if(o.k==='mglac'){o.vy+=2200*dt;if(o.y>=GROUND-60){o.l=0;mBig(10,o.x,0);for(const d of dummies)if(d.alive&&Math.abs(d.x-o.x)<260){if(o.keep)d.hp=Math.max(2,d.hp);mHit(d,'mbig',Math.sign(d.x-o.x)||p.face);mFreeze(d,1)}boom();shake=Math.max(shake,24);R9.cracks.push(mkCrack(o.x,14))}}
  if(o.k==='mwave'||o.k==='mlion'){o.y=GROUND;if(o.k==='mwave')mWater(o.x,GROUND-30*o.s,1)}
  if(o.k==='mbird'||o.k==='mball'){if(Math.random()<.9)sparks.push({x:o.x-o.vx*.03,y:o.y+(Math.random()-.5)*30*o.s,vx:-o.vx*.15,vy:(Math.random()-.5)*120,l:.4,c:Math.random()<.5?'#ff7a1a':'#ffe14d'})}
  if(o.k==='mbub')o.vy-=120*dt;
  if(o.cos)continue;o.tick-=dt;if(o.tick<=0&&o.tick>-9&&['mham','mrib','mtor','mwave','mlion','mbird','mgear'].includes(o.k)){o.tick=.14;o.hit.clear()}
  const R=(o.k==='mtor'?90:o.k==='mwave'?80:o.k==='mlion'?90:o.k==='mbird'?80:o.k==='mrib'?60:40)*o.s;
  for(const d of dummies){if(!d.alive||o.hit.has(d))continue;const cy=['mtor','mwave','mlion'].includes(o.k)?d.y-60:o.y;if(Math.abs(d.x-o.x)<R+30&&cy>d.y-(d.h||150)-R*.5&&cy<d.y+20+R*.5){o.hit.add(d);if(o.keep)d.hp=Math.max(2,d.hp);mHit(d,o.kb,Math.sign(o.vx)||o.face);
    if(o.k==='mshard')mFreeze(d,.6);if(o.k==='mtor'&&d.y>GROUND-250){d.vy=Math.min(d.vy,-500)}if(o.k==='mbub'){d.vy=-260;mWater(o.x,o.y,8);o.l=0}if(o.boom){o.l=0;mExplode(o)}}}}}
function mExplode(o){const X=o.k==='mball'||o.k==='mbird';burst(o.x,o.y,X);waves.push({x:o.x,y:o.y,r:8,l:.6,big:false});shake=Math.max(shake,8);if(!o.cos)areaHit(o.x,o.y,90,o.kb);if(X)mFireBurst(o.x,o.y,14)}
const _r9Pre14=r9Pre;r9Pre=function(dt){r14Pre(dt);_r9Pre14(dt)};
// ---- drawing ----
function mRibbon(o,a){const tr=o.tr;if(tr.length<2)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
 for(let pass=0;pass<2;pass++){ctx.strokeStyle=pass?'#fff':o.col;for(let i=1;i<tr.length;i++){const k=i/tr.length;ctx.globalAlpha=a*k*(pass?.7:.9);ctx.lineWidth=(pass?8:26)*o.s*k;ctx.beginPath();ctx.moveTo(tr[i-1][0],tr[i-1][1]);ctx.lineTo(tr[i][0],tr[i][1]);ctx.stroke()}}
 const h=tr[tr.length-1],ang=Math.atan2(o.vy,o.vx);ctx.translate(h[0],h[1]);ctx.rotate(ang);ctx.globalAlpha=a;const R=22*o.s;const g=ctx.createRadialGradient(0,0,2,0,0,R*1.6);g.addColorStop(0,'#fff');g.addColorStop(.4,o.col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R*1.6,0,6.283);ctx.fill();
 ctx.strokeStyle=o.col2||'#fff';ctx.lineWidth=3*o.s;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(-R*.4,s*R*.5);ctx.quadraticCurveTo(-R*1.4,s*R*1.6,-R*2.2,s*R*1.2);ctx.stroke()}
 if(!o.water){ctx.fillStyle=o.col2||'#fff';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(-R*.2,s*R*.6);ctx.lineTo(-R*1.1,s*R*1.3);ctx.lineTo(-R*.5,s*R*.4);ctx.fill()}}
 ctx.fillStyle='#1a2a3a';ctx.beginPath();ctx.arc(R*.35,-R*.3,R*.14,0,6.283);ctx.arc(R*.35,R*.3,R*.14,0,6.283);ctx.fill();ctx.restore()}
function mSpirit(o,a,k){const fr=(FR[o.fr||'mbk_run']||[])[Math.floor(o.age*12)%6];if(!fr||!imgOK(IMG[fr.f]))return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(o.x,o.y+8);ctx.scale(o.s,o.s);drawFrame(fr,0,0,Math.sign(o.vx)||o.face,a*.55);ctx.restore()}
function r14Draw(){
 if(M14.dark>0){ctx.save();ctx.globalAlpha=Math.min(.45,M14.dark*.3);ctx.fillStyle='#0b1430';ctx.fillRect(-200,-camY-400,VW+400,GROUND+camY+800);ctx.restore()}
 if(M14.tstop>0){ctx.save();ctx.globalAlpha=Math.min(.35,M14.tstop*.6);ctx.fillStyle='#4a5070';ctx.globalCompositeOperation='saturation';ctx.fillRect(-200,-camY-400,VW+400,GROUND+camY+800);ctx.restore();ctx.save();ctx.globalAlpha=Math.min(.18,M14.tstop*.3);ctx.fillStyle='#ffe9a0';ctx.fillRect(-200,-camY-400,VW+400,GROUND+camY+800);ctx.restore()}
 for(const c of M14.clocks){const a=Math.min(1,c.l/c.l0*2);ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(c.x,c.y);ctx.globalAlpha=a*.85;ctx.strokeStyle=c.col;ctx.lineWidth=Math.max(3,c.R*.04);ctx.beginPath();ctx.arc(0,0,c.R,0,6.283);ctx.stroke();ctx.globalAlpha=a*.4;ctx.beginPath();ctx.arc(0,0,c.R*.86,0,6.283);ctx.stroke();ctx.globalAlpha=a*.85;
  for(let k=0;k<12;k++){const q=k/12*6.283;ctx.lineWidth=k%3?3:7;ctx.beginPath();ctx.moveTo(Math.cos(q)*c.R*.8,Math.sin(q)*c.R*.8);ctx.lineTo(Math.cos(q)*c.R*.95,Math.sin(q)*c.R*.95);ctx.stroke()}
  ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,c.R*.035);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(c.a)*c.R*.75,Math.sin(c.a)*c.R*.75);ctx.stroke();ctx.lineWidth=Math.max(4,c.R*.05);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(c.a/12)*c.R*.5,Math.sin(c.a/12)*c.R*.5);ctx.stroke();ctx.restore()}
 for(const b of M14.bolts){const a=Math.min(1,b.l*5);ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';for(const [w,c,al] of [[22*b.w,b.col,.35],[9*b.w,b.col,.9],[3.5*b.w,'#fff',1]]){ctx.globalAlpha=a*al;ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();b.pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}ctx.restore()}
 for(const s of M14.spikes){if(s.d>0)continue;const up=Math.min(1,s.t*9),a=Math.min(1,s.l*3),h=s.h*up;ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,GROUND+4);
  const g=ctx.createLinearGradient(0,-h,0,0);g.addColorStop(0,'#ffffff');g.addColorStop(.5,s.col);g.addColorStop(1,'#5fb8e8');ctx.fillStyle=g;ctx.strokeStyle='#e8faff';ctx.lineWidth=2;
  for(const [dx,sc] of [[-22,.6],[22,.7],[0,1]]){ctx.beginPath();ctx.moveTo(dx-18*sc-6,0);ctx.lineTo(dx+(dx?dx*.3:0),-h*sc);ctx.lineTo(dx+18*sc+6,0);ctx.closePath();ctx.fill();ctx.stroke()}ctx.restore()}
 for(const c of M14.claws){const a=Math.min(1,c.l*4),u=1-c.l/.4;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(c.x,c.y);ctx.scale(c.face*c.s,c.s);ctx.lineCap='round';
  for(let k=-1;k<=1;k++){for(const [w,col,al] of [[16,c.col,.5],[6,'#fff',1]]){ctx.globalAlpha=a*al;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();const L=Math.min(1,u*3);ctx.moveTo(-40+k*26,-60);ctx.quadraticCurveTo(10+k*26,0,(-40+90*L)+k*26,-60+120*L);ctx.stroke()}}ctx.restore()}
 if(M14.pool){const w=M14.pool,a=Math.min(1,w.l*2);ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(w.x,GROUND-10);ctx.scale(1,.28);for(let k=0;k<4;k++){ctx.globalAlpha=a*(.5-k*.08);ctx.strokeStyle=k%2?'#fff':'#2fd8e8';ctx.lineWidth=12;ctx.beginPath();ctx.arc(0,0,60+k*55,now*6+k,now*6+k+4.4);ctx.stroke()}ctx.restore()}
 for(const d of dummies)if(d.mfz>0&&d.alive){ctx.save();ctx.globalAlpha=Math.min(.55,d.mfz*1.5);ctx.fillStyle='#bfefff';ctx.strokeStyle='#fff';ctx.lineWidth=3;const H=(d.h||150)+20;ctx.beginPath();ctx.moveTo(d.x-80,d.y+6);ctx.lineTo(d.x-90,d.y-H*.6);ctx.lineTo(d.x-40,d.y-H);ctx.lineTo(d.x+50,d.y-H*.95);ctx.lineTo(d.x+90,d.y-H*.5);ctx.lineTo(d.x+80,d.y+6);ctx.closePath();ctx.fill();ctx.globalAlpha*=1.4;ctx.stroke();ctx.restore()}
 for(const o of U.proj){if(!o.my)continue;const a=Math.min(1,o.l*4);
  if(o.k==='mrib'){mRibbon(o,a);continue}if(o.k==='mlion'){mSpirit(o,a);continue}
  ctx.save();ctx.translate(o.x,o.y);ctx.globalAlpha=a;
  if(o.k==='mham'){ctx.rotate(o.age*20*o.face);ctx.fillStyle='#8aa0c8';ctx.strokeStyle='#e8f6ff';ctx.lineWidth=3;ctx.fillRect(-6,-4,46,8);ctx.fillRect(-34*o.s,-22*o.s,30*o.s,44*o.s);ctx.strokeRect(-34*o.s,-22*o.s,30*o.s,44*o.s);ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#4aa8ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,48*o.s,0,6.283);ctx.globalAlpha=a*.35;ctx.stroke()}
  else if(o.k==='mtor'){ctx.globalCompositeOperation='lighter';for(let k=0;k<7;k++){const y=-k*42*o.s,r=(30+k*16)*o.s;ctx.globalAlpha=a*.5;ctx.strokeStyle=k%2?(o.col2||'#fff'):o.col;ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(Math.sin(o.age*14+k)*14,y,r,r*.28,0,o.age*12+k,o.age*12+k+4.6);ctx.stroke()}}
  else if(o.k==='mfeather'){ctx.globalCompositeOperation='lighter';ctx.rotate(Math.atan2(o.vy,o.vx));const g=ctx.createLinearGradient(-40,0,20,0);g.addColorStop(0,'rgba(255,90,20,0)');g.addColorStop(1,'#ffe14d');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(-10,0,34*o.s,9*o.s,0,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(8,0,10,4,0,0,6.283);ctx.fill()}
  else if(o.k==='mball'||o.k==='mplasma'){ctx.globalCompositeOperation='lighter';const R=30*o.s,g=ctx.createRadialGradient(0,0,2,0,0,R);g.addColorStop(0,'#fff');g.addColorStop(.35,o.k==='mball'?'#ffe14d':'#bffcff');g.addColorStop(1,o.k==='mball'?'rgba(255,100,20,0)':'rgba(79,240,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R,0,6.283);ctx.fill()}
  else if(o.k==='mbird'){ctx.globalCompositeOperation='lighter';ctx.scale((Math.sign(o.vx)||o.face)*o.s,o.s);const fl=Math.sin(o.age*22)*.5;const g=ctx.createRadialGradient(0,0,4,0,0,70);g.addColorStop(0,'#fff');g.addColorStop(.3,'#ffe14d');g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,46,18,0,0,6.283);ctx.fill();
   ctx.fillStyle='rgba(255,140,30,.85)';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(-10,0);ctx.quadraticCurveTo(-30,s*(60+fl*30),-80,s*(70+fl*40));ctx.quadraticCurveTo(-40,s*20,-10,0);ctx.fill()}ctx.beginPath();ctx.moveTo(-40,0);ctx.lineTo(-110,-16);ctx.lineTo(-95,0);ctx.lineTo(-110,16);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(30,-4,7,0,6.283);ctx.fill()}
  else if(o.k==='mshard'){ctx.rotate(Math.atan2(o.vy,o.vx));ctx.fillStyle='#e8faff';ctx.strokeStyle='#7fdcff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(28*o.s,0);ctx.lineTo(-8,-9*o.s);ctx.lineTo(-22*o.s,0);ctx.lineTo(-8,9*o.s);ctx.closePath();ctx.fill();ctx.stroke()}
  else if(o.k==='mglac'){ctx.scale(o.s,o.s);const g=ctx.createLinearGradient(0,-120,0,60);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#7fdcff');ctx.fillStyle=g;ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,70);ctx.lineTo(-55,-10);ctx.lineTo(-30,-110);ctx.lineTo(30,-120);ctx.lineTo(60,-20);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=a*.5;ctx.beginPath();ctx.moveTo(-20,-90);ctx.lineTo(0,50);ctx.stroke()}
  else if(o.k==='mrock'){ctx.rotate(Math.atan2(o.vy,o.vx));ctx.fillStyle='#f4f0e8';ctx.fillRect(-18*o.s,-6*o.s,30*o.s,12*o.s);ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.moveTo(12*o.s,-6*o.s);ctx.lineTo(24*o.s,0);ctx.lineTo(12*o.s,6*o.s);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ffe14d';ctx.beginPath();ctx.ellipse(-24*o.s,0,10*o.s,5*o.s,0,0,6.283);ctx.fill()}
  else if(o.k==='mwave'){ctx.scale((Math.sign(o.vx)||o.face)*o.s,o.s);const g=ctx.createLinearGradient(0,-110,0,0);g.addColorStop(0,'#e6ffff');g.addColorStop(1,'#2fb8d8');ctx.fillStyle=g;ctx.globalAlpha=a*.85;ctx.beginPath();ctx.moveTo(-120,0);ctx.quadraticCurveTo(-40,-40,10,-100);ctx.quadraticCurveTo(50,-120,60,-80);ctx.quadraticCurveTo(30,-90,30,-60);ctx.quadraticCurveTo(40,-20,70,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(10,-100);ctx.quadraticCurveTo(50,-120,60,-80);ctx.stroke()}
  else if(o.k==='mbub'){ctx.strokeStyle='#bff8ff';ctx.lineWidth=3;ctx.fillStyle='rgba(120,230,255,.25)';ctx.beginPath();ctx.arc(0,0,22*o.s,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-7*o.s,-7*o.s,5*o.s,0,6.283);ctx.fill()}
  else if(o.k==='mgear'){ctx.rotate(o.age*10);ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ffd04d';ctx.lineWidth=6;const R=30*o.s;ctx.beginPath();ctx.arc(0,0,R,0,6.283);ctx.stroke();for(let k=0;k<8;k++){const q=k/8*6.283;ctx.beginPath();ctx.moveTo(Math.cos(q)*R,Math.sin(q)*R);ctx.lineTo(Math.cos(q)*(R+12),Math.sin(q)*(R+12));ctx.stroke()}ctx.strokeStyle='#3fd0c0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-R*.7);ctx.moveTo(0,0);ctx.lineTo(R*.5,0);ctx.stroke()}
  ctx.restore()}}
const _drawFx14=drawFx;drawFx=function(){_drawFx14();r14Draw()};
// ---- ambient element touches while in a mythic form ----
function r14Amb(dt){if(!MY(p.uf))return;const X=mX(),r=Math.random();
 if(p.uf===9&&!p.ground&&K.jump&&p.vy>0){p.vy=Math.min(p.vy,140);if(r<.5)mFireBurst(p.x-p.face*30,p.y-80,2,.5)}
 if(r<dt*6){const x=p.x+(Math.random()-.5)*90,y=p.y-40-Math.random()*130;
  if(p.uf===7)sparks.push({x,y,vx:(Math.random()-.5)*200,vy:(Math.random()-.5)*200,l:.15,c:'#bfe6ff'});if(p.uf===9)sparks.push({x,y,vx:0,vy:-120,l:.5,c:'#ffb040'});if(p.uf===10)sparks.push({x,y,vx:(Math.random()-.5)*40,vy:60,l:.7,c:'#fff'});
  if(p.uf===12)sparks.push({x,y,vx:0,vy:-60,l:.6,c:'#bff8ff'});if(p.uf===13)sparks.push({x,y,vx:(Math.random()-.5)*60,vy:-40,l:.5,c:r<dt*3?'#ffd04d':'#3fd0c0'});if(p.uf===14||p.uf===8)sparks.push({x,y,vx:0,vy:-50,l:.4,c:X.col})}
 if(p.uf===11&&(!p.ground||Math.abs(p.vx)>200)&&r<.6)sparks.push({x:p.x-p.face*40,y:p.y-20,vx:-p.face*100,vy:200+Math.random()*200,l:.25,c:r<.3?'#ff8a2a':'#ffe14d'})}
const _r9Pre14b=r9Pre;r9Pre=function(dt){_r9Pre14b(dt);r14Amb(dt)};
// ---- TIERS + MYTHIC panel in the ? menu (+ combo list tabs) ----
window.UFTABS.push(...UF.slice(7).map(x=>[x.ico+' '+x.nm.replace(/ PADDY$/,'').split(' ').pop(),x.col]));
(function(){const st=document.createElement('style');st.textContent=`#mythic{background:linear-gradient(135deg,#241a48,#10233f);border:2px solid #7fe8ff;border-radius:12px;padding:8px 10px;margin:6px 0 10px;box-shadow:0 0 18px #4ff0ff55}#mythic h3{color:#7fe8ff!important}
#mythic .lg{display:flex;align-items:center;gap:8px;padding:5px 4px;border-bottom:1px solid #ffffff22}#mythic .lg .ic{font-size:26px;width:34px;text-align:center}#mythic .lg.lock{opacity:.6}#mythic .lg .nm{font:20px Bangers,Impact,sans-serif;letter-spacing:1px}
#mythic .bar{height:7px;background:#ffffff22;border-radius:4px;overflow:hidden;margin-top:3px}#mythic .bar i{display:block;height:100%;background:linear-gradient(90deg,#7fe8ff,#ffe14d)}#mythic .lg button{margin-left:auto;white-space:nowrap}#mythic .stat{font-size:13px;color:#cfd8ff}
#tiers{background:#151a30;border:2px solid #ffffff44;border-radius:12px;padding:6px 10px;margin:6px 0 10px}#tiers .tr{display:flex;gap:8px;align-items:center;padding:3px 0;border-bottom:1px solid #ffffff14;font-size:14px}#tiers .tn{font:18px Bangers,Impact,sans-serif;letter-spacing:1px;min-width:118px}
#tiers .asc{background:linear-gradient(90deg,#3a2a00,#1a1040);border-radius:8px;padding:5px 6px;margin-top:4px}#tiers .ascimg{position:relative;width:84px;height:112px;flex:none;border-radius:8px;overflow:hidden;border:2px solid #ffe9a0;box-shadow:0 0 16px #ffd76a88}#tiers .ascimg img{width:100%;height:100%;object-fit:cover;filter:brightness(.5) saturate(.7) blur(1.5px)}#tiers .ascimg b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;text-shadow:0 0 10px #000}`;document.head.appendChild(st)})();
function tiersHTML(){const nL=[1,2,3,4,5,6].filter(u=>UNL.has(u)).length,nM=[7,8,9,10,11,12,13,14].filter(u=>UNL.has(u)).length;
 const row=(c,n,t)=>`<div class="tr"><span class="tn" style="color:${c}">${n}</span><span>${t}</span></div>`;
 return `<div id="tiers"><h3>🐾 FORM TIERS</h3>`+row('#ffe08a','🐱 ALLEY CAT','Kitty · Neon Ninja <span class="tip">(start)</span>')+row('#ff9a6b','🗡️ PROWLER','Samurai · Knight · Pirate')+
  row('#ffe14d','🏆 LEGEND',UF.slice(1,7).map(x=>x.ico).join(' ')+` <span class="tip">${nL}/6 unlocked</span>`)+row('#7fe8ff','🌌 MYTHIC',UF.slice(7).map(x=>x.ico).join(' ')+` <span class="tip">${nM}/8 unlocked</span>`)+
  `<div class="tr asc"><div class="ascimg"><img src="assets/ascended_lock.webp?v=${VER}" loading="lazy" alt="Ascended Paddy (locked)"><b>🔒</b></div><div><span class="tn" style="color:#fff3b0">✴️ ASCENDED</span><br><b>???</b> – the one God form, radiant beyond the Mythics. <span class="tip">Unlocks by beating the SURVIVAL TOWER (coming soon).</span></div></div></div>`}
function mythicHTML(){const d=UNL.d;let h=`<div id="mythic"><h3>🌌 MYTHIC · the strongest forms</h3><div class="stat">EXP ${d.exp} · Big Bruno K.O.s ${d.ko} · Ultimates ${d.ult} · Stealth takedowns ${d.tkd}</div>`;
 for(let u=7;u<UF.length;u++){const X=UF[u],own=UNL.has(u),c=UNLK[u],pr=Math.round(UNL.prog(u)*100),ul=ROUTES[4+u].find(r=>r.ult);
  h+=`<div class="lg${own?'':' lock'}"><span class="ic">${own?X.ico:'🔒'}</span><div><span class="nm" style="color:${X.col}">${X.nm}</span> ${own?'<b style="color:#7fffd4">UNLOCKED</b>':''}<br><span class="tip">${own?'⚡ '+ul.nm+': '+ul.k.split('').join(' '):'🔒 '+c.txt+' ('+Math.min(d[c.k],c.n)+'/'+c.n+')'}</span>${own?'':`<div class="bar"><i style="width:${pr}%"></i></div>`}</div>
  <button data-mf="${u}">${UNL.ok(u)?'▶ Play':'🔒'}</button></div>`}
 h+=`<p class="tip" style="margin:6px 0 0"><button id="trymyth">${d.tryMyth?'✅ Mythic try-all ON (tap to turn off)':'🔓 Try all Mythics now'}</button> plays every Mythic before unlocking it (practice). Keys: numpad 1-8 pick a Mythic · P cycles Mythics · M / 🔄 cycles every unlocked form. Each has its own tab in the Combo List below.</p></div>`;return h}
const _buildList14=buildList;buildList=function(){_buildList14();const el=document.getElementById('clist');if(!el)return;const lg=document.getElementById('legends');
 if(lg){lg.insertAdjacentHTML('beforebegin',tiersHTML());lg.insertAdjacentHTML('afterend',mythicHTML())}else el.insertAdjacentHTML('afterbegin',tiersHTML()+mythicHTML());
 el.querySelectorAll('[data-mf]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();const u=+b.dataset.mf;if(!UNL.ok(u)){say('🔒 '+UNLK[u].txt,'#ffe08a',true);return}if(typeof ov==='function')ov(false);else document.body.classList.remove('ov');setForm(4+u)}));
 const ta=document.getElementById('trymyth');if(ta)ta.addEventListener('click',e=>{e.preventDefault();UNL.d.tryMyth=!UNL.d.tryMyth;UNL.save();buildList()})};
window.M14=M14;window.mMove=mMove;

buildList();
// start loading last, once everything above is defined
drawLoading();loadSprites(0);
