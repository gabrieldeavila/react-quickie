import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';

@Injectable()
export class ProjectService {
  constructor(private configService: ConfigService) {}

  createProject({
    projectName,
  }: {
    projectName: string;
  }): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      const targetDir = this.configService.get<string>('TARGET_DIR');
      const name = projectName || 'my-react-app';

      // O spawn separa o comando dos argumentos
      const child = spawn(
        'npx',
        [
          'create-next-app@latest',
          name,
          '--typescript',
          '--tailwind',
          '--eslint',
          '--yes',
        ],
        {
          cwd: targetDir,
          shell: true,
        },
      );

      let stdoutData = '';
      let stderrData = '';

      // Captura o fluxo de saída padrão
      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      // Captura o fluxo de erro
      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      // Resolve quando o processo finaliza
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdoutData });
        } else {
          resolve({
            success: false,
            error: stderrData || `Processo encerrado com código ${code}`,
          });
        }
      });

      // Tratamento caso o comando nem consiga iniciar
      child.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }
}
