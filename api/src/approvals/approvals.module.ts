import { Module } from '@nestjs/common';
import { ApprovalRulesRepository } from './data/approval-rules.repository';
import { ApprovalsController } from './delivery/approvals.controller';

@Module({
  controllers: [ApprovalsController],
  providers: [ApprovalRulesRepository],
  exports: [ApprovalRulesRepository],
})
export class ApprovalsModule {}
