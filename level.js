// ===================== LEVEL 1-1 BRANCH: tilemap level runtime (Paddy's Way Home, Silverdale world) =====================
// Loads a Level Builder level JSON (levels/silverdale_N.json, tile 48) and plays it as a side-scrolling platformer with
// base Paddy's art from assets/frames.json. Open level.html?level=silverdale_1 (…_2 … _7; 1-7 ends with the Big Bruno boss arena).
// Solid legend:  J bounce pad (solid flush trampoline: landing launches ~6 tiles with jump held, ↓ absorbs) · # ground · B breakable · ? item block · L solid with a grabbable top corner · = one-way platform (branches too)
//   F one-way fence rail (↓ drops through) · T climbable trunk / drainpipe / pole (not solid: hold ↑ to climb, ← → step off onto a
//   branch or roof, jump leaps off) · ^ soft hazard (bump + chip, never kills) · ~ water (soft respawn at last safe ground) · . empty
// Fields: spawn, checkpoints, goal, mission (optional mission id, completed at the goal -> mission.js gift + form unlock), entities (coin fish yarn powerup enemy kid car bus), arenas (camera lock until the group is cleared),
//   trees, fences, roofs, climbables, tutorial signs, shopSigns, backdrop, decoLegend skins.
// Story: cutscene.js plays Story Studio's W1 cutscenes at the triggers (goal · boss_enter · boss_ko; LV.pause while it plays, ?nocuts = off).
//   Big Bruno K.O. -> bossReward('big_bruno') (mission.js: Ninja). Entities secret_paw {id:'w<n>-<k>',x,y} (10 per world, saved, collected ones
//   don't come back) and mission_gift {mission,x,y} (touch = missionComplete(mission), hidden once that mission is done).
// Play World 1 (title button): touch controls (◀ ▶ ▲ ▼ JUMP ⚔ RUN, shown on touch screens or ?touch), 🏠 back to the title, NEXT ▶ after each clear
//   (after its cutscenes); progress saved in the STORY save 'paddyStory'.world1 (separate from free play; ?new or no save = NEW GAME, every form locked; EXP / gifts / boss rewards unlock) {cleared, next}; after 1-7 + W1-X: WORLD 1 COMPLETE -> title.
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
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyZ:'jump',KeyX:'attack',KeyJ:'attack',KeyC:'tail',KeyT:'tail',KeyV:'meow',KeyM:'meow',ShiftLeft:'run',ShiftRight:'run',KeyN:'next',KeyR:'restart'};
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
const p={x:0,y:0,vx:0,vy:0,face:1,ground:false,jumps:0,state:'normal',t:0,anim:'idle',at:0,hp:5,max:5,inv:0,drop:0,coins:0,yarn:0,fish:0,power:0,climbX:0,hang:null,safe:{x:0,y:0},cp:null,atk:0,atkHit:new Set(),mv:null,seq:'',chainT:0,buf:null,bufT:0,airN:0,meowCool:0,done:false,deaths:0,hopped:new Set()};
let ents=[],enemies=[],kids=[],cars=[],arenas=[],arena=null,cam={x:0,y:0},fx=[],msgs=[],climbMeta=[];
function msg(t,c,big){msgs.push({t,c:c||'#fff',l:big?2.2:1.4,big});LV.events.push(t)}
function surfaceRow(c,fromRow){for(let r=Math.max(0,fromRow|0);r<H;r++){const ch=tile(c,r);if(BLOCK.has(ch)||ONE.has(ch)||ch==='^')return r}return H}
function init(lv){L=lv;W=L.width;H=L.height;S=L.layers.solid.slice();used.clear();
 const sp=L.spawn;p.x=(sp.x+.5)*TS;p.y=(sp.y+1)*TS;p.vx=p.vy=0;p.state='normal';p.hp=p.max;p.safe={x:p.x,y:p.y};p.cp={x:p.x,y:p.y};p.done=false;p.coins=0;p.yarn=0;p.fish=0;p.mv=null;p.seq='';p.atk=0;p.lt=0;
 ents=[];enemies=[];kids=[];cars=[];fx=[];msgs=[];arena=null;
 arenas=(L.arenas||[]).map(a=>Object.assign({},a,{state:'idle',slots:[],want:a.enemies.slice()}));
 for(const e of L.entities||[]){const x=(e.x+.5)*TS,y=(e.y+1)*TS;
  if(e.type==='enemy'){const a=arenaFor(e);if(a)a.slots.push({id:e.id,x,y,e});else enemies.push(mkEnemy(e.id,x,y,e))}   // v44 audit: an arena's own enemies wait for the arena (no double count)
  else if(e.type==='kid'){kids.push({kind:e.kind,x,y,x0:e.x*TS,x1:(e.x+(e.range||10))*TS,dir:1,sp:2*TS,ph:0,harmless:e.harmless===true,hitbox:e.hitbox!==false?true:false,bonus:e.bonus})}
  else if(e.type==='car'||e.type==='bus'){const len=e.type==='bus'?5:3,ht=e.type==='bus'?3:2;
   cars.push({kind:e.type,name:e.name,lane:e.lane,x:(e.dir<0?(e.x1+1)*TS-len*TS:e.x0*TS),y:(e.lane+1)*TS,w:len*TS,h:ht*TS,x0:e.x0*TS,x1:(e.x1+1)*TS,sp:e.speed*TS,dir:e.dir||1,col:carCol(e)})}
  else if(e.type==='secret_paw'){if(!(window.MISSION&&MISSION.pawHas(e.id)))ents.push({type:'secret_paw',id:e.id,x,y:y-30,base:y-30,ph:Math.random()*6,got:false})}
  else if(e.type==='mission_gift'){if(!(window.MISSION&&MISSION.done(e.mission)))ents.push({type:'mission_gift',mission:e.mission,x,y:y-30,base:y-30,ph:Math.random()*6,got:false})}
  else ents.push({type:e.type,x,y:y-24,base:y-24,ph:Math.random()*6,got:false})}

 climbMeta=[];for(const t of L.trees||[])climbMeta.push({x:t.trunk.x,top:t.trunk.top,base:t.trunk.base,skin:'tree',name:t.name});
 for(const c of L.climbables||[])climbMeta.push({x:c.x,top:c.top,base:c.base,skin:/drain|pipe/i.test(c.name)?'pipe':/pole|mast|post|light/i.test(c.name)?'pole':'tree',name:c.name,arms:c.arms});
 initBoss();
 cam.x=Math.max(0,p.x-VW*.35);LV.ready=true;LV.id=L.id;LV.level=L;msg((lab()+' · ')+L.name,'#ffe08a',true)}
function carCol(e){const C=['#d9483b','#3b7dd9','#e8c23a','#5aa95a','#9a5ad9'];let h=0;for(const ch of e.name||'')h=(h*31+ch.charCodeAt(0))>>>0;return e.type==='bus'?'#f2f2f2':C[h%C.length]}
const FLY=new Set(['seagull','magpie','wasp','gull_bandit','magpie_boss']);
// v44d: World 1 (silverdale_*) draws Enemy Studio's new W1 enemies in the old slots' places (the old ids keep their own art everywhere else).
// magpie_boss (Boss Squawk) is a mini-boss only where a level asks for it: id 'magpie_boss', or a magpie with "miniBoss":true.
const W1SPR={rat:'sewer_rat',seagull:'gull_bandit',alleytom:'alley_cat',possum:'possum_w1',ferret:'ferret_zip'};
const isW1=()=>!!(L&&(/^silverdale_/.test(L.id||'')||L.world==='silverdale'));
// an entity enemy inside an arena's x-range whose id is still on that arena's list belongs to the arena (it spawns where it was placed, at lock)
function arenaFor(e){for(const a of arenas){if(e.x<a.x0||e.x>a.x1)continue;const i=a.want.indexOf(e.id);if(i>=0){a.want.splice(i,1);return a}}return null}
function mkEnemy(id,x,y,e){const fly=FLY.has(id),mini=id==='magpie_boss'||(id==='magpie'&&e&&e.miniBoss);const spr=mini?'magpie_boss':(isW1()&&W1SPR[id])||id;
 const en=mkEnemy0(id,x,y,e,fly);en.spr=spr;for(const k of ['_move','_m_hurt','_m_ko'])(F['en_'+spr+k]||[]).forEach(f=>img(f.f));   // preload every frame up front (no pop-in)
 if(mini){en.mini=true;en.hp=6;en.w=80;en.h=80}return en}
function mkEnemy0(id,x,y,e,fly){return{id,x,y:fly?y-TS*2:y,x0:x-2.5*TS,x1:x+2.5*TS,vx:(Math.random()<.5?-1:1)*(fly?90:60),vy:0,hp:/bulldog|husky|labrador|goose/.test(id)?3:2,fly,alive:true,ko:0,face:-1,t:Math.random()*6,hurt:0,route:e&&e.route,w:fly?60:70,h:fly?60:/rat|hedgehog|weta|crab/.test(id)?50:80,arena:e&&e.arena}}
// ---------- Paddy physics ----------
function boxHits(x,y,w,h,test){const c0=Math.floor((x-w/2)/TS),c1=Math.floor((x+w/2-1)/TS),r0=Math.floor((y-h)/TS),r1=Math.floor((y-1)/TS);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(test(c,r))return{c,r};return null}
function moveX(dt){let nx=p.x+p.vx*dt;if(arena&&arena.state==='lock'){nx=Math.max(arena.x0*TS+BW/2,Math.min((arena.x1+1)*TS-BW/2,nx))}
 nx=Math.max(BW/2,Math.min(W*TS-BW/2,nx));
 const h=boxHits(nx,p.y-2,BW,BH-4,solidAt);if(h){if((h.c+.5)*TS>p.x)nx=h.c*TS-BW/2-.01;else nx=(h.c+1)*TS+BW/2+.01;p.wallDir=Math.sign(p.vx);p.vx=0}else p.wallDir=0;p.x=nx}   // v44 audit: push out on the side the tile is on (not by vx), so a shove can't embed him
function moveY(dt){const oy=p.y;let ny=p.y+p.vy*dt;p.ground=false;
 if(p.vy>=0){const c0=Math.floor((p.x-BW/2)/TS),c1=Math.floor((p.x+BW/2-1)/TS);   // v44 audit: feet span his full width (x-36..x+35), same as the body
  for(let r=Math.floor(oy/TS);r<=Math.floor(ny/TS);r++){let hit=false,ch='';for(let c=c0;c<=c1;c++){const t=tile(c,r);if(BLOCK.has(t)||t==='^'||(ONE.has(t)&&p.drop<=0&&oy<=r*TS+1)){hit=true;if(ch!=='J')ch=t}}   // a pad under any part of his feet counts
   if(hit&&r*TS>=oy-1){ny=r*TS;const fall=p.vy;p.vy=0;p.ground=true;p.jumps=0;if(ch==='^')hazard();
    if(ch==='J'&&!K.down&&fall>150){p.vy=-(K.jump||K.up?1224:900);p.ground=false;p.jumps=1;fx.push({k:'ring',x:p.x,y:ny,l:.4});LV.log.push(K.jump||K.up?'bounce:full':'bounce');msg('BOING!','#7fffd4')}   // ~6 tiles with jump held, ↓ absorbs it; double jump still free after, no damage
    break}}}
 else{const h=boxHits(p.x,oy-BH+1,BW-8,oy-ny+1,solidAt);   // sweep the head only, so a wall beside him never counts as a ceiling
if(h){ny=Math.min(oy,(h.r+1)*TS+BH+.01);p.vy=60;bonk(h.c,h.r)}}   // v44 audit: a bonk never pushes him DOWN into the floor
 p.y=ny;if(p.y>H*TS)water()}   // v44 audit: below the map = straight back to dry ground
