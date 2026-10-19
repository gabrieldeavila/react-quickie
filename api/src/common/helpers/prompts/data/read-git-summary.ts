import { execFile } from 'child_process';
import { promisify } from 'util';
import { parseGitStatus, type GitSummary } from '../domain/parse-git-status';

const execFileAsync = promisify(execFile);

const GIT_TIMEOUT_MS = 1000;

function isNotARepository(error: unknown): boolean {
  const stderr = (error as { stderr?: unknown })?.stderr;
  return typeof stderr === 'string' && /not a git repository/i.test(stderr);
}

/**
 * Branch and changed-file count of `root`. Undefined when git fails or takes
 * longer than a second: the environment block then leaves the line out.
 */
export async function readGitSummary(
  root: string | undefined,
): Promise<GitSummary | undefined> {
  if (!root) return undefined;
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['status', '--porcelain=v1', '-b'],
      { cwd: root, timeout: GIT_TIMEOUT_MS },
    );
    return parseGitStatus(stdout);
  } catch (error) {
    return isNotARepository(error) ? { isRepository: false } : undefined;
  }
}
