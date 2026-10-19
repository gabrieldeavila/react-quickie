import * as path from 'path';
import { isPathInside } from './is-path-inside';
import { WorkspaceEscapeError } from './workspace-escape.error';

/**
 * Resolves `input` (relative to `root`, or absolute inside it) into an
 * absolute path. Lexical check only; symlinks are checked in `data/`.
 */
export function resolveWorkspacePath(
  root: string,
  input: string | undefined,
  deniedPaths: string[] = [],
): string {
  const value = (input ?? '').trim() || '.';
  const candidate = path.isAbsolute(value)
    ? path.resolve(value)
    : path.resolve(root, value);

  if (!isPathInside(root, candidate)) {
    throw new WorkspaceEscapeError(value);
  }

  if (deniedPaths.some((denied) => isPathInside(denied, candidate))) {
    throw new WorkspaceEscapeError(value, 'in a protected folder');
  }

  return candidate;
}
