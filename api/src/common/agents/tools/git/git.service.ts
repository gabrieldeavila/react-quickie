import { Injectable } from '@nestjs/common';
import type { ToolSet } from 'ai';
import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { ContextService } from 'src/common/context/context.service';
import { createGitApprovalPolicies } from './domain/git-approval-policies';
import { isGitRepository } from './is-git-repository';
import { createGitChangesTools } from './tools/git-changes.tools';
import { createGitHistoryTools } from './tools/git-history.tools';

@Injectable()
export class GitToolsService {
  constructor(private readonly contextService: ContextService) {}

  createGitTools() {
    const getRoot = () => this.contextService.get('root');
    return {
      ...createGitHistoryTools(getRoot),
      ...createGitChangesTools(getRoot),
    };
  }

  createApprovalPolicies() {
    return createGitApprovalPolicies();
  }

  /** The git tools and their policies, only when `root` is a repository. */
  async createToolkit(root: string | undefined): Promise<{
    tools: ToolSet;
    approvalPolicies: Record<string, ToolApprovalPolicy>;
  }> {
    if (!root || !(await isGitRepository(root))) {
      return { tools: {}, approvalPolicies: {} };
    }
    return {
      tools: this.createGitTools(),
      approvalPolicies: this.createApprovalPolicies(),
    };
  }
}
