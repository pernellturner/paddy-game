// ===================== v25: GOLDEN FURY PADDY – the GOD tier, u=18 (FORM 22) =====================
// ONE form with 5 levels: FURY 1 → FURY 2 → FURY 3 (great mane) → FURY 4 (crimson) → FURY GOD (white-gold, halo, floats).
// ⚡ POWER UP (button / G key) = a DBZ-style escalating transformation: scream, aura, cracking ground, rising rocks, lightning, zoom-out, announcer.
// Every level is faster, hits harder, has a bigger aura and more moves. Fury God is near-invincible.
// AERIAL STYLE: Jump in the air = FLY (hold Jump rise · ▼ sink), Claw = air combo (juggles), ▼+Claw = SPIKE (crater),
//  Tail = SMASH HIGHER (3rd time = into space), Blink = FLASH CHASE, Meow = SKY SHATTER punch (cut-scene: they crash far away, dizzy, and come back).
(function(){
if(typeof UF==='undefined'||typeof MC==='undefined')return;
const U=18,PRE='gf',FF=22,COL='#ffd23a',COL2='#fff3b0',LAVA='#ff4a12',SKY='#bfe8ff';
if(UF.length!==U){console.warn('goldenfury: unexpected UF length',UF.length);return}
UF.push({pre:PRE,nm:'GOLDEN FURY',ico:'🌟',el:'fury',col:COL,col2:COL2,spd:540,H:.3,H0:.26,minT:.1,W:.14,E:.38,tier:'GOD FORM',god:1,
 CH:[null,MC('h1','thrust',270,.05,'FURY JAB!'),MC('h2','thrust',270,.05,'FURY CROSS!'),MC('h3','spin',220,.06,'GOLDEN CLAW!'),MC('h4','spin',200,.06,'CLAW RUSH!'),
  MC('h5','low',360,.06,'FURY SWEEP!'),MC('h6','rise',180,.07,'RISING FURY!'),MC('h7','big',260,.09,'FURY HAMMER!')]});
UPRE.push(PRE);
UA(PRE,{idle:['idle',null,7,1],run:['run',null,16,1],rise:['jump',[1,2],9],apex:['jump',[3]],fall:['jump',[4]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[5]],
 h1:['combo_a',[0,1,2],18],h2:['combo_a',[3,4,5],18],h3:['combo_b',[0,1],16],h4:['combo_b',[2,3],16],h5:['combo_c',[0,1],14],h6:['combo_c',[2,3],14],h7:['special',[4,5],12],
 launch:['combo_c',[2,3],13],air1:['special',[1]],air2:['combo_b',[4]],dive:['special',[3]],
 tail:['combo_b',[0,1,2,3],18],tail2:['combo_b',[2,3,4,5],18],meowc:['ult',[2]],meow:['combo_a',[1,2,3,4],20],meow2:['combo_c',[2,3],14],
 blink:['special',[0],14],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[2]],ultD:['ult',[3]],ultE:['ult',[4]],ultF:['ult',[5]],
 power:['ult',[0,1],6,1],charge:['ult',[2]],beam:['ult',[3]],point:['ult',[4]],fists:['combo_a',null,22,1],claws:['combo_b',[0,1,2,3],20,1],smash:['special',[4]],leap:['special',[1]],
 uppercut:['combo_c',[2,3],14],fly:['special',[1]],hover:['jump',[3]],tuck:['special',[2]],spike:['special',[3]],airup:['combo_c',[3]],punch:['special',[1]]});
// level sheets (cut by src/cut_gf.py) – registered so they preload with the form
Object.assign(A,{gf_v3i:['gf3_idle',null,7,1],gf_v3c:['gf3_combo',null,1,0],gf_v4i:['gf4_idle',null,7,1],gf_v4c:['gf4_combo',null,1,0],gf_vgi:['gfg_idle',null,6,1],gf_vgc:['gfg_combo',null,1,0]});
const LVO={3:{idle:['v3i'],hover:['v3i',[0,1,2]],h1:['v3c',[0,1]],h2:['v3c',[1,2]],h3:['v3c',[2]],meow:['v3c',[1,2,1,2]],fists:['v3c',[1,2]],uppercut:['v3c',[3]],launch:['v3c',[3]],airup:['v3c',[3]],
  power:['v3c',[4]],ultA:['v3c',[4]],ultB:['v3c',[4]],charge:['v3c',[0]],beam:['v3c',[5]],ultD:['v3c',[5]],punch:['v3c',[1]],victory:['v3c',[4]]},
 4:{idle:['v4i'],hover:['v4i',[0,1,2]],h1:['v4c',[1]],h2:['v4c',[2]],h3:['v4c',[1,2]],h4:['v4c',[2,1]],claws:['v4c',[1,2]],tail:['v4c',[1,2]],tail2:['v4c',[2,1]],meow:['v4c',[1,2]],fists:['v4c',[1,2]],
  leap:['v4c',[3]],airup:['v4c',[3]],uppercut:['v4c',[3]],launch:['v4c',[3]],smash:['v4c',[4]],h7:['v4c',[3,4]],power:['v4c',[3]],ultA:['v4c',[3]],ultB:['v4c',[3]],charge:['v4c',[0]],beam:['v4c',[1]],
  punch:['v4c',[1]],victory:['v4c',[5]]},
 5:{idle:['vgi'],run:['vgi'],rise:['vgi',[0]],apex:['vgi',[1]],fall:['vgi',[2]],land:['vgi',[3]],hover:['vgi'],fly:['vgc',[0]],hurt:['vgi',[0]],h1:['vgc',[0]],h2:['vgc',[1]],h3:['vgc',[2]],h4:['vgc',[0,2]],
  h5:['vgc',[2]],h6:['vgc',[4]],h7:['vgc',[1]],meow:['vgc',[0,1]],meow2:['vgc',[2]],fists:['vgc',[0,1]],claws:['vgc',[2,0]],tail:['vgc',[2]],tail2:['vgc',[2]],uppercut:['vgc',[4]],launch:['vgc',[4]],
  airup:['vgc',[4]],air1:['vgc',[0]],air2:['vgc',[2]],spike:['vgc',[2]],dive:['vgc',[2]],blink:['vgi',[0]],power:['vgc',[3]],charge:['vgc',[5]],beam:['vgc',[1]],point:['vgc',[4]],
  ultA:['vgc',[3]],ultB:['vgc',[3]],ultC:['vgc',[5]],ultD:['vgc',[1]],ultE:['vgc',[4]],ultF:['vgc',[5]],victory:['vgc',[3]],smash:['vgc',[1]],leap:['vgc',[0]],tuck:['vgc',[3]],punch:['vgc',[0]]}};
Object.assign(KB,{gfclaw:[150,-160,.15,.02],gffist:[110,-120,.1,.012],gftele:[260,-950,.7,.07],gfbeam:[240,-180,.2,.015],gfsmash:[320,-900,.5,.08],gflava:[40,-520,.3,.02],
 gfpush:[460,-300,.25,.02],gfecho:[80,-90,.08,.01],gffinal:[420,-1500,.8,.2],gfup:[80,-1100,.8,.06],gfair:[40,-300,.6,.03],gfhigh:[40,-1350,.9,.07],gfspike:[30,2400,.4,.09],
 gfquake:[300,-600,.4,.04],gfshat:[2600,-1400,.9,.16]});
Object.assign(NAMES,{gfclaw:' ',gffist:' ',gftele:'TELEPORT STRIKE!',gfbeam:' ',gfsmash:'VOLCANIC SMASH!',gflava:' ',gfpush:' ',gfecho:' ',gffinal:' ',gfup:'RISING FURY!',gfair:' ',gfhigh:'HIGHER!',
 gfspike:'FURY SPIKE!',gfquake:' ',gfshat:'SKY SHATTER!!'});
UTN.push(['CLAW BARRAGE!','CLAW BARRAGE II!','TELEPORT STRIKE!']);
MTK[U]='gfclaw';MMK[U]='gffury';MMN.gffury=['FIST BARRAGE!','TELEPORT STRIKE!','FURY CANNON!'];
MBN[U]='FLASH STEP!';MLN[U]='FURY LEAP!';MDN[U]='FURY SPIKE!';MFIN[U]='DIVINE JUDGEMENT!!';MULT[U]=['THE TRUE…','POWER!!'];
LKF.push(MLK(COL,COL2,'FURY JAB!','RISING FURY!','CLAW BARRAGE!','TELEPORT STRIKE!','FIST BARRAGE!','FURY CANNON!','FLASH STEP!','FLASH CHASE!'));
LKT.push({C:'slash',T:'mT',M:'mM',B:'tele'});
ROUTES.push([MR('CCCM','FIST BARRAGE!','jab, cross, claw – then a golden fist barrage'),MR('CCCMM','TELEPORT STRIKE!','barrage, then vanish and strike from behind'),
 MR('TTT','TELEPORT STRIKE!','claw barrages that launch, then teleport after them (Fury 2+)'),MR('MMM','FURY CANNON!','Fury 3 beam · Fury 4 VOLCANIC SMASH · God DIVINE PALM'),
 MR('CCCCCT','SKY JUGGLE!','launch them, Jump in the air to FLY, Claw to juggle, ▼+Claw spike, Tail higher, Meow SKY SHATTER'),
 MR('CCCTMMB','DIVINE JUDGEMENT','ULTIMATE: Fury Rush · Fury Cannon · Volcanic Smash · and at Fury God, the Divine Judgement',1)]);
UNLK.push({k:'exp',n:9999999,txt:'Awakens in the story finale'});
FCOL.push(COL);FNAME.push('GOLDEN FURY PADDY');
for(const k in TKA)TKA[k].push(PRE+'_'+({leap:'rise',bonk:'dive',drop:'dive',trip:'tail'}[k]||'rise'));
window.UFTABS.push(['🌟 GOLDEN FURY',COL]);
Object.assign(map,{KeyG:'gpow',NumpadDivide:'uf18'});INSTANT.push('gpow','uf18');
const _ok=UNL.ok.bind(UNL);UNL.ok=function(u){if(u===U)return true;return _ok(u)}; // all unlocked for testing
// ---------- state ----------
const GF={lv:1,lastF:-1,pu:null,fin:null,ss:null,fly:0,flyT:0,hoverT:0,atk:null,mv:null,smash:null,beam:null,q:[],arcs:[],rocks:[],lava:[],craters:[],erupt:[],pill:[],halos:[],motes:[],
 hi:0,ac:0,acT:0,cam:0,scn:0,base:null,flyTip:0,lastEcho:new Map(),dim:0};window.GFURY=GF;
const SPD=[0,540,590,640,700,780],AUR=[0,58,70,84,100,122],LVN=['','FURY 1','FURY 2','FURY 3','FURY 4','FURY GOD'];
const lc=l=>l>=5?'#fff6cf':l===4?'#ff6a2a':COL,lc2=l=>l>=5?'#ffe27a':l===4?'#ffd23a':COL2;
const snd=(k,v,g)=>{try{SND.play(k,{v:v==null?1:v,gap:g||.05})}catch(_){}};
const spark=(x,y,n,v,cols)=>{cols=cols||[lc(GF.lv),lc2(GF.lv),'#fff'];for(let i=0;i<(n||8);i++){const a=Math.random()*6.283,s=(v||260)*(.4+Math.random());sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,l:.45+Math.random()*.3,c:cols[i%cols.length]})}};
const ring=(x,y,r,vr,l,col,w)=>R9.rings.push({x,y,r:r||20,vr:vr||1100,l:l||.7,col:col||lc(GF.lv),w:w||12,f:FF,face:0});
const curFr=()=>{try{const a=FR[p.anim]||FR.idle;return a&&a[Math.min(a.length-1,p.fi|0)]}catch(_){return null}};
const frOf=(k,i)=>{const a=FR[PRE+'_'+k];return a?a[Math.min(a.length-1,i||0)]:curFr()};
const isGF=()=>{try{return FORM()===FF&&p.uf===U}catch(_){return false}};
const alive=()=>dummies.filter(d=>d.alive&&!d.benched&&!d.gfGone);
const front=(r,back)=>alive().filter(d=>(d.x-p.x)*p.face>-(back||40)&&Math.abs(d.x-p.x)<r&&Math.abs(d.y-p.y)<230);
const nearest=(r,airOnly)=>alive().filter(d=>Math.abs(d.x-p.x)<r&&(!airOnly||d.y<GROUND-60)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;
const ghostTrail=(x0,y0,x1,y1,n)=>{const f=curFr();for(let k=1;k<=(n||6);k++)ghosts.push({x:x0+(x1-x0)*k/((n||6)+1),y:y0+(y1-y0)*k/((n||6)+1),f,face:p.face,l:.12+k*.04,blue:1})};
const later=(t,f)=>GF.q.push({t,f});
const lockAnim=(a,t)=>{GF.atk={a:PRE+'_'+a,t:t||.3,t0:t||.3};setAnim(PRE+'_'+a,true)};
// ---------- per-level sprites ----------
function snapBase(){if(GF.base||!FR.gf_idle)return;GF.base={};for(const a in A)if(a.startsWith('gf_')&&!/^gf_v[34g][ic]$/.test(a)&&FR[a])GF.base[a.slice(3)]=FR[a]}
function applyLevel(l){snapBase();if(!GF.base)return;for(const k in GF.base)FR['gf_'+k]=GF.base[k];const o=LVO[l];if(o)for(const k in o){const [v,idx]=o[k],src=FR['gf_'+v];if(!src||!src.length)continue;FR['gf_'+k]=idx?idx.filter(i=>i<src.length).map(i=>src[i]):src.slice()}
 UF[U].spd=SPD[l]||540;if(FR[p.anim]&&p.fi>=FR[p.anim].length)p.fi=0}
function preloadAll(){try{if(!window.queueFrames)return;const n=[];for(const a in A)if(a.startsWith('gf_')&&FR[a])FR[a].forEach(f=>{if(!IMG[f.f]&&!n.includes(f.f))n.push(f.f)});if(n.length)queueFrames(n,1)}catch(_){}}
// ---------- the ⚡ POWER UP button ----------
const pbtn=()=>document.querySelector('#ui .b[data-k="gpow"]');
function showBtn(on){const b=pbtn();if(!b)return;const want=on?'':'none';if(b.style.display!==want){b.style.display=want;dispatchEvent(new Event('resize'))}if(on){b.classList.toggle('max',GF.lv>=5);b.innerHTML=GF.lv>=5?'🌟':'⚡<small>POWER</small>'}}
// ---------- ⚡ POWER UP: escalating transformation (rides the 'ufin' state, tap to skip after .4s) ----------
const PUL=[0,0,1.7,2.3,2.9,4.1];
const FREE=['normal','land','jump','djump','dash','ndash','fall','idle','stop','slide','victory','walk','run','umeow','utail','hardland'];
function tryPower(){if(!isGF())return;if(GF.pu||GF.fin||GF.ss||(window.TX23&&TX23.on))return;
 if(GF.lv>=5){say('🌟 FURY GOD – MAX POWER','#fff6cf',true);return}
 if(!FREE.includes(p.state)){return}
 const to=GF.lv+1,L=PUL[to];GF.pu={t:0,to,L,rel:false,ev:{},x:p.x};GF.atk=null;GF.mv=null;GF.beam=null;
 act('ufin',PRE+'_power',{say:'',c:COL});p.inv=Math.max(p.inv||0,L+.6);p.vx=0;p.fz={st:0,k:0,n:0};
 snd('gf_aura',.95,.3);try{MUS.duck(L+1.5)}catch(_){}}
function puState(dt,t){const S=GF.pu,to=S.to,L=S.L,k=t/L;S.t=t;p.vx=0;if(!p.ground){p.vy=0;p.hang=.2}
 const relAt=L*.72;
 // camera: tight on Paddy for the scream, then pull way back to show the power
 window.XCAM=t<relAt?{z:1.14-.05*(to-2)*k,b:.75,d:.25+.1*(to-2)}:{z:.86-.05*(to-2),b:.75,d:.15};S.cam=1;
 if(!S.ev.yell&&t>.12){S.ev.yell=1;setAnim(PRE+'_power',true);snd('gf_scream',1,.3)}
 if(!S.ev.vo&&t>.3){S.ev.vo=1;snd(to>=4?'vo_gf_awaken':'vo_gf_rise',1,.6)}
 if(!S.ev.crack&&t>.25){S.ev.crack=1;try{R9.cracks.push(mkCrack(p.x,FF))}catch(_){}shake=Math.max(shake,8);snd('gf_crack',.8,.3)}
 if(to>=4&&!S.ev.crack2&&t>L*.45){S.ev.crack2=1;try{R9.cracks.push(mkCrack(p.x-140,FF));R9.cracks.push(mkCrack(p.x+140,FF))}catch(_){}snd('gf_crack',1,.3)}
 if(t<relAt){shake=Math.max(shake,2+k*6*(to-1));
  // aura storm: sparks spiralling in, rocks lifting off the ground, lightning
  if(Math.random()<.9){const a=Math.random()*6.283,r=110+Math.random()*90;sparks.push({x:p.x+Math.cos(a)*r,y:p.y-95+Math.sin(a)*r,vx:-Math.cos(a)*380,vy:-Math.sin(a)*380-40,l:.35,c:Math.random()<.5?lc(to):'#fff'})}
  if(Math.random()<dt*(4+to*3))GF.rocks.push({x:p.x+(Math.random()-.5)*(260+to*60),y:GROUND+4,vy:-(40+Math.random()*90),s:5+Math.random()*(6+to*2),r:Math.random()*6,vr:(Math.random()-.5)*4,l:L*1.2,c:Math.random()<.5?'#8a7458':'#6e5c46'});
  if(to>=3&&Math.random()<dt*(to-1)*1.6){try{mBolt(clampX(p.x+(Math.random()-.5)*420),{hit:false,w:1+.2*to,col:to>=5?'#ffffff':'#fff2a0'})}catch(_){}}
  if(Math.random()<dt*(8+to*4))arc(1.2);
  if(t%.5<dt)waves.push({x:p.x,y:GROUND,r:10,l:.5,big:false})}
 if(!S.rel&&t>=relAt)release(S);
 if(t>=L)puEnd()}
function release(S){S.rel=true;const to=S.to;GF.lv=to;applyLevel(to);showBtn(true);setAnim(PRE+(to>=5?'_ultC':'_victory'),true);
 snd('gf_boom',1,.3);if(to>=5)later(.25,()=>snd('vo_gf_god',1,.6));
 for(let i=0;i<3;i++)ring(p.x,p.y-100,30+i*40,1000+i*260+to*120,.7+to*.05,i%2?lc2(to):lc(to),7+to);
 waves.push({x:p.x,y:GROUND,r:10,l:1,big:true});spark(p.x,p.y-100,30+to*10,500+to*80,[lc(to),lc2(to),'#fff']);
 shake=Math.max(shake,10+to*5);flashT=Math.max(flashT,.05+to*.02);hitstop=Math.max(hitstop,.06);window.ZOOMOUT=Math.max(window.ZOOMOUT||0,1.4);
 for(const d of alive())if(Math.abs(d.x-p.x)<420){d.hp=Math.max(1,d.hp);mHit(d,'gfpush',Math.sign(d.x-p.x)||p.face)}
 if(to>=5){for(let i=0;i<4;i++)GF.halos.push({r:30+i*18,vr:520+i*120,l:1.3,l0:1.3});GF.pill.push({x:p.x,t:0,L:1.2,w:150,hit:true,god:1})}
 card(to>=5?'🌟 FURY GOD!!':'⚡ '+LVN[to]+'!',to>=5?'THE TRUE PADDY HAS AWAKENED':['','','FASTER · STRONGER · LIGHTNING','THE GREAT MANE · FURY CANNON','CRIMSON FURY · VOLCANIC SMASH'][to],lc(to))}
function puEnd(){const S=GF.pu;if(!S)return;if(!S.rel)release(S);GF.pu=null;if(S.cam)window.XCAM=null;p.inv=Math.max(p.inv||0,.8);if(p.state==='ufin')ufFinEnd()}
const skipPU=e=>{const S=GF.pu;if(!S||S.t<.4)return;if(e&&e.type==='keydown'&&e.code==='KeyG'&&S.t<.6)return;puEnd()};
['pointerdown','touchstart','keydown'].forEach(ev=>addEventListener(ev,skipPU,{capture:true,passive:true}));
function arc(sc){const R=AUR[GF.lv]*(sc||1),pts=[];let a=Math.random()*6.283,x=p.x+Math.cos(a)*R*.5,y=p.y-95+Math.sin(a)*R*.7;pts.push([x,y]);
 for(let i=0;i<5;i++){x+=(Math.random()-.5)*44;y+=(Math.random()-.5)*44;pts.push([x,y])}GF.arcs.push({pts,l:.08+Math.random()*.06})}
// ---------- ground moves ----------
function barrage(n,kb,r,anim,fists){lockAnim(anim,.08*n+.1);for(let i=0;i<n;i++)later(i*.07,()=>{const tg=front(r||240);const f=p.face;
  for(const d of tg)mHit(d,kb,f,GF.keep);const y=p.y-(GF.lv>=5?120:95)+(Math.random()-.5)*60,x=p.x+f*(60+Math.random()*90);
  if(fists)GF.fists.push({x,y,f,l:.14});else sLine(x-f*40,y-40,x+f*40,y+40,lc(GF.lv),.15,6);if(i%2)snd('gf_swing'+(1+i%2),.5,.04)});
 snd('gf_barrage',.9,.4)}
GF.fists=[];
function tele(d,launch){if(!d)return false;const x0=p.x,y0=p.y,side=d.x>=p.x?1:-1;ring(x0,y0-90,18,900,.3);spark(x0,y0-90,10,300);
 p.x=clampX(d.x+side*90);p.face=-side;if(d.y<GROUND-60){p.y=d.y+30;p.ground=false;GF.fly=1}ghostTrail(x0,y0,p.x,p.y,7);
 lockAnim('punch',.28);mHit(d,launch?'gftele':'gfclaw',p.face,GF.keep);if(launch)d.gfJ=2.2;ring(p.x,p.y-90,16,1000,.35,'#fff',8);
 sLine(p.x-p.face*30,p.y-150,p.x+p.face*170,p.y-60,lc(GF.lv),.25,10);flashT=Math.max(flashT,.05);snd('gf_boom',.45,.15);say('TELEPORT STRIKE!',lc2(GF.lv),true);return true}
function beam(big){const f=p.face;GF.beam={t:0,L:big?1.1:.9,w:big?44:30,big:!!big,tick:0};lockAnim('beam',GF.beam.L);p.vx=0;snd('gf_beam',1,.4);shake=Math.max(shake,8);
 say(big?'DIVINE PALM!':'FURY CANNON!',big?'#fff6cf':COL,true);if(big){GF.halos.push({r:20,vr:600,l:.8,l0:.8})}}
function smashStart(){p.vy=-980;p.ground=false;GF.smash={t:0,dove:false};lockAnim('leap',.4);spark(p.x,GROUND-20,14,380);snd('gf_swing2',1,.2);say('VOLCANIC…',LAVA,true)}
function lavaBurst(x,big){try{R9.cracks.push(mkCrack(x,FF))}catch(_){}const segs=[];for(let b=0;b<(big?10:6);b++){const dir=b%2?1:-1,pts=[[x,GROUND+2]];let cx=x,cy=GROUND+2;
  for(let s=0;s<(big?11:7);s++){cx+=dir*(22+Math.random()*30);cy=GROUND+2+Math.random()*(big?26:16);pts.push([cx,cy])}segs.push(pts)}
 GF.lava.push({x,segs,l:big?3:2.2,l0:big?3:2.2,tick:.25,R:big?700:330});for(let i=0;i<(big?5:3);i++)waves.push({x,y:GROUND-4+i*3,r:10+i*35,l:1,big:true});
 for(const d of alive())if(Math.abs(d.x-x)<(big?560:360)&&d.y>GROUND-260){d.hp=Math.max(1,d.hp);mHit(d,big?'gffinal':'gfsmash',Math.sign(d.x-x)||p.face,GF.keep)}
 spark(x,GROUND-20,30,600,[LAVA,'#ffb020','#fff']);shake=Math.max(shake,big?32:22);flashT=Math.max(flashT,.1);hitstop=Math.max(hitstop,.08);snd('gf_crack',1,.3);snd('gf_boom',.9,.3);say('VOLCANIC SMASH!',LAVA,true)}
function gfMove(kind,lv,keep){extend();GF.keep=keep;const L=GF.lv;
 if(kind==='gfclaw'){
  if(lv<2){barrage(4+L,'gfclaw',230,lv?'tail2':'claws',false);if(lv)later(.08*(4+L),()=>{for(const d of front(240)){mHit(d,'gfup',p.face,keep);d.gfJ=2.2}lockAnim('uppercut',.3);say('LAUNCH!',COL2)});return}
  if(L>=2&&tele(nearest(720),1))return;
  lockAnim('tail2',.35);for(const d of front(320))mHit(d,'gfup',p.face,keep);sLine(p.x,p.y-60,p.x+p.face*300,p.y-170,COL,.3,12);say('GOLDEN CLAW WAVE!',COL);return}
 // gffury: 0 FIST BARRAGE · 1 TELEPORT STRIKE · 2 FURY CANNON (3) / VOLCANIC SMASH (4) / DIVINE PALM (God) / RISING FURY (1-2)
 if(lv===0){barrage(5+L,'gffist',240,'fists',true);return}
 if(lv===1){const t1=nearest(720);if(!tele(t1,0)){barrage(4,'gffist',240,'fists',true);return}
  if(L>=3){const t2=alive().filter(d=>d!==t1).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];if(t2)later(.22,()=>tele(t2,1))}return}
 if(L===3){beam(false);return}if(L===4){if(p.ground)smashStart();else{p.vy=2400;GF.smash={t:1,dove:true};lockAnim('smash',.5)}return}if(L>=5){beam(true);return}
 lockAnim('uppercut',.35);p.vy=-700;p.ground=false;for(const d of front(260)){mHit(d,'gfup',p.face,keep);d.gfJ=2.2}spark(p.x+p.face*60,p.y-120,12,380);say('RISING FURY!',COL,true)}
