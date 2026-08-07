import { Injectable } from '@nestjs/common';
import { ProjectService } from 'src/common/helpers/project.service';
import { StorageService } from 'src/common/helpers/storage.service';
import { createProjectTools, createStorageTools } from './tools';
import { ConfigService } from '@nestjs/config';
import { createOpenAI } from '@ai-sdk/openai';

@Injectable()
export class ChatService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  getTools() {
    const apiKey = this.configService.get<string>('OPENAI_KEY');

    const openai = createOpenAI({
      apiKey,
    });

    return {
      ...createStorageTools(this.storageService),
      ...createProjectTools(this.projectService),
      // ...createPlanningTools(openai),
    };
  }
}
