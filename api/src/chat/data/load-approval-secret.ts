import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

export const APPROVAL_SECRET_FILE = 'approval-secret';

type LoadApprovalSecretInput = {
  envSecret?: string;
  storageDir: string;
};

async function readSecret(file: string): Promise<string | undefined> {
  try {
    const value = (await fs.readFile(file, 'utf8')).trim();
    return value || undefined;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function createSecret(file: string): Promise<string> {
  const secret = randomBytes(32).toString('hex');
  const tmpFile = `${file}.${process.pid}.${randomBytes(4).toString('hex')}`;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(tmpFile, secret, { mode: 0o600 });
  try {
    // `link` is atomic and fails if another process won the race: reuse theirs.
    await fs.link(tmpFile, file);
    return secret;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    const existing = await readSecret(file);
    if (!existing) throw error;
    return existing;
  } finally {
    await fs.unlink(tmpFile).catch(() => undefined);
  }
}

/**
 * Secret used to sign tool approval requests. `DOTY_APPROVAL_SECRET` wins;
 * otherwise one is generated once and kept in the data dir, so approval
 * cards persisted in the browser stay valid across API restarts.
 */
export async function loadApprovalSecret({
  envSecret,
  storageDir,
}: LoadApprovalSecretInput): Promise<string> {
  if (envSecret?.trim()) return envSecret.trim();

  const file = path.join(storageDir, APPROVAL_SECRET_FILE);
  return (await readSecret(file)) ?? createSecret(file);
}
