// Paddy's boxing moveset. Data only.
// Another character later registers its own object with CLAB.register() and does not change this one.
// Anim ids are sheets already in the game (punch33). Do not point these at new art until Pernell approves it.
(function(){
window.PADDY_MOVESET={
 id:'paddy',
 name:'Paddy',
 style:'boxing',
 form:0,
 punch:{
  jab:'bxj1', slipjab:'bxj2', cross:'bxx', hook:'bxlh', body:'bxrb', upper:'bxpu'
 },
 // On-beat upgrades. The cross has no power sheet, so it becomes the power hook (same rule as punch33).
 power:{
  jab:'bxpj', slipjab:'bxpj', cross:'bxph', hook:'bxph', body:'bxpb', upper:'bxpu'
 },
 // Press during the retract, with no direction held. The on-time / early press keeps punch33's 1-2-3-4.
 late:{
  '':'jab', jab:'hook', cross:'body', hook:'slipjab', body:'cross', upper:'jab', rec:'jab'
 },
 air:['jab','cross','hook','upper']
};
})();
