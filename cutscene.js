// ===================== STORY CUTSCENE PLAYER (level-1-1 branch, local only) =====================
// World 1 (Silverdale) cutscenes from Story Studio (HANDOFF-W1.md v2: 8 cutscenes, 10 panels + 3 caption-only map hops).
// Panels: assets/story/<img>.webp (1280x720, converted from /workspace/paddy-story/scenes/w1-*/panel-0N.png, no text in the art).
// Plain DOM overlay + its own canvas, so it works over level.html (no game.js) and over the main game alike.
//   Controls: tap / click anywhere, or Space · Enter · → · X · Z = next panel · SKIP button or Esc = skip the whole cutscene.
//   While a cutscene plays every key is swallowed (the level does not move) and the level runtime is paused (LV.pause).
// API: CUT.play(ids, done)            ids = 'w1c1' or ['w1a1','w1u03']; done() runs after the last panel or a skip
//      CUT.trigger(levelId, ev, done) plays TRIGGERS[levelId+':'+ev] (ev = goal · boss_enter · boss_ko); false (and done()) if none
//      CUT.next() · CUT.skip() · CUT.state() · CUT.log · CUT.off (?nocuts) · level.html?cut=w1c3 previews one cutscene
// Unlock flags (W1-U01/U02 Kitty upgrades, W1-U03 Ninja) are saved in the story save ('paddyStory', level.html) under d.story.flags.
(function(){
const SRC=n=>'assets/story/'+n+'.webp?v=c1a';
const FONTS="'Bangers','Luckiest Guy',Impact,'Arial Black',sans-serif";
// scenes: panels {img, cap, fx, fy, z0, z1, hero}; card = the UPGRADE / NEW FORM badge; map = caption-only map hop
const SCENES=window.CUT_SCENES={
 w1c1:{id:'W1-C1',panels:[{img:'w1c1_1',cap:'Paddy dodges the trolleys and slips out of the car park. Which way is Stanmore Bay? He picks a direction… and hopes it\'s right.',fx:.55,fy:.5,z0:1.05,z1:1.2}]},
 w1u01:{id:'W1-U01',flag:'kitty_boxing_gloves',card:'UPGRADE! Kitty · Boxing Gloves',panels:[{img:'w1u01_1',cap:'Tiny red boxing gloves, left on a bench… a PERFECT fit!',fx:.45,fy:.5,z0:1.2,z1:1.04}]},
 w1hop12:{id:'W1-map 1-2',map:1,panels:[{cap:'From the bus stop, Paddy follows the busy highway…'}]},
 w1c3:{id:'W1-C3',panels:[{img:'w1c3_1',cap:'Night at the floodlit park. No blanket, no bed… just cold grass by the tennis courts. Paddy stares at the moon…',fx:.5,fy:.55,z0:1.02,z1:1.22},
  {img:'w1c3_2',cap:'…the very same moon Savannah and Hallie are watching. "Goodnight, Paddy. Wherever you are."',fx:.6,fy:.45,z0:1.22,z1:1.02}]},
 w1hop14:{id:'W1-map 1-4',map:1,panels:[{cap:'Past the village green and up the hill to the school…'}]},
 w1u02:{id:'W1-U02',flag:'kitty_champ_sweatband',card:'UPGRADE! Kitty · Champ Sweatband',panels:[{img:'w1u02_1',cap:'A lost sweatband on the school field. Jab-jab-JAB! Faster than ever!',fx:.55,fy:.5,z0:1.05,z1:1.2}]},
 w1hop16:{id:'W1-map 1-6',map:1,panels:[{cap:'Down the path to the Wēiti River…'}]},
 w1b1:{id:'W1-B1',panels:[{img:'w1b1_1',cap:'Under the old 1913 bridge, the mangroves go quiet. Something HUGE blocks the way…',fx:.45,fy:.5,z0:1.2,z1:1.04},
  {img:'w1b1_2',cap:'BIG BRUNO! "Nobody gets past MY river, fluffball." Paddy\'s tail puffs up. "Watch me."',fx:.5,fy:.55,z0:1.02,z1:1.22}]},
 w1a1:{id:'W1-A1',panels:[{img:'w1a1_1',cap:'Bruno\'s down! For one heartbeat, Paddy\'s fur flickers GOLD. "…What was THAT?"',fx:.6,fy:.45,z0:1.22,z1:1.02,hero:1}]},
 w1u03:{id:'W1-U03',flag:'form_ninja',card:'NEW FORM! Ninja',panels:[{img:'w1u03_1',cap:'A black scarf drifts down the river and snags on a mangrove. Paddy ties it on… NINJA PADDY!',fx:.55,fy:.5,z0:1.05,z1:1.2,hero:1}]},
 w1x:{id:'W1-X',panels:[{img:'w1x_1',cap:'Sunrise on the Silverdale St bridge. The sea one way, the hills the other… Paddy picks the hills. The WRONG way!',fx:.45,fy:.5,z0:1.2,z1:1.04,hero:1}]}};
// play order + triggers (HANDOFF-W1.md "Order and triggers"); level ids are the Level Builder ids (silverdale_N = 1-N)
const TRIGGERS=window.CUT_TRIGGERS={
 'silverdale_1:goal':['w1c1','w1u01'],      // 1, 2   end of 1-1 Centre Car Park (+ Kitty upgrade, 150 EXP in the plan)
 'silverdale_2:goal':['w1hop12'],           // 3      map hop
 'silverdale_3:goal':['w1c3'],              // 4      end of 1-3 Highway (floodlit tennis courts)
 'silverdale_4:goal':['w1hop14'],           // 5      map hop
 'silverdale_5:goal':['w1u02'],             // 6      end of 1-5 Silverdale School (+ Kitty upgrade, 1,200 EXP in the plan)
 'silverdale_6:goal':['w1hop16'],           // 7      map hop
 'silverdale_7:boss_enter':['w1b1'],        // 8      1-7 entering the boss arena under the 1913 bridge
 'silverdale_7:boss_ko':['w1a1','w1u03'],   // 9, 10  Big Bruno K.O. -> gold flicker, then the Ninja reward
 'silverdale_7:goal':['w1x']};              // 11     1-7 goal on the Silverdale St bridge (then Level Builder's map reveal)
const qs=new URLSearchParams(location.search);
const IM={};function load(n){if(!n)return null;if(IM[n])return IM[n];const im=new Image();im.decoding='async';im.onload=()=>{im.ok=1};im.src=SRC(n);IM[n]=im;return im}
const okIm=im=>im&&im.ok&&im.naturalWidth;
// ---------- save (shared with game.js UNL / mission.js) ----------
const hasUNL=()=>typeof UNL!=='undefined'&&UNL&&UNL.d;
const SKEY=()=>hasUNL()?'paddyLegends':'paddyStory';   // story mode (level.html) -> its own save, see mission.js
function data(){if(hasUNL())return UNL.d;try{return JSON.parse(localStorage.getItem(SKEY())||'{}')||{}}catch(_){return {}}}
function save(d){if(hasUNL()){UNL.save();return}try{localStorage.setItem(SKEY(),JSON.stringify(d))}catch(_){}}
function mark(sc,key){const d=data();d.story=d.story||{};const S=d.story;S.seen=S.seen||[];S.flags=S.flags||[];
 if(!S.seen.includes(key))S.seen.push(key);if(sc.flag&&!S.flags.includes(sc.flag))S.flags.push(sc.flag);save(d)}
// ---------- DOM ----------
const css=document.createElement('style');css.textContent=`
#cutov{position:fixed;inset:0;z-index:9000;display:none;background:#140c24;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;cursor:pointer}
#cutov.on{display:block}#cutov canvas{position:absolute;inset:0;width:100%;height:100%}
#cutskip{position:absolute;top:max(8px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:2;font:clamp(14px,3.4vh,20px) ${FONTS};letter-spacing:1.5px;color:#fff;
 background:#0008;border:2px solid #fff8;border-radius:999px;padding:.25em .9em .2em;cursor:pointer;-webkit-tap-highlight-color:transparent}
#cutskip:active{transform:scale(.95)}`;document.head.appendChild(css);
const ov=document.createElement('div');ov.id='cutov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Story cutscene');
const cv=document.createElement('canvas');const sk=document.createElement('button');sk.id='cutskip';sk.type='button';sk.textContent='SKIP ⏭';
ov.appendChild(cv);ov.appendChild(sk);
const mount=()=>{if(!ov.parentNode)document.body.appendChild(ov)};if(document.body)mount();else addEventListener('DOMContentLoaded',mount);
const ctx=cv.getContext('2d');let DW=0,DH=0;
function size(){const dpr=Math.min(2,devicePixelRatio||1);DW=innerWidth;DH=innerHeight;cv.width=Math.round(DW*dpr);cv.height=Math.round(DH*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',()=>{if(Q)size()});
const touchy=()=>matchMedia&&matchMedia('(pointer:coarse)').matches;
// ---------- playback ----------
let Q=null;   // {list:[{sc,key,p,pi,n}], i, t, prev, done}
const CUT=window.CUT={SCENES,TRIGGERS,log:[],off:qs.has('nocuts'),get playing(){return !!Q},
 play(ids,done){ids=[].concat(ids||[]).filter(k=>SCENES[k]);if(!ids.length||this.off){done&&done();return false}
  const list=[];for(const k of ids){const sc=SCENES[k];sc.panels.forEach((p,pi)=>list.push({sc,key:k,p,pi,n:sc.panels.length}));sc.panels.forEach(p=>load(p.img))}
  if(Q){const old=Q;Q.list.push(...list);const od=old.done;old.done=()=>{od&&od();done&&done()};return true}   // already playing: queue behind
  mount();size();Q={list,i:0,t:0,done,started:{}};ov.classList.add('on');enter();this.log.push('play:'+ids.join('+'));requestAnimationFrame(loop);return true},
 trigger(levelId,ev,done){const ids=TRIGGERS[levelId+':'+ev];if(!ids||this.off){done&&done();return false}this.log.push('trigger:'+levelId+':'+ev);return this.play(ids,done)},
 next(){if(!Q||Q.t<.28)return;if(Q.i>=Q.list.length-1){finish('end');return}Q.prev={e:Q.list[Q.i],t:Q.t};Q.i++;Q.t=0;enter()},
 skip(){if(Q)finish('skip')},
 state(){return Q?{playing:true,scene:Q.list[Q.i].key,id:Q.list[Q.i].sc.id,panel:Q.list[Q.i].pi+1,of:Q.list[Q.i].n,idx:Q.i,total:Q.list.length}:{playing:false}}};
function enter(){const e=Q.list[Q.i];if(!Q.started[e.key]){Q.started[e.key]=1;mark(e.sc,e.key);CUT.log.push('scene:'+e.key)}}
function finish(why){const q=Q;Q=null;ov.classList.remove('on');CUT.log.push(why);try{q.done&&q.done()}catch(err){console.error(err)}}
ov.addEventListener('pointerdown',e=>{if(e.target===sk)return;e.preventDefault();CUT.next()});
sk.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();CUT.skip()});
sk.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});
const NEXT=new Set(['Space','Enter','NumpadEnter','ArrowRight','KeyX','KeyZ','KeyJ']);
addEventListener('keydown',e=>{if(!Q)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
 if(e.code==='Escape'||e.code==='Backspace')CUT.skip();else if(NEXT.has(e.code))CUT.next()},true);
