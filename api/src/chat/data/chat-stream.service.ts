import { createOpenAI } from '@ai-sdk/openai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import type { ToolApprovalMap } from '../domain/approval-policy';
import { describeStreamError } from '../domain/describe-stream-error';
import { ApprovalSecretService } from './approval-secret.service';

const MAX_STEPS = 50;

type ChatStreamInput = {
  uiMessages: UIMessage[];
  messages: ModelMessage[];
  tools: ToolSet;
  toolApproval: ToolApprovalMap;
  abortSignal: AbortSignal;
};

@Injectable()
export class ChatStreamService {
  constructor(
    private readonly configService: ConfigService,
    private readonly promptsService: PromptsService,
    private readonly contextService: ContextService,
    private readonly approvalSecretService: ApprovalSecretService,
  ) {}

  /** Runs the agent loop and returns it as a UI message stream. */
  async createStream({
    uiMessages,
    messages,
    tools,
    toolApproval,
    abortSignal,
  }: ChatStreamInput) {
    const model = this.resolveModel();
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
          tools,
          toolApproval,
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

  private resolveModel() {
    const modelName = this.configService.get<string>('OPENAI_MODEL');
    if (!modelName) {
      throw new InternalServerErrorException(
        'A variável OPENAI_MODEL não está configurada.',
      );
    }
    const apiKey = this.configService.get<string>('OPENAI_KEY');
    return createOpenAI({ apiKey })(modelName);
  }
}
