/**
 * QTESystem - QTE 输入系统
 */

import Phaser from 'phaser';

export interface QTEConfig {
  duration: number;
  timingWindows: {
    perfect: { range: number[]; multiplier: number };
    good: { range: number[]; multiplier: number };
    miss: { range: number[]; multiplier: number };
  };
  visualCue: string;
  inputType?: string;
  sequenceLength?: number;
}

export interface QTEResult {
  success: boolean;
  timing: 'perfect' | 'good' | 'miss';
  timingMultiplier: number;
  score: number;
}

export class QTESystem extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private isActive: boolean = false;
  private config: QTEConfig | null = null;
  private progress: number = 0;
  private timingBar: Phaser.GameObjects.Container | null = null;
  private indicator: Phaser.GameObjects.Rectangle | null = null;
  private targetZone: Phaser.GameObjects.Rectangle | null = null;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
  }

  start(type: string, difficulty: number, config: QTEConfig): void {
    this.config = config;
    this.isActive = true;
    this.progress = 0;

    this.createTimingBar();
    this.setupInput();

    // 自动结束
    this.scene.time.delayedCall(config.duration, () => {
      this.end('miss');
    });
  }

  private createTimingBar(): void {
    if (!this.config) return;

    const { width, height } = this.scene.cameras.main;
    const barWidth = 400;
    const barHeight = 30;

    this.timingBar = this.scene.add.container(width / 2, height / 2);

    // 背景条
    const bg = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0x1e3a24);
    bg.setStrokeStyle(2, 0x4a7c59);

    // 目标区域（Perfect 区间）
    const perfectRange = this.config.timingWindows.perfect.range;
    const perfectWidth = (perfectRange[1] - perfectRange[0]) * barWidth;
    const perfectX = (perfectRange[0] + perfectRange[1]) / 2 * barWidth - barWidth / 2;
    const perfectZone = this.scene.add.rectangle(perfectX, 0, perfectWidth, barHeight - 4, 0x00e676, 0.3);

    // Good 区域
    const goodRange = this.config.timingWindows.good.range;
    const goodWidth = (goodRange[1] - goodRange[0]) * barWidth;
    const goodX = (goodRange[0] + goodRange[1]) / 2 * barWidth - barWidth / 2;
    const goodZone = this.scene.add.rectangle(goodX, 0, goodWidth, barHeight - 4, 0xffd54f, 0.2);

    // 移动指示器
    this.indicator = this.scene.add.rectangle(-barWidth / 2, 0, 6, barHeight + 10, 0xffffff);

    this.timingBar.add([bg, goodZone, perfectZone, this.indicator]);

    // 提示文字
    const hint = this.scene.add.text(0, -50, '按空格键!', {
      fontFamily: 'Work Sans',
      fontSize: '24px',
      color: '#e8f5e9',
    });
    hint.setOrigin(0.5, 0.5);
    this.timingBar.add(hint);
  }

  private setupInput(): void {
    this.scene.input.keyboard?.once('keydown-SPACE', () => {
      this.checkTiming();
    });
  }

  private checkTiming(): void {
    if (!this.config || !this.isActive) return;

    const progress = this.indicator?.x || 0;
    const barWidth = 400;
    const normalizedProgress = (progress + barWidth / 2) / barWidth;

    let result: QTEResult;

    const perfectRange = this.config.timingWindows.perfect.range;
    const goodRange = this.config.timingWindows.good.range;

    if (normalizedProgress >= perfectRange[0] && normalizedProgress <= perfectRange[1]) {
      result = {
        success: true,
        timing: 'perfect',
        timingMultiplier: this.config.timingWindows.perfect.multiplier,
        score: 100,
      };
    } else if (normalizedProgress >= goodRange[0] && normalizedProgress <= goodRange[1]) {
      result = {
        success: true,
        timing: 'good',
        timingMultiplier: this.config.timingWindows.good.multiplier,
        score: 70,
      };
    } else {
      result = {
        success: false,
        timing: 'miss',
        timingMultiplier: this.config.timingWindows.miss.multiplier,
        score: 30,
      };
    }

    this.end(result.timing, result);
  }

  private end(timing: 'perfect' | 'good' | 'miss', result?: QTEResult): void {
    this.isActive = false;

    if (this.timingBar) {
      this.timingBar.destroy();
    }

    if (result) {
      this.emit('complete', result);
    } else {
      this.emit('complete', {
        success: false,
        timing: 'miss',
        timingMultiplier: 0.5,
        score: 0,
      });
    }
  }

  update(delta: number): void {
    if (!this.isActive || !this.config || !this.indicator) return;

    const barWidth = 400;
    const speed = barWidth / this.config.duration;

    this.indicator.x += speed * delta;

    // 超出范围自动结束
    if (this.indicator.x > barWidth / 2) {
      this.end('miss');
    }
  }

  onComplete(callback: (result: QTEResult) => void): void {
    this.on('complete', callback);
  }
}
