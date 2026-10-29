// ===================== TOUCH CONTROLS v18 + TRAINING ROOM =====================
// One multi-touch controller for the whole screen (instead of per-button pointer events, which iOS Safari cancels
// when it thinks a touch is a scroll / edge-swipe, and which can't slide from ◀ to ▶):
//  • the left pad is a virtual d-pad: a thumb anywhere on it picks the nearest of ◀ ▶ ▼ and can slide between them
//  • action buttons have generous hit areas and stay held until that finger lifts
//  • every touch is reconciled against e.touches, and blur / background / pagehide / cancel release everything
//  • the page never scrolls, zooms or double-tap-zooms (touchstart/move are preventDefault'ed outside the menus)
(function(){
const ui=document.getElementById('ui');
const BTN=()=>[...document.querySelectorAll('#ui .b[data-k]')].filter(b=>b.offsetWidth>0);
const PAD=['left','right','down'];
// ---------- layout: big buttons sized to the screen, clear of the edges and the notch ----------
let SA={t:0,r:0,b:0,l:0};const probe=document.createElement('div');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.body.appendChild(probe);
function layout(){const cs=getComputedStyle(probe);SA={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0};
 const W=innerWidth,H=innerHeight,S=Math.round(Math.max(56,Math.min(86,H*.205,W*.085))),ml=Math.max(18,SA.l+10),mr=Math.max(18,SA.r+10),mb=Math.max(12,SA.b+6),mt=Math.max(6,SA.t+4);
 const put=(k,o)=>{const b=document.querySelector(`#ui .b[data-k="${k}"]`)||document.getElementById(k);if(!b)return;const z=Math.round(S*o.s);Object.assign(b.style,{width:z+'px',height:z+'px',fontSize:Math.round(Math.max(13,z*.24))+'px',left:o.l!=null?Math.round(o.l)+'px':'auto',right:o.r!=null?Math.round(o.r)+'px':'auto',bottom:o.b!=null?Math.round(o.b)+'px':'auto',top:o.t!=null?Math.round(o.t)+'px':'auto'})};
 // buttons are placed by their CENTRES (in units of S) so circles never touch, whatever the screen size
 const place=(k,d,cx,cy,side)=>{const b=document.querySelector(`#ui .b[data-k="${k}"]`);if(!b)return;const z=Math.round(S*d),o={s:d,b:mb+S*cy-z/2};if(side<0)o.l=ml+S*cx-z/2;else o.r=mr+S*cx-z/2;put(k,o)};
 place('left',1.1,.55,.72,-1);place('right',1.1,1.85,.72,-1);place('down',.88,1.2,1.85,-1);
 place('jump',1.2,.62,.92,1);place('attack',1.1,1.95,.6,1);place('special',.95,1.95,1.78,1);
 place('tail',.85,3.02,1.45,1);place('hunt',.8,3.06,.42,1);place('blink',.85,4.02,.95,1);
 // top row (small): morph · mute · ?
 const tz=Math.max(40,Math.min(50,H*.13)),tb=(id,i)=>{const b=document.querySelector(id);if(!b)return;Object.assign(b.style,{width:tz+'px',height:tz+'px',fontSize:Math.round(tz*.42)+'px',right:Math.round(mr-8+i*(tz+8))+'px',top:mt+'px',bottom:'auto',left:'auto'})};
 tb('#qbtn',0);tb('#ui .b[data-k=morph]',1);tb('#mute',2);
 const pc=document.getElementById('pclose');if(pc){pc.style.top=(mt+tz+8)+'px';pc.style.left=ml+'px'}
 rects=null}
let rects=null;function getRects(){if(rects)return rects;rects=BTN().map(b=>{const r=b.getBoundingClientRect();return {b,k:b.dataset.k,x:r.left+r.width/2,y:r.top+r.height/2,r:r.width/2}});return rects}
addEventListener('resize',()=>{layout()});addEventListener('orientationchange',()=>setTimeout(layout,300));layout();setTimeout(layout,500);
// ---------- multi-touch ----------
const T=new Map(),KC={};
function kDown(k){KC[k]=(KC[k]||0)+1;if(KC[k]===1){touchMode=true;press(k)}mark(k,true)}
function kUp(k){if(!KC[k])return;KC[k]--;if(KC[k]<=0){KC[k]=0;release(k);mark(k,false)}}
function mark(k,on){document.querySelectorAll(`#ui .b[data-k="${k}"]`).forEach(b=>b.classList.toggle('on',on))}
function padKey(x,y){const R=getRects().filter(q=>PAD.includes(q.k));let best=null,bd=1e9;for(const q of R){const d=Math.hypot(x-q.x,y-q.y)/(q.k==='down'?.85:1);if(d<bd){bd=d;best=q}}return best?best.k:null}
function inPad(x,y){const R=getRects().filter(q=>PAD.includes(q.k));if(!R.length)return false;const x0=Math.min(...R.map(q=>q.x-q.r))-26,x1=Math.max(...R.map(q=>q.x+q.r))+22,y0=Math.min(...R.map(q=>q.y-q.r))-26;return x>=0&&x<=x1&&y>=y0&&x>=x0-30}
function actKey(x,y){let best=null,bd=1e9;for(const q of getRects()){if(PAD.includes(q.k))continue;const d=Math.hypot(x-q.x,y-q.y),lim=q.r+Math.min(16,q.r*.3);if(d<lim&&d/q.r<bd){bd=d/q.r;best=q}}return best?best.k:null}
const passive=e=>!!(e.target&&e.target.closest&&e.target.closest('#moves,#fpick .scroll'));
const story=()=>document.body.classList.contains('story');
const ovOpen=()=>document.body.classList.contains('ov')||document.body.classList.contains('fp');
function sync(e){const live=new Set([...e.touches].map(t=>t.identifier));for(const [id,s] of T)if(!live.has(id)){if(s.k)kUp(s.k);T.delete(id)}}
function onStart(e){if(passive(e))return;const tapEl=e.target.closest&&e.target.closest('button,#qbtn,#mute,#pclose,.tap');
 if(tapEl&&!tapEl.matches('.b[data-k]')){e.preventDefault();for(const t of e.changedTouches)T.set(t.identifier,{tap:tapEl,x:t.clientX,y:t.clientY});return}
 if(story()||ovOpen()){if(e.cancelable)e.preventDefault();return}
 e.preventDefault();rects=null;
 for(const t of e.changedTouches){const x=t.clientX,y=t.clientY;let s;
  if(inPad(x,y)){s={pad:1,k:padKey(x,y)}}else{const k=actKey(x,y);s={k}}
  T.set(t.identifier,s);if(s.k)kDown(s.k)}}
function onMove(e){if(passive(e))return;if(e.cancelable)e.preventDefault();
 for(const t of e.changedTouches){const s=T.get(t.identifier);if(!s||!s.pad)continue;const k=padKey(t.clientX,t.clientY);if(k&&k!==s.k){if(s.k)kUp(s.k);s.k=k;kDown(k)}}}
function onEnd(e){for(const t of e.changedTouches){const s=T.get(t.identifier);if(!s)continue;T.delete(t.identifier);
  if(s.tap){const el=document.elementFromPoint(t.clientX,t.clientY);if(e.type==='touchend'&&el&&(el===s.tap||s.tap.contains(el))&&Math.hypot(t.clientX-s.x,t.clientY-s.y)<30){if(!['qbtn','mute','pclose'].includes(s.tap.id))s.tap.click()}continue}
  if(s.k)kUp(s.k)}
 sync(e);if(!passive(e)&&e.cancelable)e.preventDefault()}
document.addEventListener('touchstart',onStart,{passive:false});document.addEventListener('touchmove',onMove,{passive:false});
document.addEventListener('touchend',onEnd,{passive:false});document.addEventListener('touchcancel',onEnd,{passive:false});
// iOS: no pinch / double-tap zoom, no long-press callout
['gesturestart','gesturechange','gestureend'].forEach(n=>document.addEventListener(n,e=>e.preventDefault(),{passive:false}));
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});document.addEventListener('contextmenu',e=>{if(!passive(e))e.preventDefault()});
function reset(){for(const [id,s] of T)if(s.k)kUp(s.k);T.clear();for(const k in KC){if(KC[k]){KC[k]=0;release(k);mark(k,false)}}for(const k in K)K[k]=0;document.querySelectorAll('#ui .b.on').forEach(b=>b.classList.remove('on'))}
addEventListener('blur',reset);addEventListener('pagehide',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
// safety net: a key that's "held" with no finger, key or mouse behind it is let go
const kbd=new Set();addEventListener('keydown',e=>kbd.add(e.code),true);addEventListener('keyup',e=>kbd.delete(e.code),true);addEventListener('blur',()=>kbd.clear());
let mouseDown=false;addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')mouseDown=true},true);addEventListener('pointerup',e=>{if(e.pointerType==='mouse')mouseDown=false},true);
setInterval(()=>{if(T.size||kbd.size||mouseDown)return;for(const k of ['left','right','down','jump','attack','special','tail','hunt','blink','up','run'])if(K[k]&&!KC[k]){K[k]=0;mark(k,false)}},400);
window.CTRL={reset,layout,T,KC};
// ======================= TRAINING ROOM =======================
const css=document.createElement('style');css.textContent=`
#trbar{position:fixed;left:50%;transform:translateX(-50%);top:max(6px,env(safe-area-inset-top));z-index:3;display:none;gap:8px;align-items:center}
body.train #trbar{display:flex}body.train #lbl{display:none!important}
#trbar .tap{font:clamp(14px,4.2vh,20px) Bangers,Impact,sans-serif;letter-spacing:1px;color:#fff;border:2px solid #fff9;border-radius:999px;padding:.35em .9em;background:#2a3f78e6;white-space:nowrap;cursor:pointer}
#trbar .tap.pri{background:linear-gradient(#ffcf4a,#ff8a1a);border-color:#fff;color:#fff;text-shadow:0 2px 0 #9a3c00}
#trbar .nm{font:clamp(13px,3.8vh,18px) Bangers,Impact,sans-serif;color:#ffe14d;text-shadow:0 2px 0 #000a;letter-spacing:1px}
#mclose{position:fixed!important;top:max(10px,env(safe-area-inset-top))!important;right:max(14px,calc(env(safe-area-inset-right) + 10px))!important;z-index:7;min-width:48px;min-height:44px;box-shadow:0 2px 8px #0008}
#fpick{position:fixed;inset:0;z-index:6;display:none;background:#0b0820ee;color:#fff;font:14px system-ui}
body.fp #fpick{display:block}
#fpick .scroll{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:max(10px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 20px max(16px,env(safe-area-inset-left))}
#fpick h2{margin:2px 0 6px;font:26px Bangers,Impact,sans-serif;letter-spacing:1px;color:#ffe14d}
#fpick .tier{margin:8px 0 2px;font:18px Bangers,Impact,sans-serif;letter-spacing:1px}
#fpick .grid{display:flex;flex-wrap:wrap;gap:8px}
#fpick .f{min-width:118px;min-height:54px;flex:1 1 118px;max-width:200px;border-radius:14px;border:3px solid #fff4;background:#26355e;color:#fff;font:600 15px system-ui;display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer}
#fpick .f .i{font-size:26px}#fpick .f.cur{border-color:#ffe14d;background:#4a3d16}
#fpick .x{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));font:22px Bangers,Impact,sans-serif;background:#c03a3a;color:#fff;border:0;border-radius:999px;padding:6px 16px;z-index:7}`;
document.head.appendChild(css);
const bar=document.createElement('div');bar.id='trbar';bar.innerHTML='<span class="nm">🥋 TRAINING ROOM</span><button class="tap pri" id="tforms">🔄 FORMS</button><button class="tap" id="tmoves">📜 MOVES</button><button class="tap" id="texit">✕ EXIT</button>';document.body.appendChild(bar);
const fp=document.createElement('div');fp.id='fpick';document.body.appendChild(fp);
function forms(){const base=[['🐱','KITTY'],['🥷','NEON NINJA'],['⚔️','SAMURAI'],['🛡️','KNIGHT'],['⚓','PIRATE']].map((x,i)=>({f:i,ico:x[0],nm:x[1],tier:i<2?0:1}));
 const ext=[];for(let u=1;u<UF.length;u++)ext.push({f:4+u,ico:UF[u].ico,nm:UF[u].nm,tier:u<=6?2:3});return base.concat(ext)}
const TIERS=[['🐱 ALLEY CAT','#ffe08a'],['🗡️ PROWLER','#ff9a6b'],['⭐ LEGEND','#9fe8ff'],['🐉 MYTHIC','#ff7ce0']];
function buildPicker(){const L=forms(),cur=FORM();let h='<div class="scroll"><h2>🔄 PICK A FORM — practise any of them</h2>';
 TIERS.forEach((t,i)=>{h+=`<div class="tier" style="color:${t[1]}">${t[0]}</div><div class="grid">`+L.filter(x=>x.tier===i).map(x=>`<button class="f tap${x.f===cur?' cur':''}" data-f="${x.f}"><span class="i">${x.ico}</span>${x.nm}</button>`).join('')+'</div>'});
 h+='</div><button class="x tap" id="fpx">✕ CLOSE</button>';fp.innerHTML=h;
 fp.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();pick(+b.dataset.f)}));fp.querySelector('#fpx').addEventListener('click',e=>{e.preventDefault();closePicker()})}
