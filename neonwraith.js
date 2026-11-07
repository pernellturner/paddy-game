// ===================== v24: NEON WRAITH PADDY – Legend speed form u=17 (FORM 21) =====================
// Dark navy harness with neon cyan/magenta lines; afterimage clones trail behind him and COPY his attacks.
// Tail = NEON RIBBON TRAIL (x2) -> RIBBON WAVE · Meow = AFTERIMAGE DASH / MIRROR SWIPE / ECHO POUNCE · Blink = FLICKER STEP (teleport-dodge, 2 in the air)
// Finisher (perfect 8th hit) = PHANTOM PARADE: he splits into one neon clone per enemy, time stops mid-swipe, then every hit lands in one flash.
(function(){
if(typeof UF==='undefined'||typeof MC==='undefined')return;
const SPRITES_IN=true;if(!SPRITES_IN&&!/[?&]nwtest/.test(location.search))return;
const U=17,PRE='nwr',COL='#29f0ff',COL2='#ff3df0',NAVY='#141a3a';
if(UF.length!==U){console.warn('neonwraith: unexpected UF length',UF.length);return}
UF.push({pre:PRE,nm:'NEON WRAITH',ico:'👻',el:'neon',col:COL,col2:COL2,spd:660,H:.3,H0:.26,minT:.1,W:.14,E:.38,tier:'LEGEND FORM',legend:1,
 CH:[null,MC('h1','thrust',290,.05,'MIRROR SWIPE!'),MC('h2','thrust',280,.05,'MIRROR SWIPE II!'),MC('h3','spin',220,.06,'NEON KICK!'),MC('h4','spin',200,.06,'RIBBON SPIN!'),
  MC('h5','low',380,.06,'FLICKER SWEEP!'),MC('h6','rise',180,.07,'ECHO HEEL!'),MC('h7','big',260,.09,'ECHO POUNCE!')]});
UPRE.push(PRE);
UA(PRE,{idle:['idle',null,7,1],run:['run',null,17,1],rise:['jump',[1,2],9],apex:['jump',[3]],fall:['jump',[4]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[5]],
 h1:['combo_a',[0,1,2],18],h2:['combo_a',[3,4],16],h3:['combo_b',[0,1],16],h4:['combo_b',[2,3],16],h5:['combo_c',[1,2],14],h6:['combo_b',[4]],h7:['special',[3,4,5],13],
 launch:['combo_c',[3,4,5],13],air1:['special',[1]],air2:['jump',[3]],dive:['special',[3]],
 tail:['combo_b',[1,2,3],16],tail2:['combo_b',[2,3,4],16],meowc:['ult',[0]],meow:['combo_a',[1,2,3],16],meow2:['combo_c',[0,1,2],14],
 blink:['special',[0],14],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[2]],ultD:['special',[3]],ultE:['ult',[4]],ultF:['ult',[5]],
 dash:['special',[0,1],14],slide:['combo_c',[1,2],12],leap:['combo_c',[3,4,5],12],pounce:['special',[3]],plant:['special',[4,5],10],sprint:['ult',[1]],swipe:['ult',[4]],point:['ult',[3]],spin:['combo_b',[1,2,3,4],18]});
let filled=false;function fill(){if(filled||typeof F==='undefined'||!F||!F[PRE+'_idle'])return;for(const a in A)if(a.startsWith(PRE+'_')&&!FR[a]){const [s,idx]=A[a];const S2=F[PRE+'_'+s]||F[s];if(S2)FR[a]=idx?idx.filter(i=>i<S2.length).map(i=>S2[i]):S2}filled=true}
fill();
Object.assign(KB,{nwdash:[300,-220,.2,.05],nwecho:[140,-120,.12,.02],nwribbon:[90,-380,.25,.03],nwwave:[260,-420,.3,.05],nwswipe:[240,-300,.2,.05],nwpounce:[300,-760,.4,.1],nwflick:[160,-200,.15,.03],nwfinal:[360,-1600,.8,.2]});
Object.assign(NAMES,{nwdash:'AFTERIMAGE!',nwecho:'',nwribbon:'',nwwave:'RIBBON WAVE!',nwswipe:'MIRROR SWIPE!',nwpounce:'ECHO POUNCE!',nwflick:'',nwfinal:''});
UTN.push(['NEON RIBBON!','RIBBON TRAIL II!','RIBBON WAVE!']);
MTK[U]='nwribbon';MMK[U]='nwphantom';MMN.nwphantom=['AFTERIMAGE DASH!','MIRROR SWIPE!','ECHO POUNCE!!'];
MBN[U]='FLICKER STEP!';MLN[U]='NEON LEAP!';MDN[U]='ECHO POUNCE!';MFIN[U]='PHANTOM PARADE!!';MULT[U]=['PHANTOM…','PARADE!!'];
LKF.push(MLK(COL,COL2,'MIRROR SWIPE!','ECHO HEEL!','NEON RIBBON!','RIBBON WAVE!','AFTERIMAGE DASH!','ECHO POUNCE!','FLICKER STEP!','DOUBLE FLICKER!'));
LKT.push({C:'slash',T:'mT',M:'mM',B:'tele'});
ROUTES.push([MR('CCCM','AFTERIMAGE!','swipe, swipe, neon kick – then dash straight through them'),MR('CCCMM','MIRROR SWIPE!','afterimage dash, then your clones swipe from both sides'),
 MR('CCCTT','RIBBON WAVE!','two ribbon trails send a neon wave along the ground'),MR('TTTM','ECHO POUNCE!','ribbon trails, then leap and ECHO POUNCE with your clones'),
 MR('CCCCCT','NEON STORM!','5 timed mirror hits into a ribbon trail'),
 MR('CCCTMMB','PHANTOM PARADE','ULTIMATE: one neon clone per enemy, time stops mid-swipe… then every hit lands at once',1)]);
UNLK.push({k:'exp',n:900,txt:'Earn 900 EXP'});
FCOL.push(COL);FNAME.push('NEON WRAITH PADDY');
for(const k in TKA)TKA[k].push(PRE+'_'+({leap:'rise',bonk:'dive',drop:'dive',trip:'tail'}[k]||'rise'));
window.UFTABS.push(['👻 NEON WRAITH',COL]);
Object.assign(map,{NumpadDecimal:'uf17'});INSTANT.push('uf17');
const _ok=UNL.ok.bind(UNL);UNL.ok=function(u){if(u===U)return this.has(u)||!!this.d.tryAll||!!this.d.tryMyth;return _ok(u)};
// ---------- state ----------
const _ufm=window.UFIN_MAX;window.UFIN_MAX=q=>q.uf===U?4.2:(_ufm?_ufm(q):0);
const NW={hist:[],cl:[],rib:[],rings:[],echo:[],flick:0,pp:null,freeze:0,pounce:null,wasDive:false,lastEcho:new Map()};window.NWR=NW;
const snd=(k,v,g)=>{try{SND.play(k,{v:v||.8,gap:g||.05})}catch(_){}};
const spark=(x,y,n,v)=>{for(let i=0;i<(n||8);i++){const a=Math.random()*6.283,s=(v||260)*(.4+Math.random());sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,l:.45+Math.random()*.3,c:i%2?COL:COL2})}};
const ring=(x,y,r,l,col,vr)=>{NW.rings.push({x,y,r:r||24,vr:vr||900,l:l||.5,l0:l||.5,col:col||COL})};
const curFr=()=>{try{const a=FR[p.anim]||FR[fa('idle')];return a&&a[Math.min(a.length-1,p.fi|0)]}catch(_){return null}};
// a neon clone: a tinted copy of a pose that can swipe once at a target after a delay
function clone(x,y,f,face,col,l,o){NW.cl.push(Object.assign({x,y,f,face,col:col||COL,l:l||.5,l0:l||.5},o||{}))}
function frOf(k,i){const a=FR[uA(k)];return a?a[Math.min(a.length-1,i||0)]:curFr()}
function rushTo(dist,kb,keep){const f=p.face,x0=p.x,x1=clampX(p.x+f*dist);
 for(let k=1;k<=5;k++)clone(x0+(x1-x0)*k/6,p.y,frOf('dash',1),f,k%2?COL:COL2,.25+k*.05);
 for(const d of dummies)if(d.alive&&(d.x-x0)*f>-30&&(d.x-x1)*f<60&&Math.abs(d.y-p.y)<200)mHit(d,kb||'nwdash',f,keep);
 sLine(x0,p.y-100,x1,p.y-100,COL,.3,8);sLine(x0,p.y-70,x1,p.y-70,COL2,.3,5);p.x=x1;spark(x1,p.y-90,10,300);ring(x1,p.y-90,20,.35)}
