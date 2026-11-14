import { TOUCH } from '../config.js';

/**
 * Shared input from the left-side virtual stick, the jump button, and the keyboard.
 *
 * Stick, as a fraction of its radius:
 *   below stickDeadzone (0.15) = stop
 *   0.15–0.55 = walk
 *   0.60 and above = run
 *   a clearly downward hold (0.45, more down than sideways) = crouch
 *
 * Keyboard: arrows / WASD run, hold Shift to walk, Down / S to crouch.
 * moveX is the facing direction (-1, 0, 1). gait is 'idle' | 'walk' | 'run'.
 */
export class InputState {
  constructor() {
    this.moveX = 0;
    this.gait = 'idle';
    this.crouch = false;
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this._jumpQueued = false;
    this._attackQueued = false;
    this._touchMoveX = 0;
    this._touchGait = 'idle';
    this._touchCrouch = false;
    this._touchActive = false;
    this._keyMoveX = 0;
    this._keyGait = 'idle';
    this._keyCrouch = false;
    this._keyShift = false;
    this._keyJump = false;
    this._touchJump = false;
    this._stickGait = 'idle';
  }

  queueJump() {
    this._jumpQueued = true;
  }

  consumeJumpPress() {
    if (this._jumpQueued) {
      this._jumpQueued = false;
      return true;
    }
    return false;
  }

  queueAttack() {
    this._attackQueued = true;
  }

  consumeAttackPress() {
    if (this._attackQueued) {
      this._attackQueued = false;
      return true;
    }
    return false;
  }

  sync() {
    if (this._touchActive) {
      this.crouch = this._touchCrouch;
      this.moveX = this.crouch ? 0 : this._touchMoveX;
      this.gait = this.crouch ? 'idle' : this._touchGait;
    } else {
      this.crouch = this._keyCrouch;
      this.moveX = this.crouch ? 0 : this._keyMoveX;
      this.gait = this.crouch ? 'idle' : this._keyGait;
    }
    this.left = this.moveX < 0;
    this.right = this.moveX > 0;
    this.jumpHeld = this._keyJump || this._touchJump;
  }
}

export function hookKeyboard(scene, input) {
  const kb = scene.input.keyboard;
  const left = kb.addKey('LEFT', true, false);
  const right = kb.addKey('RIGHT', true, false);
  const a = kb.addKey('A', true, false);
  const d = kb.addKey('D', true, false);
  const down = kb.addKey('DOWN', true, false);
  const s = kb.addKey('S', true, false);
  const onShift = (e) => { input._keyShift = !!e.shiftKey; };
  window.addEventListener('keydown', onShift);
  window.addEventListener('keyup', onShift);
  const up = kb.addKey('UP', true, false);
  const w = kb.addKey('W', true, false);
  const space = kb.addKey('SPACE', true, false);
  const xKey = kb.addKey('X', true, false);
  const jKey = kb.addKey('J', true, false);
  const zKey = kb.addKey('Z', true, false);

  const onJumpDown = () => {
    input._keyJump = true;
    input.queueJump();
  };
  const onJumpUp = () => {
    input._keyJump = false;
  };

  up.on('down', onJumpDown);
  w.on('down', onJumpDown);
  space.on('down', onJumpDown);
  up.on('up', onJumpUp);
  w.on('up', onJumpUp);
  space.on('up', onJumpUp);

  const onAttackDown = () => input.queueAttack();
  xKey.on('down', onAttackDown);
  jKey.on('down', onAttackDown);
  zKey.on('down', onAttackDown);

  scene.events.on('update', () => {
    const l = left.isDown || a.isDown;
    const r = right.isDown || d.isDown;
    input._keyCrouch = down.isDown || s.isDown;
    input._keyMoveX = (r ? 1 : 0) - (l ? 1 : 0);
    if (input._keyMoveX === 0) input._keyGait = 'idle';
    else input._keyGait = input._keyShift ? 'walk' : 'run';
    input.sync();
  });
}

/**
 * Map a stick offset to direction + gait.
 * dx/dy are pixels from the stick centre (down is positive dy, matching pointer coords).
 * lastGait is used for hysteresis between 0.55 and 0.60.
 */
