import { Module } from '@nestjs/common';
import { FrontendToolsService } from './tools/frontend/tool.service';
import { GitToolsService } from './tools/git/git.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FrontendToolsService, GitToolsService],
  exports: [FrontendToolsService, GitToolsService],
})
export class AgentsModule {}
