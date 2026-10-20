import { Module } from '@nestjs/common';
import { BashToolsService } from './tools/bash/bash.service';
import { CommandPolicyService } from './tools/bash/command-policy.service';
import { GitToolsService } from './tools/git/git.service';

@Module({
  imports: [],
  providers: [BashToolsService, CommandPolicyService, GitToolsService],
  exports: [BashToolsService, GitToolsService],
})
export class AgentsModule {}
