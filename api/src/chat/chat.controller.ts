import { createOpenAI } from '@ai-sdk/openai';
import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
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
import { MarkdownService } from 'src/common/helpers/markdown.module';
import { ProjectService } from 'src/common/helpers/project.service';
import { PromptsService } from 'src/common/helpers/prompts.service';
import { ChatService } from './chat.service';
import { TsCheckerService } from 'src/common/helpers/tschecker.service';
import { StorageService } from 'src/common/helpers/storage.service';

@UseInterceptors(
  BuildContextInterceptor((req) => ({
    root: req.body?.root,
    mode: req.body?.chatMode,
    specialty: req.body?.chatSpecialty,
  })),
)
@Controller('chat')
export class ChatController {
  constructor(
    private configService: ConfigService,
    private readonly promptsService: PromptsService,
    private readonly chatService: ChatService,
    private readonly markdownService: MarkdownService,
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
    private readonly tsCheckerService: TsCheckerService,
  ) {}

  @Get()
  async getChat() {
    return await this.storageService.editFile(
      'src/components/ChatInterface.tsx',

      `export function ChatInterface(): React.JSX.Element {
`,
  `export function ChatInterface(): React.JSX.Element {
`,
    );

    return {
      message: 'Chat endpoint is working!',
      content: await this.markdownService.getMarkdownFile(
        '../.agents/skills/awwwards-hero/SKILL',
      ).html,
    };
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
      stopWhen: isStepCount(25),
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  }
}
