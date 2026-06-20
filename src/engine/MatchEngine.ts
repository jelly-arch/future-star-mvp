/**
 * MatchEngine - 比赛模拟引擎
 * Tick 驱动的事件引擎
 */

import Phaser from 'phaser';
import { ProbabilityCalc } from './ProbabilityCalc';
import { CommentaryGen } from './CommentaryGen';
import { StateMachine } from './StateMachine';

export interface MatchConfig {
  homeTeam: Team;
  awayTeam: Team;
  organization: number;
  matchDuration: number;
}

export interface Team {
  color: string;
  isHome: boolean;
  formation: any;
  players: any[];
}

export interface MatchEvent {
  type: string;
  data: any;
  tick: number;
}

export class MatchEngine extends Phaser.Events.EventEmitter {
  private config: MatchConfig;
  private tickTimer: number = 0;
  private currentTick: number = 0;
  private readonly TICK_DURATION: number = 100; // 100ms = 1 Tick
  private isRunning: boolean = false;
  private speedMultiplier: number = 1;

  private probabilityCalc: ProbabilityCalc;
  private commentaryGen: CommentaryGen;
  private stateMachines: Map<string, StateMachine> = new Map();

  private homeScore: number = 0;
  private awayScore: number = 0;
  private eventLog: MatchEvent[] = [];
  private possession: 'home' | 'away' = 'home';

  constructor(scene: Phaser.Scene, config: MatchConfig) {
    super();
    this.config = config;
    this.probabilityCalc = new ProbabilityCalc();
    this.commentaryGen = new CommentaryGen(scene.registry.get('commentary'));

    this.initializeStateMachines();
  }

  private initializeStateMachines(): void {
    const allPlayers = [
      ...this.config.homeTeam.players,
      ...this.config.awayTeam.players,
    ];

    allPlayers.forEach((player) => {
      this.stateMachines.set(player.id, new StateMachine(player));
    });
  }

  start(): void {
    this.isRunning = true;
    this.emit('commentary', {
      text: '比赛开始！',
      color: 'info',
    });
  }

  pause(): void {
    this.isRunning = false;
  }

  resume(): void {
    this.isRunning = true;
  }

  setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  update(delta: number): void {
    if (!this.isRunning) return;

    this.tickTimer += delta * this.speedMultiplier;

    while (this.tickTimer >= this.TICK_DURATION) {
      this.simulateTick();
      this.tickTimer -= this.TICK_DURATION;
    }
  }

  private simulateTick(): void {
    this.currentTick++;

    // 1. 态势评估
    const situation = this.evaluateSituation();

    // 2. 更新球员状态
    this.updatePlayerStates(situation);

    // 3. 概率计算与事件触发
    const events = this.calculateAndTriggerEvents(situation);

    // 4. 生成解说
    events.forEach((event) => {
      const commentary = this.commentaryGen.generate(event);
      if (commentary) {
        this.emit('commentary', commentary);
      }
    });

    // 5. 检查比赛结束
    this.checkMatchEnd();
  }

  private evaluateSituation(): any {
    // 简化的态势评估
    return {
      possession: this.possession,
      zone: this.getRandomZone(),
      pressureLevel: Math.random() * 100,
      organization: this.config.organization,
    };
  }

  private getRandomZone(): string {
    const zones = ['zone_1', 'zone_2', 'zone_3'];
    return zones[Math.floor(Math.random() * zones.length)];
  }

  private updatePlayerStates(situation: any): void {
    this.stateMachines.forEach((sm) => {
      sm.update(situation);
    });
  }

  private calculateAndTriggerEvents(situation: any): MatchEvent[] {
    const events: MatchEvent[] = [];

    // 随机触发事件（简化版）
    if (Math.random() < 0.1) {
      // 10% 概率每 Tick 触发事件
      const eventType = this.getRandomEventType();

      switch (eventType) {
        case 'pass':
          events.push(this.simulatePass(situation));
          break;
        case 'dribble':
          events.push(this.simulateDribble(situation));
          break;
        case 'shot':
          events.push(this.simulateShot(situation));
          break;
      }
    }

    // 记录事件
    events.forEach((event) => {
      this.eventLog.push(event);
      this.emit(event.type, event.data);
    });

    return events;
  }

  private getRandomEventType(): string {
    const types = ['pass', 'pass', 'pass', 'dribble', 'shot'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private simulatePass(_situation: any): MatchEvent {
    const passer = this.getRandomPlayer(this.possession);
    const success = this.probabilityCalc.calcPassSuccess(passer, null, [], 20) > Math.random() * 100;

    return {
      type: success ? 'pass_success' : 'pass_fail',
      data: {
        player: passer?.name || '球员',
        success,
        reason: success ? null : (Math.random() > 0.5 ? 'technical' : 'cognitive'),
      },
      tick: this.currentTick,
    };
  }

  private simulateDribble(_situation: any): MatchEvent {
    const dribbler = this.getRandomPlayer(this.possession);
    const success = this.probabilityCalc.calcDribbleSuccess(dribbler, null) > Math.random() * 100;

    return {
      type: success ? 'dribble_success' : 'dribble_fail',
      data: {
        player: dribbler?.name || '球员',
        defender: '防守球员',
        success,
      },
      tick: this.currentTick,
    };
  }

  private simulateShot(_situation: any): MatchEvent {
    const shooter = this.getRandomPlayer(this.possession);
    const success = this.probabilityCalc.calcShotSuccess(shooter, null, 20, 50) > Math.random() * 100;

    if (success) {
      if (this.possession === 'home') {
        this.homeScore++;
      } else {
        this.awayScore++;
      }
    }

    return {
      type: success ? 'shot_goal' : 'shot_save',
      data: {
        player: shooter?.name || '球员',
        team: this.possession === 'home' ? '红队' : '蓝队',
        success,
      },
      tick: this.currentTick,
    };
  }

  private getRandomPlayer(team: 'home' | 'away'): any {
    const players = team === 'home' ? this.config.homeTeam.players : this.config.awayTeam.players;
    return players[Math.floor(Math.random() * players.length)];
  }

  private checkMatchEnd(): void {
    const elapsedSeconds = (this.currentTick * this.TICK_DURATION) / 1000;
    if (elapsedSeconds >= this.config.matchDuration) {
      this.isRunning = false;
      this.emit('match_end');
    }
  }

  getHomeScore(): number {
    return this.homeScore;
  }

  getAwayScore(): number {
    return this.awayScore;
  }

  getEventLog(): MatchEvent[] {
    return this.eventLog;
  }
}
