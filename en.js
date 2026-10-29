// ===================== GET-HOME ENEMY ROSTER (v16) =====================
// Silly hack-and-slash critters for the 8 Hibiscus Coast worlds. They live in `dummies` (so every attack, combo,
// launcher and juggle hits them exactly like Big Bruno) but run their own small AI, draw from their own sprites
// (en_<id>_move / en_<id>_act, facing RIGHT), and get a funny poof K.O. instead of Bruno's sit-and-wag.
// Kids on scooters / skateboards are dodge-only obstacles: they can never be hit and never hurt — just a bump.
// Sprites load lazily per world. API: window.ENW.start(i)/stop()/spawn(id,x), window.ENEMIES, window.WORLDS.
(function(){
const ESC=.95; // critter sprites are cut at their on-screen pixel height; drawn at Paddy's scale
// type: lunge | charge | pounce | dive (fliers) | shot | roll | spin (possum) | flurry | howl
const E={
 sausage:{nm:'Sausage Dog',h:110,hp:8,spd:120,atk:['charge'],wind:.55,dmg:.25,cs:620,line:'SAUSAGE ROCKET!',ko:'hot dog… nap',ouch:'ZOOMED!'},
 chihuahua:{nm:'Chihuahua',h:95,hp:5,spd:150,atk:['shot','lunge'],shot:'yap',wind:.4,dmg:.15,reach:95,line:'YAP YAP YAP!',ko:'yip… zzz',ouch:'NIBBLED!'},
 alleytom:{nm:'Alley Tom',h:170,hp:10,spd:95,atk:['lunge'],wind:.6,dmg:.3,reach:150,lv:180,line:'HAYMAKER!',ko:'meh… I meant to do that',ouch:'SLAPPED!'},
 seagull:{nm:'Seagull',h:120,hp:5,spd:170,fly:95,atk:['dive'],wind:.45,dmg:.2,line:'MINE! MINE!',ko:'…not mine',ouch:'PECKED!'},
 poodle:{nm:'Poodle',h:150,hp:9,spd:110,atk:['lunge'],spin:1,wind:.55,dmg:.25,reach:140,lv:220,line:'PIROUETTE!',ko:'ruined my hair-do',ouch:'POM-POMMED!'},
 bulldog:{nm:'Bulldog',h:140,hp:14,spd:70,atk:['lunge'],wind:.75,dmg:.35,reach:150,lv:260,kb:1.6,line:'BELLY BUMP!',ko:'snore… snort',ouch:'BUMPED!'},
 husky:{nm:'Husky',h:190,hp:12,spd:130,atk:['howl','charge'],wind:.5,dmg:.3,cs:700,slide:1,line:'SLED SLIDE!',ko:'awoo… ooo…',ouch:'SLIDE-TACKLED!'},
 labrador:{nm:'Labrador',h:180,hp:12,spd:120,atk:['charge'],wind:.55,dmg:.3,cs:640,ball:1,line:'BALL?! BALL!!',ko:'…where\'d the ball go',ouch:'TACKLED!'},
 persian:{nm:'Persian Cat',h:140,hp:9,spd:70,atk:['shot','spin'],shot:'hairball',wind:.6,dmg:.2,reach:120,line:'HAIRBALL!',ko:'how undignified',ouch:'FLUFFED!'},
 siamese:{nm:'Siamese Cat',h:150,hp:9,spd:120,atk:['pounce'],wind:.45,dmg:.25,reach:110,line:'NINJA POUNCE!',ko:'…vanishes (badly)',ouch:'POUNCED!'},
 tabby:{nm:'Tabby Gang',h:140,hp:5,spd:115,atk:['flurry'],wind:.45,dmg:.1,reach:110,lv:140,gang:3,line:'PAW FLURRY!',ko:'pile-up!',ouch:'SCRATCHED!'},
 magpie:{nm:'Magpie',h:110,hp:5,spd:160,fly:90,atk:['dive'],wind:.4,dmg:.2,line:'SWOOP!',ko:'warble… zzz',ouch:'SWOOPED!'},
 pukeko:{nm:'Pūkeko',h:160,hp:8,spd:120,atk:['lunge','pounce'],wind:.5,dmg:.25,reach:130,lv:200,line:'HIGH KICK!',ko:'squawk…',ouch:'KICKED!'},
 hedgehog:{nm:'Hedgehog',h:85,hp:7,spd:80,atk:['roll'],wind:.6,dmg:.2,cs:520,line:'SPIKY ROLL!',ko:'curled up for a nap',ouch:'PRICKLED!'},
 possum:{nm:'Possum',h:120,hp:8,spd:105,atk:['spin'],dead:1,wind:.25,dmg:.25,reach:130,line:'SURPRISE! TAIL WHIP!',ko:'playing dead… for real',ouch:'TAIL-WHIPPED!'},
 rat:{nm:'Rat',h:75,hp:4,spd:190,atk:['lunge'],wind:.35,dmg:.12,reach:80,lv:300,line:'NIBBLE!',ko:'squeak…',ouch:'NIBBLED!'},
 ferret:{nm:'Ferret',h:95,hp:6,spd:170,atk:['charge'],zig:1,wind:.35,dmg:.18,cs:650,line:'DOOK DOOK DASH!',ko:'dook…',ouch:'DOOKED!'},
 goose:{nm:'Goose Gang',h:160,hp:8,spd:110,atk:['shot','charge'],shot:'honk',gang:2,wind:.5,dmg:.22,cs:520,line:'HONK!!',ko:'…honk',ouch:'HONKED!'},
 rooster:{nm:'Rooster',h:150,hp:9,spd:110,atk:['pounce'],wind:.55,dmg:.25,reach:120,line:'COCK-A-DOODLE-KICK!',ko:'cock-a-doodle-don\'t',ouch:'FLAP-KICKED!'},
 crab:{nm:'Crab',h:85,hp:7,spd:90,atk:['lunge'],wind:.5,dmg:.2,reach:90,lv:160,front:1,line:'PINCH!',ko:'crabby nap',ouch:'PINCHED!'},
 wasp:{nm:'Wasp',h:80,hp:3,spd:200,fly:85,atk:['dive'],wind:.3,dmg:.12,line:'BZZZT!',ko:'bzz… zz…',ouch:'BUZZED!'},
 eel:{nm:'Eel',h:150,hp:9,spd:90,atk:['lunge'],zap:1,wind:.6,dmg:.28,reach:150,lv:200,line:'ZAPPY SLAP!',ko:'all tied up',ouch:'ZAPPED!'},
 weta:{nm:'Wētā',h:95,hp:7,spd:110,atk:['pounce','lunge'],wind:.5,dmg:.2,reach:100,lv:180,line:'BOING-KICK!',ko:'legs up, nap time',ouch:'BOINGED!'}};
const KIDS={kidscoot:{nm:'Kid on a scooter',spd:330},kidskate:{nm:'Kid on a skateboard',spd:380}};
const WORLDS=[
 {nm:'SILVERDALE',sub:'shops, streets & the river',kind:'street',kids:.5,en:['sausage','chihuahua','alleytom','seagull','rat','pukeko','tabby'],
  waves:[['rat','chihuahua'],['sausage','seagull','rat'],['alleytom','pukeko'],['tabby','chihuahua','seagull']]},
 {nm:'MILLWATER',sub:'lakes & parks',kind:'park',kids:.45,en:['labrador','poodle','magpie','goose','hedgehog','persian'],
  waves:[['hedgehog','magpie'],['poodle','goose'],['labrador','magpie','hedgehog'],['persian','goose','poodle']]},
 {nm:'MILLDALE',sub:'new builds & farm edges',kind:'farm',kids:.35,en:['rooster','ferret','possum','wasp','husky','siamese'],
  waves:[['ferret','wasp'],['rooster','possum'],['siamese','ferret','wasp'],['husky','rooster','possum']]},
 {nm:'HATFIELDS BEACH',sub:'sand, rocks & rock pools',kind:'beach',kids:.25,en:['crab','seagull','eel','weta','hedgehog'],
  waves:[['crab','seagull'],['eel','crab'],['weta','hedgehog','seagull'],['eel','crab','weta','seagull']]},
 {nm:'ŌREWA',sub:'the big beach & the boardwalk',kind:'beach',kids:.55,en:['bulldog','seagull','crab','goose','persian','magpie'],
  waves:[['crab','seagull','magpie'],['goose','crab'],['persian','seagull','crab'],['bulldog','goose','magpie']]},
 {nm:'RED BEACH',sub:'surf club & the stream',kind:'beach',kids:.4,en:['crab','eel','wasp','labrador','pukeko','rooster'],
  waves:[['crab','wasp'],['pukeko','eel'],['labrador','crab','wasp'],['rooster','eel','pukeko']]},
 {nm:'ARKLES BAY',sub:'bush tracks & the cliffs',kind:'park',kids:.3,en:['possum','magpie','weta','ferret','siamese','husky'],
  waves:[['weta','magpie'],['possum','ferret'],['siamese','weta','magpie'],['husky','possum','ferret']]},
 {nm:'STANMORE BAY',sub:'nearly home!',kind:'street',kids:.5,en:['bulldog','alleytom','tabby','poodle','chihuahua'],
  waves:[['chihuahua','poodle'],['alleytom','chihuahua'],['tabby','poodle'],['bulldog','alleytom','chihuahua']]}];
const ROLE={street:'dogs & cats',park:'magpies & possums',farm:'farm birds & sneaky critters',beach:'crabs & gulls'};
// ---------- anims (registered lazily, so nothing extra downloads until a world needs it) ----------
const ANIMS=id=>({idle:[`en_${id}_move`,[0,1],2.6,1],walk:[`en_${id}_move`,[2,3,4,5],9,1],wind:[`en_${id}_act`,[0],1,0],atk:[`en_${id}_act`,[1,2],9,0],
 hold:[`en_${id}_act`,[2],1,0],hurt:[`en_${id}_act`,[3],1,0],air:[`en_${id}_act`,[4],1,0],ko:[`en_${id}_act`,[5],1,0],dead:[`en_${id}_act`,[0],1,0],roll:[`en_${id}_act`,[1,2],7,1]});
const ready=new Set();
function need(ids){const names=[];for(const id of ids){if(ready.has(id)||!F[`en_${id}_move`])continue;ready.add(id);const an=KIDS[id]?{ride:[`en_${id}_move`,null,9,1]}:ANIMS(id);
  for(const k in an){const nm=`en_${id}_${k}`,[s,idx]=an[k];A[nm]=an[k];FR[nm]=idx?idx.filter(i=>i<F[s].length).map(i=>F[s][i]):F[s]}
  for(const s of ['move','act'])(F[`en_${id}_${s}`]||[]).forEach(f=>names.push(f.f))}
 if(names.length&&window.queueFrames)queueFrames(names,true)}
function loaded(id){const fr=FR[`en_${id}_${KIDS[id]?'ride':'idle'}`];return !!(fr&&fr.every(f=>imgOK(IMG[f.f])))}
// ---------- spawning ----------
let uid=0;
function spawn(id,x,o){const D=E[id];if(!D)return null;need([id]);o=o||{};const side=x==null?(Math.random()<.5?-1:1):0;
 if(x==null)x=side<0?LW+70+Math.random()*60:WALL_X-70-Math.random()*60;
 const fy=D.fly?GROUND-D.fly:GROUND;
 const d={cr:id,D,uid:++uid,home:x,x,y:D.fly?-60-Math.random()*80:GROUND,vx:0,vy:0,fl:0,hp:D.hp,max:D.hp,hpShow:D.hp,h:Math.round(D.h*ESC),flash:0,sq:0,rot:0,alive:true,last:-1,calm:0,
  face:x<p.x?1:-1,fs:x<p.x?1:-1,st:D.dead?'dead':'enter',t:0,ft:0,fi:0,anim:`en_${id}_idle`,cool:1+Math.random()*1.2,stun:0,aggro:9,blend:0,bub:null,aware:true,det:0,fy,ph:Math.random()*6,spin:0,mode:'ground'};
 if(D.fly)d.selfFly=true;else if(o.drop){d.y=GROUND-420;d.vy=0}
 dummies.push(d);return d}
// ---------- AI ----------
const shots=[],poofs=[],kids=[];
const dA=(d,k)=>{const nm=`en_${d.cr}_${k}`;if(d.anim!==nm){const cf=(FR[d.anim]||[])[d.fi];if(cf&&String(d.anim).startsWith('en_')){d.prevF=cf;d.prevFs=d.fs;d.blend=.1}d.anim=nm;d.ft=0;d.fi=0}};
const cS=(d,st,k)=>{if(d.st!==st){d.st=st;d.t=0;d.done=0}if(k)dA(d,k)};
function stepA(d,dt){const a=A[d.anim],fr=FR[d.anim];if(!a||!fr)return;d.ft+=dt*a[2];d.fi=a[3]?Math.floor(d.ft)%fr.length:Math.min(fr.length-1,Math.floor(d.ft))}
function busy(){let n=0;for(const q of dummies)if(q.cr&&q.alive&&(q.st==='wind'||q.st==='atk'))n++;return n}
function strike(d,dmg,kind){const D=d.D;if(dogStrike(d,dmg,kind||'bite')){if(p.state==='hurt'){say(D.ouch||'BONK!','#ff9a9a');if(D.kb)p.vx*=D.kb}return true}return false}
function near(d,reach,yr){const rel=(p.x-d.x)*d.face;return rel>-50&&rel<reach&&p.y>d.y-(yr||d.h+60)&&p.y<d.y+40}
function critterHit(d,move,air){d.hitT=now;if(!d.alive)return;d.bub=null;d.selfFly=false;d.st=air||d.vy<-200?'air':'hurt';d.t=0;d.done=0;d.cool=Math.max(d.cool,1.1);d.spin=0;if(d.D.dead&&d.mode==='dead'){d.mode='ground';d.bub={t:'OI!',l:.8,c:'#fff'}}}
function critterKO(d){d.alive=false;cS(d,'ko','ko');d.vx=0;d.vy=-420;d.koT=0;d.bub={t:d.D.ko,l:1.4,c:'#ffe14d'};spark(d.x,d.y-d.h*.5,14,['#ffe14d','#fff','#8fe0ff'],300);
 if(typeof UNL!=='undefined'&&UNL.bump)try{UNL.bump('ko')}catch(e){}if(W.on)W.kos++}
function poof(d){for(let i=0;i<9;i++){const a=i/9*6.283;poofs.push({x:d.x+Math.cos(a)*20,y:d.y-d.h*.45+Math.sin(a)*14,vx:Math.cos(a)*120,vy:Math.sin(a)*80-40,r:14+Math.random()*10,l:.7,c:i%3?'#ffffff':'#e8eefc'})}
 for(let i=0;i<5;i++)poofs.push({star:1,x:d.x,y:d.y-d.h*.5,vx:(Math.random()-.5)*420,vy:-200-Math.random()*300,r:9,l:.9,c:i%2?'#ffe14d':'#fff'});poofs.push({txt:'POOF!',x:d.x,y:d.y-d.h-10,vx:0,vy:-60,l:.9})}
function updCritter(d,dt){const D=d.D;
 d.t+=dt;d.flash-=dt;d.sq*=Math.pow(.01,dt);d.cool-=dt;d.stun-=dt;d.blend-=dt;d.hpShow+=(d.hp-d.hpShow)*Math.min(1,dt*5);if(d.bub){d.bub.l-=dt;if(d.bub.l<=0)d.bub=null}
 d.fs+=(d.face-d.fs)*Math.min(1,dt*12);d.ph+=dt;
 const held=CINE.includes(p.state)&&p.grab===d,frozen=d.mfz>0||(typeof M14!=='undefined'&&M14.tstop>0);
 // physics: same launch/float/gravity as Bruno so launchers, juggles and air combos behave identically
 if(!d.selfFly){const dIdle=now-(d.lastHitT||-9);if(d.y<GROUND-25&&dIdle>.5&&d.fl>0&&!(p.state==='lkult'||CINE.includes(p.state)))d.fl=0;d.fl-=dt;
  d.vy+=(d.fl>0?420:dIdle>.9&&d.y<GROUND-25?2300:1700)*dt;if(d.fl>0)d.vx*=Math.pow(.3,dt)}
 d.x+=d.vx*dt;d.y+=d.vy*dt;
 const lo=LW+45,hi=WALL_X-45;if(d.x<lo){d.x=lo;d.vx=Math.abs(d.vx)*.5}if(d.x>hi){d.x=hi;d.vx=-Math.abs(d.vx)*.5}if(d.y<-90000)d.y=-90000;
 let landed=false;if(d.y>=GROUND){d.y=GROUND;if(d.vy>350){landed=true;d.vy=Math.max(-380,d.vy*-.3);d.sq=.7;spark(d.x,GROUND,6,'#d9c49a',140)}else d.vy=0;d.vx*=Math.pow(.02,dt)}
 const air=!d.selfFly&&(d.y<GROUND-2||d.vy<-1);
 d.rot+=((air&&d.st!=='atk'?Math.max(-.5,Math.min(.5,d.vx/1000)):0)-d.rot)*Math.min(1,dt*10);
 if(!d.alive){d.koT+=dt;dA(d,'ko');if(d.koT>1.15&&!d.gone){d.gone=true;poof(d)}stepA(d,dt);return}
 if(d.hp<=0&&!air&&!held){critterKO(d);return}
 if(air&&(d.st==='air'||d.st==='hurt'||d.st==='flat'||!['atk'].includes(d.st))){d.st='air';dA(d,d.vy<-200?'air':'hurt');stepA(d,dt);return}
 if(d.st==='air'){cS(d,'hurt','hurt');d.t=.2}
 if(held||frozen){stepA(d,dt);return}
 if(d.st==='hurt'||d.st==='flat'){dA(d,'hurt');if(d.t>.45){cS(d,'idle','idle');if(D.fly)d.selfFly=true}stepA(d,dt);return}
 if(d.stun>0){dA(d,'hurt');stepA(d,dt);return}
 const dx=p.x-d.x,adx=Math.abs(dx),pOK=p.state!=='respawn'&&!CINE.includes(p.state),t=d.t;
 // fliers drift to their hover height (with a lazy bob) whenever they're not diving
 if(D.fly&&d.selfFly&&d.st!=='atk'){const ty=d.fy+Math.sin(d.ph*2.4)*12;d.vy=0;d.y+=(ty-d.y)*Math.min(1,dt*(d.st==='rec'?3:4))}
 // keep a little space between critters
 for(const q of dummies)if(q!==d&&q.cr&&q.alive&&Math.abs(q.x-d.x)<40&&Math.abs(q.y-d.y)<60)d.x+=(d.x<q.x?-1:1)*60*dt;
 switch(d.st){
  case 'enter':dA(d,D.fly?'walk':'idle');if(t>.5||(!D.fly&&d.y>=GROUND))cS(d,'idle','idle');break;
  case 'dead': // possum: plays dead until Paddy wanders close… then SURPRISE
   dA(d,'dead');if(pOK&&adx<190&&p.y>GROUND-150){d.face=dx>0?1:-1;d.bub={t:'SURPRISE!',l:.9,c:'#ffe14d'};d.sq=1.3;cS(d,'wind','atk');d.t=D.wind*.6;d.kind='spin'}break;
  case 'wind':{const k=d.kind;dA(d,k==='roll'?'wind':k==='howl'?'atk':'wind');if(k!=='dive'&&k!=='howl'&&adx>20)d.face=dx>0?1:-1;
   if(D.fly)d.y-=40*dt;
   if(t>=D.wind){cS(d,'atk',k==='roll'?'roll':'atk');d.done=0;d.tx=p.x;d.ty=Math.min(GROUND-10,p.y-20);d.sx=d.x;d.sy=d.y;if(D.line&&k!=='howl')d.bub={t:D.line,l:.9,c:'#fff'}
    if(k==='pounce'){d.vy=-720;d.vx=d.face*Math.min(520,Math.max(220,adx*1.6));d.selfJump=1}
    if(k==='shot'){const s=D.shot;shots.push({k:s,x:d.x+d.face*d.h*.35,y:d.y-d.h*(s==='hairball'?.45:.55),vx:d.face*(s==='hairball'?430:520),r:s==='hairball'?16:18,l:s==='hairball'?1.8:.75,d,hit:0,face:d.face,rot:0});d.bub={t:s==='honk'?'HONK!!':s==='yap'?'YAP!':'HACK!',l:.7,c:'#fff'}}}}break;
  case 'atk':{const k=d.kind;
   if(k==='lunge'||k==='flurry'){const dur=k==='flurry'?.75:.32;d.x+=d.face*(D.lv||180)*dt*(t<.25?1:.2);if(D.spin)d.rot=Math.sin(t*20)*.25;
    if(k==='flurry'){if(Math.floor(t/.18)!==d.done&&t<.72){d.done=Math.floor(t/.18);if(near(d,D.reach))strike(d,D.dmg,'bite');spark(d.x+d.face*50,d.y-d.h*.5,4,['#fff','#ffe14d'],180)}dA(d,Math.floor(t/.09)%2?'atk':'hold')}
    else if(t>.12&&!d.done){d.done=1;if(near(d,D.reach))strike(d,D.dmg,'bite');if(D.zap)spark(d.x+d.face*80,d.y-d.h*.5,12,['#ffe14d','#8fe0ff','#fff'],320);else spark(d.x+d.face*70,d.y-d.h*.5,5,['#fff'],160)}
    if(t>dur)cS(d,'rec','hold')}
   else if(k==='charge'||k==='roll'){const dur=k==='roll'?1.1:.7,sp=D.cs||600;d.x+=d.face*sp*dt;if(D.zig)d.y=GROUND-Math.abs(Math.sin(t*14))*18;if(k==='roll')d.spin+=d.face*dt*14;
    if(D.slide)d.rot=-d.face*.12;if(t%.08<dt)spark(d.x-d.face*30,GROUND-4,2,'#d9c49a',90);
    if(!d.done&&Math.abs(p.x-d.x)<40+d.h*.35&&p.y>d.y-d.h-20){d.done=1;strike(d,D.dmg,'bite');if(D.ball)shots.push({k:'ball',x:d.x,y:d.y-d.h*.7,vx:d.face*-120,vy:-650,r:11,l:2,d,hit:1,face:1,rot:0})}
    const passed=(p.x-d.x)*d.face<-120;if(t>dur||(passed&&t>.25)||d.x<=LW+46||d.x>=WALL_X-46){d.spin=0;d.y=GROUND;cS(d,'rec','hold')}}
   else if(k==='pounce'){if(!d.done&&near(d,D.reach,d.h+80)){d.done=1;strike(d,D.dmg,'bite')}if(d.y>=GROUND&&t>.15){d.selfJump=0;spark(d.x,GROUND,6,'#d9c49a',140);cS(d,'rec','hold')}}
   else if(k==='dive'){d.selfFly=true;const u=Math.min(1,t/.42);d.x=d.sx+(d.tx-d.sx)*u;d.y=d.sy+(d.ty-d.sy)*u*u;d.face=d.tx>d.sx?1:-1;
    if(!d.done&&Math.abs(p.x-d.x)<55&&Math.abs((p.y-60)-(d.y-d.h*.4))<80){d.done=1;strike(d,D.dmg,'bite')}if(u>=1)cS(d,'rec','walk')}
   else if(k==='spin'){d.spin+=dt*16*d.face;if(t>.1&&t<.5&&!d.done&&Math.abs(p.x-d.x)<D.reach&&p.y>d.y-d.h-60){d.done=1;strike(d,D.dmg,'bite')}if(t>.55){d.spin=0;cS(d,'rec','hold')}}
   else if(k==='howl'){if(!d.done){d.done=1;d.bub={t:'AWOOOO~ ♪',l:1.2,c:'#fff'};d.cool=0;d.buff=4}if(t>.9){d.kind='charge';cS(d,'wind','wind')}}
   else if(k==='shot'){if(t>.35)cS(d,'rec','hold')}
   break}
  case 'rec':if(t>.35){cS(d,'idle','idle');d.rot=0;d.cool=(D.fly?1.4:1.6)+Math.random()*1.4;if(D.dead&&Math.random()<.35){d.mode='dead';cS(d,'dead','dead');d.bub={t:'*plays dead*',l:1.2,c:'#fff'}}}break;
  default:{d.buff=(d.buff||0)-dt;const sp=D.spd*(d.buff>0?1.5:1);
   if(pOK){if(adx>25&&d.st!=='wind')d.face=dx>0?1:-1;
    const want=D.fly?170:d.kind==='shot'?260:(D.reach||110)*.7;
    if(D.fly){const tx=p.x-Math.sign(dx||1)*want;if(Math.abs(tx-d.x)>20){d.x+=Math.sign(tx-d.x)*sp*dt;dA(d,'walk')}else dA(d,'walk')}
    else if(adx>want+20){cS(d,'walk','walk');d.x+=Math.sign(dx)*sp*dt}else cS(d,'idle','idle');
    if(d.cool<=0&&busy()<2&&adx<(D.fly?320:420)){const opts=D.atk;let k=opts[Math.floor(Math.random()*opts.length)];
     if(k==='lunge'&&adx>(D.reach||110)+60)k=opts.find(o=>o!=='lunge')||null;if(k==='flurry'&&adx>D.reach+40)k=null;if(k==='spin'&&adx>(D.reach||120)+30)k=opts.find(o=>o!=='spin')||null;
     if(k){d.kind=k;d.done=0;cS(d,'wind','wind');d.bub={t:'!',l:D.wind,c:'#ff4040'}}else d.cool=.3}}
   else cS(d,'idle','idle')}}
 stepA(d,dt)}
// ---------- kids (dodge-only obstacles, never targets) ----------
function spawnKid(){const id=Math.random()<.5?'kidscoot':'kidskate';need([id]);const dir=Math.random()<.5?1:-1;
 kids.push({id,dir,x:dir>0?LW-160:WALL_X+160,warn:1,t:0,bumped:0,ft:0})}
function updKids(dt){for(const k of kids){k.t+=dt;if(k.warn>0){k.warn-=dt;continue}k.x+=k.dir*KIDS[k.id].spd*dt;k.ft+=dt*9;
  if(!k.bumped&&p.inv<=0&&p.state!=='respawn'&&!CINE.includes(p.state)&&Math.abs(p.x-k.x)<55&&p.y>GROUND-70){k.bumped=1;p.vx=k.dir*360;p.vy=-360;p.ground=false;p.inv=Math.max(p.inv,.6);
   say(['WHOA! SORRY PADDY!','BEEP BEEP!','COMING THROUGH!'][Math.floor(Math.random()*3)],'#9fe8ff');shake=Math.max(shake,3)}}
 for(let i=kids.length-1;i>=0;i--)if(kids[i].x<LW-260||kids[i].x>WALL_X+260)kids.splice(i,1)}
function drawKids(){for(const k of kids){if(k.warn>0){const x=k.dir>0?LW+40:WALL_X-40,a=.5+.5*Math.sin(now*18);fancy(k.dir>0?'⚠ ▶':'◀ ⚠',x,GROUND-70,30,0,1,a,'#ffe14d');continue}
  const fr=FR[`en_${k.id}_ride`];if(!fr)continue;const f=fr[Math.floor(k.ft)%fr.length],im=IMG[f.f];if(!imgOK(im))continue;
  ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(k.x,GROUND+3,46,9,0,0,6.28);ctx.fill();
  ctx.save();ctx.translate(k.x,GROUND+4);ctx.scale(k.dir*ESC,ESC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}}
// ---------- projectiles + poofs ----------
function updShots(dt){for(const s of shots){s.l-=dt;s.x+=s.vx*dt;s.rot+=dt*8*s.face;if(s.k==='ball'){s.vy+=1500*dt;s.y+=s.vy*dt;if(s.y>GROUND-s.r){s.y=GROUND-s.r;s.vy*=-.5}}
  if(s.k!=='ball'){if(s.k!=='hairball')s.r+=dt*90;if(!s.hit&&Math.abs(p.x-s.x)<s.r+25&&p.y>s.y-40&&p.y-110<s.y+s.r){s.hit=1;strike(s.d,s.d.D.dmg,'bite');if(s.k==='hairball')s.l=0}}}
 for(let i=shots.length-1;i>=0;i--)if(shots[i].l<=0)shots.splice(i,1);
 for(const o of poofs){o.l-=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.vx*=Math.pow(.1,dt);if(o.star)o.vy+=900*dt;else o.r+=dt*40}for(let i=poofs.length-1;i>=0;i--)if(poofs[i].l<=0)poofs.splice(i,1)}
function star(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();for(let k=0;k<10;k++){const q=k%2?r*.4:r,b=k*Math.PI/5+now*3;ctx.lineTo(x+Math.cos(b)*q,y+Math.sin(b)*q)}ctx.closePath();ctx.fill()}
function drawShots(){for(const s of shots){ctx.save();ctx.globalAlpha=Math.min(1,s.l*3);
  if(s.k==='hairball'){ctx.translate(s.x,s.y);ctx.rotate(s.rot);ctx.fillStyle='#e9e2d4';ctx.strokeStyle='#7a6a55';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<14;i++){const a=i/14*6.283,r=s.r*(i%2?.8:1.15);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke()}
  else if(s.k==='ball'){ctx.fillStyle='#d8f04a';ctx.strokeStyle='#5a6a10';ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fill();ctx.stroke()}
  else{ctx.strokeStyle=s.k==='honk'?'#fff':'#ffe14d';ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.globalAlpha=Math.min(1,s.l*2)*(1-i*.3);const a0=s.face>0?0:Math.PI;ctx.beginPath();ctx.arc(s.x-s.face*i*14-s.face*s.r*.6,s.y,Math.max(4,s.r-i*10),a0-.9,a0+.9);ctx.stroke()}
   ctx.globalAlpha=Math.min(1,s.l*2);fancy(s.k==='honk'?'HONK':'YAP',s.x,s.y-s.r-14,20,0,1,Math.min(1,s.l*2),'#fff')}
  ctx.restore()}
 for(const o of poofs){ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,o.l*2));if(o.txt)fancy(o.txt,o.x,o.y,30,-.06,1,Math.min(1,o.l*2),'#fff');else if(o.star)star(o.x,o.y,o.r,o.c);else{ctx.fillStyle=o.c;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,6.283);ctx.fill()}ctx.restore()}}
