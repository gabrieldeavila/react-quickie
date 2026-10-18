import * as vscode from 'vscode';
import { PROVIDER_KEYS } from '../domain/provider-keys';
import type { ProviderSecrets } from '../secrets';

/** "Doty: Set API key": pick a provider, type the key (empty removes it). */
export async function setApiKey(secrets: ProviderSecrets): Promise<void> {
  const items = await Promise.all(
    PROVIDER_KEYS.map(async (provider) => ({
      label: provider.label,
      description: (await secrets.has(provider.id)) ? 'configurada' : undefined,
      id: provider.id,
    })),
  );

  const picked = await vscode.window.showQuickPick(items, {
    title: 'Doty: provedor da chave',
  });
  if (!picked) return;

  const value = await vscode.window.showInputBox({
    title: `Doty: chave ${picked.label}`,
    prompt: 'Deixe vazio para remover a chave.',
    password: true,
    ignoreFocusOut: true,
  });
  if (value === undefined) return;

  // The API restarts through SecretStorage.onDidChange (see extension.ts).
  await secrets.set(picked.id, value);
  void vscode.window.showInformationMessage(
    value.trim() ? `Doty: chave ${picked.label} salva.` : `Doty: chave ${picked.label} removida.`,
  );
}
