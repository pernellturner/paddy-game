// ===================== v23: SKYBREAKER PADDY – Legend form u=16 (FORM 20) =====================
// The fastest Paddy: silver-teal wind armour, teal visor, wind-vortex rings and leaves. A faster run and two AIR DASHES per jump.
// Tail = CYCLONE SPIN (x2) -> TORNADO · Meow = GALE RUSH / SLIPSTREAM SLIDE / UPDRAFT LEAP + BOOM POUNCE · Blink = GALE STEP (air: AIR DASH)
// Finisher (perfect 8th hit) = SOUND BARRIER BREAK: mach-speed laps of the arena, a giant tornado, total silence and freeze… then a sonic-boom ring.
// Runs on the shared Mythic move engine but is a LEGEND tier form (picker, tiers panel, transformation).
(function(){
if(typeof UF==='undefined'||typeof MC==='undefined')return;
// his sprite sheets are cut by src/cut_skb.py; until they are in, the form stays hidden (?skbtest previews the moves with stand-in sprites)
const SPRITES_IN=false;if(!SPRITES_IN&&!/[?&]skbtest/.test(location.search))return;
const U=16,PRE='skb',COL='#2fe0d0',COL2='#eafffb',LEAF=['#7bd66b','#a9e86b','#4fbf6a'];
if(UF.length!==U){console.warn('skybreaker: unexpected UF length',UF.length);}
UF.push({pre:PRE,nm:'SKYBREAKER',ico:'🌪️',el:'wind',col:COL,col2:COL2,spd:640,H:.3,H0:.26,minT:.1,W:.14,E:.38,tier:'LEGEND FORM',legend:1,
 CH:[null,MC('h1','thrust',300,.05,'GALE JAB!'),MC('h2','thrust',280,.05,'GALE RUSH!'),MC('h3','spin',220,.06,'CYCLONE KICK!'),MC('h4','spin',200,.06,'CYCLONE SPIN!'),
  MC('h5','low',380,.06,'SLIPSTREAM SLIDE!'),MC('h6','rise',180,.07,'UPDRAFT HEEL!'),MC('h7','big',260,.09,'BOOM POUNCE!')]});
UPRE.push(PRE);
UA(PRE,{idle:['idle',null,7,1],run:['run',null,17,1],rise:['jump',[1,2],9],apex:['jump',[3]],fall:['jump',[4]],land:['jump',[5]],hurt:['jump',[0]],victory:['ult',[5]],
 h1:['combo_a',[0,2],18],h2:['combo_a',[3,4],16],h3:['combo_b',[0,1],16],h4:['combo_b',[2,3],16],h5:['combo_c',[1,2],14],h6:['combo_b',[4]],h7:['special',[3,4,5],13],
 launch:['combo_c',[3,4,5],13],air1:['special',[1]],air2:['jump',[3]],dive:['special',[3]],
 tail:['combo_b',[1,2,3],16],tail2:['combo_b',[2,3,4],16],meowc:['ult',[0]],meow:['combo_a',[2,3,4],16],meow2:['combo_c',[0,1,2],14],
 blink:['special',[0],14],ultA:['ult',[0]],ultB:['ult',[1]],ultC:['ult',[2]],ultD:['special',[3]],ultE:['ult',[4]],ultF:['ult',[5]],
 dash:['special',[0,1],14],slide:['combo_c',[1,2],12],updraft:['combo_c',[3,4,5],12],pounce:['special',[3]],plant:['special',[4,5],10],mach:['ult',[1]],clap:['ult',[4]],point:['ult',[3]],spin:['combo_b',[1,2,3,4],18]});
let filled=false;function fill(){if(filled||typeof F==='undefined'||!F||!F[PRE+'_idle'])return;for(const a in A)if(a.startsWith(PRE+'_')&&!FR[a]){const [s,idx]=A[a];const S2=F[PRE+'_'+s]||F[s];if(S2)FR[a]=idx?idx.filter(i=>i<S2.length).map(i=>S2[i]):S2}filled=true}
fill();
Object.assign(KB,{skdash:[320,-240,.2,.05],skslide:[160,-860,.45,.06],skpounce:[300,-780,.4,.1],skgust:[200,-320,.25,.04],skrush:[420,-200,.15,.05],sbfinal:[380,-1700,.8,.2],sbpull:[0,-120,.6,.01]});
Object.assign(NAMES,{skdash:'AIR DASH!',skslide:'SLIPSTREAM!',skpounce:'BOOM POUNCE!',skgust:'WHOOSH!',skrush:'GALE RUSH!',sbfinal:'',sbpull:''});
UTN.push(['CYCLONE SPIN!','CYCLONE SPIN II!','TORNADO!']);
MTK[U]='skgust';MMK[U]='sksonic';MMN.sksonic=['GALE RUSH!','SLIPSTREAM SLIDE!','BOOM POUNCE!!'];
MBN[U]='GALE STEP!';MLN[U]='UPDRAFT LEAP!';MDN[U]='BOOM POUNCE!';MFIN[U]='SOUND BARRIER BREAK!!';MULT[U]=['SOUND BARRIER…','BREAK!!'];
LKF.push(MLK(COL,COL2,'GALE JAB!','UPDRAFT HEEL!','CYCLONE SPIN!','TORNADO!','GALE RUSH!','BOOM POUNCE!','GALE STEP!','DOUBLE DASH!'));
LKT.push({C:'slash',T:'mT',M:'mM',B:'tele'});
ROUTES.push([MR('CCCM','GALE RUSH!','jab, jab, cyclone kick – then rush straight through them'),MR('CCCMM','SLIPSTREAM!','gale rush, then slide under and launch them'),
 MR('CCCTT','TORNADO!','two cyclone spins whip up a travelling tornado'),MR('TTTM','UPDRAFT POUNCE!','cyclone spins, then leap on an updraft and BOOM POUNCE'),
 MR('CCCCCT','HURRICANE!','5 timed gale hits into a cyclone spin'),
 MR('CCCTMMB','SOUND BARRIER BREAK','ULTIMATE: mach-speed laps, a giant tornado, total silence… then a sonic-boom ring',1)]);
UNLK.push({k:'exp',n:800,txt:'Earn 800 EXP'});
FCOL.push(COL);FNAME.push('SKYBREAKER PADDY');
for(const k in TKA)TKA[k].push(PRE+'_'+({leap:'rise',bonk:'dive',drop:'dive',trip:'tail'}[k]||'rise'));
window.UFTABS.push(['🌪️ SKYBREAKER',COL]);
Object.assign(map,{Numpad0:'uf16'});INSTANT.push('uf16');
// a Legend: unlocked by the Legend try-all switch (Training Room turns it on), not the Mythic one
const _ok=UNL.ok.bind(UNL);UNL.ok=function(u){if(u===U)return this.has(u)||!!this.d.tryAll||!!this.d.tryMyth;return _ok(u)};
// ---------- state ----------
window.UFIN_MAX=q=>q.uf===U?4.2:0;
const SK={rings:[],torn:[],adash:0,dashT:0,pounce:null,wasDive:false,sb:null,freeze:0};window.SKY=SK;
const snd=(k,v,g)=>{try{SND.play(k,{v:v||.8,gap:g||.05})}catch(_){}};
const leaves=(x,y,n,v)=>{for(let i=0;i<(n||8);i++){const a=Math.random()*6.283,s=(v||260)*(.4+Math.random());sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,l:.6+Math.random()*.4,c:LEAF[i%3]})}};
const ring=(x,y,r,l,big)=>{SK.rings.push({x,y,r:r||30,vr:big?1500:900,l:l||.6,l0:l||.6,big:!!big})};
const front=(r,back)=>dummies.filter(d=>d.alive&&(d.x-p.x)*p.face>-(back||40)&&Math.abs(d.x-p.x)<r);
function rushTo(dist,kb,keep){const f=p.face,x0=p.x,x1=clampX(p.x+f*dist);for(let k=1;k<=5;k++)uGhost('dash',.3-k*.04,x0+(x1-x0)*k/6,p.y);
 for(const d of dummies)if(d.alive&&(d.x-x0)*f>-30&&(d.x-x1)*f<60&&Math.abs(d.y-p.y)<200)mHit(d,kb||'skrush',f,keep);
 sLine(x0,p.y-90,x1,p.y-90,COL,.3,10);sLine(x0,p.y-60,x1,p.y-60,COL2,.25,5);p.x=x1;leaves(x1,p.y-80,10,300);ring(x1,p.y-90,20,.35)}
