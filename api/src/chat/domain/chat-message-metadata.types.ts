import type { ModelUsage } from 'src/llm/domain/model-usage.types';
import type { TokenUsage } from 'src/llm/domain/token-usage.types';

/** A model call made for the turn besides the main loop. */
export type ExtraUsage = ModelUsage & { source: 'subagent' | 'compaction' };

/** `message.metadata` of an assistant message, sent with the UI stream. */
export type ChatMessageMetadata = {
  /** `provider:model` that produced the turn. */
  model: string;
  /** Main model only, all steps summed. Set on `finish`. */
  usage?: TokenUsage;
  /**
   * Tokens the conversation occupies after this turn: the last step's input
   * plus its output. The next request starts its estimate from here.
   */
  contextTokens?: number;
  /** Subagent runs and context summaries of this turn, each with its own model. */
  extraUsage?: ExtraUsage[];
  /** USD of the whole turn, extras included; absent when no price is known. */
  costUsd?: number;
};