function echoPounce(big){const x=p.x;ring(x,GROUND-10,40,.7,COL,1500);ring(x,GROUND-10,20,.55,COL2,1100);waves.push({x,y:GROUND,r:10,l:.7,big:true});
 for(let k=0;k<(big?3:2);k++)R9.rings.push({x,y:GROUND-60,r:20+k*30,vr:1300+k*200,l:.8,col:k%2?COL2:COL,w:12,f:20,face:0});
 if(big){for(const s of[-1,1])clone(x+s*170,GROUND,frOf('plant',0),-s,s>0?COL2:COL,.55)}
 for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<(big?420:300))mHit(d,'nwpounce',Math.sign(d.x-x)||p.face,NW.keep);
 spark(x,GROUND-20,22,520);shake=Math.max(shake,big?20:14);hitstop=Math.max(hitstop,.07);snd('nwr_heavy',1,.2);say('ECHO POUNCE!',COL2,true)}
function ribbon(x0,x1,l,wave){NW.rib.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),l,l0:l,tick:0,wave:!!wave,vx:wave?p.face*700:0,ph:Math.random()*6})}
function nwMove(kind,lv,keep){const f=p.face;extend();NW.keep=keep;
 if(kind==='nwribbon'){
  if(lv<2){setAnim(uA('spin'),true);uStrike('nwribbon',lv?260:220,250,true,lv?'RIBBON TRAIL II!':'NEON RIBBON!');ribbon(p.x-f*260,p.x+f*60,lv?1.6:1.2);ring(p.x,p.y-90,30,.45);spark(p.x,p.y-80,lv?14:8,320);
   snd('nwr_swing2',.8,.2);if(lv){p.vy=-520;p.ground=false}}
  else{setAnim(uA('swipe'),true);ribbon(p.x,p.x+f*120,1.6,1);snd('nwr_special',1,.2);snd('nwr_swing2',1,.2);say('RIBBON WAVE!',COL2,true)}
  return}
 // nwphantom: 0 AFTERIMAGE DASH · 1 MIRROR SWIPE · 2 NEON LEAP -> ECHO POUNCE
 if(lv===0){setAnim(uA('dash'),true);rushTo(440,'nwdash',keep);snd('nwr_swing2',1,.1);shake=Math.max(shake,6);return}
 if(lv===1){setAnim(uA('swipe'),true);const tg=front(420);snd('nwr_swing1',1,.08);setTimeout(()=>snd('nwr_swing2',.8,.08),90);
  for(const d of tg.length?tg:[{x:p.x+f*200,y:GROUND,alive:false}]){for(const s of[-1,1]){const cx=clampX(d.x+s*110);clone(cx,GROUND,frOf('swipe',0),-s,s>0?COL2:COL,.5,{swipeAt:.12,tgt:d.alive?d:null,kb:'nwswipe'})}}
  for(const d of front(300))mHit(d,'nwswipe',f,keep);sLine(p.x,p.y-110,p.x+f*280,p.y-60,COL,.3,10);return}
 setAnim(uA('leap'),true);p.vy=-1100;p.ground=false;p.vx=f*120;NW.pounce={t:0,dove:false};spark(p.x,GROUND-20,14,380);snd('nwr_special',.9,.2);say('NEON LEAP!',COL)}
