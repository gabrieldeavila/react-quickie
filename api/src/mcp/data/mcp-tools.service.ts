import { Injectable, Logger } from '@nestjs/common';
import type { Tool, ToolSet } from 'ai';
import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { createMcpApprovalPolicies } from '../domain/mcp-approval-policies';
import {
  isUsableServer,
  type UsableMcpServer,
} from '../domain/mcp-server.types';
import { namespaceMcpTools } from '../domain/namespace-mcp-tools';
import { withCappedOutput } from '../domain/with-capped-output';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpServersService } from './mcp-servers.service';

export type McpToolkit = {
  tools: ToolSet;
  approvalPolicies: Record<string, ToolApprovalPolicy>;
};

const EMPTY_TOOLKIT: McpToolkit = { tools: {}, approvalPolicies: {} };

function capAll(tools: Record<string, Tool>): Record<string, Tool> {
  return Object.fromEntries(
    Object.entries(tools).map(([name, tool]) => [name, withCappedOutput(tool)]),
  );
}

/** What the chat gets from MCP: namespaced tools and their approval policies. */
@Injectable()
export class McpToolsService {
  private readonly logger = new Logger(McpToolsService.name);

  constructor(
    private readonly serversService: McpServersService,
    private readonly pool: McpClientPoolService,
  ) {}

  /** Never throws: a broken config or server only removes MCP tools. */
  async getToolkit(root: string): Promise<McpToolkit> {
    try {
      const { active } = await this.serversService.resolve(root);
      return await this.load(root, active.filter(isUsableServer));
    } catch (error) {
      this.logger.warn(
        `MCP indisponível para ${root}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return EMPTY_TOOLKIT;
    }
  }

  private async load(
    root: string,
    servers: UsableMcpServer[],
  ): Promise<McpToolkit> {
    // In parallel: the first request waits at most one connect timeout.
    const loaded = await Promise.all(
      servers.map(async (server) => ({
        server,
        tools: await this.pool.getTools(root, server),
      })),
    );

    const { tools, entries } = namespaceMcpTools(
      loaded.flatMap(({ server, tools: serverTools }) =>
        serverTools
          ? [
              {
                server: server.name,
                tools: capAll(serverTools),
                enabledTools: server.config.enabledTools,
                disabledTools: server.config.disabledTools,
              },
            ]
          : [],
      ),
    );

    const approvalByServer = Object.fromEntries(
      servers.map((server) => [server.name, server.config.approval]),
    );
    return {
      tools,
      approvalPolicies: createMcpApprovalPolicies(entries, approvalByServer),
    };
  }
}
