// ===================== COMBAT LAB (base Paddy only) =====================
// Loaded by combat-lab.html. index.html and level.html do not load this file.
// The main game's punch string, controls and story levels stay as they are.
// Here, three things are added on top of the approved punch sheets:
//   1. A late Claw press (during the retract) takes a different branch. A fast or on-impact press
//      still walks jab → cross → hook → body. Hold forward still means jabs. Back = hook.
//      Down = body. Up = uppercut.
//   2. Jump (the Jump button, not ▲) is buffered and cancels the retract of a punch into a hop,
//      and the combo count is kept for a short time.
//   3. Claw in the air is a four-hit boxing juggle (jab, cross, hook, uppercut) using the approved
//      ground sheets until air sheets exist. ▼ + Claw in the air is still the ground pound.
//      Dash then Claw is still the dash uppercut.
(function(){
if(!document.body.classList.contains('clab'))return;
if(typeof p==='undefined'||typeof update!=='function'||typeof r9Pre!=='function')return;
const M=()=>window.PADDY_MOVESET;
const HINT='Late Claw branches  ·  ◀ hook  ·  ▶ jabs  ·  ▼ body  ·  ▲ upper  ·  air Claw juggles';
const LABEL={bxj1:'JAB',bxj2:'SLIP JAB',bxx:'CROSS',bxlh:'HOOK',bxrb:'BODY',bxpu:'UPPER',bxpj:'PWR JAB',bxph:'PWR HOOK',bxpb:'PWR BODY'};
const LAB=window.CLAB={
 on(){try{return document.body.classList.contains('clab')&&(typeof FORM!=='function'||FORM()===0)&&!(window.KITTY36&&KITTY36.on)}catch(_){return false}},
 version:1, route:[], log:[], holdJump:0, want:false, airN:0, sets:{}, ready:false, hint:HINT
};
function register(m){if(m&&m.id)LAB.sets[m.id]=m}
LAB.register=register;
if(M())register(M());
LAB.pick=function(ctx){
 const mv=M();if(!mv||!ctx||!ctx.inp||!LAB.on())return null;
 const inp=ctx.inp,n=ctx.n|0,beat=!!ctx.beat,fi=ctx.fi|0,lastK=ctx.lastK||'';
 const finish=key=>{
  if(n===7&&beat)return mv.punch.upper;
  if(n>=4&&n<=6&&beat)return mv.power[key]||mv.punch[key];
  return mv.punch[key];
 };
 let key=null;
 if(inp.up)key='upper';
 else if(inp.back)key='hook';
 else if(!inp.down&&!inp.fwd&&ctx.timed&&fi>=5&&!(n===7&&beat))key=mv.late[lastK]||mv.late['']||'hook';
 if(!key)return null;
 const a=finish(key);
 LAB.lastPick=a;LAB.log.push(a);if(LAB.log.length>40)LAB.log.shift();
 return a;
};
function note(anim){const t=LABEL[anim]||anim;LAB.route.push(t);if(LAB.route.length>8)LAB.route.shift();LAB.idle=0}
function cutToMove(){
 const c=Math.min(7,p.combo||0);
 p.keepCombo=c;p.keepT=.8;p.combo=c;p.state='normal';p.cool=0;p.wall=false;
 if(Math.abs(p.vx)<130)p.vx=p.face*160;
 if(window.P33){P33.q=null;P33.a=null;P33.on=false}
 LAB.holdJump=0;
}
function endAir(){
 p.keepCombo=Math.min(7,p.combo||0);p.keepT=.6;p.state='normal';p.cool=0;LAB.want=false;
}
function airId(i){
 const mv=M();if(!mv)return 'bxj1';
 const up=!!(K.up);
 if(up)return mv.punch.upper;
 const key=mv.air[i%mv.air.length];
 return mv.punch[key]||mv.punch.jab;
}
function beginAir(i){
 LAB.airN=i||0;LAB.want=false;p.labHit=0;p.state='labair';p.t=0;p.shot=false;acted=true;
 const a=airId(LAB.airN);setAnim(a,true);p.fi=2;p.ft=2;note(a);
 if(p.vy>40)p.vy=40;p.vx=p.face*Math.max(140,Math.min(240,Math.abs(p.vx)||180));
}
function strikeAir(){
 const a=p.anim,mv=M();if(!mv)return;
 let hit=false;
 for(const d of dummies){
  if(!d.alive||d.benched)continue;
  const dx=(d.x-p.x)*p.face,up=a==='bxpu'?280:a==='bxrb'?120:190,reach=a==='bxpu'?170:200;
  if(dx<-40||dx>reach)continue;
  if(d.y<=p.y-up||d.y-(d.h||130)>=p.y+24)continue;
  hitDummy(d,a,p.face);
  d.vy=Math.min(d.vy,a==='bxpu'?-980:-680);d.fl=Math.max(d.fl||0,.5);d.vx=p.face*(a==='bxpu'?80:40);
  hit=true;
 }
 if(!hit)return;
 p.labHit=1;p.combo=Math.min(7,(p.combo||0)+1);
 if(typeof popNum==='function')popNum(p.combo,a==='bxpu'?'#ffe14d':'#bfe8ff');
 p.vy=Math.min(p.vy,a==='bxpu'?-460:-280);p.hang=Math.max(p.hang||0,.22);
 shake=Math.max(shake,a==='bxpu'?11:6);flashT=Math.max(flashT,a==='bxpu'?.06:.03);
 const sayName=LABEL[a]||'HIT';
 if(typeof say==='function')say(sayName+'!','#bfe8ff',a==='bxpu');
}
const LIFT_ADD=['bxj1','bxj2','bxx','bxlh','bxrb','bxpu','bxpj','bxph','bxpb'];
if(typeof LIFT!=='undefined')for(const id of LIFT_ADD)if(!LIFT.includes(id))LIFT.push(id);
const _press=press;
press=function(k){const r=_press.apply(this,arguments);if(k==='attack'&&p.state==='labair')LAB.want=true;return r};
function preTick(){
 if(!document.body.classList.contains('clab'))return;
 if(window.KITTY36&&KITTY36.on)KITTY36.on=false;
 if(typeof FORM==='function'&&FORM()!==0)return;
 if(!LAB.on())return;
 const t=now;
 if(p.ground&&p.state==='normal'&&(!p.keepT||p.keepT<=0)&&p.combo===0){LAB.idle=(LAB.idle||0)+1/60;if(LAB.idle>0.5)LAB.route.length=0}
 else LAB.idle=0;
 if(LAB.holdJump&&p.state!=='claw'){
  if(t-LAB.holdJump<0.35&&p.ground&&(p.state==='normal'||p.state==='land'||p.state==='stop')){const age=LAB.holdJump;LAB.holdJump=0;if(t-age<0.35)P.jump=1}
  else LAB.holdJump=0;
 }
 if(p.state==='claw'&&p.ground){
  if(K.up&&(P.attack||K.attack||(window.P33&&P33.q&&P33.q.inp&&P33.q.inp.up)))delete P.jump;
  const power=/^bxp/.test(p.anim);
  const late=p.anim==='bxrec'||(power?p.fi>=7:p.fi>=5);
  if(P.jump&&!K.up){
   delete P.jump;
   if(late){cutToMove();P.jump=1}
   else LAB.holdJump=t;
  }else if(late&&LAB.holdJump&&t-LAB.holdJump<0.4){cutToMove();P.jump=1}
 }
 if(p.state==='labair'){
  if((P.down||K.down)&&P.attack)return;
  if(P.attack){LAB.want=true;delete P.attack}
  if(P.jump&&!K.up&&p.t>0.1){delete P.jump;endAir();P.jump=1}
  return;
 }
 if(!p.ground&&!p.wall&&P.attack&&!P.down&&!K.down&&!['kpound','kduc','kcharge','hurt','bunny','ledge','respawn','dash','wingdash','dashstrike','labair'].includes(p.state)){
  delete P.attack;beginAir(0);
 }
}
function post(){
 if(!LAB.on()||p.state!=='labair')return;
 const len=(FR[p.anim]||[]).length||7;
 const fi=Math.max(2,Math.min(len-1,2+Math.floor(p.t*16)));
 p.fi=fi;p.ft=fi+0.01;
 p.vy=Math.min(70,Math.max(-720,p.vy));
 p.vx=p.face*Math.max(100,Math.min(260,Math.abs(p.vx)||160));
 if(fi>=4&&!p.labHit)strikeAir();
 const chain=LAB.want&&p.t>=0.16&&p.labHit;
 if(chain){LAB.airN++;beginAir(LAB.airN);return}
 if(p.ground&&p.t>0.05){endAir();return}
 if(p.t>=0.30)endAir();
}
const _pre=r9Pre;r9Pre=function(dt){try{preTick()}catch(e){console.warn('clab',e)}_pre(dt)};
const _up=update;update=function(dt){_up(dt);try{post()}catch(e){console.warn('clab post',e)}};
const _sc=startClaw;startClaw=function(){const r=_sc.apply(this,arguments);try{if(LAB.on()&&p.state==='claw'&&LABEL[p.anim])note(p.anim)}catch(_){}return r};
const _hud=r12HUD;r12HUD=function(){const r=_hud.apply(this,arguments);try{if(document.body.classList.contains('clab'))paint()}catch(_){}return r};
function paint(){
 const route=LAB.route.length?LAB.route.join(' › '):'CLAW TO START';
 ctx.save();ctx.textAlign='left';ctx.font=`18px ${FONT}`;
 ctx.fillStyle='#1a0f3a';ctx.fillText(route,18,252);ctx.fillStyle='#ffe14d';ctx.fillText(route,16,250);
 ctx.font='600 12px system-ui,sans-serif';
 ctx.fillStyle='#10203a';ctx.fillText('Late Claw branches',18,272);ctx.fillStyle='#fff';ctx.fillText('Late Claw branches',16,270);
 ctx.restore();
}
(function(){const tb0=document.querySelector('#moves table');if(!tb0||document.getElementById('labrow'))return;const tb=tb0.tBodies[0]||tb0;
 const R=[
  ['🥊 COMBAT LAB — base Paddy. Familiar buttons. The late press is the new branch.','',''],
  ['Classic string, any fast press: JAB → CROSS → LEFT HOOK → BODY','Claw Claw Claw Claw','CLAW ×4'],
  ['Late branch: press the next Claw during the retract (the arm coming home), not during the hit','wait, then X','wait, then CLAW'],
  ['After a jab, a late press is a HOOK. After a cross, a BODY. After a hook, a SLIP JAB.','','same'],
  ['Hold toward him: JAB, and the next toward-press is the SLIP JAB (same as before)','hold → + X','hold ▶ + CLAW'],
  ['HOOK without turning around: tap away and press Claw before he turns','tap ← + X','tap ◀ + CLAW'],
  ['BODY SHOT mid-string','↓ + X','▼ + CLAW'],
  ['UPPERCUT. Tap is the quick one. Hold ▲ + Claw for the power uppercut.','↑ + X','▲ + CLAW'],
  ['Jump-cancel: press Jump during a punch. It comes out on the retract and keeps the combo count.','Space','JUMP'],
  ['Air chain: JAB → CROSS → HOOK → UPPERCUT, then it loops. Each hit lifts him.','X in the air','CLAW in the air'],
  ['GROUND POUND from the air. DASH UPPERCUT: dash, then Claw.','↓+X  ·  →→ X','▼+CLAW · ▶▶ CLAW']
 ];
 const anchor=tb.firstChild;
 R.forEach((r,i)=>{const tr=document.createElement('tr');if(!i){tr.id='labrow';tr.innerHTML='<th colspan="3" style="color:#ffe14d">'+r[0]+'</th>'}else tr.innerHTML='<td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td>';tb.insertBefore(tr,anchor)});
})();
function boot(){
 if(typeof started==='undefined'||!started||!window.PRACTICE||!PRACTICE.on){setTimeout(boot,200);return}
 if(window.KITTY36)KITTY36.on=false;
 if(typeof FORM==='function'&&FORM()!==0&&typeof setForm==='function')setForm(0,true);
 if(window.UC49){UC49.mode='new';const b=document.getElementById('pruc');if(b){b.textContent='UPPERCUT: NEW';b.classList.add('cur')}}
 const morph=document.querySelector('#ui .b[data-k=morph]');if(morph)morph.style.display='none';
 const pf=document.getElementById('prforms');if(pf)pf.style.display='none';
 LAB.ready=true;
 if(typeof card==='function')card('COMBAT LAB','late Claw branches  ·  Jump cancels  ·  air Claw juggles','#ffe14d');
}
boot();
})();