function bonk(c,r){const t=tile(c,r);if(t==='?'&&!used.has(c+','+r)){used.add(c+','+r);p.coins+=3;fx.push({k:'pop',x:(c+.5)*TS,y:r*TS,l:.8});msg('+3 COINS','#ffd34d');LV.log.push('bonk')}if(t==='B')breakTile(c,r)}
function breakTile(c,r){setTile(c,r,'.');for(let i=0;i<10;i++)fx.push({k:'chip',x:(c+.5)*TS,y:(r+.5)*TS,vx:(Math.random()-.5)*400,vy:-200-Math.random()*300,l:.8});LV.log.push('break')}
function hurt(dir,dmg){if(p.inv>0||p.done)return;p.mv=null;p.seq='';p.atk=0;p.hp-=dmg;p.inv=1.2;p.vx=dir*320;p.vy=-480;p.ground=false;p.state='hurt';p.t=0;if(p.hp<=0)respawn(true)}
function hazard(){if(p.inv>0)return;hurt(-p.face,1);msg('OUCH!','#ff9a7a')}
function water(){msg('SPLASH! back to dry ground','#9fdcff');p.x=p.safe.x;p.y=p.safe.y;p.vx=p.vy=0;p.inv=1;p.state='normal'}
function respawn(dead){if(dead&&arena&&arena.boss)bossReset();if(dead){p.deaths++;msg('BACK TO THE CHECKPOINT','#ffd0a0',true)}p.hp=p.max;p.x=p.cp.x;p.y=p.cp.y;p.vx=p.vy=0;p.inv=1.5;p.state='normal'}
function trunkAt(x,y){const c=Math.floor(x/TS);for(let r=Math.floor((y-BH*.7)/TS);r<=Math.floor((y-4)/TS);r++)if(tile(c,r)==='T')return c;return -1}
function trunkSpan(c){let top=H,base=-1;for(let r=0;r<H;r++)if(tile(c,r)==='T'){top=Math.min(top,r);base=Math.max(base,r)}return{top,base}}
// v44 audit: after a step-off / pull-up places him, slide him clear of a block his body overlaps (trunk-base blocks, roof edges)
function unembed(){for(let i=0;i<2;i++){const h=boxHits(p.x,p.y-2,BW,BH-4,solidAt);if(!h)return true;p.x=(h.c+.5)*TS>p.x?h.c*TS-BW/2-.01:(h.c+1)*TS+BW/2+.01}return !boxHits(p.x,p.y-2,BW,BH-4,solidAt)}
function stepOff(dir){// a branch / roof / fence next to the trunk near the feet
 const c=p.climbX;for(let dc=1;dc<=2;dc++){const cc=c+dir*dc;for(let dr=-2;dr<=2;dr++){const r=Math.floor(p.y/TS)+dr;const t=tile(cc,r);if((BLOCK.has(t)||ONE.has(t))&&!solidAt(cc,r-1)&&!solidAt(cc,r-2)){const ox=p.x,oy=p.y;p.x=(cc+.5)*TS;p.y=r*TS;if(!unembed()){p.x=ox;p.y=oy;continue}p.state='normal';p.vx=0;p.vy=0;p.ground=true;p.face=dir;LV.log.push('stepoff');return true}}}return false}
function tryLedge(){if(p.ground||p.vy<-200)return false;const dir=K.right?1:K.left?-1:0;if(!dir)return false;
 const c=Math.floor((p.x+dir*(BW/2+6))/TS);const top=p.y-BH;for(let r=Math.floor((top-10)/TS);r<=Math.floor((top+BH*.45)/TS);r++){
  if(tile(c,r)==='L'&&!solidAt(c,r-1)&&!solidAt(c,r-2)&&!solidAt(c,r-3)){p.state='ledge';p.t=0;p.face=dir;p.hang={c,r};p.vx=p.vy=0;p.x=c*TS+(dir>0?-BW/2:TS+BW/2);p.y=r*TS+BH*.55;LV.log.push('ledge');return true}}return false}
function update(dt){LV.t+=dt;p.t+=dt;p.lt=(p.lt||0)+dt;p.inv=Math.max(0,p.inv-dt);p.drop=Math.max(0,p.drop-dt);p.power=Math.max(0,p.power-dt);p.atk=Math.max(0,p.atk-dt);
 if(P.restart){init(L)}if(P.next&&p.done&&!(window.CUT&&CUT.playing))nextLevel();
 const dir=(K.right?1:0)-(K.left?1:0);
 if(p.done){p.vx=0;p.vy+=G*dt;moveY(dt);p.anim='victory';return}
 if(p.state==='climb'){const sp=trunkSpan(p.climbX);p.vx=0;p.vy=(K.up?-1:0)*170+(K.down?1:0)*200;p.y+=p.vy*dt;p.x=(p.climbX+.5)*TS;
  const minY=(sp.top+1)*TS+BH*.25,maxY=(sp.base+1)*TS;if(p.y<minY)p.y=minY;
  if(p.y>=maxY){p.y=maxY;if(K.down){p.state='normal'}}
  p.anim='climb';p.animSpeed=Math.abs(p.vy)>0?1:0;
  if(P.jump){p.state='normal';p.vy=-JV*.9;p.vx=(dir||p.face)*300;p.face=dir||p.face;p.jumps=1;LV.log.push('trunkjump')}
  else if(dir&&stepOff(dir)){}
  else if(!K.up&&!K.down&&p.y<maxY&&dir===0){}
 }else if(p.state==='ledge'){p.anim='ledge';if(P.jump||K.up||p.t>.35){const h=p.hang;p.x=(h.c+.5)*TS+p.face*0;p.y=h.r*TS;unembed();p.state='normal';p.ground=true;p.vy=0;LV.log.push('pullup')}else if(K.down){p.state='normal';p.vy=100}
 }else{
  if(p.state==='hurt'&&(p.t>.35||p.ground&&p.t>.12))p.state='normal';
  if(p.state==='normal'){const sp=(K.run||p.power>0?RUN:WALK)*(p.power>0?1.15:1);const want=dir*sp*(p.mv&&p.ground?.2:1);p.vx+=(want-p.vx)*Math.min(1,dt*(p.ground?14:6));if(dir&&!p.mv)p.face=dir;
   if(K.up&&!p.mv&&trunkAt(p.x,p.y)>=0){p.climbX=trunkAt(p.x,p.y);p.state='climb';p.vx=0;p.vy=0;P.up=0;LV.log.push('climb')}
   else if(P.up)P.jump=1;   // ↑ = jump away from a trunk
   if(P.down&&p.ground){const c0=Math.floor((p.x-BW/2+4)/TS),c1=Math.floor((p.x+BW/2-5)/TS),r=Math.round(p.y/TS);let one=false;for(let c=c0;c<=c1;c++){if(ONE.has(tile(c,r)))one=true}
    if(one){p.drop=.22;p.y+=2;p.ground=false;LV.log.push('drop')}}
   if(P.jump){if(p.ground){p.vy=-JV;p.ground=false;p.jumps=1;p.jumpT=p.lt;fx.push({k:'dust',x:p.x,y:p.y,l:.4})}
    else if(p.wallDir&&!p.ground){p.vy=-DJV;p.vx=-p.wallDir*380;p.face=-p.wallDir;p.jumps=1;LV.log.push('walljump');msg('WALL JUMP!')}
    else if(p.jumps<2){p.vy=-DJV;p.jumps=2;LV.log.push('djump');fx.push({k:'ring',x:p.x,y:p.y-30,l:.4})}}
   if(!K.jump&&!K.up&&p.vy<-300)p.vy+=G*dt*.9;   // short hop when jump is let go
   if(P.jump&&p.mv&&!p.mv.d.air)p.mv=null;   // a jump cancels a ground move
   moveInput()}
  if(p.state!=='climb'&&p.state!=='ledge'){p.vy=Math.min(p.vy+G*dt,1500);moveX(dt);moveY(dt);if(p.state==='normal')tryLedge()}
  if(p.ground&&tile(Math.floor(p.x/TS),Math.round(p.y/TS))!=='^')p.safe={x:p.x,y:p.y};
  if(boxHits(p.x,p.y,BW-20,BH-20,(c,r)=>tile(c,r)==='~'))water();
  p.anim=p.state==='hurt'?'hurt':p.mv?'mv':!p.ground?(p.wallDir&&p.vy>0?'wall':p.jumps===2&&p.vy<0?'djump':p.vy<0?'jump':'fall'):Math.abs(p.vx)>RUN*.8?'run':Math.abs(p.vx)>30?'walk':'idle'}
 // v45 moves: hits enemies, birds, the boss, breakables and item blocks (moveHit)
 updMove(dt);
 // checkpoints / goal
 for(const c of L.checkpoints||[]){if(p.x>=(c.x)*TS&&(!p.cp||p.cp.x<c.x*TS)){p.cp={x:(c.x+.5)*TS,y:(c.y+1)*TS};msg('CHECKPOINT','#7fffd4')}}
 const g=L.goal;if(!p.done&&p.x>=g.x*TS){p.done=true;msg(lab()+' CLEAR!','#ffe08a',true);LV.log.push('goal');saveProg(L.id);exp(100);const lvl=L;cutAt('goal',()=>{if(lvl.mission&&window.missionComplete&&L===lvl){LV.mission=missionComplete(lvl.mission);LV.log.push('mission:'+lvl.mission)}})}   // level JSON 'mission': id -> gift + form unlock (mission.js)
 P.jump=P.attack=P.tail=P.meow=P.down=P.up=P.restart=P.next=0}
