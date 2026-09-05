import { createOpenAI } from '@ai-sdk/openai';
import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  isStepCount,
  ModelMessage,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
} from 'ai';
import { type Response } from 'express';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { PromptsService } from 'src/common/helpers/prompts.service';
import { ChatService } from './chat.service';

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const body = req.body as Record<string, unknown>;

    return {
      root: body.root as string | undefined,
      mode: body.chatMode as string | undefined,
      specialty: body.chatSpecialty as string | undefined,
      planningModeEnabled: body.planningModeEnabled as boolean | undefined,
    };
  }),
)
@Controller('chat')
export class ChatController {
  constructor(
    private configService: ConfigService,
    private readonly promptsService: PromptsService,
    private readonly chatService: ChatService,
  ) {}

  @Post()
  async chat(
    @Body() body: { messages?: Array<ModelMessage> },
    @Res() res: Response,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_KEY');
    const modelEnv = this.configService.get<string>('OPENAI_MODEL');

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

    const model = openai(modelEnv!);
    const result = streamText({
      model,
      messages: validMessages,
      tools: this.chatService.getTools(),
      instructions,
      stopWhen: isStepCount(50),
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  }
}
