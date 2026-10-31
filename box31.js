// ===================== v31: BASE PADDY BOXING CHAIN (approved k_bx_* sheets) =====================
// Claw string (base Paddy only):  1 LEFT JAB · 2 RIGHT HOOK · 3 BODY BLOW  (the basic 1-2-3)
//   then with perfect timing:     4 JAB · 5 HOOK · 6 BODY SHOT · 7 UPPERCUT (pops him up) · 8th press = BUNNY KICK BARRAGE grab
// Sheets: generated/paddy_power/power_<move>.jpg cut by src/cut_power.py -> k_bx_jab/hook/body/uppercut, 9 frames:
//   0 pre · 1 load · 2-3 fire · 4-6 impact (built-in hit-stop) · 7 retract · 8 guard.  The hit lands on frame 4 (EXT below).
// The uppercut skips its load frame (1): it loads with one paw and hits with the other, so it fires straight out of the
// body shot's retract and the swap never shows.  Hook / body / uppercut get drawn smear arcs to sell the swing path.
(function(){
if(typeof SM!=='function'||typeof CLAWS==='undefined'||!window.K29EXT)return;
const base=()=>{try{return FORM()===0}catch(_){return false}};
const rnow=()=>performance.now()/1000;
const W31=window.W31={upT:0,upD:null,hits:{},smear:0,names:[]};
// [anim, sheet, frames, fps, impact index in that list]
const BX={pc1:['k_bx_jab',[1,3,4,5,6,7,8],28,2],pc2:['k_bx_hook',[1,2,3,4,5,6,7,8],30,4],pc3:['k_bx_body',[1,2,3,4,5,6,7,8],28,3],
 pc4:['k_bx_jab',[2,3,4,5,6,7,8],30,2],pc5:['k_bx_hook',[2,3,4,5,6,7,8],30,2],pc6:['k_bx_body',[2,3,4,5,6,7,8],28,2],pc7:['k_bx_uppercut',[2,3,4,5,6,7,8],24,2]};
const NEW={};for(const k in BX){const b=BX[k];NEW[k]=[b[2],0,b[0],b[1]];window.K29EXT[k]=b[3]/b[2]-.004}
SM(0,'',NEW);for(const k in NEW){const v=NEW[k];A[k]=[v[2],v[3],v[0],v[1]];if(window.SMOOTH)SMOOTH.DONE.delete(k)}
// move kind per anim: jab / hook / body / upper
const KIND={pc1:'jab',pc2:'hook',pc3:'body',pc4:'jab',pc5:'hook',pc6:'body',pc7:'upper'};
// fist position at impact (world units, facing right, from the cut frames) - smears end here, impact stars land here
const FIST={jab:[158,-131],hook:[126,-129],body:[137,-75],upper:[82,-255]};
const NM={1:'LEFT JAB!',2:'RIGHT HOOK!',3:'BODY BLOW!',4:'JAB!',5:'HOOK!',6:'BODY SHOT!',7:'UPPERCUT!'};
const COL={1:'#ffffff',2:'#bfe8ff',3:'#ffb040',4:'#ffffff',5:'#bfe8ff',6:'#ffb040',7:'#ffe14d'};
const LUNGE={1:120,2:140,3:200,4:200,5:180,6:200,7:220};
for(let i=1;i<=7;i++)Object.assign(CLAWS[i],{nm:NM[i],col:COL[i],sp:COL[i],lunge:LUNGE[i],k:'flat'});
Object.assign(NAMES,{pc1:'LEFT JAB!',pc2:'RIGHT HOOK!',pc3:'BODY BLOW!',pc4:'JAB!',pc5:'HOOK!',pc6:'BODY SHOT!',pc7:'UPPERCUT!'});
// jabs/hooks barely push (so the chain keeps connecting); body blows drive him back a bit; the uppercut pops him up
Object.assign(KB,{pc1:[70,-60,0,.06],pc2:[110,-90,0,.065],pc3:[300,-180,.1,.1],pc4:[70,-60,0,.06],pc5:[110,-90,0,.065],pc6:[300,-200,.1,.1],pc7:[60,-640,.45,.11]});
Object.assign(REACH,{pc1:[180,150],pc2:[160,155],pc3:[170,130],pc4:[180,150],pc5:[160,155],pc6:[170,130],pc7:[140,300]});
// the old claw slash arcs don't belong on punches: base Paddy's claw chain draws its own punch FX
const _cf=clawFx;clawFx=function(i){if(base()&&p.state==='claw'&&KIND[p.anim])return;return _cf.apply(this,arguments)};
const _sc=startClaw;startClaw=function(){const n0=(window.K29&&K29.imp.length)||0;_sc.apply(this,arguments);if(!base()||p.state!=='claw')return;
 if(window.K29&&K29.imp.length>n0)K29.imp.splice(n0).forEach(o=>{if(!o.streak)K29.imp.push(o)}); // drop kitty29's straight jab streaks (we draw the smears)
 if(p.combo===6&&p.anim==='pc6'){p.vy=0;p.ground=p.y>=GROUND-2||p.ground} // the old 6th hit jumped (rising claw); the body shot stays planted
 W31.smear={k:KIND[p.anim],t0:p.t,a:p.anim};W31.names.push(p.anim);if(W31.names.length>20)W31.names.shift()};
// hits: tier-sized impact at the fist, uppercut pop-up remembered so the 8th press catches him with the ground grab
const _hd=hitDummy;hitDummy=function(d,move,dir){const n0=(window.K29&&K29.imp.length)||0;const r=_hd.apply(this,arguments);
 try{const k=KIND[move];if(base()&&k&&d){W31.hits[move]=(W31.hits[move]||0)+1;
  if(window.K29&&K29.imp.length>n0)K29.imp.length=n0;
  const f=FIST[k],x=p.x+p.face*f[0],y=p.y+f[1],pw=k==='body'||k==='upper';
  K29.imp.push({x:x+p.face*8,y,l:1,big:pw,col:k==='upper'?'#ffe14d':k==='body'?'#ffb040':k==='hook'?'#bfe8ff':'#ffe9a8',rot:Math.random()*6.28});if(K29.imp.length>24)K29.imp.shift();
  shake=Math.max(shake,k==='upper'?13:pw?8:k==='hook'?5:3);hitstop=Math.max(hitstop,k==='upper'?.11:pw?.09:.05);
  for(let i=0;i<(pw?12:6);i++){const a=(p.face>0?0:Math.PI)+(Math.random()-.5)*2.2+(k==='upper'?-1.3*p.face:0),v=200+Math.random()*(pw?420:240);sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.25,c:i%2?'#fff':(k==='upper'?'#ffe14d':'#bfe8ff')})}
  if(pw)waves.push({x,y,r:14,l:.6,big:k==='upper'});
  if(k==='upper'){W31.upT=rnow();W31.upD=d;flashT=Math.max(flashT,.06)}}}catch(_){}return r};