// ---------- v45: base Paddy's moveset (story mode starts with it; only the extra FORMS stay locked until earned) ----------
// CLAW (X / ⚔ CLAW): 1-2-3 claw opener (SCRATCH · SWIPE · TRIPLE CLAW), keep tapping for claws 4-5 · TAIL (C / T): TAIL WHIP x2, 3rd = TAIL LAUNCHER
// MEOW (V / M): sound blast · ▲ + CLAW on the ground = UPPERCUT (jumps up, reaches birds) · CLAW in the air = AIR SWIPE, again = AIR SPIN · ▼ + CLAW in the air = DIVE CLAW
// Free play's base Paddy routes: CCCTT TAIL SPIN SLAM · CCCCCT COMET TAIL · TTTCCC CLAW CYCLONE · CCCM MEOW CANNON
// hitbox: rx in front, bk behind, up above his feet, dn below them (px); hits at the tick times (s); each tick hits each target once.
const MV={
 claw1:{a:'o_claw1',dur:.24,hits:[.06],rx:125,bk:20,up:160,dn:10,kb:200,say:'SCRATCH!',c:'#ffffff',lunge:150},
 claw2:{a:'o_claw2',dur:.24,hits:[.06],rx:130,bk:20,up:170,dn:10,kb:220,say:'SWIPE!',c:'#bfe8ff',lunge:160},
 claw3:{a:'o_claw3',fps:10,dur:.34,hits:[.08],rx:145,bk:20,up:180,dn:10,kb:420,say:'TRIPLE CLAW!',c:'#ffe08a',lunge:220,shake:5},
 claw4:{a:'o_claw1',dur:.22,hits:[.05],rx:130,bk:20,up:165,dn:10,kb:220,say:'CLAW 4!',c:'#ffd0a0',lunge:150},
 claw5:{a:'o_claw2',dur:.24,hits:[.05],rx:135,bk:20,up:175,dn:10,kb:300,say:'CLAW 5!',c:'#ffb870',lunge:170},
 tail1:{a:'tailwhip',fps:16,dur:.3,hits:[.08],rx:135,bk:120,up:140,dn:10,kb:300,say:'TAIL WHIP!',c:'#ffd0a0',trail:'#fff7e0'},
 tail2:{a:'tailwhip',fps:18,dur:.3,hits:[.08],rx:140,bk:125,up:145,dn:10,kb:340,say:'DOUBLE WHIP!',c:'#ffb870',trail:'#ffd0a0'},
 tail3:{a:'tailwhip',fps:18,dur:.38,hits:[.1],rx:145,bk:130,up:160,dn:10,kb:160,launch:-820,say:'TAIL LAUNCHER!',c:'#ff9a2e',trail:'#ffb870',shake:6},
 meow:{a:'o_roar',dur:.42,hits:[.12],rx:210,bk:0,up:170,dn:10,kb:560,say:'MEOW!',c:'#bfe8ff',wave:1,cool:.7},
 upper:{a:'uppercut',fps:12,dur:.42,hits:[.04,.16],rx:120,bk:40,up:270,dn:10,kb:120,launch:-760,say:'UPPERCUT!',c:'#ffe08a',air:1,vy:-800},
 airswipe:{a:'o_airswipe',dur:.28,hits:[.05],rx:145,bk:30,up:200,dn:70,kb:260,say:'AIR SWIPE!',c:'#bfe8ff',air:1,vyMax:-120},
 airspin:{a:'o_airspin',fps:14,dur:.42,loop:1,hits:[.05,.17,.29],rx:140,bk:140,up:200,dn:80,kb:280,say:'AIR SPIN!',c:'#ffe08a',air:1,vyMax:-60,trail:'#fff7e0'},
 dive:{a:'o_diveclaw',dur:.9,hits:[.05,.15,.25,.35,.45,.55,.65,.75],rx:90,bk:50,up:90,dn:60,kb:200,say:'DIVE CLAW!',c:'#ff9a7a',air:1,dive:1},
 // named routes (free play's base Paddy combos)
 tailslam:{a:'o_airspin',fps:16,dur:.7,loop:1,hits:[.06,.2,.34,.5],rx:160,bk:160,up:220,dn:10,kb:420,launch:-700,dmg:1,say:'TAIL SPIN SLAM!',c:'#ff9a2e',trail:'#ffb870',shake:8,fin:1},
 comet:{a:'o_airspin',fps:20,dur:.8,loop:1,hits:[.06,.18,.3,.42,.6],rx:170,bk:170,up:230,dn:10,kb:520,launch:-760,dmg:1,say:'COMET TAIL!',c:'#ff6a2e',trail:'#ff8a3a',shake:9,fin:1},
 cyclone:{a:'o_airspin',fps:18,dur:.75,loop:1,hits:[.06,.18,.3,.42,.56],rx:165,bk:165,up:240,dn:20,kb:380,launch:-640,dmg:1,say:'CLAW CYCLONE!',c:'#7fffd4',trail:'#bfffe8',shake:8,fin:1},
 cannon:{a:'o_roar',dur:.55,hits:[.12],rx:300,bk:0,up:190,dn:10,kb:900,dmg:2,say:'MEOW CANNON!',c:'#9fdcff',wave:2,shake:9,fin:1}};
for(const d of Object.values(MV))d.fps=d.fps||12;
let hs=0,shake=0;   // hitstop (s) + screen shake (px)
function moveInput(){if(p.mv&&p.mv.t<p.mv.d.dur*.55){for(const k of ['attack','tail','meow'])if(P[k]){p.buf=k;p.bufT=.3}return}   // buffered until the move can cancel
 let k=P.attack?'attack':P.tail?'tail':P.meow?'meow':null;if(!k&&p.buf&&p.bufT>0)k=p.buf;if(!k)return;p.buf=null;
 if(p.chainT<=0&&!p.mv)p.seq='';
 let id=null;
 if(!p.ground&&k==='attack'&&K.up&&p.airN===0&&p.vy<0&&(p.lt-(p.jumpT||-9))<.35)id='upper';   // ▲ is also jump here: ▲ + CLAW right after take-off = UPPERCUT
 else if(!p.ground){if(k==='attack'){if(K.down)id='dive';else if(p.airN===0)id='airswipe';else if(p.airN<3)id='airspin'}else if(k==='tail'){if(p.airN<3)id='airspin'}else if(p.meowCool<=0)id='meow';if(id&&id!=='meow')p.airN++}
 else if(k==='attack'&&K.up)id='upper';
 else{const s=p.seq+(k==='attack'?'C':k==='tail'?'T':'M');
  if(k==='attack'){if(/TTTCCC$/.test(s))id='cyclone';else{const n=(s.match(/C+$/)[0]).length;id=n<=5?'claw'+n:'claw1';if(n>5)p.seq=''}}
  else if(k==='tail'){if(/CCCCCT$/.test(s))id='comet';else if(/CCCTT$/.test(s))id='tailslam';else{const n=(s.match(/T+$/)[0]).length;id=n<=3?'tail'+n:'tail1';if(n>3)p.seq=''}}
  else{if(/CCCM$/.test(s))id='cannon';else if(p.meowCool<=0)id='meow'}
  if(id)p.seq=(p.seq+(k==='attack'?'C':k==='tail'?'T':'M')).slice(-8)}
 if(id)startMove(id)}
function startMove(id){const d=MV[id];p.mv={id,d,t:0,ti:0};if(id==='upper')p.airN=1;p.atk=d.dur;p.chainT=0;if(d.fin)p.seq='';if(id==='meow'||id==='cannon')p.meowCool=d.cool||.5;
 if(d.lunge&&p.ground)p.vx=p.face*d.lunge;if(d.vy){p.vy=d.vy;p.ground=false;p.jumps=2}if(d.vyMax!=null)p.vy=Math.min(p.vy,d.vyMax);if(d.dive){p.vy=1100;p.vx=p.face*120}
 if(d.wave)fx.push({k:'wave',x:p.x+p.face*40,y:p.y-90,l:.5,r:d.wave>1?260:170,c:d.c,face:p.face});
 fx.push({k:'say',t:d.say,c:d.c,x:p.x,y:p.y-BH-24,l:.8});if(d.fin)msg(d.say,d.c,true);
 LV.log.push('attack');LV.log.push('move:'+id);LV.moves=(LV.moves||0)+1}
function updMove(dt){p.chainT=Math.max(0,p.chainT-dt);p.bufT=Math.max(0,(p.bufT||0)-dt);p.meowCool=Math.max(0,(p.meowCool||0)-dt);if(p.ground)p.airN=0;
 const m=p.mv;if(!m){p.atk=0;return}const d=m.d,t0=m.t;m.t+=dt;p.atk=Math.max(.01,d.dur-m.t);
 if(d.vyMax!=null&&m.t<d.dur*.8)p.vy=Math.min(p.vy,d.vyMax+m.t*600);
 if(d.dive)p.vy=Math.max(p.vy,1000);
 for(const ti of d.hits)if(t0<ti&&m.t>=ti)moveHit(d);
 if(d.dive&&p.ground){fx.push({k:'ring',x:p.x,y:p.y,l:.45});shake=Math.max(shake,6);moveHit(Object.assign({},d,{rx:120,bk:120,up:100,dn:20,kb:320,dmg:1}));p.mv=null;p.atk=0;p.chainT=.2;return}
 if(m.t>=d.dur||(d.air&&!d.dive&&p.ground&&m.t>.12&&d!==MV.upper)||(d===MV.upper&&p.ground&&m.t>.2)){p.mv=null;p.atk=0;p.chainT=.5;if(p.buf&&p.bufT>0)moveInput()}}
function moveHit(d){const x0=p.face>0?p.x-d.bk:p.x-d.rx,x1=p.face>0?p.x+d.rx:p.x+d.bk,y0=p.y-d.up,y1=p.y+d.dn;let n=0;
 const ov=(ax0,ax1,ay0,ay1)=>ax1>x0&&ax0<x1&&ay1>y0&&ay0<y1;
 for(const e of enemies){if(!e.alive)continue;if(ov(e.x-e.w/2,e.x+e.w/2,e.y-e.h,e.y)){const dir=(d.bk>=100?Math.sign(e.x-p.x):p.face)||p.face;hitEnemy(e,dir,d);n++}}
 if(boss&&boss.alive&&bossA&&bossA.state==='lock'&&ov(boss.x-boss.w/2,boss.x+boss.w/2,boss.y-boss.h,boss.y)){bossHit(d.dmg||1);n++}
 const h=boxHits(p.x+p.face*(d.rx*.5),y1,Math.max(70,d.rx*.8),d.up+d.dn,(c,r)=>tile(c,r)==='B'||tile(c,r)==='?');if(h){bonk(h.c,h.r);n++}
 if(n){hs=Math.max(hs,d.fin?.07:.045);shake=Math.max(shake,d.shake||3);LV.log.push('hit:'+(p.mv?p.mv.id:'?'))}}
function moveTrail(){const m=p.mv;if(!m||!m.d.trail)return;const x=p.x-cam.x,y=p.y-cam.y-70,a=m.t*28;ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=m.d.trail;ctx.lineWidth=7;ctx.lineCap='round';
 ctx.beginPath();ctx.ellipse(x,y,m.d.rx*.8,34,0,a,a+2.4);ctx.stroke();ctx.restore()}
// flyers (gulls, magpies, wasps): cruise just above claw reach, then swoop down at Paddy's chest; a hit stuns them and they flutter down
function updFlyer(e,dt){const sw=e.sw||(e.sw={st:'cruise',t:1.2+Math.random()*1.6});sw.t-=dt;
 const fr=surfaceRow(Math.floor(e.x/TS),Math.max(0,Math.floor((e.y-10)/TS))),fy=fr<H?fr*TS:p.y;
 const cy=Math.max(fy-250,Math.min(fy-185,e.y0!=null?e.y0:fy-220));   // bottom of the bird 185-250 px above the ground under it (uppercut / jump reach)
 if(e.y0==null)e.y0=e.y;
 if(sw.st==='cruise'){e.x+=e.vx*dt;if(e.x<e.x0||e.x>e.x1){e.vx=-e.vx;e.x=Math.max(e.x0,Math.min(e.x1,e.x))}e.y+=(cy+Math.sin(e.t*2)*10-e.y)*Math.min(1,dt*3);
  if(sw.t<=0&&Math.abs(p.x-e.x)<6*TS&&p.state!=='climb'&&!p.done){sw.st='swoop';sw.t=1.3;sw.tx=p.x;sw.ty=p.y-60;LV.log.push('swoop:'+e.id)}else if(sw.t<=0)sw.t=.6}
 else if(sw.st==='swoop'){const dx=sw.tx-e.x,dy=sw.ty-e.y,l=Math.hypot(dx,dy)||1,v=330;e.vx=Math.sign(dx)*Math.abs(e.vx||90);e.x+=dx/l*v*dt;e.y+=dy/l*v*dt;if(l<24||sw.t<=0){sw.st='rise';sw.t=1.5}}
 else if(sw.st==='stun'){e.y=Math.min(e.y+70*dt,fy-60);if(sw.t<=0){sw.st='rise';sw.t=1.5}}
 else{e.y+=(cy-e.y)*Math.min(1,dt*2);e.x+=e.vx*dt;if(e.x<e.x0||e.x>e.x1)e.vx=-e.vx;if(Math.abs(cy-e.y)<6||sw.t<=0){sw.st='cruise';sw.t=2+Math.random()*1.5}}
 if(e.inArena&&arena)e.x=Math.max(arena.x0*TS+30,Math.min((arena.x1+1)*TS-30,e.x))}
