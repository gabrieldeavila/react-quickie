import { BadRequestException } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs-extra';
import {
  blueprintContext,
  blueprintBaseContext,
  blueprintServicesContext,
  blueprintIndex,
  blueprintContent,
} from './builder';

export function createComponent(name: string, targetPath: string) {
  try {
    const fullDir = path.resolve(targetPath, name);

    const files = [
      {
        filePath: path.join(fullDir, 'features', 'content', 'index.tsx'),
        content: blueprintContent(name),
      },
      {
        filePath: path.join(fullDir, 'css', 'style.css'),
        content: '',
      },
      {
        filePath: path.join(fullDir, 'context', 'context.tsx'),
        content: blueprintContext(name),
      },
      {
        filePath: path.join(fullDir, 'context', `${name}BaseContext.tsx`),
        content: blueprintBaseContext(name),
      },
      {
        filePath: path.join(fullDir, 'context', `${name}ServicesContext.tsx`),
        content: blueprintServicesContext(name),
      },
      {
        filePath: path.join(fullDir, 'index.tsx'),
        content: blueprintIndex(name),
      },
    ];

    const createdFiles: string[] = [];

    for (const file of files) {
      if (fs.existsSync(file.filePath)) {
        createdFiles.push(path.relative(process.cwd(), file.filePath));
        continue;
      }

      fs.outputFileSync(file.filePath, file.content.trim());

      const relativePath = path.relative(process.cwd(), file.filePath);
      createdFiles.push(relativePath);
    }

    return {
      message: `Boilerplate para o componente '${name}' gerado com sucesso.`,
      componentDir: path.relative(process.cwd(), fullDir),
      filesCreated: createdFiles,
    };
  } catch (error) {
    throw new BadRequestException(`Erro ao criar o componente: ${error}`);
  }
}
