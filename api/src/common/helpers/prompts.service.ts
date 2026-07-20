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
          'Apenas crie um novo projeto conforme confirmação do usuário, sempre prefira editar o já existente, peça para o usuário qual projeto será editado na seção e continue nele até o final',
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
