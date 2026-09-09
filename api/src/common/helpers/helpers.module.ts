import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { StorageService } from './storage.service';
import { PromptsService } from './prompts.service';
import { MarkdownService } from './markdown.module';
import { TsCheckerService } from './tschecker.service';
import { LinterService } from './linter.service';
import { MemoryService } from './memory.service';

@Module({
  providers: [
    ProjectService,
    StorageService,
    MemoryService,
    PromptsService,
    MarkdownService,
    TsCheckerService,
    LinterService,
  ],
  exports: [
    ProjectService,
    MemoryService,
    StorageService,
    PromptsService,
    MarkdownService,
    TsCheckerService,
    LinterService,
  ],
})
export class HelperModule {}
