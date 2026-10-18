export const PROVIDER_IDS = [
  'openai',
  'anthropic',
  'deepseek',
  'openai-compatible',
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export type ModelPricing = {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheReadPerMTok?: number;
  /** Anthropic bills cache writes above the input price; unset = input price. */
  cacheWritePerMTok?: number;
};

export type ModelInfo = {
  id: string;
  label: string;
  contextWindow?: number;
  supportsTools: boolean;
  supportsImages: boolean;
  supportsReasoning: boolean;
  /** Left out when the price isn't fixed or isn't known (no cost is shown). */
  pricing?: ModelPricing;
};

export type ProviderInfo = {
  id: ProviderId;
  label: string;
  /** The provider is available when any of these env vars is set. */
  envKeys: string[];
  models: ModelInfo[];
};

/** `provider:model` split into its parts. */
export type ModelRef = { provider: ProviderId; model: string };

export type LlmEnv = Record<string, string | undefined>;
