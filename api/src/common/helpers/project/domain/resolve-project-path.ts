import * as path from 'path';

export const DEFAULT_PROJECT_NAME = 'my-react-app';

/** A single folder name: no separators, `.` or `..`. Throws otherwise. */
export function validateProjectName(projectName: string | undefined): string {
  const name = (projectName || DEFAULT_PROJECT_NAME).trim();
  if (
    !name ||
    name === '.' ||
    name === '..' ||
    name !== path.basename(name) ||
    name.includes(path.sep)
  ) {
    throw new Error('O nome do projeto é inválido.');
  }
  return name;
}

/**
 * The folder the project goes in: an absolute `targetPath`, a relative one
 * under the workspace root, or the root itself. Throws when there's no way
 * to resolve it.
 */
export function resolveTargetDir(
  rootPath: string | undefined,
  targetPath: string | undefined,
): string {
  if (targetPath && path.isAbsolute(targetPath)) {
    return path.resolve(targetPath);
  }
  if (!rootPath) {
    throw new Error(
      targetPath
        ? 'Caminho relativo exige uma raiz de workspace configurada.'
        : 'Informe uma pasta de destino ou configure a raiz do workspace.',
    );
  }
  return targetPath ? path.resolve(rootPath, targetPath) : rootPath;
}
