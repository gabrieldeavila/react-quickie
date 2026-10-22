import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { WorkspaceService } from 'src/workspace/data/workspace.service';
import {
  isUsableServer,
  type UsableMcpServer,
} from '../domain/mcp-server.types';
import {
  FAKE_CODE,
  startFakeOAuthMcpServer,
  type FakeOAuthMcpServer,
} from './__fixtures__/fake-oauth-mcp-server';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpConfigRepository } from './mcp-config.repository';
import { McpOAuthProviderFactory } from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';
import { McpOAuthError, McpOAuthService } from './mcp-oauth.service';
import { McpServersService } from './mcp-servers.service';
import { McpTrustRepository } from './mcp-trust.repository';
import { McpSignInRequestsService } from './mcp-sign-in-requests.service';

// The whole sign-in against a local fake: 401 → needs-auth → start →
// browser callback → tokens → connected. Only the browser is simulated.

describe('MCP OAuth sign-in (fake server, temp dirs)', () => {
  const savedEnv = { ...process.env };
  let tmp: string;
  let root: string;
  let fake: FakeOAuthMcpServer;
  let servers: McpServersService;
  let pool: McpClientPoolService;
  let oauth: McpOAuthService;

  const httpServer = async (): Promise<UsableMcpServer> => {
    const { active } = await servers.resolve(root);
    const server = active.find((item) => item.name === 'fake');
    if (!server || !isUsableServer(server)) {
      throw new Error('fixture server should be usable');
    }
    return server;
  };

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-mcp-oauth-'));
    root = path.join(tmp, 'project');
    fs.mkdirSync(root);
    process.env.DOTY_DATA_DIR = path.join(tmp, 'data');
    process.env.PORT = '45678';
    fake = await startFakeOAuthMcpServer();

    fs.mkdirSync(process.env.DOTY_DATA_DIR);
    fs.writeFileSync(
      path.join(process.env.DOTY_DATA_DIR, 'mcp.json'),
      JSON.stringify({
        mcpServers: { fake: { type: 'http', url: fake.mcpUrl } },
      }),
    );

    const workspace = {
      resolveIn: (base: string, relative: string) =>
        path.resolve(base, relative),
    } as unknown as WorkspaceService;
    const repository = new McpOAuthRepository();
    const providers = new McpOAuthProviderFactory(repository);
    servers = new McpServersService(
      new McpConfigRepository(workspace),
      new McpTrustRepository(),
    );
    pool = new McpClientPoolService(providers, new McpSignInRequestsService());
    oauth = new McpOAuthService(servers, providers, repository, pool);
  });

  afterEach(async () => {
    await pool.onModuleDestroy();
    await fake.close();
    process.env = { ...savedEnv };
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('asks for sign-in, then connects with the tokens from the callback', async () => {
    const server = await httpServer();

    // Background connection: no tokens → needs-auth, no sign-in started.
    expect(await pool.getTools(root, server)).toBeNull();
    expect(pool.snapshot(root, server)?.status).toBe('needs-auth');

    const started = await oauth.start(root, 'fake');
    if (started.status !== 'redirect') throw new Error('expected a redirect');
    const authorizationUrl = new URL(started.authorizationUrl);
    expect(authorizationUrl.origin + authorizationUrl.pathname).toBe(
      `${fake.url}/authorize`,
    );
    expect(authorizationUrl.searchParams.get('client_id')).toBe('client-1');
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(
      'http://127.0.0.1:45678/mcp/oauth/callback',
    );
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();
    const state = authorizationUrl.searchParams.get('state')!;

    // The browser comes back to the callback.
    expect(await oauth.complete({ code: FAKE_CODE, state })).toBe('fake');
    expect(fake.lastCodeVerifier).toBeTruthy();

    const tools = await pool.getTools(root, server);
    expect(Object.keys(tools ?? {})).toEqual(['echo']);
    expect(pool.snapshot(root, server)?.status).toBe('connected');
  });

  it('refuses a replayed, unknown or refused callback', async () => {
    const started = await oauth.start(root, 'fake');
    if (started.status !== 'redirect') throw new Error('expected a redirect');
    const state = new URL(started.authorizationUrl).searchParams.get('state')!;

    await oauth.complete({ code: FAKE_CODE, state });
    await expect(oauth.complete({ code: FAKE_CODE, state })).rejects.toThrow(
      /expired or was already used/,
    );
    await expect(
      oauth.complete({ code: FAKE_CODE, state: 'forged' }),
    ).rejects.toBeInstanceOf(McpOAuthError);
    await expect(
      oauth.complete({ error: 'access_denied', state }),
    ).rejects.toThrow(/refused the sign-in: access_denied/);
  });

  it('signs out by forgetting the tokens', async () => {
    const started = await oauth.start(root, 'fake');
    if (started.status !== 'redirect') throw new Error('expected a redirect');
    const state = new URL(started.authorizationUrl).searchParams.get('state')!;
    await oauth.complete({ code: FAKE_CODE, state });

    await oauth.signOut(root, 'fake');

    const server = await httpServer();
    expect(await pool.getTools(root, server)).toBeNull();
    expect(pool.snapshot(root, server)?.status).toBe('needs-auth');
  });

  it('only signs in http servers', async () => {
    fs.writeFileSync(
      path.join(process.env.DOTY_DATA_DIR!, 'mcp.json'),
      JSON.stringify({ mcpServers: { local: { command: 'node' } } }),
    );
    await expect(oauth.start(root, 'local')).rejects.toThrow(/runs a command/);
  });
});
