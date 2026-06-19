/**
 * Ball - 足球实体
 */

import Phaser from 'phaser';

export class Ball extends Phaser.GameObjects.Container {
  private ball: Phaser.GameObjects.Arc;
  private holder: any = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // 创建足球圆点
    this.ball = scene.add.circle(0, 0, 8, 0xffffff);
    this.ball.setStrokeStyle(1, 0xcccccc);
    this.add(this.ball);

    // 添加到场景
    scene.add.existing(this);

    // 物理碰撞
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(8);
    body.setOffset(-8, -8);
  }

  attachTo(player: any): void {
    this.holder = player;
  }

  release(): void {
    this.holder = null;
  }

  moveTo(x: number, y: number, duration: number = 200): void {
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      duration,
      ease: 'Linear',
    });
  }

  update(): void {
    if (this.holder) {
      this.x = this.holder.x;
      this.y = this.holder.y;
    }
  }

  getHolder(): any {
    return this.holder;
  }
}
