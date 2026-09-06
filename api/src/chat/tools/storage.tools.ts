import { tool } from 'ai';
import { StorageService } from 'src/common/helpers/storage.service';
import { z } from 'zod/v4';
import type { LintErrorResult } from 'src/common/helpers/linter.service';

type SearchMatch = {
  line: number;
  content: string;
};

const listFoldersInputSchema = z.object({
  parentPath: z
    .string()
    .describe(
      "Caminho relativo do diretório que será listado (ex: 'src/controllers', 'test/utils'). Use uma string vazia '' ou '.' para listar o diretório raiz.",
    ),
});

const createFileInputSchema = z.object({
  name: z.string().describe('Nome do arquivo'),
  content: z.string().describe('Conteúdo do arquivo'),
});

const editFileInputSchema = z.object({
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
});

const overwriteFileInputSchema = z.object({
  name: z
    .string()
    .describe(
      "Caminho relativo do arquivo a ser sobrescrito (ex: 'src/utils/format.ts').",
    ),
  newContent: z.string().describe('O novo conteúdo completo do arquivo.'),
});

const deleteFileInputSchema = z.object({
  name: z.string().describe('Nome do arquivo'),
});

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

const getLintErrorsInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe(
      'Caminho relativo do arquivo ou diretório para verificar. Deixe vazio para usar ".".',
    ),
});

const regexSearchInputSchema = z.object({
  regexPattern: z
    .string()
    .describe(
      "O padrão Regex. REGRA DE OURO: Como esse padrão será trafegado em JSON, NUNCA use '\\s', '\\w' ou '\\d', pois o escape falhará. Para buscar espaços em branco, use OBRIGATORIAMENTE '[ \\t]'. Exemplo: em vez de '^\\s*const\\s+', envie '^[ \\t]*const[ \\t]+'.",
    ),
  targetPath: z
    .string()
    .default('.')
    .describe(
      'Caminho relativo do diretório onde a busca será feita. Deixe vazio para buscar em todo o projeto.',
    ),
});

const searchContentInputSchema = z.object({
  filePath: z
    .string()
    .describe("Caminho relativo do arquivo alvo (ex: 'src/app.module.ts')."),
  regexPattern: z
    .string()
    .describe(
      "O padrão Regex. REGRA DE OURO: Como esse padrão será trafegado em JSON, NUNCA use '\\s', '\\w' ou '\\d', pois o escape falhará. Para buscar espaços em branco, use OBRIGATORIAMENTE '[ \\t]'. Exemplo: em vez de '^\\s*const\\s+', envie '^[ \\t]*const[ \\t]+'.",
    ),
});

function formatToolError(action: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Erro desconhecido.';
  return `Não foi possível ${action}.\nMotivo: ${message}`;
}

function formatListOutput(title: string, items: string[]) {
  return items.length
    ? `${title}:\n${items.map((item) => `- ${item}`).join('\n')}`
    : 'Nenhuma ocorrência encontrada.';
}

function formatSearchMatches(matches: SearchMatch[]) {
  return matches.length
    ? matches
        .map((match) => `Linha ${match.line}: ${match.content}`.trim())
        .join('\n')
    : 'Nenhuma ocorrência encontrada.';
}

function formatLintErrors(errors: LintErrorResult[]) {
  if (!errors.length) return 'Nenhum erro de lint encontrado.';
  return errors
    .flatMap((error) => {
      const file = error.filePath ?? 'Arquivo desconhecido';
      const messages = error.messages ?? [];
      if (!messages.length)
        return [`${file} - Nenhuma mensagem de lint disponível`];
      return messages.map((message) => {
        const location =
          message.column != null
            ? `${file}:${message.line}:${message.column}`
            : `${file}:${message.line}`;
        const rule = message.ruleId ? ` [${message.ruleId}]` : '';
        return `${location} - ${message.message}${rule}`.trim();
      });
    })
    .join('\n');
}