const _mMove=mMove;mMove=function(kind,lv,keep){if(kind==='gfclaw'||kind==='gffury')return gfMove(kind,lv,keep);return _mMove(kind,lv,keep)};
// ---------- AERIAL STYLE ----------
const AIRBUSY=['ufin','nmorph','respawn','lk','lkult','moonl','ledge','bunny','eclipse','finishhim','ko','hurt'];
const airOK=()=>isGF()&&!p.ground&&!AIRBUSY.includes(p.state)&&!GF.pu&&!GF.fin&&!GF.ss&&!(window.MOON&&MOON.on)&&!(window.TX23&&TX23.on);
function startFly(){GF.fly=1;p.vy=Math.min(p.vy,-320);ring(p.x,p.y-60,24,900,.4);spark(p.x,p.y-40,10,260);snd('gf_swing1',.8,.2);
 if(GF.flyTip<2){GF.flyTip++;say('FLY! hold Jump ▲ · ▼ sink','#fff3b0',true)}}
function glide(x1,y1,L,then){GF.mv={x0:p.x,y0:p.y,x1:clampX(x1),y1:Math.max(GROUND-420,Math.min(GROUND,y1)),t:0,L:L||.14,then}}
function airTarget(r){return alive().filter(d=>Math.abs(d.x-p.x)<(r||250)&&Math.abs(d.y-p.y)<240).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null}
function juggle(d,t){d.gfJ=Math.max(d.gfJ||0,t||2.2);d.cool=Math.max(d.cool||0,.6)}
function airAttack(){const d=airTarget(260),f=p.face;GF.hoverT=.4;GF.acT=.7;
 if(K.down){// SPIKE them into the ground
  lockAnim('spike',.32);if(d){p.face=Math.sign(d.x-p.x)||f;glide(d.x-p.face*80,d.y-20,.08,()=>{mHit(d,'gfspike',p.face,GF.keep);d.gfJ=0;d.gfS=1;d.vy=2400;sLine(d.x,d.y-160,d.x,d.y+40,lc(GF.lv),.25,12);
   ring(d.x,d.y-60,18,900,.3,'#fff',8);hitstop=Math.max(hitstop,.07);shake=Math.max(shake,10);snd('gf_boom',.6,.1);say('FURY SPIKE!',lc2(GF.lv),true);GF.hi=0})}
  else{p.vy=1500;GF.fly=0}return}
 if(K.up){airLaunch();return}
 const A2=['air1','fists','air2','punch'][GF.ac%4];GF.ac++;lockAnim(A2,.22);
 if(d){p.face=Math.sign(d.x-p.x)||f;glide(d.x-p.face*85,d.y+18,.09,()=>{mHit(d,'gfair',p.face,GF.keep);juggle(d);
   for(let i=1;i<=1+(GF.lv>=3?1:0);i++)later(i*.06,()=>{if(d.alive){mHit(d,'gfecho',p.face,GF.keep);juggle(d)}});
   GF.fists.push({x:d.x-p.face*20,y:d.y-70,f:p.face,l:.14});spark(d.x,d.y-70,6,240);if(GF.ac%4===0)say('AIR RUSH!',COL2)})}
 else sLine(p.x,p.y-110,p.x+f*160,p.y-70,lc(GF.lv),.15,6)}
