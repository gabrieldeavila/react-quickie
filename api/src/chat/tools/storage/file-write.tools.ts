import { tool } from 'ai';
import { z } from 'zod/v4';
import { formatToolError } from 'src/common/agents/tools/shared/format-tool-error';
import type { FileWriteService } from 'src/common/helpers/storage/file-write.service';

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
      'O bloco de código exato que deve ocorrer uma única vez no arquivo. Deve corresponder perfeitamente ao conteúdo atual.',
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

export function createFileWriteTools(files: FileWriteService) {
  return {
    create_file: tool({
      description: 'Cria um novo arquivo',
      inputSchema: createFileInputSchema,
      execute: async ({
        name,
        content,
      }: z.infer<typeof createFileInputSchema>) => {
        try {
          await files.createFile(name, content || '');
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
          await files.replaceContentInFile(name, oldContent, newContent);
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
          await files.overwriteFile(name, newContent);
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
          await files.deleteFile(name);
          return `Arquivo "${name}" deletado com sucesso.`;
        } catch (error) {
          return formatToolError('deletar o arquivo', error);
        }
      },
    }),
  };
}
