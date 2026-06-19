/**
 * ProbabilityCalc - 概率计算器
 * 实现传球、过人、射门的概率公式
 */

export interface Player {
  id: string;
  name: string;
  attributes: {
    shortPass?: number;
    vision?: number;
    decision?: number;
    dribbling?: number;
    coordination?: number;
    strength?: number;
    shooting?: number;
    mental?: number;
  };
}

export class ProbabilityCalc {
  /**
   * 计算传球成功率
   * 公式: (短传精度×0.5 + 视野扫描×0.3 + 决策×0.2) - 对方拦截属性 + 随机数(-15~+15)
   */
  calcPassSuccess(
    passer: Player | null,
    receiver: Player | null,
    defenders: Player[],
    distance: number
  ): number {
    if (!passer) return 50;

    const attrs = passer.attributes;
    let baseSuccess =
      (attrs.shortPass || 50) * 0.5 +
      (attrs.vision || 50) * 0.3 +
      (attrs.decision || 50) * 0.2;

    // 距离惩罚
    const distancePenalty = distance * 0.5;
    baseSuccess -= distancePenalty;

    // 防守者拦截
    const interceptionPenalty = defenders.length * 10;
    baseSuccess -= interceptionPenalty;

    // 随机数
    const randomModifier = (Math.random() - 0.5) * 30;

    // EDF 加成（如果有三角传球网）
    // TODO: 实现三角传球网检测

    return Math.max(0, Math.min(100, baseSuccess + randomModifier));
  }

  /**
   * 计算过人成功率
   * 公式: (带球控球×0.4 + 协调性×0.4 + 心智×0.2) - 防守者力量×0.5 + 随机数
   * 晚熟者修正: 力量<60但协调性>70时，强制采用敏捷对抗
   */
  calcDribbleSuccess(
    dribbler: Player | null,
    defender: Player | null
  ): number {
    if (!dribbler) return 50;

    const attrs = dribbler.attributes;
    let baseSuccess =
      (attrs.dribbling || 50) * 0.4 +
      (attrs.coordination || 50) * 0.4 +
      (attrs.mental || 50) * 0.2;

    // 晚熟者修正
    if ((attrs.strength || 50) < 60 && (attrs.coordination || 50) > 70) {
      // 敏捷对抗：降低力量权重，提高协调性权重
      baseSuccess =
        (attrs.dribbling || 50) * 0.3 +
        (attrs.coordination || 50) * 0.5 +
        (attrs.mental || 50) * 0.2;
    }

    // 防守者力量惩罚
    if (defender) {
      const defenderStrength = defender.attributes.strength || 50;
      baseSuccess -= defenderStrength * 0.5;
    }

    // 随机数
    const randomModifier = (Math.random() - 0.5) * 30;

    return Math.max(0, Math.min(100, baseSuccess + randomModifier));
  }

  /**
   * 计算射门成功率
   * 公式: (射门精度 - 距离惩罚 - 守门员扑救属性) × 压力修正系数
   */
  calcShotSuccess(
    shooter: Player | null,
    goalkeeper: Player | null,
    distance: number,
    pressure: number
  ): number {
    if (!shooter) return 20;

    const attrs = shooter.attributes;
    let baseSuccess = attrs.shooting || 50;

    // 距离惩罚
    const distancePenalty = distance * 1.5;
    baseSuccess -= distancePenalty;

    // 守门员扑救
    if (goalkeeper) {
      const gkSkill = goalkeeper.attributes.goalkeeping || 50;
      baseSuccess -= gkSkill * 0.3;
    }

    // 压力修正
    const pressureModifier = 1 - pressure / 200;
    baseSuccess *= pressureModifier;

    // 随机数
    const randomModifier = (Math.random() - 0.5) * 20;

    return Math.max(5, Math.min(80, baseSuccess + randomModifier));
  }
}
