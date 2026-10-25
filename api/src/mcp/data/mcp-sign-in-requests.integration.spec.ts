import * as os from 'os';
import * as path from 'path';
import type { ToolExecutionOptions } from 'ai';
import type { UsableMcpServer } from '../domain/mcp-server.types';
import { McpClientPoolService } from './mcp-client-pool.service';
import { McpOAuthProviderFactory } from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';
import { McpSignInRequestsService } from './mcp-sign-in-requests.service';

// The real @ai-sdk/mcp client against a stdio fixture that asks for a login
// by printing a link and by a URL elicitation.

const FIXTURE = path.join(
  __dirname,
  '__fixtures__',
  'fake-sign-in-mcp-server.mjs',
);
const ROOT = os.tmpdir();

const server: UsableMcpServer = {
  name: 'example',
  source: 'global',
  config: { command: process.execPath, args: [FIXTURE] },
};

const options: ToolExecutionOptions<unknown> = {
  toolCallId: 'c1',
  messages: [],
  context: undefined,
};

async function waitFor<T>(read: () => T | undefined): Promise<T> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const value = read();
    if (value !== undefined) return value;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('timed out');
}

describe('MCP sign-in requests (stdio integration)', () => {
  let signIns: McpSignInRequestsService;
  let pool: McpClientPoolService;

  beforeEach(() => {
    signIns = new McpSignInRequestsService();
    pool = new McpClientPoolService(
      new McpOAuthProviderFactory(new McpOAuthRepository()),
      signIns,
    );
  });

  afterEach(() => pool.onModuleDestroy());

  const callLogin = async () => {
    const tools = await pool.getTools(ROOT, server);
    return tools!.login.execute!({}, options) as Promise<{
      content: { text: string }[];
    }>;
  };

  const request = (source: string) => () =>
    signIns.list(ROOT).find((item) => item.source === source);

  it('turns a printed login link into a request', async () => {
    await pool.getTools(ROOT, server);

    const printed = await waitFor(request('server-output'));
    expect(printed).toMatchObject({
      serverName: 'example',
      url: 'https://accounts.example.com/o/oauth2/auth?client_id=x',
    });
  });

  it('holds a URL elicitation until the user accepts it', async () => {
    const result = callLogin();
    const elicitation = await waitFor(request('elicitation'));
    expect(elicitation).toMatchObject({
      url: 'https://login.example.com/connect?session=abc',
      message: 'Connect your Example account',
    });

    expect(signIns.accept(elicitation.id)?.url).toBe(elicitation.url);
    expect((await result).content[0].text).toBe('elicitation: accept');
    expect(request('elicitation')()).toBeUndefined();
  });

  it('declines when the user dismisses it', async () => {
    const result = callLogin();
    const elicitation = await waitFor(request('elicitation'));

    signIns.dismiss(elicitation.id);
    expect((await result).content[0].text).toBe('elicitation: decline');
  });

  it("drops a server's requests when its client closes", async () => {
    await pool.getTools(ROOT, server);
    await waitFor(request('server-output'));

    await pool.disconnect(ROOT, 'example');
    expect(signIns.list(ROOT)).toEqual([]);
  });
});
