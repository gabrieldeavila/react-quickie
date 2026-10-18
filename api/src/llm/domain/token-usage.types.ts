/** Token counts of one call or turn; missing provider values count as 0. */
export type TokenUsage = {
  /** All input tokens, cached ones included. */
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** Part of `outputTokens`. */
  reasoningTokens: number;
};
