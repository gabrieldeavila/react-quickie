export type DotyClient = 'vscode' | 'web';

/** `DOTY_CLIENT` env var → the interface Doty runs in (default: web). */
export function resolveDotyClient(value: string | undefined): DotyClient {
  return value?.trim().toLowerCase() === 'vscode' ? 'vscode' : 'web';
}
