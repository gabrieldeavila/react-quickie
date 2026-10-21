import { Injectable } from '@nestjs/common';
import { tool, type ToolSet } from 'ai';
import { z } from 'zod/v4';
import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import {
  formatToolError,
  toolSuccess,
} from 'src/common/agents/tools/shared/format-tool-error';
import { checkMcpServerRequest } from '../domain/check-mcp-server-request';
import { keepUserMcpApproval } from '../domain/keep-user-mcp-approval';
import { createMcpSetupApprovalPolicies } from '../domain/mcp-setup-approval-policies';
import {
  LIST_MCP_SERVERS_TOOL,
  REMOVE_MCP_SERVER_TOOL,
  SAVE_MCP_SERVER_TOOL,
} from '../domain/mcp-setup-tool-names';
import type { McpConfigSource } from '../domain/mcp-server.types';
import { McpConfigEditsService } from './mcp-config-edits.service';
import { McpServerCatalogService } from './mcp-server-catalog.service';
import { McpServersService } from './mcp-servers.service';

const scopeSchema = z
  .enum(['global', 'project'])
  .optional()
  .describe(
    '"global" (~/.doty/mcp.json, every project; the default) or "project" (<root>/.doty/mcp.json, can be committed: never put secrets there).',
  );

const saveInputSchema = z.object({
  scope: scopeSchema,
  name: z
    .string()
    .describe('Server name: letters, digits, ".", "_" and "-" (up to 64).'),
  config: z
    .record(z.string(), z.unknown())
    .describe(
      'The mcp.json entry. stdio: { command, args?, env? }. http/sse: { type: "http" | "sse", url, headers? }. Optional: disabled, enabledTools, disabledTools. Write secrets as "${ENV_VAR}", never literally. "approval" is ignored: only the user sets it.',
    ),
  replace: z
    .boolean()
    .optional()
    .describe('Set true to overwrite an existing server with the same name.'),
});

const removeInputSchema = z.object({
  scope: scopeSchema,
  name: z.string().describe('Name of the server to remove.'),
});

type SaveInput = z.infer<typeof saveInputSchema>;
type RemoveInput = z.infer<typeof removeInputSchema>;

export type McpSetupToolkitForChat = {
  tools: ToolSet;
  approvalPolicies: Record<string, ToolApprovalPolicy>;
};

/** Lets the agent list, add, update and remove the user's MCP servers. */
@Injectable()
export class McpSetupToolsService {
  constructor(
    private readonly catalog: McpServerCatalogService,
    private readonly serversService: McpServersService,
    private readonly edits: McpConfigEditsService,
  ) {}

  createToolkit(root: string): McpSetupToolkitForChat {
    return {
      tools: {
        [LIST_MCP_SERVERS_TOOL]: this.listTool(root),
        [SAVE_MCP_SERVER_TOOL]: this.saveTool(root),
        [REMOVE_MCP_SERVER_TOOL]: this.removeTool(root),
      },
      approvalPolicies: createMcpSetupApprovalPolicies(),
    };
  }

  private listTool(root: string) {
    return tool({
      description:
        'Lists the configured MCP servers (global and project) with status, tools and their mcp.json entry (secrets masked).',
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const catalog = await this.catalog.list(root);
          return toolSuccess(`${catalog.servers.length} server(s).`, catalog);
        } catch (error) {
          return formatToolError('list the MCP servers', error);
        }
      },
    });
  }

  private saveTool(root: string) {
    return tool({
      description:
        "Adds or updates an MCP server in Doty's mcp.json. The user approves every change; the server's tools are available from the next message.",
      inputSchema: saveInputSchema,
      execute: async ({
        scope = 'global',
        name,
        config,
        replace,
      }: SaveInput) => {
        try {
          const stored = await this.storedEntry(root, scope, name);
          if (stored !== undefined && !replace) {
            throw new Error(
              `A ${scope} MCP server "${name}" already exists. List it, then save again with replace: true, or pick another name.`,
            );
          }
          const entry = keepUserMcpApproval(config, stored);
          checkMcpServerRequest(name, entry);
          await this.edits.upsert(root, scope, name, entry, undefined);
          return toolSuccess(
            `${stored === undefined ? 'Added' : 'Updated'} the ${scope} MCP server "${name}". Its tools are available from the next message.`,
            { name, scope },
          );
        } catch (error) {
          return formatToolError(`save the MCP server "${name}"`, error);
        }
      },
    });
  }

  private removeTool(root: string) {
    return tool({
      description:
        "Removes an MCP server from Doty's mcp.json. The user approves it.",
      inputSchema: removeInputSchema,
      execute: async ({ scope = 'global', name }: RemoveInput) => {
        try {
          await this.edits.remove(root, scope, name, undefined);
          return toolSuccess(`Removed the ${scope} MCP server "${name}".`, {
            name,
            scope,
          });
        } catch (error) {
          return formatToolError(`remove the MCP server "${name}"`, error);
        }
      },
    });
  }

  private async storedEntry(
    root: string,
    scope: McpConfigSource,
    name: string,
  ): Promise<unknown> {
    const { raw } = await this.serversService.resolve(root);
    return raw[scope][name];
  }
}
