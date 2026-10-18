import * as fs from 'fs-extra';

/**
 * One-time copy of project memory from the old `api/storage/memory` folder.
 * Copies (never moves) and only when the new folder doesn't exist yet.
 */
export async function copyLegacyMemory(
  legacyDir: string,
  targetDir: string,
): Promise<boolean> {
  if (legacyDir === targetDir) return false;
  if (!(await fs.pathExists(legacyDir))) return false;
  if (await fs.pathExists(targetDir)) return false;

  await fs.copy(legacyDir, targetDir, { overwrite: false });
  return true;
}
