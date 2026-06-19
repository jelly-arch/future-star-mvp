/**
 * ReportScene - 赛后报告场景
 */

import Phaser from 'phaser';

export class ReportScene extends Phaser.Scene {
  private matchData: any;

  constructor() {
    super({ key: 'ReportScene' });
  }

  init(data: any): void {
    this.matchData = data;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f0d);

    // 标题
    this.add.text(width / 2, 60, '比赛报告', {
      fontFamily: 'Tektur',
      fontSize: '36px',
      color: '#00e676',
    }).setOrigin(0.5, 0.5);

    // 比分
    const scoreText = this.add.text(
      width / 2,
      140,
      `${this.matchData?.homeScore || 0} - ${this.matchData?.awayScore || 0}`,
      {
        fontFamily: 'Tektur',
        fontSize: '64px',
        color: '#e8f5e9',
      }
    );
    scoreText.setOrigin(0.5, 0.5);

    // 比赛事件列表
    this.displayEventLog();

    // 球员表现
    this.displayPlayerPerformance();

    // 返回按钮
    this.createButton(width / 2, height - 60, '返回主菜单', () => {
      this.scene.start('MenuScene');
    });
  }

  private displayEventLog(): void {
    const startY = 200;
    const events = this.matchData?.events || [];

    this.add.text(100, startY, '比赛事件', {
      fontFamily: 'Work Sans',
      fontSize: '20px',
      color: '#00bcd4',
    });

    events.slice(0, 8).forEach((event: any, index: number) => {
      const y = startY + 40 + index * 28;

      this.add.text(100, y, `• ${event.text}`, {
        fontFamily: 'Work Sans',
        fontSize: '14px',
        color: this.getEventColor(event.color),
      });
    });
  }

  private displayPlayerPerformance(): void {
    const { width } = this.cameras.main;
    const startY = 200;

    this.add.text(width - 300, startY, '球员表现', {
      fontFamily: 'Work Sans',
      fontSize: '20px',
      color: '#00bcd4',
    });

    const playersData = this.registry.get('players');
    const players = playersData?.players?.slice(0, 5) || [];

    players.forEach((player: any, index: number) => {
      const y = startY + 40 + index * 50;

      // 球员名称
      this.add.text(width - 300, y, player.name, {
        fontFamily: 'Work Sans',
        fontSize: '16px',
        color: '#e8f5e9',
      });

      // 评分
      const rating = 6.5 + Math.random() * 2;
      this.add.text(width - 300, y + 20, `评分: ${rating.toFixed(1)}`, {
        fontFamily: 'Geist Mono',
        fontSize: '12px',
        color: '#6b8f71',
      });
    });
  }

  private getEventColor(colorType: string): string {
    const colors: Record<string, string> = {
      info: '#00bcd4',
      success: '#00e676',
      warning: '#ffd54f',
      danger: '#f44336',
      goal: '#00e676',
      default: '#e8f5e9',
    };
    return colors[colorType] || colors.default;
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 200, 50, 0x121a16);
    bg.setStrokeStyle(2, 0x00e676);

    const label = this.add.text(x, y, text, {
      fontFamily: 'Work Sans',
      fontSize: '18px',
      color: '#e8f5e9',
    });
    label.setOrigin(0.5, 0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x1e3a24));
    bg.on('pointerout', () => bg.setFillStyle(0x121a16));
    bg.on('pointerdown', callback);
  }
}
