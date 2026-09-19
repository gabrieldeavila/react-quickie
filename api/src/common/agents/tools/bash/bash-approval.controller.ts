import { Body, Controller, Param, Post } from '@nestjs/common';
import { BashApprovalService } from './bash-approval.service';
import { BashToolsService } from './bash.service';

@Controller('agent/bash-approvals')
export class BashApprovalController {
  constructor(
    private readonly approvalService: BashApprovalService,
    private readonly bashService: BashToolsService,
  ) {}

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    const approval = this.approvalService.resolve(id, 'approved');
    const result = await this.bashService.executeCommand(
      approval.command,
      approval.cwd,
    );
    return {
      approvalId: id,
      decision: 'approved',
      command: approval.command,
      result,
    };
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    const approval = this.approvalService.resolve(id, 'rejected');
    return { approvalId: id, decision: 'rejected', command: approval.command };
  }

  @Post(':id/revise')
  revise(@Param('id') id: string, @Body() body: { command?: string }) {
    const approval = this.approvalService.resolve(id, 'rejected');
    return {
      approvalId: id,
      decision: 'revise',
      originalCommand: approval.command,
      command: body.command?.trim() ?? '',
    };
  }
}
