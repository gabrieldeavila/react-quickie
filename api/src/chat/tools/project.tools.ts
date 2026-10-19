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
        return '- Unknown error.';
      }
    }

    return '- Unknown error.';
  });
}

export function createProjectTools(projectService: ProjectService) {
  return {
    created_projects: tool({
      description: 'Lists the projects created in the main folder',
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const projects = await projectService.getProjectsCreatedInDirectory();
          return toolSuccess(
            'Projects created in the main folder.',
            toLineList(projects),
          );
        } catch (error) {
          return formatToolError('list the created projects', error);
        }
      },
    }),
    check_typescript: tool({
      description:
        'Type-checks the project TypeScript code and returns any errors',
      inputSchema: z.object({
        file_or_folder_path: z.string().optional(),
      }),
      execute: ({ file_or_folder_path }: { file_or_folder_path?: string }) => {
        try {
          const result =
            projectService.checkTypeScriptErrors(file_or_folder_path);

          if (!result.length) {
            return toolSuccess('TypeScript check finished.', [
              'No problems found.',
            ]);
          }

          return toolSuccess('TypeScript check finished.', toLineList(result));
        } catch (error) {
          return formatToolError('check TypeScript', error);
        }
      },
    }),
    install_depency: tool({
      description: 'Installs a new dependency',
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
          return toolSuccess('Dependency installed.', [
            typeof result === 'string'
              ? result
              : JSON.stringify(result, null, 2),
          ]);
        } catch (error) {
          return formatToolError('install the dependency', error);
        }
      },
    }),
  };
}
