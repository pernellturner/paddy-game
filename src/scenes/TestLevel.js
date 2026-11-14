import { WORLD, PLATFORMS, MOVE, CAMERA } from '../config.js';
import { Paddy } from '../player/Paddy.js';
import { InputState, hookKeyboard, mountTouchControls } from '../input/TouchControls.js';

export class TestLevel extends Phaser.Scene {
  constructor() {
    super('TestLevel');
  }

  create() {
    this.input.addPointer(2);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.physics.world.gravity.y = MOVE.gravity;

    this._drawBackdrop();
    this._buildGroundAndPlatforms();

    this.paddy = new Paddy(this, WORLD.spawnX, WORLD.spawnY);

    this.physics.add.collider(this.paddy.sprite, this.ground);
    this.physics.add.collider(
      this.paddy.sprite,
      this.platforms,
      null,
      (player, platform) => {
        const body = player.body;
        return body.velocity.y >= 0 && body.bottom <= platform.body.top + 10;
      },
      this,
    );

    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setDeadzone(CAMERA.deadzoneX, CAMERA.deadzoneY);
    this.cameras.main.startFollow(this.paddy.sprite, true, CAMERA.lerp, CAMERA.lerp);
    this.cameras.main.centerOn(WORLD.spawnX, WORLD.height / 2);

    this.inputState = new InputState();
    hookKeyboard(this, this.inputState);
    mountTouchControls(this.inputState);

    this._exposeDebug();
  }

  _drawBackdrop() {
    const g = this.add.graphics();
    const h = WORLD.height;
    const w = WORLD.width;
    // Smooth sky gradient (canvas texture, no banding).
    if (!this.textures.exists('sky')) {
      const tex = this.textures.createCanvas('sky', 2, h);
      const ctx = tex.getContext();
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#6eb0d6');
      grd.addColorStop(0.55, '#b9dce8');
      grd.addColorStop(1, '#e8ecd2');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 2, h);
      tex.refresh();
    }
    this.add.image(0, 0, 'sky').setOrigin(0, 0).setDisplaySize(w, h).setDepth(-3);

    // Distant hills, decorative only.
    g.fillStyle(0x6fa37a, 0.55);
    g.fillEllipse(400, WORLD.groundTop + 10, 700, 180);
    g.fillEllipse(1200, WORLD.groundTop + 20, 900, 200);
    g.fillStyle(0x5b8d68, 0.5);
    g.fillEllipse(2000, WORLD.groundTop + 16, 800, 190);
    g.fillEllipse(2700, WORLD.groundTop + 8, 640, 160);

    // Soft clouds.
    const cloud = (x, y, s) => {
      g.fillStyle(0xffffff, 0.55);
      g.fillEllipse(x, y, 90 * s, 36 * s);
      g.fillEllipse(x + 34 * s, y + 4 * s, 70 * s, 30 * s);
      g.fillEllipse(x - 30 * s, y + 6 * s, 64 * s, 26 * s);
    };
    cloud(260, 70, 1);
    cloud(780, 50, 0.8);
    cloud(1400, 80, 1.15);
    cloud(1980, 44, 0.9);
    cloud(2520, 72, 1);

    this.add.text(180, 56, "Paddy's Way Home", {
      fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      fontSize: '28px',
      color: '#f7f4ea',
      stroke: '#2c4c5c',
      strokeThickness: 4,
    }).setOrigin(0, 0).setDepth(1);

    this.add.text(180, 90, 'Run and jump. That is all for now.', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      fontSize: '14px',
      color: '#2c4c5c',
    }).setOrigin(0, 0).setDepth(1);

    g.setDepth(-2);
  }

  _buildGroundAndPlatforms() {
    this.ground = this.physics.add.staticGroup();
    this.platforms = this.physics.add.staticGroup();

    const ground = this.add.rectangle(
      WORLD.width / 2,
      WORLD.groundTop + WORLD.groundDepth / 2,
      WORLD.width,
      WORLD.groundDepth,
      0x6b9a45,
    );
    this.physics.add.existing(ground, true);
    this.ground.add(ground);
    // Grass lip + dirt body (visual only).
    this.add.rectangle(
      WORLD.width / 2,
      WORLD.groundTop + 6,
      WORLD.width,
      12,
      0x7fb350,
    ).setDepth(0);
    this.add.rectangle(
      WORLD.width / 2,
      WORLD.groundTop + WORLD.groundDepth / 2 + 18,
      WORLD.width,
      WORLD.groundDepth - 24,
      0x8b5a3c,
    );

    for (const p of PLATFORMS) {
      const plat = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, 0x7aa44e);
      plat.setStrokeStyle(2, 0x4e7530);
      this.physics.add.existing(plat, true);
      this.platforms.add(plat);
    }
  }

  _exposeDebug() {
    const debug = new URLSearchParams(location.search).has('debug');
    if (debug) this.physics.world.drawDebug = true;
    window.__paddy = {
      getState: () => this.paddy.getState(),
      world: { width: WORLD.width, height: WORLD.height, groundTop: WORLD.groundTop },
      platforms: PLATFORMS.slice(),
      camera: () => ({
        x: this.cameras.main.scrollX,
        y: this.cameras.main.scrollY,
      }),
    };
  }

  update(time, delta) {
    if (!this.paddy) return;
    this.inputState.sync();
    this.paddy.update(time, delta, this.inputState);

    // Soft respawn if he somehow drops out of the world.
    if (this.paddy.sprite.y > WORLD.height + 80) {
      this.paddy.sprite.setPosition(WORLD.spawnX, WORLD.spawnY);
      this.paddy.sprite.body.setVelocity(0, 0);
    }
  }
}

