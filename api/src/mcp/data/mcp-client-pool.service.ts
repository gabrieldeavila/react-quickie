import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  createMCPClient,
  type MCPClient,
  type MCPTransport,
} from '@ai-sdk/mcp';
import type { Tool } from 'ai';
import { hashConfig } from '../domain/hash-config';
import { isUnauthorizedError } from '../domain/is-unauthorized-error';
import type { UsableMcpServer } from '../domain/mcp-server.types';
import { createMcpTransport } from './create-mcp-transport';
import { McpOAuthProviderFactory } from './mcp-oauth-provider.factory';
import { readPoolSettings } from './read-pool-settings';
import { withTimeout } from './with-timeout';

type PoolStatus = 'connecting' | 'connected' | 'needs-auth' | 'error';

type PoolEntry = {
  hash: string;
  status: PoolStatus;
  ready: Promise<void>;
  client?: MCPClient;
  tools?: Record<string, Tool>;
  error?: string;
  failedAt?: number;
  lastUsedAt: number;
};

export type PoolSnapshot = {
  status: PoolStatus;
  toolCount?: number;
  /** The server's own tool names (not namespaced), once connected. */
  toolNames?: string[];
  error?: string;
};

const SWEEP_INTERVAL_MS = 60_000;

const NEEDS_AUTH_MESSAGE = 'Sign in to use this server.';

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isTransport(value: unknown): value is MCPTransport {
  return typeof (value as MCPTransport)?.start === 'function';
}

/**
 * One connected client per (root, server, server config hash). Clients
 * connect lazily on the first chat request that needs them, reconnect when
 * that server's config changes, and close after being idle.
 */
@Injectable()
export class McpClientPoolService implements OnModuleDestroy {
  private readonly logger = new Logger(McpClientPoolService.name);
  private readonly entries = new Map<string, PoolEntry>();
  private readonly settings = readPoolSettings(process.env);
  private readonly sweeper = setInterval(
    () => void this.closeIdle(),
    SWEEP_INTERVAL_MS,
  ).unref();

  constructor(private readonly oauthProviders: McpOAuthProviderFactory) {}

  /** The server's tools, or null when it can't connect (the chat goes on without them). */
  async getTools(
    root: string,
    server: UsableMcpServer,
  ): Promise<Record<string, Tool> | null> {
    const key = this.key(root, server.name);
    const hash = this.hash(server);
    let entry = this.entries.get(key);

    if (entry && (entry.hash !== hash || this.canRetry(entry))) {
      await this.close(key, entry);
      entry = undefined;
    }
    entry ??= this.connect(key, hash, root, server);

    await entry.ready;
    entry.lastUsedAt = Date.now();
    return entry.status === 'connected' ? (entry.tools ?? null) : null;
  }

  /** Connection state, only if the live client was built from this exact config. */
  snapshot(root: string, server: UsableMcpServer): PoolSnapshot | undefined {
    const entry = this.entries.get(this.key(root, server.name));
    if (!entry || entry.hash !== this.hash(server)) return undefined;
    return {
      status: entry.status,
      toolCount: entry.tools ? Object.keys(entry.tools).length : undefined,
      toolNames: entry.tools ? Object.keys(entry.tools).sort() : undefined,
      error: entry.error,
    };
  }

  /** Drops the client so the next `getTools` connects again. */
  async disconnect(root: string, name: string): Promise<void> {
    const key = this.key(root, name);
    const entry = this.entries.get(key);
    if (entry) await this.close(key, entry);
  }

  async onModuleDestroy() {
    clearInterval(this.sweeper);
    await Promise.all(
      [...this.entries].map(([key, entry]) => this.close(key, entry)),
    );
  }

  private hash(server: UsableMcpServer): string {
    return hashConfig({ source: server.source, config: server.config });
  }

  private key(root: string, name: string): string {
    return `${root}\u0000${name}`;
  }

  private canRetry(entry: PoolEntry): boolean {
    return (
      entry.status === 'error' &&
      Date.now() - (entry.failedAt ?? 0) > this.settings.retryAfterMs
    );
  }

  private connect(
    key: string,
    hash: string,
    root: string,
    server: UsableMcpServer,
  ): PoolEntry {
    const entry: PoolEntry = {
      hash,
      status: 'connecting',
      lastUsedAt: Date.now(),
      ready: Promise.resolve(),
    };
    const fail = (error: unknown) => {
      // Ignores clients this pool already closed or replaced.
      if (this.entries.get(key) !== entry) return;
      // Not retried on its own: signing in from the dialog reconnects it.
      if (isUnauthorizedError(error)) {
        entry.status = 'needs-auth';
        entry.error = NEEDS_AUTH_MESSAGE;
        return;
      }
      entry.status = 'error';
      entry.error = describeError(error);
      entry.failedAt = Date.now();
      this.logger.warn(`MCP "${server.name}" (${root}): ${entry.error}`);
    };

    entry.ready = this.open(root, server, fail).then(({ client, tools }) => {
      if (this.entries.get(key) !== entry) {
        void client.close().catch(() => undefined);
        return;
      }
      Object.assign(entry, { status: 'connected', client, tools });
    }, fail);

    this.entries.set(key, entry);
    return entry;
  }

  private async open(
    root: string,
    server: UsableMcpServer,
    onLost: (error: unknown) => void,
  ) {
    const transport = createMcpTransport(
      server.config,
      root,
      this.oauthProviders.create(root, server, { interactive: false }),
    );
    const opening = (async () => {
      const client = await createMCPClient({
        transport,
        clientName: 'doty',
        // Not fatal on its own (e.g. a malformed notification); a dead
        // process is caught by `watchClose`.
        // A 401 is reported here too; the needs-auth status covers it.
        onUncaughtError: (error) => {
          if (isUnauthorizedError(error)) return;
          this.logger.warn(`MCP "${server.name}": ${describeError(error)}`);
        },
      });
      if (isTransport(transport)) this.watchClose(transport, onLost);
      try {
        return { client, tools: await client.tools() };
      } catch (error) {
        await client.close().catch(() => undefined);
        throw error;
      }
    })();

    return withTimeout(opening, this.settings.connectTimeoutMs, () => {
      // Kills a stdio process that never finished the handshake.
      if (isTransport(transport)) void transport.close().catch(() => undefined);
      void opening.then(({ client }) => client.close()).catch(() => undefined);
    });
  }

  /** A stdio process that exits marks the server as failed, so it reconnects later. */
  private watchClose(
    transport: MCPTransport,
    onLost: (error: unknown) => void,
  ) {
    const clientOnClose = transport.onclose;
    transport.onclose = () => {
      clientOnClose?.();
      onLost(new Error('The MCP server process exited.'));
    };
  }

  private async close(key: string, entry: PoolEntry): Promise<void> {
    if (this.entries.get(key) === entry) this.entries.delete(key);
    await entry.client?.close().catch(() => undefined);
  }

  private async closeIdle() {
    const cutoff = Date.now() - this.settings.idleTimeoutMs;
    await Promise.all(
      [...this.entries]
        .filter(([, entry]) => entry.status !== 'connecting')
        .filter(([, entry]) => entry.lastUsedAt < cutoff)
        .map(([key, entry]) => this.close(key, entry)),
    );
  }
}
