import { createOpenAI } from '@ai-sdk/openai';
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  isStepCount,
  ModelMessage,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
} from 'ai';
import { type Response } from 'express';
import { PromptsService } from 'src/common/helpers/prompts.service';
import { ChatService } from './chat.service';
import { LoggerService } from 'src/common/helpers/logger.service';

@Controller('chat')
export class ChatController {
  constructor(
    private configService: ConfigService,
    private readonly promptsService: PromptsService,
    private readonly chatService: ChatService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get()
  async getChat() {
    this.loggerService.logDecision(
      'Read the file /Users/gabrielavila/code/react-quickie/projects/novo-projeto/app/layout.tsx \n',
    );
    this.loggerService.logDecision(
      'Read the file /Users/gabrielavila/code/react-quickie/projects/novo-projeto/app/layout.tsx \n',
    );
    return { message: 'Chat endpoint is working!' };
  }

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

    const instructions = await this.promptsService.getInstructions();

    const model = openai('gpt-5.4-mini');
    const result = streamText({
      model,
      messages: validMessages,
      tools: this.chatService.getTools(),
      instructions,
      stopWhen: isStepCount(5),
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  }
}
