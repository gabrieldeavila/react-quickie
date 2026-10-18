import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import { assertPathExists } from './assert-path-exists';

export type LineMatch = { line: number; content: string };

const SEARCH_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
];

function matchLines(content: string, regex: RegExp): LineMatch[] {
  return content
    .split('\n')
    .flatMap((text, index) =>
      regex.test(text) ? [{ line: index + 1, content: text.trim() }] : [],
    );
}

/** Regex search across the workspace or inside one file. */
@Injectable()
export class FileSearchService {
  constructor(private readonly workspaceService: WorkspaceService) {}

  /** Files under `folderName` whose content or name matches. */
  async regexSearchForContentInFiles(
    regexPattern: string,
    folderName?: string,
  ): Promise<string[]> {
    const targetPath = this.workspaceService.resolve(folderName);

    try {
      const files = await glob(`${targetPath}/**/*`, {
        ignore: SEARCH_IGNORE,
        absolute: true,
        onlyFiles: true,
      });

      const regex = new RegExp(regexPattern, 'm');
      const matchedFiles: string[] = [];
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        if (regex.test(content) || regex.test(path.basename(file))) {
          matchedFiles.push(file.replace(targetPath, ''));
        }
      }
      return matchedFiles;
    } catch (error) {
      console.log(
        error,
        'Erro ao executar a busca regex no diretório:',
        targetPath,
      );
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Erro ao listar arquivos do repositório.',
      );
    }
  }

  async searchContentInFile(
    filePath: string,
    regexPattern: string,
  ): Promise<LineMatch[]> {
    const fullPath = this.workspaceService.resolve(filePath);

    try {
      await assertPathExists(fullPath, filePath, 'O arquivo');
      const content = await fs.readFile(fullPath, 'utf-8');
      return matchLines(content, new RegExp(regexPattern));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.log(error, `Erro ao buscar conteúdo no arquivo: ${filePath}`);
      throw new InternalServerErrorException(
        `Erro ao buscar conteúdo no arquivo ${filePath}.`,
      );
    }
  }
}
