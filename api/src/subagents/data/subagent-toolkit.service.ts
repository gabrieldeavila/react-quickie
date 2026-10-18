import { Injectable } from '@nestjs/common';
import type { ToolSet } from 'ai';
import {
  createMemoryTools,
  createProjectTools,
  createStorageTools,
} from 'src/chat/tools';
import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { BashToolsService } from 'src/common/agents/tools/bash/bash.service';
import { GitToolsService } from 'src/common/agents/tools/git/git.service';
import { MemoryService } from 'src/common/helpers/memory.service';
import { ProjectService } from 'src/common/helpers/project.service';
import { StorageService } from 'src/common/helpers/storage.service';
import { McpToolsService } from 'src/mcp/data/mcp-tools.service';
import type { AgentDefinition } from '../domain/agent-definition.types';
import { buildNestedApprovalPolicies } from '../domain/nested-approval-policies';
import { resolveAgentTools } from '../domain/resolve-agent-tools';

export type SubagentToolkit = {
  tools: ToolSet;
  /** Already mapped for a nested run (`ask` → held back and reported). */
  approvalPolicies: Record<string, ToolApprovalPolicy>;
};

function pick(tools: ToolSet, names: string[]): ToolSet {
  return Object.fromEntries(names.map((name) => [name, tools[name]]));
}

function pickPolicies(
  policies: Record<string, ToolApprovalPolicy>,
  names: string[],
): Record<string, ToolApprovalPolicy> {
  return Object.fromEntries(
    names
      .filter((name) => policies[name])
      .map((name) => [name, policies[name]]),
  );
}

/**
 * The tools a subagent may use. The pool is every built-in tool regardless
 * of the chat mode, plus MCP tools; the agent's allowlist narrows it.
 */
@Injectable()
export class SubagentToolkitService {
  constructor(
    private readonly storageService: StorageService,
    private readonly projectService: ProjectService,
    private readonly memoryService: MemoryService,
    private readonly bashToolsService: BashToolsService,
    private readonly gitToolsService: GitToolsService,
    private readonly mcpToolsService: McpToolsService,
  ) {}

  async forAgent(
    root: string,
    definition: AgentDefinition,
  ): Promise<SubagentToolkit> {
    const mcp = await this.mcpToolsService.getToolkit(root);
    const pool: ToolSet = {
      ...mcp.tools,
      ...createStorageTools(this.storageService),
      ...createProjectTools(this.projectService),
      ...createMemoryTools(this.memoryService),
      ...this.bashToolsService.createBashTools(),
      ...this.gitToolsService.createGitTools(),
    };
    const policies = {
      ...mcp.approvalPolicies,
      ...this.bashToolsService.createApprovalPolicies(root),
    };

    const names = resolveAgentTools(Object.keys(pool), definition);
    return {
      tools: pick(pool, names),
      approvalPolicies: buildNestedApprovalPolicies(
        pickPolicies(policies, names),
      ),
    };
  }
}