addEventListener('keyup',e=>{if(Q){e.preventDefault();e.stopImmediatePropagation()}},true);
// ---------- drawing ----------
let last=0;
function loop(ts){if(!Q){last=0;return}const dt=Math.min(.05,(ts-(last||ts))/1000);last=ts;Q.t+=dt;if(Q.prev)Q.prev.t+=dt;draw();requestAnimationFrame(loop)}
function wrap(txt,maxW){const words=txt.split(' '),lines=[];let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t}if(cur)lines.push(cur);return lines}
function fitText(txt,maxW,maxH,f0,fmin){let f=f0;for(;f>fmin;f-=1){ctx.font=`600 ${f}px system-ui,'Segoe UI',sans-serif`;const L=wrap(txt,maxW);if(L.length*f*1.28<=maxH)return{f,L}}ctx.font=`600 ${fmin}px system-ui,sans-serif`;return{f:fmin,L:wrap(txt,maxW)}}
function layout(){const side=DW/DH>2.05;   // very wide and short (e.g. 1024x340 phone landscape): art left, caption right
 if(side){const iw=Math.min(DW*.64,DH*16/9);return{side,img:{x:0,y:0,w:iw,h:DH},cap:{x:iw,y:0,w:DW-iw,h:DH}}}
 const ch=Math.max(84,Math.min(DH*.3,190));return{side,img:{x:0,y:0,w:DW,h:DH},cap:{x:0,y:DH-ch,w:DW,h:ch}}}
