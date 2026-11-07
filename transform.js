// ===================== v23: TRANSFORMATION ANIMATIONS (more epic each tier, tap to skip, Paddy invincible) =====================
// ALLEY CAT ~0.6s spin + puff · PROWLER ~1s power-up glow + gear snaps on · LEGEND ~2s slow-mo energy column, armour assembles, zoom-in, title card
// MYTHIC ~3s screen darkens, ground cracks, aura storm, the form's element erupts, giant name banner + shockwave + sub-bass boom.
// Build-up rumble -> release boom per tier; Legend/Mythic add an announcer line (Dark Side gets his villain voice).
(function(){
if(typeof p==='undefined'||typeof drawFx!=='function')return;
const LEN=[.6,1,2,3];
const tierOf=f=>f===22?3:f<=1?0:f<=4?1:(f<=10||f===20||f===21)?2:3;
const BASE=[['#ffe08a','#ffffff','PADDY'],[typeof NV!=='undefined'?NV:'#a66bff',typeof NC!=='undefined'?NC:'#45e0ff','NINJA'],[typeof SR!=='undefined'?SR:'#c8102e','#ffd6dc','SAMURAI'],[typeof KG!=='undefined'?KG:'#ffd34d','#cfe3ff','KNIGHT'],[typeof PT!=='undefined'?PT:'#2a9df4','#ffe14d','PIRATE']];
const info=f=>{if(f>=5){const X=UF[f-4]||{};return {col:X.col||'#fff',col2:X.col2||'#fff',nm:X.nm||'',ico:X.ico||'',el:X.el||'',tier:X.tier||(f>=11&&f!==20?'MYTHIC FORM':'LEGEND FORM')}}const b=BASE[f]||BASE[0];return {col:b[0],col2:b[1],nm:b[2],ico:'',el:'',tier:f<=1?'ALLEY CAT':'PROWLER'}};
const snd=(k,v,g)=>{try{SND.play(k,{v:v==null?1:v,gap:g||.05})}catch(_){}};
const TX={on:null,shards:[],bolts:[]};window.TX23=TX;
let lastF=-1,lastT=performance.now();
function start(f){const t=tierOf(f),I=info(f);
 if(p.mquick||(typeof C!=='undefined'&&C.n>2&&!p.ground)){return} // mid-combo morph-cancels stay snappy
 const S={f,tier:t,I,t:0,L:LEN[t],x:p.x,y:p.y,ev:{},sk:0};TX.on=S;TX.shards=[];TX.bolts=[];
 if(t>=2&&typeof cine!=='undefined')cine.card=null;
 // sounds: build-up now, release later (existing sounds reused for the small tiers)
 if(t===0){snd('form_transform',.9,.2)}
 if(t===1){snd('tf_charge_2',1,.3);snd('power_up',.5,.3)}
 if(t===2){snd('tf_charge_3',1,.3);try{MUS.duck(3)}catch(_){}}
 if(t===3){snd('tf_charge_4',1,.3);try{MUS.duck(4)}catch(_){}}}
function end(skip){const S=TX.on;if(!S)return;TX.on=null;window.XCAM=null;if(p.state==='nmorph'){p.t=9;p.rot=0}p.inv=Math.max(p.inv||0,.35);
 if(skip&&!S.ev.rel){release(S,true)}}
function release(S,quiet){S.ev.rel=1;const I=S.I,x=p.x,y=p.y;
 if(S.tier===0){waves.push({x,y,r:10,l:.6,big:false});try{puffShadow(x,y)}catch(_){}spark(x,y-70,22,[I.col,I.col2,'#fff'],380)}
 if(S.tier===1){snd('sword_clang',.9,.2);for(let i=0;i<2;i++)R9.rings.push({x,y:y-90,r:20+i*24,vr:900,l:.7,col:i?I.col2:I.col,w:10,f:S.f,face:0});spark(x,y-90,26,[I.col,I.col2,'#fff'],420);shake=Math.max(shake,8);flashT=Math.max(flashT,.06)}
 if(S.tier===2){snd('tf_boom_3',1,.3);for(let i=0;i<3;i++)R9.rings.push({x,y:y-100,r:20+i*30,vr:1100,l:.9,col:i%2?I.col2:I.col,w:14,f:S.f,face:0});waves.push({x,y,r:10,l:.8,big:true});spark(x,y-100,40,[I.col,I.col2,'#fff'],560);shake=Math.max(shake,14);flashT=Math.max(flashT,.12)}
 if(S.tier===3){snd('tf_boom_4',1,.3);for(let i=0;i<5;i++)R9.rings.push({x,y:y-100,r:20+i*26,vr:1500+i*160,l:1,col:i%2?I.col2:I.col,w:18,f:S.f,face:0});waves.push({x,y,r:10,l:1,big:true});spark(x,y-100,60,[I.col,I.col2,'#fff'],760);shake=Math.max(shake,26);flashT=Math.max(flashT,.2);erupt(S)}}
function erupt(S){const x=p.x,I=S.I,u=S.f-4;try{
 if(u===7||I.el==='storm'){mBolt(x+150,{hit:false,w:1.6});mBolt(x-150,{hit:false,w:1.6})}
 else if(u===15){mBolt(x+140,{hit:false,w:1.5,col:'#ff3040'});mBolt(x-140,{hit:false,w:1.5,col:'#c9a0ff'})}
 else if(u===9){mFireBurst(x,GROUND-120,70,1.6)}
 else if(u===10){for(let k=-3;k<=3;k++)if(k)mSpike(x+k*90,{h:200-Math.abs(k)*20,d:Math.abs(k)*.04,hit:false,l:1.2});mSnow(x,GROUND-150,50)}
 else if(u===12){mWater(x,GROUND,60)}
 else if(u===13){mClock(x,GROUND-170,260,1)}
 TX.burst={x,l:1.1}}catch(_){}}
// ---------- per frame (real time, so slow-mo never stretches it) ----------
const _pre=r9Pre;r9Pre=function(dt){_pre(dt);const nowT=performance.now(),rdt=Math.min(.05,(nowT-lastT)/1000);lastT=nowT;
 let f=-1;try{f=FORM()}catch(_){}
 if(f!==lastF){const was=lastF;lastF=f;if(was>=0&&typeof started!=='undefined'&&started&&p.state==='nmorph'&&p.t<.15)start(f)}
 const S=TX.on;if(!S)return;
 if(p.state!=='nmorph'||FORM()!==S.f){TX.on=null;window.XCAM=null;p.rot=0;return}
 S.t+=rdt;const t=S.t,k=t/S.L,I=S.I;
 p.t=Math.min(p.t,.46);p.mquick=false;p.inv=Math.max(p.inv||0,.6);p.vx=0;if(p.ground)p.vy=0;
 if(S.tier===0){const e=Math.min(1,k/.75);p.rot=e<1?e*e*(3-2*e)*6.283:0;if(t>=.42&&!S.ev.rel)release(S)}
 if(S.tier===1){if(Math.random()<.5)sparks.push({x:p.x+(Math.random()-.5)*110,y:p.y-Math.random()*40,vx:(Math.random()-.5)*60,vy:-220-Math.random()*200,l:.5,c:Math.random()<.5?I.col:'#fff'});if(t>=.7&&!S.ev.rel)release(S)}
 if(S.tier===2){window.XCAM={z:t<1.45?1.16:1.05,b:.7,d:.3};slowT=Math.max(slowT||0,.1);
  if(t>.15&&!S.ev.vo){S.ev.vo=1;const L=['vo_tf_ready','vo_tf_unleash','vo_tf_awakens'];snd(S.f===20?'vo_tf_unleash':L[Math.floor(Math.random()*3)],1,.5)}
  if(t>.5&&t<1.35&&Math.random()<.7){const a=Math.random()*6.283,r=260+Math.random()*120;TX.shards.push({x:p.x+Math.cos(a)*r,y:p.y-90+Math.sin(a)*r*.7,tx:p.x+(Math.random()-.5)*60,ty:p.y-40-Math.random()*110,l:0,L:.45+Math.random()*.2,c:Math.random()<.5?I.col:I.col2,a:Math.random()*6})}
  if(t>=1.45&&!S.ev.rel)release(S)}
 if(S.tier===3){window.XCAM={z:t<1.9?1.1:.8,b:.85,d:t<1.9?.75:.45};slowT=Math.max(slowT||0,.1);
  if(t>.3&&!S.ev.vo){S.ev.vo=1;snd(S.f===19?'vo_tf_dark':'vo_tf_mythic',1,.5)}
  if(t>.25&&!S.ev.crack){S.ev.crack=1;try{R9.cracks.push(mkCrack(p.x,S.f))}catch(_){}shake=Math.max(shake,10)}
  if(t>.3&&t<1.9){if(Math.random()<.9){const a=Math.random()*6.283,r=90+Math.random()*90;sparks.push({x:p.x+Math.cos(a)*r,y:p.y-90+Math.sin(a)*r,vx:-Math.sin(a)*420,vy:Math.cos(a)*420-60,l:.4,c:Math.random()<.5?I.col:I.col2})}
   if(Math.random()<rdt*9)TX.bolts.push({a:Math.random()*6.283,l:.12});shake=Math.max(shake,3+t*3)}
  if(t>=1.9&&!S.ev.rel)release(S)}
 if(TX.burst){TX.burst.l-=rdt;if(TX.burst.l<=0)TX.burst=null}
 for(const s of TX.shards)s.l+=rdt;TX.shards=TX.shards.filter(s=>s.l<s.L);for(const b of TX.bolts)b.l-=rdt;TX.bolts=TX.bolts.filter(b=>b.l>0);
 if(t>=S.L)end(false)};
// tap / click / key skips (ignore the tap that picked the form)
const skip=e=>{const S=TX.on;if(!S||S.t<.3)return;end(true)};
['pointerdown','touchstart','keydown'].forEach(ev=>addEventListener(ev,skip,{capture:true,passive:true}));
// ---------- drawing: behind Paddy (glow, energy column, aura) ----------
const _dd=drawDummies;drawDummies=function(){_dd.apply(this,arguments);const S=TX.on;if(!S)return;const I=S.I,t=S.t,x=p.x,y=p.y;ctx.save();ctx.globalCompositeOperation='lighter';
 if(S.tier===1){const a=Math.min(1,t/.5)*(t>.7?Math.max(0,1-(t-.7)/.3):1),R=110+40*Math.sin(t*20);const g=ctx.createRadialGradient(x,y-80,10,x,y-80,R);g.addColorStop(0,'rgba(255,255,255,.3)');g.addColorStop(.4,I.col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=.45*a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-80,R,0,6.283);ctx.fill()}
 if(S.tier>=2){const grow=Math.min(1,t/.35),fade=S.tier===2?(t>1.45?Math.max(0,1-(t-1.45)/.5):1):(t>1.9?Math.max(0,1-(t-1.9)/.8):1),W=(S.tier===3?150:110)*grow;
  const top=-camY-400;const g=ctx.createLinearGradient(x-W,0,x+W,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.25,I.col);g.addColorStop(.5,I.col2);g.addColorStop(.75,I.col);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=.32*fade;ctx.fillStyle=g;ctx.fillRect(x-W,top,W*2,y-top+10);
  for(let i=0;i<5;i++){const yy=y-((t*420+i*120)%(y-top)),w=W*(1.1+.2*Math.sin(t*6+i));ctx.globalAlpha=.6*fade;ctx.strokeStyle=i%2?I.col:I.col2;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,yy,w,w*.22,0,0,6.283);ctx.stroke()}
  const R=130+(S.tier===3?40:0)+12*Math.sin(t*14),g2=ctx.createRadialGradient(x,y-90,10,x,y-90,R);g2.addColorStop(0,'rgba(255,255,255,.25)');g2.addColorStop(.45,I.col);g2.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=.32*fade;ctx.fillStyle=g2;ctx.beginPath();ctx.arc(x,y-90,R,0,6.283);ctx.fill()}
 if(TX.burst&&TX.burst.l>0){const B=TX.burst,u=1-B.l/1.1,h=(GROUND+40)-(-camY-300);ctx.globalAlpha=.55*(B.l/1.1);const gb=ctx.createLinearGradient(B.x-120-u*80,0,B.x+120+u*80,0);gb.addColorStop(0,'rgba(0,0,0,0)');gb.addColorStop(.5,I.col);gb.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gb;ctx.fillRect(B.x-200-u*80,-camY-300,400+u*160,h)}
 if(S.tier===3&&t<2.2){for(const b of TX.bolts){const r=150;ctx.globalAlpha=.9;ctx.strokeStyle=Math.random()<.5?I.col2:'#fff';ctx.lineWidth=3;ctx.beginPath();let px=x,py=y-90;ctx.moveTo(px,py);for(let s2=1;s2<=6;s2++){px=x+Math.cos(b.a)*r*s2/6+(Math.random()-.5)*26;py=y-90+Math.sin(b.a)*r*s2/6+(Math.random()-.5)*26;ctx.lineTo(px,py)}ctx.stroke()}}
 ctx.restore()};
// in front of Paddy: armour shards flying in
const _fx=drawFx;drawFx=function(){_fx();if(!TX.on||!TX.shards.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(const s of TX.shards){const u=s.l/s.L,e=u*u,px=s.x+(s.tx-s.x)*e,py=s.y+(s.ty-s.y)*e;ctx.save();ctx.translate(px,py);ctx.rotate(s.a+u*8);ctx.globalAlpha=.9;ctx.fillStyle=s.c;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(8,0);ctx.lineTo(0,12);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.globalAlpha=.8;ctx.fillRect(-2,-5,4,10);ctx.restore()}
 ctx.restore()};
// screen space: darkening, title card / name banner, "tap to skip"
const _dr=draw;draw=function(){_dr.apply(this,arguments);const S=TX.on;if(!S)return;const W=cv.width,H=cv.height,I=S.I,t=S.t,sc=Math.min(W/1000,H/420);ctx.save();ctx.setTransform(1,0,0,1,0,0);
 if(S.tier>=2){const show=S.tier===2?t>1.35:t>1.85;if(show){const u=Math.min(1,(t-(S.tier===2?1.35:1.85))/.25),out=Math.min(1,(S.L-t)/.25);const bh=(S.tier===3?96:70)*sc,by=H*.2;
   ctx.globalAlpha=.85*u*out;const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.2,'rgba(8,6,24,.92)');g.addColorStop(.8,'rgba(8,6,24,.92)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,by,W,bh);
   ctx.fillStyle=I.col;ctx.fillRect(0,by,W*u,3*sc);ctx.fillRect(W*(1-u),by+bh-3*sc,W*u,3*sc);
   ctx.globalAlpha=u*out;ctx.textAlign='center';ctx.textBaseline='middle';const fs=(S.tier===3?58:44)*sc,xs=W/2+(1-u)*W*.3;
   ctx.font=`${fs}px Bangers, Impact, sans-serif`;ctx.lineWidth=6*sc;ctx.strokeStyle='#000';ctx.strokeText((I.ico?I.ico+' ':'')+I.nm+(S.tier===3?'':' PADDY'),xs,by+bh*.45);ctx.fillStyle='#fff';ctx.fillText((I.ico?I.ico+' ':'')+I.nm+(S.tier===3?'':' PADDY'),xs,by+bh*.45);
   ctx.font=`${16*sc}px Bangers, Impact, sans-serif`;ctx.fillStyle=I.col;ctx.fillText(I.tier,W/2,by+bh*.86)}}
 if(S.t>.3){ctx.globalAlpha=.6;ctx.textAlign='center';ctx.font=`${13*sc}px system-ui, sans-serif`;ctx.fillStyle='#fff';ctx.fillText('tap to skip',W/2,H-14*sc)}
 ctx.restore()};
window.TRANSFORM23=true;
})();
