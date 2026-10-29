// ===================== v20f: distinct claw poses for the rest of the forms =====================
// Each form gets two newly drawn chain hits so its claw chain reads as different moves, not just different trails.
(function(){
const set=(CH,i,o)=>{if(CH&&CH[i])Object.assign(CH[i],o)};
// Kitty (form 0): paw-boxing jab + pounce slam
SM(0,'',{pc1:[28,0,'k_m_box'],pc8:[22,0,'k_m_slam']});
set(CLAWS,1,{k:'thrust',nm:'PAW BOXING!'});set(CLAWS,8,{k:'over',nm:'POUNCE SLAM!'});
if(window.NAMES)Object.assign(NAMES,{pc1:'PAW BOXING!',pc8:'POUNCE SLAM!'});
// [form, prefix, UF index, {hit:[sheet, frames|null, {chain overrides}]}]
const L=[[5,'gs',1,{h2:['qdraw',[0,1,2],{k:'thrust',nm:'QUICK-DRAW BONK!'}],h5:['lasso',0,{k:'spin',nm:'LASSO SPIN!'}]}],
 [6,'lp',2,{h2:['lunge',0,{k:'thrust',nm:'SOLAR LUNGE!',lunge:300}],h5:['halo',0,{k:'spin',nm:'HALO SPIN!'}]}],
 [7,'pb',3,{h2:['splitter',0,{k:'over',nm:'GROUND SPLITTER!'}],h5:['charge',0,{k:'thrust',nm:'SHOULDER CHARGE!',lunge:340}]}],
 [8,'cb',4,{h2:['flip',0,{k:'rise',nm:'SOMERSAULT SLASH!'}],h5:['thrust',0,{k:'thrust',nm:'CRIMSON THRUST!',lunge:320}]}],
 [9,'sr',5,{h2:['sweep',0,{k:'low',nm:'SCYTHE SWEEP!'}],h5:['vault',0,{k:'rise',nm:'POLE-VAULT KICK!'}]}],
 [10,'sh',6,{h2:['upper',0,{k:'rise',nm:'SHADOW UPPERCUT!'}],h5:['whirl',0,{k:'spin',nm:'CLOAK WHIRL!'}]}],
 [12,'mde',8,{h2:['vault',0,{k:'rise',nm:'SPEAR VAULT KICK!'}],h5:['twirl',0,{k:'spin',nm:'DRAGON TWIRL!'}]}],
 [13,'mph',9,{h2:['buffet',0,{k:'flat',nm:'WING BUFFET!'}],h5:['divekick',[0,1,2],{k:'thrust',nm:'FLAME DIVE KICK!',lunge:330}]}],
 [16,'mtc',12,{h2:['jab',0,{k:'thrust',nm:'TRIDENT TRIPLE-JAB!'}],h5:['wave',0,{k:'low',nm:'WAVE SWEEP!'}]}],
 [18,'mbk',14,{h2:['pounce',0,{k:'thrust',nm:'LION POUNCE!',lunge:320}],h5:['upper',0,{k:'rise',nm:'ROYAL UPPERCUT!'}]}]];
for(const [f,pre,u,m] of L){const sm={};for(const h in m){const [sh,idx,o]=m[h];sm[h]=[14,0,pre+'_m_'+sh,idx||null];set(UF[u]&&UF[u].CH,+h.slice(1),o)}SM(f,pre,sm)}
window.POSES20F=true;})();
