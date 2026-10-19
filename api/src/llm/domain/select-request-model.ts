import { findModel, type SelectedModel } from './find-model';
import type { ProviderInfo } from './model-catalog.types';

export class UnknownModelError extends Error {
  constructor(requested: string) {
    super(`Model not available: "${requested}".`);
    this.name = 'UnknownModelError';
  }
}

export class NoModelConfiguredError extends Error {
  constructor() {
    super(
      'No AI provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_API_KEY or OPENAI_COMPATIBLE_BASE_URL.',
    );
    this.name = 'NoModelConfiguredError';
  }
}

/**
 * The chat body's `model`: absent → the default; present → it must be one of
 * the available models (anything else, including a non-string, is rejected).
 */
export function selectRequestModel(
  providers: ProviderInfo[],
  requested: unknown,
  defaultModel: SelectedModel | undefined,
): SelectedModel {
  if (requested === undefined || requested === null || requested === '') {
    if (!defaultModel) throw new NoModelConfiguredError();
    return defaultModel;
  }
  if (typeof requested !== 'string') {
    throw new UnknownModelError(JSON.stringify(requested) ?? typeof requested);
  }

  const found = findModel(providers, requested);
  if (!found) throw new UnknownModelError(requested);
  return found;
}
