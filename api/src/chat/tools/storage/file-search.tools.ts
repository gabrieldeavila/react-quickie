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
  "The regex pattern. GOLDEN RULE: this pattern travels as JSON, so NEVER use '\\s', '\\w' or '\\d', because the escaping breaks. To match whitespace you MUST use '[ \\t]'. Example: instead of '^\\s*const\\s+', send '^[ \\t]*const[ \\t]+'.";

const getLintErrorsInputSchema = z.object({
  path: z
    .string()
    .optional()
    .describe(
      'Relative path of the file or folder to check. Leave empty to use ".".',
    ),
});

const regexSearchInputSchema = z.object({
  regexPattern: z.string().describe(REGEX_PATTERN_DESCRIPTION),
  targetPath: z
    .string()
    .default('.')
    .describe(
      'Relative path of the folder to search in. Leave empty to search the whole project.',
    ),
});

const searchContentInputSchema = z.object({
  filePath: z
    .string()
    .describe("Relative path of the target file (e.g. 'src/app.module.ts')."),
  regexPattern: z.string().describe(REGEX_PATTERN_DESCRIPTION),
});

export function createFileSearchTools(
  search: FileSearchService,
  linter: LinterService,
) {
  return {
    get_lint_errors: tool({
      description:
        'Returns the lint errors for a file or folder. Uses "." when no path is given.',
      inputSchema: getLintErrorsInputSchema,
      execute: async ({ path }: z.infer<typeof getLintErrorsInputSchema>) => {
        try {
          const errors = await linter.getLintErrors(path || '.');
          return formatLintErrors(errors);
        } catch (error) {
          return formatToolError('check the lint errors', error);
        }
      },
    }),
    regex_search_files_content: tool({
      description:
        'Global search ("grep" style): looks for a regex pattern in the content of ALL files in a folder. Useful to find where a function is called, where a variable is used across the project, or to map cross-dependencies.',
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
          return formatListOutput('Files found', files);
        } catch (error) {
          return formatToolError('search for the given patterns', error);
        }
      },
    }),
    search_content_in_file: tool({
      description:
        'Looks for a text pattern (regex) inside ONE specific file. Returns the content and line numbers of each match. Great for quickly finding functions, variables or code blocks before using the edit_file tool.',
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
          return formatToolError('search the file content', error);
        }
      },
    }),
  };
}
