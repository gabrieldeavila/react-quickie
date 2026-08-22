import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { ContextService } from 'src/common/context/context.service';
import z from 'zod';

@Injectable()
export class AgentBuilderToolsService {
  constructor(private readonly contextService: ContextService) {}

  createTools() {
    return {
      get_recent_commits: tool({
        description:
          'Recupera o histórico dos últimos commits do repositório Git. Retorna o hash, autor, data e mensagem.',
        inputSchema: z.object({
          limit: z
            .number()
            .optional()
            .default(5)
            .describe('Número máximo de commits para recuperar (ex: 5, 10).'),
        }),
        execute: ({ limit }: { limit: number }) => {
          const rootPath = this.contextService.get('root')!;

          return rootPath + limit;
        },
      }),
    };
  }
}
