import {
  isInsertSelectionMessage,
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
};

const browserHost: HostBridge = {
  canOpenFiles: false,
  openFile: () => {},
  onMessage: () => () => {},
  notifyReady: () => {},
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
        if (isInsertSelectionMessage(event.data)) handler(event.data);
      };
      window.addEventListener("message", listener);
      return () => window.removeEventListener("message", listener);
    },
    notifyReady: () => vscode.postMessage({ type: "ready" }),
  };
}

let host: HostBridge | null = null;

export function getHostBridge(): HostBridge {
  host ??= isVscodeHost() ? createVscodeHost() : browserHost;
  return host;
}
