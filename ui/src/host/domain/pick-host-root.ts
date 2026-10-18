/**
 * In the browser any stored root is kept. When the host opened workspace
 * folders, the root must be one of them (the first one by default).
 */
export function pickHostRoot(stored: string, hostRoots: string[]): string {
  if (hostRoots.length === 0) return stored;
  return hostRoots.includes(stored) ? stored : hostRoots[0];
}
