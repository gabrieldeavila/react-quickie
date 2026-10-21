import { Injectable } from '@nestjs/common';
import {
  isStdioServer,
  type McpHttpServerConfig,
} from '../domain/mcp-config.schema';
import { mcpOAuthKey } from '../domain/mcp-oauth-key';
import type { UsableMcpServer } from '../domain/mcp-server.types';
import { resolveOAuthCallbackUrl } from '../domain/resolve-oauth-callback-url';
import { McpOAuthProvider } from './mcp-oauth-provider';
import { McpOAuthRepository } from './mcp-oauth.repository';

export type HttpMcpServer = UsableMcpServer & { config: McpHttpServerConfig };

export function isHttpServer(server: UsableMcpServer): server is HttpMcpServer {
  return !isStdioServer(server.config);
}

/** Builds the OAuth provider for an http/sse server (stdio servers have none). */
@Injectable()
export class McpOAuthProviderFactory {
  constructor(private readonly repository: McpOAuthRepository) {}

  keyFor(root: string, server: HttpMcpServer): string {
    return mcpOAuthKey({
      root,
      source: server.source,
      name: server.name,
      url: server.config.url,
    });
  }

  create(
    root: string,
    server: UsableMcpServer,
    { interactive }: { interactive: boolean },
  ): McpOAuthProvider | undefined {
    if (!isHttpServer(server)) return undefined;
    return new McpOAuthProvider(
      this.repository,
      this.keyFor(root, server),
      server.config.oauth,
      resolveOAuthCallbackUrl(process.env),
      interactive,
    );
  }

  async isSignedIn(root: string, server: HttpMcpServer): Promise<boolean> {
    const record = await this.repository.get(this.keyFor(root, server));
    return !!record.tokens;
  }

  signOut(root: string, server: HttpMcpServer): Promise<void> {
    return this.repository.remove(this.keyFor(root, server));
  }
}
