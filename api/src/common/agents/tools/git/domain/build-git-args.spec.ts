import {
  addArgs,
  assertSafeRevision,
  commitArgs,
  recentCommitsArgs,
  searchCommitsArgs,
  showPatchArgs,
  showStatArgs,
  UnsafeGitArgumentError,
} from './build-git-args';

describe('build-git-args', () => {
  it('builds the log command with the commit format', () => {
    expect(recentCommitsArgs(5)).toEqual([
      'log',
      '-n',
      '5',
      '--pretty=format:%h|%an|%ai|%s',
    ]);
  });

  it('keeps search filters as single arguments, shell syntax included', () => {
    const args = searchCommitsArgs({
      author: 'Ana "$(rm -rf ~)"',
      since: '2 weeks ago',
      limit: 10,
    });

    expect(args).toContain('--author=Ana "$(rm -rf ~)"');
    expect(args).toContain('--since=2 weeks ago');
    expect(args.some((arg) => arg.startsWith('--until'))).toBe(false);
  });

  it('separates files from options when staging', () => {
    expect(addArgs(['.', '-rf'])).toEqual(['add', '--', '.', '-rf']);
  });

  it('passes the commit message as one argument', () => {
    expect(commitArgs('feat: "x" `y`')).toEqual([
      'commit',
      '-m',
      'feat: "x" `y`',
    ]);
  });

  it('accepts normal revisions', () => {
    expect(assertSafeRevision(' HEAD~1 ')).toBe('HEAD~1');
    expect(showStatArgs('abc1234')).toEqual([
      'show',
      '--stat',
      '--oneline',
      'abc1234',
    ]);
    expect(showPatchArgs('main')).toEqual([
      'show',
      '--patch',
      '--format=',
      'main',
    ]);
  });

  it.each(['', '  ', '--output=/tmp/x', '-p'])(
    'rejects %p as a revision',
    (revision) => {
      expect(() => assertSafeRevision(revision)).toThrow(
        UnsafeGitArgumentError,
      );
    },
  );
});
