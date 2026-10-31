// ===================== LEVEL 1-1 BRANCH: tilemap level runtime (Paddy's Way Home, Silverdale world) =====================
// Loads a Level Builder level JSON (levels/silverdale_N.json, tile 48) and plays it as a side-scrolling platformer with
// base Paddy's art from assets/frames.json. Open level.html?level=silverdale_1 (…_2 … _7; 1-7 ends with the Big Bruno boss arena).
// Solid legend:  J bounce pad (solid flush trampoline: landing launches ~6 tiles with jump held, ↓ absorbs) · # ground · B breakable · ? item block · L solid with a grabbable top corner · = one-way platform (branches too)
//   F one-way fence rail (↓ drops through) · T climbable trunk / drainpipe / pole (not solid: hold ↑ to climb, ← → step off onto a
//   branch or roof, jump leaps off) · ^ soft hazard (bump + chip, never kills) · ~ water (soft respawn at last safe ground) · . empty
// Fields: spawn, checkpoints, goal, mission (optional mission id, completed at the goal -> mission.js gift + form unlock), entities (coin fish yarn powerup enemy kid car bus), arenas (camera lock until the group is cleared),
//   trees, fences, roofs, climbables, tutorial signs, shopSigns, backdrop, decoLegend skins.
// Kids: harmless:true, hitbox:false -> no collision, no damage, no knock-back, can't be attacked; hopping over one = +3 coins once per pass.
// Cars / buses (entityTypes): shuttle x0..x1 on their lane at speed tiles/s, bump Paddy with knock-back only (no damage), can't be attacked.
(function(){
const TS=48,VW=960,VH=540,SC=0.8,G=2600,JV=835,DJV=760,WALK=250,RUN=370,BW=72,BH=168;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const qs=new URLSearchParams(location.search);const LEVELS=['silverdale_1','silverdale_2','silverdale_3','silverdale_4','silverdale_5','silverdale_6','silverdale_7'];
const LID=qs.get('level')||'silverdale_1';
const LV=window.LV={ready:false,log:[],events:[],t:0};
let F={},IMG={},L=null,S=null,W=0,H=0;
const K={},P={};
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyZ:'jump',KeyX:'attack',KeyJ:'attack',ShiftLeft:'run',ShiftRight:'run',KeyN:'next',KeyR:'restart'};
addEventListener('keydown',e=>{const k=KEYMAP[e.code];if(!k)return;e.preventDefault();if(!K[k])P[k]=1;K[k]=1});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)K[k]=0});
// ---------- loading ----------
async function getJSON(u){const r=await fetch(u+'?v='+Date.now());if(!r.ok)throw new Error(u+' '+r.status);return r.json()}
async function loadLevel(id){for(const base of ['levels/','levels-dev/']){try{return await getJSON(base+id+'.json')}catch(_){}}throw new Error('level '+id+' not found')}
const ANIM={idle:['idle_test_1',4],walk:['o_walk',11],run:['o_run',12],jump:['o_jump',8],fall:['o_fall',6],land:['o_land',10],djump:['doublejump',14],
 climb:['o_climb',8],wall:['walljump',10],ledge:['ledge',7],hurt:['o_hurt',1],attack:['clawcombo',22],victory:['victory',7]};
function img(f){if(IMG[f])return IMG[f];const im=new Image();im.src='assets/'+f+'.webp';im.onerror=()=>{if(!im._png){im._png=1;im.src='assets/'+f+'.png'}};IMG[f]=im;return im}
const ok=im=>im&&im.complete&&im.naturalWidth>0;
// ---------- tiles ----------
const BLOCK=new Set(['#','B','?','L','J']),ONE=new Set(['=','F']);   // J = bounce pad: solid, flush trampoline
const tile=(c,r)=>(c<0||c>=W)?'#':(r<0)?'.':(r>=H)?'#':S[r][c];
const setTile=(c,r,ch)=>{S[r]=S[r].slice(0,c)+ch+S[r].slice(c+1)};
const deco=(c,r)=>(L.layers.deco&&L.layers.deco[r]&&L.layers.deco[r][c])||'.';
const solidAt=(c,r)=>BLOCK.has(tile(c,r));
const used=new Set();
// ---------- state ----------
const p={x:0,y:0,vx:0,vy:0,face:1,ground:false,jumps:0,state:'normal',t:0,anim:'idle',at:0,hp:5,max:5,inv:0,drop:0,coins:0,yarn:0,fish:0,power:0,climbX:0,hang:null,safe:{x:0,y:0},cp:null,atk:0,atkHit:new Set(),done:false,deaths:0,hopped:new Set()};
let ents=[],enemies=[],kids=[],cars=[],arenas=[],arena=null,cam={x:0,y:0},fx=[],msgs=[],climbMeta=[];
function msg(t,c,big){msgs.push({t,c:c||'#fff',l:big?2.2:1.4,big});LV.events.push(t)}
function surfaceRow(c,fromRow){for(let r=Math.max(0,fromRow|0);r<H;r++){const ch=tile(c,r);if(BLOCK.has(ch)||ONE.has(ch)||ch==='^')return r}return H}
function init(lv){L=lv;W=L.width;H=L.height;S=L.layers.solid.slice();used.clear();
 const sp=L.spawn;p.x=(sp.x+.5)*TS;p.y=(sp.y+1)*TS;p.vx=p.vy=0;p.state='normal';p.hp=p.max;p.safe={x:p.x,y:p.y};p.cp={x:p.x,y:p.y};p.done=false;p.coins=0;p.yarn=0;p.fish=0;
 ents=[];enemies=[];kids=[];cars=[];fx=[];msgs=[];arena=null;
 for(const e of L.entities||[]){const x=(e.x+.5)*TS,y=(e.y+1)*TS;
  if(e.type==='enemy')enemies.push(mkEnemy(e.id,x,y,e));
  else if(e.type==='kid'){kids.push({kind:e.kind,x,y,x0:e.x*TS,x1:(e.x+(e.range||10))*TS,dir:1,sp:2*TS,ph:0,harmless:e.harmless===true,hitbox:e.hitbox!==false?true:false,bonus:e.bonus})}
  else if(e.type==='car'||e.type==='bus'){const len=e.type==='bus'?5:3,ht=e.type==='bus'?3:2;
   cars.push({kind:e.type,name:e.name,lane:e.lane,x:(e.dir<0?(e.x1+1)*TS-len*TS:e.x0*TS),y:(e.lane+1)*TS,w:len*TS,h:ht*TS,x0:e.x0*TS,x1:(e.x1+1)*TS,sp:e.speed*TS,dir:e.dir||1,col:carCol(e)})}
  else ents.push({type:e.type,x,y:y-24,base:y-24,ph:Math.random()*6,got:false})}
 arenas=(L.arenas||[]).map(a=>Object.assign({},a,{state:'idle'}));
 climbMeta=[];for(const t of L.trees||[])climbMeta.push({x:t.trunk.x,top:t.trunk.top,base:t.trunk.base,skin:'tree',name:t.name});
 for(const c of L.climbables||[])climbMeta.push({x:c.x,top:c.top,base:c.base,skin:/drain|pipe/i.test(c.name)?'pipe':/pole|mast|post|light/i.test(c.name)?'pole':'tree',name:c.name,arms:c.arms});
 initBoss();
 cam.x=Math.max(0,p.x-VW*.35);LV.ready=true;LV.id=L.id;LV.level=L;msg((L.label?L.label+' · ':'')+L.name,'#ffe08a',true)}
