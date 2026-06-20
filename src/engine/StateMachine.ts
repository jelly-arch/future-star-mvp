/**
 * StateMachine - 球员状态机
 * 5种状态: 持球 / 接应 / 压迫 / 盯人 / 观望
 */

export type PlayerState = 'has_ball' | 'support' | 'press' | 'mark' | 'idle';

export interface StateTransition {
  from: PlayerState;
  to: PlayerState;
  condition: (situation: any) => boolean;
}

export class StateMachine {
  private currentState: PlayerState = 'idle';
  private transitions: StateTransition[] = [];

  constructor(_player: any) {
    this.initializeTransitions();
  }

  private initializeTransitions(): void {
    this.transitions = [
      // 从观望状态
      {
        from: 'idle',
        to: 'support',
        condition: (s) => s.possession === 'home' && Math.random() > 0.7,
      },
      {
        from: 'idle',
        to: 'press',
        condition: (s) => s.possession === 'away' && Math.random() > 0.8,
      },
      {
        from: 'idle',
        to: 'has_ball',
        condition: (s) => s.possession === 'home' && Math.random() > 0.95,
      },

      // 从持球状态
      {
        from: 'has_ball',
        to: 'idle',
        condition: () => Math.random() > 0.9,
      },

      // 从接应状态
      {
        from: 'support',
        to: 'idle',
        condition: () => Math.random() > 0.85,
      },
      {
        from: 'support',
        to: 'has_ball',
        condition: () => Math.random() > 0.95,
      },

      // 从压迫状态
      {
        from: 'press',
        to: 'idle',
        condition: () => Math.random() > 0.8,
      },
    ];
  }

  update(situation: any): void {
    const validTransitions = this.transitions.filter(
      (t) => t.from === this.currentState && t.condition(situation)
    );

    if (validTransitions.length > 0) {
      const transition = validTransitions[Math.floor(Math.random() * validTransitions.length)];
      this.currentState = transition.to;
    }
  }

  getCurrentState(): PlayerState {
    return this.currentState;
  }

  transition(to: PlayerState): void {
    this.currentState = to;
  }
}
