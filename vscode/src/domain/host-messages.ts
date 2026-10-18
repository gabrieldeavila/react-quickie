// Messages between the webview and the extension. Mirrored in
// `ui/src/host/domain/host-messages.ts`; keep both in sync.

export type OpenFileMessage = {
  type: 'openFile';
  path: string;
  line?: number;
  /** Workspace root the path is relative to. */
  root?: string;
};

export type ReadyMessage = { type: 'ready' };

export type WebviewToHostMessage = OpenFileMessage | ReadyMessage;

export type InsertSelectionMessage = {
  type: 'insertSelection';
  file: string;
  startLine: number;
  endLine: number;
  languageId: string;
  text: string;
};

export function parseWebviewMessage(data: unknown): WebviewToHostMessage | null {
  if (!data || typeof data !== 'object') return null;
  const message = data as Record<string, unknown>;

  if (message.type === 'ready') return { type: 'ready' };
  if (message.type !== 'openFile' || typeof message.path !== 'string') {
    return null;
  }

  return {
    type: 'openFile',
    path: message.path,
    line:
      typeof message.line === 'number' && message.line > 0 ? Math.floor(message.line) : undefined,
    root: typeof message.root === 'string' ? message.root : undefined,
  };
}
