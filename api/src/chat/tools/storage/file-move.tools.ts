import { tool } from 'ai';
import { z } from 'zod/v4';
import { formatToolError } from 'src/common/agents/tools/shared/format-tool-error';
import type { FileWriteService } from 'src/common/helpers/storage/file-write.service';

const renamePathInputSchema = z.object({
  currentPath: z.string().describe('Caminho atual do arquivo ou diretório'),
  newPath: z.string().describe('Novo caminho do arquivo ou diretório'),
});

const movePathInputSchema = z.object({
  sourcePath: z.string().describe('Caminho atual do arquivo ou diretório'),
  destinationPath: z
    .string()
    .describe('Caminho de destino do arquivo ou diretório'),
});

export function createFileMoveTools(files: FileWriteService) {
  return {
    rename_file_or_folder: tool({
      description: 'Renomeia um arquivo ou diretório existente',
      inputSchema: renamePathInputSchema,
      execute: async ({
        currentPath,
        newPath,
      }: z.infer<typeof renamePathInputSchema>) => {
        try {
          await files.renamePath(currentPath, newPath);
          return `Elemento "${currentPath}" renomeado para "${newPath}" com sucesso.`;
        } catch (error) {
          return formatToolError('renomear o item', error);
        }
      },
    }),
    move_file_or_folder: tool({
      description: 'Move um arquivo ou diretório para outro caminho',
      inputSchema: movePathInputSchema,
      execute: async ({
        sourcePath,
        destinationPath,
      }: z.infer<typeof movePathInputSchema>) => {
        try {
          await files.movePath(sourcePath, destinationPath);
          return `Elemento "${sourcePath}" movido para "${destinationPath}" com sucesso.`;
        } catch (error) {
          return formatToolError('mover o item', error);
        }
      },
    }),
  };
}
