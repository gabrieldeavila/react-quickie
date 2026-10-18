import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/** Runs git in `root` without a shell; resolves with stdout. */
export async function runGit(root: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd: root });
  return stdout;
}
