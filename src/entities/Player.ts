/**
 * Player - 球员圆点实体
 */

import Phaser from 'phaser';
import { VisionHalo } from './VisionHalo';

export class Player extends Phaser.GameObjects.Container {
  private dot: Phaser.GameObjects.Arc;
  private halo: VisionHalo;
  private playerData: any;
  private teamColor: string;
  private nameLabel: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerData: any,
    teamColor: string
  ) {
    super(scene, x, y);

    this.playerData = playerData;
    this.teamColor = teamColor;

    // 创建视野光晕
    const visionRadius = this.calculateVisionRadius();
    this.halo = new VisionHalo(scene, 0, 0, visionRadius);
    this.add(this.halo);

    // 创建球员圆点
    const color = teamColor === 'red' ? 0xe53935 : 0x1e88e5;
    this.dot = scene.add.circle(0, 0, 15, color);
    this.dot.setStrokeStyle(2, teamColor === 'red' ? 0xffffff : 0x000000);
    this.add(this.dot);

    // 创建名称标签
    this.nameLabel = scene.add.text(0, -25, playerData?.name || 'Player', {
      fontFamily: 'Work Sans',
      fontSize: '10px',
      color: '#e8f5e9',
    });
    this.nameLabel.setOrigin(0.5, 0.5);
    this.add(this.nameLabel);

    // 添加到场景
    scene.add.existing(this);

    // 物理碰撞
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(15);
    body.setOffset(-15, -15);
  }

  private calculateVisionRadius(): number {
    const vision = this.playerData?.attributes?.vision || 50;
    return 40 + vision * 1.5;
  }

  updatePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  highlight(): void {
    this.dot.setStrokeStyle(3, 0x00e676);
  }

  resetHighlight(): void {
    const color = this.teamColor === 'red' ? 0xffffff : 0x000000;
    this.dot.setStrokeStyle(2, color);
  }

  stun(duration: number): void {
    this.dot.setFillStyle(0x666666);
    this.scene.time.delayedCall(duration, () => {
      const color = this.teamColor === 'red' ? 0xe53935 : 0x1e88e5;
      this.dot.setFillStyle(color);
    });
  }

  getPlayerData(): any {
    return this.playerData;
  }
}
