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

export type WebviewToHostMessage = OpenFileMessage | ReadyMessage;

export type InsertSelectionMessage = {
  type: "insertSelection";
  file: string;
  startLine: number;
  endLine: number;
  languageId: string;
  text: string;
};

export type HostToWebviewMessage = InsertSelectionMessage;

export function isInsertSelectionMessage(
  data: unknown,
): data is InsertSelectionMessage {
  if (!data || typeof data !== "object") return false;
  const message = data as Record<string, unknown>;

  return (
    message.type === "insertSelection" &&
    typeof message.file === "string" &&
    typeof message.text === "string" &&
    typeof message.startLine === "number" &&
    typeof message.endLine === "number"
  );
}