function carCol(e){const C=['#d9483b','#3b7dd9','#e8c23a','#5aa95a','#9a5ad9'];let h=0;for(const ch of e.name||'')h=(h*31+ch.charCodeAt(0))>>>0;return e.type==='bus'?'#f2f2f2':C[h%C.length]}
const FLY=new Set(['seagull','magpie','wasp']);
function mkEnemy(id,x,y,e){const fly=FLY.has(id);return{id,x,y:fly?y-TS*2:y,x0:x-2.5*TS,x1:x+2.5*TS,vx:(Math.random()<.5?-1:1)*(fly?90:60),vy:0,hp:/bulldog|husky|labrador|goose/.test(id)?3:2,fly,alive:true,ko:0,face:-1,t:Math.random()*6,hurt:0,route:e&&e.route,w:fly?60:70,h:fly?60:/rat|hedgehog|weta|crab/.test(id)?50:80,arena:e&&e.arena}}
// ---------- Paddy physics ----------
function boxHits(x,y,w,h,test){const c0=Math.floor((x-w/2)/TS),c1=Math.floor((x+w/2-1)/TS),r0=Math.floor((y-h)/TS),r1=Math.floor((y-1)/TS);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(test(c,r))return{c,r};return null}
function moveX(dt){let nx=p.x+p.vx*dt;if(arena&&arena.state==='lock'){nx=Math.max(arena.x0*TS+BW/2,Math.min((arena.x1+1)*TS-BW/2,nx))}
 nx=Math.max(BW/2,Math.min(W*TS-BW/2,nx));
 const h=boxHits(nx,p.y-2,BW,BH-4,solidAt);if(h){if(p.vx>0)nx=h.c*TS-BW/2-.01;else if(p.vx<0)nx=(h.c+1)*TS+BW/2+.01;p.wallDir=Math.sign(p.vx);p.vx=0}else p.wallDir=0;p.x=nx}
function moveY(dt){const oy=p.y;let ny=p.y+p.vy*dt;p.ground=false;
 if(p.vy>=0){const c0=Math.floor((p.x-BW/2+4)/TS),c1=Math.floor((p.x+BW/2-5)/TS);
  for(let r=Math.floor(oy/TS);r<=Math.floor(ny/TS);r++){let hit=false,ch='';for(let c=c0;c<=c1;c++){const t=tile(c,r);if(BLOCK.has(t)||t==='^'||(ONE.has(t)&&p.drop<=0&&oy<=r*TS+1)){hit=true;if(ch!=='J')ch=t}}   // a pad under any part of his feet counts
   if(hit&&r*TS>=oy-1){ny=r*TS;const fall=p.vy;p.vy=0;p.ground=true;p.jumps=0;if(ch==='^')hazard();
    if(ch==='J'&&!K.down&&fall>150){p.vy=-(K.jump||K.up?1224:900);p.ground=false;p.jumps=1;fx.push({k:'ring',x:p.x,y:ny,l:.4});LV.log.push(K.jump||K.up?'bounce:full':'bounce');msg('BOING!','#7fffd4')}   // ~6 tiles with jump held, ↓ absorbs it; double jump still free after, no damage
    break}}}
 else{const h=boxHits(p.x,oy-BH+1,BW-8,oy-ny+1,solidAt);   // sweep the head only, so a wall beside him never counts as a ceiling
if(h){ny=(h.r+1)*TS+BH+.01;p.vy=60;bonk(h.c,h.r)}}
 p.y=ny;if(p.y>H*TS+200)water()}
function bonk(c,r){const t=tile(c,r);if(t==='?'&&!used.has(c+','+r)){used.add(c+','+r);p.coins+=3;fx.push({k:'pop',x:(c+.5)*TS,y:r*TS,l:.8});msg('+3 COINS','#ffd34d');LV.log.push('bonk')}if(t==='B')breakTile(c,r)}
function breakTile(c,r){setTile(c,r,'.');for(let i=0;i<10;i++)fx.push({k:'chip',x:(c+.5)*TS,y:(r+.5)*TS,vx:(Math.random()-.5)*400,vy:-200-Math.random()*300,l:.8});LV.log.push('break')}
function hurt(dir,dmg){if(p.inv>0||p.done)return;p.hp-=dmg;p.inv=1.2;p.vx=dir*320;p.vy=-480;p.ground=false;p.state='hurt';p.t=0;if(p.hp<=0)respawn(true)}
function hazard(){if(p.inv>0)return;hurt(-p.face,1);msg('OUCH!','#ff9a7a')}
function water(){msg('SPLASH! back to dry ground','#9fdcff');p.x=p.safe.x;p.y=p.safe.y;p.vx=p.vy=0;p.inv=1;p.state='normal'}
function respawn(dead){if(dead&&arena&&arena.boss)bossReset();if(dead){p.deaths++;msg('BACK TO THE CHECKPOINT','#ffd0a0',true)}p.hp=p.max;p.x=p.cp.x;p.y=p.cp.y;p.vx=p.vy=0;p.inv=1.5;p.state='normal'}
function trunkAt(x,y){const c=Math.floor(x/TS);for(let r=Math.floor((y-BH*.7)/TS);r<=Math.floor((y-4)/TS);r++)if(tile(c,r)==='T')return c;return -1}
function trunkSpan(c){let top=H,base=-1;for(let r=0;r<H;r++)if(tile(c,r)==='T'){top=Math.min(top,r);base=Math.max(base,r)}return{top,base}}
function stepOff(dir){// a branch / roof / fence next to the trunk near the feet
 const c=p.climbX;for(let dc=1;dc<=2;dc++){const cc=c+dir*dc;for(let dr=-2;dr<=2;dr++){const r=Math.floor(p.y/TS)+dr;const t=tile(cc,r);if((BLOCK.has(t)||ONE.has(t))&&!solidAt(cc,r-1)&&!solidAt(cc,r-2)){p.x=(cc+.5)*TS;p.y=r*TS;p.state='normal';p.vx=0;p.vy=0;p.ground=true;p.face=dir;LV.log.push('stepoff');return true}}}return false}
function tryLedge(){if(p.ground||p.vy<-200)return false;const dir=K.right?1:K.left?-1:0;if(!dir)return false;
 const c=Math.floor((p.x+dir*(BW/2+6))/TS);const top=p.y-BH;for(let r=Math.floor((top-10)/TS);r<=Math.floor((top+BH*.45)/TS);r++){
  if(tile(c,r)==='L'&&!solidAt(c,r-1)&&!solidAt(c,r-2)&&!solidAt(c,r-3)){p.state='ledge';p.t=0;p.face=dir;p.hang={c,r};p.vx=p.vy=0;p.x=c*TS+(dir>0?-BW/2:TS+BW/2);p.y=r*TS+BH*.55;LV.log.push('ledge');return true}}return false}