function airLaunch(){const d=airTarget(270)||(p.ground?null:nearest(300));lockAnim('airup',.3);GF.hoverT=.45;
 if(!d){p.vy=-600;return}p.face=Math.sign(d.x-p.x)||p.face;
 glide(d.x-p.face*80,d.y+20,.08,()=>{GF.hi++;if(GF.hi>=3&&typeof window.moonStart==='function'){GF.hi=0;GF.fly=1;say('TO SPACE!!!','#bfe6ff',true);window.ZOOMOUT=Math.max(window.ZOOMOUT||0,1.2);
    try{moonStart(d)}catch(_){mHit(d,'gfhigh',p.face)}return}
  mHit(d,'gfhigh',p.face,GF.keep);juggle(d,2.8);d.vy=-1350-GF.hi*150;ring(d.x,d.y-60,20,1200,.4);spark(d.x,d.y-60,14,420);shake=Math.max(shake,8);snd('gf_boom',.5,.1);
  say(['','HIGHER!','EVEN HIGHER!!'][GF.hi]||'HIGHER!',lc2(GF.lv),true);
  later(.22,()=>{if(d.alive&&!GF.ss){GF.fly=1;glide(d.x-p.face*90,d.y+40,.16,()=>{lockAnim('fly',.2)});say('FLASH CHASE!',COL2)}})})}
