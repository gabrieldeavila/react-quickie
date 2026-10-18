import * as vscode from 'vscode';
import {
  parseWebviewMessage,
  type InsertSelectionMessage,
  type OpenFileMessage,
} from './domain/host-messages';
import { resolveOpenFilePath } from './domain/resolve-open-file-path';
import { getWorkspaceRoots } from './workspace-roots';

/**
 * Messages from the webview (open file, ready) and to it (selection).
 * Selections sent before the UI is listening wait until it says "ready".
 */
export class HostBridge {
  private webview: vscode.Webview | undefined;
  private ready = false;
  private pending: InsertSelectionMessage[] = [];

  attach(webview: vscode.Webview): vscode.Disposable {
    this.webview = webview;
    this.ready = false;
    return webview.onDidReceiveMessage((data) => this.handle(data));
  }

  detach(): void {
    this.webview = undefined;
    this.ready = false;
  }

  /** The webview HTML was replaced; wait for the new page's "ready". */
  markReloading(): void {
    this.ready = false;
  }

  postSelection(message: InsertSelectionMessage): void {
    if (this.webview && this.ready) {
      void this.webview.postMessage(message);
    } else {
      this.pending.push(message);
    }
  }

  private handle(data: unknown): void {
    const message = parseWebviewMessage(data);
    if (message?.type === 'ready') this.flush();
    if (message?.type === 'openFile') void openFile(message);
  }

  private flush(): void {
    this.ready = true;
    const pending = this.pending;
    this.pending = [];
    for (const message of pending) void this.webview?.postMessage(message);
  }
}

async function openFile({ path, line, root }: OpenFileMessage): Promise<void> {
  const resolved = resolveOpenFilePath(path, root, getWorkspaceRoots());
  if (!resolved) {
    void vscode.window.showWarningMessage(`Doty: "${path}" está fora do workspace.`);
    return;
  }

  try {
    const position = new vscode.Position(Math.max((line ?? 1) - 1, 0), 0);
    await vscode.window.showTextDocument(vscode.Uri.file(resolved), {
      selection: line ? new vscode.Range(position, position) : undefined,
      preview: true,
    });
  } catch {
    void vscode.window.showWarningMessage(`Doty: não foi possível abrir "${path}".`);
  }
}
