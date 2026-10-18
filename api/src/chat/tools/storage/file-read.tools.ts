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
      "Caminho relativo do diretório que será listado (ex: 'src/controllers', 'test/utils'). Use uma string vazia '' ou '.' para listar o diretório raiz.",
    ),
});

const readFileInputSchema = z.object({
  path: z.string().describe('Caminho do arquivo'),
  lineStart: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Linha inicial opcional para ler apenas um bloco'),
  lineEnd: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Linha final opcional para ler apenas um bloco'),
});

export function createFileReadTools(files: FileReadService) {
  return {
    list_folders: tool({
      description:
        'Lista os arquivos e subdiretórios de um caminho especificado. O sistema já opera a partir da raiz (root) do projeto de forma invisível. Forneça apenas caminhos relativos.',
      inputSchema: listFoldersInputSchema,
      execute: async ({
        parentPath,
      }: z.infer<typeof listFoldersInputSchema>) => {
        try {
          const entries = await files.listFilesInDirectory(parentPath);
          return formatListOutput(
            `Arquivos e pastas encontrados em ${parentPath || '.'}`,
            entries,
          );
        } catch (error) {
          return formatToolError('listar as pastas informadas', error);
        }
      },
    }),
    read_file: tool({
      description:
        'Lê o conteúdo de um arquivo inteiro ou apenas um bloco específico',
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
          return formatToolError('ler o arquivo solicitado', error);
        }
      },
    }),
  };
}
