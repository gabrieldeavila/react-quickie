import { parseGitStatus } from './parse-git-status';

describe('parseGitStatus', () => {
  it('reads the branch and counts changed files', () => {
    const output = [
      '## feat/x...origin/feat/x [ahead 2]',
      ' M src/a.ts',
      '?? src/b.ts',
      'A  src/c.ts',
      '',
    ].join('\n');

    expect(parseGitStatus(output)).toEqual({
      isRepository: true,
      branch: 'feat/x',
      changedFiles: 3,
    });
  });

  it('handles a clean branch without upstream', () => {
    expect(parseGitStatus('## main\n')).toEqual({
      isRepository: true,
      branch: 'main',
      changedFiles: 0,
    });
  });

  it('handles a repository without commits', () => {
    expect(parseGitStatus('## No commits yet on main\n?? a.ts\n')).toEqual({
      isRepository: true,
      branch: 'main',
      changedFiles: 1,
    });
  });

  it('has no branch on a detached HEAD', () => {
    expect(parseGitStatus('## HEAD (no branch)\n M a.ts\n')).toEqual({
      isRepository: true,
      branch: null,
      changedFiles: 1,
    });
  });
});
