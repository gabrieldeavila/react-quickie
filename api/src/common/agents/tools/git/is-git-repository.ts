import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const TIMEOUT_MS = 1000;

/** Whether `root` is inside a git work tree; false when git fails or is slow. */
export async function isGitRepository(root: string): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['rev-parse', '--is-inside-work-tree'],
      { cwd: root, timeout: TIMEOUT_MS },
    );
    return stdout.trim() === 'true';
  } catch {
    return false;
  }
}
