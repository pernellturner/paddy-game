// Timed combo strings for base Paddy in the Practice Room.
// Recognises buttons that already did their own moves. Does not remap controls.
(function(){
if(typeof update!=='function') return;
const LIST=[
  {id:'slip', name:'Slip Finish', fin:'SLIP FINISH', steps:['claw','claw','clawf','claw']},
  {id:'crash', name:'Pounce Crash', fin:'POUNCE CRASH', steps:['pounce','pounce','lowpounce']},
  {id:'body', name:'Body Line', fin:'BODY LINE', steps:['claw','clawd','claw']},
  {id:'rise', name:'Rising Line', fin:'RISING LINE', steps:['claw','clawu','claw']},
  {id:'tails', name:'Tail Blink', fin:'TAIL BLINK', steps:['tail','tail','blink']},
  {id:'pj', name:'Pounce Jab', fin:'POUNCE JAB', steps:['pounce','claw','claw']},
  {id:'sky', name:'Sky Mix', fin:'SKY MIX', steps:['jump','pounce','claw']},
  {id:'four', name:'Four Claws', fin:'FOUR CLAWS', steps:['claw','claw','claw','clawu']}
];
const CSTR=window.CSTR={list:LIST, buf:[], lastT:0, beat:true, win:0.35};
function room(){
  try{return !!(window.PRACTICE&&PRACTICE.on)&&typeof FORM==='function'&&FORM()===0&&!(window.KITTY36&&KITTY36.on)}catch(e){return false}
}
const LONG={pounce:1,shadow:1,lowpounce:1,jump:1,djump:1,skypounce:1,tail:1,blink:1,crouch:1};
function gap(){
  const help=window.TC&&TC.guide>0;
  const last=CSTR.buf[CSTR.buf.length-1];
  if(LONG[last]) return help?1.5:1.25;
  return help?0.62:0.42;
}
let queued=[];
if(typeof press==='function'){
  const _pr=press;
  press=function(k){
    const r=_pr.apply(this, arguments);
    try{
      if(k==='attack'&&room()){
        const inp=(window.P33&&P33.aim&&P33.aim.inp)||{};
        let id='claw';
        if(inp.down) id='clawd';
        else if(inp.up) id='clawu';
        else if(inp.fwd) id='clawf';
        else if(inp.back) id='clawb';
        queued.push({id, t:performance.now()});
      }
    }catch(e){}
    return r;
  };
}
function push(id, when){
  if(!id||!room()) return;
  if(window.TC&&TC.demo) return;
  const now=when||performance.now();
  if(CSTR.buf.length&&now-CSTR.lastT>gap()*1000){CSTR.buf=[]; CSTR.beat=true; if(window.TC&&TC.miss) TC.miss()}
  const last=CSTR.buf[CSTR.buf.length-1];
  const fast=!CSTR.buf.length||now-CSTR.lastT<(LONG[last]?900:320);
  if(!fast) CSTR.beat=false;
  CSTR.buf.push(id);
  if(CSTR.buf.length>8) CSTR.buf.shift();
  CSTR.lastT=now;
  if(window.TC&&TC.on&&TC.note) TC.note(id);
  for(const s of LIST){
    const n=s.steps.length;
    if(CSTR.buf.length<n) continue;
    const tail=CSTR.buf.slice(-n);
    if(tail.every((v,i)=>v===s.steps[i])){
      CSTR.buf=[];
      finish(s, CSTR.beat);
      CSTR.beat=true;
      break;
    }
  }
}
function finish(s, beat){
  try{if(typeof areaHit==='function') areaHit(p.x+(p.face||1)*50, p.y-40, beat?190:150, 'claw3')}catch(e){}
  if(typeof shake!=='undefined') shake=Math.max(shake||0, beat?10:6);
  if(typeof flashT!=='undefined') flashT=Math.max(flashT, beat?0.12:0.06);
  try{if(typeof say==='function') say(beat?s.fin+'!':s.fin, beat?'#7fffd4':'#ffe14d', true)}catch(e){}
  if(window.TC&&TC.cue) TC.cue(beat?'On beat!':s.name);
}
CSTR.push=push;
let seen={str:0, state:'', anim:'', blink:0, ground:true};
function poll(){
  if(!room()||typeof p==='undefined') return;
  const str=(window.P33&&P33.str)||[];
  const now=performance.now();
  queued=queued.filter(q=>now-q.t<700);
  if(str.length>seen.str){
    const add=str.length-seen.str;
    for(let n=0;n<add;n++){
      const a=str[seen.str+n];
      const q=queued.shift();
      let id=q&&q.id;
      if(!id){
        id='claw';
        if(a==='bxrb') id='clawd';
        else if(a==='bxsu'||a==='bxpu') id='clawu';
        else if(a==='bxj2') id='clawf';
      }
      push(id, q&&q.t);
    }
    seen.str=str.length;
  }else if(str.length<seen.str) seen.str=str.length;
  if(p.state!==seen.state){
    if(p.state==='pounce'){
      const last=window.MM&&MM.last;
      push(last==='shadow'?'shadow':last==='lowpounce'?'lowpounce':'pounce');
    }else if(p.state==='tailwhip') push('tail');
    else if(p.state==='kpounce') push('skypounce');
  }
  const justPounce=CSTR.lastT&&performance.now()-CSTR.lastT<1000&&/pounce|shadow|lowpounce/.test(CSTR.buf[CSTR.buf.length-1]||'');
  if(p.anim==='jump'&&seen.anim!=='jump'&&p.state!=='hurt'&&p.state!=='pounce'&&!justPounce&&!(window.MM&&(MM.plan||MM.pcharge))) push('jump');
  if(p.anim==='djump'&&seen.anim!=='djump') push('djump');
  if(p.anim==='crouch'&&seen.anim!=='crouch'&&p.ground&&p.state!=='pounce'&&K.down&&!K.special&&!P.special&&!(window.MM&&(MM.plan||MM.pcharge))) push('crouch');
  if((p.blinkCool||0)>(seen.blink||0)+0.25) push('blink');
  seen.state=p.state; seen.anim=p.anim; seen.blink=p.blinkCool||0; seen.ground=!!p.ground;
}
const _pre=r9Pre;
r9Pre=function(dt){try{poll()}catch(e){if(!poll.err){poll.err=1;console.warn('cstr',e)}} return _pre.apply(this, arguments)};
})();
