// ===================== v44b: JUGGLES TAKE TIMING (every form, every air move) =====================
// Every hit in the game goes through hitDummy(), so the juggle rules live here, wrapped once after all the form engines:
//  • a launcher (any hit that sends a grounded enemy up fast: uppercut, morph uppercut, ↑C launchers, …) STARTS a juggle;
//  • each follow-up on the airborne enemy (air hits, blink-ins, tail, …) only CONNECTS if it lands at least GAP after the previous
//    juggle hit (the timing window). Faster than that = mashing: the hit whiffs (no damage, no lift, no combo count) and after
//    MISS whiffs the enemy drops;
//  • DECAY: every connected air hit gives less float and less hitstun;
//  • hard CAP: after CAP air hits or MAXT seconds airborne the enemy falls (no more lift) and gets a short invulnerable landing.
//  Scripted cinematics (Bunny Kick grab, finisher cutscenes, ultimates) are left exactly as they were.
(function(){
const J=window.JUGGLE={GAP:.16,MISS:2,CAP:9,MAXT:2.0,LANDINV:.5,FALLV:520,DECAY:.09,MIN:.25,log:[]};
const AIR=d=>d.y<GROUND-25;
const HOVER=d=>!!(d.D&&d.D.fly&&d.selfFly);   // a bird flying on its own is not being juggled
const cineNow=()=>{try{return (Array.isArray(CINE)?CINE.includes(p.state):CINE.has&&CINE.has(p.state))||p.state==='lkult'||p.state==='ufin'||/final|fin$|^ult/.test(p.state||'')||(typeof cine!=='undefined'&&cine&&cine.card&&cine.on)}catch(_){return false}};
const SCRIPTED=new Set(['bunnykick','bunnylaunch']);
function whiff(d,why){J.log.push(why);if(J.log.length>200)J.log.shift();d.jg&&(d.jg.whiffs=(d.jg.whiffs||0)+1)}
const _hd=hitDummy;
hitDummy=function(d,move,dir){
 if(!d||J.off)return _hd(d,move,dir);
 const free=cineNow()||SCRIPTED.has(move)||(HOVER(d)&&!d.jg),air=AIR(d);
 if(!free){
  if(d.landInv&&now<d.landInv){whiff(d,'landinv');return}
  if(air&&d.jg){const g=d.jg;
   if(g.fall){whiff(d,'falling');return}
   if(now-g.last<J.GAP){g.miss=(g.miss||0)+1;whiff(d,'mash');if(g.miss>=J.MISS){g.fall=true;J.log.push('drop:mash')}return}}}
 const r=_hd(d,move,dir);
 if(free)return r;
 if(!air){if(d.vy<-600)d.jg={n:0,t0:now,last:now,miss:0,fall:false}}   // launched: the juggle starts
 else{if(!d.jg)d.jg={n:0,t0:now,last:now,miss:0,fall:false};const g=d.jg;g.n++;g.last=now;g.miss=0;
  const f=Math.max(J.MIN,1-J.DECAY*g.n);if(d.vy<0)d.vy*=f;d.fl*=f;                                      // decay: less float, less hitstun
  if(g.n>=J.CAP){g.fall=true;J.log.push('drop:cap')}}
 return r};
const _ud=updDummies;
updDummies=function(dt){const r=_ud(dt);if(J.off)return r;
 const cin=cineNow(),pn=performance.now(),rdt=Math.min(.034,(pn-(J.pn||pn))/1000);J.pn=pn;   // real seconds (capped per frame like the game clock, so a slow phone isn't short-changed): hitstop/slow-mo doesn't stretch the airborne cap
 for(const d of dummies){
  // airborne clock on every enemy (not only launched ones): any way of keeping him up counts toward MAXT
  if(AIR(d)&&!HOVER(d)&&!cin){d.airT=(d.airT||0)+rdt;if(d.airT>J.MAXT&&!(d.jg&&d.jg.fall)){if(!d.jg)d.jg={n:0,t0:now-d.airT,last:now,miss:0,fall:false};d.jg.fall=true;J.log.push('drop:time')}}
  else if(!AIR(d)||HOVER(d))d.airT=0;
  const g=d.jg;if(!g)continue;
  if(HOVER(d)){d.jg=null;d.airT=0;continue}
  if(!g.fall&&now-g.t0>J.MAXT){g.fall=true;J.log.push('drop:time')}
  if(g.fall&&AIR(d)&&!cineNow()){d.fl=0;const fv=Math.max(J.FALLV,Math.min(1400,(GROUND-d.y)*1.2));if(d.vy<fv)d.vy=fv}   // higher up = drops faster, so the whole juggle stays ~2.5-3 s                                    // no more lift or float: it drops
  if(!AIR(d)&&now-g.t0>.18){if(g.n>0||g.fall)d.landInv=now+J.LANDINV;J.log.push('land:'+g.n);d.jg=null}}
 return r};
})();
