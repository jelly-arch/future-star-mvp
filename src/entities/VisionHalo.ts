/**
 * VisionHalo - 视野光晕
 */

import Phaser from 'phaser';

export class VisionHalo extends Phaser.GameObjects.Arc {
  constructor(scene: Phaser.Scene, x: number, y: number, radius: number) {
    super(scene, x, y, radius, 0, 360, false, 0x00e676, 0.15);

    // 边框
    this.setStrokeStyle(1, 0x00e676, 0.4);

    // 添加到场景
    scene.add.existing(this);
  }

  updateRadius(radius: number): this {
    return super.setRadius(radius);
  }

  pulse(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.15, to: 0.3 },
      duration: 200,
      yoyo: true,
    });
  }
}
