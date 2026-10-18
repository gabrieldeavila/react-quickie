import type { ConfigService } from '@nestjs/config';
import type { LlmEnv } from '../domain/model-catalog.types';

const LLM_ENV_KEYS = [
  'OPENAI_API_KEY',
  'OPENAI_KEY',
  'OPENAI_MODEL',
  'ANTHROPIC_API_KEY',
  'DEEPSEEK_API_KEY',
  'OPENAI_COMPATIBLE_BASE_URL',
  'OPENAI_COMPATIBLE_API_KEY',
  'OPENAI_COMPATIBLE_MODELS',
  'DOTY_DEFAULT_MODEL',
  'DOTY_SUBAGENT_MODEL',
  'DOTY_SUMMARY_MODEL',
  'DOTY_MAX_RETRIES',
] as const;

/** Snapshot of the env vars the LLM rules read (from `.env` files and the process). */
export function readLlmEnv(config: ConfigService): LlmEnv {
  return Object.fromEntries(
    LLM_ENV_KEYS.map((key) => [key, config.get<string>(key)]),
  );
}