function update(dt){LV.t+=dt;p.t+=dt;p.inv=Math.max(0,p.inv-dt);p.drop=Math.max(0,p.drop-dt);p.power=Math.max(0,p.power-dt);p.atk=Math.max(0,p.atk-dt);
 if(P.restart){init(L)}if(P.next&&p.done){go(LEVELS[(LEVELS.indexOf(L.id)+1)%LEVELS.length])}
 const dir=(K.right?1:0)-(K.left?1:0);
 if(p.done){p.vx=0;p.vy+=G*dt;moveY(dt);p.anim='victory';return}
 if(p.state==='climb'){const sp=trunkSpan(p.climbX);p.vx=0;p.vy=(K.up?-1:0)*170+(K.down?1:0)*200;p.y+=p.vy*dt;p.x=(p.climbX+.5)*TS;
  const minY=(sp.top+1)*TS+BH*.25,maxY=(sp.base+1)*TS;if(p.y<minY)p.y=minY;
  if(p.y>=maxY){p.y=maxY;if(K.down){p.state='normal'}}
  p.anim='climb';p.animSpeed=Math.abs(p.vy)>0?1:0;
  if(P.jump){p.state='normal';p.vy=-JV*.9;p.vx=(dir||p.face)*300;p.face=dir||p.face;p.jumps=1;LV.log.push('trunkjump')}
  else if(dir&&stepOff(dir)){}
  else if(!K.up&&!K.down&&p.y<maxY&&dir===0){}
 }else if(p.state==='ledge'){p.anim='ledge';if(P.jump||K.up||p.t>.35){const h=p.hang;p.x=(h.c+.5)*TS+p.face*0;p.y=h.r*TS;p.state='normal';p.ground=true;p.vy=0;LV.log.push('pullup')}else if(K.down){p.state='normal';p.vy=100}
 }else{
  if(p.state==='hurt'&&(p.t>.35||p.ground&&p.t>.12))p.state='normal';
  if(p.state==='normal'){const sp=(K.run||p.power>0?RUN:WALK)*(p.power>0?1.15:1);const want=dir*sp;p.vx+=(want-p.vx)*Math.min(1,dt*(p.ground?14:6));if(dir)p.face=dir;
   if(K.up&&trunkAt(p.x,p.y)>=0){p.climbX=trunkAt(p.x,p.y);p.state='climb';p.vx=0;p.vy=0;P.up=0;LV.log.push('climb')}
   else if(P.up)P.jump=1;   // ↑ = jump away from a trunk
   if(P.down&&p.ground){const c0=Math.floor((p.x-BW/2+4)/TS),c1=Math.floor((p.x+BW/2-5)/TS),r=Math.round(p.y/TS);let one=false;for(let c=c0;c<=c1;c++){if(ONE.has(tile(c,r)))one=true}
    if(one){p.drop=.22;p.y+=2;p.ground=false;LV.log.push('drop')}}
   if(P.jump){if(p.ground){p.vy=-JV;p.ground=false;p.jumps=1;fx.push({k:'dust',x:p.x,y:p.y,l:.4})}
    else if(p.wallDir&&!p.ground){p.vy=-DJV;p.vx=-p.wallDir*380;p.face=-p.wallDir;p.jumps=1;LV.log.push('walljump');msg('WALL JUMP!')}
    else if(p.jumps<2){p.vy=-DJV;p.jumps=2;LV.log.push('djump');fx.push({k:'ring',x:p.x,y:p.y-30,l:.4})}}
   if(!K.jump&&!K.up&&p.vy<-300)p.vy+=G*dt*.9;   // short hop when jump is let go
   if(P.attack&&p.atk<=0){p.atk=.32;p.atkHit=new Set();LV.log.push('attack')}}
  if(p.state!=='climb'&&p.state!=='ledge'){p.vy=Math.min(p.vy+G*dt,1500);moveX(dt);moveY(dt);if(p.state==='normal')tryLedge()}
  if(p.ground&&tile(Math.floor(p.x/TS),Math.round(p.y/TS))!=='^')p.safe={x:p.x,y:p.y};
  if(boxHits(p.x,p.y,BW-20,BH-20,(c,r)=>tile(c,r)==='~'))water();
  p.anim=p.state==='hurt'?'hurt':p.atk>0?'attack':!p.ground?(p.wallDir&&p.vy>0?'wall':p.jumps===2&&p.vy<0?'djump':p.vy<0?'jump':'fall'):Math.abs(p.vx)>RUN*.8?'run':Math.abs(p.vx)>30?'walk':'idle'}
 // attack: hits enemies, breakables and item blocks in front
 if(p.atk>.12&&p.atk<.28){const ax=p.x+p.face*70,ay=p.y-80;
  for(const e of enemies){if(!e.alive||p.atkHit.has(e))continue;if(Math.abs(e.x-ax)<75&&Math.abs((e.y-e.h/2)-ay)<90){p.atkHit.add(e);hitEnemy(e,p.face)}}
  const h=boxHits(ax,ay+40,70,110,(c,r)=>tile(c,r)==='B'||tile(c,r)==='?');if(h)bonk(h.c,h.r)}
 // checkpoints / goal
 for(const c of L.checkpoints||[]){if(p.x>=(c.x)*TS&&(!p.cp||p.cp.x<c.x*TS)){p.cp={x:(c.x+.5)*TS,y:(c.y+1)*TS};msg('CHECKPOINT','#7fffd4')}}
 const g=L.goal;if(!p.done&&p.x>=g.x*TS){p.done=true;msg((L.label||L.id)+' CLEAR!','#ffe08a',true);LV.log.push('goal');if(L.mission&&window.missionComplete){LV.mission=missionComplete(L.mission);LV.log.push('mission:'+L.mission)}}   // level JSON 'mission': id -> gift + form unlock (mission.js)
 P.jump=P.attack=P.down=P.up=P.restart=P.next=0}
