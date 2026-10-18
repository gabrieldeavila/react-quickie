import type { ModelMessage, UIMessage } from 'ai';
import {
  estimateContextTokens,
  estimateTokens,
  scaleEstimate,
} from './estimate-tokens';
import { findCompactionCut, isOverContextBudget } from './find-compaction-cut';
import type { ContextCompaction } from './parse-compaction';
import { pruneForContext } from './prune-for-context';

export type FitContextInput = {
  uiMessages: UIMessage[];
  modelMessages: ModelMessage[];
  /** Undefined for models with an unknown window: nothing is reduced. */
  contextWindow: number | undefined;
  /** Instructions (and an existing summary) not part of the messages. */
  fixedTokens: number;
  previousSummary?: string;
};

export type FitContextDeps = {
  toModelMessages(messages: UIMessage[]): Promise<ModelMessage[]>;
  /** Undefined when summarizing failed; the pruned context is used then. */
  summarize(
    older: UIMessage[],
    previousSummary?: string,
  ): Promise<string | undefined>;
};

export type FittedContext = {
  messages: ModelMessage[];
  /** Summary to send as an instruction (new, or the one the UI sent). */
  summary?: string;
  /** Set when this request summarized older turns. */
  compaction?: ContextCompaction;
};

/**
 * Keeps the request under ~75% of the context window: prune old reasoning
 * and tool calls first; if that's not enough, summarize the older turns.
 */
export async function fitContext(
  input: FitContextInput,
  deps: FitContextDeps,
): Promise<FittedContext> {
  const { uiMessages, modelMessages, contextWindow, previousSummary } = input;
  const unchanged = { messages: modelMessages, summary: previousSummary };
  if (!contextWindow) return unchanged;

  const estimate = estimateContextTokens({
    messages: uiMessages,
    fixedTokens: input.fixedTokens,
  });
  if (!isOverContextBudget(estimate, contextWindow)) return unchanged;

  const pruned = pruneForContext(modelMessages);
  const prunedEstimate = scaleEstimate(
    estimate,
    estimateTokens(modelMessages),
    estimateTokens(pruned),
  );
  const prunedContext = { messages: pruned, summary: previousSummary };
  if (!isOverContextBudget(prunedEstimate, contextWindow)) {
    return prunedContext;
  }

  const cut = findCompactionCut(uiMessages);
  if (!cut) return prunedContext;

  const summary = await deps.summarize(cut.older, previousSummary);
  if (!summary) return prunedContext;

  return {
    messages: pruneForContext(await deps.toModelMessages(cut.recent)),
    summary,
    compaction: { summary, upToMessageId: cut.upToMessageId },
  };
}