function pounceBoom(big){const x=p.x;ring(x,GROUND-10,40,.7,true);ring(x,GROUND-10,20,.5,false);waves.push({x,y:GROUND,r:10,l:.7,big:true});
 for(let k=0;k<(big?3:2);k++)R9.rings.push({x,y:GROUND-60,r:20+k*30,vr:1300+k*200,l:.8,col:k%2?COL2:COL,w:12,f:20,face:0});
 for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<(big?420:300))mHit(d,'skpounce',Math.sign(d.x-x)||p.face,SK.keep);
 leaves(x,GROUND-20,22,520);shake=Math.max(shake,big?20:14);hitstop=Math.max(hitstop,.07);snd('sky_heavy',1,.2);say('BOOM POUNCE!',COL,true)}
function skMove(kind,lv,keep){const f=p.face,X=UF[U];extend();SK.keep=keep;
 if(kind==='skgust'){
  if(lv<2){setAnim(uA('spin'),true);uStrike('skgust',lv?260:220,250,true,lv?'CYCLONE SPIN II!':'CYCLONE SPIN!');ring(p.x,p.y-90,30,.45);ring(p.x,p.y-40,24,.4);leaves(p.x,p.y-80,lv?16:10,340);
   snd('sky_special',.75,.25);if(lv){p.vy=-560;p.ground=false}}
  else{mP({k:'mtor',vx:f*520,y:GROUND,l:1.8,s:1.7,kb:'skgust',keep,col:COL,col2:COL2,tick:0});leaves(p.x+f*80,GROUND-60,20,360);snd('sky_special',1,.3)}
  return}
 // sksonic: 0 GALE RUSH · 1 SLIPSTREAM SLIDE · 2 UPDRAFT LEAP -> BOOM POUNCE
 if(lv===0){setAnim(uA('meow'),true);rushTo(420,'skrush',keep);snd('sky_swing2',1,.1);shake=Math.max(shake,6);return}
 if(lv===1){setAnim(uA('slide'),true);p.vx=f*1250;SK.slideT=.32;for(const d of front(300))mHit(d,'skslide',f,keep);sLine(p.x,GROUND-20,p.x+f*320,GROUND-20,COL,.35,12);leaves(p.x,GROUND-10,14,300);snd('sky_swing1',1,.1);return}
 setAnim(uA('updraft'),true);p.vy=-1150;p.ground=false;p.vx=f*120;SK.pounce={t:0,dove:false};SK.col={x:p.x,l:.6};leaves(p.x,GROUND-20,18,400);snd('sky_special',.9,.2);say('UPDRAFT LEAP!',COL)}
