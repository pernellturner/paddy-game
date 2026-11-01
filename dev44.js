// ===================== v44b: DEV TEST MODE (Pernell, 1 Nov) =====================
// While DEV_MODE is true, the free-play modes on the title (▶ PLAY, 🥋 PRACTICE, 🥊 PRACTICE ROOM) have EVERY form unlocked
// and the title says so: "🛠 DEV TEST (all forms)". Nothing is written to any save, so turning it off leaves no trace.
// 🌳 PLAY WORLD 1 is the story (level.html, its own 'paddyStory' save) and is NOT affected: there every form starts locked.
// To remove: set DEV_MODE=false below (or delete this file and its <script> line in index.html).
window.DEV_MODE=true;
(function(){if(!window.DEV_MODE||typeof UNL==='undefined')return;
 UNL.ok=function(u){return true};                                   // every Legend + Mythic + Golden Fury, in memory only (never saved)
 const css=document.createElement('style');css.textContent=`#sdev{position:fixed;top:max(6px,env(safe-area-inset-top));left:max(8px,env(safe-area-inset-left));z-index:5;font:700 clamp(10px,3.2vh,14px) system-ui;color:#fff;background:#0009;border:2px dashed #ffd84a;border-radius:999px;padding:.15em .9em;letter-spacing:.5px;white-space:nowrap}
#sdev b{color:#ffd84a}`;document.head.appendChild(css);
 const add=()=>{const box=document.getElementById('sbtns');if(!box||document.getElementById('sdev'))return!!box;const t=document.createElement('div');t.id='sdev';
  t.innerHTML='<b>🛠 DEV TEST (all forms)</b>';t.title='PLAY · PRACTICE · PRACTICE ROOM have every form. 🌳 PLAY WORLD 1 is the story: every form starts locked.';document.getElementById("story").appendChild(t);
  for(const id of ['splay','sprac','sproom']){const b=document.getElementById(id);if(b)b.title='🛠 DEV TEST (all forms)'}return true};
 if(!add()){const iv=setInterval(()=>{if(add())clearInterval(iv)},300);setTimeout(()=>clearInterval(iv),15000)}
 window.DEVTEST={on:true}})();
