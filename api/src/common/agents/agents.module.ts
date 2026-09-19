import { Module } from '@nestjs/common';
import { BashToolsService } from './tools/bash/bash.service';
import { BashApprovalController } from './tools/bash/bash-approval.controller';
import { BashApprovalService } from './tools/bash/bash-approval.service';
import { CommandPolicyService } from './tools/bash/command-policy.service';
import { FrontendToolsService } from './tools/frontend/tool.service';
import { GitToolsService } from './tools/git/git.service';

@Module({
  imports: [],
  controllers: [BashApprovalController],
  providers: [
    BashToolsService,
    BashApprovalService,
    CommandPolicyService,
    FrontendToolsService,
    GitToolsService,
  ],
  exports: [BashToolsService, FrontendToolsService, GitToolsService],
})
export class AgentsModule {}
