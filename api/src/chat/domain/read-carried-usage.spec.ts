import type { UIMessage } from 'ai';
import { readCarriedUsage } from './read-carried-usage';

const usage = {
  inputTokens: 10,
  outputTokens: 2,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
};

const message = (role: UIMessage['role'], metadata?: unknown) =>
  ({ id: role, role, parts: [], metadata }) as UIMessage;

describe('readCarriedUsage', () => {
  it('reads usage and cost of a continued assistant message', () => {
    expect(
      readCarriedUsage([
        message('user'),
        message('assistant', { usage, costUsd: 0.5 }),
      ]),
    ).toEqual({ usage, costUsd: 0.5 });
  });

  it('ignores a new turn (last message from the user)', () => {
    expect(
      readCarriedUsage([message('assistant', { usage }), message('user')]),
    ).toBeUndefined();
  });

  it('ignores malformed metadata', () => {
    expect(
      readCarriedUsage([message('assistant', { usage: { inputTokens: 'x' } })]),
    ).toBeUndefined();
    expect(
      readCarriedUsage([message('assistant', { usage, costUsd: -1 })]),
    ).toEqual({ usage, costUsd: undefined });
  });
});
