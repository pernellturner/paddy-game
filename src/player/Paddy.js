import { MOVE, ATTACK } from '../config.js';
import { whoosh } from '../audio/Sfx.js';

function approach(current, target, maxDelta) {
  if (current < target) return Math.min(current + maxDelta, target);
  return Math.max(current - maxDelta, target);
}

function easeInOutSine(t) {
  const u = Math.max(0, Math.min(1, t));
  return -(Math.cos(Math.PI * u) - 1) / 2;
}

export class Paddy {
  constructor(scene, x, y) {
    this.scene = scene;
    this.facing = 1;
    this.canDouble = true;
    this.variableJump = false;
    this.jumpStartedAt = 0;
    this.coyoteUntil = 0;
    this.jumpBufferUntil = 0;
    this.landingUntil = 0;
    this.wasOnFloor = true;
    this.lastVy = 0;
    this.squashUntil = 0;
    this.squashDuration = MOVE.landDuration;
    this.squashAmount = 0;
    this.crouching = false;
    this.visSX = 1;
    this.visSY = 1;
    this.breathPhase = null;
    this.djUntil = 0;
    this.djDuration = MOVE.doubleJumpBlend;
    this.djFromVy = 0;
    this.djToVy = 0;
    this.djStart = 0;
    this.gait = 'idle';
    this.walkLeadUntil = 0;
    this.attacking = false;
    this.attackAir = false;
    this.attackPhase = null;
    this.attackFrame = 0;
    this.attackT0 = 0;
    this.attackElapsed = 0;
    this.attackQueued = false;
    this._slashOnThisStrike = false;
    this._lungeActive = false;
    this._lungeMoved = 0;
    this._lungeVxApplied = 0;

    const sprite = scene.physics.add.sprite(x, y, 'paddy', 'k_spin_00');
    sprite.setOrigin(MOVE.footX / MOVE.cellW, MOVE.footY / MOVE.cellH);
    sprite.setScale(MOVE.spriteScale);
    sprite.setCollideWorldBounds(true);
    sprite.body.setSize(MOVE.bodyWidth, MOVE.bodyHeight);
    sprite.body.setOffset(MOVE.footX - MOVE.bodyWidth / 2, MOVE.footY - MOVE.bodyHeight);
    sprite.body.setMaxVelocity(MOVE.speed * 1.4, MOVE.maxFallSpeed);
    sprite.body.setDrag(0, 0);
    sprite.setDepth(10);
    this.sprite = sprite;

    this._createAnims(scene);
    sprite.play('idle');
  }

  _createAnims(scene) {
    if (scene.anims.exists('idle')) return;
    const named = (prefix, indexes) =>
      indexes.map((i) => ({ key: 'paddy', frame: `${prefix}${String(i).padStart(2, '0')}` }));

    scene.anims.create({
      key: 'idle',
      frames: [{ key: 'paddy', frame: 'k_spin_00' }],
      frameRate: MOVE.idleFps,
      repeat: -1,
    });
    scene.anims.create({
      key: 'walk',
      frames: named('kt_walk_', MOVE.walkFrames),
      frameRate: MOVE.walkFps,
      repeat: -1,
    });
    scene.anims.create({
      key: 'run',
      frames: named('k_run_', MOVE.runFrames),
      frameRate: MOVE.runFps,
      repeat: -1,
    });
    scene.anims.create({
      key: 'crouch',
      frames: [{ key: 'paddy', frame: 'k_jump_00' }],
      frameRate: 1,
      repeat: -1,
    });
    scene.anims.create({
      key: 'jump',
      frames: named('k_jump_', [1, 2]),
      frameRate: MOVE.jumpFps,
      repeat: 0,
    });
    scene.anims.create({
      key: 'apex',
      frames: [{ key: 'paddy', frame: 'k_jump_03' }],
      frameRate: 1,
      repeat: 0,
    });
    scene.anims.create({
      key: 'fall',
      frames: [{ key: 'paddy', frame: 'k_jump_04' }],
      frameRate: 1,
      repeat: 0,
    });
    scene.anims.create({
      key: 'land',
      frames: [{ key: 'paddy', frame: 'k_jump_05' }],
      frameRate: MOVE.landFps,
      repeat: 0,
    });
  }

