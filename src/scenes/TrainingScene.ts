/**
 * TrainingScene - 训练QTE场景
 */

import Phaser from 'phaser';
import { QTESystem } from '../systems/QTESystem';

export class TrainingScene extends Phaser.Scene {
  private qteSystem!: QTESystem;
  private currentPlayer!: any;
  private trainingCards!: any[];
  private selectedCard: any = null;
  private attributePanel!: Phaser.GameObjects.Container;
  private qteContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'TrainingScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // 获取数据
    const playersData = this.registry.get('players');
    this.trainingCards = this.registry.get('trainingCards')?.cards || [];
    this.currentPlayer = playersData?.players?.[0];

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0f0d);

    // 标题
    this.add.text(width / 2, 40, '训练中心', {
      fontFamily: 'Tektur',
      fontSize: '32px',
      color: '#00e676',
    }).setOrigin(0.5, 0.5);

    // 初始化 QTE 系统
    this.qteSystem = new QTESystem(this);
    this.qteContainer = this.add.container(width / 2, height / 2);

    // 显示训练卡列表
    this.displayTrainingCards();

    // 显示球员属性面板
    this.displayAttributePanel();

    // 返回按钮
    this.createButton(100, height - 50, '返回', () => {
      this.scene.start('MenuScene');
    });
  }

  private displayTrainingCards(): void {
    const startX = 100;
    const startY = 120;
    const cardWidth = 180;
    const cardHeight = 100;
    const gap = 20;

    this.trainingCards.forEach((card: any, index: number) => {
      const x = startX + (index % 4) * (cardWidth + gap);
      const y = startY + Math.floor(index / 4) * (cardHeight + gap);

      this.createTrainingCard(x, y, card);
    });
  }

  private createTrainingCard(x: number, y: number, card: any): void {
    const container = this.add.container(x, y);

    // 卡片背景
    const bg = this.add.rectangle(0, 0, 180, 100, 0x121a16);
    bg.setStrokeStyle(2, card.unlocked ? 0x00e676 : 0x1e3a24);

    // 卡片名称
    const name = this.add.text(0, -25, card.name, {
      fontFamily: 'Work Sans',
      fontSize: '16px',
      color: card.unlocked ? '#e8f5e9' : '#6b8f71',
    });
    name.setOrigin(0.5, 0.5);

    // 卡片类型
    const type = this.add.text(0, 5, card.type, {
      fontFamily: 'Geist Mono',
      fontSize: '12px',
      color: '#00bcd4',
    });
    type.setOrigin(0.5, 0.5);

    // 难度
    const difficulty = this.add.text(0, 30, `难度: ${card.difficulty}`, {
      fontFamily: 'Geist Mono',
      fontSize: '12px',
      color: '#ffd54f',
    });
    difficulty.setOrigin(0.5, 0.5);

    container.add([bg, name, type, difficulty]);

    // 交互
    if (card.unlocked) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(0x1e3a24));
      bg.on('pointerout', () => bg.setFillStyle(0x121a16));
      bg.on('pointerdown', () => this.startTraining(card));
    }
  }

  private displayAttributePanel(): void {
    const { width, height } = this.cameras.main;
    this.attributePanel = this.add.container(width - 220, 120);

    if (!this.currentPlayer) return;

    // 面板标题
    const title = this.add.text(0, 0, this.currentPlayer.name, {
      fontFamily: 'Tektur',
      fontSize: '24px',
      color: '#00e676',
    });

    this.attributePanel.add(title);

    // 显示属性
    const attributes = this.currentPlayer.attributes;
    const attrNames: Record<string, string> = {
      shortPass: '短传',
      vision: '视野',
      decision: '决策',
      dribbling: '带球',
      coordination: '协调',
      strength: '力量',
      shooting: '射门',
      mental: '心智',
    };

    let yOffset = 40;
    Object.entries(attributes).forEach(([key, value]) => {
      if (attrNames[key]) {
        const label = this.add.text(0, yOffset, attrNames[key], {
          fontFamily: 'Work Sans',
          fontSize: '14px',
          color: '#6b8f71',
        });

        const bar = this.add.rectangle(100, yOffset + 7, 100, 12, 0x1e3a24);
        const fill = this.add.rectangle(
          50 + (value as number) / 2,
          yOffset + 7,
          value as number,
          10,
          0x00e676
        );
        fill.setOrigin(0.5, 0.5);

        const valueText = this.add.text(160, yOffset, String(value), {
          fontFamily: 'Geist Mono',
          fontSize: '14px',
          color: '#e8f5e9',
        });

        this.attributePanel.add([label, bar, fill, valueText]);
        yOffset += 30;
      }
    });
  }

  private startTraining(card: any): void {
    this.selectedCard = card;
    this.qteSystem.start(card.qteType, card.difficulty, card.qteConfig);

    // 监听 QTE 完成
    this.qteSystem.onComplete((result: any) => {
      this.onTrainingComplete(result);
    });
  }

  private onTrainingComplete(result: any): void {
    if (!this.selectedCard) return;

    // 计算属性增长
    const gain = this.selectedCard.reward.attributeGain * result.timingMultiplier;

    // 更新球员属性
    if (this.currentPlayer && this.selectedCard.targetAttribute) {
      this.currentPlayer.attributes[this.selectedCard.targetAttribute] += gain;
      this.displayAttributePanel(); // 刷新显示
    }

    // 显示结果
    this.showTrainingResult(result);
  }

  private showTrainingResult(result: any): void {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    const resultText = this.add.text(
      width / 2,
      height / 2,
      result.timing.toUpperCase(),
      {
        fontFamily: 'Tektur',
        fontSize: '48px',
        color: result.timing === 'perfect' ? '#00e676' : result.timing === 'good' ? '#ffd54f' : '#f44336',
      }
    );
    resultText.setOrigin(0.5, 0.5);

    // 2秒后关闭
    this.time.delayedCall(2000, () => {
      overlay.destroy();
      resultText.destroy();
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 120, 40, 0x121a16);
    bg.setStrokeStyle(2, 0x00bcd4);

    const label = this.add.text(x, y, text, {
      fontFamily: 'Work Sans',
      fontSize: '16px',
      color: '#e8f5e9',
    });
    label.setOrigin(0.5, 0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x1e3a24));
    bg.on('pointerout', () => bg.setFillStyle(0x121a16));
    bg.on('pointerdown', callback);
  }
}
