import { tool } from 'ai';
import { z } from 'zod/v4';
import { formatToolError } from 'src/common/agents/tools/shared/format-tool-error';
import type { LinterService } from 'src/common/helpers/linter.service';
import type { FileSearchService } from 'src/common/helpers/storage/file-search.service';
import {
  formatLintErrors,
  formatListOutput,
  formatSearchMatches,
} from './format-storage-output';

const REGEX_PATTERN_DESCRIPTION =
  "O padrão Regex. REGRA DE OURO: Como esse padrão será trafegado em JSON, NUNCA use '\\s', '\\w' ou '\\d', pois o escape falhará. Para buscar espaços em branco, use OBRIGATORIAMENTE '[ \\t]'. Exemplo: em vez de '^\\s*const\\s+', envie '^[ \\t]*const[ \\t]+'.";

const getLintErrorsInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe(
      'Caminho relativo do arquivo ou diretório para verificar. Deixe vazio para usar ".".',
    ),
});

const regexSearchInputSchema = z.object({
  regexPattern: z.string().describe(REGEX_PATTERN_DESCRIPTION),
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
  regexPattern: z.string().describe(REGEX_PATTERN_DESCRIPTION),
});

export function createFileSearchTools(
  search: FileSearchService,
  linter: LinterService,
) {
  return {
    get_lint_errors: tool({
      description:
        'Retorna os erros de lint para um arquivo ou diretório. Se nenhum caminho for informado, usa ".".',
      inputSchema: getLintErrorsInputSchema,
      execute: async ({ path }: z.infer<typeof getLintErrorsInputSchema>) => {
        try {
          const errors = await linter.getLintErrors(path || '.');
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
          const files = await search.regexSearchForContentInFiles(
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
          const matches = await search.searchContentInFile(
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