  _play(key, ignoreIfSame = true) {
    if (ignoreIfSame && this.sprite.anims.currentAnim?.key === key) return;
    this.sprite.play(key, true);
  }

  _frameIndex0() {
    const anim = this.sprite.anims.currentAnim;
    const frame = this.sprite.anims.currentFrame;
    if (!anim || !frame) return 0;
    const n = anim.frames.length;
    // Phaser's AnimationFrame.index is 1-based.
    let i = frame.index;
    if (i >= 1 && i <= n) i -= 1;
    return Phaser.Math.Clamp(i, 0, Math.max(0, n - 1));
  }

  _cyclePhase() {
    const anim = this.sprite.anims.currentAnim;
    const frame = this.sprite.anims.currentFrame;
    if (!anim || !frame) return 0;
    const n = anim.frames.length;
    if (n <= 0) return 0;
    const dur = frame.duration || this.sprite.anims.msPerFrame || 1;
    const frac = Math.max(0, Math.min(0.999, (this.sprite.anims.accumulator || 0) / dur));
    return (this._frameIndex0() + frac) / n;
  }

  _playCycle(key, vx = 0) {
    const cur = this.sprite.anims.currentAnim?.key;
    const keep = cur === 'walk' || cur === 'run';
    const phase = keep ? this._cyclePhase() : 0;
    if (cur !== key) {
      const anim = this.sprite.anims.animationManager.get(key);
      const n = anim ? anim.frames.length : 1;
      const raw = phase * n;
      const idx = Math.max(0, Math.min(n - 1, Math.floor(raw)));
      const into = raw - idx;
      this.sprite.play({ key, startFrame: idx, repeat: -1 });
      this._updateCycleRate(vx);
      this.sprite.anims.accumulator = into * (this.sprite.anims.msPerFrame || 0);
    } else {
      this._updateCycleRate(vx);
    }
  }

  _updateCycleRate(vx) {
    const key = this.sprite.anims.currentAnim?.key;
    let scale = 1;
    if (key === 'walk') {
      scale = Math.abs(vx) / (MOVE.speed * MOVE.walkMul);
    } else if (key === 'run') {
      scale = Math.abs(vx) / MOVE.speed;
    }
    this.sprite.anims.timeScale = Phaser.Math.Clamp(scale, 0.55, 1.3);
  }

  _pickGait(vx, inputGait, onFloor, time) {
    const speed = Math.abs(vx);
    if (!onFloor) return this.gait === 'idle' ? 'idle' : this.gait;
    if (this.crouching) return 'crouch';
    if (this.gait === 'idle') {
      if (speed < MOVE.idleSpeedOut) return 'idle';
      this.walkLeadUntil = time + (MOVE.walkLead || 120);
    } else if (speed < MOVE.idleSpeedIn) {
      this.walkLeadUntil = 0;
      return 'idle';
    }
    // A walk-intent stick/key never reaches run speed. A short walk lead
    // from idle lets one stride show before the run cycle takes over.
    if (
      inputGait === 'walk'
      || time < this.walkLeadUntil
      || speed < (this.gait === 'run' ? MOVE.runSpeedOut : MOVE.runSpeedIn)
    ) {
      return 'walk';
    }
    return 'run';
  }

  _setCrouching(on) {
    if (this.crouching === on) return;
    this.crouching = on;
    const body = this.sprite.body;
    if (on) {
      body.setSize(MOVE.crouchBodyWidth, MOVE.crouchBodyHeight);
      body.setOffset(
        MOVE.footX - MOVE.crouchBodyWidth / 2,
        MOVE.footY - MOVE.crouchBodyHeight,
      );
    } else {
      body.setSize(MOVE.bodyWidth, MOVE.bodyHeight);
      body.setOffset(
        MOVE.footX - MOVE.bodyWidth / 2,
        MOVE.footY - MOVE.bodyHeight,
      );
    }
  }

