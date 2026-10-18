import type { ModelInfo, ProviderInfo } from './model-catalog.types';

// Hand-picked current models (checked 2026-10-17 against each provider's model
// page). Models listed only in env vars are added by `availableProviders`.

const ONE_MILLION = 1_000_000;

const claude = (
  id: string,
  label: string,
  pricing: ModelInfo['pricing'],
): ModelInfo => ({
  id,
  label,
  contextWindow: ONE_MILLION,
  supportsTools: true,
  supportsImages: true,
  supportsReasoning: true,
  pricing,
});

const gpt = (
  id: string,
  label: string,
  pricing: ModelInfo['pricing'],
): ModelInfo => ({
  id,
  label,
  contextWindow: 1_050_000,
  supportsTools: true,
  supportsImages: true,
  supportsReasoning: true,
  pricing,
});

// DeepSeek prices change between peak and off-peak hours, so no fixed pricing.
// `@ai-sdk/deepseek@3.0.7` sends user messages as text only, so no images.
// Ids keep the `deepseek-v4` prefix: that provider version only replays
// `reasoning_content` (needed with tool calls) for ids containing it.
const deepseek = (id: string, label: string): ModelInfo => ({
  id,
  label,
  contextWindow: ONE_MILLION,
  supportsTools: true,
  supportsImages: false,
  supportsReasoning: true,
});

export const PROVIDER_CATALOG: ProviderInfo[] = [
  {
    id: 'anthropic',
    label: 'Anthropic',
    envKeys: ['ANTHROPIC_API_KEY'],
    models: [
      claude('claude-opus-5-5', 'Claude Opus 5.5', {
        inputPerMTok: 4,
        outputPerMTok: 20,
        cacheReadPerMTok: 0.2,
        cacheWritePerMTok: 5,
      }),
      claude('claude-sonnet-5-5', 'Claude Sonnet 5.5', {
        inputPerMTok: 2,
        outputPerMTok: 10,
        cacheReadPerMTok: 0.2,
        cacheWritePerMTok: 2.5,
      }),
      claude('claude-haiku-5-5', 'Claude Haiku 5.5', {
        inputPerMTok: 0.1,
        outputPerMTok: 0.5,
        cacheWritePerMTok: 0.125,
      }),
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    envKeys: ['OPENAI_API_KEY', 'OPENAI_KEY'],
    models: [
      gpt('gpt-6.1-sol', 'GPT-6.1 Sol', { inputPerMTok: 2, outputPerMTok: 10 }),
      gpt('gpt-6-astra', 'GPT-6 Astra', {
        inputPerMTok: 10,
        outputPerMTok: 50,
      }),
      gpt('gpt-6-luna', 'GPT-6 Luna', {
        inputPerMTok: 0.1,
        outputPerMTok: 0.5,
      }),
    ],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    envKeys: ['DEEPSEEK_API_KEY'],
    models: [
      deepseek('deepseek-v4-pro', 'DeepSeek V4 Pro'),
      deepseek('deepseek-v4-flash', 'DeepSeek V4 Flash'),
    ],
  },
  {
    id: 'openai-compatible',
    label: 'OpenAI-compatible',
    // Local servers (Ollama, LM Studio) often need no key, only the URL.
    envKeys: ['OPENAI_COMPATIBLE_BASE_URL'],
    models: [],
  },
];
