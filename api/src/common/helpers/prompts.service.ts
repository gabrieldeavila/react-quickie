import { Injectable } from '@nestjs/common';
import { Instructions, ModelMessage } from 'ai';
import { LoggerService } from './logger.service';

@Injectable()
export class PromptsService {
  constructor(private loggerService: LoggerService) {}

  async getInstructions(): Promise<Instructions> {
    const logs = await this.loggerService.getLogs();

    return [
      {
        role: 'system',
        content: `Você é um assistente de desenvolvimento de software especializado em React, Next.js e Tailwind CSS.`,
      },
      {
        role: 'system',
        content: `These are the previous decisions taken by you: ${logs}`,
      },
    ];
  }
}
