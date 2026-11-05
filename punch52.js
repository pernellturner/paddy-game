// ===================== v52: SMOOTHER PUNCH-PUNCH-PUNCH (base Paddy string punches) =====================
// Pernell 6 Nov 2026: "make his punching smoother … for a smoother punch, punch, punch".
// The string sheets are 12 fps. Every time a punch frame changes we now draw a longer, stronger in-between: the previous frame
// fades out under the new one over ~80 ms (game.js fPrev/fB onion pass, was 45 ms at 1/3 opacity), which reads as an extra
// in-between frame on every step of the jab / cross / hook / body string, incl. the cancel into the next punch.
// Same frames, same draw scale (size unchanged); hits, timing and the uppercut (uc49) are untouched.
(function(){
if(typeof p==='undefined'||!window.P33||typeof r11Sq!=='function')return;
const S=new Set(['bxj1','bxj2','bxx','bxlh','bxrb','bxpj','bxph','bxpb','bxrec']);
const W=window.PUNCH52={n:0,on:true};let lastF=null,lastA='';
const _sq=r11Sq;r11Sq=function(){const s=_sq();try{if(W.on&&FORM()===0&&p.state==='claw'&&S.has(p.anim)){const f=(FR[p.anim]||[])[p.fi];
  if(f&&lastF&&f!==lastF&&!p.hunt){p.fPrev=lastF;p.fB=.08;W.n++}lastF=f;lastA=p.anim}else lastF=null}catch(_){}return s};
})();
