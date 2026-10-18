import * as vscode from 'vscode';

/** Local folders of the open workspace (the API's allowed roots). */
export function getWorkspaceRoots(): string[] {
  return (vscode.workspace.workspaceFolders ?? [])
    .filter((folder) => folder.uri.scheme === 'file')
    .map((folder) => folder.uri.fsPath);
}
