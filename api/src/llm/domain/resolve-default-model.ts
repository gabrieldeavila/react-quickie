import { firstAvailableModel, type SelectedModel } from './find-model';
import type { LlmEnv, ProviderInfo } from './model-catalog.types';

/**
 * `DOTY_DEFAULT_MODEL` → `openai:$OPENAI_MODEL` → the first available model.
 * Undefined only when no provider has a key.
 */
export function resolveDefaultModel(
  providers: ProviderInfo[],
  env: LlmEnv,
): SelectedModel | undefined {
  const legacyOpenAI = env.OPENAI_MODEL?.trim()
    ? `openai:${env.OPENAI_MODEL.trim()}`
    : undefined;

  const configured = firstAvailableModel(providers, [
    env.DOTY_DEFAULT_MODEL,
    legacyOpenAI,
  ]);
  if (configured) return configured;

  const [provider] = providers;
  const [model] = provider?.models ?? [];
  if (!provider || !model) return undefined;

  return { ref: `${provider.id}:${model.id}`, provider: provider.id, model };
}
