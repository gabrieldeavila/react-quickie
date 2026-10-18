import { addTokenUsage } from './add-token-usage';
import { estimateCost } from './estimate-cost';
import type { SelectedModel } from './find-model';
import type { ModelUsage } from './model-usage.types';
import { sumCosts } from './sum-costs';
import type { TokenUsage } from './token-usage.types';

export function priceUsage(
  selected: Pick<SelectedModel, 'ref' | 'model'>,
  usage: TokenUsage,
): ModelUsage {
  return {
    model: selected.ref,
    usage,
    costUsd: estimateCost(usage, selected.model.pricing),
  };
}

/** Adds another call of the same model to a running total. */
export function addModelUsage(
  total: ModelUsage | undefined,
  next: ModelUsage,
): ModelUsage {
  if (!total) return next;
  return {
    model: total.model,
    usage: addTokenUsage(total.usage, next.usage),
    costUsd: sumCosts([total.costUsd, next.costUsd]),
  };
}
