import * as os from 'os';
import * as path from 'path';
import { isStepCount, streamText } from 'ai';
import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';
import { buildToolApprovalMap } from 'src/chat/domain/approval-policy';
import { McpClientPoolService } from './mcp-client-pool.service';
import type { McpServersService } from './mcp-servers.service';
import { McpToolsService } from './mcp-tools.service';
import { McpSignInRequestsService } from './mcp-sign-in-requests.service';
import { McpOAuthProviderFactory } from './mcp-oauth-provider.factory';
import { McpOAuthRepository } from './mcp-oauth.repository';

// MCP tools are dynamic tools: checks that the name-keyed `toolApproval`
// map from Phase 1 applies to them inside the real streamText loop.

const FIXTURE = path.join(__dirname, '__fixtures__', 'fake-mcp-server.mjs');
const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};

const callTool = (toolName: string, input: object) =>
  new MockLanguageModelV4({
    doStream: [
      {
        stream: simulateReadableStream({
          chunks: [
            {
              type: 'tool-call',
              toolCallId: 'call-1',
              toolName,
              input: JSON.stringify(input),
            },
            {
              type: 'finish',
              finishReason: { unified: 'tool-calls', raw: undefined },
              usage,
            },
          ],
        }),
      },
    ] as never,
  });

describe('MCP tools + native approval', () => {
  const pool = new McpClientPoolService(
    new McpOAuthProviderFactory(new McpOAuthRepository()),
    new McpSignInRequestsService(),
  );
  const service = new McpToolsService(
    {
      resolve: () =>
        Promise.resolve({
          active: [
            {
              name: 'fake',
              source: 'global',
              config: {
                command: process.execPath,
                args: [FIXTURE],
                approval: { echo: 'never' },
              },
            },
          ],
          untrusted: [],
        }),
    } as unknown as McpServersService,
    pool,
    new McpSignInRequestsService(),
  );

  afterAll(() => pool.onModuleDestroy());

  async function run(toolName: string, input: object) {
    const { tools, approvalPolicies } = await service.getToolkit(os.tmpdir());
    const result = streamText({
      model: callTool(toolName, input),
      prompt: 'go',
      tools,
      toolApproval: buildToolApprovalMap(approvalPolicies),
      stopWhen: isStepCount(1),
    });
    const types: string[] = [];
    for await (const chunk of result.fullStream) types.push(chunk.type);
    return types;
  }

  it('stops at an approval request for an `ask` tool', async () => {
    const types = await run('mcp__fake__big_output', { size: 5 });
    expect(types).toContain('tool-approval-request');
    expect(types).not.toContain('tool-result');
  });

  it('runs a `never` tool without asking', async () => {
    const types = await run('mcp__fake__echo', { text: 'hi' });
    expect(types).not.toContain('tool-approval-request');
    expect(types).toContain('tool-result');
  });
});
