import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { ProjectService } from 'src/common/helpers/project.service';
import { StorageService } from 'src/common/helpers/storage.service';
import z from 'zod';

@Injectable()
export class ChatService {
  constructor(
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
  ) {}

  getTools() {
    return {
      create_project: tool({
        description: 'Cria um novo projeto de react com tailwind next',
        inputSchema: z.object({
          name: z.string().describe('Nome do projeto'),
        }),
        execute: async ({ name }) => {
          const project = this.projectService.createProject({
            projectName: name,
          });

          return { success: true, message: project };
        },
      }),
      list_folders: tool({
        description: 'Lista os diretórios no caminho especificado',
        inputSchema: z.object({
          parentPath: z.string().describe('Caminho do diretório pai'),
        }),
        inputExamples: [
          {
            input: {
              parentPath: 'landing-pages',
            },
          },
          {
            input: {
              parentPath: 'landing-pages/components',
            },
          },
        ],
        execute: async ({ parentPath }) => {
          const files =
            await this.storageService.listFilesInDirectory(parentPath);
          return { success: true, files };
        },
      }),
      create_file: tool({
        description: 'Cria um novo arquivo',
        inputSchema: z.object({
          name: z.string().describe('Nome do arquivo'),
        }),
        execute: async ({ name }) => {
          return { success: true, message: `Arquivo criado: ${name}` };
        },
      }),
    };
  }
}
