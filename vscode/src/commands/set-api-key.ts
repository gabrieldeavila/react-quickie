import * as vscode from 'vscode';
import { PROVIDER_KEYS } from '../domain/provider-keys';
import type { ProviderSecrets } from '../secrets';

/** "Doty: Set API key": pick a provider, type the key (empty removes it). */
export async function setApiKey(secrets: ProviderSecrets): Promise<void> {
  const items = await Promise.all(
    PROVIDER_KEYS.map(async (provider) => ({
      label: provider.label,
      description: (await secrets.has(provider.id)) ? 'configured' : undefined,
      id: provider.id,
    })),
  );

  const picked = await vscode.window.showQuickPick(items, {
    title: 'Doty: key provider',
  });
  if (!picked) return;

  const value = await vscode.window.showInputBox({
    title: `Doty: ${picked.label} key`,
    prompt: 'Leave empty to remove the key.',
    password: true,
    ignoreFocusOut: true,
  });
  if (value === undefined) return;

  // The API restarts through SecretStorage.onDidChange (see extension.ts).
  await secrets.set(picked.id, value);
  void vscode.window.showInformationMessage(
    value.trim() ? `Doty: ${picked.label} key saved.` : `Doty: ${picked.label} key removed.`,
  );
}
