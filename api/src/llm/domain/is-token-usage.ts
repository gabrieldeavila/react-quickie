import type { TokenUsage } from './token-usage.types';

const USAGE_KEYS: Array<keyof TokenUsage> = [
  'inputTokens',
  'outputTokens',
  'cacheReadTokens',
  'cacheWriteTokens',
  'reasoningTokens',
];

export const isCost = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function isTokenUsage(value: unknown): value is TokenUsage {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return USAGE_KEYS.every((key) => isCost(record[key]));
}
