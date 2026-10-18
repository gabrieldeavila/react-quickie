import type { ModelInfo, ModelRef, ProviderInfo } from './model-catalog.types';
import { formatModelRef, parseModelRef } from './parse-model-ref';

export type SelectedModel = {
  /** Normalized `provider:model`. */
  ref: string;
  provider: ModelRef['provider'];
  model: ModelInfo;
};

/** The available model a ref points to, or undefined (bad ref or no key). */
export function findModel(
  providers: ProviderInfo[],
  ref: string,
): SelectedModel | undefined {
  let parsed: ModelRef;
  try {
    parsed = parseModelRef(ref);
  } catch {
    return undefined;
  }

  const provider = providers.find((item) => item.id === parsed.provider);
  const model = provider?.models.find((item) => item.id === parsed.model);
  if (!model) return undefined;

  return { ref: formatModelRef(parsed), provider: parsed.provider, model };
}

/** The first candidate ref that is available; empty/unset candidates are skipped. */
export function firstAvailableModel(
  providers: ProviderInfo[],
  candidates: Array<string | undefined>,
): SelectedModel | undefined {
  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    const found = findModel(providers, candidate);
    if (found) return found;
  }
  return undefined;
}
