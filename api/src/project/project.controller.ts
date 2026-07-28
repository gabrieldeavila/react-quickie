import { Body, Controller, Post } from '@nestjs/common';
import { ProjectService } from 'src/common/helpers/project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  async createProject(
    @Body() body: { name: string; path: string },
  ) {
    const data = await this.projectService.createProject({
      projectName: body.name,
      path: body.path,
    });

    return {
      success: data.success,
      path: data.path
    };
  }
}
