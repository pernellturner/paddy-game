// ===================== MISSION REWARDS = FORM UNLOCKS (level-1-1 branch, local only) =====================
// Story rule: when Paddy completes a world's mission (W2 stray kitten, W3 ducklings, W4 penguin chick, ...), the grateful animal
// gives him a gift that unlocks a form. This sits next to the EXP / K.O. / ultimate unlocks (UNLK / UNL in game.js) and uses the
// same save (localStorage 'paddyLegends'): a mission unlock is just another way into UNL.d.got, the EXP unlocks are unchanged.
// Data-driven: MISSION_GIFTS maps missionId -> {gift, formKey, [animal], [world], [txt]}.
//   formKey = the form's UF prefix ('gs','lp','pb','cb','sr', ...), its UF name ('CRIMSON BLADE') or its UF index (1..).
//   EMPTY ON PURPOSE: Story Studio is sending the list. Example of an entry once it arrives:
//     w2_kitten:{gift:'a tiny bell',formKey:'gs',animal:'stray kitten',world:2}
// API:  missionComplete(id)  -> records the mission in the save, unlocks the gift's form, shows the gift popup. Returns
//                               {ok, id, gift, formKey, u, first} (first = false when the mission was already done; no repeat popup).
//       MISSION.done(id), MISSION.list(), MISSION.showGift(info, done)  <- placeholder popup; Story Studio's cutscene replaces it:
//       MISSION.showGift=function(info,done){ ...play the cutscene...; done() }
// Works in the main game (UNL / UF / buildList from game.js) and in the standalone level runtime (level.html, no game.js): there the
// unlock is saved as pending (d.mformsPending) and the game turns it into the real form unlock the next time it loads.
(function(){
const MISSION_GIFTS=window.MISSION_GIFTS=window.MISSION_GIFTS||{};   // missionId -> {gift, formKey}  (filled in by Story Studio)
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
window.missionComplete=id=>MISSION.complete(id);
MISSION.sync();
})();
