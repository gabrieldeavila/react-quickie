import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

// Transforma o 'exec' em uma função que usa async/await
const execAsync = promisify(exec);

@Injectable()
export class StorageService {
  async createProject(projectName: string) {
    try {
      // O comando que você quer rodar
      const command = `npx create-next-app@latest ${projectName || 'my-react-app'} --typescript --tailwind --eslint`;

      const targetDir = '/Users/gabrielavila/code/react-quickie';

      // Executa o comando
      const { stdout, stderr } = await execAsync(command, {
        cwd: targetDir,
      });

      return { success: true, output: stdout };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
