// Practice Room challenges. The prompt stays in the top strip, never over the fight.
// Story mode never loads this file.
(function(){
if(typeof drawHUD!=='function') return;
const KEY='paddyTrainBest';
const LIST=[
  {lv:1, name:'Jump', do:'Jump', steps:['jump'], icons:['Up'], play:[{k:'up'}]},
  {lv:1, name:'Crouch', do:'Crouch', steps:['crouch'], icons:['Down'], play:[{k:'down', hold:180}]},
  {lv:1, name:'Jab', do:'Jab', steps:['claw'], icons:['Claw'], play:[{k:'attack'}]},
  {lv:2, name:'One-two', do:'Jab, Cross', steps:['claw','claw'], icons:['Claw','Claw'], play:[{k:'attack'},{k:'attack'}]},
  {lv:3, name:'The combo', do:'Jab, Cross, Hook', steps:['claw','claw','claw'], icons:['Claw','Claw','Claw'], play:[{k:'attack'},{k:'attack'},{k:'attack'}]},
  {lv:4, name:'Body shot', do:'Body shot', steps:['clawd'], icons:['Down+Claw'], play:[{down:['down','attack']}]},
  {lv:4, name:'Uppercut', do:'Uppercut', steps:['clawu'], icons:['Up+Claw'], play:[{down:['up','attack']}]},
  {lv:5, name:'Pounce', do:'Pounce', steps:['pounce'], icons:['Pounce'], play:[{k:'special', hold:50, wait:950}]},
  {lv:5, name:'Shadow Pounce', do:'Shadow Pounce', steps:['shadow'], icons:['Hold Pounce'], play:[{k:'special', hold:400, wait:900}]},
  {lv:6, name:'Low pounce', do:'Down+Pounce', steps:['lowpounce'], icons:['Down+Pounce'], play:[{down:['down','special'], hold:70, wait:800}]},
  {lv:7, name:'Slip Finish', do:'Claw, Claw, Fwd+Claw, Claw', steps:['claw','claw','clawf','claw'], icons:['Claw','Claw','Fwd+Claw','Claw'], timed:1, play:[{k:'attack'},{k:'attack'},{down:['right','attack']},{k:'attack'}]},
  {lv:8, name:'Pounce Crash', do:'Pounce, Pounce, Down+Pounce', steps:['pounce','pounce','lowpounce'], icons:['Pounce','Pounce','Down+Pounce'], timed:1, play:[{k:'special', hold:50, wait:950},{k:'special', hold:50, wait:950},{down:['down','special'], hold:70, wait:950}]},
  {lv:9, name:'Body Line', do:'Claw, Down+Claw, Claw', steps:['claw','clawd','claw'], icons:['Claw','Down+Claw','Claw'], timed:1, play:[{k:'attack'},{down:['down','attack']},{k:'attack'}]},
  {lv:10, name:'Four Claws', do:'Claw, Claw, Claw, Up+Claw', steps:['claw','claw','claw','clawu'], icons:['Claw','Claw','Claw','Up+Claw'], timed:1, play:[{k:'attack'},{k:'attack'},{k:'attack'},{down:['up','attack']}]}
];
const TC=window.TC={on:false, i:0, at:0, best:0, guide:0, demo:false, cue:'', hold:false};
try{TC.best=+localStorage.getItem(KEY)||0}catch(e){}
let strip=null, moves=null, beat=null;

function cur(){return LIST[Math.min(TC.i, LIST.length-1)]}
function save(){try{localStorage.setItem(KEY, String(TC.best||0))}catch(e){}}
function winGap(){return TC.guide>0?1600:1300}
TC.cue=function(t){TC.cueText=t; paint(); clearTimeout(TC._c); TC._c=setTimeout(()=>{TC.cueText=''; paint()}, 800)};
function paint(){
  if(!strip) return;
  const ch=cur();
  strip.hidden=!TC.on;
  document.body.classList.toggle('train', !!TC.on);
  const btn=document.getElementById('prtrain');
  if(btn) btn.classList.toggle('cur', !!TC.on);
  if(!TC.on) return;
  strip.querySelector('[data-do]').textContent=(TC.cueText?TC.cueText+' · ':'')+'L'+ch.lv+' '+ch.name;
  const row=strip.querySelector('[data-icons]');
  row.textContent='';
  ch.icons.forEach((label,i)=>{
    const s=document.createElement('i');
    s.textContent=label;
    if(i<TC.at) s.className='on';
    else if(i===TC.at) s.className='now';
    row.appendChild(s);
  });
  if(beat) beat.classList.toggle('go', TC.guide>0);
}
function miss(){
  if(!TC.on||TC.demo) return;
  const ch=cur();
  if(!ch||!ch.timed||!TC.at) return;
  TC.at=0;
  if(TC.guide>0) TC.guide--;
  TC.cue('try again');
  paint();
}
TC.miss=miss;
function note(id){
  if(!TC.on||TC.demo||!id) return;
  const ch=cur();
  const now=performance.now();
  if(ch.timed&&TC.at>0&&now-(TC.stepT||0)>winGap()){miss(); return}
  if(id!==ch.steps[TC.at]){
    if(ch.steps.indexOf(id)>=0) miss();
    return;
  }
  TC.at++; TC.stepT=now;
  if(TC.guide>0) pulse();
  if(TC.at>=ch.steps.length){
    TC.at=0; TC.stepT=0;
    TC.best=Math.max(TC.best||0, ch.lv); save();
    TC.cue('Nice!');
    if(TC.guide>0) TC.guide--;
    if(TC.i<LIST.length-1) TC.i++;
  }
  paint();
}
TC.note=note;
function pulse(){
  if(!beat) return;
  beat.classList.remove('pop');
  void beat.offsetWidth;
  beat.classList.add('pop');
}
function releaseAll(){
  ['left','right','up','down','attack','special','tail','blink','jump'].forEach(k=>{try{release(k)}catch(e){}});
}
function runDemo(){
  const ch=cur();
  const play=ch.play||[];
  TC.demo=true; TC.at=0; TC.cueText='Watch'; paint();
  if(typeof p!=='undefined'){p.face=1; if(window.PL) PL.rest=1}
  let t=120;
  play.forEach((step,i)=>{
    setTimeout(()=>{
      const keys=(step.down||[step.k]).filter(Boolean);
      keys.forEach(k=>{try{press(k)}catch(e){}});
      TC.at=i+1; paint();
      setTimeout(releaseAll, step.hold||80);
    }, t);
    t+=step.wait||280;
  });
  setTimeout(()=>{
    releaseAll();
    TC.demo=false; TC.at=0; TC.guide=2; TC.cueText='Your turn';
    if(window.CSTR){CSTR.buf=[]; CSTR.beat=true}
    paint(); pulse();
  }, t+200);
}
function help(){
  if(!window.PRACTICE||!PRACTICE.on) return;
  if(!TC.on) start();
  runDemo();
}
TC.help=help;
function stop(){
  if(TC.hold) return;
  TC.on=false; TC.at=0; TC.guide=0; TC.demo=false;
  document.body.classList.remove('train');
  if(strip) strip.hidden=true;
  const btn=document.getElementById('prtrain');
  if(btn) btn.classList.remove('cur');
}
function start(){
  if(!window.PRACTICE||!PRACTICE.on) return;
  TC.hold=true;
  if(PRACTICE.station&&PRACTICE.st!=='spar') PRACTICE.station('spar');
  TC.hold=false;
  TC.on=true; TC.at=0; TC.guide=0;
  if(!TC.kept){
    const i=LIST.findIndex(s=>s.lv===(TC.best||1));
    TC.i=i<0?0:i; TC.kept=true;
  }
  document.querySelectorAll('#prbar [data-st]').forEach(b=>b.classList.remove('cur'));
  paint();
}
TC.start=start; TC.stop=stop;
function build(){
  const css=document.createElement('style');
  css.textContent='#tcstrip{position:fixed;left:50%;top:calc(max(6px,env(safe-area-inset-top)) + 44px);transform:translateX(-50%);z-index:4;display:flex;align-items:center;gap:6px;max-width:92vw;padding:3px 8px;border-radius:999px;background:rgba(12,10,34,.42);color:#fff;font:13px Bangers,Impact,sans-serif;letter-spacing:.3px;pointer-events:none}#tcstrip[hidden]{display:none!important}#tcstrip [data-do]{white-space:nowrap;opacity:.95}#tcstrip [data-icons]{display:flex;gap:3px;flex-wrap:nowrap}#tcstrip i{font-style:normal;border:1px solid #fff8;border-radius:999px;padding:1px 6px;opacity:.55;background:#2a3f7888}#tcstrip i.now{opacity:1;border-color:#ffe14d}#tcstrip i.on{opacity:1;background:#2f8a4a}#tcbeat{width:12px;height:12px;border-radius:50%;background:#fff4;flex:none}#tcbeat.pop{background:#7fffd4;box-shadow:0 0 8px #7fffd4}#tcmoves{position:fixed;left:0;right:0;top:0;bottom:0;z-index:8;background:rgba(8,6,24,.94);color:#fff;display:flex;flex-direction:column;padding:10px 12px 16px}#tcmoves[hidden]{display:none!important}#tcmoves h2{font:20px Bangers,Impact,sans-serif;color:#ffe14d;margin:6px 0}#tcmoves .tabs button{font:15px Bangers,Impact,sans-serif;color:#fff;background:#2a3f78;border:0;border-radius:999px;padding:4px 12px;margin-right:6px}#tcmoves .tabs button.cur{background:#c4492a}#tcmoves .sc{overflow:auto;flex:1;margin-top:8px}#tcmoves table{width:100%;border-collapse:collapse;font:15px system-ui,sans-serif}#tcmoves td{padding:6px 8px;border-bottom:1px solid #fff2;vertical-align:top}#tcmoves td:first-child{color:#ffe14d;white-space:nowrap}#tcmoves .x{align-self:flex-start;font:16px Bangers,Impact,sans-serif;color:#fff;background:#c4492a;border:0;border-radius:999px;padding:6px 14px;min-height:36px}';
  document.head.appendChild(css);
  strip=document.createElement('div');
  strip.id='tcstrip'; strip.hidden=true;
  strip.innerHTML='<b data-do></b><span data-icons></span><i id="tcbeat"></i>';
  document.body.appendChild(strip);
  beat=strip.querySelector('#tcbeat');
}
const MOVE_ROWS=[
  ['Claw tap','Jab, then Cross, then Hook, then Uppercut'],
  ['Claw hold','Haymaker, or Power Jab after a forward tap'],
  ['Up + Claw quick','Uppercut, feet stay down'],
  ['Up + Claw hold','Rising launcher'],
  ['Down + Claw','Body shot'],
  ['Forward + Claw','Jab, or a slipping jab'],
  ['Back + Claw','Cross'],
  ['Claw in the air','Air swipe, or air spin after a double jump'],
  ['Pounce tap','Short pounce and a paw swipe'],
  ['Pounce hold','Shadow Pounce'],
  ['Down + Pounce','Low Pounce'],
  ['Back + Pounce','Back swipe'],
  ['Up + Pounce','Pop pounce'],
  ['Tail tap','Tail whip. Third one launches'],
  ['Tail hold or double-tap','Tail tornado'],
  ['Forward + Tail','Tail trip'],
  ['Down + Tail','Tail sweep'],
  ['Blink tap','Blink forward'],
  ['Forward + Blink','Blink behind'],
  ['Up + Blink','Blink above'],
  ['Double-tap Blink','Blink flurry'],
  ['Blink in the air, hold','Shadow hop onto the dummy'],
  ['Hunt tap','Hunt on or off'],
  ['Tap Up','Jump'],
  ['Up in the air','Double jump'],
  ['Double-tap Up','Sky pounce'],
  ['Hold Down','Crouch'],
  ['Double-tap Down','Cat slide'],
  ['Hold Back','Walk backward, no turn'],
  ['Double-tap Back','Turn. Keep holding for a back dash'],
  ['Double-tap Forward','Dash']
];
const COMBO_ROWS=[
  ['Slip Finish','Claw, Claw, Fwd+Claw, Claw'],
  ['Pounce Crash','Pounce, Pounce, Down+Pounce'],
  ['Body Line','Claw, Down+Claw, Claw'],
  ['Rising Line','Claw, Up+Claw, Claw'],
  ['Tail Blink','Tail, Tail, Blink'],
  ['Pounce Jab','Pounce, Claw, Claw'],
  ['Sky Mix','Jump, Pounce, Claw'],
  ['Four Claws','Claw, Claw, Claw, Up+Claw']
];
function table(rows){
  return '<table>'+rows.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>').join('')+'</table>';
}
function openMoves(){
  if(!moves){
    moves=document.createElement('div'); moves.id='tcmoves'; moves.hidden=true;
    moves.innerHTML='<button class="x" type="button">Close</button><div class="tabs"><button type="button" data-tab="moves" class="cur">Moves</button><button type="button" data-tab="combos">Combos</button></div><h2>What the buttons do</h2><div class="sc" data-sc></div>';
    const sc=moves.querySelector('[data-sc]');
    function show(tab){
      moves.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('cur', b.dataset.tab===tab));
      moves.querySelector('h2').textContent=tab==='combos'?'Combo strings':'What the buttons do';
      sc.innerHTML=table(tab==='combos'?COMBO_ROWS:MOVE_ROWS);
    }
    moves.querySelector('.x').addEventListener('click',()=>{moves.hidden=true});
    moves.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.tab)));
    show('moves');
    document.body.appendChild(moves);
  }
  moves.hidden=false;
}
TC.moves=openMoves;
build();
const q=new URLSearchParams(location.search);
if(q.get('practice')==='train'){
  const go=()=>{if(window.PRACTICE&&PRACTICE.on) start(); else setTimeout(go, 200)};
  setTimeout(go, 500);
}
})();