  _doJump(velocity, isDouble = false, time = 0) {
    this._setCrouching(false);
    this.sprite.setAngle(0);
    this.jumpStartedAt = this.scene.time.now;
    this.coyoteUntil = 0;
    this.jumpBufferUntil = 0;
    this.landingUntil = 0;
    this.squashUntil = 0;
    this.variableJump = true;
    if (isDouble) {
      this.djStart = time || this.scene.time.now;
      this.djUntil = this.djStart + this.djDuration;
      this.djFromVy = this.sprite.body.velocity.y;
      this.djToVy = velocity;
      this.variableJump = false; // second jump is a fixed, eased boost
      this._puff();
    } else {
      this.djUntil = 0;
      this.sprite.body.setVelocityY(velocity);
      if (!this.attacking) this._play('jump', false);
    }
  }

  _puff() {
    const x = this.sprite.x;
    const y = this.sprite.y - 6;
    for (let i = 0; i < 5; i++) {
      const r = 3 + Math.random() * 3;
      const c = this.scene.add.circle(
        x + (Math.random() - 0.5) * 18,
        y,
        r,
        0xf4f0e4,
        0.55,
      );
      c.setDepth(11);
      this.scene.tweens.add({
        targets: c,
        x: c.x + (Math.random() - 0.5) * 28,
        y: c.y - (14 + Math.random() * 18),
        alpha: 0,
        scale: 1.5,
        duration: 240 + Math.random() * 80,
        onComplete: () => c.destroy(),
      });
    }
  }

  update(time, delta, input) {
    const body = this.sprite.body;
    const onFloor = body.onFloor() || body.blocked.down;
    const dt = Math.min(delta, 32) / 1000;

    if (onFloor) {
      this.canDouble = true;
      this.coyoteUntil = time + MOVE.coyoteTime;
      if (!this.wasOnFloor) {
        this.djUntil = 0;
        this.sprite.setAngle(0);
        const impact = Math.max(0, this.lastVy);
        const t = Math.min(1, impact / MOVE.maxFallSpeed);
        this.squashAmount = MOVE.squashMin + (MOVE.squashMax - MOVE.squashMin) * t;
        this.squashDuration = MOVE.landDuration;
        this.squashUntil = time + this.squashDuration;
        this.landingUntil = time + this.squashDuration;
        if (!this.attacking) this._play('land', false);
      }
    } else {
      this._setCrouching(false);
    }
    this.wasOnFloor = onFloor;
    this.lastVy = body.velocity.y;

    if (input.consumeJumpPress()) {
      this.jumpBufferUntil = time + MOVE.jumpBuffer;
    }

    const wantsJump = time <= this.jumpBufferUntil;
    const inDouble = time < this.djUntil;
    if (wantsJump && !inDouble) {
      if (onFloor || time <= this.coyoteUntil) {
        this._doJump(MOVE.jumpVelocity, false, time);
      } else if (this.canDouble) {
        this.canDouble = false;
        this._doJump(MOVE.doubleJumpVelocity, true, time);
      }
    }

    if (time < this.djUntil) {
      const u = Phaser.Math.Clamp((time - this.djStart) / this.djDuration, 0, 1);
      body.setVelocityY(this.djFromVy + (this.djToVy - this.djFromVy) * easeInOutSine(u));
    } else if (
      this.variableJump
      && time >= this.djUntil
      && !input.jumpHeld
      && body.velocity.y < 0
      && time >= this.jumpStartedAt + MOVE.minJumpTime
    ) {
      body.setVelocityY(body.velocity.y * MOVE.jumpCutMultiplier);
      this.variableJump = false;
    }
    if (body.velocity.y >= 0 && time >= this.djUntil) this.variableJump = false;

    if (input.consumeAttackPress()) {
      if (this.attacking && this.attackPhase === 'recover') this.attackQueued = true;
      else if (this.attacking) this.attackQueued = true; // buffer one follow-up
      else this._startSwipe(time, onFloor);
    }
    if (this.attacking) this._updateSwipe(time, delta, onFloor);

    const wantCrouch = onFloor && input.crouch && !wantsJump && !this.attacking;
    this._setCrouching(wantCrouch);

    const moveX = Phaser.Math.Clamp(input.moveX || 0, -1, 1);
    const inputGait = input.gait || 'idle';
    const top = wantCrouch
      ? 0
      : (inputGait === 'walk' ? MOVE.speed * MOVE.walkMul : MOVE.speed);
    // During a swipe, ground walk/run is briefly slowed. Air movement is left alone.
    const moveScale = (this.attacking && onFloor) ? ATTACK.moveMul : 1;
    const target = wantCrouch ? 0 : moveX * top * moveScale;
    const accel = onFloor ? MOVE.accel : MOVE.airAccel;
    const decel = onFloor ? MOVE.decel : MOVE.airDecel;
    let vx = body.velocity.x;

    if (!wantCrouch && moveX !== 0) {
      if (!this.attacking) {
        this.facing = Math.sign(moveX);
        this.sprite.setFlipX(this.facing < 0);
      }
      const turning = Math.sign(vx) !== 0 && Math.sign(vx) !== Math.sign(moveX);
      const rate = turning ? decel + accel : (Math.abs(target) < Math.abs(vx) ? decel : accel);
      vx = approach(vx, target, rate * dt);
    } else {
      vx = approach(vx, 0, decel * dt);
    }
    body.setVelocityX(vx);
    // Position-step the lunge so it eases exactly 10–14px and leaves no leftover slide.
    if (this.attacking && this._lungeActive && onFloor) {
      const dur = this._lungeDuration();
      const u = dur > 0 ? Phaser.Math.Clamp((time - this.attackT0) / dur, 0, 1) : 1;
      const want = ATTACK.lungePx * easeInOutSine(u);
      const step = (want - this._lungeMoved) * this.facing;
      this._lungeMoved = want;
      if (step) this.sprite.x += step;
      if (u >= 1) this._lungeActive = false;
    }

    if (body.velocity.y > MOVE.maxFallSpeed) {
      body.setVelocityY(MOVE.maxFallSpeed);
    }

    this.gait = this._pickGait(vx, inputGait, onFloor, time);
    this._updateAnim(time, onFloor, vx, body.velocity.y);
    this._applyVisualScale(time, dt);
  }

