import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type BashApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PendingBashApproval {
  id: string;
  command: string;
  cwd: string;
  reason: string;
  status: BashApprovalStatus;
  createdAt: string;
}

@Injectable()
export class BashApprovalService {
  private readonly approvals = new Map<string, PendingBashApproval>();

  create(command: string, cwd: string, reason: string): PendingBashApproval {
    const approval: PendingBashApproval = {
      id: randomUUID(),
      command,
      cwd,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.approvals.set(approval.id, approval);
    return approval;
  }

  get(id: string): PendingBashApproval {
    const approval = this.approvals.get(id);
    if (!approval)
      throw new NotFoundException('Aprovação não encontrada ou expirada.');
    return approval;
  }

  resolve(id: string, status: 'approved' | 'rejected'): PendingBashApproval {
    const approval = this.get(id);
    if (approval.status !== 'pending')
      throw new Error('Esta aprovação já foi resolvida.');
    approval.status = status;
    return approval;
  }
}
