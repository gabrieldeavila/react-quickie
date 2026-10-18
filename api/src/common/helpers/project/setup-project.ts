import { execSync } from 'child_process';
import * as path from 'path';

const INSTALL_FROM_LOCKFILE =
  'pnpm install --force --frozen-lockfile --ignore-workspace';

/** Git init + initial commit. Failures are reported, not thrown. */
export function initGitRepository(projectPath: string): string {
  const options = { cwd: projectPath, stdio: 'ignore' as const };
  let output = '';
  try {
    execSync('git init', options);
    execSync('git checkout -b main', options);
    output += 'Repositório Git inicializado.\n';

    execSync('git add .', options);
    execSync(
      'git commit -m "chore: initial commit from react-quickie"',
      options,
    );
    output += '\nCommit inicial finalizado com sucesso.\n';
  } catch (error) {
    output += `\nAviso durante execução de comandos: ${(error as Error).message}`;
  }
  return output;
}

/**
 * Installs using only the generated project's lockfile, so a
 * pnpm-workspace/lockfile in a parent folder can't change the dependency
 * tree (and create a second React instance).
 */
export function installProjectDependencies(
  projectPath: string,
  isFullstack: boolean,
): string {
  const options = {
    env: { ...process.env, COREPACK_ENABLE_PROJECT_SPEC: '0' },
  };
  const install = (command: string, cwd: string) =>
    execSync(command, { cwd, ...options }).toString();

  if (!isFullstack) return install(INSTALL_FROM_LOCKFILE, projectPath);

  let output = install('pnpm install --ignore-workspace', projectPath);
  for (const app of ['api', 'ui']) {
    output += install(INSTALL_FROM_LOCKFILE, path.join(projectPath, app));
  }
  return output;
}
