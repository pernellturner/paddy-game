// Tiny synthesised swipe whoosh + hit thump. Nothing plays until the first
// user tap or key, so iOS will actually allow the AudioContext to start.
// Phaser's own audio stays off; this uses the Web Audio API directly.

let ac = null;
let master = null;
let unlocked = false;

export const Sfx = {
  unlocked: false,
  whooshCount: 0,
  thumpCount: 0,
};

function ctx() {
  if (!ac) {
    const ACx = window.AudioContext || window.webkitAudioContext;
    if (!ACx) return null;
    ac = new ACx();
    master = ac.createGain();
    master.gain.value = 0.7;
    master.connect(ac.destination);
  }
  return ac;
}

export function unlock() {
  const c = ctx();
  if (!c) return;
  if (c.state !== 'running') {
    try {
      const p = c.resume();
      if (p && p.then) p.catch(() => {});
    } catch (_) { /* ignore */ }
  }
  unlocked = true;
  Sfx.unlocked = true;
}

export function attachUnlock() {
  const once = () => unlock();
  for (const ev of ['pointerdown', 'touchstart', 'keydown', 'click']) {
    window.addEventListener(ev, once, { capture: true, passive: true });
  }
}

function noiseBuffer(c, dur) {
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i += 1) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function whoosh() {
  if (!unlocked) return;
  const c = ctx();
  if (!c || c.state !== 'running') return;
  const t0 = c.currentTime;
  const dur = 0.11;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(420, t0);
  bp.frequency.exponentialRampToValueAtTime(2400, t0 + dur);
  bp.Q.value = 0.85;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.32, t0 + 0.018);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
  Sfx.whooshCount += 1;
}

export function thump() {
  if (!unlocked) return;
  const c = ctx();
  if (!c || c.state !== 'running') return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t0);
  osc.frequency.exponentialRampToValueAtTime(52, t0 + 0.1);
  const og = c.createGain();
  og.gain.setValueAtTime(0.0001, t0);
  og.gain.exponentialRampToValueAtTime(0.45, t0 + 0.008);
  og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
  osc.connect(og);
  og.connect(master);
  osc.start(t0);
  osc.stop(t0 + 0.12);

  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.05);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(900, t0);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.0001, t0);
  ng.gain.exponentialRampToValueAtTime(0.22, t0 + 0.004);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
  src.connect(lp);
  lp.connect(ng);
  ng.connect(master);
  src.start(t0);
  src.stop(t0 + 0.06);
  Sfx.thumpCount += 1;
}
