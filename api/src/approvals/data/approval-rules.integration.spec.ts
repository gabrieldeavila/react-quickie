import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { readUIMessageStream, streamText, tool, type UIMessage } from 'ai';
import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';
import { z } from 'zod/v4';
import { buildToolApprovalMap } from 'src/chat/domain/approval-policy';
import { createBashApprovalPolicy } from 'src/common/agents/tools/bash/domain/bash-approval-policy';
import { assessCommand } from 'src/common/agents/tools/bash/domain/command-policy';
import { applyApprovalRules } from '../domain/apply-approval-rules';
import {
  APPROVAL_RULES_FILE,
  ApprovalRulesRepository,
} from './approval-rules.repository';

// Repository on a temp DOTY_DATA_DIR → applyApprovalRules → the real
// streamText({ toolApproval }) loop (same pattern as tool-approval-flow.spec).

const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};

const toolCallStream = (command: string) => ({
  stream: simulateReadableStream({
    chunks: [
      {
        type: 'tool-call',
        toolCallId: 'call-1',
        toolName: 'run_bash_command',
        input: JSON.stringify({ command }),
      },
      {
        type: 'finish',
        finishReason: { unified: 'tool-calls', raw: undefined },
        usage,
      },
    ],
  }),
});

describe('ApprovalRulesRepository (temp data dir)', () => {
  let tmp: string;
  let root: string;
  let repository: ApprovalRulesRepository;
  const savedEnv = { ...process.env };
  const rulesFile = () => path.join(tmp, 'data', APPROVAL_RULES_FILE);

  beforeEach(() => {
    tmp = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), 'doty-approvals-')),
    );
    root = path.join(tmp, 'project');
    fs.mkdirSync(root);
    process.env.DOTY_DATA_DIR = path.join(tmp, 'data');
    repository = new ApprovalRulesRepository();
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  async function runCommand(command: string) {
    const execute = jest.fn(() => Promise.resolve('ran'));
    const { rules } = await repository.read();
    const toolApproval = buildToolApprovalMap(
      applyApprovalRules(
        {
          run_bash_command: createBashApprovalPolicy((input) =>
            assessCommand(input, root),
          ),
        },
        rules,
        repository.projectKey(root),
      ),
    );
    const result = streamText({
      model: new MockLanguageModelV4({
        doStream: [toolCallStream(command)] as never,
      }),
      messages: [{ role: 'user', content: 'go' }],
      tools: {
        run_bash_command: tool({
          inputSchema: z.object({ command: z.string() }),
          execute,
        }),
      },
      toolApproval,
      experimental_toolApprovalSecret: 'secret',
    });
    let last: UIMessage | undefined;
    for await (const message of readUIMessageStream({
      stream: result.toUIMessageStream() as never,
    })) {
      last = message;
    }
    const part = last?.parts.find((p) => p.type.startsWith('tool-')) as
      { state: string } | undefined;
    return { state: part?.state, execute };
  }

  it('skips the approval for a command the user allowed in this project', async () => {
    await repository.add({
      scope: 'project',
      root,
      tool: 'run_bash_command',
      command: 'rm -rf dist',
    });

    const allowed = await runCommand('rm  -rf dist');
    expect(allowed.state).toBe('output-available');
    expect(allowed.execute).toHaveBeenCalledTimes(1);

    const other = await runCommand('rm -rf dist; rm -rf src');
    expect(other.state).toBe('approval-requested');
    expect(other.execute).not.toHaveBeenCalled();
  });

  it('never relaxes a blocked command', async () => {
    await repository.add({
      scope: 'global',
      tool: 'run_bash_command',
      command: 'sudo reboot',
    });

    const { state, execute } = await runCommand('sudo reboot');

    expect(state).toBe('approval-responded');
    expect(execute).not.toHaveBeenCalled();
  });

  it('writes an owner-only file and keys projects by their real path', async () => {
    const link = path.join(tmp, 'link');
    fs.symlinkSync(root, link);

    await repository.add({
      scope: 'project',
      root: link,
      tool: 'create_commit',
    });

    expect(fs.statSync(rulesFile()).mode & 0o777).toBe(0o600);
    const { rules } = await repository.read();
    expect(Object.keys(rules.projects)).toEqual([root]);
  });

  it('removes a rule', async () => {
    const target = { scope: 'global' as const, tool: 'mcp__drive__*' };
    await repository.add(target);
    await repository.remove(target);

    expect((await repository.read()).rules.global).toEqual([]);
  });

  it('keeps concurrent additions', async () => {
    await Promise.all(
      ['a', 'b', 'c'].map((name) =>
        repository.add({ scope: 'global', tool: `mcp__${name}__*` }),
      ),
    );

    expect((await repository.read()).rules.global).toHaveLength(3);
  });

  it('reads a broken file as no rules and refuses to overwrite it', async () => {
    fs.mkdirSync(path.dirname(rulesFile()), { recursive: true });
    fs.writeFileSync(rulesFile(), '{ broken');

    const parsed = await repository.read();
    expect(parsed.rules).toEqual({ global: [], projects: {} });
    expect(parsed.error).toEqual(expect.any(String));
    await expect(
      repository.add({ scope: 'global', tool: 'create_commit' }),
    ).rejects.toThrow(/invalid/);
    expect(fs.readFileSync(rulesFile(), 'utf8')).toBe('{ broken');
  });
});
