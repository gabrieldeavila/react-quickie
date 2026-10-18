import type { TokenUsage } from './token-usage.types';

/** Usage of calls to one model, priced with that model's catalog entry. */
export type ModelUsage = {
  /** `provider:model`. */
  model: string;
  usage: TokenUsage;
  /** USD; absent when the model has no fixed pricing. */
  costUsd?: number;
};
