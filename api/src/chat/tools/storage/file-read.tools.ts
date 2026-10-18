import { tool } from 'ai';
import { z } from 'zod/v4';
import { formatToolError } from 'src/common/agents/tools/shared/format-tool-error';
import type { FileReadService } from 'src/common/helpers/storage/file-read.service';
import { capFileContent } from 'src/workspace/domain/cap-file-content';
import { formatListOutput } from './format-storage-output';

const listFoldersInputSchema = z.object({
  parentPath: z
    .string()
    .describe(
      "Relative path of the folder to list (e.g. 'src/controllers', 'test/utils'). Use an empty string '' or '.' to list the root folder.",
    ),
});

const readFileInputSchema = z.object({
  path: z.string().describe('File path'),
  lineStart: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Optional first line, to read only a block'),
  lineEnd: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Optional last line, to read only a block'),
});

export function createFileReadTools(files: FileReadService) {
  return {
    list_folders: tool({
      description:
        'Lists the files and subfolders of a path. Paths are already resolved from the project root, so pass relative paths only.',
      inputSchema: listFoldersInputSchema,
      execute: async ({
        parentPath,
      }: z.infer<typeof listFoldersInputSchema>) => {
        try {
          const entries = await files.listFilesInDirectory(parentPath);
          return formatListOutput(
            `Files and folders in ${parentPath || '.'}`,
            entries,
          );
        } catch (error) {
          return formatToolError('list the given folders', error);
        }
      },
    }),
    read_file: tool({
      description: 'Reads a whole file, or only a specific block of lines',
      inputSchema: readFileInputSchema,
      execute: async ({
        path,
        lineStart,
        lineEnd,
      }: z.infer<typeof readFileInputSchema>) => {
        try {
          const content = await files.readFile(path, lineStart, lineEnd);
          return capFileContent(content);
        } catch (error) {
          return formatToolError('read the requested file', error);
        }
      },
    }),
  };
}
