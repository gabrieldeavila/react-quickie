import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { ContextService } from 'src/common/context/context.service';
import z from 'zod';

@Injectable()
export class OiToolsService {
  constructor(private readonly contextService: ContextService) {}

  createTools() {
    return {
      base_template: tool({
        description: 'Example',
        inputSchema: z.object({
          number: z
            .number()
            .optional()
            .default(5)
            .describe('A field description'),
        }),
        execute: ({ number }: { number: number }) => {
          // do your thing :)

          return number;
        },
      }),
    };
  }
}
