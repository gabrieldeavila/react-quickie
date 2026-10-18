import {
  formatChanges,
  formatCommitLog,
  MAX_DIFF_CHARS,
} from './format-git-output';

describe('formatCommitLog', () => {
  it('formats each log line and skips blank ones', () => {
    expect(
      formatCommitLog('abc|Ana|2026-10-18|feat: x\n\ndef|Bo|2026-10-17|fix\n'),
    ).toEqual([
      'abc | Ana | 2026-10-18 | feat: x',
      'def | Bo | 2026-10-17 | fix',
    ]);
  });

  it('is empty for an empty log', () => {
    expect(formatCommitLog('')).toEqual([]);
  });
});

describe('formatChanges', () => {
  it('lists files and cuts long diffs', () => {
    const lines = formatChanges(
      ' M a.ts\n?? b.ts\n',
      'x'.repeat(MAX_DIFF_CHARS + 5),
    );

    expect(lines.slice(0, 5)).toEqual([
      'Arquivos:',
      '-  M a.ts',
      '- ?? b.ts',
      '',
      'Diff:',
    ]);
    expect(lines[5]).toHaveLength(MAX_DIFF_CHARS);
  });
});
