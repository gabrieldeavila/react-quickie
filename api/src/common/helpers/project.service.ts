import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { LoggerService } from './logger.service';

@Injectable()
export class ProjectService {
  constructor(
    private configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  createProject({
    projectName,
  }: {
    projectName: string;
  }): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      const targetDir = this.configService.get<string>('TARGET_DIR');
      const name = projectName || 'my-react-app';

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

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.loggerService.logDecision(`Created project ${projectName}`);
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

  getProjectsCreatedInDirectory(): Promise<string[]> {
    const targetDir = this.configService.get<string>('TARGET_DIR')!;
    return new Promise((resolve, reject) => {
      const child = spawn('ls', ['-1'], {
        cwd: targetDir,
        shell: true,
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          const projects = stdoutData
            .split('\n')
            .filter((line) => line.trim() !== '');
          resolve(projects);
        } else {
          reject(stderrData || `Processo encerrado com código ${code}`);
        }
      });

      // Tratamento caso o comando nem consiga iniciar
      child.on('error', (err) => {
        reject(err.message);
      });
    });
  }

  async installDependency(
    projectName: string,
    dependency: string,
    isDev = false,
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return new Promise((resolve) => {
      const targetDir = this.configService.get<string>('TARGET_DIR');
      const projectPath = `${targetDir}/${projectName}`;

      // Argumentos: i, nome do pacote, e -D se for dev
      const args = ['i', dependency];
      if (isDev) {
        args.push('-D');
      }

      const child = spawn('pnpm', args, {
        cwd: projectPath,
        shell: true,
      });

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data) => (stdoutData += data.toString()));
      child.stderr.on('data', (data) => (stderrData += data.toString()));

      child.on('close', (code) => {
        if (code === 0) {
          this.loggerService.logDecision(
            `Instalada dependência ${dependency} em ${projectName}`,
          );
          resolve({ success: true, output: stdoutData });
        } else {
          resolve({
            success: false,
            error:
              stderrData || `Falha ao instalar ${dependency} (código ${code})`,
          });
        }
      });

      child.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }
}
