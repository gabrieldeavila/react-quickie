import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import path from 'path';
import { ContextService } from 'src/common/context/context.service';
import { z } from 'zod/v4';
import { formatToolError, toolSuccess } from '../shared/format-tool-error';
import { createComponent } from './templates/componentBlueprint';

type ComponentBlueprint = string | Record<string, unknown>;

function normalizeBlueprint(result: ComponentBlueprint): string[] {
  const content =
    typeof result === 'string' ? result : JSON.stringify(result, null, 2);

  return [content];
}

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
          try {
            const rootPath = this.contextService.get('root');
            if (!rootPath) {
              return formatToolError(
                'gerar o blueprint do componente',
                new Error('Raiz do projeto não encontrada.'),
              );
            }

            const pathToAdd = path.join(rootPath, targetPath);
            const result = createComponent(name, pathToAdd, rootPath);

            return toolSuccess(
              'Blueprint do componente gerado com sucesso.',
              normalizeBlueprint(result),
            );
          } catch (error) {
            return formatToolError('gerar o blueprint do componente', error);
          }
        },
      }),
    };
  }
}
