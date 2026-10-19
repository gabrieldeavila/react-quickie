import { Module } from '@nestjs/common';
import { InstructionsModule } from 'src/instructions/instructions.module';
import { ProjectService } from './project.service';
import { StorageService } from './storage.service';
import { FileReadService } from './storage/file-read.service';
import { FileSearchService } from './storage/file-search.service';
import { FileWriteService } from './storage/file-write.service';
import { PromptsService } from './prompts.service';
import { MarkdownService } from './markdown.module';
import { TsCheckerService } from './tschecker.service';
import { LinterService } from './linter.service';
import { MemoryService } from './memory.service';
import { EnvironmentService } from './environment.service';

@Module({
  imports: [InstructionsModule],
  providers: [
    ProjectService,
    StorageService,
    FileReadService,
    FileWriteService,
    FileSearchService,
    MemoryService,
    PromptsService,
    EnvironmentService,
    MarkdownService,
    TsCheckerService,
    LinterService,
  ],
  exports: [
    ProjectService,
    MemoryService,
    StorageService,
    PromptsService,
    EnvironmentService,
    MarkdownService,
    TsCheckerService,
    LinterService,
  ],
})
export class HelperModule {}
