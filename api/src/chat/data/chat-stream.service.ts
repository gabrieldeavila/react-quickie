import { Injectable } from '@nestjs/common';
import {
  createUIMessageStream,
  isStepCount,
  streamText,
  type ModelMessage,
  type ToolSet,
  type UIMessage,
} from 'ai';
import { PromptsService } from 'src/common/helpers/prompts.service';
import { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import { applyCacheControl } from 'src/llm/domain/apply-cache-control';
import type { SelectedModel } from 'src/llm/domain/find-model';
import type { ToolApprovalMap } from '../domain/approval-policy';
import { withSummaryInstruction } from '../domain/build-summary-prompt';
import { describeStreamError } from '../domain/describe-stream-error';
import { createMessageMetadataTracker } from '../domain/message-metadata-tracker';
import { COMPACTION_DATA_TYPE } from '../domain/parse-compaction';
import { readCarriedUsage } from '../domain/read-carried-usage';
import { ApprovalSecretService } from './approval-secret.service';
import { ContextCompactionService } from './context-compaction.service';

const MAX_STEPS = 50;

type ChatStreamInput = {
  model: SelectedModel;
  uiMessages: UIMessage[];
  messages: ModelMessage[];
  tools: ToolSet;
  toolApproval: ToolApprovalMap;
  /** Summary of turns the UI no longer sends (earlier compaction). */
  summary?: string;
  abortSignal: AbortSignal;
};

@Injectable()
export class ChatStreamService {
  constructor(
    private readonly providerRegistry: ProviderRegistryService,
    private readonly promptsService: PromptsService,
    private readonly approvalSecretService: ApprovalSecretService,
    private readonly contextCompactionService: ContextCompactionService,
  ) {}

  /** Runs the agent loop and returns it as a UI message stream. */
  async createStream({
    model: selected,
    uiMessages,
    messages,
    tools,
    toolApproval,
    summary,
    abortSignal,
  }: ChatStreamInput) {
    const model = this.providerRegistry.languageModel(selected);
    // Models without tool support run as plain chat: no tools, no approvals.
    const agentTools = selected.model.supportsTools ? tools : {};
    const agentToolApproval = selected.model.supportsTools ? toolApproval : {};
    const instructions = await this.promptsService.getInstructions();
    const approvalSecret = await this.approvalSecretService.get();
    const messageMetadata = createMessageMetadataTracker({
      ref: selected.ref,
      pricing: selected.model.pricing,
      carried: readCarriedUsage(uiMessages),
    });

    return createUIMessageStream({
      execute: async ({ writer }) => {
        const fitted = await this.contextCompactionService.fit({
          model: selected,
          uiMessages,
          modelMessages: messages,
          tools,
          instructions,
          previousSummary: summary,
          abortSignal,
        });
        if (fitted.compaction) {
          writer.write({
            type: COMPACTION_DATA_TYPE,
            data: fitted.compaction,
          });
        }

        const result = streamText({
          model,
          messages: fitted.messages,
          tools: agentTools,
          toolApproval: agentToolApproval,
          experimental_toolApprovalSecret: approvalSecret,
          instructions: withSummaryInstruction(instructions, fitted.summary),
          // Each step moves the cache breakpoint to its last message, so the
          // whole tool loop reads the conversation prefix from the cache.
          prepareStep:
            selected.provider === 'anthropic'
              ? ({ instructions: stepInstructions, messages: stepMessages }) =>
                  applyCacheControl({
                    instructions: stepInstructions,
                    messages: stepMessages,
                  })
              : undefined,
          stopWhen: isStepCount(MAX_STEPS),
          abortSignal,
        });

        writer.merge(
          result.toUIMessageStream({
            onError: describeStreamError,
            messageMetadata,
          }),
        );
      },
      onError: describeStreamError,
      // Without this the stream's `start` chunk carries a fresh message id and
      // the client renames its assistant message. With it, a continuation
      // after a tool approval (last message = assistant) keeps that message's
      // id, which the UI uses as the IndexedDB key for its upsert.
      originalMessages: uiMessages,
    });
  }
}
