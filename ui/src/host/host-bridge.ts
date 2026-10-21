import {
  parseHostMessage,
  type HostToWebviewMessage,
  type WebviewToHostMessage,
} from "./domain/host-messages";
import { isVscodeHost } from "./runtime-config";

type VsCodeApi = { postMessage(message: WebviewToHostMessage): void };

declare global {
  function acquireVsCodeApi(): VsCodeApi;
}

export type HostBridge = {
  canOpenFiles: boolean;
  openFile(path: string, line?: number, root?: string): void;
  /** Subscribes to editor messages; returns the unsubscribe function. */
  onMessage(handler: (message: HostToWebviewMessage) => void): () => void;
  notifyReady(): void;
  /** Shows the active conversation title in the editor's view title bar. */
  setTitle(title: string): void;
  /** Tells the editor whether focus is inside the chat, for its keybindings. */
  setFocused(focused: boolean): void;
  /** Opens a scope's mcp.json in the editor (VSCode only, like openFile). */
  openMcpConfig(scope: "global" | "project", root?: string): void;
  /**
   * Opens a web page in the user's browser. A browser may block the tab
   * (no user gesture after an await), so callers also show the link.
   */
  openExternal(url: string): void;
};

const browserHost: HostBridge = {
  canOpenFiles: false,
  openFile: () => {},
  onMessage: () => () => {},
  notifyReady: () => {},
  setTitle: () => {},
  setFocused: () => {},
  openMcpConfig: () => {},
  openExternal: (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  },
};

function createVscodeHost(): HostBridge {
  // acquireVsCodeApi may only be called once per webview.
  const vscode = acquireVsCodeApi();

  return {
    canOpenFiles: true,
    openFile: (path, line, root) =>
      vscode.postMessage({ type: "openFile", path, line, root }),
    onMessage: (handler) => {
      const listener = (event: MessageEvent) => {
        const message = parseHostMessage(event.data);
        if (message) handler(message);
      };
      window.addEventListener("message", listener);
      return () => window.removeEventListener("message", listener);
    },
    notifyReady: () => vscode.postMessage({ type: "ready" }),
    setTitle: (title) => vscode.postMessage({ type: "setTitle", title }),
    setFocused: (focused) => vscode.postMessage({ type: "setFocus", focused }),
    openMcpConfig: (scope, root) =>
      vscode.postMessage({ type: "openMcpConfig", scope, root }),
    openExternal: (url) => vscode.postMessage({ type: "openExternal", url }),
  };
}

let host: HostBridge | null = null;

export function getHostBridge(): HostBridge {
  host ??= isVscodeHost() ? createVscodeHost() : browserHost;
  return host;
}
