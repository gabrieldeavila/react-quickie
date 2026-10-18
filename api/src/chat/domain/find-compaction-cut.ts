import type { UIMessage } from 'ai';

/** Above this share of the model's context window, the context is reduced. */
export const CONTEXT_BUDGET_RATIO = 0.75;
/** User turns (a user message and everything after it) never summarized. */
export const KEEP_RECENT_TURNS = 2;

export function isOverContextBudget(
  tokens: number,
  contextWindow: number,
): boolean {
  return tokens > contextWindow * CONTEXT_BUDGET_RATIO;
}

export type CompactionCut = {
  /** Summarized. */
  older: UIMessage[];
  /** Sent as-is; always starts with a user message. */
  recent: UIMessage[];
  /** Last summarized message; the UI sends only the messages after it. */
  upToMessageId: string;
};

/**
 * Splits the conversation at a user-turn boundary, keeping the last
 * `keepTurns` turns. Undefined when there is nothing older to summarize.
 */
export function findCompactionCut(
  messages: UIMessage[],
  keepTurns = KEEP_RECENT_TURNS,
): CompactionCut | undefined {
  const userIndexes = messages.flatMap((message, index) =>
    message.role === 'user' ? [index] : [],
  );
  if (userIndexes.length <= keepTurns) return undefined;

  const cut = userIndexes[userIndexes.length - keepTurns];
  if (cut === 0) return undefined;

  return {
    older: messages.slice(0, cut),
    recent: messages.slice(cut),
    upToMessageId: messages[cut - 1].id,
  };
}
