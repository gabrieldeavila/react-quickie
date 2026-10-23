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
import { withSuccessCallback } from '../domain/with-success-callback';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpServersService } from './mcp-servers.service';
import { McpSignInRequestsService } from './mcp-sign-in-requests.service';

export type McpToolkit = {
  tools: ToolSet;
  approvalPolicies: Record<string, ToolApprovalPolicy>;
};

const EMPTY_TOOLKIT: McpToolkit = { tools: {}, approvalPolicies: {} };

/** MCP tools are plain function tools; `strict` is a function-tool field. */
function nonStrict(tool: Tool): Tool {
  return { ...tool, strict: false } as Tool;
}

/**
 * Caps each result, and calls `onSuccess` after a call that worked. MCP
 * schemas come from third-party servers and often have optional parameters
 * with a `null` default, which strict mode can't express: providers that
 * default to strict tools (OpenAI's Responses API) then make the model
 * invent a value (`""`, `"all"`). `strict: false` lets it leave them out.
 */
function wrapAll(
  tools: Record<string, Tool>,
  onSuccess: () => void,
): Record<string, Tool> {
  return Object.fromEntries(
    Object.entries(tools).map(([name, tool]) => [
      name,
      nonStrict(withSuccessCallback(withCappedOutput(tool), onSuccess)),
    ]),
  );
}

/** What the chat gets from MCP: namespaced tools and their approval policies. */
@Injectable()
export class McpToolsService {
  private readonly logger = new Logger(McpToolsService.name);

  constructor(
    private readonly serversService: McpServersService,
    private readonly pool: McpClientPoolService,
    private readonly signIns: McpSignInRequestsService,
  ) {}

  /** Never throws: a broken config or server only removes MCP tools. */
  async getToolkit(root: string): Promise<McpToolkit> {
    try {
      const { active } = await this.serversService.resolve(root);
      return await this.load(root, active.filter(isUsableServer));
    } catch (error) {
      this.logger.warn(
        `MCP unavailable for ${root}: ${error instanceof Error ? error.message : String(error)}`,
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
                // A call that works means a printed sign-in link is done.
                tools: wrapAll(serverTools, () =>
                  this.signIns.clearPrintedLinks(root, server.name),
                ),
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
