import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { StorageService } from './storage.service';
import { PromptsService } from './prompts.service';
import { LoggerService } from './logger.service';

@Module({
  providers: [ProjectService, StorageService, PromptsService, LoggerService],
  exports: [ProjectService, StorageService, PromptsService, LoggerService],
})
export class HelperModule {}
