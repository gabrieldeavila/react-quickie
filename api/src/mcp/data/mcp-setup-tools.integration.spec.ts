import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ToolExecutionOptions } from 'ai';
import type { WorkspaceService } from 'src/workspace/data/workspace.service';
import type { McpClientPoolService } from './mcp-client-pool.service';
import { McpConfigEditsService } from './mcp-config-edits.service';
import { McpConfigRepository } from './mcp-config.repository';
import { McpServerCatalogService } from './mcp-server-catalog.service';
import { McpServersService } from './mcp-servers.service';
import { McpSetupToolsService } from './mcp-setup-tools.service';
import { McpTrustRepository } from './mcp-trust.repository';

// Real files in temp dirs; only the client pool (process spawning) is faked.

const options: ToolExecutionOptions<unknown> = {
  toolCallId: 'call',
  messages: [],
  context: undefined,
};

type Result = { success: boolean; message: string; data?: unknown };

describe('McpSetupToolsService (temp dirs)', () => {
  const savedEnv = { ...process.env };
  let tmp: string;
  let root: string;
  let service: McpSetupToolsService;

  const globalFile = () => path.join(tmp, 'data', 'mcp.json');
  const readServers = () =>
    (
      JSON.parse(fs.readFileSync(globalFile(), 'utf8')) as {
        mcpServers: Record<string, Record<string, unknown>>;
      }
    ).mcpServers;

  const run = (toolName: string, input: Record<string, unknown>) =>
    service.createToolkit(root).tools[toolName].execute!(
      input,
      options,
    ) as Promise<Result>;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-mcp-setup-'));
    root = path.join(tmp, 'project');
    fs.mkdirSync(root);
    process.env.DOTY_DATA_DIR = path.join(tmp, 'data');

    const workspace = {
      resolveIn: (base: string, relative: string) =>
        path.resolve(base, relative),
    } as unknown as WorkspaceService;
    const configRepository = new McpConfigRepository(workspace);
    const trustRepository = new McpTrustRepository();
    const serversService = new McpServersService(
      configRepository,
      trustRepository,
    );
    const pool = {
      disconnect: jest.fn(() => Promise.resolve()),
      getTools: jest.fn(() => Promise.resolve({})),
      snapshot: jest.fn(() => undefined),
    } as unknown as McpClientPoolService;
    service = new McpSetupToolsService(
      new McpServerCatalogService(serversService, pool),
      serversService,
      new McpConfigEditsService(
        configRepository,
        trustRepository,
        serversService,
        pool,
      ),
    );
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('adds a global server without the approval the agent asked for', async () => {
    const result = await run('save_mcp_server', {
      name: 'github',
      config: { command: 'npx', args: ['-y', 'gh-mcp'], approval: 'never' },
    });

    expect(result).toMatchObject({ success: true });
    expect(readServers().github).toEqual({
      command: 'npx',
      args: ['-y', 'gh-mcp'],
    });
  });

  it("refuses to overwrite unless replace is set, and keeps the user's approval", async () => {
    fs.mkdirSync(path.dirname(globalFile()), { recursive: true });
    fs.writeFileSync(
      globalFile(),
      JSON.stringify({
        mcpServers: { db: { command: 'v1', approval: 'never' } },
      }),
    );

    const refused = await run('save_mcp_server', {
      name: 'db',
      config: { command: 'v2' },
    });
    expect(refused).toMatchObject({ success: false });
    expect(readServers().db.command).toBe('v1');

    await run('save_mcp_server', {
      name: 'db',
      config: { command: 'v2', approval: 'ask' },
      replace: true,
    });
    expect(readServers().db).toEqual({ command: 'v2', approval: 'never' });
  });

  it('lists and removes servers', async () => {
    await run('save_mcp_server', {
      name: 'web',
      config: { type: 'http', url: 'https://x.dev/mcp' },
    });

    const list = (await run('list_mcp_servers', {})) as {
      data: { servers: { name: string }[] };
    };
    expect(list.data.servers.map(({ name }) => name)).toEqual(['web']);

    expect(await run('remove_mcp_server', { name: 'web' })).toMatchObject({
      success: true,
    });
    expect(readServers()).toEqual({});
  });
});
