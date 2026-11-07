// ===================== v26: COMBOS FLOW =====================
// 1) TURN MID-COMBO: press the other direction during any attack and Paddy flips round and keeps the chain going on that side (the hit count and chain step are kept).
// 2) NO END-LAG: the hit counter is frozen during finishers / cut-scenes / power-ups and gets a grace window after, so a new combo straight after a finisher keeps counting;
//    a big combo no longer ends in a forced VICTORY pose that ate the next button press.
(function(){
if(typeof r9Pre!=='function'||typeof C==='undefined')return;
const NOTURN=new Set(['normal','run','stop','land','jump','djump','fall','dash','ndash','zoomies','superleap','hardland','idle','walk','slide','wallrun','ledge','hurt','stun','ko','respawn','respawned','nmorph',
 'bunny','victory','ufin','moonl','lkult','shadowfin','eclipse','finishhim','story','sit','grab','wiggle']);
const busyCine=()=>{const s=p.state||'';return (typeof CINE!=='undefined'&&CINE.includes(s))||/^(ufin|moonl|lkult|nmorph|shadowfin|eclipse|finishhim)$/.test(s)||/fin|ult/.test(s)||(window.MOON&&MOON.on)};
let wasBusy=false;window.COMBO26={turns:0};
const _pre=r9Pre;r9Pre=function(dt){
 try{const want=P.left?-1:P.right?1:0;
  if(want&&want!==p.face&&!NOTURN.has(p.state)&&!busyCine()&&(C.n>0||/^(u[1-7]|lk|uair|ulaunch|utail|umeow|umeowc)$/.test(p.state)||p.state.length<=3)){
   p.face=want;p.vx=-p.vx*.25;COMBO26.turns++;
   if(p.lk){const side=dummies.filter(d=>d.alive&&!d.benched&&(d.x-p.x)*want>0&&Math.abs(d.x-p.x)<700).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];p.lk.tg=side||null}
   if(C.n>0)C.t=Math.max(C.t,C.max);
   for(let i=0;i<6;i++)sparks.push({x:p.x,y:p.y-60-Math.random()*60,vx:want*(120+Math.random()*200),vy:(Math.random()-.5)*120,l:.25,c:'#fff'})}}catch(_){}
 _pre(dt)};
// the counter never times out while a finisher / cut-scene is playing, and you get a grace window after it
const _upd=updCombo;updCombo=function(dt){const b=busyCine();if(b&&C.n>0){C.t=Math.max(C.t,C.max);wasBusy=true}else if(wasBusy){wasBusy=false;if(C.n>0)C.t=C.max+1.6}_upd(dt)};
comboEnd=function(silent){if(C.n>=2&&!silent){C.fin={n:C.n,l:2.2}}C.n=0;C.t=0};
window.COMBO26.ok=true;
})();