const _mMove=mMove;mMove=function(kind,lv,keep){if(kind==='skgust'||kind==='sksonic')return skMove(kind,lv,keep);return _mMove(kind,lv,keep)};
// AIR DASH: Blink in the air (twice per jump). On the ground it is the usual Gale Step.
const _blink=ufBlink;ufBlink=function(){if(p.uf===U&&!p.ground&&!CINE.includes(p.state)&&!['lk','lkult','nmorph','respawn','ledge'].includes(p.state)){
  if(SK.adash>=2)return false;SK.adash++;const f=(K.left?-1:K.right?1:p.face);p.face=f;p.vx=f*1500;p.vy=-40;SK.dashT=.2;setAnim(uA('dash'),true);
  for(const d of dummies)if(d.alive&&(d.x-p.x)*f>-20&&Math.abs(d.x-p.x)<260&&Math.abs(d.y-p.y)<200)mHit(d,'skdash',f);
  ring(p.x,p.y-90,18,.35);sLine(p.x-f*160,p.y-90,p.x,p.y-90,COL2,.25,6);snd('sky_swing2',.9,.06);say(SK.adash>1?'DOUBLE DASH!':'AIR DASH!',COL);return true}
 return _blink()};
// a bigger effect for the ultimate (and the route finale) – a giant tornado and a sonic ring
const _mBig=mBig;mBig=function(u,x,big){if(u!==U)return _mBig(u,x,big);SK.torn.push({x,l:big?1.8:1,l0:big?1.8:1,s:big?1.4:.8,a:0});if(big){sonicRing(x,1);for(const d of dummies)if(d.alive&&Math.abs(d.x-x)<520)mHit(d,'sbfinal',Math.sign(d.x-x)||p.face)}};
function sonicRing(x,big){for(let k=0;k<(big?5:2);k++)R9.rings.push({x,y:GROUND-150,r:20+k*24,vr:(big?1900:1100)+k*240,l:1,col:k%2?COL2:'#ffffff',w:big?20:12,f:20,face:0});
 waves.push({x,y:GROUND,r:10,l:.8,big:true});flashT=Math.max(flashT,big?.25:.1);shake=Math.max(shake,big?34:14)}
