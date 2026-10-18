import type { UIMessage } from 'ai';
import { renderTranscript } from './render-transcript';

const message = (role: UIMessage['role'], parts: unknown[]): UIMessage =>
  ({ id: role, role, parts }) as UIMessage;

describe('renderTranscript', () => {
  it('renders text, images and tool calls per speaker', () => {
    const transcript = renderTranscript([
      message('user', [
        { type: 'text', text: 'fix the bug' },
        { type: 'file', mediaType: 'image/png', url: 'data:...' },
      ]),
      message('assistant', [
        { type: 'reasoning', text: 'hidden' },
        { type: 'step-start' },
        {
          type: 'tool-read_file',
          state: 'output-available',
          input: { path: 'a.ts' },
          output: 'content',
        },
        {
          type: 'dynamic-tool',
          toolName: 'mcp__gh__issue',
          state: 'output-error',
          input: {},
          errorText: 'boom',
        },
        { type: 'text', text: 'done' },
      ]),
    ]);

    expect(transcript).toBe(
      [
        'User:\nfix the bug\n[image]',
        'Assistant:\n[tool read_file({"path":"a.ts"}) → content]\n' +
          '[tool mcp__gh__issue({}) → error: boom]\ndone',
      ].join('\n\n'),
    );
  });

  it('clips long tool outputs', () => {
    const transcript = renderTranscript([
      message('assistant', [
        {
          type: 'tool-run_bash_command',
          state: 'output-available',
          input: { command: 'ls' },
          output: 'x'.repeat(5000),
        },
      ]),
    ]);

    expect(transcript.length).toBeLessThan(1700);
    expect(transcript).toContain('… [cut]');
  });

  it('skips messages with nothing to show', () => {
    expect(
      renderTranscript([message('assistant', [{ type: 'step-start' }])]),
    ).toBe('');
  });
});
