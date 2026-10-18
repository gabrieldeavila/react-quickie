import { summarizeSubagentOutput } from './summarize-subagent-output';

describe('summarizeSubagentOutput', () => {
  const base = {
    agent: 'explorer',
    task: 't',
    needsApproval: [],
    steps: [
      { id: 'a', tool: 'read_file', inputSummary: 'a.ts', state: 'done' },
    ],
  };

  it('returns only the final answer, never the steps', () => {
    const summary = summarizeSubagentOutput({
      ...base,
      status: 'completed',
      text: 'It is in a.ts:10.',
    });

    expect(summary).toBe('It is in a.ts:10.');
    expect(summary).not.toContain('read_file');
  });

  it('lists held-back calls so the parent can run them', () => {
    const summary = summarizeSubagentOutput({
      ...base,
      status: 'completed',
      text: 'Done, but tests did not run.',
      needsApproval: ['npm test', 'git push'],
    });

    expect(summary).toContain('Done, but tests did not run.');
    expect(summary).toContain('- `npm test`');
    expect(summary).toContain('- `git push`');
  });

  it('says when there was no final answer', () => {
    expect(
      summarizeSubagentOutput({ ...base, status: 'completed', text: '' }),
    ).toBe('The subagent finished without a final answer.');
  });

  it('reports failures and interruptions', () => {
    expect(
      summarizeSubagentOutput({ ...base, status: 'failed', error: 'boom' }),
    ).toBe('The subagent failed: boom');
    expect(summarizeSubagentOutput({ ...base, status: 'aborted' })).toBe(
      'The subagent was interrupted before finishing.',
    );
  });

  it('reads the pre-Phase-4 output shape', () => {
    expect(
      summarizeSubagentOutput({
        success: true,
        subagentId: 'x-1',
        result: 'old answer',
      }),
    ).toBe('old answer');
    expect(
      summarizeSubagentOutput({
        success: false,
        subagentId: 'x-1',
        error: 'e',
      }),
    ).toBe('The subagent failed: e');
  });

  it('uses the preview of an output the UI truncated', () => {
    expect(
      summarizeSubagentOutput({
        truncated: true,
        preview: '{"status":"completed","text":"abc',
        originalSize: 9000,
      }),
    ).toBe('{"status":"completed","text":"abc');
  });
});
