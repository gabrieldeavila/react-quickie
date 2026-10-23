import { Injectable } from '@nestjs/common';
import type { ToolSet } from 'ai';
import { ProjectService } from 'src/common/helpers/project.service';
import { StorageService } from 'src/common/helpers/storage.service';
import {
  createMemoryTools,
  createProjectTools,
  createStorageTools,
} from './tools';
import { ContextService } from 'src/common/context/context.service';
import { BashToolsService } from 'src/common/agents/tools/bash/bash.service';
import { GitToolsService } from 'src/common/agents/tools/git/git.service';
import { MemoryService } from 'src/common/helpers/memory.service';
import { SubagentToolService } from 'src/subagents/data/subagent-tool.service';
import { McpToolsService } from 'src/mcp/data/mcp-tools.service';
import { McpSetupToolsService } from 'src/mcp/data/mcp-setup-tools.service';
import { InstructionToolsService } from 'src/instructions/data/instruction-tools.service';
import { ApprovalRulesRepository } from 'src/approvals/data/approval-rules.repository';
import { applyApprovalRules } from 'src/approvals/domain/apply-approval-rules';
import { applyAutoMode } from 'src/approvals/domain/apply-auto-mode';
import {
  buildToolApprovalMap,
  type ToolApprovalMap,
} from './domain/approval-policy';

@Injectable()
export class ChatService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly memoryService: MemoryService,
    private readonly storageService: StorageService,
    private readonly contextService: ContextService,
    private readonly bashToolsService: BashToolsService,
    private readonly gitToolsService: GitToolsService,
    private readonly subagentToolService: SubagentToolService,
    private readonly mcpToolsService: McpToolsService,
    private readonly instructionToolsService: InstructionToolsService,
    private readonly mcpSetupToolsService: McpSetupToolsService,
    private readonly approvalRulesRepository: ApprovalRulesRepository,
  ) {}

  /**
   * Tools and their `streamText({ toolApproval })` map for this request.
   * Built together because MCP tool names and policies come from one load.
   * Git tools are included whenever the root is a git repository.
   */
  async getToolkit(): Promise<{
    tools: ToolSet;
    toolApproval: ToolApprovalMap;
  }> {
    const root = this.contextService.get('root');
    const [mcp, git, subagents, approvalRules] = await Promise.all([
      root
        ? this.mcpToolsService.getToolkit(root)
        : { tools: {}, approvalPolicies: {} },
      this.gitToolsService.createToolkit(root),
      this.subagentToolService.createToolkit(root),
      this.approvalRulesRepository.read(),
    ]);
    const instructions = this.instructionToolsService.createToolkit(root);
    const mcpSetup = root
      ? this.mcpSetupToolsService.createToolkit(root)
      : { tools: {}, approvalPolicies: {} };

    return {
      tools: {
        ...mcp.tools,
        ...this.getBuiltInTools(),
        ...git.tools,
        ...subagents.tools,
        ...instructions.tools,
        ...mcpSetup.tools,
      },
      // The subagent policy applies even without a root: a write-capable
      // agent must never run unasked. User rules, then auto mode, only turn
      // `ask` into `never`.
      toolApproval: buildToolApprovalMap(
        applyAutoMode(
          applyApprovalRules(
            {
              ...mcp.approvalPolicies,
              ...(root
                ? this.bashToolsService.createApprovalPolicies(root)
                : {}),
              ...git.approvalPolicies,
              ...subagents.approvalPolicies,
              ...instructions.approvalPolicies,
              ...mcpSetup.approvalPolicies,
            },
            approvalRules.rules,
            root ? this.approvalRulesRepository.projectKey(root) : undefined,
          ),
          { enabled: this.contextService.get('autoApprove') === true },
        ),
      ),
    };
  }

  private getBuiltInTools(): ToolSet {
    return {
      ...createStorageTools(this.storageService),
      ...createProjectTools(this.projectService),
      ...createMemoryTools(this.memoryService),
      ...this.bashToolsService.createBashTools(),
    };
  }
}
