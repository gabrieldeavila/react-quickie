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

/** Active conversation title, shown in the view's title bar. */
export type SetTitleMessage = { type: 'setTitle'; title: string };

/** Whether focus is inside the webview; backs the `doty.chatFocused` keybinding context. */
export type SetFocusMessage = { type: 'setFocus'; focused: boolean };

export type WebviewToHostMessage =
  | OpenFileMessage
  | ReadyMessage
  | SetTitleMessage
  | SetFocusMessage;

export type InsertSelectionMessage = {
  type: 'insertSelection';
  file: string;
  startLine: number;
  endLine: number;
  languageId: string;
  text: string;
};

/** View title-bar buttons ("New chat", "History", "Settings"). */
export type HostCommand = 'newChat' | 'showHistory' | 'openSettings';

export type RunCommandMessage = { type: 'runCommand'; command: HostCommand };

export type HostToWebviewMessage = InsertSelectionMessage | RunCommandMessage;

/** Longest title shown next to the view name; the UI has no limit of its own. */
const MAX_TITLE_LENGTH = 80;

export function parseWebviewMessage(data: unknown): WebviewToHostMessage | null {
  if (!data || typeof data !== 'object') return null;
  const message = data as Record<string, unknown>;

  if (message.type === 'ready') return { type: 'ready' };
  if (message.type === 'setTitle' && typeof message.title === 'string') {
    return { type: 'setTitle', title: message.title.trim().slice(0, MAX_TITLE_LENGTH) };
  }
  if (message.type === 'setFocus' && typeof message.focused === 'boolean') {
    return { type: 'setFocus', focused: message.focused };
  }
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