  _updateAnim(time, onFloor, vx, vy) {
    if (this.attacking) {
      const spec = this._attackFrames()[this.attackFrame];
      if (spec) {
        this.sprite.anims.stop();
        this.sprite.setFrame(spec.frame);
      }
      this.sprite.anims.timeScale = 1;
      return;
    }
    if (!onFloor) {
      this.landingUntil = 0;
      // Pose follows actual vertical speed so the second jump eases
      // fall -> apex -> rise -> apex -> fall instead of snapping frames.
      if (vy < -90) {
        if (this.sprite.anims.currentAnim?.key !== 'jump') this._play('jump');
      } else if (vy < 90) {
        this._play('apex');
      } else {
        this._play('fall');
      }
      return;
    }
    if (this.crouching) {
      this._play('crouch');
      return;
    }
    if (time < this.landingUntil && this.sprite.anims.currentAnim?.key === 'land') {
      return;
    }
    if (this.gait === 'walk' || this.gait === 'run') {
      this._playCycle(this.gait, vx);
    } else {
      this._play('idle');
      this.sprite.anims.timeScale = 1;
    }
  }

  _applyVisualScale(time, dt) {
    const base = MOVE.spriteScale;
    let tx = 1;
    let ty = 1;
    let angle = 0;
    const inDouble = time < this.djUntil;
    if (this.attacking) {
      this.breathPhase = null;
      if (this.attackPhase === 'windup') {
        tx = ATTACK.squashX;
        ty = ATTACK.squashY;
      } else if (this.attackPhase === 'strike') {
        tx = ATTACK.stretchX;
        ty = ATTACK.stretchY;
      } else {
        tx = 1;
        ty = 1;
      }
    } else if (time < this.squashUntil && !this.crouching) {
      const t = 1 - (this.squashUntil - time) / this.squashDuration;
      const wave = Math.sin(Phaser.Math.Clamp(t, 0, 1) * Math.PI);
      const amt = this.squashAmount * wave;
      tx = 1 + amt;
      ty = 1 - amt * 1.2;
      this.breathPhase = null;
    } else if (inDouble) {
      const u = Phaser.Math.Clamp((time - this.djStart) / this.djDuration, 0, 1);
      const wave = Math.sin(u * Math.PI);
      tx = 1 - 0.06 * wave;
      ty = 1 + 0.10 * wave;
      // A slight eased lean, never a facing flip, back to 0 at the end.
      angle = Math.sin(u * Math.PI) * -10 * this.facing;
      this.breathPhase = null;
    } else if (this.sprite.anims.currentAnim?.key === 'idle') {
      if (this.breathPhase === null) {
        this.breathPhase = 0; // first idle frame is exactly scale 1
      } else {
        this.breathPhase += dt * 7;
      }
      const breath = Math.sin(this.breathPhase) * MOVE.breathAmount;
      tx = 1 - breath * 0.45;
      ty = 1 + breath;
    } else {
      this.breathPhase = null;
    }

    const rate = this.attacking ? 28 : ((tx === 1 && ty === 1) ? 14 : 20);
    this.visSX = approach(this.visSX, tx, rate * dt);
    this.visSY = approach(this.visSY, ty, rate * dt);
    if (tx === 1 && ty === 1 && Math.abs(this.visSX - 1) < 0.002 && Math.abs(this.visSY - 1) < 0.002) {
      this.visSX = 1;
      this.visSY = 1;
    }
    this.sprite.setScale(base * this.visSX, base * this.visSY);
    if (!inDouble) {
      const a = this.sprite.angle;
      if (a !== 0) this.sprite.setAngle(approach(a, 0, 180 * dt));
      if (Math.abs(this.sprite.angle) < 0.2) this.sprite.setAngle(0);
    } else {
      this.sprite.setAngle(angle);
    }

    const srcW = (this.crouching ? MOVE.crouchBodyWidth : MOVE.bodyWidth) / this.visSX;
    const srcH = (this.crouching ? MOVE.crouchBodyHeight : MOVE.bodyHeight) / this.visSY;
    const body = this.sprite.body;
    body.setSize(srcW, srcH);
    body.setOffset(MOVE.footX - srcW / 2, MOVE.footY - srcH);
  }


