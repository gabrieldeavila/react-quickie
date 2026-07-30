import { tool, zodSchema } from 'ai';
import { StorageService } from 'src/common/helpers/storage.service';
import { z } from 'zod/v4';

export function createStorageTools(storageService: StorageService) {
  return {
    list_folders: tool({
      description: 'Lista os diretórios no caminho especificado',
      inputSchema: z.object({
        parentPath: z.string().describe('Caminho do diretório pai'),
      }),
      inputExamples: [
        {
          input: {
            parentPath: 'landing-pages',
          },
        },
        {
          input: {
            parentPath: 'landing-pages/components',
          },
        },
      ],
      execute: async ({ parentPath }) => {
        const files = await storageService.listFilesInDirectory(parentPath);
        return { success: true, files };
      },
    }),
    create_file: tool({
      description: 'Cria um novo arquivo',
      inputSchema: z.object({
        name: z.string().describe('Nome do arquivo'),
        content: z.string().describe('Conteúdo do arquivo'),
      }),
      execute: async ({ name, content }) => {
        await storageService.createFile(name, content || '');

        return {
          success: true,
          message: `Arquivo "${name}" criado com sucesso.`,
        };
      },
    }),
    edit_file: tool({
      description: 'Edita um arquivo existente',
      inputSchema: z.object({
        name: z.string().describe('Nome do arquivo'),
        newContent: z.string().describe('Novo conteúdo do arquivo'),
        lineStart: z.number().describe('Linha inicial para edição'),
        lineEnd: z.number().describe('Linha final para edição'),
      }),
      execute: async ({ name, newContent, lineStart, lineEnd }) => {
        await storageService.editFile(name, newContent, lineStart, lineEnd);

        return {
          success: true,
          message: `Arquivo "${name}" editado com sucesso.`,
        };
      },
    }),
    delete_file: tool({
      description: 'Deleta um arquivo existente',
      inputSchema: z.object({
        name: z.string().describe('Nome do arquivo'),
      }),
      execute: async ({ name }) => {
        await storageService.deleteFile(name);

        return {
          success: true,
          message: `Arquivo "${name}" deletado com sucesso.`,
        };
      },
    }),
    rename_file_or_folder: tool({
      description: 'Renomeia um arquivo ou diretório existente',
      inputSchema: z.object({
        currentPath: z.string().describe('Caminho atual do arquivo ou diretório'),
        newPath: z.string().describe('Novo caminho do arquivo ou diretório'),
      }),
      execute: async ({ currentPath, newPath }) => {
        await storageService.renamePath(currentPath, newPath);

        return {
          success: true,
          message: `Elemento "${currentPath}" renomeado para "${newPath}" com sucesso.`,
        };
      },
    }),
    move_file_or_folder: tool({
      description: 'Move um arquivo ou diretório para outro caminho',
      inputSchema: z.object({
        sourcePath: z.string().describe('Caminho atual do arquivo ou diretório'),
        destinationPath: z.string().describe('Caminho de destino do arquivo ou diretório'),
      }),
      execute: async ({ sourcePath, destinationPath }) => {
        await storageService.movePath(sourcePath, destinationPath);

        return {
          success: true,
          message: `Elemento "${sourcePath}" movido para "${destinationPath}" com sucesso.`,
        };
      },
    }),
    read_file: tool({
      description: 'Lê o conteúdo de um arquivo inteiro ou apenas um bloco específico',
      inputSchema: zodSchema(
        z.object({
          path: z.string().describe('Caminho do arquivo'),
          lineStart: z.number().int().positive().optional().describe('Linha inicial opcional para ler apenas um bloco'),
          lineEnd: z.number().int().positive().optional().describe('Linha final opcional para ler apenas um bloco'),
        }),
      ) as any,
      execute: async ({ path, lineStart, lineEnd }: { path: string; lineStart?: number; lineEnd?: number }) => {
        const content = await storageService.readFile(path, lineStart, lineEnd);
        return { success: true, content };
      },
    }),
    regex_search_files_content: tool({
      description:
        'Procura conteúdo em arquivos de um diretório que correspondam a um padrão regex',
      inputSchema: z.object({
        folderName: z.string().describe('Nome do diretório para busca'),
        regexPattern: z.string().describe('Padrão regex para busca'),
      }),
      execute: async ({ regexPattern, folderName }) => {
        console.log('Executando regex_search_files com padrão:', regexPattern);

        const files = await storageService.regexSearchForContentInFiles(
          folderName,
          regexPattern,
        );
        return { success: true, files };
      },
    }),
  };
}
