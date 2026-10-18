import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { createProviderRegistry } from 'ai';
import type { LlmEnv, ProviderId } from '../domain/model-catalog.types';

type RegistryProvider = Parameters<typeof createProviderRegistry>[0][string];
type Fetch = typeof globalThis.fetch;

// The registry name of each provider must equal its catalog id: the UI
// compares it with the `providerMetadata` keys on reasoning parts.
const FACTORIES: Record<
  ProviderId,
  (env: LlmEnv, fetch?: Fetch) => RegistryProvider
> = {
  openai: (env, fetch) =>
    createOpenAI({ apiKey: env.OPENAI_API_KEY || env.OPENAI_KEY, fetch }),
  anthropic: (env, fetch) =>
    createAnthropic({ apiKey: env.ANTHROPIC_API_KEY, fetch }),
  deepseek: (env, fetch) =>
    createDeepSeek({ apiKey: env.DEEPSEEK_API_KEY, fetch }),
  'openai-compatible': (env, fetch) =>
    createOpenAICompatible({
      name: 'openai-compatible',
      baseURL: env.OPENAI_COMPATIBLE_BASE_URL ?? '',
      apiKey: env.OPENAI_COMPATIBLE_API_KEY || undefined,
      fetch,
    }),
};

/** `{ [providerId]: provider }` for `createProviderRegistry`. `fetch` is a test seam. */
export function buildRegistryProviders(
  providerIds: ProviderId[],
  env: LlmEnv,
  fetch?: Fetch,
): Record<string, RegistryProvider> {
  return Object.fromEntries(
    providerIds.map((id) => [id, FACTORIES[id](env, fetch)]),
  );
}
