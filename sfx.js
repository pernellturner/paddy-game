// ===================== SOUND EFFECTS (ElevenLabs set, assets/sfx) =====================
// WebAudio, unlocked on the first tap/key (iOS), small files preloaded after that, big ones fetched in idle time or on first use.
// Hooks: hits (per-form swipe/element + combo ticks/stingers/announcer), moves (act), form change, hurt/KO, critters, moon launch.
(function(){
const DIR='assets/sfx/',V='?v=33';
const SM=new Set();// keys known to exist (from manifest)
let M=[],ac=null,master=null,unlocked=false;const BUF={},LOADING={},LAST={};
const S=window.SND={on:true,vol:.8,ready:false};
try{const v=localStorage.getItem('paddySfxVol');if(v!=null&&isFinite(+v))S.vol=Math.max(0,Math.min(1,+v));
 // v21: sound defaults ON - clear an old saved mute / zero volume once
 if(localStorage.getItem('paddySnd21')!=='1'){localStorage.setItem('paddySnd21','1');if(S.vol<.05)S.vol=.8;localStorage.setItem('paddySfxVol',String(S.vol));localStorage.setItem('paddyMute','0');try{muted=false}catch(_){}}}catch(_){}
function ctx(){if(!ac){const ACx=window.AudioContext||window.webkitAudioContext;if(!ACx)return null;ac=new ACx();master=ac.createGain();master.gain.value=S.vol;master.connect(ac.destination);
 try{if(typeof AC!=='undefined'&&!AC)AC=ac}catch(_){} }return ac}// share one context with the game's synth sounds
// iPhone silent switch: Web Audio is muted by the ring/silent switch unless the page's audio session is 'playback'.
// iOS 17+: navigator.audioSession; older iOS: a silent looping <audio> element switches the session to playback.
let SIL=null;function silentAudio(){try{if(navigator.audioSession&&navigator.audioSession.type!=='playback')navigator.audioSession.type='playback'}catch(_){}
 try{if(!SIL){SIL=document.createElement('audio');SIL.src=DIR+'silence.mp3'+V;SIL.loop=true;SIL.preload='auto';SIL.setAttribute('playsinline','');SIL.setAttribute('webkit-playsinline','');SIL.setAttribute('x-webkit-airplay','deny')}
 if(SIL.paused&&!document.hidden){const pr=SIL.play();if(pr&&pr.catch)pr.catch(()=>{})}}catch(_){}}
// iOS only counts touchEND / pointerup / click as a user gesture, so keep retrying on every gesture until the context really runs
function kick(c){try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(_){}}
function unlock(){const c=ctx();if(!c)return;silentAudio();
 if(c.state!=='running'){kick(c);try{const pr=c.resume();if(pr&&pr.then)pr.then(()=>{if(c.state==='running')ok()}).catch(()=>{})}catch(_){}}
 try{if(typeof AC!=='undefined'&&AC&&AC!==c&&AC.state!=='running')AC.resume()}catch(_){}
 if(c.state==='running')ok()}
function ok(){if(!unlocked){unlocked=true;S.unlocked=true;preload()}}
['touchend','pointerup','click','keydown','touchstart','pointerdown'].forEach(e=>addEventListener(e,unlock,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden){try{SIL&&SIL.pause()}catch(_){}}else if(ac&&unlocked){ac.resume();silentAudio()}});
addEventListener('pageshow',()=>{if(ac&&unlocked)ac.resume()});
function load(k){if(BUF[k]||LOADING[k]||!SM.has(k))return LOADING[k];const c=ctx();if(!c)return;
 LOADING[k]=fetch(DIR+k+'.mp3'+V).then(r=>r.arrayBuffer()).then(a=>new Promise((ok,no)=>c.decodeAudioData(a,ok,no))).then(b=>{BUF[k]=b;return b}).catch(()=>{});return LOADING[k]}
function preload(){if(!M.length)return;const LZ=['form','vo_form'];M=M.filter(m=>!LZ.includes(m.category)).concat(M.filter(m=>LZ.includes(m.category)).map(m=>Object.assign({},m,{skip:1})));const small=M.filter(m=>!m.skip&&m.bytes<=13000&&m.category!=='voice').map(m=>m.key),big=M.filter(m=>!m.skip&&!small.includes(m.key)).map(m=>m.key);
 let i=0;const step=()=>{const k=small[i++];if(!k){setTimeout(()=>idleBig(big),4000);return}Promise.resolve(load(k)).then(()=>setTimeout(step,15))};step()}
function idleBig(list){let i=0;const step=()=>{const k=list[i++];if(!k)return;Promise.resolve(load(k)).then(()=>setTimeout(step,120))};(window.requestIdleCallback||setTimeout)(step)}
fetch(DIR+'manifest.json'+V).then(r=>r.json()).then(m=>{M=m.sounds||[];M.forEach(x=>SM.add(x.key));S.ready=true;if(unlocked)preload()}).catch(()=>{});
const isMuted=()=>{try{return typeof muted!=='undefined'&&muted}catch(_){return false}};
// play(key,{v:volume 0-1, r:playbackRate, gap:min seconds between repeats})
S.play=function(k,o){o=o||{};if(!S.on||isMuted()||!SM.has(k))return;const c=ctx();if(!c)return;if(c.state!=='running'){try{c.resume()}catch(_){}if(!unlocked)return}
 const t=c.currentTime,g=o.gap??.05;if(LAST[k]&&t-LAST[k]<g)return;LAST[k]=t;
 const go=b=>{if(!b)return;try{const s=c.createBufferSource(),gn=c.createGain();s.buffer=b;s.playbackRate.value=o.r||1;gn.gain.value=o.v??1;s.connect(gn);gn.connect(master);s.start(0)}catch(_){}};
 if(BUF[k])go(BUF[k]);else{const pr=load(k);if(pr&&!o.noLate)pr.then(b=>{if(c.currentTime-t<.25)go(b)})}};
S.dbg=()=>({state:ac&&ac.state,unlocked,bufs:Object.keys(BUF).length,known:SM.size,vol:S.vol,on:S.on,muted:isMuted(),sil:!!SIL&&!SIL.paused,silErr:SIL&&SIL.error&&SIL.error.code,shared:(()=>{try{return AC===ac}catch(_){return 'n/a'}})()});
S.load=k=>load(k);S.has=k=>SM.has(k);S.ac=()=>ctx();S.out=()=>master;S.isMuted=isMuted;
S.setVol=v=>{S.vol=Math.max(0,Math.min(1,v));if(master)master.gain.value=S.vol;try{localStorage.setItem('paddySfxVol',String(S.vol))}catch(_){}};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
// ---------- per-form sound palette ----------
// FORM(): 0 Kitty 1 Ninja 2 Samurai 3 Knight 4 Pirate 5 Gunslinger 6 Light 7 Power Blade 8 Crimson 9 Reaper 10 Shade 11 Storm 12 Dragon 13 Phoenix 14 Frost 15 Mecha 16 Tide 17 Chrono 18 Beast 19+ Dark Side
const SWIPE=['claw_swipe_1','claw_swipe_2','claw_swipe_3'];
const PAL={0:{hit:SWIPE},1:{hit:SWIPE,r:1.15},2:{hit:['blade_slash'],r:1},3:{hit:['blade_slash','sword_clang'],r:.9},4:{hit:['blade_slash'],r:1.05},
 5:{hit:['gun_pop']},6:{hit:['blade_slash'],r:1.2},7:{hit:['blade_slash'],r:.85,el:'lightning'},8:{hit:['blade_slash'],r:1.1},9:{hit:['blade_slash'],r:.8},10:{hit:SWIPE,r:1.25},
 11:{hit:['claw_heavy'],el:'lightning'},12:{hit:['blade_slash'],el:'fire_whoosh'},13:{hit:SWIPE,el:'fire_whoosh'},14:{hit:['blade_slash'],el:'ice_crack'},15:{hit:['mecha_servo'],el:'mecha_laser'},
 16:{hit:['blade_slash'],el:'water_wave'},17:{hit:SWIPE,el:'time_stop'},18:{hit:SWIPE,el:'beast_roar'},19:{hit:['blade_slash'],r:.8,el:'force_lightning'}};
const fNow=()=>{try{return FORM()}catch(_){return 0}};
// move-keyed specials (KB names) -> sound
const MOVE=[[/^(mbolt|nstorm)/,'lightning'],[/^mfire/,'fire_whoosh'],[/^mice/,'ice_crack'],[/^mrocket/,'mecha_laser'],[/^mwater|^uwave/,'water_wave'],[/^mtime/,'time_stop'],[/^mroar/,'beast_roar'],
 [/^mdragon/,'fire_whoosh'],[/^(ucannon|picannon|pcannon|cannon)/,'cannon'],[/^(ushot|ubig)/,'gun_pop'],[/^upush/,'force_push'],[/^(uquake|uslam|slam|hardland|ubuster)/,'ground_slam'],
 [/^(ulaunch|uppercut|uupper|slaunch|launch|knlaunch)/,'launcher_uppercut'],[/tail/,'tail_whip'],[/^(ufinal|mbig|mresume)/,'ult_explosion'],[/^dforce|^dlight/,'force_lightning'],[/^dpush/,'force_push'],[/^dblade/,'blade_boomerang']];
// ---------- combo ticks / stingers / announcer (manifest thresholds) ----------
const TIER=n=>n>=50?6:n>=35?5:n>=20?4:n>=10?3:n>=5?2:1;
const STING={5:'combo_stinger_5',10:'combo_stinger_10',20:'combo_stinger_20',35:'combo_stinger_35',50:'combo_stinger_50',100:'combo_stinger_100'};
const VO={5:'vo_nice',10:'vo_great',20:'vo_awesome',35:'vo_purrfect',50:'vo_insane',75:'vo_unstoppable',100:'vo_godlike'};
function comboSound(n){S.play('combo_tick_'+TIER(n),{v:.55,gap:.03});if(STING[n])S.play(STING[n],{v:.8});if(VO[n])setTimeout(()=>S.play(VO[n],{v:1}),STING[n]?220:0)}
S.combo=comboSound;
// v30: base Paddy has 3 clear hit tiers: SMALL (jabs, swipes), POWER (power punch, launchers, counters, tail launcher), DEADLY (finisher hits)
const T_DEADLY=/^(nj_fin|kt_fin|sm_fin|bunnylaunch|airfin|spike|finisher|pc8|tailslam|twister|cyclonefin|morphstrike)/,T_POWER=/^(nj_h|nj_launch|nj_counter|nj_a3|kt_h|kt_launch|kt_counter|kt_a3|sm_h|sm_launch|sm_counter|sm_a3|bxrb|bxp|pc3|pcup|kcounter|uppercut|dashstrike|tail3|launch|slam|airup|pc6|pc7|bunnygrab|hardland|swat)/;
S.tier=function(move){const mv=String(move||'');return T_DEADLY.test(mv)?3:T_POWER.test(mv)?2:1};S.tierLog=[];
function tierSound(d,mv){const t=S.tier(mv);S.tierLog.push(t);if(S.tierLog.length>40)S.tierLog.shift();
 if(t===3){S.play('hit_deadly',{v:1,gap:.25});S.play('ground_slam',{v:.45,gap:.3})}
 else if(t===2){S.play(rnd(['hit_power','hit_power2']),{v:.95,r:.95+Math.random()*.1,gap:.07});S.play('claw_heavy',{v:.35,gap:.07})}
 else{S.play(rnd(['hit_small','hit_small2']),{v:.85,r:.92+Math.random()*.18,gap:.035});S.play(rnd(SWIPE),{v:.3,r:1.1,gap:.04})}
 const air=d&&d.y<(typeof GROUND!=='undefined'?GROUND-25:9e9);if(air&&t<3)S.play(rnd(['juggle_hit_1','juggle_hit_2']),{v:.45,gap:.06})}
function hitSound(d,move){const f=fNow(),P=PAL[f]||PAL[0],mv=String(move||'');let special=null;
 if((f===0||/^(nj|kt|sm)_/.test(mv))&&SM.has('hit_small')){tierSound(d,mv);for(const [re,k] of MOVE)if(re.test(mv)){S.play(k,{v:.5,gap:.09});break}if(d&&!d.cr&&Math.random()<.3)S.play('dog_yelp',{v:.55,gap:.5});return}
for(const [re,k] of MOVE)if(re.test(mv)){special=k;break}
 if(special)S.play(special,{v:.9,gap:.09});else S.play(rnd(P.hit),{v:.75,r:(P.r||1)*(.95+Math.random()*.1),gap:.04});
 const air=d&&d.y<(typeof GROUND!=='undefined'?GROUND-25:9e9);if(air)S.play(rnd(['juggle_hit_1','juggle_hit_2']),{v:.6,gap:.06});
 if(d&&!d.cr&&Math.random()<.35)S.play('dog_yelp',{v:.6,gap:.5})}
// ---------- hook the game ----------
function hook(){if(typeof hitDummy!=='function'||typeof act!=='function'){setTimeout(hook,200);return}
 const _hd=hitDummy;hitDummy=function(d,move,dir){const n0=C.n;const r=_hd.apply(this,arguments);try{hitSound(d,move);if(C.n>n0)comboSound(C.n)}catch(_){}return r};
 const _act=act;act=function(state,anim,o){try{actSound(state)}catch(_){}return _act.apply(this,arguments)};
 if(typeof setForm==='function'){const _sf=setForm;setForm=function(f){const f0=fNow(),r=_sf.apply(this,arguments);if(fNow()!==f0)S.play('form_transform',{v:.7,gap:.3});return r}}
 if(typeof loseLife==='function'){const _ll=loseLife;loseLife=function(){S.play('paddy_ko');return _ll.apply(this,arguments)}}
 if(typeof victory==='function'){const _v=victory;victory=function(){S.play('paddy_victory',{v:.8,gap:2});return _v.apply(this,arguments)}}
 // the old synth meow/boom stay as a fallback until the samples are in
 if(typeof meowSound==='function'){const _m=meowSound;meowSound=function(pw){if(BUF.paddy_meow_attack&&unlocked&&!isMuted()){S.play(pw>.6?'paddy_meow_roar':'paddy_meow_attack',{gap:.15});return}return _m.apply(this,arguments)}}
 if(typeof boom==='function'){const _b=boom;boom=function(){if(BUF.ult_explosion&&unlocked&&!isMuted()){S.play('ult_explosion',{v:.85,gap:.3});return}return _b.apply(this,arguments)}}}
const ACT={jump:'paddy_jump',djump:'paddy_double_jump',dash:'paddy_dash',ndash:'paddy_dash',wingdash:'paddy_dash',dashstrike:'paddy_dash',hurt:'paddy_hurt_meow',land:null,hardland:'paddy_land',
 wallrun:'paddy_wall_cling',ledge:'paddy_wall_cling',hiss:'cat_hiss',tailwhip:'tail_whip',utail:'tail_whip',kntail:'tail_whip',pitail:'tail_whip',lkult:'ult_charge',
 picannon:'cannon',piroll:'paddy_dash',ublink:'paddy_dash',nstep:'paddy_dash',slide:'paddy_dash',superleap:'paddy_double_jump',victory:null,ulaunch:'launcher_uppercut',uppercut:'launcher_uppercut',slaunch:'launcher_uppercut',
 knshout:'paddy_meow_roar',umeow:null,nstorm:'lightning',nthrow:'blade_boomerang',knrush:'paddy_dash',sparry:'sword_clang',knriposte:'sword_clang',sriposte:'sword_clang'};
function actSound(st){const k=ACT[st];if(k)S.play(k,{v:.75,gap:.12})}
// jumps go through press(), not act(): watch p.vy / p.jumps
let pj=0,pg=true;setInterval(()=>{try{if(typeof p==='undefined')return;if(p.jumps>pj&&p.vy<-200)S.play(p.jumps>1?'paddy_double_jump':'paddy_jump',{v:.6,gap:.12});if(!pg&&p.ground&&p.state!=='hardland')S.play('paddy_land',{v:.45,gap:.25});pj=p.jumps;pg=p.ground}catch(_){}},33);
// ---------- critters ----------
const CR={sausage:'dog_bark',chihuahua:'dog_bark',bulldog:'bruno_bark',husky:'dog_bark',labrador:'dog_bark',poodle:'dog_bark',alleytom:'cat_hiss',persian:'cat_hiss',siamese:'cat_hiss',tabby:'cat_hiss',
 seagull:'seagull_squawk',magpie:'magpie_warble',pukeko:'pukeko_squawk',hedgehog:'hedgehog_huff',possum:'possum_hiss',goose:'goose_honk',rooster:'pukeko_squawk',crab:'crab_click',rat:'cat_hiss',ferret:'hedgehog_huff',wasp:'mecha_servo',eel:'lightning',weta:'crab_click'};
S.critter=function(id,st){if(st==='ko'){S.play('enemy_hit_poof',{v:.8,gap:.08});return}if(st==='air'){S.play('dog_yelp',{v:.45,r:1.3,gap:.3});return}
 const k=CR[id];if(k)S.play(k,{v:.6,r:id==='chihuahua'?1.35:id==='rat'?1.6:1,gap:.4})};
S.moon=function(){S.play('moon_rocket_launch',{v:.9,gap:1});setTimeout(()=>S.play('moon_ding',{v:1,gap:1}),2600)};
hook();
})();
