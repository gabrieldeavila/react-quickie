import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}

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
}
