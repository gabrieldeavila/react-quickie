import type { ModelPricing } from './model-catalog.types';
import type { TokenUsage } from './token-usage.types';

const PER_MILLION = 1_000_000;

/**
 * Usage × catalog pricing, in USD. Cached reads and writes use their own
 * price when the catalog has one, otherwise the input price. Undefined when
 * the model has no fixed pricing.
 */
export function estimateCost(
  usage: TokenUsage,
  pricing: ModelPricing | undefined,
): number | undefined {
  if (!pricing) return undefined;

  const uncachedInput = Math.max(
    0,
    usage.inputTokens - usage.cacheReadTokens - usage.cacheWriteTokens,
  );
  const total =
    uncachedInput * pricing.inputPerMTok +
    usage.cacheReadTokens * (pricing.cacheReadPerMTok ?? pricing.inputPerMTok) +
    usage.cacheWriteTokens *
      (pricing.cacheWritePerMTok ?? pricing.inputPerMTok) +
    usage.outputTokens * pricing.outputPerMTok;

  return total / PER_MILLION;
}