const front=(r,back)=>dummies.filter(d=>d.alive&&(d.x-p.x)*p.face>-(back||40)&&Math.abs(d.x-p.x)<r);
const _mMove=mMove;mMove=function(kind,lv,keep){if(kind==='nwribbon'||kind==='nwphantom')return nwMove(kind,lv,keep);return _mMove(kind,lv,keep)};
// MIRROR: every hit he lands is copied a beat later by a neon clone (a light echo hit)
const _hd=hitDummy;hitDummy=function(d,move,dir){const r=_hd.apply(this,arguments);
 try{if(p.uf===U&&d&&d.alive!==undefined&&move!=='nwecho'&&move!=='nwfinal'&&move!=='nwribbon'&&!NW.pp){const t=performance.now(),l=NW.lastEcho.get(d)||0;
  if(t-l>220){NW.lastEcho.set(d,t);NW.echo.push({d,dir:dir||p.face,t:.13,col:NW.echo.length%2?COL2:COL})}}}catch(_){}
 return r};
// FLICKER STEP: a short teleport-dodge (twice in the air); leaves a clone that swipes once
const _blink=ufBlink;ufBlink=function(){if(p.uf===U&&!CINE.includes(p.state)&&!['lk','lkult','nmorph','respawn','ledge'].includes(p.state)){
  if(!p.ground){if(NW.flick>=2)return false;NW.flick++}
  const f=(K.left?-1:K.right?1:-p.face),x0=p.x,x1=clampX(p.x+f*230);clone(x0,p.y,curFr(),p.face,COL2,.45,{swipeAt:.05,kb:'nwflick',area:1});
  p.x=x1;p.inv=Math.max(p.inv||0,.35);if(!p.ground){p.vy=Math.min(p.vy,-120)}setAnim(uA('blink'),true);
  for(let k=0;k<6;k++)sparks.push({x:x0+(x1-x0)*k/5,y:p.y-90+(Math.random()-.5)*60,vx:0,vy:-30,l:.3,c:k%2?COL:COL2});ring(x1,p.y-90,18,.3,COL);
  snd('nwr_special',.9,.06);say(NW.flick>1?'DOUBLE FLICKER!':'FLICKER STEP!',COL);extend();return true}
 return _blink()};
