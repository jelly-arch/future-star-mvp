/**
 * TacticalLog - 战术日志 UI 组件
 */

import Phaser from 'phaser';

export class TacticalLog extends Phaser.GameObjects.Container {
  private entries: Phaser.GameObjects.Text[] = [];
  private maxEntries: number = 5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 背景
    const bg = scene.add.rectangle(150, 60, 300, 150, 0x0a0f0d, 0.8);
    bg.setStrokeStyle(1, 0x1e3a24);
    this.add(bg);

    // 标题
    const title = scene.add.text(20, 0, '战术日志', {
      fontFamily: 'Geist Mono',
      fontSize: '12px',
      color: '#00bcd4',
    });
    this.add(title);

    scene.add.existing(this);
  }

  addEntry(text: string, colorType: string = 'default'): void {
    const color = this.getColor(colorType);

    const entry = this.scene.add.text(20, 25 + this.entries.length * 22, `• ${text}`, {
      fontFamily: 'Work Sans',
      fontSize: '12px',
      color,
      wordWrap: { width: 260 },
    });

    this.add(entry);
    this.entries.push(entry);

    // 超过最大条数时移除旧条目
    if (this.entries.length > this.maxEntries) {
      const oldEntry = this.entries.shift();
      oldEntry?.destroy();

      // 重新排列
      this.entries.forEach((e, i) => {
        e.setY(25 + i * 22);
      });
    }
  }

  private getColor(colorType: string): string {
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

  clear(): void {
    this.entries.forEach((e) => e.destroy());
    this.entries = [];
  }
}
