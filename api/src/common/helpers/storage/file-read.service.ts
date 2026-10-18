import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs-extra';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import { assertPathExists } from './assert-path-exists';

function selectLines(content: string, lineStart: number, lineEnd: number) {
  if (lineStart < 1 || lineEnd < lineStart) {
    throw new BadRequestException(
      'lineStart and lineEnd must be valid, and lineStart cannot be greater than lineEnd.',
    );
  }
  return content
    .split(/\r?\n/)
    .slice(lineStart - 1, lineEnd)
    .join('\n');
}

/** Listing and reading inside the workspace. */
@Injectable()
export class FileReadService {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async listFilesInDirectory(directoryPath: string): Promise<string[]> {
    const targetPath = this.workspaceService.resolve(directoryPath);

    try {
      await assertPathExists(targetPath, directoryPath, 'Folder');
      // File and folder names only
      return await fs.readdir(targetPath);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      // Other errors (e.g. no read permission)
      throw new InternalServerErrorException(
        'Failed to list the repository files.',
      );
    }
  }

  async readFile(
    filePath: string,
    lineStart?: number,
    lineEnd?: number,
  ): Promise<string> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      await assertPathExists(fullPath, filePath, 'File');
      const content = await fs.readFile(fullPath, 'utf-8');

      if (lineStart === undefined && lineEnd === undefined) return content;
      if (lineStart === undefined || lineEnd === undefined) {
        throw new BadRequestException(
          'Give both lineStart and lineEnd to read only a block.',
        );
      }
      return selectLines(content, lineStart, lineEnd);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Other errors (e.g. no read permission)
      throw new InternalServerErrorException(
        'Failed to read the file content.',
      );
    }
  }
}
