import { tool } from 'ai';
import { ProjectService } from 'src/common/helpers/project.service';
import { z } from 'zod/v4';
import {
  formatToolError,
  toolSuccess,
} from 'src/common/agents/tools/shared/format-tool-error';

function toLineList(values: unknown[]): string[] {
  return values.map((value) => {
    if (typeof value === 'string') return `- ${value}`;
    if (value instanceof Error) return `- ${value.message}`;
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return `- ${String(value)}`;
    }

    if (value && typeof value === 'object') {
      try {
        return `- ${JSON.stringify(value)}`;
      } catch {
        return '- Erro desconhecido.';
      }
    }

    return '- Erro desconhecido.';
  });
}

export function createProjectTools(projectService: ProjectService) {
  return {
    created_projects: tool({
      description: 'Lista os projetos criados no diretório principal',
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const projects = await projectService.getProjectsCreatedInDirectory();
          return toolSuccess(
            'Projetos criados no diretório principal.',
            toLineList(projects),
          );
        } catch (error) {
          return formatToolError('listar os projetos criados', error);
        }
      },
    }),
    check_typescript: tool({
      description:
        'Valida o código TypeScript do projeto, retornando erros caso existam',
      inputSchema: z.object({
        file_or_folder_path: z.string().optional(),
      }),
      execute: ({ file_or_folder_path }: { file_or_folder_path?: string }) => {
        try {
          const result =
            projectService.checkTypeScriptErrors(file_or_folder_path);

          if (!result.length) {
            return toolSuccess('Verificação TypeScript concluída.', [
              'Nenhum problema encontrado.',
            ]);
          }

          return toolSuccess(
            'Verificação TypeScript concluída.',
            toLineList(result),
          );
        } catch (error) {
          return formatToolError('validar o TypeScript', error);
        }
      },
    }),
    install_depency: tool({
      description: 'Instala uma nova dependência',
      inputSchema: z.object({
        dependecyName: z.string(),
        isDev: z.boolean(),
      }),
      execute: async ({
        dependecyName,
        isDev,
      }: {
        dependecyName: string;
        isDev: boolean;
      }) => {
        try {
          const result = await projectService.installDependency(
            dependecyName,
            isDev,
          );
          return toolSuccess('Dependência instalada com sucesso.', [
            typeof result === 'string'
              ? result
              : JSON.stringify(result, null, 2),
          ]);
        } catch (error) {
          return formatToolError('instalar a dependência', error);
        }
      },
    }),
  };
}
