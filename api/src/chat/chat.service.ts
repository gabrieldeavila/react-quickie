import { Injectable } from '@nestjs/common';
import { ProjectService } from 'src/common/helpers/project.service';
import { StorageService } from 'src/common/helpers/storage.service';
import { createProjectTools, createStorageTools } from './tools';
import { ContextService } from 'src/common/context/context.service';
import createFrontendTools from 'src/common/agents/tools/frontend/tool';

@Injectable()
export class ChatService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
    private readonly contextService: ContextService,
  ) {}

  getCustomTools() {
    const mode = this.contextService.get('mode');
    if (mode === 'frontend') {
      return createFrontendTools();
    }
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
