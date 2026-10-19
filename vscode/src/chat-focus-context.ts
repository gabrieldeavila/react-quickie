import * as vscode from 'vscode';

/**
 * True while focus is inside the Doty webview. `focusedView` isn't set for
 * webview views, so keybindings for the chat (⌘/Ctrl+N) use this instead.
 */
export const CHAT_FOCUSED_CONTEXT = 'doty.chatFocused';

export function setChatFocusedContext(focused: boolean): void {
  void vscode.commands.executeCommand('setContext', CHAT_FOCUSED_CONTEXT, focused);
}
