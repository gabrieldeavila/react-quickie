import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { auth } from '@ai-sdk/mcp';
import { isUsableServer } from '../domain/mcp-server.types';
import {
  OAUTH_FLOW_TTL_MS,
  PendingOAuthFlows,
} from '../domain/pending-oauth-flows';
import { renderOAuthCallbackPage } from '../domain/render-oauth-callback-page';
import { resolveCallbackListenerPort } from '../domain/resolve-oauth-callback-url';
import { McpClientPoolService } from './mcp-client-pool.service';
import {
  isHttpServer,
  McpOAuthProviderFactory,
  type HttpMcpServer,
} from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';
import { McpServersService } from './mcp-servers.service';
import { OAuthCallbackListener } from './oauth-callback-listener';

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
export class McpOAuthService implements OnModuleDestroy {
  private readonly logger = new Logger(McpOAuthService.name);
  private readonly flows = new PendingOAuthFlows();

  constructor(
    private readonly serversService: McpServersService,
    private readonly providers: McpOAuthProviderFactory,
    private readonly repository: McpOAuthRepository,
    private readonly pool: McpClientPoolService,
    private readonly listener: OAuthCallbackListener,
  ) {}

  onModuleDestroy(): Promise<void> {
    return this.listener.close();
  }

  /** Returns the URL to open, or `authorized` when a refresh was enough. */
  async start(root: string, name: string): Promise<SignInStart> {
    const server = await this.findServer(root, name);
    await this.openListener();
    const provider = this.providers.create(root, server, {
      interactive: true,
    })!;
    const result = await auth(provider, {
      serverUrl: server.config.url,
      scope: server.config.oauth?.scope,
    });

    if (result === 'AUTHORIZED') {
      await this.closeListenerIfIdle();
      await this.reconnect(root, name);
      return { status: 'authorized' };
    }
    const key = this.providers.keyFor(root, server);
    const { state } = await this.repository.get(key);
    if (!provider.authorizationUrl || !state) {
      throw new McpOAuthError('The server did not start a sign-in.');
    }
    this.flows.add(state, { root, serverName: name, key }, Date.now());
    // Closes the listener once this sign-in can no longer come back.
    setTimeout(
      () => void this.closeListenerIfIdle(),
      OAUTH_FLOW_TTL_MS + 1000,
    ).unref();
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

  /** The page the browser lands on; never throws (the error is the page). */
  async handleCallback(params: CallbackParams): Promise<string> {
    try {
      const serverName = await this.complete(params);
      return renderOAuthCallbackPage({ ok: true, serverName });
    } catch (error) {
      if (!(error instanceof McpOAuthError)) {
        this.logger.warn(`MCP OAuth callback: ${String(error)}`);
      }
      const message =
        error instanceof McpOAuthError
          ? error.message
          : 'Doty could not finish the sign-in.';
      return renderOAuthCallbackPage({ ok: false, message });
    } finally {
      // After the page is sent: the listener may be serving this request.
      setTimeout(() => void this.closeListenerIfIdle(), 1000).unref();
    }
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

  /** Starts the fixed-port callback listener when this setup uses one. */
  private async openListener(): Promise<void> {
    const port = resolveCallbackListenerPort(process.env);
    if (port === undefined) return;
    try {
      await this.listener.open(port, (query) =>
        this.handleCallback({
          code: query.get('code') ?? undefined,
          state: query.get('state') ?? undefined,
          error: query.get('error') ?? undefined,
          errorDescription: query.get('error_description') ?? undefined,
        }),
      );
    } catch {
      throw new McpOAuthError(
        `Port ${port} for the sign-in callback is in use. Change it (VS Code setting doty.mcp.oauthCallbackPort, or DOTY_OAUTH_CALLBACK_PORT).`,
      );
    }
  }

  private async closeListenerIfIdle(): Promise<void> {
    if (this.flows.isEmpty(Date.now())) await this.listener.close();
  }

  /** Drops the old client and connects in the background with the new tokens. */
  private async reconnect(root: string, name: string): Promise<void> {
    await this.pool.disconnect(root, name);
    const server = await this.findServer(root, name).catch(() => undefined);
    if (server) void this.pool.getTools(root, server);
  }
}
