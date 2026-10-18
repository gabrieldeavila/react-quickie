import type { UIMessage } from 'ai';
import {
  buildSummaryPrompt,
  toSummaryInstruction,
  withSummaryInstruction,
} from './build-summary-prompt';

const older: UIMessage[] = [
  { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'rename foo' }] },
];

describe('buildSummaryPrompt', () => {
  it('sends the transcript', () => {
    const { prompt, instructions } = buildSummaryPrompt(older);

    expect(prompt).toBe('Conversation:\nUser:\nrename foo');
    expect(instructions).toContain('summary');
  });

  it('folds in the previous summary first', () => {
    const { prompt } = buildSummaryPrompt(older, 'earlier stuff');

    expect(
      prompt.startsWith(
        'Summary of the conversation before this part:\nearlier stuff',
      ),
    ).toBe(true);
    expect(prompt).toContain('User:\nrename foo');
  });
});

describe('toSummaryInstruction', () => {
  it('is a system message containing the summary', () => {
    const message = toSummaryInstruction('S');

    expect(message.role).toBe('system');
    expect(message.content.endsWith('\n\nS')).toBe(true);
  });
});

describe('withSummaryInstruction', () => {
  it('keeps the instructions without a summary', () => {
    expect(withSummaryInstruction('rules', undefined)).toBe('rules');
  });

  it('appends the summary as the last system message', () => {
    const result = withSummaryInstruction('rules', 'S');

    expect(result).toEqual([
      { role: 'system', content: 'rules' },
      toSummaryInstruction('S'),
    ]);
  });
});
