import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProjectService } from 'src/common/helpers/project.service';
import { StorageService } from 'src/common/helpers/storage.service';
import { createProjectTools, createStorageTools } from './tools';

@Injectable()
export class ChatService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  getTools() {
    return {
      ...createStorageTools(this.storageService),
      ...createProjectTools(this.projectService),
    };
  }
}
