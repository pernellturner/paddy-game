// ===================== MISSION REWARDS = FORM UNLOCKS (level-1-1 branch, local only) =====================
// Story rule: when Paddy completes a world's mission (W2 stray kitten, W3 ducklings, W4 penguin chick, ...), the grateful animal
// gives him a gift that unlocks a form. This sits next to the EXP / K.O. / ultimate unlocks (UNLK / UNL in game.js) and uses the
// same save (localStorage 'paddyLegends'): a mission unlock is just another way into UNL.d.got, the EXP unlocks are unchanged.
// Data-driven: MISSION_GIFTS maps missionId -> {gift, formKey, [animal], [world], [txt]}.
//   formKey = the form's UF prefix ('gs','lp','pb','cb','sr', ...), its UF name ('CRIMSON BLADE') or its UF index (1..).
//   Filled in from Story Studio's list (W2-W7, below).
// API:  missionComplete(id)  -> records the mission in the save, unlocks the gift's form, shows the gift popup. Returns
//                               {ok, id, gift, formKey, u, first} (first = false when the mission was already done; no repeat popup).
//       MISSION.done(id), MISSION.list(), MISSION.showGift(info, done)  <- placeholder popup; Story Studio's cutscene replaces it:
//       MISSION.showGift=function(info,done){ ...play the cutscene...; done() }
// Works in the main game (UNL / UF / buildList from game.js) and in the standalone level runtime (level.html, no game.js): there the
// unlock is saved as pending (d.mformsPending) and the game turns it into the real form unlock the next time it loads.
(function(){
// Story Studio's list (FORMS-UNLOCK-PLAN.md v2.1: one gift form per world, W2-W7). formKey = the game's real UF prefix:
//   Light Paddy = 'lp' (UF 2) · Skybreaker = 'skb' (UF 16, skybreaker.js) · Power Blade = 'pb' (UF 3) · Neon Wraith = 'nwr' (UF 17, neonwraith.js)
//   Tidecaller = 'mtc' (UF 12, mythic) · Phoenix = 'mph' (UF 9, mythic). All six exist in the game today (none missing).
// A page can still pre-set window.MISSION_GIFTS (tests do): its entries are merged over these.
const GIFTS={
 'w2-stray':    {world:2,place:'Millwater', animal:'stray kitten Pip',          gift:"Pip's Bell",       form:'Light Paddy', formKey:'lp', tier:'Legend', txt:'help Pip the stray kitten (W2 Millwater mission)'},
 'w3-ducklings':{world:3,place:'Milldale',  animal:'mother duck',               gift:'Duck Feather',     form:'Skybreaker',  formKey:'skb',tier:'Legend', txt:"save the mother duck's ducklings (W3 Milldale mission)"},
 'w4-penguin':  {world:4,place:'Hatfields', animal:'penguin chick',             gift:'Blade Shell',      form:'Power Blade', formKey:'pb', tier:'Legend', txt:'help the penguin chick (W4 Hatfields mission)'},
 'w5-puppy':    {world:5,place:'Ōrewa',     animal:'puppy Biscuit',             gift:'Glow Collar Tag',  form:'Neon Wraith', formKey:'nwr',tier:'Legend', txt:'help Biscuit the puppy (W5 Ōrewa mission)'},
 'w6-olddog':   {world:6,place:'Red Beach', animal:'old dog Captain',           gift:'Pāua Shell',       form:'Tidecaller',  formKey:'mtc',tier:'Mythic', txt:'help Captain the old dog (W6 Red Beach mission)'},
 'w7-ruru':     {world:7,place:'Arkles Bay',animal:'ruru (morepork) chick',     gift:'Ruru Feather',     form:'Phoenix',     formKey:'mph',tier:'Mythic', txt:'save the ruru chick (W7 Arkles Bay mission)'}};
const MISSION_GIFTS=window.MISSION_GIFTS=Object.assign(GIFTS,window.MISSION_GIFTS||{});   // missionId -> {gift, formKey, ...}
// ---- boss rewards: beating a level boss unlocks a form (recommended default; the EXP route stays too) ----
// Base forms are not UF forms: they are game.js FORM slots 0..4 (Kitty/base Paddy, Ninja, Samurai, Knight, Pirate) and are NOT locked in
// the game today, so a base-form reward is saved as d.baseGot (+ d.bossRewards) for story mode to read; game.js locking is still Pernell's call.
const BASE_FORMS={kitty:0,ninja:1,samurai:2,knight:3,pirate:4};
const BOSS_REWARDS=window.BOSS_REWARDS={big_bruno:{level:'silverdale_7',label:'1-7',boss:'Big Bruno',form:'ninja',base:1,exp:2500,card:'NEW FORM! Ninja',txt:'Beat Big Bruno in 1-7 (or earn 2,500 EXP)'}};
const KEY='paddyLegends';
const hasUNL=()=>typeof UNL!=='undefined'&&UNL&&UNL.d;
function data(){if(hasUNL())return UNL.d;try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return {}}}
function save(d){if(hasUNL()){UNL.save();return}try{localStorage.setItem(KEY,JSON.stringify(d))}catch(_){}}
function formIndex(fk){if(typeof fk==='number')return fk;if(typeof UF==='undefined'||!UF)return 0;const s=String(fk||'').toUpperCase();
 for(let u=1;u<UF.length;u++){const X=UF[u];if(X&&(String(X.pre).toUpperCase()===s||String(X.nm).toUpperCase()===s))return u}return 0}
function grant(d,fk){const u=formIndex(fk);d.got=d.got||[];
 if(u&&typeof UF!=='undefined'&&UF[u]){if(!d.got.includes(u))d.got.push(u);return u}
 d.mformsPending=d.mformsPending||[];if(!d.mformsPending.includes(fk))d.mformsPending.push(fk);return 0}   // no game.js here: unlock on next game load
// placeholder 'gift received' popup (plain DOM, so it works over either canvas); Story Studio's cutscene replaces MISSION.showGift
function showGift(info,done){const X=info.u&&typeof UF!=='undefined'?UF[info.u]:null;
 const el=document.createElement('div');el.id='giftpop';
 el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;background:#fff8e8;border:4px solid #ffb84d;border-radius:18px;padding:18px 26px;font:18px sans-serif;text-align:center;box-shadow:0 8px 40px #0008;color:#3a2a10;max-width:80vw';
 el.innerHTML=`<div style="font-size:34px">🎁</div><b>GIFT RECEIVED!</b><div style="margin:6px 0">${info.animal?('The grateful '+info.animal+' gives Paddy '):'Paddy receives '}<b>${info.gift||'a gift'}</b></div>`+
  `<div>${X?(X.ico+' '+X.nm+' UNLOCKED'):'New form unlocked: '+info.formKey}</div><div style="font-size:12px;opacity:.6;margin-top:8px">(placeholder · tap to close)</div>`;
 let closed=0;const close=()=>{if(closed++)return;el.remove();done&&done()};el.addEventListener('pointerdown',close);setTimeout(close,4000);document.body.appendChild(el)}
const MISSION=window.MISSION={GIFTS:MISSION_GIFTS,showGift,formIndex,log:[],
 done(id){const d=data();return !!(d.missions&&d.missions[id])},
 list(){const d=data();return Object.keys(d.missions||{})},
 complete(id){const g=MISSION_GIFTS[id];const d=data();d.missions=d.missions||{};const first=!d.missions[id];
  if(!g){if(first){d.missions[id]={t:Date.now()};save(d)}const r={ok:false,id,first,why:'no gift for this mission yet'};this.log.push(r);return r}
  if(first)d.missions[id]={t:Date.now(),gift:g.gift,formKey:g.formKey};
  const had=hasUNL()?UNL.has(formIndex(g.formKey)):false;const u=grant(d,g.formKey);save(d);
  const info={ok:true,id,gift:g.gift,formKey:g.formKey,animal:g.animal,u,first,newForm:!!u&&!had};this.log.push(info);
  if(first){try{MISSION.showGift(info,()=>{})}catch(e){console.warn('gift popup',e)}if(typeof buildList==='function')try{buildList()}catch(_){}}
  return info},
 // game.js side: forms won in the standalone level runtime are unlocked here (and the unlock text names the mission)
 sync(){if(!hasUNL()||typeof UF==='undefined')return;const d=UNL.d;let ch=0;
  if(d.mformsPending&&d.mformsPending.length){d.mformsPending=d.mformsPending.filter(fk=>{const u=formIndex(fk);if(u&&UF[u]){if(!d.got.includes(u))d.got.push(u);ch=1;return false}return true});}
  if(typeof UNLK!=='undefined')for(const id in MISSION_GIFTS){const g=MISSION_GIFTS[id],u=formIndex(g.formKey);if(u&&UNLK[u]&&!UNLK[u].mission){UNLK[u]=Object.assign({},UNLK[u],{mission:id,txt:UNLK[u].txt+' · or: '+(g.txt||('complete the '+(g.animal||id)+' mission'))})}}
  if(ch){UNL.save();if(typeof buildList==='function')try{buildList()}catch(_){}}}};
// bossReward(bossId,{quiet}) -> records the boss win and unlocks its reward form; quiet = a cutscene (W1-U03) shows the card instead
MISSION.BOSS_REWARDS=BOSS_REWARDS;MISSION.BASE_FORMS=BASE_FORMS;
MISSION.bossReward=function(id,o){const R=BOSS_REWARDS[id];const d=data();d.bossRewards=d.bossRewards||{};const first=!d.bossRewards[id];
 if(!R){const r={ok:false,id,first,why:'no reward for this boss'};this.log.push(r);return r}
 if(first)d.bossRewards[id]={t:Date.now(),form:R.form};let u=0;
 if(R.base!=null){d.baseGot=d.baseGot||[];if(!d.baseGot.includes(R.form))d.baseGot.push(R.form)}else u=grant(d,R.formKey);save(d);
 const info={ok:true,id,form:R.form,base:R.base,u,first,card:R.card,boss:R.boss};this.log.push(info);
 if(first&&!(o&&o.quiet)){const el=document.createElement('div');el.id='rewardpop';
  el.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;background:#2a1f4a;border:4px solid #ffe14d;border-radius:18px;padding:16px 26px;font:20px sans-serif;text-align:center;color:#ffe14d;box-shadow:0 8px 40px #0008';
  el.innerHTML='<b>⭐ '+R.card+'</b><div style="font-size:14px;color:#fff;margin-top:6px">'+R.boss+' beaten!</div>';let c=0;const close=()=>{if(c++)return;el.remove()};el.addEventListener('pointerdown',close);setTimeout(close,3500);document.body.appendChild(el)}
 return info};
// a base form counts as unlocked by its boss reward OR by the EXP route (BOSS_REWARDS[..].exp, e.g. Ninja at 2,500 EXP)
MISSION.baseUnlocked=function(name){const d=data();if(name==='kitty')return true;if((d.baseGot||[]).includes(name))return true;
 for(const k in BOSS_REWARDS){const R=BOSS_REWARDS[k];if(R.form===name&&R.exp&&(d.exp||0)>=R.exp)return true}return false};
// ---- secret paws: 10 per world, id 'w<n>-<k>' (level JSON entity {type:'secret_paw',id,x,y}); a full set is saved in d.pawSets ----
// (proposal: each full set unlocks an Awakened form; see /workspace/paddy-story/UNLOCK-TABLE-DRAFT.md. Only the save is built here.)
const PAWS_PER_WORLD=MISSION.PAWS_PER_WORLD=10;
MISSION.pawHas=id=>{const d=data();return !!(d.paws&&d.paws[id])};
MISSION.pawCount=w=>{const d=data();return Object.keys(d.paws||{}).filter(k=>k.startsWith('w'+w+'-')).length};
MISSION.pawCollect=function(id){const m=/^w(\d+)-(\d+)$/.exec(String(id||''));const d=data();d.paws=d.paws||{};const first=!d.paws[id];
 if(first)d.paws[id]=Date.now();const w=m?+m[1]:0,n=Object.keys(d.paws).filter(k=>k.startsWith('w'+w+'-')).length;let set=false;
 if(w&&n>=PAWS_PER_WORLD){d.pawSets=d.pawSets||[];if(!d.pawSets.includes(w)){d.pawSets.push(w);set=true}}save(d);
 const r={id,first,world:w,count:n,of:PAWS_PER_WORLD,set};this.log.push(r);return r};
window.bossReward=(id,o)=>MISSION.bossReward(id,o);
window.missionComplete=id=>MISSION.complete(id);
MISSION.sync();
addEventListener('load',()=>MISSION.sync());   // again once every script is in: skybreaker.js / neonwraith.js / darkside.js push their UF + UNLK after mission.js
})();
