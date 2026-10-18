import * as vscode from 'vscode';
import { ApiProcess } from './api-process';
import { askAboutSelection } from './commands/ask-about-selection';
import { setApiKey } from './commands/set-api-key';
import { DOTY_VIEW_ID, DotyViewProvider } from './doty-view-provider';
import { HostBridge } from './host-bridge';
import { ProviderSecrets } from './secrets';
import { readSettings, SETTINGS_SECTION } from './settings';
import { getWorkspaceRoots } from './workspace-roots';

let api: ApiProcess | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const log = vscode.window.createOutputChannel('Doty');
  const secrets = new ProviderSecrets(context.secrets);
  const distDir = vscode.Uri.joinPath(context.extensionUri, 'dist');
  const apiDir = vscode.Uri.joinPath(distDir, 'api');

  api = new ApiProcess({
    entry: vscode.Uri.joinPath(apiDir, 'main.js').fsPath,
    apiBaseDir: apiDir.fsPath,
    dataDir: context.globalStorageUri.fsPath,
    readRuntimeInput: async () => ({
      workspaceRoots: getWorkspaceRoots(),
      providerKeys: await secrets.readEnv(),
      settings: readSettings(),
    }),
    log,
  });

  const bridge = new HostBridge();
  const view = new DotyViewProvider(vscode.Uri.joinPath(distDir, 'ui'), api, bridge);
  // Explicit restarts reload the UI too (new keys → new model list).
  const restartApi = async () => {
    await api?.restart();
    view.render(true);
  };

  context.subscriptions.push(
    log,
    api,
    vscode.window.registerWebviewViewProvider(DOTY_VIEW_ID, view, {
      // Keeps a streaming answer alive while the view is hidden.
      webviewOptions: { retainContextWhenHidden: true },
    }),
    api.onDidChangeStatus(() => view.render()),
    vscode.commands.registerCommand('doty.setApiKey', () => setApiKey(secrets)),
    vscode.commands.registerCommand('doty.askAboutSelection', () => askAboutSelection(bridge)),
    vscode.commands.registerCommand('doty.restartApi', restartApi),
    vscode.commands.registerCommand('doty.showLogs', () => log.show()),
    secrets.onDidChange(() => void restartApi()),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(SETTINGS_SECTION)) void restartApi();
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(restartApi),
  );

  void api.start();
}

export async function deactivate(): Promise<void> {
  await api?.stop();
}
