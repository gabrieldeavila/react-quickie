import { BadRequestException } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs-extra';
import {
  blueprintContext,
  blueprintBaseContext,
  blueprintServicesContext,
  blueprintIndex,
  blueprintContent,
  blueprintTypes,
} from './builder';

export function createComponent(
  name: string,
  targetPath: string,
  rootPath: string,
) {
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
        filePath: path.join(
          rootPath,
          'types',
          'interface',
          `${name.toLowerCase()}-context.interface.ts`,
        ),
        content: blueprintTypes(name),
      },
      {
        filePath: path.join(fullDir, 'index.tsx'),
        content: blueprintIndex(name),
      },
    ];

    const createdFiles: string[] = [];

    for (const file of files) {
      if (fs.existsSync(file.filePath)) {
        createdFiles.push(path.relative(rootPath, file.filePath));
        continue;
      }

      fs.outputFileSync(file.filePath, file.content.trim());

      const relativePath = path.relative(rootPath, file.filePath);
      createdFiles.push(relativePath);
    }

    return {
      message: `Generated the boilerplate for component '${name}'.`,
      componentDir: path.relative(rootPath, fullDir),
      filesCreated: createdFiles,
    };
  } catch (error) {
    throw new BadRequestException(`Failed to create the component: ${error}`);
  }
}
