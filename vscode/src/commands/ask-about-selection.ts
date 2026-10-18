import * as vscode from 'vscode';
import { DOTY_VIEW_ID } from '../doty-view-provider';
import type { HostBridge } from '../host-bridge';

/** "Doty: Ask about selection": sends the selection to the composer. */
export async function askAboutSelection(bridge: HostBridge): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    void vscode.window.showInformationMessage('Doty: selecione um trecho de código primeiro.');
    return;
  }

  const { document, selection } = editor;
  await vscode.commands.executeCommand(`${DOTY_VIEW_ID}.focus`);

  bridge.postSelection({
    type: 'insertSelection',
    file: vscode.workspace.asRelativePath(document.uri, false),
    startLine: selection.start.line + 1,
    endLine: selection.end.line + 1,
    languageId: document.languageId,
    text: document.getText(selection),
  });
}
