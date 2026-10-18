import { summarizeToolInput } from './summarize-tool-input';

describe('summarizeToolInput', () => {
  it('prefers the most descriptive key', () => {
    expect(summarizeToolInput({ lineStart: 1, path: 'src/a.ts' })).toBe(
      'src/a.ts',
    );
    expect(summarizeToolInput({ command: 'git status', path: 'x' })).toBe(
      'git status',
    );
  });

  it('falls back to the first string, then to JSON', () => {
    expect(summarizeToolInput({ title: 'Bug', n: 1 })).toBe('Bug');
    expect(summarizeToolInput({ limit: 5 })).toBe('{"limit":5}');
  });

  it('collapses whitespace and truncates to one short line', () => {
    const summary = summarizeToolInput({
      command: `echo ${'a\n'.repeat(200)}`,
    });

    expect(summary).not.toContain('\n');
    expect(summary.length).toBe(120);
    expect(summary.endsWith('…')).toBe(true);
  });

  it('handles empty and non-object input', () => {
    expect(summarizeToolInput(undefined)).toBe('');
    expect(summarizeToolInput('raw')).toBe('raw');
  });
});
