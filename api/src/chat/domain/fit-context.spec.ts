import type { ModelMessage, UIMessage } from 'ai';
import { fitContext, type FitContextDeps } from './fit-context';

const uiText = (id: string, role: 'user' | 'assistant', text: string) =>
  ({ id, role, parts: [{ type: 'text', text }] }) as UIMessage;

const toModel = (messages: UIMessage[]): ModelMessage[] =>
  messages.map((message) => ({
    role: message.role as 'user' | 'assistant',
    content: (message.parts[0] as { text: string }).text,
  }));

const conversation = (size: number): UIMessage[] => [
  uiText('u1', 'user', 'a'.repeat(size)),
  uiText('a1', 'assistant', 'b'.repeat(size)),
  uiText('u2', 'user', 'c'.repeat(size)),
  uiText('a2', 'assistant', 'd'.repeat(size)),
  uiText('u3', 'user', 'e'.repeat(size)),
];

/** `null` makes summarizing fail. */
const deps = (summary: string | null = 'SUMMARY') => {
  const summarize = jest.fn<
    ReturnType<FitContextDeps['summarize']>,
    Parameters<FitContextDeps['summarize']>
  >(() => Promise.resolve(summary ?? undefined));
  return {
    summarize,
    toModelMessages: (messages: UIMessage[]) =>
      Promise.resolve(toModel(messages)),
  };
};

describe('fitContext', () => {
  it('leaves the context alone without a known window', async () => {
    const uiMessages = conversation(4000);
    const d = deps();
    const result = await fitContext(
      {
        uiMessages,
        modelMessages: toModel(uiMessages),
        contextWindow: undefined,
        fixedTokens: 0,
        previousSummary: 'old',
      },
      d,
    );

    expect(result.messages).toHaveLength(5);
    expect(result.summary).toBe('old');
    expect(d.summarize).not.toHaveBeenCalled();
  });

  it('leaves the context alone under the budget', async () => {
    const uiMessages = conversation(100);
    const d = deps();
    const result = await fitContext(
      {
        uiMessages,
        modelMessages: toModel(uiMessages),
        contextWindow: 100_000,
        fixedTokens: 0,
      },
      d,
    );

    expect(result.compaction).toBeUndefined();
    expect(d.summarize).not.toHaveBeenCalled();
  });

  it('only prunes when that is enough', async () => {
    const uiMessages = [
      uiText('u1', 'user', 'read it'),
      {
        ...uiText('a1', 'assistant', 'ok'),
        metadata: { contextTokens: 900 },
      } as UIMessage,
      uiText('u2', 'user', 'next'),
    ];
    const bigResult = 'x'.repeat(20_000);
    const modelMessages: ModelMessage[] = [
      { role: 'user', content: 'read it' },
      {
        role: 'assistant',
        content: [
          { type: 'tool-call', toolCallId: 'c1', toolName: 't', input: {} },
        ],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'c1',
            toolName: 't',
            output: { type: 'text', value: bigResult },
          },
        ],
      },
      { role: 'assistant', content: 'ok' },
      { role: 'user', content: 'next' },
      { role: 'assistant', content: 'hm' },
      { role: 'user', content: 'go' },
    ];
    const d = deps();

    const result = await fitContext(
      { uiMessages, modelMessages, contextWindow: 1000, fixedTokens: 0 },
      d,
    );

    expect(JSON.stringify(result.messages)).not.toContain(bigResult);
    expect(result.compaction).toBeUndefined();
    expect(d.summarize).not.toHaveBeenCalled();
  });

  it('summarizes older turns when pruning is not enough', async () => {
    const uiMessages = conversation(4000);
    const d = deps();

    const result = await fitContext(
      {
        uiMessages,
        modelMessages: toModel(uiMessages),
        contextWindow: 4000,
        fixedTokens: 0,
        previousSummary: 'old',
      },
      d,
    );

    expect(d.summarize).toHaveBeenCalledWith(uiMessages.slice(0, 2), 'old');
    expect(result.compaction).toEqual({
      summary: 'SUMMARY',
      upToMessageId: 'a1',
    });
    expect(result.summary).toBe('SUMMARY');
    expect(result.messages).toHaveLength(3);
  });

  it('falls back to the pruned context when summarizing fails', async () => {
    const uiMessages = conversation(4000);
    const d = deps(null);

    const result = await fitContext(
      {
        uiMessages,
        modelMessages: toModel(uiMessages),
        contextWindow: 4000,
        fixedTokens: 0,
        previousSummary: 'old',
      },
      d,
    );

    expect(result.compaction).toBeUndefined();
    expect(result.summary).toBe('old');
    expect(result.messages).toHaveLength(5);
  });

  it('does not summarize when there is no older turn', async () => {
    const uiMessages = conversation(4000).slice(2);
    const d = deps();

    const result = await fitContext(
      {
        uiMessages,
        modelMessages: toModel(uiMessages),
        contextWindow: 1000,
        fixedTokens: 0,
      },
      d,
    );

    expect(d.summarize).not.toHaveBeenCalled();
    expect(result.messages).toHaveLength(3);
  });
});