function hitEnemy(e,dir){if(!e.alive)return;e.hp--;e.hurt=.25;e.vx=dir*240;e.y-=4;fx.push({k:'pow',x:e.x,y:e.y-e.h/2,l:.35});if(e.hp<=0){e.alive=false;e.ko=1;p.coins+=1;LV.log.push('ko:'+e.id)}}
function updEnemies(dt){for(const e of enemies){e.t+=dt;if(!e.alive){e.ko=Math.max(0,e.ko-dt);continue}e.hurt=Math.max(0,e.hurt-dt);
  if(e.fly){e.x+=e.vx*dt;if(e.x<e.x0||e.x>e.x1){e.vx*=-1}e.y+=Math.sin(e.t*2)*30*dt}
  else{if(e.hurt<=0){const sp=e.arenaSpd||60;e.vx=Math.sign(e.vx||1)*sp}e.vy=Math.min(e.vy+G*dt,1400);let nx=e.x+e.vx*dt;const c=Math.floor((nx+Math.sign(e.vx)*e.w/2)/TS),r=Math.floor((e.y-10)/TS);
   const fl=surfaceRow(Math.floor(nx/TS),Math.floor((e.y-4)/TS));
   if(solidAt(c,r)||(e.hurt<=0&&(fl*TS>e.y+TS*.5))||(!e.inArena&&(nx<e.x0||nx>e.x1))){e.vx*=-1;nx=e.x}if(e.inArena&&arena)nx=Math.max(arena.x0*TS+30,Math.min((arena.x1+1)*TS-30,nx));e.x=nx;
   let ny=e.y+e.vy*dt;const fr=surfaceRow(Math.floor(e.x/TS),Math.floor((e.y-4)/TS));if(ny>=fr*TS){ny=fr*TS;e.vy=0}e.y=ny}
  e.face=e.vx<0?-1:1;
  // touch: stomp from above, else a small bump
  if(Math.abs(e.x-p.x)<(e.w+BW)/2-6&&p.y>e.y-e.h&&p.y-BH<e.y){if(p.vy>200&&p.y<e.y-e.h+30){hitEnemy(e,p.face);hitEnemy(e,p.face);p.vy=-620;LV.log.push('stomp')}else if(p.atk<=0)hurt(Math.sign(p.x-e.x)||1,1)}}}
function updKids(dt){for(const k of kids){k.x+=k.dir*k.sp*dt;if(k.x>k.x1){k.x=k.x1;k.dir=-1}if(k.x<k.x0){k.x=k.x0;k.dir=1}k.ph+=dt;
  // harmless: no collision at all. Hop bonus: Paddy airborne right above the kid, once per pass
  const over=!p.ground&&Math.abs(p.x-k.x)<44&&p.y<k.y-40;
  if(over&&!k.hopped&&k.bonus==='hop'){k.hopped=true;p.coins+=3;msg('HOP BONUS +3','#ffd34d');LV.log.push('hop')}
  if(Math.abs(p.x-k.x)>110||p.ground&&Math.abs(p.x-k.x)>60)k.hopped=false}}
function updCars(dt){for(const v of cars){v.x+=v.dir*v.sp*dt;if(v.x+v.w>v.x1){v.x=v.x1-v.w;v.dir=-1}if(v.x<v.x0){v.x=v.x0;v.dir=1}
  const cx=v.x+v.w/2;if(p.inv<=0&&Math.abs(p.x-cx)<(v.w+BW)/2-8&&p.y>v.y-v.h+6&&p.y-BH<v.y){const d=Math.sign(p.x-cx)||-v.dir;p.vx=d*360;p.vy=-430;p.ground=false;p.inv=.8;p.state='hurt';p.t=0;msg('BEEP BEEP!','#ffe08a');LV.log.push('bump:'+v.kind)}}}   // knock-back only: no damage
function updArenas(){for(const a of arenas){if(a.state==='idle'&&p.x>a.x0*TS+TS&&p.x<(a.x1)*TS&&!arena){a.state='lock';arena=a;a.list=[];msg(a.name.toUpperCase()+'!','#ff9a5a',true);LV.log.push('arena:'+a.name);
   const n=a.enemies.length;a.enemies.forEach((id,i)=>{const x=(a.x0+1.5+(a.x1-a.x0-2)*(i+.5)/n)*TS;const e=mkEnemy(id,x,(a.y+1)*TS-(FLY.has(id)?0:300),{});e.inArena=true;e.arenaSpd=90;e.x0=a.x0*TS;e.x1=(a.x1+1)*TS;enemies.push(e);a.list.push(e)})}
  if(a.state==='lock'&&a.list.every(e=>!e.alive)){a.state='done';arena=null;msg('CLEAR!','#7fffd4',true);LV.log.push('cleared:'+a.name)}}}
function updEnts(){for(const e of ents){if(e.got)continue;e.ph+=.05;e.y=e.base+Math.sin(e.ph)*4;if(Math.abs(e.x-p.x)<50&&e.y>p.y-BH-10&&e.y<p.y+10){e.got=true;
  if(e.type==='coin')p.coins++;else if(e.type==='fish'){p.hp=Math.min(p.max,p.hp+1);p.fish++;msg('FISH! +1 ♥','#9fdcff')}else if(e.type==='yarn'){p.yarn++;msg('YARN BALL '+p.yarn+'/4','#ff9ad5')}else if(e.type==='powerup'){p.power=8;msg('ZOOMIES POWER!','#7fffd4')}
  fx.push({k:'spark',x:e.x,y:e.y,l:.4})}}}
// ---------- boss arena (1-7): bossArena.boss 'big_bruno' -> game.js BOSS (Big Bruno the Brawler, b_* sheets drawn at DSC 1.05) ----------
// Same sheets + same relative scale as the brawler arena: level sprites are SC x game units, so Bruno draws at SC*DSC and his body
// box is measured from his b_idle frames at that scale (median frame width x anchor height). Walls close at triggerX, adds at phase2.
const BOSSES={big_bruno:{name:'BIG BRUNO',title:'THE BRAWLER',full:'Big Bruno the Brawler',sheet:'b_',dsc:1.05,hp:16}};   // mirrors game.js const BOSS (round 12)
let boss=null,bossA=null;
function med(a){a=a.slice().sort((x,y)=>x-y);return a[a.length>>1]}
function initBoss(){boss=null;bossA=null;const B=L.bossArena;if(!B)return;const def=BOSSES[B.boss];if(!def){console.warn('unknown boss',B.boss);return}
 const k=SC*def.dsc,fr=F[def.sheet+'idle']||[];const w=fr.length?Math.round(med(fr.map(f=>f.w))*k):192,h=fr.length?Math.round(med(fr.map(f=>f.ay))*k):336;
 for(const a of ['idle','walk','punch','bark','bite','hurt','ko'])(F[def.sheet+a]||[]).forEach(f=>img(f.f));
 const W0=B.walls||{};bossA={name:B.name,boss:true,x0:B.x0,x1:B.x1,trig:W0.triggerX!=null?W0.triggerX:B.x0+2,wl:W0.left!=null?W0.left:B.x0-1,wr:W0.right!=null?W0.right:B.x1+1,rows:W0.rows||[0,H-3],state:'idle',list:[],phase2:B.phase2,p2:false};
 const sp=B.bossSpawn||{x:B.x1-10,y:B.floorY,face:-1};
 boss={def,id:B.boss,x:(sp.x+.5)*TS,y:(sp.y+1)*TS,sx:(sp.x+.5)*TS,face:sp.face||-1,w,h,hp:def.hp,max:def.hp,st:'idle',t:0,ph:0,inv:0,flash:0,n:0,alive:true,hit:false}}
