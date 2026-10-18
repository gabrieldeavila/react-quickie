import { buildNestedApprovalPolicies } from './nested-approval-policies';
import { describeSubagentError, toSubagentEvent } from './to-subagent-event';

const policies = buildNestedApprovalPolicies({
  run_bash_command: (input) =>
    (input as { command: string }).command === 'ls'
      ? { decision: 'never' }
      : { decision: 'ask' },
});

describe('toSubagentEvent', () => {
  it('maps the parts the progress cares about', () => {
    expect(toSubagentEvent({ type: 'start-step' }, policies)).toEqual({
      type: 'step-start',
    });
    expect(
      toSubagentEvent({ type: 'text-delta', text: 'hi' }, policies),
    ).toEqual({ type: 'text-delta', text: 'hi' });
    expect(
      toSubagentEvent({ type: 'tool-result', toolCallId: 'c' }, policies),
    ).toEqual({ type: 'tool-result', toolCallId: 'c' });
    expect(
      toSubagentEvent(
        { type: 'tool-output-denied', toolCallId: 'c' },
        policies,
      ),
    ).toEqual({ type: 'tool-output-denied', toolCallId: 'c' });
    expect(toSubagentEvent({ type: 'abort' }, policies)).toEqual({
      type: 'abort',
    });
  });

  it('treats an automatic denial as a denied call', () => {
    expect(
      toSubagentEvent(
        {
          type: 'tool-approval-response',
          approved: false,
          toolCall: { toolCallId: 'c' },
        },
        policies,
      ),
    ).toEqual({ type: 'tool-output-denied', toolCallId: 'c' });
    expect(
      toSubagentEvent(
        { type: 'tool-approval-response', approved: true, toolCall: {} },
        policies,
      ),
    ).toBeUndefined();
  });

  it('ignores everything else', () => {
    expect(
      toSubagentEvent({ type: 'reasoning-delta' }, policies),
    ).toBeUndefined();
    expect(
      toSubagentEvent({ type: 'text-delta', text: '' }, policies),
    ).toBeUndefined();
  });

  it('marks tool calls the nested policy holds back', () => {
    expect(
      toSubagentEvent(
        {
          type: 'tool-call',
          toolCallId: 'c',
          toolName: 'run_bash_command',
          input: { command: 'npm install x' },
        },
        policies,
      ),
    ).toMatchObject({ type: 'tool-call', heldCall: 'npm install x' });
    expect(
      toSubagentEvent(
        {
          type: 'tool-call',
          toolCallId: 'c',
          toolName: 'run_bash_command',
          input: { command: 'ls' },
        },
        policies,
      ),
    ).toMatchObject({ heldCall: undefined });
  });

  it('turns stream errors into a failure with the message', () => {
    expect(
      toSubagentEvent({ type: 'error', error: new Error('429') }, policies),
    ).toEqual({ type: 'fail', error: '429' });
  });
});

describe('describeSubagentError', () => {
  it('caps long messages', () => {
    expect(describeSubagentError(new Error('x'.repeat(2000)))).toHaveLength(
      500,
    );
  });
});
