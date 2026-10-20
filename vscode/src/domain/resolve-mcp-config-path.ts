import * as path from 'path';

export const MCP_CONFIG_FILE = 'mcp.json';

function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/**
 * The mcp.json a scope reads, as the API does: `<dataDir>/mcp.json` (global)
 * or `<root>/.doty/mcp.json` (project). Null when the project root isn't
 * inside a workspace folder.
 */
export function resolveMcpConfigPath(
  scope: 'global' | 'project',
  root: string | undefined,
  dataDir: string,
  workspaceFolders: string[],
): string | null {
  if (scope === 'global') return path.join(dataDir, MCP_CONFIG_FILE);
  if (!root || !workspaceFolders.some((folder) => isInside(folder, root))) return null;
  return path.join(root, '.doty', MCP_CONFIG_FILE);
}
