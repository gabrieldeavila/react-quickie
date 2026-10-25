import { Injectable } from '@nestjs/common';
import type { ConnectionCheck } from '../domain/describe-connection-check';
import { isUsableServer } from '../domain/mcp-server.types';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpServersService } from './mcp-servers.service';
import { McpSignInRequestsService } from './mcp-sign-in-requests.service';

/** Connects a server now (within the pool's timeout) and says how it went. */
@Injectable()
export class McpConnectionCheckService {
  constructor(
    private readonly serversService: McpServersService,
    private readonly pool: McpClientPoolService,
    private readonly signIns: McpSignInRequestsService,
  ) {}

  async check(root: string, name: string): Promise<ConnectionCheck> {
    const { active, untrusted } = await this.serversService.resolve(root);
    if (untrusted.some((server) => server.name === name)) {
      return {
        status: 'inactive',
        reason: "the project's MCP config is waiting for the user to trust it",
      };
    }
    const server = active.find((candidate) => candidate.name === name);
    if (!server) return { status: 'inactive', reason: 'it is not configured' };
    if (server.disabled)
      return { status: 'inactive', reason: 'it is disabled' };
    if (!isUsableServer(server))
      return { status: 'error', error: server.error ?? 'invalid config' };

    const tools = await this.pool.getTools(root, server);
    const snapshot = this.pool.snapshot(root, server);
    if (snapshot?.status === 'needs-auth' || this.signIns.has(root, name)) {
      return { status: 'needs-sign-in' };
    }
    if (tools)
      return { status: 'connected', toolCount: Object.keys(tools).length };
    return { status: 'error', error: snapshot?.error ?? 'unknown error' };
  }
}
