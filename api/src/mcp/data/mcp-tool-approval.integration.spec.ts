import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { WorkspaceService } from 'src/workspace/data/workspace.service';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpConfigEditsService } from './mcp-config-edits.service';
import { McpConfigRepository } from './mcp-config.repository';
import { McpOAuthProviderFactory } from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';
import { McpServersService } from './mcp-servers.service';
import { McpSignInRequestsService } from './mcp-sign-in-requests.service';
import { McpToolApprovalService } from './mcp-tool-approval.service';
import { McpTrustRepository } from './mcp-trust.repository';

// "Always allow" from the approval card → `approval: never` in mcp.json,
// against the stdio fixture server and a temp DOTY_DATA_DIR.

const FIXTURE = path.join(__dirname, '__fixtures__', 'fake-mcp-server.mjs');

describe('McpToolApprovalService (stdio integration)', () => {
  let tmp: string;
  let root: string;
  let pool: McpClientPoolService;
  let service: McpToolApprovalService;
  const savedEnv = { ...process.env };
  const globalFile = () => path.join(tmp, 'data', 'mcp.json');
  const approval = () =>
    (
      JSON.parse(fs.readFileSync(globalFile(), 'utf8')) as {
        mcpServers: Record<string, { approval?: unknown }>;
      }
    ).mcpServers['fake.server'].approval;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-mcp-allow-'));
    root = path.join(tmp, 'project');
    fs.mkdirSync(root);
    process.env.DOTY_DATA_DIR = path.join(tmp, 'data');
    fs.mkdirSync(path.dirname(globalFile()), { recursive: true });
    // A dot in the server name: the exposed tool name is sanitized.
    fs.writeFileSync(
      globalFile(),
      JSON.stringify({
        mcpServers: {
          'fake.server': {
            command: process.execPath,
            args: [FIXTURE],
            approval: { big_output: 'never' },
          },
        },
      }),
    );

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
    pool = new McpClientPoolService(
      new McpOAuthProviderFactory(new McpOAuthRepository()),
      new McpSignInRequestsService(),
    );
    service = new McpToolApprovalService(
      serversService,
      pool,
      new McpConfigEditsService(
        configRepository,
        trustRepository,
        serversService,
        pool,
      ),
    );
  });

  afterEach(async () => {
    await pool.onModuleDestroy();
    process.env = { ...savedEnv };
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('allows one tool by its exposed name, keeping the others', async () => {
    await service.alwaysAllow(root, 'mcp__fake_server__echo', false);

    expect(approval()).toEqual({ big_output: 'never', echo: 'never' });
  });

  it('allows every tool of the server', async () => {
    await service.alwaysAllow(root, 'mcp__fake_server__echo', true);

    expect(approval()).toBe('never');
  });

  it('refuses an unknown tool', async () => {
    await expect(
      service.alwaysAllow(root, 'mcp__fake_server__nope', false),
    ).rejects.toThrow(/not found/);
  });
});