function hitEnemy(e,dir,d){if(!e.alive)return;d=d||{};e.hp-=(d.dmg||1);e.hurt=.25+(d.launch?.35:0);e.vx=dir*(d.kb||240);e.y-=4;if(e.fly){e.sw={st:'stun',t:.7};e.vy=0}else if(d.launch){e.vy=d.launch}if(d.say2)fx.push({k:'say',t:d.say2,c:d.c||'#fff',x:e.x,y:e.y-e.h-20,l:.7});fx.push({k:'pow',x:e.x,y:e.y-e.h/2,l:.35});exp(1);if(e.hp<=0){e.alive=false;e.ko=1;p.coins+=1;LV.log.push('ko:'+e.id);exp(25)}}
function updEnemies(dt){for(const e of enemies){e.t+=dt;if(!e.alive){e.ko=Math.max(0,e.ko-dt);continue}e.hurt=Math.max(0,e.hurt-dt);
  if(e.fly)updFlyer(e,dt);
  else{if(e.hurt<=0){const sp=e.arenaSpd||60;e.vx=Math.sign(e.vx||1)*sp}e.vy=Math.min(e.vy+G*dt,1400);let nx=e.x+e.vx*dt;const c=Math.floor((nx+Math.sign(e.vx)*e.w/2)/TS),r=Math.floor((e.y-10)/TS);
   const fl=surfaceRow(Math.floor(nx/TS),Math.floor((e.y-4)/TS));
   if(solidAt(c,r)||(e.hurt<=0&&(fl*TS>e.y+TS*.5))||(!e.inArena&&(nx<e.x0||nx>e.x1))){e.vx*=-1;nx=e.x}if(e.inArena&&arena)nx=Math.max(arena.x0*TS+30,Math.min((arena.x1+1)*TS-30,nx));e.x=nx;
   let ny=e.y+e.vy*dt;const fr=surfaceRow(Math.floor(e.x/TS),Math.floor((e.y-4)/TS));if(ny>=fr*TS){ny=fr*TS;e.vy=0}e.y=ny}
  e.face=e.vx<0?-1:1;
  // touch: stomp from above, else a small bump
  if(Math.abs(e.x-p.x)<(e.w+BW)/2-6&&p.y>e.y-e.h&&p.y-BH<e.y){if(p.vy>200&&p.y<e.y-e.h+30){hitEnemy(e,p.face);hitEnemy(e,p.face);p.vy=-620;LV.log.push('stomp')}else if(p.atk<=0&&e.hurt<=0)hurt(Math.sign(p.x-e.x)||1,1)}}}
function updKids(dt){for(const k of kids){k.x+=k.dir*k.sp*dt;if(k.x>k.x1){k.x=k.x1;k.dir=-1}if(k.x<k.x0){k.x=k.x0;k.dir=1}k.ph+=dt;
  // harmless: no collision at all. Hop bonus: Paddy airborne right above the kid, once per pass
  const over=!p.ground&&Math.abs(p.x-k.x)<44&&p.y<k.y-40;
  if(over&&!k.hopped&&k.bonus==='hop'){k.hopped=true;p.coins+=3;msg('HOP BONUS +3','#ffd34d');LV.log.push('hop')}
  if(Math.abs(p.x-k.x)>110||p.ground&&Math.abs(p.x-k.x)>60)k.hopped=false}}
function updCars(dt){for(const v of cars){v.x+=v.dir*v.sp*dt;if(v.x+v.w>v.x1){v.x=v.x1-v.w;v.dir=-1}if(v.x<v.x0){v.x=v.x0;v.dir=1}
  const cx=v.x+v.w/2;if(p.inv<=0&&Math.abs(p.x-cx)<(v.w+BW)/2-8&&p.y>v.y-v.h+6&&p.y-BH<v.y){const d=Math.sign(p.x-cx)||-v.dir;p.vx=d*360;p.vy=-430;p.ground=false;p.inv=.8;p.state='hurt';p.t=0;msg('BEEP BEEP!','#ffe08a');LV.log.push('bump:'+v.kind)}}}   // knock-back only: no damage
function updArenas(){for(const a of arenas){if(a.state==='idle'&&p.x>a.x0*TS+TS&&p.x<(a.x1)*TS&&!arena){a.state='lock';arena=a;a.list=[];msg(a.name.toUpperCase()+'!','#ff9a5a',true);LV.log.push('arena:'+a.name);
   const n=a.want.length,sl=a.slots.concat(a.want.map((id,i)=>({id,x:(a.x0+1.5+(a.x1-a.x0-2)*(i+.5)/Math.max(1,n))*TS,y:(a.y+1)*TS})));   // v44 audit: on the arena floor, not 300px up
   for(const q of sl){if(Math.abs(q.x-p.x)<TS*2)q.x=Math.min((a.x1-.5)*TS,p.x+TS*3);const e=mkEnemy(q.id,q.x,q.y,q.e||{});e.inArena=true;e.arenaSpd=90;e.x0=a.x0*TS;e.x1=(a.x1+1)*TS;enemies.push(e);a.list.push(e)}}
  if(a.state==='lock'&&a.list.every(e=>!e.alive)){a.state='done';arena=null;msg('CLEAR!','#7fffd4',true);LV.log.push('cleared:'+a.name)}}}
function updEnts(){for(const e of ents){if(e.got)continue;e.ph+=.05;e.y=e.base+Math.sin(e.ph)*4;if(Math.abs(e.x-p.x)<50&&e.y>p.y-BH-10&&e.y<p.y+10){e.got=true;
  if(e.type==='coin')p.coins++;else if(e.type==='fish'){p.hp=Math.min(p.max,p.hp+1);p.fish++;msg('FISH! +1 ♥','#9fdcff')}else if(e.type==='yarn'){p.yarn++;msg('YARN BALL '+p.yarn+'/4','#ff9ad5')}else if(e.type==='powerup'){p.power=8;msg('ZOOMIES POWER!','#7fffd4')}
  else if(e.type==='secret_paw'){const r=window.MISSION?MISSION.pawCollect(e.id):{count:'?',of:10,world:'?'};LV.log.push('paw:'+e.id);msg('🐾 SECRET PAW '+r.count+'/'+r.of+' (World '+r.world+')','#ffe14d',true);if(r.set){msg('FULL SET OF SECRET PAWS!','#ffe14d',true);LV.log.push('pawset:'+r.world)}}
  else if(e.type==='mission_gift'){LV.log.push('gift:'+e.mission);if(window.missionComplete)LV.mission=missionComplete(e.mission)}
  fx.push({k:'spark',x:e.x,y:e.y,l:.4})}}}
// ---------- World 1 progress + flow (1-1 -> 1-7 -> title) ----------
const SK='paddyStory';function prog(){try{return JSON.parse(localStorage.getItem(SK)||'{}')||{}}catch(_){return {}}}
function saveProg(id){const d=prog(),i=LEVELS.indexOf(id);if(i<0)return;d.world1=d.world1||{cleared:[]};const w=d.world1;w.cleared=w.cleared||[];if(!w.cleared.includes(id))w.cleared.push(id);
 w.next=LEVELS[i+1]||null;if(i===LEVELS.length-1)w.complete=Date.now();try{localStorage.setItem(SK,JSON.stringify(d))}catch(_){}LV.log.push('save:'+id)}
// NEW GAME: level.html?new (the title's PLAY WORLD 1 when there is no story save yet, or World 1 is complete) or no story save at all
if(window.MISSION&&MISSION.newGame&&(qs.has('new')||!localStorage.getItem(SK))){MISSION.newGame();LV.log.push('newgame')}
function exp(n){if(!window.MISSION||!MISSION.addExp)return;const neu=MISSION.addExp(n);for(const nm of neu){msg('⭐ NEW FORM! '+nm,'#ffe14d',true);LV.log.push('expform:'+nm)}}
LV.exp=exp;
const lab=()=>L?(L.label||(LEVELS.includes(L.id)?'World 1-'+(LEVELS.indexOf(L.id)+1):L.id)):'';
const isLast=()=>L&&LEVELS.indexOf(L.id)===LEVELS.length-1;
function nextLevel(){if(!L)return;if(isLast()){LV.log.push('world1:complete');location.href='index.html';return}go(LEVELS[LEVELS.indexOf(L.id)+1])}
LV.nextLevel=nextLevel;LV.prog=()=>prog().world1||null;
// ---------- touch controls (DOM buttons over the black bars / under the canvas; multi-touch, one pointer per button) ----------
const TOUCH=qs.has('touch')||('ontouchstart' in window)||navigator.maxTouchPoints>0;
const TCSS=document.createElement('style');TCSS.textContent=`#tc{position:fixed;inset:0;pointer-events:none;z-index:50;font-family:'Bangers','Luckiest Guy',Impact,'Arial Black',sans-serif}
#tc button{pointer-events:auto;position:absolute;border:3px solid #ffffffaa;border-radius:50%;background:#0006;color:#fff;font:inherit;font-size:22px;width:var(--b);height:var(--b);display:flex;align-items:center;justify-content:center;
 touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;padding:0;letter-spacing:1px}
#tc #ta{background:#d9483b88;font-size:19px}#tc #tt{background:#e8a23a88;font-size:19px}#tc #tm{background:#3b7dd988;font-size:18px}#tc #tj,#tc #tR{font-size:19px}
#tc button.on{background:#ffd34d99;transform:scale(.94)}#tc .pill{border-radius:999px;width:auto;height:auto;padding:.3em .8em;font-size:18px}
#tc #tnext{display:none;left:50%;transform:translateX(-50%);font-size:26px;background:linear-gradient(#9be36a,#2f8f3a);border-color:#fff;box-shadow:0 4px 0 #1d5e24}
#tc.done #tnext{display:flex}#tc.nopad .pad{display:none}`;document.head.appendChild(TCSS);
const tc=document.createElement('div');tc.id='tc';if(!TOUCH)tc.classList.add('nopad');
const TB=[['tl','◀','left'],['tr','▶','right'],['tu','▲','up'],['td','▼','down'],['tj','JUMP','jump'],['ta','CLAW','attack'],['tt','TAIL','tail'],['tm','MEOW','meow'],['tR','RUN','run']];
for(const [id,t,k] of TB){const b=document.createElement('button');b.id=id;b.className='pad';b.textContent=t;b.dataset.k=k;b.setAttribute('aria-label',k);
 const dn=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}if(!K[k])P[k]=1;K[k]=1;b.classList.add('on')},up=e=>{e.preventDefault();K[k]=0;b.classList.remove('on')};
 b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('contextmenu',e=>e.preventDefault());tc.appendChild(b)}
