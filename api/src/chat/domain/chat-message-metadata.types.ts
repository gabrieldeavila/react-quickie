import type { TokenUsage } from 'src/llm/domain/token-usage.types';

/** `message.metadata` of an assistant message, sent with the UI stream. */
export type ChatMessageMetadata = {
  /** `provider:model` that produced the turn. */
  model: string;
  /** Whole turn, all steps summed. Set on `finish`. */
  usage?: TokenUsage;
  /**
   * Tokens the conversation occupies after this turn: the last step's input
   * plus its output. The next request starts its estimate from here.
   */
  contextTokens?: number;
  /** USD; absent when the model has no fixed pricing. */
  costUsd?: number;
};
