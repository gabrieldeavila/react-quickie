import { Injectable } from '@nestjs/common';
import { auth } from '@ai-sdk/mcp';
import { isUsableServer } from '../domain/mcp-server.types';
import { PendingOAuthFlows } from '../domain/pending-oauth-flows';
import { McpClientPoolService } from './mcp-client-pool.service';
import {
  isHttpServer,
  McpOAuthProviderFactory,
  type HttpMcpServer,
} from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';
import { McpServersService } from './mcp-servers.service';

/** Expected failures, shown to the user as they are. */
export class McpOAuthError extends Error {}

export type SignInStart =
  { status: 'redirect'; authorizationUrl: string } | { status: 'authorized' };

export type CallbackParams = {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
};

/**
 * Signing in to http/sse MCP servers with OAuth. The user starts it from the
 * dialog, finishes in the browser, and the provider redirects to the API's
 * callback; then the server reconnects with the new tokens.
 */
@Injectable()
export class McpOAuthService {
  private readonly flows = new PendingOAuthFlows();

  constructor(
    private readonly serversService: McpServersService,
    private readonly providers: McpOAuthProviderFactory,
    private readonly repository: McpOAuthRepository,
    private readonly pool: McpClientPoolService,
  ) {}

  /** Returns the URL to open, or `authorized` when a refresh was enough. */
  async start(root: string, name: string): Promise<SignInStart> {
    const server = await this.findServer(root, name);
    const provider = this.providers.create(root, server, {
      interactive: true,
    })!;
    const result = await auth(provider, {
      serverUrl: server.config.url,
      scope: server.config.oauth?.scope,
    });

    if (result === 'AUTHORIZED') {
      await this.reconnect(root, name);
      return { status: 'authorized' };
    }
    const key = this.providers.keyFor(root, server);
    const { state } = await this.repository.get(key);
    if (!provider.authorizationUrl || !state) {
      throw new McpOAuthError('The server did not start a sign-in.');
    }
    this.flows.add(state, { root, serverName: name, key }, Date.now());
    return {
      status: 'redirect',
      authorizationUrl: provider.authorizationUrl.toString(),
    };
  }

  /** Finishes the sign-in the browser came back from; returns the server name. */
  async complete(params: CallbackParams): Promise<string> {
    if (params.error) {
      throw new McpOAuthError(
        `The provider refused the sign-in: ${params.errorDescription ?? params.error}.`,
      );
    }
    const flow = params.state
      ? this.flows.take(params.state, Date.now())
      : undefined;
    if (!flow || !params.code) {
      throw new McpOAuthError('This sign-in link expired or was already used.');
    }

    const server = await this.findServer(flow.root, flow.serverName);
    if (this.providers.keyFor(flow.root, server) !== flow.key) {
      throw new McpOAuthError(
        'The server settings changed during the sign-in.',
      );
    }
    const provider = this.providers.create(flow.root, server, {
      interactive: true,
    })!;
    await auth(provider, {
      serverUrl: server.config.url,
      authorizationCode: params.code,
      callbackState: params.state,
    });
    await this.reconnect(flow.root, flow.serverName);
    return flow.serverName;
  }

  async signOut(root: string, name: string): Promise<void> {
    const server = await this.findServer(root, name);
    await this.providers.signOut(root, server);
    await this.pool.disconnect(root, name);
  }

  private async findServer(root: string, name: string): Promise<HttpMcpServer> {
    const { active } = await this.serversService.resolve(root);
    const server = active.find((candidate) => candidate.name === name);
    if (!server || !isUsableServer(server)) {
      throw new McpOAuthError(`MCP server "${name}" is not active.`);
    }
    if (!isHttpServer(server)) {
      throw new McpOAuthError(
        `MCP server "${name}" runs a command; only http/sse servers sign in.`,
      );
    }
    return server;
  }

  /** Drops the old client and connects in the background with the new tokens. */
  private async reconnect(root: string, name: string): Promise<void> {
    await this.pool.disconnect(root, name);
    const server = await this.findServer(root, name).catch(() => undefined);
    if (server) void this.pool.getTools(root, server);
  }
}
