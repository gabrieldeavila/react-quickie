import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { pipeUIMessageStreamToResponse, type ToolSet } from 'ai';
import { type Response } from 'express';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import type { SelectedModel } from 'src/llm/domain/find-model';
import {
  NoModelConfiguredError,
  UnknownModelError,
} from 'src/llm/domain/select-request-model';
import { ChatService } from '../chat.service';
import { ChatStreamService } from '../data/chat-stream.service';
import { InvalidChatMessagesError } from '../domain/invalid-chat-messages.error';
import { parseCompaction } from '../domain/parse-compaction';
import { prepareChatMessages } from '../domain/prepare-chat-messages';
import { readInstructionIds } from '../domain/read-instruction-ids';

/** Doty's request validation errors become 400; anything else is rethrown. */
function toBadRequest(error: unknown): unknown {
  return error instanceof InvalidChatMessagesError
    ? new BadRequestException(error.message)
    : error;
}

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const body = req.body as Record<string, unknown>;

    return {
      root: body.root as string | undefined,
      instructionIds: readInstructionIds(body.instructions),
    };
  }),
)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatStreamService: ChatStreamService,
    private readonly contextService: ContextService,
    private readonly providerRegistry: ProviderRegistryService,
  ) {}

  @Post()
  async chat(
    @Body() body: { messages?: unknown; model?: unknown; compaction?: unknown },
    @Res() res: Response,
  ) {
    const model = this.selectModel(body.model);
    const compaction = this.parseCompaction(body.compaction);
    const { tools, toolApproval } = await this.chatService.getToolkit();
    const { uiMessages, modelMessages } = await this.prepareMessages(
      body.messages,
      tools,
    );
    const abortSignal = this.abortOnClientClose(res);

    const stream = await this.chatStreamService.createStream({
      model,
      uiMessages,
      messages: modelMessages,
      tools,
      toolApproval,
      summary: compaction?.summary,
      abortSignal,
    });

    pipeUIMessageStreamToResponse({ response: res, stream });
  }

  /** Validates `body.model` and records it for subagents of this request. */
  private selectModel(requested: unknown): SelectedModel {
    let selected: SelectedModel;
    try {
      selected = this.providerRegistry.select(requested);
    } catch (error) {
      if (error instanceof UnknownModelError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof NoModelConfiguredError) {
        throw new InternalServerErrorException(error.message);
      }
      throw error;
    }

    const requestContext = this.contextService.get();
    if (requestContext) requestContext.modelRef = selected.ref;
    return selected;
  }

  private async prepareMessages(raw: unknown, tools: ToolSet) {
    try {
      return await prepareChatMessages(raw, tools);
    } catch (error) {
      throw toBadRequest(error);
    }
  }

  private parseCompaction(raw: unknown) {
    try {
      return parseCompaction(raw);
    } catch (error) {
      throw toBadRequest(error);
    }
  }

  private abortOnClientClose(res: Response): AbortSignal {
    const abortController = new AbortController();
    const abort = () => {
      if (!res.writableEnded) abortController.abort();
    };

    res.once('close', abort);
    const requestContext = this.contextService.get();
    if (requestContext) requestContext.abortGeneration = abort;

    return abortController.signal;
  }
}
