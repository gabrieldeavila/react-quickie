import { tool } from 'ai';
import { z } from 'zod/v4';
import { createComponent } from './templates/componentBlueprint';

function createFrontendTools() {
  return {
    create_component_blueprint: tool({
      description:
        'Gera a estrutura boile∏rplate completa de um componente React complexo, criando múltiplos arquivos como index, contexts (Base e Services) e types. Use essa tool sempre que precisar criar uma nova feature ou módulo do zero.',
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
      execute: ({ name, targetPath }: { name: string; targetPath: string }) => {
        const result = createComponent(name, targetPath);

        return { success: true, ...result };
      },
    }),
  };
}

export default createFrontendTools;
