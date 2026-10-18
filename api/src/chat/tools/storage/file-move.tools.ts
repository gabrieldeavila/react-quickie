import { tool } from 'ai';
import { z } from 'zod/v4';
import { formatToolError } from 'src/common/agents/tools/shared/format-tool-error';
import type { FileWriteService } from 'src/common/helpers/storage/file-write.service';

const renamePathInputSchema = z.object({
  currentPath: z.string().describe('Current path of the file or folder'),
  newPath: z.string().describe('New path of the file or folder'),
});

const movePathInputSchema = z.object({
  sourcePath: z.string().describe('Current path of the file or folder'),
  destinationPath: z
    .string()
    .describe('Destination path of the file or folder'),
});

export function createFileMoveTools(files: FileWriteService) {
  return {
    rename_file_or_folder: tool({
      description: 'Renames an existing file or folder',
      inputSchema: renamePathInputSchema,
      execute: async ({
        currentPath,
        newPath,
      }: z.infer<typeof renamePathInputSchema>) => {
        try {
          await files.renamePath(currentPath, newPath);
          return `Renamed "${currentPath}" to "${newPath}".`;
        } catch (error) {
          return formatToolError('rename the item', error);
        }
      },
    }),
    move_file_or_folder: tool({
      description: 'Moves a file or folder to another path',
      inputSchema: movePathInputSchema,
      execute: async ({
        sourcePath,
        destinationPath,
      }: z.infer<typeof movePathInputSchema>) => {
        try {
          await files.movePath(sourcePath, destinationPath);
          return `Moved "${sourcePath}" to "${destinationPath}".`;
        } catch (error) {
          return formatToolError('move the item', error);
        }
      },
    }),
  };
}
