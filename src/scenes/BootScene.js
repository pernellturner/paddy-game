export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 220, 10, 0x1c3a4e, 0.8);
    const bar = this.add.rectangle(width / 2 - 110, height / 2, 4, 8, 0xf4f0e4).setOrigin(0, 0.5);
    this.load.on('progress', (p) => {
      bar.width = 220 * p;
    });
    this.load.on('complete', () => {
      bar.destroy();
      barBg.destroy();
    });

    this.load.atlas('paddy', 'assets/paddy/paddy.png', 'assets/paddy/paddy.json');
  }

  create() {
    this.scene.start('TestLevel');
  }
}
