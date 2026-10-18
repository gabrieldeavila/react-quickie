import { Injectable, Logger } from '@nestjs/common';
import {
  convertToModelMessages,
  generateText,
  type Instructions,
  type ModelMessage,
  type ToolSet,
  type UIMessage,
} from 'ai';
import { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import type { SelectedModel } from 'src/llm/domain/find-model';
import type { ModelUsage } from 'src/llm/domain/model-usage.types';
import { priceUsage } from 'src/llm/domain/price-usage';
import { toTokenUsage } from 'src/llm/domain/to-token-usage';
import { buildSummaryPrompt } from '../domain/build-summary-prompt';
import { estimateTokens } from '../domain/estimate-tokens';
import { fitContext, type FittedContext } from '../domain/fit-context';

type FitInput = {
  model: SelectedModel;
  uiMessages: UIMessage[];
  modelMessages: ModelMessage[];
  tools: ToolSet;
  instructions: Instructions;
  previousSummary?: string;
  abortSignal: AbortSignal;
};

export type FitResult = FittedContext & {
  /** Set when this request called the summary model. */
  summaryUsage?: ModelUsage;
};

/** Runs `fitContext` with the real SDK conversion and summary model. */
@Injectable()
export class ContextCompactionService {
  private readonly logger = new Logger(ContextCompactionService.name);

  constructor(private readonly providerRegistry: ProviderRegistryService) {}

  async fit(input: FitInput): Promise<FitResult> {
    const { model, tools, previousSummary, abortSignal } = input;
    let summaryUsage: ModelUsage | undefined;
    const recordUsage = (usage: ModelUsage) => {
      summaryUsage = usage;
    };
    const fixedTokens =
      estimateTokens(input.instructions) +
      (previousSummary ? estimateTokens(previousSummary) : 0);

    const fitted = await fitContext(
      {
        uiMessages: input.uiMessages,
        modelMessages: input.modelMessages,
        contextWindow: model.model.contextWindow,
        fixedTokens,
        previousSummary,
      },
      {
        toModelMessages: (messages) =>
          convertToModelMessages(messages, { tools }),
        summarize: (older, previous) =>
          this.summarize(model, older, previous, abortSignal, recordUsage),
      },
    );
    return { ...fitted, summaryUsage };
  }

  private async summarize(
    conversationModel: SelectedModel,
    older: UIMessage[],
    previousSummary: string | undefined,
    abortSignal: AbortSignal,
    recordUsage: (usage: ModelUsage) => void,
  ): Promise<string | undefined> {
    const selected = this.providerRegistry.selectForSummary(conversationModel);
    const { instructions, prompt } = buildSummaryPrompt(older, previousSummary);

    try {
      const { text, usage } = await generateText({
        model: this.providerRegistry.languageModel(selected),
        instructions,
        prompt,
        maxRetries: this.providerRegistry.maxRetries,
        abortSignal,
      });
      recordUsage(priceUsage(selected, toTokenUsage(usage)));
      return text.trim() || undefined;
    } catch (error) {
      if (abortSignal.aborted) throw error;
      this.logger.warn(
        `Context summary with ${selected.ref} failed; sending the pruned context. ${String(error)}`,
      );
      return undefined;
    }
  }
}
