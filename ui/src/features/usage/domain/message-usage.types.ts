/** Mirrors the API's `ChatMessageMetadata` (assistant `message.metadata`). */
export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number;
};

export type ChatMessageMetadata = {
  model: string;
  usage?: TokenUsage;
  /** Tokens the conversation occupied after this turn. */
  contextTokens?: number;
  costUsd?: number;
};

export type ConversationUsage = {
  inputTokens: number;
  outputTokens: number;
  /** Undefined when no turn had a known price. */
  costUsd?: number;
  /** Turns that reported usage. */
  turns: number;
};