export function createStorageTools(storageService: StorageService) {
  return {
    list_folders: tool({
      description:
        'Lista os arquivos e subdiretórios de um caminho especificado. O sistema já opera a partir da raiz (root) do projeto de forma invisível. Forneça apenas caminhos relativos.',
      inputSchema: listFoldersInputSchema,
      execute: async ({
        parentPath,
      }: z.infer<typeof listFoldersInputSchema>) => {
        try {
          const files = await storageService.listFilesInDirectory(parentPath);
          return formatListOutput(
            `Arquivos e pastas encontrados em ${parentPath || '.'}`,
            files,
          );
        } catch (error) {
          return formatToolError('listar as pastas informadas', error);
        }
      },
    }),
    create_file: tool({
      description: 'Cria um novo arquivo',
      inputSchema: createFileInputSchema,
      execute: async ({
        name,
        content,
      }: z.infer<typeof createFileInputSchema>) => {
        try {
          await storageService.createFile(name, content || '');
          return `Arquivo "${name}" criado com sucesso.`;
        } catch (error) {
          return formatToolError('criar o arquivo', error);
        }
      },
    }),
    edit_file: tool({
      description:
        'Edita um arquivo existente substituindo somente o bloco exato de código em oldContent. Prefira sempre esta opção para evitar sobrescrever o arquivo inteiro.',
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
          await storageService.replaceContentInFile(
            name,
            oldContent,
            newContent,
          );
          return `Arquivo "${name}" editado com sucesso.`;
        } catch (error) {
          return formatToolError('editar o arquivo', error);
        }
      },
    }),
    overwrite_file: tool({
      description:
        'Sobrescreve todo o conteúdo de um arquivo existente. Use somente quando não for possível aplicar uma alteração específica a um bloco de código.',
      inputSchema: overwriteFileInputSchema,
      execute: async ({
        name,
        newContent,
      }: z.infer<typeof overwriteFileInputSchema>) => {
        try {
          await storageService.overwriteFile(name, newContent);
          return `Arquivo "${name}" sobrescrito com sucesso.`;
        } catch (error) {
          return formatToolError('sobrescrever o arquivo', error);
        }
      },
    }),
    delete_file: tool({
      description:
        'Deleta um arquivo existente. Apenas faça isso se tiver certeza de que deseja remover o arquivo, pois esta ação é irreversível.',
      inputSchema: deleteFileInputSchema,
      execute: async ({ name }: z.infer<typeof deleteFileInputSchema>) => {
        try {
          await storageService.deleteFile(name);
          return `Arquivo "${name}" deletado com sucesso.`;
        } catch (error) {
          return formatToolError('deletar o arquivo', error);
        }
      },
    }),
    rename_file_or_folder: tool({
      description: 'Renomeia um arquivo ou diretório existente',
      inputSchema: renamePathInputSchema,
      execute: async ({
        currentPath,
        newPath,
      }: z.infer<typeof renamePathInputSchema>) => {
        try {
          await storageService.renamePath(currentPath, newPath);
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
          await storageService.movePath(sourcePath, destinationPath);
          return `Elemento "${sourcePath}" movido para "${destinationPath}" com sucesso.`;
        } catch (error) {
          return formatToolError('mover o item', error);
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
          const content = await storageService.readFile(
            path,
            lineStart,
            lineEnd,
          );
          return content;
        } catch (error) {
          return formatToolError('ler o arquivo solicitado', error);
        }
      },
    }),
    get_lint_errors: tool({
      description:
        'Retorna os erros de lint para um arquivo ou diretório. Se nenhum caminho for informado, usa ".".',
      inputSchema: getLintErrorsInputSchema,
      execute: async ({ path }: z.infer<typeof getLintErrorsInputSchema>) => {
        try {
          const errors = await storageService.getLintErrors(path || '.');
          return formatLintErrors(errors);
        } catch (error) {
          return formatToolError('verificar os erros de lint', error);
        }
      },
    }),
    regex_search_files_content: tool({
      description:
        'Busca global (estilo "grep"): Procura por um padrão Regex no conteúdo de TODOS os arquivos dentro de um diretório. Útil para descobrir onde uma função é chamada, onde uma variável é usada no projeto todo, ou para mapear dependências cruzadas.',
      inputSchema: regexSearchInputSchema,
      execute: async ({
        regexPattern,
        targetPath,
      }: z.infer<typeof regexSearchInputSchema>) => {
        try {
          const files = await storageService.regexSearchForContentInFiles(
            regexPattern,
            targetPath,
          );
          return formatListOutput('Arquivos encontrados', files);
        } catch (error) {
          return formatToolError('buscar os padrões informados', error);
        }
      },
    }),
    search_content_in_file: tool({
      description:
        'Procura por um padrão de texto (Regex) dentro de um ÚNICO arquivo específico. Retorna o conteúdo e o número das linhas onde houve correspondência. Excelente para localizar rapidamente funções, variáveis ou trechos de código antes de usar a ferramenta edit_file.',
      inputSchema: searchContentInputSchema,
      execute: async ({
        filePath,
        regexPattern,
      }: z.infer<typeof searchContentInputSchema>) => {
        try {
          const matches = await storageService.searchContentInFile(
            filePath,
            regexPattern,
          );
          return formatSearchMatches(matches);
        } catch (error) {
          return formatToolError('buscar o conteúdo no arquivo', error);
        }
      },
    }),
  };
}
