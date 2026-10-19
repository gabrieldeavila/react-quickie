import * as vscode from 'vscode';
import type { HostCommand } from '../domain/host-messages';
import { DOTY_VIEW_ID } from '../doty-view-provider';
import type { HostBridge } from '../host-bridge';

/** Title-bar buttons of the chat view: shows the view, then lets the UI act. */
export async function runViewCommand(bridge: HostBridge, command: HostCommand): Promise<void> {
  await vscode.commands.executeCommand(`${DOTY_VIEW_ID}.focus`);
  bridge.post({ type: 'runCommand', command });
}
