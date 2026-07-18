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

  async logDecision(decision: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      decision,
    };

    console.log("Loggin decision");

    // Lê o arquivo atual, faz o parse, adiciona o novo log e salva
    const data = await fs.readFile(this.logFilePath, 'utf-8');
    const logs = JSON.parse(data);
    logs.push(logEntry);

    if (logs.length > this.MAX_LOGS) {
      logs.shift();
    }

    await fs.writeFile(this.logFilePath, JSON.stringify(logs, null, 2));
  }

  async getLogs() {
    const data = await fs.readFile(this.logFilePath, 'utf-8');
    return JSON.parse(data);
  }
}
