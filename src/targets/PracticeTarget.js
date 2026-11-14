import { WORLD } from '../config.js';

/**
 * A stationary practice dummy. It wobbles and flashes when Paddy's swipe
 * hits it. Not an enemy: no AI, no contact damage.
 */
export class PracticeTarget {
  constructor(scene, x, kind = 'cushion') {
    this.scene = scene;
    this.kind = kind;
    this.hitUntil = 0;
    this.w = kind === 'straw' ? 36 : 44;
    this.h = kind === 'straw' ? 52 : 30;
    const y = WORLD.groundTop - this.h / 2;
    this.x = x;
    this.y = y;

    const g = scene.add.container(x, y);
    g.setDepth(6);
    this.container = g;
    this._draw(kind);
  }

  _draw(kind) {
    const art = this.scene.add.graphics();
    if (kind === 'straw') {
      // A little straw sack on a short post.
      art.fillStyle(0x6b4a2a, 1);
      art.fillRect(-3, 4, 6, this.h / 2);
      art.fillStyle(0xc4a35a, 1);
      art.fillEllipse(0, -8, 30, 36);
      art.lineStyle(1.5, 0x8a6a30, 1);
      art.strokeEllipse(0, -8, 30, 36);
      art.lineStyle(1.2, 0x8a6a30, 0.7);
      art.lineBetween(-8, -18, 8, 2);
      art.lineBetween(8, -18, -8, 2);
      art.fillStyle(0x7a5228, 1);
      art.fillEllipse(0, -26, 10, 6);
    } else {
      // A small floor cushion.
      art.fillStyle(0xb86a4a, 1);
      art.fillRoundedRect(-22, -8, 44, 22, 8);
      art.fillStyle(0xd08a68, 1);
      art.fillRoundedRect(-22, -14, 44, 16, 8);
      art.lineStyle(1.5, 0x8a3e2a, 0.8);
      art.strokeRoundedRect(-22, -14, 44, 22, 8);
      art.fillStyle(0x8a3e2a, 1);
      art.fillCircle(0, -6, 2.5);
    }
    this.container.add(art);
    this.art = art;
    this.flash = this.scene.add.rectangle(0, kind === 'straw' ? -8 : -4, this.w, this.h, 0xffffff, 0);
    this.container.add(this.flash);
  }

  getBounds() {
    return {
      x: this.x - this.w / 2,
      y: this.y - this.h / 2,
      w: this.w,
      h: this.h,
    };
  }

  hit(time, dir = 1) {
    if (time < this.hitUntil) return false;
    this.hitUntil = time + 220;
    this.scene.tweens.killTweensOf(this.container);
    this.scene.tweens.killTweensOf(this.flash);
    this.container.x = this.x + dir * 18;
    this.container.setScale(1.16);
    this.container.setAngle(dir * (this.kind === 'straw' ? -24 : 16));
    this.flash.setAlpha(1);
    this.scene.tweens.add({
      targets: this.container,
      x: this.x,
      angle: 0,
      scale: 1,
      duration: 380,
      ease: 'Sine.easeOut',
    });
    this.scene.tweens.add({
      targets: this.flash,
      alpha: 0,
      duration: 180,
    });
    return true;
  }
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
