import { Injectable } from '@nestjs/common';
import { allowMcpTool } from '../domain/allow-mcp-tool';
import { McpConfigEditError } from '../domain/mcp-config-text';
import {
  isUsableServer,
  type UsableMcpServer,
} from '../domain/mcp-server.types';
import {
  namespaceMcpTools,
  type NamespacedMcpTool,
} from '../domain/namespace-mcp-tools';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpConfigEditsService } from './mcp-config-edits.service';
import { McpServersService } from './mcp-servers.service';

type FoundTool = { server: UsableMcpServer; entry: NamespacedMcpTool };

/**
 * "Always allow" for an MCP tool: writes `approval: never` into the server's
 * own `mcp.json` entry, the same setting `/mcp` → Tools… edits.
 */
@Injectable()
export class McpToolApprovalService {
  constructor(
    private readonly serversService: McpServersService,
    private readonly pool: McpClientPoolService,
    private readonly edits: McpConfigEditsService,
  ) {}

  async alwaysAllow(
    root: string,
    toolName: string,
    wholeServer: boolean,
  ): Promise<void> {
    const { server, entry } = await this.findTool(root, toolName);
    await this.edits.patch(
      root,
      server.source,
      server.name,
      {
        toolApproval: allowMcpTool(
          server.config.approval,
          entry.tool,
          wholeServer,
        ),
      },
      undefined,
    );
  }

  /** Exposed names can be sanitized or hashed, so map them like the chat does. */
  private async findTool(root: string, toolName: string): Promise<FoundTool> {
    const { active } = await this.serversService.resolve(root);
    const servers = active.filter(isUsableServer);
    const loaded = await Promise.all(
      servers.map(async (server) => ({
        server: server.name,
        tools: (await this.pool.getTools(root, server)) ?? {},
        enabledTools: server.config.enabledTools,
        disabledTools: server.config.disabledTools,
      })),
    );
    const entry = namespaceMcpTools(loaded).entries.find(
      (candidate) => candidate.name === toolName,
    );
    const server = servers.find(
      (candidate) => candidate.name === entry?.server,
    );
    if (!entry || !server) {
      throw new McpConfigEditError(
        'not-found',
        `MCP tool "${toolName}" not found.`,
      );
    }
    return { server, entry };
  }
}
