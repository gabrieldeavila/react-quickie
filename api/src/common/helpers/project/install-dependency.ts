import { spawn } from 'child_process';
import { assertPackageSpec, pnpmAddArgs } from './domain/package-spec';

export type InstallResult = {
  success: boolean;
  output?: string;
  error?: string;
};

/**
 * `pnpm i <dependency> [-D]` in `projectPath`. No shell: the dependency name
 * comes from the model and must never be interpreted as a command.
 */
export function installDependency(
  projectPath: string,
  dependency: string,
  isDev: boolean,
): Promise<InstallResult> {
  let spec: string;
  try {
    spec = assertPackageSpec(dependency);
  } catch (error) {
    return Promise.resolve({
      success: false,
      error: (error as Error).message,
    });
  }

  return new Promise((resolve) => {
    const child = spawn('pnpm', pnpmAddArgs(spec, isDev), { cwd: projectPath });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data: Buffer) => (stdout += data.toString()));
    child.stderr.on('data', (data: Buffer) => (stderr += data.toString()));

    child.on('close', (code) => {
      resolve(
        code === 0
          ? { success: true, output: stdout }
          : {
              success: false,
              error: stderr || `Falha ao instalar ${spec} (código ${code})`,
            },
      );
    });
    child.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}
