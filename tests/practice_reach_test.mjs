// Reach and hop rules for the Practice Room. Run: node tests/practice_reach_test.mjs
import {readFileSync} from 'fs';
import vm from 'vm';

const src=readFileSync(new URL('../practice-fix.js', import.meta.url), 'utf8');
const sandbox={window:{}, console, performance:{now:()=>0}};
sandbox.globalThis=sandbox.window;
vm.runInNewContext(src, sandbox);
const {reachOK, hopPlan, HOLD}=sandbox.window.PRFIX;
const fails=[];
function check(name, cond){if(!cond) fails.push(name)}

const face=1, px=400, py=470;
check('spawn jab connects', reachOK(face, px, py, px+140, py, true, 'bxj1'));
check('clear gap misses', !reachOK(face, px, py, px+320, py, true, 'bxj1'));
check('behind misses', !reachOK(face, px, py, px-180, py, true, 'bxx'));
check('just behind misses', !reachOK(face, px, py, px-40, py, true, 'bxlh'));
check('high dummy misses a ground punch', !reachOK(face, px, py, px+80, py-160, true, 'bxj1'));
check('small hop still in reach', reachOK(face, px, py, px+90, py-40, true, 'bxj1'));
check('uppercut reaches a pop', reachOK(face, px, py, px+100, py-180, true, 'bxpu'));
check('uppercut does not hit the ceiling', !reachOK(face, px, py, px+40, py-400, true, 'bxpu'));
check('ground spin misses a floater', !reachOK(face, px, py, px+20, py-200, true, 'cyclone'));
check('ground spin hits beside him', reachOK(face, px, py, px-60, py, true, 'tailwhip'));
check('air punch misses a far dummy', !reachOK(face, px, py-80, px+400, py-80, false, 'airswipe'));

const hop=hopPlan(1, 400, [{x:520, alive:true}]);
check('hop is a short arc', hop.vy<0&&hop.vy>-600&&hop.vx>200&&hop.vx<560);
const far=hopPlan(1, 400, [{x:900, alive:true}]);
check('no dummy close still hops, does not teleport', far.vx<560&&far.vx>0);
check('hold is longer than a tap', HOLD>=0.16&&HOLD<=0.25);

if(fails.length){
  console.error(fails.join('\n'));
  process.exit(1);
}
console.log('practice reach and hop rules ok');
