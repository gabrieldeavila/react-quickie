import { tool, zodSchema } from 'ai';
import { StorageService } from 'src/common/helpers/storage.service';
import { z } from 'zod/v4';

export function createStorageTools(storageService: StorageService) {
  return {
    list_folders: tool({
      description:
        'Lista os arquivos e subdiretórios de um caminho especificado. O sistema já opera a partir da raiz (root) do projeto de forma invisível. Forneça apenas caminhos relativos.',
      inputSchema: z.object({
        parentPath: z
          .string()
          .describe(
            "Caminho relativo do diretório que será listado (ex: 'src/controllers', 'test/utils'). Use uma string vazia '' ou '.' para listar o diretório raiz.",
          ),
      }),
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
      description:
        'Edita um arquivo existente substituindo somente o bloco exato de código em oldContent. Prefira sempre esta opção para evitar sobrescrever o arquivo inteiro.',
      inputSchema: z.object({
        name: z
          .string()
          .describe(
            "Caminho relativo do arquivo a ser editado (ex: 'src/utils/format.ts').",
          ),
        oldContent: z
          .string()
          .describe(
            'O bloco de código exato que deve ser substituído no arquivo. Deve corresponder perfeitamente ao conteúdo atual.',
          ),
        newContent: z
          .string()
          .describe('O novo código ou texto que substituirá o bloco especificado.'),
      }),
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
      }: {
        name: string;
        oldContent: string;
        newContent: string;
      }) => {
        await storageService.replaceContentInFile(name, oldContent, newContent);

        console.log("replacing code");

        return {
          success: true,
          message: `Arquivo "${name}" editado com sucesso.`,
        };
      },
    }),
    overwrite_file: tool({
      description:
        'Sobrescreve todo o conteúdo de um arquivo existente. Use somente quando não for possível aplicar uma alteração específica a um bloco de código.',
      inputSchema: z.object({
        name: z
          .string()
          .describe(
            "Caminho relativo do arquivo a ser sobrescrito (ex: 'src/utils/format.ts').",
          ),
        newContent: z
          .string()
          .describe('O novo conteúdo completo do arquivo.'),
      }),
      execute: async ({
        name,
        newContent,
      }: {
        name: string;
        newContent: string;
      }) => {
        await storageService.overwriteFile(name, newContent);
        console.log("overwrite code");

        return {
          success: true,
          message: `Arquivo "${name}" sobrescrito com sucesso.`,
        };
      },
    }),
    delete_file: tool({
      description:
        'Deleta um arquivo existente. Apenas faça isso se tiver certeza de que deseja remover o arquivo, pois esta ação é irreversível.',
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
        currentPath: z
          .string()
          .describe('Caminho atual do arquivo ou diretório'),
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
        sourcePath: z
          .string()
          .describe('Caminho atual do arquivo ou diretório'),
        destinationPath: z
          .string()
          .describe('Caminho de destino do arquivo ou diretório'),
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
      description:
        'Lê o conteúdo de um arquivo inteiro ou apenas um bloco específico',
      inputSchema: zodSchema(
        z.object({
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
        }),
      ) as any,
      execute: async ({
        path,
        lineStart,
        lineEnd,
      }: {
        path: string;
        lineStart?: number;
        lineEnd?: number;
      }) => {
        const content = await storageService.readFile(path, lineStart, lineEnd);
        return { success: true, content };
      },
    }),
    regex_search_files_content: tool({
      description:
        'Busca global (estilo "grep"): Procura por um padrão Regex no conteúdo de TODOS os arquivos dentro de um diretório. Útil para descobrir onde uma função é chamada, onde uma variável é usada no projeto todo, ou para mapear dependências cruzadas.',
      inputSchema: z.object({
        regexPattern: z
          .string()
          .describe(
            "Padrão Regex para varrer o código-fonte (ex: 'import.*from.*react' ou 'UserService'). Evite padrões excessivamente genéricos para não poluir o contexto da resposta.",
          ),
        targetPath: z
          .string()
          .optional()
          .describe(
            'Caminho relativo do diretório onde a busca será feita. Deixe vazio para buscar em todo o projeto.',
          ),
      }),
      execute: async ({
        regexPattern,
        targetPath,
      }: {
        regexPattern: string;
        targetPath?: string;
      }) => {
        console.log(
          'Executando regex_search_files com padrão:',
          regexPattern,
          targetPath,
        );

        const files = await storageService.regexSearchForContentInFiles(
          regexPattern,
          targetPath,
        );
        return { success: true, files };
      },
    }),
    search_content_in_file: tool({
      description:
        'Procura por um padrão de texto (Regex) dentro de um ÚNICO arquivo específico. Retorna o conteúdo e o número das linhas onde houve correspondência. Excelente para localizar rapidamente funções, variáveis ou trechos de código antes de usar a ferramenta edit_file.',
      inputSchema: z.object({
        filePath: z
          .string()
          .describe(
            "Caminho relativo do arquivo alvo (ex: 'src/app.module.ts').",
          ),
        regexPattern: z
          .string()
          .describe(
            "Expressão regular para a busca. Use padrões simples se quiser apenas encontrar palavras exatas (ex: 'function getHello' ou 'export class').",
          ),
      }),
      execute: async ({ filePath, regexPattern }) => {
        console.log(
          'Executando search_content_in_file com arquivo:',
          filePath,
          'e padrão:',
          regexPattern,
        );

        const matches = await storageService.searchContentInFile(
          filePath,
          regexPattern,
        );
        return { success: true, matches };
      },
    }),
  };
}