const home=document.createElement('button');home.id='thome';home.className='pill';home.textContent='🏠 TITLE';home.addEventListener('click',e=>{e.preventDefault();location.href='index.html'});tc.appendChild(home);
const rs=document.createElement('button');rs.id='trestart';rs.className='pill';rs.textContent='↺ CHECKPOINT';rs.setAttribute('aria-label','restart from the last checkpoint');rs.addEventListener('click',e=>{e.preventDefault();if(LV.pause||p.done)return;LV.log.push('restart:cp');respawn(false);msg('BACK TO THE CHECKPOINT','#ffd0a0')});tc.appendChild(rs);   // v44 audit: touch restart if he ever gets stuck
const nx=document.createElement('button');nx.id='tnext';nx.className='pill';nx.textContent='NEXT LEVEL ▶';nx.addEventListener('click',e=>{e.preventDefault();if(p.done&&!(window.CUT&&CUT.playing))nextLevel()});tc.appendChild(nx);
document.body.appendChild(tc);
function layoutTC(){const w=innerWidth,h=innerHeight,s=Math.min(w/VW,h/VH),cw=VW*s,ch=VH*s,sideW=(w-cw)/2,below=(h-ch)/2;
 const b=Math.round(Math.max(50,Math.min(76,Math.min(w,h)*.17)));tc.style.setProperty('--b',b+'px');const g=Math.round(b*.12),m=10;
 const put=(id,x,y)=>{const e=document.getElementById(id);e.style.left=x+'px';e.style.top=y+'px'};
 // bottom-anchored clusters: d-pad left, actions right (they sit in the side bars on wide phones and under the picture on tall ones)
 const by=h-m-b,lx=m+Math.max(0,(Math.min(sideW,b*2.3)-b*2-g)/2);
 put('tl',lx,by);put('tr',lx+b+g,by);put('tu',lx+(b+g)/2,by-b-g);put('td',lx+(b+g)/2+(b+g),by-b-g);
 const rx=w-m-b;put('tj',rx,by);put('ta',rx-b-g,by);put('tm',rx-2*(b+g),by);put('tR',rx-(b+g)/2,by-b-g);put('tt',rx-(b+g)*1.5,by-b-g);   // v45: CLAW · TAIL · MEOW like free play
 {const left=(w-cw)/2,top=(h-ch)/2,pw=home.offsetWidth+rs.offsetWidth+8;   // v44: pills never cover the HUD (hearts/coins): side bar if there is room, else just under the HUD strip
  let px,py;if(left>=Math.max(home.offsetWidth,rs.offsetWidth)+2*m){px=m;py=m;home.style.left=px+'px';home.style.top=py+'px';rs.style.left=px+'px';rs.style.top=(py+home.offsetHeight+8)+'px'}
  else if(top>=home.offsetHeight+2*m){px=m;py=top-home.offsetHeight-m;home.style.left=px+'px';home.style.top=py+'px';rs.style.left=(px+home.offsetWidth+8)+'px';rs.style.top=py+'px'}   // tall phone: in the bar above the picture
  else{px=left+m;py=Math.max(m,top+56*s);home.style.left=px+'px';home.style.top=py+'px';rs.style.left=(px+home.offsetWidth+8)+'px';rs.style.top=py+'px'}}nx.style.top=Math.max(m,h*.5+Math.min(ch*.5,70)-(below>b*2.6?0:0))+'px';
 const help=document.getElementById('help');if(help)help.style.display=TOUCH?'none':''}
addEventListener('resize',layoutTC);layoutTC();let lastLay='';setInterval(()=>{{const k=innerWidth+'x'+innerHeight+':'+home.offsetWidth+','+home.offsetHeight+','+rs.offsetWidth;if(k!==lastLay){lastLay=k;layoutTC()}}tc.classList.toggle('done',!!(p.done&&!(window.CUT&&CUT.playing)));nx.textContent=isLast()?'🌏 WORLD 1 COMPLETE ▶':'NEXT LEVEL ▶'},200);
// ---------- story cutscenes (cutscene.js): pause the level, drop held keys, resume after the last panel or SKIP ----------
function cutAt(ev,then){const C=window.CUT;if(!C||C.off||!C.TRIGGERS[L.id+':'+ev]){then&&then();return false}
 LV.pause=true;for(const k in K)K[k]=0;for(const k in P)P[k]=0;LV.log.push('cut:'+ev);
 return C.trigger(L.id,ev,()=>{LV.pause=false;for(const k in K)K[k]=0;for(const k in P)P[k]=0;LV.log.push('cutdone:'+ev);then&&then()})}
LV.cutAt=cutAt;
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
 if(A.state==='idle'&&p.x>A.trig*TS&&p.x<(A.wr)*TS&&!arena&&b.alive){A.state='lock';arena=A;msg(b.def.name+' — '+b.def.title+'!','#ff9a5a',true);LV.log.push('boss:enter');cutAt('boss_enter')}
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
 // phase 2: adds drop in from the bridge deck
 if(!A.p2&&A.phase2&&b.hp<=b.max*(A.phase2.atHealth||.5)){A.p2=true;msg('PHASE 2 — HERE COME HIS MATES!','#ffd34d',true);LV.log.push('boss:phase2');
  for(const a of A.phase2.adds||[]){const e=mkEnemy(a.id,(a.x+.5)*TS,TS*2,{});e.inArena=true;e.arenaSpd=90;e.x0=A.x0*TS;e.x1=(A.x1+1)*TS;enemies.push(e);A.list.push(e)}}}
function bossHit(n){const b=boss;if(!b.alive||b.inv>0)return;b.hp=Math.max(0,b.hp-n);b.inv=.22;b.flash=.15;fx.push({k:'pow',x:b.x,y:b.y-b.h*.6,l:.35});LV.log.push('boss:hit');exp(n);
 if(b.st!=='punch'&&b.st!=='bark')bossSet('hurt');
 if(b.hp<=0){b.alive=false;bossSet('ko');p.coins+=10;bossA.state='done';bossA.list.forEach(e=>{if(e.alive){e.alive=false;e.ko=1}});if(arena===bossA)arena=null;msg('K.O. — '+b.def.name+' is having a little sit','#7fffd4',true);LV.log.push('boss:ko');
  const cut=!!(window.CUT&&!CUT.off&&CUT.TRIGGERS[L.id+':boss_ko']);if(window.bossReward){LV.reward=bossReward(b.id,{quiet:cut});LV.log.push('reward:'+(LV.reward.form||'none'))}exp(300);cutAt('boss_ko')}}
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
const SKIN={J:'#3fbf7f',P:'#b9b4aa',R:'#8a5a44',o:'#cfcfcf',t:'#9aa6b5',r:'#e8c23a',
 // v44: decoLegend skins that had no colour yet (big-box walls, mall, walkways, road, fields, roofs, mud…)
 W:'#a9564c',U:'#4a7d5a',M:'#c9c0b0',K:'#9a6a3e',A:'#c98a3a',X:'#4a4b50',Z:'#b8342c',Y:'#4c9a3a',N:'#3d7a9a',O:'#3f7a4a',H:'#d9cdb5',u:'#d8cdb8',V:'#8c9aa3',D:'#7b6a52','5':'#8a5a34',I:'#bdbdb5',y:'#a8d4e6',a:'#c0c4c8',v:'#9aa0a6'};
const TOPC={R:'#a8452f',X:'#5c5d62',Z:'#c8443a',O:'#4f8a5a',V:'#9aa8b0',A:'#d9a050',K:'#b07a48',D:'#8b7a5f',Y:'#5fb048',N:'#4f8cae',W:'#8e463e',U:'#3b6849',I:'#d6d6ce',a:'#d0d4d8',v:'#aab0b6',y:'#c8e8f4'};
const ONEC={b:'#6b4a2e',g:'rgba(170,220,240,.85)',z:'#c27a3a',x:'#f2f2f2','4':'#5e4630',Q:'#fff2a0',J:'#5d666e'};
// ---------- v45: World 1 layered parallax backgrounds (painted far layer + pre-rendered Silverdale mid layer + ground props) ----------
// Far: assets/w1bg/<set>.webp (painted in the same style as the free-play arena), mirrored so it tiles seamlessly, parallax .1.
// Mid: houses / shops / trees / cabbage trees / fences / poles / barns / mangroves per theme, hazed, parallax .4 (drawn once per level).
// Near: grass tufts, flowers, bushes, letterboxes on open ground tops (decoration only, no collision).
const BGSET={silverdale_carpark:'suburb',silverdale_shops:'suburb',silverdale_highway:'village',silverdale_village:'village',silverdale_school:'school',silverdale_pioneer:'school',silverdale_weiti:'estuary'};
const MIDK={silverdale_carpark:['house','shop','tree','house','cabbage','shop','pohutukawa','pole'],silverdale_shops:['shop','shop','tree','shop','cabbage','shop','pole','house'],
 silverdale_highway:['house','pole','tree','house','cabbage','pole','pohutukawa','house'],silverdale_village:['shop','house','tree','church','house','cabbage','shop','pohutukawa'],
 silverdale_school:['school','tree','school','cabbage','tree','house','pohutukawa','school'],silverdale_pioneer:['cottage','tree','barn','cottage','tree','cabbage','windmill','cottage'],
 silverdale_weiti:['mangrove','boatshed','pohutukawa','mangrove','tree','boatshed','mangrove','cabbage']};
const GRASSY=/village|school|pioneer|weiti/;
const BGI={};function bgImg(n){if(!BGI[n]){const im=new Image();im.src='assets/w1bg/'+n+'.webp?v=45a';BGI[n]=im}return BGI[n]}
let farC=null,farK='',midC=null,midK='';
const hsh=i=>{let h=(i*2654435761)>>>0;h^=h>>>15;h=Math.imul(h,2246822519)>>>0;h^=h>>>13;return h>>>0};
function farStrip(set){const im=bgImg(set);if(!ok(im))return null;if(farK===set&&farC)return farC;
 const h=VH,w=Math.round(im.naturalWidth*h/im.naturalHeight),c=document.createElement('canvas');c.width=w*2;c.height=h;const x=c.getContext('2d');
 x.drawImage(im,0,0,w,h);x.save();x.translate(w*2,0);x.scale(-1,1);x.drawImage(im,0,0,w,h);x.restore();farC=c;farK=set;return c}
