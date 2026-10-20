import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Writes through a temp file + rename, so readers never see half a file.
 * `mode` (e.g. 0o600 for files that may hold tokens) applies to the new file.
 */
export async function writeFileAtomic(
  file: string,
  content: string,
  mode?: number,
): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${randomBytes(6).toString('hex')}.tmp`,
  );
  try {
    await fs.writeFile(temp, content, { encoding: 'utf8', mode });
    await fs.rename(temp, file);
  } catch (error) {
    await fs.rm(temp, { force: true });
    throw error;
  }
}
