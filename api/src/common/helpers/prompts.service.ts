import { Injectable } from '@nestjs/common';
import { Instructions } from 'ai';
import { MarkdownService } from './markdown.module';
import { ContextService } from '../context/context.service';

@Injectable()
export class PromptsService {
  constructor(
    private readonly markdownService: MarkdownService,
    private readonly contextService: ContextService,
  ) {}

  async getInstructions(): Promise<Instructions> {
    const paths: Record<number, string> = {
      1: '../.agents/skills/ui/landing.skills',
      2: '../.agents/skills/ui/forms.skills',
      3: '../.agents/skills/developer/backend',
      4: '../.agents/skills/developer/frontend',
    };

    const mode = this.contextService.get('mode');
    const selectedPromptPath = mode && mode in paths ? paths[mode] : paths[1];

    const instructions: Instructions = [
      {
        role: 'system',
        content: `The user project is ${this.contextService.get('root')}`,
      },
      {
        role: 'system',
        content: await this.markdownService.getMarkdownFile(
          '../.agents/skills/ui/design.system.skills',
        ).html,
      },
      {
        role: 'system',
        content: await this.markdownService.getMarkdownFile(
          '../.agents/skills/developer/agnostic',
        ).html,
      },
    ];

    if (selectedPromptPath) {
      instructions.push({
        role: 'system',
        content:
          await this.markdownService.getMarkdownFile(selectedPromptPath).html,
      });
    }

    return instructions;
  }
}
