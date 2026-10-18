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

/** Runs `fitContext` with the real SDK conversion and summary model. */
@Injectable()
export class ContextCompactionService {
  private readonly logger = new Logger(ContextCompactionService.name);

  constructor(private readonly providerRegistry: ProviderRegistryService) {}

  fit(input: FitInput): Promise<FittedContext> {
    const { model, tools, previousSummary, abortSignal } = input;
    const fixedTokens =
      estimateTokens(input.instructions) +
      (previousSummary ? estimateTokens(previousSummary) : 0);

    return fitContext(
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
          this.summarize(model, older, previous, abortSignal),
      },
    );
  }

  private async summarize(
    conversationModel: SelectedModel,
    older: UIMessage[],
    previousSummary: string | undefined,
    abortSignal: AbortSignal,
  ): Promise<string | undefined> {
    const selected = this.providerRegistry.selectForSummary(conversationModel);
    const { instructions, prompt } = buildSummaryPrompt(older, previousSummary);

    try {
      const { text } = await generateText({
        model: this.providerRegistry.languageModel(selected),
        instructions,
        prompt,
        abortSignal,
      });
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