function bossReset(){if(!boss)return;boss.hp=boss.max;boss.x=boss.sx;boss.st='idle';boss.t=0;boss.alive=true;bossA.p2=false;bossA.list.forEach(e=>{e.alive=false;e.ko=0});bossA.list=[];bossA.state='idle';if(arena===bossA)arena=null}
function bossSet(st){boss.st=st;boss.t=0;boss.hit=false}
function updBoss(dt){if(!boss)return;const b=boss,A=bossA;b.t+=dt;b.ph+=dt;b.inv=Math.max(0,b.inv-dt);b.flash=Math.max(0,b.flash-dt);
 if(A.state==='idle'&&p.x>A.trig*TS&&p.x<(A.wr)*TS&&!arena&&b.alive){A.state='lock';arena=A;msg(b.def.name+' — '+b.def.title+'!','#ff9a5a',true);LV.log.push('boss:enter')}
 if(!b.alive){if(b.st!=='ko')bossSet('ko');return}
 if(A.state!=='lock'){b.st='idle';return}
 const dx=p.x-b.x,adx=Math.abs(dx);
 switch(b.st){
  case 'idle':if(b.t>.9)bossSet('walk');break;
  case 'walk':b.face=Math.sign(dx)||b.face;b.x+=b.face*115*dt;if(adx<b.w/2+90)bossSet(++b.n%3===0?'bark':'wind');else if(b.t>2.6)bossSet(++b.n%3===0?'bark':'wind');break;
  case 'wind':if(b.t>.7)bossSet('punch');break;                                  // big telegraphed punch (red glow), easy to read
  case 'punch':if(!b.hit&&b.t>.05){const rx=b.x+b.face*(b.w/2+40);if(Math.abs(p.x-rx)<110&&p.y>b.y-b.h*.75){b.hit=true;hurt(b.face,1);LV.log.push('boss:punch')}}if(b.t>.35)bossSet('rest');break;
  case 'bark':if(!b.hit&&b.t>.6){b.hit=true;fx.push({k:'ring',x:b.x+b.face*80,y:b.y-60,l:.6});if(adx<5*TS&&p.ground&&Math.sign(dx)===b.face){hurt(b.face,1);LV.log.push('boss:bark')}}if(b.t>1)bossSet('rest');break;   // bark shockwave on the floor: jump it
  case 'rest':if(b.t>.9)bossSet('idle');break;
  case 'hurt':if(b.t>.3)bossSet('rest');break}
 b.x=Math.max((A.x0)*TS+b.w/2,Math.min((A.x1+1)*TS-b.w/2,b.x));
 // body: overlapping his box pushes Paddy out (bump only); stomp from above = 2 hits
 const ov=Math.abs(p.x-b.x)<(b.w+BW)/2&&p.y>b.y-b.h&&p.y-BH<b.y;
 if(ov){if(p.vy>200&&p.y<b.y-b.h+40){bossHit(2);p.vy=-760;LV.log.push('boss:stomp')}else{const d=Math.sign(p.x-b.x)||-b.face;p.x=b.x+d*((b.w+BW)/2+1);p.vx=d*260}}
 // Paddy's swipe
 if(p.atk>.12&&p.atk<.28&&!p.atkHit.has(b)){const ax=p.x+p.face*70,ay=p.y-80;if(Math.abs(ax-b.x)<b.w/2+50&&ay>b.y-b.h-40&&ay<b.y+20){p.atkHit.add(b);bossHit(1)}}
 // phase 2: adds drop in from the bridge deck
 if(!A.p2&&A.phase2&&b.hp<=b.max*(A.phase2.atHealth||.5)){A.p2=true;msg('PHASE 2 — HERE COME HIS MATES!','#ffd34d',true);LV.log.push('boss:phase2');
  for(const a of A.phase2.adds||[]){const e=mkEnemy(a.id,(a.x+.5)*TS,TS*2,{});e.inArena=true;e.arenaSpd=90;e.x0=A.x0*TS;e.x1=(A.x1+1)*TS;enemies.push(e);A.list.push(e)}}}
function bossHit(n){const b=boss;if(!b.alive||b.inv>0)return;b.hp=Math.max(0,b.hp-n);b.inv=.22;b.flash=.15;fx.push({k:'pow',x:b.x,y:b.y-b.h*.6,l:.35});LV.log.push('boss:hit');
 if(b.st!=='punch'&&b.st!=='bark')bossSet('hurt');
 if(b.hp<=0){b.alive=false;bossSet('ko');p.coins+=10;bossA.state='done';bossA.list.forEach(e=>{if(e.alive){e.alive=false;e.ko=1}});if(arena===bossA)arena=null;msg('K.O. — '+b.def.name+' is having a little sit','#7fffd4',true);LV.log.push('boss:ko')}}
function bossFrame(){const b=boss,s=b.def.sheet;switch(b.st){
 case 'walk':return [s+'walk',b.ph*7];case 'wind':return [s+'punch',Math.min(2,b.t*3.6)];case 'punch':return [s+'punch',3+Math.min(1,b.t*10)];
 case 'bark':return [s+'bark',Math.min(4,b.t*7)];case 'hurt':return [s+'hurt',Math.min(1,b.t*7)];case 'ko':return [s+'ko',1+Math.floor(b.ph*1.5)%2];
 default:{const q=[0,1,2,3,4,3,2,1];return [s+'idle',q[Math.floor(b.ph*5)%8]]}}}
function drawBoss(){if(!boss)return;const b=boss,A=bossA,x=b.x-cam.x,y=b.y-cam.y;
 if(A.state==='lock')for(const c of [A.wl,A.wr]){const wx=c*TS-cam.x;ctx.fillStyle='#8a8578';ctx.fillRect(wx,A.rows[0]*TS-cam.y,TS,(A.rows[1]-A.rows[0]+1)*TS);ctx.fillStyle='#9b4a2a';for(let r=A.rows[0];r<=A.rows[1];r+=2)ctx.fillRect(wx+6,r*TS-cam.y+8,TS-12,10)}   // old concrete abutment / rusty floodgate
 if(x<-400||x>VW+400)return;
 if(b.st==='wind'||b.st==='bark'&&b.t<.6){const u=Math.sin(LV.t*22)*.5+.5,g=ctx.createRadialGradient(x+b.face*90,y-b.h*.65,4,x+b.face*90,y-b.h*.65,110);g.addColorStop(0,`rgba(255,40,30,${.45+.3*u})`);g.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+b.face*90,y-b.h*.65,110,0,6.283);ctx.fill()}
 ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x,y+3,b.w*.5,12,0,0,6.283);ctx.fill();
 const [k,fi]=bossFrame();if(!drawFrame(k,fi,x,y,-b.face,SC*b.def.dsc,b.flash>0?.6:1)){ctx.fillStyle='#8a6a4a';ctx.fillRect(x-b.w/2,y-b.h,b.w,b.h)}
 if(qs.has('hitbox')){ctx.strokeStyle='#f0f';ctx.strokeRect(x-b.w/2,y-b.h,b.w,b.h)}}
