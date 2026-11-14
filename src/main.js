import { GAME, MOVE } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TestLevel } from './scenes/TestLevel.js';
import { attachUnlock } from './audio/Sfx.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.width,
  height: GAME.height,
  backgroundColor: GAME.backgroundColor,
  pixelArt: false,
  antialias: true,
  roundPixels: true,
  audio: { noAudio: true },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: MOVE.gravity },
      debug: false,
    },
  },
  scene: [BootScene, TestLevel],
  input: {
    activePointers: 3,
  },
};

const game = new Phaser.Game(config);
window.__game = game;
attachUnlock();