function openPicker(){reset();buildPicker();document.body.classList.add('fp')}
function closePicker(){document.body.classList.remove('fp');reset()}
function pick(f){if(window.UNLx){UNLx.d.tryAll=true;UNLx.d.tryMyth=true}closePicker();const go=()=>{if(FORM()!==f)setForm(f,true)};
 if(['normal','land','idle'].includes(p.state)||true)go();setTimeout(()=>{if(FORM()!==f)go()},700);
 const x=forms().find(q=>q.f===f);if(x)card(`${x.ico} ${x.nm}`,'try the moves! (📜 MOVES shows the list)','#ffe14d')}
function openMoves(){if(typeof ov==='function')ov(true);else document.body.classList.add('ov');const f=FORM();
 // the list can be rebuilt right after opening, so find the tab fresh each time
 const go=()=>{const t=document.querySelector(`#clist .tab[data-tab="${f}"]`),m=document.getElementById('moves');if(!t||!m)return;
  document.querySelectorAll('#clist .tab').forEach(b=>b.style.outline=b===t?'3px solid #ffe14d':'');
  const tb=document.querySelector(`#clist table.ctab[data-f="${f}"]`);if(!tb||tb.style.display==='none')t.click();m.scrollTop+=t.parentElement.getBoundingClientRect().top-8};
 go();requestAnimationFrame(go);setTimeout(go,150)}