const _mBig=mBig;mBig=function(u,x,big){if(u!==U)return _mBig(u,x,big);for(let k=0;k<(big?6:3);k++){const a=k/(big?6:3)*6.283;clone(x+Math.cos(a)*200,GROUND,frOf('swipe',0),Math.cos(a)>0?-1:1,k%2?COL2:COL,.6)}
 ring(x,GROUND-120,30,.8,COL2,1600);flashT=Math.max(flashT,big?.2:.08);if(big)for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<520)mHit(d,'nwfinal',Math.sign(d.x-x)||p.face)};
// ---------- PHANTOM PARADE (the perfect-8th-hit finisher) ----------
const _fin=ufFinal;ufFinal=function(){if(p.uf!==U)return _fin.apply(this,arguments);C.atk++;popNum(8,COL);act('ufin',uA('ultA'),{say:'PHANTOM…',c:COL2});p.inv=6;p.vx=0;p.vy=0;
 const foes=dummies.filter(d=>d.alive).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x)).slice(0,8);
 NW.pp={t:0,foes,clones:[],sil:false,snap:false,x0:p.x};p.fz={st:0,k:0,n:0};window.ZOOMOUT=Math.max(window.ZOOMOUT||0,3.8);snd('nwr_special',1,.3)};
function master(v,tc){try{const o=SND.out&&SND.out(),c=SND.ac&&SND.ac();if(o&&c){if(v===0)NW.g0=o.gain.value;o.gain.cancelScheduledValues(c.currentTime);o.gain.setTargetAtTime(v===0?0:(NW.g0||1),c.currentTime,tc||.02)}}catch(_){}}
const _fst=ufFinalState;ufFinalState=function(dt,t,at){if(p.uf!==U||!NW.pp)return _fst(dt,t,at);const S=NW.pp;S.t=t;window.ZOOMOUT=Math.max(window.ZOOMOUT||0,.4);
 if(t<.35){p.y=GROUND;p.ground=true;setAnim(uA('ultA'));if(t%.04<dt){const a=Math.random()*6.283;sparks.push({x:p.x+Math.cos(a)*120,y:p.y-90+Math.sin(a)*120,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.35,c:Math.random()<.5?COL:COL2})}}
 else if(t<1.25){// SPLIT: one neon clone streaks to each enemy
  if(!S.split){S.split=true;setAnim(uA('point'),true);const n=Math.max(1,S.foes.length);say(n>1?n+' CLONES!':'PHANTOM!',COL2,true);snd('nwr_swing2',1,.1);
   S.foes.forEach((d,i)=>{const side=(d.x>=p.x?-1:1);S.clones.push({d,x:p.x,y:p.y,tx:clampX(d.x+side*95),face:-side,col:i%2?COL2:COL,delay:i*.07})});if(!S.foes.length)S.clones.push({d:null,x:p.x,y:p.y,tx:clampX(p.x+p.face*260),face:p.face,col:COL2,delay:0})}
  for(const c of S.clones){const u=Math.min(1,Math.max(0,(t-.4-c.delay)/.45));c.x=S.x0+(c.tx-S.x0)*(u*u*(3-2*u));if(u>0&&u<1&&Math.random()<.5)clone(c.x,GROUND,frOf('sprint',0),c.face,c.col,.18)}
  if(at(.75))snd('nwr_swing2',.9,.1);for(const d of S.foes)if(d.alive){d.vx*=.7}}
 else if(t<2.45){// time stops mid-swipe
  if(!S.sil){S.sil=true;master(0,.03);NW.freeze=1;say('',COL2)}NW.freeze=Math.min(1,(t-1.25)/.12);setAnim(uA('swipe'));
  for(const d of dummies)if(d.alive){d.vx=0;d.vy=0;d.cool=Math.max(d.cool||0,.3)}}
 else{if(!S.snap){S.snap=true;NW.freeze=0;master(1,.01);setAnim(uA('swipe'),true);snd('nwr_finisher',1,.5);snd('nwr_hit',1,.1);try{SND.announce&&SND.announce(true)}catch(_){}
   flashT=Math.max(flashT,.3);shake=Math.max(shake,30);hitstop=Math.max(hitstop,.14);
   for(const c of S.clones){const d=c.d;sLine(c.tx-c.face*60,GROUND-200,c.tx+c.face*160,GROUND-40,c.col,.45,14);ring(c.tx+c.face*80,GROUND-110,30,.6,c.col,1300);if(d&&d.alive){d.hp=Math.max(1,d.hp);mHit(d,'nwfinal',c.face)}}
   for(const d of dummies)if(d.alive&&!S.foes.includes(d)){d.hp=Math.max(1,d.hp);mHit(d,'nwfinal',Math.sign(d.x-p.x)||p.face)}
   card('PHANTOM PARADE!!','PERFECT 8TH HIT',COL2);spark(p.x,GROUND-160,30,700)}
  if(t>2.9){setAnim(uA('ultF'));S.clones.length=0}if(t>3.6){NW.pp=null;ufFinEnd()}}};
