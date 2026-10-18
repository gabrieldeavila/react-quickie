import type { TextStreamPart, ToolSet } from 'ai';
import { addTokenUsage } from 'src/llm/domain/add-token-usage';
import { estimateCost } from 'src/llm/domain/estimate-cost';
import type { ModelPricing } from 'src/llm/domain/model-catalog.types';
import { toTokenUsage } from 'src/llm/domain/to-token-usage';
import type { TokenUsage } from 'src/llm/domain/token-usage.types';
import type { ChatMessageMetadata } from './chat-message-metadata.types';
import type { CarriedUsage } from './read-carried-usage';

type TrackedTurn = {
  ref: string;
  pricing?: ModelPricing;
  /** Usage of the same turn before a tool approval (see `readCarriedUsage`). */
  carried?: CarriedUsage;
};

function addCost(a: number | undefined, b: number | undefined) {
  return a === undefined && b === undefined ? undefined : (a ?? 0) + (b ?? 0);
}

/**
 * The `messageMetadata` callback of `toUIMessageStream`. It sees every stream
 * part: `start` sends the model, `finish-step` remembers that step's usage
 * (the context size), and `finish` sends the turn's totals and cost.
 */
export function createMessageMetadataTracker({
  ref,
  pricing,
  carried,
}: TrackedTurn) {
  let lastStep: TokenUsage | undefined;

  return ({
    part,
  }: {
    part: TextStreamPart<ToolSet>;
  }): ChatMessageMetadata | undefined => {
    switch (part.type) {
      case 'start':
        return { model: ref };
      case 'finish-step':
        lastStep = toTokenUsage(part.usage);
        return undefined;
      case 'finish': {
        const usage = toTokenUsage(part.totalUsage);
        return {
          model: ref,
          usage: carried ? addTokenUsage(carried.usage, usage) : usage,
          contextTokens: lastStep
            ? lastStep.inputTokens + lastStep.outputTokens
            : undefined,
          costUsd: addCost(carried?.costUsd, estimateCost(usage, pricing)),
        };
      }
      default:
        return undefined;
    }
  };
}