// ---------- SOUND BARRIER BREAK (the perfect-8th-hit finisher) ----------
const _fin=ufFinal;ufFinal=function(){if(p.uf!==U)return _fin.apply(this,arguments);C.atk++;popNum(8,COL);act('ufin',uA('ultA'),{say:'SOUND BARRIER…',c:COL2});p.inv=6;p.grab=uNear(600);p.vx=0;p.vy=0;
 const cx=clampX(p.grab?p.grab.x:p.x+p.face*260);SK.sb={t:0,cx,a:Math.PI,x0:p.x,boom:false,sil:false};p.fz={st:0,k:0,n:0};window.ZOOMOUT=Math.max(window.ZOOMOUT||0,3.8);snd('sky_special',1,.3)};
const _fst=ufFinalState;ufFinalState=function(dt,t,at){if(p.uf!==U||!SK.sb)return _fst(dt,t,at);const S=SK.sb,cx=S.cx,R=330;S.t=t;window.ZOOMOUT=Math.max(window.ZOOMOUT||0,.4);
 for(const d of dummies)if(d.alive&&!S.boom){d.vx*=.8}
 if(t<.35){p.y=GROUND;p.ground=true;setAnim(uA('ultA'));if(t%.04<dt){const a=Math.random()*6.283;sparks.push({x:p.x+Math.cos(a)*120,y:p.y-90+Math.sin(a)*120,vx:-Math.cos(a)*300,vy:-Math.sin(a)*300,l:.35,c:Math.random()<.5?COL:COL2})}}
 else if(t<1.65){// mach-speed laps around the arena (ellipse round the target), leaving a vapour ring
  const u=(t-.35)/1.3;S.a=Math.PI+u*6.283*2.25;const nx=cx+Math.cos(S.a)*R,ny=GROUND-Math.max(0,Math.sin(S.a))*70;p.face=-Math.sin(S.a)>=0?1:-1;
  p.x=nx;p.y=ny;p.ground=ny>=GROUND-1;setAnim(uA('mach'));uGhost('mach',.28);if(t%.05<dt)leaves(p.x,p.y-60,3,200);
  if(at(.4))say('MACH 1!',COL2,true);if(at(.9))say('MACH 3!',COL2,true);if(at(1.35))say('MACH 5!!',COL2,true);
  if(t>.8&&!S.torn){S.torn=1;SK.torn.push({x:cx,l:2.6,l0:2.6,s:.3,a:0,grow:1,big:1})}
  for(const d of dummies)if(d.alive){d.vx+=(cx-d.x)*dt*3}}
 else if(t<2.35){// the giant tornado lifts them
  if(at(1.66)){p.x=clampX(cx-p.face*250);p.y=GROUND;p.ground=true;p.face=Math.sign(cx-p.x)||1;}setAnim(uA('ultC'));
  for(const d of dummies)if(d.alive){d.x+=(cx-d.x)*Math.min(1,dt*3);d.vx=0;if(d.y>GROUND-260)d.vy=-260;d.fl=.5}}
 else if(t<2.95){// …silence. Everything freezes.
  if(!S.sil){S.sil=true;SK.freeze=1;try{const o=SND.out&&SND.out(),c=SND.ac&&SND.ac();if(o&&c){S.g0=o.gain.value;o.gain.cancelScheduledValues(c.currentTime);o.gain.setTargetAtTime(0,c.currentTime,.03)}}catch(_){}say('',COL2)}
  setAnim(uA('point'));for(const d of dummies)if(d.alive){d.vx=0;d.vy=0}SK.freeze=Math.min(1,(t-2.35)/.15)}
 else{if(!S.boom){S.boom=true;SK.freeze=0;try{const o=SND.out&&SND.out(),c=SND.ac&&SND.ac();if(o&&c){o.gain.cancelScheduledValues(c.currentTime);o.gain.setTargetAtTime(S.g0||1,c.currentTime,.01)}}catch(_){}
   setAnim(uA('clap'),true);snd('sky_finisher',1,.5);try{SND.announce&&SND.announce(true)}catch(_){}sonicRing(cx,1);hitstop=Math.max(hitstop,.14);
   for(const d of dummies)if(d.alive){d.hp=Math.max(1,d.hp);mHit(d,'sbfinal',Math.sign(d.x-p.x)||p.face)}for(const T of SK.torn)T.l=Math.min(T.l,.35);card('SOUND BARRIER BREAK!!','PERFECT 8TH HIT',COL);leaves(cx,GROUND-200,40,700)}
  if(t>3.05)setAnim(uA('ultF'));if(t>3.6){SK.sb=null;ufFinEnd()}}};