const TR={on:false,ids:['sausage','alleytom','seagull'],t:0};
function trainOpen(){if(window.ENW){ENW.stop();}clearTrain();TR.on=true;document.body.classList.add('train');if(window.UNLx){UNLx.d.tryAll=true;UNLx.d.tryMyth=true}
 const b=dummies.find(d=>!d.cr);if(b){b.benched=true;b.alive=false;b.bub=null}
 if(window.ENW)ENW.need(TR.ids);p.hp=Math.max(p.hp,3);card('🥋 TRAINING ROOM','dummies don\'t fight back — 🔄 FORMS to try every form','#ffe14d');setTimeout(()=>{if(TR.on&&!document.body.classList.contains('fp'))openPicker()},1400)}
function clearTrain(){for(let i=dummies.length-1;i>=0;i--)if(dummies[i].train)dummies.splice(i,1)}
function trainClose(){TR.on=false;clearTrain();document.body.classList.remove('train','fp');const b=dummies.find(d=>!d.cr);if(b&&b.benched){b.benched=false;b.alive=true;b.hp=b.max;b.x=b.home;b.y=GROUND;dSet(b,'idle','r_idle')}reset();if(window.STORY&&STORY.title)STORY.title()}
function trainTick(){if(!TR.on||!window.ENW)return;const live=dummies.filter(d=>d.train&&!d.gone);
 if(live.length<TR.ids.length&&(TR.t-=1/60)<=0){const have=new Set(live.map(d=>d.cr));const id=TR.ids.find(i=>!have.has(i));if(id&&ENW.loaded(id)){const xs=[LW+230,WALL_X-150,VW/2+60];const d=ENW.spawn(id,xs[TR.ids.indexOf(id)],{drop:true});if(d){d.train=true;d.hp=d.max=30;d.hpShow=30}}TR.t=.8}
 for(const d of live){d.cool=99;if(d.st==='wind'||d.st==='atk'){d.st='idle'}}}
