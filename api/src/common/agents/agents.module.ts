import { Module } from '@nestjs/common';
import { BashToolsService } from './tools/bash/bash.service';
import { CommandPolicyService } from './tools/bash/command-policy.service';
import { FrontendToolsService } from './tools/frontend/tool.service';
import { GitToolsService } from './tools/git/git.service';

@Module({
  imports: [],
  providers: [
    BashToolsService,
    CommandPolicyService,
    FrontendToolsService,
    GitToolsService,
  ],
  exports: [BashToolsService, FrontendToolsService, GitToolsService],
})
export class AgentsModule {}
