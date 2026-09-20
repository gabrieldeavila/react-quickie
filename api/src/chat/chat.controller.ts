import { createOpenAI } from '@ai-sdk/openai';
import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createUIMessageStream,
  isStepCount,
  ModelMessage,
  pipeUIMessageStreamToResponse,
  streamText,
} from 'ai';
import { type Response } from 'express';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
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
    private readonly contextService: ContextService,
  ) {}

  @Post()
  async chat(
    @Body() body: { messages?: Array<ModelMessage> },
    @Res() res: Response,
  ) {
    const abortController = new AbortController();
    const abortUpstreamRequest = () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    };

    res.once('close', abortUpstreamRequest);

    const requestContext = this.contextService.get();
    if (requestContext) {
      requestContext.abortGeneration = abortUpstreamRequest;
    }

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
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        if (requestContext) {
          requestContext.emitSubagentEvent = (event) => {
            writer.write({ type: 'data-subagent', data: event });
          };
        }

        const result = streamText({
          model,
          messages: validMessages,
          tools: this.chatService.getTools(),
          instructions,
          stopWhen: [
            isStepCount(50),
            ({ steps }) =>
              steps.length > 0 &&
              Boolean(this.contextService.get()?.bashApprovalPending),
          ],
          abortSignal: abortController.signal,
        });

        writer.merge(result.toUIMessageStream());
      },
      onError: () => 'Não foi possível concluir a resposta do agente.',
    });

    pipeUIMessageStreamToResponse({ response: res, stream });
  }
}
