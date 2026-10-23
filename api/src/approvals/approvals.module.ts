import { Module } from '@nestjs/common';
import { ApprovalRulesRepository } from './data/approval-rules.repository';

@Module({
  providers: [ApprovalRulesRepository],
  exports: [ApprovalRulesRepository],
})
export class ApprovalsModule {}