// ---------- drawing ----------
function frameOf(d){const fr=String(d.anim).startsWith('en_')?FR[d.anim]:null;const f=fr&&fr[Math.min(d.fi,fr.length-1)];if(f&&imgOK(IMG[f.f]))return f;const g=FR[`en_${d.cr}_idle`];const h=g&&g.find(q=>imgOK(IMG[q.f]));return h||null}
function drawCF(f,fs,alpha,front){if(!f)return;const im=IMG[f.f];if(!imgOK(im))return;ctx.save();if(alpha!=null)ctx.globalAlpha*=alpha;ctx.scale((front?1:Math.sign(fs)*Math.max(.15,Math.abs(fs)))*ESC,ESC);ctx.drawImage(im,-f.ax,-f.ay);ctx.restore()}
function drawCritters(){for(const d of dummies){if(!d.cr||d.gone)continue;const D=d.D,f=frameOf(d);if(!f)continue;const H=d.alive?d.h:d.h*.6;
 const hg=Math.max(0,GROUND-d.y);ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(d.x,GROUND+3,f.w*ESC*.38*Math.max(.35,1-hg/400),8,0,0,6.28);ctx.fill();
 if(d.st==='wind'&&d.alive){const u=Math.sin(now*24)*.5+.5,gx=d.x+d.face*d.h*.25,gy=d.y-d.h*.55,g=ctx.createRadialGradient(gx,gy,3,gx,gy,d.h*.55+u*14);
  g.addColorStop(0,`rgba(255,60,30,${.42+.3*u})`);g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,d.h*.7,0,6.283);ctx.fill()}
 const ko=!d.alive,kt=d.koT||0,fade=ko&&kt>1?Math.max(0,1-(kt-1)/.2):1;
 ctx.save();ctx.globalAlpha=fade;ctx.translate(d.x,d.y);if(d.spin){ctx.translate(0,-d.h*.4);ctx.rotate(d.spin);ctx.translate(0,d.h*.4)}ctx.rotate(d.rot);
 const s=1+d.sq*.14;ctx.scale(1/s,s);
 if(d.blend>0&&d.prevF){drawCF(d.prevF,d.prevFs||d.fs,d.blend/.1,D.front);drawCF(f,d.fs,1-.5*d.blend/.1,D.front)}else drawCF(f,d.fs,1,D.front);
 if(d.flash>0){ctx.globalCompositeOperation='lighter';drawCF(f,d.fs,Math.min(1,d.flash/.12)*.6,D.front);ctx.globalCompositeOperation='source-over'}
 ctx.restore();
 if(ko||d.stun>0){for(let i=0;i<3;i++){const a=now*5+i*2.09;star(d.x+Math.cos(a)*d.h*.35,d.y-H-8+Math.sin(a)*7,7,i%2?'#ffe14d':'#fff')}}
 if(d.alive&&d.hpShow<d.max-.01){const w=Math.max(40,d.h*.5),y=d.y-d.h-14;ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(d.x-w/2-2,y-2,w+4,8);ctx.fillStyle='#ffb347';ctx.fillRect(d.x-w/2,y,w*Math.max(0,d.hpShow)/d.max,4);ctx.fillStyle='#7dff7a';ctx.fillRect(d.x-w/2,y,w*Math.max(0,d.hp)/d.max,4)}
 if(d.bub&&fade>.2){const b=d.bub,a=Math.min(1,b.l*3),big=b.t.length<=2;fancy(b.t,d.x+(big?d.face*d.h*.3:0),d.y-H-(big?20:34),big?40:20,0,1,a,b.c)}}}