function bossHud(){if(!boss||bossA.state!=='lock')return;const w=520,x=VW/2-w/2,y=62;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-4,y-4,w+8,26);ctx.fillStyle='#4a1a1a';ctx.fillRect(x,y,w,18);ctx.fillStyle=boss.hp>boss.max/2?'#ff5a3a':'#ffd34d';ctx.fillRect(x,y,w*boss.hp/boss.max,18);
 ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText(boss.def.name+' '+boss.def.title,VW/2,y+15)}
// ---------- camera ----------
function updCam(dt){let tx=p.x-VW*.4+p.face*60;if(arena&&arena.state==='lock'){const a0=arena.x0*TS,a1=(arena.x1+1)*TS;tx=(a1-a0)<=VW?(a0+a1)/2-VW/2:Math.max(a0,Math.min(a1-VW,tx))}
 tx=Math.max(0,Math.min(W*TS-VW,tx));cam.x+=(tx-cam.x)*Math.min(1,dt*6);const ty=Math.max(0,Math.min(H*TS-VH,p.y-VH*.62));cam.y+=(ty-cam.y)*Math.min(1,dt*5)}
// ---------- drawing ----------
const SKIN={J:'#3fbf7f',P:'#b9b4aa',R:'#8a5a44',o:'#cfcfcf',t:'#9aa6b5',r:'#e8c23a'};
function sky(){const th=L.theme||'';const g=ctx.createLinearGradient(0,0,0,VH);if(/night/.test(th)){g.addColorStop(0,'#141a3a');g.addColorStop(1,'#3a3260')}else{g.addColorStop(0,'#7fc4f0');g.addColorStop(1,'#e6f3ff')}ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
 // far hills / bush backdrop (parallax)
 ctx.fillStyle=L.backdrop&&L.backdrop.bush?'#4f8a52':'#9cc6a8';for(let i=-1;i<12;i++){const x=i*260-(cam.x*.2)%260;ctx.beginPath();ctx.ellipse(x,VH*.72,200,90,0,0,6.283);ctx.fill()}
 if(L.backdrop)for(const s of L.backdrop.spires||[]){const x=s.x*TS-cam.x*.5;ctx.fillStyle='#e9e2d4';ctx.fillRect(x-14,VH*.38,28,140);ctx.beginPath();ctx.moveTo(x-18,VH*.38);ctx.lineTo(x,VH*.2);ctx.lineTo(x+18,VH*.38);ctx.fill()}}
function drawTiles(){const c0=Math.max(0,Math.floor(cam.x/TS)),c1=Math.min(W-1,Math.ceil((cam.x+VW)/TS));
 // trunk / pipe / pole skins
 for(const m of climbMeta){const x=m.x*TS-cam.x,y0=m.top*TS-cam.y,y1=(m.base+1)*TS-cam.y;if(x<-200||x>VW+200)continue;
  if(m.skin==='pipe'){ctx.fillStyle='#8d959c';ctx.fillRect(x+16,y0,16,y1-y0);ctx.fillStyle='#6d757c';for(let y=y0;y<y1;y+=48)ctx.fillRect(x+12,y,24,6)}
  else if(m.skin==='pole'){ctx.fillStyle='#5d666e';ctx.fillRect(x+19,y0,10,y1-y0);if(m.arms)for(const a of m.arms){ctx.fillRect(a.x0*TS-cam.x,a.y*TS-cam.y,(a.x1-a.x0+1)*TS,6)}}
  else{ctx.fillStyle='#7a5234';ctx.fillRect(x+10,y0,28,y1-y0);ctx.fillStyle='#5e3d25';for(let y=y0;y<y1;y+=22)ctx.fillRect(x+14,y,8,10)}}
 for(let r=0;r<H;r++)for(let c=c0;c<=c1;c++){const t=tile(c,r),d=deco(c,r),x=c*TS-cam.x,y=r*TS-cam.y;
  if(d!=='.'&&!BLOCK.has(t)&&!ONE.has(t))drawDeco(d,x,y);
  if(t==='J'){ctx.fillStyle='#2a2a2a';ctx.fillRect(x,y+10,TS,TS-10);ctx.fillStyle='#3fd18a';ctx.fillRect(x+2,y,TS-4,12);ctx.fillStyle='#ffe08a';ctx.fillRect(x+6,y+14,TS-12,4)}
  else if(t==='#'||t==='L'){ctx.fillStyle=SKIN[d]||(r>0&&!BLOCK.has(tile(c,r-1))?'#8f8a80':'#7a756c');ctx.fillRect(x,y,TS,TS);if(!BLOCK.has(tile(c,r-1))){ctx.fillStyle=d==='R'?'#a8452f':'#6aa84f';ctx.fillRect(x,y,TS,8)}
   if(t==='L'&&!BLOCK.has(tile(c,r-1))){ctx.fillStyle='#ffe08a';ctx.fillRect(x+(BLOCK.has(tile(c-1,r))?TS-10:0),y,10,10);if(!BLOCK.has(tile(c+1,r)))ctx.fillRect(x+TS-10,y,10,10)}
   ctx.strokeStyle='rgba(0,0,0,.12)';ctx.strokeRect(x+.5,y+.5,TS-1,TS-1)}
  else if(t==='B'){ctx.fillStyle='#c9b48a';ctx.fillRect(x,y,TS,TS);ctx.strokeStyle='#8a7550';ctx.lineWidth=3;ctx.strokeRect(x+3,y+3,TS-6,TS-6);ctx.beginPath();ctx.moveTo(x+6,y+TS-6);ctx.lineTo(x+TS-6,y+6);ctx.stroke();ctx.lineWidth=1}
  else if(t==='?'){const u=used.has(c+','+r);ctx.fillStyle=u?'#9a8a6a':'#f2b632';ctx.fillRect(x,y,TS,TS);ctx.fillStyle=u?'#7a6a4a':'#fff';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(u?'·':'?',x+TS/2,y+TS-12)}
  else if(t==='='){ctx.fillStyle=d==='b'?'#6b4a2e':d==='g'?'rgba(170,220,240,.85)':'#a0a8b0';ctx.fillRect(x,y,TS,12);if(d==='b'){ctx.fillStyle='#4f8a3a';ctx.beginPath();ctx.ellipse(x+24,y-6,30,14,0,0,6.283);ctx.fill()}}
  else if(t==='F'){ctx.fillStyle='#d8c8a8';ctx.fillRect(x,y,TS,8);ctx.fillStyle='#bfae8c';for(let i=4;i<TS;i+=12)ctx.fillRect(x+i,y+8,6,TS*1.6)}
  else if(t==='^'){ctx.fillStyle='#e0703a';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*12,y+TS);ctx.lineTo(x+i*12+6,y+TS-16);ctx.lineTo(x+i*12+12,y+TS);ctx.fill()}}
  else if(t==='~'){ctx.fillStyle='rgba(60,140,220,.7)';ctx.fillRect(x,y+10+Math.sin(LV.t*3+c)*3,TS,TS-10)}}
 // tree canopies
 for(const tr of L.trees||[]){const x=(tr.trunk.x+.5)*TS-cam.x,y=tr.trunk.top*TS-cam.y;if(x<-300||x>VW+300)continue;const red=/pohutukawa/i.test(tr.name);
  ctx.fillStyle='rgba(46,110,52,.9)';for(const [dx,dy,rx] of [[-60,10,80],[60,10,80],[0,-30,90]]){ctx.beginPath();ctx.ellipse(x+dx,y+dy,rx,50,0,0,6.283);ctx.fill()}
  if(red){ctx.fillStyle='#d9332f';for(let i=0;i<18;i++){ctx.beginPath();ctx.arc(x+Math.cos(i*2.4)*90,y+Math.sin(i*1.7)*40,5,0,6.283);ctx.fill()}}}
 // roofs trim
 for(const rf of L.roofs||[]){const x=rf.x0*TS-cam.x,y=rf.y*TS-cam.y;ctx.fillStyle='#a8452f';ctx.fillRect(x-6,y-6,(rf.x1-rf.x0+1)*TS+12,8)}}
