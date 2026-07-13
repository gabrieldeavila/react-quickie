import {
  createOpenAI,
  OpenAILanguageModelResponsesOptions,
} from '@ai-sdk/openai';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ModelMessage,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
} from 'ai';
import { type Response } from 'express';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  @Post()
  async chat(
    @Body() body: { messages?: Array<ModelMessage> },
    @Res() res: Response,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_KEY');

    const openai = createOpenAI({
      apiKey,
    });

    const validMessages =
      body.messages?.filter(
        (m) => m.content !== undefined && m.content !== null,
      ) || [];

    if (validMessages.length === 0) {
      res.status(400).send('Nenhuma mensagem válida encontrada na requisição.');
      return;
    }

    const model = openai('gpt-5.4-mini');
    const result = streamText({
      model,
      messages: body.messages || [],
      tools: this.chatService.getTools(),
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  }
}