function flyChase(){const d=nearest(760,true);if(!d)return false;p.face=Math.sign(d.x-p.x)||p.face;GF.fly=1;lockAnim('fly',.25);snd('gf_swing2',.8,.1);
 glide(d.x-p.face*85,d.y+18,.16,()=>{mHit(d,'gfair',p.face,GF.keep);juggle(d);ring(d.x,d.y-70,16,900,.3,'#fff',8)});say('FLASH CHASE!',COL2);return true}
// ---------- SKY SHATTER: the punch that sends them flying far away (cut-scene), then they come back dizzy ----------
function skyShatter(){const d=airTarget(330)||nearest(420,true);if(!d)return false;
 GF.ss={t:0,d,face:Math.sign(d.x-p.x)||p.face,hit:false,back:false,scn:(GF.scn++)%2};GF.atk=null;GF.mv=null;
 act('ufin',PRE+'_charge',{say:'',c:COL});p.inv=Math.max(p.inv||0,5);p.vx=0;p.fz={st:0,k:0,n:0};snd('gf_aura',.7,.3);return true}
function ssState(dt,t){const S=GF.ss,d=S.d;S.t=t;p.vy=0;p.hang=.2;
 if(t<.35){window.XCAM={z:1.15,b:.7,d:.3};S.cam=1;if(d.alive){d.vx=0;d.vy=0;d.cool=1}
  const tx=d.x-S.face*95,ty=Math.min(GROUND,d.y+20);p.face=S.face;p.x+=(clampX(tx)-p.x)*Math.min(1,dt*14);p.y+=(ty-p.y)*Math.min(1,dt*14);if(t%.04<dt)ghosts.push({x:p.x,y:p.y,f:curFr(),face:p.face,l:.2,blue:1});
  if(Math.random()<.9){const a=Math.random()*6.283;sparks.push({x:p.x+Math.cos(a)*120,y:p.y-95+Math.sin(a)*120,vx:-Math.cos(a)*320,vy:-Math.sin(a)*320,l:.3,c:Math.random()<.5?lc(GF.lv):'#fff'})}}
 else if(!S.hit){S.hit=true;setAnim(PRE+'_punch',true);window.XCAM={z:.74,b:.7,d:.1};flashT=Math.max(flashT,.22);hitstop=Math.max(hitstop,.14);shake=Math.max(shake,28);
  snd('gf_boom',1,.3);snd('gf_hit',1,.1);say('SKY SHATTER!!',lc2(GF.lv),true);for(let i=0;i<4;i++)ring(d.x,d.y-70,20+i*24,1400+i*200,.8,i%2?'#fff':lc(GF.lv),14);
  GF.shards={x:d.x,y:d.y-70,l:1.1,l0:1.1,seed:Math.random()*99};d.hp=Math.max(2,d.hp);mHit(d,'gfshat',S.face);d.vx=S.face*2600;d.vy=-1500;d.gfJ=0;S.fx=d.x;S.fy=d.y}
 else if(t<1.05){if(d.alive){d.vx=S.face*2600;d.cool=2}if(t>.8&&!S.gone){S.gone=1;snd('gf_swing2',.6,.1)}}
 else if(t<3.35){if(!S.cut){S.cut=1;S.dhp=d.hp;window.XCAM={z:.74,b:0,d:0}}if(d.alive){d.gfGone=1;d.x=clampX(p.x);d.y=GROUND-3000;d.vx=0;d.vy=0;d.cool=3}
  if(t>1.62&&!S.bonk){S.bonk=1;snd('gf_crack',.9,.2);snd('gf_boom',.5,.2)}}
 else{if(!S.back){S.back=1;window.XCAM=null;S.cam=0;if(d.alive){d.gfGone=0;d.x=clampX(p.x+p.face*240);d.y=GROUND-700;d.vy=600;d.vx=0;d.hp=Math.max(1,(S.dhp||d.hp)-2);d.gfDz=3.2;d.cool=3.2}
   say('…and back they come!','#fff3b0',true);setAnim(PRE+'_victory',true)}
  if(t>3.9){GF.ss=null;if(p.state==='ufin')ufFinEnd()}}}
// ---------- FINISHERS (perfect 8th hit) – one per level ----------
const FINL={1:2.4,2:2.4,3:3,4:3.1,5:4.2};
const _fin=ufFinal;ufFinal=function(){if(p.uf!==U)return _fin.apply(this,arguments);C.atk++;popNum(8,COL);const L=GF.lv,mode=L>=5?'god':L===4?'volc':L===3?'cannon':'rush';
 GF.fin={mode,t:0,L:FINL[L],foes:alive().sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x)).slice(0,8),ev:{},k:0};GF.atk=null;GF.mv=null;GF.beam=null;
 act('ufin',PRE+(mode==='god'?'_ultA':'_power'),{say:{rush:'FURY RUSH…',cannon:'FURY CANNON…',volc:'VOLCANIC…',god:'DIVINE…'}[mode],c:lc(L)});p.inv=6;p.vx=0;p.vy=0;p.fz={st:0,k:0,n:0};
 window.ZOOMOUT=Math.max(window.ZOOMOUT||0,GF.fin.L);snd('gf_aura',1,.3)};
function finState(dt,t,at){const S=GF.fin,L=GF.lv;S.t=t;if(!p.ground&&S.mode!=='volc'){p.vy=0;p.hang=.2}
 const foes=S.foes.filter(d=>d.alive);
 if(S.mode==='rush'){if(t<.3){setAnim(PRE+'_power');return}
  if(t<1.6){if(t-(S.last||0)>.12){S.last=t;const d=foes[S.k++%Math.max(1,foes.length)];if(d){const x0=p.x,side=S.k%2?1:-1;p.x=clampX(d.x+side*85);p.face=-side;ghostTrail(x0,p.y,p.x,p.y,4);
     setAnim(PRE+(S.k%2?'_h1':'_h3'),true);d.hp=Math.max(2,d.hp);mHit(d,'gfecho',p.face);juggle(d,.5);sLine(p.x,p.y-150,p.x+p.face*160,p.y-50,S.k%2?lc(L):'#fff',.2,10);snd('gf_hit',.6,.05)}}}
  else if(!S.ev.boom){S.ev.boom=1;setAnim(PRE+'_uppercut',true);snd('gf_finisher',1,.4);try{SND.announce&&SND.announce(true)}catch(_){}for(const d of alive())if(Math.abs(d.x-p.x)<520){d.hp=Math.max(1,d.hp);mHit(d,'gffinal',Math.sign(d.x-p.x)||p.face)}
   for(let i=0;i<4;i++)ring(p.x,p.y-100,20+i*30,1500,.9);flashT=Math.max(flashT,.2);shake=Math.max(shake,24);card('FURY RUSH!!','PERFECT 8TH HIT',COL)}
  if(t>S.L-.1){GF.fin=null;ufFinEnd()}return}
 if(S.mode==='cannon'){const n=foes.filter(d=>(d.x-p.x)>0).length,m=foes.length-n;if(t<.05)p.face=n>=m?1:-1;
  if(t<.9){setAnim(PRE+'_charge');window.XCAM={z:1.1-.3*t,b:.75,d:.3};S.cam=1;if(Math.random()<.9){const a=Math.random()*6.283;sparks.push({x:p.x+p.face*70+Math.cos(a)*90,y:p.y-100+Math.sin(a)*90,vx:-Math.cos(a)*260,vy:-Math.sin(a)*260,l:.35,c:Math.random()<.5?COL:'#fff'})}shake=Math.max(shake,3+t*6)}
  else{if(!S.ev.fire){S.ev.fire=1;setAnim(PRE+'_beam',true);GF.beam={t:0,L:1.25,w:64,big:true,mega:1,tick:0};snd('gf_beam',1,.3);snd('gf_finisher',1,.4);try{SND.announce&&SND.announce(true)}catch(_){}window.XCAM={z:.72,b:.75,d:.2}}
   if(at(2)){for(const d of alive())if((d.x-p.x)*p.face>-40){d.hp=Math.max(1,d.hp);mHit(d,'gffinal',p.face)}card('FURY CANNON!!','PERFECT 8TH HIT',COL)}}
  if(t>S.L-.05){GF.fin=null;if(S.cam)window.XCAM=null;ufFinEnd()}return}
 if(S.mode==='volc'){if(t<.25){setAnim(PRE+'_smash');p.vy=0;return}
  if(t<.8){if(!S.ev.up){S.ev.up=1;setAnim(PRE+'_leap',true);snd('gf_swing2',1,.2);window.XCAM={z:.78,b:.75,d:.2};S.cam=1}const u=(t-.25)/.55;p.y=GROUND-Math.sin(u*Math.PI*.5)*330;p.ground=false;p.vy=0}
  else if(t<.95){setAnim(PRE+'_smash');p.y=Math.min(GROUND,p.y+3600*dt);p.vy=0}
  else{if(!S.ev.boom){S.ev.boom=1;p.y=GROUND;p.ground=true;setAnim(PRE+'_smash',true);lavaBurst(p.x,1);snd('gf_finisher',1,.4);try{SND.announce&&SND.announce(true)}catch(_){}
    for(const d of alive())GF.erupt.push({x:d.x,l:1.3,l0:1.3,d:Math.abs(d.x-p.x)/1800});for(let k=-3;k<=3;k++)if(k)GF.erupt.push({x:p.x+k*230,l:1.2,l0:1.2,d:Math.abs(k)*.08});card('VOLCANIC SMASH!!','PERFECT 8TH HIT',LAVA)}
   p.y=GROUND;p.ground=true;if(t>2.2)setAnim(PRE+'_victory')}
  if(t>S.L-.05){GF.fin=null;if(S.cam)window.XCAM=null;ufFinEnd()}return}
 // ---- DIVINE JUDGEMENT (Fury God) ----
 window.XCAM={z:t<.5?1.05:.7,b:.8,d:0};S.cam=1;GF.dim=t<2.9?Math.min(1,t/.5):Math.max(0,1-(t-2.9)/.8);
 if(t<.6){setAnim(PRE+'_ultA');if(!p.ground||t>.1){p.y=Math.max(GROUND-80,p.y-140*dt);p.ground=false}if(at(.08)){for(let i=0;i<5;i++)GF.halos.push({r:24+i*16,vr:420+i*140,l:1.4,l0:1.4})}if(at(.4))snd('vo_gf_god',1,.5)}
 else if(t<1.75){setAnim(PRE+'_point');if(!S.ev.halo){S.ev.halo=1;GF.bigHalo={x:p.x,y:p.y-360,l:0};snd('gf_judgement',1,.5)}GF.bigHalo.l=Math.min(1,(t-.6)/.5);
  for(const d of alive()){d.vx*=.5;d.cool=Math.max(d.cool||0,.5)}
  if(Math.random()<.95){const a=Math.random()*6.283,r=380+Math.random()*200;GF.motes.push({x:p.x+Math.cos(a)*r,y:p.y-360+Math.sin(a)*r*.5,tx:GF.bigHalo.x,ty:GF.bigHalo.y,l:0,L:.5})}}
 else if(!S.ev.judge){S.ev.judge=1;setAnim(PRE+'_ultC',true);try{SND.announce&&SND.announce(true)}catch(_){}
  // the light judgement: a pillar on every enemy plus a wall of pillars across the whole screen, spreading out from Paddy
  for(const d of alive())GF.pill.push({x:d.x,t:-Math.abs(d.x-p.x)/2600,L:1.5,w:84,hit:true,tgt:d});
  for(let k=-6;k<=6;k++)if(k)GF.pill.push({x:p.x+k*150,t:-Math.abs(k)*.045,L:1.4,w:54,hit:false});GF.sweep={l:1.1,l0:1.1,x:p.x}}
 else{if(t>2.15&&!S.ev.card){S.ev.card=1;card('DIVINE JUDGEMENT!!','THE TRUE PADDY · PERFECT 8TH HIT','#fff6cf');flashT=Math.max(flashT,.18);shake=Math.max(shake,30)}
  if(t>2.6)setAnim(PRE+'_ultF');if(GF.bigHalo&&t>2.6)GF.bigHalo.l=Math.max(0,1-(t-2.6)/1);}
 if(t>S.L-.05){GF.fin=null;GF.bigHalo=null;GF.dim=0;if(S.cam)window.XCAM=null;ufFinEnd()}}