function drawPanel(e,t,R,alpha){const p=e.p;ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.rect(R.x,R.y,R.w,R.h);ctx.clip();
 if(e.sc.map){drawMap(t,R);ctx.restore();return}
 const im=load(p.img);ctx.fillStyle='#140c24';ctx.fillRect(R.x,R.y,R.w,R.h);
 if(okIm(im)){const k=Math.min(1,t/7),ez=k*k*(3-2*k),z=(p.z0||1.05)+((p.z1||1.15)-(p.z0||1.05))*ez;
  const base=Math.max(R.w/im.naturalWidth,R.h/im.naturalHeight)*z,w=im.naturalWidth*base,h=im.naturalHeight*base;
  let x=R.x+R.w/2-(p.fx!=null?p.fx:.5)*w+(w-R.w)*0*0,y=R.y+R.h/2-(p.fy!=null?p.fy:.5)*h;x=Math.min(R.x,Math.max(R.x+R.w-w,x));y=Math.min(R.y,Math.max(R.y+R.h-h,y));
  ctx.drawImage(im,x,y,w,h);
  if(p.hero){const u=.5+.5*Math.sin(t*3),g=ctx.createRadialGradient(R.x+R.w/2,R.y+R.h*.45,10,R.x+R.w/2,R.y+R.h*.45,Math.max(R.w,R.h)*.6);g.addColorStop(0,`rgba(255,220,90,${.08+.06*u})`);g.addColorStop(1,'rgba(255,200,60,0)');ctx.fillStyle=g;ctx.fillRect(R.x,R.y,R.w,R.h)}}
 else{ctx.fillStyle='#ffffff55';ctx.font='20px sans-serif';ctx.textAlign='center';ctx.fillText('…',R.x+R.w/2,R.y+R.h/2)}
 ctx.restore()}
