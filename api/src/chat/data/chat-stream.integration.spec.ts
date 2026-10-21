import { readUIMessageStream, tool, type UIMessage } from 'ai';
import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';
import { z } from 'zod/v4';
import type { PromptsService } from 'src/common/helpers/prompts.service';
import type { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import type { SelectedModel } from 'src/llm/domain/find-model';
import { prepareChatMessages } from '../domain/prepare-chat-messages';
import type { ApprovalSecretService } from './approval-secret.service';
import { ChatStreamService } from './chat-stream.service';
import { ContextCompactionService } from './context-compaction.service';

// Phase 6 wiring against the real AI SDK: usage metadata on finish, context
// compaction before the stream, and Anthropic cache breakpoints per step.

const usage = (input: number, output: number) => ({
  inputTokens: { total: input, noCache: input, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: output, text: output, reasoning: 0 },
});

const finish = (reason: 'stop' | 'tool-calls', input: number, output = 10) => ({
  type: 'finish',
  finishReason: { unified: reason, raw: undefined },
  usage: usage(input, output),
});

const textStream = (text: string, input: number) => ({
  stream: simulateReadableStream({
    chunks: [
      { type: 'text-start', id: 't' },
      { type: 'text-delta', id: 't', delta: text },
      { type: 'text-end', id: 't' },
      finish('stop', input),
    ],
  }),
});

const toolCallStream = (input: number) => ({
  stream: simulateReadableStream({
    chunks: [
      {
        type: 'tool-call',
        toolCallId: 'call-1',
        toolName: 'read_file',
        input: JSON.stringify({ path: 'a.ts' }),
      },
      finish('tool-calls', input),
    ],
  }),
});

const selectedModel = (
  provider: SelectedModel['provider'],
  contextWindow?: number,
): SelectedModel => ({
  ref: `${provider}:m`,
  provider,
  model: {
    id: 'm',
    label: 'M',
    contextWindow,
    supportsTools: true,
    supportsImages: false,
    supportsReasoning: false,
    pricing: { inputPerMTok: 2, outputPerMTok: 10 },
  },
});

const tools = {
  read_file: tool({
    inputSchema: z.object({ path: z.string() }),
    execute: () => Promise.resolve('file content'),
  }),
};

function setup(chatModel: MockLanguageModelV4, summaryModel = chatModel) {
  const registry = {
    languageModel: (selected: SelectedModel) =>
      selected.ref === 'summary:m' ? summaryModel : chatModel,
    selectForSummary: () => ({ ...selectedModel('openai'), ref: 'summary:m' }),
  } as unknown as ProviderRegistryService;
  const prompts = {
    getInstructions: () =>
      Promise.resolve([{ role: 'system' as const, content: 'rules' }]),
  } as unknown as PromptsService;
  const secret = {
    get: () => Promise.resolve('secret'),
  } as unknown as ApprovalSecretService;

  return new ChatStreamService(
    registry,
    prompts,
    secret,
    new ContextCompactionService(registry),
  );
}

async function run(
  service: ChatStreamService,
  model: SelectedModel,
  raw: UIMessage[],
  summary?: string,
) {
  const { uiMessages, modelMessages } = await prepareChatMessages(raw, tools);
  const stream = await service.createStream({
    model,
    uiMessages,
    messages: modelMessages,
    tools,
    toolApproval: {},
    summary,
    abortSignal: new AbortController().signal,
  });

  let last: UIMessage | undefined;
  for await (const message of readUIMessageStream({ stream })) last = message;
  if (!last) throw new Error('no UI message');
  return last;
}

const text = (id: string, role: 'user' | 'assistant', value: string) =>
  ({ id, role, parts: [{ type: 'text', text: value }] }) as UIMessage;

describe('ChatStreamService (Phase 6)', () => {
  it('sends usage, cost and the last step context size as metadata', async () => {
    const chatModel = new MockLanguageModelV4({
      doStream: [toolCallStream(1000), textStream('done', 1500)] as never,
    });

    const message = await run(setup(chatModel), selectedModel('openai'), [
      text('u1', 'user', 'read a.ts'),
    ]);

    expect(message.metadata).toMatchObject({
      model: 'openai:m',
      usage: { inputTokens: 2500, outputTokens: 20 },
      contextTokens: 1510,
    });
    expect((message.metadata as { costUsd: number }).costUsd).toBeCloseTo(
      (2500 * 2 + 20 * 10) / 1e6,
    );
  });

  it('marks the last system instruction and last message on every Anthropic step', async () => {
    const chatModel = new MockLanguageModelV4({
      doStream: [toolCallStream(10), textStream('done', 20)] as never,
    });

    await run(setup(chatModel), selectedModel('anthropic'), [
      text('u1', 'user', 'read a.ts'),
    ]);

    for (const call of chatModel.doStreamCalls) {
      const marked = call.prompt.flatMap((message, index) =>
        message.providerOptions?.anthropic?.cacheControl ? [index] : [],
      );
      const lastSystem = call.prompt.map((m) => m.role).lastIndexOf('system');
      expect(marked).toEqual([lastSystem, call.prompt.length - 1]);
    }
  });

  it('sets no cache markers for other providers', async () => {
    const chatModel = new MockLanguageModelV4({
      doStream: [textStream('hi', 10)] as never,
    });

    await run(setup(chatModel), selectedModel('openai'), [
      text('u1', 'user', 'hello'),
    ]);

    const prompt = chatModel.doStreamCalls[0].prompt;
    expect(prompt.some((m) => m.providerOptions?.anthropic)).toBe(false);
  });

  it('summarizes older turns over the budget and sends a data-compaction part', async () => {
    const chatModel = new MockLanguageModelV4({
      doStream: [textStream('answer', 10)] as never,
    });
    const summaryModel = new MockLanguageModelV4({
      doGenerate: {
        content: [{ type: 'text', text: 'NEW SUMMARY' }],
        finishReason: { unified: 'stop', raw: undefined },
        usage: usage(10, 10),
        warnings: [],
      } as never,
    });
    const long = 'x'.repeat(4000);

    const message = await run(
      setup(chatModel, summaryModel),
      selectedModel('openai', 3000),
      [
        text('u1', 'user', long),
        text('a1', 'assistant', long),
        text('u2', 'user', long),
        text('a2', 'assistant', long),
        text('u3', 'user', 'now'),
      ],
      'OLD SUMMARY',
    );

    expect(message.parts[0]).toEqual({
      type: 'data-compaction',
      data: { summary: 'NEW SUMMARY', upToMessageId: 'a1' },
    });
    const summaryPrompt = JSON.stringify(
      summaryModel.doGenerateCalls[0].prompt,
    );
    expect(summaryPrompt).toContain('OLD SUMMARY');

    const prompt = chatModel.doStreamCalls[0].prompt;
    expect(prompt.filter((m) => m.role !== 'system')).toHaveLength(3);
    expect(JSON.stringify(prompt)).toContain('NEW SUMMARY');
    expect(JSON.stringify(prompt)).not.toContain('OLD SUMMARY');
  });

  it('sends a summary from an earlier compaction as an instruction', async () => {
    const chatModel = new MockLanguageModelV4({
      doStream: [textStream('hi', 10)] as never,
    });

    await run(
      setup(chatModel),
      selectedModel('openai', 1_000_000),
      [text('u3', 'user', 'continue')],
      'EARLIER',
    );

    const system = chatModel.doStreamCalls[0].prompt.filter(
      (m) => m.role === 'system',
    );
    expect(JSON.stringify(system.at(-1))).toContain('EARLIER');
  });
});
