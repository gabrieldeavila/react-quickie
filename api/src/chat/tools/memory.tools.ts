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
    .describe('Root of the current project, as received in the request.'),
  topics: memoryTopicsSchema.describe(
    'Memory objects grouped by topic, all kept in a single file.',
  ),
});

export function createMemoryTools(memoryService: MemoryService) {
  return {
    save_project_memory: tool({
      description:
        'Saves the current project memory to a single file with multiple topics.',
      inputSchema: saveMemoryInputSchema,
      execute: async ({
        project_root,
        topics,
      }: z.infer<typeof saveMemoryInputSchema>) => {
        try {
          console.log('saving project memory');

          const memory = await memoryService.saveProjectMemory(
            project_root,
            topics,
          );
          return JSON.stringify(memory, null, 2);
        } catch (error) {
          console.log('failed to save project memory');
          return formatToolError('save the project memory', error);
        }
      },
    }),
  };
}
