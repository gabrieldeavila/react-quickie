import { tool } from 'ai';
import { z } from 'zod/v4';
import { createComponent } from './templates/componentBlueprint';
import { Injectable } from '@nestjs/common';
import { ContextService } from 'src/common/context/context.service';
import path from 'path';

@Injectable()
export class FrontendToolsService {
  constructor(private readonly contextService: ContextService) {}

  createFrontendTools() {
    return {
      create_component_blueprint: tool({
        description:
          'Gera a estrutura boilerplate completa de um componente React complexo, criando múltiplos arquivos como index, contexts (Base e Services) e types. Use essa tool sempre que precisar criar uma nova feature ou componente complexo.',
        inputSchema: z.object({
          name: z
            .string()
            .describe(
              'Nome do componente ou feature em PascalCase (ex: UserProfile, DashboardMatrix). Ele será usado para nomear as funções, tipos e a pasta principal.',
            ),
          targetPath: z
            .string()
            .describe(
              "Caminho relativo do diretório onde o componente será criado (ex: 'src/components', 'src/features'). A raiz do projeto já está implícita.",
            ),
        }),
        execute: ({
          name,
          targetPath,
        }: {
          name: string;
          targetPath: string;
        }) => {
          const rootPath = this.contextService.get('root')!;
          const pathToAdd = path.join(rootPath, targetPath);

          const result = createComponent(name, pathToAdd, rootPath);

          return { success: true, ...result };
        },
      }),
    };
  }
}