// ---------- world / wave manager ----------
const W={on:false,wi:0,wave:0,state:'',t:0,kos:0,kidT:6,saved:null,nextWorld:true};
function bruno(){return dummies.find(d=>!d.cr)}
function bench(){const b=bruno();if(b&&!b.benched){b.benched=true;b.wasAlive=b.alive;b.alive=false;b.bub=null}}
function unbench(){const b=bruno();if(b&&b.benched){b.benched=false;b.alive=true;b.hp=b.max;b.hpShow=b.max;b.x=b.home;b.y=GROUND;b.vx=b.vy=0;dSet(b,'idle','r_idle');b.cool=2}}
function clearCritters(){for(let i=dummies.length-1;i>=0;i--)if(dummies[i].cr)dummies.splice(i,1);shots.length=0;kids.length=0}
function start(i){i=Math.max(0,Math.min(WORLDS.length-1,i|0));clearCritters();bench();W.on=true;W.wi=i;W.wave=0;W.state='intro';W.t=0;W.kos=0;W.kidT=5+Math.random()*4;const w=WORLDS[i];
 need(w.en.concat(['kidscoot','kidskate']));card(`🌏 WORLD ${i+1} · ${w.nm}`,`${w.sub} — watch out for ${ROLE[w.kind]}!`,'#ffd84a');p.hp=Math.max(p.hp,1);try{localStorage.setItem('paddyWorld',String(i))}catch(e){}}
