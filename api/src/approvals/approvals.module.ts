import { Module } from '@nestjs/common';
import { LlmModule } from 'src/llm/llm.module';
import { ApprovalRulesRepository } from './data/approval-rules.repository';
import { IntentCheckService } from './data/intent-check.service';
import { ApprovalsController } from './delivery/approvals.controller';

@Module({
  imports: [LlmModule],
  controllers: [ApprovalsController],
  providers: [ApprovalRulesRepository, IntentCheckService],
  exports: [ApprovalRulesRepository, IntentCheckService],
})
export class ApprovalsModule {}
