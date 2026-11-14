// All movement and layout numbers live here so they are easy to tweak.

export const GAME = {
  width: 844,
  height: 390,
  backgroundColor: '#7eb8d8',
};

export const WORLD = {
  width: 3000,
  height: 390,
  groundTop: 350,
  groundDepth: 80,
  spawnX: 180,
  spawnY: 350,
};

// Raised platforms (x, y = top of platform, width, height).
// Tallest step from the ground is 175px (the 175 platform). A full jump
// reaches about 148px, so that top shelf is a double-jump (or a step up
// from the 230 platform, a 55px hop). Every single step is well under
// a full jump, with a comfortable margin even on a short tap.
export const PLATFORMS = [
  { x: 520, y: 268, w: 200, h: 22 },
  { x: 820, y: 200, w: 170, h: 22 },
  { x: 1120, y: 268, w: 150, h: 22 },
  { x: 1480, y: 230, w: 220, h: 22 },
  { x: 1840, y: 175, w: 180, h: 22 },
  { x: 2140, y: 230, w: 180, h: 22 },
  { x: 2500, y: 200, w: 200, h: 22 },
];

export const MOVE = {
  speed: 350,
  accel: 3000, // reaches top speed in about 0.12s
  decel: 3600, // stops in about 0.1s
  airAccel: 2200,
  airDecel: 1400,
  gravity: 1750,
  jumpVelocity: -720, // apex ≈ 148px; first platform is 82px up
  doubleJumpVelocity: -600, // smaller, distinct second boost (apex ≈ 103px)
  jumpCutMultiplier: 0.65,
  minJumpTime: 120, // ms before a release can shorten the jump
  maxFallSpeed: 860,
  coyoteTime: 100,
  jumpBuffer: 130,
  spriteScale: 0.55,
  breathAmount: 0.03,
  landDuration: 100,
  squashMin: 0.07,
  squashMax: 0.18,
  // Physics body, in texture (unscaled atlas cell) pixels.
  // Atlas cell is 263x250 with the foot at (143, 248).
  cellW: 263,
  cellH: 250,
  bodyWidth: 90,
  bodyHeight: 100,
  footX: 143,
  footY: 248,
  idleFps: 1,
  runFps: 16,       // frame rate at full run speed
  jumpFps: 16,
  walkFps: 11,      // frame rate at walk speed
  landFps: 10,
  // Drop the hitching frames (walk 03 changes angle/tail side; run 01 and 07
  // are extreme gathers that pop against the extended strides).
  walkFrames: [0, 1, 2, 4, 5],
  runFrames: [0, 2, 3, 4, 5, 6],
  idleSpeedIn: 22,   // drop to idle below this
  idleSpeedOut: 40,  // leave idle above this
  runSpeedIn: 230,   // start the run cycle above this
  runSpeedOut: 185,  // return to walk below this
  runAnimThreshold: 40,
  walkLead: 120, // ms of walk after leaving idle before a run can start
  doubleJumpBlend: 180, // ms to ease into the second jump
  walkMul: 0.45, // walk speed as a fraction of run
  crouchBodyWidth: 110,
  crouchBodyHeight: 58,
};

export const CAMERA = {
  lerp: 0.12,
  deadzoneX: 70,
  deadzoneY: 40,
};

export const TOUCH = {
  stickRadius: 56,
  // Fractions of the stick radius. A light push walks, a firm push runs.
  stickDeadzone: 0.15, // below this, no move
  stickWalkEnd: 0.55,  // 0.15–0.55 = walk
  stickRunStart: 0.60, // 0.60 and above = run
  stickCrouch: 0.45,   // downward hold = crouch
  jumpRadius: 42,
};
