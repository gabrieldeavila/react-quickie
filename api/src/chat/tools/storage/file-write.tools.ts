import { tool } from 'ai';
import { z } from 'zod/v4';
import { formatToolError } from 'src/common/agents/tools/shared/format-tool-error';
import type { FileWriteService } from 'src/common/helpers/storage/file-write.service';

const createFileInputSchema = z.object({
  name: z.string().describe('File name'),
  content: z.string().describe('File content'),
});

const editFileInputSchema = z.object({
  name: z
    .string()
    .describe(
      "Relative path of the file to edit (e.g. 'src/utils/format.ts').",
    ),
  oldContent: z
    .string()
    .describe(
      'The exact code block, which must occur exactly once in the file. It must match the current content exactly.',
    ),
  newContent: z
    .string()
    .describe('The new code or text that replaces the given block.'),
});

const overwriteFileInputSchema = z.object({
  name: z
    .string()
    .describe(
      "Relative path of the file to overwrite (e.g. 'src/utils/format.ts').",
    ),
  newContent: z.string().describe('The new full content of the file.'),
});

const deleteFileInputSchema = z.object({
  name: z.string().describe('File name'),
});

export function createFileWriteTools(files: FileWriteService) {
  return {
    create_file: tool({
      description: 'Creates a new file',
      inputSchema: createFileInputSchema,
      execute: async ({
        name,
        content,
      }: z.infer<typeof createFileInputSchema>) => {
        try {
          await files.createFile(name, content || '');
          return `Created file "${name}".`;
        } catch (error) {
          return formatToolError('create the file', error);
        }
      },
    }),
    edit_file: tool({
      description:
        'Edits an existing file by replacing only the exact code block in oldContent. Always prefer this over overwriting the whole file.',
      inputSchema: editFileInputSchema,
      inputExamples: [
        {
          input: {
            name: 'PATH/FILE_NAME.extension',
            oldContent: `@media (min-width: 768px) {`,
            newContent: `@media (prefers-reduced-motion: reduce) {`,
          },
        },
      ],
      execute: async ({
        name,
        oldContent,
        newContent,
      }: z.infer<typeof editFileInputSchema>) => {
        try {
          await files.replaceContentInFile(name, oldContent, newContent);
          return `Edited file "${name}".`;
        } catch (error) {
          return formatToolError('edit the file', error);
        }
      },
    }),
    overwrite_file: tool({
      description:
        'Overwrites the whole content of an existing file. Use it only when a targeted edit to a code block is not possible.',
      inputSchema: overwriteFileInputSchema,
      execute: async ({
        name,
        newContent,
      }: z.infer<typeof overwriteFileInputSchema>) => {
        try {
          await files.overwriteFile(name, newContent);
          return `Overwrote file "${name}".`;
        } catch (error) {
          return formatToolError('overwrite the file', error);
        }
      },
    }),
    delete_file: tool({
      description:
        'Deletes an existing file. Only do this when you are sure the file should go, because it cannot be undone.',
      inputSchema: deleteFileInputSchema,
      execute: async ({ name }: z.infer<typeof deleteFileInputSchema>) => {
        try {
          await files.deleteFile(name);
          return `Deleted file "${name}".`;
        } catch (error) {
          return formatToolError('delete the file', error);
        }
      },
    }),
  };
}
