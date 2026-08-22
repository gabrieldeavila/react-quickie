import { Injectable } from '@nestjs/common';
import { ProjectService } from 'src/common/helpers/project.service';
import { StorageService } from 'src/common/helpers/storage.service';
import { createProjectTools, createStorageTools } from './tools';
import { ContextService } from 'src/common/context/context.service';
import { FrontendToolsService } from 'src/common/agents/tools/frontend/tool.service';
import { GitToolsService } from 'src/common/agents/tools/git/git.service';
import { PluginToolsService } from 'src/common/agents/plugin/tools/tools.plugins.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
    private readonly contextService: ContextService,
    private readonly frontendToolsService: FrontendToolsService,
    private readonly gitToolsService: GitToolsService,
    private readonly pluginToolsService: PluginToolsService,
  ) {}

  getCustomTools() {
    const mode = this.contextService.get('mode');
    if (mode === 'frontend') {
      return this.frontendToolsService.createFrontendTools();
    }

    if (mode === 'git') {
      return this.gitToolsService.createGitTools();
    }

    return this.pluginToolsService.getTools();
  }

  getTools() {
    const customTools = this.getCustomTools();

    return {
      ...createStorageTools(this.storageService),
      ...createProjectTools(this.projectService),
      ...customTools,
    };
  }
}
