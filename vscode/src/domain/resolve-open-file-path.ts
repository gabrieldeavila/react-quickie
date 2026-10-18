import * as path from 'path';

function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/**
 * Absolute path for a file link from the webview, or null when it points
 * outside every workspace folder. Relative paths resolve against `root`
 * (when it is a workspace folder or inside one), else the first folder.
 */
export function resolveOpenFilePath(
  input: string,
  root: string | undefined,
  workspaceFolders: string[],
): string | null {
  if (workspaceFolders.length === 0) return null;

  const base =
    root && workspaceFolders.some((folder) => isInside(folder, root)) ? root : workspaceFolders[0];
  const resolved = path.resolve(base, input);

  return workspaceFolders.some((folder) => isInside(folder, resolved)) ? resolved : null;
}
