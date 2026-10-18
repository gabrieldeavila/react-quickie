import { readSubagentUsage } from './read-subagent-usage';

const usage = {
  model: 'a:b',
  usage: {
    inputTokens: 10,
    outputTokens: 1,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
  },
  costUsd: 0.1,
};

describe('readSubagentUsage', () => {
  it('reads the usage of the final run_subagent result', () => {
    expect(
      readSubagentUsage({
        type: 'tool-result',
        toolName: 'run_subagent',
        output: { status: 'completed', usage },
      }),
    ).toBe(usage);
  });

  it('ignores preliminary results, other tools and other parts', () => {
    const output = { usage };
    expect(
      readSubagentUsage({
        type: 'tool-result',
        toolName: 'run_subagent',
        output,
        preliminary: true,
      }),
    ).toBeUndefined();
    expect(
      readSubagentUsage({ type: 'tool-result', toolName: 'read_file', output }),
    ).toBeUndefined();
    expect(readSubagentUsage({ type: 'tool-call' })).toBeUndefined();
  });
});
