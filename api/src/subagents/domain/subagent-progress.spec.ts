import {
  applySubagentEvent,
  startSubagentRun,
  type SubagentEvent,
  type SubagentRun,
} from './subagent-progress';

const play = (events: SubagentEvent[]): SubagentRun =>
  events.reduce(applySubagentEvent, startSubagentRun('explorer', 'find X'));

const call = (id: string, heldCall?: string): SubagentEvent => ({
  type: 'tool-call',
  toolCallId: id,
  toolName: 'read_file',
  input: { path: `src/${id}.ts` },
  heldCall,
});

describe('subagent progress', () => {
  it('starts queued, then runs', () => {
    expect(startSubagentRun('explorer', 'find X').progress).toMatchObject({
      status: 'queued',
      agent: 'explorer',
      task: 'find X',
      steps: [],
    });
    expect(play([{ type: 'start' }]).progress.status).toBe('running');
  });

  it('tracks each tool call with a short input summary and its result', () => {
    const { progress } = play([
      { type: 'start' },
      call('a'),
      call('b'),
      { type: 'tool-result', toolCallId: 'a' },
      { type: 'tool-error', toolCallId: 'b' },
    ]);

    expect(progress.steps).toEqual([
      { id: 'a', tool: 'read_file', inputSummary: 'src/a.ts', state: 'done' },
      { id: 'b', tool: 'read_file', inputSummary: 'src/b.ts', state: 'error' },
    ]);
  });

  it('collects held-back calls once, when they are denied', () => {
    const { progress } = play([
      { type: 'start' },
      call('a', 'npm install x'),
      call('b', 'npm install x'),
      call('c'),
      { type: 'tool-output-denied', toolCallId: 'a' },
      { type: 'tool-output-denied', toolCallId: 'b' },
      { type: 'tool-output-denied', toolCallId: 'c' },
    ]);

    expect(progress.needsApproval).toEqual(['npm install x']);
    expect(progress.steps.map((step) => step.state)).toEqual([
      'denied',
      'denied',
      'denied',
    ]);
  });

  it('streams text and keeps only the latest step that has text', () => {
    const run = play([
      { type: 'start' },
      { type: 'step-start' },
      { type: 'text-delta', text: 'Let me ' },
      { type: 'text-delta', text: 'look.' },
      { type: 'step-start' },
    ]);
    expect(run.progress.text).toBe('Let me look.');

    const final = play([
      { type: 'start' },
      { type: 'step-start' },
      { type: 'text-delta', text: 'Let me look.' },
      { type: 'step-start' },
      { type: 'step-start' },
      { type: 'text-delta', text: 'Found it ' },
      { type: 'text-delta', text: 'in a.ts.' },
    ]);
    expect(final.progress.text).toBe('Found it in a.ts.');
  });

  it.each<[SubagentEvent, string]>([
    [{ type: 'finish' }, 'completed'],
    [{ type: 'fail', error: 'rate limited' }, 'failed'],
    [{ type: 'abort' }, 'aborted'],
  ])('ends with %o and closes running steps', (event, status) => {
    const { progress } = play([{ type: 'start' }, call('a'), event]);

    expect(progress.status).toBe(status);
    expect(progress.steps[0].state).toBe('error');
  });

  it('keeps the error message of a failed run', () => {
    expect(play([{ type: 'fail', error: 'rate limited' }]).progress.error).toBe(
      'rate limited',
    );
  });

  it('sums the usage of every step', () => {
    const tokens = (input: number) => ({
      inputTokens: input,
      outputTokens: 1,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      reasoningTokens: 0,
    });

    const { progress } = play([
      { type: 'usage', usage: { model: 'a:b', usage: tokens(10), costUsd: 1 } },
      { type: 'usage', usage: { model: 'a:b', usage: tokens(5), costUsd: 2 } },
    ]);

    expect(progress.usage).toMatchObject({
      model: 'a:b',
      usage: { inputTokens: 15, outputTokens: 2 },
      costUsd: 3,
    });
  });
});