function stop(){clearCritters();W.on=false;W.state='';unbench();card('🥊 TRAINING ARENA','Big Bruno is back for practice','#ffd84a')}
function spawnWave(){const w=WORLDS[W.wi],list=w.waves[W.wave];let k=0;for(const id of list){const n=E[id].gang||1;for(let j=0;j<n;j++){const side=(k++)%2?1:-1;const x=side<0?LW+60+j*45:WALL_X-60-j*45;const d=spawn(id,x,{drop:Math.abs(x-p.x)<200});d.cool=1.2+k*.5}}
 say(`WAVE ${W.wave+1}/${w.waves.length}`,'#ffe14d',true)}
function updWorld(dt){if(!W.on)return;W.t+=dt;const w=WORLDS[W.wi],alive=dummies.some(d=>d.cr&&!d.gone);
 if(W.state==='intro'){need(w.en.concat(['kidscoot','kidskate']));const ok=w.waves[0].every(loaded);if(W.t>2.2&&(ok||W.t>7)){W.state='fight';W.t=0;spawnWave()}}
 else if(W.state==='fight'){if(!alive&&W.t>1){W.wave++;if(W.wave>=w.waves.length){W.state='clear';W.t=0;card(`⭐ ${w.nm} CLEARED!`,W.wi<WORLDS.length-1?`next stop: ${WORLDS[W.wi+1].nm}`:'Stanmore Bay is just around the corner…','#7dff7a');spark(p.x,p.y-80,30,['#ffe14d','#fff','#7dff7a'],420)}
   else{W.state='gap';W.t=0}}
  W.kidT-=dt;if(W.kidT<=0){W.kidT=(7+Math.random()*7)/Math.max(.2,w.kids);spawnKid()}}
 else if(W.state==='gap'){if(W.t>1.4){need(w.waves[W.wave]);const ok=w.waves[W.wave].every(loaded);if(ok||W.t>5){W.state='fight';W.t=0;spawnWave()}}}
 else if(W.state==='clear'){if(W.t>3.6){if(W.wi<WORLDS.length-1&&W.nextWorld)start(W.wi+1);else{W.on=false;card('🏠 PADDY MADE IT HOME!','Savannah, Hallie & Mum — reunited!','#ffd84a');if(window.STORY&&STORY.cutscene)setTimeout(()=>{try{STORY.cutscene('reunion',()=>{clearCritters();unbench()})}catch(e){unbench()}},2400);else unbench()}}}
}
function sweep(){for(let i=dummies.length-1;i>=0;i--){const d=dummies[i];if(d.cr&&d.gone&&d.koT>1.5)dummies.splice(i,1)}}
function drawWorldHUD(){if(!W.on)return;const w=WORLDS[W.wi],left=dummies.filter(d=>d.cr&&d.alive).length;
 ctx.save();ctx.fillStyle='rgba(10,8,30,.55)';ctx.beginPath();ctx.roundRect?ctx.roundRect(VW/2-190,8,380,34,12):ctx.rect(VW/2-190,8,380,34);ctx.fill();
 fancy(`WORLD ${W.wi+1} · ${w.nm}`,VW/2-60,25,18,0,1,1,'#ffd84a');fancy(W.state==='fight'||W.state==='gap'?`WAVE ${Math.min(W.wave+1,w.waves.length)}/${w.waves.length} · ${left} left`:W.state==='clear'?'CLEARED!':'get ready…',VW/2+105,25,16,0,1,1,'#fff');ctx.restore()}
