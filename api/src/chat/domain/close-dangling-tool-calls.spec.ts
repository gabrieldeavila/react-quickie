import type { UIMessage } from 'ai';
import {
  APPROVED_NOT_RUN_ERROR,
  closeDanglingToolCalls,
  INTERRUPTED_TOOL_ERROR,
  UNANSWERED_APPROVAL_ERROR,
} from './close-dangling-tool-calls';

const bashPart = (state: string, extra: Record<string, unknown> = {}) =>
  ({
    type: 'tool-run_bash_command',
    toolCallId: 'call-1',
    state,
    input: { command: 'rm -rf dist' },
    ...extra,
  }) as unknown as UIMessage['parts'][number];

const assistant = (...parts: UIMessage['parts']): UIMessage => ({
  id: 'a1',
  role: 'assistant',
  parts,
});
const user: UIMessage = {
  id: 'u1',
  role: 'user',
  parts: [{ type: 'text', text: 'next' }],
};

const firstPart = (messages: UIMessage[]) =>
  messages[0].parts[0] as unknown as Record<string, unknown>;

describe('closeDanglingToolCalls', () => {
  it('closes calls cut off mid-stream, even in the last message', () => {
    for (const state of ['input-streaming', 'input-available']) {
      const [message] = closeDanglingToolCalls([assistant(bashPart(state))]);

      expect(message.parts[0]).toMatchObject({
        state: 'output-error',
        errorText: INTERRUPTED_TOOL_ERROR,
        toolCallId: 'call-1',
      });
    }
  });

  it('keeps an approval round-trip in the last message as is', () => {
    const requested = bashPart('approval-requested', {
      approval: { id: 'ap-1' },
    });
    const responded = bashPart('approval-responded', {
      approval: { id: 'ap-1', approved: true },
    });

    expect(
      closeDanglingToolCalls([user, assistant(requested)])[1].parts[0],
    ).toBe(requested);
    expect(
      closeDanglingToolCalls([user, assistant(responded)])[1].parts[0],
    ).toBe(responded);
  });

  it('closes an unanswered approval once the user moved on', () => {
    const result = closeDanglingToolCalls([
      assistant(bashPart('approval-requested', { approval: { id: 'ap-1' } })),
      user,
    ]);

    expect(firstPart(result)).toMatchObject({
      state: 'output-error',
      errorText: UNANSWERED_APPROVAL_ERROR,
    });
    expect(firstPart(result)).not.toHaveProperty('approval');
  });

  it('closes earlier responded approvals as denied or not run', () => {
    const denied = closeDanglingToolCalls([
      assistant(
        bashPart('approval-responded', {
          approval: { id: 'ap-1', approved: false, reason: 'no' },
        }),
      ),
      user,
    ]);
    const approved = closeDanglingToolCalls([
      assistant(
        bashPart('approval-responded', {
          approval: { id: 'ap-1', approved: true },
        }),
      ),
      user,
    ]);

    expect(firstPart(denied)).toMatchObject({
      state: 'output-denied',
      approval: { approved: false, reason: 'no' },
    });
    expect(firstPart(approved)).toMatchObject({
      state: 'output-error',
      errorText: APPROVED_NOT_RUN_ERROR,
    });
  });

  it('handles dynamic tools and leaves finished parts and user messages alone', () => {
    const done = bashPart('output-available', { output: 'ok' });
    const dynamic = {
      type: 'dynamic-tool',
      toolName: 'mcp__x__y',
      toolCallId: 'c2',
      state: 'input-available',
      input: {},
    } as unknown as UIMessage['parts'][number];

    const [message, userMessage] = closeDanglingToolCalls([
      assistant(done, dynamic, { type: 'text', text: 'hi' }),
      user,
    ]);

    expect(message.parts[0]).toBe(done);
    expect(message.parts[1]).toMatchObject({ state: 'output-error' });
    expect(message.parts[2]).toEqual({ type: 'text', text: 'hi' });
    expect(userMessage).toBe(user);
  });
});
