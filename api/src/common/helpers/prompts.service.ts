import { Injectable } from '@nestjs/common';
import { Instructions } from 'ai';
import { MarkdownService } from './markdown.module';

@Injectable()
export class PromptsService {
  constructor(private readonly markdownService: MarkdownService) {}

  async getInstructions(): Promise<Instructions> {
    return [
      {
        role: 'system',
        content: `Você é um assistente de desenvolvimento de software especializado em React, Next.js e Tailwind CSS.`,
      },
      {
        role: 'system',
        content:
          'O projeto do usuário está no caminho /Users/gabrielavila/code/react-quickie/ui/',
      },
      {
        role: 'system',
        content:
          'Crie componentes reutilizáveis em arquivos pequenos, seguindo uma estrutura de clean code. Verifique quais libs estão instaladas e se necessário peça para instalar novas',
      },
      {
        role: 'system',
        content: await this.markdownService.getMarkdownFile(
          '../.agents/skills/awwwards-hero/SKILL',
        ).html,
      },
    ];
  }
}
