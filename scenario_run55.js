// Scenario run experiment: NO changes to original controls, movement, attacks, or index.html.
// Loaded only by scenario-run-test.html, the separate Practice Room preview.
// Asset: Paddy.mp4 supplied by the game owner, converted to 12 transparent run frames.
(function () {
  'use strict';
  if (typeof FR === 'undefined' || typeof IMG === 'undefined' || typeof drawFrame !== 'function' || !window.PRACTICE) return;
  const W = 288, H = 194, COUNT = 12;
  const frames = Array.from({length: COUNT}, (_, i) => ({
    f: 'scenario_run55_sheet', scenario55: i,
    sx: (i % 4) * W, sy: Math.floor(i / 4) * H,
    ax: 140, ay: 172, w: W, h: H
  }));
  const sheet = new Image();
  let ready = false, enabled = false, original = null;
  let btn = null;
  // Use existing game's animation state and touch/key controller, not a second control system.
  function allowed() {
    return enabled && ready && PRACTICE.on &&
      document.body.classList.contains('proom') &&
      typeof FORM === 'function' && FORM() === 0;
  }
  function sync() {
    const should = allowed();
    if (should) {
      if (FR.run && FR.run !== frames) { original = FR.run; FR.run = frames; }
    } else if (FR.run === frames && original) {
      FR.run = original;
    }
    if (btn) {
      btn.textContent = enabled ? '🏃 NEW RUN' : '🏃 OLD RUN';
      btn.classList.toggle('cur', allowed());
      btn.title = ready ? 'Compare Scenario and original running art' : 'Loading Scenario running art';
    }
  }
  const previousDrawFrame = drawFrame;
  drawFrame = function (f, x, y, face, alpha) {
    if (f && Number.isInteger(f.scenario55) && ready) {
      const i = f.scenario55;
      ctx.save();
      if (alpha != null) ctx.globalAlpha *= alpha;
      ctx.translate(x, y);
      ctx.scale(face * SC, SC);
      ctx.drawImage(sheet, (i % 4) * W, Math.floor(i / 4) * H, W, H,
        -f.ax, -f.ay, W, H);
      ctx.restore();
      return;
    }
    return previousDrawFrame.apply(this, arguments);
  };
  function toggle(ev) {
    if (ev) ev.preventDefault();
    if (!ready) return;
    enabled = !enabled;
    sync();
  }
  const bar = document.getElementById('prbar');
  if (bar) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'scenarioRunToggle';
    btn.className = 'tap';
    btn.textContent = '🏃 OLD RUN';
    btn.title = 'Toggle Scenario running artwork';
    btn.addEventListener('click', toggle);
    bar.insertBefore(btn, bar.querySelector('#prreset'));
  }
  sheet.onload = function () {
    ready = sheet.naturalWidth === W * 4 && sheet.naturalHeight === H * 3;
    if (ready) IMG.scenario_run55_sheet = sheet;
    else if (btn) btn.textContent = 'RUN ART ERROR';
    sync();
  };
  sheet.onerror = function () {
    ready = false;
    if (btn) btn.textContent = 'RUN ART ERROR';
  };
  sheet.src = 'assets/scenario/paddy_run_12.webp?v=55';
  // The mode is entirely optional and automatically restores original art on room exit.
  setInterval(sync, 120);
  window.SCENARIO_RUN55 = { get ready(){return ready}, get enabled(){return enabled}, get active(){return FR.run === frames}, frames: COUNT, toggle };
}());