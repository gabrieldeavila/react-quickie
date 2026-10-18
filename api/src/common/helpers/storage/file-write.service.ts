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

const EDIT_ERROR = 'Failed to edit the file in the repository.';

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
        'oldContent cannot be empty, or the replacement would not be safe.',
      );
    case 'not-found':
      return new BadRequestException(
        `The code block in oldContent was not found in "${filePath}". Check the indentation and line breaks, or include more context, and try again.`,
      );
    case 'ambiguous':
      return new BadRequestException(
        `The code block in oldContent occurs ${result.occurrences} times in "${filePath}". Include more context so it matches only once.`,
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
      // Errors such as no write permission
      throw new InternalServerErrorException(
        'Failed to create the file in the repository.',
      );
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      await assertPathExists(fullPath, filePath, 'File');
      await fs.remove(fullPath);
    } catch (error) {
      rethrowKnown(error);
      throw new InternalServerErrorException(
        'Failed to delete the file from the repository.',
      );
    }
  }

  renamePath(currentPath: string, newPath: string): Promise<void> {
    return this.move(
      currentPath,
      newPath,
      'Failed to rename the file or folder in the repository.',
    );
  }

  movePath(sourcePath: string, destinationPath: string): Promise<void> {
    return this.move(
      sourcePath,
      destinationPath,
      'Failed to move the file or folder in the repository.',
    );
  }

  async overwriteFile(filePath: string, newContent: string): Promise<void> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      await assertPathExists(fullPath, filePath, 'File');
      await fs.writeFile(fullPath, newContent, 'utf-8');
      await this.linterService.formatAndLintFile(fullPath);
    } catch (error) {
      console.log(error, `Failed to overwrite the file: ${filePath}`);
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
      await assertPathExists(fullPath, filePath, 'File');

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
      await assertPathExists(fullFrom, from, 'File or folder');
      await fs.move(fullFrom, fullTo, { overwrite: false });
    } catch (error) {
      rethrowKnown(error);
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
