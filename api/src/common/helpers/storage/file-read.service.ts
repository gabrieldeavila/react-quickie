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
      'Os valores de lineStart e lineEnd devem ser válidos e lineStart não pode ser maior que lineEnd.',
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
      await assertPathExists(targetPath, directoryPath, 'O diretório');
      // Só os nomes de arquivos/pastas
      return await fs.readdir(targetPath);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      // Trata outros erros (ex: falta de permissão de leitura)
      throw new InternalServerErrorException(
        'Erro ao listar arquivos do repositório.',
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
      await assertPathExists(fullPath, filePath, 'O arquivo');
      const content = await fs.readFile(fullPath, 'utf-8');

      if (lineStart === undefined && lineEnd === undefined) return content;
      if (lineStart === undefined || lineEnd === undefined) {
        throw new BadRequestException(
          'É necessário informar tanto lineStart quanto lineEnd para ler apenas um bloco.',
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

      // Trata outros erros (ex: falta de permissão de leitura)
      throw new InternalServerErrorException(
        'Erro ao ler o conteúdo do arquivo.',
      );
    }
  }
}