// ---------- hook into the game (outermost wrappers; Bruno's own code is untouched) ----------
const _upd=updDog;updDog=function(d,dt){if(d.benched)return;if(d.cr)return updCritter(d,dt);return _upd(d,dt)};
const _hit=dogHit;dogHit=function(d,move,air){if(d.cr)return critterHit(d,move,air);return _hit(d,move,air)};
const _ko=startKO;startKO=function(d){if(d.cr)return critterKO(d);return _ko(d)};
const _ud=updDummies;updDummies=function(dt){_ud(dt);sweep();updWorld(dt);updKids(dt);updShots(dt)};
const _dd=drawDummies;drawDummies=function(){const all=dummies.slice(),keep=all.filter(d=>!d.cr&&!d.benched);dummies.length=0;dummies.push(...keep);try{_dd()}finally{dummies.length=0;dummies.push(...all)}drawKids();drawCritters();drawShots()};
const _hud=r12HUD;r12HUD=function(){const b=bruno();if(W.on||(b&&b.benched))return drawWorldHUD();return _hud()};
const _tk=r12Takedown;r12Takedown=function(){if(W.on||dummies.some(d=>d.cr))return false;return _tk()};
// Combo List: world picker
function picker(){const box=document.querySelector('#moves .box'),h2=box&&box.querySelector('h2');if(!h2||document.getElementById('worlds'))return;
 const el=document.createElement('div');el.id='worlds';el.innerHTML='<div class="wt">🌏 GET-HOME WORLDS — fight your way home</div>'+WORLDS.map((w,i)=>`<button data-w="${i}">${i+1}. ${w.nm}</button>`).join('')+'<button data-w="-1">🥊 Bruno training</button>';
 h2.after(el);el.addEventListener('click',e=>{const b=e.target.closest('button[data-w]');if(!b)return;e.preventDefault();b.blur();const i=+b.dataset.w;if(typeof ov==='function')ov(false);if(i<0)stop();else start(i)});
 const st=document.createElement('style');st.textContent='#worlds{margin:4px 0 10px}#worlds .wt{font:18px Bangers,Impact,sans-serif;letter-spacing:1px;color:#9fe8ff;margin-bottom:4px}#worlds button{margin:2px 3px;padding:5px 9px;border:0;border-radius:9px;background:#2f4a7a;color:#fff;font:13px system-ui;cursor:pointer}#worlds button:hover{background:#3f63a3}#worlds button[data-w="-1"]{background:#6a3030}';document.head.appendChild(st)}
picker();
// test / deep-link: ?world=N (1-8) starts that world; ?enemy=id[,id] drops critters into the training arena
const Q=new URLSearchParams(location.search);
function boot(){if(!F||!F.en_rat_move){setTimeout(boot,300);return}const wn=+Q.get('world');if(wn>=1)start(wn-1);const en=Q.get('enemy');if(en){bench();en.split(',').forEach((id,i)=>spawn(id,i%2?WALL_X-90:LW+300+i*60))}}
if(Q.has('world')||Q.has('enemy'))boot();
window.ENEMIES=E;window.WORLDS=WORLDS;window.KIDS=KIDS;
window.ENW={W,start,stop,spawn,spawnKid,kids,shots,need,loaded,next:()=>{if(W.on){for(const d of dummies)if(d.cr)d.hp=0}}};
})();