const _ufm=window.UFIN_MAX;window.UFIN_MAX=q=>q.uf===U?(GF.pu?GF.pu.L+.6:GF.ss?4.6:GF.fin?GF.fin.L+.6:4.8):(_ufm?_ufm(q):0);
const _fst=ufFinalState;ufFinalState=function(dt,t,at){if(p.uf===U){if(GF.pu)return puState(dt,t);if(GF.ss)return ssState(dt,t);if(GF.fin)return finState(dt,t,at)}return _fst(dt,t,at)};
// ---------- stronger every level: golden echo hits from Fury 3 · God shrugs most hits off ----------
const _hd=hitDummy;hitDummy=function(d,move,dir){const r=_hd.apply(this,arguments);
 try{if(p.uf===U&&GF.lv>=3&&d&&move&&!/^gf(echo|final|lava|beam|shat)$/.test(move)){const t=performance.now(),l=GF.lastEcho.get(d)||0;
  if(t-l>(GF.lv>=5?160:260)){GF.lastEcho.set(d,t);later(.08,()=>{if(d.alive&&!d.gfGone){_hd.call(null,d,'gfecho',dir||p.face);ring(d.x,d.y-70,10,700,.22,lc(GF.lv),6)}})}}}catch(_){}
 return r};
const _hm=hurtMe;hurtMe=function(){if(p.uf===U&&FORM()===FF){const ch=GF.lv>=5?.85:GF.lv===4?.35:GF.lv===3?.15:0;
  if(GF.pu||GF.fin||GF.ss||Math.random()<ch){p.inv=Math.max(p.inv||0,.5);ring(p.x,p.y-95,40,600,.35,'#fff',8);spark(p.x,p.y-95,10,300);say(GF.lv>=5?'DIVINE GUARD!':'FURY GUARD!','#fff6cf');return}}
 return _hm.apply(this,arguments)};
// FLASH STEP (blink): golden teleport; in the air it becomes FLASH CHASE after a launched enemy
const _blink=ufBlink;ufBlink=function(){if(p.uf===U&&!CINE.includes(p.state)&&!['lk','lkult','nmorph','respawn','ledge','ufin'].includes(p.state)){
  if(!p.ground&&flyChase())return true;const f=(K.left?-1:K.right?1:-p.face),x0=p.x,x1=clampX(p.x+f*260);ring(x0,p.y-90,18,900,.3);p.x=x1;ghostTrail(x0,p.y,x1,p.y,5);
  p.inv=Math.max(p.inv||0,.35);setAnim(PRE+'_blink',true);ring(x1,p.y-90,18,900,.3,'#fff');snd('gf_swing2',.8,.06);say('FLASH STEP!',COL2);extend();return true}
 return _blink()};
const _mBig=mBig;mBig=function(u,x,big){if(u!==U)return _mBig(u,x,big);for(let i=0;i<(big?5:3);i++)ring(x,GROUND-120,20+i*26,1300+i*160,.8);flashT=Math.max(flashT,big?.2:.08);
 if(big)for(const d of alive())if(Math.abs(d.x-x)<520)mHit(d,'gffinal',Math.sign(d.x-x)||p.face)};
