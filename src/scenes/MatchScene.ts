/**
 * MatchScene - 5v5比赛场景
 */

import Phaser from 'phaser';
import { MatchEngine } from '../engine/MatchEngine';
import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';
import { TacticalLog } from '../ui/TacticalLog';

export class MatchScene extends Phaser.Scene {
  private matchEngine!: MatchEngine;
  private players: Player[] = [];
  private ball!: Ball;
  private tacticalLog!: TacticalLog;
  private matchConfig: any;
  private isPaused: boolean = false;
  private matchTime: number = 0;
  private readonly MATCH_DURATION: number = 300; // 5分钟

  constructor() {
    super({ key: 'MatchScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 获取配置
    this.matchConfig = {
      homeTeam: this.createTeam('red', true),
      awayTeam: this.createTeam('blue', false),
      organization: 60,
      matchDuration: this.MATCH_DURATION,
    };

    // 渲染场地
    this.renderPitch();

    // 初始化比赛引擎
    this.matchEngine = new MatchEngine(this, this.matchConfig);

    // 创建球员实体
    this.createPlayers();

    // 创建足球
    this.ball = new Ball(this, width / 2, height / 2);

    // 创建战术日志
    this.tacticalLog = new TacticalLog(this, 20, height - 180);

    // 订阅比赛事件
    this.subscribeToEvents();

    // 开始比赛
    this.matchEngine.start();

    // UI
    this.createMatchUI();
  }

  private renderPitch(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();

    // 场地背景
    graphics.fillStyle(0x0d2818, 1);
    graphics.fillRect(0, 0, width, height);

    // 场地边线
    graphics.lineStyle(2, 0x4a7c59, 1);
    graphics.strokeRect(50, 50, width - 100, height - 100);

    // 中线
    graphics.lineBetween(width / 2, 50, width / 2, height - 50);

    // 中圈
    graphics.strokeCircle(width / 2, height / 2, 60);

    // Zone 分区线
    graphics.lineStyle(1, 0x2d5a3d, 0.5);
    graphics.lineBetween(width * 0.33, 50, width * 0.33, height - 50);
    graphics.lineBetween(width * 0.66, 50, width * 0.66, height - 50);

    // Zone 标签
    this.add.text(width * 0.17, 30, 'Zone 1', {
      fontFamily: 'Geist Mono',
      fontSize: '12px',
      color: '#4a7c59',
    }).setOrigin(0.5, 0.5);

    this.add.text(width * 0.5, 30, 'Zone 2', {
      fontFamily: 'Geist Mono',
      fontSize: '12px',
      color: '#4a7c59',
    }).setOrigin(0.5, 0.5);

    this.add.text(width * 0.83, 30, 'Zone 3', {
      fontFamily: 'Geist Mono',
      fontSize: '12px',
      color: '#4a7c59',
    }).setOrigin(0.5, 0.5);

    // 球门区域
    graphics.lineStyle(2, 0x4a7c59, 1);
    graphics.strokeRect(50, height / 2 - 60, 40, 120);
    graphics.strokeRect(width - 90, height / 2 - 60, 40, 120);
  }

  private createTeam(color: string, isHome: boolean): any {
    const playersData = this.registry.get('players');
    const formations = this.registry.get('formations');
    const formation = formations?.formations?.five_v_five;

    return {
      color,
      isHome,
      formation,
      players: playersData?.players?.slice(0, 5) || [],
    };
  }

  private createPlayers(): void {
    const { width, height } = this.cameras.main;
    const formation = this.matchConfig.homeTeam.formation;

    if (!formation) return;

    formation.positions.forEach((pos: any, index: number) => {
      const playerData = this.matchConfig.homeTeam.players[index];
      const x = 50 + pos.x * (width - 100);
      const y = 50 + pos.y * (height - 100);

      const player = new Player(this, x, y, playerData, 'red');
      this.players.push(player);
    });

    // 对方球员（镜像位置）
    formation.positions.forEach((pos: any, index: number) => {
      const playerData = this.matchConfig.awayTeam.players[index];
      const x = width - 50 - pos.x * (width - 100);
      const y = 50 + pos.y * (height - 100);

      const player = new Player(this, x, y, playerData, 'blue');
      this.players.push(player);
    });
  }

  private subscribeToEvents(): void {
    this.matchEngine.on('commentary', (data: any) => {
      this.tacticalLog.addEntry(data.text, data.color);
    });

    this.matchEngine.on('goal', (data: any) => {
      this.showGoalAnimation(data);
    });

    this.matchEngine.on('match_end', () => {
      this.scene.start('ReportScene', {
        homeScore: this.matchEngine.getHomeScore(),
        awayScore: this.matchEngine.getAwayScore(),
        events: this.matchEngine.getEventLog(),
      });
    });
  }

  private createMatchUI(): void {
    const { width } = this.cameras.main;

    // 比赛时间
    this.add.text(width / 2, 20, '00:00', {
      fontFamily: 'Geist Mono',
      fontSize: '24px',
      color: '#e8f5e9',
    }).setOrigin(0.5, 0.5);

    // 比分
    this.add.text(width / 2, 60, '0 - 0', {
      fontFamily: 'Tektur',
      fontSize: '36px',
      color: '#00e676',
    }).setOrigin(0.5, 0.5);

    // 暂停按钮
    this.createButton(width - 80, 30, '暂停', () => {
      this.togglePause();
    });
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.matchEngine.pause();
    } else {
      this.matchEngine.resume();
    }
  }

  private showGoalAnimation(data: any): void {
    const { width, height } = this.cameras.main;

    const goalText = this.add.text(width / 2, height / 2, 'GOAL!', {
      fontFamily: 'Tektur',
      fontSize: '72px',
      color: '#00e676',
    });
    goalText.setOrigin(0.5, 0.5);
    goalText.setScale(0);

    this.tweens.add({
      targets: goalText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          goalText.destroy();
        });
      },
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 80, 30, 0x121a16);
    bg.setStrokeStyle(1, 0x00bcd4);

    const label = this.add.text(x, y, text, {
      fontFamily: 'Work Sans',
      fontSize: '14px',
      color: '#e8f5e9',
    });
    label.setOrigin(0.5, 0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', callback);
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;

    this.matchEngine.update(delta);
    this.matchTime += delta / 1000;
  }
}