function drawMap(t,R){const g=ctx.createLinearGradient(0,R.y,0,R.y+R.h);g.addColorStop(0,'#1f3a5c');g.addColorStop(1,'#2d5a3c');ctx.fillStyle=g;ctx.fillRect(R.x,R.y,R.w,R.h);
 // a simple dotted path with paw prints walking along it (Level Builder's real map screen replaces this later)
 const y0=R.y+R.h*.42,pts=[];for(let i=0;i<=40;i++){const k=i/40;pts.push([R.x+R.w*(.08+.84*k),y0+Math.sin(k*6.283*1.2)*R.h*.12])}
 ctx.strokeStyle='#fff6';ctx.lineWidth=Math.max(2,R.h*.008);ctx.setLineDash([8,10]);ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.setLineDash([]);
 const n=Math.min(40,Math.floor(t*12));ctx.fillStyle='#ffe08a';for(let i=0;i<n;i+=2){const q=pts[i],s=Math.max(3,R.h*.012);ctx.beginPath();ctx.arc(q[0],q[1]+(i%4?-s*1.6:s*1.6),s,0,6.283);ctx.fill()}
 const q=pts[Math.min(40,n)];ctx.font=`${Math.max(18,R.h*.08)}px sans-serif`;ctx.textAlign='center';ctx.fillText('🐾',q[0],q[1]-R.h*.06)}
