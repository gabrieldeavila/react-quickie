import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import * as path from 'path';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ProjectService } from 'src/common/helpers/project.service';

const PROJECT_TEMPLATES = new Set([
  'vite-base',
  'next-base',
  'nest-base',
  'nest-vite-base',
]);

// The UI sends no root for project creation, so an absolute target folder
// doubles as the root that gets checked against the allowed workspaces.
function projectRootFromBody(body: Record<string, unknown>) {
  if (typeof body.root === 'string' && body.root) return body.root;
  if (typeof body.path === 'string' && path.isAbsolute(body.path)) {
    return body.path;
  }
  return undefined;
}

@UseInterceptors(
  BuildContextInterceptor((req) => ({
    root: projectRootFromBody(req.body as Record<string, unknown>),
  })),
)
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
