/**
 * MenuScene - 主菜单场景
 */

import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f0d);

    // 标题
    const title = this.add.text(width / 2, height / 3, '未来之星', {
      fontFamily: 'Tektur',
      fontSize: '64px',
      color: '#00e676',
    });
    title.setOrigin(0.5, 0.5);

    // 副标题
    const subtitle = this.add.text(width / 2, height / 3 + 60, '足球养成记', {
      fontFamily: 'Work Sans',
      fontSize: '32px',
      color: '#e8f5e9',
    });
    subtitle.setOrigin(0.5, 0.5);

    // 开始训练按钮
    this.createButton(width / 2, height / 2 + 50, '开始训练', () => {
      this.scene.start('TrainingScene');
    });

    // 开始比赛按钮
    this.createButton(width / 2, height / 2 + 120, '5v5 比赛', () => {
      this.scene.start('MatchScene');
    });

    // 版本信息
    this.add.text(width - 20, height - 20, 'MVP v0.1.0', {
      fontFamily: 'Geist Mono',
      fontSize: '14px',
      color: '#6b8f71',
    }).setOrigin(1, 1);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const button = this.add.container(x, y);

    // 按钮背景
    const bg = this.add.rectangle(0, 0, 200, 50, 0x121a16);
    bg.setStrokeStyle(2, 0x00e676);

    // 按钮文字
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Work Sans',
      fontSize: '20px',
      color: '#e8f5e9',
    });
    label.setOrigin(0.5, 0.5);

    button.add([bg, label]);

    // 交互
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x1e3a24);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x121a16);
    });
    bg.on('pointerdown', callback);
  }
}
