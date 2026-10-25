/** Mirrors the API's `ChatMessageMetadata` (assistant `message.metadata`). */
export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number;
};

/** A model call made for the turn besides the main loop. */
export type ExtraUsage = {
  source: "subagent" | "compaction" | "approval";
  model: string;
  usage: TokenUsage;
  costUsd?: number;
};

export type ChatMessageMetadata = {
  model: string;
  /** Main model only. */
  usage?: TokenUsage;
  /** Tokens the conversation occupied after this turn. */
  contextTokens?: number;
  /** Subagents, context summaries and approval checks, each priced by its own model. */
  extraUsage?: ExtraUsage[];
  /** Whole turn, extras included. */
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
