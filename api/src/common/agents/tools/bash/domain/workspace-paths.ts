import { resolve, sep } from 'path';

// `/dev/null` is a harmless standard stream target commonly used by
// read-only inspection commands (`2>/dev/null`). It is not workspace access.
const DEV_NULL = /^\/?dev\/null(?:\b|["'])/;

function isInside(candidate: string, rootPath: string): boolean {
  const resolvedRoot = resolve(rootPath);
  return (
    candidate === resolvedRoot || candidate.startsWith(`${resolvedRoot}${sep}`)
  );
}

/** Absolute paths in the command that point outside the workspace root. */
export function referencesOutsideWorkspace(
  command: string,
  rootPath: string,
): boolean {
  const absolutePaths: string[] =
    command.match(/(?:^|[\s])\/(?:[^\s"']+)/g) ?? [];

  return absolutePaths.some((value) => {
    const candidatePath = value.trim();
    if (DEV_NULL.test(candidatePath)) return false;
    return !isInside(resolve(candidatePath), rootPath);
  });
}

function pathTokens(command: string): string[] {
  return command.split(/[\s'"=<>;&|()]+/).filter(Boolean);
}

/**
 * Wider than `referencesOutsideWorkspace`: also home paths (`~`) and
 * relative paths that climb out of the root (`../x`). Used to rate risk,
 * not to decide whether a command asks.
 */
export function touchesOutsideWorkspace(
  command: string,
  rootPath: string,
): boolean {
  if (referencesOutsideWorkspace(command, rootPath)) return true;

  return pathTokens(command).some((token) => {
    if (token.startsWith('~')) return true;
    if (!token.split('/').includes('..')) return false;
    return !isInside(resolve(rootPath, token), rootPath);
  });
}
