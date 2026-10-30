// ===== PADDY'S WAY HOME: title screen + story strips + cutscenes (canvas, skippable) =====
(function(){
const V=(typeof VER!=='undefined'?VER:'1');
const FONTS="'Bangers','Luckiest Guy',Impact,'Arial Black',sans-serif";
const SRC=n=>'assets/story/'+n+'.webp?v='+V+'p2';
// panels: image, caption, Ken Burns focus (fx,fy) and zoom from->to, pan direction
const INTRO=[
 {img:'p1_asleep',cap:'Stanmore Bay. Early morning. Paddy is curled up in the car, fast asleep… zzz.',fx:.72,fy:.62,z0:1.22,z1:1.04},
 {img:'p2_drive',cap:'Mum, Savannah and Hallie drive off to Silverdale. Nobody notices the fluffy stowaway!',fx:.62,fy:.55,z0:1.04,z1:1.2,px:-.06},
 {img:'p3_shop',cap:'Silverdale! Everyone pops into the shops… and Paddy keeps on dreaming.',fx:.3,fy:.4,z0:1.18,z1:1.02},
 {img:'p4_wakes',cap:'Paddy wakes up. Where am I?! He hops out to have a little look around.',fx:.6,fy:.4,z0:1.02,z1:1.25},
 {img:'p5_gone',cap:'But when he comes back… the car is GONE.',fx:.3,fy:.55,z0:1.0,z1:1.28,slow:1},
 {img:'pA_empty',cap:'Back home… Paddy\'s blanket is EMPTY. "Mum… where\'s Paddy?!"',fx:.75,fy:.55,z0:1.02,z1:1.22},
 {img:'pB_calling',cap:'"PADDY! Here, puss puss!" As the sun sets, the family checks every hedge and garden. But no Paddy.',fx:.35,fy:.45,z0:1.2,z1:1.04,px:.05},
 {img:'p6_posters',cap:'Savannah and Hallie search every street with their posters. "We\'ll find you, Paddy!"',fx:.4,fy:.5,z0:1.2,z1:1.04},
 {img:'p7_determined',cap:'Paddy fluffs up his whiskers. Home is out there somewhere… time to find the way back!',fx:.55,fy:.45,z0:1.3,z1:1.0},
 {img:'p8_awakens',cap:'The beast awakens. "NOTHING stops me getting home to Savannah and Hallie!"',fx:.5,fy:.45,z0:1.25,z1:1.0,hero:1,slow:1}];
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
#sbtns{position:absolute;left:0;width:100%;top:70%;display:flex;flex-direction:column;gap:var(--bg,10px);align-items:center;transition:opacity .5s}
#sbtns .row{display:flex;gap:var(--bg,10px);justify-content:center;flex-wrap:wrap}
.sbtn.big.prac{font-size:calc(var(--fp,34px)*.78);padding:.3em 1em;background:linear-gradient(#7af0a0,#1aa35a);box-shadow:0 .18em 0 #0b6a35,0 .4em .9em #0006;text-shadow:0 2px 0 #0b5a2c}
#sprobe{position:absolute;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
#story.intro #sbtns{opacity:0;pointer-events:none}
#stip{font:600 clamp(11px,3.2vh,14px) system-ui;color:#fff;background:#0007;border-radius:999px;padding:.3em .9em;text-align:center;display:none;max-width:92vw}
body.touchy:not(.standalone) #stip{display:block}
.sbtn{font:var(--fa,20px) ${FONTS};white-space:nowrap;letter-spacing:1.5px;color:#fff;border:0;border-radius:999px;padding:.35em 1.1em;cursor:pointer;
 background:linear-gradient(#ffcf4a,#ff8a1a);box-shadow:0 .18em 0 #b4500a,0 .4em .9em #0006;text-shadow:0 2px 0 #9a3c00;-webkit-tap-highlight-color:transparent}
.sbtn.big{font-size:var(--fp,34px);padding:.25em 1.4em;animation:sbob 1.6s ease-in-out infinite}
.sbtn.alt{background:linear-gradient(#5fd0ff,#2a7fe0);box-shadow:0 .18em 0 #1a4f99,0 .4em .9em #0006;text-shadow:0 2px 0 #1a4f99}
.sbtn:active{transform:translateY(.12em) scale(.97)}
@keyframes sbob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-.08em) scale(1.04)}}
#sskip{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));font:clamp(14px,2.2vw,20px) ${FONTS};letter-spacing:1px;color:#fff;background:#0007;border:2px solid #fff8;border-radius:999px;padding:.3em .9em;display:none;cursor:pointer}
#story.intro #sskip{display:block}
#rot{z-index:9}
@media (max-height:460px){#lbl{display:none!important}}`;
document.head.appendChild(css);
const root=document.createElement('div');root.id='story';
root.innerHTML='<canvas></canvas><div id="sbtns"><div class="row"><button class="sbtn big" id="splay">▶ PLAY</button><button class="sbtn big prac" id="sprac">🥋 PRACTICE</button></div><div class="row"><button class="sbtn alt" id="sstory">📖 STORY</button><button class="sbtn alt" id="scombo">☰ COMBO LIST</button><button class="sbtn alt" id="ssett">⚙ SETTINGS</button></div><div id="stip">📱 Tip: in Safari tap Share ⬆ → <b>Add to Home Screen</b> to play fullscreen (no Safari bars)</div></div><button id="sskip">SKIP ⏭</button><div id="sprobe"></div>';
document.body.appendChild(root);
const sc=root.querySelector('canvas'),g=sc.getContext('2d');
let W=0,H=0,DPR=1,logoC=null,SA={t:0,r:0,b:0,l:0},L=null,FC={};
function insets(){const cs=getComputedStyle(root.querySelector('#sprobe'));SA={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0}}
function fit(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;sc.width=Math.round(W*DPR);sc.height=Math.round(H*DPR);logoC=null;insets();L=null;FC={}}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,250));fit();
// ---- state ----
const S={mode:'off',t:0,seq:null,i:0,pt:0,chars:0,done:null,fade:0,end:null};
window.STORY=S;
function pauseGame(on){window.STORYPAUSE=on;document.body.classList.toggle('story',on)}
// ---- drawing helpers ----
// place an image so its important area is always visible: cover the screen if that keeps visH/visW of the picture,
// otherwise shrink to fit and fill the rest with a blurred, darkened copy (feathered edges, no hard seams)
function place(im,o){const iw=im.naturalWidth,ih=im.naturalHeight,cov=Math.max(W/iw,H/ih),s0=Math.min(cov,H/(ih*(o.visH||1)),W/(iw*(o.visW||1))),s=s0*(o.z||1),dw=iw*s,dh=ih*s;
 let x=dw>=W?Math.min(0,Math.max(W-dw,(o.ax!=null?W*o.ax:W/2)-o.fx*dw+(o.px||0)*W)):o.right?W-dw:(W-dw)/2;
 let y=dh>=H?Math.min(0,Math.max(H-dh,(o.ay!=null?H*o.ay:H/2)-o.fy*dh)):(o.cy!=null?Math.max(0,Math.min(H-dh,H*o.cy-dh/2)):(H-dh)/2);
 return {x,y,dw,dh,s0,iw,ih}}
const BL={};
function blurOf(im){const k=im.src;if(BL[k])return BL[k];const c=document.createElement('canvas');c.width=40;c.height=Math.max(1,Math.round(40*im.naturalHeight/im.naturalWidth));const x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);
 const c2=document.createElement('canvas');c2.width=12;c2.height=Math.max(1,Math.round(12*c.height/c.width));c2.getContext('2d').drawImage(c,0,0,c2.width,c2.height);x.clearRect(0,0,c.width,c.height);x.imageSmoothingQuality='high';x.drawImage(c2,0,0,c.width,c.height);return BL[k]=c}
function feathered(im,r){const fl=r.x>.5,fr=r.x+r.dw<W-.5,ft=r.y>.5,fb=r.y+r.dh<H-.5,w=Math.round(r.iw*r.s0),h=Math.round(r.ih*r.s0),k=im.src+w+'x'+h+[fl,fr,ft,fb].join('');if(FC[k])return FC[k];
 const c=document.createElement('canvas');c.width=Math.round(w*DPR);c.height=Math.round(h*DPR);const x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);x.globalCompositeOperation='destination-out';
 const f=Math.round(Math.min(c.width,c.height)*.1);const edge=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const gr=x.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(rx,ry,rw,rh)};
 if(fl)edge(0,0,f,0,0,0,f,c.height);if(fr)edge(c.width,0,c.width-f,0,c.width-f,0,f,c.height);if(ft)edge(0,0,0,f,0,0,c.width,f);if(fb)edge(0,c.height,0,c.height-f,0,c.height-f,c.width,f);return FC[k]=c}
function art(im,o,alpha){if(!okIm(im))return null;const r=place(im,o);g.globalAlpha=alpha;
 if(r.dw<W-.5||r.dh<H-.5){const b=blurOf(im),bs=Math.max(W/b.width,H/b.height)*1.15;g.drawImage(b,(W-b.width*bs)/2,(H-b.height*bs)/2,b.width*bs,b.height*bs);g.fillStyle='rgba(20,8,36,.38)';g.fillRect(0,0,W,H);g.drawImage(feathered(im,r),r.x,r.y,r.dw,r.dh)}
 else g.drawImage(im,r.x,r.y,r.dw,r.dh);g.globalAlpha=1;return r}
function cover(im,fx,fy,z,px,py,alpha){if(!okIm(im))return;const iw=im.naturalWidth,ih=im.naturalHeight,s=Math.max(W/iw,H/ih)*z,dw=iw*s,dh=ih*s;
 let x=W/2-fx*dw+(px||0)*W,y=H/2-fy*dh+(py||0)*H;x=Math.min(0,Math.max(W-dw,x));y=Math.min(0,Math.max(H-dh,y));g.globalAlpha=alpha;g.drawImage(im,x,y,dw,dh);g.globalAlpha=1}
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
function buildLogo(sz){const s=sz||Math.min(W*.085,H*.15),c=document.createElement('canvas'),w=Math.ceil(s*7.4),h=Math.ceil(s*2.6);c.width=w*DPR;c.height=h*DPR;const x=c.getContext('2d');x.scale(DPR,DPR);
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
 logoC={c,w,h,s}}
function drawLogo(cx,cy,t,a,sz){if(!logoC||(sz&&Math.abs(logoC.s-sz)>.5))buildLogo(sz);const {c,w,h}=logoC;g.save();g.globalAlpha=a;g.translate(cx,cy+Math.sin(t*1.6)*h*.025);const sc2=1+Math.sin(t*2.1)*.012;g.scale(sc2,sc2);g.rotate(Math.sin(t*.9)*.012);
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
function bars(a){const b=H*(H<460?.03:.07)*a;g.fillStyle='#000';g.fillRect(0,0,W,b);g.fillRect(0,H-b,W,b)}
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
 setTimeout(()=>{try{if(window.ENW)ENW.start(0);else if(typeof card==='function')card('🌏 WORLD 1 · SILVERDALE','Find your way home, Paddy!','#ffd84a')}catch(e){}},300)}
document.getElementById('splay').addEventListener('click',e=>{e.preventDefault();let seen=0;try{seen=localStorage.getItem('paddyIntroSeen')}catch(_){}if(!seen)S.intro(toGame);else{close();toGame()}});
document.getElementById('sprac').addEventListener('click',e=>{e.preventDefault();close();if(window.TRAIN)TRAIN.open()});
document.getElementById('sstory').addEventListener('click',e=>{e.preventDefault();S.intro(toGame)});
document.getElementById('ssett').addEventListener('click',e=>{e.preventDefault();if(window.SETTINGS)SETTINGS.open()});
(function(){const st=!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches));document.body.classList.toggle('standalone',st);if(('ontouchstart' in window)||navigator.maxTouchPoints>0)document.body.classList.add('touchy')})();
document.getElementById('scombo').addEventListener('click',e=>{e.preventDefault();if(typeof ov==='function')ov(true);else document.body.classList.add('ov')});
document.getElementById('sskip').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(S.mode==='seq'||S.mode==='end')close()});
sc.addEventListener('pointerdown',e=>{e.preventDefault();if(S.mode==='seq')next();else if(S.mode==='end')close()});
addEventListener('keydown',e=>{if(S.mode==='off'||document.body.classList.contains('ov'))return;
 if(S.mode==='title'){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopImmediatePropagation();document.getElementById('splay').click()}return}
 e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape')close();else if(S.mode==='end')close();else next()},true);
// ---- title layout: Paddy's whole face stays visible; logo + buttons go in the clear sky/sea space beside (or above/below) him ----
const PAD={x0:.59,x1:.94,y0:.16,y1:.76}; // Paddy's box inside key_art (fractions)
const TOPT=z=>W>=H?{fx:.77,fy:.10,ax:.74,ay:0,visH:.78,visW:1,right:1,z}:{fx:.76,fy:.45,ax:.5,visW:.6,visH:1,cy:.5,z};
function layout(r){const bt=root.querySelector('#sbtns'),port=W<H;if(!r)r={x:0,y:0,dw:W,dh:H};
 const px0=r.x+PAD.x0*r.dw,py0=r.y+PAD.y0*r.dh,py1=r.y+PAD.y1*r.dh,t=SA.t+Math.max(8,H*.03),b=H-SA.b-Math.max(8,H*.03);
 let cx,cw,top,bot;
 if(!port){const l=SA.l+Math.max(10,W*.02);cw=Math.max(W*.36,Math.min(px0-l-W*.01,W*.6));cx=l+cw/2;top=t;bot=b}
 else{cw=W-SA.l-SA.r-24;cx=W/2;top=t;bot=b}
 const fp=Math.round(Math.max(20,Math.min(46,H*.085,cw*.11))),fa=Math.round(Math.max(13,Math.min(26,fp*.58)));
 root.style.setProperty('--fp',fp+'px');root.style.setProperty('--fa',fa+'px');root.style.setProperty('--bg',Math.round(Math.max(6,fp*.25))+'px');
 bt.style.left=(cx-cw/2)+'px';bt.style.width=cw+'px';const bh=bt.offsetHeight||fp*2.6;
 let ls,ly,by;
 if(!port){const gap=Math.max(6,H*.03),avail=bot-top-bh-gap;ls=Math.max(14,Math.min(cw*.95/7.4,avail/2.6,110));const lh=ls*2.6,tot=lh+gap+bh,y0=top+Math.max(0,(bot-top-tot)*.4);ly=y0+lh/2;by=y0+lh+gap}
 else{const artTop=Math.max(top+40,py0-10);ls=Math.max(14,Math.min(cw*.95/7.4,(artTop-top)/2.6,90));ly=top+ls*1.3;by=Math.max(py1-bh*.2,Math.min(bot-bh,r.y+r.dh+8))}
 bt.style.top=by+'px';bt.style.bottom='auto';L={ok:!!(r&&r.iw),lx:cx,ly,ls,lw:ls*7.4,by,bh,cw,cx,face:{x0:px0,y0:py0,x1:r.x+PAD.x1*r.dw,y1:py1}};window.STORY.L=L}
// ---- frame loop ----
let lt=performance.now();
function frame(now){requestAnimationFrame(frame);if(S.mode==='off')return;let dt=Math.min(.05,(now-lt)/1000);lt=now;S.t+=dt;g.setTransform(DPR,0,0,DPR,0,0);
 if(S.mode==='title'){const im=IM.key_art,u=Math.min(1,S.t/1.2);g.fillStyle='#2a1640';g.fillRect(0,0,W,H);
  const z=1.03-.03*Math.min(1,S.t/14);const r=art(im,TOPT(z),okIm(im)?Math.min(1,u*1.4):0);if(!L||!L.ok)layout(r);
  const vg=g.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.3,W*.5,H*.5,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(30,8,40,.5)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  // soft dark pool behind the logo so it reads over the bright sky/sea
  const pg=g.createRadialGradient(L.lx,L.ly,0,L.lx,L.ly,L.lw*.62);pg.addColorStop(0,`rgba(25,6,40,${.34*u})`);pg.addColorStop(1,'rgba(25,6,40,0)');g.fillStyle=pg;g.fillRect(0,0,W,H);
  drawMotes(S.t,u);drawLogo(L.lx,L.ly+(1-ease(u))*-H*.2,S.t,ease(u),L.ls);
  const ld=window.SPRITES;if(ld&&ld.total&&typeof started!=='undefined'&&!started){g.font=`${Math.max(11,Math.min(16,H*.035))}px ${FONTS}`;g.fillStyle='#fffc';g.textAlign='center';g.fillText('loading Paddy… '+Math.round(100*(ld.loaded+ld.failed.length)/ld.total)+'%',L.lx,H-SA.b-Math.max(5,H*.015))}
  return}
 if(S.mode==='seq'||S.mode==='end'){g.fillStyle='#000';g.fillRect(0,0,W,H);const p=S.seq[S.i];const im=IM[p.img];
  if(S.mode==='seq'&&okIm(im)){S.pt+=dt*(p.slow?.8:1);S.chars=Math.min(p.cap.length,S.chars+dt*CPS*(S.pt>.5?1:0))}
  const draw=(q,pt,a)=>{const k=ease(Math.min(1,pt/PANEL_T)),z=q.z0+(q.z1-q.z0)*k,im=IM[q.img];if(!okIm(im))return;const sh=W/H>2.05||W<H;if(sh)art(im,{fx:q.fx,fy:q.fy,z:1+(z-1)*.35,visH:.92,visW:W<H?.75:1,cy:.42},a);else cover(im,q.fx,q.fy,z,(q.px||0)*k,0,a)};
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