function drawDeco(d,x,y){switch(d){
 case 'k':ctx.fillStyle='#3f7d3f';ctx.beginPath();ctx.arc(x+24,y+24,28,0,6.283);ctx.fill();break;
 case 'h':ctx.fillStyle='#3f7d3f';ctx.beginPath();ctx.arc(x+24,y+24,26,0,6.283);ctx.fill();ctx.fillStyle='#d9332f';ctx.beginPath();ctx.arc(x+14,y+18,7,0,6.283);ctx.arc(x+32,y+30,7,0,6.283);ctx.fill();break;
 case 'f':ctx.fillStyle='#bfae8c';for(let i=4;i<TS;i+=12)ctx.fillRect(x+i,y,6,TS);break;
 case 'w':ctx.fillStyle='#9fd0e6';ctx.fillRect(x+3,y+3,TS-6,TS-6);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x+8,y+6,6,TS-12);break;
 case 'p':ctx.fillStyle='#6d6258';ctx.fillRect(x+20,y,8,TS);break;
 case 'n':ctx.fillStyle='#4e8a3e';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x+8+i*8,y+TS);ctx.lineTo(x+4+i*9,y+8);ctx.lineTo(x+12+i*8,y+TS);ctx.fill()}break;
 case 'l':ctx.fillStyle='#4a525a';ctx.fillRect(x+21,y,6,TS);ctx.fillStyle='#ffe9a0';ctx.fillRect(x+14,y+2,20,8);break;
 case 'c':ctx.fillStyle='#5a7fa8';ctx.fillRect(x,y+20,TS,22);ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x+12,y+44,6,0,6.283);ctx.arc(x+36,y+44,6,0,6.283);ctx.fill();break;
 case 'G':ctx.fillStyle='#ffd34d';ctx.fillRect(x+4,y,10,TS);ctx.fillRect(x+TS-14,y,10,TS);break;
 case 's':case 'S':break;
 default:{let h=d.charCodeAt(0)*97%360;ctx.fillStyle=`hsla(${h},35%,55%,.55)`;ctx.fillRect(x+6,y+6,TS-12,TS-12)}}}
function signs(){ctx.textAlign='center';
 for(const s of L.shopSigns||[]){const x=s.x0*TS-cam.x,w=(s.x1-s.x0+1)*TS,y=s.y*TS-cam.y;if(x>VW||x+w<0)continue;const b=s.bg||[80,80,80];ctx.fillStyle=`rgb(${b[0]},${b[1]},${b[2]})`;ctx.fillRect(x,y+6,w,TS-12);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.fillText(s.text,x+w/2,y+TS/2+7)}
 for(const s of L.tutorial||[]){const x=(s.x+.5)*TS-cam.x;if(x<-200||x>VW+200)continue;let r=surfaceRow(s.x,6);if(r>=H)r=surfaceRow(s.x,0);const y=r*TS-cam.y;   // street-level sign (not on a branch above it)
  ctx.fillStyle='#6b4a2e';ctx.fillRect(x-4,y-70,8,70);ctx.font='bold 15px sans-serif';const w=Math.max(120,ctx.measureText(s.text).width+20);ctx.fillStyle='#fff7d6';ctx.fillRect(x-w/2,y-118,w,48);ctx.strokeStyle='#6b4a2e';ctx.lineWidth=3;ctx.strokeRect(x-w/2,y-118,w,48);ctx.lineWidth=1;ctx.fillStyle='#3a2a1a';ctx.fillText(s.text,x,y-88)}
 // checkpoints + goal
 for(const c of L.checkpoints||[]){const x=(c.x+.5)*TS-cam.x,y=(c.y+1)*TS-cam.y;ctx.fillStyle='#ddd';ctx.fillRect(x-3,y-110,6,110);ctx.fillStyle=p.cp&&p.cp.x>=x+cam.x-1?'#7fffd4':'#ff8a5a';ctx.fillRect(x+3,y-110,36,24)}
 const g=L.goal,gx=(g.x+.5)*TS-cam.x,gy=(g.y+1)*TS-cam.y;ctx.fillStyle='#ffd34d';ctx.fillRect(gx-60,gy-200,14,200);ctx.fillRect(gx+46,gy-200,14,200);ctx.fillRect(gx-60,gy-214,120,22);ctx.fillStyle='#3a2a1a';ctx.font='bold 16px sans-serif';ctx.fillText('HOME →',gx,gy-197)}
function drawFrame(key,fi,x,y,face,s,alpha){const L2=F[key];if(!L2||!L2.length)return false;const f=L2[Math.floor(fi)%L2.length];const im=img(f.f);if(!ok(im))return false;
 ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.translate(x,y);ctx.scale(face*s,s);ctx.drawImage(im,-f.ax,-f.ay,f.w,f.h);ctx.restore();return true}
