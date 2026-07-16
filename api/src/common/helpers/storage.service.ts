import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'fast-glob';
import { LoggerService } from './logger.service';

@Injectable()
export class StorageService {
  constructor(
    private configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  async listFilesInDirectory(directoryPath: string): Promise<string[]> {
    const targetDir = this.configService.get<string>('TARGET_DIR')!;
    const repoPath = path.join(targetDir, directoryPath);

    const targetPath = path.resolve(repoPath);

    try {
      // Verifica se o diretório realmente existe antes de tentar ler
      const exists = await fs.pathExists(targetPath);
      if (!exists) {
        throw new NotFoundException(
          `O diretório no caminho "${repoPath}" não foi encontrado.`,
        );
      }

      // Lê o conteúdo do diretório (retorna apenas os nomes de arquivos/pastas)
      const files = await fs.readdir(targetPath);
      return files;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      // Trata outros erros (ex: falta de permissão de leitura)
      throw new InternalServerErrorException(
        'Erro ao listar arquivos do repositório.',
      );
    }
  }

  async readFile(filePath: string): Promise<string> {
    const targetDir = this.configService.get<string>('TARGET_DIR')!;
    const fullPath = path.join(targetDir, filePath);

    try {
      // Verifica se o arquivo realmente existe antes de tentar ler
      const exists = await fs.pathExists(fullPath);
      if (!exists) {
        throw new NotFoundException(
          `O arquivo no caminho "${filePath}" não foi encontrado.`,
        );
      }

      // Lê o conteúdo do arquivo
      const content = await fs.readFile(fullPath, 'utf-8');
      this.loggerService.logDecision(`Read the file ${fullPath}`);

      return content;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      // Trata outros erros (ex: falta de permissão de leitura)
      throw new InternalServerErrorException(
        'Erro ao ler o conteúdo do arquivo.',
      );
    }
  }

  async createFile(filePath: string, content: string): Promise<void> {
    const targetDir = this.configService.get<string>('TARGET_DIR')!;
    const fullPath = path.join(targetDir, filePath);

    try {
      // Cria o arquivo com o conteúdo fornecido

      await fs.outputFile(fullPath, content);

      this.loggerService.logDecision(`Created the file ${fullPath}`);
    } catch (error) {
      // Trata erros (ex: falta de permissão de escrita)
      throw new InternalServerErrorException(
        'Erro ao criar o arquivo no repositório.',
      );
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    const targetDir = this.configService.get<string>('TARGET_DIR')!;
    const fullPath = path.join(targetDir, filePath);

    try {
      // Verifica se o arquivo realmente existe antes de tentar deletar
      const exists = await fs.pathExists(fullPath);
      if (!exists) {
        throw new NotFoundException(
          `O arquivo no caminho "${filePath}" não foi encontrado.`,
        );
      }

      this.loggerService.logDecision(`Removed the file ${fullPath}`);
      // Deleta o arquivo
      await fs.remove(fullPath);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      // Trata outros erros (ex: falta de permissão de escrita)
      throw new InternalServerErrorException(
        'Erro ao deletar o arquivo do repositório.',
      );
    }
  }

  async editFile(
    filePath: string,
    newContent: string,
    lineStart: number,
    lineEnd: number,
  ): Promise<void> {
    const targetDir = this.configService.get<string>('TARGET_DIR')!;
    const fullPath = path.join(targetDir, filePath);

    try {
      // Verifica se o arquivo realmente existe antes de tentar editar
      const exists = await fs.pathExists(fullPath);
      if (!exists) {
        throw new NotFoundException(
          `O arquivo no caminho "${filePath}" não foi encontrado.`,
        );
      }

      // Lê o conteúdo atual do arquivo
      const currentContent = await fs.readFile(fullPath, 'utf-8');
      const lines = currentContent.split('\n');

      // Substitui as linhas especificadas pelo novo conteúdo
      lines.splice(lineStart - 1, lineEnd - lineStart + 1, newContent);
      this.loggerService.logDecision(
        `Edited file ${filePath} from line ${lineStart} to ${lineEnd}`,
      );

      // Escreve o conteúdo atualizado de volta no arquivo
      await fs.writeFile(fullPath, lines.join('\n'), 'utf-8');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      // Trata outros erros (ex: falta de permissão de escrita)
      throw new InternalServerErrorException(
        'Erro ao editar o arquivo no repositório.',
      );
    }
  }

  async regexSearchForContentInFiles(
    folderName: string,
    regexPattern: string,
  ): Promise<string[]> {
    const targetRepo = this.configService.get<string>('TARGET_DIR')!;
    const repoPath = path.join(targetRepo, folderName);

    const targetPath = path.resolve(repoPath);

    try {
      const files = await glob(`${targetPath}/**/*`, {
        ignore: ['**/node_modules/**', '**/.git/**'], // Pula o que não interessa
        absolute: true,
      });

      const regex = new RegExp(regexPattern);
      const matchedFiles: string[] = [];

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        if (regex.test(content)) {
          matchedFiles.push(file.replace(targetPath, ''));
        }
      }
      this.loggerService.logDecision(
        `Regex Search ${regexPattern} found the files ${matchedFiles}`,
      );
      return matchedFiles;
    } catch (error) {
      console.log(
        error,
        'Erro ao executar a busca regex no diretório:',
        targetPath,
      );
      if (error instanceof NotFoundException) throw error;

      // Trata outros erros (ex: falta de permissão de leitura)
      throw new InternalServerErrorException(
        'Erro ao listar arquivos do repositório.',
      );
    }
  }
}