  _attackFrames() {
    return this.attackAir ? ATTACK.airFrames : ATTACK.groundFrames;
  }

  _startSwipe(time, onFloor) {
    this._setCrouching(false);
    this.attackAir = !onFloor;
    this.attacking = true;
    this.attackPhase = this._attackFrames()[0].phase;
    this.attackFrame = 0;
    this.attackT0 = time;
    this.attackElapsed = 0;
    this.attackQueued = false;
    this._slashOnThisStrike = false;
    this._lungeMoved = 0;
    this._lungeVxApplied = 0;
    this._lungeActive = onFloor && !this.attackAir;
    this.landingUntil = 0;
    this.squashUntil = 0;
    this.breathPhase = null;
    this.sprite.setAngle(0);
    this.sprite.anims.stop();
    this.sprite.setFrame(this._attackFrames()[0].frame);
    this.sprite.setFlipX(this.facing < 0);
    if (this._lungeActive) this._lungePuff();
  }

  _lungeDuration() {
    return this._attackFrames()
      .filter((f) => f.phase === 'windup')
      .reduce((sum, f) => sum + f.duration, 0);
  }

  _lungePuff() {
    const x = this.sprite.x;
    const y = this.sprite.y - 4;
    for (let i = 0; i < 4; i += 1) {
      const r = 2.5 + Math.random() * 3;
      const c = this.scene.add.circle(
        x + (Math.random() - 0.5) * 16,
        y,
        r,
        0xddc9a8,
        0.7,
      );
      c.setDepth(9);
      this.scene.tweens.add({
        targets: c,
        x: c.x - this.facing * (10 + Math.random() * 16) + (Math.random() - 0.5) * 8,
        y: c.y - (5 + Math.random() * 10),
        alpha: 0,
        scale: 1.8,
        duration: 260 + Math.random() * 80,
        onComplete: () => c.destroy(),
      });
    }
  }

