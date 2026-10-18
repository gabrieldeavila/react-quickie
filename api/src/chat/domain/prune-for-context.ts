import { pruneMessages, type ModelMessage } from 'ai';

/**
 * First, cheap step when the context is too large: drop reasoning from all
 * but the last message and tool calls/results from all but the last three.
 * Only applied above the budget, so the prompt prefix (and its cache) stays
 * stable in normal turns.
 */
export function pruneForContext(messages: ModelMessage[]): ModelMessage[] {
  return pruneMessages({
    messages,
    reasoning: 'before-last-message',
    toolCalls: 'before-last-3-messages',
    emptyMessages: 'remove',
  });
}
