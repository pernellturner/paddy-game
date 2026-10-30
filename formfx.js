// ===================== v22: PER-FORM SOUND SETS + ANNOUNCER + PER-FORM MUSIC =====================
// Every form gets its own swing/hit/heavy/special/finisher sounds (Mythics add an earth-shattering sub-bass "quake").
// Sets are lazy-loaded when the form becomes active. Announcer lines play on finishers. Music loops crossfade per form.
(function(){
const S=window.SND;if(!S||!S.play)return;
const PRE={1:'ninja',2:'samurai',3:'knight',4:'pirate',5:'gunsling',6:'light',7:'powerblade',8:'crimson',9:'reaper',10:'shadow',11:'storm',12:'dragon',13:'phoenix',14:'frost',15:'mecha',16:'tide',17:'chrono',18:'beast',19:'dark',20:'sky',21:'nwr',22:'gf'};
const fNow=()=>{try{return Math.min(22,FORM()|0)}catch(_){return 0}};
const MYF=f=>f>=11&&f!==20&&f!==21;
function K(f,slot){const pre=PRE[f];if(!pre)return null;
 if(f===19){const m={swing1:'dark_swing1',swing2:'dark_swing2',hit:'dark_clash',heavy:'dark_force',special:'dark_force',finisher:'dark_finisher',quake:'dark_quake',throw:'dark_throw',choke:'dark_choke',hum:'dark_hum'};const k=m[slot];return k&&S.has(k)?k:null}
 const k=pre+'_'+slot;return S.has(k)?k:null}
function setKeys(f){return ['swing1','swing2','hit','heavy','special','finisher','quake','throw','choke','hum'].map(s=>K(f,s)).filter(Boolean)}
function voKeys(f){return ['a','b','c','d'].map(x=>'vo_f'+f+'_'+x).filter(k=>S.has(k))}
let lastF=-1;function preloadForm(f){for(const k of setKeys(f).concat(voKeys(f)))S.load(k)}
// generic key -> slot of the active form's set
const MAP={claw_swipe_1:'hit',claw_swipe_2:'hit',claw_swipe_3:'hit',blade_slash:'hit',gun_pop:'hit',mecha_servo:'hit',claw_heavy:'heavy',sword_clang:'hit',
 ground_slam:'heavy',launcher_uppercut:'heavy',lightning:'special',fire_whoosh:'special',ice_crack:'special',water_wave:'special',time_stop:'special',beast_roar:'special',mecha_laser:'special',
 cannon:'special',force_push:'special',ult_explosion:'finisher'};
const DSMAP={blade_boomerang:'throw',force_push:'heavy',force_lightning:null};
let alt=0,finGo=0;const _play=S.play;S.log=[];const P=(k,o)=>{S.log.push(k);if(S.log.length>40)S.log.shift();return _play.call(S,k,o)};
S.play=function(k,o){const f=fNow();let slot=finGo?'finisher':(f===19&&k in DSMAP?DSMAP[k]:MAP[k]);
 if(slot&&f>0){const r=K(f,slot);if(r){if(slot==='hit'&&o&&o.r)o=Object.assign({},o,{r:.94+Math.random()*.12});if(slot==='finisher')o=Object.assign({},o||{},{gap:.45});P(r,o);
   if(slot==='finisher'&&MYF(f)){const q=K(f,'quake');if(q)setTimeout(()=>P(q,{v:1,gap:.5}),140)}return}}
 return _play.call(S,k,o)};
S.formPlay=(slot,o)=>{const r=K(fNow(),slot);if(r)P(r,o);return !!r};
// ---------- announcer ----------
let annT=-99;S.announce=function(force){const f=fNow(),ks=voKeys(f);if(!ks.length)return;const t=performance.now()/1000;if(!force&&t-annT<5)return;annT=t;
 const k=ks[Math.floor(Math.random()*ks.length)];MUS.duck(2.6);setTimeout(()=>P(k,{v:1,gap:1}),f===19?120:60)};
// ---------- swing sounds on every new attack (state/anim/combo change) ----------
const NOSW=new Set(['normal','land','hurt','jump','djump','dash','ndash','wallrun','ledge','slide','victory','stop','zoomies','wiggle','superleap','hardland','stun','ko','respawn','sit','hiss','meow','idle','fall','lk','grab','respawned','tkd','story']);
let sig='';setInterval(()=>{try{if(typeof p==='undefined')return;const f=fNow();if(f!==lastF){lastF=f;preloadForm(f);MUS.want(f)}
 const s=p.state+'|'+p.anim+'|'+p.combo;if(s===sig)return;sig=s;if(NOSW.has(p.state)||!PRE[f])return;
 S.formPlay((alt++)%2?'swing2':'swing1',{v:f===19?.8:.62,gap:.07,r:f===19?.9:1})}catch(_){}},33);
// ---------- finisher hooks ----------
function hookFin(){if(!window.FIN||!FIN.go){setTimeout(hookFin,300);return}
 const _go=FIN.go;FIN.go=function(u,x,big){finGo++;let r;try{r=_go.apply(this,arguments)}finally{finGo--}
  if(r!==false){S.formPlay('finisher',{v:1,gap:.3});if(MYF(fNow())){const q=K(fNow(),'quake');if(q)setTimeout(()=>P(q,{v:1,gap:.5}),160)}S.announce();window.ZOOMOUT=Math.max(window.ZOOMOUT||0,2.2)}return r};
 const _ch=FIN.charge;FIN.charge=function(u,l){const r=_ch.apply(this,arguments);if((l||1)>=1)S.announce();return r}}
hookFin();
['ufFinal','ufUltStart'].forEach(n=>{const go=()=>{if(typeof window[n]!=='function'){setTimeout(go,300);return}const o=window[n];window[n]=function(){S.announce();window.ZOOMOUT=Math.max(window.ZOOMOUT||0,1.6);return o.apply(this,arguments)}};go()});
// ---------- music ----------
const TRACK={0:'kitty',1:'stealth',2:'samurai',3:'knight',4:'pirate',5:'western',6:'holy',7:'blade',8:'blade',9:'stealth',10:'stealth',11:'storm',12:'primal',13:'elemental',14:'elemental',15:'storm',16:'elemental',17:'chrono',18:'primal',19:'dark',20:'blade',21:'storm',22:'primal'};
const MV=.34,XF=1.6;const MB={},ML={};
const MUS=window.MUS={cur:null,target:null,bus:null,duckT:0,
 want(f){this.target=TRACK[f]||'kitty';this.tick()},
 duck(s){this.duckT=Math.max(this.duckT,s||2)},
 load(n){if(MB[n])return Promise.resolve(MB[n]);if(ML[n])return ML[n];const c=S.ac();if(!c)return Promise.resolve(null);
  ML[n]=fetch('assets/music/'+n+'.mp3?v=1').then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status)).then(a=>new Promise((o,e)=>c.decodeAudioData(a,o,e))).then(b=>MB[n]=b).catch(()=>{delete ML[n];return null});return ML[n]},
 tick(){const c=S.ac(),n=this.target;if(!c||!n||!S.unlocked||c.state!=='running')return;if(!this.bus){this.bus=c.createGain();this.bus.gain.value=0;this.bus.connect(S.out())}
  if(this.cur&&this.cur.name===n)return;if(this.loading===n)return;this.loading=n;
  this.load(n).then(b=>{this.loading=null;if(!b||this.target!==n||(this.cur&&this.cur.name===n))return;const t=c.currentTime,s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.loop=true;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+XF);s.connect(g);g.connect(this.bus);s.start(t);
   const o=this.cur;if(o){try{o.g.gain.cancelScheduledValues(t);o.g.gain.setValueAtTime(o.g.gain.value,t);o.g.gain.linearRampToValueAtTime(0,t+XF);o.s.stop(t+XF+.05)}catch(_){}}this.cur={name:n,s,g}})}};
setInterval(()=>{try{const c=S.ac&&S.ac();if(!c||!MUS.bus&&!S.unlocked)return;if(MUS.target==null)MUS.want(fNow());MUS.tick();if(!MUS.bus)return;
 MUS.duckT=Math.max(0,MUS.duckT-.25);const m=(S.isMuted&&S.isMuted())||!S.on||window.MUSICOFF?0:MV*(MUS.duckT>0?.35:1);MUS.bus.gain.setTargetAtTime(m,c.currentTime,.25)}catch(_){}},250);
window.FORMFX22=true;
})();
