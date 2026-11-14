import { WORLD, PLATFORMS, MOVE, CAMERA } from '../config.js';
import { PracticeTarget, overlaps } from '../targets/PracticeTarget.js';
import { Paddy } from '../player/Paddy.js';
import { InputState, hookKeyboard, mountTouchControls, gaitFromStick } from '../input/TouchControls.js';

export class TestLevel extends Phaser.Scene {
  constructor() {
    super('TestLevel');
  }

  create() {
    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.physics.world.gravity.y = MOVE.gravity;

    this._drawBackdrop();
    this._buildGroundAndPlatforms();

    this.paddy = new Paddy(this, WORLD.spawnX, WORLD.spawnY);
    this.targets = [
      new PracticeTarget(this, 320, 'cushion'),
      new PracticeTarget(this, 445, 'straw'),
    ];

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

    this.add.text(180, 90, 'Run, jump, and swipe.', {
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
    this._debug = debug;
    if (debug) {
      this.physics.world.createDebugGraphic();
      this._hitboxGfx = this.add.graphics().setDepth(20);
    }
    window.__paddy = {
      getState: () => this.paddy.getState(),
      setPos: (x, y) => {
        this.paddy.sprite.setPosition(x, y);
        this.paddy.sprite.body.reset(x, y);
        this.paddy.sprite.body.setVelocity(0, 0);
        this.paddy.canDouble = true;
        this.paddy.djUntil = 0;
        this.paddy.squashUntil = 0;
        this.paddy.landingUntil = 0;
        this.paddy.variableJump = false;
        this.paddy.sprite.setAngle(0);
        this.paddy.visSX = 1;
        this.paddy.visSY = 1;
        this.paddy.gait = 'idle';
        this.paddy.walkLeadUntil = 0;
        this.paddy.attacking = false;
        this.paddy.attackAir = false;
        this.paddy.attackPhase = null;
        this.paddy.attackQueued = false;
        this.paddy._setCrouching(false);
        this.paddy._play('idle', false);
      },
      startLog: () => { this._paddyLog = []; this._paddyLogging = true; },
      stopLog: () => { this._paddyLogging = false; return this._paddyLog || []; },
      isFlipX: () => this.paddy.sprite.flipX,
      world: { width: WORLD.width, height: WORLD.height, groundTop: WORLD.groundTop },
      platforms: PLATFORMS.slice(),
      camera: () => ({
        x: this.cameras.main.scrollX,
        y: this.cameras.main.scrollY,
      }),
      gaitFromStick,
      targets: () => this.targets.map((t) => ({ x: t.x, y: t.y, w: t.w, h: t.h, kind: t.kind, hitUntil: t.hitUntil })),
    };
  }

  _resolveHits(time) {
    const hb = this.paddy.getHitbox();
    if (!hb) return;
    for (const target of this.targets) {
      if (overlaps(hb, target.getBounds())) target.hit(time);
    }
  }

  _drawHitbox() {
    if (!this._hitboxGfx) return;
    this._hitboxGfx.clear();
    const hb = this.paddy.getHitbox();
    if (!hb) return;
    this._hitboxGfx.lineStyle(2, 0xff4d4d, 0.95);
    this._hitboxGfx.fillStyle(0xff4d4d, 0.22);
    this._hitboxGfx.fillRect(hb.x, hb.y, hb.w, hb.h);
    this._hitboxGfx.strokeRect(hb.x, hb.y, hb.w, hb.h);
  }

  update(time, delta) {
    if (!this.paddy) return;
    this.inputState.sync();
    this.paddy.update(time, delta, this.inputState);
    this._resolveHits(time);
    this._drawHitbox();
    if (this._paddyLogging) {
      const s = this.paddy.getState();
      s.t = time;
      s.dt = delta;
      s.flipX = this.paddy.sprite.flipX;
      this._paddyLog.push(s);
    }

    // Soft respawn if he somehow drops out of the world.
    if (this.paddy.sprite.y > WORLD.height + 80) {
      this.paddy.sprite.setPosition(WORLD.spawnX, WORLD.spawnY);
      this.paddy.sprite.body.setVelocity(0, 0);
    }
  }
}

