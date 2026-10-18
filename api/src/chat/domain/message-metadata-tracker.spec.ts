import type { LanguageModelUsage, TextStreamPart, ToolSet } from 'ai';
import { createMessageMetadataTracker } from './message-metadata-tracker';

const usage = (input: number, output: number): LanguageModelUsage => ({
  inputTokens: input,
  outputTokens: output,
  inputTokenDetails: {
    noCacheTokens: input,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  },
  outputTokenDetails: { textTokens: output, reasoningTokens: 0 },
  totalTokens: input + output,
});

const part = (value: Record<string, unknown>) => ({
  part: value as unknown as TextStreamPart<ToolSet>,
});

describe('createMessageMetadataTracker', () => {
  const pricing = { inputPerMTok: 2, outputPerMTok: 10 };

  it('sends the model on start', () => {
    const track = createMessageMetadataTracker({ ref: 'a:b', pricing });
    expect(track(part({ type: 'start' }))).toEqual({ model: 'a:b' });
  });

  it('ignores other parts', () => {
    const track = createMessageMetadataTracker({ ref: 'a:b', pricing });
    expect(track(part({ type: 'text-delta', text: 'x' }))).toBeUndefined();
    expect(
      track(part({ type: 'finish-step', usage: usage(1, 1) })),
    ).toBeUndefined();
  });

  it('sends totals, cost and the last step context size on finish', () => {
    const track = createMessageMetadataTracker({ ref: 'a:b', pricing });
    track(part({ type: 'finish-step', usage: usage(1000, 100) }));
    track(part({ type: 'finish-step', usage: usage(1500, 200) }));

    const metadata = track(
      part({ type: 'finish', totalUsage: usage(2500, 300) }),
    );

    expect(metadata).toMatchObject({
      model: 'a:b',
      usage: { inputTokens: 2500, outputTokens: 300 },
      contextTokens: 1700,
    });
    expect(metadata?.costUsd).toBeCloseTo((2500 * 2 + 300 * 10) / 1e6);
  });

  it('leaves cost out when the model has no pricing', () => {
    const track = createMessageMetadataTracker({ ref: 'a:b' });
    const metadata = track(part({ type: 'finish', totalUsage: usage(10, 1) }));

    expect(metadata?.costUsd).toBeUndefined();
    expect(metadata?.contextTokens).toBeUndefined();
  });

  it('adds the usage carried from before a tool approval', () => {
    const carriedUsage = {
      inputTokens: 100,
      outputTokens: 10,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
    };
    const track = createMessageMetadataTracker({
      ref: 'a:b',
      pricing,
      carried: { usage: carriedUsage, costUsd: 0.01 },
    });

    const metadata = track(part({ type: 'finish', totalUsage: usage(50, 5) }));

    expect(metadata?.usage).toMatchObject({
      inputTokens: 150,
      outputTokens: 15,
    });
    expect(metadata?.costUsd).toBeCloseTo(0.01 + (50 * 2 + 5 * 10) / 1e6);
  });
});