const MIDP=.4,MSP=150;
function midStrip(){const k=L.id;if(midK===k&&midC)return midC;const th=L.theme||'',kinds=MIDK[th]||MIDK.silverdale_carpark;
 const w=Math.ceil(W*TS*MIDP+VW+MSP*2),c=document.createElement('canvas');c.width=w;c.height=VH;const x=c.getContext('2d'),base=VH-118;
 const roofs=['#b8342c','#3f7a8a','#5c5d62','#a8452f','#2f6a4a','#7a5a9a'],walls=['#f2e6cf','#dfe9e2','#f5d9b8','#cfe0ee','#efe2a8','#e8d0d0'];
 const tree=(cx,s,red)=>{x.fillStyle='#6b4a2e';x.fillRect(cx-6*s,base-70*s,12*s,72*s);x.fillStyle=red?'#3f7d3f':'#4f8a3e';for(const [dx,dy,r] of [[-26,-78,34],[24,-80,34],[0,-108,40],[-8,-70,28]]){x.beginPath();x.arc(cx+dx*s,base+dy*s,r*s,0,6.283);x.fill()}
  x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.arc(cx-6*s,base-118*s,18*s,0,6.283);x.fill();if(red){x.fillStyle='#d9332f';for(let i=0;i<22;i++){x.beginPath();x.arc(cx+Math.cos(i*2.4)*44*s,base-90*s+Math.sin(i*1.7)*28*s,4.5*s,0,6.283);x.fill()}}};
 const cab=(cx,s)=>{x.strokeStyle='#7a5a3a';x.lineWidth=7*s;x.beginPath();x.moveTo(cx,base);x.quadraticCurveTo(cx+6*s,base-60*s,cx-4*s,base-120*s);x.stroke();x.strokeStyle='#5f8f3a';x.lineWidth=3*s;
  for(let i=0;i<14;i++){const a=-Math.PI/2+(i-6.5)*.22;x.beginPath();x.moveTo(cx-4*s,base-120*s);x.lineTo(cx-4*s+Math.cos(a)*42*s,base-120*s+Math.sin(a)*34*s+(Math.abs(i-6.5)>4?14*s:0));x.stroke()}};
 const house=(cx,i,hw,hh,flat)=>{const wc=walls[i%walls.length],rc=roofs[(i>>3)%roofs.length];x.fillStyle=wc;x.fillRect(cx-hw,base-hh,hw*2,hh);x.fillStyle='rgba(0,0,0,.08)';for(let y=base-hh+6;y<base;y+=8)x.fillRect(cx-hw,y,hw*2,1.5);
  x.fillStyle=rc;if(flat){x.fillRect(cx-hw-6,base-hh-10,hw*2+12,12)}else{x.beginPath();x.moveTo(cx-hw-10,base-hh+2);x.lineTo(cx,base-hh-46);x.lineTo(cx+hw+10,base-hh+2);x.fill()}
  x.fillStyle='#9fd0e6';x.fillRect(cx-hw+12,base-hh+16,22,20);x.fillRect(cx+hw-34,base-hh+16,22,20);x.fillStyle='#fff';x.fillRect(cx-hw+22,base-hh+16,2,20);x.fillRect(cx+hw-24,base-hh+16,2,20);x.fillStyle='#7a4a2e';x.fillRect(cx-8,base-34,16,34)};
 const shop=(cx,i)=>{const wc=walls[(i+2)%walls.length];x.fillStyle=wc;x.fillRect(cx-70,base-104,140,104);x.fillStyle='#8a8578';x.fillRect(cx-74,base-108,148,8);
  const aw=['#d9483b','#2f7ad9','#3fa35a','#e8a23a'][i%4];for(let k=0;k<7;k++){x.fillStyle=k%2?'#fff':aw;x.fillRect(cx-70+k*20,base-62,20,14)}x.fillStyle='#bfe3f2';x.fillRect(cx-60,base-46,82,40);x.fillStyle='#5a4a3a';x.fillRect(cx+32,base-46,22,46);x.fillStyle=aw;x.fillRect(cx-56,base-96,112,22)};
 const school=(cx,i)=>{x.fillStyle='#e9dcc0';x.fillRect(cx-80,base-90,160,90);x.fillStyle='#3f7a8a';x.fillRect(cx-86,base-98,172,12);x.fillStyle='#9fd0e6';for(let k=0;k<5;k++)x.fillRect(cx-70+k*30,base-74,20,26);x.fillStyle='#e8c23a';x.fillRect(cx-14,base-36,28,36);
  x.fillStyle='#d9483b';x.fillRect(cx+60,base-150,4,60);x.fillRect(cx+64,base-150,26,16)};
 const cottage=(cx,i)=>{house(cx,i+3,54,62,false);x.fillStyle='#8a8578';x.fillRect(cx+26,base-122,12,30)};
 const barn=cx=>{x.fillStyle='#b8342c';x.fillRect(cx-60,base-90,120,90);x.fillStyle='#5c5d62';x.beginPath();x.moveTo(cx-70,base-88);x.lineTo(cx,base-138);x.lineTo(cx+70,base-88);x.fill();x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(cx-24,base-56,48,56);x.beginPath();x.moveTo(cx-24,base-56);x.lineTo(cx+24,base);x.moveTo(cx+24,base-56);x.lineTo(cx-24,base);x.stroke()};
 const mill=cx=>{x.strokeStyle='#8a8f96';x.lineWidth=4;x.beginPath();x.moveTo(cx-22,base);x.lineTo(cx,base-150);x.lineTo(cx+22,base);x.stroke();x.fillStyle='#cfd4da';for(let k=0;k<12;k++){const a=k*.524;x.beginPath();x.moveTo(cx,base-150);x.lineTo(cx+Math.cos(a)*40,base-150+Math.sin(a)*40);x.lineTo(cx+Math.cos(a+.2)*40,base-150+Math.sin(a+.2)*40);x.fill()}};
 const church=cx=>{x.fillStyle='#f2f0ea';x.fillRect(cx-46,base-80,92,80);x.fillRect(cx-14,base-150,28,72);x.fillStyle='#5c5d62';x.beginPath();x.moveTo(cx-18,base-150);x.lineTo(cx,base-200);x.lineTo(cx+18,base-150);x.fill();x.beginPath();x.moveTo(cx-52,base-78);x.lineTo(cx,base-112);x.lineTo(cx+52,base-78);x.fill()};
 const pole=cx=>{x.fillStyle='#6b5a48';x.fillRect(cx-4,base-170,8,170);x.fillRect(cx-30,base-158,60,6);x.strokeStyle='rgba(40,40,40,.5)';x.lineWidth=1.5;x.beginPath();x.moveTo(cx-30,base-155);x.quadraticCurveTo(cx-30-MSP*2.5,base-130,cx-30-MSP*5,base-155);x.stroke()};
 const mangrove=(cx,s)=>{x.strokeStyle='#5a4030';x.lineWidth=3;for(let k=-3;k<=3;k++){x.beginPath();x.moveTo(cx+k*6,base-30);x.quadraticCurveTo(cx+k*14,base-10,cx+k*18,base+4);x.stroke()}x.fillStyle='#5f8a3a';for(const [dx,dy,r] of [[-24,-46,26],[20,-48,28],[0,-64,30]]){x.beginPath();x.arc(cx+dx*s,base+dy*s,r*s,0,6.283);x.fill()}};
 const shed=(cx,i)=>{x.fillStyle=['#d9483b','#3b7dd9','#e8c23a'][i%3];x.fillRect(cx-44,base-64,88,64);x.fillStyle='#f2f2f2';x.beginPath();x.moveTo(cx-50,base-62);x.lineTo(cx,base-96);x.lineTo(cx+50,base-62);x.fill();x.fillStyle='#5a4a3a';x.fillRect(cx-20,base-40,40,40)};
 const n=Math.ceil(w/MSP)+1;
 for(let i=0;i<n;i++){const hv=hsh(i+L.id.length*977),cx=i*MSP+MSP/2+(hv%40)-20,kd=kinds[hv%kinds.length],s=.8+((hv>>8)%30)/100;
  switch(kd){case 'house':house(cx,hv>>4,52+(hv>>12)%14,58+(hv>>16)%20,false);break;case 'shop':shop(cx,hv>>5);break;case 'tree':tree(cx,s,false);break;case 'pohutukawa':tree(cx,s,true);break;case 'cabbage':cab(cx,s);break;
   case 'pole':pole(cx);tree(cx+60,s*.7,false);break;case 'school':school(cx,hv);break;case 'cottage':cottage(cx,hv>>3);break;case 'barn':barn(cx);break;case 'windmill':mill(cx);break;case 'church':church(cx);break;
   case 'mangrove':mangrove(cx,s);break;case 'boatshed':shed(cx,hv>>6);break}}
 // picket fence + hedge band along the whole mid layer
 if(!/weiti/.test(th)){x.fillStyle='#f4efe4';for(let fx0=0;fx0<w;fx0+=14){x.fillRect(fx0,base-34,8,34);x.beginPath();x.moveTo(fx0,base-34);x.lineTo(fx0+4,base-40);x.lineTo(fx0+8,base-34);x.fill()}x.fillRect(0,base-26,w,4);x.fillRect(0,base-12,w,4)}
 x.fillStyle=/weiti/.test(th)?'#c9b48a':'#4f8a3e';x.fillRect(0,base,w,VH-base);x.fillStyle=/weiti/.test(th)?'#5f8a3a':'#3f7d3f';for(let bx=0;bx<w;bx+=38){x.beginPath();x.arc(bx,base+6,24+(hsh(bx)%10),Math.PI,0);x.fill()}
 // atmospheric haze so it sits behind the playfield
 x.globalCompositeOperation='source-atop';x.fillStyle='rgba(205,228,242,.28)';x.fillRect(0,0,w,VH);x.globalCompositeOperation='source-over';
 const CW=2048,ch=[];for(let ox=0;ox<w;ox+=CW){const cc=document.createElement('canvas');cc.width=Math.min(CW,w-ox);cc.height=VH;cc.getContext('2d').drawImage(c,ox,0,cc.width,VH,0,0,cc.width,VH);ch.push(cc)}c.width=c.height=1;
 midC=ch;midK=k;return ch}
function sky(){const th=L.theme||'';const g=ctx.createLinearGradient(0,0,0,VH);if(/night/.test(th)){g.addColorStop(0,'#141a3a');g.addColorStop(1,'#3a3260')}else{g.addColorStop(0,'#7fc4f0');g.addColorStop(1,'#e6f3ff')}ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
 const set=BGSET[th]||(isW1()?'suburb':null);
 if(set){const fc=farStrip(set);if(fc){const sw=fc.width,ox=-((cam.x*.1)%sw),oy=-cam.y*.08;for(let x=ox;x<VW;x+=sw)ctx.drawImage(fc,x,oy)}
  else{ctx.fillStyle='#9cc6a8';for(let i=-1;i<12;i++){const x=i*260-(cam.x*.2)%260;ctx.beginPath();ctx.ellipse(x,VH*.72,200,90,0,0,6.283);ctx.fill()}}
  // drifting clouds
  ctx.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<4;i++){const cx=((i*347+LV.t*(6+i*2)-cam.x*.05)%(VW+400)+VW+400)%(VW+400)-200,cy=40+i*28;for(const [dx,dy,r] of [[0,0,30],[30,6,24],[-28,8,22],[10,-14,22]]){ctx.beginPath();ctx.arc(cx+dx,cy+dy,r,0,6.283);ctx.fill()}}
  const mc=midStrip(),mx=-(cam.x*MIDP),my=-cam.y*.35+8;mc.forEach((cc,i)=>{const x=mx+i*2048;if(x<VW&&x+cc.width>0)ctx.drawImage(cc,x,my)});
  if(L.backdrop)for(const s of L.backdrop.spires||[]){const x=s.x*TS-cam.x*.5;ctx.fillStyle='#e9e2d4';ctx.fillRect(x-14,VH*.38,28,140);ctx.beginPath();ctx.moveTo(x-18,VH*.38);ctx.lineTo(x,VH*.2);ctx.lineTo(x+18,VH*.38);ctx.fill()}
  return}
 // (non-World-1 levels keep the old plain backdrop)

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
  else if(t==='#'||t==='L'){const gr=!SKIN[d]&&GRASSY.test(L.theme||''),top0=r>0&&!BLOCK.has(tile(c,r-1));ctx.fillStyle=SKIN[d]||(gr?(top0?'#8a6a48':'#76583a'):(top0?'#8f8a80':'#7a756c'));ctx.fillRect(x,y,TS,TS);
   if(!SKIN[d]){const hv=hsh(c*131+r*7);ctx.fillStyle=gr?'rgba(60,40,20,.35)':'rgba(255,255,255,.1)';ctx.fillRect(x+hv%36+4,y+(hv>>6)%30+12,6,4);ctx.fillRect(x+(hv>>11)%30+8,y+(hv>>16)%20+20,4,4);ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(x,y+TS-6,TS,6)}if(d==='X'&&c%3===0){ctx.fillStyle='#e8e2c8';ctx.fillRect(x+10,y+TS/2-2,TS-20,4)}else if(d==='u'||d==='H'){ctx.fillStyle=d==='u'?'#5a7f9a':'#8a3a2e';ctx.fillRect(x+12,y+10,TS-24,TS-22)}
   if(!BLOCK.has(tile(c,r-1))){ctx.fillStyle=TOPC[d]||'#6aa84f';ctx.fillRect(x,y,TS,8);if(!TOPC[d]){ctx.fillStyle='#7fc25a';ctx.fillRect(x,y,TS,3);ctx.fillStyle='#5a9a3f';for(let i=3;i<TS;i+=8){ctx.beginPath();ctx.moveTo(x+i,y+9);ctx.lineTo(x+i+3,y+15-((c+i)%3)*2);ctx.lineTo(x+i+6,y+9);ctx.fill()}}}
   if(t==='L'&&!BLOCK.has(tile(c,r-1))){ctx.fillStyle='#ffe08a';ctx.fillRect(x+(BLOCK.has(tile(c-1,r))?TS-10:0),y,10,10);if(!BLOCK.has(tile(c+1,r)))ctx.fillRect(x+TS-10,y,10,10)}
   ctx.strokeStyle='rgba(0,0,0,.12)';ctx.strokeRect(x+.5,y+.5,TS-1,TS-1)}
  else if(t==='B'){ctx.fillStyle='#c9b48a';ctx.fillRect(x,y,TS,TS);ctx.strokeStyle='#8a7550';ctx.lineWidth=3;ctx.strokeRect(x+3,y+3,TS-6,TS-6);ctx.beginPath();ctx.moveTo(x+6,y+TS-6);ctx.lineTo(x+TS-6,y+6);ctx.stroke();ctx.lineWidth=1}
  else if(t==='?'){const u=used.has(c+','+r);ctx.fillStyle=u?'#9a8a6a':'#f2b632';ctx.fillRect(x,y,TS,TS);ctx.fillStyle=u?'#7a6a4a':'#fff';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(u?'·':'?',x+TS/2,y+TS-12)}
  else if(t==='='){ctx.fillStyle=ONEC[d]||'#a0a8b0';ctx.fillRect(x,y,TS,12);if(d==='b'){ctx.fillStyle='#4f8a3a';ctx.beginPath();ctx.ellipse(x+24,y-6,30,14,0,0,6.283);ctx.fill()}}
  else if(t==='F'){ctx.fillStyle='#d8c8a8';ctx.fillRect(x,y,TS,8);ctx.fillStyle='#bfae8c';for(let i=4;i<TS;i+=12)ctx.fillRect(x+i,y+8,6,TS*1.6)}
  else if(t==='^'){ctx.fillStyle='#e0703a';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*12,y+TS);ctx.lineTo(x+i*12+6,y+TS-16);ctx.lineTo(x+i*12+12,y+TS);ctx.fill()}}
  else if(t==='~'){ctx.fillStyle='rgba(60,140,220,.7)';ctx.fillRect(x,y+10+Math.sin(LV.t*3+c)*3,TS,TS-10)}}
 groundProps(c0,c1);
 // tree canopies
 for(const tr of L.trees||[]){const x=(tr.trunk.x+.5)*TS-cam.x,y=tr.trunk.top*TS-cam.y;if(x<-300||x>VW+300)continue;const red=/pohutukawa/i.test(tr.name);
  ctx.fillStyle='rgba(46,110,52,.9)';for(const [dx,dy,rx] of [[-60,10,80],[60,10,80],[0,-30,90]]){ctx.beginPath();ctx.ellipse(x+dx,y+dy,rx,50,0,0,6.283);ctx.fill()}
  if(red){ctx.fillStyle='#d9332f';for(let i=0;i<18;i++){ctx.beginPath();ctx.arc(x+Math.cos(i*2.4)*90,y+Math.sin(i*1.7)*40,5,0,6.283);ctx.fill()}}}
 // roofs trim
 for(const rf of L.roofs||[]){const x=rf.x0*TS-cam.x,y=rf.y*TS-cam.y;ctx.fillStyle='#a8452f';ctx.fillRect(x-6,y-6,(rf.x1-rf.x0+1)*TS+12,8)}}
