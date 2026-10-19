import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

/** Writes through a temp file + rename, so readers never see half a file. */
export async function writeFileAtomic(
  file: string,
  content: string,
): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${randomBytes(6).toString('hex')}.tmp`,
  );
  try {
    await fs.writeFile(temp, content, 'utf8');
    await fs.rename(temp, file);
  } catch (error) {
    await fs.rm(temp, { force: true });
    throw error;
  }
}
