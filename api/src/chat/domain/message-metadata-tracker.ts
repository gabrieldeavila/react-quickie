import type { TextStreamPart, ToolSet } from 'ai';
import { addTokenUsage } from 'src/llm/domain/add-token-usage';
import { estimateCost } from 'src/llm/domain/estimate-cost';
import type { ModelPricing } from 'src/llm/domain/model-catalog.types';
import { sumCosts } from 'src/llm/domain/sum-costs';
import { toTokenUsage } from 'src/llm/domain/to-token-usage';
import type { TokenUsage } from 'src/llm/domain/token-usage.types';
import { readSubagentUsage } from 'src/subagents/domain/read-subagent-usage';
import type {
  ChatMessageMetadata,
  ExtraUsage,
} from './chat-message-metadata.types';
import type { CarriedUsage } from './read-carried-usage';

type TrackedTurn = {
  ref: string;
  pricing?: ModelPricing;
  /** Usage of the same turn before a tool approval (see `readCarriedUsage`). */
  carried?: CarriedUsage;
  /** Calls made before the stream started (a context summary). */
  extraUsage?: ExtraUsage[];
  /** Filled while the stream runs (approval checks); read on `finish`. */
  lateUsage?: readonly ExtraUsage[];
};

/**
 * The `messageMetadata` callback of `toUIMessageStream`. It sees every stream
 * part: `start` sends the model, `finish-step` remembers that step's usage
 * (the context size), a final `run_subagent` result adds the subagent's
 * usage, and `finish` sends the turn's totals and cost.
 */
export function createMessageMetadataTracker({
  ref,
  pricing,
  carried,
  extraUsage = [],
  lateUsage = [],
}: TrackedTurn) {
  let lastStep: TokenUsage | undefined;
  const extras = [...extraUsage];

  const finish = (totalUsage: TokenUsage): ChatMessageMetadata => {
    const turnExtras = [...extras, ...lateUsage];
    const allExtras = [...(carried?.extraUsage ?? []), ...turnExtras];
    return {
      model: ref,
      usage: carried ? addTokenUsage(carried.usage, totalUsage) : totalUsage,
      contextTokens: lastStep
        ? lastStep.inputTokens + lastStep.outputTokens
        : undefined,
      extraUsage: allExtras.length > 0 ? allExtras : undefined,
      // The carried cost already includes the carried extras.
      costUsd: sumCosts([
        carried?.costUsd,
        estimateCost(totalUsage, pricing),
        ...turnExtras.map((extra) => extra.costUsd),
      ]),
    };
  };

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
      case 'tool-result': {
        const subagent = readSubagentUsage(part);
        if (subagent) extras.push({ source: 'subagent', ...subagent });
        return undefined;
      }
      case 'finish':
        return finish(toTokenUsage(part.totalUsage));
      default:
        return undefined;
    }
  };
}