// ---------- per-frame ----------
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);if(p.ground){SK.adash=0}
 if(SK.dashT>0){SK.dashT-=dt;if(p.uf===U){p.vy=Math.min(p.vy,-20);if(Math.random()<.6)uGhost('dash',.25)}}
 if(SK.slideT>0){SK.slideT-=dt;if(p.uf===U&&Math.random()<.5)uGhost('slide',.22)}
 const P0=SK.pounce;if(P0&&p.uf===U){P0.t+=dt;if(!P0.dove&&(P0.t>.42||p.vy>0)){P0.dove=true;p.vy=2300;p.vx=p.face*160;setAnim(uA('pounce'),true);snd('sky_swing1',1,.1)}
  if(P0.dove&&Math.random()<.7)uGhost('pounce',.3);if(P0.dove&&p.ground){SK.pounce=null;setAnim(uA('plant'),true);pounceBoom(1)}if(P0.t>2.5)SK.pounce=null}
 const dv=p.uf===U&&p.state==='udive';if(SK.wasDive&&!dv&&p.uf===U&&p.ground&&!SK.pounce)pounceBoom(0);SK.wasDive=dv;
 if(SK.col){SK.col.l-=dt;if(SK.col.l<=0)SK.col=null}
 for(const r of SK.rings){r.l-=dt;r.r+=r.vr*dt*(r.l/r.l0)}SK.rings=SK.rings.filter(r=>r.l>0);
 for(const T of SK.torn){T.l-=dt;if(!SK.freeze)T.a+=dt*14;if(T.grow)T.s=Math.min(1.9,T.s+dt*1.2);if(Math.random()<.5)sparks.push({x:T.x+(Math.random()-.5)*160*T.s,y:GROUND-Math.random()*420*T.s,vx:(Math.random()-.5)*400,vy:-200-Math.random()*300,l:.5,c:Math.random()<.4?LEAF[0]:(Math.random()<.5?COL:'#fff')})}
 SK.torn=SK.torn.filter(T=>T.l>0);if(SK.sb&&p.state!=='ufin'){const S=SK.sb;SK.sb=null;try{const o=SND.out&&SND.out(),c=SND.ac&&SND.ac();if(o&&c&&S.sil&&!S.boom){o.gain.cancelScheduledValues(c.currentTime);o.gain.setTargetAtTime(S.g0||1,c.currentTime,.01)}}catch(_){}}if(!SK.sb)SK.freeze=0;
 // a light swirl of wind and leaves round Skybreaker
 if(p.uf===U&&Math.random()<dt*6)sparks.push({x:p.x+(Math.random()-.5)*90,y:p.y-20-Math.random()*140,vx:(Math.random()-.5)*120,vy:-40-Math.random()*60,l:.6,c:Math.random()<.5?LEAF[1]:COL2})};
