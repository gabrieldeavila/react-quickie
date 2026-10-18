import { Injectable } from '@nestjs/common';
import {
  createUIMessageStream,
  isStepCount,
  streamText,
  type ModelMessage,
  type ToolSet,
  type UIMessage,
} from 'ai';
import { ContextService } from 'src/common/context/context.service';
import { PromptsService } from 'src/common/helpers/prompts.service';
import { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import type { SelectedModel } from 'src/llm/domain/find-model';
import type { ToolApprovalMap } from '../domain/approval-policy';
import { describeStreamError } from '../domain/describe-stream-error';
import { ApprovalSecretService } from './approval-secret.service';

const MAX_STEPS = 50;

type ChatStreamInput = {
  model: SelectedModel;
  uiMessages: UIMessage[];
  messages: ModelMessage[];
  tools: ToolSet;
  toolApproval: ToolApprovalMap;
  abortSignal: AbortSignal;
};

@Injectable()
export class ChatStreamService {
  constructor(
    private readonly providerRegistry: ProviderRegistryService,
    private readonly promptsService: PromptsService,
    private readonly contextService: ContextService,
    private readonly approvalSecretService: ApprovalSecretService,
  ) {}

  /** Runs the agent loop and returns it as a UI message stream. */
  async createStream({
    model: selected,
    uiMessages,
    messages,
    tools,
    toolApproval,
    abortSignal,
  }: ChatStreamInput) {
    const model = this.providerRegistry.languageModel(selected);
    // Models without tool support run as plain chat: no tools, no approvals.
    const agentTools = selected.model.supportsTools ? tools : {};
    const agentToolApproval = selected.model.supportsTools ? toolApproval : {};
    const instructions = await this.promptsService.getInstructions();
    const approvalSecret = await this.approvalSecretService.get();
    const requestContext = this.contextService.get();

    return createUIMessageStream({
      execute: ({ writer }) => {
        if (requestContext) {
          requestContext.emitSubagentEvent = (event) => {
            writer.write({ type: 'data-subagent', data: event });
          };
        }

        const result = streamText({
          model,
          messages,
          tools: agentTools,
          toolApproval: agentToolApproval,
          experimental_toolApprovalSecret: approvalSecret,
          instructions,
          stopWhen: isStepCount(MAX_STEPS),
          abortSignal,
        });

        writer.merge(
          result.toUIMessageStream({ onError: describeStreamError }),
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
