import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ProjectService } from 'src/common/helpers/project.service';

const PROJECT_TEMPLATES = new Set([
  'vite-base',
  'next-base',
  'nest-base',
  'nest-vite-base',
]);

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  async createProject(
    @Body()
    body: {
      name: string;
      path: string;
      template: string;
      initializeGit: boolean;
    },
  ) {
    if (!PROJECT_TEMPLATES.has(body.template)) {
      throw new BadRequestException(`Template '${body.template}' inválido.`);
    }

    const data = await this.projectService.createProject({
      projectName: body.name,
      path: body.path,
      template: body.template,
      startGit: body.initializeGit,
    });

    return {
      success: data.success,
      path: data.path,
      output: data.output,
      error: data.error,
    };
  }
}