// 'JUGGLE!' used to land a tick after the move name and replace it: keep the move name
let lastSay=0,lastTxt='';const _say=say;say=function(t){if(t==='JUGGLE!'&&base()&&((rnow()-lastSay<.6&&lastTxt!=='JUGGLE!')||p.state==='claw'||p.state==='bunny'))return;if(/^(NICE|AWESOME|PURRFECT|LEGENDARY)!$/.test(t||'')&&base()&&p.state==='claw'&&rnow()-lastSay<.5){const a=arguments;setTimeout(()=>{if(p.state!=='bunny')_say.apply(null,a)},450);return}
 lastSay=rnow();lastTxt=t;return _say.apply(this,arguments)};
// preload the boxing sheets first for base Paddy
let asked=false;const _pre=r9Pre;r9Pre=function(dt){try{if(!asked&&window.queueFrames&&F&&F.k_bx_jab){asked=true;const L=[];for(const s of ['k_bx_jab','k_bx_hook','k_bx_body','k_bx_uppercut'])(F[s]||[]).forEach(q=>L.push(q.f));queueFrames(L,true)}}catch(_){}_pre(dt)};
// ---------- smears / motion trails (world space, drawn over Paddy) ----------
function arc(P0,C,P2,w0,w1,col,al){const N=10;let px=P0[0],py=P0[1];for(let i=1;i<=N;i++){const u=i/N,x=(1-u)*(1-u)*P0[0]+2*(1-u)*u*C[0]+u*u*P2[0],y=(1-u)*(1-u)*P0[1]+2*(1-u)*u*C[1]+u*u*P2[1];
 ctx.globalAlpha=al*Math.min(1,u*1.6);ctx.lineWidth=w0+(w1-w0)*u;ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();px=x;py=y}}
const PATH={hook:[[-30,-178],[150,-232],[126,-129]],body:[[0,-150],[70,-30],[137,-75]],upper:[[118,-20],[150,-170],[82,-255]]};
const _fx=drawFx;drawFx=function(){_fx();try{if(!base()||p.state!=='claw'||!KIND[p.anim])return;const k=KIND[p.anim],e=window.K29EXT[p.anim]||.08,t=p.t,
  a=t<e-.07?0:t<e?(t-(e-.07))/.07:Math.max(0,1-(t-e)/.12);if(a<=.02)return;
 ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.face,1);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 if(k==='jab'){const f=FIST.jab;for(let i=0;i<3;i++){const yy=f[1]+(i-1)*9,x0=30+i*12;ctx.globalAlpha=a*(i===1?.9:.5);ctx.strokeStyle='#fff';ctx.lineWidth=i===1?7:3;ctx.beginPath();ctx.moveTo(x0,yy);ctx.lineTo(f[0]-6,yy);ctx.stroke()}}
 else{const P=PATH[k],c1=k==='upper'?'#ffe14d':k==='body'?'#ffb040':'#9fdcff',W=k==='upper'?30:k==='hook'?26:24;
  // grow the arc in as the punch fires so the curve reads as the path of the paw
  const g=Math.min(1,t/e);const P2=[P[0][0]+(P[2][0]-P[0][0])*g,P[0][1]+(P[2][1]-P[0][1])*g],C=[P[0][0]+(P[1][0]-P[0][0])*Math.min(1,g*1.4),P[0][1]+(P[1][1]-P[0][1])*Math.min(1,g*1.4)];
  arc(P[0],C,P2,2,W,c1,a*.55);arc(P[0],C,P2,1,W*.45,'#ffffff',a*.9);
  // a second, offset echo arc = motion blur
  ctx.translate(k==='upper'?8:-10,k==='upper'?18:10);arc(P[0],C,P2,1,W*.6,c1,a*.25)}
 ctx.restore()}catch(_){}};
window.BOX31=true;
})();