// ---------- per-frame ----------
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);if(p.ground)NW.flick=0;
 if(p.uf===U&&!NW.freeze){const f=curFr();NW.hist.push({x:p.x,y:p.y,f,face:p.face});if(NW.hist.length>14)NW.hist.shift()}else if(p.uf!==U)NW.hist.length=0;
 const P0=NW.pounce;if(P0&&p.uf===U){P0.t+=dt;if(!P0.dove&&(P0.t>.4||p.vy>0)){P0.dove=true;p.vy=2300;p.vx=p.face*160;setAnim(uA('pounce'),true);snd('nwr_swing1',1,.1)}
  if(P0.dove&&Math.random()<.7)clone(p.x,p.y,curFr(),p.face,Math.random()<.5?COL:COL2,.25);if(P0.dove&&p.ground){NW.pounce=null;setAnim(uA('plant'),true);echoPounce(1)}if(P0.t>2.5)NW.pounce=null}
 const dv=p.uf===U&&p.state==='udive';if(NW.wasDive&&!dv&&p.uf===U&&p.ground&&!NW.pounce)echoPounce(0);NW.wasDive=dv;
 if(!NW.freeze){
  for(const e of NW.echo){e.t-=dt;if(e.t<=0&&!e.done){e.done=true;const d=e.d;if(d&&d.alive){const cx=d.x-e.dir*110;clone(cx,GROUND,frOf('swipe',0),e.dir,e.col,.3);sLine(cx,GROUND-170,d.x+e.dir*20,GROUND-80,e.col,.2,6);hitDummy(d,'nwecho',e.dir);snd('nwr_hit',.45,.12)}}}
  NW.echo=NW.echo.filter(e=>!e.done);
  for(const c of NW.cl){c.l-=dt;if(c.swipeAt!=null){c.swipeAt-=dt;if(c.swipeAt<=0){c.swipeAt=null;const tg=c.area?dummies.filter(d=>d.alive&&Math.abs(d.x-c.x)<200):(c.tgt&&c.tgt.alive?[c.tgt]:[]);
   for(const d of tg)mHit(d,c.kb||'nwswipe',Math.sign(d.x-c.x)||c.face);sLine(c.x,GROUND-170,c.x+c.face*170,GROUND-70,c.col,.22,8)}}}
  NW.cl=NW.cl.filter(c=>c.l>0);
  for(const r of NW.rib){r.l-=dt;r.ph+=dt*8;if(r.wave){r.x0+=r.vx*dt;r.x1+=r.vx*dt}r.tick-=dt;if(r.tick<=0){r.tick=.3;for(const d of dummies)if(d.alive&&d.x>r.x0-20&&d.x<r.x1+20&&d.y>GROUND-200)mHit(d,r.wave?'nwwave':'nwribbon',r.vx?Math.sign(r.vx):Math.sign(d.x-p.x)||p.face,NW.keep)}}
  NW.rib=NW.rib.filter(r=>r.l>0);
  for(const r of NW.rings){r.l-=dt;r.r+=r.vr*dt*(r.l/r.l0)}NW.rings=NW.rings.filter(r=>r.l>0)}
 if(NW.pp&&p.state!=='ufin'){NW.pp=null;if(NW.freeze)master(1,.01)}if(!NW.pp)NW.freeze=0;
 if(p.uf===U&&Math.random()<dt*5)sparks.push({x:p.x+(Math.random()-.5)*80,y:p.y-30-Math.random()*130,vx:(Math.random()-.5)*80,vy:-30-Math.random()*50,l:.5,c:Math.random()<.5?COL:COL2})};
