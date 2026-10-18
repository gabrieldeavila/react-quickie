import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs-extra';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import {
  replaceUniqueBlock,
  type ReplaceBlockResult,
} from 'src/workspace/domain/replace-unique-block';
import { LinterService } from '../linter.service';
import { assertPathExists } from './assert-path-exists';

const EDIT_ERROR = 'Erro ao editar o arquivo no repositório.';

function rethrowKnown(error: unknown): void {
  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException
  ) {
    throw error;
  }
}

function toBadRequest(
  result: Exclude<ReplaceBlockResult, { ok: true }>,
  filePath: string,
): BadRequestException {
  switch (result.reason) {
    case 'empty':
      return new BadRequestException(
        'oldContent não pode estar vazio para uma substituição segura.',
      );
    case 'not-found':
      return new BadRequestException(
        `O bloco de código fornecido em oldContent não foi encontrado no arquivo "${filePath}". Verifique a indentação, as quebras de linha ou se você incluiu contexto suficiente, e tente novamente.`,
      );
    case 'ambiguous':
      return new BadRequestException(
        `O bloco de código fornecido em oldContent ocorre ${result.occurrences} vezes no arquivo "${filePath}". Inclua mais contexto para tornar a substituição única.`,
      );
  }
}

/** Writes through a temp file + rename, so a crash never leaves half a file. */
async function writeAtomically(fullPath: string, content: string) {
  const temporaryPath = `${fullPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(temporaryPath, content, 'utf-8');
    await fs.rename(temporaryPath, fullPath);
  } finally {
    await fs.remove(temporaryPath).catch(() => undefined);
  }
}

/** Creating, editing, moving and deleting inside the workspace. */
@Injectable()
export class FileWriteService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly linterService: LinterService,
  ) {}

  async createFile(filePath: string, content: string): Promise<void> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      await fs.outputFile(fullPath, content);
      await this.linterService.formatAndLintFile(fullPath);
    } catch {
      // Trata erros (ex: falta de permissão de escrita)
      throw new InternalServerErrorException(
        'Erro ao criar o arquivo no repositório.',
      );
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      await assertPathExists(fullPath, filePath, 'O arquivo');
      await fs.remove(fullPath);
    } catch (error) {
      rethrowKnown(error);
      throw new InternalServerErrorException(
        'Erro ao deletar o arquivo do repositório.',
      );
    }
  }

  renamePath(currentPath: string, newPath: string): Promise<void> {
    return this.move(
      currentPath,
      newPath,
      'Erro ao renomear o arquivo ou diretório no repositório.',
    );
  }

  movePath(sourcePath: string, destinationPath: string): Promise<void> {
    return this.move(
      sourcePath,
      destinationPath,
      'Erro ao mover o arquivo ou diretório no repositório.',
    );
  }

  async overwriteFile(filePath: string, newContent: string): Promise<void> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      await assertPathExists(fullPath, filePath, 'O arquivo');
      await fs.writeFile(fullPath, newContent, 'utf-8');
      await this.linterService.formatAndLintFile(fullPath);
    } catch (error) {
      console.log(error, `Erro ao sobrescrever o arquivo: ${filePath}`);
      rethrowKnown(error);
      throw new InternalServerErrorException(EDIT_ERROR);
    }
  }

  async replaceContentInFile(
    filePath: string,
    oldContent: string,
    newContent: string,
  ): Promise<{ replacements: number; line: number }> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      if (!oldContent)
        throw toBadRequest({ ok: false, reason: 'empty' }, filePath);
      await assertPathExists(fullPath, filePath, 'O arquivo');

      const current = await fs.readFile(fullPath, 'utf-8');
      const result = replaceUniqueBlock(current, oldContent, newContent);
      if (!result.ok) throw toBadRequest(result, filePath);

      await writeAtomically(fullPath, result.content);
      return { replacements: 1, line: result.line };
    } catch (error) {
      rethrowKnown(error);
      throw new InternalServerErrorException(EDIT_ERROR);
    }
  }

  private async move(from: string, to: string, errorMessage: string) {
    const fullFrom = this.workspaceService.resolve(from);
    const fullTo = this.workspaceService.resolve(to);

    try {
      await assertPathExists(fullFrom, from, 'O arquivo ou diretório');
      await fs.move(fullFrom, fullTo, { overwrite: false });
    } catch (error) {
      rethrowKnown(error);
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
