import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { StorageService } from './storage.service';
import { PromptsService } from './prompts.service';
import { LoggerService } from './logger.service';
import { MarkdownService } from './markdown.module';

@Module({
  providers: [
    ProjectService,
    StorageService,
    PromptsService,
    LoggerService,
    MarkdownService,
  ],
  exports: [
    ProjectService,
    StorageService,
    PromptsService,
    LoggerService,
    MarkdownService,
  ],
})
export class HelperModule {}
