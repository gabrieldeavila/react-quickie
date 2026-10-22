import * as os from 'os';
import * as path from 'path';
import type { McpStdioServerConfig } from '../domain/mcp-config.schema';
import type { UsableMcpServer } from '../domain/mcp-server.types';
import { McpClientPoolService } from './mcp-client-pool.service';
import type { McpServersService } from './mcp-servers.service';
import { McpToolsService } from './mcp-tools.service';
import { McpSignInRequestsService } from './mcp-sign-in-requests.service';
import { McpOAuthProviderFactory } from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';

// Runs the real @ai-sdk/mcp client against a stdio fixture server.

const FIXTURE = path.join(__dirname, '__fixtures__', 'fake-mcp-server.mjs');
const ROOT = os.tmpdir();
const TIMEOUT_MS = 800;

const stdio = (
  name: string,
  extra: Partial<McpStdioServerConfig> = {},
  args: string[] = [],
): UsableMcpServer => ({
  name,
  source: 'global',
  config: { command: process.execPath, args: [FIXTURE, ...args], ...extra },
});

const fakeServers = (servers: UsableMcpServer[]) =>
  ({
    resolve: () => Promise.resolve({ active: servers, untrusted: [] }),
  }) as unknown as McpServersService;

const callOptions = { toolCallId: 'c1', messages: [] } as never;

describe('McpToolsService (stdio integration)', () => {
  let pool: McpClientPoolService;

  beforeEach(() => {
    process.env.DOTY_MCP_CONNECT_TIMEOUT_MS = String(TIMEOUT_MS);
    pool = new McpClientPoolService(
      new McpOAuthProviderFactory(new McpOAuthRepository()),
      new McpSignInRequestsService(),
    );
  });

  afterEach(async () => {
    await pool.onModuleDestroy();
    delete process.env.DOTY_MCP_CONNECT_TIMEOUT_MS;
  });

  it('exposes namespaced, filtered tools with their approval policies', async () => {
    const service = new McpToolsService(
      fakeServers([
        stdio('fake', { approval: { echo: 'never' }, disabledTools: [] }),
      ]),
      pool,
      new McpSignInRequestsService(),
    );

    const { tools, approvalPolicies } = await service.getToolkit(ROOT);

    expect(Object.keys(tools).sort()).toEqual([
      'mcp__fake__big_output',
      'mcp__fake__echo',
    ]);
    expect(approvalPolicies.mcp__fake__echo({})).toEqual({ decision: 'never' });
    expect(approvalPolicies.mcp__fake__big_output({})).toEqual({
      decision: 'ask',
    });

    const result = await tools.mcp__fake__echo.execute!(
      { text: 'hello' },
      callOptions,
    );
    expect(result).toMatchObject({
      content: [{ type: 'text', text: 'hello' }],
    });
  });

  it('caps large results for the current turn', async () => {
    const service = new McpToolsService(
      fakeServers([stdio('fake')]),
      pool,
      new McpSignInRequestsService(),
    );
    const { tools } = await service.getToolkit(ROOT);

    const result = (await tools.mcp__fake__big_output.execute!(
      { size: 60_000 },
      callOptions,
    )) as { truncated?: boolean; originalSize?: number };

    expect(result.truncated).toBe(true);
    expect(result.originalSize).toBe(60_000);
  });

  it('reuses the connected client across requests', async () => {
    const server = stdio('fake');
    const first = await pool.getTools(ROOT, server);
    const second = await pool.getTools(ROOT, server);
    expect(second).toBe(first);
    expect(pool.snapshot(ROOT, server)).toEqual({
      status: 'connected',
      toolCount: 2,
      toolNames: ['big.output', 'echo'],
      error: undefined,
    });
  });

  it('connects in parallel: two hanging servers cost one timeout, and the rest still load', async () => {
    const service = new McpToolsService(
      fakeServers([
        stdio('slow1', {}, ['hang']),
        stdio('slow2', {}, ['hang']),
        stdio('ok'),
      ]),
      pool,
      new McpSignInRequestsService(),
    );

    const startedAt = Date.now();
    const { tools } = await service.getToolkit(ROOT);
    const elapsed = Date.now() - startedAt;

    expect(Object.keys(tools)).toContain('mcp__ok__echo');
    expect(elapsed).toBeLessThan(TIMEOUT_MS * 2);
    const slow = pool.snapshot(ROOT, stdio('slow1', {}, ['hang']));
    expect(slow?.status).toBe('error');
    expect(slow?.error).toContain('did not respond');
  });

  it('marks a server whose command does not exist as an error', async () => {
    const missing: UsableMcpServer = {
      name: 'missing',
      source: 'global',
      config: { command: 'definitely-not-a-real-mcp-binary' },
    };
    expect(await pool.getTools(ROOT, missing)).toBeNull();
    expect(pool.snapshot(ROOT, missing)?.status).toBe('error');
  });

  it('does not report a client built from an older config of the same server', async () => {
    await pool.getTools(ROOT, stdio('fake'));
    expect(
      pool.snapshot(ROOT, stdio('fake', { disabledTools: ['echo'] })),
    ).toBeUndefined();
  });
});
