import * as vscode from 'vscode';
import type { ApiProcess } from './api-process';
import { buildLoadingHtml } from './domain/build-loading-html';
import type { HostBridge } from './host-bridge';
import { renderAppHtml } from './webview-html';
import { getWorkspaceRoots } from './workspace-roots';

export const DOTY_VIEW_ID = 'doty.chatView';

/** The sidebar view: a placeholder until the API is up, then the Doty UI. */
export class DotyViewProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;
  /** Key of what is on screen, so a restart on the same port doesn't reload it. */
  private renderedKey: string | undefined;

  constructor(
    private readonly uiDir: vscode.Uri,
    private readonly api: ApiProcess,
    private readonly bridge: HostBridge,
  ) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    this.renderedKey = undefined;
    view.webview.options = { enableScripts: true, localResourceRoots: [this.uiDir] };

    const messages = this.bridge.attach(view.webview);
    view.onDidDispose(() => {
      messages.dispose();
      this.bridge.detach();
      this.view = undefined;
    });

    this.render();
  }

  /** `force` reloads the UI even if the API URL didn't change (new roots). */
  render(force = false): void {
    if (!this.view) return;
    const status = this.api.status;
    const roots = getWorkspaceRoots();

    if (roots.length === 0) {
      this.show('empty', buildLoadingHtml('Abra uma pasta para usar o Doty.'));
    } else if (status.state === 'ready') {
      if (force) this.renderedKey = undefined;
      this.show(`app:${status.apiUrl}`, () =>
        renderAppHtml(this.view!.webview, this.uiDir, {
          apiUrl: status.apiUrl,
          token: status.token,
          roots,
          host: 'vscode',
        }),
      );
    } else if (status.state === 'failed') {
      this.show(`failed:${status.message}`, buildLoadingHtml(status.message));
    } else if (!this.renderedKey?.startsWith('app:')) {
      // Keep the app on screen during a crash restart: same port and token.
      this.show('starting', buildLoadingHtml('Iniciando o Doty…'));
    }
  }

  private show(key: string, html: string | (() => string)): void {
    if (!this.view || this.renderedKey === key) return;
    this.renderedKey = key;
    this.bridge.markReloading();
    this.view.webview.html = typeof html === 'string' ? html : html();
  }
}