function groundProps(c0,c1){const urban=!GRASSY.test(L.theme||'');
 for(let c=c0;c<=c1;c++)for(let r=1;r<H;r++){if(tile(c,r)!=='#'||tile(c,r-1)!=='.'||deco(c,r)!=='.'||deco(c,r-1)!=='.')continue;const hv=hsh(c*977+r*31+3),k=hv%11,x=c*TS-cam.x,y=r*TS-cam.y;
  if(k<=1){ctx.fillStyle='#4e8a3e';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x+10+i*7,y);ctx.lineTo(x+12+i*7+(i%2?3:-3),y-12-(hv>>(i+3))%8);ctx.lineTo(x+16+i*7,y);ctx.fill()}}
  else if(k===2||k===3){const fc=['#ff6a8a','#ffd34d','#ffffff','#b07aff'][(hv>>5)%4];for(let i=0;i<3;i++){const fx=x+8+i*14,fy=y-10-(hv>>(i*2+7))%8;ctx.fillStyle='#4e8a3e';ctx.fillRect(fx-1,fy,2,y-fy);ctx.fillStyle=fc;ctx.beginPath();ctx.arc(fx,fy,4.5,0,6.283);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(fx,fy,1.8,0,6.283);ctx.fill()}}
  else if(k===4&&tile(c,r-2)==='.'){ctx.fillStyle='#3f7d3f';ctx.beginPath();ctx.arc(x+16,y-12,16,Math.PI,0);ctx.arc(x+34,y-10,13,Math.PI,0);ctx.fill();ctx.fillStyle='rgba(255,255,255,.15)';ctx.beginPath();ctx.arc(x+12,y-20,6,0,6.283);ctx.fill()}
  else if(k===5&&urban&&(hv>>9)%3===0&&tile(c,r-2)==='.'){ctx.fillStyle='#6b4a2e';ctx.fillRect(x+21,y-34,6,34);ctx.fillStyle=['#d9483b','#3b7dd9','#3fa35a'][(hv>>4)%3];ctx.fillRect(x+12,y-48,24,16);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x+16,y-42,16,3)}}}
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
 // v44: sensible fallbacks for the rest of the decoLegend (posts/poles on T, background props)
 case 'q':case 'j':case 'i':case 'd':case '3':ctx.fillStyle=d==='q'?'#e8e2d0':d==='3'?'#a9a49a':d==='d'?'#8d959c':'#5d666e';ctx.fillRect(x+(d==='3'?8:19),y,d==='3'?32:10,TS);break;
 case 'm':ctx.strokeStyle='rgba(200,210,215,.6)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=TS;i+=12){ctx.moveTo(x+i,y);ctx.lineTo(x+i-12,y+TS);ctx.moveTo(x+i-12,y);ctx.lineTo(x+i,y+TS)}ctx.stroke();break;
 case 'C':ctx.fillStyle='#8a5a34';ctx.fillRect(x+2,y+4,TS-4,TS-8);ctx.fillStyle='#ffe9b0';ctx.fillRect(x+8,y+10,TS-16,TS-24);break;
 case 'e':ctx.strokeStyle='#9aa0a6';ctx.lineWidth=3;for(let i=6;i<TS;i+=14){ctx.beginPath();ctx.arc(x+i+5,y+TS-6,7,Math.PI,0);ctx.stroke()}ctx.lineWidth=1;break;
 case 'E':ctx.fillStyle='#b8b4a8';ctx.fillRect(x+10,y+4,TS-20,TS-4);ctx.fillStyle='#8a867a';ctx.fillRect(x+16,y+14,TS-32,3);break;
 case '1':ctx.fillStyle='#4e7a3a';ctx.beginPath();ctx.ellipse(x+24,y+26,24,18,0,0,6.283);ctx.fill();ctx.fillStyle='#6a5a3a';for(let i=8;i<TS;i+=10)ctx.fillRect(x+i,y+38,3,10);break;
 case '2':ctx.fillStyle='rgba(150,145,135,.6)';ctx.fillRect(x,y+14,TS,16);break;
 case 'I':ctx.fillStyle='#d6d6ce';ctx.fillRect(x,y+TS-10,TS,10);break;
 default:{const k=SKIN[d]||TOPC[d]||ONEC[d];if(k){ctx.globalAlpha=.35;ctx.fillStyle=k;ctx.fillRect(x+4,y+4,TS-8,TS-8);ctx.globalAlpha=1}}}}   // unknown: a faint tint, never a bright block
function signs(){ctx.textAlign='center';
 for(const s of L.shopSigns||[]){const x=s.x0*TS-cam.x,w=(s.x1-s.x0+1)*TS,y=s.y*TS-cam.y;if(x>VW||x+w<0)continue;const b=s.bg||[80,80,80];ctx.fillStyle=`rgb(${b[0]},${b[1]},${b[2]})`;ctx.fillRect(x,y+6,w,TS-12);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.fillText(s.text,x+w/2,y+TS/2+7)}
 for(const s of L.tutorial||[]){const x=(s.x+.5)*TS-cam.x;if(x<-200||x>VW+200)continue;let r=surfaceRow(s.x,6);if(r>=H)r=surfaceRow(s.x,0);const y=r*TS-cam.y;   // street-level sign (not on a branch above it)
  ctx.fillStyle='#6b4a2e';ctx.fillRect(x-4,y-70,8,70);ctx.font='bold 15px sans-serif';const txt=/^ATTACK\s+X/.test(s.text)?'CLAW  (X) — tap 3× for a combo! ▲+CLAW hits birds':s.text;const w=Math.max(120,ctx.measureText(txt).width+20);ctx.fillStyle='#fff7d6';ctx.fillRect(x-w/2,y-118,w,48);ctx.strokeStyle='#6b4a2e';ctx.lineWidth=3;ctx.strokeRect(x-w/2,y-118,w,48);ctx.lineWidth=1;ctx.fillStyle='#3a2a1a';ctx.fillText(txt,x,y-88)}
 // checkpoints + goal
 for(const c of L.checkpoints||[]){const x=(c.x+.5)*TS-cam.x,y=(c.y+1)*TS-cam.y;ctx.fillStyle='#ddd';ctx.fillRect(x-3,y-110,6,110);ctx.fillStyle=p.cp&&p.cp.x>=x+cam.x-1?'#7fffd4':'#ff8a5a';ctx.fillRect(x+3,y-110,36,24)}
 const g=L.goal,gx=(g.x+.5)*TS-cam.x,gy=(g.y+1)*TS-cam.y;ctx.fillStyle='#ffd34d';ctx.fillRect(gx-60,gy-200,14,200);ctx.fillRect(gx+46,gy-200,14,200);ctx.fillRect(gx-60,gy-214,120,22);ctx.fillStyle='#3a2a1a';ctx.font='bold 16px sans-serif';ctx.fillText('HOME →',gx,gy-197)}
function drawFrame(key,fi,x,y,face,s,alpha){const L2=F[key];if(!L2||!L2.length)return false;const f=L2[Math.floor(fi)%L2.length];const im=img(f.f);if(!ok(im))return false;
 ctx.save();ctx.globalAlpha=alpha==null?1:alpha;ctx.translate(x,y);ctx.scale(face*s,s);ctx.drawImage(im,-f.ax,-f.ay,f.w,f.h);ctx.restore();return true}
