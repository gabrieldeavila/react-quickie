import { Injectable } from '@nestjs/common';
import { Instructions, ModelMessage } from 'ai';

@Injectable()
export class PromptsService {
  getInstructions(): Instructions {
    return [
      {
        role: 'system',
        content: `Você é um assistente de desenvolvimento de software especializado em React, Next.js e Tailwind CSS.`,
      },
    ];
  }
}
