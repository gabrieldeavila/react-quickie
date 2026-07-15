import {
  createOpenAI,
  OpenAILanguageModelResponsesOptions,
} from '@ai-sdk/openai';
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
import { ChatService } from './chat.service';
import { PromptsService } from 'src/common/helpers/prompts.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import { glob } from 'fast-glob';
import * as fs from 'fs/promises';

// Transforma a função baseada em callbacks do Node em uma Promise moderna
const execAsync = promisify(exec);
@Controller('chat')
export class ChatController {
  constructor(
    private configService: ConfigService,
    private readonly promptsService: PromptsService,
    private readonly chatService: ChatService,
  ) {}

  @Get()
  async getHello(@Res() res: Response) {
    const files = await glob(
      `/Users/gabrielavila/code/react-quickie/projects/osguris/**/*`,
      {
        ignore: ['**/node_modules/**', '**/.git/**'], // Pula o que não interessa
        absolute: true,
      },
    );

    const matches: any[] = [];
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes('guri de uruguaiana')) {
        matches.push(file);
      }
    }

    const matchedFiles = matches.map((file) =>
      file.replace(
        '/Users/gabrielavila/code/react-quickie/projects/osguris/',
        '',
      ),
    );
    res.status(200).send({ success: true, files: matchedFiles });
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

    const model = openai('gpt-5.4-mini');
    const result = streamText({
      model,
      messages: validMessages,
      tools: this.chatService.getTools(),
      instructions: this.promptsService.getInstructions(),
      stopWhen: isStepCount(5),
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({ stream: result.stream }),
    });
  }
}
