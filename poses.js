// ===================== DISTINCT CLAW POSES (v20) =====================
// The forms whose claw chains looked most alike now get their own drawn moves (4 frames each, swapped in lazily via SM).
(function(){
const set=(CH,i,o)=>{if(CH&&CH[i])Object.assign(CH[i],o)};
// Knight: overhead chop + shield bash
SM(3,'kn',{h2:[13,0,'kn_m_chop'],h4:[12,0,'kn_m_bash']});
set(XF[3].CH,2,{k:'over',nm:'OVERHEAD CHOP!'});set(XF[3].CH,4,{k:'thrust',nm:'SHIELD BASH!'});
// Pirate: cutlass flick + boot-and-blade
SM(4,'pi',{h2:[15,0,'pi_m_flick'],h3:[13,0,'pi_m_kick']});
set(XF[4].CH,2,{k:'up',nm:'CUTLASS FLICK!'});set(XF[4].CH,3,{k:'flat',nm:'BOOT & BLADE!'});
// Samurai: iaido quick-draw + leaping helm splitter
SM(2,'s',{h1:[16,0,'s_m_iaido'],h3:[12,0,'s_m_split']});
set(SCH,1,{k:'flat',nm:'IAIDO QUICK-DRAW!'});set(SCH,3,{k:'over',nm:'HELM SPLITTER!'});
// Mythics (form = 4 + u)
const MY2=[[11,'mst',7,{h2:['pound',{k:'over',nm:'GROUND POUND!'}],h3:['golf',{k:'rise',nm:'THUNDER SWING!'}]}],
 [14,'mfm',10,{h1:['icepunch',{k:'thrust',nm:'ICE-CLAW PUNCH!',lunge:280}],h3:['iceupper',{k:'rise',nm:'GLACIER UPPERCUT!'}]}],
 [15,'mmc',11,{h3:['rocket',{k:'thrust',nm:'ROCKET BLADE!'}],h4:['saw',{k:'spin',nm:'BUZZSAW SPIN!'}]}],
 [17,'mch',13,{h1:['thrust',{k:'thrust',nm:'CLOCK-HAND THRUST!',lunge:300}],h6:['pendulum',{k:'low',nm:'PENDULUM SWING!'}]}]];
for(const [f,pre,u,m] of MY2){const sm={};for(const h in m){sm[h]=[14,0,pre+'_m_'+m[h][0]];const i=+h.slice(1);set(UF[u].CH,i,m[h][1])}SM(f,pre,sm)}
window.POSES20=true;
})();
