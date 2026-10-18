import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { buildWebviewHtml, type WebviewConfig } from './domain/build-webview-html';

/** Loads the built UI (`dist/ui/index.html`) and adapts it for the webview. */
export function renderAppHtml(
  webview: vscode.Webview,
  uiDir: vscode.Uri,
  config: WebviewConfig,
): string {
  const indexHtml = fs.readFileSync(vscode.Uri.joinPath(uiDir, 'index.html').fsPath, 'utf8');

  return buildWebviewHtml({
    indexHtml,
    baseUri: webview.asWebviewUri(uiDir).toString(),
    cspSource: webview.cspSource,
    nonce: randomBytes(16).toString('hex'),
    config,
  });
}