export function gaitFromStick(dx, dy, radius, lastGait = 'idle') {
  const dead = radius * TOUCH.stickDeadzone;
  const walkEnd = radius * TOUCH.stickWalkEnd;
  const runStart = radius * TOUCH.stickRunStart;
  const crouchDown = radius * TOUCH.stickCrouch;

  if (dy >= crouchDown && dy >= Math.abs(dx)) {
    return { moveX: 0, gait: 'idle', crouch: true };
  }

  const ax = Math.abs(dx);
  if (ax <= dead) {
    return { moveX: 0, gait: 'idle', crouch: false };
  }

  const sign = Math.sign(dx);
  let gait;
  if (ax >= runStart) gait = 'run';
  else if (ax <= walkEnd) gait = 'walk';
  else gait = lastGait === 'run' ? 'run' : 'walk';

  return { moveX: sign, gait, crouch: false };
}

export function mountTouchControls(input) {
  const ui = document.getElementById('touch-ui');
  const stick = document.getElementById('stick');
  const base = document.getElementById('stick-base');
  const knob = document.getElementById('stick-knob');
  const jumpBtn = document.getElementById('jump-btn');
  const attackBtn = document.getElementById('attack-btn');
  if (!ui || !stick || !base || !knob || !jumpBtn || !attackBtn) return;

  ui.classList.add('ready');

  const radius = TOUCH.stickRadius;
  let stickId = null;
  let jumpId = null;
  let attackId = null;
  let originX = 0;
  let originY = 0;

  const resetKnob = () => {
    knob.style.transform = 'translate(-50%, -50%)';
    input._touchMoveX = 0;
    input._touchGait = 'idle';
    input._touchCrouch = false;
    input._touchActive = false;
    input._stickGait = 'idle';
    input.sync();
  };

  const setStickFromEvent = (e) => {
    const dx = e.clientX - originX;
    const dy = e.clientY - originY;
    const dist = Math.hypot(dx, dy);
    const clamp = dist > radius ? radius / dist : 1;
    const kx = dx * clamp;
    const ky = dy * clamp;
    knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
    const result = gaitFromStick(kx, ky, radius, input._stickGait);
    input._stickGait = result.gait;
    input._touchMoveX = result.moveX;
    input._touchGait = result.gait;
    input._touchCrouch = result.crouch;
    input._touchActive = true;
    input.sync();
  };

  const startStick = (e) => {
    if (stickId !== null) return;
    if (e.pointerId === jumpId || e.pointerId === attackId) return;
    stickId = e.pointerId;
    const rect = base.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
    stick.classList.add('active');
    try { stick.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    setStickFromEvent(e);
  };

  const moveStick = (e) => {
    if (e.pointerId !== stickId) return;
    setStickFromEvent(e);
  };

  const endStick = (e) => {
    if (e.pointerId !== stickId) return;
    stickId = null;
    stick.classList.remove('active');
    resetKnob();
  };

  stick.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startStick(e);
  });
  stick.addEventListener('pointermove', (e) => {
    e.preventDefault();
    moveStick(e);
  });
  stick.addEventListener('pointerup', endStick);
  stick.addEventListener('pointercancel', endStick);
  stick.addEventListener('lostpointercapture', endStick);

  const startJump = (e) => {
    if (jumpId !== null) return;
    if (e.pointerId === stickId || e.pointerId === attackId) return;
    e.preventDefault();
    jumpId = e.pointerId;
    jumpBtn.classList.add('active');
    input._touchJump = true;
    input.queueJump();
    input.sync();
    try { jumpBtn.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };

  const endJump = (e) => {
    if (e.pointerId !== jumpId) return;
    jumpId = null;
    jumpBtn.classList.remove('active');
    input._touchJump = false;
    input.sync();
  };

  jumpBtn.addEventListener('pointerdown', startJump);
  jumpBtn.addEventListener('pointerup', endJump);
  jumpBtn.addEventListener('pointercancel', endJump);
  jumpBtn.addEventListener('lostpointercapture', endJump);

  const startAttack = (e) => {
    if (attackId !== null) return;
    if (e.pointerId === stickId || e.pointerId === jumpId) return;
    e.preventDefault();
    attackId = e.pointerId;
    attackBtn.classList.add('active');
    input.queueAttack();
    input.sync();
    try { attackBtn.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };
  const endAttack = (e) => {
    if (e.pointerId !== attackId) return;
    attackId = null;
    attackBtn.classList.remove('active');
  };
  attackBtn.addEventListener('pointerdown', startAttack);
  attackBtn.addEventListener('pointerup', endAttack);
  attackBtn.addEventListener('pointercancel', endAttack);
  attackBtn.addEventListener('lostpointercapture', endAttack);

  const showTouch = () => ui.classList.remove('kb');
  const hideTouch = () => ui.classList.add('kb');
  window.addEventListener('touchstart', showTouch, { passive: true });
  window.addEventListener('keydown', hideTouch, { passive: true });
}