function drawEnts(){for(const e of ents){if(e.got)continue;const x=e.x-cam.x,y=e.y-cam.y;if(x<-50||x>VW+50)continue;
  if(e.type==='coin'){ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.ellipse(x,y,10*Math.abs(Math.cos(e.ph*2))+3,12,0,0,6.283);ctx.fill()}
  else if(e.type==='fish'){ctx.fillStyle='#7fc6ff';ctx.beginPath();ctx.ellipse(x,y,18,9,0,0,6.283);ctx.fill();ctx.beginPath();ctx.moveTo(x+14,y);ctx.lineTo(x+26,y-9);ctx.lineTo(x+26,y+9);ctx.fill()}
  else if(e.type==='yarn'){ctx.fillStyle='#ff6ab0';ctx.beginPath();ctx.arc(x,y,14,0,6.283);ctx.fill();ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(x,y,9,0,4);ctx.stroke()}
  else{ctx.fillStyle='#7fffd4';ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?8:18;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.fill()}}
 for(const v of cars){const x=v.x-cam.x,y=v.y-cam.y;if(x>VW||x+v.w<0)continue;ctx.fillStyle=v.col;ctx.fillRect(x,y-v.h+10,v.w,v.h-22);ctx.fillStyle='#9fd0e6';
  if(v.kind==='bus'){for(let i=0;i<4;i++)ctx.fillRect(x+12+i*56,y-v.h+22,40,36);ctx.fillStyle='#2f7ad9';ctx.fillRect(x,y-40,v.w,10)}else ctx.fillRect(x+v.w*(v.dir>0?.55:.1),y-v.h+18,v.w*.35,30);
  ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x+28,y-10,12,0,6.283);ctx.arc(x+v.w-28,y-10,12,0,6.283);ctx.fill()}
 for(const k of kids){const key=k.kind==='skateboard'?'en_kidskate_move':'en_kidscoot_move';drawFrame(key,k.ph*10,k.x-cam.x,k.y-cam.y,k.dir,SC*.9)}
 for(const e of enemies){if(!e.alive&&e.ko<=0)continue;const key='en_'+e.id+(e.alive?(e.hurt>0?'_m_hurt':'_move'):'_m_ko');const x=e.x-cam.x,y=e.y-cam.y;if(x<-100||x>VW+100)continue;
  if(!drawFrame(key,e.t*10,x,y,e.face,SC,e.alive?1:e.ko)){ctx.fillStyle='#a05a3a';ctx.fillRect(x-e.w/2,y-e.h,e.w,e.h)}}}
function drawPaddy(){const a=ANIM[p.anim]||ANIM.idle,key=a[0];const fi=p.anim==='climb'?(p.y/24):LV.t*a[1];const blink=p.inv>0&&Math.floor(LV.t*20)%2;
 if(!drawFrame(key,fi,p.x-cam.x,p.y-cam.y+(p.anim==='ledge'?BH*.45:0),p.face,SC,blink?.4:1)){ctx.fillStyle='#e8c8a0';ctx.fillRect(p.x-cam.x-BW/2,p.y-cam.y-BH,BW,BH)}
 if(qs.has('hitbox')){ctx.strokeStyle='#f0f';ctx.strokeRect(p.x-cam.x-BW/2,p.y-cam.y-BH,BW,BH)}}
function drawFx(dt){for(const f of fx){f.l-=dt;const x=f.x-cam.x,y=f.y-cam.y;ctx.globalAlpha=Math.max(0,Math.min(1,f.l*2));
  if(f.k==='chip'){f.vy+=G*.5*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;ctx.fillStyle='#c9b48a';ctx.fillRect(x,y,8,8)}else if(f.k==='pow'){ctx.fillStyle='#fff';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText('POW!',x,y)}
  else{ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(x,y,(1-f.l)*40+6,0,6.283);ctx.stroke()}}ctx.globalAlpha=1;fx=fx.filter(f=>f.l>0)}
function hud(dt){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(10,10,420,40);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='left';
 ctx.fillText('♥'.repeat(Math.max(0,p.hp))+'♡'.repeat(Math.max(0,p.max-p.hp))+'   🪙 '+p.coins+'   🧶 '+p.yarn+'/4',22,37);
 ctx.textAlign='right';ctx.fillText((L.label||L.id)+' · '+L.name,VW-14,30);
 if(arena&&arena.state==='lock'&&!arena.boss){ctx.fillStyle='#ff9a5a';ctx.textAlign='center';ctx.fillText('⚔ '+arena.name+' — '+arena.list.filter(e=>e.alive).length+' left',VW/2,76)}
 let y=130;for(const m of msgs){m.l-=dt;ctx.globalAlpha=Math.max(0,Math.min(1,m.l*2));ctx.fillStyle=m.c;ctx.textAlign='center';ctx.font=`bold ${m.big?40:26}px sans-serif`;ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=5;ctx.strokeText(m.t,VW/2,y);ctx.fillText(m.t,VW/2,y);y+=m.big?50:34}
 ctx.globalAlpha=1;ctx.lineWidth=1;msgs=msgs.filter(m=>m.l>0);
 if(p.done){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(VW/2-220,VH/2-60,440,120);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 24px sans-serif';ctx.fillText('🪙 '+p.coins+' · 🧶 '+p.yarn+'/4 · press N for the next level',VW/2,VH/2+8)}}
let last=0;function loop(ts){const dt=Math.min(.033,(ts-(last||ts))/1000);last=ts;if(L&&!LV.pause){update(dt);updEnemies(dt);updKids(dt);updCars(dt);updArenas();updBoss(dt);updEnts();updCam(dt)}
 if(L){ctx.save();sky();drawTiles();signs();drawEnts();drawBoss();drawPaddy();drawFx(dt);ctx.restore();hud(dt);bossHud()}requestAnimationFrame(loop)}
function fit(){const s=Math.min(innerWidth/VW,innerHeight/VH);cv.style.width=VW*s+'px';cv.style.height=VH*s+'px'}addEventListener('resize',fit);fit();
async function go(id){try{const lv=await loadLevel(id);history.replaceState(null,'','?level='+id+(qs.has('hitbox')?'&hitbox':''));init(lv)}catch(e){LV.err=String(e);console.error(e)}}
LV.go=go;LV.p=p;LV.tile=tile;LV.state=()=>({id:L&&L.id,x:p.x/TS,y:p.y/TS,state:p.state,ground:p.ground,coins:p.coins,hp:p.hp,arena:arena&&arena.name,done:p.done,log:LV.log.slice(-20)});
LV.teleport=(tx,ty)=>{if(arena){arena.state='idle';arena.list.forEach(e=>{e.alive=false;e.ko=0});if(arena.boss)arena.list=[];arena=null}p.x=(tx+.5)*TS;p.y=(ty+1)*TS;p.vx=p.vy=0;p.state='normal';cam.x=Math.max(0,Math.min(W*TS-VW,p.x-VW*.4))};
LV.boss=()=>boss&&{id:boss.id,name:boss.def.name,title:boss.def.title,hp:boss.hp,max:boss.max,st:boss.st,alive:boss.alive,x:boss.x/TS,y:boss.y/TS,wTiles:boss.w/TS,hTiles:boss.h/TS,wPx:boss.w,hPx:boss.h,arena:bossA&&{state:bossA.state,x0:bossA.x0,x1:bossA.x1,trig:bossA.trig,wl:bossA.wl,wr:bossA.wr,p2:bossA.p2,adds:bossA.list.length}};LV.bossHit=n=>bossHit(n);LV.bossRaw=()=>boss;
LV.calm=()=>{enemies.forEach(e=>{e.alive=false;e.ko=0});arenas.forEach(a=>a.state='done');arena=null};LV.kids=()=>kids;LV.cars=()=>cars;LV.enemies=()=>enemies;LV.arenas=()=>arenas;LV.cam=cam;
(async()=>{F=await getJSON('assets/frames.json');for(const a of Object.values(ANIM))(F[a[0]]||[]).forEach(f=>img(f.f));await go(LID);requestAnimationFrame(loop)})();
})();