// ---------- per-frame ----------
const _pre=r9Pre;r9Pre=function(dt){
 let f=-1;try{f=FORM()}catch(_){}
 if(f===FF&&GF.lastF!==FF){GF.lv=1;GF.base=null;applyLevel(1);preloadAll();showBtn(true)}
 if(f!==FF&&GF.lastF===FF){applyLevel(1);GF.lv=1;GF.fly=0;GF.pu=null;GF.ss=null;GF.fin=null;GF.beam=null;GF.dim=0;if(GF.cam){window.XCAM=null;GF.cam=0}showBtn(false);for(const d of dummies)d.gfGone=0}
 GF.lastF=f;
 // inputs (before the link/combo handlers see them)
 if(f===FF&&typeof P!=='undefined'){
  if(P.gpow){delete P.gpow;tryPower()}
  if(airOK()){
   if(P.jump){delete P.jump;if(!GF.fly)startFly()}
   if(P.down&&GF.fly)delete P.down;
   if(P.attack){delete P.attack;airAttack()}
   else if(P.tail){delete P.tail;airLaunch()}
   else if(P.special){if(skyShatter())delete P.special;else if(GF.lv>=3){delete P.special;GF.hoverT=1;beam(GF.lv>=5)}}
  }}
 _pre(dt);
 if(f!==FF)return;
 if(GF.pu&&p.state!=='ufin'){puEnd()}
 if(GF.ss&&p.state!=='ufin'){const d=GF.ss.d;if(d){d.gfGone=0;if(d.y<GROUND-1500){d.y=GROUND-600;d.vy=300}}GF.ss=null;if(GF.cam)window.XCAM=null}
 if(GF.fin&&p.state!=='ufin'){GF.fin=null;GF.dim=0;GF.bigHalo=null}
 // scheduled hits
 for(const e of GF.q){e.t-=dt;if(e.t<=0&&!e.done){e.done=1;try{e.f()}catch(_){}}}GF.q=GF.q.filter(e=>!e.done);
 if(GF.atk){GF.atk.t-=dt;if(GF.atk.t<=0)GF.atk=null}
 // in-betweens: glide Paddy to a target over a few frames with afterimages
 const M=GF.mv;if(M){M.t+=dt;const u=Math.min(1,M.t/M.L),e=u*u*(3-2*u);const px=p.x,py=p.y;p.x=M.x0+(M.x1-M.x0)*e;p.y=M.y0+(M.y1-M.y0)*e;p.vy=-1900*dt;p.vx=0;
  ghosts.push({x:px,y:py,f:curFr(),face:p.face,l:.16,blue:1});if(u>=1){GF.mv=null;if(M.then)M.then()}}
 // flight: hover / rise / sink, gravity cancelled; the camera pulls back with altitude and stays on Paddy
 if(p.ground){GF.fly=0;GF.hoverT=0;GF.ac=0}
 const flying=GF.fly&&!p.ground&&!['ufin','moonl','nmorph','respawn','ledge'].includes(p.state);
 if(GF.hoverT>0)GF.hoverT-=dt;
 if(flying&&!M){GF.flyT+=dt;p.hang=0;const tv=K.jump?-460:K.down?560:Math.sin(GF.flyT*3)*24;p.vy+=(tv-p.vy)*Math.min(1,dt*9);if(p.y<GROUND-400&&p.vy<0)p.vy=0;p.vy-=1900*dt;
  if(Math.random()<dt*10)sparks.push({x:p.x-p.face*30+(Math.random()-.5)*40,y:p.y-40,vx:-p.vx*.3,vy:60,l:.3,c:lc(GF.lv)})}
 else if(GF.hoverT>0&&!p.ground&&!M&&p.state!=='ufin'){p.vy=Math.min(p.vy,60)-1900*dt*.9}
 const hi=Math.min(p.y,...alive().filter(d=>d.gfJ>0).map(d=>d.y));const alt=GROUND-hi;
 if((flying||alt>200)&&!GF.pu&&!GF.fin&&!GF.ss&&p.state!=='ufin'){window.XCAM={z:Math.max(.8,.95-alt/2400),b:0,d:0};GF.cam=1}else if(GF.cam&&!GF.pu&&!GF.fin&&!GF.ss&&p.state!=='ufin'){window.XCAM=null;GF.cam=0}
 // juggled enemies float (slow gravity) while the combo keeps going; spiked ones crater the ground
 for(const d of dummies){if(!d.alive)continue;if(d.gfJ>0){d.gfJ-=dt;if(d.y<GROUND-450){d.y=GROUND-450;d.vy=Math.max(d.vy,0)}if(d.y<GROUND-20){d.fl=Math.max(d.fl||0,.3);if(d.vy>140)d.vy=140}}
  if(d.gfS&&d.y>=GROUND-4){d.gfS=0;crater(d.x)}if(d.gfS&&d.vy<1200&&d.y<GROUND-4)d.vy=1800;if(d.gfDz>0){d.gfDz-=dt;d.cool=Math.max(d.cool||0,.2)}}
 // volcanic smash
 const SM=GF.smash;if(SM){SM.t+=dt;if(!SM.dove&&(SM.t>.32||p.vy>0)){SM.dove=true;p.vy=2600;lockAnim('smash',.5)}if(SM.dove&&p.ground){GF.smash=null;lavaBurst(p.x,0)}if(SM.t>2.5)GF.smash=null}
 // beam
 const B=GF.beam;if(B){B.t+=dt;p.vx=0;if(!p.ground&&!B.mega)p.vy=-1900*dt;B.tick-=dt;if(B.tick<=0){B.tick=.1;const oy=p.y-(GF.lv>=5?118:100);
   for(const d of alive())if((d.x-p.x)*p.face>20&&Math.abs((d.y-70)-oy)<B.w+70)mHit(d,'gfbeam',p.face,GF.keep)}if(Math.random()<.5)shake=Math.max(shake,B.mega?6:3);if(B.t>=B.L)GF.beam=null}
 // lava cracks keep burning
 for(const L of GF.lava){L.l-=dt;L.tick-=dt;if(L.tick<=0){L.tick=.3;for(const d of alive())if(Math.abs(d.x-L.x)<L.R*.6&&d.y>GROUND-40)mHit(d,'gflava',Math.sign(d.x-L.x)||1)}
  if(Math.random()<dt*14){const s=L.segs[Math.floor(Math.random()*L.segs.length)],q=s[Math.floor(Math.random()*s.length)];sparks.push({x:q[0],y:q[1]-4,vx:(Math.random()-.5)*60,vy:-120-Math.random()*200,l:.5,c:Math.random()<.5?LAVA:'#ffb020'})}}
 GF.lava=GF.lava.filter(L=>L.l>0);
 for(const c of GF.craters)c.l-=dt;GF.craters=GF.craters.filter(c=>c.l>0);
 for(const e of GF.erupt){e.d-=dt;if(e.d<=0)e.l-=dt;if(e.d<=0&&!e.go){e.go=1;spark(e.x,GROUND-40,10,500,[LAVA,'#ffb020'])}}GF.erupt=GF.erupt.filter(e=>e.l>0);
 for(const P0 of GF.pill){P0.t+=dt;if(P0.hit&&P0.t>=.12&&!P0.done){P0.done=1;const d=P0.tgt;ring(P0.x,GROUND-10,30,1200,.6,'#fff',10);spark(P0.x,GROUND-30,14,420,['#fff','#fff6cf',COL]);
   if(d&&d.alive){d.hp=Math.max(1,d.hp);mHit(d,'gffinal',Math.sign(d.x-p.x)||p.face)}else if(P0.god)for(const q of alive())if(Math.abs(q.x-P0.x)<200)mHit(q,'gfpush',Math.sign(q.x-P0.x)||1);snd('gf_hit',.5,.03)}}
 GF.pill=GF.pill.filter(P0=>P0.t<P0.L);
 for(const h of GF.halos){h.l-=dt;h.r+=h.vr*dt*(h.l/h.l0)}GF.halos=GF.halos.filter(h=>h.l>0);
 for(const m of GF.motes)m.l+=dt;GF.motes=GF.motes.filter(m=>m.l<m.L);
 if(GF.sweep){GF.sweep.l-=dt;if(GF.sweep.l<=0)GF.sweep=null}
 if(GF.shards){GF.shards.l-=dt;if(GF.shards.l<=0)GF.shards=null}
 for(const r of GF.rocks){r.l-=dt;r.y+=r.vy*dt;r.vy*=Math.pow(.6,dt);r.r+=r.vr*dt;r.x+=(Math.random()-.5)*30*dt}GF.rocks=GF.rocks.filter(r=>r.l>0&&!(GF.pu==null&&r.l<.0));
 if(!GF.pu)for(const r of GF.rocks){r.vy+=900*dt;if(r.y>GROUND+6)r.l=0}
 for(const a of GF.arcs)a.l-=dt;GF.arcs=GF.arcs.filter(a=>a.l>0);
 for(const q of GF.fists)q.l-=dt;GF.fists=GF.fists.filter(q=>q.l>0);
 // idle crackle grows with level (lightning from Fury 2)
 if(isGF()&&GF.lv>=2&&Math.random()<dt*(GF.lv*2.2))arc(1);
 if(isGF()&&Math.random()<dt*(3+GF.lv*2))sparks.push({x:p.x+(Math.random()-.5)*AUR[GF.lv]*1.4,y:p.y-20-Math.random()*150,vx:(Math.random()-.5)*50,vy:-60-Math.random()*90,l:.5,c:Math.random()<.6?lc(GF.lv):'#fff'})};
function crater(x){GF.craters.push({x,l:3.5,l0:3.5,w:120+GF.lv*12});try{R9.cracks.push(mkCrack(x,FF))}catch(_){}for(let i=0;i<4;i++)waves.push({x,y:GROUND-4+i*3,r:10+i*35,l:.9,big:true});
 for(const d of alive())if(Math.abs(d.x-x)<280&&Math.abs(d.x-x)>4&&d.y>GROUND-120)mHit(d,'gfquake',Math.sign(d.x-x)||1);
 spark(x,GROUND-20,26,520,['#d8c49a','#fff',lc(GF.lv)]);shake=Math.max(shake,22);flashT=Math.max(flashT,.08);snd('gf_crack',1,.2);snd('gf_quake',.8,.3);say('CRATER!',lc2(GF.lv),true)}
// ---------- drawing ----------
const TINT=new Map();function tinted(f,col){const im=f&&IMG[f.f];if(!im||!im.complete||!im.naturalWidth)return null;const key=f.f+col;let c=TINT.get(key);if(c)return c;
 c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);TINT.set(key,c);return c}
