// ===== PADDY'S WAY HOME: title screen + story strips + cutscenes (canvas, skippable) =====
(function(){
const V=(typeof VER!=='undefined'?VER:'1');
const FONTS="'Bangers','Luckiest Guy',Impact,'Arial Black',sans-serif";
const SRC=n=>'assets/story/'+n+'.webp?v='+V;
// panels: image, caption, Ken Burns focus (fx,fy) and zoom from->to, pan direction
const INTRO=[
 {img:'p1_asleep',cap:'Stanmore Bay. Early morning. Paddy is curled up in the car, fast asleep… zzz.',fx:.72,fy:.62,z0:1.22,z1:1.04},
 {img:'p2_drive',cap:'Mum, Savannah and Hallie drive off to Silverdale. Nobody notices the fluffy stowaway!',fx:.62,fy:.55,z0:1.04,z1:1.2,px:-.06},
 {img:'p3_shop',cap:'Silverdale! Everyone pops into the shops… and Paddy keeps on dreaming.',fx:.3,fy:.4,z0:1.18,z1:1.02},
 {img:'p4_wakes',cap:'Paddy wakes up. Where am I?! He hops out to have a little look around.',fx:.6,fy:.4,z0:1.02,z1:1.25},
 {img:'p5_gone',cap:'But when he comes back… the car is GONE.',fx:.3,fy:.55,z0:1.0,z1:1.28,slow:1},
 {img:'p6_posters',cap:'Savannah and Hallie search every street with their posters. "We\'ll find you, Paddy!"',fx:.4,fy:.5,z0:1.2,z1:1.04},
 {img:'p7_determined',cap:'Paddy fluffs up his whiskers. Home is out there somewhere… time to find the way back!',fx:.55,fy:.45,z0:1.3,z1:1.0,hero:1}];
const CUTS={
 girls:[{img:'c1_girls_search',cap:'Meanwhile… Savannah and Hallie follow a trail of tiny paw prints. "He\'s close – I can feel it!"',fx:.5,fy:.6,z0:1.2,z1:1.02}],
 reunion:[{img:'c2_reunion',cap:'Stanmore Bay. Home at last! Paddy leaps into Hallie\'s arms – the whole family together again.',fx:.55,fy:.45,z0:1.25,z1:1.02,hero:1}]};
const IM={};function load(n,hi){if(IM[n])return IM[n];const im=new Image();im.decoding='async';if(hi&&'fetchPriority' in im)im.fetchPriority='high';im.src=SRC(n);IM[n]=im;im.onload=()=>{im.ok=1;if(im.decode)im.decode().catch(()=>{})};return im}
const okIm=im=>im&&im.ok&&im.naturalWidth;
// ---- DOM ----
const css=document.createElement('style');css.textContent=`
#story{position:fixed;inset:0;z-index:4;display:none;background:#1a0f2e;touch-action:none}
body.story #story{display:block}body.story #ui,body.story #lbl,body.story #hint{visibility:hidden}
#story canvas{position:absolute;inset:0;width:100%;height:100%}
#sbtns{position:absolute;left:0;right:0;bottom:max(6vh,env(safe-area-inset-bottom));display:flex;gap:2.2vw;justify-content:center;align-items:center;transition:opacity .5s}
#story.intro #sbtns{opacity:0;pointer-events:none}
.sbtn{font:clamp(16px,2.9vw,30px) ${FONTS};letter-spacing:1.5px;color:#fff;border:0;border-radius:999px;padding:.35em 1.1em;cursor:pointer;
 background:linear-gradient(#ffcf4a,#ff8a1a);box-shadow:0 .18em 0 #b4500a,0 .4em .9em #0006;text-shadow:0 2px 0 #9a3c00;-webkit-tap-highlight-color:transparent}
.sbtn.big{font-size:clamp(22px,4.4vw,48px);padding:.25em 1.4em;animation:sbob 1.6s ease-in-out infinite}
.sbtn.alt{background:linear-gradient(#5fd0ff,#2a7fe0);box-shadow:0 .18em 0 #1a4f99,0 .4em .9em #0006;text-shadow:0 2px 0 #1a4f99}
.sbtn:active{transform:translateY(.12em) scale(.97)}
@keyframes sbob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-.08em) scale(1.04)}}
#sskip{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));font:clamp(14px,2.2vw,20px) ${FONTS};letter-spacing:1px;color:#fff;background:#0007;border:2px solid #fff8;border-radius:999px;padding:.3em .9em;display:none;cursor:pointer}
#story.intro #sskip{display:block}
#rot{z-index:9}`;
document.head.appendChild(css);
const root=document.createElement('div');root.id='story';
root.innerHTML='<canvas></canvas><div id="sbtns"><button class="sbtn alt" id="sstory">📖 STORY</button><button class="sbtn big" id="splay">▶ PLAY</button><button class="sbtn alt" id="scombo">☰ COMBO LIST</button></div><button id="sskip">SKIP ⏭</button>';
document.body.appendChild(root);
const sc=root.querySelector('canvas'),g=sc.getContext('2d');
let W=0,H=0,DPR=1,logoC=null;function fit(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;sc.width=Math.round(W*DPR);sc.height=Math.round(H*DPR);logoC=null}
addEventListener('resize',fit);fit();
// ---- state ----
const S={mode:'off',t:0,seq:null,i:0,pt:0,chars:0,done:null,fade:0,end:null};
window.STORY=S;
function pauseGame(on){window.STORYPAUSE=on;document.body.classList.toggle('story',on)}
// ---- drawing helpers ----
function cover(im,fx,fy,z,px,py,alpha){if(!okIm(im))return;const iw=im.naturalWidth,ih=im.naturalHeight,s=Math.max(W/iw,H/ih)*z,dw=iw*s,dh=ih*s;
 let x=W/2-fx*dw+(px||0)*W,y=H/2-fy*dh+(py||0)*H;x=Math.min(0,Math.max(W-dw,x));y=Math.min(0,Math.max(H-dh,y));g.globalAlpha=alpha;g.drawImage(im,x,y,dw,dh);g.globalAlpha=1}
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
function buildLogo(){const s=Math.min(W*.085,H*.15),c=document.createElement('canvas'),w=Math.ceil(s*7.4),h=Math.ceil(s*2.6);c.width=w*DPR;c.height=h*DPR;const x=c.getContext('2d');x.scale(DPR,DPR);
 x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
 const word=(txt,cx,cy,size,arc,grad)=>{x.font=`${size}px ${FONTS}`;const n=txt.length;let total=0;const ws=[...txt].map(ch=>{const m=x.measureText(ch).width*1.02;total+=m;return m});let px=cx-total/2;
  const letters=ws.map((m,i)=>{const lx=px+m/2;px+=m;const k=(lx-cx)/(total/2);return {ch:txt[i],x:lx,y:cy+arc*k*k,r:k*arc*.0035}});
  for(const pass of [0,1,2,3])for(const L of letters){x.save();x.translate(L.x,L.y);x.rotate(L.r);
   if(pass===0){x.fillStyle='#2a1200';x.fillText(L.ch,size*.05,size*.09)}
   else if(pass===1){x.strokeStyle='#fff';x.lineWidth=size*.26;x.strokeText(L.ch,0,0)}
   else if(pass===2){x.strokeStyle='#5a1e00';x.lineWidth=size*.15;x.strokeText(L.ch,0,0)}
   else{const gr=x.createLinearGradient(0,-size*.45,0,size*.45);grad.forEach((c,i)=>gr.addColorStop(i/(grad.length-1),c));x.fillStyle=gr;x.fillText(L.ch,0,0)}
   x.restore()}};
 word("PADDY'S",w/2,h*.28,s*.82,-s*.18,['#fff7c2','#ffd84a','#ff9a1f']);
 word('WAY HOME',w/2,h*.68,s*1.22,s*.12,['#ffffff','#ffe36a','#ff8a1a','#e8461a']);
 // paw prints
 x.fillStyle='#fff';x.globalAlpha=.9;const paw=(px,py,r)=>{x.beginPath();x.ellipse(px,py,r,r*.85,0,0,6.283);x.fill();for(const [a,b] of [[-1.1,-1.15],[-.4,-1.55],[.4,-1.55],[1.1,-1.15]]){x.beginPath();x.arc(px+a*r*.95,py+b*r*.9,r*.38,0,6.283);x.fill()}};
 paw(w*.1,h*.3,s*.12);paw(w*.9,h*.28,s*.12);
 logoC={c,w,h}}
function drawLogo(cx,cy,t,a){if(!logoC)buildLogo();const {c,w,h}=logoC;g.save();g.globalAlpha=a;g.translate(cx,cy+Math.sin(t*1.6)*h*.025);const sc2=1+Math.sin(t*2.1)*.012;g.scale(sc2,sc2);g.rotate(Math.sin(t*.9)*.012);
 g.drawImage(c,-w/2,-h/2,w,h);
 // sheen sweep every ~3.5s
 const u=(t%3.5)/1.1;if(u<1){g.globalCompositeOperation='lighter';const sx=-w/2+u*w*1.4-w*.2;const gr=g.createLinearGradient(sx-w*.08,0,sx+w*.08,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,230,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.save();g.beginPath();g.rect(-w/2,-h/2,w,h);g.clip();g.globalAlpha=a*.9;g.fillStyle=gr;g.globalCompositeOperation='source-over';
  // draw sheen only where logo pixels are: use the logo as mask via an offscreen pass
  if(!drawLogo.m){drawLogo.m=document.createElement('canvas')}const m=drawLogo.m;if(m.width!==c.width||m.height!==c.height){m.width=c.width;m.height=c.height}const mx=m.getContext('2d');
  mx.globalCompositeOperation='source-over';mx.clearRect(0,0,m.width,m.height);mx.drawImage(c,0,0);mx.globalCompositeOperation='source-in';const gr2=mx.createLinearGradient((sx+w/2-w*.08)*DPR,0,(sx+w/2+w*.08)*DPR,0);gr2.addColorStop(0,'rgba(255,255,255,0)');gr2.addColorStop(.5,'rgba(255,255,220,.7)');gr2.addColorStop(1,'rgba(255,255,255,0)');mx.fillStyle=gr2;mx.fillRect(0,0,m.width,m.height);
  g.drawImage(m,-w/2,-h/2,w,h);g.restore()}
 g.restore()}
const motes=[];for(let i=0;i<40;i++)motes.push({x:Math.random(),y:Math.random(),r:.6+Math.random()*1.8,v:.01+Math.random()*.025,ph:Math.random()*6.3});
function drawMotes(t,a){g.save();g.globalCompositeOperation='lighter';for(const m of motes){const y=((m.y-t*m.v)%1+1)%1,x=m.x+Math.sin(t*.6+m.ph)*.01;g.globalAlpha=a*(.35+.35*Math.sin(t*2+m.ph));g.fillStyle='#ffe9a8';g.beginPath();g.arc(x*W,y*H,m.r*Math.min(W,H)/400,0,6.283);g.fill()}g.restore()}
// typewriter caption box
function caption(txt,n,a){const fs=Math.max(15,Math.min(W*.026,H*.05)),pad=fs*.8,bw=Math.min(W*.86,fs*34),x=(W-bw)/2;g.font=`${fs}px ${FONTS}`;
 const words=txt.split(' '),lines=[];let cur='';for(const wd of words){const tt=cur?cur+' '+wd:wd;if(g.measureText(tt).width>bw-pad*2&&cur){lines.push(cur);cur=wd}else cur=tt}lines.push(cur);
 const bh=lines.length*fs*1.25+pad*1.3,y=H-bh-Math.max(H*.05,14);g.save();g.globalAlpha=a*.82;g.fillStyle='#160b2a';rr(x,y,bw,bh,fs*.6);g.fill();g.globalAlpha=a;g.strokeStyle='#ffd84a';g.lineWidth=Math.max(2,fs*.12);rr(x,y,bw,bh,fs*.6);g.stroke();
 g.fillStyle='#fff';g.textBaseline='top';g.textAlign='left';let left=n;for(let i=0;i<lines.length;i++){const s=lines[i].slice(0,Math.max(0,left));left-=lines[i].length+1;g.fillText(s,x+pad,y+pad*.65+i*fs*1.25)}
 if(n>=txt.length&&Math.floor(performance.now()/450)%2){g.fillStyle='#ffd84a';g.beginPath();const bx=x+bw-pad*.9,by=y+bh-pad*.7;g.moveTo(bx-fs*.3,by-fs*.25);g.lineTo(bx+fs*.3,by-fs*.25);g.lineTo(bx,by+fs*.1);g.fill()}
 g.restore()}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function bars(a){const b=H*.07*a;g.fillStyle='#000';g.fillRect(0,0,W,b);g.fillRect(0,H-b,W,b)}
// ---- modes ----
const PANEL_T=6.2,XF=.9,CPS=38;
function startTitle(){S.mode='title';S.t=0;root.classList.remove('intro');pauseGame(true);load('key_art',true);
 setTimeout(()=>INTRO.forEach(p=>load(p.img)),1200)}
function play(seq,done,endCard){S.mode='seq';S.seq=seq;S.i=0;S.pt=0;S.chars=0;S.done=done;S.end=endCard||null;S.endT=0;root.classList.add('intro');pauseGame(true);seq.forEach((p,i)=>load(p.img,i<2))}
function next(){const p=S.seq[S.i];if(S.chars<p.cap.length){S.chars=p.cap.length;return}if(S.i<S.seq.length-1){S.prev={p,pt:S.pt};S.i++;S.pt=0;S.chars=0;S.xf=XF}else finish()}
function finish(){if(S.mode!=='seq')return;if(S.end&&S.mode!=='end'){S.mode='end';S.endT=0;return}close()}
function close(){const d=S.done;S.mode='off';root.classList.remove('intro');pauseGame(false);if(typeof last!=='undefined')last=performance.now();if(d)d()}
S.cutscene=(name,done)=>{if(CUTS[name])play(CUTS[name],done)};S.intro=done=>play(INTRO,done,'WORLD 1 · SILVERDALE');S.title=startTitle;
function toGame(){try{localStorage.setItem('paddyIntroSeen','1')}catch(e){}
 if(typeof card==='function')setTimeout(()=>{try{card('🌏 WORLD 1 · SILVERDALE','Find your way home, Paddy!','#ffd84a')}catch(e){}},300)}
document.getElementById('splay').addEventListener('click',e=>{e.preventDefault();let seen=0;try{seen=localStorage.getItem('paddyIntroSeen')}catch(_){}if(!seen)S.intro(toGame);else{close();toGame()}});
document.getElementById('sstory').addEventListener('click',e=>{e.preventDefault();S.intro(toGame)});
document.getElementById('scombo').addEventListener('click',e=>{e.preventDefault();if(typeof ov==='function')ov(true);else document.body.classList.add('ov')});
document.getElementById('sskip').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(S.mode==='seq'||S.mode==='end')close()});
sc.addEventListener('pointerdown',e=>{e.preventDefault();if(S.mode==='seq')next();else if(S.mode==='end')close()});
addEventListener('keydown',e=>{if(S.mode==='off'||document.body.classList.contains('ov'))return;
 if(S.mode==='title'){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();document.getElementById('splay').click()}return}
 e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape')close();else if(S.mode==='end')close();else next()},true);
// ---- frame loop ----
let lt=performance.now();
function frame(now){requestAnimationFrame(frame);if(S.mode==='off')return;let dt=Math.min(.05,(now-lt)/1000);lt=now;S.t+=dt;g.setTransform(DPR,0,0,DPR,0,0);
 if(S.mode==='title'){const im=IM.key_art,u=Math.min(1,S.t/1.2);g.fillStyle='#2a1640';g.fillRect(0,0,W,H);
  const z=1.12-.08*Math.min(1,S.t/14)+.012*Math.sin(S.t*.25);cover(im,.6,.5,z,Math.sin(S.t*.12)*.01,0,okIm(im)?Math.min(1,u*1.4):0);
  const vg=g.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.3,W*.5,H*.5,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(30,8,40,.55)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  drawMotes(S.t,u);if(!logoC)buildLogo();drawLogo(W*.33,H*.24+(1-ease(u))*-H*.2,S.t,ease(u));
  const ld=window.SPRITES;if(ld&&ld.total&&typeof started!=='undefined'&&!started){g.font=`${Math.max(12,H*.025)}px ${FONTS}`;g.fillStyle='#fffc';g.textAlign='center';g.fillText('loading Paddy… '+Math.round(100*(ld.loaded+ld.failed.length)/ld.total)+'%',W/2,H*.97)}
  return}
 if(S.mode==='seq'||S.mode==='end'){g.fillStyle='#000';g.fillRect(0,0,W,H);const p=S.seq[S.i];const im=IM[p.img];
  if(S.mode==='seq'&&okIm(im)){S.pt+=dt*(p.slow?.8:1);S.chars=Math.min(p.cap.length,S.chars+dt*CPS*(S.pt>.5?1:0))}
  const draw=(q,pt,a)=>{const k=ease(Math.min(1,pt/PANEL_T)),z=q.z0+(q.z1-q.z0)*k;cover(IM[q.img],q.fx,q.fy,z,(q.px||0)*k,0,a)};
  if(S.xf>0&&S.prev){S.xf=Math.max(0,S.xf-dt);S.prev.pt+=dt;draw(S.prev.p,S.prev.pt,1)}
  const fin=Math.min(1,S.pt/.7);draw(p,S.pt,S.xf>0?1-S.xf/XF:fin);
  if(p.hero){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.18+.08*Math.sin(S.t*3);const gr=g.createRadialGradient(W*.5,H*.4,0,W*.5,H*.4,W*.5);gr.addColorStop(0,'#ffd27a');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore()}
  if(!okIm(im)){g.fillStyle='#fff8';g.font=`${H*.04}px ${FONTS}`;g.textAlign='center';g.fillText('…',W/2,H/2)}
  bars(1);
  if(S.mode==='seq'){caption(p.cap,Math.floor(S.chars),Math.min(1,S.pt/.4));
   // dots
   for(let i=0;i<S.seq.length;i++){g.fillStyle=i===S.i?'#ffd84a':'#fff6';g.beginPath();g.arc(W/2+(i-(S.seq.length-1)/2)*16,H*.035,i===S.i?5:3.5,0,6.283);g.fill()}
   if(S.chars>=p.cap.length&&S.pt>PANEL_T+1.6)next()}
  else{S.endT+=dt;const a=Math.min(1,S.endT/.6),out=S.endT>2.6?Math.max(0,1-(S.endT-2.6)/.6):1;g.fillStyle=`rgba(10,5,25,${.75*a})`;g.fillRect(0,0,W,H);
   const fs=Math.min(W*.075,H*.14);g.save();g.globalAlpha=a*out;g.translate(W/2,H/2);const s=1+.3*(1-ease(a));g.scale(s,s);g.textAlign='center';g.textBaseline='middle';g.font=`${fs}px ${FONTS}`;g.lineJoin='round';
   g.lineWidth=fs*.2;g.strokeStyle='#fff';g.strokeText(S.end,0,0);g.lineWidth=fs*.1;g.strokeStyle='#5a1e00';g.strokeText(S.end,0,0);const gr=g.createLinearGradient(0,-fs/2,0,fs/2);gr.addColorStop(0,'#fff7c2');gr.addColorStop(1,'#ff8a1a');g.fillStyle=gr;g.fillText(S.end,0,0);
   g.font=`${fs*.38}px ${FONTS}`;g.fillStyle='#fff';g.fillText('Find your way home, Paddy!',0,fs*.85);g.restore();if(S.endT>3.2)close()}}
}
requestAnimationFrame(frame);
// show the title on a normal visit; tests/automation and ?nostory go straight to the game (?story forces it)
const q=location.search,auto=navigator.webdriver&&!/[?&]story/.test(q);
if(/[?&]cut=(girls|reunion)/.test(q))S.cutscene(q.match(/cut=(\w+)/)[1]);
else if(!auto&&!/[?&]nostory/.test(q))startTitle();
})();
