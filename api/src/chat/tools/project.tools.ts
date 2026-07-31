import { tool, zodSchema } from 'ai';
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
        filePath: z.string().optional(),
      }),
      execute: async ({ filePath }: { filePath?: string }) => {
        const result = await projectService.checkTypeScriptErrors(filePath);
        return result;
      },
    }),
    install_depency: tool({
      description: 'Instala uma nova dependência no projeto',
      inputSchema: z.object({
        projectName: z.string(),
        dependecyName: z.string(),
        isDev: z.boolean(),
      }),
      execute: async ({ projectName, dependecyName, isDev }) => {
        const projects = await projectService.installDependency(
          projectName,
          dependecyName,
          isDev,
        );

        return { success: true, projects };
      },
    }),
  };
}
