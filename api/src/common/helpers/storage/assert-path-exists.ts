import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs-extra';

/** What the missing path is, as the tool error names it. */
export type PathKind = 'O arquivo' | 'O diretório' | 'O arquivo ou diretório';

/** Throws `NotFoundException` with the path the model asked for. */
export async function assertPathExists(
  fullPath: string,
  requestedPath: string,
  kind: PathKind,
): Promise<void> {
  if (await fs.pathExists(fullPath)) return;
  throw new NotFoundException(
    `${kind} no caminho "${requestedPath}" não foi encontrado.`,
  );
}
