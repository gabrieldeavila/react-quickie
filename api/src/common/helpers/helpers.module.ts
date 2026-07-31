import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { StorageService } from './storage.service';
import { PromptsService } from './prompts.service';
import { LoggerService } from './logger.service';
import { MarkdownService } from './markdown.module';
import { TsCheckerService } from './tschecker.service';

@Module({
  providers: [
    ProjectService,
    StorageService,
    PromptsService,
    LoggerService,
    MarkdownService,
    TsCheckerService,
  ],
  exports: [
    ProjectService,
    StorageService,
    PromptsService,
    LoggerService,
    MarkdownService,
    TsCheckerService,
  ],
})
export class HelperModule {}