function glowOver(f,x,y,face,col,al){const c=tinted(f,col);if(!c)return;ctx.save();ctx.globalAlpha=al;ctx.globalCompositeOperation='lighter';ctx.translate(x,y);ctx.scale(face*SC,SC);ctx.drawImage(c,-f.ax,-f.ay);ctx.restore()}
function auraPath(x,cy,R,ph,amp){ctx.beginPath();for(let i=0;i<=40;i++){const a=i/40*6.283,s=Math.sin(a),c=Math.cos(a);const up=s<0?-s:0;
  const r=R*(1+amp*(.55*Math.sin(ph*11+a*5)+.45*Math.sin(ph*17-a*9)));const px=x+c*r*.62,py=cy+s*r*.95-up*up*R*(.75+.35*Math.sin(ph*13+a*7));i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
function drawAura(){const L=GF.lv,x=p.x,fl=L>=5?120:100,cy=p.y-fl+8,pu=GF.pu,R=AUR[L]*(pu?1.12+.1*Math.sin(now*30):1)+(GF.fin?18:0),ph=now;
 ctx.save();ctx.globalCompositeOperation='lighter';
 const g=ctx.createRadialGradient(x,cy,10,x,cy,R*1.6);g.addColorStop(0,L>=5?'rgba(255,255,255,.1)':'rgba(255,255,255,.22)');g.addColorStop(.5,(L>=5?COL:lc(L))+(L>=5?'33':'55'));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,cy,R*1.6,0,6.283);ctx.fill();
 for(const [k,al,col] of (L>=5?[[1.18,.17,COL],[1,.13,'#fff6cf']]:[[1.18,.22,lc(L)],[1,.28,lc2(L)],[.78,.2,'#ffffff']])){auraPath(x,cy,R*k,ph+k,.12+.02*L);ctx.globalAlpha=al;ctx.fillStyle=col;ctx.fill()}
 ctx.globalAlpha=.55;ctx.strokeStyle=lc(L);ctx.lineWidth=3;auraPath(x,cy,R*1.18,ph+1.18,.12+.02*L);ctx.stroke();
 if(L>=5){ctx.globalAlpha=.5;ctx.strokeStyle='#fff6cf';ctx.lineWidth=3;ctx.setLineDash([14,10]);ctx.lineDashOffset=-now*60;ctx.beginPath();ctx.ellipse(x,GROUND+2,R*1.3,16,0,0,6.283);ctx.stroke();ctx.setLineDash([]);
  const pg=ctx.createLinearGradient(x-40,0,x+40,0);pg.addColorStop(0,'rgba(0,0,0,0)');pg.addColorStop(.5,'rgba(255,246,207,.18)');pg.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=1;ctx.fillStyle=pg;ctx.fillRect(x-40,-camY-600,80,p.y-(-camY-600))}
 ctx.restore()}
function drawArcs(){if(!GF.arcs.length)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 for(const a of GF.arcs){for(const [w,col,al] of [[5,GF.lv>=4?'#ffd0a0':SKY,.5],[2,'#fff',1]]){ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();a.pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}}ctx.restore()}
function drawWorldBack(){ctx.save();
 for(const c of GF.craters){const a=Math.min(1,c.l/1);ctx.globalAlpha=.75*a;ctx.fillStyle='#2a2018';ctx.beginPath();ctx.ellipse(c.x,GROUND+6,c.w,20,0,0,6.283);ctx.fill();ctx.globalAlpha=.6*a;ctx.strokeStyle='#b89a70';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(c.x,GROUND+2,c.w+8,22,0,Math.PI,6.283);ctx.stroke()}
 for(const r of GF.rocks){ctx.save();ctx.globalAlpha=Math.min(1,r.l*2);ctx.translate(r.x,r.y);ctx.rotate(r.r);ctx.fillStyle=r.c;ctx.beginPath();ctx.moveTo(-r.s,-r.s*.4);ctx.lineTo(-r.s*.2,-r.s);ctx.lineTo(r.s,-r.s*.3);ctx.lineTo(r.s*.6,r.s*.8);ctx.lineTo(-r.s*.7,r.s*.6);ctx.closePath();ctx.fill();ctx.restore()}
 ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
 for(const L of GF.lava){const a=Math.min(1,L.l/(L.l0*.4))*(.8+.2*Math.sin(now*20));for(const [w,col,al] of [[16,LAVA,.35],[7,'#ff7a1a',.8],[2.5,'#ffe08a',1]]){ctx.globalAlpha=a*al;ctx.strokeStyle=col;ctx.lineWidth=w;for(const s of L.segs){ctx.beginPath();s.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()}}}
 for(const e of GF.erupt){if(e.d>0)continue;const u=1-e.l/e.l0,h=380*Math.sin(Math.min(1,u*2.2)*Math.PI*.5),a=Math.min(1,e.l/.4);const g=ctx.createLinearGradient(0,GROUND-h,0,GROUND);g.addColorStop(0,'rgba(255,224,138,0)');g.addColorStop(.3,'#ffb020');g.addColorStop(1,LAVA);
  ctx.globalAlpha=.8*a;ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(e.x-34,GROUND);ctx.quadraticCurveTo(e.x-20,GROUND-h*.6,e.x-6+Math.sin(now*30)*6,GROUND-h);ctx.quadraticCurveTo(e.x+20,GROUND-h*.6,e.x+34,GROUND);ctx.fill()}
 ctx.restore()}
function freezeDim(){if(!(GF.dim>0))return;const W=cv.width,H=cv.height;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.6*GF.dim;ctx.fillStyle='#0a0820';ctx.fillRect(0,0,W,H);
 const g=ctx.createRadialGradient(W/2,H*.2,10,W/2,H*.2,W*.6);g.addColorStop(0,'rgba(255,240,180,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalCompositeOperation='lighter';ctx.globalAlpha=GF.dim;ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
const _dd=drawDummies;drawDummies=function(){_dd.apply(this,arguments);if(!isGF())return;freezeDim();drawWorldBack();
 if(!GF.ss||!GF.ss.cut||GF.ss.back)drawAura();drawArcs();
 // flight / air-attack poses (in-between frames come from the anim crossfade + afterimages)
 if(GF.atk&&FR[GF.atk.a]&&!['ufin','umeow','utail'].includes(p.state)){const a=FR[GF.atk.a],u=1-GF.atk.t/GF.atk.t0;if(p.anim!==GF.atk.a)setAnim(GF.atk.a);p.fi=Math.min(a.length-1,Math.floor(u*a.length))}
 else if(GF.fly&&!p.ground&&p.state!=='ufin'){const want=PRE+(Math.abs(p.vx)>320?'_fly':p.vy>300?'_spike':'_hover');if(p.anim!==want)setAnim(want);const a=FR[want];if(a)p.fi=Math.floor(now*7)%a.length}
 const a=FR[p.anim];if(a&&p.fi>=a.length)p.fi=a.length-1};
const _fx=drawFx;drawFx=function(){_fx();
 // dizzy stars over enemies that came back from the Sky Shatter
 for(const d of dummies)if(d.alive&&d.gfDz>0){ctx.save();for(let i=0;i<3;i++){const a=now*5+i*2.094,x=d.x+Math.cos(a)*34,y=d.y-(d.h||120)-14+Math.sin(a)*9;star(x,y,9,'#ffe14d')}ctx.restore()}
 if(!isGF())return;ctx.save();
 // golden glow over Paddy (stronger each level, flashes white while powering up)
 const f=curFr();if(f&&!(GF.ss&&GF.ss.cut&&!GF.ss.back)){const al=[0,.16,.22,.26,.12,.05][GF.lv]+(GF.pu?.18*Math.abs(Math.sin(now*14)):0);glowOver(f,p.x,p.y,p.face,GF.pu&&Math.sin(now*14)>.6?'#ffffff':lc(GF.lv),al)}
 ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 for(const q of GF.fists){const a=q.l/.14;ctx.globalAlpha=a;const g=ctx.createRadialGradient(q.x,q.y,2,q.x,q.y,26);g.addColorStop(0,'#fff');g.addColorStop(.5,lc(GF.lv));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q.x,q.y,26,0,6.283);ctx.fill();
  ctx.strokeStyle=lc2(GF.lv);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(q.x-q.f*70,q.y);ctx.lineTo(q.x-q.f*18,q.y);ctx.stroke()}
 const B=GF.beam;if(B){const oy=p.y-(GF.lv>=5?118:100),ox=p.x+p.face*60,len=1500,grow=Math.min(1,B.t/.12),fade=Math.min(1,(B.L-B.t)/.2),w=B.w*grow*(1+.12*Math.sin(now*50));
  ctx.globalAlpha=fade;const col=B.big?'#fff6cf':lc(GF.lv);for(const [k,c,al] of [[1.8,col,.3],[1,col,.85],[.45,'#ffffff',1]]){ctx.globalAlpha=fade*al;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(ox,oy-w*k*.6);ctx.lineTo(ox+p.face*len,oy-w*k);ctx.lineTo(ox+p.face*len,oy+w*k);ctx.lineTo(ox,oy+w*k*.6);ctx.fill()}
  ctx.globalAlpha=fade;const gb=ctx.createRadialGradient(ox,oy,4,ox,oy,w*2.2);gb.addColorStop(0,'#fff');gb.addColorStop(.5,col);gb.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gb;ctx.beginPath();ctx.arc(ox,oy,w*2.2,0,6.283);ctx.fill();
  for(let i=0;i<5;i++){const xx=ox+p.face*((now*2400+i*300)%len);ctx.globalAlpha=fade*.6;ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(xx,oy,10,w*1.1,0,0,6.283);ctx.stroke()}}
 const F0=GF.fin;if(F0&&F0.mode==='cannon'&&F0.t<.9){const ox=p.x+p.face*70,oy=p.y-100,r=10+F0.t*50;const g=ctx.createRadialGradient(ox,oy,2,ox,oy,r);g.addColorStop(0,'#fff');g.addColorStop(.5,COL);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(ox,oy,r,0,6.283);ctx.fill()}
 for(const h of GF.halos){ctx.globalAlpha=Math.min(1,h.l/h.l0*1.5)*.85;ctx.strokeStyle=h.r%2?'#fff6cf':COL;ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(p.x,p.y-(GF.lv>=5?190:170),h.r,h.r*.32,0,0,6.283);ctx.stroke()}
 const BH=GF.bigHalo;if(BH&&BH.l>0){const rx=420*BH.l,ry=78*BH.l;ctx.globalAlpha=BH.l;for(const [w,c] of [[22,'rgba(255,210,58,.35)'],[9,COL],[3,'#fff']]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(BH.x,BH.y,rx,ry,0,0,6.283);ctx.stroke()}
  for(let i=0;i<24;i++){const a=i/24*6.283+now*.8,x=BH.x+Math.cos(a)*rx,y=BH.y+Math.sin(a)*ry;ctx.fillStyle=i%2?'#fff':COL;ctx.beginPath();ctx.moveTo(x,y-9);ctx.lineTo(x+5,y);ctx.lineTo(x,y+9);ctx.lineTo(x-5,y);ctx.fill()}
  for(let i=0;i<16;i++){const a=i/16*6.283+now*.3;ctx.globalAlpha=BH.l*.25;ctx.strokeStyle='#fff6cf';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(BH.x,BH.y);ctx.lineTo(BH.x+Math.cos(a)*900,BH.y+Math.sin(a)*500);ctx.stroke()}}
 for(const m of GF.motes){const u=m.l/m.L,e=u*u;ctx.globalAlpha=1-u*.5;ctx.fillStyle='#fff6cf';ctx.beginPath();ctx.arc(m.x+(m.tx-m.x)*e,m.y+(m.ty-m.y)*e,3,0,6.283);ctx.fill()}
 for(const P0 of GF.pill){if(P0.t<0)continue;const top=-camY-700,u=Math.min(1,P0.t/.12),yb=top+(GROUND-top)*u,a=Math.min(1,(P0.L-P0.t)/.4),w=P0.w*(P0.t<.12?.5:1+.08*Math.sin(now*40));
  const g=ctx.createLinearGradient(P0.x-w,0,P0.x+w,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.3,'rgba(255,210,58,.45)');g.addColorStop(.5,'#ffffff');g.addColorStop(.7,'rgba(255,210,58,.45)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=a*.75;ctx.fillStyle=g;ctx.fillRect(P0.x-w,top,w*2,yb-top);if(u>=1){ctx.globalAlpha=a*.8;ctx.strokeStyle='#fff6cf';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(P0.x,GROUND,w*1.3+(P0.t*120),14,0,0,6.283);ctx.stroke()}}
 const SH=GF.shards;if(SH){const a=SH.l/SH.l0;ctx.globalAlpha=a;ctx.strokeStyle='#fff';ctx.lineWidth=3;for(let i=0;i<14;i++){const an=i/14*6.283+SH.seed,r1=30,r2=140+((i*37+SH.seed*10)%90)*(2-a);ctx.beginPath();ctx.moveTo(SH.x+Math.cos(an)*r1,SH.y+Math.sin(an)*r1);
   ctx.lineTo(SH.x+Math.cos(an+.08)*r2*.6,SH.y+Math.sin(an+.08)*r2*.6);ctx.lineTo(SH.x+Math.cos(an)*r2,SH.y+Math.sin(an)*r2);ctx.stroke()}}
 const S=GF.ss;if(S&&S.hit&&!S.cut&&S.d){const d=S.d;ctx.globalAlpha=.9;ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(S.fx,S.fy-70);ctx.lineTo(d.x,d.y-70);ctx.stroke();if(S.t>.75){star(d.x,d.y-70,14+Math.sin(now*40)*6,'#fff')}}
 ctx.restore()};
function star(x,y,r,col){ctx.save();ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.restore()}
// ---------- screen space: light sweep, the Sky Shatter cut-scene, level HUD ----------
const _dr=draw;draw=function(){_dr.apply(this,arguments);if(!isGF())return;const W=cv.width,H=cv.height,sc=Math.min(W/1000,H/420);ctx.save();ctx.setTransform(1,0,0,1,0,0);
 const SW=GF.sweep;if(SW){const u=1-SW.l/SW.l0,cx=W/2,r=u*W*.9;ctx.globalCompositeOperation='lighter';for(const s of[-1,1]){const x=cx+s*r,g=ctx.createLinearGradient(x-s*160*sc,0,x+s*40*sc,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.8,'rgba(255,246,207,.85)');g.addColorStop(1,'rgba(0,0,0,0)');
   ctx.globalAlpha=1-u*.6;ctx.fillStyle=g;ctx.fillRect(Math.min(x-s*160*sc,x+s*40*sc),0,200*sc,H)}ctx.globalAlpha=.25*(1-u);ctx.fillStyle='#fff6cf';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}
 const S=GF.ss;if(S&&S.cut&&S.t<3.6)cutScene(S,W,H,sc);
 // level HUD: FURY n + pips (top centre)
 if(!(S&&S.cut&&!S.back)){const L=GF.lv,y=Math.round(H*.155),fs=Math.round(17*sc),hx=W*.215+60*sc;ctx.globalAlpha=.92;ctx.textAlign='center';ctx.textBaseline='top';ctx.font=`${fs}px Bangers, Impact, sans-serif`;
  const t='🌟 '+LVN[L]+(GF.fly?' · FLYING':'');ctx.lineWidth=4*sc;ctx.strokeStyle='#000';ctx.strokeText(t,hx,y);ctx.fillStyle=lc(L);ctx.fillText(t,hx,y);
  for(let i=1;i<=5;i++){const x=hx+(i-3)*16*sc,yy=y+fs+7*sc;ctx.globalAlpha=i<=L?1:.35;ctx.fillStyle=i<=L?lc(i):'#ffffff';ctx.beginPath();ctx.arc(x,yy,5*sc,0,6.283);ctx.fill()}
  if(L<5&&!GF.pu){ctx.globalAlpha=.7;ctx.font=`${Math.round(11*sc)}px system-ui, sans-serif`;ctx.fillStyle='#fff';ctx.fillText('⚡ POWER UP (G)',hx,y+fs+15*sc)}}
 if(GF.pu&&GF.pu.t>.4){ctx.globalAlpha=.6;ctx.textAlign='center';ctx.font=`${13*sc}px system-ui, sans-serif`;ctx.fillStyle='#fff';ctx.fillText('tap to skip',W/2,H-14*sc)}
 ctx.restore()};
function cutScene(S,W,H,sc){const t=S.t-1.05,d=S.d,wipeIn=Math.min(1,t/.18),wipeOut=S.t>3.3?Math.min(1,(S.t-3.3)/.25):0;
 const x0=(1-wipeIn)*W-wipeOut*W;ctx.save();ctx.beginPath();ctx.rect(x0,0,W,H);ctx.clip();
 const sh=t>.55&&t<.9?(Math.random()-.5)*14*sc*(1-(t-.55)/.35):0;ctx.translate(x0+sh,sh*.6);
 const cliff=S.scn===0,gr=ctx.createLinearGradient(0,0,0,H);if(cliff){gr.addColorStop(0,'#ffb36b');gr.addColorStop(.6,'#ff7f8e');gr.addColorStop(1,'#7a5aa8')}else{gr.addColorStop(0,'#4aa8ff');gr.addColorStop(1,'#bfe6ff')}
 ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
 // far scenery
 ctx.fillStyle=cliff?'#ffe7a8':'#fff8d0';ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(W*.2,H*.28,34*sc,0,6.283);ctx.fill();ctx.globalAlpha=1;
 ctx.fillStyle=cliff?'#8a5a7a':'#7fa6c8';ctx.beginPath();ctx.moveTo(0,H*.78);for(let i=0;i<=10;i++)ctx.lineTo(i/10*W*.7,H*(.62+.08*Math.sin(i*1.7)));ctx.lineTo(W*.7,H);ctx.lineTo(0,H);ctx.fill();
 const wx=W*.66,ix=W*.72,iy=H*.46; // the wall they hit
 if(cliff){ctx.fillStyle='#7b5a44';ctx.beginPath();ctx.moveTo(wx,H);ctx.lineTo(wx+10*sc,H*.55);ctx.lineTo(wx-8*sc,H*.25);ctx.lineTo(wx+30*sc,0);ctx.lineTo(W,0);ctx.lineTo(W,H);ctx.fill();
  ctx.strokeStyle='#5f4434';ctx.lineWidth=4*sc;for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(wx,H*i/6);ctx.lineTo(W,H*i/6+10*sc*Math.sin(i));ctx.stroke()}
  ctx.fillStyle='#3f8a3a';ctx.fillRect(wx+20*sc,0,W,8*sc)}
 else{ctx.fillStyle='#9aa7b8';ctx.fillRect(wx-40*sc,H*.08,W,H);ctx.fillStyle='#d8e6f5';for(let r=0;r<7;r++)for(let c=0;c<5;c++){const bx=wx-20*sc+c*44*sc,by=H*.14+r*40*sc;if(Math.abs(bx-ix)<50*sc&&Math.abs(by-iy)<50*sc)continue;ctx.fillRect(bx,by,24*sc,24*sc)}
  ctx.fillStyle='#6b7a8f';ctx.fillRect(wx-50*sc,H*.06,W,10*sc)}
 ctx.fillStyle=cliff?'#5a4a6a':'#5d8a4a';ctx.fillRect(0,H*.9,W,H*.1);
 // caption
 ctx.textAlign='center';ctx.textBaseline='top';ctx.font=`${Math.round(18*sc)}px Bangers, Impact, sans-serif`;ctx.lineWidth=4*sc;ctx.strokeStyle='#000';const cap=cliff?'MEANWHILE, FAR FAR AWAY…':'MEANWHILE, IN THE BIG CITY…';
 ctx.strokeText(cap,W*.33,H*.15);ctx.fillStyle='#fff';ctx.fillText(cap,W*.33,H*.15);
 // the enemy: flies in, SPLAT on the wall, dust cloud, dizzy stars, slides down a little
 const fr=d&&(FR[d.anim]||FR.r_idle),f=fr&&fr[0],im=f&&IMG[f.f];const hitT=.5;
 let ex,ey,rot,sx=1,sy=1;if(t<hitT){const u=t/hitT;ex=-60*sc+(ix+60*sc)*u;ey=H*.15+(iy-H*.15)*u-Math.sin(u*Math.PI)*60*sc;rot=u*9}else{const s2=Math.min(1,(t-hitT-.7)/1.2);ex=ix;ey=iy+Math.max(0,s2)*36*sc;rot=-.2;sx=t<hitT+.12?.7:.9;sy=t<hitT+.12?1.2:1.05}
 if(t>=hitT){// cracks in the wall + dust
  ctx.strokeStyle=cliff?'#3a2a20':'#4a5568';ctx.lineWidth=3*sc;for(let i=0;i<9;i++){const a=i/9*6.283+.3;ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(ix+Math.cos(a)*40*sc,iy+Math.sin(a)*40*sc);ctx.lineTo(ix+Math.cos(a+.2)*80*sc,iy+Math.sin(a+.2)*80*sc);ctx.stroke()}
  ctx.fillStyle='rgba(40,30,25,.35)';ctx.beginPath();ctx.ellipse(ix,iy,56*sc,64*sc,0,0,6.283);ctx.fill()}
 if(im&&im.complete){const k=(150*sc)/Math.max(1,im.naturalHeight);ctx.save();ctx.translate(ex,ey);ctx.rotate(rot);ctx.scale(k*sx*(t<hitT?1:-1),k*sy);ctx.drawImage(im,-im.naturalWidth/2,-im.naturalHeight/2);ctx.restore()}
 else{ctx.fillStyle='#444';ctx.beginPath();ctx.arc(ex,ey,30*sc,0,6.283);ctx.fill()}
 if(t<hitT){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=3*sc;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(ex-(40+i*25)*sc,ey-(20-i*12)*sc);ctx.lineTo(ex-(110+i*25)*sc,ey-(40-i*12)*sc);ctx.stroke()}}
 else{const u=Math.min(1,(t-hitT)/.9);for(let i=0;i<12;i++){const a=i/12*6.283,r=(30+u*90)*sc;ctx.globalAlpha=.75*(1-u);ctx.fillStyle=i%2?'#e8dcc8':'#c9b89c';ctx.beginPath();ctx.arc(ix+Math.cos(a)*r,iy+Math.sin(a)*r*.7,(18+u*20)*sc,0,6.283);ctx.fill()}ctx.globalAlpha=1;
  if(t<hitT+.6){const s=1+Math.sin((t-hitT)*30)*.08;ctx.save();ctx.translate(ix-110*sc,iy-70*sc);ctx.rotate(-.2);ctx.scale(s,s);star(0,0,52*sc,'#ffe14d');ctx.font=`${Math.round(30*sc)}px Bangers, Impact, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d0202a';ctx.fillText('BONK!',0,2*sc);ctx.restore()}
  for(let i=0;i<3;i++){const a=now*5+i*2.094;star(ex+Math.cos(a)*40*sc,ey-80*sc+Math.sin(a)*10*sc,10*sc,'#ffe14d')}}
 ctx.restore();
 // comic panel border
 ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=8*sc;ctx.strokeRect(x0+4*sc,4*sc,W-8*sc,H-8*sc);ctx.restore()}
// ---------- tiers rows / lists ----------
buildList();
window.GOLDENFURY25=true;
})();