function drawEnts(){for(const e of ents){if(e.got)continue;const x=e.x-cam.x,y=e.y-cam.y;if(x<-50||x>VW+50)continue;
  if(e.type==='coin'){ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.ellipse(x,y,10*Math.abs(Math.cos(e.ph*2))+3,12,0,0,6.283);ctx.fill()}
  else if(e.type==='fish'){ctx.fillStyle='#7fc6ff';ctx.beginPath();ctx.ellipse(x,y,18,9,0,0,6.283);ctx.fill();ctx.beginPath();ctx.moveTo(x+14,y);ctx.lineTo(x+26,y-9);ctx.lineTo(x+26,y+9);ctx.fill()}
  else if(e.type==='yarn'){ctx.fillStyle='#ff6ab0';ctx.beginPath();ctx.arc(x,y,14,0,6.283);ctx.fill();ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(x,y,9,0,4);ctx.stroke()}
  else if(e.type==='secret_paw'){const gl=.5+.5*Math.sin(LV.t*4+e.ph);ctx.fillStyle=`rgba(255,225,77,${.25+.25*gl})`;ctx.beginPath();ctx.arc(x,y,26,0,6.283);ctx.fill();ctx.fillStyle='#ffe14d';ctx.beginPath();ctx.ellipse(x,y+5,10,8,0,0,6.283);for(const [dx,dy] of [[-11,-6],[-4,-12],[4,-12],[11,-6]]){ctx.moveTo(x+dx+4,y+dy);ctx.arc(x+dx,y+dy,4,0,6.283)}ctx.fill()}
  else if(e.type==='mission_gift'){const gl=.5+.5*Math.sin(LV.t*3);ctx.fillStyle=`rgba(255,184,77,${.3+.3*gl})`;ctx.beginPath();ctx.arc(x,y,32,0,6.283);ctx.fill();ctx.font='34px sans-serif';ctx.textAlign='center';ctx.fillText('🎁',x,y+12)}
  else{ctx.fillStyle='#7fffd4';ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?8:18;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.fill()}}
 for(const v of cars){const x=v.x-cam.x,y=v.y-cam.y;if(x>VW||x+v.w<0)continue;ctx.fillStyle=v.col;ctx.fillRect(x,y-v.h+10,v.w,v.h-22);ctx.fillStyle='#9fd0e6';
  if(v.kind==='bus'){for(let i=0;i<4;i++)ctx.fillRect(x+12+i*56,y-v.h+22,40,36);ctx.fillStyle='#2f7ad9';ctx.fillRect(x,y-40,v.w,10)}else ctx.fillRect(x+v.w*(v.dir>0?.55:.1),y-v.h+18,v.w*.35,30);
  ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x+28,y-10,12,0,6.283);ctx.arc(x+v.w-28,y-10,12,0,6.283);ctx.fill()}
 for(const k of kids){const key=k.kind==='skateboard'?'en_kidskate_move':'en_kidscoot_move';drawFrame(key,k.ph*10,k.x-cam.x,k.y-cam.y,k.dir,SC*.9)}
 for(const e of enemies){if(!e.alive&&e.ko<=0)continue;const key='en_'+(e.spr||e.id)+(e.alive?(e.hurt>0?'_m_hurt':'_move'):'_m_ko');const x=e.x-cam.x,y=e.y-cam.y;if(x<-100||x>VW+100)continue;
  if(!drawFrame(key,e.t*10,x,y,e.face,SC,e.alive?1:e.ko)){const mv='en_'+(e.spr||e.id)+'_move',fb=[key,mv].map(k=>(F[k]||[]).findIndex(f=>ok(img(f.f)))).map((i,j)=>[[key,mv][j],i]).find(q=>q[1]>=0);   // v44d: still loading -> a loaded frame, never a box flash
   if(fb)drawFrame(fb[0],fb[1],x,y,e.face,SC,e.alive?1:e.ko);else if(!F[key]&&!F[mv]){ctx.fillStyle='#a05a3a';ctx.fillRect(x-e.w/2,y-e.h,e.w,e.h)}}}}
function drawPaddy(){if(p.anim==='mv'&&!p.mv)p.anim=p.ground?'idle':'fall';const a=p.anim==='mv'?[p.mv.d.a,p.mv.d.fps||12]:(ANIM[p.anim]||ANIM.idle),key=a[0];const nf=(F[key]||[1]).length;const fi=p.anim==='climb'?(p.y/24):p.anim==='mv'?(p.mv.d.loop?p.mv.t*a[1]:Math.min(nf-1,p.mv.t*a[1])):LV.t*a[1];
 if(p.mv&&p.mv.d.trail)moveTrail();const blink=p.inv>0&&Math.floor(LV.t*20)%2;
 if(!drawFrame(key,fi,p.x-cam.x,p.y-cam.y+(p.anim==='ledge'?BH*.45:0),p.face,SC,blink?.4:1)){ctx.fillStyle='#e8c8a0';ctx.fillRect(p.x-cam.x-BW/2,p.y-cam.y-BH,BW,BH)}
 if(qs.has('hitbox')){ctx.strokeStyle='#f0f';ctx.strokeRect(p.x-cam.x-BW/2,p.y-cam.y-BH,BW,BH)}}
function drawFx(dt){for(const f of fx){f.l-=dt;const x=f.x-cam.x,y=f.y-cam.y;ctx.globalAlpha=Math.max(0,Math.min(1,f.l*2));
  if(f.k==='say'){f.y-=40*dt;ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=5;ctx.strokeText(f.t,x,y);ctx.fillStyle=f.c;ctx.fillText(f.t,x,y);ctx.lineWidth=1}
  else if(f.k==='wave'){ctx.strokeStyle=f.c||'#bfe8ff';ctx.lineWidth=6;ctx.beginPath();const a0=f.face<0?Math.PI:0;ctx.arc(x,y,(1-f.l/.5)*f.r+20,a0-1.1,a0+1.1);ctx.stroke();ctx.lineWidth=1}
  else if(f.k==='chip'){f.vy+=G*.5*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;ctx.fillStyle='#c9b48a';ctx.fillRect(x,y,8,8)}else if(f.k==='pow'){ctx.fillStyle='#fff';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText('POW!',x,y)}
  else{ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(x,y,(1-f.l)*40+6,0,6.283);ctx.stroke()}}ctx.globalAlpha=1;fx=fx.filter(f=>f.l>0)}
function hud(dt){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(10,10,420,40);ctx.fillStyle='#fff';ctx.font='bold 20px sans-serif';ctx.textAlign='left';
 ctx.fillText('♥'.repeat(Math.max(0,p.hp))+'♡'.repeat(Math.max(0,p.max-p.hp))+'   🪙 '+p.coins+'   🧶 '+p.yarn+'/4',22,37);
 ctx.textAlign='right';ctx.fillText(lab()+' · '+L.name,VW-14,30);{const d=prog();ctx.font='bold 15px sans-serif';ctx.fillText('EXP '+(d.exp||0)+' · forms '+((d.forms||[]).length),VW-14,52);ctx.font='bold 20px sans-serif'}
 if(arena&&arena.state==='lock'&&!arena.boss){ctx.fillStyle='#ff9a5a';ctx.textAlign='center';ctx.fillText('⚔ '+arena.name+' — '+arena.list.filter(e=>e.alive).length+' left',VW/2,76)}
 let y=(p.lt||0)<(L.id==='silverdale_1'?10:4)&&!p.done?(L.id==='silverdale_1'?250:195):130;for(const m of msgs){m.l-=dt;ctx.globalAlpha=Math.max(0,Math.min(1,m.l*2));ctx.fillStyle=m.c;ctx.textAlign='center';ctx.font=`bold ${m.big?40:26}px sans-serif`;ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=5;ctx.strokeText(m.t,VW/2,y);ctx.fillText(m.t,VW/2,y);y+=m.big?50:34}
 ctx.globalAlpha=1;ctx.lineWidth=1;msgs=msgs.filter(m=>m.l>0);
 // v45: Paddy's moves card at the start of 1-1 (and for 4 s at the start of every other level)
 {const T=L.id==='silverdale_1'?10:4;if((p.lt||0)<T&&!p.done){const a=Math.min(1,(T-p.lt)*1.5);ctx.globalAlpha=a;const w=720,x=VW/2-w/2,y=112;ctx.fillStyle='rgba(20,12,36,.78)';ctx.fillRect(x,y,w,L.id==='silverdale_1'?96:40);ctx.strokeStyle='#ffd34d';ctx.lineWidth=2;ctx.strokeRect(x,y,w,L.id==='silverdale_1'?96:40);ctx.lineWidth=1;
  ctx.fillStyle='#ffe08a';ctx.textAlign='center';ctx.font='bold 17px sans-serif';ctx.fillText('PADDY\'S MOVES:  CLAW ×3 combo · TAIL ×3 · MEOW',VW/2,y+26);
  if(L.id==='silverdale_1'){ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.fillText('▲ + CLAW = UPPERCUT (reaches birds!) · CLAW in the air = AIR SWIPE / SPIN',VW/2,y+52);ctx.font='bold 14px sans-serif';ctx.fillText('combos: CLAW×3 + TAIL×2 · CLAW×5 + TAIL · CLAW×3 + MEOW · TAIL×3 + CLAW×3',VW/2,y+78)}ctx.globalAlpha=1}}
 if(p.done){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(VW/2-220,VH/2-60,440,120);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 24px sans-serif';ctx.fillText('🪙 '+p.coins+' · 🧶 '+p.yarn+'/4 · '+(TOUCH?'tap ':'press N or ')+(isLast()?'for the title':'NEXT for the next level'),VW/2,VH/2+8);if(isLast()){ctx.fillStyle='#ffe14d';ctx.font='bold 30px sans-serif';ctx.fillText('🌏 WORLD 1 COMPLETE!',VW/2,VH/2-26)}}}
let last=0;function loop(ts){const dt=Math.min(.033,(ts-(last||ts))/1000);last=ts;if(L&&!LV.pause&&hs>0){hs-=dt}else if(L&&!LV.pause){update(dt);updEnemies(dt);updKids(dt);updCars(dt);updArenas();updBoss(dt);updEnts();updCam(dt)}
 if(L){ctx.save();sky();shake=Math.max(0,shake-dt*30);if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);drawTiles();signs();drawEnts();drawBoss();drawPaddy();drawFx(dt);ctx.restore();hud(dt);bossHud()}requestAnimationFrame(loop)}
function fit(){const s=Math.min(innerWidth/VW,innerHeight/VH);cv.style.width=VW*s+'px';cv.style.height=VH*s+'px'}addEventListener('resize',fit);fit();
async function go(id){try{const lv=await loadLevel(id);history.replaceState(null,'','?level='+id+(qs.has('hitbox')?'&hitbox':''));init(lv)}catch(e){LV.err=String(e);console.error(e)}}
LV.go=go;LV.p=p;LV.tile=tile;LV.state=()=>({id:L&&L.id,x:p.x/TS,y:p.y/TS,state:p.state,ground:p.ground,coins:p.coins,hp:p.hp,arena:arena&&arena.name,done:p.done,log:LV.log.slice(-20)});
LV.teleport=(tx,ty)=>{if(arena){arena.state='idle';arena.list.forEach(e=>{e.alive=false;e.ko=0});if(arena.boss)arena.list=[];arena=null}p.x=(tx+.5)*TS;p.y=(ty+1)*TS;p.vx=p.vy=0;p.state='normal';cam.x=Math.max(0,Math.min(W*TS-VW,p.x-VW*.4))};
LV.boss=()=>boss&&{id:boss.id,name:boss.def.name,title:boss.def.title,hp:boss.hp,max:boss.max,st:boss.st,alive:boss.alive,x:boss.x/TS,y:boss.y/TS,wTiles:boss.w/TS,hTiles:boss.h/TS,wPx:boss.w,hPx:boss.h,arena:bossA&&{state:bossA.state,x0:bossA.x0,x1:bossA.x1,trig:bossA.trig,wl:bossA.wl,wr:bossA.wr,p2:bossA.p2,adds:bossA.list.length}};LV.bossHit=n=>bossHit(n);LV.bossRaw=()=>boss;
LV.calm=()=>{enemies.forEach(e=>{e.alive=false;e.ko=0});arenas.forEach(a=>a.state='done');arena=null};LV.kids=()=>kids;LV.ents=()=>ents;LV.cars=()=>cars;LV.enemies=()=>enemies;LV.arenas=()=>arenas;LV.cam=cam;
(async()=>{F=await getJSON('assets/frames.json');for(const a of Object.values(ANIM))(F[a[0]]||[]).forEach(f=>img(f.f));await go(LID);requestAnimationFrame(loop)})();
})();
