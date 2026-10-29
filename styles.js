// ===================== DISTINCT CLAW / COMBO TRAILS PER FORM (v20) =====================
// Every slash is tagged with the form that made it, and each form draws its own trail shape:
// Kitty scratches, Ninja neon + shuriken, Samurai ink brush, Knight broad gold wedge, Pirate cutlass zig-zag, Gunslinger tracers,
// Light rays, Power Blade volts, Crimson ribbons, Reaper moon crescent, Shade smoke echoes, Storm forks, Dragon scales,
// Phoenix flames, Frost shards, Mecha hard-light hexes, Tide waves, Chrono dial ticks, Beast rakes, Dark Side red saber.
(function(){
const STY=['scratch','neon','ink','broad','zig','tracer','rays','volt','ribbon','crescent','smoke','fork','scale','flame','shard','hex','wave','dial','rake','saber'];
const PALS={scratch:['#ffffff','#bfe4ff'],neon:['#4ff0ff','#c77dff'],ink:['#ff3048','#ffffff'],broad:['#ffd34d','#fff3b0'],zig:['#2ec4d6','#ffd34d'],tracer:['#ffb040','#fff1c0'],
 rays:['#ffe9a0','#ffffff'],volt:['#3cc8ff','#ffffff'],ribbon:['#ff2a4a','#ffb0a0'],crescent:['#a66bff','#e6d8ff'],smoke:['#7a4cff','#c9b8ff'],fork:['#4aa8ff','#e8f6ff'],
 scale:['#ffc83a','#3fd38a'],flame:['#ff7a1a','#ffe14d'],shard:['#7fdcff','#ffffff'],hex:['#4ff0ff','#ff8a2a'],wave:['#2fd8e8','#e6ffff'],dial:['#ffd04d','#3fd0c0'],rake:['#ffb020','#ff5a2a'],saber:['#ff3040','#ffffff']};
const _slash=slash;slash=function(kind,col,o){const n=slashes.length;_slash(kind,col,o);let f=0;try{f=FORM()}catch(_){}for(let i=n;i<slashes.length;i++){slashes[i].st=f;slashes[i].seed=Math.random()*99}};
window.SLST_ON=true;
window.SLST=function(sl){if(!SLST_ON||sl.st==null)return false;const sty=STY[sl.st];if(!sty)return false;
 const prog=1-sl.l,lv=sl.lvl||0,a1=sl.a0,a2=sl.a0+sl.sweep*Math.min(1,prog*2.2+.3),lo=Math.min(a1,a2),hi=Math.max(a1,a2),A=Math.max(0,sl.l),R=sl.r,
  white=/^#fff/i.test(sl.col),[c1,c2]=PALS[sty],col=white?c2:c1,col2=white?'#ffffff':c2,head=a2,sz=1+lv*.07;
 const at=(a,r)=>[Math.cos(a)*r,Math.sin(a)*r],aT=t=>lo+(hi-lo)*t;
 const arc=(r,w,c,al)=>{ctx.globalAlpha=A*al;ctx.strokeStyle=c;ctx.lineWidth=Math.max(.5,w);ctx.beginPath();ctx.arc(0,0,Math.max(3,r),lo,hi);ctx.stroke()};
 const path=(n,fn,w,c,al)=>{ctx.globalAlpha=A*al;ctx.strokeStyle=c;ctx.lineWidth=Math.max(.5,w);ctx.beginPath();for(let j=0;j<=n;j++){const q=fn(j/n);j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke()};
 const taper=(r,w,c,al,t0,t1,inner)=>{t0=t0||0;t1=t1??1;ctx.globalAlpha=A*al;ctx.fillStyle=c;ctx.beginPath();const n=16;
  for(let j=0;j<=n;j++){const t=j/n,a=aT(t0+(t1-t0)*t),q=at(a,r+w*Math.sin(Math.PI*t));j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}
  for(let j=n;j>=0;j--){const t=j/n,a=aT(t0+(t1-t0)*t),q=at(a,r-w*(inner??.35)*Math.sin(Math.PI*t));ctx.lineTo(q[0],q[1])}ctx.closePath();ctx.fill()};
 const dot=(x,y,r,c,al)=>{ctx.globalAlpha=A*al;ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,Math.max(.5,r),0,6.283);ctx.fill()};
 const rnd=k=>{const v=Math.sin(sl.seed*13.1+k*7.7)*43758.5;return v-Math.floor(v)};
 ctx.lineCap='round';ctx.lineJoin='round';
 switch(sty){
 case 'scratch':for(let j=0;j<3;j++){const r=R-18+j*18;taper(r,(5+lv*.5)*sz,col,.95,j*.06,1-(2-j)*.06,1);taper(r,2*sz,'#fff',1,j*.06+.05,.95-(2-j)*.06,1)}break;
 case 'neon':arc(R,12*sz,col,.22);arc(R,3*sz,col,1);arc(R-10,2.4*sz,col2,1);{const [x,y]=at(head,R);ctx.save();ctx.translate(x,y);ctx.rotate(prog*18);ctx.globalAlpha=A;ctx.fillStyle='#fff';ctx.beginPath();
  for(let k=0;k<8;k++){const q=k/8*6.283,rr=k%2?4:13*sz;ctx.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}ctx.closePath();ctx.fill();ctx.restore()}break;
 case 'ink':ctx.globalCompositeOperation='source-over';taper(R,(13+lv)*sz,'#1b0d14',.85,0,1,.6);ctx.globalCompositeOperation='lighter';arc(R+(6+lv*.4)*sz,2*sz,col,.9);
  for(let k=0;k<3;k++){const [x,y]=at(aT(.2+k*.3),R+18+rnd(k)*20);ctx.save();ctx.translate(x,y);ctx.rotate(rnd(k+5)*6);ctx.globalAlpha=A*.9;ctx.fillStyle=k%2?'#ffffff':col;ctx.beginPath();ctx.ellipse(0,0,7,3.5,0,0,6.283);ctx.fill();ctx.restore()}break;
 case 'broad':{ctx.globalAlpha=A*.3;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R+8,lo,hi);ctx.closePath();ctx.fill();arc(R,(16+lv)*sz,col,.8);arc(R+6,4*sz,'#fff',1);
  const [x,y]=at(head,R);ctx.globalAlpha=A;ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-16,y);ctx.lineTo(x+16,y);ctx.moveTo(x,y-16);ctx.lineTo(x,y+16);ctx.stroke();break}
 case 'zig':path(14,t=>at(aT(t),R+(Math.floor(t*14)%2?11:-11)*sz),9*sz,col,.8);path(14,t=>at(aT(t),R+(Math.floor(t*14)%2?11:-11)*sz),3*sz,'#fff',1);
  for(let k=0;k<3;k++){const [x,y]=at(aT(.25+k*.25),R+24+rnd(k)*16);dot(x,y,6,col2,1);dot(x-1.5,y-1.5,2.4,'#fff',1)}break;
 case 'tracer':{const [x0,y0]=at(lo,R),[x1,y1]=at(hi,R);for(let k=-1;k<=1;k++){ctx.globalAlpha=A*(k?.6:1);ctx.strokeStyle=k?col:'#fff';ctx.lineWidth=(k?3:5)*sz;ctx.beginPath();ctx.moveTo(x0,y0+k*12);ctx.lineTo(x1,y1+k*12);ctx.stroke()}dot(x1,y1,10*sz,col2,.8);break}
 case 'rays':arc(R,6*sz,col,.8);for(let k=0;k<7;k++){const a=aT(k/6),[x0,y0]=at(a,R+4),[x1,y1]=at(a,R+22+lv*3+rnd(k)*10);ctx.globalAlpha=A;ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();dot(x1,y1,3,col,1)}break;
 case 'volt':case 'fork':{const jit=t=>at(aT(t),R+(Math.random()-.5)*20*sz);path(12,jit,12*sz,col,.35);path(12,jit,4*sz,col,1);path(12,jit,1.8*sz,'#fff',1);
  if(sty==='fork')for(let k=0;k<3;k++){const a=aT(.25+k*.25),[x0,y0]=at(a,R);let x=x0,y=y0;ctx.globalAlpha=A;ctx.strokeStyle=col2;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y);for(let s=0;s<4;s++){const[dx,dy]=at(a+(Math.random()-.5)*1.2,12);x+=dx;y+=dy;ctx.lineTo(x,y)}ctx.stroke()}break}
 case 'ribbon':for(let k=0;k<2;k++)path(20,t=>at(aT(t),R+Math.sin(t*12+prog*16+k*3)*9*sz),(k?3:8)*sz,k?col2:col,k?1:.85);break;
 case 'crescent':{ctx.globalAlpha=A*.85;const g=ctx.createRadialGradient(0,0,R*.6,0,0,R+20);g.addColorStop(0,'rgba(166,107,255,0)');g.addColorStop(.7,col);g.addColorStop(1,'#fff');ctx.fillStyle=g;
  taper(R,(20+lv*1.5)*sz,col,.75,0,1,.15);taper(R+(6+lv)*sz,3.5*sz,'#fff',1,.1,.9,1);break}
 case 'smoke':for(let k=2;k>=0;k--){ctx.save();ctx.translate(-k*18,k*4);arc(R,(9-k*2)*sz,k?col:col2,(1-k*.32)*.9);ctx.restore()}for(let k=0;k<4;k++){const [x,y]=at(aT(rnd(k)),R+(rnd(k+9)-.5)*20);dot(x,y,8+rnd(k+3)*8,col,.25)}break;
 case 'scale':for(let k=0;k<9;k++){const a=aT(k/8),[x,y]=at(a,R);ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);ctx.globalAlpha=A;ctx.strokeStyle=k%2?col:col2;ctx.lineWidth=4*sz;ctx.beginPath();ctx.moveTo(-10*sz,-8*sz);ctx.lineTo(0,4*sz);ctx.lineTo(10*sz,-8*sz);ctx.stroke();ctx.restore()}arc(R,2,'#fff',.8);break;
 case 'flame':taper(R,(12+lv)*sz,col,.8,0,1,.4);for(let k=0;k<8;k++){const a=aT((k+.5)/8),L=(14+lv*2)*(0.6+Math.random()*.6),[x0,y0]=at(a-.06,R+6),[x1,y1]=at(a,R+6+L),[x2,y2]=at(a+.06,R+6);
  ctx.globalAlpha=A*.9;ctx.fillStyle=k%2?col2:col;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.closePath();ctx.fill()}arc(R,3,'#fff3c0',1);break;
 case 'shard':arc(R,3,col,.6);for(let k=0;k<8;k++){const a=aT(k/7),[x,y]=at(a,R+(k%2?8:-6)),s=(8+lv*.6)*(k%2?1:.75);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalAlpha=A;ctx.fillStyle=k%2?'#fff':col;
  ctx.beginPath();ctx.moveTo(0,-s*1.7);ctx.lineTo(s*.6,0);ctx.lineTo(0,s*1.7);ctx.lineTo(-s*.6,0);ctx.closePath();ctx.fill();ctx.restore()}break;
 case 'hex':ctx.setLineDash([16,8]);arc(R,8*sz,col,.85);ctx.setLineDash([]);arc(R-9,2.5*sz,col2,1);for(const t of [0,1]){const [x,y]=at(aT(t),R);ctx.globalAlpha=A;ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();
  for(let k=0;k<=6;k++){const q=k/6*6.283;ctx.lineTo(x+Math.cos(q)*9,y+Math.sin(q)*9)}ctx.stroke()}break;
 case 'wave':path(24,t=>at(aT(t),R+Math.sin(t*14)*10*sz),9*sz,col,.8);path(24,t=>at(aT(t),R+Math.sin(t*14)*10*sz),3,'#fff',1);for(let k=0;k<5;k++){const [x,y]=at(aT(rnd(k)),R+18+rnd(k+4)*18);dot(x,y,3+rnd(k+2)*3,col2,1)}break;
 case 'dial':arc(R,4*sz,col,.9);for(let k=0;k<=8;k++){const a=aT(k/8),[x0,y0]=at(a,R-(k%2?6:12)),[x1,y1]=at(a,R+(k%2?6:12));ctx.globalAlpha=A;ctx.strokeStyle=k%2?col2:'#fff';ctx.lineWidth=k%2?2:4;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke()}
  {const [x,y]=at(head,R);ctx.globalAlpha=A*.8;ctx.strokeStyle=col2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke()}break;
 case 'rake':for(let j=0;j<3;j++){const r=R-26+j*26;taper(r,(11+lv)*sz,j===1?col2:col,.9,j*.04,1-(2-j)*.04,1);taper(r,3*sz,'#fff',1,j*.04+.08,.92-(2-j)*.04,1)}break;
 case 'saber':arc(R,(24+lv*1.5)*sz,col,.25);arc(R,10*sz,col,.95);arc(R,4*sz,'#fff',1);ctx.save();ctx.translate(-14,4);arc(R,6*sz,col,.3);ctx.restore();break}
 return true};
})();
