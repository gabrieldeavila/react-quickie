import { tool } from 'ai';
import { ProjectService } from 'src/common/helpers/project.service';
import z from 'zod';

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
