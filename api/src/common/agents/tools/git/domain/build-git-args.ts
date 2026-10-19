/**
 * Argument lists for `execFile('git', args)`. No shell is involved, so model
 * input can't inject commands; revisions are also kept from being read as
 * options (`--output=…`).
 */

const COMMIT_LOG_FORMAT = '--pretty=format:%h|%an|%ai|%s';

export class UnsafeGitArgumentError extends Error {}

/** A commit-ish such as `abc1234`, `HEAD~1` or `main` — never an option. */
export function assertSafeRevision(revision: string): string {
  const trimmed = revision.trim();
  if (!trimmed || trimmed.startsWith('-')) {
    throw new UnsafeGitArgumentError(
      `Invalid revision: "${revision}". Use a hash, branch or HEAD~N.`,
    );
  }
  return trimmed;
}

export function recentCommitsArgs(limit: number): string[] {
  return ['log', '-n', String(limit), COMMIT_LOG_FORMAT];
}

export type CommitSearch = {
  author?: string;
  since?: string;
  until?: string;
  limit: number;
};

export function searchCommitsArgs(search: CommitSearch): string[] {
  const args = recentCommitsArgs(search.limit);
  if (search.author) args.push(`--author=${search.author}`);
  if (search.since) args.push(`--since=${search.since}`);
  if (search.until) args.push(`--until=${search.until}`);
  return args;
}

/** `--` so a file name starting with `-` is still a path. */
export function addArgs(files: string[]): string[] {
  return ['add', '--', ...files];
}

export function commitArgs(message: string): string[] {
  return ['commit', '-m', message];
}

export function showStatArgs(revision: string): string[] {
  return ['show', '--stat', '--oneline', assertSafeRevision(revision)];
}

export function showPatchArgs(revision: string): string[] {
  return ['show', '--patch', '--format=', assertSafeRevision(revision)];
}
