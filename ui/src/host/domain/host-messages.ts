// Messages between the webview and the VSCode extension. Mirrored in
// `vscode/src/domain/host-messages.ts`; keep both in sync.

export type OpenFileMessage = {
  type: "openFile";
  path: string;
  line?: number;
  /** Workspace root the path is relative to. */
  root?: string;
};

export type ReadyMessage = { type: "ready" };

/** Active conversation title, shown in the view's title bar. */
export type SetTitleMessage = { type: "setTitle"; title: string };

/** Whether focus is inside the webview; backs the editor's `doty.chatFocused` keybinding context. */
export type SetFocusMessage = { type: "setFocus"; focused: boolean };

export type WebviewToHostMessage =
  | OpenFileMessage
  | ReadyMessage
  | SetTitleMessage
  | SetFocusMessage;

export type InsertSelectionMessage = {
  type: "insertSelection";
  file: string;
  startLine: number;
  endLine: number;
  languageId: string;
  text: string;
};

/** View title-bar buttons ("New chat", "History", "Settings"). */
export const HOST_COMMANDS = ["newChat", "showHistory", "openSettings"] as const;
export type HostCommand = (typeof HOST_COMMANDS)[number];

export type RunCommandMessage = { type: "runCommand"; command: HostCommand };

export type HostToWebviewMessage = InsertSelectionMessage | RunCommandMessage;

function isInsertSelection(message: Record<string, unknown>): boolean {
  return (
    message.type === "insertSelection" &&
    typeof message.file === "string" &&
    typeof message.text === "string" &&
    typeof message.startLine === "number" &&
    typeof message.endLine === "number"
  );
}

function isHostCommand(value: unknown): value is HostCommand {
  return HOST_COMMANDS.includes(value as HostCommand);
}

export function parseHostMessage(data: unknown): HostToWebviewMessage | null {
  if (!data || typeof data !== "object") return null;
  const message = data as Record<string, unknown>;

  if (isInsertSelection(message)) return message as InsertSelectionMessage;
  if (message.type === "runCommand" && isHostCommand(message.command)) {
    return { type: "runCommand", command: message.command };
  }
  return null;
}
