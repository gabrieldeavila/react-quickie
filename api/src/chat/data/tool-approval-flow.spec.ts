import {
  isStepCount,
  readUIMessageStream,
  streamText,
  tool,
  type ModelMessage,
  type UIMessage,
} from 'ai';
import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';
import { z } from 'zod/v4';
import { createBashApprovalPolicy } from 'src/common/agents/tools/bash/domain/bash-approval-policy';
import { assessCommand } from 'src/common/agents/tools/bash/domain/command-policy';
import { buildToolApprovalMap } from '../domain/approval-policy';
import { prepareChatMessages } from '../domain/prepare-chat-messages';

// End-to-end check of the Phase 1 wiring against the real AI SDK: policy map →
// streamText({ toolApproval }) → UI message → approval response → next request.

const ROOT = '/workspace/project';
const SECRET = 'test-secret';
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

const textStream = (text: string) => ({
  stream: simulateReadableStream({
    chunks: [
      { type: 'text-start', id: 't' },
      { type: 'text-delta', id: 't', delta: text },
      { type: 'text-end', id: 't' },
      {
        type: 'finish',
        finishReason: { unified: 'stop', raw: undefined },
        usage,
      },
    ],
  }),
});

/** Mock model that answers each call with the next stream. */
const mockModel = (...streams: unknown[]) =>
  new MockLanguageModelV4({ doStream: streams as never });

function setup() {
  const execute = jest.fn(() => Promise.resolve('ran'));
  const tools = {
    run_bash_command: tool({
      inputSchema: z.object({ command: z.string() }),
      execute,
    }),
  };
  const toolApproval = buildToolApprovalMap({
    run_bash_command: createBashApprovalPolicy((command) =>
      assessCommand(command, ROOT),
    ),
  });
  return { execute, tools, toolApproval };
}

async function lastUIMessage(
  stream: ReadableStream<never> | ReturnType<typeof readUIMessageStream>,
  message?: UIMessage,
): Promise<UIMessage> {
  let last: UIMessage | undefined;
  for await (const value of readUIMessageStream({
    stream: stream as never,
    message,
  })) {
    last = value;
  }
  if (!last) throw new Error('no UI message');
  return last;
}

const userTurn: UIMessage = {
  id: 'u1',
  role: 'user',
  parts: [{ type: 'text', text: 'limpe o build' }],
};

type ApprovalPart = {
  state: string;
  approval?: { id: string; signature?: string; reason?: string };
};

const toolPartOf = (message: UIMessage) =>
  message.parts.find((part) =>
    part.type.startsWith('tool-'),
  ) as unknown as ApprovalPart;

async function firstTurn(command: string) {
  const ctx = setup();
  const result = streamText({
    model: mockModel(toolCallStream(command)),
    messages: [{ role: 'user', content: 'limpe o build' }],
    tools: ctx.tools,
    toolApproval: ctx.toolApproval,
    experimental_toolApprovalSecret: SECRET,
  });
  const assistant = await lastUIMessage(result.toUIMessageStream() as never);
  return { ...ctx, assistant: { ...assistant, id: 'a1' } };
}

function respond(assistant: UIMessage, approved: boolean, signature?: string) {
  return {
    ...assistant,
    parts: assistant.parts.map((part) => {
      if (!part.type.startsWith('tool-')) return part;
      const toolPart = part as unknown as ApprovalPart;
      return {
        ...part,
        state: 'approval-responded',
        approval: {
          ...toolPart.approval,
          approved,
          ...(signature ? { signature } : {}),
        },
      };
    }),
  } as UIMessage;
}

async function continueTurn(
  messages: ModelMessage[],
  ctx: ReturnType<typeof setup>,
) {
  const errors: unknown[] = [];
  const result = streamText({
    model: mockModel(textStream('feito')),
    messages,
    tools: ctx.tools,
    toolApproval: ctx.toolApproval,
    experimental_toolApprovalSecret: SECRET,
    onError: ({ error }) => {
      errors.push(error);
    },
  });
  await result.consumeStream();
  return errors;
}

describe('tool approval flow (AI SDK + Doty policy)', () => {
  it('asks for approval, signs the request and does not run the tool', async () => {
    const { assistant, execute } = await firstTurn('rm -rf dist');
    const part = toolPartOf(assistant);

    expect(part.state).toBe('approval-requested');
    expect(part.approval?.id).toEqual(expect.any(String));
    expect(part.approval?.signature).toEqual(expect.any(String));
    expect(execute).not.toHaveBeenCalled();
  });

  it('runs the tool on the next request once approved', async () => {
    const ctx = await firstTurn('rm -rf dist');
    const { modelMessages } = await prepareChatMessages(
      [userTurn, respond(ctx.assistant, true)],
      ctx.tools,
    );

    const errors = await continueTurn(modelMessages, ctx);

    expect(errors).toEqual([]);
    expect(ctx.execute).toHaveBeenCalledTimes(1);
    expect(ctx.execute.mock.calls[0]).toEqual(
      expect.arrayContaining([{ command: 'rm -rf dist' }]),
    );
  });

  it('does not run the tool when denied', async () => {
    const ctx = await firstTurn('rm -rf dist');
    const { modelMessages } = await prepareChatMessages(
      [userTurn, respond(ctx.assistant, false)],
      ctx.tools,
    );

    await continueTurn(modelMessages, ctx);

    expect(ctx.execute).not.toHaveBeenCalled();
  });

  it('rejects a forged approval signature', async () => {
    const ctx = await firstTurn('rm -rf dist');
    const { modelMessages } = await prepareChatMessages(
      [userTurn, respond(ctx.assistant, true, 'forged')],
      ctx.tools,
    );

    const errors = await continueTurn(modelMessages, ctx);

    expect(ctx.execute).not.toHaveBeenCalled();
    expect(String(errors[0])).toMatch(/signature/i);
  });

  it('denies blocked commands without asking and tells the model why', async () => {
    const { tools, toolApproval, execute } = setup();
    const model = mockModel(
      toolCallStream('sudo reboot'),
      textStream("I can't run that."),
    );

    const result = streamText({
      model,
      messages: [{ role: 'user', content: 'reinicie' }],
      tools,
      toolApproval,
      experimental_toolApprovalSecret: SECRET,
      stopWhen: isStepCount(5),
    });
    const assistant = await lastUIMessage(result.toUIMessageStream() as never);
    const part = toolPartOf(assistant) as ApprovalPart & {
      approval: { approved: boolean; isAutomatic: boolean };
    };

    // The SDK leaves an automatic denial as `approval-responded` in the UI message.
    expect(part.state).toBe('approval-responded');
    expect(part.approval).toMatchObject({ approved: false, isAutomatic: true });
    expect(part.approval.reason).toMatch(/not allowed/);
    expect(execute).not.toHaveBeenCalled();
    expect(JSON.stringify(model.doStreamCalls[1].prompt)).toContain(
      'execution-denied',
    );
  });

  it('runs read-only commands without asking', async () => {
    const { assistant, execute } = await firstTurn('ls -la');

    expect(toolPartOf(assistant).state).toBe('output-available');
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
