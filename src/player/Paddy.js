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
    this.coyoteUntil = 0;
    this.jumpBufferUntil = 0;
    this.landingUntil = 0;
    this.wasOnFloor = true;

    const sprite = scene.physics.add.sprite(x, y, 'paddy', 'idle_test_1_00');
    sprite.setOrigin(MOVE.footX / 241, MOVE.footY / 247);
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
      frames: frames('idle_test_1_', 0, 5),
      frameRate: MOVE.idleFps,
      repeat: -1,
    });
    scene.anims.create({
      key: 'run',
      frames: frames('k_run_', 0, 7),
      frameRate: MOVE.runFps,
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
  }

  _play(key, ignoreIfSame = true) {
    if (ignoreIfSame && this.sprite.anims.currentAnim?.key === key) return;
    this.sprite.play(key, true);
  }

  _doJump(velocity) {
    this.sprite.body.setVelocityY(velocity);
    this.variableJump = true;
    this.coyoteUntil = 0;
    this.jumpBufferUntil = 0;
    this.landingUntil = 0;
    this._play('jump', false);
  }

  update(time, delta, input) {
    const body = this.sprite.body;
    const onFloor = body.onFloor() || body.blocked.down;
    const dt = Math.min(delta, 32) / 1000;

    if (onFloor) {
      this.canDouble = true;
      this.coyoteUntil = time + MOVE.coyoteTime;
      if (!this.wasOnFloor && body.velocity.y >= 0) {
        this.landingUntil = time + 90;
        this._play('land', false);
      }
    }
    this.wasOnFloor = onFloor;

    if (input.consumeJumpPress()) {
      this.jumpBufferUntil = time + MOVE.jumpBuffer;
    }

    const wantsJump = time <= this.jumpBufferUntil;
    if (wantsJump) {
      if (onFloor || time <= this.coyoteUntil) {
        this._doJump(MOVE.jumpVelocity);
      } else if (this.canDouble) {
        this.canDouble = false;
        this._doJump(MOVE.doubleJumpVelocity);
      }
    }

    if (this.variableJump && !input.jumpHeld && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * MOVE.jumpCutMultiplier);
      this.variableJump = false;
    }
    if (body.velocity.y >= 0) this.variableJump = false;

    let dir = 0;
    if (input.left) dir -= 1;
    if (input.right) dir += 1;

    const accel = onFloor ? MOVE.accel : MOVE.airAccel;
    const decel = onFloor ? MOVE.decel : MOVE.airDecel;
    let vx = body.velocity.x;

    if (dir !== 0) {
      this.facing = dir;
      this.sprite.setFlipX(dir < 0);
      const target = dir * MOVE.speed;
      const rate = Math.sign(vx) !== 0 && Math.sign(vx) !== dir ? decel + accel : accel;
      vx = approach(vx, target, rate * dt);
    } else {
      vx = approach(vx, 0, decel * dt);
    }
    body.setVelocityX(vx);

    if (body.velocity.y > MOVE.maxFallSpeed) {
      body.setVelocityY(MOVE.maxFallSpeed);
    }

    this._updateAnim(time, onFloor, vx, body.velocity.y);
  }

  _updateAnim(time, onFloor, vx, vy) {
    if (!onFloor) {
      this.landingUntil = 0;
      if (vy < -90) {
        if (this.sprite.anims.currentAnim?.key !== 'jump') this._play('jump');
      } else if (vy < 90) {
        this._play('apex');
      } else {
        this._play('fall');
      }
      return;
    }
    if (time < this.landingUntil && this.sprite.anims.currentAnim?.key === 'land') {
      return;
    }
    if (Math.abs(vx) > MOVE.runAnimThreshold) {
      this._play('run');
    } else {
      this._play('idle');
    }
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
    };
  }
}
