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
export const PLATFORMS = [
  { x: 520, y: 268, w: 200, h: 22 },
  { x: 820, y: 200, w: 170, h: 22 },
  { x: 1120, y: 268, w: 150, h: 22 },
  { x: 1480, y: 230, w: 220, h: 22 },
  { x: 1840, y: 160, w: 160, h: 22 },
  { x: 2140, y: 230, w: 180, h: 22 },
  { x: 2500, y: 200, w: 200, h: 22 },
];

export const MOVE = {
  speed: 300,
  accel: 1800,
  decel: 2000,
  airAccel: 1400,
  airDecel: 900,
  gravity: 1700,
  jumpVelocity: -640,
  doubleJumpVelocity: -580,
  jumpCutMultiplier: 0.45,
  maxFallSpeed: 820,
  coyoteTime: 110,
  jumpBuffer: 130,
  spriteScale: 0.55,
  // Physics body, in texture (unscaled atlas cell) pixels.
  // Atlas cell is 241x247 with the foot at (134, 245).
  bodyWidth: 90,
  bodyHeight: 100,
  footX: 134,
  footY: 245,
  idleFps: 6,
  runFps: 14,
  jumpFps: 16,
  landFps: 10,
  runAnimThreshold: 40,
};

export const CAMERA = {
  lerp: 0.12,
  deadzoneX: 70,
  deadzoneY: 40,
};

export const TOUCH = {
  stickRadius: 56,
  stickDeadzone: 14,
  jumpRadius: 42,
};
