import { MOVE } from '../config.js';

function approach(current, target, maxDelta) {
  if (current < target) return Math.min(current + maxDelta, target);
  return Math.max(current - maxDelta, target);
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
    this.popUntil = 0;
    this.popDuration = 90;
    this.flipping = false;
    this.crouching = false;

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
    const frames = (prefix, start, end) =>
      scene.anims.generateFrameNames('paddy', { prefix, start, end, zeroPad: 2 });

    scene.anims.create({
      key: 'idle',
      frames: [{ key: 'paddy', frame: 'k_spin_00' }],
      frameRate: MOVE.idleFps,
      repeat: -1,
    });
    scene.anims.create({
      key: 'walk',
      frames: frames('kt_walk_', 0, 5),
      frameRate: MOVE.walkFps,
      repeat: -1,
    });
    scene.anims.create({
      key: 'run',
      frames: frames('k_run_', 0, 7),
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
      frames: frames('k_jump_', 1, 2),
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
    scene.anims.create({
      key: 'flip',
      frames: frames('k_spin_', 1, 5),
      frameRate: MOVE.flipFps,
      repeat: 0,
    });
  }

  _play(key, ignoreIfSame = true) {
    if (ignoreIfSame && this.sprite.anims.currentAnim?.key === key) return;
    this.sprite.play(key, true);
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

  _doJump(velocity, isDouble = false) {
    this._setCrouching(false);
    this.sprite.body.setVelocityY(velocity);
    this.variableJump = true;
    this.jumpStartedAt = this.scene.time.now;
    this.coyoteUntil = 0;
    this.jumpBufferUntil = 0;
    this.landingUntil = 0;
    this.squashUntil = 0;
    if (isDouble) {
      this.flipping = true;
      this._play('flip', false);
      this.popUntil = this.scene.time.now + this.popDuration;
      this._puff();
    } else {
      this.flipping = false;
      this._play('jump', false);
    }
  }

  _puff() {
    const x = this.sprite.x;
    const y = this.sprite.y - 6;
    for (let i = 0; i < 6; i++) {
      const r = 3 + Math.random() * 4;
      const c = this.scene.add.circle(
        x + (Math.random() - 0.5) * 22,
        y,
        r,
        0xf4f0e4,
        0.75,
      );
      c.setDepth(11);
      this.scene.tweens.add({
        targets: c,
        x: c.x + (Math.random() - 0.5) * 36,
        y: c.y - (16 + Math.random() * 22),
        alpha: 0,
        scale: 1.7,
        duration: 220 + Math.random() * 80,
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
        this.flipping = false;
        const impact = Math.max(0, this.lastVy);
        const t = Math.min(1, impact / MOVE.maxFallSpeed);
        this.squashAmount = MOVE.squashMin + (MOVE.squashMax - MOVE.squashMin) * t;
        this.squashDuration = MOVE.landDuration;
        this.squashUntil = time + this.squashDuration;
        this.landingUntil = time + this.squashDuration;
        this._play('land', false);
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
    if (wantsJump) {
      if (onFloor || time <= this.coyoteUntil) {
        this._doJump(MOVE.jumpVelocity, false);
      } else if (this.canDouble) {
        this.canDouble = false;
        this._doJump(MOVE.doubleJumpVelocity, true);
      }
    }

    if (
      this.variableJump
      && !input.jumpHeld
      && body.velocity.y < 0
      && time >= this.jumpStartedAt + MOVE.minJumpTime
    ) {
      body.setVelocityY(body.velocity.y * MOVE.jumpCutMultiplier);
      this.variableJump = false;
    }
    if (body.velocity.y >= 0) this.variableJump = false;

    const wantCrouch = onFloor && input.crouch && !wantsJump;
    this._setCrouching(wantCrouch);

    const moveX = Phaser.Math.Clamp(input.moveX || 0, -1, 1);
    const gait = input.gait || 'idle';
    const top = wantCrouch
      ? 0
      : (gait === 'walk' ? MOVE.speed * MOVE.walkMul : MOVE.speed);
    const target = wantCrouch ? 0 : moveX * top;
    const accel = onFloor ? MOVE.accel : MOVE.airAccel;
    const decel = onFloor ? MOVE.decel : MOVE.airDecel;
    let vx = body.velocity.x;

    if (!wantCrouch && moveX !== 0) {
      this.facing = Math.sign(moveX);
      this.sprite.setFlipX(this.facing < 0);
      const turning = Math.sign(vx) !== 0 && Math.sign(vx) !== Math.sign(moveX);
      const rate = turning ? decel + accel : (Math.abs(target) < Math.abs(vx) ? decel : accel);
      vx = approach(vx, target, rate * dt);
    } else {
      vx = approach(vx, 0, decel * dt);
    }
    body.setVelocityX(vx);

    if (body.velocity.y > MOVE.maxFallSpeed) {
      body.setVelocityY(MOVE.maxFallSpeed);
    }

    if (this.flipping && !this.sprite.anims.isPlaying) {
      this.flipping = false;
    }

    this._updateAnim(time, onFloor, vx, body.velocity.y, gait);
    this._applyVisualScale(time);
  }

  _updateAnim(time, onFloor, vx, vy, gait) {
    if (!onFloor) {
      this.landingUntil = 0;
      if (this.flipping) return;
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
    if (Math.abs(vx) > MOVE.runAnimThreshold) {
      this._play(gait === 'walk' ? 'walk' : 'run');
    } else {
      this._play('idle');
    }
  }

  _applyVisualScale(time) {
    const base = MOVE.spriteScale;
    let sx = 1;
    let sy = 1;
    if (time < this.squashUntil && !this.crouching) {
      const t = 1 - (this.squashUntil - time) / this.squashDuration;
      const wave = Math.sin(Phaser.Math.Clamp(t, 0, 1) * Math.PI);
      const amt = this.squashAmount * wave;
      sx = 1 + amt;
      sy = 1 - amt * 1.2;
    } else if (time < this.popUntil) {
      const t = 1 - (this.popUntil - time) / this.popDuration;
      const wave = Math.sin(Phaser.Math.Clamp(t, 0, 1) * Math.PI);
      sx = 1 - 0.07 * wave;
      sy = 1 + 0.14 * wave;
    } else if (this.sprite.anims.currentAnim?.key === 'idle') {
      const breath = Math.sin(time * 0.007) * MOVE.breathAmount;
      sx = 1 - breath * 0.45;
      sy = 1 + breath;
    }
    this.sprite.setScale(base * sx, base * sy);
    // Keep the physics box a constant world size; visual squash must not shrink it.
    const srcW = (this.crouching ? MOVE.crouchBodyWidth : MOVE.bodyWidth) / sx;
    const srcH = (this.crouching ? MOVE.crouchBodyHeight : MOVE.bodyHeight) / sy;
    const body = this.sprite.body;
    body.setSize(srcW, srcH);
    body.setOffset(MOVE.footX - srcW / 2, MOVE.footY - srcH);
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
      flipping: this.flipping,
      crouching: this.crouching,
      bodyH: b.height,
      bodyW: b.width,
    };
  }
}
