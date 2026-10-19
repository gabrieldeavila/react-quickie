import * as vscode from 'vscode';
import {
  parseWebviewMessage,
  type HostToWebviewMessage,
  type OpenFileMessage,
} from './domain/host-messages';
import { setChatFocusedContext } from './chat-focus-context';
import { resolveOpenFilePath } from './domain/resolve-open-file-path';
import { getWorkspaceRoots } from './workspace-roots';

/**
 * Messages from the webview (open file, ready, title, focus) and to it (selection,
 * title-bar commands). Messages sent before the UI is listening wait until it
 * says "ready".
 */
export class HostBridge {
  private view: vscode.WebviewView | undefined;
  private ready = false;
  private pending: HostToWebviewMessage[] = [];

  attach(view: vscode.WebviewView): vscode.Disposable {
    this.view = view;
    this.ready = false;
    return view.webview.onDidReceiveMessage((data) => this.handle(data));
  }

  detach(): void {
    this.view = undefined;
    this.ready = false;
    setChatFocusedContext(false);
  }

  /** The webview HTML was replaced; wait for the new page's "ready". */
  markReloading(): void {
    this.ready = false;
    if (this.view) this.view.description = undefined;
    setChatFocusedContext(false);
  }

  post(message: HostToWebviewMessage): void {
    if (this.view && this.ready) {
      void this.view.webview.postMessage(message);
    } else {
      this.pending.push(message);
    }
  }

  private handle(data: unknown): void {
    const message = parseWebviewMessage(data);
    if (message?.type === 'ready') this.flush();
    if (message?.type === 'openFile') void openFile(message);
    if (message?.type === 'setTitle' && this.view) this.view.description = message.title;
    if (message?.type === 'setFocus') setChatFocusedContext(message.focused);
  }

  private flush(): void {
    this.ready = true;
    const pending = this.pending;
    this.pending = [];
    for (const message of pending) void this.view?.webview.postMessage(message);
  }
}

async function openFile({ path, line, root }: OpenFileMessage): Promise<void> {
  const resolved = resolveOpenFilePath(path, root, getWorkspaceRoots());
  if (!resolved) {
    void vscode.window.showWarningMessage(`Doty: "${path}" is outside the workspace.`);
    return;
  }

  try {
    const position = new vscode.Position(Math.max((line ?? 1) - 1, 0), 0);
    await vscode.window.showTextDocument(vscode.Uri.file(resolved), {
      selection: line ? new vscode.Range(position, position) : undefined,
      preview: true,
    });
  } catch {
    void vscode.window.showWarningMessage(`Doty: couldn't open "${path}".`);
  }
}
