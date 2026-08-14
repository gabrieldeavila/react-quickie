import { Injectable, OnModuleInit } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class LoggerService implements OnModuleInit {
  private readonly logFilePath = path.join(process.cwd(), 'ai-decisions.json');
  private readonly MAX_LOGS = 30;

  async onModuleInit() {
    try {
      // Verifica se o arquivo existe, se não, cria com um array vazio
      await fs.access(this.logFilePath);
    } catch {
      await fs.writeFile(this.logFilePath, JSON.stringify([], null, 2));
    }
  }

  logDecision(decision: string) {
    console.log(decision);
    return;
  }
}
