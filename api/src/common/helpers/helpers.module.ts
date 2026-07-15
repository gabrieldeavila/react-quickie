import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { StorageService } from './storage.service';
import { PromptsService } from './prompts.service';

@Module({
  providers: [ProjectService, StorageService, PromptsService],
  exports: [ProjectService, StorageService, PromptsService],
})
export class HelperModule {}
