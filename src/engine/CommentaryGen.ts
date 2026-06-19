/**
 * CommentaryGen - 文字解说生成器
 */

export interface MatchEvent {
  type: string;
  data: any;
  tick: number;
}

export interface CommentaryTemplate {
  id: string;
  trigger: string;
  condition: any;
  text: string;
  color: string;
  knowledgeRef?: string;
}

export class CommentaryGen {
  private templates: CommentaryTemplate[] = [];

  constructor(templateData: any) {
    if (templateData?.templates) {
      this.templates = templateData.templates;
    }
  }

  generate(event: MatchEvent): { text: string; color: string } | null {
    const matchingTemplates = this.templates.filter(
      (t) => t.trigger === event.type || t.trigger === this.mapEventType(event.type)
    );

    if (matchingTemplates.length === 0) {
      // 默认解说
      return this.generateDefault(event);
    }

    // 选择第一个匹配的模板
    const template = matchingTemplates[0];
    const text = this.interpolate(template.text, event.data);

    return {
      text,
      color: template.color,
    };
  }

  private mapEventType(type: string): string {
    const mapping: Record<string, string> = {
      pass_success: 'pass_success',
      pass_fail: 'pass_fail',
      dribble_success: 'dribble_success',
      dribble_fail: 'dribble_fail',
      shot_goal: 'shot_goal',
      shot_save: 'shot_save',
    };
    return mapping[type] || type;
  }

  private interpolate(template: string, data: any): string {
    let result = template;
    Object.keys(data).forEach((key) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(data[key]));
    });
    return result;
  }

  private generateDefault(event: MatchEvent): { text: string; color: string } | null {
    const defaults: Record<string, { text: string; color: string }> = {
      pass_success: { text: `${event.data.player} 传球成功。`, color: 'success' },
      pass_fail: { text: `${event.data.player} 传球失误。`, color: 'warning' },
      dribble_success: { text: `${event.data.player} 突破成功！`, color: 'success' },
      dribble_fail: { text: `${event.data.player} 突破失败。`, color: 'warning' },
      shot_goal: { text: `${event.data.player} 进球！！！`, color: 'goal' },
      shot_save: { text: `${event.data.player} 射门被扑出。`, color: 'warning' },
    };

    return defaults[event.type] || null;
  }
}
