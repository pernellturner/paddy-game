import { TOUCH } from '../config.js';

/**
 * Shared input, filled by a left-side virtual stick + right-side jump button
 * (DOM overlay, multi-touch safe) and by the keyboard.
 */
export class InputState {
  constructor() {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this._jumpQueued = false;
    this._touchLeft = false;
    this._touchRight = false;
    this._keyLeft = false;
    this._keyRight = false;
    this._keyJump = false;
    this._touchJump = false;
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

  sync() {
    this.left = this._keyLeft || this._touchLeft;
    this.right = this._keyRight || this._touchRight;
    this.jumpHeld = this._keyJump || this._touchJump;
  }
}

export function hookKeyboard(scene, input) {
  const kb = scene.input.keyboard;
  const left = kb.addKey('LEFT', true, false);
  const right = kb.addKey('RIGHT', true, false);
  const a = kb.addKey('A', true, false);
  const d = kb.addKey('D', true, false);
  const up = kb.addKey('UP', true, false);
  const w = kb.addKey('W', true, false);
  const space = kb.addKey('SPACE', true, false);

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

  scene.events.on('update', () => {
    input._keyLeft = left.isDown || a.isDown;
    input._keyRight = right.isDown || d.isDown;
    input.sync();
  });
}

export function mountTouchControls(input) {
  const ui = document.getElementById('touch-ui');
  const stick = document.getElementById('stick');
  const base = document.getElementById('stick-base');
  const knob = document.getElementById('stick-knob');
  const jumpBtn = document.getElementById('jump-btn');
  if (!ui || !stick || !base || !knob || !jumpBtn) return;

  ui.classList.add('ready');

  const radius = TOUCH.stickRadius;
  const dead = TOUCH.stickDeadzone;
  let stickId = null;
  let jumpId = null;
  let originX = 0;
  let originY = 0;

  const resetKnob = () => {
    knob.style.transform = 'translate(-50%, -50%)';
    input._touchLeft = false;
    input._touchRight = false;
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
    input._touchLeft = kx < -dead;
    input._touchRight = kx > dead;
    input.sync();
  };

  const startStick = (e) => {
    if (stickId !== null) return;
    if (e.pointerId === jumpId) return;
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
    if (e.pointerId === stickId) return;
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

  // Hide the on-screen stick/button when a keyboard is clearly in use,
  // show them again on a touch. They stay in the DOM either way.
  const showTouch = () => ui.classList.remove('kb');
  const hideTouch = () => ui.classList.add('kb');
  window.addEventListener('touchstart', showTouch, { passive: true });
  window.addEventListener('keydown', hideTouch, { passive: true });
}
