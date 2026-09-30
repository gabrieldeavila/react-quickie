import { createOpenAI } from '@ai-sdk/openai';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  convertToModelMessages,
  createUIMessageStream,
  isStepCount,
  pipeUIMessageStreamToResponse,
  streamText,
  type UIMessage,
} from 'ai';
import { type Response } from 'express';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { PromptsService } from 'src/common/helpers/prompts.service';
import { ChatService } from './chat.service';
import { parseMessages } from './helpers/parse-messages.helper';

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
    private configService: ConfigService,
    private readonly promptsService: PromptsService,
    private readonly chatService: ChatService,
    private readonly contextService: ContextService,
  ) {}

  @Post()
  async chat(@Body() body: { messages?: unknown }, @Res() res: Response) {
    let validMessages: UIMessage[];
    let modelMessages;
    try {
      validMessages = parseMessages(body.messages);
      modelMessages = await convertToModelMessages(validMessages);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        'Não foi possível processar as mensagens enviadas.',
      );
    }

    const modelEnv = this.configService.get<string>('OPENAI_MODEL');
    if (!modelEnv) {
      throw new InternalServerErrorException(
        'A variável OPENAI_MODEL não está configurada.',
      );
    }

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

    const openai = createOpenAI({
      apiKey,
    });

    if (modelMessages.length === 0) {
      throw new BadRequestException(
        'Nenhuma mensagem válida encontrada na requisição.',
      );
    }

    const instructions = await this.promptsService.getInstructions();

    const model = openai(modelEnv);
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        if (requestContext) {
          requestContext.emitSubagentEvent = (event) => {
            writer.write({ type: 'data-subagent', data: event });
          };
        }

        const result = streamText({
          model,
          messages: modelMessages,
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
