import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { pipeUIMessageStreamToResponse } from 'ai';
import { type Response } from 'express';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { ChatService } from '../chat.service';
import { ChatStreamService } from '../data/chat-stream.service';
import { InvalidChatMessagesError } from '../domain/invalid-chat-messages.error';
import { prepareChatMessages } from '../domain/prepare-chat-messages';

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const body = req.body as Record<string, unknown>;

    return {
      root: body.root as string | undefined,
      mode: body.chatMode as string | undefined,
      specialty: body.chatSpecialty as string | undefined,
    };
  }),
)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatStreamService: ChatStreamService,
    private readonly contextService: ContextService,
  ) {}

  @Post()
  async chat(@Body() body: { messages?: unknown }, @Res() res: Response) {
    const tools = this.chatService.getTools();
    const { uiMessages, modelMessages } = await this.prepareMessages(
      body.messages,
      tools,
    );
    const abortSignal = this.abortOnClientClose(res);

    const stream = await this.chatStreamService.createStream({
      uiMessages,
      messages: modelMessages,
      tools,
      toolApproval: this.chatService.getToolApproval(),
      abortSignal,
    });

    pipeUIMessageStreamToResponse({ response: res, stream });
  }

  private async prepareMessages(
    raw: unknown,
    tools: ReturnType<ChatService['getTools']>,
  ) {
    try {
      return await prepareChatMessages(raw, tools);
    } catch (error) {
      if (error instanceof InvalidChatMessagesError) {
        throw new BadRequestException(error.message);
      }
      throw error;
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
