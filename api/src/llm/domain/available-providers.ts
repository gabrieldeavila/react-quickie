import type {
  LlmEnv,
  ModelInfo,
  ProviderId,
  ProviderInfo,
} from './model-catalog.types';

const hasValue = (value: string | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** Comma-separated env list → trimmed, non-empty, unique ids. */
export function parseModelList(value: string | undefined): string[] {
  if (!hasValue(value)) return [];
  const ids = value.split(',').map((id) => id.trim());
  return [...new Set(ids.filter(Boolean))];
}

/**
 * A model that is only known from env. Capabilities are conservative: tools
 * on (agent mode needs them), images and reasoning off.
 */
export const toExtraModel = (id: string): ModelInfo => ({
  id,
  label: id,
  supportsTools: true,
  supportsImages: false,
  supportsReasoning: false,
});

const EXTRA_MODEL_KEYS: Partial<Record<ProviderId, string>> = {
  openai: 'OPENAI_MODEL',
  'openai-compatible': 'OPENAI_COMPATIBLE_MODELS',
};

function withExtraModels(provider: ProviderInfo, env: LlmEnv): ProviderInfo {
  const key = EXTRA_MODEL_KEYS[provider.id];
  const known = new Set(provider.models.map((model) => model.id));
  const extras = parseModelList(key ? env[key] : undefined)
    .filter((id) => !known.has(id))
    .map(toExtraModel);

  return { ...provider, models: [...provider.models, ...extras] };
}

/** Providers whose key is configured, each with its env-listed extra models. */
export function availableProviders(
  catalog: ProviderInfo[],
  env: LlmEnv,
): ProviderInfo[] {
  return catalog
    .filter((provider) => provider.envKeys.some((key) => hasValue(env[key])))
    .map((provider) => withExtraModels(provider, env))
    .filter((provider) => provider.models.length > 0);
}
