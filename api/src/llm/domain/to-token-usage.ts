import type { LanguageModelUsage } from 'ai';
import type { TokenUsage } from './token-usage.types';

/** The SDK's usage (optional fields per provider) → plain numbers. */
export function toTokenUsage(usage: LanguageModelUsage): TokenUsage {
  return {
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    cacheReadTokens: usage.inputTokenDetails?.cacheReadTokens ?? 0,
    cacheWriteTokens: usage.inputTokenDetails?.cacheWriteTokens ?? 0,
    reasoningTokens: usage.outputTokenDetails?.reasoningTokens ?? 0,
  };
}