// ---------- drawing ----------
function tornado(T){const s=T.s,H=460*s,a=T.a,al=Math.min(1,T.l/(T.l0*.25),T.l0-T.l<.3?(T.l0-T.l)/.3:1);ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<14;i++){const k=i/13,y=GROUND-k*H,w=(30+k*k*230)*s,ph=a+i*.7;ctx.globalAlpha=al*(.18+.25*(1-k));ctx.strokeStyle=i%3?COL:COL2;ctx.lineWidth=(10-k*5)*s+2;ctx.beginPath();ctx.ellipse(T.x+Math.sin(ph*.5)*18*s,y,w,w*.22,0,ph%6.283,ph%6.283+4.4);ctx.stroke()}
 ctx.restore()}
const _fx=drawFx;drawFx=function(){_fx();ctx.save();ctx.lineCap='round';
 for(const T of SK.torn)tornado(T);
 ctx.globalCompositeOperation='lighter';
 for(const r of SK.rings){const al=Math.min(1,r.l/r.l0*1.6);ctx.globalAlpha=al*.8;ctx.strokeStyle=r.big?COL2:COL;ctx.lineWidth=r.big?10:6;ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*(r.big?.28:.5),0,0,6.283);ctx.stroke();
  ctx.globalAlpha=al*.4;ctx.strokeStyle=COL;ctx.lineWidth=r.big?22:12;ctx.stroke()}
 if(SK.col){const c=SK.col,al=c.l/.6;const g=ctx.createLinearGradient(c.x-60,0,c.x+60,0);g.addColorStop(0,'rgba(47,224,208,0)');g.addColorStop(.5,`rgba(234,255,251,${.5*al})`);g.addColorStop(1,'rgba(47,224,208,0)');ctx.fillStyle=g;ctx.fillRect(c.x-60,GROUND-520,120,520)}
 const S=SK.sb;if(S&&S.t>.35&&S.t<1.75){const al=Math.min(1,(S.t-.35)*3)*(S.t>1.55?(1.75-S.t)/.2:1);for(let k=0;k<3;k++){ctx.globalAlpha=al*(.5-k*.12);ctx.strokeStyle=k%2?COL:COL2;ctx.lineWidth=14-k*4;ctx.beginPath();ctx.ellipse(S.cx,GROUND-40,330+k*8,60+k*6,0,0,6.283);ctx.stroke()}}
 ctx.restore()};
const _dr=draw;draw=function(){_dr.apply(this,arguments);if(SK.freeze>0){const W=cv.width,H=cv.height;ctx.save();ctx.setTransform(1,0,0,1,0,0);
  ctx.globalAlpha=.35*SK.freeze;ctx.fillStyle='#dff6ff';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.85*SK.freeze;ctx.fillStyle='#808080';ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='source-over';const g=ctx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,W*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,20,30,.55)');ctx.globalAlpha=SK.freeze;ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}};
buildList();
window.SKYBREAKER23=true;
})();