  _updateSwipe(time, delta, onFloor) {
    this.attackElapsed += Math.min(delta, 32);
    const spec = this._attackFrames()[this.attackFrame];
    if (this.attackPhase === 'strike' && !this._slashOnThisStrike) {
      this._slashOnThisStrike = true;
      this._slashFlash();
      whoosh();
    }
    if (this.attackElapsed >= spec.duration) {
      this.attackElapsed -= spec.duration;
      this.attackFrame += 1;
      if (this.attackFrame >= this._attackFrames().length) {
        if (this.attackQueued) {
          this._startSwipe(time, onFloor);
          return;
        }
        this.attacking = false;
        this.attackPhase = null;
        this.attackFrame = 0;
        this._lungeActive = false;
        this._lungeVxApplied = 0;
        if (Math.abs(this.visSX - 1) < 0.04) this.visSX = 1;
        if (Math.abs(this.visSY - 1) < 0.04) this.visSY = 1;
        this.sprite.setScale(MOVE.spriteScale * this.visSX, MOVE.spriteScale * this.visSY);
        return;
      }
      const next = this._attackFrames()[this.attackFrame];
      this.attackPhase = next.phase;
      this.sprite.anims.stop();
      this.sprite.setFrame(next.frame);
      if (next.phase !== 'strike') this._slashOnThisStrike = false;
    }
  }

  _slashFlash() {
    const s = this.sprite;
    const dir = this.facing;
    const off = ATTACK.flashOffset || { x: 108, y: -74 };
    const x = s.x + dir * off.x;
    const y = s.y + off.y;
    const g = this.scene.add.graphics().setDepth(12);
    // Soft cyan glow, then a brighter white core. Still in front of the paw.
    const marks = [
      [-10, -4, 38, 12],
      [-2, 0, 40, 14],
      [2, 6, 36, 16],
    ];
    g.lineStyle(7, 0xb8e8ff, 0.4);
    for (const m of marks) {
      g.lineBetween(x + dir * m[0], y + m[1], x + dir * m[2], y + m[3]);
    }
    g.lineStyle(3.2, 0xffffff, 0.95);
    for (const m of marks) {
      g.lineBetween(x + dir * (m[0] + 2), y + m[1] + 1, x + dir * (m[2] - 2), y + m[3] - 1);
    }
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: ATTACK.flashLife,
      onComplete: () => g.destroy(),
    });
  }

  getHitbox() {
    if (!this.attacking || this.attackPhase !== 'strike') return null;
    const hb = ATTACK.hitbox;
    const x = this.facing < 0 ? this.sprite.x - hb.x - hb.w : this.sprite.x + hb.x;
    const y = this.sprite.y + hb.y;
    return { x, y, w: hb.w, h: hb.h };
  }

  getState() {
    const b = this.sprite.body;
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      vx: b.velocity.x,
      vy: b.velocity.y,
      onFloor: b.onFloor() || b.blocked.down,
      canDouble: this.canDouble,
      facing: this.facing,
      anim: this.sprite.anims.currentAnim?.key || null,
      frame: this.sprite.anims.currentFrame?.index ?? 0,
      frameName: this.sprite.frame?.name || this.sprite.anims.currentFrame?.frame?.name || null,
      phase: this._cyclePhase(),
      timeScale: this.sprite.anims.timeScale,
      gait: this.gait,
      crouching: this.crouching,
      scaleX: this.visSX,
      scaleY: this.visSY,
      angle: this.sprite.angle,
      bodyH: b.height,
      bodyW: b.width,
      attacking: this.attacking,
      attackPhase: this.attackPhase,
      attackFrame: this.attackFrame,
      lungeMoved: this._lungeMoved,
      hitbox: this.getHitbox(),
    };
  }
}