function drawCaption(e,R,side,t){const p=e.p,pad=side?Math.max(12,R.w*.07):Math.max(14,R.w*.04);
 if(side){ctx.fillStyle='#fff8e8';ctx.fillRect(R.x,R.y,R.w,R.h);ctx.fillStyle='#ffb84d';ctx.fillRect(R.x,R.y,4,R.h)}
 else{const g=ctx.createLinearGradient(0,R.y-30,0,R.y+R.h);g.addColorStop(0,'rgba(20,12,36,0)');g.addColorStop(.25,'rgba(20,12,36,.82)');g.addColorStop(1,'rgba(20,12,36,.92)');ctx.fillStyle=g;ctx.fillRect(R.x,R.y-30,R.w,R.h+30)}
 const top=R.y+(side?Math.max(44,R.h*.16):10),bottom=R.y+R.h-(side?34:30);let y=top;
 // UPGRADE / NEW FORM card (pops in)
 if(e.sc.card&&e.pi===e.n-1){const k=Math.min(1,t/.35),s=.6+.4*(1-Math.pow(1-k,3))+Math.sin(Math.min(1,t/.6)*3.1416)*.08;let fs=Math.max(15,Math.min(30,(side?R.w*.075:R.h*.17)));
  let fz=fs;ctx.font=`${fz}px ${FONTS}`;while(fz>12&&ctx.measureText('⭐ '+e.sc.card).width+fz*1.6>R.w-16){fz--;ctx.font=`${fz}px ${FONTS}`}fs=fz;const tw=ctx.measureText('⭐ '+e.sc.card).width+fs*1.6,cx=side?R.x+R.w/2:R.x+R.w/2,cy=y+fs*.7;
  ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.fillStyle=/NEW FORM/.test(e.sc.card)?'#2a1f4a':'#b4500a';ctx.beginPath();ctx.roundRect?ctx.roundRect(-tw/2,-fs*.75,tw,fs*1.5,fs*.75):ctx.rect(-tw/2,-fs*.75,tw,fs*1.5);ctx.fill();
  ctx.strokeStyle='#ffe14d';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#ffe14d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⭐ '+e.sc.card,0,fs*.05);ctx.restore();ctx.textBaseline='alphabetic';y+=fs*1.7}
 const maxH=bottom-y,maxW=R.w-pad*2,f0=side?Math.round(Math.min(26,Math.max(15,DH*.07))):Math.round(Math.min(30,Math.max(15,Math.min(DW,DH)*.042)));
 const {f,L}=fitText(p.cap,maxW,maxH,f0,12);ctx.fillStyle=side?'#3a2a10':'#fff';ctx.textAlign=side?'left':'center';
 const tx=side?R.x+pad:R.x+R.w/2;let ly=y+f;if(!side)ly=Math.max(ly,y+(maxH-L.length*f*1.28)/2+f);for(const l of L){ctx.fillText(l,tx,ly);ly+=f*1.28}
 // scene tag + panel dots + tap hint
 ctx.font=`${Math.max(11,Math.min(14,DH*.035))}px system-ui,sans-serif`;ctx.textAlign='left';ctx.fillStyle=side?'#3a2a1088':'#fff8';
 ctx.fillText(e.sc.id+(e.n>1?'  ·  '+(e.pi+1)+'/'+e.n:''),R.x+pad,R.y+R.h-12);
 const blink=.55+.45*Math.sin(t*4);ctx.globalAlpha=blink;ctx.textAlign='right';ctx.fillStyle=side?'#b4500a':'#ffe08a';ctx.font=`${Math.max(13,Math.min(18,DH*.045))}px ${FONTS}`;
 ctx.fillText(touchy()?'TAP ▶':'TAP / SPACE ▶   ESC = SKIP',R.x+R.w-pad,R.y+R.h-12);ctx.globalAlpha=1}
function draw(){const e=Q.list[Q.i],Lo=layout();ctx.fillStyle='#140c24';ctx.fillRect(0,0,DW,DH);
 const fade=Math.min(1,Q.t/.35);if(Q.prev&&fade<1)drawPanel(Q.prev.e,Q.prev.t,Lo.img,1);
 drawPanel(e,Q.t,Lo.img,Q.prev?fade:Math.min(1,Q.t/.25+.2));if(fade>=1)Q.prev=null;
 drawCaption(e,Lo.cap,Lo.side,Q.t);
 // progress dots across the whole queue
 const n=Q.list.length;if(n>1){const r=Math.max(3,Math.min(5,DH*.012)),gap=r*3.4,x0=(Lo.side?Lo.img.w/2:DW/2)-(n-1)*gap/2,y=Lo.side?DH-14:Lo.cap.y-14;
  for(let i=0;i<n;i++){ctx.fillStyle=i===Q.i?'#ffe14d':'#ffffff66';ctx.beginPath();ctx.arc(x0+i*gap,y,i===Q.i?r*1.3:r,0,6.283);ctx.fill()}}}
// preview: level.html?cut=w1c3 (or several: ?cut=w1a1,w1u03)
if(qs.get('cut'))addEventListener('load',()=>setTimeout(()=>CUT.play(qs.get('cut').split(','),()=>{CUT.log.push('preview:done')}),300));
})();
