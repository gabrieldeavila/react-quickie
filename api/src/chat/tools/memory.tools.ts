import { tool } from 'ai';
import { MemoryService } from 'src/common/helpers/memory.service';
import { z } from 'zod/v4';
import { formatToolError } from 'src/common/agents/tools/shared/format-tool-error';

const memoryTopicsSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(z.string(), z.unknown()),
    z.array(
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.record(z.string(), z.unknown()),
      ]),
    ),
  ]),
);

const saveMemoryInputSchema = z.object({
  project_root: z
    .string()
    .describe('Root do projeto atual recebido na requisição.'),
  topics: memoryTopicsSchema.describe(
    'Objetos de memória organizados por tópico, todos centralizados em um único arquivo.',
  ),
});

export function createMemoryTools(memoryService: MemoryService) {
  return {
    save_project_memory: tool({
      description:
        'Salva memória centralizada do projeto atual em um único arquivo com múltiplos tópicos.',
      inputSchema: saveMemoryInputSchema,
      execute: async ({
        project_root,
        topics,
      }: z.infer<typeof saveMemoryInputSchema>) => {
        try {
          console.log('vamos salvar a memoria');

          const memory = await memoryService.saveProjectMemory(
            project_root,
            topics,
          );
          return JSON.stringify(memory, null, 2);
        } catch (error) {
          console.log('erro ao salvar a memoria');
          return formatToolError('salvar a memória do projeto', error);
        }
      },
    }),
  };
}