// ---------- drawing ----------
const TINT=new Map();function tinted(f,col){const im=f&&IMG[f.f];if(!im||!im.complete||!im.naturalWidth)return null;const key=f.f+col;let c=TINT.get(key);if(c)return c;
 c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=.62;g.fillStyle=col;g.fillRect(0,0,c.width,c.height);TINT.set(key,c);return c}
function drawClone(f,x,y,face,col,al){const c=tinted(f,col);if(!c)return;ctx.save();ctx.globalAlpha=al;ctx.globalCompositeOperation='lighter';ctx.translate(x,y);ctx.scale(face*SC,SC);ctx.drawImage(c,-f.ax,-f.ay);ctx.restore()}
const _dd=drawDummies;drawDummies=function(){_dd.apply(this,arguments);freezeFX();if(p.uf!==U&&!NW.cl.length)return;
 // trailing afterimages (they copy his pose a few frames late)
 const fast=Math.abs(p.vx)>320||(p.state&&p.state!=='normal')||NW.pounce;
 if(p.uf===U&&fast&&!NW.pp&&NW.hist.length>9){const a=NW.hist[NW.hist.length-5],b=NW.hist[NW.hist.length-10];if(a&&a.f)drawClone(a.f,a.x,a.y,a.face,COL,.42);if(b&&b.f)drawClone(b.f,b.x,b.y,b.face,COL2,.3)}
 for(const c of NW.cl)drawClone(c.f,c.x,c.y,c.face,c.col,Math.min(.75,c.l/c.l0*.9));
 const S=NW.pp;if(S&&S.split&&!S.snap||S&&S.snap&&S.t<2.9){for(const c of S.clones){const f=frOf(S.t<1.15?'sprint':'swipe',0);drawClone(f,c.x,GROUND,c.face,c.col,.85)}}};
const _fx=drawFx;drawFx=function(){_fx();ctx.save();ctx.lineCap='round';ctx.globalCompositeOperation='lighter';
 for(const r of NW.rib){const al=Math.min(1,r.l/(r.l0*.3)),w=r.x1-r.x0;for(let k=0;k<2;k++){ctx.globalAlpha=al*(.75-k*.25);ctx.strokeStyle=k?COL2:COL;ctx.lineWidth=k?5:9;ctx.beginPath();
  for(let i=0;i<=24;i++){const x=r.x0+w*i/24,y=GROUND-30-k*16-Math.sin(r.ph+i*.6+k*1.7)*14*(r.wave?2.2:1);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}}
 for(const r of NW.rings){const al=Math.min(1,r.l/r.l0*1.6);ctx.globalAlpha=al*.8;ctx.strokeStyle=r.col;ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*.45,0,0,6.283);ctx.stroke()}
 const S=NW.pp;if(S&&S.split&&S.t<2.45&&S.t>1.1){// frozen half-drawn neon slashes on every target
  const u=Math.min(1,(S.t-1.1)/.15);for(const c of S.clones){ctx.globalAlpha=.85*u;ctx.strokeStyle=c.col;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(c.tx-c.face*40,GROUND-200);ctx.lineTo(c.tx+c.face*50,GROUND-140);ctx.stroke()}}
 ctx.restore()};
function freezeFX(){if(!(NW.freeze>0))return;const W=cv.width,H=cv.height;ctx.save();ctx.setTransform(1,0,0,1,0,0);
  ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.85*NW.freeze;ctx.fillStyle='#808080';ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.3*NW.freeze;ctx.fillStyle=NAVY;ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=.22*NW.freeze;ctx.strokeStyle=COL2;ctx.lineWidth=2;for(let k=0;k<6;k++){const y=(H*(k+.5)/6+performance.now()*.02)%H;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}ctx.restore()}
buildList();
window.NEONWRAITH24=true;
})();
