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
      1: '../.agents/skills/awwwards-hero/SKILL',
    };

    const mode = this.contextService.get('mode');

    const instructions: Instructions = [
      {
        role: 'system',
        content: `The user project is ${this.contextService.get('root')}`,
      },
      {
        role: 'system',
        content: await this.markdownService.getMarkdownFile(
          '../.agents/skills/awwwards-hero/SKILL',
        ).html,
      },
    ];

    if (mode && mode in paths) {
      instructions.push({
        role: 'system',
        content: await this.markdownService.getMarkdownFile(paths[mode]).html,
      });
    }

    return instructions;
  }
}
