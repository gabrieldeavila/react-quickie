import { tool } from 'ai';
import { ProjectService } from 'src/common/helpers/project.service';
import { z } from 'zod/v4';

export function createProjectTools(projectService: ProjectService) {
  return {
    created_projects: tool({
      description: 'Lista os projetos criados no diretório principal',
      inputSchema: z.object({}),
      execute: async () => {
        const projects = await projectService.getProjectsCreatedInDirectory();

        return { success: true, projects };
      },
    }),
    check_typescript: tool({
      description:
        'Valida o código TypeScript do projeto, retornando erros caso existam',
      inputSchema: z.object({
        file_or_folder_path: z.string().optional(),
      }),
      execute: ({ file_or_folder_path }: { file_or_folder_path?: string }) => {
        const result =
          projectService.checkTypeScriptErrors(file_or_folder_path);
        return result;
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
        const projects = await projectService.installDependency(
          dependecyName,
          isDev,
        );

        return { success: true, projects };
      },
    }),
  };
}
