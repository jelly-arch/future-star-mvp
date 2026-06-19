/**
 * 未来之星：足球养成记 MVP
 * 主入口文件
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { TrainingScene } from './scenes/TrainingScene';
import { MatchScene } from './scenes/MatchScene';
import { ReportScene } from './scenes/ReportScene';

// 游戏配置
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#0a0f0d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, TrainingScene, MatchScene, ReportScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// 启动游戏
const game = new Phaser.Game(config);

// 全局游戏实例引用
declare global {
  interface Window {
    game: Phaser.Game;
  }
}

window.game = game;

export default game;
