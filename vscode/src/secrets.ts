import type * as vscode from 'vscode';
import { PROVIDER_KEYS, secretKeyFor, type ProviderKeyId } from './domain/provider-keys';

/** Provider API keys in VSCode SecretStorage (OS keychain). */
export class ProviderSecrets {
  constructor(private readonly storage: vscode.SecretStorage) {}

  get onDidChange(): vscode.Event<vscode.SecretStorageChangeEvent> {
    return this.storage.onDidChange;
  }

  async set(id: ProviderKeyId, value: string): Promise<void> {
    if (value.trim()) {
      await this.storage.store(secretKeyFor(id), value.trim());
    } else {
      await this.storage.delete(secretKeyFor(id));
    }
  }

  async has(id: ProviderKeyId): Promise<boolean> {
    return Boolean(await this.storage.get(secretKeyFor(id)));
  }

  /** Env var name → key, for every provider. */
  async readEnv(): Promise<Record<string, string | undefined>> {
    const entries = await Promise.all(
      PROVIDER_KEYS.map(
        async (provider) =>
          [provider.envVar, await this.storage.get(secretKeyFor(provider.id))] as const,
      ),
    );
    return Object.fromEntries(entries);
  }
}
