/**
 * BootScene - 资源加载场景
 * 负责加载所有游戏资源并显示加载进度
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingBar();
    this.loadResources();
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 加载条背景
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x1e3a24, 1);
    this.loadingBar.fillRect(width / 4, height / 2 - 15, width / 2, 30);

    // 进度条
    this.progressBar = this.add.graphics();

    // 加载文字
    const loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontFamily: 'Work Sans',
      fontSize: '24px',
      color: '#e8f5e9',
    });
    loadingText.setOrigin(0.5, 0.5);

    // 加载进度事件
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00e676, 1);
      this.progressBar.fillRect(
        width / 4 + 5,
        height / 2 - 10,
        (width / 2 - 10) * value,
        20
      );
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.loadingBar.destroy();
      loadingText.destroy();
    });
  }

  private loadResources(): void {
    // 加载 JSON 数据配置
    this.load.json('players', '../future-star-mvp-data/players.json');
    this.load.json('trainingCards', '../future-star-mvp-data/training-cards.json');
    this.load.json('events', '../future-star-mvp-data/events.json');
    this.load.json('commentary', '../future-star-mvp-data/commentary-templates.json');
    this.load.json('knowledgeGraph', '../future-star-mvp-data/knowledge-graph.json');
    this.load.json('formations', '../future-star-mvp-data/formations.json');
    this.load.json('zones', '../future-star-mvp-data/zones.json');
    this.load.json('progression', '../future-star-mvp-data/progression.json');

    // 加载图片资源（占位符，实际项目中替换为真实资源）
    // this.load.image('pitch', 'assets/images/pitch.png');
    // this.load.image('player', 'assets/images/player.png');
    // this.load.image('ball', 'assets/images/ball.png');
  }

  create(): void {
    // 将配置数据存储到游戏注册表
    this.cache.json.get('players') && this.registry.set('players', this.cache.json.get('players'));
    this.cache.json.get('trainingCards') && this.registry.set('trainingCards', this.cache.json.get('trainingCards'));
    this.cache.json.get('events') && this.registry.set('events', this.cache.json.get('events'));
    this.cache.json.get('commentary') && this.registry.set('commentary', this.cache.json.get('commentary'));
    this.cache.json.get('knowledgeGraph') && this.registry.set('knowledgeGraph', this.cache.json.get('knowledgeGraph'));
    this.cache.json.get('formations') && this.registry.set('formations', this.cache.json.get('formations'));
    this.cache.json.get('zones') && this.registry.set('zones', this.cache.json.get('zones'));
    this.cache.json.get('progression') && this.registry.set('progression', this.cache.json.get('progression'));

    // 跳转到主菜单
    this.scene.start('MenuScene');
  }
}
