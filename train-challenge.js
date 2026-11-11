// Practice Room training challenges. One move or combo at a time.
// Story mode never loads this file.
(function(){
if(typeof update!=='function'||typeof drawHUD!=='function') return;
const KEY='paddyTrainBest';
const LIST=[
  {lv:1, name:'Jump', do:'Jump', steps:['jump'], keys:[['up','Up']]},
  {lv:1, name:'Crouch', do:'Crouch', steps:['crouch'], keys:[['down','Down']]},
  {lv:1, name:'Jab', do:'Jab', steps:['jab'], keys:[['attack','Claw']]},
  {lv:2, name:'One-two', do:'Jab, Cross', steps:['jab','cross'], keys:[['attack','Claw'],['attack','Claw']]},
  {lv:3, name:'The combo', do:'Jab, Cross, Hook', steps:['jab','cross','hook'], keys:[['attack','Claw'],['attack','Claw'],['attack','Claw']]},
  {lv:4, name:'Body shot', do:'Body shot', steps:['body'], keys:[['down','Down'],['attack','Claw']]},
  {lv:4, name:'Uppercut', do:'Uppercut', steps:['upper'], keys:[['up','Up'],['attack','Claw']]},
  {lv:5, name:'Pounce', do:'Pounce', steps:['pounce'], keys:[['special','Pounce']]},
  {lv:5, name:'Shadow Pounce', do:'Shadow Pounce', steps:['shadow'], keys:[['special','Hold Pounce']]},
  {lv:6, name:'Tail whip', do:'Tail whip', steps:['tail'], keys:[['tail','Tail']]},
  {lv:6, name:'Blink', do:'Blink', steps:['blink'], keys:[['blink','Blink']]},
  {lv:7, name:'Double jump', do:'Double jump', steps:['jump','djump'], keys:[['up','Up'],['up','Up again']]},
  {lv:7, name:'Sky pounce', do:'Sky pounce', steps:['skypounce'], keys:[['up','Up'],['up','Up']]},
  {lv:8, name:'Pounce then jab', do:'Pounce, then Jab', steps:['pounce','jab'], keys:[['special','Pounce'],['attack','Claw']]},
  {lv:9, name:'On time', do:'Jab, Cross, Hook, Uppercut', steps:['jab','cross','hook','upper'], timed:1, keys:[['attack','Claw'],['attack','Claw'],['attack','Claw'],['up','Up'],['attack','Claw']]},
  {lv:10, name:'The big mix', do:'Jump, Pounce, Jab, Cross', steps:['jump','pounce','jab','cross'], keys:[['up','Up'],['special','Pounce'],['attack','Claw'],['attack','Claw']]}
];
const PUNCH={bxj1:'jab',bxj2:'jab',bxx:'cross',bxlh:'hook',bxsu:'upper',bxrb:'body',bxpu:'launcher'};
const TC=window.TC={on:false, i:0, at:0, best:0, nice:0, cleared:false, hold:false};
try{TC.best=Math.max(0, parseInt(localStorage.getItem(KEY)||'0',10)||0)}catch(e){}
let seen={str:0, ground:true, state:'', anim:'', blink:0, at:0};
let card=null, moves=null, niceEl=null;

function cur(){return LIST[Math.min(TC.i, LIST.length-1)]}
function total(){return LIST.length}
function save(){try{localStorage.setItem(KEY, String(TC.best||0))}catch(e){}}
function cheer(){
  try{if(window.SND&&SND.play) SND.play('ui_select',{v:.8})}catch(e){}
  try{if(typeof say==='function') say('Nice!','#ffe14d',true)}catch(e){}
  TC.nice=performance.now();
  if(niceEl){niceEl.hidden=false; clearTimeout(cheer.t); cheer.t=setTimeout(()=>{niceEl.hidden=true}, 900)}
}
function note(id){
  if(!TC.on||!id) return;
  const ch=cur();
  if(!ch) return;
  const now=performance.now();
  if(ch.timed&&TC.at>0&&now-seen.at>1100) TC.at=0;
  if(id!==ch.steps[TC.at]){
    if(ch.steps.indexOf(id)>=0) TC.at=0;
    return;
  }
  TC.at++; seen.at=now;
  if(TC.at>=ch.steps.length){
    TC.at=0;
    const lv=ch.lv;
    TC.best=Math.max(TC.best||0, lv);
    save();
    cheer();
    if(TC.i<LIST.length-1) TC.i++;
    else TC.cleared=true;
    paint();
  }else paint();
}
function poll(){
  if(!TC.on||typeof p==='undefined') return;
  const str=(window.P33&&P33.str)||[];
  if(str.length>seen.str){
    const id=PUNCH[str[str.length-1]];
    seen.str=str.length;
    if(id) note(id);
  }else if(str.length<seen.str) seen.str=str.length;
  if(p.state!==seen.state){
    if(p.state==='pounce') note(window.MM&&MM.last==='shadow'?'shadow':'pounce');
    else if(p.state==='tailwhip') note('tail');
    else if(p.state==='kpounce') note('skypounce');
    else if(p.anim==='djump') note('djump');
  }
  if(p.anim==='jump'&&seen.anim!=='jump'&&p.state!=='hurt') note('jump');
  if(p.anim==='djump'&&seen.anim!=='djump') note('djump');
  if(p.anim==='crouch'&&seen.anim!=='crouch') note('crouch');
  if((p.blinkCool||0)>(seen.blink||0)+0.25) note('blink');
  seen.ground=!!p.ground; seen.state=p.state; seen.anim=p.anim; seen.blink=p.blinkCool||0;
}
function flash(keys){
  (keys||[]).forEach((pair,i)=>{
    const b=document.querySelector('#ui .b[data-k="'+pair[0]+'"]');
    if(!b||!b.animate) return;
    setTimeout(()=>{b.animate([{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:500})}, i*280);
  });
}
function paint(){
  if(!card) return;
  const ch=cur();
  const n=TC.i+1;
  card.querySelector('[data-lv]').textContent='Level '+ch.lv+(TC.cleared?' · all done':'');
  card.querySelector('[data-do]').textContent=TC.cleared?'You did them all! Try again from the start.':'Do: '+ch.do;
  card.querySelector('[data-prog]').textContent='Challenge '+n+' of '+total()+' · best level '+(TC.best||0);
  const icons=card.querySelector('[data-icons]');
  icons.textContent='';
  if(!TC.cleared) ch.keys.forEach(pair=>{
    const s=document.createElement('span');
    s.textContent=pair[1];
    if(pair[0]==='attack') s.className='claw';
    icons.appendChild(s);
  });
  const btn=document.getElementById('prtrain');
  if(btn) btn.classList.toggle('cur', !!TC.on);
}
function stop(){
  if(TC.hold) return;
  TC.on=false; TC.at=0;
  document.body.classList.remove('train');
  if(card) card.hidden=true;
  const btn=document.getElementById('prtrain');
  if(btn) btn.classList.remove('cur');
}
function start(){
  if(!window.PRACTICE||!PRACTICE.on||TC.on) return;
  TC.hold=true;
  if(PRACTICE.station&&PRACTICE.st!=='spar') PRACTICE.station('spar');
  TC.hold=false;
  TC.on=true; TC.cleared=false; TC.at=0;
  if(!TC.kept){TC.i=Math.max(0, LIST.findIndex(s=>s.lv===(TC.best||1))); if(TC.i<0) TC.i=0; TC.kept=true}
  document.body.classList.add('train');
  if(card) card.hidden=false;
  document.querySelectorAll('#prbar [data-st]').forEach(b=>b.classList.remove('cur'));
  paint();
  seen={str:(window.P33&&P33.str&&P33.str.length)||0, ground:!!(typeof p!=='undefined'&&p.ground), state:p.state, anim:p.anim, blink:p.blinkCool||0, at:performance.now()};
}
TC.start=start; TC.stop=stop;
function build(){
  const css=document.createElement('style');
  css.textContent='#tccard{position:fixed;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:5;display:flex;flex-direction:column;align-items:center;gap:2px;max-width:min(440px,94vw);padding:6px 10px 8px;border-radius:16px;border:2px solid #ffe14d;background:rgba(12,10,34,.82);color:#fff;font:15px Bangers,Impact,sans-serif;letter-spacing:.4px;text-align:center}#tccard[hidden]{display:none!important}#tccard .lv{color:#ffe14d;font-size:13px}#tccard .do{font-size:clamp(16px,4.2vw,22px);line-height:1.15}#tccard .icons{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:2px 0}#tccard .icons span{background:#2a3f78;border:2px solid #fff8;border-radius:999px;padding:2px 8px;font-size:13px}#tccard .icons .claw{background:#c4492a}#tccard .row{display:flex;gap:6px;align-items:center}#tccard button{font:13px Bangers,Impact,sans-serif;color:#fff;background:#2a3f78e6;border:2px solid #fff8;border-radius:999px;padding:3px 10px;min-height:32px}#tccard .prog{font:12px system-ui,sans-serif;opacity:.9}#tcnice{position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:6;font:42px Bangers,Impact,sans-serif;color:#ffe14d;text-shadow:0 3px 0 #9a3c00,0 0 12px #000;pointer-events:none}#tcmoves{position:fixed;inset:0;z-index:8;background:rgba(8,6,24,.92);color:#fff;display:flex;flex-direction:column;padding:12px 14px 18px}#tcmoves[hidden]{display:none!important}#tcmoves h2{font:22px Bangers,Impact,sans-serif;color:#ffe14d;margin:0 0 8px}#tcmoves .sc{overflow:auto;flex:1}#tcmoves li{font:15px system-ui,sans-serif;margin:0 0 8px;line-height:1.3}#tcmoves button{font:16px Bangers,Impact,sans-serif;align-self:flex-start;color:#fff;background:#c4492a;border:0;border-radius:999px;padding:6px 14px;min-height:36px}';
  document.head.appendChild(css);
  card=document.createElement('div');
  card.id='tccard'; card.hidden=true;
  card.innerHTML='<div class="lv" data-lv></div><div class="do" data-do></div><div class="icons" data-icons></div><div class="prog" data-prog></div><div class="row"><button type="button" data-hint>Hint</button><button type="button" data-skip>Skip</button><button type="button" data-moves>Moves</button></div>';
  document.body.appendChild(card);
  niceEl=document.createElement('div'); niceEl.id='tcnice'; niceEl.hidden=true; niceEl.textContent='★ Nice!';
  document.body.appendChild(niceEl);
  card.querySelector('[data-hint]').addEventListener('click',e=>{e.preventDefault(); flash(cur().keys)});
  card.querySelector('[data-skip]').addEventListener('click',e=>{e.preventDefault(); if(TC.i<LIST.length-1){TC.i++; TC.at=0; TC.cleared=false} else {TC.i=0; TC.cleared=false; TC.at=0} paint()});
  card.querySelector('[data-moves]').addEventListener('click',e=>{e.preventDefault(); openMoves()});
  const bar=document.getElementById('prbar');
  if(bar&&!document.getElementById('prtrain')){
    const b=document.createElement('button');
    b.className='tap'; b.id='prtrain'; b.type='button'; b.textContent='⭐ TRAIN';
    const launch=bar.querySelector('[data-st="launch"]');
    if(launch) launch.after(b); else bar.appendChild(b);
    b.addEventListener('click',ev=>{ev.preventDefault(); b.blur(); if(TC.on) stop(); else start()});
  }
}
function openMoves(){
  if(!moves){
    moves=document.createElement('div'); moves.id='tcmoves'; moves.hidden=true;
    const lines=[
      'Jump — tap Up. In the air, Up again is a double jump.',
      'Sky pounce — tap Up twice quickly.',
      'Crouch — tap Down.',
      'Jab — tap Claw.',
      'Cross — Claw again.',
      'Hook — Claw a third time.',
      'Uppercut — tap Up and Claw together. He stays on the ground.',
      'Body shot — tap Down and Claw together.',
      'Rising launcher — hold Up and Claw.',
      'Power punch — hold Claw, then let go.',
      'Pounce — tap Pounce. A short leap and a paw swipe.',
      'Shadow Pounce — hold Pounce, then let go. A bigger leap.',
      'Pounce, then Jab — pounce, and Claw as you land.',
      'Tail whip — tap Tail.',
      'Blink — tap Blink.',
      'Turn — double-tap the back arrow. Hold that second tap to back-dash.',
      'Walk backward — hold the back arrow. He does not turn around.',
      'The string — Jab, Cross, Hook, Uppercut.',
      'The big mix — Jump, Pounce, Jab, Cross.'
    ];
    moves.innerHTML='<button type="button">Close</button><h2>Paddy’s moves</h2><div class="sc"><ul>'+lines.map(t=>'<li>'+t+'</li>').join('')+'</ul></div>';
    moves.querySelector('button').addEventListener('click',()=>{moves.hidden=true});
    document.body.appendChild(moves);
  }
  moves.hidden=false;
}
TC.moves=openMoves;
build();
const _pre=r9Pre;
r9Pre=function(dt){try{poll()}catch(e){if(!poll.err){poll.err=1; console.warn('train', e)}} return _pre.apply(this, arguments)};
const q=new URLSearchParams(location.search);
if(q.get('practice')==='train'){
  const go=()=>{if(window.PRACTICE&&PRACTICE.on) start(); else setTimeout(go, 300)};
  setTimeout(go, 400);
}
})();