const _ud=updDummies;updDummies=function(dt){trainTick();_ud(dt)};
document.getElementById('tforms').addEventListener('click',e=>{e.preventDefault();openPicker()});
document.getElementById('tmoves').addEventListener('click',e=>{e.preventDefault();openMoves()});
document.getElementById('texit').addEventListener('click',e=>{e.preventDefault();trainClose()});
addEventListener('keydown',e=>{if(document.body.classList.contains('fp')&&e.key==='Escape')closePicker()});
(function(){const h=document.querySelector('#moves .box h2');if(!h)return;const b=document.createElement('button');b.id='mtrain';b.textContent='🥋 TRAINING ROOM — try every form';b.style.cssText='display:block;margin:6px 0 8px;font:18px Bangers,Impact,sans-serif;letter-spacing:1px;color:#fff;background:linear-gradient(#7af0a0,#1aa35a);border:0;border-radius:999px;padding:8px 18px;min-height:44px;cursor:pointer';b.addEventListener('click',e=>{e.preventDefault();if(typeof ov==='function')ov(false);document.body.classList.remove('story');if(window.STORY&&STORY.mode!=='off'&&window.STORYPAUSE){window.STORYPAUSE=false;STORY.mode='off'}trainOpen()});h.after(b)})();
window.TRAIN={moves:openMoves,open:trainOpen,close:trainClose,picker:openPicker,pick,forms,TR};
if(/[?&]train/.test(location.search)){const go=()=>{if(typeof started!=='undefined'&&started&&window.ENW)trainOpen();else setTimeout(go,300)};go()}
})();
